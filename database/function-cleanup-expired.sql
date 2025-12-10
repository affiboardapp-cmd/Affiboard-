
-- Função: cleanup_expired_requests
-- Remove análises pendentes há mais de 15 minutos (timeout de reserva)

CREATE OR REPLACE FUNCTION cleanup_expired_requests()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Marcar como 'failed' análises pendentes há mais de 15 minutos
  UPDATE analysis_requests
  SET 
    status = 'failed',
    updated_at = NOW()
  WHERE status = 'pending'
    AND created_at < NOW() - INTERVAL '15 minutes';
  
  -- Log de limpeza
  RAISE NOTICE 'Limpeza executada: % requisições expiradas marcadas como failed', 
    (SELECT COUNT(*) FROM analysis_requests WHERE status = 'failed' AND updated_at = NOW());
END;
$$;

-- Para executar manualmente ou via cron job:
-- SELECT cleanup_expired_requests();

COMMENT ON FUNCTION cleanup_expired_requests IS 'Limpa requisições pendentes há mais de 15 minutos';
