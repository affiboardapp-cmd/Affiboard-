import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";
import { LayoutDashboard, PlusCircle, History, CreditCard, Settings, LogOut, Menu } from "lucide-react";
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { useState } from "react";

const navItems = [
  { icon: LayoutDashboard, label: "Dashboard", href: "/" },
  { icon: PlusCircle, label: "Nova Análise", href: "/new-analysis" },
  { icon: History, label: "Minhas Análises", href: "/history" },
  { icon: CreditCard, label: "Créditos", href: "/credits" },
  { icon: Settings, label: "Configurações", href: "/settings" },
];

export function Sidebar() {
  const [location] = useLocation();

  return (
    <div className="h-full flex flex-col bg-sidebar border-r border-sidebar-border w-64 hidden md:flex">
      <div className="p-6 border-b border-sidebar-border/30">
        <div className="flex items-center gap-3">
          <img 
            src="/attached_assets/Screenshot_20251113-142527_1764798412883.png" 
            alt="AffiBoard Logo" 
            className="h-10 w-10 rounded-lg object-cover"
          />
          <span className="text-xl font-bold tracking-tight text-white">AFFIBOARD</span>
        </div>
      </div>

      <nav className="flex-1 px-4 py-6 space-y-2">
        {navItems.map((item) => {
          const isActive = location === item.href;
          return (
            <Link 
              key={item.href} 
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 group",
                isActive
                  ? "bg-[#00927B] text-white shadow-md"
                  : "text-sidebar-foreground hover:bg-[#1BC1A1]/15 hover:text-white"
              )}
            >
              <item.icon className={cn("h-5 w-5", isActive ? "text-white" : "text-gray-400 group-hover:text-[#1BC1A1]")} />
              <span className="font-medium">{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-sidebar-border/30">
        <Link 
          href="/login" 
          className="flex items-center gap-3 px-4 py-3 text-gray-400 hover:text-white hover:bg-white/5 rounded-lg transition-colors"
        >
          <LogOut className="h-5 w-5" />
          <span>Sair</span>
        </Link>
      </div>
    </div>
  );
}

export function MobileSidebar() {
  const [location] = useLocation();
  const [open, setOpen] = useState(false);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="md:hidden text-white">
          <Menu className="h-6 w-6" />
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="bg-sidebar border-sidebar-border p-0 w-72">
        <SheetTitle className="sr-only">Menu de Navegação</SheetTitle>
        <div className="h-full flex flex-col">
            <div className="p-6 border-b border-sidebar-border/30">
                <div className="flex items-center gap-3">
                <img 
                    src="/attached_assets/Screenshot_20251113-142527_1764798412883.png" 
                    alt="AffiBoard Logo" 
                    className="h-8 w-8 rounded-lg object-cover"
                />
                <span className="text-xl font-bold text-white">AFFIBOARD</span>
                </div>
            </div>
            <nav className="flex-1 px-4 py-6 space-y-2">
                {navItems.map((item) => {
                const isActive = location === item.href;
                return (
                    <Link 
                      key={item.href} 
                      href={item.href}
                      onClick={() => setOpen(false)}
                      className={cn(
                        "flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200",
                        isActive
                            ? "bg-[#00927B] text-white"
                            : "text-sidebar-foreground hover:bg-[#1BC1A1]/15 hover:text-white"
                      )}
                    >
                        <item.icon className={cn("h-5 w-5", isActive ? "text-white" : "text-gray-400")} />
                        <span className="font-medium">{item.label}</span>
                    </Link>
                );
                })}
            </nav>
        </div>
      </SheetContent>
    </Sheet>
  );
}
