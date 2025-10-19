# 🧸 Teddy Kids LMS

Internal admin portal for managing contracts, staff onboarding, and daily operations at Teddy Kids.

**Live Production:** [https://teddykids-lms.vercel.app](https://teddykids-lms.vercel.app)

---

## 📚 Quick Links

- **[TODO.md](TODO.md)** - Active tasks and priorities
- **[CLAUDE.md](CLAUDE.md)** - AI development setup & personality
- **[CODING_RULES.md](CODING_RULES.md)** - Development standards
- **[PROJECT_PLAN.md](PROJECT_PLAN.md)** - Master project roadmap
- **Quick References:** `ls ***reference_*` - Important API docs & guides

---

## 🏗️ Project Structure

This project uses a **flat structure with category prefixes** for easy navigation:

### **Root Directory (Clean & Essential)**
```
teddykids-lms-main/
│
├── 📋 Core Files
│   ├── README.md                    ⭐ You are here!
│   ├── CLAUDE.md                    ⭐ AI development setup
│   ├── CODING_RULES.md              ⭐ Development standards
│   ├── PROJECT_PLAN.md              ⭐ Master roadmap
│   ├── TODO.md                      ⭐ Active tasks
│   └── (Essential configs: package.json, vite.config.ts, etc.)
│
├── ⭐ Quick Reference Files (*** prefix)
│   ├── ***reference_LOVABLE_CONTRACT_IMPLEMENTATION_PLAN.md
│   ├── ***reference_EMPLOYES_API_DISCOVERY_REPORT.md
│   ├── ***reference_EMPLOYES_DETAILED_API_DOCUMENTATION.md
│   ├── ***reference_SUPABASE_SECRETS_TO_DEPLOY.md
│   └── ***reference_UI_DEVELOPMENT_PLAN_2.0.md
│
├── 📝 Categorized Markdown Files (category_ prefix)
│   ├── victories_*.md (20 files)    🎉 Completed work
│   ├── todo_*.md (2 files)          📋 Active tasks
│   ├── architecture_*.md (7 files)  🏗️ System design
│   ├── implementation_*.md (8 files) 🔧 Implementation plans
│   ├── deployment_*.md (5 files)    🚀 Deployment guides
│   ├── fixes_*.md (10 files)        🐛 Bug fixes
│   ├── analysis_*.md (8 files)      📊 Reports
│   ├── features_*.md (9 files)      ✨ Feature docs
│   ├── integrations_*.md (4 files)  🔌 API docs
│   ├── agents_*.md (5 files)        🤖 AI agents
│   └── refactors_*.md (10 files)    🔄 Major refactors
│
├── 🔧 scripts/
│   ├── dev/                         Development utilities
│   ├── deploy/                      Deployment scripts
│   ├── database/                    Database utilities
│   ├── debugging/                   Debug tools
│   └── README.md                    Script documentation
│
├── 📊 data/ (gitignored!)
│   ├── debug/                       Debug artifacts
│   ├── employes/                    API responses
│   ├── migrations/                  Phase data
│   └── README.md                    Data documentation
│
├── 🔐 .secrets/ (gitignored!)
│   ├── api_key.txt                  API keys (NEVER COMMIT!)
│   ├── employes_api_key.txt         Employes.nl key
│   └── README.md                    Security instructions
│
├── 🗄️ sql/
│   ├── *.sql                        SQL utility files
│   ├── archive/                     Old SQL fixes
│   └── README.md                    SQL documentation
│
├── 📦 archive/
│   └── Old files kept for reference
│
└── 💻 Source Code (Production)
    ├── src/                         React application
    ├── supabase/                    Edge functions & migrations
    ├── public/                      Static assets
    └── dist/                        Build output
```

---

## 📝 File Naming Conventions

### **🎯 Where to Put New Files**

| File Type | Location | Naming Convention | Example |
|-----------|----------|-------------------|---------|
| **Quick Reference** | Root | `***reference_NAME.md` | `***reference_API_DOCS.md` |
| **Active TODO** | Root | `todo_NAME.md` | `todo_FIX_USER_ROLES.md` |
| **Victory/Completed** | Root | `victories_NAME.md` | `victories_FEATURE_X_COMPLETE.md` |
| **Architecture** | Root | `architecture_NAME.md` | `architecture_TEMPORAL_DATA.md` |
| **Implementation** | Root | `implementation_NAME.md` | `implementation_PHASE_3.md` |
| **Deployment** | Root | `deployment_NAME.md` | `deployment_AWS_SETUP.md` |
| **Bug Fix** | Root | `fixes_NAME.md` | `fixes_TIMELINE_CRASH.md` |
| **Analysis** | Root | `analysis_NAME.md` | `analysis_PERFORMANCE_REPORT.md` |
| **Feature** | Root | `features_NAME.md` | `features_DARK_MODE.md` |
| **Integration** | Root | `integrations_NAME.md` | `integrations_STRIPE_API.md` |
| **AI Agent** | Root | `agents_NAME.md` | `agents_code_reviewer.md` |
| **Refactor** | Root | `refactors_NAME.md` | `refactors_DATABASE_CLEANUP.md` |
| **Dev Script** | `scripts/dev/` | `name.js/sh` | `test-connection.js` |
| **Deploy Script** | `scripts/deploy/` | `name.js/sh` | `deploy-prod.sh` |
| **Debug Script** | `scripts/debugging/` | `name.js` | `check-duplicates.mjs` |
| **SQL Utility** | `sql/` | `name.sql` | `add_sample_data.sql` |
| **Data File** | `data/category/` | `name.json` | `data/employes/response.json` |
| **API Key** | `.secrets/` | `name.txt` | `.secrets/stripe_key.txt` |

### **🎨 Naming Rules**

1. **Category Prefixes** - Use consistent prefixes for easy grouping
2. **Descriptive Names** - Be specific about what the file contains
3. **UPPER_CASE** - Use for important/reference docs
4. **lower-kebab-case** - Use for scripts and utilities
5. **No Spaces** - Use underscores or hyphens

### **✨ Special Prefixes**

- `***reference_*` - VIP documents for quick access (3+ stars for importance)
- `victories_*` - Completed work (celebrate wins!)
- `todo_*` - Active tasks (work in progress)
- `architecture_*` - System design docs
- `implementation_*` - Implementation plans
- `deployment_*` - Deployment guides
- `fixes_*` - Bug fixes and solutions
- `analysis_*` - Reports and investigations
- `features_*` - Feature documentation
- `integrations_*` - API integration docs
- `agents_*` - AI agent configurations
- `refactors_*` - Major refactoring docs

---

## 🔍 Quick Navigation

### **Find Files by Category**
```bash
# Quick references
ls ***reference_*

# Victory docs
ls victories_*

# Active TODOs
cat TODO.md
ls todo_*

# Architecture docs
ls architecture_*

# Implementation plans
ls implementation_*

# Bug fixes
ls fixes_*

# All categories available:
# victories_, todo_, architecture_, implementation_, deployment_,
# fixes_, analysis_, features_, integrations_, agents_, refactors_
```

### **Find Scripts**
```bash
# Development utilities
ls scripts/dev/

# Deployment scripts
ls scripts/deploy/

# Database utilities
ls scripts/database/

# Debugging tools
ls scripts/debugging/
```

### **Run Scripts**
```bash
# Dev scripts
./scripts/dev/dev-clean.sh
node scripts/dev/test-connection.js

# Deploy scripts
./scripts/deploy/DEPLOY.sh

# Database scripts
node scripts/database/inspect_db.cjs

# Debug scripts
node scripts/debugging/verify-sync-success.js
```

---

## 💻 Tech Stack

- **Frontend:** Vite, React, TypeScript
- **Styling:** Tailwind CSS, shadcn-ui
- **Routing:** React Router v6
- **Data:** TanStack Query (React Query)
- **Backend:** Supabase (Database, Auth, Edge Functions)
- **Deployment:** Vercel (Frontend), Supabase (Backend)

---

## 🚀 Getting Started

### **Prerequisites**
- Node.js 18+
- npm or yarn
- Git

### **Local Development**
```bash
# Clone the repository
git clone https://github.com/artyomx33/teddykids-lms.git
cd teddykids-lms

# Install dependencies
npm ci

# Set up environment variables
cp .env.example .env.local
# Edit .env.local with your Supabase credentials

# Start development server
npm run dev

# Open http://localhost:8080 in your browser
```

### **Available Scripts**
| Command | Purpose |
|---------|---------|
| `npm ci` | Install exact dependencies |
| `npm run dev` | Start local dev server (port 8080) |
| `npm run build` | Create production build |
| `npm run preview` | Preview built app locally |
| `npm run lint` | Run ESLint |

---

## 🔐 Environment Variables

### **Required Variables**
| Name | Description | Where to Find |
|------|-------------|---------------|
| `VITE_SUPABASE_URL` | Supabase project URL | Supabase Dashboard → Settings → API |
| `VITE_SUPABASE_PUBLISHABLE_KEY` | Supabase anon/public key | Supabase Dashboard → Settings → API |

### **Optional Variables**
| Name | Description |
|------|-------------|
| `VITE_EMPLOYES_API_KEY` | Employes.nl API key (for sync) |

**Note:** Vite only exposes variables **prefixed with `VITE_`** via `import.meta.env`.

### **Local Setup**
Create a `.env.local` file:
```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=your-anon-key-here
```

**Never commit `.env.local` - it's gitignored!**

---

## 📦 Build & Deploy

### **Vercel (Frontend)**
- **Framework:** Vite
- **Install:** `npm ci`
- **Build:** `npm run build`
- **Output:** `dist/`
- **Auto-Deploy:** Every push to `main`

**Vercel Environment Variables:**
Add `VITE_SUPABASE_URL` and `VITE_SUPABASE_PUBLISHABLE_KEY` in Vercel Dashboard → Settings → Environment Variables.

### **Supabase (Backend)**
- **Migrations:** Auto-applied via Supabase CLI
- **Edge Functions:** Deployed via `supabase functions deploy`
- **Database:** PostgreSQL with Row Level Security (RLS)

---

## 🗺️ Main Routes

| Route | Description |
|-------|-------------|
| `/` | Dashboard & Overview |
| `/staff` | Staff Management |
| `/staff/:id` | Staff Profile (with timeline, reviews, contracts) |
| `/contracts` | Contract Management |
| `/generate-contract` | Generate New Contract |
| `/compliance` | Compliance Dashboard |
| `/reviews` | Review Management |
| `/users` | User Management |
| `/settings` | Application Settings |
| `/grow/onboarding` | Staff Onboarding Modules |
| `/employes-sync` | Employes.nl Sync Control |

---

## 🏗️ Architecture Highlights

### **Temporal Data Architecture**
We use a sophisticated temporal data pattern for tracking changes over time:
- `employes_raw_data` - Raw API responses (SHA-256 deduplicated)
- `employes_changes` - Detected changes (what changed, when, why)
- `employes_timeline_v2` - Timeline events (promotions, raises, etc.)
- `employes_current_state` - Fast queries (current state view)

**Learn More:** See `architecture_TEMPORAL_ARCHITECTURE_IMPLEMENTATION_BLUEPRINT.md`

### **Error Boundaries**
Every page and critical section is wrapped in error boundaries for graceful degradation:
- **Page-level:** Catch entire page crashes
- **Section-level:** Isolate failures to specific sections
- **Recovery:** "Try Again" buttons for user recovery

**Learn More:** See `architecture_COMPONENT_ARCHITECTURE_STANDARDS.md`

### **Hybrid Sync System**
Smart sync that processes immediately when user is waiting, with queue for background processing:
- **Immediate Processing:** All employees when user clicks sync
- **Deduplication:** SHA-256 hashing prevents duplicates
- **Change Detection:** Only stores actual changes
- **Queue Ready:** For future background processing

**Learn More:** See `victories_HYBRID_SYNC_ARCHITECTURE_COMPLETE.md`

---

## 📚 Documentation

### **Getting Started Docs**
- [CLAUDE.md](CLAUDE.md) - AI development setup
- [CODING_RULES.md](CODING_RULES.md) - Development standards
- [TODO.md](TODO.md) - Active tasks

### **Architecture Docs**
```bash
ls architecture_*
```

### **Implementation Guides**
```bash
ls implementation_*
```

### **API Documentation**
```bash
ls ***reference_*
```

### **Victory Docs** (Completed Features)
```bash
ls victories_*
```

---

## 🎯 Contributing

### **Before You Start**
1. Read [CODING_RULES.md](CODING_RULES.md)
2. Check [TODO.md](TODO.md) for priorities
3. Review `architecture_COMPONENT_ARCHITECTURE_STANDARDS.md` for component patterns

### **Creating New Documentation**
1. Choose appropriate category prefix (see "File Naming Conventions" above)
2. Use descriptive UPPER_CASE names for important docs
3. Add entry to [TODO.md](TODO.md) if it's work in progress
4. Move to `victories_*` when complete!

### **Creating New Features**
1. Create feature doc: `features_YOUR_FEATURE.md`
2. Add implementation plan: `implementation_YOUR_FEATURE.md`
3. Wrap components in error boundaries
4. Update [TODO.md](TODO.md)
5. Celebrate when done: `victories_YOUR_FEATURE_COMPLETE.md`

### **Git Workflow**
- `main` - Production branch (auto-deploys to Vercel)
- `labs-2.0-experimental` - Active development branch
- Feature branches - For new features

---

## 🔒 Security

### **Secrets Management**
- **API Keys:** Store in `.secrets/` folder (gitignored!)
- **Environment Variables:** Use `.env.local` for local dev
- **Production Secrets:** Set in Vercel Dashboard & Supabase Secrets
- **Never commit:** `.env.local`, `.secrets/`, `api_key.txt`

### **RLS (Row Level Security)**
All database tables use Supabase RLS for access control:
- `authenticated` users can read most data
- `service_role` for admin operations
- Custom policies for sensitive data

---

## 🐛 Debugging

### **Debug Tools**
```bash
# Check sync results
node scripts/debugging/verify-sync-success.js

# Check for duplicates
node scripts/debugging/check-duplicates.mjs

# Inspect database
node scripts/database/inspect_db.cjs
```

### **Common Issues**
1. **Build fails:** Check `vite.config.ts` for missing packages
2. **Timeline empty:** Verify RLS policies on `employes_timeline_v2`
3. **Sync errors:** Check Supabase Edge Function logs
4. **Console errors:** See `victories_CONSOLE_ERRORS_FIXED.md` for solutions

---

## 🎉 Recent Victories

- ✅ **Temporal Architecture** - Netflix-level data tracking
- ✅ **Hybrid Sync System** - Smart immediate + queue processing
- ✅ **Error Boundaries** - Crash-proof pages
- ✅ **Zero Console Errors** - Clean production console
- ✅ **Perfect Deduplication** - SHA-256 hashing
- ✅ **Component Standards** - Documented best practices
- ✅ **Folder Organization** - Professional structure

See all victories: `ls victories_*`

---

## 📊 Project Stats

- **React Components:** 150+
- **Edge Functions:** 6 active
- **Database Tables:** 30+
- **Lines of Code:** 40,000+
- **Documentation Files:** 100+
- **Console Errors:** 0 🎉

---

## 👥 Team

**Maintained by:** Teddy Kids Engineering Team  
**For:** Internal use only

---

## 📞 Support

- **Issues:** Create a GitHub issue
- **Questions:** Check documentation or ask the team
- **AI Help:** Claude is configured in [CLAUDE.md](CLAUDE.md)

---

## 🏆 Acknowledgments

Built with:
- ❤️ Partnership & Collaboration
- 🎉 Celebration of every win
- 💪 Persistence & Excellence
- ✨ Innovation & Best Practices

**From broken to brilliant in ONE DAY!** ⚡

---

**Last Updated:** October 6, 2025  
**Version:** Labs 2.0 (Production Ready)  
**Status:** 🟢 Live & Stable
