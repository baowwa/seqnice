import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
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
  Row,
  Col,
  Tooltip,
  message,
  Steps,
  Descriptions,
  Transfer,
  Divider,
  InputNumber,
  DatePicker,
  Checkbox,
  Alert,
  Badge,
  Progress,
  Tabs,
  List,
  Avatar,
  Typography,
  Statistic,
  Timeline,
  Drawer,
  Radio,
  Popconfirm,
  Empty,
  Spin
} from 'antd';
import { 
  PlusOutlined, 
  EditOutlined, 
  DeleteOutlined,
  EyeOutlined,
  ExperimentOutlined,
  UserOutlined,
  CalendarOutlined,
  BarcodeOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  WarningOutlined,
  FileTextOutlined,
  SettingOutlined,
  PlayCircleOutlined,
  PauseCircleOutlined,
  StopOutlined,
  ReloadOutlined,
  FilterOutlined,
  SearchOutlined,
  TeamOutlined,
  ToolOutlined,
  DashboardOutlined,
  ProjectOutlined,
  HistoryOutlined,
  BellOutlined
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import type { TransferDirection } from 'antd/es/transfer';
import dayjs from 'dayjs';

const { Search } = Input;
const { Option } = Select;
const { TextArea } = Input;
const { Step } = Steps;
const { TabPane } = Tabs;
const { Text, Title } = Typography;

/**
 * 批次状态枚举
 */
type BatchStatus = 'draft' | 'planning' | 'ready' | 'in_progress' | 'completed' | 'cancelled' | 'paused';

/**
 * 实验类型枚举
 */
type ExperimentType = 'preprocessing' | 'library_construction' | 'sequencing' | 'analysis';

/**
 * 任务优先级枚举
 */
type TaskPriority = 'low' | 'medium' | 'high' | 'urgent';

/**
 * 任务状态枚举
 */
type TaskStatus = 'pending' | 'in_progress' | 'completed' | 'failed' | 'cancelled';

/**
 * 样本接口定义
 */
interface Sample {
  id: string;
  sampleCode: string;
  sampleName: string;
  sampleType: string;
  projectName: string;
  clientName: string;
  receivedDate: string;
  status: string;
  volume: number;
  concentration?: number;
  quality?: string;
  notes?: string;
}

/**
 * 试剂接口定义
 */
interface Reagent {
  id: string;
  name: string;
  type: string;
  brand: string;
  catalogNumber: string;
  lotNumber: string;
  expiryDate: string;
  quantity: number;
  unit: string;
  storageCondition: string;
  cost: number;
}

/**
 * 设备接口定义
 */
interface Equipment {
  id: string;
  name: string;
  model: string;
  type: string;
  status: string;
  location: string;
  capacity: number;
  currentLoad: number;
  nextAvailable: string;
}

/**
 * 实验批次接口定义
 */
interface ExperimentBatch {
  id: string;
  batchCode: string;
  batchName: string;
  experimentType: ExperimentType;
  status: BatchStatus;
  sampleCount: number;
  samples: Sample[];
  reagents: Reagent[];
  equipment: Equipment[];
  operator: string;
  plannedStartDate: string;
  plannedEndDate: string;
  actualStartDate?: string;
  actualEndDate?: string;
  estimatedDuration: number;
  priority: TaskPriority;
  notes?: string;
  createdBy: string;
  createdTime: string;
  updatedTime: string;
  protocol?: string;
  qualityRequirements?: string[];
  costEstimate: number;
  progress: number;
}

/**
 * 任务接口定义
 */
interface Task {
  id: string;
  taskName: string;
  taskType: ExperimentType;
  status: TaskStatus;
  priority: TaskPriority;
  assignee: string;
  batchId?: string;
  batchName?: string;
  sampleCount: number;
  estimatedDuration: number;
  actualDuration?: number;
  startTime?: string;
  endTime?: string;
  progress: number;
  notes?: string;
  createdTime: string;
  updatedTime: string;
}

/**
 * 实验任务管理组件
 * 实现任务中心+批次管理的双核心理念
 * 支持任务调度、批次创建、执行监控等功能
 */
const ExperimentTaskManagement: React.FC = () => {
  const navigate = useNavigate();
  
  // 状态管理
  const [activeTab, setActiveTab] = useState<string>('taskCenter');
  const [loading, setLoading] = useState(false);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [batches, setBatches] = useState<ExperimentBatch[]>([]);
  const [samples, setSamples] = useState<Sample[]>([]);
  const [reagents, setReagents] = useState<Reagent[]>([]);
  const [equipment, setEquipment] = useState<Equipment[]>([]);
  
  // 模态框状态
  const [taskModalVisible, setTaskModalVisible] = useState(false);
  const [batchModalVisible, setBatchModalVisible] = useState(false);
  const [detailDrawerVisible, setDetailDrawerVisible] = useState(false);
  const [wizardModalVisible, setWizardModalVisible] = useState(false);
  
  // 选中项状态
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [selectedBatch, setSelectedBatch] = useState<ExperimentBatch | null>(null);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [editingBatch, setEditingBatch] = useState<ExperimentBatch | null>(null);
  
  // 筛选状态
  const [taskStatusFilter, setTaskStatusFilter] = useState<TaskStatus | ''>('');
  const [batchStatusFilter, setBatchStatusFilter] = useState<BatchStatus | ''>('');
  const [priorityFilter, setPriorityFilter] = useState<TaskPriority | ''>('');
  const [assigneeFilter, setAssigneeFilter] = useState<string>('');
  const [searchText, setSearchText] = useState('');
  
  // 向导步骤
  const [wizardStep, setWizardStep] = useState(0);
  const [wizardData, setWizardData] = useState<any>({});
  
  // 表单实例
  const [taskForm] = Form.useForm();
  const [batchForm] = Form.useForm();

  // 模拟数据
  const mockTasks: Task[] = [
    {
      id: '1',
      taskName: '环境样本DNA提取',
      taskType: 'preprocessing',
      status: 'in_progress',
      priority: 'high',
      assignee: '张三',
      batchId: 'BATCH001',
      batchName: '环境样本前处理批次',
      sampleCount: 24,
      estimatedDuration: 480,
      actualDuration: 320,
      startTime: '2024-01-20 09:00:00',
      progress: 67,
      notes: '进展顺利，预计今日完成',
      createdTime: '2024-01-19 16:00:00',
      updatedTime: '2024-01-20 14:30:00'
    },
    {
      id: '2',
      taskName: '文库构建任务',
      taskType: 'library_construction',
      status: 'pending',
      priority: 'medium',
      assignee: '李四',
      sampleCount: 12,
      estimatedDuration: 360,
      progress: 0,
      notes: '等待前处理完成',
      createdTime: '2024-01-20 10:00:00',
      updatedTime: '2024-01-20 10:00:00'
    },
    {
      id: '3',
      taskName: '上机测序',
      taskType: 'sequencing',
      status: 'completed',
      priority: 'high',
      assignee: '王五',
      batchId: 'BATCH002',
      batchName: '测序批次A',
      sampleCount: 96,
      estimatedDuration: 1440,
      actualDuration: 1380,
      startTime: '2024-01-18 08:00:00',
      endTime: '2024-01-19 07:00:00',
      progress: 100,
      notes: '测序完成，数据质量良好',
      createdTime: '2024-01-17 14:00:00',
      updatedTime: '2024-01-19 07:30:00'
    }
  ];

  const mockBatches: ExperimentBatch[] = [
    {
      id: 'BATCH001',
      batchCode: 'BATCH001',
      batchName: '环境样本前处理批次',
      experimentType: 'preprocessing',
      status: 'in_progress',
      sampleCount: 24,
      samples: [],
      reagents: [],
      equipment: [],
      operator: '张三',
      plannedStartDate: '2024-01-20',
      plannedEndDate: '2024-01-22',
      actualStartDate: '2024-01-20',
      estimatedDuration: 48,
      priority: 'high',
      notes: '紧急项目，需要优先处理',
      createdBy: '实验主管',
      createdTime: '2024-01-19 10:00:00',
      updatedTime: '2024-01-20 09:30:00',
      protocol: 'DNA提取标准流程v2.1',
      qualityRequirements: ['DNA浓度>50ng/μL', 'OD260/280比值1.8-2.0'],
      costEstimate: 1250.0,
      progress: 67
    },
    {
      id: 'BATCH002',
      batchCode: 'BATCH002',
      batchName: '测序批次A',
      experimentType: 'sequencing',
      status: 'completed',
      sampleCount: 96,
      samples: [],
      reagents: [],
      equipment: [],
      operator: '王五',
      plannedStartDate: '2024-01-18',
      plannedEndDate: '2024-01-19',
      actualStartDate: '2024-01-18',
      actualEndDate: '2024-01-19',
      estimatedDuration: 24,
      priority: 'high',
      notes: '测序完成，数据质量良好',
      createdBy: '测序主管',
      createdTime: '2024-01-17 14:00:00',
      updatedTime: '2024-01-19 07:30:00',
      protocol: 'NovaSeq测序标准流程',
      qualityRequirements: ['Q30>85%', '数据产出>30Gb'],
      costEstimate: 8500.0,
      progress: 100
    }
  ];

  // 组件初始化
  useEffect(() => {
    loadData();
  }, []);

  // 加载数据
  const loadData = async () => {
    setLoading(true);
    try {
      // 模拟API调用
      await new Promise(resolve => setTimeout(resolve, 1000));
      setTasks(mockTasks);
      setBatches(mockBatches);
    } catch (error) {
      message.error('加载数据失败');
    } finally {
      setLoading(false);
    }
  };

  // 状态颜色映射
  const getStatusColor = (status: TaskStatus | BatchStatus) => {
    const colorMap = {
      pending: 'orange',
      in_progress: 'blue',
      completed: 'green',
      failed: 'red',
      cancelled: 'gray',
      paused: 'purple',
      draft: 'default',
      planning: 'cyan',
      ready: 'lime'
    };
    return colorMap[status as keyof typeof colorMap];
  };

  // 状态文本映射
  const getStatusText = (status: TaskStatus | BatchStatus) => {
    const textMap = {
      pending: '待执行',
      in_progress: '执行中',
      completed: '已完成',
      failed: '失败',
      cancelled: '已取消',
      paused: '已暂停',
      draft: '草稿',
      planning: '计划中',
      ready: '就绪'
    };
    return textMap[status as keyof typeof textMap];
  };

  // 优先级颜色映射
  const getPriorityColor = (priority: TaskPriority) => {
    const colorMap = {
      low: 'green',
      medium: 'orange',
      high: 'red',
      urgent: 'purple'
    };
    return colorMap[priority];
  };

  // 优先级文本映射
  const getPriorityText = (priority: TaskPriority) => {
    const textMap = {
      low: '低',
      medium: '中',
      high: '高',
      urgent: '紧急'
    };
    return textMap[priority];
  };

  // 实验类型文本映射
  const getExperimentTypeText = (type: ExperimentType) => {
    const textMap = {
      preprocessing: '前处理',
      library_construction: '文库构建',
      sequencing: '上机测序',
      analysis: '数据分析'
    };
    return textMap[type];
  };

  // 处理任务操作
  const handleTaskAction = (action: string, task: Task) => {
    switch (action) {
      case 'start':
        message.success(`任务 ${task.taskName} 已开始执行`);
        break;
      case 'pause':
        message.success(`任务 ${task.taskName} 已暂停`);
        break;
      case 'resume':
        message.success(`任务 ${task.taskName} 已恢复执行`);
        break;
      case 'complete':
        message.success(`任务 ${task.taskName} 已完成`);
        break;
      case 'cancel':
        message.success(`任务 ${task.taskName} 已取消`);
        break;
      default:
        break;
    }
  };

  // 处理批次操作
  const handleBatchAction = (action: string, batch: ExperimentBatch) => {
    switch (action) {
      case 'start':
        message.success(`批次 ${batch.batchName} 已开始执行`);
        break;
      case 'pause':
        message.success(`批次 ${batch.batchName} 已暂停`);
        break;
      case 'resume':
        message.success(`批次 ${batch.batchName} 已恢复执行`);
        break;
      case 'complete':
        message.success(`批次 ${batch.batchName} 已完成`);
        break;
      case 'cancel':
        message.success(`批次 ${batch.batchName} 已取消`);
        break;
      case 'execute':
        // 跳转到批次执行界面
        navigate('/experiment/batch-execution', { 
          state: { batchId: batch.id, batchCode: batch.batchCode } 
        });
        break;
      default:
        break;
    }
  };

  // 任务中心统计数据
  const taskStats = {
    total: tasks.length,
    pending: tasks.filter(t => t.status === 'pending').length,
    inProgress: tasks.filter(t => t.status === 'in_progress').length,
    completed: tasks.filter(t => t.status === 'completed').length,
    failed: tasks.filter(t => t.status === 'failed').length
  };

  // 批次管理统计数据
  const batchStats = {
    total: batches.length,
    draft: batches.filter(b => b.status === 'draft').length,
    planning: batches.filter(b => b.status === 'planning').length,
    inProgress: batches.filter(b => b.status === 'in_progress').length,
    completed: batches.filter(b => b.status === 'completed').length
  };

  // 任务表格列定义
  const taskColumns: ColumnsType<Task> = [
    {
      title: '任务名称',
      dataIndex: 'taskName',
      key: 'taskName',
      width: 200,
      ellipsis: true
    },
    {
      title: '类型',
      dataIndex: 'taskType',
      key: 'taskType',
      width: 100,
      render: (type: ExperimentType) => (
        <Tag color="blue">{getExperimentTypeText(type)}</Tag>
      )
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: (status: TaskStatus) => (
        <Tag color={getStatusColor(status)}>
          {getStatusText(status)}
        </Tag>
      )
    },
    {
      title: '优先级',
      dataIndex: 'priority',
      key: 'priority',
      width: 80,
      render: (priority: TaskPriority) => (
        <Tag color={getPriorityColor(priority)}>
          {getPriorityText(priority)}
        </Tag>
      )
    },
    {
      title: '执行人',
      dataIndex: 'assignee',
      key: 'assignee',
      width: 100
    },
    {
      title: '样本数',
      dataIndex: 'sampleCount',
      key: 'sampleCount',
      width: 80,
      align: 'center'
    },
    {
      title: '进度',
      dataIndex: 'progress',
      key: 'progress',
      width: 120,
      render: (progress: number) => (
        <Progress 
          percent={progress} 
          size="small" 
          status={progress === 100 ? 'success' : 'active'}
        />
      )
    },
    {
      title: '预计时长',
      dataIndex: 'estimatedDuration',
      key: 'estimatedDuration',
      width: 100,
      render: (duration: number) => `${Math.floor(duration / 60)}h${duration % 60}m`
    },
    {
      title: '操作',
      key: 'action',
      width: 200,
      fixed: 'right',
      render: (_, record) => (
        <Space size="small">
          <Tooltip title="查看详情">
            <Button 
              type="text" 
              icon={<EyeOutlined />} 
              onClick={() => {
                setSelectedTask(record);
                setDetailDrawerVisible(true);
              }}
            />
          </Tooltip>
          {record.status === 'pending' && (
            <Tooltip title="开始执行">
              <Button 
                type="text" 
                icon={<PlayCircleOutlined />} 
                onClick={() => handleTaskAction('start', record)}
              />
            </Tooltip>
          )}
          {record.status === 'in_progress' && (
            <Tooltip title="暂停">
              <Button 
                type="text" 
                icon={<PauseCircleOutlined />} 
                onClick={() => handleTaskAction('pause', record)}
              />
            </Tooltip>
          )}
          {record.status === 'paused' && (
            <Tooltip title="恢复">
              <Button 
                type="text" 
                icon={<PlayCircleOutlined />} 
                onClick={() => handleTaskAction('resume', record)}
              />
            </Tooltip>
          )}
          <Tooltip title="编辑">
            <Button 
              type="text" 
              icon={<EditOutlined />} 
              onClick={() => {
                setEditingTask(record);
                setTaskModalVisible(true);
              }}
            />
          </Tooltip>
          <Popconfirm
            title="确定要取消这个任务吗？"
            onConfirm={() => handleTaskAction('cancel', record)}
            okText="确定"
            cancelText="取消"
          >
            <Tooltip title="取消">
              <Button 
                type="text" 
                danger 
                icon={<StopOutlined />}
              />
            </Tooltip>
          </Popconfirm>
        </Space>
      )
    }
  ];

  // 批次表格列定义
  const batchColumns: ColumnsType<ExperimentBatch> = [
    {
      title: '批次编号',
      dataIndex: 'batchCode',
      key: 'batchCode',
      width: 120,
      fixed: 'left'
    },
    {
      title: '批次名称',
      dataIndex: 'batchName',
      key: 'batchName',
      width: 200,
      ellipsis: true
    },
    {
      title: '实验类型',
      dataIndex: 'experimentType',
      key: 'experimentType',
      width: 100,
      render: (type: ExperimentType) => (
        <Tag color="blue">{getExperimentTypeText(type)}</Tag>
      )
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: (status: BatchStatus) => (
        <Tag color={getStatusColor(status)}>
          {getStatusText(status)}
        </Tag>
      )
    },
    {
      title: '样本数',
      dataIndex: 'sampleCount',
      key: 'sampleCount',
      width: 80,
      align: 'center'
    },
    {
      title: '执行人',
      dataIndex: 'operator',
      key: 'operator',
      width: 100
    },
    {
      title: '进度',
      dataIndex: 'progress',
      key: 'progress',
      width: 120,
      render: (progress: number) => (
        <Progress 
          percent={progress} 
          size="small" 
          status={progress === 100 ? 'success' : 'active'}
        />
      )
    },
    {
      title: '计划时间',
      key: 'plannedTime',
      width: 180,
      render: (_, record) => (
        <div>
          <div>{record.plannedStartDate}</div>
          <div style={{ fontSize: '12px', color: '#666' }}>
            至 {record.plannedEndDate}
          </div>
        </div>
      )
    },
    {
      title: '操作',
      key: 'action',
      width: 200,
      fixed: 'right',
      render: (_, record) => (
        <Space size="small">
          <Tooltip title="查看详情">
            <Button 
              type="text" 
              icon={<EyeOutlined />} 
              onClick={() => {
                setSelectedBatch(record);
                setDetailDrawerVisible(true);
              }}
            />
          </Tooltip>
          {record.status === 'ready' && (
            <Tooltip title="开始执行">
              <Button 
                type="text" 
                icon={<PlayCircleOutlined />} 
                onClick={() => handleBatchAction('start', record)}
              />
            </Tooltip>
          )}
          {record.status === 'in_progress' && (
            <>
              <Tooltip title="进入执行界面">
                <Button 
                  type="text" 
                  icon={<DashboardOutlined />} 
                  onClick={() => handleBatchAction('execute', record)}
                />
              </Tooltip>
              <Tooltip title="暂停">
                <Button 
                  type="text" 
                  icon={<PauseCircleOutlined />} 
                  onClick={() => handleBatchAction('pause', record)}
                />
              </Tooltip>
            </>
          )}
          <Tooltip title="编辑">
            <Button 
              type="text" 
              icon={<EditOutlined />} 
              onClick={() => {
                setEditingBatch(record);
                setBatchModalVisible(true);
              }}
            />
          </Tooltip>
          <Popconfirm
            title="确定要删除这个批次吗？"
            onConfirm={() => handleBatchAction('cancel', record)}
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
    }
  ];

  return (
    <div style={{ padding: '24px' }}>
      {/* 页面标题 */}
      <Card style={{ marginBottom: 24 }}>
        <Row gutter={16} align="middle">
          <Col span={12}>
            <Title level={2} style={{ margin: 0 }}>
              <ExperimentOutlined style={{ marginRight: 8 }} />
              实验任务管理
            </Title>
            <Text type="secondary">
              📋 任务中心 + 批次管理 | 智能调度 | 实时监控
            </Text>
          </Col>
          <Col span={12} style={{ textAlign: 'right' }}>
            <Space>
              <Button 
                type="primary" 
                icon={<PlusOutlined />}
                onClick={() => setTaskModalVisible(true)}
              >
                新建任务
              </Button>
              <Button 
                type="primary" 
                icon={<ExperimentOutlined />}
                onClick={() => setWizardModalVisible(true)}
                style={{ backgroundColor: '#52c41a', borderColor: '#52c41a' }}
              >
                批次向导
              </Button>
            </Space>
          </Col>
        </Row>
      </Card>

      {/* 主要内容区域 */}
      <Tabs 
        activeKey={activeTab} 
        onChange={setActiveTab}
        size="large"
        tabBarStyle={{ marginBottom: 24 }}
      >
        {/* 任务中心 */}
        <TabPane 
          tab={
            <span>
              <DashboardOutlined />
              任务中心
              <Badge count={taskStats.inProgress} style={{ marginLeft: 8 }} />
            </span>
          } 
          key="taskCenter"
        >
          {/* 任务统计 */}
          <Row gutter={16} style={{ marginBottom: 24 }}>
            <Col span={6}>
              <Card>
                <Statistic
                  title="总任务数"
                  value={taskStats.total}
                  prefix={<ProjectOutlined />}
                />
              </Card>
            </Col>
            <Col span={6}>
              <Card>
                <Statistic
                  title="待执行"
                  value={taskStats.pending}
                  valueStyle={{ color: '#faad14' }}
                  prefix={<ClockCircleOutlined />}
                />
              </Card>
            </Col>
            <Col span={6}>
              <Card>
                <Statistic
                  title="执行中"
                  value={taskStats.inProgress}
                  valueStyle={{ color: '#1890ff' }}
                  prefix={<PlayCircleOutlined />}
                />
              </Card>
            </Col>
            <Col span={6}>
              <Card>
                <Statistic
                  title="已完成"
                  value={taskStats.completed}
                  valueStyle={{ color: '#52c41a' }}
                  prefix={<CheckCircleOutlined />}
                />
              </Card>
            </Col>
          </Row>

          {/* 任务筛选 */}
          <Card style={{ marginBottom: 24 }}>
            <Row gutter={16}>
              <Col span={6}>
                <Search
                  placeholder="搜索任务名称"
                  value={searchText}
                  onChange={(e) => setSearchText(e.target.value)}
                  allowClear
                />
              </Col>
              <Col span={4}>
                <Select
                  placeholder="任务状态"
                  value={taskStatusFilter}
                  onChange={setTaskStatusFilter}
                  allowClear
                  style={{ width: '100%' }}
                >
                  <Option value="pending">待执行</Option>
                  <Option value="in_progress">执行中</Option>
                  <Option value="completed">已完成</Option>
                  <Option value="failed">失败</Option>
                  <Option value="cancelled">已取消</Option>
                </Select>
              </Col>
              <Col span={4}>
                <Select
                  placeholder="优先级"
                  value={priorityFilter}
                  onChange={setPriorityFilter}
                  allowClear
                  style={{ width: '100%' }}
                >
                  <Option value="urgent">紧急</Option>
                  <Option value="high">高</Option>
                  <Option value="medium">中</Option>
                  <Option value="low">低</Option>
                </Select>
              </Col>
              <Col span={4}>
                <Select
                  placeholder="执行人"
                  value={assigneeFilter}
                  onChange={setAssigneeFilter}
                  allowClear
                  style={{ width: '100%' }}
                >
                  <Option value="张三">张三</Option>
                  <Option value="李四">李四</Option>
                  <Option value="王五">王五</Option>
                </Select>
              </Col>
              <Col span={6}>
                <Space>
                  <Button 
                    icon={<ReloadOutlined />}
                    onClick={loadData}
                  >
                    刷新
                  </Button>
                  <Button 
                    onClick={() => {
                      setSearchText('');
                      setTaskStatusFilter('');
                      setPriorityFilter('');
                      setAssigneeFilter('');
                    }}
                  >
                    重置筛选
                  </Button>
                </Space>
              </Col>
            </Row>
          </Card>

          {/* 任务列表 */}
          <Card title="任务列表">
            <Table
              columns={taskColumns}
              dataSource={tasks}
              rowKey="id"
              loading={loading}
              scroll={{ x: 1200 }}
              pagination={{
                total: tasks.length,
                pageSize: 10,
                showSizeChanger: true,
                showQuickJumper: true,
                showTotal: (total, range) => 
                  `第 ${range[0]}-${range[1]} 条/共 ${total} 条`
              }}
            />
          </Card>
        </TabPane>

        {/* 批次管理 */}
        <TabPane 
          tab={
            <span>
              <ToolOutlined />
              批次管理
              <Badge count={batchStats.inProgress} style={{ marginLeft: 8 }} />
            </span>
          } 
          key="batchManagement"
        >
          {/* 批次统计 */}
          <Row gutter={16} style={{ marginBottom: 24 }}>
            <Col span={6}>
              <Card>
                <Statistic
                  title="总批次数"
                  value={batchStats.total}
                  prefix={<ExperimentOutlined />}
                />
              </Card>
            </Col>
            <Col span={6}>
              <Card>
                <Statistic
                  title="计划中"
                  value={batchStats.planning}
                  valueStyle={{ color: '#722ed1' }}
                  prefix={<CalendarOutlined />}
                />
              </Card>
            </Col>
            <Col span={6}>
              <Card>
                <Statistic
                  title="执行中"
                  value={batchStats.inProgress}
                  valueStyle={{ color: '#1890ff' }}
                  prefix={<PlayCircleOutlined />}
                />
              </Card>
            </Col>
            <Col span={6}>
              <Card>
                <Statistic
                  title="已完成"
                  value={batchStats.completed}
                  valueStyle={{ color: '#52c41a' }}
                  prefix={<CheckCircleOutlined />}
                />
              </Card>
            </Col>
          </Row>

          {/* 批次筛选 */}
          <Card style={{ marginBottom: 24 }}>
            <Row gutter={16}>
              <Col span={6}>
                <Search
                  placeholder="搜索批次名称或编号"
                  value={searchText}
                  onChange={(e) => setSearchText(e.target.value)}
                  allowClear
                />
              </Col>
              <Col span={4}>
                <Select
                  placeholder="批次状态"
                  value={batchStatusFilter}
                  onChange={setBatchStatusFilter}
                  allowClear
                  style={{ width: '100%' }}
                >
                  <Option value="draft">草稿</Option>
                  <Option value="planning">计划中</Option>
                  <Option value="ready">就绪</Option>
                  <Option value="in_progress">执行中</Option>
                  <Option value="completed">已完成</Option>
                  <Option value="cancelled">已取消</Option>
                </Select>
              </Col>
              <Col span={4}>
                <Select
                  placeholder="实验类型"
                  allowClear
                  style={{ width: '100%' }}
                >
                  <Option value="preprocessing">前处理</Option>
                  <Option value="library_construction">文库构建</Option>
                  <Option value="sequencing">上机测序</Option>
                  <Option value="analysis">数据分析</Option>
                </Select>
              </Col>
              <Col span={4}>
                <Select
                  placeholder="执行人"
                  allowClear
                  style={{ width: '100%' }}
                >
                  <Option value="张三">张三</Option>
                  <Option value="李四">李四</Option>
                  <Option value="王五">王五</Option>
                </Select>
              </Col>
              <Col span={6}>
                <Space>
                  <Button 
                    icon={<ReloadOutlined />}
                    onClick={loadData}
                  >
                    刷新
                  </Button>
                  <Button 
                    onClick={() => {
                      setSearchText('');
                      setBatchStatusFilter('');
                    }}
                  >
                    重置筛选
                  </Button>
                </Space>
              </Col>
            </Row>
          </Card>

          {/* 批次列表 */}
          <Card title="批次列表">
            <Table
              columns={batchColumns}
              dataSource={batches}
              rowKey="id"
              loading={loading}
              scroll={{ x: 1400 }}
              pagination={{
                total: batches.length,
                pageSize: 10,
                showSizeChanger: true,
                showQuickJumper: true,
                showTotal: (total, range) => 
                  `第 ${range[0]}-${range[1]} 条/共 ${total} 条`
              }}
            />
          </Card>
        </TabPane>

        {/* 执行监控 */}
        <TabPane 
          tab={
            <span>
              <BellOutlined />
              执行监控
            </span>
          } 
          key="monitoring"
        >
          <Row gutter={16}>
            <Col span={16}>
              <Card title="实时任务状态" style={{ marginBottom: 16 }}>
                <Timeline>
                  <Timeline.Item color="blue">
                    <p>09:30 - 环境样本DNA提取任务开始执行</p>
                    <p style={{ color: '#666', fontSize: '12px' }}>执行人：张三 | 预计完成时间：18:00</p>
                  </Timeline.Item>
                  <Timeline.Item color="green">
                    <p>08:15 - 测序批次A已完成</p>
                    <p style={{ color: '#666', fontSize: '12px' }}>执行人：王五 | 实际用时：23小时</p>
                  </Timeline.Item>
                  <Timeline.Item color="orange">
                    <p>07:45 - 文库构建任务等待中</p>
                    <p style={{ color: '#666', fontSize: '12px' }}>等待前处理完成</p>
                  </Timeline.Item>
                </Timeline>
              </Card>
            </Col>
            <Col span={8}>
              <Card title="设备状态" style={{ marginBottom: 16 }}>
                <List
                  size="small"
                  dataSource={[
                    { name: '离心机A', status: 'available', color: 'green' },
                    { name: 'PCR仪B', status: 'busy', color: 'red' },
                    { name: '测序仪C', status: 'available', color: 'green' }
                  ]}
                  renderItem={item => (
                    <List.Item>
                      <List.Item.Meta
                        avatar={<Badge status={item.color as any} />}
                        title={item.name}
                        description={item.status === 'available' ? '空闲' : '使用中'}
                      />
                    </List.Item>
                  )}
                />
              </Card>
              <Card title="今日统计">
                <Space direction="vertical" style={{ width: '100%' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>完成任务</span>
                    <span style={{ fontWeight: 'bold' }}>3个</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>处理样本</span>
                    <span style={{ fontWeight: 'bold' }}>132个</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>设备利用率</span>
                    <span style={{ fontWeight: 'bold' }}>85%</span>
                  </div>
                </Space>
              </Card>
            </Col>
          </Row>
        </TabPane>
      </Tabs>

      {/* 详情抽屉 */}
      <Drawer
        title={selectedTask ? "任务详情" : "批次详情"}
        placement="right"
        width={600}
        open={detailDrawerVisible}
        onClose={() => setDetailDrawerVisible(false)}
      >
        {selectedTask && (
          <div>
            <Descriptions title="基本信息" bordered column={1}>
              <Descriptions.Item label="任务名称">{selectedTask.taskName}</Descriptions.Item>
              <Descriptions.Item label="任务类型">
                <Tag color="blue">{getExperimentTypeText(selectedTask.taskType)}</Tag>
              </Descriptions.Item>
              <Descriptions.Item label="状态">
                <Tag color={getStatusColor(selectedTask.status)}>
                  {getStatusText(selectedTask.status)}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="优先级">
                <Tag color={getPriorityColor(selectedTask.priority)}>
                  {getPriorityText(selectedTask.priority)}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="执行人">{selectedTask.assignee}</Descriptions.Item>
              <Descriptions.Item label="样本数量">{selectedTask.sampleCount}个</Descriptions.Item>
              <Descriptions.Item label="进度">
                <Progress percent={selectedTask.progress} />
              </Descriptions.Item>
            </Descriptions>
            {selectedTask.notes && (
              <Card title="备注信息" style={{ marginTop: 16 }}>
                <p>{selectedTask.notes}</p>
              </Card>
            )}
          </div>
        )}
        {selectedBatch && (
          <div>
            <Descriptions title="基本信息" bordered column={1}>
              <Descriptions.Item label="批次编号">{selectedBatch.batchCode}</Descriptions.Item>
              <Descriptions.Item label="批次名称">{selectedBatch.batchName}</Descriptions.Item>
              <Descriptions.Item label="实验类型">
                <Tag color="blue">{getExperimentTypeText(selectedBatch.experimentType)}</Tag>
              </Descriptions.Item>
              <Descriptions.Item label="状态">
                <Tag color={getStatusColor(selectedBatch.status)}>
                  {getStatusText(selectedBatch.status)}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="执行人">{selectedBatch.operator}</Descriptions.Item>
              <Descriptions.Item label="样本数量">{selectedBatch.sampleCount}个</Descriptions.Item>
              <Descriptions.Item label="进度">
                <Progress percent={selectedBatch.progress} />
              </Descriptions.Item>
              <Descriptions.Item label="成本预估">¥{selectedBatch.costEstimate}</Descriptions.Item>
            </Descriptions>
            {selectedBatch.notes && (
              <Card title="备注信息" style={{ marginTop: 16 }}>
                <p>{selectedBatch.notes}</p>
              </Card>
            )}
          </div>
        )}
      </Drawer>

      {/* 批次创建向导模态框 */}
      <Modal
        title="批次创建向导"
        open={wizardModalVisible}
        onCancel={() => {
          setWizardModalVisible(false);
          setWizardStep(0);
          setWizardData({});
        }}
        footer={null}
        width={1000}
        destroyOnClose
      >
        <Steps current={wizardStep} style={{ marginBottom: 24 }}>
          <Step title="基本信息" />
          <Step title="选择样本" />
          <Step title="配置资源" />
          <Step title="确认创建" />
        </Steps>
        
        <div style={{ minHeight: 500 }}>
          {/* 步骤1: 基本信息 */}
          {wizardStep === 0 && (
            <Card title="批次基本信息" style={{ margin: '0 auto', maxWidth: 600 }}>
              <Form layout="vertical">
                <Row gutter={16}>
                  <Col span={12}>
                    <Form.Item label="批次编号" required>
                      <Input 
                        placeholder="自动生成" 
                        value={`BATCH_${dayjs().format('YYYYMMDD')}_${String(Math.floor(Math.random() * 1000)).padStart(3, '0')}`}
                        disabled
                      />
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <Form.Item label="批次名称" required>
                      <Input 
                        placeholder="请输入批次名称"
                        value={wizardData.batchName || ''}
                        onChange={(e) => setWizardData({...wizardData, batchName: e.target.value})}
                      />
                    </Form.Item>
                  </Col>
                </Row>
                
                <Row gutter={16}>
                  <Col span={12}>
                    <Form.Item label="实验类型" required>
                      <Select 
                        placeholder="选择实验类型"
                        value={wizardData.experimentType}
                        onChange={(value) => setWizardData({...wizardData, experimentType: value})}
                      >
                        <Option value="preprocessing">样本前处理</Option>
                        <Option value="library_construction">文库构建</Option>
                        <Option value="sequencing">测序</Option>
                        <Option value="analysis">数据分析</Option>
                      </Select>
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <Form.Item label="优先级" required>
                      <Select 
                        placeholder="选择优先级"
                        value={wizardData.priority}
                        onChange={(value) => setWizardData({...wizardData, priority: value})}
                      >
                        <Option value="urgent">
                          <Tag color="red">紧急</Tag>
                        </Option>
                        <Option value="high">
                          <Tag color="orange">高</Tag>
                        </Option>
                        <Option value="medium">
                          <Tag color="blue">中</Tag>
                        </Option>
                        <Option value="low">
                          <Tag color="green">低</Tag>
                        </Option>
                      </Select>
                    </Form.Item>
                  </Col>
                </Row>
                
                <Row gutter={16}>
                  <Col span={12}>
                    <Form.Item label="执行人员" required>
                      <Select 
                        placeholder="选择执行人员"
                        value={wizardData.operator}
                        onChange={(value) => setWizardData({...wizardData, operator: value})}
                      >
                        <Option value="张三">张三</Option>
                        <Option value="李四">李四</Option>
                        <Option value="王五">王五</Option>
                        <Option value="赵六">赵六</Option>
                      </Select>
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <Form.Item label="计划开始日期" required>
                      <DatePicker 
                        style={{ width: '100%' }}
                        placeholder="选择开始日期"
                        value={wizardData.plannedStartDate ? dayjs(wizardData.plannedStartDate) : null}
                        onChange={(date) => setWizardData({...wizardData, plannedStartDate: date?.format('YYYY-MM-DD')})}
                      />
                    </Form.Item>
                  </Col>
                </Row>
                
                <Form.Item label="实验协议">
                  <Select 
                    placeholder="选择实验协议"
                    value={wizardData.protocol}
                    onChange={(value) => setWizardData({...wizardData, protocol: value})}
                  >
                    <Option value="DNA提取标准流程v2.1">DNA提取标准流程v2.1</Option>
                    <Option value="RNA提取标准流程v1.5">RNA提取标准流程v1.5</Option>
                    <Option value="文库构建标准流程v3.0">文库构建标准流程v3.0</Option>
                    <Option value="NovaSeq测序标准流程">NovaSeq测序标准流程</Option>
                  </Select>
                </Form.Item>
                
                <Form.Item label="备注信息">
                  <TextArea 
                    rows={3}
                    placeholder="请输入备注信息"
                    value={wizardData.notes || ''}
                    onChange={(e) => setWizardData({...wizardData, notes: e.target.value})}
                  />
                </Form.Item>
              </Form>
              
              <div style={{ textAlign: 'right', marginTop: 24 }}>
                <Button 
                  type="primary" 
                  onClick={() => setWizardStep(1)}
                  disabled={!wizardData.batchName || !wizardData.experimentType || !wizardData.operator}
                >
                  下一步：选择样本
                </Button>
              </div>
            </Card>
          )}
          
          {/* 步骤2: 选择样本 */}
          {wizardStep === 1 && (
            <div>
              <Alert
                message="样本选择"
                description="从可用样本中选择需要处理的样本，支持批量选择和搜索筛选"
                type="info"
                showIcon
                style={{ marginBottom: 16 }}
              />
              
              <Row gutter={16}>
                <Col span={12}>
                  <Card title="可用样本" size="small">
                    <div style={{ marginBottom: 16 }}>
                      <Search 
                        placeholder="搜索样本编号或名称"
                        allowClear
                        style={{ marginBottom: 8 }}
                      />
                      <Space>
                        <Select placeholder="样本类型" style={{ width: 120 }}>
                          <Option value="DNA">DNA</Option>
                          <Option value="RNA">RNA</Option>
                          <Option value="蛋白质">蛋白质</Option>
                        </Select>
                        <Select placeholder="项目" style={{ width: 120 }}>
                          <Option value="项目A">项目A</Option>
                          <Option value="项目B">项目B</Option>
                          <Option value="项目C">项目C</Option>
                        </Select>
                      </Space>
                    </div>
                    
                    <List
                      size="small"
                      dataSource={[
                        { id: 'S001', name: '环境样本1', type: 'DNA', project: '项目A', status: '可用' },
                        { id: 'S002', name: '环境样本2', type: 'DNA', project: '项目A', status: '可用' },
                        { id: 'S003', name: '血液样本1', type: 'RNA', project: '项目B', status: '可用' },
                        { id: 'S004', name: '血液样本2', type: 'RNA', project: '项目B', status: '可用' },
                        { id: 'S005', name: '组织样本1', type: '蛋白质', project: '项目C', status: '可用' }
                      ]}
                      renderItem={(item) => (
                        <List.Item
                          actions={[
                            <Button 
                              size="small" 
                              type="link"
                              onClick={() => {
                                const selected = wizardData.selectedSamples || [];
                                if (!selected.find(s => s.id === item.id)) {
                                  setWizardData({
                                    ...wizardData, 
                                    selectedSamples: [...selected, item]
                                  });
                                }
                              }}
                            >
                              添加
                            </Button>
                          ]}
                        >
                          <List.Item.Meta
                            avatar={<Avatar icon={<BarcodeOutlined />} />}
                            title={`${item.id} - ${item.name}`}
                            description={
                              <Space>
                                <Tag color="blue">{item.type}</Tag>
                                <Tag color="green">{item.project}</Tag>
                                <Tag color="orange">{item.status}</Tag>
                              </Space>
                            }
                          />
                        </List.Item>
                      )}
                      style={{ maxHeight: 300, overflow: 'auto' }}
                    />
                  </Card>
                </Col>
                
                <Col span={12}>
                  <Card title={`已选样本 (${(wizardData.selectedSamples || []).length})`} size="small">
                    {(wizardData.selectedSamples || []).length === 0 ? (
                      <Empty 
                        image={Empty.PRESENTED_IMAGE_SIMPLE}
                        description="暂未选择样本"
                      />
                    ) : (
                      <List
                        size="small"
                        dataSource={wizardData.selectedSamples || []}
                        renderItem={(item) => (
                          <List.Item
                            actions={[
                              <Button 
                                size="small" 
                                type="link" 
                                danger
                                onClick={() => {
                                  const selected = wizardData.selectedSamples || [];
                                  setWizardData({
                                    ...wizardData,
                                    selectedSamples: selected.filter(s => s.id !== item.id)
                                  });
                                }}
                              >
                                移除
                              </Button>
                            ]}
                          >
                            <List.Item.Meta
                              avatar={<Avatar icon={<BarcodeOutlined />} />}
                              title={`${item.id} - ${item.name}`}
                              description={
                                <Space>
                                  <Tag color="blue">{item.type}</Tag>
                                  <Tag color="green">{item.project}</Tag>
                                </Space>
                              }
                            />
                          </List.Item>
                        )}
                        style={{ maxHeight: 300, overflow: 'auto' }}
                      />
                    )}
                  </Card>
                </Col>
              </Row>
              
              <div style={{ textAlign: 'right', marginTop: 24 }}>
                <Space>
                  <Button onClick={() => setWizardStep(0)}>上一步</Button>
                  <Button 
                    type="primary" 
                    onClick={() => setWizardStep(2)}
                    disabled={!(wizardData.selectedSamples || []).length}
                  >
                    下一步：配置资源
                  </Button>
                </Space>
              </div>
            </div>
          )}
          
          {/* 步骤3: 配置资源 */}
          {wizardStep === 2 && (
            <div>
              <Alert
                message="资源配置"
                description="为批次配置所需的试剂、设备等实验资源"
                type="info"
                showIcon
                style={{ marginBottom: 16 }}
              />
              
              <Tabs defaultActiveKey="reagents">
                <TabPane tab="试剂配置" key="reagents">
                  <Row gutter={16}>
                    <Col span={12}>
                      <Card title="可用试剂" size="small">
                        <List
                          size="small"
                          dataSource={[
                            { id: 'R001', name: 'DNA提取试剂盒', brand: 'Qiagen', lot: 'LOT001', expiry: '2024-12-31', quantity: 50 },
                            { id: 'R002', name: 'PCR扩增试剂', brand: 'Thermo', lot: 'LOT002', expiry: '2024-10-15', quantity: 100 },
                            { id: 'R003', name: '文库构建试剂盒', brand: 'Illumina', lot: 'LOT003', expiry: '2024-11-20', quantity: 25 }
                          ]}
                          renderItem={(item) => (
                            <List.Item
                              actions={[
                                <Button 
                                  size="small" 
                                  type="link"
                                  onClick={() => {
                                    const selected = wizardData.selectedReagents || [];
                                    if (!selected.find(r => r.id === item.id)) {
                                      setWizardData({
                                        ...wizardData, 
                                        selectedReagents: [...selected, {...item, usedQuantity: 1}]
                                      });
                                    }
                                  }}
                                >
                                  添加
                                </Button>
                              ]}
                            >
                              <List.Item.Meta
                                title={item.name}
                                description={
                                  <div>
                                    <div>品牌: {item.brand} | 批号: {item.lot}</div>
                                    <div>有效期: {item.expiry} | 库存: {item.quantity}</div>
                                  </div>
                                }
                              />
                            </List.Item>
                          )}
                        />
                      </Card>
                    </Col>
                    
                    <Col span={12}>
                      <Card title="已选试剂" size="small">
                        {(wizardData.selectedReagents || []).length === 0 ? (
                          <Empty 
                            image={Empty.PRESENTED_IMAGE_SIMPLE}
                            description="暂未选择试剂"
                          />
                        ) : (
                          <List
                            size="small"
                            dataSource={wizardData.selectedReagents || []}
                            renderItem={(item) => (
                              <List.Item
                                actions={[
                                  <Button 
                                    size="small" 
                                    type="link" 
                                    danger
                                    onClick={() => {
                                      const selected = wizardData.selectedReagents || [];
                                      setWizardData({
                                        ...wizardData,
                                        selectedReagents: selected.filter(r => r.id !== item.id)
                                      });
                                    }}
                                  >
                                    移除
                                  </Button>
                                ]}
                              >
                                <List.Item.Meta
                                  title={item.name}
                                  description={
                                    <div>
                                      <div>用量: 
                                        <InputNumber 
                                          size="small" 
                                          min={1} 
                                          max={item.quantity}
                                          value={item.usedQuantity}
                                          onChange={(value) => {
                                            const selected = wizardData.selectedReagents || [];
                                            const updated = selected.map(r => 
                                              r.id === item.id ? {...r, usedQuantity: value} : r
                                            );
                                            setWizardData({...wizardData, selectedReagents: updated});
                                          }}
                                          style={{ width: 60, margin: '0 8px' }}
                                        />
                                        / {item.quantity}
                                      </div>
                                    </div>
                                  }
                                />
                              </List.Item>
                            )}
                          />
                        )}
                      </Card>
                    </Col>
                  </Row>
                </TabPane>
                
                <TabPane tab="设备配置" key="equipment">
                  <Row gutter={16}>
                    <Col span={12}>
                      <Card title="可用设备" size="small">
                        <List
                          size="small"
                          dataSource={[
                            { id: 'E001', name: 'PCR仪A', model: 'ABI 9700', status: '空闲', capacity: 96, location: '实验室A' },
                            { id: 'E002', name: '测序仪B', model: 'NovaSeq 6000', status: '空闲', capacity: 384, location: '测序中心' },
                            { id: 'E003', name: '离心机C', model: 'Eppendorf 5424R', status: '使用中', capacity: 24, location: '实验室B' }
                          ]}
                          renderItem={(item) => (
                            <List.Item
                              actions={[
                                <Button 
                                  size="small" 
                                  type="link"
                                  disabled={item.status === '使用中'}
                                  onClick={() => {
                                    const selected = wizardData.selectedEquipment || [];
                                    if (!selected.find(e => e.id === item.id)) {
                                      setWizardData({
                                        ...wizardData, 
                                        selectedEquipment: [...selected, item]
                                      });
                                    }
                                  }}
                                >
                                  {item.status === '使用中' ? '不可用' : '添加'}
                                </Button>
                              ]}
                            >
                              <List.Item.Meta
                                title={item.name}
                                description={
                                  <div>
                                    <div>型号: {item.model} | 位置: {item.location}</div>
                                    <div>
                                      状态: <Tag color={item.status === '空闲' ? 'green' : 'red'}>{item.status}</Tag>
                                      容量: {item.capacity}
                                    </div>
                                  </div>
                                }
                              />
                            </List.Item>
                          )}
                        />
                      </Card>
                    </Col>
                    
                    <Col span={12}>
                      <Card title="已选设备" size="small">
                        {(wizardData.selectedEquipment || []).length === 0 ? (
                          <Empty 
                            image={Empty.PRESENTED_IMAGE_SIMPLE}
                            description="暂未选择设备"
                          />
                        ) : (
                          <List
                            size="small"
                            dataSource={wizardData.selectedEquipment || []}
                            renderItem={(item) => (
                              <List.Item
                                actions={[
                                  <Button 
                                    size="small" 
                                    type="link" 
                                    danger
                                    onClick={() => {
                                      const selected = wizardData.selectedEquipment || [];
                                      setWizardData({
                                        ...wizardData,
                                        selectedEquipment: selected.filter(e => e.id !== item.id)
                                      });
                                    }}
                                  >
                                    移除
                                  </Button>
                                ]}
                              >
                                <List.Item.Meta
                                  title={item.name}
                                  description={`${item.model} - ${item.location}`}
                                />
                              </List.Item>
                            )}
                          />
                        )}
                      </Card>
                    </Col>
                  </Row>
                </TabPane>
              </Tabs>
              
              <div style={{ textAlign: 'right', marginTop: 24 }}>
                <Space>
                  <Button onClick={() => setWizardStep(1)}>上一步</Button>
                  <Button 
                    type="primary" 
                    onClick={() => setWizardStep(3)}
                  >
                    下一步：确认创建
                  </Button>
                </Space>
              </div>
            </div>
          )}
          
          {/* 步骤4: 确认创建 */}
          {wizardStep === 3 && (
            <div>
              <Alert
                message="批次信息确认"
                description="请仔细核对批次信息，确认无误后点击创建批次"
                type="warning"
                showIcon
                style={{ marginBottom: 16 }}
              />
              
              <Row gutter={16}>
                <Col span={12}>
                  <Card title="基本信息" size="small">
                    <Descriptions column={1} size="small">
                      <Descriptions.Item label="批次名称">{wizardData.batchName}</Descriptions.Item>
                      <Descriptions.Item label="实验类型">
                        <Tag color="blue">{getExperimentTypeText(wizardData.experimentType)}</Tag>
                      </Descriptions.Item>
                      <Descriptions.Item label="优先级">
                        <Tag color={getPriorityColor(wizardData.priority)}>
                          {getPriorityText(wizardData.priority)}
                        </Tag>
                      </Descriptions.Item>
                      <Descriptions.Item label="执行人员">{wizardData.operator}</Descriptions.Item>
                      <Descriptions.Item label="计划开始">{wizardData.plannedStartDate}</Descriptions.Item>
                      <Descriptions.Item label="实验协议">{wizardData.protocol}</Descriptions.Item>
                    </Descriptions>
                  </Card>
                  
                  <Card title="成本预估" size="small" style={{ marginTop: 16 }}>
                    <Statistic
                      title="预估总成本"
                      value={2500}
                      precision={2}
                      prefix="¥"
                      valueStyle={{ color: '#3f8600' }}
                    />
                    <div style={{ marginTop: 16 }}>
                      <Text type="secondary">
                        • 试剂成本: ¥1,200<br/>
                        • 设备使用费: ¥800<br/>
                        • 人工成本: ¥500
                      </Text>
                    </div>
                  </Card>
                </Col>
                
                <Col span={12}>
                  <Card title={`样本清单 (${(wizardData.selectedSamples || []).length}个)`} size="small">
                    <List
                      size="small"
                      dataSource={wizardData.selectedSamples || []}
                      renderItem={(item) => (
                        <List.Item>
                          <List.Item.Meta
                            avatar={<Avatar size="small" icon={<BarcodeOutlined />} />}
                            title={`${item.id} - ${item.name}`}
                            description={
                              <Space>
                                <Tag color="blue">{item.type}</Tag>
                                <Tag color="green">{item.project}</Tag>
                              </Space>
                            }
                          />
                        </List.Item>
                      )}
                      style={{ maxHeight: 200, overflow: 'auto' }}
                    />
                  </Card>
                  
                  <Card title="资源配置" size="small" style={{ marginTop: 16 }}>
                    <div>
                      <Text strong>试剂 ({(wizardData.selectedReagents || []).length}种):</Text>
                      <div style={{ marginLeft: 16, marginTop: 8 }}>
                        {(wizardData.selectedReagents || []).map(reagent => (
                          <div key={reagent.id}>
                            <Text>{reagent.name} × {reagent.usedQuantity}</Text>
                          </div>
                        ))}
                      </div>
                    </div>
                    
                    <Divider style={{ margin: '12px 0' }} />
                    
                    <div>
                      <Text strong>设备 ({(wizardData.selectedEquipment || []).length}台):</Text>
                      <div style={{ marginLeft: 16, marginTop: 8 }}>
                        {(wizardData.selectedEquipment || []).map(equipment => (
                          <div key={equipment.id}>
                            <Text>{equipment.name} ({equipment.model})</Text>
                          </div>
                        ))}
                      </div>
                    </div>
                  </Card>
                </Col>
              </Row>
              
              <div style={{ textAlign: 'right', marginTop: 24 }}>
                <Space>
                  <Button onClick={() => setWizardStep(2)}>上一步</Button>
                  <Button 
                    type="primary" 
                    size="large"
                    onClick={() => {
                      // 创建批次逻辑
                      const newBatch = {
                        id: `BATCH_${Date.now()}`,
                        batchCode: `BATCH_${dayjs().format('YYYYMMDD')}_${String(Math.floor(Math.random() * 1000)).padStart(3, '0')}`,
                        batchName: wizardData.batchName,
                        experimentType: wizardData.experimentType,
                        status: 'draft' as BatchStatus,
                        sampleCount: (wizardData.selectedSamples || []).length,
                        samples: wizardData.selectedSamples || [],
                        reagents: wizardData.selectedReagents || [],
                        equipment: wizardData.selectedEquipment || [],
                        operator: wizardData.operator,
                        plannedStartDate: wizardData.plannedStartDate,
                        plannedEndDate: dayjs(wizardData.plannedStartDate).add(3, 'day').format('YYYY-MM-DD'),
                        estimatedDuration: 72,
                        priority: wizardData.priority,
                        notes: wizardData.notes,
                        createdBy: '当前用户',
                        createdTime: dayjs().format('YYYY-MM-DD HH:mm:ss'),
                        updatedTime: dayjs().format('YYYY-MM-DD HH:mm:ss'),
                        protocol: wizardData.protocol,
                        qualityRequirements: ['样本质量合格', '操作规范'],
                        costEstimate: 2500.0,
                        progress: 0
                      };
                      
                      setBatches([...batches, newBatch]);
                      message.success('批次创建成功！');
                      setWizardModalVisible(false);
                      setWizardStep(0);
                      setWizardData({});
                      setActiveTab('batchManagement');
                    }}
                  >
                    <CheckCircleOutlined />
                    创建批次
                  </Button>
                </Space>
              </div>
            </div>
          )}
        </div>
      </Modal>
    </div>
  );
};

export default ExperimentTaskManagement;