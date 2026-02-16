
import React, { useEffect, useState, useCallback } from 'react';
import { Table, Button, Input, Space, Tag, Modal, message, Card, Row, Col, Typography } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { accessoryService } from '../../services/accessoryService';
import type { Accessory } from '../../services/accessoryService';
import AccessoryFormModal from '../../components/common/AccessoryFormModal';
import ActivityFAB from '../../components/common/ActivityFAB';
import { SearchOutlined, PlusOutlined, DownloadOutlined, EditOutlined, EyeOutlined } from '@ant-design/icons';
import { useRef } from 'react';
const { Title, Text } = Typography;

const AccessoriesPage: React.FC = () => {
    const [accessories, setAccessories] = useState<Accessory[]>([]);
    const [total, setTotal] = useState(0);
    const [loading, setLoading] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [searchText, setSearchText] = useState('');
const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    // Modal states
    const [isFormModalVisible, setIsFormModalVisible] = useState(false);
    const [isDetailVisible, setIsDetailVisible] = useState(false);
    const [selectedAccessory, setSelectedAccessory] = useState<Accessory | null>(null);
    const [formMode, setFormMode] = useState<'create' | 'edit'>('create');

    const fetchAccessories = useCallback(async (page: number, search: string) => {
        setLoading(true);
        try {
            const data = await accessoryService.getAccessories(search, page, undefined, 20);
            setAccessories(data.results);
            setTotal(data.count);
        } catch (err) {
            message.error('Failed to load accessories');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchAccessories(currentPage, searchText);
    }, [currentPage, searchText, fetchAccessories]);

     const handleSearch = (value: string) => {
        setCurrentPage(1);
        
        // Clear previous debounce timer
        if (debounceTimerRef.current) {
            clearTimeout(debounceTimerRef.current);
        }
        
        // Set new debounce timer (500ms delay)
        debounceTimerRef.current = setTimeout(() => {
            setSearchText(value);
        }, 500);
    };


    const handleCreate = () => {
        setFormMode('create');
        setSelectedAccessory(null);
        setIsFormModalVisible(true);
    };

    const handleEdit = (record: Accessory) => {
        setFormMode('edit');
        setSelectedAccessory(record);
        setIsFormModalVisible(true);
    };

    const handleView = async (record: Accessory) => {
        setSelectedAccessory(record);
        setIsDetailVisible(true);
        try {
            const full = await accessoryService.getAccessory(record.id);
            setSelectedAccessory(full);
        } catch (e) {
            console.error('Failed to load full accessory details');
        }
    };

    const handleFormSaved = async (formData: Partial<Accessory>) => {
        try {
            if (formMode === 'create') {
                await accessoryService.createAccessory(formData);
                message.success('Accessory created successfully');
            } else {
                if (selectedAccessory) {
                    await accessoryService.updateAccessory(selectedAccessory.id, formData);
                    message.success('Accessory updated successfully');
                }
            }
            setIsFormModalVisible(false);
            fetchAccessories(currentPage, searchText);
        } catch (err) {
            message.error('Operation failed');
        }
    };

    const columns: ColumnsType<Accessory> = [
        {
            title: 'Accessory Name',
            dataIndex: 'accessory_name',
            key: 'accessory_name',
            sorter: true,
        },
        {
            title: 'Type',
            dataIndex: 'accessory_type',
            key: 'accessory_type',
            render: (type) => <Tag color="blue">{type}</Tag>,
        },
        {
            title: 'Compatible IP',
            dataIndex: 'compatible_ip_class',
            key: 'compatible_ip_class',
            render: (ip) => ip || 'All',
        },
        {
            title: 'Category',
            dataIndex: 'accessory_category',
            key: 'accessory_category',
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
                        <Title level={4} style={{ margin: 0 }}>Accessory Master</Title>
                        <Text type="secondary">{total} Total Items recorded</Text>
                    </Col>
                    <Col>
                        <Space size="middle">
                            <Input.Search
                                placeholder="Search name, category..."
                                allowClear
                                onChange={(e) => handleSearch(e.target.value)}
                                style={{ width: 300 }}
                                enterButton={<SearchOutlined />}
                            />
                            <Button
                                type="primary"
                                icon={<PlusOutlined />}
                                onClick={handleCreate}
                            >
                                New Accessory
                            </Button>
                            <Button icon={<DownloadOutlined />}>Export</Button>
                        </Space>
                    </Col>
                </Row>

                <Table
                    columns={columns}
                    dataSource={accessories}
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
                title={`Accessory Details: ${selectedAccessory?.accessory_name || ''}`}
                open={isDetailVisible}
                onCancel={() => setIsDetailVisible(false)}
                footer={[
                    <Button key="close" onClick={() => setIsDetailVisible(false)}>Close</Button>
                ]}
                width={1000}
            >
                {selectedAccessory && (
                    <Row gutter={24}>
                        <Col span={24}>
                            <Card title="Product Information" size="small">
                                <Row gutter={[16, 16]}>
                                    <Col span={12}>
                                        <Text type="secondary">Name</Text>
                                        <div><Text strong>{selectedAccessory.accessory_name}</Text></div>
                                    </Col>
                                    <Col span={12}>
                                        <Text type="secondary">Category</Text>
                                        <div><Text strong>{selectedAccessory.accessory_category}</Text></div>
                                    </Col>
                                    <Col span={12}>
                                        <Text type="secondary">Type</Text>
                                        <div><Tag color="blue">{selectedAccessory.accessory_type}</Tag></div>
                                    </Col>
                                    <Col span={12}>
                                        <Text type="secondary">Compatible IP Class</Text>
                                        <div><Text strong>{selectedAccessory.compatible_ip_class || 'All'}</Text></div>
                                    </Col>
                                    <Col span={12}>
                                        <Text type="secondary">Mounting</Text>
                                        <div><Text strong>{selectedAccessory.compatible_mounting}</Text></div>
                                    </Col>
                                    <Col span={12}>
                                        <Text type="secondary">Base Price</Text>
                                        <div><Text strong>₹ {selectedAccessory.base_price.toLocaleString()}</Text></div>
                                    </Col>
                                    <Col span={24}>
                                        <Text type="secondary">Description</Text>
                                        <div style={{ marginTop: 4 }}>
                                            <Text italic>{selectedAccessory.description || 'No description provided.'}</Text>
                                        </div>
                                    </Col>
                                </Row>
                            </Card>
                        </Col>
                    </Row>
                )}
            </Modal>

            {/* Form Modal */}
            <AccessoryFormModal
                isOpen={isFormModalVisible}
                mode={formMode}
                initialValues={selectedAccessory || undefined}
                onClose={() => setIsFormModalVisible(false)}
                onSaved={handleFormSaved}
            />
            {selectedAccessory && isDetailVisible && (
                <ActivityFAB entity="accessory" entityId={selectedAccessory.id} />
            )}
        </div>
    );
};

export default AccessoriesPage;
