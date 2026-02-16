import { useEffect, useState } from "react";
import { Table, Button, Modal, Form, Input, Select } from "antd";
import { getUsers, createUser, getRoles } from "../../services/rbacService";

const UsersTab = () => {
    const [users, setUsers] = useState<any[]>([]);
    const [roles, setRoles] = useState<any[]>([]);
    const [open, setOpen] = useState(false);
    const [form] = Form.useForm();

    const loadData = async () => {
        const u = await getUsers();
        const r = await getRoles();
        setUsers(u);
        setRoles(r);
    };

    useEffect(() => {
        loadData();
    }, []);

    const handleCreate = async () => {
        const values = await form.validateFields();
        await createUser(values);
        setOpen(false);
        form.resetFields();
        loadData();
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
                    { title: "Name", dataIndex: "name" },
                    { title: "Email", dataIndex: "email" },
                    {
                        title: "Role",
                        dataIndex: ["role", "name"],
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
                    <Form.Item name="name" label="Full Name" rules={[{ required: true }]}>
                        <Input />
                    </Form.Item>

                    <Form.Item name="email" label="Email" rules={[{ required: true }]}>
                        <Input />
                    </Form.Item>

                    <Form.Item
                        name="password"
                        label="Password"
                        rules={[{ required: true }]}
                    >
                        <Input.Password />
                    </Form.Item>

                    <Form.Item name="role_id" label="Role" rules={[{ required: true }]}>
                        <Select
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
