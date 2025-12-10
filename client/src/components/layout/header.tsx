import { Bell, User } from "lucide-react";
import { MobileSidebar } from "./sidebar";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface HeaderProps {
  title: string;
}

export function Header({ title }: HeaderProps) {
  return (
    <header className="h-16 border-b border-[#1BC1A1]/20 bg-[#0F1F1D] flex items-center px-6 justify-between sticky top-0 z-10">
      <div className="flex items-center gap-4">
        <MobileSidebar />
        <h1 className="text-xl font-semibold text-white tracking-wide">{title}</h1>
      </div>

      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" className="relative text-gray-400 hover:text-[#1BC1A1] hover:bg-[#1BC1A1]/10">
          <Bell className="h-5 w-5" />
          <span className="absolute top-2 right-2 h-2 w-2 bg-[#1BC1A1] rounded-full animate-pulse"></span>
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="relative h-8 w-8 rounded-full ring-2 ring-[#1BC1A1]/30 hover:ring-[#1BC1A1] transition-all">
              <Avatar className="h-8 w-8">
                <AvatarImage src="https://github.com/shadcn.png" alt="@user" />
                <AvatarFallback>AB</AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56 bg-[#0F1F1D] border-[#1BC1A1]/20 text-gray-200" align="end" forceMount>
            <DropdownMenuLabel className="font-normal">
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium leading-none text-white">Usuário Demo</p>
                <p className="text-xs leading-none text-muted-foreground">
                  usuario@affiboard.com
                </p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator className="bg-[#1BC1A1]/20" />
            <DropdownMenuItem className="focus:bg-[#1BC1A1]/10 focus:text-[#1BC1A1]">
              Perfil
            </DropdownMenuItem>
            <DropdownMenuItem className="focus:bg-[#1BC1A1]/10 focus:text-[#1BC1A1]">
              Cobrança
            </DropdownMenuItem>
            <DropdownMenuItem className="focus:bg-[#1BC1A1]/10 focus:text-[#1BC1A1]">
              Configurações
            </DropdownMenuItem>
            <DropdownMenuSeparator className="bg-[#1BC1A1]/20" />
            <DropdownMenuItem className="text-red-400 focus:bg-red-900/20 focus:text-red-300">
              Sair
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
