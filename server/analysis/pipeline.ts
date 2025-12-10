import axios from 'axios';
import * as cheerio from 'cheerio';
import crypto from 'crypto';
import { extractFromHtml, type ExtractedData } from './extractors';
import { validateExtractedData, type ValidationResult } from './validators';
import { calculateScores, type ScoreResult } from './scorers';

const USER_AGENTS = [
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:121.0) Gecko/20100101 Firefox/121.0',
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.2 Safari/605.1.15',
];

export interface PipelineResult {
  success: boolean;
  data: {
    url: string;
    urlHash: string;
    title: string | null;
    price: number | null;
    guarantee: number | null;
    installments: number | null;
    platform: string | null;
    confidence: number;
    conversionScore: number;
    riskScore: number;
    overallScore: number;
    factors: ScoreResult['factors'];
    extractedData: ExtractedData;
    validation: ValidationResult;
  } | null;
  error: string | null;
  source: 'firecrawl' | 'fallback' | 'cache';
}

export function normalizeUrl(url: string): string {
  try {
    const parsed = new URL(url);
    parsed.hash = '';
    const params = new URLSearchParams(parsed.search);
    ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term', 'fbclid', 'gclid', 'ref', 'src'].forEach(p => params.delete(p));
    parsed.search = params.toString();
    return parsed.toString().replace(/\/$/, '');
  } catch {
    return url;
  }
}

export function hashUrl(url: string): string {
  const normalized = normalizeUrl(url);
  return crypto.createHash('sha256').update(normalized).digest('hex').substring(0, 16);
}

function getRandomUserAgent(): string {
  return USER_AGENTS[Math.floor(Math.random() * USER_AGENTS.length)];
}

async function fetchWithFirecrawl(url: string): Promise<string | null> {
  const firecrawlKey = process.env.FIRECRAWL_API_KEY;
  if (!firecrawlKey) {
    console.log('[Pipeline] Firecrawl API key não configurada, usando fallback');
    return null;
  }

  try {
    const response = await axios.post(
      'https://api.firecrawl.dev/v0/scrape',
      {
        url,
        pageOptions: {
          onlyMainContent: false,
          includeHtml: true,
        },
      },
      {
        headers: {
          'Authorization': `Bearer ${firecrawlKey}`,
          'Content-Type': 'application/json',
        },
        timeout: 15000,
      }
    );

    if (response.data?.success && response.data?.data?.html) {
      console.log('[Pipeline] Firecrawl: sucesso');
      return response.data.data.html;
    }

    console.log('[Pipeline] Firecrawl: resposta sem HTML');
    return null;
  } catch (error: any) {
    console.log('[Pipeline] Firecrawl falhou:', error.message);
    return null;
  }
}

async function fetchWithFallback(url: string): Promise<string | null> {
  try {
    const response = await axios.get(url, {
      headers: {
        'User-Agent': getRandomUserAgent(),
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'pt-BR,pt;q=0.9,en-US;q=0.8,en;q=0.7',
        'Accept-Encoding': 'gzip, deflate, br',
        'Connection': 'keep-alive',
        'Upgrade-Insecure-Requests': '1',
      },
      timeout: 10000,
      maxRedirects: 5,
      validateStatus: (status) => status < 400,
    });

    if (typeof response.data === 'string' && response.data.length > 0) {
      console.log('[Pipeline] Fallback scraper: sucesso');
      return response.data;
    }

    return null;
  } catch (error: any) {
    console.log('[Pipeline] Fallback scraper falhou:', error.message);
    return null;
  }
}

export async function runPipeline(url: string): Promise<PipelineResult> {
  const urlHash = hashUrl(url);
  const normalizedUrl = normalizeUrl(url);

  console.log(`[Pipeline] Iniciando análise: ${normalizedUrl}`);
  console.log(`[Pipeline] Hash: ${urlHash}`);

  let html: string | null = null;
  let source: 'firecrawl' | 'fallback' = 'fallback';

  html = await fetchWithFirecrawl(normalizedUrl);
  if (html) {
    source = 'firecrawl';
  } else {
    html = await fetchWithFallback(normalizedUrl);
    source = 'fallback';
  }

  if (!html) {
    return {
      success: false,
      data: null,
      error: 'Não foi possível acessar a página. Verifique se a URL está correta e acessível.',
      source: 'fallback',
    };
  }

  const extractedData = extractFromHtml(html, normalizedUrl);
  const validation = validateExtractedData(extractedData);

  if (!validation.isValid) {
    return {
      success: false,
      data: null,
      error: `Dados insuficientes para análise: ${validation.errors.join(', ')}`,
      source,
    };
  }

  const scores = calculateScores(extractedData);

  return {
    success: true,
    data: {
      url: normalizedUrl,
      urlHash,
      title: extractedData.title,
      price: extractedData.price,
      guarantee: extractedData.guarantee,
      installments: extractedData.installments,
      platform: extractedData.platform,
      confidence: validation.confidence,
      conversionScore: scores.conversionScore,
      riskScore: scores.riskScore,
      overallScore: scores.overallScore,
      factors: scores.factors,
      extractedData,
      validation,
    },
    error: null,
    source,
  };
}
