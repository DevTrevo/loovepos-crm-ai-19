import React, { createContext, useContext, useEffect, useState } from 'react';
import { User } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

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
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [company, setCompany] = useState<Company | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  console.log('AuthProvider state:', { user: !!user, profile: !!profile, company: !!company, loading });

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
        console.error('Error loading profile:', profileError);
        throw profileError;
      }

      console.log('Profile loaded:', profileData);
      setProfile(profileData);

      // Carregar dados da empresa através da tabela company_users
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

      if (companyUserError) {
        console.error('Error loading company user data:', companyUserError);
        
        // Se não encontrar na tabela company_users, tentar através do profile
        if (profileData?.company_id) {
          console.log('Trying to load company via profile company_id:', profileData.company_id);
          
          const { data: companyData, error: companyError } = await supabase
            .from('companies')
            .select('*')
            .eq('id', profileData.company_id)
            .single();

          if (companyError) {
            console.error('Error loading company via profile:', companyError);
            throw new Error('Não foi possível carregar os dados da empresa');
          }

          console.log('Company loaded via profile:', companyData);
          setCompany(companyData);
        } else {
          throw new Error('Usuário não está associado a nenhuma empresa');
        }
      } else {
        console.log('Company user data loaded:', companyUserData);
        setCompany(companyUserData.companies);
      }

    } catch (error) {
      console.error('Error in loadUserData:', error);
      toast({
        title: "Erro de autenticação",
        description: "Erro ao carregar dados do usuário. Tente fazer login novamente.",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    // Verificar usuário atual
    const checkUser = async () => {
      try {
        const { data: { user: currentUser }, error } = await supabase.auth.getUser();
        
        if (error) {
          console.error('Error getting current user:', error);
          setLoading(false);
          return;
        }

        console.log('Current user:', currentUser);
        setUser(currentUser);

        if (currentUser) {
          await loadUserData(currentUser);
        }
      } catch (error) {
        console.error('Error in checkUser:', error);
      } finally {
        setLoading(false);
      }
    };

    checkUser();

    // Listener para mudanças de autenticação
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('Auth state changed:', event, session?.user);
      
      if (event === 'SIGNED_IN' && session?.user) {
        setUser(session.user);
        await loadUserData(session.user);
      } else if (event === 'SIGNED_OUT') {
        setUser(null);
        setProfile(null);
        setCompany(null);
      }
      
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      
      setUser(null);
      setProfile(null);
      setCompany(null);
      
      toast({
        title: "Logout realizado",
        description: "Você foi desconectado com sucesso.",
      });
    } catch (error) {
      console.error('Error signing out:', error);
      toast({
        title: "Erro",
        description: "Erro ao fazer logout.",
        variant: "destructive",
      });
    }
  };

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
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
