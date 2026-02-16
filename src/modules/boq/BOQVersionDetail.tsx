
import { useEffect, useState, useCallback } from "react";
import { useParams } from "react-router-dom";
import BOQToolbar from "./BOQToolbar";
import BOQTable from "./BOQTable";
import BOQFooter from "./BOQFooter";
import { getBOQDetail, applyMargin, approveBOQ, exportPDF, exportExcel } from "./boqService";
import type { BOQItem, BOQSummary } from "./types";
import apiClient from "../../api/apiClient";

export default function BOQVersionDetail() {
    const { boqId } = useParams();
    

    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(false);
    const [items, setItems] = useState<BOQItem[]>([]);
    const [summary, setSummary] = useState<BOQSummary & { status?: string, version?: number }>({
        subtotal: 0,
        margin_percent: 0,
        grand_total: 0,
        status: 'DRAFT',
        version: 0
    });
    const [projectInfo, setProjectInfo] = useState({ name: '', client: '' });

    const loadData = useCallback(async () => {
        if (!boqId) return;
        setLoading(true);
        try {
            const data = await getBOQDetail(Number(boqId));

            setItems(data.items || []);
            setSummary({
                subtotal: data.subtotal || 0,
                margin_percent: data.margin_percent || 0,
                grand_total: data.grand_total || 0,
                status: data.status || 'DRAFT',
                version: data.version || 0
            });

            // If the API doesn't provide project info, we might need a separate call
            // Using placeholder logic or assuming it might be in data based on context
            if (data.project_name) {
                setProjectInfo({
                    name: data.project_name,
                    client: data.client_name || ''
                });
            } else if (data.project_id) {
                // Fetch project details if we have project_id
                const pRes = await apiClient.get(`/projects/projects/${data.project_id}/`);
                setProjectInfo({
                    name: pRes.data.name,
                    client: pRes.data.client_name || ''
                });
            }
        } catch (err) {
            console.error("Failed to load BOQ detail", err);
        } finally {
            setLoading(false);
        }
    }, [boqId]);

    useEffect(() => {
        loadData();
    }, [loadData]);

    const handleApplyMargin = async () => {
        if (!boqId) return;
        const margin = prompt("Enter margin percentage (e.g. 15 for 15%):", summary.margin_percent.toString());
        if (margin === null) return;

        const mVal = parseFloat(margin);
        if (isNaN(mVal)) return alert("Please enter a valid number");

        setActionLoading(true);
        try {
            await applyMargin(Number(boqId), mVal);
            await loadData();
        } catch (err) {
            alert("Failed to apply margin");
        } finally {
            setActionLoading(false);
        }
    };

    const handleApprove = async () => {
        if (!boqId) return;
        if (!confirm("Are you sure? Approving will lock this version and its configuration.")) return;

        setActionLoading(true);
        try {
            await approveBOQ(Number(boqId));
            await loadData();
        } catch (err) {
            alert("Approval failed");
        } finally {
            setActionLoading(false);
        }
    };

    if (loading) {
        return <div style={styles.center}>Loading BOQ details...</div>;
    }

    return (
        <div style={styles.container}>
            <BOQToolbar
                version={summary.version || 0}
                projectName={projectInfo.name}
                clientName={projectInfo.client}
                status={summary.status || 'DRAFT'}
                onApplyMargin={handleApplyMargin}
                onApprove={handleApprove}
                onExportPDF={() => exportPDF(Number(boqId))}
                onExportExcel={() => exportExcel(Number(boqId))}
                isLoading={actionLoading}
            />

            <div style={styles.content}>
                <BOQTable items={items} isLocked={(summary.status || '').toUpperCase() === 'APPROVED'} />
            </div>

            <BOQFooter summary={summary} />
        </div>
    );
}

const styles = {
    container: {
        display: 'flex',
        flexDirection: 'column' as const,
        height: '100%',
        backgroundColor: '#fff'
    },
    content: {
        flex: 1,
        overflowY: 'auto' as const
    },
    center: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100vh',
        fontSize: '14px',
        color: '#64748b'
    }
};
