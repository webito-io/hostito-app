import api from './instance';
import { Payment } from '@/types/payments';

export const paymentsService = {
  findAll: async () => {
    const response = await api.get<Payment[]>('/payments');
    return response.data;
  },

  verify: async (id: number) => {
    const response = await api.get(`/payments/${id}/verify`);
    return response.data;
  },
};
