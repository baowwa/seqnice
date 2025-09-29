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
  InputNumber,
  Switch,
  message,
  Popconfirm,
  Typography,
  Tag,
  Upload,
  Tooltip,
  Drawer,
  Descriptions,
  List,
  Badge,
  Divider
} from 'antd'
import { 
  PlusOutlined, 
  EditOutlined, 
  DeleteOutlined, 
  FileTextOutlined,
  UploadOutlined,
  EyeOutlined,
  LinkOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  StopOutlined
} from '@ant-design/icons'
import type { ColumnsType } from 'antd/es/table'

const { Title } = Typography
const { Option } = Select
const { TextArea } = Input

/**
 * 检测项目接口定义
 */
interface TestItem {
  id: string
  name: string
  englishName: string // 英文名称
  code: string
  category: string
  description: string
  price: number
  duration: number // 报告周期（工作日）
  sampleTypes: string[]
  methodology: string
  primaryMethodology: string // 主要方法学
  backupMethodologies: string[] // 备用方法学
  department: string // 所属科室
  responsible: string // 负责人
  isActive: boolean
  status: 'active' | 'inactive' | 'pending' // 项目状态
  clinicalApplication: string // 临床应用
  reportTemplate: string // 报告模板
  associatedAnalysisItems: AnalysisItemAssociation[] // 关联分析项目
  sopDocuments: SOPDocument[] // SOP文档
  sopConfiguration: SOPConfiguration // SOP配置
  qualityRequirements: string // 质量要求
  createdAt: string
  updatedAt: string
}

/**
 * 分析项目关联接口定义
 */
interface AnalysisItemAssociation {
  id: string
  name: string
  code: string
  reportOrder: number // 报告顺序
  isRequired: boolean // 是否必需
  isActive: boolean // 是否启用
}

/**
 * SOP配置接口定义
 */
interface SOPConfiguration {
  mode: 'document' | 'structured' // 配置模式：文档模式或结构化模式
  executionMode: 'strict' | 'guided' | 'reference' // 执行模式：严格、引导、参考
  structuredSteps?: SOPStep[] // 结构化步骤
  templateId?: string // 标准模板ID
}

/**
 * SOP步骤接口定义
 */
interface SOPStep {
  id: string
  name: string
  description: string
  duration: number // 预计时间（分钟）
  order: number
  isRequired: boolean
  materials?: string[] // 所需材料
  equipment?: string[] // 所需设备
  qualityControls?: string[] // 质量控制点
}

/**
 * SOP文档接口定义
 */
interface SOPDocument {
  id: string
  name: string
  version: string
  type: 'procedure' | 'quality' | 'safety' | 'maintenance'
  uploadDate: string
  fileUrl: string
  approver: string
  status: 'draft' | 'approved' | 'expired'
}

/**
 * 分析项目接口定义（用于关联选择）
 */
interface AnalysisItem {
  id: string
  name: string
  code: string
  category: string
}

/**
 * 检测项目管理组件
 * 提供检测项目的增删改查功能
 */
const TestItemManagement: React.FC = () => {
  const [testItems, setTestItems] = useState<TestItem[]>([])
  const [loading, setLoading] = useState(false)
  const [modalVisible, setModalVisible] = useState(false)
  const [editingItem, setEditingItem] = useState<TestItem | null>(null)
  const [detailDrawerVisible, setDetailDrawerVisible] = useState(false)
  const [viewingItem, setViewingItem] = useState<TestItem | null>(null)
  const [selectedAnalysisItems, setSelectedAnalysisItems] = useState<AnalysisItemAssociation[]>([])
  const [form] = Form.useForm()

  // 模拟分析项目数据（用于关联选择）
  const mockAnalysisItems: AnalysisItem[] = [
    { id: '1', name: 'EGFR基因突变检测', code: 'EGFR_MUT', category: '基因突变' },
    { id: '2', name: 'KRAS基因突变检测', code: 'KRAS_MUT', category: '基因突变' },
    { id: '3', name: 'TP53基因突变检测', code: 'TP53_MUT', category: '基因突变' },
    { id: '4', name: 'ALK融合基因检测', code: 'ALK_FUSION', category: '基因融合' },
    { id: '5', name: 'ROS1融合基因检测', code: 'ROS1_FUSION', category: '基因融合' }
  ]

  // 模拟API数据
  const mockTestItems: TestItem[] = [
    {
      id: '1',
      name: '肺癌基因检测',
      englishName: 'Lung Cancer Gene Detection',
      code: 'TP001',
      category: '肿瘤基因',
      description: '肺癌相关基因突变检测，包括EGFR、KRAS、BRAF等关键基因',
      price: 5000,
      duration: 7,
      sampleTypes: ['组织', '血液', '胸腔积液'],
      methodology: 'NGS (下一代测序)',
      primaryMethodology: 'NGS (下一代测序)',
      backupMethodologies: ['PCR', 'Sanger测序'],
      department: '分子病理科',
      responsible: '张三',
      isActive: true,
      status: 'active',
      clinicalApplication: '用于肺癌患者的基因突变检测，指导靶向治疗药物选择',
      reportTemplate: '肺癌基因检测报告模板v2.1',
      associatedAnalysisItems: [
        { id: '1', name: 'EGFR基因突变检测', code: 'EGFR_MUT', reportOrder: 1, isRequired: true, isActive: true },
        { id: '2', name: 'KRAS基因突变检测', code: 'KRAS_MUT', reportOrder: 2, isRequired: true, isActive: true },
        { id: '3', name: 'BRAF基因突变检测', code: 'BRAF_MUT', reportOrder: 3, isRequired: false, isActive: true },
        { id: '4', name: '肿瘤突变负荷分析', code: 'TMB', reportOrder: 4, isRequired: false, isActive: true },
        { id: '5', name: '微卫星不稳定性分析', code: 'MSI', reportOrder: 5, isRequired: false, isActive: true }
      ],
      sopDocuments: [
        {
          id: 'sop1',
          name: 'SOP-MOL-001-NGS建库标准操作程序',
          version: 'v2.1',
          type: 'procedure',
          uploadDate: '2024-01-15',
          fileUrl: '/sop/ngs_library_v2.1.pdf',
          approver: '张主任',
          status: 'approved'
        }
      ],
      sopConfiguration: {
        mode: 'document',
        executionMode: 'strict',
        templateId: 'illumina_nextera_xt'
      },
      qualityRequirements: 'DNA浓度≥10ng/μL，A260/A280比值1.8-2.0，无蛋白质污染',
      createdAt: '2024-01-15',
      updatedAt: '2024-01-20'
    },
    {
      id: '2',
      name: '结直肠癌基因检测',
      englishName: 'Colorectal Cancer Gene Detection',
      code: 'TP002',
      category: '肿瘤基因',
      description: '结直肠癌相关基因检测',
      price: 4500,
      duration: 7,
      sampleTypes: ['组织', '血液'],
      methodology: 'NGS (下一代测序)',
      primaryMethodology: 'NGS (下一代测序)',
      backupMethodologies: ['PCR'],
      department: '分子病理科',
      responsible: '李四',
      isActive: true,
      status: 'active',
      clinicalApplication: '用于结直肠癌患者的基因检测，指导治疗方案选择',
      reportTemplate: '结直肠癌基因检测报告模板v1.8',
      associatedAnalysisItems: [
        { id: '2', name: 'KRAS基因突变检测', code: 'KRAS_MUT', reportOrder: 1, isRequired: true, isActive: true },
        { id: '3', name: 'BRAF基因突变检测', code: 'BRAF_MUT', reportOrder: 2, isRequired: true, isActive: true },
        { id: '5', name: '微卫星不稳定性分析', code: 'MSI', reportOrder: 3, isRequired: false, isActive: true }
      ],
      sopDocuments: [
        {
          id: 'sop3',
          name: '结直肠癌基因检测SOP',
          version: 'v1.8',
          type: 'procedure',
          uploadDate: '2024-01-16',
          fileUrl: '/sop/colorectal_procedure_v1.8.pdf',
          approver: '王主任',
          status: 'approved'
        }
      ],
      sopConfiguration: {
        mode: 'structured',
        executionMode: 'guided',
        structuredSteps: [
          { id: '1', name: '样本质量检测', description: '检测DNA浓度和纯度', duration: 30, order: 1, isRequired: true },
          { id: '2', name: '核酸片段化', description: '将DNA片段化至适当大小', duration: 45, order: 2, isRequired: true },
          { id: '3', name: '末端修复', description: '修复DNA片段末端', duration: 30, order: 3, isRequired: true },
          { id: '4', name: '接头连接', description: '连接测序接头', duration: 60, order: 4, isRequired: true },
          { id: '5', name: '片段筛选', description: '筛选合适大小的片段', duration: 45, order: 5, isRequired: true },
          { id: '6', name: 'PCR扩增', description: '扩增文库', duration: 90, order: 6, isRequired: true },
          { id: '7', name: '文库质检', description: '检测文库质量', duration: 60, order: 7, isRequired: true }
        ]
      },
      qualityRequirements: 'DNA浓度≥5ng/μL，无RNA和蛋白质污染',
      createdAt: '2024-01-16',
      updatedAt: '2024-01-21'
    },
    {
      id: '3',
      name: '乳腺癌基因检测',
      englishName: 'Breast Cancer Gene Detection',
      code: 'TP003',
      category: '肿瘤基因',
      description: '乳腺癌易感基因检测',
      price: 6000,
      duration: 10,
      sampleTypes: ['血液', '组织'],
      methodology: 'NGS (下一代测序)',
      primaryMethodology: 'NGS (下一代测序)',
      backupMethodologies: ['Sanger测序'],
      department: '分子病理科',
      responsible: '王五',
      isActive: false,
      status: 'pending',
      clinicalApplication: '用于乳腺癌易感性评估和家族遗传咨询',
      reportTemplate: '乳腺癌基因检测报告模板v3.0',
      associatedAnalysisItems: [
        { id: '6', name: 'BRCA1基因检测', code: 'BRCA1', reportOrder: 1, isRequired: true, isActive: true },
        { id: '7', name: 'BRCA2基因检测', code: 'BRCA2', reportOrder: 2, isRequired: true, isActive: true }
      ],
      sopDocuments: [
        {
          id: 'sop4',
          name: '乳腺癌基因检测流程',
          version: 'v3.0',
          type: 'procedure',
          uploadDate: '2024-01-20',
          fileUrl: '/sop/breast_cancer_procedure_v3.0.pdf',
          approver: '陈主任',
          status: 'draft'
        }
      ],
      sopConfiguration: {
        mode: 'document',
        executionMode: 'reference'
      },
      qualityRequirements: 'DNA浓度≥20ng/μL，总量≥1μg，片段长度>10kb',
      createdAt: '2024-01-20',
      updatedAt: '2024-01-20'
    }
  ]

  /**
   * 获取检测项目列表
   */
  const fetchTestItems = async () => {
    setLoading(true)
    try {
      // 模拟API调用
      await new Promise(resolve => setTimeout(resolve, 500))
      setTestItems(mockTestItems)
    } catch (error) {
      message.error('获取检测项目列表失败')
    } finally {
      setLoading(false)
    }
  }

  /**
   * 保存检测项目
   * @param values 表单数据
   */
  const handleSave = async (values: any) => {
    try {
      if (editingItem) {
        // 编辑模式
        const updatedItem = {
          ...editingItem,
          ...values,
          updatedAt: new Date().toISOString().split('T')[0]
        }
        setTestItems(prev => 
          prev.map(item => item.id === editingItem.id ? updatedItem : item)
        )
        message.success('检测项目更新成功')
      } else {
        // 新增模式
        const newItem: TestItem = {
          id: Date.now().toString(),
          ...values,
          createdAt: new Date().toISOString().split('T')[0],
          updatedAt: new Date().toISOString().split('T')[0]
        }
        setTestItems(prev => [...prev, newItem])
        message.success('检测项目创建成功')
      }
      
      setModalVisible(false)
      setEditingItem(null)
      form.resetFields()
    } catch (error) {
      message.error('保存失败')
    }
  }

  /**
   * 删除检测项目
   * @param id 检测项目ID
   */
  const handleDelete = async (id: string) => {
    try {
      setTestItems(prev => prev.filter(item => item.id !== id))
      message.success('删除成功')
    } catch (error) {
      message.error('删除失败')
    }
  }

  /**
   * 打开编辑模态框
   * @param item 要编辑的检测项目
   */
  const handleEdit = (item: TestItem) => {
    setEditingItem(item)
    form.setFieldsValue(item)
    setModalVisible(true)
  }

  /**
   * 打开新增模态框
   */
  const handleAdd = () => {
    // 在新标签页中打开新增检测项目页面
    window.open('/detection/test-item/add', '_blank')
  }

  // 表格列定义
  // 表格列定义
  const columns: ColumnsType<TestItem> = [
    {
      title: '项目名称',
      dataIndex: 'name',
      key: 'name',
      width: 150,
      render: (text: string, record: TestItem) => (
        <div>
          <div style={{ fontWeight: 'bold' }}>{text}</div>
          <div style={{ fontSize: '12px', color: '#666' }}>{record.code}</div>
        </div>
      )
    },
    {
      title: '分类',
      dataIndex: 'category',
      key: 'category',
      width: 120,
      render: (category: string) => <Tag color="blue">{category}</Tag>
    },
    {
      title: '价格(元)',
      dataIndex: 'price',
      key: 'price',
      width: 100,
      render: (price: number) => `¥${price}`,
    },
    {
      title: '周期(天)',
      dataIndex: 'duration',
      key: 'duration',
      width: 80,
      align: 'center' as const
    },
    {
      title: '适用样本',
      dataIndex: 'sampleTypes',
      key: 'sampleTypes',
      width: 150,
      render: (sampleTypes: string[]) => (
        <div>
          {sampleTypes.slice(0, 2).map(type => (
            <Tag key={type} style={{ marginBottom: 2 }}>
              {type}
            </Tag>
          ))}
          {sampleTypes.length > 2 && (
            <Tooltip title={sampleTypes.slice(2).join(', ')}>
              <Tag color="default">+{sampleTypes.length - 2}</Tag>
            </Tooltip>
          )}
        </div>
      ),
    },
    {
      title: '项目状态',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      align: 'center' as const,
      render: (status: string) => {
        const statusConfig = {
          active: { color: 'green', icon: <CheckCircleOutlined />, text: '有效' },
          pending: { color: 'orange', icon: <ClockCircleOutlined />, text: '待审' },
          inactive: { color: 'red', icon: <StopOutlined />, text: '停用' }
        }
        const config = statusConfig[status as keyof typeof statusConfig]
        return (
          <Tag color={config.color} icon={config.icon}>
            {config.text}
          </Tag>
        )
      }
    },
    {
      title: '关联分析项目',
      dataIndex: 'associatedAnalysisItems',
      key: 'associatedAnalysisItems',
      width: 120,
      align: 'center' as const,
      render: (items: string[]) => (
        <Badge count={items?.length || 0} showZero color="#1890ff" />
      )
    },
    {
      title: 'SOP文档',
      dataIndex: 'sopDocuments',
      key: 'sopDocuments',
      width: 100,
      align: 'center' as const,
      render: (documents: SOPDocument[]) => (
        documents && documents.length > 0 ? (
          <Tooltip title={`${documents.length}个文档`}>
            <Badge count={documents.length} showZero>
              <FileTextOutlined style={{ color: '#1890ff', fontSize: '16px' }} />
            </Badge>
          </Tooltip>
        ) : (
          <span style={{ color: '#ccc' }}>-</span>
        )
      )
    },
    {
      title: '启用状态',
      dataIndex: 'isActive',
      key: 'isActive',
      width: 80,
      align: 'center' as const,
      render: (isActive: boolean) => (
        <Tag color={isActive ? 'green' : 'red'}>
          {isActive ? '启用' : '禁用'}
        </Tag>
      ),
    },
    {
      title: '操作',
      key: 'action',
      width: 160,
      fixed: 'right' as const,
      render: (_, record) => (
        <Space size="small">
          <Button
            type="link"
            size="small"
            icon={<EyeOutlined />}
            onClick={() => handleViewDetail(record)}
          >
            详情
          </Button>
          <Button
            type="link"
            size="small"
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
          >
            编辑
          </Button>
          <Popconfirm
            title="确定要删除这个检测项目吗？"
            onConfirm={() => handleDelete(record.id)}
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
      ),
    },
  ]

  /**
   * 查看详情
   * @param item 检测项目
   */
  const handleViewDetail = (item: TestItem) => {
    setViewingItem(item)
    setDetailDrawerVisible(true)
  }

  /**
   * 获取关联分析项目名称
   * @param items 分析项目关联数组
   */
  const getAnalysisItemNames = (items: AnalysisItemAssociation[]) => {
    return items.map(item => item.name)
  }

  /**
   * 获取SOP文档类型标签颜色
   * @param type 文档类型
   */
  const getSOPTypeColor = (type: string) => {
    const colors = {
      procedure: 'blue',
      quality: 'green',
      safety: 'orange',
      maintenance: 'purple'
    }
    return colors[type as keyof typeof colors] || 'default'
  }

  /**
   * 获取SOP文档类型名称
   * @param type 文档类型
   */
  const getSOPTypeName = (type: string) => {
    const names = {
      procedure: '操作程序',
      quality: '质量控制',
      safety: '安全规范',
      maintenance: '维护保养'
    }
    return names[type as keyof typeof names] || type
  }

  useEffect(() => {
    fetchTestItems()
  }, [])

  return (
    <div>
      <Title level={3} style={{ marginBottom: 24 }}>
        检测项目管理
      </Title>
      
      <Card className="content-card">
        <div style={{ marginBottom: 16 }}>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={handleAdd}
          >
            新增检测项目
          </Button>
        </div>

        <Table
          columns={columns}
          dataSource={testItems}
          rowKey="id"
          loading={loading}
          pagination={{
            total: testItems.length,
            pageSize: 10,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total) => `共 ${total} 条记录`,
          }}
          scroll={{ x: 1400 }}
        />
      </Card>

      {/* 详情抽屉 */}
      <Drawer
        title="检测项目详情"
        placement="right"
        width={800}
        open={detailDrawerVisible}
        onClose={() => setDetailDrawerVisible(false)}
      >
        {viewingItem && (
          <div>
            {/* 基本信息 */}
            <Descriptions title="基本信息" bordered column={2} size="small" style={{ marginBottom: 24 }}>
              <Descriptions.Item label="项目名称" span={2}>
                <strong style={{ fontSize: '16px' }}>{viewingItem.name}</strong>
              </Descriptions.Item>
              <Descriptions.Item label="英文名称" span={2}>
                {viewingItem.englishName || '-'}
              </Descriptions.Item>
              <Descriptions.Item label="项目编码">
                <Tag color="blue">{viewingItem.code}</Tag>
              </Descriptions.Item>
              <Descriptions.Item label="分类">
                <Tag color="green">{viewingItem.category}</Tag>
              </Descriptions.Item>
              <Descriptions.Item label="所属科室">
                {viewingItem.department || '-'}
              </Descriptions.Item>
              <Descriptions.Item label="负责人">
                {viewingItem.responsible || '-'}
              </Descriptions.Item>
              <Descriptions.Item label="项目状态">
                {(() => {
                  const statusConfig = {
                    active: { color: 'green', icon: <CheckCircleOutlined />, text: '有效' },
                    pending: { color: 'orange', icon: <ClockCircleOutlined />, text: '待审' },
                    inactive: { color: 'red', icon: <StopOutlined />, text: '停用' }
                  }
                  const config = statusConfig[viewingItem.status as keyof typeof statusConfig]
                  return (
                    <Tag color={config.color} icon={config.icon}>
                      {config.text}
                    </Tag>
                  )
                })()}
              </Descriptions.Item>
              <Descriptions.Item label="启用状态">
                <Tag color={viewingItem.isActive ? 'green' : 'red'}>
                  {viewingItem.isActive ? '启用' : '禁用'}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="项目描述" span={2}>
                {viewingItem.description || '-'}
              </Descriptions.Item>
            </Descriptions>

            {/* 技术信息 */}
            <Descriptions title="技术信息" bordered column={2} size="small" style={{ marginBottom: 24 }}>
              <Descriptions.Item label="价格">
                <span style={{ color: '#f50', fontWeight: 'bold' }}>¥{viewingItem.price}</span>
              </Descriptions.Item>
              <Descriptions.Item label="报告周期">
                {viewingItem.duration}个工作日
              </Descriptions.Item>
              <Descriptions.Item label="主要方法学">
                <Tag color="purple">{viewingItem.primaryMethodology || viewingItem.methodology}</Tag>
              </Descriptions.Item>
              <Descriptions.Item label="备用方法学">
                {viewingItem.backupMethodologies && viewingItem.backupMethodologies.length > 0 ? (
                  viewingItem.backupMethodologies.map(method => (
                    <Tag key={method} color="default" style={{ marginRight: 4 }}>{method}</Tag>
                  ))
                ) : '-'}
              </Descriptions.Item>
              <Descriptions.Item label="适用样本" span={2}>
                {viewingItem.sampleTypes.map(type => (
                  <Tag key={type} color="cyan" style={{ marginRight: 4 }}>{type}</Tag>
                ))}
              </Descriptions.Item>
            </Descriptions>

            {/* 临床信息 */}
            <Descriptions title="临床信息" bordered column={1} size="small" style={{ marginBottom: 24 }}>
              <Descriptions.Item label="临床应用">
                {viewingItem.clinicalApplication || '-'}
              </Descriptions.Item>
              <Descriptions.Item label="质量要求">
                {viewingItem.qualityRequirements || '-'}
              </Descriptions.Item>
              <Descriptions.Item label="报告模板">
                {viewingItem.reportTemplate || '-'}
              </Descriptions.Item>
            </Descriptions>

            {/* SOP配置信息 */}
            {viewingItem.sopConfiguration && (
              <Descriptions title="SOP配置" bordered column={2} size="small" style={{ marginBottom: 24 }}>
                <Descriptions.Item label="配置模式">
                  <Tag color={viewingItem.sopConfiguration.mode === 'document' ? 'blue' : 'orange'}>
                    {viewingItem.sopConfiguration.mode === 'document' ? '文档模式' : '结构化模式'}
                  </Tag>
                </Descriptions.Item>
                <Descriptions.Item label="执行模式">
                  <Tag color={
                    viewingItem.sopConfiguration.executionMode === 'strict' ? 'red' :
                    viewingItem.sopConfiguration.executionMode === 'guided' ? 'orange' : 'green'
                  }>
                    {viewingItem.sopConfiguration.executionMode === 'strict' ? '严格模式' :
                     viewingItem.sopConfiguration.executionMode === 'guided' ? '引导模式' : '参考模式'}
                  </Tag>
                </Descriptions.Item>
                {viewingItem.sopConfiguration.templateId && (
                  <Descriptions.Item label="标准模板" span={2}>
                    {viewingItem.sopConfiguration.templateId}
                  </Descriptions.Item>
                )}
              </Descriptions>
            )}

            {/* 关联分析项目 */}
            <div style={{ marginBottom: 24 }}>
              <Title level={5} style={{ marginBottom: 16 }}>
                <LinkOutlined style={{ marginRight: 8 }} />
                关联分析项目
              </Title>
              {viewingItem.associatedAnalysisItems && viewingItem.associatedAnalysisItems.length > 0 ? (
                <List
                  size="small"
                  bordered
                  dataSource={viewingItem.associatedAnalysisItems.sort((a, b) => a.reportOrder - b.reportOrder)}
                  renderItem={(item, index) => (
                    <List.Item>
                      <div style={{ width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                          <Badge count={item.reportOrder} style={{ backgroundColor: '#52c41a', marginRight: 8 }} />
                          <span style={{ fontWeight: 'bold' }}>{item.name}</span>
                          <span style={{ color: '#666', marginLeft: 8 }}>({item.code})</span>
                        </div>
                        <Space>
                          <Tag color={item.isRequired ? 'red' : 'default'}>
                            {item.isRequired ? '必需' : '可选'}
                          </Tag>
                          <Tag color={item.isActive ? 'green' : 'default'}>
                            {item.isActive ? '启用' : '停用'}
                          </Tag>
                        </Space>
                      </div>
                    </List.Item>
                  )}
                />
              ) : (
                <div style={{ 
                  textAlign: 'center', 
                  color: '#999', 
                  fontStyle: 'italic',
                  padding: '20px',
                  border: '1px dashed #d9d9d9',
                  borderRadius: '6px'
                }}>
                  暂无关联分析项目
                </div>
              )}
            </div>

            {/* SOP文档 */}
            <div>
              <Title level={5} style={{ marginBottom: 16 }}>
                <FileTextOutlined style={{ marginRight: 8 }} />
                SOP文档
              </Title>
              {viewingItem.sopDocuments && viewingItem.sopDocuments.length > 0 ? (
                <List
                  size="small"
                  bordered
                  dataSource={viewingItem.sopDocuments}
                  renderItem={(doc) => (
                    <List.Item
                      actions={[
                        <Button 
                          type="link" 
                          size="small" 
                          icon={<FileTextOutlined />}
                          onClick={() => window.open(doc.fileUrl, '_blank')}
                        >
                          查看
                        </Button>
                      ]}
                    >
                      <List.Item.Meta
                        avatar={<FileTextOutlined style={{ fontSize: '20px', color: '#1890ff' }} />}
                        title={
                          <div>
                            <span style={{ fontWeight: 'bold' }}>{doc.name}</span>
                            <div style={{ marginTop: 4 }}>
                              <Tag color={getSOPTypeColor(doc.type)} style={{ marginRight: 8 }}>
                                {getSOPTypeName(doc.type)}
                              </Tag>
                              <Tag color={doc.status === 'approved' ? 'green' : doc.status === 'draft' ? 'orange' : 'red'}>
                                {doc.status === 'approved' ? '已审批' : doc.status === 'draft' ? '草稿' : '已过期'}
                              </Tag>
                            </div>
                          </div>
                        }
                        description={
                          <div style={{ color: '#666' }}>
                            <div>版本: {doc.version} | 审批人: {doc.approver}</div>
                            <div>上传时间: {doc.uploadDate}</div>
                          </div>
                        }
                      />
                    </List.Item>
                  )}
                />
              ) : (
                <div style={{ 
                  textAlign: 'center', 
                  color: '#999', 
                  fontStyle: 'italic',
                  padding: '20px',
                  border: '1px dashed #d9d9d9',
                  borderRadius: '6px'
                }}>
                  暂无SOP文档
                </div>
              )}
            </div>
          </div>
        )}
      </Drawer>

      <Modal
        title={editingItem ? '编辑检测项目' : '新增检测项目'}
        open={modalVisible}
        onCancel={() => {
          setModalVisible(false)
          setEditingItem(null)
          form.resetFields()
        }}
        footer={null}
        width={900}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSave}
        >
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <Form.Item
              name="name"
              label="项目名称"
              rules={[{ required: true, message: '请输入项目名称' }]}
            >
              <Input placeholder="请输入项目名称" />
            </Form.Item>

            <Form.Item
              name="englishName"
              label="英文名称"
              rules={[{ required: true, message: '请输入英文名称' }]}
            >
              <Input placeholder="请输入英文名称" />
            </Form.Item>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <Form.Item
              name="code"
              label="项目编码"
              rules={[{ required: true, message: '请输入项目编码' }]}
            >
              <Input placeholder="请输入项目编码" />
            </Form.Item>

            <Form.Item
              name="department"
              label="所属科室"
              rules={[{ required: true, message: '请选择所属科室' }]}
            >
              <Select placeholder="请选择所属科室">
                <Option value="检验科">检验科</Option>
                <Option value="病理科">病理科</Option>
                <Option value="分子诊断科">分子诊断科</Option>
                <Option value="微生物科">微生物科</Option>
                <Option value="免疫科">免疫科</Option>
                <Option value="生化科">生化科</Option>
                <Option value="其他">其他</Option>
              </Select>
            </Form.Item>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <Form.Item
              name="responsible"
              label="负责人"
              rules={[{ required: true, message: '请输入负责人' }]}
            >
              <Input placeholder="请输入负责人姓名" />
            </Form.Item>

            <Form.Item
              name="category"
              label="分类"
              rules={[{ required: true, message: '请选择分类' }]}
            >
              <Select placeholder="请选择分类">
                <Option value="微生物多样性">微生物多样性</Option>
                <Option value="功能基因组">功能基因组</Option>
                <Option value="代谢分析">代谢分析</Option>
                <Option value="蛋白质组">蛋白质组</Option>
                <Option value="基因检测">基因检测</Option>
                <Option value="其他">其他</Option>
              </Select>
            </Form.Item>
          </div>

          <Form.Item
            name="status"
            label="项目状态"
            rules={[{ required: true, message: '请选择项目状态' }]}
          >
            <Select placeholder="请选择项目状态">
              <Option value="active">有效</Option>
              <Option value="pending">待审</Option>
              <Option value="inactive">停用</Option>
            </Select>
          </Form.Item>

          <Form.Item
            name="description"
            label="项目描述"
          >
            <TextArea 
              placeholder="请输入项目描述" 
              rows={3}
            />
          </Form.Item>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px' }}>
            <Form.Item
              name="price"
              label="价格(元)"
              rules={[{ required: true, message: '请输入价格' }]}
            >
              <InputNumber 
                placeholder="请输入价格" 
                min={0}
                style={{ width: '100%' }}
              />
            </Form.Item>

            <Form.Item
              name="duration"
              label="报告周期(工作日)"
              rules={[{ required: true, message: '请输入报告周期' }]}
            >
              <InputNumber 
                placeholder="请输入报告周期" 
                min={1}
                style={{ width: '100%' }}
              />
            </Form.Item>

            <Form.Item
              name="methodology"
              label="检测方法"
              rules={[{ required: true, message: '请输入检测方法' }]}
            >
              <Input placeholder="请输入检测方法" />
            </Form.Item>
          </div>

          {/* 方法学配置 */}
          <Divider orientation="left">方法学配置</Divider>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <Form.Item
              name="primaryMethodology"
              label="主要方法学"
              rules={[{ required: true, message: '请选择主要方法学' }]}
            >
              <Select placeholder="请选择主要方法学">
                <Option value="PCR">PCR</Option>
                <Option value="qPCR">qPCR</Option>
                <Option value="NGS">NGS</Option>
                <Option value="Sanger测序">Sanger测序</Option>
                <Option value="ELISA">ELISA</Option>
                <Option value="Western Blot">Western Blot</Option>
                <Option value="免疫荧光">免疫荧光</Option>
                <Option value="流式细胞术">流式细胞术</Option>
                <Option value="质谱">质谱</Option>
                <Option value="色谱">色谱</Option>
                <Option value="其他">其他</Option>
              </Select>
            </Form.Item>

            <Form.Item
              name="backupMethodologies"
              label="备用方法学"
            >
              <Select 
                mode="multiple" 
                placeholder="请选择备用方法学"
                allowClear
              >
                <Option value="PCR">PCR</Option>
                <Option value="qPCR">qPCR</Option>
                <Option value="NGS">NGS</Option>
                <Option value="Sanger测序">Sanger测序</Option>
                <Option value="ELISA">ELISA</Option>
                <Option value="Western Blot">Western Blot</Option>
                <Option value="免疫荧光">免疫荧光</Option>
                <Option value="流式细胞术">流式细胞术</Option>
                <Option value="质谱">质谱</Option>
                <Option value="色谱">色谱</Option>
                <Option value="其他">其他</Option>
              </Select>
            </Form.Item>
          </div>

          <Form.Item
            name="sampleTypes"
            label="适用样本类型"
            rules={[{ required: true, message: '请选择适用样本类型' }]}
          >
            <Select 
              mode="multiple" 
              placeholder="请选择适用样本类型"
              allowClear
            >
              <Option value="血液">血液</Option>
              <Option value="唾液">唾液</Option>
              <Option value="粪便">粪便</Option>
              <Option value="土壤">土壤</Option>
              <Option value="尿液">尿液</Option>
              <Option value="组织">组织</Option>
              <Option value="其他">其他</Option>
            </Select>
          </Form.Item>

          <Form.Item
            name="clinicalApplication"
            label="临床应用"
          >
            <TextArea 
              placeholder="请描述临床应用场景和意义" 
              rows={2}
            />
          </Form.Item>

          <Form.Item
            name="qualityRequirements"
            label="质量要求"
          >
            <TextArea 
              placeholder="请描述样本质量要求和技术指标" 
              rows={2}
            />
          </Form.Item>

          <Form.Item
            name="reportTemplate"
            label="报告模板"
          >
            <Input placeholder="请输入报告模板名称或版本" />
          </Form.Item>

          {/* SOP配置 */}
          <Divider orientation="left">SOP配置</Divider>
          
          <Form.Item
            name={['sopConfiguration', 'mode']}
            label="配置模式"
            rules={[{ required: true, message: '请选择配置模式' }]}
          >
            <Select placeholder="请选择配置模式">
              <Option value="document">文档模式</Option>
              <Option value="structured">结构化模式</Option>
            </Select>
          </Form.Item>

          <Form.Item
            name={['sopConfiguration', 'executionMode']}
            label="执行模式"
            rules={[{ required: true, message: '请选择执行模式' }]}
          >
            <Select placeholder="请选择执行模式">
              <Option value="strict">严格模式</Option>
              <Option value="guided">引导模式</Option>
              <Option value="reference">参考模式</Option>
            </Select>
          </Form.Item>

          <Form.Item
            name="sopDocuments"
            label="SOP文档"
          >
            <Upload
              multiple
              beforeUpload={() => false}
              fileList={[]}
            >
              <Button icon={<UploadOutlined />}>上传SOP文档</Button>
            </Upload>
          </Form.Item>

          <Form.Item
            name={['sopConfiguration', 'templateId']}
            label="标准模板"
          >
            <Select placeholder="请选择标准模板" allowClear>
              <Option value="template_pcr">PCR标准模板</Option>
              <Option value="template_ngs">NGS标准模板</Option>
              <Option value="template_elisa">ELISA标准模板</Option>
              <Option value="template_wb">Western Blot标准模板</Option>
              <Option value="template_custom">自定义模板</Option>
            </Select>
          </Form.Item>

          <Form.Item
            name="associatedAnalysisItems"
            label="关联分析项目"
          >
            <div>
              <Button 
                type="dashed" 
                onClick={() => {
                  const newItem: AnalysisItemAssociation = {
                    id: '',
                    name: '',
                    code: '',
                    reportOrder: selectedAnalysisItems.length + 1,
                    isRequired: false,
                    isActive: true
                  }
                  setSelectedAnalysisItems([...selectedAnalysisItems, newItem])
                }}
                style={{ width: '100%', marginBottom: 16 }}
              >
                <PlusOutlined /> 添加分析项目
              </Button>
              
              {selectedAnalysisItems.map((item, index) => (
                <div key={index} style={{ 
                  border: '1px solid #d9d9d9', 
                  borderRadius: 6, 
                  padding: 16, 
                  marginBottom: 16,
                  backgroundColor: '#fafafa'
                }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: '16px', marginBottom: 16 }}>
                    <Select
                      placeholder="请选择分析项目"
                      value={item.id || undefined}
                      onChange={(value) => {
                        const selectedItem = mockAnalysisItems.find(ai => ai.id === value)
                        if (selectedItem) {
                          const updatedItems = [...selectedAnalysisItems]
                          updatedItems[index] = {
                            ...item,
                            id: selectedItem.id,
                            name: selectedItem.name,
                            code: selectedItem.code
                          }
                          setSelectedAnalysisItems(updatedItems)
                        }
                      }}
                    >
                      {mockAnalysisItems.map(ai => (
                        <Option key={ai.id} value={ai.id}>
                          {ai.name} ({ai.code})
                        </Option>
                      ))}
                    </Select>
                    
                    <InputNumber
                      placeholder="报告顺序"
                      value={item.reportOrder}
                      min={1}
                      onChange={(value) => {
                        const updatedItems = [...selectedAnalysisItems]
                        updatedItems[index] = { ...item, reportOrder: value || 1 }
                        setSelectedAnalysisItems(updatedItems)
                      }}
                    />
                    
                    <Button 
                      danger 
                      onClick={() => {
                        const updatedItems = selectedAnalysisItems.filter((_, i) => i !== index)
                        setSelectedAnalysisItems(updatedItems)
                      }}
                    >
                      删除
                    </Button>
                  </div>
                  
                  <div style={{ display: 'flex', gap: '16px' }}>
                    <label>
                      <input
                        type="checkbox"
                        checked={item.isRequired}
                        onChange={(e) => {
                          const updatedItems = [...selectedAnalysisItems]
                          updatedItems[index] = { ...item, isRequired: e.target.checked }
                          setSelectedAnalysisItems(updatedItems)
                        }}
                      />
                      <span style={{ marginLeft: 8 }}>必需项目</span>
                    </label>
                    
                    <label>
                      <input
                        type="checkbox"
                        checked={item.isActive}
                        onChange={(e) => {
                          const updatedItems = [...selectedAnalysisItems]
                          updatedItems[index] = { ...item, isActive: e.target.checked }
                          setSelectedAnalysisItems(updatedItems)
                        }}
                      />
                      <span style={{ marginLeft: 8 }}>启用状态</span>
                    </label>
                  </div>
                </div>
              ))}
            </div>
          </Form.Item>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <Form.Item
              name="isActive"
              label="启用状态"
              valuePropName="checked"
              initialValue={true}
            >
              <Switch checkedChildren="启用" unCheckedChildren="禁用" />
            </Form.Item>
          </div>

          <Form.Item style={{ marginBottom: 0, textAlign: 'right' }}>
            <Space>
              <Button onClick={() => {
                setModalVisible(false)
                setEditingItem(null)
                form.resetFields()
              }}>
                取消
              </Button>
              <Button type="primary" htmlType="submit">
                {editingItem ? '更新' : '创建'}
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  )
}

export default TestItemManagement