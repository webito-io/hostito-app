import { instance } from "./instance";
import { Registrar, RegistrarResponse, UpdateRegistrarDto } from "@/types/registrars";

export const registrarsService = {
  findAll: async () => {
    const response = await instance.get<RegistrarResponse>("/registrars");
    return response.data;
  },
  findOne: async (id: number) => {
    const response = await instance.get<Registrar>(`/registrars/${id}`);
    return response.data;
  },
  activate: async (id: number) => {
    const response = await instance.patch<Registrar>(`/registrars/${id}/activate`);
    return response.data;
  },
  deactivate: async (id: number) => {
    const response = await instance.patch<Registrar>(`/registrars/${id}/deactivate`);
    return response.data;
  },
  configure: async (id: number, data: UpdateRegistrarDto) => {
    const response = await instance.patch<Registrar>(`/registrars/${id}`, data);
    return response.data;
  },
};
