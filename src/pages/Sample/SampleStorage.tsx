import React, { useState, useEffect } from 'react'
import { 
  Card, 
  Table, 
  Input, 
  Button, 
  Space, 
  Tag, 
  Modal, 
  Form, 
  Select, 
  InputNumber,
  Row,
  Col,
  Tooltip,
  Popconfirm,
  message,
  Tree,
  Descriptions,
  Alert,
  Badge,
  Progress
} from 'antd'
import { 
  SearchOutlined, 
  PlusOutlined, 
  EditOutlined, 
  DeleteOutlined,
  EyeOutlined,
  EnvironmentOutlined,
  InboxOutlined,
  WarningOutlined,
  ExperimentOutlined
} from '@ant-design/icons'
import type { ColumnsType } from 'antd/es/table'
import type { TreeDataNode } from 'antd/es/tree'
import dayjs from 'dayjs'

const { Search } = Input
const { Option } = Select
const { TextArea } = Input

/**
 * 存储条件类型
 */
type StorageCondition = 'room_temp' | 'cold_4' | 'frozen_minus20' | 'frozen_minus80' | 'liquid_nitrogen'

/**
 * 样本存储状态
 */
type StorageStatus = 'stored' | 'in_use' | 'consumed' | 'expired' | 'missing'

/**
 * 样本存储记录接口
 */
interface SampleStorageRecord {
  id: string
  sampleCode: string
  sampleName: string
  sampleType: string
  storageLocation: string
  storageCondition: StorageCondition
  status: StorageStatus
  quantity: number
  unit: string
  remainingQuantity: number
  storageDate: string
  expiryDate?: string
  operator: string
  notes?: string
  containerType: string
  position: string
}

/**
 * 存储位置接口
 */
interface StorageLocation {
  id: string
  name: string
  type: 'freezer' | 'refrigerator' | 'room' | 'cabinet' | 'rack'
  capacity: number
  currentCount: number
  temperature?: number
  condition: StorageCondition
  parentId?: string
  children?: StorageLocation[]
}

/**
 * 样本存储页面组件
 * 
 * 功能特性：
 * - 样本存储位置管理
 * - 存储条件监控
 * - 库存数量跟踪
 * - 过期样本提醒
 * - 存储容量统计
 */
const SampleStorage: React.FC = () => {
  // 状态管理
  const [loading, setLoading] = useState(false)
  const [storageData, setStorageData] = useState<SampleStorageRecord[]>([])
  const [locationData, setLocationData] = useState<StorageLocation[]>([])
  const [selectedRecord, setSelectedRecord] = useState<SampleStorageRecord | null>(null)
  const [modalVisible, setModalVisible] = useState(false)
  const [detailModalVisible, setDetailModalVisible] = useState(false)
  const [locationModalVisible, setLocationModalVisible] = useState(false)
  const [editingRecord, setEditingRecord] = useState<SampleStorageRecord | null>(null)
  const [searchText, setSearchText] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('')
  const [conditionFilter, setConditionFilter] = useState<string>('')
  const [selectedLocation, setSelectedLocation] = useState<string>('')
  const [form] = Form.useForm()

  /**
   * 模拟存储位置数据
   */
  const mockLocationData: StorageLocation[] = [
    {
      id: 'freezer_1',
      name: '-80°C超低温冰箱A',
      type: 'freezer',
      capacity: 100,
      currentCount: 75,
      temperature: -80,
      condition: 'frozen_minus80',
      children: [
        {
          id: 'freezer_1_rack_1',
          name: '架子1',
          type: 'rack',
          capacity: 25,
          currentCount: 20,
          condition: 'frozen_minus80',
          parentId: 'freezer_1'
        },
        {
          id: 'freezer_1_rack_2',
          name: '架子2',
          type: 'rack',
          capacity: 25,
          currentCount: 18,
          condition: 'frozen_minus80',
          parentId: 'freezer_1'
        }
      ]
    },
    {
      id: 'freezer_2',
      name: '-20°C冰箱B',
      type: 'freezer',
      capacity: 80,
      currentCount: 45,
      temperature: -20,
      condition: 'frozen_minus20'
    },
    {
      id: 'fridge_1',
      name: '4°C冷藏柜A',
      type: 'refrigerator',
      capacity: 60,
      currentCount: 30,
      temperature: 4,
      condition: 'cold_4'
    }
  ]

  /**
   * 模拟存储数据
   */
  const mockStorageData: SampleStorageRecord[] = [
    {
      id: '1',
      sampleCode: 'S2024001',
      sampleName: '土壤样本A',
      sampleType: '土壤',
      storageLocation: '-80°C超低温冰箱A/架子1',
      storageCondition: 'frozen_minus80',
      status: 'stored',
      quantity: 5,
      unit: 'ml',
      remainingQuantity: 4.5,
      storageDate: '2024-01-15',
      expiryDate: '2025-01-15',
      operator: '张三',
      containerType: '冷冻管',
      position: 'A1-01',
      notes: '高质量DNA样本'
    },
    {
      id: '2',
      sampleCode: 'S2024002',
      sampleName: '水体样本B',
      sampleType: '水体',
      storageLocation: '4°C冷藏柜A',
      storageCondition: 'cold_4',
      status: 'in_use',
      quantity: 10,
      unit: 'ml',
      remainingQuantity: 7,
      storageDate: '2024-01-10',
      expiryDate: '2024-07-10',
      operator: '李四',
      containerType: '离心管',
      position: 'B2-05',
      notes: '用于微生物分析'
    },
    {
      id: '3',
      sampleCode: 'S2024003',
      sampleName: '植物样本C',
      sampleType: '植物',
      storageLocation: '-20°C冰箱B',
      storageCondition: 'frozen_minus20',
      status: 'expired',
      quantity: 2,
      unit: 'g',
      remainingQuantity: 2,
      storageDate: '2023-06-15',
      expiryDate: '2024-01-15',
      operator: '王五',
      containerType: '样本袋',
      position: 'C3-12',
      notes: '已过期，需要处理'
    }
  ]

  /**
   * 组件初始化
   */
  useEffect(() => {
    loadStorageData()
    loadLocationData()
  }, [])

  /**
   * 加载存储数据
   */
  const loadStorageData = async () => {
    setLoading(true)
    try {
      // 模拟API调用
      await new Promise(resolve => setTimeout(resolve, 1000))
      setStorageData(mockStorageData)
    } catch (error) {
      console.error('加载存储数据失败:', error)
    } finally {
      setLoading(false)
    }
  }

  /**
   * 加载位置数据
   */
  const loadLocationData = async () => {
    try {
      // 模拟API调用
      await new Promise(resolve => setTimeout(resolve, 500))
      setLocationData(mockLocationData)
    } catch (error) {
      console.error('加载位置数据失败:', error)
    }
  }

  /**
   * 获取存储条件文本
   */
  const getConditionText = (condition: StorageCondition) => {
    const textMap = {
      room_temp: '室温',
      cold_4: '4°C',
      frozen_minus20: '-20°C',
      frozen_minus80: '-80°C',
      liquid_nitrogen: '液氮'
    }
    return textMap[condition]
  }

  /**
   * 获取存储条件颜色
   */
  const getConditionColor = (condition: StorageCondition) => {
    const colorMap = {
      room_temp: 'default',
      cold_4: 'blue',
      frozen_minus20: 'cyan',
      frozen_minus80: 'purple',
      liquid_nitrogen: 'magenta'
    }
    return colorMap[condition]
  }

  /**
   * 获取状态颜色
   */
  const getStatusColor = (status: StorageStatus) => {
    const colorMap = {
      stored: 'green',
      in_use: 'orange',
      consumed: 'default',
      expired: 'red',
      missing: 'red'
    }
    return colorMap[status]
  }

  /**
   * 获取状态文本
   */
  const getStatusText = (status: StorageStatus) => {
    const textMap = {
      stored: '已存储',
      in_use: '使用中',
      consumed: '已消耗',
      expired: '已过期',
      missing: '缺失'
    }
    return textMap[status]
  }

  /**
   * 新增样本存储
   */
  const handleAdd = () => {
    setEditingRecord(null)
    form.resetFields()
    setModalVisible(true)
  }

  /**
   * 编辑样本存储
   */
  const handleEdit = (record: SampleStorageRecord) => {
    setEditingRecord(record)
    form.setFieldsValue(record)
    setModalVisible(true)
  }

  /**
   * 查看详情
   */
  const handleViewDetail = (record: SampleStorageRecord) => {
    setSelectedRecord(record)
    setDetailModalVisible(true)
  }

  /**
   * 删除样本存储
   */
  const handleDelete = async (id: string) => {
    try {
      // 模拟API调用
      await new Promise(resolve => setTimeout(resolve, 500))
      setStorageData(prev => prev.filter(item => item.id !== id))
      message.success('删除成功')
    } catch (error) {
      message.error('删除失败')
    }
  }

  /**
   * 保存样本存储
   */
  const handleSave = async (values: any) => {
    try {
      // 模拟API调用
      await new Promise(resolve => setTimeout(resolve, 500))
      
      if (editingRecord) {
        // 更新
        setStorageData(prev => prev.map(item => 
          item.id === editingRecord.id ? { ...item, ...values } : item
        ))
        message.success('更新成功')
      } else {
        // 新增
        const newRecord: SampleStorageRecord = {
          id: Date.now().toString(),
          ...values,
          storageDate: dayjs().format('YYYY-MM-DD'),
          operator: '当前用户'
        }
        setStorageData(prev => [...prev, newRecord])
        message.success('添加成功')
      }
      
      setModalVisible(false)
      form.resetFields()
    } catch (error) {
      message.error('保存失败')
    }
  }

  /**
   * 构建位置树数据
   */
  const buildLocationTreeData = (locations: StorageLocation[]): TreeDataNode[] => {
    return locations.map(location => ({
      title: (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span>
            <EnvironmentOutlined style={{ marginRight: 4 }} />
            {location.name}
          </span>
          <div>
            <Tag color={getConditionColor(location.condition)}>
              {getConditionText(location.condition)}
            </Tag>
            <Badge 
              count={location.currentCount} 
              overflowCount={999}
              style={{ backgroundColor: location.currentCount >= location.capacity * 0.9 ? '#ff4d4f' : '#52c41a' }}
            />
          </div>
        </div>
      ),
      key: location.id,
      children: location.children ? buildLocationTreeData(location.children) : undefined
    }))
  }

  /**
   * 过滤数据
   */
  const filteredData = storageData.filter(item => {
    const matchSearch = !searchText || 
      item.sampleCode.toLowerCase().includes(searchText.toLowerCase()) ||
      item.sampleName.toLowerCase().includes(searchText.toLowerCase()) ||
      item.storageLocation.toLowerCase().includes(searchText.toLowerCase())
    
    const matchStatus = !statusFilter || item.status === statusFilter
    const matchCondition = !conditionFilter || item.storageCondition === conditionFilter
    const matchLocation = !selectedLocation || item.storageLocation.includes(selectedLocation)
    
    return matchSearch && matchStatus && matchCondition && matchLocation
  })

  /**
   * 获取过期样本数量
   */
  const expiredCount = storageData.filter(item => 
    item.status === 'expired' || 
    (item.expiryDate && dayjs(item.expiryDate).isBefore(dayjs()))
  ).length

  /**
   * 表格列定义
   */
  const columns: ColumnsType<SampleStorageRecord> = [
    {
      title: '样本编号',
      dataIndex: 'sampleCode',
      key: 'sampleCode',
      width: 120,
      fixed: 'left'
    },
    {
      title: '样本名称',
      dataIndex: 'sampleName',
      key: 'sampleName',
      width: 150,
      ellipsis: true
    },
    {
      title: '样本类型',
      dataIndex: 'sampleType',
      key: 'sampleType',
      width: 100
    },
    {
      title: '存储位置',
      dataIndex: 'storageLocation',
      key: 'storageLocation',
      width: 200,
      ellipsis: true,
      render: (location: string) => (
        <Tooltip title={location}>
          <span>
            <EnvironmentOutlined style={{ marginRight: 4 }} />
            {location}
          </span>
        </Tooltip>
      )
    },
    {
      title: '存储条件',
      dataIndex: 'storageCondition',
      key: 'storageCondition',
      width: 100,
      render: (condition: StorageCondition) => (
        <Tag color={getConditionColor(condition)} icon={<EnvironmentOutlined />}>
          {getConditionText(condition)}
        </Tag>
      )
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: (status: StorageStatus) => (
        <Tag color={getStatusColor(status)}>
          {getStatusText(status)}
        </Tag>
      )
    },
    {
      title: '数量',
      key: 'quantity',
      width: 120,
      render: (_, record) => (
        <div>
          <div>{record.remainingQuantity}/{record.quantity} {record.unit}</div>
          <Progress 
            percent={Math.round((record.remainingQuantity / record.quantity) * 100)} 
            size="small" 
            showInfo={false}
            strokeColor={record.remainingQuantity / record.quantity < 0.2 ? '#ff4d4f' : '#52c41a'}
          />
        </div>
      )
    },
    {
      title: '位置编号',
      dataIndex: 'position',
      key: 'position',
      width: 100
    },
    {
      title: '存储日期',
      dataIndex: 'storageDate',
      key: 'storageDate',
      width: 120,
      render: (date: string) => dayjs(date).format('MM-DD')
    },
    {
      title: '过期日期',
      dataIndex: 'expiryDate',
      key: 'expiryDate',
      width: 120,
      render: (date?: string) => {
        if (!date) return '-'
        const isExpired = dayjs(date).isBefore(dayjs())
        return (
          <span style={{ color: isExpired ? '#ff4d4f' : undefined }}>
            {isExpired && <WarningOutlined style={{ marginRight: 4 }} />}
            {dayjs(date).format('MM-DD')}
          </span>
        )
      }
    },
    {
      title: '操作',
      key: 'action',
      width: 150,
      fixed: 'right',
      render: (_, record) => (
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
              onClick={() => handleEdit(record)}
            />
          </Tooltip>
          <Popconfirm
            title="确定要删除这条记录吗？"
            onConfirm={() => handleDelete(record.id)}
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
    }
  ]

  return (
    <div>
      {/* 统计信息 */}
      <Row gutter={16} style={{ marginBottom: 16 }}>
        <Col span={6}>
          <Card size="small">
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 24, fontWeight: 'bold', color: '#1890ff' }}>
                {storageData.length}
              </div>
              <div style={{ color: '#666' }}>总存储样本</div>
            </div>
          </Card>
        </Col>
        <Col span={6}>
          <Card size="small">
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 24, fontWeight: 'bold', color: '#52c41a' }}>
                {storageData.filter(item => item.status === 'stored').length}
              </div>
              <div style={{ color: '#666' }}>正常存储</div>
            </div>
          </Card>
        </Col>
        <Col span={6}>
          <Card size="small">
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 24, fontWeight: 'bold', color: '#faad14' }}>
                {storageData.filter(item => item.status === 'in_use').length}
              </div>
              <div style={{ color: '#666' }}>使用中</div>
            </div>
          </Card>
        </Col>
        <Col span={6}>
          <Card size="small">
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 24, fontWeight: 'bold', color: '#ff4d4f' }}>
                {expiredCount}
              </div>
              <div style={{ color: '#666' }}>过期/异常</div>
            </div>
          </Card>
        </Col>
      </Row>

      {/* 过期提醒 */}
      {expiredCount > 0 && (
        <Alert
          message="发现过期样本"
          description={`有 ${expiredCount} 个样本已过期或即将过期，请及时处理`}
          type="warning"
          showIcon
          closable
          style={{ marginBottom: 16 }}
        />
      )}

      {/* 搜索和筛选 */}
      <Card size="small" style={{ marginBottom: 16 }}>
        <Row gutter={16}>
          <Col span={6}>
            <Search
              placeholder="搜索样本编号、名称或位置"
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              onSearch={loadStorageData}
              enterButton={<SearchOutlined />}
            />
          </Col>
          <Col span={4}>
            <Select
              placeholder="状态筛选"
              value={statusFilter}
              onChange={setStatusFilter}
              allowClear
              style={{ width: '100%' }}
            >
              <Option value="stored">已存储</Option>
              <Option value="in_use">使用中</Option>
              <Option value="consumed">已消耗</Option>
              <Option value="expired">已过期</Option>
              <Option value="missing">缺失</Option>
            </Select>
          </Col>
          <Col span={4}>
            <Select
              placeholder="存储条件"
              value={conditionFilter}
              onChange={setConditionFilter}
              allowClear
              style={{ width: '100%' }}
            >
              <Option value="room_temp">室温</Option>
              <Option value="cold_4">4°C</Option>
              <Option value="frozen_minus20">-20°C</Option>
              <Option value="frozen_minus80">-80°C</Option>
              <Option value="liquid_nitrogen">液氮</Option>
            </Select>
          </Col>
          <Col span={6}>
            <Button 
              type="default" 
              icon={<EnvironmentOutlined />}
              onClick={() => setLocationModalVisible(true)}
              style={{ marginRight: 8 }}
            >
              存储位置
            </Button>
            <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
              新增存储
            </Button>
          </Col>
          <Col span={4}>
            <Button onClick={loadStorageData} loading={loading}>
              刷新数据
            </Button>
          </Col>
        </Row>
      </Card>

      {/* 存储数据表格 */}
      <Card title="样本存储列表" size="small">
        <Table
          columns={columns}
          dataSource={filteredData}
          rowKey="id"
          loading={loading}
          scroll={{ x: 1400 }}
          pagination={{
            total: filteredData.length,
            pageSize: 10,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total) => `共 ${total} 条记录`
          }}
        />
      </Card>

      {/* 新增/编辑模态框 */}
      <Modal
        title={editingRecord ? '编辑样本存储' : '新增样本存储'}
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        onOk={() => form.submit()}
        width={600}
      >
        <Form
          form={form}
          labelCol={{ span: 6 }}
          wrapperCol={{ span: 18 }}
          onFinish={handleSave}
        >
          <Form.Item
            name="sampleCode"
            label="样本编号"
            rules={[{ required: true, message: '请输入样本编号' }]}
          >
            <Input placeholder="请输入样本编号" />
          </Form.Item>

          <Form.Item
            name="sampleName"
            label="样本名称"
            rules={[{ required: true, message: '请输入样本名称' }]}
          >
            <Input placeholder="请输入样本名称" />
          </Form.Item>

          <Form.Item
            name="sampleType"
            label="样本类型"
            rules={[{ required: true, message: '请选择样本类型' }]}
          >
            <Select placeholder="请选择样本类型">
              <Option value="土壤">土壤</Option>
              <Option value="水体">水体</Option>
              <Option value="植物">植物</Option>
              <Option value="动物">动物</Option>
              <Option value="微生物">微生物</Option>
            </Select>
          </Form.Item>

          <Form.Item
            name="storageCondition"
            label="存储条件"
            rules={[{ required: true, message: '请选择存储条件' }]}
          >
            <Select placeholder="请选择存储条件">
              <Option value="room_temp">室温</Option>
              <Option value="cold_4">4°C</Option>
              <Option value="frozen_minus20">-20°C</Option>
              <Option value="frozen_minus80">-80°C</Option>
              <Option value="liquid_nitrogen">液氮</Option>
            </Select>
          </Form.Item>

          <Form.Item
            name="quantity"
            label="总数量"
            rules={[{ required: true, message: '请输入总数量' }]}
          >
            <InputNumber min={0} style={{ width: '100%' }} />
          </Form.Item>

          <Form.Item
            name="remainingQuantity"
            label="剩余数量"
            rules={[{ required: true, message: '请输入剩余数量' }]}
          >
            <InputNumber min={0} style={{ width: '100%' }} />
          </Form.Item>

          <Form.Item
            name="unit"
            label="单位"
            rules={[{ required: true, message: '请输入单位' }]}
          >
            <Select placeholder="请选择单位">
              <Option value="ml">ml</Option>
              <Option value="μl">μl</Option>
              <Option value="g">g</Option>
              <Option value="mg">mg</Option>
              <Option value="个">个</Option>
            </Select>
          </Form.Item>

          <Form.Item
            name="storageLocation"
            label="存储位置"
            rules={[{ required: true, message: '请输入存储位置' }]}
          >
            <Input placeholder="请输入存储位置" />
          </Form.Item>

          <Form.Item
            name="position"
            label="位置编号"
            rules={[{ required: true, message: '请输入位置编号' }]}
          >
            <Input placeholder="如：A1-01" />
          </Form.Item>

          <Form.Item
            name="containerType"
            label="容器类型"
            rules={[{ required: true, message: '请选择容器类型' }]}
          >
            <Select placeholder="请选择容器类型">
              <Option value="冷冻管">冷冻管</Option>
              <Option value="离心管">离心管</Option>
              <Option value="样本袋">样本袋</Option>
              <Option value="培养皿">培养皿</Option>
              <Option value="试管">试管</Option>
            </Select>
          </Form.Item>

          <Form.Item
            name="expiryDate"
            label="过期日期"
          >
            <Input type="date" />
          </Form.Item>

          <Form.Item
            name="notes"
            label="备注"
          >
            <TextArea rows={3} placeholder="请输入备注信息" />
          </Form.Item>
        </Form>
      </Modal>

      {/* 详情模态框 */}
      <Modal
        title="样本存储详情"
        open={detailModalVisible}
        onCancel={() => setDetailModalVisible(false)}
        footer={null}
        width={600}
      >
        {selectedRecord && (
          <Descriptions bordered size="small" column={2}>
            <Descriptions.Item label="样本编号">{selectedRecord.sampleCode}</Descriptions.Item>
            <Descriptions.Item label="样本名称">{selectedRecord.sampleName}</Descriptions.Item>
            <Descriptions.Item label="样本类型">{selectedRecord.sampleType}</Descriptions.Item>
            <Descriptions.Item label="存储条件">
              <Tag color={getConditionColor(selectedRecord.storageCondition)}>
                {getConditionText(selectedRecord.storageCondition)}
              </Tag>
            </Descriptions.Item>
            <Descriptions.Item label="状态">
              <Tag color={getStatusColor(selectedRecord.status)}>
                {getStatusText(selectedRecord.status)}
              </Tag>
            </Descriptions.Item>
            <Descriptions.Item label="数量">
              {selectedRecord.remainingQuantity}/{selectedRecord.quantity} {selectedRecord.unit}
            </Descriptions.Item>
            <Descriptions.Item label="存储位置" span={2}>
              <EnvironmentOutlined style={{ marginRight: 4 }} />
              {selectedRecord.storageLocation}
            </Descriptions.Item>
            <Descriptions.Item label="位置编号">{selectedRecord.position}</Descriptions.Item>
            <Descriptions.Item label="容器类型">{selectedRecord.containerType}</Descriptions.Item>
            <Descriptions.Item label="存储日期">{selectedRecord.storageDate}</Descriptions.Item>
            <Descriptions.Item label="过期日期">
              {selectedRecord.expiryDate || '无'}
            </Descriptions.Item>
            <Descriptions.Item label="操作人">{selectedRecord.operator}</Descriptions.Item>
            <Descriptions.Item label="备注" span={2}>
              {selectedRecord.notes || '无'}
            </Descriptions.Item>
          </Descriptions>
        )}
      </Modal>

      {/* 存储位置模态框 */}
      <Modal
        title="存储位置管理"
        open={locationModalVisible}
        onCancel={() => setLocationModalVisible(false)}
        footer={null}
        width={800}
      >
        <Tree
          treeData={buildLocationTreeData(locationData)}
          defaultExpandAll
          showLine
          showIcon={false}
        />
      </Modal>
    </div>
  )
}

export default SampleStorage