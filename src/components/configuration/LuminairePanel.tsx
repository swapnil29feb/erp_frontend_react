
import React, { useState, useEffect } from 'react';
import type { Product } from '../../types/config';
import { configService } from '../../services/configService';

const formatPrice = (value?: number | string) => {
    const num = Number(value);
    if (isNaN(num)) return "0";
    return num.toLocaleString();
};

interface LuminairePanelProps {
    onAdd: (product: Product, quantity: number) => void;
}

const LuminairePanel: React.FC<LuminairePanelProps> = ({ onAdd }) => {
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [quantities, setQuantities] = useState<{ [key: number]: number }>({});

    useEffect(() => {
        loadProducts();
    }, []);

    const loadProducts = async () => {
        setLoading(true);
        try {
            const data = await configService.getProducts();
            setProducts(Array.isArray(data) ? data : []);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const filteredProducts = Array.isArray(products) ? products.filter(p => {
        const s = (searchTerm || "").toLowerCase();
        return (
            (p.make || "").toLowerCase().includes(s) ||
            (p.order_code || "").toLowerCase().includes(s) ||
            ((p as any).wattage?.toString() || "").includes(s) ||
            ((p as any).cct_kelvin?.toString() || "").includes(s) ||
            ((p as any).beam_angle_degree?.toString() || "").includes(s)
        );
    }) : [];

    const handleQtyChange = (id: number, val: number) => {
        setQuantities({ ...quantities, [id]: Math.max(1, val) });
    };

    return (
        <div style={panelStyles.panel}>
            {/* Fixed Header */}
            <div style={panelStyles.header}>Luminaires</div>

            {/* Fixed Search */}
            <div style={panelStyles.searchArea}>
                <input
                    type="text"
                    placeholder="Search Make, Code, Wattage, CCT..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    style={panelStyles.input}
                />
            </div>

            {/* Independent Scrollable List Area */}
            <div style={panelStyles.scrollList}>
                {loading ? (
                    <div style={panelStyles.msg}>Loading luminaires...</div>
                ) : products.length === 0 ? (
                    <div style={panelStyles.msg}>No luminaires available. Go to Masters → Products to add.</div>
                ) : (
                    <table style={panelStyles.table}>
                        <thead style={panelStyles.thead}>
                            <tr>
                                <th style={panelStyles.th}>Make</th>
                                <th style={panelStyles.th}>Code</th>
                                <th style={panelStyles.th}>W</th>
                                <th style={panelStyles.th}>Lm</th>
                                <th style={panelStyles.th}>CCT</th>
                                <th style={panelStyles.th}>Beam</th>
                                <th style={panelStyles.th}>Price</th>
                                <th style={panelStyles.th}>Qty</th>
                                <th style={panelStyles.th}>Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredProducts.map(p => (
                                <tr key={p.prod_id} style={panelStyles.row}>
                                    <td style={panelStyles.td}>{p.make || "-"}</td>
                                    <td style={{ ...panelStyles.td, fontSize: '10px' }} title={p.order_code}>
                                        {p.order_code ? (p.order_code.length > 8 ? p.order_code.substring(0, 8) + '..' : p.order_code) : "-"}
                                    </td>
                                    <td style={panelStyles.td}>{p.wattage ?? "-"}</td>
                                    <td style={panelStyles.td}>{(p as any).lumen_output ?? "-"}</td>
                                    <td style={panelStyles.td}>{(p as any).cct_kelvin ?? "-"}K</td>
                                    <td style={panelStyles.td}>{(p as any).beam_angle_degree ?? "-"}°</td>
                                    <td style={panelStyles.td}>₹{formatPrice(p.price || (p as any).base_price)}</td>
                                    <td style={panelStyles.td}>
                                        <input
                                            type="number"
                                            min="1"
                                            value={quantities[p.prod_id] || 1}
                                            onChange={(e) => handleQtyChange(p.prod_id, Number(e.target.value))}
                                            style={panelStyles.qtyInput}
                                        />
                                    </td>
                                    <td style={panelStyles.td}>
                                        <button
                                            onClick={() => onAdd(p, quantities[p.prod_id] || 1)}
                                            style={panelStyles.addBtn}
                                        >
                                            Add
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}

                {!loading && filteredProducts.length === 0 && products.length > 0 && (
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
        backgroundColor: '#2563eb',
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

export default LuminairePanel;
