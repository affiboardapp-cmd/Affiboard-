import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  CheckCircle, 
  AlertCircle, 
  TrendingUp, 
  Shield, 
  Percent, 
  Package,
  ExternalLink,
  X,
  Calendar
} from "lucide-react";
import type { AnalysisData } from "@/store/analysis";
import GHNAInsights from "@/components/GHNAInsights";
import { useLocation } from "wouter";

interface AnalysisResultViewProps {
  analysis: AnalysisData;
  onClose?: () => void;
  showCloseButton?: boolean;
  creditsLeft?: number;
}

function ScoreCard({ 
  title, 
  value, 
  icon: Icon,
  testId 
}: { 
  title: string; 
  value: number; 
  icon: any;
  testId?: string;
}) {
  const getScoreColor = (score: number) => {
    if (score >= 70) return "text-[#1BC1A1]";
    if (score >= 50) return "text-yellow-500";
    return "text-red-400";
  };

  const getProgressColor = (score: number) => {
    if (score >= 70) return "bg-[#1BC1A1]";
    if (score >= 50) return "bg-yellow-500";
    return "bg-red-400";
  };

  return (
    <Card className="bg-[#0F1F1D] border border-[#1BC1A1]/15" data-testid={testId}>
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-gray-400">{title}</span>
          <Icon className={`h-4 w-4 ${getScoreColor(value)}`} />
        </div>
        <div className={`text-2xl font-bold ${getScoreColor(value)}`} data-testid={`${testId}-value`}>
          {value}%
        </div>
        <div className="mt-2 h-1.5 bg-gray-800 rounded-full overflow-hidden">
          <div 
            className={`h-full ${getProgressColor(value)} transition-all duration-500`}
            style={{ width: `${value}%` }}
          />
        </div>
      </CardContent>
    </Card>
  );
}

export function AnalysisResultView({ analysis, onClose, showCloseButton = true, creditsLeft = 0 }: AnalysisResultViewProps) {
  const [, setLocation] = useLocation();

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return null;
    return new Date(dateStr).toLocaleDateString('pt-BR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  const mockStats = {
    conversion: analysis.conversionScore || 0,
    perceivedValue: Math.round((analysis.overallScore * 0.9) + 10),
    paidTrafficPotential: Math.round((analysis.overallScore * 0.8) + 5),
    refundRisk: Math.max(0, 100 - (analysis.confidence * 100) - 40),
  };

  return (
    <div className="space-y-6" data-testid="analysis-result-view">
      {showCloseButton && onClose && (
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-white">Análise Selecionada</h2>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={onClose}
            className="text-gray-400 hover:text-white hover:bg-gray-700/50"
            data-testid="button-close-analysis"
          >
            <X className="h-4 w-4 mr-1" />
            Fechar
          </Button>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <ScoreCard
          title="Score Geral"
          value={analysis.overallScore}
          icon={TrendingUp}
          testId="view-score-overall"
        />
        <ScoreCard
          title="Conversão"
          value={analysis.conversionScore}
          icon={Percent}
          testId="view-score-conversion"
        />
        <ScoreCard
          title="Segurança"
          value={100 - analysis.riskScore}
          icon={Shield}
          testId="view-score-security"
        />
        <ScoreCard
          title="Confiança"
          value={Math.round(analysis.confidence * 100)}
          icon={CheckCircle}
          testId="view-score-confidence"
        />
      </div>

      <Card className="bg-[#0F1F1D] border border-[#1BC1A1]/15">
        <CardHeader className="pb-4">
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div className="flex-1 min-w-0">
              <CardTitle className="text-white text-lg" data-testid="view-offer-title">
                {analysis.title || "Oferta"}
              </CardTitle>
              <CardDescription className="text-gray-400 mt-1 flex flex-wrap items-center gap-2">
                <Badge variant="outline" className="border-[#1BC1A1]/30 text-[#1BC1A1]" data-testid="view-platform">
                  {analysis.platform}
                </Badge>
                {analysis.price && (
                  <span className="text-[#1BC1A1] font-medium" data-testid="view-price">
                    R$ {analysis.price.toFixed(2)}
                  </span>
                )}
                {analysis.guarantee && (
                  <span className="text-gray-500">
                    Garantia: {analysis.guarantee}
                  </span>
                )}
                {analysis.installments && (
                  <span className="text-gray-500">
                    {analysis.installments}x
                  </span>
                )}
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              {analysis.created_at && (
                <span className="text-xs text-gray-500 flex items-center gap-1" data-testid="view-date">
                  <Calendar className="h-3 w-3" />
                  {formatDate(analysis.created_at)}
                </span>
              )}
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => window.open(analysis.url, '_blank')}
                className="border-[#1BC1A1]/30 text-[#1BC1A1] hover:bg-[#1BC1A1]/10"
                data-testid="button-view-url"
              >
                <ExternalLink className="h-4 w-4 mr-1" />
                Ver Página
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {analysis.factors && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {analysis.factors.positive?.length > 0 && (
                <div className="space-y-2 p-4 rounded-lg bg-[#1BC1A1]/5 border border-[#1BC1A1]/20" data-testid="view-factors-positive">
                  <h4 className="text-sm font-medium text-[#1BC1A1] flex items-center gap-2">
                    <CheckCircle className="h-4 w-4" />
                    Pontos Positivos
                  </h4>
                  <ul className="space-y-1.5">
                    {analysis.factors.positive.map((factor, i) => (
                      <li key={i} className="text-sm text-gray-300 flex items-start gap-2">
                        <span className="text-[#1BC1A1] mt-1">•</span>
                        {factor}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              {analysis.factors.negative?.length > 0 && (
                <div className="space-y-2 p-4 rounded-lg bg-red-500/5 border border-red-500/20" data-testid="view-factors-negative">
                  <h4 className="text-sm font-medium text-red-400 flex items-center gap-2">
                    <AlertCircle className="h-4 w-4" />
                    Pontos de Atenção
                  </h4>
                  <ul className="space-y-1.5">
                    {analysis.factors.negative.map((factor, i) => (
                      <li key={i} className="text-sm text-gray-300 flex items-start gap-2">
                        <span className="text-red-400 mt-1">•</span>
                        {factor}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              {analysis.factors.neutral?.length > 0 && (
                <div className="space-y-2 p-4 rounded-lg bg-yellow-500/5 border border-yellow-500/20" data-testid="view-factors-neutral">
                  <h4 className="text-sm font-medium text-yellow-500 flex items-center gap-2">
                    <Package className="h-4 w-4" />
                    Observações
                  </h4>
                  <ul className="space-y-1.5">
                    {analysis.factors.neutral.map((factor, i) => (
                      <li key={i} className="text-sm text-gray-300 flex items-start gap-2">
                        <span className="text-yellow-500 mt-1">•</span>
                        {factor}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      <GHNAInsights 
        stats={mockStats}
        creditsLeft={creditsLeft}
        onNewAnalysis={() => setLocation('/new-analysis')}
      />
    </div>
  );
}
