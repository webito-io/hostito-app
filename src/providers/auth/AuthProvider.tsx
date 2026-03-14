'use client'

import { forgotPassword, login, register, resetPassword, verifyEmail } from "@/lib/api/auth";
import { useMemo, useState } from "react";
import AuthContext from "./AuthContext";
import { RegisterUser } from "@/types/auth";
import { useEffect } from "react";

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {

    const [user, setUser] = useState<any>();
    const [loading, setLoading] = useState<boolean>(true);

    useEffect(() => {
        try {
            // @ts-ignore
            setUser(JSON.parse(localStorage.getItem('user')));
            setLoading(false);
        } catch (error) {
            setLoading(false);
        }

        return () => {
            setLoading(false);
            setUser(null);
        }
    }, []);

    const loginHandler = async (email: string, password: string) => {
        const response = await login(email, password);
        localStorage.setItem('token', response.access_token);
        localStorage.setItem('user', JSON.stringify(response.user));
        setUser(response.user);
    };

    const registerHandler = async (user: RegisterUser) => {
        const response = await register(user);
        localStorage.setItem('token', response.access_token);
        localStorage.setItem('user', JSON.stringify(response.user));
        setUser(response.user);
    };

    const forgotPasswordHandler = async (email: string) => {
        return await forgotPassword(email);
    };

    const resetPasswordHandler = async (token: string, password: string) => {
        return await resetPassword(token, password);
    };

    const verifyEmailHandler = async (token: string) => {
        return await verifyEmail(token);
    };

    const logoutHandler = async () => {
        localStorage.removeItem('token');
        setUser(null);
    };


    const auth = useMemo(() => {
        return {
            user,
            login: loginHandler,
            register: registerHandler,
            forgotPassword: forgotPasswordHandler,
            resetPassword: resetPasswordHandler,
            verifyEmail: verifyEmailHandler,
            logout: logoutHandler,
            loading,
        }
    }, [user, loginHandler, registerHandler, forgotPasswordHandler, resetPasswordHandler, verifyEmailHandler, logoutHandler]);

    return (
        <AuthContext.Provider value={auth} >
            {children}
        </AuthContext.Provider>
    )
}       