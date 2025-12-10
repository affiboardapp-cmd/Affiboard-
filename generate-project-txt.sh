#!/bin/bash

OUTPUT="projeto-completo.txt"

echo "# AFFIBOARD - PROJETO COMPLETO" > $OUTPUT
echo "# Sistema de Análise de Ofertas para Afiliados" >> $OUTPUT
echo "# Gerado em: $(date)" >> $OUTPUT
echo "" >> $OUTPUT
echo "========================================" >> $OUTPUT
echo "ESTRUTURA DO PROJETO" >> $OUTPUT
echo "========================================" >> $OUTPUT
echo "" >> $OUTPUT

# Mostrar estrutura de pastas (excluindo node_modules, .git, .cache, .local)
find . -type f \( -name "*.ts" -o -name "*.tsx" -o -name "*.css" -o -name "*.json" -o -name "*.html" -o -name "*.md" -o -name "*.sql" \) \
  ! -path "./node_modules/*" ! -path "./.git/*" ! -path "./dist/*" ! -path "./.cache/*" ! -path "./.local/*" ! -path "./.upm/*" | sort >> $OUTPUT

echo "" >> $OUTPUT
echo "========================================" >> $OUTPUT
echo "CONTEÚDO DOS ARQUIVOS" >> $OUTPUT
echo "========================================" >> $OUTPUT

# Arquivos principais para incluir
FILES=(
  "package.json"
  "tsconfig.json"
  "vite.config.ts"
  "tailwind.config.ts"
  "drizzle.config.ts"
  "components.json"
  "replit.md"
  "design_guidelines.md"
  "shared/schema.ts"
  "server/index.ts"
  "server/routes.ts"
  "server/storage.ts"
  "server/vite.ts"
  "client/index.html"
  "client/src/main.tsx"
  "client/src/App.tsx"
  "client/src/index.css"
  "client/src/lib/supabase.ts"
  "client/src/lib/api.ts"
  "client/src/lib/queryClient.ts"
  "client/src/lib/utils.ts"
  "client/src/contexts/AuthContext.tsx"
  "client/src/components/Navbar.tsx"
  "client/src/components/ProtectedRoute.tsx"
  "client/src/pages/login.tsx"
  "client/src/pages/signup.tsx"
  "client/src/pages/dashboard.tsx"
  "client/src/pages/analyze.tsx"
  "client/src/pages/history.tsx"
  "client/src/pages/forgot-password.tsx"
  "client/src/pages/reset-password.tsx"
  "client/src/pages/not-found.tsx"
  "client/src/hooks/use-toast.ts"
  "client/src/hooks/use-mobile.tsx"
  "client/src/components/ui/button.tsx"
  "client/src/components/ui/card.tsx"
  "client/src/components/ui/input.tsx"
  "client/src/components/ui/form.tsx"
  "client/src/components/ui/label.tsx"
  "client/src/components/ui/toast.tsx"
  "client/src/components/ui/toaster.tsx"
  "client/src/components/ui/badge.tsx"
  "client/src/components/ui/progress.tsx"
  "client/src/components/ui/table.tsx"
  "client/src/components/ui/tabs.tsx"
  "client/src/components/ui/dialog.tsx"
  "client/src/components/ui/select.tsx"
  "client/src/components/ui/avatar.tsx"
  "client/src/components/ui/dropdown-menu.tsx"
  "database/schema-reference.sql"
  "test-supabase.ts"
)

for file in "${FILES[@]}"; do
  if [ -f "$file" ]; then
    echo "" >> $OUTPUT
    echo "----------------------------------------" >> $OUTPUT
    echo "ARQUIVO: $file" >> $OUTPUT
    echo "----------------------------------------" >> $OUTPUT
    cat "$file" >> $OUTPUT
    echo "" >> $OUTPUT
  fi
done

echo "" >> $OUTPUT
echo "========================================" >> $OUTPUT
echo "FIM DO PROJETO" >> $OUTPUT
echo "========================================" >> $OUTPUT

echo "Arquivo gerado: $OUTPUT"
