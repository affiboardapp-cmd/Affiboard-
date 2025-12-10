
-- RPC: commit_reservation
-- Confirma a reserva e salva o resultado da análise
-- Retorna: { success: boolean }

CREATE OR REPLACE FUNCTION commit_reservation(
  p_reservation_id UUID,
  p_result JSONB
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Atualizar status para 'completed' e salvar resultado
  UPDATE analysis_requests
  SET 
    status = 'completed',
    result = p_result,
    updated_at = NOW()
  WHERE id = p_reservation_id
    AND status = 'pending';

  -- Verificar se foi atualizado
  IF NOT FOUND THEN
    RETURN json_build_object(
      'success', false,
      'error', 'Reservation not found or already processed'
    );
  END IF;

  RETURN json_build_object('success', true);

EXCEPTION
  WHEN OTHERS THEN
    RETURN json_build_object(
      'success', false,
      'error', SQLERRM
    );
END;
$$;
