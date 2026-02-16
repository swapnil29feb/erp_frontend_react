
import React, { useMemo } from 'react';
import { Card, Typography, Button } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import ConfigurationTable from '../../pages/projects/components/ConfigurationTable';
const { Title } = Typography;

interface UnifiedConfigurationTabProps {
    products?: any[];
    drivers?: any[];
    accessories?: any[];
    areas: any[];
    onAddProduct: (areaId: number) => void;
    onDelete: (id: number) => void;
    onUpdateQty: (id: number, qty: number) => void;
    isProjectLevel?: boolean;
    isLocked?: boolean;
}

const UnifiedConfigurationTab: React.FC<UnifiedConfigurationTabProps> = ({
    products = [],
    drivers = [],
    accessories = [],
    areas,
    onAddProduct,
    onDelete,
    onUpdateQty,
    isProjectLevel = false,
    isLocked = false
}) => {

    const groupedData = useMemo(() => {
        const allItems = [...products, ...drivers, ...accessories];

        if (isProjectLevel || (areas.length === 0 && allItems.length > 0)) {
            return [{
                id: null,
                name: 'Project Wide Configuration',
                products: products,
                drivers: drivers,
                accessories: accessories
            }];
        }

        const map = new Map();
        areas.forEach(area => map.set(area.id, { ...area, products: [], drivers: [], accessories: [] }));

        products.forEach(p => {
            const area = map.get(p.area);
            if (area) area.products.push(p);
        });

        drivers.forEach(d => {
            const area = map.get(d.area);
            if (area) area.drivers.push(d);
        });

        accessories.forEach(a => {
            const area = map.get(a.area);
            if (area) area.accessories.push(a);
        });

        return Array.from(map.values()).filter(area =>
            area.products.length > 0 ||
            area.drivers.length > 0 ||
            area.accessories.length > 0 || true
        );
    }, [products, drivers, accessories, areas, isProjectLevel]);

    if (isProjectLevel) {
        return (
            <div className="p-6">
                <div className="card">
                    <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                        <Title level={3} style={{ margin: 0 }}>Project Configuration</Title>
                        <button className="primary-btn" onClick={() => onAddProduct(0)} disabled={isLocked}>
                            + Add Product
                        </button>
                    </div>

                    <ConfigurationTable
                        products={products}
                        drivers={drivers}
                        accessories={accessories}
                        onDelete={onDelete}
                        onUpdateQty={onUpdateQty}
                        isLocked={isLocked}
                    />
                </div>
            </div>
        );
    }

    return (
        <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '32px', minHeight: 'calc(100vh - 200px)' }}>
            {groupedData.map(area => (
                <Card
                    key={area.id}
                    hoverable
                    style={{ borderRadius: '12px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)', border: '1px solid #e2e8f0' }}
                >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                        <Title level={4} style={{ margin: 0, color: '#1e293b' }}>{area.name}</Title>
                        <Button
                            type="primary"
                            icon={<PlusOutlined />}
                            onClick={() => onAddProduct(area.id)}
                            disabled={isLocked}
                        >
                            Add Product
                        </Button>
                    </div>

                    <ConfigurationTable
                        products={area.products}
                        drivers={area.drivers}
                        accessories={area.accessories}
                        onDelete={onDelete}
                        onUpdateQty={onUpdateQty}
                        isLocked={isLocked}
                    />
                </Card>
            ))}
        </div>
    );
};

export default UnifiedConfigurationTab;
