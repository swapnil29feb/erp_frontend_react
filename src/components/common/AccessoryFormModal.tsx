
import React, { useState, useEffect } from "react";
import type { Accessory } from "../../services/accessoryService";

interface AccessoryFormModalProps {
    isOpen: boolean;
    mode: "create" | "edit";
    initialValues?: Partial<Accessory>;
    onClose: () => void;
    onSaved: (accessory: Partial<Accessory>) => Promise<void>;
}

const AccessoryFormModal: React.FC<AccessoryFormModalProps> = ({
    isOpen,
    mode,
    initialValues,
    onClose,
    onSaved,
}) => {
    const [formData, setFormData] = useState<Partial<Accessory>>({
        accessory_name: "",
        accessory_type: "",
        compatible_ip_class: "",
        accessory_category: "",
        base_price: 0,
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
                    accessory_name: initialValues.accessory_name || "",
                    accessory_type: initialValues.accessory_type || "",
                    compatible_ip_class: initialValues.compatible_ip_class || "",
                    accessory_category: initialValues.accessory_category || "",
                    base_price: initialValues.base_price || 0,
                    is_active: initialValues.is_active ?? true,
                });
            } else {
                setFormData({
                    accessory_name: "",
                    accessory_type: "",
                    compatible_ip_class: "",
                    accessory_category: "",
                    base_price: 0,
                    is_active: true,
                });
            }
            setErrors({});
            setApiError(null);
        }
    }, [isOpen, mode, initialValues]);

    const validate = () => {
        const newErrors: Record<string, string> = {};
        if (!formData.accessory_name?.trim()) newErrors.accessory_name = "Name is required";
        if (!formData.accessory_type?.trim()) newErrors.accessory_type = "Type is required";
        if (!formData.accessory_category?.trim()) newErrors.accessory_category = "Category is required";

        const price = Number(formData.base_price);
        if (isNaN(price) || price < 0) newErrors.base_price = "Cannot be negative";

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
            let msg = "Failed to save accessory.";
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
                        {mode === "create" ? "New Accessory" : "Edit Accessory"}
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
                        id="accessory-form"
                        onSubmit={handleSubmit}
                        style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}
                    >
                        <div className="form-group">
                            <label>Name *</label>
                            <input
                                type="text"
                                value={formData.accessory_name}
                                onChange={(e) =>
                                    setFormData({ ...formData, accessory_name: e.target.value })
                                }
                                className={errors.accessory_name ? "error" : ""}
                                placeholder="e.g. Mounting Bracket"
                            />
                            {errors.accessory_name && (
                                <span className="error-text">{errors.accessory_name}</span>
                            )}
                        </div>

                        <div className="form-group">
                            <label>Category *</label>
                          <select
    value={formData.accessory_category || ""}
    onChange={(e) =>
        setFormData({ ...formData, accessory_category: e.target.value })
    }
>
    <option value="">Select Category</option>
    <option value="MOUNTING">Mounting</option>
    <option value="OPTICAL">Optical</option>
    <option value="DECORATIVE">Decorative</option>
    <option value="INSTALLATION">Installation</option>
</select>
                            {errors.accessory_category && (
                                <span className="error-text">{errors.accessory_category}</span>
                            )}
                        </div>

                        <div className="form-group">
                            <label>Type *</label>
                            <input
                                type="text"
                                value={formData.accessory_type}
                                onChange={(e) =>
                                    setFormData({ ...formData, accessory_type: e.target.value })
                                }
                                className={errors.accessory_type ? "error" : ""}
                                placeholder="e.g. Connector, Clamp"
                            />
                            {errors.accessory_type && (
                                <span className="error-text">{errors.accessory_type}</span>
                            )}
                        </div>

                        <div className="form-group">
                            <label>Compatible IP Class</label>
                            <input
                                type="text"
                                value={formData.compatible_ip_class}
                                onChange={(e) =>
                                    setFormData({ ...formData, compatible_ip_class: e.target.value })
                                }
                                placeholder="e.g. IP65"
                            />
                        </div>

                        <div className="form-group">
                            <label>Base Price</label>
                            <input
                                type="number"
                                value={formData.base_price}
                                onChange={(e) =>
                                    setFormData({ ...formData, base_price: parseFloat(e.target.value) })
                                }
                                className={errors.base_price ? "error" : ""}
                                placeholder="0.00"
                            />
                            {errors.base_price && (
                                <span className="error-text">{errors.base_price}</span>
                            )}
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
                                Active Accessory
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
                        form="accessory-form"
                        className="btn-export"
                        style={{
                            background: "#2563eb",
                            color: "#fff",
                            border: "none",
                        }}
                        disabled={loading}
                    >
                        {loading ? "Saving..." : "Save Accessory"}
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
    background: rgba(15, 23, 42, 0.55);
    backdrop-filter: blur(3px);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 2000;
    opacity: 0;
    pointer-events: none;
    transition: opacity 0.25s ease;
}

.modal-backdrop.open {
    opacity: 1;
    pointer-events: auto;
}

.modal-content {
    background: #ffffff;
    border-radius: 12px;
    width: 600px;
    max-width: 95%;
    max-height: 90vh;
    overflow-y: auto;
    box-shadow:
        0 20px 25px -5px rgba(0,0,0,0.15),
        0 10px 10px -5px rgba(0,0,0,0.05);
    transform: scale(0.92) translateY(10px);
    transition: all 0.25s ease;
}

.modal-backdrop.open .modal-content {
    transform: scale(1) translateY(0);
}

.modal-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 18px 22px;
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
    width: 34px;
    height: 34px;
}

.modal-close:hover {
    color: #111827;
}

.modal-body {
    padding: 22px;
}

.modal-footer {
    display: flex;
    justify-content: flex-end;
    gap: 10px;
    padding: 14px 20px;
    border-top: 1px solid #e5e7eb;
    background: #f9fafb;
}

.form-modal { width: 600px; max-width: 95%; }

.form-group {
    display: flex;
    flex-direction: column;
    gap: 4px;
}

.form-group label {
    font-size: 12px;
    font-weight: 600;
    color: #64748b;
}

.form-group input, .form-group textarea, .form-group select {
    padding: 8px 12px;
    border: 1px solid #cbd5e1;
    border-radius: 6px;
    font-size: 14px;
    color: #1e293b;
    transition: all 0.2s;
}

.form-group input:focus,
.form-group textarea:focus,
.form-group select:focus {
    border-color: #2563eb;
    outline: none;
    box-shadow: 0 0 0 2px rgba(37,99,235,0.1);
}

.form-group input.error {
    border-color: #ef4444;
}

.error-text {
    font-size: 11px;
    color: #ef4444;
}

.btn-export:disabled {
    opacity: 0.7;
    cursor: not-allowed;
}
`}</style>

        </div>
    );
};

export default AccessoryFormModal;
