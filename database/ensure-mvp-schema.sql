
-- ============================================
-- AFFIBOARD MVP - GARANTIR SCHEMA COMPLETO
-- Execute este SQL no Supabase SQL Editor
-- ============================================

-- 1. Garantir tabela analysis_cache com todas as colunas necessárias
ALTER TABLE public.analysis_cache
ADD COLUMN IF NOT EXISTS user_id UUID,
ADD COLUMN IF NOT EXISTS result JSONB;

-- 2. Criar índices para performance
CREATE INDEX IF NOT EXISTS idx_analysis_cache_url ON public.analysis_cache(url);
CREATE INDEX IF NOT EXISTS idx_analysis_cache_user ON public.analysis_cache(user_id);
CREATE INDEX IF NOT EXISTS idx_analysis_cache_created ON public.analysis_cache(created_at DESC);

-- 3. Habilitar RLS
ALTER TABLE public.analysis_cache ENABLE ROW LEVEL SECURITY;

-- 4. Políticas RLS
DROP POLICY IF EXISTS "Users view own analyses" ON public.analysis_cache;
CREATE POLICY "Users view own analyses" ON public.analysis_cache
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users insert own analyses" ON public.analysis_cache;
CREATE POLICY "Users insert own analyses" ON public.analysis_cache
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- 5. Criar função debit_credits_atomic (se não existir)
CREATE OR REPLACE FUNCTION public.debit_credits_atomic(
  p_user_id UUID,
  p_amount INTEGER DEFAULT 1
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_current_credits INTEGER;
  v_new_credits INTEGER;
BEGIN
  -- Lock na linha do usuário
  SELECT credits INTO v_current_credits
  FROM public.profiles
  WHERE id = p_user_id
  FOR UPDATE;

  -- Verificar se existe
  IF v_current_credits IS NULL THEN
    RETURN json_build_object(
      'success', false,
      'error', 'User not found'
    );
  END IF;

  -- Verificar créditos suficientes
  IF v_current_credits < p_amount THEN
    RETURN json_build_object(
      'success', false,
      'error', 'Insufficient credits',
      'credits_remaining', v_current_credits
    );
  END IF;

  -- Debitar atomicamente
  UPDATE public.profiles
  SET credits = credits - p_amount
  WHERE id = p_user_id
  RETURNING credits INTO v_new_credits;

  RETURN json_build_object(
    'success', true,
    'credits_remaining', v_new_credits
  );

EXCEPTION
  WHEN OTHERS THEN
    RETURN json_build_object(
      'success', false,
      'error', SQLERRM
    );
END;
$$;

-- 6. Verificar se a função foi criada
SELECT 
  proname AS function_name,
  pg_get_function_identity_arguments(oid) AS arguments
FROM pg_proc 
WHERE proname LIKE '%debit%' AND pronamespace = 'public'::regnamespace;

-- OK se retornar: debit_credits_atomic(p_user_id uuid, p_amount integer)
