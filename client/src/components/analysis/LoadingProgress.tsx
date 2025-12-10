import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2 } from "lucide-react";

const MESSAGES = [
  "Carregando dados…",
  "Extraindo informações…",
  "Calculando scores…",
  "Gerando relatório…",
];

interface LoadingProgressProps {
  isVisible?: boolean;
}

export function LoadingProgress({ isVisible = true }: LoadingProgressProps) {
  const [progress, setProgress] = useState(0);
  const [messageIndex, setMessageIndex] = useState(0);

  useEffect(() => {
    if (!isVisible) return;

    // Progress bar animation - 0→100% in ~2s with natural variation
    const progressInterval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 95) return prev; // Stay at 95% until complete
        const increment = Math.random() * 25 + 10; // 10-35% per step
        return Math.min(prev + increment, 95);
      });
    }, 200); // Update every 200ms

    // Message rotation every 1.5s (4 messages = 6s total)
    const messageInterval = setInterval(() => {
      setMessageIndex((prev) => (prev + 1) % MESSAGES.length);
    }, 1500);

    return () => {
      clearInterval(progressInterval);
      clearInterval(messageInterval);
    };
  }, [isVisible]);

  if (!isVisible) return null;

  return (
    <Card
      className="border-[#1BC1A1]/20 bg-gradient-to-br from-[#0F1F1D] to-[#005A52]/10 hover:border-[#1BC1A1]/40 transition-all"
      data-testid="card-loading-progress"
    >
      <CardContent className="p-8 space-y-6">
        {/* Icon + Message */}
        <div className="flex items-center justify-center gap-3">
          <Loader2 className="h-6 w-6 animate-spin text-[#1BC1A1]" />
          <p className="text-lg font-semibold text-white">
            {MESSAGES[messageIndex]}
          </p>
        </div>

        {/* Progress Bar */}
        <div className="space-y-2">
          <div className="h-3 bg-gray-700 rounded-full overflow-hidden border border-[#1BC1A1]/20">
            <div
              className="h-full bg-gradient-to-r from-[#1BC1A1] via-[#00927B] to-[#005A52] transition-all duration-300 ease-out rounded-full shadow-lg shadow-[#1BC1A1]/40"
              style={{ width: `${Math.min(progress, 100)}%` }}
              data-testid="progress-bar"
            />
          </div>
          <div className="flex items-center justify-between px-1">
            <span className="text-xs text-gray-400">Processando...</span>
            <span className="text-xs font-semibold text-[#1BC1A1]">
              {Math.round(progress)}%
            </span>
          </div>
        </div>

        {/* Info Text */}
        <p className="text-sm text-gray-400 text-center leading-relaxed">
          Analisando a página. Pode levar alguns segundos…
        </p>
      </CardContent>
    </Card>
  );
}
