import api from './instance';
import { Service, CreateServiceDto, UpdateServiceDto } from '@/types/services';

export const servicesService = {
  findAll: async () => {
    const response = await api.get<Service[]>('/services');
    return response.data;
  },

  findOne: async (id: number) => {
    const response = await api.get<Service>(`/services/${id}`);
    return response.data;
  },

  create: async (data: CreateServiceDto) => {
    const response = await api.post<Service>('/services', data);
    return response.data;
  },

  update: async (id: number, data: UpdateServiceDto) => {
    const response = await api.patch<Service>(`/services/${id}`, data);
    return response.data;
  },

  remove: async (id: number) => {
    await api.delete(`/services/${id}`);
  },
};
