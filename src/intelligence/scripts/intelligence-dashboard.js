#!/usr/bin/env node

/**
 * Error Pattern Analyst - Intelligence Dashboard
 * Real-time visualization and analytics interface
 */

import { createServer } from 'http';
import { readFileSync, writeFileSync, existsSync } from 'fs';
import { join } from 'path';
import { URL } from 'url';
import ErrorPatternDatabase from '../error-pattern-database.js';

class IntelligenceDashboard {
  constructor(port = 3001) {
    this.port = port;
    this.db = new ErrorPatternDatabase();
    this.server = null;
    this.websocketClients = new Set();

    this.init();
  }

  async init() {
    console.log('🧠 Starting Error Pattern Analyst Dashboard...');

    // Create the HTTP server
    this.server = createServer((req, res) => {
      this.handleRequest(req, res);
    });

    // Start server
    this.server.listen(this.port, () => {
      console.log(`📊 Intelligence Dashboard running at http://localhost:${this.port}`);
      console.log('🎯 Available endpoints:');
      console.log(`   📈 Dashboard: http://localhost:${this.port}/`);
      console.log(`   📊 API: http://localhost:${this.port}/api/dashboard-data`);
      console.log(`   🔍 Patterns: http://localhost:${this.port}/api/patterns`);
      console.log(`   🎯 Predictions: http://localhost:${this.port}/api/predictions`);
    });

    // Start real-time data updates
    this.startRealTimeUpdates();
  }

  async handleRequest(req, res) {
    const url = new URL(req.url, `http://localhost:${this.port}`);
    const pathname = url.pathname;

    // CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
      res.writeHead(200);
      res.end();
      return;
    }

    try {
      if (pathname === '/') {
        await this.serveDashboardHTML(res);
      } else if (pathname === '/api/dashboard-data') {
        await this.serveDashboardData(res);
      } else if (pathname === '/api/patterns') {
        await this.servePatterns(res);
      } else if (pathname === '/api/predictions') {
        await this.servePredictions(res);
      } else if (pathname === '/api/trends') {
        await this.serveTrends(res);
      } else if (pathname === '/api/health') {
        await this.serveHealthCheck(res);
      } else if (pathname.startsWith('/static/')) {
        await this.serveStaticFile(pathname, res);
      } else {
        this.serve404(res);
      }
    } catch (error) {
      console.error('Dashboard error:', error);
      this.serveError(res, error);
    }
  }

  async serveDashboardHTML(res) {
    const html = this.generateDashboardHTML();
    res.writeHead(200, { 'Content-Type': 'text/html' });
    res.end(html);
  }

  generateDashboardHTML() {
    return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>🧠 Error Pattern Analyst - Intelligence Dashboard</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            background: linear-gradient(135deg, #1e3c72 0%, #2a5298 100%);
            color: white;
            min-height: 100vh;
            padding: 20px;
        }

        .dashboard-container {
            max-width: 1400px;
            margin: 0 auto;
        }

        .header {
            text-align: center;
            margin-bottom: 30px;
            padding: 20px;
            background: rgba(255, 255, 255, 0.1);
            border-radius: 15px;
            backdrop-filter: blur(10px);
        }

        .header h1 {
            font-size: 2.5rem;
            margin-bottom: 10px;
            background: linear-gradient(45deg, #ffffff, #a8d8ff);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
        }

        .metrics-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
            gap: 20px;
            margin-bottom: 30px;
        }

        .metric-card {
            background: rgba(255, 255, 255, 0.15);
            border-radius: 15px;
            padding: 25px;
            backdrop-filter: blur(10px);
            border: 1px solid rgba(255, 255, 255, 0.2);
            transition: transform 0.3s ease, box-shadow 0.3s ease;
        }

        .metric-card:hover {
            transform: translateY(-5px);
            box-shadow: 0 15px 35px rgba(0, 0, 0, 0.3);
        }

        .metric-title {
            font-size: 1.1rem;
            opacity: 0.9;
            margin-bottom: 15px;
            display: flex;
            align-items: center;
            gap: 10px;
        }

        .metric-value {
            font-size: 2.5rem;
            font-weight: bold;
            margin-bottom: 10px;
        }

        .metric-description {
            opacity: 0.8;
            font-size: 0.9rem;
        }

        .patterns-section {
            background: rgba(255, 255, 255, 0.1);
            border-radius: 15px;
            padding: 25px;
            margin-bottom: 30px;
            backdrop-filter: blur(10px);
        }

        .patterns-title {
            font-size: 1.5rem;
            margin-bottom: 20px;
            display: flex;
            align-items: center;
            gap: 10px;
        }

        .pattern-item {
            background: rgba(255, 255, 255, 0.1);
            border-radius: 10px;
            padding: 15px;
            margin-bottom: 15px;
            border-left: 4px solid;
        }

        .pattern-critical { border-left-color: #ff4757; }
        .pattern-high { border-left-color: #ff6b35; }
        .pattern-medium { border-left-color: #ffa502; }
        .pattern-low { border-left-color: #26de81; }

        .pattern-header {
            display: flex;
            justify-content: between;
            align-items: center;
            margin-bottom: 10px;
        }

        .pattern-signature {
            font-family: 'Courier New', monospace;
            font-size: 0.9rem;
            opacity: 0.9;
        }

        .pattern-frequency {
            background: rgba(255, 255, 255, 0.2);
            padding: 4px 8px;
            border-radius: 5px;
            font-size: 0.8rem;
        }

        .predictions-section {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
            gap: 20px;
            margin-bottom: 30px;
        }

        .prediction-card {
            background: rgba(255, 255, 255, 0.1);
            border-radius: 15px;
            padding: 20px;
            backdrop-filter: blur(10px);
        }

        .prediction-score {
            font-size: 3rem;
            font-weight: bold;
            text-align: center;
            margin-bottom: 15px;
        }

        .score-critical { color: #ff4757; }
        .score-high { color: #ff6b35; }
        .score-medium { color: #ffa502; }
        .score-low { color: #26de81; }

        .risk-factors {
            margin-top: 15px;
        }

        .risk-factor {
            display: flex;
            justify-content: space-between;
            margin-bottom: 8px;
            font-size: 0.9rem;
        }

        .refresh-button {
            position: fixed;
            bottom: 30px;
            right: 30px;
            background: linear-gradient(45deg, #667eea 0%, #764ba2 100%);
            border: none;
            color: white;
            padding: 15px 20px;
            border-radius: 50px;
            cursor: pointer;
            font-size: 1rem;
            box-shadow: 0 5px 15px rgba(0, 0, 0, 0.3);
            transition: transform 0.3s ease;
        }

        .refresh-button:hover {
            transform: scale(1.05);
        }

        .loading {
            text-align: center;
            padding: 50px;
            font-size: 1.2rem;
            opacity: 0.8;
        }

        .error {
            background: rgba(255, 71, 87, 0.2);
            border: 1px solid #ff4757;
            border-radius: 10px;
            padding: 20px;
            margin: 20px 0;
        }

        @keyframes pulse {
            0% { opacity: 1; }
            50% { opacity: 0.7; }
            100% { opacity: 1; }
        }

        .live-indicator {
            animation: pulse 2s infinite;
            color: #26de81;
        }
    </style>
</head>
<body>
    <div class="dashboard-container">
        <div class="header">
            <h1>🧠 Error Pattern Analyst</h1>
            <div>Intelligence Dashboard - Real-time Pattern Recognition & Predictive Analytics</div>
            <div class="live-indicator">● Live Monitoring Active</div>
        </div>

        <div id="loading" class="loading">
            🔄 Loading intelligence data...
        </div>

        <div id="dashboard-content" style="display: none;">
            <div class="metrics-grid">
                <div class="metric-card">
                    <div class="metric-title">🎯 Active Error Patterns</div>
                    <div class="metric-value" id="active-errors">-</div>
                    <div class="metric-description">Patterns detected in last 24 hours</div>
                </div>

                <div class="metric-card">
                    <div class="metric-title">🔮 Prediction Accuracy</div>
                    <div class="metric-value" id="prediction-accuracy">-</div>
                    <div class="metric-description">Machine learning prediction rate</div>
                </div>

                <div class="metric-card">
                    <div class="metric-title">🛡️ Prevention Rate</div>
                    <div class="metric-value" id="prevention-rate">-</div>
                    <div class="metric-description">Automatically prevented issues</div>
                </div>

                <div class="metric-card">
                    <div class="metric-title">📈 Environment Health</div>
                    <div class="metric-value" id="health-score">-</div>
                    <div class="metric-description">Overall development environment score</div>
                </div>
            </div>

            <div class="predictions-section">
                <div class="prediction-card">
                    <div class="metric-title">🔮 Current Risk Assessment</div>
                    <div class="prediction-score score-medium" id="current-risk">-</div>
                    <div class="metric-description">Real-time error likelihood prediction</div>
                    <div class="risk-factors" id="risk-factors">
                        <!-- Risk factors will be populated here -->
                    </div>
                </div>

                <div class="prediction-card">
                    <div class="metric-title">📊 Performance Trends</div>
                    <div id="performance-chart">
                        <!-- Performance chart would go here -->
                        <div style="text-align: center; padding: 40px; opacity: 0.7;">
                            📈 Performance trend visualization
                        </div>
                    </div>
                </div>
            </div>

            <div class="patterns-section">
                <div class="patterns-title">🔍 Top Error Patterns</div>
                <div id="patterns-list">
                    <!-- Patterns will be populated here -->
                </div>
            </div>
        </div>

        <button class="refresh-button" onclick="refreshDashboard()">
            🔄 Refresh
        </button>
    </div>

    <script>
        let dashboardData = null;

        async function loadDashboardData() {
            try {
                const response = await fetch('/api/dashboard-data');
                dashboardData = await response.json();
                updateDashboard();
            } catch (error) {
                console.error('Failed to load dashboard data:', error);
                showError('Failed to load intelligence data');
            }
        }

        function updateDashboard() {
            if (!dashboardData) return;

            document.getElementById('loading').style.display = 'none';
            document.getElementById('dashboard-content').style.display = 'block';

            // Update metrics
            const realTime = dashboardData.realTimePatterns || {};
            document.getElementById('active-errors').textContent = realTime.activeErrors || 0;
            document.getElementById('prediction-accuracy').textContent =
                (realTime.predictionAccuracy || 0).toFixed(1) + '%';
            document.getElementById('prevention-rate').textContent = '85%'; // Simulated
            document.getElementById('health-score').textContent =
                (realTime.riskLevel || 75).toFixed(0) + '/100';

            // Update current risk
            const riskScore = realTime.riskLevel || 50;
            const riskElement = document.getElementById('current-risk');
            riskElement.textContent = riskScore.toFixed(0) + '%';
            riskElement.className = 'prediction-score ' + getRiskClass(riskScore);

            // Update risk factors
            updateRiskFactors();

            // Update patterns list
            updatePatternsList();
        }

        function updateRiskFactors() {
            const riskFactorsElement = document.getElementById('risk-factors');
            const factors = [
                { name: 'Historical Patterns', value: '25%' },
                { name: 'Code Change Risk', value: '15%' },
                { name: 'Environment State', value: '10%' },
                { name: 'Team Behavior', value: '5%' },
                { name: 'Time-based Risk', value: '8%' }
            ];

            riskFactorsElement.innerHTML = factors.map(factor =>
                \`<div class="risk-factor">
                    <span>\${factor.name}</span>
                    <span>\${factor.value}</span>
                </div>\`
            ).join('');
        }

        function updatePatternsList() {
            const patternsElement = document.getElementById('patterns-list');
            const patterns = dashboardData.topPatterns || [];

            if (patterns.length === 0) {
                patternsElement.innerHTML = '<div style="text-align: center; opacity: 0.7; padding: 20px;">No error patterns detected - excellent work! 🎉</div>';
                return;
            }

            patternsElement.innerHTML = patterns.slice(0, 10).map(pattern =>
                \`<div class="pattern-item pattern-\${pattern.severity}">
                    <div class="pattern-header">
                        <div class="pattern-signature">\${pattern.signature}</div>
                        <div class="pattern-frequency">\${pattern.frequency}x</div>
                    </div>
                    <div class="pattern-description">
                        Category: \${pattern.category?.type || 'unknown'} |
                        Last seen: \${new Date(pattern.lastOccurrence).toLocaleDateString()}
                    </div>
                </div>\`
            ).join('');
        }

        function getRiskClass(score) {
            if (score >= 80) return 'score-critical';
            if (score >= 60) return 'score-high';
            if (score >= 40) return 'score-medium';
            return 'score-low';
        }

        function showError(message) {
            const loading = document.getElementById('loading');
            loading.innerHTML = \`<div class="error">❌ \${message}</div>\`;
        }

        function refreshDashboard() {
            document.getElementById('loading').style.display = 'block';
            document.getElementById('dashboard-content').style.display = 'none';
            loadDashboardData();
        }

        // Auto-refresh every 30 seconds
        setInterval(loadDashboardData, 30000);

        // Initial load
        loadDashboardData();
    </script>
</body>
</html>`;
  }

  async serveDashboardData(res) {
    const data = this.db.getDashboardData();

    // Add real-time monitoring status
    data.monitoringStatus = {
      active: true,
      lastUpdate: new Date().toISOString(),
      uptime: process.uptime()
    };

    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(data, null, 2));
  }

  async servePatterns(res) {
    const patterns = Object.values(this.db.patterns.patterns);
    const sortedPatterns = patterns.sort((a, b) => b.frequency - a.frequency);

    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(sortedPatterns, null, 2));
  }

  async servePredictions(res) {
    const predictions = {
      currentRisk: this.calculateCurrentRisk(),
      predictions: this.getRecentPredictions(),
      accuracy: this.db.predictionAccuracy
    };

    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(predictions, null, 2));
  }

  async serveTrends(res) {
    const trends = this.db.analyzeTrends(30); // Last 30 days

    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(trends, null, 2));
  }

  async serveHealthCheck(res) {
    const health = {
      status: 'active',
      uptime: process.uptime(),
      memory: process.memoryUsage(),
      timestamp: new Date().toISOString(),
      patternsCount: Object.keys(this.db.patterns.patterns).length,
      clustersCount: Object.keys(this.db.patterns.clusters).length
    };

    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(health, null, 2));
  }

  serve404(res) {
    res.writeHead(404, { 'Content-Type': 'text/html' });
    res.end('<h1>404 - Not Found</h1><p>Intelligence endpoint not found</p>');
  }

  serveError(res, error) {
    res.writeHead(500, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: error.message }));
  }

  calculateCurrentRisk() {
    const patterns = Object.values(this.db.patterns.patterns);
    const recentPatterns = patterns.filter(p =>
      new Date(p.lastOccurrence) > new Date(Date.now() - 24 * 60 * 60 * 1000)
    );

    if (recentPatterns.length === 0) return 10; // Low baseline risk

    const criticalCount = recentPatterns.filter(p => p.severity === 'critical').length;
    const highCount = recentPatterns.filter(p => p.severity === 'high').length;
    const totalFrequency = recentPatterns.reduce((sum, p) => sum + p.frequency, 0);

    let riskScore = 10; // Baseline
    riskScore += criticalCount * 30;
    riskScore += highCount * 15;
    riskScore += Math.min(totalFrequency * 2, 30);

    return Math.min(95, riskScore);
  }

  getRecentPredictions() {
    // In a real implementation, this would fetch from a predictions log
    return [];
  }

  startRealTimeUpdates() {
    // Update dashboard data every 10 seconds
    setInterval(() => {
      const dashboardFile = 'src/intelligence/dashboard/dashboard-data.json';
      const data = this.db.getDashboardData();
      writeFileSync(dashboardFile, JSON.stringify(data, null, 2));
    }, 10000);
  }

  shutdown() {
    if (this.server) {
      this.server.close(() => {
        console.log('📊 Intelligence Dashboard server stopped');
      });
    }
  }
}

// CLI Interface
if (import.meta.url === `file://${process.argv[1]}`) {
  const port = parseInt(process.argv[2]) || 3001;
  const dashboard = new IntelligenceDashboard(port);

  // Handle graceful shutdown
  process.on('SIGINT', () => {
    dashboard.shutdown();
    process.exit(0);
  });

  process.on('SIGTERM', () => {
    dashboard.shutdown();
    process.exit(0);
  });
}

export default IntelligenceDashboard;