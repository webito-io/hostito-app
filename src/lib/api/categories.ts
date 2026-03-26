import api from './instance';
import { Category, CreateCategoryDto, UpdateCategoryDto, CategoriesResponse } from '@/types/categories';

export const categoriesService = {
  findAll: async (page = 1, limit = 10) => {
    const response = await api.get<CategoriesResponse>('/categories', { params: { page, limit } });
    return response.data;
  },

  findOne: async (id: number) => {
    const response = await api.get<Category>(`/categories/${id}`);
    return response.data;
  },

  create: async (data: CreateCategoryDto) => {
    const response = await api.post<Category>('/categories', data);
    return response.data;
  },

  update: async (id: number, data: UpdateCategoryDto) => {
    const response = await api.patch<Category>(`/categories/${id}`, data);
    return response.data;
  },

  remove: async (id: number) => {
    await api.delete(`/categories/${id}`);
  },

  tree: async () => {
    const response = await api.get<Category[]>('/categories/tree');
    return response.data;
  }
};
