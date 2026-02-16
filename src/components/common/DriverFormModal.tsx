
import React, { useState, useEffect } from "react";
import type { Driver } from "../../services/driverService";

interface DriverFormModalProps {
    isOpen: boolean;
    mode: "create" | "edit";
    initialValues?: Partial<Driver>;
    onClose: () => void;
    onSaved: (driver: Partial<Driver>) => Promise<void>;
}

const DriverFormModal: React.FC<DriverFormModalProps> = ({
    isOpen,
    mode,
    initialValues,
    onClose,
    onSaved,
}) => {
    const [formData, setFormData] = useState<Partial<Driver>>({
        driver_make: "",
        driver_code: "",
        max_wattage: 0,
        ip_class: "",
        protocol: "",
        is_active: true,
    });

    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [apiError, setApiError] = useState<string | null>(null);

    useEffect(() => {
        if (isOpen) {
            if (mode === "edit" && initialValues) {
                setFormData({
                    ...initialValues,
                    driver_make: initialValues.driver_make || "",
                    driver_code: initialValues.driver_code || "",
                    max_wattage: initialValues.max_wattage || 0,
                    ip_class: initialValues.ip_class || "",
                    protocol: initialValues.protocol || "",
                    is_active: initialValues.is_active ?? true,
                });
            } else {
                setFormData({
                    driver_make: "",
                    driver_code: "",
                    max_wattage: 0,
                    ip_class: "",
                    protocol: "",
                    is_active: true,
                });
            }
            setErrors({});
            setApiError(null);
        }
    }, [isOpen, mode, initialValues]);

    const validate = () => {
        const newErrors: Record<string, string> = {};
        if (!formData.driver_make?.trim()) newErrors.driver_make = "Make is required";
        if (!formData.driver_code?.trim()) newErrors.driver_code = "Code is required";

        const wattage = Number(formData.max_wattage);
        if (isNaN(wattage) || wattage <= 0)
            newErrors.max_wattage = "Required (> 0)";

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
        } catch (err: any) {
            console.error("Save error:", err);
            let msg = "Failed to save driver.";
            if (err.response?.data) {
                if (typeof err.response.data === "object") {
                    const details = Object.entries(err.response.data)
                        .map(([k, v]) => `${k}: ${v}`)
                        .join(", ");
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
        <div className={`modal-backdrop ${isOpen ? "open" : ""}`} onClick={onClose}>
            <div className="modal-content form-modal" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                    <h2 className="modal-title">
                        {mode === "create" ? "New Driver" : "Edit Driver"}
                    </h2>
                    <button className="modal-close" onClick={onClose}>
                        ✕
                    </button>
                </div>

                <div className="modal-body">
                    {apiError && (
                        <div
                            style={{
                                background: "#fef2f2",
                                color: "#b91c1c",
                                padding: "12px",
                                borderRadius: "6px",
                                marginBottom: "16px",
                                fontSize: "13px",
                                border: "1px solid #fecaca",
                            }}
                        >
                            {apiError}
                        </div>
                    )}

                    <form
                        id="driver-form"
                        onSubmit={handleSubmit}
                        style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}
                    >
                        <div className="form-group">
                            <label>Make *</label>
                            <input
                                type="text"
                                value={formData.driver_make}
                                onChange={(e) =>
                                    setFormData({ ...formData, driver_make: e.target.value })
                                }
                                className={errors.driver_make ? "error" : ""}
                                placeholder="e.g. Meanwell"
                            />
                            {errors.driver_make && (
                                <span className="error-text">{errors.driver_make}</span>
                            )}
                        </div>

                        <div className="form-group">
                            <label>Driver Code *</label>
                            <input
                                type="text"
                                value={formData.driver_code}
                                onChange={(e) =>
                                    setFormData({ ...formData, driver_code: e.target.value })
                                }
                                className={errors.driver_code ? "error" : ""}
                                placeholder="Unique Code"
                            />
                            {errors.driver_code && (
                                <span className="error-text">{errors.driver_code}</span>
                            )}
                        </div>

                        <div className="form-group">
                            <label>Max Wattage (W) *</label>
                            <input
                                type="number"
                                value={formData.max_wattage}
                                onChange={(e) =>
                                    setFormData({ ...formData, max_wattage: parseFloat(e.target.value) })
                                }
                                className={errors.max_wattage ? "error" : ""}
                                placeholder="e.g. 50"
                            />
                            {errors.max_wattage && (
                                <span className="error-text">{errors.max_wattage}</span>
                            )}
                        </div>

                        <div className="form-group">
                            <label>Protocol</label>
                            <input
                                type="text"
                                value={formData.protocol}
                                onChange={(e) =>
                                    setFormData({ ...formData, protocol: e.target.value })
                                }
                                placeholder="e.g. DALI, 0-10V"
                            />
                        </div>

                        <div className="form-group">
                            <label>IP Class</label>
                            <input
                                type="text"
                                value={formData.ip_class}
                                onChange={(e) =>
                                    setFormData({ ...formData, ip_class: e.target.value })
                                }
                                placeholder="e.g. IP67"
                            />
                        </div>

                        <div
                            className="form-group"
                            style={{
                                display: "flex",
                                flexDirection: "row",
                                alignItems: "center",
                                gap: "8px",
                                paddingTop: "24px",
                            }}
                        >
                            <input
                                type="checkbox"
                                checked={formData.is_active}
                                onChange={(e) =>
                                    setFormData({ ...formData, is_active: e.target.checked })
                                }
                                style={{ width: "auto" }}
                            />
                            <label
                                style={{ margin: 0, cursor: "pointer" }}
                                onClick={() =>
                                    setFormData({ ...formData, is_active: !formData.is_active })
                                }
                            >
                                Active Driver
                            </label>
                        </div>
                    </form>
                </div>

                <div className="modal-footer">
                    <button
                        className="btn-secondary"
                        onClick={onClose}
                        disabled={loading}
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        form="driver-form"
                        className="btn-export"
                        style={{
                            background: "#2563eb",
                            color: "#fff",
                            border: "none",
                        }}
                        disabled={loading}
                    >
                        {loading ? "Saving..." : "Save Driver"}
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

export default DriverFormModal;
