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
  Avatar,
  Tree,
  Drawer,
  Switch,
  Slider,
  Upload,
  Typography
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
  BranchesOutlined,
  ThunderboltOutlined,
  SettingOutlined,
  LineChartOutlined,
  CloudServerOutlined,
  CodeOutlined,
  DatabaseOutlined,
  MonitorOutlined,
  RocketOutlined,
  StopOutlined,
  ReloadOutlined,
  DownloadOutlined,
  UploadOutlined,
  FolderOutlined,
  FileOutlined
} from '@ant-design/icons'
import type { ColumnsType } from 'antd/es/table'
import dayjs from 'dayjs'

const { Search } = Input
const { Option } = Select
const { TextArea } = Input
const { TabPane } = Tabs
const { Text, Title } = Typography

/**
 * 分析流程状态枚举
 */
type PipelineStatus = 'pending' | 'running' | 'completed' | 'failed' | 'paused' | 'cancelled'

/**
 * 分析类型枚举
 */
type AnalysisType = 'wgs' | 'wes' | 'rna_seq' | 'chip_seq' | 'atac_seq' | 'metagenome' | 'amplicon' | 'single_cell'

/**
 * 计算资源类型枚举
 */
type ResourceType = 'cpu' | 'gpu' | 'memory' | 'storage'

/**
 * 分析流程记录接口
 */
interface PipelineRecord {
  id: string
  pipelineName: string
  analysisType: AnalysisType
  sampleCount: number
  status: PipelineStatus
  progress: number
  startTime: string
  endTime?: string
  estimatedTime: number
  actualTime?: number
  operator: string
  priority: 'low' | 'medium' | 'high' | 'urgent'
  version: string
  description?: string
  inputPath: string
  outputPath: string
  configFile: string
  logFile: string
  resources: {
    cpu: number
    memory: number
    storage: number
    gpu?: number
  }
  steps: PipelineStep[]
  parameters: Record<string, any>
  qcMetrics?: {
    totalReads: number
    mappedReads: number
    mappingRate: number
    duplicateRate: number
    coverage: number
  }
}

/**
 * 流程步骤接口
 */
interface PipelineStep {
  id: string
  stepName: string
  description: string
  command: string
  status: PipelineStatus
  progress: number
  startTime?: string
  endTime?: string
  duration?: number
  inputFiles: string[]
  outputFiles: string[]
  parameters: Record<string, any>
  resources: {
    cpu: number
    memory: number
    storage?: number
  }
  errorMessage?: string
  logPath?: string
}

/**
 * 分析流程页面组件
 * 
 * 功能特性：
 * - 生物信息学分析流程管理
 * - 多种分析类型支持
 * - 实时进度监控
 * - 计算资源管理
 * - 参数配置管理
 * - 质量控制报告
 */
const AnalysisPipeline: React.FC = () => {
  // 状态管理
  const [loading, setLoading] = useState(false)
  const [pipelineData, setPipelineData] = useState<PipelineRecord[]>([])
  const [selectedRecord, setSelectedRecord] = useState<PipelineRecord | null>(null)
  const [modalVisible, setModalVisible] = useState(false)
  const [detailModalVisible, setDetailModalVisible] = useState(false)
  const [configDrawerVisible, setConfigDrawerVisible] = useState(false)
  const [monitorDrawerVisible, setMonitorDrawerVisible] = useState(false)
  const [editingRecord, setEditingRecord] = useState<PipelineRecord | null>(null)
  const [searchText, setSearchText] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('')
  const [typeFilter, setTypeFilter] = useState<string>('')
  const [priorityFilter, setPriorityFilter] = useState<string>('')
  const [form] = Form.useForm()

  /**
   * 模拟分析流程数据
   */
  const mockPipelineData: PipelineRecord[] = [
    {
      id: '1',
      pipelineName: '全基因组测序分析',
      analysisType: 'wgs',
      sampleCount: 24,
      status: 'running',
      progress: 65,
      startTime: '2024-01-15 09:00:00',
      estimatedTime: 480,
      actualTime: 312,
      operator: '张三',
      priority: 'high',
      version: 'v2.1.0',
      description: '人类全基因组重测序分析流程',
      inputPath: '/data/input/wgs_batch_001',
      outputPath: '/data/output/wgs_batch_001',
      configFile: '/config/wgs_config.yaml',
      logFile: '/logs/wgs_batch_001.log',
      resources: {
        cpu: 32,
        memory: 128,
        storage: 2048
      },
      steps: [],
      parameters: {
        reference_genome: 'hg38',
        min_mapping_quality: 20,
        variant_calling: true,
        annotation: true
      },
      qcMetrics: {
        totalReads: 1500000000,
        mappedReads: 1425000000,
        mappingRate: 95.0,
        duplicateRate: 12.5,
        coverage: 30.2
      }
    },
    {
      id: '2',
      pipelineName: 'RNA测序差异表达分析',
      analysisType: 'rna_seq',
      sampleCount: 12,
      status: 'completed',
      progress: 100,
      startTime: '2024-01-14 08:30:00',
      endTime: '2024-01-14 16:45:00',
      estimatedTime: 360,
      actualTime: 495,
      operator: '李四',
      priority: 'medium',
      version: 'v1.8.2',
      description: '转录组差异表达基因分析',
      inputPath: '/data/input/rnaseq_batch_002',
      outputPath: '/data/output/rnaseq_batch_002',
      configFile: '/config/rnaseq_config.yaml',
      logFile: '/logs/rnaseq_batch_002.log',
      resources: {
        cpu: 16,
        memory: 64,
        storage: 1024
      },
      steps: [],
      parameters: {
        reference_genome: 'hg38',
        gene_annotation: 'gencode_v38',
        differential_analysis: true,
        pathway_analysis: true
      },
      qcMetrics: {
        totalReads: 800000000,
        mappedReads: 760000000,
        mappingRate: 95.0,
        duplicateRate: 8.2,
        coverage: 25.8
      }
    },
    {
      id: '3',
      pipelineName: '宏基因组分类分析',
      analysisType: 'metagenome',
      sampleCount: 48,
      status: 'pending',
      progress: 0,
      startTime: '2024-01-16 10:00:00',
      estimatedTime: 720,
      operator: '王五',
      priority: 'low',
      version: 'v3.0.1',
      description: '微生物群落结构和功能分析',
      inputPath: '/data/input/metagenome_batch_003',
      outputPath: '/data/output/metagenome_batch_003',
      configFile: '/config/metagenome_config.yaml',
      logFile: '/logs/metagenome_batch_003.log',
      resources: {
        cpu: 64,
        memory: 256,
        storage: 4096
      },
      steps: [],
      parameters: {
        database: 'kraken2_standard',
        assembly: true,
        binning: true,
        functional_annotation: true
      }
    }
  ]

  /**
   * 模拟流程步骤数据
   */
  const mockPipelineSteps: PipelineStep[] = [
    {
      id: '1',
      stepName: '质量控制',
      description: '原始数据质量评估和过滤',
      command: 'fastp -i input.fq.gz -o output.fq.gz',
      status: 'completed',
      progress: 100,
      startTime: '2024-01-15 09:00:00',
      endTime: '2024-01-15 09:30:00',
      duration: 30,
      inputFiles: ['sample_R1.fq.gz', 'sample_R2.fq.gz'],
      outputFiles: ['sample_clean_R1.fq.gz', 'sample_clean_R2.fq.gz'],
      parameters: {
        min_length: 50,
        quality_threshold: 20
      },
      resources: {
        cpu: 4,
        memory: 8
      },
      logPath: '/logs/qc_step.log'
    },
    {
      id: '2',
      stepName: '序列比对',
      description: '将测序reads比对到参考基因组',
      command: 'bwa mem ref.fa input_R1.fq.gz input_R2.fq.gz',
      status: 'completed',
      progress: 100,
      startTime: '2024-01-15 09:30:00',
      endTime: '2024-01-15 11:15:00',
      duration: 105,
      inputFiles: ['sample_clean_R1.fq.gz', 'sample_clean_R2.fq.gz'],
      outputFiles: ['sample_aligned.bam'],
      parameters: {
        reference: 'hg38',
        threads: 16
      },
      resources: {
        cpu: 16,
        memory: 32
      },
      logPath: '/logs/alignment_step.log'
    },
    {
      id: '3',
      stepName: '变异检测',
      description: '检测SNP和InDel变异',
      command: 'gatk HaplotypeCaller -R ref.fa -I input.bam',
      status: 'running',
      progress: 45,
      startTime: '2024-01-15 11:15:00',
      inputFiles: ['sample_aligned.bam'],
      outputFiles: ['sample_variants.vcf'],
      parameters: {
        min_base_quality: 20,
        min_mapping_quality: 20
      },
      resources: {
        cpu: 8,
        memory: 16
      },
      logPath: '/logs/variant_calling_step.log'
    },
    {
      id: '4',
      stepName: '变异注释',
      description: '对检测到的变异进行功能注释',
      command: 'annovar input.vcf humandb/',
      status: 'pending',
      progress: 0,
      inputFiles: ['sample_variants.vcf'],
      outputFiles: ['sample_annotated.vcf'],
      parameters: {
        database: 'refGene,clinvar,gnomad'
      },
      resources: {
        cpu: 4,
        memory: 8
      }
    }
  ]

  /**
   * 组件初始化
   */
  useEffect(() => {
    loadPipelineData()
  }, [])

  /**
   * 加载流程数据
   */
  const loadPipelineData = async () => {
    setLoading(true)
    try {
      // 模拟API调用
      await new Promise(resolve => setTimeout(resolve, 1000))
      setPipelineData(mockPipelineData)
    } catch (error) {
      console.error('加载流程数据失败:', error)
    } finally {
      setLoading(false)
    }
  }

  /**
   * 获取分析类型文本
   */
  const getAnalysisTypeText = (type: AnalysisType) => {
    const textMap = {
      wgs: '全基因组测序',
      wes: '全外显子测序',
      rna_seq: 'RNA测序',
      chip_seq: 'ChIP测序',
      atac_seq: 'ATAC测序',
      metagenome: '宏基因组',
      amplicon: '扩增子测序',
      single_cell: '单细胞测序'
    }
    return textMap[type]
  }

  /**
   * 获取分析类型颜色
   */
  const getAnalysisTypeColor = (type: AnalysisType) => {
    const colorMap = {
      wgs: 'blue',
      wes: 'cyan',
      rna_seq: 'green',
      chip_seq: 'orange',
      atac_seq: 'purple',
      metagenome: 'magenta',
      amplicon: 'gold',
      single_cell: 'red'
    }
    return colorMap[type]
  }

  /**
   * 获取状态颜色
   */
  const getStatusColor = (status: PipelineStatus) => {
    const colorMap = {
      pending: 'default',
      running: 'processing',
      completed: 'success',
      failed: 'error',
      paused: 'warning',
      cancelled: 'default'
    }
    return colorMap[status]
  }

  /**
   * 获取状态文本
   */
  const getStatusText = (status: PipelineStatus) => {
    const textMap = {
      pending: '等待中',
      running: '运行中',
      completed: '已完成',
      failed: '失败',
      paused: '已暂停',
      cancelled: '已取消'
    }
    return textMap[status]
  }

  /**
   * 获取优先级颜色
   */
  const getPriorityColor = (priority: string) => {
    const colorMap = {
      low: 'default',
      medium: 'processing',
      high: 'warning',
      urgent: 'error'
    }
    return colorMap[priority as keyof typeof colorMap]
  }

  /**
   * 获取优先级文本
   */
  const getPriorityText = (priority: string) => {
    const textMap = {
      low: '低',
      medium: '中',
      high: '高',
      urgent: '紧急'
    }
    return textMap[priority as keyof typeof textMap]
  }

  /**
   * 新增分析流程
   */
  const handleAdd = () => {
    setEditingRecord(null)
    form.resetFields()
    setModalVisible(true)
  }

  /**
   * 编辑分析流程
   */
  const handleEdit = (record: PipelineRecord) => {
    setEditingRecord(record)
    form.setFieldsValue(record)
    setModalVisible(true)
  }

  /**
   * 查看详情
   */
  const handleViewDetail = (record: PipelineRecord) => {
    setSelectedRecord(record)
    setDetailModalVisible(true)
  }

  /**
   * 配置管理
   */
  const handleConfig = (record: PipelineRecord) => {
    setSelectedRecord(record)
    setConfigDrawerVisible(true)
  }

  /**
   * 实时监控
   */
  const handleMonitor = (record: PipelineRecord) => {
    setSelectedRecord(record)
    setMonitorDrawerVisible(true)
  }

  /**
   * 启动流程
   */
  const handleStart = async (id: string) => {
    try {
      // 模拟API调用
      await new Promise(resolve => setTimeout(resolve, 500))
      setPipelineData(prev => prev.map(item => 
        item.id === id ? { 
          ...item, 
          status: 'running' as PipelineStatus,
          startTime: dayjs().format('YYYY-MM-DD HH:mm:ss')
        } : item
      ))
      message.success('流程启动成功')
    } catch (error) {
      message.error('启动失败')
    }
  }

  /**
   * 暂停流程
   */
  const handlePause = async (id: string) => {
    try {
      // 模拟API调用
      await new Promise(resolve => setTimeout(resolve, 500))
      setPipelineData(prev => prev.map(item => 
        item.id === id ? { ...item, status: 'paused' as PipelineStatus } : item
      ))
      message.success('流程已暂停')
    } catch (error) {
      message.error('暂停失败')
    }
  }

  /**
   * 停止流程
   */
  const handleStop = async (id: string) => {
    try {
      // 模拟API调用
      await new Promise(resolve => setTimeout(resolve, 500))
      setPipelineData(prev => prev.map(item => 
        item.id === id ? { 
          ...item, 
          status: 'cancelled' as PipelineStatus,
          endTime: dayjs().format('YYYY-MM-DD HH:mm:ss')
        } : item
      ))
      message.success('流程已停止')
    } catch (error) {
      message.error('停止失败')
    }
  }

  /**
   * 重启流程
   */
  const handleRestart = async (id: string) => {
    try {
      // 模拟API调用
      await new Promise(resolve => setTimeout(resolve, 500))
      setPipelineData(prev => prev.map(item => 
        item.id === id ? { 
          ...item, 
          status: 'running' as PipelineStatus,
          progress: 0,
          startTime: dayjs().format('YYYY-MM-DD HH:mm:ss'),
          endTime: undefined
        } : item
      ))
      message.success('流程重启成功')
    } catch (error) {
      message.error('重启失败')
    }
  }

  /**
   * 删除记录
   */
  const handleDelete = async (id: string) => {
    try {
      // 模拟API调用
      await new Promise(resolve => setTimeout(resolve, 500))
      setPipelineData(prev => prev.filter(item => item.id !== id))
      message.success('删除成功')
    } catch (error) {
      message.error('删除失败')
    }
  }

  /**
   * 保存流程记录
   */
  const handleSave = async (values: any) => {
    try {
      // 模拟API调用
      await new Promise(resolve => setTimeout(resolve, 500))
      
      if (editingRecord) {
        // 更新
        setPipelineData(prev => prev.map(item => 
          item.id === editingRecord.id ? { ...item, ...values } : item
        ))
        message.success('更新成功')
      } else {
        // 新增
        const newRecord: PipelineRecord = {
          id: Date.now().toString(),
          ...values,
          status: 'pending' as PipelineStatus,
          progress: 0,
          startTime: dayjs().format('YYYY-MM-DD HH:mm:ss'),
          operator: '当前用户',
          steps: [],
          parameters: {}
        }
        setPipelineData(prev => [...prev, newRecord])
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
  const filteredData = pipelineData.filter(item => {
    const matchSearch = !searchText || 
      item.pipelineName.toLowerCase().includes(searchText.toLowerCase()) ||
      item.description?.toLowerCase().includes(searchText.toLowerCase()) ||
      item.operator.toLowerCase().includes(searchText.toLowerCase())
    
    const matchStatus = !statusFilter || item.status === statusFilter
    const matchType = !typeFilter || item.analysisType === typeFilter
    const matchPriority = !priorityFilter || item.priority === priorityFilter
    
    return matchSearch && matchStatus && matchType && matchPriority
  })

  /**
   * 表格列定义
   */
  const columns: ColumnsType<PipelineRecord> = [
    {
      title: '流程名称',
      dataIndex: 'pipelineName',
      key: 'pipelineName',
      width: 200,
      fixed: 'left',
      ellipsis: true
    },
    {
      title: '分析类型',
      dataIndex: 'analysisType',
      key: 'analysisType',
      width: 120,
      render: (type: AnalysisType) => (
        <Tag color={getAnalysisTypeColor(type)} icon={<ExperimentOutlined />}>
          {getAnalysisTypeText(type)}
        </Tag>
      )
    },
    {
      title: '样本数量',
      dataIndex: 'sampleCount',
      key: 'sampleCount',
      width: 100,
      render: (count: number) => (
        <Badge count={count} showZero color="blue" />
      )
    },
    {
      title: '优先级',
      dataIndex: 'priority',
      key: 'priority',
      width: 80,
      render: (priority: string) => (
        <Tag color={getPriorityColor(priority)}>
          {getPriorityText(priority)}
        </Tag>
      )
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: (status: PipelineStatus) => (
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
      title: '资源使用',
      key: 'resources',
      width: 120,
      render: (_, record) => (
        <div style={{ fontSize: 12 }}>
          <div>CPU: {record.resources.cpu}核</div>
          <div>内存: {record.resources.memory}GB</div>
        </div>
      )
    },
    {
      title: '版本',
      dataIndex: 'version',
      key: 'version',
      width: 80,
      render: (version: string) => (
        <Tag icon={<CodeOutlined />}>{version}</Tag>
      )
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
      title: '预计耗时',
      dataIndex: 'estimatedTime',
      key: 'estimatedTime',
      width: 100,
      render: (time: number) => `${Math.floor(time / 60)}h${time % 60}m`
    },
    {
      title: '操作',
      key: 'action',
      width: 250,
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
          <Tooltip title="实时监控">
            <Button
              type="text"
              icon={<MonitorOutlined />}
              onClick={() => handleMonitor(record)}
            />
          </Tooltip>
          <Tooltip title="配置管理">
            <Button
              type="text"
              icon={<SettingOutlined />}
              onClick={() => handleConfig(record)}
            />
          </Tooltip>
          {record.status === 'pending' && (
            <Tooltip title="启动">
              <Button
                type="text"
                icon={<PlayCircleOutlined />}
                onClick={() => handleStart(record.id)}
              />
            </Tooltip>
          )}
          {record.status === 'running' && (
            <>
              <Tooltip title="暂停">
                <Button
                  type="text"
                  icon={<PauseCircleOutlined />}
                  onClick={() => handlePause(record.id)}
                />
              </Tooltip>
              <Tooltip title="停止">
                <Button
                  type="text"
                  icon={<StopOutlined />}
                  onClick={() => handleStop(record.id)}
                />
              </Tooltip>
            </>
          )}
          {(record.status === 'paused' || record.status === 'failed') && (
            <Tooltip title="重启">
              <Button
                type="text"
                icon={<ReloadOutlined />}
                onClick={() => handleRestart(record.id)}
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
            title="确定要删除这个流程吗？"
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
              title="总流程数"
              value={pipelineData.length}
              prefix={<BranchesOutlined />}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card size="small">
            <Statistic
              title="运行中"
              value={pipelineData.filter(item => item.status === 'running').length}
              valueStyle={{ color: '#1890ff' }}
              prefix={<RocketOutlined />}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card size="small">
            <Statistic
              title="已完成"
              value={pipelineData.filter(item => item.status === 'completed').length}
              valueStyle={{ color: '#3f8600' }}
              prefix={<CheckCircleOutlined />}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card size="small">
            <Statistic
              title="等待中"
              value={pipelineData.filter(item => item.status === 'pending').length}
              valueStyle={{ color: '#faad14' }}
              prefix={<ClockCircleOutlined />}
            />
          </Card>
        </Col>
      </Row>

      {/* 失败提醒 */}
      {pipelineData.some(item => item.status === 'failed') && (
        <Alert
          message="发现失败的分析流程"
          description={`有 ${pipelineData.filter(item => item.status === 'failed').length} 个流程执行失败，请检查日志并重新运行`}
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
              placeholder="搜索流程名称、描述或操作人"
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              onSearch={loadPipelineData}
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
              <Option value="pending">等待中</Option>
              <Option value="running">运行中</Option>
              <Option value="completed">已完成</Option>
              <Option value="failed">失败</Option>
              <Option value="paused">已暂停</Option>
              <Option value="cancelled">已取消</Option>
            </Select>
          </Col>
          <Col span={3}>
            <Select
              placeholder="分析类型"
              value={typeFilter}
              onChange={setTypeFilter}
              allowClear
              style={{ width: '100%' }}
            >
              <Option value="wgs">全基因组测序</Option>
              <Option value="wes">全外显子测序</Option>
              <Option value="rna_seq">RNA测序</Option>
              <Option value="chip_seq">ChIP测序</Option>
              <Option value="atac_seq">ATAC测序</Option>
              <Option value="metagenome">宏基因组</Option>
              <Option value="amplicon">扩增子测序</Option>
              <Option value="single_cell">单细胞测序</Option>
            </Select>
          </Col>
          <Col span={3}>
            <Select
              placeholder="优先级"
              value={priorityFilter}
              onChange={setPriorityFilter}
              allowClear
              style={{ width: '100%' }}
            >
              <Option value="low">低</Option>
              <Option value="medium">中</Option>
              <Option value="high">高</Option>
              <Option value="urgent">紧急</Option>
            </Select>
          </Col>
          <Col span={5}>
            <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd} style={{ marginRight: 8 }}>
              新建流程
            </Button>
            <Button onClick={loadPipelineData} loading={loading}>
              刷新
            </Button>
          </Col>
        </Row>
      </Card>

      {/* 流程数据表格 */}
      <Card title="分析流程列表" size="small">
        <Table
          columns={columns}
          dataSource={filteredData}
          rowKey="id"
          loading={loading}
          scroll={{ x: 2000 }}
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
        title={editingRecord ? '编辑分析流程' : '新建分析流程'}
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
                name="pipelineName"
                label="流程名称"
                rules={[{ required: true, message: '请输入流程名称' }]}
              >
                <Input placeholder="请输入流程名称" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="analysisType"
                label="分析类型"
                rules={[{ required: true, message: '请选择分析类型' }]}
              >
                <Select placeholder="请选择分析类型">
                  <Option value="wgs">全基因组测序</Option>
                  <Option value="wes">全外显子测序</Option>
                  <Option value="rna_seq">RNA测序</Option>
                  <Option value="chip_seq">ChIP测序</Option>
                  <Option value="atac_seq">ATAC测序</Option>
                  <Option value="metagenome">宏基因组</Option>
                  <Option value="amplicon">扩增子测序</Option>
                  <Option value="single_cell">单细胞测序</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={8}>
              <Form.Item
                name="sampleCount"
                label="样本数量"
                rules={[{ required: true, message: '请输入样本数量' }]}
              >
                <InputNumber min={1} style={{ width: '100%' }} />
              </Form.Item>
            </Col>
            <Col span={8}>
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
            <Col span={8}>
              <Form.Item
                name="estimatedTime"
                label="预计耗时(分钟)"
                rules={[{ required: true, message: '请输入预计耗时' }]}
              >
                <InputNumber min={1} style={{ width: '100%' }} />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="inputPath"
                label="输入路径"
                rules={[{ required: true, message: '请输入输入路径' }]}
              >
                <Input placeholder="/data/input/project_name" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="outputPath"
                label="输出路径"
                rules={[{ required: true, message: '请输入输出路径' }]}
              >
                <Input placeholder="/data/output/project_name" />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={8}>
              <Form.Item
                name={['resources', 'cpu']}
                label="CPU核数"
                rules={[{ required: true, message: '请输入CPU核数' }]}
              >
                <InputNumber min={1} max={128} style={{ width: '100%' }} />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                name={['resources', 'memory']}
                label="内存(GB)"
                rules={[{ required: true, message: '请输入内存大小' }]}
              >
                <InputNumber min={1} max={1024} style={{ width: '100%' }} />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                name={['resources', 'storage']}
                label="存储(GB)"
                rules={[{ required: true, message: '请输入存储大小' }]}
              >
                <InputNumber min={1} max={10240} style={{ width: '100%' }} />
              </Form.Item>
            </Col>
          </Row>
          <Form.Item
            name="description"
            label="描述"
          >
            <TextArea rows={3} placeholder="请输入流程描述" />
          </Form.Item>
        </Form>
      </Modal>

      {/* 详情模态框 */}
      <Modal
        title="分析流程详情"
        open={detailModalVisible}
        onCancel={() => setDetailModalVisible(false)}
        footer={null}
        width={1000}
      >
        {selectedRecord && (
          <Tabs defaultActiveKey="1">
            <TabPane tab="基本信息" key="1">
              <Descriptions bordered size="small" column={2}>
                <Descriptions.Item label="流程名称" span={2}>{selectedRecord.pipelineName}</Descriptions.Item>
                <Descriptions.Item label="分析类型">
                  <Tag color={getAnalysisTypeColor(selectedRecord.analysisType)}>
                    {getAnalysisTypeText(selectedRecord.analysisType)}
                  </Tag>
                </Descriptions.Item>
                <Descriptions.Item label="样本数量">
                  <Badge count={selectedRecord.sampleCount} showZero color="blue" />
                </Descriptions.Item>
                <Descriptions.Item label="优先级">
                  <Tag color={getPriorityColor(selectedRecord.priority)}>
                    {getPriorityText(selectedRecord.priority)}
                  </Tag>
                </Descriptions.Item>
                <Descriptions.Item label="状态">
                  <Tag color={getStatusColor(selectedRecord.status)}>
                    {getStatusText(selectedRecord.status)}
                  </Tag>
                </Descriptions.Item>
                <Descriptions.Item label="版本">
                  <Tag icon={<CodeOutlined />}>{selectedRecord.version}</Tag>
                </Descriptions.Item>
                <Descriptions.Item label="操作人">{selectedRecord.operator}</Descriptions.Item>
                <Descriptions.Item label="开始时间">{selectedRecord.startTime}</Descriptions.Item>
                <Descriptions.Item label="结束时间">
                  {selectedRecord.endTime || '-'}
                </Descriptions.Item>
                <Descriptions.Item label="输入路径" span={2}>
                  <Text code>{selectedRecord.inputPath}</Text>
                </Descriptions.Item>
                <Descriptions.Item label="输出路径" span={2}>
                  <Text code>{selectedRecord.outputPath}</Text>
                </Descriptions.Item>
                <Descriptions.Item label="描述" span={2}>
                  {selectedRecord.description || '-'}
                </Descriptions.Item>
              </Descriptions>
            </TabPane>
            <TabPane tab="执行步骤" key="2">
              <Steps
                direction="vertical"
                size="small"
                current={2}
                items={mockPipelineSteps.map(step => ({
                  title: step.stepName,
                  description: (
                    <div>
                      <div>{step.description}</div>
                      <div style={{ fontSize: 12, color: '#666', marginTop: 4 }}>
                        命令: <Text code style={{ fontSize: 11 }}>{step.command}</Text>
                      </div>
                      <div style={{ fontSize: 12, color: '#999', marginTop: 2 }}>
                        资源: CPU {step.resources.cpu}核 | 内存 {step.resources.memory}GB
                        {step.duration && ` | 耗时 ${step.duration}分钟`}
                      </div>
                      {step.progress > 0 && (
                        <Progress 
                          percent={step.progress} 
                          size="small" 
                          style={{ marginTop: 4 }}
                        />
                      )}
                    </div>
                  ),
                  status: step.status === 'failed' ? 'error' : 
                          step.status === 'running' ? 'process' :
                          step.status === 'completed' ? 'finish' : 'wait'
                }))}
              />
            </TabPane>
            <TabPane tab="质控指标" key="3">
              {selectedRecord.qcMetrics && (
                <Row gutter={16}>
                  <Col span={8}>
                    <Card size="small">
                      <Statistic
                        title="总读数"
                        value={selectedRecord.qcMetrics.totalReads}
                        formatter={(value) => `${(Number(value) / 1000000).toFixed(1)}M`}
                      />
                    </Card>
                  </Col>
                  <Col span={8}>
                    <Card size="small">
                      <Statistic
                        title="比对读数"
                        value={selectedRecord.qcMetrics.mappedReads}
                        formatter={(value) => `${(Number(value) / 1000000).toFixed(1)}M`}
                      />
                    </Card>
                  </Col>
                  <Col span={8}>
                    <Card size="small">
                      <Statistic
                        title="比对率"
                        value={selectedRecord.qcMetrics.mappingRate}
                        suffix="%"
                        precision={1}
                        valueStyle={{ 
                          color: selectedRecord.qcMetrics.mappingRate > 90 ? '#3f8600' : '#cf1322' 
                        }}
                      />
                    </Card>
                  </Col>
                  <Col span={8} style={{ marginTop: 16 }}>
                    <Card size="small">
                      <Statistic
                        title="重复率"
                        value={selectedRecord.qcMetrics.duplicateRate}
                        suffix="%"
                        precision={1}
                        valueStyle={{ 
                          color: selectedRecord.qcMetrics.duplicateRate < 20 ? '#3f8600' : '#cf1322' 
                        }}
                      />
                    </Card>
                  </Col>
                  <Col span={8} style={{ marginTop: 16 }}>
                    <Card size="small">
                      <Statistic
                        title="平均覆盖度"
                        value={selectedRecord.qcMetrics.coverage}
                        suffix="X"
                        precision={1}
                      />
                    </Card>
                  </Col>
                </Row>
              )}
            </TabPane>
          </Tabs>
        )}
      </Modal>

      {/* 配置管理抽屉 */}
      <Drawer
        title="流程配置管理"
        placement="right"
        onClose={() => setConfigDrawerVisible(false)}
        open={configDrawerVisible}
        width={600}
      >
        {selectedRecord && (
          <div>
            <Title level={5}>参数配置</Title>
            <Descriptions bordered size="small" column={1}>
              {Object.entries(selectedRecord.parameters).map(([key, value]) => (
                <Descriptions.Item key={key} label={key}>
                  <Text code>{String(value)}</Text>
                </Descriptions.Item>
              ))}
            </Descriptions>
            
            <Divider />
            
            <Title level={5}>资源配置</Title>
            <Row gutter={16}>
              <Col span={12}>
                <Card size="small">
                  <Statistic
                    title="CPU核数"
                    value={selectedRecord.resources.cpu}
                    suffix="核"
                  />
                </Card>
              </Col>
              <Col span={12}>
                <Card size="small">
                  <Statistic
                    title="内存"
                    value={selectedRecord.resources.memory}
                    suffix="GB"
                  />
                </Card>
              </Col>
              <Col span={12} style={{ marginTop: 16 }}>
                <Card size="small">
                  <Statistic
                    title="存储"
                    value={selectedRecord.resources.storage}
                    suffix="GB"
                  />
                </Card>
              </Col>
              {selectedRecord.resources.gpu && (
                <Col span={12} style={{ marginTop: 16 }}>
                  <Card size="small">
                    <Statistic
                      title="GPU"
                      value={selectedRecord.resources.gpu}
                      suffix="卡"
                    />
                  </Card>
                </Col>
              )}
            </Row>
            
            <Divider />
            
            <Title level={5}>文件路径</Title>
            <List
              size="small"
              dataSource={[
                { label: '配置文件', path: selectedRecord.configFile },
                { label: '日志文件', path: selectedRecord.logFile },
                { label: '输入路径', path: selectedRecord.inputPath },
                { label: '输出路径', path: selectedRecord.outputPath }
              ]}
              renderItem={(item) => (
                <List.Item>
                  <List.Item.Meta
                    avatar={<FolderOutlined />}
                    title={item.label}
                    description={<Text code>{item.path}</Text>}
                  />
                  <Button type="text" icon={<DownloadOutlined />} size="small" />
                </List.Item>
              )}
            />
          </div>
        )}
      </Drawer>

      {/* 实时监控抽屉 */}
      <Drawer
        title="实时监控"
        placement="right"
        onClose={() => setMonitorDrawerVisible(false)}
        open={monitorDrawerVisible}
        width={700}
      >
        {selectedRecord && (
          <div>
            <Alert
              message="流程运行状态"
              description={`${selectedRecord.pipelineName} 当前${getStatusText(selectedRecord.status)}`}
              type={selectedRecord.status === 'running' ? 'info' : 
                    selectedRecord.status === 'completed' ? 'success' : 
                    selectedRecord.status === 'failed' ? 'error' : 'warning'}
              showIcon
              style={{ marginBottom: 16 }}
            />
            
            <Progress 
              percent={selectedRecord.progress} 
              status={selectedRecord.status === 'failed' ? 'exception' : 'active'}
              style={{ marginBottom: 16 }}
            />
            
            <Row gutter={16} style={{ marginBottom: 16 }}>
              <Col span={8}>
                <Card size="small">
                  <Statistic
                    title="已用时间"
                    value={selectedRecord.actualTime || 0}
                    suffix="分钟"
                  />
                </Card>
              </Col>
              <Col span={8}>
                <Card size="small">
                  <Statistic
                    title="预计时间"
                    value={selectedRecord.estimatedTime}
                    suffix="分钟"
                  />
                </Card>
              </Col>
              <Col span={8}>
                <Card size="small">
                  <Statistic
                    title="剩余时间"
                    value={Math.max(0, selectedRecord.estimatedTime - (selectedRecord.actualTime || 0))}
                    suffix="分钟"
                    valueStyle={{ color: '#1890ff' }}
                  />
                </Card>
              </Col>
            </Row>
            
            <Title level={5}>步骤进度</Title>
            <Timeline
              items={mockPipelineSteps.map(step => ({
                color: step.status === 'completed' ? 'green' :
                       step.status === 'running' ? 'blue' :
                       step.status === 'failed' ? 'red' : 'gray',
                children: (
                  <div>
                    <div style={{ fontWeight: 'bold' }}>{step.stepName}</div>
                    <div style={{ fontSize: 12, color: '#666' }}>{step.description}</div>
                    {step.progress > 0 && (
                      <Progress 
                        percent={step.progress} 
                        size="small" 
                        style={{ marginTop: 4, width: 200 }}
                      />
                    )}
                    {step.startTime && (
                      <div style={{ fontSize: 11, color: '#999', marginTop: 2 }}>
                        开始: {dayjs(step.startTime).format('HH:mm:ss')}
                        {step.endTime && ` | 结束: ${dayjs(step.endTime).format('HH:mm:ss')}`}
                      </div>
                    )}
                  </div>
                )
              }))}
            />
          </div>
        )}
      </Drawer>
    </div>
  )
}

export default AnalysisPipeline