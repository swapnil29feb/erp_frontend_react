
import React, { useState, useEffect } from 'react';

interface ProductFormModalProps {
    isOpen: boolean;
    mode: 'create' | 'edit';
    initialValues?: any;
    onClose: () => void;
    onSaved: (product: any) => Promise<void>;
}

const FileInput = ({ value, onChange, placeholder }: { value: any, onChange: (file: File | null) => void, placeholder: string }) => {
    const fileInputRef = React.useRef<HTMLInputElement>(null);

    // Determine what to show
    const displayValue = value instanceof File ? value.name : (typeof value === 'string' ? value : '');

    // Check if it is a URL (simple check)
    const isUrl = typeof value === 'string' && (value.startsWith('http') || value.startsWith('/'));

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            onChange(e.target.files[0]);
        }
    };

    return (
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            <div
                style={{
                    flex: 1,
                    padding: '8px 12px',
                    border: '1px solid #cbd5e1',
                    borderRadius: '6px',
                    backgroundColor: '#f8fafc',
                    color: displayValue ? '#334155' : '#94a3b8',
                    fontSize: '14px',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis'
                }}
            >
                {displayValue || placeholder}
            </div>
            <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                style={{ display: 'none' }}
                accept="image/*,.pdf"
            />
            <button
                type="button"
                className="btn-secondary"
                onClick={() => fileInputRef.current?.click()}
            >
                Start Upload
            </button>
            {value && (
                <button
                    type="button"
                    className="btn-secondary"
                    style={{ color: '#ef4444', borderColor: '#fecaca', background: '#fef2f2' }}
                    onClick={() => onChange(null)}
                >
                    Clear
                </button>
            )}
            {isUrl && (
                <a
                    href={value}
                    target="_blank"
                    rel="noreferrer"
                    className="btn-secondary"
                    style={{ display: 'flex', alignItems: 'center', textDecoration: 'none' }}
                >
                    View
                </a>
            )}
        </div>
    );
};

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
        luminaire_color_ral: '',
        characteristics: '',
        diameter_mm: '',
        length_mm: '',
        width_mm: '',
        height_mm: '',
        mounting_style: 'SURFACE',
        beam_angle_degree: '',
        ip_class: '',
        wattage: '',
        op_voltage: '',
        op_current: '',
        lumen_output: '',
        cct_kelvin: '',
        cri_cci: '',
        lumen_efficency: '',
        weight_kg: '',
        warranty_years: '',
        website_link: '',
        visual_image: '',
        illustrative_details: '',
        photometrics: '',
        base_price: '',
        driver_integration: 'INTEGRATED',
        cutout_diameter_mm: '',
        environment: 'INDOOR',
        control_ready: 'NONE',
        electrical_type: 'CC',
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
                    luminaire_color_ral: initialValues.luminaire_color_ral || '',
                    characteristics: initialValues.characteristics || '',
                    diameter_mm: initialValues.diameter_mm ?? '',
                    length_mm: initialValues.length_mm ?? '',
                    width_mm: initialValues.width_mm ?? '',
                    height_mm: initialValues.height_mm ?? '',
                    mounting_style: initialValues.mounting_style || 'SURFACE',
                    beam_angle_degree: initialValues.beam_angle_degree || initialValues.beam_angle || '',
                    ip_class: initialValues.ip_class ?? initialValues.ip_rating ?? '',
                    wattage: initialValues.wattage ?? '',
                    op_voltage: initialValues.op_voltage ?? initialValues.voltage ?? '',
                    op_current: initialValues.op_current ?? '',
                    lumen_output: initialValues.lumen_output ?? '',
                    cct_kelvin: initialValues.cct_kelvin ?? '',
                    cri_cci: initialValues.cri_cci ?? '',
                    lumen_efficency: initialValues.lumen_efficency ?? '',
                    weight_kg: initialValues.weight_kg ?? '',
                    warranty_years: initialValues.warranty_years ?? '',
                    website_link: initialValues.website_link || '',
                    visual_image: initialValues.visual_image || '',
                    illustrative_details: initialValues.illustrative_details || '',
                    photometrics: initialValues.photometrics || '',
                    base_price: initialValues.base_price ?? '',
                    driver_integration: initialValues.driver_integration || 'INTEGRATED',
                    cutout_diameter_mm: initialValues.cutout_diameter_mm ?? '',
                    environment: initialValues.environment || 'INDOOR',
                    control_ready: initialValues.control_ready || 'NONE',
                    electrical_type: initialValues.electrical_type || 'CC',
                    is_active: initialValues.is_active ?? true,
                });
            } else {
                setFormData({
                    make: '',
                    order_code: '',
                    description: '',
                    luminaire_color_ral: '',
                    characteristics: '',
                    diameter_mm: '',
                    length_mm: '',
                    width_mm: '',
                    height_mm: '',
                    mounting_style: 'SURFACE',
                    beam_angle_degree: '',
                    ip_class: '',
                    wattage: '',
                    op_voltage: '',
                    op_current: '',
                    lumen_output: '',
                    cct_kelvin: '',
                    cri_cci: '',
                    lumen_efficency: '',
                    weight_kg: '',
                    warranty_years: '',
                    website_link: '',
                    visual_image: '',
                    illustrative_details: '',
                    photometrics: '',
                    base_price: '',
                    driver_integration: 'INTEGRATED',
                    cutout_diameter_mm: '',
                    environment: 'INDOOR',
                    control_ready: 'NONE',
                    electrical_type: 'CC',
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
                                onChange={e => setFormData({ ...formData, beam_angle: e.target.value, beam_angle_degree: e.target.value })}
                                placeholder="e.g. 36 deg"
                            />
                        </div>

                        <div className="form-group">
                            <label>CCT (Kelvin)</label>
                            <input
                                type="number"
                                value={formData.cct_kelvin}
                                onChange={e => setFormData({ ...formData, cct_kelvin: e.target.value })}
                                placeholder="e.g. 3000"
                            />
                        </div>

                        <div className="form-group">
                            <label>CRI / CCI</label>
                            <input
                                type="number"
                                value={formData.cri_cci}
                                onChange={e => setFormData({ ...formData, cri_cci: e.target.value })}
                                placeholder="e.g. 80"
                            />
                        </div>

                        <div className="form-group">
                            <label>Lumen Efficiency</label>
                            <input
                                type="text"
                                value={formData.lumen_efficency}
                                onChange={e => setFormData({ ...formData, lumen_efficency: e.target.value })}
                                placeholder="e.g. 90 lm/W"
                            />
                        </div>

                        <div className="form-group">
                            <label>Weight (kg)</label>
                            <input
                                type="text"
                                value={formData.weight_kg}
                                onChange={e => setFormData({ ...formData, weight_kg: e.target.value })}
                                placeholder="e.g. 1.2"
                            />
                        </div>

                        <div className="form-group">
                            <label>Warranty (years)</label>
                            <input
                                type="number"
                                value={formData.warranty_years}
                                onChange={e => setFormData({ ...formData, warranty_years: e.target.value })}
                                placeholder="e.g. 3"
                            />
                        </div>

                        <div className="form-group">
                            <label>Base Price</label>
                            <input
                                type="text"
                                value={formData.base_price}
                                onChange={e => setFormData({ ...formData, base_price: e.target.value })}
                                placeholder="e.g. 261"
                            />
                        </div>

                        <div className="form-group">
                            <label>Driver Integration</label>
                            <select value={formData.driver_integration} onChange={e => setFormData({ ...formData, driver_integration: e.target.value })}>
                                <option value="INTEGRATED">INTEGRATED</option>
                                <option value="EXTERNAL">EXTERNAL</option>
                            </select>
                        </div>

                        <div className="form-group">
                            <label>Environment</label>
                            <select value={formData.environment} onChange={e => setFormData({ ...formData, environment: e.target.value })}>
                                <option value="INDOOR">INDOOR</option>
                                <option value="OUTDOOR">OUTDOOR</option>
                            </select>
                        </div>

                        <div className="form-group">
                            <label>Control Ready</label>
                            <select value={formData.control_ready} onChange={e => setFormData({ ...formData, control_ready: e.target.value })}>
                                <option value="NONE">NONE</option>
                                <option value="DALI">DALI</option>
                                <option value="0-10V">0-10V</option>
                            </select>
                        </div>

                        <div className="form-group">
                            <label>Electrical Type</label>
                            <select value={formData.electrical_type} onChange={e => setFormData({ ...formData, electrical_type: e.target.value })}>
                                <option value="CC">CC</option>
                                <option value="CV">CV</option>
                            </select>
                        </div>

                        <div className="form-group">
                            <label>Visual Image</label>
                            <FileInput
                                value={formData.visual_image}
                                onChange={(file) => setFormData({ ...formData, visual_image: file })}
                                placeholder="Select visual image"
                            />
                        </div>

                        <div className="form-group">
                            <label>Illustrative Details</label>
                            <FileInput
                                value={formData.illustrative_details}
                                onChange={(file) => setFormData({ ...formData, illustrative_details: file })}
                                placeholder="Select details image"
                            />
                        </div>

                        <div className="form-group">
                            <label>Photometrics</label>
                            <FileInput
                                value={formData.photometrics}
                                onChange={(file) => setFormData({ ...formData, photometrics: file })}
                                placeholder="Select photometrics file"
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
             .modal-backdrop {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;

    /* Dark overlay + blur */
    background: rgba(15, 23, 42, 0.45);
    backdrop-filter: blur(6px);
    -webkit-backdrop-filter: blur(6px); /* Safari support */

    display: flex;
    align-items: center;
    justify-content: center;

    z-index: 1000;
    opacity: 0;
    pointer-events: none;
    transition: opacity 0.3s ease;
}
                .modal-backdrop.open {
                    opacity: 1;
                    pointer-events: auto;
                }
                .modal-content {
                    background: white;
                    border-radius: 8px;
                    box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
                    max-height: 85vh;
                    overflow-y: auto;
                    transform: scale(0.95);
                    transition: transform 0.3s ease;
                }
                .modal-backdrop.open .modal-content {
                    transform: scale(1);
                }
                .modal-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    padding: 20px;
                    border-bottom: 1px solid #e5e7eb;
                }
                .modal-title {
                    margin: 0;
                    font-size: 18px;
                    font-weight: 600;
                    color: #111827;
                }
                .modal-close {
                    background: none;
                    border: none;
                    font-size: 20px;
                    cursor: pointer;
                    color: #6b7280;
                    padding: 0;
                    width: 32px;
                    height: 32px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    transition: color 0.2s;
                }
                .modal-close:hover {
                    color: #111827;
                }
                .modal-body {
                    padding: 24px;
                }
                .modal-footer {
                    display: flex;
                    justify-content: flex-end;
                    gap: 12px;
                    padding: 16px 20px;
                    border-top: 1px solid #e5e7eb;
                    background-color: #f9fafb;
                }
                .btn-secondary {
                    padding: 8px 16px;
                    border: 1px solid #d1d5db;
                    background-color: #f3f4f6;
                    color: #374151;
                    border-radius: 6px;
                    cursor: pointer;
                    font-weight: 500;
                    font-size: 14px;
                    transition: all 0.2s;
                }
                .btn-secondary:hover:not(:disabled) {
                    background-color: #e5e7eb;
                }
                .btn-secondary:disabled {
                    opacity: 0.6;
                    cursor: not-allowed;
                }
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
