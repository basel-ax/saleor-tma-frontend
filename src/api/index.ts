// ─── API Client (GraphQL) ───────────────────────────────────────────────────────
// Backend GraphQL endpoint is configured via VITE_BACKEND_BASE_URL.
// All requests include Telegram initData payload in a Telegram-Init-Data header.

import type {
  Restaurant,
  Category,
  Dish,
  CreateOrderPayload,
  OrderSuccessResponse,
} from '../types';

type GraphQLResponse<D> = {
  data?: D;
  errors?: unknown[];
};

const BASE_URL = (import.meta.env.VITE_BACKEND_BASE_URL as string) || '';

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getTelegramInitHeader(): string {
  // Prefer the richer init data (initDataUnsafe.user) when available; fallback to initData.
  // Always stringify to JSON so the backend can parse a structured payload.
  const init = (window as any).Telegram?.WebApp?.initDataUnsafe?.user ??
               (window as any).Telegram?.WebApp?.initData ?? {};
  try {
    return JSON.stringify(init);
  } catch {
    return '{}';
  }
}

function buildHeaders(): HeadersInit {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    'Telegram-Init-Data': getTelegramInitHeader(),
  };
  return headers;
}

async function requestGraphQL<T>(query: string, variables?: any): Promise<T> {
  const url = `${BASE_URL}/graphql`;
  const payload = { query, variables };
  const response = await fetch(url, {
    method: 'POST',
    headers: buildHeaders(),
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    let message = `HTTP ${response.status}`;
    try {
      const err = await response.json();
      if (err && (err as any).message) message = (err as any).message;
    } catch {
      // ignore parse errors
    }
    throw new Error(message);
  }

  const json = (await response.json()) as GraphQLResponse<T>;
  if (json.errors && json.errors.length > 0) {
    throw new Error('GraphQL error');
  }
  return json.data as T;
}

// ─── Endpoints (GraphQL) ─────────────────────────────────────────────────────────

/** GET restaurants */
export async function fetchRestaurants(): Promise<Restaurant[]> {
  const query = `query GetRestaurants {
    restaurants {
      id
      name
      description
      imageUrl
      tags
    }
  }`;
  const data = await requestGraphQL<{ restaurants: Restaurant[] }>(query);
  return data.restaurants;
}

/** GET categories for a restaurant */
export async function fetchCategories(restaurantId: string): Promise<Category[]> {
  const query = `query GetCategories($restaurantId: ID!) {
    categories(restaurantId: $restaurantId) {
      id
      restaurantId
      name
      description
      imageUrl
    }
  }`;
  const data = await requestGraphQL<{ categories: Category[] }>(query, {
    restaurantId,
  });
  return data.categories;
}

/** GET dishes for a restaurant/category */
export async function fetchDishes(
  restaurantId: string,
  categoryId: string,
): Promise<Dish[]> {
  const query = `query GetDishes($restaurantId: ID!, $categoryId: ID!) {
    dishes(restaurantId: $restaurantId, categoryId: $categoryId) {
      id
      restaurantId
      categoryId
      name
      description
      imageUrl
      price
      currency
    }
  }`;
  const data = await requestGraphQL<{ dishes: Dish[] }>(query, {
    restaurantId,
    categoryId,
  });
  return data.dishes;
}

/** POST place order */
export async function createOrder(
  payload: CreateOrderPayload,
): Promise<OrderSuccessResponse> {
  const mutation = `mutation PlaceOrder($input: PlaceOrderInput!) {
    placeOrder(input: $input) {
      orderId
      status
    }
  }`;
  const data = await requestGraphQL<{ placeOrder: OrderSuccessResponse }>(
    mutation,
    {
      input: payload,
    },
  );
  return data.placeOrder;
}

// ─── Telegram WebApp type augmentation ───────────────────────────────────────

declare global {
  interface Window {
    Telegram?: {
      WebApp?: {
        initData: string;
        initDataUnsafe?: {
          user?: {
            id: number;
            first_name: string;
            last_name?: string;
            username?: string;
          };
        };
        ready: () => void;
        expand: () => void;
        close: () => void;
        platform?: string;
        version?: string;
        colorScheme?: 'light' | 'dark';
        BackButton?: {
          show: () => void;
          hide: () => void;
          onClick: (fn: () => void) => void;
          offClick: (fn: () => void) => void;
        };
        MainButton?: {
          text: string;
          color: string;
          textColor: string;
          isVisible: boolean;
          isActive: boolean;
          show: () => void;
          hide: () => void;
          enable: () => void;
          disable: () => void;
          setText: (text: string) => void;
          onClick: (fn: () => void) => void;
          offClick: (fn: () => void) => void;
          showProgress: (leaveActive?: boolean) => void;
          hideProgress: () => void;
        };
        HapticFeedback?: {
          impactOccurred: (style: 'light' | 'medium' | 'heavy' | 'rigid' | 'soft') => void;
          notificationOccurred: (type: 'error' | 'success' | 'warning') => void;
          selectionChanged: () => void;
        };
        showAlert: (message: string, callback?: () => void) => void;
        showConfirm: (message: string, callback: (confirmed: boolean) => void) => void;
        sendData: (data: string) => void;
      };
    };
  }
}
