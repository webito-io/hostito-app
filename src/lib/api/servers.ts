import { CreateServerDto, Server, ServerResponse, UpdateServerDto } from '@/types/servers';
import api from './instance';

export const serversService = {
  findAll: async () => {
    const response = await api.get<ServerResponse>('/servers');
    return response.data;
  },

  findOne: async (id: number) => {
    const response = await api.get<Server>(`/servers/${id}`);
    return response.data;
  },

  create: async (data: CreateServerDto) => {
    const response = await api.post<Server>('/servers', data);
    return response.data;
  },

  update: async (id: number, data: UpdateServerDto) => {
    const response = await api.patch<Server>(`/servers/${id}`, data);
    return response.data;
  },

  remove: async (id: number) => {
    await api.delete(`/servers/${id}`);
  },
};
