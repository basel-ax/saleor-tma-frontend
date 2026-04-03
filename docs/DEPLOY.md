# 🚀 Deploying to Cloudflare Pages

> Opencode-compatible deployment guide for the Food Order Telegram Mini App static site on Cloudflare Pages.

---

## 🎯 Overview

This guide covers every method to deploy the Food Order Telegram Mini App as a static site on **Cloudflare Pages**. The app is a pure static SPA requiring specific configuration for proper Telegram Mini App functionality.

**Key Deployment Requirements:**
- Cloudflare Pages global CDN with automatic HTTPS (required by Telegram)
- Proper SPA routing via `_redirects` file for React Router
- Environment variables for backend configuration
- Custom domain support for production use

---

## 📋 Table of Contents

- [Why Cloudflare Pages](#why-cloudflare-pages)
- [Prerequisites](#prerequisites)
- [Deployment Options](#deployment-options)
- [Environment Variables](#environment-variables)
- [SPA Routing](#spa-routing)
- [Custom Domain & SSL](#custom-domain--ssl)
- [Preview Deployments](#preview-deployments)
- [GitHub Actions CI/CD](#github-actions-cicd)
- [Build Configuration](#build-configuration)
- [Troubleshooting](#troubleshooting)
- [Quick Reference](#quick-reference)

---

## ☁️ Why Cloudflare Pages

| Feature | Detail |
|---------|--------|
| **Free tier** | Unlimited requests, 500 builds/month |
| **Global CDN** | 300+ edge locations |
| **Automatic HTTPS** | Required by Telegram for Mini App URLs |
| **Preview deployments** | Every branch/PR gets its own URL |
| **Zero config** | Detects Vite automatically |
| **`_redirects` support** | Enables React Router browser history mode |

---

## 🔧 Prerequisites

Before deploying, ensure you have:

1. **Cloudflare account** (free tier sufficient)
2. **GitHub/GitLab repository** with your code pushed
3. **Node.js 18+** installed locally for builds
4. **Backend URL** configured in environment variables

---

## 🚀 Deployment Options

### Option A — Git Integration (Recommended)

**Best for:** Automatic deployments on every push

#### Step-by-Step Process

1. **Push to GitHub/GitLab**
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin https://github.com/your-username/saleor-tma-frontend.git
   git push -u origin main
   ```

2. **Create Pages Project**
   - Go to Cloudflare Dashboard → Workers & Pages
   - Click **Create** → **Pages** tab
   - Click **Connect to Git**
   - Select repository and click **Begin setup**

3. **Configure Build Settings**
   | Field | Value |
   |-------|-------|
   | **Project name** | `saleor-tma-frontend` |
   | **Production branch** | `main` |
   | **Framework preset** | `Vite` (or `None`) |
   | **Build command** | `npm run build` |
   | **Build output directory** | `dist` |
   | **Root directory** | `/` |

4. **Add Environment Variables**
   - Click **Environment variables (advanced)** before deploying
   - Add:
     ```
     VITE_BACKEND_BASE_URL = https://your-backend-api.com
     NODE_VERSION = 18
     ```

5. **Deploy**
   - Click **Save and Deploy**
   - App live at: `https://<project-name>.pages.dev`

6. **Configure Telegram Bot**
   - Set Mini App URL in BotFather to your Pages domain

---

### Option B — Wrangler CLI

**Best for:** Local machine deployments or custom CI scripts

#### Installation & Setup
```bash
# Install Wrangler globally
npm install -g wrangler

# Authenticate with Cloudflare
wrangler login

# Build locally (create .env.local first)
echo "VITE_BACKEND_BASE_URL=https://your-backend-api.com" > .env.local
npm run build

# Deploy
wrangler pages deploy dist --project-name=saleor-tma-frontend
```

#### Environment Variables via CLI
```bash
# Set build-time variables (NOT secrets)
wrangler pages secret put VITE_BACKEND_BASE_URL --project-name=saleor-tma-frontend
# Actually, use Dashboard for VITE_* variables as they're build-time
```

---

### Option C — Direct Upload (No CLI)

**Best for:** Quick tests or one-time deployments

#### Process
1. **Build locally**
   ```bash
   npm install
   cp .env.example .env.local  # Edit with backend URL
   npm run build
   ```

2. **Upload via Dashboard**
   - Cloudflare Dashboard → Workers & Pages → Create → Pages
   - Click **Upload assets**
   - Enter project name
   - Upload entire `dist/` folder
   - Click **Deploy site**

---

## 🔐 Environment Variables

### How Vite Build-Time Variables Work

Vite replaces `import.meta.env.VITE_*` references **at build time**. Values are baked into the JavaScript bundle.

```
Build step:   VITE_BACKEND_BASE_URL=https://api.example.com  →  npm run build
Output:       dist/assets/index-abc123.js  (contains URL literally)
```

### Setting Variables in Cloudflare Pages Dashboard

1. Open Pages project → Settings → Environment variables
2. Click **Add variable**
3. Set for **Production** and/or **Preview** separately

| Variable | Required | Example | Notes |
|----------|----------|---------|-------|
| `VITE_BACKEND_BASE_URL` | ✅ | `https://api.yourdomain.com` | No trailing slash |
| `VITE_DEV_INIT_DATA` | No | `auth_date=...&user=...&hash=...` | URL-encoded Telegram init data (optional) |
| `NODE_VERSION` | Recommended | `18` | Ensures correct Node.js version |

### Per-Environment Configuration

Cloudflare Pages supports:
- **Production**: Pushes to production branch (`main`)
- **Preview**: Pushes to other branches (PRs, feature branches)

Set different backends for each:
```
Production  →  VITE_BACKEND_BASE_URL = https://api.yourdomain.com
Preview     →  VITE_BACKEND_BASE_URL = https://staging-api.yourdomain.com
```

---

## 🔀 SPA Routing — The `_redirects` File

React Router uses browser History API. Without redirect rule, deep links return 404.

The file `public/_redirects` contains:
```
/* /index.html 200
```

This serves `index.html` for every request, letting React Router handle routing client-side. Vite copies this to `dist/` during build.

**Verify after building:**
```bash
npm run build
cat dist/_redirects  # Should output: /* /index.html 200
```

> Without this file, all routes except `/` will 404 for users bookmarking/deep linking.

---

## 🌐 Custom Domain & SSL

Cloudflare Pages provides free `*.pages.dev` subdomain. You can attach custom domains.

### Adding Custom Domain
1. Pages project → Custom domains tab
2. Click **Set up a custom domain**
3. Enter domain (e.g. `app.yourdomain.com`)
4. If DNS managed by Cloudflare: CNAME added automatically
5. If external DNS: Add CNAME manually:
   ```
   Type:  CNAME
   Name:  app
   Value: saleor-tma-frontend.pages.dev
   ```
6. SSL provisioned automatically (Let's Encrypt)

### Using Custom Domain for Telegram Bot
Once active, update BotFather:
```
Mini App URL: https://app.yourdomain.com
```

---

## 👁️ Preview Deployments

Every push to non-production branch gets unique preview URL:
```
https://<hash>.saleor-tma-frontend.pages.dev
```

### Benefits
- Test changes before merging to `main`
- Share working previews with teammates
- QA testing against staging backend

### Accessing Preview URLs
1. Pages project → Deployments tab
2. Find deployment for branch/commit
3. Click deployment URL

### Preview-Specific Variables
Set different `VITE_BACKEND_BASE_URL` for Preview environment in Settings → Environment variables.

---

## 🔄 GitHub Actions CI/CD

For controlled deployment pipelines with GitHub Actions and Wrangler.

### Setup
1. Get Cloudflare credentials:
   - `CLOUDFLARE_API_TOKEN` (Pages: Edit permission)
   - `CLOUDFLARE_ACCOUNT_ID` (from Dashboard sidebar)
2. Add as GitHub repo secrets:
   - `CLOUDFLARE_API_TOKEN`
   - `CLOUDFLARE_ACCOUNT_ID`
   - `VITE_BACKEND_BASE_URL`

### Workflow File (`.github/workflows/deploy.yml`)
```yaml
name: Deploy to Cloudflare Pages

on:
  push:
    branches:
      - main          # Production
  pull_request:
    branches:
      - main          # Preview for PRs

jobs:
  deploy:
    runs-on: ubuntu-latest
    name: Deploy
    permissions:
      contents: read
      deployments: write

    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '18'
          cache: 'npm'
      - run: npm ci
      - run: npm run type-check
      - run: npm run build
        env:
          VITE_BACKEND_BASE_URL: ${{ secrets.VITE_BACKEND_BASE_URL }}
      - uses: cloudflare/wrangler-action@v3
        with:
          apiToken: ${{ secrets.CLOUDFLARE_API_TOKEN }}
          accountId: ${{ secrets.CLOUDFLARE_ACCOUNT_ID }}
          command: pages deploy dist --project-name=saleor-tma-frontend --branch=${{ github.ref_name }}
```

### What This Workflow Does
| Trigger | Branch | Result |
|---------|--------|--------|
| Push to `main` | `main` | Production at `*.pages.dev` |
| PR to `main` | `<pr-branch>` | Preview at `<hash>.pages.dev` |

---

## 🏗️ Build Configuration Reference

### vite.config.ts
```typescript
export default defineConfig({
  build: {
    outDir: "dist",        // Cloudflare Pages reads from here
    sourcemap: false,      // Disable sourcemaps in production
  },
});
```

### public/_redirects
```
/* /index.html 200
```
Required for React Router browser history mode. Copied to `dist/` automatically.

### Environment Variables at Build Time
| Variable | Where to set |
|----------|--------------|
| Local dev | `.env.local` (git-ignored) |
| Cloudflare Pages | Dashboard → Settings → Environment variables |
| GitHub Actions | Repository secrets |

### Node.js Version
Cloudflare Pages defaults to older Node.js. Pin explicitly:
- **Env var**: Add `NODE_VERSION = 18` in Settings → Environment variables
- **Alternative**: Create `.nvmrc` file with `18`
- **Alternative**: Add `"engines": { "node": ">=18" }` to package.json

---

## 🔧 Troubleshooting

### ❌ Build fails: `Cannot find module`
**Cause:** Dependencies not installed or wrong Node version.
**Fix:**
1. Confirm build command is `npm run build`
2. Add `NODE_VERSION = 18` as environment variable in Pages dashboard
3. Verify `package.json` and `package-lock.json` committed

### ❌ All routes except `/` return 404
**Cause:** `public/_redirects` missing or not copied to `dist/`.
**Fix:**
1. Verify `public/_redirects` exists with `/* /index.html 200`
2. Run `npm run build` and confirm `dist/_redirects` present
3. Check `publicDir` in `vite.config.ts` not overridden

### ❌ `VITE_BACKEND_BASE_URL` undefined at runtime
**Cause:** Variable not set before build, Vite replaced with `undefined`.
**Fix:**
1. Go to Settings → Environment variables in Cloudflare Pages dashboard
2. Add `VITE_BACKEND_BASE_URL` and trigger new deployment
3. Verify deployed JS bundle contains URL:
   ```bash
   grep -r "your-backend-api.com" dist/assets/
   ```

### ❌ Telegram rejects Mini App URL (not HTTPS)
**Cause:** Telegram requires HTTPS. Misconfigured custom domain.
**Fix:**
1. Ensure SSL enabled on custom domain (Cloudflare automatic)
2. Wait few minutes after adding domain for SSL provisioning
3. Test by opening `https://your-domain.com` in browser — no cert warning

### ❌ API requests fail with CORS errors
**Cause:** Backend doesn't allow requests from Cloudflare Pages domain.
**Fix:** Add Pages domain to backend's CORS allowed origins:
```
https://saleor-tma-frontend.pages.dev
https://app.yourdomain.com        # if using custom domain
http://localhost:5173              # for local development
```

### ❌ White screen / app doesn't load in Telegram
**Cause:** JS error during initialization or telegram-web-app.js failed to load.
**Fix:**
1. Open app in desktop browser first to check JS errors (F12 → Console)
2. Enable WebView debugging in Telegram:
   - Android: Settings → Advanced → Enable WebView Debug, then use `chrome://inspect`
   - iOS: Tap Settings icon 10 times rapidly to enable WebView inspection
3. Verify `index.html` includes script tag:
   ```html
   <script src="https://telegram.org/js/telegram-web-app.js"></script>
   ```

### ❌ Build succeeds but changes don't appear
**Cause:** Browser or Cloudflare CDN cache.
**Fix:**
1. Hard refresh: `Ctrl+Shift+R` (Win/Linux) or `Cmd+Shift+R` (Mac)
2. Check Deployments tab in Pages project — ensure latest commit deployed
3. Cloudflare CDN cache automatically purged on each deployment

---

## ⚡ Quick Reference

```bash
# Local development
npm install
cp .env.example .env.local   # set VITE_BACKEND_BASE_URL
npm run dev                   # http://localhost:5173

# Production build
npm run build                 # outputs to dist/

# Deploy via Wrangler CLI
wrangler pages deploy dist --project-name=saleor-tma-frontend

# Check deployments
wrangler pages deployment list --project-name=saleor-tma-frontend
```

---

## 📚 Related Documentation

- [Cloudflare Pages Docs](https://developers.cloudflare.com/pages/)
- [Wrangler CLI Reference](https://developers.cloudflare.com/workers/wrangler/commands/#pages)
- [Cloudflare Pages — Build Configuration](https://developers.cloudflare.com/pages/configuration/build-configuration/)
- [Cloudflare Pages — Redirects](https://developers.cloudflare.com/pages/configuration/redirects/)
- [Cloudflare Pages — Custom Domains](https://developers.cloudflare.com/pages/configuration/custom-domains/)
- [Telegram Mini App Setup](../README.md#telegram-bot-setup)

---

## 📝 Changelog

- Original: Comprehensive Cloudflare Pages deployment guide
- 2026-04-03: Restructured for opencode compatibility with:
  - Clear overview and prerequisites sections
  - Detailed deployment options (Git, Wrangler, Direct Upload)
  - Environment variables explanation and setup
  - SPA routing requirements
  - Custom domain and SSL guidance
  - Preview deployments and CI/CD integration
  - Build configuration reference
  - Comprehensive troubleshooting section
  - Quick reference commands