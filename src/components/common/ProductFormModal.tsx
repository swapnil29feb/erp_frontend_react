
import React, { useState, useEffect } from 'react';

interface ProductFormModalProps {
    isOpen: boolean;
    mode: 'create' | 'edit';
    initialValues?: any;
    onClose: () => void;
    onSaved: (product: any) => Promise<void>;
}

const ProductFormModal: React.FC<ProductFormModalProps> = ({
    isOpen,
    mode,
    initialValues,
    onClose,
    onSaved,
}) => {
    const [formData, setFormData] = useState<any>({
        make: '',
        order_code: '',
        description: '',
        lumen_output: '',
        wattage: '',
        voltage: '',
        ip_rating: '',
        beam_angle: '',
        is_active: true,
    });

    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [apiError, setApiError] = useState<string | null>(null);

    useEffect(() => {
        if (isOpen) {
            if (mode === 'edit' && initialValues) {
                setFormData({
                    ...initialValues,
                    make: initialValues.make || '',
                    order_code: initialValues.order_code || '',
                    description: initialValues.description || '',
                    lumen_output: initialValues.lumen_output || '',
                    wattage: initialValues.wattage || '',
                    voltage: initialValues.voltage || '',
                    ip_rating: initialValues.ip_rating || '',
                    beam_angle: initialValues.beam_angle || '',
                    is_active: initialValues.is_active ?? true,
                });
            } else {
                setFormData({
                    make: '',
                    order_code: '',
                    description: '',
                    lumen_output: '',
                    wattage: '',
                    voltage: '',
                    ip_rating: '',
                    beam_angle: '',
                    is_active: true,
                });
            }
            setErrors({});
            setApiError(null);
        }
    }, [isOpen, mode, initialValues]);

    const validate = () => {
        const newErrors: Record<string, string> = {};
        if (!formData.make?.trim()) newErrors.make = 'Make is required';
        if (!formData.order_code?.trim()) newErrors.order_code = 'Order Code is required';

        const lumen = Number(formData.lumen_output);
        if (!formData.lumen_output || isNaN(lumen) || lumen <= 0)
            newErrors.lumen_output = 'Required (> 0)';

        const wattage = Number(formData.wattage);
        if (!formData.wattage || isNaN(wattage) || wattage <= 0)
            newErrors.wattage = 'Required (> 0)';

        if (!formData.voltage?.trim()) newErrors.voltage = 'Voltage is required';

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!validate()) return;

        setLoading(true);
        setApiError(null);

        try {
            await onSaved(formData);
            // Parent handles closing or resetting
        } catch (err: any) {
            console.error('Save error:', err);
            let msg = 'Failed to save product.';
            if (err.response?.data) {
                if (typeof err.response.data === 'object') {
                    const details = Object.entries(err.response.data)
                        .map(([k, v]) => `${k}: ${v}`).join(', ');
                    msg += ` ${details}`;
                } else {
                    msg = err.response.data.toString();
                }
            }
            setApiError(msg);
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className={`modal-backdrop ${isOpen ? 'open' : ''}`} onClick={onClose}>
            <div className="modal-content form-modal" onClick={e => e.stopPropagation()}>
                <div className="modal-header">
                    <h2 className="modal-title">{mode === 'create' ? 'New Product' : 'Edit Product'}</h2>
                    <button className="modal-close" onClick={onClose}>✕</button>
                </div>

                <div className="modal-body">
                    {apiError && (
                        <div style={{
                            background: '#fef2f2', color: '#b91c1c', padding: '12px',
                            borderRadius: '6px', marginBottom: '16px', fontSize: '13px',
                            border: '1px solid #fecaca'
                        }}>
                            {apiError}
                        </div>
                    )}

                    <form id="product-form" onSubmit={handleSubmit} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                        <div className="form-group">
                            <label>Make *</label>
                            <input
                                type="text"
                                value={formData.make}
                                onChange={e => setFormData({ ...formData, make: e.target.value })}
                                className={errors.make ? 'error' : ''}
                                placeholder="e.g. Philips"
                            />
                            {errors.make && <span className="error-text">{errors.make}</span>}
                        </div>

                        <div className="form-group">
                            <label>Order Code *</label>
                            <input
                                type="text"
                                value={formData.order_code}
                                onChange={e => setFormData({ ...formData, order_code: e.target.value })}
                                className={errors.order_code ? 'error' : ''}
                                placeholder="Unique Code"
                            />
                            {errors.order_code && <span className="error-text">{errors.order_code}</span>}
                        </div>

                        <div className="form-group" style={{ gridColumn: 'span 2' }}>
                            <label>Description</label>
                            <textarea
                                value={formData.description}
                                onChange={e => setFormData({ ...formData, description: e.target.value })}
                                rows={3}
                                placeholder="Product description..."
                            />
                        </div>

                        <div className="form-group">
                            <label>Lumen Output *</label>
                            <input
                                type="number"
                                value={formData.lumen_output}
                                onChange={e => setFormData({ ...formData, lumen_output: e.target.value })}
                                className={errors.lumen_output ? 'error' : ''}
                                placeholder="e.g. 1000"
                            />
                            {errors.lumen_output && <span className="error-text">{errors.lumen_output}</span>}
                        </div>

                        <div className="form-group">
                            <label>Wattage (W) *</label>
                            <input
                                type="number"
                                value={formData.wattage}
                                onChange={e => setFormData({ ...formData, wattage: e.target.value })}
                                className={errors.wattage ? 'error' : ''}
                                placeholder="e.g. 15"
                            />
                            {errors.wattage && <span className="error-text">{errors.wattage}</span>}
                        </div>

                        <div className="form-group">
                            <label>Voltage *</label>
                            <input
                                type="text"
                                value={formData.voltage}
                                onChange={e => setFormData({ ...formData, voltage: e.target.value })}
                                className={errors.voltage ? 'error' : ''}
                                placeholder="e.g. 220-240V"
                            />
                            {errors.voltage && <span className="error-text">{errors.voltage}</span>}
                        </div>

                        <div className="form-group">
                            <label>IP Rating</label>
                            <input
                                type="text"
                                value={formData.ip_rating}
                                onChange={e => setFormData({ ...formData, ip_rating: e.target.value })}
                                placeholder="e.g. 65"
                            />
                        </div>

                        <div className="form-group">
                            <label>Beam Angle</label>
                            <input
                                type="text"
                                value={formData.beam_angle}
                                onChange={e => setFormData({ ...formData, beam_angle: e.target.value })}
                                placeholder="e.g. 36 deg"
                            />
                        </div>

                        <div className="form-group" style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: '8px', paddingTop: '24px' }}>
                            <input
                                type="checkbox"
                                checked={formData.is_active}
                                onChange={e => setFormData({ ...formData, is_active: e.target.checked })}
                                style={{ width: 'auto' }}
                            />
                            <label style={{ margin: 0, cursor: 'pointer' }} onClick={() => setFormData({ ...formData, is_active: !formData.is_active })}>Active Product</label>
                        </div>
                    </form>
                </div>

                <div className="modal-footer">
                    <button className="btn-secondary" onClick={onClose} disabled={loading}>Cancel</button>
                    <button type="submit" form="product-form" className="btn-export" style={{ background: '#2563eb', color: '#fff', border: 'none' }} disabled={loading}>
                        {loading ? 'Saving...' : 'Save Product'}
                    </button>
                </div>
            </div>
            <style>{`
                .form-modal { width: 600px; max-width: 95%; }
                .form-group { display: flex; flex-direction: column; gap: 4px; }
                .form-group label { font-size: 12px; font-weight: 600; color: #64748b; }
                .form-group input, .form-group textarea {
                    padding: 8px 12px; border: 1px solid #cbd5e1; border-radius: 6px;
                    font-size: 14px; color: #1e293b; transition: all 0.2s;
                }
                .form-group input:focus, .form-group textarea:focus {
                    border-color: #2563eb; outline: none; box-shadow: 0 0 0 2px rgba(37,99,235,0.1);
                }
                .form-group input.error { border-color: #ef4444; }
                .error-text { font-size: 11px; color: #ef4444; }
                .btn-export:disabled { opacity: 0.7; cursor: not-allowed; }
            `}</style>
        </div>
    );
};

export default ProductFormModal;
