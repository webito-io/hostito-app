import axios, { AxiosInstance } from 'axios';

export const instance = axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

instance.interceptors.response.use(
    (response) => response,
    (error) => {
        const message = error.response?.data?.message || error.message || 'An unknown error occurred';

        return Promise.reject(new Error(message));
    }
);

export default instance as AxiosInstance;