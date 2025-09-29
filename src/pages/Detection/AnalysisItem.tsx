import React, { useState } from 'react'
import { 
  Table, 
  Button, 
  Modal, 
  Form, 
  Input, 
  Select, 
  Space, 
  Popconfirm, 
  message, 
  Card, 
  Tag, 
  Tooltip,
  InputNumber,
  Switch,
  Drawer,
  Descriptions,
  Divider,
  Badge,
  List,
  Typography
} from 'antd'
import { 
  PlusOutlined, 
  EditOutlined, 
  DeleteOutlined, 
  SearchOutlined,
  ExclamationCircleOutlined,
  EyeOutlined,
  FileTextOutlined,
  ExperimentOutlined
} from '@ant-design/icons'

const { Option } = Select
const { TextArea } = Input
const { Text } = Typography

/**
 * 分析项目接口定义
 */
interface AnalysisItem {
  id: string
  name: string
  code: string
  testItemId: string
  testItemName: string
  category: string
  type: 'quantitative' | 'qualitative' | 'semi-quantitative'
  unit?: string
  referenceRange?: string
  normalValue?: string
  abnormalCriteria?: string
  clinicalSignificance: string
  methodologyId: string
  methodologyName: string
  sampleType: string[]
  reportOrder: number
  isActive: boolean
  isRequired: boolean
  description?: string
  // 新增字段
  status: 'active' | 'pending' | 'inactive'
  reportConfiguration?: {
    template: string
    format: 'pdf' | 'word' | 'html'
    includeGraphs: boolean
    includeInterpretation: boolean
  }
  qualityControl?: {
    cvRequirement: number
    accuracyRequirement: number
    precisionRequirement: number
  }
  associatedDiseases?: string[]
  interpretationRules?: {
    condition: string
    interpretation: string
    recommendation: string
  }[]
  createdAt: string
  updatedAt: string
}

/**
 * 分析项目管理组件
 * 提供分析项目的增删改查功能
 */
const AnalysisItemManagement: React.FC = () => {
  // 模拟数据
  const [analysisItems, setAnalysisItems] = useState<AnalysisItem[]>([
    {
      id: '1',
      name: 'EGFR基因突变检测',
      code: 'EGFR_MUT',
      testItemId: '1',
      testItemName: '肺癌基因检测',
      category: '基因突变',
      type: 'qualitative',
      referenceRange: '野生型',
      normalValue: '未检出突变',
      abnormalCriteria: '检出突变',
      clinicalSignificance: '用于指导靶向治疗药物选择，EGFR突变阳性患者可使用吉非替尼、厄洛替尼等靶向药物',
      methodologyId: '1',
      methodologyName: 'NGS测序',
      sampleType: ['血液', '组织'],
      reportOrder: 1,
      isActive: true,
      isRequired: true,
      description: 'EGFR基因19、21外显子突变检测',
      status: 'active',
      reportConfiguration: {
        template: 'EGFR突变检测报告模板v2.1',
        format: 'pdf',
        includeGraphs: true,
        includeInterpretation: true
      },
      qualityControl: {
        cvRequirement: 15,
        accuracyRequirement: 95,
        precisionRequirement: 90
      },
      associatedDiseases: ['非小细胞肺癌', '肺腺癌'],
      interpretationRules: [
        {
          condition: '检出19外显子缺失突变',
          interpretation: 'EGFR敏感突变阳性',
          recommendation: '建议使用EGFR-TKI靶向治疗'
        },
        {
          condition: '检出21外显子L858R突变',
          interpretation: 'EGFR敏感突变阳性',
          recommendation: '建议使用EGFR-TKI靶向治疗'
        }
      ],
      createdAt: '2024-01-15',
      updatedAt: '2024-01-15'
    },
    {
      id: '2',
      name: 'KRAS基因突变检测',
      code: 'KRAS_MUT',
      testItemId: '1',
      testItemName: '肺癌基因检测',
      category: '基因突变',
      type: 'qualitative',
      referenceRange: '野生型',
      normalValue: '未检出突变',
      abnormalCriteria: '检出突变',
      clinicalSignificance: '用于预测治疗反应性，KRAS突变患者对EGFR-TKI治疗耐药',
      methodologyId: '1',
      methodologyName: 'NGS测序',
      sampleType: ['血液', '组织'],
      reportOrder: 2,
      isActive: true,
      isRequired: false,
      description: 'KRAS基因2、3、4外显子突变检测',
      status: 'active',
      reportConfiguration: {
        template: 'KRAS突变检测报告模板v1.3',
        format: 'pdf',
        includeGraphs: false,
        includeInterpretation: true
      },
      qualityControl: {
        cvRequirement: 20,
        accuracyRequirement: 92,
        precisionRequirement: 88
      },
      associatedDiseases: ['非小细胞肺癌', '结直肠癌'],
      interpretationRules: [
        {
          condition: '检出KRAS突变',
          interpretation: 'KRAS突变阳性',
          recommendation: '不建议使用EGFR-TKI治疗，考虑化疗或免疫治疗'
        }
      ],
      createdAt: '2024-01-15',
      updatedAt: '2024-01-15'
    },
    {
      id: '3',
      name: 'HER2基因扩增检测',
      code: 'HER2_AMP',
      testItemId: '2',
      testItemName: '乳腺癌基因检测',
      category: '基因扩增',
      type: 'quantitative',
      unit: '拷贝数',
      referenceRange: '<2.0',
      normalValue: '<2.0',
      abnormalCriteria: '≥2.0',
      clinicalSignificance: '用于HER2靶向治疗指导，HER2扩增阳性患者可使用曲妥珠单抗等靶向药物',
      methodologyId: '2',
      methodologyName: 'qPCR',
      sampleType: ['组织'],
      reportOrder: 1,
      isActive: true,
      isRequired: true,
      description: 'HER2基因拷贝数检测',
      status: 'active',
      reportConfiguration: {
        template: 'HER2扩增检测报告模板v1.8',
        format: 'pdf',
        includeGraphs: true,
        includeInterpretation: true
      },
      qualityControl: {
        cvRequirement: 10,
        accuracyRequirement: 98,
        precisionRequirement: 95
      },
      associatedDiseases: ['乳腺癌', '胃癌'],
      interpretationRules: [
        {
          condition: 'HER2拷贝数≥2.0',
          interpretation: 'HER2扩增阳性',
          recommendation: '建议使用HER2靶向治疗药物'
        }
      ],
      createdAt: '2024-01-16',
      updatedAt: '2024-01-16'
    },
    {
      id: '4',
      name: 'MSI微卫星不稳定性',
      code: 'MSI_STATUS',
      testItemId: '3',
      testItemName: '结直肠癌基因检测',
      category: '微卫星',
      type: 'qualitative',
      referenceRange: 'MSS',
      normalValue: 'MSS（微卫星稳定）',
      abnormalCriteria: 'MSI-H（高度不稳定）',
      clinicalSignificance: '用于免疫治疗疗效预测，MSI-H患者对PD-1/PD-L1抑制剂治疗敏感',
      methodologyId: '1',
      methodologyName: 'NGS测序',
      sampleType: ['组织'],
      reportOrder: 1,
      isActive: true,
      isRequired: true,
      description: '5个微卫星位点不稳定性检测',
      status: 'active',
      reportConfiguration: {
        template: 'MSI检测报告模板v2.0',
        format: 'pdf',
        includeGraphs: true,
        includeInterpretation: true
      },
      qualityControl: {
        cvRequirement: 5,
        accuracyRequirement: 99,
        precisionRequirement: 98
      },
      associatedDiseases: ['结直肠癌', '子宫内膜癌', '胃癌'],
      interpretationRules: [
        {
          condition: 'MSI-H',
          interpretation: '微卫星高度不稳定',
          recommendation: '建议使用PD-1/PD-L1抑制剂免疫治疗'
        }
      ],
      createdAt: '2024-01-17',
      updatedAt: '2024-01-17'
    }
  ])

  const [isModalVisible, setIsModalVisible] = useState(false)
  const [editingItem, setEditingItem] = useState<AnalysisItem | null>(null)
  const [form] = Form.useForm()
  const [searchText, setSearchText] = useState('')
  const [detailVisible, setDetailVisible] = useState(false)
  const [viewingItem, setViewingItem] = useState<AnalysisItem | null>(null)

  /**
   * 显示添加/编辑模态框
   * @param item - 要编辑的分析项目，为空时表示添加
   */
  const showModal = (item?: AnalysisItem) => {
    setEditingItem(item || null)
    if (item) {
      form.setFieldsValue(item)
    } else {
      form.resetFields()
    }
    setIsModalVisible(true)
  }

  /**
   * 处理表单提交
   * @param values - 表单数据
   */
  const handleSubmit = (values: any) => {
    if (editingItem) {
      // 编辑
      setAnalysisItems(prev => prev.map(item => 
        item.id === editingItem.id 
          ? { ...item, ...values, updatedAt: new Date().toISOString().split('T')[0] }
          : item
      ))
      message.success('分析项目更新成功')
    } else {
      // 添加
      const newItem: AnalysisItem = {
        ...values,
        id: Date.now().toString(),
        createdAt: new Date().toISOString().split('T')[0],
        updatedAt: new Date().toISOString().split('T')[0]
      }
      setAnalysisItems(prev => [...prev, newItem])
      message.success('分析项目添加成功')
    }
    setIsModalVisible(false)
    form.resetFields()
  }

  /**
   * 查看详情
   * @param item - 要查看的分析项目
   */
  const handleViewDetail = (item: AnalysisItem) => {
    setViewingItem(item)
    setDetailVisible(true)
  }

  /**
   * 获取状态标签配置
   * @param status - 状态值
   */
  const getStatusConfig = (status: string) => {
    const statusMap = {
      'active': { text: '有效', color: 'green' },
      'pending': { text: '待审', color: 'orange' },
      'inactive': { text: '停用', color: 'red' }
    }
    return statusMap[status as keyof typeof statusMap] || { text: status, color: 'default' }
  }

  /**
   * 获取关联疾病显示文本
   * @param diseases - 疾病数组
   */
  const getDiseaseNames = (diseases?: string[]) => {
    if (!diseases || diseases.length === 0) return '无'
    return diseases.slice(0, 2).join('、') + (diseases.length > 2 ? '等' : '')
  }

  // 过滤数据
  const filteredItems = analysisItems.filter(item =>
    item.name.toLowerCase().includes(searchText.toLowerCase()) ||
    item.code.toLowerCase().includes(searchText.toLowerCase()) ||
    item.testItemName.toLowerCase().includes(searchText.toLowerCase())
  )

  /**
   * 删除分析项目
   * @param id - 分析项目ID
   */
  const handleDelete = (id: string) => {
    setAnalysisItems(prev => prev.filter(item => item.id !== id))
    message.success('分析项目删除成功')
  }

  // 表格列定义
  const columns = [
    {
      title: '项目名称',
      dataIndex: 'name',
      key: 'name',
      width: 200,
      render: (text: string, record: AnalysisItem) => (
        <div>
          <div style={{ fontWeight: 'bold' }}>{text}</div>
          <div style={{ fontSize: '12px', color: '#666' }}>{record.code}</div>
        </div>
      )
    },
    {
      title: '所属检测项目',
      dataIndex: 'testItemName',
      key: 'testItemName',
      width: 150
    },
    {
      title: '类别',
      dataIndex: 'category',
      key: 'category',
      width: 100
    },
    {
      title: '类型',
      dataIndex: 'type',
      key: 'type',
      width: 100,
      render: (type: string) => {
        const typeMap = {
          'quantitative': { text: '定量', color: 'blue' },
          'qualitative': { text: '定性', color: 'green' },
          'semi-quantitative': { text: '半定量', color: 'orange' }
        }
        const config = typeMap[type as keyof typeof typeMap]
        return <Tag color={config.color}>{config.text}</Tag>
      }
    },
    {
      title: '参考范围',
      dataIndex: 'referenceRange',
      key: 'referenceRange',
      width: 120,
      render: (text: string, record: AnalysisItem) => (
        <div>
          <div>{text}</div>
          {record.unit && <div style={{ fontSize: '12px', color: '#666' }}>单位: {record.unit}</div>}
        </div>
      )
    },
    {
      title: '关联疾病',
      key: 'associatedDiseases',
      width: 120,
      render: (record: AnalysisItem) => (
        <Tooltip title={record.associatedDiseases?.join('、') || '无'}>
          <Text ellipsis style={{ maxWidth: 100 }}>
            {getDiseaseNames(record.associatedDiseases)}
          </Text>
        </Tooltip>
      )
    },
    {
      title: '方法学',
      dataIndex: 'methodologyName',
      key: 'methodologyName',
      width: 100
    },
    {
      title: '样本类型',
      dataIndex: 'sampleType',
      key: 'sampleType',
      width: 120,
      render: (types: string[]) => (
        <div>
          {types.slice(0, 2).map(type => (
            <Tag key={type}>{type}</Tag>
          ))}
          {types.length > 2 && <Tag>+{types.length - 2}</Tag>}
        </div>
      )
    },
    {
      title: '报告顺序',
      dataIndex: 'reportOrder',
      key: 'reportOrder',
      width: 80,
      align: 'center' as const
    },
    {
      title: '项目状态',
      key: 'status',
      width: 100,
      render: (record: AnalysisItem) => {
        const statusConfig = getStatusConfig(record.status)
        return (
          <div>
            <Tag color={statusConfig.color}>{statusConfig.text}</Tag>
            {record.isRequired && <Badge status="processing" text="必需" />}
          </div>
        )
      }
    },
    {
      title: '操作',
      key: 'action',
      width: 150,
      render: (record: AnalysisItem) => (
        <Space size="small">
          <Tooltip title="查看详情">
            <Button 
              type="text" 
              icon={<EyeOutlined />} 
              onClick={() => handleViewDetail(record)}
            />
          </Tooltip>
          <Tooltip title="编辑">
            <Button 
              type="text" 
              icon={<EditOutlined />} 
              onClick={() => showModal(record)}
            />
          </Tooltip>
          <Popconfirm
            title="确定要删除这个分析项目吗？"
            onConfirm={() => handleDelete(record.id)}
            okText="确定"
            cancelText="取消"
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
    },
    {
      title: '临床意义',
      dataIndex: 'clinicalSignificance',
      key: 'clinicalSignificance',
      width: 200,
      ellipsis: {
        showTitle: false
      },
      render: (text: string) => (
        <Tooltip placement="topLeft" title={text}>
          {text}
        </Tooltip>
      )
    }
  ]

  return (
    <Card>
      <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between' }}>
        <Space>
          <Input
            placeholder="搜索分析项目名称、编码或所属检测项目"
            prefix={<SearchOutlined />}
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            style={{ width: 300 }}
          />
        </Space>
        <Button 
          type="primary" 
          icon={<PlusOutlined />} 
          onClick={() => showModal()}
        >
          添加分析项目
        </Button>
      </div>

      <Table
        columns={columns}
        dataSource={filteredItems}
        rowKey="id"
        pagination={{
          total: filteredItems.length,
          pageSize: 10,
          showSizeChanger: true,
          showQuickJumper: true,
          showTotal: (total) => `共 ${total} 条记录`
        }}
        scroll={{ x: 1600 }}
      />

      {/* 详情抽屉 */}
      <Drawer
        title="分析项目详情"
        placement="right"
        width={800}
        open={detailVisible}
        onClose={() => {
          setDetailVisible(false)
          setViewingItem(null)
        }}
      >
        {viewingItem && (
          <div>
            <Descriptions title="基本信息" bordered column={2} size="small">
              <Descriptions.Item label="项目名称">{viewingItem.name}</Descriptions.Item>
              <Descriptions.Item label="项目编码">{viewingItem.code}</Descriptions.Item>
              <Descriptions.Item label="所属检测项目">{viewingItem.testItemName}</Descriptions.Item>
              <Descriptions.Item label="项目类别">{viewingItem.category}</Descriptions.Item>
              <Descriptions.Item label="检测类型">
                <Tag color={
                  viewingItem.type === 'quantitative' ? 'blue' : 
                  viewingItem.type === 'qualitative' ? 'green' : 'orange'
                }>
                  {viewingItem.type === 'quantitative' ? '定量' : 
                   viewingItem.type === 'qualitative' ? '定性' : '半定量'}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="项目状态">
                <Tag color={getStatusConfig(viewingItem.status).color}>
                  {getStatusConfig(viewingItem.status).text}
                </Tag>
                {viewingItem.isRequired && <Badge status="processing" text="必需" />}
              </Descriptions.Item>
            </Descriptions>

            <Divider />

            <Descriptions title="检测参数" bordered column={2} size="small">
              <Descriptions.Item label="参考范围">{viewingItem.referenceRange}</Descriptions.Item>
              <Descriptions.Item label="单位">{viewingItem.unit || '无'}</Descriptions.Item>
              <Descriptions.Item label="正常值">{viewingItem.normalValue}</Descriptions.Item>
              <Descriptions.Item label="异常判断标准">{viewingItem.abnormalCriteria}</Descriptions.Item>
              <Descriptions.Item label="检测方法学">{viewingItem.methodologyName}</Descriptions.Item>
              <Descriptions.Item label="报告顺序">{viewingItem.reportOrder}</Descriptions.Item>
              <Descriptions.Item label="样本类型" span={2}>
                {viewingItem.sampleType.map(type => (
                  <Tag key={type}>{type}</Tag>
                ))}
              </Descriptions.Item>
            </Descriptions>

            <Divider />

            <Descriptions title="临床信息" bordered column={1} size="small">
              <Descriptions.Item label="临床意义">
                {viewingItem.clinicalSignificance}
              </Descriptions.Item>
              <Descriptions.Item label="关联疾病">
                {viewingItem.associatedDiseases?.map(disease => (
                  <Tag key={disease} color="blue">{disease}</Tag>
                )) || '无'}
              </Descriptions.Item>
              <Descriptions.Item label="项目描述">
                {viewingItem.description || '无'}
              </Descriptions.Item>
            </Descriptions>

            {viewingItem.qualityControl && (
              <>
                <Divider />
                <Descriptions title="质量控制要求" bordered column={2} size="small">
                  <Descriptions.Item label="CV要求">≤{viewingItem.qualityControl.cvRequirement}%</Descriptions.Item>
                  <Descriptions.Item label="准确度要求">≥{viewingItem.qualityControl.accuracyRequirement}%</Descriptions.Item>
                  <Descriptions.Item label="精密度要求" span={2}>≥{viewingItem.qualityControl.precisionRequirement}%</Descriptions.Item>
                </Descriptions>
              </>
            )}

            {viewingItem.reportConfiguration && (
              <>
                <Divider />
                <Descriptions title="报告配置" bordered column={2} size="small">
                  <Descriptions.Item label="报告模板">{viewingItem.reportConfiguration.template}</Descriptions.Item>
                  <Descriptions.Item label="报告格式">
                    <Tag color="blue">{viewingItem.reportConfiguration.format.toUpperCase()}</Tag>
                  </Descriptions.Item>
                  <Descriptions.Item label="包含图表">
                    <Badge 
                      status={viewingItem.reportConfiguration.includeGraphs ? 'success' : 'default'} 
                      text={viewingItem.reportConfiguration.includeGraphs ? '是' : '否'} 
                    />
                  </Descriptions.Item>
                  <Descriptions.Item label="包含解读">
                    <Badge 
                      status={viewingItem.reportConfiguration.includeInterpretation ? 'success' : 'default'} 
                      text={viewingItem.reportConfiguration.includeInterpretation ? '是' : '否'} 
                    />
                  </Descriptions.Item>
                </Descriptions>
              </>
            )}

            {viewingItem.interpretationRules && viewingItem.interpretationRules.length > 0 && (
              <>
                <Divider />
                <div>
                  <Text strong>解读规则</Text>
                  <List
                    size="small"
                    bordered
                    dataSource={viewingItem.interpretationRules}
                    renderItem={(rule, index) => (
                      <List.Item>
                        <div style={{ width: '100%' }}>
                          <div><Text strong>条件 {index + 1}:</Text> {rule.condition}</div>
                          <div><Text strong>解读:</Text> {rule.interpretation}</div>
                          <div><Text strong>建议:</Text> {rule.recommendation}</div>
                        </div>
                      </List.Item>
                    )}
                  />
                </div>
              </>
            )}

            <Divider />
            <Descriptions title="系统信息" bordered column={2} size="small">
              <Descriptions.Item label="创建时间">{viewingItem.createdAt}</Descriptions.Item>
              <Descriptions.Item label="更新时间">{viewingItem.updatedAt}</Descriptions.Item>
            </Descriptions>
          </div>
        )}
      </Drawer>

      <Modal
        title={editingItem ? '编辑分析项目' : '添加分析项目'}
        open={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        footer={null}
        width={1000}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
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
              name="code"
              label="项目编码"
              rules={[{ required: true, message: '请输入项目编码' }]}
            >
              <Input placeholder="请输入项目编码" />
            </Form.Item>

            <Form.Item
              name="testItemId"
              label="所属检测项目"
              rules={[{ required: true, message: '请选择所属检测项目' }]}
            >
              <Select placeholder="请选择所属检测项目">
                <Option value="1">肺癌基因检测</Option>
                <Option value="2">乳腺癌基因检测</Option>
                <Option value="3">结直肠癌基因检测</Option>
              </Select>
            </Form.Item>

            <Form.Item
              name="category"
              label="项目类别"
              rules={[{ required: true, message: '请输入项目类别' }]}
            >
              <Input placeholder="如：基因突变、基因扩增等" />
            </Form.Item>

            <Form.Item
              name="type"
              label="检测类型"
              rules={[{ required: true, message: '请选择检测类型' }]}
            >
              <Select placeholder="请选择检测类型">
                <Option value="quantitative">定量</Option>
                <Option value="qualitative">定性</Option>
                <Option value="semi-quantitative">半定量</Option>
              </Select>
            </Form.Item>

            <Form.Item
              name="status"
              label="项目状态"
              rules={[{ required: true, message: '请选择项目状态' }]}
            >
              <Select placeholder="请选择项目状态">
                <Option value="active">启用</Option>
                <Option value="pending">待审核</Option>
                <Option value="inactive">停用</Option>
              </Select>
            </Form.Item>

            <Form.Item
              name="unit"
              label="单位"
            >
              <Input placeholder="如：拷贝数、ng/ml等" />
            </Form.Item>

            <Form.Item
              name="referenceRange"
              label="参考范围"
              rules={[{ required: true, message: '请输入参考范围' }]}
            >
              <Input placeholder="请输入参考范围" />
            </Form.Item>

            <Form.Item
              name="normalValue"
              label="正常值"
            >
              <Input placeholder="请输入正常值描述" />
            </Form.Item>

            <Form.Item
              name="abnormalCriteria"
              label="异常判断标准"
            >
              <Input placeholder="请输入异常判断标准" />
            </Form.Item>

            <Form.Item
              name="methodologyId"
              label="检测方法学"
              rules={[{ required: true, message: '请选择检测方法学' }]}
            >
              <Select placeholder="请选择检测方法学">
                <Option value="1">NGS测序</Option>
                <Option value="2">qPCR</Option>
                <Option value="3">Sanger测序</Option>
                <Option value="4">FISH</Option>
              </Select>
            </Form.Item>

            <Form.Item
              name="sampleType"
              label="适用样本类型"
              rules={[{ required: true, message: '请选择适用样本类型' }]}
            >
              <Select mode="multiple" placeholder="请选择适用样本类型">
                <Option value="血液">血液</Option>
                <Option value="组织">组织</Option>
                <Option value="唾液">唾液</Option>
                <Option value="尿液">尿液</Option>
              </Select>
            </Form.Item>

            <Form.Item
              name="reportOrder"
              label="报告顺序"
              rules={[{ required: true, message: '请输入报告顺序' }]}
            >
              <InputNumber min={1} placeholder="报告中的显示顺序" style={{ width: '100%' }} />
            </Form.Item>

            <Form.Item
              name="associatedDiseases"
              label="关联疾病"
            >
              <Select mode="tags" placeholder="请输入关联疾病，支持多个">
                <Option value="肺癌">肺癌</Option>
                <Option value="乳腺癌">乳腺癌</Option>
                <Option value="结直肠癌">结直肠癌</Option>
                <Option value="胃癌">胃癌</Option>
                <Option value="肝癌">肝癌</Option>
              </Select>
            </Form.Item>

            <Form.Item
              name="isActive"
              label="启用状态"
              valuePropName="checked"
              initialValue={true}
            >
              <Switch checkedChildren="启用" unCheckedChildren="禁用" />
            </Form.Item>

            <Form.Item
              name="isRequired"
              label="是否必检"
              valuePropName="checked"
              initialValue={false}
            >
              <Switch checkedChildren="必检" unCheckedChildren="可选" />
            </Form.Item>
          </div>

          <Form.Item
            name="clinicalSignificance"
            label="临床意义"
            rules={[{ required: true, message: '请输入临床意义' }]}
          >
            <TextArea rows={3} placeholder="请描述该分析项目的临床意义" />
          </Form.Item>

          <Form.Item
            name="description"
            label="项目描述"
          >
            <TextArea rows={2} placeholder="请输入项目详细描述" />
          </Form.Item>

          {/* 质量控制要求 */}
          <div style={{ border: '1px solid #d9d9d9', borderRadius: '6px', padding: '16px', marginBottom: '16px' }}>
            <h4 style={{ marginBottom: '16px', color: '#1890ff' }}>质量控制要求</h4>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px' }}>
              <Form.Item
                name={['qualityControl', 'cvRequirement']}
                label="CV要求 (%)"
              >
                <InputNumber min={0} max={100} placeholder="变异系数要求" style={{ width: '100%' }} />
              </Form.Item>

              <Form.Item
                name={['qualityControl', 'accuracyRequirement']}
                label="准确度要求 (%)"
              >
                <InputNumber min={0} max={100} placeholder="准确度要求" style={{ width: '100%' }} />
              </Form.Item>

              <Form.Item
                name={['qualityControl', 'precisionRequirement']}
                label="精密度要求 (%)"
              >
                <InputNumber min={0} max={100} placeholder="精密度要求" style={{ width: '100%' }} />
              </Form.Item>
            </div>
          </div>

          {/* 报告配置 */}
          <div style={{ border: '1px solid #d9d9d9', borderRadius: '6px', padding: '16px', marginBottom: '16px' }}>
            <h4 style={{ marginBottom: '16px', color: '#1890ff' }}>报告配置</h4>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <Form.Item
                name={['reportConfiguration', 'template']}
                label="报告模板"
              >
                <Input placeholder="报告模板名称" />
              </Form.Item>

              <Form.Item
                name={['reportConfiguration', 'format']}
                label="报告格式"
              >
                <Select placeholder="请选择报告格式">
                  <Option value="pdf">PDF</Option>
                  <Option value="word">Word</Option>
                  <Option value="html">HTML</Option>
                </Select>
              </Form.Item>

              <Form.Item
                name={['reportConfiguration', 'includeGraphs']}
                label="包含图表"
                valuePropName="checked"
              >
                <Switch checkedChildren="是" unCheckedChildren="否" />
              </Form.Item>

              <Form.Item
                name={['reportConfiguration', 'includeInterpretation']}
                label="包含解读"
                valuePropName="checked"
              >
                <Switch checkedChildren="是" unCheckedChildren="否" />
              </Form.Item>
            </div>
          </div>

          <Form.Item style={{ marginBottom: 0, textAlign: 'right' }}>
            <Space>
              <Button onClick={() => setIsModalVisible(false)}>
                取消
              </Button>
              <Button type="primary" htmlType="submit">
                {editingItem ? '更新' : '添加'}
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </Card>
  )
}

export default AnalysisItemManagement