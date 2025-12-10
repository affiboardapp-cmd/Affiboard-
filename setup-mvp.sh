
#!/bin/bash

echo "🚀 AFFIBOARD MVP - SETUP RÁPIDO"
echo "================================"
echo ""

# 1. Matar processos antigos
echo "🔄 1. Limpando processos antigos..."
pkill -f "node backend/server.js" 2>/dev/null
pkill -f "vite" 2>/dev/null
sleep 2
echo "✅ Processos limpos"
echo ""

# 2. Instalar dependências se necessário
if [ ! -d "node_modules" ]; then
  echo "📦 2. Instalando dependências..."
  npm install
  echo "✅ Dependências instaladas"
else
  echo "✅ 2. Dependências já instaladas"
fi
echo ""

# 3. Verificar env
echo "🔑 3. Verificando variáveis de ambiente..."
if [ -z "$SUPABASE_URL" ] || [ -z "$SUPABASE_SERVICE_ROLE_KEY" ]; then
  echo "⚠️  ATENÇÃO: Configure os Secrets no Replit:"
  echo "   - SUPABASE_URL"
  echo "   - SUPABASE_SERVICE_ROLE_KEY"
  echo "   - VITE_SUPABASE_URL"
  echo "   - VITE_SUPABASE_ANON_KEY"
  echo ""
else
  echo "✅ Variáveis de ambiente OK"
fi
echo ""

# 4. Iniciar backend
echo "🚀 4. Iniciando backend..."
node backend/server.js > backend.log 2>&1 &
BACKEND_PID=$!
sleep 3

if kill -0 $BACKEND_PID 2>/dev/null; then
  echo "✅ Backend iniciado (PID: $BACKEND_PID)"
else
  echo "❌ Backend falhou ao iniciar. Veja backend.log"
  cat backend.log
  exit 1
fi
echo ""

# 5. Testar backend
echo "📡 5. Testando backend..."
curl -s http://localhost:5000/health | jq . || echo "❌ Backend não responde"
echo ""

echo "✅ Setup completo!"
echo ""
echo "Próximos passos:"
echo "1. Execute 'npm run dev' para iniciar o Vite"
echo "2. Ou clique no botão Run"
echo "3. Acesse o app no webview"
