import { useEffect, useState } from "react";
import { Button, Modal, Form, Input, Layout, List, Checkbox, message, Typography, Divider, Card, Spin, Dropdown, Tag, Space } from "antd";
import { DownOutlined, SearchOutlined, CopyOutlined } from "@ant-design/icons";
import { getRoles, createRole, getPermissions, getRolePermissions, updateRolePermissions, updateRole } from "../../services/rbacService";

const { Content, Sider } = Layout;
const { Title, Text } = Typography;

const ROLE_TEMPLATES: Record<string, { description: string; permissions: string[] }> = {
    "Sales Engineer": {
        description: "Handle project inquiries, create and manage BOQs and configurations.",
        permissions: ["projects:view", "projects:create", "projects:edit", "configurations:view", "configurations:create", "boq:view", "boq:create"]
    },
    "Design Engineer": {
        description: "Focus on technical configurations and product technical details.",
        permissions: ["projects:view", "configurations:view", "configurations:create", "configurations:edit", "configurations:delete"]
    },
    "Accounts": {
        description: "Manage invoicing, financial approvals, and cost auditing.",
        permissions: ["projects:view", "boq:view", "invoicing:view", "invoicing:create", "invoicing:edit", "invoicing:approve"]
    },
    "Purchase Manager": {
        description: "Handle procurement, inventory levels, and supplier dispatch.",
        permissions: ["procurement:view", "procurement:create", "procurement:edit", "inventory:view", "dispatch:view", "dispatch:create"]
    },
    "Director": {
        description: "Full system oversight with all viewing and approval rights.",
        permissions: ["projects:view", "configurations:view", "boq:view", "boq:approve", "procurement:view", "inventory:view", "settings:view"]
    },
    "Viewer": {
        description: "Read-only access to view dashboards and project status.",
        permissions: ["projects:view", "configurations:view", "boq:view"]
    }
};

const RolesTab = () => {
    const [roles, setRoles] = useState<any[]>([]);
    const [allPermissions, setAllPermissions] = useState<any[]>([]);
    const [selectedRole, setSelectedRole] = useState<any>(null);
    const [rolePermissions, setRolePermissions] = useState<string[]>([]);
    const [editableDescription, setEditableDescription] = useState<string>("");
    const [pendingPermissions, setPendingPermissions] = useState<string[] | null>(null);
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [searchText, setSearchText] = useState("");
    const [form] = Form.useForm();

    const loadRoles = async () => {
        try {
            const r = await getRoles();
            setRoles(r || []);
            // Auto-select first role if none selected
            if (r && r.length > 0 && !selectedRole) {
                handleRoleSelect(r[0]);
            }
        } catch {
            message.error("Failed to load roles");
        }
    };

    const loadPermissions = async () => {
        try {
            const p = await getPermissions();
            setAllPermissions(p || []);
        } catch {
            message.error("Failed to load all permissions");
        }
    };

    const handleRoleSelect = async (role: any) => {
        setSelectedRole(role);
        setEditableDescription(role.description || "");
        setLoading(true);
        try {
            const perms = await getRolePermissions(role.id);
            // Assuming perms is an array of strings or objects with codename
            const permStrings = perms.map((p: any) => (typeof p === 'string' ? p : p.codename));
            setRolePermissions(permStrings);
        } catch {
            message.error("Failed to load permissions for this role");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadRoles();
        loadPermissions();
    }, []);

    const handleCreate = async () => {
        try {
            const values = await form.validateFields();
            const newRole = await createRole(values);

            // If template permissions are pending, apply them immediately
            if (pendingPermissions && newRole?.id) {
                await updateRolePermissions(newRole.id, pendingPermissions);
                message.success(`Role "${values.name}" created with template permissions`);
            } else {
                message.success("Role created successfully");
            }

            setOpen(false);
            setPendingPermissions(null);
            form.resetFields();
            loadRoles();
        } catch (error) {
            console.error("Create failed", error);
            message.error("Failed to create role");
        }
    };

    const handleApplyTemplate = (templateName: string) => {
        const template = ROLE_TEMPLATES[templateName];
        if (template) {
            form.setFieldsValue({
                name: templateName,
                description: template.description
            });
            setPendingPermissions(template.permissions);
            setOpen(true);
        }
    };

    const handleTogglePermission = (codename: string) => {
        setRolePermissions(prev =>
            prev.includes(codename)
                ? prev.filter(p => p !== codename)
                : [...prev, codename]
        );
    };

    const handleClone = () => {
        if (!selectedRole) return;
        form.setFieldsValue({
            name: `${selectedRole.name} Copy`,
            description: selectedRole.description
        });
        setPendingPermissions(rolePermissions);
        setOpen(true);
    };

    const handleSavePermissions = async () => {
        if (!selectedRole) return;

        const hasCriticalPermissions = rolePermissions.some(cp =>
            cp.toLowerCase().includes('approve') ||
            cp.toLowerCase().includes('delete') ||
            cp.toLowerCase().includes('admin')
        );

        const executeSave = async () => {
            setSaving(true);
            try {
                // Update role description if changed
                if (editableDescription !== selectedRole.description) {
                    await updateRole(selectedRole.id, { description: editableDescription });
                    // Update local role list state
                    setRoles(prev => prev.map(r => r.id === selectedRole.id ? { ...r, description: editableDescription } : r));
                }

                await updateRolePermissions(selectedRole.id, rolePermissions);
                message.success("Role details and permissions updated successfully");

                // Re-sync selected role to avoid stale state
                setSelectedRole((prev: any) => ({ ...prev, description: editableDescription }));
            } catch {
                message.error("Failed to update role settings");
            } finally {
                setSaving(false);
            }
        };

        if (hasCriticalPermissions) {
            Modal.confirm({
                title: 'Critical Permissions Warning',
                content: 'This role has been granted critical permissions (Approval, Deletion, or Administrative rights). Are you sure you want to continue?',
                okText: 'Yes, Save Changes',
                okType: 'danger',
                cancelText: 'No, Re-check',
                onOk: executeSave
            });
        } else {
            await executeSave();
        }
    };

    const getAccessSummary = () => {
        const summary: Record<string, string> = {};
        const modules: Record<string, string[]> = {};

        allPermissions.forEach((perm: any) => {
            const moduleName = perm.codename.includes(':') ? perm.codename.split(':')[0] : perm.codename.split('.')[0];
            if (!modules[moduleName]) modules[moduleName] = [];
            modules[moduleName].push(perm.codename);
        });

        Object.keys(modules).forEach(moduleName => {
            const modulePerms = modules[moduleName];
            const selectedModulePerms = modulePerms.filter(cp => rolePermissions.includes(cp));

            if (selectedModulePerms.length === 0) return;

            if (selectedModulePerms.length === modulePerms.length) {
                summary[moduleName] = "Full Access";
            } else if (selectedModulePerms.length === 1 && (selectedModulePerms[0].includes('view') || selectedModulePerms[0].includes('read'))) {
                summary[moduleName] = "View Only";
            } else {
                summary[moduleName] = "Custom";
            }
        });

        return summary;
    };

    const accessSummary = getAccessSummary();

    return (
        <Layout style={{ background: '#fff', borderRadius: '8px', overflow: 'hidden', border: '1px solid #f0f0f0' }}>
            <Sider width={280} style={{ background: '#fafafa', borderRight: '1px solid #f0f0f0', padding: '16px' }}>
                <div style={{ marginBottom: 16, display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <Button type="primary" block onClick={() => {
                        form.resetFields();
                        setPendingPermissions(null);
                        setOpen(true);
                    }}>
                        Create Role
                    </Button>
                    <Dropdown
                        menu={{
                            items: Object.keys(ROLE_TEMPLATES).map(key => ({
                                key,
                                label: key,
                                onClick: () => handleApplyTemplate(key)
                            }))
                        }}
                    >
                        <Button block>
                            Use Template <DownOutlined />
                        </Button>
                    </Dropdown>
                </div>
                <div style={{ marginBottom: 16 }}>
                    <Input
                        placeholder="Search roles..."
                        prefix={<SearchOutlined style={{ color: '#bfbfbf' }} />}
                        value={searchText}
                        onChange={e => setSearchText(e.target.value)}
                        allowClear
                        style={{ borderRadius: '6px' }}
                    />
                </div>
                <List
                    dataSource={roles.filter(r => r.name.toLowerCase().includes(searchText.toLowerCase()))}
                    loading={!roles.length && loading}
                    renderItem={(role) => (
                        <List.Item
                            onClick={() => handleRoleSelect(role)}
                            style={{
                                cursor: 'pointer',
                                padding: '10px 12px',
                                borderRadius: '6px',
                                marginBottom: '4px',
                                border: 'none',
                                background: selectedRole?.id === role.id ? '#e6f4ff' : 'transparent',
                                transition: 'all 0.3s'
                            }}
                        >
                            <Text strong={selectedRole?.id === role.id} style={{ color: selectedRole?.id === role.id ? '#1677ff' : 'inherit' }}>
                                {role.name}
                            </Text>
                        </List.Item>
                    )}
                />
            </Sider>
            <Content style={{ padding: '0 24px 24px', minHeight: '500px' }}>
                {selectedRole ? (
                    <div style={{ paddingTop: '16px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
                            <div style={{ flex: 1, maxWidth: '500px' }}>
                                <Title level={4} style={{ margin: '0 0 12px 0' }}>{selectedRole.name}</Title>
                                <div style={{ marginBottom: 16 }}>
                                    <Text strong style={{ fontSize: '12px', display: 'block', marginBottom: '4px', color: '#64748b' }}>Role Description</Text>
                                    <Input.TextArea
                                        rows={2}
                                        value={editableDescription}
                                        onChange={(e) => setEditableDescription(e.target.value)}
                                        placeholder="Enter the purpose or scope of this role..."
                                        style={{ borderRadius: '6px' }}
                                    />
                                </div>
                            </div>
                            <Space style={{ marginTop: 8 }}>
                                <Button icon={<CopyOutlined />} onClick={handleClone}>
                                    Clone Role
                                </Button>
                                <Button type="primary" onClick={handleSavePermissions} loading={saving}>
                                    Save All Changes
                                </Button>
                            </Space>
                        </div>

                        <Divider style={{ margin: '12px 0 24px' }} />

                        {loading ? (
                            <div style={{ textAlign: 'center', padding: '50px' }}>
                                <Spin tip="Loading permissions..." />
                            </div>
                        ) : (
                            <div>
                                <div style={{ marginBottom: 24, padding: '16px', background: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                                    <Text strong style={{ display: 'block', marginBottom: 12, color: '#475569', fontSize: '13px' }}>Access Summary</Text>
                                    <Space wrap size={[8, 8]}>
                                        {Object.entries(accessSummary).length > 0 ? (
                                            Object.entries(accessSummary).map(([module, status]) => (
                                                <Tag
                                                    key={module}
                                                    color={status === "Full Access" ? "green" : status === "View Only" ? "blue" : "orange"}
                                                    style={{ borderRadius: '4px', textTransform: 'capitalize' }}
                                                >
                                                    <span style={{ fontWeight: 600 }}>{module}: </span>
                                                    <span>{status}</span>
                                                </Tag>
                                            ))
                                        ) : (
                                            <Text type="secondary" style={{ fontSize: '12px' }}>No permissions assigned to this role</Text>
                                        )}
                                    </Space>
                                </div>

                                <Title level={5} style={{ marginBottom: 16 }}>Permission Matrix</Title>
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '12px' }}>
                                    {allPermissions.map((perm: any) => (
                                        <Card size="small" key={perm.id || perm.codename} hoverable style={{ border: '1px solid #f0f0f0' }}>
                                            <Checkbox
                                                checked={rolePermissions.includes(perm.codename)}
                                                onChange={() => handleTogglePermission(perm.codename)}
                                            >
                                                <div style={{ display: 'flex', flexDirection: 'column' }}>
                                                    <Text strong style={{ fontSize: '13px' }}>{perm.name}</Text>
                                                    <Text type="secondary" style={{ fontSize: '11px' }}>{perm.codename}</Text>
                                                </div>
                                            </Checkbox>
                                        </Card>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                ) : (
                    <div style={{ textAlign: 'center', padding: '100px 0' }}>
                        <Text type="secondary">Select a role to manage its permissions</Text>
                    </div>
                )}
            </Content>

            <Modal
                title="Create Role"
                open={open}
                onCancel={() => setOpen(false)}
                onOk={handleCreate}
            >
                <Form form={form} layout="vertical">
                    <Form.Item name="name" label="Role Name" rules={[{ required: true }]}>
                        <Input placeholder="e.g. Sales Manager" />
                    </Form.Item>
                    <Form.Item name="description" label="Description">
                        <Input placeholder="e.g. Can view all projects and manage leads" />
                    </Form.Item>
                </Form>
            </Modal>
        </Layout>
    );
};

export default RolesTab;
