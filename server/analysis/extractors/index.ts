import * as cheerio from 'cheerio';

export interface ExtractedData {
  title: string | null;
  price: number | null;
  originalPrice: number | null;
  discount: number | null;
  guarantee: number | null;
  installments: number | null;
  installmentValue: number | null;
  platform: string | null;
  seller: string | null;
  category: string | null;
  hasVideo: boolean;
  hasTestimonials: boolean;
  hasFAQ: boolean;
  hasCountdown: boolean;
  hasBonuses: boolean;
  bonusCount: number;
  pageLength: number;
  imageCount: number;
  ctaCount: number;
  rawHtml?: string;
}

const PLATFORM_PATTERNS: Record<string, RegExp[]> = {
  hotmart: [/hotmart\.com/, /go\.hotmart/, /pay\.hotmart/],
  kiwify: [/kiwify\.com\.br/, /pay\.kiwify/],
  monetizze: [/monetizze\.com\.br/, /app\.monetizze/],
  eduzz: [/eduzz\.com/, /sun\.eduzz/, /nutror\.com/],
  braip: [/braip\.com/, /checkout\.braip/],
};

export function detectPlatform(url: string): string | null {
  const lowerUrl = url.toLowerCase();
  for (const [platform, patterns] of Object.entries(PLATFORM_PATTERNS)) {
    if (patterns.some(p => p.test(lowerUrl))) {
      return platform;
    }
  }
  return null;
}

export function extractPrice(text: string): number | null {
  const patterns = [
    /R\$\s*([\d.,]+)/gi,
    /(\d{1,3}(?:\.\d{3})*,\d{2})/g,
    /(\d+,\d{2})/g,
  ];

  for (const pattern of patterns) {
    const matches = text.match(pattern);
    if (matches) {
      for (const match of matches) {
        const cleaned = match
          .replace(/R\$\s*/gi, '')
          .replace(/\./g, '')
          .replace(',', '.');
        const value = parseFloat(cleaned);
        if (!isNaN(value) && value > 0 && value < 100000) {
          return value;
        }
      }
    }
  }
  return null;
}

export function extractGuarantee(text: string): number | null {
  const patterns = [
    /garantia\s*(?:de\s*)?(\d+)\s*dias?/gi,
    /(\d+)\s*dias?\s*(?:de\s*)?garantia/gi,
    /(\d+)\s*days?\s*guarantee/gi,
  ];

  for (const pattern of patterns) {
    const match = pattern.exec(text);
    if (match) {
      const days = parseInt(match[1], 10);
      if (days > 0 && days <= 365) {
        return days;
      }
    }
  }
  return null;
}

export function extractInstallments(text: string): { count: number; value: number | null } | null {
  const patterns = [
    /(\d{1,2})x\s*(?:de\s*)?R?\$?\s*([\d.,]+)/gi,
    /parcel[ao]s?\s*(?:em\s*)?(\d{1,2})x/gi,
    /(\d{1,2})\s*parcelas/gi,
  ];

  for (const pattern of patterns) {
    const match = pattern.exec(text);
    if (match) {
      const count = parseInt(match[1], 10);
      if (count >= 1 && count <= 24) {
        let value = null;
        if (match[2]) {
          const cleaned = match[2].replace(/\./g, '').replace(',', '.');
          value = parseFloat(cleaned);
          if (isNaN(value)) value = null;
        }
        return { count, value };
      }
    }
  }
  return null;
}

export function extractTitle($: cheerio.CheerioAPI): string | null {
  const selectors = [
    'h1.product-title',
    'h1[class*="title"]',
    '.product-name h1',
    'h1',
    'title',
    'meta[property="og:title"]',
  ];

  for (const selector of selectors) {
    let text: string | undefined;
    if (selector.startsWith('meta')) {
      text = $(selector).attr('content');
    } else {
      text = $(selector).first().text();
    }
    if (text && text.trim().length >= 10) {
      return text.trim().substring(0, 200);
    }
  }
  return null;
}

export function extractFromHtml(html: string, url: string): ExtractedData {
  const $ = cheerio.load(html);
  const bodyText = $('body').text().replace(/\s+/g, ' ');
  const lowerText = bodyText.toLowerCase();

  const title = extractTitle($);
  const price = extractPrice(bodyText);
  const guarantee = extractGuarantee(bodyText);
  const installmentsData = extractInstallments(bodyText);

  const priceElements = $('[class*="price"], [class*="valor"], [class*="preco"]');
  let originalPrice: number | null = null;
  let discount: number | null = null;

  priceElements.each((_, el) => {
    const text = $(el).text();
    if (/de\s*R?\$/i.test(text) || /original/i.test(text)) {
      const extracted = extractPrice(text);
      if (extracted && price && extracted > price) {
        originalPrice = extracted;
        discount = Math.round(((extracted - price) / extracted) * 100);
      }
    }
  });

  const hasVideo = $('video, iframe[src*="youtube"], iframe[src*="vimeo"], [class*="video"]').length > 0;
  const hasTestimonials = /depoimento|testemunho|testimonial|o que.*dizem/i.test(lowerText);
  const hasFAQ = /perguntas?\s*frequentes?|faq|dúvidas/i.test(lowerText);
  const hasCountdown = $('[class*="countdown"], [class*="timer"], [class*="contador"]').length > 0;
  const hasBonuses = /bônus|bonus|brinde|grátis|gratuito/i.test(lowerText);

  const bonusMatches = lowerText.match(/bônus\s*\d+|bonus\s*\d+/gi);
  const bonusCount = bonusMatches ? bonusMatches.length : (hasBonuses ? 1 : 0);

  const imageCount = $('img').length;
  const ctaCount = $('button, a[class*="buy"], a[class*="comprar"], [class*="cta"]').length;

  return {
    title,
    price,
    originalPrice,
    discount,
    guarantee,
    installments: installmentsData?.count ?? null,
    installmentValue: installmentsData?.value ?? null,
    platform: detectPlatform(url),
    seller: null,
    category: null,
    hasVideo,
    hasTestimonials,
    hasFAQ,
    hasCountdown,
    hasBonuses,
    bonusCount,
    pageLength: html.length,
    imageCount,
    ctaCount,
  };
}
