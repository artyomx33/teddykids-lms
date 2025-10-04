#!/usr/bin/env node

/**
 * Chrome Ecosystem Detective - Extension Scanner
 * Identifies Chrome extensions causing filesystem conflicts in development
 */

import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import os from 'os';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class ChromeExtensionScanner {
  constructor() {
    this.chromeDataPath = this.getChromeDataPath();
    this.extensionsPath = path.join(this.chromeDataPath, 'Default', 'Extensions');
    this.results = {
      extensions: [],
      conflicts: [],
      recommendations: []
    };
  }

  getChromeDataPath() {
    const platform = os.platform();
    const homeDir = os.homedir();

    switch (platform) {
      case 'darwin': // macOS
        return path.join(homeDir, 'Library', 'Application Support', 'Google', 'Chrome');
      case 'win32': // Windows
        return path.join(homeDir, 'AppData', 'Local', 'Google', 'Chrome', 'User Data');
      case 'linux': // Linux
        return path.join(homeDir, '.config', 'google-chrome');
      default:
        throw new Error(`Unsupported platform: ${platform}`);
    }
  }

  async scanExtensions() {
    console.log('🔍 Chrome Ecosystem Detective - Scanning Extensions...\n');

    if (!fs.existsSync(this.extensionsPath)) {
      console.log('❌ Chrome extensions directory not found:', this.extensionsPath);
      return this.results;
    }

    try {
      const extensionDirs = fs.readdirSync(this.extensionsPath);
      let scannedCount = 0;

      for (const extensionId of extensionDirs) {
        if (extensionId.startsWith('.')) continue;

        const extensionInfo = await this.analyzeExtension(extensionId);
        if (extensionInfo) {
          this.results.extensions.push(extensionInfo);
          scannedCount++;

          // Check for filesystem conflicts
          if (extensionInfo.filesystemRisk > 0.5) {
            this.results.conflicts.push({
              extensionId: extensionInfo.id,
              name: extensionInfo.name,
              riskLevel: this.getRiskLevel(extensionInfo.filesystemRisk),
              issues: extensionInfo.potentialIssues
            });
          }
        }
      }

      console.log(`✅ Scanned ${scannedCount} extensions`);
      this.generateRecommendations();
      return this.results;

    } catch (error) {
      console.error('❌ Error scanning extensions:', error.message);
      return this.results;
    }
  }

  async analyzeExtension(extensionId) {
    const extensionPath = path.join(this.extensionsPath, extensionId);

    try {
      // Find the latest version directory
      const versions = fs.readdirSync(extensionPath)
        .filter(dir => !dir.startsWith('.'))
        .sort((a, b) => b.localeCompare(a, undefined, { numeric: true }));

      if (versions.length === 0) return null;

      const latestVersionPath = path.join(extensionPath, versions[0]);
      const manifestPath = path.join(latestVersionPath, 'manifest.json');

      if (!fs.existsSync(manifestPath)) return null;

      const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
      const extensionInfo = {
        id: extensionId,
        name: manifest.name || 'Unknown Extension',
        version: manifest.version || '0.0.0',
        description: manifest.description || '',
        permissions: manifest.permissions || [],
        hostPermissions: manifest.host_permissions || [],
        manifestVersion: manifest.manifest_version || 2,
        filesystemRisk: this.calculateFilesystemRisk(manifest),
        potentialIssues: this.identifyPotentialIssues(manifest),
        enabled: this.isExtensionEnabled(extensionId)
      };

      return extensionInfo;

    } catch (error) {
      console.log(`⚠️  Could not analyze extension ${extensionId}:`, error.message);
      return null;
    }
  }

  calculateFilesystemRisk(manifest) {
    let risk = 0;

    // High-risk permissions
    const highRiskPermissions = [
      'storage',
      'unlimitedStorage',
      'fileSystem',
      'downloads',
      'nativeMessaging'
    ];

    // Medium-risk permissions
    const mediumRiskPermissions = [
      'tabs',
      'activeTab',
      'webNavigation',
      'background',
      'scripting'
    ];

    const permissions = manifest.permissions || [];

    permissions.forEach(permission => {
      if (highRiskPermissions.includes(permission)) {
        risk += 0.3;
      } else if (mediumRiskPermissions.includes(permission)) {
        risk += 0.1;
      }
    });

    // Check for background scripts
    if (manifest.background) {
      risk += 0.2;
    }

    // Check for content scripts
    if (manifest.content_scripts && manifest.content_scripts.length > 0) {
      risk += 0.1;
    }

    // Known problematic extension patterns
    const problemPatterns = [
      /wallet/i,
      /crypto/i,
      /blockchain/i,
      /mining/i,
      /adblo(ck|cker)/i,
      /proxy/i,
      /vpn/i
    ];

    const name = manifest.name || '';
    const description = manifest.description || '';

    problemPatterns.forEach(pattern => {
      if (pattern.test(name) || pattern.test(description)) {
        risk += 0.4;
      }
    });

    return Math.min(risk, 1.0);
  }

  identifyPotentialIssues(manifest) {
    const issues = [];
    const permissions = manifest.permissions || [];
    const name = manifest.name || '';

    // Filesystem-related issues
    if (permissions.includes('storage') || permissions.includes('unlimitedStorage')) {
      issues.push('Uses browser storage - may cause filesystem write conflicts');
    }

    if (manifest.background) {
      issues.push('Has background script - may interfere with development server');
    }

    if (permissions.includes('webNavigation')) {
      issues.push('Monitors web navigation - may conflict with HMR');
    }

    // Known problematic extensions
    if (/adblo(ck|cker)/i.test(name)) {
      issues.push('Ad blocker - known to cause React dev server conflicts');
    }

    if (/wallet|crypto/i.test(name)) {
      issues.push('Crypto wallet - heavy filesystem operations during development');
    }

    if (/proxy|vpn/i.test(name)) {
      issues.push('Network proxy - may interfere with development server connections');
    }

    return issues;
  }

  isExtensionEnabled(extensionId) {
    try {
      const preferencesPath = path.join(this.chromeDataPath, 'Default', 'Preferences');
      if (!fs.existsSync(preferencesPath)) return false;

      const preferences = JSON.parse(fs.readFileSync(preferencesPath, 'utf8'));
      const extensions = preferences.extensions?.settings || {};

      if (extensions[extensionId]) {
        return extensions[extensionId].state === 1; // 1 = enabled, 0 = disabled
      }

      return false;
    } catch (error) {
      return false;
    }
  }

  getRiskLevel(risk) {
    if (risk >= 0.8) return 'critical';
    if (risk >= 0.6) return 'high';
    if (risk >= 0.3) return 'medium';
    return 'low';
  }

  generateRecommendations() {
    const criticalExtensions = this.results.conflicts.filter(c => c.riskLevel === 'critical');
    const highRiskExtensions = this.results.conflicts.filter(c => c.riskLevel === 'high');

    if (criticalExtensions.length > 0) {
      this.results.recommendations.push({
        priority: 'immediate',
        type: 'disable-extensions',
        title: 'Disable Critical Extensions',
        description: `Disable ${criticalExtensions.map(e => e.name).join(', ')} during development`,
        command: `chrome://extensions/`,
        extensions: criticalExtensions.map(e => e.extensionId)
      });
    }

    if (highRiskExtensions.length > 0) {
      this.results.recommendations.push({
        priority: 'recommended',
        type: 'chrome-flags',
        title: 'Apply Chrome Flags',
        description: 'Launch Chrome with development-friendly flags',
        command: '/Applications/Google\\ Chrome.app/Contents/MacOS/Google\\ Chrome --disable-extensions-file-access-check --disable-background-timer-throttling'
      });
    }

    if (this.results.conflicts.length > 2) {
      this.results.recommendations.push({
        priority: 'recommended',
        type: 'dev-profile',
        title: 'Create Development Profile',
        description: 'Set up a clean Chrome profile specifically for development',
        command: 'chrome --user-data-dir=/tmp/chrome-dev-profile --disable-extensions'
      });
    }
  }

  generateReport() {
    console.log('\n📊 Chrome Ecosystem Detective Report\n');
    console.log('=' .repeat(50));

    // Summary
    console.log(`\n📋 Summary:`);
    console.log(`   Extensions Scanned: ${this.results.extensions.length}`);
    console.log(`   Conflicts Found: ${this.results.conflicts.length}`);
    console.log(`   Recommendations: ${this.results.recommendations.length}`);

    // Conflicts
    if (this.results.conflicts.length > 0) {
      console.log(`\n⚠️  Problematic Extensions:`);
      this.results.conflicts.forEach((conflict, index) => {
        console.log(`   ${index + 1}. ${conflict.name} (${conflict.riskLevel} risk)`);
        conflict.issues.forEach(issue => {
          console.log(`      - ${issue}`);
        });
      });
    }

    // Recommendations
    if (this.results.recommendations.length > 0) {
      console.log(`\n🔧 Recommended Fixes:`);
      this.results.recommendations.forEach((rec, index) => {
        console.log(`   ${index + 1}. [${rec.priority.toUpperCase()}] ${rec.title}`);
        console.log(`      ${rec.description}`);
        if (rec.command) {
          console.log(`      Command: ${rec.command}`);
        }
        console.log('');
      });
    }

    // Next steps
    console.log('🚀 Next Steps:');
    console.log('   1. Apply immediate fixes for critical extensions');
    console.log('   2. Restart Chrome with recommended flags');
    console.log('   3. Test development environment for clean console');
    console.log('   4. Consider creating a dedicated development profile');

    console.log('\n' + '=' .repeat(50));
  }

  saveReport(outputPath = './chrome-detective-report.json') {
    const report = {
      timestamp: new Date().toISOString(),
      platform: os.platform(),
      chromeDataPath: this.chromeDataPath,
      ...this.results
    };

    fs.writeFileSync(outputPath, JSON.stringify(report, null, 2));
    console.log(`📄 Report saved to: ${outputPath}`);
  }
}

// CLI execution
const isMainModule = import.meta.url === `file://${process.argv[1]}`;

if (isMainModule) {
  async function main() {
    const scanner = new ChromeExtensionScanner();

    try {
      await scanner.scanExtensions();
      scanner.generateReport();
      scanner.saveReport();

      // Exit with appropriate code
      const criticalConflicts = scanner.results.conflicts.filter(c => c.riskLevel === 'critical');
      process.exit(criticalConflicts.length > 0 ? 1 : 0);

    } catch (error) {
      console.error('❌ Scanner failed:', error.message);
      process.exit(1);
    }
  }

  main();
}

export default ChromeExtensionScanner;