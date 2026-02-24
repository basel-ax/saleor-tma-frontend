// ─── Domain Entities ─────────────────────────────────────────────────────────

export interface Restaurant {
  id: string;
  name: string;
  description?: string;
  imageUrl?: string;
  tags?: string[];
}

export interface Category {
  id: string;
  restaurantId: string;
  name: string;
  description?: string;
  imageUrl?: string;
}

export interface Dish {
  id: string;
  restaurantId: string;
  categoryId: string;
  name: string;
  description: string;
  imageUrl: string;
  price: number;
  currency: string;
}

// ─── Cart ─────────────────────────────────────────────────────────────────────

export interface CartItem {
  dishId: string;
  quantity: number;
  // Snapshot fields for stable UI (decoupled from API refetch)
  name: string;
  price: number;
  currency: string;
  imageUrl?: string;
  description?: string;
}

export interface Cart {
  restaurantId: string;
  restaurantName: string;
  items: CartItem[];
  updatedAt: string; // ISO timestamp
}

// ─── Order ────────────────────────────────────────────────────────────────────

export interface DeliveryLocation {
  lat: number;
  lng: number;
}

export interface OrderItem {
  dishId: string;
  quantity: number;
}

export interface CreateOrderPayload {
  restaurantId: string;
  items: OrderItem[];
  deliveryLocation: DeliveryLocation | null;
  googleMapsUrl: string | null;
  comment: string | null;
}

export interface OrderSuccessResponse {
  orderId: string;
  status: string;
}

export interface ApiErrorResponse {
  message: string;
  code?: string;
}

// ─── UI State ─────────────────────────────────────────────────────────────────

export type LoadingState = 'idle' | 'loading' | 'success' | 'error';

export interface CheckoutFormState {
  deliveryMode: 'geolocation' | 'maps-link' | null;
  location: DeliveryLocation | null;
  googleMapsUrl: string;
  comment: string;
  locationError: string | null;
}
