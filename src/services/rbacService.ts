import apiClient from "../api/apiClient";

export const getUsers = async () => {
  const res = await apiClient.get("/users/");
  return res.data;
};

export const createUser = async (data: any) => {
  const res = await apiClient.post("/users/", data);
  return res.data;
};

export const updateUser = async (id: number, data: any) => {
  const res = await apiClient.patch(`/users/${id}/`, data);
  return res.data;
};

export const getRoles = async () => {
  const res = await apiClient.get("/roles/");
  return res.data;
};

export const createRole = async (data: any) => {
  const res = await apiClient.post("/roles/", data);
  return res.data;
};

export const updateRole = async (id: number, data: any) => {
  const res = await apiClient.patch(`/roles/${id}/`, data);
  return res.data;
};

export const getPermissions = async () => {
  const res = await apiClient.get("/permissions/");
  return res.data;
};

export const getRolePermissions = async (roleId: number) => {
  const res = await apiClient.get(`/roles/${roleId}/permissions/`);
  return res.data;
};

export const updateRolePermissions = async (
  roleId: number,
  permissions: string[]
) => {
  const res = await apiClient.post(
    `/roles/${roleId}/permissions/`,
    { permissions }
  );
  return res.data;
};
