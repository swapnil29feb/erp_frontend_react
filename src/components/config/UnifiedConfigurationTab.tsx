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
    // onUpdateQty: (id: number, qty: number) => void;
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
    // onUpdateQty,
    onDataLoaded
}) => {
    const [loading, setLoading] = useState(false);
    const [productConfigs, setProductConfigs] = useState<any[]>([]);
    const [driverConfigs, setDriverConfigs] = useState<any[]>([]);
    const [accessoryConfigs, setAccessoryConfigs] = useState<any[]>([]);
    const lastHasDataRef = React.useRef<boolean | null>(null);

    const loadData = useCallback(async () => {
        if (!projectId) return;
        setLoading(true);
        try {
            const data = await getProjectConfigurations(projectId);
            console.log("Raw data from API:", data);

            // Helper to safely parse numbers
            const safeFloat = (val: any) => {
                if (typeof val === 'number') return val;
                if (typeof val === 'string') return parseFloat(val) || 0;
                return 0;
            };

            const mapDriver = (d: any) => {
                // Handle nested driver_detail from backend
                if (d.driver_detail) {
                    return {
                        ...d,
                        id: d.id, // Configuration ID
                        driver_id: d.driver,
                        make: d.driver_detail.driver_make || d.driver_detail.make || 'Unknown',
                        order_code: d.driver_detail.driver_code || d.driver_detail.order_code || 'Unknown',
                        price: safeFloat(d.driver_detail.base_price || d.driver_detail.price),
                        quantity: d.quantity || 1
                    };
                }
                // Handle flat map (fallback)
                const mapped = driverMap.get(d.driver) || driverMap.get(d);
                if (mapped) {
                    return {
                        ...mapped,
                        id: d.id || mapped.id,
                        quantity: d.quantity || 1,
                        make: mapped.driver_make || mapped.make,
                        order_code: mapped.driver_code || mapped.order_code,
                        price: safeFloat(mapped.base_price || mapped.price)
                    };
                }
                return null;
            };

            const mapAccessory = (a: any) => {
                if (a.accessory_detail) {
                    return {
                        ...a,
                        id: a.id,
                        accessory_id: a.accessory,
                        order_code: a.accessory_detail.order_code || a.accessory_detail.accessory_name || 'Unknown',
                        price: safeFloat(a.accessory_detail.base_price || a.accessory_detail.price),
                        quantity: a.quantity || 1
                    };
                }
                const mapped = accessoryMap.get(a.accessory) || accessoryMap.get(a);
                if (mapped) {
                    return {
                        ...mapped,
                        id: a.id || mapped.id,
                        quantity: a.quantity || 1,
                        order_code: mapped.order_code || mapped.accessory_name,
                        price: safeFloat(mapped.base_price || mapped.price)
                    };
                }
                return null;
            };

            const mapped = (data || []).map((cfg: any) => {
                // Product Mapping
                const backendDetail = cfg.product_detail;
                const masterProduct = productMap.get(cfg.product) || {};

                // Merge: start with master (has price), override with backend detail
                let product = {
                    ...masterProduct,
                    ...(backendDetail || {}),
                };

                // Fallback if product is just an ID or object in cfg.product
                if (Object.keys(product).length === 0 && typeof cfg.product === 'object') {
                    product = cfg.product;
                }

                if (product) {
                    product = {
                        ...product,
                        // Ensure price is picked up from master if missing in detail
                        price: safeFloat(product.base_price || product.price || 0),
                        make: product.make || 'Unknown',
                        order_code: product.order_code || 'Unknown',
                        wattage: product.wattage,
                    };
                }

                // Driver Mapping
                const rawDrivers = Array.isArray(cfg.drivers) ? cfg.drivers : [];
                const drivers = rawDrivers.map(mapDriver).filter(Boolean);

                // Accessory Mapping
                const rawAccessories = Array.isArray(cfg.accessories) ? cfg.accessories : [];
                const accs = rawAccessories.map(mapAccessory).filter(Boolean);

                return {
                    ...cfg,
                    product_detail: product,
                    // ConfigurationTable expects 'driverData' to be the single driver object
                    driverData: drivers.length > 0 ? drivers[0] : null,
                    accessoriesData: accs,
                    drivers: drivers,
                    accessories: accs,
                };
            });

            console.log("Mapped Configurations:", mapped);

            setProductConfigs(mapped);
            setDriverConfigs([]);
            setAccessoryConfigs([]);
        } catch (err) {
            console.error("Failed to fetch configurations", err);
        } finally {
            setLoading(false);
        }
    }, [projectId, productMap, driverMap, accessoryMap]);

    useEffect(() => {
        loadData();
    }, [projectId]);

    useEffect(() => {
        if (!loading && onDataLoaded) {
            const hasData = productConfigs.length > 0;

            // prevent infinite parent update loop
            if (lastHasDataRef.current !== hasData) {
                lastHasDataRef.current = hasData;
                onDataLoaded(hasData);
            }
        }
    }, [loading, productConfigs.length, onDataLoaded]);

    const groupedData = useMemo(() => {

        // If no areas OR project level → make virtual area
        const useProjectWide = isProjectLevel || !areas || areas.length === 0;

        const map = new Map();

        // Create area buckets
        if (useProjectWide) {
            map.set('project-wide', {
                id: null,
                name: 'Project Wide Configuration',
                products: [],
                drivers: [],
                accessories: [],
            });
        } else {
            areas.forEach(area =>
                map.set(area.id, { ...area, products: [], drivers: [], accessories: [] })
            );
        }

        // Assign products
        productConfigs.forEach(p => {
            const key = useProjectWide ? 'project-wide' : p.area;
            const area = map.get(key);
            if (area) area.products.push(p);
        });

        // Assign drivers
        driverConfigs.forEach(d => {
            const key = useProjectWide ? 'project-wide' : d.area;
            const area = map.get(key);

            if (area) area.drivers.push(d);
        });

        // Assign accessories
        accessoryConfigs.forEach(a => {
            const key = useProjectWide ? 'project-wide' : a.area;
            const area = map.get(key);

            if (area) area.accessories.push(a);
        });

        return Array.from(map.values());

    }, [productConfigs, driverConfigs, accessoryConfigs, areas, isProjectLevel]);

    const hasAnyConfig =
        productConfigs.length > 0 ||
        driverConfigs.length > 0 ||
        accessoryConfigs.length > 0;

    if (loading && !hasAnyConfig) {
        return (
            <div style={{ padding: '80px', textAlign: 'center' }}>
                <Spin size="large" tip="Loading configurations..." />
            </div>
        );
    }
    console.log("Grouped Data for Rendering:", groupedData);
    return (
        <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '32px' }}>
            {groupedData.map((area) => (
                <Card
                    key={area.id || 'project-wide'}
                    hoverable
                    style={{
                        borderRadius: '12px',
                        boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)',
                        border: '1px solid #e2e8f0',
                    }}
                    title={
                        <span style={{ fontWeight: '700', fontSize: '18px', color: '#1e293b' }}>
                            {area.name}
                        </span>
                    }
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
                        {area.products.length > 0 && (
                            <ConfigurationTable
                                products={area.products}
                            />
                        )}

                        {/* Subtotal */}
                        <div
                            style={{
                                marginTop: '16px',
                                padding: '16px',
                                backgroundColor: '#f8fafc',
                                borderRadius: '8px',
                                border: '1px solid #f1f5f9',
                            }}
                        >
                            <div
                                style={{
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center',
                                }}
                            >
                                <Text strong>Subtotal for {area.name}:</Text>
                                <Text
                                    style={{
                                        fontSize: '18px',
                                        fontWeight: '800',
                                        color: '#2563eb',
                                    }}
                                >
                                    ₹
                                    {(
                                        // 1. Calculate Product Configurations (Product + Attached Driver + Attached Accessories)
                                        area.products.reduce((s: number, p: any) => {
                                            const productPrice = p.product_detail?.base_price || p.product_detail?.price || 0;
                                            const driverPrice = p.driverData?.base_price || 0;
                                            const accPrice = (p.accessoriesData || []).reduce(
                                                (accSum: number, a: any) => accSum + (a.price || 0), 0
                                            );

                                            const unitTotal = productPrice + driverPrice + accPrice;
                                            return s + (p.quantity * unitTotal);
                                        }, 0) +

                                        // 2. Standalone Drivers (if any)
                                        area.drivers.reduce((s: number, d: any) => s + (d.quantity * (d.driverData?.price || 0)), 0) +

                                        // 3. Standalone Accessories (if any)
                                        area.accessories.reduce((s: number, a: any) => s + (a.quantity * (a.accessoriesData?.reduce((accSum: number, acc: any) => accSum + (acc.price || 0), 0) || 0)), 0)

                                    ).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                                </Text>
                            </div>
                        </div>
                    </div>
                </Card>
            ))}
        </div>
    );
};

export default UnifiedConfigurationTab;
