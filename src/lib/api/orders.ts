import { instance } from "./instance";
import { Order, UpdateOrderDto } from "@/types/orders";

export const ordersService = {
  findAll: async () => {
    const response = await instance.get<Order[]>("/orders");
    return response.data;
  },
  findOne: async (id: number) => {
    const response = await instance.get<Order>(`/orders/${id}`);
    return response.data;
  },
  update: async (id: number, data: UpdateOrderDto) => {
    const response = await instance.patch<Order>(`/orders/${id}`, data);
    return response.data;
  },
  remove: async (id: number) => {
    await instance.delete(`/orders/${id}`);
  },
  pay: async (id: number, gatewayId: number) => {
    await instance.post(`/orders/${id}/pay`, { gatewayId });
  },
};
