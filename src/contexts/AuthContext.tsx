
import { createContext } from 'react';
import { User } from '@supabase/supabase-js';

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
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);
