
-- ============================================
-- SCHEMA COMPLETO DO MVP AFFIBOARD
-- Execute este SQL no Supabase SQL Editor
-- ============================================

-- 1. TABELA: analysis_requests
-- Armazena todas as requisições de análise
CREATE TABLE IF NOT EXISTS public.analysis_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  url TEXT NOT NULL,
  url_normalized TEXT NOT NULL,
  url_hash VARCHAR(16) NOT NULL,
  result JSONB,
  status TEXT NOT NULL CHECK (status IN ('pending', 'success', 'failed')),
  reservation_id UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_analysis_requests_user_id ON public.analysis_requests(user_id);
CREATE INDEX IF NOT EXISTS idx_analysis_requests_url_hash ON public.analysis_requests(url_hash);
CREATE INDEX IF NOT EXISTS idx_analysis_requests_status ON public.analysis_requests(status);
CREATE INDEX IF NOT EXISTS idx_analysis_requests_created_at ON public.analysis_requests(created_at DESC);

-- RLS
ALTER TABLE public.analysis_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own requests"
  ON public.analysis_requests
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Service can manage all requests"
  ON public.analysis_requests
  FOR ALL
  USING (true);

-- 2. TABELA: analysis_cache
-- Cache remoto de análises (TTL 24h)
CREATE TABLE IF NOT EXISTS public.analysis_cache (
  url_hash VARCHAR(16) PRIMARY KEY,
  url TEXT NOT NULL,
  offer_data JSONB NOT NULL,
  source TEXT DEFAULT 'scraper',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  expires_at TIMESTAMPTZ NOT NULL DEFAULT (NOW() + INTERVAL '24 hours')
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_analysis_cache_url_hash ON public.analysis_cache(url_hash);
CREATE INDEX IF NOT EXISTS idx_analysis_cache_expires_at ON public.analysis_cache(expires_at);

-- RLS
ALTER TABLE public.analysis_cache ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read cache"
  ON public.analysis_cache
  FOR SELECT
  USING (true);

CREATE POLICY "Service can manage cache"
  ON public.analysis_cache
  FOR ALL
  USING (true);

-- 3. TABELA: credit_reservations
-- Reservas temporárias de créditos
CREATE TABLE IF NOT EXISTS public.credit_reservations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  amount INT NOT NULL DEFAULT 1,
  status TEXT NOT NULL CHECK (status IN ('reserved', 'committed', 'released', 'expired')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  expire_at TIMESTAMPTZ NOT NULL DEFAULT (NOW() + INTERVAL '15 minutes')
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_credit_reservations_user_id ON public.credit_reservations(user_id);
CREATE INDEX IF NOT EXISTS idx_credit_reservations_status ON public.credit_reservations(status);
CREATE INDEX IF NOT EXISTS idx_credit_reservations_expire_at ON public.credit_reservations(expire_at);

-- RLS
ALTER TABLE public.credit_reservations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own reservations"
  ON public.credit_reservations
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Service can manage reservations"
  ON public.credit_reservations
  FOR ALL
  USING (true);

-- 4. FUNÇÃO: Limpar cache expirado
CREATE OR REPLACE FUNCTION public.cleanup_expired_cache()
RETURNS INT
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  deleted_count INT;
BEGIN
  DELETE FROM public.analysis_cache
  WHERE expires_at < NOW();
  
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  RETURN deleted_count;
END;
$$;

-- 5. FUNÇÃO: Limpar reservas expiradas
CREATE OR REPLACE FUNCTION public.cleanup_expired_reservations()
RETURNS INT
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  deleted_count INT;
BEGIN
  -- Marcar como expiradas
  UPDATE public.credit_reservations
  SET status = 'expired'
  WHERE status = 'reserved'
    AND expire_at < NOW();
  
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  
  -- Devolver créditos
  UPDATE public.profiles p
  SET credits = credits + r.amount
  FROM public.credit_reservations r
  WHERE r.user_id = p.id
    AND r.status = 'expired'
    AND r.expire_at < NOW();
  
  RETURN deleted_count;
END;
$$;

-- Comentários
COMMENT ON TABLE public.analysis_requests IS 'Histórico completo de análises de ofertas';
COMMENT ON TABLE public.analysis_cache IS 'Cache remoto com TTL de 24 horas';
COMMENT ON TABLE public.credit_reservations IS 'Reservas temporárias de créditos (TTL 15 minutos)';
