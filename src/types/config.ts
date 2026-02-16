
export interface Product {
    prod_id: number;
    make: string;
    order_code: string;
    mounting_style: string;
    wattage: number;
    lumen_output: number;
    price: number;
    base_price?: number;
}

export interface Driver {
    driver_id: number;
    driver_code: string;
    make: string;
    order_code: string;
    max_wattage: number;
    dimming_protocol: string;
    price: number;
}

export interface Accessory {
    accessory_id: number;
    make: string;
    order_code: string;
    accessory_type: string;
    accessory_category: string;
    price: number;
}

export interface Configuration {
    id: number;
    area: number | null;
    subarea: number | null;
    product: number;
    quantity: number;
    created_at: string;
}

export interface BoqSummary {
    project_id: number;
    total_luminaires: number;
    total_drivers: number;
    total_accessories: number;
    total_cost: number;
}

export interface BoqVersion {
    id: number;
    version_number: number;
    status: 'DRAFT' | 'APPROVED';
    is_locked: boolean;
    created_at: string;
}
