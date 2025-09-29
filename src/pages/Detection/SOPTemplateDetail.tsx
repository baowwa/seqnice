import React, { useState, useEffect } from 'react'
import { useParams, useNavigate, useSearchParams } from 'react-router-dom'
import {
  Card,
  Form,
  Input,
  Select,
  Button,
  Space,
  Table,
  Tag,
  Dropdown,
  Modal,
  message,
  Row,
  Col,
  Divider,
  Tooltip,
  Switch,
  Upload,
  Badge
} from 'antd'
import {
  ArrowLeftOutlined,
  SaveOutlined,
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  MoreOutlined,
  UpOutlined,
  DownOutlined,
  ImportOutlined,
  SettingOutlined,
  FileTextOutlined,
  UploadOutlined,
  CheckCircleOutlined
} from '@ant-design/icons'
import type { ColumnsType } from 'antd/es/table'

const { Option } = Select
const { TextArea } = Input

/**
 * 实验步骤数据接口
 */
interface ExperimentStep {
  id: string
  name: string
  type: 'info_record' | 'experiment' | 'instrument' | 'data_analysis' | 'report'
  description: string
  isRequired: boolean
  estimatedTime: number
  sortOrder: number
  hasQualityControl: boolean
  sopDocument?: string
  fieldCount: number
  qcRuleCount: number
}

/**
 * SOP模板数据接口
 */
interface SOPTemplateDetail {
  id: string
  name: string
  version: string
  status: 'active' | 'inactive'
  applicableProjects: string[]
  description: string
  creator: string
  createTime: string
  lastUpdater: string
  updateTime: string
  steps: ExperimentStep[]
}

/**
 * SOP模板详情页面组件
 * 提供SOP模板的详细信息编辑和实验步骤配置功能
 */
const SOPTemplateDetail: React.FC = () => {
  const { templateId } = useParams<{ templateId: string }>()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const isViewMode = searchParams.get('mode') === 'view'
  
  // 状态管理
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [templateData, setTemplateData] = useState<SOPTemplateDetail | null>(null)
  const [stepModalVisible, setStepModalVisible] = useState(false)
  const [editingStep, setEditingStep] = useState<ExperimentStep | null>(null)
  const [form] = Form.useForm()
  const [stepForm] = Form.useForm()

  /**
   * 初始化数据
   */
  useEffect(() => {
    console.log('useEffect triggered, templateId:', templateId)
    if (templateId) {
      loadTemplateDetail(templateId)
    } else {
      console.log('No templateId found in URL params')
    }
  }, [templateId])

  /**
   * 加载SOP模板详情
   * @param templateId 模板ID
   */
  const loadTemplateDetail = async (templateId: string) => {
    console.log('Loading template detail for ID:', templateId)
    setLoading(true)
    try {
      // 模拟数据
      const mockData: SOPTemplateDetail = {
        id: templateId,
        name: '肿瘤基因检测',
        version: 'v2.1',
        status: 'active',
        applicableProjects: ['肿瘤测序项目A', '肿瘤测序项目B'],
        description: '用于肿瘤相关基因突变的检测流程，包含从样本接收到报告生成的完整流程',
        creator: '张三',
        createTime: '2024-03-15',
        lastUpdater: '李四',
        updateTime: '2024-05-20',
        steps: [
          {
            id: '1',
            name: '样本接收',
            type: 'info_record',
            description: '接收并登记样本信息，检查样本质量',
            isRequired: true,
            estimatedTime: 30,
            sortOrder: 1,
            hasQualityControl: true,
            fieldCount: 8,
            qcRuleCount: 3
          },
          {
            id: '2',
            name: '核酸提取',
            type: 'experiment',
            description: '从样本中提取高质量的核酸',
            isRequired: true,
            estimatedTime: 90,
            sortOrder: 2,
            hasQualityControl: true,
            fieldCount: 12,
            qcRuleCount: 5
          },
          {
            id: '3',
            name: '文库构建',
            type: 'experiment',
            description: '构建测序文库，进行PCR扩增',
            isRequired: true,
            estimatedTime: 180,
            sortOrder: 3,
            hasQualityControl: true,
            fieldCount: 15,
            qcRuleCount: 4
          },
          {
            id: '4',
            name: '测序',
            type: 'instrument',
            description: '使用测序仪进行高通量测序',
            isRequired: true,
            estimatedTime: 1440,
            sortOrder: 4,
            hasQualityControl: true,
            fieldCount: 6,
            qcRuleCount: 2
          },
          {
            id: '5',
            name: '数据分析',
            type: 'data_analysis',
            description: '对测序数据进行质控、比对、变异检测等分析',
            isRequired: true,
            estimatedTime: 240,
            sortOrder: 5,
            hasQualityControl: true,
            fieldCount: 10,
            qcRuleCount: 6
          },
          {
            id: '6',
            name: '报告生成',
            type: 'report',
            description: '根据分析结果生成检测报告',
            isRequired: true,
            estimatedTime: 60,
            sortOrder: 6,
            hasQualityControl: false,
            fieldCount: 5,
            qcRuleCount: 0
          }
        ]
      }
      setTemplateData(mockData)
      
      // 设置表单初始值
      form.setFieldsValue({
        name: mockData.name,
        status: mockData.status,
        applicableProjects: mockData.applicableProjects,
        description: mockData.description
      })
    } catch (error) {
      message.error('加载SOP模板详情失败')
    } finally {
      setLoading(false)
    }
  }

  /**
   * 返回列表页
   */
  const handleBack = () => {
    navigate('../sop-config')
  }

  /**
   * 保存模板信息
   * @param values 表单值
   */
  const handleSave = async (values: any) => {
    setSaving(true)
    try {
      // 这里应该调用保存API
      message.success('SOP模板保存成功')
      // 更新本地数据
      if (templateData) {
        setTemplateData({
          ...templateData,
          ...values,
          updateTime: new Date().toISOString().split('T')[0],
          lastUpdater: '当前用户'
        })
      }
    } catch (error) {
      message.error('保存失败')
    } finally {
      setSaving(false)
    }
  }

  /**
   * 添加步骤
   */
  const handleAddStep = () => {
    setEditingStep(null)
    stepForm.resetFields()
    setStepModalVisible(true)
  }

  /**
   * 编辑步骤
   * @param step 步骤数据
   */
  const handleEditStep = (step: ExperimentStep) => {
    setEditingStep(step)
    stepForm.setFieldsValue(step)
    setStepModalVisible(true)
  }

  /**
   * 配置步骤字段
   * @param step 步骤数据
   */
  const handleConfigStep = (step: ExperimentStep) => {
    // 跳转到步骤字段配置页面
    window.open(`/detection/sop-config/step/${step.id}`, '_blank')
  }

  /**
   * 删除步骤
   * @param step 步骤数据
   */
  const handleDeleteStep = (step: ExperimentStep) => {
    Modal.confirm({
      title: '删除步骤',
      content: `确定要删除步骤"${step.name}"吗？`,
      onOk: () => {
        if (templateData) {
          const newSteps = templateData.steps.filter(s => s.id !== step.id)
          setTemplateData({
            ...templateData,
            steps: newSteps
          })
          message.success('步骤删除成功')
        }
      }
    })
  }

  /**
   * 调整步骤顺序
   * @param step 步骤数据
   * @param direction 方向
   */
  const handleMoveStep = (step: ExperimentStep, direction: 'up' | 'down') => {
    if (!templateData) return

    const steps = [...templateData.steps]
    const currentIndex = steps.findIndex(s => s.id === step.id)
    
    if (direction === 'up' && currentIndex > 0) {
      [steps[currentIndex], steps[currentIndex - 1]] = [steps[currentIndex - 1], steps[currentIndex]]
    } else if (direction === 'down' && currentIndex < steps.length - 1) {
      [steps[currentIndex], steps[currentIndex + 1]] = [steps[currentIndex + 1], steps[currentIndex]]
    }

    // 更新排序
    steps.forEach((s, index) => {
      s.sortOrder = index + 1
    })

    setTemplateData({
      ...templateData,
      steps
    })
  }

  /**
   * 提交步骤表单
   * @param values 表单值
   */
  const handleStepSubmit = async (values: any) => {
    try {
      if (editingStep) {
        // 编辑模式
        if (templateData) {
          const newSteps = templateData.steps.map(step =>
            step.id === editingStep.id ? { ...step, ...values } : step
          )
          setTemplateData({
            ...templateData,
            steps: newSteps
          })
        }
        message.success('步骤更新成功')
      } else {
        // 新增模式
        const newStep: ExperimentStep = {
          id: Date.now().toString(),
          ...values,
          sortOrder: templateData ? templateData.steps.length + 1 : 1,
          fieldCount: 0,
          qcRuleCount: 0
        }
        if (templateData) {
          setTemplateData({
            ...templateData,
            steps: [...templateData.steps, newStep]
          })
        }
        message.success('步骤添加成功')
      }
      setStepModalVisible(false)
      stepForm.resetFields()
    } catch (error) {
      message.error('操作失败')
    }
  }

  /**
   * 导入步骤模板
   */
  const handleImportSteps = () => {
    message.info('导入步骤模板功能开发中')
  }

  // 步骤类型选项
  const stepTypeOptions = [
    { label: '信息记录', value: 'info_record' },
    { label: '实验操作', value: 'experiment' },
    { label: '仪器操作', value: 'instrument' },
    { label: '数据分析', value: 'data_analysis' },
    { label: '报告输出', value: 'report' }
  ]

  // 步骤类型标签颜色映射
  const stepTypeColors = {
    info_record: 'blue',
    experiment: 'green',
    instrument: 'orange',
    data_analysis: 'purple',
    report: 'red'
  }

  // 步骤表格列配置
  const stepColumns: ColumnsType<ExperimentStep> = [
    {
      title: '排序',
      dataIndex: 'sortOrder',
      key: 'sortOrder',
      width: 80,
      render: (_, record, index) => (
        <Space>
          <span>{index + 1}</span>
          {!isViewMode && (
            <Space direction="vertical" size={0}>
              <Button
                type="text"
                size="small"
                icon={<UpOutlined />}
                disabled={index === 0}
                onClick={() => handleMoveStep(record, 'up')}
              />
              <Button
                type="text"
                size="small"
                icon={<DownOutlined />}
                disabled={index === (templateData?.steps.length || 0) - 1}
                onClick={() => handleMoveStep(record, 'down')}
              />
            </Space>
          )}
        </Space>
      )
    },
    {
      title: '步骤名称',
      dataIndex: 'name',
      key: 'name',
      width: 150,
      render: (text: string, record: ExperimentStep) => (
        <div>
          <div style={{ fontWeight: 500 }}>{text}</div>
          <div style={{ fontSize: '12px', color: '#666' }}>
            预计 {record.estimatedTime} 分钟
          </div>
        </div>
      )
    },
    {
      title: '步骤类型',
      dataIndex: 'type',
      key: 'type',
      width: 100,
      render: (type: string) => {
        const option = stepTypeOptions.find(opt => opt.value === type)
        return (
          <Tag color={stepTypeColors[type as keyof typeof stepTypeColors]}>
            {option?.label || type}
          </Tag>
        )
      }
    },
    {
      title: '必填',
      dataIndex: 'isRequired',
      key: 'isRequired',
      width: 80,
      render: (isRequired: boolean) => (
        <Badge 
          status={isRequired ? 'success' : 'default'} 
          text={isRequired ? '是' : '否'} 
        />
      )
    },
    {
      title: '配置统计',
      key: 'stats',
      width: 100,
      render: (_, record: ExperimentStep) => (
        <div style={{ fontSize: '12px' }}>
          <div>字段: {record.fieldCount}</div>
          <div>质检: {record.qcRuleCount}</div>
        </div>
      )
    },
    {
      title: '质量控制',
      dataIndex: 'hasQualityControl',
      key: 'hasQualityControl',
      width: 100,
      render: (hasQC: boolean) => (
        <Badge 
          status={hasQC ? 'processing' : 'default'} 
          text={hasQC ? '启用' : '关闭'} 
        />
      )
    },
    {
      title: '操作',
      key: 'action',
      width: 150,
      render: (_, record: ExperimentStep) => (
        <Space size="small">
          <Tooltip title="配置字段">
            <Button 
              type="link" 
              size="small" 
              icon={<SettingOutlined />}
              onClick={() => navigate(`../sop-step/${record.id}`)}
            />
          </Tooltip>
          <Tooltip title="质量控制">
            <Button 
              type="link" 
              size="small" 
              icon={<CheckCircleOutlined />}
              onClick={() => navigate(`../sop-quality-control/${record.id}`)}
            />
          </Tooltip>
          {!isViewMode && (
            <>
              <Tooltip title="编辑">
                <Button 
                  type="link" 
                  size="small" 
                  icon={<EditOutlined />}
                  onClick={() => handleEditStep(record)}
                />
              </Tooltip>
              <Tooltip title="删除">
                <Button 
                  type="link" 
                  size="small" 
                  danger
                  icon={<DeleteOutlined />}
                  onClick={() => handleDeleteStep(record)}
                />
              </Tooltip>
            </>
          )}
        </Space>
      )
    }
  ]

  if (loading) {
    return <div style={{ padding: '24px', textAlign: 'center' }}>加载中...</div>
  }

  if (!templateData) {
    return <div style={{ padding: '24px', textAlign: 'center' }}>SOP模板不存在</div>
  }

  return (
    <div style={{ padding: '24px' }}>
      {/* 页面标题和操作按钮 */}
      <Row justify="space-between" align="middle" style={{ marginBottom: 24 }}>
        <Col>
          <Space>
            <Button icon={<ArrowLeftOutlined />} onClick={handleBack}>
              返回列表
            </Button>
            <h2 style={{ margin: 0 }}>
              SOP模板: {templateData.name} {templateData.version}
            </h2>
          </Space>
        </Col>
        <Col>
          <Space>
            {!isViewMode && (
              <Button 
                type="primary" 
                icon={<SaveOutlined />}
                loading={saving}
                onClick={() => form.submit()}
              >
                保存
              </Button>
            )}
            <Dropdown
              menu={{
                items: [
                  {
                    key: 'version',
                    label: '版本管理',
                    icon: <FileTextOutlined />
                  },
                  {
                    key: 'export',
                    label: '导出模板',
                    icon: <UploadOutlined />
                  }
                ]
              }}
            >
              <Button icon={<MoreOutlined />}>更多</Button>
            </Dropdown>
          </Space>
        </Col>
      </Row>

      {/* 模板基本信息 */}
      <Card title="模板基本信息" style={{ marginBottom: 24 }}>
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSave}
          disabled={isViewMode}
        >
          <Row gutter={16}>
            <Col span={8}>
              <Form.Item
                name="name"
                label="模板名称"
                rules={[{ required: true, message: '请输入模板名称' }]}
              >
                <Input placeholder="请输入SOP模板名称" />
              </Form.Item>
            </Col>
            <Col span={4}>
              <Form.Item label="版本号">
                <Input value={templateData.version} disabled />
              </Form.Item>
            </Col>
            <Col span={4}>
              <Form.Item
                name="status"
                label="状态"
                rules={[{ required: true, message: '请选择状态' }]}
              >
                <Select>
                  <Option value="active">启用</Option>
                  <Option value="inactive">停用</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="applicableProjects"
                label="适用项目"
                rules={[{ required: true, message: '请选择适用项目' }]}
              >
                <Select
                  mode="multiple"
                  placeholder="请选择适用的检测项目"
                  options={[
                    { label: '肿瘤测序项目A', value: '肿瘤测序项目A' },
                    { label: '肿瘤测序项目B', value: '肿瘤测序项目B' },
                    { label: '病原检测项目', value: '病原检测项目' },
                    { label: '遗传病筛查项目A', value: '遗传病筛查项目A' },
                    { label: '遗传病筛查项目B', value: '遗传病筛查项目B' },
                    { label: '新生儿筛查', value: '新生儿筛查' },
                    { label: '药物基因组学项目', value: '药物基因组学项目' },
                    { label: '新冠检测项目', value: '新冠检测项目' }
                  ]}
                />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={16}>
              <Form.Item
                name="description"
                label="描述"
                rules={[{ required: true, message: '请输入模板描述' }]}
              >
                <TextArea rows={3} placeholder="请输入SOP模板描述" />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={6}>
              <Form.Item label="创建人">
                <Input value={templateData.creator} disabled />
              </Form.Item>
            </Col>
            <Col span={6}>
              <Form.Item label="创建时间">
                <Input value={templateData.createTime} disabled />
              </Form.Item>
            </Col>
            <Col span={6}>
              <Form.Item label="最后更新">
                <Input value={templateData.lastUpdater} disabled />
              </Form.Item>
            </Col>
            <Col span={6}>
              <Form.Item label="更新时间">
                <Input value={templateData.updateTime} disabled />
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </Card>

      {/* 实验步骤配置 */}
      <Card 
        title="实验步骤配置"
        extra={
          !isViewMode && (
            <Space>
              <Button 
                type="primary" 
                icon={<PlusOutlined />}
                onClick={handleAddStep}
              >
                添加步骤
              </Button>
              <Button icon={<ImportOutlined />} onClick={handleImportSteps}>
                导入步骤模板
              </Button>
            </Space>
          )
        }
      >
        <Table
          columns={stepColumns}
          dataSource={templateData.steps}
          rowKey="id"
          pagination={false}
          scroll={{ x: 800 }}
        />
      </Card>

      {/* 步骤编辑弹窗 */}
      <Modal
        title={editingStep ? '编辑步骤' : '添加步骤'}
        open={stepModalVisible}
        onCancel={() => {
          setStepModalVisible(false)
          stepForm.resetFields()
        }}
        onOk={() => stepForm.submit()}
        width={600}
      >
        <Form
          form={stepForm}
          layout="vertical"
          onFinish={handleStepSubmit}
        >
          <Form.Item
            name="name"
            label="步骤名称"
            rules={[{ required: true, message: '请输入步骤名称' }]}
          >
            <Input placeholder="请输入步骤名称" />
          </Form.Item>
          <Form.Item
            name="type"
            label="步骤类型"
            rules={[{ required: true, message: '请选择步骤类型' }]}
          >
            <Select placeholder="请选择步骤类型" options={stepTypeOptions} />
          </Form.Item>
          <Form.Item
            name="description"
            label="步骤描述"
            rules={[{ required: true, message: '请输入步骤描述' }]}
          >
            <TextArea rows={3} placeholder="请输入步骤描述" />
          </Form.Item>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="estimatedTime"
                label="预计耗时（分钟）"
                rules={[{ required: true, message: '请输入预计耗时' }]}
              >
                <Input type="number" placeholder="请输入预计耗时" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="isRequired"
                label="是否必填"
                valuePropName="checked"
              >
                <Switch />
              </Form.Item>
            </Col>
          </Row>
          <Form.Item
            name="hasQualityControl"
            label="启用质量控制"
            valuePropName="checked"
          >
            <Switch />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  )
}

export default SOPTemplateDetail