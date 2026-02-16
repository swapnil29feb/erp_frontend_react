import React from 'react';
import type { Project } from '../types';

interface DashboardProps {
    projects: Project[];
    selectedProject: Project | null;
    onSelectProject: (project: Project | null) => void;
    totalProjects: number;
    totalProducts: number;
}

const Dashboard: React.FC<DashboardProps> = ({ projects, totalProjects, totalProducts }) => {
    return (
        <div className="dashboard-grid fade-in">
            {/* Summary Cards */}
            <div className="form-grid">
                <div className="card">
                    <div className="card-header">
                        <div className="card-title">Total Projects</div>
                    </div>
                    <div style={{ fontSize: '32px', fontWeight: 'bold', color: 'var(--primary)' }}>
                        {totalProjects}
                    </div>
                    <div className="text-muted" style={{ fontSize: '14px', marginTop: '8px' }}>
                        Active projects in system
                    </div>
                </div>

                <div className="card">
                    <div className="card-header">
                        <div className="card-title">Total Areas</div>
                    </div>
                    <div style={{ fontSize: '32px', fontWeight: 'bold', color: 'var(--secondary)' }}>
                        {projects.reduce((sum, p) => sum + (p.areas?.length || 0), 0)}
                    </div>
                    <div className="text-muted" style={{ fontSize: '14px', marginTop: '8px' }}>
                        Areas across all projects
                    </div>
                </div>

                <div className="card">
                    <div className="card-header">
                        <div className="card-title">Total Master Products</div>
                    </div>
                    <div style={{ fontSize: '32px', fontWeight: 'bold', color: 'var(--accent)' }}>
                        {totalProducts}
                    </div>
                    <div className="text-muted" style={{ fontSize: '14px', marginTop: '8px' }}>
                        Products configured
                    </div>
                </div>
            </div>

            {/* Welcome Message */}
            <div className="card">
                <div className="card-header">
                    <div className="card-title">Welcome to ERP System</div>
                    <div className="card-subtitle">Manage your projects, areas, products, drivers, and accessories</div>
                </div>
                <p style={{ color: 'var(--text-secondary)', lineHeight: '1.6' }}>
                    This ERP system helps you organize and manage your lighting projects efficiently.
                    Navigate to the <strong>Project</strong> section to create new projects, add areas,
                    configure products with compatible drivers and accessories, and generate versioned BOQs.
                </p>
                <div style={{ marginTop: '20px' }}>
                    <div className="badge badge-primary" style={{ marginRight: '8px' }}>Project Management</div>
                    <div className="badge badge-success" style={{ marginRight: '8px' }}>Area Configuration</div>
                    <div className="badge badge-warning" style={{ marginRight: '8px' }}>Product Specification</div>
                    <div className="badge badge-danger">BOQ Generation</div>
                </div>
            </div>

            {/* Recent Activity */}
            <div className="card">
                <div className="card-header">
                    <div className="card-title">Quick Start Guide</div>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    <div style={{ display: 'flex', gap: '12px', alignItems: 'start' }}>
                        <div style={{
                            width: '32px',
                            height: '32px',
                            borderRadius: '50%',
                            background: 'var(--primary-light)',
                            color: 'var(--primary)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontWeight: 'bold',
                            flexShrink: 0
                        }}>1</div>
                        <div>
                            <div style={{ fontWeight: '600', marginBottom: '4px' }}>Create a Project</div>
                            <div style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>
                                Start by creating a new project with client and location details
                            </div>
                        </div>
                    </div>

                    <div style={{ display: 'flex', gap: '12px', alignItems: 'start' }}>
                        <div style={{
                            width: '32px',
                            height: '32px',
                            borderRadius: '50%',
                            background: 'hsl(280, 70%, 96%)',
                            color: 'var(--secondary)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontWeight: 'bold',
                            flexShrink: 0
                        }}>2</div>
                        <div>
                            <div style={{ fontWeight: '600', marginBottom: '4px' }}>Add Areas</div>
                            <div style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>
                                Define different areas within your project (floors, rooms, zones)
                            </div>
                        </div>
                    </div>

                    <div style={{ display: 'flex', gap: '12px', alignItems: 'start' }}>
                        <div style={{
                            width: '32px',
                            height: '32px',
                            borderRadius: '50%',
                            background: 'hsl(160, 70%, 95%)',
                            color: 'var(--accent)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontWeight: 'bold',
                            flexShrink: 0
                        }}>3</div>
                        <div>
                            <div style={{ fontWeight: '600', marginBottom: '4px' }}>Configure Products</div>
                            <div style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>
                                Add products with compatible drivers and accessories
                            </div>
                        </div>
                    </div>

                    <div style={{ display: 'flex', gap: '12px', alignItems: 'start' }}>
                        <div style={{
                            width: '32px',
                            height: '32px',
                            borderRadius: '50%',
                            background: 'hsl(0, 84%, 95%)',
                            color: 'var(--danger)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontWeight: 'bold',
                            flexShrink: 0
                        }}>4</div>
                        <div>
                            <div style={{ fontWeight: '600', marginBottom: '4px' }}>Generate BOQ</div>
                            <div style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>
                                Create versioned Bill of Quantities for your project
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
