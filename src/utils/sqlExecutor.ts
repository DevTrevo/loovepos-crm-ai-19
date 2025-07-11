
import { supabase } from '@/integrations/supabase/client';

export const executeSql = async (query: string, params: any[] = []) => {
  try {
    // Try to execute raw SQL - this might work depending on Supabase configuration
    const { data, error } = await supabase.rpc('exec_sql', {
      query,
      params
    });
    
    if (error) throw error;
    return { data, error: null };
  } catch (err) {
    return { data: null, error: err };
  }
};
