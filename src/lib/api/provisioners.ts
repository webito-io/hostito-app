import api from './instance';
import { Provisioner, ConfigureProvisionerDto, ProvisionerResponse } from '@/types/provisioners';

export const provisionersService = {
  findAll: async () => {
    const response = await api.get<ProvisionerResponse>('/provisioners');
    return response.data;
  },

  activate: async (id: number) => {
    const response = await api.patch<Provisioner>(`/provisioners/${id}/activate`);
    return response.data;
  },

  deactivate: async (id: number) => {
    const response = await api.patch<Provisioner>(`/provisioners/${id}/deactivate`);
    return response.data;
  },

  configure: async (id: number, data: ConfigureProvisionerDto) => {
    const response = await api.patch<Provisioner>(`/provisioners/${id}`, data);
    return response.data;
  },
};
