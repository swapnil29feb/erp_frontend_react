
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import apiClient from '../../api/apiClient';
import { configService } from '../../services/configService';
import type { Product, Driver, Accessory } from '../../types/config';
import type { Project, Area, Subarea } from '../../types/project';

import LuminairePanel from '../../components/configuration/LuminairePanel';
import RightPanel from '../../components/configuration/RightPanel';
import ConfigurationSummary from '../../components/configuration/ConfigurationSummary';

const ConfigurationWorkspace: React.FC = () => {
    const { projectId, areaId: selectedAreaId, subareaId } = useParams<{ projectId: string; areaId?: string; subareaId?: string }>();
    const navigate = useNavigate();

    const [selectedProject, setSelectedProject] = useState<Project | null>(null);
    const [selectedArea, setSelectedArea] = useState<Area | null>(null);
    const [subarea, setSubarea] = useState<Subarea | null>(null);

    const [selectedProducts, setSelectedProducts] = useState<any[]>([]);
    const [selectedDrivers, setSelectedDrivers] = useState<any[]>([]);
    const [selectedAccessories, setSelectedAccessories] = useState<any[]>([]);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        loadContext();
    }, [projectId, selectedAreaId, subareaId]);

    const loadContext = async () => {
        try {
            if (projectId) {
                const pRes = await apiClient.get<Project>(`/projects/projects/${projectId}/`);
                setSelectedProject(pRes.data);
            }
            if (selectedAreaId) {
                const aRes = await apiClient.get<Area>(`/projects/areas/${selectedAreaId}/`);
                setSelectedArea(aRes.data);
            }
            if (subareaId) {
                const sRes = await apiClient.get<Subarea>(`/projects/subareas/${subareaId}/`);
                setSubarea(sRes.data);
            }
        } catch (err) {
            console.error("Failed to load context", err);
        }
    };

    const handleAddLuminaire = (p: Product, qty: number) => {
        setSelectedProducts([...selectedProducts, {
            id: p.prod_id,
            product_id: p.prod_id,
            name: p.make || "-",
            code: p.order_code || "-",
            quantity: qty,
            price: p.price || (p as any).base_price || 0,
            wattage: p.wattage || 0
        }]);
    };

    const handleAddDriver = (d: Driver, qty: number) => {
        const id = d.driver_id || (d as any).id;
        setSelectedDrivers(prev => [...prev, {
            id,
            driver_id: id,
            name: (d as any).driver_make || d.make || "-",
            code: d.driver_code || "-",
            quantity: qty,
            price: d.price || (d as any).base_price || 0
        }]);
    };

    const handleAddAccessory = (a: Accessory, qty: number) => {
        const id = a.accessory_id || (a as any).id;
        setSelectedAccessories(prev => [...prev, {
            id,
            accessory_id: id,
            name: a.make || "-",
            quantity: qty,
            price: a.price || (a as any).base_price || 0
        }]);
    };

    const handleUpdateRightPanelQty = (type: 'driver' | 'accessory', id: number, delta: number) => {
        if (type === 'driver') {
            setSelectedDrivers(prev => {
                const items = [...prev];
                const idx = items.findIndex(d => d.driver_id === id || d.id === id);
                if (idx > -1) {
                    items[idx].quantity += delta;
                    if (items[idx].quantity <= 0) {
                        return items.filter((_, i) => i !== idx);
                    }
                }
                return items;
            });
        } else {
            setSelectedAccessories(prev => {
                const items = [...prev];
                const idx = items.findIndex(a => a.accessory_id === id || a.id === id);
                if (idx > -1) {
                    items[idx].quantity += delta;
                    if (items[idx].quantity <= 0) {
                        return items.filter((_, i) => i !== idx);
                    }
                }
                return items;
            });
        }
    };

    const handleRemove = (type: 'luminaire' | 'driver' | 'accessory', index: number) => {
        if (type === 'luminaire') {
            setSelectedProducts(prev => prev.filter((_, i) => i !== index));
        } else if (type === 'driver') {
            setSelectedDrivers(prev => prev.filter((_, i) => i !== index));
        } else {
            setSelectedAccessories(prev => prev.filter((_, i) => i !== index));
        }
    };

    const firstProductId = selectedProducts.length > 0 ? selectedProducts[0].id : null;

    const handleSave = async () => {
        try {
            console.log("SELECTED PROJECT:", selectedProject);
            console.log("SELECTED AREA:", selectedAreaId);

            const isProjectOnly = selectedProject?.inquiry_type === "PROJECT_LEVEL";
            console.log("isProjectOnly:", isProjectOnly);

            if (!isProjectOnly && !selectedAreaId) {
                console.error("Area required for this project");
                return;
            }

            if (!selectedProducts.length) {
                console.error("No products selected");
                return;
            }

            setSaving(true);
            const payload = {
                project_id: selectedProject?.id,
                area_id: isProjectOnly ? null : Number(selectedAreaId),
                products: selectedProducts.map((product) => ({
                    product_id: product.product_id,
                    quantity: product.quantity,
                    // If UI uses shared drivers/accessories, we map from the arrays
                    driver_id: selectedDrivers.length > 0 ? selectedDrivers[0].driver_id : null,
                    accessories: selectedAccessories.map((acc: any) => ({
                        accessory_id: acc.accessory_id,
                        quantity: acc.quantity,
                    })),
                })),
            };

            console.log("FINAL CONFIG PAYLOAD:", payload);

            await configService.createConfiguration(payload);

            console.log("Configuration saved successfully");
            alert("Configuration saved successfully!");
            navigate(`/projects/${projectId}`);
        } catch (err: any) {
            console.error("Save failed:", err.response?.data || err);
            alert(err?.response?.data?.message || "Failed to save configuration.");
        } finally {
            setSaving(false);
        }
    };

    const handleCancel = () => {
        navigate(`/projects/${projectId}/areas/${selectedAreaId}`);
    };

    return (
        <div style={styles.workspace} className="config-workspace">
            {/* Header */}
            <header style={styles.header} className="config-header">
                <div style={styles.breadcrumb}>
                    {(selectedProject?.name || "Project")} › {(selectedArea?.name || "Area")} › {(subarea?.name || "Subarea")}
                </div>
                <h2 style={styles.title}>Add Luminaire Configuration</h2>
            </header>

            {/* Main workspace - 2 Columns (Luminaires + RightPanel) */}
            <main style={styles.grid} className="config-columns">
                <div style={styles.leftColumn}>
                    <LuminairePanel onAdd={handleAddLuminaire} />
                </div>
                <RightPanel
                    firstProductId={firstProductId}
                    selectedDrivers={selectedDrivers}
                    selectedAccessories={selectedAccessories}
                    onAddDriver={handleAddDriver}
                    onAddAccessory={handleAddAccessory}
                    onUpdateQty={handleUpdateRightPanelQty}
                />
            </main>

            {/* Summary */}
            <div className="config-summary" style={styles.summaryContainer}>
                <ConfigurationSummary
                    luminaires={selectedProducts}
                    drivers={selectedDrivers}
                    accessories={selectedAccessories}
                    onRemove={handleRemove}
                />
            </div>

            {/* Bottom action bar */}
            <footer style={styles.actions} className="config-actions">
                <button
                    onClick={handleCancel}
                    style={styles.cancelBtn}
                    className="btn-cancel"
                    disabled={saving}
                >
                    Cancel
                </button>

                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    {selectedProducts.length === 0 && (
                        <span style={{ color: '#ef4444', fontSize: '12px', fontWeight: '500' }}>
                            Add at least one luminaire to enable save
                        </span>
                    )}
                    <button
                        onClick={handleSave}
                        disabled={saving || selectedProducts.length === 0}
                        style={{
                            ...styles.saveBtn,
                            opacity: (saving || selectedProducts.length === 0) ? 0.6 : 1,
                            cursor: (saving || selectedProducts.length === 0) ? 'not-allowed' : 'pointer'
                        }}
                        className="btn-save"
                    >
                        {saving ? 'Saving...' : 'Save Configuration'}
                    </button>
                </div>
            </footer>
        </div>
    );
};

const styles = {
    workspace: {
        display: 'flex',
        flexDirection: 'column' as const,
        height: '100vh',
        overflow: 'hidden',
        backgroundColor: '#f8fafc'
    },
    header: {
        height: '80px',
        padding: '0 24px',
        display: 'flex',
        flexDirection: 'column' as const,
        justifyContent: 'center',
        backgroundColor: 'white',
        borderBottom: '1px solid #e2e8f0',
        zIndex: 20
    },
    breadcrumb: {
        fontSize: '11px',
        color: '#64748b',
        textTransform: 'uppercase' as const,
        letterSpacing: '0.05em',
        marginBottom: '2px'
    },
    title: {
        margin: 0,
        fontSize: '20px',
        fontWeight: '800',
        color: '#1e293b'
    },
    grid: {
        display: 'flex', // Changed to flex for fixed width right panel
        flex: 1,
        minHeight: 0,
        backgroundColor: '#e2e8f0',
        overflow: 'hidden'
    },
    leftColumn: {
        flex: 1,
        minWidth: 0,
        borderRight: '1px solid #cbd5e1'
    },
    summaryContainer: {
        height: '140px',
        borderTop: '1px solid #ddd',
        backgroundColor: '#fff'
    },
    actions: {
        height: '70px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '0 24px',
        borderTop: '1px solid #ddd',
        backgroundColor: '#ffffff',
        zIndex: 30
    },
    cancelBtn: {
        backgroundColor: '#e5e7eb',
        color: '#111827',
        border: 'none',
        padding: '10px 22px',
        borderRadius: '6px',
        fontWeight: '500',
        cursor: 'pointer'
    },
    saveBtn: {
        backgroundColor: '#2563eb',
        color: 'white',
        border: 'none',
        padding: '10px 26px',
        borderRadius: '6px',
        fontWeight: '600',
        cursor: 'pointer',
        boxShadow: '0 2px 4px rgba(37, 99, 235, 0.2)'
    }
};

export default ConfigurationWorkspace;
