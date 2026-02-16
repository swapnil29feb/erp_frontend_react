import React, { useEffect, useState } from 'react';
import { Card, Typography, Spin, Button, message } from 'antd';
import { boqService } from '../../services/boqService';
import { mapBOQSummary } from '../../utils/boqSummaryMapper';

const { Title, Text } = Typography;

interface SummaryTabProps {
    projectId: number;
    onGenerateSuccess?: () => void;
}

const SummaryTab: React.FC<SummaryTabProps> = ({ projectId, onGenerateSuccess }) => {
    const [summary, setSummary] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [generating, setGenerating] = useState(false);

    useEffect(() => {
        const loadSummary = async () => {
            setLoading(true);
            try {
                const data = await boqService.getSummary(projectId);
                const mapped = mapBOQSummary(data);
                setSummary(mapped);
            } catch (err) {
                console.error("Failed to load summary", err);
                message.error("Failed to load project summary");
            } finally {
                setLoading(false);
            }
        };
        loadSummary();
    }, [projectId]);

    const handleGenerateBOQ = async () => {
        setGenerating(true);
        try {
            await boqService.generateBOQ(projectId);
            message.success("BOQ version generated");
            if (onGenerateSuccess) {
                onGenerateSuccess();
            }
        } catch (err) {
            console.error("Failed to generate BOQ", err);
            message.error("Failed to generate BOQ version");
        } finally {
            setGenerating(false);
        }
    };

    if (loading) return <div style={{ padding: '40px', textAlign: 'center' }}><Spin size="large" /></div>;

    if (!summary) return <div style={{ padding: '40px', textAlign: 'center' }}>No summary data available.</div>;

    const formatCurrency = (val: number) => `₹ ${Number(val || 0).toLocaleString('en-IN')}`;

    const hasItems = (summary?.totalLuminaires || 0) + (summary?.totalDrivers || 0) + (summary?.totalAccessories || 0) > 0;

    return (
        <div style={{ padding: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                <Title level={3} style={{ margin: 0 }}>Project Summary</Title>
                <Button
                    type="primary"
                    size="large"
                    onClick={handleGenerateBOQ}
                    loading={generating}
                    disabled={!hasItems}
                    style={{ borderRadius: '8px', fontWeight: '600' }}
                >
                    Generate BOQ
                </Button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '20px', marginBottom: '40px' }}>
                <Card bordered={false} style={{ boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)', borderRadius: '12px' }}>
                    <Text type="secondary" style={{ fontSize: '14px', textTransform: 'uppercase', fontWeight: 600 }}>Total Luminaires</Text>
                    <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#1e293b', marginTop: '8px' }}>{summary.totalLuminaires || 0}</div>
                </Card>

                <Card bordered={false} style={{ boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)', borderRadius: '12px' }}>
                    <Text type="secondary" style={{ fontSize: '14px', textTransform: 'uppercase', fontWeight: 600 }}>Total Drivers</Text>
                    <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#1e293b', marginTop: '8px' }}>{summary.totalDrivers || 0}</div>
                </Card>

                <Card bordered={false} style={{ boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)', borderRadius: '12px' }}>
                    <Text type="secondary" style={{ fontSize: '14px', textTransform: 'uppercase', fontWeight: 600 }}>Total Accessories</Text>
                    <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#1e293b', marginTop: '8px' }}>{summary.totalAccessories || 0}</div>
                </Card>

                <Card bordered={false} style={{ boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)', borderRadius: '12px' }}>
                    <Text type="secondary" style={{ fontSize: '14px', textTransform: 'uppercase', fontWeight: 600 }}>Total Power</Text>
                    <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#2563eb', marginTop: '8px' }}>{summary.totalPower || 0} W</div>
                </Card>
            </div>

            <Card
                title={<Title level={4} style={{ margin: 0 }}>Cost Breakdown</Title>}
                bordered={false}
                style={{ boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)', borderRadius: '12px' }}
            >
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 0', borderBottom: '1px solid #f1f5f9' }}>
                        <Text style={{ fontSize: '16px' }}>Subtotal Cost</Text>
                        <Text style={{ fontSize: '18px', fontWeight: 'bold' }}>{formatCurrency(summary.subtotal)}</Text>
                    </div>
                </div>
            </Card>

            {!hasItems && (
                <div style={{ marginTop: '40px', padding: '24px', backgroundColor: '#fff', borderRadius: '12px', border: '1px dashed #cbd5e1', textAlign: 'center' }}>
                    <Text type="danger" style={{ display: 'block', fontSize: '16px', fontWeight: '600' }}>
                        No configurations found. Add products in Configuration tab.
                    </Text>
                </div>
            )}
        </div>
    );
};

export default SummaryTab;
