import React, { useState, useEffect } from 'react'
import {
  Card,
  Form,
  Input,
  Select,
  DatePicker,
  Button,
  Space,
  Row,
  Col,
  Table,
  Tag,
  Upload,
  Progress,
  Timeline,
  Divider,
  InputNumber,
  Checkbox,
  message,
  Modal,
  Typography,
  Tabs,
  List,
  Avatar,
  Popconfirm
} from 'antd'
import {
  SaveOutlined,
  EditOutlined,
  DeleteOutlined,
  PlusOutlined,
  UploadOutlined,
  DownloadOutlined,
  FileTextOutlined,
  TeamOutlined,
  SettingOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  ExclamationCircleOutlined
} from '@ant-design/icons'
import { useAppStore } from '../../store'
import {
  ProjectArchive,
  ProjectArchiveStatus,
  ProjectStageType,
  AuditStatus,
  ExecuteStatus,
  DetectionRequirement,
  ValidationStandard,
  ParticipatingOrganization,
  AttachmentFile,
  AnalysisType,
  ComparisonOperator
} from '../../types'
import { ColumnsType } from 'antd/es/table'
import dayjs from 'dayjs'
import './ProjectArchiveDetail.css'

const { Title, Text } = Typography
const { Option } = Select
const { TextArea } = Input
const { TabPane } = Tabs

/**
 * 项目档案详情页面组件
 * 基于文档布局实现左侧导航和右侧内容区的设计
 */
const ProjectArchiveDetail: React.FC = () => {
  const { setBreadcrumbs } = useAppStore()
  const [form] = Form.useForm()
  const [loading, setLoading] = useState(false)
  const [activeSection, setActiveSection] = useState('basic')
  const [projectData, setProjectData] = useState<ProjectArchive | null>(null)
  const [isEditing, setIsEditing] = useState(false)

  // 检测要求相关状态
  const [detectionModalVisible, setDetectionModalVisible] = useState(false)
  const [editingDetection, setEditingDetection] = useState<DetectionRequirement | null>(null)
  const [detectionForm] = Form.useForm()

  // 验证标准相关状态
  const [validationModalVisible, setValidationModalVisible] = useState(false)
  const [editingValidation, setEditingValidation] = useState<ValidationStandard | null>(null)
  const [validationForm] = Form.useForm()

  // 参与机构相关状态
  const [organizationModalVisible, setOrganizationModalVisible] = useState(false)
  const [editingOrganization, setEditingOrganization] = useState<ParticipatingOrganization | null>(null)
  const [organizationForm] = Form.useForm()

  useEffect(() => {
    setBreadcrumbs([
      { title: '首页' },
      { title: '项目档案' },
      { title: '项目档案详情' }
    ])
    loadProjectData()
  }, [setBreadcrumbs])

  /**
   * 加载项目数据
   */
  const loadProjectData = async () => {
    setLoading(true)
    try {
      // TODO: 调用API获取项目详情
      // const response = await api.getProjectArchive(id)
      // setProjectData(response.data)

      // 模拟数据
      const mockData: ProjectArchive = {
        id: '1',
        manageOrgNo: 'ORG001',
        projectCode: 'PROJ_20240520_001',
        projectName: 'EGFR检测验证项目',
        projectType: '研发验证项目',
        projectStageType: ProjectStageType.RESEARCH_VALIDATION,
        customerCode: 'CUST001',
        contractNo: 'CONTRACT001',
        deptNo: 'DEPT001',
        projectManager: '张三',
        planStartTime: '2024-06-01',
        planEndTime: '2024-08-30',
        auditStatus: AuditStatus.APPROVED,
        projectStatus: ProjectArchiveStatus.EXECUTING,
        executeStatus: ExecuteStatus.EXECUTING,
        sampleCharacteristics: {
          sampleName: '组织标本',
          sampleType: '肺癌组织',
          sampleSource: '合作医院肺癌患者',
          samplePlanNum: 100
        },
        detectionRequirements: [
          {
            analysisType: AnalysisType.VARIANT_ANALYSIS,
            testCode: 'NGS001',
            testName: 'NGS 600基因Panel',
            methodology: 'NGS',
            equipmentPlatform: 'Illumina NovaSeq'
          },
          {
            analysisType: AnalysisType.EXPRESSION_ANALYSIS,
            testCode: 'IHC001',
            testName: 'PD-L1免疫组化检测',
            methodology: '免疫组化',
            equipmentPlatform: 'Autostainer'
          }
        ],
        validationStandards: [
          {
            metricName: '灵敏度',
            comparisonOperator: ComparisonOperator.GTE,
            metricThreshold: 95.00,
            metricUnit: '%',
            verificationMethod: '用国家参考品进行检测验证'
          },
          {
            metricName: '特异性',
            comparisonOperator: ComparisonOperator.GTE,
            metricThreshold: 99.00,
            metricUnit: '%',
            verificationMethod: '用国家参考品进行检测验证'
          }
        ],
        participatingOrganizations: [
          {
            orgNo: 'ORG001',
            orgName: '协和医院',
            managerPerson: '张教授',
            contactPhone: '138****1234'
          },
          {
            orgNo: 'ORG002',
            orgName: '金域检测中心',
            managerPerson: '赵总监',
            contactPhone: '137****5678'
          }
        ],
        attachmentFiles: [
          {
            fileName: '实验方案_V1.2.docx',
            fileUrl: '/files/protocol_v1.2.docx'
          },
          {
            fileName: '统计分析计划.pdf',
            fileUrl: '/files/analysis_plan.pdf'
          }
        ],
        createdAt: '2024-05-20T00:00:00Z',
        updatedAt: '2024-06-15T00:00:00Z'
      }
      setProjectData(mockData)
      form.setFieldsValue({
        ...mockData,
        planStartTime: dayjs(mockData.planStartTime),
        planEndTime: dayjs(mockData.planEndTime)
      })
    } catch (error) {
      message.error('加载项目数据失败')
    } finally {
      setLoading(false)
    }
  }

  /**
   * 导航菜单配置
   */
  const navigationSections = [
    {
      title: '项目配置',
      items: [
        { key: 'basic', label: '基础信息', icon: '📋' },
        { key: 'samples', label: '样本策略', icon: '🧬' },
        { key: 'detection', label: '检测要求', icon: '🔬' },
        { key: 'validation', label: '验证标准', icon: '✅' }
      ]
    },
    {
      title: '协作管理',
      items: [
        { key: 'organizations', label: '参与机构', icon: '🏢' },
        { key: 'documents', label: '文件资料', icon: '📎' }
      ]
    },
    {
      title: '执行监控',
      items: [
        { key: 'progress', label: '项目进度', icon: '📊' },
        { key: 'tasks', label: '任务看板', icon: '⚡' }
      ]
    }
  ]

  /**
   * 获取状态标签
   */
  const getStatusTag = (status: ProjectArchiveStatus) => {
    const statusConfig = {
      [ProjectArchiveStatus.DRAFT]: { color: 'default', text: '草稿' },
      [ProjectArchiveStatus.PENDING]: { color: 'processing', text: '待审核' },
      [ProjectArchiveStatus.APPROVED]: { color: 'success', text: '审核通过' },
      [ProjectArchiveStatus.REJECTED]: { color: 'error', text: '审核拒绝' },
      [ProjectArchiveStatus.EXECUTING]: { color: 'warning', text: '执行中' },
      [ProjectArchiveStatus.COMPLETED]: { color: 'success', text: '已完成' },
      [ProjectArchiveStatus.TERMINATED]: { color: 'error', text: '已终止' }
    }
    const config = statusConfig[status] || { color: 'default', text: status }
    return <Tag color={config.color}>{config.text}</Tag>
  }

  /**
   * 检测要求表格列定义
   */
  const detectionColumns: ColumnsType<DetectionRequirement> = [
    {
      title: '检测项目编码',
      dataIndex: 'testCode',
      key: 'testCode',
      width: 120
    },
    {
      title: '检测项目名称',
      dataIndex: 'testName',
      key: 'testName',
      width: 200
    },
    {
      title: '分析类型',
      dataIndex: 'analysisType',
      key: 'analysisType',
      width: 120,
      render: (type: AnalysisType) => {
        const typeMap = {
          [AnalysisType.VARIANT_ANALYSIS]: '变异分析',
          [AnalysisType.EXPRESSION_ANALYSIS]: '表达分析',
          [AnalysisType.FUSION_ANALYSIS]: '融合分析',
          [AnalysisType.CNV_ANALYSIS]: 'CNV分析'
        }
        return typeMap[type] || type
      }
    },
    {
      title: '方法学',
      dataIndex: 'methodology',
      key: 'methodology',
      width: 100
    },
    {
      title: '仪器平台',
      dataIndex: 'equipmentPlatform',
      key: 'equipmentPlatform',
      width: 150
    },
    {
      title: '操作',
      key: 'action',
      width: 150,
      render: (_, record, index) => (
        <Space size="small">
          <Button
            type="link"
            size="small"
            icon={<EditOutlined />}
            onClick={() => handleEditDetection(record, index)}
          >
            编辑
          </Button>
          <Popconfirm
            title="确定要删除这个检测要求吗？"
            onConfirm={() => handleDeleteDetection(index)}
            okText="确定"
            cancelText="取消"
          >
            <Button
              type="link"
              size="small"
              danger
              icon={<DeleteOutlined />}
            >
              删除
            </Button>
          </Popconfirm>
        </Space>
      )
    }
  ]

  /**
   * 验证标准表格列定义
   */
  const validationColumns: ColumnsType<ValidationStandard> = [
    {
      title: '评价指标',
      dataIndex: 'metricName',
      key: 'metricName',
      width: 150
    },
    {
      title: '比较关系',
      dataIndex: 'comparisonOperator',
      key: 'comparisonOperator',
      width: 100
    },
    {
      title: '指标阈值',
      dataIndex: 'metricThreshold',
      key: 'metricThreshold',
      width: 120
    },
    {
      title: '单位',
      dataIndex: 'metricUnit',
      key: 'metricUnit',
      width: 80
    },
    {
      title: '验证方法',
      dataIndex: 'verificationMethod',
      key: 'verificationMethod',
      ellipsis: true
    },
    {
      title: '操作',
      key: 'action',
      width: 150,
      render: (_, record, index) => (
        <Space size="small">
          <Button
            type="link"
            size="small"
            icon={<EditOutlined />}
            onClick={() => handleEditValidation(record, index)}
          >
            编辑
          </Button>
          <Popconfirm
            title="确定要删除这个验证标准吗？"
            onConfirm={() => handleDeleteValidation(index)}
            okText="确定"
            cancelText="取消"
          >
            <Button
              type="link"
              size="small"
              danger
              icon={<DeleteOutlined />}
            >
              删除
            </Button>
          </Popconfirm>
        </Space>
      )
    }
  ]

  /**
   * 处理编辑检测要求
   */
  const handleEditDetection = (record: DetectionRequirement, index: number) => {
    setEditingDetection({ ...record, index } as any)
    detectionForm.setFieldsValue(record)
    setDetectionModalVisible(true)
  }

  /**
   * 处理删除检测要求
   */
  const handleDeleteDetection = (index: number) => {
    if (projectData) {
      const newDetectionRequirements = [...projectData.detectionRequirements]
      newDetectionRequirements.splice(index, 1)
      setProjectData({
        ...projectData,
        detectionRequirements: newDetectionRequirements
      })
      message.success('删除成功')
    }
  }

  /**
   * 处理编辑验证标准
   */
  const handleEditValidation = (record: ValidationStandard, index: number) => {
    setEditingValidation({ ...record, index } as any)
    validationForm.setFieldsValue(record)
    setValidationModalVisible(true)
  }

  /**
   * 处理删除验证标准
   */
  const handleDeleteValidation = (index: number) => {
    if (projectData) {
      const newValidationStandards = [...projectData.validationStandards]
      newValidationStandards.splice(index, 1)
      setProjectData({
        ...projectData,
        validationStandards: newValidationStandards
      })
      message.success('删除成功')
    }
  }

  /**
   * 处理保存项目
   */
  const handleSave = async () => {
    try {
      const values = await form.validateFields()
      // TODO: 调用API保存项目
      message.success('保存成功')
      setIsEditing(false)
    } catch (error) {
      message.error('保存失败')
    }
  }

  /**
   * 渲染基础信息区域
   */
  const renderBasicInfo = () => (
    <Card title="基础信息" extra={getStatusTag(projectData?.projectStatus || ProjectArchiveStatus.DRAFT)}>
      <Form form={form} layout="vertical" disabled={!isEditing}>
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item name="projectCode" label="项目编码">
              <Input disabled />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              name="projectName"
              label="项目名称"
              rules={[{ required: true, message: '请输入项目名称' }]}
            >
              <Input placeholder="请输入项目名称" />
            </Form.Item>
          </Col>
        </Row>
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              name="projectType"
              label="项目类型"
              rules={[{ required: true, message: '请选择项目类型' }]}
            >
              <Select placeholder="请选择项目类型">
                <Option value="研发验证项目">研发验证项目</Option>
                <Option value="产品注册项目">产品注册项目</Option>
                <Option value="科研委托项目">科研委托项目</Option>
              </Select>
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              name="projectStageType"
              label="项目阶段类型"
              rules={[{ required: true, message: '请选择项目阶段类型' }]}
            >
              <Select placeholder="请选择项目阶段类型">
                <Option value={ProjectStageType.RESEARCH_VALIDATION}>研发验证</Option>
                <Option value={ProjectStageType.CLINICAL_VALIDATION}>临床验证</Option>
                <Option value={ProjectStageType.PRODUCTION_VALIDATION}>生产验证</Option>
                <Option value={ProjectStageType.INSPECTION_SERVICE}>检测服务</Option>
              </Select>
            </Form.Item>
          </Col>
        </Row>
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              name="projectManager"
              label="项目负责人"
              rules={[{ required: true, message: '请输入项目负责人' }]}
            >
              <Input placeholder="请输入项目负责人" />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              name="customerCode"
              label="合作客户"
              rules={[{ required: true, message: '请输入合作客户' }]}
            >
              <Input placeholder="请输入合作客户" />
            </Form.Item>
          </Col>
        </Row>
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              name="planStartTime"
              label="计划开始日期"
              rules={[{ required: true, message: '请选择计划开始日期' }]}
            >
              <DatePicker style={{ width: '100%' }} />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              name="planEndTime"
              label="计划完成日期"
              rules={[{ required: true, message: '请选择计划完成日期' }]}
            >
              <DatePicker style={{ width: '100%' }} />
            </Form.Item>
          </Col>
        </Row>
      </Form>
    </Card>
  )

  /**
   * 渲染样本策略区域
   */
  const renderSampleStrategy = () => (
    <Card
      title="样本策略"
      extra={
        <Button type="primary" icon={<UploadOutlined />}>
          导入样本
        </Button>
      }
    >
      <Row gutter={16}>
        <Col span={8}>
          <Card size="small" title="🔬 主要样本类型">
            <Select
              value={projectData?.sampleCharacteristics.sampleType}
              style={{ width: '100%' }}
              disabled={!isEditing}
            >
              <Option value="全血">全血</Option>
              <Option value="组织标本">组织标本</Option>
              <Option value="细胞系">细胞系</Option>
            </Select>
          </Card>
        </Col>
        <Col span={8}>
          <Card size="small" title="📍 样本来源">
            <Input
              value={projectData?.sampleCharacteristics.sampleSource}
              placeholder="描述样本来源"
              disabled={!isEditing}
            />
          </Card>
        </Col>
        <Col span={8}>
          <Card size="small" title="📦 计划样本量">
            <Space>
              <InputNumber
                value={projectData?.sampleCharacteristics.samplePlanNum}
                disabled={!isEditing}
              />
              <span>例</span>
            </Space>
          </Card>
        </Col>
      </Row>
      <Divider />
      <div>
        <Title level={5}>样本接收标准</Title>
        <Checkbox.Group disabled={!isEditing}>
          <Space direction="vertical">
            <Checkbox value="quality_report">需要样本质检报告</Checkbox>
            <Checkbox value="ethics_approval">需要伦理审批文件</Checkbox>
            <Checkbox value="informed_consent">需要知情同意书</Checkbox>
          </Space>
        </Checkbox.Group>
      </div>
    </Card>
  )

  /**
   * 渲染检测要求区域
   */
  const renderDetectionRequirements = () => (
    <Card
      title="检测要求"
      extra={
        <Space>
          <Button>从模板导入</Button>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => {
              setEditingDetection(null)
              detectionForm.resetFields()
              setDetectionModalVisible(true)
            }}
          >
            添加检测项
          </Button>
        </Space>
      }
    >
      <Table
        columns={detectionColumns}
        dataSource={projectData?.detectionRequirements || []}
        rowKey={(record, index) => `${record.testCode}_${index}`}
        pagination={false}
        size="small"
      />
    </Card>
  )

  /**
   * 渲染验证标准区域
   */
  const renderValidationStandards = () => (
    <Card
      title="验证标准"
      extra={
        <Space>
          <Button>从SOP导入</Button>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => {
              setEditingValidation(null)
              validationForm.resetFields()
              setValidationModalVisible(true)
            }}
          >
            添加指标
          </Button>
        </Space>
      }
    >
      <Table
        columns={validationColumns}
        dataSource={projectData?.validationStandards || []}
        rowKey={(record, index) => `${record.metricName}_${index}`}
        pagination={false}
        size="small"
      />
    </Card>
  )

  /**
   * 渲染参与机构区域
   */
  const renderParticipatingOrganizations = () => (
    <Card
      title="参与机构"
      extra={
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => {
            setEditingOrganization(null)
            organizationForm.resetFields()
            setOrganizationModalVisible(true)
          }}
        >
          添加机构
        </Button>
      }
    >
      <List
        grid={{ gutter: 16, column: 3 }}
        dataSource={projectData?.participatingOrganizations || []}
        renderItem={(item, index) => (
          <List.Item>
            <Card
              size="small"
              actions={[
                <EditOutlined key="edit" onClick={() => handleEditOrganization(item, index)} />,
                <Popconfirm
                  key="delete"
                  title="确定要删除这个机构吗？"
                  onConfirm={() => handleDeleteOrganization(index)}
                  okText="确定"
                  cancelText="取消"
                >
                  <DeleteOutlined />
                </Popconfirm>
              ]}
            >
              <Card.Meta
                avatar={<Avatar icon={<TeamOutlined />} />}
                title={item.orgName}
                description={
                  <div>
                    <div>👤 {item.managerPerson}</div>
                    <div>📞 {item.contactPhone}</div>
                  </div>
                }
              />
            </Card>
          </List.Item>
        )}
      />
    </Card>
  )

  /**
   * 处理编辑机构
   */
  const handleEditOrganization = (record: ParticipatingOrganization, index: number) => {
    setEditingOrganization({ ...record, index } as any)
    organizationForm.setFieldsValue(record)
    setOrganizationModalVisible(true)
  }

  /**
   * 处理删除机构
   */
  const handleDeleteOrganization = (index: number) => {
    if (projectData) {
      const newOrganizations = [...projectData.participatingOrganizations]
      newOrganizations.splice(index, 1)
      setProjectData({
        ...projectData,
        participatingOrganizations: newOrganizations
      })
      message.success('删除成功')
    }
  }

  /**
   * 渲染文件资料区域
   */
  const renderDocuments = () => (
    <Card
      title="文件资料"
      extra={
        <Upload>
          <Button icon={<UploadOutlined />}>上传文件</Button>
        </Upload>
      }
    >
      <List
        dataSource={projectData?.attachmentFiles || []}
        renderItem={(item) => (
          <List.Item
            actions={[
              <Button key="download" type="link" icon={<DownloadOutlined />}>
                下载
              </Button>,
              <Button key="delete" type="link" danger icon={<DeleteOutlined />}>
                删除
              </Button>
            ]}
          >
            <List.Item.Meta
              avatar={<Avatar icon={<FileTextOutlined />} />}
              title={item.fileName}
              description={`文件大小: 2.5MB | 上传时间: 2024-06-15`}
            />
          </List.Item>
        )}
      />
    </Card>
  )

  /**
   * 渲染项目进度区域
   */
  const renderProgress = () => (
    <Card title="项目进度">
      <div style={{ marginBottom: 24 }}>
        <Text strong>总体进度</Text>
        <Progress percent={80} status="active" />
      </div>
      <Timeline>
        <Timeline.Item color="green" dot={<CheckCircleOutlined />}>
          <div>
            <Text strong>样本收集完成</Text>
            <div>2024-06-15 | 已完成 95/100 例样本收集</div>
          </div>
        </Timeline.Item>
        <Timeline.Item color="blue" dot={<ClockCircleOutlined />}>
          <div>
            <Text strong>实验检测进行中</Text>
            <div>2024-06-10 | NGS检测任务已分配给实验室</div>
          </div>
        </Timeline.Item>
        <Timeline.Item color="gray">
          <div>
            <Text strong>数据分析待开始</Text>
            <div>预计 2024-07-01 开始</div>
          </div>
        </Timeline.Item>
        <Timeline.Item color="gray">
          <div>
            <Text strong>报告撰写待分配</Text>
            <div>预计 2024-07-15 开始</div>
          </div>
        </Timeline.Item>
      </Timeline>
    </Card>
  )

  /**
   * 渲染任务看板区域
   */
  const renderTasks = () => (
    <Card title="任务看板">
      <Tabs defaultActiveKey="todo">
        <TabPane tab="待办任务" key="todo">
          <List
            dataSource={[
              { title: '完成剩余5例样本收集', priority: 'high', assignee: '张教授' },
              { title: '提交中期报告', priority: 'medium', assignee: '李工程师' }
            ]}
            renderItem={(item) => (
              <List.Item>
                <List.Item.Meta
                  avatar={
                    <Avatar style={{ backgroundColor: item.priority === 'high' ? '#ff4d4f' : '#1890ff' }}>
                      {item.priority === 'high' ? <ExclamationCircleOutlined /> : <ClockCircleOutlined />}
                    </Avatar>
                  }
                  title={item.title}
                  description={`负责人: ${item.assignee}`}
                />
              </List.Item>
            )}
          />
        </TabPane>
        <TabPane tab="进行中" key="doing">
          <List
            dataSource={[
              { title: 'NGS数据质控', priority: 'high', assignee: '王分析师' }
            ]}
            renderItem={(item) => (
              <List.Item>
                <List.Item.Meta
                  avatar={<Avatar style={{ backgroundColor: '#52c41a' }}><SettingOutlined /></Avatar>}
                  title={item.title}
                  description={`负责人: ${item.assignee}`}
                />
              </List.Item>
            )}
          />
        </TabPane>
        <TabPane tab="已完成" key="done">
          <List
            dataSource={[
              { title: '项目启动会', priority: 'medium', assignee: '张三' },
              { title: '样本接收标准制定', priority: 'medium', assignee: '李四' }
            ]}
            renderItem={(item) => (
              <List.Item>
                <List.Item.Meta
                  avatar={<Avatar style={{ backgroundColor: '#52c41a' }}><CheckCircleOutlined /></Avatar>}
                  title={item.title}
                  description={`负责人: ${item.assignee}`}
                />
              </List.Item>
            )}
          />
        </TabPane>
      </Tabs>
    </Card>
  )

  /**
   * 根据当前激活的区域渲染内容
   */
  const renderContent = () => {
    switch (activeSection) {
      case 'basic':
        return renderBasicInfo()
      case 'samples':
        return renderSampleStrategy()
      case 'detection':
        return renderDetectionRequirements()
      case 'validation':
        return renderValidationStandards()
      case 'organizations':
        return renderParticipatingOrganizations()
      case 'documents':
        return renderDocuments()
      case 'progress':
        return renderProgress()
      case 'tasks':
        return renderTasks()
      default:
        return renderBasicInfo()
    }
  }

  if (loading || !projectData) {
    return <div>加载中...</div>
  }

  return (
    <div className="project-archive-detail">
      {/* 顶部基本信息卡片 */}
      <Card className="basic-info-card" style={{ marginBottom: 16 }}>
        <div className="content-header">
          <Title level={3} style={{ margin: 0 }}>{projectData.projectName}</Title>
          <Space>
            <div className="status-overview">
              {getStatusTag(projectData.projectStatus)}
              <Text type="secondary" style={{ marginLeft: 16 }}>进度: 80%</Text>
            </div>
            {isEditing ? (
              <>
                <Button onClick={() => setIsEditing(false)}>取消</Button>
                <Button type="primary" icon={<SaveOutlined />} onClick={handleSave}>
                  保存
                </Button>
              </>
            ) : (
              <Button type="primary" icon={<EditOutlined />} onClick={() => setIsEditing(true)}>
                编辑
              </Button>
            )}
          </Space>
        </div>
      </Card>

      {/* 主要内容区域 - 使用标签页布局 */}
      <Card className="tab-navigation-card">
        <Tabs 
          activeKey={activeSection} 
          onChange={setActiveSection}
          type="card"
          size="large"
          items={[
            // 项目配置
            {
              key: 'basic',
              label: (
                <span>
                  <span style={{ marginRight: 8 }}>📋</span>
                  基础信息
                </span>
              ),
              children: renderBasicInfo()
            },
            {
              key: 'samples',
              label: (
                <span>
                  <span style={{ marginRight: 8 }}>🧬</span>
                  样本策略
                </span>
              ),
              children: renderSampleStrategy()
            },
            {
              key: 'detection',
              label: (
                <span>
                  <span style={{ marginRight: 8 }}>🔬</span>
                  检测要求
                </span>
              ),
              children: renderDetectionRequirements()
            },
            {
              key: 'validation',
              label: (
                <span>
                  <span style={{ marginRight: 8 }}>✅</span>
                  验证标准
                </span>
              ),
              children: renderValidationStandards()
            },
            // 协作管理
            {
              key: 'organizations',
              label: (
                <span>
                  <span style={{ marginRight: 8 }}>🏢</span>
                  参与机构
                </span>
              ),
              children: renderParticipatingOrganizations()
            },
            {
              key: 'documents',
              label: (
                <span>
                  <span style={{ marginRight: 8 }}>📎</span>
                  文件资料
                </span>
              ),
              children: renderDocuments()
            },
            // 执行监控
            {
              key: 'progress',
              label: (
                <span>
                  <span style={{ marginRight: 8 }}>📊</span>
                  项目进度
                </span>
              ),
              children: renderProgress()
            },
            {
              key: 'tasks',
              label: (
                <span>
                  <span style={{ marginRight: 8 }}>⚡</span>
                  任务看板
                </span>
              ),
              children: renderTasks()
            }
          ]}
        />
      </Card>

      {/* 检测要求弹窗 */}
      <Modal
        title={editingDetection ? '编辑检测要求' : '添加检测要求'}
        open={detectionModalVisible}
        onOk={async () => {
          try {
            const values = await detectionForm.validateFields()
            // TODO: 处理检测要求的添加/编辑逻辑
            message.success('操作成功')
            setDetectionModalVisible(false)
          } catch (error) {
            message.error('操作失败')
          }
        }}
        onCancel={() => setDetectionModalVisible(false)}
        width={600}
      >
        <Form form={detectionForm} layout="vertical">
          <Form.Item
            name="testCode"
            label="检测项目编码"
            rules={[{ required: true, message: '请输入检测项目编码' }]}
          >
            <Input placeholder="请输入检测项目编码" />
          </Form.Item>
          <Form.Item
            name="testName"
            label="检测项目名称"
            rules={[{ required: true, message: '请输入检测项目名称' }]}
          >
            <Input placeholder="请输入检测项目名称" />
          </Form.Item>
          <Form.Item
            name="analysisType"
            label="分析类型"
            rules={[{ required: true, message: '请选择分析类型' }]}
          >
            <Select placeholder="请选择分析类型">
              <Option value={AnalysisType.VARIANT_ANALYSIS}>变异分析</Option>
              <Option value={AnalysisType.EXPRESSION_ANALYSIS}>表达分析</Option>
              <Option value={AnalysisType.FUSION_ANALYSIS}>融合分析</Option>
              <Option value={AnalysisType.CNV_ANALYSIS}>CNV分析</Option>
            </Select>
          </Form.Item>
          <Form.Item
            name="methodology"
            label="方法学"
            rules={[{ required: true, message: '请输入方法学' }]}
          >
            <Input placeholder="请输入方法学" />
          </Form.Item>
          <Form.Item
            name="equipmentPlatform"
            label="仪器平台"
            rules={[{ required: true, message: '请输入仪器平台' }]}
          >
            <Input placeholder="请输入仪器平台" />
          </Form.Item>
        </Form>
      </Modal>

      {/* 验证标准弹窗 */}
      <Modal
        title={editingValidation ? '编辑验证标准' : '添加验证标准'}
        open={validationModalVisible}
        onOk={async () => {
          try {
            const values = await validationForm.validateFields()
            // TODO: 处理验证标准的添加/编辑逻辑
            message.success('操作成功')
            setValidationModalVisible(false)
          } catch (error) {
            message.error('操作失败')
          }
        }}
        onCancel={() => setValidationModalVisible(false)}
        width={600}
      >
        <Form form={validationForm} layout="vertical">
          <Form.Item
            name="metricName"
            label="评价指标"
            rules={[{ required: true, message: '请输入评价指标' }]}
          >
            <Input placeholder="请输入评价指标" />
          </Form.Item>
          <Form.Item
            name="comparisonOperator"
            label="比较关系"
            rules={[{ required: true, message: '请选择比较关系' }]}
          >
            <Select placeholder="请选择比较关系">
              <Option value={ComparisonOperator.GT}>{'>'}</Option>
              <Option value={ComparisonOperator.GTE}>{'>='}</Option>
              <Option value={ComparisonOperator.LT}>{'<'}</Option>
              <Option value={ComparisonOperator.LTE}>{'<='}</Option>
              <Option value={ComparisonOperator.EQ}>{'='}</Option>
            </Select>
          </Form.Item>
          <Form.Item
            name="metricThreshold"
            label="指标阈值"
            rules={[{ required: true, message: '请输入指标阈值' }]}
          >
            <InputNumber placeholder="请输入指标阈值" style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item
            name="metricUnit"
            label="单位"
            rules={[{ required: true, message: '请输入单位' }]}
          >
            <Input placeholder="请输入单位" />
          </Form.Item>
          <Form.Item
            name="verificationMethod"
            label="验证方法"
            rules={[{ required: true, message: '请输入验证方法' }]}
          >
            <TextArea placeholder="请输入验证方法" rows={3} />
          </Form.Item>
        </Form>
      </Modal>

      {/* 参与机构弹窗 */}
      <Modal
        title={editingOrganization ? '编辑参与机构' : '添加参与机构'}
        open={organizationModalVisible}
        onOk={async () => {
          try {
            const values = await organizationForm.validateFields()
            // TODO: 处理参与机构的添加/编辑逻辑
            message.success('操作成功')
            setOrganizationModalVisible(false)
          } catch (error) {
            message.error('操作失败')
          }
        }}
        onCancel={() => setOrganizationModalVisible(false)}
        width={600}
      >
        <Form form={organizationForm} layout="vertical">
          <Form.Item
            name="orgNo"
            label="机构编码"
            rules={[{ required: true, message: '请输入机构编码' }]}
          >
            <Input placeholder="请输入机构编码" />
          </Form.Item>
          <Form.Item
            name="orgName"
            label="机构名称"
            rules={[{ required: true, message: '请输入机构名称' }]}
          >
            <Input placeholder="请输入机构名称" />
          </Form.Item>
          <Form.Item
            name="managerPerson"
            label="机构负责人"
            rules={[{ required: true, message: '请输入机构负责人' }]}
          >
            <Input placeholder="请输入机构负责人" />
          </Form.Item>
          <Form.Item
            name="contactPhone"
            label="联系电话"
            rules={[{ required: true, message: '请输入联系电话' }]}
          >
            <Input placeholder="请输入联系电话" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  )
}

export default ProjectArchiveDetail