/**
 * 实验批次详情页面组件
 * 
 * 功能说明：
 * - 显示批次基本信息和统计数据
 * - 提供步骤跟踪进度条，实时显示实验进度
 * - 实现实验步骤与数据记录表格，支持详细的数据录入
 * - 支持实时数据记录和质量控制
 * - 提供移动端优化界面
 * 
 * @author 系统
 * @version 2.0.0
 */

import React, { useState, useEffect } from 'react';
import {
  Card,
  Steps,
  Table,
  Button,
  Space,
  Tag,
  Progress,
  Row,
  Col,
  Statistic,
  Modal,
  Form,
  Input,
  Select,
  DatePicker,
  message,
  Divider,
  Typography,
  Drawer,
  Checkbox,
  Badge,
  Timeline,
  Upload,
  InputNumber,
  Radio,
  Descriptions,
  Alert,
  Tooltip,
  Popconfirm,
  Tabs,
  List,
  Avatar,
  Switch,
  Collapse,
  Image
} from 'antd';
import {
  ArrowLeftOutlined,
  ExperimentOutlined,
  PlayCircleOutlined,
  PauseCircleOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  ExclamationCircleOutlined,
  EyeOutlined,
  EditOutlined,
  SaveOutlined,
  ReloadOutlined,
  UploadOutlined,
  FileExcelOutlined,
  CameraOutlined,
  FileImageOutlined,
  ClockCircleOutlined,
  UserOutlined,
  BarcodeOutlined,
  ToolOutlined,
  FileTextOutlined,
  WarningOutlined,
  SettingOutlined,
  PrinterOutlined,
  DownloadOutlined,
  PlusOutlined,
  DeleteOutlined,
  SyncOutlined
} from '@ant-design/icons';
import { useNavigate, useParams } from 'react-router-dom';
import type { ColumnsType } from 'antd/es/table';
import dayjs from 'dayjs';

const { Title, Text, Paragraph } = Typography;
const { Option } = Select;
const { TextArea } = Input;
const { TabPane } = Tabs;
const { Panel } = Collapse;
const { Step } = Steps;

/**
 * 样本状态枚举
 */
type SampleStatus = 'received' | 'assigned' | 'processing' | 'completed';

/**
 * 批次状态枚举
 */
type BatchStatus = 'draft' | 'ready' | 'in_progress' | 'paused' | 'completed' | 'failed' | 'cancelled';

/**
 * 实验步骤枚举
 */
type ExperimentStep = 'sample_prep' | 'nucleic_extraction' | 'pcr' | 'library_prep' | 'quantification' | 'qc';

/**
 * 步骤状态枚举
 */
type StepStatus = 'pending' | 'in_progress' | 'completed' | 'failed';

/**
 * 样本接口定义
 */
interface Sample {
  id: string;
  sampleCode: string;
  sampleName: string;
  sampleType: string;
  status: SampleStatus;
  receivedDate: string;
  position?: string;
  volume?: number;
  concentration?: number;
  purity?: number;
  notes?: string;
}

/**
 * 步骤记录接口定义
 */
interface StepRecord {
  id: string;
  stepType: ExperimentStep;
  stepName: string;
  status: StepStatus;
  operator: string;
  startTime?: string;
  endTime?: string;
  duration?: number;
  notes?: string;
  dataRecords: StepDataRecord[];
  attachments: string[];
  qualityControl: QualityControlRecord[];
}

/**
 * 步骤数据记录接口定义
 */
interface StepDataRecord {
  id: string;
  sampleId: string;
  sampleCode: string;
  recordType: 'basic' | 'sample_level' | 'batch_level' | 'qc';
  data: Record<string, any>;
  recordTime: string;
  operator: string;
  verified: boolean;
  notes?: string;
}

/**
 * 质量控制记录接口定义
 */
interface QualityControlRecord {
  id: string;
  qcType: string;
  qcResult: 'pass' | 'fail' | 'warning';
  qcValue?: number;
  qcRange?: string;
  qcNotes?: string;
  qcTime: string;
  qcOperator: string;
}

/**
 * 实验批次接口定义
 */
interface ExperimentBatch {
  id: string;
  batchCode: string;
  batchName: string;
  status: BatchStatus;
  sampleCount: number;
  samples: Sample[];
  operator: string;
  project: string;
  plannedStartDate: string;
  plannedEndDate: string;
  actualStartDate?: string;
  actualEndDate?: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  notes?: string;
  createdBy: string;
  createdTime: string;
  updatedTime: string;
  progress: number;
  currentStep: string;
  steps: StepRecord[];
}

/**
 * 实验批次详情页面组件
 * 
 * @returns {JSX.Element} 批次详情页面
 */
const BatchDetail: React.FC = () => {
  const navigate = useNavigate();
  const { batchId } = useParams<{ batchId: string }>();
  
  // 状态管理
  const [loading, setLoading] = useState(false);
  const [batch, setBatch] = useState<ExperimentBatch | null>(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedStep, setSelectedStep] = useState<StepRecord | null>(null);
  const [dataRecordDrawerVisible, setDataRecordDrawerVisible] = useState(false);
  const [quickRecordModalVisible, setQuickRecordModalVisible] = useState(false);
  const [currentStepRecord, setCurrentStepRecord] = useState<StepDataRecord | null>(null);
  const [editingRecord, setEditingRecord] = useState(false);
  
  // 表单实例
  const [dataRecordForm] = Form.useForm();
  const [quickRecordForm] = Form.useForm();

  // 模拟数据
  const mockBatch: ExperimentBatch = {
    id: 'batch_001',
    batchCode: 'EXP001',
    batchName: '微生物基因组测序实验-批次001',
    status: 'in_progress',
    sampleCount: 24,
    samples: [
      {
        id: 'sample_001',
        sampleCode: 'S001',
        sampleName: '土壤样本-1',
        sampleType: 'DNA',
        status: 'processing',
        receivedDate: '2024-01-15',
        position: 'A1',
        volume: 50,
        concentration: 125.6,
        purity: 1.85
      },
      {
        id: 'sample_002',
        sampleCode: 'S002',
        sampleName: '水样-1',
        sampleType: 'DNA',
        status: 'processing',
        receivedDate: '2024-01-15',
        position: 'A2',
        volume: 45,
        concentration: 98.3,
        purity: 1.92
      }
    ],
    operator: '张实验员',
    project: '环境微生物多样性研究',
    plannedStartDate: '2024-01-15',
    plannedEndDate: '2024-01-20',
    actualStartDate: '2024-01-15',
    priority: 'high',
    notes: '高优先级项目，需要严格质控',
    createdBy: '李主管',
    createdTime: '2024-01-14 16:30:00',
    updatedTime: '2024-01-16 10:15:00',
    progress: 45,
    currentStep: '核酸提取',
    steps: [
      {
        id: 'step_001',
        stepType: 'sample_prep',
        stepName: '样本预处理',
        status: 'completed',
        operator: '张实验员',
        startTime: '2024-01-15 09:00:00',
        endTime: '2024-01-15 11:30:00',
        duration: 150,
        notes: '样本预处理完成，质量良好',
        dataRecords: [],
        attachments: [],
        qualityControl: []
      },
      {
        id: 'step_002',
        stepType: 'nucleic_extraction',
        stepName: '核酸提取',
        status: 'in_progress',
        operator: '张实验员',
        startTime: '2024-01-16 09:00:00',
        notes: '正在进行核酸提取',
        dataRecords: [
          {
            id: 'record_001',
            sampleId: 'sample_001',
            sampleCode: 'S001',
            recordType: 'sample_level',
            data: {
              extractionMethod: '磁珠法',
              extractionVolume: 200,
              elutionVolume: 50,
              concentration: 125.6,
              purity260280: 1.85,
              purity260230: 2.1,
              totalYield: 6.28
            },
            recordTime: '2024-01-16 10:30:00',
            operator: '张实验员',
            verified: true
          }
        ],
        attachments: [],
        qualityControl: [
          {
            id: 'qc_001',
            qcType: '浓度检测',
            qcResult: 'pass',
            qcValue: 125.6,
            qcRange: '50-500 ng/μL',
            qcTime: '2024-01-16 10:30:00',
            qcOperator: '张实验员'
          }
        ]
      },
      {
        id: 'step_003',
        stepType: 'pcr',
        stepName: 'PCR扩增',
        status: 'pending',
        operator: '张实验员',
        notes: '等待核酸提取完成',
        dataRecords: [],
        attachments: [],
        qualityControl: []
      },
      {
        id: 'step_004',
        stepType: 'library_prep',
        stepName: '文库构建',
        status: 'pending',
        operator: '张实验员',
        notes: '等待PCR扩增完成',
        dataRecords: [],
        attachments: [],
        qualityControl: []
      },
      {
        id: 'step_005',
        stepType: 'quantification',
        stepName: '文库定量',
        status: 'pending',
        operator: '张实验员',
        notes: '等待文库构建完成',
        dataRecords: [],
        attachments: [],
        qualityControl: []
      },
      {
        id: 'step_006',
        stepType: 'qc',
        stepName: '质量检测',
        status: 'pending',
        operator: '张实验员',
        notes: '最终质量检测',
        dataRecords: [],
        attachments: [],
        qualityControl: []
      }
    ]
  };

  useEffect(() => {
    // 模拟加载批次数据
    setLoading(true);
    setTimeout(() => {
      setBatch(mockBatch);
      setLoading(false);
    }, 1000);
  }, [batchId]);

  /**
   * 获取状态颜色
   * @param status 状态
   * @returns 颜色
   */
  const getStatusColor = (status: BatchStatus | StepStatus): string => {
    const colorMap = {
      draft: 'default',
      ready: 'blue',
      in_progress: 'processing',
      paused: 'warning',
      completed: 'success',
      failed: 'error',
      cancelled: 'default',
      pending: 'default'
    };
    return colorMap[status] || 'default';
  };

  /**
   * 获取状态文本
   * @param status 状态
   * @returns 状态文本
   */
  const getStatusText = (status: BatchStatus | StepStatus): string => {
    const textMap = {
      draft: '草稿',
      ready: '就绪',
      in_progress: '进行中',
      paused: '暂停',
      completed: '已完成',
      failed: '失败',
      cancelled: '已取消',
      pending: '待开始'
    };
    return textMap[status] || status;
  };

  /**
   * 获取步骤图标
   * @param status 步骤状态
   * @returns 图标
   */
  const getStepIcon = (status: StepStatus) => {
    switch (status) {
      case 'completed':
        return <CheckCircleOutlined style={{ color: '#52c41a' }} />;
      case 'in_progress':
        return <SyncOutlined spin style={{ color: '#1890ff' }} />;
      case 'failed':
        return <CloseCircleOutlined style={{ color: '#ff4d4f' }} />;
      default:
        return <ClockCircleOutlined style={{ color: '#d9d9d9' }} />;
    }
  };

  /**
   * 处理步骤点击
   * @param step 步骤记录
   */
  const handleStepClick = (step: StepRecord) => {
    setSelectedStep(step);
    setDataRecordDrawerVisible(true);
  };

  /**
   * 处理数据记录
   * @param record 数据记录
   */
  const handleDataRecord = (record?: StepDataRecord) => {
    setCurrentStepRecord(record || null);
    setEditingRecord(!!record);
    if (record) {
      dataRecordForm.setFieldsValue(record.data);
    } else {
      dataRecordForm.resetFields();
    }
  };

  /**
   * 保存数据记录
   * @param values 表单值
   */
  const handleSaveDataRecord = async (values: any) => {
    try {
      setLoading(true);
      // 模拟保存数据
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      message.success('数据记录保存成功');
      setCurrentStepRecord(null);
      setEditingRecord(false);
      dataRecordForm.resetFields();
    } catch (error) {
      message.error('保存失败，请重试');
    } finally {
      setLoading(false);
    }
  };

  /**
   * 快速记录数据
   * @param values 表单值
   */
  const handleQuickRecord = async (values: any) => {
    try {
      setLoading(true);
      // 模拟快速记录
      await new Promise(resolve => setTimeout(resolve, 500));
      
      message.success('快速记录成功');
      setQuickRecordModalVisible(false);
      quickRecordForm.resetFields();
    } catch (error) {
      message.error('记录失败，请重试');
    } finally {
      setLoading(false);
    }
  };

  // 样本数据表格列定义
  const sampleColumns: ColumnsType<Sample> = [
    {
      title: '样本编号',
      dataIndex: 'sampleCode',
      key: 'sampleCode',
      width: 100
    },
    {
      title: '样本名称',
      dataIndex: 'sampleName',
      key: 'sampleName',
      width: 150
    },
    {
      title: '位置',
      dataIndex: 'position',
      key: 'position',
      width: 80
    },
    {
      title: '体积(μL)',
      dataIndex: 'volume',
      key: 'volume',
      width: 100
    },
    {
      title: '浓度(ng/μL)',
      dataIndex: 'concentration',
      key: 'concentration',
      width: 120
    },
    {
      title: '纯度(260/280)',
      dataIndex: 'purity',
      key: 'purity',
      width: 120
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: (status: SampleStatus) => (
        <Tag color={getStatusColor(status as any)}>
          {getStatusText(status as any)}
        </Tag>
      )
    }
  ];

  // 数据记录表格列定义
  const recordColumns: ColumnsType<StepDataRecord> = [
    {
      title: '样本编号',
      dataIndex: 'sampleCode',
      key: 'sampleCode',
      width: 100
    },
    {
      title: '记录类型',
      dataIndex: 'recordType',
      key: 'recordType',
      width: 100,
      render: (type: string) => {
        const typeMap = {
          basic: '基本信息',
          sample_level: '样本级别',
          batch_level: '批次级别',
          qc: '质量控制'
        };
        return <Tag>{typeMap[type as keyof typeof typeMap] || type}</Tag>;
      }
    },
    {
      title: '记录时间',
      dataIndex: 'recordTime',
      key: 'recordTime',
      width: 150
    },
    {
      title: '操作员',
      dataIndex: 'operator',
      key: 'operator',
      width: 100
    },
    {
      title: '验证状态',
      dataIndex: 'verified',
      key: 'verified',
      width: 100,
      render: (verified: boolean) => (
        <Tag color={verified ? 'success' : 'warning'}>
          {verified ? '已验证' : '待验证'}
        </Tag>
      )
    },
    {
      title: '操作',
      key: 'action',
      width: 120,
      render: (_, record) => (
        <Space>
          <Button
            type="link"
            size="small"
            icon={<EyeOutlined />}
            onClick={() => handleDataRecord(record)}
          >
            查看
          </Button>
          <Button
            type="link"
            size="small"
            icon={<EditOutlined />}
            onClick={() => handleDataRecord(record)}
          >
            编辑
          </Button>
        </Space>
      )
    }
  ];

  if (loading && !batch) {
    return (
      <div style={{ padding: '24px', textAlign: 'center' }}>
        <SyncOutlined spin style={{ fontSize: '24px' }} />
        <div style={{ marginTop: '16px' }}>加载批次详情中...</div>
      </div>
    );
  }

  if (!batch) {
    return (
      <div style={{ padding: '24px', textAlign: 'center' }}>
        <ExclamationCircleOutlined style={{ fontSize: '48px', color: '#faad14' }} />
        <div style={{ marginTop: '16px' }}>批次不存在或已被删除</div>
        <Button type="primary" onClick={() => navigate('/experiment/task-center')}>
          返回任务中心
        </Button>
      </div>
    );
  }

  return (
    <div style={{ padding: '24px' }}>
      {/* 页面头部 */}
      <Card style={{ marginBottom: 24 }}>
        <Row gutter={16} align="middle">
          <Col span={18}>
            <Space>
              <Button 
                type="text" 
                icon={<ArrowLeftOutlined />} 
                onClick={() => navigate('/experiment/task-center')}
              >
                返回
              </Button>
              <Divider type="vertical" />
              <Title level={3} style={{ margin: 0 }}>
                <ExperimentOutlined style={{ marginRight: 8 }} />
                {batch.batchName}
              </Title>
              <Tag color={getStatusColor(batch.status)}>
                {getStatusText(batch.status)}
              </Tag>
            </Space>
          </Col>
          <Col span={6} style={{ textAlign: 'right' }}>
            <Space>
              <Button icon={<PrinterOutlined />}>打印</Button>
              <Button icon={<DownloadOutlined />}>导出</Button>
              <Button type="primary" icon={<SettingOutlined />}>设置</Button>
            </Space>
          </Col>
        </Row>
      </Card>

      {/* 批次统计信息 */}
      <Row gutter={16} style={{ marginBottom: 24 }}>
        <Col span={6}>
          <Card>
            <Statistic
              title="批次进度"
              value={batch.progress}
              suffix="%"
              valueStyle={{ color: '#1890ff' }}
              prefix={<ExperimentOutlined />}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="样本数量"
              value={batch.sampleCount}
              suffix="个"
              valueStyle={{ color: '#52c41a' }}
              prefix={<BarcodeOutlined />}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="当前步骤"
              value={batch.currentStep}
              valueStyle={{ color: '#722ed1', fontSize: '16px' }}
              prefix={<ToolOutlined />}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="执行人员"
              value={batch.operator}
              valueStyle={{ color: '#fa8c16', fontSize: '16px' }}
              prefix={<UserOutlined />}
            />
          </Card>
        </Col>
      </Row>

      {/* 步骤跟踪进度条 */}
      <Card title="实验步骤跟踪" style={{ marginBottom: 24 }}>
        <Steps
          current={batch.steps.findIndex(step => step.status === 'in_progress')}
          status={batch.status === 'failed' ? 'error' : 'process'}
        >
          {batch.steps.map((step, index) => (
            <Step
              key={step.id}
              title={step.stepName}
              description={
                <div>
                  <div>操作员: {step.operator}</div>
                  {step.startTime && (
                    <div>开始: {dayjs(step.startTime).format('MM-DD HH:mm')}</div>
                  )}
                  {step.endTime && (
                    <div>完成: {dayjs(step.endTime).format('MM-DD HH:mm')}</div>
                  )}
                </div>
              }
              status={
                step.status === 'completed' ? 'finish' :
                step.status === 'in_progress' ? 'process' :
                step.status === 'failed' ? 'error' : 'wait'
              }
              icon={getStepIcon(step.status)}
              onClick={() => handleStepClick(step)}
              style={{ cursor: 'pointer' }}
            />
          ))}
        </Steps>
      </Card>

      {/* 主要内容区域 */}
      <Card>
        <Tabs activeKey={activeTab} onChange={setActiveTab}>
          <TabPane tab="批次概览" key="overview">
            <Row gutter={16}>
              <Col span={16}>
                {/* 批次基本信息 */}
                <Card title="批次信息" size="small" style={{ marginBottom: 16 }}>
                  <Descriptions column={2} size="small">
                    <Descriptions.Item label="批次编号">{batch.batchCode}</Descriptions.Item>
                    <Descriptions.Item label="项目名称">{batch.project}</Descriptions.Item>
                    <Descriptions.Item label="优先级">
                      <Tag color={batch.priority === 'high' ? 'red' : batch.priority === 'medium' ? 'orange' : 'blue'}>
                        {batch.priority === 'high' ? '高' : batch.priority === 'medium' ? '中' : '低'}
                      </Tag>
                    </Descriptions.Item>
                    <Descriptions.Item label="创建人">{batch.createdBy}</Descriptions.Item>
                    <Descriptions.Item label="计划开始">{batch.plannedStartDate}</Descriptions.Item>
                    <Descriptions.Item label="计划结束">{batch.plannedEndDate}</Descriptions.Item>
                    <Descriptions.Item label="实际开始">{batch.actualStartDate || '未开始'}</Descriptions.Item>
                    <Descriptions.Item label="实际结束">{batch.actualEndDate || '未完成'}</Descriptions.Item>
                    <Descriptions.Item label="备注" span={2}>{batch.notes}</Descriptions.Item>
                  </Descriptions>
                </Card>

                {/* 样本列表 */}
                <Card title="样本列表" size="small">
                  <Table
                    size="small"
                    dataSource={batch.samples}
                    columns={sampleColumns}
                    rowKey="id"
                    pagination={false}
                    scroll={{ y: 300 }}
                  />
                </Card>
              </Col>
              <Col span={8}>
                {/* 实验进度时间线 */}
                <Card title="进度时间线" size="small">
                  <Timeline>
                    {batch.steps.map(step => (
                      <Timeline.Item
                        key={step.id}
                        dot={getStepIcon(step.status)}
                        color={step.status === 'completed' ? 'green' : step.status === 'in_progress' ? 'blue' : 'gray'}
                      >
                        <div>
                          <Text strong>{step.stepName}</Text>
                          <br />
                          <Text type="secondary">操作员: {step.operator}</Text>
                          <br />
                          {step.startTime && (
                            <Text type="secondary">
                              开始: {dayjs(step.startTime).format('MM-DD HH:mm')}
                            </Text>
                          )}
                          {step.endTime && (
                            <>
                              <br />
                              <Text type="secondary">
                                完成: {dayjs(step.endTime).format('MM-DD HH:mm')}
                              </Text>
                            </>
                          )}
                          {step.notes && (
                            <>
                              <br />
                              <Text type="secondary">{step.notes}</Text>
                            </>
                          )}
                        </div>
                      </Timeline.Item>
                    ))}
                  </Timeline>
                </Card>
              </Col>
            </Row>
          </TabPane>

          <TabPane tab="数据记录" key="records">
            <Space direction="vertical" style={{ width: '100%' }}>
              <Row gutter={16}>
                <Col span={18}>
                  <Space>
                    <Button 
                      type="primary" 
                      icon={<PlusOutlined />}
                      onClick={() => handleDataRecord()}
                    >
                      新增记录
                    </Button>
                    <Button 
                      icon={<SyncOutlined />}
                      onClick={() => setQuickRecordModalVisible(true)}
                    >
                      快速记录
                    </Button>
                    <Button icon={<FileExcelOutlined />}>导入数据</Button>
                    <Button icon={<DownloadOutlined />}>导出数据</Button>
                  </Space>
                </Col>
                <Col span={6} style={{ textAlign: 'right' }}>
                  <Select
                    placeholder="筛选步骤"
                    style={{ width: 150 }}
                    allowClear
                  >
                    {batch.steps.map(step => (
                      <Option key={step.id} value={step.id}>
                        {step.stepName}
                      </Option>
                    ))}
                  </Select>
                </Col>
              </Row>

              {/* 数据记录表格 */}
              <Table
                size="small"
                dataSource={batch.steps.flatMap(step => step.dataRecords)}
                columns={recordColumns}
                rowKey="id"
                pagination={{
                  pageSize: 10,
                  showSizeChanger: true,
                  showQuickJumper: true,
                  showTotal: (total) => `共 ${total} 条记录`
                }}
              />
            </Space>
          </TabPane>

          <TabPane tab="质量控制" key="qc">
            <Row gutter={16}>
              <Col span={12}>
                <Card title="质控统计" size="small">
                  <Row gutter={16}>
                    <Col span={8}>
                      <Statistic
                        title="通过率"
                        value={95.8}
                        suffix="%"
                        valueStyle={{ color: '#52c41a' }}
                      />
                    </Col>
                    <Col span={8}>
                      <Statistic
                        title="警告项"
                        value={2}
                        valueStyle={{ color: '#faad14' }}
                      />
                    </Col>
                    <Col span={8}>
                      <Statistic
                        title="失败项"
                        value={1}
                        valueStyle={{ color: '#ff4d4f' }}
                      />
                    </Col>
                  </Row>
                </Card>
              </Col>
              <Col span={12}>
                <Card title="质控趋势" size="small">
                  <div style={{ height: 200, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Text type="secondary">质控趋势图表</Text>
                  </div>
                </Card>
              </Col>
            </Row>

            <Card title="质控记录" size="small" style={{ marginTop: 16 }}>
              <List
                size="small"
                dataSource={batch.steps.flatMap(step => step.qualityControl)}
                renderItem={qc => (
                  <List.Item>
                    <List.Item.Meta
                      avatar={
                        <Avatar 
                          icon={
                            qc.qcResult === 'pass' ? <CheckCircleOutlined /> :
                            qc.qcResult === 'warning' ? <ExclamationCircleOutlined /> :
                            <CloseCircleOutlined />
                          }
                          style={{
                            backgroundColor: 
                              qc.qcResult === 'pass' ? '#52c41a' :
                              qc.qcResult === 'warning' ? '#faad14' : '#ff4d4f'
                          }}
                        />
                      }
                      title={qc.qcType}
                      description={
                        <div>
                          <div>结果: {qc.qcValue} ({qc.qcRange})</div>
                          <div>时间: {qc.qcTime} | 操作员: {qc.qcOperator}</div>
                          {qc.qcNotes && <div>备注: {qc.qcNotes}</div>}
                        </div>
                      }
                    />
                    <Tag color={qc.qcResult === 'pass' ? 'success' : qc.qcResult === 'warning' ? 'warning' : 'error'}>
                      {qc.qcResult === 'pass' ? '通过' : qc.qcResult === 'warning' ? '警告' : '失败'}
                    </Tag>
                  </List.Item>
                )}
              />
            </Card>
          </TabPane>
        </Tabs>
      </Card>

      {/* 数据记录抽屉 */}
      <Drawer
        title={
          <div>
            <Button 
              type="text" 
              icon={<ArrowLeftOutlined />} 
              onClick={() => setDataRecordDrawerVisible(false)}
              style={{ marginRight: 8 }}
            />
            {selectedStep?.stepName} - 数据记录
          </div>
        }
        placement="right"
        width={800}
        open={dataRecordDrawerVisible}
        onClose={() => setDataRecordDrawerVisible(false)}
      >
        {selectedStep && (
          <div>
            {/* 步骤信息 */}
            <Card title="步骤信息" size="small" style={{ marginBottom: 16 }}>
              <Descriptions column={2} size="small">
                <Descriptions.Item label="步骤名称">{selectedStep.stepName}</Descriptions.Item>
                <Descriptions.Item label="状态">
                  <Tag color={getStatusColor(selectedStep.status)}>
                    {getStatusText(selectedStep.status)}
                  </Tag>
                </Descriptions.Item>
                <Descriptions.Item label="操作员">{selectedStep.operator}</Descriptions.Item>
                <Descriptions.Item label="开始时间">{selectedStep.startTime}</Descriptions.Item>
                <Descriptions.Item label="结束时间">{selectedStep.endTime || '进行中'}</Descriptions.Item>
                <Descriptions.Item label="耗时">
                  {selectedStep.duration ? `${selectedStep.duration}分钟` : '计算中'}
                </Descriptions.Item>
                <Descriptions.Item label="备注" span={2}>{selectedStep.notes}</Descriptions.Item>
              </Descriptions>
            </Card>

            {/* 数据记录表格 */}
            <Card 
              title="数据记录" 
              size="small"
              extra={
                <Space>
                  <Button 
                    type="primary" 
                    size="small"
                    icon={<PlusOutlined />}
                    onClick={() => handleDataRecord()}
                  >
                    新增记录
                  </Button>
                  <Button 
                    size="small"
                    icon={<ReloadOutlined />}
                  >
                    刷新
                  </Button>
                </Space>
              }
            >
              <Table
                size="small"
                dataSource={selectedStep.dataRecords}
                columns={recordColumns}
                rowKey="id"
                pagination={false}
              />
            </Card>
          </div>
        )}
      </Drawer>

      {/* 快速记录模态框 */}
      <Modal
        title="快速记录"
        open={quickRecordModalVisible}
        onCancel={() => setQuickRecordModalVisible(false)}
        onOk={() => quickRecordForm.submit()}
        confirmLoading={loading}
        width={600}
      >
        <Form
          form={quickRecordForm}
          layout="vertical"
          onFinish={handleQuickRecord}
        >
          <Form.Item
            name="stepId"
            label="实验步骤"
            rules={[{ required: true, message: '请选择实验步骤' }]}
          >
            <Select placeholder="请选择实验步骤">
              {batch.steps.map(step => (
                <Option key={step.id} value={step.id}>
                  {step.stepName}
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            name="sampleCode"
            label="样本编号"
            rules={[{ required: true, message: '请输入样本编号' }]}
          >
            <Input placeholder="请输入样本编号" />
          </Form.Item>

          <Form.Item
            name="recordData"
            label="记录数据"
            rules={[{ required: true, message: '请输入记录数据' }]}
          >
            <TextArea rows={4} placeholder="请输入记录数据，支持JSON格式" />
          </Form.Item>

          <Form.Item name="notes" label="备注">
            <TextArea rows={2} placeholder="请输入备注信息" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default BatchDetail;