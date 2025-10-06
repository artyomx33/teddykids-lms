#!/bin/bash
# Development Environment Surgeon - Performance Report Generator
# Comprehensive analysis and optimization recommendations

set -e

echo "🏥 Development Environment Surgeon - PERFORMANCE REPORT"
echo "======================================================="
echo "Mission: Comprehensive environment analysis and optimization insights"
echo ""

# Performance monitoring start
REPORT_START=$(date +%s%N)

# Report configuration
REPORT_DIR="/tmp/surgeon-reports"
REPORT_FILE="$REPORT_DIR/surgeon-report-$(date +%Y%m%d-%H%M%S).md"
JSON_REPORT="$REPORT_DIR/surgeon-metrics-$(date +%Y%m%d-%H%M%S).json"

mkdir -p "$REPORT_DIR"

# Color codes
RED='\033[0;31m'
YELLOW='\033[1;33m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m'

echo_status() {
    local status=$1
    local message=$2
    case $status in
        "EXCELLENT") echo -e "${GREEN}🏆 $message${NC}" ;;
        "GOOD") echo -e "${GREEN}✅ $message${NC}" ;;
        "WARNING") echo -e "${YELLOW}⚠️  $message${NC}" ;;
        "CRITICAL") echo -e "${RED}🚨 $message${NC}" ;;
        "INFO") echo -e "${BLUE}ℹ️  $message${NC}" ;;
    esac
}

# Initialize report
cat > "$REPORT_FILE" << 'EOF'
# 🏥 Development Environment Surgeon - Performance Report

## Executive Summary

This report provides a comprehensive analysis of the development environment performance, identifying optimization opportunities and providing surgical recommendations for maximum development efficiency.

Generated on:
EOF

echo "$(date '+%Y-%m-%d %H:%M:%S')" >> "$REPORT_FILE"
echo "" >> "$REPORT_FILE"

# 1. System Performance Analysis
echo "📊 Phase 1: System Performance Analysis"
echo "---------------------------------------"

echo "## 1. System Performance Analysis" >> "$REPORT_FILE"
echo "" >> "$REPORT_FILE"

# CPU Analysis
if [[ "$OSTYPE" == "darwin"* ]]; then
    CPU_MODEL=$(sysctl -n machdep.cpu.brand_string)
    CPU_CORES=$(sysctl -n hw.ncpu)
    CPU_FREQ=$(sysctl -n hw.cpufrequency_max 2>/dev/null | awk '{print $1/1000000000 " GHz"}' || echo "Unknown")
else
    CPU_MODEL=$(lscpu | grep "Model name" | cut -d: -f2 | xargs)
    CPU_CORES=$(nproc)
    CPU_FREQ=$(lscpu | grep "CPU MHz" | cut -d: -f2 | xargs || echo "Unknown")
fi

echo "### CPU Configuration" >> "$REPORT_FILE"
echo "- **Model**: $CPU_MODEL" >> "$REPORT_FILE"
echo "- **Cores**: $CPU_CORES" >> "$REPORT_FILE"
echo "- **Frequency**: $CPU_FREQ" >> "$REPORT_FILE"
echo "" >> "$REPORT_FILE"

echo_status "INFO" "CPU: $CPU_MODEL ($CPU_CORES cores)"

# Memory Analysis
if [[ "$OSTYPE" == "darwin"* ]]; then
    TOTAL_MEMORY=$(sysctl -n hw.memsize | awk '{print $1/1073741824 " GB"}')
    MEMORY_PRESSURE=$(memory_pressure | grep "System-wide memory" | awk '{print $4}')
else
    TOTAL_MEMORY=$(free -h | grep Mem | awk '{print $2}')
    MEMORY_USAGE=$(free | grep Mem | awk '{printf("%.1f", $3/$2 * 100.0)}')
fi

echo "### Memory Configuration" >> "$REPORT_FILE"
echo "- **Total Memory**: $TOTAL_MEMORY" >> "$REPORT_FILE"
if [[ "$OSTYPE" == "darwin"* ]]; then
    echo "- **Memory Pressure**: $MEMORY_PRESSURE" >> "$REPORT_FILE"
else
    echo "- **Memory Usage**: ${MEMORY_USAGE}%" >> "$REPORT_FILE"
fi
echo "" >> "$REPORT_FILE"

echo_status "INFO" "Memory: $TOTAL_MEMORY total"

# Disk Analysis
DISK_TOTAL=$(df -h . | awk 'NR==2 {print $2}')
DISK_USED=$(df -h . | awk 'NR==2 {print $3}')
DISK_AVAILABLE=$(df -h . | awk 'NR==2 {print $4}')
DISK_USAGE_PERCENT=$(df -h . | awk 'NR==2 {print $5}')

echo "### Disk Configuration" >> "$REPORT_FILE"
echo "- **Total**: $DISK_TOTAL" >> "$REPORT_FILE"
echo "- **Used**: $DISK_USED ($DISK_USAGE_PERCENT)" >> "$REPORT_FILE"
echo "- **Available**: $DISK_AVAILABLE" >> "$REPORT_FILE"
echo "" >> "$REPORT_FILE"

echo_status "INFO" "Disk: $DISK_USED/$DISK_TOTAL used ($DISK_USAGE_PERCENT)"

echo ""

# 2. Development Environment Analysis
echo "⚙️  Phase 2: Development Environment Analysis"
echo "--------------------------------------------"

echo "## 2. Development Environment Analysis" >> "$REPORT_FILE"
echo "" >> "$REPORT_FILE"

# Node.js Environment
NODE_VERSION=$(node --version)
NPM_VERSION=$(npm --version)

echo "### Runtime Environment" >> "$REPORT_FILE"
echo "- **Node.js**: $NODE_VERSION" >> "$REPORT_FILE"
echo "- **npm**: $NPM_VERSION" >> "$REPORT_FILE"
echo "" >> "$REPORT_FILE"

# Evaluate Node.js version
NODE_MAJOR=$(echo $NODE_VERSION | sed 's/v//' | cut -d. -f1)
if [ "$NODE_MAJOR" -ge 20 ]; then
    echo_status "EXCELLENT" "Node.js $NODE_VERSION (Latest LTS)"
elif [ "$NODE_MAJOR" -ge 18 ]; then
    echo_status "GOOD" "Node.js $NODE_VERSION (Supported LTS)"
else
    echo_status "WARNING" "Node.js $NODE_VERSION (Consider upgrading to LTS)"
fi

# Package Dependencies Analysis
if [ -f "package.json" ]; then
    DEP_COUNT=$(jq '.dependencies | length' package.json 2>/dev/null || echo "0")
    DEV_DEP_COUNT=$(jq '.devDependencies | length' package.json 2>/dev/null || echo "0")
    TOTAL_DEPS=$((DEP_COUNT + DEV_DEP_COUNT))

    echo "### Dependencies" >> "$REPORT_FILE"
    echo "- **Production Dependencies**: $DEP_COUNT" >> "$REPORT_FILE"
    echo "- **Development Dependencies**: $DEV_DEP_COUNT" >> "$REPORT_FILE"
    echo "- **Total Dependencies**: $TOTAL_DEPS" >> "$REPORT_FILE"
    echo "" >> "$REPORT_FILE"

    echo_status "INFO" "Dependencies: $DEP_COUNT prod + $DEV_DEP_COUNT dev = $TOTAL_DEPS total"

    # Check for vulnerabilities
    VULN_OUTPUT=$(npm audit --audit-level=moderate --json 2>/dev/null || echo '{"metadata":{"vulnerabilities":{"total":0}}}')
    VULN_COUNT=$(echo "$VULN_OUTPUT" | jq '.metadata.vulnerabilities.total' 2>/dev/null || echo "0")

    if [ "$VULN_COUNT" -eq 0 ]; then
        echo_status "EXCELLENT" "No security vulnerabilities detected"
    elif [ "$VULN_COUNT" -lt 5 ]; then
        echo_status "WARNING" "$VULN_COUNT security vulnerabilities detected"
    else
        echo_status "CRITICAL" "$VULN_COUNT security vulnerabilities detected"
    fi

    echo "### Security Analysis" >> "$REPORT_FILE"
    echo "- **Vulnerabilities**: $VULN_COUNT" >> "$REPORT_FILE"
    echo "" >> "$REPORT_FILE"
fi

echo ""

# 3. Build Performance Analysis
echo "⚡ Phase 3: Build Performance Analysis"
echo "-------------------------------------"

echo "## 3. Build Performance Analysis" >> "$REPORT_FILE"
echo "" >> "$REPORT_FILE"

# TypeScript Performance
if [ -f "tsconfig.json" ]; then
    echo "🔍 Measuring TypeScript performance..."
    TS_START=$(date +%s%N)
    TS_OUTPUT=$(npx tsc --noEmit --skipLibCheck 2>&1 || true)
    TS_END=$(date +%s%N)
    TS_TIME=$(((TS_END - TS_START) / 1000000))

    TS_ERROR_COUNT=$(echo "$TS_OUTPUT" | grep -c "error TS" || echo "0")

    echo "### TypeScript Analysis" >> "$REPORT_FILE"
    echo "- **Type Check Time**: ${TS_TIME}ms" >> "$REPORT_FILE"
    echo "- **Type Errors**: $TS_ERROR_COUNT" >> "$REPORT_FILE"
    echo "" >> "$REPORT_FILE"

    if [ "$TS_TIME" -lt 3000 ]; then
        echo_status "EXCELLENT" "TypeScript check: ${TS_TIME}ms (Excellent)"
    elif [ "$TS_TIME" -lt 5000 ]; then
        echo_status "GOOD" "TypeScript check: ${TS_TIME}ms (Good)"
    elif [ "$TS_TIME" -lt 10000 ]; then
        echo_status "WARNING" "TypeScript check: ${TS_TIME}ms (Slow)"
    else
        echo_status "CRITICAL" "TypeScript check: ${TS_TIME}ms (Very Slow)"
    fi

    if [ "$TS_ERROR_COUNT" -eq 0 ]; then
        echo_status "EXCELLENT" "TypeScript: No type errors"
    else
        echo_status "WARNING" "TypeScript: $TS_ERROR_COUNT type errors"
    fi
fi

# Build Performance
if [ -f "vite.config.ts" ] || [ -f "vite.config.js" ]; then
    echo "🔍 Measuring build performance..."
    BUILD_START=$(date +%s%N)
    BUILD_OUTPUT=$(npm run build 2>&1 || true)
    BUILD_END=$(date +%s%N)
    BUILD_TIME=$(((BUILD_END - BUILD_START) / 1000000))

    # Extract build metrics from Vite output
    BUNDLE_SIZE=$(echo "$BUILD_OUTPUT" | grep -o '[0-9]*\.[0-9]* kB' | tail -1 || echo "Unknown")

    echo "### Build Performance" >> "$REPORT_FILE"
    echo "- **Build Time**: ${BUILD_TIME}ms" >> "$REPORT_FILE"
    echo "- **Bundle Size**: $BUNDLE_SIZE" >> "$REPORT_FILE"
    echo "" >> "$REPORT_FILE"

    if [ "$BUILD_TIME" -lt 5000 ]; then
        echo_status "EXCELLENT" "Build time: ${BUILD_TIME}ms (Excellent)"
    elif [ "$BUILD_TIME" -lt 10000 ]; then
        echo_status "GOOD" "Build time: ${BUILD_TIME}ms (Good)"
    elif [ "$BUILD_TIME" -lt 20000 ]; then
        echo_status "WARNING" "Build time: ${BUILD_TIME}ms (Slow)"
    else
        echo_status "CRITICAL" "Build time: ${BUILD_TIME}ms (Very Slow)"
    fi

    # Cleanup build artifacts
    rm -rf dist
fi

echo ""

# 4. Historical Performance Analysis
echo "📈 Phase 4: Historical Performance Analysis"
echo "------------------------------------------"

echo "## 4. Historical Performance Analysis" >> "$REPORT_FILE"
echo "" >> "$REPORT_FILE"

# Check for monitoring logs
MONITORING_LOGS=$(find /tmp -name "surgeon-performance-*.log" -type f 2>/dev/null | head -5 || echo "")
if [ ! -z "$MONITORING_LOGS" ]; then
    echo "### Recent Performance Trends" >> "$REPORT_FILE"

    for log in $MONITORING_LOGS; do
        LOG_DATE=$(basename "$log" | grep -o '[0-9]\{8\}' || echo "unknown")
        LOG_ENTRIES=$(wc -l < "$log" 2>/dev/null || echo "0")
        echo "- **$LOG_DATE**: $LOG_ENTRIES monitoring entries" >> "$REPORT_FILE"
    done

    echo "" >> "$REPORT_FILE"
    echo_status "INFO" "Found historical performance data"
else
    echo "### Recent Performance Trends" >> "$REPORT_FILE"
    echo "- No historical performance data available" >> "$REPORT_FILE"
    echo "- Start monitoring with: \`npm run surgeon:monitor\`" >> "$REPORT_FILE"
    echo "" >> "$REPORT_FILE"
    echo_status "INFO" "No historical data available"
fi

echo ""

# 5. Optimization Recommendations
echo "🎯 Phase 5: Optimization Recommendations"
echo "----------------------------------------"

echo "## 5. Optimization Recommendations" >> "$REPORT_FILE"
echo "" >> "$REPORT_FILE"

RECOMMENDATIONS=()

# Node.js recommendations
if [ "$NODE_MAJOR" -lt 18 ]; then
    RECOMMENDATIONS+=("**CRITICAL**: Upgrade Node.js to LTS version (18.x or 20.x)")
fi

# Memory recommendations
if [[ "$OSTYPE" == "darwin"* ]]; then
    if [ "$MEMORY_PRESSURE" = "Warn" ] || [ "$MEMORY_PRESSURE" = "Critical" ]; then
        RECOMMENDATIONS+=("**WARNING**: High memory pressure detected - consider closing other applications")
    fi
fi

# TypeScript recommendations
if [ ! -z "$TS_TIME" ] && [ "$TS_TIME" -gt 5000 ]; then
    RECOMMENDATIONS+=("**OPTIMIZATION**: TypeScript check is slow (${TS_TIME}ms) - consider enabling incremental compilation")
fi

if [ ! -z "$TS_ERROR_COUNT" ] && [ "$TS_ERROR_COUNT" -gt 0 ]; then
    RECOMMENDATIONS+=("**QUALITY**: $TS_ERROR_COUNT TypeScript errors detected - fix for cleaner development")
fi

# Build recommendations
if [ ! -z "$BUILD_TIME" ] && [ "$BUILD_TIME" -gt 10000 ]; then
    RECOMMENDATIONS+=("**OPTIMIZATION**: Build time is slow (${BUILD_TIME}ms) - consider optimizing Vite configuration")
fi

# Security recommendations
if [ ! -z "$VULN_COUNT" ] && [ "$VULN_COUNT" -gt 0 ]; then
    RECOMMENDATIONS+=("**SECURITY**: $VULN_COUNT package vulnerabilities - run \`npm audit fix\`")
fi

# Disk recommendations
DISK_USAGE_NUM=$(echo "$DISK_USAGE_PERCENT" | sed 's/%//')
if [ "$DISK_USAGE_NUM" -gt 90 ]; then
    RECOMMENDATIONS+=("**CRITICAL**: Disk usage is high ($DISK_USAGE_PERCENT) - free up space")
elif [ "$DISK_USAGE_NUM" -gt 80 ]; then
    RECOMMENDATIONS+=("**WARNING**: Disk usage is elevated ($DISK_USAGE_PERCENT) - monitor space")
fi

# Configuration recommendations
if [ ! -f "vite.config.optimized.ts" ]; then
    RECOMMENDATIONS+=("**ENHANCEMENT**: Deploy optimized Vite configuration with \`npm run surgeon:deploy\`")
fi

if [ ! -f "tsconfig.optimized.json" ]; then
    RECOMMENDATIONS+=("**ENHANCEMENT**: Deploy optimized TypeScript configuration with \`npm run surgeon:deploy\`")
fi

# Output recommendations
if [ ${#RECOMMENDATIONS[@]} -eq 0 ]; then
    echo "### 🏆 Excellent! No optimization recommendations" >> "$REPORT_FILE"
    echo "" >> "$REPORT_FILE"
    echo "Your development environment is running at peak performance." >> "$REPORT_FILE"
    echo_status "EXCELLENT" "No optimization recommendations - environment is optimal!"
else
    echo "### 🎯 Surgical Recommendations" >> "$REPORT_FILE"
    echo "" >> "$REPORT_FILE"

    for i in "${!RECOMMENDATIONS[@]}"; do
        echo "$((i + 1)). ${RECOMMENDATIONS[$i]}" >> "$REPORT_FILE"
    done

    echo "" >> "$REPORT_FILE"
    echo_status "INFO" "${#RECOMMENDATIONS[@]} optimization recommendations generated"
fi

# 6. Quick Actions
echo "## 6. Quick Actions" >> "$REPORT_FILE"
echo "" >> "$REPORT_FILE"
echo "### Immediate Optimizations" >> "$REPORT_FILE"
echo "\`\`\`bash" >> "$REPORT_FILE"
echo "# Deploy surgical optimizations" >> "$REPORT_FILE"
echo "npm run surgeon:deploy" >> "$REPORT_FILE"
echo "" >> "$REPORT_FILE"
echo "# Start optimized development" >> "$REPORT_FILE"
echo "npm run dev:surgical" >> "$REPORT_FILE"
echo "" >> "$REPORT_FILE"
echo "# Monitor performance" >> "$REPORT_FILE"
echo "npm run surgeon:monitor" >> "$REPORT_FILE"
echo "" >> "$REPORT_FILE"
echo "# Emergency cleanup (if needed)" >> "$REPORT_FILE"
echo "npm run surgeon:clean" >> "$REPORT_FILE"
echo "\`\`\`" >> "$REPORT_FILE"
echo "" >> "$REPORT_FILE"

# 7. Generate JSON metrics
echo "🔢 Phase 6: Generating Machine-Readable Metrics"
echo "-----------------------------------------------"

cat > "$JSON_REPORT" << EOF
{
  "timestamp": "$(date -u +%Y-%m-%dT%H:%M:%SZ)",
  "system": {
    "cpu": {
      "model": "$CPU_MODEL",
      "cores": $CPU_CORES,
      "frequency": "$CPU_FREQ"
    },
    "memory": {
      "total": "$TOTAL_MEMORY"
    },
    "disk": {
      "total": "$DISK_TOTAL",
      "used": "$DISK_USED",
      "available": "$DISK_AVAILABLE",
      "usage_percent": "$DISK_USAGE_PERCENT"
    }
  },
  "environment": {
    "node_version": "$NODE_VERSION",
    "npm_version": "$NPM_VERSION",
    "dependencies": {
      "production": $DEP_COUNT,
      "development": $DEV_DEP_COUNT,
      "total": $TOTAL_DEPS
    },
    "security": {
      "vulnerabilities": $VULN_COUNT
    }
  },
  "performance": {
    "typescript_check_ms": ${TS_TIME:-0},
    "typescript_errors": ${TS_ERROR_COUNT:-0},
    "build_time_ms": ${BUILD_TIME:-0},
    "bundle_size": "$BUNDLE_SIZE"
  },
  "recommendations": ${#RECOMMENDATIONS[@]},
  "health_score": $((100 - ${#RECOMMENDATIONS[@]} * 5))
}
EOF

echo ""

# Report completion
REPORT_END=$(date +%s%N)
REPORT_TIME=$(((REPORT_END - REPORT_START) / 1000000))

echo "---" >> "$REPORT_FILE"
echo "" >> "$REPORT_FILE"
echo "**Report generated in ${REPORT_TIME}ms by Development Environment Surgeon**" >> "$REPORT_FILE"
echo "" >> "$REPORT_FILE"
echo "*🏥 Surgical precision for optimal development performance*" >> "$REPORT_FILE"

echo "🎉 PERFORMANCE REPORT COMPLETE"
echo "=============================="
echo "⏱️  Analysis time: ${REPORT_TIME}ms"
echo "📊 Recommendations: ${#RECOMMENDATIONS[@]}"
echo "📄 Report: $REPORT_FILE"
echo "📈 Metrics: $JSON_REPORT"
echo ""
echo_status "INFO" "Report saved to: $REPORT_FILE"
echo_status "INFO" "Metrics saved to: $JSON_REPORT"
echo ""
echo "🔍 View report:"
echo "   cat $REPORT_FILE"
echo ""
echo "📊 View metrics:"
echo "   cat $JSON_REPORT | jq ."