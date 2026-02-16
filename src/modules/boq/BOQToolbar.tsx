
interface BOQToolbarProps {
    version: number;
    projectName?: string;
    clientName?: string;
    status: string;
    onApplyMargin: () => void;
    onApprove: () => void;
    onExportPDF: () => void;
    onExportExcel: () => void;
    onCompare?: () => void;
    isLoading?: boolean;
}

export default function BOQToolbar({
    version,
    status,
    onApplyMargin,
    onApprove,
    onExportPDF,
    onExportExcel,
    isLoading
}: BOQToolbarProps) {
    const isApproved = status === 'APPROVED' || status === 'FINAL';

    return (
        <div style={styles.toolbar}>
            <div style={styles.left}>
                <div style={styles.titleRow}>
                    <h2 style={styles.title}>BOQ Version {version}</h2>
                    <span style={{
                        ...styles.badge,
                        backgroundColor: isApproved ? '#ecfdf5' : '#f1f5f9',
                        color: isApproved ? '#059669' : '#475569',
                        borderColor: isApproved ? '#10b981' : '#cbd5e1'
                    }}>
                        {status.replace('_', ' ')}
                    </span>
                </div>
            </div>
            <div style={styles.right}>
                <button
                    className="secondary-btn"
                    onClick={onApplyMargin}
                    disabled={isApproved || isLoading}
                    style={{ ...styles.actionBtn, minWidth: '120px' }}
                >
                    Apply Margin
                </button>
                <button
                    className="primary-btn"
                    onClick={onApprove}
                    disabled={isApproved || isLoading}
                    style={{ ...styles.actionBtn, minWidth: '100px', backgroundColor: isApproved ? '#059669' : '#2563eb' }}
                >
                    {isApproved ? 'Approved' : 'Approve'}
                </button>
                <div style={styles.divider} />
                <button
                    className="secondary-btn"
                    onClick={onExportPDF}
                    style={styles.actionBtn}
                >
                    Export PDF
                </button>
                <button
                    className="secondary-btn"
                    onClick={onExportExcel}
                    style={styles.actionBtn}
                >
                    Export Excel
                </button>
            </div>
        </div>
    );
}

const styles = {
    toolbar: {
        padding: '20px 24px',
        backgroundColor: '#fff',
        borderBottom: '1px solid #e5e7eb',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
    },
    left: {
        display: 'flex',
        flexDirection: 'column' as const
    },
    titleRow: {
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        marginBottom: '4px'
    },
    title: {
        fontSize: '20px',
        fontWeight: '800',
        color: '#111827',
        margin: 0
    },
    subtitle: {
        fontSize: '13px',
        color: '#6b7280',
        fontWeight: '500'
    },
    badge: {
        padding: '2px 10px',
        borderRadius: '12px',
        fontSize: '11px',
        fontWeight: '700',
        textTransform: 'uppercase' as const,
        border: '1px solid'
    },
    right: {
        display: 'flex',
        gap: '8px',
        alignItems: 'center'
    },
    divider: {
        width: '1px',
        height: '24px',
        backgroundColor: '#e5e7eb',
        margin: '0 8px'
    },
    actionBtn: {
        padding: '8px 16px',
        fontSize: '13px',
        fontWeight: '600',
        borderRadius: '6px'
    }
} as const;
