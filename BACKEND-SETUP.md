
# 🚀 BACKEND SETUP - AFFIBOARD

## 1️⃣ INSTALAR DEPENDÊNCIAS

```bash
npm install express @supabase/supabase-js axios cheerio better-sqlite3 cors dotenv node-cron
```

## 2️⃣ CONFIGURAR SUPABASE

### Cole o SQL completo:
1. Abra o Supabase Dashboard
2. Vá em **SQL Editor**
3. Cole o conteúdo de `database/SETUP-COMPLETE.sql`
4. Execute

## 3️⃣ CONFIGURAR SECRETS (REPLIT)

No Replit, configure nos **Secrets**:

```
SUPABASE_URL=https://seu-projeto.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
PORT=5000
NODE_ENV=development
RESERVATION_TTL_SECONDS=600
```

⚠️ **IMPORTANTE**: Use `SUPABASE_SERVICE_ROLE_KEY` no backend!

## 4️⃣ RODAR O BACKEND

```bash
node backend/server.js
```

Ou use o botão **Run** no Replit.

## 5️⃣ TESTAR A API

### Login (obter token):
```bash
curl -X POST https://seu-backend/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"seu@email.com","password":"senha123"}'
```

### Analisar URL:
```bash
curl -X POST https://seu-backend/api/analyze-mvp \
  -H "Authorization: Bearer SEU_TOKEN_JWT" \
  -H "Content-Type: application/json" \
  -d '{"url":"https://www.mercadolivre.com.br/produto"}'
```

### Verificar créditos:
```bash
curl https://seu-backend/api/credits \
  -H "Authorization: Bearer SEU_TOKEN_JWT"
```

### Histórico:
```bash
curl https://seu-backend/api/history \
  -H "Authorization: Bearer SEU_TOKEN_JWT"
```

## 6️⃣ ESTRUTURA FINAL

```
backend/
├── lib/
│   ├── supabase.js          # Cliente anônimo
│   └── supabaseAdmin.js     # SERVICE_ROLE (backend)
├── routes/
│   ├── analyze-mvp.js       # Rota principal MVP
│   ├── credits.js
│   └── history.js
├── services/
│   ├── cache.js             # SQLite cache
│   └── scraper.js           # axios + cheerio
├── cron/
│   └── expire-reservations.js
└── server.js                # Express server
```

## 7️⃣ FLUXO /api/analyze-mvp

1. ✅ Validar JWT
2. ✅ Normalizar URL
3. ✅ Gerar url_hash (SHA256, 16 chars)
4. ✅ Verificar cache local (SQLite)
5. ✅ Verificar cache remoto (Supabase)
6. ✅ Reservar crédito (RPC)
7. ✅ Scraping (axios + cheerio, 10s timeout)
8. ✅ Salvar cache local + remoto
9. ✅ Commit reservation (RPC)
10. ✅ Rollback se erro (release_reservation)
11. ✅ Retornar resultado JSON

## ✅ PRONTO!

Backend completo e funcional.
