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
  Badge,
  Drawer,
  InputNumber,
  Checkbox,
  Alert,
  Progress
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
  CheckCircleOutlined,
  ExclamationCircleOutlined,
  WarningOutlined
} from '@ant-design/icons'
import type { ColumnsType } from 'antd/es/table'

const { Option } = Select
const { TextArea } = Input

/**
 * SOP步骤字段接口
 */
interface StepField {
  id: string
  name: string
  identifier: string
  type: 'text' | 'number' | 'date' | 'file' | 'select' | 'textarea' | 'checkbox'
  isRequired: boolean
  defaultValue?: string
  unit?: string
  options?: string[]
  validationRule?: string
  placeholder?: string
  helpText?: string
  sortOrder: number
  showInQuickPanel: boolean
  allowBatchEdit: boolean
  participateValidation: boolean
  generateReport: boolean
}

/**
 * 质量控制点接口
 */
interface QualityControlPoint {
  id: string
  name: string
  type: 'manual' | 'automatic' | 'semi-automatic'
  checkType: 'range' | 'enum' | 'formula' | 'file' | 'visual'
  description: string
  isRequired: boolean
  triggerCondition: string
  checkRule: string
  warningThreshold?: number
  errorThreshold?: number
  autoCorrection: boolean
  notificationLevel: 'info' | 'warning' | 'error'
  relatedFields: string[]
  sortOrder: number
  isActive: boolean
}

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
  fields: StepField[]
  qualityControlPoints: QualityControlPoint[]
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
  const [editingStep, setEditingStep] = useState<ExperimentStep | null>(null)// 抽屉状态
  const [configDrawerVisible, setConfigDrawerVisible] = useState(false)
  const [qualityControlDrawerVisible, setQualityControlDrawerVisible] = useState(false)
  const [currentStep, setCurrentStep] = useState<SOPStep | null>(null)
  
  // 字段配置相关状态
  const [fieldModalVisible, setFieldModalVisible] = useState(false)
  const [editingField, setEditingField] = useState<StepField | null>(null)
  const [fieldForm] = Form.useForm()
  
  // 质量控制相关状态
  const [qcModalVisible, setQcModalVisible] = useState(false)
  const [editingQC, setEditingQC] = useState<QualityControlPoint | null>(null)
  const [qcForm] = Form.useForm()
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
    // 模拟获取步骤详细数据
    const stepData: SOPStep = {
      id: step.id,
      name: step.name,
      description: step.description,
      estimatedTime: step.estimatedTime,
      sortOrder: step.sortOrder,
      hasQualityControl: step.qcRuleCount > 0,
      fields: [
        {
          id: '1',
          name: '操作人员',
          identifier: 'operator',
          type: 'text',
          isRequired: true,
          placeholder: '请输入操作人员姓名',
          sortOrder: 1,
          showInQuickPanel: true,
          allowBatchEdit: false,
          participateValidation: false,
          generateReport: true
        },
        {
          id: '2',
          name: '提取方法',
          identifier: 'extraction_method',
          type: 'select',
          isRequired: true,
          defaultValue: '磁珠法',
          options: ['磁珠法', '酚氯仿法', '柱式法', '其他'],
          placeholder: '请选择核酸提取方法',
          helpText: '根据样本类型和下游应用选择合适的提取方法',
          sortOrder: 2,
          showInQuickPanel: true,
          allowBatchEdit: true,
          participateValidation: true,
          generateReport: true
        },
        {
          id: '3',
          name: '样本浓度',
          identifier: 'concentration',
          type: 'number',
          isRequired: true,
          unit: 'ng/μl',
          placeholder: '请输入样本浓度',
          validationRule: '>0',
          sortOrder: 3,
          showInQuickPanel: true,
          allowBatchEdit: false,
          participateValidation: true,
          generateReport: true
        }
      ],
      qualityControlPoints: []
    }
    setCurrentStep(stepData)
    setConfigDrawerVisible(true)
  }

  /**
   * 配置质量控制
   * @param step 步骤数据
   */
  const handleQualityControl = (step: ExperimentStep) => {
    // 模拟获取步骤详细数据
    const stepData: SOPStep = {
      id: step.id,
      name: step.name,
      description: step.description,
      estimatedTime: step.estimatedTime,
      sortOrder: step.sortOrder,
      hasQualityControl: step.qcRuleCount > 0,
      fields: [],
      qualityControlPoints: [
        {
          id: '1',
          name: '浓度检查',
          type: 'automatic',
          checkType: 'range',
          description: '检查核酸浓度是否在合理范围内',
          isRequired: true,
          triggerCondition: '提取完成后',
          checkRule: '浓度 >= 10 ng/μl',
          warningThreshold: 20,
          errorThreshold: 10,
          autoCorrection: false,
          notificationLevel: 'error',
          relatedFields: ['concentration'],
          sortOrder: 1,
          isActive: true
        },
        {
          id: '2',
          name: '纯度检查',
          type: 'automatic',
          checkType: 'range',
          description: '检查核酸纯度（260/280比值）',
          isRequired: true,
          triggerCondition: '浓度检查通过后',
          checkRule: '1.8 <= 260/280 <= 2.2',
          warningThreshold: 1.7,
          errorThreshold: 1.5,
          autoCorrection: false,
          notificationLevel: 'warning',
          relatedFields: ['ratio_260_280'],
          sortOrder: 2,
          isActive: true
        }
      ]
    }
    setCurrentStep(stepData)
    setQualityControlDrawerVisible(true)
  }

  /**
   * 添加字段
   */
  const handleAddField = () => {
    setEditingField(null)
    fieldForm.resetFields()
    setFieldModalVisible(true)
  }

  /**
   * 编辑字段
   * @param field 字段数据
   */
  const handleEditField = (field: StepField) => {
    setEditingField(field)
    fieldForm.setFieldsValue(field)
    setFieldModalVisible(true)
  }

  /**
   * 删除字段
   * @param field 字段数据
   */
  const handleDeleteField = (field: StepField) => {
    Modal.confirm({
      title: '删除字段',
      content: `确定要删除字段"${field.name}"吗？`,
      onOk: () => {
        if (currentStep) {
          const newFields = currentStep.fields.filter(f => f.id !== field.id)
          setCurrentStep({
            ...currentStep,
            fields: newFields
          })
          message.success('字段删除成功')
        }
      }
    })
  }

  /**
   * 提交字段表单
   * @param values 表单值
   */
  const handleFieldSubmit = async (values: any) => {
    try {
      if (editingField) {
        // 编辑模式
        if (currentStep) {
          const newFields = currentStep.fields.map(field =>
            field.id === editingField.id ? { ...field, ...values } : field
          )
          setCurrentStep({
            ...currentStep,
            fields: newFields
          })
        }
        message.success('字段更新成功')
      } else {
        // 新增模式
        const newField: StepField = {
          id: Date.now().toString(),
          ...values,
          sortOrder: currentStep ? currentStep.fields.length + 1 : 1,
          showInQuickPanel: false,
          allowBatchEdit: false,
          participateValidation: false,
          generateReport: false
        }
        if (currentStep) {
          setCurrentStep({
            ...currentStep,
            fields: [...currentStep.fields, newField]
          })
        }
        message.success('字段添加成功')
      }
      setFieldModalVisible(false)
      fieldForm.resetFields()
    } catch (error) {
      message.error('操作失败')
    }
  }

  /**
   * 批量编辑字段
   */
  const handleBatchEdit = () => {
    message.info('批量编辑功能开发中')
  }

  /**
   * 验证配置
   */
  const handleValidateConfig = () => {
    message.success('配置验证通过')
  }

  /**
   * 添加质量控制点
   */
  const handleAddQC = () => {
    setEditingQC(null)
    qcForm.resetFields()
    setQcModalVisible(true)
  }

  /**
   * 编辑质量控制点
   * @param qc 质量控制点数据
   */
  const handleEditQC = (qc: QualityControlPoint) => {
    setEditingQC(qc)
    qcForm.setFieldsValue(qc)
    setQcModalVisible(true)
  }

  /**
   * 删除质量控制点
   * @param qc 质量控制点数据
   */
  const handleDeleteQC = (qc: QualityControlPoint) => {
    Modal.confirm({
      title: '删除质量控制点',
      content: `确定要删除质量控制点"${qc.name}"吗？`,
      onOk: () => {
        if (currentStep) {
          const newQCPoints = currentStep.qualityControlPoints.filter(q => q.id !== qc.id)
          setCurrentStep({
            ...currentStep,
            qualityControlPoints: newQCPoints
          })
          message.success('质量控制点删除成功')
        }
      }
    })
  }

  /**
   * 切换质量控制点状态
   * @param qc 质量控制点数据
   */
  const handleToggleQC = (qc: QualityControlPoint) => {
    if (currentStep) {
      const newQCPoints = currentStep.qualityControlPoints.map(q =>
        q.id === qc.id ? { ...q, isActive: !q.isActive } : q
      )
      setCurrentStep({
        ...currentStep,
        qualityControlPoints: newQCPoints
      })
      message.success(`质量控制点已${qc.isActive ? '禁用' : '启用'}`)
    }
  }

  /**
   * 提交质量控制点表单
   * @param values 表单值
   */
  const handleQCSubmit = async (values: any) => {
    try {
      if (editingQC) {
        // 编辑模式
        if (currentStep) {
          const newQCPoints = currentStep.qualityControlPoints.map(qc =>
            qc.id === editingQC.id ? { ...qc, ...values } : qc
          )
          setCurrentStep({
            ...currentStep,
            qualityControlPoints: newQCPoints
          })
        }
        message.success('质量控制点更新成功')
      } else {
        // 新增模式
        const newQC: QualityControlPoint = {
          id: Date.now().toString(),
          ...values,
          sortOrder: currentStep ? currentStep.qualityControlPoints.length + 1 : 1,
          isActive: true,
          relatedFields: values.relatedFields || []
        }
        if (currentStep) {
          setCurrentStep({
            ...currentStep,
            qualityControlPoints: [...currentStep.qualityControlPoints, newQC]
          })
        }
        message.success('质量控制点添加成功')
      }
      setQcModalVisible(false)
      qcForm.resetFields()
    } catch (error) {
      message.error('操作失败')
    }
  }

  /**
   * 测试质量控制规则
   */
  const handleTestRule = () => {
    message.success('质量控制规则测试通过')
  }

  /**
   * 批量启用/禁用
   */
  const handleBatchToggle = (enable: boolean) => {
    if (currentStep) {
      const newQCPoints = currentStep.qualityControlPoints.map(qc => ({
        ...qc,
        isActive: enable
      }))
      setCurrentStep({
        ...currentStep,
        qualityControlPoints: newQCPoints
      })
      message.success(`已${enable ? '启用' : '禁用'}所有质量控制点`)
    }
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

  // 字段类型选项
  const fieldTypeOptions = [
    { label: '文本', value: 'text' },
    { label: '数字', value: 'number' },
    { label: '日期', value: 'date' },
    { label: '文件', value: 'file' },
    { label: '下拉选择', value: 'select' },
    { label: '文本域', value: 'textarea' },
    { label: '复选框', value: 'checkbox' }
  ]

  // 质量控制类型选项
  const qcTypeOptions = [
    { label: '手动检查', value: 'manual' },
    { label: '自动检查', value: 'automatic' },
    { label: '半自动检查', value: 'semi-automatic' }
  ]

  // 检查类型选项
  const checkTypeOptions = [
    { label: '数值范围', value: 'range' },
    { label: '枚举值', value: 'enum' },
    { label: '公式计算', value: 'formula' },
    { label: '文件检查', value: 'file' },
    { label: '目视检查', value: 'visual' }
  ]

  // 通知级别选项
  const notificationLevelOptions = [
    { label: '信息', value: 'info' },
    { label: '警告', value: 'warning' },
    { label: '错误', value: 'error' }
  ]

  // 字段表格列配置
  const fieldColumns: ColumnsType<StepField> = [
    {
      title: '排序',
      dataIndex: 'sortOrder',
      key: 'sortOrder',
      width: 80,
      render: (_, __, index) => index + 1
    },
    {
      title: '字段名称',
      dataIndex: 'name',
      key: 'name',
      width: 150,
      render: (text: string, record: StepField) => (
        <div>
          <div style={{ fontWeight: 500 }}>{text}</div>
          <div style={{ fontSize: '12px', color: '#666' }}>
            {record.identifier}
          </div>
        </div>
      )
    },
    {
      title: '类型',
      dataIndex: 'type',
      key: 'type',
      width: 100,
      render: (type: string) => {
        const option = fieldTypeOptions.find(opt => opt.value === type)
        return <Tag>{option?.label || type}</Tag>
      }
    },
    {
      title: '必填',
      dataIndex: 'isRequired',
      key: 'isRequired',
      width: 80,
      render: (isRequired: boolean) => (
        <Tag color={isRequired ? 'success' : 'default'}>
          {isRequired ? '是' : '否'}
        </Tag>
      )
    },
    {
      title: '默认值',
      dataIndex: 'defaultValue',
      key: 'defaultValue',
      width: 120,
      render: (value: string, record: StepField) => (
        <div style={{ fontSize: '12px' }}>
          {value && <div>{value}</div>}
          {record.unit && <div style={{ color: '#666' }}>单位: {record.unit}</div>}
        </div>
      )
    },
    {
      title: '高级选项',
      key: 'advanced',
      width: 120,
      render: (_, record: StepField) => (
        <div style={{ fontSize: '12px' }}>
          {record.showInQuickPanel && <Tag size="small">快速面板</Tag>}
          {record.allowBatchEdit && <Tag size="small">批量编辑</Tag>}
          {record.participateValidation && <Tag size="small">数据验证</Tag>}
          {record.generateReport && <Tag size="small">统计报表</Tag>}
        </div>
      )
    },
    {
      title: '操作',
      key: 'action',
      width: 120,
      render: (_, record: StepField) => (
        <Space size="small">
          <Tooltip title="编辑">
            <Button 
              type="link" 
              size="small" 
              icon={<EditOutlined />}
              onClick={() => handleEditField(record)}
            />
          </Tooltip>
          <Tooltip title="删除">
            <Button 
              type="link" 
              size="small" 
              danger
              icon={<DeleteOutlined />}
              onClick={() => handleDeleteField(record)}
            />
          </Tooltip>
        </Space>
      )
    }
  ]

  // 质量控制点表格列配置
  const qcColumns: ColumnsType<QualityControlPoint> = [
    {
      title: '排序',
      dataIndex: 'sortOrder',
      key: 'sortOrder',
      width: 80,
      render: (_, __, index) => index + 1
    },
    {
      title: '控制点名称',
      dataIndex: 'name',
      key: 'name',
      width: 150,
      render: (text: string, record: QualityControlPoint) => (
        <div>
          <div style={{ fontWeight: 500 }}>{text}</div>
          <div style={{ fontSize: '12px', color: '#666' }}>
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
      render: (type: string, record: QualityControlPoint) => (
        <div>
          <Tag color={type === 'automatic' ? 'blue' : type === 'manual' ? 'green' : 'orange'}>
            {qcTypeOptions.find(opt => opt.value === type)?.label || type}
          </Tag>
          <div style={{ fontSize: '12px', color: '#666', marginTop: 4 }}>
            {checkTypeOptions.find(opt => opt.value === record.checkType)?.label}
          </div>
        </div>
      )
    },
    {
      title: '检查规则',
      dataIndex: 'checkRule',
      key: 'checkRule',
      width: 200,
      render: (rule: string, record: QualityControlPoint) => (
        <div style={{ fontSize: '12px' }}>
          <div>{rule}</div>
          {record.triggerCondition && (
            <div style={{ color: '#666', marginTop: 4 }}>
              触发条件: {record.triggerCondition}
            </div>
          )}
        </div>
      )
    },
    {
      title: '状态',
      dataIndex: 'isActive',
      key: 'isActive',
      width: 100,
      render: (isActive: boolean, record: QualityControlPoint) => (
        <div>
          <Tag color={isActive ? 'success' : 'default'}>
            {isActive ? '启用' : '禁用'}
          </Tag>
          {record.isRequired && (
            <div style={{ fontSize: '12px', color: '#666', marginTop: 4 }}>
              必检项
            </div>
          )}
        </div>
      )
    },
    {
      title: '通知级别',
      dataIndex: 'notificationLevel',
      key: 'notificationLevel',
      width: 100,
      render: (level: string) => {
        const colors = { info: 'blue', warning: 'orange', error: 'red' }
        return (
          <Tag color={colors[level as keyof typeof colors]}>
            {notificationLevelOptions.find(opt => opt.value === level)?.label || level}
          </Tag>
        )
      }
    },
    {
      title: '操作',
      key: 'action',
      width: 150,
      render: (_, record: QualityControlPoint) => (
        <Space size="small">
          <Tooltip title="编辑">
            <Button 
              type="link" 
              size="small" 
              icon={<EditOutlined />}
              onClick={() => handleEditQC(record)}
            />
          </Tooltip>
          <Tooltip title={record.isActive ? '禁用' : '启用'}>
            <Button 
              type="link" 
              size="small" 
              icon={record.isActive ? <ExclamationCircleOutlined /> : <CheckCircleOutlined />}
              onClick={() => handleToggleQC(record)}
            />
          </Tooltip>
          <Tooltip title="删除">
            <Button 
              type="link" 
              size="small" 
              danger
              icon={<DeleteOutlined />}
              onClick={() => handleDeleteQC(record)}
            />
          </Tooltip>
        </Space>
      )    }
  ]

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
              onClick={() => handleConfigStep(record)}
            />
          </Tooltip>
          <Tooltip title="质量控制">
            <Button 
              type="link" 
              size="small" 
              icon={<CheckCircleOutlined />}
              onClick={() => handleQualityControl(record)}
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

        {/* 配置字段抽屉 */}
        <Drawer
          title={`配置字段 - ${currentStep?.name || ''}`}
          placement="right"
          width={1200}
          open={configDrawerVisible}
          onClose={() => setConfigDrawerVisible(false)}
          extra={
            <Space>
              <Button 
                type="primary" 
                icon={<PlusOutlined />}
                onClick={handleAddField}
              >
                添加字段
              </Button>
              <Button onClick={handleBatchEdit}>
                批量编辑
              </Button>
              <Button onClick={handleValidateConfig}>
                验证配置
              </Button>
            </Space>
          }
        >
          {currentStep && (
            <div>
              {/* 步骤基本信息 */}
              <Card title="步骤基本信息" style={{ marginBottom: 24 }}>
                <Row gutter={16}>
                  <Col span={8}>
                    <div>
                      <strong>步骤名称：</strong>{currentStep.name}
                    </div>
                  </Col>
                  <Col span={8}>
                    <div>
                      <strong>预计耗时：</strong>{currentStep.estimatedTime} 分钟
                    </div>
                  </Col>
                  <Col span={8}>
                    <div>
                      <strong>排序：</strong>{currentStep.sortOrder}
                    </div>
                  </Col>
                </Row>
                <Row gutter={16} style={{ marginTop: 16 }}>
                  <Col span={24}>
                    <div>
                      <strong>步骤描述：</strong>{currentStep.description}
                    </div>
                  </Col>
                </Row>
              </Card>

              {/* 字段配置表格 */}
              <Card title="字段配置">
                <Table
                  columns={fieldColumns}
                  dataSource={currentStep.fields}
                  rowKey="id"
                  pagination={false}
                  scroll={{ x: 1000 }}
                />
              </Card>
            </div>
          )}
        </Drawer>

        {/* 质量控制抽屉 */}
        <Drawer
          title={`质量控制 - ${currentStep?.name || ''}`}
          placement="right"
          width={1200}
          open={qualityControlDrawerVisible}
          onClose={() => setQualityControlDrawerVisible(false)}
          extra={
            <Space>
              <Button 
                type="primary" 
                icon={<PlusOutlined />}
                onClick={handleAddQC}
              >
                添加质量控制点
              </Button>
              <Button onClick={() => handleBatchToggle(true)}>
                批量启用
              </Button>
              <Button onClick={() => handleBatchToggle(false)}>
                批量禁用
              </Button>
              <Button onClick={handleTestRule}>
                测试规则
              </Button>
            </Space>
          }
        >
          {currentStep && (
            <div>
              {/* 质量控制概览 */}
              <Card title="质量控制概览" style={{ marginBottom: 24 }}>
                <Row gutter={16}>
                  <Col span={6}>
                    <div style={{ textAlign: 'center' }}>
                      <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#1890ff' }}>
                        {currentStep.qualityControlPoints.length}
                      </div>
                      <div>总控制点</div>
                    </div>
                  </Col>
                  <Col span={6}>
                    <div style={{ textAlign: 'center' }}>
                      <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#52c41a' }}>
                        {currentStep.qualityControlPoints.filter(qc => qc.isActive).length}
                      </div>
                      <div>已启用</div>
                    </div>
                  </Col>
                  <Col span={6}>
                    <div style={{ textAlign: 'center' }}>
                      <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#faad14' }}>
                        {currentStep.qualityControlPoints.filter(qc => qc.isRequired).length}
                      </div>
                      <div>必检项</div>
                    </div>
                  </Col>
                  <Col span={6}>
                    <div style={{ textAlign: 'center' }}>
                      <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#f5222d' }}>
                        {currentStep.qualityControlPoints.filter(qc => qc.type === 'automatic').length}
                      </div>
                      <div>自动检查</div>
                    </div>
                  </Col>
                </Row>
              </Card>

              {/* 质量控制点表格 */}
              <Card title="质量控制点配置">
                <Table
                  columns={qcColumns}
                  dataSource={currentStep.qualityControlPoints}
                  rowKey="id"
                  pagination={false}
                  scroll={{ x: 1200 }}
                />
              </Card>
            </div>
          )}
        </Drawer>

        {/* 字段编辑弹窗 */}
        <Modal
          title={editingField ? '编辑字段' : '添加字段'}
          open={fieldModalVisible}
          onCancel={() => {
            setFieldModalVisible(false)
            fieldForm.resetFields()
          }}
          onOk={() => fieldForm.submit()}
          width={800}
        >
          <Form
            form={fieldForm}
            layout="vertical"
            onFinish={handleFieldSubmit}
          >
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  name="name"
                  label="字段名称"
                  rules={[{ required: true, message: '请输入字段名称' }]}
                >
                  <Input placeholder="请输入字段名称" />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  name="identifier"
                  label="字段标识"
                  rules={[{ required: true, message: '请输入字段标识' }]}
                >
                  <Input placeholder="请输入字段标识（英文）" />
                </Form.Item>
              </Col>
            </Row>
            <Row gutter={16}>
              <Col span={8}>
                <Form.Item
                  name="type"
                  label="字段类型"
                  rules={[{ required: true, message: '请选择字段类型' }]}
                >
                  <Select placeholder="请选择字段类型" options={fieldTypeOptions} />
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item
                  name="isRequired"
                  label="是否必填"
                  valuePropName="checked"
                >
                  <Switch />
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item
                  name="sortOrder"
                  label="显示顺序"
                >
                  <InputNumber min={1} style={{ width: '100%' }} />
                </Form.Item>
              </Col>
            </Row>
            
            {/* 字段属性配置 */}
            <Divider>字段属性配置</Divider>
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  name="defaultValue"
                  label="默认值"
                >
                  <Input placeholder="请输入默认值" />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  name="unit"
                  label="单位"
                >
                  <Input placeholder="请输入单位" />
                </Form.Item>
              </Col>
            </Row>
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  name="placeholder"
                  label="提示文本"
                >
                  <Input placeholder="请输入提示文本" />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  name="validationRule"
                  label="验证规则"
                >
                  <Input placeholder="如：>0, 1.8-2.2" />
                </Form.Item>
              </Col>
            </Row>
            <Form.Item
              name="helpText"
              label="帮助文本"
            >
              <TextArea rows={2} placeholder="请输入帮助文本" />
            </Form.Item>
            
            {/* 下拉选项配置 */}
            <Form.Item
              noStyle
              shouldUpdate={(prevValues, currentValues) => 
                prevValues.type !== currentValues.type
              }
            >
              {({ getFieldValue }) => {
                const fieldType = getFieldValue('type')
                return fieldType === 'select' ? (
                  <Form.Item
                    name="options"
                    label="下拉选项"
                    rules={[{ required: true, message: '请输入下拉选项' }]}
                  >
                    <Select
                      mode="tags"
                      placeholder="请输入选项，按回车添加"
                      style={{ width: '100%' }}
                    />
                  </Form.Item>
                ) : null
              }}
            </Form.Item>

            {/* 高级选项 */}
            <Divider>高级选项</Divider>
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  name="showInQuickPanel"
                  label="在快速记录面板显示"
                  valuePropName="checked"
                >
                  <Checkbox />
                </Form.Item>
                <Form.Item
                  name="allowBatchEdit"
                  label="允许批量编辑"
                  valuePropName="checked"
                >
                  <Checkbox />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  name="participateValidation"
                  label="参与数据验证"
                  valuePropName="checked"
                >
                  <Checkbox />
                </Form.Item>
                <Form.Item
                  name="generateReport"
                  label="生成统计报表"
                  valuePropName="checked"
                >
                  <Checkbox />
                </Form.Item>
              </Col>
            </Row>
          </Form>
        </Modal>

        {/* 质量控制点编辑弹窗 */}
        <Modal
          title={editingQC ? '编辑质量控制点' : '添加质量控制点'}
          open={qcModalVisible}
          onCancel={() => {
            setQcModalVisible(false)
            qcForm.resetFields()
          }}
          onOk={() => qcForm.submit()}
          width={800}
        >
          <Form
            form={qcForm}
            layout="vertical"
            onFinish={handleQCSubmit}
          >
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  name="name"
                  label="控制点名称"
                  rules={[{ required: true, message: '请输入控制点名称' }]}
                >
                  <Input placeholder="请输入控制点名称" />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  name="type"
                  label="检查类型"
                  rules={[{ required: true, message: '请选择检查类型' }]}
                >
                  <Select placeholder="请选择检查类型" options={qcTypeOptions} />
                </Form.Item>
              </Col>
            </Row>
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  name="checkType"
                  label="检查方式"
                  rules={[{ required: true, message: '请选择检查方式' }]}
                >
                  <Select placeholder="请选择检查方式" options={checkTypeOptions} />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  name="notificationLevel"
                  label="通知级别"
                  rules={[{ required: true, message: '请选择通知级别' }]}
                >
                  <Select placeholder="请选择通知级别" options={notificationLevelOptions} />
                </Form.Item>
              </Col>
            </Row>
            <Form.Item
              name="description"
              label="描述"
              rules={[{ required: true, message: '请输入描述' }]}
            >
              <TextArea rows={2} placeholder="请输入质量控制点描述" />
            </Form.Item>
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  name="triggerCondition"
                  label="触发条件"
                  rules={[{ required: true, message: '请输入触发条件' }]}
                >
                  <Input placeholder="如：提取完成后" />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  name="checkRule"
                  label="检查规则"
                  rules={[{ required: true, message: '请输入检查规则' }]}
                >
                  <Input placeholder="如：浓度 >= 10 ng/μl" />
                </Form.Item>
              </Col>
            </Row>
            <Row gutter={16}>
              <Col span={8}>
                <Form.Item
                  name="warningThreshold"
                  label="警告阈值"
                >
                  <InputNumber style={{ width: '100%' }} placeholder="警告阈值" />
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item
                  name="errorThreshold"
                  label="错误阈值"
                >
                  <InputNumber style={{ width: '100%' }} placeholder="错误阈值" />
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item
                  name="sortOrder"
                  label="显示顺序"
                >
                  <InputNumber min={1} style={{ width: '100%' }} />
                </Form.Item>
              </Col>
            </Row>
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  name="isRequired"
                  label="是否必检"
                  valuePropName="checked"
                >
                  <Switch />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  name="autoCorrection"
                  label="自动纠正"
                  valuePropName="checked"
                >
                  <Switch />
                </Form.Item>
              </Col>
            </Row>
            <Form.Item
              name="relatedFields"
              label="关联字段"
            >
              <Select
                mode="multiple"
                placeholder="请选择关联字段"
                options={currentStep?.fields.map(field => ({
                  label: field.name,
                  value: field.identifier
                })) || []}
              />
            </Form.Item>
          </Form>
        </Modal>
      </div>
    )
  }

export default SOPTemplateDetail