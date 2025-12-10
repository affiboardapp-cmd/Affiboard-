import { useState } from 'react';
import { Link, useLocation } from 'wouter';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Eye, EyeOff, Loader2 } from 'lucide-react';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { signIn } = useAuth();
  const { toast } = useToast();
  const [, setLocation] = useLocation();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    const { error } = await signIn(email, password);

    if (error) {
      toast({
        variant: 'destructive',
        title: 'Erro ao entrar',
        description: error.message === 'Invalid login credentials'
          ? 'E-mail ou senha incorretos'
          : error.message,
      });
    } else {
      toast({
        title: 'Bem-vindo!',
        description: 'Login realizado com sucesso.',
      });
      setLocation('/');
    }

    setIsLoading(false);
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-[#005A52] relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_120%,#1BC1A1_0%,transparent_50%)] opacity-20"></div>

      <div className="w-full max-w-md px-4 relative z-10">
        <div className="flex flex-col items-center mb-8">
          <div className="h-16 w-16 bg-gradient-brand rounded-2xl flex items-center justify-center shadow-brand mb-4">
            <span className="text-2xl font-bold text-white">A</span>
          </div>
          <h1 className="text-3xl font-bold text-white tracking-tight">AFFIBOARD</h1>
          <p className="text-[#1BC1A1] text-sm font-medium tracking-widest uppercase mt-2">Analytics Intelligence</p>
        </div>

        <Card className="bg-[#0F1F1D] border border-[#1BC1A1]/20 shadow-2xl backdrop-blur-sm">
          <CardHeader className="text-center pb-2">
            <h2 className="text-xl font-semibold text-white">Bem-vindo de volta</h2>
            <p className="text-gray-400 text-sm">Acesse seu painel de inteligência</p>
          </CardHeader>
          <CardContent className="pt-6">
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-gray-300">Email</Label>
                <Input 
                  id="email" 
                  type="email" 
                  placeholder="seu@email.com" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={isLoading}
                  className="bg-[#0B1615] border-[#1BC1A1]/25 text-white focus:border-[#1BC1A1] focus:ring-1 focus:ring-[#1BC1A1] glow-focus transition-all"
                  data-testid="input-email"
                />
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password" className="text-gray-300">Senha</Label>
                  <Link href="/forgot-password" className="text-xs text-[#1BC1A1] hover:underline" data-testid="link-forgot-password">
                    Esqueci minha senha
                  </Link>
                </div>
                <div className="relative">
                  <Input 
                    id="password" 
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    disabled={isLoading}
                    className="bg-[#0B1615] border-[#1BC1A1]/25 text-white focus:border-[#1BC1A1] focus:ring-1 focus:ring-[#1BC1A1] glow-focus transition-all pr-10"
                    data-testid="input-password"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute right-2 top-1/2 -translate-y-1/2 hover:bg-transparent text-gray-400 hover:text-white"
                    onClick={() => setShowPassword(!showPassword)}
                    data-testid="button-toggle-password"
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>
              
              <Button 
                type="submit" 
                size="lg"
                className="w-full bg-[#1BC1A1] hover:bg-[#00927B] text-white"
                disabled={isLoading}
                data-testid="button-login"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Entrando...
                  </>
                ) : (
                  'Entrar no Sistema'
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
        
        <p className="text-center text-gray-400 text-sm mt-8">
          Não tem uma conta?{' '}
          <Link href="/signup" className="text-[#1BC1A1] font-medium hover:underline" data-testid="link-signup">
            Solicite acesso
          </Link>
        </p>
      </div>
    </div>
  );
}
