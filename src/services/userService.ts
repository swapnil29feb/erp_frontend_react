// User service - RBAC backend not implemented yet
// These are stub functions to prevent accidental API calls

export interface User {
    id: number;
    username: string;
    email: string;
    first_name: string;
    last_name: string;
    is_active: boolean;
    last_login?: string;
    groups?: number[];
    role_name?: string;
}

export interface CreateUserPayload {
    username: string;
    email: string;
    password: string;
    first_name: string;
    last_name: string;
    is_active: boolean;
    groups?: number[];
}

export interface UpdateUserPayload {
    email?: string;
    first_name?: string;
    last_name?: string;
    is_active?: boolean;
    groups?: number[];
}

import apiClient from '../api/apiClient';

export const userService = {
    async getUsers() {
        try {
            const res = await apiClient.get('/users/');
            return res.data;
        } catch (err) {
            console.error('Failed to fetch users', err);
            throw err;
        }
    },

    async createUser(payload: CreateUserPayload) {
        try {
            const res = await apiClient.post('/users/', payload);
            return res.data;
        } catch (err) {
            console.error('Failed to create user', err);
            throw err;
        }
    },

    async updateUser(id: number, payload: UpdateUserPayload) {
        try {
            const res = await apiClient.patch(`/users/${id}/`, payload);
            return res.data;
        } catch (err) {
            console.error('Failed to update user', err);
            throw err;
        }
    },

    async deleteUser(id: number) {
        try {
            const res = await apiClient.delete(`/users/${id}/`);
            return res.data;
        } catch (err) {
            console.error('Failed to delete user', err);
            throw err;
        }
    },

    async resetPassword(id: number, newPassword: string) {
        try {
            // attempt a common reset endpoint, fallback to patch
            try {
                const res = await apiClient.post(`/users/${id}/reset_password/`, { password: newPassword });
                return res.data;
            } catch (e) {
                // fallback to patching password
                const res = await apiClient.patch(`/users/${id}/`, { password: newPassword });
                return res.data;
            }
        } catch (err) {
            console.error('Failed to reset password', err);
            throw err;
        }
    }
};
