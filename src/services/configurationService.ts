import apiClient from '../api/apiClient';

export const configurationService = {
    getConfigurationsByProject: async (projectId: number) => {
        try {
            const response = await apiClient.get(`/configurations/by-project/${projectId}/`);
            return response.data;
        } catch (error) {
            console.error('Error fetching configurations by project:', error);
            throw error;
        }
    },

    updateConfiguration: async (configId: number, data: Record<string, unknown>) => {
        try {
            const response = await apiClient.patch(`/configurations/${configId}/`, data);
            return response.data;
        } catch (error) {
            console.error('Error updating configuration:', error);
            throw error;
        }
    }
};

export default configurationService;
