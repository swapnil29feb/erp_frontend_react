import api from "../api/apiClient";

export interface Accessory {
    id: number;
    accessory_name: string;
    accessory_type: string;
    description: string;
    compatible_mounting: string;
    compatible_ip_class: string;
    accessory_category: string;
    base_price: number;
    is_active: boolean;
    created_at: string;
    updated_at: string;
}

const mapToAccessory = (item: any): Accessory => ({
    id: item.acc_id || item.id,
    accessory_name: item.accessory_name || item.name || '',
    accessory_type: item.accessory_type || item.type || '',
    description: item.description || '',
    compatible_mounting: item.compatible_mounting || 'Universal',
    compatible_ip_class: item.compatible_ip_class || '',
    accessory_category: item.accessory_category || '',
    base_price: parseFloat(item.base_price || item.price || 0),
    is_active: item.is_active !== undefined ? item.is_active : true,
    created_at: item.created_at || new Date().toISOString(),
    updated_at: item.updated_at || new Date().toISOString()
});

export const accessoryService = {
    getAccessories: async (search?: string, page: number = 1, active?: boolean, pageSize: number = 20) => {
        const queryParams = new URLSearchParams();
        queryParams.append('page', page.toString());
        queryParams.append('page_size', pageSize.toString());
        if (search) queryParams.append('search', search);
        if (active !== undefined) queryParams.append('active', active.toString());

        try {
            const res = await api.get(`/masters/accessories/?${queryParams.toString()}`);
            let results: Accessory[] = [];
            let count = 0;

            if (Array.isArray(res.data)) {
                results = res.data.map(mapToAccessory);
                count = results.length;
            } else if (res.data && Array.isArray(res.data.results)) {
                results = res.data.results.map(mapToAccessory);
                count = res.data.count || results.length;
            }

            return { count, results };
        } catch (error) {
            console.error('[accessoryService] getAccessories failed:', error);
            throw error;
        }
    },

    getAccessory: async (id: number) => {
        const res = await api.get(`/masters/accessories/${id}/`);
        return mapToAccessory(res.data);
    },

    toggleStatus: async (id: number, isActive: boolean) => {
        const res = await api.patch(`/masters/accessories/${id}/`, { is_active: isActive });
        return mapToAccessory(res.data);
    },

    createAccessory: async (accessory: Partial<Accessory>) => {
        const res = await api.post(`/masters/accessories/`, accessory);
        return mapToAccessory(res.data);
    },

    updateAccessory: async (id: number, accessory: Partial<Accessory>) => {
        const res = await api.put(`/masters/accessories/${id}/`, accessory);
        return mapToAccessory(res.data);
    }
};
