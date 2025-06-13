
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter,
} from "@/components/ui/sidebar";
import { 
  LayoutDashboard, 
  ShoppingCart, 
  Users, 
  Mail, 
  Phone, 
  Package,
  Settings,
  BarChart3,
  UserCircle
} from "lucide-react";
import { useLocation, Link } from "react-router-dom";

const menuItems = [
  {
    title: "Dashboard",
    url: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    title: "PDV",
    url: "/pdv",
    icon: ShoppingCart,
  },
  {
    title: "CRM",
    url: "/crm",
    icon: Users,
  },
  {
    title: "Email Marketing",
    url: "/email-marketing",
    icon: Mail,
  },
  {
    title: "Ligações",
    url: "/ligacoes",
    icon: Phone,
  },
  {
    title: "Produtos",
    url: "/produtos",
    icon: Package,
  },
  {
    title: "Relatórios",
    url: "/relatorios",
    icon: BarChart3,
  },
];

export function AppSidebar() {
  const location = useLocation();

  return (
    <Sidebar className="bg-white border-r">
      <SidebarHeader className="p-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
            <ShoppingCart className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900">LoovePOS</h2>
            <p className="text-sm text-gray-600">Sistema CRM</p>
          </div>
        </div>
      </SidebarHeader>
      
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Menu Principal</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton 
                    asChild 
                    isActive={location.pathname === item.url}
                    className="w-full"
                  >
                    <Link to={item.url} className="flex items-center gap-3 px-3 py-2 rounded-lg transition-colors">
                      <item.icon className="w-5 h-5" />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel>Configurações</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <Link to="/configuracoes" className="flex items-center gap-3 px-3 py-2 rounded-lg transition-colors">
                    <Settings className="w-5 h-5" />
                    <span>Configurações</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="p-4">
        <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
          <UserCircle className="w-8 h-8 text-gray-600" />
          <div>
            <p className="font-medium text-sm">Lucas</p>
            <p className="text-xs text-gray-600">Administrador</p>
          </div>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
