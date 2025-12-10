import type { Express, Request, Response, NextFunction } from "express";
import type { Server } from "http";
import express from "express";
import { 
  supabase,
  supabaseAdmin,
  reserveCredits, 
  commitReservation, 
  releaseReservation,
  getUserCredits,
  getFromCache,
  saveToCache,
  logAnalysis,
  checkHealth,
} from "./supabase-client";
import { runPipeline, hashUrl, normalizeUrl } from "./analysis/pipeline";

declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        email?: string;
      };
    }
  }
}

async function analyzeHandler(req: Request, res: Response) {
  const { url } = req.body;
  const userId = req.user!.id;

  if (!url) {
    return res.status(400).json({ 
      success: false, 
      error: 'URL não informada' 
    });
  }

  try {
    new URL(url);
  } catch {
    return res.status(400).json({ 
      success: false, 
      error: 'URL inválida. Use o formato completo (https://...)' 
    });
  }

  const urlHash = hashUrl(url);
  const normalizedUrl = normalizeUrl(url);

  console.log(`[Analyze] Usuário ${userId} analisando: ${normalizedUrl}`);

  try {
    const cached = await getFromCache(urlHash);
    if (cached && cached.analysis) {
      console.log('[Analyze] Retornando do cache');
      const credits = await getUserCredits(userId);
      
      return res.json({
        success: true,
        data: {
          ...cached.analysis,
          url: cached.url,
          urlHash: cached.url_hash,
        },
        cached: true,
        credits_used: 0,
        credits_remaining: credits,
      });
    }
  } catch (err) {
    console.log('[Analyze] Cache check falhou, continuando...');
  }

  const reservation = await reserveCredits(userId, 1);
  
  if (!reservation.success) {
    return res.status(402).json({
      success: false,
      error: reservation.error || 'Créditos insuficientes',
      credits_remaining: await getUserCredits(userId),
    });
  }

  const reservationId = reservation.reservationId!;
  console.log(`[Analyze] Reserva criada: ${reservationId}`);

  try {
    const result = await runPipeline(normalizedUrl);

    if (!result.success || !result.data) {
      console.log('[Analyze] Pipeline falhou, liberando reserva');
      await releaseReservation(reservationId);
      await logAnalysis(userId, normalizedUrl, urlHash, 'failed', { error: result.error });

      return res.status(422).json({
        success: false,
        error: result.error || 'Não foi possível analisar a oferta',
        credits_used: 0,
        credits_remaining: await getUserCredits(userId),
      });
    }

    if (result.data.confidence < 0.5) {
      console.log('[Analyze] Confiança baixa, liberando reserva');
      await releaseReservation(reservationId);
      
      return res.status(422).json({
        success: false,
        error: 'Dados insuficientes para uma análise confiável',
        partial_data: {
          title: result.data.title,
          platform: result.data.platform,
          confidence: result.data.confidence,
        },
        credits_used: 0,
        credits_remaining: await getUserCredits(userId),
      });
    }

    console.log('[Analyze] Commitando reserva...');
    const commitResult = await commitReservation(reservationId);
    
    if (!commitResult.success) {
      console.warn('[Analyze] Commit falhou:', commitResult.error);
    } else {
      console.log('[Analyze] Reserva commitada com sucesso');
    }

    await saveToCache(urlHash, normalizedUrl, userId, result.data.extractedData, result.data);
    await logAnalysis(userId, normalizedUrl, urlHash, 'success', result.data);

    const creditsRemaining = await getUserCredits(userId);

    console.log('[Analyze] Análise concluída com sucesso');

    // Transformar para novo formato MVP
    const decisionMap: { [key: number]: "yes" | "maybe" | "no" } = {
      [85]: "yes",
      [70]: "yes",
      [60]: "maybe",
      [50]: "maybe",
      [40]: "no",
      [0]: "no",
    };

    const decision = (() => {
      if (result.data.overallScore >= 70) return "yes";
      if (result.data.overallScore >= 50) return "maybe";
      return "no";
    })() as "yes" | "maybe" | "no";

    const copyLevel = (() => {
      if (result.data.conversionScore >= 70) return "strong";
      if (result.data.conversionScore >= 50) return "medium";
      return "weak";
    })() as "strong" | "medium" | "weak";

    const riskLevel = (() => {
      if (result.data.riskScore <= 30) return "low";
      if (result.data.riskScore <= 60) return "medium";
      return "high";
    })() as "low" | "medium" | "high";

    const mvpData = {
      summary: {
        decision,
        reason: result.data.factors?.positive?.length 
          ? `Detectados ${result.data.factors.positive.length} pontos positivos nesta oferta.`
          : "Análise inconclusiva.",
      },
      copy: {
        level: copyLevel,
        notes: result.data.factors?.positive || [],
      },
      risk: {
        level: riskLevel,
        issues: result.data.factors?.negative || [],
      },
      essentials: {
        price: result.data.price || null,
        installments: result.data.installments ? parseInt(String(result.data.installments)) : null,
        guarantee: result.data.guarantee ? parseInt(String(result.data.guarantee)) : null,
        page_length: result.data.extractedData?.pageLength || null,
        structure_blocks: null,
      },
    };

    return res.json({
      success: true,
      data: mvpData,
      cached: false,
      source: result.source,
      credits_used: 1,
      credits_remaining: creditsRemaining,
    });

  } catch (err: any) {
    console.error('[Analyze] Erro no pipeline:', err.message);
    await releaseReservation(reservationId);
    await logAnalysis(userId, normalizedUrl, urlHash, 'failed', { error: err.message });

    return res.status(500).json({
      success: false,
      error: 'Erro interno ao processar análise',
      credits_used: 0,
      credits_remaining: await getUserCredits(userId),
    });
  }
}

async function authMiddleware(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ 
      success: false, 
      error: 'Token de autenticação ausente' 
    });
  }

  const token = authHeader.replace('Bearer ', '');

  try {
    const { data: { user }, error } = await supabase.auth.getUser(token);

    if (error || !user) {
      return res.status(401).json({ 
        success: false, 
        error: 'Token inválido ou expirado' 
      });
    }

    req.user = { id: user.id, email: user.email };
    next();
  } catch (err: any) {
    console.error('[Auth] Erro na autenticação:', err.message);
    return res.status(401).json({ 
      success: false, 
      error: 'Erro na autenticação' 
    });
  }
}

// WEBHOOK STATE
let webhookInitialized = false;

export async function registerLemonWebhook() {
  if (webhookInitialized) return;
  
  try {
    const express_module = await import("express");
    const { lemonWebhook } = await import("./lemon-webhook");
    // Note: webhook registration happens in index.ts after listen
    webhookInitialized = true;
    console.log("[Webhook] Lemon Squeezy webhook initialized");
  } catch (err: any) {
    console.error("[Webhook] Failed to initialize:", err.message);
  }
}

// SYNCHRONOUS route registration - NO AWAIT BEFORE LISTEN
export function registerRoutes(
  httpServer: Server,
  app: Express
): void {

  // Health check
  app.get("/api/health", async (_req, res) => {
    const supabaseOk = await checkHealth();
    const memUsage = process.memoryUsage();
    
    res.json({
      status: supabaseOk ? 'ok' : 'degraded',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      memory: {
        heapUsed: Math.round(memUsage.heapUsed / 1024 / 1024) + 'MB',
        heapTotal: Math.round(memUsage.heapTotal / 1024 / 1024) + 'MB',
        rss: Math.round(memUsage.rss / 1024 / 1024) + 'MB',
      },
      services: {
        supabase: supabaseOk ? 'connected' : 'disconnected',
      },
    });
  });

  // Credits endpoint
  app.get("/api/credits", authMiddleware, async (req, res) => {
    try {
      const userId = req.user!.id;

      const { data, error } = await supabaseAdmin
        .from("profiles")
        .select("credits, plan_tier, email, full_name")
        .eq("id", userId)
        .single();

      if (error) {
        return res.status(500).json({ 
          success: false, 
          error: 'Erro ao buscar créditos' 
        });
      }

      return res.json({
        success: true,
        credits: data?.credits || 0,
        plan_tier: data?.plan_tier || 'free',
        email: data?.email,
        full_name: data?.full_name,
      });
    } catch (err: any) {
      console.error('[Credits] Erro:', err.message);
      return res.status(500).json({ 
        success: false, 
        error: 'Erro interno' 
      });
    }
  });

  // Analysis endpoints
  app.post("/api/analyze", authMiddleware, analyzeHandler);
  app.post("/api/analyze-mvp", authMiddleware, analyzeHandler);

  // History endpoint
  app.get("/api/history", authMiddleware, async (req, res) => {
    try {
      const userId = req.user!.id;

      const { data, error } = await supabaseAdmin
        .from("analysis_cache")
        .select("url_hash, url, offer_data, analysis, created_at")
        .eq("user_id", userId)
        .order("created_at", { ascending: false })
        .limit(50);

      if (error) {
        return res.status(500).json({ 
          success: false, 
          error: 'Erro ao buscar histórico' 
        });
      }

      return res.json({
        success: true,
        data: data || [],
        count: data?.length || 0,
      });
    } catch (err: any) {
      console.error('[History] Erro:', err.message);
      return res.status(500).json({ 
        success: false, 
        error: 'Erro interno' 
      });
    }
  });

  // Single analysis endpoint
  app.get("/api/analysis/:id", authMiddleware, async (req, res) => {
    try {
      const userId = req.user!.id;
      const urlHash = req.params.id;

      console.log(`[Analysis] Buscando análise: ${urlHash} para usuário: ${userId}`);

      const { data, error } = await supabaseAdmin
        .from("analysis_cache")
        .select("url_hash, url, offer_data, analysis, created_at")
        .eq("user_id", userId)
        .eq("url_hash", urlHash)
        .single();

      if (error) {
        console.error(`[Analysis] Erro Supabase:`, error.message);
        return res.status(404).json({ 
          success: false, 
          error: 'Análise não encontrada',
          debug: error.message
        });
      }

      if (!data) {
        console.log(`[Analysis] Nenhum dado encontrado para ${urlHash}`);
        return res.status(404).json({ 
          success: false, 
          error: 'Análise não encontrada' 
        });
      }

      console.log(`[Analysis] Dados encontrados:`, { url: data.url, analysis: !!data.analysis });

      const analysis = data.analysis || {};
      const offerData = data.offer_data || {};

      const normalizedData = {
        url: data.url,
        urlHash: data.url_hash,
        title: analysis.title || offerData.title || "Oferta",
        price: analysis.price ?? offerData.price ?? null,
        guarantee: analysis.guarantee ?? offerData.guarantee ?? null,
        installments: analysis.installments ?? offerData.installments ?? null,
        platform: analysis.platform || offerData.platform || "Desconhecido",
        confidence: analysis.confidence ?? 0,
        conversionScore: analysis.conversionScore ?? 0,
        riskScore: analysis.riskScore ?? 0,
        overallScore: analysis.overallScore ?? 0,
        summary: analysis.summary || null,
        decision: analysis.decision || null,
        pageLength: analysis.pageLength ?? null,
        copyLevel: analysis.copyLevel || null,
        factors: {
          positive: analysis.factors?.positive || [],
          negative: analysis.factors?.negative || [],
          neutral: analysis.factors?.neutral || [],
        },
        created_at: data.created_at,
      };

      return res.json({
        success: true,
        data: normalizedData,
      });
    } catch (err: any) {
      console.error('[Analysis] Erro:', err.message);
      return res.status(500).json({ 
        success: false, 
        error: 'Erro interno',
        debug: err.message 
      });
    }
  });

  // Profile endpoint
  app.get("/api/profile", authMiddleware, async (req, res) => {
    try {
      const userId = req.user!.id;

      const { data, error } = await supabaseAdmin
        .from("profiles")
        .select("*")
        .eq("id", userId)
        .single();

      if (error) {
        return res.status(500).json({ 
          success: false, 
          error: 'Erro ao buscar perfil' 
        });
      }

      return res.json({
        success: true,
        data,
      });
    } catch (err: any) {
      console.error('[Profile] Erro:', err.message);
      return res.status(500).json({ 
        success: false, 
        error: 'Erro interno' 
      });
    }
  });
}
