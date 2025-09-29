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
  Upload,
  Divider,
  Drawer,
  Descriptions,
  Badge,
  List,
  Typography,
  Collapse,
  Steps
} from 'antd'
import { 
  PlusOutlined, 
  EditOutlined, 
  DeleteOutlined, 
  SearchOutlined,
  ExclamationCircleOutlined,
  FileTextOutlined,
  UploadOutlined,
  EyeOutlined,
  ExperimentOutlined,
  SettingOutlined,
  SafetyCertificateOutlined,
  FileProtectOutlined,
  CheckCircleOutlined
} from '@ant-design/icons'

const { Option } = Select
const { TextArea } = Input
const { Text } = Typography
const { Panel } = Collapse
const { Step } = Steps

/**
 * 技术参数接口
 */
interface TechnicalParameters {
  throughput?: string
  sensitivity: string
  specificity: string
  precision: string
  accuracy: string
  linearRange?: string
  detectionLimit?: string
  reportableRange?: string
  cvRequirement?: number
  biasRequirement?: number
}

/**
 * 仪器要求接口
 */
interface InstrumentRequirements {
  mainInstruments: string[]
  auxiliaryInstruments: string[]
  calibrationRequirements: string
  maintenanceSchedule: string
  environmentalConditions: {
    temperature: string
    humidity: string
    ventilation: string
  }
}

/**
 * 样本要求接口
 */
interface SampleRequirements {
  sampleTypes: string[]
  minimumVolume: string
  qualityRequirements: string
  storageConditions: string
  transportRequirements: string
  pretreatmentSteps?: string[]
}

/**
 * SOP文档接口
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
 * 方法学接口定义
 */
interface Methodology {
  id: string
  name: string
  code: string
  category: string
  principle: string
  status: 'active' | 'pending' | 'inactive'
  technicalParameters: TechnicalParameters
  instrumentRequirements: InstrumentRequirements
  sampleRequirements: SampleRequirements
  associatedDetectionItems?: string[]
  procedureSteps: string[]
  qualityControl: string
  resultInterpretation: string
  limitations: string
  references: string[]
  sopDocuments?: SOPDocument[]
  version: string
  effectiveDate: string
  reviewDate: string
  approver: string
  isActive: boolean
  createdAt: string
  updatedAt: string
}

/**
 * 方法学管理组件
 * 提供方法学的增删改查功能
 */
const MethodologyManagement: React.FC = () => {
  // 模拟数据
  const [methodologies, setMethodologies] = useState<Methodology[]>([
    {
      id: '1',
      name: '二代测序技术（NGS）',
      code: 'NGS_V2.1',
      category: '基因测序',
      status: 'active',
      principle: '基于合成测序技术，通过DNA聚合酶在模板链上合成互补链，同时检测每个碱基的加入',
      technicalParameters: {
        throughput: '20Gb/run',
        sensitivity: '≥99%',
        specificity: '≥99.5%',
        precision: 'CV≤5%',
        accuracy: '≥99%',
        linearRange: '10ng-1μg',
        detectionLimit: '5% VAF',
        reportableRange: '1%-100% VAF',
        cvRequirement: 5,
        biasRequirement: 10
      },
      instrumentRequirements: {
        mainInstruments: ['Illumina NovaSeq 6000', 'Agilent 2100生物分析仪'],
        auxiliaryInstruments: ['离心机', '移液器', 'PCR仪', '涡旋混合器'],
        calibrationRequirements: '每月校准一次，使用标准品验证',
        maintenanceSchedule: '每周清洁，每月维护，每季度深度保养',
        environmentalConditions: {
          temperature: '18-25°C',
          humidity: '30-70%',
          ventilation: '每小时换气15次以上'
        }
      },
      sampleRequirements: {
        sampleTypes: ['血液', '组织', 'FFPE', '胸腹水'],
        minimumVolume: '血液≥2ml，组织≥10mg',
        qualityRequirements: 'DNA浓度≥10ng/μL，总量≥100ng，A260/A280比值1.8-2.0',
        storageConditions: '-80°C长期保存，-20°C短期保存',
        transportRequirements: '干冰运输，避免反复冻融',
        pretreatmentSteps: ['DNA提取', '质量检测', '浓度标准化']
      },
      associatedDetectionItems: ['肺癌基因检测', '乳腺癌基因检测'],
      procedureSteps: [
        'DNA质量检测',
        '文库构建',
        '文库质控',
        '上机测序',
        '数据分析',
        '结果解读'
      ],
      qualityControl: '每批次包含阳性对照、阴性对照和质控样本',
      resultInterpretation: '根据变异频率和数据库注释进行临床意义评估',
      limitations: '无法检测大片段重排、重复序列区域检测能力有限',
      references: [
        'PMID: 12345678',
        'ISO 15189:2012',
        'CAP分子病理学指南'
      ],
      sopDocuments: [
        {
          id: 'sop1',
          name: 'NGS操作手册',
          version: 'V2.1',
          type: 'procedure',
          uploadDate: '2024-01-01',
          fileUrl: '/files/ngs-manual.pdf',
          approver: '张主任',
          status: 'approved'
        },
        {
          id: 'sop2',
          name: '质量控制SOP',
          version: 'V1.0',
          type: 'quality',
          uploadDate: '2024-01-01',
          fileUrl: '/files/qc-sop.pdf',
          approver: '张主任',
          status: 'approved'
        }
      ],
      version: 'V2.1',
      effectiveDate: '2024-01-01',
      reviewDate: '2024-12-31',
      approver: '张主任',
      isActive: true,
      createdAt: '2024-01-01',
      updatedAt: '2024-01-15'
    },
    {
      id: '2',
      name: '实时荧光定量PCR（qPCR）',
      code: 'qPCR_V1.3',
      category: '基因扩增',
      status: 'active',
      principle: '基于PCR扩增原理，通过荧光信号实时监测DNA扩增过程',
      technicalParameters: {
        throughput: '96样本/run',
        sensitivity: '10拷贝/反应',
        specificity: '≥99%',
        precision: 'CV≤3%',
        accuracy: '±0.2 Ct值',
        linearRange: '10^2-10^8拷贝数',
        detectionLimit: '10拷贝/反应',
        reportableRange: '10-10^9拷贝数',
        cvRequirement: 3,
        biasRequirement: 5
      },
      instrumentRequirements: {
        mainInstruments: ['ABI 7500实时PCR仪'],
        auxiliaryInstruments: ['离心机', '移液器', '涡旋混合器', '冰盒'],
        calibrationRequirements: '每月使用标准品校准',
        maintenanceSchedule: '每周清洁光学系统，每月更换滤光片',
        environmentalConditions: {
          temperature: '20-25°C',
          humidity: '40-60%',
          ventilation: '避免震动和强光'
        }
      },
      sampleRequirements: {
        sampleTypes: ['血液', '组织', '唾液'],
        minimumVolume: '血液≥1ml，组织≥5mg',
        qualityRequirements: 'DNA浓度1-100ng/μL，无蛋白质和RNA污染',
        storageConditions: '-20°C保存，避免反复冻融',
        transportRequirements: '冰袋运输，24小时内处理',
        pretreatmentSteps: ['DNA提取', '浓度测定', '稀释至工作浓度']
      },
      associatedDetectionItems: ['病毒载量检测', '基因拷贝数检测'],
      procedureSteps: [
        '样本预处理',
        '反应体系配制',
        'PCR程序设置',
        '扩增检测',
        '结果分析'
      ],
      qualityControl: '每次实验包含标准品、阳性对照、阴性对照',
      resultInterpretation: '根据Ct值和标准曲线计算拷贝数',
      limitations: '只能检测已知序列，扩增片段长度有限',
      references: [
        'PMID: 87654321',
        'MIQE指南',
        'FDA qPCR指导原则'
      ],
      sopDocuments: [
        {
          id: 'sop3',
          name: 'qPCR标准操作程序',
          version: 'V1.3',
          type: 'procedure',
          uploadDate: '2023-06-01',
          fileUrl: '/files/qpcr-sop.pdf',
          approver: '李博士',
          status: 'approved'
        }
      ],
      version: 'V1.3',
      effectiveDate: '2023-06-01',
      reviewDate: '2024-06-01',
      approver: '李博士',
      isActive: true,
      createdAt: '2023-06-01',
      updatedAt: '2024-01-10'
    },
    {
      id: '3',
      name: 'Sanger测序',
      code: 'SANGER_V1.0',
      category: '基因测序',
      status: 'pending',
      principle: '基于链终止法的DNA测序技术，使用荧光标记的双脱氧核苷酸',
      technicalParameters: {
        throughput: '96样本/天',
        sensitivity: '≥95%',
        specificity: '≥99%',
        precision: 'Phred质量值≥20',
        accuracy: '≥99%',
        detectionLimit: '20% 杂合突变',
        reportableRange: '100-800bp序列',
        cvRequirement: 10,
        biasRequirement: 15
      },
      instrumentRequirements: {
        mainInstruments: ['ABI 3730xl测序仪'],
        auxiliaryInstruments: ['PCR仪', '离心机', '电泳仪', '纯化柱'],
        calibrationRequirements: '每周校准，使用标准DNA验证',
        maintenanceSchedule: '每日清洁毛细管，每周更换缓冲液',
        environmentalConditions: {
          temperature: '22-25°C',
          humidity: '45-65%',
          ventilation: '无尘环境，避免震动'
        }
      },
      sampleRequirements: {
        sampleTypes: ['PCR产物', 'DNA'],
        minimumVolume: 'PCR产物≥20μl',
        qualityRequirements: 'PCR产物浓度10-50ng/μL，长度100-800bp',
        storageConditions: '4°C短期保存，-20°C长期保存',
        transportRequirements: '常温运输，避免污染',
        pretreatmentSteps: ['PCR扩增', '产物纯化', '浓度检测']
      },
      associatedDetectionItems: ['单基因突变检测'],
      procedureSteps: [
        'PCR扩增',
        '产物纯化',
        '测序反应',
        '产物纯化',
        '毛细管电泳',
        '序列分析'
      ],
      qualityControl: '每批次包含已知序列对照',
      resultInterpretation: '通过序列比对识别变异位点',
      limitations: '通量低，成本高，无法检测大片段缺失',
      references: [
        'PMID: 11111111',
        'Sanger测序标准',
        'ACMG指南'
      ],
      version: 'V1.0',
      effectiveDate: '2023-01-01',
      reviewDate: '2024-01-01',
      approver: '王教授',
      isActive: true,
      createdAt: '2023-01-01',
      updatedAt: '2023-12-01'
    }
  ])

  const [isModalVisible, setIsModalVisible] = useState(false)
  const [editingItem, setEditingItem] = useState<Methodology | null>(null)
  const [form] = Form.useForm()
  const [searchText, setSearchText] = useState('')
  const [detailVisible, setDetailVisible] = useState(false)
  const [viewingItem, setViewingItem] = useState<Methodology | null>(null)

  /**
   * 显示详情抽屉
   * @param item - 要查看的方法学
   */
  const handleViewDetail = (item: Methodology) => {
    setViewingItem(item)
    setDetailVisible(true)
  }

  /**
   * 获取状态配置
   * @param status - 状态值
   */
  const getStatusConfig = (status: string) => {
    const configs = {
      active: { text: '启用', color: 'success' },
      pending: { text: '待审', color: 'warning' },
      inactive: { text: '停用', color: 'default' }
    }
    return configs[status as keyof typeof configs] || { text: status, color: 'default' }
  }

  /**
   * 获取SOP文档类型名称
   * @param type - SOP文档类型
   */
  const getSOPTypeName = (type: string) => {
    const typeNames = {
      procedure: '操作程序',
      quality: '质量控制',
      safety: '安全规范',
      maintenance: '维护保养'
    }
    return typeNames[type as keyof typeof typeNames] || type
  }

  /**
   * 获取SOP文档类型颜色
   * @param type - SOP文档类型
   */
  const getSOPTypeColor = (type: string) => {
    const colors = {
      procedure: 'blue',
      quality: 'green',
      safety: 'red',
      maintenance: 'orange'
    }
    return colors[type as keyof typeof colors] || 'default'
  }

  /**
   * 显示添加/编辑模态框
   * @param item - 要编辑的方法学，为空时表示添加
   */
  const showModal = (item?: Methodology) => {
    setEditingItem(item || null)
    if (item) {
      form.setFieldsValue({
        ...item,
        procedureSteps: item.procedureSteps.join('\n'),
        references: item.references.join('\n')
      })
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
    const processedValues = {
      ...values,
      procedureSteps: values.procedureSteps.split('\n').filter((step: string) => step.trim()),
      references: values.references.split('\n').filter((ref: string) => ref.trim())
    }

    if (editingItem) {
      // 编辑
      setMethodologies(prev => prev.map(item => 
        item.id === editingItem.id 
          ? { ...item, ...processedValues, updatedAt: new Date().toISOString().split('T')[0] }
          : item
      ))
      message.success('方法学更新成功')
    } else {
      // 添加
      const newItem: Methodology = {
        ...processedValues,
        id: Date.now().toString(),
        createdAt: new Date().toISOString().split('T')[0],
        updatedAt: new Date().toISOString().split('T')[0]
      }
      setMethodologies(prev => [...prev, newItem])
      message.success('方法学添加成功')
    }
    setIsModalVisible(false)
    form.resetFields()
  }

  /**
   * 删除方法学
   * @param id - 方法学ID
   */
  const handleDelete = (id: string) => {
    setMethodologies(prev => prev.filter(item => item.id !== id))
    message.success('方法学删除成功')
  }

  // 过滤数据
  const filteredItems = methodologies.filter(item =>
    item.name.toLowerCase().includes(searchText.toLowerCase()) ||
    item.code.toLowerCase().includes(searchText.toLowerCase()) ||
    item.category.toLowerCase().includes(searchText.toLowerCase())
  )

  // 表格列定义
  const columns = [
    {
      title: '方法学名称',
      dataIndex: 'name',
      key: 'name',
      width: 200,
      render: (text: string, record: Methodology) => (
        <div>
          <div style={{ fontWeight: 'bold' }}>{text}</div>
          <div style={{ fontSize: '12px', color: '#666' }}>{record.code}</div>
        </div>
      )
    },
    {
      title: '类别',
      dataIndex: 'category',
      key: 'category',
      width: 120,
      render: (category: string) => <Tag color="blue">{category}</Tag>
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      align: 'center' as const,
      render: (status: string) => {
        const config = getStatusConfig(status)
        return <Badge status={config.color as any} text={config.text} />
      }
    },
    {
      title: '版本',
      dataIndex: 'version',
      key: 'version',
      width: 80,
      align: 'center' as const
    },
    {
      title: '技术参数',
      key: 'technicalParameters',
      width: 200,
      render: (record: Methodology) => (
        <div>
          <div>灵敏度: {record.technicalParameters.sensitivity}</div>
          <div>特异性: {record.technicalParameters.specificity}</div>
          {record.technicalParameters.detectionLimit && (
            <div>检测限: {record.technicalParameters.detectionLimit}</div>
          )}
        </div>
      )
    },
    {
      title: '关联检测项目',
      dataIndex: 'associatedDetectionItems',
      key: 'associatedDetectionItems',
      width: 150,
      render: (items: string[]) => {
        if (!items || items.length === 0) return '-'
        if (items.length <= 2) {
          return items.map(item => <Tag key={item} color="geekblue">{item}</Tag>)
        }
        return (
          <Tooltip title={items.join('、')}>
            <div>
              {items.slice(0, 2).map(item => <Tag key={item} color="geekblue">{item}</Tag>)}
              <Tag color="default">+{items.length - 2}</Tag>
            </div>
          </Tooltip>
        )
      }
    },
    {
      title: 'SOP文档',
      dataIndex: 'sopDocuments',
      key: 'sopDocuments',
      width: 120,
      align: 'center' as const,
      render: (documents: SOPDocument[]) => {
        if (!documents || documents.length === 0) return '-'
        return (
          <Tooltip title={`共${documents.length}个文档`}>
            <Badge count={documents.length} showZero>
              <FileProtectOutlined style={{ color: '#1890ff', fontSize: '16px' }} />
            </Badge>
          </Tooltip>
        )
      }
    },
    {
      title: '生效日期',
      dataIndex: 'effectiveDate',
      key: 'effectiveDate',
      width: 100,
      align: 'center' as const
    },
    {
      title: '复审日期',
      dataIndex: 'reviewDate',
      key: 'reviewDate',
      width: 100,
      align: 'center' as const
    },
    {
      title: '审批人',
      dataIndex: 'approver',
      key: 'approver',
      width: 100,
      align: 'center' as const
    },
    {
      title: '启用状态',
      dataIndex: 'isActive',
      key: 'isActive',
      width: 80,
      align: 'center' as const,
      render: (isActive: boolean) => (
        <Tag color={isActive ? 'green' : 'red'}>
          {isActive ? '有效' : '失效'}
        </Tag>
      )
    },
    {
      title: '操作',
      key: 'action',
      width: 150,
      fixed: 'right' as const,
      render: (record: Methodology) => (
        <Space>
          <Tooltip title="查看详情">
            <Button 
              type="link" 
              icon={<EyeOutlined />} 
              onClick={() => handleViewDetail(record)}
              size="small"
            />
          </Tooltip>
          <Tooltip title="编辑">
            <Button 
              type="link" 
              icon={<EditOutlined />} 
              onClick={() => showModal(record)}
              size="small"
            />
          </Tooltip>
          <Popconfirm
            title="确定删除这个方法学吗？"
            onConfirm={() => handleDelete(record.id)}
            okText="确定"
            cancelText="取消"
            icon={<ExclamationCircleOutlined style={{ color: 'red' }} />}
          >
            <Tooltip title="删除">
              <Button 
                type="link" 
                danger 
                icon={<DeleteOutlined />}
                size="small"
              />
            </Tooltip>
          </Popconfirm>
        </Space>
      )
    }
  ]

  return (
    <Card>
      <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between' }}>
        <Space>
          <Input
            placeholder="搜索方法学名称、编码或类别"
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
          添加方法学
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
        scroll={{ x: 1800 }}
      />

      {/* 详情抽屉 */}
      <Drawer
        title="方法学详情"
        placement="right"
        onClose={() => setDetailVisible(false)}
        open={detailVisible}
        width={800}
      >
        {viewingItem && (
          <div>
            <Descriptions title="基本信息" bordered column={2} style={{ marginBottom: 24 }}>
              <Descriptions.Item label="方法学名称">{viewingItem.name}</Descriptions.Item>
              <Descriptions.Item label="方法学编码">{viewingItem.code}</Descriptions.Item>
              <Descriptions.Item label="类别">
                <Tag color="blue">{viewingItem.category}</Tag>
              </Descriptions.Item>
              <Descriptions.Item label="状态">
                {(() => {
                  const config = getStatusConfig(viewingItem.status)
                  return <Badge status={config.color as any} text={config.text} />
                })()}
              </Descriptions.Item>
              <Descriptions.Item label="版本号">{viewingItem.version}</Descriptions.Item>
              <Descriptions.Item label="生效日期">{viewingItem.effectiveDate}</Descriptions.Item>
              <Descriptions.Item label="复审日期">{viewingItem.reviewDate}</Descriptions.Item>
              <Descriptions.Item label="审批人">{viewingItem.approver}</Descriptions.Item>
              <Descriptions.Item label="启用状态" span={2}>
                <Tag color={viewingItem.isActive ? 'green' : 'red'}>
                  {viewingItem.isActive ? '有效' : '失效'}
                </Tag>
              </Descriptions.Item>
            </Descriptions>

            <Descriptions title="检测原理" bordered style={{ marginBottom: 24 }}>
              <Descriptions.Item label="原理描述" span={3}>
                {viewingItem.principle}
              </Descriptions.Item>
            </Descriptions>

            <Collapse defaultActiveKey={['1']} style={{ marginBottom: 24 }}>
              <Panel header={<><ExperimentOutlined /> 技术参数</>} key="1">
                <Descriptions bordered column={2}>
                  {viewingItem.technicalParameters.throughput && (
                    <Descriptions.Item label="通量">{viewingItem.technicalParameters.throughput}</Descriptions.Item>
                  )}
                  <Descriptions.Item label="灵敏度">{viewingItem.technicalParameters.sensitivity}</Descriptions.Item>
                  <Descriptions.Item label="特异性">{viewingItem.technicalParameters.specificity}</Descriptions.Item>
                  <Descriptions.Item label="精密度">{viewingItem.technicalParameters.precision}</Descriptions.Item>
                  <Descriptions.Item label="准确度">{viewingItem.technicalParameters.accuracy}</Descriptions.Item>
                  {viewingItem.technicalParameters.linearRange && (
                    <Descriptions.Item label="线性范围">{viewingItem.technicalParameters.linearRange}</Descriptions.Item>
                  )}
                  {viewingItem.technicalParameters.detectionLimit && (
                    <Descriptions.Item label="检测限">{viewingItem.technicalParameters.detectionLimit}</Descriptions.Item>
                  )}
                  {viewingItem.technicalParameters.reportableRange && (
                    <Descriptions.Item label="报告范围">{viewingItem.technicalParameters.reportableRange}</Descriptions.Item>
                  )}
                  {viewingItem.technicalParameters.cvRequirement && (
                    <Descriptions.Item label="CV要求">≤{viewingItem.technicalParameters.cvRequirement}%</Descriptions.Item>
                  )}
                  {viewingItem.technicalParameters.biasRequirement && (
                    <Descriptions.Item label="偏倚要求">≤{viewingItem.technicalParameters.biasRequirement}%</Descriptions.Item>
                  )}
                </Descriptions>
              </Panel>

              <Panel header={<><SettingOutlined /> 仪器要求</>} key="2">
                <Descriptions bordered column={1}>
                  <Descriptions.Item label="主要仪器">
                    {viewingItem.instrumentRequirements.mainInstruments.map(instrument => (
                      <Tag key={instrument} color="blue" style={{ margin: '2px' }}>{instrument}</Tag>
                    ))}
                  </Descriptions.Item>
                  <Descriptions.Item label="辅助仪器">
                    {viewingItem.instrumentRequirements.auxiliaryInstruments.map(instrument => (
                      <Tag key={instrument} color="geekblue" style={{ margin: '2px' }}>{instrument}</Tag>
                    ))}
                  </Descriptions.Item>
                  <Descriptions.Item label="校准要求">{viewingItem.instrumentRequirements.calibrationRequirements}</Descriptions.Item>
                  <Descriptions.Item label="维护计划">{viewingItem.instrumentRequirements.maintenanceSchedule}</Descriptions.Item>
                  <Descriptions.Item label="环境条件">
                    <div>
                      <div>温度: {viewingItem.instrumentRequirements.environmentalConditions.temperature}</div>
                      <div>湿度: {viewingItem.instrumentRequirements.environmentalConditions.humidity}</div>
                      <div>通风: {viewingItem.instrumentRequirements.environmentalConditions.ventilation}</div>
                    </div>
                  </Descriptions.Item>
                </Descriptions>
              </Panel>

              <Panel header={<><SafetyCertificateOutlined /> 样本要求</>} key="3">
                <Descriptions bordered column={1}>
                  <Descriptions.Item label="样本类型">
                    {viewingItem.sampleRequirements.sampleTypes.map(type => (
                      <Tag key={type} color="green" style={{ margin: '2px' }}>{type}</Tag>
                    ))}
                  </Descriptions.Item>
                  <Descriptions.Item label="最小体积">{viewingItem.sampleRequirements.minimumVolume}</Descriptions.Item>
                  <Descriptions.Item label="质量要求">{viewingItem.sampleRequirements.qualityRequirements}</Descriptions.Item>
                  <Descriptions.Item label="保存条件">{viewingItem.sampleRequirements.storageConditions}</Descriptions.Item>
                  <Descriptions.Item label="运输要求">{viewingItem.sampleRequirements.transportRequirements}</Descriptions.Item>
                  {viewingItem.sampleRequirements.pretreatmentSteps && (
                    <Descriptions.Item label="预处理步骤">
                      <List
                        size="small"
                        dataSource={viewingItem.sampleRequirements.pretreatmentSteps}
                        renderItem={(item, index) => (
                          <List.Item>
                            <Text>{index + 1}. {item}</Text>
                          </List.Item>
                        )}
                      />
                    </Descriptions.Item>
                  )}
                </Descriptions>
              </Panel>
            </Collapse>

            {viewingItem.associatedDetectionItems && viewingItem.associatedDetectionItems.length > 0 && (
              <Descriptions title="关联检测项目" bordered style={{ marginBottom: 24 }}>
                <Descriptions.Item label="检测项目" span={3}>
                  {viewingItem.associatedDetectionItems.map(item => (
                    <Tag key={item} color="geekblue" style={{ margin: '2px' }}>{item}</Tag>
                  ))}
                </Descriptions.Item>
              </Descriptions>
            )}

            <Descriptions title="操作步骤" bordered style={{ marginBottom: 24 }}>
              <Descriptions.Item label="步骤详情" span={3}>
                <Steps direction="vertical" size="small">
                  {viewingItem.procedureSteps.map((step, index) => (
                    <Step key={index} title={`步骤 ${index + 1}`} description={step} />
                  ))}
                </Steps>
              </Descriptions.Item>
            </Descriptions>

            <Descriptions title="质量控制与结果解读" bordered style={{ marginBottom: 24 }}>
              <Descriptions.Item label="质量控制" span={3}>{viewingItem.qualityControl}</Descriptions.Item>
              <Descriptions.Item label="结果解读" span={3}>{viewingItem.resultInterpretation}</Descriptions.Item>
              <Descriptions.Item label="方法局限性" span={3}>{viewingItem.limitations}</Descriptions.Item>
            </Descriptions>

            {viewingItem.sopDocuments && viewingItem.sopDocuments.length > 0 && (
              <Descriptions title="SOP文档" bordered style={{ marginBottom: 24 }}>
                <Descriptions.Item label="文档列表" span={3}>
                  <List
                    dataSource={viewingItem.sopDocuments}
                    renderItem={(doc) => (
                      <List.Item
                        actions={[
                          <Button type="link" size="small" icon={<FileTextOutlined />}>
                            查看
                          </Button>
                        ]}
                      >
                        <List.Item.Meta
                          avatar={<FileProtectOutlined style={{ fontSize: '20px', color: '#1890ff' }} />}
                          title={
                            <div>
                              {doc.name} 
                              <Tag color={getSOPTypeColor(doc.type)} style={{ marginLeft: 8 }}>
                                {getSOPTypeName(doc.type)}
                              </Tag>
                              <Tag color={doc.status === 'approved' ? 'green' : doc.status === 'draft' ? 'orange' : 'red'}>
                                {doc.status === 'approved' ? '已批准' : doc.status === 'draft' ? '草稿' : '已过期'}
                              </Tag>
                            </div>
                          }
                          description={
                            <div>
                              <div>版本: {doc.version} | 审批人: {doc.approver}</div>
                              <div>上传日期: {doc.uploadDate}</div>
                            </div>
                          }
                        />
                      </List.Item>
                    )}
                  />
                </Descriptions.Item>
              </Descriptions>
            )}

            <Descriptions title="参考文献" bordered style={{ marginBottom: 24 }}>
              <Descriptions.Item label="文献列表" span={3}>
                <List
                  size="small"
                  dataSource={viewingItem.references}
                  renderItem={(item, index) => (
                    <List.Item>
                      <Text>{index + 1}. {item}</Text>
                    </List.Item>
                  )}
                />
              </Descriptions.Item>
            </Descriptions>

            <Descriptions title="版本信息" bordered>
              <Descriptions.Item label="创建时间">{viewingItem.createdAt}</Descriptions.Item>
              <Descriptions.Item label="更新时间">{viewingItem.updatedAt}</Descriptions.Item>
            </Descriptions>
          </div>
        )}
      </Drawer>

      <Modal
        title={editingItem ? '编辑方法学' : '添加方法学'}
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
              label="方法学名称"
              rules={[{ required: true, message: '请输入方法学名称' }]}
            >
              <Input placeholder="请输入方法学名称" />
            </Form.Item>

            <Form.Item
              name="code"
              label="方法学编码"
              rules={[{ required: true, message: '请输入方法学编码' }]}
            >
              <Input placeholder="请输入方法学编码" />
            </Form.Item>

            <Form.Item
              name="category"
              label="方法学类别"
              rules={[{ required: true, message: '请选择方法学类别' }]}
            >
              <Select placeholder="请选择方法学类别">
                <Option value="基因测序">基因测序</Option>
                <Option value="基因扩增">基因扩增</Option>
                <Option value="细胞遗传学">细胞遗传学</Option>
                <Option value="免疫学">免疫学</Option>
                <Option value="生化检测">生化检测</Option>
                <Option value="病理学">病理学</Option>
              </Select>
            </Form.Item>

            <Form.Item
              name="version"
              label="版本号"
              rules={[{ required: true, message: '请输入版本号' }]}
            >
              <Input placeholder="如：V1.0" />
            </Form.Item>

            <Form.Item
              name="effectiveDate"
              label="生效日期"
              rules={[{ required: true, message: '请选择生效日期' }]}
            >
              <Input type="date" />
            </Form.Item>

            <Form.Item
              name="reviewDate"
              label="复审日期"
              rules={[{ required: true, message: '请选择复审日期' }]}
            >
              <Input type="date" />
            </Form.Item>

            <Form.Item
              name="approver"
              label="审批人"
              rules={[{ required: true, message: '请输入审批人' }]}
            >
              <Input placeholder="请输入审批人姓名" />
            </Form.Item>

            <Form.Item
              name="isActive"
              label="状态"
              valuePropName="checked"
              initialValue={true}
            >
              <Switch checkedChildren="有效" unCheckedChildren="失效" />
            </Form.Item>
          </div>

          <Form.Item
            name="principle"
            label="检测原理"
            rules={[{ required: true, message: '请输入检测原理' }]}
          >
            <TextArea rows={3} placeholder="请详细描述检测原理" />
          </Form.Item>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <Form.Item
              name="equipment"
              label="所需设备"
              rules={[{ required: true, message: '请选择所需设备' }]}
            >
              <Select mode="tags" placeholder="请输入或选择所需设备">
                <Option value="Illumina NovaSeq 6000">Illumina NovaSeq 6000</Option>
                <Option value="ABI 7500实时PCR仪">ABI 7500实时PCR仪</Option>
                <Option value="ABI 3730xl测序仪">ABI 3730xl测序仪</Option>
                <Option value="荧光显微镜">荧光显微镜</Option>
              </Select>
            </Form.Item>

            <Form.Item
              name="reagents"
              label="所需试剂"
              rules={[{ required: true, message: '请选择所需试剂' }]}
            >
              <Select mode="tags" placeholder="请输入或选择所需试剂" />
            </Form.Item>
          </div>

          <Form.Item
            name="sampleRequirement"
            label="样本要求"
            rules={[{ required: true, message: '请输入样本要求' }]}
          >
            <TextArea rows={2} placeholder="请描述样本的质量和数量要求" />
          </Form.Item>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px' }}>
            <Form.Item
              name="detectionRange"
              label="检测范围"
              rules={[{ required: true, message: '请输入检测范围' }]}
            >
              <Input placeholder="请输入检测范围" />
            </Form.Item>

            <Form.Item
              name="sensitivity"
              label="灵敏度"
              rules={[{ required: true, message: '请输入灵敏度' }]}
            >
              <Input placeholder="如：≥99%" />
            </Form.Item>

            <Form.Item
              name="specificity"
              label="特异性"
              rules={[{ required: true, message: '请输入特异性' }]}
            >
              <Input placeholder="如：≥99.5%" />
            </Form.Item>

            <Form.Item
              name="precision"
              label="精密度"
              rules={[{ required: true, message: '请输入精密度' }]}
            >
              <Input placeholder="如：CV≤5%" />
            </Form.Item>

            <Form.Item
              name="accuracy"
              label="准确度"
              rules={[{ required: true, message: '请输入准确度' }]}
            >
              <Input placeholder="如：≥99%" />
            </Form.Item>

            <Form.Item
              name="detectionLimit"
              label="检测限"
            >
              <Input placeholder="如：5% VAF" />
            </Form.Item>
          </div>

          <Form.Item
            name="linearRange"
            label="线性范围"
          >
            <Input placeholder="如：10ng-1μg" />
          </Form.Item>

          <Form.Item
            name="throughput"
            label="通量"
          >
            <Input placeholder="如：96样本/批次" />
          </Form.Item>

          <Form.Item
            name="reportableRange"
            label="报告范围"
          >
            <Input placeholder="如：0.1%-100% VAF" />
          </Form.Item>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <Form.Item
              name="cvRequirement"
              label="CV要求(%)"
            >
              <InputNumber 
                min={0} 
                max={100} 
                precision={1}
                placeholder="如：5.0"
                style={{ width: '100%' }}
              />
            </Form.Item>

            <Form.Item
              name="biasRequirement"
              label="偏倚要求(%)"
            >
              <InputNumber 
                min={0} 
                max={100} 
                precision={1}
                placeholder="如：10.0"
                style={{ width: '100%' }}
              />
            </Form.Item>
          </div>

          <Divider orientation="left">仪器要求</Divider>

          <Form.Item
            name="mainInstruments"
            label="主要仪器"
            rules={[{ required: true, message: '请选择主要仪器' }]}
          >
            <Select mode="tags" placeholder="请输入或选择主要仪器">
              <Option value="Illumina NovaSeq 6000">Illumina NovaSeq 6000</Option>
              <Option value="ABI 7500实时PCR仪">ABI 7500实时PCR仪</Option>
              <Option value="ABI 3730xl测序仪">ABI 3730xl测序仪</Option>
              <Option value="荧光显微镜">荧光显微镜</Option>
              <Option value="离心机">离心机</Option>
              <Option value="移液器">移液器</Option>
            </Select>
          </Form.Item>

          <Form.Item
            name="auxiliaryInstruments"
            label="辅助仪器"
          >
            <Select mode="tags" placeholder="请输入或选择辅助仪器">
              <Option value="涡旋混合器">涡旋混合器</Option>
              <Option value="恒温水浴">恒温水浴</Option>
              <Option value="电泳仪">电泳仪</Option>
              <Option value="紫外分光光度计">紫外分光光度计</Option>
            </Select>
          </Form.Item>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <Form.Item
              name="calibrationRequirements"
              label="校准要求"
              rules={[{ required: true, message: '请输入校准要求' }]}
            >
              <TextArea rows={2} placeholder="请描述仪器校准的频率和标准" />
            </Form.Item>

            <Form.Item
              name="maintenanceSchedule"
              label="维护计划"
              rules={[{ required: true, message: '请输入维护计划' }]}
            >
              <TextArea rows={2} placeholder="请描述仪器维护的计划和要求" />
            </Form.Item>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px' }}>
            <Form.Item
              name="temperature"
              label="温度要求"
              rules={[{ required: true, message: '请输入温度要求' }]}
            >
              <Input placeholder="如：18-25℃" />
            </Form.Item>

            <Form.Item
              name="humidity"
              label="湿度要求"
              rules={[{ required: true, message: '请输入湿度要求' }]}
            >
              <Input placeholder="如：30-70%" />
            </Form.Item>

            <Form.Item
              name="ventilation"
              label="通风要求"
              rules={[{ required: true, message: '请输入通风要求' }]}
            >
              <Input placeholder="如：每小时换气6次" />
            </Form.Item>
          </div>

          <Divider orientation="left">样本要求</Divider>

          <Form.Item
            name="sampleTypes"
            label="样本类型"
            rules={[{ required: true, message: '请选择样本类型' }]}
          >
            <Select mode="tags" placeholder="请选择或输入样本类型">
              <Option value="全血">全血</Option>
              <Option value="血浆">血浆</Option>
              <Option value="血清">血清</Option>
              <Option value="唾液">唾液</Option>
              <Option value="尿液">尿液</Option>
              <Option value="组织">组织</Option>
              <Option value="细胞">细胞</Option>
              <Option value="DNA">DNA</Option>
              <Option value="RNA">RNA</Option>
            </Select>
          </Form.Item>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <Form.Item
              name="minimumVolume"
              label="最小体积"
              rules={[{ required: true, message: '请输入最小体积' }]}
            >
              <Input placeholder="如：2mL" />
            </Form.Item>

            <Form.Item
              name="qualityRequirements"
              label="质量要求"
              rules={[{ required: true, message: '请输入质量要求' }]}
            >
              <Input placeholder="如：OD260/280≥1.8" />
            </Form.Item>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <Form.Item
              name="storageConditions"
              label="保存条件"
              rules={[{ required: true, message: '请输入保存条件' }]}
            >
              <Input placeholder="如：-80℃长期保存" />
            </Form.Item>

            <Form.Item
              name="transportRequirements"
              label="运输要求"
              rules={[{ required: true, message: '请输入运输要求' }]}
            >
              <Input placeholder="如：干冰运输，24小时内到达" />
            </Form.Item>
          </div>

          <Form.Item
            name="pretreatmentSteps"
            label="预处理步骤"
          >
            <TextArea 
              rows={3} 
              placeholder="请输入预处理步骤，每行一个步骤" 
            />
          </Form.Item>

          <Divider orientation="left">关联信息</Divider>

          <Form.Item
            name="associatedDetectionItems"
            label="关联检测项目"
          >
            <Select mode="tags" placeholder="请选择关联的检测项目">
              <Option value="肿瘤基因检测">肿瘤基因检测</Option>
              <Option value="遗传病筛查">遗传病筛查</Option>
              <Option value="药物基因组学">药物基因组学</Option>
              <Option value="病原体检测">病原体检测</Option>
            </Select>
          </Form.Item>

          <Form.Item
            name="status"
            label="方法学状态"
            rules={[{ required: true, message: '请选择方法学状态' }]}
            initialValue="active"
          >
            <Select placeholder="请选择方法学状态">
              <Option value="active">有效</Option>
              <Option value="pending">待审核</Option>
              <Option value="inactive">无效</Option>
            </Select>
          </Form.Item>

          <Divider orientation="left">操作流程</Divider>

          <Form.Item
            name="procedureSteps"
            label="操作步骤"
            rules={[{ required: true, message: '请输入操作步骤' }]}
          >
            <TextArea 
              rows={4} 
              placeholder="请输入操作步骤，每行一个步骤" 
            />
          </Form.Item>

          <Form.Item
            name="qualityControl"
            label="质量控制"
            rules={[{ required: true, message: '请输入质量控制要求' }]}
          >
            <TextArea rows={2} placeholder="请描述质量控制要求和标准" />
          </Form.Item>

          <Form.Item
            name="resultInterpretation"
            label="结果解读"
            rules={[{ required: true, message: '请输入结果解读标准' }]}
          >
            <TextArea rows={2} placeholder="请描述结果解读的标准和方法" />
          </Form.Item>

          <Form.Item
            name="limitations"
            label="方法局限性"
            rules={[{ required: true, message: '请输入方法局限性' }]}
          >
            <TextArea rows={2} placeholder="请描述该方法的局限性和注意事项" />
          </Form.Item>

          <Divider orientation="left">SOP文档</Divider>

          <Form.Item
            name="sopDocuments"
            label="SOP文档上传"
          >
            <Upload
              multiple
              beforeUpload={() => false}
              onChange={(info) => {
                // 这里可以处理文件上传逻辑
                console.log('文件上传:', info.fileList);
              }}
            >
              <Button icon={<UploadOutlined />}>上传SOP文档</Button>
            </Upload>
            <div style={{ marginTop: 8, color: '#666', fontSize: '12px' }}>
              支持上传PDF、DOC、DOCX格式文件，单个文件不超过10MB
            </div>
          </Form.Item>

          <Form.Item
            name="references"
            label="参考文献"
            rules={[{ required: true, message: '请输入参考文献' }]}
          >
            <TextArea 
              rows={3} 
              placeholder="请输入参考文献，每行一个文献" 
            />
          </Form.Item>

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

export default MethodologyManagement