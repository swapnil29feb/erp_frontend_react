
export interface BOQCompareItem {
    area: string;
    product: string;
    driver?: string;
    accessories?: string;
    qty_v1: number;
    qty_v2: number;
    price_v1: number;
    price_v2: number;
    total_v1: number;
    total_v2: number;
    difference: number;
}

export interface BOQCompareResponse {
    version_1: number;
    version_2: number;
    items: BOQCompareItem[];
    summary: {
        total_v1: number;
        total_v2: number;
        difference: number;
    };
}

export interface BOQVersion {
    id: number;
    version: number;
    status: string;
}
