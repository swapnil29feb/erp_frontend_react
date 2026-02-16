
import React, { useEffect, useState, useCallback } from 'react';
import { Card, Table, Tag, Alert, Spin, Typography } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { auditService } from '../../services/auditService';
import type { AuditLog } from '../../services/auditService';

const { Text } = Typography;

interface AuditLogPanelProps {
    entity: string;
    entityId: number;
    pageSize?: number;
}

const AuditLogPanel: React.FC<AuditLogPanelProps> = ({
    entity,
    entityId,
    pageSize = 10
}) => {
    const [logs, setLogs] = useState<AuditLog[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [currentPage, setCurrentPage] = useState<number>(1);
    const [total, setTotal] = useState<number>(0);

    const fetchLogs = useCallback(async (page: number) => {
        setLoading(true);
        setError(null);
        try {
            const data = await auditService.getAuditLogs(entity, entityId, page, pageSize);
            setLogs(data.results || []);
            setTotal(data.count || 0);
        } catch (err) {
            console.error('AuditLogPanel error:', err);
            setError('Failed to load audit logs');
        } finally {
            setLoading(false);
        }
    }, [entity, entityId, pageSize]);

    useEffect(() => {
        setCurrentPage(1);
        fetchLogs(1);
    }, [entity, entityId, fetchLogs]);

    const columns: ColumnsType<AuditLog> = [
        {
            title: 'Date & Time',
            dataIndex: 'timestamp',
            key: 'timestamp',
            width: 180,
            render: (ts: string) => new Date(ts).toLocaleString(),
        },
        {
            title: 'User',
            dataIndex: 'user',
            key: 'user',
            width: 150,
            render: (user: string | null) => user ? user : <Text type="secondary">System</Text>,
        },
        {
            title: 'Action',
            dataIndex: 'action',
            key: 'action',
            width: 100,
            render: (action: string) => {
                let color = 'default';
                const act = action.toLowerCase();
                if (act === 'create') color = 'green';
                else if (act === 'update') color = 'blue';
                else if (act === 'delete') color = 'red';
                return <Tag color={color}>{action.toUpperCase()}</Tag>;
            },
        },
        {
            title: 'Field',
            dataIndex: 'field',
            key: 'field',
            render: (field: string | null) =>
                field ? <Text code>{field}</Text> : <Text type="secondary">—</Text>,
        },
    ];

    const handlePageChange = (page: number) => {
        setCurrentPage(page);
        fetchLogs(page);
    };

    if (error) {
        return <Alert message={error} type="error" showIcon style={{ marginTop: 24 }} />;
    }

    return (
        <Card title="Audit Activity" style={{ width: '100%', marginTop: 24 }}>
            {loading && logs.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '40px 0' }}>
                    <Spin tip="Loading activity..." />
                </div>
            ) : (
                <Table
                    dataSource={logs}
                    columns={columns}
                    rowKey="id"
                    size="small"
                    pagination={{
                        current: currentPage,
                        pageSize: pageSize,
                        total: total,
                        onChange: handlePageChange,
                        showSizeChanger: false,
                        hideOnSinglePage: true,
                    }}
                    locale={{ emptyText: 'No activity recorded for this item.' }}
                />
            )}
        </Card>
    );
};

export default AuditLogPanel;
