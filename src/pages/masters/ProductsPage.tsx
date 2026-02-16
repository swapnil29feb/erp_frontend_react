
import React, { useEffect, useState, useCallback, useRef } from 'react';
import { Table, Button, Input, Space, Tag, Modal, message, Card, Row, Col, Typography, Image } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { productService } from '../../services/productService';
import type { Product } from '../../services/productService';
import ProductFormModal from '../../components/common/ProductFormModal';
import ActivityFAB from '../../components/common/ActivityFAB';
import { SearchOutlined, PlusOutlined, DownloadOutlined, EditOutlined, EyeOutlined, CopyOutlined } from '@ant-design/icons';

const { Title, Text, Paragraph } = Typography;

const ProductsPage: React.FC = () => {
    const [products, setProducts] = useState<Product[]>([]);
    const [total, setTotal] = useState(0);
    const [loading, setLoading] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [searchText, setSearchText] = useState('');
const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    // Modal states
    const [isFormModalVisible, setIsFormModalVisible] = useState(false);
    const [isDetailVisible, setIsDetailVisible] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
    const [formMode, setFormMode] = useState<'create' | 'edit'>('create');

    const fetchProducts = useCallback(async (page: number, search: string) => {
        setLoading(true);
        try {
            const data = await productService.getProducts(search, page, undefined, 20);
            setProducts(data.results);
            setTotal(data.count);
        } catch (err) {
            message.error('Failed to load products');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchProducts(currentPage, searchText);
    }, [currentPage, searchText, fetchProducts]);

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
        setSelectedProduct(null);
        setIsFormModalVisible(true);
    };

    const handleEdit = (record: Product) => {
        setFormMode('edit');
        setSelectedProduct(record);
        setIsFormModalVisible(true);
    };

    const handleView = async (record: Product) => {
        setSelectedProduct(record);
        setIsDetailVisible(true);
        try {
            const full = await productService.getProduct(record.id);
            setSelectedProduct(full);
        } catch (e) {
            console.error('Failed to load full product details');
        }
    };

    const handleFormSaved = async (formData: Partial<Product>) => {
    try {

        // 🔹 CLEAN DATA (remove "" and convert numbers)
        const cleaned: any = {};
        Object.entries(formData).forEach(([key, value]) => {
            if (value === "" || value === undefined || value === null) return;

            // convert numeric strings to numbers
            if (!isNaN(value as any) && value !== true && value !== false) {
                cleaned[key] = Number(value);
            } else {
                cleaned[key] = value;
            }
        });

        if (formMode === 'create') {
            await productService.createProduct(cleaned);
            message.success('Product created successfully');
        } else {
            if (selectedProduct) {
                await productService.updateProduct(selectedProduct.id, cleaned);
                message.success('Product updated successfully');
            }
        }

        setIsFormModalVisible(false);
        fetchProducts(currentPage, searchText);

    } catch (err) {
        console.log(err);
        message.error('Operation failed');
    }
};

    const handleCopyCode = (code?: string) => {
        if (code) {
            navigator.clipboard.writeText(code);
            message.success('Order code copied!');
        }
    };

    const columns: ColumnsType<Product> = [
        {
            title: 'Visual',
            dataIndex: 'visual_image',
            key: 'visual_image',
            width: 80,
            render: (img) => img ? <Image src={img} width={40} fallback="https://via.placeholder.com/40?text=💡" /> : <span>💡</span>,
        },
        {
            title: 'Make',
            dataIndex: 'make',
            key: 'make',
            sorter: true,
        },
        {
            title: 'Order Code',
            dataIndex: 'order_code',
            key: 'order_code',
            render: (code) => <Text code>{code}</Text>,
        },
        {
            title: 'Wattage',
            dataIndex: 'wattage',
            key: 'wattage',
            render: (w) => `${w}W`,
        },
        {
            title: 'CCT',
            dataIndex: 'cct',
            key: 'cct',
            render: (cct, record) => record.cct_kelvin || cct,
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
            width: 120,
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
                        <Title level={4} style={{ margin: 0 }}>Product Master</Title>
                        <Text type="secondary">{total} Total Items recorded</Text>
                    </Col>
                    <Col>
                        <Space size="middle">
                            <Input.Search
                                placeholder="Search make, code, description..."
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
                                New Product
                            </Button>
                            <Button icon={<DownloadOutlined />}>Export</Button>
                        </Space>
                    </Col>
                </Row>

                <Table
                    columns={columns}
                    dataSource={products}
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
                title={`Product Details: ${selectedProduct?.make || ''}`}
                open={isDetailVisible}
                onCancel={() => setIsDetailVisible(false)}
                footer={[
                    <Button key="copy" icon={<CopyOutlined />} onClick={() => handleCopyCode(selectedProduct?.order_code)}>Copy Code</Button>,
                    <Button key="close" type="primary" onClick={() => setIsDetailVisible(false)}>Close</Button>
                ]}
                width={1000}
            >
                {selectedProduct && (
                    <Row gutter={24}>
                        <Col span={24}>
                            <Card title="Technical Specifications" size="small" style={{ marginBottom: 20 }}>
                                <Row gutter={[16, 24]}>
                                    <Col span={24}>
                                        <div style={{ textAlign: 'center', background: '#f8fafc', padding: 20, borderRadius: 8 }}>
                                            <Image src={selectedProduct.visual_image} height={200} fallback="https://via.placeholder.com/200?text=Visual+Unavailable" />
                                        </div>
                                    </Col>
                                    <Col span={12}>
                                        <Text type="secondary">Order Code</Text>
                                        <div><Text code>{selectedProduct.order_code}</Text></div>
                                    </Col>
                                    <Col span={12}>
                                        <Text type="secondary">Make</Text>
                                        <div><Text strong>{selectedProduct.make}</Text></div>
                                    </Col>
                                    <Col span={8}>
                                        <Text type="secondary">Wattage</Text>
                                        <div><Text strong>{selectedProduct.wattage}W</Text></div>
                                    </Col>
                                    <Col span={8}>
                                        <Text type="secondary">Lumen Output</Text>
                                        <div><Text strong>{selectedProduct.lumen_output} lm</Text></div>
                                    </Col>
                                    <Col span={8}>
                                        <Text type="secondary">CCT</Text>
                                        <div><Text strong>{selectedProduct.cct_kelvin || selectedProduct.cct}K</Text></div>
                                    </Col>
                                    <Col span={8}>
                                        <Text type="secondary">Beam Angle</Text>
                                        <div><Text strong>{selectedProduct.beam_angle_degree || selectedProduct.beam_angle}°</Text></div>
                                    </Col>
                                    <Col span={8}>
                                        <Text type="secondary">IP Rating</Text>
                                        <div><Text strong>IP{selectedProduct.ip_rating || '20'}</Text></div>
                                    </Col>
                                    <Col span={8}>
                                        <Text type="secondary">Status</Text>
                                        <div>
                                            <Tag color={selectedProduct.is_active ? 'green' : 'red'}>
                                                {selectedProduct.is_active ? 'ACTIVE' : 'INACTIVE'}
                                            </Tag>
                                        </div>
                                    </Col>
                                    <Col span={24}>
                                        <Text type="secondary">Description</Text>
                                        <Paragraph style={{ marginTop: 4 }}>
                                            {selectedProduct.description || 'No description provided.'}
                                        </Paragraph>
                                    </Col>
                                </Row>
                            </Card>
                        </Col>
                    </Row>
                )}
            </Modal>

            {/* Form Modal */}
            <ProductFormModal
                isOpen={isFormModalVisible}
                mode={formMode}
                initialValues={selectedProduct || undefined}
                onClose={() => setIsFormModalVisible(false)}
                onSaved={handleFormSaved}
            />
            {selectedProduct && isDetailVisible && (
                <ActivityFAB entity="product" entityId={selectedProduct.id} />
            )}
        </div>
    );
};

export default ProductsPage;
