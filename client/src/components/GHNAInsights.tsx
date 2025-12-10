import ValueBlock from './ValueBlock';
import CreditsBadge from './CreditsBadge';
import { Button } from '@/components/ui/button';

type InsightsProps = {
  stats: {
    conversion: number;
    perceivedValue: number;
    paidTrafficPotential: number;
    refundRisk: number;
  };
  creditsLeft: number;
  onNewAnalysis?: () => void;
};

export default function GHNAInsights({ stats, creditsLeft, onNewAnalysis }: InsightsProps) {
  return (
    <section className="rounded-xl border border-[#1BC1A1]/15 bg-[#0F1F1D] p-6 space-y-4">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <h3 className="text-lg font-semibold text-[#1BC1A1]">Insights Estratégicos (GHNA)</h3>
        <CreditsBadge credits={creditsLeft} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <ValueBlock 
          label="Probabilidade de Conversão" 
          value={stats.conversion} 
          note="Página com boa prova social e CTA claros." 
        />
        <ValueBlock 
          label="Força do Valor Percebido" 
          value={stats.perceivedValue} 
          note="Narrativa forte, promessa alinhada ao público." 
        />
        <ValueBlock 
          label="Potencial no Tráfego Pago" 
          value={stats.paidTrafficPotential} 
          variant="warning"
          note="Recomenda-se teste controlado antes de escalar." 
        />
        <ValueBlock 
          label="Risco de Reembolso" 
          value={stats.refundRisk} 
          variant="muted"
          note="Baixo risco baseado na clareza da promessa." 
        />
      </div>

      <div className="border-t border-[#1BC1A1]/10 pt-4 text-sm text-gray-400">
        <strong className="text-white">Interpretação:</strong> Esta oferta tem potencial para escala controlada — comece com orçamentos pequenos e valide criativos antes de crescer.
      </div>

      <div className="flex gap-3 flex-wrap">
        <Button 
          onClick={onNewAnalysis}
          className="bg-[#1BC1A1] hover:bg-[#00927B] text-black font-medium"
          data-testid="button-new-analysis-from-insights"
        >
          Analisar outra oferta
        </Button>
        <Button 
          variant="outline"
          className="border-[#1BC1A1]/30 text-[#1BC1A1] hover:bg-[#1BC1A1]/10"
          data-testid="button-detailed-recommendations"
        >
          Ver recomendações detalhadas
        </Button>
      </div>
    </section>
  );
}
