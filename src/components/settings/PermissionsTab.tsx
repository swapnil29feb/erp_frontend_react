import { useEffect, useState } from "react";
import { Table, Checkbox, Select, message } from "antd";
import {
  getRoles,
  getRolePermissions,
  updateRolePermissions,
} from "../../services/rbacService";

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

  useEffect(() => {
    loadRoles();
  }, []);
 
  const loadRoles = async () => {
    const r = await getRoles();
    setRoles(r || []);
  };

  const loadPermissions = async (id: number) => {
    setRoleId(id);
    const data = await getRolePermissions(id);
    setSelectedPermissions(data || []);
  };

  const togglePermission = async (key: string) => {
    let updated;

    if (selectedPermissions.includes(key)) {
      updated = selectedPermissions.filter((p) => p !== key);
    } else {
      updated = [...selectedPermissions, key];
    }

    setSelectedPermissions(updated);

    if (roleId) {
      await updateRolePermissions(roleId, updated);
      message.success("Permissions updated");
    }
  };

  const columns = [
    { title: "Module", dataIndex: "module" },
    ...actions.map((action) => ({
      title: action.toUpperCase(),
      render: (_: any, record: any) => {
        const key = `${record.module}:${action}`;
        return (
          <Checkbox
            checked={selectedPermissions.includes(key)}
            onChange={() => togglePermission(key)}
          />
        );
      },
    })),
  ];

  const data = modules.map((m) => ({ module: m }));

  return (
    <>
      <Select
        placeholder="Select Role"
        style={{ width: 250, marginBottom: 20 }}
        options={roles.map((r) => ({
          label: r.name,
          value: r.id,
        }))}
        onChange={loadPermissions}
      />

      <Table
        columns={columns}
        dataSource={data}
        rowKey="module"
        pagination={false}
      />
    </>
  );
};

export default PermissionsTab;
