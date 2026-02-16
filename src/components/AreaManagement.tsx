import React, { useState } from 'react';
import type { Project, Area } from '../types';

interface AreaManagementProps {
    project: Project;
    selectedArea: Area | null;
    onSelectArea: (area: Area | null) => void;
    onAddArea: (area: Omit<Area, 'id' | 'projectId' | 'products'>) => void;
    onClearSelection: () => void;
    isLocked?: boolean;
}

const AreaManagement: React.FC<AreaManagementProps> = ({
    project,
    selectedArea,
    onSelectArea,
    onAddArea,
    isLocked = false,
}) => {
    const [showForm, setShowForm] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        area_code: '',
        area_type: '',
        floor: '',
        description: '',
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.name || !formData.area_code || isLocked) return;

        onAddArea({
            ...formData,
            created_at: new Date().toISOString()
        } as any);
        setFormData({ name: '', area_code: '', area_type: '', floor: '', description: '' });
        setShowForm(false);
    };

    const handleCancel = () => {
        setShowForm(false);
        setFormData({ name: '', area_code: '', area_type: '', floor: '', description: '' });
    };

    return (
        <div className="hierarchy-section area slide-in">
            <div className="section-header">
                <div className="section-title">
                    <div className="section-icon area">🏢</div>
                    <span>Area Management</span>
                    <div className="badge badge-primary">{project.areas?.length || 0} Areas</div>
                </div>
                {!isLocked && (
                    <button
                        className="btn btn-primary btn-sm"
                        onClick={() => setShowForm(!showForm)}
                    >
                        {showForm ? 'Cancel' : '+ Add Area'}
                    </button>
                )}
            </div>

            {/* Add Area Form */}
            {showForm && (
                <div className="card fade-in" style={{ marginBottom: '20px' }}>
                    <div className="card-header">
                        <div className="card-title">Add New Area</div>
                    </div>

                    <form onSubmit={handleSubmit}>
                        <div className="form-grid">
                            <div className="form-group">
                                <label className="form-label">Area Name *</label>
                                <input
                                    type="text"
                                    className="form-control"
                                    placeholder="e.g., Lobby"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    required
                                />
                            </div>

                            <div className="form-group">
                                <label className="form-label">Area Code *</label>
                                <input
                                    type="text"
                                    className="form-control"
                                    placeholder="e.g., A-01"
                                    value={formData.area_code}
                                    onChange={(e) => setFormData({ ...formData, area_code: e.target.value })}
                                    required
                                />
                            </div>

                            <div className="form-group">
                                <label className="form-label">Floor</label>
                                <input
                                    type="text"
                                    className="form-control"
                                    placeholder="e.g., Ground Floor"
                                    value={formData.floor}
                                    onChange={(e) => setFormData({ ...formData, floor: e.target.value })}
                                />
                            </div>

                            <div className="form-group">
                                <label className="form-label">Type</label>
                                <input
                                    type="text"
                                    className="form-control"
                                    placeholder="e.g., Office, Corridor"
                                    value={formData.area_type}
                                    onChange={(e) => setFormData({ ...formData, area_type: e.target.value })}
                                />
                            </div>
                        </div>

                        <div className="form-group">
                            <label className="form-label">Description</label>
                            <textarea
                                className="form-control"
                                placeholder="Enter area description"
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            />
                        </div>

                        <div className="form-actions">
                            <button type="button" className="btn btn-secondary" onClick={handleCancel}>
                                Cancel
                            </button>
                            <button type="submit" className="btn btn-success">
                                Add Area
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {/* Area List */}
            {project.areas && project.areas.length > 0 ? (
                <div className="item-list">
                    {project.areas.map((area) => (
                        <div
                            key={area.id}
                            className={`item ${selectedArea?.id === area.id ? 'selected' : ''}`}
                            onClick={() => onSelectArea(area)}
                        >
                            <div className="item-content">
                                <div className="item-name">{area.name} ({area.area_code})</div>
                                <div className="item-description">
                                    {area.floor && `${area.floor} • `}
                                    {area.area_type && `${area.area_type} • `}
                                    {area.products?.length || 0} Products
                                </div>
                            </div>
                            <div className="item-actions">
                                {selectedArea?.id === area.id && (
                                    <div className="badge badge-primary">Selected</div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="empty-state">
                    <div className="empty-state-icon">🏢</div>
                    <div className="empty-state-title">No Areas Added</div>
                    <div className="empty-state-text">
                        Click "Add Area" to create the first area for this project
                    </div>
                </div>
            )}
        </div>
    );
};

export default AreaManagement;
