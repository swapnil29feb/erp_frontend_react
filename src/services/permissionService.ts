import apiClient from '../api/apiClient';

export interface Permission {
    id: number;
    module: string;
    can_view: boolean;
    can_create: boolean;
    can_edit: boolean;
    can_delete: boolean;
    can_approve: boolean;
    can_export: boolean;
}

export interface PermissionMatrixUpdate {
    role_id: number;
    permissions: {
        module: string;
        can_view: boolean;
        can_create: boolean;
        can_edit: boolean;
        can_delete: boolean;
        can_approve: boolean;
        can_export: boolean;
    }[];
}

export const permissionService = {
    async getPermissionsByRole(roleId: number) {
        try {
            // Preferred: per-role endpoint
            const res = await apiClient.get(`/roles/${roleId}/permissions/`);
            return res.data;
        } catch (err) {
            // Fallback to generic permissions endpoint
            const response = await apiClient.get(`/permissions/?role_id=${roleId}`);
            return response.data;
        }
    },

    async updatePermissions(payload: PermissionMatrixUpdate) {
        try {
            // Preferred: update via role-specific endpoint
            const res = await apiClient.put(`/roles/${payload.role_id}/permissions/`, { permissions: payload.permissions });
            return res.data;
        } catch (err) {
            // Fallback to legacy endpoint
            const response = await apiClient.post('/permissions/update/', payload);
            return response.data;
        }
    }
};
