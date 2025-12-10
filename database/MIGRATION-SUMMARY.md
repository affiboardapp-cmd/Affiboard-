
# 🔧 MIGRAÇÃO: analysis_cache - Adicionar user_id

## 📊 Resumo da Mudança

**Objetivo:** Adicionar coluna `user_id` à tabela `analysis_cache` para permitir rastreamento de cache por usuário e implementar RLS adequado.

**Risco:** **BAIXO** ⚠️
- Sem comandos `DROP TABLE` ou `DROP COLUMN`
- Coluna `user_id` adicionada como `nullable` primeiro
- Índices criados após população de dados
- RLS implementado com política permissiva para evitar quebra

## ✅ O Que Foi Feito

1. ✅ Adicionada coluna `user_id UUID` (nullable)
2. ✅ Adicionada coluna `id UUID` como PK (se não existir)
3. ✅ Adicionada coluna `analysis JSONB` (se não existir)
4. ✅ Garantida existência de `url_hash TEXT`
5. ✅ Criados índices: `user_id`, `created_at DESC`, `url_hash`
6. ✅ Ativado RLS na tabela
7. ✅ Criadas 3 políticas RLS:
   - SELECT: usuário vê próprio cache + cache sem dono
   - INSERT: usuário só cria cache próprio
   - ALL: service_role tem acesso total

## 🚀 Próximos Passos

### 1. Executar Verificação
```sql
-- Copie e cole no SQL Editor do Supabase:
-- database/verify-analysis-cache-schema.sql
```

### 2. Executar Migração
```sql
-- Copie e cole no SQL Editor do Supabase:
-- database/migrate-analysis-cache-add-user-id.sql
```

### 3. Validar Resultado
```sql
-- Verificar se user_id foi adicionado:
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'analysis_cache'
  AND column_name = 'user_id';

-- Verificar políticas RLS:
SELECT policyname, permissive, roles, cmd, qual
FROM pg_policies
WHERE tablename = 'analysis_cache';
```

### 4. Atualizar Backend
- O backend já está esperando `user_id` nas rotas
- Rotas `/api/analyze-mvp` e `/api/history` já usam `supabaseAdmin`
- Nenhuma mudança de código necessária

## 📌 Observações Importantes

- **Foreign Key comentada:** Por segurança, não adicionei FK para `auth.users(id)`. Se precisar, descomente a seção 7 do SQL.
- **Cache existente:** Registros antigos terão `user_id = NULL` e serão visíveis para todos (política RLS permite).
- **Compatibilidade:** Migração é 100% backward-compatible.

## 🔍 Troubleshooting

Se aparecer erro "user_id does not exist" após migração:
1. Verifique se o SQL foi executado com sucesso (sem erros)
2. Rode novamente a verificação do schema
3. Confirme que as políticas RLS foram criadas
4. Reinicie o servidor backend: `node backend/server.js`

---
**Data da Migração:** 2025-01-27  
**Responsável:** AffiBoard MVP Team  
**Status:** ✅ Pronto para executar
