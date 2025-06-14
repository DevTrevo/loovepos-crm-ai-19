
import { useState, useEffect, createContext, useContext } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

interface Profile {
  id: string;
  full_name?: string;
  phone?: string;
  position?: string;
  role?: string;
  permissions?: any;
  last_login?: string;
  is_active?: boolean;
  company_id?: string;
  created_at: string;
  updated_at: string;
}

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
  status?: string;
  created_at: string;
  updated_at: string;
}

interface CompanyUser {
  id: string;
  company_id: string;
  user_id: string;
  role: 'owner' | 'admin' | 'manager' | 'employee';
  permissions?: any;
  status: 'active' | 'inactive' | 'pending';
  joined_at?: string;
}

interface AuthContextType {
  user: User | null;
  session: Session | null;
  profile: Profile | null;
  company: Company | null;
  companyUser: CompanyUser | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signUp: (email: string, password: string, fullName?: string, companyName?: string) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
  hasPermission: (permission: string) => boolean;
  isRole: (role: string) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [company, setCompany] = useState<Company | null>(null);
  const [companyUser, setCompanyUser] = useState<CompanyUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user) {
          await loadUserData(session.user.id);
        } else {
          setProfile(null);
          setCompany(null);
          setCompanyUser(null);
        }
        setLoading(false);
      }
    );

    // Check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        loadUserData(session.user.id);
      } else {
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const loadUserData = async (userId: string) => {
    try {
      // Load profile
      const { data: profileData } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (profileData) {
        setProfile(profileData);

        // Load company user relationship
        const { data: companyUserData } = await supabase
          .from('company_users')
          .select('*')
          .eq('user_id', userId)
          .eq('status', 'active')
          .single();

        if (companyUserData) {
          // Cast the role to the proper type
          const typedCompanyUser: CompanyUser = {
            ...companyUserData,
            role: companyUserData.role as 'owner' | 'admin' | 'manager' | 'employee',
            status: companyUserData.status as 'active' | 'inactive' | 'pending'
          };
          setCompanyUser(typedCompanyUser);

          // Load company data
          const { data: companyData } = await supabase
            .from('companies')
            .select('*')
            .eq('id', companyUserData.company_id)
            .single();

          if (companyData) {
            setCompany(companyData);
          }
        }

        // Update last login
        await supabase
          .from('profiles')
          .update({ last_login: new Date().toISOString() })
          .eq('id', userId);
      }
    } catch (error) {
      console.error('Error loading user data:', error);
    }
  };

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    return { error };
  };

  const signUp = async (email: string, password: string, fullName?: string, companyName?: string) => {
    const redirectUrl = `${window.location.origin}/`;
    
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: redirectUrl,
        data: {
          full_name: fullName || '',
          company_name: companyName || '',
        }
      }
    });

    // If signup is successful and user is confirmed, create company and profile
    if (!error && data.user && !data.session) {
      try {
        // Create company first
        if (companyName) {
          const { data: companyData, error: companyError } = await supabase
            .from('companies')
            .insert([{ name: companyName }])
            .select()
            .single();

          if (!companyError && companyData) {
            // Create profile
            await supabase
              .from('profiles')
              .insert([{
                id: data.user.id,
                full_name: fullName,
                company_id: companyData.id,
                role: 'owner'
              }]);

            // Create company user relationship
            await supabase
              .from('company_users')
              .insert([{
                company_id: companyData.id,
                user_id: data.user.id,
                role: 'owner',
                status: 'active',
                joined_at: new Date().toISOString()
              }]);
          }
        }
      } catch (setupError) {
        console.error('Error setting up user data:', setupError);
      }
    }

    return { error };
  };

  const signOut = async () => {
    try {
      await supabase.auth.signOut();
      setProfile(null);
      setCompany(null);
      setCompanyUser(null);
      window.location.href = '/auth';
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const hasPermission = (permission: string): boolean => {
    if (!companyUser) return false;
    
    // Owners and admins have all permissions
    if (['owner', 'admin'].includes(companyUser.role)) {
      return true;
    }

    // Check specific permissions
    return companyUser.permissions?.[permission] === true;
  };

  const isRole = (role: string): boolean => {
    return companyUser?.role === role;
  };

  return (
    <AuthContext.Provider value={{
      user,
      session,
      profile,
      company,
      companyUser,
      loading,
      signIn,
      signUp,
      signOut,
      hasPermission,
      isRole,
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
