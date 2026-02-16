import { useState, type FC } from 'react';
import { Card, Tabs } from 'antd';
import { UserOutlined, SafetyOutlined, LockOutlined, FileTextOutlined } from '@ant-design/icons';
import UsersTab from '../components/settings/UsersTab';
import RolesTab from '../components/settings/RolesTab';
import PermissionsTab from '../components/settings/PermissionsTab';
import AuditLogsTab from '../components/settings/AuditLogsTab';

const Settings: FC = () => {
    const [activeTab, setActiveTab] = useState('users');

    const items = [
        {
            key: 'users',
            label: (
                <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <UserOutlined />
                    Users
                </span>
            ),
            children: <UsersTab />
        },
        {
            key: 'roles',
            label: (
                <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <SafetyOutlined />
                    Roles
                </span>
            ),
            children: <RolesTab />
        },
        {
            key: 'permissions',
            label: (
                <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <LockOutlined />
                    Permissions
                </span>
            ),
            children: <PermissionsTab />
        },
        {
            key: 'audit_logs',
            label: (
                <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <FileTextOutlined />
                    Audit Logs
                </span>
            ),
            children: <AuditLogsTab />
        }
    ];

    return (
        <div style={{ padding: '32px' }}>
            <div style={{ marginBottom: '24px' }}>
                <h1 style={{ fontSize: '24px', fontWeight: '700', margin: 0 }}>Settings</h1>
                <p style={{ color: '#64748b', marginTop: '4px', marginBottom: 0 }}>
                    Manage users, roles, permissions, and audit logs
                </p>
            </div>

            <Card
                variant="borderless"
                style={{
                    borderRadius: '12px',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
                }}
            >
                <Tabs
                    activeKey={activeTab}
                    onChange={setActiveTab}
                    items={items}
                    size="large"
                />
            </Card>
        </div>
    );
};

export default Settings;
