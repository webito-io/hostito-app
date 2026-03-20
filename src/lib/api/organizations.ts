import instance from './instance';
import { CreateOrganizationDto, UpdateOrganizationDto, Organization, OrganizationsResponse } from '@/types/organizations';

export const organizationsService = {
  findAll: async (page = 1, limit = 10): Promise<OrganizationsResponse> => {
    const response = await instance.get<OrganizationsResponse>('/organizations', {
      params: { page, limit },
    });
    return response.data;
  },

  findOne: async (id: number): Promise<Organization> => {
    const response = await instance.get<Organization>(`/organizations/${id}`);
    return response.data;
  },

  create: async (data: CreateOrganizationDto): Promise<Organization> => {
    const response = await instance.post<Organization>('/organizations', data);
    return response.data;
  },

  update: async (id: number, data: UpdateOrganizationDto): Promise<Organization> => {
    const response = await instance.patch<Organization>(`/organizations/${id}`, data);
    return response.data;
  },

  remove: async (id: number): Promise<void> => {
    await instance.delete(`/organizations/${id}`);
  },
};
