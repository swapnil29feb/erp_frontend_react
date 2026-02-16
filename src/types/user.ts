export type User = {
    id: number;
    username: string;
    email?: string;
    first_name?: string;
    last_name?: string;
    role?: string;
    permissions?: string[];
}

export type AuthResponse = {
    access: string;
    refresh: string;
}

export const AUTH_VERSION = '1.0';
