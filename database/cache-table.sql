
-- ============================================
-- TABELA DE CACHE DE OFERTAS
-- ============================================
-- Execute este SQL no Supabase SQL Editor

CREATE TABLE IF NOT EXISTS public.offer_cache (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  url TEXT NOT NULL UNIQUE,
  score INT NOT NULL,
  title TEXT,
  price TEXT,
  raw_json JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índice para busca rápida por URL
CREATE INDEX IF NOT EXISTS idx_offer_cache_url ON public.offer_cache(url);

-- Índice para limpeza de cache antigo
CREATE INDEX IF NOT EXISTS idx_offer_cache_created_at ON public.offer_cache(created_at);

-- RLS: Permitir leitura pública (cache é compartilhado)
ALTER TABLE public.offer_cache ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Cache é público para leitura"
  ON public.offer_cache
  FOR SELECT
  USING (true);

-- RLS: Apenas sistema pode inserir/atualizar
CREATE POLICY "Sistema pode inserir no cache"
  ON public.offer_cache
  FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Sistema pode atualizar cache"
  ON public.offer_cache
  FOR UPDATE
  USING (true);

-- Função para limpar cache antigo (opcional - executar manualmente)
CREATE OR REPLACE FUNCTION public.clean_old_cache(days_old INT DEFAULT 7)
RETURNS INT AS $$
DECLARE
  deleted_count INT;
BEGIN
  DELETE FROM public.offer_cache
  WHERE created_at < NOW() - INTERVAL '1 day' * days_old;
  
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  RETURN deleted_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Comentários
COMMENT ON TABLE public.offer_cache IS 'Cache de análises de ofertas para evitar re-scraping';
COMMENT ON COLUMN public.offer_cache.url IS 'URL da oferta analisada (unique)';
COMMENT ON COLUMN public.offer_cache.raw_json IS 'JSON completo da análise';
COMMENT ON FUNCTION public.clean_old_cache IS 'Remove entradas de cache mais antigas que N dias';
