import { useEffect, useState, useCallback, useMemo } from "react";
import BOQToolbar from "./BOQToolbar";
import BOQTable from "./BOQTable";
import BOQVersionList from "./BOQVersionList";
import {
    getBOQDetail,
    getBOQVersions,
    generateBOQ,
    applyMargin,
    approveBOQ,
    exportPDF,
    exportBOQExcel
} from "./boqService";
import type { BOQItem, BOQVersion } from "./types";
import ProjectSearch, { type Project } from "../../components/projects/ProjectSearch";
import ActivityFAB from "../../components/common/ActivityFAB";

interface BOQPageProps {
    projectId: number;
    initialBoqId?: number;
}

export default function BOQPage({ projectId: initialProjectId, initialBoqId }: BOQPageProps) {
    const [currentProjectId, setCurrentProjectId] = useState<number | null>(initialProjectId || null);
    const [project, setProject] = useState<Project | null>(null);

    const [versions, setVersions] = useState<BOQVersion[]>([]);
    const [selectedId, setSelectedId] = useState<number | null>(initialBoqId || null);

    // Core state
    const [items, setItems] = useState<BOQItem[]>([]);
    const [marginPercent, setMarginPercent] = useState<number>(0);
    const [status, setStatus] = useState<string>('DRAFT');
    const [versionNum, setVersionNum] = useState<number>(0);

    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(false);

    // Modal States
    const [showMarginModal, setShowMarginModal] = useState(false);
    const [modalMargin, setModalMargin] = useState<number>(0);
    const [showApproveModal, setShowApproveModal] = useState(false);
console.log(items)
    // Derived Summary
    const totals = useMemo(() => {
        const subtotal = items.reduce((acc, item) => acc + (item.unit_price * item.qty), 0);
        const grandTotal = subtotal + (subtotal * marginPercent / 100);
        return { subtotal, grandTotal };
    }, [items, marginPercent]);

    const loadVersions = useCallback(async (autoSelect = true) => {
        if (!currentProjectId) return;
        setLoading(true);
        try {
            const data = await getBOQVersions(currentProjectId);

            if (Array.isArray(data) && data.length > 0) {
                setVersions(data);
                if (autoSelect) {
                    const exists = initialBoqId ? data.find(v => v.id === initialBoqId) : null;
                    setSelectedId(exists ? exists.id : data[0].id);
                }
            } else {
                setVersions([]);
                setSelectedId(null);
            }
        } catch (err) {
            console.error("Failed to load versions", err);
            setVersions([]);
            setSelectedId(null);
        } finally {
            setLoading(false);
        }
    }, [currentProjectId, initialBoqId]);

    useEffect(() => {
        loadVersions();
    }, [loadVersions]);

    const loadDetail = useCallback(async (id: number) => {
        setLoading(true);
        try {
            const res = await getBOQDetail(id);
            setItems(res.items || []);
            setMarginPercent(res.margin_percent || 0);
            setStatus(res.status || 'DRAFT');
            setVersionNum(res.version || 0);
        } catch (err) {
            console.error("Failed to load BOQ details", err);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        if (selectedId) {
            loadDetail(selectedId);
        } else {
            setItems([]);
            setMarginPercent(0);
            setStatus('DRAFT');
            setVersionNum(0);
        }
    }, [selectedId, loadDetail]);

    const reloadBOQ = useCallback(async () => {
        const id = selectedId;
        if (!id) {
            setStatus("NO_BOQ");
            setItems([]);
            return;
        }

        setLoading(true);
        try {
            const res = await getBOQDetail(id);
            if (!res) {
                setStatus("NO_BOQ");
                setItems([]);
            } else {
                setItems(res.items || []);
                setMarginPercent(res.margin_percent || 0);
                setStatus(res.status || 'DRAFT');
                setVersionNum(res.version || 0);
            }
            // Also refresh versions list
            await loadVersions(false);
        } catch (err) {
            console.error("Failed to reload BOQ details", err);
        } finally {
            setLoading(false);
        }
    }, [selectedId, loadVersions]);

    const handleGenerate = async () => {
        if (!currentProjectId) return;
        setActionLoading(true);
        try {
            const res = await generateBOQ(currentProjectId);
            // Assuming res contains the new boq or we can just reload versions
            await loadVersions(true);
            // After loadVersions(true), if it sets selectedId, reloadBOQ will work in next cycle
            // but for immediate feedback:
            if (res && res.id) {
                setSelectedId(res.id);
                // We can't await reloadBOQ here easily because it depends on selectedId state
                // But we can call loadDetail directly with the new ID
                await loadDetail(res.id);
            }
        } catch (err) {
            alert("Failed to generate BOQ");
        } finally {
            setActionLoading(false);
        }
    };

    const handleApplyMargin = () => {
        if (!selectedId) return;
        setModalMargin(marginPercent || 0);
        setShowMarginModal(true);
    };

    const confirmApplyMargin = async () => {
        if (!selectedId) return;
        setActionLoading(true);
        try {
            await applyMargin(selectedId, modalMargin);
            setShowMarginModal(false);
            await reloadBOQ();
            // message.success is usually available globally or imported, using alert for now as per prev code
            alert("Margin applied successfully");
        } catch (err) {
            console.error(err);
            alert("Failed to apply margin");
        } finally {
            setActionLoading(false);
        }
    };

    const handleApprove = () => {
        if (!selectedId) return;
        setShowApproveModal(true);
    };

    const confirmApprove = async () => {
        if (!selectedId) return;
        setActionLoading(true);
        try {
            await approveBOQ(selectedId);
            setShowApproveModal(false);
            await reloadBOQ();
        } catch (err) {
            console.error(err);
            alert("Failed to approve BOQ");
        } finally {
            setActionLoading(false);
        }
    };

    // Updated export handler using blob logic
    const handleExportExcel = async (boqId: number) => {
        try {
            const res = await exportBOQExcel(boqId);
            const url = window.URL.createObjectURL(new Blob([res]));
            const link = document.createElement("a");
            link.href = url;
            link.download = `BOQ_v${versionNum}.xlsx`;
            link.click();
            window.URL.revokeObjectURL(url);
        } catch (err) {
            console.error("Export failed", err);
            alert("Failed to export Excel");
        }
    };

    const handleExportPDF = async (boqId: number) => {
        try {
            const res = await exportPDF(boqId);
            const url = window.URL.createObjectURL(new Blob([res], { type: 'application/pdf' }));
            const link = document.createElement("a");
            link.href = url;
            link.download = `BOQ_v${versionNum}.pdf`;
            link.click();
            window.URL.revokeObjectURL(url);
        } catch (err) {
            console.error("PDF Export failed", err);
            alert("Failed to export PDF");
        }
    };

    const handlePriceChange = (itemId: number, newPrice: number) => {
        setItems(prev => prev.map(item => {
            if (item.id === itemId) {
                const updatedPrice = newPrice;
                const updatedTotal = updatedPrice * item.qty;
                return { ...item, unit_price: updatedPrice, total: updatedTotal };
            }
            return item;
        }));
    };

    const isLocked = status === 'APPROVED' || status === 'FINAL';



    return (
        <div style={styles.container}>
            <div style={styles.searchHeader}>
                <ProjectSearch
                    onSelect={(p) => {
                        setProject(p);
                        setCurrentProjectId(p.id);
                    }}
                />
                {project && (
                    <div style={styles.projectInfo}>
                        <strong>Selected: {project.name}</strong> ({project.code})
                    </div>
                )}
                <div style={{
                    marginLeft: 'auto',
                    padding: '8px 24px',
                    borderRadius: '8px',
                    fontSize: '14px',
                    fontWeight: 700,
                    backgroundColor: '#1e293b',
                    color: '#fff',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '16px',
                    border: '1px solid #334155'
                }}>
                    {!selectedId ? (
                        "NO BOQ SELECTED"
                    ) : (
                        <>
                            <span>BOQ V{versionNum}</span>
                            <span style={{ opacity: 0.5 }}>|</span>
                            <span style={{ color: status === 'APPROVED' || status === 'FINAL' ? '#10b981' : '#fbbf24' }}>
                                STATUS: {status}
                            </span>
                        </>
                    )}
                </div>
            </div>

            <div style={styles.mainWrapper}>
                {/* ZONE 1: Left panel (Versions) */}
                <BOQVersionList
                    versions={versions}
                    selectedId={selectedId}
                    onSelect={setSelectedId}
                    onGenerate={handleGenerate}
                    isGenerating={actionLoading}
                />

                {/* ZONE 2 & 3: Main workspace */}
                <div style={styles.main}>
                    {selectedId ? (
                        <>
                            <BOQToolbar
                                version={versionNum}
                                status={status}
                                onApplyMargin={handleApplyMargin}
                                onApprove={handleApprove}
                                onExportPDF={() => selectedId && handleExportPDF(selectedId)}
                                onExportExcel={() => selectedId && handleExportExcel(selectedId)}
                                isLoading={actionLoading}
                            />

                            <div style={styles.workspaceBody}>
                                <div style={styles.centerPanel}>
                                    {loading ? (
                                        <div style={styles.loading}>Loading BOQ details...</div>
                                    ) : (
                                        <>
                                            <div style={{ flex: 1, overflowY: 'auto' }}>
                                                <BOQTable
                                                    items={items}
                                                    isLocked={isLocked}
                                                    onPriceChange={handlePriceChange}
                                                />
                                            </div>

                                            {/* Professional Summary Footer */}
                                            <div style={styles.inlineFooter}>
                                                <div style={styles.footerRow}>
                                                    <span>Subtotal:</span>
                                                    <span>₹ {totals.subtotal.toLocaleString()}</span>
                                                </div>
                                                <div style={styles.footerRow}>
                                                    <span>Margin ({marginPercent}%):</span>
                                                    <span>₹ {(totals.subtotal * marginPercent / 100).toLocaleString()}</span>
                                                </div>
                                                <div style={styles.footerTotalRow}>
                                                    <span>Grand Total:</span>
                                                    <span>₹ {totals.grandTotal.toLocaleString()}</span>
                                                </div>
                                            </div>
                                        </>
                                    )}
                                </div>
                            </div>
                        </>
                    ) : (
                        <div style={styles.emptyState}>
                            <div style={styles.emptyContent}>
                                <h3 style={styles.emptyTitle}>No BOQ versions available</h3>
                                <p style={styles.emptyText}>Search for a project and click "Generate BOQ" to create your first version.</p>
                            </div>
                        </div>
                    )}

                    {showMarginModal && (
                        <div style={modalStyles.overlay}>
                            <div style={modalStyles.modal}>
                                <h3 style={modalStyles.title}>Apply Margin</h3>
                                <div style={{ marginBottom: '20px' }}>
                                    <label style={{ display: 'block', fontSize: '13px', color: '#64748b', marginBottom: '8px', fontWeight: '500' }}>
                                        Enter Margin %
                                    </label>
                                    <input
                                        type="number"
                                        style={modalStyles.input}
                                        value={modalMargin}
                                        onChange={(e) => setModalMargin(parseFloat(e.target.value) || 0)}
                                        autoFocus
                                    />
                                </div>
                                <div style={modalStyles.actions}>
                                    <button
                                        onClick={confirmApplyMargin}
                                        style={modalStyles.btnPrimary}
                                        disabled={actionLoading}
                                    >
                                        {actionLoading ? 'Applying...' : 'Apply'}
                                    </button>
                                    <button
                                        onClick={() => setShowMarginModal(false)}
                                        style={modalStyles.btnSecondary}
                                        disabled={actionLoading}
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    {showApproveModal && (
                        <div style={modalStyles.overlay}>
                            <div style={modalStyles.modal}>
                                <h3 style={modalStyles.title}>Are you sure?</h3>
                                <p style={{ fontSize: '14px', color: '#64748b', marginBottom: '24px', lineHeight: '1.5' }}>
                                    This will lock the BOQ permanently. You won't be able to edit margins or prices after approval.
                                </p>
                                <div style={modalStyles.actions}>
                                    <button
                                        onClick={confirmApprove}
                                        style={{ ...modalStyles.btnPrimary, backgroundColor: '#059669' }}
                                        disabled={actionLoading}
                                    >
                                        {actionLoading ? 'Approving...' : 'Approve'}
                                    </button>
                                    <button
                                        onClick={() => setShowApproveModal(false)}
                                        style={modalStyles.btnSecondary}
                                        disabled={actionLoading}
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
            {selectedId && <ActivityFAB entity="boq_version" entityId={selectedId} />}
        </div >
    );
}

const modalStyles = {
    overlay: {
        position: 'fixed' as const,
        inset: 0,
        backgroundColor: 'rgba(0,0,0,0.5)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
    },
    modal: {
        backgroundColor: 'white',
        padding: '24px',
        borderRadius: '12px',
        width: '320px',
        boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
    },
    title: {
        fontSize: '18px',
        fontWeight: '700',
        marginBottom: '16px',
        color: '#1e293b',
    },
    input: {
        width: '100%',
        padding: '10px 12px',
        border: '1px solid #cbd5e1',
        borderRadius: '6px',
        fontSize: '16px',
        fontWeight: '600',
        color: '#1e293b',
        outline: 'none',
        transition: 'border-color 0.2s',
    },
    actions: {
        display: 'flex',
        gap: '12px',
        marginTop: '24px',
    },
    btnPrimary: {
        flex: 1,
        padding: '10px 16px',
        backgroundColor: '#2563eb',
        color: 'white',
        border: 'none',
        borderRadius: '6px',
        cursor: 'pointer',
        fontSize: '14px',
        fontWeight: '600',
    },
    btnSecondary: {
        flex: 1,
        padding: '10px 16px',
        backgroundColor: '#fff',
        color: '#475569',
        border: '1px solid #e2e8f0',
        borderRadius: '6px',
        cursor: 'pointer',
        fontSize: '14px',
        fontWeight: '600',
    },
};

const styles = {
    container: {
        display: 'flex',
        flexDirection: 'column' as const,
        height: '100%',
        backgroundColor: '#f1f5f9',
        overflow: 'hidden'
    },
    searchHeader: {
        padding: '16px 24px',
        backgroundColor: '#fff',
        borderBottom: '1px solid #e2e8f0',
        display: 'flex',
        alignItems: 'center',
        gap: '20px'
    },
    projectInfo: {
        fontSize: '14px',
        color: '#475569'
    },
    mainWrapper: {
        flex: 1,
        display: 'flex',
        overflow: 'hidden'
    },
    main: {
        flex: 1,
        display: 'flex',
        flexDirection: 'column' as const,
        overflow: 'hidden'
    },
    workspaceBody: {
        flex: 1,
        display: 'flex',
        overflow: 'hidden'
    },
    centerPanel: {
        flex: 1,
        display: 'flex',
        flexDirection: 'column' as const,
        overflowY: 'hidden' as const,
        padding: '24px',
        backgroundColor: '#fff'
    },
    loading: {
        padding: '40px',
        textAlign: 'center' as const,
        color: '#64748b'
    },
    inlineFooter: {
        marginTop: '24px',
        padding: '20px',
        backgroundColor: '#f8fafc',
        borderRadius: '8px',
        alignSelf: 'flex-end',
        width: '300px',
        display: 'flex',
        flexDirection: 'column' as const,
        gap: '8px',
        border: '1px solid #e2e8f0'
    },
    footerRow: {
        display: 'flex',
        justifyContent: 'space-between',
        fontSize: '13px',
        color: '#475569'
    },
    footerTotalRow: {
        display: 'flex',
        justifyContent: 'space-between',
        fontSize: '16px',
        fontWeight: 'bold',
        color: '#1e293b',
        margin: '4px 0',
        padding: '4px 0',
        borderTop: '1px solid #e2e8f0',
        borderBottom: '1px solid #e2e8f0'
    },
    emptyState: {
        flex: 1,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#f8fafc'
    },
    emptyContent: {
        textAlign: 'center' as const,
        padding: '40px'
    },
    emptyTitle: {
        fontSize: '18px',
        fontWeight: '700',
        color: '#1e293b',
        marginBottom: '8px'
    },
    emptyText: {
        fontSize: '14px',
        color: '#64748b'
    }
} as const;
