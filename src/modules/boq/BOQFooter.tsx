
import type { BOQSummary } from './types';

interface BOQFooterProps {
    summary: BOQSummary & { status?: string };
}

export default function BOQFooter({ summary }: BOQFooterProps) {
    const subtotal = summary.subtotal || 0;
    const margin = summary.margin_percent || 0;
    const grandTotal = summary.grand_total || 0;
    const status = summary.status || 'DRAFT';

    return (
        <div style={styles.container}>
            <div style={styles.summaryBox}>
                <div style={styles.row}>
                    <span style={styles.label}>Subtotal</span>
                    <strong style={styles.value}>₹ {subtotal.toLocaleString()}</strong>
                </div>
                <div style={styles.row}>
                    <span style={styles.label}>Margin</span>
                    <strong style={styles.value}>{margin}%</strong>
                </div>
                <div style={styles.divider} />
                <div style={styles.rowLarge}>
                    <span style={styles.labelLarge}>Grand Total</span>
                    <strong style={styles.valueLarge}>₹ {grandTotal.toLocaleString()}</strong>
                </div>
                <div style={styles.rowStatus}>
                    <span style={styles.label}>Status</span>
                    <span style={{
                        ...styles.statusText,
                        color: (status === 'APPROVED' || status === 'FINAL') ? '#10b981' : '#6b7280'
                    }}>
                        {status.replace('_', ' ')}
                    </span>
                </div>
            </div>
        </div>
    );
}

const styles = {
    container: {
        padding: '32px 40px',
        backgroundColor: '#f9fafb',
        borderTop: '2px solid #e5e7eb',
        display: 'flex',
        justifyContent: 'flex-end'
    },
    summaryBox: {
        width: '320px',
        display: 'flex',
        flexDirection: 'column' as const,
        gap: '8px'
    },
    row: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        fontSize: '14px'
    },
    label: {
        color: '#6b7280',
        fontWeight: '500'
    },
    value: {
        color: '#111827',
        fontWeight: '600'
    },
    divider: {
        margin: '12px 0',
        borderTop: '1px solid #e5e7eb'
    },
    rowLarge: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '4px'
    },
    labelLarge: {
        fontSize: '16px',
        fontWeight: 'bold',
        color: '#111827'
    },
    valueLarge: {
        fontSize: '24px',
        fontWeight: '900',
        color: '#1d4ed8'
    },
    rowStatus: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: '8px',
        fontSize: '12px',
        textTransform: 'uppercase' as const,
        letterSpacing: '0.05em'
    },
    statusText: {
        fontWeight: 'bold'
    }
};
