
#!/bin/bash

echo "🔍 DIAGNÓSTICO DO FRONTEND"
echo "=========================="
echo ""

echo "1️⃣ Verificando processos Node..."
ps aux | grep -E "node|vite" | grep -v grep
echo ""

echo "2️⃣ Verificando porta 5000..."
lsof -i :5000 || echo "Porta 5000 livre"
echo ""

echo "3️⃣ Testando backend /health..."
curl -s http://localhost:5000/health | jq . || echo "❌ Backend não responde"
echo ""

echo "4️⃣ Verificando variáveis de ambiente..."
echo "VITE_SUPABASE_URL: ${VITE_SUPABASE_URL:0:30}..."
echo "VITE_SUPABASE_ANON_KEY: ${VITE_SUPABASE_ANON_KEY:0:30}..."
echo ""

echo "5️⃣ Testando root HTML..."
curl -s http://localhost:5000/ | grep -o '<div id="root">' || echo "❌ HTML não encontrado"
echo ""

echo "✅ Diagnóstico completo!"
