import React, { useState, useEffect } from 'react'
import { 
  Card, 
  Table, 
  Input, 
  Button, 
  Space, 
  Tag, 
  Modal, 
  Form, 
  Select, 
  Row,
  Col,
  Tooltip,
  message,
  Steps,
  Descriptions,
  Transfer,
  Divider,
  InputNumber,
  DatePicker,
  Checkbox,
  Alert,
  Badge,
  Progress,
  Tabs,
  List,
  Avatar,
  Typography
} from 'antd'
import { 
  PlusOutlined, 
  EditOutlined, 
  DeleteOutlined,
  EyeOutlined,
  ExperimentOutlined,
  UserOutlined,
  CalendarOutlined,
  BarcodeOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  WarningOutlined,
  FileTextOutlined,
  SettingOutlined
} from '@ant-design/icons'
import type { ColumnsType } from 'antd/es/table'
import type { TransferDirection } from 'antd/es/transfer'
import dayjs from 'dayjs'

const { Search } = Input
const { Option } = Select
const { TextArea } = Input
const { Step } = Steps
const { TabPane } = Tabs
const { Text, Title } = Typography

/**
 * 批次状态类型
 */
type BatchStatus = 'draft' | 'planning' | 'ready' | 'in_progress' | 'completed' | 'cancelled'

/**
 * 实验类型
 */
type ExperimentType = 'preprocessing' | 'library_construction' | 'sequencing' | 'analysis'

/**
 * 样本信息接口
 */
interface Sample {
  id: string
  sampleCode: string
  sampleName: string
  sampleType: string
  projectName: string
  clientName: string
  receivedDate: string
  status: string
  volume: number
  concentration?: number
  quality?: string
  notes?: string
}

/**
 * 试剂信息接口
 */
interface Reagent {
  id: string
  name: string
  type: string
  brand: string
  catalogNumber: string
  lotNumber: string
  expiryDate: string
  quantity: number
  unit: string
  storageCondition: string
  cost: number
}

/**
 * 设备信息接口
 */
interface Equipment {
  id: string
  name: string
  model: string
  type: string
  status: string
  location: string
  capacity: number
  currentLoad: number
  nextAvailable: string
}

/**
 * 实验批次接口
 */
interface ExperimentBatch {
  id: string
  batchCode: string
  batchName: string
  experimentType: ExperimentType
  status: BatchStatus
  sampleCount: number
  samples: Sample[]
  reagents: Reagent[]
  equipment: Equipment[]
  operator: string
  plannedStartDate: string
  plannedEndDate: string
  actualStartDate?: string
  actualEndDate?: string
  estimatedDuration: number
  priority: 'low' | 'medium' | 'high' | 'urgent'
  notes?: string
  createdBy: string
  createdTime: string
  updatedTime: string
  protocol?: string
  qualityRequirements?: string[]
  costEstimate: number
  progress: number
}

/**
 * 实验批次创建页面组件
 * 
 * 功能特性：
 * - 样本选择和批次组织
 * - 试剂和设备资源分配
 * - 实验流程规划
 * - 批次进度跟踪
 * - 成本估算和资源优化
 */
const BatchCreation: React.FC = () => {
  // 状态管理
  const [loading, setLoading] = useState(false)
  const [batchesData, setBatchesData] = useState<ExperimentBatch[]>([])
  const [samplesData, setSamplesData] = useState<Sample[]>([])
  const [reagentsData, setReagentsData] = useState<Reagent[]>([])
  const [equipmentData, setEquipmentData] = useState<Equipment[]>([])
  const [selectedBatch, setSelectedBatch] = useState<ExperimentBatch | null>(null)
  const [createModalVisible, setCreateModalVisible] = useState(false)
  const [detailModalVisible, setDetailModalVisible] = useState(false)
  const [editingBatch, setEditingBatch] = useState<ExperimentBatch | null>(null)
  const [currentStep, setCurrentStep] = useState(0)
  const [selectedSamples, setSelectedSamples] = useState<string[]>([])
  const [selectedReagents, setSelectedReagents] = useState<string[]>([])
  const [selectedEquipment, setSelectedEquipment] = useState<string[]>([])
  const [searchText, setSearchText] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('')
  const [typeFilter, setTypeFilter] = useState<string>('')
  const [form] = Form.useForm()

  /**
   * 模拟样本数据
   */
  const mockSamplesData: Sample[] = [
    {
      id: '1',
      sampleCode: 'S001',
      sampleName: '土壤样本A',
      sampleType: '土壤',
      projectName: '环境微生物多样性分析',
      clientName: '环保局',
      receivedDate: '2024-01-15',
      status: 'received',
      volume: 5.0,
      concentration: 120.5,
      quality: 'good',
      notes: '样本状态良好'
    },
    {
      id: '2',
      sampleCode: 'S002',
      sampleName: '水体样本B',
      sampleType: '水体',
      projectName: '水质监测项目',
      clientName: '水务局',
      receivedDate: '2024-01-16',
      status: 'received',
      volume: 10.0,
      concentration: 85.3,
      quality: 'excellent'
    },
    {
      id: '3',
      sampleCode: 'S003',
      sampleName: '植物样本C',
      sampleType: '植物',
      projectName: '植物基因组研究',
      clientName: '农科院',
      receivedDate: '2024-01-17',
      status: 'received',
      volume: 3.5,
      concentration: 95.8,
      quality: 'good'
    }
  ]

  /**
   * 模拟试剂数据
   */
  const mockReagentsData: Reagent[] = [
    {
      id: '1',
      name: 'DNA提取试剂盒',
      type: '提取试剂',
      brand: 'QIAGEN',
      catalogNumber: '69504',
      lotNumber: 'LOT001',
      expiryDate: '2024-12-31',
      quantity: 50,
      unit: '次',
      storageCondition: '4°C',
      cost: 25.0
    },
    {
      id: '2',
      name: 'PCR扩增试剂',
      type: '扩增试剂',
      brand: 'Thermo Fisher',
      catalogNumber: 'K0171',
      lotNumber: 'LOT002',
      expiryDate: '2024-10-15',
      quantity: 100,
      unit: '反应',
      storageCondition: '-20°C',
      cost: 15.0
    },
    {
      id: '3',
      name: '文库构建试剂盒',
      type: '文库试剂',
      brand: 'Illumina',
      catalogNumber: '20020595',
      lotNumber: 'LOT003',
      expiryDate: '2024-08-30',
      quantity: 24,
      unit: '样本',
      storageCondition: '-20°C',
      cost: 120.0
    }
  ]

  /**
   * 模拟设备数据
   */
  const mockEquipmentData: Equipment[] = [
    {
      id: '1',
      name: '离心机A',
      model: 'Centrifuge 5424R',
      type: '离心机',
      status: 'available',
      location: '实验室A',
      capacity: 24,
      currentLoad: 0,
      nextAvailable: '2024-01-20 09:00:00'
    },
    {
      id: '2',
      name: 'PCR仪B',
      model: 'T100 Thermal Cycler',
      type: 'PCR仪',
      status: 'busy',
      location: '实验室B',
      capacity: 96,
      currentLoad: 48,
      nextAvailable: '2024-01-21 14:00:00'
    },
    {
      id: '3',
      name: '测序仪C',
      model: 'NovaSeq 6000',
      type: '测序仪',
      status: 'available',
      location: '测序中心',
      capacity: 4,
      currentLoad: 0,
      nextAvailable: '2024-01-22 08:00:00'
    }
  ]

  /**
   * 模拟批次数据
   */
  const mockBatchesData: ExperimentBatch[] = [
    {
      id: '1',
      batchCode: 'BATCH001',
      batchName: '环境样本前处理批次',
      experimentType: 'preprocessing',
      status: 'in_progress',
      sampleCount: 12,
      samples: mockSamplesData.slice(0, 2),
      reagents: mockReagentsData.slice(0, 1),
      equipment: mockEquipmentData.slice(0, 1),
      operator: '张三',
      plannedStartDate: '2024-01-20',
      plannedEndDate: '2024-01-22',
      actualStartDate: '2024-01-20',
      estimatedDuration: 48,
      priority: 'high',
      notes: '紧急项目，需要优先处理',
      createdBy: '李四',
      createdTime: '2024-01-19 10:00:00',
      updatedTime: '2024-01-20 09:30:00',
      protocol: 'DNA提取标准流程v2.1',
      qualityRequirements: ['DNA浓度>50ng/μL', 'OD260/280比值1.8-2.0'],
      costEstimate: 1250.0,
      progress: 65
    }
  ]

  /**
   * 组件初始化
   */
  useEffect(() => {
    loadBatchesData()
    loadSamplesData()
    loadReagentsData()
    loadEquipmentData()
  }, [])

  /**
   * 加载批次数据
   */
  const loadBatchesData = async () => {
    setLoading(true)
    try {
      // 模拟API调用
      await new Promise(resolve => setTimeout(resolve, 1000))
      setBatchesData(mockBatchesData)
    } catch (error) {
      message.error('加载批次数据失败')
    } finally {
      setLoading(false)
    }
  }

  /**
   * 加载样本数据
   */
  const loadSamplesData = async () => {
    try {
      await new Promise(resolve => setTimeout(resolve, 500))
      setSamplesData(mockSamplesData)
    } catch (error) {
      message.error('加载样本数据失败')
    }
  }

  /**
   * 加载试剂数据
   */
  const loadReagentsData = async () => {
    try {
      await new Promise(resolve => setTimeout(resolve, 500))
      setReagentsData(mockReagentsData)
    } catch (error) {
      message.error('加载试剂数据失败')
    }
  }

  /**
   * 加载设备数据
   */
  const loadEquipmentData = async () => {
    try {
      await new Promise(resolve => setTimeout(resolve, 500))
      setEquipmentData(mockEquipmentData)
    } catch (error) {
      message.error('加载设备数据失败')
    }
  }

  /**
   * 筛选后的数据
   */
  const filteredData = batchesData.filter(batch => {
    const matchesSearch = !searchText || 
      batch.batchName.toLowerCase().includes(searchText.toLowerCase()) ||
      batch.batchCode.toLowerCase().includes(searchText.toLowerCase()) ||
      batch.operator.toLowerCase().includes(searchText.toLowerCase())
    
    const matchesStatus = !statusFilter || batch.status === statusFilter
    const matchesType = !typeFilter || batch.experimentType === typeFilter
    
    return matchesSearch && matchesStatus && matchesType
  })

  /**
   * 状态标签渲染
   */
  const renderStatusTag = (status: BatchStatus) => {
    const statusConfig = {
      draft: { color: 'default', text: '草稿' },
      planning: { color: 'processing', text: '规划中' },
      ready: { color: 'success', text: '就绪' },
      in_progress: { color: 'processing', text: '进行中' },
      completed: { color: 'success', text: '已完成' },
      cancelled: { color: 'error', text: '已取消' }
    }
    
    const config = statusConfig[status]
    return <Tag color={config.color}>{config.text}</Tag>
  }

  /**
   * 实验类型标签渲染
   */
  const renderTypeTag = (type: ExperimentType) => {
    const typeConfig = {
      preprocessing: { color: 'blue', text: '前处理' },
      library_construction: { color: 'green', text: '文库构建' },
      sequencing: { color: 'purple', text: '测序' },
      analysis: { color: 'orange', text: '分析' }
    }
    
    const config = typeConfig[type]
    return <Tag color={config.color}>{config.text}</Tag>
  }

  /**
   * 优先级标签渲染
   */
  const renderPriorityTag = (priority: string) => {
    const priorityConfig = {
      low: { color: 'default', text: '低' },
      medium: { color: 'processing', text: '中' },
      high: { color: 'warning', text: '高' },
      urgent: { color: 'error', text: '紧急' }
    }
    
    const config = priorityConfig[priority as keyof typeof priorityConfig]
    return <Tag color={config.color}>{config.text}</Tag>
  }

  /**
   * 表格列定义
   */
  const columns: ColumnsType<ExperimentBatch> = [
    {
      title: '批次编号',
      dataIndex: 'batchCode',
      key: 'batchCode',
      width: 120,
      render: (text) => <Text strong>{text}</Text>
    },
    {
      title: '批次名称',
      dataIndex: 'batchName',
      key: 'batchName',
      width: 200,
      ellipsis: true
    },
    {
      title: '实验类型',
      dataIndex: 'experimentType',
      key: 'experimentType',
      width: 100,
      render: renderTypeTag
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: renderStatusTag
    },
    {
      title: '样本数量',
      dataIndex: 'sampleCount',
      key: 'sampleCount',
      width: 100,
      render: (count) => <Badge count={count} showZero color="blue" />
    },
    {
      title: '优先级',
      dataIndex: 'priority',
      key: 'priority',
      width: 80,
      render: renderPriorityTag
    },
    {
      title: '操作员',
      dataIndex: 'operator',
      key: 'operator',
      width: 100
    },
    {
      title: '计划开始',
      dataIndex: 'plannedStartDate',
      key: 'plannedStartDate',
      width: 120,
      render: (date) => dayjs(date).format('MM-DD')
    },
    {
      title: '进度',
      dataIndex: 'progress',
      key: 'progress',
      width: 120,
      render: (progress) => (
        <Progress 
          percent={progress} 
          size="small" 
          status={progress === 100 ? 'success' : 'active'}
        />
      )
    },
    {
      title: '成本估算',
      dataIndex: 'costEstimate',
      key: 'costEstimate',
      width: 100,
      render: (cost) => `¥${cost.toFixed(0)}`
    },
    {
      title: '操作',
      key: 'action',
      width: 150,
      fixed: 'right',
      render: (_, record) => (
        <Space size="small">
          <Tooltip title="查看详情">
            <Button 
              type="text" 
              icon={<EyeOutlined />} 
              onClick={() => handleViewDetail(record)}
            />
          </Tooltip>
          <Tooltip title="编辑">
            <Button 
              type="text" 
              icon={<EditOutlined />} 
              onClick={() => handleEdit(record)}
            />
          </Tooltip>
          <Tooltip title="删除">
            <Button 
              type="text" 
              danger 
              icon={<DeleteOutlined />} 
              onClick={() => handleDelete(record)}
            />
          </Tooltip>
        </Space>
      )
    }
  ]

  /**
   * 创建新批次
   */
  const handleCreate = () => {
    setEditingBatch(null)
    setCurrentStep(0)
    setSelectedSamples([])
    setSelectedReagents([])
    setSelectedEquipment([])
    form.resetFields()
    setCreateModalVisible(true)
  }

  /**
   * 编辑批次
   */
  const handleEdit = (batch: ExperimentBatch) => {
    setEditingBatch(batch)
    setSelectedSamples(batch.samples.map(s => s.id))
    setSelectedReagents(batch.reagents.map(r => r.id))
    setSelectedEquipment(batch.equipment.map(e => e.id))
    form.setFieldsValue({
      batchName: batch.batchName,
      experimentType: batch.experimentType,
      priority: batch.priority,
      operator: batch.operator,
      plannedStartDate: dayjs(batch.plannedStartDate),
      plannedEndDate: dayjs(batch.plannedEndDate),
      protocol: batch.protocol,
      notes: batch.notes
    })
    setCreateModalVisible(true)
  }

  /**
   * 查看详情
   */
  const handleViewDetail = (batch: ExperimentBatch) => {
    setSelectedBatch(batch)
    setDetailModalVisible(true)
  }

  /**
   * 删除批次
   */
  const handleDelete = (batch: ExperimentBatch) => {
    Modal.confirm({
      title: '确认删除',
      content: `确定要删除批次 "${batch.batchName}" 吗？`,
      onOk: async () => {
        try {
          // 模拟API调用
          await new Promise(resolve => setTimeout(resolve, 500))
          setBatchesData(prev => prev.filter(item => item.id !== batch.id))
          message.success('删除成功')
        } catch (error) {
          message.error('删除失败')
        }
      }
    })
  }

  /**
   * 保存批次
   */
  const handleSave = async (values: any) => {
    try {
      // 验证必要字段
      if (selectedSamples.length === 0) {
        message.error('请至少选择一个样本')
        return
      }

      // 模拟API调用
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      const selectedSampleObjects = samplesData.filter(s => selectedSamples.includes(s.id))
      const selectedReagentObjects = reagentsData.filter(r => selectedReagents.includes(r.id))
      const selectedEquipmentObjects = equipmentData.filter(e => selectedEquipment.includes(e.id))
      
      // 计算成本估算
      const reagentCost = selectedReagentObjects.reduce((sum, r) => sum + r.cost, 0)
      const costEstimate = reagentCost * selectedSamples.length
      
      if (editingBatch) {
        // 更新
        const updatedBatch: ExperimentBatch = {
          ...editingBatch,
          ...values,
          samples: selectedSampleObjects,
          reagents: selectedReagentObjects,
          equipment: selectedEquipmentObjects,
          sampleCount: selectedSamples.length,
          costEstimate,
          updatedTime: dayjs().format('YYYY-MM-DD HH:mm:ss'),
          plannedStartDate: values.plannedStartDate.format('YYYY-MM-DD'),
          plannedEndDate: values.plannedEndDate.format('YYYY-MM-DD')
        }
        
        setBatchesData(prev => prev.map(item => 
          item.id === editingBatch.id ? updatedBatch : item
        ))
        message.success('更新成功')
      } else {
        // 新增
        const newBatch: ExperimentBatch = {
          id: Date.now().toString(),
          batchCode: `BATCH${String(Date.now()).slice(-6)}`,
          ...values,
          samples: selectedSampleObjects,
          reagents: selectedReagentObjects,
          equipment: selectedEquipmentObjects,
          sampleCount: selectedSamples.length,
          status: 'draft' as BatchStatus,
          costEstimate,
          progress: 0,
          createdBy: '当前用户',
          createdTime: dayjs().format('YYYY-MM-DD HH:mm:ss'),
          updatedTime: dayjs().format('YYYY-MM-DD HH:mm:ss'),
          plannedStartDate: values.plannedStartDate.format('YYYY-MM-DD'),
          plannedEndDate: values.plannedEndDate.format('YYYY-MM-DD')
        }
        
        setBatchesData(prev => [...prev, newBatch])
        message.success('创建成功')
      }
      
      setCreateModalVisible(false)
      form.resetFields()
    } catch (error) {
      message.error('保存失败')
    }
  }

  /**
   * 步骤切换
   */
  const handleStepChange = (step: number) => {
    setCurrentStep(step)
  }

  /**
   * 样本选择Transfer组件数据源
   */
  const sampleTransferData = samplesData.map(sample => ({
    key: sample.id,
    title: `${sample.sampleCode} - ${sample.sampleName}`,
    description: `${sample.sampleType} | ${sample.projectName}`,
    disabled: sample.status !== 'received'
  }))

  return (
    <div style={{ padding: '24px' }}>
      {/* 页面标题和统计 */}
      <Row gutter={16} style={{ marginBottom: 16 }}>
        <Col span={6}>
          <Card size="small">
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#1890ff' }}>
                {batchesData.length}
              </div>
              <div style={{ color: '#666', marginTop: 4 }}>总批次数</div>
            </div>
          </Card>
        </Col>
        <Col span={6}>
          <Card size="small">
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#52c41a' }}>
                {batchesData.filter(b => b.status === 'in_progress').length}
              </div>
              <div style={{ color: '#666', marginTop: 4 }}>进行中</div>
            </div>
          </Card>
        </Col>
        <Col span={6}>
          <Card size="small">
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#faad14' }}>
                {batchesData.filter(b => b.status === 'ready').length}
              </div>
              <div style={{ color: '#666', marginTop: 4 }}>待开始</div>
            </div>
          </Card>
        </Col>
        <Col span={6}>
          <Card size="small">
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#722ed1' }}>
                {batchesData.reduce((sum, b) => sum + b.sampleCount, 0)}
              </div>
              <div style={{ color: '#666', marginTop: 4 }}>总样本数</div>
            </div>
          </Card>
        </Col>
      </Row>

      {/* 搜索和操作栏 */}
      <Card size="small" style={{ marginBottom: 16 }}>
        <Row gutter={16} align="middle">
          <Col span={6}>
            <Search
              placeholder="搜索批次名称、编号或操作员"
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              onSearch={loadBatchesData}
            />
          </Col>
          <Col span={3}>
            <Select
              placeholder="状态筛选"
              value={statusFilter}
              onChange={setStatusFilter}
              allowClear
              style={{ width: '100%' }}
            >
              <Option value="draft">草稿</Option>
              <Option value="planning">规划中</Option>
              <Option value="ready">就绪</Option>
              <Option value="in_progress">进行中</Option>
              <Option value="completed">已完成</Option>
              <Option value="cancelled">已取消</Option>
            </Select>
          </Col>
          <Col span={3}>
            <Select
              placeholder="实验类型"
              value={typeFilter}
              onChange={setTypeFilter}
              allowClear
              style={{ width: '100%' }}
            >
              <Option value="preprocessing">前处理</Option>
              <Option value="library_construction">文库构建</Option>
              <Option value="sequencing">测序</Option>
              <Option value="analysis">分析</Option>
            </Select>
          </Col>
          <Col span={8}>
            <Space>
              <Button type="primary" icon={<PlusOutlined />} onClick={handleCreate}>
                创建批次
              </Button>
              <Button onClick={loadBatchesData} loading={loading}>
                刷新数据
              </Button>
            </Space>
          </Col>
        </Row>
      </Card>

      {/* 批次列表 */}
      <Card title="实验批次列表" size="small">
        <Table
          columns={columns}
          dataSource={filteredData}
          rowKey="id"
          loading={loading}
          scroll={{ x: 1600 }}
          pagination={{
            total: filteredData.length,
            pageSize: 10,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total) => `共 ${total} 条记录`
          }}
        />
      </Card>

      {/* 创建/编辑批次模态框 */}
      <Modal
        title={editingBatch ? '编辑实验批次' : '创建实验批次'}
        open={createModalVisible}
        onCancel={() => setCreateModalVisible(false)}
        footer={null}
        width={1000}
        destroyOnClose
      >
        <Steps current={currentStep} style={{ marginBottom: 24 }}>
          <Step title="基本信息" icon={<FileTextOutlined />} />
          <Step title="样本选择" icon={<BarcodeOutlined />} />
          <Step title="资源配置" icon={<SettingOutlined />} />
          <Step title="确认创建" icon={<CheckCircleOutlined />} />
        </Steps>

        <Form
          form={form}
          layout="vertical"
          onFinish={handleSave}
        >
          {/* 步骤1: 基本信息 */}
          {currentStep === 0 && (
            <div>
              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item
                    name="batchName"
                    label="批次名称"
                    rules={[{ required: true, message: '请输入批次名称' }]}
                  >
                    <Input placeholder="请输入批次名称" />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item
                    name="experimentType"
                    label="实验类型"
                    rules={[{ required: true, message: '请选择实验类型' }]}
                  >
                    <Select placeholder="请选择实验类型">
                      <Option value="preprocessing">前处理</Option>
                      <Option value="library_construction">文库构建</Option>
                      <Option value="sequencing">测序</Option>
                      <Option value="analysis">分析</Option>
                    </Select>
                  </Form.Item>
                </Col>
              </Row>
              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item
                    name="priority"
                    label="优先级"
                    rules={[{ required: true, message: '请选择优先级' }]}
                  >
                    <Select placeholder="请选择优先级">
                      <Option value="low">低</Option>
                      <Option value="medium">中</Option>
                      <Option value="high">高</Option>
                      <Option value="urgent">紧急</Option>
                    </Select>
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item
                    name="operator"
                    label="操作员"
                    rules={[{ required: true, message: '请输入操作员' }]}
                  >
                    <Input placeholder="请输入操作员姓名" />
                  </Form.Item>
                </Col>
              </Row>
              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item
                    name="plannedStartDate"
                    label="计划开始日期"
                    rules={[{ required: true, message: '请选择计划开始日期' }]}
                  >
                    <DatePicker style={{ width: '100%' }} />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item
                    name="plannedEndDate"
                    label="计划结束日期"
                    rules={[{ required: true, message: '请选择计划结束日期' }]}
                  >
                    <DatePicker style={{ width: '100%' }} />
                  </Form.Item>
                </Col>
              </Row>
              <Form.Item
                name="protocol"
                label="实验协议"
              >
                <Input placeholder="请输入实验协议名称或版本" />
              </Form.Item>
              <Form.Item
                name="notes"
                label="备注"
              >
                <TextArea rows={3} placeholder="请输入备注信息" />
              </Form.Item>
            </div>
          )}

          {/* 步骤2: 样本选择 */}
          {currentStep === 1 && (
            <div>
              <Alert
                message="样本选择"
                description="从已接收的样本中选择需要进行实验的样本。只有状态为'已接收'的样本可以被选择。"
                type="info"
                showIcon
                style={{ marginBottom: 16 }}
              />
              <Transfer
                dataSource={sampleTransferData}
                targetKeys={selectedSamples}
                onChange={setSelectedSamples}
                render={item => item.title}
                titles={['可选样本', '已选样本']}
                listStyle={{
                  width: 400,
                  height: 400,
                }}
                showSearch
                searchPlaceholder="搜索样本"
              />
              <div style={{ marginTop: 16 }}>
                <Text strong>已选择样本数量: {selectedSamples.length}</Text>
              </div>
            </div>
          )}

          {/* 步骤3: 资源配置 */}
          {currentStep === 2 && (
            <div>
              <Tabs defaultActiveKey="reagents">
                <TabPane tab="试剂配置" key="reagents">
                  <List
                    dataSource={reagentsData}
                    renderItem={reagent => (
                      <List.Item
                        actions={[
                          <Checkbox
                            checked={selectedReagents.includes(reagent.id)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setSelectedReagents([...selectedReagents, reagent.id])
                              } else {
                                setSelectedReagents(selectedReagents.filter(id => id !== reagent.id))
                              }
                            }}
                          >
                            选择
                          </Checkbox>
                        ]}
                      >
                        <List.Item.Meta
                          title={reagent.name}
                          description={
                            <div>
                              <div>品牌: {reagent.brand} | 货号: {reagent.catalogNumber}</div>
                              <div>批号: {reagent.lotNumber} | 有效期: {reagent.expiryDate}</div>
                              <div>库存: {reagent.quantity} {reagent.unit} | 单价: ¥{reagent.cost}</div>
                            </div>
                          }
                        />
                      </List.Item>
                    )}
                  />
                </TabPane>
                <TabPane tab="设备配置" key="equipment">
                  <List
                    dataSource={equipmentData}
                    renderItem={equipment => (
                      <List.Item
                        actions={[
                          <Checkbox
                            checked={selectedEquipment.includes(equipment.id)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setSelectedEquipment([...selectedEquipment, equipment.id])
                              } else {
                                setSelectedEquipment(selectedEquipment.filter(id => id !== equipment.id))
                              }
                            }}
                            disabled={equipment.status !== 'available'}
                          >
                            选择
                          </Checkbox>
                        ]}
                      >
                        <List.Item.Meta
                          avatar={<Avatar icon={<ExperimentOutlined />} />}
                          title={
                            <div>
                              {equipment.name}
                              <Tag color={equipment.status === 'available' ? 'green' : 'red'} style={{ marginLeft: 8 }}>
                                {equipment.status === 'available' ? '可用' : '忙碌'}
                              </Tag>
                            </div>
                          }
                          description={
                            <div>
                              <div>型号: {equipment.model} | 位置: {equipment.location}</div>
                              <div>容量: {equipment.capacity} | 当前负载: {equipment.currentLoad}</div>
                              <div>下次可用: {equipment.nextAvailable}</div>
                            </div>
                          }
                        />
                      </List.Item>
                    )}
                  />
                </TabPane>
              </Tabs>
            </div>
          )}

          {/* 步骤4: 确认创建 */}
          {currentStep === 3 && (
            <div>
              <Alert
                message="批次信息确认"
                description="请确认以下批次信息无误后提交创建。"
                type="success"
                showIcon
                style={{ marginBottom: 16 }}
              />
              <Descriptions bordered column={2}>
                <Descriptions.Item label="批次名称">
                  {form.getFieldValue('batchName')}
                </Descriptions.Item>
                <Descriptions.Item label="实验类型">
                  {form.getFieldValue('experimentType')}
                </Descriptions.Item>
                <Descriptions.Item label="优先级">
                  {form.getFieldValue('priority')}
                </Descriptions.Item>
                <Descriptions.Item label="操作员">
                  {form.getFieldValue('operator')}
                </Descriptions.Item>
                <Descriptions.Item label="计划开始">
                  {form.getFieldValue('plannedStartDate')?.format('YYYY-MM-DD')}
                </Descriptions.Item>
                <Descriptions.Item label="计划结束">
                  {form.getFieldValue('plannedEndDate')?.format('YYYY-MM-DD')}
                </Descriptions.Item>
                <Descriptions.Item label="样本数量">
                  {selectedSamples.length} 个
                </Descriptions.Item>
                <Descriptions.Item label="试剂数量">
                  {selectedReagents.length} 种
                </Descriptions.Item>
                <Descriptions.Item label="设备数量">
                  {selectedEquipment.length} 台
                </Descriptions.Item>
                <Descriptions.Item label="成本估算">
                  ¥{(reagentsData.filter(r => selectedReagents.includes(r.id)).reduce((sum, r) => sum + r.cost, 0) * selectedSamples.length).toFixed(2)}
                </Descriptions.Item>
              </Descriptions>
            </div>
          )}

          {/* 步骤导航 */}
          <div style={{ marginTop: 24, textAlign: 'right' }}>
            <Space>
              {currentStep > 0 && (
                <Button onClick={() => handleStepChange(currentStep - 1)}>
                  上一步
                </Button>
              )}
              {currentStep < 3 && (
                <Button type="primary" onClick={() => handleStepChange(currentStep + 1)}>
                  下一步
                </Button>
              )}
              {currentStep === 3 && (
                <Button type="primary" htmlType="submit" loading={loading}>
                  {editingBatch ? '更新批次' : '创建批次'}
                </Button>
              )}
              <Button onClick={() => setCreateModalVisible(false)}>
                取消
              </Button>
            </Space>
          </div>
        </Form>
      </Modal>

      {/* 批次详情模态框 */}
      <Modal
        title="批次详情"
        open={detailModalVisible}
        onCancel={() => setDetailModalVisible(false)}
        footer={[
          <Button key="close" onClick={() => setDetailModalVisible(false)}>
            关闭
          </Button>
        ]}
        width={800}
      >
        {selectedBatch && (
          <Tabs defaultActiveKey="basic">
            <TabPane tab="基本信息" key="basic">
              <Descriptions bordered column={2}>
                <Descriptions.Item label="批次编号">{selectedBatch.batchCode}</Descriptions.Item>
                <Descriptions.Item label="批次名称">{selectedBatch.batchName}</Descriptions.Item>
                <Descriptions.Item label="实验类型">{renderTypeTag(selectedBatch.experimentType)}</Descriptions.Item>
                <Descriptions.Item label="状态">{renderStatusTag(selectedBatch.status)}</Descriptions.Item>
                <Descriptions.Item label="优先级">{renderPriorityTag(selectedBatch.priority)}</Descriptions.Item>
                <Descriptions.Item label="操作员">{selectedBatch.operator}</Descriptions.Item>
                <Descriptions.Item label="样本数量">{selectedBatch.sampleCount}</Descriptions.Item>
                <Descriptions.Item label="进度">{selectedBatch.progress}%</Descriptions.Item>
                <Descriptions.Item label="计划开始">{selectedBatch.plannedStartDate}</Descriptions.Item>
                <Descriptions.Item label="计划结束">{selectedBatch.plannedEndDate}</Descriptions.Item>
                <Descriptions.Item label="成本估算">¥{selectedBatch.costEstimate.toFixed(2)}</Descriptions.Item>
                <Descriptions.Item label="创建时间">{selectedBatch.createdTime}</Descriptions.Item>
                <Descriptions.Item label="备注" span={2}>{selectedBatch.notes || '无'}</Descriptions.Item>
              </Descriptions>
            </TabPane>
            <TabPane tab="样本清单" key="samples">
              <Table
                dataSource={selectedBatch.samples}
                columns={[
                  { title: '样本编号', dataIndex: 'sampleCode', key: 'sampleCode' },
                  { title: '样本名称', dataIndex: 'sampleName', key: 'sampleName' },
                  { title: '样本类型', dataIndex: 'sampleType', key: 'sampleType' },
                  { title: '项目名称', dataIndex: 'projectName', key: 'projectName' },
                  { title: '体积', dataIndex: 'volume', key: 'volume', render: (vol) => `${vol} mL` },
                  { title: '浓度', dataIndex: 'concentration', key: 'concentration', render: (conc) => conc ? `${conc} ng/μL` : '-' }
                ]}
                rowKey="id"
                size="small"
                pagination={false}
              />
            </TabPane>
            <TabPane tab="资源配置" key="resources">
              <div>
                <Title level={5}>试剂清单</Title>
                <List
                  dataSource={selectedBatch.reagents}
                  renderItem={reagent => (
                    <List.Item>
                      <List.Item.Meta
                        title={reagent.name}
                        description={`${reagent.brand} | ${reagent.catalogNumber} | 批号: ${reagent.lotNumber}`}
                      />
                      <div>¥{reagent.cost}</div>
                    </List.Item>
                  )}
                />
                
                <Divider />
                
                <Title level={5}>设备清单</Title>
                <List
                  dataSource={selectedBatch.equipment}
                  renderItem={equipment => (
                    <List.Item>
                      <List.Item.Meta
                        title={equipment.name}
                        description={`${equipment.model} | ${equipment.location}`}
                      />
                      <Tag color="green">可用</Tag>
                    </List.Item>
                  )}
                />
              </div>
            </TabPane>
          </Tabs>
        )}
      </Modal>
    </div>
  )
}

export default BatchCreation