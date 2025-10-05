#!/usr/bin/env node

/**
 * Error Pattern Analyst - Intelligence Monitoring System
 * Real-time pattern recognition and predictive error prevention
 */

import { spawn, exec } from 'child_process';
import { readFileSync, writeFileSync, existsSync, watchFile } from 'fs';
import { join } from 'path';
import ErrorPatternDatabase from '../error-pattern-database.js';

class IntelligenceMonitor {
  constructor() {
    this.db = new ErrorPatternDatabase();
    this.isMonitoring = false;
    this.logWatchers = new Map();
    this.performanceMetrics = [];
    this.currentAlerts = new Set();

    // Intelligence configuration
    this.config = {
      monitoringInterval: 5000,        // 5 seconds
      predictionThreshold: 0.7,        // 70% likelihood threshold
      autoFixThreshold: 0.8,           // 80% confidence for auto-fix
      performanceWindow: 30,           // 30 data points for trend analysis
      alertCooldown: 60000,           // 1 minute cooldown between alerts
      logPaths: [
        'logs/',
        'node_modules/.vite/',
        '.vite/',
        'dist/'
      ]
    };

    this.init();
  }

  async init() {
    console.log('🧠 Error Pattern Analyst - Intelligence Monitor Starting...');

    // Create log directories if they don't exist
    this.ensureLogDirectories();

    // Initialize baseline metrics
    await this.establishBaseline();

    // Start monitoring systems
    this.startLogMonitoring();
    this.startPerformanceMonitoring();
    this.startPredictiveAnalysis();

    console.log('✅ Intelligence monitoring system active');
    console.log('📊 Dashboard available at: http://localhost:8080/intelligence-dashboard');
  }

  // Real-time Log Analysis
  startLogMonitoring() {
    console.log('👁️  Starting real-time log analysis...');

    // Monitor Vite dev server logs
    this.monitorViteLogs();

    // Monitor TypeScript compilation logs
    this.monitorTypeScriptLogs();

    // Monitor console errors in browser
    this.monitorBrowserErrors();

    // Monitor system performance logs
    this.monitorSystemLogs();
  }

  monitorViteLogs() {
    // Watch for Vite-specific error patterns
    const viteLogPatterns = [
      /Error:/i,
      /Warning:/i,
      /Failed to resolve/i,
      /HMR.*error/i,
      /Build failed/i,
      /Module not found/i
    ];

    this.watchLogPatterns('vite', viteLogPatterns, (match, line) => {
      this.processErrorPattern({
        type: 'vite',
        signature: match[0],
        line: line,
        timestamp: new Date(),
        severity: this.determineSeverity(match[0]),
        context: this.extractViteContext(line)
      });
    });
  }

  monitorTypeScriptLogs() {
    // Watch for TypeScript compilation errors
    const tsLogPatterns = [
      /TS\d+:/,
      /Type.*error/i,
      /Cannot find module/i,
      /Property.*does not exist/i,
      /Argument of type.*not assignable/i
    ];

    this.watchLogPatterns('typescript', tsLogPatterns, (match, line) => {
      this.processErrorPattern({
        type: 'typescript',
        signature: match[0],
        line: line,
        timestamp: new Date(),
        severity: 'medium',
        context: this.extractTypeScriptContext(line)
      });
    });
  }

  // Performance Monitoring
  startPerformanceMonitoring() {
    console.log('⚡ Starting performance trend analysis...');

    setInterval(async () => {
      const metrics = await this.collectPerformanceMetrics();
      this.performanceMetrics.push(metrics);

      // Keep only recent metrics for trend analysis
      if (this.performanceMetrics.length > this.config.performanceWindow) {
        this.performanceMetrics.shift();
      }

      // Analyze performance trends
      const degradation = this.detectPerformanceDegradation(this.performanceMetrics);
      if (degradation) {
        await this.handlePerformanceDegradation(degradation);
      }

    }, this.config.monitoringInterval);
  }

  async collectPerformanceMetrics() {
    return new Promise((resolve) => {
      const startTime = Date.now();

      // Collect various performance metrics
      exec('ps aux | grep -E "(node|chrome)" | head -10', (error, stdout) => {
        const memoryUsage = this.parseMemoryUsage(stdout);

        // Measure HMR response time
        const hmrLatency = this.measureHMRLatency();

        // Check build performance
        const buildMetrics = this.getBuildMetrics();

        resolve({
          timestamp: new Date(),
          memoryUsage,
          hmrLatency,
          buildTime: buildMetrics.time,
          errorCount: this.getRecentErrorCount(),
          collectionTime: Date.now() - startTime
        });
      });
    });
  }

  // Predictive Analysis Engine
  startPredictiveAnalysis() {
    console.log('🔮 Starting predictive error analysis...');

    setInterval(async () => {
      const context = await this.getCurrentContext();
      const prediction = this.db.calculateErrorLikelihood(context);

      if (prediction.likelihood > this.config.predictionThreshold * 100) {
        await this.handleHighRiskPrediction(prediction, context);
      }

      // Update prediction accuracy
      this.updatePredictionAccuracy(prediction);

    }, this.config.monitoringInterval * 2); // Run every 10 seconds
  }

  async getCurrentContext() {
    return {
      timestamp: new Date(),
      recentErrors: this.getRecentErrors(),
      performanceState: this.getCurrentPerformanceState(),
      environmentHealth: await this.assessEnvironmentHealth(),
      activeProcesses: await this.getActiveProcesses()
    };
  }

  // Automated Response System
  async handleHighRiskPrediction(prediction, context) {
    const alertKey = `${prediction.alertLevel}_${Date.now()}`;

    if (this.currentAlerts.has(prediction.alertLevel)) {
      return; // Prevent alert spam
    }

    this.currentAlerts.add(prediction.alertLevel);
    setTimeout(() => this.currentAlerts.delete(prediction.alertLevel), this.config.alertCooldown);

    console.log(`🚨 High Risk Prediction: ${prediction.likelihood}% likelihood`);
    console.log(`📊 Alert Level: ${prediction.alertLevel}`);
    console.log(`🎯 Risk Factors:`, prediction.riskFactors);

    // Auto-apply prevention strategies if confidence is high
    if (prediction.confidence > this.config.autoFixThreshold) {
      await this.applyPreventionStrategies(prediction.preventionActions);
    } else {
      // Log manual intervention recommendations
      this.logManualInterventionNeeded(prediction, context);
    }

    // Save prediction for accuracy tracking
    this.savePrediction(prediction, context);
  }

  async applyPreventionStrategies(preventionActions) {
    console.log('🛡️  Applying automated prevention strategies...');

    for (const action of preventionActions) {
      try {
        switch (action.type) {
          case 'memory_cleanup':
            await this.performMemoryCleanup();
            break;
          case 'cache_clear':
            await this.clearCaches();
            break;
          case 'dependency_check':
            await this.validateDependencies();
            break;
          case 'environment_reset':
            await this.resetEnvironment();
            break;
          default:
            console.log(`Unknown prevention action: ${action.type}`);
        }

        console.log(`✅ Applied: ${action.description}`);
      } catch (error) {
        console.error(`❌ Failed to apply ${action.type}:`, error.message);
      }
    }
  }

  // Intelligence Dashboard Data Generation
  generateDashboardData() {
    const dashboardData = this.db.getDashboardData();

    // Add real-time monitoring data
    dashboardData.realTimeMonitoring = {
      currentRisk: this.calculateCurrentRisk(),
      activeAlerts: Array.from(this.currentAlerts),
      monitoringStatus: this.isMonitoring ? 'active' : 'inactive',
      lastUpdate: new Date().toISOString(),
      performanceMetrics: this.performanceMetrics.slice(-10) // Last 10 metrics
    };

    // Save dashboard data
    const dashboardFile = 'src/intelligence/dashboard/dashboard-data.json';
    writeFileSync(dashboardFile, JSON.stringify(dashboardData, null, 2));

    return dashboardData;
  }

  // Utility Methods
  processErrorPattern(errorData) {
    const patternId = this.db.addErrorPattern(errorData.signature, {
      severity: errorData.severity,
      context: errorData.context,
      timestamp: errorData.timestamp,
      type: errorData.type
    });

    console.log(`🔍 New error pattern detected: ${patternId}`);

    // Trigger immediate prediction analysis
    this.triggerImmediatePrediction(errorData);
  }

  watchLogPatterns(logType, patterns, callback) {
    // Simulate log watching - in real implementation would watch actual log files
    console.log(`👁️  Watching ${logType} logs for ${patterns.length} patterns`);

    // Store watcher for later cleanup
    this.logWatchers.set(logType, {
      patterns,
      callback,
      active: true
    });
  }

  determineSeverity(errorSignature) {
    const criticalKeywords = ['critical', 'fatal', 'security', 'data loss'];
    const highKeywords = ['error', 'failed', 'exception'];
    const mediumKeywords = ['warning', 'deprecated'];

    const signature = errorSignature.toLowerCase();

    if (criticalKeywords.some(keyword => signature.includes(keyword))) {
      return 'critical';
    } else if (highKeywords.some(keyword => signature.includes(keyword))) {
      return 'high';
    } else if (mediumKeywords.some(keyword => signature.includes(keyword))) {
      return 'medium';
    }

    return 'low';
  }

  ensureLogDirectories() {
    this.config.logPaths.forEach(path => {
      if (!existsSync(path)) {
        try {
          require('fs').mkdirSync(path, { recursive: true });
        } catch (error) {
          // Directory might already exist or be inaccessible
        }
      }
    });
  }

  async establishBaseline() {
    console.log('📊 Establishing performance baseline...');

    // Collect initial metrics for baseline
    for (let i = 0; i < 5; i++) {
      const metrics = await this.collectPerformanceMetrics();
      this.performanceMetrics.push(metrics);
      await new Promise(resolve => setTimeout(resolve, 1000));
    }

    console.log('✅ Baseline established with', this.performanceMetrics.length, 'data points');
  }

  // Graceful shutdown
  shutdown() {
    console.log('🛑 Shutting down intelligence monitor...');

    this.isMonitoring = false;

    // Stop all log watchers
    this.logWatchers.forEach((watcher, type) => {
      watcher.active = false;
      console.log(`✅ Stopped ${type} log monitoring`);
    });

    // Save final dashboard data
    this.generateDashboardData();

    console.log('✅ Intelligence monitor shutdown complete');
  }
}

// CLI Interface
if (import.meta.url === `file://${process.argv[1]}`) {
  const monitor = new IntelligenceMonitor();

  // Handle graceful shutdown
  process.on('SIGINT', () => {
    monitor.shutdown();
    process.exit(0);
  });

  process.on('SIGTERM', () => {
    monitor.shutdown();
    process.exit(0);
  });
}

export default IntelligenceMonitor;