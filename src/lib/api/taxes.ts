import { instance } from "./instance";
import { Tax, CreateTaxDto, UpdateTaxDto } from "@/types/taxes";

export const taxesService = {
  findAll: async () => {
    const response = await instance.get<Tax[]>("/taxes");
    return response.data;
  },
  findOne: async (id: number) => {
    const response = await instance.get<Tax>(`/taxes/${id}`);
    return response.data;
  },
  create: async (data: CreateTaxDto) => {
    const response = await instance.post<Tax>("/taxes", data);
    return response.data;
  },
  update: async (id: number, data: UpdateTaxDto) => {
    const response = await instance.patch<Tax>(`/taxes/${id}`, data);
    return response.data;
  },
  remove: async (id: number) => {
    await instance.delete(`/taxes/${id}`);
  },
};
