/**
 * 实验任务中心组件
 * 
 * 功能说明：
 * - 实现三个标签页：待分配样本、进行中批次、已完成批次
 * - 提供批次详情页面，包含步骤跟踪和数据记录
 * - 支持样本分配和批次管理
 * - 实时显示实验进度和状态
 * - 增强数据记录功能
 * 
 * @author 系统
 * @version 2.0.0
 */

import React, { useState, useEffect } from 'react';
import {
  Card,
  Tabs,
  Table,
  Button,
  Space,
  Tag,
  Progress,
  Row,
  Col,
  Statistic,
  List,
  Modal,
  Form,
  Input,
  Select,
  DatePicker,
  message,
  Divider,
  Typography,
  Drawer,
  Steps,
  Checkbox,
  Badge,
  Timeline,
  Upload,
  InputNumber,
  Radio,
  Descriptions,
  Alert,
  Tooltip,
  Popconfirm
} from 'antd';
import {
  ExperimentOutlined,
  PlusOutlined,
  PlayCircleOutlined,
  EyeOutlined,
  PrinterOutlined,
  UploadOutlined,
  FileExcelOutlined,
  ClockCircleOutlined,
  CheckCircleOutlined,
  ExclamationCircleOutlined,
  EditOutlined,
  DeleteOutlined,
  CameraOutlined,
  FileImageOutlined,
  SaveOutlined,
  ReloadOutlined,
  SettingOutlined,
  ArrowLeftOutlined
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import type { ColumnsType } from 'antd/es/table';
import dayjs from 'dayjs';

const { Title, Text, Paragraph } = Typography;
const { Option } = Select;
const { TextArea } = Input;

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
  sampleType: 'DNA' | 'RNA' | 'Protein';
  status: SampleStatus;
  receivedDate: string;
  projectName: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  notes?: string;
}

/**
 * 实验步骤记录接口
 */
interface StepRecord {
  stepType: ExperimentStep;
  stepName: string;
  status: StepStatus;
  operator?: string;
  startTime?: string;
  endTime?: string;
  duration?: number;
  dataRecorded: boolean;
  notes?: string;
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
 * 步骤数据记录接口
 */
interface StepDataRecord {
  id: string;
  batchId: string;
  stepType: ExperimentStep;
  operator: string;
  startTime: string;
  endTime?: string;
  basicInfo: Record<string, any>;
  sampleData: Record<string, any>;
  parameters: Record<string, any>;
  qcResults: Record<string, any>;
  attachments: string[];
  notes: string;
  isDraft: boolean;
}

/**
 * 实验任务中心主组件
 */
const ExperimentTaskCenter: React.FC = () => {
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const [stepRecordForm] = Form.useForm();

  // 状态管理
  const [activeTab, setActiveTab] = useState<string>('unassigned');
  const [loading, setLoading] = useState<boolean>(false);
  const [selectedSamples, setSelectedSamples] = useState<string[]>([]);
  const [createBatchModalVisible, setCreateBatchModalVisible] = useState<boolean>(false);
  const [batchDetailDrawerVisible, setBatchDetailDrawerVisible] = useState<boolean>(false);
  const [stepRecordModalVisible, setStepRecordModalVisible] = useState<boolean>(false);
  const [quickRecordPanelVisible, setQuickRecordPanelVisible] = useState<boolean>(false);
  const [selectedBatch, setSelectedBatch] = useState<ExperimentBatch | null>(null);
  const [selectedStep, setSelectedStep] = useState<ExperimentStep | null>(null);
  const [currentStepRecord, setCurrentStepRecord] = useState<StepDataRecord | null>(null);

  // 数据状态
  const [samples, setSamples] = useState<Sample[]>([]);
  const [inProgressBatches, setInProgressBatches] = useState<ExperimentBatch[]>([]);
  const [completedBatches, setCompletedBatches] = useState<ExperimentBatch[]>([]);

  /**
   * 组件初始化
   */
  useEffect(() => {
    loadData();
  }, []);

  /**
   * 加载数据
   */
  const loadData = async () => {
    setLoading(true);
    try {
      // 模拟数据加载
      const mockSamples: Sample[] = [
        {
          id: 'S001',
          sampleCode: 'S001',
          sampleName: '样本1',
          sampleType: 'DNA',
          status: 'received',
          receivedDate: '2024-05-20',
          projectName: '肿瘤测序项目',
          priority: 'high'
        },
        {
          id: 'S002',
          sampleCode: 'S002',
          sampleName: '样本2',
          sampleType: 'RNA',
          status: 'received',
          receivedDate: '2024-05-20',
          projectName: '肿瘤测序项目',
          priority: 'medium'
        },
        {
          id: 'S003',
          sampleCode: 'S003',
          sampleName: '样本3',
          sampleType: 'DNA',
          status: 'received',
          receivedDate: '2024-05-20',
          projectName: '肿瘤测序项目',
          priority: 'high'
        },
        {
          id: 'S004',
          sampleCode: 'S004',
          sampleName: '样本4',
          sampleType: 'DNA',
          status: 'received',
          receivedDate: '2024-05-20',
          projectName: '基因检测项目',
          priority: 'low'
        }
      ];

      const mockInProgressBatches: ExperimentBatch[] = [
        {
          id: 'EXP001',
          batchCode: 'EXP_20240520_001',
          batchName: '肿瘤基因检测批次-20240520',
          status: 'in_progress',
          sampleCount: 3,
          samples: mockSamples.slice(0, 3),
          operator: '张三',
          project: '肿瘤测序项目',
          plannedStartDate: '2024-05-20 09:30',
          plannedEndDate: '2024-05-20 18:00',
          actualStartDate: '2024-05-20 09:30',
          priority: 'high',
          createdBy: '张三',
          createdTime: '2024-05-20 09:00',
          updatedTime: '2024-05-20 14:30',
          progress: 60,
          currentStep: 'PCR扩增',
          steps: [
            {
              stepType: 'sample_prep',
              stepName: '样本前处理',
              status: 'completed',
              operator: '张三',
              startTime: '09:30',
              endTime: '10:00',
              duration: 30,
              dataRecorded: true
            },
            {
              stepType: 'nucleic_extraction',
              stepName: '核酸提取',
              status: 'completed',
              operator: '张三',
              startTime: '10:00',
              endTime: '11:30',
              duration: 90,
              dataRecorded: true
            },
            {
              stepType: 'pcr',
              stepName: 'PCR扩增',
              status: 'in_progress',
              operator: '张三',
              startTime: '14:30',
              dataRecorded: false
            },
            {
              stepType: 'library_prep',
              stepName: '文库构建',
              status: 'pending',
              dataRecorded: false
            },
            {
              stepType: 'quantification',
              stepName: '文库定量',
              status: 'pending',
              dataRecorded: false
            },
            {
              stepType: 'qc',
              stepName: '最终QC',
              status: 'pending',
              dataRecorded: false
            }
          ]
        },
        {
          id: 'EXP002',
          batchCode: 'EXP_20240519_002',
          batchName: '土壤微生物多样性测序',
          status: 'in_progress',
          sampleCount: 12,
          samples: [],
          operator: '李四',
          project: '环境微生物项目',
          plannedStartDate: '2024-05-19 08:00',
          plannedEndDate: '2024-05-20 17:00',
          actualStartDate: '2024-05-19 08:15',
          priority: 'medium',
          createdBy: '李四',
          createdTime: '2024-05-19 07:30',
          updatedTime: '2024-05-20 10:00',
          progress: 75,
          currentStep: '样本质检',
          steps: []
        },
        {
          id: 'EXP003',
          batchCode: 'EXP_20240518_003',
          batchName: '海洋微生物多样性分析',
          status: 'in_progress',
          sampleCount: 30,
          samples: [],
          operator: '王五',
          project: '海洋生物项目',
          plannedStartDate: '2024-05-18 09:00',
          plannedEndDate: '2024-05-21 16:00',
          actualStartDate: '2024-05-18 09:20',
          priority: 'low',
          createdBy: '王五',
          createdTime: '2024-05-18 08:45',
          updatedTime: '2024-05-20 15:30',
          progress: 85,
          currentStep: '已完成',
          steps: []
        }
      ];

      const mockCompletedBatches: ExperimentBatch[] = [
        {
          id: 'EXP004',
          batchCode: 'EXP_20240517_004',
          batchName: '完成的测序批次示例',
          status: 'completed',
          sampleCount: 8,
          samples: [],
          operator: '赵六',
          project: '基因检测项目',
          plannedStartDate: '2024-05-17 08:00',
          plannedEndDate: '2024-05-17 18:00',
          actualStartDate: '2024-05-17 08:10',
          actualEndDate: '2024-05-17 17:45',
          priority: 'medium',
          createdBy: '赵六',
          createdTime: '2024-05-17 07:30',
          updatedTime: '2024-05-17 17:45',
          progress: 100,
          currentStep: '已完成',
          steps: []
        }
      ];

      setSamples(mockSamples);
      setInProgressBatches(mockInProgressBatches);
      setCompletedBatches(mockCompletedBatches);
    } catch (error) {
      message.error('数据加载失败');
    } finally {
      setLoading(false);
    }
  };

  /**
   * 处理样本选择
   * @param selectedRowKeys 选中的行键
   */
  const handleSampleSelection = (selectedRowKeys: React.Key[]) => {
    setSelectedSamples(selectedRowKeys as string[]);
  };

  /**
   * 创建新批次
   */
  const handleCreateBatch = () => {
    if (selectedSamples.length === 0) {
      message.warning('请先选择要加入批次的样本');
      return;
    }
    setCreateBatchModalVisible(true);
  };

  /**
   * 提交批次创建
   * @param values 表单值
   */
  const handleSubmitBatch = async (values: any) => {
    setLoading(true);
    try {
      const selectedSampleData = samples.filter(sample => 
        selectedSamples.includes(sample.id)
      );

      const newBatch: ExperimentBatch = {
        id: `EXP${Date.now()}`,
        batchCode: `EXP_${dayjs().format('YYYYMMDD')}_${String(Math.floor(Math.random() * 1000)).padStart(3, '0')}`,
        batchName: values.batchName,
        status: 'ready',
        sampleCount: selectedSampleData.length,
        samples: selectedSampleData,
        operator: values.operator || '当前用户',
        project: values.project,
        plannedStartDate: values.plannedStartDate.format('YYYY-MM-DD HH:mm'),
        plannedEndDate: values.plannedEndDate.format('YYYY-MM-DD HH:mm'),
        priority: values.priority,
        notes: values.notes,
        createdBy: '当前用户',
        createdTime: dayjs().format('YYYY-MM-DD HH:mm'),
        updatedTime: dayjs().format('YYYY-MM-DD HH:mm'),
        progress: 0,
        currentStep: '待开始',
        steps: [
          {
            stepType: 'sample_prep',
            stepName: '样本前处理',
            status: 'pending',
            dataRecorded: false
          },
          {
            stepType: 'nucleic_extraction',
            stepName: '核酸提取',
            status: 'pending',
            dataRecorded: false
          },
          {
            stepType: 'pcr',
            stepName: 'PCR扩增',
            status: 'pending',
            dataRecorded: false
          },
          {
            stepType: 'library_prep',
            stepName: '文库构建',
            status: 'pending',
            dataRecorded: false
          },
          {
            stepType: 'quantification',
            stepName: '文库定量',
            status: 'pending',
            dataRecorded: false
          },
          {
            stepType: 'qc',
            stepName: '最终QC',
            status: 'pending',
            dataRecorded: false
          }
        ]
      };

      setInProgressBatches([...inProgressBatches, newBatch]);
      
      // 从待分配样本中移除已分配的样本
      setSamples(samples.filter(sample => !selectedSamples.includes(sample.id)));
      setSelectedSamples([]);
      
      message.success('批次创建成功！');
      setCreateBatchModalVisible(false);
      form.resetFields();
      setActiveTab('inProgress');
    } catch (error) {
      message.error('批次创建失败');
    } finally {
      setLoading(false);
    }
  };

  /**
   * 处理步骤数据记录相关操作
   */
  const handleViewStepData = (record: any) => {
    message.info(`查看/编辑 ${record.stepName} 数据记录`);
    // 这里可以跳转到对应的数据记录页面
    if (record.stepName === '核酸提取') {
      navigate('/experiment/nucleic-extraction-record');
    } else if (record.stepName === 'PCR扩增') {
      navigate('/experiment/pcr-amplification-record');
    } else if (record.stepName === '文库构建') {
      navigate('/experiment/library-construction-record');
    }
  };

  const handleContinueRecord = (record: any) => {
    message.info(`继续记录 ${record.stepName} 数据`);
    // 这里可以打开对应的数据记录界面
    if (record.stepName === '核酸提取') {
      navigate('/experiment/nucleic-extraction-record');
    } else if (record.stepName === 'PCR扩增') {
      navigate('/experiment/pcr-amplification-record');
    } else if (record.stepName === '文库构建') {
      navigate('/experiment/library-construction-record');
    }
  };

  const handleStartRecord = (record: any) => {
    message.info(`开始记录 ${record.stepName} 数据`);
    // 这里可以打开对应的数据记录界面
    if (record.stepName === '核酸提取') {
      navigate('/experiment/nucleic-extraction-record');
    } else if (record.stepName === 'PCR扩增') {
      navigate('/experiment/pcr-amplification-record');
    } else if (record.stepName === '文库构建') {
      navigate('/experiment/library-construction-record');
    }
  };

  /**
   * 查看批次详情
   * @param batch 批次信息
   */
  const handleViewBatch = (batch: ExperimentBatch) => {
    setSelectedBatch(batch);
    setBatchDetailDrawerVisible(true);
  };

  /**
   * 开始步骤记录
   * @param batch 批次信息
   * @param step 步骤类型
   */
  const handleStartStepRecord = (batch: ExperimentBatch, step: ExperimentStep) => {
    setSelectedBatch(batch);
    setSelectedStep(step);
    setStepRecordModalVisible(true);
    
    // 加载或创建步骤记录
    const existingRecord = loadStepRecord(batch.id, step);
    if (existingRecord) {
      setCurrentStepRecord(existingRecord);
      stepRecordForm.setFieldsValue(existingRecord);
    } else {
      const newRecord: StepDataRecord = {
        id: `${batch.id}_${step}_${Date.now()}`,
        batchId: batch.id,
        stepType: step,
        operator: '当前用户',
        startTime: dayjs().format('YYYY-MM-DD HH:mm'),
        basicInfo: {},
        sampleData: {},
        parameters: {},
        qcResults: {},
        attachments: [],
        notes: '',
        isDraft: true
      };
      setCurrentStepRecord(newRecord);
      stepRecordForm.setFieldsValue(newRecord);
    }
  };

  /**
   * 加载步骤记录
   * @param batchId 批次ID
   * @param step 步骤类型
   */
  const loadStepRecord = (batchId: string, step: ExperimentStep): StepDataRecord | null => {
    // 从localStorage或服务器加载草稿数据
    const draftKey = `draft_${batchId}_${step}`;
    const draftData = localStorage.getItem(draftKey);
    if (draftData) {
      return JSON.parse(draftData);
    }
    return null;
  };

  /**
   * 保存步骤记录草稿
   */
  const handleSaveStepDraft = () => {
    const values = stepRecordForm.getFieldsValue();
    if (currentStepRecord) {
      const updatedRecord = { ...currentStepRecord, ...values, isDraft: true };
      setCurrentStepRecord(updatedRecord);
      
      // 保存到localStorage
      const draftKey = `draft_${updatedRecord.batchId}_${updatedRecord.stepType}`;
      localStorage.setItem(draftKey, JSON.stringify(updatedRecord));
      
      message.success('草稿已保存');
    }
  };

  /**
   * 完成步骤记录
   */
  const handleCompleteStepRecord = async () => {
    try {
      const values = await stepRecordForm.validateFields();
      if (currentStepRecord) {
        const completedRecord = { 
          ...currentStepRecord, 
          ...values, 
          isDraft: false,
          endTime: dayjs().format('YYYY-MM-DD HH:mm')
        };
        
        // 更新批次步骤状态
        if (selectedBatch) {
          const updatedBatch = { ...selectedBatch };
          const stepIndex = updatedBatch.steps.findIndex(s => s.stepType === selectedStep);
          if (stepIndex !== -1) {
            updatedBatch.steps[stepIndex].status = 'completed';
            updatedBatch.steps[stepIndex].dataRecorded = true;
            updatedBatch.steps[stepIndex].endTime = dayjs().format('HH:mm');
            
            // 更新批次进度
            const completedSteps = updatedBatch.steps.filter(s => s.status === 'completed').length;
            updatedBatch.progress = Math.round((completedSteps / updatedBatch.steps.length) * 100);
            
            // 更新当前步骤
            const nextPendingStep = updatedBatch.steps.find(s => s.status === 'pending');
            if (nextPendingStep) {
              updatedBatch.currentStep = nextPendingStep.stepName;
              nextPendingStep.status = 'in_progress';
            } else {
              updatedBatch.currentStep = '已完成';
              updatedBatch.status = 'completed';
            }
            
            // 更新批次列表
            setInProgressBatches(inProgressBatches.map(b => 
              b.id === updatedBatch.id ? updatedBatch : b
            ));
            
            setSelectedBatch(updatedBatch);
          }
        }
        
        // 清除草稿
        const draftKey = `draft_${completedRecord.batchId}_${completedRecord.stepType}`;
        localStorage.removeItem(draftKey);
        
        message.success('步骤记录已完成');
        setStepRecordModalVisible(false);
      }
    } catch (error) {
      message.error('请完善必填信息');
    }
  };

  /**
   * 获取步骤状态图标
   * @param status 步骤状态
   */
  const getStepStatusIcon = (status: StepStatus) => {
    switch (status) {
      case 'completed':
        return <CheckCircleOutlined style={{ color: '#52c41a' }} />;
      case 'in_progress':
        return <ClockCircleOutlined style={{ color: '#1890ff' }} />;
      case 'failed':
        return <ExclamationCircleOutlined style={{ color: '#ff4d4f' }} />;
      default:
        return <ClockCircleOutlined style={{ color: '#d9d9d9' }} />;
    }
  };

  /**
   * 获取步骤状态标签
   * @param status 步骤状态
   */
  const getStepStatusTag = (status: StepStatus) => {
    const statusConfig = {
      completed: { color: 'success', text: '✅ 完成' },
      in_progress: { color: 'processing', text: '🔄 进行中' },
      failed: { color: 'error', text: '❌ 失败' },
      pending: { color: 'default', text: '⏳ 待开始' }
    };
    
    const config = statusConfig[status];
    return <Tag color={config.color}>{config.text}</Tag>;
  };

  /**
   * 渲染步骤数据记录表单
   */
  const renderStepRecordForm = () => {
    if (!selectedStep || !selectedBatch) return null;

    const stepNames = {
      sample_prep: '样本前处理',
      nucleic_extraction: '核酸提取',
      pcr: 'PCR扩增',
      library_prep: '文库构建',
      quantification: '文库定量',
      qc: '最终QC'
    };

    return (
      <Form
          form={stepRecordForm}
          layout="vertical"
          initialValues={currentStepRecord || undefined}
        >
        {/* 基本信息 */}
        <Card title="基本信息" size="small" style={{ marginBottom: 16 }}>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="operator"
                label="操作人员"
                rules={[{ required: true, message: '请输入操作人员' }]}
              >
                <Input placeholder="请输入操作人员" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="startTime"
                label="开始时间"
                rules={[{ required: true, message: '请选择开始时间' }]}
              >
                <Input placeholder="开始时间" />
              </Form.Item>
            </Col>
          </Row>
        </Card>

        {/* 样本数据记录 */}
        <Card title="样本数据记录" size="small" style={{ marginBottom: 16 }}>
          <Table
            size="small"
            dataSource={selectedBatch.samples}
            rowKey="id"
            pagination={false}
            columns={[
              {
                title: '样本',
                dataIndex: 'sampleCode',
                key: 'sampleCode',
                width: 100
              },
              {
                title: '浓度(ng/μl)',
                key: 'concentration',
                width: 120,
                render: (_, record) => (
                  <InputNumber
                    size="small"
                    step={0.1}
                    placeholder="浓度"
                    style={{ width: '100%' }}
                  />
                )
              },
              {
                title: '体积(μl)',
                key: 'volume',
                width: 100,
                render: (_, record) => (
                  <InputNumber
                    size="small"
                    step={1}
                    placeholder="体积"
                    style={{ width: '100%' }}
                  />
                )
              },
              {
                title: '260/280',
                key: 'od260280',
                width: 100,
                render: (_, record) => (
                  <InputNumber
                    size="small"
                    step={0.01}
                    placeholder="260/280"
                    style={{ width: '100%' }}
                  />
                )
              },
              {
                title: '操作',
                key: 'action',
                width: 80,
                render: (_, record) => (
                  <Button size="small" type="link">
                    重测
                  </Button>
                )
              }
            ]}
          />
        </Card>

        {/* 实验参数 */}
        <Card title="实验参数" size="small" style={{ marginBottom: 16 }}>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="temperature" label="温度(℃)">
                <InputNumber placeholder="温度" style={{ width: '100%' }} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="duration" label="时间(分钟)">
                <InputNumber placeholder="时间" style={{ width: '100%' }} />
              </Form.Item>
            </Col>
          </Row>
        </Card>

        {/* 质量控制 */}
        <Card title="质量控制" size="small" style={{ marginBottom: 16 }}>
          <Form.Item name="qcChecks" label="质检项目">
            <Checkbox.Group>
              <Row>
                <Col span={24}>
                  <Checkbox value="concentration">浓度检查: 所有样本 &gt; 10ng/μl</Checkbox>
                </Col>
                <Col span={24}>
                  <Checkbox value="purity">纯度检查: 260/280在1.8-2.0之间</Checkbox>
                </Col>
                <Col span={24}>
                  <Checkbox value="integrity">完整性: 电泳检测通过</Checkbox>
                </Col>
              </Row>
            </Checkbox.Group>
          </Form.Item>
        </Card>

        {/* 附件上传 */}
        <Card title="附件" size="small" style={{ marginBottom: 16 }}>
          <Space>
            <Upload>
              <Button icon={<FileImageOutlined />} size="small">
                上传电泳图
              </Button>
            </Upload>
            <Upload>
              <Button icon={<UploadOutlined />} size="small">
                上传检测报告
              </Button>
            </Upload>
            <Button icon={<CameraOutlined />} size="small">
              拍照
            </Button>
          </Space>
        </Card>

        {/* 备注 */}
        <Form.Item name="notes" label="备注">
          <TextArea rows={3} placeholder="请输入备注信息" />
        </Form.Item>
      </Form>
    );
  };

  // 待分配样本表格列定义
  const sampleColumns: ColumnsType<Sample> = [
    {
      title: '样本编号',
      dataIndex: 'sampleCode',
      key: 'sampleCode',
      width: 120
    },
    {
      title: '样本名称',
      dataIndex: 'sampleName',
      key: 'sampleName',
      width: 150
    },
    {
      title: '样本类型',
      dataIndex: 'sampleType',
      key: 'sampleType',
      width: 100,
      render: (type: string) => (
        <Tag color={type === 'DNA' ? 'blue' : type === 'RNA' ? 'green' : 'orange'}>
          {type}
        </Tag>
      )
    },
    {
      title: '接收日期',
      dataIndex: 'receivedDate',
      key: 'receivedDate',
      width: 120
    },
    {
      title: '操作',
      key: 'action',
      width: 120,
      render: (_, record) => (
        <Button
          type="link"
          size="small"
          onClick={() => setSelectedSamples([...selectedSamples, record.id])}
        >
          加入批次
        </Button>
      )
    }
  ];

  return (
    <div style={{ padding: '24px' }}>
      {/* 页面标题 */}
      <Row gutter={24} style={{ marginBottom: 24 }}>
        <Col span={18}>
          <Card>
            <Title level={2} style={{ margin: 0 }}>
              <ExperimentOutlined style={{ marginRight: 8 }} />
              实验任务中心
            </Title>
            <Text type="secondary">
              管理实验样本分配、批次执行和进度跟踪，支持详细的数据记录功能
            </Text>
          </Card>
        </Col>
        <Col span={6}>
          {/* 快捷操作面板 */}
          <Card title="快捷操作" size="small">
            <Space direction="vertical" style={{ width: '100%' }}>
              <Button 
                type="primary" 
                icon={<PlusOutlined />}
                onClick={handleCreateBatch}
                disabled={selectedSamples.length === 0}
                block
              >
                创建新批次 ({selectedSamples.length})
              </Button>
              <Button icon={<UploadOutlined />} block>
                批量导入样本
              </Button>
              <Button icon={<PrinterOutlined />} block>
                打印标签
              </Button>
              <Button icon={<FileExcelOutlined />} block>
                导出数据
              </Button>
            </Space>
          </Card>
        </Col>
      </Row>

      {/* 主要内容区域 */}
      <Row gutter={24}>
        <Col span={18}>
          <Card>
            <Tabs 
              activeKey={activeTab} 
              onChange={setActiveTab}
              items={[
                {
                  key: 'unassigned',
                  label: `🔘 待分配样本(${samples.length})`,
                  children: (
                    <div>
                      <Table
                        columns={sampleColumns}
                        dataSource={samples}
                        rowKey="id"
                        loading={loading}
                        rowSelection={{
                          selectedRowKeys: selectedSamples,
                          onChange: handleSampleSelection,
                          type: 'checkbox'
                        }}
                        pagination={{
                          total: samples.length,
                          pageSize: 10,
                          showSizeChanger: true,
                          showQuickJumper: true,
                          showTotal: (total) => `共 ${total} 个样本`
                        }}
                      />
                      <div style={{ marginTop: 16, textAlign: 'center' }}>
                        <Space>
                          <Checkbox
                            checked={selectedSamples.length === samples.length && samples.length > 0}
                            indeterminate={selectedSamples.length > 0 && selectedSamples.length < samples.length}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setSelectedSamples(samples.map(s => s.id));
                              } else {
                                setSelectedSamples([]);
                              }
                            }}
                          >
                            全选
                          </Checkbox>
                          <Button 
                            type="primary" 
                            size="large"
                            onClick={handleCreateBatch}
                            disabled={selectedSamples.length === 0}
                          >
                            创建新批次并加入选中样本({selectedSamples.length})
                          </Button>
                        </Space>
                      </div>
                    </div>
                  )
                },
                {
                  key: 'inProgress',
                  label: `🔘 进行中批次(${inProgressBatches.length})`,
                  children: (
                    <div>
                      <Row gutter={16}>
                        {inProgressBatches.map(batch => (
                          <Col span={12} key={batch.id} style={{ marginBottom: 16 }}>
                            <Card
                              size="small"
                              title={
                                <div>
                                  <Text strong>{batch.batchCode}</Text>
                                  <br />
                                  <Text type="secondary" style={{ fontSize: '12px' }}>
                                    {batch.batchName}
                                  </Text>
                                </div>
                              }
                              extra={
                                <Badge 
                                  count={`${batch.progress}%`} 
                                  style={{ backgroundColor: '#52c41a' }} 
                                />
                              }
                              actions={[
                                <Button 
                                  type="link" 
                                  onClick={() => handleViewBatch(batch)}
                                  key="view"
                                >
                                  查看详情
                                </Button>
                              ]}
                            >
                              <div style={{ marginBottom: 8 }}>
                                <Progress percent={batch.progress} size="small" />
                              </div>
                              <Descriptions size="small" column={1}>
                                <Descriptions.Item label="当前步骤">
                                  <Text strong>{batch.currentStep}</Text>
                                </Descriptions.Item>
                                <Descriptions.Item label="负责人">
                                  {batch.operator}
                                </Descriptions.Item>
                                <Descriptions.Item label="样本数">
                                  {batch.sampleCount}个
                                </Descriptions.Item>
                                <Descriptions.Item label="项目">
                                  {batch.project}
                                </Descriptions.Item>
                              </Descriptions>
                            </Card>
                          </Col>
                        ))}
                      </Row>
                    </div>
                  )
                },
                {
                  key: 'completed',
                  label: `🔘 已完成(${completedBatches.length})`,
                  children: (
                    <div>
                      <Table
                        size="small"
                        dataSource={completedBatches}
                        rowKey="id"
                        columns={[
                          {
                            title: '批次编号',
                            dataIndex: 'batchCode',
                            key: 'batchCode'
                          },
                          {
                            title: '批次名称',
                            dataIndex: 'batchName',
                            key: 'batchName'
                          },
                          {
                            title: '样本数',
                            dataIndex: 'sampleCount',
                            key: 'sampleCount',
                            render: (count) => `${count}个`
                          },
                          {
                            title: '完成时间',
                            dataIndex: 'actualEndDate',
                            key: 'actualEndDate'
                          },
                          {
                            title: '操作',
                            key: 'action',
                            render: (_, record) => (
                              <Space>
                                <Button 
                                  type="link" 
                                  size="small"
                                  onClick={() => handleViewBatch(record)}
                                >
                                  查看详情
                                </Button>
                                <Button type="link" size="small">
                                  导出报告
                                </Button>
                              </Space>
                            )
                          }
                        ]}
                      />
                    </div>
                  )
                }
              ]}
            />
          </Card>
        </Col>
        
        <Col span={6}>
          <Space direction="vertical" style={{ width: '100%' }}>
            {/* 统计信息 */}
            <Card title="统计信息" size="small">
              <Statistic title="待分配样本" value={samples.length} />
              <Statistic title="进行中批次" value={inProgressBatches.length} />
              <Statistic title="已完成批次" value={completedBatches.length} />
            </Card>
            
            {/* 试剂状态 */}
            <Card title="试剂状态" size="small">
              <List
                size="small"
                dataSource={[
                  { name: 'PCR Mix', status: '充足', color: 'green' },
                  { name: 'DNA提取试剂', status: '不足', color: 'red' },
                  { name: '磁珠', status: '充足', color: 'green' }
                ]}
                renderItem={item => (
                  <List.Item>
                    <Text>{item.name}</Text>
                    <Tag color={item.color}>{item.status}</Tag>
                  </List.Item>
                )}
              />
            </Card>

            {/* 仪器状态 */}
            <Card title="仪器状态" size="small">
              <List
                size="small"
                dataSource={[
                  { name: 'PCR仪-01', status: '空闲', color: 'green' },
                  { name: '离心机-02', status: '使用中', color: 'orange' },
                  { name: '水浴锅-03', status: '空闲', color: 'green' }
                ]}
                renderItem={item => (
                  <List.Item>
                    <Text>{item.name}</Text>
                    <Tag color={item.color}>{item.status}</Tag>
                  </List.Item>
                )}
              />
            </Card>
          </Space>
        </Col>
      </Row>

      {/* 创建批次模态框 */}
      <Modal
        title="创建新批次"
        open={createBatchModalVisible}
        onCancel={() => setCreateBatchModalVisible(false)}
        onOk={() => form.submit()}
        confirmLoading={loading}
        width={600}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmitBatch}
        >
          <Form.Item
            name="batchName"
            label="批次名称"
            rules={[{ required: true, message: '请输入批次名称' }]}
          >
            <Input placeholder="请输入批次名称" />
          </Form.Item>
          
          <Form.Item
            name="project"
            label="所属项目"
            rules={[{ required: true, message: '请输入所属项目' }]}
          >
            <Input placeholder="请输入所属项目" />
          </Form.Item>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="plannedStartDate"
                label="计划开始时间"
                rules={[{ required: true, message: '请选择开始时间' }]}
              >
                <DatePicker 
                  showTime 
                  style={{ width: '100%' }}
                  placeholder="选择开始时间"
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="plannedEndDate"
                label="计划结束时间"
                rules={[{ required: true, message: '请选择结束时间' }]}
              >
                <DatePicker 
                  showTime 
                  style={{ width: '100%' }}
                  placeholder="选择结束时间"
                />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            name="priority"
            label="优先级"
            rules={[{ required: true, message: '请选择优先级' }]}
          >
            <Radio.Group>
              <Radio value="low">低</Radio>
              <Radio value="medium">中</Radio>
              <Radio value="high">高</Radio>
              <Radio value="urgent">紧急</Radio>
            </Radio.Group>
          </Form.Item>

          <Form.Item name="notes" label="备注">
            <TextArea rows={3} placeholder="请输入备注信息" />
          </Form.Item>

          <Alert
            message={`将创建包含 ${selectedSamples.length} 个样本的新批次`}
            type="info"
            showIcon
            style={{ marginTop: 16 }}
          />
        </Form>
      </Modal>

      {/* 批次详情抽屉 */}
      <Drawer
        title={
          <div>
            <Button 
              type="text" 
              icon={<ArrowLeftOutlined />} 
              onClick={() => setBatchDetailDrawerVisible(false)}
              style={{ marginRight: 8 }}
            />
            实验批次: {selectedBatch?.batchCode}
            <Button 
              type="text" 
              icon={<SettingOutlined />} 
              style={{ marginLeft: 8 }}
            />
          </div>
        }
        placement="right"
        width={900}
        open={batchDetailDrawerVisible}
        onClose={() => setBatchDetailDrawerVisible(false)}
      >
        {selectedBatch && (
          <div>
            {/* 批次信息 */}
            <Card title="批次信息" size="small" style={{ marginBottom: 16 }}>
              <Row gutter={16}>
                <Col span={8}>
                  <Statistic 
                    title="状态" 
                    value="🔄 进行中" 
                    valueStyle={{ fontSize: '16px' }}
                  />
                </Col>
                <Col span={8}>
                  <Statistic 
                    title="负责人" 
                    value={selectedBatch.operator}
                    valueStyle={{ fontSize: '16px' }}
                  />
                </Col>
                <Col span={8}>
                  <Statistic 
                    title="创建时间" 
                    value={selectedBatch.createdTime}
                    valueStyle={{ fontSize: '16px' }}
                  />
                </Col>
              </Row>
              <Row gutter={16} style={{ marginTop: 16 }}>
                <Col span={8}>
                  <Statistic 
                    title="样本数" 
                    value={`${selectedBatch.sampleCount}个`}
                    valueStyle={{ fontSize: '16px' }}
                  />
                </Col>
                <Col span={8}>
                  <Statistic 
                    title="项目" 
                    value={selectedBatch.project}
                    valueStyle={{ fontSize: '16px' }}
                  />
                </Col>
                <Col span={8}>
                  <Statistic 
                    title="预计完成" 
                    value="今天"
                    valueStyle={{ fontSize: '16px' }}
                  />
                </Col>
              </Row>
            </Card>

            {/* 步骤跟踪 */}
            <Card title="步骤跟踪" size="small" style={{ marginBottom: 16 }}>
              <div style={{ marginBottom: 16 }}>
                <Progress 
                  percent={selectedBatch.progress} 
                  strokeColor="#52c41a"
                  format={(percent) => `${percent}% 完成`}
                />
              </div>
            </Card>

            {/* 实验步骤与数据记录 */}
            <Card title="实验步骤与数据记录" size="small" style={{ marginBottom: 16 }}>
              <Table
                size="small"
                dataSource={selectedBatch.steps}
                rowKey="stepType"
                pagination={false}
                columns={[
                  {
                    title: '步骤',
                    dataIndex: 'stepName',
                    key: 'stepName',
                    width: 120
                  },
                  {
                    title: '状态',
                    dataIndex: 'status',
                    key: 'status',
                    width: 100,
                    render: (status: StepStatus) => getStepStatusTag(status)
                  },
                  {
                    title: '数据记录',
                    key: 'dataRecord',
                    width: 100,
                    render: (_, record) => {
                      if (record.status === 'completed') {
                        return (
                          <Button 
                            type="link" 
                            size="small"
                            onClick={() => handleStartStepRecord(selectedBatch, record.stepType)}
                          >
                            查看/编辑
                          </Button>
                        );
                      } else if (record.status === 'in_progress') {
                        return (
                          <Button 
                            type="link" 
                            size="small"
                            onClick={() => handleStartStepRecord(selectedBatch, record.stepType)}
                          >
                            继续记录
                          </Button>
                        );
                      } else {
                        return (
                          <Button 
                            type="link" 
                            size="small"
                            disabled={record.status === 'pending'}
                            onClick={() => handleStartStepRecord(selectedBatch, record.stepType)}
                          >
                            开始记录
                          </Button>
                        );
                      }
                    }
                  },
                  {
                    title: '时间',
                    key: 'time',
                    render: (_, record) => {
                      if (record.startTime && record.endTime) {
                        return `${record.startTime}-${record.endTime}`;
                      } else if (record.startTime) {
                        return `${record.startTime}-`;
                      } else {
                        return '-';
                      }
                    }
                  }
                ]}
              />
            </Card>

            {/* 当前步骤实时记录 */}
            <Card title="📝 当前步骤实时记录" size="small" style={{ marginBottom: 16 }}>
              <Alert
                message="PCR扩增进行中"
                description="当前正在进行PCR扩增步骤，预计16:30完成。如有异常情况请及时记录。"
                type="info"
                showIcon
                style={{ marginBottom: 12 }}
              />
              <Space>
                <Button 
                  size="small"
                  onClick={() => setQuickRecordPanelVisible(true)}
                >
                  快速记录异常
                </Button>
                <Button size="small" icon={<UploadOutlined />}>
                  上传附件
                </Button>
                <Button size="small" icon={<EditOutlined />}>
                  添加备注
                </Button>
              </Space>
            </Card>

            {/* 样本列表 */}
            <Card title="样本列表" size="small">
              <Table
                columns={[
                  { title: '样本编号', dataIndex: 'sampleCode', key: 'sampleCode' },
                  { title: '样本名称', dataIndex: 'sampleName', key: 'sampleName' },
                  { title: '样本类型', dataIndex: 'sampleType', key: 'sampleType' },
                  { 
                    title: '当前状态', 
                    dataIndex: 'status', 
                    key: 'status',
                    render: (status: string) => (
                      <Badge 
                        status={status === 'completed' ? 'success' : 
                                status === 'processing' ? 'processing' : 'default'} 
                        text={status === 'completed' ? '已完成' : 
                              status === 'processing' ? '处理中' : '待处理'} 
                      />
                    )
                  },
                  {
                    title: '操作',
                    key: 'action',
                    render: (_, record: any) => (
                      <Space>
                        <Button size="small" type="link">查看详情</Button>
                        <Button size="small" type="link">记录数据</Button>
                      </Space>
                    )
                  }
                ]}
                dataSource={selectedBatch.samples}
                rowKey="id"
                size="small"
                pagination={false}
              />
            </Card>
          </div>
        )}
      </Drawer>

      {/* 步骤数据记录模态框 */}
      <Modal
        title={`${selectedStep ? {
          sample_prep: '样本前处理',
          nucleic_extraction: '核酸提取',
          pcr: 'PCR扩增',
          library_prep: '文库构建',
          quantification: '文库定量',
          qc: '最终QC'
        }[selectedStep] : ''} - 数据记录`}
        open={stepRecordModalVisible}
        onCancel={() => setStepRecordModalVisible(false)}
        width={900}
        footer={[
          <Button key="draft" onClick={handleSaveStepDraft}>
            <SaveOutlined />
            保存草稿
          </Button>,
          <Button key="complete" type="primary" onClick={handleCompleteStepRecord}>
            <CheckCircleOutlined />
            完成步骤
          </Button>
        ]}
      >
        {renderStepRecordForm()}
      </Modal>

      {/* 快速记录面板 */}
      {quickRecordPanelVisible && (
        <div
          style={{
            position: 'fixed',
            bottom: 0,
            left: 0,
            right: 0,
            backgroundColor: '#fff',
            borderTop: '1px solid #d9d9d9',
            padding: '16px',
            zIndex: 1000,
            boxShadow: '0 -2px 8px rgba(0,0,0,0.1)'
          }}
        >
          <Card 
            title={`快速记录 - ${selectedBatch?.currentStep}`}
            size="small"
            extra={
              <Space>
                <Button 
                  size="small" 
                  onClick={() => setQuickRecordPanelVisible(false)}
                >
                  隐藏
                </Button>
                <Button size="small" icon={<SettingOutlined />}>
                  设置
                </Button>
              </Space>
            }
          >
            <Row gutter={16}>
              <Col span={6}>
                <Select 
                  placeholder="选择样本" 
                  style={{ width: '100%' }}
                  mode="multiple"
                >
                  {selectedBatch?.samples.map(sample => (
                    <Option key={sample.id} value={sample.id}>
                      {sample.sampleCode}
                    </Option>
                  ))}
                  <Option value="all">所有样本</Option>
                </Select>
              </Col>
              <Col span={12}>
                <Space>
                  <Button size="small">温度异常</Button>
                  <Button size="small">仪器报警</Button>
                  <Button size="small">试剂问题</Button>
                  <Button size="small">操作失误</Button>
                </Space>
              </Col>
              <Col span={6}>
                <Space>
                  <Button size="small" icon={<CameraOutlined />}>
                    拍照记录
                  </Button>
                  <Button size="small" icon={<CheckCircleOutlined />}>
                    标记完成
                  </Button>
                </Space>
              </Col>
            </Row>
            <Row style={{ marginTop: 8 }}>
              <Col span={18}>
                <Input placeholder="快速备注..." />
              </Col>
              <Col span={6} style={{ paddingLeft: 8 }}>
                <Button type="primary" size="small" block>
                  记录
                </Button>
              </Col>
            </Row>
          </Card>
        </div>
      )}
    </div>
  );
};

export default ExperimentTaskCenter;