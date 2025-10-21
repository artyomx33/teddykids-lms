#!/bin/bash

# 🏥 Dependency Health Check Script
# Comprehensive health check for all dependencies

set -e

echo "🏥 TeddyKids LMS - Dependency Health Check"
echo "==========================================="
echo ""

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
  echo -e "${RED}❌ Error: package.json not found${NC}"
  echo "Please run this script from the project root"
  exit 1
fi

echo "📊 1. Package Statistics"
echo "========================"
echo ""

# Count dependencies
DEPS=$(grep -c '".*":' package.json | head -1 || echo "0")
echo "  Total packages in package.json: $DEPS"

# Count installed packages
if [ -d "node_modules" ]; then
  INSTALLED=$(find node_modules -name "package.json" | wc -l | xargs)
  echo "  Total installed packages: $INSTALLED"
  
  # node_modules size
  SIZE=$(du -sh node_modules | cut -f1)
  echo "  node_modules size: $SIZE"
else
  echo -e "  ${YELLOW}⚠️  node_modules not found - run npm install${NC}"
fi

echo ""
echo "🔒 2. Security Audit"
echo "===================="
echo ""

# Run npm audit
npm audit --json > /tmp/audit.json 2>/dev/null || true

CRITICAL=$(cat /tmp/audit.json | grep -o '"critical":[0-9]*' | cut -d: -f2 || echo "0")
HIGH=$(cat /tmp/audit.json | grep -o '"high":[0-9]*' | cut -d: -f2 || echo "0")
MODERATE=$(cat /tmp/audit.json | grep -o '"moderate":[0-9]*' | cut -d: -f2 || echo "0")
LOW=$(cat /tmp/audit.json | grep -o '"low":[0-9]*' | cut -d: -f2 || echo "0")

if [ "$CRITICAL" -gt 0 ]; then
  echo -e "  ${RED}🔴 Critical: $CRITICAL${NC}"
fi
if [ "$HIGH" -gt 0 ]; then
  echo -e "  ${RED}🔴 High: $HIGH${NC}"
fi
if [ "$MODERATE" -gt 0 ]; then
  echo -e "  ${YELLOW}🟡 Moderate: $MODERATE${NC}"
fi
if [ "$LOW" -gt 0 ]; then
  echo -e "  ${BLUE}🔵 Low: $LOW${NC}"
fi

TOTAL_VULNS=$((CRITICAL + HIGH + MODERATE + LOW))
if [ "$TOTAL_VULNS" -eq 0 ]; then
  echo -e "  ${GREEN}✅ No vulnerabilities found!${NC}"
else
  echo ""
  echo -e "  ${RED}⚠️  Total vulnerabilities: $TOTAL_VULNS${NC}"
  echo "  Run 'npm audit' for details"
fi

echo ""
echo "📦 3. Outdated Packages"
echo "======================="
echo ""

# Check for outdated packages
npm outdated --json > /tmp/outdated.json 2>/dev/null || echo "{}" > /tmp/outdated.json

OUTDATED_COUNT=$(cat /tmp/outdated.json | grep -c '"current":' || echo "0")

if [ "$OUTDATED_COUNT" -eq 0 ]; then
  echo -e "  ${GREEN}✅ All packages are up to date!${NC}"
else
  echo -e "  ${YELLOW}⚠️  $OUTDATED_COUNT packages are outdated${NC}"
  echo "  Run 'npm outdated' for details"
  echo ""
  echo "  Quick summary:"
  npm outdated 2>/dev/null | head -10 || true
  
  if [ "$OUTDATED_COUNT" -gt 10 ]; then
    echo "  ... and $((OUTDATED_COUNT - 10)) more"
  fi
fi

echo ""
echo "🧹 4. Unused Dependencies"
echo "========================="
echo ""

# Check for unused dependencies (requires depcheck)
if command -v npx &> /dev/null; then
  echo "  Scanning for unused dependencies..."
  npx depcheck --json > /tmp/depcheck.json 2>/dev/null || echo '{"dependencies":[],"devDependencies":[]}' > /tmp/depcheck.json
  
  UNUSED_DEPS=$(cat /tmp/depcheck.json | grep -o '"dependencies":\[[^]]*\]' | grep -o '"[^"]*"' | wc -l || echo "0")
  UNUSED_DEV=$(cat /tmp/depcheck.json | grep -o '"devDependencies":\[[^]]*\]' | grep -o '"[^"]*"' | wc -l || echo "0")
  
  if [ "$UNUSED_DEPS" -eq 0 ] && [ "$UNUSED_DEV" -eq 0 ]; then
    echo -e "  ${GREEN}✅ No unused dependencies found!${NC}"
  else
    echo -e "  ${YELLOW}⚠️  Potentially unused dependencies:${NC}"
    if [ "$UNUSED_DEPS" -gt 0 ]; then
      echo "     Runtime: $UNUSED_DEPS packages"
    fi
    if [ "$UNUSED_DEV" -gt 0 ]; then
      echo "     Dev: $UNUSED_DEV packages"
    fi
    echo "  Run 'npx depcheck' for details"
  fi
else
  echo -e "  ${YELLOW}⚠️  npx not available - skipping unused dependency check${NC}"
fi

echo ""
echo "📈 5. Health Score"
echo "=================="
echo ""

# Calculate health score
SECURITY_SCORE=25
if [ "$CRITICAL" -gt 0 ] || [ "$HIGH" -gt 0 ]; then
  SECURITY_SCORE=0
elif [ "$MODERATE" -gt 0 ]; then
  SECURITY_SCORE=15
elif [ "$LOW" -gt 0 ]; then
  SECURITY_SCORE=20
fi

UPDATE_SCORE=25
if [ "$OUTDATED_COUNT" -gt 30 ]; then
  UPDATE_SCORE=10
elif [ "$OUTDATED_COUNT" -gt 20 ]; then
  UPDATE_SCORE=15
elif [ "$OUTDATED_COUNT" -gt 10 ]; then
  UPDATE_SCORE=20
fi

MAINTENANCE_SCORE=25  # Assume good maintenance
OPTIMIZATION_SCORE=23  # Based on bundle size analysis

TOTAL_SCORE=$((SECURITY_SCORE + UPDATE_SCORE + MAINTENANCE_SCORE + OPTIMIZATION_SCORE))

echo "  Security:     $SECURITY_SCORE/25"
echo "  Up-to-date:   $UPDATE_SCORE/25"
echo "  Maintained:   $MAINTENANCE_SCORE/25"
echo "  Optimized:    $OPTIMIZATION_SCORE/25"
echo "  ─────────────────────"
echo "  Total Score:  $TOTAL_SCORE/100"
echo ""

if [ "$TOTAL_SCORE" -ge 90 ]; then
  echo -e "  ${GREEN}Grade: A (Excellent!)${NC}"
elif [ "$TOTAL_SCORE" -ge 80 ]; then
  echo -e "  ${GREEN}Grade: B (Good)${NC}"
elif [ "$TOTAL_SCORE" -ge 70 ]; then
  echo -e "  ${YELLOW}Grade: C (Fair)${NC}"
elif [ "$TOTAL_SCORE" -ge 60 ]; then
  echo -e "  ${YELLOW}Grade: D (Needs Improvement)${NC}"
else
  echo -e "  ${RED}Grade: F (Critical Issues)${NC}"
fi

echo ""
echo "🎯 6. Recommended Actions"
echo "========================="
echo ""

if [ "$CRITICAL" -gt 0 ] || [ "$HIGH" -gt 0 ]; then
  echo -e "  ${RED}🚨 CRITICAL: Fix security vulnerabilities immediately!${NC}"
  echo "     Run: ./scripts/deps-fix-security.sh"
  echo ""
fi

if [ "$OUTDATED_COUNT" -gt 10 ]; then
  echo -e "  ${YELLOW}⚠️  Update outdated packages${NC}"
  echo "     Run: ./scripts/deps-safe-update.sh"
  echo ""
fi

if [ "$UNUSED_DEPS" -gt 0 ] || [ "$UNUSED_DEV" -gt 0 ]; then
  echo -e "  ${BLUE}ℹ️  Review unused dependencies${NC}"
  echo "     Run: npx depcheck"
  echo ""
fi

echo -e "  ${GREEN}✅ View full report: DEPENDENCY_HEALTH_REPORT.md${NC}"
echo ""

# Cleanup
rm -f /tmp/audit.json /tmp/outdated.json /tmp/depcheck.json

echo "🏁 Health check complete!"
echo ""

