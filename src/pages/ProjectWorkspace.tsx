
import { useEffect, useState, type FC, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { message } from 'antd';
import apiClient from '../api/apiClient';
import type { Project, Area, Subarea } from '../types/project';
import ThreePaneWorkspace from '../components/workspace/ThreePaneWorkspace';
import LoadingSpinner from '../components/LoadingSpinner';

// Tab Components
import UnifiedConfigurationTab from '../components/config/UnifiedConfigurationTab';
import ProjectBOQTab from '../modules/boq/ProjectBOQTab';
import SummaryTab from '../components/workspace/SummaryTab';
import { configService } from '../services/configService';
import { boqService } from '../services/boqService';
import { mapBOQSummary } from '../utils/boqSummaryMapper';
import { configurationService } from '../services/configurationService';
import type { Product, Driver, Accessory } from '../types/config';
import ActivityFAB from '../components/common/ActivityFAB';

const ProjectWorkspace: FC = () => {
    const { id } = useParams<{ id: string }>();

    // Data States
    const [project, setProject] = useState<Project | null>(null);
    const [areas, setAreas] = useState<Area[]>([]);
    const [subareas, setSubareas] = useState<Subarea[]>([]);

    // Master States
    const [products, setProducts] = useState<Product[]>([]);
    const [drivers, setDrivers] = useState<Driver[]>([]);
    const [accessories, setAccessories] = useState<Accessory[]>([]);

    // Selection States
    const [selectedArea, setSelectedArea] = useState<Area | null>(null);
    const [selectedSubarea, setSelectedSubarea] = useState<Subarea | null>(null);

    // Workspace States
    const [loading, setLoading] = useState<boolean>(true);
    const [loadingSubareas, setLoadingSubareas] = useState<boolean>(false);
    const [mode, setMode] = useState<'AREA_WISE' | 'PROJECT_LEVEL'>('AREA_WISE');
    const [error, setError] = useState<string | null>(null);

    // Modal States
    const [showAreaModal, setShowAreaModal] = useState(false);
    const [showSubareaModal, setShowSubareaModal] = useState(false);
    const [activeTab, setActiveTab] = useState("areas"); // Start with Areas (Structure)


    // Configuration States


    // STEP 2: Separate states for each configuration type
    const [productConfigs, setProductConfigs] = useState<any[]>([]);
    const [driverConfigs, setDriverConfigs] = useState<any[]>([]);
    const [accessoryConfigs, setAccessoryConfigs] = useState<any[]>([]);

    const [loadingConfig, setLoadingConfig] = useState<boolean>(false);
    const [summary, setSummary] = useState<any>(null);

    // Form States
    const [areaForm, setAreaForm] = useState({ name: "" });
    const [subareaForm, setSubareaForm] = useState({ name: "" });
    const navigate = useNavigate();

    const isProjectLevel = project?.inquiry_type === "PROJECT_LEVEL";

    useEffect(() => {
        if (!id) return;

        const initWorkspace = async () => {
            try {
                const projectRes = await apiClient.get<Project>(`/projects/projects/${id}/`);
                const projData = projectRes.data;
                setProject(projData);

                const currentMode = projData.inquiry_type || 'AREA_WISE';
                setMode(currentMode);

                if (currentMode === 'PROJECT_LEVEL') {
                    setActiveTab("configuration");
                } else {
                    const areasRes = await apiClient.get<Area[]>(`/projects/projects/${id}/areas/`);
                    setAreas(areasRes.data);
                    setActiveTab("areas");
                }
            } catch (err) {
                console.error("Workspace init failed", err);
                setError('Failed to load project workspace');
            } finally {
                setLoading(false);
            }
        };

        initWorkspace();
    }, [id]);

    const loadAreas = async () => {
        if (!id) return;
        try {
            const areasRes = await apiClient.get<Area[]>(`/projects/projects/${id}/areas/`);
            setAreas(areasRes.data);
        } catch (err) {
            console.error("Failed to load areas", err);
        }
    };

    const loadSubareas = async (areaId: number) => {
        try {
            const res = await apiClient.get<Subarea[]>(`/projects/areas/${areaId}/subareas/`);
            setSubareas(res.data);
            return res.data;
        } catch (err) {
            console.error("Failed to load subareas", err);
            return [];
        }
    };



    // STEP 3: Unified configuration loading function
    const loadAllConfigurations = async (
        projectId: number,
        subareaId?: number
    ) => {
        setLoadingConfig(true);
        try {
            const [prodRes, drvRes, accRes] = await Promise.all([
                configService.getProductConfigurations(projectId, subareaId),
                configService.getDriverConfigurations(projectId, subareaId),
                configService.getAccessoryConfigurations(projectId, subareaId),
            ]);

            setProductConfigs(prodRes);
            setDriverConfigs(drvRes);
            setAccessoryConfigs(accRes);


        } catch (err) {
            console.error("Failed to load configurations", err);
        } finally {
            setLoadingConfig(false);
        }
    };


    const loadSummaryData = async () => {
        if (!id) return;
        try {
            const data = await boqService.getSummary(id);
            const mapped = mapBOQSummary(data);
            setSummary(mapped);
        } catch (err) {
            console.error("Failed to load project summary", err);
        }
    };

    // STEP 4: Load on project change or subarea change
    useEffect(() => {
        if (!project) return;

        if (project.inquiry_type === 'PROJECT_LEVEL') {
            loadAllConfigurations(project.id);
        } else if (selectedSubarea?.id) {
            loadAllConfigurations(project.id, selectedSubarea.id);
        }

        loadSummaryData();
    }, [project, selectedSubarea?.id]);

    useEffect(() => {
        const loadMasters = async () => {
            try {
                const [prodData, driverData, accData] = await Promise.all([
                    configService.getProducts(),
                    configService.getDrivers(),
                    configService.getAccessories()
                ]);
                setProducts(prodData);
                setDrivers(driverData);
                setAccessories(accData);
            } catch (err) {
                console.error("Failed to load master data", err);
            }
        };
        loadMasters();
    }, []);

    const productMap = useMemo(() => {
        const map = new Map<number, Product>();
        products.forEach(p => map.set((p as any).id || p.prod_id, p));
        return map;
    }, [products]);

    const driverMap = useMemo(() => {
        const map = new Map<number, Driver>();
        drivers.forEach(d => map.set((d as any).id || d.driver_id, d));
        return map;
    }, [drivers]);

    const accessoryMap = useMemo(() => {
        const map = new Map<number, Accessory>();
        accessories.forEach(a => map.set((a as any).id || a.accessory_id, a));
        return map;
    }, [accessories]);

    const configMapper = (configs: any[]) => {
        return configs.map(cfg => {
            const product = productMap.get(cfg.product);
            const driver = driverMap.get(cfg.driver);
            const accessoryIds = Array.isArray(cfg.accessories) ? cfg.accessories : [];
            const accs = accessoryIds.map((id: number) => accessoryMap.get(id)).filter(Boolean);

            const area = areas.find(a => a.id === cfg.area);
            const sub = subareas.find(s => s.id === cfg.subarea);

            return {
                ...cfg,
                areaName: area?.name || 'Unknown Area',
                subareaName: sub?.name || '',
                productData: product || null,
                product_detail: product || null,
                driverData: driver || null,
                accessoriesData: accs,
                price: product?.base_price || product?.price || 0,
                unit_price: product?.base_price || product?.price || 0,
                subtotal: (product?.base_price || product?.price || 0) * cfg.quantity
            };
        });
    };


    // Separate mapped rows for the new flow
    const mappedProductConfigs = useMemo(() => configMapper(productConfigs), [productConfigs, productMap, driverMap, accessoryMap, areas, subareas]);
    const mappedDriverConfigs = useMemo(() => configMapper(driverConfigs), [driverConfigs, productMap, driverMap, accessoryMap, areas, subareas]);
    const mappedAccessoryConfigs = useMemo(() => configMapper(accessoryConfigs), [accessoryConfigs, productMap, driverMap, accessoryMap, areas, subareas]);

    const handleSelectArea = async (area: Area) => {
        if (selectedArea?.id === area.id) return;
        setSelectedArea(area);
        setSelectedSubarea(null);
        setSubareas([]);
        setLoadingSubareas(true);
        try {
            await loadSubareas(area.id);
        } finally {
            setLoadingSubareas(false);
        }
        setActiveTab("areas"); // ERP Rule: Areas tab shows structure
    };

    const handleSelectSubarea = (subarea: Subarea) => {
        setSelectedSubarea(subarea);
        setActiveTab("configuration"); // ERP Rule: Selecting subarea goes to config
    };

    const handleAddArea = () => setShowAreaModal(true);
    const handleAddSubarea = () => {
        if (!selectedArea) return alert("Select an area first");
        setShowSubareaModal(true);
    };

    const handleCreateArea = async () => {
        if (!project || !areaForm.name.trim()) return;
        try {
            await apiClient.post(`/projects/projects/${project.id}/areas/`, {
                project: project.id,
                name: areaForm.name.trim(),
            });
            setShowAreaModal(false);
            setAreaForm({ name: "" });
            await loadAreas();
        } catch (err) {
            alert("Failed to create area");
        }
    };

    const handleCreateSubarea = async () => {
        if (!selectedArea || !subareaForm.name.trim()) return;
        try {
            await apiClient.post(`/projects/areas/${selectedArea.id}/subareas/`, {
                area: selectedArea.id,
                name: subareaForm.name.trim(),
            });
            setShowSubareaModal(false);
            setSubareaForm({ name: "" });
            await loadSubareas(selectedArea.id);
        } catch (err) {
            alert("Failed to create subarea");
        }
    }

    const handleDeleteConfig = async (configId: number) => {
        try {
            await configService.deleteConfiguration(configId);
            message.success("Item removed");
            // Reload configurations based on project type
            if (project) {
                if (isProjectLevel) {
                    loadAllConfigurations(project.id);
                } else if (selectedSubarea) {
                    loadAllConfigurations(project.id, selectedSubarea.id);
                }
            }
        } catch (err) {
            message.error("Failed to remove item");
        }
    };

    const handleUpdateQty = async (configId: number, qty: number) => {
        try {
            await configurationService.updateConfiguration(configId, {
                quantity: qty
            });
            message.success("Quantity updated successfully");
            // Reload configurations based on project type
            if (project) {
                if (isProjectLevel) {
                    loadAllConfigurations(project.id);
                } else if (selectedSubarea) {
                    loadAllConfigurations(project.id, selectedSubarea.id);
                }
            }
        } catch (err) {
            console.error("Update failed", err);
            console.error("Failed to update configuration. Please try again.");
        }
    };

    const renderTabContent = () => {
        if (!isProjectLevel && areas.length === 0) {
            return (
                <div className="table-empty" style={{ padding: '80px' }}>
                    <div style={{ fontSize: '48px', marginBottom: '16px' }}>📍</div>
                    <h3>No areas defined</h3>
                    <p style={{ color: 'var(--secondary-text)', marginBottom: '20px' }}>Add your first area to begin the project detail.</p>
                    <button className="primary-btn" onClick={handleAddArea}>+ Add Area</button>
                </div>
            );
        }

        switch (activeTab) {
            case 'areas':
                return (
                    <div style={{ padding: '24px' }}>
                        <h2 style={{ fontSize: '20px', fontWeight: '700', color: '#1e293b', marginBottom: '24px' }}>Project Structure</h2>
                        <div style={{ backgroundColor: '#fff', padding: '24px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '24px' }}>
                                <div>
                                    <label style={{ fontSize: '11px', fontWeight: '700', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Selected Area</label>
                                    <div style={{ fontSize: '18px', fontWeight: '600', color: '#1e293b', marginTop: '8px' }}>{selectedArea?.name || "None Selection"}</div>
                                </div>
                                <div>
                                    <label style={{ fontSize: '11px', fontWeight: '700', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Selected Subarea</label>
                                    <div style={{ fontSize: '18px', fontWeight: '600', color: '#1e293b', marginTop: '8px' }}>{selectedSubarea?.name || "None Selection"}</div>
                                </div>
                            </div>

                            <div style={{ marginTop: '32px', padding: '20px', backgroundColor: '#f8fafc', borderRadius: '8px', border: '1px dashed #cbd5e1' }}>
                                <p style={{ margin: 0, color: '#64748b', fontSize: '14px' }}>
                                    Select a subarea from the left panel to manage its product configurations.
                                    The Areas tab is for structural definition only.
                                </p>
                            </div>
                        </div>
                    </div>
                );
            case 'configuration':
                if (isProjectLevel) {
                    return (
                        <UnifiedConfigurationTab
                            isProjectLevel={isProjectLevel}
                            products={mappedProductConfigs}
                            drivers={mappedDriverConfigs}
                            accessories={mappedAccessoryConfigs}
                            areas={[]}
                            onAddProduct={() => navigate(`/projects/${id}/configure/direct`)}
                            onDelete={handleDeleteConfig}
                            onUpdateQty={handleUpdateQty}
                            isLocked={summary?.status === 'APPROVED'}
                        />
                    );
                }
                if (!selectedSubarea) {
                    return (
                        <div className="table-empty" style={{ padding: '80px' }}>
                            <div style={{ fontSize: '48px', marginBottom: '16px' }}>⚙️</div>
                            <h3>No Subarea Selected</h3>
                            <p style={{ color: 'var(--secondary-text)' }}>Please select a subarea from the left panel to manage its configuration.</p>
                        </div>
                    );
                }
                if (loadingConfig) {
                    return <div style={{ padding: '40px', textAlign: 'center' }}><LoadingSpinner /></div>;
                }
                return (
                    <UnifiedConfigurationTab
                        isProjectLevel={isProjectLevel}
                        products={mappedProductConfigs}
                        drivers={mappedDriverConfigs}
                        accessories={mappedAccessoryConfigs}
                        areas={selectedArea ? [selectedArea] : []}
                        onAddProduct={() => navigate(`/projects/${id}/configure/${selectedArea?.id}/${selectedSubarea?.id}`)}
                        onDelete={handleDeleteConfig}
                        onUpdateQty={handleUpdateQty}
                        isLocked={summary?.status === 'APPROVED'}
                    />
                );
            case 'summary':
                return (
                    <SummaryTab
                        projectId={project?.id || 0}
                        onGenerateSuccess={() => {
                            setActiveTab('boq');
                            // Refresh configs based on project type
                            if (project) {
                                if (isProjectLevel) {
                                    loadAllConfigurations(project.id);
                                } else if (selectedSubarea) {
                                    loadAllConfigurations(project.id, selectedSubarea.id);
                                }
                            }
                        }}
                    />
                );
            case 'boq':
                return <ProjectBOQTab
                    projectId={project?.id || 0}
                    hasConfig={productConfigs.length > 0 || driverConfigs.length > 0 || accessoryConfigs.length > 0}
                />;
            case 'quotation':
                return (
                    <div className="table-empty" style={{ padding: '80px' }}>
                        <div style={{ fontSize: '48px', marginBottom: '16px' }}>📄</div>
                        <h3>Quotation Module</h3>
                        <p style={{ color: 'var(--secondary-text)' }}>Access project quotations and proposals here.</p>
                        <button className="primary-btn" style={{ marginTop: '20px', backgroundColor: '#64748b' }} disabled>Under Development</button>
                    </div>
                );
            default:
                return null;
        }
    };

    const totals = useMemo(() => {
        return {
            amount: summary?.subtotal || 0,
            wattage: summary?.totalPower || 0,
            count: (summary?.totalLuminaires || 0) + (summary?.totalDrivers || 0) + (summary?.totalAccessories || 0)
        };
    }, [summary]);

    if (loading) return <LoadingSpinner />;
    if (error) return <div className="p-10 text-red-500 text-center">{error}</div>;
    if (!project) return <div className="p-10 text-center">Project not found</div>;

    return (
        <>
            <ThreePaneWorkspace
                {...{
                    areas, subareas, selectedArea, selectedSubarea, mode,
                    onSelectArea: handleSelectArea,
                    onSelectSubarea: handleSelectSubarea,
                    onAddArea: handleAddArea,
                    onAddSubarea: handleAddSubarea,
                    loadingSubareas,
                    activeTab,
                    onTabChange: setActiveTab,
                    projectName: project.name,
                    totals
                }}
            >
                {renderTabContent()}
            </ThreePaneWorkspace>

            {showAreaModal && (
                <div style={modalStyles.overlay}>
                    <div style={modalStyles.modal}>
                        <h3 style={modalStyles.title}>Add Area</h3>
                        <input
                            placeholder="Area Name"
                            value={areaForm.name}
                            onChange={(e) => setAreaForm({ name: e.target.value })}
                            style={modalStyles.input}
                        />
                        <div style={modalStyles.actions}>
                            <button onClick={handleCreateArea} style={modalStyles.btnPrimary}>Save</button>
                            <button onClick={() => setShowAreaModal(false)} style={modalStyles.btnSecondary}>Cancel</button>
                        </div>
                    </div>
                </div>
            )}

            {showSubareaModal && (
                <div style={modalStyles.overlay}>
                    <div style={modalStyles.modal}>
                        <h3 style={modalStyles.title}>Add Subarea</h3>
                        <input
                            placeholder="Subarea Name"
                            value={subareaForm.name}
                            onChange={(e) => setSubareaForm({ name: e.target.value })}
                            style={modalStyles.input}
                        />
                        <div style={modalStyles.actions}>
                            <button onClick={handleCreateSubarea} style={modalStyles.btnPrimary}>Save</button>
                            <button onClick={() => setShowSubareaModal(false)} style={modalStyles.btnSecondary}>Cancel</button>
                        </div>
                    </div>
                </div>
            )}
            {project && <ActivityFAB entity="project" entityId={project.id} />}
        </>
    );
};

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
        borderRadius: '8px',
        width: '500px',
        maxWidth: '90%',
    },
    title: {
        fontSize: '18px',
        fontWeight: '600',
        marginBottom: '16px',
        color: '#111827',
    },
    input: {
        width: '100%',
        padding: '8px 12px',
        marginBottom: '12px',
        border: '1px solid #d1d5db',
        borderRadius: '4px',
        fontSize: '14px',
    },
    actions: {
        display: 'flex',
        gap: '8px',
        justifyContent: 'flex-end',
    },
    btnPrimary: {
        padding: '8px 16px',
        backgroundColor: '#2563eb',
        color: 'white',
        border: 'none',
        borderRadius: '4px',
        cursor: 'pointer',
        fontSize: '14px',
        fontWeight: '500',
    },
    btnSecondary: {
        padding: '8px 16px',
        backgroundColor: 'white',
        color: '#374151',
        border: '1px solid #d1d5db',
        borderRadius: '4px',
        cursor: 'pointer',
        fontSize: '14px',
        fontWeight: '500',
    },
};

export default ProjectWorkspace;
