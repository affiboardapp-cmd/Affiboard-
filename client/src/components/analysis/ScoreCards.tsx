import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { CheckCircle2, AlertCircle, TrendingUp, FileText } from "lucide-react";

interface ScoreCardsProps {
  potentialScore?: number;
  pageQualityScore?: number;
  commercialStrengthScore?: number;
  confidenceScore?: number;
  copyLevel?: "strong" | "medium" | "weak";
  riskLevel?: "low" | "medium" | "high";
  copyNotes?: string[];
  riskIssues?: string[];
}

interface ScoreCard {
  id: string;
  title: string;
  subtitle: string;
  icon: React.ComponentType<{ className?: string }>;
  score?: number;
  level?: "strong" | "medium" | "weak" | "low" | "high";
  notes?: string[];
  description: string;
}

const getScoreColor = (score?: number) => {
  if (!score) return "bg-gray-600";
  if (score >= 75) return "bg-green-500";
  if (score >= 50) return "bg-yellow-500";
  return "bg-red-500";
};

const getScoreLabel = (score?: number) => {
  if (!score) return "Sem dados";
  if (score >= 75) return "Excelente";
  if (score >= 50) return "Bom";
  return "Precisa melhorar";
};

const getLevelColor = (level?: string) => {
  if (level === "strong" || level === "low") return "bg-green-500";
  if (level === "medium") return "bg-yellow-500";
  return "bg-red-500";
};

const getLevelLabel = (
  level?: "strong" | "medium" | "weak" | "low" | "high"
) => {
  const labels: Record<string, string> = {
    strong: "Forte",
    medium: "Médio",
    weak: "Fraco",
    low: "Baixo",
    high: "Alto",
  };
  return labels[level || ""] || "Indefinido";
};

export default function ScoreCards({
  potentialScore,
  pageQualityScore,
  commercialStrengthScore,
  confidenceScore,
  copyLevel,
  riskLevel,
  copyNotes = [],
  riskIssues = [],
}: ScoreCardsProps) {
  const cards: ScoreCard[] = [
    {
      id: "potential",
      title: "Potencial de Sucesso",
      subtitle: "Oportunidade da Oferta",
      icon: CheckCircle2,
      score: potentialScore,
      description:
        "Avalia se a oferta tem potencial real de conversão baseado nos fatores encontrados",
      notes: copyNotes,
    },
    {
      id: "quality",
      title: "Qualidade da Página",
      subtitle: "Estrutura & Tecnologia",
      icon: FileText,
      score: pageQualityScore,
      description:
        "Análise da qualidade técnica, design e experiência do usuário da página",
      notes: riskIssues,
    },
    {
      id: "commercial",
      title: "Força Comercial",
      subtitle: "Qualidade da Copy",
      icon: TrendingUp,
      level: copyLevel,
      description:
        "Avalia a persuasão, clareza e impacto do texto e mensagem principal",
      notes: copyNotes,
    },
    {
      id: "confidence",
      title: "Nível de Confiança",
      subtitle: "Segurança da Análise",
      icon: AlertCircle,
      level: riskLevel,
      description:
        "Mede quanto confiar nesta análise baseado na quantidade e qualidade dos dados",
      notes: riskIssues,
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full">
      {cards.map((card) => {
        const Icon = card.icon;
        const hasScore = card.score !== undefined;
        const hasLevel = card.level !== undefined;
        const colorClass = hasScore
          ? getScoreColor(card.score)
          : getLevelColor(card.level);

        return (
          <Card
            key={card.id}
            className="border border-neutral-800/50 bg-gradient-to-br from-[#0F1F1D] to-[#005A52]/10 hover:border-neutral-700 transition-all shadow-md hover:shadow-lg rounded-xl"
            data-testid={`card-score-${card.id}`}
          >
            <CardHeader className="pb-5 px-6 pt-6">
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <Icon className="h-5 w-5 text-[#1BC1A1]" />
                    <h3 className="text-sm font-semibold text-white uppercase tracking-wider">
                      {card.title}
                    </h3>
                  </div>
                  <p className="text-xs text-neutral-400 font-medium mb-3">{card.subtitle}</p>
                </div>
              </div>

              {/* Score or Level Display */}
              <div className="flex items-center gap-3 mb-4">
                {hasScore && (
                  <div className="flex-1">
                    <div className="h-2.5 bg-gray-700 rounded-full overflow-hidden">
                      <div
                        className={`h-full transition-all ${colorClass}`}
                        style={{ width: `${card.score}%` }}
                      />
                    </div>
                  </div>
                )}
                <div
                  className={`px-3 py-1 rounded-md text-sm font-semibold text-white ${colorClass} bg-opacity-90`}
                >
                  {hasScore ? `${card.score}%` : getLevelLabel(card.level)}
                </div>
              </div>

              <p className="text-xs text-neutral-400 leading-relaxed font-medium">
                {card.description}
              </p>
            </CardHeader>

            {/* Notes/Issues */}
            {card.notes && card.notes.length > 0 && (
              <CardContent className="px-6 pb-5">
                <div className="space-y-2 border-t border-neutral-800/50 pt-4">
                  {card.notes.slice(0, 2).map((note, idx) => (
                    <div key={idx} className="flex gap-2">
                      <div className="w-1 h-1 bg-[#1BC1A1] rounded-full flex-shrink-0 mt-1.5" />
                      <p className="text-xs text-neutral-400 leading-snug">
                        {note}
                      </p>
                    </div>
                  ))}
                  {card.notes.length > 2 && (
                    <p className="text-xs text-neutral-500 italic pt-1">
                      +{card.notes.length - 2} mais
                    </p>
                  )}
                </div>
              </CardContent>
            )}

            {/* Footer credibility text */}
            <div className="px-6 pb-5 pt-2">
              <p className="text-xs text-neutral-500 font-medium">
                Baseado em dados extraídos automaticamente
              </p>
            </div>
          </Card>
        );
      })}
    </div>
  );
}
