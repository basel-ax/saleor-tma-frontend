// ─── API Client (GraphQL) ───────────────────────────────────────────────────────
// Backend GraphQL endpoint is configured via VITE_BACKEND_BASE_URL.
// All requests include Telegram initData payload in a X-Telegram-Init-Data header.

import type {
   Restaurant,
   Category,
   Dish,
   CreateOrderPayload,
   OrderSuccessResponse,
   Cart,
} from '../types';

type GraphQLResponse<D> = {
   data?: D;
   errors?: unknown[];
};

const BASE_URL = (import.meta.env.VITE_BACKEND_BASE_URL as string) || '';

// ─── Helpers ──────────────────────────────────────────────────────────────────
function getWindowTelegramInitData(): string {
   return (window as any).Telegram?.WebApp?.initData ?? '';
}

export function getTelegramInitHeader(): string {
      // Access import.meta.env at call time (not module eval time)
      const env = (import.meta.env as Record<string, unknown>);
      const devInitData = env['VITE_DEV_INIT_DATA'] as string | undefined;
      
      if (devInitData) {
         checkInitDataExpiration(devInitData);
         return devInitData;
      }
      
      const initData = getWindowTelegramInitData();
      if (initData) {
         checkInitDataExpiration(initData);
      }
      return initData;
  }

// Check if init data has expired auth_date and log warning in development mode
export function checkInitDataExpiration(initData: string): void {
      // Only check in development mode - read env at call time
      const env = (import.meta.env as Record<string, unknown>);
      if (env['PROD'] === true) {
         return;
      }
      
      try {
         const params = new URLSearchParams(initData);
         const authDateStr = params.get('auth_date');
         
         if (authDateStr) {
            const authDate = parseInt(authDateStr, 10);
            const currentTime = Math.floor(Date.now() / 1000);
            const twentyFourHours = 24 * 60 * 60; // 24 hours in seconds
            
            if (currentTime - authDate > twentyFourHours) {
               console.warn(`Telegram init data expired, auth_date: ${authDateStr}, current: ${currentTime}`);
            }
         }
      } catch (e) {
         // Ignore parsing errors - invalid format will be handled by backend
      }
}

function buildHeaders(): HeadersInit {
    const headers: Record<string, string> = {
       'Content-Type': 'application/json',
       'X-Telegram-Init-Data': getTelegramInitHeader(),
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

/** GET cart */
export async function fetchCart(): Promise<Cart | null> {
   const query = `query GetCart {
     cart {
       id
       restaurantId
       restaurantName
       items {
         dishId
         quantity
         name
         price
         currency
         imageUrl
         description
       }
       updatedAt
     }
   }`;
   const data = await requestGraphQL<{ cart: Cart | null }>(query);
   return data.cart;
}

/** POST add to cart */
export async function addToCart(input: AddToCartInput): Promise<Cart> {
   const mutation = `mutation AddToCart($input: AddToCartInput!) {
     addToCart(input: $input) {
       id
       restaurantId
       restaurantName
       items {
         dishId
         quantity
         name
         price
         currency
         imageUrl
         description
       }
       updatedAt
     }
   }`;
   const data = await requestGraphQL<{ addToCart: Cart }>(mutation, {
      input,
   });
   return data.addToCart;
}

/** POST update cart item */
export async function updateCartItem(input: UpdateCartItemInput): Promise<Cart> {
   const mutation = `mutation UpdateCartItem($input: UpdateCartItemInput!) {
     updateCartItem(input: $input) {
       id
       restaurantId
       restaurantName
       items {
         dishId
         quantity
         name
         price
         currency
         imageUrl
         description
       }
       updatedAt
     }
   }`;
   const data = await requestGraphQL<{ updateCartItem: Cart }>(mutation, {
      input,
   });
   return data.updateCartItem;
}

/** POST remove cart item */
export async function removeCartItem(input: RemoveCartItemInput): Promise<Cart> {
   const mutation = `mutation RemoveCartItem($input: RemoveCartItemInput!) {
     removeCartItem(input: $input) {
       id
       restaurantId
       restaurantName
       items {
         dishId
         quantity
         name
         price
         currency
         imageUrl
         description
       }
       updatedAt
     }
   }`;
   const data = await requestGraphQL<{ removeCartItem: Cart }>(mutation, {
      input,
   });
   return data.removeCartItem;
}

/** POST clear cart */
export async function clearCart(): Promise<Cart | null> {
   const mutation = `mutation ClearCart {
     clearCart {
       id
       restaurantId
       restaurantName
       items {
         dishId
         quantity
         name
         price
         currency
         imageUrl
         description
       }
       updatedAt
     }
   }`;
   const data = await requestGraphQL<{ clearCart: Cart | null }>(mutation);
   return data.clearCart;
}

/** POST place order */
export async function createOrder(
   payload: CreateOrderPayload,
): Promise<OrderSuccessResponse> {
   const mutation = `mutation PlaceOrder($input: PlaceOrderInput!) {
     placeOrder(input: $input) {
       orderId
       status
       estimatedDelivery
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

// ─── Cart (GraphQL) Input Types ───────────────────────────────────────────────

interface AddToCartInput {
   dishId: string;
   quantity: number;
   name: string;
   price: number;
   currency: string;
   restaurantId: string;
}

interface UpdateCartItemInput {
   dishId: string;
   quantity: number;
}

interface RemoveCartItemInput {
   dishId: string;
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