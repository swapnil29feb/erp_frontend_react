import React, { useState, useEffect } from 'react';
import type { Project } from '../types';
import { boqApi } from '../api_manual';
import { useAuth } from '../auth/AuthContext';
import { hasPermission } from '../utils/permission';

interface BOQGenerationProps {
    project: Project;
    onStatusChange?: (status: 'DRAFT' | 'APPROVED') => void;
}

const BOQGeneration: React.FC<BOQGenerationProps> = ({ project, onStatusChange }) => {
    const [boqSummary, setBoqSummary] = useState<any>(null);
    const [boqId, setBoqId] = useState<string | null>(null);
    const [status, setStatus] = useState<'DRAFT' | 'APPROVED' | null>(null);
    const [loading, setLoading] = useState(false);
    const [margin, setMargin] = useState(0);

    const fetchBOQSummary = async () => {
        setLoading(true);
        try {
            const response = await boqApi.getSummary(project.id);
            if (response.success && response.data) {
                setBoqSummary(response.data);
                // Assume the response contains boq_id and status
                if (response.data.boq_id) setBoqId(response.data.boq_id);
                if (response.data.status) {
                    const newStatus = response.data.status;
                    setStatus(newStatus);
                    onStatusChange?.(newStatus);
                }
            }
        } catch (error) {
            console.error('Error fetching BOQ summary:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchBOQSummary();
    }, [project.id]);

    const handleGenerateBOQ = async () => {
        setLoading(true);
        try {
            const response = await boqApi.generate(project.id);
            if (response.success) {
                await fetchBOQSummary();
            } else {
                alert(`Failed to generate BOQ: ${response.error}`);
            }
        } catch (error) {
            console.error('Error generating BOQ:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleApplyMargin = async () => {
        if (!boqId || status === 'APPROVED') return;
        setLoading(true);
        try {
            const response = await boqApi.applyMargin(boqId, margin);
            if (response.success) {
                await fetchBOQSummary();
                alert('Margin applied successfully');
            } else {
                alert(`Failed to apply margin: ${response.error}`);
            }
        } catch (error) {
            console.error('Error applying margin:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleApproveBOQ = async () => {
        if (!boqId || status === 'APPROVED') return;
        if (!window.confirm('Are you sure you want to approve this BOQ? This will lock all configuration and pricing.')) return;

        setLoading(true);
        try {
            const response = await boqApi.approve(boqId);
            if (response.success) {
                setStatus('APPROVED');
                onStatusChange?.('APPROVED');
                await fetchBOQSummary();
            } else {
                alert(`Failed to approve BOQ: ${response.error}`);
            }
        } catch (error) {
            console.error('Error approving BOQ:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleExport = (format: 'pdf' | 'excel') => {
        if (!boqId) return;
        boqApi.export(boqId, format);
    };

    if (loading && !boqSummary) {
        return <div className="empty-state">Loading BOQ Data...</div>;
    }

    if (!boqSummary || !boqSummary.PRODUCT) {
        return (
            <div className="card">
                <div className="empty-state">
                    <div className="empty-state-icon">📊</div>
                    <div className="empty-state-title">No BOQ Generated</div>
                    <p>Generate a BOQ to view commercial details and pricing.</p>
                    <button className="btn btn-primary" onClick={handleGenerateBOQ} disabled={loading}>
                        {loading ? 'Generating...' : 'Generate BOQ'}
                    </button>
                </div>
            </div>
        );
    }

    const isLocked = status === 'APPROVED';
    const { user } = useAuth();

    const renderGroup = (title: string, items: any[]) => (
        <div key={title} className="boq-group" style={{ marginBottom: '24px' }}>
            <h3 style={{ borderBottom: '2px solid var(--border-color)', paddingBottom: '8px', marginBottom: '16px', color: 'var(--primary)' }}>
                {title} ({items.length})
            </h3>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                    <tr style={{ background: 'var(--bg-tertiary)', textAlign: 'left' }}>
                        <th style={{ padding: '12px' }}>Name</th>
                        <th style={{ padding: '12px', textAlign: 'center' }}>Quantity</th>
                        <th style={{ padding: '12px', textAlign: 'right' }}>Unit Price</th>
                        <th style={{ padding: '12px', textAlign: 'right' }}>Total</th>
                    </tr>
                </thead>
                <tbody>
                    {items.map((item: any, idx: number) => (
                        <tr key={idx} style={{ borderBottom: '1px solid var(--border-color)' }}>
                            <td style={{ padding: '12px' }}>{item.name || item.product_name || item.driver_name || item.accessory_name}</td>
                            <td style={{ padding: '12px', textAlign: 'center' }}>{item.quantity}</td>
                            <td style={{ padding: '12px', textAlign: 'right' }}>
                                {/* Price override logic can be added here if backend supports individual item updates via API */}
                                {item.unit_price?.toFixed(2) || '0.00'}
                            </td>
                            <td style={{ padding: '12px', textAlign: 'right', fontWeight: 'bold' }}>
                                {item.total_price?.toFixed(2) || '0.00'}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );

    return (
        <div className="fade-in">
            <div className="card" style={{ marginBottom: '24px' }}>
                <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                        <div className="card-title">Commercial Summary</div>
                        <div className="badge badge-info">{status || 'DRAFT'}</div>
                    </div>
                    <div style={{ display: 'flex', gap: '12px' }}>
                        <button className="btn btn-primary btn-sm" onClick={() => handleExport('pdf')} disabled={!boqId}>📄 PDF</button>
                        <button className="btn btn-success btn-sm" onClick={() => handleExport('excel')} disabled={!boqId}>📊 Excel</button>
                    </div>
                </div>

                <div style={{ padding: '20px' }}>
                    <div className="form-grid" style={{ marginBottom: '24px', alignItems: 'flex-end' }}>
                        <div className="form-group">
                            <label className="form-label">Margin (%)</label>
                            <input
                                type="number"
                                className="form-control"
                                value={margin}
                                onChange={(e) => setMargin(parseFloat(e.target.value))}
                                disabled={isLocked || loading}
                            />
                        </div>
                        <div className="form-actions" style={{ marginBottom: '16px' }}>
                            <button className="btn btn-secondary" onClick={handleApplyMargin} disabled={isLocked || loading}>
                                Apply Margin
                            </button>
                            {hasPermission(user?.permissions || [], 'boq', 'approve') && (
                                <button className="btn btn-warning" onClick={handleApproveBOQ} disabled={isLocked || loading}>
                                    {isLocked ? 'APPROVED' : 'APPROVE BOQ'}
                                </button>
                            )}
                        </div>
                    </div>

                    {renderGroup('PRODUCTS', boqSummary.PRODUCT || [])}
                    {renderGroup('DRIVERS', boqSummary.DRIVER || [])}
                    {renderGroup('ACCESSORIES', boqSummary.ACCESSORY || [])}

                    <div style={{
                        marginTop: '24px',
                        padding: '20px',
                        background: 'var(--primary-light)',
                        borderRadius: 'var(--radius-md)',
                        textAlign: 'right'
                    }}>
                        <div style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>Total Project Value</div>
                        <div style={{ fontSize: '24px', fontWeight: '800', color: 'var(--primary)' }}>
                            {boqSummary.total_value?.toFixed(2) || '0.00'}
                        </div>
                    </div>
                </div>
            </div>
            {!isLocked && (
                <div style={{ textAlign: 'center' }}>
                    <button className="btn btn-secondary btn-sm" onClick={handleGenerateBOQ} disabled={loading}>
                        🔄 Regenerate BOQ
                    </button>
                </div>
            )}
        </div>
    );
};

export default BOQGeneration;

