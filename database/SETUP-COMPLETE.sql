
-- ============================================
-- AFFIBOARD - SETUP COMPLETO SUPABASE
-- ============================================
-- Cole este SQL no SQL Editor do Supabase
-- ============================================

-- 1. CRIAR TABELAS

-- Tabela: analysis_requests
CREATE TABLE IF NOT EXISTS public.analysis_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  url TEXT NOT NULL,
  url_normalized TEXT NOT NULL,
  url_hash VARCHAR(16) NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('pending', 'success', 'failed')),
  result JSONB,
  credits_reserved INTEGER DEFAULT 1,
  reservation_id UUID,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_analysis_requests_user_id ON public.analysis_requests(user_id);
CREATE INDEX IF NOT EXISTS idx_analysis_requests_url_hash ON public.analysis_requests(url_hash);
CREATE INDEX IF NOT EXISTS idx_analysis_requests_status ON public.analysis_requests(status);
CREATE INDEX IF NOT EXISTS idx_analysis_requests_created_at ON public.analysis_requests(created_at DESC);

-- Tabela: analysis_cache
CREATE TABLE IF NOT EXISTS public.analysis_cache (
  url_hash VARCHAR(16) PRIMARY KEY,
  url TEXT NOT NULL,
  offer_data JSONB NOT NULL,
  source TEXT DEFAULT 'scraper',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_analysis_cache_created_at ON public.analysis_cache(created_at DESC);

-- Tabela: credit_reservations
CREATE TABLE IF NOT EXISTS public.credit_reservations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  reserved_amount INTEGER NOT NULL DEFAULT 1,
  status TEXT NOT NULL CHECK (status IN ('reserved', 'committed', 'released', 'expired')),
  expire_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_credit_reservations_user_id ON public.credit_reservations(user_id);
CREATE INDEX IF NOT EXISTS idx_credit_reservations_status ON public.credit_reservations(status);
CREATE INDEX IF NOT EXISTS idx_credit_reservations_expire_at ON public.credit_reservations(expire_at);

-- Trigger: updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER analysis_requests_updated_at
BEFORE UPDATE ON public.analysis_requests
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- 2. CRIAR RPCs
-- ============================================

-- RPC: reserve_credits
CREATE OR REPLACE FUNCTION public.reserve_credits(
  p_user_id UUID,
  p_amount INTEGER DEFAULT 1,
  p_ttl_seconds INTEGER DEFAULT 600
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_current_credits INTEGER;
  v_reservation_id UUID;
  v_expire_at TIMESTAMPTZ;
BEGIN
  SELECT credits INTO v_current_credits
  FROM public.profiles
  WHERE id = p_user_id
  FOR UPDATE;

  IF v_current_credits IS NULL OR v_current_credits < p_amount THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Insufficient credits',
      'credits_available', COALESCE(v_current_credits, 0)
    );
  END IF;

  v_expire_at := NOW() + (p_ttl_seconds || ' seconds')::INTERVAL;

  INSERT INTO public.credit_reservations (user_id, reserved_amount, status, expire_at)
  VALUES (p_user_id, p_amount, 'reserved', v_expire_at)
  RETURNING id INTO v_reservation_id;

  RETURN jsonb_build_object(
    'success', true,
    'reservation_id', v_reservation_id,
    'expires_at', v_expire_at,
    'amount_reserved', p_amount,
    'credits_remaining', v_current_credits
  );
END;
$$;

-- RPC: commit_reservation
CREATE OR REPLACE FUNCTION public.commit_reservation(
  p_reservation_id UUID
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id UUID;
  v_amount INTEGER;
  v_status TEXT;
  v_remaining_credits INTEGER;
BEGIN
  SELECT user_id, reserved_amount, status
  INTO v_user_id, v_amount, v_status
  FROM public.credit_reservations
  WHERE id = p_reservation_id
  FOR UPDATE;

  IF v_user_id IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'Reservation not found');
  END IF;

  IF v_status != 'reserved' THEN
    RETURN jsonb_build_object('success', false, 'error', 'Reservation already processed');
  END IF;

  UPDATE public.profiles
  SET credits = credits - v_amount
  WHERE id = v_user_id
  RETURNING credits INTO v_remaining_credits;

  UPDATE public.credit_reservations
  SET status = 'committed'
  WHERE id = p_reservation_id;

  RETURN jsonb_build_object(
    'success', true,
    'remaining_credits', v_remaining_credits,
    'debited_amount', v_amount
  );
END;
$$;

-- RPC: release_reservation
CREATE OR REPLACE FUNCTION public.release_reservation(
  p_reservation_id UUID
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_status TEXT;
BEGIN
  SELECT status INTO v_status
  FROM public.credit_reservations
  WHERE id = p_reservation_id
  FOR UPDATE;

  IF v_status IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'Reservation not found');
  END IF;

  IF v_status != 'reserved' THEN
    RETURN jsonb_build_object('success', false, 'error', 'Reservation already processed');
  END IF;

  UPDATE public.credit_reservations
  SET status = 'released'
  WHERE id = p_reservation_id;

  RETURN jsonb_build_object('success', true, 'message', 'Reservation released');
END;
$$;

-- RPC: expire_old_reservations
CREATE OR REPLACE FUNCTION public.expire_old_reservations()
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
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

-- ============================================
-- 3. CONFIGURAR RLS
-- ============================================

ALTER TABLE public.analysis_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.analysis_cache ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.credit_reservations ENABLE ROW LEVEL SECURITY;

-- Policies para analysis_requests
CREATE POLICY "Users can view own requests"
  ON public.analysis_requests FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Service can manage requests"
  ON public.analysis_requests FOR ALL
  USING (true);

-- Policies para analysis_cache
CREATE POLICY "Anyone can read cache"
  ON public.analysis_cache FOR SELECT
  USING (true);

CREATE POLICY "Service can manage cache"
  ON public.analysis_cache FOR ALL
  USING (true);

-- Policies para credit_reservations
CREATE POLICY "Users can view own reservations"
  ON public.credit_reservations FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Service can manage reservations"
  ON public.credit_reservations FOR ALL
  USING (true);

-- ============================================
-- ✅ SETUP COMPLETO!
-- ============================================
-- Execute este SQL no Supabase SQL Editor
-- Depois configure as variáveis de ambiente:
-- - SUPABASE_URL
-- - SUPABASE_SERVICE_ROLE_KEY
-- ============================================
