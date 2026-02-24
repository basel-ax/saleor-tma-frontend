// ─── Cart Store ───────────────────────────────────────────────────────────────
// Single-restaurant cart with localStorage persistence.
// Hard rule: all items must belong to exactly one restaurant.
// Uses Zustand v3 API (create from 'zustand', manual localStorage sync).

import create from "zustand";
import type { Cart, CartItem, Dish } from "../types";

const CART_STORAGE_KEY = "food-order-cart";

// ─── Persistence helpers ──────────────────────────────────────────────────────

function loadCart(): Cart | null {
  try {
    const raw = localStorage.getItem(CART_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as { cart?: Cart };
    return parsed.cart ?? null;
  } catch {
    return null;
  }
}

function saveCart(cart: Cart | null): void {
  try {
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify({ cart }));
  } catch {
    // ignore storage errors
  }
}

// ─── Store types ──────────────────────────────────────────────────────────────

interface CartState {
  cart: Cart | null;

  // Derived helpers
  totalItems: () => number;
  totalPrice: () => number;
  getItemQuantity: (dishId: string) => number;

  // Actions
  addItem: (dish: Dish, restaurantName: string) => void;
  removeItem: (dishId: string) => void;
  incrementItem: (dishId: string) => void;
  decrementItem: (dishId: string) => void;
  clearCart: () => void;

  // Restaurant switch guard
  isDifferentRestaurant: (restaurantId: string) => boolean;
}

// ─── Store ────────────────────────────────────────────────────────────────────

export const useCartStore = create<CartState>((set, get) => ({
  cart: loadCart(),

  // ─── Derived helpers ─────────────────────────────────────────────────────────

  totalItems: () => {
    const { cart } = get();
    if (!cart) return 0;
    return cart.items.reduce((sum, item) => sum + item.quantity, 0);
  },

  totalPrice: () => {
    const { cart } = get();
    if (!cart) return 0;
    return cart.items.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0,
    );
  },

  getItemQuantity: (dishId: string) => {
    const { cart } = get();
    if (!cart) return 0;
    return cart.items.find((i) => i.dishId === dishId)?.quantity ?? 0;
  },

  // ─── Actions ──────────────────────────────────────────────────────────────────

  addItem: (dish: Dish, restaurantName: string) => {
    const { cart } = get();

    // Different restaurant — caller must handle confirmation before calling addItem
    if (
      cart &&
      cart.items.length > 0 &&
      cart.restaurantId !== dish.restaurantId
    ) {
      console.warn(
        "Attempted to add dish from a different restaurant without clearing cart.",
        {
          cartRestaurantId: cart.restaurantId,
          dishRestaurantId: dish.restaurantId,
        },
      );
      return;
    }

    const existingItem = cart?.items.find((i) => i.dishId === dish.id);

    let newCart: Cart;

    if (existingItem) {
      // Increment existing item
      newCart = {
        ...(cart as Cart),
        items: (cart as Cart).items.map((i) =>
          i.dishId === dish.id ? { ...i, quantity: i.quantity + 1 } : i,
        ),
        updatedAt: new Date().toISOString(),
      };
    } else {
      // Add new item with snapshot fields
      const newItem: CartItem = {
        dishId: dish.id,
        quantity: 1,
        name: dish.name,
        price: dish.price,
        currency: dish.currency,
        imageUrl: dish.imageUrl,
        description: dish.description,
      };

      newCart = {
        restaurantId: dish.restaurantId,
        restaurantName: cart?.restaurantName ?? restaurantName,
        items: [...(cart?.items ?? []), newItem],
        updatedAt: new Date().toISOString(),
      };
    }

    saveCart(newCart);
    set({ cart: newCart });
    console.log("dish_added", { dishId: dish.id, name: dish.name });
  },

  removeItem: (dishId: string) => {
    const { cart } = get();
    if (!cart) return;

    const updatedItems = cart.items.filter((i) => i.dishId !== dishId);
    const newCart =
      updatedItems.length === 0
        ? null
        : { ...cart, items: updatedItems, updatedAt: new Date().toISOString() };

    saveCart(newCart);
    set({ cart: newCart });
    console.log("dish_removed", { dishId });
  },

  incrementItem: (dishId: string) => {
    const { cart } = get();
    if (!cart) return;

    const newCart: Cart = {
      ...cart,
      items: cart.items.map((i) =>
        i.dishId === dishId ? { ...i, quantity: i.quantity + 1 } : i,
      ),
      updatedAt: new Date().toISOString(),
    };

    saveCart(newCart);
    set({ cart: newCart });
  },

  decrementItem: (dishId: string) => {
    const { cart } = get();
    if (!cart) return;

    const item = cart.items.find((i) => i.dishId === dishId);
    if (!item) return;

    if (item.quantity <= 1) {
      get().removeItem(dishId);
      return;
    }

    const newCart: Cart = {
      ...cart,
      items: cart.items.map((i) =>
        i.dishId === dishId ? { ...i, quantity: i.quantity - 1 } : i,
      ),
      updatedAt: new Date().toISOString(),
    };

    saveCart(newCart);
    set({ cart: newCart });
  },

  clearCart: () => {
    saveCart(null);
    set({ cart: null });
    console.log("cart_cleared_due_to_switch");
  },

  // ─── Restaurant switch guard ───────────────────────────────────────────────

  isDifferentRestaurant: (restaurantId: string) => {
    const { cart } = get();
    if (!cart || cart.items.length === 0) return false;
    return cart.restaurantId !== restaurantId;
  },
}));
