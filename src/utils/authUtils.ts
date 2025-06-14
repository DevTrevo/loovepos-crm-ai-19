
import { supabase } from '@/integrations/supabase/client';
import { Profile, Company, CompanyUser } from '@/types/auth';

export const loadUserData = async (userId: string) => {
  console.log('Loading user data for userId:', userId);
  
  // Buscar perfil do usuário
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();

  if (profileError) {
    console.error('Error loading profile:', profileError);
    throw profileError;
  }

  console.log('Profile loaded:', profile);

  // Buscar associação da empresa
  const { data: companyUser, error: companyUserError } = await supabase
    .from('company_users')
    .select('*')
    .eq('user_id', userId)
    .eq('status', 'active')
    .single();

  if (companyUserError) {
    console.error('Error loading company user:', companyUserError);
    throw companyUserError;
  }

  console.log('Company user loaded:', companyUser);

  // Buscar dados da empresa
  const { data: company, error: companyError } = await supabase
    .from('companies')
    .select('*')
    .eq('id', companyUser.company_id)
    .single();

  if (companyError) {
    console.error('Error loading company:', companyError);
    throw companyError;
  }

  console.log('Company loaded:', company);

  return {
    profile: profile as Profile,
    company: company as Company,
    companyUser: companyUser as CompanyUser,
  };
};

export const signUpUser = async (
  email: string, 
  password: string, 
  fullName?: string, 
  companyName?: string
) => {
  console.log('Starting signup process for:', email);
  
  try {
    // 1. Criar usuário
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName || '',
        },
        emailRedirectTo: `${window.location.origin}/`,
      },
    });

    if (authError) {
      console.error('Auth signup error:', authError);
      return { error: authError };
    }

    if (!authData.user) {
      console.error('No user returned from signup');
      return { error: new Error('Falha ao criar usuário') };
    }

    console.log('User created:', authData.user.id);

    // 2. Criar empresa se fornecida
    let company = null;
    if (companyName) {
      console.log('Creating company:', companyName);
      const { data: companyData, error: companyError } = await supabase
        .from('companies')
        .insert([{
          name: companyName,
          status: 'active',
        }])
        .select()
        .single();

      if (companyError) {
        console.error('Company creation error:', companyError);
        return { error: companyError };
      }

      company = companyData;
      console.log('Company created:', company.id);
    }

    // 3. Atualizar perfil do usuário
    console.log('Updating user profile');
    const { error: profileError } = await supabase
      .from('profiles')
      .update({
        full_name: fullName || '',
        company_id: company?.id || null,
      })
      .eq('id', authData.user.id);

    if (profileError) {
      console.error('Profile update error:', profileError);
      return { error: profileError };
    }

    // 4. Criar associação empresa-usuário se empresa foi criada
    if (company) {
      console.log('Creating company-user association');
      const { error: companyUserError } = await supabase
        .from('company_users')
        .insert([{
          company_id: company.id,
          user_id: authData.user.id,
          role: 'owner',
          status: 'active',
          joined_at: new Date().toISOString(),
        }]);

      if (companyUserError) {
        console.error('Company user creation error:', companyUserError);
        return { error: companyUserError };
      }
    }

    console.log('Signup process completed successfully');
    return { error: null };

  } catch (error) {
    console.error('Unexpected signup error:', error);
    return { error: error as Error };
  }
};

export const signInUser = async (email: string, password: string) => {
  console.log('Signing in user:', email);
  
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    console.error('Sign in error:', error);
  } else {
    console.log('Sign in successful for user:', data.user?.id);
  }

  return { error };
};

export const signOutUser = async () => {
  console.log('Signing out user');
  const { error } = await supabase.auth.signOut();
  
  if (error) {
    console.error('Sign out error:', error);
  } else {
    console.log('Sign out successful');
  }
  
  return { error };
};

export const checkPermission = (companyUser: CompanyUser | null, permission: string): boolean => {
  if (!companyUser) return false;
  
  // Owners e admins têm todas as permissões
  if (companyUser.role === 'owner' || companyUser.role === 'admin') {
    return true;
  }
  
  // Verificar permissões específicas
  return companyUser.permissions?.[permission] === true;
};

export const checkRole = (companyUser: CompanyUser | null, role: string): boolean => {
  if (!companyUser) return false;
  return companyUser.role === role;
};
