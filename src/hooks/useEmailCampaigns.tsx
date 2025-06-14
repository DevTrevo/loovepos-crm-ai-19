
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';

export interface EmailCampaign {
  id: string;
  name: string;
  subject: string;
  content: string;
  status: 'draft' | 'sent' | 'scheduled';
  sent_count?: number;
  opened_count?: number;
  clicked_count?: number;
  scheduled_at?: string;
  company_id?: string;
  created_at: string;
  updated_at: string;
}

export const useEmailCampaigns = () => {
  const { company } = useAuth();

  return useQuery({
    queryKey: ['email-campaigns', company?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('email_campaigns')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as EmailCampaign[];
    },
    enabled: !!company?.id,
  });
};

export const useCreateEmailCampaign = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { company } = useAuth();

  return useMutation({
    mutationFn: async (campaign: Omit<EmailCampaign, 'id' | 'created_at' | 'updated_at' | 'company_id'>) => {
      if (!company?.id) {
        throw new Error('Empresa não encontrada');
      }

      const { data, error } = await supabase
        .from('email_campaigns')
        .insert([{ ...campaign, company_id: company.id }])
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['email-campaigns'] });
      toast({
        title: "Campanha criada",
        description: "Campanha de email criada com sucesso!",
      });
    },
    onError: (error) => {
      toast({
        title: "Erro",
        description: "Erro ao criar campanha: " + error.message,
        variant: "destructive",
      });
    },
  });
};
