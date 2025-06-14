
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
