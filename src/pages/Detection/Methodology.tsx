import React, { useState, useEffect } from 'react'
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
  Switch,
  Upload,
  Divider,
  Drawer,
  Descriptions,
  Badge,
  List,
  Typography,
  Collapse,
  Steps,
  Row,
  Col,
  Checkbox,
  InputNumber,
  Radio,
  Tabs
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
  CheckCircleOutlined,
  ReloadOutlined,
  ExportOutlined,
  ImportOutlined,
  CopyOutlined,
  StopOutlined,
  ArrowUpOutlined,
  ArrowDownOutlined
} from '@ant-design/icons'
import type { ColumnsType } from 'antd/es/table'
import { 
  Methodology, 
  MethodologyStatus, 
  MethodologyCategory, 
  DetectionType, 
  TechnologyPlatform,
  ExperimentStep,
  PerformanceIndicator,
  EquipmentType,
  ReagentType
} from '../../types'

const { Option } = Select
const { TextArea } = Input
const { Text, Title } = Typography
const { Panel } = Collapse
const { Step } = Steps
const { TabPane } = Tabs

/**
 * 方法学管理组件
 * 提供方法学的增删改查功能，包含列表展示、新增编辑、详情查看等功能
 */
const MethodologyManagement: React.FC = () => {
  // 状态管理
  const [methodologies, setMethodologies] = useState<Methodology[]>([])
  const [loading, setLoading] = useState(false)
  const [modalVisible, setModalVisible] = useState(false)
  const [detailVisible, setDetailVisible] = useState(false)
  const [editingItem, setEditingItem] = useState<Methodology | null>(null)
  const [viewingItem, setViewingItem] = useState<Methodology | null>(null)
  const [searchText, setSearchText] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string>('')
  const [selectedDetectionType, setSelectedDetectionType] = useState<string>('')
  const [selectedStatus, setSelectedStatus] = useState<string>('')
  
  // 表单实例
  const [form] = Form.useForm()

  // 模拟数据
  const mockData: Methodology[] = [
    {
      id: '1',
      code: 'M-MOL-001',
      name: '荧光PCR熔解曲线法',
      englishName: 'Fluorescent PCR Melting Curve Analysis',
      category: MethodologyCategory.MOLECULAR_BIOLOGY,
      technologyPlatform: TechnologyPlatform.PCR,
      detectionType: DetectionType.QUALITATIVE,
      status: MethodologyStatus.ACTIVE,
      description: '基于荧光PCR技术和熔解曲线分析，通过检测DNA双链解链温度的变化来识别基因突变',
      technicalPrinciple: '荧光PCR熔解曲线分析是一种基于PCR扩增产物熔解温度(Tm值)差异的检测技术...',
      technicalRequirement: {
        sampleRequirement: {
          sampleTypes: ['血浆', '血清', '全血'],
          minimumVolume: '≥200μL',
          storageCondition: '-80℃',
          qualityRequirements: 'DNA质量符合检测要求，A260/A280=1.8-2.0'
        },
        environmentRequirement: {
          temperature: '18-25℃',
          humidity: '<70%',
          cleanliness: '万级实验室'
        },
        personnelRequirement: {
          certifications: ['PCR上岗证'],
          training: ['专项培训'],
          experience: '1年以上'
        }
      },
      experimentSteps: [
        {
          id: '1',
          name: '核酸提取',
          description: '从样本中提取DNA',
          requirements: 'DNA质量符合检测要求，A260/A280=1.8-2.0',
          order: 1
        },
        {
          id: '2',
          name: 'PCR扩增',
          description: '进行荧光PCR扩增',
          requirements: '扩增程序按照试剂盒说明设置',
          order: 2
        },
        {
          id: '3',
          name: '熔解曲线分析',
          description: '分析熔解曲线',
          requirements: '使用仪器配套软件进行分析',
          order: 3
        }
      ],
      performanceIndicators: [
        {
          id: '1',
          name: '检测限',
          requirement: '≤10 copies/μL',
          verificationMethod: '梯度稀释验证',
          notes: '95%置信区间'
        },
        {
          id: '2',
          name: '精密度',
          requirement: 'CV<15%',
          verificationMethod: '室内质控',
          notes: '重复20次'
        }
      ],
      resourceConfiguration: {
        equipmentTypes: [
          { id: '1', name: '实时荧光定量PCR仪', selected: true },
          { id: '2', name: '核酸提取仪', selected: true },
          { id: '3', name: '离心机', selected: true }
        ],
        reagentTypes: [
          { id: '1', name: 'PCR试剂盒', selected: true },
          { id: '2', name: '核酸提取试剂盒', selected: true }
        ]
      },
      createdBy: '张主任',
      createdAt: '2023-06-15',
      updatedBy: '李研究员',
      updatedAt: '2024-01-20'
    },
    {
      id: '2',
      code: 'M-MOL-002',
      name: '实时荧光定量PCR',
      englishName: 'Real-time Quantitative PCR',
      category: MethodologyCategory.MOLECULAR_BIOLOGY,
      technologyPlatform: TechnologyPlatform.PCR,
      detectionType: DetectionType.QUANTITATIVE,
      status: MethodologyStatus.ACTIVE,
      description: '基于PCR扩增过程中荧光信号的实时检测，实现核酸的定量分析',
      technicalPrinciple: '实时荧光定量PCR技术通过在PCR反应体系中加入荧光基团...',
      technicalRequirement: {
        sampleRequirement: {
          sampleTypes: ['血浆', '血清', '组织'],
          minimumVolume: '≥100μL',
          storageCondition: '-20℃',
          qualityRequirements: 'RNA质量符合检测要求，RIN≥7.0'
        },
        environmentRequirement: {
          temperature: '20-25℃',
          humidity: '<60%',
          cleanliness: '万级实验室'
        },
        personnelRequirement: {
          certifications: ['PCR上岗证', '分子生物学技术证书'],
          training: ['qPCR专项培训'],
          experience: '2年以上'
        }
      },
      experimentSteps: [
        {
          id: '1',
          name: 'RNA提取',
          description: '从样本中提取总RNA',
          requirements: 'RNA质量符合检测要求，RIN≥7.0',
          order: 1
        },
        {
          id: '2',
          name: '逆转录',
          description: '将RNA逆转录为cDNA',
          requirements: '逆转录效率>80%',
          order: 2
        },
        {
          id: '3',
          name: 'qPCR扩增',
          description: '进行实时荧光定量PCR',
          requirements: '扩增效率90-110%',
          order: 3
        }
      ],
      performanceIndicators: [
        {
          id: '1',
          name: '定量限',
          requirement: '≤50 copies/μL',
          verificationMethod: '重复性验证',
          notes: 'CV<25%'
        },
        {
          id: '2',
          name: '线性范围',
          requirement: '5-10^5 copies',
          verificationMethod: '线性稀释',
          notes: 'R²>0.98'
        }
      ],
      resourceConfiguration: {
        equipmentTypes: [
          { id: '1', name: '实时荧光定量PCR仪', selected: true },
          { id: '2', name: 'RNA提取仪', selected: true }
        ],
        reagentTypes: [
          { id: '1', name: 'qPCR试剂盒', selected: true },
          { id: '2', name: '逆转录试剂盒', selected: true }
        ]
      },
      createdBy: '王博士',
      createdAt: '2023-07-10',
      updatedBy: '李研究员',
      updatedAt: '2024-02-15'
    }
  ]

  // 初始化数据
  useEffect(() => {
    loadData()
  }, [])

  /**
   * 加载数据
   */
  const loadData = async () => {
    setLoading(true)
    try {
      // 模拟API调用
      await new Promise(resolve => setTimeout(resolve, 1000))
      setMethodologies(mockData)
    } catch (error) {
      message.error('加载数据失败')
    } finally {
      setLoading(false)
    }
  }

  /**
   * 过滤数据
   */
  const filteredData = methodologies.filter(item => {
    const matchesSearch = !searchText || 
      item.name.toLowerCase().includes(searchText.toLowerCase()) ||
      item.code.toLowerCase().includes(searchText.toLowerCase())
    const matchesCategory = !selectedCategory || item.category === selectedCategory
    const matchesDetectionType = !selectedDetectionType || item.detectionType === selectedDetectionType
    const matchesStatus = !selectedStatus || item.status === selectedStatus
    
    return matchesSearch && matchesCategory && matchesDetectionType && matchesStatus
  })

  /**
   * 获取分类显示文本
   */
  const getCategoryText = (category: MethodologyCategory) => {
    const categoryMap = {
      [MethodologyCategory.MOLECULAR_BIOLOGY]: '分子生物学',
      [MethodologyCategory.IMMUNOLOGY]: '免疫学',
      [MethodologyCategory.MICROBIOLOGY]: '微生物学',
      [MethodologyCategory.BIOCHEMISTRY]: '生物化学',
      [MethodologyCategory.CYTOGENETICS]: '细胞遗传学'
    }
    return categoryMap[category] || category
  }

  /**
   * 获取检测类型显示文本
   */
  const getDetectionTypeText = (type: DetectionType) => {
    const typeMap = {
      [DetectionType.QUALITATIVE]: '定性检测',
      [DetectionType.QUANTITATIVE]: '定量检测'
    }
    return typeMap[type] || type
  }

  /**
   * 获取技术平台显示文本
   */
  const getTechnologyPlatformText = (platform: TechnologyPlatform) => {
    const platformMap = {
      [TechnologyPlatform.PCR]: 'PCR平台',
      [TechnologyPlatform.DIGITAL_PCR]: '数字PCR平台',
      [TechnologyPlatform.NGS]: '二代测序平台',
      [TechnologyPlatform.SANGER]: 'Sanger测序平台',
      [TechnologyPlatform.ELISA]: 'ELISA平台',
      [TechnologyPlatform.CULTURE]: '培养平台',
      [TechnologyPlatform.MASS_SPEC]: '质谱平台'
    }
    return platformMap[platform] || platform
  }

  /**
   * 获取状态配置
   */
  const getStatusConfig = (status: MethodologyStatus) => {
    const configs = {
      [MethodologyStatus.ACTIVE]: { text: '启用', color: 'success' },
      [MethodologyStatus.INACTIVE]: { text: '停用', color: 'default' }
    }
    return configs[status] || { text: status, color: 'default' }
  }

  /**
   * 表格列定义
   */
  const columns: ColumnsType<Methodology> = [
    {
      title: '方法学编号',
      dataIndex: 'code',
      key: 'code',
      width: 120,
      ellipsis: true,
      fixed: 'left'
    },
    {
      title: '方法学名称',
      dataIndex: 'name',
      key: 'name',
      width: 200,
      ellipsis: true,
      render: (text: string, record: Methodology) => (
        <div>
          <div style={{ fontWeight: 500 }}>{text}</div>
          {record.englishName && (
            <div style={{ fontSize: '12px', color: '#666' }}>{record.englishName}</div>
          )}
        </div>
      )
    },
    {
      title: '技术分类',
      dataIndex: 'category',
      key: 'category',
      width: 120,
      render: (category: MethodologyCategory) => (
        <Tag color="blue">{getCategoryText(category)}</Tag>
      )
    },
    {
      title: '检测类型',
      dataIndex: 'detectionType',
      key: 'detectionType',
      width: 100,
      render: (type: DetectionType) => (
        <Tag color={type === DetectionType.QUANTITATIVE ? 'orange' : 'green'}>
          {getDetectionTypeText(type)}
        </Tag>
      )
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 80,
      render: (status: MethodologyStatus) => {
        const config = getStatusConfig(status)
        return <Badge status={config.color as any} text={config.text} />
      }
    },
    {
      title: '操作',
      key: 'action',
      width: 200,
      fixed: 'right',
      render: (_, record: Methodology) => (
        <Space size="small">
          <Tooltip title="查看详情">
            <Button 
              type="text" 
              icon={<EyeOutlined />} 
              size="small"
              onClick={() => handleViewDetail(record)}
            />
          </Tooltip>
          <Tooltip title="编辑">
            <Button 
              type="text" 
              icon={<EditOutlined />} 
              size="small"
              onClick={() => handleEdit(record)}
            />
          </Tooltip>
          <Tooltip title="复制">
            <Button 
              type="text" 
              icon={<CopyOutlined />} 
              size="small"
              onClick={() => handleCopy(record)}
            />
          </Tooltip>
          <Tooltip title={record.status === MethodologyStatus.ACTIVE ? '停用' : '启用'}>
            <Button 
              type="text" 
              icon={record.status === MethodologyStatus.ACTIVE ? <StopOutlined /> : <CheckCircleOutlined />}
              size="small"
              onClick={() => handleToggleStatus(record)}
            />
          </Tooltip>
          <Popconfirm
            title="确定要删除这个方法学吗？"
            onConfirm={() => handleDelete(record.id)}
            okText="确定"
            cancelText="取消"
          >
            <Tooltip title="删除">
              <Button 
                type="text" 
                icon={<DeleteOutlined />} 
                size="small"
                danger
              />
            </Tooltip>
          </Popconfirm>
        </Space>
      )
    }
  ]

  /**
   * 处理新增
   */
  const handleAdd = () => {
    setEditingItem(null)
    form.resetFields()
    setModalVisible(true)
  }

  /**
   * 处理编辑
   */
  const handleEdit = (item: Methodology) => {
    setEditingItem(item)
    form.setFieldsValue(item)
    setModalVisible(true)
  }

  /**
   * 处理复制
   */
  const handleCopy = (item: Methodology) => {
    const newItem = { 
      ...item, 
      id: '', 
      code: '', 
      name: `${item.name} - 副本`,
      createdAt: new Date().toISOString().split('T')[0]
    }
    setEditingItem(newItem)
    form.setFieldsValue(newItem)
    setModalVisible(true)
  }

  /**
   * 处理查看详情
   */
  const handleViewDetail = (item: Methodology) => {
    setViewingItem(item)
    setDetailVisible(true)
  }

  /**
   * 处理切换状态
   */
  const handleToggleStatus = async (item: Methodology) => {
    try {
      const newStatus = item.status === MethodologyStatus.ACTIVE 
        ? MethodologyStatus.INACTIVE 
        : MethodologyStatus.ACTIVE
      
      // 模拟API调用
      await new Promise(resolve => setTimeout(resolve, 500))
      
      setMethodologies(prev => 
        prev.map(m => 
          m.id === item.id 
            ? { ...m, status: newStatus, updatedAt: new Date().toISOString().split('T')[0] }
            : m
        )
      )
      
      message.success(`方法学已${newStatus === MethodologyStatus.ACTIVE ? '启用' : '停用'}`)
    } catch (error) {
      message.error('操作失败')
    }
  }

  /**
   * 处理删除
   */
  const handleDelete = async (id: string) => {
    try {
      // 模拟API调用
      await new Promise(resolve => setTimeout(resolve, 500))
      
      setMethodologies(prev => prev.filter(item => item.id !== id))
      message.success('删除成功')
    } catch (error) {
      message.error('删除失败')
    }
  }

  /**
   * 处理表单提交
   */
  const handleSubmit = async (values: any) => {
    try {
      // 模拟API调用
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      if (editingItem?.id) {
        // 编辑
        setMethodologies(prev => 
          prev.map(item => 
            item.id === editingItem.id 
              ? { ...item, ...values, updatedAt: new Date().toISOString().split('T')[0] }
              : item
          )
        )
        message.success('更新成功')
      } else {
        // 新增
        const newItem: Methodology = {
          ...values,
          id: Date.now().toString(),
          createdAt: new Date().toISOString().split('T')[0]
        }
        setMethodologies(prev => [newItem, ...prev])
        message.success('创建成功')
      }
      
      setModalVisible(false)
      form.resetFields()
    } catch (error) {
      message.error('保存失败')
    }
  }

  /**
   * 重置筛选条件
   */
  const handleReset = () => {
    setSearchText('')
    setSelectedCategory('')
    setSelectedDetectionType('')
    setSelectedStatus('')
  }

  /**
   * 导入方法学
   */
  const handleImport = () => {
    message.info('导入功能开发中...')
  }

  /**
   * 导出列表
   */
  const handleExport = () => {
    message.info('导出功能开发中...')
  }

  return (
    <div style={{ padding: '24px' }}>
      <Card>
        <div style={{ marginBottom: '16px' }}>
          <Title level={4} style={{ margin: 0 }}>方法学列表</Title>
        </div>
        
        {/* 搜索与筛选 */}
        <Card size="small" style={{ marginBottom: '16px' }}>
          <Row gutter={[16, 16]}>
            <Col span={6}>
              <Input
                placeholder="搜索方法学..."
                prefix={<SearchOutlined />}
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                allowClear
              />
            </Col>
            <Col span={4}>
              <Select
                placeholder="技术平台"
                value={selectedCategory}
                onChange={setSelectedCategory}
                allowClear
                style={{ width: '100%' }}
              >
                <Option value={MethodologyCategory.MOLECULAR_BIOLOGY}>分子生物学</Option>
                <Option value={MethodologyCategory.IMMUNOLOGY}>免疫学</Option>
                <Option value={MethodologyCategory.MICROBIOLOGY}>微生物学</Option>
                <Option value={MethodologyCategory.BIOCHEMISTRY}>生物化学</Option>
                <Option value={MethodologyCategory.CYTOGENETICS}>细胞遗传学</Option>
              </Select>
            </Col>
            <Col span={4}>
              <Select
                placeholder="检测类型"
                value={selectedDetectionType}
                onChange={setSelectedDetectionType}
                allowClear
                style={{ width: '100%' }}
              >
                <Option value={DetectionType.QUALITATIVE}>定性检测</Option>
                <Option value={DetectionType.QUANTITATIVE}>定量检测</Option>
              </Select>
            </Col>
            <Col span={4}>
              <Select
                placeholder="状态"
                value={selectedStatus}
                onChange={setSelectedStatus}
                allowClear
                style={{ width: '100%' }}
              >
                <Option value={MethodologyStatus.ACTIVE}>启用</Option>
                <Option value={MethodologyStatus.INACTIVE}>停用</Option>
              </Select>
            </Col>
            <Col span={6}>
              <Space>
                <Button onClick={handleReset}>重置</Button>
                <Button icon={<ExportOutlined />} onClick={handleExport}>
                  导出列表
                </Button>
              </Space>
            </Col>
          </Row>
          <Row style={{ marginTop: '16px' }}>
            <Col span={24}>
              <Space>
                <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
                  新增
                </Button>
                <Button icon={<ImportOutlined />} onClick={handleImport}>
                  导入
                </Button>
              </Space>
            </Col>
          </Row>
        </Card>

        {/* 方法学列表 */}
        <Table
          columns={columns}
          dataSource={filteredData}
          rowKey="id"
          loading={loading}
          scroll={{ x: 1000 }}
          pagination={{
            total: filteredData.length,
            pageSize: 20,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) => 
              `第${range[0]}-${range[1]}条/共${total}条方法学`
          }}
        />
      </Card>

      {/* 新增/编辑弹窗 */}
      <Modal
        title={editingItem?.id ? '编辑方法学' : '新增方法学'}
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        footer={null}
        width={1200}
        destroyOnClose
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          initialValues={{
            status: MethodologyStatus.ACTIVE,
            category: MethodologyCategory.MOLECULAR_BIOLOGY,
            detectionType: DetectionType.QUALITATIVE,
            technologyPlatform: TechnologyPlatform.PCR
          }}
        >
          <Tabs defaultActiveKey="basic">
            <TabPane tab="基本信息" key="basic">
              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item
                    label="方法学编号"
                    name="code"
                    rules={[{ required: true, message: '请输入方法学编号' }]}
                  >
                    <Input placeholder="如：M-MOL-004" />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item
                    label="方法学名称"
                    name="name"
                    rules={[{ required: true, message: '请输入方法学名称' }]}
                  >
                    <Input placeholder="请输入方法学名称" />
                  </Form.Item>
                </Col>
              </Row>
              
              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item
                    label="英文名称"
                    name="englishName"
                  >
                    <Input placeholder="请输入英文名称" />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item
                    label="方法学分类"
                    name="category"
                    rules={[{ required: true, message: '请选择方法学分类' }]}
                  >
                    <Select placeholder="请选择方法学分类">
                      <Option value={MethodologyCategory.MOLECULAR_BIOLOGY}>分子生物学</Option>
                      <Option value={MethodologyCategory.IMMUNOLOGY}>免疫学</Option>
                      <Option value={MethodologyCategory.MICROBIOLOGY}>微生物学</Option>
                      <Option value={MethodologyCategory.BIOCHEMISTRY}>生物化学</Option>
                      <Option value={MethodologyCategory.CYTOGENETICS}>细胞遗传学</Option>
                    </Select>
                  </Form.Item>
                </Col>
              </Row>

              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item
                    label="技术平台"
                    name="technologyPlatform"
                    rules={[{ required: true, message: '请选择技术平台' }]}
                  >
                    <Select placeholder="请选择技术平台">
                      <Option value={TechnologyPlatform.PCR}>PCR平台</Option>
                      <Option value={TechnologyPlatform.DIGITAL_PCR}>数字PCR平台</Option>
                      <Option value={TechnologyPlatform.NGS}>二代测序平台</Option>
                      <Option value={TechnologyPlatform.SANGER}>Sanger测序平台</Option>
                      <Option value={TechnologyPlatform.ELISA}>ELISA平台</Option>
                      <Option value={TechnologyPlatform.CULTURE}>培养平台</Option>
                      <Option value={TechnologyPlatform.MASS_SPEC}>质谱平台</Option>
                    </Select>
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item
                    label="检测类型"
                    name="detectionType"
                    rules={[{ required: true, message: '请选择检测类型' }]}
                  >
                    <Select placeholder="请选择检测类型">
                      <Option value={DetectionType.QUALITATIVE}>定性检测</Option>
                      <Option value={DetectionType.QUANTITATIVE}>定量检测</Option>
                    </Select>
                  </Form.Item>
                </Col>
              </Row>

              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item
                    label="状态"
                    name="status"
                    rules={[{ required: true, message: '请选择状态' }]}
                  >
                    <Radio.Group>
                      <Radio value={MethodologyStatus.ACTIVE}>启用</Radio>
                      <Radio value={MethodologyStatus.INACTIVE}>停用</Radio>
                    </Radio.Group>
                  </Form.Item>
                </Col>
              </Row>

              <Form.Item
                label="方法学描述"
                name="description"
                rules={[{ required: true, message: '请输入方法学描述' }]}
              >
                <TextArea 
                  rows={4} 
                  placeholder="请输入方法学描述"
                  showCount
                  maxLength={500}
                />
              </Form.Item>

              <Form.Item
                label="技术原理"
                name="technicalPrinciple"
                rules={[{ required: true, message: '请输入技术原理' }]}
              >
                <TextArea 
                  rows={10} 
                  placeholder="请详细描述技术原理..."
                  showCount
                  maxLength={2000}
                />
              </Form.Item>
            </TabPane>
          </Tabs>

          <Divider />
          
          <div style={{ textAlign: 'right' }}>
            <Space>
              <Button onClick={() => setModalVisible(false)}>取消</Button>
              <Button type="primary" htmlType="submit">
                保存
              </Button>
              <Button type="primary" htmlType="submit">
                保存并新增
              </Button>
            </Space>
          </div>
        </Form>
      </Modal>

      {/* 详情抽屉 */}
      <Drawer
        title="方法学详情"
        placement="right"
        width={800}
        open={detailVisible}
        onClose={() => setDetailVisible(false)}
      >
        {viewingItem && (
          <div>
            <Tabs defaultActiveKey="basic">
              <TabPane tab="基础信息" key="basic">
                <Descriptions column={2} bordered>
                  <Descriptions.Item label="方法学编号">{viewingItem.code}</Descriptions.Item>
                  <Descriptions.Item label="状态">
                    <Badge 
                      status={getStatusConfig(viewingItem.status).color as any} 
                      text={getStatusConfig(viewingItem.status).text} 
                    />
                  </Descriptions.Item>
                  <Descriptions.Item label="方法学名称" span={2}>
                    {viewingItem.name}
                  </Descriptions.Item>
                  <Descriptions.Item label="英文名称" span={2}>
                    {viewingItem.englishName || '-'}
                  </Descriptions.Item>
                  <Descriptions.Item label="方法学分类">
                    <Tag color="blue">{getCategoryText(viewingItem.category)}</Tag>
                  </Descriptions.Item>
                  <Descriptions.Item label="技术平台">
                    {getTechnologyPlatformText(viewingItem.technologyPlatform)}
                  </Descriptions.Item>
                  <Descriptions.Item label="检测类型">
                    <Tag color={viewingItem.detectionType === DetectionType.QUANTITATIVE ? 'orange' : 'green'}>
                      {getDetectionTypeText(viewingItem.detectionType)}
                    </Tag>
                  </Descriptions.Item>
                  <Descriptions.Item label="创建时间">{viewingItem.createdAt}</Descriptions.Item>
                  <Descriptions.Item label="创建人">{viewingItem.createdBy}</Descriptions.Item>
                  <Descriptions.Item label="更新时间">{viewingItem.updatedAt || '-'}</Descriptions.Item>
                  <Descriptions.Item label="更新人" span={2}>{viewingItem.updatedBy || '-'}</Descriptions.Item>
                  <Descriptions.Item label="方法学描述" span={2}>
                    {viewingItem.description}
                  </Descriptions.Item>
                </Descriptions>
              </TabPane>
            </Tabs>

            <Divider />
            
            <div style={{ textAlign: 'right' }}>
              <Space>
                <Button onClick={() => handleEdit(viewingItem)}>编辑</Button>
                <Button onClick={() => handleCopy(viewingItem)}>复制新建</Button>
                <Button onClick={() => setDetailVisible(false)}>返回列表</Button>
              </Space>
            </div>
          </div>
        )}
      </Drawer>
    </div>
  )
}

export default MethodologyManagement