import instance from './instance';
import { CreateCurrencyDto, UpdateCurrencyDto, Currency, CurrenciesResponse } from '@/types/currencies';

export const currenciesService = {
  findAll: async (page = 1, limit = 10): Promise<CurrenciesResponse> => {
    const response = await instance.get<CurrenciesResponse>('/currencies', {
      params: { page, limit },
    });
    return response.data;
  },

  findOne: async (id: number): Promise<Currency> => {
    const response = await instance.get<Currency>(`/currencies/${id}`);
    return response.data;
  },

  create: async (data: CreateCurrencyDto): Promise<Currency> => {
    const response = await instance.post<Currency>('/currencies', data);
    return response.data;
  },

  update: async (id: number, data: UpdateCurrencyDto): Promise<Currency> => {
    const response = await instance.patch<Currency>(`/currencies/${id}`, data);
    return response.data;
  },

  remove: async (id: number): Promise<void> => {
    await instance.delete(`/currencies/${id}`);
  },
};
