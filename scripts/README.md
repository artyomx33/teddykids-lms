# 🔧 Scripts Directory

## 📁 Structure

### **dev/** - Development Utilities
- `dev-clean.sh` - Clean development environment
- `launch-chrome-dev.sh` - Launch Chrome in dev mode
- `claude-helpers.js` - Claude helper functions for quick queries
- `test-connection.js` - Test database connections
- `test-connections.js` - Test multiple connections
- `test-temporal-data.js` - Test temporal data architecture

### **deploy/** - Deployment Scripts
- `DEPLOY.sh` - Main deployment script
- `deploy-via-curl.sh` - Deploy via curl commands
- `direct-deploy.mjs` - Direct deployment (ES modules)
- `direct-phase2-deploy.js` - Phase 2 deployment

### **database/** - Database Utilities
- `inspect_db.cjs` - Inspect database structure
- `deploy-database-fix.js` - Deploy database fixes
- `direct-database-deploy.js` - Direct database deployment
- `final-database-fix.js` - Final database fixes

### **debugging/** - Debug Utilities
- `debug-afdeling-ids.js` - Debug afdeling IDs
- `afdeling-finder.js` - Find afdeling data
- `test-salary-reconstruction.js` - Test salary reconstruction
- `check-duplicates.mjs` - Check for duplicate data
- `check-n8n-workflows.cjs` - Check n8n workflows
- `check-sync-results.js` - Verify sync results
- `verify-sync-success.js` - Verify sync was successful

---

## 🚀 Usage

### **Development**
```bash
# Clean development environment
./scripts/dev/dev-clean.sh

# Launch Chrome with debugging
./scripts/dev/launch-chrome-dev.sh

# Run Claude helpers
node scripts/dev/claude-helpers.js
```

### **Deployment**
```bash
# Main deployment
./scripts/deploy/DEPLOY.sh

# Deploy via curl
./scripts/deploy/deploy-via-curl.sh
```

### **Database**
```bash
# Inspect database
node scripts/database/inspect_db.cjs

# Deploy database fixes
node scripts/database/deploy-database-fix.js
```

### **Debugging**
```bash
# Check for duplicates
node scripts/debugging/check-duplicates.mjs

# Verify sync
node scripts/debugging/verify-sync-success.js
```

---

## 📝 Notes

- All scripts preserve git history from reorganization
- Scripts are organized by purpose for easy navigation
- Make scripts executable: `chmod +x script-name.sh`

---

**Organized**: October 6, 2025

