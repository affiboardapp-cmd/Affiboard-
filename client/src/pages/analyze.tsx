import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Search, CheckCircle2, AlertCircle, TrendingUp, AlertTriangle, Coins, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { analyzeOffer } from "@/lib/api";
import { LoadingProgress } from "@/components/analysis/LoadingProgress";
import type { AnalysisResult } from "@/lib/supabase";

interface AnalysisResponse {
  success: boolean;
  data?: AnalysisResult;
  error?: string;
  cached?: boolean;
  credits_used?: number;
  credits_remaining?: number;
}

export default function AnalyzePage() {
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<AnalysisResponse | null>(null);
  const { toast } = useToast();
  const { refreshProfile } = useAuth();

  const handleAnalyze = async () => {
    if (!url.trim()) {
      toast({
        variant: "destructive",
        title: "URL obrigatória",
        description: "Insira uma URL válida antes de analisar.",
      });
      return;
    }

    setLoading(true);
    setResult(null);

    try {
      const response = await analyzeOffer(url);
      setResult(response);
      
      if (response.success) {
        toast({
          title: response.cached ? "Análise do cache" : "Análise concluída",
          description: response.cached 
            ? "Resultado recuperado do cache (sem consumo de créditos)" 
            : `Análise realizada com sucesso. ${response.credits_used} crédito(s) usado(s).`,
        });
        refreshProfile();
      } else {
        toast({
          variant: "destructive",
          title: "Erro na análise",
          description: response.error || "Não foi possível analisar a oferta.",
        });
      }
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Erro",
        description: error.message || "Erro ao processar análise.",
      });
      setResult({ success: false, error: error.message });
    } finally {
      setLoading(false);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 70) return "text-green-600";
    if (score >= 50) return "text-yellow-600";
    return "text-red-600";
  };

  const getScoreBadgeVariant = (score: number): "default" | "secondary" | "destructive" => {
    if (score >= 70) return "default";
    if (score >= 50) return "secondary";
    return "destructive";
  };

  return (
    <div className="max-w-4xl mx-auto pt-10 px-5 pb-10">
      <Card className="shadow-md hover:shadow-lg transition-all border border-neutral-800/50 bg-white/60 backdrop-blur-sm rounded-xl">
        <CardHeader>
          <CardTitle className="text-2xl font-semibold text-gray-900">
            Analisar Oferta
          </CardTitle>
          <CardDescription className="text-neutral-400">
            Cole a URL da página de vendas para gerar uma análise inteligente.
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <Input
              placeholder="https://exemplo.com/oferta"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              disabled={loading}
              className="flex-1"
              data-testid="input-url"
            />

            <Button 
              onClick={handleAnalyze} 
              disabled={loading} 
              className="gap-2"
              data-testid="button-analyze"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Analisando...
                </>
              ) : (
                <>
                  <Search className="h-4 w-4" />
                  Analisar
                </>
              )}
            </Button>
          </div>

          {loading && <LoadingProgress isVisible={loading} data-testid="loading-progress" />}

          {result && !result.success && (
            <Card className="p-6 bg-red-50 border border-neutral-800/50 rounded-xl shadow-md">
              <div className="flex items-start gap-3">
                <AlertCircle className="h-5 w-5 text-red-600 mt-1" />
                <div>
                  <h3 className="font-semibold text-red-900">Erro na análise</h3>
                  <p className="text-sm mt-1 text-red-800">{result.error}</p>
                </div>
              </div>
            </Card>
          )}

          {result?.success && result.data && (
            <div className="space-y-4">
              <Card className="p-6 bg-green-50 border border-neutral-800/50 rounded-xl shadow-md">
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="h-5 w-5 text-green-600 mt-1" />
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <h3 className="font-semibold text-green-900">Análise concluída</h3>
                      {result.cached && (
                        <Badge variant="outline" className="text-xs">Do cache</Badge>
                      )}
                    </div>
                    <p className="text-sm mt-1 text-green-800">
                      {result.data.title || "Oferta analisada"}
                    </p>
                    {result.data.platform && (
                      <Badge className="mt-2" variant="secondary">
                        {result.data.platform.charAt(0).toUpperCase() + result.data.platform.slice(1)}
                      </Badge>
                    )}
                  </div>
                </div>
              </Card>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="p-6 shadow-md hover:shadow-lg transition-all border border-neutral-800/50 rounded-xl">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-muted-foreground">Conversão</span>
                    <TrendingUp className={`h-4 w-4 ${getScoreColor(result.data.conversionScore)}`} />
                  </div>
                  <div className={`text-2xl font-bold ${getScoreColor(result.data.conversionScore)}`}>
                    {result.data.conversionScore}/100
                  </div>
                  <Progress value={result.data.conversionScore} className="mt-2 h-2" />
                </Card>

                <Card className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-muted-foreground">Risco</span>
                    <AlertTriangle className={`h-4 w-4 ${getScoreColor(100 - result.data.riskScore)}`} />
                  </div>
                  <div className={`text-2xl font-bold ${getScoreColor(100 - result.data.riskScore)}`}>
                    {result.data.riskScore}/100
                  </div>
                  <Progress value={result.data.riskScore} className="mt-2 h-2" />
                </Card>

                <Card className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-muted-foreground">Score Geral</span>
                    <TrendingUp className={`h-4 w-4 ${getScoreColor(result.data.overallScore)}`} />
                  </div>
                  <div className={`text-2xl font-bold ${getScoreColor(result.data.overallScore)}`}>
                    {result.data.overallScore}/100
                  </div>
                  <Progress value={result.data.overallScore} className="mt-2 h-2" />
                </Card>
              </div>

              <Card className="p-4">
                <h4 className="font-semibold mb-3">Informações da Oferta</h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  {result.data.price && (
                    <div>
                      <span className="text-muted-foreground">Preço</span>
                      <p className="font-semibold">R$ {result.data.price.toFixed(2)}</p>
                    </div>
                  )}
                  {result.data.guarantee && (
                    <div>
                      <span className="text-muted-foreground">Garantia</span>
                      <p className="font-semibold">{result.data.guarantee} dias</p>
                    </div>
                  )}
                  {result.data.installments && (
                    <div>
                      <span className="text-muted-foreground">Parcelamento</span>
                      <p className="font-semibold">{result.data.installments}x</p>
                    </div>
                  )}
                  <div>
                    <span className="text-muted-foreground">Confiança</span>
                    <p className="font-semibold">{Math.round(result.data.confidence * 100)}%</p>
                  </div>
                </div>
              </Card>

              {result.data.factors && (
                <Card className="p-4">
                  <h4 className="font-semibold mb-3">Fatores da Análise</h4>
                  <div className="space-y-3">
                    {result.data.factors.positive.length > 0 && (
                      <div>
                        <span className="text-sm font-medium text-green-700">Pontos positivos:</span>
                        <ul className="mt-1 space-y-1">
                          {result.data.factors.positive.map((factor, i) => (
                            <li key={i} className="text-sm text-green-600 flex items-center gap-2">
                              <CheckCircle2 className="h-3 w-3" />
                              {factor}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                    {result.data.factors.negative.length > 0 && (
                      <div>
                        <span className="text-sm font-medium text-red-700">Pontos de atenção:</span>
                        <ul className="mt-1 space-y-1">
                          {result.data.factors.negative.map((factor, i) => (
                            <li key={i} className="text-sm text-red-600 flex items-center gap-2">
                              <AlertCircle className="h-3 w-3" />
                              {factor}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                    {result.data.factors.neutral.length > 0 && (
                      <div>
                        <span className="text-sm font-medium text-gray-700">Observações:</span>
                        <ul className="mt-1 space-y-1">
                          {result.data.factors.neutral.map((factor, i) => (
                            <li key={i} className="text-sm text-gray-600 flex items-center gap-2">
                              <AlertTriangle className="h-3 w-3" />
                              {factor}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </Card>
              )}

              {result.credits_remaining !== undefined && (
                <div className="flex items-center justify-end gap-2 text-sm text-muted-foreground">
                  <Coins className="h-4 w-4" />
                  <span>Créditos restantes: {result.credits_remaining}</span>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
