import { QueryClient, QueryFunction } from "@tanstack/react-query";
import { supabase } from "./supabase";

/**
 * authFetch: sempre tenta pegar a sessão do supabase e envia o header Authorization
 */
export async function authFetch(url: string, options: RequestInit = {}) {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    const token = session?.access_token;

    console.log("[AUTHFETCH] token presente?", !!token, "url:", url);

    const headers = {
      ...(options.headers || {}),
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    };

    const res = await fetch(url, { ...options, headers, credentials: "include" });
    console.log("[AUTHFETCH] status", res.status, url);
    return res;
  } catch (err) {
    console.error("[AUTHFETCH] erro ao buscar session", err);
    throw err;
  }
}

async function throwIfResNotOk(res: Response) {
  if (!res.ok) {
    const text = (await res.text()) || res.statusText;
    throw new Error(`${res.status}: ${text}`);
  }
}

type UnauthorizedBehavior = "returnNull" | "throw";

export const getQueryFn: <T>(options: {
  on401: UnauthorizedBehavior;
}) => QueryFunction<T> =
  ({ on401: unauthorizedBehavior }) =>
  async ({ queryKey }) => {
    const url = Array.isArray(queryKey) ? String(queryKey[0]) : String(queryKey);
    console.log("[QUERY FN] executando para:", url);

    const res = await authFetch(url);

    if (unauthorizedBehavior === "returnNull" && res.status === 401) {
      console.warn("[QUERY FN] 401 para", url);
      return null as any;
    }

    await throwIfResNotOk(res);
    return await res.json();
  };

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryFn: getQueryFn({ on401: "throw" }),
      refetchInterval: false,
      refetchOnWindowFocus: false,
      staleTime: Infinity,
      retry: false,
    },
    mutations: {
      retry: false,
    },
  },
});

/**
 * apiRequest: para mutations (POST, PATCH, DELETE)
 */
export async function apiRequest(
  method: string,
  url: string,
  data?: unknown
): Promise<Response> {
  return authFetch(url, {
    method,
    body: data ? JSON.stringify(data) : undefined,
  });
}
