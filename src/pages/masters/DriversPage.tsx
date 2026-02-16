
import React, { useEffect, useState, useCallback } from 'react';
import { Table, Button, Input, Space, Tag, Modal, message, Card, Row, Col, Typography } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { driverService } from '../../services/driverService';
import type { Driver } from '../../services/driverService';
import DriverFormModal from '../../components/common/DriverFormModal';
import ActivityFAB from '../../components/common/ActivityFAB';
import { SearchOutlined, PlusOutlined, DownloadOutlined, EditOutlined, EyeOutlined } from '@ant-design/icons';

const { Title, Text } = Typography;

const DriversPage: React.FC = () => {
    const [drivers, setDrivers] = useState<Driver[]>([]);
    const [total, setTotal] = useState(0);
    const [loading, setLoading] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [searchText, setSearchText] = useState('');

    // Modal states
    const [isFormModalVisible, setIsFormModalVisible] = useState(false);
    const [isDetailVisible, setIsDetailVisible] = useState(false);
    const [selectedDriver, setSelectedDriver] = useState<Driver | null>(null);
    const [formMode, setFormMode] = useState<'create' | 'edit'>('create');

    const fetchDrivers = useCallback(async (page: number, search: string) => {
        setLoading(true);
        try {
            const data = await driverService.getDrivers(search, page, undefined, 20);
            setDrivers(data.results);
            setTotal(data.count);
        } catch (err) {
            message.error('Failed to load drivers');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchDrivers(currentPage, searchText);
    }, [currentPage, searchText, fetchDrivers]);

    const handleSearch = (value: string) => {
        setSearchText(value);
        setCurrentPage(1);
    };

    const handleCreate = () => {
        setFormMode('create');
        setSelectedDriver(null);
        setIsFormModalVisible(true);
    };

    const handleEdit = (record: Driver) => {
        setFormMode('edit');
        setSelectedDriver(record);
        setIsFormModalVisible(true);
    };

    const handleView = async (record: Driver) => {
        setSelectedDriver(record);
        setIsDetailVisible(true);
        // Optionally fetch full details if record is partial
        try {
            const full = await driverService.getDriver(record.id);
            setSelectedDriver(full);
        } catch (e) {
            console.error('Failed to load full driver details');
        }
    };

    const handleFormSaved = async (formData: Partial<Driver>) => {
        try {
            if (formMode === 'create') {
                await driverService.createDriver(formData);
                message.success('Driver created successfully');
            } else {
                if (selectedDriver) {
                    await driverService.updateDriver(selectedDriver.id, formData);
                    message.success('Driver updated successfully');
                }
            }
            setIsFormModalVisible(false);
            fetchDrivers(currentPage, searchText);
        } catch (err) {
            // Form component handles specific field errors, here we handle general API failure
            message.error('Operation failed');
        }
    };

    const columns: ColumnsType<Driver> = [
        {
            title: 'Make',
            dataIndex: 'driver_make',
            key: 'driver_make',
            sorter: true,
        },
        {
            title: 'Driver Code',
            dataIndex: 'driver_code',
            key: 'driver_code',
            render: (code) => <Text code>{code}</Text>,
        },
        {
            title: 'Max Wattage',
            dataIndex: 'max_wattage',
            key: 'max_wattage',
            render: (w) => `${w}W`,
        },
        {
            title: 'IP Class',
            dataIndex: 'ip_class',
            key: 'ip_class',
        },
        {
            title: 'Status',
            dataIndex: 'is_active',
            key: 'is_active',
            render: (active: boolean) => (
                <Tag color={active ? 'green' : 'red'}>
                    {active ? 'ACTIVE' : 'INACTIVE'}
                </Tag>
            ),
        },
        {
            title: 'Action',
            key: 'action',
            width: 150,
            render: (_, record) => (
                <Space size="middle">
                    <Button
                        type="text"
                        icon={<EyeOutlined />}
                        onClick={() => handleView(record)}
                    />
                    <Button
                        type="text"
                        icon={<EditOutlined />}
                        onClick={() => handleEdit(record)}
                    />
                </Space>
            ),
        },
    ];

    return (
        <div style={{ padding: '24px' }}>
            <Card variant="borderless" className="table-card">
                <Row justify="space-between" align="middle" style={{ marginBottom: 24 }}>
                    <Col>
                        <Title level={4} style={{ margin: 0 }}>Driver Master</Title>
                        <Text type="secondary">{total} Total Items recorded</Text>
                    </Col>
                    <Col>
                        <Space size="middle">
                            <Input.Search
                                placeholder="Search make, code..."
                                allowClear
                                onSearch={handleSearch}
                                style={{ width: 300 }}
                                enterButton={<SearchOutlined />}
                            />
                            <Button
                                type="primary"
                                icon={<PlusOutlined />}
                                onClick={handleCreate}
                            >
                                New Driver
                            </Button>
                            <Button icon={<DownloadOutlined />}>Export</Button>
                        </Space>
                    </Col>
                </Row>

                <Table
                    columns={columns}
                    dataSource={drivers}
                    rowKey="id"
                    loading={loading}
                    pagination={{
                        current: currentPage,
                        pageSize: 20,
                        total: total,
                        onChange: (page) => setCurrentPage(page),
                        showSizeChanger: false,
                    }}
                    onRow={(record) => ({
                        onDoubleClick: () => handleView(record),
                    })}
                />
            </Card>

            {/* Detail Modal */}
            <Modal
                title={`Driver Details: ${selectedDriver?.driver_code || ''}`}
                open={isDetailVisible}
                onCancel={() => setIsDetailVisible(false)}
                footer={[
                    <Button key="close" onClick={() => setIsDetailVisible(false)}>Close</Button>
                ]}
                width={1000}
            >
                {selectedDriver && (
                    <Row gutter={24}>
                        <Col span={24}>
                            <Card title="Specifications" size="small">
                                <Row gutter={[16, 16]}>
                                    <Col span={12}>
                                        <Text type="secondary">Make</Text>
                                        <div><Text strong>{selectedDriver.driver_make}</Text></div>
                                    </Col>
                                    <Col span={12}>
                                        <Text type="secondary">Code</Text>
                                        <div><Text code>{selectedDriver.driver_code}</Text></div>
                                    </Col>
                                    <Col span={12}>
                                        <Text type="secondary">Max Wattage</Text>
                                        <div><Text strong>{selectedDriver.max_wattage}W</Text></div>
                                    </Col>
                                    <Col span={12}>
                                        <Text type="secondary">IP Class</Text>
                                        <div><Text strong>{selectedDriver.ip_class}</Text></div>
                                    </Col>
                                    <Col span={12}>
                                        <Text type="secondary">Protocol</Text>
                                        <div><Text strong>{selectedDriver.protocol || 'N/A'}</Text></div>
                                    </Col>
                                    <Col span={12}>
                                        <Text type="secondary">Status</Text>
                                        <div>
                                            <Tag color={selectedDriver.is_active ? 'green' : 'red'}>
                                                {selectedDriver.is_active ? 'ACTIVE' : 'INACTIVE'}
                                            </Tag>
                                        </div>
                                    </Col>
                                </Row>
                            </Card>
                        </Col>
                    </Row>
                )}
            </Modal>

            {/* Form Modal */}
            <DriverFormModal
                isOpen={isFormModalVisible}
                mode={formMode}
                initialValues={selectedDriver || undefined}
                onClose={() => setIsFormModalVisible(false)}
                onSaved={handleFormSaved}
            />
            {selectedDriver && isDetailVisible && (
                <ActivityFAB entity="driver" entityId={selectedDriver.id} />
            )}
        </div>
    );
};

export default DriversPage;
