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
        │  HTTPS  Telegram-Init-Data: <initData>
        ▼
Backend API (separate repo)   ← GraphQL API
        │
        ▼
Database / Business Logic
```

The frontend is **entirely static**. It:
1. Reads Telegram launch params via `window.Telegram.WebApp` (injected by the CDN script)
2. Forwards `initData` to the backend as a `Telegram-Init-Data: <initData>` header on every request
3. Manages cart state locally in Zustand (persisted to `localStorage`)
4. Communicates with the backend via GraphQL queries and mutations

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
│   ├── utils/
│   │   └── initData.ts     # Telegram init data utilities (mock generation, expiration check)
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
# For connecting to a remote backend (production/staging)
VITE_BACKEND_BASE_URL=https://your-backend-api.com

# For local development with a GraphQL server
# VITE_BACKEND_BASE_URL=http://localhost:4000/graphql
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
| `VITE_DEV_INIT_DATA` | No | URL-encoded Telegram init data string for local development. When not set, a mock init data with user ID 0 is automatically generated. Example: `auth_date=1700000000&user={"id":0}&hash=test` |

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

### Telegram Init Data

All API requests include the Telegram init data in the `X-Telegram-Init-Data` header. This data:

- **In Telegram**: Is automatically provided by `window.Telegram.WebApp.initData`
- **In browser/development**: Falls back to:
  1. The `VITE_DEV_INIT_DATA` environment variable (if set)
  2. Auto-generated mock data via `generateMockInitData()` from `src/utils/initData.ts`

The mock data uses:
- `auth_date` with the current timestamp
- A dummy `hash` value (valid for development only)
- User ID `0` with test user info

#### Development Mode Expiration Warning

When running outside Telegram (browser mode), the app checks if the init data's `auth_date` is older than 24 hours and logs a warning to the console. This helps identify stale test data during development.

#### API Header Format

```
X-Telegram-Init-Data: auth_date=1700000000&user={"id":0,"first_name":"Test"}&hash=test
```

The init data is passed URL-encoded, exactly as received from Telegram. The backend is responsible for validating the hash and checking the auth date.

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

The frontend communicates with a GraphQL API at `VITE_BACKEND_BASE_URL`. All requests include:

```
Telegram-Init-Data: <Telegram initData string>
```

### Required GraphQL Operations

The frontend uses the following GraphQL queries and mutations:

- `GetRestaurants` - List all restaurants
- `GetCategories` - List categories for a restaurant
- `GetDishes` - List dishes in a category
- `GetCart` - Get current cart
- `AddToCart` - Add item to cart
- `UpdateCartItem` - Update cart item quantity
- `RemoveCartItem` - Remove item from cart
- `ClearCart` - Clear the entire cart
- `PlaceOrder` - Create an order

### PlaceOrder Input Structure

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

### PlaceOrder Response

**Success (2xx):**
```json
{ "orderId": "order_abc123", "status": "created", "estimatedDelivery": "2026-03-16T20:30:00Z" }
```

**Error (4xx/5xx):**
```json
{ "message": "Human-readable error message", "code": "OPTIONAL_CODE" }
```

### CORS

The backend must allow CORS from your Cloudflare Pages domain. For local dev, also allow `http://localhost:5173`.

---

## Local Testing with GraphQL

To test the frontend with a local GraphQL backend, follow these steps:

### 1. Set up a Local GraphQL Server

You'll need a GraphQL server that implements the schema expected by the frontend. The schema includes:

**Queries:**
- `restaurants`: Returns list of restaurants
- `categories(restaurantId: ID!)`: Returns categories for a restaurant
- `dishes(restaurantId: ID!, categoryId: ID!)`: Returns dishes in a category
- `cart`: Returns current cart or null

**Mutations:**
- `addToCart(input: AddToCartInput!)`: Adds item to cart
- `updateCartItem(input: UpdateCartItemInput!)`: Updates cart item quantity
- `removeCartItem(input: RemoveCartItemInput!)`: Removes item from cart
- `clearCart()`: Clears the entire cart
- `placeOrder(input: PlaceOrderInput!)`: Creates an order

#### Recommended GraphQL Server Libraries

For quick setup, consider these libraries:
- **Apollo Server**: `npm install @apollo/server graphql`
- **GraphQL Yoga**: `npm install graphql-yoga`
- **Express GraphQL**: `npm install express express-graphql graphql`

### 2. Configure Environment Variables

Create a `.env.local` file with your local GraphQL endpoint:

```env
# For local development with a GraphQL server
VITE_BACKEND_BASE_URL=http://localhost:4000/graphql

# Optional: Provide a specific initData string for testing
# Format: URL-encoded key=value pairs (auth_date, user JSON, hash)
# VITE_DEV_INIT_DATA=auth_date=1700000000&user=%7B%22id%22%3A0%2C%22first_name%22%3A%22Test%22%7D&hash=test
```

> **Note:** When `VITE_DEV_INIT_DATA` is not set, `mockEnv.ts` automatically generates
> valid mock init data using `generateMockInitData()` from `src/utils/initData.ts`.

### 3. Run the Development Server

```bash
npm install
npm run dev
```

The frontend will be available at `http://localhost:5173` and will communicate with your local GraphQL server.

### 4. Testing in Browser (Outside Telegram)

The app includes a mock Telegram environment in `src/mockEnv.ts` that allows testing outside Telegram:

- When `window.Telegram.WebApp` is not present, a lightweight mock is injected
- Telegram CSS theme variables are applied to `:root` for proper styling
- The mock provides basic WebApp functionality like `ready()`, `expand()`, etc.

This means you can test all functionality in a regular browser at `http://localhost:5173`.

#### Test User Pattern

For automated testing, you can use the test user pattern with ID 0:
- The mock environment in `src/mockEnv.ts` uses user ID 0 by default
- Your GraphQL backend should handle user ID 0 as a test/development account
- Optionally set `VITE_DEV_INIT_DATA` to simulate different users or test specific auth dates

### 5. Testing Inside Telegram (Optional)
 
For testing inside Telegram:
 
1. Expose your local dev server via ngrok:
    ```bash
    ngrok http --url your-name.ngrok-free.dev 5173
    ```
 
2. Set the Mini App URL in BotFather to `https://your-name.ngrok-free.dev`
 
3. Open the app in Telegram to test with the real WebView
 
> 💡 For more information about Telegram's test environment, see the [official documentation](https://core.telegram.org/bots/webapps#using-bots-in-the-test-environment).

### 6. Sample GraphQL Schema

Here's a minimal schema you can implement for testing:

```graphql
type Query {
  restaurants: [Restaurant!]!
  categories(restaurantId: ID!): [Category!]!
  dishes(restaurantId: ID!, categoryId: ID!): [Dish!]!
  cart: Cart
}

type Mutation {
  addToCart(input: AddToCartInput!): Cart!
  updateCartItem(input: UpdateCartItemInput!): Cart!
  removeCartItem(input: RemoveCartItemInput!): Cart!
  clearCart(): Cart
  placeOrder(input: PlaceOrderInput!): OrderSuccessResponse!
}

type Restaurant {
  id: ID!
  name: String!
  description: String
  imageUrl: String
  tags: [String!]
}

type Category {
  id: ID!
  restaurantId: ID!
  name: String!
  description: String
  imageUrl: String
}

type Dish {
  id: ID!
  restaurantId: ID!
  categoryId: ID!
  name: String!
  description: String!
  imageUrl: String
  price: Float!
  currency: String!
}

type Cart {
  id: ID!
  restaurantId: ID!
  restaurantName: String!
  items: [CartItem!]!
  updatedAt: String!
}

type CartItem {
  dishId: ID!
  quantity: Int!
  name: String!
  price: Float!
  currency: String!
  imageUrl: String
  description: String
}

type OrderSuccessResponse {
  orderId: String!
  status: String!
  estimatedDelivery: String
}

input AddToCartInput {
  dishId: ID!
  quantity: Int!
  name: String!
  price: Float!
  currency: String!
  restaurantId: ID!
}

input UpdateCartItemInput {
  dishId: ID!
  quantity: Int!
}

input RemoveCartItemInput {
  dishId: ID!
}

input PlaceOrderInput {
  restaurantId: ID!
  items: [OrderItemInput!]!
  deliveryLocation: LocationInput
  googleMapsUrl: String
  comment: String
}

input OrderItemInput {
  dishId: ID!
  quantity: Int!
}

input LocationInput {
  lat: Float!
  lng: Float!
}
```

This setup allows you to develop and test the frontend locally with a GraphQL backend before deploying to production.

### 7. Environment Variable Handling

The frontend automatically handles environment variables:
- In development (`npm run dev`), it loads variables from `.env.local`
- In preview builds, it uses variables from `.env.local` or system environment
- In production builds, variables are baked into the bundle at build time

Never commit `.env.local` to version control as it may contain sensitive information.

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