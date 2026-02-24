
import { type FC, type ReactNode } from 'react';
import type { Area, Subarea } from '../../types/project';

interface ThreePaneWorkspaceProps {
    areas: Area[];
    subareas: Subarea[];
    selectedArea: Area | null;
    selectedSubarea: Subarea | null;
    mode: 'AREA_WISE' | 'PROJECT_LEVEL';
    onSelectArea: (area: Area) => void;
    onSelectSubarea: (subarea: Subarea) => void;
    onAddArea: () => void;
    onAddSubarea: () => void;
    loadingSubareas: boolean;
    activeTab: string;
    onTabChange: (tab: string) => void;
    projectName?: string;
    totals?: { amount: number; wattage: number; count: number };
    children: ReactNode;
}

const ThreePaneWorkspace: FC<ThreePaneWorkspaceProps> = ({
    areas,
    subareas,
    selectedArea,
    selectedSubarea,
    mode,
    onSelectArea,
    onSelectSubarea,
    onAddArea,
    onAddSubarea,
    loadingSubareas,
    activeTab,
    onTabChange,
    projectName,
    totals,
    children
}) => {

    const isProjectLevel = mode === 'PROJECT_LEVEL';

    const styles = {
        container: {
            display: 'flex',
            height: 'calc(100vh - 64px)',
            overflow: 'hidden',
            backgroundColor: '#f3f4f6',
            width: '100%',
        },
        pane: {
            display: 'flex',
            flexDirection: 'column' as const,
            borderRight: '1px solid #e5e7eb',
            backgroundColor: 'white',
            overflowY: 'auto' as const,
            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            width: '260px',
            minWidth: '260px',
            flexShrink: 0,
        },
        configPane: {
            flex: 1,
            backgroundColor: '#fff',
            display: 'flex',
            flexDirection: 'column' as const,
            boxShadow: 'inset 2px 0 8px rgba(0,0,0,0.02)',
            minWidth: 0,
            overflow: 'hidden',
        },
        header: {
            padding: '16px 20px',
            borderBottom: '1px solid #f3f4f6',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            backgroundColor: '#fff',
            position: 'sticky' as const,
            top: 0,
            zIndex: 10,
        },
        title: {
            fontWeight: '700',
            fontSize: '12px',
            color: '#4b5563',
            textTransform: 'uppercase' as const,
            letterSpacing: '0.05em',
        },
        addButton: {
            padding: '6px 12px',
            fontSize: '11px',
            backgroundColor: '#2563eb',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer',
            fontWeight: '600',
            boxShadow: '0 1px 2px rgba(37, 99, 235, 0.1)',
        },
        list: {
            listStyle: 'none',
            padding: 0,
            margin: 0,
        },
        item: {
            padding: '14px 20px',
            cursor: 'pointer',
            borderBottom: '1px solid #f9fafb',
            transition: 'all 0.15s ease',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            fontSize: '14px',
            color: '#374151',
        },
        itemActive: {
            backgroundColor: '#f0f7ff',
            borderLeft: '4px solid #2563eb',
            color: '#1e40af',
            fontWeight: '500',
        },
        emptyText: {
            padding: '40px 20px',
            color: '#9ca3af',
            textAlign: 'center' as const,
            fontSize: '13px',
            fontStyle: 'italic',
        },
        tabs: {
            display: 'flex',
            borderBottom: '1px solid #e5e7eb',
            backgroundColor: '#fff',
            padding: '0 20px',
            gap: '8px',
        },
        tab: {
            padding: '16px 20px',
            fontSize: '13px',
            fontWeight: '600',
            color: '#64748b',
            cursor: 'pointer',
            borderBottom: '2px solid transparent',
            transition: 'all 0.2s',
            textTransform: 'uppercase' as const,
            letterSpacing: '0.05em',
        },
        activeTab: {
            color: '#2563eb',
            borderBottom: '2px solid #2563eb',
        },
        workspaceContent: {
            flex: 1,
            padding: '24px',
            overflowY: 'auto' as const,
            backgroundColor: '#f9fafb',
        },
        badge: {
            fontSize: '10px',
            padding: '2px 8px',
            borderRadius: '999px',
            backgroundColor: '#f3f4f6',
            color: '#6b7280',
            fontWeight: '600',
        }
    };



    const projectTabs = isProjectLevel
        ? [
            { id: 'configuration', label: 'Configuration' },
            { id: 'summary', label: 'Summary' },
            { id: 'boq', label: 'BOQ' },
            { id: 'quotation', label: 'Quotation' }
        ]
        : [
            { id: 'areas', label: 'Areas' },
            { id: 'configuration', label: 'Configuration' },
            { id: 'summary', label: 'Summary' },
            { id: 'boq', label: 'BOQ' },
            { id: 'quotation', label: 'Quotation' }
        ];

    const showRightPane = isProjectLevel || selectedSubarea;

    return (
        <div style={styles.container}>
            {/* Left Pane: Areas */}
            <div style={{
                ...styles.pane,
                width: isProjectLevel ? '0px' : '260px',
                minWidth: isProjectLevel ? '0px' : '260px',
                opacity: isProjectLevel ? 0 : 1,
                overflow: isProjectLevel ? 'hidden' : 'auto'
            }}>
                <div style={styles.header}>
                    <span style={styles.title}>Areas</span>
                    <button style={styles.addButton} onClick={onAddArea}>+ Area</button>
                </div>
                {areas.length === 0 ? (
                    <div style={styles.emptyText}>No areas defined</div>
                ) : (
                    <ul style={styles.list}>
                        {areas.map(area => (
                            <li
                                key={area.id}
                                style={{
                                    ...styles.item,
                                    ...(selectedArea?.id === area.id ? styles.itemActive : {})
                                }}
                                onClick={() => onSelectArea(area)}
                            >
                                <span>{area.name}</span>
                                {area.floor && <span style={styles.badge}>{area.floor}</span>}
                            </li>
                        ))}
                    </ul>
                )}
            </div>

            {/* Middle Pane: Subareas */}
            <div style={{
                ...styles.pane,
                width: !selectedArea || isProjectLevel ? '0px' : '260px',
                minWidth: !selectedArea || isProjectLevel ? '0px' : '260px',
                opacity: !selectedArea || isProjectLevel ? 0 : 1,
                overflow: !selectedArea || isProjectLevel ? 'hidden' : 'auto',
                borderRight: !selectedArea || isProjectLevel ? 'none' : '1px solid #e5e7eb'
            }}>
                <div style={styles.header}>
                    <span style={styles.title}>Subareas</span>
                    <button style={styles.addButton} onClick={onAddSubarea}>+ Subarea</button>
                </div>
                {loadingSubareas ? (
                    <div style={styles.emptyText}>Loading...</div>
                ) : subareas.length === 0 ? (
                    <div style={styles.emptyText}>No subareas found</div>
                ) : (
                    <ul style={styles.list}>
                        {subareas.map(subarea => (
                            <li
                                key={subarea.id}
                                style={{
                                    ...styles.item,
                                    ...(selectedSubarea?.id === subarea.id ? styles.itemActive : {})
                                }}
                                onClick={() => onSelectSubarea(subarea)}
                            >
                                <span>{subarea.name}</span>
                            </li>
                        ))}
                    </ul>
                )}
            </div>

            {/* Right Pane: Main Workspace */}
            <div style={styles.configPane}>
                {showRightPane ? (
                    <>
                        {/* Context Header */}
                        <div style={{
                            padding: '16px 20px',
                            backgroundColor: '#1e293b',
                            color: 'white',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            fontSize: '13px'
                        }}>
                            <div style={{ display: 'flex', gap: '24px' }}>
                                <span><strong>Project:</strong> {projectName || 'Loading...'}</span>
                                {selectedArea && <span><strong>Area:</strong> {selectedArea.name}</span>}
                                {selectedSubarea && <span><strong>Subarea:</strong> {selectedSubarea.name}</span>}
                            </div>
                            <div style={{ backgroundColor: '#334155', padding: '4px 10px', borderRadius: '4px', fontSize: '11px', fontWeight: '700' }}>
                                {mode} MODE
                            </div>
                        </div>

                        {/* Top Navigation Tabs */}
                        <div style={styles.tabs}>
                            {projectTabs.map(tab => (
                                <div
                                    key={tab.id}
                                    style={{
                                        ...styles.tab,
                                        ...(activeTab === tab.id ? styles.activeTab : {})
                                    }}
                                    onClick={() => onTabChange(tab.id)}
                                >
                                    {tab.label}
                                </div>
                            ))}
                        </div>

                        <div style={styles.workspaceContent}>
                            {children}
                        </div>

                        {activeTab === 'configuration' && (
                            <div style={{
                                padding: '14px 24px',
                                borderTop: '2px solid #2563eb',
                                backgroundColor: '#1e293b',
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                color: 'white',
                                position: 'sticky',
                                bottom: 0,
                                zIndex: 10,
                                boxShadow: '0 -4px 12px rgba(0,0,0,0.15)'
                            }}>
                                <div style={{ display: 'flex', gap: '20px', fontSize: '12px', opacity: 0.9 }}>
                                    <span>Luminaires: <strong>{totals?.count || 0}</strong></span>
                                    <span>Total Power: <strong>{totals?.wattage || 0}W</strong></span>
                                </div>
                                <div style={{ fontSize: '18px', fontWeight: '700', color: '#60a5fa' }}>
                                    Total: ₹{totals?.amount.toLocaleString() || 0}
                                </div>
                            </div>
                        )}
                    </>
                ) : (
                    <div style={{ ...styles.workspaceContent, display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'center', color: '#9ca3af', textAlign: 'center' }}>
                        <div className="max-w-xs">
                            <div className="text-4xl mb-4">🏠</div>
                            <p className="text-sm font-medium">
                                {!selectedArea
                                    ? 'Select an Area from the left to begin'
                                    : 'Now select a Subarea to configure'
                                }
                            </p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ThreePaneWorkspace;
