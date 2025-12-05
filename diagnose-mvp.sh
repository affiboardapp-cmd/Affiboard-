
#!/bin/bash

echo "🔍 AFFIBOARD MVP - DIAGNÓSTICO COMPLETO"
echo "========================================"
echo ""

# 1. Verificar processos
echo "📡 1. Processos Node rodando:"
ps aux | grep -E "node|vite" | grep -v grep || echo "❌ Nenhum processo encontrado"
echo ""

# 2. Verificar portas
echo "📡 2. Portas em uso:"
lsof -i :5000 2>/dev/null && echo "✅ Backend (5000) rodando" || echo "❌ Backend (5000) offline"
lsof -i :5173 2>/dev/null && echo "✅ Vite (5173) rodando" || echo "❌ Vite (5173) offline"
echo ""

# 3. Testar backend
echo "📡 3. Health Check Backend:"
curl -s http://localhost:5000/health | jq . 2>/dev/null || echo "❌ Backend não responde"
echo ""

# 4. Testar Vite
echo "📡 4. Vite Dev Server:"
curl -s -o /dev/null -w "%{http_code}" http://localhost:5173 2>/dev/null | grep -q "200" && echo "✅ Vite OK" || echo "❌ Vite offline"
echo ""

# 5. Verificar env
echo "🔑 5. Variáveis de Ambiente:"
[ -n "$SUPABASE_URL" ] && echo "✅ SUPABASE_URL" || echo "❌ SUPABASE_URL ausente"
[ -n "$SUPABASE_SERVICE_ROLE_KEY" ] && echo "✅ SUPABASE_SERVICE_ROLE_KEY" || echo "❌ SUPABASE_SERVICE_ROLE_KEY ausente"
[ -n "$VITE_SUPABASE_URL" ] && echo "✅ VITE_SUPABASE_URL" || echo "❌ VITE_SUPABASE_URL ausente"
[ -n "$VITE_SUPABASE_ANON_KEY" ] && echo "✅ VITE_SUPABASE_ANON_KEY" || echo "❌ VITE_SUPABASE_ANON_KEY ausente"
echo ""

# 6. Verificar arquivos críticos
echo "📁 6. Arquivos Críticos:"
[ -f "backend/server.js" ] && echo "✅ backend/server.js" || echo "❌ backend/server.js ausente"
[ -f "backend/routes/analyze-mvp.js" ] && echo "✅ backend/routes/analyze-mvp.js" || echo "❌ backend/routes/analyze-mvp.js ausente"
[ -f "vite.config.ts" ] && echo "✅ vite.config.ts" || echo "❌ vite.config.ts ausente"
[ -f "client/src/pages/analyze.tsx" ] && echo "✅ client/src/pages/analyze.tsx" || echo "❌ client/src/pages/analyze.tsx ausente"
echo ""

echo "✅ Diagnóstico completo!"
echo ""
echo "Para iniciar o MVP:"
echo "1. Se backend offline: node backend/server.js"
echo "2. Se Vite offline: npm run dev"
echo "3. Ou use o Run button (Full Stack workflow)"
