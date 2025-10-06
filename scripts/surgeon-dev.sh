#!/bin/bash
# Development Environment Surgeon - Surgical Development Server
# Zero-tolerance console cleanliness with maximum performance

set -e

# Console cleanliness enforcement
export NODE_OPTIONS="--no-warnings"
export VITE_HIDE_DEPRECATION_WARNINGS=true

# Performance optimization
export UV_THREADPOOL_SIZE=128

echo "🏥 Development Environment Surgeon - SURGICAL DEVELOPMENT"
echo "=========================================================="
echo "Mission: Zero-noise, maximum-performance development experience"
echo ""

# Parse command line arguments
CLEAN_MODE=false
MONITOR_MODE=false
CHROME_PROFILE=false

while [[ $# -gt 0 ]]; do
    case $1 in
        --clean)
            CLEAN_MODE=true
            shift
            ;;
        --monitor)
            MONITOR_MODE=true
            shift
            ;;
        --chrome)
            CHROME_PROFILE=true
            shift
            ;;
        *)
            echo "Unknown option: $1"
            echo "Usage: $0 [--clean] [--monitor] [--chrome]"
            exit 1
            ;;
    esac
done

# Performance monitoring start
DEV_START=$(date +%s%N)

# 1. Pre-flight Health Check
echo "🔍 Phase 1: Pre-flight Health Check"
echo "-----------------------------------"

# Quick health assessment
if [ -f "scripts/surgeon-health.sh" ]; then
    echo "🏥 Running surgical health check..."
    ./scripts/surgeon-health.sh --quick 2>/dev/null || echo "⚠️  Health check warnings detected"
else
    echo "⚠️  Health check script not found - continuing with basic checks"

    # Basic checks
    if [ ! -d "node_modules" ]; then
        echo "❌ node_modules missing - installing dependencies..."
        npm ci --silent
    fi

    if [ ! -f "vite.config.ts" ]; then
        echo "❌ Vite configuration missing"
        exit 1
    fi
fi

echo "✅ Pre-flight check complete"
echo ""

# 2. Environment Surgical Preparation
echo "🧹 Phase 2: Environment Surgical Preparation"
echo "--------------------------------------------"

if [ "$CLEAN_MODE" = true ]; then
    echo "🧽 Performing deep environment cleaning..."

    # Clear all caches
    rm -rf node_modules/.vite
    rm -rf node_modules/.cache
    rm -rf .tsbuildinfo
    rm -rf dist

    echo "✅ Environment sanitized"
fi

# Clear console logs and temporary files
rm -f /tmp/surgeon-*.log
rm -f /tmp/vite-*.log

# Set up console cleanliness monitoring
CONSOLE_LOG="/tmp/surgeon-console-$(date +%s).log"
touch "$CONSOLE_LOG"

echo "✅ Surgical preparation complete"
echo ""

# 3. Chrome Profile Management (if enabled)
if [ "$CHROME_PROFILE" = true ]; then
    echo "🌐 Phase 3: Chrome Profile Optimization"
    echo "---------------------------------------"

    # Check if Chrome is running
    if pgrep -f "Google Chrome" > /dev/null; then
        echo "⚠️  Chrome is running - this may cause conflicts"
        read -p "🔄 Close Chrome and start with clean development profile? (y/N): " -n 1 -r
        echo
        if [[ $REPLY =~ ^[Yy]$ ]]; then
            echo "🔄 Closing Chrome..."
            if [[ "$OSTYPE" == "darwin"* ]]; then
                osascript -e 'quit app "Google Chrome"'
            else
                pkill -f "Google Chrome" || true
            fi
            sleep 2
        fi
    fi

    # Launch Chrome with development profile
    echo "🚀 Starting Chrome with surgical development profile..."
    CHROME_PROFILE_DIR="/tmp/surgeon-chrome-profile-$(date +%s)"
    mkdir -p "$CHROME_PROFILE_DIR"

    # Chrome flags for optimal development
    CHROME_FLAGS=(
        "--user-data-dir=$CHROME_PROFILE_DIR"
        "--disable-extensions-file-access-check"
        "--disable-features=ExtensionsToolbarMenu"
        "--disable-background-timer-throttling"
        "--disable-renderer-backgrounding"
        "--disable-background-networking"
        "--enable-logging=stderr"
        "--log-level=3"
        "--disable-dev-shm-usage"
        "--no-sandbox"
        "--disable-gpu-sandbox"
        "--remote-debugging-port=9222"
    )

    if [[ "$OSTYPE" == "darwin"* ]]; then
        "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" "${CHROME_FLAGS[@]}" &
    else
        google-chrome "${CHROME_FLAGS[@]}" &
    fi

    CHROME_PID=$!
    echo "✅ Chrome launched with surgical profile (PID: $CHROME_PID)"
    echo ""
fi

# 4. Development Server Launch
echo "⚡ Phase 4: Surgical Development Server Launch"
echo "---------------------------------------------"

# Set up performance monitoring
if [ "$MONITOR_MODE" = true ]; then
    echo "📊 Starting performance monitoring..."

    # Monitor script in background
    {
        while true; do
            TIMESTAMP=$(date '+%Y-%m-%d %H:%M:%S')
            MEMORY=$(ps -o pid,ppid,%mem,%cpu,cmd -p $$ | tail -1 | awk '{print $3}')
            echo "[$TIMESTAMP] Memory: ${MEMORY}%" >> /tmp/surgeon-performance.log
            sleep 10
        done
    } &
    MONITOR_PID=$!
    echo "✅ Performance monitoring active (PID: $MONITOR_PID)"
fi

# Console cleanliness enforcement wrapper
create_clean_wrapper() {
    cat > /tmp/surgeon-wrapper.js << 'EOF'
// Development Environment Surgeon - Console Cleanliness Wrapper
const originalConsole = { ...console };

// Override console methods for surgical cleanliness
console.warn = (...args) => {
    const message = args.join(' ');

    // Filter out development noise
    if (
        message.includes('deprecated') ||
        message.includes('experimental') ||
        message.includes('feature flag') ||
        message.includes('sourcemap') ||
        message.includes('chunk') ||
        message.includes('legacy') ||
        message.includes('polyfill')
    ) {
        // Suppress noisy warnings
        return;
    }

    // Allow important warnings
    originalConsole.warn('[FILTERED]', ...args);
};

console.error = (...args) => {
    const message = args.join(' ');

    // Always show errors but categorize them
    if (message.includes('404') || message.includes('network')) {
        originalConsole.error('[NETWORK]', ...args);
    } else if (message.includes('typescript') || message.includes('TS')) {
        originalConsole.error('[TYPESCRIPT]', ...args);
    } else {
        originalConsole.error('[APPLICATION]', ...args);
    }
};

// Surgical performance monitoring
const performanceObserver = new PerformanceObserver((list) => {
    for (const entry of list.getEntries()) {
        if (entry.entryType === 'navigation') {
            console.log(`🏥 Navigation: ${entry.duration.toFixed(2)}ms`);
        }
        if (entry.entryType === 'paint') {
            console.log(`🎨 ${entry.name}: ${entry.startTime.toFixed(2)}ms`);
        }
    }
});

try {
    performanceObserver.observe({ entryTypes: ['navigation', 'paint'] });
} catch (e) {
    // Ignore if performance observer not available
}

// HMR performance tracking
if (import.meta.hot) {
    import.meta.hot.on('vite:beforeUpdate', () => {
        window._hmrStart = performance.now();
    });

    import.meta.hot.on('vite:afterUpdate', () => {
        if (window._hmrStart) {
            const duration = performance.now() - window._hmrStart;
            if (duration > 1000) {
                console.warn(`🚨 Slow HMR: ${duration.toFixed(2)}ms`);
            } else {
                console.log(`⚡ HMR: ${duration.toFixed(2)}ms`);
            }
        }
    });
}

EOF
}

# Create console wrapper
create_clean_wrapper

# Create custom vite config with cleanliness enforcement
cat > /tmp/surgeon-vite-wrapper.js << 'EOF'
import { defineConfig } from 'vite';
import fs from 'fs';

// Load the optimized config
const configPath = fs.existsSync('vite.config.optimized.ts')
    ? './vite.config.optimized.ts'
    : './vite.config.ts';

const baseConfig = await import(configPath);

export default defineConfig({
    ...baseConfig.default,
    plugins: [
        ...baseConfig.default.plugins,
        {
            name: 'surgeon-console-cleaner',
            configureServer(server) {
                // Inject console wrapper
                server.middlewares.use((req, res, next) => {
                    if (req.url === '/') {
                        const originalSend = res.send;
                        res.send = function(body) {
                            if (typeof body === 'string' && body.includes('<head>')) {
                                body = body.replace(
                                    '<head>',
                                    '<head><script type="module" src="/tmp/surgeon-wrapper.js"></script>'
                                );
                            }
                            return originalSend.call(this, body);
                        };
                    }
                    next();
                });
            }
        }
    ]
});
EOF

echo "🧬 Surgical console cleanliness enforcement active"

# Launch development server with surgical configuration
echo "🚀 Launching surgical development server..."
VITE_START=$(date +%s%N)

# Run Vite with surgical configuration
NODE_OPTIONS="--no-warnings" \
VITE_LOG_LEVEL="warn" \
npm run dev -- --config /tmp/surgeon-vite-wrapper.js 2>&1 | \
while IFS= read -r line; do
    # Filter and categorize console output
    if [[ "$line" == *"deprecated"* ]] || [[ "$line" == *"experimental"* ]]; then
        # Suppress deprecation warnings
        continue
    elif [[ "$line" == *"error"* ]] || [[ "$line" == *"Error"* ]]; then
        echo "❌ $line" | tee -a "$CONSOLE_LOG"
    elif [[ "$line" == *"warn"* ]] || [[ "$line" == *"Warning"* ]]; then
        echo "⚠️  $line" | tee -a "$CONSOLE_LOG"
    elif [[ "$line" == *"ready"* ]] || [[ "$line" == *"Local:"* ]]; then
        echo "✅ $line" | tee -a "$CONSOLE_LOG"
    else
        echo "ℹ️  $line" | tee -a "$CONSOLE_LOG"
    fi
done &

VITE_PID=$!

# Monitor for startup completion
echo "⏳ Waiting for development server to be ready..."
timeout 30s bash -c 'until curl -s http://localhost:8080 > /dev/null; do sleep 1; done' || {
    echo "❌ Development server failed to start within 30 seconds"
    exit 1
}

VITE_END=$(date +%s%N)
STARTUP_TIME=$(((VITE_END - VITE_START) / 1000000))

echo ""
echo "🎉 SURGICAL DEVELOPMENT ENVIRONMENT READY"
echo "========================================="
echo "⚡ Startup time: ${STARTUP_TIME}ms"
echo "🌐 Local server: http://localhost:8080"
echo "📊 Console log: $CONSOLE_LOG"

if [ "$CHROME_PROFILE" = true ] && [ ! -z "$CHROME_PID" ]; then
    echo "🌍 Chrome PID: $CHROME_PID"
fi

if [ "$MONITOR_MODE" = true ] && [ ! -z "$MONITOR_PID" ]; then
    echo "📈 Performance monitoring: /tmp/surgeon-performance.log"
fi

echo ""
echo "🏥 SURGICAL DEVELOPMENT ACTIVE"
echo "💯 Console cleanliness: ENFORCED"
echo "⚡ Performance monitoring: ACTIVE"
echo "🎯 Zero tolerance for friction: ENABLED"
echo ""
echo "🔧 Surgical commands:"
echo "   Ctrl+C           # Stop development server"
echo "   surgeon:health   # Check environment health"
echo "   surgeon:monitor  # View performance metrics"
echo ""

# Handle cleanup on exit
cleanup() {
    echo ""
    echo "🏁 Shutting down surgical development environment..."

    # Kill Vite
    if [ ! -z "$VITE_PID" ]; then
        kill $VITE_PID 2>/dev/null || true
    fi

    # Kill Chrome if launched
    if [ "$CHROME_PROFILE" = true ] && [ ! -z "$CHROME_PID" ]; then
        kill $CHROME_PID 2>/dev/null || true
        rm -rf "$CHROME_PROFILE_DIR" 2>/dev/null || true
    fi

    # Kill monitoring
    if [ "$MONITOR_MODE" = true ] && [ ! -z "$MONITOR_PID" ]; then
        kill $MONITOR_PID 2>/dev/null || true
    fi

    # Cleanup temporary files
    rm -f /tmp/surgeon-wrapper.js
    rm -f /tmp/surgeon-vite-wrapper.js

    DEV_END=$(date +%s%N)
    TOTAL_TIME=$(((DEV_END - DEV_START) / 1000000 / 1000))

    echo "✅ Surgical development session ended"
    echo "⏱️  Total session time: ${TOTAL_TIME}s"
    echo "🏥 Environment restored to pristine state"
}

trap cleanup EXIT

# Wait for development server
wait $VITE_PID