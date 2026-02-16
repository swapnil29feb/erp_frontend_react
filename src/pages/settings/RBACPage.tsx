import { Tabs, Card } from "antd";
import UsersTab from "./UsersTab";
import RolesTab from "./RolesTab";

const RBACPage = () => {
    return (
        <Card title="User & Role Management" variant="borderless">
            <Tabs
                items={[
                    {
                        key: "users",
                        label: "Users",
                        children: <UsersTab />,
                    },
                    {
                        key: "roles",
                        label: "Roles",
                        children: <RolesTab />,
                    },
                ]}
            />
        </Card>
    );
};

export default RBACPage;
