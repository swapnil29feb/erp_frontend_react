import api from "../api/apiClient";

// Driver Interface
export interface Driver {
    id: number;
    driver_make: string;
    driver_code: string;
    max_wattage: number;
    ip_class: string;
    protocol: string;
    is_active: boolean;
    created_at?: string;
    updated_at?: string;
}

// Map backend fields to frontend model
const mapToDriver = (item: any): Driver => ({
    id: item.driver_id || item.id,
    driver_make: item.make || item.driver_make || '',
    driver_code: item.model || item.driver_code || '',
    max_wattage: Number(item.max_wattage || item.power || item.wattage || 0),
    ip_class: item.ip_rating || item.ip_class || '20',
    protocol: item.dimming_type || item.protocol || 'Non-Dimmable',
    is_active: item.is_active !== undefined ? item.is_active : true,
    created_at: item.created_at,
    updated_at: item.updated_at
});

export const driverService = {
    getDrivers: async (search?: string, page: number = 1, active?: boolean, pageSize: number = 20) => {
        const queryParams = new URLSearchParams();
        queryParams.append('page', page.toString());
        queryParams.append('page_size', pageSize.toString());
        if (search) queryParams.append('search', search);
        if (active !== undefined) queryParams.append('active', active.toString());

        console.log(`[driverService] Fetching: /masters/drivers/?${queryParams.toString()}`);

        try {
            const res = await api.get(`/masters/drivers/?${queryParams.toString()}`);
            console.log('[driverService] Raw Response:', res.data);

            let results: Driver[] = [];
            let count = 0;

            if (Array.isArray(res.data)) {
                results = res.data.map(mapToDriver);
                count = results.length;
            } else if (res.data && Array.isArray(res.data.results)) {
                results = res.data.results.map(mapToDriver);
                count = res.data.count || results.length;
            }

            return { count, results };
        } catch (error) {
            console.error('[driverService] Error:', error);
            throw error;
        }
    },

    getDriver: async (id: number) => {
        const res = await api.get(`/masters/drivers/${id}/`);
        return mapToDriver(res.data);
    },

    toggleStatus: async (id: number, isActive: boolean) => {
        const res = await api.patch(`/masters/drivers/${id}/`, { is_active: isActive });
        return mapToDriver(res.data);
    },

    createDriver: async (driver: Partial<Driver>) => {
        const res = await api.post(`/masters/drivers/`, driver);
        return mapToDriver(res.data);
    },

    updateDriver: async (id: number, driver: Partial<Driver>) => {
        const res = await api.put(`/masters/drivers/${id}/`, driver);
        return mapToDriver(res.data);
    }
};
