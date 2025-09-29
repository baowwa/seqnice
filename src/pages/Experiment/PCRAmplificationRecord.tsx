/**
 * PCR扩增步骤记录界面组件
 * 
 * 功能说明：
 * - 提供PCR扩增步骤的详细数据记录功能
 * - 包含基本信息、PCR反应体系记录、PCR程序参数、样本分配记录等
 * - 支持批量样本处理和实时数据验证
 * - 提供移动端优化界面和快速记录功能
 * - 集成质量控制和数据验证机制
 * 
 * @author 系统
 * @version 2.0.0
 */

import React, { useState, useEffect } from 'react';
import {
  Card,
  Form,
  Input,
  Select,
  DatePicker,
  InputNumber,
  Button,
  Space,
  Table,
  Tag,
  Row,
  Col,
  Divider,
  Typography,
  Alert,
  message,
  Modal,
  Drawer,
  Tabs,
  Upload,
  Image,
  Checkbox,
  Radio,
  TimePicker,
  Tooltip,
  Popconfirm,
  Progress,
  Statistic,
  List,
  Avatar,
  Badge,
  Switch,
  Collapse,
  Steps,
  Transfer
} from 'antd';
import {
  SaveOutlined,
  ReloadOutlined,
  PlusOutlined,
  DeleteOutlined,
  EditOutlined,
  EyeOutlined,
  UploadOutlined,
  CameraOutlined,
  FileImageOutlined,
  ExclamationCircleOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  WarningOutlined,
  SyncOutlined,
  PrinterOutlined,
  DownloadOutlined,
  SettingOutlined,
  BarcodeOutlined,
  ExperimentOutlined,
  ClockCircleOutlined,
  UserOutlined,
  FileTextOutlined,
  ThunderboltOutlined,
  FireOutlined,
  HourglassOutlined,
  ControlOutlined
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import dayjs from 'dayjs';

const { Title, Text, Paragraph } = Typography;
const { Option } = Select;
const { TextArea } = Input;
const { TabPane } = Tabs;
const { Panel } = Collapse;
const { Step } = Steps;

/**
 * PCR类型枚举
 */
type PCRType = 'standard' | 'nested' | 'multiplex' | 'qpcr' | 'rt_pcr';

/**
 * 引物类型枚举
 */
type PrimerType = 'forward' | 'reverse' | 'probe';

/**
 * 质控状态枚举
 */
type QCStatus = 'pass' | 'warning' | 'fail' | 'pending';

/**
 * PCR反应体系组分接口定义
 */
interface PCRComponent {
  id: string;
  name: string;
  concentration: string;
  volume: number;
  finalConcentration?: string;
  lot?: string;
  notes?: string;
}

/**
 * PCR程序步骤接口定义
 */
interface PCRProgramStep {
  id: string;
  stepName: string;
  temperature: number;
  duration: string;
  cycles?: number;
  rampRate?: number;
  notes?: string;
}

/**
 * 样本PCR记录接口定义
 */
interface SamplePCRRecord {
  id: string;
  sampleId: string;
  sampleCode: string;
  sampleName: string;
  wellPosition: string;
  templateVolume: number;
  templateConcentration: number;
  dilutionFactor?: number;
  // PCR结果
  amplificationSuccess: boolean;
  ctValue?: number;
  amplificationEfficiency?: number;
  meltingTemperature?: number;
  productSize?: number;
  gelLane?: number;
  bandIntensity?: 'strong' | 'medium' | 'weak' | 'none';
  // 质量控制
  qcStatus: QCStatus;
  qcNotes?: string;
  gelImage?: string;
  // 记录信息
  operator: string;
  recordTime: string;
  verified: boolean;
  notes?: string;
}

/**
 * 批次PCR参数接口定义
 */
interface BatchPCRParams {
  batchId: string;
  pcrType: PCRType;
  targetGene: string;
  primerPair: string;
  forwardPrimer: string;
  reversePrimer: string;
  probe?: string;
  expectedProductSize: number;
  reactionVolume: number;
  components: PCRComponent[];
  program: PCRProgramStep[];
  equipment: string;
  equipmentModel?: string;
  plateType?: string;
  // 环境条件
  environmentalConditions: {
    temperature: number;
    humidity: number;
    pressure?: number;
  };
  operator: string;
  startTime: string;
  estimatedEndTime: string;
  notes?: string;
}

/**
 * 引物信息接口定义
 */
interface PrimerInfo {
  id: string;
  name: string;
  type: PrimerType;
  sequence: string;
  length: number;
  tm: number;
  gc: number;
  concentration: string;
  lot: string;
  supplier?: string;
  notes?: string;
}

/**
 * PCR扩增步骤记录组件
 * 
 * @returns {JSX.Element} PCR扩增记录界面
 */
const PCRAmplificationRecord: React.FC = () => {
  // 状态管理
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('basic');
  const [sampleRecords, setSampleRecords] = useState<SamplePCRRecord[]>([]);
  const [batchParams, setBatchParams] = useState<BatchPCRParams | null>(null);
  const [primerInfo, setPrimerInfo] = useState<PrimerInfo[]>([]);
  const [selectedSamples, setSelectedSamples] = useState<string[]>([]);
  const [editingRecord, setEditingRecord] = useState<SamplePCRRecord | null>(null);
  const [recordModalVisible, setRecordModalVisible] = useState(false);
  const [batchParamsModalVisible, setBatchParamsModalVisible] = useState(false);
  const [programModalVisible, setProgramModalVisible] = useState(false);
  const [componentModalVisible, setComponentModalVisible] = useState(false);
  const [quickRecordDrawerVisible, setQuickRecordDrawerVisible] = useState(false);
  const [sampleAllocationVisible, setSampleAllocationVisible] = useState(false);
  
  // 表单实例
  const [basicForm] = Form.useForm();
  const [sampleForm] = Form.useForm();
  const [batchForm] = Form.useForm();
  const [programForm] = Form.useForm();
  const [componentForm] = Form.useForm();
  const [quickForm] = Form.useForm();

  // 模拟数据
  const mockSampleRecords: SamplePCRRecord[] = [
    {
      id: 'pcr_record_001',
      sampleId: 'sample_001',
      sampleCode: 'S001',
      sampleName: '土壤样本-1',
      wellPosition: 'A1',
      templateVolume: 2,
      templateConcentration: 125.6,
      dilutionFactor: 10,
      amplificationSuccess: true,
      ctValue: 28.5,
      amplificationEfficiency: 95.2,
      meltingTemperature: 82.3,
      productSize: 450,
      gelLane: 1,
      bandIntensity: 'strong',
      qcStatus: 'pass',
      operator: '张实验员',
      recordTime: '2024-01-16 14:30:00',
      verified: true,
      notes: 'PCR扩增成功，产物大小正确'
    },
    {
      id: 'pcr_record_002',
      sampleId: 'sample_002',
      sampleCode: 'S002',
      sampleName: '水样-1',
      wellPosition: 'A2',
      templateVolume: 2,
      templateConcentration: 98.3,
      dilutionFactor: 5,
      amplificationSuccess: true,
      ctValue: 31.2,
      amplificationEfficiency: 88.7,
      meltingTemperature: 82.1,
      productSize: 450,
      gelLane: 2,
      bandIntensity: 'medium',
      qcStatus: 'pass',
      operator: '张实验员',
      recordTime: '2024-01-16 14:30:00',
      verified: true,
      notes: 'PCR扩增成功，信号中等'
    }
  ];

  const mockBatchParams: BatchPCRParams = {
    batchId: 'pcr_batch_001',
    pcrType: 'standard',
    targetGene: '16S rRNA',
    primerPair: '27F/1492R',
    forwardPrimer: '27F',
    reversePrimer: '1492R',
    expectedProductSize: 1465,
    reactionVolume: 25,
    components: [
      {
        id: 'comp_001',
        name: '2×Taq Master Mix',
        concentration: '2×',
        volume: 12.5,
        finalConcentration: '1×',
        lot: 'LOT20240115'
      },
      {
        id: 'comp_002',
        name: 'Forward Primer',
        concentration: '10 μM',
        volume: 1,
        finalConcentration: '0.4 μM',
        lot: 'LOT20240112'
      },
      {
        id: 'comp_003',
        name: 'Reverse Primer',
        concentration: '10 μM',
        volume: 1,
        finalConcentration: '0.4 μM',
        lot: 'LOT20240112'
      },
      {
        id: 'comp_004',
        name: 'ddH2O',
        concentration: '-',
        volume: 8.5,
        finalConcentration: '-'
      },
      {
        id: 'comp_005',
        name: 'Template DNA',
        concentration: 'Variable',
        volume: 2,
        finalConcentration: '10-100 ng'
      }
    ],
    program: [
      {
        id: 'step_001',
        stepName: '初始变性',
        temperature: 95,
        duration: '5 min',
        cycles: 1
      },
      {
        id: 'step_002',
        stepName: '变性',
        temperature: 95,
        duration: '30 s',
        cycles: 35
      },
      {
        id: 'step_003',
        stepName: '退火',
        temperature: 55,
        duration: '30 s',
        cycles: 35
      },
      {
        id: 'step_004',
        stepName: '延伸',
        temperature: 72,
        duration: '90 s',
        cycles: 35
      },
      {
        id: 'step_005',
        stepName: '最终延伸',
        temperature: 72,
        duration: '10 min',
        cycles: 1
      }
    ],
    equipment: 'Bio-Rad T100',
    equipmentModel: 'T100 Thermal Cycler',
    plateType: '96-well',
    environmentalConditions: {
      temperature: 22,
      humidity: 45,
      pressure: 1013
    },
    operator: '张实验员',
    startTime: '2024-01-16 13:00:00',
    estimatedEndTime: '2024-01-16 16:30:00',
    notes: '标准PCR扩增流程，注意避免污染'
  };

  const mockPrimerInfo: PrimerInfo[] = [
    {
      id: 'primer_001',
      name: '27F',
      type: 'forward',
      sequence: 'AGAGTTTGATCMTGGCTCAG',
      length: 20,
      tm: 52.1,
      gc: 50.0,
      concentration: '10 μM',
      lot: 'LOT20240112',
      supplier: 'Sangon Biotech'
    },
    {
      id: 'primer_002',
      name: '1492R',
      type: 'reverse',
      sequence: 'TACGGYTACCTTGTTACGACTT',
      length: 22,
      tm: 54.3,
      gc: 45.5,
      concentration: '10 μM',
      lot: 'LOT20240112',
      supplier: 'Sangon Biotech'
    }
  ];

  useEffect(() => {
    // 模拟加载数据
    setLoading(true);
    setTimeout(() => {
      setSampleRecords(mockSampleRecords);
      setBatchParams(mockBatchParams);
      setPrimerInfo(mockPrimerInfo);
      setLoading(false);
    }, 1000);
  }, []);

  /**
   * 获取PCR类型文本
   * @param type PCR类型
   * @returns 类型文本
   */
  const getPCRTypeText = (type: PCRType): string => {
    const typeMap = {
      standard: '标准PCR',
      nested: '巢式PCR',
      multiplex: '多重PCR',
      qpcr: '实时定量PCR',
      rt_pcr: '逆转录PCR'
    };
    return typeMap[type] || type;
  };

  /**
   * 获取质控状态颜色
   * @param status 质控状态
   * @returns 颜色
   */
  const getQCStatusColor = (status: QCStatus): string => {
    const colorMap = {
      pass: 'success',
      warning: 'warning',
      fail: 'error',
      pending: 'default'
    };
    return colorMap[status] || 'default';
  };

  /**
   * 获取质控状态文本
   * @param status 质控状态
   * @returns 状态文本
   */
  const getQCStatusText = (status: QCStatus): string => {
    const textMap = {
      pass: '通过',
      warning: '警告',
      fail: '失败',
      pending: '待检'
    };
    return textMap[status] || status;
  };

  /**
   * 获取条带强度颜色
   * @param intensity 条带强度
   * @returns 颜色
   */
  const getBandIntensityColor = (intensity?: string): string => {
    const colorMap = {
      strong: '#52c41a',
      medium: '#faad14',
      weak: '#ff7a45',
      none: '#ff4d4f'
    };
    return colorMap[intensity || 'none'] || '#d9d9d9';
  };

  /**
   * 处理样本记录编辑
   * @param record 样本记录
   */
  const handleEditRecord = (record?: SamplePCRRecord) => {
    setEditingRecord(record || null);
    if (record) {
      sampleForm.setFieldsValue({
        ...record,
        recordTime: dayjs(record.recordTime)
      });
    } else {
      sampleForm.resetFields();
    }
    setRecordModalVisible(true);
  };

  /**
   * 保存样本记录
   * @param values 表单值
   */
  const handleSaveRecord = async (values: any) => {
    try {
      setLoading(true);
      // 模拟保存数据
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const newRecord: SamplePCRRecord = {
        ...values,
        id: editingRecord?.id || `pcr_record_${Date.now()}`,
        recordTime: values.recordTime.format('YYYY-MM-DD HH:mm:ss'),
        verified: false
      };

      if (editingRecord) {
        setSampleRecords(prev => prev.map(r => r.id === editingRecord.id ? newRecord : r));
        message.success('记录更新成功');
      } else {
        setSampleRecords(prev => [...prev, newRecord]);
        message.success('记录添加成功');
      }

      setRecordModalVisible(false);
      setEditingRecord(null);
      sampleForm.resetFields();
    } catch (error) {
      message.error('保存失败，请重试');
    } finally {
      setLoading(false);
    }
  };

  /**
   * 批量设置参数
   * @param values 表单值
   */
  const handleBatchParams = async (values: any) => {
    try {
      setLoading(true);
      // 模拟保存批次参数
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setBatchParams({
        ...values,
        startTime: values.startTime.format('YYYY-MM-DD HH:mm:ss'),
        estimatedEndTime: values.estimatedEndTime.format('YYYY-MM-DD HH:mm:ss'),
        components: batchParams?.components || [],
        program: batchParams?.program || []
      });

      message.success('批次参数设置成功');
      setBatchParamsModalVisible(false);
    } catch (error) {
      message.error('设置失败，请重试');
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
      setQuickRecordDrawerVisible(false);
      quickForm.resetFields();
    } catch (error) {
      message.error('记录失败，请重试');
    } finally {
      setLoading(false);
    }
  };

  /**
   * 数据验证
   * @param record 样本记录
   * @returns 验证结果
   */
  const validatePCRRecord = (record: SamplePCRRecord): { valid: boolean; errors: string[] } => {
    const errors: string[] = [];
    
    // Ct值验证
    if (record.ctValue && record.ctValue > 35) {
      errors.push('Ct值过高，可能存在扩增效率问题');
    }
    
    // 扩增效率验证
    if (record.amplificationEfficiency && record.amplificationEfficiency < 80) {
      errors.push('扩增效率过低，建议检查引物和反应条件');
    }
    
    // 熔解温度验证
    if (record.meltingTemperature && batchParams) {
      const expectedTm = 82.0; // 预期熔解温度
      if (Math.abs(record.meltingTemperature - expectedTm) > 2) {
        errors.push('熔解温度异常，可能存在非特异性扩增');
      }
    }
    
    // 产物大小验证
    if (record.productSize && batchParams) {
      const expectedSize = batchParams.expectedProductSize;
      if (Math.abs(record.productSize - expectedSize) > 50) {
        errors.push('产物大小异常，可能存在非特异性扩增');
      }
    }
    
    return {
      valid: errors.length === 0,
      errors
    };
  };

  // 样本记录表格列定义
  const sampleColumns: ColumnsType<SamplePCRRecord> = [
    {
      title: '样本编号',
      dataIndex: 'sampleCode',
      key: 'sampleCode',
      width: 100,
      fixed: 'left'
    },
    {
      title: '样本名称',
      dataIndex: 'sampleName',
      key: 'sampleName',
      width: 150
    },
    {
      title: '孔位',
      dataIndex: 'wellPosition',
      key: 'wellPosition',
      width: 80
    },
    {
      title: '模板体积(μL)',
      dataIndex: 'templateVolume',
      key: 'templateVolume',
      width: 100
    },
    {
      title: '模板浓度(ng/μL)',
      dataIndex: 'templateConcentration',
      key: 'templateConcentration',
      width: 120,
      render: (value: number) => value.toFixed(1)
    },
    {
      title: '扩增成功',
      dataIndex: 'amplificationSuccess',
      key: 'amplificationSuccess',
      width: 100,
      render: (success: boolean) => (
        <Tag color={success ? 'success' : 'error'}>
          {success ? '成功' : '失败'}
        </Tag>
      )
    },
    {
      title: 'Ct值',
      dataIndex: 'ctValue',
      key: 'ctValue',
      width: 80,
      render: (value?: number) => (
        value ? (
          <span style={{ color: value > 35 ? '#ff4d4f' : '#52c41a' }}>
            {value.toFixed(1)}
          </span>
        ) : '-'
      )
    },
    {
      title: '扩增效率(%)',
      dataIndex: 'amplificationEfficiency',
      key: 'amplificationEfficiency',
      width: 100,
      render: (value?: number) => (
        value ? (
          <span style={{ color: value < 80 ? '#ff4d4f' : '#52c41a' }}>
            {value.toFixed(1)}%
          </span>
        ) : '-'
      )
    },
    {
      title: '熔解温度(°C)',
      dataIndex: 'meltingTemperature',
      key: 'meltingTemperature',
      width: 100,
      render: (value?: number) => value ? value.toFixed(1) : '-'
    },
    {
      title: '产物大小(bp)',
      dataIndex: 'productSize',
      key: 'productSize',
      width: 100
    },
    {
      title: '条带强度',
      dataIndex: 'bandIntensity',
      key: 'bandIntensity',
      width: 100,
      render: (intensity?: string) => (
        <Tag color={getBandIntensityColor(intensity)}>
          {intensity === 'strong' ? '强' : 
           intensity === 'medium' ? '中' : 
           intensity === 'weak' ? '弱' : '无'}
        </Tag>
      )
    },
    {
      title: '质控状态',
      dataIndex: 'qcStatus',
      key: 'qcStatus',
      width: 100,
      render: (status: QCStatus) => (
        <Tag color={getQCStatusColor(status)}>
          {getQCStatusText(status)}
        </Tag>
      )
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
      width: 150,
      fixed: 'right',
      render: (_, record) => {
        const validation = validatePCRRecord(record);
        return (
          <Space>
            <Tooltip title={validation.valid ? '数据正常' : validation.errors.join('; ')}>
              <Button
                type="link"
                size="small"
                icon={validation.valid ? <CheckCircleOutlined /> : <ExclamationCircleOutlined />}
                style={{ color: validation.valid ? '#52c41a' : '#ff4d4f' }}
              />
            </Tooltip>
            <Button
              type="link"
              size="small"
              icon={<EyeOutlined />}
              onClick={() => handleEditRecord(record)}
            >
              查看
            </Button>
            <Button
              type="link"
              size="small"
              icon={<EditOutlined />}
              onClick={() => handleEditRecord(record)}
            >
              编辑
            </Button>
          </Space>
        );
      }
    }
  ];

  // PCR反应体系组分表格列定义
  const componentColumns: ColumnsType<PCRComponent> = [
    {
      title: '组分名称',
      dataIndex: 'name',
      key: 'name'
    },
    {
      title: '浓度',
      dataIndex: 'concentration',
      key: 'concentration'
    },
    {
      title: '体积(μL)',
      dataIndex: 'volume',
      key: 'volume'
    },
    {
      title: '终浓度',
      dataIndex: 'finalConcentration',
      key: 'finalConcentration'
    },
    {
      title: '批号',
      dataIndex: 'lot',
      key: 'lot'
    },
    {
      title: '操作',
      key: 'action',
      render: (_, record) => (
        <Space>
          <Button type="link" size="small" icon={<EditOutlined />}>编辑</Button>
          <Button type="link" size="small" icon={<DeleteOutlined />} danger>删除</Button>
        </Space>
      )
    }
  ];

  // PCR程序步骤表格列定义
  const programColumns: ColumnsType<PCRProgramStep> = [
    {
      title: '步骤',
      dataIndex: 'stepName',
      key: 'stepName'
    },
    {
      title: '温度(°C)',
      dataIndex: 'temperature',
      key: 'temperature'
    },
    {
      title: '时间',
      dataIndex: 'duration',
      key: 'duration'
    },
    {
      title: '循环数',
      dataIndex: 'cycles',
      key: 'cycles'
    },
    {
      title: '升温速率(°C/s)',
      dataIndex: 'rampRate',
      key: 'rampRate'
    },
    {
      title: '操作',
      key: 'action',
      render: (_, record) => (
        <Space>
          <Button type="link" size="small" icon={<EditOutlined />}>编辑</Button>
          <Button type="link" size="small" icon={<DeleteOutlined />} danger>删除</Button>
        </Space>
      )
    }
  ];

  return (
    <div style={{ padding: '24px' }}>
      {/* 页面标题 */}
      <Card style={{ marginBottom: 24 }}>
        <Row gutter={16} align="middle">
          <Col span={18}>
            <Title level={3} style={{ margin: 0 }}>
              <ThunderboltOutlined style={{ marginRight: 8 }} />
              PCR扩增步骤记录
            </Title>
            <Text type="secondary">
              🧬 详细记录PCR扩增过程中的反应体系、程序参数和结果数据
            </Text>
          </Col>
          <Col span={6} style={{ textAlign: 'right' }}>
            <Space>
              <Button 
                icon={<SyncOutlined />}
                onClick={() => setQuickRecordDrawerVisible(true)}
              >
                快速记录
              </Button>
              <Button 
                type="primary" 
                icon={<PlusOutlined />}
                onClick={() => handleEditRecord()}
              >
                新增记录
              </Button>
            </Space>
          </Col>
        </Row>
      </Card>

      {/* 统计信息 */}
      <Row gutter={16} style={{ marginBottom: 24 }}>
        <Col span={6}>
          <Card>
            <Statistic
              title="总样本数"
              value={sampleRecords.length}
              suffix="个"
              valueStyle={{ color: '#1890ff' }}
              prefix={<BarcodeOutlined />}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="扩增成功"
              value={sampleRecords.filter(r => r.amplificationSuccess).length}
              suffix="个"
              valueStyle={{ color: '#52c41a' }}
              prefix={<CheckCircleOutlined />}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="平均Ct值"
              value={sampleRecords.length > 0 ? 
                (sampleRecords
                  .filter(r => r.ctValue)
                  .reduce((sum, r) => sum + (r.ctValue || 0), 0) / 
                 sampleRecords.filter(r => r.ctValue).length
                ).toFixed(1) : 0
              }
              valueStyle={{ color: '#722ed1' }}
              prefix={<ExperimentOutlined />}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="平均扩增效率"
              value={sampleRecords.length > 0 ? 
                (sampleRecords
                  .filter(r => r.amplificationEfficiency)
                  .reduce((sum, r) => sum + (r.amplificationEfficiency || 0), 0) / 
                 sampleRecords.filter(r => r.amplificationEfficiency).length
                ).toFixed(1) : 0
              }
              suffix="%"
              valueStyle={{ color: '#fa8c16' }}
              prefix={<FireOutlined />}
            />
          </Card>
        </Col>
      </Row>

      {/* 主要内容区域 */}
      <Card>
        <Tabs activeKey={activeTab} onChange={setActiveTab}>
          <TabPane tab="基本信息" key="basic">
            <Row gutter={16}>
              <Col span={16}>
                {/* 批次参数 */}
                <Card 
                  title="批次PCR参数" 
                  size="small"
                  extra={
                    <Button 
                      type="link" 
                      icon={<SettingOutlined />}
                      onClick={() => setBatchParamsModalVisible(true)}
                    >
                      设置参数
                    </Button>
                  }
                >
                  {batchParams && (
                    <Row gutter={16}>
                      <Col span={12}>
                        <div style={{ marginBottom: 8 }}>
                          <Text strong>PCR类型：</Text>
                          <Tag color="blue">{getPCRTypeText(batchParams.pcrType)}</Tag>
                        </div>
                        <div style={{ marginBottom: 8 }}>
                          <Text strong>目标基因：</Text>
                          <Text>{batchParams.targetGene}</Text>
                        </div>
                        <div style={{ marginBottom: 8 }}>
                          <Text strong>引物对：</Text>
                          <Text>{batchParams.primerPair}</Text>
                        </div>
                        <div style={{ marginBottom: 8 }}>
                          <Text strong>正向引物：</Text>
                          <Text>{batchParams.forwardPrimer}</Text>
                        </div>
                        <div style={{ marginBottom: 8 }}>
                          <Text strong>反向引物：</Text>
                          <Text>{batchParams.reversePrimer}</Text>
                        </div>
                      </Col>
                      <Col span={12}>
                        <div style={{ marginBottom: 8 }}>
                          <Text strong>预期产物大小：</Text>
                          <Text>{batchParams.expectedProductSize} bp</Text>
                        </div>
                        <div style={{ marginBottom: 8 }}>
                          <Text strong>反应体积：</Text>
                          <Text>{batchParams.reactionVolume} μL</Text>
                        </div>
                        <div style={{ marginBottom: 8 }}>
                          <Text strong>PCR仪：</Text>
                          <Text>{batchParams.equipment}</Text>
                        </div>
                        <div style={{ marginBottom: 8 }}>
                          <Text strong>板型：</Text>
                          <Text>{batchParams.plateType}</Text>
                        </div>
                        <div style={{ marginBottom: 8 }}>
                          <Text strong>操作员：</Text>
                          <Text>{batchParams.operator}</Text>
                        </div>
                      </Col>
                    </Row>
                  )}
                </Card>
              </Col>
              <Col span={8}>
                {/* 引物信息 */}
                <Card title="引物信息" size="small">
                  <List
                    size="small"
                    dataSource={primerInfo}
                    renderItem={primer => (
                      <List.Item>
                        <List.Item.Meta
                          avatar={
                            <Avatar style={{ 
                              backgroundColor: primer.type === 'forward' ? '#52c41a' : '#1890ff' 
                            }}>
                              {primer.type === 'forward' ? 'F' : 'R'}
                            </Avatar>
                          }
                          title={primer.name}
                          description={
                            <div>
                              <div>长度: {primer.length} bp</div>
                              <div>Tm: {primer.tm}°C</div>
                              <div>GC: {primer.gc}%</div>
                            </div>
                          }
                        />
                      </List.Item>
                    )}
                  />
                </Card>

                {/* 环境条件 */}
                <Card title="环境条件" size="small" style={{ marginTop: 16 }}>
                  {batchParams?.environmentalConditions && (
                    <div>
                      <div style={{ marginBottom: 8 }}>
                        <Text strong>温度：</Text>
                        <Text>{batchParams.environmentalConditions.temperature}°C</Text>
                      </div>
                      <div style={{ marginBottom: 8 }}>
                        <Text strong>湿度：</Text>
                        <Text>{batchParams.environmentalConditions.humidity}%</Text>
                      </div>
                      {batchParams.environmentalConditions.pressure && (
                        <div style={{ marginBottom: 8 }}>
                          <Text strong>气压：</Text>
                          <Text>{batchParams.environmentalConditions.pressure}hPa</Text>
                        </div>
                      )}
                    </div>
                  )}
                </Card>
              </Col>
            </Row>
          </TabPane>

          <TabPane tab="反应体系" key="reaction">
            <Space direction="vertical" style={{ width: '100%' }}>
              <Row gutter={16}>
                <Col span={18}>
                  <Space>
                    <Button 
                      type="primary" 
                      icon={<PlusOutlined />}
                      onClick={() => setComponentModalVisible(true)}
                    >
                      添加组分
                    </Button>
                    <Button icon={<UploadOutlined />}>导入配方</Button>
                    <Button icon={<DownloadOutlined />}>导出配方</Button>
                  </Space>
                </Col>
                <Col span={6} style={{ textAlign: 'right' }}>
                  <Text strong>
                    总体积: {batchParams?.reactionVolume || 0} μL
                  </Text>
                </Col>
              </Row>

              {/* 反应体系组分表格 */}
              <Table
                size="small"
                dataSource={batchParams?.components || []}
                columns={componentColumns}
                rowKey="id"
                pagination={false}
              />

              {/* 反应体系总结 */}
              <Card title="反应体系总结" size="small">
                <Row gutter={16}>
                  <Col span={12}>
                    <Text strong>主要组分：</Text>
                    <ul>
                      {batchParams?.components.map(comp => (
                        <li key={comp.id}>
                          {comp.name}: {comp.volume} μL ({comp.finalConcentration || comp.concentration})
                        </li>
                      ))}
                    </ul>
                  </Col>
                  <Col span={12}>
                    <Text strong>质量控制：</Text>
                    <ul>
                      <li>阳性对照: 已知阳性样本</li>
                      <li>阴性对照: ddH2O</li>
                      <li>空白对照: 无模板对照</li>
                    </ul>
                  </Col>
                </Row>
              </Card>
            </Space>
          </TabPane>

          <TabPane tab="PCR程序" key="program">
            <Space direction="vertical" style={{ width: '100%' }}>
              <Row gutter={16}>
                <Col span={18}>
                  <Space>
                    <Button 
                      type="primary" 
                      icon={<PlusOutlined />}
                      onClick={() => setProgramModalVisible(true)}
                    >
                      添加步骤
                    </Button>
                    <Button icon={<UploadOutlined />}>导入程序</Button>
                    <Button icon={<DownloadOutlined />}>导出程序</Button>
                  </Space>
                </Col>
                <Col span={6} style={{ textAlign: 'right' }}>
                  <Text strong>
                    预计时间: {batchParams ? '3小时30分钟' : '-'}
                  </Text>
                </Col>
              </Row>

              {/* PCR程序步骤表格 */}
              <Table
                size="small"
                dataSource={batchParams?.program || []}
                columns={programColumns}
                rowKey="id"
                pagination={false}
              />

              {/* 程序可视化 */}
              <Card title="程序可视化" size="small">
                <div style={{ height: 200, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Text type="secondary">PCR程序温度曲线图</Text>
                </div>
              </Card>
            </Space>
          </TabPane>

          <TabPane tab="样本记录" key="samples">
            <Space direction="vertical" style={{ width: '100%' }}>
              <Row gutter={16}>
                <Col span={18}>
                  <Space>
                    <Button 
                      type="primary" 
                      icon={<PlusOutlined />}
                      onClick={() => handleEditRecord()}
                    >
                      新增记录
                    </Button>
                    <Button 
                      icon={<ControlOutlined />}
                      onClick={() => setSampleAllocationVisible(true)}
                    >
                      样本分配
                    </Button>
                    <Button icon={<UploadOutlined />}>导入数据</Button>
                    <Button icon={<DownloadOutlined />}>导出数据</Button>
                    <Button icon={<PrinterOutlined />}>打印报告</Button>
                  </Space>
                </Col>
                <Col span={6} style={{ textAlign: 'right' }}>
                  <Select
                    placeholder="筛选状态"
                    style={{ width: 120 }}
                    allowClear
                  >
                    <Option value="pass">通过</Option>
                    <Option value="warning">警告</Option>
                    <Option value="fail">失败</Option>
                    <Option value="pending">待检</Option>
                  </Select>
                </Col>
              </Row>

              {/* 样本记录表格 */}
              <Table
                size="small"
                dataSource={sampleRecords}
                columns={sampleColumns}
                rowKey="id"
                scroll={{ x: 1600 }}
                pagination={{
                  pageSize: 10,
                  showSizeChanger: true,
                  showQuickJumper: true,
                  showTotal: (total) => `共 ${total} 条记录`
                }}
                rowSelection={{
                  selectedRowKeys: selectedSamples,
                  onChange: setSelectedSamples
                }}
              />
            </Space>
          </TabPane>

          <TabPane tab="质量控制" key="qc">
            <Row gutter={16}>
              <Col span={12}>
                <Card title="扩增统计" size="small">
                  <Row gutter={16}>
                    <Col span={6}>
                      <Statistic
                        title="成功率"
                        value={sampleRecords.length > 0 ? 
                          ((sampleRecords.filter(r => r.amplificationSuccess).length / sampleRecords.length) * 100).toFixed(1) : 0
                        }
                        suffix="%"
                        valueStyle={{ color: '#52c41a' }}
                      />
                    </Col>
                    <Col span={6}>
                      <Statistic
                        title="强条带"
                        value={sampleRecords.filter(r => r.bandIntensity === 'strong').length}
                        valueStyle={{ color: '#52c41a' }}
                      />
                    </Col>
                    <Col span={6}>
                      <Statistic
                        title="中等条带"
                        value={sampleRecords.filter(r => r.bandIntensity === 'medium').length}
                        valueStyle={{ color: '#faad14' }}
                      />
                    </Col>
                    <Col span={6}>
                      <Statistic
                        title="弱条带"
                        value={sampleRecords.filter(r => r.bandIntensity === 'weak').length}
                        valueStyle={{ color: '#ff7a45' }}
                      />
                    </Col>
                  </Row>
                </Card>
              </Col>
              <Col span={12}>
                <Card title="质控趋势" size="small">
                  <div style={{ height: 200, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Text type="secondary">扩增效率趋势图表</Text>
                  </div>
                </Card>
              </Col>
            </Row>

            <Card title="质控详情" size="small" style={{ marginTop: 16 }}>
              <Collapse>
                <Panel header="扩增效率质控" key="efficiency">
                  <Alert
                    message="扩增效率质控标准"
                    description="PCR扩增效率应在80-110%范围内，低于80%需要检查引物设计和反应条件"
                    type="info"
                    showIcon
                    style={{ marginBottom: 16 }}
                  />
                  <List
                    size="small"
                    dataSource={sampleRecords.filter(r => 
                      r.amplificationEfficiency && r.amplificationEfficiency < 80
                    )}
                    renderItem={record => (
                      <List.Item>
                        <List.Item.Meta
                          avatar={<Avatar style={{ backgroundColor: '#ff4d4f' }}>{record.sampleCode}</Avatar>}
                          title={`${record.sampleName} - ${record.amplificationEfficiency?.toFixed(1)}%`}
                          description="扩增效率过低"
                        />
                        <Tag color="error">异常</Tag>
                      </List.Item>
                    )}
                  />
                </Panel>
                <Panel header="特异性质控" key="specificity">
                  <Alert
                    message="特异性质控标准"
                    description="熔解温度应在预期范围内(±2°C)，产物大小应与预期一致(±50bp)"
                    type="info"
                    showIcon
                    style={{ marginBottom: 16 }}
                  />
                  <List
                    size="small"
                    dataSource={sampleRecords.filter(r => {
                      const expectedTm = 82.0;
                      const expectedSize = batchParams?.expectedProductSize || 0;
                      return (r.meltingTemperature && Math.abs(r.meltingTemperature - expectedTm) > 2) ||
                             (r.productSize && Math.abs(r.productSize - expectedSize) > 50);
                    })}
                    renderItem={record => (
                      <List.Item>
                        <List.Item.Meta
                          avatar={<Avatar style={{ backgroundColor: '#faad14' }}>{record.sampleCode}</Avatar>}
                          title={`${record.sampleName}`}
                          description={
                            <div>
                              <div>熔解温度: {record.meltingTemperature?.toFixed(1)}°C</div>
                              <div>产物大小: {record.productSize} bp</div>
                            </div>
                          }
                        />
                        <Tag color="warning">特异性异常</Tag>
                      </List.Item>
                    )}
                  />
                </Panel>
              </Collapse>
            </Card>
          </TabPane>
        </Tabs>
      </Card>

      {/* 样本记录模态框 */}
      <Modal
        title={editingRecord ? '编辑PCR记录' : '新增PCR记录'}
        open={recordModalVisible}
        onCancel={() => {
          setRecordModalVisible(false);
          setEditingRecord(null);
          sampleForm.resetFields();
        }}
        onOk={() => sampleForm.submit()}
        confirmLoading={loading}
        width={800}
      >
        <Form
          form={sampleForm}
          layout="vertical"
          onFinish={handleSaveRecord}
        >
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="sampleCode"
                label="样本编号"
                rules={[{ required: true, message: '请输入样本编号' }]}
              >
                <Input placeholder="请输入样本编号" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="sampleName"
                label="样本名称"
                rules={[{ required: true, message: '请输入样本名称' }]}
              >
                <Input placeholder="请输入样本名称" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={8}>
              <Form.Item
                name="wellPosition"
                label="孔位"
                rules={[{ required: true, message: '请输入孔位' }]}
              >
                <Input placeholder="如：A1" />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                name="templateVolume"
                label="模板体积(μL)"
                rules={[{ required: true, message: '请输入模板体积' }]}
              >
                <InputNumber
                  placeholder="请输入模板体积"
                  min={0}
                  precision={1}
                  style={{ width: '100%' }}
                />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                name="templateConcentration"
                label="模板浓度(ng/μL)"
                rules={[{ required: true, message: '请输入模板浓度' }]}
              >
                <InputNumber
                  placeholder="请输入模板浓度"
                  min={0}
                  precision={1}
                  style={{ width: '100%' }}
                />
              </Form.Item>
            </Col>
          </Row>

          <Divider>PCR结果</Divider>

          <Row gutter={16}>
            <Col span={8}>
              <Form.Item
                name="amplificationSuccess"
                label="扩增成功"
                rules={[{ required: true, message: '请选择扩增结果' }]}
              >
                <Radio.Group>
                  <Radio value={true}>成功</Radio>
                  <Radio value={false}>失败</Radio>
                </Radio.Group>
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="ctValue" label="Ct值">
                <InputNumber
                  placeholder="请输入Ct值"
                  min={0}
                  max={50}
                  precision={1}
                  style={{ width: '100%' }}
                />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="amplificationEfficiency" label="扩增效率(%)">
                <InputNumber
                  placeholder="请输入扩增效率"
                  min={0}
                  max={200}
                  precision={1}
                  style={{ width: '100%' }}
                />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={8}>
              <Form.Item name="meltingTemperature" label="熔解温度(°C)">
                <InputNumber
                  placeholder="请输入熔解温度"
                  min={0}
                  max={100}
                  precision={1}
                  style={{ width: '100%' }}
                />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="productSize" label="产物大小(bp)">
                <InputNumber
                  placeholder="请输入产物大小"
                  min={0}
                  style={{ width: '100%' }}
                />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="bandIntensity" label="条带强度">
                <Select placeholder="请选择条带强度">
                  <Option value="strong">强</Option>
                  <Option value="medium">中</Option>
                  <Option value="weak">弱</Option>
                  <Option value="none">无</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="qcStatus"
                label="质控状态"
                rules={[{ required: true, message: '请选择质控状态' }]}
              >
                <Select placeholder="请选择质控状态">
                  <Option value="pass">通过</Option>
                  <Option value="warning">警告</Option>
                  <Option value="fail">失败</Option>
                  <Option value="pending">待检</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="operator"
                label="操作员"
                rules={[{ required: true, message: '请输入操作员' }]}
              >
                <Input placeholder="请输入操作员" />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item name="notes" label="备注">
            <TextArea rows={3} placeholder="请输入备注信息" />
          </Form.Item>
        </Form>
      </Modal>

      {/* 批次参数设置模态框 */}
      <Modal
        title="批次PCR参数设置"
        open={batchParamsModalVisible}
        onCancel={() => setBatchParamsModalVisible(false)}
        onOk={() => batchForm.submit()}
        confirmLoading={loading}
        width={800}
      >
        <Form
          form={batchForm}
          layout="vertical"
          onFinish={handleBatchParams}
          initialValues={batchParams}
        >
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="pcrType"
                label="PCR类型"
                rules={[{ required: true, message: '请选择PCR类型' }]}
              >
                <Select placeholder="请选择PCR类型">
                  <Option value="standard">标准PCR</Option>
                  <Option value="nested">巢式PCR</Option>
                  <Option value="multiplex">多重PCR</Option>
                  <Option value="qpcr">实时定量PCR</Option>
                  <Option value="rt_pcr">逆转录PCR</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="targetGene"
                label="目标基因"
                rules={[{ required: true, message: '请输入目标基因' }]}
              >
                <Input placeholder="请输入目标基因" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={8}>
              <Form.Item
                name="forwardPrimer"
                label="正向引物"
                rules={[{ required: true, message: '请输入正向引物' }]}
              >
                <Input placeholder="请输入正向引物" />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                name="reversePrimer"
                label="反向引物"
                rules={[{ required: true, message: '请输入反向引物' }]}
              >
                <Input placeholder="请输入反向引物" />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                name="expectedProductSize"
                label="预期产物大小(bp)"
                rules={[{ required: true, message: '请输入预期产物大小' }]}
              >
                <InputNumber
                  placeholder="请输入预期产物大小"
                  min={50}
                  max={10000}
                  style={{ width: '100%' }}
                />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="equipment"
                label="PCR仪"
                rules={[{ required: true, message: '请输入PCR仪' }]}
              >
                <Input placeholder="请输入PCR仪" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="operator"
                label="操作员"
                rules={[{ required: true, message: '请输入操作员' }]}
              >
                <Input placeholder="请输入操作员" />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item name="notes" label="备注">
            <TextArea rows={3} placeholder="请输入备注信息" />
          </Form.Item>
        </Form>
      </Modal>

      {/* 快速记录抽屉 */}
      <Drawer
        title="快速记录"
        placement="right"
        width={400}
        open={quickRecordDrawerVisible}
        onClose={() => setQuickRecordDrawerVisible(false)}
      >
        <Form
          form={quickForm}
          layout="vertical"
          onFinish={handleQuickRecord}
        >
          <Form.Item
            name="sampleCode"
            label="样本编号"
            rules={[{ required: true, message: '请输入样本编号' }]}
          >
            <Input placeholder="扫描或输入样本编号" />
          </Form.Item>

          <Form.Item
            name="wellPosition"
            label="孔位"
            rules={[{ required: true, message: '请输入孔位' }]}
          >
            <Input placeholder="如：A1" />
          </Form.Item>

          <Form.Item name="ctValue" label="Ct值">
            <InputNumber
              placeholder="请输入Ct值"
              min={0}
              max={50}
              precision={1}
              style={{ width: '100%' }}
            />
          </Form.Item>

          <Form.Item name="bandIntensity" label="条带强度">
            <Select placeholder="请选择条带强度">
              <Option value="strong">强</Option>
              <Option value="medium">中</Option>
              <Option value="weak">弱</Option>
              <Option value="none">无</Option>
            </Select>
          </Form.Item>

          <Form.Item name="notes" label="备注">
            <TextArea rows={2} placeholder="请输入备注信息" />
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit" loading={loading} block>
              保存记录
            </Button>
          </Form.Item>
        </Form>
      </Drawer>
    </div>
  );
};

export default PCRAmplificationRecord;