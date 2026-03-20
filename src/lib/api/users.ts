import instance from './instance';
import { CreateUserDto, UpdateUserDto, User, UsersResponse } from '@/types/users';

export const usersService = {
  findAll: async (page = 1, limit = 10): Promise<UsersResponse> => {
    const response = await instance.get<UsersResponse>('/users', {
      params: { page, limit },
    });
    return response.data;
  },

  findOne: async (id: number): Promise<User> => {
    const response = await instance.get<User>(`/users/${id}`);
    return response.data;
  },

  create: async (data: CreateUserDto): Promise<User> => {
    const response = await instance.post<User>('/users', data);
    return response.data;
  },

  update: async (id: number, data: UpdateUserDto): Promise<User> => {
    const response = await instance.patch<User>(`/users/${id}`, data);
    return response.data;
  },

  remove: async (id: number): Promise<void> => {
    await instance.delete(`/users/${id}`);
  },
};
