
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { useEffect } from 'react';

export interface Notification {
  id: string;
  company_id: string;
  user_id?: string;
  title: string;
  message: string;
  type: 'info' | 'warning' | 'error' | 'success';
  read: boolean;
  action_url?: string;
  created_at: string;
  expires_at?: string;
}

export const useNotifications = () => {
  const { company } = useAuth();

  return useQuery({
    queryKey: ['notifications', company?.id],
    queryFn: async () => {
      if (!company?.id) {
        console.log('No company ID available for notifications query');
        return [];
      }

      console.log('Fetching notifications for company:', company.id);
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error('Error fetching notifications:', error);
        throw error;
      }
      
      console.log('Notifications fetched:', data?.length || 0);
      return data as Notification[];
    },
    enabled: !!company?.id,
  });
};

export const useUnreadNotifications = () => {
  const { company } = useAuth();

  return useQuery({
    queryKey: ['notifications', 'unread', company?.id],
    queryFn: async () => {
      if (!company?.id) {
        console.log('No company ID available for unread notifications query');
        return [];
      }

      console.log('Fetching unread notifications for company:', company.id);
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('read', false)
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error('Error fetching unread notifications:', error);
        throw error;
      }
      
      console.log('Unread notifications fetched:', data?.length || 0);
      return data as Notification[];
    },
    enabled: !!company?.id,
  });
};

export const useMarkNotificationAsRead = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (notificationId: string) => {
      const { error } = await supabase
        .from('notifications')
        .update({ read: true })
        .eq('id', notificationId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
    onError: (error) => {
      console.error('Error marking notification as read:', error);
      toast({
        title: "Erro",
        description: "Erro ao marcar notificação como lida: " + error.message,
        variant: "destructive",
      });
    },
  });
};

export const useRealtimeNotifications = () => {
  const { company } = useAuth();
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!company?.id) return;

    console.log('Setting up realtime notifications for company:', company.id);
    
    const channel = supabase
      .channel('notifications-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'notifications',
          filter: `company_id=eq.${company.id}`,
        },
        (payload) => {
          console.log('Notification change received:', payload);
          queryClient.invalidateQueries({ queryKey: ['notifications'] });
        }
      )
      .subscribe();

    return () => {
      console.log('Cleaning up realtime notifications');
      supabase.removeChannel(channel);
    };
  }, [company?.id, queryClient]);
};
