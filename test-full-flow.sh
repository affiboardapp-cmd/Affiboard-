
#!/bin/bash

echo "=============================="
echo "🔐 Fase 1: Obtendo Token JWT"
echo "=============================="
echo ""

# Executa o login e captura apenas o token
TOKEN=$(node temp-login-test.js 2>/dev/null | grep -A 1 "🔑 Token JWT:" | tail -n 1 | tr -d ' ')

if [ -z "$TOKEN" ]; then
  echo "❌ Erro: Não foi possível obter o token JWT"
  exit 1
fi

echo "✅ Token obtido com sucesso!"
echo ""
echo "=============================="
echo "💳 Fase 2: Testando API de Créditos"
echo "=============================="
echo ""

# Testa a API de créditos com o token obtido
curl -X GET http://0.0.0.0:5000/api/credits \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json"

echo ""
echo "=============================="
echo "✅ Teste completo finalizado!"
echo "=============================="
