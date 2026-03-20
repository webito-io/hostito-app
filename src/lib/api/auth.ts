import { LoginUser, RegisterUser, User } from '@/types/auth';
import instance from './instance';

export const authService = {
  login: async (data: LoginUser) => {
    const response = await instance.post('/auth/login', data);
    return response.data;
  },

  register: async (data: RegisterUser) => {
    const response = await instance.post('/auth/register', data);
    return response.data;
  },

  forgotPassword: async (email: string) => {
    const response = await instance.post('/auth/forgot-password', { email });
    return response.data;
  },

  resetPassword: async (token: string, password: string) => {
    const response = await instance.post('/auth/reset-password', { token, password });
    return response.data;
  },

  verifyEmail: async (token: string) => {
    const response = await instance.post('/auth/verify-email', { token });
    return response.data;
  },

  resendVerificationEmail: async (email: string) => {
    const response = await instance.post('/auth/resend-verification-email', { email });
    return response.data;
  },

  me: async (): Promise<User> => {
    const response = await instance.get<User>('/auth/me');
    return response.data;
  },
};