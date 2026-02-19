import React from 'react';
import { Table, Typography, Divider } from 'antd';
import { Collapse } from 'antd';

const { Title, Text } = Typography;

interface ConfigurationTableProps {
    products: any[];
}

const ConfigurationTable: React.FC<ConfigurationTableProps> = ({ products }) => {

    /* =========================================================
       1️⃣ GROUP DATA (PRODUCT / DRIVER / ACCESSORY)
    ========================================================= */

    const productMap: Record<string, any> = {};
    const driverMap: Record<string, any> = {};
    const accessoryMap: Record<string, any> = {};

    products.forEach((p) => {
        const qty = p.quantity || 1;

        /* ---------------- PRODUCT ---------------- */
        const pKey = p.product_detail?.order_code || p.product_detail?.name || "unknown";
        const pPrice = p.product_detail?.base_price || p.product_detail?.price || 0;

        if (!productMap[pKey]) {
            productMap[pKey] = {
                ...p.product_detail,
                quantity: 0,
                total: 0
            };
        }

        productMap[pKey].quantity += qty;
        productMap[pKey].total += pPrice * qty;

        /* ---------------- DRIVER ---------------- */
        if (p.driverData) {
            const dKey = p.driverData.order_code;
            const dPrice = p.driverData.price || 0;

            if (!driverMap[dKey]) {
                driverMap[dKey] = {
                    ...p.driverData,
                    quantity: 0,
                    total: 0
                };
            }

            driverMap[dKey].quantity += qty;
            driverMap[dKey].total += dPrice * qty;
        }

        /* ---------------- ACCESSORIES ---------------- */
        (p.accessoriesData || []).forEach((acc: any) => {
            const aKey = acc.order_code;
            const aPrice = acc.price || 0;

            if (!accessoryMap[aKey]) {
                accessoryMap[aKey] = {
                    ...acc,
                    quantity: 0,
                    total: 0
                };
            }

            accessoryMap[aKey].quantity += qty;
            accessoryMap[aKey].total += aPrice * qty;
        });
    });

    const productData = Object.values(productMap);
    const driverData = Object.values(driverMap);
    const accessoryData = Object.values(accessoryMap);

    /* =========================================================
       2️⃣ TOTALS
    ========================================================= */

    const productTotal = productData.reduce((s: number, p: any) => s + p.total, 0);
    const driverTotal = driverData.reduce((s: number, d: any) => s + d.total, 0);
    const accessoryTotal = accessoryData.reduce((s: number, a: any) => s + a.total, 0);
    const grandTotal = productTotal + driverTotal + accessoryTotal;

    /* =========================================================
       3️⃣ COLUMNS
    ========================================================= */

    const currency = (n: number) =>
        `₹${n.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

    const productColumns = [
        { title: "Make", dataIndex: "make" },
        { title: "Order Code", dataIndex: "order_code" },
        { title: "Wattage", render: (_:any,r:any)=> r.wattage?`${r.wattage} W`:"-" },
        { title: "Qty", dataIndex: "quantity", align:"center" },
        { title: "Unit Price", render: (_:any,r:any)=>currency(r.base_price||r.price||0)},
        { title: "Total", render: (_:any,r:any)=>currency(r.total)},
    ];

    const driverColumns = [
        { title: "Make", dataIndex: "make" },
        { title: "Order Code", dataIndex: "order_code" },
        { title: "Qty", dataIndex: "quantity", align:"center" },
        { title: "Unit Price", render: (_:any,r:any)=>currency(r.price||0)},
        { title: "Total", render: (_:any,r:any)=>currency(r.total)},
    ];

    const accessoryColumns = [
        { title: "Order Code", dataIndex: "order_code" },
        { title: "Description", dataIndex: "description" },
        { title: "Qty", dataIndex: "quantity", align:"center" },
        { title: "Unit Price", render: (_:any,r:any)=>currency(r.price||0)},
        { title: "Total", render: (_:any,r:any)=>currency(r.total)},
    ];
const renderTableSection = (
    title: string,
    data: any[],
    columns: any[],
    total: number
) => (
    <Collapse
        defaultActiveKey={[title]}
        style={{ marginBottom: 18 }}
        items={[
            {
                key: title,
                label: (
                    <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
                        <span style={{ fontWeight: 600 }}>{title}</span>
                        <span style={{ color: '#2563eb', fontWeight: 600 }}>
                            Total: {currency(total)}
                        </span>
                    </div>
                ),
                children: (
                    <Table
                        dataSource={data}
                        columns={columns}
                        pagination={false}
                        rowKey="order_code"
                    />
                )
            }
        ]}
    />
);

    /* =========================================================
       4️⃣ RENDER
    ========================================================= */

return (
    <div>

        {renderTableSection("Products", productData, productColumns, productTotal)}

        {renderTableSection("Drivers", driverData, driverColumns, driverTotal)}

        {renderTableSection("Accessories", accessoryData, accessoryColumns, accessoryTotal)}

        <div style={{
            textAlign: 'right',
            fontSize: 18,
            marginTop: 20,
            padding: 16,
            background: '#f8fafc',
            borderRadius: 8
        }}>
            <Text strong>Grand Total: </Text>
            <Text strong style={{ color: '#1677ff', fontSize: 20 }}>
                {currency(grandTotal)}
            </Text>
        </div>

    </div>
);

};

export default ConfigurationTable;
