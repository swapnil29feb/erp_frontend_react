import { useState, useEffect } from 'react';
import { getVersions } from './boqCompareService';
import type { BOQVersion } from './compareTypes';

interface VersionSelectorProps {
    projectId: number;
    onCompare: (v1: number, v2: number) => void;
}

export default function VersionSelector({ projectId, onCompare }: VersionSelectorProps) {
    const [versions, setVersions] = useState<BOQVersion[]>([]);
    const [v1, setV1] = useState<number>(0);
    const [v2, setV2] = useState<number>(0);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function load() {
            try {
                const data = await getVersions(projectId);
                const sorted = (data || []).sort((a: BOQVersion, b: BOQVersion) => b.version - a.version);
                setVersions(sorted);
                if (sorted.length >= 2) {
                    setV1(sorted[1].id);
                    setV2(sorted[0].id);
                } else if (sorted.length === 1) {
                    setV1(sorted[0].id);
                }
            } catch (err) {
                console.error("Failed to load versions in selector", err);
            } finally {
                setLoading(false);
            }
        }
        load();
    }, [projectId]);

    if (loading) return <div style={{ padding: '10px' }}>Loading versions...</div>;

    return (
        <div style={styles.container}>
            <div style={styles.group}>
                <div style={styles.field}>
                    <label style={styles.label}>Version A</label>
                    <select
                        style={styles.select}
                        value={v1}
                        onChange={(e) => setV1(Number(e.target.value))}
                    >
                        <option value={0} disabled>Select Version</option>
                        {versions.map(v => (
                            <option key={v.id} value={v.id}>v{v.version} - {v.status}</option>
                        ))}
                    </select>
                </div>

                <span style={styles.vs}>vs</span>

                <div style={styles.field}>
                    <label style={styles.label}>Version B</label>
                    <select
                        style={styles.select}
                        value={v2}
                        onChange={(e) => setV2(Number(e.target.value))}
                    >
                        <option value={0} disabled>Select Version</option>
                        {versions.map(v => (
                            <option key={v.id} value={v.id}>v{v.version} - {v.status}</option>
                        ))}
                    </select>
                </div>

                <button
                    className="primary-btn"
                    style={styles.btn}
                    disabled={!v1 || !v2 || v1 === v2}
                    onClick={() => onCompare(v1, v2)}
                >
                    Compare
                </button>
            </div>
            {v1 !== 0 && v1 === v2 && (
                <div style={styles.error}>Please select different versions</div>
            )}
        </div>
    );
}

const styles = {
    container: {
        padding: '16px 20px',
        backgroundColor: '#fff',
        borderBottom: '1px solid #e5e7eb'
    },
    group: {
        display: 'flex',
        alignItems: 'center',
        gap: '12px'
    },
    field: {
        display: 'flex',
        flexDirection: 'column' as const,
        gap: '4px'
    },
    label: {
        fontSize: '11px',
        fontWeight: 'bold',
        color: '#6b7280',
        textTransform: 'uppercase' as const
    },
    select: {
        padding: '8px',
        borderRadius: '4px',
        border: '1px solid #d1d5db',
        fontSize: '13px',
        minWidth: '160px'
    },
    vs: {
        marginTop: '16px',
        color: '#9ca3af',
        fontWeight: 'bold'
    },
    btn: {
        marginTop: '16px',
        padding: '8px 20px'
    },
    error: {
        fontSize: '11px',
        color: '#dc2626',
        marginTop: '4px'
    }
};
