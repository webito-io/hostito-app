'use client'

import { useMemo, useState } from "react";
import AuthContext from "./AuthContext";

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {


    const [user, setUser] = useState<any>(null);

    const login = async (email: string, password: string) => {
        setUser({ email, password });
    };

    const register = async (email: string, password: string) => {
        setUser({ email, password });
    };

    const forgotPassword = async (email: string) => {
        setUser({ email });
    };

    const resetPassword = async (token: string, password: string) => {
        setUser({ token, password });
    };

    const verifyEmail = async (token: string) => {
        setUser({ token });
    };

    const logout = async () => {
        setUser(null);
    };


    const auth = useMemo(() => {
        return {
            user,
            login,
            register,
            forgotPassword,
            resetPassword,
            verifyEmail,
            logout,
        }
    }, [user, login, register, forgotPassword, resetPassword, verifyEmail, logout]);

    return (
        <AuthContext.Provider value={auth} >
            {children}
        </AuthContext.Provider>
    )
}       