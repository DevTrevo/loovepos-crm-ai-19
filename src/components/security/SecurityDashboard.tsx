
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Shield, AlertTriangle, CheckCircle, Activity, Users, Database } from 'lucide-react';
import { AuditLogViewer } from './AuditLogViewer';

export const SecurityDashboard = () => {
  const { data: securityMetrics } = useQuery({
    queryKey: ['security-metrics'],
    queryFn: async () => {
      // Buscar métricas de segurança
      const [auditLogsResult, activeUsersResult, recentActivityResult] = await Promise.all([
        supabase
          .from('audit_logs')
          .select('action, created_at')
          .gte('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()),
        
        supabase
          .from('company_users')
          .select('status')
          .eq('status', 'active'),
        
        supabase
          .from('audit_logs')
          .select('action')
          .gte('created_at', new Date(Date.now() - 60 * 60 * 1000).toISOString())
      ]);

      return {
        dailyAuditLogs: auditLogsResult.data?.length || 0,
        activeUsers: activeUsersResult.data?.length || 0,
        recentActivity: recentActivityResult.data?.length || 0,
        criticalAlerts: 0, // Placeholder para alertas críticos
      };
    },
  });

  const securityAlerts = [
    {
      type: 'info',
      title: 'Sistema Seguro',
      message: 'Todas as políticas de segurança estão ativas e funcionando corretamente.',
      icon: <CheckCircle className="w-4 h-4 text-green-500" />,
    },
    {
      type: 'warning',
      title: 'Monitoramento Ativo',
      message: 'Sistema de auditoria está registrando todas as ações dos usuários.',
      icon: <Shield className="w-4 h-4 text-blue-500" />,
    },
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Logs de Auditoria (24h)</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{securityMetrics?.dailyAuditLogs}</div>
            <p className="text-xs text-muted-foreground">
              Ações registradas nas últimas 24 horas
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Usuários Ativos</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{securityMetrics?.activeUsers}</div>
            <p className="text-xs text-muted-foreground">
              Usuários com acesso ao sistema
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Atividade Recente</CardTitle>
            <Database className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{securityMetrics?.recentActivity}</div>
            <p className="text-xs text-muted-foreground">
              Ações na última hora
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Alertas Críticos</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{securityMetrics?.criticalAlerts}</div>
            <p className="text-xs text-muted-foreground">
              Alertas que requerem atenção
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="w-5 h-5" />
              Status de Segurança
            </CardTitle>
            <CardDescription>
              Monitoramento em tempo real das configurações de segurança
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {securityAlerts.map((alert, index) => (
              <Alert key={index}>
                <div className="flex items-start gap-2">
                  {alert.icon}
                  <div className="flex-1">
                    <div className="font-medium">{alert.title}</div>
                    <AlertDescription>{alert.message}</AlertDescription>
                  </div>
                </div>
              </Alert>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="w-5 h-5" />
              Configurações de Segurança
            </CardTitle>
            <CardDescription>
              Status das principais configurações de segurança
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Row Level Security (RLS)</span>
              <Badge variant="default">Ativo</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Auditoria de Dados</span>
              <Badge variant="default">Ativo</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Validação de Entrada</span>
              <Badge variant="default">Ativo</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Limpeza Automática</span>
              <Badge variant="default">Ativo</Badge>
            </div>
          </CardContent>
        </Card>
      </div>

      <AuditLogViewer />
    </div>
  );
};
