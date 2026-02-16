
import React, { useMemo } from 'react';
import { Button, Table, Card, Typography } from 'antd';
import { PlusOutlined, DeleteOutlined } from '@ant-design/icons';

const { Title, Text } = Typography;

interface UnifiedConfigurationTabProps {
    configurations: any[];
    areas: any[];
    onAddProduct: (areaId: number) => void;
    onAddDriver: (areaId: number) => void;
    onAddAccessory: (areaId: number) => void;
    onDelete: (id: number) => void;
    onUpdateQty: (id: number, qty: number) => void;
}

const UnifiedConfigurationTab: React.FC<UnifiedConfigurationTabProps> = ({
    configurations,
    areas,
    onAddProduct,
    onAddDriver,
    onAddAccessory,
    onDelete,
    onUpdateQty
}) => {

    const groupedData = useMemo(() => {
        const map = new Map();
        areas.forEach(area => map.set(area.id, { ...area, items: [] }));

        configurations.forEach(config => {
            const area = map.get(config.area);
            if (area) {
                area.items.push(config);
            }
        });

        return Array.from(map.values()).filter(area => area.items.length > 0 || true); // Show all areas
    }, [configurations, areas]);

    const productColumns = [
        { title: 'Make', dataIndex: ['productData', 'make'], key: 'make' },
        { title: 'Order Code', dataIndex: ['productData', 'order_code'], key: 'code', render: (text: string) => <Text strong>{text}</Text> },
        { title: 'Wattage', dataIndex: ['productData', 'wattage'], key: 'wattage', render: (w: number) => w ? `${w}W` : '-' },
        {
            title: 'Qty', dataIndex: 'quantity', key: 'qty', render: (qty: number, record: any) => (
                <input
                    type="number"
                    min={1}
                    value={qty}
                    onChange={(e) => onUpdateQty(record.id, parseInt(e.target.value) || 0)}
                    style={{
                        width: '70px',
                        padding: '6px 10px',
                        border: '1px solid #cbd5e1',
                        borderRadius: '6px',
                        fontSize: '13px',
                        fontWeight: '600',
                        color: '#1e293b',
                        outline: 'none',
                        transition: 'all 0.2s',
                        textAlign: 'center'
                    }}
                />
            )
        },
        { title: 'Total', key: 'total', align: 'right' as const, render: (_: any, record: any) => `₹ ${((record.productData?.base_price || 0) * record.quantity).toLocaleString()}` },
        {
            title: '', key: 'actions', width: 50, render: (_: any, record: any) => (
                <Button type="text" danger icon={<DeleteOutlined />} onClick={() => onDelete(record.id)} />
            )
        }
    ];

    const driverColumns = [
        { title: 'Make', dataIndex: ['driverData', 'make'], key: 'make' },
        { title: 'Order Code', dataIndex: ['driverData', 'order_code'], key: 'code' },
        { title: 'Qty', dataIndex: 'quantity', key: 'qty' },
        { title: 'Total', key: 'total', align: 'right' as const, render: (_: any, record: any) => `₹ ${((record.driverData?.base_price || 0) * record.quantity).toLocaleString()}` },
        {
            title: '', key: 'actions', width: 50, render: (_: any, record: any) => (
                <Button type="text" danger icon={<DeleteOutlined />} onClick={() => onDelete(record.id)} />
            )
        }
    ];

    const totalConfigs = configurations.length;

    return (
        <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '32px', minHeight: 'calc(100vh - 200px)' }}>
            {totalConfigs === 0 ? (
                <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Card
                        style={{
                            width: '400px',
                            textAlign: 'center',
                            borderRadius: '16px',
                            boxShadow: '0 10px 25px -5px rgba(0,0,0,0.1)',
                            border: '1px solid #e2e8f0',
                            padding: '20px'
                        }}
                    >
                        <div style={{ fontSize: '64px', marginBottom: '20px' }}>⚡</div>
                        <Title level={3} style={{ marginBottom: '8px', color: '#1e293b' }}>No configuration yet</Title>
                        <Text type="secondary" style={{ display: 'block', marginBottom: '32px', fontSize: '15px' }}>
                            Add products to start configuration and generate technical specifications.
                        </Text>
                        <Button
                            type="primary"
                            size="large"
                            icon={<PlusOutlined />}
                            disabled={areas.length === 0}
                            onClick={() => areas[0]?.id && onAddProduct(areas[0].id)}
                            style={{ height: '48px', padding: '0 32px', borderRadius: '8px', fontWeight: '600' }}
                        >
                            {areas.length === 0 ? 'Create Area First' : 'Add Product'}
                        </Button>
                    </Card>
                </div>
            ) : (
                groupedData.map(area => (
                    <Card
                        key={area.id}
                        hoverable
                        style={{ borderRadius: '12px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)', border: '1px solid #e2e8f0' }}
                        title={<Title level={4} style={{ margin: 0, color: '#1e293b' }}>{area.name}</Title>}
                    >
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '40px' }}>
                            {/* Products Section */}
                            <div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                                    <Title level={5} style={{ margin: 0 }}>Products</Title>
                                    <Button type="primary" icon={<PlusOutlined />} onClick={() => onAddProduct(area.id)}>Add Product</Button>
                                </div>
                                <Table
                                    dataSource={area.items.filter((i: any) => i.product)}
                                    columns={productColumns}
                                    pagination={false}
                                    size="middle"
                                    rowKey="id"
                                />
                            </div>

                            {/* Drivers Section */}
                            <div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                                    <Title level={5} style={{ margin: 0 }}>Drivers</Title>
                                    <Button icon={<PlusOutlined />} onClick={() => onAddDriver(area.id)}>Add Driver</Button>
                                </div>
                                <Table
                                    dataSource={area.items.filter((i: any) => i.driver)}
                                    columns={driverColumns}
                                    pagination={false}
                                    size="small"
                                    rowKey="id"
                                />
                            </div>

                            {/* Accessories Section */}
                            <div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                                    <Title level={5} style={{ margin: 0 }}>Accessories</Title>
                                    <Button icon={<PlusOutlined />} onClick={() => onAddAccessory(area.id)}>Add Accessory</Button>
                                </div>
                                <Table
                                    dataSource={area.items.filter((i: any) => i.accessories && i.accessories.length > 0)}
                                    columns={[
                                        {
                                            title: 'Accessories', key: 'accs', render: (_: any, record: any) => (
                                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                                                    {record.accessoriesData?.map((a: any) => (
                                                        <span key={a.id} style={{ backgroundColor: '#f1f5f9', padding: '2px 8px', borderRadius: '4px', fontSize: '12px' }}>
                                                            {a.order_code}
                                                        </span>
                                                    ))}
                                                </div>
                                            )
                                        },
                                        { title: 'Qty', dataIndex: 'quantity', key: 'qty' },
                                        {
                                            title: '', key: 'actions', width: 50, render: (_: any, record: any) => (
                                                <Button type="text" danger icon={<DeleteOutlined />} onClick={() => onDelete(record.id)} />
                                            )
                                        }
                                    ]}
                                    pagination={false}
                                    size="small"
                                    rowKey="id"
                                />
                            </div>
                        </div>
                    </Card>
                ))
            )}
        </div>
    );
};

export default UnifiedConfigurationTab;
