#!/bin/bash
# Development Environment Surgeon - Health Check
# Real-time environment monitoring with surgical precision

set -e

echo "🏥 Development Environment Surgeon - HEALTH CHECK"
echo "================================================="

# Performance monitoring start
HEALTH_START=$(date +%s%N)

# Health score calculation
HEALTH_SCORE=100
WARNINGS=0
ERRORS=0

# Color codes for clean output
RED='\033[0;31m'
YELLOW='\033[1;33m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo_status() {
    local status=$1
    local message=$2
    case $status in
        "OK")
            echo -e "${GREEN}✅ $message${NC}"
            ;;
        "WARNING")
            echo -e "${YELLOW}⚠️  $message${NC}"
            WARNINGS=$((WARNINGS + 1))
            HEALTH_SCORE=$((HEALTH_SCORE - 5))
            ;;
        "ERROR")
            echo -e "${RED}❌ $message${NC}"
            ERRORS=$((ERRORS + 1))
            HEALTH_SCORE=$((HEALTH_SCORE - 20))
            ;;
        "INFO")
            echo -e "${BLUE}ℹ️  $message${NC}"
            ;;
    esac
}

# 1. System Resources Check
echo "🖥️  System Resources"
echo "-------------------"

# Memory check
if [[ "$OSTYPE" == "darwin"* ]]; then
    MEMORY_PRESSURE=$(memory_pressure | grep "System-wide memory" | awk '{print $4}')
    case $MEMORY_PRESSURE in
        "Normal")
            echo_status "OK" "Memory pressure: Normal"
            ;;
        "Warn")
            echo_status "WARNING" "Memory pressure: Warning level"
            ;;
        "Urgent"|"Critical")
            echo_status "ERROR" "Memory pressure: Critical level"
            ;;
    esac
else
    MEMORY_USAGE=$(free | grep Mem | awk '{printf("%.1f", $3/$2 * 100.0)}')
    if (( $(echo "$MEMORY_USAGE < 80" | bc -l) )); then
        echo_status "OK" "Memory usage: ${MEMORY_USAGE}%"
    elif (( $(echo "$MEMORY_USAGE < 90" | bc -l) )); then
        echo_status "WARNING" "Memory usage: ${MEMORY_USAGE}%"
    else
        echo_status "ERROR" "Memory usage: ${MEMORY_USAGE}%"
    fi
fi

# CPU check
CPU_USAGE=$(top -l 1 -n 0 | grep "CPU usage" | awk '{print $3}' | sed 's/%//' 2>/dev/null || echo "0")
if (( $(echo "$CPU_USAGE < 50" | bc -l 2>/dev/null || echo 1) )); then
    echo_status "OK" "CPU usage: ${CPU_USAGE}%"
elif (( $(echo "$CPU_USAGE < 80" | bc -l 2>/dev/null || echo 0) )); then
    echo_status "WARNING" "CPU usage: ${CPU_USAGE}%"
else
    echo_status "ERROR" "CPU usage: ${CPU_USAGE}%"
fi

# Disk space check
DISK_USAGE=$(df -h . | awk 'NR==2 {print $5}' | sed 's/%//')
if [ "$DISK_USAGE" -lt 80 ]; then
    echo_status "OK" "Disk usage: ${DISK_USAGE}%"
elif [ "$DISK_USAGE" -lt 90 ]; then
    echo_status "WARNING" "Disk usage: ${DISK_USAGE}%"
else
    echo_status "ERROR" "Disk usage: ${DISK_USAGE}%"
fi

echo ""

# 2. Node.js Environment Check
echo "🟢 Node.js Environment"
echo "----------------------"

# Node version check
NODE_VERSION=$(node --version | sed 's/v//')
MAJOR_VERSION=$(echo $NODE_VERSION | cut -d. -f1)
if [ "$MAJOR_VERSION" -ge 18 ]; then
    echo_status "OK" "Node.js version: v$NODE_VERSION"
else
    echo_status "WARNING" "Node.js version: v$NODE_VERSION (recommend v18+)"
fi

# npm version check
NPM_VERSION=$(npm --version)
echo_status "INFO" "npm version: $NPM_VERSION"

# Check for package vulnerabilities
echo "🔍 Checking package vulnerabilities..."
VULN_COUNT=$(npm audit --audit-level=moderate --json 2>/dev/null | jq '.metadata.vulnerabilities.total' 2>/dev/null || echo "0")
if [ "$VULN_COUNT" -eq 0 ]; then
    echo_status "OK" "No package vulnerabilities detected"
else
    echo_status "WARNING" "$VULN_COUNT package vulnerabilities detected"
fi

echo ""

# 3. TypeScript Configuration Check
echo "📘 TypeScript Health"
echo "-------------------"

if [ -f "tsconfig.json" ]; then
    echo_status "OK" "TypeScript configuration present"

    # Check for TypeScript errors
    echo "🔍 Running TypeScript check..."
    if npx tsc --noEmit --skipLibCheck > /tmp/ts-check.log 2>&1; then
        echo_status "OK" "TypeScript check passed"
    else
        ERROR_COUNT=$(wc -l < /tmp/ts-check.log)
        echo_status "ERROR" "TypeScript errors detected ($ERROR_COUNT lines)"
        echo "📝 Error details in /tmp/ts-check.log"
    fi
else
    echo_status "ERROR" "TypeScript configuration missing"
fi

echo ""

# 4. Development Server Check
echo "⚡ Development Server Health"
echo "---------------------------"

# Check if port 8080 is available
if lsof -Pi :8080 -sTCP:LISTEN -t >/dev/null 2>&1; then
    echo_status "WARNING" "Port 8080 is occupied"
    OCCUPYING_PROCESS=$(lsof -Pi :8080 -sTCP:LISTEN | tail -n 1 | awk '{print $1}')
    echo_status "INFO" "Process using port 8080: $OCCUPYING_PROCESS"
else
    echo_status "OK" "Port 8080 is available"
fi

# Check Vite configuration
if [ -f "vite.config.ts" ]; then
    echo_status "OK" "Vite configuration present"
else
    echo_status "ERROR" "Vite configuration missing"
fi

echo ""

# 5. Dependencies Check
echo "📦 Dependencies Health"
echo "---------------------"

if [ -d "node_modules" ]; then
    echo_status "OK" "node_modules directory present"

    # Check for dependency issues
    if npm ls > /dev/null 2>&1; then
        echo_status "OK" "All dependencies resolved"
    else
        echo_status "WARNING" "Dependency resolution issues detected"
    fi
else
    echo_status "ERROR" "node_modules missing - run npm install"
fi

# Check package-lock.json
if [ -f "package-lock.json" ]; then
    echo_status "OK" "Package lock file present"
else
    echo_status "WARNING" "Package lock file missing"
fi

echo ""

# 6. Git Health Check
echo "📚 Git Repository Health"
echo "------------------------"

if [ -d ".git" ]; then
    echo_status "OK" "Git repository initialized"

    # Check for uncommitted changes
    if git diff --quiet && git diff --cached --quiet; then
        echo_status "OK" "Working directory clean"
    else
        echo_status "INFO" "Uncommitted changes present"
    fi

    # Check current branch
    BRANCH=$(git branch --show-current)
    echo_status "INFO" "Current branch: $BRANCH"
else
    echo_status "WARNING" "Not a git repository"
fi

echo ""

# 7. Performance Metrics
echo "📊 Performance Metrics"
echo "---------------------"

# Check build cache
if [ -d "node_modules/.vite" ]; then
    CACHE_SIZE=$(du -sh node_modules/.vite | cut -f1)
    echo_status "OK" "Vite cache present: $CACHE_SIZE"
else
    echo_status "INFO" "No Vite cache (first build will be slower)"
fi

# Check TypeScript cache
if [ -f ".tsbuildinfo" ]; then
    echo_status "OK" "TypeScript incremental cache present"
else
    echo_status "INFO" "No TypeScript cache (first check will be slower)"
fi

echo ""

# Health Score Calculation
HEALTH_END=$(date +%s%N)
HEALTH_TIME=$(((HEALTH_END - HEALTH_START) / 1000000))

echo "🏥 HEALTH CHECK COMPLETE"
echo "========================"
echo "⏱️  Check duration: ${HEALTH_TIME}ms"
echo "📊 Health score: $HEALTH_SCORE/100"
echo "⚠️  Warnings: $WARNINGS"
echo "❌ Errors: $ERRORS"
echo ""

# Health status interpretation
if [ "$HEALTH_SCORE" -ge 90 ]; then
    echo_status "OK" "Environment health: EXCELLENT 🏆"
elif [ "$HEALTH_SCORE" -ge 80 ]; then
    echo_status "OK" "Environment health: GOOD ✅"
elif [ "$HEALTH_SCORE" -ge 70 ]; then
    echo_status "WARNING" "Environment health: NEEDS ATTENTION ⚠️"
else
    echo_status "ERROR" "Environment health: CRITICAL - SURGICAL INTERVENTION REQUIRED 🚨"
fi

echo ""
echo "💡 Recommendations:"
if [ "$WARNINGS" -gt 0 ]; then
    echo "   - Address warnings to improve performance"
fi
if [ "$ERRORS" -gt 0 ]; then
    echo "   - Fix errors immediately for stable development"
fi
if [ "$HEALTH_SCORE" -lt 80 ]; then
    echo "   - Run: npm run surgeon:deploy"
    echo "   - Consider restarting development environment"
fi

echo ""
echo "🔧 Available commands:"
echo "   npm run surgeon:deploy  # Full optimization deployment"
echo "   npm run surgeon:clean   # Clean environment reset"
echo "   npm run surgeon:monitor # Start performance monitoring"