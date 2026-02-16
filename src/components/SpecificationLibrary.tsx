import React, { useState } from 'react';
import type { MasterProduct, MasterDriver, MasterAccessory } from '../types';
import { masterProductApi, masterDriverApi, masterAccessoryApi, optionsApi } from '../api_manual';

interface SpecificationLibraryProps {
    masterProducts: MasterProduct[];
    setMasterProducts: (products: MasterProduct[]) => void;
    masterDrivers: MasterDriver[];
    setMasterDrivers: (drivers: MasterDriver[]) => void;
    masterAccessories: MasterAccessory[];
    setMasterAccessories: (accessories: MasterAccessory[]) => void;
}

type Tab = 'products' | 'drivers' | 'accessories';

const SpecificationLibrary: React.FC<SpecificationLibraryProps> = ({
    masterProducts,
    setMasterProducts,
    masterDrivers,
    setMasterDrivers,
    masterAccessories,
    setMasterAccessories
}) => {
    const [currentTab, setCurrentTab] = useState<Tab>('products');
    const [showAddForm, setShowAddForm] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedItem, setSelectedItem] = useState<any>(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalItems, setTotalItems] = useState(0);
    const [mountingTypes, setMountingTypes] = useState<string[]>([
        // Default/fallback values - using common backend formats
        'RECESSED', 'SURFACE', 'SUSPENDED', 'TRACK', 'WALL_MOUNTED', 'BOLLARD', 'POLE_MOUNTED'
    ]);

    const fetchItems = async (tab: Tab, page: number) => {
        try {
            let response;
            if (tab === 'products') response = await masterProductApi.getAll(page);
            else if (tab === 'drivers') response = await masterDriverApi.getAll(page);
            else response = await masterAccessoryApi.getAll(page);

            if (response.success && response.data) {
                const data = response.data as any;
                if (tab === 'products') setMasterProducts(Array.isArray(data) ? data : (data.results || []));
                else if (tab === 'drivers') setMasterDrivers(Array.isArray(data) ? data : (data.results || []));
                else setMasterAccessories(Array.isArray(data) ? data : (data.results || []));

                setTotalItems(Array.isArray(data) ? data.length : (data.count || 0));
            }
        } catch (error) {
            console.error('Error fetching library items:', error);
        }
    };

    // Fetch mounting types from API
    React.useEffect(() => {
        const fetchMountingTypes = async () => {
            try {
                const response = await optionsApi.getMountingTypes();
                if (response.success && response.data && Array.isArray(response.data) && response.data.length > 0) {
                    setMountingTypes(response.data);
                }
            } catch (error) {
                console.log('Using default mounting types (API not available):', error);
                // Keep default values if API fails
            }
        };
        fetchMountingTypes();
    }, []);

    React.useEffect(() => {
        fetchItems(currentTab, currentPage);
    }, [currentTab, currentPage]);

    // Helper function to format mounting type for display
    const formatMountingType = (value: string): string => {
        return value
            .split('_')
            .map(word => word.charAt(0) + word.slice(1).toLowerCase())
            .join(' ');
    };

    // Product Form State
    const [newProduct, setNewProduct] = useState<Partial<MasterProduct>>({
        make: '',
        order_code: '',
        luminaire_color_ral: '',
        characteristics: '',
        diameter_mm: undefined,
        linear: 'NO',
        length_mm: undefined,
        width_mm: undefined,
        height_mm: undefined,
        mounting_style: '',
        beam_angle_degree: undefined,
        ip_class: undefined,
        wattage: undefined,
        op_voltage: undefined,
        op_current: undefined,
        lumen_output: undefined,
        cct_kelvin: undefined,
        cri_cci: undefined,
        lumen_efficency: undefined,
        weight_kg: undefined,
        warranty_years: undefined,
        website_link: '',
        compatibleDrivers: [],
        compatibleAccessories: []
    });


    // Driver Form State
    const [newDriver, setNewDriver] = useState<Partial<MasterDriver>>({
        driver_code: '',
        driver_make: '',
        driver_type: '',
        input_voltage_range: '',
        max_wattage: undefined,
        dimmable: 'YES',
        driver_integration: 'EXTERNAL'
    });


    // Accessory Form State
    const [newAccessory, setNewAccessory] = useState<Partial<MasterAccessory>>({
        accessory_name: '',
        accessory_type: '',
        description: ''
    });

    const resetForms = () => {
        setNewProduct({
            make: '', order_code: '', luminaire_color_ral: '', characteristics: '',
            diameter_mm: undefined, linear: 'NO', length_mm: undefined, width_mm: undefined, height_mm: undefined,
            mounting_style: '', beam_angle_degree: undefined, ip_class: undefined,
            wattage: undefined, op_voltage: undefined, op_current: undefined,
            lumen_output: undefined, cct_kelvin: undefined, cri_cci: undefined, lumen_efficency: undefined,
            weight_kg: undefined, warranty_years: undefined, website_link: '',
            compatibleDrivers: [], compatibleAccessories: []
        });
        setNewDriver({
            driver_code: '', driver_make: '', driver_type: '',
            input_voltage_range: '', max_wattage: undefined, dimmable: 'YES',
            driver_integration: 'EXTERNAL'
        });

        setNewAccessory({ accessory_name: '', accessory_type: '', description: '' });
        setShowAddForm(false);
    };

    const handleAddProduct = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const productToSave = {
                ...newProduct,
                name: `${newProduct.make} ${newProduct.order_code}`
            } as Omit<MasterProduct, 'id' | 'createdAt'>;

            const response = await masterProductApi.create(productToSave);
            if (response.success && response.data) {
                setMasterProducts([...masterProducts, response.data]);
                resetForms();
            } else {
                alert(`Failed to save product: ${response.error || 'Unknown error'}`);
            }
        } catch (error) {
            console.error('Error creating master product:', error);
            alert('A network error occurred while saving the product.');
        }
    };

    const handleAddDriver = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const response = await masterDriverApi.create(newDriver as any);
            if (response.success && response.data) {
                setMasterDrivers([...masterDrivers, response.data]);
                resetForms();
            } else {
                alert(`Failed to save driver: ${response.error || 'Unknown error'}`);
            }
        } catch (error) {
            console.error('Error creating master driver:', error);
            alert('A network error occurred while saving the driver.');
        }
    };

    const handleAddAccessory = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const response = await masterAccessoryApi.create(newAccessory as any);
            if (response.success && response.data) {
                setMasterAccessories([...masterAccessories, response.data]);
                resetForms();
            } else {
                alert(`Failed to save accessory: ${response.error || 'Unknown error'}`);
            }
        } catch (error) {
            console.error('Error creating master accessory:', error);
            alert('A network error occurred while saving the accessory.');
        }
    };

    const toggleSelection = (id: any, list: any[], setList: (l: any[]) => void) => {
        if (list.includes(id)) {
            setList(list.filter(item => item !== id));
        } else {
            setList([...list, id]);
        }
    };

    const filteredItems = () => {
        const lowerSearch = searchTerm.toLowerCase();
        if (currentTab === 'products') {
            return masterProducts.filter(p =>
                (p.make && p.make.toLowerCase().includes(lowerSearch)) ||
                (p.order_code && p.order_code.toLowerCase().includes(lowerSearch)) ||
                (p.name && p.name.toLowerCase().includes(lowerSearch))
            );
        } else if (currentTab === 'drivers') {
            return masterDrivers.filter(d =>
                (d.driver_make && d.driver_make.toLowerCase().includes(lowerSearch)) ||
                (d.driver_code && d.driver_code.toLowerCase().includes(lowerSearch))
            );
        } else {
            return masterAccessories.filter(a =>
                (a.accessory_name && a.accessory_name.toLowerCase().includes(lowerSearch))
            );
        }
    };

    return (
        <div className="fade-in">
            <div className="section-header">
                <div className="section-title">
                    <div className="section-icon product" style={{ background: 'var(--primary-light)', color: 'var(--primary)' }}>📚</div>
                    <span>Specification Library</span>
                </div>
            </div>

            <div className="tabs" style={{ display: 'flex', gap: '10px', marginBottom: '20px', borderBottom: '1px solid var(--border-color)', paddingBottom: '10px' }}>
                <button
                    className={`btn ${currentTab === 'products' ? 'btn-primary' : 'btn-secondary'}`}
                    onClick={() => { setCurrentTab('products'); setShowAddForm(false); }}
                >
                    Products ({masterProducts.length})
                </button>
                <button
                    className={`btn ${currentTab === 'drivers' ? 'btn-primary' : 'btn-secondary'}`}
                    onClick={() => { setCurrentTab('drivers'); setShowAddForm(false); }}
                >
                    Drivers ({masterDrivers.length})
                </button>
                <button
                    className={`btn ${currentTab === 'accessories' ? 'btn-primary' : 'btn-secondary'}`}
                    onClick={() => { setCurrentTab('accessories'); setShowAddForm(false); }}
                >
                    Accessories ({masterAccessories.length})
                </button>
            </div>

            {!showAddForm ? (
                <>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
                        <input
                            type="text"
                            className="form-control"
                            placeholder={`Search ${currentTab} (Name, Code)...`}
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            style={{ flex: 1, marginRight: '20px' }}
                        />
                        <button className="btn btn-primary" onClick={() => setShowAddForm(true)}>
                            + Add New {currentTab === 'products' ? 'Product' : currentTab === 'drivers' ? 'Driver' : 'Accessory'}
                        </button>
                    </div>

                    <div className="item-list">
                        {filteredItems().map((item: any) => (
                            <div key={item.id} className="item" onClick={() => setSelectedItem(item)}>
                                <div className="item-thumbnail">
                                    {(currentTab === 'products' && item.visual_image) ? (
                                        <img src={item.visual_image} alt={item.name} />
                                    ) : (
                                        <div className="thumbnail-placeholder">
                                            {currentTab === 'products' ? '💡' : currentTab === 'drivers' ? '⚡' : '🔧'}
                                        </div>
                                    )}
                                </div>
                                <div className="item-content">
                                    <div className="justify-between flex items-center mb-1">
                                        <div className="item-name" style={{ margin: 0 }}>
                                            {currentTab === 'products' ? (item.name || item.make + ' ' + item.order_code) :
                                                currentTab === 'drivers' ? (item.driver_make + ' ' + item.driver_code) :
                                                    item.accessory_name}
                                        </div>
                                        <div style={{ display: 'flex', gap: '8px' }}>
                                            {currentTab === 'products' && (
                                                <>
                                                    {item.make && <div className="badge badge-secondary">{item.make}</div>}
                                                    {item.order_code && <div className="badge badge-primary">{item.order_code}</div>}
                                                </>
                                            )}
                                            {currentTab === 'drivers' && (
                                                <>
                                                    {item.driver_make && <div className="badge badge-secondary">{item.driver_make}</div>}
                                                    {item.driver_code && <div className="badge badge-primary">{item.driver_code}</div>}
                                                </>
                                            )}
                                        </div>
                                    </div>
                                    <div className="item-description">
                                        {currentTab === 'products' && (
                                            <div style={{ display: 'flex', gap: '15px' }}>
                                                <span><strong>Lamp:</strong> {item.wattage}W • {item.cct_kelvin}K • CRI {item.cri_cci}</span>
                                                <span><strong>Dimensions:</strong> {item.linear === 'YES' ? `L:${item.length_mm} x W:${item.width_mm} x H:${item.height_mm}` : `DIA:${item.diameter_mm} x H:${item.height_mm}`}</span>
                                                <span><strong>Mounting:</strong> {formatMountingType(item.mounting_style || '')} • IP{item.ip_class}</span>
                                            </div>
                                        )}
                                        {currentTab === 'drivers' && (
                                            <div style={{ display: 'flex', gap: '15px' }}>
                                                <span><strong>Type:</strong> {item.driver_type}</span>
                                                <span><strong>Dimming:</strong> {item.dimmable}</span>
                                                <span><strong>Power:</strong> {item.max_wattage}W • {item.input_voltage_range}</span>
                                            </div>
                                        )}
                                        {currentTab === 'accessories' && (
                                            <div style={{ display: 'flex', gap: '15px' }}>
                                                <span><strong>Type:</strong> {item.accessory_type}</span>
                                                <span><strong>Description:</strong> {item.description}</span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Pagination Controls */}
                    {totalItems > 10 && (
                        <div className="pagination flex items-center justify-between" style={{ marginTop: '20px', padding: '10px' }}>
                            <button
                                className="btn btn-secondary"
                                disabled={currentPage === 1}
                                onClick={() => setCurrentPage(prev => prev - 1)}
                            >
                                Previous
                            </button>
                            <span>Page {currentPage} of {Math.ceil(totalItems / 10)}</span>
                            <button
                                className="btn btn-secondary"
                                disabled={currentPage >= Math.ceil(totalItems / 10)}
                                onClick={() => setCurrentPage(prev => prev + 1)}
                            >
                                Next
                            </button>
                        </div>
                    )}

                    {/* Detail Modal */}
                    {selectedItem && (
                        <div className="modal-overlay" onClick={() => setSelectedItem(null)}>
                            <div className="modal" onClick={e => e.stopPropagation()} style={{ maxWidth: '800px' }}>
                                <div className="modal-header">
                                    <div className="modal-title">Item Details</div>
                                    <button className="modal-close" onClick={() => setSelectedItem(null)}>×</button>
                                </div>
                                <div className="modal-body">
                                    <div style={{ display: 'flex', gap: '24px', marginBottom: '24px' }}>
                                        <div className="item-thumbnail" style={{ width: '200px', height: '200px', fontSize: '100px' }}>
                                            {selectedItem.visual_image ? (
                                                <img src={selectedItem.visual_image} alt="Detail" />
                                            ) : (
                                                <span>{currentTab === 'products' ? '💡' : currentTab === 'drivers' ? '⚡' : '🔧'}</span>
                                            )}
                                        </div>
                                        <div style={{ flex: 1 }}>
                                            <h2 style={{ marginBottom: '16px' }}>
                                                {currentTab === 'products' ? (selectedItem.name || selectedItem.make + ' ' + selectedItem.order_code) :
                                                    currentTab === 'drivers' ? (selectedItem.driver_make + ' ' + selectedItem.driver_code) :
                                                        selectedItem.accessory_name}
                                            </h2>
                                            <div className="form-grid" style={{ gridTemplateColumns: '1fr 1fr' }}>
                                                {Object.entries(selectedItem).map(([key, value]) => {
                                                    if (value === null || value === undefined || key === 'id' || key === 'visual_image' || Array.isArray(value)) return null;
                                                    return (
                                                        <div key={key} style={{ marginBottom: '12px' }}>
                                                            <div style={{ fontSize: '12px', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>{key.replace(/_/g, ' ')}</div>
                                                            <div style={{ fontWeight: '500' }}>{value.toString()}</div>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="modal-footer" style={{ padding: '20px', borderTop: '1px solid var(--border-color)', display: 'flex', justifyContent: 'flex-end' }}>
                                    <button className="btn btn-primary" onClick={() => setSelectedItem(null)}>Close</button>
                                </div>
                            </div>
                        </div>
                    )}

                </>
            ) : (
                <div className="card slide-in">
                    <div className="card-header">
                        <div className="card-title">Add New {currentTab === 'products' ? 'Product' : currentTab === 'drivers' ? 'Driver' : 'Accessory'}</div>
                    </div>

                    {currentTab === 'products' && (
                        <form onSubmit={handleAddProduct}>
                            {/* Identity Section */}
                            <div className="hierarchy-section product mb-3">
                                <div className="section-title mb-2">1. Identity</div>
                                <div className="form-grid">
                                    <div className="form-group">
                                        <label className="form-label">Make *</label>
                                        <input className="form-control" required value={newProduct.make} onChange={e => setNewProduct({ ...newProduct, make: e.target.value })} />
                                    </div>
                                    <div className="form-group">
                                        <label className="form-label">Order Code *</label>
                                        <input className="form-control" required value={newProduct.order_code} onChange={e => setNewProduct({ ...newProduct, order_code: e.target.value })} />
                                    </div>
                                    <div className="form-group">
                                        <label className="form-label">RAL Color</label>
                                        <input className="form-control" value={newProduct.luminaire_color_ral} onChange={e => setNewProduct({ ...newProduct, luminaire_color_ral: e.target.value })} />
                                    </div>
                                </div>
                            </div>


                            {/* Dimensions Section */}
                            <div className="hierarchy-section product mb-3">
                                <div className="section-title mb-2">2. Dimensions</div>
                                <div className="form-group">
                                    <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                                        <input type="checkbox" checked={newProduct.linear === 'YES'} onChange={e => setNewProduct({ ...newProduct, linear: e.target.checked ? 'YES' : 'NO' })} />
                                        <span>Linear?</span>
                                    </label>
                                </div>
                                <div className="form-grid">
                                    {newProduct.linear === 'NO' ? (
                                        <div className="form-group">
                                            <label className="form-label">Diameter (mm)</label>
                                            <input type="number" className="form-control" value={newProduct.diameter_mm || ''} onChange={e => setNewProduct({ ...newProduct, diameter_mm: parseFloat(e.target.value) })} />
                                        </div>
                                    ) : (
                                        <>
                                            <div className="form-group">
                                                <label className="form-label">Length (mm)</label>
                                                <input type="number" className="form-control" value={newProduct.length_mm || ''} onChange={e => setNewProduct({ ...newProduct, length_mm: parseFloat(e.target.value) })} />
                                            </div>
                                            <div className="form-group">
                                                <label className="form-label">Width (mm)</label>
                                                <input type="number" className="form-control" value={newProduct.width_mm || ''} onChange={e => setNewProduct({ ...newProduct, width_mm: parseFloat(e.target.value) })} />
                                            </div>
                                        </>
                                    )}
                                    <div className="form-group">
                                        <label className="form-label">Height (mm)</label>
                                        <input type="number" className="form-control" value={newProduct.height_mm || ''} onChange={e => setNewProduct({ ...newProduct, height_mm: parseFloat(e.target.value) })} />
                                    </div>
                                </div>
                            </div>

                            {/* Lamp Details Section */}
                            <div className="hierarchy-section product mb-3">
                                <div className="section-title mb-2">3. Lamp & Technical Details</div>
                                <div className="form-grid">
                                    <div className="form-group">
                                        <label className="form-label">Wattage (W)</label>
                                        <input type="number" className="form-control" value={newProduct.wattage || ''} onChange={e => setNewProduct({ ...newProduct, wattage: parseFloat(e.target.value) })} />
                                    </div>
                                    <div className="form-group">
                                        <label className="form-label">Op. Voltage (V)</label>
                                        <input type="number" className="form-control" value={newProduct.op_voltage || ''} onChange={e => setNewProduct({ ...newProduct, op_voltage: parseFloat(e.target.value) })} />
                                    </div>
                                    <div className="form-group">
                                        <label className="form-label">Op. Current (mA)</label>
                                        <input type="number" className="form-control" value={newProduct.op_current || ''} onChange={e => setNewProduct({ ...newProduct, op_current: parseFloat(e.target.value) })} />
                                    </div>
                                    <div className="form-group">
                                        <label className="form-label">Lumen Output (lm)</label>
                                        <input type="number" className="form-control" value={newProduct.lumen_output || ''} onChange={e => setNewProduct({ ...newProduct, lumen_output: parseFloat(e.target.value) })} />
                                    </div>
                                    <div className="form-group">
                                        <label className="form-label">CCT (K)</label>
                                        <input type="number" className="form-control" value={newProduct.cct_kelvin || ''} onChange={e => setNewProduct({ ...newProduct, cct_kelvin: parseFloat(e.target.value) })} placeholder="e.g. 3000" />
                                    </div>
                                    <div className="form-group">
                                        <label className="form-label">CRI</label>
                                        <input type="number" className="form-control" value={newProduct.cri_cci || ''} onChange={e => setNewProduct({ ...newProduct, cri_cci: parseFloat(e.target.value) })} placeholder="e.g. 90" />
                                    </div>
                                    <div className="form-group">
                                        <label className="form-label">Efficiency (lm/W)</label>
                                        <input type="number" className="form-control" value={newProduct.lumen_efficency || ''} onChange={e => setNewProduct({ ...newProduct, lumen_efficency: parseFloat(e.target.value) })} />
                                    </div>
                                </div>
                            </div>

                            {/* Mounting & Misc Section */}
                            <div className="hierarchy-section product mb-3">
                                <div className="section-title mb-2">4. Mounting & Misc</div>
                                <div className="form-grid">
                                    <div className="form-group">
                                        <label className="form-label">Mounting Style</label>
                                        <select className="form-control" value={newProduct.mounting_style} onChange={e => setNewProduct({ ...newProduct, mounting_style: e.target.value })}>
                                            <option value="">Select Style</option>
                                            {mountingTypes.map((type, index) => (
                                                <option key={index} value={type}>{formatMountingType(type)}</option>
                                            ))}
                                        </select>
                                    </div>

                                    <div className="form-group">
                                        <label className="form-label">Beam Angle (Degree)</label>
                                        <input type="number" className="form-control" value={newProduct.beam_angle_degree || ''} onChange={e => setNewProduct({ ...newProduct, beam_angle_degree: parseFloat(e.target.value) })} />
                                    </div>
                                    <div className="form-group">
                                        <label className="form-label">IP Class</label>
                                        <input type="number" className="form-control" value={newProduct.ip_class || ''} onChange={e => setNewProduct({ ...newProduct, ip_class: parseFloat(e.target.value) })} placeholder="e.g. 44" />
                                    </div>
                                    <div className="form-group">
                                        <label className="form-label">Website Link</label>
                                        <input className="form-control" value={newProduct.website_link} onChange={e => setNewProduct({ ...newProduct, website_link: e.target.value })} />
                                    </div>
                                    <div className="form-group">
                                        <label className="form-label">Weight (kg)</label>
                                        <input type="number" className="form-control" value={newProduct.weight_kg || ''} onChange={e => setNewProduct({ ...newProduct, weight_kg: parseFloat(e.target.value) })} />
                                    </div>
                                    <div className="form-group">
                                        <label className="form-label">Warranty (Years)</label>
                                        <input type="number" className="form-control" value={newProduct.warranty_years || ''} onChange={e => setNewProduct({ ...newProduct, warranty_years: parseFloat(e.target.value) })} />
                                    </div>
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Characteristics</label>
                                    <textarea className="form-control" value={newProduct.characteristics} onChange={e => setNewProduct({ ...newProduct, characteristics: e.target.value })} />
                                </div>
                            </div>

                            <div className="hierarchy-section driver mb-3">
                                <div className="section-title mb-2">Compatible Drivers</div>
                                <div className="form-grid" style={{ maxHeight: '200px', overflowY: 'auto' }}>
                                    {masterDrivers.map(d => (
                                        <label key={d.id} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                            <input type="checkbox" checked={newProduct.compatibleDrivers?.includes(d.id)} onChange={() => toggleSelection(d.id, newProduct.compatibleDrivers || [], l => setNewProduct({ ...newProduct, compatibleDrivers: l }))} />
                                            <span>{d.name} [{d.code}] ({d.brand})</span>
                                        </label>
                                    ))}
                                </div>
                            </div>

                            <div className="hierarchy-section accessory mb-3">
                                <div className="section-title mb-2">Compatible Accessories</div>
                                <div className="form-grid" style={{ maxHeight: '200px', overflowY: 'auto' }}>
                                    {masterAccessories.map(a => (
                                        <label key={a.id} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                            <input type="checkbox" checked={newProduct.compatibleAccessories?.includes(a.id)} onChange={() => toggleSelection(a.id, newProduct.compatibleAccessories || [], l => setNewProduct({ ...newProduct, compatibleAccessories: l }))} />
                                            <span>{a.name} [{a.code}]</span>
                                        </label>
                                    ))}
                                </div>
                            </div>

                            <div className="form-actions">
                                <button type="button" className="btn btn-secondary" onClick={resetForms}>Cancel</button>
                                <button type="submit" className="btn btn-primary">Save Product</button>
                            </div>
                        </form>
                    )}

                    {currentTab === 'drivers' && (
                        <form onSubmit={handleAddDriver}>
                            <div className="hierarchy-section driver mb-3">
                                <div className="section-title mb-2">Driver Details</div>
                                <div className="form-grid">
                                    <div className="form-group">
                                        <label className="form-label">Make *</label>
                                        <input className="form-control" required value={newDriver.driver_make} onChange={e => setNewDriver({ ...newDriver, driver_make: e.target.value })} />
                                    </div>
                                    <div className="form-group">
                                        <label className="form-label">Code *</label>
                                        <input className="form-control" required value={newDriver.driver_code} onChange={e => setNewDriver({ ...newDriver, driver_code: e.target.value })} />
                                    </div>
                                    <div className="form-group">
                                        <label className="form-label">Type</label>
                                        <input className="form-control" value={newDriver.driver_type} onChange={e => setNewDriver({ ...newDriver, driver_type: e.target.value })} />
                                    </div>
                                    <div className="form-group">
                                        <label className="form-label">Input Voltage Range</label>
                                        <input className="form-control" value={newDriver.input_voltage_range} onChange={e => setNewDriver({ ...newDriver, input_voltage_range: e.target.value })} />
                                    </div>
                                    <div className="form-group">
                                        <label className="form-label">Max Wattage</label>
                                        <input type="number" className="form-control" value={newDriver.max_wattage || ''} onChange={e => setNewDriver({ ...newDriver, max_wattage: parseFloat(e.target.value) })} />
                                    </div>
                                    <div className="form-group">
                                        <label className="form-label">Dimmable</label>
                                        <select className="form-control" value={newDriver.dimmable} onChange={e => setNewDriver({ ...newDriver, dimmable: e.target.value as any })}>
                                            <option value="YES">Yes</option>
                                            <option value="NO">No</option>
                                        </select>
                                    </div>
                                    <div className="form-group">
                                        <label className="form-label">Driver Integration</label>
                                        <select className="form-control" value={newDriver.driver_integration} onChange={e => setNewDriver({ ...newDriver, driver_integration: e.target.value as any })}>
                                            <option value="EXTERNAL">External Driver</option>
                                            <option value="INTEGRATED">Integrated Driver</option>
                                        </select>
                                    </div>
                                </div>
                            </div>

                            <div className="form-actions">
                                <button type="button" className="btn btn-secondary" onClick={resetForms}>Cancel</button>
                                <button type="submit" className="btn btn-primary">Save Driver</button>
                            </div>
                        </form>
                    )}

                    {currentTab === 'accessories' && (
                        <form onSubmit={handleAddAccessory}>
                            <div className="hierarchy-section accessory mb-3">
                                <div className="section-title mb-2">Accessory Details</div>
                                <div className="form-grid">
                                    <div className="form-group">
                                        <label className="form-label">Name *</label>
                                        <input className="form-control" required value={newAccessory.accessory_name} onChange={e => setNewAccessory({ ...newAccessory, accessory_name: e.target.value })} />
                                    </div>
                                    <div className="form-group">
                                        <label className="form-label">Type</label>
                                        <input className="form-control" value={newAccessory.accessory_type} onChange={e => setNewAccessory({ ...newAccessory, accessory_type: e.target.value })} />
                                    </div>
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Description</label>
                                    <textarea className="form-control" value={newAccessory.description} onChange={e => setNewAccessory({ ...newAccessory, description: e.target.value })} />
                                </div>
                            </div>
                            <div className="form-actions">
                                <button type="button" className="btn btn-secondary" onClick={resetForms}>Cancel</button>
                                <button type="submit" className="btn btn-primary">Save Accessory</button>
                            </div>
                        </form>
                    )}
                </div>
            )}
        </div>
    );
};

export default SpecificationLibrary;
