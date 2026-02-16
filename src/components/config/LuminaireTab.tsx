
import React from 'react';

interface LuminaireTabProps {
    configurations: any[];
    onAddClick: () => void;
}

const LuminaireTab: React.FC<LuminaireTabProps> = ({
    configurations,
    onAddClick,
}) => {

    const totalWattage = configurations.reduce((sum, row) => {
        const wattage = row.productData?.wattage || 0;
        return sum + (wattage * row.quantity);
    }, 0);

    const totalCost = configurations.reduce((sum, row) => {
        return sum + (row.subtotal || 0);
    }, 0);

    return (
        <div className="tab-container" style={{ animation: 'none' }}>
            <div className="table-toolbar">
                <div className="table-filters">
                    <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '700', color: 'var(--primary-text)' }}>Luminaires</h3>
                </div>
                <button
                    onClick={onAddClick}
                    className="primary-btn"
                >
                    + Start Configuration
                </button>
            </div>

            <div className="table-container" style={{ borderRadius: 0, borderTop: 'none', borderLeft: 'none', borderRight: 'none', marginBottom: 0 }}>
                {configurations.length === 0 ? (
                    <div className="table-empty">
                        <div style={{ fontSize: '48px', marginBottom: '16px' }}>💡</div>
                        <h3 style={{ fontSize: '16px', fontWeight: '600', color: 'var(--primary-text)', margin: '0 0 8px 0' }}>No configuration yet</h3>
                        <p style={{ color: 'var(--secondary-text)', fontSize: '14px', marginBottom: '20px' }}>Select a product from the library to start.</p>
                        <button
                            onClick={onAddClick}
                            className="primary-btn"
                        >
                            + Start Configuration
                        </button>
                    </div>
                ) : (
                    <>
                        <table className="erp-table compact">
                            <thead>
                                <tr>
                                    <th>Make</th>
                                    <th>Order Code</th>
                                    <th>Wattage</th>
                                    <th>Price</th>
                                    <th>Qty</th>
                                    <th className="text-right">Subtotal</th>
                                </tr>
                            </thead>
                            <tbody>
                                {configurations.map((row) => (
                                    <tr key={row.id}>
                                        <td>{row.productData?.make || "-"}</td>
                                        <td style={{ fontWeight: '500' }}>{row.productData?.order_code || "-"}</td>
                                        <td>{row.productData?.wattage || "-"}W</td>
                                        <td>₹{row.price.toLocaleString()}</td>
                                        <td>{row.quantity}</td>
                                        <td className="text-right">₹{row.subtotal.toLocaleString()}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        <div className="table-footer" style={{ borderTop: '1px solid var(--border-color)', background: 'var(--bg-light)' }}>
                            <div style={{ fontWeight: '600', color: 'var(--primary-text)' }}>
                                Total Luminaires: {configurations.reduce((sum, c) => sum + c.quantity, 0)} Units
                            </div>
                            <div className="text-right">
                                <span style={{ marginRight: '24px', color: 'var(--secondary-text)' }}>Total Power: <strong>{totalWattage}W</strong></span>
                                <span style={{ fontSize: '16px', fontWeight: '700', color: 'var(--primary-blue)' }}>₹{totalCost.toLocaleString()}</span>
                            </div>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

export default LuminaireTab;
