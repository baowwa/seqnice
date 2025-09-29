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
  InputNumber,
  Row,
  Col,
  Tooltip,
  Popconfirm,
  message,
  Steps,
  Descriptions,
  Upload,
  Progress,
  Alert,
  Timeline,
  Divider,
  Statistic
} from 'antd'
import { 
  SearchOutlined, 
  PlusOutlined, 
  EditOutlined, 
  DeleteOutlined,
  EyeOutlined,
  PlayCircleOutlined,
  PauseCircleOutlined,
  CheckCircleOutlined,
  ExclamationCircleOutlined,
  UploadOutlined,
  DownloadOutlined,
  ExperimentOutlined,
  ClockCircleOutlined,
  FileTextOutlined
} from '@ant-design/icons'
import type { ColumnsType } from 'antd/es/table'
import type { UploadProps } from 'antd/es/upload'
import dayjs from 'dayjs'

const { Search } = Input
const { Option } = Select
const { TextArea } = Input
const { Step } = Steps

/**
 * 前处理状态枚举
 */
type PreprocessingStatus = 'pending' | 'in_progress' | 'completed' | 'failed' | 'paused'

/**
 * 前处理方法类型
 */
type PreprocessingMethod = 'dna_extraction' | 'rna_extraction' | 'protein_extraction' | 'purification' | 'concentration' | 'fragmentation'

/**
 * 前处理记录接口
 */
interface PreprocessingRecord {
  id: string
  sampleCode: string
  sampleName: string
  sampleType: string
  method: PreprocessingMethod
  protocol: string
  status: PreprocessingStatus
  progress: number
  startTime: string
  endTime?: string
  operator: string
  equipment: string
  inputAmount: number
  outputAmount?: number
  yield?: number
  concentration?: number
  purity?: number
  qualityScore?: number
  notes?: string
  attachments?: string[]
}

/**
 * 前处理步骤接口
 */
interface PreprocessingStep {
  id: string
  stepName: string
  description: string
  duration: number
  temperature?: number
  speed?: number
  reagents: string[]
  status: 'pending' | 'in_progress' | 'completed' | 'failed'
  startTime?: string
  endTime?: string
  notes?: string
}

/**
 * 前处理页面组件
 * 
 * 功能特性：
 * - 前处理流程管理
 * - 实时进度跟踪
 * - 质量控制监控
 * - 协议标准化
 * - 设备使用记录
 */
const Preprocessing: React.FC = () => {
  // 状态管理
  const [loading, setLoading] = useState(false)
  const [preprocessingData, setPreprocessingData] = useState<PreprocessingRecord[]>([])
  const [selectedRecord, setSelectedRecord] = useState<PreprocessingRecord | null>(null)
  const [modalVisible, setModalVisible] = useState(false)
  const [detailModalVisible, setDetailModalVisible] = useState(false)
  const [protocolModalVisible, setProtocolModalVisible] = useState(false)
  const [editingRecord, setEditingRecord] = useState<PreprocessingRecord | null>(null)
  const [searchText, setSearchText] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('')
  const [methodFilter, setMethodFilter] = useState<string>('')
  const [form] = Form.useForm()

  /**
   * 模拟前处理数据
   */
  const mockPreprocessingData: PreprocessingRecord[] = [
    {
      id: '1',
      sampleCode: 'S2024001',
      sampleName: '土壤样本A',
      sampleType: '土壤',
      method: 'dna_extraction',
      protocol: 'CTAB法DNA提取',
      status: 'in_progress',
      progress: 65,
      startTime: '2024-01-15 09:00:00',
      operator: '张三',
      equipment: 'DNA提取仪A',
      inputAmount: 5.0,
      outputAmount: 3.2,
      yield: 64,
      concentration: 125.5,
      purity: 1.85,
      qualityScore: 85,
      notes: '样本质量良好，按标准流程进行'
    },
    {
      id: '2',
      sampleCode: 'S2024002',
      sampleName: '水体样本B',
      sampleType: '水体',
      method: 'rna_extraction',
      protocol: 'TRIzol法RNA提取',
      status: 'completed',
      progress: 100,
      startTime: '2024-01-14 08:30:00',
      endTime: '2024-01-14 16:00:00',
      operator: '李四',
      equipment: 'RNA提取仪B',
      inputAmount: 10.0,
      outputAmount: 7.8,
      yield: 78,
      concentration: 89.3,
      purity: 2.05,
      qualityScore: 92,
      notes: '提取效果优秀，RNA完整性良好'
    },
    {
      id: '3',
      sampleCode: 'S2024003',
      sampleName: '植物样本C',
      sampleType: '植物',
      method: 'protein_extraction',
      protocol: '蛋白质提取标准流程',
      status: 'failed',
      progress: 30,
      startTime: '2024-01-13 10:00:00',
      endTime: '2024-01-13 14:30:00',
      operator: '王五',
      equipment: '蛋白提取仪C',
      inputAmount: 2.5,
      notes: '样本降解严重，需要重新处理'
    }
  ]

  /**
   * 模拟前处理步骤数据
   */
  const mockPreprocessingSteps: PreprocessingStep[] = [
    {
      id: '1',
      stepName: '样本预处理',
      description: '样本清洗和研磨',
      duration: 30,
      reagents: ['PBS缓冲液', '液氮'],
      status: 'completed',
      startTime: '2024-01-15 09:00:00',
      endTime: '2024-01-15 09:30:00',
      notes: '样本研磨充分'
    },
    {
      id: '2',
      stepName: '细胞裂解',
      description: '使用裂解缓冲液破坏细胞壁',
      duration: 45,
      temperature: 65,
      reagents: ['CTAB缓冲液', 'β-巯基乙醇'],
      status: 'completed',
      startTime: '2024-01-15 09:30:00',
      endTime: '2024-01-15 10:15:00',
      notes: '裂解完全'
    },
    {
      id: '3',
      stepName: '蛋白质去除',
      description: '使用氯仿-异戊醇去除蛋白质',
      duration: 60,
      speed: 12000,
      reagents: ['氯仿', '异戊醇'],
      status: 'in_progress',
      startTime: '2024-01-15 10:15:00',
      notes: '正在离心分离'
    },
    {
      id: '4',
      stepName: 'DNA沉淀',
      description: '使用异丙醇沉淀DNA',
      duration: 30,
      reagents: ['异丙醇', '3M醋酸钠'],
      status: 'pending',
      notes: '等待上一步完成'
    },
    {
      id: '5',
      stepName: 'DNA洗涤',
      description: '使用70%乙醇洗涤DNA',
      duration: 20,
      reagents: ['70%乙醇'],
      status: 'pending',
      notes: '等待DNA沉淀完成'
    }
  ]

  /**
   * 组件初始化
   */
  useEffect(() => {
    loadPreprocessingData()
  }, [])

  /**
   * 加载前处理数据
   */
  const loadPreprocessingData = async () => {
    setLoading(true)
    try {
      // 模拟API调用
      await new Promise(resolve => setTimeout(resolve, 1000))
      setPreprocessingData(mockPreprocessingData)
    } catch (error) {
      console.error('加载前处理数据失败:', error)
    } finally {
      setLoading(false)
    }
  }

  /**
   * 获取方法文本
   */
  const getMethodText = (method: PreprocessingMethod) => {
    const textMap = {
      dna_extraction: 'DNA提取',
      rna_extraction: 'RNA提取',
      protein_extraction: '蛋白质提取',
      purification: '纯化',
      concentration: '浓缩',
      fragmentation: '片段化'
    }
    return textMap[method]
  }

  /**
   * 获取方法颜色
   */
  const getMethodColor = (method: PreprocessingMethod) => {
    const colorMap = {
      dna_extraction: 'blue',
      rna_extraction: 'green',
      protein_extraction: 'orange',
      purification: 'purple',
      concentration: 'cyan',
      fragmentation: 'magenta'
    }
    return colorMap[method]
  }

  /**
   * 获取状态颜色
   */
  const getStatusColor = (status: PreprocessingStatus) => {
    const colorMap = {
      pending: 'default',
      in_progress: 'processing',
      completed: 'success',
      failed: 'error',
      paused: 'warning'
    }
    return colorMap[status]
  }

  /**
   * 获取状态文本
   */
  const getStatusText = (status: PreprocessingStatus) => {
    const textMap = {
      pending: '待处理',
      in_progress: '处理中',
      completed: '已完成',
      failed: '失败',
      paused: '暂停'
    }
    return textMap[status]
  }

  /**
   * 获取质量等级
   */
  const getQualityGrade = (score?: number) => {
    if (!score) return { text: '未评估', color: 'default' }
    if (score >= 90) return { text: '优秀', color: 'success' }
    if (score >= 80) return { text: '良好', color: 'processing' }
    if (score >= 70) return { text: '合格', color: 'warning' }
    return { text: '不合格', color: 'error' }
  }

  /**
   * 新增前处理
   */
  const handleAdd = () => {
    setEditingRecord(null)
    form.resetFields()
    setModalVisible(true)
  }

  /**
   * 编辑前处理
   */
  const handleEdit = (record: PreprocessingRecord) => {
    setEditingRecord(record)
    form.setFieldsValue(record)
    setModalVisible(true)
  }

  /**
   * 查看详情
   */
  const handleViewDetail = (record: PreprocessingRecord) => {
    setSelectedRecord(record)
    setDetailModalVisible(true)
  }

  /**
   * 查看协议
   */
  const handleViewProtocol = (record: PreprocessingRecord) => {
    setSelectedRecord(record)
    setProtocolModalVisible(true)
  }

  /**
   * 开始处理
   */
  const handleStart = async (id: string) => {
    try {
      // 模拟API调用
      await new Promise(resolve => setTimeout(resolve, 500))
      setPreprocessingData(prev => prev.map(item => 
        item.id === id ? { ...item, status: 'in_progress' as PreprocessingStatus } : item
      ))
      message.success('开始处理')
    } catch (error) {
      message.error('操作失败')
    }
  }

  /**
   * 暂停处理
   */
  const handlePause = async (id: string) => {
    try {
      // 模拟API调用
      await new Promise(resolve => setTimeout(resolve, 500))
      setPreprocessingData(prev => prev.map(item => 
        item.id === id ? { ...item, status: 'paused' as PreprocessingStatus } : item
      ))
      message.success('已暂停处理')
    } catch (error) {
      message.error('操作失败')
    }
  }

  /**
   * 完成处理
   */
  const handleComplete = async (id: string) => {
    try {
      // 模拟API调用
      await new Promise(resolve => setTimeout(resolve, 500))
      setPreprocessingData(prev => prev.map(item => 
        item.id === id ? { 
          ...item, 
          status: 'completed' as PreprocessingStatus,
          progress: 100,
          endTime: dayjs().format('YYYY-MM-DD HH:mm:ss')
        } : item
      ))
      message.success('处理完成')
    } catch (error) {
      message.error('操作失败')
    }
  }

  /**
   * 删除记录
   */
  const handleDelete = async (id: string) => {
    try {
      // 模拟API调用
      await new Promise(resolve => setTimeout(resolve, 500))
      setPreprocessingData(prev => prev.filter(item => item.id !== id))
      message.success('删除成功')
    } catch (error) {
      message.error('删除失败')
    }
  }

  /**
   * 保存前处理记录
   */
  const handleSave = async (values: any) => {
    try {
      // 模拟API调用
      await new Promise(resolve => setTimeout(resolve, 500))
      
      if (editingRecord) {
        // 更新
        setPreprocessingData(prev => prev.map(item => 
          item.id === editingRecord.id ? { ...item, ...values } : item
        ))
        message.success('更新成功')
      } else {
        // 新增
        const newRecord: PreprocessingRecord = {
          id: Date.now().toString(),
          ...values,
          status: 'pending' as PreprocessingStatus,
          progress: 0,
          startTime: dayjs().format('YYYY-MM-DD HH:mm:ss'),
          operator: '当前用户'
        }
        setPreprocessingData(prev => [...prev, newRecord])
        message.success('添加成功')
      }
      
      setModalVisible(false)
      form.resetFields()
    } catch (error) {
      message.error('保存失败')
    }
  }

  /**
   * 过滤数据
   */
  const filteredData = preprocessingData.filter(item => {
    const matchSearch = !searchText || 
      item.sampleCode.toLowerCase().includes(searchText.toLowerCase()) ||
      item.sampleName.toLowerCase().includes(searchText.toLowerCase()) ||
      item.protocol.toLowerCase().includes(searchText.toLowerCase())
    
    const matchStatus = !statusFilter || item.status === statusFilter
    const matchMethod = !methodFilter || item.method === methodFilter
    
    return matchSearch && matchStatus && matchMethod
  })

  /**
   * 文件上传配置
   */
  const uploadProps: UploadProps = {
    name: 'file',
    multiple: true,
    action: '/api/upload',
    onChange(info) {
      const { status } = info.file
      if (status === 'done') {
        message.success(`${info.file.name} 文件上传成功`)
      } else if (status === 'error') {
        message.error(`${info.file.name} 文件上传失败`)
      }
    }
  }

  /**
   * 表格列定义
   */
  const columns: ColumnsType<PreprocessingRecord> = [
    {
      title: '样本编号',
      dataIndex: 'sampleCode',
      key: 'sampleCode',
      width: 120,
      fixed: 'left'
    },
    {
      title: '样本名称',
      dataIndex: 'sampleName',
      key: 'sampleName',
      width: 150,
      ellipsis: true
    },
    {
      title: '处理方法',
      dataIndex: 'method',
      key: 'method',
      width: 120,
      render: (method: PreprocessingMethod) => (
        <Tag color={getMethodColor(method)} icon={<ExperimentOutlined />}>
          {getMethodText(method)}
        </Tag>
      )
    },
    {
      title: '协议',
      dataIndex: 'protocol',
      key: 'protocol',
      width: 150,
      ellipsis: true,
      render: (protocol: string, record) => (
        <Button 
          type="link" 
          size="small"
          onClick={() => handleViewProtocol(record)}
        >
          {protocol}
        </Button>
      )
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: (status: PreprocessingStatus) => (
        <Tag color={getStatusColor(status)}>
          {getStatusText(status)}
        </Tag>
      )
    },
    {
      title: '进度',
      dataIndex: 'progress',
      key: 'progress',
      width: 120,
      render: (progress: number, record) => (
        <Progress 
          percent={progress} 
          size="small" 
          status={record.status === 'failed' ? 'exception' : 'active'}
        />
      )
    },
    {
      title: '产率',
      key: 'yield',
      width: 80,
      render: (_, record) => (
        record.yield ? `${record.yield}%` : '-'
      )
    },
    {
      title: '质量评分',
      dataIndex: 'qualityScore',
      key: 'qualityScore',
      width: 100,
      render: (score?: number) => {
        const grade = getQualityGrade(score)
        return score ? (
          <Tag color={grade.color}>{score}分 ({grade.text})</Tag>
        ) : '-'
      }
    },
    {
      title: '操作人',
      dataIndex: 'operator',
      key: 'operator',
      width: 100
    },
    {
      title: '设备',
      dataIndex: 'equipment',
      key: 'equipment',
      width: 120,
      ellipsis: true
    },
    {
      title: '开始时间',
      dataIndex: 'startTime',
      key: 'startTime',
      width: 150,
      render: (time: string) => dayjs(time).format('MM-DD HH:mm')
    },
    {
      title: '操作',
      key: 'action',
      width: 200,
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
          {record.status === 'pending' && (
            <Tooltip title="开始处理">
              <Button
                type="text"
                icon={<PlayCircleOutlined />}
                onClick={() => handleStart(record.id)}
              />
            </Tooltip>
          )}
          {record.status === 'in_progress' && (
            <>
              <Tooltip title="暂停处理">
                <Button
                  type="text"
                  icon={<PauseCircleOutlined />}
                  onClick={() => handlePause(record.id)}
                />
              </Tooltip>
              <Tooltip title="完成处理">
                <Button
                  type="text"
                  icon={<CheckCircleOutlined />}
                  onClick={() => handleComplete(record.id)}
                />
              </Tooltip>
            </>
          )}
          <Tooltip title="编辑">
            <Button
              type="text"
              icon={<EditOutlined />}
              onClick={() => handleEdit(record)}
            />
          </Tooltip>
          <Popconfirm
            title="确定要删除这条记录吗？"
            onConfirm={() => handleDelete(record.id)}
          >
            <Tooltip title="删除">
              <Button
                type="text"
                danger
                icon={<DeleteOutlined />}
              />
            </Tooltip>
          </Popconfirm>
        </Space>
      )
    }
  ]

  return (
    <div>
      {/* 统计信息 */}
      <Row gutter={16} style={{ marginBottom: 16 }}>
        <Col span={6}>
          <Card size="small">
            <Statistic
              title="总处理数"
              value={preprocessingData.length}
              prefix={<ExperimentOutlined />}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card size="small">
            <Statistic
              title="处理中"
              value={preprocessingData.filter(item => item.status === 'in_progress').length}
              valueStyle={{ color: '#1890ff' }}
              prefix={<ClockCircleOutlined />}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card size="small">
            <Statistic
              title="已完成"
              value={preprocessingData.filter(item => item.status === 'completed').length}
              valueStyle={{ color: '#3f8600' }}
              prefix={<CheckCircleOutlined />}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card size="small">
            <Statistic
              title="失败/异常"
              value={preprocessingData.filter(item => item.status === 'failed').length}
              valueStyle={{ color: '#cf1322' }}
              prefix={<ExclamationCircleOutlined />}
            />
          </Card>
        </Col>
      </Row>

      {/* 失败提醒 */}
      {preprocessingData.some(item => item.status === 'failed') && (
        <Alert
          message="发现处理失败的样本"
          description={`有 ${preprocessingData.filter(item => item.status === 'failed').length} 个样本处理失败，请检查并重新处理`}
          type="error"
          showIcon
          closable
          style={{ marginBottom: 16 }}
        />
      )}

      {/* 搜索和筛选 */}
      <Card size="small" style={{ marginBottom: 16 }}>
        <Row gutter={16}>
          <Col span={8}>
            <Search
              placeholder="搜索样本编号、名称或协议"
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              onSearch={loadPreprocessingData}
              enterButton={<SearchOutlined />}
            />
          </Col>
          <Col span={4}>
            <Select
              placeholder="状态筛选"
              value={statusFilter}
              onChange={setStatusFilter}
              allowClear
              style={{ width: '100%' }}
            >
              <Option value="pending">待处理</Option>
              <Option value="in_progress">处理中</Option>
              <Option value="completed">已完成</Option>
              <Option value="failed">失败</Option>
              <Option value="paused">暂停</Option>
            </Select>
          </Col>
          <Col span={4}>
            <Select
              placeholder="方法筛选"
              value={methodFilter}
              onChange={setMethodFilter}
              allowClear
              style={{ width: '100%' }}
            >
              <Option value="dna_extraction">DNA提取</Option>
              <Option value="rna_extraction">RNA提取</Option>
              <Option value="protein_extraction">蛋白质提取</Option>
              <Option value="purification">纯化</Option>
              <Option value="concentration">浓缩</Option>
              <Option value="fragmentation">片段化</Option>
            </Select>
          </Col>
          <Col span={4}>
            <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
              新增处理
            </Button>
          </Col>
          <Col span={4}>
            <Button onClick={loadPreprocessingData} loading={loading}>
              刷新数据
            </Button>
          </Col>
        </Row>
      </Card>

      {/* 前处理数据表格 */}
      <Card title="前处理列表" size="small">
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

      {/* 新增/编辑模态框 */}
      <Modal
        title={editingRecord ? '编辑前处理' : '新增前处理'}
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        onOk={() => form.submit()}
        width={800}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSave}
        >
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="sampleCode"
                label="样本编号"
                rules={[{ required: true, message: '请输入样本编号' }]}
              >
                <Input placeholder="请输入样本编号" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="sampleName"
                label="样本名称"
                rules={[{ required: true, message: '请输入样本名称' }]}
              >
                <Input placeholder="请输入样本名称" />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="sampleType"
                label="样本类型"
                rules={[{ required: true, message: '请选择样本类型' }]}
              >
                <Select placeholder="请选择样本类型">
                  <Option value="土壤">土壤</Option>
                  <Option value="水体">水体</Option>
                  <Option value="植物">植物</Option>
                  <Option value="动物">动物</Option>
                  <Option value="微生物">微生物</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="method"
                label="处理方法"
                rules={[{ required: true, message: '请选择处理方法' }]}
              >
                <Select placeholder="请选择处理方法">
                  <Option value="dna_extraction">DNA提取</Option>
                  <Option value="rna_extraction">RNA提取</Option>
                  <Option value="protein_extraction">蛋白质提取</Option>
                  <Option value="purification">纯化</Option>
                  <Option value="concentration">浓缩</Option>
                  <Option value="fragmentation">片段化</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="protocol"
                label="处理协议"
                rules={[{ required: true, message: '请输入处理协议' }]}
              >
                <Input placeholder="请输入处理协议" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="equipment"
                label="使用设备"
                rules={[{ required: true, message: '请输入使用设备' }]}
              >
                <Input placeholder="请输入使用设备" />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={8}>
              <Form.Item
                name="inputAmount"
                label="输入量"
                rules={[{ required: true, message: '请输入输入量' }]}
              >
                <InputNumber min={0} style={{ width: '100%' }} addonAfter="ml/g" />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                name="outputAmount"
                label="输出量"
              >
                <InputNumber min={0} style={{ width: '100%' }} addonAfter="ml/g" />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                name="concentration"
                label="浓度"
              >
                <InputNumber min={0} style={{ width: '100%' }} addonAfter="ng/μl" />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={8}>
              <Form.Item
                name="purity"
                label="纯度(A260/A280)"
              >
                <InputNumber min={0} max={5} step={0.01} style={{ width: '100%' }} />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                name="qualityScore"
                label="质量评分"
              >
                <InputNumber min={0} max={100} style={{ width: '100%' }} />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                name="yield"
                label="产率(%)"
              >
                <InputNumber min={0} max={100} style={{ width: '100%' }} />
              </Form.Item>
            </Col>
          </Row>
          <Form.Item
            name="notes"
            label="备注"
          >
            <TextArea rows={3} placeholder="请输入备注信息" />
          </Form.Item>
          <Form.Item
            name="attachments"
            label="附件上传"
          >
            <Upload {...uploadProps}>
              <Button icon={<UploadOutlined />}>上传文件</Button>
            </Upload>
          </Form.Item>
        </Form>
      </Modal>

      {/* 详情模态框 */}
      <Modal
        title="前处理详情"
        open={detailModalVisible}
        onCancel={() => setDetailModalVisible(false)}
        footer={null}
        width={800}
      >
        {selectedRecord && (
          <div>
            <Descriptions bordered size="small" column={2}>
              <Descriptions.Item label="样本编号">{selectedRecord.sampleCode}</Descriptions.Item>
              <Descriptions.Item label="样本名称">{selectedRecord.sampleName}</Descriptions.Item>
              <Descriptions.Item label="样本类型">{selectedRecord.sampleType}</Descriptions.Item>
              <Descriptions.Item label="处理方法">
                <Tag color={getMethodColor(selectedRecord.method)}>
                  {getMethodText(selectedRecord.method)}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="处理协议" span={2}>{selectedRecord.protocol}</Descriptions.Item>
              <Descriptions.Item label="状态">
                <Tag color={getStatusColor(selectedRecord.status)}>
                  {getStatusText(selectedRecord.status)}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="进度">
                <Progress percent={selectedRecord.progress} size="small" />
              </Descriptions.Item>
              <Descriptions.Item label="操作人">{selectedRecord.operator}</Descriptions.Item>
              <Descriptions.Item label="使用设备">{selectedRecord.equipment}</Descriptions.Item>
              <Descriptions.Item label="输入量">{selectedRecord.inputAmount} ml/g</Descriptions.Item>
              <Descriptions.Item label="输出量">
                {selectedRecord.outputAmount ? `${selectedRecord.outputAmount} ml/g` : '-'}
              </Descriptions.Item>
              <Descriptions.Item label="产率">
                {selectedRecord.yield ? `${selectedRecord.yield}%` : '-'}
              </Descriptions.Item>
              <Descriptions.Item label="浓度">
                {selectedRecord.concentration ? `${selectedRecord.concentration} ng/μl` : '-'}
              </Descriptions.Item>
              <Descriptions.Item label="纯度">
                {selectedRecord.purity ? selectedRecord.purity : '-'}
              </Descriptions.Item>
              <Descriptions.Item label="质量评分">
                {selectedRecord.qualityScore ? (
                  <Tag color={getQualityGrade(selectedRecord.qualityScore).color}>
                    {selectedRecord.qualityScore}分 ({getQualityGrade(selectedRecord.qualityScore).text})
                  </Tag>
                ) : '-'}
              </Descriptions.Item>
              <Descriptions.Item label="开始时间">{selectedRecord.startTime}</Descriptions.Item>
              <Descriptions.Item label="结束时间">
                {selectedRecord.endTime || '-'}
              </Descriptions.Item>
              <Descriptions.Item label="备注" span={2}>
                {selectedRecord.notes || '无'}
              </Descriptions.Item>
            </Descriptions>

            <Divider>处理步骤</Divider>
            <Steps
              direction="vertical"
              size="small"
              current={2}
              items={mockPreprocessingSteps.map(step => ({
                title: step.stepName,
                description: (
                  <div>
                    <div>{step.description}</div>
                    <div style={{ fontSize: 12, color: '#666', marginTop: 4 }}>
                      预计耗时: {step.duration}分钟
                      {step.temperature && ` | 温度: ${step.temperature}°C`}
                      {step.speed && ` | 转速: ${step.speed}rpm`}
                    </div>
                    <div style={{ fontSize: 12, color: '#999', marginTop: 2 }}>
                      试剂: {step.reagents.join(', ')}
                    </div>
                  </div>
                ),
                status: step.status === 'failed' ? 'error' : 
                        step.status === 'in_progress' ? 'process' :
                        step.status === 'completed' ? 'finish' : 'wait'
              }))}
            />
          </div>
        )}
      </Modal>

      {/* 协议模态框 */}
      <Modal
        title="处理协议详情"
        open={protocolModalVisible}
        onCancel={() => setProtocolModalVisible(false)}
        footer={null}
        width={600}
      >
        {selectedRecord && (
          <div>
            <h4>{selectedRecord.protocol}</h4>
            <Timeline
              items={mockPreprocessingSteps.map(step => ({
                children: (
                  <div>
                    <div style={{ fontWeight: 'bold' }}>{step.stepName}</div>
                    <div style={{ marginTop: 4 }}>{step.description}</div>
                    <div style={{ fontSize: 12, color: '#666', marginTop: 4 }}>
                      耗时: {step.duration}分钟
                      {step.temperature && ` | 温度: ${step.temperature}°C`}
                      {step.speed && ` | 转速: ${step.speed}rpm`}
                    </div>
                    <div style={{ fontSize: 12, color: '#999', marginTop: 2 }}>
                      所需试剂: {step.reagents.join(', ')}
                    </div>
                  </div>
                )
              }))}
            />
            <div style={{ marginTop: 16, textAlign: 'center' }}>
              <Button type="primary" icon={<DownloadOutlined />}>
                下载协议文档
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}

export default Preprocessing