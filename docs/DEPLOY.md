# 🚀 Deploying to Cloudflare Pages

This guide covers every method to deploy the Food Order Telegram Mini App as a static site on **Cloudflare Pages**.

---

## Table of Contents

- [Why Cloudflare Pages](#why-cloudflare-pages)
- [Prerequisites](#prerequisites)
- [Option A — Git Integration (Recommended)](#option-a--git-integration-recommended)
- [Option B — Wrangler CLI](#option-b--wrangler-cli)
- [Option C — Direct Upload (No CLI)](#option-c--direct-upload-no-cli)
- [Environment Variables](#environment-variables)
- [SPA Routing — The `_redirects` File](#spa-routing--the-_redirects-file)
- [Custom Domain & SSL](#custom-domain--ssl)
- [Preview Deployments](#preview-deployments)
- [GitHub Actions CI/CD](#github-actions-cicd)
- [Build Configuration Reference](#build-configuration-reference)
- [Troubleshooting](#troubleshooting)

---

## Why Cloudflare Pages

| Feature | Detail |
|---|---|
| **Free tier** | Unlimited requests, 500 builds/month |
| **Global CDN** | 300+ edge locations |
| **Automatic HTTPS** | Required by Telegram for Mini App URLs |
| **Preview deployments** | Every branch/PR gets its own URL |
| **Zero config** | Detects Vite automatically |
| **`_redirects` support** | Enables React Router browser history mode |

---

## Prerequisites

- A [Cloudflare account](https://dash.cloudflare.com/sign-up) (free)
- Your code pushed to a **GitHub** or **GitLab** repository
- Node.js 18+ installed locally

---

## Option A — Git Integration (Recommended)

This is the best approach: Cloudflare Pages watches your repository and rebuilds automatically on every push.

### Step 1 — Push to GitHub/GitLab

Make sure your code is in a remote repository:

```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/your-username/saleor-tma-frontend.git
git push -u origin main
```

### Step 2 — Create a Pages Project

1. Go to [Cloudflare Dashboard](https://dash.cloudflare.com/)
2. In the left sidebar, click **Workers & Pages**
3. Click **Create** → select the **Pages** tab
4. Click **Connect to Git**
5. Authorize Cloudflare to access GitHub/GitLab if prompted
6. Select your repository from the list and click **Begin setup**

### Step 3 — Configure Build Settings

Fill in the build configuration form:

| Field | Value |
|---|---|
| **Project name** | `saleor-tma-frontend` (or your preferred name) |
| **Production branch** | `main` |
| **Framework preset** | `Vite` (or `None`) |
| **Build command** | `npm run build` |
| **Build output directory** | `dist` |
| **Root directory** | `/` (leave blank if the repo root is the project root) |

### Step 4 — Add Environment Variables

Before clicking **Save and Deploy**, click **Environment variables (advanced)** and add:

| Variable name | Value | Environment |
|---|---|---|
| `VITE_BACKEND_BASE_URL` | `https://your-backend-api.com` | Production |
| `VITE_BACKEND_BASE_URL` | `https://your-staging-api.com` | Preview |
| `NODE_VERSION` | `18` | Production + Preview |

> ⚠️ Variables prefixed with `VITE_` are embedded into the JavaScript bundle at build time.
> They are **visible in the browser** — never store secrets here.

### Step 5 — Deploy

Click **Save and Deploy**. Cloudflare will:

1. Clone your repository
2. Install dependencies (`npm install`)
3. Run the build (`npm run build`)
4. Deploy the `dist/` folder to the global CDN

Your app will be live at:
```
https://<project-name>.pages.dev
```

### Step 6 — Set the Mini App URL in BotFather

Once deployed, update your Telegram bot:

1. Open [@BotFather](https://t.me/BotFather)
2. Send `/mybots` → select your bot
3. **Bot Settings** → **Configure Mini App** → **Edit Mini App URL**
4. Set it to your Cloudflare Pages URL: `https://saleor-tma-frontend.pages.dev`

---

## Option B — Wrangler CLI

Use the Wrangler CLI for deployments from your local machine or in custom CI scripts.

### Install Wrangler

```bash
npm install -g wrangler
```

### Authenticate

```bash
wrangler login
```

This opens a browser window. Log in with your Cloudflare account.

### Build Locally

```bash
# Create .env.local with your backend URL first
echo "VITE_BACKEND_BASE_URL=https://your-backend-api.com" > .env.local

npm run build
```

### Deploy

```bash
# First deployment — creates the project
wrangler pages deploy dist \
  --project-name=saleor-tma-frontend \
  --branch=main

# Subsequent deployments
wrangler pages deploy dist --project-name=saleor-tma-frontend
```

### Set Environment Variables via CLI

```bash
# Set a production variable
wrangler pages secret put VITE_BACKEND_BASE_URL --project-name=saleor-tma-frontend
# You'll be prompted to enter the value
```

> **Note:** Wrangler `secret put` is designed for runtime secrets. For build-time Vite
> variables, set them in the Cloudflare Dashboard under **Settings → Environment variables**
> instead, or pass them via the build environment before running `npm run build`.

### Check Deployment Status

```bash
wrangler pages deployment list --project-name=saleor-tma-frontend
```

---

## Option C — Direct Upload (No CLI)

The quickest way to deploy without any CI/CD setup.

### Step 1 — Build Locally

```bash
cp .env.example .env.local
# Edit .env.local with your backend URL
npm install
npm run build
```

### Step 2 — Upload via Dashboard

1. Go to [Cloudflare Dashboard](https://dash.cloudflare.com/) → **Workers & Pages**
2. Click **Create** → **Pages** tab
3. Click **Upload assets** (the "Direct Upload" option)
4. Enter a project name (e.g. `saleor-tma-frontend`)
5. Drag and drop the entire `dist/` folder (or click to browse)
6. Click **Deploy site**

Your app is live immediately — no Git connection, no CI/CD.

### Updating with Direct Upload

To push a new version:

1. Re-run `npm run build`
2. Go to your project in the Cloudflare Dashboard
3. Click **Create new deployment**
4. Upload the new `dist/` folder

---

## Environment Variables

### How Vite Build-Time Variables Work

Vite replaces `import.meta.env.VITE_*` references **at build time**, not runtime. The values are baked into the JavaScript bundle.

```
Build step:   VITE_BACKEND_BASE_URL=https://api.example.com  →  npm run build
Output:       dist/assets/index-abc123.js  (contains "https://api.example.com" literally)
```

### Setting Variables in Cloudflare Pages Dashboard

1. Open your Pages project
2. Go to **Settings** → **Environment variables**
3. Click **Add variable**
4. Set for **Production** and/or **Preview** environments separately

| Variable | Required | Example | Notes |
|---|---|---|---|
| `VITE_BACKEND_BASE_URL` | ✅ | `https://api.yourdomain.com` | No trailing slash |
| `NODE_VERSION` | Recommended | `18` | Ensures correct Node.js version |

### Per-Environment Configuration

Cloudflare Pages supports two environments:

- **Production** — triggered by pushes to your production branch (`main`)
- **Preview** — triggered by pushes to any other branch (PRs, feature branches)

You can set different backend URLs for each:

```
Production  →  VITE_BACKEND_BASE_URL = https://api.yourdomain.com
Preview     →  VITE_BACKEND_BASE_URL = https://staging-api.yourdomain.com
```

---

## SPA Routing — The `_redirects` File

React Router uses the browser History API. Without a redirect rule, navigating directly to a deep link like `https://your-app.pages.dev/cart` would return a **404** from Cloudflare (because there is no `cart/index.html` file in `dist/`).

The file `public/_redirects` contains:

```
/* /index.html 200
```

This instructs Cloudflare Pages to serve `index.html` for **every** request, letting React Router handle the routing client-side. Vite copies this file to `dist/_redirects` automatically during build.

**Verify it's present after building:**

```bash
npm run build
cat dist/_redirects
# Should output: /* /index.html 200
```

> Without this file, all routes except `/` will 404 for users who bookmark or share deep links.

---

## Custom Domain & SSL

Cloudflare Pages provides a free `*.pages.dev` subdomain. You can also attach your own domain.

### Add a Custom Domain

1. Open your Pages project → **Custom domains** tab
2. Click **Set up a custom domain**
3. Enter your domain (e.g. `app.yourdomain.com`)
4. If your domain's DNS is managed by Cloudflare, the CNAME record is added automatically
5. If using an external DNS provider, add the CNAME manually:
   ```
   Type:  CNAME
   Name:  app
   Value: saleor-tma-frontend.pages.dev
   ```
6. SSL is provisioned automatically by Cloudflare (Let's Encrypt) — usually within a few minutes

### Use Your Custom Domain for the Telegram Bot

Once your custom domain is active, update BotFather:

```
Mini App URL: https://app.yourdomain.com
```

---

## Preview Deployments

Every push to a **non-production branch** (or a pull request) automatically gets a unique preview URL:

```
https://<hash>.saleor-tma-frontend.pages.dev
```

This is great for:
- Testing changes before merging to `main`
- Sharing a working preview with teammates
- QA testing the Mini App against a staging backend

### Accessing Preview URLs

1. Go to your Pages project → **Deployments** tab
2. Find the deployment for your branch/commit
3. Click the deployment URL

### Preview-Specific Environment Variables

Set a different `VITE_BACKEND_BASE_URL` for the **Preview** environment in **Settings → Environment variables** to point at a staging backend.

---

## GitHub Actions CI/CD

For more control over your deployment pipeline, use GitHub Actions with Wrangler.

### Setup

1. Get your Cloudflare credentials:
   - `CLOUDFLARE_API_TOKEN` — Create at [Cloudflare Dashboard](https://dash.cloudflare.com/profile/api-tokens) with **Cloudflare Pages: Edit** permission
   - `CLOUDFLARE_ACCOUNT_ID` — Found in the right sidebar of your Cloudflare Dashboard

2. Add them as GitHub repository secrets:
   - Go to your repo → **Settings** → **Secrets and variables** → **Actions**
   - Add `CLOUDFLARE_API_TOKEN` and `CLOUDFLARE_ACCOUNT_ID`

3. Also add your backend URL as a secret:
   - Add `VITE_BACKEND_BASE_URL`

### Workflow File

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy to Cloudflare Pages

on:
  push:
    branches:
      - main          # Production deployment
  pull_request:
    branches:
      - main          # Preview deployment for PRs

jobs:
  deploy:
    runs-on: ubuntu-latest
    name: Deploy
    permissions:
      contents: read
      deployments: write

    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '18'
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Type check
        run: npm run type-check

      - name: Build
        run: npm run build
        env:
          VITE_BACKEND_BASE_URL: ${{ secrets.VITE_BACKEND_BASE_URL }}

      - name: Deploy to Cloudflare Pages
        uses: cloudflare/wrangler-action@v3
        with:
          apiToken: ${{ secrets.CLOUDFLARE_API_TOKEN }}
          accountId: ${{ secrets.CLOUDFLARE_ACCOUNT_ID }}
          command: pages deploy dist --project-name=saleor-tma-frontend --branch=${{ github.ref_name }}
```

### What This Workflow Does

| Trigger | Branch | Result |
|---|---|---|
| Push to `main` | `main` | Production deployment at `*.pages.dev` |
| Pull request to `main` | `<pr-branch>` | Preview deployment at `<hash>.pages.dev` |

### Production vs Preview URLs

- **Production** (`main` branch): `https://saleor-tma-frontend.pages.dev`
- **Preview** (any other branch): `https://<hash>.saleor-tma-frontend.pages.dev`

---

## Build Configuration Reference

### `vite.config.ts`

```typescript
export default defineConfig({
  build: {
    outDir: "dist",        // Cloudflare Pages reads from here
    sourcemap: false,      // Disable sourcemaps in production
  },
});
```

### `public/_redirects`

```
/* /index.html 200
```

Required for React Router browser history mode. Copied to `dist/` automatically.

### Environment variables at build time

| Variable | Where to set |
|---|---|
| Local dev | `.env.local` (git-ignored) |
| Cloudflare Pages | Dashboard → Settings → Environment variables |
| GitHub Actions | Repository secrets |

### Node.js version

Cloudflare Pages defaults to an older Node.js version. Pin it explicitly:

- **Via environment variable**: Add `NODE_VERSION = 18` in **Settings → Environment variables**
- **Via `.nvmrc`** (alternative): Create a `.nvmrc` file in the repo root:
  ```
  18
  ```
- **Via `package.json` engines** (alternative):
  ```json
  "engines": { "node": ">=18" }
  ```

---

## Troubleshooting

### ❌ Build fails: `Cannot find module`

**Cause:** Dependencies not installed or wrong Node version.

**Fix:**
1. Confirm build command is `npm run build` (not `yarn` or `pnpm`)
2. Add `NODE_VERSION = 18` as an environment variable in the Pages dashboard
3. Check that `package.json` and `package-lock.json` are both committed

---

### ❌ All routes except `/` return 404

**Cause:** The `public/_redirects` file is missing or wasn't copied to `dist/`.

**Fix:**
1. Verify `public/_redirects` exists with content `/* /index.html 200`
2. Run `npm run build` and confirm `dist/_redirects` is present:
   ```bash
   cat dist/_redirects
   ```
3. If it's missing, Vite isn't copying public assets — check that `publicDir` in `vite.config.ts` is not overridden

---

### ❌ `VITE_BACKEND_BASE_URL` is undefined at runtime

**Cause:** The variable wasn't set before the build ran, so Vite replaced it with `undefined`.

**Fix:**
1. Go to **Settings → Environment variables** in the Cloudflare Pages dashboard
2. Add `VITE_BACKEND_BASE_URL` and **trigger a new deployment** (the old build won't be affected)
3. To verify, check the deployed JS bundle:
   ```bash
   grep -r "your-backend-api.com" dist/assets/
   ```

---

### ❌ Telegram rejects the Mini App URL (not HTTPS)

**Cause:** Telegram requires HTTPS for all Mini App URLs. The `*.pages.dev` domain is always HTTPS, but a misconfigured custom domain might not be.

**Fix:**
1. Ensure SSL is enabled on your custom domain (Cloudflare handles this automatically)
2. Wait a few minutes after adding the domain for SSL provisioning to complete
3. Test by opening `https://your-domain.com` in a browser — no certificate warning should appear

---

### ❌ API requests fail with CORS errors

**Cause:** The backend doesn't allow requests from your Cloudflare Pages domain.

**Fix:** Add your Pages domain to the backend's CORS allowed origins:

```
https://saleor-tma-frontend.pages.dev
https://app.yourdomain.com        # if using a custom domain
http://localhost:5173              # for local development
```

---

### ❌ White screen / app doesn't load in Telegram

**Cause:** JavaScript error during initialization, or the `telegram-web-app.js` script failed to load.

**Fix:**
1. Open the app in a **desktop browser** first to check for JS errors (F12 → Console)
2. Enable WebView debugging in Telegram:
   - **Android**: Settings → Advanced → Enable WebView Debug, then use `chrome://inspect`
   - **iOS**: Tap Settings icon 10 times rapidly to enable WebView inspection
3. Check that `index.html` includes the script tag:
   ```html
   <script src="https://telegram.org/js/telegram-web-app.js"></script>
   ```

---

### ❌ Build succeeds but changes don't appear

**Cause:** Browser or Cloudflare CDN cache.

**Fix:**
1. Hard refresh in browser: `Ctrl+Shift+R` (Windows/Linux) or `Cmd+Shift+R` (Mac)
2. Check the **Deployments** tab in your Pages project — ensure the latest commit was deployed
3. Cloudflare CDN cache is automatically purged on each deployment — no manual action needed

---

## Quick Reference

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

## Related Documentation

- [Cloudflare Pages Docs](https://developers.cloudflare.com/pages/)
- [Wrangler CLI Reference](https://developers.cloudflare.com/workers/wrangler/commands/#pages)
- [Cloudflare Pages — Build Configuration](https://developers.cloudflare.com/pages/configuration/build-configuration/)
- [Cloudflare Pages — Redirects](https://developers.cloudflare.com/pages/configuration/redirects/)
- [Cloudflare Pages — Custom Domains](https://developers.cloudflare.com/pages/configuration/custom-domains/)
- [Telegram Mini App Setup](../README.md#telegram-bot-setup)