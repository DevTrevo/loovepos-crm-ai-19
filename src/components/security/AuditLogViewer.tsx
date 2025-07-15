
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Eye, Shield, AlertTriangle, Activity } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface AuditLog {
  id: string;
  action: string;
  table_name: string;
  record_id: string;
  user_id: string;
  company_id: string;
  old_values: any;
  new_values: any;
  ip_address: string;
  created_at: string;
}

export const AuditLogViewer = () => {
  const { data: auditLogs, isLoading } = useQuery({
    queryKey: ['audit-logs'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('audit_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(100);
      
      if (error) throw error;
      return data as AuditLog[];
    },
  });

  const getActionIcon = (action: string) => {
    switch (action) {
      case 'INSERT':
        return <Shield className="w-4 h-4 text-green-500" />;
      case 'UPDATE':
        return <Eye className="w-4 h-4 text-blue-500" />;
      case 'DELETE':
        return <AlertTriangle className="w-4 h-4 text-red-500" />;
      default:
        return <Activity className="w-4 h-4 text-gray-500" />;
    }
  };

  const getActionBadge = (action: string) => {
    const variants = {
      INSERT: 'default',
      UPDATE: 'secondary',
      DELETE: 'destructive',
    } as const;
    
    return (
      <Badge variant={variants[action as keyof typeof variants] || 'outline'}>
        {action}
      </Badge>
    );
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5" />
            Logs de Auditoria
          </CardTitle>
          <CardDescription>Carregando logs de auditoria...</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="w-5 h-5" />
          Logs de Auditoria
        </CardTitle>
        <CardDescription>
          Monitore todas as ações realizadas no sistema para garantir segurança e conformidade
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[400px]">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Ação</TableHead>
                <TableHead>Tabela</TableHead>
                <TableHead>Data/Hora</TableHead>
                <TableHead>IP</TableHead>
                <TableHead>Usuário</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {auditLogs?.map((log) => (
                <TableRow key={log.id}>
                  <TableCell className="flex items-center gap-2">
                    {getActionIcon(log.action)}
                    {getActionBadge(log.action)}
                  </TableCell>
                  <TableCell className="font-medium">{log.table_name}</TableCell>
                  <TableCell>
                    {format(new Date(log.created_at), 'dd/MM/yyyy HH:mm:ss', { locale: ptBR })}
                  </TableCell>
                  <TableCell className="font-mono text-sm">{log.ip_address}</TableCell>
                  <TableCell>{log.user_id}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </ScrollArea>
      </CardContent>
    </Card>
  );
};
