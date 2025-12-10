
-- Tabela: analysis_requests
-- Armazena todas as requisições de análise (pending, completed, failed)

CREATE TABLE IF NOT EXISTS analysis_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  url_original TEXT NOT NULL,
  url_normalized TEXT NOT NULL,
  url_hash TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('pending', 'completed', 'failed')),
  result JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Índices para otimização
CREATE INDEX IF NOT EXISTS idx_analysis_requests_user_id ON analysis_requests(user_id);
CREATE INDEX IF NOT EXISTS idx_analysis_requests_url_hash ON analysis_requests(url_hash);
CREATE INDEX IF NOT EXISTS idx_analysis_requests_status ON analysis_requests(status);
CREATE INDEX IF NOT EXISTS idx_analysis_requests_created_at ON analysis_requests(created_at DESC);

-- Índice composto para consultas de cache
CREATE INDEX IF NOT EXISTS idx_analysis_requests_hash_status ON analysis_requests(url_hash, status);

-- Política RLS (Row Level Security)
ALTER TABLE analysis_requests ENABLE ROW LEVEL SECURITY;

-- Usuários só podem ver suas próprias análises
CREATE POLICY "Users can view own analysis requests"
  ON analysis_requests
  FOR SELECT
  USING (auth.uid() = user_id);

-- Comentários
COMMENT ON TABLE analysis_requests IS 'Armazena todas as requisições de análise com sistema de reserva';
COMMENT ON COLUMN analysis_requests.status IS 'Status: pending (aguardando), completed (concluída), failed (erro)';
COMMENT ON COLUMN analysis_requests.url_hash IS 'SHA256 hash da URL normalizada para cache';
