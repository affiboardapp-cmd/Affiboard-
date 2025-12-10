import { useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Search, Plus, Loader2, AlertCircle, Sparkles, ArrowRight, Eye } from "lucide-react";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/contexts/AuthContext";
import { useQuery } from "@tanstack/react-query";
import { useAnalysisStore, type AnalysisData } from "@/store/analysis";
import { AnalysisResultView } from "@/components/analysis/AnalysisResultView";
import { apiRequest } from "@/lib/queryClient";

interface AnalysisResult {
  url: string;
  urlHash: string;
  title: string;
  price: number | null;
  installments?: number | null;
  guarantee?: number | null;
  platform: string;
  confidence: number;
  conversionScore: number;
  riskScore: number;
  overallScore: number;
  factors?: {
    positive: string[];
    negative: string[];
    neutral: string[];
  };
}

interface HistoryItem {
  url_hash: string;
  url: string;
  analysis: AnalysisResult;
  created_at: string;
}

interface CreditsData {
  success: boolean;
  credits: number;
  plan_tier: string;
}

interface HistoryData {
  success: boolean;
  data: HistoryItem[];
  count: number;
}

export default function Dashboard() {
  const { session, user, profile } = useAuth();
  const [location] = useLocation();
  
  const { 
    selectedAnalysisId, 
    selectedAnalysis, 
    isLoadingAnalysis,
    setSelectedAnalysisId,
    setSelectedAnalysis,
    setIsLoadingAnalysis,
    clearSelection 
  } = useAnalysisStore();

  const { data: creditsData, isLoading: isLoadingCredits } = useQuery<CreditsData>({
    queryKey: ["/api/credits"],
    enabled: true,
  });

  const { data: historyData, isLoading: isLoadingHistory } = useQuery<HistoryData>({
    queryKey: ["/api/history"],
    enabled: true,
  });

  useEffect(() => {
    const fetchSelectedAnalysis = async () => {
      if (!selectedAnalysisId) return;
      if (selectedAnalysis) return;
      if (isLoadingHistory) return;
      
      setIsLoadingAnalysis(true);
      try {
        const response = await apiRequest("GET", `/api/analysis/${selectedAnalysisId}`);
        const data = await response.json();
        
        if (data.success && data.data) {
          setSelectedAnalysis({
            ...data.data,
            urlHash: selectedAnalysisId,
          });
        } else {
          console.error("[Dashboard] Failed to fetch analysis:", data.error);
          clearSelection();
        }
      } catch (error) {
        console.error("[Dashboard] Error fetching analysis:", error);
        clearSelection();
      } finally {
        setIsLoadingAnalysis(false);
      }
    };

    fetchSelectedAnalysis();
  }, [selectedAnalysisId, selectedAnalysis, isLoadingHistory]);

  const handleSelectAnalysis = (urlHash: string) => {
    if (selectedAnalysisId === urlHash) {
      clearSelection();
    } else {
      setSelectedAnalysis(null);
      setSelectedAnalysisId(urlHash);
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const credits = creditsData?.credits ?? 0;
  const analyses = historyData?.data ?? [];

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {isLoadingAnalysis && (
        <Card className="border border-[#1BC1A1]/30 bg-gradient-to-br from-[#1BC1A1]/10 to-[#005A52]/5 shadow-md">
          <CardContent className="p-8 flex items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-[#1BC1A1]" />
            <span className="ml-3 text-gray-400">Carregando análise...</span>
          </CardContent>
        </Card>
      )}

      {selectedAnalysis && !isLoadingAnalysis && (
        <AnalysisResultView 
          analysis={selectedAnalysis} 
          onClose={clearSelection}
          showCloseButton={true}
          creditsLeft={credits}
        />
      )}

      <Card className="border border-neutral-800/50 bg-gradient-to-br from-[#1BC1A1]/10 to-[#005A52]/5 shadow-md hover:shadow-lg transition-all rounded-xl">
        <CardContent className="p-6">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <p className="text-neutral-400 text-sm mb-2 font-medium">Seus Créditos</p>
              <div className="flex items-center gap-3">
                {isLoadingCredits ? (
                  <Loader2 className="h-10 w-10 animate-spin text-[#1BC1A1]" />
                ) : (
                  <>
                    <h2 className="text-5xl font-semibold text-white" data-testid="text-credits">{credits}</h2>
                    <Badge className="bg-[#1BC1A1] text-white text-sm px-3 py-1 font-semibold">
                      Disponível
                    </Badge>
                  </>
                )}
              </div>
            </div>
            <Button asChild className="bg-[#1BC1A1] hover:bg-[#00927B] text-white font-semibold" size="lg" data-testid="button-recharge">
              <Link href="/credits">Recarregar Créditos</Link>
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card className="border border-neutral-800/50 bg-gradient-to-br from-[#1BC1A1]/20 to-[#005A52]/10 hover:border-neutral-700 transition-all shadow-md hover:shadow-lg rounded-xl">
        <CardContent className="p-6">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <h3 className="text-xl font-semibold text-white mb-1">Pronto para analisar?</h3>
              <p className="text-neutral-400">Descubra o potencial de conversão da sua próxima oferta em segundos.</p>
            </div>
            <Button asChild className="bg-[#1BC1A1] hover:bg-[#00927B] text-white font-semibold" size="lg" data-testid="button-new-analysis">
              <Link href="/new-analysis">
                <Search className="mr-2 h-5 w-5" />
                Nova Análise
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-white">Últimas Análises</h2>
          {analyses.length > 3 && (
            <Button variant="ghost" asChild className="text-[#1BC1A1] hover:text-white hover:bg-[#1BC1A1]/10" data-testid="button-view-all">
              <Link href="/history">Ver Todas</Link>
            </Button>
          )}
        </div>

        {isLoadingHistory ? (
          <div className="flex items-center justify-center p-12" data-testid="loading-recent-analyses">
            <Loader2 className="h-6 w-6 animate-spin text-[#1BC1A1]" />
          </div>
        ) : analyses.length === 0 ? (
          <Card className="bg-[#0F1F1D]/50 border border-neutral-800/50 p-6 text-center rounded-xl shadow-md" data-testid="empty-analyses">
            <AlertCircle className="h-8 w-8 text-gray-500 mx-auto mb-3" />
            <p className="text-neutral-400 mb-4 font-medium">Você ainda não realizou nenhuma análise</p>
            <Button asChild className="bg-[#1BC1A1] hover:bg-[#00927B] text-white">
              <Link href="/new-analysis">
                <Plus className="mr-2 h-4 w-4" />
                Fazer Primeira Análise
              </Link>
            </Button>
          </Card>
        ) : (
          <div className="grid gap-3">
            {analyses.slice(0, 5).map((item) => (
              <div
                key={item.url_hash}
                className={`group bg-[#0F1F1D] border rounded-xl p-5 hover:shadow-md transition-all flex items-center justify-between shadow-sm cursor-pointer ${
                  selectedAnalysisId === item.url_hash 
                    ? 'border-[#1BC1A1] bg-[#1BC1A1]/5' 
                    : 'border-neutral-800/50 hover:border-neutral-700'
                }`}
                onClick={() => handleSelectAnalysis(item.url_hash)}
                data-testid={`card-analysis-${item.url_hash}`}
              >
                <div className="flex-1">
                  <h3 className="font-semibold text-white group-hover:text-[#1BC1A1] transition-colors truncate" data-testid={`text-title-${item.url_hash}`}>
                    {item.analysis?.title || "Oferta"}
                  </h3>
                  <p className="text-sm text-neutral-400 mt-1" data-testid={`text-date-${item.url_hash}`}>
                    {new Date(item.created_at).toLocaleDateString('pt-BR', { day: 'numeric', month: 'short' })}
                  </p>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <span className="text-xs text-gray-400 block">Potencial</span>
                    <span className={`text-lg font-bold ${
                      (item.analysis?.overallScore || 0) >= 70 ? 'text-[#1BC1A1]' :
                      (item.analysis?.overallScore || 0) >= 50 ? 'text-yellow-500' : 'text-red-400'
                    }`} data-testid={`text-score-${item.url_hash}`}>
                      {item.analysis?.overallScore || 0}%
                    </span>
                  </div>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="text-gray-500 hover:text-white hover:bg-[#1BC1A1]/20" 
                    onClick={(e) => {
                      e.stopPropagation();
                      handleSelectAnalysis(item.url_hash);
                    }}
                    data-testid={`button-view-${item.url_hash}`}
                  >
                    <Eye className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <Card className="border border-neutral-800/50 bg-[#005A52]/5 backdrop-blur-sm shadow-md hover:shadow-lg transition-all rounded-xl">
        <CardContent className="p-6">
          <div className="flex items-start gap-4">
            <Sparkles className="h-5 w-5 text-[#1BC1A1]/50 flex-shrink-0 mt-1" />
            <div className="flex-1">
              <h3 className="text-white font-semibold mb-2">Em breve</h3>
              <p className="text-sm text-neutral-400">
                Análise de tendências, monitoramento de anúncios, análise de concorrência e muito mais! Estamos trabalhando para tornar AffiBoard ainda mais poderoso.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
