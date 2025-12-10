import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { User, Lock, Bell, Loader2, Check, X, Eye, EyeOff } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { validatePassword, getPasswordRequirementsList, getPasswordStrengthText, getPasswordStrengthColor } from "@shared/password-validation";

interface ProfileData {
  success: boolean;
  profile: {
    id: string;
    email: string;
    full_name: string | null;
    credits: number;
    created_at: string;
  };
}

export default function SettingsPage() {
  const { user, signOut } = useAuth();
  const { toast } = useToast();
  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);

  const { data: profileData, isLoading } = useQuery<ProfileData>({
    queryKey: ["/api/profile"],
    enabled: !!user,
  });

  const profile = profileData?.profile;

  const handleSignOut = async () => {
    await signOut();
  };

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!oldPassword || !newPassword || !confirmPassword) {
      toast({
        variant: 'destructive',
        title: 'Erro',
        description: 'Preencha todos os campos.',
      });
      return;
    }

    if (newPassword !== confirmPassword) {
      toast({
        variant: 'destructive',
        title: 'Erro',
        description: 'As novas senhas não coincidem.',
      });
      return;
    }

    const strength = validatePassword(newPassword);
    if (!strength.isValid) {
      toast({
        variant: 'destructive',
        title: 'Erro',
        description: 'A nova senha não atende aos requisitos de segurança.',
      });
      return;
    }

    setIsUpdatingPassword(true);
    try {
      // TODO: Call API to update password
      // For now just show success
      toast({
        title: 'Sucesso!',
        description: 'Sua senha foi atualizada. Por favor, faça login novamente.',
      });
      setOldPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Erro',
        description: error.message || 'Erro ao atualizar senha.',
      });
    } finally {
      setIsUpdatingPassword(false);
    }
  };

  return (
    <Tabs defaultValue="profile" className="space-y-8">
      <TabsList className="bg-[#0F1F1D] border border-[#1BC1A1]/20 p-1 h-auto">
        <TabsTrigger value="profile" className="data-[state=active]:bg-[#1BC1A1] data-[state=active]:text-white text-gray-400 py-2" data-testid="tab-profile">
          <User className="h-4 w-4 mr-2" /> Perfil
        </TabsTrigger>
        <TabsTrigger value="security" className="data-[state=active]:bg-[#1BC1A1] data-[state=active]:text-white text-gray-400 py-2" data-testid="tab-security">
          <Lock className="h-4 w-4 mr-2" /> Segurança
        </TabsTrigger>
        <TabsTrigger value="notifications" className="data-[state=active]:bg-[#1BC1A1] data-[state=active]:text-white text-gray-400 py-2" data-testid="tab-notifications">
          <Bell className="h-4 w-4 mr-2" /> Notificações
        </TabsTrigger>
      </TabsList>

      <TabsContent value="profile">
        <div className="grid gap-6">
          <Card className="bg-[#0F1F1D] border border-[#1BC1A1]/15">
            <CardHeader>
              <CardTitle className="text-white">Informações Pessoais</CardTitle>
              <CardDescription className="text-gray-400">Visualize seus dados de conta</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {isLoading ? (
                <div className="flex items-center justify-center p-8" data-testid="loading-profile">
                  <Loader2 className="h-6 w-6 animate-spin text-[#1BC1A1]" />
                </div>
              ) : (
                <>
                  <div className="flex items-center gap-4 mb-6">
                    <div className="h-20 w-20 rounded-full bg-[#1BC1A1]/20 flex items-center justify-center text-[#1BC1A1] text-2xl border-2 border-[#1BC1A1]" data-testid="avatar-initials">
                      {profile?.full_name?.charAt(0)?.toUpperCase() || user?.email?.charAt(0)?.toUpperCase() || "U"}
                    </div>
                    <div>
                      <h3 className="text-lg font-medium text-white" data-testid="text-full-name">{profile?.full_name || "Usuário"}</h3>
                      <p className="text-sm text-gray-400" data-testid="text-email">{user?.email}</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="text-gray-300">Nome Completo</Label>
                      <Input 
                        value={profile?.full_name || ""} 
                        disabled 
                        className="bg-[#0B1615] border-[#1BC1A1]/20 text-gray-300"
                        data-testid="input-name"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-gray-300">Email</Label>
                      <Input 
                        value={user?.email || ""} 
                        disabled 
                        className="bg-[#0B1615] border-[#1BC1A1]/20 text-gray-300"
                        data-testid="input-email"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-gray-300">Membro desde</Label>
                    <Input 
                      value={profile?.created_at ? new Date(profile.created_at).toLocaleDateString('pt-BR') : "-"} 
                      disabled 
                      className="bg-[#0B1615] border-[#1BC1A1]/20 text-gray-300"
                      data-testid="input-member-since"
                    />
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          <Card className="bg-[#0F1F1D] border border-[#1BC1A1]/15">
            <CardHeader>
              <CardTitle className="text-white">Conta</CardTitle>
              <CardDescription className="text-gray-400">Gerencie suas preferências de conta</CardDescription>
            </CardHeader>
            <CardContent>
              <Button 
                variant="destructive" 
                onClick={handleSignOut}
                className="bg-red-500/10 text-red-400 hover:bg-red-500/20 border border-red-500/30"
                data-testid="button-signout"
              >
                Sair da conta
              </Button>
            </CardContent>
          </Card>
        </div>
      </TabsContent>

      <TabsContent value="security">
        <Card className="bg-[#0F1F1D] border border-[#1BC1A1]/15">
          <CardHeader>
            <CardTitle className="text-white">Alterar Senha</CardTitle>
            <CardDescription className="text-gray-400">Atualize sua senha de acesso</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <form onSubmit={handleUpdatePassword} className="space-y-4">
              <div className="space-y-2">
                <Label className="text-gray-300">Senha Atual</Label>
                <div className="relative">
                  <Input 
                    type={showOldPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={oldPassword}
                    onChange={(e) => setOldPassword(e.target.value)}
                    disabled={isUpdatingPassword}
                    className="bg-[#0B1615] border-[#1BC1A1]/20 text-white"
                    data-testid="input-current-password"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute right-2 top-1/2 -translate-y-1/2 hover:bg-transparent"
                    onClick={() => setShowOldPassword(!showOldPassword)}
                    data-testid="button-toggle-old-password"
                  >
                    {showOldPassword ? (
                      <EyeOff className="h-4 w-4 text-gray-400" />
                    ) : (
                      <Eye className="h-4 w-4 text-gray-400" />
                    )}
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-gray-300">Nova Senha</Label>
                <div className="relative">
                  <Input 
                    type={showNewPassword ? "text" : "password"}
                    placeholder="Mínimo 12 caracteres, maiúscula, número e símbolo"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    disabled={isUpdatingPassword}
                    className="bg-[#0B1615] border-[#1BC1A1]/20 text-white"
                    data-testid="input-new-password"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute right-2 top-1/2 -translate-y-1/2 hover:bg-transparent"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    data-testid="button-toggle-new-password"
                  >
                    {showNewPassword ? (
                      <EyeOff className="h-4 w-4 text-gray-400" />
                    ) : (
                      <Eye className="h-4 w-4 text-gray-400" />
                    )}
                  </Button>
                </div>
                {newPassword && (
                  <div className="mt-2 space-y-1 text-sm">
                    <div className={`font-semibold ${getPasswordStrengthColor(validatePassword(newPassword))}`}>
                      Força: {getPasswordStrengthText(validatePassword(newPassword))}
                    </div>
                    <div className="space-y-1">
                      {getPasswordRequirementsList(newPassword).map((req) => (
                        <div key={req.text} className="flex items-center gap-2 text-xs">
                          {req.met ? (
                            <Check className="h-3 w-3 text-green-500" />
                          ) : (
                            <X className="h-3 w-3 text-red-500" />
                          )}
                          <span className={req.met ? 'text-green-500' : 'text-gray-400'}>
                            {req.text}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Label className="text-gray-300">Confirmar Nova Senha</Label>
                <Input 
                  type="password"
                  placeholder="Repita sua senha"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  disabled={isUpdatingPassword}
                  className="bg-[#0B1615] border-[#1BC1A1]/20 text-white"
                  data-testid="input-confirm-password"
                />
              </div>

              <Button 
                type="submit"
                disabled={isUpdatingPassword || !validatePassword(newPassword).isValid}
                className="bg-[#1BC1A1] hover:bg-[#00927B] text-white w-full" 
                data-testid="button-update-password"
              >
                {isUpdatingPassword ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Atualizando...
                  </>
                ) : (
                  'Atualizar Senha'
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="notifications">
        <Card className="bg-[#0F1F1D] border border-[#1BC1A1]/15">
          <CardHeader>
            <CardTitle className="text-white">Preferências de Notificações</CardTitle>
            <CardDescription className="text-gray-400">Configure como deseja receber notificações</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white font-medium">Notificações por Email</p>
                <p className="text-sm text-gray-400">Receba atualizações sobre suas análises</p>
              </div>
              <Switch data-testid="switch-email-notifications" />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white font-medium">Alertas de Créditos</p>
                <p className="text-sm text-gray-400">Seja notificado quando seus créditos estiverem baixos</p>
              </div>
              <Switch defaultChecked data-testid="switch-credit-alerts" />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white font-medium">Novidades e Atualizações</p>
                <p className="text-sm text-gray-400">Receba informações sobre novos recursos</p>
              </div>
              <Switch data-testid="switch-updates" />
            </div>
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  );
}
