import { useState } from 'react';
import VersionSelector from './VersionSelector';
import ComparisonTable from './ComparisonTable';
import { compareVersions } from './boqCompareService';
import type { RawBOQCompareItem, BOQCompareItem, BOQCompareResponse } from './compareTypes';

interface BOQComparePageProps {
    projectId: number;
    onBack?: () => void;
}

const transformItems = (items: RawBOQCompareItem[]) => {
  return items.map((item) => {
    const oldData = item.old || {
      quantity: 0,
      unit_price: 0,
      final_price: 0,
    };

    const newData = item.new || {
      quantity: 0,
      unit_price: 0,
      final_price: 0,
    };

    const difference = newData.final_price - oldData.final_price;

    return {
      key: item.product_id,
      area: item.area_name || "-",
      product: item.product_name || "-",
      status: item.status,

      qty_v1: oldData.quantity,
      qty_v2: newData.quantity,

      price_v1: oldData.unit_price,
      price_v2: newData.unit_price,

      total_v1: oldData.final_price,
      total_v2: newData.final_price,

      difference,
    };
  });
};

export default function BOQComparePage({ projectId, onBack }: BOQComparePageProps) {
    const [selectedV1, setSelectedV1] = useState<number | null>(null);
    const [selectedV2, setSelectedV2] = useState<number | null>(null);
    const [headerDiff, setHeaderDiff] = useState<BOQCompareResponse['header_diff'] | undefined>();
    const [compareData, setCompareData] = useState<BOQCompareItem[]>([]);
    const [loading, setLoading] = useState(false);

    const handleCompare = async () => {
        if (!selectedV1 || !selectedV2) return;
        setLoading(true);
        try {
            const data = await compareVersions(
                projectId,
                selectedV1,
                selectedV2
            );

            setHeaderDiff(data.header_diff);
            setCompareData(transformItems(data.items));
        } catch (err) {
            console.error("Comparison request failed", err);
        } finally {
            setLoading(false);
        }
    };

    const handleVersionSelect = (v1: number, v2: number) => {
        setSelectedV1(v1);
        setSelectedV2(v2);
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
                onCompare={handleVersionSelect}
            />

            {(selectedV1 && selectedV2) && (
                <button 
                    onClick={handleCompare} 
                    disabled={loading}
                    className="primary-btn"
                    style={{ padding: '8px 20px', margin: '12px 20px', alignSelf: 'flex-start' }}
                >
                    {loading ? 'Comparing...' : 'Compare Versions'}
                </button>
            )}

            <main style={styles.main}>
                {loading ? (
                    <div style={styles.loader}>
                        <div className="spinner-small"></div>
                        <span>Fetching differences...</span>
                    </div>
                ) : compareData.length > 0 ? (
                    <ComparisonTable 
                        items={compareData} 
                        summary={{
                            total_v1: headerDiff?.grand_total.old ?? 0,
                            total_v2: headerDiff?.grand_total.new ?? 0,
                            difference: headerDiff?.grand_total.difference ?? 0
                        }}
                        headerDiff={headerDiff}
                    />
                ) : (
                    <div style={styles.empty}>
                        Select two different versions and click "Compare Versions" to see differences.
                    </div>
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
    },
    empty: {
        padding: '60px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: '#64748b',
        fontSize: '14px'
    }
};
