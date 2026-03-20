'use client'

import { authService } from "@/lib/api/auth";
import { useMemo, useState } from "react";
import AuthContext from "./AuthContext";
import { RegisterUser } from "@/types/auth";
import { useEffect } from "react";
import { getCookies, removeCookies, setCookies } from "@/lib/cookies";
import { useCallback } from "react";
import { useRouter } from "next/navigation";


export const AuthProvider = ({ children }: { children: React.ReactNode }) => {

    const [user, setUser] = useState<any>();
    const [loading, setLoading] = useState<boolean>(true);

    const router = useRouter();

    const meHandler = useCallback(async () => {
        const token = await getCookies('token') as string;
        if (!token) {
            setUser(null);
            localStorage.removeItem('user');
            return null;
        }
        try {
            const response = await authService.me();
            setUser(response);
            localStorage.setItem('user', JSON.stringify(response));
            return response;
        } catch (error) {
            setUser(null);
            localStorage.removeItem('user');
            removeCookies('token');
            return null;
        }
    }, []);

    useEffect(() => {
        const init = async () => {
            const cachedUser = localStorage.getItem('user');
            if (cachedUser) setUser(JSON.parse(cachedUser));

            await meHandler();
            setLoading(false);
        };

        init();
    }, [meHandler]);

    const loginHandler = async (email: string, password: string) => {

        const response = await authService.login({ email, password });

        setCookies('token', response.access_token)

        localStorage.setItem('user', JSON.stringify(response.user));

        setUser(response.user);

    };

    const registerHandler = async (user: RegisterUser) => {

        const response = await authService.register(user);

        setCookies('token', response.access_token)

        localStorage.setItem('user', JSON.stringify(response.user));

        setUser(response.user);
    };

    const forgotPasswordHandler = async (email: string) => {
        return await authService.forgotPassword(email);
    };

    const resetPasswordHandler = async (token: string, password: string) => {
        return await authService.resetPassword(token, password);
    };

    const verifyEmailHandler = async (token: string) => {
        return await authService.verifyEmail(token);
    };

    const resendVerificationEmailHandler = async () => {
        return await authService.resendVerificationEmail(user?.email);
    };

    const logoutHandler = async () => {
        removeCookies('token');
        localStorage.removeItem('user');
        setUser(null);
        router.push('/auth/login');
    };



    const auth = useMemo(() => {
        return {
            user,
            login: loginHandler,
            register: registerHandler,
            forgotPassword: forgotPasswordHandler,
            resetPassword: resetPasswordHandler,
            verifyEmail: verifyEmailHandler,
            resendVerificationEmail: resendVerificationEmailHandler,
            logout: logoutHandler,
            refresh: meHandler,
            loading,
        }
    }, [user, loginHandler, registerHandler, forgotPasswordHandler, resetPasswordHandler, verifyEmailHandler, logoutHandler, meHandler]);

    return (
        <AuthContext.Provider value={auth} >
            {children}
        </AuthContext.Provider>
    )
}       