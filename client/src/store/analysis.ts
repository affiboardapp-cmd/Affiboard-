import { create } from 'zustand';

export interface AnalysisData {
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
  factors?: {
    positive: string[];
    negative: string[];
    neutral: string[];
  };
  created_at?: string;
}

interface AnalysisStore {
  selectedAnalysisId: string | null;
  selectedAnalysis: AnalysisData | null;
  isLoadingAnalysis: boolean;
  
  setSelectedAnalysisId: (id: string | null) => void;
  setSelectedAnalysis: (analysis: AnalysisData | null) => void;
  setIsLoadingAnalysis: (loading: boolean) => void;
  clearSelection: () => void;
}

export const useAnalysisStore = create<AnalysisStore>((set) => ({
  selectedAnalysisId: null,
  selectedAnalysis: null,
  isLoadingAnalysis: false,
  
  setSelectedAnalysisId: (id) => set({ selectedAnalysisId: id }),
  setSelectedAnalysis: (analysis) => set({ selectedAnalysis: analysis }),
  setIsLoadingAnalysis: (loading) => set({ isLoadingAnalysis: loading }),
  clearSelection: () => set({ 
    selectedAnalysisId: null, 
    selectedAnalysis: null,
    isLoadingAnalysis: false 
  }),
}));
