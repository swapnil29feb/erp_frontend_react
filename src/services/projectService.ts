import apiClient from '../api/apiClient';

const PROJECT_BASE = "/projects/projects/";
const AREA_BASE = "/projects/areas/";
const SUBAREA_BASE = "/projects/subareas/";

export interface Subarea {
    id: number;
    name: string;
    area: number;
    description?: string;
}

export interface Area {
    id: number;
    name: string;
    project: number;
    floor_number?: string;
    area_type?: string;
    subareas?: Subarea[];
}

export interface Project {
    id: number;
    name: string;
    project_code: string;
    client_name: string;
    address?: string;
    status: string;
    areas?: Area[];
    created_at?: string;
    updated_at?: string;
}

export const projectService = {
    // PROJECTS
    getProjects: async () => {
        const response = await apiClient.get(PROJECT_BASE);
        return response.data;
    },

    getProject: async (id: number) => {
        const response = await apiClient.get(`${PROJECT_BASE}${id}/`);
        return response.data;
    },

    createProject: async (data: Partial<Project>) => {
        const response = await apiClient.post(PROJECT_BASE, data);
        return response.data;
    },

    updateProject: async (id: number, data: Partial<Project>) => {
        const response = await apiClient.patch(`${PROJECT_BASE}${id}/`, data);
        return response.data;
    },

    deleteProject: async (id: number) => {
        await apiClient.delete(`${PROJECT_BASE}${id}/`);
    },

    // AREAS
    getAreas: async (projectId?: number) => {
        const params = projectId ? { project: projectId } : {};
        const response = await apiClient.get(AREA_BASE, { params });
        return response.data;
    },

    createArea: async (data: Partial<Area>) => {
        const response = await apiClient.post(AREA_BASE, data);
        return response.data;
    },

    updateArea: async (id: number, data: Partial<Area>) => {
        const response = await apiClient.patch(`${AREA_BASE}${id}/`, data);
        return response.data;
    },

    deleteArea: async (id: number) => {
        await apiClient.delete(`${AREA_BASE}${id}/`);
    },

    // SUBAREAS
    getSubareas: async (areaId?: number) => {
        const params = areaId ? { area: areaId } : {};
        const response = await apiClient.get(SUBAREA_BASE, { params });
        return response.data;
    },

    createSubarea: async (data: Partial<Subarea>) => {
        const response = await apiClient.post(SUBAREA_BASE, data);
        return response.data;
    },

    updateSubarea: async (id: number, data: Partial<Subarea>) => {
        const response = await apiClient.patch(`${SUBAREA_BASE}${id}/`, data);
        return response.data;
    },

    deleteSubarea: async (id: number) => {
        await apiClient.delete(`${SUBAREA_BASE}${id}/`);
    }
};

export default projectService;
