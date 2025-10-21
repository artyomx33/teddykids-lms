#!/bin/bash

# 🔄 Safe Dependency Update Script
# Updates only patch and minor versions (no breaking changes)

set -e

echo "🔄 TeddyKids LMS - Safe Dependency Update"
echo "=========================================="
echo ""

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
  echo -e "${RED}❌ Error: package.json not found${NC}"
  echo "Please run this script from the project root"
  exit 1
fi

echo "📋 Step 1: Checking current status..."
echo ""
npm outdated || true
echo ""

echo -e "${YELLOW}⚠️  This will update the following packages:${NC}"
echo ""
echo "  ✅ @supabase/supabase-js: 2.58.0 → 2.75.1 (minor)"
echo "  ✅ @tanstack/react-query: 5.90.2 → 5.90.5 (patch)"
echo "  ✅ @types/node: 24.6.2 → 24.8.1 (minor)"
echo "  ✅ eslint: 9.37.0 → 9.38.0 (patch)"
echo "  ✅ @eslint/js: 9.37.0 → 9.38.0 (patch)"
echo "  ✅ eslint-plugin-react-refresh: 0.4.23 → 0.4.24 (patch)"
echo "  ✅ framer-motion: 12.23.22 → 12.23.24 (patch)"
echo "  ✅ lovable-tagger: 1.1.10 → 1.1.11 (patch)"
echo "  ✅ react-datepicker: 8.7.0 → 8.8.0 (minor)"
echo "  ✅ react-hook-form: 7.64.0 → 7.65.0 (minor)"
echo "  ✅ typescript-eslint: 8.45.0 → 8.46.1 (minor)"
echo ""

read -p "Continue with safe updates? (y/n) " -n 1 -r
echo ""

if [[ ! $REPLY =~ ^[Yy]$ ]]; then
  echo -e "${YELLOW}⚠️  Update cancelled${NC}"
  exit 0
fi

echo ""
echo "📦 Step 2: Installing safe updates..."
echo ""

npm install \
  @supabase/supabase-js@2.75.1 \
  @tanstack/react-query@5.90.5 \
  @types/node@24.8.1 \
  eslint@9.38.0 \
  @eslint/js@9.38.0 \
  eslint-plugin-react-refresh@0.4.24 \
  framer-motion@12.23.24 \
  lovable-tagger@1.1.11 \
  react-datepicker@8.8.0 \
  react-hook-form@7.65.0 \
  typescript-eslint@8.46.1

echo ""
echo -e "${GREEN}✅ Step 3: Updates installed successfully!${NC}"
echo ""

echo "🧪 Step 4: Running tests..."
echo ""

# Run linter
echo "  → Running ESLint..."
npm run lint || {
  echo -e "${RED}❌ Linting failed${NC}"
  echo "Please fix linting errors before continuing"
  exit 1
}

# Build the project
echo "  → Building project..."
npm run build || {
  echo -e "${RED}❌ Build failed${NC}"
  echo "Please fix build errors before continuing"
  exit 1
}

echo ""
echo -e "${GREEN}✅ All tests passed!${NC}"
echo ""

echo "📊 Step 5: Checking for remaining vulnerabilities..."
echo ""
npm audit || true
echo ""

echo -e "${GREEN}🎉 Safe updates completed successfully!${NC}"
echo ""
echo "Next steps:"
echo "  1. Test the application manually: npm run dev"
echo "  2. Test critical features (forms, data loading, etc.)"
echo "  3. Commit changes: git add package.json package-lock.json"
echo "  4. Commit: git commit -m 'chore(deps): safe minor/patch updates'"
echo ""

