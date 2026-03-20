import instance from './instance';
import { CreateRoleDto, UpdateRoleDto, Role, RolesResponse, Permission } from '@/types/roles';

export const rolesService = {
  findAll: async (): Promise<RolesResponse> => {
    const response = await instance.get<RolesResponse>('/roles');
    return response.data;
  },

  findAllPermissions: async (): Promise<Permission[]> => {
    const response = await instance.get<Permission[]>('/roles/permissions');
    return response.data;
  },

  findOne: async (id: number): Promise<Role> => {
    const response = await instance.get<Role>(`/roles/${id}`);
    return response.data;
  },

  create: async (data: CreateRoleDto): Promise<Role> => {
    const response = await instance.post<Role>('/roles', data);
    return response.data;
  },

  update: async (id: number, data: UpdateRoleDto): Promise<Role> => {
    const response = await instance.patch<Role>(`/roles/${id}`, data);
    return response.data;
  },

  remove: async (id: number): Promise<void> => {
    await instance.delete(`/roles/${id}`);
  },
};
