import { useEffect, useState, type FC } from 'react';
import { Table, Select, DatePicker, Card, Space } from 'antd';
import { ClockCircleOutlined } from '@ant-design/icons';
import apiClient from '../../api/apiClient';
import { userService, type User } from '../../services/userService';
import type { Dayjs } from 'dayjs';

const { RangePicker } = DatePicker;

interface AuditLog {
    id: number;
    timestamp: string;
    user_name?: string;
    action_type: string;
    entity_type?: string;
    entity_id?: number;
    details?: string;
    created_at: string;
}

const AuditLogsTab: FC = () => {
    const [logs, setLogs] = useState<AuditLog[]>([]);
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(false);
    const [page, setPage] = useState(1);
    const [pageSize] = useState(20);
    const [total, setTotal] = useState(0);

    // Filters
    const [selectedUser, setSelectedUser] = useState<number | null>(null);
    const [selectedEntity, setSelectedEntity] = useState<string | null>(null);
    const [dateRange, setDateRange] = useState<[Dayjs | null, Dayjs | null] | null>(null);

    useEffect(() => {
        loadUsers();
    }, []);

    useEffect(() => {
        loadLogs();
    }, [page, selectedUser, selectedEntity, dateRange]);

    const loadUsers = async () => {
        try {
            const data = await userService.getUsers();
            const userList = Array.isArray(data) ? data : data.results || [];
            setUsers(userList);
        } catch (error) {
            console.error('Failed to load users', error);
        }
    };

    const loadLogs = async () => {
        setLoading(true);
        try {
            let url = `/common/audit/logs/?page=${page}&page_size=${pageSize}`;

            if (selectedUser) {
                url += `&user_id=${selectedUser}`;
            }
            if (selectedEntity) {
                url += `&entity_type=${selectedEntity}`;
            }
            if (dateRange && dateRange[0] && dateRange[1]) {
                url += `&start_date=${dateRange[0].format('YYYY-MM-DD')}`;
                url += `&end_date=${dateRange[1].format('YYYY-MM-DD')}`;
            }

            const response = await apiClient.get(url);
            const data = response.data;

            if (Array.isArray(data)) {
                setLogs(data);
                setTotal(data.length);
            } else {
                setLogs(data.results || []);
                setTotal(data.count || 0);
            }
        } catch (error) {
            console.error('Failed to load audit logs', error);
            setLogs([]);
        } finally {
            setLoading(false);
        }
    };

    const formatTime = (dateStr: string) => {
        if (!dateStr) return '-';
        const date = new Date(dateStr);
        return date.toLocaleString();
    };

    const columns = [
        {
            title: 'Time',
            dataIndex: 'created_at',
            key: 'created_at',
            width: 180,
            render: (date: string) => (
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <ClockCircleOutlined style={{ color: '#94a3b8' }} />
                    <span style={{ fontSize: '12px' }}>{formatTime(date)}</span>
                </div>
            ),
            sorter: (a: AuditLog, b: AuditLog) =>
                new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
        },
        {
            title: 'User',
            dataIndex: 'user_name',
            key: 'user_name',
            width: 150,
            render: (name: string) => name || 'System'
        },
        {
            title: 'Action',
            dataIndex: 'action_type',
            key: 'action_type',
            width: 150,
            render: (action: string) => (
                <span style={{
                    padding: '4px 8px',
                    borderRadius: '4px',
                    fontSize: '11px',
                    fontWeight: '600',
                    backgroundColor: '#eff6ff',
                    color: '#2563eb'
                }}>
                    {action?.replace(/_/g, ' ').toUpperCase()}
                </span>
            )
        },
        {
            title: 'Entity',
            dataIndex: 'entity_type',
            key: 'entity_type',
            width: 120,
            render: (entity: string) => entity || '-'
        },
        {
            title: 'Details',
            dataIndex: 'details',
            key: 'details',
            ellipsis: true,
            render: (details: string) => details || '-'
        }
    ];

    const entityTypes = ['Project', 'Area', 'Configuration', 'BOQ', 'Product', 'Driver', 'Accessory'];

    return (
        <div>
            <Card style={{ marginBottom: '16px' }}>
                <Space wrap size="middle">
                    <div>
                        <label style={{ display: 'block', marginBottom: '4px', fontSize: '12px', fontWeight: '600' }}>
                            User
                        </label>
                        <Select
                            style={{ width: 200 }}
                            placeholder="All Users"
                            allowClear
                            value={selectedUser}
                            onChange={setSelectedUser}
                            options={[
                                { label: 'All Users', value: null },
                                ...users.map(user => ({
                                    label: `${user.first_name} ${user.last_name}`,
                                    value: user.id
                                }))
                            ]}
                        />
                    </div>

                    <div>
                        <label style={{ display: 'block', marginBottom: '4px', fontSize: '12px', fontWeight: '600' }}>
                            Entity
                        </label>
                        <Select
                            style={{ width: 200 }}
                            placeholder="All Entities"
                            allowClear
                            value={selectedEntity}
                            onChange={setSelectedEntity}
                            options={[
                                { label: 'All Entities', value: null },
                                ...entityTypes.map(entity => ({
                                    label: entity,
                                    value: entity
                                }))
                            ]}
                        />
                    </div>

                    <div>
                        <label style={{ display: 'block', marginBottom: '4px', fontSize: '12px', fontWeight: '600' }}>
                            Date Range
                        </label>
                        <RangePicker
                            style={{ width: 300 }}
                            onChange={(dates) => setDateRange(dates as [Dayjs | null, Dayjs | null] | null)}
                        />
                    </div>
                </Space>
            </Card>

            <Table
                columns={columns}
                dataSource={logs}
                rowKey="id"
                loading={loading}
                pagination={{
                    current: page,
                    pageSize: pageSize,
                    total: total,
                    onChange: setPage,
                    showSizeChanger: false,
                    showTotal: (total) => `Total ${total} logs`
                }}
            />
        </div>
    );
};

export default AuditLogsTab;
