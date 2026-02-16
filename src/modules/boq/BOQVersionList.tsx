
import type { BOQVersion } from './types';

interface BOQVersionListProps {
    versions: BOQVersion[];
    selectedId: number | null;
    onSelect: (id: number) => void;
    onGenerate: () => void;
    isGenerating?: boolean;
}

export default function BOQVersionList({
    versions,
    selectedId,
    onSelect,
    onGenerate,
    isGenerating
}: BOQVersionListProps) {
    return (
        <div style={styles.container}>
            <div style={styles.header}>
                <h3 style={styles.title}>Versions</h3>
                <button
                    className="primary-btn"
                    style={styles.genBtn}
                    onClick={onGenerate}
                    disabled={isGenerating}
                >
                    {isGenerating ? '...' : '+ New'}
                </button>
            </div>
            <div style={styles.list}>
                {versions.length === 0 ? (
                    <div style={styles.emptyVersions}>No BOQ versions yet</div>
                ) : (
                    versions.sort((a, b) => b.version - a.version).map(v => (
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
                                <strong>v{v.version}</strong>
                                <span style={{
                                    ...styles.status,
                                    color: v.status === 'FINAL' ? '#10b981' : '#f59e0b'
                                }}>
                                    {v.status}
                                </span>
                            </div>
                            <div style={styles.date}>
                                {new Date(v.created_at).toLocaleDateString()}
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}

const styles = {
    container: {
        width: '240px',
        borderRight: '1px solid #e5e7eb',
        display: 'flex',
        flexDirection: 'column' as const,
        backgroundColor: '#f9fafb',
        height: '100%',
    },
    header: {
        padding: '16px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderBottom: '1px solid #e5e7eb',
        backgroundColor: '#fff'
    },
    title: {
        fontSize: '13px',
        fontWeight: 'bold',
        textTransform: 'uppercase' as const,
        color: '#6b7280',
        margin: 0,
    },
    genBtn: {
        padding: '4px 8px',
        fontSize: '12px'
    },
    list: {
        padding: '12px',
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
    emptyVersions: {
        fontSize: '13px',
        color: '#94a3b8',
        textAlign: 'center' as const,
        padding: '24px 12px',
        fontStyle: 'italic'
    }
};
