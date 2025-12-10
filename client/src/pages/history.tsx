import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Filter, Download, Loader2, Eye } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/contexts/AuthContext";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { useState } from "react";
import { useAnalysisStore } from "@/store/analysis";

interface AnalysisResult {
  url: string;
  urlHash: string;
  title: string;
  price: number | null;
  platform: string;
  confidence: number;
  conversionScore: number;
  riskScore: number;
  overallScore: number;
}

interface HistoryItem {
  url_hash: string;
  url: string;
  analysis: AnalysisResult;
  created_at: string;
}

interface HistoryData {
  success: boolean;
  data: HistoryItem[];
  count: number;
}

export default function HistoryPage() {
  const { session } = useAuth();
  const [, setLocation] = useLocation();
  const [searchTerm, setSearchTerm] = useState("");
  const { setSelectedAnalysisId, setSelectedAnalysis } = useAnalysisStore();

  const { data: historyData, isLoading } = useQuery<HistoryData>({
    queryKey: ["/api/history"],
    enabled: true,
  });

  const analyses = historyData?.data ?? [];
  
  const filteredAnalyses = searchTerm
    ? analyses.filter(a => 
        a.analysis?.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        a.analysis?.platform?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        a.url?.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : analyses;

  const handleViewDetails = (urlHash: string) => {
    setSelectedAnalysis(null);
    setSelectedAnalysisId(urlHash);
    setLocation("/");
  };

  return (
    <Card className="bg-[#0F1F1D] border border-[#1BC1A1]/15 min-h-[600px]">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-6 gap-4 flex-wrap">
        <CardTitle className="text-xl text-white">Todas as Análises</CardTitle>
        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm" className="border-[#1BC1A1]/30 text-gray-300 hover:text-[#1BC1A1] hover:bg-[#1BC1A1]/10" data-testid="button-export">
            <Download className="mr-2 h-4 w-4" /> Exportar CSV
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
            <Input 
              placeholder="Buscar por título, plataforma ou URL..." 
              className="pl-10 bg-[#0B1615] border-[#1BC1A1]/20 text-white focus:border-[#1BC1A1]"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              data-testid="input-search"
            />
          </div>
          <div className="flex gap-3">
            <Button variant="outline" size="sm" className="gap-2 border-[#1BC1A1]/30 text-gray-300 hover:text-[#1BC1A1] hover:bg-[#1BC1A1]/10" data-testid="button-filter">
              <Filter className="h-4 w-4" /> Filtros
            </Button>
          </div>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center p-12" data-testid="loading-history">
            <Loader2 className="h-8 w-8 animate-spin text-[#1BC1A1]" />
          </div>
        ) : filteredAnalyses.length === 0 ? (
          <div className="text-center p-12 text-gray-400" data-testid="empty-history">
            {searchTerm ? "Nenhuma análise encontrada com esse termo" : "Nenhuma análise realizada ainda"}
          </div>
        ) : (
          <div className="rounded-md border border-[#1BC1A1]/15 overflow-hidden">
            <Table>
              <TableHeader className="bg-[#005A52]/30">
                <TableRow className="border-b-[#1BC1A1]/15 hover:bg-transparent">
                  <TableHead className="text-[#1BC1A1]">Título</TableHead>
                  <TableHead className="text-[#1BC1A1]">Plataforma</TableHead>
                  <TableHead className="text-[#1BC1A1]">Score</TableHead>
                  <TableHead className="text-[#1BC1A1]">Data</TableHead>
                  <TableHead className="text-[#1BC1A1]">Confiança</TableHead>
                  <TableHead className="text-right text-[#1BC1A1]">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredAnalyses.map((item) => (
                  <TableRow 
                    key={item.url_hash} 
                    className="border-b-[#1BC1A1]/10 hover:bg-[#1BC1A1]/5 transition-colors cursor-pointer"
                    onClick={() => handleViewDetails(item.url_hash)}
                    data-testid={`row-analysis-${item.url_hash}`}
                  >
                    <TableCell className="font-medium text-gray-200 max-w-[200px] truncate" data-testid={`text-title-${item.url_hash}`}>
                      {item.analysis?.title || "Oferta"}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="border-[#1BC1A1]/30 text-gray-300 bg-[#1BC1A1]/5" data-testid={`badge-platform-${item.url_hash}`}>
                        {item.analysis?.platform || "N/A"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <span className={`font-bold ${
                        (item.analysis?.overallScore || 0) >= 70 ? 'text-[#1BC1A1]' : 
                        (item.analysis?.overallScore || 0) >= 50 ? 'text-yellow-500' : 'text-red-400'
                      }`} data-testid={`text-score-${item.url_hash}`}>
                        {item.analysis?.overallScore || 0}
                      </span>
                    </TableCell>
                    <TableCell className="text-gray-400" data-testid={`text-date-${item.url_hash}`}>
                      {new Date(item.created_at).toLocaleDateString('pt-BR')}
                    </TableCell>
                    <TableCell>
                      <span className="inline-flex items-center gap-1.5 text-xs text-[#1BC1A1] font-medium bg-[#1BC1A1]/10 px-2 py-1 rounded-full" data-testid={`badge-confidence-${item.url_hash}`}>
                        <span className="h-1.5 w-1.5 rounded-full bg-[#1BC1A1]"></span>
                        {Math.round((item.analysis?.confidence || 0) * 100)}%
                      </span>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex gap-2 justify-end">
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="text-[#1BC1A1] hover:text-white hover:bg-[#1BC1A1]/10"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleViewDetails(item.url_hash);
                          }}
                          data-testid={`button-view-details-${item.url_hash}`}
                        >
                          <Eye className="h-4 w-4 mr-1" />
                          Ver Detalhes
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="text-gray-400 hover:text-white hover:bg-gray-700/10"
                          onClick={(e) => {
                            e.stopPropagation();
                            window.open(item.url, '_blank');
                          }}
                          data-testid={`button-view-url-${item.url_hash}`}
                        >
                          Ver URL
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
        
        {filteredAnalyses.length > 0 && (
          <div className="flex items-center justify-between pt-4">
            <p className="text-sm text-gray-400" data-testid="text-results-count">
              Mostrando {filteredAnalyses.length} de {analyses.length} análises
            </p>
            <div className="flex items-center space-x-2">
              <Button variant="outline" size="sm" disabled className="text-gray-500 border-gray-800" data-testid="button-prev-page">
                Anterior
              </Button>
              <Button variant="outline" size="sm" className="text-gray-300 border-[#1BC1A1]/30 hover:text-[#1BC1A1] hover:bg-[#1BC1A1]/10" data-testid="button-next-page">
                Próximo
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
