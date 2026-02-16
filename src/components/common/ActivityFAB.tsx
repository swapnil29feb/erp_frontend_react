
import React, { useState, useEffect, useCallback } from 'react';
import { Button, Drawer, Tooltip, Empty, Typography } from 'antd';
import { HistoryOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { auditService, type AuditLog } from '../../services/auditService';

const { Text } = Typography;

interface ActivityFABProps {
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
    return date.toLocaleDateString();
};

const ActivityFAB: React.FC<ActivityFABProps> = ({ entity, entityId }) => {
    const [open, setOpen] = useState(false);
    const [logs, setLogs] = useState<AuditLog[]>([]);
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const fetchLogs = useCallback(async () => {
        if (!entityId || !open) return;
        setLoading(true);
        try {
            const data = await auditService.getAuditLogs(entity, Number(entityId), 1, 10);
            const sortedLogs = (data.results || [])
                .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
                .slice(0, 4);
            setLogs(sortedLogs);
        } catch (err) {
            console.error('Failed to fetch audit logs', err);
        } finally {
            setLoading(false);
        }
    }, [entity, entityId, open]);

    useEffect(() => {
        fetchLogs();
    }, [fetchLogs]);

    const showDrawer = () => setOpen(true);
    const onClose = () => setOpen(false);

    const getActionLabel = (action: string) => {
        const labels: Record<string, string> = {
            'create': 'Added',
            'update': 'Updated',
            'delete': 'Deleted',
            'approve': 'Approved'
        };
        return labels[action.toLowerCase()] || action.charAt(0).toUpperCase() + action.slice(1);
    };

    return (
        <>
            <Tooltip title="Activity">
                <Button
                    type="primary"
                    shape="circle"
                    icon={<HistoryOutlined />}
                    size="large"
                    onClick={showDrawer}
                    style={{
                        position: 'fixed',
                        bottom: '20px',
                        right: '20px',
                        width: '56px',
                        height: '56px',
                        zIndex: 1000,
                        boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        backgroundColor: '#1e293b'
                    }}
                />
            </Tooltip>

            <Drawer
                title={<span style={{ fontWeight: 700 }}>Recent Activity</span>}
                placement="right"
                onClose={onClose}
                open={open}
                width={320}
                bodyStyle={{ padding: '20px' }}
                footer={
                    <div style={{ textAlign: 'center', padding: '12px' }}>
                        <Button
                            type="link"
                            onClick={() => {
                                // Fallback logic for navigation if specific activity page doesn't exist
                                if (entity === 'boq_version') {
                                    navigate(`/boq/detail/${entityId}`);
                                } else {
                                    navigate(`/projects/${entityId}`);
                                }
                                onClose();
                            }}
                            style={{ fontWeight: 600, color: '#2563eb' }}
                        >
                            View Full Activity
                        </Button>
                    </div>
                }
            >
                {loading && !logs.length ? (
                    <div style={{ textAlign: 'center', padding: '40px' }}>Loading logs...</div>
                ) : logs.length === 0 ? (
                    <Empty description="No recent activity" style={{ marginTop: '40px' }} />
                ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                        {logs.map((log) => (
                            <div key={log.id} style={{ borderBottom: '1px solid #f1f5f9', paddingBottom: '16px' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                                    <Text strong style={{ fontSize: '13px' }}>
                                        {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </Text>
                                    <Text type="secondary" style={{ fontSize: '11px' }}>
                                        {formatRelativeTime(log.timestamp)}
                                    </Text>
                                </div>
                                <div style={{ fontSize: '14px', fontWeight: 600, color: '#334155' }}>
                                    {log.field ? `${log.field.charAt(0).toUpperCase() + log.field.slice(1)} ${log.action.toLowerCase()}` : getActionLabel(log.action)}
                                </div>
                                <div style={{ fontSize: '11px', color: '#94a3b8', marginTop: '2px' }}>
                                    by {log.user || 'System'}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </Drawer>
        </>
    );
};

export default ActivityFAB;
