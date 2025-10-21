#!/bin/bash

# 🔒 Security Vulnerability Fix Script
# Fixes critical security vulnerabilities in jsPDF

set -e

echo "🔒 TeddyKids LMS - Security Vulnerability Fix"
echo "=============================================="
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

echo "🚨 Current Security Issues:"
echo ""
echo -e "${RED}  🔴 jsPDF: Denial of Service (DoS) - HIGH${NC}"
echo "     Current: 2.5.2"
echo "     Fixed in: 3.0.3"
echo "     CVE: GHSA-8mvj-3j78-4qmw, GHSA-w532-jxjh-hjhj"
echo ""

echo "📊 Step 1: Running security audit..."
echo ""
npm audit
echo ""

echo -e "${YELLOW}⚠️  This will update jsPDF from 2.5.2 to 3.0.3${NC}"
echo ""
echo "⚠️  WARNING: This is a MAJOR version update!"
echo "   - May contain breaking changes"
echo "   - PDF generation code may need updates"
echo "   - Thorough testing required"
echo ""

read -p "Continue with security fix? (y/n) " -n 1 -r
echo ""

if [[ ! $REPLY =~ ^[Yy]$ ]]; then
  echo -e "${YELLOW}⚠️  Security fix cancelled${NC}"
  exit 0
fi

echo ""
echo "📦 Step 2: Updating jsPDF to 3.0.3..."
echo ""

npm install jspdf@3.0.3

echo ""
echo -e "${GREEN}✅ jsPDF updated successfully!${NC}"
echo ""

echo "🧪 Step 3: Running build test..."
echo ""

npm run build || {
  echo -e "${RED}❌ Build failed${NC}"
  echo "Please check for breaking changes in jsPDF 3.0 API"
  echo "See: https://github.com/parallax/jsPDF/releases/tag/v3.0.0"
  exit 1
}

echo ""
echo -e "${GREEN}✅ Build passed!${NC}"
echo ""

echo "📊 Step 4: Verifying security fix..."
echo ""
npm audit
echo ""

VULN_COUNT=$(npm audit --json | grep -o '"high":[0-9]*' | cut -d: -f2 || echo "0")

if [ "$VULN_COUNT" -eq 0 ]; then
  echo -e "${GREEN}✅ All high-severity vulnerabilities fixed!${NC}"
else
  echo -e "${YELLOW}⚠️  $VULN_COUNT high-severity vulnerabilities remaining${NC}"
  echo "Please review npm audit output above"
fi

echo ""
echo -e "${GREEN}🎉 Security fix completed!${NC}"
echo ""
echo "⚠️  IMPORTANT: Manual testing required!"
echo ""
echo "Test PDF generation:"
echo "  1. Start dev server: npm run dev"
echo "  2. Navigate to Contracts page"
echo "  3. Generate a contract PDF"
echo "  4. Verify PDF is generated correctly"
echo "  5. Check PDF content and formatting"
echo ""
echo "Files to check:"
echo "  - src/lib/contracts.ts (PDF generation logic)"
echo "  - src/lib/renderContractToHtml.tsx (Contract rendering)"
echo ""
echo "If tests pass:"
echo "  git add package.json package-lock.json"
echo "  git commit -m 'fix(deps): update jsPDF to 3.0.3 (security fix)'"
echo ""

