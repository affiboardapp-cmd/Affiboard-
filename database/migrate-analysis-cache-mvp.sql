
-- ============================================
-- MIGRAÇÃO MVP: analysis_cache
-- Adiciona user_id, result e configura RLS
-- ============================================
-- Execute no Supabase SQL Editor

-- 1. Adicionar colunas (se não existirem)
DO $$
BEGIN
  -- Adicionar user_id
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'analysis_cache'
      AND column_name = 'user_id'
  ) THEN
    ALTER TABLE public.analysis_cache ADD COLUMN user_id UUID;
    RAISE NOTICE '✅ Coluna user_id adicionada';
  ELSE
    RAISE NOTICE '⚠️ Coluna user_id já existe';
  END IF;

  -- Adicionar result
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'analysis_cache'
      AND column_name = 'result'
  ) THEN
    ALTER TABLE public.analysis_cache ADD COLUMN result JSONB;
    RAISE NOTICE '✅ Coluna result adicionada';
  ELSE
    RAISE NOTICE '⚠️ Coluna result já existe';
  END IF;
END $$;

-- 2. Criar índices (se não existirem)
CREATE INDEX IF NOT EXISTS idx_cache_url 
  ON public.analysis_cache(url);

CREATE INDEX IF NOT EXISTS idx_cache_user 
  ON public.analysis_cache(user_id);

CREATE INDEX IF NOT EXISTS idx_cache_created 
  ON public.analysis_cache(created_at DESC);

-- 3. Ativar RLS
ALTER TABLE public.analysis_cache ENABLE ROW LEVEL SECURITY;

-- 4. Criar políticas (drop primeiro para evitar conflito)
DROP POLICY IF EXISTS "Users read own analyses" ON public.analysis_cache;
CREATE POLICY "Users read own analyses"
  ON public.analysis_cache
  FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users insert own analyses" ON public.analysis_cache;
CREATE POLICY "Users insert own analyses"
  ON public.analysis_cache
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- 5. Verificar se RPC debit_credits_atomic existe
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_proc
    WHERE proname = 'debit_credits_atomic'
  ) THEN
    RAISE WARNING '⚠️ RPC debit_credits_atomic NÃO encontrada! Execute o script rpc-functions.sql';
  ELSE
    RAISE NOTICE '✅ RPC debit_credits_atomic encontrada';
  END IF;
END $$;

-- 6. Verificar estrutura final
SELECT 
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'analysis_cache'
ORDER BY ordinal_position;

-- 7. Verificar políticas RLS
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual
FROM pg_policies
WHERE schemaname = 'public'
  AND tablename = 'analysis_cache';
