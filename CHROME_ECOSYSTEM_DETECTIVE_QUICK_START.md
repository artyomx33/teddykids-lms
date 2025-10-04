# Chrome Ecosystem Detective - Quick Start Guide

**🎯 Mission**: Eliminate Chrome extension filesystem errors that pollute your development console.

## ⚡ Instant Problem Solver

**Problem**: Seeing errors like this in your console?
```
VM3277 polyfill.js:500 Uncaught (in promise) Error: IO error: .../012692.ldb: Unable to create writable file (ChromeMethodBFE: 9::NewWritableFile::8)
```

**Solution**: Run these 3 commands:
```bash
npm run chrome-detective:scan     # 🔍 Find the culprits
npm run chrome-detective:fix      # 🔧 Apply instant fixes
./dev-clean.sh                    # 🚀 Start clean development
```

## 🚀 One-Command Solution

```bash
npm run dev:chrome-safe
```
*This automatically applies fixes and starts a clean development environment.*

## 📊 Verify Your Environment

```bash
npm run chrome-detective:verify
```

**Healthy Environment Score**: 90%+
**Needs Attention**: Below 70%

## 🛠️ What Gets Fixed

✅ **Chrome Profile**: Clean development profile with minimal extensions
✅ **Chrome Flags**: Extension-safe browser flags
✅ **Vite Config**: Development server optimized for extension compatibility
✅ **Launch Scripts**: Automated clean environment setup

## 📁 Generated Files

After running `npm run chrome-detective:fix`:

- `./launch-chrome-dev.sh` - Chrome launcher with safe flags
- `./dev-clean.sh` - Complete clean development environment
- `vite.config.ts` - Updated with extension-safe settings
- Reports in JSON format for tracking

## 🎛️ Advanced Usage

```bash
# Continuous monitoring (every 5 minutes)
npm run chrome-detective:monitor

# Just verify environment health
npm run dev:verify

# Custom monitoring interval
node src/debug/chrome-detective/verifier.js --monitor --interval 10
```

## 🎯 Success Metrics

- **Zero extension errors** in Chrome DevTools Console
- **Clean development experience** without filesystem conflicts
- **Fast HMR** without browser interference
- **Team consistency** across all development environments

## 🔧 Troubleshooting

**Still seeing errors?**
```bash
# Force clean profile recreation
rm -rf /tmp/chrome-dev-profile
npm run chrome-detective:fix
```

**Chrome not launching correctly?**
```bash
# Check Chrome executable path
which google-chrome
# May need to update path in src/debug/chrome-detective/fixer.js
```

**Vite config issues?**
```bash
# Restore backup
cp vite.config.ts.chrome-detective-backup vite.config.ts
npm run chrome-detective:fix
```

## 📚 Full Documentation

- **Detailed Guide**: `/src/debug/chrome-detective/README.md`
- **Agent Specification**: `/chrome-ecosystem-detective.md`
- **React Component**: `/src/components/debug/ChromeEcosystemDetective.tsx`

## 🌟 Pro Tips

1. **Bookmark** `chrome://extensions/` for quick extension management
2. **Use** `./dev-clean.sh` for every development session
3. **Run** verification after installing new Chrome extensions
4. **Share** generated scripts with your team for consistency

---

**Chrome Ecosystem Detective** - Clean development environments, guaranteed. 🧹✨