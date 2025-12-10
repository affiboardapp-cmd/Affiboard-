
#!/bin/bash

# ============================================
# TESTE E2E DO MVP AFFIBOARD
# ============================================

set -e

BACKEND_URL="http://0.0.0.0:5000"
TEST_EMAIL="hugosantanav9@gmail.com"
TEST_PASSWORD="20631305"
TEST_URL="https://www.amazon.com.br/dp/B08N5WRWNW"

echo "🚀 TESTE E2E DO MVP AFFIBOARD"
echo "=============================="
echo ""

# 1. LOGIN
echo "1️⃣ Fazendo login..."
LOGIN_RESPONSE=$(curl -s -X POST "$BACKEND_URL/api/auth/login" \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"$TEST_EMAIL\",\"password\":\"$TEST_PASSWORD\"}")

TOKEN=$(echo "$LOGIN_RESPONSE" | grep -o '"token":"[^"]*' | cut -d'"' -f4)

if [ -z "$TOKEN" ]; then
  echo "❌ Erro no login"
  echo "$LOGIN_RESPONSE"
  exit 1
fi

echo "✅ Login bem-sucedido"
echo "Token: ${TOKEN:0:30}..."
echo ""

# 2. VERIFICAR CRÉDITOS
echo "2️⃣ Verificando créditos..."
CREDITS_RESPONSE=$(curl -s -X GET "$BACKEND_URL/api/credits" \
  -H "Authorization: Bearer $TOKEN")

CREDITS=$(echo "$CREDITS_RESPONSE" | grep -o '"credits":[0-9]*' | cut -d':' -f2)

echo "✅ Créditos disponíveis: $CREDITS"
echo ""

# 3. PRIMEIRA ANÁLISE (SEM CACHE)
echo "3️⃣ Primeira análise (sem cache)..."
ANALYSIS1=$(curl -s -X POST "$BACKEND_URL/api/analyze" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d "{\"url\":\"$TEST_URL\"}")

CACHED1=$(echo "$ANALYSIS1" | grep -o '"cached":false')
if [ -z "$CACHED1" ]; then
  echo "❌ Deveria ser análise nova (cached=false)"
  echo "$ANALYSIS1"
  exit 1
fi

echo "✅ Análise realizada (cached=false)"
echo ""

# 4. SEGUNDA ANÁLISE (COM CACHE)
echo "4️⃣ Segunda análise (com cache)..."
sleep 2
ANALYSIS2=$(curl -s -X POST "$BACKEND_URL/api/analyze" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d "{\"url\":\"$TEST_URL\"}")

CACHED2=$(echo "$ANALYSIS2" | grep -o '"cached":true')
if [ -z "$CACHED2" ]; then
  echo "❌ Deveria vir do cache (cached=true)"
  echo "$ANALYSIS2"
  exit 1
fi

echo "✅ Cache funcionando (cached=true)"
echo ""

# 5. VERIFICAR HISTÓRICO
echo "5️⃣ Verificando histórico..."
HISTORY=$(curl -s -X GET "$BACKEND_URL/api/history" \
  -H "Authorization: Bearer $TOKEN")

COUNT=$(echo "$HISTORY" | grep -o '"id"' | wc -l)
echo "✅ Histórico contém $COUNT análises"
echo ""

echo "=============================="
echo "✅ TODOS OS TESTES PASSARAM!"
echo "=============================="
