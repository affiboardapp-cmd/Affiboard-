
#!/bin/bash

echo "🧪 Testando fluxo de análise do frontend React..."
echo "================================================"
echo ""

# Verificar se servidor está rodando
if ! curl -s http://localhost:5000/api/health > /dev/null; then
  echo "❌ Backend não está rodando na porta 5000"
  echo "Execute: node backend/server.js"
  exit 1
fi

echo "✅ Backend está rodando"
echo ""

# Teste simples de endpoints
echo "1️⃣ Testando POST /api/analyze-mvp (sem auth - esperado 401)..."
RESPONSE=$(curl -s -w "\n%{http_code}" -X POST http://localhost:5000/api/analyze-mvp \
  -H "Content-Type: application/json" \
  -d '{"url":"https://hotmart.com"}')

HTTP_CODE=$(echo "$RESPONSE" | tail -1)
BODY=$(echo "$RESPONSE" | head -1)

if [ "$HTTP_CODE" = "401" ]; then
  echo "✅ Retornou 401 (esperado)"
else
  echo "❌ Esperado 401, recebeu $HTTP_CODE"
fi

echo ""
echo "2️⃣ Testando GET /api/credits (sem auth - esperado 401)..."
RESPONSE=$(curl -s -w "\n%{http_code}" http://localhost:5000/api/credits)

HTTP_CODE=$(echo "$RESPONSE" | tail -1)

if [ "$HTTP_CODE" = "401" ]; then
  echo "✅ Retornou 401 (esperado)"
else
  echo "❌ Esperado 401, recebeu $HTTP_CODE"
fi

echo ""
echo "✅ Testes básicos concluídos!"
echo ""
echo "🔥 Para testar com autenticação real:"
echo "   1. Acesse o frontend: http://localhost:5173"
echo "   2. Faça login"
echo "   3. Vá para a página de análise"
echo "   4. Teste uma URL de oferta"
