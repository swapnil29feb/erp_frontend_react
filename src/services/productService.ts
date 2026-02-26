import api from "../api/apiClient";

export interface Product {
    id: number;
    make: string;
    order_code: string;
    wattage: number;
    lumen_output: number;
    cct: number;
    cri: number;
    beam_angle: number;
    ip_rating: number;
    dimming: string;
    diameter_mm: number;
    cutout_mm: number;
    base_price: number;
    description: string;
    is_active: boolean;
    created_at: string;
    updated_at: string;
    image?: string;
    visual_image?: string;
    illustrative_details?: string;
    photometrics?: string;
    audit_logs?: Array<{
        action: string;
        user: string;
        timestamp: string;
    }>;
    cct_kelvin?: number;
    beam_angle_degree?: number;
}

const mapToProduct = (item: any): Product => ({
    id: item.prod_id || item.id,
    make: item.make || '',
    order_code: item.order_code || '',
    wattage: Number(item.wattage || 0),
    lumen_output: Number(item.lumen_output || 0),
    cct: Number(item.cct || 0),
    cri: Number(item.cri || 0),
    beam_angle: Number(item.beam_angle || 0),
    ip_rating: Number(item.ip_rating || 20),
    dimming: item.dimming || 'Non-Dimmable',
    diameter_mm: Number(item.diameter_mm || 0),
    cutout_mm: Number(item.cutout_mm || 0),
    base_price: parseFloat(item.base_price || item.price || 0),
    description: item.description || '',
    is_active: item.is_active !== undefined ? item.is_active : true,
    created_at: item.created_at || new Date().toISOString(),
    updated_at: item.updated_at || new Date().toISOString(),
    image: item.image,
    visual_image: item.visual_image || item.image || '',
    cct_kelvin: item.cct_kelvin || Number(item.cct || 0),
    beam_angle_degree: item.beam_angle_degree || Number(item.beam_angle || 0)
});

const BASE_URL = "/masters/products/";

export const productService = {
    getProducts: async (search?: string, page: number = 1, active?: boolean, pageSize: number = 20) => {
        const queryParams = new URLSearchParams();
        queryParams.append('page', page.toString());
        queryParams.append('page_size', pageSize.toString());
        if (search) queryParams.append('search', search);
        if (active !== undefined) queryParams.append('active', active.toString());

        try {
            const res = await api.get(`${BASE_URL}?${queryParams.toString()}`);
            let results: Product[] = [];
            let count = 0;

            if (Array.isArray(res.data)) {
                results = res.data.map(mapToProduct);
                count = results.length;
            } else if (res.data && Array.isArray(res.data.results)) {
                results = res.data.results.map(mapToProduct);
                count = res.data.count || results.length;
            }

            return { count, results };
        } catch (error) {
            console.error('[productService] Error:', error);
            throw error;
        }
    },

    getProduct: async (id: number) => {
        const res = await api.get(`${BASE_URL}${id}/`);
        return mapToProduct(res.data);
    },

    toggleStatus: async (id: number, isActive: boolean) => {
        const res = await api.patch(`${BASE_URL}${id}/`, { is_active: isActive });
        return mapToProduct(res.data);
    },

    createProduct: async (product: any) => {
        const formData = new FormData();

        Object.keys(product).forEach((key) => {
            const value = product[key];

            if (value !== null && value !== undefined) {
                formData.append(key, value);
            }
        });

        const res = await api.post(BASE_URL, formData, {
            headers: { "Content-Type": "multipart/form-data" }
        });

        return mapToProduct(res.data);
    },

    updateProduct: async (id: number, data: any) => {
        const formData = new FormData();

        Object.keys(data).forEach((key) => {
            const value = data[key];
            if (value !== undefined && value !== null) {
                formData.append(key, value);
            }
        });

        console.log("PATCH URL:", `${BASE_URL}${id}/`);

        return api.patch(`${BASE_URL}${id}/`, formData, {
            headers: {
                "Content-Type": "multipart/form-data",
            },
        }).then(res => mapToProduct(res.data));
    },

    deleteProduct: async (id: number) => {
        await api.delete(`${BASE_URL}${id}/`);
    },

    getProductDetails: async (id: number) => {
        const response = await api.get(`${BASE_URL}${id}/`);
        return response.data;
    }
};

export const getProductDetails = async (id: number) => {
    const response = await api.get(`/masters/products/${id}/`);
    return response.data;
};
