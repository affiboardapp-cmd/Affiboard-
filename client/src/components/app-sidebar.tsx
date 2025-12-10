import { useLocation } from "wouter";
import { Link } from "wouter";
import { 
  LayoutDashboard, 
  PlusCircle, 
  History, 
  CreditCard, 
  Settings, 
  LogOut,
  ChevronDown
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

const menuItems = [
  { 
    title: "Dashboard", 
    path: "/", 
    icon: LayoutDashboard 
  },
  { 
    title: "Nova Análise", 
    path: "/new-analysis", 
    icon: PlusCircle 
  },
  { 
    title: "Histórico", 
    path: "/history", 
    icon: History 
  },
  { 
    title: "Créditos", 
    path: "/credits", 
    icon: CreditCard 
  },
  { 
    title: "Configurações", 
    path: "/settings", 
    icon: Settings 
  },
];

export function AppSidebar() {
  const [location, navigate] = useLocation();
  const { profile, signOut } = useAuth();
  
  const initials = profile?.full_name
    ?.split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2) || 'U';

  return (
    <Sidebar className="border-r border-[#1BC1A1]/15 bg-[#0B1615]">
      <SidebarHeader className="p-4 border-b border-[#1BC1A1]/15">
        <Link href="/" data-testid="link-home">
          <div className="flex items-center gap-3 cursor-pointer">
            <div className="h-10 w-10 bg-gradient-to-br from-[#1BC1A1] to-[#00927B] rounded-lg flex items-center justify-center shadow-lg">
              <span className="text-lg font-bold text-white">A</span>
            </div>
            <div>
              <span className="font-bold text-lg text-white tracking-tight">AFFIBOARD</span>
              <p className="text-[10px] text-[#1BC1A1] font-medium tracking-widest">ANALYTICS</p>
            </div>
          </div>
        </Link>
      </SidebarHeader>
      
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="text-gray-500 text-xs uppercase tracking-wider px-4">
            Menu Principal
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => {
                const isActive = location === item.path;
                return (
                  <SidebarMenuItem key={item.path}>
                    <SidebarMenuButton 
                      isActive={isActive}
                      onClick={() => navigate(item.path)}
                      className={isActive ? "bg-[#1BC1A1]/10 text-[#1BC1A1]" : "text-gray-400 hover:text-white hover:bg-[#1BC1A1]/5"}
                      data-testid={`nav-${item.title.toLowerCase().replace(/\s/g, '-')}`}
                    >
                      <item.icon className="h-5 w-5" />
                      <span>{item.title}</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      
      <SidebarFooter className="border-t border-[#1BC1A1]/15 p-2">
        <SidebarMenu>
          <SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <SidebarMenuButton 
                  className="w-full text-gray-300 hover:bg-[#1BC1A1]/5"
                  data-testid="button-user-menu"
                >
                  <Avatar className="h-8 w-8 bg-[#1BC1A1]/20 border border-[#1BC1A1]/30">
                    <AvatarFallback className="bg-transparent text-[#1BC1A1] text-sm font-medium">
                      {initials}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 text-left">
                    <p className="text-sm font-medium text-white truncate">
                      {profile?.full_name || 'Usuário'}
                    </p>
                    <p className="text-xs text-gray-500 truncate">
                      {profile?.email || ''}
                    </p>
                  </div>
                  <ChevronDown className="h-4 w-4 text-gray-500" />
                </SidebarMenuButton>
              </DropdownMenuTrigger>
              <DropdownMenuContent 
                align="end" 
                className="w-56 bg-[#0F1F1D] border-[#1BC1A1]/20"
              >
                <DropdownMenuItem 
                  onClick={() => signOut()}
                  className="text-red-400 focus:bg-red-500/10 focus:text-red-400 cursor-pointer"
                  data-testid="button-logout"
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  Sair da conta
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
