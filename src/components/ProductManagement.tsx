import React, { useState } from 'react';
import type { Area, Product, Driver, Accessory, MasterProduct, MasterDriver, MasterAccessory } from '../types';

interface ProductManagementProps {
    area: Area;
    selectedProduct: Product | null;
    onSelectProduct: (product: Product | null) => void;
    onAddProduct: (product: Omit<Product, 'id' | 'areaId' | 'drivers' | 'accessories'>) => Promise<void>;
    onAddDriver: (driver: Omit<Driver, 'id' | 'productId'>) => Promise<void>;
    onAddAccessory: (accessory: Omit<Accessory, 'id' | 'productId'>) => Promise<void>;
    masterProducts?: MasterProduct[];
    masterDrivers?: MasterDriver[];
    masterAccessories?: MasterAccessory[];
    isLocked?: boolean;
}

const ProductManagement: React.FC<ProductManagementProps> = ({
    area,
    selectedProduct,
    onSelectProduct,
    onAddProduct,
    onAddDriver,
    onAddAccessory,
    masterProducts = [],
    masterDrivers = [],
    masterAccessories = [],
    isLocked = false
}) => {
    const [showProductForm, setShowProductForm] = useState(false);
    const [showDriverForm, setShowDriverForm] = useState(false);
    const [showAccessoryForm, setShowAccessoryForm] = useState(false);
    const [viewingDetailItem, setViewingDetailItem] = useState<{ type: string, data: any } | null>(null);
    const [isAdding, setIsAdding] = useState(false);
    const [selectedLibraryItems, setSelectedLibraryItems] = useState<{ product: MasterProduct, qty: number }[]>([]);
    const [selectedLibraryDrivers, setSelectedLibraryDrivers] = useState<{ driver: MasterDriver, qty: number }[]>([]);
    const [selectedLibraryAccessories, setSelectedLibraryAccessories] = useState<{ accessory: MasterAccessory, qty: number }[]>([]);

    // Form States
    // Form States
    const [productForm, setProductForm] = useState<{
        name: string;
        category: string;
        specification: string;
        quantity: number;
        unit: string;
        masterProductId?: number;
    }>({
        name: '',
        category: '',
        specification: '',
        quantity: 1,
        unit: 'pcs',
        masterProductId: undefined
    });

    const [driverForm, setDriverForm] = useState<{
        name: string;
        model: string;
        wattage: string;
        voltage: string;
        quantity: number;
        masterDriverId?: number;
    }>({
        name: '',
        model: '',
        wattage: '',
        voltage: '',
        quantity: 1,
        masterDriverId: undefined
    });

    const [accessoryForm, setAccessoryForm] = useState<{
        name: string;
        type: string;
        specification: string;
        quantity: number;
        masterAccessoryId?: number;
    }>({
        name: '',
        type: '',
        specification: '',
        quantity: 1,
        masterAccessoryId: undefined
    });

    // Helper to find relevant master product
    const currentMasterProduct = selectedProduct?.masterProductId
        ? masterProducts.find(mp => (mp.id === selectedProduct.masterProductId) || ((mp as any).prod_id === selectedProduct.masterProductId))
        : undefined;

    // Resolve compatible drivers/accessories from IDs
    const currentCompatibleDrivers = currentMasterProduct
        ? masterDrivers.filter(d => currentMasterProduct.compatibleDrivers?.includes(d.id))
        : [];

    const currentCompatibleAccessories = currentMasterProduct
        ? masterAccessories.filter(a => currentMasterProduct.compatibleAccessories?.includes(a.id))
        : [];

    const [productLibrarySearch, setProductLibrarySearch] = useState('');
    const [driverLibrarySearch, setDriverLibrarySearch] = useState('');
    const [accessoryLibrarySearch, setAccessoryLibrarySearch] = useState('');

    // Filtered Library Items
    const filteredMasterProducts = masterProducts.filter(mp =>
        (mp.name || `${mp.make} ${mp.order_code}`).toLowerCase().includes(productLibrarySearch.toLowerCase()) ||
        mp.make.toLowerCase().includes(productLibrarySearch.toLowerCase()) ||
        mp.order_code.toLowerCase().includes(productLibrarySearch.toLowerCase())
    );

    const filteredMasterDrivers = masterDrivers.filter(md =>
        `${md.driver_make} ${md.driver_code}`.toLowerCase().includes(driverLibrarySearch.toLowerCase()) ||
        md.driver_make.toLowerCase().includes(driverLibrarySearch.toLowerCase()) ||
        md.driver_code.toLowerCase().includes(driverLibrarySearch.toLowerCase())
    );

    const filteredMasterAccessories = masterAccessories.filter(ma =>
        ma.accessory_name.toLowerCase().includes(accessoryLibrarySearch.toLowerCase()) ||
        ma.accessory_type.toLowerCase().includes(accessoryLibrarySearch.toLowerCase())
    );


    const handleProductSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!productForm.name || isAdding) return;

        if (!productForm.masterProductId) {
            alert('Please select a product from the Specification Library search results first.');
            return;
        }

        setIsAdding(true);
        console.log('💡 Submitting Product Form:', productForm);
        try {
            await onAddProduct({
                ...productForm,
                quantity: Number(productForm.quantity)
            });
            // Reset only if not keeping open (for now reset name but keep search)
            setProductForm({ ...productForm, name: '', masterProductId: undefined });
        } finally {
            setIsAdding(false);
        }
    };

    const handleQuickAddProduct = async (mp: MasterProduct, quantity: number = 1) => {
        if (isAdding) return;
        setIsAdding(true);
        try {
            await onAddProduct({
                name: mp.name || `${mp.make} ${mp.order_code}`,
                category: '',
                specification: mp.characteristics || '',
                quantity: quantity,
                unit: 'pcs',
                masterProductId: mp.id || (mp as any).prod_id
            });
            // Show a brief success toast-like behavior in the UI? 
            // For now, let's just finish.
        } finally {
            setIsAdding(false);
        }
    };

    const toggleLibrarySelection = (mp: MasterProduct) => {
        setSelectedLibraryItems(prev => {
            const mpId = mp.id || (mp as any).prod_id;
            const exists = prev.find(item => (item.product.id || (item.product as any).prod_id) === mpId);
            if (exists) {
                return prev.filter(item => (item.product.id || (item.product as any).prod_id) !== mpId);
            } else {
                return [...prev, { product: mp, qty: 1 }];
            }
        });
    };

    const updateSelectionQty = (id: number, qty: number) => {
        setSelectedLibraryItems(prev => prev.map(item =>
            (item.product.id === id || (item.product as any).prod_id === id) ? { ...item, qty: Math.max(1, qty) } : item
        ));
    };

    const handleAddSelectedProducts = async () => {
        if (isAdding || selectedLibraryItems.length === 0) return;
        setIsAdding(true);
        try {
            for (const item of selectedLibraryItems) {
                await onAddProduct({
                    name: item.product.name || `${item.product.make} ${item.product.order_code}`,
                    category: '',
                    specification: item.product.characteristics || '',
                    quantity: item.qty,
                    unit: 'pcs',
                    masterProductId: item.product.id || (item.product as any).prod_id
                });
            }
            setSelectedLibraryItems([]);
            setProductLibrarySearch('');
            setShowProductForm(false);
        } finally {
            setIsAdding(false);
        }
    };

    const handleDriverSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!driverForm.name || isAdding) return;

        if (!driverForm.masterDriverId) {
            alert('Please search and select a driver from the library first.');
            return;
        }

        setIsAdding(true);
        console.log('⚡ Submitting Driver Form:', driverForm);
        try {
            await onAddDriver({
                ...driverForm,
                quantity: Number(driverForm.quantity)
            });
            setDriverForm({ ...driverForm, name: '', masterDriverId: undefined });
        } finally {
            setIsAdding(false);
        }
    };


    const handleAccessorySubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!accessoryForm.name || isAdding) return;

        if (!accessoryForm.masterAccessoryId) {
            alert('Please search and select an accessory from the library first.');
            return;
        }

        setIsAdding(true);
        console.log('🔧 Submitting Accessory Form:', accessoryForm);
        try {
            await onAddAccessory({
                ...accessoryForm,
                quantity: Number(accessoryForm.quantity)
            });
            setAccessoryForm({ ...accessoryForm, name: '', masterAccessoryId: undefined });
        } finally {
            setIsAdding(false);
        }
    };

    const handleQuickAddDriver = async (md: MasterDriver, quantity: number = 1) => {
        if (isAdding) return;
        setIsAdding(true);
        try {
            await onAddDriver({
                name: `${md.driver_make} ${md.driver_code}`,
                model: md.driver_code,
                wattage: md.max_wattage?.toString() || '',
                voltage: md.input_voltage_range || '',
                quantity: quantity,
                masterDriverId: md.id || (md as any).driver_id
            });
        } finally {
            setIsAdding(false);
        }
    };

    const handleQuickAddAccessory = async (ma: MasterAccessory, quantity: number = 1) => {
        if (isAdding) return;
        setIsAdding(true);
        try {
            await onAddAccessory({
                name: ma.accessory_name,
                type: ma.accessory_type,
                specification: ma.description || '',
                quantity: quantity,
                masterAccessoryId: ma.id || (ma as any).accessory_id
            });
        } finally {
            setIsAdding(false);
        }
    };


    const toggleDriverSelection = (md: MasterDriver) => {
        const mdId = md.id || (md as any).driver_id;
        setSelectedLibraryDrivers(prev => {
            const exists = prev.find(item => (item.driver.id || (item.driver as any).driver_id) === mdId);
            if (exists) {
                return prev.filter(item => (item.driver.id || (item.driver as any).driver_id) !== mdId);
            } else {
                return [...prev, { driver: md, qty: 1 }];
            }
        });
    };

    const updateDriverSelectionQty = (id: number, qty: number) => {
        setSelectedLibraryDrivers(prev => prev.map(item =>
            (item.driver.id === id || (item.driver as any).driver_id === id) ? { ...item, qty: Math.max(1, qty) } : item
        ));
    };

    const handleAddSelectedDrivers = async () => {
        if (isAdding || selectedLibraryDrivers.length === 0) return;
        setIsAdding(true);
        try {
            for (const item of selectedLibraryDrivers) {
                await onAddDriver({
                    name: `${item.driver.driver_make} ${item.driver.driver_code}`,
                    model: item.driver.driver_code,
                    wattage: item.driver.max_wattage?.toString() || '',
                    voltage: item.driver.input_voltage_range || '',
                    quantity: item.qty,
                    masterDriverId: item.driver.id || (item.driver as any).driver_id
                });
            }
            setSelectedLibraryDrivers([]);
            setDriverLibrarySearch('');
            setShowDriverForm(false);
        } finally {
            setIsAdding(false);
        }
    };

    const toggleAccessorySelection = (ma: MasterAccessory) => {
        const maId = ma.id || (ma as any).accessory_id;
        setSelectedLibraryAccessories(prev => {
            const exists = prev.find(item => (item.accessory.id || (item.accessory as any).accessory_id) === maId);
            if (exists) {
                return prev.filter(item => (item.accessory.id || (item.accessory as any).accessory_id) !== maId);
            } else {
                return [...prev, { accessory: ma, qty: 1 }];
            }
        });
    };

    const updateAccessorySelectionQty = (id: number, qty: number) => {
        setSelectedLibraryAccessories(prev => prev.map(item =>
            (item.accessory.id === id || (item.accessory as any).accessory_id === id) ? { ...item, qty: Math.max(1, qty) } : item
        ));
    };

    const handleAddSelectedAccessories = async () => {
        if (isAdding || selectedLibraryAccessories.length === 0) return;
        setIsAdding(true);
        try {
            for (const item of selectedLibraryAccessories) {
                await onAddAccessory({
                    name: item.accessory.accessory_name,
                    type: item.accessory.accessory_type,
                    specification: item.accessory.description || '',
                    quantity: item.qty,
                    masterAccessoryId: item.accessory.id || (item.accessory as any).accessory_id
                });
            }
            setSelectedLibraryAccessories([]);
            setAccessoryLibrarySearch('');
            setShowAccessoryForm(false);
        } finally {
            setIsAdding(false);
        }
    };


    return (
        <div className="slide-in">
            {/* Product Section */}
            <div className="hierarchy-section product">
                <div className="section-header">
                    <div className="section-title">
                        <div className="section-icon product">💡</div>
                        <span>Product Management</span>
                        <div className="badge badge-success">{area.products?.length || 0} Products</div>
                    </div>
                    {!isLocked && (
                        <button
                            className="btn btn-primary btn-sm"
                            onClick={() => setShowProductForm(!showProductForm)}
                        >
                            {showProductForm ? 'Cancel' : '+ Add Product'}
                        </button>
                    )}
                </div>

                {/* Add Product Form */}
                {showProductForm && (
                    <div className="card fade-in" style={{ marginBottom: '20px' }}>
                        <div className="card-header">
                            <div className="card-title">Add Product to {area.name}</div>
                        </div>

                        <div style={{ padding: '20px' }}>
                            {productForm.masterProductId ? (
                                <div className="selected-item-card" style={{ background: 'var(--primary-light)', padding: '15px', borderRadius: '8px', marginBottom: '20px', border: '1px solid var(--primary-color)' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <div>
                                            <div style={{ fontWeight: '600', color: 'var(--primary-color)' }}>✅ Library Product Selected</div>
                                            <div style={{ fontSize: '14px' }}>{productForm.name}</div>
                                        </div>
                                        <button type="button" className="btn btn-secondary btn-sm" onClick={() => setProductForm({ ...productForm, masterProductId: undefined })}>Change</button>
                                    </div>
                                </div>
                            ) : (
                                <div className="form-group" style={{ background: 'var(--bg-tertiary)', padding: '24px', borderRadius: '16px', marginBottom: '24px', border: '1px solid var(--border-color)', boxShadow: 'var(--shadow-sm)' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                            <div style={{ fontSize: '24px' }}>📦</div>
                                            <div>
                                                <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '700' }}>Product Explorer</h3>
                                                <p style={{ margin: 0, fontSize: '13px', color: 'var(--text-secondary)' }}>Select one or multiple items to add</p>
                                            </div>
                                        </div>
                                        {selectedLibraryItems.length > 0 && (
                                            <div className="badge badge-success" style={{ padding: '8px 16px', fontSize: '14px' }}>
                                                {selectedLibraryItems.length} Selection{selectedLibraryItems.length > 1 ? 's' : ''} ready
                                            </div>
                                        )}
                                    </div>

                                    <div style={{ position: 'relative', marginBottom: '20px' }}>
                                        <input
                                            type="text"
                                            className="form-control"
                                            placeholder="Search by name, make, category or order code..."
                                            value={productLibrarySearch}
                                            onChange={(e) => setProductLibrarySearch(e.target.value)}
                                            style={{
                                                padding: '16px 16px 16px 48px',
                                                borderRadius: '100px',
                                                border: '2px solid var(--border-color)',
                                                fontSize: '15px'
                                            }}
                                        />
                                        <span style={{ position: 'absolute', left: '20px', top: '50%', transform: 'translateY(-50%)', fontSize: '20px', opacity: 0.5 }}>🔍</span>
                                    </div>

                                    {productLibrarySearch && (
                                        <div className="catalog-search-results" style={{
                                            display: 'grid',
                                            gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
                                            gap: '20px',
                                            maxHeight: '450px',
                                            overflowY: 'auto',
                                            padding: '4px',
                                            marginTop: '10px'
                                        }}>
                                            {filteredMasterProducts.length > 0 ? (
                                                filteredMasterProducts.map(mp => {
                                                    const mpId = mp.id || (mp as any).prod_id;
                                                    const isSelected = selectedLibraryItems.some(item => (item.product.id || (item.product as any).prod_id) === mpId);
                                                    return (
                                                        <div
                                                            key={mpId}
                                                            onClick={() => toggleLibrarySelection(mp)}
                                                            style={{
                                                                background: 'white',
                                                                border: isSelected ? '2px solid var(--primary)' : '1px solid var(--border-color)',
                                                                borderRadius: '16px',
                                                                overflow: 'hidden',
                                                                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                                                                cursor: 'pointer',
                                                                display: 'flex',
                                                                flexDirection: 'column',
                                                                position: 'relative',
                                                                boxShadow: isSelected ? 'var(--shadow-lg)' : 'var(--shadow-sm)',
                                                                transform: isSelected ? 'translateY(-4px)' : 'none'
                                                            }}
                                                        >
                                                            {isSelected && (
                                                                <div style={{
                                                                    position: 'absolute',
                                                                    top: '12px',
                                                                    right: '12px',
                                                                    background: 'var(--primary)',
                                                                    color: 'white',
                                                                    width: '28px',
                                                                    height: '28px',
                                                                    borderRadius: '50%',
                                                                    display: 'flex',
                                                                    alignItems: 'center',
                                                                    justifyContent: 'center',
                                                                    zIndex: 2,
                                                                    boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
                                                                }}>✓</div>
                                                            )}

                                                            <div style={{ height: '140px', background: '#f5f7fa', position: 'relative', overflow: 'hidden' }}>
                                                                {mp.visual_image ? (
                                                                    <img src={mp.visual_image} alt={mp.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                                                ) : (
                                                                    <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '48px', opacity: 0.2 }}>💡</div>
                                                                )}
                                                                <div style={{ position: 'absolute', bottom: '8px', left: '8px', background: 'rgba(0,0,0,0.6)', color: 'white', padding: '2px 8px', borderRadius: '4px', fontSize: '10px', fontWeight: 'bold' }}>
                                                                    {mp.wattage}W
                                                                </div>
                                                            </div>

                                                            <div style={{ padding: '16px', flex: 1 }}>
                                                                <div style={{ fontSize: '13px', fontWeight: '700', color: 'var(--text-primary)', marginBottom: '4px', lineHeight: '1.2' }}>
                                                                    {mp.name || `${mp.make} ${mp.order_code}`}
                                                                </div>
                                                                <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                                                                    {mp.make} • {mp.order_code}
                                                                </div>
                                                            </div>

                                                            <div style={{ padding: '12px 16px', borderTop: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                                <button
                                                                    className="btn btn-secondary btn-sm"
                                                                    onClick={(e) => {
                                                                        e.stopPropagation();
                                                                        handleQuickAddProduct(mp, 1);
                                                                    }}
                                                                    style={{ borderRadius: '8px' }}
                                                                >
                                                                    + Quick Add
                                                                </button>
                                                                <div style={{ fontSize: '12px', fontWeight: '800', color: 'var(--primary)' }}>REF: {mp.id || (mp as any).prod_id}</div>
                                                            </div>
                                                        </div>
                                                    );
                                                })
                                            ) : (
                                                <div style={{ gridColumn: '1 / -1', padding: '60px', textAlign: 'center' }}>
                                                    <div style={{ fontSize: '64px', marginBottom: '20px', opacity: 0.3 }}>🔍</div>
                                                    <div style={{ color: 'var(--text-secondary)', fontWeight: '500' }}>No matches found in library. Try a different search term.</div>
                                                </div>
                                            )}
                                        </div>
                                    )}

                                    {selectedLibraryItems.length > 0 && (
                                        <div className="selection-overlay" style={{
                                            marginTop: '24px',
                                            padding: '20px',
                                            background: 'white',
                                            borderRadius: '20px',
                                            border: '2px solid var(--primary)',
                                            boxShadow: 'var(--shadow-xl)',
                                            animation: 'fadeIn 0.3s ease-out'
                                        }}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                                                <h4 style={{ margin: 0, fontWeight: '700' }}>Confirm Selections ({selectedLibraryItems.length})</h4>
                                                <button className="btn btn-sm" style={{ color: 'var(--danger)', padding: 0 }} onClick={() => setSelectedLibraryItems([])}>Clear All</button>
                                            </div>

                                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', marginBottom: '20px' }}>
                                                {selectedLibraryItems.map(item => {
                                                    const itemId = item.product.id || (item.product as any).prod_id;
                                                    return (
                                                        <div key={itemId} style={{
                                                            background: 'var(--bg-tertiary)',
                                                            padding: '8px 12px',
                                                            borderRadius: '12px',
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            gap: '12px',
                                                            border: '1px solid var(--border-color)'
                                                        }}>
                                                            <div style={{ fontSize: '13px', fontWeight: '600' }}>{item.product.order_code}</div>
                                                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                                                <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Qty:</span>
                                                                <input
                                                                    type="number"
                                                                    value={item.qty}
                                                                    min="1"
                                                                    onChange={(e) => updateSelectionQty(itemId, parseInt(e.target.value))}
                                                                    style={{ width: '50px', border: '1px solid var(--border-color)', borderRadius: '6px', textAlign: 'center', padding: '2px' }}
                                                                />
                                                            </div>
                                                            <button onClick={() => toggleLibrarySelection(item.product)} style={{ border: 'none', background: 'none', cursor: 'pointer', fontSize: '16px', color: 'var(--text-muted)' }}>×</button>
                                                        </div>
                                                    );
                                                })}
                                            </div>

                                            <button
                                                className="btn btn-primary w-full"
                                                onClick={handleAddSelectedProducts}
                                                disabled={isAdding}
                                                style={{ padding: '16px', borderRadius: '12px', fontSize: '16px', fontWeight: '700' }}
                                            >
                                                {isAdding ? '🚀 Processing...' : `Add all ${selectedLibraryItems.length} items to Area`}
                                            </button>
                                        </div>
                                    )}
                                </div>
                            )}

                            <form onSubmit={handleProductSubmit}>
                                <div className="form-grid">
                                    <div className="form-group">
                                        <label className="form-label">Product Name *</label>
                                        <input
                                            type="text"
                                            className="form-control"
                                            placeholder="e.g., LED Panel Light 600x600"
                                            value={productForm.name}
                                            onChange={(e) => setProductForm({ ...productForm, name: e.target.value })}
                                            required
                                        />
                                    </div>

                                    <div className="form-group">
                                        <label className="form-label">Category</label>
                                        <select
                                            className="form-control"
                                            value={productForm.category}
                                            onChange={(e) => setProductForm({ ...productForm, category: e.target.value })}
                                        >
                                            <option value="">Select category</option>
                                            <option value="Panel Light">Panel Light</option>
                                            <option value="Downlight">Downlight</option>
                                            <option value="Track Light">Track Light</option>
                                            <option value="Linear Light">Linear Light</option>
                                            <option value="Pendant Light">Pendant Light</option>
                                            <option value="Wall Light">Wall Light</option>
                                            <option value="Outdoor Light">Outdoor Light</option>
                                        </select>
                                    </div>

                                    <div className="form-group">
                                        <label className="form-label">Quantity *</label>
                                        <input
                                            type="number"
                                            className="form-control"
                                            min="1"
                                            value={productForm.quantity}
                                            onChange={(e) => setProductForm({ ...productForm, quantity: parseInt(e.target.value) })}
                                            required
                                        />
                                    </div>

                                    <div className="form-group">
                                        <label className="form-label">Unit</label>
                                        <select
                                            className="form-control"
                                            value={productForm.unit}
                                            onChange={(e) => setProductForm({ ...productForm, unit: e.target.value })}
                                        >
                                            <option value="pcs">Pieces</option>
                                            <option value="set">Set</option>
                                            <option value="m">Meters</option>
                                            <option value="ft">Feet</option>
                                        </select>
                                    </div>
                                </div>

                                <div className="form-group">
                                    <label className="form-label">Specification Override (Optional)</label>
                                    <textarea
                                        className="form-control"
                                        placeholder="Enter product specifications"
                                        value={productForm.specification}
                                        onChange={(e) => setProductForm({ ...productForm, specification: e.target.value })}
                                    />
                                </div>

                                <div className="form-actions">
                                    <button type="button" className="btn btn-secondary" onClick={() => setShowProductForm(false)}>
                                        Cancel
                                    </button>
                                    <button type="submit" className="btn btn-success">
                                        Confirm & Add Product
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}

                {/* Product List */}
                {area.products && area.products.length > 0 ? (
                    <div className="item-list">
                        {area.products.map((product) => (
                            <div
                                key={product.id}
                                className={`item ${selectedProduct?.id === product.id ? 'selected' : ''}`}
                                onClick={() => {
                                    onSelectProduct(product);
                                }}
                            >
                                <div className="item-content">
                                    <div className="item-name">{product.name}</div>
                                    <div className="item-description">
                                        {product.category && `${product.category} • `}
                                        Qty: {product.quantity} {product.unit} •
                                        {product.drivers?.length || 0} Drivers •
                                        {product.accessories?.length || 0} Accessories
                                    </div>
                                </div>
                                <div className="item-actions">
                                    <button
                                        className="btn btn-secondary btn-sm"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            setViewingDetailItem({ type: 'Product', data: product });
                                        }}
                                    >
                                        👁️ View
                                    </button>
                                    {selectedProduct?.id === product.id && (
                                        <div className="badge badge-primary">Selected</div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="empty-state">
                        <div className="empty-state-icon">💡</div>
                        <div className="empty-state-title">No Products Added</div>
                        <div className="empty-state-text">
                            Click "+ Add Product" to add products from the library
                        </div>
                    </div>
                )}
            </div>

            {/* Driver Section */}
            {selectedProduct && (
                <div className="hierarchy-section driver slide-in">
                    <div className="section-header">
                        <div className="section-title">
                            <div className="section-icon driver">⚡</div>
                            <span>Configure Drivers</span>
                            <div className="badge badge-warning">{selectedProduct.drivers?.length || 0} Drivers</div>
                        </div>
                        {!isLocked && (
                            <button
                                className="btn btn-primary btn-sm"
                                onClick={() => setShowDriverForm(!showDriverForm)}
                            >
                                {showDriverForm ? 'Cancel' : '+ Add Driver'}
                            </button>
                        )}
                    </div>

                    {/* Add Driver Form */}
                    {showDriverForm && (
                        <div className="card fade-in" style={{ marginBottom: '20px' }}>
                            <div style={{ padding: '20px' }}>
                                {driverForm.masterDriverId ? (
                                    <div className="selected-item-card" style={{ background: 'var(--warning-light)', padding: '15px', borderRadius: '8px', marginBottom: '20px', border: '1px solid var(--warning-color)' }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                            <div>
                                                <div style={{ fontWeight: '600', color: 'var(--warning-color)' }}>⚡ Library Driver Selected</div>
                                                <div style={{ fontSize: '14px' }}>{driverForm.name}</div>
                                            </div>
                                            <button type="button" className="btn btn-secondary btn-sm" onClick={() => setDriverForm({ ...driverForm, masterDriverId: undefined })}>Change</button>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="form-group" style={{ background: 'var(--bg-tertiary)', padding: '20px', borderRadius: '16px', marginBottom: '20px', border: '1px solid var(--border-color)' }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                                            <label className="form-label" style={{ fontWeight: '600', marginBottom: 0 }}>
                                                ⚡ Driver Library {selectedLibraryDrivers.length > 0 && `(${selectedLibraryDrivers.length} Selected)`}
                                            </label>
                                        </div>
                                        <input
                                            type="text"
                                            className="form-control"
                                            placeholder="Search drivers..."
                                            value={driverLibrarySearch}
                                            onChange={(e) => setDriverLibrarySearch(e.target.value)}
                                            style={{ marginBottom: '16px', borderRadius: '100px', paddingLeft: '20px' }}
                                        />

                                        {(driverLibrarySearch || currentCompatibleDrivers.length > 0) && (
                                            <div style={{
                                                display: 'grid',
                                                gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))',
                                                gap: '12px',
                                                maxHeight: '300px',
                                                overflowY: 'auto',
                                                padding: '4px'
                                            }}>
                                                {(driverLibrarySearch ? filteredMasterDrivers : currentCompatibleDrivers).map((md) => {
                                                    const mdId = md.id || (md as any).driver_id;
                                                    const isSelected = selectedLibraryDrivers.some(item => (item.driver.id || (item.driver as any).driver_id) === mdId);
                                                    return (
                                                        <div
                                                            key={mdId}
                                                            onClick={() => toggleDriverSelection(md)}
                                                            style={{
                                                                padding: '12px',
                                                                background: 'white',
                                                                border: isSelected ? '2px solid var(--warning)' : '1px solid var(--border-color)',
                                                                borderRadius: '12px',
                                                                cursor: 'pointer',
                                                                transition: 'all 0.2s',
                                                                position: 'relative',
                                                                display: 'flex',
                                                                flexDirection: 'column',
                                                                justifyContent: 'space-between'
                                                            }}
                                                        >
                                                            <div>
                                                                <div style={{ fontSize: '13px', fontWeight: '700' }}>{md.driver_make}</div>
                                                                <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>{md.driver_code}</div>
                                                                <div style={{ fontSize: '11px', fontWeight: 'bold', marginTop: '4px' }}>{md.max_wattage}W</div>
                                                            </div>
                                                            <button
                                                                className="btn btn-secondary btn-xs"
                                                                style={{ marginTop: '8px', fontSize: '10px', padding: '2px 4px' }}
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    handleQuickAddDriver(md, 1);
                                                                }}
                                                            >
                                                                + Quick Add
                                                            </button>
                                                            {isSelected && <div style={{ position: 'absolute', top: '8px', right: '8px', background: 'var(--warning)', color: 'white', width: '20px', height: '20px', borderRadius: '50%', textAlign: 'center', fontSize: '12px' }}>✓</div>}
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        )}

                                        {selectedLibraryDrivers.length > 0 && (
                                            <div style={{ marginTop: '16px', padding: '16px', background: 'white', borderRadius: '12px', border: '1px solid var(--warning)' }}>
                                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '12px' }}>
                                                    {selectedLibraryDrivers.map(item => {
                                                        const itemId = item.driver.id || (item.driver as any).driver_id;
                                                        return (
                                                            <div key={itemId} style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'var(--bg-tertiary)', padding: '4px 8px', borderRadius: '8px', fontSize: '12px' }}>
                                                                <span>{item.driver.driver_code}</span>
                                                                <input
                                                                    type="text"
                                                                    value={item.qty}
                                                                    onChange={(e) => updateDriverSelectionQty(itemId, parseInt(e.target.value))}
                                                                    style={{ width: '35px', textAlign: 'center', border: '1px solid var(--border-color)', borderRadius: '4px' }}
                                                                />
                                                                <button onClick={() => toggleDriverSelection(item.driver)} style={{ border: 'none', background: 'none', color: 'var(--danger)' }}>×</button>
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                                <button className="btn btn-warning w-full" onClick={handleAddSelectedDrivers} disabled={isAdding}>
                                                    Add {selectedLibraryDrivers.length} Selected Drivers
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                )}

                                <form onSubmit={handleDriverSubmit}>
                                    <div className="form-grid">
                                        <div className="form-group">
                                            <label className="form-label">Driver Name *</label>
                                            <input
                                                type="text"
                                                className="form-control"
                                                value={driverForm.name}
                                                onChange={(e) => setDriverForm({ ...driverForm, name: e.target.value })}
                                                required
                                            />
                                        </div>

                                        <div className="form-group">
                                            <label className="form-label">Quantity *</label>
                                            <input
                                                type="number"
                                                className="form-control"
                                                min="1"
                                                value={driverForm.quantity}
                                                onChange={(e) => setDriverForm({ ...driverForm, quantity: parseInt(e.target.value) })}
                                                required
                                            />
                                        </div>
                                    </div>

                                    <div className="form-actions">
                                        <button type="button" className="btn btn-secondary" onClick={() => setShowDriverForm(false)}>
                                            Cancel
                                        </button>
                                        <button type="submit" className="btn btn-success">
                                            Add Driver
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    )}

                    {/* Driver List */}
                    {selectedProduct.drivers && selectedProduct.drivers.length > 0 ? (
                        <div className="item-list">
                            {selectedProduct.drivers.map((driver) => (
                                <div key={driver.id} className="item">
                                    <div className="item-content">
                                        <div className="item-name">{driver.name}</div>
                                        <div className="item-description">
                                            {driver.model && `${driver.model} • `}
                                            {driver.wattage && `${driver.wattage} • `}
                                            Qty: {driver.quantity}
                                        </div>
                                    </div>
                                    <div className="item-actions">
                                        <button className="btn btn-secondary btn-sm" onClick={() => setViewingDetailItem({ type: 'Driver', data: driver })}>👁️ View</button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="empty-state">
                            <div className="empty-state-icon">⚡</div>
                            <div className="empty-state-title">No Drivers Added</div>
                        </div>
                    )}
                </div>
            )}

            {/* Accessory Section */}
            {selectedProduct && (
                <div className="hierarchy-section accessory slide-in">
                    <div className="section-header">
                        <div className="section-title">
                            <div className="section-icon accessory">🔧</div>
                            <span>Configure Accessories</span>
                            <div className="badge badge-success">{selectedProduct.accessories?.length || 0} Accessories</div>
                        </div>
                        {!isLocked && (
                            <button
                                className="btn btn-primary btn-sm"
                                onClick={() => setShowAccessoryForm(!showAccessoryForm)}
                            >
                                {showAccessoryForm ? 'Cancel' : '+ Add Accessory'}
                            </button>
                        )}
                    </div>

                    {/* Add Accessory Form */}
                    {showAccessoryForm && (
                        <div className="card fade-in" style={{ marginBottom: '20px' }}>
                            <div style={{ padding: '20px' }}>
                                {accessoryForm.masterAccessoryId ? (
                                    <div className="selected-item-card" style={{ background: 'var(--success-light)', padding: '15px', borderRadius: '8px', marginBottom: '20px', border: '1px solid var(--success-color)' }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                            <div>
                                                <div style={{ fontWeight: '600', color: 'var(--success-color)' }}>🔧 Library Accessory Selected</div>
                                                <div style={{ fontSize: '14px' }}>{accessoryForm.name}</div>
                                            </div>
                                            <button type="button" className="btn btn-secondary btn-sm" onClick={() => setAccessoryForm({ ...accessoryForm, masterAccessoryId: undefined })}>Change</button>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="form-group" style={{ background: 'var(--bg-tertiary)', padding: '20px', borderRadius: '16px', marginBottom: '20px', border: '1px solid var(--border-color)' }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                                            <label className="form-label" style={{ fontWeight: '600', marginBottom: 0 }}>
                                                🔧 Accessory Library {selectedLibraryAccessories.length > 0 && `(${selectedLibraryAccessories.length} Selected)`}
                                            </label>
                                        </div>
                                        <input
                                            type="text"
                                            className="form-control"
                                            placeholder="Search accessories..."
                                            value={accessoryLibrarySearch}
                                            onChange={(e) => setAccessoryLibrarySearch(e.target.value)}
                                            style={{ marginBottom: '16px', borderRadius: '100px', paddingLeft: '20px' }}
                                        />

                                        {(accessoryLibrarySearch || currentCompatibleAccessories.length > 0) && (
                                            <div style={{
                                                display: 'grid',
                                                gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))',
                                                gap: '12px',
                                                maxHeight: '300px',
                                                overflowY: 'auto',
                                                padding: '4px'
                                            }}>
                                                {(accessoryLibrarySearch ? filteredMasterAccessories : currentCompatibleAccessories).map((ma) => {
                                                    const maId = ma.id || (ma as any).accessory_id;
                                                    const isSelected = selectedLibraryAccessories.some(item => (item.accessory.id || (item.accessory as any).accessory_id) === maId);
                                                    return (
                                                        <div
                                                            key={maId}
                                                            onClick={() => toggleAccessorySelection(ma)}
                                                            style={{
                                                                padding: '12px',
                                                                background: 'white',
                                                                border: isSelected ? '2px solid var(--success)' : '1px solid var(--border-color)',
                                                                borderRadius: '12px',
                                                                cursor: 'pointer',
                                                                transition: 'all 0.2s',
                                                                position: 'relative',
                                                                display: 'flex',
                                                                flexDirection: 'column',
                                                                justifyContent: 'space-between'
                                                            }}
                                                        >
                                                            <div>
                                                                <div style={{ fontSize: '13px', fontWeight: '700' }}>{ma.accessory_name}</div>
                                                                <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>{ma.accessory_type}</div>
                                                            </div>
                                                            <button
                                                                className="btn btn-secondary btn-xs"
                                                                style={{ marginTop: '8px', fontSize: '10px', padding: '2px 4px' }}
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    handleQuickAddAccessory(ma, 1);
                                                                }}
                                                            >
                                                                + Quick Add
                                                            </button>
                                                            {isSelected && <div style={{ position: 'absolute', top: '8px', right: '8px', background: 'var(--success)', color: 'white', width: '20px', height: '20px', borderRadius: '50%', textAlign: 'center', fontSize: '12px' }}>✓</div>}
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        )}

                                        {selectedLibraryAccessories.length > 0 && (
                                            <div style={{ marginTop: '16px', padding: '16px', background: 'white', borderRadius: '12px', border: '1px solid var(--success)' }}>
                                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '12px' }}>
                                                    {selectedLibraryAccessories.map(item => {
                                                        const itemId = item.accessory.id || (item.accessory as any).accessory_id;
                                                        return (
                                                            <div key={itemId} style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'var(--bg-tertiary)', padding: '4px 8px', borderRadius: '8px', fontSize: '12px' }}>
                                                                <span>{item.accessory.accessory_name}</span>
                                                                <input
                                                                    type="text"
                                                                    value={item.qty}
                                                                    onChange={(e) => updateAccessorySelectionQty(itemId, parseInt(e.target.value))}
                                                                    style={{ width: '35px', textAlign: 'center', border: '1px solid var(--border-color)', borderRadius: '4px' }}
                                                                />
                                                                <button onClick={() => toggleAccessorySelection(item.accessory)} style={{ border: 'none', background: 'none', color: 'var(--danger)' }}>×</button>
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                                <button className="btn btn-success w-full" onClick={handleAddSelectedAccessories} disabled={isAdding}>
                                                    Add {selectedLibraryAccessories.length} Selected Accessories
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                )}

                                <form onSubmit={handleAccessorySubmit}>
                                    <div className="form-grid">
                                        <div className="form-group">
                                            <label className="form-label">Accessory Name *</label>
                                            <input
                                                type="text"
                                                className="form-control"
                                                value={accessoryForm.name}
                                                onChange={(e) => setAccessoryForm({ ...accessoryForm, name: e.target.value })}
                                                required
                                            />
                                        </div>

                                        <div className="form-group">
                                            <label className="form-label">Quantity *</label>
                                            <input
                                                type="number"
                                                className="form-control"
                                                min="1"
                                                value={accessoryForm.quantity}
                                                onChange={(e) => setAccessoryForm({ ...accessoryForm, quantity: parseInt(e.target.value) })}
                                                required
                                            />
                                        </div>
                                    </div>

                                    <div className="form-actions">
                                        <button type="button" className="btn btn-secondary" onClick={() => setShowAccessoryForm(false)}>
                                            Cancel
                                        </button>
                                        <button type="submit" className="btn btn-success">
                                            Add Accessory
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    )}

                    {/* Accessory List */}
                    {selectedProduct.accessories && selectedProduct.accessories.length > 0 ? (
                        <div className="item-list">
                            {selectedProduct.accessories.map((accessory) => (
                                <div key={accessory.id} className="item">
                                    <div className="item-content">
                                        <div className="item-name">{accessory.name}</div>
                                        <div className="item-description">
                                            {accessory.type && `${accessory.type} • `}
                                            Qty: {accessory.quantity}
                                            {accessory.specification && ` • ${accessory.specification}`}
                                        </div>
                                    </div>
                                    <div className="item-actions">
                                        <button
                                            className="btn btn-secondary btn-sm"
                                            onClick={() => setViewingDetailItem({ type: 'Accessory', data: accessory })}
                                        >
                                            👁️ View
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="empty-state">
                            <div className="empty-state-icon">🔧</div>
                            <div className="empty-state-title">No Accessories Added</div>
                            <div className="empty-state-text">
                                Add compatible accessories for this product
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* Detail Modal */}
            {viewingDetailItem && (
                <div className="modal-overlay" onClick={() => setViewingDetailItem(null)}>
                    <div className="modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '600px' }}>
                        <div className="modal-header">
                            <div className="modal-title">{viewingDetailItem.type} Details</div>
                            <button className="modal-close" onClick={() => setViewingDetailItem(null)}>×</button>
                        </div>
                        <div className="modal-body">
                            <div className="form-grid" style={{ gridTemplateColumns: '1fr 1fr' }}>
                                {Object.entries(viewingDetailItem.data).map(([key, value]) => {
                                    if (value === null || value === undefined || key === 'id' || Array.isArray(value)) return null;
                                    return (
                                        <div key={key} style={{ marginBottom: '12px' }}>
                                            <div style={{ fontSize: '12px', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>{key}</div>
                                            <div style={{ fontWeight: '500' }}>{value.toString()}</div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                        <div className="modal-footer" style={{ padding: '20px', borderTop: '1px solid var(--border-color)', display: 'flex', justifyContent: 'flex-end' }}>
                            <button className="btn btn-primary" onClick={() => setViewingDetailItem(null)}>Close</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ProductManagement;
