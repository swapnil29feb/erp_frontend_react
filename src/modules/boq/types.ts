
export interface BOQVersion {
    id: number;
    version: number;
    status: string;
    created_at: string;
}

export interface BOQItem {
    id: number;
    area: string;
    item_type?: 'Product' | 'Driver' | 'Accessory' | string;
    item_name?: string;
    product?: string; // Fallback for old schema
    driver?: string;
    accessories?: string;
    qty: number;
    unit_price: number;
    total: number;
    unit_rate?: number; // Backend usually uses unit_rate for component rate
}

export interface BOQSummary {
    subtotal: number;
    margin_percent: number;
    grand_total: number;
}
