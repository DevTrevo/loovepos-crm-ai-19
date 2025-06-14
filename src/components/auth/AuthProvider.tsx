
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

  // Function to load user data safely
  const handleUserDataLoad = async (userId: string) => {
    try {
      console.log('Loading user data for:', userId);
      const userData = await loadUserData(userId);
      setProfile(userData.profile);
      setCompany(userData.company);
      setCompanyUser(userData.companyUser);
      console.log('User data loaded successfully:', userData);
    } catch (error) {
      console.error('Error loading user data:', error);
      // Reset states on error
      setProfile(null);
      setCompany(null);
      setCompanyUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    console.log('Setting up auth state listener...');
    
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state changed:', event, session?.user?.id);
        
        // Update session and user synchronously
        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user) {
          // Defer user data loading to prevent deadlocks
          setTimeout(() => {
            handleUserDataLoad(session.user.id);
          }, 0);
        } else {
          // Clear states immediately when no session
          setProfile(null);
          setCompany(null);
          setCompanyUser(null);
          setLoading(false);
        }
      }
    );

    // THEN check for existing session
    const initializeAuth = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        if (error) {
          console.error('Error getting session:', error);
          setLoading(false);
          return;
        }

        console.log('Initial session check:', session?.user?.id);
        setSession(session);
        setUser(session?.user ?? null);

        if (session?.user) {
          await handleUserDataLoad(session.user.id);
        } else {
          setLoading(false);
        }
      } catch (error) {
        console.error('Error initializing auth:', error);
        setLoading(false);
      }
    };

    initializeAuth();

    return () => {
      console.log('Cleaning up auth subscription');
      subscription.unsubscribe();
    };
  }, []);

  const signIn = async (email: string, password: string) => {
    console.log('Signing in user:', email);
    return await signInUser(email, password);
  };

  const signUp = async (email: string, password: string, fullName?: string, companyName?: string) => {
    console.log('Signing up user:', email);
    return await signUpUser(email, password, fullName, companyName);
  };

  const signOut = async () => {
    console.log('Signing out user');
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

  console.log('Auth Provider State:', { 
    loading, 
    user: user?.id, 
    profile: profile?.id, 
    company: company?.id 
  });

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
