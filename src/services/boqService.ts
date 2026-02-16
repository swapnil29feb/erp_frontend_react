import apiClient from '../api/apiClient';

export const boqService = {
    getBOQVersions: async (projectId: number) => {
        try {
            const response = await apiClient.get(`/boq/versions/${projectId}/`);
            return response.data;
        } catch (error) {
            console.error('Error fetching BOQ versions:', error);
            throw error;
        }
    },

    generateBOQ: async (projectId: number) => {
        try {
            // Ensure empty body is passed for POST request to avoid 411 Length Required or similar issues
            // standard axios post(url, data, config)
            const response = await apiClient.post(`/boq/generate/${projectId}/`, {});
            return response.data;
        } catch (error: any) {
            console.error('Error generating BOQ:', error?.response?.data || error);
            throw error?.response?.data || error;
        }
    },

    getBOQDetail: async (boqId: number) => {
        try {
            const response = await apiClient.get(`/boq/summary/detail/${boqId}/`);
            return response.data;
        } catch (error: any) {
            if (error?.response?.status === 404) {
                return null; // BOQ not found
            }
            console.error('Error fetching BOQ detail:', error);
            throw error;
        }
    },

    getLatestBOQ: async (projectId: number) => {
        try {
            const response = await apiClient.get(`/boq/summary/${projectId}/`);
            return response.data;
        } catch (error: any) {
            if (error?.response?.status === 404) {
                return null; // No BOQ generated yet
            }
            console.error('Error fetching latest BOQ summary:', error);
            throw error;
        }
    },

    applyMargin: async (boqId: number, margin: number) => {
        try {
            const response = await apiClient.post(`/boq/${boqId}/apply-margin/`, { markup_pct: margin });
            return response.data;
        } catch (error) {
            console.error('Error applying margin:', error);
            throw error;
        }
    },

    approveBOQ: async (boqId: number) => {
        try {
            const response = await apiClient.post(`/boq/${boqId}/approve/`);
            return response.data;
        } catch (error) {
            console.error('Error approving BOQ:', error);
            throw error;
        }
    },

    exportBOQExcel: async (boqId: number) => {
        try {
            const response = await apiClient.get(`/boq/${boqId}/export-excel/`, {
                responseType: 'blob'
            });
            return response.data;
        } catch (error) {
            console.error('Error exporting BOQ Excel:', error);
            throw error;
        }
    },

    exportPDF: async (boqId: number) => {
        try {
            const response = await apiClient.get(`/boq/export/pdf/${boqId}/`, {
                responseType: 'blob'
            });
            return response.data;
        } catch (error) {
            console.error('Error exporting PDF:', error);
            throw error;
        }
    },

    // Keep legacy exportExcel for now or update it in codebase
    exportExcel: async (boqId: number) => {
        return boqService.exportBOQExcel(boqId);
    },

    updateItemPrice: async (boqItemId: number, price: number) => {
        try {
            const response = await apiClient.patch(`/boq/items/${boqItemId}/price/`, {
                unit_price: price
            });
            return response.data;
        } catch (error) {
            console.error('Error updating item price:', error);
            throw error;
        }
    },

    getSummary: async (projectId: number) => {
        try {
            const response = await apiClient.get(`/boq/summary/${projectId}/`);
            return response.data;
        } catch (error) {
            console.error('Error fetching BOQ summary by project:', error);
            throw error;
        }
    },

    fetchBoqCount: async (projectId: number): Promise<number> => {
        try {
            const response = await apiClient.get(`/boq/versions/${projectId}/`);
            const data = response.data;
            return Array.isArray(data) ? data.length : 0;
        } catch (error) {
            console.error('Error fetching BOQ count:', error);
            return 0;
        }
    }
};

export default boqService;
