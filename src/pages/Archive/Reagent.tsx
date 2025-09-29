import React, { useState, useEffect } from 'react'
import {
  Card,
  Table,
  Button,
  Space,
  Modal,
  Form,
  Input,
  Select,
  DatePicker,
  Tag,
  Popconfirm,
  message,
  Row,
  Col,
  Typography,
  Tooltip,
  InputNumber
} from 'antd'
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  SearchOutlined,
  ExportOutlined,
  WarningOutlined
} from '@ant-design/icons'
import type { ColumnsType } from 'antd/es/table'
import { useAppStore } from '../../store'
import dayjs from 'dayjs'

const { Option } = Select
const { TextArea } = Input
const { Title } = Typography

/**
 * 试剂信息接口
 */
interface Reagent {
  id: string
  name: string
  code: string
  brand: string
  specification: string
  lotNumber: string
  expiryDate: string
  storageCondition: string
  quantity: number
  unit: string
  price: number
  supplier: string
  category: string
  status: 'normal' | 'expired' | 'low_stock' | 'out_of_stock'
  description?: string
  createdAt: string
  updatedAt: string
}

/**
 * 试剂档案管理页面组件
 * 提供试剂信息的增删改查功能，包括库存管理和过期提醒
 */
const ReagentManagement: React.FC = () => {
  const { setBreadcrumbs } = useAppStore()
  const [reagents, setReagents] = useState<Reagent[]>([])
  const [loading, setLoading] = useState(false)
  const [modalVisible, setModalVisible] = useState(false)
  const [editingReagent, setEditingReagent] = useState<Reagent | null>(null)
  const [searchText, setSearchText] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('')
  const [categoryFilter, setCategoryFilter] = useState<string>('')
  const [form] = Form.useForm()

  useEffect(() => {
    setBreadcrumbs([
      { title: '首页' }, 
      { title: '基础档案' }, 
      { title: '试剂档案' }
    ])
    loadReagents()
  }, [setBreadcrumbs])

  /**
   * 加载试剂列表数据
   */
  const loadReagents = async () => {
    setLoading(true)
    try {
      // 模拟API调用
      await new Promise(resolve => setTimeout(resolve, 800))
      
      const mockReagents: Reagent[] = [
        {
          id: '1',
          name: 'Taq DNA聚合酶',
          code: 'REA001',
          brand: 'Thermo Fisher',
          specification: '500U',
          lotNumber: 'TF20240301',
          expiryDate: '2024-12-31',
          storageCondition: '-20°C',
          quantity: 25,
          unit: '支',
          price: 580.00,
          supplier: '赛默飞世尔科技',
          category: '酶类试剂',
          status: 'normal',
          description: '高保真DNA聚合酶，适用于PCR扩增',
          createdAt: '2024-01-15T10:00:00Z',
          updatedAt: '2024-02-20T14:30:00Z'
        },
        {
          id: '2',
          name: 'dNTP混合液',
          code: 'REA002',
          brand: 'NEB',
          specification: '10mM',
          lotNumber: 'NEB20240215',
          expiryDate: '2024-08-15',
          storageCondition: '-20°C',
          quantity: 5,
          unit: '管',
          price: 320.00,
          supplier: '新英格兰生物实验室',
          category: '核酸试剂',
          status: 'low_stock',
          description: '四种dNTP等摩尔混合液',
          createdAt: '2024-02-01T09:15:00Z',
          updatedAt: '2024-02-25T16:45:00Z'
        },
        {
          id: '3',
          name: 'DNA Marker',
          code: 'REA003',
          brand: 'Takara',
          specification: '100bp-10kb',
          lotNumber: 'TK20231201',
          expiryDate: '2024-06-30',
          storageCondition: '-20°C',
          quantity: 0,
          unit: '支',
          price: 180.00,
          supplier: '宝生物工程',
          category: '分子标准',
          status: 'out_of_stock',
          description: 'DNA分子量标准，100bp-10kb',
          createdAt: '2023-12-05T11:20:00Z',
          updatedAt: '2024-02-28T10:15:00Z'
        },
        {
          id: '4',
          name: 'SYBR Green染料',
          code: 'REA004',
          brand: 'Applied Biosystems',
          specification: '1ml',
          lotNumber: 'AB20240101',
          expiryDate: '2024-04-30',
          storageCondition: '4°C避光',
          quantity: 12,
          unit: '瓶',
          price: 450.00,
          supplier: '应用生物系统',
          category: '荧光染料',
          status: 'expired',
          description: 'qPCR荧光染料，高灵敏度',
          createdAt: '2024-01-10T08:30:00Z',
          updatedAt: '2024-03-01T12:00:00Z'
        }
      ]
      
      setReagents(mockReagents)
    } catch (error) {
      message.error('获取试剂列表失败')
    } finally {
      setLoading(false)
    }
  }

  /**
   * 打开新增/编辑模态框
   */
  const openModal = (reagent?: Reagent) => {
    setEditingReagent(reagent || null)
    if (reagent) {
      form.setFieldsValue({
        ...reagent,
        expiryDate: dayjs(reagent.expiryDate)
      })
    } else {
      form.resetFields()
    }
    setModalVisible(true)
  }

  /**
   * 关闭模态框
   */
  const closeModal = () => {
    setModalVisible(false)
    setEditingReagent(null)
    form.resetFields()
  }

  /**
   * 保存试剂信息
   */
  const saveReagent = async (values: any) => {
    try {
      setLoading(true)
      
      // 模拟API调用
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      const reagentData = {
        ...values,
        expiryDate: values.expiryDate.format('YYYY-MM-DD'),
        status: getReagentStatus(values.quantity, values.expiryDate.format('YYYY-MM-DD'))
      }

      if (editingReagent) {
        // 更新试剂
        const updatedReagent = {
          ...editingReagent,
          ...reagentData,
          updatedAt: new Date().toISOString()
        }
        setReagents(reagents.map(r => r.id === editingReagent.id ? updatedReagent : r))
        message.success('试剂信息更新成功')
      } else {
        // 新增试剂
        const newReagent: Reagent = {
          id: Date.now().toString(),
          ...reagentData,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }
        setReagents([...reagents, newReagent])
        message.success('试剂添加成功')
      }

      closeModal()
    } catch (error) {
      message.error('操作失败')
    } finally {
      setLoading(false)
    }
  }

  /**
   * 删除试剂
   */
  const deleteReagent = async (id: string) => {
    try {
      setLoading(true)
      
      // 模拟API调用
      await new Promise(resolve => setTimeout(resolve, 500))
      
      setReagents(reagents.filter(r => r.id !== id))
      message.success('试剂删除成功')
    } catch (error) {
      message.error('删除失败')
    } finally {
      setLoading(false)
    }
  }

  /**
   * 根据库存和过期时间判断试剂状态
   */
  const getReagentStatus = (quantity: number, expiryDate: string): Reagent['status'] => {
    if (quantity === 0) return 'out_of_stock'
    if (quantity <= 10) return 'low_stock'
    if (dayjs(expiryDate).isBefore(dayjs(), 'day')) return 'expired'
    return 'normal'
  }

  /**
   * 获取状态标签颜色
   */
  const getStatusColor = (status: Reagent['status']) => {
    const colorMap = {
      normal: 'green',
      expired: 'red',
      low_stock: 'orange',
      out_of_stock: 'volcano'
    }
    return colorMap[status]
  }

  /**
   * 获取状态文本
   */
  const getStatusText = (status: Reagent['status']) => {
    const textMap = {
      normal: '正常',
      expired: '已过期',
      low_stock: '库存不足',
      out_of_stock: '缺货'
    }
    return textMap[status]
  }

  /**
   * 过滤试剂列表
   */
  const filteredReagents = reagents.filter(reagent => {
    const matchesSearch = !searchText || 
      reagent.name.toLowerCase().includes(searchText.toLowerCase()) ||
      reagent.code.toLowerCase().includes(searchText.toLowerCase()) ||
      reagent.brand.toLowerCase().includes(searchText.toLowerCase()) ||
      reagent.supplier.toLowerCase().includes(searchText.toLowerCase())
    
    const matchesStatus = !statusFilter || reagent.status === statusFilter
    const matchesCategory = !categoryFilter || reagent.category === categoryFilter
    
    return matchesSearch && matchesStatus && matchesCategory
  })

  /**
   * 表格列定义
   */
  const columns: ColumnsType<Reagent> = [
    {
      title: '试剂编码',
      dataIndex: 'code',
      key: 'code',
      width: 100,
      fixed: 'left'
    },
    {
      title: '试剂名称',
      dataIndex: 'name',
      key: 'name',
      width: 150,
      fixed: 'left'
    },
    {
      title: '品牌',
      dataIndex: 'brand',
      key: 'brand',
      width: 120
    },
    {
      title: '规格',
      dataIndex: 'specification',
      key: 'specification',
      width: 100
    },
    {
      title: '批号',
      dataIndex: 'lotNumber',
      key: 'lotNumber',
      width: 120
    },
    {
      title: '有效期',
      dataIndex: 'expiryDate',
      key: 'expiryDate',
      width: 110,
      render: (date: string, record: Reagent) => {
        const isExpired = dayjs(date).isBefore(dayjs(), 'day')
        const isExpiringSoon = dayjs(date).diff(dayjs(), 'day') <= 30 && !isExpired
        
        return (
          <span style={{ 
            color: isExpired ? '#ff4d4f' : isExpiringSoon ? '#fa8c16' : undefined 
          }}>
            {dayjs(date).format('YYYY-MM-DD')}
            {(isExpired || isExpiringSoon) && (
              <WarningOutlined style={{ marginLeft: 4, color: '#fa8c16' }} />
            )}
          </span>
        )
      }
    },
    {
      title: '存储条件',
      dataIndex: 'storageCondition',
      key: 'storageCondition',
      width: 100
    },
    {
      title: '库存',
      dataIndex: 'quantity',
      key: 'quantity',
      width: 80,
      render: (quantity: number, record: Reagent) => (
        <span style={{ 
          color: quantity === 0 ? '#ff4d4f' : quantity <= 10 ? '#fa8c16' : undefined 
        }}>
          {quantity} {record.unit}
        </span>
      )
    },
    {
      title: '单价',
      dataIndex: 'price',
      key: 'price',
      width: 80,
      render: (price: number) => `¥${price.toFixed(2)}`
    },
    {
      title: '供应商',
      dataIndex: 'supplier',
      key: 'supplier',
      width: 120,
      ellipsis: true
    },
    {
      title: '分类',
      dataIndex: 'category',
      key: 'category',
      width: 100
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 80,
      render: (status: Reagent['status']) => (
        <Tag color={getStatusColor(status)}>
          {getStatusText(status)}
        </Tag>
      )
    },
    {
      title: '操作',
      key: 'action',
      width: 120,
      fixed: 'right',
      render: (_: any, record: Reagent) => (
        <Space>
          <Tooltip title="编辑">
            <Button 
              type="text" 
              icon={<EditOutlined />} 
              onClick={() => openModal(record)}
              size="small"
            />
          </Tooltip>
          <Popconfirm
            title="确定要删除这个试剂吗？"
            onConfirm={() => deleteReagent(record.id)}
            okText="确定"
            cancelText="取消"
          >
            <Tooltip title="删除">
              <Button 
                type="text" 
                danger 
                icon={<DeleteOutlined />}
                size="small"
              />
            </Tooltip>
          </Popconfirm>
        </Space>
      )
    }
  ]

  return (
    <div>
      <Title level={3} style={{ marginBottom: 24 }}>
        试剂档案
      </Title>

      <Card className="content-card">
        {/* 搜索和筛选区域 */}
        <div style={{ marginBottom: 16 }}>
          <Space wrap>
            <Input
              placeholder="搜索试剂名称、编码、品牌或供应商"
              prefix={<SearchOutlined />}
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              style={{ width: 280 }}
            />
            <Select
              placeholder="试剂分类"
              value={categoryFilter}
              onChange={setCategoryFilter}
              style={{ width: 120 }}
              allowClear
            >
              <Option value="酶类试剂">酶类试剂</Option>
              <Option value="核酸试剂">核酸试剂</Option>
              <Option value="分子标准">分子标准</Option>
              <Option value="荧光染料">荧光染料</Option>
              <Option value="缓冲液">缓冲液</Option>
              <Option value="其他">其他</Option>
            </Select>
            <Select
              placeholder="状态"
              value={statusFilter}
              onChange={setStatusFilter}
              style={{ width: 100 }}
              allowClear
            >
              <Option value="normal">正常</Option>
              <Option value="expired">已过期</Option>
              <Option value="low_stock">库存不足</Option>
              <Option value="out_of_stock">缺货</Option>
            </Select>
            <Button type="primary" icon={<PlusOutlined />} onClick={() => openModal()}>
              新增试剂
            </Button>
            <Button icon={<ExportOutlined />}>
              导出
            </Button>
          </Space>
        </div>

        {/* 试剂列表表格 */}
        <Table
          columns={columns}
          dataSource={filteredReagents}
          rowKey="id"
          loading={loading}
          scroll={{ x: 1500 }}
          pagination={{
            total: filteredReagents.length,
            pageSize: 10,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total) => `共 ${total} 条记录`
          }}
        />
      </Card>

      {/* 新增/编辑试剂模态框 */}
      <Modal
        title={editingReagent ? '编辑试剂' : '新增试剂'}
        open={modalVisible}
        onCancel={closeModal}
        footer={null}
        width={800}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={saveReagent}
        >
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="code"
                label="试剂编码"
                rules={[{ required: true, message: '请输入试剂编码' }]}
              >
                <Input placeholder="请输入试剂编码" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="name"
                label="试剂名称"
                rules={[{ required: true, message: '请输入试剂名称' }]}
              >
                <Input placeholder="请输入试剂名称" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="brand"
                label="品牌"
                rules={[{ required: true, message: '请输入品牌' }]}
              >
                <Input placeholder="请输入品牌" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="specification"
                label="规格"
                rules={[{ required: true, message: '请输入规格' }]}
              >
                <Input placeholder="请输入规格" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="lotNumber"
                label="批号"
                rules={[{ required: true, message: '请输入批号' }]}
              >
                <Input placeholder="请输入批号" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="expiryDate"
                label="有效期"
                rules={[{ required: true, message: '请选择有效期' }]}
              >
                <DatePicker style={{ width: '100%' }} />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="storageCondition"
                label="存储条件"
                rules={[{ required: true, message: '请输入存储条件' }]}
              >
                <Input placeholder="如：-20°C、4°C避光等" />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                name="quantity"
                label="库存数量"
                rules={[{ required: true, message: '请输入库存数量' }]}
              >
                <InputNumber min={0} style={{ width: '100%' }} />
              </Form.Item>
            </Col>
            <Col span={4}>
              <Form.Item
                name="unit"
                label="单位"
                rules={[{ required: true, message: '请输入单位' }]}
              >
                <Select placeholder="单位">
                  <Option value="支">支</Option>
                  <Option value="管">管</Option>
                  <Option value="瓶">瓶</Option>
                  <Option value="盒">盒</Option>
                  <Option value="ml">ml</Option>
                  <Option value="μl">μl</Option>
                  <Option value="g">g</Option>
                  <Option value="mg">mg</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={8}>
              <Form.Item
                name="price"
                label="单价（元）"
                rules={[{ required: true, message: '请输入单价' }]}
              >
                <InputNumber min={0} precision={2} style={{ width: '100%' }} />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                name="supplier"
                label="供应商"
                rules={[{ required: true, message: '请输入供应商' }]}
              >
                <Input placeholder="请输入供应商" />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                name="category"
                label="试剂分类"
                rules={[{ required: true, message: '请选择试剂分类' }]}
              >
                <Select placeholder="请选择试剂分类">
                  <Option value="酶类试剂">酶类试剂</Option>
                  <Option value="核酸试剂">核酸试剂</Option>
                  <Option value="分子标准">分子标准</Option>
                  <Option value="荧光染料">荧光染料</Option>
                  <Option value="缓冲液">缓冲液</Option>
                  <Option value="其他">其他</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            name="description"
            label="描述"
          >
            <TextArea rows={3} placeholder="请输入试剂描述信息" />
          </Form.Item>

          <Form.Item style={{ textAlign: 'right', marginBottom: 0 }}>
            <Space>
              <Button onClick={closeModal}>
                取消
              </Button>
              <Button type="primary" htmlType="submit" loading={loading}>
                {editingReagent ? '更新' : '添加'}
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  )
}

export default ReagentManagement