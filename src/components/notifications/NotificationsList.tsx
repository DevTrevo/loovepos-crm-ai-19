
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import { AlertCircle, CheckCircle, Info, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { useNotifications, useMarkNotificationAsRead } from "@/hooks/useNotifications";
import { Notification } from "@/types/notifications";

interface NotificationsListProps {
  onClose: () => void;
}

const getNotificationIcon = (type: Notification['type']) => {
  switch (type) {
    case 'success':
      return <CheckCircle className="h-4 w-4 text-green-500" />;
    case 'warning':
      return <AlertTriangle className="h-4 w-4 text-orange-500" />;
    case 'error':
      return <AlertCircle className="h-4 w-4 text-red-500" />;
    default:
      return <Info className="h-4 w-4 text-blue-500" />;
  }
};

export const NotificationsList = ({ onClose }: NotificationsListProps) => {
  const { data: notifications, isLoading } = useNotifications();
  const markAsReadMutation = useMarkNotificationAsRead();

  const handleMarkAsRead = (notificationId: string) => {
    markAsReadMutation.mutate(notificationId);
  };

  if (isLoading) {
    return (
      <div className="p-4 text-center text-sm text-gray-500">
        Carregando notificações...
      </div>
    );
  }

  if (!notifications || notifications.length === 0) {
    return (
      <div className="p-4 text-center text-sm text-gray-500">
        Nenhuma notificação encontrada
      </div>
    );
  }

  return (
    <div className="w-full">
      <div className="p-3 border-b">
        <h3 className="font-semibold text-sm">Notificações</h3>
      </div>
      <ScrollArea className="h-96">
        <div className="p-2 space-y-1">
          {notifications.map((notification, index) => (
            <div key={notification.id}>
              <div
                className={`p-3 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors ${
                  !notification.read ? 'bg-blue-50 border-l-2 border-l-blue-500' : ''
                }`}
                onClick={() => !notification.read && handleMarkAsRead(notification.id)}
              >
                <div className="flex items-start gap-3">
                  {getNotificationIcon(notification.type)}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between">
                      <h4 className="text-sm font-medium text-gray-900 truncate">
                        {notification.title}
                      </h4>
                      {!notification.read && (
                        <div className="h-2 w-2 bg-blue-500 rounded-full ml-2 mt-1 flex-shrink-0" />
                      )}
                    </div>
                    <p className="text-xs text-gray-600 mt-1 line-clamp-2">
                      {notification.message}
                    </p>
                    <p className="text-xs text-gray-400 mt-2">
                      {formatDistanceToNow(new Date(notification.created_at), {
                        addSuffix: true,
                        locale: ptBR,
                      })}
                    </p>
                  </div>
                </div>
              </div>
              {index < notifications.length - 1 && <Separator className="my-1" />}
            </div>
          ))}
        </div>
      </ScrollArea>
      <div className="p-3 border-t">
        <Button variant="ghost" size="sm" className="w-full" onClick={onClose}>
          Fechar
        </Button>
      </div>
    </div>
  );
};
