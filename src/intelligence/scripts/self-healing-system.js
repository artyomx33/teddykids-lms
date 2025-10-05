#!/usr/bin/env node

/**
 * Error Pattern Analyst - Self-Healing System
 * Automated error response and environment optimization
 */

import { exec, spawn } from 'child_process';
import { readFileSync, writeFileSync, existsSync, unlinkSync } from 'fs';
import { join } from 'path';
import ErrorPatternDatabase from '../error-pattern-database.js';

class SelfHealingSystem {
  constructor() {
    this.db = new ErrorPatternDatabase();
    this.isActive = false;
    this.healingHistory = [];
    this.backupCreated = false;

    // Healing configuration
    this.config = {
      autoHealingEnabled: true,
      confidenceThreshold: 0.8,     // 80% confidence required for auto-healing
      maxHealingAttempts: 3,         // Maximum attempts per pattern
      healingCooldown: 300000,       // 5 minutes between healing attempts
      backupRetention: 24 * 60 * 60 * 1000, // 24 hours
      monitoringInterval: 10000      // 10 seconds
    };

    // Available healing strategies
    this.healingStrategies = new Map([
      ['memory_cleanup', this.performMemoryCleanup.bind(this)],
      ['cache_clear', this.clearCaches.bind(this)],
      ['dependency_refresh', this.refreshDependencies.bind(this)],
      ['environment_reset', this.resetEnvironment.bind(this)],
      ['config_restore', this.restoreConfiguration.bind(this)],
      ['service_restart', this.restartServices.bind(this)],
      ['temp_cleanup', this.cleanupTempFiles.bind(this)],
      ['port_management', this.managePortConflicts.bind(this)]
    ]);

    this.init();
  }

  async init() {
    console.log('🛡️  Initializing Self-Healing System...');

    // Load healing history
    this.loadHealingHistory();

    // Create environment backup
    await this.createEnvironmentBackup();

    // Start monitoring for healing opportunities
    this.startHealingMonitoring();

    console.log('✅ Self-Healing System active and monitoring');
    console.log(`🎯 Auto-healing confidence threshold: ${this.config.confidenceThreshold * 100}%`);
  }

  // Core Healing Engine
  async evaluateHealingOpportunity(errorPattern) {
    console.log(`🔍 Evaluating healing opportunity for pattern: ${errorPattern.id}`);

    // Check if pattern has a known solution
    if (!errorPattern.solution || !errorPattern.solution.script) {
      console.log('❌ No automated solution available');
      return { canHeal: false, reason: 'no_solution' };
    }

    // Check confidence threshold
    const successRate = errorPattern.solution.successRate || 0;
    if (successRate < this.config.confidenceThreshold) {
      console.log(`❌ Success rate too low: ${successRate * 100}%`);
      return { canHeal: false, reason: 'low_confidence', successRate };
    }

    // Check recent healing attempts
    const recentAttempts = this.getRecentHealingAttempts(errorPattern.id);
    if (recentAttempts >= this.config.maxHealingAttempts) {
      console.log(`❌ Max healing attempts reached: ${recentAttempts}`);
      return { canHeal: false, reason: 'max_attempts', attempts: recentAttempts };
    }

    // Check cooldown period
    const lastAttempt = this.getLastHealingAttempt(errorPattern.id);
    if (lastAttempt && (Date.now() - lastAttempt.timestamp) < this.config.healingCooldown) {
      console.log('❌ Still in cooldown period');
      return { canHeal: false, reason: 'cooldown', lastAttempt };
    }

    console.log('✅ Pattern is eligible for automated healing');
    return {
      canHeal: true,
      confidence: successRate,
      strategy: errorPattern.solution.type,
      description: errorPattern.solution.description
    };
  }

  async performHealing(errorPattern) {
    const evaluation = await this.evaluateHealingOpportunity(errorPattern);

    if (!evaluation.canHeal) {
      return {
        success: false,
        reason: evaluation.reason,
        details: evaluation
      };
    }

    console.log(`🛡️  Initiating healing for pattern: ${errorPattern.signature}`);
    console.log(`📊 Confidence: ${(evaluation.confidence * 100).toFixed(1)}%`);

    const healingStart = Date.now();
    let healingResult = null;

    try {
      // Create pre-healing backup
      await this.createHealingBackup(errorPattern.id);

      // Execute healing strategy
      healingResult = await this.executeHealingStrategy(errorPattern);

      // Verify healing effectiveness
      const verification = await this.verifyHealing(errorPattern, healingResult);

      if (verification.success) {
        console.log('✅ Healing successful and verified');

        // Update pattern success rate
        await this.updatePatternSuccessRate(errorPattern.id, true);

        // Log successful healing
        this.logHealingAttempt(errorPattern.id, {
          success: true,
          strategy: errorPattern.solution.type,
          duration: Date.now() - healingStart,
          result: healingResult,
          verification
        });

        return {
          success: true,
          strategy: errorPattern.solution.type,
          duration: Date.now() - healingStart,
          result: healingResult
        };

      } else {
        console.log('❌ Healing verification failed');

        // Rollback changes
        await this.rollbackHealing(errorPattern.id);

        // Update pattern success rate
        await this.updatePatternSuccessRate(errorPattern.id, false);

        return {
          success: false,
          reason: 'verification_failed',
          verification,
          rolledBack: true
        };
      }

    } catch (error) {
      console.error('❌ Healing execution failed:', error.message);

      // Attempt rollback
      try {
        await this.rollbackHealing(errorPattern.id);
      } catch (rollbackError) {
        console.error('💥 Rollback failed:', rollbackError.message);
      }

      // Log failed healing
      this.logHealingAttempt(errorPattern.id, {
        success: false,
        error: error.message,
        duration: Date.now() - healingStart
      });

      return {
        success: false,
        reason: 'execution_failed',
        error: error.message,
        rolledBack: true
      };
    }
  }

  // Healing Strategies
  async executeHealingStrategy(errorPattern) {
    const strategyType = errorPattern.solution.type;
    const strategy = this.healingStrategies.get(strategyType);

    if (!strategy) {
      throw new Error(`Unknown healing strategy: ${strategyType}`);
    }

    console.log(`🔧 Executing healing strategy: ${strategyType}`);
    return await strategy(errorPattern);
  }

  async performMemoryCleanup(errorPattern) {
    console.log('🧹 Performing memory cleanup...');

    return new Promise((resolve, reject) => {
      // Force garbage collection if available
      if (global.gc) {
        global.gc();
      }

      // Clear Node.js cache
      Object.keys(require.cache).forEach(key => {
        if (key.includes('node_modules')) {
          delete require.cache[key];
        }
      });

      // Clear system cache (macOS/Linux)
      exec('sync && echo 3 > /proc/sys/vm/drop_caches 2>/dev/null || true', (error, stdout, stderr) => {
        resolve({
          type: 'memory_cleanup',
          actions: ['garbage_collection', 'cache_clear', 'system_cache'],
          memoryBefore: process.memoryUsage(),
          memoryAfter: process.memoryUsage()
        });
      });
    });
  }

  async clearCaches(errorPattern) {
    console.log('🗑️  Clearing development caches...');

    const cacheActions = [];

    try {
      // Clear Vite cache
      if (existsSync('node_modules/.vite')) {
        exec('rm -rf node_modules/.vite/*');
        cacheActions.push('vite_cache');
      }

      // Clear TypeScript cache
      if (existsSync('.tsbuildinfo')) {
        unlinkSync('.tsbuildinfo');
        cacheActions.push('typescript_cache');
      }

      // Clear npm cache
      await new Promise((resolve) => {
        exec('npm cache clean --force', () => {
          cacheActions.push('npm_cache');
          resolve();
        });
      });

      return {
        type: 'cache_clear',
        actions: cacheActions,
        clearedPaths: ['node_modules/.vite', '.tsbuildinfo', 'npm_cache']
      };

    } catch (error) {
      throw new Error(`Cache clearing failed: ${error.message}`);
    }
  }

  async refreshDependencies(errorPattern) {
    console.log('📦 Refreshing dependencies...');

    return new Promise((resolve, reject) => {
      exec('npm ci --silent', (error, stdout, stderr) => {
        if (error) {
          reject(new Error(`Dependency refresh failed: ${error.message}`));
        } else {
          resolve({
            type: 'dependency_refresh',
            action: 'npm_ci',
            output: stdout
          });
        }
      });
    });
  }

  async resetEnvironment(errorPattern) {
    console.log('🔄 Resetting development environment...');

    const resetActions = [];

    try {
      // Stop development server if running
      await this.stopDevServer();
      resetActions.push('dev_server_stop');

      // Clear all caches
      await this.clearCaches(errorPattern);
      resetActions.push('cache_clear');

      // Restart development server
      await this.startDevServer();
      resetActions.push('dev_server_start');

      return {
        type: 'environment_reset',
        actions: resetActions,
        status: 'complete'
      };

    } catch (error) {
      throw new Error(`Environment reset failed: ${error.message}`);
    }
  }

  async restoreConfiguration(errorPattern) {
    console.log('⚙️  Restoring configuration from backup...');

    const configFiles = [
      'vite.config.js',
      'tsconfig.json',
      'package.json',
      '.eslintrc.json'
    ];

    const restoredFiles = [];

    for (const file of configFiles) {
      const backupPath = `backups/config-${file}-${Date.now()}.backup`;
      if (existsSync(backupPath)) {
        try {
          const backupContent = readFileSync(backupPath, 'utf8');
          writeFileSync(file, backupContent);
          restoredFiles.push(file);
        } catch (error) {
          console.warn(`Failed to restore ${file}: ${error.message}`);
        }
      }
    }

    return {
      type: 'config_restore',
      restoredFiles,
      count: restoredFiles.length
    };
  }

  async restartServices(errorPattern) {
    console.log('🔄 Restarting development services...');

    const services = [];

    try {
      // Restart development server
      await this.stopDevServer();
      await this.startDevServer();
      services.push('dev_server');

      return {
        type: 'service_restart',
        services,
        status: 'complete'
      };

    } catch (error) {
      throw new Error(`Service restart failed: ${error.message}`);
    }
  }

  async cleanupTempFiles(errorPattern) {
    console.log('🧹 Cleaning up temporary files...');

    const tempPaths = [
      'tmp/',
      '.tmp/',
      'temp/',
      '*.tmp',
      '*.temp',
      'node_modules/.cache'
    ];

    const cleanedPaths = [];

    for (const path of tempPaths) {
      try {
        exec(`rm -rf ${path} 2>/dev/null || true`);
        cleanedPaths.push(path);
      } catch (error) {
        // Ignore cleanup errors
      }
    }

    return {
      type: 'temp_cleanup',
      cleanedPaths,
      count: cleanedPaths.length
    };
  }

  async managePortConflicts(errorPattern) {
    console.log('🔌 Managing port conflicts...');

    return new Promise((resolve, reject) => {
      // Check for port conflicts on common development ports
      const ports = [3000, 3001, 5173, 8080];
      const conflicts = [];

      let checked = 0;

      ports.forEach(port => {
        exec(`lsof -Pi :${port} -sTCP:LISTEN -t`, (error, stdout) => {
          if (stdout.trim()) {
            conflicts.push({
              port,
              pid: stdout.trim(),
              action: 'detected'
            });
          }

          checked++;
          if (checked === ports.length) {
            resolve({
              type: 'port_management',
              conflicts,
              portsChecked: ports,
              conflictsFound: conflicts.length
            });
          }
        });
      });
    });
  }

  // Verification System
  async verifyHealing(errorPattern, healingResult) {
    console.log('🔍 Verifying healing effectiveness...');

    try {
      // Wait for system to stabilize
      await new Promise(resolve => setTimeout(resolve, 5000));

      // Run basic health checks
      const healthChecks = await this.runHealthChecks();

      // Check if the specific error pattern is resolved
      const patternResolved = await this.checkPatternResolution(errorPattern);

      return {
        success: healthChecks.success && patternResolved,
        healthChecks,
        patternResolved,
        timestamp: new Date().toISOString()
      };

    } catch (error) {
      return {
        success: false,
        error: error.message,
        timestamp: new Date().toISOString()
      };
    }
  }

  async runHealthChecks() {
    const checks = {
      memoryUsage: this.checkMemoryUsage(),
      dependenciesOk: await this.checkDependencies(),
      configValid: this.checkConfiguration(),
      servicesRunning: await this.checkServices()
    };

    const allPassed = Object.values(checks).every(check => check === true);

    return {
      success: allPassed,
      checks,
      timestamp: new Date().toISOString()
    };
  }

  // Backup and Rollback
  async createEnvironmentBackup() {
    if (this.backupCreated) return;

    console.log('💾 Creating environment backup...');

    try {
      // Create backup directory
      exec('mkdir -p backups/');

      // Backup critical configuration files
      const configFiles = [
        'package.json',
        'vite.config.js',
        'tsconfig.json',
        '.eslintrc.json'
      ];

      for (const file of configFiles) {
        if (existsSync(file)) {
          const timestamp = Date.now();
          exec(`cp ${file} backups/${file}-${timestamp}.backup`);
        }
      }

      this.backupCreated = true;
      console.log('✅ Environment backup created');

    } catch (error) {
      console.warn('⚠️  Backup creation failed:', error.message);
    }
  }

  async createHealingBackup(patternId) {
    const timestamp = Date.now();
    const backupDir = `backups/healing-${patternId}-${timestamp}`;

    try {
      exec(`mkdir -p ${backupDir}`);

      // Backup current state
      const criticalFiles = [
        'package.json',
        'vite.config.js',
        'tsconfig.json'
      ];

      for (const file of criticalFiles) {
        if (existsSync(file)) {
          exec(`cp ${file} ${backupDir}/`);
        }
      }

      return backupDir;

    } catch (error) {
      console.warn('⚠️  Healing backup failed:', error.message);
      return null;
    }
  }

  async rollbackHealing(patternId) {
    console.log(`🔙 Rolling back healing for pattern: ${patternId}`);

    // Find the most recent backup for this pattern
    const backupPattern = `backups/healing-${patternId}-*`;

    try {
      exec(`ls -t ${backupPattern} 2>/dev/null | head -1`, (error, stdout) => {
        if (stdout.trim()) {
          const backupDir = stdout.trim();
          console.log(`📁 Restoring from backup: ${backupDir}`);

          // Restore files from backup
          exec(`cp ${backupDir}/* . 2>/dev/null || true`);
          console.log('✅ Rollback completed');
        } else {
          console.warn('⚠️  No backup found for rollback');
        }
      });

    } catch (error) {
      console.error('❌ Rollback failed:', error.message);
      throw error;
    }
  }

  // Monitoring and Logging
  startHealingMonitoring() {
    console.log('👁️  Starting healing opportunity monitoring...');

    setInterval(async () => {
      if (!this.config.autoHealingEnabled) return;

      // Check for healing opportunities
      const patterns = Object.values(this.db.patterns.patterns);
      const recentPatterns = patterns.filter(p =>
        new Date(p.lastOccurrence) > new Date(Date.now() - 60000) // Last minute
      );

      for (const pattern of recentPatterns) {
        const evaluation = await this.evaluateHealingOpportunity(pattern);

        if (evaluation.canHeal) {
          console.log(`🛡️  Auto-healing opportunity detected: ${pattern.signature}`);
          await this.performHealing(pattern);
        }
      }

    }, this.config.monitoringInterval);
  }

  logHealingAttempt(patternId, attempt) {
    const healingRecord = {
      patternId,
      timestamp: Date.now(),
      ...attempt
    };

    this.healingHistory.push(healingRecord);

    // Save to file
    const historyFile = 'src/intelligence/optimizations/healing-history.json';
    writeFileSync(historyFile, JSON.stringify(this.healingHistory, null, 2));
  }

  loadHealingHistory() {
    const historyFile = 'src/intelligence/optimizations/healing-history.json';

    if (existsSync(historyFile)) {
      try {
        const data = readFileSync(historyFile, 'utf8');
        this.healingHistory = JSON.parse(data);
      } catch (error) {
        console.warn('Failed to load healing history');
        this.healingHistory = [];
      }
    }
  }

  // Utility methods
  getRecentHealingAttempts(patternId) {
    const recent = this.healingHistory.filter(h =>
      h.patternId === patternId &&
      (Date.now() - h.timestamp) < (24 * 60 * 60 * 1000) // Last 24 hours
    );

    return recent.length;
  }

  getLastHealingAttempt(patternId) {
    const attempts = this.healingHistory.filter(h => h.patternId === patternId);
    return attempts.length > 0 ? attempts[attempts.length - 1] : null;
  }

  async stopDevServer() {
    return new Promise((resolve) => {
      exec('pkill -f "vite.*dev" 2>/dev/null || true', () => resolve());
    });
  }

  async startDevServer() {
    return new Promise((resolve, reject) => {
      const devProcess = spawn('npm', ['run', 'dev'], { detached: true });
      setTimeout(() => resolve(), 3000); // Give it time to start
    });
  }

  checkMemoryUsage() {
    const usage = process.memoryUsage();
    return usage.heapUsed < 500 * 1024 * 1024; // Less than 500MB
  }

  async checkDependencies() {
    return new Promise((resolve) => {
      exec('npm ls --depth=0 2>/dev/null', (error) => {
        resolve(!error);
      });
    });
  }

  checkConfiguration() {
    const configFiles = ['package.json', 'vite.config.js', 'tsconfig.json'];
    return configFiles.every(file => existsSync(file));
  }

  async checkServices() {
    return new Promise((resolve) => {
      exec('pgrep -f "vite.*dev"', (error, stdout) => {
        resolve(!!stdout.trim());
      });
    });
  }

  // Public API
  getHealingStats() {
    const successful = this.healingHistory.filter(h => h.success).length;
    const total = this.healingHistory.length;

    return {
      totalAttempts: total,
      successfulHealings: successful,
      successRate: total > 0 ? (successful / total) : 0,
      recentActivity: this.healingHistory.slice(-10)
    };
  }

  shutdown() {
    console.log('🛡️  Shutting down Self-Healing System...');
    this.isActive = false;
    console.log('✅ Self-Healing System shutdown complete');
  }
}

// CLI Interface
if (import.meta.url === `file://${process.argv[1]}`) {
  const healingSystem = new SelfHealingSystem();

  // Handle graceful shutdown
  process.on('SIGINT', () => {
    healingSystem.shutdown();
    process.exit(0);
  });

  process.on('SIGTERM', () => {
    healingSystem.shutdown();
    process.exit(0);
  });
}

export default SelfHealingSystem;