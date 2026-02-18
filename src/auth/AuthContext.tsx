import { createContext, useContext, useState, useEffect, type ReactNode, type FC } from 'react';
import api from '../api/apiClient';
import type { User, AuthResponse } from '../types/user';

interface AuthContextType {
    user: User | null;
    accessToken: string | null;
    isAuthenticated: boolean;
    loading: boolean;
    login: (username: string, password: string) => Promise<void>;
    logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: FC<{ children: ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [accessToken, setAccessToken] = useState<string | null>(localStorage.getItem('access_token'));
    const [isAuthenticated, setIsAuthenticated] = useState<boolean>(!!localStorage.getItem('access_token'));
    const [loading, setLoading] = useState<boolean>(true);

    useEffect(() => {
        const token = localStorage.getItem('access_token');
        if (token) {
            setAccessToken(token);
            setIsAuthenticated(true);
        } else {
            setIsAuthenticated(false);
        }
        setLoading(false);
    }, []);

    const login = async (username: string, password: string) => {
        try {
            const response = await api.post<AuthResponse>('/auth/login/', {
                username,
                password,
            });

            // Expected response: { access, refresh, user }
            const { access, refresh, user } = response.data;

            if (access) {
                localStorage.setItem('access_token', access);
                setAccessToken(access);
                setIsAuthenticated(true);
            }

            if (refresh) {
                localStorage.setItem('refresh_token', refresh);
            }

            if (user) {
                setUser(user);
                // Optionally store user details in local storage if needed for persistence
                localStorage.setItem('user_details', JSON.stringify(user));
            }

        } catch (error) {
            console.error("Login failed", error);
            throw error;
        }
    };

    const logout = () => {
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        setAccessToken(null);
        setIsAuthenticated(false);
        setUser(null);
        window.location.href = '/login';
    };

    return (
        <AuthContext.Provider value={{ user, accessToken, isAuthenticated, loading, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = (): AuthContextType => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
