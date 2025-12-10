
#!/bin/bash

echo "🧪 Testando endpoint /api/debug/debug-token..."
echo ""

# Fazer requisição para obter o token
RESPONSE=$(curl -s http://0.0.0.0:5000/api/debug/debug-token)

echo "📥 Resposta da API:"
echo "$RESPONSE" | jq .

# Extrair o token da resposta
TOKEN=$(echo "$RESPONSE" | jq -r '.access_token // empty')

if [ -z "$TOKEN" ]; then
  echo ""
  echo "❌ Erro: Token não foi obtido!"
  echo "Verifique se a rota está funcionando corretamente."
  exit 1
fi

echo ""
echo "✅ Token obtido com sucesso!"
echo ""
echo "🔑 Token JWT:"
echo "$TOKEN"
echo ""

# Testar o token na API de créditos
echo "🧪 Testando token na API de créditos..."
echo ""

CREDITS_RESPONSE=$(curl -s -X GET http://0.0.0.0:5000/api/credits \
  -H "Authorization: Bearer $TOKEN")

echo "📥 Resposta da API de créditos:"
echo "$CREDITS_RESPONSE" | jq .

echo ""
echo "✅ Teste completo!"
