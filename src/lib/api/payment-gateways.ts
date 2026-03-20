import { instance } from "./instance";
import { PaymentGateway, UpdatePaymentGatewayDto } from "@/types/payment-gateways";

export const paymentGatewaysService = {
  findAll: async () => {
    const response = await instance.get<PaymentGateway[]>("/payment-gateways");
    return response.data;
  },
  findOne: async (id: number) => {
    const response = await instance.get<PaymentGateway>(`/payment-gateways/${id}`);
    return response.data;
  },
  activate: async (id: number) => {
    const response = await instance.patch<PaymentGateway>(`/payment-gateways/${id}/activate`);
    return response.data;
  },
  deactivate: async (id: number) => {
    const response = await instance.patch<PaymentGateway>(`/payment-gateways/${id}/deactivate`);
    return response.data;
  },
  setConfig: async (id: number, data: UpdatePaymentGatewayDto) => {
    const response = await instance.patch<PaymentGateway>(`/payment-gateways/${id}/config`, data);
    return response.data;
  },
};
