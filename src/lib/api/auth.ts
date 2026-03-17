import { RegisterUser } from "@/types/auth";
import instance from "./instance";

export async function login(email: string, password: string) {
    const res = await instance.post('/auth/login', {
        email,
        password,
    });
    return res.data;
}

export async function register(user: RegisterUser) {
    const res = await instance.post('/auth/register', {
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        password: user.password,
    });
    return res.data;
}

export async function forgotPassword(email: string) {
    const res = await instance.post('/auth/forgot-password', {
        email,
    });
    return res.data;
}

export async function resetPassword(token: string, password: string) {
    const res = await instance.post('/auth/reset-password', {
        token,
        password,
    });
    return res.data;
}

export async function verifyEmail(token: string) {
    const res = await instance.post('/auth/verify-email', {
        token,
    });
    return res.data;
}

export async function resendVerificationEmail(email: string) {
    const res = await instance.post('/auth/resend-verification-email', {
        email,
    });
    return res.data;
}

export async function me(token: string) {
    const response = await instance.get('/auth/me', {
        headers: {
            'Authorization': `Bearer ${token}`,
        },
    });
    return response.data;
}