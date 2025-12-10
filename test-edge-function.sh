
#!/bin/bash

# Cores para output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${YELLOW}🧪 Testando Edge Function analyze-offer-index-ts${NC}\n"

# Verifica se as variáveis de ambiente existem
if [ -z "$SUPABASE_URL" ] || [ -z "$SUPABASE_ANON_KEY" ]; then
  echo -e "${RED}❌ Erro: SUPABASE_URL ou SUPABASE_ANON_KEY não estão configurados${NC}"
  echo "Configure-os em Tools → Secrets no Replit"
  exit 1
fi

echo -e "${GREEN}✓ Variáveis de ambiente encontradas${NC}"
echo -e "URL: $SUPABASE_URL\n"

# Faz a requisição
echo -e "${YELLOW}📡 Enviando requisição para API...${NC}\n"

RESPONSE=$(curl -s -w "\n%{http_code}" -X POST \
  "${SUPABASE_URL}/api/analyze-mvp" \
  -H "Authorization: Bearer ${SUPABASE_ANON_KEY}" \
  -H "Content-Type: application/json" \
  -d '{"url": "https://hotmart.com"}')

# Separa o body do status code
HTTP_BODY=$(echo "$RESPONSE" | head -n -1)
HTTP_STATUS=$(echo "$RESPONSE" | tail -n 1)

echo -e "${YELLOW}Status HTTP:${NC} $HTTP_STATUS"
echo -e "${YELLOW}Resposta:${NC}\n$HTTP_BODY\n"

# Verifica o resultado
if [ "$HTTP_STATUS" -eq 200 ]; then
  echo -e "${GREEN}✅ Sucesso! Edge Function respondeu corretamente${NC}"
elif [ "$HTTP_STATUS" -eq 401 ]; then
  echo -e "${RED}❌ Erro 401: Token inválido ou expirado${NC}"
  echo "Possíveis causas:"
  echo "1. SUPABASE_ANON_KEY incorreto"
  echo "2. Edge Function requer autenticação de usuário (não apenas anon key)"
  echo "3. Configuração de JWT na Edge Function"
elif [ "$HTTP_STATUS" -eq 500 ]; then
  echo -e "${RED}❌ Erro 500: Erro interno na Edge Function${NC}"
  echo "Verifique os logs da função no Supabase Dashboard"
else
  echo -e "${RED}❌ Erro HTTP $HTTP_STATUS${NC}"
fi
