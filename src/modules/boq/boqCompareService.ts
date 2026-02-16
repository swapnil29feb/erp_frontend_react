import apiClient from "../../api/apiClient";



export async function getVersions(projectId: number) {
    const res = await apiClient.get(`/boq/versions/${projectId}/`);
    return res.data;
}

export async function compareVersions(projectId: number, v1: number, v2: number) {
    const res = await apiClient.get(
        `/boq/compare/${projectId}/?v1=${v1}&v2=${v2}`
    );
    return res.data;
}
