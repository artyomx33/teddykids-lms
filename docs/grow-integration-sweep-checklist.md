# Grow Integration — Sweep Checklist

_Last updated: 2025-09-03_

Use this checklist to confirm the **Grow** module is wired, visible, and free of legacy leftovers after deployment.

---

## 1. Deployment sanity
- [ ] Confirm latest commit SHA on **main** matches merge of PR #8  
      `git log -1 --oneline`
- [ ] Verify Vercel build succeeded for that commit
- [ ] Hard-refresh prod site (⌘⇧R / Ctrl-F5) or clear CDN cache

## 2. Routing wiring
- [ ] `/grow` redirects to `/grow/onboarding`
- [ ] Hitting `/grow/onboarding` loads the onboarding page without 404s
- [ ] Browser console shows **no** 404s for JS / CSS chunks

## 3. Sidebar / Layout
- [ ] Sidebar shows parent **Grow** (🌱 icon) in all viewport widths
- [ ] Clicking **Grow** toggles sub-items
- [ ] Sub-link **Onboarding** navigates correctly and highlights as active
- [ ] Mobile: hamburger → sidebar → **Grow** group behaves the same

## 4. Build & Aliases
- [ ] `tsconfig.json` / `vite.config.ts` include `@/*` and resolve `@/modules/*`
- [ ] Production bundle has `/src/modules/growbuddy` code (inspect Network → JS chunks)
- [ ] No unresolved import warnings during `npm run build`

## 5. Styling / Visibility
- [ ] `Sprout` icon (lucide) renders—no blank space
- [ ] Menu item text has non-muted color when active
- [ ] Element isn’t hidden by `overflow` or z-index; verify in DevTools inspector

## 6. Legacy cleanup
- [ ] No leftover `Grow Buddy` routes (`/growbuddy`) in codebase  
      `grep -R "growbuddy" src/`
- [ ] Remove any duplicate `Layout` components no longer used
- [ ] Delete obsolete assets or placeholder imports once real images are ready

## 7. Vercel config
- [ ] `vercel.json` or dashboard routes include `/grow*` (if rewrites used)
- [ ] Environment variables unchanged / not required for Grow onboarding
- [ ] Automatic production deployment is enabled on **main**

## 8. Diagnostics & Next steps
- [ ] If menu still missing, reproduce locally with `npm run dev`
- [ ] Compare local vs prod bundle diff (`npm run build --watch`)
- [ ] Roll back in Vercel UI if urgent, then iterate
- [ ] After pass, close this checklist in PR or docs

---
Keep this file updated with any future Grow sub-pages or structural changes. ✔
