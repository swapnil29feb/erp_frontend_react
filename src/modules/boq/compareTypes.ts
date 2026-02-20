
export interface RawBOQCompareItem {
    product_id: number;
    product_name: string | null;
    area_name: string | null;
    status: "ADDED" | "REMOVED" | "MODIFIED" | "UNCHANGED";
    old: {
        quantity: number;
        unit_price: number;
        final_price: number;
    } | null;
    new: {
        quantity: number;
        unit_price: number;
        final_price: number;
    } | null;
}

export interface BOQCompareResponse {
    version_1: number;
    version_2: number;
    header_diff: {
        subtotal: {
            old: number;
            new: number;
            difference: number;
        };
        grand_total: {
            old: number;
            new: number;
            difference: number;
        };
    };
    items: RawBOQCompareItem[];
}

export interface BOQCompareItem {
    key: number | string;
    area: string;
    product: string;
    driver?: string | null;
    status: "ADDED" | "REMOVED" | "MODIFIED" | "UNCHANGED";
    qty_v1: number;
    qty_v2: number;
    price_v1: number;
    price_v2: number;
    total_v1: number;
    total_v2: number;
    difference: number;
}
export interface BOQVersion {
  id: number;
  version: number;
  status: string;
}