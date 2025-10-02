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
  Typography,
  Row,
  Col,
  Checkbox,
  Upload,
  Dropdown,
  Menu
} from 'antd'
import { 
  PlusOutlined, 
  EditOutlined, 
  DeleteOutlined, 
  SearchOutlined,
  ExclamationCircleOutlined,
  EyeOutlined,
  FileTextOutlined,
  ExperimentOutlined,
  ReloadOutlined,
  ImportOutlined,
  ExportOutlined,
  MoreOutlined,
  SettingOutlined,
  CopyOutlined,
  StopOutlined
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
  englishName?: string
  testItemId: string
  testItemName: string
  category: string
  type: 'quantitative' | 'qualitative' | 'text'
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
 * 提供分析项目的增删改查功能，包含搜索筛选、批量操作等
 */
const AnalysisItemManagement: React.FC = () => {
  // 状态管理
  const [analysisItems, setAnalysisItems] = useState<AnalysisItem[]>([
    {
      id: 'A-TB-001',
      name: '利福平耐药(rpoB基因)',
      code: 'A-TB-001',
      englishName: 'Rifampicin Resistance (rpoB)',
      testItemId: '1',
      testItemName: '结核耐药基因检测',
      category: '基因突变',
      type: 'qualitative',
      referenceRange: '野生型',
      normalValue: '阴性',
      abnormalCriteria: '阳性',
      clinicalSignificance: '检测rpoB基因突变，判断利福平耐药性',
      methodologyId: '1',
      methodologyName: 'NGS测序',
      sampleType: ['痰液', '血液'],
      reportOrder: 1,
      isActive: true,
      isRequired: true,
      description: '检测rpoB基因突变，判断利福平耐药性',
      status: 'active',
      createdAt: '2024-01-15',
      updatedAt: '2024-01-15'
    },
    {
      id: 'A-TB-002',
      name: '异烟肼耐药(katG基因)',
      code: 'A-TB-002',
      englishName: 'Isoniazid Resistance (katG)',
      testItemId: '1',
      testItemName: '结核耐药基因检测',
      category: '基因突变',
      type: 'qualitative',
      referenceRange: '野生型',
      normalValue: '阴性',
      abnormalCriteria: '阳性',
      clinicalSignificance: '检测katG基因突变，判断异烟肼耐药性',
      methodologyId: '1',
      methodologyName: 'NGS测序',
      sampleType: ['痰液', '血液'],
      reportOrder: 2,
      isActive: true,
      isRequired: true,
      description: '检测katG基因突变，判断异烟肼耐药性',
      status: 'active',
      createdAt: '2024-01-15',
      updatedAt: '2024-01-15'
    },
    {
      id: 'A-TB-003',
      name: '异烟肼低度耐药(inhA基因)',
      code: 'A-TB-003',
      englishName: 'Isoniazid Low-level Resistance (inhA)',
      testItemId: '1',
      testItemName: '结核耐药基因检测',
      category: '基因突变',
      type: 'qualitative',
      referenceRange: '野生型',
      normalValue: '阴性',
      abnormalCriteria: '阳性',
      clinicalSignificance: '检测inhA基因突变，判断异烟肼低度耐药性',
      methodologyId: '1',
      methodologyName: 'NGS测序',
      sampleType: ['痰液', '血液'],
      reportOrder: 3,
      isActive: true,
      isRequired: true,
      description: '检测inhA基因突变，判断异烟肼低度耐药性',
      status: 'active',
      createdAt: '2024-01-15',
      updatedAt: '2024-01-15'
    },
    {
      id: 'A-HIV-001',
      name: 'HIV病毒载量定量',
      code: 'A-HIV-001',
      englishName: 'HIV Viral Load Quantification',
      testItemId: '2',
      testItemName: 'HIV病毒载量检测',
      category: '病毒载量',
      type: 'quantitative',
      unit: 'copies/mL',
      referenceRange: '<20',
      normalValue: '<20',
      abnormalCriteria: '≥20',
      clinicalSignificance: 'HIV病毒载量定量检测，用于治疗监测',
      methodologyId: '2',
      methodologyName: 'qPCR',
      sampleType: ['血浆'],
      reportOrder: 1,
      isActive: true,
      isRequired: true,
      description: 'HIV病毒载量定量检测',
      status: 'active',
      createdAt: '2024-01-15',
      updatedAt: '2024-01-15'
    },
    {
      id: 'A-HIV-002',
      name: 'HIV基因型(亚型分析)',
      code: 'A-HIV-002',
      englishName: 'HIV Genotype (Subtype Analysis)',
      testItemId: '3',
      testItemName: 'HIV基因型分析',
      category: '基因型分析',
      type: 'text',
      clinicalSignificance: 'HIV基因型分析，确定病毒亚型',
      methodologyId: '1',
      methodologyName: 'NGS测序',
      sampleType: ['血浆'],
      reportOrder: 1,
      isActive: true,
      isRequired: true,
      description: 'HIV基因型分析，确定病毒亚型',
      status: 'active',
      createdAt: '2024-01-15',
      updatedAt: '2024-01-15'
    },
    {
      id: 'A-NGS-001',
      name: 'EGFR L858R突变',
      code: 'A-NGS-001',
      englishName: 'EGFR L858R Mutation',
      testItemId: '4',
      testItemName: 'NGS肿瘤基因检测',
      category: '基因突变',
      type: 'qualitative',
      referenceRange: '野生型',
      normalValue: '阴性',
      abnormalCriteria: '阳性',
      clinicalSignificance: 'EGFR L858R突变检测，用于靶向治疗指导',
      methodologyId: '1',
      methodologyName: 'NGS测序',
      sampleType: ['血液', '组织'],
      reportOrder: 1,
      isActive: true,
      isRequired: true,
      description: 'EGFR L858R突变检测',
      status: 'active',
      createdAt: '2024-01-15',
      updatedAt: '2024-01-15'
    }
  ])

  // 搜索和筛选状态
  const [searchText, setSearchText] = useState('')
  const [selectedResultType, setSelectedResultType] = useState<string>('')
  const [selectedTestItem, setSelectedTestItem] = useState<string>('')
  const [selectedStatus, setSelectedStatus] = useState<string>('')
  
  // 表格状态
  const [selectedRowKeys, setSelectedRowKeys] = useState<string[]>([])
  const [loading, setLoading] = useState(false)
  
  // 弹窗状态
  const [isModalVisible, setIsModalVisible] = useState(false)
  const [editingItem, setEditingItem] = useState<AnalysisItem | null>(null)
  const [form] = Form.useForm()
  const [viewingItem, setViewingItem] = useState<AnalysisItem | null>(null)
  const [detailDrawerVisible, setDetailDrawerVisible] = useState(false)

  // 获取检测项目列表（模拟数据）
  const testItems = [
    { id: '1', name: '结核耐药基因检测' },
    { id: '2', name: 'HIV病毒载量检测' },
    { id: '3', name: 'HIV基因型分析' },
    { id: '4', name: 'NGS肿瘤基因检测' }
  ]

  // 结果类型选项
  const resultTypes = [
    { value: 'qualitative', label: '定性' },
    { value: 'quantitative', label: '定量' },
    { value: 'text', label: '文本' }
  ]

  // 状态选项
  const statusOptions = [
    { value: 'active', label: '启用' },
    { value: 'pending', label: '待审核' },
    { value: 'inactive', label: '停用' }
  ]

  // 重置搜索条件
  const handleReset = () => {
    setSearchText('')
    setSelectedResultType('')
    setSelectedTestItem('')
    setSelectedStatus('')
  }

  // 过滤数据
  const filteredItems = analysisItems.filter(item => {
    const matchSearch = !searchText || 
      item.name.toLowerCase().includes(searchText.toLowerCase()) ||
      item.code.toLowerCase().includes(searchText.toLowerCase()) ||
      (item.englishName && item.englishName.toLowerCase().includes(searchText.toLowerCase()))
    
    const matchResultType = !selectedResultType || item.type === selectedResultType
    const matchTestItem = !selectedTestItem || item.testItemId === selectedTestItem
    const matchStatus = !selectedStatus || item.status === selectedStatus
    
    return matchSearch && matchResultType && matchTestItem && matchStatus
  })

  // 显示新增/编辑弹窗
  const showModal = (item?: AnalysisItem) => {
    setEditingItem(item || null)
    if (item) {
      form.setFieldsValue(item)
    } else {
      form.resetFields()
    }
    setIsModalVisible(true)
  }

  // 保存分析项目
  const handleSave = async () => {
    try {
      const values = await form.validateFields()
      
      if (editingItem) {
        // 编辑
        setAnalysisItems(prev => prev.map(item =>
          item.id === editingItem.id ? { ...item, ...values, updatedAt: new Date().toISOString().split('T')[0] } : item
        ))
        message.success('分析项目更新成功')
      } else {
        // 新增
        const newItem: AnalysisItem = {
          ...values,
          id: `A-${Date.now()}`,
          createdAt: new Date().toISOString().split('T')[0],
          updatedAt: new Date().toISOString().split('T')[0]
        }
        setAnalysisItems(prev => [...prev, newItem])
        message.success('分析项目创建成功')
      }
      
      setIsModalVisible(false)
      setEditingItem(null)
      form.resetFields()
    } catch (error) {
      console.error('保存失败:', error)
    }
  }

  // 查看详情
  const handleViewDetail = (item: AnalysisItem) => {
    setViewingItem(item)
    setDetailDrawerVisible(true)
  }

  // 复制分析项目
  const handleCopy = (item: AnalysisItem) => {
    const newItem: AnalysisItem = {
      ...item,
      id: `A-${Date.now()}`,
      code: `${item.code}_COPY`,
      name: `${item.name}(副本)`,
      createdAt: new Date().toISOString().split('T')[0],
      updatedAt: new Date().toISOString().split('T')[0]
    }
    setAnalysisItems(prev => [...prev, newItem])
    message.success('分析项目复制成功')
  }

  // 删除分析项目
  const handleDelete = (id: string) => {
    setAnalysisItems(prev => prev.filter(item => item.id !== id))
    message.success('分析项目删除成功')
  }

  // 批量删除
  const handleBatchDelete = () => {
    if (selectedRowKeys.length === 0) {
      message.warning('请选择要删除的分析项目')
      return
    }
    
    Modal.confirm({
      title: '确认删除',
      content: `确定要删除选中的 ${selectedRowKeys.length} 个分析项目吗？`,
      onOk: () => {
        setAnalysisItems(prev => prev.filter(item => !selectedRowKeys.includes(item.id)))
        setSelectedRowKeys([])
        message.success('批量删除成功')
      }
    })
  }

  // 批量导出
  const handleBatchExport = () => {
    if (selectedRowKeys.length === 0) {
      message.warning('请选择要导出的分析项目')
      return
    }
    message.success('导出功能开发中...')
  }

  // 获取状态标签颜色
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'green'
      case 'pending': return 'orange'
      case 'inactive': return 'red'
      default: return 'default'
    }
  }

  // 获取状态文本
  const getStatusText = (status: string) => {
    switch (status) {
      case 'active': return '启用'
      case 'pending': return '待审核'
      case 'inactive': return '停用'
      default: return status
    }
  }

  // 获取结果类型文本
  const getResultTypeText = (type: string) => {
    switch (type) {
      case 'qualitative': return '定性'
      case 'quantitative': return '定量'
      case 'text': return '文本'
      default: return type
    }
  }

  // 操作菜单
  const getActionMenu = (record: AnalysisItem) => (
    <Menu>
      <Menu.Item key="edit" icon={<EditOutlined />} onClick={() => showModal(record)}>
        编辑
      </Menu.Item>
      <Menu.Item key="view" icon={<EyeOutlined />} onClick={() => handleViewDetail(record)}>
        查看详情
      </Menu.Item>
      <Menu.Item key="copy" icon={<CopyOutlined />} onClick={() => handleCopy(record)}>
        复制
      </Menu.Item>
      <Menu.Item key="reference" icon={<SettingOutlined />}>
        设置参考范围
      </Menu.Item>
      <Menu.Divider />
      <Menu.Item 
        key="disable" 
        icon={<StopOutlined />}
        disabled={record.status === 'inactive'}
      >
        停用
      </Menu.Item>
      <Menu.Item 
        key="delete" 
        icon={<DeleteOutlined />} 
        danger
        onClick={() => {
          Modal.confirm({
            title: '确认删除',
            content: `确定要删除分析项目"${record.name}"吗？`,
            onOk: () => handleDelete(record.id)
          })
        }}
      >
        删除
      </Menu.Item>
    </Menu>
  )

  // 表格列定义
  const columns = [
    {
      title: '分析项目编号',
      dataIndex: 'code',
      key: 'code',
      width: 140,
      fixed: 'left' as const,
      render: (text: string) => <Text strong>{text}</Text>
    },
    {
      title: '分析项目名称',
      dataIndex: 'name',
      key: 'name',
      width: 200,
      render: (text: string, record: AnalysisItem) => (
        <div>
          <div>{text}</div>
          {record.englishName && (
            <div style={{ fontSize: '12px', color: '#666' }}>{record.englishName}</div>
          )}
        </div>
      )
    },
    {
      title: '所属检测项目',
      dataIndex: 'testItemName',
      key: 'testItemName',
      width: 160
    },
    {
      title: '结果类型',
      dataIndex: 'type',
      key: 'type',
      width: 100,
      render: (type: string) => (
        <Tag color={type === 'quantitative' ? 'blue' : type === 'qualitative' ? 'green' : 'orange'}>
          {getResultTypeText(type)}
        </Tag>
      )
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: (status: string) => (
        <Badge 
          status={status === 'active' ? 'success' : status === 'pending' ? 'warning' : 'error'} 
          text={getStatusText(status)} 
        />
      )
    },
    {
      title: '操作',
      key: 'action',
      width: 80,
      fixed: 'right' as const,
      render: (record: AnalysisItem) => (
        <Dropdown overlay={getActionMenu(record)} trigger={['click']}>
          <Button type="text" icon={<MoreOutlined />} />
        </Dropdown>
      )
    }
  ]

  // 行选择配置
  const rowSelection = {
    selectedRowKeys,
    onChange: (keys: React.Key[]) => setSelectedRowKeys(keys as string[]),
    getCheckboxProps: (record: AnalysisItem) => ({
      disabled: record.status === 'inactive'
    })
  }

  return (
    <div style={{ padding: '24px' }}>
      <Card title="分析项目管理" style={{ marginBottom: 16 }}>
        {/* 搜索与筛选区域 */}
        <Card size="small" title="搜索与筛选" style={{ marginBottom: 16 }}>
          <Row gutter={16}>
            <Col span={8}>
              <Input
                placeholder="搜索分析项目..."
                prefix={<SearchOutlined />}
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                allowClear
              />
            </Col>
            <Col span={4}>
              <Select
                placeholder="结果类型"
                value={selectedResultType}
                onChange={setSelectedResultType}
                allowClear
                style={{ width: '100%' }}
              >
                {resultTypes.map(type => (
                  <Option key={type.value} value={type.value}>{type.label}</Option>
                ))}
              </Select>
            </Col>
            <Col span={4}>
              <Select
                placeholder="检测项目"
                value={selectedTestItem}
                onChange={setSelectedTestItem}
                allowClear
                style={{ width: '100%' }}
              >
                {testItems.map(item => (
                  <Option key={item.id} value={item.id}>{item.name}</Option>
                ))}
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
                {statusOptions.map(status => (
                  <Option key={status.value} value={status.value}>{status.label}</Option>
                ))}
              </Select>
            </Col>
            <Col span={4}>
              <Button onClick={handleReset}>重置</Button>
            </Col>
          </Row>
        </Card>

        {/* 操作按钮区域 */}
        <Row gutter={16} style={{ marginBottom: 16 }}>
          <Col>
            <Button type="primary" icon={<PlusOutlined />} onClick={() => showModal()}>
              新增分析项目
            </Button>
          </Col>
          <Col>
            <Button icon={<ImportOutlined />}>
              批量导入
            </Button>
          </Col>
          <Col>
            <Button icon={<ExportOutlined />} onClick={handleBatchExport}>
              导出列表
            </Button>
          </Col>
          {selectedRowKeys.length > 0 && (
            <>
              <Col>
                <Button danger onClick={handleBatchDelete}>
                  批量删除 ({selectedRowKeys.length})
                </Button>
              </Col>
            </>
          )}
        </Row>

        {/* 分析项目列表 */}
        <Table
          columns={columns}
          dataSource={filteredItems}
          rowKey="id"
          rowSelection={rowSelection}
          loading={loading}
          scroll={{ x: 1000 }}
          pagination={{
            total: filteredItems.length,
            pageSize: 20,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) => 
              `第${range[0]}-${range[1]}条/共${total}条 总计${analysisItems.length}个分析项目`
          }}
        />
      </Card>

      {/* 详情抽屉 */}
      <Drawer
        title="分析项目详情"
        placement="right"
        width={800}
        open={detailDrawerVisible}
        onClose={() => setDetailDrawerVisible(false)}
      >
        {viewingItem && (
          <div>
            <Descriptions title="基本信息" bordered column={2}>
              <Descriptions.Item label="项目编号">{viewingItem.code}</Descriptions.Item>
              <Descriptions.Item label="项目名称">{viewingItem.name}</Descriptions.Item>
              <Descriptions.Item label="英文名称">{viewingItem.englishName || '-'}</Descriptions.Item>
              <Descriptions.Item label="所属检测项目">{viewingItem.testItemName}</Descriptions.Item>
              <Descriptions.Item label="项目类别">{viewingItem.category}</Descriptions.Item>
              <Descriptions.Item label="结果类型">
                <Tag color={viewingItem.type === 'quantitative' ? 'blue' : viewingItem.type === 'qualitative' ? 'green' : 'orange'}>
                  {getResultTypeText(viewingItem.type)}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="单位">{viewingItem.unit || '-'}</Descriptions.Item>
              <Descriptions.Item label="参考范围">{viewingItem.referenceRange || '-'}</Descriptions.Item>
              <Descriptions.Item label="正常值">{viewingItem.normalValue || '-'}</Descriptions.Item>
              <Descriptions.Item label="异常标准">{viewingItem.abnormalCriteria || '-'}</Descriptions.Item>
              <Descriptions.Item label="方法学">{viewingItem.methodologyName}</Descriptions.Item>
              <Descriptions.Item label="报告顺序">{viewingItem.reportOrder}</Descriptions.Item>
              <Descriptions.Item label="是否启用">
                <Switch checked={viewingItem.isActive} disabled />
              </Descriptions.Item>
              <Descriptions.Item label="是否必需">
                <Switch checked={viewingItem.isRequired} disabled />
              </Descriptions.Item>
              <Descriptions.Item label="状态">
                <Badge 
                  status={viewingItem.status === 'active' ? 'success' : viewingItem.status === 'pending' ? 'warning' : 'error'} 
                  text={getStatusText(viewingItem.status)} 
                />
              </Descriptions.Item>
            </Descriptions>

            <Divider />

            <Descriptions title="样本类型" bordered>
              <Descriptions.Item label="适用样本">
                {viewingItem.sampleType.map(type => (
                  <Tag key={type} style={{ margin: '2px' }}>{type}</Tag>
                ))}
              </Descriptions.Item>
            </Descriptions>

            <Divider />

            <Descriptions title="临床信息" bordered>
              <Descriptions.Item label="临床意义" span={3}>
                {viewingItem.clinicalSignificance}
              </Descriptions.Item>
              <Descriptions.Item label="项目描述" span={3}>
                {viewingItem.description || '-'}
              </Descriptions.Item>
            </Descriptions>

            <Divider />

            <Descriptions title="时间信息" bordered column={2}>
              <Descriptions.Item label="创建时间">{viewingItem.createdAt}</Descriptions.Item>
              <Descriptions.Item label="更新时间">{viewingItem.updatedAt}</Descriptions.Item>
            </Descriptions>
          </div>
        )}
      </Drawer>

      {/* 新增/编辑弹窗 */}
      <Modal
        title={editingItem ? '编辑分析项目' : '新增分析项目'}
        open={isModalVisible}
        onOk={handleSave}
        onCancel={() => {
          setIsModalVisible(false)
          setEditingItem(null)
          form.resetFields()
        }}
        width={800}
        okText="保存"
        cancelText="取消"
      >
        <Form
          form={form}
          labelCol={{ span: 6 }}
          wrapperCol={{ span: 18 }}
          initialValues={{
            isActive: true,
            isRequired: false,
            status: 'active',
            reportOrder: 1
          }}
        >
          <Form.Item
            label="分析项目编号"
            name="code"
            rules={[{ required: true, message: '请输入分析项目编号' }]}
          >
            <Input placeholder="如：A-TB-001" />
          </Form.Item>

          <Form.Item
            label="分析项目名称"
            name="name"
            rules={[{ required: true, message: '请输入分析项目名称' }]}
          >
            <Input placeholder="如：利福平耐药(rpoB基因)" />
          </Form.Item>

          <Form.Item
            label="英文名称"
            name="englishName"
          >
            <Input placeholder="如：Rifampicin Resistance (rpoB)" />
          </Form.Item>

          <Form.Item
            label="所属检测项目"
            name="testItemId"
            rules={[{ required: true, message: '请选择所属检测项目' }]}
          >
            <Select placeholder="请选择检测项目">
              {testItems.map(item => (
                <Option key={item.id} value={item.id}>{item.name}</Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            label="方法学"
            name="methodologyName"
            rules={[{ required: true, message: '请选择方法学' }]}
          >
            <Select placeholder="请选择方法学">
              <Option value="NGS测序">NGS测序</Option>
              <Option value="PCR扩增">PCR扩增</Option>
              <Option value="荧光定量PCR">荧光定量PCR</Option>
              <Option value="基因芯片">基因芯片</Option>
              <Option value="Sanger测序">Sanger测序</Option>
              <Option value="免疫组化">免疫组化</Option>
              <Option value="FISH">FISH</Option>
              <Option value="质谱分析">质谱分析</Option>
            </Select>
          </Form.Item>

          <Form.Item
            label="样本类型"
            name="sampleType"
            rules={[{ required: true, message: '请选择样本类型' }]}
          >
            <Select
              mode="multiple"
              placeholder="请选择样本类型"
              options={[
                { label: '血液', value: '血液' },
                { label: '血浆', value: '血浆' },
                { label: '血清', value: '血清' },
                { label: '痰液', value: '痰液' },
                { label: '组织', value: '组织' },
                { label: '尿液', value: '尿液' },
                { label: '唾液', value: '唾液' }
              ]}
            />
          </Form.Item>

          <Form.Item
            label="结果类型"
            name="type"
            rules={[{ required: true, message: '请选择结果类型' }]}
          >
            <Select placeholder="请选择结果类型">
              {resultTypes.map(type => (
                <Option key={type.value} value={type.value}>{type.label}</Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            label="单位"
            name="unit"
          >
            <Input placeholder="如：copies/mL" />
          </Form.Item>

          <Form.Item
            label="参考范围"
            name="referenceRange"
          >
            <Input placeholder="如：野生型" />
          </Form.Item>

          <Form.Item
            label="正常值"
            name="normalValue"
          >
            <Input placeholder="如：阴性" />
          </Form.Item>

          <Form.Item
            label="异常标准"
            name="abnormalCriteria"
          >
            <Input placeholder="如：阳性" />
          </Form.Item>

          <Form.Item
            label="临床意义"
            name="clinicalSignificance"
            rules={[{ required: true, message: '请输入临床意义' }]}
          >
            <TextArea 
              rows={3} 
              placeholder="请描述该分析项目的临床意义和应用场景"
            />
          </Form.Item>

          <Form.Item
            label="项目描述"
            name="description"
          >
            <TextArea 
              rows={2} 
              placeholder="请输入项目的详细描述（可选）"
            />
          </Form.Item>

          <Form.Item
            label="报告顺序"
            name="reportOrder"
            rules={[{ required: true, message: '请输入报告顺序' }]}
          >
            <InputNumber min={1} style={{ width: '100%' }} />
          </Form.Item>

          <Form.Item
            label="状态"
            name="status"
            rules={[{ required: true, message: '请选择状态' }]}
          >
            <Select>
              {statusOptions.map(status => (
                <Option key={status.value} value={status.value}>{status.label}</Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            label="是否启用"
            name="isActive"
            valuePropName="checked"
          >
            <Switch />
          </Form.Item>

          <Form.Item
            label="是否必需"
            name="isRequired"
            valuePropName="checked"
          >
            <Switch />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  )
}

export default AnalysisItemManagement