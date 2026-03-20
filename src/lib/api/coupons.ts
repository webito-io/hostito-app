import { instance } from "./instance";
import { Coupon, CreateCouponDto, UpdateCouponDto } from "@/types/coupons";

export const couponsService = {
  findAll: async () => {
    const response = await instance.get<Coupon[]>("/coupons");
    return response.data;
  },
  findOne: async (id: number) => {
    const response = await instance.get<Coupon>(`/coupons/${id}`);
    return response.data;
  },
  create: async (data: CreateCouponDto) => {
    const response = await instance.post<Coupon>("/coupons", data);
    return response.data;
  },
  update: async (id: number, data: UpdateCouponDto) => {
    const response = await instance.patch<Coupon>(`/coupons/${id}`, data);
    return response.data;
  },
  remove: async (id: number) => {
    await instance.delete(`/coupons/${id}`);
  },
};
