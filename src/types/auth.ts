export interface AuthContextType {
    user: User | null;
    login: (email: string, password: string) => Promise<void>;
    register: (user: RegisterUser) => Promise<void>;
    forgotPassword: (email: string) => Promise<void>;
    resetPassword: (token: string, password: string) => Promise<void>;
    verifyEmail: (token: string) => Promise<void>;
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
    createdAt: string;
    updatedAt: string;
}

export interface RegisterUser {
    firstName?: string;
    lastName?: string;
    email: string;
    password: string;
}