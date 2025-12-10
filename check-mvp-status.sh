
#!/bin/bash

echo "🔍 AffiBoard MVP - Status Check"
echo "================================"
echo ""

echo "📡 Backend (porta 5000):"
curl -s http://localhost:5000/health | jq . || echo "❌ Backend offline"
echo ""

echo "📡 Vite Dev Server (porta 5173):"
curl -s http://localhost:5173 > /dev/null && echo "✅ Vite respondendo" || echo "❌ Vite offline"
echo ""

echo "🔑 Variáveis de ambiente:"
[ -n "$SUPABASE_URL" ] && echo "✅ SUPABASE_URL configurado" || echo "❌ SUPABASE_URL ausente"
[ -n "$SUPABASE_SERVICE_ROLE_KEY" ] && echo "✅ SUPABASE_SERVICE_ROLE_KEY configurado" || echo "❌ SUPABASE_SERVICE_ROLE_KEY ausente"
echo ""

echo "🔄 Processos Node rodando:"
ps aux | grep node | grep -v grep
