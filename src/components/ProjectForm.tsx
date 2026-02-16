import React, { useState, useEffect } from 'react';
import type { Project } from '../types';
import { projectApi, areaApi } from '../api_manual';

interface ProjectFormProps {
    projects: Project[];
    selectedProject: Project | null;
    onSelectProject: (project: Project | null) => void;
    onCreateProject: (project: Omit<Project, 'id' | 'createdAt' | 'areas'>) => void;
    onStartCreateProject: () => void;
    onClearSelection: () => void;
    totalProjects: number;
    currentPage: number;
    onPageChange: (page: number) => void;
}

const ProjectForm: React.FC<ProjectFormProps> = ({
    projects,
    selectedProject,
    onSelectProject,
    onCreateProject,
    onStartCreateProject,
    totalProjects,
    currentPage,
    onPageChange,
    onClearSelection,
}) => {
    const [isCreatingNew, setIsCreatingNew] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [formData, setFormData] = useState({
        name: '',
        project_code: '',
        client_name: '',
        location: '',
        description: '',
    });

    useEffect(() => {
        if (selectedProject) {
            setFormData({
                name: selectedProject.name,
                project_code: selectedProject.project_code || '',
                client_name: selectedProject.client_name || selectedProject.client || '',
                location: selectedProject.location,
                description: selectedProject.description,
            });
            setIsCreatingNew(false);
        }
    }, [selectedProject]);

    const filteredProjects = projects.filter((project) =>
        project.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (project.client_name && project.client_name.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (project.client && project.client.toLowerCase().includes(searchTerm.toLowerCase())) ||
        project.location.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.name || !formData.client_name || !formData.project_code) return;

        onCreateProject({
            ...formData,
            client: formData.client_name, // Legacy support
            status: 'ACTIVE'
        } as any);
        setFormData({ name: '', project_code: '', client_name: '', location: '', description: '' });
        setIsCreatingNew(false);
    };

    const handleNewProject = () => {
        onStartCreateProject();
    };

    const handleProjectClick = async (project: Project) => {
        console.log('🔍 Project clicked:', project.name, project.id);
        try {
            // Fetch the full project details including nested areas
            const response = await projectApi.get(project.id);
            console.log('📦 Project  details response:', response);

            if (response.success && response.data) {
                const projectData = response.data;
                console.log('✅ Project data received:', projectData);

                // Fetch areas separately if not included in project response
                try {
                    console.log('🔍 Fetching areas for project:', project.id);
                    const areasResponse = await areaApi.getAll(project.id);
                    console.log('📦 Areas response:', areasResponse);

                    if (areasResponse.success && areasResponse.data) {
                        // Merge areas into project data
                        projectData.areas = Array.isArray(areasResponse.data)
                            ? areasResponse.data
                            : [];
                        console.log('✅ Areas merged:', projectData.areas.length, 'areas');
                    } else {
                        projectData.areas = projectData.areas || [];
                        console.warn('⚠️ No areas in response, using empty array');
                    }
                } catch (areaError) {
                    console.warn('❌ Failed to fetch areas:', areaError);
                    projectData.areas = projectData.areas || [];
                }

                // Pass the complete project data with areas to parent
                console.log('🚀 Calling onSelectProject with:', projectData);
                onSelectProject(projectData);
            } else {
                // Fallback to the project from the list if API call fails
                console.warn('⚠️ Failed to fetch full project details, using list data');
                // Ensure areas is initialized
                const fallbackProject = { ...project, areas: project.areas || [] };
                onSelectProject(fallbackProject);
            }
        } catch (error) {
            console.error('❌ Error fetching project details:', error);
            // Fallback to the project from the list - ensure areas exists
            const fallbackProject = { ...project, areas: project.areas || [] };
            onSelectProject(fallbackProject);
        }
    };

    return (
        <div>
            {/* Project Selection */}
            {!isCreatingNew && (
                <div className="project-selector">
                    <div className="form-group">
                        <label className="form-label">Search Existing Projects</label>
                        <input
                            type="text"
                            className="form-control"
                            placeholder="Search by name, client, or location..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <button
                        className="btn btn-primary"
                        onClick={handleNewProject}
                    >
                        + New Project
                    </button>
                </div>
            )}

            {/* Project List */}
            {!isCreatingNew && filteredProjects.length > 0 && (
                <div className="item-list" style={{ marginBottom: '24px' }}>
                    {filteredProjects.map((project) => (
                        <div
                            key={project.id}
                            className={`item ${selectedProject?.id === project.id ? 'selected' : ''}`}
                            onClick={() => handleProjectClick(project)}
                        >
                            <div className="item-content">
                                <div className="item-name">{project.name}</div>
                                <div className="item-description">
                                    {project.client} • {project.location} • {project.areas?.length || 0} Areas
                                </div>
                            </div>
                            {selectedProject?.id === project.id && (
                                <div className="badge badge-primary">Selected</div>
                            )}
                        </div>
                    ))}

                    {/* Pagination Controls */}
                    {totalProjects > 10 && (
                        <div className="pagination flex items-center justify-between" style={{ marginTop: '20px', padding: '10px' }}>
                            <button
                                className="btn btn-secondary btn-sm"
                                disabled={currentPage === 1}
                                onClick={(e) => { e.stopPropagation(); onPageChange(currentPage - 1); }}
                            >
                                Previous
                            </button>
                            <span>Page {currentPage} of {Math.ceil(totalProjects / 10)}</span>
                            <button
                                className="btn btn-secondary btn-sm"
                                disabled={currentPage >= Math.ceil(totalProjects / 10)}
                                onClick={(e) => { e.stopPropagation(); onPageChange(currentPage + 1); }}
                            >
                                Next
                            </button>
                        </div>
                    )}
                </div>
            )}

            {/* Empty State */}
            {!isCreatingNew && projects.length === 0 && (
                <div className="empty-state">
                    <div className="empty-state-icon">📁</div>
                    <div className="empty-state-title">No Projects Yet</div>
                    <div className="empty-state-text">
                        Create your first project to get started
                    </div>
                </div>
            )}

            {/* Create/Edit Form */}
            {isCreatingNew && (
                <div className="card" style={{ marginTop: '24px' }}>
                    <div className="card-header">
                        <div className="card-title">Create New Project</div>
                    </div>

                    <form onSubmit={handleSubmit}>
                        <div className="form-grid">
                            <div className="form-group">
                                <label className="form-label">Project Name *</label>
                                <input
                                    type="text"
                                    className="form-control"
                                    placeholder="Enter project name"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    required
                                />
                            </div>

                            <div className="form-group">
                                <label className="form-label">Project Code *</label>
                                <input
                                    type="text"
                                    className="form-control"
                                    placeholder="Enter project code"
                                    value={formData.project_code}
                                    onChange={(e) => setFormData({ ...formData, project_code: e.target.value })}
                                    required
                                />
                            </div>

                            <div className="form-group">
                                <label className="form-label">Client Name *</label>
                                <input
                                    type="text"
                                    className="form-control"
                                    placeholder="Enter client name"
                                    value={formData.client_name}
                                    onChange={(e) => setFormData({ ...formData, client_name: e.target.value })}
                                    required
                                />
                            </div>

                            <div className="form-group">
                                <label className="form-label">Location</label>
                                <input
                                    type="text"
                                    className="form-control"
                                    placeholder="Enter location"
                                    value={formData.location}
                                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                                />
                            </div>
                        </div>

                        <div className="form-group">
                            <label className="form-label">Description</label>
                            <textarea
                                className="form-control"
                                placeholder="Enter project description"
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            />
                        </div>

                        <div className="form-actions">
                            <button
                                type="button"
                                className="btn btn-secondary"
                                onClick={() => {
                                    setIsCreatingNew(false);
                                    setFormData({ name: '', project_code: '', client_name: '', location: '', description: '' });
                                }}
                            >
                                Cancel
                            </button>
                            <button type="submit" className="btn btn-success">
                                Create Project
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {/* Selected Project Summary - Compact View */}
            {selectedProject && !isCreatingNew && (
                <div className="card" style={{ marginTop: '24px', background: 'var(--primary-light)' }}>
                    <div style={{ padding: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                            <div style={{ fontSize: '18px', fontWeight: '600', color: 'var(--primary)', marginBottom: '8px' }}>
                                {selectedProject.name}
                            </div>
                            <div style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>
                                <span><strong>Code:</strong> {selectedProject.project_code}</span>
                                <span style={{ margin: '0 12px' }}>•</span>
                                <span><strong>Client:</strong> {selectedProject.client_name || selectedProject.client}</span>
                                <span style={{ margin: '0 12px' }}>•</span>
                                <span><strong>Location:</strong> {selectedProject.location}</span>
                            </div>
                        </div>
                        <div style={{ display: 'flex', gap: '8px' }}>
                            <button
                                className="btn btn-primary btn-sm"
                                onClick={() => setIsCreatingNew(true)}
                            >
                                ✏️ Edit
                            </button>
                            <button
                                className="btn btn-secondary btn-sm"
                                onClick={() => {
                                    onClearSelection();
                                }}
                            >
                                ✕ Deselect
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ProjectForm;
