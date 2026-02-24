# 🍽️ Food Order — Telegram Mini App

> 🤖 **AI agents:** see [`AGENTS.md`](AGENTS.md) for setup commands, coding conventions, and project-specific rules.

A fully-featured **Telegram Mini App** for food ordering from restaurants. Built with React + TypeScript, styled with Tailwind CSS, and deployed as a static site on **Cloudflare Pages**.

---

## Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Architecture](#architecture)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [Development](#development)
- [Deploy to Cloudflare Pages](#deploy-to-cloudflare-pages)
- [Backend Integration](#backend-integration)
- [Telegram Bot Setup](#telegram-bot-setup)
- [Design Principles](#design-principles)
- [AI Agent Instructions](#ai-agent-instructions)

---

## Features

- **Restaurant listing** with search/filter on the main page
- **Category browsing** per restaurant
- **Dish listing** with name, description, image, and price
- **Single-restaurant cart** with localStorage persistence across reloads
- **Cart reset flow** — switching restaurants triggers a confirmation dialog
- **Checkout** with two delivery location options:
  - 📍 Browser/device geolocation (GPS)
  - 🗺️ Google Maps link (paste from the Maps app)
- **Order comment** field (optional)
- **Order success screen** with order ID
- **Telegram-native UX**: BackButton sync, haptic feedback, theme variable support
- **Dark/light mode** — automatically respects the user's Telegram theme
- **Mobile-first** responsive design with safe area insets for notched devices

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | [React 18](https://react.dev/) + [TypeScript](https://www.typescriptlang.org/) |
| Build Tool | [Vite 4](https://vitejs.dev/) |
| Styling | [Tailwind CSS 3](https://tailwindcss.com/) |
| Routing | [React Router v6](https://reactrouter.com/) |
| State | [Zustand](https://github.com/pmndrs/zustand) (cart, persisted to localStorage) |
| Data Fetching | [TanStack Query v5](https://tanstack.com/query) |
| TMA Integration | Vanilla `window.Telegram.WebApp` (loaded via CDN script in `index.html`) |
| Deployment | [Cloudflare Pages](https://pages.cloudflare.com/) |

---

## Architecture

```
Telegram Client (WebView)
        │
        ▼
  Frontend (this repo)          ← Static SPA on Cloudflare Pages
  React + Vite + Tailwind
        │
        │  HTTPS  Authorization: tma <initData>
        ▼
  Backend API (separate repo)   ← REST API
        │
        ▼
  Database / Business Logic
```

The frontend is **entirely static**. It:
1. Reads Telegram launch params via `window.Telegram.WebApp` (injected by the CDN script)
2. Forwards `initData` to the backend as an `Authorization: tma <initData>` header on every request
3. Manages cart state locally in Zustand (persisted to `localStorage`)
4. Submits orders via `POST /orders` to the configured backend

---

## Project Structure

```
saleor-tma-frontend/
├── AGENTS.md               # AI agent instructions (setup, conventions, gotchas)
├── docs/
│   └── DEPLOY.md           # Full Cloudflare Pages deployment guide
├── public/
│   ├── _redirects          # Cloudflare Pages SPA redirect rule
│   └── favicon.svg
├── src/
│   ├── api/
│   │   └── index.ts        # API client — all fetch calls, auth headers
│   ├── components/
│   │   ├── CartBadge.tsx
│   │   ├── CartResetConfirmModal.tsx
│   │   ├── DishCard.tsx
│   │   ├── EmptyState.tsx
│   │   ├── ErrorState.tsx
│   │   ├── LoadingSpinner.tsx
│   │   ├── PageHeader.tsx
│   │   ├── QuantityStepper.tsx
│   │   └── RestaurantCard.tsx
│   ├── pages/
│   │   ├── RestaurantsPage.tsx   # / — main page
│   │   ├── CategoriesPage.tsx    # /restaurants/:id
│   │   ├── DishesPage.tsx        # /restaurants/:id/categories/:id
│   │   ├── CartPage.tsx          # /cart
│   │   ├── CheckoutPage.tsx      # /checkout
│   │   └── OrderSuccessPage.tsx  # /order-success
│   ├── store/
│   │   └── cartStore.ts    # Zustand cart store with localStorage persistence
│   ├── types/
│   │   └── index.ts        # TypeScript interfaces (Restaurant, Dish, Cart…)
│   ├── mockEnv.ts          # TMA mock environment (works in browser + Telegram)
│   ├── App.tsx             # React Router setup + Telegram BackButton sync
│   ├── main.tsx            # App entry point
│   └── index.css           # Tailwind directives + global TG theme CSS vars
├── .env.example
├── index.html
├── tailwind.config.js
├── tsconfig.json
├── vite.config.ts
└── README.md
```

---

## Getting Started

### Prerequisites

- Node.js 18+
- npm 9+

### Install dependencies

```bash
npm install
```

### Configure environment

```bash
cp .env.example .env.local
```

Edit `.env.local`:

```env
VITE_BACKEND_BASE_URL=https://your-backend-api.com
```

### Run locally

```bash
npm run dev
```

The app runs at `http://localhost:5173`.

> **Note:** To test inside Telegram you need an HTTPS URL. Use [ngrok](https://ngrok.com/) with a free static domain:
>
> ```bash
> ngrok http --url your-name.ngrok-free.dev 5173
> ```
>
> Then set the Mini App URL in BotFather to `https://your-name.ngrok-free.dev`.

### Build for production

```bash
npm run build
```

Output is in `dist/`.

---

## Environment Variables

All Vite env variables must be prefixed with `VITE_` to be available in the browser. They are **baked into the bundle at build time** — never store secrets here.

| Variable | Required | Description |
|---|---|---|
| `VITE_BACKEND_BASE_URL` | ✅ Yes | Base URL of the backend API (no trailing slash). Example: `https://api.example.com` |

Set these in the Cloudflare Pages dashboard under **Settings → Environment variables**. See the [deployment guide](docs/DEPLOY.md#environment-variables) for full details.

---

## Development

### Type checking

```bash
npm run type-check
```

### Testing outside Telegram

The app uses a vanilla mock pattern in `src/mockEnv.ts`. When `window.Telegram.WebApp`
is not present (i.e., not running inside Telegram), a lightweight mock object is injected
and the Telegram CSS theme variables are applied to `:root`:

```typescript
if (!window.Telegram?.WebApp) {
  // inject mock WebApp object + apply CSS theme variables
}
```

This means the app works in:
- ✅ Real Telegram WebView — uses real `window.Telegram.WebApp` from CDN script
- ✅ Local browser (`localhost`) — uses the mock from `mockEnv.ts`
- ✅ Cloudflare Pages preview URLs — uses the mock from `mockEnv.ts`

No external TMA SDK packages are required. The `telegram-web-app.js` script is loaded
synchronously in `index.html` before the React app boots, ensuring the real WebApp object
is always available in Telegram.

---

## Deploy to Cloudflare Pages

Cloudflare Pages serves the static `dist/` output with global CDN and automatic HTTPS — which is required by Telegram.

📄 **[Full deployment guide → docs/DEPLOY.md](docs/DEPLOY.md)**

The guide covers:
- [Option A — Git Integration (Recommended)](docs/DEPLOY.md#option-a--git-integration-recommended)
- [Option B — Wrangler CLI](docs/DEPLOY.md#option-b--wrangler-cli)
- [Option C — Direct Upload (No CLI)](docs/DEPLOY.md#option-c--direct-upload-no-cli)
- [Environment Variables](docs/DEPLOY.md#environment-variables)
- [SPA Routing — The `_redirects` file](docs/DEPLOY.md#spa-routing--the-_redirects-file)
- [Custom Domain & SSL](docs/DEPLOY.md#custom-domain--ssl)
- [Preview Deployments](docs/DEPLOY.md#preview-deployments)
- [GitHub Actions CI/CD](docs/DEPLOY.md#github-actions-cicd)
- [Troubleshooting](docs/DEPLOY.md#troubleshooting)

### Quick start (3 steps)

```bash
# 1. Build
npm run build

# 2. Deploy via Wrangler CLI
npx wrangler pages deploy dist --project-name=saleor-tma-frontend

# 3. Set the Mini App URL in BotFather to your *.pages.dev domain
```

> The `public/_redirects` file (`/* /index.html 200`) is automatically included in the build
> and is required for React Router to work correctly on Cloudflare Pages.

---

## Backend Integration

The frontend expects a REST API at `VITE_BACKEND_BASE_URL`. All requests include:

```
Authorization: tma <Telegram initData string>
```

### Required Endpoints

| Method | Path | Description |
|---|---|---|
| `GET` | `/restaurants` | List all restaurants |
| `GET` | `/restaurants/:id/categories` | List categories for a restaurant |
| `GET` | `/restaurants/:id/categories/:id/dishes` | List dishes in a category |
| `POST` | `/orders` | Create an order |

### POST /orders — Request Body

**With geolocation:**
```json
{
  "restaurantId": "rest_123",
  "items": [
    { "dishId": "dish_456", "quantity": 2 },
    { "dishId": "dish_789", "quantity": 1 }
  ],
  "deliveryLocation": { "lat": 48.8566, "lng": 2.3522 },
  "googleMapsUrl": null,
  "comment": "Extra napkins please"
}
```

**With Google Maps link:**
```json
{
  "restaurantId": "rest_123",
  "items": [{ "dishId": "dish_456", "quantity": 1 }],
  "deliveryLocation": null,
  "googleMapsUrl": "https://maps.google.com/?q=48.8566,2.3522",
  "comment": null
}
```

### POST /orders — Response

**Success (2xx):**
```json
{ "orderId": "order_abc123", "status": "created" }
```

**Error (4xx/5xx):**
```json
{ "message": "Human-readable error message", "code": "OPTIONAL_CODE" }
```

### CORS

The backend must allow CORS from your Cloudflare Pages domain. For local dev, also allow `http://localhost:5173`.

---

## Telegram Bot Setup

1. Open [@BotFather](https://t.me/BotFather) in Telegram
2. Send `/newbot` and follow the prompts
3. Save the bot token
4. Send `/mybots` → select your bot → **Bot Settings** → **Configure Mini App** → **Enable**
5. Set the Mini App URL to your Cloudflare Pages URL:
   - For production: `https://<project-name>.pages.dev`
   - For development with ngrok: `https://your-name.ngrok-free.dev`
6. (Optional) Send `/setmenubutton` to add a persistent menu button that opens the app

---

## Design Principles

### Telegram Theme Integration

The app uses Telegram CSS variables (`var(--tg-theme-*)`) for all colors. This means it automatically adapts to the user's Telegram theme (light, dark, or custom):

```css
background-color: var(--tg-theme-bg-color);
color: var(--tg-theme-text-color);
```

Tailwind is extended with `tg-*` color aliases that map directly to these variables.

### Safe Areas

All pages respect device safe area insets for notched phones (iPhone, etc.):

```css
padding-bottom: calc(80px + env(safe-area-inset-bottom));
```

### Single-Restaurant Cart Rule

The cart can only hold items from one restaurant at a time. If a user tries to select a different restaurant while the cart has items:

1. A confirmation bottom-sheet appears: *"Your cart will be cleared and a new cart will be created for [Restaurant Name]."*
2. **Cancel** — keeps the current cart and stays on the page
3. **Continue** — clears the cart and navigates to the new restaurant

### Observability

Key events are logged to the console (easily replaced with a remote logging service):

- `restaurant_selected`
- `dish_added`
- `dish_removed`
- `cart_cleared_due_to_switch`
- `checkout_submit`
- `checkout_success`
- `checkout_failure`

---

## AI Agent Instructions

This project ships an [`AGENTS.md`](AGENTS.md) file at the repo root — a dedicated, machine-readable guide for AI coding agents (Claude Code, Cursor, Copilot, Codex, Jules, Amp, Aider, and others).

It covers:
- Exact dependency versions and critical upgrade warnings (Zustand v3, Vite 4)
- Coding conventions: component structure, naming, quote style, section dividers
- Architecture patterns: Telegram WebApp access, theming rules, cart store usage
- Telegram-specific gotchas: `mockEnv.ts` import order, BackButton sync, haptic feedback
- What **not** to do — common mistakes to avoid
- Domain model and route reference

```bash
# Agents: read this file before making any changes
cat AGENTS.md
```

---

## License

MIT