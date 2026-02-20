
import React, { useState, useEffect } from 'react';
import { configService } from '../../services/configService';
import type { Driver, Accessory } from '../../types/config';

export const erpColors = {
    panelBg: "#F5F7FA",
    sectionHeader: "#E9EEF5",
    border: "#D6DEE8",
    textPrimary: "#1F2A37",
    accent: "#2F5AA8",
    activeRow: "#DCE7F9",
    qtyButton: "#CAD6EB",
};

interface RightPanelProps {
    firstProductId: number | null;
    selectedDrivers: any[];
    selectedAccessories: any[];
    onAddDriver: (driver: Driver, qty: number) => void;
    onAddAccessory: (accessory: Accessory, qty: number) => void;
}

const RightPanel: React.FC<RightPanelProps> = ({
    firstProductId,
    selectedDrivers,
    selectedAccessories,
    onAddDriver,
    onAddAccessory
}) => {
    const [drivers, setDrivers] = useState<Driver[]>([]);
    const [accessories, setAccessories] = useState<Accessory[]>([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (firstProductId) {
            loadData(firstProductId);
        } else {
            setDrivers([]);
            setAccessories([]);
        }
    }, [firstProductId]);

    const loadData = async (productId: number) => {
        setLoading(true);
        try {
            const [dRes, aRes] = await Promise.all([
                configService.getCompatibleDriversByProduct(productId),
                configService.getCompatibleAccessoriesByProduct(productId)
            ]);
            setDrivers(Array.isArray(dRes) ? dRes : []);
            setAccessories(Array.isArray(aRes) ? aRes : []);
        } catch (err) {
            console.error("Failed to load compatible components", err);
        } finally {
            setLoading(false);
        }
    };

    const getDriverQty = (id: number) => {
        const item = selectedDrivers.find(d => d.driver_id === id || d.id === id);
        return item ? item.quantity : 0;
    };

    const getAccessoryQty = (id: number) => {
        const item = selectedAccessories.find(a => a.accessory_id === id || a.id === id);
        return item ? item.quantity : 0;
    };

    // State for input fields for driver and accessory quantities
    const [driverQtyInputs, setDriverQtyInputs] = useState<{ [id: number]: number }>({});
    const [accessoryQtyInputs, setAccessoryQtyInputs] = useState<{ [id: number]: number }>({});

    return (
        <aside style={styles.panel}>
            {/* Drivers Section */}
            <div style={styles.sectionTop}>
                <header style={styles.sectionHeader}>
                    Drivers ({drivers.length})
                </header>
                <div style={styles.scrollArea}>
                    {!firstProductId ? (
                        <div style={styles.emptyMsg}>Select products to view compatible drivers</div>
                    ) : loading ? (
                        <div style={styles.emptyMsg}>Loading drivers...</div>
                    ) : drivers.length === 0 ? (
                        <div style={styles.emptyMsg}>No compatible drivers found.</div>
                    ) : (
                        drivers.map(d => {
                            const id = d.driver_id || (d as any).id;
                            const qty = getDriverQty(id);
                            const inputQty = driverQtyInputs[id] !== undefined ? driverQtyInputs[id] : (qty || 1);
                            return (
                                <div key={`d-${id}`} style={{ ...styles.row, backgroundColor: qty > 0 ? erpColors.activeRow : 'transparent' }}>
                                    <div style={styles.itemName} title={d.driver_code}>
                                        {(d as any).driver_make || d.make} {d.driver_code}
                                    </div>
                                    <div style={styles.controls}>
                                        <button style={styles.qtyBtn} onClick={() => setDriverQtyInputs(inputs => ({ ...inputs, [id]: Math.max(1, inputQty - 1) }))}>-</button>
                                        <input
                                            type="number"
                                            min={1}
                                            value={inputQty}
                                            onChange={e => setDriverQtyInputs(inputs => ({ ...inputs, [id]: Math.max(1, parseInt(e.target.value) || 1) }))}
                                            style={{ width: 50, margin: '0 8px', padding: 2, borderRadius: 4, border: '1px solid #d1d5db', fontSize: 12 }}
                                        />
                                        <button style={styles.qtyBtn} onClick={() => setDriverQtyInputs(inputs => ({ ...inputs, [id]: inputQty + 1 }))}>+</button>
                                        <button
                                            style={styles.addBtn}
                                            onClick={() => onAddDriver(d, inputQty)}
                                        >
                                            Add
                                        </button>
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>
            </div>

            {/* Accessories Section */}
            <div style={styles.sectionBottom}>
                <header style={styles.sectionHeader}>
                    Accessories ({accessories.length})
                </header>
                <div style={styles.scrollArea}>
                    {!firstProductId ? (
                        <div style={styles.emptyMsg}>Select products to view compatible accessories</div>
                    ) : loading ? (
                        <div style={styles.emptyMsg}>Loading accessories...</div>
                    ) : accessories.length === 0 ? (
                        <div style={styles.emptyMsg}>No compatible accessories found.</div>
                    ) : (
                        accessories.map(a => {
                            const id = a.accessory_id || (a as any).id;
                            const qty = getAccessoryQty(id);
                            const inputQty = accessoryQtyInputs[id] !== undefined ? accessoryQtyInputs[id] : (qty || 1);
                            return (
                                <div key={`a-${id}`} style={{ ...styles.row, backgroundColor: qty > 0 ? erpColors.activeRow : 'transparent' }}>
                                    <div style={styles.itemName} title={a.order_code}>
                                        {a.make} {a.accessory_type}
                                    </div>
                                    <div style={styles.controls}>
                                        <button style={styles.qtyBtn} onClick={() => setAccessoryQtyInputs(inputs => ({ ...inputs, [id]: Math.max(1, inputQty - 1) }))}>-</button>
                                        <input
                                            type="number"
                                            min={1}
                                            value={inputQty}
                                            onChange={e => setAccessoryQtyInputs(inputs => ({ ...inputs, [id]: Math.max(1, parseInt(e.target.value) || 1) }))}
                                            style={{ width: 50, margin: '0 8px', padding: 2, borderRadius: 4, border: '1px solid #d1d5db', fontSize: 12 }}
                                        />
                                        <button style={styles.qtyBtn} onClick={() => setAccessoryQtyInputs(inputs => ({ ...inputs, [id]: inputQty + 1 }))}>+</button>
                                        <button
                                            style={styles.addBtn}
                                            onClick={() => onAddAccessory(a, inputQty)}
                                        >
                                            Add
                                        </button>
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>
            </div>
        </aside>
    );
};

const styles = {
    panel: {
        width: '340px',
        height: '100%',
        backgroundColor: erpColors.panelBg,
        borderLeft: `1px solid ${erpColors.border}`,
        display: 'flex',
        flexDirection: 'column' as const,
        flexShrink: 0,
        overflow: 'hidden'
    },
    sectionTop: {
        height: '45%',
        display: 'flex',
        flexDirection: 'column' as const,
        borderBottom: `2px solid ${erpColors.border}`
    },
    sectionBottom: {
        height: '55%',
        display: 'flex',
        flexDirection: 'column' as const
    },
    sectionHeader: {
        height: '42px',
        backgroundColor: erpColors.sectionHeader,
        borderBottom: `1px solid ${erpColors.border}`,
        display: 'flex',
        alignItems: 'center',
        padding: '0 12px',
        fontSize: '14px',
        fontWeight: '700',
        color: erpColors.textPrimary,
        position: 'sticky' as const,
        top: 0,
        zIndex: 10
    },
    scrollArea: {
        flex: 1,
        overflowY: 'auto' as const,
        padding: '8px'
    },
    row: {
        height: '40px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 8px',
        borderRadius: '4px',
        marginBottom: '4px',
        border: `1px solid transparent`,
        transition: 'background-color 0.2s'
    },
    itemName: {
        fontSize: '13px',
        color: erpColors.textPrimary,
        whiteSpace: 'nowrap' as const,
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        maxWidth: '180px'
    },
    controls: {
        display: 'flex',
        alignItems: 'center'
    },
    addBtn: {
        backgroundColor: erpColors.accent,
        color: 'white',
        border: 'none',
        borderRadius: '4px',
        padding: '4px 12px',
        fontSize: '12px',
        fontWeight: '600',
        cursor: 'pointer'
    },
    qtyGroup: {
        display: 'flex',
        alignItems: 'center',
        backgroundColor: erpColors.qtyButton,
        borderRadius: '4px',
        padding: '2px'
    },
    qtyBtn: {
        width: '24px',
        height: '24px',
        border: 'none',
        background: 'transparent',
        fontSize: '16px',
        fontWeight: '700',
        cursor: 'pointer',
        color: erpColors.textPrimary,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
    },
    qtyVal: {
        width: '30px',
        textAlign: 'center' as const,
        fontSize: '13px',
        fontWeight: '700',
        color: erpColors.textPrimary
    },
    emptyMsg: {
        padding: '24px',
        textAlign: 'center' as const,
        fontSize: '13px',
        color: '#64748b',
        fontStyle: 'italic' as const
    }
};

export default RightPanel;
