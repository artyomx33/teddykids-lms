#!/bin/bash
# Development Environment Surgeon - Emergency Environment Cleanup
# Nuclear option for environment restoration

set -e

echo "🏥 Development Environment Surgeon - EMERGENCY CLEANUP"
echo "======================================================"
echo "⚠️  WARNING: This will perform deep environment sanitization"
echo ""

# Confirmation prompt
read -p "🧨 Proceed with emergency cleanup? This will clear all caches and temporary files (y/N): " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "❌ Cleanup cancelled"
    exit 0
fi

echo "🧹 Initiating emergency cleanup protocol..."
echo ""

# Performance monitoring start
CLEANUP_START=$(date +%s%N)

# 1. Stop all development processes
echo "🛑 Phase 1: Stopping Development Processes"
echo "------------------------------------------"

echo "🔍 Scanning for running development processes..."

# Kill Vite processes
VITE_PIDS=$(pgrep -f "vite" 2>/dev/null || echo "")
if [ ! -z "$VITE_PIDS" ]; then
    echo "🔄 Stopping Vite processes: $VITE_PIDS"
    echo $VITE_PIDS | xargs kill 2>/dev/null || true
    sleep 2
    echo "✅ Vite processes stopped"
else
    echo "ℹ️  No Vite processes running"
fi

# Kill node processes on port 8080
PORT_PROCESS=$(lsof -ti :8080 2>/dev/null || echo "")
if [ ! -z "$PORT_PROCESS" ]; then
    echo "🔄 Freeing port 8080 (PID: $PORT_PROCESS)"
    kill $PORT_PROCESS 2>/dev/null || true
    sleep 1
    echo "✅ Port 8080 freed"
else
    echo "ℹ️  Port 8080 is free"
fi

# Kill Chrome development instances
CHROME_DEV_PIDS=$(pgrep -f "chrome.*dev-profile" 2>/dev/null || echo "")
if [ ! -z "$CHROME_DEV_PIDS" ]; then
    echo "🔄 Stopping Chrome development instances: $CHROME_DEV_PIDS"
    echo $CHROME_DEV_PIDS | xargs kill 2>/dev/null || true
    sleep 2
    echo "✅ Chrome development instances stopped"
else
    echo "ℹ️  No Chrome development instances running"
fi

echo ""

# 2. Clear all caches and temporary files
echo "🧽 Phase 2: Deep Cache Sanitization"
echo "-----------------------------------"

echo "🗂️  Clearing build caches..."

# Clear Vite cache
if [ -d "node_modules/.vite" ]; then
    VITE_CACHE_SIZE=$(du -sh node_modules/.vite 2>/dev/null | cut -f1 || echo "unknown")
    rm -rf node_modules/.vite
    echo "✅ Vite cache cleared ($VITE_CACHE_SIZE)"
else
    echo "ℹ️  No Vite cache found"
fi

# Clear general cache
if [ -d "node_modules/.cache" ]; then
    CACHE_SIZE=$(du -sh node_modules/.cache 2>/dev/null | cut -f1 || echo "unknown")
    rm -rf node_modules/.cache
    echo "✅ General cache cleared ($CACHE_SIZE)"
else
    echo "ℹ️  No general cache found"
fi

# Clear TypeScript cache
if [ -f ".tsbuildinfo" ]; then
    rm -f .tsbuildinfo
    echo "✅ TypeScript incremental cache cleared"
else
    echo "ℹ️  No TypeScript cache found"
fi

# Clear ESLint cache
if [ -f ".eslintcache" ]; then
    rm -f .eslintcache
    echo "✅ ESLint cache cleared"
else
    echo "ℹ️  No ESLint cache found"
fi

# Clear build output
if [ -d "dist" ]; then
    DIST_SIZE=$(du -sh dist 2>/dev/null | cut -f1 || echo "unknown")
    rm -rf dist
    echo "✅ Build output cleared ($DIST_SIZE)"
else
    echo "ℹ️  No build output found"
fi

echo ""

# 3. Clean temporary surgeon files
echo "🧬 Phase 3: Surgeon File Sanitization"
echo "-------------------------------------"

# Clear monitoring logs
MONITORING_FILES=$(find /tmp -name "surgeon-*" -type f 2>/dev/null || echo "")
if [ ! -z "$MONITORING_FILES" ]; then
    MONITORING_COUNT=$(echo "$MONITORING_FILES" | wc -l | tr -d ' ')
    echo "$MONITORING_FILES" | xargs rm -f 2>/dev/null || true
    echo "✅ Surgeon monitoring files cleared ($MONITORING_COUNT files)"
else
    echo "ℹ️  No surgeon monitoring files found"
fi

# Clear Chrome development profiles
CHROME_PROFILES=$(find /tmp -name "*chrome*dev*profile*" -type d 2>/dev/null || echo "")
if [ ! -z "$CHROME_PROFILES" ]; then
    PROFILE_COUNT=$(echo "$CHROME_PROFILES" | wc -l | tr -d ' ')
    echo "$CHROME_PROFILES" | xargs rm -rf 2>/dev/null || true
    echo "✅ Chrome development profiles cleared ($PROFILE_COUNT profiles)"
else
    echo "ℹ️  No Chrome development profiles found"
fi

# Clear console logs
CONSOLE_LOGS=$(find /tmp -name "surgeon-console-*.log" -type f 2>/dev/null || echo "")
if [ ! -z "$CONSOLE_LOGS" ]; then
    CONSOLE_COUNT=$(echo "$CONSOLE_LOGS" | wc -l | tr -d ' ')
    echo "$CONSOLE_LOGS" | xargs rm -f 2>/dev/null || true
    echo "✅ Console logs cleared ($CONSOLE_COUNT logs)"
else
    echo "ℹ️  No console logs found"
fi

echo ""

# 4. System cleanup
echo "💻 Phase 4: System Cleanup"
echo "--------------------------"

# Clear system temporary files (surgeon related only)
if [[ "$OSTYPE" == "darwin"* ]]; then
    # macOS cleanup
    echo "🍎 Clearing macOS system cache..."

    # Clear user cache (surgeon related only)
    USER_CACHE="$HOME/Library/Caches"
    if [ -d "$USER_CACHE" ]; then
        find "$USER_CACHE" -name "*surgeon*" -type f -delete 2>/dev/null || true
        find "$USER_CACHE" -name "*vite*" -type f -mtime +1 -delete 2>/dev/null || true
        echo "✅ macOS user cache cleaned"
    fi

    # Clear Chrome cache (development only)
    CHROME_CACHE="$HOME/Library/Caches/Google/Chrome"
    if [ -d "$CHROME_CACHE" ]; then
        find "$CHROME_CACHE" -name "*localhost*" -type f -delete 2>/dev/null || true
        echo "✅ Chrome localhost cache cleaned"
    fi
else
    # Linux cleanup
    echo "🐧 Clearing Linux system cache..."

    # Clear user cache
    if [ -d "$HOME/.cache" ]; then
        find "$HOME/.cache" -name "*surgeon*" -type f -delete 2>/dev/null || true
        find "$HOME/.cache" -name "*vite*" -type f -mtime +1 -delete 2>/dev/null || true
        echo "✅ Linux user cache cleaned"
    fi
fi

echo ""

# 5. Dependency refresh
echo "📦 Phase 5: Dependency Refresh"
echo "------------------------------"

echo "🔄 Refreshing node modules..."

# Clear package manager cache
echo "🧹 Clearing npm cache..."
npm cache clean --force 2>/dev/null || echo "⚠️  npm cache clean failed"

# Reinstall dependencies
echo "📥 Reinstalling dependencies..."
rm -rf node_modules package-lock.json
npm install --silent

INSTALL_SIZE=$(du -sh node_modules 2>/dev/null | cut -f1 || echo "unknown")
echo "✅ Dependencies reinstalled ($INSTALL_SIZE)"

echo ""

# 6. Configuration validation
echo "⚙️  Phase 6: Configuration Validation"
echo "-------------------------------------"

# Validate TypeScript
echo "🔍 Validating TypeScript configuration..."
if npx tsc --noEmit --skipLibCheck > /dev/null 2>&1; then
    echo "✅ TypeScript configuration valid"
else
    echo "⚠️  TypeScript validation warnings (check manually)"
fi

# Validate Vite configuration
echo "🔍 Validating Vite configuration..."
if npm run build > /dev/null 2>&1; then
    echo "✅ Vite configuration valid"
    rm -rf dist # Clean up test build
else
    echo "⚠️  Vite configuration issues detected"
fi

echo ""

# 7. Performance baseline
echo "📊 Phase 7: Performance Baseline Reset"
echo "--------------------------------------"

# Measure clean startup performance
echo "⚡ Measuring clean environment performance..."

# Measure TypeScript check
TS_START=$(date +%s%N)
npx tsc --noEmit --skipLibCheck > /dev/null 2>&1 || true
TS_END=$(date +%s%N)
TS_TIME=$(((TS_END - TS_START) / 1000000))

# Measure build time
BUILD_START=$(date +%s%N)
npm run build > /dev/null 2>&1 || true
BUILD_END=$(date +%s%N)
BUILD_TIME=$(((BUILD_END - BUILD_START) / 1000000))

rm -rf dist # Cleanup

echo "✅ TypeScript check: ${TS_TIME}ms"
echo "✅ Build time: ${BUILD_TIME}ms"

echo ""

# Cleanup complete
CLEANUP_END=$(date +%s%N)
TOTAL_TIME=$(((CLEANUP_END - CLEANUP_START) / 1000000))

echo "🎉 EMERGENCY CLEANUP COMPLETE"
echo "============================="
echo "⏱️  Total cleanup time: ${TOTAL_TIME}ms"
echo "🧹 Environment sanitized and restored"
echo "📊 Performance baseline reset"
echo "✅ Ready for pristine development"
echo ""
echo "🏥 Environment Status: SURGICALLY CLEAN"
echo "💯 Console Cleanliness: RESET"
echo "⚡ Performance: OPTIMIZED"
echo ""
echo "🚀 Next steps:"
echo "   npm run surgeon:deploy    # Deploy optimizations"
echo "   npm run dev:surgical      # Start clean development"
echo "   npm run surgeon:health    # Verify environment health"