
-- ============================================
-- AFFIBOARD MVP - RPCs COMPLETAS
-- ============================================

-- 1. reserve_credits
CREATE OR REPLACE FUNCTION reserve_credits(
  p_user_id UUID,
  p_amount INTEGER DEFAULT 1,
  p_ttl_seconds INTEGER DEFAULT 600
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_current_credits INTEGER;
  v_reservation_id UUID;
  v_expire_at TIMESTAMPTZ;
BEGIN
  -- Lock do perfil do usuário
  SELECT credits INTO v_current_credits
  FROM profiles
  WHERE id = p_user_id
  FOR UPDATE;

  -- Verificar se há créditos suficientes
  IF v_current_credits IS NULL OR v_current_credits < p_amount THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Insufficient credits',
      'credits_available', COALESCE(v_current_credits, 0)
    );
  END IF;

  -- Calcular expiração
  v_expire_at := NOW() + (p_ttl_seconds || ' seconds')::INTERVAL;

  -- Criar reserva
  INSERT INTO credit_reservations (user_id, reserved_amount, status, expire_at)
  VALUES (p_user_id, p_amount, 'reserved', v_expire_at)
  RETURNING id INTO v_reservation_id;

  RETURN jsonb_build_object(
    'success', true,
    'reservation_id', v_reservation_id,
    'expires_at', v_expire_at,
    'amount_reserved', p_amount
  );
END;
$$;

-- 2. commit_reservation
CREATE OR REPLACE FUNCTION commit_reservation(
  p_reservation_id UUID
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_user_id UUID;
  v_amount INTEGER;
  v_status TEXT;
  v_remaining_credits INTEGER;
BEGIN
  -- Buscar reserva com lock
  SELECT user_id, reserved_amount, status
  INTO v_user_id, v_amount, v_status
  FROM credit_reservations
  WHERE id = p_reservation_id
  FOR UPDATE;

  -- Validações
  IF v_user_id IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'Reservation not found');
  END IF;

  IF v_status != 'reserved' THEN
    RETURN jsonb_build_object('success', false, 'error', 'Reservation already processed');
  END IF;

  -- Debitar créditos atomicamente
  UPDATE profiles
  SET credits = credits - v_amount
  WHERE id = v_user_id
  RETURNING credits INTO v_remaining_credits;

  -- Marcar reserva como committed
  UPDATE credit_reservations
  SET status = 'committed'
  WHERE id = p_reservation_id;

  RETURN jsonb_build_object(
    'success', true,
    'remaining_credits', v_remaining_credits,
    'debited_amount', v_amount
  );
END;
$$;

-- 3. release_reservation
CREATE OR REPLACE FUNCTION release_reservation(
  p_reservation_id UUID
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_status TEXT;
BEGIN
  -- Buscar status com lock
  SELECT status INTO v_status
  FROM credit_reservations
  WHERE id = p_reservation_id
  FOR UPDATE;

  IF v_status IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'Reservation not found');
  END IF;

  IF v_status != 'reserved' THEN
    RETURN jsonb_build_object('success', false, 'error', 'Reservation already processed');
  END IF;

  -- Marcar como released
  UPDATE credit_reservations
  SET status = 'released'
  WHERE id = p_reservation_id;

  RETURN jsonb_build_object('success', true, 'message', 'Reservation released');
END;
$$;

-- 4. expire_old_reservations (para cron)
CREATE OR REPLACE FUNCTION expire_old_reservations()
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_expired_count INTEGER;
BEGIN
  UPDATE credit_reservations
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
