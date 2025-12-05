
#!/bin/bash

echo "🧪 TESTE DO FLUXO DE ANÁLISE - AffiBoard"
echo "=========================================="
echo ""

# 1. Verificar se o backend está rodando
echo "1️⃣ Verificando backend..."
if curl -s http://0.0.0.0:5000/health > /dev/null 2>&1; then
    echo "✅ Backend está rodando"
else
    echo "❌ Backend NÃO está rodando"
    echo "   Execute: node backend/server.js"
    exit 1
fi

echo ""
echo "2️⃣ Testando endpoint /api/analyze (sem autenticação)..."
curl -X POST http://0.0.0.0:5000/api/analyze/test \
  -H "Content-Type: application/json" \
  -d '{"url": "https://example.com"}' \
  -s | jq '.'

echo ""
echo "3️⃣ Para testar com autenticação:"
echo "   a) Acesse: http://0.0.0.0:5000"
echo "   b) Faça login"
echo "   c) Clique em 'Copiar Token DEV'"
echo "   d) Execute:"
echo ""
echo "      export TOKEN='SEU_TOKEN_AQUI'"
echo "      curl -X POST http://0.0.0.0:5000/api/analyze \\"
echo "        -H 'Content-Type: application/json' \\"
echo "        -H 'Authorization: Bearer \$TOKEN' \\"
echo "        -d '{\"url\": \"https://example.com\"}'"
echo ""
echo "✅ Testes básicos concluídos!"
