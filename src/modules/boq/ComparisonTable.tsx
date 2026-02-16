import type { BOQCompareItem } from './compareTypes';

interface ComparisonTableProps {
    items: BOQCompareItem[];
    summary: {
        total_v1: number;
        total_v2: number;
        difference: number;
    };
}

export default function ComparisonTable({ items, summary }: ComparisonTableProps) {
    const safeItems = items || [];
    const safeSummary = summary || { total_v1: 0, total_v2: 0, difference: 0 };

    if (safeItems.length === 0) {
        return (
            <div style={styles.empty}>
                No differences found.
            </div>
        );
    }

    return (
        <div style={styles.container}>
            <div style={styles.tableWrapper}>
                <table className="erp-table compact" style={styles.table}>
                    <thead style={styles.thead}>
                        <tr>
                            <th style={styles.th}>Area</th>
                            <th style={styles.th}>Product</th>
                            <th style={styles.th}>Driver</th>
                            <th style={{ ...styles.th, textAlign: 'center' }}>Qty V1</th>
                            <th style={{ ...styles.th, textAlign: 'center' }}>Qty V2</th>
                            <th style={{ ...styles.th, textAlign: 'right' }}>Price V1</th>
                            <th style={{ ...styles.th, textAlign: 'right' }}>Price V2</th>
                            <th style={{ ...styles.th, textAlign: 'right' }}>Total V1</th>
                            <th style={{ ...styles.th, textAlign: 'right' }}>Total V2</th>
                            <th style={{ ...styles.th, textAlign: 'right' }}>Difference</th>
                        </tr>
                    </thead>
                    <tbody>
                        {safeItems.map((item, idx) => {
                            const diff = item.difference ?? 0;
                            const rowBg = diff > 0 ? '#fef2f2' : diff < 0 ? '#f0fdf4' : 'transparent';

                            return (
                                <tr key={idx} style={{ ...styles.tr, backgroundColor: rowBg }}>
                                    <td style={styles.td}>{item.area}</td>
                                    <td style={styles.td}>{item.product}</td>
                                    <td style={styles.td}>{item.driver || '-'}</td>
                                    <td style={{ ...styles.td, textAlign: 'center' }}>{(item.qty_v1 ?? 0).toLocaleString()}</td>
                                    <td style={{ ...styles.td, textAlign: 'center' }}>{(item.qty_v2 ?? 0).toLocaleString()}</td>
                                    <td style={{ ...styles.td, textAlign: 'right' }}>₹ {(item.price_v1 ?? 0).toLocaleString()}</td>
                                    <td style={{ ...styles.td, textAlign: 'right' }}>₹ {(item.price_v2 ?? 0).toLocaleString()}</td>
                                    <td style={{ ...styles.td, textAlign: 'right' }}>₹ {(item.total_v1 ?? 0).toLocaleString()}</td>
                                    <td style={{ ...styles.td, textAlign: 'right' }}>₹ {(item.total_v2 ?? 0).toLocaleString()}</td>
                                    <td style={{
                                        ...styles.td,
                                        textAlign: 'right',
                                        fontWeight: 'bold',
                                        color: diff > 0 ? '#dc2626' : diff < 0 ? '#059669' : '#111827'
                                    }}>
                                        ₹ {diff.toLocaleString()}
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>

            <div style={styles.footer}>
                <div style={styles.summaryItem}>
                    <span style={styles.summaryLabel}>Total V1:</span>
                    <span style={styles.summaryValue}>₹ {(safeSummary.total_v1 ?? 0).toLocaleString()}</span>
                </div>
                <div style={styles.summaryItem}>
                    <span style={styles.summaryLabel}>Total V2:</span>
                    <span style={styles.summaryValue}>₹ {(safeSummary.total_v2 ?? 0).toLocaleString()}</span>
                </div>
                <div style={styles.summaryItemPrimary}>
                    <span style={styles.summaryLabel}>Difference:</span>
                    <span style={{
                        ...styles.summaryValueBig,
                        color: safeSummary.difference > 0 ? '#dc2626' : safeSummary.difference < 0 ? '#059669' : '#111827'
                    }}>
                        ₹ {(safeSummary.difference ?? 0).toLocaleString()}
                    </span>
                </div>
            </div>
        </div>
    );
}

const styles = {
    container: {
        flex: 1,
        display: 'flex',
        flexDirection: 'column' as const,
        overflow: 'hidden'
    },
    tableWrapper: {
        flex: 1,
        overflowY: 'auto' as const
    },
    table: {
        width: '100%',
        borderCollapse: 'collapse' as const
    },
    thead: {
        position: 'sticky' as const,
        top: 0,
        backgroundColor: '#f8fafc',
        zIndex: 10
    },
    th: {
        padding: '12px 10px',
        fontSize: '11px',
        fontWeight: 'bold',
        color: '#475569',
        textTransform: 'uppercase' as const,
        borderBottom: '1px solid #e2e8f0',
        textAlign: 'left' as const
    },
    td: {
        padding: '10px',
        fontSize: '13px',
        borderBottom: '1px solid #f1f5f9'
    },
    tr: {
        transition: 'background-color 0.15s'
    },
    empty: {
        padding: '40px',
        textAlign: 'center' as const,
        color: '#64748b',
        fontSize: '14px'
    },
    footer: {
        padding: '20px 24px',
        borderTop: '2px solid #e2e8f0',
        backgroundColor: '#f8fafc',
        display: 'flex',
        justifyContent: 'flex-end',
        gap: '32px'
    },
    summaryItem: {
        display: 'flex',
        flexDirection: 'column' as const,
        alignItems: 'flex-end'
    },
    summaryItemPrimary: {
        display: 'flex',
        flexDirection: 'column' as const,
        alignItems: 'flex-end',
        paddingLeft: '32px',
        borderLeft: '1px solid #cbd5e1'
    },
    summaryLabel: {
        fontSize: '10px',
        fontWeight: 'bold',
        color: '#64748b',
        textTransform: 'uppercase' as const
    },
    summaryValue: {
        fontSize: '15px',
        fontWeight: '600',
        color: '#1e293b'
    },
    summaryValueBig: {
        fontSize: '18px',
        fontWeight: '800'
    }
};
