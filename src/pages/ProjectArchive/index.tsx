import React, { useState, useEffect, useMemo } from 'react'
import { 
  Card, 
  Table, 
  Button, 
  Space, 
  Input, 
  Select, 
  message, 
  Tag, 
  Popconfirm,
  Typography,
  DatePicker,
  Row,
  Col,
  Badge,
  Tabs
} from 'antd'
import { 
  PlusOutlined, 
  ExportOutlined,
  UnorderedListOutlined,
  FileTextOutlined,
  ExperimentOutlined,
  MedicineBoxOutlined
} from '@ant-design/icons'
import { useNavigate } from 'react-router-dom'
import { useAppStore } from '../../store'
import { 
  ProjectArchive, 
  ProjectArchiveStatus, 
  ProjectStageType, 
  AuditStatus, 
  ExecuteStatus,
  ProjectType 
} from '../../types'
import { ColumnsType } from 'antd/es/table'
import dayjs from 'dayjs'
import './ProjectArchiveList.css'

const { Title, Text } = Typography
const { RangePicker } = DatePicker
const { Search } = Input

/**
 * 项目类型配置
 */
const PROJECT_TYPES = [
  {
    key: 'all',
    label: '全部项目',
    icon: <UnorderedListOutlined />,
    color: '#1890ff',
    count: 0
  },
  {
    key: ProjectType.PRODUCT_REGISTRATION,
    label: '产品注册',
    icon: <FileTextOutlined />,
    color: '#722ed1',
    count: 0
  },
  {
    key: ProjectType.RESEARCH_SERVICE,
    label: '科研服务',
    icon: <ExperimentOutlined />,
    color: '#52c41a',
    count: 0
  },
  {
    key: ProjectType.CLINICAL_DETECTION,
    label: '临床检测',
    icon: <MedicineBoxOutlined />,
    color: '#fa8c16',
    count: 0
  }
]

/**
 * 项目状态配置
 */
const PROJECT_STATUS_FILTERS = [
  { key: 'all', label: '全部', count: 0 },
  { key: 'not_started', label: '未开始', count: 0 },
  { key: 'in_progress', label: '进行中', count: 0 },
  { key: 'completed', label: '已完成', count: 0 }
]

/**
 * 将具体的项目状态映射到简化的状态分组
 */
const getStatusGroup = (status: ProjectArchiveStatus): string => {
  switch (status) {
    case ProjectArchiveStatus.DRAFT:
    case ProjectArchiveStatus.PENDING:
      return 'not_started'
    case ProjectArchiveStatus.APPROVED:
    case ProjectArchiveStatus.EXECUTING:
      return 'in_progress'
    case ProjectArchiveStatus.COMPLETED:
    case ProjectArchiveStatus.TERMINATED:
      return 'completed'
    default:
      return 'not_started'
  }
}

/**
 * 项目档案管理页面组件
 * 提供项目档案信息的增删改查功能，支持列表和看板两种视图
 */
const ProjectArchiveManagement: React.FC = () => {
  const { setBreadcrumbs } = useAppStore()
  const navigate = useNavigate()
  
  // 数据状态
  const [projectArchives, setProjectArchives] = useState<ProjectArchive[]>([])
  const [loading, setLoading] = useState(false)
  
  // 筛选状态
  const [selectedProjectType, setSelectedProjectType] = useState('all')
  // 状态筛选键类型：与 Tabs 的四个标签对应
  const [selectedStatus, setSelectedStatus] = useState<'all' | 'not_started' | 'in_progress' | 'completed'>('all')
  /** 基础筛选：负责人与时间范围 */
  const [selectedManager, setSelectedManager] = useState<string | 'all'>('all')
  const [dateRange, setDateRange] = useState<[dayjs.Dayjs, dayjs.Dayjs] | null>(null)
  /** 关键字搜索：项目名称或项目编码 */
  const [keyword, setKeyword] = useState<string>('')
  
  // 已移除看板与弹窗编辑逻辑，仅保留列表视图

  useEffect(() => {
    setBreadcrumbs([
      { title: '首页' }, 
      { title: '项目档案' }, 
      { title: '项目档案' }
    ])
    loadProjectArchives()
  }, []) // 移除setBreadcrumbs依赖，避免不必要的重新渲染

  /**
   * 加载项目档案列表
   */
  const loadProjectArchives = async () => {
    setLoading(true)
    try {
      // 模拟数据
      const mockData: ProjectArchive[] = [
        {
          id: '1',
          manageOrgNo: 'ORG001',
          projectCode: 'PRJ001',
          projectName: '基因检测项目A',
          projectType: ProjectType.PRODUCT_REGISTRATION,
          projectStageType: ProjectStageType.RESEARCH_VALIDATION,
          customerCode: 'CUST001',
          contractNo: 'CONTRACT001',
          deptNo: 'DEPT001',
          projectManager: '张三',
          planStartTime: '2024-01-01',
          planEndTime: '2024-12-31',
          auditStatus: AuditStatus.APPROVED,
          projectStatus: ProjectArchiveStatus.EXECUTING,
          executeStatus: ExecuteStatus.EXECUTING,
          sampleCharacteristics: {
            sampleName: '血液样本',
            sampleType: '全血',
            sampleSource: '临床',
            samplePlanNum: 100
          },
          detectionRequirements: [],
          validationStandards: [],
          participatingOrganizations: [],
          attachmentFiles: [],
          createdAt: '2024-01-01',
          updatedAt: '2024-01-01'
        },
        {
          id: '2',
          manageOrgNo: 'ORG002',
          projectCode: 'PRJ002',
          projectName: '肿瘤标志物检测',
          projectType: ProjectType.RESEARCH_SERVICE,
          projectStageType: ProjectStageType.CLINICAL_VALIDATION,
          customerCode: 'CUST002',
          contractNo: 'CONTRACT002',
          deptNo: 'DEPT002',
          projectManager: '李四',
          planStartTime: '2024-02-01',
          planEndTime: '2024-11-30',
          auditStatus: AuditStatus.PENDING,
          projectStatus: ProjectArchiveStatus.PENDING,
          executeStatus: ExecuteStatus.PENDING,
          sampleCharacteristics: {
            sampleName: '组织样本',
            sampleType: '石蜡切片',
            sampleSource: '病理科',
            samplePlanNum: 50
          },
          detectionRequirements: [],
          validationStandards: [],
          participatingOrganizations: [],
          attachmentFiles: [],
          createdAt: '2024-02-01',
          updatedAt: '2024-02-01'
        },
        {
          id: '3',
          manageOrgNo: 'ORG003',
          projectCode: 'PRJ003',
          projectName: '病原体检测平台',
          projectType: ProjectType.CLINICAL_DETECTION,
          projectStageType: ProjectStageType.PRODUCTION_VALIDATION,
          customerCode: 'CUST003',
          contractNo: 'CONTRACT003',
          deptNo: 'DEPT003',
          projectManager: '王五',
          planStartTime: '2024-03-01',
          planEndTime: '2024-10-31',
          auditStatus: AuditStatus.APPROVED,
          projectStatus: ProjectArchiveStatus.COMPLETED,
          executeStatus: ExecuteStatus.COMPLETED,
          sampleCharacteristics: {
            sampleName: '咽拭子',
            sampleType: '拭子',
            sampleSource: '门诊',
            samplePlanNum: 200
          },
          detectionRequirements: [],
          validationStandards: [],
          participatingOrganizations: [],
          attachmentFiles: [],
          createdAt: '2024-03-01',
          updatedAt: '2024-03-01'
        }
      ]
      
      console.log('模拟数据:', mockData)
      setProjectArchives(mockData)
      console.log('设置项目档案数据完成，数据长度:', mockData.length)
    } catch (error) {
      console.error('加载项目档案列表失败:', error)
      message.error('加载项目档案列表失败')
    } finally {
      setLoading(false)
    }
  }

  /**
   * 处理新增项目档案
   */
  const handleAdd = () => {
    navigate('/project-archive/create')
  }

  /**
   * 处理查看项目档案
   */
  const handleView = (record: ProjectArchive) => {
    // 查看跳转到“新增页面”界面，并以只读模式展示
    // 入参：record 项目档案记录
    // 出参：无（页面跳转）
    navigate(`/project-archive/create?id=${record.id}&mode=view`)
  }

  /**
   * 处理编辑项目档案
   */
  const handleEdit = (record: ProjectArchive) => {
    // 改为跳转到“新增页面”界面样式，并进入编辑模式
    // 入参：record 当前行项目
    // 出参：无（页面跳转）
    navigate(`/project-archive/create?id=${record.id}&mode=edit`)
  }

  /**
   * 处理删除项目档案
   */
  const handleDelete = async (id: string) => {
    try {
      message.success('删除成功')
      loadProjectArchives()
    } catch (error) {
      message.error('删除失败')
    }
  }

  /**
   * 处理导出
   */
  const handleExport = () => {
    message.info('导出功能开发中...')
  }

  // 已移除弹窗提交逻辑

  /**
   * 获取项目状态标签
   */
  const getStatusTag = (status: ProjectArchiveStatus) => {
    const statusConfig = {
      [ProjectArchiveStatus.DRAFT]: { color: 'default', text: '草稿' },
      [ProjectArchiveStatus.PENDING]: { color: 'processing', text: '待审核' },
      [ProjectArchiveStatus.APPROVED]: { color: 'success', text: '审核通过' },
      [ProjectArchiveStatus.REJECTED]: { color: 'error', text: '审核拒绝' },
      [ProjectArchiveStatus.EXECUTING]: { color: 'processing', text: '执行中' },
      [ProjectArchiveStatus.COMPLETED]: { color: 'success', text: '已完成' },
      [ProjectArchiveStatus.TERMINATED]: { color: 'default', text: '已终止' }
    }
    
    const config = statusConfig[status]
    return <Tag color={config.color}>{config.text}</Tag>
  }

  /**
   * 获取项目类型图标和颜色
   */
  const getProjectTypeConfig = (type: string) => {
    const typeConfig: Record<string, { icon: React.ReactNode; color: string }> = {
      [ProjectType.PRODUCT_REGISTRATION]: { icon: <FileTextOutlined />, color: '#722ed1' },
      [ProjectType.RESEARCH_SERVICE]: { icon: <ExperimentOutlined />, color: '#52c41a' },
      [ProjectType.CLINICAL_DETECTION]: { icon: <MedicineBoxOutlined />, color: '#fa8c16' }
    }
    return typeConfig[type] || { icon: <FileTextOutlined />, color: '#1890ff' }
  }

  // 看板相关进度计算已移除

  /**
   * 处理搜索按钮点击 - 只控制搜索条件面板的显示/隐藏
   */
  /**
   * 显示的项目数据 - 根据状态筛选
   */
  /**
   * 显示的项目数据 - 组合筛选（类型、状态、负责人、时间范围）
   * 入参：projectArchives 原始数据；筛选状态：selectedProjectType/selectedStatus/selectedManager/dateRange
   * 出参：displayedProjects 过滤后的数组
   */
  const displayedProjects = projectArchives.filter(project => {
    // 项目类型（左侧或顶部选择）
    if (selectedProjectType !== 'all' && project.projectType !== selectedProjectType) {
      return false
    }
    // 项目状态（顶部按钮）
    if (selectedStatus !== 'all' && getStatusGroup(project.projectStatus) !== selectedStatus) {
      return false
    }
    // 负责人筛选
    if (selectedManager !== 'all' && project.projectManager !== selectedManager) {
      return false
    }
    // 关键词（项目名称或项目编码）
    if (keyword && !(`${project.projectName}`.includes(keyword) || `${project.projectCode}`.includes(keyword))) {
      return false
    }
    // 时间范围（计划开始时间）
    if (dateRange) {
      const start = dayjs(project.planStartTime)
      const [begin, end] = dateRange
      // 不使用 isBetween 插件，改为边界内判断（含端点）
      if (start.isBefore(begin, 'day') || start.isAfter(end, 'day')) return false
    }
    return true
  })

  /**
   * 获取项目类型标签
   */
  const getProjectTypeLabel = (key: string) => {
    const labelMap: Record<string, string> = {
      [ProjectType.PRODUCT_REGISTRATION]: '产品注册',
      [ProjectType.RESEARCH_SERVICE]: '科研服务',
      [ProjectType.CLINICAL_DETECTION]: '临床检测'
    }
    return labelMap[key] || key
  }

  /** 方法：重置基础筛选条件
   * 入参：无
   * 出参：无（直接重置状态）
   */
  const handleResetFilters = () => {
    setSelectedProjectType('all')
    setSelectedManager('all')
    setDateRange(null)
  }

  /**
   * 表格列定义
   */
  /**
   * 列表页表格列配置优化
   * 变更点：
   * - 固定列：左侧固定“项目名称”，右侧固定“操作”
   * - 移除“进度”列（去除不必要视觉负担）
   * - 去掉“项目负责人”、“计划开始时间”、“计划完成时间”的前置小图标
   * - 保留/新增“项目状态”列展示当前状态
   * 输入：无（常量列配置）
   * 输出：返回给 Table 使用的列配置
   */
  const columns: ColumnsType<ProjectArchive> = [
    {
      title: '项目名称',
      dataIndex: 'projectName',
      key: 'projectName',
      width: 150,
      fixed: 'left',
      /** 渲染：仅显示项目名称
       * 入参：text 项目名称
       * 出参：JSX 元素（加粗显示）
       */
      render: (text) => (
        <span style={{ fontWeight: 500 }}>{text}</span>
      )
    },
    {
      title: '项目编码',
      dataIndex: 'projectCode',
      key: 'projectCode',
      width: 120
    },
    {
      title: '项目类型',
      dataIndex: 'projectType',
      key: 'projectType',
      width: 90,
      sorter: (a, b) => String(a.projectType).localeCompare(String(b.projectType)),
      render: (text) => {
        const config = getProjectTypeConfig(text)
        const label = getProjectTypeLabel(text)
        return (
          <Tag icon={config.icon} color={config.color}>
            {label}
          </Tag>
        )
      }
    },
    {
      title: '项目负责人',
      dataIndex: 'projectManager',
      key: 'projectManager',
      width: 100,
      sorter: (a, b) => String(a.projectManager).localeCompare(String(b.projectManager)),
      render: (text) => (
        <span>{text}</span>
      )
    },
    {
      title: '项目状态',
      dataIndex: 'projectStatus',
      key: 'projectStatus',
      width: 80,
      sorter: (a, b) => String(a.projectStatus).localeCompare(String(b.projectStatus)),
      render: (status) => getStatusTag(status)
    },
    // 进度列：已移除
    {
      title: '计划开始时间',
      dataIndex: 'planStartTime',
      key: 'planStartTime',
      width: 110,
      sorter: (a, b) => dayjs(a.planStartTime).valueOf() - dayjs(b.planStartTime).valueOf(),
      defaultSortOrder: 'descend',
      render: (text) => (
        <span style={{ fontSize: '12px' }}>{text}</span>
      )
    },
    {
      title: '计划完成时间',
      dataIndex: 'planEndTime',
      key: 'planEndTime',
      width: 110,
      sorter: (a, b) => dayjs(a.planEndTime).valueOf() - dayjs(b.planEndTime).valueOf(),
      render: (text) => (
        <span style={{ fontSize: '12px' }}>{text}</span>
      )
    },
    {
      title: '操作',
      key: 'action',
      width: 120,
      fixed: 'right',
      /** 渲染：按钮悬浮显示
       * 入参：record 当前行数据
       * 出参：JSX 元素（默认隐藏，行悬浮显示）
       */
      render: (_, record) => (
        <div className="row-action-buttons">
          <Space size="small">
            <Button 
              type="link" 
              size="small" 
              onClick={() => handleView(record)}
              style={{ color: '#1890ff', padding: '0 4px' }}
            >
              查看
            </Button>
            <Button 
              type="link" 
              size="small" 
              onClick={() => handleEdit(record)}
              style={{ color: '#1890ff', padding: '0 4px' }}
            >
              编辑
            </Button>
            <Popconfirm
              title="确定要删除这个项目档案吗？"
              onConfirm={() => handleDelete(record.id)}
              okText="确定"
              cancelText="取消"
            >
              <Button 
                type="link" 
                size="small" 
                danger 
                style={{ color: '#ff4d4f', padding: '0 4px' }}
              >
                删除
              </Button>
            </Popconfirm>
          </Space>
        </div>
      )
    }
  ]

  /**
   * 计算实际显示的表格列（应用列设置偏好）
   * 入参：无（依赖 columns 与 columnPrefs）
   * 出参：结合可见性与宽度后的列数组
   */
  // 移除列设置列派生逻辑

  /**
   * 将项目数据按状态分组，用于看板视图
   * 入参：displayedProjects 已过滤的项目数组
   * 出参：按 not_started/in_progress/completed 三类分组的对象
   */
  // 看板分组逻辑已移除

  /**
   * 项目负责人选项（去重）
   * 入参：projectArchives 原始数据
   * 出参：唯一的负责人名称数组
   */
  const managerOptions = useMemo(() => {
    const set = new Set<string>()
    projectArchives.forEach(p => { if (p.projectManager) set.add(String(p.projectManager)) })
    return Array.from(set)
  }, [projectArchives])

  /**
   * 刷新项目数据
   * 入参：无
   * 出参：重新加载项目档案列表
   */
  const handleRefresh = () => {
    loadProjectArchives()
  }

  // 已移除看板视图，保留列表视图

  return (
    <>
      <div className="project-archive-container">
        <Row gutter={4}>
          {/** 列间距：将项目类型与项目档案之间的距离调整为 4px */}
          {/* 左侧：项目类型选择 */}
          <Col span={5}>
            <Card>
              <div className="project-types-card">
                <div className="project-types-header">
                  <Title level={4} style={{ margin: 0 }}>项目类型</Title>
                </div>
                <div className="project-types-content">
                  {PROJECT_TYPES.map(type => {
                    const count = type.key === 'all' 
                      ? projectArchives.length 
                      : projectArchives.filter(p => p.projectType === type.key).length
                    
                    return (
                      <div
                        key={type.key}
                        className={`project-type-item ${selectedProjectType === type.key ? 'active' : ''}`}
                        onClick={() => setSelectedProjectType(type.key)}
                      >
                        <div className="project-type-icon" style={{ color: type.color }}>
                          {type.icon}
                        </div>
                        <div className="project-type-content">
                          <div className="project-type-label">{type.label}</div>
                          <div className="project-type-count">({count})</div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            </Card>
          </Col>
          
         {/* 右侧：项目档案内容（恢复为原始单卡布局） */}
         <Col span={19} className="project-archive-content-card">
           <Card>
             <div className="project-archive-content">
               {/* 头部区域：标题与操作按钮 */}
               <div className="content-header">
                 <div className="header-left">
                   <Title level={4} style={{ margin: 0 }}>项目档案</Title>
                 </div>
                  <div className="header-right">
                    {/* 视图切换按钮已移除，列表页操作集中到下方工具栏 */}
                  </div>
                </div>

               {/* 工具栏区域：直接使用 Ant Tabs，与 DNA 提取结构一致 */}
               <div className="toolbar-container">
                 <Tabs
                   activeKey={selectedStatus}
                   onChange={(key: string) => setSelectedStatus(key as 'all' | 'not_started' | 'in_progress' | 'completed')}
                   tabBarExtraContent={
                     <Space>
                       <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>新增项目</Button>
                       <Button icon={<ExportOutlined />} onClick={handleExport}>导出</Button>
                     </Space>
                   }
                   items={[
                     {
                       key: 'all',
                       label: (
                         <span>
                           全部 <Badge count={displayedProjects.length} showZero />
                         </span>
                       )
                     },
                     {
                       key: 'not_started',
                       label: (
                         <span>
                           未开始 <Badge count={displayedProjects.filter(p => getStatusGroup(p.projectStatus) === 'not_started').length} showZero />
                         </span>
                       )
                     },
                     {
                       key: 'in_progress',
                       label: (
                         <span>
                           进行中 <Badge count={displayedProjects.filter(p => getStatusGroup(p.projectStatus) === 'in_progress').length} showZero />
                         </span>
                       )
                     },
                     {
                       key: 'completed',
                       label: (
                         <span>
                           已完成 <Badge count={displayedProjects.filter(p => getStatusGroup(p.projectStatus) === 'completed').length} showZero />
                         </span>
                       )
                     }
                   ]}
                 />
               </div>

               {/* 列表视图 */}
               <div className="table-container">
                <Table
                  /**
                   * 表格配置（与 DNA 提取页面保持一致）
                   * 入参：columns 列配置；displayedProjects 数据源；loading 加载状态
                   * 出参：Antd Table 组件渲染，统一滚动与分页样式
                   */
                  columns={columns}
                  dataSource={displayedProjects}
                  rowKey="id"
                  loading={loading}
                  bordered
                  size="small"
                  scroll={{ x: 1500 }}
                  pagination={{
                    total: displayedProjects.length,
                    pageSize: 10,
                    showSizeChanger: true,
                    showQuickJumper: true,
                    showTotal: (total, range) => `第 ${range[0]}-${range[1]} 条/共 ${total} 条`
                  }}
                />
              </div>
             </div>
           </Card>
         </Col>
        </Row>
      </div>

      {/* 编辑弹窗已移除：编辑与查看均跳转至新增页（view/edit 模式） */}
    </>
  )
}

export default ProjectArchiveManagement