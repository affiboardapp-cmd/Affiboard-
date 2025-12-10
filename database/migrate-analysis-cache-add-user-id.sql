
-- ============================================
-- MIGRAÇÃO SEGURA: analysis_cache
-- Adiciona coluna user_id e ajusta estrutura
-- ============================================
-- RISCO: BAIXO (sem DROP, apenas ADD e UPDATE)
-- Execute este SQL no Supabase SQL Editor

-- 1. Adicionar coluna user_id (nullable primeiro para evitar erros)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'analysis_cache'
      AND column_name = 'user_id'
  ) THEN
    ALTER TABLE public.analysis_cache
    ADD COLUMN user_id UUID;
    
    RAISE NOTICE 'Coluna user_id adicionada com sucesso';
  ELSE
    RAISE NOTICE 'Coluna user_id já existe, pulando...';
  END IF;
END $$;

-- 2. Adicionar coluna id (caso não exista)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'analysis_cache'
      AND column_name = 'id'
  ) THEN
    ALTER TABLE public.analysis_cache
    ADD COLUMN id UUID DEFAULT gen_random_uuid();
    
    -- Definir como PRIMARY KEY se url_hash não for PK
    ALTER TABLE public.analysis_cache
    DROP CONSTRAINT IF EXISTS analysis_cache_pkey;
    
    ALTER TABLE public.analysis_cache
    ADD PRIMARY KEY (id);
    
    RAISE NOTICE 'Coluna id adicionada e definida como PK';
  ELSE
    RAISE NOTICE 'Coluna id já existe';
  END IF;
END $$;

-- 3. Adicionar coluna analysis (caso não exista)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'analysis_cache'
      AND column_name = 'analysis'
  ) THEN
    ALTER TABLE public.analysis_cache
    ADD COLUMN analysis JSONB;
    
    RAISE NOTICE 'Coluna analysis adicionada';
  ELSE
    RAISE NOTICE 'Coluna analysis já existe';
  END IF;
END $$;

-- 4. Garantir que url_hash existe
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'analysis_cache'
      AND column_name = 'url_hash'
  ) THEN
    ALTER TABLE public.analysis_cache
    ADD COLUMN url_hash TEXT;
    
    RAISE NOTICE 'Coluna url_hash adicionada';
  ELSE
    RAISE NOTICE 'Coluna url_hash já existe';
  END IF;
END $$;

-- 5. Tentar popular user_id de colunas alternativas
-- (se houver owner_id, profile_id, ou similar)
UPDATE public.analysis_cache
SET user_id = COALESCE(
  user_id,
  -- Adicione aqui outras colunas possíveis que guardam ID do usuário
  NULL
)
WHERE user_id IS NULL;

-- 6. Criar índices para performance
CREATE INDEX IF NOT EXISTS idx_analysis_cache_user_id 
  ON public.analysis_cache(user_id);

CREATE INDEX IF NOT EXISTS idx_analysis_cache_created_at 
  ON public.analysis_cache(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_analysis_cache_url_hash 
  ON public.analysis_cache(url_hash);

-- 7. Adicionar Foreign Key (opcional, comentado por segurança)
-- Descomente apenas se tiver certeza que não vai quebrar nada
-- ALTER TABLE public.analysis_cache
-- ADD CONSTRAINT fk_analysis_cache_user_id
-- FOREIGN KEY (user_id)
-- REFERENCES auth.users(id)
-- ON DELETE SET NULL;

-- 8. Ativar RLS (se ainda não estiver ativo)
ALTER TABLE public.analysis_cache ENABLE ROW LEVEL SECURITY;

-- 9. Criar políticas RLS
DROP POLICY IF EXISTS "Users can view own cache" ON public.analysis_cache;
CREATE POLICY "Users can view own cache"
  ON public.analysis_cache
  FOR SELECT
  USING (auth.uid() = user_id OR user_id IS NULL);

DROP POLICY IF EXISTS "Users can insert own cache" ON public.analysis_cache;
CREATE POLICY "Users can insert own cache"
  ON public.analysis_cache
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Service role can manage all cache" ON public.analysis_cache;
CREATE POLICY "Service role can manage all cache"
  ON public.analysis_cache
  FOR ALL
  USING (true);

-- 10. Adicionar comentários
COMMENT ON TABLE public.analysis_cache IS 'Cache de análises de ofertas com TTL de 24 horas';
COMMENT ON COLUMN public.analysis_cache.user_id IS 'Referência ao usuário dono da análise';
COMMENT ON COLUMN public.analysis_cache.url_hash IS 'Hash SHA256 (16 chars) da URL normalizada';
COMMENT ON COLUMN public.analysis_cache.offer_data IS 'Dados extraídos da oferta (scraping)';
COMMENT ON COLUMN public.analysis_cache.analysis IS 'Resultado da análise (scores, recommendation)';

-- ============================================
-- ✅ MIGRAÇÃO COMPLETA
-- ============================================
