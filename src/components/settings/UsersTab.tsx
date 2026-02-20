import { useEffect, useState } from "react";
import { Table, Button, Modal, Form, Input, Select, message, Tag, Typography, Divider, Space, Spin, Empty, Card } from "antd";
import {
  getUsers,
  createUser,
  getRoles,
  getRolePermissions,
  getPermissions,
} from "../../services/rbacService";
import { EyeOutlined } from "@ant-design/icons";

const { Text, Title } = Typography;

const UsersTab = () => {
  const [users, setUsers] = useState<any[]>([]);
  const [roles, setRoles] = useState<any[]>([]);
  const [allPermissions, setAllPermissions] = useState<any[]>([]);
  const [open, setOpen] = useState(false);
  const [viewAccessOpen, setViewAccessOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [rolePermissions, setRolePermissions] = useState<string[]>([]);
  const [loadingPermissions, setLoadingPermissions] = useState(false);
  const [form] = Form.useForm();

  const loadData = async () => {
    try {
      const u = await getUsers();
      const r = await getRoles();
      const p = await getPermissions();
      setUsers(u || []);
      setRoles(r || []);
      setAllPermissions(p || []);
    } catch (err) {
      console.error(err);
      message.error("Failed to load users");
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCreate = async () => {
    try {
      const values = await form.validateFields();
      await createUser(values);
      message.success("User created");
      setOpen(false);
      form.resetFields();
      loadData();
    } catch (err) {
      message.error("Failed to create user");
    }
  };

  const handleViewAccess = async (user: any) => {
    // In this version, roles are in 'groups' array
    const primaryRole = user.groups && user.groups.length > 0 ? user.groups[0] : null;

    if (!primaryRole) {
      message.warning("This user has no assigned role");
      return;
    }

    setSelectedUser(user);
    setViewAccessOpen(true);
    setLoadingPermissions(true);
    try {
      const perms = await getRolePermissions(primaryRole.id);
      const permStrings = perms.map((p: any) => typeof p === 'string' ? p : p.codename);
      setRolePermissions(permStrings);
    } catch {
      message.error("Failed to load permissions for this role");
    } finally {
      setLoadingPermissions(false);
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
    <>
      <div style={{ marginBottom: 16 }}>
        <Button type="primary" onClick={() => setOpen(true)}>
          Create User
        </Button>
      </div>

      <Table
        dataSource={users}
        rowKey="id"
        columns={[
          { title: "Username", dataIndex: "username" },
          { title: "Email", dataIndex: "email" },
          {
            title: "Roles",
            render: (row: any) =>
              row.groups?.map((g: any) => <Tag color="blue" key={g.id}>{g.name}</Tag>),
          },
          {
            title: "Actions",
            key: "actions",
            render: (_, record) => (
              <Button
                icon={<EyeOutlined />}
                size="small"
                onClick={() => handleViewAccess(record)}
              >
                View Access
              </Button>
            )
          }
        ]}
      />

      <Modal
        title="Create User"
        open={open}
        onCancel={() => setOpen(false)}
        onOk={handleCreate}
      >
        <Form form={form} layout="vertical">
          <Form.Item name="username" label="Username" rules={[{ required: true }]}>
            <Input />
          </Form.Item>

          <Form.Item name="email" label="Email">
            <Input />
          </Form.Item>

          <Form.Item name="password" label="Password" rules={[{ required: true }]}>
            <Input.Password />
          </Form.Item>

          <Form.Item name="groups" label="Role">
            <Select
              mode="multiple"
              options={roles.map((r) => ({
                label: r.name,
                value: r.id,
              }))}
            />
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title={`Access Review: ${selectedUser?.username || selectedUser?.name}`}
        open={viewAccessOpen}
        onCancel={() => setViewAccessOpen(false)}
        footer={[
          <Button key="close" onClick={() => setViewAccessOpen(false)}>Close</Button>
        ]}
        width={600}
      >
        {loadingPermissions ? (
          <div style={{ textAlign: 'center', padding: '40px' }}>
            <Spin tip="Fetching access rights..." />
          </div>
        ) : (
          <div>
            <div style={{ marginBottom: 20 }}>
              <Text type="secondary">Primary Role: </Text>
              <Tag color="gold" style={{ fontSize: '14px', padding: '4px 8px' }}>
                {selectedUser?.groups?.[0]?.name || "N/A"}
              </Tag>
            </div>

            <Divider style={{ margin: '16px 0' }} />

            <Title level={5} style={{ marginBottom: 16 }}>Permission Summary</Title>

            <Space wrap size={[8, 12]}>
              {Object.entries(accessSummary).length > 0 ? (
                Object.entries(accessSummary).map(([module, status]) => (
                  <Card
                    size="small"
                    key={module}
                    style={{ width: 170, backgroundColor: '#fcfcfc' }}
                    styles={{ body: { padding: '8px 12px' } }}
                  >
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                      <Text strong style={{ textTransform: 'capitalize', fontSize: '13px' }}>{module}</Text>
                      <Tag
                        color={status === "Full Access" ? "green" : status === "View Only" ? "blue" : "orange"}
                        style={{ margin: 0, width: 'fit-content', border: 'none' }}
                      >
                        {status}
                      </Tag>
                    </div>
                  </Card>
                ))
              ) : (
                <Empty description="No access rights found for this role" image={Empty.PRESENTED_IMAGE_SIMPLE} />
              )}
            </Space>
          </div>
        )}
      </Modal>
    </>
  );
};

export default UsersTab;

