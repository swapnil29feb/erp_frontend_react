export interface Project {
    id: number;
    name: string;
    client_name: string;
    status: string;
    segment_area: string;
    inquiry_type: 'AREA_WISE' | 'PROJECT_LEVEL';
    location_metadata?: {
        address?: string;
    };
    created_at: string;
    boqCount?: number;
}

export interface Area {
    id: number;
    project: number;
    name: string;
    area_code: string;
    floor?: string;
    area_type?: string;
}

export interface Subarea {
    id: number;
    area: number;
    name: string;
}
