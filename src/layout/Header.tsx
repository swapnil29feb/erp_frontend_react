import { useAuth } from '../auth/AuthContext';
import { useLocation } from 'react-router-dom';
import type { FC } from 'react';

const Header: FC = () => {
    const { user, logout } = useAuth();
    const location = useLocation();

    const getTitle = (pathname: string) => {
        switch (true) {
            case pathname.startsWith('/dashboard'): return 'Dashboard';
            case pathname.startsWith('/projects'): return 'Projects';
            case pathname.startsWith('/products'): return 'Products';
            case pathname.startsWith('/drivers'): return 'Drivers';
            case pathname.startsWith('/accessories'): return 'Accessories';
            case pathname.startsWith('/boq-versions'): return 'BOQ Versions';
            case pathname.startsWith('/audit-logs'): return 'Audit Logs';
            case pathname.startsWith('/settings'): return 'Settings';
            default: return 'Lighting ERP';
        }
    };

    const styles = {
        header: {
            height: '64px',
            backgroundColor: 'white',
            borderBottom: '1px solid #e5e7eb',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '0 2rem',
        },
        title: {
            fontSize: '1.25rem',
            fontWeight: '600',
            color: '#111827',
        },
        userSection: {
            display: 'flex',
            alignItems: 'center',
            gap: '1rem',
        },
        username: {
            fontSize: '0.875rem',
            fontWeight: '500',
            color: '#374151',
        },
        button: {
            padding: '0.5rem 1rem',
            fontSize: '0.875rem',
            color: '#4b5563',
            backgroundColor: 'transparent',
            border: '1px solid #d1d5db',
            borderRadius: '4px',
            cursor: 'pointer',
        }
    };

    return (
        <header style={styles.header}>
            <h1 style={styles.title}>{getTitle(location.pathname)}</h1>
            <div style={styles.userSection}>
                <span style={styles.username}>
                    {user?.first_name ? `${user.first_name} ${user.last_name || ''}` : user?.username}
                </span>
                <button onClick={logout} style={styles.button}>Logout</button>
            </div>
        </header>
    );
};

export default Header;
