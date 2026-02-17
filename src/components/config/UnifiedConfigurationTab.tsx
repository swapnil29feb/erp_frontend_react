
import React, { useMemo, useEffect, useState, useCallback } from 'react';
import { Card, Typography, Button, Spin, Divider } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import ConfigurationTable from '../../pages/projects/components/ConfigurationTable';
import { getProjectConfigurations } from '../../services/configurationService';

const { Title, Text } = Typography;

interface UnifiedConfigurationTabProps {
    projectId: number;
    subareaId?: number;
    isProjectLevel?: boolean;
    isLocked?: boolean;
    productMap: Map<number, any>;
    driverMap: Map<number, any>;
    accessoryMap: Map<number, any>;
    areas: any[];
    onAddProduct: (areaId: number) => void;
    onDelete: (id: number) => void;
    onUpdateQty: (id: number, qty: number) => void;
    onDataLoaded?: (hasData: boolean) => void;
}

const UnifiedConfigurationTab: React.FC<UnifiedConfigurationTabProps> = ({
    projectId,
    subareaId,
    isProjectLevel = false,
    isLocked = false,
    productMap,
    driverMap,
    accessoryMap,
    areas,
    onAddProduct,
    onDelete,
    onUpdateQty,
    onDataLoaded
}) => {
    const [loading, setLoading] = useState(false);
    const [productConfigs, setProductConfigs] = useState<any[]>([]);
    const [driverConfigs, setDriverConfigs] = useState<any[]>([]);
    const [accessoryConfigs, setAccessoryConfigs] = useState<any[]>([]);

    const loadData = useCallback(async () => {
        if (!projectId) return;
        setLoading(true);
        try {
            const data = await getProjectConfigurations(projectId);

            // Map configuration data here to avoid dependency loops
            const mapped = (data || []).map((cfg: any) => {
                const product = cfg.product && cfg.product.name ? cfg.product : productMap.get(cfg.product);

                const rawDrivers = Array.isArray(cfg.drivers) ? cfg.drivers : [];
                const drivers = rawDrivers.map((d: any) => {
                    if (typeof d === 'object' && d !== null) return d;
                    return driverMap.get(d);
                }).filter(Boolean);

                const rawAccessory = Array.isArray(cfg.accessories) ? cfg.accessories : [];
                const accs = rawAccessory.map((a: any) => {
                    if (typeof a === 'object' && a !== null) return a;
                    return accessoryMap.get(a);
                }).filter(Boolean);

                return {
                    ...cfg,
                    product_detail: product || null,
                    driverData: drivers[0] || null,
                    accessoriesData: accs,
                };
            });

            setProductConfigs(mapped);
            setDriverConfigs([]);
            setAccessoryConfigs([]);

        } catch (err) {
            console.error("Failed to fetch configurations", err);
        } finally {
            setLoading(false);
        }
    }, [projectId, productMap, driverMap, accessoryMap]);

    // Only load data when project ID changes
    useEffect(() => {
        loadData();
    }, [projectId]); // DEPENDENCY ARRAY FIXED: Only projectId triggers reload

    // Check if data loaded and notify parent ONCE when state stabilizes
    useEffect(() => {
        if (!loading && onDataLoaded) {
            const hasData = productConfigs.length > 0;
            onDataLoaded(hasData);
        }
    }, [loading, productConfigs.length, onDataLoaded]);

    const groupedData = useMemo(() => {
        const allItems = [...productConfigs, ...driverConfigs, ...accessoryConfigs];

        if (isProjectLevel || (areas.length === 0 && allItems.length > 0)) {
            return [{
                id: null,
                name: 'Project Wide Configuration',
                products: productConfigs,
                drivers: driverConfigs,
                accessories: accessoryConfigs
            }];
        }

        const map = new Map();
        areas.forEach(area => map.set(area.id, { ...area, products: [], drivers: [], accessories: [] }));

        productConfigs.forEach(p => {
            const area = map.get(p.area);
            if (area) area.products.push(p);
        });

        driverConfigs.forEach(d => {
            const area = map.get(d.area);
            if (area) area.drivers.push(d);
        });

        accessoryConfigs.forEach(a => {
            const area = map.get(a.area);
            if (area) area.accessories.push(a);
        });

        return Array.from(map.values()).filter(area =>
            area.products.length > 0 ||
            area.drivers.length > 0 ||
            area.accessories.length > 0 || true
        );
    }, [productConfigs, driverConfigs, accessoryConfigs, areas, isProjectLevel]);

    const hasAnyConfig = productConfigs.length > 0 || driverConfigs.length > 0 || accessoryConfigs.length > 0;

    if (loading && !hasAnyConfig) {
        return (
            <div style={{ padding: '80px', textAlign: 'center' }}>
                <Spin size="large" tip="Loading configurations..." />
            </div>
        );
    }

    if (!hasAnyConfig && !loading) {
        return (
            <div style={{ padding: '80px', display: 'flex', justifyContent: 'center' }}>
                <Card
                    style={{
                        width: '450px',
                        textAlign: 'center',
                        borderRadius: '16px',
                        boxShadow: '0 10px 25px -5px rgba(0,0,0,0.1)',
                        border: '1px solid #e2e8f0',
                        padding: '24px'
                    }}
                >
                    <div style={{ fontSize: '64px', marginBottom: '24px' }}>⚙️</div>
                    <Title level={3} style={{ marginBottom: '12px', color: '#1e293b' }}>No configuration yet</Title>
                    <Text type="secondary" style={{ display: 'block', marginBottom: '32px', fontSize: '15px' }}>
                        Add products to start configuration and generate technical specifications.
                    </Text>
                    <Button
                        type="primary"
                        size="large"
                        icon={<PlusOutlined />}
                        disabled={isLocked}
                        onClick={() => onAddProduct((areas[0]?.id || 0) as number)}
                        style={{ height: '48px', padding: '0 32px', borderRadius: '8px', fontWeight: '600' }}
                    >
                        Add Product
                    </Button>
                </Card>
            </div>
        );
    }

    return (
        <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '32px' }}>
            {groupedData.map(area => (
                <Card
                    key={area.id || 'project-wide'}
                    hoverable
                    style={{ borderRadius: '12px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)', border: '1px solid #e2e8f0' }}
                    title={<span style={{ fontWeight: '700', fontSize: '18px', color: '#1e293b' }}>{area.name}</span>}
                    extra={
                        <Button
                            type="primary"
                            icon={<PlusOutlined />}
                            onClick={() => onAddProduct(area.id)}
                            disabled={isLocked}
                        >
                            Add Product
                        </Button>
                    }
                >
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                        {/* Section: Products */}
                        {area.products.length > 0 && (
                            <div>
                                <Title level={5} style={{ marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <Divider type="vertical" style={{ height: '1.2em', backgroundColor: '#3b82f6', width: '3px' }} />
                                    Products
                                </Title>
                                <ConfigurationTable
                                    products={area.products}
                                    drivers={[]}
                                    accessories={[]}
                                    onDelete={onDelete}
                                    onUpdateQty={onUpdateQty}
                                    isLocked={isLocked}
                                />
                            </div>
                        )}

                        {/* Section: Drivers */}
                        {area.drivers.length > 0 && (
                            <div>
                                <Title level={5} style={{ marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <Divider type="vertical" style={{ height: '1.2em', backgroundColor: '#10b981', width: '3px' }} />
                                    Drivers
                                </Title>
                                <ConfigurationTable
                                    products={[]}
                                    drivers={area.drivers}
                                    accessories={[]}
                                    onDelete={onDelete}
                                    onUpdateQty={onUpdateQty}
                                    isLocked={isLocked}
                                />
                            </div>
                        )}

                        {/* Section: Accessories */}
                        {area.accessories.length > 0 && (
                            <div>
                                <Title level={5} style={{ marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <Divider type="vertical" style={{ height: '1.2em', backgroundColor: '#f59e0b', width: '3px' }} />
                                    Accessories
                                </Title>
                                <ConfigurationTable
                                    products={[]}
                                    drivers={[]}
                                    accessories={area.accessories}
                                    onDelete={onDelete}
                                    onUpdateQty={onUpdateQty}
                                    isLocked={isLocked}
                                />
                            </div>
                        )}

                        {/* Summary Footer for Area */}
                        {(area.products.length > 0 || area.drivers.length > 0 || area.accessories.length > 0) && (
                            <div style={{ marginTop: '16px', padding: '16px', backgroundColor: '#f8fafc', borderRadius: '8px', border: '1px solid #f1f5f9' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <Text strong>Subtotal for {area.name}:</Text>
                                    <Text style={{ fontSize: '18px', fontWeight: '800', color: '#2563eb' }}>
                                        ₹{(
                                            area.products.reduce((s: number, p: any) => s + (p.quantity * (p.product_detail?.price || 0)), 0) +
                                            area.drivers.reduce((s: number, d: any) => s + (d.quantity * (d.driverData?.price || 0)), 0) +
                                            area.accessories.reduce((s: number, a: any) => s + (a.quantity * (a.accessoriesData?.reduce((accSum: number, acc: any) => accSum + (acc.price || 0), 0) || 0)), 0)
                                        ).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                                    </Text>
                                </div>
                            </div>
                        )}
                    </div>
                </Card>
            ))}
        </div>
    );
};

export default UnifiedConfigurationTab;
