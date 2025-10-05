#!/bin/bash
# Development Environment Surgeon - Real-time Performance Monitor
# Continuous surgical precision monitoring

set -e

echo "🏥 Development Environment Surgeon - PERFORMANCE MONITOR"
echo "========================================================"
echo "Mission: Real-time surgical precision monitoring"
echo ""

# Performance thresholds
HMR_THRESHOLD=2000    # 2 seconds
MEMORY_THRESHOLD=80   # 80%
CPU_THRESHOLD=70      # 70%

# Monitoring configuration
MONITOR_INTERVAL=5    # seconds
LOG_RETENTION=24      # hours

# Create monitoring directory
MONITOR_DIR="/tmp/surgeon-monitoring"
mkdir -p "$MONITOR_DIR"

# Log files
PERF_LOG="$MONITOR_DIR/performance-$(date +%Y%m%d).log"
ALERT_LOG="$MONITOR_DIR/alerts-$(date +%Y%m%d).log"
METRICS_LOG="$MONITOR_DIR/metrics-$(date +%Y%m%d).log"

# Color codes
RED='\033[0;31m'
YELLOW='\033[1;33m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m'

# Monitoring functions
log_event() {
    local level=$1
    local message=$2
    local timestamp=$(date '+%Y-%m-%d %H:%M:%S')
    echo "[$timestamp] [$level] $message" >> "$PERF_LOG"
}

alert() {
    local severity=$1
    local message=$2
    local timestamp=$(date '+%Y-%m-%d %H:%M:%S')
    echo "[$timestamp] [$severity] $message" | tee -a "$ALERT_LOG"

    case $severity in
        "CRITICAL")
            echo -e "${RED}🚨 CRITICAL: $message${NC}"
            ;;
        "WARNING")
            echo -e "${YELLOW}⚠️  WARNING: $message${NC}"
            ;;
        "INFO")
            echo -e "${GREEN}ℹ️  INFO: $message${NC}"
            ;;
    esac
}

# System metrics collection
collect_system_metrics() {
    local timestamp=$(date '+%Y-%m-%d %H:%M:%S')

    # Memory usage
    if [[ "$OSTYPE" == "darwin"* ]]; then
        local memory_pressure=$(memory_pressure | grep "System-wide memory" | awk '{print $4}')
        local memory_usage=$(vm_stat | grep "Pages active" | awk '{print $3}' | sed 's/\.//' || echo "0")
    else
        local memory_usage=$(free | grep Mem | awk '{printf("%.1f", $3/$2 * 100.0)}')
    fi

    # CPU usage
    local cpu_usage=$(top -l 1 -n 0 | grep "CPU usage" | awk '{print $3}' | sed 's/%//' 2>/dev/null || echo "0")

    # Disk usage
    local disk_usage=$(df -h . | awk 'NR==2 {print $5}' | sed 's/%//')

    # Log metrics
    echo "[$timestamp] MEMORY=$memory_usage CPU=$cpu_usage DISK=$disk_usage" >> "$METRICS_LOG"

    # Check thresholds
    if (( $(echo "$memory_usage > $MEMORY_THRESHOLD" | bc -l 2>/dev/null || echo 0) )); then
        alert "WARNING" "High memory usage: ${memory_usage}%"
    fi

    if (( $(echo "$cpu_usage > $CPU_THRESHOLD" | bc -l 2>/dev/null || echo 0) )); then
        alert "WARNING" "High CPU usage: ${cpu_usage}%"
    fi

    # Return metrics for display
    echo "$memory_usage,$cpu_usage,$disk_usage"
}

# Development server monitoring
monitor_dev_server() {
    local port=8080

    if lsof -Pi :$port -sTCP:LISTEN -t >/dev/null 2>&1; then
        local server_process=$(lsof -Pi :$port -sTCP:LISTEN | tail -n 1 | awk '{print $2}')
        local server_name=$(ps -p $server_process -o comm= 2>/dev/null || echo "unknown")

        # Check server responsiveness
        local response_time=$(curl -o /dev/null -s -w '%{time_total}' http://localhost:$port 2>/dev/null || echo "timeout")

        if [ "$response_time" != "timeout" ]; then
            local response_ms=$(echo "$response_time * 1000" | bc -l)
            log_event "INFO" "Server response time: ${response_ms}ms"

            if (( $(echo "$response_ms > 1000" | bc -l) )); then
                alert "WARNING" "Slow server response: ${response_ms}ms"
            fi

            echo "online,$response_ms"
        else
            alert "CRITICAL" "Development server not responding"
            echo "offline,0"
        fi
    else
        echo "stopped,0"
    fi
}

# HMR performance monitoring
monitor_hmr() {
    local hmr_log="/tmp/surgeon-hmr.log"

    if [ -f "$hmr_log" ]; then
        local latest_hmr=$(tail -1 "$hmr_log" 2>/dev/null || echo "")
        if [ ! -z "$latest_hmr" ]; then
            local hmr_time=$(echo "$latest_hmr" | grep -o '[0-9]*\.[0-9]*ms' | sed 's/ms//' || echo "0")
            local hmr_ms=$(echo "$hmr_time" | bc -l 2>/dev/null || echo "0")

            if (( $(echo "$hmr_ms > $HMR_THRESHOLD" | bc -l 2>/dev/null || echo 0) )); then
                alert "WARNING" "Slow HMR reload: ${hmr_ms}ms"
            fi

            echo "$hmr_ms"
        else
            echo "0"
        fi
    else
        echo "0"
    fi
}

# Console error monitoring
monitor_console_errors() {
    local console_logs=$(find /tmp -name "surgeon-console-*.log" -mmin -5 2>/dev/null || echo "")
    local error_count=0

    if [ ! -z "$console_logs" ]; then
        for log in $console_logs; do
            local new_errors=$(grep -c "❌" "$log" 2>/dev/null || echo "0")
            error_count=$((error_count + new_errors))
        done
    fi

    if [ "$error_count" -gt 0 ]; then
        alert "WARNING" "Console errors detected: $error_count"
    fi

    echo "$error_count"
}

# Main monitoring loop
echo "🔍 Starting surgical performance monitoring..."
echo "⚙️  Monitor interval: ${MONITOR_INTERVAL}s"
echo "📊 Performance logs: $PERF_LOG"
echo "🚨 Alert logs: $ALERT_LOG"
echo "📈 Metrics logs: $METRICS_LOG"
echo ""

# Initialize performance baseline
alert "INFO" "Performance monitoring started"
MONITOR_START=$(date +%s)

# Display header
printf "%-10s %-8s %-8s %-8s %-10s %-12s %-8s %-8s\n" \
    "TIME" "MEMORY%" "CPU%" "DISK%" "SERVER" "RESPONSE" "HMR" "ERRORS"
printf "%-10s %-8s %-8s %-8s %-10s %-12s %-8s %-8s\n" \
    "----------" "--------" "--------" "--------" "----------" "------------" "--------" "--------"

# Monitoring loop
while true; do
    TIMESTAMP=$(date '+%H:%M:%S')

    # Collect all metrics
    SYSTEM_METRICS=$(collect_system_metrics)
    MEMORY=$(echo $SYSTEM_METRICS | cut -d',' -f1)
    CPU=$(echo $SYSTEM_METRICS | cut -d',' -f2)
    DISK=$(echo $SYSTEM_METRICS | cut -d',' -f3)

    SERVER_STATUS=$(monitor_dev_server)
    SERVER_STATE=$(echo $SERVER_STATUS | cut -d',' -f1)
    RESPONSE_TIME=$(echo $SERVER_STATUS | cut -d',' -f2)

    HMR_TIME=$(monitor_hmr)
    ERROR_COUNT=$(monitor_console_errors)

    # Color coding for status
    case $SERVER_STATE in
        "online")
            SERVER_COLOR="${GREEN}online${NC}"
            ;;
        "offline")
            SERVER_COLOR="${RED}offline${NC}"
            ;;
        "stopped")
            SERVER_COLOR="${YELLOW}stopped${NC}"
            ;;
    esac

    # Display metrics row
    printf "%-10s %-8.1f %-8.1f %-8s %-10s %-12.1f %-8.1f %-8s\n" \
        "$TIMESTAMP" "$MEMORY" "$CPU" "${DISK}%" "$SERVER_STATE" "$RESPONSE_TIME" "$HMR_TIME" "$ERROR_COUNT"

    # Log performance summary
    log_event "METRICS" "Memory=${MEMORY}% CPU=${CPU}% Disk=${DISK}% Server=${SERVER_STATE} Response=${RESPONSE_TIME}ms HMR=${HMR_TIME}ms Errors=${ERROR_COUNT}"

    # Performance health assessment
    HEALTH_SCORE=100

    if (( $(echo "$MEMORY > 80" | bc -l 2>/dev/null || echo 0) )); then
        HEALTH_SCORE=$((HEALTH_SCORE - 20))
    fi

    if (( $(echo "$CPU > 70" | bc -l 2>/dev/null || echo 0) )); then
        HEALTH_SCORE=$((HEALTH_SCORE - 15))
    fi

    if [ "$SERVER_STATE" != "online" ]; then
        HEALTH_SCORE=$((HEALTH_SCORE - 30))
    fi

    if (( $(echo "$HMR_TIME > 2000" | bc -l 2>/dev/null || echo 0) )); then
        HEALTH_SCORE=$((HEALTH_SCORE - 10))
    fi

    if [ "$ERROR_COUNT" -gt 0 ]; then
        HEALTH_SCORE=$((HEALTH_SCORE - (ERROR_COUNT * 5)))
    fi

    # Health alerts
    if [ "$HEALTH_SCORE" -lt 60 ]; then
        alert "CRITICAL" "Environment health degraded: ${HEALTH_SCORE}/100"
    elif [ "$HEALTH_SCORE" -lt 80 ]; then
        alert "WARNING" "Environment health declining: ${HEALTH_SCORE}/100"
    fi

    sleep $MONITOR_INTERVAL
done

# Cleanup on exit
trap 'alert "INFO" "Performance monitoring stopped"; exit 0' INT TERM