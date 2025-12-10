import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const plans = [
  {
    name: "Starter",
    description: "Para quem está começando",
    price: "R$ 29",
    period: "/mês",
    credits: 30,
    features: [
      "30 análises por mês",
      "Análise básica de ofertas",
      "Histórico de 30 dias",
      "Suporte por email"
    ],
    buttonText: "Começar Agora",
    buttonVariant: "outline" as const,
    popular: false,
    lemonLink: "#"
  },
  {
    name: "Pro",
    description: "Para afiliados ativos",
    price: "R$ 79",
    period: "/mês",
    credits: 100,
    features: [
      "100 análises por mês",
      "Análise avançada com IA",
      "Histórico ilimitado",
      "Relatórios detalhados",
      "Suporte prioritário"
    ],
    buttonText: "Assinar Pro",
    buttonVariant: "default" as const,
    popular: true,
    lemonLink: "#"
  },
  {
    name: "Business",
    description: "Para equipes e agências",
    price: "R$ 199",
    period: "/mês",
    credits: 500,
    features: [
      "500 análises por mês",
      "Todas as features Pro",
      "API de integração",
      "Múltiplos usuários",
      "Gerente de conta dedicado",
      "Treinamento personalizado"
    ],
    buttonText: "Falar com Vendas",
    buttonVariant: "outline" as const,
    popular: false,
    lemonLink: "#"
  }
];

export default function Pricing() {
  const handlePurchase = (lemonLink: string, planName: string) => {
    if (lemonLink === "#") {
      alert(`Link do Lemon Squeezy para o plano ${planName} ainda não configurado.`);
      return;
    }
    window.open(lemonLink, "_blank");
  };

  return (
    <div className="min-h-screen bg-background py-12 px-4" data-testid="page-pricing">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4" data-testid="text-pricing-title">
            Escolha seu Plano
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto" data-testid="text-pricing-subtitle">
            Analise ofertas de forma inteligente e tome decisões baseadas em dados. 
            Comece gratuitamente ou escolha o plano ideal para seu negócio.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {plans.map((plan, index) => (
            <Card 
              key={plan.name}
              className={`relative flex flex-col ${plan.popular ? 'border-primary shadow-lg scale-105' : ''}`}
              data-testid={`card-plan-${plan.name.toLowerCase()}`}
            >
              {plan.popular && (
                <Badge 
                  className="absolute -top-3 left-1/2 -translate-x-1/2"
                  data-testid="badge-popular"
                >
                  Mais Popular
                </Badge>
              )}
              
              <CardHeader className="text-center pb-2">
                <CardTitle className="text-2xl" data-testid={`text-plan-name-${index}`}>
                  {plan.name}
                </CardTitle>
                <CardDescription data-testid={`text-plan-description-${index}`}>
                  {plan.description}
                </CardDescription>
              </CardHeader>
              
              <CardContent className="flex-1">
                <div className="text-center mb-6">
                  <span className="text-4xl font-bold" data-testid={`text-plan-price-${index}`}>
                    {plan.price}
                  </span>
                  <span className="text-muted-foreground">{plan.period}</span>
                  <p className="text-sm text-muted-foreground mt-2">
                    {plan.credits} créditos de análise
                  </p>
                </div>
                
                <ul className="space-y-3">
                  {plan.features.map((feature, featureIndex) => (
                    <li 
                      key={featureIndex} 
                      className="flex items-center gap-2"
                      data-testid={`text-feature-${index}-${featureIndex}`}
                    >
                      <Check className="h-4 w-4 text-primary flex-shrink-0" />
                      <span className="text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
              
              <CardFooter>
                <Button 
                  className="w-full"
                  variant={plan.buttonVariant}
                  onClick={() => handlePurchase(plan.lemonLink, plan.name)}
                  data-testid={`button-purchase-${plan.name.toLowerCase()}`}
                >
                  {plan.buttonText}
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>

        <div className="mt-16 text-center">
          <h2 className="text-2xl font-semibold mb-4">Perguntas Frequentes</h2>
          
          <div className="max-w-2xl mx-auto space-y-6 text-left">
            <div>
              <h3 className="font-medium mb-2">O que é um crédito de análise?</h3>
              <p className="text-muted-foreground text-sm">
                Cada análise de oferta consome 1 crédito. Você pode analisar páginas de 
                vendas do Hotmart, Kiwify, Monetizze, Eduzz e Braip.
              </p>
            </div>
            
            <div>
              <h3 className="font-medium mb-2">Posso cancelar a qualquer momento?</h3>
              <p className="text-muted-foreground text-sm">
                Sim! Você pode cancelar sua assinatura quando quiser. Seus créditos 
                restantes continuam válidos até o fim do período pago.
              </p>
            </div>
            
            <div>
              <h3 className="font-medium mb-2">Os créditos acumulam?</h3>
              <p className="text-muted-foreground text-sm">
                Não, os créditos são renovados mensalmente e não acumulam para o próximo mês.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
