import type { ReactNode } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "./AuthContext";

type Props = {
    permission: string;
    children: ReactNode;
};

const PermissionRoute = ({ permission, children }: Props) => {
    const { permissions } = useAuth();

    if (!permissions.includes(permission)) {
        return <Navigate to="/dashboard" replace />;
    }

    return children;
};

export default PermissionRoute;
