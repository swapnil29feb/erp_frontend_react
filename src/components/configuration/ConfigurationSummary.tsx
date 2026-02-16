
import React from 'react';

const formatNumber = (value?: number | string) => {
    const num = Number(value);
    if (isNaN(num)) return "0";
    return num.toLocaleString();
};

interface SelectedItem {
    id: number;
    name: string;
    code?: string;
    quantity: number;
    price: number;
    wattage?: number;
}

interface ConfigurationSummaryProps {
    luminaires: SelectedItem[];
    drivers: SelectedItem[];
    accessories: SelectedItem[];
    onRemove: (type: 'luminaire' | 'driver' | 'accessory', index: number) => void;
}

const ConfigurationSummary: React.FC<ConfigurationSummaryProps> = ({
    luminaires,
    drivers,
    accessories,
    onRemove
}) => {
    const safeLuminaires = Array.isArray(luminaires) ? luminaires : [];
    const safeDrivers = Array.isArray(drivers) ? drivers : [];
    const safeAccessories = Array.isArray(accessories) ? accessories : [];

    const lumCost = safeLuminaires.reduce((sum, item) => sum + ((item.price || 0) * (item.quantity || 0)), 0);
    const drvCost = safeDrivers.reduce((sum, item) => sum + ((item.price || 0) * (item.quantity || 0)), 0);
    const accCost = safeAccessories.reduce((sum, item) => sum + ((item.price || 0) * (item.quantity || 0)), 0);

    const grandTotal = lumCost + drvCost + accCost;

    return (
        <div style={styles.container}>
            <div style={styles.grid}>
                {/* Luminaires List */}
                <div style={styles.listSection}>
                    <div style={styles.sectionHeader}>Luminaires ({safeLuminaires.length})</div>
                    <div style={styles.itemList}>
                        {safeLuminaires.length === 0 ? <div style={styles.empty}>None selected</div> :
                            safeLuminaires.map((item, idx) => (
                                <div key={`l-${idx}`} style={styles.itemRow}>
                                    <div style={styles.itemInfo}>
                                        <span style={styles.name}>{item.name}</span>
                                        <span style={styles.details}>{item.quantity} x ₹{formatNumber(item.price)}</span>
                                    </div>
                                    <button onClick={() => onRemove('luminaire', idx)} style={styles.remove}>×</button>
                                </div>
                            ))}
                    </div>
                </div>

                {/* Drivers List */}
                <div style={styles.listSection}>
                    <div style={styles.sectionHeader}>Drivers ({safeDrivers.length})</div>
                    <div style={styles.itemList}>
                        {safeDrivers.length === 0 ? <div style={styles.empty}>None selected</div> :
                            safeDrivers.map((item, idx) => (
                                <div key={`d-${idx}`} style={styles.itemRow}>
                                    <div style={styles.itemInfo}>
                                        <span style={styles.name}>{item.name}</span>
                                        <span style={styles.details}>{item.quantity} x ₹{formatNumber(item.price)}</span>
                                    </div>
                                    <button onClick={() => onRemove('driver', idx)} style={styles.remove}>×</button>
                                </div>
                            ))}
                    </div>
                </div>

                {/* Accessories List */}
                <div style={styles.listSection}>
                    <div style={styles.sectionHeader}>Accessories ({safeAccessories.length})</div>
                    <div style={styles.itemList}>
                        {safeAccessories.length === 0 ? <div style={styles.empty}>None selected</div> :
                            safeAccessories.map((item, idx) => (
                                <div key={`a-${idx}`} style={styles.itemRow}>
                                    <div style={styles.itemInfo}>
                                        <span style={styles.name}>{item.name}</span>
                                        <span style={styles.details}>{item.quantity} x ₹{formatNumber(item.price)}</span>
                                    </div>
                                    <button onClick={() => onRemove('accessory', idx)} style={styles.remove}>×</button>
                                </div>
                            ))}
                    </div>
                </div>

                {/* Grand Total Calculation Column */}
                <div style={styles.costSection}>
                    <div style={styles.costRow}>
                        <span>Total Luminaires:</span>
                        <span style={styles.price}>₹{formatNumber(lumCost)}</span>
                    </div>
                    <div style={styles.costRow}>
                        <span>Total Drivers:</span>
                        <span style={styles.price}>₹{formatNumber(drvCost)}</span>
                    </div>
                    <div style={styles.costRow}>
                        <span>Total Accessories:</span>
                        <span style={styles.price}>₹{formatNumber(accCost)}</span>
                    </div>
                    <div style={styles.divider} />
                    <div style={styles.grandTotalRow}>
                        <span>Grand Total:</span>
                        <span style={styles.grandPrice}>₹{formatNumber(grandTotal)}</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

const styles = {
    container: {
        height: '140px', // FIXED HEIGHT: 140px
        backgroundColor: '#f1f5f9',
        borderTop: '2px solid #2563eb',
        padding: '12px 24px',
        boxSizing: 'border-box' as const,
        zIndex: 20
    },
    grid: {
        display: 'grid',
        gridTemplateColumns: '1fr 1fr 1fr 1.2fr',
        gap: '20px',
        height: '100%'
    },
    listSection: {
        display: 'flex',
        flexDirection: 'column' as const,
        overflow: 'hidden'
    },
    sectionHeader: {
        fontSize: '11px',
        fontWeight: '700',
        textTransform: 'uppercase' as const,
        color: '#64748b',
        marginBottom: '6px',
        letterSpacing: '0.05em'
    },
    itemList: {
        flex: 1,
        overflowY: 'auto' as const,
        display: 'flex',
        flexDirection: 'column' as const,
        gap: '4px',
        minHeight: 0 // Required for nested scroll
    },
    itemRow: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: '#fff',
        padding: '4px 8px',
        borderRadius: '4px',
        border: '1px solid #e2e8f0',
        fontSize: '11px'
    },
    itemInfo: {
        display: 'flex',
        flexDirection: 'column' as const
    },
    name: {
        fontWeight: '600',
        color: '#1e293b',
        maxWidth: '120px',
        whiteSpace: 'nowrap' as const,
        overflow: 'hidden',
        textOverflow: 'ellipsis'
    },
    details: {
        fontSize: '10px',
        color: '#64748b'
    },
    remove: {
        border: 'none',
        background: 'none',
        color: '#ef4444',
        fontSize: '16px',
        cursor: 'pointer',
        padding: '0 4px'
    },
    empty: {
        fontSize: '11px',
        color: '#94a3b8',
        fontStyle: 'italic' as const
    },
    costSection: {
        display: 'flex',
        flexDirection: 'column' as const,
        justifyContent: 'center',
        paddingLeft: '20px',
        borderLeft: '1px solid #cbd5e1'
    },
    costRow: {
        display: 'flex',
        justifyContent: 'space-between',
        fontSize: '11px',
        color: '#475569',
        marginBottom: '2px'
    },
    price: {
        fontWeight: '600',
        color: '#1e293b'
    },
    divider: {
        height: '1px',
        backgroundColor: '#cbd5e1',
        margin: '6px 0'
    },
    grandTotalRow: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'baseline',
        fontSize: '13px',
        fontWeight: '800',
        color: '#0f172a'
    },
    grandPrice: {
        fontSize: '18px',
        color: '#2563eb'
    }
};

export default ConfigurationSummary;
