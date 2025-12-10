import type { ExtractedData } from '../extractors';

export interface ScoreResult {
  conversionScore: number;
  riskScore: number;
  overallScore: number;
  factors: {
    positive: string[];
    negative: string[];
    neutral: string[];
  };
}

export function calculateScores(data: ExtractedData): ScoreResult {
  const positive: string[] = [];
  const negative: string[] = [];
  const neutral: string[] = [];

  let conversionScore = 50;
  let riskScore = 50;

  if (data.price !== null) {
    if (data.price >= 47 && data.price <= 497) {
      conversionScore += 10;
      positive.push('Preço na faixa ideal para conversão');
    } else if (data.price < 47) {
      conversionScore += 5;
      neutral.push('Preço baixo pode indicar ticket menor');
    } else if (data.price > 997) {
      riskScore += 10;
      negative.push('Preço alto pode reduzir conversões');
    }
  }

  if (data.guarantee !== null) {
    if (data.guarantee >= 7) {
      conversionScore += 15;
      riskScore -= 10;
      positive.push(`Garantia de ${data.guarantee} dias aumenta confiança`);
    }
    if (data.guarantee >= 30) {
      conversionScore += 5;
      positive.push('Garantia estendida é excelente');
    }
  } else {
    riskScore += 15;
    negative.push('Sem garantia visível na página');
  }

  if (data.installments !== null && data.installments >= 3) {
    conversionScore += 10;
    positive.push(`Parcelamento em ${data.installments}x facilita compra`);
  }

  if (data.discount !== null && data.discount > 0) {
    if (data.discount >= 10 && data.discount <= 50) {
      conversionScore += 10;
      positive.push(`Desconto de ${data.discount}% pode aumentar urgência`);
    } else if (data.discount > 70) {
      riskScore += 15;
      negative.push('Desconto muito alto pode parecer suspeito');
    }
  }

  if (data.hasVideo) {
    conversionScore += 15;
    positive.push('Vídeo de vendas presente');
  } else {
    neutral.push('Sem vídeo de vendas detectado');
  }

  if (data.hasTestimonials) {
    conversionScore += 10;
    riskScore -= 5;
    positive.push('Depoimentos/provas sociais presentes');
  }

  if (data.hasFAQ) {
    conversionScore += 5;
    riskScore -= 5;
    positive.push('Seção de FAQ presente');
  }

  if (data.hasCountdown) {
    conversionScore += 5;
    neutral.push('Contador de urgência detectado');
  }

  if (data.hasBonuses) {
    conversionScore += 10;
    positive.push(`Bônus oferecidos (${data.bonusCount} detectados)`);
  }

  if (data.ctaCount > 3) {
    conversionScore += 5;
    positive.push('Múltiplos CTAs na página');
  } else if (data.ctaCount === 0) {
    riskScore += 10;
    negative.push('Poucos ou nenhum CTA detectado');
  }

  if (data.platform) {
    riskScore -= 10;
    positive.push(`Plataforma conhecida: ${data.platform}`);
  } else {
    riskScore += 10;
    negative.push('Plataforma não identificada');
  }

  if (data.imageCount > 5) {
    conversionScore += 5;
    positive.push('Página rica em imagens');
  }

  if (data.pageLength > 50000) {
    conversionScore += 5;
    neutral.push('Página longa (copy detalhada)');
  } else if (data.pageLength < 5000) {
    riskScore += 10;
    negative.push('Página muito curta');
  }

  conversionScore = Math.max(0, Math.min(100, conversionScore));
  riskScore = Math.max(0, Math.min(100, riskScore));

  const overallScore = Math.round((conversionScore * 0.6) + ((100 - riskScore) * 0.4));

  return {
    conversionScore: Math.round(conversionScore),
    riskScore: Math.round(riskScore),
    overallScore,
    factors: { positive, negative, neutral },
  };
}
