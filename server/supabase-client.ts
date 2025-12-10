import { createClient, SupabaseClient } from "@supabase/supabase-js";

// Carregar variáveis com fallbacks para compatibilidade
const SUPABASE_URL = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const SUPABASE_ANON_KEY =
  process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY;
console.log(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, SUPABASE_ANON_KEY);
if (!SUPABASE_URL) {
  console.error("[Supabase] ⚠️ SUPABASE_URL não configurada");
  console.error(
    "[Supabase] Verifique se o arquivo .env existe na raiz do projeto"
  );
}

if (!SUPABASE_SERVICE_ROLE_KEY) {
  console.warn("[Supabase] ⚠️ SUPABASE_SERVICE_ROLE_KEY não configurada");
  console.warn(
    "[Supabase] Algumas operações críticas podem falhar. Configure no .env"
  );
}

export const supabaseAdmin: SupabaseClient = createClient(
  SUPABASE_URL || "",
  SUPABASE_SERVICE_ROLE_KEY || SUPABASE_ANON_KEY || "",
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
    global: {
      fetch: async (url, options = {}) => {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 30000);

        try {
          const response = await fetch(url, {
            ...options,
            signal: controller.signal,
          });
          return response;
        } finally {
          clearTimeout(timeout);
        }
      },
    },
  }
);

export const supabase: SupabaseClient = createClient(
  SUPABASE_URL || "",
  SUPABASE_ANON_KEY || "",
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  }
);

export async function withRetry<T>(
  operation: () => Promise<T>,
  maxRetries: number = 3,
  delayMs: number = 1000
): Promise<T> {
  let lastError: Error | null = null;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error: any) {
      lastError = error;
      console.warn(
        `[Supabase] Tentativa ${attempt}/${maxRetries} falhou:`,
        error.message
      );

      if (attempt < maxRetries) {
        await new Promise((resolve) => setTimeout(resolve, delayMs * attempt));
      }
    }
  }

  throw lastError || new Error("Operação falhou após múltiplas tentativas");
}

export async function reserveCredits(
  userId: string,
  amount: number = 1
): Promise<{
  success: boolean;
  reservationId: string | null;
  error: string | null;
}> {
  try {
    const { data, error } = await supabaseAdmin.rpc("reserve_credits", {
      p_user_id: userId,
      p_amount: amount,
    });

    if (error) {
      console.error("[Supabase] Erro ao reservar créditos:", error.message);
      return { success: false, reservationId: null, error: error.message };
    }

    // Handle different RPC return formats:
    // 1. Simple UUID string: "uuid-value"
    // 2. Object format: { success: true, reservation_id: "uuid" }
    // 3. Object with status: { status: 'reserved', reservation_id: "uuid" }

    if (typeof data === "string" && data.length > 0) {
      // RPC returns UUID directly as string
      return { success: true, reservationId: data, error: null };
    }

    if (data && typeof data === "object") {
      // Check for success/failure in object format
      if (data.success === false) {
        return {
          success: false,
          reservationId: null,
          error: data.error || data.message || "Créditos insuficientes",
        };
      }

      if (data.reservation_id) {
        return {
          success: true,
          reservationId: data.reservation_id,
          error: null,
        };
      }

      if (data.status === "reserved" && data.reservation_id) {
        return {
          success: true,
          reservationId: data.reservation_id,
          error: null,
        };
      }
    }

    return {
      success: false,
      reservationId: null,
      error: "Resposta inválida do servidor",
    };
  } catch (err: any) {
    console.error("[Supabase] Exceção ao reservar créditos:", err.message);
    return { success: false, reservationId: null, error: err.message };
  }
}

export async function commitReservation(reservationId: string): Promise<{
  success: boolean;
  error: string | null;
}> {
  try {
    const { data, error } = await supabaseAdmin.rpc("commit_reservation", {
      p_reservation_id: reservationId,
    });

    if (error) {
      console.error("[Supabase] Erro ao commitar reserva:", error.message);
      return { success: false, error: error.message };
    }

    return { success: true, error: null };
  } catch (err: any) {
    console.error("[Supabase] Exceção ao commitar reserva:", err.message);
    return { success: false, error: err.message };
  }
}

export async function releaseReservation(reservationId: string): Promise<{
  success: boolean;
  error: string | null;
}> {
  try {
    const { data, error } = await supabaseAdmin.rpc("release_reservation", {
      p_reservation_id: reservationId,
    });

    if (error) {
      console.error("[Supabase] Erro ao liberar reserva:", error.message);
      return { success: false, error: error.message };
    }

    return { success: true, error: null };
  } catch (err: any) {
    console.error("[Supabase] Exceção ao liberar reserva:", err.message);
    return { success: false, error: err.message };
  }
}

export async function getUserCredits(userId: string): Promise<number> {
  try {
    const { data, error } = await supabaseAdmin
      .from("profiles")
      .select("credits")
      .eq("id", userId)
      .single();

    if (error) {
      console.error("[Supabase] Erro ao buscar créditos:", error.message);
      return 0;
    }

    return data?.credits || 0;
  } catch (err: any) {
    console.error("[Supabase] Exceção ao buscar créditos:", err.message);
    return 0;
  }
}

export async function getFromCache(urlHash: string): Promise<any | null> {
  try {
    const { data, error } = await supabaseAdmin
      .from("analysis_cache")
      .select("*")
      .eq("url_hash", urlHash)
      .single();

    if (error || !data) {
      return null;
    }

    const createdAt = new Date(data.created_at);
    const now = new Date();
    const hoursDiff = (now.getTime() - createdAt.getTime()) / (1000 * 60 * 60);

    if (hoursDiff > 24) {
      return null;
    }

    return data;
  } catch {
    return null;
  }
}

export async function saveToCache(
  urlHash: string,
  url: string,
  userId: string,
  offerData: any,
  analysis: any
): Promise<boolean> {
  try {
    const { error } = await supabaseAdmin.from("analysis_cache").upsert(
      {
        url_hash: urlHash,
        url,
        user_id: userId,
        offer_data: offerData,
        analysis,
        created_at: new Date().toISOString(),
      },
      {
        onConflict: "url_hash",
      }
    );

    if (error) {
      console.error("[Supabase] Erro ao salvar cache:", error.message);
      return false;
    }

    return true;
  } catch (err: any) {
    console.error("[Supabase] Exceção ao salvar cache:", err.message);
    return false;
  }
}

export async function logAnalysis(
  userId: string,
  url: string,
  urlHash: string,
  status: "success" | "failed",
  result: any
): Promise<void> {
  try {
    await supabaseAdmin.from("analysis_logs").insert({
      user_id: userId,
      url,
      url_hash: urlHash,
      status,
      result,
      created_at: new Date().toISOString(),
    });
  } catch (err: any) {
    console.error("[Supabase] Erro ao logar análise:", err.message);
  }
}

export async function checkHealth(): Promise<boolean> {
  try {
    const { error } = await supabaseAdmin
      .from("profiles")
      .select("id")
      .limit(1);
    return !error;
  } catch {
    return false;
  }
}
