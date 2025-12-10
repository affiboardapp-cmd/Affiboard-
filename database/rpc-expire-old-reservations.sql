
-- ============================================
-- RPC: expire_old_reservations
-- Expira reservas antigas automaticamente
-- ============================================

CREATE OR REPLACE FUNCTION public.expire_old_reservations()
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_expired_count INT;
BEGIN
  -- Atualizar reservas expiradas
  UPDATE public.credit_reservations
  SET status = 'expired'
  WHERE status = 'reserved'
    AND expire_at < NOW();
  
  GET DIAGNOSTICS v_expired_count = ROW_COUNT;

  RETURN json_build_object(
    'success', true,
    'expired_count', v_expired_count
  );

EXCEPTION
  WHEN OTHERS THEN
    RETURN json_build_object(
      'success', false,
      'error', SQLERRM
    );
END;
$$;

COMMENT ON FUNCTION public.expire_old_reservations IS 'Expira reservas de créditos antigas (chamado pelo cron job)';
