
#!/bin/bash

echo "🚀 Iniciando setup do AffiBoard..."
echo ""

# Cores para output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Criar estrutura de pastas do backend
echo -e "${YELLOW}📁 Criando estrutura de pastas...${NC}"
mkdir -p backend/routes
mkdir -p backend/services
mkdir -p backend/middleware
mkdir -p backend/db
mkdir -p backend/workers

# Criar estrutura de pastas do frontend
mkdir -p frontend/pages
mkdir -p frontend/js
mkdir -p frontend/css
mkdir -p frontend/assets

echo -e "${GREEN}✅ Estrutura de pastas criada${NC}"
echo ""

# Instalar dependências
echo -e "${YELLOW}📦 Instalando dependências...${NC}"
npm install

echo -e "${GREEN}✅ Dependências instaladas${NC}"
echo ""

# Criar .env se não existir
if [ ! -f .env ]; then
  echo -e "${YELLOW}🔐 Criando arquivo .env...${NC}"
  cat > .env << 'EOF'
# Supabase Configuration
VITE_SUPABASE_URL=https://cartfjywytalyzwzajrr.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNhcnRmanl3eXRhbHl6d3phanJyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM3NTc4MzcsImV4cCI6MjA3OTMzMzgzN30.0SMZAqxczdRiXidip5DxwcPUqXtWtruabv9Qckfvfwk

# Server Configuration
PORT=5000
NODE_ENV=development

# SQLite Cache
CACHE_DB_PATH=./backend/db/cache.sqlite
EOF
  echo -e "${GREEN}✅ Arquivo .env criado${NC}"
else
  echo -e "${GREEN}✅ Arquivo .env já existe${NC}"
fi
echo ""

echo -e "${GREEN}🎉 Setup concluído com sucesso!${NC}"
echo ""
echo -e "${YELLOW}Próximos passos:${NC}"
echo "1. Execute: npm run dev"
echo "2. Acesse: http://localhost:5000"
echo ""
