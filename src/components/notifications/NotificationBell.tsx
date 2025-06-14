
import { useState } from "react";
import { Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useUnreadNotifications, useRealtimeNotifications } from "@/hooks/useNotifications";
import { NotificationsList } from "./NotificationsList";

export const NotificationBell = () => {
  const [open, setOpen] = useState(false);
  const { data: unreadNotifications } = useUnreadNotifications();
  
  // Enable realtime updates
  useRealtimeNotifications();

  const unreadCount = unreadNotifications?.length || 0;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="sm" className="relative">
          <Bell className="h-4 w-4" />
          {unreadCount > 0 && (
            <Badge 
              variant="destructive" 
              className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center text-xs p-0"
            >
              {unreadCount > 99 ? '99+' : unreadCount}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0" align="end">
        <NotificationsList onClose={() => setOpen(false)} />
      </PopoverContent>
    </Popover>
  );
};
