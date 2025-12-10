import React from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useLocation } from "wouter";
import { ArrowLeft, AlertCircle, Lightbulb, TrendingUp } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import ScoreCards from "@/components/analysis/ScoreCards";

interface AnalysisResultType {
  summary: {
    decision: "yes" | "maybe" | "no";
    reason: string;
  };
  copy: {
    level: "strong" | "medium" | "weak";
    notes: string[];
  };
  risk: {
    level: "low" | "medium" | "high";
    issues: string[];
  };
  essentials: {
    price: number | null;
    installments: number | null;
    guarantee: number | null;
    page_length: number | null;
    structure_blocks: number | null;
  };
}

interface LocationState {
  result?: AnalysisResultType;
}

export default function AnalysisResult() {
  const [location, setLocation] = useLocation();
  const state = (typeof location === "object" && location !== null) ? (location as any).state : undefined;
  const result = state?.result as AnalysisResultType | undefined;

  if (!result) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-4 p-4">
        <p className="text-gray-400">Carregando resultado...</p>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setLocation("/new-analysis")}
          className="mt-4"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Voltar para análise
        </Button>
      </div>
    );
  }

  // Convert decision to score (0-100)
  const decisionScores: Record<"yes" | "maybe" | "no", number> = {
    yes: 85,
    maybe: 55,
    no: 25,
  };

  const copyScores: Record<"strong" | "medium" | "weak", number> = {
    strong: 85,
    medium: 55,
    weak: 25,
  };

  const riskScores: Record<"low" | "medium" | "high", number> = {
    low: 85,
    medium: 55,
    high: 25,
  };

  const handleExport = () => {
    navigator.clipboard.writeText(JSON.stringify(result, null, 2));
    alert("Análise copiada! Cole na IA para gerar ângulos, copies, anúncios.");
  };

  // Quick Insights Panel
  const getOpportunity = (): string => {
    if (result.summary.decision === "yes") {
      return "Sinais fortes indicam potencial. Teste com cuidado nos detalhes de copy.";
    } else if (result.summary.decision === "maybe") {
      return "Tem potencial mas com ressalvas. Foco em mitigar riscos antes de investir.";
    }
    return "Risco elevado. Considere outras oportunidades mais promissoras.";
  };

  const getRisk = (): string => {
    const issues = result.risk.issues || [];
    if (issues.length === 0) return "Sem problemas detectados.";
    return issues[0];
  };

  const getNextAction = (): string => {
    if (result.copy.level === "weak") return "Trabalhar a copy – esse é o ponto crítico.";
    if (result.risk.level === "high") return "Investigar riscos antes de escalar investimento.";
    if (result.summary.decision === "yes") return "Testar com pequeno volume e medir ROI.";
    return "Reavaliar ou considerar novo ângulo de abordagem.";
  };

  return (
    <div className="flex flex-col gap-6 max-w-5xl mx-auto">
      {/* HEADER WITH DECISION */}
      <Card className="p-8 border-[#1BC1A1]/30 bg-gradient-to-br from-[#1BC1A1]/10 to-[#005A52]/5 shadow-md hover:shadow-lg transition-shadow" data-testid="card-decision">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <h2 className="text-2xl font-bold mb-3 text-white">Resultado da Análise</h2>
            <p className="text-sm text-gray-400 mb-4">{result.summary.reason}</p>
            <p className="text-xs text-gray-500">Baseado em dados extraídos automaticamente</p>
          </div>
        </div>
      </Card>

      {/* 4 SCORE CARDS — 2x2 GRID */}
      <ScoreCards
        potentialScore={decisionScores[result.summary.decision]}
        pageQualityScore={
          result.essentials.page_length
            ? Math.min(
                100,
                Math.round((result.essentials.page_length / 10000) * 100)
              )
            : undefined
        }
        commercialStrengthScore={copyScores[result.copy.level]}
        confidenceScore={riskScores[result.risk.level]}
        copyLevel={result.copy.level}
        riskLevel={result.risk.level}
        copyNotes={result.copy.notes}
        riskIssues={result.risk.issues}
        data-testid="score-cards"
      />

      {/* ESSENTIALS CARD */}
      <Card className="p-6 border-[#1BC1A1]/20 bg-gradient-to-br from-[#0F1F1D] to-[#005A52]/10 hover:border-[#1BC1A1]/40 transition-all" data-testid="card-essentials">
        <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4">
          Especificações Técnicas
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div className="text-gray-300">
            <span className="text-gray-500">Preço:</span>{" "}
            <span className="text-[#1BC1A1] font-medium">
              {result.essentials.price
                ? `R$ ${result.essentials.price.toFixed(2)}`
                : "—"}
            </span>
          </div>
          <div className="text-gray-300">
            <span className="text-gray-500">Parcelas:</span>{" "}
            <span className="text-[#1BC1A1] font-medium">
              {result.essentials.installments
                ? `${result.essentials.installments}x`
                : "—"}
            </span>
          </div>
          <div className="text-gray-300">
            <span className="text-gray-500">Garantia:</span>{" "}
            <span className="text-[#1BC1A1] font-medium">
              {result.essentials.guarantee
                ? `${result.essentials.guarantee} dias`
                : "—"}
            </span>
          </div>
          <div className="text-gray-300">
            <span className="text-gray-500">Tamanho da página:</span>{" "}
            <span className="text-[#1BC1A1] font-medium">
              {result.essentials.page_length
                ? `${result.essentials.page_length} caracteres`
                : "—"}
            </span>
          </div>
          <div className="col-span-full text-gray-300">
            <span className="text-gray-500">Blocos estruturais:</span>{" "}
            <span className="text-[#1BC1A1] font-medium">
              {result.essentials.structure_blocks ?? "—"}
            </span>
          </div>
        </div>
      </Card>

      {/* INSIGHTS RÁPIDOS */}
      <Card className="p-6 border-[#1BC1A1]/30 bg-[#005A52]/30 backdrop-blur-sm hover:border-[#1BC1A1]/50 transition-all" data-testid="card-insights">
        <div className="flex items-center gap-2 mb-4">
          <Lightbulb className="h-5 w-5 text-[#1BC1A1]" />
          <h3 className="text-lg font-semibold text-white">Insights Rápidos</h3>
        </div>

        <div className="space-y-3">
          <div className="flex gap-3">
            <TrendingUp className="h-4 w-4 text-[#1BC1A1] flex-shrink-0 mt-1" />
            <div>
              <p className="text-xs text-gray-400 font-medium">Oportunidade</p>
              <p className="text-sm text-gray-300">{getOpportunity()}</p>
            </div>
          </div>

          <div className="flex gap-3">
            <AlertCircle className="h-4 w-4 text-yellow-500 flex-shrink-0 mt-1" />
            <div>
              <p className="text-xs text-gray-400 font-medium">Risco Principal</p>
              <p className="text-sm text-gray-300">{getRisk()}</p>
            </div>
          </div>

          <div className="flex gap-3">
            <ArrowLeft className="h-4 w-4 text-green-500 flex-shrink-0 mt-1" />
            <div>
              <p className="text-xs text-gray-400 font-medium">Próxima Ação</p>
              <p className="text-sm text-gray-300">{getNextAction()}</p>
            </div>
          </div>
        </div>
      </Card>

      {/* BUTTONS */}
      <div className="flex gap-3">
        <Button
          onClick={handleExport}
          className="flex-1 bg-[#1BC1A1] hover:bg-[#00927B] text-white font-medium py-2"
          data-testid="button-export"
        >
          Exportar análise para IA
        </Button>
        <Button
          variant="outline"
          onClick={() => setLocation("/new-analysis")}
          className="border-[#1BC1A1]/30 text-[#1BC1A1] hover:bg-[#1BC1A1]/10"
          data-testid="button-back"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Voltar
        </Button>
      </div>
    </div>
  );
}
