import { useAuth } from '@/contexts/AuthContext';
import { Link, useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { Coins, BarChart3, History, Search, LogOut, Menu, Copy } from 'lucide-react';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';

export default function Navbar() {
  const { user, profile, signOut } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [location, setLocation] = useLocation();
  const { toast } = useToast();

  // Adicionar padding-top ao body quando navbar estiver presente
  useEffect(() => {
    if (user) {
      document.body.style.paddingTop = '64px';
    } else {
      document.body.style.paddingTop = '0';
    }
    return () => {
      document.body.style.paddingTop = '0';
    };
  }, [user]);

  const handleLogout = async () => {
    await signOut();
  };

  const copyDevToken = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast({
          variant: 'destructive',
          title: 'Erro',
          description: 'Você não está logado.',
        });
        return;
      }
      await navigator.clipboard.writeText(session.access_token);
      toast({
        title: '✅ Token copiado!',
        description: 'Token DEV copiado para a área de transferência.',
      });
    } catch (err) {
      toast({
        variant: 'destructive',
        title: 'Erro',
        description: 'Não foi possível copiar o token.',
      });
    }
  };

  const getInitials = (name: string | null | undefined) => {
    if (!name) return 'U';
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const isActive = (path: string) => location === path;

  return (
    <nav className="border-b bg-card sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
            <Coins className="h-4 w-4 text-primary-foreground" />
          </div>
          <h1 className="text-xl font-semibold hidden sm:inline">AffiBoard</h1>
        </div>

        <div className="hidden md:flex items-center gap-1">
          <Link href="/dashboard">
            <Button
              variant={isActive('/dashboard') ? 'default' : 'ghost'}
              size="sm"
              data-testid="link-dashboard"
            >
              <BarChart3 className="h-4 w-4 mr-2" />
              Dashboard
            </Button>
          </Link>
          <Link href="/analyze">
            <Button
              variant={isActive('/analyze') ? 'default' : 'ghost'}
              size="sm"
              data-testid="link-analyze"
            >
              <Search className="h-4 w-4 mr-2" />
              Analisar
            </Button>
          </Link>
          <Link href="/history">
            <Button
              variant={isActive('/history') ? 'default' : 'ghost'}
              size="sm"
              data-testid="link-history"
            >
              <History className="h-4 w-4 mr-2" />
              Histórico
            </Button>
          </Link>
        </div>

        <div className="flex items-center gap-3 ml-auto">
          {/* Botão DEV Token */}
          {process.env.NODE_ENV === 'development' && (
            <Button
              variant="outline"
              size="sm"
              onClick={copyDevToken}
              className="hidden md:flex gap-2"
            >
              <Copy className="h-4 w-4" />
              <span className="text-xs">Token DEV</span>
            </Button>
          )}

          {profile && (
            <div className="hidden sm:flex items-center gap-2 px-3 py-1 bg-muted rounded-md">
              <Coins className="h-4 w-4 text-primary" />
              <span className="text-sm font-medium">{profile.credits}</span>
            </div>
          )}

          <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" data-testid="button-profile-menu">
                <Avatar className="h-8 w-8">
                  <AvatarFallback className="bg-primary/10 text-primary text-xs">
                    {getInitials(profile?.full_name || user?.email)}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <div className="px-2 py-1.5">
                <p className="text-sm font-medium" data-testid="text-user-name">
                  {profile?.full_name || 'Usuário'}
                </p>
                <p className="text-xs text-muted-foreground" data-testid="text-user-email">
                  {user?.email}
                </p>
              </div>
              <DropdownMenuSeparator />
              <div className="md:hidden space-y-1">
                <Link href="/dashboard">
                  <DropdownMenuItem>
                    <BarChart3 className="h-4 w-4 mr-2" />
                    Dashboard
                  </DropdownMenuItem>
                </Link>
                <Link href="/analyze">
                  <DropdownMenuItem>
                    <Search className="h-4 w-4 mr-2" />
                    Analisar
                  </DropdownMenuItem>
                </Link>
                <Link href="/history">
                  <DropdownMenuItem>
                    <History className="h-4 w-4 mr-2" />
                    Histórico
                  </DropdownMenuItem>
                </Link>
                <DropdownMenuSeparator />
              </div>
              <DropdownMenuItem onClick={handleLogout} data-testid="button-logout">
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            data-testid="button-menu"
          >
            <Menu className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </nav>
  );
}