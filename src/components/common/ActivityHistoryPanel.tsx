
import React, { useEffect, useState, useCallback } from 'react';
import { auditService, type AuditLog } from '../../services/auditService';

interface ActivityHistoryPanelProps {
    entity: string;
    entityId: number | string | null;
}

const formatRelativeTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffInSeconds < 60) return 'just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} min ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hr ago`;
    if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)} d ago`;

    return date.toLocaleDateString();
};

const ActivityHistoryPanel: React.FC<ActivityHistoryPanelProps> = ({ entity, entityId }) => {
    const [logs, setLogs] = useState<AuditLog[]>([]);
    const [loading, setLoading] = useState(false);

    const fetchLogs = useCallback(async () => {
        if (!entityId) return;
        setLoading(true);
        try {
            const data = await auditService.getAuditLogs(entity, Number(entityId), 1, 10);

            // Strictly get the latest 4 and ensure descending order
            const sortedLogs = (data.results || [])
                .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
                .slice(0, 4);

            setLogs(sortedLogs);
        } catch (err) {
            console.error('Failed to fetch audit logs', err);
        } finally {
            setLoading(false);
        }
    }, [entity, entityId]);

    useEffect(() => {
        fetchLogs();
    }, [fetchLogs]);

    const styles = {
        container: {
            backgroundColor: 'white',
            borderRadius: '12px',
            border: '1px solid #e2e8f0',
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column' as const,
            height: 'fit-content',
        },
        header: {
            padding: '16px 20px',
            borderBottom: '1px solid #e2e8f0',
            backgroundColor: '#f8fafc',
        },
        title: {
            margin: 0,
            fontSize: '15px',
            fontWeight: '700',
            color: '#1e293b',
            textTransform: 'uppercase' as const,
            letterSpacing: '0.025em'
        },
        list: {
            padding: '16px 20px',
            display: 'flex',
            flexDirection: 'column' as const,
        },
        item: {
            marginBottom: '16px',
            paddingBottom: '16px',
            borderBottom: '1px solid #f1f5f9',
            display: 'flex',
            flexDirection: 'column' as const,
            gap: '2px',
        },
        timeLine: {
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'baseline',
            marginBottom: '4px'
        },
        timeAbsolute: {
            fontSize: '13px',
            color: '#1e293b',
            fontWeight: '700'
        },
        timeRelative: {
            fontSize: '11px',
            color: '#94a3b8',
        },
        action: {
            fontSize: '14px',
            fontWeight: '600',
            color: '#334155',
        },
        description: {
            fontSize: '12px',
            color: '#64748b',
            lineHeight: '1.4',
        },
        user: {
            fontSize: '11px',
            color: '#94a3b8',
            marginTop: '4px',
            fontWeight: '500'
        },
        empty: {
            textAlign: 'center' as const,
            padding: '40px 20px',
            color: '#94a3b8',
            fontSize: '13px',
            fontStyle: 'italic'
        }
    };

    const getActionLabel = (action: string) => {
        const labels: Record<string, string> = {
            'create': 'Created',
            'update': 'Updated',
            'delete': 'Deleted',
            'approve': 'Approved'
        };
        return labels[action.toLowerCase()] || action.charAt(0).toUpperCase() + action.slice(1);
    };

    return (
        <div style={styles.container}>
            <div style={styles.header}>
                <h3 style={styles.title}>Activity History</h3>
            </div>
            <div style={styles.list}>
                {loading && !logs.length ? (
                    <div style={styles.empty}>Loading logs...</div>
                ) : logs.length === 0 ? (
                    <div style={styles.empty}>No activity yet</div>
                ) : (
                    logs.map((log) => (
                        <div key={log.id} style={styles.item}>
                            <div style={styles.timeLine}>
                                <span style={styles.timeAbsolute}>
                                    {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </span>
                                <span style={styles.timeRelative}>{formatRelativeTime(log.timestamp)}</span>
                            </div>

                            <div style={styles.action}>
                                {entity === 'boq_version' ? 'BOQ Version' : 'Project'} {getActionLabel(log.action)}
                            </div>

                            <div style={styles.description}>
                                {log.field ? `${log.field.charAt(0).toUpperCase() + log.field.slice(1)} change detected` : 'Direct record modification'}
                            </div>

                            <div style={styles.user}>
                                by {log.user || 'System'}
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default ActivityHistoryPanel;
