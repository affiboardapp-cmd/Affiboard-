
#!/bin/bash

set -e

BACKEND_URL="http://0.0.0.0:5000"
TEST_EMAIL="hugosantanav9@gmail.com"
TEST_PASSWORD="20631305"
TEST_URL="https://www.amazon.com.br/dp/B08N5WRWNW"

echo "🚀 TESTE E2E COMPLETO - MVP AFFIBOARD"
echo "======================================"
echo ""

# Cores
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

# 1. LOGIN
echo -e "${YELLOW}1️⃣ Fazendo login...${NC}"
LOGIN_RESPONSE=$(curl -s -X POST "$BACKEND_URL/api/auth/login" \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"$TEST_EMAIL\",\"password\":\"$TEST_PASSWORD\"}")

TOKEN=$(echo "$LOGIN_RESPONSE" | jq -r '.token // empty')

if [ -z "$TOKEN" ]; then
  echo -e "${RED}❌ Erro no login${NC}"
  echo "$LOGIN_RESPONSE" | jq .
  exit 1
fi

echo -e "${GREEN}✅ Login bem-sucedido${NC}"
echo ""

# 2. VERIFICAR CRÉDITOS INICIAIS
echo -e "${YELLOW}2️⃣ Verificando créditos iniciais...${NC}"
CREDITS_INITIAL=$(curl -s -X GET "$BACKEND_URL/api/credits" \
  -H "Authorization: Bearer $TOKEN" | jq -r '.credits')

echo -e "${GREEN}✅ Créditos disponíveis: $CREDITS_INITIAL${NC}"
echo ""

# 3. PRIMEIRA ANÁLISE (SEM CACHE)
echo -e "${YELLOW}3️⃣ Primeira análise (sem cache)...${NC}"
ANALYSIS1=$(curl -s -X POST "$BACKEND_URL/api/analyze-mvp" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d "{\"url\":\"$TEST_URL\"}")

SUCCESS1=$(echo "$ANALYSIS1" | jq -r '.success')
CACHED1=$(echo "$ANALYSIS1" | jq -r '.cached')
CREDITS1=$(echo "$ANALYSIS1" | jq -r '.credits_remaining')

if [ "$SUCCESS1" != "true" ] || [ "$CACHED1" != "false" ]; then
  echo -e "${RED}❌ Falhou - deveria ser sucesso sem cache${NC}"
  echo "$ANALYSIS1" | jq .
  exit 1
fi

echo -e "${GREEN}✅ Análise realizada (cached=false)${NC}"
echo -e "${GREEN}   Créditos restantes: $CREDITS1${NC}"
echo ""

# 4. SEGUNDA ANÁLISE (COM CACHE)
echo -e "${YELLOW}4️⃣ Segunda análise (mesma URL - deve usar cache)...${NC}"
sleep 2
ANALYSIS2=$(curl -s -X POST "$BACKEND_URL/api/analyze-mvp" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d "{\"url\":\"$TEST_URL\"}")

CACHED2=$(echo "$ANALYSIS2" | jq -r '.cached')
CREDITS2=$(echo "$ANALYSIS2" | jq -r '.credits_remaining')

if [ "$CACHED2" != "true" ]; then
  echo -e "${RED}❌ Falhou - deveria vir do cache${NC}"
  echo "$ANALYSIS2" | jq .
  exit 1
fi

if [ "$CREDITS2" != "$CREDITS1" ]; then
  echo -e "${RED}❌ Falhou - créditos não deveriam mudar no cache${NC}"
  exit 1
fi

echo -e "${GREEN}✅ Cache funcionando (cached=true, créditos preservados)${NC}"
echo ""

# 5. ANÁLISE COM URL INVÁLIDA (DEVE LIBERAR RESERVA)
echo -e "${YELLOW}5️⃣ Teste de erro (URL inválida - deve liberar reserva)...${NC}"
INVALID_URL="https://invalid-domain-that-does-not-exist-12345.com/test"
ANALYSIS_ERR=$(curl -s -X POST "$BACKEND_URL/api/analyze-mvp" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d "{\"url\":\"$INVALID_URL\"}")

SUCCESS_ERR=$(echo "$ANALYSIS_ERR" | jq -r '.success')

if [ "$SUCCESS_ERR" == "true" ]; then
  echo -e "${RED}❌ Deveria falhar para URL inválida${NC}"
  exit 1
fi

# Verificar se créditos foram preservados
CREDITS_AFTER_ERR=$(curl -s -X GET "$BACKEND_URL/api/credits" \
  -H "Authorization: Bearer $TOKEN" | jq -r '.credits')

if [ "$CREDITS_AFTER_ERR" != "$CREDITS1" ]; then
  echo -e "${RED}❌ Créditos mudaram após erro (não deveria)${NC}"
  exit 1
fi

echo -e "${GREEN}✅ Erro tratado corretamente (reserva liberada, créditos preservados)${NC}"
echo ""

# 6. VERIFICAR HISTÓRICO
echo -e "${YELLOW}6️⃣ Verificando histórico...${NC}"
HISTORY=$(curl -s -X GET "$BACKEND_URL/api/history" \
  -H "Authorization: Bearer $TOKEN")

COUNT=$(echo "$HISTORY" | jq '. | length')
echo -e "${GREEN}✅ Histórico contém $COUNT análises${NC}"
echo ""

echo "======================================"
echo -e "${GREEN}✅ TODOS OS TESTES PASSARAM!${NC}"
echo "======================================"
echo ""
echo "📊 Resumo:"
echo "  - Créditos iniciais: $CREDITS_INITIAL"
echo "  - Após 1ª análise: $CREDITS1"
echo "  - Após cache hit: $CREDITS2"
echo "  - Após erro: $CREDITS_AFTER_ERR"
echo "  - Histórico: $COUNT registros"
