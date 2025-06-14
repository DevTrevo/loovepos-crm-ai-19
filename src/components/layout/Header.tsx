
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
import { NotificationBell } from "@/components/notifications/NotificationBell";
import { useAuth } from "@/hooks/useAuth";

export const Header = () => {
  const { user, profile, company } = useAuth();

  return (
    <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12">
      <div className="flex items-center gap-2 px-4 w-full">
        <SidebarTrigger className="-ml-1" />
        <Separator orientation="vertical" className="mr-2 h-4" />
        
        <div className="flex-1">
          <h1 className="text-lg font-semibold">
            {company?.name || 'LoovePOS'}
          </h1>
        </div>

        <div className="flex items-center gap-2">
          <NotificationBell />
          
          <div className="text-sm">
            <div className="font-medium">{profile?.full_name || user?.email}</div>
            <div className="text-xs text-gray-500">{profile?.position || 'Usuário'}</div>
          </div>
        </div>
      </div>
    </header>
  );
};
