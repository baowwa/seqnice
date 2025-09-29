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
  InputNumber,
  Checkbox,
  Divider,
  Tooltip,
  Alert,
  Progress
} from 'antd'
import {
  ArrowLeftOutlined,
  SaveOutlined,
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  CheckCircleOutlined,
  ExclamationCircleOutlined,
  WarningOutlined,
  SettingOutlined
} from '@ant-design/icons'
import type { ColumnsType } from 'antd/es/table'

const { Option } = Select
const { TextArea } = Input

/**
 * 质量控制点数据接口
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
 * 步骤质量控制配置数据接口
 */
interface StepQualityControl {
  stepId: string
  stepName: string
  description: string
  qualityControlPoints: QualityControlPoint[]
  overallPassRate: number
  lastUpdateTime: string
}

/**
 * 质量控制点配置组件
 * 提供质量控制点的管理和配置功能
 */
const SOPQualityControl: React.FC = () => {
  const { stepId } = useParams<{ stepId: string }>()
  const navigate = useNavigate()
  
  // 状态管理
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [qualityControlData, setQualityControlData] = useState<StepQualityControl | null>(null)
  const [qcModalVisible, setQcModalVisible] = useState(false)
  const [editingQC, setEditingQC] = useState<QualityControlPoint | null>(null)
  const [form] = Form.useForm()
  const [qcForm] = Form.useForm()

  /**
   * 初始化数据
   */
  useEffect(() => {
    if (stepId) {
      loadQualityControlData(stepId)
    }
  }, [stepId])

  /**
   * 加载质量控制数据
   * @param id 步骤ID
   */
  const loadQualityControlData = async (id: string) => {
    setLoading(true)
    try {
      // 模拟数据
      const mockData: StepQualityControl = {
        stepId: id,
        stepName: '核酸提取',
        description: '核酸提取步骤的质量控制配置',
        overallPassRate: 95.8,
        lastUpdateTime: '2024-01-15 14:30:00',
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
          },
          {
            id: '3',
            name: '体积确认',
            type: 'manual',
            checkType: 'visual',
            description: '目视确认提取后的核酸体积',
            isRequired: true,
            triggerCondition: '提取完成后',
            checkRule: '体积 >= 预期体积的80%',
            autoCorrection: false,
            notificationLevel: 'warning',
            relatedFields: ['volume'],
            sortOrder: 3,
            isActive: true
          },
          {
            id: '4',
            name: '电泳质量检查',
            type: 'semi-automatic',
            checkType: 'file',
            description: '通过电泳图检查核酸完整性',
            isRequired: false,
            triggerCondition: '需要时',
            checkRule: '主带清晰，无明显降解',
            autoCorrection: false,
            notificationLevel: 'info',
            relatedFields: ['electrophoresis_image'],
            sortOrder: 4,
            isActive: true
          },
          {
            id: '5',
            name: '试剂有效期检查',
            type: 'automatic',
            checkType: 'formula',
            description: '检查使用的试剂是否在有效期内',
            isRequired: true,
            triggerCondition: '实验开始前',
            checkRule: '当前日期 <= 试剂有效期',
            autoCorrection: false,
            notificationLevel: 'error',
            relatedFields: ['reagent_kit'],
            sortOrder: 5,
            isActive: true
          }
        ]
      }
      setQualityControlData(mockData)
    } catch (error) {
      message.error('加载质量控制配置失败')
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
   * 保存质量控制配置
   */
  const handleSave = async () => {
    setSaving(true)
    try {
      // 这里应该调用保存API
      message.success('质量控制配置保存成功')
    } catch (error) {
      message.error('保存失败')
    } finally {
      setSaving(false)
    }
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
        if (qualityControlData) {
          const newQCPoints = qualityControlData.qualityControlPoints.filter(q => q.id !== qc.id)
          setQualityControlData({
            ...qualityControlData,
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
    if (qualityControlData) {
      const newQCPoints = qualityControlData.qualityControlPoints.map(q =>
        q.id === qc.id ? { ...q, isActive: !q.isActive } : q
      )
      setQualityControlData({
        ...qualityControlData,
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
        if (qualityControlData) {
          const newQCPoints = qualityControlData.qualityControlPoints.map(qc =>
            qc.id === editingQC.id ? { ...qc, ...values } : qc
          )
          setQualityControlData({
            ...qualityControlData,
            qualityControlPoints: newQCPoints
          })
        }
        message.success('质量控制点更新成功')
      } else {
        // 新增模式
        const newQC: QualityControlPoint = {
          id: Date.now().toString(),
          ...values,
          sortOrder: qualityControlData ? qualityControlData.qualityControlPoints.length + 1 : 1,
          isActive: true,
          relatedFields: values.relatedFields || []
        }
        if (qualityControlData) {
          setQualityControlData({
            ...qualityControlData,
            qualityControlPoints: [...qualityControlData.qualityControlPoints, newQC]
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
    if (qualityControlData) {
      const newQCPoints = qualityControlData.qualityControlPoints.map(qc => ({
        ...qc,
        isActive: enable
      }))
      setQualityControlData({
        ...qualityControlData,
        qualityControlPoints: newQCPoints
      })
      message.success(`已${enable ? '启用' : '禁用'}所有质量控制点`)
    }
  }

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
            {qcTypeOptions.find(opt => opt.value === type)?.label}
          </Tag>
          <div style={{ fontSize: '12px', marginTop: 4 }}>
            <Tag size="small">
              {checkTypeOptions.find(opt => opt.value === record.checkType)?.label}
            </Tag>
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
      title: '阈值设置',
      key: 'threshold',
      width: 120,
      render: (_, record: QualityControlPoint) => (
        <div style={{ fontSize: '12px' }}>
          {record.warningThreshold && (
            <div style={{ color: '#faad14' }}>
              <WarningOutlined /> 警告: {record.warningThreshold}
            </div>
          )}
          {record.errorThreshold && (
            <div style={{ color: '#ff4d4f' }}>
              <ExclamationCircleOutlined /> 错误: {record.errorThreshold}
            </div>
          )}
        </div>
      )
    },
    {
      title: '状态',
      key: 'status',
      width: 100,
      render: (_, record: QualityControlPoint) => (
        <div>
          <Tag color={record.isActive ? 'success' : 'default'}>
            {record.isActive ? '启用' : '禁用'}
          </Tag>
          {record.isRequired && (
            <Tag size="small" color="red">必需</Tag>
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
            {notificationLevelOptions.find(opt => opt.value === level)?.label}
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
              icon={<SettingOutlined />}
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
      )
    }
  ]

  if (loading) {
    return <div style={{ padding: '24px', textAlign: 'center' }}>加载中...</div>
  }

  if (!qualityControlData) {
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
              质量控制点配置 - {qualityControlData.stepName}
            </h2>
          </Space>
        </Col>
        <Col>
          <Space>
            <Button onClick={handleTestRule}>
              测试规则
            </Button>
            <Button 
              type="primary" 
              icon={<SaveOutlined />}
              loading={saving}
              onClick={handleSave}
            >
              保存配置
            </Button>
          </Space>
        </Col>
      </Row>

      {/* 质量控制概览 */}
      <Card title="质量控制概览" style={{ marginBottom: 24 }}>
        <Row gutter={24}>
          <Col span={8}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#52c41a' }}>
                {qualityControlData.overallPassRate}%
              </div>
              <div style={{ color: '#666' }}>整体通过率</div>
              <Progress 
                percent={qualityControlData.overallPassRate} 
                showInfo={false}
                strokeColor="#52c41a"
                style={{ marginTop: 8 }}
              />
            </div>
          </Col>
          <Col span={8}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#1890ff' }}>
                {qualityControlData.qualityControlPoints.filter(qc => qc.isActive).length}
              </div>
              <div style={{ color: '#666' }}>启用的控制点</div>
            </div>
          </Col>
          <Col span={8}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#faad14' }}>
                {qualityControlData.qualityControlPoints.filter(qc => qc.isRequired).length}
              </div>
              <div style={{ color: '#666' }}>必需控制点</div>
            </div>
          </Col>
        </Row>
        <Divider />
        <Alert
          message="质量控制配置说明"
          description={`最后更新时间: ${qualityControlData.lastUpdateTime}。质量控制点按照设定的规则自动或手动检查实验数据，确保实验质量符合标准。`}
          type="info"
          showIcon
        />
      </Card>

      {/* 质量控制点配置 */}
      <Card 
        title="质量控制点配置"
        extra={
          <Space>
            <Button 
              type="primary" 
              icon={<PlusOutlined />}
              onClick={handleAddQC}
            >
              添加控制点
            </Button>
            <Button onClick={() => handleBatchToggle(true)}>
              批量启用
            </Button>
            <Button onClick={() => handleBatchToggle(false)}>
              批量禁用
            </Button>
          </Space>
        }
      >
        <Table
          columns={qcColumns}
          dataSource={qualityControlData.qualityControlPoints}
          rowKey="id"
          pagination={false}
          scroll={{ x: 1200 }}
        />
      </Card>

      {/* 质量控制点编辑弹窗 */}
      <Modal
        title={editingQC ? '编辑质量控制点' : '添加质量控制点'}
        open={qcModalVisible}
        onCancel={() => {
          setQcModalVisible(false)
          qcForm.resetFields()
        }}
        onOk={() => qcForm.submit()}
        width={900}
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
            <TextArea rows={2} placeholder="请输入控制点描述" />
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
                label="排序"
              >
                <InputNumber min={1} style={{ width: '100%' }} placeholder="排序" />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={8}>
              <Form.Item
                name="isRequired"
                label="是否必需"
                valuePropName="checked"
              >
                <Switch />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                name="autoCorrection"
                label="自动纠正"
                valuePropName="checked"
              >
                <Switch />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                name="isActive"
                label="启用状态"
                valuePropName="checked"
                initialValue={true}
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
              mode="tags"
              placeholder="请选择关联的字段"
              style={{ width: '100%' }}
            />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  )
}

export default SOPQualityControl