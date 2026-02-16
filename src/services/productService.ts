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

export const productService = {
    getProducts: async (search?: string, page: number = 1, active?: boolean, pageSize: number = 20) => {
        const queryParams = new URLSearchParams();
        queryParams.append('page', page.toString());
        queryParams.append('page_size', pageSize.toString());
        if (search) queryParams.append('search', search);
        if (active !== undefined) queryParams.append('active', active.toString());

        console.log(`[productService] Fetching: /masters/products/?${queryParams.toString()}`);

        try {
            const res = await api.get(`/masters/products/?${queryParams.toString()}`);
            console.log('[productService] Raw Response:', res.data);

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
        const res = await api.get(`/masters/products/${id}/`);
        return mapToProduct(res.data);
    },

    toggleStatus: async (id: number, isActive: boolean) => {
        const res = await api.patch(`/masters/products/${id}/`, { is_active: isActive });
        return mapToProduct(res.data);
    },
createProduct: async (product: Partial<Product>) => {
    const form = new FormData();

    Object.entries(product).forEach(([key, value]) => {
        if (value === "" || value === undefined || value === null) return;

        // convert numeric strings to number-like
        if (!isNaN(value as any) && value !== true && value !== false) {
            form.append(key, String(Number(value)));
        } else if ((value as any)?.file?.originFileObj) {
            // antd Upload component
            form.append(key, (value as any).file.originFileObj);
        } else {
            form.append(key, value as any);
        }
    });

    const res = await api.post(`/masters/products/`, form, {
        headers: { "Content-Type": "multipart/form-data" }
    });

    return mapToProduct(res.data);
},


  updateProduct: async (id: number, product: Partial<Product>) => {
    const form = new FormData();

    Object.entries(product).forEach(([key, value]) => {
        if (value === "" || value === undefined || value === null) return;

        if (!isNaN(value as any) && value !== true && value !== false) {
            form.append(key, String(Number(value)));
        } else if ((value as any)?.file?.originFileObj) {
            form.append(key, (value as any).file.originFileObj);
        } else {
            form.append(key, value as any);
        }
    });

    const res = await api.patch(`/masters/products/${id}/`, form, {
        headers: { "Content-Type": "multipart/form-data" }
    });

    return mapToProduct(res.data);
},

};
