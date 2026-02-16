import { useEffect, useState } from "react";
import { Table, Button, Modal, Form, Input } from "antd";
import { getRoles, createRole } from "../../services/rbacService";

const RolesTab = () => {
    const [roles, setRoles] = useState<any[]>([]);
    const [open, setOpen] = useState(false);
    const [form] = Form.useForm();

    const loadRoles = async () => {
        const r = await getRoles();
        setRoles(r);
    };

    useEffect(() => {
        loadRoles();
    }, []);

    const handleCreate = async () => {
        const values = await form.validateFields();
        await createRole(values);
        setOpen(false);
        form.resetFields();
        loadRoles();
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
                columns={[
                    { title: "Role Name", dataIndex: "name" },
                    { title: "Description", dataIndex: "description" },
                ]}
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

                    <Form.Item name="description" label="Description">
                        <Input />
                    </Form.Item>
                </Form>
            </Modal>
        </>
    );
};

export default RolesTab;
