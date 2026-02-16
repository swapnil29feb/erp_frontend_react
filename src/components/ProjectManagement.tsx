import React, { useState, useEffect } from 'react';
import type { Project, Area, Product, Driver, Accessory, MasterProduct, MasterDriver, MasterAccessory } from '../types';
import { projectApi, areaApi, productApi, driverApi, accessoryApi } from '../api_manual';
import ProjectForm from './ProjectForm';
import AreaManagement from './AreaManagement';
import ProductManagement from './ProductManagement';
import CreateProjectWizard from './CreateProjectWizard';
import BOQGeneration from './BOQGeneration';

interface ProjectManagementProps {
    projects: Project[];
    setProjects: (projects: Project[]) => void;
    selectedProject: Project | null;
    onSelectProject: (project: Project | null) => void;
    masterProducts?: MasterProduct[];
    masterDrivers?: MasterDriver[];
    masterAccessories?: MasterAccessory[];
    totalProjects: number;
    onPageChange: (page: number) => void;
    currentPage: number;
}

const ProjectManagement: React.FC<ProjectManagementProps> = ({
    projects,
    setProjects,
    selectedProject,
    onSelectProject,
    masterProducts = [],
    masterDrivers = [],
    masterAccessories = [],
    totalProjects,
    onPageChange,
    currentPage
}) => {
    const [selectedArea, setSelectedArea] = useState<Area | null>(null);
    const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
    const [showBOQ, setShowBOQ] = useState(false);
    const [isCreatingProject, setIsCreatingProject] = useState(false);
    const [boqStatus, setBoqStatus] = useState<'DRAFT' | 'APPROVED'>('DRAFT');

    const isLocked = boqStatus === 'APPROVED';

    // Reset state when project changes
    useEffect(() => {
        setSelectedArea(null);
        setSelectedProduct(null);
        setBoqStatus('DRAFT');
    }, [selectedProject?.id]);

    const handleCreateProject = async (projectData: Omit<Project, 'id' | 'createdAt' | 'areas'>) => {
        try {
            const response = await projectApi.create(projectData);
            if (response.success && response.data) {
                setProjects([...projects, response.data]);
                onSelectProject(response.data);
                setIsCreatingProject(false);
            } else {
                alert(`Failed to create project: ${response.error || 'Unknown error'}`);
            }
        } catch (error) {
            console.error('Error creating project:', error);
            alert('A network error occurred while creating the project.');
        }
    };

    const handleAddArea = async (area: Omit<Area, 'id' | 'projectId' | 'products'>) => {
        if (!selectedProject || isLocked) return;

        try {
            const response = await areaApi.create(selectedProject.id, area);
            if (response.success && response.data) {
                const newArea = response.data;
                const updatedProject = {
                    ...selectedProject,
                    areas: [...(selectedProject.areas || []), newArea],
                };

                const updatedProjects = projects.map(p => p.id === selectedProject.id ? updatedProject : p);
                setProjects(updatedProjects);
                onSelectProject(updatedProject);
                setSelectedArea(newArea);
            } else {
                alert(`Failed to create area: ${response.error || 'Unknown error'}`);
            }
        } catch (error) {
            console.error('Error creating area:', error);
            alert('A network error occurred while creating the area.');
        }
    };

    const handleAddProduct = async (product: Omit<Product, 'id' | 'areaId' | 'drivers' | 'accessories'>) => {
        if (!selectedArea || !selectedProject || isLocked) return;

        try {
            const response = await productApi.create(selectedArea.id, product);
            if (response.success && response.data) {
                const newProduct = response.data;
                const updatedArea = {
                    ...selectedArea,
                    products: [...(selectedArea.products || []), newProduct],
                };

                const updatedProject = {
                    ...selectedProject,
                    areas: selectedProject.areas.map(a => a.id === selectedArea.id ? updatedArea : a)
                };

                const updatedProjects = projects.map(p => p.id === selectedProject.id ? updatedProject : p);
                setProjects(updatedProjects);
                onSelectProject(updatedProject);
                setSelectedArea(updatedArea);
                setSelectedProduct(newProduct);
            } else {
                alert(`Failed to create product: ${response.error || 'Unknown error'}`);
            }
        } catch (error) {
            console.error('Error creating product:', error);
            alert('A network error occurred while creating the product.');
        }
    };

    const handleAddDriver = async (driver: Omit<Driver, 'id' | 'productId'>) => {
        if (!selectedProduct || !selectedArea || !selectedProject || isLocked) return;

        try {
            const response = await driverApi.create(selectedProduct.id, driver);
            if (response.success && response.data) {
                const newDriver = response.data;
                const updatedProduct = {
                    ...selectedProduct,
                    drivers: [...(selectedProduct.drivers || []), newDriver],
                };

                const updatedArea = {
                    ...selectedArea,
                    products: selectedArea.products.map(p => p.id === selectedProduct.id ? updatedProduct : p)
                };

                const updatedProject = {
                    ...selectedProject,
                    areas: selectedProject.areas.map(a => a.id === selectedArea.id ? updatedArea : a)
                };

                const updatedProjects = projects.map(p => p.id === selectedProject.id ? updatedProject : p);
                setProjects(updatedProjects);
                onSelectProject(updatedProject);
                setSelectedArea(updatedArea);
                setSelectedProduct(updatedProduct);
            } else {
                alert(`Failed to create driver: ${response.error || 'Unknown error'}`);
            }
        } catch (error) {
            console.error('Error creating driver:', error);
            alert('A network error occurred while creating the driver.');
        }
    };

    const handleAddAccessory = async (accessory: Omit<Accessory, 'id' | 'productId'>) => {
        if (!selectedProduct || !selectedArea || !selectedProject || isLocked) return;

        try {
            const response = await accessoryApi.create(selectedProduct.id, accessory);
            if (response.success && response.data) {
                const newAccessory = response.data;
                const updatedProduct = {
                    ...selectedProduct,
                    accessories: [...(selectedProduct.accessories || []), newAccessory],
                };

                const updatedArea = {
                    ...selectedArea,
                    products: selectedArea.products.map(p => p.id === selectedProduct.id ? updatedProduct : p)
                };

                const updatedProject = {
                    ...selectedProject,
                    areas: selectedProject.areas.map(a => a.id === selectedArea.id ? updatedArea : a)
                };

                const updatedProjects = projects.map(p => p.id === selectedProject.id ? updatedProject : p);
                setProjects(updatedProjects);
                onSelectProject(updatedProject);
                setSelectedArea(updatedArea);
                setSelectedProduct(updatedProduct);
            } else {
                alert(`Failed to create accessory: ${response.error || 'Unknown error'}`);
            }
        } catch (error) {
            console.error('Error creating accessory:', error);
            alert('A network error occurred while creating the accessory.');
        }
    };

    if (isCreatingProject) {
        return (
            <CreateProjectWizard
                onCancel={() => setIsCreatingProject(false)}
                onCreate={handleCreateProject}
            />
        );
    }

    return (
        <div className="dashboard-grid fade-in">
            {/* Project Section */}
            <div className="hierarchy-section project">
                <div className="section-header">
                    <div className="section-title">
                        <div className="section-icon project">📁</div>
                        <span>Project Management</span>
                    </div>
                </div>

                <ProjectForm
                    projects={projects}
                    selectedProject={selectedProject}
                    onSelectProject={onSelectProject}
                    onCreateProject={handleCreateProject}
                    onStartCreateProject={() => {
                        onSelectProject(null);
                        setIsCreatingProject(true);
                    }}
                    onClearSelection={() => {
                        onSelectProject(null);
                        setSelectedArea(null);
                        setSelectedProduct(null);
                    }}
                    totalProjects={totalProjects}
                    onPageChange={onPageChange}
                    currentPage={currentPage}
                />
            </div>

            {/* Area Section */}
            {selectedProject && (
                <AreaManagement
                    project={selectedProject}
                    selectedArea={selectedArea}
                    onSelectArea={setSelectedArea}
                    onAddArea={handleAddArea}
                    onClearSelection={() => {
                        setSelectedArea(null);
                        setSelectedProduct(null);
                    }}
                    isLocked={isLocked}
                />
            )}

            {/* Product Section */}
            {selectedArea && (
                <ProductManagement
                    area={selectedArea}
                    selectedProduct={selectedProduct}
                    onSelectProduct={setSelectedProduct}
                    onAddProduct={handleAddProduct}
                    onAddDriver={handleAddDriver}
                    onAddAccessory={handleAddAccessory}
                    masterProducts={masterProducts}
                    masterDrivers={masterDrivers}
                    masterAccessories={masterAccessories}
                    isLocked={isLocked}
                />
            )}

            {/* BOQ Generation Section */}
            {selectedProject && (selectedProject.areas?.length > 0 || boqStatus === 'APPROVED') && (
                <div className="hierarchy-section boq">
                    <div className="section-header">
                        <div className="section-title">
                            <div className="section-icon accessory">📊</div>
                            <span>BOQ Management</span>
                        </div>
                        <button
                            className="btn btn-primary"
                            onClick={() => setShowBOQ(!showBOQ)}
                        >
                            {showBOQ ? 'Hide BOQ' : 'View BOQ Summary'}
                        </button>
                    </div>

                    {showBOQ && (
                        <BOQGeneration
                            project={selectedProject}
                            onStatusChange={(status) => setBoqStatus(status)}
                        />
                    )}
                </div>
            )}
        </div>
    );
};

export default ProjectManagement;
