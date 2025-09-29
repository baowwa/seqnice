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
  Spin,
  Checkbox,
  Radio,
  DatePicker,
  TimePicker,
  ColorPicker
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
  NodeIndexOutlined,
  CopyOutlined,
  SaveOutlined,
  SendOutlined,
  PrinterOutlined,
  MailOutlined,
  UserOutlined,
  TeamOutlined,
  CalendarOutlined,
  ClockCircleFilled,
  FileAddOutlined,
  FormOutlined,
  LayoutOutlined,
  BgColorsOutlined,
  FontSizeOutlined,
  AlignLeftOutlined,
  AlignCenterOutlined,
  AlignRightOutlined,
  BoldOutlined,
  ItalicOutlined,
  UnderlineOutlined
} from '@ant-design/icons'
import type { ColumnsType } from 'antd/es/table'
import dayjs from 'dayjs'

const { Search } = Input
const { Option } = Select
const { TextArea } = Input
const { TabPane } = Tabs
const { Text, Title, Paragraph } = Typography
const { Panel } = Collapse
const { RangePicker } = DatePicker
const { Dragger } = Upload

/**
 * 报告状态枚举
 */
type ReportStatus = 'draft' | 'generating' | 'completed' | 'failed' | 'sent'

/**
 * 报告类型枚举
 */
type ReportType = 'standard' | 'detailed' | 'summary' | 'custom'

/**
 * 模板类型枚举
 */
type TemplateType = 'wgs' | 'wes' | 'rna_seq' | 'metagenome' | 'clinical' | 'research'

/**
 * 报告生成记录接口
 */
interface ReportRecord {
  id: string
  reportName: string
  reportType: ReportType
  templateType: TemplateType
  status: ReportStatus
  progress: number
  projectId: string
  projectName: string
  analysisId: string
  createdTime: string
  completedTime?: string
  operator: string
  recipients: string[]
  description?: string
  settings: ReportSettings
  sections: ReportSection[]
  attachments: ReportAttachment[]
  version: string
  fileSize?: number
  downloadCount: number
  isTemplate: boolean
}

/**
 * 报告设置接口
 */
interface ReportSettings {
  language: 'zh' | 'en'
  format: 'pdf' | 'html' | 'docx'
  theme: 'default' | 'professional' | 'modern' | 'minimal'
  includeRawData: boolean
  includeCharts: boolean
  includeStatistics: boolean
  includeQualityMetrics: boolean
  includeAnnotations: boolean
  watermark: boolean
  pageNumbers: boolean
  tableOfContents: boolean
  executiveSummary: boolean
  customLogo?: string
  customFooter?: string
  colorScheme: string
}

/**
 * 报告章节接口
 */
interface ReportSection {
  id: string
  title: string
  type: 'text' | 'table' | 'chart' | 'image' | 'code'
  content: any
  order: number
  enabled: boolean
  customizable: boolean
  required: boolean
}

/**
 * 报告附件接口
 */
interface ReportAttachment {
  id: string
  fileName: string
  fileType: string
  fileSize: number
  description: string
  required: boolean
}

/**
 * 报告模板接口
 */
interface ReportTemplate {
  id: string
  name: string
  type: TemplateType
  description: string
  sections: ReportSection[]
  settings: ReportSettings
  isDefault: boolean
  usageCount: number
  createdBy: string
  createdTime: string
  updatedTime: string
}

/**
 * 报告生成页面组件
 * 
 * 功能特性：
 * - 报告自动生成和管理
 * - 多种报告模板支持
 * - 内容定制和配置
 * - 实时生成进度监控
 * - 报告分发和共享
 * - 模板创建和编辑
 */
const ReportGeneration: React.FC = () => {
  // 状态管理
  const [loading, setLoading] = useState(false)
  const [reportsData, setReportsData] = useState<ReportRecord[]>([])
  const [templatesData, setTemplatesData] = useState<ReportTemplate[]>([])
  const [selectedReport, setSelectedReport] = useState<ReportRecord | null>(null)
  const [selectedTemplate, setSelectedTemplate] = useState<ReportTemplate | null>(null)
  const [createModalVisible, setCreateModalVisible] = useState(false)
  const [editModalVisible, setEditModalVisible] = useState(false)
  const [templateModalVisible, setTemplateModalVisible] = useState(false)
  const [previewDrawerVisible, setPreviewDrawerVisible] = useState(false)
  const [settingsDrawerVisible, setSettingsDrawerVisible] = useState(false)
  const [progressModalVisible, setProgressModalVisible] = useState(false)
  const [searchText, setSearchText] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('')
  const [typeFilter, setTypeFilter] = useState<string>('')
  const [templateFilter, setTemplateFilter] = useState<string>('')
  const [activeTab, setActiveTab] = useState('reports')
  const [form] = Form.useForm()
  const [templateForm] = Form.useForm()

  /**
   * 模拟报告数据
   */
  const mockReportsData: ReportRecord[] = [
    {
      id: '1',
      reportName: '人类全基因组变异检测报告',
      reportType: 'detailed',
      templateType: 'wgs',
      status: 'completed',
      progress: 100,
      projectId: 'P001',
      projectName: '人类全基因组变异检测项目',
      analysisId: 'A001',
      createdTime: '2024-01-15 14:30:00',
      completedTime: '2024-01-15 16:45:00',
      operator: '张三',
      recipients: ['user1@example.com', 'user2@example.com'],
      description: '包含完整的变异检测结果和质量控制指标',
      settings: {
        language: 'zh',
        format: 'pdf',
        theme: 'professional',
        includeRawData: true,
        includeCharts: true,
        includeStatistics: true,
        includeQualityMetrics: true,
        includeAnnotations: true,
        watermark: true,
        pageNumbers: true,
        tableOfContents: true,
        executiveSummary: true,
        colorScheme: '#1890ff'
      },
      sections: [],
      attachments: [],
      version: 'v1.0',
      fileSize: 15728640,
      downloadCount: 12,
      isTemplate: false
    },
    {
      id: '2',
      reportName: 'RNA差异表达分析报告',
      reportType: 'standard',
      templateType: 'rna_seq',
      status: 'generating',
      progress: 65,
      projectId: 'P002',
      projectName: 'RNA差异表达分析',
      analysisId: 'A002',
      createdTime: '2024-01-16 09:15:00',
      operator: '李四',
      recipients: ['user3@example.com'],
      description: '转录组差异表达基因分析和功能富集结果',
      settings: {
        language: 'zh',
        format: 'pdf',
        theme: 'default',
        includeRawData: false,
        includeCharts: true,
        includeStatistics: true,
        includeQualityMetrics: true,
        includeAnnotations: true,
        watermark: false,
        pageNumbers: true,
        tableOfContents: true,
        executiveSummary: false,
        colorScheme: '#52c41a'
      },
      sections: [],
      attachments: [],
      version: 'v1.0',
      downloadCount: 0,
      isTemplate: false
    },
    {
      id: '3',
      reportName: '微生物群落分析报告',
      reportType: 'summary',
      templateType: 'metagenome',
      status: 'draft',
      progress: 0,
      projectId: 'P003',
      projectName: '微生物群落多样性分析',
      analysisId: 'A003',
      createdTime: '2024-01-16 11:00:00',
      operator: '王五',
      recipients: [],
      description: '微生物群落组成和多样性分析摘要',
      settings: {
        language: 'zh',
        format: 'html',
        theme: 'modern',
        includeRawData: false,
        includeCharts: true,
        includeStatistics: true,
        includeQualityMetrics: false,
        includeAnnotations: true,
        watermark: false,
        pageNumbers: false,
        tableOfContents: false,
        executiveSummary: true,
        colorScheme: '#722ed1'
      },
      sections: [],
      attachments: [],
      version: 'v1.0',
      downloadCount: 0,
      isTemplate: false
    }
  ]

  /**
   * 模拟模板数据
   */
  const mockTemplatesData: ReportTemplate[] = [
    {
      id: '1',
      name: '全基因组测序标准模板',
      type: 'wgs',
      description: '适用于人类全基因组重测序项目的标准报告模板',
      sections: [],
      settings: {
        language: 'zh',
        format: 'pdf',
        theme: 'professional',
        includeRawData: true,
        includeCharts: true,
        includeStatistics: true,
        includeQualityMetrics: true,
        includeAnnotations: true,
        watermark: true,
        pageNumbers: true,
        tableOfContents: true,
        executiveSummary: true,
        colorScheme: '#1890ff'
      },
      isDefault: true,
      usageCount: 25,
      createdBy: '系统管理员',
      createdTime: '2024-01-01 00:00:00',
      updatedTime: '2024-01-15 10:30:00'
    },
    {
      id: '2',
      name: 'RNA测序分析模板',
      type: 'rna_seq',
      description: '转录组测序数据分析的标准报告模板',
      sections: [],
      settings: {
        language: 'zh',
        format: 'pdf',
        theme: 'default',
        includeRawData: false,
        includeCharts: true,
        includeStatistics: true,
        includeQualityMetrics: true,
        includeAnnotations: true,
        watermark: false,
        pageNumbers: true,
        tableOfContents: true,
        executiveSummary: false,
        colorScheme: '#52c41a'
      },
      isDefault: true,
      usageCount: 18,
      createdBy: '系统管理员',
      createdTime: '2024-01-01 00:00:00',
      updatedTime: '2024-01-10 15:20:00'
    },
    {
      id: '3',
      name: '临床检测报告模板',
      type: 'clinical',
      description: '临床基因检测项目的专业报告模板',
      sections: [],
      settings: {
        language: 'zh',
        format: 'pdf',
        theme: 'professional',
        includeRawData: false,
        includeCharts: true,
        includeStatistics: true,
        includeQualityMetrics: true,
        includeAnnotations: true,
        watermark: true,
        pageNumbers: true,
        tableOfContents: true,
        executiveSummary: true,
        colorScheme: '#f5222d'
      },
      isDefault: false,
      usageCount: 8,
      createdBy: '张三',
      createdTime: '2024-01-05 14:00:00',
      updatedTime: '2024-01-12 09:45:00'
    }
  ]

  /**
   * 组件初始化
   */
  useEffect(() => {
    loadReportsData()
    loadTemplatesData()
  }, [])

  /**
   * 加载报告数据
   */
  const loadReportsData = async () => {
    setLoading(true)
    try {
      // 模拟API调用
      await new Promise(resolve => setTimeout(resolve, 1000))
      setReportsData(mockReportsData)
    } catch (error) {
      console.error('加载报告数据失败:', error)
    } finally {
      setLoading(false)
    }
  }

  /**
   * 加载模板数据
   */
  const loadTemplatesData = async () => {
    try {
      // 模拟API调用
      await new Promise(resolve => setTimeout(resolve, 500))
      setTemplatesData(mockTemplatesData)
    } catch (error) {
      console.error('加载模板数据失败:', error)
    }
  }

  /**
   * 获取报告类型文本
   */
  const getReportTypeText = (type: ReportType) => {
    const textMap = {
      standard: '标准报告',
      detailed: '详细报告',
      summary: '摘要报告',
      custom: '自定义报告'
    }
    return textMap[type]
  }

  /**
   * 获取模板类型文本
   */
  const getTemplateTypeText = (type: TemplateType) => {
    const textMap = {
      wgs: '全基因组测序',
      wes: '全外显子测序',
      rna_seq: 'RNA测序',
      metagenome: '宏基因组',
      clinical: '临床检测',
      research: '科研项目'
    }
    return textMap[type]
  }

  /**
   * 获取状态颜色
   */
  const getStatusColor = (status: ReportStatus) => {
    const colorMap = {
      draft: 'default',
      generating: 'processing',
      completed: 'success',
      failed: 'error',
      sent: 'cyan'
    }
    return colorMap[status]
  }

  /**
   * 获取状态文本
   */
  const getStatusText = (status: ReportStatus) => {
    const textMap = {
      draft: '草稿',
      generating: '生成中',
      completed: '已完成',
      failed: '失败',
      sent: '已发送'
    }
    return textMap[status]
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
   * 创建报告
   */
  const handleCreateReport = () => {
    form.resetFields()
    setCreateModalVisible(true)
  }

  /**
   * 编辑报告
   */
  const handleEditReport = (record: ReportRecord) => {
    setSelectedReport(record)
    form.setFieldsValue(record)
    setEditModalVisible(true)
  }

  /**
   * 查看预览
   */
  const handlePreview = (record: ReportRecord) => {
    setSelectedReport(record)
    setPreviewDrawerVisible(true)
  }

  /**
   * 配置设置
   */
  const handleSettings = (record: ReportRecord) => {
    setSelectedReport(record)
    setSettingsDrawerVisible(true)
  }

  /**
   * 生成报告
   */
  const handleGenerate = async (id: string) => {
    try {
      // 更新状态为生成中
      setReportsData(prev => prev.map(item => 
        item.id === id ? { ...item, status: 'generating' as ReportStatus, progress: 0 } : item
      ))
      
      // 模拟生成进度
      const progressInterval = setInterval(() => {
        setReportsData(prev => prev.map(item => {
          if (item.id === id && item.status === 'generating') {
            const newProgress = Math.min(item.progress + Math.random() * 20, 100)
            const newStatus = newProgress >= 100 ? 'completed' as ReportStatus : 'generating' as ReportStatus
            const completedTime = newProgress >= 100 ? dayjs().format('YYYY-MM-DD HH:mm:ss') : undefined
            return { 
              ...item, 
              progress: newProgress, 
              status: newStatus,
              completedTime,
              fileSize: newProgress >= 100 ? Math.floor(Math.random() * 20000000) + 5000000 : undefined
            }
          }
          return item
        }))
      }, 1000)

      // 5秒后清除定时器
      setTimeout(() => {
        clearInterval(progressInterval)
      }, 5000)

      message.success('开始生成报告')
    } catch (error) {
      message.error('生成报告失败')
    }
  }

  /**
   * 下载报告
   */
  const handleDownload = async (record: ReportRecord) => {
    try {
      // 模拟下载
      message.success(`开始下载 ${record.reportName}`)
      
      // 更新下载次数
      setReportsData(prev => prev.map(item => 
        item.id === record.id ? { ...item, downloadCount: item.downloadCount + 1 } : item
      ))
    } catch (error) {
      message.error('下载失败')
    }
  }

  /**
   * 发送报告
   */
  const handleSend = async (record: ReportRecord) => {
    try {
      // 模拟发送
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      setReportsData(prev => prev.map(item => 
        item.id === record.id ? { ...item, status: 'sent' as ReportStatus } : item
      ))
      
      message.success('报告发送成功')
    } catch (error) {
      message.error('发送失败')
    }
  }

  /**
   * 删除报告
   */
  const handleDelete = async (id: string) => {
    try {
      // 模拟API调用
      await new Promise(resolve => setTimeout(resolve, 500))
      setReportsData(prev => prev.filter(item => item.id !== id))
      message.success('删除成功')
    } catch (error) {
      message.error('删除失败')
    }
  }

  /**
   * 创建模板
   */
  const handleCreateTemplate = () => {
    templateForm.resetFields()
    setTemplateModalVisible(true)
  }

  /**
   * 编辑模板
   */
  const handleEditTemplate = (template: ReportTemplate) => {
    setSelectedTemplate(template)
    templateForm.setFieldsValue(template)
    setTemplateModalVisible(true)
  }

  /**
   * 删除模板
   */
  const handleDeleteTemplate = async (id: string) => {
    try {
      // 模拟API调用
      await new Promise(resolve => setTimeout(resolve, 500))
      setTemplatesData(prev => prev.filter(item => item.id !== id))
      message.success('删除成功')
    } catch (error) {
      message.error('删除失败')
    }
  }

  /**
   * 保存报告
   */
  const handleSaveReport = async (values: any) => {
    try {
      if (selectedReport) {
        // 编辑
        setReportsData(prev => prev.map(item => 
          item.id === selectedReport.id ? { ...item, ...values } : item
        ))
        message.success('保存成功')
      } else {
        // 新建
        const newReport: ReportRecord = {
          id: Date.now().toString(),
          ...values,
          status: 'draft' as ReportStatus,
          progress: 0,
          createdTime: dayjs().format('YYYY-MM-DD HH:mm:ss'),
          operator: '当前用户',
          sections: [],
          attachments: [],
          version: 'v1.0',
          downloadCount: 0,
          isTemplate: false
        }
        setReportsData(prev => [...prev, newReport])
        message.success('创建成功')
      }
      
      setCreateModalVisible(false)
      setEditModalVisible(false)
      setSelectedReport(null)
    } catch (error) {
      message.error('保存失败')
    }
  }

  /**
   * 保存模板
   */
  const handleSaveTemplate = async (values: any) => {
    try {
      if (selectedTemplate) {
        // 编辑
        setTemplatesData(prev => prev.map(item => 
          item.id === selectedTemplate.id ? { 
            ...item, 
            ...values, 
            updatedTime: dayjs().format('YYYY-MM-DD HH:mm:ss') 
          } : item
        ))
        message.success('保存成功')
      } else {
        // 新建
        const newTemplate: ReportTemplate = {
          id: Date.now().toString(),
          ...values,
          sections: [],
          isDefault: false,
          usageCount: 0,
          createdBy: '当前用户',
          createdTime: dayjs().format('YYYY-MM-DD HH:mm:ss'),
          updatedTime: dayjs().format('YYYY-MM-DD HH:mm:ss')
        }
        setTemplatesData(prev => [...prev, newTemplate])
        message.success('创建成功')
      }
      
      setTemplateModalVisible(false)
      setSelectedTemplate(null)
    } catch (error) {
      message.error('保存失败')
    }
  }

  /**
   * 过滤数据
   */
  const filteredReportsData = reportsData.filter(item => {
    const matchSearch = !searchText || 
      item.reportName.toLowerCase().includes(searchText.toLowerCase()) ||
      item.projectName.toLowerCase().includes(searchText.toLowerCase()) ||
      item.description?.toLowerCase().includes(searchText.toLowerCase())
    
    const matchStatus = !statusFilter || item.status === statusFilter
    const matchType = !typeFilter || item.reportType === typeFilter
    const matchTemplate = !templateFilter || item.templateType === templateFilter
    
    return matchSearch && matchStatus && matchType && matchTemplate
  })

  /**
   * 报告表格列定义
   */
  const reportColumns: ColumnsType<ReportRecord> = [
    {
      title: '报告名称',
      dataIndex: 'reportName',
      key: 'reportName',
      width: 200,
      fixed: 'left',
      ellipsis: true,
      render: (text: string, record) => (
        <div>
          <div style={{ fontWeight: 'bold' }}>{text}</div>
          <div style={{ fontSize: 12, color: '#666' }}>
            {record.description}
          </div>
        </div>
      )
    },
    {
      title: '项目',
      dataIndex: 'projectName',
      key: 'projectName',
      width: 150,
      ellipsis: true
    },
    {
      title: '报告类型',
      dataIndex: 'reportType',
      key: 'reportType',
      width: 100,
      render: (type: ReportType) => (
        <Tag color="blue">{getReportTypeText(type)}</Tag>
      )
    },
    {
      title: '模板类型',
      dataIndex: 'templateType',
      key: 'templateType',
      width: 120,
      render: (type: TemplateType) => (
        <Tag color="green">{getTemplateTypeText(type)}</Tag>
      )
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: (status: ReportStatus, record) => (
        <div>
          <Tag color={getStatusColor(status)}>
            {getStatusText(status)}
          </Tag>
          {status === 'generating' && (
            <Progress 
              percent={record.progress} 
              size="small" 
              style={{ marginTop: 4 }}
            />
          )}
        </div>
      )
    },
    {
      title: '格式',
      key: 'format',
      width: 80,
      render: (_, record) => (
        <Tag icon={<FilePdfOutlined />}>
          {record.settings.format.toUpperCase()}
        </Tag>
      )
    },
    {
      title: '文件大小',
      dataIndex: 'fileSize',
      key: 'fileSize',
      width: 100,
      render: (size: number) => size ? formatFileSize(size) : '-'
    },
    {
      title: '操作人',
      dataIndex: 'operator',
      key: 'operator',
      width: 100
    },
    {
      title: '创建时间',
      dataIndex: 'createdTime',
      key: 'createdTime',
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
      width: 280,
      fixed: 'right',
      render: (_, record) => (
        <Space size="small">
          <Tooltip title="预览">
            <Button
              type="text"
              icon={<EyeOutlined />}
              onClick={() => handlePreview(record)}
            />
          </Tooltip>
          <Tooltip title="编辑">
            <Button
              type="text"
              icon={<EditOutlined />}
              onClick={() => handleEditReport(record)}
              disabled={record.status === 'generating'}
            />
          </Tooltip>
          <Tooltip title="设置">
            <Button
              type="text"
              icon={<SettingOutlined />}
              onClick={() => handleSettings(record)}
            />
          </Tooltip>
          {record.status === 'draft' && (
            <Tooltip title="生成">
              <Button
                type="text"
                icon={<PlayCircleOutlined />}
                onClick={() => handleGenerate(record.id)}
              />
            </Tooltip>
          )}
          {record.status === 'completed' && (
            <>
              <Tooltip title="下载">
                <Button
                  type="text"
                  icon={<DownloadOutlined />}
                  onClick={() => handleDownload(record)}
                />
              </Tooltip>
              <Tooltip title="发送">
                <Button
                  type="text"
                  icon={<SendOutlined />}
                  onClick={() => handleSend(record)}
                />
              </Tooltip>
            </>
          )}
          <Popconfirm
            title="确定要删除这个报告吗？"
            onConfirm={() => handleDelete(record.id)}
          >
            <Tooltip title="删除">
              <Button
                type="text"
                danger
                icon={<DeleteOutlined />}
                disabled={record.status === 'generating'}
              />
            </Tooltip>
          </Popconfirm>
        </Space>
      )
    }
  ]

  /**
   * 模板表格列定义
   */
  const templateColumns: ColumnsType<ReportTemplate> = [
    {
      title: '模板名称',
      dataIndex: 'name',
      key: 'name',
      width: 200,
      render: (text: string, record) => (
        <div>
          <div style={{ fontWeight: 'bold' }}>
            {record.isDefault && <Tag color="gold" size="small">默认</Tag>}
            {text}
          </div>
          <div style={{ fontSize: 12, color: '#666' }}>
            {record.description}
          </div>
        </div>
      )
    },
    {
      title: '类型',
      dataIndex: 'type',
      key: 'type',
      width: 120,
      render: (type: TemplateType) => (
        <Tag color="green">{getTemplateTypeText(type)}</Tag>
      )
    },
    {
      title: '使用次数',
      dataIndex: 'usageCount',
      key: 'usageCount',
      width: 100,
      render: (count: number) => (
        <Badge count={count} showZero color="blue" />
      )
    },
    {
      title: '创建者',
      dataIndex: 'createdBy',
      key: 'createdBy',
      width: 100
    },
    {
      title: '创建时间',
      dataIndex: 'createdTime',
      key: 'createdTime',
      width: 150,
      render: (time: string) => dayjs(time).format('MM-DD HH:mm')
    },
    {
      title: '更新时间',
      dataIndex: 'updatedTime',
      key: 'updatedTime',
      width: 150,
      render: (time: string) => dayjs(time).format('MM-DD HH:mm')
    },
    {
      title: '操作',
      key: 'action',
      width: 200,
      render: (_, record) => (
        <Space size="small">
          <Tooltip title="编辑">
            <Button
              type="text"
              icon={<EditOutlined />}
              onClick={() => handleEditTemplate(record)}
            />
          </Tooltip>
          <Tooltip title="复制">
            <Button
              type="text"
              icon={<CopyOutlined />}
              onClick={() => {
                const newTemplate = { ...record, id: Date.now().toString(), name: `${record.name} (副本)` }
                setTemplatesData(prev => [...prev, newTemplate])
                message.success('复制成功')
              }}
            />
          </Tooltip>
          {!record.isDefault && (
            <Popconfirm
              title="确定要删除这个模板吗？"
              onConfirm={() => handleDeleteTemplate(record.id)}
            >
              <Tooltip title="删除">
                <Button
                  type="text"
                  danger
                  icon={<DeleteOutlined />}
                />
              </Tooltip>
            </Popconfirm>
          )}
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
              title="总报告数"
              value={reportsData.length}
              prefix={<FileTextOutlined />}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card size="small">
            <Statistic
              title="已完成"
              value={reportsData.filter(item => item.status === 'completed').length}
              valueStyle={{ color: '#3f8600' }}
              prefix={<CheckCircleOutlined />}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card size="small">
            <Statistic
              title="生成中"
              value={reportsData.filter(item => item.status === 'generating').length}
              valueStyle={{ color: '#1890ff' }}
              prefix={<ClockCircleOutlined />}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card size="small">
            <Statistic
              title="模板数"
              value={templatesData.length}
              valueStyle={{ color: '#722ed1' }}
              prefix={<LayoutOutlined />}
            />
          </Card>
        </Col>
      </Row>

      {/* 主要内容 */}
      <Card size="small">
        <Tabs activeKey={activeTab} onChange={setActiveTab}>
          <TabPane tab="报告管理" key="reports">
            {/* 搜索和筛选 */}
            <Row gutter={16} style={{ marginBottom: 16 }}>
              <Col span={6}>
                <Search
                  placeholder="搜索报告名称、项目或描述"
                  value={searchText}
                  onChange={(e) => setSearchText(e.target.value)}
                  onSearch={loadReportsData}
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
                  <Option value="draft">草稿</Option>
                  <Option value="generating">生成中</Option>
                  <Option value="completed">已完成</Option>
                  <Option value="failed">失败</Option>
                  <Option value="sent">已发送</Option>
                </Select>
              </Col>
              <Col span={3}>
                <Select
                  placeholder="报告类型"
                  value={typeFilter}
                  onChange={setTypeFilter}
                  allowClear
                  style={{ width: '100%' }}
                >
                  <Option value="standard">标准报告</Option>
                  <Option value="detailed">详细报告</Option>
                  <Option value="summary">摘要报告</Option>
                  <Option value="custom">自定义报告</Option>
                </Select>
              </Col>
              <Col span={3}>
                <Select
                  placeholder="模板类型"
                  value={templateFilter}
                  onChange={setTemplateFilter}
                  allowClear
                  style={{ width: '100%' }}
                >
                  <Option value="wgs">全基因组测序</Option>
                  <Option value="wes">全外显子测序</Option>
                  <Option value="rna_seq">RNA测序</Option>
                  <Option value="metagenome">宏基因组</Option>
                  <Option value="clinical">临床检测</Option>
                  <Option value="research">科研项目</Option>
                </Select>
              </Col>
              <Col span={6}>
                <Space>
                  <Button 
                    type="primary" 
                    icon={<PlusOutlined />} 
                    onClick={handleCreateReport}
                  >
                    创建报告
                  </Button>
                  <Button onClick={loadReportsData} loading={loading}>
                    刷新
                  </Button>
                </Space>
              </Col>
            </Row>

            {/* 报告列表 */}
            <Table
              columns={reportColumns}
              dataSource={filteredReportsData}
              rowKey="id"
              loading={loading}
              scroll={{ x: 1600 }}
              pagination={{
                total: filteredReportsData.length,
                pageSize: 10,
                showSizeChanger: true,
                showQuickJumper: true,
                showTotal: (total) => `共 ${total} 条记录`
              }}
            />
          </TabPane>

          <TabPane tab="模板管理" key="templates">
            <div style={{ marginBottom: 16 }}>
              <Button 
                type="primary" 
                icon={<PlusOutlined />} 
                onClick={handleCreateTemplate}
              >
                创建模板
              </Button>
            </div>

            <Table
              columns={templateColumns}
              dataSource={templatesData}
              rowKey="id"
              pagination={{
                total: templatesData.length,
                pageSize: 10,
                showSizeChanger: true,
                showQuickJumper: true,
                showTotal: (total) => `共 ${total} 条记录`
              }}
            />
          </TabPane>
        </Tabs>
      </Card>

      {/* 创建报告模态框 */}
      <Modal
        title="创建报告"
        open={createModalVisible}
        onCancel={() => setCreateModalVisible(false)}
        onOk={() => form.submit()}
        width={800}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSaveReport}
        >
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="reportName"
                label="报告名称"
                rules={[{ required: true, message: '请输入报告名称' }]}
              >
                <Input placeholder="请输入报告名称" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="reportType"
                label="报告类型"
                rules={[{ required: true, message: '请选择报告类型' }]}
              >
                <Select placeholder="请选择报告类型">
                  <Option value="standard">标准报告</Option>
                  <Option value="detailed">详细报告</Option>
                  <Option value="summary">摘要报告</Option>
                  <Option value="custom">自定义报告</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="templateType"
                label="模板类型"
                rules={[{ required: true, message: '请选择模板类型' }]}
              >
                <Select placeholder="请选择模板类型">
                  <Option value="wgs">全基因组测序</Option>
                  <Option value="wes">全外显子测序</Option>
                  <Option value="rna_seq">RNA测序</Option>
                  <Option value="metagenome">宏基因组</Option>
                  <Option value="clinical">临床检测</Option>
                  <Option value="research">科研项目</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="projectId"
                label="关联项目"
                rules={[{ required: true, message: '请选择关联项目' }]}
              >
                <Select placeholder="请选择关联项目">
                  <Option value="P001">人类全基因组变异检测项目</Option>
                  <Option value="P002">RNA差异表达分析</Option>
                  <Option value="P003">微生物群落多样性分析</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={24}>
              <Form.Item
                name="description"
                label="报告描述"
              >
                <TextArea rows={3} placeholder="请输入报告描述" />
              </Form.Item>
            </Col>
            <Col span={24}>
              <Form.Item
                name="recipients"
                label="接收人邮箱"
              >
                <Select
                  mode="tags"
                  placeholder="请输入接收人邮箱地址"
                  tokenSeparators={[',']}
                />
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </Modal>

      {/* 编辑报告模态框 */}
      <Modal
        title="编辑报告"
        open={editModalVisible}
        onCancel={() => setEditModalVisible(false)}
        onOk={() => form.submit()}
        width={800}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSaveReport}
        >
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="reportName"
                label="报告名称"
                rules={[{ required: true, message: '请输入报告名称' }]}
              >
                <Input placeholder="请输入报告名称" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="reportType"
                label="报告类型"
                rules={[{ required: true, message: '请选择报告类型' }]}
              >
                <Select placeholder="请选择报告类型">
                  <Option value="standard">标准报告</Option>
                  <Option value="detailed">详细报告</Option>
                  <Option value="summary">摘要报告</Option>
                  <Option value="custom">自定义报告</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={24}>
              <Form.Item
                name="description"
                label="报告描述"
              >
                <TextArea rows={3} placeholder="请输入报告描述" />
              </Form.Item>
            </Col>
            <Col span={24}>
              <Form.Item
                name="recipients"
                label="接收人邮箱"
              >
                <Select
                  mode="tags"
                  placeholder="请输入接收人邮箱地址"
                  tokenSeparators={[',']}
                />
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </Modal>

      {/* 创建/编辑模板模态框 */}
      <Modal
        title={selectedTemplate ? "编辑模板" : "创建模板"}
        open={templateModalVisible}
        onCancel={() => setTemplateModalVisible(false)}
        onOk={() => templateForm.submit()}
        width={600}
      >
        <Form
          form={templateForm}
          layout="vertical"
          onFinish={handleSaveTemplate}
        >
          <Form.Item
            name="name"
            label="模板名称"
            rules={[{ required: true, message: '请输入模板名称' }]}
          >
            <Input placeholder="请输入模板名称" />
          </Form.Item>
          <Form.Item
            name="type"
            label="模板类型"
            rules={[{ required: true, message: '请选择模板类型' }]}
          >
            <Select placeholder="请选择模板类型">
              <Option value="wgs">全基因组测序</Option>
              <Option value="wes">全外显子测序</Option>
              <Option value="rna_seq">RNA测序</Option>
              <Option value="metagenome">宏基因组</Option>
              <Option value="clinical">临床检测</Option>
              <Option value="research">科研项目</Option>
            </Select>
          </Form.Item>
          <Form.Item
            name="description"
            label="模板描述"
            rules={[{ required: true, message: '请输入模板描述' }]}
          >
            <TextArea rows={3} placeholder="请输入模板描述" />
          </Form.Item>
        </Form>
      </Modal>

      {/* 预览抽屉 */}
      <Drawer
        title="报告预览"
        placement="right"
        onClose={() => setPreviewDrawerVisible(false)}
        open={previewDrawerVisible}
        width={800}
      >
        {selectedReport && (
          <div>
            <Alert
              message="报告预览"
              description={`${selectedReport.reportName} 的预览内容`}
              type="info"
              showIcon
              style={{ marginBottom: 16 }}
            />
            
            <div style={{ 
              border: '1px solid #d9d9d9', 
              borderRadius: 6, 
              padding: 16, 
              backgroundColor: '#fafafa',
              minHeight: 600
            }}>
              <div style={{ textAlign: 'center', marginBottom: 24 }}>
                <Title level={2}>{selectedReport.reportName}</Title>
                <Text type="secondary">
                  项目: {selectedReport.projectName} | 
                  生成时间: {selectedReport.completedTime || selectedReport.createdTime}
                </Text>
              </div>
              
              <Divider />
              
              <div style={{ marginBottom: 16 }}>
                <Title level={4}>执行摘要</Title>
                <Paragraph>
                  本报告基于 {getTemplateTypeText(selectedReport.templateType)} 分析结果生成，
                  包含了完整的数据分析流程和质量控制指标。分析采用了最新的生物信息学算法，
                  确保结果的准确性和可靠性。
                </Paragraph>
              </div>
              
              <div style={{ marginBottom: 16 }}>
                <Title level={4}>分析概况</Title>
                <Descriptions bordered size="small" column={2}>
                  <Descriptions.Item label="分析类型">
                    {getTemplateTypeText(selectedReport.templateType)}
                  </Descriptions.Item>
                  <Descriptions.Item label="报告类型">
                    {getReportTypeText(selectedReport.reportType)}
                  </Descriptions.Item>
                  <Descriptions.Item label="数据格式">
                    {selectedReport.settings.format.toUpperCase()}
                  </Descriptions.Item>
                  <Descriptions.Item label="报告语言">
                    {selectedReport.settings.language === 'zh' ? '中文' : '英文'}
                  </Descriptions.Item>
                </Descriptions>
              </div>
              
              <div style={{ marginBottom: 16 }}>
                <Title level={4}>质量控制</Title>
                <div style={{ textAlign: 'center' }}>
                  <Progress 
                    type="circle" 
                    percent={85} 
                    format={() => '85分'} 
                    strokeColor="#52c41a"
                  />
                  <div style={{ marginTop: 8 }}>
                    <Text>整体质量评分</Text>
                  </div>
                </div>
              </div>
              
              <div style={{ marginBottom: 16 }}>
                <Title level={4}>主要发现</Title>
                <List
                  size="small"
                  dataSource={[
                    '检测到 4,567,890 个变异位点',
                    '其中 SNP 变异 4,234,567 个',
                    'InDel 变异 333,323 个',
                    '平均测序深度 30.2X',
                    '比对率达到 95.2%'
                  ]}
                  renderItem={item => <List.Item>{item}</List.Item>}
                />
              </div>
              
              <div style={{ textAlign: 'center', color: '#999', fontSize: 12 }}>
                <Divider />
                <div>此为报告预览，完整内容请下载PDF文件查看</div>
              </div>
            </div>
          </div>
        )}
      </Drawer>

      {/* 设置抽屉 */}
      <Drawer
        title="报告设置"
        placement="right"
        onClose={() => setSettingsDrawerVisible(false)}
        open={settingsDrawerVisible}
        width={500}
      >
        {selectedReport && (
          <div>
            <Form layout="vertical" initialValues={selectedReport.settings}>
              <Form.Item label="报告语言">
                <Radio.Group>
                  <Radio value="zh">中文</Radio>
                  <Radio value="en">英文</Radio>
                </Radio.Group>
              </Form.Item>
              
              <Form.Item label="输出格式">
                <Radio.Group>
                  <Radio value="pdf">PDF</Radio>
                  <Radio value="html">HTML</Radio>
                  <Radio value="docx">DOCX</Radio>
                </Radio.Group>
              </Form.Item>
              
              <Form.Item label="报告主题">
                <Select defaultValue="professional">
                  <Option value="default">默认</Option>
                  <Option value="professional">专业</Option>
                  <Option value="modern">现代</Option>
                  <Option value="minimal">简约</Option>
                </Select>
              </Form.Item>
              
              <Divider>内容设置</Divider>
              
              <Form.Item>
                <Checkbox defaultChecked={selectedReport.settings.includeRawData}>
                  包含原始数据
                </Checkbox>
              </Form.Item>
              
              <Form.Item>
                <Checkbox defaultChecked={selectedReport.settings.includeCharts}>
                  包含图表
                </Checkbox>
              </Form.Item>
              
              <Form.Item>
                <Checkbox defaultChecked={selectedReport.settings.includeStatistics}>
                  包含统计信息
                </Checkbox>
              </Form.Item>
              
              <Form.Item>
                <Checkbox defaultChecked={selectedReport.settings.includeQualityMetrics}>
                  包含质量指标
                </Checkbox>
              </Form.Item>
              
              <Form.Item>
                <Checkbox defaultChecked={selectedReport.settings.includeAnnotations}>
                  包含注释信息
                </Checkbox>
              </Form.Item>
              
              <Divider>格式设置</Divider>
              
              <Form.Item>
                <Checkbox defaultChecked={selectedReport.settings.watermark}>
                  添加水印
                </Checkbox>
              </Form.Item>
              
              <Form.Item>
                <Checkbox defaultChecked={selectedReport.settings.pageNumbers}>
                  显示页码
                </Checkbox>
              </Form.Item>
              
              <Form.Item>
                <Checkbox defaultChecked={selectedReport.settings.tableOfContents}>
                  生成目录
                </Checkbox>
              </Form.Item>
              
              <Form.Item>
                <Checkbox defaultChecked={selectedReport.settings.executiveSummary}>
                  执行摘要
                </Checkbox>
              </Form.Item>
              
              <Form.Item label="配色方案">
                <ColorPicker defaultValue={selectedReport.settings.colorScheme} />
              </Form.Item>
              
              <div style={{ marginTop: 24 }}>
                <Button type="primary" block>
                  保存设置
                </Button>
              </div>
            </Form>
          </div>
        )}
      </Drawer>
    </div>
  )
}

export default ReportGeneration