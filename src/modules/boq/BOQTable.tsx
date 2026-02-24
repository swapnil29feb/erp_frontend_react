import type { BOQItem } from './types';

interface BOQTableProps {
    items: BOQItem[];
    isLocked: boolean;
    onPriceChange?: (itemId: number, newPrice: number) => void;
}

export default function BOQTable({ items, isLocked, onPriceChange }: BOQTableProps) {

    if (!items || items.length === 0) {
        return (
            <div style={styles.emptyContainer}>
                <div style={styles.emptyIcon}>📂</div>
                <h3 style={styles.emptyTitle}>No BOQ items generated</h3>
                <p style={styles.emptyText}>Go to Summary tab and click "Generate BOQ".</p>
            </div>
        );
    }

    /* ---------------- HELPERS ---------------- */

    const getOrderCode = (item: BOQItem) => {
        if (item.item_type === "PRODUCT") return item.product_details?.order_code;
        if (item.item_type === "DRIVER") return item.driver_details?.driver_code;
        if (item.item_type === "ACCESSORY") return item.accessory_details?.name;
        return "-";
    };

    const getDescription = (item: BOQItem) => {
        if (item.item_type === "PRODUCT") return item.product_details?.name;
        if (item.item_type === "DRIVER") return item.driver_details?.driver_make || "-";
        if (item.item_type === "ACCESSORY") return item.accessory_details?.type || "-";
        return "-";
    };

    const getPrice = (item: BOQItem) => Number(item.unit_price || 0);
    const getTotal = (item: BOQItem) => Number(item.final_price || 0);

    /* ---------------- SPLIT BY TYPE ---------------- */

    const sections = [
        { title: "Products", rows: items.filter(i => i.item_type === "PRODUCT") },
        { title: "Drivers", rows: items.filter(i => i.item_type === "DRIVER") },
        { title: "Accessories", rows: items.filter(i => i.item_type === "ACCESSORY") },
    ];

    const grandTotal = items.reduce((s, i) => s + getTotal(i), 0);

    /* ---------------- RENDER ---------------- */

    return (
        <div style={styles.container}>

            {sections.map(section => {

                if (section.rows.length === 0) return null;

                const sectionTotal = section.rows.reduce((s, r) => s + getTotal(r), 0);

                return (
                    <div key={section.title} style={{ marginBottom: '40px' }}>

                        <div style={styles.areaHeader}>
                            {section.title}
                            <span style={{ float: 'right', color: '#2563eb', fontWeight: 700 }}>
                                ₹ {sectionTotal.toLocaleString()}
                            </span>
                        </div>

                        <div style={styles.dividerLine} />

                        <table style={styles.table}>
                            <thead>
                                <tr>
                                    <th style={styles.th}>Order Code</th>
                                    <th style={styles.th}>Description</th>
                                    <th style={{ ...styles.th, textAlign: 'center' }}>Qty</th>
                                    <th style={{ ...styles.th, textAlign: 'right' }}>Unit Price</th>
                                    <th style={{ ...styles.th, textAlign: 'right' }}>Total</th>
                                </tr>
                            </thead>

                            <tbody>
                                {section.rows.map(item => (
                                    <tr key={item.id} style={styles.tr}>

                                        <td style={{ ...styles.td, fontWeight: 600 }}>
                                            {getOrderCode(item)}
                                        </td>

                                        <td style={styles.td}>
                                            {getDescription(item)}
                                        </td>

                                        <td style={{ ...styles.td, textAlign: 'center' }}>
                                            {item.quantity}
                                        </td>

                                        <td style={{ ...styles.td, textAlign: 'right' }}>
                                            {isLocked ? (
                                                <>₹ {getPrice(item).toLocaleString()}</>
                                            ) : (
                                                <div style={styles.priceInputWrapper}>
                                                    <span style={{ marginRight: 4 }}>₹</span>
                                                    <input
                                                        type="number"
                                                        value={getPrice(item)}
                                                        onChange={(e) =>
                                                            onPriceChange?.(item.id, parseFloat(e.target.value) || 0)
                                                        }
                                                        style={styles.input}
                                                    />
                                                </div>
                                            )}
                                        </td>

                                        <td style={{ ...styles.td, textAlign: 'right', fontWeight: 'bold' }}>
                                            ₹ {getTotal(item).toLocaleString()}
                                        </td>

                                    </tr>
                                ))}
                            </tbody>
                        </table>

                        <div style={styles.dividerLine} />
                    </div>
                );
            })}

            {/* GRAND TOTAL */}
            <div style={{
                marginTop: '40px',
                padding: '24px',
                backgroundColor: '#1e293b',
                borderRadius: '8px',
                color: '#fff',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
            }}>
                <span style={{ fontSize: '18px', fontWeight: '600' }}>Grand Total (INR):</span>
                <span style={{ fontSize: '28px', fontWeight: '900', color: '#60a5fa' }}>
                    ₹ {grandTotal.toLocaleString()}
                </span>
            </div>
        </div>
    );
}
const styles = {
    container: {
        width: '100%',
        backgroundColor: '#fff',
        overflowX: 'auto' as const
    },
    table: {
        width: '100%',
        borderCollapse: 'collapse' as const,
        tableLayout: 'auto' as const
    },
    areaHeader: {
        backgroundColor: '#f1f5f9',
        padding: '12px 16px',
        fontSize: '14px',
        fontWeight: '700',
        color: '#1e293b',
        borderLeft: '4px solid #2563eb',
        marginBottom: '4px'
    },
    th: {
        backgroundColor: '#f8fafc',
        padding: '12px 16px',
        fontSize: '11px',
        fontWeight: 'bold',
        color: '#64748b',
        textTransform: 'uppercase' as const,
        borderBottom: '1px solid #e2e8f0',
        textAlign: 'left' as const,
        letterSpacing: '0.05em'
    },
    td: {
        padding: '12px 16px',
        fontSize: '13px',
        color: '#334155',
        borderBottom: '1px solid #f1f5f9',
        whiteSpace: 'nowrap' as const
    },
    tr: {
        backgroundColor: 'transparent'
    },
    dividerLine: {
        borderTop: '1px solid #e2e8f0',
        margin: '20px 0'
    },
    priceInputWrapper: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'flex-end'
    },
    input: {
        width: '100px',
        padding: '4px 8px',
        borderRadius: '4px',
        border: '1px solid #d1d5db',
        textAlign: 'right' as const,
        fontSize: '13px'
    },
    emptyContainer: {
        padding: '100px 40px',
        textAlign: 'center' as const,
        backgroundColor: '#fff',
        display: 'flex',
        flexDirection: 'column' as const,
        alignItems: 'center',
        justifyContent: 'center'
    },
    emptyIcon: {
        fontSize: '48px',
        marginBottom: '16px'
    },
    emptyTitle: {
        fontSize: '18px',
        fontWeight: '700',
        color: '#1e293b',
        margin: '0 0 8px 0'
    },
    emptyText: {
        fontSize: '14px',
        color: '#64748b',
        margin: 0
    }
} as const;
