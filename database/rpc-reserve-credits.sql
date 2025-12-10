
-- RPC: reserve_credits
-- Reserva 1 crédito do usuário e cria uma entrada pendente
-- Retorna: { success: boolean, reservation_id: uuid, credits_remaining: int }

CREATE OR REPLACE FUNCTION reserve_credits(
  p_user_id UUID,
  p_url_normalized TEXT,
  p_url_hash TEXT
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_current_credits INT;
  v_reservation_id UUID;
  v_result JSON;
BEGIN
  -- 1. Verificar créditos disponíveis com lock
  SELECT credits INTO v_current_credits
  FROM profiles
  WHERE id = p_user_id
  FOR UPDATE;

  -- 2. Validar se tem créditos
  IF v_current_credits IS NULL THEN
    RETURN json_build_object(
      'success', false,
      'error', 'User not found'
    );
  END IF;

  IF v_current_credits < 1 THEN
    RETURN json_build_object(
      'success', false,
      'error', 'Insufficient credits',
      'credits_remaining', v_current_credits
    );
  END IF;

  -- 3. Debitar 1 crédito
  UPDATE profiles
  SET credits = credits - 1
  WHERE id = p_user_id;

  -- 4. Criar reserva na tabela analysis_requests
  INSERT INTO analysis_requests (
    user_id,
    url_original,
    url_normalized,
    url_hash,
    status,
    created_at,
    updated_at
  )
  VALUES (
    p_user_id,
    p_url_normalized,
    p_url_normalized,
    p_url_hash,
    'pending',
    NOW(),
    NOW()
  )
  RETURNING id INTO v_reservation_id;

  -- 5. Retornar sucesso
  RETURN json_build_object(
    'success', true,
    'reservation_id', v_reservation_id,
    'credits_remaining', v_current_credits - 1
  );

EXCEPTION
  WHEN OTHERS THEN
    RETURN json_build_object(
      'success', false,
      'error', SQLERRM
    );
END;
$$;
