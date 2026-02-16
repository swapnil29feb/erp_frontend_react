import React from 'react';


interface SidebarProps {
    currentPage: 'home' | 'project' | 'library';
    onNavigate: (page: 'home' | 'project' | 'library') => void;
    onLogout: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ currentPage, onNavigate, onLogout }) => {
    return (
        <div className="sidebar">
            <div className="sidebar-header">
                <div className="logo">
                    <div className="logo-icon">⚡</div>
                    <span>ERP System</span>
                </div>
            </div>

            <nav className="sidebar-nav">
                <button
                    className={`nav-item ${currentPage === 'home' ? 'active' : ''}`}
                    onClick={() => onNavigate('home')}
                >
                    <span className="nav-icon">🏠</span>
                    <span>Home</span>
                </button>

                <button
                    className={`nav-item ${currentPage === 'project' ? 'active' : ''}`}
                    onClick={() => onNavigate('project')}
                >
                    <span className="nav-icon">📁</span>
                    <span>Project</span>
                </button>

                <button
                    className={`nav-item ${currentPage === 'library' ? 'active' : ''}`}
                    onClick={() => onNavigate('library')}
                >
                    <span className="nav-icon">📚</span>
                    <span>Library</span>
                </button>

                <button
                    className="nav-item"
                    onClick={onLogout}
                >
                    <span className="nav-icon">🚪</span>
                    <span>Logout</span>
                </button>
            </nav>

            <div className="sidebar-footer">
                <div className="user-info">
                    <div className="user-avatar">U</div>
                    <div className="user-details">
                        <div className="user-name">Admin User</div>
                        <div className="user-role">Administrator</div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Sidebar;
