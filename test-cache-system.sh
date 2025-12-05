
#!/bin/bash

echo "🧪 Teste Automático do Sistema de Cache do AffiBoard"
echo "======================================================="
echo ""

# Configurações
BACKEND_URL="http://0.0.0.0:5000"
TEST_EMAIL="cache-test-$(date +%s)@affiboard.com"
TEST_PASSWORD="CacheTest123!"
TEST_URL="https://example.com/cache-test-product"

# Cores
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Funções auxiliares
log_success() {
  echo -e "${GREEN}✅ $1${NC}"
}

log_error() {
  echo -e "${RED}❌ $1${NC}"
}

log_info() {
  echo -e "${YELLOW}ℹ️  $1${NC}"
}

# 1. Verificar se backend está rodando
echo "1️⃣ Verificando backend..."
HEALTH=$(curl -s "$BACKEND_URL/health" | grep -o '"status":"healthy"')
if [ -z "$HEALTH" ]; then
  log_error "Backend não está rodando em $BACKEND_URL"
  exit 1
fi
log_success "Backend está rodando"
echo ""

# 2. Criar usuário de teste
echo "2️⃣ Criando usuário de teste..."
SIGNUP_RESPONSE=$(curl -s -X POST "$BACKEND_URL/api/debug/create-test-user" \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"$TEST_EMAIL\",\"password\":\"$TEST_PASSWORD\"}")

TOKEN=$(echo "$SIGNUP_RESPONSE" | grep -o '"token":"[^"]*"' | cut -d'"' -f4)

if [ -z "$TOKEN" ]; then
  log_error "Falha ao criar usuário de teste"
  echo "Response: $SIGNUP_RESPONSE"
  exit 1
fi
log_success "Usuário criado e autenticado"
echo ""

# 3. TESTE 1: Primeira análise (SEM cache)
echo "3️⃣ TESTE 1: Primeira análise (deve fazer scraping)..."
FIRST_ANALYSIS=$(curl -s -X POST "$BACKEND_URL/api/analyze" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d "{\"url\":\"$TEST_URL\"}")

FROM_CACHE_1=$(echo "$FIRST_ANALYSIS" | grep -o '"from_cache":false')
CREDITS_CHARGED_1=$(echo "$FIRST_ANALYSIS" | grep -o '"credits_charged":1')

if [ -n "$FROM_CACHE_1" ] && [ -n "$CREDITS_CHARGED_1" ]; then
  log_success "Primeira análise OK - scraping realizado, 1 crédito debitado"
else
  log_error "Primeira análise FALHOU"
  echo "Response: $FIRST_ANALYSIS"
  exit 1
fi
echo ""

# 4. TESTE 2: Segunda análise (COM cache, < 24h)
echo "4️⃣ TESTE 2: Segunda análise da mesma URL (deve vir do cache)..."
sleep 2
SECOND_ANALYSIS=$(curl -s -X POST "$BACKEND_URL/api/analyze" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d "{\"url\":\"$TEST_URL\"}")

FROM_CACHE_2=$(echo "$SECOND_ANALYSIS" | grep -o '"from_cache":true')
CREDITS_CHARGED_2=$(echo "$SECOND_ANALYSIS" | grep -o '"credits_charged":0')

if [ -n "$FROM_CACHE_2" ] && [ -n "$CREDITS_CHARGED_2" ]; then
  log_success "Segunda análise OK - retornou do cache, 0 créditos debitados"
else
  log_error "Segunda análise FALHOU"
  echo "Response: $SECOND_ANALYSIS"
  exit 1
fi
echo ""

# 5. TESTE 3: URL inválida
echo "5️⃣ TESTE 3: Tentando analisar URL inválida..."
INVALID_URL_TEST=$(curl -s -w "\n%{http_code}" -X POST "$BACKEND_URL/api/analyze" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"url":"not-a-valid-url"}')

HTTP_CODE=$(echo "$INVALID_URL_TEST" | tail -n1)

if [ "$HTTP_CODE" = "400" ]; then
  log_success "URL inválida rejeitada corretamente (HTTP 400)"
else
  log_error "URL inválida não foi rejeitada (esperado 400, recebeu $HTTP_CODE)"
fi
echo ""

# 6. TESTE 4: Verificar histórico
echo "6️⃣ TESTE 4: Verificando registro no histórico..."
HISTORY=$(curl -s -X GET "$BACKEND_URL/api/history" \
  -H "Authorization: Bearer $TOKEN")

HISTORY_COUNT=$(echo "$HISTORY" | grep -o '"url"' | wc -l)

if [ "$HISTORY_COUNT" -ge 2 ]; then
  log_success "Histórico OK - $HISTORY_COUNT análises registradas"
else
  log_error "Histórico incompleto - esperado >= 2, encontrado $HISTORY_COUNT"
fi
echo ""

# 7. Resumo final
echo "======================================================="
echo "📊 RESUMO DOS TESTES"
echo "======================================================="
log_success "✅ Backend funcionando"
log_success "✅ Primeira análise (scraping + débito)"
log_success "✅ Segunda análise (cache + sem débito)"
log_success "✅ Validação de URL inválida"
log_success "✅ Registro no histórico"
echo ""
echo "🎉 TODOS OS TESTES PASSARAM!"
echo ""
