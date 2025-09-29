import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  Card,
  Form,
  Input,
  Select,
  Button,
  Space,
  Table,
  Tag,
  Modal,
  message,
  Row,
  Col,
  Switch,
  Upload,
  Tooltip,
  InputNumber,
  Checkbox,
  Divider
} from 'antd'
import {
  ArrowLeftOutlined,
  SaveOutlined,
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  UploadOutlined,
  FileTextOutlined,
  SettingOutlined
} from '@ant-design/icons'
import type { ColumnsType } from 'antd/es/table'

const { Option } = Select
const { TextArea } = Input

/**
 * 字段数据接口
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
 * 步骤详情数据接口
 */
interface StepDetail {
  id: string
  name: string
  description: string
  estimatedTime: number
  sortOrder: number
  hasQualityControl: boolean
  sopDocument?: string
  fields: StepField[]
}

/**
 * 步骤字段配置界面组件
 * 提供步骤基本信息编辑和字段配置功能
 */
const SOPStepConfig: React.FC = () => {
  const { stepId } = useParams<{ stepId: string }>()
  const navigate = useNavigate()
  
  // 状态管理
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [stepData, setStepData] = useState<StepDetail | null>(null)
  const [fieldModalVisible, setFieldModalVisible] = useState(false)
  const [editingField, setEditingField] = useState<StepField | null>(null)
  const [form] = Form.useForm()
  const [fieldForm] = Form.useForm()

  /**
   * 初始化数据
   */
  useEffect(() => {
    if (stepId) {
      loadStepDetail(stepId)
    }
  }, [stepId])

  /**
   * 加载步骤详情
   * @param id 步骤ID
   */
  const loadStepDetail = async (id: string) => {
    setLoading(true)
    try {
      // 模拟数据
      const mockData: StepDetail = {
        id,
        name: '核酸提取',
        description: '从样本中提取高质量的核酸，确保后续实验的成功进行',
        estimatedTime: 90,
        sortOrder: 2,
        hasQualityControl: true,
        sopDocument: 'SOP-DNA-001.pdf',
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
            name: '试剂盒',
            identifier: 'reagent_kit',
            type: 'select',
            isRequired: true,
            options: ['QIAamp DNA Mini Kit', 'DNeasy Blood & Tissue Kit', 'MagMAX DNA Multi-Sample Kit'],
            placeholder: '请选择使用的试剂盒',
            sortOrder: 3,
            showInQuickPanel: false,
            allowBatchEdit: true,
            participateValidation: true,
            generateReport: true
          },
          {
            id: '4',
            name: '样本浓度',
            identifier: 'concentration',
            type: 'number',
            isRequired: true,
            unit: 'ng/μl',
            placeholder: '请输入样本浓度',
            validationRule: '>0',
            sortOrder: 4,
            showInQuickPanel: true,
            allowBatchEdit: false,
            participateValidation: true,
            generateReport: true
          },
          {
            id: '5',
            name: '260/280',
            identifier: 'ratio_260_280',
            type: 'number',
            isRequired: true,
            placeholder: '请输入260/280比值',
            validationRule: '1.8-2.2',
            sortOrder: 5,
            showInQuickPanel: true,
            allowBatchEdit: false,
            participateValidation: true,
            generateReport: true
          },
          {
            id: '6',
            name: '体积',
            identifier: 'volume',
            type: 'number',
            isRequired: true,
            defaultValue: '50',
            unit: 'μl',
            placeholder: '请输入体积',
            sortOrder: 6,
            showInQuickPanel: false,
            allowBatchEdit: true,
            participateValidation: false,
            generateReport: true
          },
          {
            id: '7',
            name: '裂解时间',
            identifier: 'lysis_time',
            type: 'number',
            isRequired: true,
            defaultValue: '30',
            unit: '分钟',
            placeholder: '请输入裂解时间',
            sortOrder: 7,
            showInQuickPanel: false,
            allowBatchEdit: true,
            participateValidation: false,
            generateReport: false
          },
          {
            id: '8',
            name: '温度',
            identifier: 'temperature',
            type: 'number',
            isRequired: true,
            defaultValue: '56',
            unit: '°C',
            placeholder: '请输入温度',
            sortOrder: 8,
            showInQuickPanel: false,
            allowBatchEdit: true,
            participateValidation: false,
            generateReport: false
          },
          {
            id: '9',
            name: '电泳图',
            identifier: 'electrophoresis_image',
            type: 'file',
            isRequired: false,
            placeholder: '请上传电泳图',
            helpText: '支持JPG、PNG、PDF格式',
            sortOrder: 9,
            showInQuickPanel: false,
            allowBatchEdit: false,
            participateValidation: false,
            generateReport: true
          },
          {
            id: '10',
            name: '备注',
            identifier: 'remarks',
            type: 'textarea',
            isRequired: false,
            placeholder: '请输入备注信息',
            sortOrder: 10,
            showInQuickPanel: false,
            allowBatchEdit: false,
            participateValidation: false,
            generateReport: true
          }
        ]
      }
      setStepData(mockData)
      
      // 设置表单初始值
      form.setFieldsValue({
        name: mockData.name,
        description: mockData.description,
        estimatedTime: mockData.estimatedTime,
        sortOrder: mockData.sortOrder,
        hasQualityControl: mockData.hasQualityControl
      })
    } catch (error) {
      message.error('加载步骤详情失败')
    } finally {
      setLoading(false)
    }
  }

  /**
   * 返回上一页
   */
  const handleBack = () => {
    navigate(-1)
  }

  /**
   * 保存步骤信息
   * @param values 表单值
   */
  const handleSave = async (values: any) => {
    setSaving(true)
    try {
      // 这里应该调用保存API
      message.success('步骤配置保存成功')
      // 更新本地数据
      if (stepData) {
        setStepData({
          ...stepData,
          ...values
        })
      }
    } catch (error) {
      message.error('保存失败')
    } finally {
      setSaving(false)
    }
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
        if (stepData) {
          const newFields = stepData.fields.filter(f => f.id !== field.id)
          setStepData({
            ...stepData,
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
        if (stepData) {
          const newFields = stepData.fields.map(field =>
            field.id === editingField.id ? { ...field, ...values } : field
          )
          setStepData({
            ...stepData,
            fields: newFields
          })
        }
        message.success('字段更新成功')
      } else {
        // 新增模式
        const newField: StepField = {
          id: Date.now().toString(),
          ...values,
          sortOrder: stepData ? stepData.fields.length + 1 : 1,
          showInQuickPanel: false,
          allowBatchEdit: false,
          participateValidation: false,
          generateReport: false
        }
        if (stepData) {
          setStepData({
            ...stepData,
            fields: [...stepData.fields, newField]
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

  if (loading) {
    return <div style={{ padding: '24px', textAlign: 'center' }}>加载中...</div>
  }

  if (!stepData) {
    return <div style={{ padding: '24px', textAlign: 'center' }}>步骤不存在</div>
  }

  return (
    <div style={{ padding: '24px' }}>
      {/* 页面标题和操作按钮 */}
      <Row justify="space-between" align="middle" style={{ marginBottom: 24 }}>
        <Col>
          <Space>
            <Button icon={<ArrowLeftOutlined />} onClick={handleBack}>
              返回
            </Button>
            <h2 style={{ margin: 0 }}>
              步骤字段配置 - {stepData.name}
            </h2>
          </Space>
        </Col>
        <Col>
          <Space>
            <Button 
              type="primary" 
              icon={<SaveOutlined />}
              loading={saving}
              onClick={() => form.submit()}
            >
              保存
            </Button>
          </Space>
        </Col>
      </Row>

      {/* 步骤基本信息 */}
      <Card title="步骤基本信息" style={{ marginBottom: 24 }}>
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSave}
        >
          <Row gutter={16}>
            <Col span={8}>
              <Form.Item
                name="name"
                label="步骤名称"
                rules={[{ required: true, message: '请输入步骤名称' }]}
              >
                <Input placeholder="请输入步骤名称" />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                name="estimatedTime"
                label="预计耗时（分钟）"
                rules={[{ required: true, message: '请输入预计耗时' }]}
              >
                <InputNumber 
                  min={1} 
                  style={{ width: '100%' }} 
                  placeholder="请输入预计耗时" 
                />
              </Form.Item>
            </Col>
            <Col span={4}>
              <Form.Item
                name="sortOrder"
                label="排序"
                rules={[{ required: true, message: '请输入排序' }]}
              >
                <InputNumber 
                  min={1} 
                  style={{ width: '100%' }} 
                  placeholder="排序" 
                />
              </Form.Item>
            </Col>
            <Col span={4}>
              <Form.Item
                name="hasQualityControl"
                label="质量控制点"
                valuePropName="checked"
              >
                <Switch />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={16}>
              <Form.Item
                name="description"
                label="步骤描述"
                rules={[{ required: true, message: '请输入步骤描述' }]}
              >
                <TextArea rows={3} placeholder="请输入步骤描述" />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item label="SOP参考文档">
                <Upload>
                  <Button icon={<UploadOutlined />}>选择文件</Button>
                </Upload>
                {stepData.sopDocument && (
                  <div style={{ marginTop: 8 }}>
                    <FileTextOutlined /> {stepData.sopDocument}
                  </div>
                )}
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </Card>

      {/* 字段配置 */}
      <Card 
        title="字段配置"
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
        <Table
          columns={fieldColumns}
          dataSource={stepData.fields}
          rowKey="id"
          pagination={false}
          scroll={{ x: 1000 }}
        />
      </Card>

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
    </div>
  )
}

export default SOPStepConfig