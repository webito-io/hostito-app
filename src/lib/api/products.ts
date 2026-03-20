import instance from './instance';
import { CreateProductDto, UpdateProductDto, Product, ProductsResponse } from '@/types/products';

export const productsService = {
  findAll: async (page = 1, limit = 10): Promise<ProductsResponse> => {
    const response = await instance.get<ProductsResponse>('/products', {
      params: { page, limit },
    });
    return response.data;
  },

  findOne: async (id: number): Promise<Product> => {
    const response = await instance.get<Product>(`/products/${id}`);
    return response.data;
  },

  create: async (data: CreateProductDto): Promise<Product> => {
    const response = await instance.post<Product>('/products', data);
    return response.data;
  },

  update: async (id: number, data: UpdateProductDto): Promise<Product> => {
    const response = await instance.patch<Product>(`/products/${id}`, data);
    return response.data;
  },

  remove: async (id: number): Promise<void> => {
    await instance.delete(`/products/${id}`);
  },
};
