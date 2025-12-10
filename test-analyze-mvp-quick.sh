
#!/bin/bash

BACKEND_URL="http://0.0.0.0:5000"
TEST_URL="https://www.amazon.com.br/dp/B08N5WRWNW"

echo "🧪 Teste Rápido: /api/analyze-mvp"
echo "================================="
echo ""

# 1. Health Check
echo "1️⃣ Health check..."
HEALTH=$(curl -s "$BACKEND_URL/health")
echo "$HEALTH" | jq .
echo ""

# 2. Teste (sem auth - deve falhar com 401)
echo "2️⃣ Teste sem auth (esperado: 401)..."
RESPONSE=$(curl -s -X POST "$BACKEND_URL/api/analyze-mvp" \
  -H "Content-Type: application/json" \
  -d "{\"url\":\"$TEST_URL\"}")

echo "$RESPONSE" | jq .
echo ""

echo "✅ Para teste completo com autenticação, use: ./test-mvp-complete-e2e.sh"
