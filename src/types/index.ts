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

// ─── GraphQL Input Types (for backend) ───────────────────────────────────────

export interface DeliveryLocationInput {
  id?: string;
  address: string;
  city?: string;
  country?: string;
  latitude: number;
  longitude: number;
}

export interface OrderItemInput {
  dishId: string;
  quantity: number;
  notes?: string;
}

export interface PlaceOrderInput {
  restaurantId: string;
  items: OrderItemInput[];
  deliveryLocation: DeliveryLocationInput;
  customerNote?: string;
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

export interface CreateOrderPayload {
  restaurantId: string;
  deliveryLocation: DeliveryLocationInput;
  items: OrderItemInput[];
  customerNote?: string;
}

export interface OrderSuccessResponse {
   orderId: string;
   status: string;
   estimatedDelivery?: string; // ISO timestamp or human-readable string, depending on backend
 }

export interface ApiErrorResponse {
  message: string;
  code?: string;
}

// ─── UI State ─────────────────────────────────────────────────────────────────

export type LoadingState = 'idle' | 'loading' | 'success' | 'error';

export interface CheckoutFormState {
  deliveryMode: 'geolocation' | 'maps-link' | null;
  location: DeliveryLocationInput | null;
  googleMapsUrl: string;
  comment: string;
  locationError: string | null;
}
