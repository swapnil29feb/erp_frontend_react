import { useEffect, useState, type FC } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    ProjectOutlined,
    CheckCircleOutlined,
    FileTextOutlined,
    SafetyCertificateOutlined,
    RiseOutlined,
    PlusOutlined,
    ClockCircleOutlined,
    RightOutlined
} from '@ant-design/icons';
import { Card, Typography, Button, Badge } from 'antd';
import apiClient from '../api/apiClient';

const { Title, Text } = Typography;

interface DashboardStats {
    total_projects: number;
    active_projects: number;
    boq_ready: number;
    approved_projects: number;
    pipeline_value: number;
}

interface AuditLog {
    id: number;
    action_type: string;
    details: string;
    project_name?: string;
    created_at: string;
}

interface Project {
    id: number;
    name: string;
    status: string;
}

const Dashboard: FC = () => {
    const navigate = useNavigate();
    const [stats, setStats] = useState<DashboardStats | null>(null);
    const [loading, setLoading] = useState(true);
    const [activity, setActivity] = useState<AuditLog[]>([]);

    useEffect(() => {
        const loadDashboardData = async () => {
            try {
                // 1. Load Projects for Stats
                const projectsRes = await apiClient.get('/projects/projects/');
                const projects = Array.isArray(projectsRes.data) ? projectsRes.data : projectsRes.data.results || [];

                // 2. Load Audit Logs for Recent Activity
                const logsRes = await apiClient.get('/common/audit/logs/?page=1&page_size=6');
                const logs = Array.isArray(logsRes.data) ? logsRes.data : logsRes.data.results || [];
                setActivity(logs);

                const statsData: DashboardStats = {
                    total_projects: projects.length,
                    active_projects: projects.filter((p: Project) => p.status === 'ACTIVE' || p.status === 'CONFIGURING').length,
                    boq_ready: projects.filter((p: Project) => p.status === 'BOQ_READY' || p.status === 'BOQ_DRAFT').length,
                    approved_projects: projects.filter((p: Project) => p.status === 'APPROVED' || p.status === 'WON' || p.status === 'FINAL').length,
                    pipeline_value: 4520000, // Demo value
                };

                setStats(statsData);
            } catch (err) {
                console.error("Dashboard load failed", err);
            } finally {
                setLoading(false);
            }
        };
        loadDashboardData();
    }, []);

    const pipelineData = [
        { label: 'Inquiry', count: 12, color: '#94a3b8' },
        { label: 'Configured', count: 8, color: '#6366f1' },
        { label: 'BOQ Ready', count: 5, color: '#f59e0b' },
        { label: 'Approved', count: 3, color: '#10b981' },
    ];

    if (loading) return (
        <div style={{ padding: '40px', textAlign: 'center' }}>
            <ClockCircleOutlined spin style={{ fontSize: '32px', color: '#2563eb' }} />
            <div style={{ marginTop: '12px', color: '#64748b' }}>Initializing Dashboard...</div>
        </div>
    );

    return (
        <div style={styles.container}>
            {/* Fixed Quick Actions Bar */}
            <div style={styles.quickActionsBar}>
                <Button icon={<ProjectOutlined />} onClick={() => navigate('/projects')}>Add Area</Button>
                <Button icon={<FileTextOutlined />} onClick={() => navigate('/projects')}>Generate BOQ</Button>
                <Button icon={<SafetyCertificateOutlined />} onClick={() => navigate('/projects')}>Create Quotation</Button>
                <Button type="primary" icon={<PlusOutlined />} onClick={() => navigate('/projects?new=true')}>New Project</Button>
            </div>

            {/* Header */}
            <div style={styles.header}>
                <div>
                    <Title level={2} style={{ margin: 0 }}>Executive Dashboard</Title>
                    <Text type="secondary">Real-time overview of your lighting project pipeline</Text>
                </div>
            </div>

            {/* KPI Cards Row */}
            <div style={styles.kpiRow}>
                <KPICard
                    title="Total Projects"
                    value={stats?.total_projects || 0}
                    icon={<ProjectOutlined />}
                    color="#2563eb"
                    subtext="+2 this week"
                    onClick={() => navigate('/projects')}
                />
                <KPICard
                    title="Active Projects"
                    value={stats?.active_projects || 0}
                    icon={<RiseOutlined />}
                    color="#6366f1"
                    subtext="85% on schedule"
                    onClick={() => navigate('/projects?status=ACTIVE')}
                />
                <KPICard
                    title="BOQ Ready"
                    value={stats?.boq_ready || 0}
                    icon={<FileTextOutlined />}
                    color="#f59e0b"
                    subtext="3 awaiting validation"
                    onClick={() => navigate('/projects?status=BOQ_READY')}
                />
                <KPICard
                    title="Approved Projects"
                    value={stats?.approved_projects || 0}
                    icon={<SafetyCertificateOutlined />}
                    color="#10b981"
                    subtext="+1 since yesterday"
                    onClick={() => navigate('/projects?status=APPROVED')}
                />
                <KPICard
                    title="Total Pipeline Value"
                    value={`\u20B9 ${((stats?.pipeline_value || 0) / 1000000).toFixed(1)}M`}
                    icon={<CheckCircleOutlined />}
                    color="#0f172a"
                    subtext="Forecasted: \u20B9 12M"
                    onClick={() => navigate('/projects')}
                />
            </div>

            {/* Pipeline and Charts */}
            <div style={styles.mainGrid}>
                <Card title="Project Pipeline" style={styles.chartCard} headStyle={styles.cardHeader}>
                    <div style={styles.funnelContainer}>
                        {pipelineData.map((item) => (
                            <div key={item.label} style={styles.funnelStep}>
                                <div style={styles.funnelLabel}>{item.label}</div>
                                <div style={styles.funnelBarWrapper}>
                                    <div style={{
                                        ...styles.funnelBar,
                                        width: `${(item.count / 12) * 100}%`,
                                        backgroundColor: item.color
                                    }} />
                                    <span style={styles.funnelCount}>{item.count}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </Card>

                <Card title="Project Value Trend" style={styles.chartCard} headStyle={styles.cardHeader}>
                    <div style={styles.lineChartContainer}>
                        <svg width="100%" height="150" viewBox="0 0 400 150" style={{ overflow: 'visible' }}>
                            <path
                                d="M0,120 L50,110 L100,130 L150,90 L200,100 L250,60 L300,70 L350,30 L400,40"
                                fill="none"
                                stroke="#2563eb"
                                strokeWidth="3"
                                strokeLinecap="round"
                            />
                            <path
                                d="M0,120 L50,110 L100,130 L150,90 L200,100 L250,60 L300,70 L350,30 L400,40 L400,150 L0,150 Z"
                                fill="url(#gradient)"
                                opacity="0.1"
                            />
                            <defs>
                                <linearGradient id="gradient" x1="0" x2="0" y1="0" y2="1">
                                    <stop offset="0%" stopColor="#2563eb" />
                                    <stop offset="100%" stopColor="white" />
                                </linearGradient>
                            </defs>
                        </svg>
                        <div style={styles.chartLegend}>
                            <span>Oct</span><span>Nov</span><span>Dec</span><span>Jan</span><span>Feb</span><span>Mar</span>
                        </div>
                    </div>
                </Card>
            </div>

            {/* Action Center and Activity */}
            <div style={styles.bottomGrid}>
                <Card title="Action Center" style={styles.actionCard} headStyle={styles.cardHeader}>
                    <div style={styles.actionList}>
                        <ActionRow title="Projects needing configuration" count={3} onClick={() => navigate('/projects?status=INQUIRY')} />
                        <ActionRow title="Projects waiting for BOQ" count={2} onClick={() => navigate('/projects?status=CONFIGURED')} />
                        <ActionRow title="BOQs pending approval" count={5} onClick={() => navigate('/projects?status=BOQ_DRAFT')} />
                        <ActionRow title="Quotations ready to send" count={1} onClick={() => navigate('/projects?status=APPROVED')} />
                    </div>
                </Card>

                {/* <Card title="Recent Activity" style={styles.activityCard} headStyle={styles.cardHeader}>
                    <div style={styles.activityList}>
                        {activity.length === 0 ? (
                            <div style={styles.emptyActivity}>No recent activity found.</div>
                        ) : (
                            activity.map((log, idx) => (
                                <div key={log.id || idx} style={styles.activityItem}>
                                    <div style={styles.activityIcon}>
                                        <ClockCircleOutlined style={{ color: '#94a3b8' }} />
                                    </div>
                                    <div style={styles.activityContent}>
                                        <Text strong style={{ fontSize: '13px' }}>{log.action_type?.replace(/_/g, ' ')}</Text>
                                        <div style={{ fontSize: '12px', color: '#64748b' }}>
                                            {log.details || 'New activity logged'} {log.project_name ? `- ${log.project_name}` : ''}
                                        </div>
                                    </div>
                                    <div style={styles.activityTime}>{formatTime(log.created_at)}</div>
                                </div>
                            ))
                        )}
                    </div>
                </Card> */}
            </div>
        </div>
    );
};

interface KPICardProps {
    title: string;
    value: string | number;
    icon: React.ReactNode;
    color: string;
    subtext: string;
    onClick: () => void;
}

const KPICard = ({ title, value, icon, color, subtext, onClick }: KPICardProps) => (
    <Card hoverable onClick={onClick} style={styles.kpiCard} bodyStyle={{ padding: '20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
                <Text type="secondary" style={styles.kpiLabel}>{title}</Text>
                <div style={styles.kpiValue}>{value}</div>
                <Text style={styles.kpiSubtext}>{subtext}</Text>
            </div>
            <div style={{ ...styles.kpiIconWrapper, backgroundColor: `${color}15`, color: color }}>
                {icon}
            </div>
        </div>
    </Card>
);

interface ActionRowProps {
    title: string;
    count: number;
    onClick: () => void;
}

const ActionRow = ({ title, count, onClick }: ActionRowProps) => (
    <div style={styles.actionRow}>
        <div style={styles.actionTitle}>
            <Text strong>{title}</Text>
            <Badge count={count} style={{ backgroundColor: '#2563eb', marginLeft: '8px' }} />
        </div>
        <Button size="small" type="text" onClick={onClick} icon={<RightOutlined />}>Open</Button>
    </div>
);

const formatTime = (dateStr: string) => {
    if (!dateStr) return 'Just now';
    const date = new Date(dateStr);
    const now = new Date();
    const diff = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diff < 60) return 'Just now';
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    return date.toLocaleDateString();
};

const styles = {
    container: {
        padding: '32px',
        maxWidth: '1440px',
        margin: '0 auto',
        display: 'flex',
        flexDirection: 'column' as const,
        gap: '32px'
    },
    quickActionsBar: {
        position: 'fixed' as const,
        top: '20px',
        right: '40px',
        display: 'flex',
        gap: '12px',
        zIndex: 1000,
        backgroundColor: 'rgba(255, 255, 255, 0.8)',
        backdropFilter: 'blur(8px)',
        padding: '12px',
        borderRadius: '12px',
        boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
        border: '1px solid #e2e8f0'
    },
    header: {
        marginBottom: '40px'
    },
    kpiRow: {
        display: 'grid',
        gridTemplateColumns: 'repeat(5, 1fr)',
        gap: '20px'
    },
    kpiCard: {
        borderRadius: '12px',
        border: '1px solid #e2e8f0',
        boxShadow: '0 1px 3px rgba(0,0,0,0.02)'
    },
    kpiLabel: {
        fontSize: '13px',
        fontWeight: '600',
        display: 'block',
        marginBottom: '4px'
    },
    kpiValue: {
        fontSize: '24px',
        fontWeight: '800',
        color: '#1e293b',
        lineHeight: '1.2'
    },
    kpiSubtext: {
        fontSize: '11px',
        color: '#10b981',
        fontWeight: '600',
        marginTop: '4px'
    },
    kpiIconWrapper: {
        padding: '10px',
        borderRadius: '10px',
        fontSize: '20px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
    },
    mainGrid: {
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: '24px'
    },
    chartCard: {
        borderRadius: '12px',
        minHeight: '280px'
    },
    cardHeader: {
        fontSize: '16px',
        fontWeight: '700',
        borderBottom: '1px solid #f1f5f9'
    },
    funnelContainer: {
        display: 'flex',
        flexDirection: 'column' as const,
        gap: '16px',
        padding: '10px 0'
    },
    funnelStep: {
        display: 'flex',
        alignItems: 'center',
        gap: '16px'
    },
    funnelLabel: {
        width: '100px',
        fontSize: '13px',
        color: '#64748b'
    },
    funnelBarWrapper: {
        flex: 1,
        display: 'flex',
        alignItems: 'center',
        gap: '12px'
    },
    funnelBar: {
        height: '32px',
        borderRadius: '4px',
        transition: 'width 0.5s ease'
    },
    funnelCount: {
        fontSize: '14px',
        fontWeight: '700',
        color: '#1e293b'
    },
    lineChartContainer: {
        padding: '20px 0'
    },
    chartLegend: {
        display: 'flex',
        justifyContent: 'space-between',
        marginTop: '12px',
        fontSize: '11px',
        color: '#94a3b8'
    },
    bottomGrid: {
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: '24px'
    },
    actionCard: {
        borderRadius: '12px',
        minHeight: '340px'
    },
    actionList: {
        display: 'flex',
        flexDirection: 'column' as const,
        gap: '2px'
    },
    actionRow: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '12px 0',
        borderBottom: '1px solid #f1f5f9'
    },
    actionTitle: {
        display: 'flex',
        alignItems: 'center'
    },
    activityCard: {
        borderRadius: '12px',
        minHeight: '340px'
    },
    activityList: {
        display: 'flex',
        flexDirection: 'column' as const,
        gap: '16px'
    },
    activityItem: {
        display: 'flex',
        gap: '12px',
        alignItems: 'flex-start'
    },
    activityIcon: {
        marginTop: '2px'
    },
    activityContent: {
        flex: 1
    },
    activityTime: {
        fontSize: '11px',
        color: '#94a3b8'
    },
    emptyActivity: {
        textAlign: 'center' as const,
        padding: '40px',
        color: '#94a3b8'
    }
};

export default Dashboard;
