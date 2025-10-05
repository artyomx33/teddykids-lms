# Chrome Ecosystem Detective

**Version**: 1.0.0
**Purpose**: Eliminate Chrome extension filesystem errors in React/Vite development environments

## Quick Start

```bash
# 1. Scan for problematic Chrome extensions
npm run chrome-detective:scan

# 2. Apply immediate fixes
npm run chrome-detective:fix

# 3. Verify clean environment
npm run chrome-detective:verify

# 4. Start clean development session
./dev-clean.sh
```

## Problem Solved

The Chrome Ecosystem Detective specifically targets this type of console pollution:

```
VM3277 polyfill.js:500 Uncaught (in promise) Error: IO error: .../012692.ldb: Unable to create writable file (ChromeMethodBFE: 9::NewWritableFile::8)
```

These errors are caused by Chrome extensions attempting filesystem operations that conflict with React/Vite development servers.

## Components

### 1. Scanner (`scanner.js`)
- **Purpose**: Identifies problematic Chrome extensions
- **Features**:
  - Scans all installed Chrome extensions
  - Calculates filesystem conflict risk scores
  - Identifies specific problematic permissions
  - Generates detailed conflict analysis

**Usage**:
```bash
npm run chrome-detective:scan
# Outputs: chrome-detective-report.json
```

**Sample Output**:
```
📊 Chrome Ecosystem Detective Report
==================================================

📋 Summary:
   Extensions Scanned: 15
   Conflicts Found: 3
   Recommendations: 4

⚠️  Problematic Extensions:
   1. Phantom Wallet (critical risk)
      - Crypto wallet causing heavy filesystem write operations
      - Uses browser storage - may cause filesystem write conflicts

   2. AdBlock (high risk)
      - Ad blocker - known to cause React dev server conflicts
      - Has background script - may interfere with development server
```

### 2. Fixer (`fixer.js`)
- **Purpose**: Applies targeted fixes for Chrome extension conflicts
- **Features**:
  - Creates clean development Chrome profile
  - Generates development-safe Chrome launch flags
  - Configures Vite for extension compatibility
  - Creates integrated development launcher

**Usage**:
```bash
npm run chrome-detective:fix
# Creates: launch-chrome-dev.sh, dev-clean.sh
```

**Generated Files**:
- `launch-chrome-dev.sh`: Chrome launcher with safe flags
- `dev-clean.sh`: Integrated development environment launcher
- `chrome-detective-fixes.json`: Applied fixes report

### 3. Verifier (`verifier.js`)
- **Purpose**: Verifies clean development environment
- **Features**:
  - Checks Chrome process configuration
  - Monitors extension error levels
  - Verifies development server health
  - Calculates environment cleanliness score

**Usage**:
```bash
npm run chrome-detective:verify
# Outputs: chrome-detective-verification.json

# Continuous monitoring
npm run chrome-detective:monitor
```

**Sample Verification Output**:
```
🎯 Overall Environment Score: 95%
🎉 Excellent! Your development environment is optimally configured.

📋 Detailed Results:

🌐 Chrome Process: 90%
   Development flags: 3/3
   ✅ Using clean development profile

🧩 Extension Cleanliness: 100%
   Extension errors detected: 0
   ✅ Using clean development profile

⚡ Development Server: 95%
   Vite running: ✅
   HMR healthy: ✅
```

### 4. React Component (`ChromeEcosystemDetective.tsx`)
- **Purpose**: Visual interface for the Chrome Ecosystem Detective
- **Features**:
  - Real-time diagnostic scanning
  - Interactive fix application
  - Environment monitoring dashboard
  - Extension conflict visualization

**Integration**:
```tsx
import ChromeEcosystemDetective from '@/components/debug/ChromeEcosystemDetective';

// Use in development/debug pages
<ChromeEcosystemDetective />
```

## Command Reference

### Core Commands
```bash
# Quick diagnostics
npm run chrome-detective:scan          # Scan extensions
npm run chrome-detective:fix           # Apply fixes
npm run chrome-detective:verify        # Verify environment

# Advanced usage
npm run chrome-detective:monitor       # Continuous monitoring
npm run dev:chrome-safe                # Apply fixes + start dev
npm run dev:verify                     # Verify + start dev
```

### Generated Scripts
```bash
# After running chrome-detective:fix
./launch-chrome-dev.sh                 # Launch Chrome with safe flags
./dev-clean.sh                         # Complete clean dev environment
```

## Fix Strategies

### Immediate Fixes (0-5 minutes)
1. **Chrome Flags**: Launch with extension-safe flags
2. **Clean Profile**: Use dedicated development profile
3. **Extension Disable**: Temporarily disable problematic extensions

### Strategic Fixes (5-30 minutes)
1. **Vite Configuration**: Optimize for extension compatibility
2. **Environment Scripts**: Automated clean development setup
3. **Monitoring Setup**: Continuous environment health checks

## Troubleshooting

### Common Issues

**"Extension still causing errors"**
```bash
# Force clean profile creation
rm -rf /tmp/chrome-dev-profile
npm run chrome-detective:fix
```

**"Vite configuration not applied"**
```bash
# Restore backup and reapply
cp vite.config.ts.chrome-detective-backup vite.config.ts
npm run chrome-detective:fix
```

**"Chrome flags not working"**
```bash
# Check Chrome executable path
which google-chrome
# Update fixer.js with correct path
```

### Verification Failures

If verification score is below 70%:

1. **Check Chrome Process**:
   ```bash
   ps aux | grep chrome | grep user-data-dir
   ```

2. **Verify Clean Profile**:
   ```bash
   ls -la /tmp/chrome-dev-profile
   ```

3. **Test Development Server**:
   ```bash
   lsof -i :8080
   ```

## Integration Examples

### Development Workflow
```bash
# Morning routine
npm run chrome-detective:verify
if [ $? -ne 0 ]; then
    npm run chrome-detective:fix
fi
./dev-clean.sh
```

### CI/CD Integration
```yaml
# .github/workflows/development-check.yml
- name: Verify Development Environment
  run: npm run chrome-detective:verify
  continue-on-error: true
```

### Team Onboarding
```bash
# new-developer-setup.sh
echo "Setting up clean development environment..."
npm run chrome-detective:fix
echo "✅ Chrome Ecosystem Detective configured"
echo "Use './dev-clean.sh' for clean development sessions"
```

## Architecture

### File Structure
```
src/debug/chrome-detective/
├── README.md                          # This file
├── scanner.js                         # Extension scanner
├── fixer.js                          # Fix application
├── verifier.js                       # Environment verification
└── ../ChromeEcosystemDetective.tsx   # React component
```

### Data Flow
```
Scanner → Identifies conflicts → Generates recommendations
    ↓
Fixer → Applies fixes → Creates scripts/configurations
    ↓
Verifier → Validates environment → Provides feedback
    ↓
Component → Visualizes status → Enables interaction
```

## Advanced Usage

### Custom Configuration
```javascript
// Custom scanner configuration
const scanner = new ChromeExtensionScanner();
scanner.riskThreshold = 0.3; // Lower threshold for stricter checking
await scanner.scanExtensions();
```

### Continuous Integration
```bash
# Run as part of development setup
npm run chrome-detective:scan && \
npm run chrome-detective:fix && \
npm run chrome-detective:verify
```

### Team Standardization
```bash
# Generate team configuration
npm run chrome-detective:fix
# Commit generated scripts to repository
git add launch-chrome-dev.sh dev-clean.sh
git commit -m "Add Chrome Ecosystem Detective configuration"
```

## Contributing

### Adding New Extension Patterns
Edit `scanner.js` and add to `problemPatterns`:
```javascript
const problemPatterns = [
  /your-pattern/i,
  // existing patterns...
];
```

### Adding New Fixes
Edit `fixer.js` and add to the fixes array:
```javascript
const fixes = [
  this.yourNewFix,
  // existing fixes...
];
```

### Improving Detection
Update risk calculation in `calculateFilesystemRisk()`:
```javascript
// Add new high-risk permissions
const newRiskPermissions = ['newPermission'];
```

---

**Chrome Ecosystem Detective** - Ensuring clean development environments for the TeddyKids LMS team and beyond.