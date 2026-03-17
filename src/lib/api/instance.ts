import axios, { AxiosInstance } from 'axios';
import { getCookies, removeCookies } from '../cookies';

export const instance = axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_URL,
    headers: {
        'Content-Type': 'application/json',
        'X-Requested-With': 'XMLHttpRequest',
    },
});

instance.interceptors.request.use(
    (config) => {
        const token = getCookies('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

instance.interceptors.response.use(
    (response) => response,
    (error) => {
        const status = error.response?.status;

        if (status === 401) {
            removeCookies('token');
            localStorage.removeItem('user');
            if (typeof window !== 'undefined') {
                window.location.href = '/auth/login';
            }
        }

        const message = error.response?.data?.message || error.message || 'An unknown error occurred';
        return Promise.reject(new Error(message));
    }
);

export default instance as AxiosInstance;