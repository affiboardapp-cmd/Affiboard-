
-- Tabela: analysis_cache
-- Cache remoto de análises no Supabase (TTL 24h)

CREATE TABLE IF NOT EXISTS analysis_cache (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  url_hash TEXT UNIQUE NOT NULL,
  url_normalized TEXT NOT NULL,
  score INT NOT NULL,
  title TEXT,
  price TEXT,
  raw_data JSONB NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  expires_at TIMESTAMPTZ NOT NULL DEFAULT (NOW() + INTERVAL '24 hours')
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_analysis_cache_url_hash ON analysis_cache(url_hash);
CREATE INDEX IF NOT EXISTS idx_analysis_cache_expires_at ON analysis_cache(expires_at);

-- Função para limpar cache expirado (executar via cron job)
CREATE OR REPLACE FUNCTION cleanup_expired_cache()
RETURNS void
LANGUAGE plpgsql
AS $$
BEGIN
  DELETE FROM analysis_cache WHERE expires_at < NOW();
END;
$$;

-- Política RLS
ALTER TABLE analysis_cache ENABLE ROW LEVEL SECURITY;

-- Todos podem ler o cache (para otimização)
CREATE POLICY "Anyone can read cache"
  ON analysis_cache
  FOR SELECT
  USING (true);

-- Apenas service_role pode inserir/atualizar
CREATE POLICY "Service role can manage cache"
  ON analysis_cache
  FOR ALL
  USING (auth.role() = 'service_role');

COMMENT ON TABLE analysis_cache IS 'Cache remoto de análises com TTL de 24 horas';
