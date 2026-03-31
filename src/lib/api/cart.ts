import { instance } from "./instance";
import { Cart, CartItem, CartItemDto, ApplyCouponDto } from "@/types/cart";

export const cartService = {
  getCart: async (coupon?: string) => {
    const response = await instance.post<Cart>("/carts", { couponCode: coupon } as ApplyCouponDto);
    return response.data;
  },
  addItem: async (data: CartItemDto) => {
    const response = await instance.post<CartItem>("/carts/cart-item", data);
    return response.data;
  },
  updateItem: async (id: number, data: CartItemDto) => {
    const response = await instance.patch<CartItem>(`/carts/cart-item/${id}`, data);
    return response.data;
  },
  removeItem: async (id: number) => {
    await instance.delete(`/carts/cart-item/${id}`);
  },
  addDomain: async (domain: string) => {
    const response = await instance.post<CartItem>("/carts/domain", { domain });
    return response.data;
  },
  checkout: async (gatewayId?: number, coupon?: string) => {
    const response = await instance.post("/orders/checkout", { gatewayId, coupon });
    return response.data;
  },
};
