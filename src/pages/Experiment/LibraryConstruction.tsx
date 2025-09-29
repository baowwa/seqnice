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
  Progress,
  Alert,
  Timeline,
  Divider,
  Statistic,
  Badge,
  Tabs,
  List,
  Avatar
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
  ExperimentOutlined,
  ClockCircleOutlined,
  FileTextOutlined,
  BarcodeOutlined,
  ThunderboltOutlined,
  SettingOutlined,
  LineChartOutlined
} from '@ant-design/icons'
import type { ColumnsType } from 'antd/es/table'
import dayjs from 'dayjs'

const { Search } = Input
const { Option } = Select
const { TextArea } = Input
const { TabPane } = Tabs

/**
 * 文库构建状态枚举
 */
type LibraryStatus = 'pending' | 'in_progress' | 'completed' | 'failed' | 'quality_check'

/**
 * 文库类型枚举
 */
type LibraryType = 'dna_seq' | 'rna_seq' | 'chip_seq' | 'atac_seq' | 'wgs' | 'wes' | 'amplicon'

/**
 * 测序平台枚举
 */
type SequencingPlatform = 'illumina_novaseq' | 'illumina_hiseq' | 'illumina_miseq' | 'nanopore' | 'pacbio'

/**
 * 文库构建记录接口
 */
interface LibraryRecord {
  id: string
  sampleCode: string
  sampleName: string
  libraryType: LibraryType
  platform: SequencingPlatform
  protocol: string
  status: LibraryStatus
  progress: number
  startTime: string
  endTime?: string
  operator: string
  barcodeIndex: string
  insertSize: number
  concentration: number
  volume: number
  molarity: number
  qualityScore: number
  readLength: number
  expectedYield: number
  actualYield?: number
  notes?: string
}

/**
 * 文库构建步骤接口
 */
interface LibraryStep {
  id: string
  stepName: string
  description: string
  duration: number
  temperature?: number
  cycles?: number
  reagents: string[]
  equipment: string
  status: 'pending' | 'in_progress' | 'completed' | 'failed'
  startTime?: string
  endTime?: string
  notes?: string
  qcMetrics?: {
    concentration?: number
    volume?: number
    purity?: number
  }
}

/**
 * 文库构建页面组件
 * 
 * 功能特性：
 * - 文库构建流程管理
 * - 多种文库类型支持
 * - 条码索引管理
 * - 质量控制监控
 * - 测序平台适配
 */
const LibraryConstruction: React.FC = () => {
  // 状态管理
  const [loading, setLoading] = useState(false)
  const [libraryData, setLibraryData] = useState<LibraryRecord[]>([])
  const [selectedRecord, setSelectedRecord] = useState<LibraryRecord | null>(null)
  const [modalVisible, setModalVisible] = useState(false)
  const [detailModalVisible, setDetailModalVisible] = useState(false)
  const [qcModalVisible, setQcModalVisible] = useState(false)
  const [editingRecord, setEditingRecord] = useState<LibraryRecord | null>(null)
  const [searchText, setSearchText] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('')
  const [typeFilter, setTypeFilter] = useState<string>('')
  const [platformFilter, setPlatformFilter] = useState<string>('')
  const [form] = Form.useForm()

  /**
   * 模拟文库构建数据
   */
  const mockLibraryData: LibraryRecord[] = [
    {
      id: '1',
      sampleCode: 'S2024001',
      sampleName: '土壤样本A',
      libraryType: 'dna_seq',
      platform: 'illumina_novaseq',
      protocol: 'TruSeq DNA PCR-Free',
      status: 'in_progress',
      progress: 75,
      startTime: '2024-01-15 09:00:00',
      operator: '张三',
      barcodeIndex: 'ATCACG',
      insertSize: 350,
      concentration: 15.8,
      volume: 50,
      molarity: 4.2,
      qualityScore: 88,
      readLength: 150,
      expectedYield: 30,
      actualYield: 28.5,
      notes: '文库质量良好，符合测序要求'
    },
    {
      id: '2',
      sampleCode: 'S2024002',
      sampleName: '水体样本B',
      libraryType: 'rna_seq',
      platform: 'illumina_hiseq',
      protocol: 'TruSeq Stranded mRNA',
      status: 'completed',
      progress: 100,
      startTime: '2024-01-14 08:30:00',
      endTime: '2024-01-14 18:00:00',
      operator: '李四',
      barcodeIndex: 'CGATGT',
      insertSize: 200,
      concentration: 22.3,
      volume: 40,
      molarity: 6.8,
      qualityScore: 95,
      readLength: 100,
      expectedYield: 25,
      actualYield: 26.8,
      notes: 'RNA完整性优秀，文库构建成功'
    },
    {
      id: '3',
      sampleCode: 'S2024003',
      sampleName: '植物样本C',
      libraryType: 'wgs',
      platform: 'nanopore',
      protocol: 'Ligation Sequencing Kit',
      status: 'quality_check',
      progress: 90,
      startTime: '2024-01-13 10:00:00',
      operator: '王五',
      barcodeIndex: 'TTAGGC',
      insertSize: 8000,
      concentration: 8.5,
      volume: 75,
      molarity: 2.1,
      qualityScore: 82,
      readLength: 10000,
      expectedYield: 15,
      notes: '长片段文库，正在进行质量检测'
    }
  ]

  /**
   * 模拟文库构建步骤数据
   */
  const mockLibrarySteps: LibraryStep[] = [
    {
      id: '1',
      stepName: 'DNA片段化',
      description: '使用超声波或酶切方法将DNA片段化至目标大小',
      duration: 45,
      reagents: ['片段化酶', '片段化缓冲液'],
      equipment: '超声波破碎仪',
      status: 'completed',
      startTime: '2024-01-15 09:00:00',
      endTime: '2024-01-15 09:45:00',
      notes: '片段化效果良好',
      qcMetrics: {
        concentration: 25.6,
        volume: 50
      }
    },
    {
      id: '2',
      stepName: '末端修复',
      description: '修复DNA片段末端，添加A尾',
      duration: 30,
      temperature: 20,
      reagents: ['末端修复酶', 'dATP', '反应缓冲液'],
      equipment: 'PCR仪',
      status: 'completed',
      startTime: '2024-01-15 10:00:00',
      endTime: '2024-01-15 10:30:00',
      notes: '末端修复完成',
      qcMetrics: {
        concentration: 23.2,
        volume: 52
      }
    },
    {
      id: '3',
      stepName: '接头连接',
      description: '连接测序接头和条码索引',
      duration: 60,
      temperature: 20,
      reagents: ['T4 DNA连接酶', '测序接头', '连接缓冲液'],
      equipment: 'PCR仪',
      status: 'in_progress',
      startTime: '2024-01-15 11:00:00',
      notes: '正在进行接头连接',
      qcMetrics: {
        concentration: 20.8
      }
    },
    {
      id: '4',
      stepName: 'PCR扩增',
      description: '对连接产物进行PCR扩增',
      duration: 90,
      temperature: 98,
      cycles: 8,
      reagents: ['高保真聚合酶', 'dNTPs', 'PCR引物'],
      equipment: 'PCR仪',
      status: 'pending',
      notes: '等待接头连接完成'
    },
    {
      id: '5',
      stepName: '文库纯化',
      description: '使用磁珠纯化文库产物',
      duration: 45,
      reagents: ['AMPure XP磁珠', '80%乙醇', 'TE缓冲液'],
      equipment: '磁力架',
      status: 'pending',
      notes: '等待PCR扩增完成'
    }
  ]

  /**
   * 组件初始化
   */
  useEffect(() => {
    loadLibraryData()
  }, [])

  /**
   * 加载文库数据
   */
  const loadLibraryData = async () => {
    setLoading(true)
    try {
      // 模拟API调用
      await new Promise(resolve => setTimeout(resolve, 1000))
      setLibraryData(mockLibraryData)
    } catch (error) {
      console.error('加载文库数据失败:', error)
    } finally {
      setLoading(false)
    }
  }

  /**
   * 获取文库类型文本
   */
  const getLibraryTypeText = (type: LibraryType) => {
    const textMap = {
      dna_seq: 'DNA测序',
      rna_seq: 'RNA测序',
      chip_seq: 'ChIP测序',
      atac_seq: 'ATAC测序',
      wgs: '全基因组测序',
      wes: '全外显子测序',
      amplicon: '扩增子测序'
    }
    return textMap[type]
  }

  /**
   * 获取文库类型颜色
   */
  const getLibraryTypeColor = (type: LibraryType) => {
    const colorMap = {
      dna_seq: 'blue',
      rna_seq: 'green',
      chip_seq: 'orange',
      atac_seq: 'purple',
      wgs: 'cyan',
      wes: 'magenta',
      amplicon: 'gold'
    }
    return colorMap[type]
  }

  /**
   * 获取测序平台文本
   */
  const getPlatformText = (platform: SequencingPlatform) => {
    const textMap = {
      illumina_novaseq: 'Illumina NovaSeq',
      illumina_hiseq: 'Illumina HiSeq',
      illumina_miseq: 'Illumina MiSeq',
      nanopore: 'Oxford Nanopore',
      pacbio: 'PacBio'
    }
    return textMap[platform]
  }

  /**
   * 获取状态颜色
   */
  const getStatusColor = (status: LibraryStatus) => {
    const colorMap = {
      pending: 'default',
      in_progress: 'processing',
      completed: 'success',
      failed: 'error',
      quality_check: 'warning'
    }
    return colorMap[status]
  }

  /**
   * 获取状态文本
   */
  const getStatusText = (status: LibraryStatus) => {
    const textMap = {
      pending: '待构建',
      in_progress: '构建中',
      completed: '已完成',
      failed: '失败',
      quality_check: '质检中'
    }
    return textMap[status]
  }

  /**
   * 获取质量等级
   */
  const getQualityGrade = (score: number) => {
    if (score >= 90) return { text: '优秀', color: 'success' }
    if (score >= 80) return { text: '良好', color: 'processing' }
    if (score >= 70) return { text: '合格', color: 'warning' }
    return { text: '不合格', color: 'error' }
  }

  /**
   * 新增文库构建
   */
  const handleAdd = () => {
    setEditingRecord(null)
    form.resetFields()
    setModalVisible(true)
  }

  /**
   * 编辑文库构建
   */
  const handleEdit = (record: LibraryRecord) => {
    setEditingRecord(record)
    form.setFieldsValue(record)
    setModalVisible(true)
  }

  /**
   * 查看详情
   */
  const handleViewDetail = (record: LibraryRecord) => {
    setSelectedRecord(record)
    setDetailModalVisible(true)
  }

  /**
   * 质量检测
   */
  const handleQualityCheck = (record: LibraryRecord) => {
    setSelectedRecord(record)
    setQcModalVisible(true)
  }

  /**
   * 开始构建
   */
  const handleStart = async (id: string) => {
    try {
      // 模拟API调用
      await new Promise(resolve => setTimeout(resolve, 500))
      setLibraryData(prev => prev.map(item => 
        item.id === id ? { ...item, status: 'in_progress' as LibraryStatus } : item
      ))
      message.success('开始构建文库')
    } catch (error) {
      message.error('操作失败')
    }
  }

  /**
   * 完成构建
   */
  const handleComplete = async (id: string) => {
    try {
      // 模拟API调用
      await new Promise(resolve => setTimeout(resolve, 500))
      setLibraryData(prev => prev.map(item => 
        item.id === id ? { 
          ...item, 
          status: 'completed' as LibraryStatus,
          progress: 100,
          endTime: dayjs().format('YYYY-MM-DD HH:mm:ss')
        } : item
      ))
      message.success('文库构建完成')
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
      setLibraryData(prev => prev.filter(item => item.id !== id))
      message.success('删除成功')
    } catch (error) {
      message.error('删除失败')
    }
  }

  /**
   * 保存文库记录
   */
  const handleSave = async (values: any) => {
    try {
      // 模拟API调用
      await new Promise(resolve => setTimeout(resolve, 500))
      
      if (editingRecord) {
        // 更新
        setLibraryData(prev => prev.map(item => 
          item.id === editingRecord.id ? { ...item, ...values } : item
        ))
        message.success('更新成功')
      } else {
        // 新增
        const newRecord: LibraryRecord = {
          id: Date.now().toString(),
          ...values,
          status: 'pending' as LibraryStatus,
          progress: 0,
          startTime: dayjs().format('YYYY-MM-DD HH:mm:ss'),
          operator: '当前用户'
        }
        setLibraryData(prev => [...prev, newRecord])
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
  const filteredData = libraryData.filter(item => {
    const matchSearch = !searchText || 
      item.sampleCode.toLowerCase().includes(searchText.toLowerCase()) ||
      item.sampleName.toLowerCase().includes(searchText.toLowerCase()) ||
      item.protocol.toLowerCase().includes(searchText.toLowerCase())
    
    const matchStatus = !statusFilter || item.status === statusFilter
    const matchType = !typeFilter || item.libraryType === typeFilter
    const matchPlatform = !platformFilter || item.platform === platformFilter
    
    return matchSearch && matchStatus && matchType && matchPlatform
  })

  /**
   * 表格列定义
   */
  const columns: ColumnsType<LibraryRecord> = [
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
      title: '文库类型',
      dataIndex: 'libraryType',
      key: 'libraryType',
      width: 120,
      render: (type: LibraryType) => (
        <Tag color={getLibraryTypeColor(type)} icon={<ExperimentOutlined />}>
          {getLibraryTypeText(type)}
        </Tag>
      )
    },
    {
      title: '测序平台',
      dataIndex: 'platform',
      key: 'platform',
      width: 140,
      render: (platform: SequencingPlatform) => (
        <Tag color="blue">{getPlatformText(platform)}</Tag>
      )
    },
    {
      title: '条码索引',
      dataIndex: 'barcodeIndex',
      key: 'barcodeIndex',
      width: 100,
      render: (barcode: string) => (
        <Tag icon={<BarcodeOutlined />}>{barcode}</Tag>
      )
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: (status: LibraryStatus) => (
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
      title: '浓度',
      dataIndex: 'concentration',
      key: 'concentration',
      width: 100,
      render: (concentration: number) => `${concentration} ng/μl`
    },
    {
      title: '质量评分',
      dataIndex: 'qualityScore',
      key: 'qualityScore',
      width: 100,
      render: (score: number) => {
        const grade = getQualityGrade(score)
        return (
          <Tag color={grade.color}>{score}分 ({grade.text})</Tag>
        )
      }
    },
    {
      title: '插入片段',
      dataIndex: 'insertSize',
      key: 'insertSize',
      width: 100,
      render: (size: number) => `${size} bp`
    },
    {
      title: '操作人',
      dataIndex: 'operator',
      key: 'operator',
      width: 100
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
          <Tooltip title="质量检测">
            <Button
              type="text"
              icon={<LineChartOutlined />}
              onClick={() => handleQualityCheck(record)}
            />
          </Tooltip>
          {record.status === 'pending' && (
            <Tooltip title="开始构建">
              <Button
                type="text"
                icon={<PlayCircleOutlined />}
                onClick={() => handleStart(record.id)}
              />
            </Tooltip>
          )}
          {record.status === 'in_progress' && (
            <Tooltip title="完成构建">
              <Button
                type="text"
                icon={<CheckCircleOutlined />}
                onClick={() => handleComplete(record.id)}
              />
            </Tooltip>
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
              title="总文库数"
              value={libraryData.length}
              prefix={<ExperimentOutlined />}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card size="small">
            <Statistic
              title="构建中"
              value={libraryData.filter(item => item.status === 'in_progress').length}
              valueStyle={{ color: '#1890ff' }}
              prefix={<ClockCircleOutlined />}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card size="small">
            <Statistic
              title="已完成"
              value={libraryData.filter(item => item.status === 'completed').length}
              valueStyle={{ color: '#3f8600' }}
              prefix={<CheckCircleOutlined />}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card size="small">
            <Statistic
              title="质检中"
              value={libraryData.filter(item => item.status === 'quality_check').length}
              valueStyle={{ color: '#faad14' }}
              prefix={<SettingOutlined />}
            />
          </Card>
        </Col>
      </Row>

      {/* 失败提醒 */}
      {libraryData.some(item => item.status === 'failed') && (
        <Alert
          message="发现构建失败的文库"
          description={`有 ${libraryData.filter(item => item.status === 'failed').length} 个文库构建失败，请检查并重新构建`}
          type="error"
          showIcon
          closable
          style={{ marginBottom: 16 }}
        />
      )}

      {/* 搜索和筛选 */}
      <Card size="small" style={{ marginBottom: 16 }}>
        <Row gutter={16}>
          <Col span={6}>
            <Search
              placeholder="搜索样本编号、名称或协议"
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              onSearch={loadLibraryData}
              enterButton={<SearchOutlined />}
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
              <Option value="pending">待构建</Option>
              <Option value="in_progress">构建中</Option>
              <Option value="completed">已完成</Option>
              <Option value="failed">失败</Option>
              <Option value="quality_check">质检中</Option>
            </Select>
          </Col>
          <Col span={3}>
            <Select
              placeholder="文库类型"
              value={typeFilter}
              onChange={setTypeFilter}
              allowClear
              style={{ width: '100%' }}
            >
              <Option value="dna_seq">DNA测序</Option>
              <Option value="rna_seq">RNA测序</Option>
              <Option value="chip_seq">ChIP测序</Option>
              <Option value="atac_seq">ATAC测序</Option>
              <Option value="wgs">全基因组测序</Option>
              <Option value="wes">全外显子测序</Option>
              <Option value="amplicon">扩增子测序</Option>
            </Select>
          </Col>
          <Col span={3}>
            <Select
              placeholder="测序平台"
              value={platformFilter}
              onChange={setPlatformFilter}
              allowClear
              style={{ width: '100%' }}
            >
              <Option value="illumina_novaseq">Illumina NovaSeq</Option>
              <Option value="illumina_hiseq">Illumina HiSeq</Option>
              <Option value="illumina_miseq">Illumina MiSeq</Option>
              <Option value="nanopore">Oxford Nanopore</Option>
              <Option value="pacbio">PacBio</Option>
            </Select>
          </Col>
          <Col span={5}>
            <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd} style={{ marginRight: 8 }}>
              新增文库
            </Button>
            <Button onClick={loadLibraryData} loading={loading}>
              刷新
            </Button>
          </Col>
        </Row>
      </Card>

      {/* 文库数据表格 */}
      <Card title="文库构建列表" size="small">
        <Table
          columns={columns}
          dataSource={filteredData}
          rowKey="id"
          loading={loading}
          scroll={{ x: 1800 }}
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
        title={editingRecord ? '编辑文库构建' : '新增文库构建'}
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
                name="libraryType"
                label="文库类型"
                rules={[{ required: true, message: '请选择文库类型' }]}
              >
                <Select placeholder="请选择文库类型">
                  <Option value="dna_seq">DNA测序</Option>
                  <Option value="rna_seq">RNA测序</Option>
                  <Option value="chip_seq">ChIP测序</Option>
                  <Option value="atac_seq">ATAC测序</Option>
                  <Option value="wgs">全基因组测序</Option>
                  <Option value="wes">全外显子测序</Option>
                  <Option value="amplicon">扩增子测序</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="platform"
                label="测序平台"
                rules={[{ required: true, message: '请选择测序平台' }]}
              >
                <Select placeholder="请选择测序平台">
                  <Option value="illumina_novaseq">Illumina NovaSeq</Option>
                  <Option value="illumina_hiseq">Illumina HiSeq</Option>
                  <Option value="illumina_miseq">Illumina MiSeq</Option>
                  <Option value="nanopore">Oxford Nanopore</Option>
                  <Option value="pacbio">PacBio</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="protocol"
                label="构建协议"
                rules={[{ required: true, message: '请输入构建协议' }]}
              >
                <Input placeholder="请输入构建协议" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="barcodeIndex"
                label="条码索引"
                rules={[{ required: true, message: '请输入条码索引' }]}
              >
                <Input placeholder="如：ATCACG" />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={8}>
              <Form.Item
                name="insertSize"
                label="插入片段大小(bp)"
                rules={[{ required: true, message: '请输入插入片段大小' }]}
              >
                <InputNumber min={50} max={50000} style={{ width: '100%' }} />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                name="readLength"
                label="读长(bp)"
                rules={[{ required: true, message: '请输入读长' }]}
              >
                <InputNumber min={50} max={10000} style={{ width: '100%' }} />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                name="expectedYield"
                label="预期产量(Gb)"
                rules={[{ required: true, message: '请输入预期产量' }]}
              >
                <InputNumber min={0} step={0.1} style={{ width: '100%' }} />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={8}>
              <Form.Item
                name="concentration"
                label="浓度(ng/μl)"
              >
                <InputNumber min={0} step={0.1} style={{ width: '100%' }} />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                name="volume"
                label="体积(μl)"
              >
                <InputNumber min={0} style={{ width: '100%' }} />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                name="molarity"
                label="摩尔浓度(nM)"
              >
                <InputNumber min={0} step={0.1} style={{ width: '100%' }} />
              </Form.Item>
            </Col>
          </Row>
          <Form.Item
            name="notes"
            label="备注"
          >
            <TextArea rows={3} placeholder="请输入备注信息" />
          </Form.Item>
        </Form>
      </Modal>

      {/* 详情模态框 */}
      <Modal
        title="文库构建详情"
        open={detailModalVisible}
        onCancel={() => setDetailModalVisible(false)}
        footer={null}
        width={900}
      >
        {selectedRecord && (
          <Tabs defaultActiveKey="1">
            <TabPane tab="基本信息" key="1">
              <Descriptions bordered size="small" column={2}>
                <Descriptions.Item label="样本编号">{selectedRecord.sampleCode}</Descriptions.Item>
                <Descriptions.Item label="样本名称">{selectedRecord.sampleName}</Descriptions.Item>
                <Descriptions.Item label="文库类型">
                  <Tag color={getLibraryTypeColor(selectedRecord.libraryType)}>
                    {getLibraryTypeText(selectedRecord.libraryType)}
                  </Tag>
                </Descriptions.Item>
                <Descriptions.Item label="测序平台">
                  <Tag color="blue">{getPlatformText(selectedRecord.platform)}</Tag>
                </Descriptions.Item>
                <Descriptions.Item label="构建协议" span={2}>{selectedRecord.protocol}</Descriptions.Item>
                <Descriptions.Item label="条码索引">
                  <Tag icon={<BarcodeOutlined />}>{selectedRecord.barcodeIndex}</Tag>
                </Descriptions.Item>
                <Descriptions.Item label="状态">
                  <Tag color={getStatusColor(selectedRecord.status)}>
                    {getStatusText(selectedRecord.status)}
                  </Tag>
                </Descriptions.Item>
                <Descriptions.Item label="进度">
                  <Progress percent={selectedRecord.progress} size="small" />
                </Descriptions.Item>
                <Descriptions.Item label="操作人">{selectedRecord.operator}</Descriptions.Item>
                <Descriptions.Item label="开始时间">{selectedRecord.startTime}</Descriptions.Item>
                <Descriptions.Item label="结束时间">
                  {selectedRecord.endTime || '-'}
                </Descriptions.Item>
              </Descriptions>
            </TabPane>
            <TabPane tab="质量参数" key="2">
              <Row gutter={16}>
                <Col span={8}>
                  <Card size="small">
                    <Statistic
                      title="浓度"
                      value={selectedRecord.concentration}
                      suffix="ng/μl"
                      precision={1}
                    />
                  </Card>
                </Col>
                <Col span={8}>
                  <Card size="small">
                    <Statistic
                      title="体积"
                      value={selectedRecord.volume}
                      suffix="μl"
                    />
                  </Card>
                </Col>
                <Col span={8}>
                  <Card size="small">
                    <Statistic
                      title="摩尔浓度"
                      value={selectedRecord.molarity}
                      suffix="nM"
                      precision={1}
                    />
                  </Card>
                </Col>
              </Row>
              <Row gutter={16} style={{ marginTop: 16 }}>
                <Col span={8}>
                  <Card size="small">
                    <Statistic
                      title="插入片段大小"
                      value={selectedRecord.insertSize}
                      suffix="bp"
                    />
                  </Card>
                </Col>
                <Col span={8}>
                  <Card size="small">
                    <Statistic
                      title="读长"
                      value={selectedRecord.readLength}
                      suffix="bp"
                    />
                  </Card>
                </Col>
                <Col span={8}>
                  <Card size="small">
                    <div style={{ textAlign: 'center' }}>
                      <div style={{ fontSize: 24, fontWeight: 'bold' }}>
                        <Tag color={getQualityGrade(selectedRecord.qualityScore).color}>
                          {selectedRecord.qualityScore}分
                        </Tag>
                      </div>
                      <div style={{ color: '#666' }}>质量评分</div>
                    </div>
                  </Card>
                </Col>
              </Row>
              <Row gutter={16} style={{ marginTop: 16 }}>
                <Col span={12}>
                  <Card size="small">
                    <Statistic
                      title="预期产量"
                      value={selectedRecord.expectedYield}
                      suffix="Gb"
                      precision={1}
                    />
                  </Card>
                </Col>
                <Col span={12}>
                  <Card size="small">
                    <Statistic
                      title="实际产量"
                      value={selectedRecord.actualYield || 0}
                      suffix="Gb"
                      precision={1}
                      valueStyle={{ 
                        color: selectedRecord.actualYield && selectedRecord.actualYield >= selectedRecord.expectedYield ? '#3f8600' : '#cf1322' 
                      }}
                    />
                  </Card>
                </Col>
              </Row>
            </TabPane>
            <TabPane tab="构建流程" key="3">
              <Steps
                direction="vertical"
                size="small"
                current={2}
                items={mockLibrarySteps.map(step => ({
                  title: step.stepName,
                  description: (
                    <div>
                      <div>{step.description}</div>
                      <div style={{ fontSize: 12, color: '#666', marginTop: 4 }}>
                        预计耗时: {step.duration}分钟
                        {step.temperature && ` | 温度: ${step.temperature}°C`}
                        {step.cycles && ` | 循环数: ${step.cycles}`}
                      </div>
                      <div style={{ fontSize: 12, color: '#999', marginTop: 2 }}>
                        设备: {step.equipment} | 试剂: {step.reagents.join(', ')}
                      </div>
                      {step.qcMetrics && (
                        <div style={{ fontSize: 12, color: '#1890ff', marginTop: 2 }}>
                          QC: 
                          {step.qcMetrics.concentration && ` 浓度${step.qcMetrics.concentration}ng/μl`}
                          {step.qcMetrics.volume && ` 体积${step.qcMetrics.volume}μl`}
                          {step.qcMetrics.purity && ` 纯度${step.qcMetrics.purity}`}
                        </div>
                      )}
                    </div>
                  ),
                  status: step.status === 'failed' ? 'error' : 
                          step.status === 'in_progress' ? 'process' :
                          step.status === 'completed' ? 'finish' : 'wait'
                }))}
              />
            </TabPane>
          </Tabs>
        )}
      </Modal>

      {/* 质量检测模态框 */}
      <Modal
        title="文库质量检测"
        open={qcModalVisible}
        onCancel={() => setQcModalVisible(false)}
        footer={null}
        width={700}
      >
        {selectedRecord && (
          <div>
            <Alert
              message="质量检测结果"
              description={`文库 ${selectedRecord.sampleCode} 的质量检测已完成，各项指标如下：`}
              type="info"
              showIcon
              style={{ marginBottom: 16 }}
            />
            
            <List
              itemLayout="horizontal"
              dataSource={[
                {
                  title: '浓度检测',
                  value: `${selectedRecord.concentration} ng/μl`,
                  status: selectedRecord.concentration > 10 ? 'success' : 'warning',
                  description: '推荐浓度 > 10 ng/μl'
                },
                {
                  title: '片段大小分布',
                  value: `${selectedRecord.insertSize} bp`,
                  status: 'success',
                  description: '片段大小符合预期'
                },
                {
                  title: '文库摩尔浓度',
                  value: `${selectedRecord.molarity} nM`,
                  status: selectedRecord.molarity > 2 ? 'success' : 'warning',
                  description: '推荐摩尔浓度 > 2 nM'
                },
                {
                  title: '质量评分',
                  value: `${selectedRecord.qualityScore} 分`,
                  status: getQualityGrade(selectedRecord.qualityScore).color,
                  description: getQualityGrade(selectedRecord.qualityScore).text
                }
              ]}
              renderItem={(item) => (
                <List.Item>
                  <List.Item.Meta
                    avatar={
                      <Avatar 
                        icon={item.status === 'success' ? <CheckCircleOutlined /> : <ExclamationCircleOutlined />}
                        style={{ 
                          backgroundColor: item.status === 'success' ? '#52c41a' : 
                                           item.status === 'warning' ? '#faad14' : '#ff4d4f'
                        }}
                      />
                    }
                    title={item.title}
                    description={item.description}
                  />
                  <div style={{ fontWeight: 'bold', fontSize: 16 }}>{item.value}</div>
                </List.Item>
              )}
            />
          </div>
        )}
      </Modal>
    </div>
  )
}

export default LibraryConstruction