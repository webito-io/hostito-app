import { Product } from "./products";

export interface CartItem {
  id: number;
  cartId: number;
  productId: number;
  product?: Product;
  config: Record<string, any>;
  quantity: number;
  createdAt: string;
  updatedAt: string;
}

export interface Cart {
  id: number;
  organizationId: number;
  status: "ACTIVE" | "PROCESSING";
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
  config: Record<string, any>;
  quantity: number;
}

export interface ApplyCouponDto {
  couponCode?: string;
}
