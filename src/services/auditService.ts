
import api from '../api/apiClient';

/**
 * Audit log interface representing a single activity entry.
 */
export interface AuditLog {
    id: number;
    timestamp: string;
    user: string | null;
    action: 'create' | 'update' | 'delete' | string;
    field?: string | null;
}

/**
 * Paginated response for audit logs.
 */
export interface AuditLogResponse {
    count: number;
    next: string | null;
    previous: string | null;
    results: AuditLog[];
}

export const auditService = {
    /**
     * Fetch audit logs for a specific entity and ID.
     */
    getAuditLogs: async (entity: string, entityId: number, page: number = 1, pageSize: number = 20): Promise<AuditLogResponse> => {
        const res = await api.get('/common/audit/logs/', {
            params: {
                entity,
                entity_id: entityId,
                page,
                page_size: pageSize
            }
        });
        return res.data;
    }
};
