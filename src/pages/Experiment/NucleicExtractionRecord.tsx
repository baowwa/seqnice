/**
 * 核酸提取步骤记录界面组件
 * 
 * 功能说明：
 * - 提供核酸提取步骤的详细数据记录功能
 * - 包含基本信息、样本提取结果记录、提取参数、质量控制等
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
  Steps
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
  FileTextOutlined
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
 * 提取方法枚举
 */
type ExtractionMethod = 'magnetic_beads' | 'column' | 'phenol_chloroform' | 'kit_based';

/**
 * 质控状态枚举
 */
type QCStatus = 'pass' | 'warning' | 'fail' | 'pending';

/**
 * 样本提取记录接口定义
 */
interface SampleExtractionRecord {
  id: string;
  sampleId: string;
  sampleCode: string;
  sampleName: string;
  sampleType: string;
  position: string;
  // 提取前信息
  initialVolume: number;
  initialConcentration?: number;
  sampleCondition: string;
  // 提取参数
  extractionMethod: ExtractionMethod;
  extractionKit?: string;
  lysisBuffer: string;
  lysisTime: number;
  lysisTemperature: number;
  washSteps: number;
  elutionBuffer: string;
  elutionVolume: number;
  // 提取结果
  finalVolume: number;
  concentration: number;
  purity260280: number;
  purity260230: number;
  totalYield: number;
  yieldPercentage: number;
  // 质量控制
  qcStatus: QCStatus;
  qcNotes?: string;
  gelElectrophoresis?: boolean;
  gelImage?: string;
  // 记录信息
  operator: string;
  recordTime: string;
  verified: boolean;
  notes?: string;
}

/**
 * 批次提取参数接口定义
 */
interface BatchExtractionParams {
  batchId: string;
  extractionMethod: ExtractionMethod;
  extractionKit?: string;
  protocol: string;
  lysisBuffer: string;
  lysisTime: number;
  lysisTemperature: number;
  washBuffer: string;
  washSteps: number;
  elutionBuffer: string;
  elutionVolume: number;
  incubationTime: number;
  centrifugationSpeed: number;
  centrifugationTime: number;
  equipment: string[];
  reagentLot: Record<string, string>;
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
 * 质量控制记录接口定义
 */
interface QualityControlRecord {
  id: string;
  sampleId: string;
  qcType: 'concentration' | 'purity' | 'integrity' | 'contamination';
  qcMethod: string;
  qcResult: QCStatus;
  qcValue?: number;
  qcRange?: string;
  qcImage?: string;
  qcNotes?: string;
  qcTime: string;
  qcOperator: string;
}

/**
 * 核酸提取步骤记录组件
 * 
 * @returns {JSX.Element} 核酸提取记录界面
 */
const NucleicExtractionRecord: React.FC = () => {
  // 状态管理
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('basic');
  const [sampleRecords, setSampleRecords] = useState<SampleExtractionRecord[]>([]);
  const [batchParams, setBatchParams] = useState<BatchExtractionParams | null>(null);
  const [qcRecords, setQcRecords] = useState<QualityControlRecord[]>([]);
  const [selectedSamples, setSelectedSamples] = useState<string[]>([]);
  const [editingRecord, setEditingRecord] = useState<SampleExtractionRecord | null>(null);
  const [recordModalVisible, setRecordModalVisible] = useState(false);
  const [qcModalVisible, setQcModalVisible] = useState(false);
  const [batchParamsModalVisible, setBatchParamsModalVisible] = useState(false);
  const [quickRecordDrawerVisible, setQuickRecordDrawerVisible] = useState(false);
  
  // 表单实例
  const [basicForm] = Form.useForm();
  const [sampleForm] = Form.useForm();
  const [batchForm] = Form.useForm();
  const [qcForm] = Form.useForm();
  const [quickForm] = Form.useForm();

  // 模拟数据
  const mockSampleRecords: SampleExtractionRecord[] = [
    {
      id: 'record_001',
      sampleId: 'sample_001',
      sampleCode: 'S001',
      sampleName: '土壤样本-1',
      sampleType: 'Soil',
      position: 'A1',
      initialVolume: 200,
      initialConcentration: 0,
      sampleCondition: '良好',
      extractionMethod: 'magnetic_beads',
      extractionKit: 'DNeasy PowerSoil Kit',
      lysisBuffer: 'PowerBead Solution',
      lysisTime: 10,
      lysisTemperature: 65,
      washSteps: 3,
      elutionBuffer: 'Solution C6',
      elutionVolume: 50,
      finalVolume: 48,
      concentration: 125.6,
      purity260280: 1.85,
      purity260230: 2.1,
      totalYield: 6.03,
      yieldPercentage: 85.2,
      qcStatus: 'pass',
      gelElectrophoresis: true,
      operator: '张实验员',
      recordTime: '2024-01-16 10:30:00',
      verified: true,
      notes: '提取效果良好，DNA完整性好'
    },
    {
      id: 'record_002',
      sampleId: 'sample_002',
      sampleCode: 'S002',
      sampleName: '水样-1',
      sampleType: 'Water',
      position: 'A2',
      initialVolume: 250,
      sampleCondition: '良好',
      extractionMethod: 'magnetic_beads',
      extractionKit: 'DNeasy PowerWater Kit',
      lysisBuffer: 'PowerBead Solution',
      lysisTime: 10,
      lysisTemperature: 65,
      washSteps: 3,
      elutionBuffer: 'Solution C6',
      elutionVolume: 50,
      finalVolume: 47,
      concentration: 98.3,
      purity260280: 1.92,
      purity260230: 2.05,
      totalYield: 4.62,
      yieldPercentage: 78.5,
      qcStatus: 'pass',
      gelElectrophoresis: true,
      operator: '张实验员',
      recordTime: '2024-01-16 10:45:00',
      verified: true,
      notes: '提取成功，浓度适中'
    }
  ];

  const mockBatchParams: BatchExtractionParams = {
    batchId: 'batch_001',
    extractionMethod: 'magnetic_beads',
    extractionKit: 'DNeasy PowerSoil Kit',
    protocol: 'Standard Protocol v2.1',
    lysisBuffer: 'PowerBead Solution',
    lysisTime: 10,
    lysisTemperature: 65,
    washBuffer: 'Solution C2/C3',
    washSteps: 3,
    elutionBuffer: 'Solution C6',
    elutionVolume: 50,
    incubationTime: 5,
    centrifugationSpeed: 10000,
    centrifugationTime: 1,
    equipment: ['离心机-01', '涡旋混合器-02', '水浴锅-03'],
    reagentLot: {
      'PowerBead Solution': 'LOT20240115',
      'Solution C1': 'LOT20240112',
      'Solution C2': 'LOT20240110',
      'Solution C3': 'LOT20240108',
      'Solution C6': 'LOT20240105'
    },
    environmentalConditions: {
      temperature: 22,
      humidity: 45,
      pressure: 1013
    },
    operator: '张实验员',
    startTime: '2024-01-16 09:00:00',
    estimatedEndTime: '2024-01-16 12:00:00',
    notes: '标准核酸提取流程，注意无菌操作'
  };

  useEffect(() => {
    // 模拟加载数据
    setLoading(true);
    setTimeout(() => {
      setSampleRecords(mockSampleRecords);
      setBatchParams(mockBatchParams);
      setLoading(false);
    }, 1000);
  }, []);

  /**
   * 获取提取方法文本
   * @param method 提取方法
   * @returns 方法文本
   */
  const getExtractionMethodText = (method: ExtractionMethod): string => {
    const methodMap = {
      magnetic_beads: '磁珠法',
      column: '柱式法',
      phenol_chloroform: '酚氯仿法',
      kit_based: '试剂盒法'
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
   * 处理样本记录编辑
   * @param record 样本记录
   */
  const handleEditRecord = (record?: SampleExtractionRecord) => {
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
      
      const newRecord: SampleExtractionRecord = {
        ...values,
        id: editingRecord?.id || `record_${Date.now()}`,
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
        estimatedEndTime: values.estimatedEndTime.format('YYYY-MM-DD HH:mm:ss')
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
  const validateRecord = (record: SampleExtractionRecord): { valid: boolean; errors: string[] } => {
    const errors: string[] = [];
    
    // 浓度验证
    if (record.concentration < 10) {
      errors.push('DNA浓度过低，建议重新提取');
    }
    if (record.concentration > 1000) {
      errors.push('DNA浓度过高，可能存在污染');
    }
    
    // 纯度验证
    if (record.purity260280 < 1.7 || record.purity260280 > 2.0) {
      errors.push('260/280比值异常，可能存在蛋白质污染');
    }
    if (record.purity260230 < 1.8 || record.purity260230 > 2.2) {
      errors.push('260/230比值异常，可能存在盐类或有机溶剂污染');
    }
    
    // 产量验证
    if (record.yieldPercentage < 50) {
      errors.push('提取产量过低，建议检查提取流程');
    }
    
    return {
      valid: errors.length === 0,
      errors
    };
  };

  // 样本记录表格列定义
  const sampleColumns: ColumnsType<SampleExtractionRecord> = [
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
      title: '位置',
      dataIndex: 'position',
      key: 'position',
      width: 80
    },
    {
      title: '提取方法',
      dataIndex: 'extractionMethod',
      key: 'extractionMethod',
      width: 100,
      render: (method: ExtractionMethod) => (
        <Tag color="blue">{getExtractionMethodText(method)}</Tag>
      )
    },
    {
      title: '浓度(ng/μL)',
      dataIndex: 'concentration',
      key: 'concentration',
      width: 120,
      render: (value: number) => (
        <span style={{ color: value < 10 ? '#ff4d4f' : value > 1000 ? '#faad14' : '#52c41a' }}>
          {value.toFixed(1)}
        </span>
      )
    },
    {
      title: '纯度(260/280)',
      dataIndex: 'purity260280',
      key: 'purity260280',
      width: 120,
      render: (value: number) => (
        <span style={{ color: value < 1.7 || value > 2.0 ? '#ff4d4f' : '#52c41a' }}>
          {value.toFixed(2)}
        </span>
      )
    },
    {
      title: '纯度(260/230)',
      dataIndex: 'purity260230',
      key: 'purity260230',
      width: 120,
      render: (value: number) => (
        <span style={{ color: value < 1.8 || value > 2.2 ? '#ff4d4f' : '#52c41a' }}>
          {value.toFixed(2)}
        </span>
      )
    },
    {
      title: '总产量(μg)',
      dataIndex: 'totalYield',
      key: 'totalYield',
      width: 100,
      render: (value: number) => value.toFixed(2)
    },
    {
      title: '产量率(%)',
      dataIndex: 'yieldPercentage',
      key: 'yieldPercentage',
      width: 100,
      render: (value: number) => (
        <span style={{ color: value < 50 ? '#ff4d4f' : value > 80 ? '#52c41a' : '#faad14' }}>
          {value.toFixed(1)}%
        </span>
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
        const validation = validateRecord(record);
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

  return (
    <div style={{ padding: '24px' }}>
      {/* 页面标题 */}
      <Card style={{ marginBottom: 24 }}>
        <Row gutter={16} align="middle">
          <Col span={18}>
            <Title level={3} style={{ margin: 0 }}>
              <ExperimentOutlined style={{ marginRight: 8 }} />
              核酸提取步骤记录
            </Title>
            <Text type="secondary">
              📋 详细记录核酸提取过程中的各项参数和结果数据
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
              title="已完成"
              value={sampleRecords.filter(r => r.verified).length}
              suffix="个"
              valueStyle={{ color: '#52c41a' }}
              prefix={<CheckCircleOutlined />}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="平均浓度"
              value={sampleRecords.length > 0 ? 
                (sampleRecords.reduce((sum, r) => sum + r.concentration, 0) / sampleRecords.length).toFixed(1) : 0
              }
              suffix="ng/μL"
              valueStyle={{ color: '#722ed1' }}
              prefix={<ExperimentOutlined />}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="平均产量率"
              value={sampleRecords.length > 0 ? 
                (sampleRecords.reduce((sum, r) => sum + r.yieldPercentage, 0) / sampleRecords.length).toFixed(1) : 0
              }
              suffix="%"
              valueStyle={{ color: '#fa8c16' }}
              prefix={<WarningOutlined />}
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
                  title="批次提取参数" 
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
                          <Text strong>提取方法：</Text>
                          <Tag color="blue">{getExtractionMethodText(batchParams.extractionMethod)}</Tag>
                        </div>
                        <div style={{ marginBottom: 8 }}>
                          <Text strong>提取试剂盒：</Text>
                          <Text>{batchParams.extractionKit}</Text>
                        </div>
                        <div style={{ marginBottom: 8 }}>
                          <Text strong>裂解缓冲液：</Text>
                          <Text>{batchParams.lysisBuffer}</Text>
                        </div>
                        <div style={{ marginBottom: 8 }}>
                          <Text strong>裂解时间：</Text>
                          <Text>{batchParams.lysisTime}分钟</Text>
                        </div>
                        <div style={{ marginBottom: 8 }}>
                          <Text strong>裂解温度：</Text>
                          <Text>{batchParams.lysisTemperature}°C</Text>
                        </div>
                      </Col>
                      <Col span={12}>
                        <div style={{ marginBottom: 8 }}>
                          <Text strong>洗涤步骤：</Text>
                          <Text>{batchParams.washSteps}次</Text>
                        </div>
                        <div style={{ marginBottom: 8 }}>
                          <Text strong>洗脱缓冲液：</Text>
                          <Text>{batchParams.elutionBuffer}</Text>
                        </div>
                        <div style={{ marginBottom: 8 }}>
                          <Text strong>洗脱体积：</Text>
                          <Text>{batchParams.elutionVolume}μL</Text>
                        </div>
                        <div style={{ marginBottom: 8 }}>
                          <Text strong>离心速度：</Text>
                          <Text>{batchParams.centrifugationSpeed}rpm</Text>
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
                {/* 环境条件 */}
                <Card title="环境条件" size="small">
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

                {/* 使用设备 */}
                <Card title="使用设备" size="small" style={{ marginTop: 16 }}>
                  <List
                    size="small"
                    dataSource={batchParams?.equipment || []}
                    renderItem={item => (
                      <List.Item>
                        <Text>{item}</Text>
                      </List.Item>
                    )}
                  />
                </Card>
              </Col>
            </Row>
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
                      icon={<SettingOutlined />}
                      onClick={() => setBatchParamsModalVisible(true)}
                    >
                      批次设置
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
                scroll={{ x: 1400 }}
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
                <Card title="质控统计" size="small">
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
                        title="警告"
                        value={sampleRecords.filter(r => r.qcStatus === 'warning').length}
                        valueStyle={{ color: '#faad14' }}
                      />
                    </Col>
                    <Col span={6}>
                      <Statistic
                        title="失败"
                        value={sampleRecords.filter(r => r.qcStatus === 'fail').length}
                        valueStyle={{ color: '#ff4d4f' }}
                      />
                    </Col>
                    <Col span={6}>
                      <Statistic
                        title="待检"
                        value={sampleRecords.filter(r => r.qcStatus === 'pending').length}
                        valueStyle={{ color: '#d9d9d9' }}
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

            <Card title="质控详情" size="small" style={{ marginTop: 16 }}>
              <Collapse>
                <Panel header="浓度质控" key="concentration">
                  <Alert
                    message="浓度质控标准"
                    description="DNA浓度应在10-1000 ng/μL范围内，低于10 ng/μL需要重新提取，高于1000 ng/μL可能存在污染"
                    type="info"
                    showIcon
                    style={{ marginBottom: 16 }}
                  />
                  <List
                    size="small"
                    dataSource={sampleRecords.filter(r => r.concentration < 10 || r.concentration > 1000)}
                    renderItem={record => (
                      <List.Item>
                        <List.Item.Meta
                          avatar={<Avatar style={{ backgroundColor: '#ff4d4f' }}>{record.sampleCode}</Avatar>}
                          title={`${record.sampleName} - ${record.concentration.toFixed(1)} ng/μL`}
                          description={record.concentration < 10 ? '浓度过低' : '浓度过高'}
                        />
                        <Tag color="error">异常</Tag>
                      </List.Item>
                    )}
                  />
                </Panel>
                <Panel header="纯度质控" key="purity">
                  <Alert
                    message="纯度质控标准"
                    description="260/280比值应在1.7-2.0之间，260/230比值应在1.8-2.2之间"
                    type="info"
                    showIcon
                    style={{ marginBottom: 16 }}
                  />
                  <List
                    size="small"
                    dataSource={sampleRecords.filter(r => 
                      r.purity260280 < 1.7 || r.purity260280 > 2.0 || 
                      r.purity260230 < 1.8 || r.purity260230 > 2.2
                    )}
                    renderItem={record => (
                      <List.Item>
                        <List.Item.Meta
                          avatar={<Avatar style={{ backgroundColor: '#faad14' }}>{record.sampleCode}</Avatar>}
                          title={`${record.sampleName}`}
                          description={
                            <div>
                              <div>260/280: {record.purity260280.toFixed(2)}</div>
                              <div>260/230: {record.purity260230.toFixed(2)}</div>
                            </div>
                          }
                        />
                        <Tag color="warning">纯度异常</Tag>
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
        title={editingRecord ? '编辑样本记录' : '新增样本记录'}
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
                name="sampleType"
                label="样本类型"
                rules={[{ required: true, message: '请选择样本类型' }]}
              >
                <Select placeholder="请选择样本类型">
                  <Option value="Soil">土壤</Option>
                  <Option value="Water">水样</Option>
                  <Option value="Sediment">沉积物</Option>
                  <Option value="Plant">植物</Option>
                  <Option value="Animal">动物</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                name="position"
                label="位置"
                rules={[{ required: true, message: '请输入位置' }]}
              >
                <Input placeholder="如：A1" />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                name="extractionMethod"
                label="提取方法"
                rules={[{ required: true, message: '请选择提取方法' }]}
              >
                <Select placeholder="请选择提取方法">
                  <Option value="magnetic_beads">磁珠法</Option>
                  <Option value="column">柱式法</Option>
                  <Option value="phenol_chloroform">酚氯仿法</Option>
                  <Option value="kit_based">试剂盒法</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Divider>提取结果</Divider>

          <Row gutter={16}>
            <Col span={8}>
              <Form.Item
                name="concentration"
                label="浓度 (ng/μL)"
                rules={[{ required: true, message: '请输入浓度' }]}
              >
                <InputNumber
                  placeholder="请输入浓度"
                  min={0}
                  precision={1}
                  style={{ width: '100%' }}
                />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                name="purity260280"
                label="纯度 (260/280)"
                rules={[{ required: true, message: '请输入纯度' }]}
              >
                <InputNumber
                  placeholder="请输入纯度"
                  min={0}
                  max={5}
                  precision={2}
                  style={{ width: '100%' }}
                />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                name="purity260230"
                label="纯度 (260/230)"
                rules={[{ required: true, message: '请输入纯度' }]}
              >
                <InputNumber
                  placeholder="请输入纯度"
                  min={0}
                  max={5}
                  precision={2}
                  style={{ width: '100%' }}
                />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={8}>
              <Form.Item
                name="finalVolume"
                label="最终体积 (μL)"
                rules={[{ required: true, message: '请输入最终体积' }]}
              >
                <InputNumber
                  placeholder="请输入最终体积"
                  min={0}
                  style={{ width: '100%' }}
                />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                name="totalYield"
                label="总产量 (μg)"
                rules={[{ required: true, message: '请输入总产量' }]}
              >
                <InputNumber
                  placeholder="请输入总产量"
                  min={0}
                  precision={2}
                  style={{ width: '100%' }}
                />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                name="yieldPercentage"
                label="产量率 (%)"
                rules={[{ required: true, message: '请输入产量率' }]}
              >
                <InputNumber
                  placeholder="请输入产量率"
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

      {/* 批次参数设置模态框 */}
      <Modal
        title="批次提取参数设置"
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
                name="extractionMethod"
                label="提取方法"
                rules={[{ required: true, message: '请选择提取方法' }]}
              >
                <Select placeholder="请选择提取方法">
                  <Option value="magnetic_beads">磁珠法</Option>
                  <Option value="column">柱式法</Option>
                  <Option value="phenol_chloroform">酚氯仿法</Option>
                  <Option value="kit_based">试剂盒法</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="extractionKit" label="提取试剂盒">
                <Input placeholder="请输入提取试剂盒" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={8}>
              <Form.Item
                name="lysisTime"
                label="裂解时间 (分钟)"
                rules={[{ required: true, message: '请输入裂解时间' }]}
              >
                <InputNumber
                  placeholder="请输入裂解时间"
                  min={1}
                  style={{ width: '100%' }}
                />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                name="lysisTemperature"
                label="裂解温度 (°C)"
                rules={[{ required: true, message: '请输入裂解温度' }]}
              >
                <InputNumber
                  placeholder="请输入裂解温度"
                  min={0}
                  max={100}
                  style={{ width: '100%' }}
                />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                name="washSteps"
                label="洗涤步骤"
                rules={[{ required: true, message: '请输入洗涤步骤' }]}
              >
                <InputNumber
                  placeholder="请输入洗涤步骤"
                  min={1}
                  max={10}
                  style={{ width: '100%' }}
                />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="operator"
                label="操作员"
                rules={[{ required: true, message: '请输入操作员' }]}
              >
                <Input placeholder="请输入操作员" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="elutionVolume"
                label="洗脱体积 (μL)"
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
            name="concentration"
            label="浓度 (ng/μL)"
            rules={[{ required: true, message: '请输入浓度' }]}
          >
            <InputNumber
              placeholder="请输入浓度"
              min={0}
              precision={1}
              style={{ width: '100%' }}
            />
          </Form.Item>

          <Form.Item
            name="purity260280"
            label="纯度 (260/280)"
            rules={[{ required: true, message: '请输入纯度' }]}
          >
            <InputNumber
              placeholder="请输入纯度"
              min={0}
              max={5}
              precision={2}
              style={{ width: '100%' }}
            />
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

export default NucleicExtractionRecord;