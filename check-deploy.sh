#!/bin/bash

# 🚀 Script de Verificação Pré-Deploy para Vercel
# Este script verifica se sua aplicação está pronta para deploy

echo "🔍 Verificando se a aplicação está pronta para deploy..."
echo ""

# Cores para output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

ERRORS=0
WARNINGS=0

# 1. Verificar se node_modules existe
echo "📦 Verificando dependências..."
if [ -d "node_modules" ]; then
    echo -e "${GREEN}✅ node_modules encontrado${NC}"
else
    echo -e "${RED}❌ node_modules não encontrado. Execute 'npm install'${NC}"
    ERRORS=$((ERRORS + 1))
fi
echo ""

# 2. Verificar se .env.example existe
echo "🔐 Verificando arquivo de exemplo de variáveis de ambiente..."
if [ -f ".env.example" ]; then
    echo -e "${GREEN}✅ .env.example encontrado${NC}"
else
    echo -e "${YELLOW}⚠️  .env.example não encontrado (recomendado)${NC}"
    WARNINGS=$((WARNINGS + 1))
fi
echo ""

# 3. Verificar se há URLs hardcoded
echo "🔗 Verificando URLs hardcoded..."
HARDCODED=$(grep -r "localhost:7279" src/ --include="*.ts" --include="*.tsx" 2>/dev/null | grep -v "process.env" | grep -v "//" | wc -l)
if [ "$HARDCODED" -eq 0 ]; then
    echo -e "${GREEN}✅ Nenhuma URL hardcoded encontrada${NC}"
else
    echo -e "${RED}❌ $HARDCODED URL(s) hardcoded encontrada(s). Use process.env.NEXT_PUBLIC_API_URL${NC}"
    ERRORS=$((ERRORS + 1))
fi
echo ""

# 4. Tentar fazer build
echo "🏗️  Tentando fazer build..."
if npm run build > /dev/null 2>&1; then
    echo -e "${GREEN}✅ Build bem-sucedido${NC}"
else
    echo -e "${RED}❌ Build falhou. Execute 'npm run build' para ver os erros${NC}"
    ERRORS=$((ERRORS + 1))
fi
echo ""

# 5. Verificar TypeScript
echo "📘 Verificando erros de TypeScript..."
if npx tsc --noEmit > /dev/null 2>&1; then
    echo -e "${GREEN}✅ Nenhum erro de TypeScript${NC}"
else
    echo -e "${YELLOW}⚠️  Há erros de TypeScript. Execute 'npx tsc --noEmit' para ver${NC}"
    WARNINGS=$((WARNINGS + 1))
fi
echo ""

# 6. Verificar ESLint
echo "🔍 Verificando ESLint..."
if npm run lint > /dev/null 2>&1; then
    echo -e "${GREEN}✅ ESLint passou${NC}"
else
    echo -e "${YELLOW}⚠️  ESLint encontrou problemas. Execute 'npm run lint' para ver${NC}"
    WARNINGS=$((WARNINGS + 1))
fi
echo ""

# Resumo
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📊 RESUMO"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

if [ $ERRORS -eq 0 ] && [ $WARNINGS -eq 0 ]; then
    echo -e "${GREEN}🎉 Tudo pronto para deploy!${NC}"
    echo ""
    echo "Próximos passos:"
    echo "1. Commit e push para o GitHub"
    echo "2. Configure as variáveis de ambiente na Vercel:"
    echo "   - NEXT_PUBLIC_API_URL=<sua-url-do-backend>"
    echo "3. Configure Root Directory na Vercel: FrontEnd/car-tracking"
    echo "4. Clique em Deploy!"
    exit 0
elif [ $ERRORS -eq 0 ]; then
    echo -e "${YELLOW}⚠️  $WARNINGS aviso(s) encontrado(s)${NC}"
    echo "A aplicação pode fazer deploy, mas revise os avisos acima"
    exit 0
else
    echo -e "${RED}❌ $ERRORS erro(s) encontrado(s)${NC}"
    echo -e "${YELLOW}⚠️  $WARNINGS aviso(s) encontrado(s)${NC}"
    echo ""
    echo "Por favor, corrija os erros antes de fazer deploy"
    exit 1
fi
