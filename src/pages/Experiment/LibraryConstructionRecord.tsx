/**
 * 文库构建步骤记录界面组件
 * 
 * 功能说明：
 * - 提供文库构建步骤的详细数据记录功能
 * - 包含基本信息、文库构建参数、文库质量检测、试剂记录等
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
  Transfer,
  Slider
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
  ControlOutlined,
  BuildOutlined,
  FundOutlined,
  LineChartOutlined,
  BarChartOutlined,
  DashboardOutlined,
  SafetyOutlined,
  ToolOutlined,
  DatabaseOutlined
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
 * 文库构建类型枚举
 */
type LibraryType = 'illumina' | 'nanopore' | 'pacbio' | 'ion_torrent' | 'custom';

/**
 * 文库构建方法枚举
 */
type ConstructionMethod = 'tagmentation' | 'fragmentation' | 'pcr_free' | 'amplicon' | 'targeted';

/**
 * 质控状态枚举
 */
type QCStatus = 'pass' | 'warning' | 'fail' | 'pending';

/**
 * 试剂类型枚举
 */
type ReagentType = 'enzyme' | 'buffer' | 'adapter' | 'primer' | 'bead' | 'dye' | 'other';

/**
 * 文库构建试剂接口定义
 */
interface LibraryReagent {
  id: string;
  name: string;
  type: ReagentType;
  catalog: string;
  lot: string;
  concentration: string;
  volume: number;
  supplier: string;
  expiryDate: string;
  storageCondition: string;
  notes?: string;
}

/**
 * 文库构建参数接口定义
 */
interface LibraryConstructionParams {
  id: string;
  libraryType: LibraryType;
  constructionMethod: ConstructionMethod;
  kitName: string;
  kitVersion: string;
  protocol: string;
  // 片段化参数
  fragmentationMethod?: 'enzymatic' | 'physical' | 'sonication';
  targetFragmentSize: number;
  fragmentationTime?: number;
  fragmentationTemperature?: number;
  // 接头连接参数
  adapterType: string;
  adapterConcentration: string;
  ligationTime: number;
  ligationTemperature: number;
  // PCR扩增参数
  pcrCycles?: number;
  pcrPrimer?: string;
  pcrPolymerase?: string;
  // 纯化参数
  purificationMethod: 'beads' | 'column' | 'gel';
  beadRatio?: number;
  elutionVolume: number;
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
 * 样本文库记录接口定义
 */
interface SampleLibraryRecord {
  id: string;
  sampleId: string;
  sampleCode: string;
  sampleName: string;
  // 输入参数
  inputDNAAmount: number;
  inputDNAConcentration: number;
  inputDNAVolume: number;
  inputDNAQuality: number; // A260/A280
  // 文库构建结果
  libraryConcentration: number;
  libraryVolume: number;
  libraryYield: number;
  fragmentSizeDistribution: {
    mean: number;
    median: number;
    mode: number;
    range: string;
  };
  // 质量检测
  qcMethod: 'qubit' | 'nanodrop' | 'bioanalyzer' | 'tapestation';
  qcConcentration: number;
  qcVolume: number;
  qcMolarity?: number;
  peakSize?: number;
  dnaIntegrity?: number;
  adapterDimerPercent?: number;
  // 质控状态
  qcStatus: QCStatus;
  qcNotes?: string;
  qcImage?: string;
  // 记录信息
  operator: string;
  recordTime: string;
  verified: boolean;
  notes?: string;
}

/**
 * 文库质量指标接口定义
 */
interface LibraryQualityMetrics {
  concentration: {
    value: number;
    unit: string;
    method: string;
    acceptable: boolean;
  };
  fragmentSize: {
    mean: number;
    distribution: string;
    acceptable: boolean;
  };
  yield: {
    value: number;
    unit: string;
    efficiency: number;
    acceptable: boolean;
  };
  purity: {
    ratio260_280: number;
    ratio260_230: number;
    acceptable: boolean;
  };
  adapterDimer: {
    percentage: number;
    acceptable: boolean;
  };
}

/**
 * 文库构建步骤记录组件
 * 
 * @returns {JSX.Element} 文库构建记录界面
 */
const LibraryConstructionRecord: React.FC = () => {
  // 状态管理
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('basic');
  const [sampleRecords, setSampleRecords] = useState<SampleLibraryRecord[]>([]);
  const [constructionParams, setConstructionParams] = useState<LibraryConstructionParams | null>(null);
  const [reagents, setReagents] = useState<LibraryReagent[]>([]);
  const [selectedSamples, setSelectedSamples] = useState<string[]>([]);
  const [editingRecord, setEditingRecord] = useState<SampleLibraryRecord | null>(null);
  const [recordModalVisible, setRecordModalVisible] = useState(false);
  const [paramsModalVisible, setParamsModalVisible] = useState(false);
  const [reagentModalVisible, setReagentModalVisible] = useState(false);
  const [qualityModalVisible, setQualityModalVisible] = useState(false);
  const [quickRecordDrawerVisible, setQuickRecordDrawerVisible] = useState(false);
  const [batchProcessVisible, setBatchProcessVisible] = useState(false);
  
  // 表单实例
  const [basicForm] = Form.useForm();
  const [sampleForm] = Form.useForm();
  const [paramsForm] = Form.useForm();
  const [reagentForm] = Form.useForm();
  const [qualityForm] = Form.useForm();
  const [quickForm] = Form.useForm();

  // 模拟数据
  const mockSampleRecords: SampleLibraryRecord[] = [
    {
      id: 'lib_record_001',
      sampleId: 'sample_001',
      sampleCode: 'S001',
      sampleName: '土壤样本-1',
      inputDNAAmount: 1000,
      inputDNAConcentration: 50.2,
      inputDNAVolume: 20,
      inputDNAQuality: 1.85,
      libraryConcentration: 15.6,
      libraryVolume: 50,
      libraryYield: 780,
      fragmentSizeDistribution: {
        mean: 420,
        median: 415,
        mode: 410,
        range: '200-800'
      },
      qcMethod: 'bioanalyzer',
      qcConcentration: 15.6,
      qcVolume: 50,
      qcMolarity: 45.2,
      peakSize: 420,
      dnaIntegrity: 8.5,
      adapterDimerPercent: 2.1,
      qcStatus: 'pass',
      operator: '李实验员',
      recordTime: '2024-01-16 16:30:00',
      verified: true,
      notes: '文库构建成功，质量良好'
    },
    {
      id: 'lib_record_002',
      sampleId: 'sample_002',
      sampleCode: 'S002',
      sampleName: '水样-1',
      inputDNAAmount: 800,
      inputDNAConcentration: 40.1,
      inputDNAVolume: 20,
      inputDNAQuality: 1.92,
      libraryConcentration: 12.3,
      libraryVolume: 50,
      libraryYield: 615,
      fragmentSizeDistribution: {
        mean: 380,
        median: 375,
        mode: 370,
        range: '180-750'
      },
      qcMethod: 'bioanalyzer',
      qcConcentration: 12.3,
      qcVolume: 50,
      qcMolarity: 35.8,
      peakSize: 380,
      dnaIntegrity: 7.8,
      adapterDimerPercent: 3.2,
      qcStatus: 'warning',
      qcNotes: '接头二聚体略高',
      operator: '李实验员',
      recordTime: '2024-01-16 16:30:00',
      verified: true,
      notes: '文库构建成功，需注意接头二聚体'
    }
  ];

  const mockConstructionParams: LibraryConstructionParams = {
    id: 'lib_params_001',
    libraryType: 'illumina',
    constructionMethod: 'tagmentation',
    kitName: 'Nextera XT DNA Library Prep Kit',
    kitVersion: 'v3',
    protocol: 'Illumina Nextera XT Protocol',
    fragmentationMethod: 'enzymatic',
    targetFragmentSize: 400,
    fragmentationTime: 5,
    fragmentationTemperature: 55,
    adapterType: 'Nextera XT Index Kit',
    adapterConcentration: '2.5 μM',
    ligationTime: 5,
    ligationTemperature: 55,
    pcrCycles: 12,
    pcrPrimer: 'Nextera PCR Primer Cocktail',
    pcrPolymerase: 'Nextera PCR Master Mix',
    purificationMethod: 'beads',
    beadRatio: 0.9,
    elutionVolume: 50,
    environmentalConditions: {
      temperature: 22,
      humidity: 45,
      pressure: 1013
    },
    operator: '李实验员',
    startTime: '2024-01-16 14:00:00',
    estimatedEndTime: '2024-01-16 18:00:00',
    notes: '标准Illumina文库构建流程'
  };

  const mockReagents: LibraryReagent[] = [
    {
      id: 'reagent_001',
      name: 'Tagment DNA Buffer',
      type: 'buffer',
      catalog: '15027866',
      lot: 'LOT20240110',
      concentration: '5×',
      volume: 10,
      supplier: 'Illumina',
      expiryDate: '2024-12-31',
      storageCondition: '-20°C'
    },
    {
      id: 'reagent_002',
      name: 'Amplicon Tagment Mix',
      type: 'enzyme',
      catalog: '15027865',
      lot: 'LOT20240108',
      concentration: '1×',
      volume: 5,
      supplier: 'Illumina',
      expiryDate: '2024-12-31',
      storageCondition: '-20°C'
    },
    {
      id: 'reagent_003',
      name: 'Nextera PCR Master Mix',
      type: 'enzyme',
      catalog: '15028267',
      lot: 'LOT20240105',
      concentration: '2×',
      volume: 15,
      supplier: 'Illumina',
      expiryDate: '2024-12-31',
      storageCondition: '-20°C'
    },
    {
      id: 'reagent_004',
      name: 'AMPure XP Beads',
      type: 'bead',
      catalog: 'A63881',
      lot: 'LOT20240112',
      concentration: '1×',
      volume: 100,
      supplier: 'Beckman Coulter',
      expiryDate: '2025-06-30',
      storageCondition: '4°C'
    }
  ];

  useEffect(() => {
    // 模拟加载数据
    setLoading(true);
    setTimeout(() => {
      setSampleRecords(mockSampleRecords);
      setConstructionParams(mockConstructionParams);
      setReagents(mockReagents);
      setLoading(false);
    }, 1000);
  }, []);

  /**
   * 获取文库类型文本
   * @param type 文库类型
   * @returns 类型文本
   */
  const getLibraryTypeText = (type: LibraryType): string => {
    const typeMap = {
      illumina: 'Illumina',
      nanopore: 'Oxford Nanopore',
      pacbio: 'PacBio',
      ion_torrent: 'Ion Torrent',
      custom: '自定义'
    };
    return typeMap[type] || type;
  };

  /**
   * 获取构建方法文本
   * @param method 构建方法
   * @returns 方法文本
   */
  const getConstructionMethodText = (method: ConstructionMethod): string => {
    const methodMap = {
      tagmentation: '转座酶片段化',
      fragmentation: '物理片段化',
      pcr_free: 'PCR-free',
      amplicon: '扩增子',
      targeted: '靶向捕获'
    };
    return methodMap[method] || method;
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
   * 获取试剂类型颜色
   * @param type 试剂类型
   * @returns 颜色
   */
  const getReagentTypeColor = (type: ReagentType): string => {
    const colorMap = {
      enzyme: '#52c41a',
      buffer: '#1890ff',
      adapter: '#722ed1',
      primer: '#fa8c16',
      bead: '#13c2c2',
      dye: '#eb2f96',
      other: '#666666'
    };
    return colorMap[type] || '#666666';
  };

  /**
   * 处理样本记录编辑
   * @param record 样本记录
   */
  const handleEditRecord = (record?: SampleLibraryRecord) => {
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
      
      const newRecord: SampleLibraryRecord = {
        ...values,
        id: editingRecord?.id || `lib_record_${Date.now()}`,
        recordTime: values.recordTime.format('YYYY-MM-DD HH:mm:ss'),
        verified: false,
        fragmentSizeDistribution: {
          mean: values.fragmentSizeMean || 0,
          median: values.fragmentSizeMedian || 0,
          mode: values.fragmentSizeMode || 0,
          range: values.fragmentSizeRange || ''
        }
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
  const handleSetParams = async (values: any) => {
    try {
      setLoading(true);
      // 模拟保存构建参数
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setConstructionParams({
        ...values,
        startTime: values.startTime.format('YYYY-MM-DD HH:mm:ss'),
        estimatedEndTime: values.estimatedEndTime.format('YYYY-MM-DD HH:mm:ss'),
        environmentalConditions: {
          temperature: values.temperature || 22,
          humidity: values.humidity || 45,
          pressure: values.pressure
        }
      });

      message.success('构建参数设置成功');
      setParamsModalVisible(false);
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
  const validateLibraryRecord = (record: SampleLibraryRecord): { valid: boolean; errors: string[] } => {
    const errors: string[] = [];
    
    // 文库浓度验证
    if (record.libraryConcentration < 2) {
      errors.push('文库浓度过低，可能影响测序质量');
    }
    
    // 文库产量验证
    const expectedYield = record.inputDNAAmount * 0.7; // 预期70%产量
    if (record.libraryYield < expectedYield * 0.5) {
      errors.push('文库产量过低，建议检查构建流程');
    }
    
    // 片段大小验证
    if (constructionParams) {
      const targetSize = constructionParams.targetFragmentSize;
      const actualSize = record.fragmentSizeDistribution.mean;
      if (Math.abs(actualSize - targetSize) > targetSize * 0.3) {
        errors.push('片段大小偏离目标值过多');
      }
    }
    
    // 接头二聚体验证
    if (record.adapterDimerPercent && record.adapterDimerPercent > 5) {
      errors.push('接头二聚体含量过高，可能影响测序质量');
    }
    
    // DNA完整性验证
    if (record.dnaIntegrity && record.dnaIntegrity < 7) {
      errors.push('DNA完整性较低，建议重新构建');
    }
    
    return {
      valid: errors.length === 0,
      errors
    };
  };

  /**
   * 计算文库质量指标
   * @param record 样本记录
   * @returns 质量指标
   */
  const calculateQualityMetrics = (record: SampleLibraryRecord): LibraryQualityMetrics => {
    return {
      concentration: {
        value: record.libraryConcentration,
        unit: 'ng/μL',
        method: record.qcMethod,
        acceptable: record.libraryConcentration >= 2
      },
      fragmentSize: {
        mean: record.fragmentSizeDistribution.mean,
        distribution: record.fragmentSizeDistribution.range,
        acceptable: constructionParams ? 
          Math.abs(record.fragmentSizeDistribution.mean - constructionParams.targetFragmentSize) <= constructionParams.targetFragmentSize * 0.3 : 
          true
      },
      yield: {
        value: record.libraryYield,
        unit: 'ng',
        efficiency: (record.libraryYield / record.inputDNAAmount) * 100,
        acceptable: record.libraryYield >= record.inputDNAAmount * 0.35
      },
      purity: {
        ratio260_280: record.inputDNAQuality,
        ratio260_230: record.inputDNAQuality * 1.1, // 模拟值
        acceptable: record.inputDNAQuality >= 1.8 && record.inputDNAQuality <= 2.2
      },
      adapterDimer: {
        percentage: record.adapterDimerPercent || 0,
        acceptable: (record.adapterDimerPercent || 0) <= 5
      }
    };
  };

  // 样本记录表格列定义
  const sampleColumns: ColumnsType<SampleLibraryRecord> = [
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
      title: '输入DNA(ng)',
      dataIndex: 'inputDNAAmount',
      key: 'inputDNAAmount',
      width: 100
    },
    {
      title: '输入浓度(ng/μL)',
      dataIndex: 'inputDNAConcentration',
      key: 'inputDNAConcentration',
      width: 120,
      render: (value: number) => value.toFixed(1)
    },
    {
      title: '文库浓度(ng/μL)',
      dataIndex: 'libraryConcentration',
      key: 'libraryConcentration',
      width: 120,
      render: (value: number) => (
        <span style={{ color: value < 2 ? '#ff4d4f' : '#52c41a' }}>
          {value.toFixed(1)}
        </span>
      )
    },
    {
      title: '文库产量(ng)',
      dataIndex: 'libraryYield',
      key: 'libraryYield',
      width: 100
    },
    {
      title: '平均片段大小(bp)',
      dataIndex: ['fragmentSizeDistribution', 'mean'],
      key: 'fragmentSize',
      width: 120
    },
    {
      title: '摩尔浓度(nM)',
      dataIndex: 'qcMolarity',
      key: 'qcMolarity',
      width: 100,
      render: (value?: number) => value ? value.toFixed(1) : '-'
    },
    {
      title: 'DNA完整性',
      dataIndex: 'dnaIntegrity',
      key: 'dnaIntegrity',
      width: 100,
      render: (value?: number) => (
        value ? (
          <span style={{ color: value < 7 ? '#ff4d4f' : '#52c41a' }}>
            {value.toFixed(1)}
          </span>
        ) : '-'
      )
    },
    {
      title: '接头二聚体(%)',
      dataIndex: 'adapterDimerPercent',
      key: 'adapterDimerPercent',
      width: 120,
      render: (value?: number) => (
        value ? (
          <span style={{ color: value > 5 ? '#ff4d4f' : '#52c41a' }}>
            {value.toFixed(1)}%
          </span>
        ) : '-'
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
        const validation = validateLibraryRecord(record);
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

  // 试剂表格列定义
  const reagentColumns: ColumnsType<LibraryReagent> = [
    {
      title: '试剂名称',
      dataIndex: 'name',
      key: 'name'
    },
    {
      title: '类型',
      dataIndex: 'type',
      key: 'type',
      render: (type: ReagentType) => (
        <Tag color={getReagentTypeColor(type)}>
          {type === 'enzyme' ? '酶' :
           type === 'buffer' ? '缓冲液' :
           type === 'adapter' ? '接头' :
           type === 'primer' ? '引物' :
           type === 'bead' ? '磁珠' :
           type === 'dye' ? '染料' : '其他'}
        </Tag>
      )
    },
    {
      title: '货号',
      dataIndex: 'catalog',
      key: 'catalog'
    },
    {
      title: '批号',
      dataIndex: 'lot',
      key: 'lot'
    },
    {
      title: '浓度',
      dataIndex: 'concentration',
      key: 'concentration'
    },
    {
      title: '用量',
      dataIndex: 'volume',
      key: 'volume',
      render: (volume: number) => `${volume} μL`
    },
    {
      title: '供应商',
      dataIndex: 'supplier',
      key: 'supplier'
    },
    {
      title: '有效期',
      dataIndex: 'expiryDate',
      key: 'expiryDate',
      render: (date: string) => {
        const isExpired = dayjs(date).isBefore(dayjs());
        const isExpiringSoon = dayjs(date).isBefore(dayjs().add(30, 'day'));
        return (
          <span style={{ 
            color: isExpired ? '#ff4d4f' : isExpiringSoon ? '#faad14' : '#52c41a' 
          }}>
            {date}
          </span>
        );
      }
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
              <BuildOutlined style={{ marginRight: 8 }} />
              文库构建步骤记录
            </Title>
            <Text type="secondary">
              🧬 详细记录文库构建过程中的参数设置、质量检测和结果数据
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
              title="构建成功"
              value={sampleRecords.filter(r => r.qcStatus === 'pass').length}
              suffix="个"
              valueStyle={{ color: '#52c41a' }}
              prefix={<CheckCircleOutlined />}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="平均产量"
              value={sampleRecords.length > 0 ? 
                (sampleRecords.reduce((sum, r) => sum + r.libraryYield, 0) / sampleRecords.length).toFixed(0) : 0
              }
              suffix="ng"
              valueStyle={{ color: '#722ed1' }}
              prefix={<FundOutlined />}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="平均浓度"
              value={sampleRecords.length > 0 ? 
                (sampleRecords.reduce((sum, r) => sum + r.libraryConcentration, 0) / sampleRecords.length).toFixed(1) : 0
              }
              suffix="ng/μL"
              valueStyle={{ color: '#fa8c16' }}
              prefix={<DashboardOutlined />}
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
                {/* 构建参数 */}
                <Card 
                  title="文库构建参数" 
                  size="small"
                  extra={
                    <Button 
                      type="link" 
                      icon={<SettingOutlined />}
                      onClick={() => setParamsModalVisible(true)}
                    >
                      设置参数
                    </Button>
                  }
                >
                  {constructionParams && (
                    <Row gutter={16}>
                      <Col span={12}>
                        <div style={{ marginBottom: 8 }}>
                          <Text strong>文库类型：</Text>
                          <Tag color="blue">{getLibraryTypeText(constructionParams.libraryType)}</Tag>
                        </div>
                        <div style={{ marginBottom: 8 }}>
                          <Text strong>构建方法：</Text>
                          <Text>{getConstructionMethodText(constructionParams.constructionMethod)}</Text>
                        </div>
                        <div style={{ marginBottom: 8 }}>
                          <Text strong>试剂盒：</Text>
                          <Text>{constructionParams.kitName}</Text>
                        </div>
                        <div style={{ marginBottom: 8 }}>
                          <Text strong>版本：</Text>
                          <Text>{constructionParams.kitVersion}</Text>
                        </div>
                        <div style={{ marginBottom: 8 }}>
                          <Text strong>目标片段大小：</Text>
                          <Text>{constructionParams.targetFragmentSize} bp</Text>
                        </div>
                      </Col>
                      <Col span={12}>
                        <div style={{ marginBottom: 8 }}>
                          <Text strong>接头类型：</Text>
                          <Text>{constructionParams.adapterType}</Text>
                        </div>
                        <div style={{ marginBottom: 8 }}>
                          <Text strong>接头浓度：</Text>
                          <Text>{constructionParams.adapterConcentration}</Text>
                        </div>
                        <div style={{ marginBottom: 8 }}>
                          <Text strong>纯化方法：</Text>
                          <Text>{constructionParams.purificationMethod === 'beads' ? '磁珠纯化' : 
                                constructionParams.purificationMethod === 'column' ? '柱纯化' : '胶回收'}</Text>
                        </div>
                        <div style={{ marginBottom: 8 }}>
                          <Text strong>洗脱体积：</Text>
                          <Text>{constructionParams.elutionVolume} μL</Text>
                        </div>
                        <div style={{ marginBottom: 8 }}>
                          <Text strong>操作员：</Text>
                          <Text>{constructionParams.operator}</Text>
                        </div>
                      </Col>
                    </Row>
                  )}
                </Card>
              </Col>
              <Col span={8}>
                {/* 流程步骤 */}
                <Card title="构建流程" size="small">
                  <Steps direction="vertical" size="small" current={-1}>
                    <Step title="DNA质检" description="检测输入DNA质量和浓度" />
                    <Step title="片段化" description="酶切或物理片段化" />
                    <Step title="末端修复" description="修复DNA末端" />
                    <Step title="接头连接" description="连接测序接头" />
                    <Step title="PCR扩增" description="扩增文库片段" />
                    <Step title="纯化" description="去除引物和二聚体" />
                    <Step title="质量检测" description="检测文库质量" />
                  </Steps>
                </Card>

                {/* 环境条件 */}
                <Card title="环境条件" size="small" style={{ marginTop: 16 }}>
                  {constructionParams?.environmentalConditions && (
                    <div>
                      <div style={{ marginBottom: 8 }}>
                        <Text strong>温度：</Text>
                        <Text>{constructionParams.environmentalConditions.temperature}°C</Text>
                      </div>
                      <div style={{ marginBottom: 8 }}>
                        <Text strong>湿度：</Text>
                        <Text>{constructionParams.environmentalConditions.humidity}%</Text>
                      </div>
                      {constructionParams.environmentalConditions.pressure && (
                        <div style={{ marginBottom: 8 }}>
                          <Text strong>气压：</Text>
                          <Text>{constructionParams.environmentalConditions.pressure}hPa</Text>
                        </div>
                      )}
                    </div>
                  )}
                </Card>
              </Col>
            </Row>
          </TabPane>

          <TabPane tab="试剂记录" key="reagents">
            <Space direction="vertical" style={{ width: '100%' }}>
              <Row gutter={16}>
                <Col span={18}>
                  <Space>
                    <Button 
                      type="primary" 
                      icon={<PlusOutlined />}
                      onClick={() => setReagentModalVisible(true)}
                    >
                      添加试剂
                    </Button>
                    <Button icon={<UploadOutlined />}>导入试剂清单</Button>
                    <Button icon={<DownloadOutlined />}>导出试剂清单</Button>
                  </Space>
                </Col>
                <Col span={6} style={{ textAlign: 'right' }}>
                  <Select
                    placeholder="筛选试剂类型"
                    style={{ width: 120 }}
                    allowClear
                  >
                    <Option value="enzyme">酶</Option>
                    <Option value="buffer">缓冲液</Option>
                    <Option value="adapter">接头</Option>
                    <Option value="primer">引物</Option>
                    <Option value="bead">磁珠</Option>
                  </Select>
                </Col>
              </Row>

              {/* 试剂表格 */}
              <Table
                size="small"
                dataSource={reagents}
                columns={reagentColumns}
                rowKey="id"
                pagination={false}
              />

              {/* 试剂使用统计 */}
              <Card title="试剂使用统计" size="small">
                <Row gutter={16}>
                  <Col span={8}>
                    <Statistic
                      title="酶类试剂"
                      value={reagents.filter(r => r.type === 'enzyme').length}
                      suffix="种"
                      valueStyle={{ color: '#52c41a' }}
                    />
                  </Col>
                  <Col span={8}>
                    <Statistic
                      title="缓冲液"
                      value={reagents.filter(r => r.type === 'buffer').length}
                      suffix="种"
                      valueStyle={{ color: '#1890ff' }}
                    />
                  </Col>
                  <Col span={8}>
                    <Statistic
                      title="即将过期"
                      value={reagents.filter(r => 
                        dayjs(r.expiryDate).isBefore(dayjs().add(30, 'day'))
                      ).length}
                      suffix="种"
                      valueStyle={{ color: '#faad14' }}
                    />
                  </Col>
                </Row>
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
                      onClick={() => setBatchProcessVisible(true)}
                    >
                      批量处理
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
                scroll={{ x: 1800 }}
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

          <TabPane tab="质量检测" key="quality">
            <Row gutter={16}>
              <Col span={12}>
                <Card title="质量统计" size="small">
                  <Row gutter={16}>
                    <Col span={6}>
                      <Statistic
                        title="通过率"
                        value={sampleRecords.length > 0 ? 
                          ((sampleRecords.filter(r => r.qcStatus === 'pass').length / sampleRecords.length) * 100).toFixed(1) : 0
                        }
                        suffix="%"
                        valueStyle={{ color: '#52c41a' }}
                      />
                    </Col>
                    <Col span={6}>
                      <Statistic
                        title="高质量"
                        value={sampleRecords.filter(r => 
                          r.libraryConcentration >= 10 && (r.adapterDimerPercent || 0) <= 3
                        ).length}
                        valueStyle={{ color: '#52c41a' }}
                      />
                    </Col>
                    <Col span={6}>
                      <Statistic
                        title="中等质量"
                        value={sampleRecords.filter(r => 
                          r.libraryConcentration >= 5 && r.libraryConcentration < 10
                        ).length}
                        valueStyle={{ color: '#faad14' }}
                      />
                    </Col>
                    <Col span={6}>
                      <Statistic
                        title="低质量"
                        value={sampleRecords.filter(r => r.libraryConcentration < 5).length}
                        valueStyle={{ color: '#ff7a45' }}
                      />
                    </Col>
                  </Row>
                </Card>
              </Col>
              <Col span={12}>
                <Card title="质量趋势" size="small">
                  <div style={{ height: 200, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Text type="secondary">文库质量趋势图表</Text>
                  </div>
                </Card>
              </Col>
            </Row>

            <Card title="质量详情" size="small" style={{ marginTop: 16 }}>
              <Collapse>
                <Panel header="浓度质控" key="concentration">
                  <Alert
                    message="浓度质控标准"
                    description="文库浓度应≥2 ng/μL，推荐≥10 ng/μL以确保测序质量"
                    type="info"
                    showIcon
                    style={{ marginBottom: 16 }}
                  />
                  <List
                    size="small"
                    dataSource={sampleRecords.filter(r => r.libraryConcentration < 2)}
                    renderItem={record => (
                      <List.Item>
                        <List.Item.Meta
                          avatar={<Avatar style={{ backgroundColor: '#ff4d4f' }}>{record.sampleCode}</Avatar>}
                          title={`${record.sampleName} - ${record.libraryConcentration.toFixed(1)} ng/μL`}
                          description="浓度过低"
                        />
                        <Tag color="error">异常</Tag>
                      </List.Item>
                    )}
                  />
                </Panel>
                <Panel header="片段大小质控" key="fragment">
                  <Alert
                    message="片段大小质控标准"
                    description="片段大小应在目标范围内(±30%)，分布应相对集中"
                    type="info"
                    showIcon
                    style={{ marginBottom: 16 }}
                  />
                  <List
                    size="small"
                    dataSource={sampleRecords.filter(r => {
                      const targetSize = constructionParams?.targetFragmentSize || 400;
                      return Math.abs(r.fragmentSizeDistribution.mean - targetSize) > targetSize * 0.3;
                    })}
                    renderItem={record => (
                      <List.Item>
                        <List.Item.Meta
                          avatar={<Avatar style={{ backgroundColor: '#faad14' }}>{record.sampleCode}</Avatar>}
                          title={`${record.sampleName} - ${record.fragmentSizeDistribution.mean} bp`}
                          description={`分布: ${record.fragmentSizeDistribution.range}`}
                        />
                        <Tag color="warning">片段异常</Tag>
                      </List.Item>
                    )}
                  />
                </Panel>
                <Panel header="接头二聚体质控" key="adapter">
                  <Alert
                    message="接头二聚体质控标准"
                    description="接头二聚体含量应≤5%，过高会影响测序数据质量"
                    type="info"
                    showIcon
                    style={{ marginBottom: 16 }}
                  />
                  <List
                    size="small"
                    dataSource={sampleRecords.filter(r => 
                      r.adapterDimerPercent && r.adapterDimerPercent > 5
                    )}
                    renderItem={record => (
                      <List.Item>
                        <List.Item.Meta
                          avatar={<Avatar style={{ backgroundColor: '#ff4d4f' }}>{record.sampleCode}</Avatar>}
                          title={`${record.sampleName} - ${record.adapterDimerPercent?.toFixed(1)}%`}
                          description="接头二聚体过高"
                        />
                        <Tag color="error">异常</Tag>
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
        title={editingRecord ? '编辑文库记录' : '新增文库记录'}
        open={recordModalVisible}
        onCancel={() => {
          setRecordModalVisible(false);
          setEditingRecord(null);
          sampleForm.resetFields();
        }}
        onOk={() => sampleForm.submit()}
        confirmLoading={loading}
        width={900}
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

          <Divider>输入DNA信息</Divider>

          <Row gutter={16}>
            <Col span={8}>
              <Form.Item
                name="inputDNAAmount"
                label="输入DNA总量(ng)"
                rules={[{ required: true, message: '请输入DNA总量' }]}
              >
                <InputNumber
                  placeholder="请输入DNA总量"
                  min={0}
                  style={{ width: '100%' }}
                />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                name="inputDNAConcentration"
                label="输入DNA浓度(ng/μL)"
                rules={[{ required: true, message: '请输入DNA浓度' }]}
              >
                <InputNumber
                  placeholder="请输入DNA浓度"
                  min={0}
                  precision={1}
                  style={{ width: '100%' }}
                />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                name="inputDNAVolume"
                label="输入DNA体积(μL)"
                rules={[{ required: true, message: '请输入DNA体积' }]}
              >
                <InputNumber
                  placeholder="请输入DNA体积"
                  min={0}
                  precision={1}
                  style={{ width: '100%' }}
                />
              </Form.Item>
            </Col>
          </Row>

          <Divider>文库构建结果</Divider>

          <Row gutter={16}>
            <Col span={8}>
              <Form.Item
                name="libraryConcentration"
                label="文库浓度(ng/μL)"
                rules={[{ required: true, message: '请输入文库浓度' }]}
              >
                <InputNumber
                  placeholder="请输入文库浓度"
                  min={0}
                  precision={1}
                  style={{ width: '100%' }}
                />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                name="libraryVolume"
                label="文库体积(μL)"
                rules={[{ required: true, message: '请输入文库体积' }]}
              >
                <InputNumber
                  placeholder="请输入文库体积"
                  min={0}
                  precision={1}
                  style={{ width: '100%' }}
                />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                name="libraryYield"
                label="文库产量(ng)"
                rules={[{ required: true, message: '请输入文库产量' }]}
              >
                <InputNumber
                  placeholder="请输入文库产量"
                  min={0}
                  style={{ width: '100%' }}
                />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={8}>
              <Form.Item name="fragmentSizeMean" label="平均片段大小(bp)">
                <InputNumber
                  placeholder="请输入平均片段大小"
                  min={0}
                  style={{ width: '100%' }}
                />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="qcMolarity" label="摩尔浓度(nM)">
                <InputNumber
                  placeholder="请输入摩尔浓度"
                  min={0}
                  precision={1}
                  style={{ width: '100%' }}
                />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="adapterDimerPercent" label="接头二聚体(%)">
                <InputNumber
                  placeholder="请输入接头二聚体百分比"
                  min={0}
                  max={100}
                  precision={1}
                  style={{ width: '100%' }}
                />
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

      {/* 构建参数设置模态框 */}
      <Modal
        title="文库构建参数设置"
        open={paramsModalVisible}
        onCancel={() => setParamsModalVisible(false)}
        onOk={() => paramsForm.submit()}
        confirmLoading={loading}
        width={800}
      >
        <Form
          form={paramsForm}
          layout="vertical"
          onFinish={handleSetParams}
          initialValues={constructionParams}
        >
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="libraryType"
                label="文库类型"
                rules={[{ required: true, message: '请选择文库类型' }]}
              >
                <Select placeholder="请选择文库类型">
                  <Option value="illumina">Illumina</Option>
                  <Option value="nanopore">Oxford Nanopore</Option>
                  <Option value="pacbio">PacBio</Option>
                  <Option value="ion_torrent">Ion Torrent</Option>
                  <Option value="custom">自定义</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="constructionMethod"
                label="构建方法"
                rules={[{ required: true, message: '请选择构建方法' }]}
              >
                <Select placeholder="请选择构建方法">
                  <Option value="tagmentation">转座酶片段化</Option>
                  <Option value="fragmentation">物理片段化</Option>
                  <Option value="pcr_free">PCR-free</Option>
                  <Option value="amplicon">扩增子</Option>
                  <Option value="targeted">靶向捕获</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="kitName"
                label="试剂盒名称"
                rules={[{ required: true, message: '请输入试剂盒名称' }]}
              >
                <Input placeholder="请输入试剂盒名称" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="targetFragmentSize"
                label="目标片段大小(bp)"
                rules={[{ required: true, message: '请输入目标片段大小' }]}
              >
                <InputNumber
                  placeholder="请输入目标片段大小"
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
                name="purificationMethod"
                label="纯化方法"
                rules={[{ required: true, message: '请选择纯化方法' }]}
              >
                <Select placeholder="请选择纯化方法">
                  <Option value="beads">磁珠纯化</Option>
                  <Option value="column">柱纯化</Option>
                  <Option value="gel">胶回收</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="elutionVolume"
                label="洗脱体积(μL)"
                rules={[{ required: true, message: '请输入洗脱体积' }]}
              >
                <InputNumber
                  placeholder="请输入洗脱体积"
                  min={10}
                  max={200}
                  style={{ width: '100%' }}
                />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={8}>
              <Form.Item name="temperature" label="环境温度(°C)">
                <InputNumber
                  placeholder="请输入环境温度"
                  min={15}
                  max={30}
                  style={{ width: '100%' }}
                />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="humidity" label="环境湿度(%)">
                <InputNumber
                  placeholder="请输入环境湿度"
                  min={30}
                  max={70}
                  style={{ width: '100%' }}
                />
              </Form.Item>
            </Col>
            <Col span={8}>
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
            name="libraryConcentration"
            label="文库浓度(ng/μL)"
            rules={[{ required: true, message: '请输入文库浓度' }]}
          >
            <InputNumber
              placeholder="请输入文库浓度"
              min={0}
              precision={1}
              style={{ width: '100%' }}
            />
          </Form.Item>

          <Form.Item
            name="qcStatus"
            label="质控状态"
            rules={[{ required: true, message: '请选择质控状态' }]}
          >
            <Radio.Group>
              <Radio.Button value="pass">通过</Radio.Button>
              <Radio.Button value="warning">警告</Radio.Button>
              <Radio.Button value="fail">失败</Radio.Button>
            </Radio.Group>
          </Form.Item>

          <Form.Item name="notes" label="备注">
            <TextArea rows={2} placeholder="请输入备注" />
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit" block loading={loading}>
              保存记录
            </Button>
          </Form.Item>
        </Form>
      </Drawer>
    </div>
  );
};

export default LibraryConstructionRecord;