import { supabase } from "./supabase";

const API_URL = import.meta.env.VITE_API_URL || "";

async function getValidToken(): Promise<string> {
  const maxAttempts = 3;
  const delayMs = 500;

  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    const { data, error } = await supabase.auth.getSession();
    
    if (error) {
      console.error("[API] Error getting session:", error.message);
      throw new Error("Erro ao obter sessão de autenticação");
    }

    const token = data.session?.access_token;
    
    if (token) {
      return token;
    }

    if (attempt < maxAttempts - 1) {
      await new Promise(resolve => setTimeout(resolve, delayMs));
    }
  }

  throw new Error("Você precisa estar logado para acessar esta funcionalidade.");
}

export async function apiFetch(path: string, options: RequestInit = {}) {
  const token = await getValidToken();

  const headers: HeadersInit = {
    "Content-Type": "application/json",
    ...(options.headers || {}),
    Authorization: `Bearer ${token}`,
  };

  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const text = await response.text();
    let errorMessage = "Erro desconhecido";
    try {
      const json = JSON.parse(text);
      errorMessage = json.error || json.message || text;
    } catch {
      errorMessage = text || `Erro ${response.status}`;
    }
    throw new Error(errorMessage);
  }

  return response.json();
}

export async function analyzeOffer(url: string) {
  try {
    new URL(url);
  } catch {
    throw new Error("URL inválida. Use o formato completo (https://)");
  }

  return apiFetch("/api/analyze", {
    method: "POST",
    body: JSON.stringify({ url }),
  });
}

export async function getCredits() {
  return apiFetch("/api/credits");
}

export async function getAnalysisHistory() {
  const response = await apiFetch("/api/history");
  return response.data || [];
}

export async function getProfile(userId: string) {
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", userId)
    .single();

  if (error) {
    console.error("Erro ao buscar perfil:", error);
    return null;
  }
  return data;
}

export async function getCreditHistory(userId: string) {
  const { data, error } = await supabase
    .from("credit_history")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Erro ao buscar histórico de créditos:", error);
    return [];
  }
  return data;
}
