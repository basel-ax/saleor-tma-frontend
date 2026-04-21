# 🍽️ Food Order — Telegram Mini App
## Screen Specification for Designer Revision
**Format:** LLM-ready structured documentation

---

## 📐 Design System Foundation

### Theme Architecture
- **Adaptive theming** via Telegram CSS variables — automatically supports light, dark, and custom Telegram themes
- **No hardcoded colors** — all colors use `var(--tg-theme-*)` CSS variables
- **Mobile-first** — optimized for Telegram WebView on iOS/Android/Desktop

### Color Tokens (CSS Variables)
| Token | Light Default | Dark Default | Usage |
|---|---|---|---|
| `--tg-theme-bg-color` | `#ffffff` | `#1c1c1e` | Page backgrounds |
| `--tg-theme-text-color` | `#000000` | `#ffffff` | Primary text |
| `--tg-theme-hint-color` | `#8e8e93` | `#8e8e93` | Secondary text, icons |
| `--tg-theme-button-color` | `#34c759` | `#34c759` | Primary buttons, CTAs |
| `--tg-theme-button-text-color` | `#ffffff` | `#ffffff` | Button text |
| `--tg-theme-secondary-bg-color` | `#f2f2f7` | `#2c2c2e` | Cards, inputs, modals |
| `--tg-theme-destructive-text-color` | `#ff3b30` | `#ff453a` | Errors, destructive actions |

### Typography
| Style | Class | Font | Size | Weight |
|---|---|---|---|---|
| Page title | `text-xl font-bold` | System | 20px | 700 |
| Section label | `text-xs font-semibold uppercase tracking-wider` | System | 12px | 600 |
| Card title | `text-lg font-semibold` | System | 18px | 600 |
| Body text | `text-sm leading-snug` | System | 14px | 400 |
| Price large | `text-xl font-bold` | System | 20px | 700 |
| Badge count | `text-[11px] font-bold` | System | 11px | 700 |

### Spacing System
| Token | Value | Usage |
|---|---|---|
| Page padding | `px-4` (16px) | Screen edges |
| Card gap | `gap-3` (12px) | Between cards |
| Section spacing | `mb-4` (16px) | Between sections |
| Inner padding | `p-3` to `p-4` | Card internals |

### Border Radius
| Token | Class | Usage |
|---|---|---|
| Card | `rounded-tg` | Cards, images |
| Full | `rounded-full` | Buttons, badges |
| xl | `rounded-tg-lg` | Bottom sheets, modals |

### Shadow
| Token | Value | Usage |
|---|---|---|
| `shadow-tg` | `0 2px 8px rgba(0,0,0,0.08)` | Card hover |
| `shadow-tg-lg` | `0 4px 16px rgba(0,0,0,0.12)` | Card hover (hover state) |

### Safe Areas
- Fixed bottom bars: `padding-bottom: calc(12px + env(safe-area-inset-bottom))`
- Scrollable content with fixed bar: `padding-bottom: calc(80px + env(safe-area-inset-bottom))`

### Animation
| Class | Duration | Usage |
|---|---|---|
| `animate-slide-up` | 400ms | Elements entering from below |
| `animate-fade-in` | 300ms | Elements fading in |
| `animate-pulse-soft` | 2s | Decorative pulses |
| Active scale | 150ms | Button press feedback |

---

## 📱 Screen 01 — `/` — Restaurants Page (Home)
**Route:** `/`
**Purpose:** Browse restaurants, search/filter, access cart and settings

### Header (sticky, top-0)
| Element | Type | Position | Style |
|---|---|---|---|
| Page title (e.g., "Restaurants") | Text | Left, after back button area | `text-xl font-bold`, `color: var(--tg-theme-text-color)` |
| Language Switcher | Dropdown select | Right, after settings button | Border `rounded-tg`, bg `var(--tg-theme-secondary-bg-color)`, options: EN/RU |
| Settings button | Icon button (⚙️) | Right, before cart | 36x36px, `rounded-full`, bg `var(--tg-theme-secondary-bg-color)`, icon stroke `var(--tg-theme-text-color)` |
| Cart Badge | Icon button with badge | Far right | 40x40px, `rounded-full`, bg `var(--tg-theme-secondary-bg-color)`, icon stroke `var(--tg-theme-button-color)`, badge: 18x18px circle, bg `var(--tg-theme-button-color)`, text white, shows "99+" if >99 |

### Search Bar (sticky, below header, top-52px)
| Element | Type | Position | Style |
|---|---|---|---|
| Search input container | Input wrapper | Full width, below header | Height 48px, `rounded-xl`, bg `var(--tg-theme-secondary-bg-color)`, border same as bg, shadow `0 1px 3px rgba(0,0,0,0.08)` |
| Search icon | SVG | Left, inside input | 18x18px, stroke `var(--tg-theme-hint-color)` |
| Search input | Text input | Center, flex-1 | `bg-transparent`, `text-base`, outline none, placeholder color `var(--tg-theme-hint-color)` |
| Clear button | Icon button (×) | Right, appears when text entered | 24x24px, `rounded-full`, bg `var(--tg-theme-hint-color)`, text `var(--tg-theme-secondary-bg-color)` |

### Restaurant List (scrollable, `page-content`)
| Element | Type | Position | Style |
|---|---|---|---|
| Restaurant Card | Card (full width, vertical) | Stacked, gap 12px | `rounded-tg`, bg `var(--tg-theme-secondary-bg-color)`, shadow, hover shadow-lg, active scale-0.98 |
| → Card Image | Image | Top, full width | Height 176px (h-44), `object-cover`, fallback: SVG icon centered |
| → Card Name | Text | Below image, padding 16px | `text-lg font-semibold`, color `var(--tg-theme-text-color)` |
| → Card Description | Text | Below name | `text-sm leading-snug line-clamp-2`, color `var(--tg-theme-hint-color)` |
| → Tags Container | Flex wrap | Below description, gap 8px | Each tag: `px-3 py-1`, `text-xs font-medium rounded-full`, bg `var(--tg-theme-bg-color)`, border 1px `var(--tg-theme-accent-text-color)`, text `var(--tg-theme-accent-text-color)` |

### Empty State
| Element | Type | Style |
|---|---|---|
| Icon | Emoji (🔍 / 🏪) | 5xl, opacity 0.6 |
| Title | Text | `text-lg font-semibold`, color `var(--tg-theme-text-color)` |
| Description | Text | `text-sm`, color `var(--tg-theme-hint-color)`, max-width 280px |
| Action Button | Button | `tg-btn tg-btn-secondary` |

### Error State
| Element | Type | Style |
|---|---|---|
| Icon | Emoji (⚠️) | 5xl |
| Title | Text | `text-lg font-semibold`, color `var(--tg-theme-text-color)` |
| Message | Text | `text-sm`, color `var(--tg-theme-hint-color)` |
| Retry Button | Button | `tg-btn` |

### Loading State (Skeleton)
- 1 header skeleton + 1 search skeleton + 3 restaurant card skeletons
- Each skeleton: shimmer animation, bg `var(--tg-theme-secondary-bg-color)`

### Modals / Overlays

#### Cart Reset Confirmation Modal (Bottom Sheet)
| Element | Type | Position | Style |
|---|---|---|---|
| Overlay | Backdrop | Full screen | `fixed inset-0`, bg `rgba(0,0,0,0.5)`, backdrop-blur-sm |
| Handle bar | Div | Top center | 40x4px, `rounded-full`, bg `var(--tg-theme-hint-color)`, opacity 0.4 |
| Icon | Emoji (🛒) | Center | 56x56px, `rounded-full`, bg `var(--tg-theme-secondary-bg-color)`, text 24px |
| Title | Text | Below icon | `text-xl font-bold`, color `var(--tg-theme-text-color)` |
| Message | Text | Below title | `text-sm`, color `var(--tg-theme-hint-color)`, includes dynamic restaurant name |
| Continue Button | Destructive button | Below message | `tg-btn tg-btn-destructive` (red/negative action) |
| Cancel Button | Secondary button | Below continue | `tg-btn tg-btn-secondary` |

#### Settings Bottom Sheet
| Element | Type | Position | Style |
|---|---|---|---|
| Overlay | Backdrop | Full screen, bottom aligned | Same as above |
| Handle bar | Div | Top center | 48x4px |
| Title | Text | Left | `text-lg font-bold`, color `var(--tg-theme-text-color)` |
| Close button | Icon button (×) | Right | 32x32px, `rounded-full`, bg `var(--tg-theme-secondary-bg-color)` |
| Settings Section | Card | Below title | `rounded-tg`, bg `var(--tg-theme-secondary-bg-color)` |
| → Section label | Text | Top | `text-xs font-semibold uppercase`, color `var(--tg-theme-hint-color)` |
| → Language row | Flex | Inside section | Label "Language" + LanguageSwitcher dropdown |

---

## 📱 Screen 02 — `/restaurants/:restaurantId` — Categories Page
**Route:** `/restaurants/:restaurantId`
**Purpose:** Browse menu categories for a selected restaurant

### Header
| Element | Type | Position | Style |
|---|---|---|---|
| Back button | Icon button (←) | Left | 36x36px, `rounded-full`, bg `var(--tg-theme-secondary-bg-color)`, icon stroke `var(--tg-theme-text-color)` |
| Page title | Text | Center/right of back | Restaurant name, `text-lg font-bold`, color `var(--tg-theme-text-color)` |
| Cart Badge | Icon button | Far right | Same as RestaurantsPage |

### Restaurant Info (below header)
| Element | Type | Style |
|---|---|---|
| Description | Text | `text-sm leading-relaxed`, color `var(--tg-theme-hint-color)`, padding 0 16px 12px |
| Tags | Flex wrap | Same as restaurant card tags |

### Section Label
| Element | Type | Style |
|---|---|---|
| Label text | Text | "Categories" (localized), `text-xs font-semibold uppercase tracking-wider`, color `var(--tg-theme-hint-color)`, padding 0 16px 8px |

### Category Grid (2 columns)
| Element | Type | Position | Style |
|---|---|---|---|
| Category Card | Button (full card clickable) | Grid cell | `rounded-tg`, bg `var(--tg-theme-secondary-bg-color)`, active scale-0.98 |
| → Image | Aspect ratio 4:3 | Top | `object-cover`, fallback: SVG building icon centered on `var(--tg-theme-bg-color)` |
| → Name | Text | Below image, padding 12px | `text-base font-semibold`, color `var(--tg-theme-text-color)`, truncate |
| → Description | Text | Below name | `text-sm line-clamp-2`, color `var(--tg-theme-hint-color)` |

### Empty State
| Element | Type | Style |
|---|---|---|
| Icon | Emoji (📋) | Same as above |
| Title | Text | "No categories yet" (localized) |
| Description | Text | "This restaurant hasn't added any categories yet." |
| Action | Button | "Back to Restaurants" → navigates to `/` |

### Loading State
- 6 category card skeletons in 2-column grid

---

## 📱 Screen 03 — `/restaurants/:restaurantId/categories/:categoryId` — Dishes Page
**Route:** `/restaurants/:restaurantId/categories/:categoryId`
**Purpose:** Browse dishes in a category, add to cart

### Header
| Element | Type | Position | Style |
|---|---|---|---|
| Back button | Icon button | Left | Same as CategoriesPage |
| Page title | Text | Center | Category name, `text-lg font-bold` |
| Cart Badge | Icon button | Far right | Same as above |

### Category Description (optional)
| Element | Type | Style |
|---|---|---|
| Description text | Text | `text-sm leading-relaxed`, color `var(--tg-theme-hint-color)` |

### Section Label
| Element | Type | Style |
|---|---|---|
| Label text | Text | "X dishes" (localized with count), same style as categories label |

### Dish Grid (2 columns)
| Element | Type | Position | Style |
|---|---|---|---|
| Dish Card | Card | Grid cell | `rounded-tg`, bg `var(--tg-theme-secondary-bg-color)`, shadow, hover shadow-lg |
| → Image | Aspect ratio 4:3 | Top | `object-cover`, fallback: SVG building icon |
| → Name | Text | Below image, padding 12px | `text-sm font-semibold line-clamp-2`, color `var(--tg-theme-text-color)` |
| → Description | Text | Below name | `text-xs line-clamp-2`, color `var(--tg-theme-hint-color)` |
| → Price | Text | Below description | `text-lg font-bold`, color `var(--tg-theme-button-color)` |
| → Add / Quantity Stepper | Button or component | Below price | |
| | → If qty=0: "Add to cart" button | Full width | `rounded-xl`, py-3, bg `var(--tg-theme-button-color)`, text `var(--tg-theme-button-text-color)` |
| | → If qty>0: QuantityStepper | Full width, centered | See QuantityStepper below |

### Floating Cart Bar (bottom, fixed)
| Element | Type | Position | Style |
|---|---|---|---|
| Container | Fixed bar | Bottom | `bottom-bar`, padding-bottom safe-area-aware, bg `var(--tg-theme-button-color)`, shadow `0 -2px 10px rgba(0,0,0,0.1)` |
| → Item count badge | Circle | Left | 32x32px, `rounded-lg`, bg `rgba(255,255,255,0.25)`, text white, font-bold |
| → "Cart" text | Text | After badge | `text-base font-semibold`, white |
| → Total price | Text | Right | `text-base font-bold`, white |

### Empty State
- Icon: 🍽️
- Title: "No dishes available"
- Description: "This category doesn't have any dishes yet."
- Action: "Back to Menu" → navigates to categories page

### Loading State
- 6 dish card skeletons

---

## 📱 Screen 04 — `/cart` — Cart Page
**Route:** `/cart`
**Purpose:** Review cart items, adjust quantities, proceed to checkout

### Header
| Element | Type | Style |
|---|---|---|
| Back button | Icon button | Left |
| Title | Text | "Cart" (localized), `text-lg font-bold` |

### Empty Cart State
| Element | Type | Style |
|---|---|---|
| Icon | Emoji (🛒) | 5xl |
| Title | Text | "Your cart is empty" |
| Description | Text | "Browse our restaurants and add some delicious food!" |
| Action | Button | "Browse Restaurants" → navigates to `/` |

### Restaurant Label (when cart has items)
| Element | Type | Style |
|---|---|---|
| Container | Card | `mx-4 mt-2 mb-4`, `rounded-tg`, bg `var(--tg-theme-secondary-bg-color)`, gap 12px, py-3 |
| → Icon | SVG | 40x40px, `rounded-lg`, bg `var(--tg-theme-bg-color)`, icon stroke `var(--tg-theme-text-color)` (building) |
| → "Ordering from" label | Text | `text-xs font-medium uppercase`, color `var(--tg-theme-hint-color)` |
| → Restaurant name | Text | `text-base font-semibold truncate`, color `var(--tg-theme-text-color)` |

### Cart Item List (scrollable)
| Element | Type | Position | Style |
|---|---|---|---|
| Item Card | Card | Stacked, gap 12px | `rounded-tg`, bg `var(--tg-theme-secondary-bg-color)` |
| → Item image | Image | Left | 80x80px, `rounded-xl`, fallback: 🍴 emoji on `var(--tg-theme-secondary-bg-color)` |
| → Item details | Flex column | Right of image | flex-1, justify-between, gap 8px |
| | → Name | Text | `text-sm font-semibold line-clamp-2`, color `var(--tg-theme-text-color)` |
| | → Description | Text | `text-xs line-clamp-1`, color `var(--tg-theme-hint-color)` |
| | → Price row | Flex | justify-between |
| | | → Unit price + quantity | `text-xs`, color `var(--tg-theme-hint-color)`, format: "$X.XX each" |
| | | → Line total | `text-sm font-bold`, color `var(--tg-theme-text-color)` |
| → QuantityStepper | Component | Right side of details | See below |
| → Remove button | Icon button (×) | Top right of card | 28x28px, `rounded-full`, bg `var(--tg-theme-bg-color)`, color `var(--tg-theme-destructive-text-color)` |

### Order Summary Card
| Element | Type | Style |
|---|---|---|
| Container | Card | `rounded-tg`, bg `var(--tg-theme-secondary-bg-color)` |
| Section label | Text | "Order Summary", `text-sm font-semibold uppercase`, color `var(--tg-theme-hint-color)` |
| Line items | Rows | Item name × quantity (hint color), price (text color) |
| Divider | Line | Border top, color `var(--tg-theme-bg-color)` |
| Total row | Flex | justify-between, both bold |
| Item count | Text | `text-xs text-right`, color `var(--tg-theme-hint-color)` |

### Checkout Button (bottom, fixed)
| Element | Type | Style |
|---|---|---|
| Container | Fixed bar | `bottom-bar` |
| Button | Full width | `tg-btn`, flex justify-between |
| → Text | "Proceed to Checkout" | `text-base font-semibold` |
| → Price | Total | `text-sm font-bold`, opacity 0.9 |

---

## 📱 Screen 05 — `/checkout` — Checkout Page
**Route:** `/checkout`
**Purpose:** Enter delivery location (GPS or Maps link), add comment, place order

### Header
| Element | Type | Style |
|---|---|---|
| Back button | Icon button | Left |
| Title | Text | "Checkout" (localized) |

### Empty Cart Redirect
- If cart empty: shows EmptyState with "Your cart is empty" + "Browse Restaurants" button

### Order Summary Card
| Element | Type | Style |
|---|---|---|
| Section label | Text | "Order Summary" + REQUIRED asterisk in red |
| Restaurant row | Flex | Icon (building) + restaurant name |
| Item rows | List | Item name × quantity, price |
| Divider | Line | |
| Total row | Flex | "Total" + formatted price |

### Delivery Location Section
| Element | Type | Style |
|---|---|---|
| Section label | Text | "Delivery Location" + "Required" in red |
| Card | Container | `rounded-tg`, bg `var(--tg-theme-secondary-bg-color)` |

#### Option A: Geolocation
| Element | Type | Style |
|---|---|---|
| Row | Flex | Icon (circle target) + text |
| → Title | Text | "Use my location" |
| → Hint | Text | "Automatically detect via GPS" |
| Status (when active) | Row | Green bg `rgba(52,199,89,0.12)`, checkmark emoji, lat/lng coordinates, "Clear" button |
| Error (when failed) | Row | Red bg `rgba(229,57,53,0.1)`, warning emoji, error message |
| Button | Primary/Active | "Detect My Location" / "Detecting..." with spinner / "✓ Location set" |

#### Divider
| Element | Type | Style |
|---|---|---|
| Container | Flex | "OR" centered, lines on sides |
| Line | Div | flex-1, height 1px, bg `var(--tg-theme-bg-color)` |
| Text | "OR" | `text-xs font-semibold`, color `var(--tg-theme-hint-color)` |

#### Option B: Google Maps Link
| Element | Type | Style |
|---|---|---|
| Row | Flex | Icon (map) + text |
| → Title | Text | "Paste Google Maps link" |
| → Hint | Text | "Share location from Maps app" |
| Input container | Input wrapper | `rounded-xl`, bg `var(--tg-theme-bg-color)`, border (green if valid, red if error) |
| → Link icon | SVG | 16x16px, left |
| → Input | URL input | `flex-1`, placeholder "Paste Google Maps link" |
| → Clear button | × button | Right, appears when text entered |
| Error message | Text | Red, below input |
| Success message | Text | Green, below input |

### Comment Section (Optional)
| Element | Type | Style |
|---|---|---|
| Section label | Text | "Comment (optional)" |
| Textarea | Input | `rounded-tg`, bg `var(--tg-theme-secondary-bg-color)`, 3 rows, placeholder "Any special instructions...", max 500 chars |
| Char counter | Text | `text-xs text-right`, shows "X/500" |

### Submit Error Banner
| Element | Type | Style |
|---|---|---|
| Container | Card | Red bg `rgba(229,57,53,0.1)` |
| → Title | Text | "Order failed" in red |
| → Message | Text | Error message in hint color |

### Place Order Button (bottom, fixed)
| Element | Type | Style |
|---|---|---|
| Hint (when invalid) | Text | "Please provide a delivery location to continue" |
| Button | `tg-btn` | Disabled until form valid, shows spinner + "Placing Order..." when loading |
| → Text | "Place Order — $XX.XX" | |

---

## 📱 Screen 06 — `/order-success` — Order Success Page
**Route:** `/order-success`
**Purpose:** Confirm order placed successfully, show order ID

### Layout
- **Full screen centered layout** — flex-col, items-center, justify-center, min-h-screen

### Success Icon
| Element | Type | Style |
|---|---|---|
| Container | Circle | 96x96px (w-24 h-24), bg `rgba(52,199,89,0.15)` |
| → Icon | SVG checkmark | 52x52px, stroke `#34c759`, stroke-width 2.5 |
| → Sparkles | Emojis | ✨ (top-right), 🎉 (bottom-left), subtle pulse animation |

### Heading
| Element | Type | Style |
|---|---|---|
| Title | Text | "Order Placed!" (localized), `text-2xl font-bold`, color `var(--tg-theme-text-color)` |
| Description | Text | "Your order has been placed successfully." (localized), `text-base`, color `var(--tg-theme-hint-color)`, max-width 320px |

### Order ID Badge
| Element | Type | Style |
|---|---|---|
| Container | Card | `rounded-tg`, bg `var(--tg-theme-secondary-bg-color)`, py-3 px-5 |
| → Label | Text | "Order ID" (localized), `text-xs font-semibold uppercase`, color `var(--tg-theme-hint-color)` |
| → ID value | Text | `#<orderId>`, `text-base font-bold font-mono`, color `var(--tg-theme-text-color)` |

### What's Next Section
| Element | Type | Style |
|---|---|---|
| Container | Card | `rounded-tg`, bg `var(--tg-theme-secondary-bg-color)`, max-width 360px |
| Section label | Text | "What's next?" (localized), `text-xs font-semibold uppercase`, color `var(--tg-theme-hint-color)` |
| Steps (3) | Rows | Each: 32x32px circle (bg `var(--tg-theme-bg-color)`) + emoji + text |
| → Step 1 | 👨‍🍳 + "Preparing your food" |
| → Step 2 | 🛵 + "Driver picking up" |
| → Step 3 | 🏠 + "On the way" |

### CTA Button
| Element | Type | Style |
|---|---|---|
| Button | `tg-btn` | "Order More Food" (localized), max-width 360px |

### Redirect Behavior
- If accessed without orderId (direct URL): redirects to home after 3 seconds

---

## 🧩 Reusable Components Reference

### QuantityStepper
| Element | Type | Style |
|---|---|---|
| Decrement button (−) | Button | 36x36px (sm) or 48x48px (md), `rounded-tg`, bg `var(--tg-theme-secondary-bg-color)`, color `var(--tg-theme-button-color)`, disabled opacity 0.4 |
| Count | Text | 32px (sm) or 40px (md) width, `font-semibold`, `tabular-nums`, color `var(--tg-theme-text-color)` |
| Increment button (+) | Button | Same as decrement, bg `var(--tg-theme-button-color)`, color `var(--tg-theme-button-text-color)` |

### CartBadge
| Element | Type | Style |
|---|---|---|
| Container | Button | 40x40px, `rounded-full`, bg `var(--tg-theme-secondary-bg-color)`, navigate to /cart |
| Icon | SVG cart | 20x20px, stroke `var(--tg-theme-button-color)` |
| Badge | Circle | 18x18px (min-width 18px), `rounded-full`, bg `var(--tg-theme-button-color)`, text white 11px bold, "99+" if >99 |

### PageHeader
| Element | Type | Style |
|---|---|---|
| Container | Header | `flex items-center gap-3 px-4 py-3`, sticky top-0, z-40, bg `var(--tg-theme-bg-color)` |
| Back button | Icon button | Optional, 36x36px |
| Title | Text | `flex-1 text-lg font-bold truncate`, color `var(--tg-theme-text-color)` |
| Right element | Slot | Custom element or CartBadge |

### EmptyState
| Element | Type | Style |
|---|---|---|
| Container | Flex | `flex-col items-center justify-center text-center`, py-16 px-8 |
| Icon | Slot | 5xl emoji, opacity 0.6 |
| Title | Text | `text-lg font-semibold`, mb-2, color `var(--tg-theme-text-color)` |
| Description | Text | `text-sm`, mb-6, max-width 280px, color `var(--tg-theme-hint-color)` |
| Action | Slot | Button wrapper, max-width 280px |

### ErrorState
| Element | Type | Style |
|---|---|---|
| Icon | ⚠️ emoji | 5xl |
| Title | Text | "Something went wrong" (or localized) |
| Message | Text | Error description |
| Retry button | Button | `tg-btn` |

### LanguageSwitcher
| Element | Type | Style |
|---|---|---|
| Select | Dropdown | `rounded-tg border`, bg `var(--tg-theme-secondary-bg-color)`, color `var(--tg-theme-text-color)` |
| Options | EN / RU | Current locale shown |

---

## 🎨 Button Styles (CSS Classes)

| Class | Style |
|---|---|
| `tg-btn` | Primary: bg `var(--tg-theme-button-color)`, text white, rounded-xl, py-3 px-5, font-semibold |
| `tg-btn-secondary` | Secondary: bg `var(--tg-theme-secondary-bg-color)`, text `var(--tg-theme-text-color)`, same sizing |
| `tg-btn-destructive` | Destructive: bg `var(--tg-theme-destructive-text-color)`, text white |

---

## 📋 Summary Table

| Screen | Route | Key Features |
|---|---|---|
| Restaurants | `/` | Search, filter, restaurant cards, cart badge, settings |
| Categories | `/restaurants/:id` | Restaurant info, 2-col category grid |
| Dishes | `/restaurants/:id/categories/:id` | 2-col dish grid, add-to-cart, floating cart bar |
| Cart | `/cart` | Item list, quantity steppers, order summary, checkout CTA |
| Checkout | `/checkout` | Order summary, GPS/maps location, comment, place order |
| Order Success | `/order-success` | Success checkmark, order ID, "what's next" steps |

---

*Document generated for AI agent / LLM consumption. All dimensions, colors, and patterns extracted from codebase implementation.*
