import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check, Zap, Loader2, Sparkles, Flame, Crown } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useQuery } from "@tanstack/react-query";

interface CreditsData {
  success: boolean;
  credits: number;
  plan_tier: string;
  email: string | null;
  full_name: string | null;
}

interface CreditHistoryItem {
  id: string;
  amount: number;
  action: string;
  description: string;
  created_at: string;
}

interface CreditHistoryData {
  success: boolean;
  data: CreditHistoryItem[];
}

const plans = [
  {
    name: "Standard",
    price: "R$ 19,00",
    credits: 100,
    popular: true,
    icon: Sparkles,
    description: "Plano promocional com 100 análises",
    lemonId: "1129959", // Lemon Squeezy Product ID
    features: [
      "100 análises",
      "Acesso completo ao sistema",
      "Histórico de análises",
      "Suporte por email"
    ]
  }
];

export default function CreditsPage() {
  const { session } = useAuth();

  const { data: creditsData, isLoading: isLoadingCredits } = useQuery<CreditsData>({
    queryKey: ["/api/credits"],
    enabled: true,
  });

  const { data: historyData, isLoading: isLoadingHistory } = useQuery<CreditHistoryData>({
    queryKey: ["/api/credits/history"],
    enabled: true,
  });

  const credits = creditsData?.credits ?? 0;
  const planTier = creditsData?.plan_tier ?? 'free';
  const history = historyData?.data ?? [];

  // Lemon Squeezy checkout handler
  const handleSelectPlan = (plan: typeof plans[0]) => {
    const checkoutUrl = import.meta.env.VITE_LEMON_CHECKOUT_STANDARD;
    if (checkoutUrl) {
      window.location.href = checkoutUrl;
    } else {
      alert("Checkout URL não configurada. Entre em contato com o suporte.");
    }
  };

  return (
    <div className="space-y-8">
      {/* Current Credits - Premium Card */}
      <Card className="bg-gradient-to-br from-[#1BC1A1]/5 via-[#0F1F1D] to-[#005A52]/5 border border-neutral-800/50 shadow-md hover:shadow-lg transition-all rounded-xl">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <p className="text-neutral-400 text-sm font-medium">Análises Disponíveis</p>
                <div className="w-1 h-1 bg-[#1BC1A1] rounded-full"></div>
              </div>
              {isLoadingCredits ? (
                <Loader2 className="h-10 w-10 animate-spin text-[#1BC1A1]" />
              ) : (
                <h2 className="text-5xl font-semibold text-white tracking-tight" data-testid="text-credits-balance">{credits}</h2>
              )}
              <p className="text-neutral-400 text-sm mt-3 flex items-center gap-1 font-medium">
                Plano: <span className="text-[#1BC1A1] font-semibold capitalize bg-[#1BC1A1]/10 px-2 py-1 rounded-md" data-testid="text-plan-tier">{planTier}</span>
              </p>
            </div>
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-br from-[#1BC1A1] to-[#005A52] rounded-xl opacity-20 blur"></div>
              <div className="relative h-20 w-20 rounded-xl bg-[#1BC1A1]/10 flex items-center justify-center border border-[#1BC1A1]/30">
                <Zap className="h-10 w-10 text-[#1BC1A1]" />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Plans */}
      <div>
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-2">
            <h2 className="text-3xl font-semibold text-white">Planos de Análise</h2>
            <Sparkles className="h-6 w-6 text-[#1BC1A1]" />
          </div>
          <p className="text-neutral-400">Desbloqueie análises ilimitadas com o plano perfeito para você</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {plans.map((plan) => {
            const Icon = plan.icon;
            return (
              <Card 
                key={plan.name}
                className={`bg-[#0F1F1D] border relative transition-all duration-300 shadow-md hover:shadow-lg rounded-xl ${
                  plan.popular 
                    ? 'border-neutral-700 md:scale-105 shadow-lg shadow-[#1BC1A1]/20 hover:shadow-2xl hover:shadow-[#1BC1A1]/30' 
                    : 'border-neutral-800/50 hover:border-neutral-700'
                }`}
                data-testid={`card-plan-${plan.name.toLowerCase()}`}
              >
                {/* Background glow effect */}
                {plan.popular && (
                  <div className="absolute inset-0 bg-gradient-to-br from-[#1BC1A1]/10 to-transparent rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"></div>
                )}
                
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 z-10">
                    <Badge className="bg-gradient-to-r from-[#1BC1A1] to-[#00927B] text-white text-xs font-bold px-4 py-1.5 shadow-lg">
                      ⭐ Recomendado
                    </Badge>
                  </div>
                )}

                <CardHeader className={`text-center relative z-10 ${plan.popular ? 'pt-10' : 'pt-6'} pb-5`}>
                  <div className="flex justify-center mb-3">
                    <div className={`p-3 rounded-lg ${plan.popular ? 'bg-[#1BC1A1]/20' : 'bg-[#1BC1A1]/10'}`}>
                      <Icon className="h-6 w-6 text-[#1BC1A1]" />
                    </div>
                  </div>
                  <CardTitle className="text-2xl text-white font-semibold mb-2">{plan.name}</CardTitle>
                  <p className="text-sm text-neutral-400 mb-4 min-h-10">{plan.description}</p>
                  
                  {/* Price section with visual emphasis */}
                  <div className={`py-4 px-4 rounded-lg mb-4 ${plan.popular ? 'bg-[#1BC1A1]/10 border border-[#1BC1A1]/20' : 'bg-[#005A52]/20'}`}>
                    <span className="text-5xl font-bold text-[#1BC1A1]">{plan.price}</span>
                    {plan.price !== "Personalizado" && <span className="text-gray-400 ml-1 text-lg">/mês</span>}
                  </div>
                  
                  <div className="flex items-center justify-center gap-2 text-sm text-gray-500">
                    <div className="w-1.5 h-1.5 bg-[#1BC1A1] rounded-full"></div>
                    <span>{plan.credits} análises</span>
                  </div>
                </CardHeader>

                <CardContent className="relative z-10 space-y-3 pb-5">
                  {plan.features.map((feature, i) => (
                    <div key={i} className="flex items-start gap-3 text-neutral-300 text-sm group">
                      <div className="flex-shrink-0 mt-1">
                        <Check className="h-4 w-4 text-[#1BC1A1] group-hover:scale-110 transition-transform" />
                      </div>
                      <span className="group-hover:text-white transition-colors">{feature}</span>
                    </div>
                  ))}
                </CardContent>

                <CardFooter className="pt-0 relative z-10">
                  <Button 
                    onClick={() => handleSelectPlan(plan)}
                    className="w-full bg-gradient-to-r from-[#1BC1A1] to-[#00927B] hover:from-[#1BC1A1] hover:to-[#005A52] text-white shadow-lg hover:shadow-xl hover:scale-[1.02] transition-all duration-300 font-semibold"
                    data-testid="button-buy-standard"
                  >
                    Comprar 100 análises – R$19,00
                  </Button>
                </CardFooter>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Credit History */}
      <Card className="bg-[#0F1F1D] border border-neutral-800/50 shadow-md hover:shadow-lg transition-all rounded-xl">
        <CardHeader>
          <CardTitle className="text-white font-semibold">Histórico de Créditos</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoadingHistory ? (
            <div className="flex items-center justify-center p-8" data-testid="loading-credit-history">
              <Loader2 className="h-6 w-6 animate-spin text-[#1BC1A1]" />
            </div>
          ) : history.length === 0 ? (
            <p className="text-center text-gray-400 py-8" data-testid="empty-credit-history">
              Nenhuma transação de créditos ainda
            </p>
          ) : (
            <div className="space-y-3">
              {history.map((item) => (
                <div 
                  key={item.id} 
                  className="flex items-center justify-between p-4 rounded-lg bg-[#0B1615] border border-neutral-800/50 shadow-sm hover:shadow-md transition-all"
                  data-testid={`credit-history-${item.id}`}
                >
                  <div>
                    <p className="text-white font-semibold" data-testid={`text-description-${item.id}`}>{item.description}</p>
                    <p className="text-sm text-neutral-400 font-medium" data-testid={`text-date-${item.id}`}>
                      {new Date(item.created_at).toLocaleDateString('pt-BR')}
                    </p>
                  </div>
                  <span className={`font-bold ${item.amount > 0 ? 'text-[#1BC1A1]' : 'text-red-400'}`} data-testid={`text-amount-${item.id}`}>
                    {item.amount > 0 ? '+' : ''}{item.amount}
                  </span>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
