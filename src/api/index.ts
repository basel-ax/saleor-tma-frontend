// ─── API Client ───────────────────────────────────────────────────────────────
// All requests include the Telegram initData as an Authorization header.
// Backend URL is configured via VITE_BACKEND_BASE_URL environment variable.

import type {
  Restaurant,
  Category,
  Dish,
  CreateOrderPayload,
  OrderSuccessResponse,
} from '../types';

const BASE_URL = (import.meta.env.VITE_BACKEND_BASE_URL as string) || '';

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getInitData(): string {
  return window.Telegram?.WebApp?.initData ?? '';
}

function buildHeaders(): HeadersInit {
  const initData = getInitData();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  if (initData) {
    headers['Authorization'] = `tma ${initData}`;
  }
  return headers;
}

async function request<T>(
  path: string,
  options?: RequestInit,
): Promise<T> {
  const url = `${BASE_URL}${path}`;
  const response = await fetch(url, {
    ...options,
    headers: {
      ...buildHeaders(),
      ...(options?.headers ?? {}),
    },
  });

  if (!response.ok) {
    let message = `HTTP ${response.status}`;
    try {
      const err = await response.json() as { message?: string };
      if (err.message) message = err.message;
    } catch {
      // ignore parse errors
    }
    throw new Error(message);
  }

  return response.json() as Promise<T>;
}

// ─── Endpoints ────────────────────────────────────────────────────────────────

/** GET /restaurants */
export async function fetchRestaurants(): Promise<Restaurant[]> {
  return request<Restaurant[]>('/restaurants');
}

/** GET /restaurants/:restaurantId/categories */
export async function fetchCategories(restaurantId: string): Promise<Category[]> {
  return request<Category[]>(`/restaurants/${restaurantId}/categories`);
}

/** GET /restaurants/:restaurantId/categories/:categoryId/dishes */
export async function fetchDishes(
  restaurantId: string,
  categoryId: string,
): Promise<Dish[]> {
  return request<Dish[]>(
    `/restaurants/${restaurantId}/categories/${categoryId}/dishes`,
  );
}

/** POST /orders */
export async function createOrder(
  payload: CreateOrderPayload,
): Promise<OrderSuccessResponse> {
  return request<OrderSuccessResponse>('/orders', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
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
