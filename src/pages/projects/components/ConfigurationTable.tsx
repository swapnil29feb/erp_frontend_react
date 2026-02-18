import React from 'react';
import { Table, Button, Typography, Tag } from 'antd';
import { DeleteOutlined } from '@ant-design/icons';

const { Text, Title } = Typography;

interface ConfigurationTableProps {
    products: any[];
    drivers: any[];
    accessories: any[];
    isLocked?: boolean;
    // onUpdateQty: (id: number, qty: number) => void;
    onDelete: (id: number) => void;
}

const ConfigurationTable: React.FC<ConfigurationTableProps> = ({
    products,
    drivers,
    accessories,
    isLocked = false,
    // onUpdateQty,
    onDelete
}) => {

// console.log("products in ConfigurationTable:", products);
// console.log(" accessories in ConfigurationTable:", accessories);

// console.log("drivers in ConfigurationTable:", drivers);
    // STEP 6: Fix totals inside table to include nested components
    const productTotal = products.reduce(
        (sum, p) => sum + (p.quantity * (p.product_detail?.price || 0)),
        0
    );

    const driverTotal = drivers.reduce(
        (sum, d) => sum + (d.quantity * (d.driver_detail?.price || 0)),
        0
    ) + products.reduce(
        (sum, p) => sum + (p.quantity * (p.driverData?.price || 0)),
        0
    );

   const accessoryTotal =
    // standalone accessories
    accessories.reduce(
        (sum, a) => sum + (a.quantity * (a.accessory_detail?.price || 0)),
        0
    )
    +
    // accessories attached to products
    products.reduce((sum, p) => {

        const accessoryUnitPrice = (p.accessoriesData || []).reduce(
            (accSum: number, acc: any) => accSum + (acc.price || 0),
            0
        );

        return sum + (p.quantity * accessoryUnitPrice);

    }, 0);


    const grandTotal = productTotal + driverTotal + accessoryTotal;

    const productColumns = [
        {
            title: 'Make',
            key: 'make',
            render: (_: any, row: any) => row.product_detail?.make || "-"
        },
        {
            title: 'Order Code',
            key: 'code',
            render: (_: any, row: any) => (
                <Text strong>{row.product_detail?.order_code || "-"}</Text>
            )
        },
        {
            title: 'Wattage',
            key: 'wattage',
            render: (_: any, row: any) => row.product_detail?.wattage
                ? `${row.product_detail.wattage} W`
                : "-"
        },
        {
            title: 'Driver',
            key: 'driver',
            render: (_: any, row: any) => row.driverData ? (
                <div style={{ fontSize: '12px' }}>
                    <div style={{ fontWeight: 600 }}>{row.driverData.make}</div>
                    <div style={{ color: '#64748b' }}>{row.driverData.order_code}</div>
                </div>
            ) : (
                <Text type="secondary" style={{ fontSize: '11px' }}>No driver</Text>
            )
        },
        {
            title: 'Accessories',
            key: 'accessories',
            render: (_: any, row: any) => {
                if (!row.accessoriesData || row.accessoriesData.length === 0) {
                    return <Text type="secondary" style={{ fontSize: '11px' }}>No accessories</Text>;
                }
                return (
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                        {row.accessoriesData.map((acc: any) => (
                            <Tag key={acc.id || acc.accessory_id} style={{ margin: 0, fontSize: '11px' }}>
                                {acc.order_code}
                            </Tag>
                        ))}
                    </div>
                );
            }
        },
        {
            title: 'Qty',
            key: 'qty',
            width: 100,
            render: (_: any, row: any) => (
                <input
                    type="number"
                    min={1}
                    value={row.quantity || 1}
                    // onChange={(e) =>
                    //     // onUpdateQty(row.id, parseInt(e.target.value || "1"))
                    // }
                    disabled={true}
                    style={{
                        width: "70px",
                        padding: "4px",
                        textAlign: "center",
                        border: '1px solid #d1d5db',
                        borderRadius: '4px',
                        backgroundColor: isLocked ? '#f9fafb' : 'white',
                        cursor: isLocked ? 'not-allowed' : 'auto'
                    }}
                />
            )
        },
        {
            title: 'Total',
            key: 'total',
            align: 'right' as const,
            render: (_: any, row: any) => {
                const productPrice = row.product_detail?.base_price || row.product_detail?.price || 0;
                const driverPrice = row.driverData?.price || 0;
                const accessoriesPrice = (row.accessoriesData || []).reduce((sum: number, acc: any) => sum + (acc.price || 0), 0);
                const total = (productPrice + driverPrice + accessoriesPrice) * (row.quantity || 1);

                return (
                    <Text strong style={{ color: '#1e293b' }}>
                        ₹{total.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </Text>
                );
            }
        },
        // {
        //     title: '',
        //     key: 'actions',
        //     width: 50,
        //     render: (_: any, row: any) => (
        //         <Button type="text" danger icon={<DeleteOutlined />} onClick={() => onDelete(row.id)} disabled={isLocked} />
        //     )
        // }
    ];

    const allData = [...products, ...drivers, ...accessories];

    return (
        <div className="configuration-table-wrapper">
            <Table
                dataSource={allData}
                columns={productColumns}
                pagination={false}
                size="middle"
                rowKey="id"
                footer={() => (
                    <div style={{ padding: '10px', backgroundColor: '#f8fafc', borderRadius: '8px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                            <Text type="secondary">Product Total:</Text>
                            <Text strong>₹{productTotal.toLocaleString('en-IN')}</Text>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                            <Text type="secondary">Driver Total:</Text>
                            <Text strong>₹{driverTotal.toLocaleString('en-IN')}</Text>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                            <Text type="secondary">Accessory Total:</Text>
                            <Text strong>₹{accessoryTotal.toLocaleString('en-IN')}</Text>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid #e2e8f0', paddingTop: '8px' }}>
                            <Title level={5} style={{ margin: 0 }}>Grand Total:</Title>
                            <Title level={5} style={{ margin: 0, color: '#2563eb' }}>₹{grandTotal.toLocaleString('en-IN')}</Title>
                        </div>
                    </div>
                )}
            />
        </div>
    );
};

export default ConfigurationTable;
