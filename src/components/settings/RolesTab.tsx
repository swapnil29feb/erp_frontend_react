import { useEffect, useState } from "react";
import { Table, Button, Modal, Form, Input, message } from "antd";
import { getRoles, createRole } from "../../services/rbacService";

const RolesTab = () => {
    const [roles, setRoles] = useState<any[]>([]);
    const [open, setOpen] = useState(false);
    const [form] = Form.useForm();

    const loadRoles = async () => {
        try {
            const r = await getRoles();
            setRoles(r || []);
        } catch {
            message.error("Failed to load roles");
        }
    };

    useEffect(() => {
        loadRoles();
    }, []);

    const handleCreate = async () => {
        try {
            const values = await form.validateFields();
            await createRole(values);
            message.success("Role created");
            setOpen(false);
            form.resetFields();
            loadRoles();
        } catch {
            message.error("Failed to create role");
        }
    };

    return (
        <>
            <Button type="primary" onClick={() => setOpen(true)}>
                Create Role
            </Button>

            <Table
                style={{ marginTop: 16 }}
                dataSource={roles}
                rowKey="id"
                columns={[{ title: "Role Name", dataIndex: "name" }]}
            />

            <Modal
                title="Create Role"
                open={open}
                onCancel={() => setOpen(false)}
                onOk={handleCreate}
            >
                <Form form={form} layout="vertical">
                    <Form.Item name="name" label="Role Name" rules={[{ required: true }]}>
                        <Input />
                    </Form.Item>
                </Form>
            </Modal>
        </>
    );
};

export default RolesTab;

