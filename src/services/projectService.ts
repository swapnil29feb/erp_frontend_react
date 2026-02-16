import apiClient from '../api/apiClient';

export interface ProjectSearchResult {
    id: number;
    name: string;
    project_code: string;
    client_name: string;
    status: string;
}

export const projectService = {
    /**
     * Search projects by text query.
     * GET /api/projects/search/?q={text}
     */
    searchProjects: async (text: string): Promise<ProjectSearchResult[]> => {
        try {
            const response = await apiClient.get('/projects/search/', {
                params: { q: text }
            });
            return response.data;
        } catch (error) {
            console.error('Error searching projects:', error);
            return [];
        }
    }
};

export default projectService;
