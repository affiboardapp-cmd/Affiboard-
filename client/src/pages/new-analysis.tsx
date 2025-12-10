import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Loader2, CheckCircle, AlertCircle, TrendingUp, Shield, Percent, Package, Eye } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { Link, useLocation } from "wouter";
import { LoadingProgress } from "@/components/LoadingProgress";
import { useAnalysisStore } from "@/store/analysis";

interface AnalysisResult {
  url: string;
  urlHash: string;
  title: string;
  price: number | null;
  guarantee: string | null;
  installments: string | null;
  platform: string;
  confidence: number;
  conversionScore: number;
  riskScore: number;
  overallScore: number;
  factors: {
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

export default function NewAnalysis() {
  const [url, setUrl] = useState("");
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [step, setStep] = useState(0);
  const { session } = useAuth();
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const { setSelectedAnalysisId, setSelectedAnalysis } = useAnalysisStore();

  const { data: historyData } = useQuery<{ success: boolean; data: HistoryItem[] }>({
    queryKey: ["/api/history"],
    enabled: true,
  });

  const analyzeMutation = useMutation({
    mutationFn: async (urlToAnalyze: string) => {
      setStep(1);
      const response = await apiRequest("POST", "/api/analyze", { url: urlToAnalyze });
      return response.json();
    },
    onSuccess: (data) => {
      if (data.success) {
        setStep(4);
        setResult(data.data);
        toast({
          title: "Análise concluída!",
          description: "Resultado pronto para análise",
        });
        queryClient.invalidateQueries({ queryKey: ["/api/history"] });
        queryClient.invalidateQueries({ queryKey: ["/api/credits"] });
        
        setTimeout(() => {
          if (data.data.urlHash) {
            setSelectedAnalysis(null);
            setSelectedAnalysisId(data.data.urlHash);
            setLocation("/");
          }
        }, 1000);
      } else {
        toast({
          title: "Erro na análise",
          description: data.error || "Não foi possível analisar a URL",
          variant: "destructive",
        });
        setStep(0);
      }
    },
    onError: (error: Error) => {
      toast({
        title: "Erro",
        description: error.message,
        variant: "destructive",
      });
      setStep(0);
    },
  });

  const handleAnalyze = (e: React.FormEvent) => {
    e.preventDefault();
    if (!url.trim()) return;
    setResult(null);
    analyzeMutation.mutate(url);
  };

  const handleViewRecentAnalysis = (urlHash: string) => {
    setSelectedAnalysis(null);
    setSelectedAnalysisId(urlHash);
    setLocation("/");
  };

  const recentAnalyses = historyData?.data?.slice(0, 3) || [];

  return (
    <div className="space-y-8">
      <Card className="bg-[#0F1F1D] border border-[#1BC1A1]/15">
        <CardHeader>
          <CardTitle className="text-white">Analisar Nova Oferta</CardTitle>
          <CardDescription className="text-gray-400">
            Cole a URL de uma página de vendas para analisar o potencial de conversão
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleAnalyze} className="flex gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-500" />
              <Input
                type="url"
                placeholder="https://exemplo.com/pagina-de-vendas"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                disabled={analyzeMutation.isPending}
                className="pl-10 bg-[#0B1615] border-[#1BC1A1]/20 text-white focus:border-[#1BC1A1]"
                data-testid="input-url"
              />
            </div>
            <Button
              type="submit"
              size="lg"
              disabled={analyzeMutation.isPending || !url.trim()}
              className="bg-[#1BC1A1] hover:bg-[#00927B] text-white"
              data-testid="button-analyze"
            >
              {analyzeMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Analisando...
                </>
              ) : (
                "Analisar"
              )}
            </Button>
          </form>
        </CardContent>
      </Card>

      {analyzeMutation.isPending && (
        <LoadingProgress isVisible={true} />
      )}

      {result && !analyzeMutation.isPending && (
        <div className="space-y-6" data-testid="analysis-results">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <ScoreCard
              title="Score Geral"
              value={result.overallScore}
              icon={TrendingUp}
              testId="score-overall"
            />
            <ScoreCard
              title="Conversão"
              value={result.conversionScore}
              icon={Percent}
              testId="score-conversion"
            />
            <ScoreCard
              title="Segurança"
              value={100 - result.riskScore}
              icon={Shield}
              testId="score-security"
            />
            <ScoreCard
              title="Confiança"
              value={Math.round(result.confidence * 100)}
              icon={CheckCircle}
              testId="score-confidence"
            />
          </div>

          <Card className="bg-[#0F1F1D] border border-[#1BC1A1]/15">
            <CardHeader>
              <CardTitle className="text-white" data-testid="text-offer-title">{result.title || "Oferta"}</CardTitle>
              <CardDescription className="text-gray-400">
                Plataforma: <span className="text-[#1BC1A1]" data-testid="text-platform">{result.platform}</span>
                {result.price && (
                  <> • Preço: <span className="text-[#1BC1A1]" data-testid="text-price">R$ {result.price.toFixed(2)}</span></>
                )}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {result.factors && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {result.factors.positive?.length > 0 && (
                    <div className="space-y-2" data-testid="factors-positive">
                      <h4 className="text-sm font-medium text-[#1BC1A1] flex items-center gap-2">
                        <CheckCircle className="h-4 w-4" />
                        Pontos Positivos
                      </h4>
                      <ul className="space-y-1">
                        {result.factors.positive.map((factor, i) => (
                          <li key={i} className="text-sm text-gray-300">• {factor}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {result.factors.negative?.length > 0 && (
                    <div className="space-y-2" data-testid="factors-negative">
                      <h4 className="text-sm font-medium text-red-400 flex items-center gap-2">
                        <AlertCircle className="h-4 w-4" />
                        Pontos de Atenção
                      </h4>
                      <ul className="space-y-1">
                        {result.factors.negative.map((factor, i) => (
                          <li key={i} className="text-sm text-gray-300">• {factor}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {result.factors.neutral?.length > 0 && (
                    <div className="space-y-2" data-testid="factors-neutral">
                      <h4 className="text-sm font-medium text-yellow-500 flex items-center gap-2">
                        <Package className="h-4 w-4" />
                        Observações
                      </h4>
                      <ul className="space-y-1">
                        {result.factors.neutral.map((factor, i) => (
                          <li key={i} className="text-sm text-gray-300">• {factor}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {!result && recentAnalyses.length > 0 && (
        <Card className="bg-[#0F1F1D] border border-[#1BC1A1]/15">
          <CardHeader className="flex flex-row items-center justify-between gap-4 flex-wrap">
            <CardTitle className="text-white text-lg">Análises Recentes</CardTitle>
            <Button variant="outline" size="sm" asChild className="border-[#1BC1A1]/30 text-[#1BC1A1] hover:bg-[#1BC1A1]/10" data-testid="button-view-history">
              <Link href="/history">Ver todas</Link>
            </Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentAnalyses.map((item) => (
                <div 
                  key={item.url_hash}
                  className="flex items-center justify-between p-3 rounded-lg bg-[#0B1615] border border-[#1BC1A1]/10 hover:border-[#1BC1A1]/30 transition-colors cursor-pointer"
                  onClick={() => handleViewRecentAnalysis(item.url_hash)}
                  data-testid={`recent-analysis-${item.url_hash}`}
                >
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-lg bg-[#1BC1A1]/10 flex items-center justify-center">
                      <span className="text-xs font-bold text-[#1BC1A1]">
                        {item.analysis?.platform?.slice(0, 2).toUpperCase() || "??"}
                      </span>
                    </div>
                    <div>
                      <p className="font-medium text-white truncate max-w-[200px]">{item.analysis?.title || "Oferta"}</p>
                      <p className="text-xs text-gray-500">{new Date(item.created_at).toLocaleDateString('pt-BR')}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className={`text-lg font-bold ${
                      (item.analysis?.overallScore || 0) >= 70 ? 'text-[#1BC1A1]' : 
                      (item.analysis?.overallScore || 0) >= 50 ? 'text-yellow-500' : 'text-red-400'
                    }`}>
                      {item.analysis?.overallScore || 0}
                    </div>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="text-gray-500 hover:text-white hover:bg-[#1BC1A1]/20"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleViewRecentAnalysis(item.url_hash);
                      }}
                      data-testid={`button-view-recent-${item.url_hash}`}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
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
