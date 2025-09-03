# Teddy Kids LMS

Internal admin portal for managing contracts, staff onboarding, and daily operations at Teddy Kids.

## Tech Stack
- Vite
- React
- TypeScript
- Tailwind CSS
- shadcn-ui
- React Router v6
- TanStack Query

## Scripts
| Command            | Purpose                       |
| ------------------ | ----------------------------- |
| `npm ci`           | Install exact dependencies    |
| `npm run dev`      | Start local dev server (Vite) |
| `npm run build`    | Create production build       |
| `npm run preview`  | Preview built app locally     |
| `npm run lint`     | Run ESLint                    |

The Vite dev server is configured to run on port **8080** in `vite.config.ts`. Change the port there if you need something different.

## Local Development
```bash
# clone and enter repo
git clone <repo-url>
cd teddykids-lms

# install & start dev server
npm ci
npm run dev

# open http://localhost:8080 in your browser
```

## Build & Deploy (Vercel)
Project is deployed on Vercel.

Vercel settings  
• Framework Preset: **Vite**  
• Install Command: `npm ci`  
• Build Command: `npm run build`  
• Output Directory: `dist`  
• SPA rewrites: already configured in `vercel.json` to route **all paths** to `/index.html`

Every push to `main` triggers an automatic production deployment.

## Environment Variables
| Name                              | Description                    |
| --------------------------------- | ------------------------------ |
| `VITE_SUPABASE_URL`               | Supabase project URL           |
| `VITE_SUPABASE_PUBLISHABLE_KEY`   | Supabase anon/public key       |

Vite only exposes variables **prefixed with `VITE_`** via `import.meta.env`.  
Create a `.env.local` with the two variables above for local development.

## Main Routes
- `/` – Dashboard  
- `/contracts`  
- `/generate-contract`  
- `/users`  
- `/settings`  
- `/grow/onboarding` – Staff onboarding modules

## Ownership
This repository is maintained by the Teddy Kids engineering team and is intended for internal use only.
