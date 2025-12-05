
# INSTRUÇÕES PARA EXECUTAR SQLs NO SUPABASE

## Passo 1: Acessar SQL Editor
1. Vá para https://supabase.com/dashboard
2. Selecione seu projeto AffiBoard
3. Clique em "SQL Editor" no menu lateral

## Passo 2: Executar Schema
1. Copie todo o conteúdo de `database/schema-mvp-complete.sql`
2. Cole no SQL Editor
3. Clique em "Run" ou pressione Ctrl+Enter
4. Verifique se há erros

## Passo 3: Executar RPCs
1. Copie todo o conteúdo de `database/rpc-mvp-complete.sql`
2. Cole no SQL Editor
3. Clique em "Run" ou pressione Ctrl+Enter
4. Verifique se há erros

## Passo 4: Verificar Criação
Execute este SQL para verificar:

```sql
-- Verificar tabelas
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('analysis_requests', 'analysis_cache', 'credit_reservations');

-- Verificar functions
SELECT routine_name FROM information_schema.routines 
WHERE routine_schema = 'public' 
AND routine_name IN ('reserve_credits', 'commit_reservation', 'release_reservation', 'expire_old_reservations');
```

Se tudo retornar 3 tabelas e 4 functions, a instalação está completa! ✅
