
import React, { createContext, useContext, useEffect, useState } from 'react';
import { User } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { cleanupAuthState } from "@/utils/cleanupAuthState";

interface Company {
  id: string;
  name: string;
  cnpj?: string;
  email?: string;
  phone?: string;
  address?: string;
  city?: string;
  state?: string;
  zip_code?: string;
  logo_url?: string;
  subscription_plan?: string;
  status: string;
  created_at: string;
  updated_at: string;
}

interface Profile {
  id: string;
  full_name?: string;
  role?: string;
  phone?: string;
  position?: string;
  company_id?: string;
  is_active?: boolean;
  permissions?: any;
  created_at: string;
  updated_at: string;
}

export interface AuthContextType {
  user: User | null;
  profile: Profile | null;
  company: Company | null;
  loading: boolean;
  signOut: () => Promise<void>;
  hasPermission: (permission: string) => boolean;
  companyError?: string | null;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [company, setCompany] = useState<Company | null>(null);
  const [loading, setLoading] = useState(true);
  const [companyError, setCompanyError] = useState<string | null>(null);
  const { toast } = useToast();

  console.log('AuthProvider state:', { user: !!user, profile: !!profile, company: !!company, loading });

  // Ref: https://docs.lovable.dev/tips-tricks/auth-limbo
  const robustSignOut = async () => {
    try {
      cleanupAuthState();
      try {
        await supabase.auth.signOut({ scope: 'global' });
      } catch (err) {}
      setUser(null);
      setProfile(null);
      setCompany(null);
      toast({
        title: "Logout realizado",
        description: "Você foi desconectado com sucesso.",
      });
      // Recarrega a página para forçar contexto limpo
      window.location.href = "/auth";
    } catch (error) {
      console.error('Erro ao fazer logout:', error);
      toast({
        title: "Erro",
        description: "Erro ao fazer logout.",
        variant: "destructive",
      });
    }
  };

  const signOut = robustSignOut;

  const loadUserData = async (currentUser: User) => {
    try {
      console.log('Loading user data for:', currentUser.id);

      // Carregar perfil do usuário
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', currentUser.id)
        .single();

      if (profileError) {
        setCompanyError('Erro ao carregar perfil do usuário.');
        throw profileError;
      }

      setProfile(profileData);

      // Primeiro verificar pelo company_id no profile
      if (profileData?.company_id) {
        const { data: companyData, error: companyError } = await supabase
          .from('companies')
          .select('*')
          .eq('id', profileData.company_id)
          .single();

        if (!companyError && companyData) {
          setCompany(companyData);
          setCompanyError(null);
          return; // Sucesso, sair da função
        }
      }

      // Se não conseguir pelo profile, buscar vínculo na company_users
      const { data: companyUserData, error: companyUserError } = await supabase
        .from('company_users')
        .select(`
          company_id,
          role,
          status,
          companies (*)
        `)
        .eq('user_id', currentUser.id)
        .eq('status', 'active')
        .single();

      if (!companyUserError && companyUserData?.companies) {
        setCompany(companyUserData.companies);
        setCompanyError(null);
      } else {
        setCompany(null);
        setCompanyError('Usuário não está vinculado a nenhuma empresa ativa. Solicite ao administrador para adicionar você a uma empresa.');
      }

    } catch (error: any) {
      setCompany(null);
      if (!companyError) setCompanyError('Erro ao carregar dados de empresa. Faça logout e login novamente ou solicite suporte administrativo.');
      toast({
        title: "Erro de autenticação",
        description: "Erro ao carregar dados do usuário. Tente fazer login novamente.",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    // Verificar usuário atual ao iniciar
    const checkUser = async () => {
      try {
        const { data: { user: currentUser }, error } = await supabase.auth.getUser();
        if (error) {
          setLoading(false);
          return;
        }
        setUser(currentUser);
        if (currentUser) await loadUserData(currentUser);
      } catch (error) {
        console.error('Erro no checkUser:', error);
      } finally {
        setLoading(false);
      }
    };
    checkUser();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' && session?.user) {
        setTimeout(async () => {
          setUser(session.user);
          await loadUserData(session.user);
        }, 0);
      } else if (event === 'SIGNED_OUT') {
        setUser(null);
        setProfile(null);
        setCompany(null);
        setCompanyError(null);
        cleanupAuthState();
        window.location.href = "/auth";
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const hasPermission = (permission: string): boolean => {
    // For now, return true for basic permissions if user has a profile
    // This is a simplified implementation - you may want to enhance this
    // based on your actual permission system
    if (!profile) return false;
    
    // Check if user has admin role or the specific permission
    if (profile.role === 'admin' || profile.role === 'owner') return true;
    
    // Check specific permissions if they exist
    if (profile.permissions && profile.permissions[permission]) {
      return profile.permissions[permission] === true;
    }
    
    // Default permissions for common actions
    const defaultPermissions = ['manage_products', 'view_products', 'manage_categories'];
    return defaultPermissions.includes(permission);
  };

  const value = {
    user,
    profile,
    company,
    loading,
    signOut,
    hasPermission,
    companyError,
  };

  return (
    <AuthContext.Provider value={value}>
      {companyError ? (
        <div className="fixed top-20 left-1/2 z-50 -translate-x-1/2 bg-red-100 text-red-800 px-6 py-4 rounded shadow font-semibold border border-red-300">
          {companyError}
        </div>
      ) : null}
      {children}
    </AuthContext.Provider>
  );
};
