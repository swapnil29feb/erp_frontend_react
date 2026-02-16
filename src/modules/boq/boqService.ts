
import apiClient from "../../api/apiClient";

export async function getBOQVersions(projectId: number) {
    const res = await apiClient.get(`/boq/versions/${projectId}/`);
    return res.data;
}

export async function getBOQDetail(boqId: number) {
    const res = await apiClient.get(`/boq/summary/detail/${boqId}/`);
    return res.data;
}

export async function generateBOQ(projectId: number) {
    const res = await apiClient.post(`/boq/generate/${projectId}/`);
    return res.data;
}

export async function applyMargin(boqId: number, margin: number) {
    return apiClient.post(`/boq/${boqId}/apply-margin/`, { markup_pct: margin });
}

export async function approveBOQ(boqId: number) {
    return apiClient.post(`/boq/${boqId}/approve/`);
}

export async function patchItemPrice(itemId: number, unitPrice: number) {
    return apiClient.patch(`/boq/items/${itemId}/`, { unit_price: unitPrice });
}

export async function exportPDF(boqId: number) {
    const res = await apiClient.get(`/boq/export/pdf/${boqId}/`, {
        responseType: 'blob'
    });
    return res.data;
}

export async function exportExcel(boqId: number) {
    const res = await apiClient.get(`/boq/export/excel/${boqId}/`, {
        responseType: 'blob'
    });
    return res.data;
}

export async function exportBOQExcel(boqId: number) {
    const res = await apiClient.get(`/boq/${boqId}/export-excel/`, {
        responseType: 'blob'
    });
    return res.data;
}
