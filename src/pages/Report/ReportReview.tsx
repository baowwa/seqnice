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
  Rate
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
  UnderlineOutlined,
  AuditOutlined,
  CheckOutlined,
  CloseOutlined,
  WarningOutlined,
  InfoCircleOutlined,
  MessageOutlined,
  HistoryOutlined,
  FlagOutlined,
  LikeOutlined,
  DislikeOutlined,
  CommentOutlined,
  BellOutlined,
  NotificationOutlined,
  ScheduleOutlined,
  SolutionOutlined,
  ReconciliationOutlined,
  FileDoneOutlined,
  FileExclamationOutlined,
  FileProtectOutlined,
  FileSyncOutlined,
  FileSearchOutlined,
  FileUnknownOutlined
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
const { Step } = Steps

/**
 * 审核状态枚举
 */
type ReviewStatus = 'pending' | 'reviewing' | 'approved' | 'rejected' | 'revision_required' | 'completed'

/**
 * 审核优先级枚举
 */
type ReviewPriority = 'low' | 'medium' | 'high' | 'urgent'

/**
 * 审核类型枚举
 */
type ReviewType = 'content' | 'quality' | 'technical' | 'clinical' | 'final'

/**
 * 报告审核记录接口
 */
interface ReviewRecord {
  id: string
  reportId: string
  reportName: string
  reportType: string
  templateType: string
  status: ReviewStatus
  priority: ReviewPriority
  reviewType: ReviewType
  submittedBy: string
  submittedTime: string
  assignedTo: string
  assignedTime?: string
  reviewStartTime?: string
  reviewEndTime?: string
  deadline: string
  progress: number
  score?: number
  issues: ReviewIssue[]
  comments: ReviewComment[]
  attachments: ReviewAttachment[]
  version: string
  previousVersions: string[]
  isUrgent: boolean
  tags: string[]
  projectId: string
  projectName: string
  clientName?: string
  estimatedTime: number
  actualTime?: number
}

/**
 * 审核问题接口
 */
interface ReviewIssue {
  id: string
  type: 'error' | 'warning' | 'suggestion'
  category: string
  title: string
  description: string
  location: string
  severity: 'low' | 'medium' | 'high' | 'critical'
  status: 'open' | 'resolved' | 'ignored'
  createdBy: string
  createdTime: string
  resolvedBy?: string
  resolvedTime?: string
  resolution?: string
}

/**
 * 审核评论接口
 */
interface ReviewComment {
  id: string
  content: string
  type: 'general' | 'issue' | 'suggestion' | 'approval'
  author: string
  authorAvatar?: string
  createdTime: string
  parentId?: string
  replies?: ReviewComment[]
  attachments?: string[]
  isPrivate: boolean
}

/**
 * 审核附件接口
 */
interface ReviewAttachment {
  id: string
  fileName: string
  fileType: string
  fileSize: number
  uploadedBy: string
  uploadedTime: string
  description?: string
}

/**
 * 审核员信息接口
 */
interface Reviewer {
  id: string
  name: string
  avatar?: string
  role: string
  department: string
  specialties: string[]
  workload: number
  rating: number
  isOnline: boolean
}

/**
 * 报告审核页面组件
 * 
 * 功能特性：
 * - 报告质量审核和内容校验
 * - 多级审核流程管理
 * - 问题跟踪和解决
 * - 审核评论和协作
 * - 审核统计和报表
 * - 审核员工作量管理
 */
const ReportReview: React.FC = () => {
  // 状态管理
  const [loading, setLoading] = useState(false)
  const [reviewsData, setReviewsData] = useState<ReviewRecord[]>([])
  const [reviewersData, setReviewersData] = useState<Reviewer[]>([])
  const [selectedReview, setSelectedReview] = useState<ReviewRecord | null>(null)
  const [assignModalVisible, setAssignModalVisible] = useState(false)
  const [reviewModalVisible, setReviewModalVisible] = useState(false)
  const [issueModalVisible, setIssueModalVisible] = useState(false)
  const [commentModalVisible, setCommentModalVisible] = useState(false)
  const [detailDrawerVisible, setDetailDrawerVisible] = useState(false)
  const [historyDrawerVisible, setHistoryDrawerVisible] = useState(false)
  const [searchText, setSearchText] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('')
  const [priorityFilter, setPriorityFilter] = useState<string>('')
  const [typeFilter, setTypeFilter] = useState<string>('')
  const [assigneeFilter, setAssigneeFilter] = useState<string>('')
  const [activeTab, setActiveTab] = useState('reviews')
  const [form] = Form.useForm()
  const [reviewForm] = Form.useForm()
  const [issueForm] = Form.useForm()
  const [commentForm] = Form.useForm()

  /**
   * 模拟审核数据
   */
  const mockReviewsData: ReviewRecord[] = [
    {
      id: '1',
      reportId: 'R001',
      reportName: '人类全基因组变异检测报告',
      reportType: 'detailed',
      templateType: 'wgs',
      status: 'reviewing',
      priority: 'high',
      reviewType: 'technical',
      submittedBy: '张三',
      submittedTime: '2024-01-15 14:30:00',
      assignedTo: '李四',
      assignedTime: '2024-01-15 15:00:00',
      reviewStartTime: '2024-01-15 15:30:00',
      deadline: '2024-01-17 18:00:00',
      progress: 65,
      score: 85,
      issues: [],
      comments: [],
      attachments: [],
      version: 'v1.0',
      previousVersions: [],
      isUrgent: false,
      tags: ['WGS', '变异检测', '质量控制'],
      projectId: 'P001',
      projectName: '人类全基因组变异检测项目',
      clientName: '某医院',
      estimatedTime: 8,
      actualTime: 5
    },
    {
      id: '2',
      reportId: 'R002',
      reportName: 'RNA差异表达分析报告',
      reportType: 'standard',
      templateType: 'rna_seq',
      status: 'pending',
      priority: 'medium',
      reviewType: 'content',
      submittedBy: '王五',
      submittedTime: '2024-01-16 09:15:00',
      assignedTo: '',
      deadline: '2024-01-18 17:00:00',
      progress: 0,
      issues: [],
      comments: [],
      attachments: [],
      version: 'v1.0',
      previousVersions: [],
      isUrgent: false,
      tags: ['RNA-seq', '差异表达', '功能富集'],
      projectId: 'P002',
      projectName: 'RNA差异表达分析',
      estimatedTime: 6
    },
    {
      id: '3',
      reportId: 'R003',
      reportName: '微生物群落分析报告',
      reportType: 'summary',
      templateType: 'metagenome',
      status: 'revision_required',
      priority: 'low',
      reviewType: 'quality',
      submittedBy: '赵六',
      submittedTime: '2024-01-14 11:00:00',
      assignedTo: '钱七',
      assignedTime: '2024-01-14 14:00:00',
      reviewStartTime: '2024-01-14 14:30:00',
      reviewEndTime: '2024-01-15 10:00:00',
      deadline: '2024-01-19 16:00:00',
      progress: 100,
      score: 72,
      issues: [
        {
          id: '1',
          type: 'warning',
          category: '数据质量',
          title: '样本多样性指标偏低',
          description: 'Shannon指数低于预期阈值，建议重新检查样本处理流程',
          location: '第3章 多样性分析',
          severity: 'medium',
          status: 'open',
          createdBy: '钱七',
          createdTime: '2024-01-15 09:30:00'
        }
      ],
      comments: [],
      attachments: [],
      version: 'v1.1',
      previousVersions: ['v1.0'],
      isUrgent: false,
      tags: ['宏基因组', '微生物', '多样性'],
      projectId: 'P003',
      projectName: '微生物群落多样性分析',
      estimatedTime: 4,
      actualTime: 6
    },
    {
      id: '4',
      reportId: 'R004',
      reportName: '临床基因检测报告',
      reportType: 'clinical',
      templateType: 'clinical',
      status: 'approved',
      priority: 'urgent',
      reviewType: 'clinical',
      submittedBy: '孙八',
      submittedTime: '2024-01-13 16:20:00',
      assignedTo: '周九',
      assignedTime: '2024-01-13 16:30:00',
      reviewStartTime: '2024-01-13 17:00:00',
      reviewEndTime: '2024-01-14 12:00:00',
      deadline: '2024-01-14 18:00:00',
      progress: 100,
      score: 95,
      issues: [],
      comments: [],
      attachments: [],
      version: 'v1.0',
      previousVersions: [],
      isUrgent: true,
      tags: ['临床检测', '遗传病', '基因变异'],
      projectId: 'P004',
      projectName: '临床基因检测项目',
      clientName: '某三甲医院',
      estimatedTime: 12,
      actualTime: 10
    }
  ]

  /**
   * 模拟审核员数据
   */
  const mockReviewersData: Reviewer[] = [
    {
      id: '1',
      name: '李四',
      role: '高级审核员',
      department: '生物信息学部',
      specialties: ['WGS', 'WES', '变异检测'],
      workload: 75,
      rating: 4.8,
      isOnline: true
    },
    {
      id: '2',
      name: '钱七',
      role: '审核员',
      department: '质量控制部',
      specialties: ['RNA-seq', '宏基因组', '质量评估'],
      workload: 60,
      rating: 4.5,
      isOnline: true
    },
    {
      id: '3',
      name: '周九',
      role: '临床审核专家',
      department: '临床应用部',
      specialties: ['临床检测', '遗传咨询', '报告解读'],
      workload: 40,
      rating: 4.9,
      isOnline: false
    },
    {
      id: '4',
      name: '吴十',
      role: '审核员',
      department: '生物信息学部',
      specialties: ['转录组', '表观遗传', '功能分析'],
      workload: 85,
      rating: 4.3,
      isOnline: true
    }
  ]

  /**
   * 组件初始化
   */
  useEffect(() => {
    loadReviewsData()
    loadReviewersData()
  }, [])

  /**
   * 加载审核数据
   */
  const loadReviewsData = async () => {
    setLoading(true)
    try {
      // 模拟API调用
      await new Promise(resolve => setTimeout(resolve, 1000))
      setReviewsData(mockReviewsData)
    } catch (error) {
      console.error('加载审核数据失败:', error)
    } finally {
      setLoading(false)
    }
  }

  /**
   * 加载审核员数据
   */
  const loadReviewersData = async () => {
    try {
      // 模拟API调用
      await new Promise(resolve => setTimeout(resolve, 500))
      setReviewersData(mockReviewersData)
    } catch (error) {
      console.error('加载审核员数据失败:', error)
    }
  }

  /**
   * 获取审核类型文本
   */
  const getReviewTypeText = (type: ReviewType) => {
    const textMap = {
      content: '内容审核',
      quality: '质量审核',
      technical: '技术审核',
      clinical: '临床审核',
      final: '最终审核'
    }
    return textMap[type]
  }

  /**
   * 获取优先级颜色
   */
  const getPriorityColor = (priority: ReviewPriority) => {
    const colorMap = {
      low: 'green',
      medium: 'blue',
      high: 'orange',
      urgent: 'red'
    }
    return colorMap[priority]
  }

  /**
   * 获取优先级文本
   */
  const getPriorityText = (priority: ReviewPriority) => {
    const textMap = {
      low: '低',
      medium: '中',
      high: '高',
      urgent: '紧急'
    }
    return textMap[priority]
  }

  /**
   * 获取状态颜色
   */
  const getStatusColor = (status: ReviewStatus) => {
    const colorMap = {
      pending: 'default',
      reviewing: 'processing',
      approved: 'success',
      rejected: 'error',
      revision_required: 'warning',
      completed: 'cyan'
    }
    return colorMap[status]
  }

  /**
   * 获取状态文本
   */
  const getStatusText = (status: ReviewStatus) => {
    const textMap = {
      pending: '待分配',
      reviewing: '审核中',
      approved: '已通过',
      rejected: '已拒绝',
      revision_required: '需修订',
      completed: '已完成'
    }
    return textMap[status]
  }

  /**
   * 获取问题类型图标
   */
  const getIssueTypeIcon = (type: string) => {
    const iconMap = {
      error: <CloseOutlined style={{ color: '#ff4d4f' }} />,
      warning: <WarningOutlined style={{ color: '#faad14' }} />,
      suggestion: <InfoCircleOutlined style={{ color: '#1890ff' }} />
    }
    return iconMap[type as keyof typeof iconMap]
  }

  /**
   * 计算剩余时间
   */
  const getRemainingTime = (deadline: string) => {
    const now = dayjs()
    const end = dayjs(deadline)
    const diff = end.diff(now, 'hour')
    
    if (diff < 0) {
      return { text: '已超期', color: '#ff4d4f' }
    } else if (diff < 24) {
      return { text: `${diff}小时`, color: '#faad14' }
    } else {
      const days = Math.floor(diff / 24)
      return { text: `${days}天`, color: '#52c41a' }
    }
  }

  /**
   * 分配审核员
   */
  const handleAssign = (record: ReviewRecord) => {
    setSelectedReview(record)
    form.resetFields()
    setAssignModalVisible(true)
  }

  /**
   * 开始审核
   */
  const handleStartReview = (record: ReviewRecord) => {
    setSelectedReview(record)
    reviewForm.resetFields()
    setReviewModalVisible(true)
  }

  /**
   * 查看详情
   */
  const handleViewDetail = (record: ReviewRecord) => {
    setSelectedReview(record)
    setDetailDrawerVisible(true)
  }

  /**
   * 查看历史
   */
  const handleViewHistory = (record: ReviewRecord) => {
    setSelectedReview(record)
    setHistoryDrawerVisible(true)
  }

  /**
   * 添加问题
   */
  const handleAddIssue = () => {
    issueForm.resetFields()
    setIssueModalVisible(true)
  }

  /**
   * 添加评论
   */
  const handleAddComment = () => {
    commentForm.resetFields()
    setCommentModalVisible(true)
  }

  /**
   * 提交分配
   */
  const handleSubmitAssign = async (values: any) => {
    try {
      // 模拟API调用
      await new Promise(resolve => setTimeout(resolve, 500))
      
      setReviewsData(prev => prev.map(item => 
        item.id === selectedReview?.id ? {
          ...item,
          assignedTo: values.assignedTo,
          assignedTime: dayjs().format('YYYY-MM-DD HH:mm:ss'),
          status: 'reviewing' as ReviewStatus
        } : item
      ))
      
      setAssignModalVisible(false)
      setSelectedReview(null)
      message.success('分配成功')
    } catch (error) {
      message.error('分配失败')
    }
  }

  /**
   * 提交审核结果
   */
  const handleSubmitReview = async (values: any) => {
    try {
      // 模拟API调用
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      const newStatus = values.result === 'approved' ? 'approved' : 
                       values.result === 'rejected' ? 'rejected' : 'revision_required'
      
      setReviewsData(prev => prev.map(item => 
        item.id === selectedReview?.id ? {
          ...item,
          status: newStatus as ReviewStatus,
          progress: 100,
          score: values.score,
          reviewEndTime: dayjs().format('YYYY-MM-DD HH:mm:ss'),
          actualTime: selectedReview?.estimatedTime || 0
        } : item
      ))
      
      setReviewModalVisible(false)
      setSelectedReview(null)
      message.success('审核完成')
    } catch (error) {
      message.error('提交失败')
    }
  }

  /**
   * 提交问题
   */
  const handleSubmitIssue = async (values: any) => {
    try {
      // 模拟API调用
      await new Promise(resolve => setTimeout(resolve, 500))
      
      const newIssue: ReviewIssue = {
        id: Date.now().toString(),
        ...values,
        status: 'open' as const,
        createdBy: '当前用户',
        createdTime: dayjs().format('YYYY-MM-DD HH:mm:ss')
      }
      
      setSelectedReview(prev => prev ? {
        ...prev,
        issues: [...prev.issues, newIssue]
      } : null)
      
      setIssueModalVisible(false)
      message.success('问题添加成功')
    } catch (error) {
      message.error('添加失败')
    }
  }

  /**
   * 提交评论
   */
  const handleSubmitComment = async (values: any) => {
    try {
      // 模拟API调用
      await new Promise(resolve => setTimeout(resolve, 500))
      
      const newComment: ReviewComment = {
        id: Date.now().toString(),
        ...values,
        author: '当前用户',
        createdTime: dayjs().format('YYYY-MM-DD HH:mm:ss'),
        isPrivate: false
      }
      
      setSelectedReview(prev => prev ? {
        ...prev,
        comments: [...prev.comments, newComment]
      } : null)
      
      setCommentModalVisible(false)
      message.success('评论添加成功')
    } catch (error) {
      message.error('添加失败')
    }
  }

  /**
   * 过滤数据
   */
  const filteredReviewsData = reviewsData.filter(item => {
    const matchSearch = !searchText || 
      item.reportName.toLowerCase().includes(searchText.toLowerCase()) ||
      item.projectName.toLowerCase().includes(searchText.toLowerCase()) ||
      item.submittedBy.toLowerCase().includes(searchText.toLowerCase())
    
    const matchStatus = !statusFilter || item.status === statusFilter
    const matchPriority = !priorityFilter || item.priority === priorityFilter
    const matchType = !typeFilter || item.reviewType === typeFilter
    const matchAssignee = !assigneeFilter || item.assignedTo === assigneeFilter
    
    return matchSearch && matchStatus && matchPriority && matchType && matchAssignee
  })

  /**
   * 审核表格列定义
   */
  const reviewColumns: ColumnsType<ReviewRecord> = [
    {
      title: '报告信息',
      key: 'reportInfo',
      width: 200,
      fixed: 'left',
      render: (_, record) => (
        <div>
          <div style={{ fontWeight: 'bold' }}>{record.reportName}</div>
          <div style={{ fontSize: 12, color: '#666' }}>
            {record.projectName}
          </div>
          <div style={{ fontSize: 12, color: '#999' }}>
            ID: {record.reportId} | v{record.version}
          </div>
        </div>
      )
    },
    {
      title: '审核类型',
      dataIndex: 'reviewType',
      key: 'reviewType',
      width: 100,
      render: (type: ReviewType) => (
        <Tag color="blue">{getReviewTypeText(type)}</Tag>
      )
    },
    {
      title: '优先级',
      dataIndex: 'priority',
      key: 'priority',
      width: 80,
      render: (priority: ReviewPriority, record) => (
        <div>
          <Tag color={getPriorityColor(priority)}>
            {getPriorityText(priority)}
          </Tag>
          {record.isUrgent && <Tag color="red" size="small">紧急</Tag>}
        </div>
      )
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 120,
      render: (status: ReviewStatus, record) => (
        <div>
          <Tag color={getStatusColor(status)}>
            {getStatusText(status)}
          </Tag>
          {status === 'reviewing' && (
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
      title: '审核员',
      key: 'reviewer',
      width: 120,
      render: (_, record) => (
        <div>
          {record.assignedTo ? (
            <div>
              <Avatar size="small" icon={<UserOutlined />} />
              <span style={{ marginLeft: 8 }}>{record.assignedTo}</span>
            </div>
          ) : (
            <Text type="secondary">未分配</Text>
          )}
        </div>
      )
    },
    {
      title: '评分',
      dataIndex: 'score',
      key: 'score',
      width: 80,
      render: (score: number) => score ? (
        <div>
          <Rate disabled value={score / 20} style={{ fontSize: 12 }} />
          <div style={{ fontSize: 12, color: '#666' }}>{score}分</div>
        </div>
      ) : '-'
    },
    {
      title: '问题',
      key: 'issues',
      width: 80,
      render: (_, record) => {
        const errorCount = record.issues.filter(i => i.type === 'error').length
        const warningCount = record.issues.filter(i => i.type === 'warning').length
        const suggestionCount = record.issues.filter(i => i.type === 'suggestion').length
        
        return (
          <div>
            {errorCount > 0 && <Badge count={errorCount} style={{ backgroundColor: '#ff4d4f' }} />}
            {warningCount > 0 && <Badge count={warningCount} style={{ backgroundColor: '#faad14' }} />}
            {suggestionCount > 0 && <Badge count={suggestionCount} style={{ backgroundColor: '#1890ff' }} />}
            {record.issues.length === 0 && <Text type="secondary">无</Text>}
          </div>
        )
      }
    },
    {
      title: '截止时间',
      key: 'deadline',
      width: 120,
      render: (_, record) => {
        const remaining = getRemainingTime(record.deadline)
        return (
          <div>
            <div style={{ fontSize: 12 }}>
              {dayjs(record.deadline).format('MM-DD HH:mm')}
            </div>
            <div style={{ fontSize: 12, color: remaining.color }}>
              剩余 {remaining.text}
            </div>
          </div>
        )
      }
    },
    {
      title: '时间统计',
      key: 'timeStats',
      width: 100,
      render: (_, record) => (
        <div style={{ fontSize: 12 }}>
          <div>预计: {record.estimatedTime}h</div>
          {record.actualTime && (
            <div style={{ color: record.actualTime > record.estimatedTime ? '#ff4d4f' : '#52c41a' }}>
              实际: {record.actualTime}h
            </div>
          )}
        </div>
      )
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
            <Tooltip title="分配审核员">
              <Button
                type="text"
                icon={<UserOutlined />}
                onClick={() => handleAssign(record)}
              />
            </Tooltip>
          )}
          {record.status === 'reviewing' && (
            <Tooltip title="开始审核">
              <Button
                type="text"
                icon={<AuditOutlined />}
                onClick={() => handleStartReview(record)}
              />
            </Tooltip>
          )}
          <Tooltip title="查看历史">
            <Button
              type="text"
              icon={<HistoryOutlined />}
              onClick={() => handleViewHistory(record)}
            />
          </Tooltip>
          <Tooltip title="下载报告">
            <Button
              type="text"
              icon={<DownloadOutlined />}
            />
          </Tooltip>
        </Space>
      )
    }
  ]

  /**
   * 审核员表格列定义
   */
  const reviewerColumns: ColumnsType<Reviewer> = [
    {
      title: '审核员',
      key: 'reviewer',
      render: (_, record) => (
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <Avatar src={record.avatar} icon={<UserOutlined />} />
          <div style={{ marginLeft: 12 }}>
            <div style={{ fontWeight: 'bold' }}>
              {record.name}
              {record.isOnline && <Badge status="success" style={{ marginLeft: 8 }} />}
            </div>
            <div style={{ fontSize: 12, color: '#666' }}>
              {record.role} | {record.department}
            </div>
          </div>
        </div>
      )
    },
    {
      title: '专业领域',
      dataIndex: 'specialties',
      key: 'specialties',
      render: (specialties: string[]) => (
        <div>
          {specialties.map(specialty => (
            <Tag key={specialty} size="small">{specialty}</Tag>
          ))}
        </div>
      )
    },
    {
      title: '工作负载',
      dataIndex: 'workload',
      key: 'workload',
      render: (workload: number) => (
        <div>
          <Progress 
            percent={workload} 
            size="small" 
            strokeColor={workload > 80 ? '#ff4d4f' : workload > 60 ? '#faad14' : '#52c41a'}
          />
          <div style={{ fontSize: 12, color: '#666' }}>{workload}%</div>
        </div>
      )
    },
    {
      title: '评分',
      dataIndex: 'rating',
      key: 'rating',
      render: (rating: number) => (
        <div>
          <Rate disabled value={rating} style={{ fontSize: 14 }} />
          <div style={{ fontSize: 12, color: '#666' }}>{rating}</div>
        </div>
      )
    },
    {
      title: '状态',
      key: 'status',
      render: (_, record) => (
        <Tag color={record.isOnline ? 'green' : 'default'}>
          {record.isOnline ? '在线' : '离线'}
        </Tag>
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
              title="待审核"
              value={reviewsData.filter(item => item.status === 'pending').length}
              prefix={<ClockCircleOutlined />}
              valueStyle={{ color: '#faad14' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card size="small">
            <Statistic
              title="审核中"
              value={reviewsData.filter(item => item.status === 'reviewing').length}
              prefix={<AuditOutlined />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card size="small">
            <Statistic
              title="已完成"
              value={reviewsData.filter(item => ['approved', 'completed'].includes(item.status)).length}
              prefix={<CheckCircleOutlined />}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card size="small">
            <Statistic
              title="平均评分"
              value={85.2}
              precision={1}
              prefix={<StarOutlined />}
              suffix="分"
              valueStyle={{ color: '#722ed1' }}
            />
          </Card>
        </Col>
      </Row>

      {/* 主要内容 */}
      <Card size="small">
        <Tabs activeKey={activeTab} onChange={setActiveTab}>
          <TabPane tab="审核管理" key="reviews">
            {/* 搜索和筛选 */}
            <Row gutter={16} style={{ marginBottom: 16 }}>
              <Col span={6}>
                <Search
                  placeholder="搜索报告名称、项目或提交人"
                  value={searchText}
                  onChange={(e) => setSearchText(e.target.value)}
                  onSearch={loadReviewsData}
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
                  <Option value="pending">待分配</Option>
                  <Option value="reviewing">审核中</Option>
                  <Option value="approved">已通过</Option>
                  <Option value="rejected">已拒绝</Option>
                  <Option value="revision_required">需修订</Option>
                  <Option value="completed">已完成</Option>
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
                  <Option value="urgent">紧急</Option>
                  <Option value="high">高</Option>
                  <Option value="medium">中</Option>
                  <Option value="low">低</Option>
                </Select>
              </Col>
              <Col span={3}>
                <Select
                  placeholder="审核类型"
                  value={typeFilter}
                  onChange={setTypeFilter}
                  allowClear
                  style={{ width: '100%' }}
                >
                  <Option value="content">内容审核</Option>
                  <Option value="quality">质量审核</Option>
                  <Option value="technical">技术审核</Option>
                  <Option value="clinical">临床审核</Option>
                  <Option value="final">最终审核</Option>
                </Select>
              </Col>
              <Col span={3}>
                <Select
                  placeholder="审核员"
                  value={assigneeFilter}
                  onChange={setAssigneeFilter}
                  allowClear
                  style={{ width: '100%' }}
                >
                  {reviewersData.map(reviewer => (
                    <Option key={reviewer.id} value={reviewer.name}>
                      {reviewer.name}
                    </Option>
                  ))}
                </Select>
              </Col>
              <Col span={3}>
                <Button onClick={loadReviewsData} loading={loading}>
                  刷新
                </Button>
              </Col>
            </Row>

            {/* 审核列表 */}
            <Table
              columns={reviewColumns}
              dataSource={filteredReviewsData}
              rowKey="id"
              loading={loading}
              scroll={{ x: 1400 }}
              pagination={{
                total: filteredReviewsData.length,
                pageSize: 10,
                showSizeChanger: true,
                showQuickJumper: true,
                showTotal: (total) => `共 ${total} 条记录`
              }}
            />
          </TabPane>

          <TabPane tab="审核员管理" key="reviewers">
            <Table
              columns={reviewerColumns}
              dataSource={reviewersData}
              rowKey="id"
              pagination={{
                total: reviewersData.length,
                pageSize: 10,
                showSizeChanger: true,
                showQuickJumper: true,
                showTotal: (total) => `共 ${total} 条记录`
              }}
            />
          </TabPane>
        </Tabs>
      </Card>

      {/* 分配审核员模态框 */}
      <Modal
        title="分配审核员"
        open={assignModalVisible}
        onCancel={() => setAssignModalVisible(false)}
        onOk={() => form.submit()}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmitAssign}
        >
          <Form.Item
            name="assignedTo"
            label="选择审核员"
            rules={[{ required: true, message: '请选择审核员' }]}
          >
            <Select placeholder="请选择审核员">
              {reviewersData.map(reviewer => (
                <Option key={reviewer.id} value={reviewer.name}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <div>{reviewer.name}</div>
                      <div style={{ fontSize: 12, color: '#666' }}>
                        {reviewer.role} | 工作负载: {reviewer.workload}%
                      </div>
                    </div>
                    <Rate disabled value={reviewer.rating} style={{ fontSize: 12 }} />
                  </div>
                </Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item
            name="deadline"
            label="截止时间"
          >
            <DatePicker showTime style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item
            name="note"
            label="备注"
          >
            <TextArea rows={3} placeholder="请输入分配备注" />
          </Form.Item>
        </Form>
      </Modal>

      {/* 审核结果模态框 */}
      <Modal
        title="提交审核结果"
        open={reviewModalVisible}
        onCancel={() => setReviewModalVisible(false)}
        onOk={() => reviewForm.submit()}
        width={600}
      >
        <Form
          form={reviewForm}
          layout="vertical"
          onFinish={handleSubmitReview}
        >
          <Form.Item
            name="result"
            label="审核结果"
            rules={[{ required: true, message: '请选择审核结果' }]}
          >
            <Radio.Group>
              <Radio value="approved">通过</Radio>
              <Radio value="revision_required">需要修订</Radio>
              <Radio value="rejected">拒绝</Radio>
            </Radio.Group>
          </Form.Item>
          <Form.Item
            name="score"
            label="评分"
            rules={[{ required: true, message: '请给出评分' }]}
          >
            <Slider
              min={0}
              max={100}
              marks={{
                0: '0',
                60: '60',
                80: '80',
                100: '100'
              }}
            />
          </Form.Item>
          <Form.Item
            name="summary"
            label="审核总结"
            rules={[{ required: true, message: '请输入审核总结' }]}
          >
            <TextArea rows={4} placeholder="请输入审核总结" />
          </Form.Item>
          <Form.Item
            name="suggestions"
            label="改进建议"
          >
            <TextArea rows={3} placeholder="请输入改进建议" />
          </Form.Item>
        </Form>
      </Modal>

      {/* 添加问题模态框 */}
      <Modal
        title="添加问题"
        open={issueModalVisible}
        onCancel={() => setIssueModalVisible(false)}
        onOk={() => issueForm.submit()}
      >
        <Form
          form={issueForm}
          layout="vertical"
          onFinish={handleSubmitIssue}
        >
          <Form.Item
            name="type"
            label="问题类型"
            rules={[{ required: true, message: '请选择问题类型' }]}
          >
            <Radio.Group>
              <Radio value="error">错误</Radio>
              <Radio value="warning">警告</Radio>
              <Radio value="suggestion">建议</Radio>
            </Radio.Group>
          </Form.Item>
          <Form.Item
            name="severity"
            label="严重程度"
            rules={[{ required: true, message: '请选择严重程度' }]}
          >
            <Select placeholder="请选择严重程度">
              <Option value="critical">严重</Option>
              <Option value="high">高</Option>
              <Option value="medium">中</Option>
              <Option value="low">低</Option>
            </Select>
          </Form.Item>
          <Form.Item
            name="category"
            label="问题分类"
            rules={[{ required: true, message: '请输入问题分类' }]}
          >
            <Input placeholder="如：数据质量、格式错误、内容缺失等" />
          </Form.Item>
          <Form.Item
            name="title"
            label="问题标题"
            rules={[{ required: true, message: '请输入问题标题' }]}
          >
            <Input placeholder="请输入问题标题" />
          </Form.Item>
          <Form.Item
            name="description"
            label="问题描述"
            rules={[{ required: true, message: '请输入问题描述' }]}
          >
            <TextArea rows={4} placeholder="请详细描述问题" />
          </Form.Item>
          <Form.Item
            name="location"
            label="问题位置"
          >
            <Input placeholder="如：第3章第2节、表格5等" />
          </Form.Item>
        </Form>
      </Modal>

      {/* 添加评论模态框 */}
      <Modal
        title="添加评论"
        open={commentModalVisible}
        onCancel={() => setCommentModalVisible(false)}
        onOk={() => commentForm.submit()}
      >
        <Form
          form={commentForm}
          layout="vertical"
          onFinish={handleSubmitComment}
        >
          <Form.Item
            name="type"
            label="评论类型"
            rules={[{ required: true, message: '请选择评论类型' }]}
          >
            <Radio.Group>
              <Radio value="general">一般评论</Radio>
              <Radio value="issue">问题反馈</Radio>
              <Radio value="suggestion">改进建议</Radio>
              <Radio value="approval">审批意见</Radio>
            </Radio.Group>
          </Form.Item>
          <Form.Item
            name="content"
            label="评论内容"
            rules={[{ required: true, message: '请输入评论内容' }]}
          >
            <TextArea rows={5} placeholder="请输入评论内容" />
          </Form.Item>
        </Form>
      </Modal>

      {/* 详情抽屉 */}
      <Drawer
        title="审核详情"
        placement="right"
        onClose={() => setDetailDrawerVisible(false)}
        open={detailDrawerVisible}
        width={800}
      >
        {selectedReview && (
          <div>
            <Descriptions title="基本信息" bordered size="small" column={2}>
              <Descriptions.Item label="报告名称" span={2}>
                {selectedReview.reportName}
              </Descriptions.Item>
              <Descriptions.Item label="项目名称">
                {selectedReview.projectName}
              </Descriptions.Item>
              <Descriptions.Item label="客户名称">
                {selectedReview.clientName || '-'}
              </Descriptions.Item>
              <Descriptions.Item label="审核类型">
                <Tag color="blue">{getReviewTypeText(selectedReview.reviewType)}</Tag>
              </Descriptions.Item>
              <Descriptions.Item label="优先级">
                <Tag color={getPriorityColor(selectedReview.priority)}>
                  {getPriorityText(selectedReview.priority)}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="当前状态">
                <Tag color={getStatusColor(selectedReview.status)}>
                  {getStatusText(selectedReview.status)}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="审核员">
                {selectedReview.assignedTo || '未分配'}
              </Descriptions.Item>
              <Descriptions.Item label="提交人">
                {selectedReview.submittedBy}
              </Descriptions.Item>
              <Descriptions.Item label="提交时间">
                {selectedReview.submittedTime}
              </Descriptions.Item>
              <Descriptions.Item label="截止时间">
                {selectedReview.deadline}
              </Descriptions.Item>
              <Descriptions.Item label="预计时间">
                {selectedReview.estimatedTime}小时
              </Descriptions.Item>
              <Descriptions.Item label="实际时间">
                {selectedReview.actualTime ? `${selectedReview.actualTime}小时` : '-'}
              </Descriptions.Item>
              <Descriptions.Item label="评分">
                {selectedReview.score ? `${selectedReview.score}分` : '-'}
              </Descriptions.Item>
            </Descriptions>

            <Divider />

            <div style={{ marginBottom: 16 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                <Title level={5}>问题列表 ({selectedReview.issues.length})</Title>
                <Button size="small" icon={<PlusOutlined />} onClick={handleAddIssue}>
                  添加问题
                </Button>
              </div>
              {selectedReview.issues.length > 0 ? (
                <List
                  size="small"
                  dataSource={selectedReview.issues}
                  renderItem={issue => (
                    <List.Item>
                      <List.Item.Meta
                        avatar={getIssueTypeIcon(issue.type)}
                        title={
                          <div>
                            <Tag color={issue.severity === 'critical' ? 'red' : issue.severity === 'high' ? 'orange' : 'blue'}>
                              {issue.severity}
                            </Tag>
                            {issue.title}
                          </div>
                        }
                        description={
                          <div>
                            <div>{issue.description}</div>
                            <div style={{ fontSize: 12, color: '#999', marginTop: 4 }}>
                              位置: {issue.location} | 创建者: {issue.createdBy} | 时间: {issue.createdTime}
                            </div>
                          </div>
                        }
                      />
                    </List.Item>
                  )}
                />
              ) : (
                <Empty description="暂无问题" />
              )}
            </div>

            <Divider />

            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                <Title level={5}>评论记录 ({selectedReview.comments.length})</Title>
                <Button size="small" icon={<MessageOutlined />} onClick={handleAddComment}>
                  添加评论
                </Button>
              </div>
              {selectedReview.comments.length > 0 ? (
                <List
                  size="small"
                  dataSource={selectedReview.comments}
                  renderItem={comment => (
                    <List.Item>
                      <List.Item.Meta
                        avatar={<Avatar icon={<UserOutlined />} />}
                        title={comment.author}
                        description={
                          <div>
                            <div>{comment.content}</div>
                            <div style={{ color: '#999', fontSize: '12px', marginTop: '4px' }}>
                              {comment.createdTime}
                            </div>
                          </div>
                        }
                      />
                    </List.Item>
                  )}
                />
              ) : (
                <Empty description="暂无评论" />
              )}
            </div>
          </div>
        )}
      </Drawer>

      {/* 历史记录抽屉 */}
      <Drawer
        title="审核历史"
        placement="right"
        onClose={() => setHistoryDrawerVisible(false)}
        open={historyDrawerVisible}
        width={600}
      >
        {selectedReview && (
          <Timeline>
            <Timeline.Item color="green" dot={<CheckCircleOutlined />}>
              <div>
                <div style={{ fontWeight: 'bold' }}>报告提交</div>
                <div style={{ color: '#666' }}>
                  {selectedReview.submittedBy} 提交了报告
                </div>
                <div style={{ fontSize: 12, color: '#999' }}>
                  {selectedReview.submittedTime}
                </div>
              </div>
            </Timeline.Item>
            
            {selectedReview.assignedTime && (
              <Timeline.Item color="blue" dot={<UserOutlined />}>
                <div>
                  <div style={{ fontWeight: 'bold' }}>分配审核员</div>
                  <div style={{ color: '#666' }}>
                    分配给 {selectedReview.assignedTo}
                  </div>
                  <div style={{ fontSize: 12, color: '#999' }}>
                    {selectedReview.assignedTime}
                  </div>
                </div>
              </Timeline.Item>
            )}
            
            {selectedReview.reviewStartTime && (
              <Timeline.Item color="orange" dot={<PlayCircleOutlined />}>
                <div>
                  <div style={{ fontWeight: 'bold' }}>开始审核</div>
                  <div style={{ color: '#666' }}>
                    {selectedReview.assignedTo} 开始审核
                  </div>
                  <div style={{ fontSize: 12, color: '#999' }}>
                    {selectedReview.reviewStartTime}
                  </div>
                </div>
              </Timeline.Item>
            )}
            
            {selectedReview.reviewEndTime && (
              <Timeline.Item 
                color={selectedReview.status === 'approved' ? 'green' : selectedReview.status === 'rejected' ? 'red' : 'orange'}
                dot={selectedReview.status === 'approved' ? <CheckCircleOutlined /> : 
                     selectedReview.status === 'rejected' ? <CloseOutlined /> : <WarningOutlined />}
              >
                <div>
                  <div style={{ fontWeight: 'bold' }}>审核完成</div>
                  <div style={{ color: '#666' }}>
                    结果: {getStatusText(selectedReview.status)}
                    {selectedReview.score && ` | 评分: ${selectedReview.score}分`}
                  </div>
                  <div style={{ fontSize: 12, color: '#999' }}>
                    {selectedReview.reviewEndTime}
                  </div>
                </div>
              </Timeline.Item>
            )}
          </Timeline>
        )}
      </Drawer>
    </div>
  )
}

export default ReportReview