
#!/bin/bash

# Test: 5 requisições paralelas com mesma URL
# Apenas 1 deve consumir crédito (as outras devem usar cache)

echo "🧪 TESTE DE CONCORRÊNCIA - AffiBoard"
echo "======================================"

# Variáveis
API_URL="${API_URL:-http://localhost:5000}"
TEST_URL="https://www.amazon.com.br/dp/B0EXAMPLE"

# Login para obter token
echo "1️⃣ Fazendo login..."
LOGIN_RESPONSE=$(curl -s -X POST "${API_URL}/api/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"email":"test@affiboard.com","password":"Test123!"}')

TOKEN=$(echo "$LOGIN_RESPONSE" | jq -r '.session.access_token')

if [ "$TOKEN" = "null" ] || [ -z "$TOKEN" ]; then
  echo "❌ Falha no login!"
  exit 1
fi

echo "✅ Token obtido"

# Buscar créditos iniciais
echo ""
echo "2️⃣ Verificando créditos iniciais..."
CREDITS_BEFORE=$(curl -s -X GET "${API_URL}/api/credits" \
  -H "Authorization: Bearer $TOKEN" | jq -r '.credits')

echo "💰 Créditos antes: $CREDITS_BEFORE"

# Disparar 5 requisições em paralelo
echo ""
echo "3️⃣ Disparando 5 requisições paralelas..."

for i in {1..5}; do
  (
    RESPONSE=$(curl -s -X POST "${API_URL}/api/analyze" \
      -H "Authorization: Bearer $TOKEN" \
      -H "Content-Type: application/json" \
      -d "{\"url\":\"$TEST_URL\"}")
    
    CACHED=$(echo "$RESPONSE" | jq -r '.cached')
    CREDITS=$(echo "$RESPONSE" | jq -r '.credits_remaining')
    
    echo "  [Request $i] Cached: $CACHED | Credits: $CREDITS"
  ) &
done

# Aguardar todas as requisições
wait

# Verificar créditos finais
echo ""
echo "4️⃣ Verificando créditos finais..."
sleep 2
CREDITS_AFTER=$(curl -s -X GET "${API_URL}/api/credits" \
  -H "Authorization: Bearer $TOKEN" | jq -r '.credits')

echo "💰 Créditos depois: $CREDITS_AFTER"

# Calcular diferença
CONSUMED=$((CREDITS_BEFORE - CREDITS_AFTER))

echo ""
echo "📊 RESULTADO:"
echo "  Créditos consumidos: $CONSUMED"

if [ "$CONSUMED" -eq 1 ]; then
  echo "  ✅ SUCESSO: Apenas 1 crédito consumido (cache funcionou!)"
  exit 0
else
  echo "  ❌ FALHA: Esperado 1 crédito, consumido $CONSUMED"
  exit 1
fi
