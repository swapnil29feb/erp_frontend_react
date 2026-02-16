import React, { useState } from 'react';
import type { Project, TeamMember, ProjectPhase } from '../types';
import '../App.css'; // Using existing styles where possible

interface CreateProjectWizardProps {
    onCancel: () => void;
    onCreate: (project: Omit<Project, 'id' | 'createdAt' | 'areas'>) => void;
}

const TABS = ['Overview', 'Team Assignment', 'Timeline', 'Budget', 'Documents'];

// Mock Data
const TEAM_MEMBERS_MOCK: TeamMember[] = [
    { id: '1', name: 'David Martinez', role: 'Project Manager', status: 'busy', workload: 75, avatar: 'DM' },
    { id: '2', name: 'Jessica Lee', role: 'Interior Designer', status: 'available', workload: 45, avatar: 'JL' },
    { id: '3', name: 'Robert Chen', role: 'Architect', status: 'away', workload: 10, avatar: 'RC' },
    { id: '4', name: 'Emily White', role: 'Site Supervisor', status: 'available', workload: 0, avatar: 'EW' },
];

const TEMPLATES = ['Residential Villa', 'Commercial Office', 'Retail Store', 'Hospitality'];

const CreateProjectWizard: React.FC<CreateProjectWizardProps> = ({ onCancel, onCreate }) => {
    // Local interface for form data including UI-only fields
    interface WizardFormData {
        name: string;
        project_code: string;
        client_name: string;
        description: string;
        location: string;
        start_date: string;
        end_date: string;
        status: 'ACTIVE' | 'COMPLETED' | 'ON_HOLD';
        // UI-only fields
        template?: string;
        budget?: number;
        priority?: string;
        teamMembers?: TeamMember[];
        phases?: ProjectPhase[];
        documents?: any[];
    }

    const [activeTab, setActiveTab] = useState('Overview');
    const [formData, setFormData] = useState<WizardFormData>({
        name: '',
        project_code: '',
        client_name: '',
        description: '',
        location: '',
        start_date: '',
        end_date: '',
        status: 'ACTIVE',
        template: '',
        budget: undefined,
        priority: 'medium',
        teamMembers: [],
        phases: [],
        documents: [],
    });

    const [availableMembers, setAvailableMembers] = useState<TeamMember[]>(TEAM_MEMBERS_MOCK);
    const [assignedMembers, setAssignedMembers] = useState<TeamMember[]>([]);

    // Handlers
    const handleInputChange = (field: keyof WizardFormData, value: any) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleAssignMember = (member: TeamMember) => {
        setAssignedMembers(prev => [...prev, member]);
        setAvailableMembers(prev => prev.filter(m => m.id !== member.id));
        handleInputChange('teamMembers', [...assignedMembers, member]);
    };

    const handleUnassignMember = (member: TeamMember) => {
        setAvailableMembers(prev => [...prev, member]);
        setAssignedMembers(prev => prev.filter(m => m.id !== member.id));
        handleInputChange('teamMembers', assignedMembers.filter(m => m.id !== member.id));
    };

    const handleAddPhase = () => {
        const newPhase: ProjectPhase = {
            id: Date.now().toString(),
            name: 'New Phase',
            status: 'pending'
        };
        const updatedPhases = [...(formData.phases || []), newPhase];
        handleInputChange('phases', updatedPhases);
    };

    const handleCreate = () => {
        if (!formData.name || !formData.client_name || !formData.project_code) {
            alert('Please fill in required fields (Name, Client, Project Code)');
            return;
        }
        onCreate({
            name: formData.name,
            project_code: formData.project_code,
            client_name: formData.client_name,
            description: formData.description,
            location: formData.location,
            status: formData.status,
            start_date: formData.start_date,
            end_date: formData.end_date,
            // Legacy/UI fields mapping if needed, or omit them
            client: formData.client_name,
            startDate: formData.start_date,
            endDate: formData.end_date,
            created_at: new Date().toISOString(),
        });
    };

    return (
        <div className="wizard-container fade-in">
            <div className="wizard-header">
                <div>
                    <div className="breadcrumbs">Home {'>'} Project Management</div>
                    <h1 className="page-title" style={{ marginTop: '8px' }}>Create New Project</h1>
                    <p className="subtitle">Set up a new interior design project with comprehensive details</p>
                </div>
                <div className="wizard-actions">
                    <button className="btn btn-secondary" onClick={onCancel}>Save Draft</button>
                    <button className="btn btn-primary" onClick={handleCreate}>Create Project</button>
                    <button className="btn btn-icon">⋮</button>
                </div>
            </div>

            <div className="tabs-container">
                <div className="tabs-header">
                    {TABS.map(tab => (
                        <button
                            key={tab}
                            className={`tab-btn ${activeTab === tab ? 'active' : ''}`}
                            onClick={() => setActiveTab(tab)}
                        >
                            {tab}
                        </button>
                    ))}
                </div>

                <div className="tab-content">
                    {activeTab === 'Overview' && (
                        <div className="form-section">
                            <div className="form-group full-width">
                                <label className="form-label">Project Name *</label>
                                <input
                                    type="text"
                                    className="form-control"
                                    placeholder="Enter project name"
                                    value={formData.name}
                                    onChange={e => handleInputChange('name', e.target.value)}
                                />
                            </div>

                            <div className="form-group full-width">
                                <label className="form-label">Project Code *</label>
                                <input
                                    type="text"
                                    className="form-control"
                                    placeholder="e.g., PRJ-2024-001"
                                    value={formData.project_code}
                                    onChange={e => handleInputChange('project_code', e.target.value)}
                                />
                            </div>

                            <div className="form-group full-width">
                                <label className="form-label">Project Description *</label>
                                <textarea
                                    className="form-control"
                                    placeholder="Describe the project scope and objectives"
                                    rows={3}
                                    value={formData.description}
                                    onChange={e => handleInputChange('description', e.target.value)}
                                />
                            </div>

                            <div className="form-grid">
                                <div className="form-group">
                                    <label className="form-label">Client *</label>
                                    <select
                                        className="form-control"
                                        value={formData.client_name}
                                        onChange={e => handleInputChange('client_name', e.target.value)}
                                    >
                                        <option value="">Select a client</option>
                                        <option value="Tech Corp">Tech Corp</option>
                                        <option value="Luxury Living">Luxury Living</option>
                                        <option value="Global Retail">Global Retail</option>
                                    </select>
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Project Template *</label>
                                    <select
                                        className="form-control"
                                        value={formData.template}
                                        onChange={e => handleInputChange('template', e.target.value)}
                                    >
                                        <option value="">Choose a template</option>
                                        {TEMPLATES.map(t => <option key={t} value={t}>{t}</option>)}
                                    </select>
                                </div>

                                <div className="form-group">
                                    <label className="form-label">Start Date *</label>
                                    <input
                                        type="date"
                                        className="form-control"
                                        value={formData.start_date}
                                        onChange={e => handleInputChange('start_date', e.target.value)}
                                    />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">End Date *</label>
                                    <input
                                        type="date"
                                        className="form-control"
                                        value={formData.end_date}
                                        onChange={e => handleInputChange('end_date', e.target.value)}
                                    />
                                </div>

                                <div className="form-group">
                                    <label className="form-label">Budget (USD) *</label>
                                    <input
                                        type="number"
                                        className="form-control"
                                        placeholder="0.00"
                                        value={formData.budget || ''}
                                        onChange={e => handleInputChange('budget', parseFloat(e.target.value))}
                                    />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Priority *</label>
                                    <select
                                        className="form-control"
                                        value={formData.priority}
                                        onChange={e => handleInputChange('priority', e.target.value)}
                                    >
                                        <option value="low">Low</option>
                                        <option value="medium">Medium</option>
                                        <option value="high">High</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'Team Assignment' && (
                        <div className="team-section">
                            <div className="search-bar mb-4">
                                <input type="text" className="form-control" placeholder="Search team members..." />
                            </div>

                            <div className="team-grid">
                                <div className="team-column">
                                    <h3>Available Team Members <span className="count">{availableMembers.length} members</span></h3>
                                    <div className="member-list">
                                        {availableMembers.map(member => (
                                            <div key={member.id} className="member-card">
                                                <div className="member-avatar">{member.avatar}</div>
                                                <div className="member-info">
                                                    <div className="member-name">{member.name}</div>
                                                    <div className="member-role">{member.role}</div>
                                                    <div className={`member-status ${member.status}`}>
                                                        {member.status} • {member.workload}% workload
                                                        <div className="progress-bar">
                                                            <div className="progress" style={{ width: `${member.workload}%` }}></div>
                                                        </div>
                                                    </div>
                                                </div>
                                                <button className="btn btn-sm btn-outline" onClick={() => handleAssignMember(member)}>+ Assign</button>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <div className="team-column">
                                    <h3>Assigned Team Members <span className="count">{assignedMembers.length} members</span></h3>
                                    <div className="member-list assigned-area">
                                        {assignedMembers.length === 0 ? (
                                            <div className="empty-team">
                                                <div className="empty-icon">👤</div>
                                                <p>No team members assigned yet</p>
                                            </div>
                                        ) : (
                                            assignedMembers.map(member => (
                                                <div key={member.id} className="member-card">
                                                    <div className="member-avatar">{member.avatar}</div>
                                                    <div className="member-info">
                                                        <div className="member-name">{member.name}</div>
                                                        <div className="member-role">{member.role}</div>
                                                    </div>
                                                    <button className="btn btn-sm btn-danger-outline" onClick={() => handleUnassignMember(member)}>Remove</button>
                                                </div>
                                            ))
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'Timeline' && (
                        <div className="timeline-section">
                            <div className="section-header-row">
                                <h3>Project Phases</h3>
                                <button className="btn btn-outline" onClick={handleAddPhase}>+ Add Phase</button>
                            </div>
                            <div className="empty-state">
                                <div className="empty-state-icon">📅</div>
                                <div className="empty-state-title">No phases added yet</div>
                                <div className="empty-state-text">Add phases to create your project timeline</div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'Budget' && (
                        <div className="budget-section">
                            <div className="empty-state">
                                <div className="empty-state-icon">💰</div>
                                <div className="empty-state-title">Budget Management</div>
                                <div className="empty-state-text">Detailed budget breakdown will be available after project creation.</div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'Documents' && (
                        <div className="documents-section">
                            <div className="search-bar mb-4" style={{ display: 'flex', gap: '10px' }}>
                                <input type="text" className="form-control" placeholder="Search documents..." />
                                <button className="btn btn-outline">Upload Files</button>
                            </div>

                            <div className="stats-row">
                                <div className="stat-card">
                                    <div className="stat-label">Total Documents</div>
                                    <div className="stat-value">0</div>
                                </div>
                                <div className="stat-card">
                                    <div className="stat-label">Total Size</div>
                                    <div className="stat-value">0 Bytes</div>
                                </div>
                                <div className="stat-card">
                                    <div className="stat-label">Last Updated</div>
                                    <div className="stat-value">No documents</div>
                                </div>
                            </div>

                            <div className="empty-state">
                                <div className="empty-state-icon">📄</div>
                                <div className="empty-state-title">No documents found</div>
                                <div className="empty-state-text">Upload files to get started</div>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            <style>{`
        .wizard-container {
          background: white;
          border-radius: 8px;
          min-height: 80vh;
        }
        .wizard-header {
          padding: 24px 32px;
          border-bottom: 1px solid var(--border-color);
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          background: var(--bg-primary); /* Use a standard background */
        }
        .breadcrumbs {
          font-size: 14px;
          color: var(--text-secondary);
        }
        .subtitle {
          color: var(--text-secondary);
          margin-top: 4px;
        }
        .wizard-actions {
          display: flex;
          gap: 12px;
        }
        .tabs-header {
          padding: 0 32px;
          border-bottom: 1px solid var(--border-color);
          display: flex;
          gap: 32px;
          background: white;
        }
        .tab-btn {
          padding: 16px 0;
          background: none;
          border: none;
          border-bottom: 2px solid transparent;
          color: var(--text-secondary);
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s;
        }
        .tab-btn:hover {
          color: var(--primary);
        }
        .tab-btn.active {
          color: var(--primary);
          border-bottom-color: var(--primary);
        }
        .tab-content {
          padding: 32px;
          background: #f8fafc; /* Light grey background for content */
          min-height: 500px;
        }
        .form-section {
          background: white;
          padding: 24px;
          border-radius: 8px;
          box-shadow: 0 1px 3px rgba(0,0,0,0.1);
          max-width: 1000px;
          margin: 0 auto;
        }
        .team-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 24px;
        }
        .team-column h3 {
          display: flex;
          justify-content: space-between;
          font-size: 16px;
          margin-bottom: 16px;
        }
        .count {
          color: var(--text-secondary);
          font-weight: normal;
          font-size: 14px;
        }
        .member-list {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }
        .member-card {
          background: white;
          padding: 16px;
          border-radius: 8px;
          border: 1px solid var(--border-color);
          display: flex;
          align-items: center;
          gap: 16px;
        }
        .member-avatar {
          width: 40px;
          height: 40px;
          border-radius: 50%;
          background: #e2e8f0;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 600;
          color: #475569;
        }
        .member-info {
          flex: 1;
        }
        .member-role {
          font-size: 13px;
          color: var(--text-secondary);
        }
        .member-status {
          font-size: 12px;
          margin-top: 4px;
          display: flex;
          align-items: center;
          gap: 8px;
          flex-wrap: wrap;
        }
        .busy { color: #f59e0b; }
        .available { color: #10b981; }
        .progress-bar {
          width: 60px;
          height: 4px;
          background: #e2e8f0;
          border-radius: 2px;
        }
        .progress {
          height: 100%;
          background: #f59e0b;
          border-radius: 2px;
        }
        .available .progress { background: #10b981; }
        
        .assigned-area {
          min-height: 200px;
          border: 2px dashed var(--border-color);
          border-radius: 8px;
          padding: 16px;
          background: #f8fafc;
        }
        .empty-team {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          height: 100%;
          color: var(--text-secondary);
          opacity: 0.6;
        }
        .empty-icon {
          font-size: 32px;
          margin-bottom: 8px;
        }
        
        .section-header-row {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 24px;
        }
        
        .stats-row {
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            gap: 20px;
            margin-bottom: 32px;
        }
        .stat-card {
            background: white;
            padding: 20px;
            border-radius: 8px;
            border: 1px solid var(--border-color);
        }
        .stat-label {
            color: var(--text-secondary);
            font-size: 14px;
            margin-bottom: 8px;
        }
        .stat-value {
            font-size: 24px;
            font-weight: 600;
        }
        
        .mb-4 { margin-bottom: 16px; }
      `}</style>
        </div>
    );
};

export default CreateProjectWizard;
