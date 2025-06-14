
import { User, Session } from '@supabase/supabase-js';

export interface Profile {
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

export interface Company {
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

export interface CompanyUser {
  id: string;
  company_id: string;
  user_id: string;
  role: 'owner' | 'admin' | 'manager' | 'employee';
  permissions?: any;
  status: 'active' | 'inactive' | 'pending';
  joined_at?: string;
}

export interface AuthContextType {
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
