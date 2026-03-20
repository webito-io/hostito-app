import { instance } from "./instance";
import { Domain, CreateDomainDto, UpdateDomainDto } from "@/types/domains";

export const domainsService = {
  findAll: async () => {
    const response = await instance.get<Domain[]>("/domains");
    return response.data;
  },
  findOne: async (id: number) => {
    const response = await instance.get<Domain>(`/domains/${id}`);
    return response.data;
  },
  create: async (data: CreateDomainDto) => {
    const response = await instance.post<Domain>("/domains", data);
    return response.data;
  },
  update: async (id: number, data: UpdateDomainDto) => {
    const response = await instance.patch<Domain>(`/domains/${id}`, data);
    return response.data;
  },
  remove: async (id: number) => {
    await instance.delete(`/domains/${id}`);
  },
};
