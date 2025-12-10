
-- ============================================
-- AFFIBOARD MVP - CONFIGURAÇÃO COMPLETA
-- Execute este SQL no Supabase SQL Editor
-- ============================================

-- 1. Criar/atualizar tabela analysis_cache
CREATE TABLE IF NOT EXISTS public.analysis_cache (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  url TEXT NOT NULL,
  url_hash TEXT,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  offer_data JSONB,
  analysis JSONB,
  result JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Adicionar colunas se não existirem
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'analysis_cache'
      AND column_name = 'user_id'
  ) THEN
    ALTER TABLE public.analysis_cache ADD COLUMN user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'analysis_cache'
      AND column_name = 'result'
  ) THEN
    ALTER TABLE public.analysis_cache ADD COLUMN result JSONB;
  END IF;
END $$;

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_analysis_cache_url ON public.analysis_cache(url);
CREATE INDEX IF NOT EXISTS idx_analysis_cache_url_hash ON public.analysis_cache(url_hash);
CREATE INDEX IF NOT EXISTS idx_analysis_cache_user_id ON public.analysis_cache(user_id);
CREATE INDEX IF NOT EXISTS idx_analysis_cache_created_at ON public.analysis_cache(created_at DESC);

-- 2. Adicionar colunas em profiles
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS email TEXT,
ADD COLUMN IF NOT EXISTS full_name TEXT;

-- 3. Atualizar trigger handle_new_user
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, credits, created_at)
  VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data->>'full_name',
    10,
    NOW()
  )
  ON CONFLICT (id) DO NOTHING;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Recriar trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 4. Habilitar RLS e criar políticas
ALTER TABLE public.analysis_cache ENABLE ROW LEVEL SECURITY;

-- Remover políticas antigas
DROP POLICY IF EXISTS "Users view own analyses" ON public.analysis_cache;
DROP POLICY IF EXISTS "Users insert own analyses" ON public.analysis_cache;
DROP POLICY IF EXISTS "Users read own analyses" ON public.analysis_cache;
DROP POLICY IF EXISTS "Users insert own analyses" ON public.analysis_cache;

-- Criar políticas corretas
CREATE POLICY "Users view own analyses"
  ON public.analysis_cache
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users insert own analyses"
  ON public.analysis_cache
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- 5. Verificar RPC debit_credits_atomic
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_proc
    WHERE proname = 'debit_credits_atomic'
  ) THEN
    RAISE WARNING '⚠️ RPC debit_credits_atomic NÃO encontrada!';
    RAISE WARNING 'Execute o script: database/ensure-mvp-schema.sql';
  ELSE
    RAISE NOTICE '✅ RPC debit_credits_atomic encontrada';
  END IF;
END $$;

-- 6. Verificar estrutura final das tabelas
SELECT 
  'analysis_cache' as tabela,
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'analysis_cache'
ORDER BY ordinal_position;

SELECT 
  'profiles' as tabela,
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'profiles'
ORDER BY ordinal_position;

-- Verificar políticas RLS
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  cmd
FROM pg_policies
WHERE schemaname = 'public'
  AND tablename IN ('analysis_cache', 'profiles')
ORDER BY tablename, policyname;

-- Validar RPC
SELECT 
  proname AS function_name,
  pg_get_function_identity_arguments(oid) AS arguments
FROM pg_proc 
WHERE proname LIKE '%debit%' 
  AND pronamespace = 'public'::regnamespace;

-- ============================================
-- RESUMO FINAL
-- ============================================
-- ✅ analysis_cache criada/atualizada
-- ✅ profiles com email e full_name
-- ✅ Trigger handle_new_user atualizado
-- ✅ RLS habilitado
-- ✅ Políticas criadas
-- ⚠️ Verificar se debit_credits_atomic existe
