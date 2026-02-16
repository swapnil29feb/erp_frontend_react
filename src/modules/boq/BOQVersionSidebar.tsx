import type { BOQVersion } from './compareTypes';
import { useNavigate, useParams } from 'react-router-dom';

interface BOQVersionSidebarProps {
    versions: BOQVersion[];
    selectedId: number | null;
    onSelect: (id: number) => void;
    onCompare?: () => void;
}

export default function BOQVersionSidebar({ versions, selectedId, onSelect, onCompare }: BOQVersionSidebarProps) {
    const navigate = useNavigate();
    const { id: projectId } = useParams();

    const handleCompareClick = () => {
        if (onCompare) {
            onCompare();
        } else if (projectId) {
            navigate(`/projects/${projectId}/boq/compare`);
        }
    };

    return (
        <div className="boq-sidebar" style={styles.sidebar}>
            <h3 style={styles.title}>BOQ Versions</h3>
            <div style={styles.list}>
                {(versions || []).sort((a, b) => b.version - a.version).map(v => (
                    <div
                        key={v.id}
                        onClick={() => onSelect(v.id)}
                        style={{
                            ...styles.item,
                            backgroundColor: selectedId === v.id ? '#eff6ff' : 'transparent',
                            borderColor: selectedId === v.id ? '#3b82f6' : '#e5e7eb',
                        }}
                    >
                        <div style={styles.itemHeader}>
                            <strong>Version {v.version}</strong>
                            <span style={{ ...styles.status, color: v.status === 'FINAL' ? '#10b981' : '#f59e0b' }}>
                                {v.status}
                            </span>
                        </div>
                        <div style={styles.date}>
                            Date: {new Date().toLocaleDateString()}
                        </div>
                    </div>
                ))}
            </div>
            <div style={styles.footer}>
                <button
                    className="secondary-btn"
                    style={styles.compareBtn}
                    onClick={handleCompareClick}
                >
                    Compare Versions
                </button>
            </div>
        </div>
    );
}

const styles = {
    sidebar: {
        width: '240px',
        borderRight: '1px solid #e5e7eb',
        display: 'flex',
        flexDirection: 'column' as const,
        backgroundColor: '#f9fafb',
        height: '100%',
    },
    title: {
        padding: '16px',
        fontSize: '14px',
        fontWeight: 'bold',
        textTransform: 'uppercase' as const,
        color: '#374151',
        borderBottom: '1px solid #e5e7eb',
        margin: 0,
    },
    list: {
        padding: '8px',
        flex: 1,
        overflowY: 'auto' as const,
    },
    item: {
        padding: '12px',
        borderRadius: '6px',
        border: '1px solid',
        marginBottom: '8px',
        cursor: 'pointer',
        transition: 'all 0.2s',
    },
    itemHeader: {
        display: 'flex',
        justifyContent: 'space-between',
        fontSize: '13px',
    },
    status: {
        fontSize: '11px',
        fontWeight: 'bold',
    },
    date: {
        fontSize: '11px',
        color: '#6b7280',
        marginTop: '4px',
    },
    footer: {
        padding: '16px',
        borderTop: '1px solid #e5e7eb',
        backgroundColor: '#fff',
    },
    compareBtn: {
        width: '100%',
        padding: '8px',
        fontSize: '13px',
        fontWeight: '600',
    }
};
