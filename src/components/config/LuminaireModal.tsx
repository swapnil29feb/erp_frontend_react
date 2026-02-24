
import React, { useState, useEffect } from 'react';
import type { Product } from '../../types/config';
import { configService } from '../../services/configService';

interface LuminaireModalProps {
    areaId: number | null;
    subareaId: number | null;
    onClose: () => void;
    onSuccess: (configId: number, productId: number, productDetails: Product) => void;
}

const LuminaireModal: React.FC<LuminaireModalProps> = ({ areaId, subareaId, onClose, onSuccess }) => {
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [quantities, setQuantities] = useState<{ [key: number]: number }>({});
    const [adding, setAdding] = useState<number | null>(null);

    useEffect(() => {
        loadProducts();
    }, []);

    const loadProducts = async () => {
        try {
            const data = await configService.getProducts();
            setProducts(data);
            const initialQuantities: { [key: number]: number } = {};
            data.forEach((p: Product) => initialQuantities[p.prod_id] = 1);
            setQuantities(initialQuantities);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const filteredProducts = products.filter(p =>
        p.make.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.order_code.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleAdd = async (product: Product) => {
        setAdding(product.prod_id);
        try {
            const res = await configService.createConfiguration({
                area: areaId,
                subarea: subareaId,
                product: product.prod_id,
                quantity: quantities[product.prod_id] || 1
            });
            onSuccess(res.data.id, product.prod_id, product);
        } catch (err) {
            alert("Failed to add luminaire");
        } finally {
            setAdding(null);
        }
    };

    return (
        <div style={modalStyles.overlay}>
            <div style={modalStyles.modal}>
                <div style={modalStyles.header}>
                    <h3 style={modalStyles.title}>Select Luminaire</h3>
                    <button onClick={onClose} style={modalStyles.closeBtn}>×</button>
                </div>

                <div style={modalStyles.searchContainer}>
                    <input
                        type="text"
                        placeholder="Search by make or order code..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        style={modalStyles.searchInput}
                    />
                </div>

                <div style={modalStyles.tableContainer}>
                    {loading ? (
                        <div style={{ padding: '40px', textAlign: 'center' }}>Loading products...</div>
                    ) : (
                        <table className="erp-table">
                            <thead>
                                <tr>
                                    <th>Make</th>
                                    <th>Order Code</th>
                                    <th>Mounting</th>
                                    <th>Wattage</th>
                                    <th>Lumen</th>
                                    <th>Price</th>
                                    <th>Qty</th>
                                    <th>Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredProducts.map(p => (
                                    <tr key={p.prod_id}>
                                        <td>{p.make}</td>
                                        <td>{p.order_code}</td>
                                        <td>{p.mounting_style}</td>
                                        <td>{p.wattage}W</td>
                                        <td>{p.lumen_output}</td>
                                        <td>₹{p.price.toLocaleString()}</td>
                                        <td>
                                            <input
                                                type="number"
                                                min="1"
                                                value={quantities[p.prod_id] || 1}
                                                readOnly={true}
                                                // onChange={(e) => setQuantities({ ...quantities, [p.prod_id]: Number(e.target.value) })}
                                                style={{ width: '50px', padding: '4px', border: '1px solid #ddd' }}
                                            />
                                        </td>
                                        {/* <td>
                                            <button
                                                onClick={() => handleAdd(p)}
                                                disabled={adding !== null}
                                                className="btn-add"
                                            >
                                                {adding === p.prod_id ? '...' : 'Add'}
                                            </button>
                                        </td> */}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>
        </div>
    );
};

const modalStyles = {
    overlay: {
        position: 'fixed' as const,
        inset: 0,
        backgroundColor: 'rgba(0,0,0,0.6)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 2000,
        backdropFilter: 'blur(4px)',
    },
    modal: {
        backgroundColor: 'white',
        borderRadius: '12px',
        width: '1000px',
        maxWidth: '95vw',
        maxHeight: '90vh',
        display: 'flex',
        flexDirection: 'column' as const,
        boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
    },
    header: {
        padding: '20px 24px',
        borderBottom: '1px solid #f3f4f6',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    title: {
        fontSize: '18px',
        fontWeight: '700',
        color: '#111827',
        margin: 0,
    },
    closeBtn: {
        background: 'none',
        border: 'none',
        fontSize: '24px',
        color: '#9ca3af',
        cursor: 'pointer',
    },
    searchContainer: {
        padding: '16px 24px',
        borderBottom: '1px solid #f3f4f6',
    },
    searchInput: {
        width: '100%',
        padding: '12px 16px',
        borderRadius: '8px',
        border: '1px solid #d1d5db',
        fontSize: '14px',
        outline: 'none',
    },
    tableContainer: {
        flex: 1,
        overflowY: 'auto' as const,
        padding: '0 24px 24px 24px',
    }
};

export default LuminaireModal;
