# Food Order — Telegram Mini App (AGENTS.md)

> AI coding agent instructions for the `saleor-tma-frontend` project.
> This file works with Claude Code, Cursor, Copilot, Codex, Jules, Amp, Aider, and all AGENTS.md-compatible tools.

---

## Project Overview

A **Telegram Mini App (TMA)** for food ordering. Users browse restaurants → categories → dishes, build a cart, and check out with GPS or a Google Maps link. The app is a **pure static SPA** deployed on Cloudflare Pages; all business logic lives in a separate backend.

Key characteristics:
- **Frontend-only** — no server-side rendering, no API routes in this repo
- **Telegram WebView first** — must work inside Telegram on iOS, Android, and Desktop
- **Single-restaurant cart** — a hard business rule enforced at the store level
- **Vanilla Telegram integration** — uses `window.Telegram.WebApp` from a CDN `<script>` tag, not an npm SDK

---

## Development Setup

```bash
# Install dependencies
npm install

# Start dev server (http://localhost:5173)
npm run dev

# Type-check (no emit)
npm run type-check

# Production build — outputs to dist/
npm run build

# Preview production build locally
npm run preview
```

> There is no test runner configured yet. When adding tests, use **Vitest** (compatible with Vite 4).

### Environment

```bash
cp .env.example .env.local
# Then set:
# VITE_BACKEND_BASE_URL=https://your-backend-api.com
```

All `VITE_*` variables are baked into the bundle at build time. **Never store secrets here.**

### Local Telegram testing

Telegram requires HTTPS. Use ngrok with a free static domain:

```bash
ngrok http --url your-name.ngrok-free.dev 5173
# Set Mini App URL in BotFather to: https://your-name.ngrok-free.dev
```

---

## Tech Stack & Exact Versions

| Role | Package | Version | Notes |
|---|---|---|---|
| UI framework | `react` + `react-dom` | 18.3.1 | Functional components + hooks only |
| Language | TypeScript | 5.8.3 | Strict mode via `tsconfig.json` |
| Build tool | `vite` | 4.4.11 | **NOT v5** — `tinyglobby` v5 deps unavailable offline |
| React plugin | `@vitejs/plugin-react` | 3.1.0 | Babel-based, compatible with Vite 4 |
| Styling | `tailwindcss` | 3.4.17 | Extended with `tg-*` color aliases |
| CSS processor | `postcss` + `autoprefixer` | 8.5.6 / 10.4.21 | |
| Routing | `react-router-dom` | 6.3.0 | `BrowserRouter` — **not HashRouter** |
| State | `zustand` | 3.7.2 | **v3 API** (`import create from 'zustand'`) — NOT v4 |
| Data fetching | `@tanstack/react-query` | 5.90.20 | QueryClient in `main.tsx` |
| TMA integration | `window.Telegram.WebApp` | CDN | No npm SDK — loaded in `index.html` |
| Deployment | Cloudflare Pages | — | Static SPA with `_redirects` |

### Critical version warnings

- **Zustand v3** uses `import create from 'zustand'` (default import), not `import { create } from 'zustand'`. The v4 API with `persist` middleware is NOT used here — persistence is handled manually via `localStorage`.
- **Vite 4**, not Vite 5. Do not upgrade to Vite 5 without resolving the `tinyglobby` dependency issue.
- **React Router 6.3.0** — some newer v6 APIs (like `<Outlet>` lazy routes) may not be available. Stick to `<Routes>` + `<Route>` patterns already established.

---

## Project Structure

```
saleor-tma-frontend/
├── docs/
│   └── DEPLOY.md           # Full Cloudflare Pages deployment guide
├── public/
│   ├── _redirects          # CRITICAL — enables SPA routing on CF Pages
│   └── favicon.svg
├── src/
│   ├── api/
│   │   └── index.ts        # All fetch calls + auth headers + Window type augmentation
│   ├── components/         # Reusable UI — one component per file, named export + default export
│   │   ├── CartBadge.tsx
│   │   ├── CartResetConfirmModal.tsx
│   │   ├── DishCard.tsx
│   │   ├── EmptyState.tsx
│   │   ├── ErrorState.tsx
│   │   ├── LoadingSpinner.tsx
│   │   ├── PageHeader.tsx
│   │   ├── QuantityStepper.tsx
│   │   └── RestaurantCard.tsx
│   ├── pages/              # One file per route, named after the route
│   │   ├── RestaurantsPage.tsx   # /
│   │   ├── CategoriesPage.tsx    # /restaurants/:restaurantId
│   │   ├── DishesPage.tsx        # /restaurants/:restaurantId/categories/:categoryId
│   │   ├── CartPage.tsx          # /cart
│   │   ├── CheckoutPage.tsx      # /checkout
│   │   └── OrderSuccessPage.tsx  # /order-success
│   ├── store/
│   │   └── cartStore.ts    # Zustand v3 store — single source of truth for cart
│   ├── types/
│   │   └── index.ts        # All TypeScript interfaces — domain + cart + API + UI state
│   ├── mockEnv.ts          # Telegram mock for browser (imported FIRST in main.tsx)
│   ├── App.tsx             # BrowserRouter + Routes + TelegramBackButtonSync
│   ├── main.tsx            # Entry: import mockEnv → import index.css → init → render
│   └── index.css           # Tailwind directives + TG theme CSS vars + utility classes
├── .env.example
├── index.html              # Has <script src="telegram-web-app.js"> — do not remove
├── tailwind.config.js
├── tsconfig.json
├── tsconfig.node.json
└── vite.config.ts
```

---

## Code Style

### TypeScript

- Strict mode is enabled in `tsconfig.json` — do not disable
- Use `type` for imports of types only: `import type { Foo } from './types'`
- Component props are typed as a local `interface`, never inline
- All components are `FC` (from React): `const MyComponent: FC<Props> = ({ ... }) => { ... }`
- Avoid `any`. Use `unknown` when type is genuinely unknown, then narrow it
- The `Window` interface is augmented in `src/api/index.ts` — extend it there when adding new WebApp methods

### Components

- One component per file
- Default export at the bottom of the file
- Props interface declared at the top of the file, above the component
- No class components
- No `React.FC` — use `FC` imported from `'react'`

```typescript
// ✅ Correct
import type { FC } from 'react';

interface MyComponentProps {
  title: string;
  onAction: () => void;
}

const MyComponent: FC<MyComponentProps> = ({ title, onAction }) => {
  return <div>{title}</div>;
};

export default MyComponent;
```

### Naming conventions

| Thing | Convention | Example |
|---|---|---|
| Components | PascalCase | `DishCard.tsx` |
| Pages | PascalCase + `Page` suffix | `CheckoutPage.tsx` |
| Hooks | `use` prefix camelCase | `useCartStore` |
| Functions | camelCase | `handleAddDish` |
| Constants | SCREAMING_SNAKE_CASE | `CART_STORAGE_KEY` |
| CSS class helpers | kebab-case | `tg-btn`, `tg-card` |
| Event handlers | `handle` prefix | `handleSelectRestaurant` |
| Query keys | array literal | `['restaurants']`, `['dishes', restaurantId, categoryId]` |

### Formatting

- Double quotes for JSX attribute strings and non-CSS strings: `"value"`
- Single quotes for CSS-in-JS style strings: `'var(--tg-theme-bg-color)'`
- Trailing commas in multiline objects/arrays
- Section dividers use the `// ─── Section Name ───` pattern (em dash + spaces)
- No semicolons are NOT enforced — semicolons are used throughout; keep them

---

## Architecture Patterns

### Telegram WebApp access

Always access the WebApp through the optional chain pattern:

```typescript
// ✅ Correct — safe in both Telegram and browser
window.Telegram?.WebApp?.HapticFeedback?.impactOccurred('light');
window.Telegram?.WebApp?.BackButton?.show();

// ❌ Wrong — crashes in browser if WebApp is undefined
window.Telegram.WebApp.ready();
```

### Theming — NEVER hardcode colors

All colors must use Telegram CSS variables. Use inline `style` props or the `tg-*` Tailwind aliases:

```tsx
// ✅ Correct — adapts to Telegram dark/light/custom theme
<div style={{ backgroundColor: 'var(--tg-theme-secondary-bg-color)' }}>
<div className="bg-tg-secondary-bg">    // via Tailwind alias

// ❌ Wrong — breaks in dark mode
<div style={{ backgroundColor: '#f0f0f0' }}>
<div className="bg-gray-100">
```

Available CSS variables (all defined in `src/index.css` with light-mode defaults):

```
--tg-theme-bg-color
--tg-theme-text-color
--tg-theme-hint-color
--tg-theme-link-color
--tg-theme-button-color
--tg-theme-button-text-color
--tg-theme-secondary-bg-color
--tg-theme-header-bg-color
--tg-theme-bottom-bar-bg-color
--tg-theme-accent-text-color
--tg-theme-section-bg-color
--tg-theme-section-header-text-color
--tg-theme-subtitle-text-color
--tg-theme-destructive-text-color
```

### Safe areas — always add bottom padding

Telegram runs on notched devices. Any fixed bottom bar or scrollable content must account for safe areas:

```css
/* Fixed bottom bar */
padding-bottom: calc(12px + env(safe-area-inset-bottom));

/* Scrollable content that has a fixed bar below it */
padding-bottom: calc(80px + env(safe-area-inset-bottom));
```

### API calls — always go through `src/api/index.ts`

Add all new backend endpoints as named async functions in `src/api/index.ts`. Never use `fetch` directly in components or pages.

```typescript
// ✅ Correct — new endpoint in api/index.ts
export async function fetchSpecials(restaurantId: string): Promise<Special[]> {
  return request<Special[]>(`/restaurants/${restaurantId}/specials`);
}

// ❌ Wrong — fetch in a component
const res = await fetch(`${BASE_URL}/restaurants/${id}/specials`);
```

### Data fetching — always use TanStack Query

All backend reads use `useQuery`. All backend mutations use `useMutation` (or inline `async` handlers with loading state).

```typescript
// ✅ Standard query pattern used in every page
const { data, isLoading, isError, error, refetch } = useQuery({
  queryKey: ['resource', id],
  queryFn: () => fetchResource(id),
  enabled: !!id,
});
```

Query key conventions:
- `['restaurants']` — all restaurants
- `['categories', restaurantId]` — categories for a restaurant
- `['dishes', restaurantId, categoryId]` — dishes in a category

### Cart store — Zustand v3

The cart store is the only global state. All other state is component-local.

```typescript
// ✅ Correct — subscribe to exactly what you need
const addItem = useCartStore((s) => s.addItem);
const totalItems = useCartStore((s) => s.totalItems());

// ❌ Wrong — subscribes to entire store, causes unnecessary re-renders
const store = useCartStore();
```

**Critical cart rules (never bypass):**
1. `addItem` silently returns and logs a warning if `dish.restaurantId !== cart.restaurantId`. The UI must call `clearCart()` first after user confirmation.
2. `decrementItem` auto-removes the item when `quantity` hits 0 — do not call `removeItem` separately.
3. Always call `saveCart(newCart)` before `set({ cart: newCart })` to keep localStorage in sync.
4. `clearCart()` handles both `saveCart(null)` and `set({ cart: null })` — do not duplicate.

### Page layout structure

Every page follows this structure:

```tsx
const MyPage: FC = () => {
  // 1. hooks
  // 2. loading state → return skeleton
  // 3. error state → return ErrorState
  // 4. empty state → return EmptyState
  // 5. main render

  return (
    <div className="page">
      <PageHeader title="..." showBack showCart />
      <div className="page-content">
        {/* content */}
      </div>
      {/* optional fixed bottom bar */}
      <div className="bottom-bar">
        <button className="tg-btn">...</button>
      </div>
    </div>
  );
};
```

Key CSS utility classes (defined in `src/index.css`):

| Class | Purpose |
|---|---|
| `page` | Flex column, full height, bg-color |
| `page-content` | Flex-1, overflow-y auto, padding, bottom clearance for fixed bar |
| `bottom-bar` | Fixed bottom, safe area aware, border-top |
| `tg-btn` | Primary button — uses `--tg-theme-button-color` |
| `tg-btn-secondary` | Secondary button — uses `--tg-theme-secondary-bg-color` |
| `tg-btn-destructive` | Destructive button — uses `--tg-theme-destructive-text-color` |
| `tg-card` | Card with secondary-bg and border-radius |
| `skeleton` | Shimmer loading placeholder |
| `modal-overlay` | Full-screen overlay for bottom sheets |
| `modal-sheet` | Bottom-sheet container with slide-up animation |

### Broken image fallback pattern

Every image must have a fallback. Use the established DOM-manipulation pattern (not state):

```tsx
<img
  src={item.imageUrl}
  alt={item.name}
  className="w-full h-full object-cover"
  onError={(e) => {
    const target = e.currentTarget;
    target.style.display = 'none';
    const placeholder = target.nextElementSibling as HTMLElement | null;
    if (placeholder) placeholder.style.display = 'flex';
  }}
/>
{/* Fallback — always render, hidden by default */}
<div className="... items-center justify-center text-3xl" style={{ display: 'none' }}>
  🍴
</div>
```

### Observability — log key events

Log these events to `console.log` at the point they occur. Do not remove existing logs. Add new ones following the same pattern:

```typescript
console.log('restaurant_selected', { restaurantId, name });
console.log('dish_added', { dishId, name });
console.log('dish_removed', { dishId });
console.log('cart_cleared_due_to_switch');
console.log('checkout_submit', { restaurantId, itemCount });
console.log('checkout_success', { orderId });
console.log('checkout_failure', { error });
```

---

## Telegram-Specific Rules

### The `mockEnv.ts` import order is sacred

`src/main.tsx` must import `mockEnv` as the **first** import, before `index.css` and before anything that touches `window.Telegram`:

```typescript
// main.tsx — order matters
import "./mockEnv";   // 1st — sets up window.Telegram.WebApp if missing
import "./index.css"; // 2nd
import ...            // everything else
```

Never gate the mock on `import.meta.env.DEV`. The current `if (!window.Telegram?.WebApp)` check already handles both environments correctly.

### BackButton sync

`TelegramBackButtonSync` in `App.tsx` manages the native Telegram back button. It:
- Hides the button on `"/"`, shows it everywhere else
- Calls `navigate(-1)` on click
- Cleans up the listener in the `useEffect` return

If you add a page that needs **custom back behavior** (e.g., the cart-reset confirmation), override it with `onBack` prop on `<PageHeader>` rather than modifying `TelegramBackButtonSync`.

### Haptic feedback

Add haptic feedback to user actions where appropriate:

```typescript
// Button taps / item added
window.Telegram?.WebApp?.HapticFeedback?.impactOccurred('light');

// Quantity stepper
window.Telegram?.WebApp?.HapticFeedback?.selectionChanged();

// Success / failure
window.Telegram?.WebApp?.HapticFeedback?.notificationOccurred('success');
window.Telegram?.WebApp?.HapticFeedback?.notificationOccurred('error');
```

### Single-restaurant cart — the confirmation flow

This is a non-negotiable business rule. The full flow:

1. User selects a restaurant on `RestaurantsPage`
2. `isDifferentRestaurant(restaurant.id)` returns `true`
3. Show `<CartResetConfirmModal>` (bottom sheet, not a browser alert)
4. **Cancel** → `setPendingRestaurant(null)` → nothing changes
5. **Continue** → `clearCart()` → `navigate('/restaurants/:id')` → `setPendingRestaurant(null)`

Never call `clearCart()` without explicit user confirmation.

---

## Adding New Features

### New page

1. Create `src/pages/NewPage.tsx` following the standard page structure
2. Add the route in `src/App.tsx` inside `<Routes>`
3. Use `<PageHeader showBack />` (and `showCart` if applicable)
4. Handle loading, error, and empty states

### New component

1. Create `src/components/NewComponent.tsx`
2. Define a props interface above the component
3. Export as default at the bottom
4. Use `var(--tg-theme-*)` for all colors — no hardcoded values

### New API endpoint

1. Add the typed async function to `src/api/index.ts` using the `request<T>()` helper
2. Add the corresponding TypeScript types to `src/types/index.ts`
3. Use `useQuery` in the page/component that needs the data

### New type

All shared types go in `src/types/index.ts`, organized into sections:
- Domain Entities (Restaurant, Category, Dish)
- Cart (Cart, CartItem)
- Order (DeliveryLocation, CreateOrderPayload, etc.)
- UI State (loading states, form states)

---

## What NOT to Do

- **DON'T** use `window.Telegram.WebApp` without optional chaining (`?.`) — the mock might not cover every code path
- **DON'T** hardcode any color values (hex, rgb, Tailwind gray-*, etc.) — always use `var(--tg-theme-*)`
- **DON'T** use `HashRouter` — the app uses `BrowserRouter`; `public/_redirects` handles CF Pages SPA routing
- **DON'T** add `console.log` debug statements that aren't observability events; remove them before committing
- **DON'T** add secrets or API keys to `.env.example` or any committed file
- **DON'T** call `clearCart()` without user confirmation via `CartResetConfirmModal`
- **DON'T** call `addItem()` cross-restaurant — check `isDifferentRestaurant()` first and show the modal
- **DON'T** upgrade `zustand` to v4+ without rewriting `cartStore.ts` (the API changed significantly)
- **DON'T** upgrade `vite` to v5 without verifying `tinyglobby` is resolvable in the install environment
- **DON'T** remove `import "./mockEnv"` from `main.tsx` — it's required for browser / preview URL testing
- **DON'T** use `@tma.js/sdk-react` or any TMA npm SDK — the vanilla CDN approach is intentional
- **DON'T** put global state outside `cartStore.ts` — use component-local state for everything else
- **DON'T** skip the broken-image fallback when adding new `<img>` elements

---

## Domain Model Quick Reference

```typescript
// Core entities (from src/types/index.ts)
Restaurant { id, name, description?, imageUrl?, tags? }
Category   { id, restaurantId, name, description?, imageUrl? }
Dish       { id, restaurantId, categoryId, name, description, imageUrl, price, currency }

// Cart (single-restaurant, localStorage persisted)
Cart     { restaurantId, restaurantName, items: CartItem[], updatedAt }
CartItem { dishId, quantity, name, price, currency, imageUrl?, description? }
// CartItem carries snapshot fields — decoupled from live API data

// Order submission
CreateOrderPayload {
  restaurantId,
  items: { dishId, quantity }[],
  deliveryLocation: { lat, lng } | null,
  googleMapsUrl: string | null,     // exactly one of these must be non-null
  comment: string | null
}
```

---

## Routes Reference

| Path | Component | Auth required |
|---|---|---|
| `/` | `RestaurantsPage` | No |
| `/restaurants/:restaurantId` | `CategoriesPage` | No |
| `/restaurants/:restaurantId/categories/:categoryId` | `DishesPage` | No |
| `/cart` | `CartPage` | No |
| `/checkout` | `CheckoutPage` | No |
| `/order-success` | `OrderSuccessPage` | No — reads state from `location.state.orderId` |
| `*` | `RestaurantsPage` | — (fallback) |

---

## Deployment Quick Reference

Full guide: [`docs/DEPLOY.md`](docs/DEPLOY.md)

```bash
# Build
npm run build        # outputs to dist/

# Deploy via Wrangler CLI
npx wrangler pages deploy dist --project-name=saleor-tma-frontend

# Or push to main branch — Cloudflare Pages auto-deploys via Git integration
```

Required environment variable in Cloudflare Pages dashboard:

```
VITE_BACKEND_BASE_URL = https://your-backend-api.com
NODE_VERSION          = 18
```

The file `public/_redirects` contains `/* /index.html 200` and is automatically copied to `dist/` during build. It is **required** — without it every route except `/` returns 404.

---

## Changelog

- 2025-06-02: Initial AGENTS.md created from codebase analysis