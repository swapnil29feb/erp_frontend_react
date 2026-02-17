
import apiClient from '../api/apiClient';
import type { Product, Driver, Accessory, Configuration } from '../types/config';

// Helper to handle both { results: [] } and []
const handleListResponse = (res: any) => {
    if (res.data && res.data.results) return res.data.results;
    if (Array.isArray(res.data)) return res.data;
    return [];
};

export const configService = {
    getProducts: async () => {
        const res = await apiClient.get<Product[] | { results: Product[] }>('/masters/products/');
        return handleListResponse(res);
    },

    getDrivers: async () => {
        const res = await apiClient.get<Driver[] | { results: Driver[] }>('/masters/drivers/');
        return handleListResponse(res);
    },

    getAccessories: async () => {
        const res = await apiClient.get<Accessory[] | { results: Accessory[] }>('/masters/accessories/');
        return handleListResponse(res);
    },

    getCompatibleDrivers: async (configurationId: number) => {
        const res = await apiClient.get<Driver[] | { results: Driver[] }>(`/masters/drivers/compatible/?configuration=${configurationId}`);
        return handleListResponse(res);
    },

    getCompatibleAccessories: async (configurationId: number) => {
        const res = await apiClient.get<Accessory[] | { results: Accessory[] }>(`/masters/accessories/compatible/?configuration=${configurationId}`);
        return handleListResponse(res);
    },

    // New compatibility checks using product_id (for pre-save workspace)
    getCompatibleDriversByProduct: async (productId: number) => {
        const res = await apiClient.get(`/masters/drivers/compatible/?product=${productId}`);
        return Array.isArray(res.data) ? res.data : (res.data as any).results || [];
    },

    getCompatibleAccessoriesByProduct: async (productId: number) => {
        const res = await apiClient.get(`/masters/accessories/compatible/?product=${productId}`);
        return Array.isArray(res.data) ? res.data : (res.data as any).results || [];
    },

    createConfiguration: (data: any) =>
        apiClient.post<Configuration>('/configurations/save_batch/', data),

    attachDriver: (data: { configuration: number; driver: number; quantity: number }) =>
        apiClient.post('/configurations/configuration-drivers/', data),

    attachAccessory: (data: { configuration: number; accessory: number; quantity: number }) =>
        apiClient.post('/configurations/configuration-accessories/', data),

    getProjectConfigurations: async (projectId: string | number) => {
        const res = await apiClient.get(`/configurations/?project=${projectId}`);
        return handleListResponse(res);
    },

    // STEP 3: Separate configuration endpoints
    getProductConfigurations: async (projectId: string | number, subareaId?: string | number) => {
        let url = `/configurations/products/?id=${projectId}`;
        if (subareaId) {
            url += `&subarea=${subareaId}`;
        }
        const res = await apiClient.get(url);
        return handleListResponse(res);
    },

    getDriverConfigurations: async (projectId: string | number, subareaId?: string | number) => {
        console.log("projectId", projectId);
        let url = `/configurations/drivers/?id=${projectId}`;
        if (subareaId) {
            url += `&subarea=${subareaId}`;
        }
        const res = await apiClient.get(url);
        return handleListResponse(res);
    },

    getAccessoryConfigurations: async (projectId: string | number, subareaId?: string | number) => {
        let url = `/configurations/accessories/?id=${projectId}`;
        if (subareaId) {
            url += `&subarea=${subareaId}`;
        }
        const res = await apiClient.get(url);
        return handleListResponse(res);
    },

    deleteConfiguration: (id: number) =>
        apiClient.delete(`/configurations/${id}/`),
};

export async function fetchConfigurations(params: {
    projectId?: number;
    areaId?: number;
    subareaId?: number;
}) {
    if (params.subareaId) {
        return apiClient.get(`/configurations/by-subarea/${params.subareaId}/`);
    }

    if (params.areaId) {
        return apiClient.get(`/configurations/by-area/${params.areaId}/`);
    }

    if (params.projectId) {
        return apiClient.get(`/configurations/by-project/${params.projectId}/`);
    }

    return { data: [] };
}
