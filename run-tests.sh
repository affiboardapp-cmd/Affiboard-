
#!/bin/bash

echo "🚀 Iniciando backend..."
node backend/server.js &
BACKEND_PID=$!

echo "⏳ Aguardando backend inicializar (5s)..."
sleep 5

echo "🧪 Executando testes E2E..."
chmod +x test-mvp-complete-e2e.sh
./test-mvp-complete-e2e.sh

echo ""
echo "🛑 Parando backend..."
kill $BACKEND_PID

echo "✅ Testes concluídos!"
