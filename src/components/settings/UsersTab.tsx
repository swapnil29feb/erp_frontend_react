import { useEffect, useState } from "react";
import { Table, Button, Modal, Form, Input, Select, message } from "antd";
import {
  getUsers,
  createUser,
  getRoles,
} from "../../services/rbacService";

const UsersTab = () => {
  const [users, setUsers] = useState<any[]>([]);
  const [roles, setRoles] = useState<any[]>([]);
  const [open, setOpen] = useState(false);
  const [form] = Form.useForm();

  const loadData = async () => {
    try {
      const u = await getUsers();
      const r = await getRoles();
      setUsers(u || []);
      setRoles(r || []);
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

  return (
    <>
      <Button type="primary" onClick={() => setOpen(true)}>
        Create User
      </Button>

      <Table
        style={{ marginTop: 16 }}
        dataSource={users}
        rowKey="id"
        columns={[
          { title: "Username", dataIndex: "username" },
          { title: "Email", dataIndex: "email" },
          {
            title: "Roles",
            render: (row: any) =>
              row.groups?.map((g: any) => g.name).join(", "),
          },
        ]}
      />

      <Modal
        title="Create User"
        open={open}
        onCancel={() => setOpen(false)}
        onOk={handleCreate}
      >
        <Form form={form} layout="vertical">
          <Form.Item name="username" label="Username" rules={[{ required: true }] }>
            <Input />
          </Form.Item>

          <Form.Item name="email" label="Email">
            <Input />
          </Form.Item>

          <Form.Item name="password" label="Password" rules={[{ required: true }] }>
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
    </>
  );
};

export default UsersTab;

