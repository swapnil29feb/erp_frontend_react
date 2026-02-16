
import React, { useState, useEffect } from 'react';
import type { Accessory } from '../../types/config';
import { configService } from '../../services/configService';

const formatPrice = (value?: number | string) => {
    const num = Number(value);
    if (isNaN(num)) return "0";
    return num.toLocaleString();
};

interface AccessoryPanelProps {
    firstProductId: number | null;
    onAdd: (accessory: Accessory, quantity: number) => void;
}

const AccessoryPanel: React.FC<AccessoryPanelProps> = ({ firstProductId, onAdd }) => {
    const [accessories, setAccessories] = useState<Accessory[]>([]);
    const [loading, setLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [quantities, setQuantities] = useState<{ [key: number]: number }>({});

    useEffect(() => {
        if (firstProductId) {
            loadAccessories();
        } else {
            setAccessories([]);
        }
    }, [firstProductId]);

    const loadAccessories = async () => {
        setLoading(true);
        try {
            const data = await configService.getCompatibleAccessoriesByProduct(firstProductId!);
            setAccessories(Array.isArray(data) ? data : []);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const filteredAccessories = Array.isArray(accessories) ? accessories.filter(a => {
        const s = (searchTerm || "").toLowerCase();
        return (
            (a.make || "").toLowerCase().includes(s) ||
            (a.order_code || "").toLowerCase().includes(s) ||
            (a.accessory_type || "").toLowerCase().includes(s) ||
            ((a as any).description || "").toLowerCase().includes(s)
        );
    }) : [];

    const handleQtyChange = (id: number, val: number) => {
        setQuantities({ ...quantities, [id]: Math.max(1, val) });
    };

    return (
        <div style={panelStyles.panel}>
            {/* Fixed Header */}
            <div style={panelStyles.header}>Accessories</div>

            {/* Fixed Search */}
            <div style={panelStyles.searchArea}>
                <input
                    type="text"
                    placeholder="Search Name, Type, Description..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    style={panelStyles.input}
                />
            </div>

            {/* Independent Scrollable List Area */}
            <div style={panelStyles.scrollList}>
                {!firstProductId ? (
                    <div style={panelStyles.msg}>Select a luminaire to see compatible accessories</div>
                ) : loading ? (
                    <div style={panelStyles.msg}>Loading compatible accessories...</div>
                ) : accessories.length === 0 ? (
                    <div style={panelStyles.msg}>No compatible accessories found.</div>
                ) : (
                    <table style={panelStyles.table}>
                        <thead style={panelStyles.thead}>
                            <tr>
                                <th style={panelStyles.th}>Name</th>
                                <th style={panelStyles.th}>Type</th>
                                <th style={panelStyles.th}>Description</th>
                                <th style={panelStyles.th}>Price</th>
                                <th style={panelStyles.th}>Qty</th>
                                <th style={panelStyles.th}>Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredAccessories.map(a => {
                                const id = a.accessory_id || (a as any).id;
                                return (
                                    <tr key={id} style={panelStyles.row}>
                                        <td style={panelStyles.td}>{a.make || "-"}</td>
                                        <td style={panelStyles.td}>{a.accessory_type || "-"}</td>
                                        <td style={{ ...panelStyles.td, fontSize: '10px', color: '#64748b' }} title={(a as any).description}>
                                            {(a as any).description ? ((a as any).description.length > 20 ? (a as any).description.substring(0, 20) + '..' : (a as any).description) : "-"}
                                        </td>
                                        <td style={panelStyles.td}>₹{formatPrice(a.price || (a as any).base_price)}</td>
                                        <td style={panelStyles.td}>
                                            <input
                                                type="number"
                                                min="1"
                                                value={quantities[id] || 1}
                                                onChange={(e) => handleQtyChange(id, Number(e.target.value))}
                                                style={panelStyles.qtyInput}
                                            />
                                        </td>
                                        <td style={panelStyles.td}>
                                            <button
                                                onClick={() => onAdd(a, quantities[id] || 1)}
                                                style={panelStyles.addBtn}
                                            >
                                                Add
                                            </button>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                )}

                {firstProductId && !loading && filteredAccessories.length === 0 && accessories.length > 0 && (
                    <div style={panelStyles.msg}>No results match search.</div>
                )}
            </div>
        </div>
    );
};

const panelStyles = {
    panel: {
        display: 'flex',
        flexDirection: 'column' as const,
        height: '100%',
        backgroundColor: 'white',
        minHeight: 0 // Required for scroll to work inside flex
    },
    header: {
        padding: '16px 20px',
        fontSize: '15px',
        fontWeight: '700',
        color: '#334155',
        backgroundColor: '#f8fafc',
        borderBottom: '1px solid #e2e8f0'
    },
    searchArea: {
        padding: '12px 20px',
        borderBottom: '1px solid #f1f5f9'
    },
    input: {
        width: '100%',
        padding: '8px 12px',
        border: '1px solid #e2e8f0',
        borderRadius: '6px',
        fontSize: '13px',
        outline: 'none',
        backgroundColor: '#fcfcfc'
    },
    scrollList: {
        flex: 1,
        overflowY: 'auto' as const,
        minHeight: 0 // CRITICAL
    },
    table: {
        width: '100%',
        borderCollapse: 'collapse' as const,
        fontSize: '12px'
    },
    thead: {
        position: 'sticky' as const,
        top: 0,
        backgroundColor: '#fff',
        boxShadow: 'inset 0 -1px 0 #e2e8f0',
        zIndex: 5
    },
    th: {
        textAlign: 'left' as const,
        padding: '12px 8px',
        color: '#64748b',
        fontWeight: '600',
        fontSize: '11px',
        textTransform: 'uppercase' as const
    },
    row: {
        borderBottom: '1px solid #f1f5f9'
    },
    td: {
        padding: '10px 8px',
        color: '#334155'
    },
    qtyInput: {
        width: '50px',
        height: '32px',
        border: '1px solid #cbd5e1',
        borderRadius: '4px',
        textAlign: 'center' as const,
        fontSize: '12px'
    },
    addBtn: {
        height: '32px',
        padding: '0 12px',
        backgroundColor: '#7c3aed', // Purple for accessories
        color: 'white',
        border: 'none',
        borderRadius: '4px',
        fontSize: '12px',
        fontWeight: '600',
        cursor: 'pointer'
    },
    msg: {
        padding: '32px',
        textAlign: 'center' as const,
        color: '#94a3b8',
        fontSize: '13px'
    }
};

export default AccessoryPanel;
