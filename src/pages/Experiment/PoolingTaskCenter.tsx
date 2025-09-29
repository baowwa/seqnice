/**
 * 混样任务中心组件
 * 包含三个主要标签页：待混样文库、进行中混样、已完成混样
 * 支持文库混样比例计算、混样任务创建和管理
 */
import React, { useState, useEffect } from 'react'
import {
  Card,
  Table,
  Button,
  Space,
  Tabs,
  Checkbox,
  Tag,
  Modal,
  Form,
  Input,
  Select,
  DatePicker,
  Row,
  Col,
  Drawer,
  Steps,
  Progress,
  Upload,
  message,
  Tooltip,
  Badge,
  Divider,
  List,
  Avatar,
  Statistic,
  Timeline,
  Typography,
  InputNumber,
  Alert
} from 'antd'
import {
  PlusOutlined,
  ExperimentOutlined,
  PlayCircleOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  FileTextOutlined,
  PrinterOutlined,
  UploadOutlined,
  DownloadOutlined,
  SettingOutlined,
  EyeOutlined,
  EditOutlined,
  DeleteOutlined,
  BarcodeOutlined,
  TeamOutlined,
  CalendarOutlined,
  AlertOutlined,
  SyncOutlined,
  CalculatorOutlined,
  MergeCellsOutlined
} from '@ant-design/icons'
import type { ColumnsType } from 'antd/es/table'
import dayjs from 'dayjs'

const { TabPane } = Tabs
const { Option } = Select
const { TextArea } = Input
const { Title, Text } = Typography

/**
 * 文库接口定义
 */
interface Library {
  id: string
  libraryNumber: string
  libraryName: string
  sampleNumber: string
  concentration: number // nM
  volume: number // μL
  insertSize: number // bp
  customerName: string
  experimentBatch: string
  completedDate: string
  status: 'pending' | 'assigned' | 'pooled' | 'sequenced'
  priority: 'high' | 'medium' | 'low'
  qcResults: {
    concentration: number
    purity: number
    integrity: string
  }
}

/**
 * 混样任务接口定义
 */
interface PoolingTask {
  id: string
  poolNumber: string
  poolName: string
  status: 'pending' | 'in_progress' | 'completed' | 'failed'
  createdBy: string
  createdDate: string
  libraryCount: number
  targetConcentration: number // nM
  totalVolume: number // μL
  estimatedCompletion: string
  libraries: Library[]
  poolingRatios: PoolingRatio[]
  qcResults?: {
    finalConcentration: number
    totalVolume: number
    qualityScore: number
  }
}

/**
 * 混样比例接口定义
 */
interface PoolingRatio {
  libraryId: string
  libraryNumber: string
  originalConcentration: number
  targetRatio: number // 百分比
  requiredVolume: number // μL
  dilutionFactor: number
}

const PoolingTaskCenter: React.FC = () => {
  // 状态管理
  const [activeTab, setActiveTab] = useState('pending-libraries')
  const [selectedLibraries, setSelectedLibraries] = useState<string[]>([])
  const [createPoolingVisible, setCreatePoolingVisible] = useState(false)
  const [poolingDetailVisible, setPoolingDetailVisible] = useState(false)
  const [ratioCalculatorVisible, setRatioCalculatorVisible] = useState(false)
  const [selectedPooling, setSelectedPooling] = useState<PoolingTask | null>(null)
  const [form] = Form.useForm()
  const [ratioForm] = Form.useForm()

  // 模拟数据
  const [pendingLibraries, setPendingLibraries] = useState<Library[]>([
    {
      id: '1',
      libraryNumber: 'LIB001',
      libraryName: '文库1',
      sampleNumber: 'S001',
      concentration: 15.5,
      volume: 50,
      insertSize: 350,
      customerName: '客户A',
      experimentBatch: 'B001',
      completedDate: '2024-01-15',
      status: 'pending',
      priority: 'high',
      qcResults: {
        concentration: 15.5,
        purity: 1.8,
        integrity: '良好'
      }
    },
    {
      id: '2',
      libraryNumber: 'LIB002',
      libraryName: '文库2',
      sampleNumber: 'S002',
      concentration: 12.3,
      volume: 45,
      insertSize: 380,
      customerName: '客户B',
      experimentBatch: 'B002',
      completedDate: '2024-01-16',
      status: 'pending',
      priority: 'medium',
      qcResults: {
        concentration: 12.3,
        purity: 1.9,
        integrity: '良好'
      }
    },
    {
      id: '3',
      libraryNumber: 'LIB003',
      libraryName: '文库3',
      sampleNumber: 'S003',
      concentration: 18.7,
      volume: 40,
      insertSize: 320,
      customerName: '客户C',
      experimentBatch: 'B003',
      completedDate: '2024-01-17',
      status: 'pending',
      priority: 'low',
      qcResults: {
        concentration: 18.7,
        purity: 1.7,
        integrity: '优秀'
      }
    }
  ])

  const [inProgressPoolings, setInProgressPoolings] = useState<PoolingTask[]>([
    {
      id: '1',
      poolNumber: 'POOL001',
      poolName: '混样池1',
      status: 'in_progress',
      createdBy: '张三',
      createdDate: '2024-01-15',
      libraryCount: 4,
      targetConcentration: 10.0,
      totalVolume: 100,
      estimatedCompletion: '2024-01-18',
      libraries: [],
      poolingRatios: []
    },
    {
      id: '2',
      poolNumber: 'POOL002',
      poolName: '混样池2',
      status: 'in_progress',
      createdBy: '李四',
      createdDate: '2024-01-16',
      libraryCount: 6,
      targetConcentration: 12.0,
      totalVolume: 120,
      estimatedCompletion: '2024-01-19',
      libraries: [],
      poolingRatios: []
    }
  ])

  const [completedPoolings, setCompletedPoolings] = useState<PoolingTask[]>([
    {
      id: '3',
      poolNumber: 'POOL003',
      poolName: '混样池3',
      status: 'completed',
      createdBy: '王五',
      createdDate: '2024-01-10',
      libraryCount: 8,
      targetConcentration: 15.0,
      totalVolume: 150,
      estimatedCompletion: '2024-01-14',
      libraries: [],
      poolingRatios: [],
      qcResults: {
        finalConcentration: 14.8,
        totalVolume: 148,
        qualityScore: 95
      }
    }
  ])

  /**
   * 待混样文库表格列定义
   */
  const libraryColumns: ColumnsType<Library> = [
    {
      title: '选择',
      dataIndex: 'select',
      width: 60,
      render: (_, record) => (
        <Checkbox
          checked={selectedLibraries.includes(record.id)}
          onChange={(e) => handleLibrarySelection(record.id, e.target.checked)}
        />
      )
    },
    {
      title: '文库编号',
      dataIndex: 'libraryNumber',
      key: 'libraryNumber',
      width: 120
    },
    {
      title: '文库名称',
      dataIndex: 'libraryName',
      key: 'libraryName',
      width: 150
    },
    {
      title: '样本编号',
      dataIndex: 'sampleNumber',
      key: 'sampleNumber',
      width: 120
    },
    {
      title: '浓度 (nM)',
      dataIndex: 'concentration',
      key: 'concentration',
      width: 100,
      render: (concentration) => (
        <Tag color="blue">{concentration}</Tag>
      )
    },
    {
      title: '体积 (μL)',
      dataIndex: 'volume',
      key: 'volume',
      width: 100
    },
    {
      title: '插入片段 (bp)',
      dataIndex: 'insertSize',
      key: 'insertSize',
      width: 120
    },
    {
      title: '客户名称',
      dataIndex: 'customerName',
      key: 'customerName',
      width: 120
    },
    {
      title: '优先级',
      dataIndex: 'priority',
      key: 'priority',
      width: 80,
      render: (priority) => (
        <Tag color={priority === 'high' ? 'red' : priority === 'medium' ? 'orange' : 'default'}>
          {priority === 'high' ? '高' : priority === 'medium' ? '中' : '低'}
        </Tag>
      )
    },
    {
      title: '完成日期',
      dataIndex: 'completedDate',
      key: 'completedDate',
      width: 120
    },
    {
      title: '操作',
      key: 'action',
      width: 120,
      render: (_, record) => (
        <Space size="small">
          <Button
            type="link"
            size="small"
            onClick={() => handleAddToPooling(record.id)}
          >
            加入混样
          </Button>
        </Space>
      )
    }
  ]

  /**
   * 进行中混样表格列定义
   */
  const inProgressPoolingColumns: ColumnsType<PoolingTask> = [
    {
      title: '混样编号',
      dataIndex: 'poolNumber',
      key: 'poolNumber',
      width: 120
    },
    {
      title: '混样名称',
      dataIndex: 'poolName',
      key: 'poolName',
      width: 150
    },
    {
      title: '文库数量',
      dataIndex: 'libraryCount',
      key: 'libraryCount',
      width: 80,
      render: (count) => <Badge count={count} showZero color="blue" />
    },
    {
      title: '目标浓度 (nM)',
      dataIndex: 'targetConcentration',
      key: 'targetConcentration',
      width: 120,
      render: (concentration) => <Tag color="green">{concentration}</Tag>
    },
    {
      title: '总体积 (μL)',
      dataIndex: 'totalVolume',
      key: 'totalVolume',
      width: 100
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: (status) => (
        <Tag color="processing">
          {status === 'in_progress' ? '进行中' : '待开始'}
        </Tag>
      )
    },
    {
      title: '创建人',
      dataIndex: 'createdBy',
      key: 'createdBy',
      width: 100
    },
    {
      title: '预计完成',
      dataIndex: 'estimatedCompletion',
      key: 'estimatedCompletion',
      width: 120
    },
    {
      title: '操作',
      key: 'action',
      width: 200,
      render: (_, record) => (
        <Space size="small">
          <Button
            type="link"
            size="small"
            icon={<EyeOutlined />}
            onClick={() => handleViewPooling(record)}
          >
            查看详情
          </Button>
          <Button
            type="link"
            size="small"
            icon={<CalculatorOutlined />}
            onClick={() => handleCalculateRatio(record)}
          >
            比例计算
          </Button>
        </Space>
      )
    }
  ]

  /**
   * 已完成混样表格列定义
   */
  const completedPoolingColumns: ColumnsType<PoolingTask> = [
    {
      title: '混样编号',
      dataIndex: 'poolNumber',
      key: 'poolNumber',
      width: 120
    },
    {
      title: '混样名称',
      dataIndex: 'poolName',
      key: 'poolName',
      width: 150
    },
    {
      title: '文库数量',
      dataIndex: 'libraryCount',
      key: 'libraryCount',
      width: 80,
      render: (count) => <Badge count={count} showZero color="green" />
    },
    {
      title: '最终浓度 (nM)',
      dataIndex: 'qcResults',
      key: 'finalConcentration',
      width: 120,
      render: (qcResults) => (
        <Tag color="success">{qcResults?.finalConcentration || '-'}</Tag>
      )
    },
    {
      title: '质量评分',
      dataIndex: 'qcResults',
      key: 'qualityScore',
      width: 100,
      render: (qcResults) => (
        <Progress
          type="circle"
          size={40}
          percent={qcResults?.qualityScore || 0}
          format={(percent) => `${percent}`}
        />
      )
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: (status) => (
        <Tag color={status === 'completed' ? 'success' : 'error'}>
          {status === 'completed' ? '已完成' : '失败'}
        </Tag>
      )
    },
    {
      title: '创建人',
      dataIndex: 'createdBy',
      key: 'createdBy',
      width: 100
    },
    {
      title: '完成日期',
      dataIndex: 'estimatedCompletion',
      key: 'estimatedCompletion',
      width: 120
    },
    {
      title: '操作',
      key: 'action',
      width: 150,
      render: (_, record) => (
        <Space size="small">
          <Button
            type="link"
            size="small"
            icon={<EyeOutlined />}
            onClick={() => handleViewPooling(record)}
          >
            查看详情
          </Button>
          <Button
            type="link"
            size="small"
            icon={<FileTextOutlined />}
          >
            QC报告
          </Button>
        </Space>
      )
    }
  ]

  /**
   * 处理文库选择
   * @param libraryId 文库ID
   * @param checked 是否选中
   */
  const handleLibrarySelection = (libraryId: string, checked: boolean) => {
    if (checked) {
      setSelectedLibraries([...selectedLibraries, libraryId])
    } else {
      setSelectedLibraries(selectedLibraries.filter(id => id !== libraryId))
    }
  }

  /**
   * 处理全选文库
   * @param checked 是否全选
   */
  const handleSelectAllLibraries = (checked: boolean) => {
    if (checked) {
      setSelectedLibraries(pendingLibraries.map(library => library.id))
    } else {
      setSelectedLibraries([])
    }
  }

  /**
   * 处理创建混样任务
   */
  const handleCreatePooling = () => {
    setCreatePoolingVisible(true)
  }

  /**
   * 处理提交混样任务创建
   */
  const handleSubmitPooling = async () => {
    try {
      const values = await form.validateFields()
      
      // 创建新混样任务
      const newPooling: PoolingTask = {
        id: Date.now().toString(),
        poolNumber: `POOL${String(Date.now()).slice(-3)}`,
        poolName: values.poolName,
        status: 'pending',
        createdBy: '当前用户',
        createdDate: dayjs().format('YYYY-MM-DD'),
        libraryCount: selectedLibraries.length,
        targetConcentration: values.targetConcentration,
        totalVolume: values.totalVolume,
        estimatedCompletion: values.estimatedCompletion.format('YYYY-MM-DD'),
        libraries: pendingLibraries.filter(library => selectedLibraries.includes(library.id)),
        poolingRatios: []
      }

      // 更新状态
      setInProgressPoolings([...inProgressPoolings, newPooling])
      
      // 移除已分配的文库
      setPendingLibraries(pendingLibraries.filter(library => !selectedLibraries.includes(library.id)))
      
      // 重置选择
      setSelectedLibraries([])
      setCreatePoolingVisible(false)
      form.resetFields()
      
      message.success('混样任务创建成功')
    } catch (error) {
      console.error('创建混样任务失败:', error)
    }
  }

  /**
   * 处理加入混样
   * @param libraryId 文库ID
   */
  const handleAddToPooling = (libraryId: string) => {
    // 显示可用混样任务列表供选择
    Modal.confirm({
      title: '选择混样任务',
      content: '请选择要加入的混样任务',
      onOk: () => {
        message.success('文库已加入混样任务')
      }
    })
  }

  /**
   * 处理查看混样详情
   * @param pooling 混样任务信息
   */
  const handleViewPooling = (pooling: PoolingTask) => {
    setSelectedPooling(pooling)
    setPoolingDetailVisible(true)
  }

  /**
   * 处理比例计算
   * @param pooling 混样任务信息
   */
  const handleCalculateRatio = (pooling: PoolingTask) => {
    setSelectedPooling(pooling)
    setRatioCalculatorVisible(true)
  }

  /**
   * 计算混样比例
   */
  const calculatePoolingRatios = () => {
    if (!selectedPooling) return

    const libraries = selectedPooling.libraries
    const targetConcentration = selectedPooling.targetConcentration
    const totalVolume = selectedPooling.totalVolume

    // 等比例混样计算
    const equalRatio = 100 / libraries.length
    const ratios: PoolingRatio[] = libraries.map(library => {
      const requiredVolume = (totalVolume * equalRatio) / 100
      const dilutionFactor = library.concentration / targetConcentration
      
      return {
        libraryId: library.id,
        libraryNumber: library.libraryNumber,
        originalConcentration: library.concentration,
        targetRatio: equalRatio,
        requiredVolume: requiredVolume,
        dilutionFactor: dilutionFactor
      }
    })

    // 更新混样任务的比例信息
    const updatedPooling = {
      ...selectedPooling,
      poolingRatios: ratios
    }
    
    setSelectedPooling(updatedPooling)
    message.success('混样比例计算完成')
  }

  return (
    <div style={{ padding: '24px' }}>
      {/* 页面标题和统计 */}
      <div style={{ marginBottom: '24px' }}>
        <Title level={2}>混样任务中心</Title>
        <Row gutter={16} style={{ marginTop: '16px' }}>
          <Col span={6}>
            <Card>
              <Statistic
                title="待混样文库"
                value={pendingLibraries.length}
                prefix={<ExperimentOutlined />}
                valueStyle={{ color: '#1890ff' }}
              />
            </Card>
          </Col>
          <Col span={6}>
            <Card>
              <Statistic
                title="进行中混样"
                value={inProgressPoolings.length}
                prefix={<PlayCircleOutlined />}
                valueStyle={{ color: '#52c41a' }}
              />
            </Card>
          </Col>
          <Col span={6}>
            <Card>
              <Statistic
                title="已完成混样"
                value={completedPoolings.length}
                prefix={<CheckCircleOutlined />}
                valueStyle={{ color: '#722ed1' }}
              />
            </Card>
          </Col>
          <Col span={6}>
            <Card>
              <Statistic
                title="今日混样数"
                value={12}
                prefix={<MergeCellsOutlined />}
                valueStyle={{ color: '#fa8c16' }}
              />
            </Card>
          </Col>
        </Row>
      </div>

      {/* 主要内容区域 */}
      <Card>
        <Tabs
          activeKey={activeTab}
          onChange={setActiveTab}
          items={[
            {
              key: 'pending-libraries',
              label: (
                <span>
                  <ExperimentOutlined />
                  待混样文库 ({pendingLibraries.length})
                </span>
              ),
              children: (
                <div>
                  {/* 批量操作按钮 */}
                  <div style={{ marginBottom: '16px' }}>
                    <Space>
                      <Checkbox
                        checked={selectedLibraries.length === pendingLibraries.length && pendingLibraries.length > 0}
                        indeterminate={selectedLibraries.length > 0 && selectedLibraries.length < pendingLibraries.length}
                        onChange={(e) => handleSelectAllLibraries(e.target.checked)}
                      >
                        全选
                      </Checkbox>
                      <Button
                        type="primary"
                        icon={<PlusOutlined />}
                        onClick={handleCreatePooling}
                        disabled={selectedLibraries.length === 0}
                      >
                        创建混样任务并加入选中文库 ({selectedLibraries.length})
                      </Button>
                    </Space>
                  </div>

                  {/* 文库列表 */}
                  <Table
                    columns={libraryColumns}
                    dataSource={pendingLibraries}
                    rowKey="id"
                    pagination={{
                      pageSize: 10,
                      showSizeChanger: true,
                      showQuickJumper: true,
                      showTotal: (total) => `共 ${total} 条记录`
                    }}
                  />
                </div>
              )
            },
            {
              key: 'in-progress-poolings',
              label: (
                <span>
                  <PlayCircleOutlined />
                  进行中混样 ({inProgressPoolings.length})
                </span>
              ),
              children: (
                <Table
                  columns={inProgressPoolingColumns}
                  dataSource={inProgressPoolings}
                  rowKey="id"
                  pagination={{
                    pageSize: 10,
                    showSizeChanger: true,
                    showQuickJumper: true,
                    showTotal: (total) => `共 ${total} 条记录`
                  }}
                />
              )
            },
            {
              key: 'completed-poolings',
              label: (
                <span>
                  <CheckCircleOutlined />
                  已完成混样 ({completedPoolings.length})
                </span>
              ),
              children: (
                <Table
                  columns={completedPoolingColumns}
                  dataSource={completedPoolings}
                  rowKey="id"
                  pagination={{
                    pageSize: 10,
                    showSizeChanger: true,
                    showQuickJumper: true,
                    showTotal: (total) => `共 ${total} 条记录`
                  }}
                />
              )
            }
          ]}
        />
      </Card>

      {/* 创建混样任务模态框 */}
      <Modal
        title="创建混样任务"
        open={createPoolingVisible}
        onOk={handleSubmitPooling}
        onCancel={() => {
          setCreatePoolingVisible(false)
          form.resetFields()
        }}
        width={600}
      >
        <Form
          form={form}
          layout="vertical"
          initialValues={{
            estimatedCompletion: dayjs().add(2, 'day'),
            targetConcentration: 10.0,
            totalVolume: 100
          }}
        >
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="poolName"
                label="混样名称"
                rules={[{ required: true, message: '请输入混样名称' }]}
              >
                <Input placeholder="请输入混样名称" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="targetConcentration"
                label="目标浓度 (nM)"
                rules={[{ required: true, message: '请输入目标浓度' }]}
              >
                <InputNumber
                  min={0.1}
                  max={100}
                  step={0.1}
                  placeholder="请输入目标浓度"
                  style={{ width: '100%' }}
                />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="totalVolume"
                label="总体积 (μL)"
                rules={[{ required: true, message: '请输入总体积' }]}
              >
                <InputNumber
                  min={10}
                  max={1000}
                  step={10}
                  placeholder="请输入总体积"
                  style={{ width: '100%' }}
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="estimatedCompletion"
                label="预计完成时间"
                rules={[{ required: true, message: '请选择预计完成时间' }]}
              >
                <DatePicker style={{ width: '100%' }} />
              </Form.Item>
            </Col>
          </Row>
          <Form.Item name="notes" label="备注">
            <TextArea rows={3} placeholder="请输入备注信息" />
          </Form.Item>
          
          <Divider />
          
          <div>
            <Text strong>选中的文库 ({selectedLibraries.length})</Text>
            <div style={{ marginTop: '8px', maxHeight: '200px', overflowY: 'auto' }}>
              {pendingLibraries
                .filter(library => selectedLibraries.includes(library.id))
                .map(library => (
                  <Tag key={library.id} style={{ margin: '2px' }}>
                    {library.libraryNumber} - {library.concentration}nM
                  </Tag>
                ))}
            </div>
          </div>
        </Form>
      </Modal>

      {/* 混样详情抽屉 */}
      <Drawer
        title={`混样详情 - ${selectedPooling?.poolNumber}`}
        placement="right"
        width={800}
        open={poolingDetailVisible}
        onClose={() => setPoolingDetailVisible(false)}
      >
        {selectedPooling && (
          <div>
            {/* 混样基本信息 */}
            <Card title="混样信息" style={{ marginBottom: '16px' }}>
              <Row gutter={16}>
                <Col span={8}>
                  <Text strong>混样编号：</Text>
                  <br />
                  <Text>{selectedPooling.poolNumber}</Text>
                </Col>
                <Col span={8}>
                  <Text strong>混样名称：</Text>
                  <br />
                  <Text>{selectedPooling.poolName}</Text>
                </Col>
                <Col span={8}>
                  <Text strong>状态：</Text>
                  <br />
                  <Tag color={selectedPooling.status === 'completed' ? 'success' : 'processing'}>
                    {selectedPooling.status === 'completed' ? '已完成' : 
                     selectedPooling.status === 'in_progress' ? '进行中' : '待开始'}
                  </Tag>
                </Col>
              </Row>
              <Row gutter={16} style={{ marginTop: '16px' }}>
                <Col span={8}>
                  <Text strong>创建人：</Text>
                  <br />
                  <Text>{selectedPooling.createdBy}</Text>
                </Col>
                <Col span={8}>
                  <Text strong>创建时间：</Text>
                  <br />
                  <Text>{selectedPooling.createdDate}</Text>
                </Col>
                <Col span={8}>
                  <Text strong>文库数量：</Text>
                  <br />
                  <Badge count={selectedPooling.libraryCount} showZero color="blue" />
                </Col>
              </Row>
              <Row gutter={16} style={{ marginTop: '16px' }}>
                <Col span={8}>
                  <Text strong>目标浓度：</Text>
                  <br />
                  <Text>{selectedPooling.targetConcentration} nM</Text>
                </Col>
                <Col span={8}>
                  <Text strong>总体积：</Text>
                  <br />
                  <Text>{selectedPooling.totalVolume} μL</Text>
                </Col>
                <Col span={8}>
                  <Text strong>预计完成：</Text>
                  <br />
                  <Text>{selectedPooling.estimatedCompletion}</Text>
                </Col>
              </Row>
            </Card>

            {/* QC结果 */}
            {selectedPooling.qcResults && (
              <Card title="QC结果" style={{ marginBottom: '16px' }}>
                <Row gutter={16}>
                  <Col span={8}>
                    <Statistic
                      title="最终浓度 (nM)"
                      value={selectedPooling.qcResults.finalConcentration}
                      precision={1}
                    />
                  </Col>
                  <Col span={8}>
                    <Statistic
                      title="实际体积 (μL)"
                      value={selectedPooling.qcResults.totalVolume}
                      precision={0}
                    />
                  </Col>
                  <Col span={8}>
                    <Statistic
                      title="质量评分"
                      value={selectedPooling.qcResults.qualityScore}
                      suffix="%"
                    />
                  </Col>
                </Row>
              </Card>
            )}

            {/* 文库列表 */}
            <Card title="包含文库">
              <Table
                size="small"
                columns={[
                  { title: '文库编号', dataIndex: 'libraryNumber', key: 'libraryNumber' },
                  { title: '样本编号', dataIndex: 'sampleNumber', key: 'sampleNumber' },
                  { title: '浓度 (nM)', dataIndex: 'concentration', key: 'concentration' },
                  { title: '体积 (μL)', dataIndex: 'volume', key: 'volume' },
                  { title: '插入片段 (bp)', dataIndex: 'insertSize', key: 'insertSize' }
                ]}
                dataSource={selectedPooling.libraries}
                rowKey="id"
                pagination={false}
              />
            </Card>
          </div>
        )}
      </Drawer>

      {/* 比例计算器模态框 */}
      <Modal
        title={`混样比例计算 - ${selectedPooling?.poolNumber}`}
        open={ratioCalculatorVisible}
        onCancel={() => setRatioCalculatorVisible(false)}
        width={1000}
        footer={[
          <Button key="calculate" type="primary" onClick={calculatePoolingRatios}>
            <CalculatorOutlined /> 计算比例
          </Button>,
          <Button key="close" onClick={() => setRatioCalculatorVisible(false)}>
            关闭
          </Button>
        ]}
      >
        {selectedPooling && (
          <div>
            <Alert
              message="混样比例计算"
              description={`目标浓度: ${selectedPooling.targetConcentration} nM，总体积: ${selectedPooling.totalVolume} μL`}
              type="info"
              style={{ marginBottom: '16px' }}
            />
            
            <Table
              size="small"
              columns={[
                { title: '文库编号', dataIndex: 'libraryNumber', key: 'libraryNumber' },
                { title: '原始浓度 (nM)', dataIndex: 'originalConcentration', key: 'originalConcentration' },
                { title: '目标比例 (%)', dataIndex: 'targetRatio', key: 'targetRatio', render: (ratio) => ratio?.toFixed(1) },
                { title: '所需体积 (μL)', dataIndex: 'requiredVolume', key: 'requiredVolume', render: (volume) => volume?.toFixed(1) },
                { title: '稀释倍数', dataIndex: 'dilutionFactor', key: 'dilutionFactor', render: (factor) => factor?.toFixed(2) }
              ]}
              dataSource={selectedPooling.poolingRatios}
              rowKey="libraryId"
              pagination={false}
            />
          </div>
        )}
      </Modal>
    </div>
  )
}

export default PoolingTaskCenter