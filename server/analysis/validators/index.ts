import type { ExtractedData } from '../extractors';

export interface ValidationResult {
  isValid: boolean;
  confidence: number;
  errors: string[];
  warnings: string[];
  fieldsExtracted: number;
  fieldsRequired: number;
}

const REQUIRED_FIELDS = ['title', 'price'] as const;
const OPTIONAL_FIELDS = ['guarantee', 'installments', 'platform', 'originalPrice', 'discount'] as const;

export function validateExtractedData(data: ExtractedData): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];
  let fieldsExtracted = 0;
  const fieldsRequired = REQUIRED_FIELDS.length + OPTIONAL_FIELDS.length;

  if (!data.title || data.title.length < 10) {
    errors.push('Título inválido ou muito curto (mínimo 10 caracteres)');
  } else {
    fieldsExtracted++;
  }

  if (!data.price || data.price <= 0) {
    errors.push('Preço não encontrado ou inválido');
  } else if (data.price < 1) {
    warnings.push('Preço muito baixo, pode ser incorreto');
    fieldsExtracted++;
  } else if (data.price > 50000) {
    warnings.push('Preço muito alto, verificar se está correto');
    fieldsExtracted++;
  } else {
    fieldsExtracted++;
  }

  if (data.guarantee !== null) {
    if (data.guarantee < 1 || data.guarantee > 365) {
      warnings.push('Garantia com valor incomum');
    }
    fieldsExtracted++;
  }

  if (data.installments !== null) {
    if (data.installments < 1 || data.installments > 24) {
      warnings.push('Parcelamento com valor incomum');
    }
    fieldsExtracted++;
  }

  if (data.platform !== null) {
    fieldsExtracted++;
  }

  if (data.originalPrice !== null) {
    fieldsExtracted++;
  }

  if (data.discount !== null) {
    fieldsExtracted++;
  }

  const confidence = calculateConfidence(data, errors, warnings);
  const isValid = errors.length === 0 && confidence >= 0.5;

  return {
    isValid,
    confidence,
    errors,
    warnings,
    fieldsExtracted,
    fieldsRequired,
  };
}

function calculateConfidence(data: ExtractedData, errors: string[], warnings: string[]): number {
  let score = 0;
  const weights = {
    title: 0.25,
    price: 0.25,
    guarantee: 0.10,
    installments: 0.10,
    platform: 0.10,
    hasVideo: 0.05,
    hasTestimonials: 0.05,
    hasFAQ: 0.05,
    ctaCount: 0.05,
  };

  if (data.title && data.title.length >= 10) score += weights.title;
  if (data.price && data.price > 0) score += weights.price;
  if (data.guarantee && data.guarantee > 0) score += weights.guarantee;
  if (data.installments && data.installments > 0) score += weights.installments;
  if (data.platform) score += weights.platform;
  if (data.hasVideo) score += weights.hasVideo;
  if (data.hasTestimonials) score += weights.hasTestimonials;
  if (data.hasFAQ) score += weights.hasFAQ;
  if (data.ctaCount > 0) score += weights.ctaCount;

  score -= errors.length * 0.15;
  score -= warnings.length * 0.05;

  return Math.max(0, Math.min(1, score));
}
