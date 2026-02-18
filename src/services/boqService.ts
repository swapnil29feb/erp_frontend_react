import apiClient from '../api/apiClient';

export const boqService = {
    getVersions: async (projectId: number | string) => {
        try {
            const response = await apiClient.get(`/boq/versions/${projectId}/`);
            return response.data;
        } catch (error) {
            console.error('Error fetching BOQ versions:', error);
            throw error;
        }
    },

    getBOQSummaryDetail: async (boqId: number | string) => {
        try {
            const response = await apiClient.get(`/boq/summary/detail/${boqId}/`);
            return response.data;
        } catch (error: any) {
            if (error?.response?.status === 404) {
                return null;
            }
            throw error;
        }
    },

    applyMargin: async (boqId: number | string, percent: number) => {
        try {
            const response = await apiClient.post(`/boq/apply-margin/${boqId}/`, {
                markup_pct: percent   // ✅ correct key
            });
            return response.data;
        } catch (error) {
            console.error('Error applying margin:', error);
            throw error;
        }
    },

    approveBOQ: async (boqId: number | string) => {
        try {
            const response = await apiClient.post(`/boq/approve/${boqId}/`);
            return response.data;
        } catch (error) {
            console.error('Error approving BOQ:', error);
            throw error;
        }
    },

    exportPDF: async (boqId: number | string) => {
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

    exportExcel: async (boqId: number | string) => {
        try {
            const response = await apiClient.get(`/boq/export/excel/${boqId}/`, {
                responseType: 'blob'
            });
            return response.data;
        } catch (error) {
            console.error('Error exporting BOQ Excel:', error);
            throw error;
        }
    },

    generateBOQ: async (projectId: number | string) => {
        try {
            const response = await apiClient.post(`/boq/generate/${projectId}/`, {});
            return response.data;
        } catch (error: any) {
            console.error('Error generating BOQ:', error?.response?.data || error);
            throw error?.response?.data || error;
        }
    },

    getSummary: async (projectId: number | string) => {
        try {
            const response = await apiClient.get(`/boq/summary/${projectId}/`);
            return response.data;
        } catch (error) {
            console.error('Error fetching BOQ summary:', error);
            throw error;
        }
    },

    // Maintaining for Project list count compatibility
    fetchBoqCount: async (projectId: number | string): Promise<number> => {
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
