import type { Project, Area, Product, Driver, Accessory, ApiResponse, PaginatedResponse, MasterProduct, MasterDriver, MasterAccessory } from './types';

// Base API URL - Update this with your Django backend URL
// Base API URL - Updated for Lighting ERP
const API_BASE_URL = 'http://127.0.0.1:8000/api/';

// API Helper functions
class ApiClient {
    private baseUrl: string;

    constructor(baseUrl: string) {
        this.baseUrl = baseUrl;
    }

    private getCsrfToken(): string | null {
        const name = 'csrftoken';
        let cookieValue = null;
        if (document.cookie && document.cookie !== '') {
            const cookies = document.cookie.split(';');
            for (let i = 0; i < cookies.length; i++) {
                const cookie = cookies[i].trim();
                if (cookie.substring(0, name.length + 1) === (name + '=')) {
                    cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                    break;
                }
            }
        }
        return cookieValue;
    }

    private async request<T>(
        endpoint: string,
        options: RequestInit = {}
    ): Promise<ApiResponse<T>> {
        try {
            const headers: Record<string, string> = {
                'Content-Type': 'application/json',
                ...((options.headers as Record<string, string>) || {}),
            };

            // Add CSRF token for non-safe methods
            const method = options.method?.toUpperCase() || 'GET';
            if (!['GET', 'HEAD', 'OPTIONS', 'TRACE'].includes(method)) {
                const csrfToken = this.getCsrfToken();
                if (csrfToken) {
                    headers['X-CSRFToken'] = csrfToken;
                }
            }

            const response = await fetch(`${this.baseUrl}${endpoint}`, {
                ...options,
                headers,
                credentials: 'include',
            });

            // Get the text first to avoid parsing errors if it's not JSON
            const responseText = await response.text();
            let data: any = {};

            try {
                if (responseText) {
                    data = JSON.parse(responseText);
                }
            } catch (e) {
                // If parsing fails, it's likely HTML or empty
                if (!response.ok) {
                    return {
                        success: false,
                        error: `Server error (${response.status}): ${responseText.substring(0, 100)}...`,
                    };
                }
                // If it was OK but not JSON (rare), handle as unexpected
                return {
                    success: false,
                    error: `Expected JSON but received: ${responseText.substring(0, 50)}...`,
                };
            }

            if (!response.ok) {
                // Handle different DRF error formats
                let errorMessage = 'An error occurred';
                if (data.detail) errorMessage = data.detail;
                else if (data.message) errorMessage = data.message;
                else if (data && typeof data === 'object') {
                    // Capture field-specific errors: {"name": ["This field is required"]}
                    errorMessage = Object.entries(data)
                        .map(([field, errors]) => `${field}: ${Array.isArray(errors) ? errors.join(', ') : errors}`)
                        .join(' | ');
                }

                return {
                    success: false,
                    error: errorMessage,
                };
            }

            return {
                success: true,
                data: data,
            };
        } catch (error) {
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Network error',
            };
        }
    }

    // Project APIs
    async getProjects(page: number = 1): Promise<ApiResponse<PaginatedResponse<Project>>> {
        return this.request<PaginatedResponse<Project>>(`projects/?page=${page}`);
    }

    async getProject(id: string): Promise<ApiResponse<Project>> {
        return this.request<Project>(`projects/${id}/`);
    }

    async createProject(project: Omit<Project, 'id' | 'createdAt' | 'areas'>): Promise<ApiResponse<Project>> {
        return this.request<Project>('projects/', {
            method: 'POST',
            body: JSON.stringify(project),
        });
    }

    async updateProject(id: string, project: Partial<Project>): Promise<ApiResponse<Project>> {
        return this.request<Project>(`projects/${id}/`, {
            method: 'PUT', // ERP contract uses PUT for update
            body: JSON.stringify(project),
        });
    }

    async deleteProject(id: string): Promise<ApiResponse<void>> {
        return this.request<void>(`projects/${id}/`, {
            method: 'DELETE',
        });
    }

    // Area APIs
    async getAreas(projectId: string): Promise<ApiResponse<Area[]>> {
        return this.request<Area[]>(`projects/${projectId}/areas/`);
    }

    async createArea(projectId: string, area: Omit<Area, 'id' | 'projectId' | 'products'>): Promise<ApiResponse<Area>> {
        return this.request<Area>(`projects/${projectId}/areas/`, {
            method: 'POST',
            body: JSON.stringify({ ...area, project: Number(projectId) }),
        });
    }

    // Product APIs (Mapped to Configurations)
    async getProducts(areaId: string): Promise<ApiResponse<Product[]>> {
        return this.request<Product[]>(`configurations/configurations/by-area/${areaId}/`);
    }

    async createProduct(
        areaId: string,
        product: Omit<Product, 'id' | 'areaId' | 'drivers' | 'accessories'>
    ): Promise<ApiResponse<Product>> {
        const requestData = {
            area: Number(areaId),
            product: Number((product as any).masterProductId || (product as any).prod_id || (product as any).id),
            quantity: Number(product.quantity)
        };

        return this.request<Product>('configurations/configurations/', {
            method: 'POST',
            body: JSON.stringify(requestData),
        });
    }

    async updateProduct(
        productId: string,
        product: Partial<Product>
    ): Promise<ApiResponse<Product>> {
        return this.request<Product>(`configurations/configurations/${productId}/`, {
            method: 'PATCH',
            body: JSON.stringify(product),
        });
    }

    async deleteProduct(productId: string): Promise<ApiResponse<void>> {
        return this.request<void>(`configurations/configurations/${productId}/`, {
            method: 'DELETE',
        });
    }

    // Driver APIs
    async createDriver(
        productId: string,
        driver: Omit<Driver, 'id' | 'productId'>
    ): Promise<ApiResponse<Driver>> {
        const requestData = {
            configuration: Number(productId),
            driver: Number((driver as any).masterDriverId || (driver as any).driver_id || (driver as any).id),
            quantity: Number(driver.quantity)
        };
        return this.request<Driver>(
            `configurations/configuration-drivers/`,
            {
                method: 'POST',
                body: JSON.stringify(requestData),
            }
        );
    }

    // Accessory APIs (Mapped to Configuration Accessories)
    async createAccessory(
        productId: string,
        accessory: Omit<Accessory, 'id' | 'productId'>
    ): Promise<ApiResponse<Accessory>> {
        const requestData = {
            configuration: Number(productId),
            accessory: Number((accessory as any).masterAccessoryId || (accessory as any).accessory_id || (accessory as any).id),
            quantity: Number(accessory.quantity)
        };
        return this.request<Accessory>(
            `configurations/configuration-accessories/`,
            {
                method: 'POST',
                body: JSON.stringify(requestData),
            }
        );
    }

    // BOQ APIs
    async generateBOQ(projectId: string): Promise<ApiResponse<any>> {
        return this.request<any>(`boq/generate/${projectId}/`, {
            method: 'POST'
        });
    }

    async getBOQSummary(projectId: string): Promise<ApiResponse<any>> {
        return this.request<any>(`boq/summary/${projectId}/`);
    }

    async applyMargin(boqId: string, margin: number): Promise<ApiResponse<any>> {
        return this.request<any>(`boq/${boqId}/apply-margin/`, {
            method: 'POST',
            body: JSON.stringify({ markup_pct: margin })
        });
    }

    async approveBOQ(boqId: string): Promise<ApiResponse<any>> {
        return this.request<any>(`boq/${boqId}/approve/`, {
            method: 'POST'
        });
    }

    async exportBOQ(boqId: string, format: 'pdf' | 'excel'): Promise<void> {
        window.open(`${this.baseUrl}boq/export/${format}/${boqId}/`, '_blank');
    }

    // Master Product APIs
    async getMasterProducts(page: number = 1): Promise<ApiResponse<PaginatedResponse<MasterProduct>>> {
        return this.request<PaginatedResponse<MasterProduct>>(`masters/products/?page=${page}`);
    }

    async createMasterProduct(product: Omit<MasterProduct, 'id' | 'createdAt'>): Promise<ApiResponse<MasterProduct>> {
        return this.request<MasterProduct>('masters/products/', {
            method: 'POST',
            body: JSON.stringify(product),
        });
    }

    // Master Driver APIs
    async getMasterDrivers(page: number = 1): Promise<ApiResponse<PaginatedResponse<MasterDriver>>> {
        return this.request<PaginatedResponse<MasterDriver>>(`masters/drivers/?page=${page}`);
    }

    async createMasterDriver(driver: Omit<MasterDriver, 'id'>): Promise<ApiResponse<MasterDriver>> {
        return this.request<MasterDriver>('masters/drivers/', {
            method: 'POST',
            body: JSON.stringify(driver),
        });
    }

    // Master Accessory APIs
    async getMasterAccessories(page: number = 1): Promise<ApiResponse<PaginatedResponse<MasterAccessory>>> {
        return this.request<PaginatedResponse<MasterAccessory>>(`masters/accessories/?page=${page}`);
    }

    async createMasterAccessory(accessory: Omit<MasterAccessory, 'id'>): Promise<ApiResponse<MasterAccessory>> {
        return this.request<MasterAccessory>('masters/accessories/', {
            method: 'POST',
            body: JSON.stringify(accessory),
        });
    }

    // Options/Choices APIs - fetch dropdown options from backend
    async getMountingTypes(): Promise<ApiResponse<string[]>> {
        return this.request<string[]>('masters/mounting-types/');
    }
}

// Export singleton instance
export const apiClient = new ApiClient(API_BASE_URL);

// Export individual API functions for easier use
export const projectApi = {
    getAll: (page?: number) => apiClient.getProjects(page),
    get: (id: string) => apiClient.getProject(id),
    create: (project: Omit<Project, 'id' | 'createdAt' | 'areas'>) => apiClient.createProject(project),
    update: (id: string, project: Partial<Project>) => apiClient.updateProject(id, project),
    delete: (id: string) => apiClient.deleteProject(id),
};

export const areaApi = {
    getAll: (projectId: string) => apiClient.getAreas(projectId),
    create: (projectId: string, area: Omit<Area, 'id' | 'projectId' | 'products'>) =>
        apiClient.createArea(projectId, area),
};

export const productApi = {
    getAll: (areaId: string) => apiClient.getProducts(areaId),
    create: (areaId: string, product: Omit<Product, 'id' | 'areaId' | 'drivers' | 'accessories'>) =>
        apiClient.createProduct(areaId, product),
    update: (productId: string, product: Partial<Product>) =>
        apiClient.updateProduct(productId, product),
    delete: (productId: string) =>
        apiClient.deleteProduct(productId),
};

export const driverApi = {
    create: (productId: string, driver: Omit<Driver, 'id' | 'productId'>) =>
        apiClient.createDriver(productId, driver),
};

export const accessoryApi = {
    create: (productId: string, accessory: Omit<Accessory, 'id' | 'productId'>) =>
        apiClient.createAccessory(productId, accessory),
};

export const boqApi = {
    generate: (projectId: string) => apiClient.generateBOQ(projectId),
    getSummary: (projectId: string) => apiClient.getBOQSummary(projectId),
    applyMargin: (boqId: string, margin: number) => apiClient.applyMargin(boqId, margin),
    approve: (boqId: string) => apiClient.approveBOQ(boqId),
    export: (boqId: string, format: 'pdf' | 'excel') =>
        apiClient.exportBOQ(boqId, format),
};

export const masterProductApi = {
    getAll: (page?: number) => apiClient.getMasterProducts(page),
    create: (product: Omit<MasterProduct, 'id' | 'createdAt'>) => apiClient.createMasterProduct(product),
};

export const masterDriverApi = {
    getAll: (page?: number) => apiClient.getMasterDrivers(page),
    create: (driver: Omit<MasterDriver, 'id'>) => apiClient.createMasterDriver(driver),
};

export const masterAccessoryApi = {
    getAll: (page?: number) => apiClient.getMasterAccessories(page),
    create: (accessory: Omit<MasterAccessory, 'id'>) => apiClient.createMasterAccessory(accessory),
};

export const optionsApi = {
    getMountingTypes: () => apiClient.getMountingTypes(),
};
