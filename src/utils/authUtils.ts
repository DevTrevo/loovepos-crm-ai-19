
import { supabase } from '@/integrations/supabase/client';
import { Profile, Company, CompanyUser } from '@/types/auth';

export const loadUserData = async (userId: string) => {
  try {
    // Load profile
    const { data: profileData } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (!profileData) {
      return { profile: null, company: null, companyUser: null };
    }

    // Load company user relationship
    const { data: companyUserData } = await supabase
      .from('company_users')
      .select('*')
      .eq('user_id', userId)
      .eq('status', 'active')
      .single();

    let company: Company | null = null;
    let companyUser: CompanyUser | null = null;

    if (companyUserData) {
      // Cast the role to the proper type
      companyUser = {
        ...companyUserData,
        role: companyUserData.role as 'owner' | 'admin' | 'manager' | 'employee',
        status: companyUserData.status as 'active' | 'inactive' | 'pending'
      };

      // Load company data
      const { data: companyData } = await supabase
        .from('companies')
        .select('*')
        .eq('id', companyUserData.company_id)
        .single();

      if (companyData) {
        company = companyData;
      }
    }

    // Update last login
    await supabase
      .from('profiles')
      .update({ last_login: new Date().toISOString() })
      .eq('id', userId);

    return { profile: profileData, company, companyUser };
  } catch (error) {
    console.error('Error loading user data:', error);
    return { profile: null, company: null, companyUser: null };
  }
};

export const signUpUser = async (
  email: string, 
  password: string, 
  fullName?: string, 
  companyName?: string
) => {
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

export const signInUser = async (email: string, password: string) => {
  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });
  return { error };
};

export const signOutUser = async () => {
  try {
    await supabase.auth.signOut();
    window.location.href = '/auth';
  } catch (error) {
    console.error('Error signing out:', error);
  }
};

export const checkPermission = (companyUser: CompanyUser | null, permission: string): boolean => {
  if (!companyUser) return false;
  
  // Owners and admins have all permissions
  if (['owner', 'admin'].includes(companyUser.role)) {
    return true;
  }

  // Check specific permissions
  return companyUser.permissions?.[permission] === true;
};

export const checkRole = (companyUser: CompanyUser | null, role: string): boolean => {
  return companyUser?.role === role;
};
