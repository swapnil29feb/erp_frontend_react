
import type { FC } from 'react';
import { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';

const Sidebar: FC = () => {
    const { logout } = useAuth();
    const [collapsed, setCollapsed] = useState(false);

    const styles = {
        sidebar: {
            width: collapsed ? '60px' : '240px',
            height: '100vh',
            backgroundColor: '#111827',
            color: '#f3f4f6',
            display: 'flex',
            flexDirection: 'column' as const,
            flexShrink: 0,
            borderRight: '1px solid #1f2937',
            transition: 'width 0.2s',
        },
        logoArea: {
            padding: '24px 20px',
            borderBottom: '1px solid #1f2937',
            marginBottom: '8px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
        },
        logoText: {
            fontSize: '18px',
            fontWeight: '700',
            color: '#fff',
            letterSpacing: '0.01em',
            display: collapsed ? 'none' : 'block',
        },
        toggleBtn: {
            background: 'none',
            border: 'none',
            color: '#fff',
            fontSize: '20px',
            cursor: 'pointer',
            marginLeft: collapsed ? 0 : '12px',
        },
        nav: {
            flex: 1,
            padding: '8px 0',
            overflowY: 'auto' as const,
        },
        sectionHeader: {
            fontSize: '12px',
            textTransform: 'uppercase' as const,
            letterSpacing: '0.08em',
            color: '#8a94a6',
            padding: '20px 16px 6px',
        },
        item: {
            display: 'flex',
            alignItems: 'center',
            fontSize: '14px',
            padding: '12px 16px',
            color: '#d1d5db',
            textDecoration: 'none',
            borderRadius: '6px',
            margin: '2px 8px',
            transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
        },
        activeItem: {
            backgroundColor: 'rgba(255, 255, 255, 0.08)',
            color: '#fff',
            fontWeight: '600',
        },
        icon: {
            width: '18px',
            height: '18px',
            marginRight: '10px',
            flexShrink: 0,
        },
        logoutArea: {
            padding: '16px 8px',
            borderTop: '1px solid #1f2937',
        },
        logoutBtn: {
            border: 'none',
            background: 'transparent',
            display: 'flex',
            alignItems: 'center',
            width: '100%',
            textAlign: 'left' as const,
            fontSize: '14px',
            padding: '12px 16px',
            color: '#d1d5db',
            cursor: 'pointer',
            borderRadius: '6px',
            transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
        }
    };

    const getLinkStyle = ({ isActive }: { isActive: boolean }) => {
        return {
            ...styles.item,
            ...(isActive ? styles.activeItem : {}),
        };
    };

    const Icon = ({ path }: { path: string }) => (
        <svg style={styles.icon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d={path} />
        </svg>
    );

    const icons = {
        dashboard: "M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z M9 22V12h6v10",
        projects: "M21 7V5a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v2 M3 7h18v12a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7z M16 3v4 M8 3v4",
        products: "M21 8v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8 M21 8l-9-4-9 4 M21 8l-9 4-9-4 M12 12v10",
        drivers: "M13 2L3 14h9l-1 8 10-12h-9l1-8z",
        accessories: "M12 2L2 7l10 5 10-5-10-5z M2 17l10 5 10-5 M2 12l10 5 10-5",
        reports: "M18 20V10 M12 20V4 M6 20v-6",
        settings: "M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6z M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z",
        logout: "M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4 M16 17l5-5-5-5 M21 12H9"
    };

    return (
        <div style={styles.sidebar}>
            <style>
                {`
                    .sidebar-nav-item:hover {
                        background-color: rgba(255, 255, 255, 0.05) !important;
                        color: #fff !important;
                    }
                `}
            </style>
            <div style={styles.logoArea}>
                <div style={styles.logoText}>Lighting ERP</div>
                <button
                    style={styles.toggleBtn}
                    onClick={() => setCollapsed(c => !c)}
                    title={collapsed ? 'Open Sidebar' : 'Close Sidebar'}
                >
                    {collapsed ? '➡️' : '⬅️'}
                </button>
            </div>

            <nav style={styles.nav}>
                <NavLink to="/dashboard" style={getLinkStyle} className="sidebar-nav-item">
                    <Icon path={icons.dashboard} />
                    {!collapsed && 'Dashboard'}
                </NavLink>
                <NavLink to="/projects" style={getLinkStyle} className="sidebar-nav-item">
                    <Icon path={icons.projects} />
                    {!collapsed && 'Projects'}
                </NavLink>

                <div style={styles.sectionHeader}>{!collapsed && 'Masters'}</div>
                <NavLink to="/masters/products" style={getLinkStyle} className="sidebar-nav-item">
                    <Icon path={icons.products} />
                    {!collapsed && 'Products'}
                </NavLink>
                <NavLink to="/masters/drivers" style={getLinkStyle} className="sidebar-nav-item">
                    <Icon path={icons.drivers} />
                    {!collapsed && 'Drivers'}
                </NavLink>
                <NavLink to="/masters/accessories" style={getLinkStyle} className="sidebar-nav-item">
                    <Icon path={icons.accessories} />
                    {!collapsed && 'Accessories'}
                </NavLink>

                <div style={{ height: '24px' }} />

                <NavLink to="/reports" style={getLinkStyle} className="sidebar-nav-item">
                    <Icon path={icons.reports} />
                    {!collapsed && 'Reports'}
                </NavLink>
                <NavLink to="/settings" style={getLinkStyle} className="sidebar-nav-item">
                    <Icon path={icons.settings} />
                    {!collapsed && 'Settings'}
                </NavLink>
            </nav>

            <div style={styles.logoutArea}>
                <button
                    onClick={logout}
                    style={styles.logoutBtn}
                    className="sidebar-nav-item"
                >
                    <Icon path={icons.logout} />
                    {!collapsed && 'Logout'}
                </button>
            </div>
        </div>
    );
};

export default Sidebar;
