
-- RPC: release_reservation
-- Reverte a reserva em caso de erro e devolve o crédito
-- Retorna: { success: boolean, credits_remaining: int }

CREATE OR REPLACE FUNCTION release_reservation(
  p_reservation_id UUID,
  p_user_id UUID
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_credits_after INT;
BEGIN
  -- 1. Marcar reserva como 'failed'
  UPDATE analysis_requests
  SET 
    status = 'failed',
    updated_at = NOW()
  WHERE id = p_reservation_id
    AND status = 'pending';

  IF NOT FOUND THEN
    RETURN json_build_object(
      'success', false,
      'error', 'Reservation not found or already processed'
    );
  END IF;

  -- 2. Devolver o crédito
  UPDATE profiles
  SET credits = credits + 1
  WHERE id = p_user_id
  RETURNING credits INTO v_credits_after;

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
