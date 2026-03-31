import { Product } from "./products";

export interface CartItem {
  id: number;
  cartId: number;
  productId: number;
  variantId?: number;
  product?: Product;
  variant?: { id: number; productId: number; action: string; cycle: string; price: number };
  config: Record<string, any>;
  quantity: number;
  createdAt: string;
  updatedAt: string;
}

export interface Cart {
  id: number;
  organizationId: number;
  status: "ACTIVE" | "PROCESSING";
  couponCode?: string;
  items: CartItem[];
  total: number;
  tax: number;
  subtotal: number;
  discount: number;
  createdAt: string;
  updatedAt: string;
}

export interface CartItemDto {
  productId: number;
  variantId: number;
  config: Record<string, any>;
  quantity: number;
}

export interface ApplyCouponDto {
  couponCode?: string;
}
