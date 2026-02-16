import { useState } from 'react';
import BOQPage from '../../pages/boq/BOQPage';
import BOQComparePage from './BOQComparePage';

interface ProjectBOQTabProps {
    projectId: number;
    hasConfig?: boolean;
}

export default function ProjectBOQTab({ projectId, hasConfig = true }: ProjectBOQTabProps) {
    const [mode, setMode] = useState<'VIEW' | 'COMPARE'>('VIEW');

    if (!hasConfig) {
        return (
            <div style={styles.emptyCenter}>
                <div style={{ fontSize: '48px', marginBottom: '16px' }}>⚙️</div>
                <h3>No configurations yet</h3>
                <p>No configuration available. Go to Configuration tab and save products first.</p>
            </div>
        );
    }

    if (mode === 'COMPARE') {
        return (
            <BOQComparePage
                projectId={projectId}
                onBack={() => setMode('VIEW')}
            />
        );
    }

    return (
        <div style={styles.container}>
            {/* Self-contained BOQ Module */}
            <BOQPage projectId={projectId} />

            {/* Floating comparison trigger for quick access */}
            <button
                style={styles.floatingCompare}
                onClick={() => setMode('COMPARE')}
            >
                Compare
            </button>
        </div>
    );
}

const styles = {
    container: {
        height: '100%',
        position: 'relative' as const,
        overflow: 'hidden'
    },
    emptyCenter: {
        padding: '80px 40px',
        textAlign: 'center' as const,
        color: '#6b7280',
        display: 'flex',
        flexDirection: 'column' as const,
        alignItems: 'center',
        justifyContent: 'center'
    },
    floatingCompare: {
        position: 'fixed' as const,
        bottom: '24px',
        right: '24px',
        padding: '12px 24px',
        backgroundColor: '#1d4ed8',
        color: '#fff',
        border: 'none',
        borderRadius: '30px',
        fontWeight: 'bold',
        cursor: 'pointer',
        boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
        zIndex: 100
    }
};
