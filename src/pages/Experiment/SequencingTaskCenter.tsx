/**
 * 上机测序任务中心组件
 * 包含三个主要标签页：待测序混样、进行中测序、已完成测序
 * 支持测序任务创建、配置、监控和管理
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
  Alert,
  Descriptions,
  Switch,
  Slider,
  Radio,
  Collapse
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
  MergeCellsOutlined,
  ThunderboltOutlined,
  MonitorOutlined,
  DatabaseOutlined,
  LineChartOutlined,
  BarChartOutlined,
  PieChartOutlined,
  DashboardOutlined,
  SafetyOutlined,
  WarningOutlined,
  InfoCircleOutlined
} from '@ant-design/icons'
import type { ColumnsType } from 'antd/es/table'
import dayjs from 'dayjs'

const { TabPane } = Tabs
const { Option } = Select
const { TextArea } = Input
const { Title, Text } = Typography
const { Panel } = Collapse

/**
 * 混样池接口定义
 */
interface PoolingSample {
  id: string
  poolNumber: string
  poolName: string
  libraryCount: number
  concentration: number // nM
  volume: number // μL
  customerName: string
  completedDate: string
  status: 'pending' | 'assigned' | 'sequenced'
  priority: 'high' | 'medium' | 'low'
  qcResults: {
    concentration: number
    purity: number
    integrity: string
  }
}

/**
 * 测序任务接口定义
 */
interface SequencingTask {
  id: string
  taskNumber: string
  taskName: string
  status: 'pending' | 'configuring' | 'loading' | 'running' | 'completed' | 'failed'
  createdBy: string
  createdDate: string
  poolCount: number
  sequencer: string
  flowCellType: string
  estimatedCompletion: string
  pools: PoolingSample[]
  configuration: SequencingConfiguration
  runData?: SequencingRunData
}

/**
 * 测序配置接口定义
 */
interface SequencingConfiguration {
  sequencer: string
  flowCellType: string
  readLength: {
    read1: number
    read2: number
    index1: number
    index2: number
  }
  chemistry: string
  laneConfiguration: LaneConfiguration[]
  estimatedDataSize: number // GB
  estimatedRunTime: number // hours
}

/**
 * Lane配置接口定义
 */
interface LaneConfiguration {
  laneNumber: number
  poolId: string
  poolNumber: string
  loadingVolume: number // pM
  notes: string
}

/**
 * 测序运行数据接口定义
 */
interface SequencingRunData {
  runId: string
  startTime: string
  currentCycle: number
  totalCycles: number
  progress: number
  status: 'running' | 'paused' | 'completed' | 'error'
  errorCount: number
  dataGenerated: number // GB
  qualityMetrics: {
    clusterDensity: number
    passingFilter: number
    q30Score: number
  }
}

const SequencingTaskCenter: React.FC = () => {
  // 状态管理
  const [activeTab, setActiveTab] = useState('pending-pools')
  const [selectedPools, setSelectedPools] = useState<string[]>([])
  const [createTaskVisible, setCreateTaskVisible] = useState(false)
  const [taskDetailVisible, setTaskDetailVisible] = useState(false)
  const [configurationVisible, setConfigurationVisible] = useState(false)
  const [monitoringVisible, setMonitoringVisible] = useState(false)
  const [selectedTask, setSelectedTask] = useState<SequencingTask | null>(null)
  const [form] = Form.useForm()
  const [configForm] = Form.useForm()

  // 模拟数据
  const [pendingPools, setPendingPools] = useState<PoolingSample[]>([
    {
      id: '1',
      poolNumber: 'POOL001',
      poolName: '混样池1',
      libraryCount: 4,
      concentration: 10.5,
      volume: 100,
      customerName: '客户A',
      completedDate: '2024-01-15',
      status: 'pending',
      priority: 'high',
      qcResults: {
        concentration: 10.5,
        purity: 1.8,
        integrity: '良好'
      }
    },
    {
      id: '2',
      poolNumber: 'POOL002',
      poolName: '混样池2',
      libraryCount: 6,
      concentration: 12.3,
      volume: 120,
      customerName: '客户B',
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
      poolNumber: 'POOL003',
      poolName: '混样池3',
      libraryCount: 3,
      concentration: 11.7,
      volume: 80,
      customerName: '客户C',
      completedDate: '2024-01-17',
      status: 'pending',
      priority: 'low',
      qcResults: {
        concentration: 11.7,
        purity: 1.7,
        integrity: '优秀'
      }
    }
  ])

  const [runningTasks, setRunningTasks] = useState<SequencingTask[]>([
    {
      id: '1',
      taskNumber: 'SEQ001',
      taskName: '测序任务1',
      status: 'running',
      createdBy: '张三',
      createdDate: '2024-01-15',
      poolCount: 2,
      sequencer: 'NovaSeq 6000',
      flowCellType: 'S4',
      estimatedCompletion: '2024-01-18',
      pools: [],
      configuration: {
        sequencer: 'NovaSeq 6000',
        flowCellType: 'S4',
        readLength: { read1: 150, read2: 150, index1: 8, index2: 8 },
        chemistry: 'v1.5',
        laneConfiguration: [],
        estimatedDataSize: 200,
        estimatedRunTime: 24
      },
      runData: {
        runId: 'R2024011501',
        startTime: '2024-01-15 18:00',
        currentCycle: 35,
        totalCycles: 300,
        progress: 12,
        status: 'running',
        errorCount: 0,
        dataGenerated: 25,
        qualityMetrics: {
          clusterDensity: 220,
          passingFilter: 85.2,
          q30Score: 92.5
        }
      }
    },
    {
      id: '2',
      taskNumber: 'SEQ002',
      taskName: '测序任务2',
      status: 'loading',
      createdBy: '李四',
      createdDate: '2024-01-16',
      poolCount: 3,
      sequencer: 'HiSeq X Ten',
      flowCellType: 'HiSeq X',
      estimatedCompletion: '2024-01-19',
      pools: [],
      configuration: {
        sequencer: 'HiSeq X Ten',
        flowCellType: 'HiSeq X',
        readLength: { read1: 150, read2: 150, index1: 8, index2: 8 },
        chemistry: 'v2.5',
        laneConfiguration: [],
        estimatedDataSize: 300,
        estimatedRunTime: 30
      }
    }
  ])

  const [completedTasks, setCompletedTasks] = useState<SequencingTask[]>([
    {
      id: '3',
      taskNumber: 'SEQ003',
      taskName: '测序任务3',
      status: 'completed',
      createdBy: '王五',
      createdDate: '2024-01-10',
      poolCount: 4,
      sequencer: 'MiSeq',
      flowCellType: 'v3',
      estimatedCompletion: '2024-01-14',
      pools: [],
      configuration: {
        sequencer: 'MiSeq',
        flowCellType: 'v3',
        readLength: { read1: 300, read2: 300, index1: 8, index2: 8 },
        chemistry: 'v3',
        laneConfiguration: [],
        estimatedDataSize: 15,
        estimatedRunTime: 56
      },
      runData: {
        runId: 'R2024011001',
        startTime: '2024-01-10 09:00',
        currentCycle: 600,
        totalCycles: 600,
        progress: 100,
        status: 'completed',
        errorCount: 0,
        dataGenerated: 14.8,
        qualityMetrics: {
          clusterDensity: 180,
          passingFilter: 88.5,
          q30Score: 94.2
        }
      }
    }
  ])

  /**
   * 待测序混样表格列定义
   */
  const poolColumns: ColumnsType<PoolingSample> = [
    {
      title: '选择',
      dataIndex: 'select',
      width: 60,
      render: (_, record) => (
        <Checkbox
          checked={selectedPools.includes(record.id)}
          onChange={(e) => handlePoolSelection(record.id, e.target.checked)}
        />
      )
    },
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
            onClick={() => handleAssignToTask(record.id)}
          >
            分配测序
          </Button>
        </Space>
      )
    }
  ]

  /**
   * 进行中测序表格列定义
   */
  const runningTaskColumns: ColumnsType<SequencingTask> = [
    {
      title: '任务编号',
      dataIndex: 'taskNumber',
      key: 'taskNumber',
      width: 120
    },
    {
      title: '任务名称',
      dataIndex: 'taskName',
      key: 'taskName',
      width: 150
    },
    {
      title: '混样数量',
      dataIndex: 'poolCount',
      key: 'poolCount',
      width: 80,
      render: (count) => <Badge count={count} showZero color="green" />
    },
    {
      title: '测序仪',
      dataIndex: 'sequencer',
      key: 'sequencer',
      width: 120,
      render: (sequencer) => <Tag color="purple">{sequencer}</Tag>
    },
    {
      title: '芯片类型',
      dataIndex: 'flowCellType',
      key: 'flowCellType',
      width: 100
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: (status) => {
        const statusConfig = {
          configuring: { color: 'blue', text: '配置中' },
          loading: { color: 'orange', text: '上样中' },
          running: { color: 'processing', text: '运行中' },
          paused: { color: 'warning', text: '暂停' }
        }
        const config = statusConfig[status as keyof typeof statusConfig]
        return <Tag color={config?.color}>{config?.text}</Tag>
      }
    },
    {
      title: '进度',
      dataIndex: 'runData',
      key: 'progress',
      width: 120,
      render: (runData) => (
        runData ? (
          <Progress
            percent={runData.progress}
            size="small"
            status={runData.status === 'error' ? 'exception' : 'active'}
          />
        ) : (
          <Text type="secondary">未开始</Text>
        )
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
            onClick={() => handleViewTask(record)}
          >
            查看详情
          </Button>
          <Button
            type="link"
            size="small"
            icon={<MonitorOutlined />}
            onClick={() => handleMonitorTask(record)}
          >
            运行监控
          </Button>
          <Button
            type="link"
            size="small"
            icon={<SettingOutlined />}
            onClick={() => handleConfigureTask(record)}
          >
            配置
          </Button>
        </Space>
      )
    }
  ]

  /**
   * 已完成测序表格列定义
   */
  const completedTaskColumns: ColumnsType<SequencingTask> = [
    {
      title: '任务编号',
      dataIndex: 'taskNumber',
      key: 'taskNumber',
      width: 120
    },
    {
      title: '任务名称',
      dataIndex: 'taskName',
      key: 'taskName',
      width: 150
    },
    {
      title: '混样数量',
      dataIndex: 'poolCount',
      key: 'poolCount',
      width: 80,
      render: (count) => <Badge count={count} showZero color="green" />
    },
    {
      title: '测序仪',
      dataIndex: 'sequencer',
      key: 'sequencer',
      width: 120,
      render: (sequencer) => <Tag color="purple">{sequencer}</Tag>
    },
    {
      title: '数据量 (GB)',
      dataIndex: 'runData',
      key: 'dataGenerated',
      width: 100,
      render: (runData) => (
        <Tag color="success">{runData?.dataGenerated || '-'}</Tag>
      )
    },
    {
      title: 'Q30评分',
      dataIndex: 'runData',
      key: 'q30Score',
      width: 100,
      render: (runData) => (
        <Progress
          type="circle"
          size={40}
          percent={runData?.qualityMetrics?.q30Score || 0}
          format={(percent) => `${percent}%`}
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
      width: 200,
      render: (_, record) => (
        <Space size="small">
          <Button
            type="link"
            size="small"
            icon={<EyeOutlined />}
            onClick={() => handleViewTask(record)}
          >
            查看详情
          </Button>
          <Button
            type="link"
            size="small"
            icon={<FileTextOutlined />}
          >
            测序报告
          </Button>
          <Button
            type="link"
            size="small"
            icon={<DownloadOutlined />}
          >
            下载数据
          </Button>
        </Space>
      )
    }
  ]

  /**
   * 处理混样选择
   * @param poolId 混样ID
   * @param checked 是否选中
   */
  const handlePoolSelection = (poolId: string, checked: boolean) => {
    if (checked) {
      setSelectedPools([...selectedPools, poolId])
    } else {
      setSelectedPools(selectedPools.filter(id => id !== poolId))
    }
  }

  /**
   * 处理全选混样
   * @param checked 是否全选
   */
  const handleSelectAllPools = (checked: boolean) => {
    if (checked) {
      setSelectedPools(pendingPools.map(pool => pool.id))
    } else {
      setSelectedPools([])
    }
  }

  /**
   * 处理创建测序任务
   */
  const handleCreateTask = () => {
    setCreateTaskVisible(true)
  }

  /**
   * 处理提交测序任务创建
   */
  const handleSubmitTask = async () => {
    try {
      const values = await form.validateFields()
      
      // 创建新测序任务
      const newTask: SequencingTask = {
        id: Date.now().toString(),
        taskNumber: `SEQ${String(Date.now()).slice(-3)}`,
        taskName: values.taskName,
        status: 'configuring',
        createdBy: '当前用户',
        createdDate: dayjs().format('YYYY-MM-DD'),
        poolCount: selectedPools.length,
        sequencer: values.sequencer,
        flowCellType: values.flowCellType,
        estimatedCompletion: values.estimatedCompletion.format('YYYY-MM-DD'),
        pools: pendingPools.filter(pool => selectedPools.includes(pool.id)),
        configuration: {
          sequencer: values.sequencer,
          flowCellType: values.flowCellType,
          readLength: { read1: 150, read2: 150, index1: 8, index2: 8 },
          chemistry: values.chemistry,
          laneConfiguration: [],
          estimatedDataSize: 200,
          estimatedRunTime: 24
        }
      }

      // 更新状态
      setRunningTasks([...runningTasks, newTask])
      
      // 移除已分配的混样
      setPendingPools(pendingPools.filter(pool => !selectedPools.includes(pool.id)))
      
      // 重置选择
      setSelectedPools([])
      setCreateTaskVisible(false)
      form.resetFields()
      
      message.success('测序任务创建成功')
    } catch (error) {
      console.error('创建测序任务失败:', error)
    }
  }

  /**
   * 处理分配到测序任务
   * @param poolId 混样ID
   */
  const handleAssignToTask = (poolId: string) => {
    // 显示可用测序任务列表供选择
    Modal.confirm({
      title: '选择测序任务',
      content: '请选择要分配的测序任务',
      onOk: () => {
        message.success('混样已分配到测序任务')
      }
    })
  }

  /**
   * 处理查看任务详情
   * @param task 测序任务信息
   */
  const handleViewTask = (task: SequencingTask) => {
    setSelectedTask(task)
    setTaskDetailVisible(true)
  }

  /**
   * 处理配置任务
   * @param task 测序任务信息
   */
  const handleConfigureTask = (task: SequencingTask) => {
    setSelectedTask(task)
    setConfigurationVisible(true)
  }

  /**
   * 处理监控任务
   * @param task 测序任务信息
   */
  const handleMonitorTask = (task: SequencingTask) => {
    setSelectedTask(task)
    setMonitoringVisible(true)
  }

  return (
    <div style={{ padding: '24px' }}>
      {/* 页面标题和统计 */}
      <div style={{ marginBottom: '24px' }}>
        <Title level={2}>上机测序任务中心</Title>
        <Row gutter={16} style={{ marginTop: '16px' }}>
          <Col span={6}>
            <Card>
              <Statistic
                title="待测序混样"
                value={pendingPools.length}
                prefix={<MergeCellsOutlined />}
                valueStyle={{ color: '#1890ff' }}
              />
            </Card>
          </Col>
          <Col span={6}>
            <Card>
              <Statistic
                title="进行中测序"
                value={runningTasks.length}
                prefix={<PlayCircleOutlined />}
                valueStyle={{ color: '#52c41a' }}
              />
            </Card>
          </Col>
          <Col span={6}>
            <Card>
              <Statistic
                title="已完成测序"
                value={completedTasks.length}
                prefix={<CheckCircleOutlined />}
                valueStyle={{ color: '#722ed1' }}
              />
            </Card>
          </Col>
          <Col span={6}>
            <Card>
              <Statistic
                title="今日测序数"
                value={8}
                prefix={<ThunderboltOutlined />}
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
              key: 'pending-pools',
              label: (
                <span>
                  <MergeCellsOutlined />
                  待测序混样 ({pendingPools.length})
                </span>
              ),
              children: (
                <div>
                  {/* 批量操作按钮 */}
                  <div style={{ marginBottom: '16px' }}>
                    <Space>
                      <Checkbox
                        checked={selectedPools.length === pendingPools.length && pendingPools.length > 0}
                        indeterminate={selectedPools.length > 0 && selectedPools.length < pendingPools.length}
                        onChange={(e) => handleSelectAllPools(e.target.checked)}
                      >
                        全选
                      </Checkbox>
                      <Button
                        type="primary"
                        icon={<PlusOutlined />}
                        onClick={handleCreateTask}
                        disabled={selectedPools.length === 0}
                      >
                        创建测序任务并加入选中混样 ({selectedPools.length})
                      </Button>
                    </Space>
                  </div>

                  {/* 混样列表 */}
                  <Table
                    columns={poolColumns}
                    dataSource={pendingPools}
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
              key: 'running-tasks',
              label: (
                <span>
                  <PlayCircleOutlined />
                  进行中测序 ({runningTasks.length})
                </span>
              ),
              children: (
                <Table
                  columns={runningTaskColumns}
                  dataSource={runningTasks}
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
              key: 'completed-tasks',
              label: (
                <span>
                  <CheckCircleOutlined />
                  已完成测序 ({completedTasks.length})
                </span>
              ),
              children: (
                <Table
                  columns={completedTaskColumns}
                  dataSource={completedTasks}
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

      {/* 创建测序任务模态框 */}
      <Modal
        title="创建测序任务"
        open={createTaskVisible}
        onOk={handleSubmitTask}
        onCancel={() => {
          setCreateTaskVisible(false)
          form.resetFields()
        }}
        width={700}
      >
        <Form
          form={form}
          layout="vertical"
          initialValues={{
            estimatedCompletion: dayjs().add(2, 'day'),
            sequencer: 'NovaSeq 6000',
            flowCellType: 'S4',
            chemistry: 'v1.5'
          }}
        >
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="taskName"
                label="任务名称"
                rules={[{ required: true, message: '请输入任务名称' }]}
              >
                <Input placeholder="请输入任务名称" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="sequencer"
                label="测序仪"
                rules={[{ required: true, message: '请选择测序仪' }]}
              >
                <Select placeholder="请选择测序仪">
                  <Option value="NovaSeq 6000">NovaSeq 6000</Option>
                  <Option value="HiSeq X Ten">HiSeq X Ten</Option>
                  <Option value="MiSeq">MiSeq</Option>
                  <Option value="NextSeq 550">NextSeq 550</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="flowCellType"
                label="芯片类型"
                rules={[{ required: true, message: '请选择芯片类型' }]}
              >
                <Select placeholder="请选择芯片类型">
                  <Option value="S4">S4 Flow Cell</Option>
                  <Option value="S2">S2 Flow Cell</Option>
                  <Option value="S1">S1 Flow Cell</Option>
                  <Option value="HiSeq X">HiSeq X Flow Cell</Option>
                  <Option value="v3">MiSeq v3</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="chemistry"
                label="化学版本"
                rules={[{ required: true, message: '请选择化学版本' }]}
              >
                <Select placeholder="请选择化学版本">
                  <Option value="v1.5">v1.5试剂</Option>
                  <Option value="v2.5">v2.5试剂</Option>
                  <Option value="v3">v3试剂</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="estimatedCompletion"
                label="预计完成时间"
                rules={[{ required: true, message: '请选择预计完成时间' }]}
              >
                <DatePicker style={{ width: '100%' }} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="priority" label="优先级">
                <Select placeholder="请选择优先级" defaultValue="medium">
                  <Option value="high">高</Option>
                  <Option value="medium">中</Option>
                  <Option value="low">低</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>
          <Form.Item name="notes" label="备注">
            <TextArea rows={3} placeholder="请输入备注信息" />
          </Form.Item>
          
          <Divider />
          
          <div>
            <Text strong>选中的混样 ({selectedPools.length})</Text>
            <div style={{ marginTop: '8px', maxHeight: '200px', overflowY: 'auto' }}>
              {pendingPools
                .filter(pool => selectedPools.includes(pool.id))
                .map(pool => (
                  <Tag key={pool.id} style={{ margin: '2px' }}>
                    {pool.poolNumber} - {pool.concentration}nM
                  </Tag>
                ))}
            </div>
          </div>
        </Form>
      </Modal>

      {/* 测序任务详情抽屉 */}
      <Drawer
        title={`测序任务详情 - ${selectedTask?.taskNumber}`}
        placement="right"
        width={800}
        open={taskDetailVisible}
        onClose={() => setTaskDetailVisible(false)}
      >
        {selectedTask && (
          <div>
            {/* 任务基本信息 */}
            <Card title="任务信息" style={{ marginBottom: '16px' }}>
              <Descriptions column={2}>
                <Descriptions.Item label="任务编号">{selectedTask.taskNumber}</Descriptions.Item>
                <Descriptions.Item label="任务名称">{selectedTask.taskName}</Descriptions.Item>
                <Descriptions.Item label="状态">
                  <Tag color={selectedTask.status === 'completed' ? 'success' : 'processing'}>
                    {selectedTask.status === 'completed' ? '已完成' : 
                     selectedTask.status === 'running' ? '运行中' : 
                     selectedTask.status === 'loading' ? '上样中' : '配置中'}
                  </Tag>
                </Descriptions.Item>
                <Descriptions.Item label="创建人">{selectedTask.createdBy}</Descriptions.Item>
                <Descriptions.Item label="创建时间">{selectedTask.createdDate}</Descriptions.Item>
                <Descriptions.Item label="混样数量">
                  <Badge count={selectedTask.poolCount} showZero color="blue" />
                </Descriptions.Item>
                <Descriptions.Item label="测序仪">{selectedTask.sequencer}</Descriptions.Item>
                <Descriptions.Item label="芯片类型">{selectedTask.flowCellType}</Descriptions.Item>
                <Descriptions.Item label="预计完成">{selectedTask.estimatedCompletion}</Descriptions.Item>
              </Descriptions>
            </Card>

            {/* 运行数据 */}
            {selectedTask.runData && (
              <Card title="运行数据" style={{ marginBottom: '16px' }}>
                <Row gutter={16}>
                  <Col span={8}>
                    <Statistic
                      title="运行进度"
                      value={selectedTask.runData.progress}
                      suffix="%"
                    />
                  </Col>
                  <Col span={8}>
                    <Statistic
                      title="当前循环"
                      value={`${selectedTask.runData.currentCycle}/${selectedTask.runData.totalCycles}`}
                    />
                  </Col>
                  <Col span={8}>
                    <Statistic
                      title="数据量 (GB)"
                      value={selectedTask.runData.dataGenerated}
                      precision={1}
                    />
                  </Col>
                </Row>
                <Row gutter={16} style={{ marginTop: '16px' }}>
                  <Col span={8}>
                    <Statistic
                      title="簇密度"
                      value={selectedTask.runData.qualityMetrics.clusterDensity}
                      suffix="K/mm²"
                    />
                  </Col>
                  <Col span={8}>
                    <Statistic
                      title="通过过滤"
                      value={selectedTask.runData.qualityMetrics.passingFilter}
                      suffix="%"
                      precision={1}
                    />
                  </Col>
                  <Col span={8}>
                    <Statistic
                      title="Q30评分"
                      value={selectedTask.runData.qualityMetrics.q30Score}
                      suffix="%"
                      precision={1}
                    />
                  </Col>
                </Row>
              </Card>
            )}

            {/* 混样列表 */}
            <Card title="包含混样">
              <Table
                size="small"
                columns={[
                  { title: '混样编号', dataIndex: 'poolNumber', key: 'poolNumber' },
                  { title: '混样名称', dataIndex: 'poolName', key: 'poolName' },
                  { title: '文库数量', dataIndex: 'libraryCount', key: 'libraryCount' },
                  { title: '浓度 (nM)', dataIndex: 'concentration', key: 'concentration' },
                  { title: '体积 (μL)', dataIndex: 'volume', key: 'volume' }
                ]}
                dataSource={selectedTask.pools}
                rowKey="id"
                pagination={false}
              />
            </Card>
          </div>
        )}
      </Drawer>

      {/* 测序配置模态框 */}
      <Modal
        title={`测序配置 - ${selectedTask?.taskNumber}`}
        open={configurationVisible}
        onCancel={() => setConfigurationVisible(false)}
        width={1000}
        footer={[
          <Button key="save" type="primary">
            <SettingOutlined /> 保存配置
          </Button>,
          <Button key="start" type="primary" danger>
            <PlayCircleOutlined /> 开始上样
          </Button>,
          <Button key="close" onClick={() => setConfigurationVisible(false)}>
            关闭
          </Button>
        ]}
      >
        {selectedTask && (
          <div>
            <Alert
              message="测序配置"
              description={`测序仪: ${selectedTask.sequencer}，芯片类型: ${selectedTask.flowCellType}`}
              type="info"
              style={{ marginBottom: '16px' }}
            />
            
            <Collapse defaultActiveKey={['1', '2', '3']}>
              <Panel header="基本配置" key="1">
                <Row gutter={16}>
                  <Col span={8}>
                    <div>
                      <Text strong>读长设置</Text>
                      <div style={{ marginTop: '8px' }}>
                        <Text>Read1: {selectedTask.configuration.readLength.read1}bp</Text><br />
                        <Text>Read2: {selectedTask.configuration.readLength.read2}bp</Text><br />
                        <Text>Index1: {selectedTask.configuration.readLength.index1}bp</Text><br />
                        <Text>Index2: {selectedTask.configuration.readLength.index2}bp</Text>
                      </div>
                    </div>
                  </Col>
                  <Col span={8}>
                    <div>
                      <Text strong>化学版本</Text>
                      <div style={{ marginTop: '8px' }}>
                        <Tag color="blue">{selectedTask.configuration.chemistry}</Tag>
                      </div>
                    </div>
                  </Col>
                  <Col span={8}>
                    <div>
                      <Text strong>预计数据量</Text>
                      <div style={{ marginTop: '8px' }}>
                        <Text>{selectedTask.configuration.estimatedDataSize} GB</Text><br />
                        <Text>运行时间: {selectedTask.configuration.estimatedRunTime} 小时</Text>
                      </div>
                    </div>
                  </Col>
                </Row>
              </Panel>
              
              <Panel header="Lane配置" key="2">
                <Table
                  size="small"
                  columns={[
                    { title: 'Lane', dataIndex: 'laneNumber', key: 'laneNumber', width: 80 },
                    { title: '混样编号', dataIndex: 'poolNumber', key: 'poolNumber' },
                    { title: '上样体积 (pM)', dataIndex: 'loadingVolume', key: 'loadingVolume', width: 120 },
                    { title: '备注', dataIndex: 'notes', key: 'notes' }
                  ]}
                  dataSource={[
                    { laneNumber: 1, poolNumber: 'POOL001', loadingVolume: 100, notes: '' },
                    { laneNumber: 2, poolNumber: 'POOL002', loadingVolume: 100, notes: '' },
                    { laneNumber: 3, poolNumber: '空白对照', loadingVolume: 0, notes: '' },
                    { laneNumber: 4, poolNumber: '空白对照', loadingVolume: 0, notes: '' }
                  ]}
                  rowKey="laneNumber"
                  pagination={false}
                />
              </Panel>
              
              <Panel header="质控参数" key="3">
                <Row gutter={16}>
                  <Col span={8}>
                    <Text strong>簇密度范围</Text>
                    <div style={{ marginTop: '8px' }}>
                      <Slider range defaultValue={[180, 250]} min={100} max={300} />
                      <Text type="secondary">180-250 K/mm²</Text>
                    </div>
                  </Col>
                  <Col span={8}>
                    <Text strong>通过过滤阈值</Text>
                    <div style={{ marginTop: '8px' }}>
                      <Slider defaultValue={80} min={50} max={100} />
                      <Text type="secondary">≥80%</Text>
                    </div>
                  </Col>
                  <Col span={8}>
                    <Text strong>Q30评分阈值</Text>
                    <div style={{ marginTop: '8px' }}>
                      <Slider defaultValue={85} min={70} max={100} />
                      <Text type="secondary">≥85%</Text>
                    </div>
                  </Col>
                </Row>
              </Panel>
            </Collapse>
          </div>
        )}
      </Modal>

      {/* 运行监控模态框 */}
      <Modal
        title={`运行监控 - ${selectedTask?.sequencer} (${selectedTask?.runData?.runId})`}
        open={monitoringVisible}
        onCancel={() => setMonitoringVisible(false)}
        width={1200}
        footer={[
          <Button key="refresh" icon={<SyncOutlined />}>
            刷新数据
          </Button>,
          <Button key="export" icon={<DownloadOutlined />}>
            导出报告
          </Button>,
          <Button key="close" onClick={() => setMonitoringVisible(false)}>
            关闭
          </Button>
        ]}
      >
        {selectedTask?.runData && (
          <div>
            {/* 运行概览 */}
            <Card title="运行概览" style={{ marginBottom: '16px' }}>
              <Row gutter={16}>
                <Col span={6}>
                  <Statistic
                    title="运行ID"
                    value={selectedTask.runData.runId}
                    valueStyle={{ fontSize: '16px' }}
                  />
                </Col>
                <Col span={6}>
                  <Statistic
                    title="开始时间"
                    value={selectedTask.runData.startTime}
                    valueStyle={{ fontSize: '16px' }}
                  />
                </Col>
                <Col span={6}>
                  <Statistic
                    title="当前循环"
                    value={`${selectedTask.runData.currentCycle}/${selectedTask.runData.totalCycles}`}
                    valueStyle={{ fontSize: '16px' }}
                  />
                </Col>
                <Col span={6}>
                  <Statistic
                    title="剩余时间"
                    value="20.5小时"
                    valueStyle={{ fontSize: '16px' }}
                  />
                </Col>
              </Row>
              <Row gutter={16} style={{ marginTop: '16px' }}>
                <Col span={6}>
                  <Statistic
                    title="运行状态"
                    value="正常"
                    valueStyle={{ color: '#52c41a', fontSize: '16px' }}
                  />
                </Col>
                <Col span={6}>
                  <Statistic
                    title="错误数"
                    value={selectedTask.runData.errorCount}
                    valueStyle={{ fontSize: '16px' }}
                  />
                </Col>
                <Col span={6}>
                  <Statistic
                    title="数据量"
                    value={selectedTask.runData.dataGenerated}
                    suffix="GB"
                    precision={1}
                    valueStyle={{ fontSize: '16px' }}
                  />
                </Col>
                <Col span={6}>
                  <Statistic
                    title="完成进度"
                    value={selectedTask.runData.progress}
                    suffix="%"
                    valueStyle={{ fontSize: '16px' }}
                  />
                </Col>
              </Row>
            </Card>

            {/* 实时监控图表 */}
            <Row gutter={16}>
              <Col span={12}>
                <Card title="簇密度趋势图" size="small">
                  <div style={{ height: '200px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <LineChartOutlined style={{ fontSize: '48px', color: '#1890ff' }} />
                    <Text style={{ marginLeft: '16px' }}>簇密度趋势图</Text>
                  </div>
                </Card>
              </Col>
              <Col span={12}>
                <Card title="质量分数分布" size="small">
                  <div style={{ height: '200px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <BarChartOutlined style={{ fontSize: '48px', color: '#52c41a' }} />
                    <Text style={{ marginLeft: '16px' }}>质量分数分布</Text>
                  </div>
                </Card>
              </Col>
            </Row>

            <Row gutter={16} style={{ marginTop: '16px' }}>
              <Col span={12}>
                <Card title="错误率统计" size="small">
                  <div style={{ height: '200px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <PieChartOutlined style={{ fontSize: '48px', color: '#fa8c16' }} />
                    <Text style={{ marginLeft: '16px' }}>错误率统计</Text>
                  </div>
                </Card>
              </Col>
              <Col span={12}>
                <Card title="数据产出趋势" size="small">
                  <div style={{ height: '200px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <DashboardOutlined style={{ fontSize: '48px', color: '#722ed1' }} />
                    <Text style={{ marginLeft: '16px' }}>数据产出趋势</Text>
                  </div>
                </Card>
              </Col>
            </Row>

            {/* 质量指标 */}
            <Card title="质量指标" style={{ marginTop: '16px' }}>
              <Row gutter={16}>
                <Col span={8}>
                  <div style={{ textAlign: 'center' }}>
                    <Progress
                      type="circle"
                      percent={selectedTask.runData.qualityMetrics.clusterDensity / 3}
                      format={() => `${selectedTask.runData.qualityMetrics.clusterDensity}K`}
                    />
                    <div style={{ marginTop: '8px' }}>
                      <Text strong>簇密度</Text>
                    </div>
                  </div>
                </Col>
                <Col span={8}>
                  <div style={{ textAlign: 'center' }}>
                    <Progress
                      type="circle"
                      percent={selectedTask.runData.qualityMetrics.passingFilter}
                      format={(percent) => `${percent}%`}
                    />
                    <div style={{ marginTop: '8px' }}>
                      <Text strong>通过过滤</Text>
                    </div>
                  </div>
                </Col>
                <Col span={8}>
                  <div style={{ textAlign: 'center' }}>
                    <Progress
                      type="circle"
                      percent={selectedTask.runData.qualityMetrics.q30Score}
                      format={(percent) => `${percent}%`}
                    />
                    <div style={{ marginTop: '8px' }}>
                      <Text strong>Q30评分</Text>
                    </div>
                  </div>
                </Col>
              </Row>
            </Card>
          </div>
        )}
      </Modal>
    </div>
  )
}

export default SequencingTaskCenter