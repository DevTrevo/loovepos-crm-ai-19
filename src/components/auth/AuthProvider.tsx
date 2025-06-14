
import { useState, useEffect } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { AuthContext } from '@/contexts/AuthContext';
import { Profile, Company, CompanyUser } from '@/types/auth';
import { 
  loadUserData, 
  signUpUser, 
  signInUser, 
  signOutUser, 
  checkPermission, 
  checkRole 
} from '@/utils/authUtils';

interface AuthProviderProps {
  children: React.ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
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
          const userData = await loadUserData(session.user.id);
          setProfile(userData.profile);
          setCompany(userData.company);
          setCompanyUser(userData.companyUser);
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
        loadUserData(session.user.id).then((userData) => {
          setProfile(userData.profile);
          setCompany(userData.company);
          setCompanyUser(userData.companyUser);
          setLoading(false);
        });
      } else {
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const signIn = async (email: string, password: string) => {
    return await signInUser(email, password);
  };

  const signUp = async (email: string, password: string, fullName?: string, companyName?: string) => {
    return await signUpUser(email, password, fullName, companyName);
  };

  const signOut = async () => {
    setProfile(null);
    setCompany(null);
    setCompanyUser(null);
    await signOutUser();
  };

  const hasPermission = (permission: string): boolean => {
    return checkPermission(companyUser, permission);
  };

  const isRole = (role: string): boolean => {
    return checkRole(companyUser, role);
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
