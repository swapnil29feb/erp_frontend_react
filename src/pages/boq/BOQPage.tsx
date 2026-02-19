import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import apiClient from '../../api/apiClient';
import { boqService } from '../../services/boqService';
import { mapBOQSummary } from '../../utils/boqSummaryMapper';
import { projectService, type ProjectSearchResult } from '../../services/projectService';
import { Collapse } from 'antd';

interface BOQVersion {
    id: number;
    version: number;
    status: string;
    created_at: string;
    is_locked: boolean;
}

interface BOQItem {
    id: number;
    area_name: string;
    product_name: string;
    driver_name: string;
    accessories_names: string;
    quantity: number;
    unit_price: number;
    total_price: number;
}

interface BOQSummary {
    subtotal: number;
    margin_percent: number;
    margin_amount: number;
    grand_total: number;
    status: string;
    version_number: number;
    type_summary?: Record<string, { quantity: number, amount: number }>;
}
interface BOQPageProps {
    projectId?: number;
}

const BOQPage: React.FC<BOQPageProps> = ({ projectId: propProjectId }) => {
    const { projectId: urlProjectId } = useParams<{ projectId: string }>();
    const effectiveProjectId = propProjectId || Number(urlProjectId);
    const isStandalone = !propProjectId;

    const navigate = useNavigate();

    // -- State --
    const [searchText, setSearchText] = useState('');
    const [searchResults, setSearchResults] = useState<ProjectSearchResult[]>([]);
    const [isSearching, setIsSearching] = useState(false);
    const [showResults, setShowResults] = useState(false);

    const [selectedProject, setSelectedProject] = useState<ProjectSearchResult | null>(null);
    const [projectMode, setProjectMode] = useState<"AREA_WISE" | "PROJECT_LEVEL">("AREA_WISE");
    const [versions, setVersions] = useState<BOQVersion[]>([]);
    const [selectedVersion, setSelectedVersion] = useState<BOQVersion | null>(null);
    const [boqItems, setBoqItems] = useState<BOQItem[]>([]);
    const [summary, setSummary] = useState<BOQSummary | null>(null);

    const [marginPercent, setMarginPercent] = useState<number>(0);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const searchRef = useRef<HTMLDivElement>(null);

    // -- Helper: Safe formatting --
    const formatCurrency = (value: any) => {
        const safe = Number(value || 0);
        return '₹ ' + safe.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    };

    // -- API Wrappers --

  const loadBOQDetail = useCallback(async (boqId: number) => {
    setLoading(true);
    try {
        const data = await boqService.getBOQSummaryDetail(boqId);
        console.log('Fetched BOQ Detail:', data);
        if (data) {
            // Group PRODUCT, DRIVER, ACCESSORY items into logical rows
            const items = data.items || [];
            const groupedItems = [];
            for (let i = 0; i < items.length; i++) {
                const item = items[i];
                if (item.item_type === "PRODUCT") {
                    // Look ahead for driver and accessory
                    const driver = items[i + 1]?.item_type === "DRIVER" ? items[i + 1] : null;
                    const accessory = items[i + 2]?.item_type === "ACCESSORY" ? items[i + 2] : null;

                    groupedItems.push({
                        id: item.id,
                        area_name: item.area_name || '',
                        product_name: item.product_details?.name || '-',
                        driver_name: driver?.driver_details?.driver_code || '-',
                        accessories_names: accessory?.accessory_details?.name || '-',
                        quantity: item.quantity,
                        unit_price: item.unit_price,
                        total_price: item.final_price,
                    });

                    // Skip the next items if they were used
                    if (driver) i++;
                    if (accessory) i++;
                }
            }
            console.log('Grouped BOQ Items:', groupedItems);
            setBoqItems(groupedItems);
            const mapped = mapBOQSummary(data);
            setSummary(mapped);
            setMarginPercent(data.margin_percent || 0);
        }
    } catch (err) {
        console.error("Failed to load BOQ detail", err);
        setError("Failed to load BOQ items.");
    } finally {
        setLoading(false);
    }
}, []);
    const loadVersionsList = useCallback(async (projId: number) => {
        setLoading(true);
        try {
            const data = await boqService.getVersions(projId);
            const list = Array.isArray(data) ? data : [];
            // Sort descending by version number
            const sorted = list.sort((a: BOQVersion, b: BOQVersion) => b.version - a.version);
            setVersions(sorted);

            if (sorted.length > 0) {
                setSelectedVersion(sorted[0]);
                // Detail will be loaded by useEffect on selectedVersion
            } else {
                setSelectedVersion(null);
                setBoqItems([]);
                setSummary(null);
            }
        } catch (err) {
            console.error("Failed to load versions", err);
            setError("Failed to load versions list.");
        } finally {
            setLoading(false);
        }
    }, []);

    // -- Effects --

    // 1. Initial Load from URL or Props
    useEffect(() => {
        if (effectiveProjectId) {
            const fetchProj = async () => {
                try {
                    const res = await apiClient.get(`/projects/projects/${effectiveProjectId}/`);
                    if (res.data) {
                        setSelectedProject(res.data);
                        setProjectMode(res.data.inquiry_type || 'AREA_WISE');
                        setSearchText(res.data.name);
                        loadVersionsList(res.data.id);
                    }
                } catch (err) {
                    console.error("Project fetch failed", err);
                }
            };
            fetchProj();
        }
    }, [effectiveProjectId, loadVersionsList]);

    // 2. Load detail when version changes
    useEffect(() => {
        if (selectedVersion) {
            loadBOQDetail(selectedVersion.id);
        }
    }, [selectedVersion, loadBOQDetail]);

    // 3. Search logic
    useEffect(() => {
        const timer = setTimeout(async () => {
            if (searchText.length >= 2) {
                setIsSearching(true);
                const results = await projectService.searchProjects(searchText);
                setSearchResults(results);
                setIsSearching(false);
                setShowResults(true);
            } else {
                setSearchResults([]);
                setShowResults(false);
            }
        }, 300);
        return () => clearTimeout(timer);
    }, [searchText]);

    // 4. Click outside search
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
                setShowResults(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // -- Handlers --

    const handleProjectSelect = (proj: ProjectSearchResult) => {
        setSelectedProject(proj);
        setSearchText(proj.name);
        setShowResults(false);
        navigate(`/boq/${proj.id}`);
    };

    const handleApplyMargin = async () => {
        if (!selectedVersion) return;
        setLoading(true);
        try {
            await boqService.applyMargin(selectedVersion.id, marginPercent);
            await loadBOQDetail(selectedVersion.id);
        } catch (err) {
            alert("Failed to apply margin.");
        } finally {
            setLoading(false);
        }
    };

    const handleApprove = async () => {
        if (!selectedVersion) return;
        if (!confirm("Approve this BOQ version? This locks the version and all associated configurations.")) return;
        setLoading(true);
        try {
            await boqService.approveBOQ(selectedVersion.id);
            alert("BOQ version approved successfully");
            if (selectedProject) await loadVersionsList(selectedProject.id);
        } catch (err) {
            alert("Approval failed.");
        } finally {
            setLoading(false);
        }
    };

    const handleGenerateBOQ = async () => {
        if (!selectedProject) return;
        setLoading(true);
        try {
            await boqService.generateBOQ(selectedProject.id);
            alert("BOQ generated successfully");
            await loadVersionsList(selectedProject.id);
            // new version will be selected automatically by loadVersionsList logic
        } catch (err: any) {
            alert(err?.detail || "Failed to generate new BOQ version.");
        } finally {
            setLoading(false);
        }
    };

    const handleExport = async (type: 'pdf' | 'excel') => {
        if (!selectedVersion) return;
        setLoading(true);
        try {
            const blob = type === 'pdf'
                ? await boqService.exportPDF(selectedVersion.id)
                : await boqService.exportExcel(selectedVersion.id);
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `BOQ_${selectedProject?.project_code || 'V' + selectedVersion.version}.${type === 'pdf' ? 'pdf' : 'xlsx'}`;
            link.click();
        } catch (err) {
            alert("Export failed.");
        } finally {
            setLoading(false);
        }
    };

    const isApproved = summary?.status === 'APPROVED';

    // -- Styles --
    const getStatusBadgeStyle = (status: string): React.CSSProperties => ({
        padding: '4px 12px', borderRadius: '4px', fontSize: '11px', textTransform: 'uppercase', fontWeight: 'bold',
        backgroundColor: status === 'APPROVED' ? '#d1fae5' : '#ffedd5',
        color: status === 'APPROVED' ? '#065f46' : '#9a3412',
        border: `1px solid ${status === 'APPROVED' ? '#10b981' : '#f97316'}`
    });

    const styles: { [key: string]: React.CSSProperties } = {
        container: { display: 'flex', flexDirection: 'column', height: '100vh', backgroundColor: '#f3f4f6', overflow: 'hidden' },
        header: {
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            padding: '12px 24px', backgroundColor: 'white', borderBottom: '1px solid #e5e7eb'
        },
        headerRight: { display: 'flex', gap: '20px', alignItems: 'center', fontWeight: 'bold' },
        main: { display: 'flex', flex: 1, overflow: 'hidden' },
        leftPanel: { width: '260px', borderRight: '1px solid #e5e7eb', backgroundColor: 'white', display: 'flex', flexDirection: 'column' },
        leftHeader: { padding: '16px', borderBottom: '1px solid #f3f4f6', display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
        versionList: { overflowY: 'auto', flex: 1 },
        versionItem: { padding: '12px 16px', borderBottom: '1px solid #f9fafb', cursor: 'pointer', transition: 'background 0.2s' },
        centerPanel: { flex: 1, padding: '24px', display: 'flex', flexDirection: 'column', overflowY: 'auto' },
        rightPanel: { width: '320px', borderLeft: '1px solid #e5e7eb', backgroundColor: 'white', padding: '24px', overflowY: 'auto' },
        tableCard: { backgroundColor: 'white', borderRadius: '8px', border: '1px solid #e5e7eb', flex: 1, display: 'flex', flexDirection: 'column' },
        actionBar: { display: 'flex', gap: '8px', marginBottom: '16px', justifyContent: 'flex-end' },
        searchBox: { position: 'relative', width: '300px' },
        suggestions: {
            position: 'absolute', top: '100%', left: 0, right: 0, zIndex: 100,
            backgroundColor: 'white', border: '1px solid #e5e7eb', boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
            maxHeight: '200px', overflowY: 'auto', borderRadius: '4px', marginTop: '4px'
        },
        errorBanner: { padding: '8px 24px', backgroundColor: '#fee2e2', color: '#b91c1c', fontSize: '12px', borderBottom: '1px solid #fecaca' },
        lockBanner: { padding: '12px 24px', backgroundColor: '#fff7ed', color: '#9a3412', fontSize: '14px', fontWeight: 'bold', borderBottom: '1px solid #ffedd5', display: 'flex', gap: '10px', alignItems: 'center' }
    };
    // ================= GROUP DATA =================

const productRows: any[] = [];
const driverRows: any[] = [];
const accessoryRows: any[] = [];

const productMap: Record<string, any> = {};
const driverMap: Record<string, any> = {};
const accessoryMap: Record<string, any> = {};
console.log("Raw BOQ Items:", boqItems);
boqItems.forEach(item => {

    const price = Number(item.total_price) || 0;

    // PRODUCT
    if (!productMap[item.product_name]) {
        productMap[item.product_name] = { name: item.product_name, qty: 0, amount: 0 };
    }
    productMap[item.product_name].qty += Number(item.quantity) || 0;
    productMap[item.product_name].amount += price;

    // DRIVER
    if (item.driver_name && item.driver_name !== '-') {
        if (!driverMap[item.driver_name]) {
            driverMap[item.driver_name] = { name: item.driver_name, qty: 0, amount: 0 };
        }
        driverMap[item.driver_name].qty += Number(item.quantity) || 0;
        driverMap[item.driver_name].amount += price;
    }

    // ACCESSORY
    if (item.accessories_names && item.accessories_names !== '-') {
        if (!accessoryMap[item.accessories_names]) {
            accessoryMap[item.accessories_names] = { name: item.accessories_names, qty: 0, amount: 0 };
        }
        accessoryMap[item.accessories_names].qty += Number(item.quantity) || 0;
        accessoryMap[item.accessories_names].amount += price;
    }
});

console.log("Product Map:", productMap);
const productsData = Object.values(productMap);
const driversData = Object.values(driverMap);
const accessoriesData = Object.values(accessoryMap);

console.log("productsData:", productsData);
const renderSection = (title: string, rows: any[]) => {

    const total = rows.reduce((s, r) => s + r.amount, 0);

    return {
        key: title,
        label: (
            <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', fontWeight: 600 }}>
                <span>{title} ({rows.length})</span>
                <span style={{ color: '#2563eb' }}>{formatCurrency(total)}</span>
            </div>
        ),
        children: (
            <table className="erp-table compact">
                <thead>
                    <tr>
                        <th>Name</th>
                        <th className="text-right">Qty</th>
                        <th className="text-right">Amount</th>
                    </tr>
                </thead>
                <tbody>
                    {rows.map((r, i) => (
                        <tr key={i}>
                            <td>{r.name}</td>
                            <td className="text-right">{r.qty}</td>
                            <td className="text-right">{formatCurrency(r.amount)}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        )
    };
};

    return (
        <div style={styles.container}>
            {error && <div style={styles.errorBanner}><strong>Error:</strong> {error} <button onClick={() => setError(null)} style={{ float: 'right', border: 'none', background: 'none', cursor: 'pointer' }}>✕</button></div>}

            {/* Locked Banner */}
            {isApproved && (
                <div style={styles.lockBanner}>
                    <span style={{ fontSize: '18px' }}>🔒</span>
                    This BOQ version is locked and cannot be edited.
                </div>
            )}

            {/* 1) Header */}
            <div style={styles.header}>
                {isStandalone ? (
                    <div style={styles.searchBox} ref={searchRef}>
                        <input
                            className="table-search"
                            style={{ width: '100%' }}
                            placeholder="Search Project..."
                            value={searchText}
                            onChange={(e) => setSearchText(e.target.value)}
                        />
                        {isSearching && <div style={{ position: 'absolute', right: '10px', top: '10px' }}><div className="spinner" style={{ width: '16px', height: '16px', borderWidth: '2px' }} /></div>}
                        {showResults && searchResults.length > 0 && (
                            <div style={styles.suggestions}>
                                {searchResults.map(p => (
                                    <div
                                        key={p.id}
                                        style={{ padding: '10px 12px', cursor: 'pointer', borderBottom: '1px solid #f3f4f6' }}
                                        onClick={() => handleProjectSelect(p)}
                                        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f9fafb'}
                                        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'white'}
                                    >
                                        <div style={{ fontWeight: 600, fontSize: '13px' }}>{p.name}</div>
                                        <div style={{ fontSize: '11px', color: '#6b7280' }}>{p.client_name}</div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                ) : (
                    <div style={{ fontWeight: 'bold', fontSize: '16px', color: 'var(--primary-blue)' }}>
                        Project BOQ
                    </div>
                )}

                <div style={styles.headerRight}>
                    <span style={{ color: '#374151' }}>{selectedProject?.name || '---'}</span>
                    <span style={{ color: 'var(--primary-blue)' }}>{summary ? `BOQ V${summary.version_number}` : ''}</span>
                    {summary && (
                        <span style={getStatusBadgeStyle(summary.status)}>
                            STATUS: {summary.status}
                        </span>
                    )}
                </div>
            </div>

            <div style={styles.main}>
                {/* 2) Left Panel — Versions */}
                <div style={styles.leftPanel}>
                    <div style={styles.leftHeader}>
                        <span style={{ fontWeight: 'bold', fontSize: '14px', color: '#6b7280' }}>VERSIONS</span>
                        <button
                            className="primary-btn"
                            style={{ height: '28px', fontSize: '12px' }}
                            onClick={handleGenerateBOQ}
                            disabled={!selectedProject || loading}
                        >
                            + New
                        </button>
                    </div>
                    <div style={styles.versionList}>
                        {versions.map(v => (
                            <div
                                key={v.id}
                                style={{
                                    ...styles.versionItem,
                                    backgroundColor: selectedVersion?.id === v.id ? '#eff6ff' : 'white',
                                    borderLeft: selectedVersion?.id === v.id ? '4px solid var(--primary-blue)' : '4px solid transparent'
                                }}
                                onClick={() => setSelectedVersion(v)}
                            >
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                                    <span style={{ fontWeight: 'bold' }}>v{v.version}</span>
                                    <span style={{
                                        fontSize: '10px', fontWeight: 'bold',
                                        color: v.status === 'APPROVED' ? '#059669' : '#d97706'
                                    }}>
                                        {v.status}
                                    </span>
                                </div>
                                <div style={{ fontSize: '12px', color: '#9ca3af' }}>
                                    {new Date(v.created_at).toLocaleDateString()}
                                </div>
                            </div>
                        ))}
                        {versions.length === 0 && selectedProject && (
                            <div style={{ padding: '20px', textAlign: 'center', color: '#9ca3af', fontSize: '13px' }}>
                                No versions found.
                            </div>
                        )}
                    </div>
                </div>

                {/* 3) Center Panel — BOQ Table */}
                <div style={styles.centerPanel}>
                    <div style={styles.actionBar}>
                        <button className="secondary-btn" onClick={() => handleExport('pdf')} disabled={!selectedVersion}>Export PDF</button>
                        <button className="secondary-btn" onClick={() => handleExport('excel')} disabled={!selectedVersion}>Export Excel</button>
                    </div>

                    <div style={styles.tableCard}>
                        {!selectedProject ? (
                            <div className="table-empty">No project selected. Search for a project to begin.</div>
                        ) : versions.length === 0 ? (
                            <div className="table-empty">
                                <p>No BOQ versions yet.</p>
                                <p style={{ fontSize: '12px', marginTop: '8px', color: '#6b7280' }}>Go to Summary and click Generate BOQ.</p>
                                <button className="primary-btn" style={{ marginTop: '16px' }} onClick={handleGenerateBOQ}>Generate BOQ</button>
                            </div>
                        ) : boqItems.length === 0 ? (
                            <div className="table-empty">No BOQ items generated.</div>
                        ) : (
                           <Collapse
    accordion
    defaultActiveKey={['PRODUCTS']}
    style={{ marginTop: 8 }}
    items={[
        renderSection("PRODUCTS", productsData),
        renderSection("DRIVERS", driversData),
        renderSection("ACCESSORIES", accessoriesData),
    ]}
/>

                        )}
                    </div>
                </div>

                {/* 4) Right Panel — Pricing Summary */}
                <div style={styles.rightPanel}>
                    <h3 style={{ margin: '0 0 20px 0', fontSize: '16px', borderBottom: '2px solid #f3f4f6', paddingBottom: '10px' }}>Summary</h3>

                    {summary ? (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px' }}>
                                <span style={{ color: '#6b7280' }}>Subtotal:</span>
                                <span style={{ fontWeight: 'bold' }}>{formatCurrency(summary.subtotal)}</span>
                            </div>

                            {summary.type_summary && (
                                <div style={{
                                    backgroundColor: '#f9fafb',
                                    padding: '12px',
                                    borderRadius: '6px',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    gap: '8px',
                                    border: '1px solid #f3f4f6'
                                }}>
                                    {Object.entries(summary.type_summary).map(([type, data]: [string, any]) => (
                                        <div key={type} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px' }}>
                                            <span style={{ color: '#6b7280' }}>
                                                {type} ({data.quantity})
                                            </span>
                                            <span style={{ fontWeight: 500 }}>{formatCurrency(data.amount)}</span>
                                        </div>
                                    ))}
                                </div>
                            )}
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                <label style={{ fontSize: '12px', color: '#6b7280', fontWeight: 'bold' }}>Margin (%)</label>
                                <input
                                    type="number"
                                    className="table-search"
                                    style={{ width: '100%' }}
                                    value={marginPercent}
                                    onChange={(e) => setMarginPercent(Number(e.target.value))}
                                    disabled={isApproved}
                                />
                            </div>

                            <div style={{ borderTop: '1px dashed #e5e7eb', marginTop: '10px', paddingTop: '20px' }}>
                                <div style={{ fontSize: '14px', color: '#6b7280', marginBottom: '4px' }}>Grand Total:</div>
                                <div style={{ fontSize: '24px', fontWeight: 'bold', color: 'var(--primary-blue)' }}>
                                    {formatCurrency(summary.grand_total)}
                                </div>
                            </div>

                            <div style={{ marginTop: '10px', padding: '12px', backgroundColor: isApproved ? '#d1fae5' : '#fff7ed', borderRadius: '4px', textAlign: 'center' }}>
                                <span style={{ fontSize: '12px', fontWeight: 'bold', color: isApproved ? '#059669' : '#d97706' }}>
                                    {isApproved ? 'BOQ IS APPROVED & LOCKED' : 'STATUS: DRAFT'}
                                </span>
                            </div>

                            {!isApproved && (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '10px' }}>
                                    <button
                                        className="primary-btn"
                                        style={{ width: '100%' }}
                                        onClick={handleApplyMargin}
                                    >
                                        Apply Margin
                                    </button>
                                    <button
                                        className="primary-btn"
                                        style={{ width: '100%', backgroundColor: '#059669' }}
                                        onClick={handleApprove}
                                    >
                                        Approve BOQ
                                    </button>
                                </div>
                            )}

                            {isApproved && (
                                <button
                                    className="secondary-btn"
                                    style={{ marginTop: '10px', width: '100%' }}
                                    onClick={() => handleExport('pdf')}
                                >
                                    Download PDF
                                </button>
                            )}
                        </div>
                    ) : selectedProject ? (
                        <div style={{ textAlign: 'center', padding: '40px 0' }}>
                            <p style={{ color: '#9ca3af', marginBottom: '16px' }}>No BOQ generated yet.</p>
                            <button className="primary-btn" onClick={handleGenerateBOQ}>Generate BOQ</button>
                        </div>
                    ) : (
                        <div style={{ textAlign: 'center', padding: '40px 0', color: '#9ca3af' }}>
                            Select a project to see summary.
                        </div>
                    )}
                </div>
            </div>

            {loading && (
                <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(255,255,255,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
                    <div className="spinner" />
                </div>
            )}
        </div>
    );
};

export default BOQPage;
