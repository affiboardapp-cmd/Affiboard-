import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2 } from "lucide-react";

const MESSAGES = [
  "Carregando dados…",
  "Extraindo informações da página…",
  "Calculando scores…",
  "Preparando relatório…",
];

interface LoadingProgressProps {
  isVisible?: boolean;
}

export function LoadingProgress({ isVisible = true }: LoadingProgressProps) {
  const [progress, setProgress] = useState(0);
  const [messageIndex, setMessageIndex] = useState(0);

  useEffect(() => {
    if (!isVisible) return;

    // Progress bar animation
    const progressInterval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 95) return prev;
        return prev + Math.random() * 20;
      });
    }, 300);

    // Message rotation
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
    <Card className="bg-[#0F1F1D] border border-[#1BC1A1]/15" data-testid="card-loading-progress">
      <CardContent className="p-8 space-y-6">
        <div className="flex items-center justify-center gap-3">
          <Loader2 className="h-6 w-6 animate-spin text-[#1BC1A1]" />
          <p className="text-lg font-semibold text-white">{MESSAGES[messageIndex]}</p>
        </div>

        <div className="space-y-2">
          <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-[#1BC1A1] to-[#00927B] transition-all duration-500 ease-out rounded-full shadow-lg shadow-[#1BC1A1]/30"
              style={{ width: `${Math.min(progress, 100)}%` }}
              data-testid="progress-bar"
            />
          </div>
          <p className="text-xs text-gray-400 text-center">{Math.round(progress)}%</p>
        </div>

        <p className="text-sm text-gray-400 text-center">
          Não feche a aba. Pode levar até 30 segundos…
        </p>
      </CardContent>
    </Card>
  );
}
