
-- ============================================
-- ARQUIVO DE DOCUMENTAÇÃO - NÃO EXECUTAR
-- ============================================
-- Este arquivo é apenas referência do schema
-- NÃO deve ser executado no banco de dados
-- As tabelas reais já existem no Supabase
-- ============================================

-- Trigger para criar profiles ao criar user
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, created_at)
  VALUES (NEW.id, NOW())
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- remove trigger antiga (se existir) e cria a nova
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- Função RPC segura consume_credits(p_user_id UUID, p_amount INT)
CREATE OR REPLACE FUNCTION public.consume_credits(p_user_id UUID, p_amount INT)
RETURNS BOOLEAN AS $$
DECLARE
  current_credits INT;
BEGIN
  -- trava a linha do usuário
  SELECT credits INTO current_credits
    FROM public.profiles
    WHERE id = p_user_id
    FOR UPDATE;

  IF current_credits IS NULL THEN
    RETURN FALSE;
  END IF;

  IF current_credits >= p_amount THEN
    UPDATE public.profiles
      SET credits = credits - p_amount, updated_at = now()
      WHERE id = p_user_id;
    RETURN TRUE;
  END IF;

  RETURN FALSE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
