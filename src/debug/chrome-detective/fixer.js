#!/usr/bin/env node

/**
 * Chrome Ecosystem Detective - Fix Applier
 * Applies specific fixes for Chrome extension filesystem conflicts
 */

import fs from 'fs';
import path from 'path';
import { execSync, spawn } from 'child_process';
import os from 'os';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class ChromeConflictFixer {
  constructor() {
    this.platform = os.platform();
    this.chromeDataPath = this.getChromeDataPath();
    this.appliedFixes = [];
  }

  getChromeDataPath() {
    const homeDir = os.homedir();

    switch (this.platform) {
      case 'darwin': // macOS
        return path.join(homeDir, 'Library', 'Application Support', 'Google', 'Chrome');
      case 'win32': // Windows
        return path.join(homeDir, 'AppData', 'Local', 'Google', 'Chrome', 'User Data');
      case 'linux': // Linux
        return path.join(homeDir, '.config', 'google-chrome');
      default:
        throw new Error(`Unsupported platform: ${this.platform}`);
    }
  }

  async applyImmediateFixes() {
    console.log('🔧 Chrome Ecosystem Detective - Applying Immediate Fixes...\n');

    const fixes = [
      this.createDevProfile,
      this.generateChromeFlags,
      this.configureViteForExtensions,
      this.createLaunchScript
    ];

    for (const fix of fixes) {
      try {
        await fix.call(this);
      } catch (error) {
        console.error(`❌ Fix failed: ${error.message}`);
      }
    }

    this.generateFixReport();
    return this.appliedFixes;
  }

  async createDevProfile() {
    console.log('📁 Creating development Chrome profile...');

    const devProfilePath = path.join(os.tmpdir(), 'chrome-dev-profile');

    try {
      // Create development profile directory
      if (fs.existsSync(devProfilePath)) {
        fs.rmSync(devProfilePath, { recursive: true, force: true });
      }
      fs.mkdirSync(devProfilePath, { recursive: true });

      // Create minimal preferences for dev profile
      const preferences = {
        extensions: {
          settings: {}
        },
        profile: {
          name: "Development Profile",
          managed_user_id: "",
          avatar_index: 26
        }
      };

      const preferencesPath = path.join(devProfilePath, 'Preferences');
      fs.writeFileSync(preferencesPath, JSON.stringify(preferences, null, 2));

      this.appliedFixes.push({
        type: 'dev-profile',
        title: 'Development Profile Created',
        description: `Clean Chrome profile created at ${devProfilePath}`,
        path: devProfilePath,
        success: true
      });

      console.log(`✅ Development profile created: ${devProfilePath}`);

    } catch (error) {
      console.error(`❌ Failed to create development profile: ${error.message}`);
      this.appliedFixes.push({
        type: 'dev-profile',
        title: 'Development Profile Creation Failed',
        description: error.message,
        success: false
      });
    }
  }

  async generateChromeFlags() {
    console.log('🚩 Generating Chrome flags for extension safety...');

    const flags = [
      '--disable-extensions-file-access-check',
      '--disable-features=ExtensionsToolbarMenu',
      '--disable-background-timer-throttling',
      '--disable-renderer-backgrounding',
      '--disable-background-networking',
      '--disable-extensions-except=fmkadmapgofadopljbjfkapdkoienihi', // React DevTools
      '--flag-switches-begin',
      '--enable-logging=stderr',
      '--flag-switches-end'
    ];

    const devProfilePath = path.join(os.tmpdir(), 'chrome-dev-profile');
    const flagsCommand = this.generateChromeCommand(flags, devProfilePath);

    try {
      // Save flags to a script file
      const scriptPath = path.join(process.cwd(), 'launch-chrome-dev.sh');
      const scriptContent = `#!/bin/bash
# Chrome Ecosystem Detective - Development Chrome Launcher
# Generated on ${new Date().toISOString()}

echo "🚀 Launching Chrome with development-safe configuration..."
echo "Profile: ${devProfilePath}"
echo ""

${flagsCommand} "$@"
`;

      fs.writeFileSync(scriptPath, scriptContent);
      fs.chmodSync(scriptPath, '755');

      this.appliedFixes.push({
        type: 'chrome-flags',
        title: 'Chrome Launch Script Created',
        description: `Development-safe Chrome launcher created`,
        command: flagsCommand,
        scriptPath: scriptPath,
        success: true
      });

      console.log(`✅ Chrome launch script created: ${scriptPath}`);
      console.log(`   Usage: ./launch-chrome-dev.sh`);

    } catch (error) {
      console.error(`❌ Failed to generate Chrome flags: ${error.message}`);
      this.appliedFixes.push({
        type: 'chrome-flags',
        title: 'Chrome Flags Generation Failed',
        description: error.message,
        success: false
      });
    }
  }

  generateChromeCommand(flags, profilePath) {
    const chromeExecutable = this.getChromeExecutable();
    const flagsString = flags.join(' ');

    return `"${chromeExecutable}" --user-data-dir="${profilePath}" ${flagsString}`;
  }

  getChromeExecutable() {
    switch (this.platform) {
      case 'darwin':
        return '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
      case 'win32':
        return 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
      case 'linux':
        return '/usr/bin/google-chrome';
      default:
        return 'google-chrome';
    }
  }

  async configureViteForExtensions() {
    console.log('⚙️  Configuring Vite for extension compatibility...');

    const viteConfigPath = path.join(process.cwd(), 'vite.config.ts');

    try {
      if (!fs.existsSync(viteConfigPath)) {
        console.log('⚠️  vite.config.ts not found, skipping Vite configuration');
        return;
      }

      const currentConfig = fs.readFileSync(viteConfigPath, 'utf8');

      // Check if already configured
      if (currentConfig.includes('// Chrome Detective Configuration')) {
        console.log('✅ Vite already configured for extension compatibility');
        return;
      }

      // Add extension-safe configuration
      const extensionSafeConfig = `
  // Chrome Detective Configuration - Extension compatibility
  server: {
    host: "::",
    port: 8080,
    fs: {
      // Allow serving files from outside the root
      allow: ['..']
    },
    // Prevent conflicts with Chrome extensions
    hmr: {
      overlay: false // Disable error overlay that conflicts with extensions
    }
  },`;

      // Insert the configuration after the existing server config or before plugins
      let updatedConfig;
      if (currentConfig.includes('server:')) {
        // Replace existing server config
        updatedConfig = currentConfig.replace(
          /server:\s*{[^}]*}/s,
          extensionSafeConfig.trim()
        );
      } else {
        // Add before plugins
        updatedConfig = currentConfig.replace(
          /plugins:\s*\[/,
          `${extensionSafeConfig}\n  plugins: [`
        );
      }

      // Create backup
      const backupPath = `${viteConfigPath}.chrome-detective-backup`;
      fs.writeFileSync(backupPath, currentConfig);

      // Write updated config
      fs.writeFileSync(viteConfigPath, updatedConfig);

      this.appliedFixes.push({
        type: 'vite-config',
        title: 'Vite Configuration Updated',
        description: 'Added extension-safe server configuration',
        backupPath: backupPath,
        success: true
      });

      console.log(`✅ Vite configuration updated for extension compatibility`);
      console.log(`   Backup created: ${backupPath}`);

    } catch (error) {
      console.error(`❌ Failed to configure Vite: ${error.message}`);
      this.appliedFixes.push({
        type: 'vite-config',
        title: 'Vite Configuration Failed',
        description: error.message,
        success: false
      });
    }
  }

  async createLaunchScript() {
    console.log('📜 Creating integrated development launcher...');

    try {
      const launcherPath = path.join(process.cwd(), 'dev-clean.sh');
      const launcherContent = `#!/bin/bash
# Chrome Ecosystem Detective - Clean Development Environment Launcher
# Generated on ${new Date().toISOString()}

set -e

echo "🧹 Chrome Ecosystem Detective - Clean Development Setup"
echo "=================================================="

# Check if Chrome is running and offer to close it
if pgrep -f "Google Chrome" > /dev/null; then
    echo "⚠️  Chrome is currently running."
    read -p "Close Chrome to start clean development session? (y/N): " -n 1 -r
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
echo "🚀 Starting Chrome with clean development profile..."
./launch-chrome-dev.sh &
CHROME_PID=$!

# Wait a moment for Chrome to start
sleep 3

# Start development server
echo "⚡ Starting Vite development server..."
npm run dev &
VITE_PID=$!

echo ""
echo "✅ Development environment ready!"
echo "   Chrome PID: $CHROME_PID"
echo "   Vite PID: $VITE_PID"
echo ""
echo "📝 To stop:"
echo "   - Press Ctrl+C to stop Vite"
echo "   - Close Chrome manually or run: kill $CHROME_PID"
echo ""

# Wait for Vite to exit
wait $VITE_PID

echo "🏁 Development session ended."
`;

      fs.writeFileSync(launcherPath, launcherContent);
      fs.chmodSync(launcherPath, '755');

      this.appliedFixes.push({
        type: 'launcher',
        title: 'Development Launcher Created',
        description: 'Integrated script for clean development environment',
        scriptPath: launcherPath,
        success: true
      });

      console.log(`✅ Development launcher created: ${launcherPath}`);
      console.log(`   Usage: ./dev-clean.sh`);

    } catch (error) {
      console.error(`❌ Failed to create launcher: ${error.message}`);
      this.appliedFixes.push({
        type: 'launcher',
        title: 'Launcher Creation Failed',
        description: error.message,
        success: false
      });
    }
  }

  async disableProblematicExtensions(extensionIds) {
    console.log('🚫 Disabling problematic extensions...');

    // Note: This would require Chrome to be closed
    // For now, we provide instructions

    const instructions = `
To disable problematic extensions:

1. Close Chrome completely
2. Open Chrome and go to: chrome://extensions/
3. Disable the following extensions:
${extensionIds.map(id => `   - Extension ID: ${id}`).join('\n')}

Or use the clean development profile created by this tool.
`;

    console.log(instructions);

    this.appliedFixes.push({
      type: 'extension-disable',
      title: 'Extension Disable Instructions',
      description: 'Manual steps to disable problematic extensions',
      instructions: instructions,
      extensionIds: extensionIds,
      success: true
    });
  }

  generateFixReport() {
    console.log('\n📊 Fix Application Report\n');
    console.log('=' .repeat(50));

    const successful = this.appliedFixes.filter(fix => fix.success);
    const failed = this.appliedFixes.filter(fix => !fix.success);

    console.log(`\n📋 Summary:`);
    console.log(`   Fixes Applied: ${successful.length}`);
    console.log(`   Fixes Failed: ${failed.length}`);

    if (successful.length > 0) {
      console.log(`\n✅ Successful Fixes:`);
      successful.forEach((fix, index) => {
        console.log(`   ${index + 1}. ${fix.title}`);
        console.log(`      ${fix.description}`);
        if (fix.scriptPath) {
          console.log(`      Script: ${fix.scriptPath}`);
        }
        if (fix.command) {
          console.log(`      Command: ${fix.command}`);
        }
        console.log('');
      });
    }

    if (failed.length > 0) {
      console.log(`\n❌ Failed Fixes:`);
      failed.forEach((fix, index) => {
        console.log(`   ${index + 1}. ${fix.title}`);
        console.log(`      Error: ${fix.description}`);
        console.log('');
      });
    }

    console.log('🚀 Next Steps:');
    console.log('   1. Run: ./dev-clean.sh for clean development environment');
    console.log('   2. Or run: ./launch-chrome-dev.sh then npm run dev');
    console.log('   3. Verify clean console in Chrome DevTools');
    console.log('   4. Bookmark chrome://extensions/ for easy extension management');

    console.log('\n' + '=' .repeat(50));
  }

  saveFixReport(outputPath = './chrome-detective-fixes.json') {
    const report = {
      timestamp: new Date().toISOString(),
      platform: this.platform,
      appliedFixes: this.appliedFixes,
      summary: {
        successful: this.appliedFixes.filter(fix => fix.success).length,
        failed: this.appliedFixes.filter(fix => !fix.success).length
      }
    };

    fs.writeFileSync(outputPath, JSON.stringify(report, null, 2));
    console.log(`📄 Fix report saved to: ${outputPath}`);
  }
}

// CLI execution
const isMainModule = import.meta.url === `file://${process.argv[1]}`;

if (isMainModule) {
  async function main() {
    const fixer = new ChromeConflictFixer();

    try {
      await fixer.applyImmediateFixes();
      fixer.saveFixReport();

      console.log('\n🎉 Chrome Ecosystem Detective fixes applied successfully!');
      console.log('   Use ./dev-clean.sh to start clean development environment');

      process.exit(0);

    } catch (error) {
      console.error('❌ Fix application failed:', error.message);
      process.exit(1);
    }
  }

  main();
}

export default ChromeConflictFixer;