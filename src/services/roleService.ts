// Role service - RBAC backend not implemented yet
// These are stub functions to prevent accidental API calls

export interface Role {
    id: number;
    name: string;
    description?: string;
    user_count?: number;
}

export interface CreateRolePayload {
    name: string;
    description?: string;
}

import apiClient from '../api/apiClient';

export const roleService = {
    async getRoles() {
        try {
            const res = await apiClient.get('/roles/');
            return res.data;
        } catch (err) {
            console.error('Failed to fetch roles', err);
            throw err;
        }
    },

    async createRole(payload: CreateRolePayload) {
        try {
            const res = await apiClient.post('/roles/', payload);
            // notify listeners that roles changed
            window.dispatchEvent(new Event('rolesChanged'));
            return res.data;
        } catch (err) {
            console.error('Failed to create role', err);
            throw err;
        }
    },

    async updateRole(id: number, payload: CreateRolePayload) {
        try {
            const res = await apiClient.patch(`/roles/${id}/`, payload);
            window.dispatchEvent(new Event('rolesChanged'));
            return res.data;
        } catch (err) {
            console.error('Failed to update role', err);
            throw err;
        }
    },

    async deleteRole(id: number) {
        try {
            const res = await apiClient.delete(`/roles/${id}/`);
            window.dispatchEvent(new Event('rolesChanged'));
            return res.data;
        } catch (err) {
            console.error('Failed to delete role', err);
            throw err;
        }
    }
};

export default roleService;
