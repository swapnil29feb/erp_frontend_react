
import React, { useState, useEffect } from 'react';
import type { Accessory } from '../../types/config';
import { configService } from '../../services/configService';

interface AccessoryTabProps {
    configurationId: number | null;
    productId: number | null;
    onSuccess: () => void;
}

const AccessoryTab: React.FC<AccessoryTabProps> = ({ configurationId, productId, onSuccess }) => {
    const [accessories, setAccessories] = useState<Accessory[]>([]);
    const [loading, setLoading] = useState(false);
    const [adding, setAdding] = useState<number | null>(null);

    useEffect(() => {
        if (configurationId) {
            loadAccessories();
        }
    }, [configurationId]);

    const loadAccessories = async () => {
        setLoading(true);
        try {
            const data = await configService.getCompatibleAccessories(configurationId!);
            setAccessories(data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleAddAccessory = async (accessoryId: number) => {
        if (!configurationId) return;
        setAdding(accessoryId);
        try {
            await configService.attachAccessory({
                configuration: configurationId,
                accessory: accessoryId,
                quantity: 1
            });
            onSuccess();
            alert("Accessory added successfully!");
        } catch (err) {
            alert("Failed to add accessory");
        } finally {
            setAdding(null);
        }
    };

    if (!productId) {
        return (
            <div className="table-container">
                <div className="table-empty">
                    <div style={{ fontSize: '32px', marginBottom: '12px' }}>🔒</div>
                    <p>Please add a luminaire first to see compatible accessories.</p>
                </div>
            </div>
        );
    }

    if (loading) {
        return (
            <div className="table-container">
                <div className="table-empty">
                    <div className="spinner" style={{ margin: '0 auto 16px' }}></div>
                    <p>Loading compatible accessories...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="table-container">
            <div className="table-toolbar">
                <div className="table-filters">
                    <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '700' }}>Compatible Accessories</h3>
                </div>
            </div>
            <table className="erp-table compact">
                <thead>
                    <tr>
                        <th>Name</th>
                        <th>Type</th>
                        <th>Category</th>
                        <th className="text-right">Price</th>
                        <th className="action-cell"></th>
                    </tr>
                </thead>
                <tbody>
                    {accessories.map(a => (
                        <tr key={a.accessory_id}>
                            <td style={{ fontWeight: '500' }}>{a.make}</td>
                            <td>{a.accessory_type}</td>
                            <td>{a.accessory_category}</td>
                            <td className="text-right">₹{a.price.toLocaleString()}</td>
                            <td className="action-cell">
                                <button
                                    onClick={() => handleAddAccessory(a.accessory_id)}
                                    disabled={adding !== null}
                                    className="primary-btn"
                                    style={{ height: '28px', fontSize: '12px', padding: '0 8px' }}
                                >
                                    {adding === a.accessory_id ? 'Adding...' : '+ Add'}
                                </button>
                            </td>
                        </tr>
                    ))}
                    {accessories.length === 0 && (
                        <tr>
                            <td colSpan={5} className="table-empty">No compatible accessories found</td>
                        </tr>
                    )}
                </tbody>
            </table>
            <div className="table-footer">
                <div>{accessories.length} compatible accessories found</div>
            </div>
        </div>
    );
};

export default AccessoryTab;
