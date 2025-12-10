
-- ============================================
-- AFFIBOARD MVP - SCHEMA COMPLETO
-- ============================================

-- Tabela: analysis_requests
CREATE TABLE IF NOT EXISTS analysis_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  url TEXT NOT NULL,
  url_normalized TEXT NOT NULL,
  url_hash VARCHAR(16) NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('pending', 'success', 'failed')),
  result JSONB,
  credits_reserved INTEGER DEFAULT 1,
  reservation_id UUID REFERENCES credit_reservations(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_analysis_requests_user_id ON analysis_requests(user_id);
CREATE INDEX IF NOT EXISTS idx_analysis_requests_url_hash ON analysis_requests(url_hash);
CREATE INDEX IF NOT EXISTS idx_analysis_requests_status ON analysis_requests(status);
CREATE INDEX IF NOT EXISTS idx_analysis_requests_created_at ON analysis_requests(created_at DESC);

-- Tabela: analysis_cache
CREATE TABLE IF NOT EXISTS analysis_cache (
  url_hash VARCHAR(16) PRIMARY KEY,
  url TEXT NOT NULL,
  offer_data JSONB NOT NULL,
  source TEXT DEFAULT 'scraper',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_analysis_cache_created_at ON analysis_cache(created_at DESC);

-- Tabela: credit_reservations
CREATE TABLE IF NOT EXISTS credit_reservations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  reserved_amount INTEGER NOT NULL DEFAULT 1,
  status TEXT NOT NULL CHECK (status IN ('reserved', 'committed', 'released', 'expired')),
  expire_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_credit_reservations_user_id ON credit_reservations(user_id);
CREATE INDEX IF NOT EXISTS idx_credit_reservations_status ON credit_reservations(status);
CREATE INDEX IF NOT EXISTS idx_credit_reservations_expire_at ON credit_reservations(expire_at);

-- Trigger para updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER analysis_requests_updated_at
BEFORE UPDATE ON analysis_requests
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();
