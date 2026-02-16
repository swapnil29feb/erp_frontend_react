
import { Routes, Route, useParams, useNavigate } from 'react-router-dom';
import LoginPage from '../auth/LoginPage';
import ProtectedRoute from '../auth/ProtectedRoute';
import MainLayout from '../layout/MainLayout';
import Dashboard from '../pages/Dashboard';
import Projects from '../pages/Projects';
import ProjectWorkspace from '../pages/ProjectWorkspace';
import ConfigurationWorkspace from '../pages/configuration/ConfigurationWorkspace';
import ProductsPage from '../pages/masters/ProductsPage';
import DriversPage from '../pages/masters/DriversPage';
import AccessoriesPage from '../pages/masters/AccessoriesPage';
import Settings from '../pages/Settings';
import RBACPage from '../pages/settings/RBACPage';

// BOQ Module
// BOQ Module
import BOQPage from '../pages/boq/BOQPage';
import BOQComparePage from '../modules/boq/BOQComparePage';
import BOQVersionDetail from '../modules/boq/BOQVersionDetail';

import type { FC } from 'react';

const BOQPageWrapper: FC = () => {
    return <BOQPage />;
};

const BOQComparePageWrapper: FC = () => {
    const { projectId } = useParams();
    const navigate = useNavigate();
    return <BOQComparePage projectId={Number(projectId)} onBack={() => navigate(-1)} />;
};

const AppRouter: FC = () => {
    return (
        <Routes>
            {/* Public route */}
            <Route path="/login" element={<LoginPage />} />

            {/* Protected layout */}
            <Route
                path="/"
                element={
                    <ProtectedRoute>
                        <MainLayout />
                    </ProtectedRoute>
                }
            >
                <Route path="dashboard" element={<Dashboard />} />
                <Route path="projects" element={<Projects />} />
                <Route path="projects/:id" element={<ProjectWorkspace />} />
                <Route path="projects/:projectId/configure/:areaId?/:subareaId?" element={<ConfigurationWorkspace />} />

                {/* BOQ Module */}
                <Route path="boq" element={<BOQPageWrapper />} />
                <Route path="boq/:projectId" element={<BOQPageWrapper />} />
                <Route path="boq/detail/:boqId" element={<BOQVersionDetail />} />
                <Route path="projects/:projectId/boq/compare" element={<BOQComparePageWrapper />} />

                {/* Masters */}
                <Route path="masters">
                    <Route path="products" element={<ProductsPage />} />
                    <Route path="drivers" element={<DriversPage />} />
                    <Route path="accessories" element={<AccessoriesPage />} />
                </Route>

                {/* Settings */}
                <Route path="settings" element={<Settings />} />
                <Route path="settings/users" element={<RBACPage />} />

                {/* Optional: index redirect to dashboard */}
                <Route index element={<Dashboard />} />
            </Route>
        </Routes>
    );
};

export default AppRouter;
