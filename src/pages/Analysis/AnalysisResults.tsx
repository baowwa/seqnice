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
  Typography,
  Image,
  Collapse,
  Empty,
  Spin
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
  FileOutlined,
  PictureOutlined,
  FilePdfOutlined,
  FileExcelOutlined,
  FileZipOutlined,
  ShareAltOutlined,
  StarOutlined,
  FilterOutlined,
  SortAscendingOutlined,
  BarChartOutlined,
  DotChartOutlined,
  HeatMapOutlined,
  NodeIndexOutlined
} from '@ant-design/icons'
import type { ColumnsType } from 'antd/es/table'
import dayjs from 'dayjs'

const { Search } = Input
const { Option } = Select
const { TextArea } = Input
const { TabPane } = Tabs
const { Text, Title, Paragraph } = Typography
const { Panel } = Collapse

/**
 * 分析结果状态枚举
 */
type ResultStatus = 'processing' | 'completed' | 'failed' | 'archived'

/**
 * 分析类型枚举
 */
type AnalysisType = 'wgs' | 'wes' | 'rna_seq' | 'chip_seq' | 'atac_seq' | 'metagenome' | 'amplicon' | 'single_cell'

/**
 * 文件类型枚举
 */
type FileType = 'vcf' | 'bam' | 'fastq' | 'pdf' | 'html' | 'xlsx' | 'png' | 'svg' | 'txt' | 'zip'

/**
 * 分析结果记录接口
 */
interface AnalysisResult {
  id: string
  projectName: string
  analysisType: AnalysisType
  sampleCount: number
  status: ResultStatus
  completedTime: string
  operator: string
  version: string
  description?: string
  inputSamples: string[]
  outputFiles: ResultFile[]
  statistics: ResultStatistics
  qualityMetrics: QualityMetrics
  visualizations: Visualization[]
  annotations?: Annotation[]
  tags: string[]
  isStarred: boolean
  downloadCount: number
  shareUrl?: string
}

/**
 * 结果文件接口
 */
interface ResultFile {
  id: string
  fileName: string
  fileType: FileType
  fileSize: number
  filePath: string
  description: string
  category: 'raw' | 'processed' | 'report' | 'visualization' | 'annotation'
  isPublic: boolean
  downloadCount: number
  createdTime: string
}

/**
 * 结果统计接口
 */
interface ResultStatistics {
  totalVariants?: number
  snpCount?: number
  indelCount?: number
  geneCount?: number
  expressedGenes?: number
  differentialGenes?: number
  pathwayCount?: number
  speciesCount?: number
  diversityIndex?: number
  coverageStats?: {
    mean: number
    median: number
    min: number
    max: number
  }
}

/**
 * 质量指标接口
 */
interface QualityMetrics {
  overallScore: number
  mappingRate: number
  duplicateRate: number
  coverage: number
  q30Rate: number
  gcContent: number
  insertSize?: number
  rnaIntegrity?: number
}

/**
 * 可视化图表接口
 */
interface Visualization {
  id: string
  title: string
  type: 'bar' | 'line' | 'pie' | 'scatter' | 'heatmap' | 'volcano' | 'manhattan'
  description: string
  imagePath: string
  dataPath?: string
  interactive: boolean
}

/**
 * 注释信息接口
 */
interface Annotation {
  id: string
  type: 'gene' | 'variant' | 'pathway' | 'go' | 'kegg'
  name: string
  description: string
  count: number
  significance?: number
}

/**
 * 分析结果页面组件
 * 
 * 功能特性：
 * - 分析结果查看和管理
 * - 多种文件类型支持
 * - 可视化图表展示
 * - 统计信息汇总
 * - 文件下载和分享
 * - 结果收藏和标签
 */
const AnalysisResults: React.FC = () => {
  // 状态管理
  const [loading, setLoading] = useState(false)
  const [resultsData, setResultsData] = useState<AnalysisResult[]>([])
  const [selectedResult, setSelectedResult] = useState<AnalysisResult | null>(null)
  const [detailModalVisible, setDetailModalVisible] = useState(false)
  const [fileDrawerVisible, setFileDrawerVisible] = useState(false)
  const [visualDrawerVisible, setVisualDrawerVisible] = useState(false)
  const [shareModalVisible, setShareModalVisible] = useState(false)
  const [searchText, setSearchText] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('')
  const [typeFilter, setTypeFilter] = useState<string>('')
  const [tagFilter, setTagFilter] = useState<string>('')
  const [starredOnly, setStarredOnly] = useState(false)
  const [sortBy, setSortBy] = useState<string>('completedTime')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')

  /**
   * 模拟分析结果数据
   */
  const mockResultsData: AnalysisResult[] = [
    {
      id: '1',
      projectName: '人类全基因组变异检测项目',
      analysisType: 'wgs',
      sampleCount: 24,
      status: 'completed',
      completedTime: '2024-01-15 18:30:00',
      operator: '张三',
      version: 'v2.1.0',
      description: '针对24个人类样本进行全基因组重测序分析，检测SNP和InDel变异',
      inputSamples: ['S001', 'S002', 'S003', 'S004'],
      outputFiles: [],
      statistics: {
        totalVariants: 4567890,
        snpCount: 4234567,
        indelCount: 333323,
        geneCount: 20456,
        coverageStats: {
          mean: 30.2,
          median: 29.8,
          min: 15.6,
          max: 45.3
        }
      },
      qualityMetrics: {
        overallScore: 92,
        mappingRate: 95.2,
        duplicateRate: 12.8,
        coverage: 30.2,
        q30Rate: 89.5,
        gcContent: 41.2
      },
      visualizations: [],
      annotations: [
        {
          id: '1',
          type: 'gene',
          name: '致病基因',
          description: '与疾病相关的基因变异',
          count: 156,
          significance: 0.001
        },
        {
          id: '2',
          type: 'pathway',
          name: 'KEGG通路',
          description: '富集的代谢通路',
          count: 45,
          significance: 0.05
        }
      ],
      tags: ['人类基因组', '变异检测', '临床'],
      isStarred: true,
      downloadCount: 23,
      shareUrl: 'https://example.com/share/result1'
    },
    {
      id: '2',
      projectName: 'RNA差异表达分析',
      analysisType: 'rna_seq',
      sampleCount: 12,
      status: 'completed',
      completedTime: '2024-01-14 16:45:00',
      operator: '李四',
      version: 'v1.8.2',
      description: '转录组测序数据差异表达基因分析和功能富集分析',
      inputSamples: ['R001', 'R002', 'R003'],
      outputFiles: [],
      statistics: {
        geneCount: 25678,
        expressedGenes: 18456,
        differentialGenes: 2345,
        pathwayCount: 156
      },
      qualityMetrics: {
        overallScore: 88,
        mappingRate: 92.8,
        duplicateRate: 8.5,
        coverage: 25.6,
        q30Rate: 91.2,
        gcContent: 45.8,
        rnaIntegrity: 8.2
      },
      visualizations: [],
      annotations: [
        {
          id: '3',
          type: 'go',
          name: 'GO功能',
          description: '基因本体功能注释',
          count: 234,
          significance: 0.01
        }
      ],
      tags: ['转录组', '差异表达', '功能分析'],
      isStarred: false,
      downloadCount: 15
    },
    {
      id: '3',
      projectName: '微生物群落多样性分析',
      analysisType: 'metagenome',
      sampleCount: 48,
      status: 'processing',
      completedTime: '2024-01-16 10:00:00',
      operator: '王五',
      version: 'v3.0.1',
      description: '土壤微生物宏基因组测序数据分析，包括物种分类和功能预测',
      inputSamples: ['M001', 'M002', 'M003'],
      outputFiles: [],
      statistics: {
        speciesCount: 1234,
        diversityIndex: 3.45
      },
      qualityMetrics: {
        overallScore: 85,
        mappingRate: 78.5,
        duplicateRate: 15.2,
        coverage: 12.8,
        q30Rate: 87.3,
        gcContent: 52.1
      },
      visualizations: [],
      tags: ['宏基因组', '微生物', '多样性'],
      isStarred: false,
      downloadCount: 8
    }
  ]

  /**
   * 模拟结果文件数据
   */
  const mockResultFiles: ResultFile[] = [
    {
      id: '1',
      fileName: 'variants.vcf.gz',
      fileType: 'vcf',
      fileSize: 1024000000,
      filePath: '/results/wgs/variants.vcf.gz',
      description: '检测到的所有变异位点',
      category: 'processed',
      isPublic: false,
      downloadCount: 12,
      createdTime: '2024-01-15 18:30:00'
    },
    {
      id: '2',
      fileName: 'analysis_report.pdf',
      fileType: 'pdf',
      fileSize: 5120000,
      filePath: '/results/wgs/analysis_report.pdf',
      description: '完整的分析报告',
      category: 'report',
      isPublic: true,
      downloadCount: 23,
      createdTime: '2024-01-15 18:30:00'
    },
    {
      id: '3',
      fileName: 'quality_metrics.xlsx',
      fileType: 'xlsx',
      fileSize: 2048000,
      filePath: '/results/wgs/quality_metrics.xlsx',
      description: '质量控制指标统计表',
      category: 'report',
      isPublic: true,
      downloadCount: 18,
      createdTime: '2024-01-15 18:30:00'
    },
    {
      id: '4',
      fileName: 'coverage_plot.png',
      fileType: 'png',
      fileSize: 1024000,
      filePath: '/results/wgs/coverage_plot.png',
      description: '测序深度分布图',
      category: 'visualization',
      isPublic: true,
      downloadCount: 15,
      createdTime: '2024-01-15 18:30:00'
    }
  ]

  /**
   * 模拟可视化图表数据
   */
  const mockVisualizations: Visualization[] = [
    {
      id: '1',
      title: '变异类型分布',
      type: 'pie',
      description: 'SNP和InDel变异类型的分布比例',
      imagePath: '/images/variant_distribution.png',
      dataPath: '/data/variant_distribution.json',
      interactive: true
    },
    {
      id: '2',
      title: '染色体变异密度',
      type: 'bar',
      description: '各染色体上变异位点的密度分布',
      imagePath: '/images/chromosome_density.png',
      dataPath: '/data/chromosome_density.json',
      interactive: true
    },
    {
      id: '3',
      title: '质量分数分布',
      type: 'line',
      description: '变异位点质量分数的分布曲线',
      imagePath: '/images/quality_distribution.png',
      interactive: false
    },
    {
      id: '4',
      title: '基因功能热图',
      type: 'heatmap',
      description: '差异表达基因的功能富集热图',
      imagePath: '/images/function_heatmap.png',
      dataPath: '/data/function_heatmap.json',
      interactive: true
    }
  ]

  /**
   * 组件初始化
   */
  useEffect(() => {
    loadResultsData()
  }, [])

  /**
   * 加载结果数据
   */
  const loadResultsData = async () => {
    setLoading(true)
    try {
      // 模拟API调用
      await new Promise(resolve => setTimeout(resolve, 1000))
      setResultsData(mockResultsData)
    } catch (error) {
      console.error('加载结果数据失败:', error)
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
  const getStatusColor = (status: ResultStatus) => {
    const colorMap = {
      processing: 'processing',
      completed: 'success',
      failed: 'error',
      archived: 'default'
    }
    return colorMap[status]
  }

  /**
   * 获取状态文本
   */
  const getStatusText = (status: ResultStatus) => {
    const textMap = {
      processing: '处理中',
      completed: '已完成',
      failed: '失败',
      archived: '已归档'
    }
    return textMap[status]
  }

  /**
   * 获取文件类型图标
   */
  const getFileTypeIcon = (type: FileType) => {
    const iconMap = {
      vcf: <FileTextOutlined />,
      bam: <DatabaseOutlined />,
      fastq: <FileTextOutlined />,
      pdf: <FilePdfOutlined />,
      html: <FileTextOutlined />,
      xlsx: <FileExcelOutlined />,
      png: <PictureOutlined />,
      svg: <PictureOutlined />,
      txt: <FileTextOutlined />,
      zip: <FileZipOutlined />
    }
    return iconMap[type] || <FileOutlined />
  }

  /**
   * 格式化文件大小
   */
  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 B'
    const k = 1024
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
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
   * 查看详情
   */
  const handleViewDetail = (record: AnalysisResult) => {
    setSelectedResult(record)
    setDetailModalVisible(true)
  }

  /**
   * 查看文件
   */
  const handleViewFiles = (record: AnalysisResult) => {
    setSelectedResult(record)
    setFileDrawerVisible(true)
  }

  /**
   * 查看可视化
   */
  const handleViewVisualizations = (record: AnalysisResult) => {
    setSelectedResult(record)
    setVisualDrawerVisible(true)
  }

  /**
   * 分享结果
   */
  const handleShare = (record: AnalysisResult) => {
    setSelectedResult(record)
    setShareModalVisible(true)
  }

  /**
   * 收藏/取消收藏
   */
  const handleToggleStar = async (id: string) => {
    try {
      setResultsData(prev => prev.map(item => 
        item.id === id ? { ...item, isStarred: !item.isStarred } : item
      ))
      message.success('操作成功')
    } catch (error) {
      message.error('操作失败')
    }
  }

  /**
   * 下载文件
   */
  const handleDownload = async (file: ResultFile) => {
    try {
      // 模拟下载
      message.success(`开始下载 ${file.fileName}`)
    } catch (error) {
      message.error('下载失败')
    }
  }

  /**
   * 删除结果
   */
  const handleDelete = async (id: string) => {
    try {
      // 模拟API调用
      await new Promise(resolve => setTimeout(resolve, 500))
      setResultsData(prev => prev.filter(item => item.id !== id))
      message.success('删除成功')
    } catch (error) {
      message.error('删除失败')
    }
  }

  /**
   * 过滤和排序数据
   */
  const filteredAndSortedData = resultsData
    .filter(item => {
      const matchSearch = !searchText || 
        item.projectName.toLowerCase().includes(searchText.toLowerCase()) ||
        item.description?.toLowerCase().includes(searchText.toLowerCase()) ||
        item.operator.toLowerCase().includes(searchText.toLowerCase())
      
      const matchStatus = !statusFilter || item.status === statusFilter
      const matchType = !typeFilter || item.analysisType === typeFilter
      const matchTag = !tagFilter || item.tags.includes(tagFilter)
      const matchStarred = !starredOnly || item.isStarred
      
      return matchSearch && matchStatus && matchType && matchTag && matchStarred
    })
    .sort((a, b) => {
      let aValue: any, bValue: any
      
      switch (sortBy) {
        case 'completedTime':
          aValue = new Date(a.completedTime).getTime()
          bValue = new Date(b.completedTime).getTime()
          break
        case 'projectName':
          aValue = a.projectName
          bValue = b.projectName
          break
        case 'sampleCount':
          aValue = a.sampleCount
          bValue = b.sampleCount
          break
        case 'downloadCount':
          aValue = a.downloadCount
          bValue = b.downloadCount
          break
        default:
          aValue = a.completedTime
          bValue = b.completedTime
      }
      
      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1
      } else {
        return aValue < bValue ? 1 : -1
      }
    })

  /**
   * 表格列定义
   */
  const columns: ColumnsType<AnalysisResult> = [
    {
      title: '项目名称',
      dataIndex: 'projectName',
      key: 'projectName',
      width: 250,
      fixed: 'left',
      ellipsis: true,
      render: (text: string, record) => (
        <div>
          <div style={{ fontWeight: 'bold' }}>
            {record.isStarred && <StarOutlined style={{ color: '#faad14', marginRight: 4 }} />}
            {text}
          </div>
          <div style={{ fontSize: 12, color: '#666' }}>
            {record.description}
          </div>
        </div>
      )
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
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: (status: ResultStatus) => (
        <Tag color={getStatusColor(status)}>
          {getStatusText(status)}
        </Tag>
      )
    },
    {
      title: '质量评分',
      key: 'qualityScore',
      width: 120,
      render: (_, record) => {
        const grade = getQualityGrade(record.qualityMetrics.overallScore)
        return (
          <div>
            <div>
              <Tag color={grade.color}>
                {record.qualityMetrics.overallScore}分
              </Tag>
            </div>
            <div style={{ fontSize: 11, color: '#666' }}>
              {grade.text}
            </div>
          </div>
        )
      }
    },
    {
      title: '统计信息',
      key: 'statistics',
      width: 150,
      render: (_, record) => (
        <div style={{ fontSize: 12 }}>
          {record.statistics.totalVariants && (
            <div>变异: {record.statistics.totalVariants.toLocaleString()}</div>
          )}
          {record.statistics.geneCount && (
            <div>基因: {record.statistics.geneCount.toLocaleString()}</div>
          )}
          {record.statistics.speciesCount && (
            <div>物种: {record.statistics.speciesCount.toLocaleString()}</div>
          )}
        </div>
      )
    },
    {
      title: '标签',
      dataIndex: 'tags',
      key: 'tags',
      width: 150,
      render: (tags: string[]) => (
        <div>
          {tags.slice(0, 2).map(tag => (
            <Tag key={tag} size="small">{tag}</Tag>
          ))}
          {tags.length > 2 && <Tag size="small">+{tags.length - 2}</Tag>}
        </div>
      )
    },
    {
      title: '操作人',
      dataIndex: 'operator',
      key: 'operator',
      width: 100
    },
    {
      title: '完成时间',
      dataIndex: 'completedTime',
      key: 'completedTime',
      width: 150,
      render: (time: string) => dayjs(time).format('MM-DD HH:mm')
    },
    {
      title: '下载次数',
      dataIndex: 'downloadCount',
      key: 'downloadCount',
      width: 100,
      render: (count: number) => (
        <Badge count={count} showZero color="green" />
      )
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
          <Tooltip title="查看文件">
            <Button
              type="text"
              icon={<FolderOutlined />}
              onClick={() => handleViewFiles(record)}
            />
          </Tooltip>
          <Tooltip title="可视化图表">
            <Button
              type="text"
              icon={<BarChartOutlined />}
              onClick={() => handleViewVisualizations(record)}
            />
          </Tooltip>
          <Tooltip title="分享">
            <Button
              type="text"
              icon={<ShareAltOutlined />}
              onClick={() => handleShare(record)}
            />
          </Tooltip>
          <Tooltip title={record.isStarred ? '取消收藏' : '收藏'}>
            <Button
              type="text"
              icon={<StarOutlined />}
              style={{ color: record.isStarred ? '#faad14' : undefined }}
              onClick={() => handleToggleStar(record.id)}
            />
          </Tooltip>
          <Popconfirm
            title="确定要删除这个结果吗？"
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
              title="总结果数"
              value={resultsData.length}
              prefix={<DatabaseOutlined />}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card size="small">
            <Statistic
              title="已完成"
              value={resultsData.filter(item => item.status === 'completed').length}
              valueStyle={{ color: '#3f8600' }}
              prefix={<CheckCircleOutlined />}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card size="small">
            <Statistic
              title="处理中"
              value={resultsData.filter(item => item.status === 'processing').length}
              valueStyle={{ color: '#1890ff' }}
              prefix={<ClockCircleOutlined />}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card size="small">
            <Statistic
              title="收藏数"
              value={resultsData.filter(item => item.isStarred).length}
              valueStyle={{ color: '#faad14' }}
              prefix={<StarOutlined />}
            />
          </Card>
        </Col>
      </Row>

      {/* 搜索和筛选 */}
      <Card size="small" style={{ marginBottom: 16 }}>
        <Row gutter={16}>
          <Col span={6}>
            <Search
              placeholder="搜索项目名称、描述或操作人"
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              onSearch={loadResultsData}
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
              <Option value="processing">处理中</Option>
              <Option value="completed">已完成</Option>
              <Option value="failed">失败</Option>
              <Option value="archived">已归档</Option>
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
              placeholder="排序方式"
              value={sortBy}
              onChange={setSortBy}
              style={{ width: '100%' }}
            >
              <Option value="completedTime">完成时间</Option>
              <Option value="projectName">项目名称</Option>
              <Option value="sampleCount">样本数量</Option>
              <Option value="downloadCount">下载次数</Option>
            </Select>
          </Col>
          <Col span={5}>
            <Space>
              <Switch
                checkedChildren="收藏"
                unCheckedChildren="全部"
                checked={starredOnly}
                onChange={setStarredOnly}
              />
              <Button 
                icon={sortOrder === 'asc' ? <SortAscendingOutlined /> : <SortAscendingOutlined style={{ transform: 'rotate(180deg)' }} />}
                onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
              />
              <Button onClick={loadResultsData} loading={loading}>
                刷新
              </Button>
            </Space>
          </Col>
        </Row>
      </Card>

      {/* 结果数据表格 */}
      <Card title="分析结果列表" size="small">
        <Table
          columns={columns}
          dataSource={filteredAndSortedData}
          rowKey="id"
          loading={loading}
          scroll={{ x: 1800 }}
          pagination={{
            total: filteredAndSortedData.length,
            pageSize: 10,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total) => `共 ${total} 条记录`
          }}
        />
      </Card>

      {/* 详情模态框 */}
      <Modal
        title="分析结果详情"
        open={detailModalVisible}
        onCancel={() => setDetailModalVisible(false)}
        footer={null}
        width={1000}
      >
        {selectedResult && (
          <Tabs defaultActiveKey="1">
            <TabPane tab="基本信息" key="1">
              <Descriptions bordered size="small" column={2}>
                <Descriptions.Item label="项目名称" span={2}>
                  {selectedResult.isStarred && <StarOutlined style={{ color: '#faad14', marginRight: 4 }} />}
                  {selectedResult.projectName}
                </Descriptions.Item>
                <Descriptions.Item label="分析类型">
                  <Tag color={getAnalysisTypeColor(selectedResult.analysisType)}>
                    {getAnalysisTypeText(selectedResult.analysisType)}
                  </Tag>
                </Descriptions.Item>
                <Descriptions.Item label="样本数量">
                  <Badge count={selectedResult.sampleCount} showZero color="blue" />
                </Descriptions.Item>
                <Descriptions.Item label="状态">
                  <Tag color={getStatusColor(selectedResult.status)}>
                    {getStatusText(selectedResult.status)}
                  </Tag>
                </Descriptions.Item>
                <Descriptions.Item label="版本">
                  <Tag icon={<CodeOutlined />}>{selectedResult.version}</Tag>
                </Descriptions.Item>
                <Descriptions.Item label="操作人">{selectedResult.operator}</Descriptions.Item>
                <Descriptions.Item label="完成时间">{selectedResult.completedTime}</Descriptions.Item>
                <Descriptions.Item label="下载次数">
                  <Badge count={selectedResult.downloadCount} showZero color="green" />
                </Descriptions.Item>
                <Descriptions.Item label="输入样本" span={2}>
                  {selectedResult.inputSamples.map(sample => (
                    <Tag key={sample}>{sample}</Tag>
                  ))}
                </Descriptions.Item>
                <Descriptions.Item label="标签" span={2}>
                  {selectedResult.tags.map(tag => (
                    <Tag key={tag} color="blue">{tag}</Tag>
                  ))}
                </Descriptions.Item>
                <Descriptions.Item label="描述" span={2}>
                  {selectedResult.description || '-'}
                </Descriptions.Item>
              </Descriptions>
            </TabPane>
            <TabPane tab="统计信息" key="2">
              <Row gutter={16}>
                {selectedResult.statistics.totalVariants && (
                  <Col span={8}>
                    <Card size="small">
                      <Statistic
                        title="总变异数"
                        value={selectedResult.statistics.totalVariants}
                        formatter={(value) => Number(value).toLocaleString()}
                      />
                    </Card>
                  </Col>
                )}
                {selectedResult.statistics.snpCount && (
                  <Col span={8}>
                    <Card size="small">
                      <Statistic
                        title="SNP数量"
                        value={selectedResult.statistics.snpCount}
                        formatter={(value) => Number(value).toLocaleString()}
                      />
                    </Card>
                  </Col>
                )}
                {selectedResult.statistics.indelCount && (
                  <Col span={8}>
                    <Card size="small">
                      <Statistic
                        title="InDel数量"
                        value={selectedResult.statistics.indelCount}
                        formatter={(value) => Number(value).toLocaleString()}
                      />
                    </Card>
                  </Col>
                )}
                {selectedResult.statistics.geneCount && (
                  <Col span={8} style={{ marginTop: 16 }}>
                    <Card size="small">
                      <Statistic
                        title="基因数量"
                        value={selectedResult.statistics.geneCount}
                        formatter={(value) => Number(value).toLocaleString()}
                      />
                    </Card>
                  </Col>
                )}
                {selectedResult.statistics.expressedGenes && (
                  <Col span={8} style={{ marginTop: 16 }}>
                    <Card size="small">
                      <Statistic
                        title="表达基因"
                        value={selectedResult.statistics.expressedGenes}
                        formatter={(value) => Number(value).toLocaleString()}
                      />
                    </Card>
                  </Col>
                )}
                {selectedResult.statistics.differentialGenes && (
                  <Col span={8} style={{ marginTop: 16 }}>
                    <Card size="small">
                      <Statistic
                        title="差异基因"
                        value={selectedResult.statistics.differentialGenes}
                        formatter={(value) => Number(value).toLocaleString()}
                      />
                    </Card>
                  </Col>
                )}
              </Row>
              
              {selectedResult.statistics.coverageStats && (
                <div style={{ marginTop: 16 }}>
                  <Title level={5}>覆盖度统计</Title>
                  <Row gutter={16}>
                    <Col span={6}>
                      <Statistic title="平均值" value={selectedResult.statistics.coverageStats.mean} suffix="X" precision={1} />
                    </Col>
                    <Col span={6}>
                      <Statistic title="中位数" value={selectedResult.statistics.coverageStats.median} suffix="X" precision={1} />
                    </Col>
                    <Col span={6}>
                      <Statistic title="最小值" value={selectedResult.statistics.coverageStats.min} suffix="X" precision={1} />
                    </Col>
                    <Col span={6}>
                      <Statistic title="最大值" value={selectedResult.statistics.coverageStats.max} suffix="X" precision={1} />
                    </Col>
                  </Row>
                </div>
              )}
            </TabPane>
            <TabPane tab="质量指标" key="3">
              <Row gutter={16}>
                <Col span={8}>
                  <Card size="small">
                    <div style={{ textAlign: 'center' }}>
                      <div style={{ fontSize: 24, fontWeight: 'bold' }}>
                        <Tag color={getQualityGrade(selectedResult.qualityMetrics.overallScore).color}>
                          {selectedResult.qualityMetrics.overallScore}分
                        </Tag>
                      </div>
                      <div style={{ color: '#666' }}>总体评分</div>
                    </div>
                  </Card>
                </Col>
                <Col span={8}>
                  <Card size="small">
                    <Statistic
                      title="比对率"
                      value={selectedResult.qualityMetrics.mappingRate}
                      suffix="%"
                      precision={1}
                      valueStyle={{ 
                        color: selectedResult.qualityMetrics.mappingRate > 90 ? '#3f8600' : '#cf1322' 
                      }}
                    />
                  </Card>
                </Col>
                <Col span={8}>
                  <Card size="small">
                    <Statistic
                      title="重复率"
                      value={selectedResult.qualityMetrics.duplicateRate}
                      suffix="%"
                      precision={1}
                      valueStyle={{ 
                        color: selectedResult.qualityMetrics.duplicateRate < 20 ? '#3f8600' : '#cf1322' 
                      }}
                    />
                  </Card>
                </Col>
                <Col span={8} style={{ marginTop: 16 }}>
                  <Card size="small">
                    <Statistic
                      title="平均覆盖度"
                      value={selectedResult.qualityMetrics.coverage}
                      suffix="X"
                      precision={1}
                    />
                  </Card>
                </Col>
                <Col span={8} style={{ marginTop: 16 }}>
                  <Card size="small">
                    <Statistic
                      title="Q30比例"
                      value={selectedResult.qualityMetrics.q30Rate}
                      suffix="%"
                      precision={1}
                      valueStyle={{ 
                        color: selectedResult.qualityMetrics.q30Rate > 85 ? '#3f8600' : '#cf1322' 
                      }}
                    />
                  </Card>
                </Col>
                <Col span={8} style={{ marginTop: 16 }}>
                  <Card size="small">
                    <Statistic
                      title="GC含量"
                      value={selectedResult.qualityMetrics.gcContent}
                      suffix="%"
                      precision={1}
                    />
                  </Card>
                </Col>
              </Row>
            </TabPane>
            <TabPane tab="注释信息" key="4">
              {selectedResult.annotations && selectedResult.annotations.length > 0 ? (
                <List
                  itemLayout="horizontal"
                  dataSource={selectedResult.annotations}
                  renderItem={(annotation) => (
                    <List.Item>
                      <List.Item.Meta
                        avatar={<Avatar icon={<NodeIndexOutlined />} />}
                        title={annotation.name}
                        description={annotation.description}
                      />
                      <div>
                        <div style={{ fontWeight: 'bold' }}>数量: {annotation.count}</div>
                        {annotation.significance && (
                          <div style={{ fontSize: 12, color: '#666' }}>
                            显著性: {annotation.significance}
                          </div>
                        )}
                      </div>
                    </List.Item>
                  )}
                />
              ) : (
                <Empty description="暂无注释信息" />
              )}
            </TabPane>
          </Tabs>
        )}
      </Modal>

      {/* 文件管理抽屉 */}
      <Drawer
        title="结果文件管理"
        placement="right"
        onClose={() => setFileDrawerVisible(false)}
        open={fileDrawerVisible}
        width={700}
      >
        {selectedResult && (
          <div>
            <Alert
              message="文件列表"
              description={`项目 ${selectedResult.projectName} 的所有输出文件`}
              type="info"
              showIcon
              style={{ marginBottom: 16 }}
            />
            
            <List
              itemLayout="horizontal"
              dataSource={mockResultFiles}
              renderItem={(file) => (
                <List.Item
                  actions={[
                    <Button 
                      type="text" 
                      icon={<DownloadOutlined />} 
                      onClick={() => handleDownload(file)}
                    >
                      下载
                    </Button>
                  ]}
                >
                  <List.Item.Meta
                    avatar={<Avatar icon={getFileTypeIcon(file.fileType)} />}
                    title={
                      <div>
                        <span>{file.fileName}</span>
                        <Tag color="blue" size="small" style={{ marginLeft: 8 }}>
                          {file.category}
                        </Tag>
                        {file.isPublic && (
                          <Tag color="green" size="small">公开</Tag>
                        )}
                      </div>
                    }
                    description={
                      <div>
                        <div>{file.description}</div>
                        <div style={{ fontSize: 11, color: '#999', marginTop: 2 }}>
                          大小: {formatFileSize(file.fileSize)} | 
                          下载: {file.downloadCount}次 | 
                          创建: {dayjs(file.createdTime).format('MM-DD HH:mm')}
                        </div>
                      </div>
                    }
                  />
                </List.Item>
              )}
            />
          </div>
        )}
      </Drawer>

      {/* 可视化图表抽屉 */}
      <Drawer
        title="可视化图表"
        placement="right"
        onClose={() => setVisualDrawerVisible(false)}
        open={visualDrawerVisible}
        width={900}
      >
        {selectedResult && (
          <div>
            <Alert
              message="图表展示"
              description={`项目 ${selectedResult.projectName} 的可视化分析图表`}
              type="info"
              showIcon
              style={{ marginBottom: 16 }}
            />
            
            <Row gutter={16}>
              {mockVisualizations.map(viz => (
                <Col span={12} key={viz.id} style={{ marginBottom: 16 }}>
                  <Card
                    size="small"
                    title={viz.title}
                    extra={
                      <Space>
                        {viz.interactive && <Tag color="blue">交互式</Tag>}
                        <Button type="text" icon={<DownloadOutlined />} size="small" />
                      </Space>
                    }
                  >
                    <div style={{ textAlign: 'center', marginBottom: 8 }}>
                      <Image
                        width={200}
                        height={150}
                        src="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjE1MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KICA8cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZjBmMGYwIi8+CiAgPHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCwgc2Fucy1zZXJpZiIgZm9udC1zaXplPSIxNCIgZmlsbD0iIzk5OTk5OSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPuWbvuihqOmihOiniDwvdGV4dD4KPC9zdmc+"
                        placeholder={
                          <div style={{ 
                            width: 200, 
                            height: 150, 
                            display: 'flex', 
                            alignItems: 'center', 
                            justifyContent: 'center',
                            backgroundColor: '#f0f0f0'
                          }}>
                            <Spin />
                          </div>
                        }
                      />
                    </div>
                    <Paragraph ellipsis={{ rows: 2 }} style={{ fontSize: 12, margin: 0 }}>
                      {viz.description}
                    </Paragraph>
                  </Card>
                </Col>
              ))}
            </Row>
          </div>
        )}
      </Drawer>

      {/* 分享模态框 */}
      <Modal
        title="分享分析结果"
        open={shareModalVisible}
        onCancel={() => setShareModalVisible(false)}
        footer={[
          <Button key="cancel" onClick={() => setShareModalVisible(false)}>
            取消
          </Button>,
          <Button key="copy" type="primary" onClick={() => {
            navigator.clipboard.writeText(selectedResult?.shareUrl || '')
            message.success('分享链接已复制到剪贴板')
          }}>
            复制链接
          </Button>
        ]}
      >
        {selectedResult && (
          <div>
            <Alert
              message="分享设置"
              description="生成分享链接，其他用户可以通过链接查看分析结果"
              type="info"
              showIcon
              style={{ marginBottom: 16 }}
            />
            
            <Descriptions bordered size="small" column={1}>
              <Descriptions.Item label="项目名称">{selectedResult.projectName}</Descriptions.Item>
              <Descriptions.Item label="分析类型">
                <Tag color={getAnalysisTypeColor(selectedResult.analysisType)}>
                  {getAnalysisTypeText(selectedResult.analysisType)}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="分享链接">
                <Input.Group compact>
                  <Input 
                    style={{ width: 'calc(100% - 80px)' }} 
                    value={selectedResult.shareUrl} 
                    readOnly 
                  />
                  <Button 
                    onClick={() => {
                      navigator.clipboard.writeText(selectedResult.shareUrl || '')
                      message.success('已复制')
                    }}
                  >
                    复制
                  </Button>
                </Input.Group>
              </Descriptions.Item>
            </Descriptions>
          </div>
        )}
      </Modal>
    </div>
  )
}

export default AnalysisResults