
-- ============================================
-- RPCs ATÔMICOS PARA GERENCIAMENTO DE CRÉDITOS
-- ============================================

-- RPC: reserve_credits
-- Cria uma reserva sem debitar ainda
CREATE OR REPLACE FUNCTION public.reserve_credits(
  p_user_id UUID,
  p_amount INT DEFAULT 1,
  p_ttl_seconds INT DEFAULT 900
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_current_credits INT;
  v_reservation_id UUID;
BEGIN
  -- 1. Verificar créditos com lock
  SELECT credits INTO v_current_credits
  FROM public.profiles
  WHERE id = p_user_id
  FOR UPDATE;

  IF v_current_credits IS NULL THEN
    RETURN json_build_object(
      'success', false,
      'error', 'User not found'
    );
  END IF;

  IF v_current_credits < p_amount THEN
    RETURN json_build_object(
      'success', false,
      'error', 'Insufficient credits',
      'credits_remaining', v_current_credits
    );
  END IF;

  -- 2. Criar reserva (NÃO debita ainda)
  INSERT INTO public.credit_reservations (
    user_id,
    amount,
    status,
    expire_at
  )
  VALUES (
    p_user_id,
    p_amount,
    'reserved',
    NOW() + (p_ttl_seconds || ' seconds')::INTERVAL
  )
  RETURNING id INTO v_reservation_id;

  RETURN json_build_object(
    'success', true,
    'reservation_id', v_reservation_id,
    'credits_remaining', v_current_credits
  );

EXCEPTION
  WHEN OTHERS THEN
    RETURN json_build_object(
      'success', false,
      'error', SQLERRM
    );
END;
$$;

-- RPC: commit_reservation
-- Confirma a reserva e debita os créditos
CREATE OR REPLACE FUNCTION public.commit_reservation(
  p_reservation_id UUID
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_user_id UUID;
  v_amount INT;
  v_credits_after INT;
BEGIN
  -- 1. Buscar reserva
  SELECT user_id, amount
  INTO v_user_id, v_amount
  FROM public.credit_reservations
  WHERE id = p_reservation_id
    AND status = 'reserved'
  FOR UPDATE;

  IF v_user_id IS NULL THEN
    RETURN json_build_object(
      'success', false,
      'error', 'Reservation not found or already processed'
    );
  END IF;

  -- 2. Debitar créditos
  UPDATE public.profiles
  SET credits = credits - v_amount
  WHERE id = v_user_id
  RETURNING credits INTO v_credits_after;

  -- 3. Marcar reserva como committed
  UPDATE public.credit_reservations
  SET status = 'committed'
  WHERE id = p_reservation_id;

  RETURN json_build_object(
    'success', true,
    'credits_remaining', v_credits_after
  );

EXCEPTION
  WHEN OTHERS THEN
    RETURN json_build_object(
      'success', false,
      'error', SQLERRM
    );
END;
$$;

-- RPC: release_reservation
-- Libera a reserva sem debitar
CREATE OR REPLACE FUNCTION public.release_reservation(
  p_reservation_id UUID
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_user_id UUID;
  v_credits INT;
BEGIN
  -- 1. Buscar reserva
  SELECT user_id
  INTO v_user_id
  FROM public.credit_reservations
  WHERE id = p_reservation_id
    AND status = 'reserved'
  FOR UPDATE;

  IF v_user_id IS NULL THEN
    RETURN json_build_object(
      'success', false,
      'error', 'Reservation not found or already processed'
    );
  END IF;

  -- 2. Marcar como released
  UPDATE public.credit_reservations
  SET status = 'released'
  WHERE id = p_reservation_id;

  -- 3. Buscar créditos atuais
  SELECT credits INTO v_credits
  FROM public.profiles
  WHERE id = v_user_id;

  RETURN json_build_object(
    'success', true,
    'credits_remaining', v_credits
  );

EXCEPTION
  WHEN OTHERS THEN
    RETURN json_build_object(
      'success', false,
      'error', SQLERRM
    );
END;
$$;

-- Comentários
COMMENT ON FUNCTION public.reserve_credits IS 'Cria reserva temporária de créditos (não debita ainda)';
COMMENT ON FUNCTION public.commit_reservation IS 'Confirma reserva e debita créditos';
COMMENT ON FUNCTION public.release_reservation IS 'Libera reserva sem debitar';
