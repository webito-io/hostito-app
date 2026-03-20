export type OrderStatus = "PENDING" | "ACTIVE" | "CANCELLED" | "FRAUD";

export interface Order {
  id: number;
  total: number;
  tax: number;
  subtotal: number;
  discount: number;
  shipping: number;
  status: OrderStatus;
  currencyId: number;
  organizationId: number;
  couponId?: number;
  createdAt: string;
  updatedAt: string;
}

export interface UpdateOrderDto {
  status: OrderStatus;
}
