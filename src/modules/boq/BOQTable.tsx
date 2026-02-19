import type { BOQItem } from './types';

interface BOQTableProps {
    items: BOQItem[];
    isLocked: boolean;
    onPriceChange?: (itemId: number, newPrice: number) => void;
}

export default function BOQTable({ items, isLocked, onPriceChange }: BOQTableProps) {
    const safeItems = items || [];

    if (safeItems.length === 0) {
        return (
            <div style={styles.emptyContainer}>
                <div style={styles.emptyIcon}>📂</div>
                <h3 style={styles.emptyTitle}>No BOQ items generated</h3>
                <p style={styles.emptyText}>Go to Summary tab and click "Generate BOQ".</p>
            </div>
        );
    }

    // Group items by Area
    const groupedItems: { [key: string]: BOQItem[] } = {};
    safeItems.forEach(item => {
        if (!groupedItems[item.area]) {
            groupedItems[item.area] = [];
        }
        groupedItems[item.area].push(item);
    });

    return (
        <div style={styles.container}>
            {Object.entries(groupedItems).map(([area, areaItems]) => {
                const areaTotal = areaItems.reduce((acc, item) => acc + (item.total || 0), 0);

                return (
                    <div key={area} style={{ marginBottom: '40px' }}>
                        <div style={styles.areaHeader}>
                            Area: {area}
                        </div>
                        <div style={styles.dividerLine} />
                        <table style={styles.table}>
                            <thead>
                                <tr>
                                    <th style={styles.th}>Type</th>
                                    <th style={styles.th}>Item</th>
                                    <th style={{ ...styles.th, textAlign: 'center' }}>Qty</th>
                                    <th style={{ ...styles.th, textAlign: 'right' }}>Rate</th>
                                    <th style={{ ...styles.th, textAlign: 'right' }}>Total</th>
                                </tr>
                            </thead>
                            <tbody>
                                {areaItems.map((item) => (
                                    <tr key={item.id} style={styles.tr}>
                                        <td style={{ ...styles.td, fontWeight: '600', color: '#64748b', fontSize: '11px', textTransform: 'uppercase' }}>
                                            {item.item_type || 'PRODUCT'}
                                        </td>
                                        <td style={{ ...styles.td, fontWeight: '500' }}>
                                            {item.item_name || item.product || 'Unknown Item'}
                                        </td>
                                        <td style={{ ...styles.td, textAlign: 'center' }}>
                                            {(item.qty || 0).toLocaleString()}
                                        </td>
                                        <td style={{ ...styles.td, textAlign: 'right' }}>
                                            {isLocked ? (
                                                <span>₹ {(item.unit_rate || item.unit_price || 0).toLocaleString()}</span>
                                            ) : (
                                                <div style={styles.priceInputWrapper}>
                                                    <span style={{ marginRight: '4px' }}>₹</span>
                                                    <input
                                                        type="number"
                                                        value={item.unit_rate || item.unit_price}
                                                        onChange={(e) => onPriceChange?.(item.id, parseFloat(e.target.value) || 0)}
                                                        style={styles.input}
                                                    />
                                                </div>
                                            )}
                                        </td>
                                        <td style={{ ...styles.td, textAlign: 'right', fontWeight: 'bold' }}>
                                            ₹ {(item.total || 0).toLocaleString()}
                                        </td>
                                    </tr>
                                ))}
                                <tr style={{ backgroundColor: '#f8fafc' }}>
                                    <td colSpan={4} style={{ ...styles.td, textAlign: 'right', fontWeight: 'bold' }}>
                                        Area Total:
                                    </td>
                                    <td style={{ ...styles.td, textAlign: 'right', fontWeight: 'bold', color: '#2563eb' }}>
                                        ₹ {areaTotal.toLocaleString()}
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                        <div style={styles.dividerLine} />
                    </div>
                );
            })}

            <div style={styles.dividerLine} />
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
                    ₹ {(safeItems.reduce((acc, item) => acc + (item.total || 0), 0)).toLocaleString()}
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
