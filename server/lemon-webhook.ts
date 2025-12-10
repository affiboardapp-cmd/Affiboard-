import express from "express";
import crypto from "crypto";
import { supabaseAdmin } from "./supabase-client";

export const lemonWebhook = express.Router();

// Middleware para raw body
lemonWebhook.use(express.raw({ type: "application/json" }));

// Log helper estruturado
function logWebhook(level: "info" | "warn" | "error", message: string, data?: any) {
  const prefix = `[LWS]`;
  const timestamp = new Date().toISOString().split('T')[1].split('.')[0];
  
  if (level === "info") {
    console.log(`✓ ${prefix} ${timestamp} | ${message}`, data || "");
  } else if (level === "warn") {
    console.warn(`⚠ ${prefix} ${timestamp} | ${message}`, data || "");
  } else {
    console.error(`✗ ${prefix} ${timestamp} | ${message}`, data || "");
  }
}

// Product ID do plano R$19/mês (100 análises)
const PRODUCT_ID = 1129959;
const CREDITS_PER_PURCHASE = 100;

lemonWebhook.post("/", async (req, res) => {
  try {
    logWebhook("info", "Webhook recebido");
    
    // 1. Validar LEMON_WEBHOOK_SECRET
    const secret = process.env.LEMON_WEBHOOK_SECRET;
    if (!secret) {
      logWebhook("error", "LEMON_WEBHOOK_SECRET não configurada");
      return res.status(500).json({ error: "Webhook secret not configured" });
    }

    // 2. Validar assinatura
    const signature = req.headers["x-signature"] as string;
    if (!signature) {
      logWebhook("warn", "Header x-signature ausente");
      return res.status(401).json({ error: "Missing x-signature header" });
    }

    const hash = crypto
      .createHmac("sha256", secret)
      .update(req.body)
      .digest("hex");

    if (hash !== signature) {
      logWebhook("warn", `Assinatura inválida. Esperado: ${signature.substring(0, 16)}..., Calculado: ${hash.substring(0, 16)}...`);
      return res.status(401).json({ error: "Invalid signature" });
    }
    logWebhook("info", "Assinatura validada");

    // 3. Parse payload
    let data;
    try {
      data = JSON.parse(req.body.toString());
    } catch (parseError) {
      logWebhook("error", "Erro ao fazer parse do JSON", parseError);
      return res.status(400).json({ error: "Invalid JSON payload" });
    }

    // 4. Validar payload structure
    if (!data?.meta) {
      logWebhook("warn", "Payload sem meta field");
      return res.status(200).json({ ignored: "No meta field" });
    }

    const event = data.meta.event;
    const productId = data.meta.product_id;
    const email = data.data?.attributes?.customer_email || data.customer_email;

    logWebhook("info", `Evento: ${event} | Produto: ${productId}`);

    // 5. Filtrar por produto
    if (productId !== PRODUCT_ID) {
      logWebhook("warn", `Produto ignorado: ${productId} (esperado: ${PRODUCT_ID})`);
      return res.status(200).json({ ignored: "Different product ID" });
    }

    // 6. Filtrar por evento
    const supportedEvents = ["order_created", "subscription_updated", "subscription_resumed"];
    if (!supportedEvents.includes(event)) {
      logWebhook("warn", `Evento não suportado: ${event}`);
      return res.status(200).json({ ignored: "Unsupported event" });
    }

    // 7. Validar email
    if (!email || typeof email !== "string") {
      logWebhook("warn", "Email ausente ou inválido no payload");
      return res.status(200).json({ ignored: "No valid email" });
    }
    logWebhook("info", `Email extraído: ${email}`);

    // 7.5. Extrair webhook_id para evitar duplicatas
    const webhookId = data.data?.id || `${email}-${productId}-${event}-${Date.now()}`;
    logWebhook("info", `Webhook ID: ${webhookId}`);

    // 8. Buscar usuário no Supabase
    const { data: profile, error: selectError } = await supabaseAdmin
      .from("profiles")
      .select("id, credits, email")
      .eq("email", email)
      .single();

    if (selectError) {
      logWebhook("error", `Erro Supabase ao buscar usuário: ${selectError.message}`);
      return res.status(500).json({ error: "Database error" });
    }

    if (!profile) {
      logWebhook("warn", `Usuário não encontrado: ${email}`);
      return res.status(200).json({ ignored: "User not found" });
    }
    logWebhook("info", `User encontrado: ${email}`);

    // 8.5. Verificar se webhook já foi processado (evitar duplicata)
    const { data: existingTransaction } = await supabaseAdmin
      .from("credit_history")
      .select("id")
      .eq("webhook_id", webhookId)
      .single();

    if (existingTransaction) {
      logWebhook("warn", `Webhook duplicado detectado: ${webhookId}`);
      return res.status(200).json({ ignored: "Webhook already processed" });
    }

    // 9. Atualizar créditos
    const currentCredits = profile.credits || 0;
    const newCredits = currentCredits + CREDITS_PER_PURCHASE;

    const { error: updateError } = await supabaseAdmin
      .from("profiles")
      .update({
        credits: newCredits,
        updated_at: new Date().toISOString()
      })
      .eq("id", profile.id);

    if (updateError) {
      logWebhook("error", `Erro ao atualizar créditos: ${updateError.message}`);
      return res.status(500).json({ error: "Update failed" });
    }

    logWebhook("info", `Créditos atualizados: +${CREDITS_PER_PURCHASE} (${currentCredits} → ${newCredits})`);

    // 10. Registrar transação no histórico
    const { error: historyError } = await supabaseAdmin
      .from("credit_history")
      .insert({
        user_id: profile.id,
        amount: CREDITS_PER_PURCHASE,
        action: "purchase",
        description: `Compra do plano Standard (Lemon Squeezy - ${productId})`,
        webhook_id: webhookId
      });

    if (historyError) {
      logWebhook("warn", `Erro ao registrar histórico: ${historyError.message} (créditos foram adicionados mesmo assim)`);
    } else {
      logWebhook("info", "Transação registrada no histórico");
    }

    // 11. Success response
    logWebhook("info", "✅ Webhook processado com sucesso");
    return res.status(200).json({
      success: true,
      userId: profile.id,
      creditsAdded: CREDITS_PER_PURCHASE,
      newTotal: newCredits,
      webhookId: webhookId
    });

  } catch (error: any) {
    logWebhook("error", `Exceção não tratada: ${error.message}`);
    return res.status(500).json({ error: "Internal server error" });
  }
});
