import React, { Suspense } from "react";
import { useParams, useLocation } from "wouter";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, Loader2, AlertCircle, Lightbulb, TrendingUp } from "lucide-react";
import ScoreCards from "@/components/analysis/ScoreCards";

interface AnalysisData {
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
  url?: string;
}

function AnalysisDetailContent() {
  const params = useParams();
  const [, setLocation] = useLocation();
  const analysisId = params.id;

  const { data: analysisData, isLoading, error } = useQuery<{ success: boolean; data: AnalysisData }>({
    queryKey: ["/api/analysis", analysisId],
    enabled: !!analysisId,
  });

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
        <Loader2 className="h-8 w-8 animate-spin text-[#1BC1A1]" />
        <p className="text-gray-400">Carregando análise...</p>
      </div>
    );
  }

  if (error || !analysisData?.data) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
        <p className="text-red-400 font-semibold">Erro ao carregar análise</p>
        <p className="text-gray-400 text-sm">{(error as any)?.message || "Análise não encontrada"}</p>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setLocation("/history")}
          className="mt-4"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Voltar para Histórico
        </Button>
      </div>
    );
  }

  const result = analysisData.data;

  const decisionScores: Record<"yes" | "maybe" | "no", number> = { yes: 85, maybe: 55, no: 25 };
  const copyScores: Record<"strong" | "medium" | "weak", number> = { strong: 85, medium: 55, weak: 25 };
  const riskScores: Record<"low" | "medium" | "high", number> = { low: 85, medium: 55, high: 25 };

  const handleExport = () => {
    navigator.clipboard.writeText(JSON.stringify(result, null, 2));
    alert("Análise copiada! Cole na IA para gerar ângulos, copies, anúncios.");
  };

  return (
    <div className="flex flex-col gap-6 max-w-5xl mx-auto">
      <Button variant="outline" size="sm" onClick={() => setLocation("/history")} className="w-fit border-neutral-800/50 text-neutral-400 hover:text-white" data-testid="button-back-history">
        <ArrowLeft className="w-4 h-4 mr-2" />
        Voltar
      </Button>

      {result.url && (
        <div className="bg-[#0F1F1D] p-4 rounded-lg border border-neutral-800/50">
          <p className="text-xs text-neutral-400 mb-1 font-medium">URL Analisada</p>
          <p className="text-sm text-[#1BC1A1] break-all font-mono">{result.url}</p>
        </div>
      )}

      <ScoreCards
        potentialScore={decisionScores[result.summary.decision]}
        pageQualityScore={result.essentials.page_length ? Math.min(100, (result.essentials.page_length / 5000) * 100) : 0}
        commercialStrengthScore={copyScores[result.copy.level]}
        confidenceScore={riskScores[result.risk.level]}
        copyLevel={result.copy.level}
        riskLevel={result.risk.level}
        copyNotes={result.copy.notes}
        riskIssues={result.risk.issues}
      />

      <Card className="bg-[#0F1F1D] border border-neutral-800/50 shadow-md hover:shadow-lg transition-all rounded-xl p-6">
        <h3 className="text-lg font-semibold text-white mb-3">Resumo da Análise</h3>
        <p className="text-neutral-300 leading-relaxed">{result.summary.reason}</p>
      </Card>

      {result.copy.notes && result.copy.notes.length > 0 && (
        <Card className="bg-[#0F1F1D] border border-neutral-800/50 shadow-md hover:shadow-lg transition-all rounded-xl p-6">
          <h3 className="text-lg font-semibold text-white mb-3">Sinais Positivos</h3>
          <ul className="space-y-2">
            {result.copy.notes.map((note, idx) => (
              <li key={idx} className="flex gap-3">
                <span className="text-[#1BC1A1] font-bold">+</span>
                <span className="text-neutral-300">{note}</span>
              </li>
            ))}
          </ul>
        </Card>
      )}

      {result.risk.issues && result.risk.issues.length > 0 && (
        <Card className="bg-[#0F1F1D] border border-neutral-800/50 shadow-md hover:shadow-lg transition-all rounded-xl p-6">
          <h3 className="text-lg font-semibold text-white mb-3">Pontos de Atenção</h3>
          <ul className="space-y-2">
            {result.risk.issues.map((issue, idx) => (
              <li key={idx} className="flex gap-3">
                <span className="text-red-400 font-bold">!</span>
                <span className="text-neutral-300">{issue}</span>
              </li>
            ))}
          </ul>
        </Card>
      )}

      <Card className="bg-[#0F1F1D] border border-neutral-800/50 shadow-md hover:shadow-lg transition-all rounded-xl p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Dados Extraídos</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {result.essentials.price !== null && (<div><p className="text-xs text-neutral-400 mb-1 font-medium">Preço</p><p className="text-lg font-semibold text-[#1BC1A1]">R$ {result.essentials.price}</p></div>)}
          {result.essentials.installments !== null && (<div><p className="text-xs text-neutral-400 mb-1 font-medium">Parcelas</p><p className="text-lg font-semibold text-[#1BC1A1]">{result.essentials.installments}x</p></div>)}
          {result.essentials.guarantee !== null && (<div><p className="text-xs text-neutral-400 mb-1 font-medium">Garantia</p><p className="text-lg font-semibold text-[#1BC1A1]">{result.essentials.guarantee} dias</p></div>)}
          {result.essentials.page_length !== null && (<div><p className="text-xs text-neutral-400 mb-1 font-medium">Comprimento</p><p className="text-lg font-semibold text-[#1BC1A1]">{result.essentials.page_length} caracteres</p></div>)}
        </div>
      </Card>

      <Button onClick={handleExport} className="w-full bg-gradient-to-r from-[#1BC1A1] to-[#00927B] hover:from-[#1BC1A1]/80 hover:to-[#00927B]/80 text-white font-semibold" data-testid="button-export-analysis">
        Copiar para IA (Exportar)
      </Button>
    </div>
  );
}

export default function AnalysisDetail() {
  return <Suspense fallback={<Loader2 className="h-8 w-8 animate-spin" />}><AnalysisDetailContent /></Suspense>;
}
