import { useState } from 'react';
import VersionSelector from './VersionSelector';
import ComparisonTable from './ComparisonTable';
import { compareVersions } from './boqCompareService';
import type { BOQCompareItem, BOQCompareResponse } from './compareTypes';

interface BOQComparePageProps {
    projectId: number;
    onBack?: () => void;
}

export default function BOQComparePage({ projectId, onBack }: BOQComparePageProps) {
    const [items, setItems] = useState<BOQCompareItem[]>([]);
    const [summary, setSummary] = useState({ total_v1: 0, total_v2: 0, difference: 0 });
    const [loading, setLoading] = useState(false);

    const handleCompare = async (v1: number, v2: number) => {
        setLoading(true);
        try {
            const data: BOQCompareResponse = await compareVersions(projectId, v1, v2);
            setItems(data.items || []);
            setSummary(data.summary || { total_v1: 0, total_v2: 0, difference: 0 });
        } catch (err) {
            console.error("Comparison request failed", err);
            alert("Failed to fetch comparison data.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={styles.container}>
            <header style={styles.header}>
                <div style={styles.titleGroup}>
                    {onBack && (
                        <button style={styles.backBtn} onClick={onBack}>← Back</button>
                    )}
                    <h1 style={styles.title}>BOQ Version Comparison</h1>
                </div>
            </header>

            <VersionSelector
                projectId={projectId}
                onCompare={handleCompare}
            />

            <main style={styles.main}>
                {loading ? (
                    <div style={styles.loader}>
                        <div className="spinner-small"></div>
                        <span>Fetching differences...</span>
                    </div>
                ) : (
                    <ComparisonTable items={items} summary={summary} />
                )}
            </main>
        </div>
    );
}

const styles = {
    container: {
        height: '100%',
        display: 'flex',
        flexDirection: 'column' as const,
        backgroundColor: '#fff'
    },
    header: {
        padding: '16px 24px',
        borderBottom: '1px solid #e5e7eb',
        backgroundColor: '#fff'
    },
    titleGroup: {
        display: 'flex',
        alignItems: 'center',
        gap: '12px'
    },
    backBtn: {
        padding: '4px 8px',
        backgroundColor: 'transparent',
        border: 'none',
        color: '#2563eb',
        fontWeight: 'bold',
        cursor: 'pointer',
        fontSize: '14px'
    },
    title: {
        fontSize: '18px',
        fontWeight: '800',
        color: '#111827',
        margin: 0
    },
    main: {
        flex: 1,
        display: 'flex',
        flexDirection: 'column' as const,
        overflow: 'hidden'
    },
    loader: {
        padding: '60px',
        display: 'flex',
        flexDirection: 'column' as const,
        alignItems: 'center',
        justifyContent: 'center',
        gap: '12px',
        color: '#64748b'
    }
};
