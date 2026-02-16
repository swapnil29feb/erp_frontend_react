
import React, { useState, useEffect } from 'react';
import type { Driver } from '../../types/config';
import { configService } from '../../services/configService';

const formatPrice = (value?: number | string) => {
    const num = Number(value);
    if (isNaN(num)) return "0";
    return num.toLocaleString();
};

interface DriverPanelProps {
    firstProductId: number | null;
    onAdd: (driver: Driver, quantity: number) => void;
}

const DriverPanel: React.FC<DriverPanelProps> = ({ firstProductId, onAdd }) => {
    const [drivers, setDrivers] = useState<Driver[]>([]);
    const [loading, setLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [quantities, setQuantities] = useState<{ [key: number]: number }>({});

    useEffect(() => {
        if (firstProductId) {
            loadDrivers();
        } else {
            setDrivers([]);
        }
    }, [firstProductId]);

    const loadDrivers = async () => {
        setLoading(true);
        try {
            const data = await configService.getCompatibleDriversByProduct(firstProductId!);
            setDrivers(Array.isArray(data) ? data : []);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const filteredDrivers = Array.isArray(drivers) ? drivers.filter(d => {
        const s = (searchTerm || "").toLowerCase();
        return (
            ((d as any).driver_make || d.make || "").toLowerCase().includes(s) ||
            (d.driver_code || "").toLowerCase().includes(s) ||
            ((d as any).output_current?.toString() || "").includes(s) ||
            (d.max_wattage?.toString() || "").includes(s)
        );
    }) : [];

    const handleQtyChange = (id: number, val: number) => {
        setQuantities({ ...quantities, [id]: Math.max(1, val) });
    };

    return (
        <div style={panelStyles.panel}>
            {/* Fixed Header */}
            <div style={panelStyles.header}>Drivers</div>

            {/* Fixed Search */}
            <div style={panelStyles.searchArea}>
                <input
                    type="text"
                    placeholder="Search Make, Code, Rating..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    style={panelStyles.input}
                />
            </div>

            {/* Independent Scrollable List Area */}
            <div style={panelStyles.scrollList}>
                {!firstProductId ? (
                    <div style={panelStyles.msg}>Select a luminaire to see compatible drivers</div>
                ) : loading ? (
                    <div style={panelStyles.msg}>Loading compatible drivers...</div>
                ) : drivers.length === 0 ? (
                    <div style={panelStyles.msg}>No compatible drivers found.</div>
                ) : (
                    <table style={panelStyles.table}>
                        <thead style={panelStyles.thead}>
                            <tr>
                                <th style={panelStyles.th}>Make</th>
                                <th style={panelStyles.th}>Code</th>
                                <th style={panelStyles.th}>Output</th>
                                <th style={panelStyles.th}>Watts</th>
                                <th style={panelStyles.th}>Price</th>
                                <th style={panelStyles.th}>Qty</th>
                                <th style={panelStyles.th}>Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredDrivers.map(d => {
                                const id = d.driver_id || (d as any).id;
                                return (
                                    <tr key={id} style={panelStyles.row}>
                                        <td style={panelStyles.td}>{(d as any).driver_make || d.make || "-"}</td>
                                        <td style={{ ...panelStyles.td, fontSize: '10px' }} title={d.driver_code}>
                                            {d.driver_code ? (d.driver_code.length > 8 ? d.driver_code.substring(0, 8) + '..' : d.driver_code) : "-"}
                                        </td>
                                        <td style={panelStyles.td}>{(d as any).output_current ?? "-"}mA</td>
                                        <td style={panelStyles.td}>{d.max_wattage ?? "-"}W</td>
                                        <td style={panelStyles.td}>₹{formatPrice(d.price || (d as any).base_price)}</td>
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
                                                onClick={() => onAdd(d, quantities[id] || 1)}
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

                {firstProductId && !loading && filteredDrivers.length === 0 && drivers.length > 0 && (
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
        backgroundColor: '#059669', // Professional green for drivers
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

export default DriverPanel;
