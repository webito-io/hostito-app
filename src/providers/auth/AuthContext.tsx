"use client";

import { AuthContextType } from "@/types/auth";
import { createContext, useContext } from "react";

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuthContext = () => {

    const context = useContext(AuthContext);

    if (!context) {
        throw new Error("useAuthContext must be used within an AuthProvider");
    }

    return context;
}

export default AuthContext;