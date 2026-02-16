import React, { useMemo, useState } from "react";
import { message } from "antd";
import { boqService } from "../../services/boqService";

interface SummaryProps {
    configurations: any[];
    projectId?: number;
    onBoqGenerated?: (boqId: number) => void;
}

const format = (val: any) => {
    const n = parseFloat(val);
    return isNaN(n) ? "0" : n.toLocaleString('en-IN');
};

const SummaryTab: React.FC<SummaryProps> = ({ configurations, projectId, onBoqGenerated }) => {
    const [generating, setGenerating] = useState(false);
    const [existingBoq, setExistingBoq] = useState<any>(null);

    // Check for existing BOQ on load
    React.useEffect(() => {
        const checkExistingBOQ = async () => {
            if (!projectId) return;
            try {
                const latest = await boqService.getLatestBOQ(projectId);
                if (latest && (latest.boq_id || latest.id)) {
                    setExistingBoq(latest);
                } else {
                    setExistingBoq(null);
                }
            } catch (err) {
                console.log("No existing BOQ found or error checking:", err);
            }
        };
        checkExistingBOQ();
    }, [projectId]);

    // Calculate totals
    const totals = useMemo(() => {
        return configurations.reduce((acc, cfg) => {
            const qty = cfg.quantity || 0;
            const prodPrice = cfg.price || 0;
            const prodTotal = prodPrice * qty;
            const driverTotal = (cfg.driverPrice || 0) * qty;
            const accsTotalRow = (cfg.accessoriesTotal || 0) * qty;

            return {
                productCost: acc.productCost + prodTotal,
                driverCost: acc.driverCost + driverTotal,
                accessoryCost: acc.accessoryCost + accsTotalRow,
                grandTotal: acc.grandTotal + prodTotal + driverTotal + accsTotalRow
            };
        }, {
            productCost: 0,
            driverCost: 0,
            accessoryCost: 0,
            grandTotal: 0
        });
    }, [configurations]);

    const handleExportPDF = async (boqId: number) => {
        try {
            const res = await boqService.exportPDF(boqId);
            const url = window.URL.createObjectURL(new Blob([res], { type: 'application/pdf' }));
            const link = document.createElement("a");
            link.href = url;
            link.download = `BOQ.pdf`;
            link.click();
            window.URL.revokeObjectURL(url);
        } catch (err) {
            message.error("Failed to export PDF");
        }
    };

    const handleExportExcel = async (boqId: number) => {
        try {
            const res = await boqService.exportExcel(boqId);
            const url = window.URL.createObjectURL(new Blob([res]));
            const link = document.createElement("a");
            link.href = url;
            link.download = `BOQ.xlsx`;
            link.click();
            window.URL.revokeObjectURL(url);
        } catch (err) {
            message.error("Failed to export Excel");
        }
    };

    const handleApprove = async (boqId: number) => {
        if (!window.confirm("Approve this BOQ? This will lock it permanently.")) return;
        try {
            await boqService.approveBOQ(boqId);
            message.success("BOQ Approved");
            const latest = await boqService.getLatestBOQ(projectId!);
            setExistingBoq(latest);
        } catch (err) {
            message.error("Failed to approve");
        }
    };

    const handleGenerateBOQ = async () => {
        if (!projectId) return;
        setGenerating(true);
        try {
            const res = await boqService.generateBOQ(projectId);
            const boqId = res.boq_id || res.id;
            if (onBoqGenerated) onBoqGenerated(boqId);
        } catch (error: any) {
            const latest = await boqService.getLatestBOQ(projectId);
            if (latest && (latest.boq_id || latest.id)) {
                if (onBoqGenerated) onBoqGenerated(latest.boq_id || latest.id);
                return;
            }
            message.error("Failed to generate BOQ");
        } finally {
            setGenerating(false);
        }
    };

    const hasConfigs = configurations.length > 0;

    return (
        <div style={container}>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
                <div style={{ width: '100%' }}>
                    <div style={card}>
                        <h3 style={title}>Configuration Summary</h3>
                        {configurations.length === 0 ? (
                            <div style={{ textAlign: 'center', padding: '40px', color: '#6b7280' }}>
                                No configurations found. Add configurations to generate a summary.
                            </div>
                        ) : (
                            <>
                                <div style={tableContainer}>
                                    <table style={table}>
                                        <thead>
                                            <tr>
                                                <th style={th}>Area</th>
                                                <th style={th}>Product</th>
                                                <th style={thRight}>Qty</th>
                                                <th style={thRight}>Base Price</th>
                                                <th style={thRight}>Total</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {configurations.map((cfg: any, index: number) => (
                                                <tr key={cfg.id || index} style={tr}>
                                                    <td style={td}>
                                                        <div style={{ fontWeight: 500 }}>{cfg.areaName}</div>
                                                        <div style={{ fontSize: 12, color: '#6b7280' }}>{cfg.subareaName}</div>
                                                    </td>
                                                    <td style={td}>
                                                        <div style={{ fontWeight: 500 }}>{cfg.productData?.order_code || 'Unknown Product'}</div>
                                                        <div style={{ fontSize: 12, color: '#6b7280' }}>
                                                            {cfg.driverData ? `+ ${cfg.driverData.order_code}` : ''}
                                                        </div>
                                                    </td>
                                                    <td style={tdRight}>{cfg.quantity}</td>
                                                    <td style={tdRight}>{format(cfg.price)}</td>
                                                    <td style={tdRight}>{format(cfg.subtotal)}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>

                                <div style={footer}>
                                    <div style={rowTotal}>
                                        <span>Product Cost</span>
                                        <strong>₹ {format(totals.productCost)}</strong>
                                    </div>
                                    <div style={rowTotal}>
                                        <span>Driver Cost</span>
                                        <strong>₹ {format(totals.driverCost)}</strong>
                                    </div>
                                    <div style={rowTotal}>
                                        <span>Total Accessory Cost</span>
                                        <strong>₹ {format(totals.accessoryCost)}</strong>
                                    </div>
                                    <div style={divider} />
                                    <div style={grandTotalRow}>
                                        <span>Grand Total</span>
                                        <strong>₹ {format(totals.grandTotal)}</strong>
                                    </div>
                                </div>

                                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px', marginTop: '24px' }}>
                                    {existingBoq ? (
                                        <div style={{ textAlign: 'center' }}>
                                            <div style={{ marginBottom: '16px', fontSize: '14px', color: '#475569', lineHeight: '1.6' }}>
                                                <div><strong>BOQ Version:</strong> V{existingBoq.version}</div>
                                                <div><strong>Status:</strong> {existingBoq.status || 'DRAFT'}</div>
                                            </div>
                                            <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
                                                <button
                                                    style={btnPrimary}
                                                    onClick={() => onBoqGenerated && onBoqGenerated(existingBoq.boq_id || existingBoq.id)}
                                                >
                                                    View BOQ
                                                </button>
                                                {existingBoq.status === 'DRAFT' && (
                                                    <>
                                                        <button
                                                            style={{ ...btnPrimary, backgroundColor: '#059669' }}
                                                            onClick={() => handleApprove(existingBoq.boq_id || existingBoq.id)}
                                                        >
                                                            Approve BOQ
                                                        </button>
                                                        <button
                                                            style={{ ...btnSecondary, borderColor: '#dc2626', color: '#dc2626' }}
                                                            onClick={() => handleExportPDF(existingBoq.boq_id || existingBoq.id)}
                                                        >
                                                            Export PDF (Watermarked)
                                                        </button>
                                                    </>
                                                )}
                                                {(existingBoq.status === 'APPROVED' || existingBoq.status === 'FINAL') && (
                                                    <>
                                                        <button
                                                            style={{ ...btnSecondary, borderColor: '#dc2626', color: '#dc2626' }}
                                                            onClick={() => handleExportPDF(existingBoq.boq_id || existingBoq.id)}
                                                        >
                                                            Export PDF
                                                        </button>
                                                        <button
                                                            style={{ ...btnSecondary, borderColor: '#16a34a', color: '#16a34a' }}
                                                            onClick={() => handleExportExcel(existingBoq.boq_id || existingBoq.id)}
                                                        >
                                                            Export Excel
                                                        </button>
                                                    </>
                                                )}
                                            </div>
                                        </div>
                                    ) : (
                                        <button
                                            style={{
                                                ...btnPrimary,
                                                ...(!hasConfigs || generating ? btnDisabled : {})
                                            }}
                                            onClick={handleGenerateBOQ}
                                            disabled={!hasConfigs || generating}
                                        >
                                            {generating ? 'Generating BOQ...' : 'Generate BOQ'}
                                        </button>
                                    )}
                                </div>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SummaryTab;

const container: React.CSSProperties = { padding: 24, width: '100%', margin: '0 auto' };
const card: React.CSSProperties = { background: "#fff", border: "1px solid #e5e7eb", borderRadius: 8, padding: 24, boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)' };
const title: React.CSSProperties = { fontSize: 20, marginBottom: 24, fontWeight: 600, color: '#111827' };
const tableContainer: React.CSSProperties = { overflowX: 'auto', marginBottom: 24, border: '1px solid #e5e7eb', borderRadius: 6 };
const table: React.CSSProperties = { width: '100%', borderCollapse: 'collapse', fontSize: 14 };
const th: React.CSSProperties = { textAlign: 'left', padding: '12px 16px', background: '#f9fafb', borderBottom: '1px solid #e5e7eb', fontWeight: 600, color: '#374151' };
const thRight: React.CSSProperties = { ...th, textAlign: 'right' };
const tr: React.CSSProperties = { borderBottom: '1px solid #e5e7eb' };
const td: React.CSSProperties = { padding: '12px 16px', color: '#111827', verticalAlign: 'top' };
const tdRight: React.CSSProperties = { ...td, textAlign: 'right' };
const footer: React.CSSProperties = { background: '#f9fafb', padding: 24, borderRadius: 8, maxWidth: '400px', marginLeft: 'auto', marginBottom: 24 };
const rowTotal: React.CSSProperties = { display: "flex", justifyContent: "space-between", marginBottom: 12, fontSize: 14, color: '#374151' };
const grandTotalRow: React.CSSProperties = { display: "flex", justifyContent: "space-between", fontSize: 18, fontWeight: 700, color: '#111827', marginTop: 16 };
const divider: React.CSSProperties = { borderTop: "1px solid #e5e7eb", margin: "12px 0" };
const btnPrimary: React.CSSProperties = { padding: '12px 24px', backgroundColor: '#2563eb', color: '#fff', border: 'none', borderRadius: 6, fontWeight: 600, cursor: 'pointer', fontSize: 14 };
const btnSecondary: React.CSSProperties = { padding: '12px 24px', backgroundColor: '#fff', color: '#374151', border: '1px solid #d1d5db', borderRadius: 6, fontWeight: 600, cursor: 'pointer', fontSize: 14 };
const btnDisabled: React.CSSProperties = { backgroundColor: '#9ca3af', cursor: 'not-allowed', opacity: 0.7 };
