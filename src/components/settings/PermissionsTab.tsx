import { useEffect, useState } from "react";
import { Checkbox, Select, message, Card, Row, Col, Typography, Space, Empty, Spin } from "antd";
import {
  getRoles,
  getRolePermissions,
  updateRolePermissions,
} from "../../services/rbacService";

const { Text } = Typography;

const modules = [
  "projects",
  "configurations",
  "boq",
  "procurement",
  "inventory",
  "dispatch",
  "invoicing",
  "settings",
];

const actions = ["view", "create", "edit", "approve", "delete"];

const PermissionsTab = () => {
  const [roles, setRoles] = useState<any[]>([]);
  const [roleId, setRoleId] = useState<number | null>(null);
  const [selectedPermissions, setSelectedPermissions] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [permissionLoading, setPermissionLoading] = useState(false);

  useEffect(() => {
    loadRoles();
  }, []);

  const loadRoles = async () => {
    setLoading(true);
    try {
      const r = await getRoles();
      setRoles(r || []);
    } catch {
      message.error("Failed to load roles");
    } finally {
      setLoading(false);
    }
  };

  const loadPermissions = async (id: number) => {
    setRoleId(id);
    setPermissionLoading(true);
    try {
      const data = await getRolePermissions(id);
      // Assuming the backend returns an array of strings or permissions objects
      // If it's the synthetic module:action format, we keep it. 
      // If it's codenames, we need to be careful.
      const permList = data || [];
      setSelectedPermissions(permList.map((p: any) => typeof p === 'string' ? p : p.codename));
    } catch {
      message.error("Failed to load permissions");
    } finally {
      setPermissionLoading(false);
    }
  };

  const togglePermission = async (key: string) => {
    if (!roleId) return;

    let updated;
    if (selectedPermissions.includes(key)) {
      updated = selectedPermissions.filter((p) => p !== key);
    } else {
      updated = [...selectedPermissions, key];
    }

    setSelectedPermissions(updated);

    try {
      await updateRolePermissions(roleId, updated);
      message.success("Permissions updated");
    } catch {
      message.error("Failed to update permissions");
      // Rollback UI state on failure
      setSelectedPermissions(selectedPermissions);
    }
  };

  return (
    <div style={{ padding: '0 4px' }}>
      <Space direction="vertical" size="large" style={{ width: '100%' }}>
        <div style={{ background: '#fff', padding: '16px', borderRadius: '8px', border: '1px solid #f0f0f0' }}>
          <Space align="center">
            <Text strong>Target Role:</Text>
            <Select
              placeholder="Select a role to manage permissions"
              style={{ width: 300 }}
              options={roles.map((r) => ({
                label: r.name,
                value: r.id,
              }))}
              onChange={loadPermissions}
              loading={loading}
            />
          </Space>
        </div>

        {!roleId ? (
          <Empty description="Select a role to view and manage permission matrix" style={{ marginTop: 40 }} />
        ) : permissionLoading ? (
          <div style={{ textAlign: 'center', padding: '100px 0' }}>
            <Spin tip="Loading module permissions..." />
          </div>
        ) : (
          <Row gutter={[16, 16]}>
            {modules.map((module) => (
              <Col xs={24} sm={12} lg={8} key={module}>
                <Card
                  title={module.toUpperCase()}
                  size="small"
                  className="permission-module-card"
                  styles={{ header: { backgroundColor: '#fafafa' } }}
                  style={{ height: '100%', borderRadius: '8px', overflow: 'hidden' }}
                >
                  <Space direction="vertical" style={{ width: '100%', padding: '8px 0' }}>
                    {actions.map((action) => {
                      // Note: Keeping the existing key format logic (module:action)
                      const key = `${module}:${action}`;
                      const isChecked = selectedPermissions.includes(key);

                      return (
                        <div
                          key={action}
                          style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            padding: '6px 12px',
                            borderRadius: '4px',
                            background: isChecked ? '#e6f4ff' : 'transparent',
                            transition: 'background 0.3s'
                          }}
                        >
                          <Text style={{ textTransform: 'capitalize' }}>{action}</Text>
                          <Checkbox
                            checked={isChecked}
                            onChange={() => togglePermission(key)}
                          />
                        </div>
                      );
                    })}
                  </Space>
                </Card>
              </Col>
            ))}
          </Row>
        )}
      </Space>
    </div>
  );
};

export default PermissionsTab;
