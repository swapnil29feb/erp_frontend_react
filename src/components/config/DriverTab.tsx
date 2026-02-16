
import React, { useState, useEffect } from 'react';
import type { Driver } from '../../types/config';
import { configService } from '../../services/configService';

interface DriverTabProps {
    configurationId: number | null;
    productId: number | null;
    onSuccess: () => void;
}

const DriverTab: React.FC<DriverTabProps> = ({ configurationId, productId, onSuccess }) => {
    const [drivers, setDrivers] = useState<Driver[]>([]);
    const [loading, setLoading] = useState(false);
    const [adding, setAdding] = useState<number | null>(null);

    useEffect(() => {
        if (configurationId) {
            loadDrivers();
        }
    }, [configurationId]);

    const loadDrivers = async () => {
        setLoading(true);
        try {
            const data = await configService.getCompatibleDrivers(configurationId!);
            setDrivers(data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleAddDriver = async (driverId: number) => {
        if (!configurationId) return;
        setAdding(driverId);
        try {
            await configService.attachDriver({
                configuration: configurationId,
                driver: driverId,
                quantity: 1
            });
            onSuccess();
            alert("Driver added successfully!");
        } catch (err) {
            alert("Failed to add driver");
        } finally {
            setAdding(null);
        }
    };

    if (!productId) {
        return (
            <div className="table-container">
                <div className="table-empty">
                    <div style={{ fontSize: '32px', marginBottom: '12px' }}>🔒</div>
                    <p>Please add a luminaire first to see compatible drivers.</p>
                </div>
            </div>
        );
    }

    if (loading) {
        return (
            <div className="table-container">
                <div className="table-empty">
                    <div className="spinner" style={{ margin: '0 auto 16px' }}></div>
                    <p>Loading compatible drivers...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="table-container">
            <div className="table-toolbar">
                <div className="table-filters">
                    <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '700' }}>Compatible Drivers</h3>
                </div>
            </div>
            <table className="erp-table compact">
                <thead>
                    <tr>
                        <th style={{ width: '180px' }}>Code</th>
                        <th>Make</th>
                        <th>Max Wattage</th>
                        <th>Protocol</th>
                        <th className="text-right">Price</th>
                        <th className="action-cell"></th>
                    </tr>
                </thead>
                <tbody>
                    {drivers.map(d => (
                        <tr key={d.driver_id}>
                            <td style={{ fontWeight: '500' }}>{d.driver_code}</td>
                            <td>{d.make}</td>
                            <td>{d.max_wattage}W</td>
                            <td>{d.dimming_protocol}</td>
                            <td className="text-right">₹{d.price.toLocaleString()}</td>
                            <td className="action-cell">
                                <button
                                    onClick={() => handleAddDriver(d.driver_id)}
                                    disabled={adding !== null}
                                    className="primary-btn"
                                    style={{ height: '28px', fontSize: '12px', padding: '0 8px' }}
                                >
                                    {adding === d.driver_id ? 'Adding...' : '+ Add'}
                                </button>
                            </td>
                        </tr>
                    ))}
                    {drivers.length === 0 && (
                        <tr>
                            <td colSpan={6} className="table-empty">No compatible drivers found</td>
                        </tr>
                    )}
                </tbody>
            </table>
            <div className="table-footer">
                <div>{drivers.length} compatible drivers found</div>
            </div>
        </div>
    );
};

export default DriverTab;
