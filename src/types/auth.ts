export interface AuthContextType {
    user: User | null;
    login: (email: string, password: string) => Promise<void>;
    register: (user: RegisterUser) => Promise<void>;
    forgotPassword: (email: string) => Promise<void>;
    resetPassword: (token: string, password: string) => Promise<void>;
    verifyEmail: (token: string) => Promise<void>;
    resendVerificationEmail: () => Promise<void>;
    refresh: () => Promise<User | null>;
    logout: () => Promise<void>;
    loading: boolean;
}

export interface AuthError {
    message: string;
}

export interface User {
    id: string;
    firstName: string;
    lastName: string;
    phone: string;
    email: string;
    roleId: number;
    organizationId: number;
    emailVerified: boolean;
    status: string;
    role?: { id: number; name: string };
    organization?: {
        id: number;
        name: string;
        currency?: { id: number; code: string; name: string; symbol: string; rate: number; isDefault: boolean; isActive: boolean };
    };
    createdAt: string;
    updatedAt: string;
}

export interface RegisterUser {
    firstName?: string;
    lastName?: string;
    email: string;
    password: string;
}

export interface LoginUser {
    email: string;
    password: string;
}