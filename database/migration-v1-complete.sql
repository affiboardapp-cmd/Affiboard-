-- ============================================
-- MIGRAÇÃO COMPLETA MVP AFFIBOARD v1
-- Execute este SQL no Supabase SQL Editor
-- ============================================

-- 1. TABELA: analysis_requests
CREATE TABLE IF NOT EXISTS public.analysis_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  url TEXT NOT NULL,
  url_normalized TEXT NOT NULL,
  url_hash VARCHAR(16) NOT NULL,
  result JSONB,
  status TEXT NOT NULL CHECK (status IN ('pending', 'success', 'failed')) DEFAULT 'pending',
  reservation_id UUID,
  credits_reserved INT DEFAULT 1,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_analysis_requests_user_id ON public.analysis_requests(user_id);
CREATE INDEX IF NOT EXISTS idx_analysis_requests_url_hash ON public.analysis_requests(url_hash);
CREATE INDEX IF NOT EXISTS idx_analysis_requests_status ON public.analysis_requests(status);
CREATE INDEX IF NOT EXISTS idx_analysis_requests_created_at ON public.analysis_requests(created_at DESC);

ALTER TABLE public.analysis_requests ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own requests" ON public.analysis_requests;
CREATE POLICY "Users can view own requests"
  ON public.analysis_requests FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Service can manage all requests" ON public.analysis_requests;
CREATE POLICY "Service can manage all requests"
  ON public.analysis_requests FOR ALL
  USING (true);

-- 2. TABELA: analysis_cache
CREATE TABLE IF NOT EXISTS public.analysis_cache (
  url_hash VARCHAR(16) PRIMARY KEY,
  url TEXT NOT NULL,
  offer_data JSONB NOT NULL,
  source TEXT DEFAULT 'scraper',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  expires_at TIMESTAMPTZ NOT NULL DEFAULT (NOW() + INTERVAL '24 hours')
);

CREATE INDEX IF NOT EXISTS idx_analysis_cache_expires_at ON public.analysis_cache(expires_at);

ALTER TABLE public.analysis_cache ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can read cache" ON public.analysis_cache;
CREATE POLICY "Anyone can read cache"
  ON public.analysis_cache FOR SELECT USING (true);

DROP POLICY IF EXISTS "Service can manage cache" ON public.analysis_cache;
CREATE POLICY "Service can manage cache"
  ON public.analysis_cache FOR ALL USING (true);

-- 3. TABELA: credit_reservations
CREATE TABLE IF NOT EXISTS public.credit_reservations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  amount INT NOT NULL DEFAULT 1,
  status TEXT NOT NULL CHECK (status IN ('reserved', 'committed', 'released', 'expired')) DEFAULT 'reserved',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  expire_at TIMESTAMPTZ NOT NULL DEFAULT (NOW() + INTERVAL '15 minutes')
);

CREATE INDEX IF NOT EXISTS idx_credit_reservations_user_id ON public.credit_reservations(user_id);
CREATE INDEX IF NOT EXISTS idx_credit_reservations_status ON public.credit_reservations(status);
CREATE INDEX IF NOT EXISTS idx_credit_reservations_expire_at ON public.credit_reservations(expire_at);

ALTER TABLE public.credit_reservations ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own reservations" ON public.credit_reservations;
CREATE POLICY "Users can view own reservations"
  ON public.credit_reservations FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Service can manage reservations" ON public.credit_reservations;
CREATE POLICY "Service can manage reservations"
  ON public.credit_reservations FOR ALL USING (true);

-- ============================================
-- RPCs (SECURITY DEFINER)
-- ============================================

-- RPC: reserve_credits
CREATE OR REPLACE FUNCTION public.reserve_credits(
  p_user_id UUID,
  p_amount INT DEFAULT 1,
  p_ttl_seconds INT DEFAULT 600
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_current_credits INT;
  v_reservation_id UUID;
  v_expires_at TIMESTAMPTZ;
BEGIN
  -- Verificar créditos com lock
  SELECT credits INTO v_current_credits
  FROM public.profiles
  WHERE id = p_user_id
  FOR UPDATE;

  IF v_current_credits IS NULL THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'User not found'
    );
  END IF;

  IF v_current_credits < p_amount THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Insufficient credits',
      'credits_remaining', v_current_credits
    );
  END IF;

  v_expires_at := NOW() + (p_ttl_seconds || ' seconds')::INTERVAL;

  -- Criar reserva (NÃO debita ainda)
  INSERT INTO public.credit_reservations (user_id, amount, status, expire_at)
  VALUES (p_user_id, p_amount, 'reserved', v_expires_at)
  RETURNING id INTO v_reservation_id;

  RETURN jsonb_build_object(
    'success', true,
    'reservation_id', v_reservation_id,
    'expires_at', v_expires_at,
    'credits_remaining', v_current_credits
  );
EXCEPTION
  WHEN OTHERS THEN
    RETURN jsonb_build_object('success', false, 'error', SQLERRM);
END;
$$;

-- RPC: commit_reservation
CREATE OR REPLACE FUNCTION public.commit_reservation(
  p_reservation_id UUID
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_user_id UUID;
  v_amount INT;
  v_status TEXT;
  v_credits_after INT;
BEGIN
  -- Buscar reserva com lock
  SELECT user_id, amount, status
  INTO v_user_id, v_amount, v_status
  FROM public.credit_reservations
  WHERE id = p_reservation_id
  FOR UPDATE;

  IF v_user_id IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'Reservation not found');
  END IF;

  IF v_status != 'reserved' THEN
    RETURN jsonb_build_object('success', false, 'error', 'Reservation already processed: ' || v_status);
  END IF;

  -- Debitar créditos
  UPDATE public.profiles
  SET credits = credits - v_amount
  WHERE id = v_user_id
  RETURNING credits INTO v_credits_after;

  -- Marcar como committed
  UPDATE public.credit_reservations
  SET status = 'committed'
  WHERE id = p_reservation_id;

  RETURN jsonb_build_object(
    'success', true,
    'credits_remaining', v_credits_after
  );
EXCEPTION
  WHEN OTHERS THEN
    RETURN jsonb_build_object('success', false, 'error', SQLERRM);
END;
$$;

-- RPC: release_reservation
CREATE OR REPLACE FUNCTION public.release_reservation(
  p_reservation_id UUID
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_user_id UUID;
  v_status TEXT;
  v_credits INT;
BEGIN
  -- Buscar reserva com lock
  SELECT user_id, status INTO v_user_id, v_status
  FROM public.credit_reservations
  WHERE id = p_reservation_id
  FOR UPDATE;

  IF v_user_id IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'Reservation not found');
  END IF;

  IF v_status != 'reserved' THEN
    RETURN jsonb_build_object('success', false, 'error', 'Reservation already processed: ' || v_status);
  END IF;

  -- Marcar como released (não debita nada)
  UPDATE public.credit_reservations
  SET status = 'released'
  WHERE id = p_reservation_id;

  -- Buscar créditos atuais
  SELECT credits INTO v_credits
  FROM public.profiles
  WHERE id = v_user_id;

  RETURN jsonb_build_object(
    'success', true,
    'credits_remaining', v_credits
  );
EXCEPTION
  WHEN OTHERS THEN
    RETURN jsonb_build_object('success', false, 'error', SQLERRM);
END;
$$;

-- RPC: expire_old_reservations (para cron)
CREATE OR REPLACE FUNCTION public.expire_old_reservations()
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_expired_count INTEGER;
BEGIN
  UPDATE public.credit_reservations
  SET status = 'expired'
  WHERE status = 'reserved'
    AND expire_at < NOW();

  GET DIAGNOSTICS v_expired_count = ROW_COUNT;

  RETURN jsonb_build_object(
    'success', true,
    'expired_count', v_expired_count,
    'timestamp', NOW()
  );
END;
$$;

-- RPC: cleanup_expired_cache
CREATE OR REPLACE FUNCTION public.cleanup_expired_cache()
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_deleted_count INT;
BEGIN
  DELETE FROM public.analysis_cache
  WHERE expires_at < NOW();
  
  GET DIAGNOSTICS v_deleted_count = ROW_COUNT;
  
  RETURN jsonb_build_object(
    'success', true,
    'deleted_count', v_deleted_count
  );
END;
$$;

-- Comentários
COMMENT ON TABLE public.analysis_requests IS 'Histórico completo de análises de ofertas';
COMMENT ON TABLE public.analysis_cache IS 'Cache remoto com TTL de 24 horas';
COMMENT ON TABLE public.credit_reservations IS 'Reservas temporárias de créditos';
COMMENT ON FUNCTION public.reserve_credits IS 'Cria reserva temporária de créditos (não debita ainda)';
COMMENT ON FUNCTION public.commit_reservation IS 'Confirma reserva e debita créditos';
COMMENT ON FUNCTION public.release_reservation IS 'Libera reserva sem debitar';
COMMENT ON FUNCTION public.expire_old_reservations IS 'Expira reservas antigas (cron)';
