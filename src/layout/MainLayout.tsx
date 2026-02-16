import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';
import type { FC } from 'react';

const MainLayout: FC = () => {
    const styles = {
        container: {
            display: 'flex',
            height: '100vh',
            width: '100vw',
            overflow: 'hidden',
        },
        main: {
            display: 'flex',
            flexDirection: 'column' as const,
            flex: 1,
            minWidth: 0, // Prevent flex overflow
        },
        content: {
            flex: 1,
            overflowY: 'auto' as const,
            padding: 0,
            backgroundColor: '#f9fafb', // Gray-50
        }
    };

    return (
        <div style={styles.container}>
            <Sidebar />
            <div style={styles.main}>
                <Header />
                <main style={styles.content}>
                    <Outlet />
                </main>
            </div>
        </div>
    );
};

export default MainLayout;
