
#!/bin/bash

echo "🧪 Testando Fluxo de Análise React → Express"
echo "=============================================="

# 1. Verificar se backend está rodando
echo ""
echo "1️⃣ Verificando backend..."
BACKEND_HEALTH=$(curl -s http://0.0.0.0:5000/health 2>/dev/null | grep -o '"status":"healthy"')

if [ -z "$BACKEND_HEALTH" ]; then
  echo "❌ Backend não está rodando em http://0.0.0.0:5000"
  echo "   Execute o workflow: 'Full Stack (React + Backend)'"
  exit 1
fi

echo "✅ Backend está rodando"

# 2. Verificar frontend React
echo ""
echo "2️⃣ Verificando frontend React..."
FRONTEND_CHECK=$(curl -s http://0.0.0.0:5173 2>/dev/null | grep -o "vite")

if [ -z "$FRONTEND_CHECK" ]; then
  echo "❌ Frontend React não está rodando"
  echo "   Execute: npm run dev"
  exit 1
fi

echo "✅ Frontend React está rodando em http://0.0.0.0:5173"

# 3. Testar rota /api/analyze
echo ""
echo "3️⃣ Testando endpoint /api/analyze..."
echo "   (Obs: Este teste vai falhar sem token, mas confirma que a rota existe)"

ANALYZE_RESPONSE=$(curl -s -w "\n%{http_code}" -X POST http://0.0.0.0:5000/api/analyze \
  -H "Content-Type: application/json" \
  -d '{"url":"https://example.com"}' 2>/dev/null)

HTTP_CODE=$(echo "$ANALYZE_RESPONSE" | tail -n1)

if [ "$HTTP_CODE" = "401" ]; then
  echo "✅ Rota /api/analyze existe e requer autenticação (correto!)"
elif [ "$HTTP_CODE" = "400" ]; then
  echo "✅ Rota /api/analyze existe e valida entrada (correto!)"
else
  echo "⚠️ Resposta HTTP: $HTTP_CODE"
fi

# 4. Instruções para teste manual
echo ""
echo "🎯 TESTE MANUAL - Siga estes passos:"
echo ""
echo "   1. Abra: http://0.0.0.0:5173/login"
echo "   2. Faça login com suas credenciais"
echo "   3. Navegue para: http://0.0.0.0:5173/analyze"
echo "   4. Cole uma URL (ex: https://www.hotmart.com/pt-br/marketplace/produtos/curso-teste)"
echo "   5. Clique em 'Analisar'"
echo "   6. Verifique se o score aparece na tela"
echo "   7. Veja no console do navegador (F12) os logs de 📡, 🔑, 📥, ✅"
echo ""
echo "📊 Endpoint da API: http://0.0.0.0:5000/api/analyze"
echo "🔑 Autenticação: Bearer JWT (Supabase)"
echo ""
echo "✅ Backend e Frontend prontos para teste!"
