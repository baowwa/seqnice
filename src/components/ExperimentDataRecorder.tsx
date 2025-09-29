/**
 * 实验数据记录器组件
 * 
 * 功能说明：
 * - 提供实时数据记录功能，支持草稿保存和快速记录
 * - 支持移动端优化界面，适配不同屏幕尺寸
 * - 集成数据验证和质量控制机制
 * - 支持批量数据录入和模板导入
 * - 提供离线数据缓存和同步功能
 * 
 * @author 系统
 * @version 2.0.0
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  Card,
  Form,
  Input,
  Select,
  DatePicker,
  InputNumber,
  Button,
  Space,
  Row,
  Col,
  Typography,
  Alert,
  message,
  Modal,
  Drawer,
  Tabs,
  Switch,
  Tooltip,
  Progress,
  Badge,
  Tag,
  Divider,
  Collapse,
  Steps,
  List,
  Avatar,
  Spin,
  Empty,
  Popconfirm,
  notification,
  FloatButton,
  Affix,
  BackTop
} from 'antd';
import {
  SaveOutlined,
  ReloadOutlined,
  PlusOutlined,
  DeleteOutlined,
  EditOutlined,
  EyeOutlined,
  UploadOutlined,
  DownloadOutlined,
  SyncOutlined,
  ClockCircleOutlined,
  CheckCircleOutlined,
  ExclamationCircleOutlined,
  WarningOutlined,
  MobileOutlined,
  DesktopOutlined,
  CloudSyncOutlined,
  WifiOutlined,
  DisconnectOutlined,
  BarcodeOutlined,
  CameraOutlined,
  FileTextOutlined,
  SettingOutlined,
  ThunderboltOutlined,
  DashboardOutlined,
  DatabaseOutlined,
  SafetyOutlined,
  ControlOutlined,
  ExperimentOutlined,
  LineChartOutlined,
  BarChartOutlined,
  FundOutlined,
  HourglassOutlined,
  FireOutlined,
  ToolOutlined
} from '@ant-design/icons';
import type { FormInstance } from 'antd/es/form';
import dayjs from 'dayjs';

const { Title, Text, Paragraph } = Typography;
const { Option } = Select;
const { TextArea } = Input;
const { TabPane } = Tabs;
const { Panel } = Collapse;
const { Step } = Steps;

/**
 * 记录类型枚举
 */
type RecordType = 'nucleic_extraction' | 'pcr_amplification' | 'library_construction' | 'sequencing' | 'analysis';

/**
 * 数据状态枚举
 */
type DataStatus = 'draft' | 'saved' | 'synced' | 'error';

/**
 * 验证级别枚举
 */
type ValidationLevel = 'info' | 'warning' | 'error';

/**
 * 设备类型枚举
 */
type DeviceType = 'desktop' | 'tablet' | 'mobile';

/**
 * 数据记录接口定义
 */
interface DataRecord {
  id: string;
  type: RecordType;
  stepName: string;
  sampleId: string;
  sampleCode: string;
  data: Record<string, any>;
  status: DataStatus;
  operator: string;
  createTime: string;
  updateTime: string;
  syncTime?: string;
  version: number;
  notes?: string;
}

/**
 * 验证结果接口定义
 */
interface ValidationResult {
  field: string;
  level: ValidationLevel;
  message: string;
  suggestion?: string;
}

/**
 * 快速记录模板接口定义
 */
interface QuickRecordTemplate {
  id: string;
  name: string;
  type: RecordType;
  fields: Array<{
    name: string;
    label: string;
    type: 'input' | 'number' | 'select' | 'date' | 'textarea';
    required: boolean;
    options?: string[];
    validation?: {
      min?: number;
      max?: number;
      pattern?: string;
    };
  }>;
  defaultValues?: Record<string, any>;
}

/**
 * 组件属性接口定义
 */
interface ExperimentDataRecorderProps {
  /** 记录类型 */
  recordType: RecordType;
  /** 样本ID */
  sampleId?: string;
  /** 批次ID */
  batchId?: string;
  /** 步骤名称 */
  stepName?: string;
  /** 是否移动端模式 */
  isMobile?: boolean;
  /** 是否启用快速记录 */
  enableQuickRecord?: boolean;
  /** 是否启用离线模式 */
  enableOffline?: boolean;
  /** 自动保存间隔(秒) */
  autoSaveInterval?: number;
  /** 数据变更回调 */
  onDataChange?: (data: any) => void;
  /** 保存成功回调 */
  onSaveSuccess?: (record: DataRecord) => void;
  /** 保存失败回调 */
  onSaveError?: (error: Error) => void;
}

/**
 * 实验数据记录器组件
 * 
 * @param props 组件属性
 * @returns {JSX.Element} 数据记录器界面
 */
const ExperimentDataRecorder: React.FC<ExperimentDataRecorderProps> = ({
  recordType,
  sampleId,
  batchId,
  stepName = '数据记录',
  isMobile = false,
  enableQuickRecord = true,
  enableOffline = true,
  autoSaveInterval = 30,
  onDataChange,
  onSaveSuccess,
  onSaveError
}) => {
  // 状态管理
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [deviceType, setDeviceType] = useState<DeviceType>('desktop');
  const [currentRecord, setCurrentRecord] = useState<DataRecord | null>(null);
  const [validationResults, setValidationResults] = useState<ValidationResult[]>([]);
  const [quickRecordVisible, setQuickRecordVisible] = useState(false);
  const [templateModalVisible, setTemplateModalVisible] = useState(false);
  const [settingsVisible, setSettingsVisible] = useState(false);
  const [autoSaveEnabled, setAutoSaveEnabled] = useState(true);
  const [lastSaveTime, setLastSaveTime] = useState<string>('');
  const [unsavedChanges, setUnsavedChanges] = useState(false);
  const [offlineRecords, setOfflineRecords] = useState<DataRecord[]>([]);
  
  // 表单实例
  const [mainForm] = Form.useForm();
  const [quickForm] = Form.useForm();

  // 模拟快速记录模板
  const quickRecordTemplates: QuickRecordTemplate[] = [
    {
      id: 'nucleic_quick',
      name: '核酸提取快速记录',
      type: 'nucleic_extraction',
      fields: [
        { name: 'sampleCode', label: '样本编号', type: 'input', required: true },
        { name: 'extractionMethod', label: '提取方法', type: 'select', required: true, options: ['柱提取', '磁珠提取', '酚氯仿'] },
        { name: 'dnaConcentration', label: 'DNA浓度(ng/μL)', type: 'number', required: true, validation: { min: 0 } },
        { name: 'dnaVolume', label: 'DNA体积(μL)', type: 'number', required: true, validation: { min: 0 } },
        { name: 'purity260_280', label: '纯度(A260/A280)', type: 'number', required: false, validation: { min: 1.6, max: 2.2 } }
      ]
    },
    {
      id: 'pcr_quick',
      name: 'PCR扩增快速记录',
      type: 'pcr_amplification',
      fields: [
        { name: 'sampleCode', label: '样本编号', type: 'input', required: true },
        { name: 'pcrProduct', label: 'PCR产物浓度(ng/μL)', type: 'number', required: true, validation: { min: 0 } },
        { name: 'amplificationSuccess', label: '扩增成功', type: 'select', required: true, options: ['成功', '失败', '部分成功'] },
        { name: 'bandSize', label: '条带大小(bp)', type: 'number', required: false, validation: { min: 50 } }
      ]
    },
    {
      id: 'library_quick',
      name: '文库构建快速记录',
      type: 'library_construction',
      fields: [
        { name: 'sampleCode', label: '样本编号', type: 'input', required: true },
        { name: 'libraryConcentration', label: '文库浓度(ng/μL)', type: 'number', required: true, validation: { min: 0 } },
        { name: 'fragmentSize', label: '片段大小(bp)', type: 'number', required: true, validation: { min: 100 } },
        { name: 'qcStatus', label: '质控状态', type: 'select', required: true, options: ['通过', '警告', '失败'] }
      ]
    }
  ];

  // 检测设备类型
  useEffect(() => {
    const checkDeviceType = () => {
      const width = window.innerWidth;
      if (width < 768) {
        setDeviceType('mobile');
      } else if (width < 1024) {
        setDeviceType('tablet');
      } else {
        setDeviceType('desktop');
      }
    };

    checkDeviceType();
    window.addEventListener('resize', checkDeviceType);
    return () => window.removeEventListener('resize', checkDeviceType);
  }, []);

  // 监听网络状态
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      message.success('网络连接已恢复');
      // 自动同步离线数据
      if (offlineRecords.length > 0) {
        syncOfflineRecords();
      }
    };

    const handleOffline = () => {
      setIsOnline(false);
      message.warning('网络连接已断开，将启用离线模式');
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [offlineRecords]);

  // 自动保存功能
  useEffect(() => {
    if (!autoSaveEnabled || !unsavedChanges) return;

    const timer = setInterval(() => {
      if (unsavedChanges) {
        handleAutoSave();
      }
    }, autoSaveInterval * 1000);

    return () => clearInterval(timer);
  }, [autoSaveEnabled, unsavedChanges, autoSaveInterval]);

  /**
   * 获取记录类型文本
   * @param type 记录类型
   * @returns 类型文本
   */
  const getRecordTypeText = (type: RecordType): string => {
    const typeMap = {
      nucleic_extraction: '核酸提取',
      pcr_amplification: 'PCR扩增',
      library_construction: '文库构建',
      sequencing: '测序',
      analysis: '分析'
    };
    return typeMap[type] || type;
  };

  /**
   * 获取数据状态颜色
   * @param status 数据状态
   * @returns 颜色
   */
  const getStatusColor = (status: DataStatus): string => {
    const colorMap = {
      draft: '#faad14',
      saved: '#52c41a',
      synced: '#1890ff',
      error: '#ff4d4f'
    };
    return colorMap[status] || '#666666';
  };

  /**
   * 获取数据状态文本
   * @param status 数据状态
   * @returns 状态文本
   */
  const getStatusText = (status: DataStatus): string => {
    const textMap = {
      draft: '草稿',
      saved: '已保存',
      synced: '已同步',
      error: '错误'
    };
    return textMap[status] || status;
  };

  /**
   * 数据验证
   * @param values 表单值
   * @returns 验证结果
   */
  const validateData = useCallback((values: any): ValidationResult[] => {
    const results: ValidationResult[] = [];

    // 根据记录类型进行不同的验证
    switch (recordType) {
      case 'nucleic_extraction':
        // DNA浓度验证
        if (values.dnaConcentration !== undefined) {
          if (values.dnaConcentration < 10) {
            results.push({
              field: 'dnaConcentration',
              level: 'warning',
              message: 'DNA浓度较低，可能影响后续实验',
              suggestion: '建议重新提取或浓缩样本'
            });
          }
          if (values.dnaConcentration > 1000) {
            results.push({
              field: 'dnaConcentration',
              level: 'error',
              message: 'DNA浓度异常高，请检查测量结果',
              suggestion: '建议重新测量或稀释样本'
            });
          }
        }

        // 纯度验证
        if (values.purity260_280 !== undefined) {
          if (values.purity260_280 < 1.6 || values.purity260_280 > 2.2) {
            results.push({
              field: 'purity260_280',
              level: 'warning',
              message: 'DNA纯度不在理想范围内(1.8-2.0)',
              suggestion: '建议检查提取过程或重新纯化'
            });
          }
        }
        break;

      case 'pcr_amplification':
        // PCR产物浓度验证
        if (values.pcrProduct !== undefined && values.pcrProduct < 5) {
          results.push({
            field: 'pcrProduct',
            level: 'warning',
            message: 'PCR产物浓度较低',
            suggestion: '建议检查PCR条件或重新扩增'
          });
        }
        break;

      case 'library_construction':
        // 文库浓度验证
        if (values.libraryConcentration !== undefined && values.libraryConcentration < 2) {
          results.push({
            field: 'libraryConcentration',
            level: 'error',
            message: '文库浓度过低，无法进行测序',
            suggestion: '建议重新构建文库或浓缩样本'
          });
        }

        // 片段大小验证
        if (values.fragmentSize !== undefined) {
          if (values.fragmentSize < 200 || values.fragmentSize > 800) {
            results.push({
              field: 'fragmentSize',
              level: 'warning',
              message: '片段大小不在推荐范围内(200-800bp)',
              suggestion: '建议调整片段化条件'
            });
          }
        }
        break;
    }

    return results;
  }, [recordType]);

  /**
   * 处理表单值变更
   * @param changedValues 变更的值
   * @param allValues 所有值
   */
  const handleFormChange = useCallback((changedValues: any, allValues: any) => {
    setUnsavedChanges(true);
    
    // 实时验证
    const validationResults = validateData(allValues);
    setValidationResults(validationResults);

    // 触发数据变更回调
    if (onDataChange) {
      onDataChange(allValues);
    }
  }, [validateData, onDataChange]);

  /**
   * 自动保存
   */
  const handleAutoSave = useCallback(async () => {
    try {
      const values = mainForm.getFieldsValue();
      
      // 创建草稿记录
      const draftRecord: DataRecord = {
        id: currentRecord?.id || `draft_${Date.now()}`,
        type: recordType,
        stepName,
        sampleId: sampleId || '',
        sampleCode: values.sampleCode || '',
        data: values,
        status: 'draft',
        operator: '当前用户',
        createTime: currentRecord?.createTime || dayjs().format('YYYY-MM-DD HH:mm:ss'),
        updateTime: dayjs().format('YYYY-MM-DD HH:mm:ss'),
        version: (currentRecord?.version || 0) + 1
      };

      // 保存到本地存储
      localStorage.setItem(`draft_${draftRecord.id}`, JSON.stringify(draftRecord));
      
      setCurrentRecord(draftRecord);
      setLastSaveTime(dayjs().format('HH:mm:ss'));
      setUnsavedChanges(false);

      // 显示自动保存提示
      notification.open({
        message: '自动保存成功',
        description: `草稿已保存到本地 ${dayjs().format('HH:mm:ss')}`,
        icon: <SaveOutlined style={{ color: '#52c41a' }} />,
        duration: 2,
        placement: 'bottomRight'
      });

    } catch (error) {
      console.error('自动保存失败:', error);
    }
  }, [mainForm, currentRecord, recordType, stepName, sampleId]);

  /**
   * 手动保存
   */
  const handleSave = async () => {
    try {
      setSaving(true);
      
      const values = await mainForm.validateFields();
      
      // 验证数据
      const validationResults = validateData(values);
      const hasErrors = validationResults.some(r => r.level === 'error');
      
      if (hasErrors) {
        message.error('数据验证失败，请检查错误信息');
        return;
      }

      // 创建保存记录
      const savedRecord: DataRecord = {
        id: currentRecord?.id || `record_${Date.now()}`,
        type: recordType,
        stepName,
        sampleId: sampleId || '',
        sampleCode: values.sampleCode || '',
        data: values,
        status: isOnline ? 'saved' : 'draft',
        operator: '当前用户',
        createTime: currentRecord?.createTime || dayjs().format('YYYY-MM-DD HH:mm:ss'),
        updateTime: dayjs().format('YYYY-MM-DD HH:mm:ss'),
        version: (currentRecord?.version || 0) + 1
      };

      if (isOnline) {
        // 在线保存到服务器
        await new Promise(resolve => setTimeout(resolve, 1000)); // 模拟网络请求
        savedRecord.status = 'synced';
        savedRecord.syncTime = dayjs().format('YYYY-MM-DD HH:mm:ss');
        
        message.success('数据保存成功');
        if (onSaveSuccess) {
          onSaveSuccess(savedRecord);
        }
      } else {
        // 离线保存到本地
        setOfflineRecords(prev => [...prev, savedRecord]);
        message.success('数据已保存到本地，将在网络恢复后同步');
      }

      setCurrentRecord(savedRecord);
      setUnsavedChanges(false);
      setLastSaveTime(dayjs().format('HH:mm:ss'));

    } catch (error) {
      console.error('保存失败:', error);
      message.error('保存失败，请重试');
      if (onSaveError) {
        onSaveError(error as Error);
      }
    } finally {
      setSaving(false);
    }
  };

  /**
   * 同步离线记录
   */
  const syncOfflineRecords = async () => {
    if (offlineRecords.length === 0) return;

    try {
      setSyncing(true);
      
      // 模拟同步过程
      for (const record of offlineRecords) {
        await new Promise(resolve => setTimeout(resolve, 500));
        record.status = 'synced';
        record.syncTime = dayjs().format('YYYY-MM-DD HH:mm:ss');
      }

      message.success(`成功同步 ${offlineRecords.length} 条离线记录`);
      setOfflineRecords([]);

    } catch (error) {
      console.error('同步失败:', error);
      message.error('同步失败，请稍后重试');
    } finally {
      setSyncing(false);
    }
  };

  /**
   * 快速记录
   * @param values 表单值
   */
  const handleQuickRecord = async (values: any) => {
    try {
      setLoading(true);
      
      // 模拟快速保存
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const quickRecord: DataRecord = {
        id: `quick_${Date.now()}`,
        type: recordType,
        stepName: '快速记录',
        sampleId: sampleId || '',
        sampleCode: values.sampleCode || '',
        data: values,
        status: isOnline ? 'saved' : 'draft',
        operator: '当前用户',
        createTime: dayjs().format('YYYY-MM-DD HH:mm:ss'),
        updateTime: dayjs().format('YYYY-MM-DD HH:mm:ss'),
        version: 1
      };

      if (!isOnline) {
        setOfflineRecords(prev => [...prev, quickRecord]);
      }

      message.success('快速记录成功');
      setQuickRecordVisible(false);
      quickForm.resetFields();

    } catch (error) {
      message.error('快速记录失败');
    } finally {
      setLoading(false);
    }
  };

  /**
   * 获取当前快速记录模板
   */
  const getCurrentTemplate = (): QuickRecordTemplate | undefined => {
    return quickRecordTemplates.find(t => t.type === recordType);
  };

  // 渲染验证结果
  const renderValidationResults = () => {
    if (validationResults.length === 0) return null;

    return (
      <Card size="small" style={{ marginBottom: 16 }}>
        <Title level={5}>数据验证结果</Title>
        <Space direction="vertical" style={{ width: '100%' }}>
          {validationResults.map((result, index) => (
            <Alert
              key={index}
              type={result.level === 'error' ? 'error' : result.level === 'warning' ? 'warning' : 'info'}
              message={result.message}
              description={result.suggestion}
              showIcon
              closable
            />
          ))}
        </Space>
      </Card>
    );
  };

  // 渲染状态栏
  const renderStatusBar = () => (
    <Card size="small" style={{ marginBottom: 16 }}>
      <Row gutter={16} align="middle">
        <Col span={6}>
          <Space>
            <Badge 
              status={isOnline ? 'success' : 'error'} 
              text={isOnline ? '在线' : '离线'}
            />
            {isOnline ? <WifiOutlined /> : <DisconnectOutlined />}
          </Space>
        </Col>
        <Col span={6}>
          <Space>
            <Text type="secondary">状态:</Text>
            <Tag color={getStatusColor(currentRecord?.status || 'draft')}>
              {getStatusText(currentRecord?.status || 'draft')}
            </Tag>
          </Space>
        </Col>
        <Col span={6}>
          <Space>
            <Text type="secondary">设备:</Text>
            <Tag>
              {deviceType === 'mobile' ? <MobileOutlined /> : <DesktopOutlined />}
              {deviceType === 'mobile' ? '移动端' : deviceType === 'tablet' ? '平板' : '桌面端'}
            </Tag>
          </Space>
        </Col>
        <Col span={6}>
          {lastSaveTime && (
            <Space>
              <Text type="secondary">最后保存:</Text>
              <Text>{lastSaveTime}</Text>
            </Space>
          )}
        </Col>
      </Row>
    </Card>
  );

  // 移动端布局
  if (isMobile || deviceType === 'mobile') {
    return (
      <div style={{ padding: '16px' }}>
        {/* 移动端标题栏 */}
        <Card size="small" style={{ marginBottom: 16 }}>
          <Row align="middle" justify="space-between">
            <Col>
              <Title level={4} style={{ margin: 0 }}>
                <ExperimentOutlined style={{ marginRight: 8 }} />
                {getRecordTypeText(recordType)}
              </Title>
            </Col>
            <Col>
              <Space>
                <Button
                  type="primary"
                  size="small"
                  icon={<SaveOutlined />}
                  loading={saving}
                  onClick={handleSave}
                >
                  保存
                </Button>
                {enableQuickRecord && (
                  <Button
                    size="small"
                    icon={<ThunderboltOutlined />}
                    onClick={() => setQuickRecordVisible(true)}
                  >
                    快速
                  </Button>
                )}
              </Space>
            </Col>
          </Row>
        </Card>

        {/* 状态栏 */}
        {renderStatusBar()}

        {/* 验证结果 */}
        {renderValidationResults()}

        {/* 主表单 - 移动端优化 */}
        <Card>
          <Form
            form={mainForm}
            layout="vertical"
            onValuesChange={handleFormChange}
            size="large"
          >
            {/* 根据记录类型渲染不同的表单字段 */}
            {recordType === 'nucleic_extraction' && (
              <>
                <Form.Item
                  name="sampleCode"
                  label="样本编号"
                  rules={[{ required: true, message: '请输入样本编号' }]}
                >
                  <Input 
                    placeholder="扫描或输入样本编号" 
                    suffix={<BarcodeOutlined />}
                  />
                </Form.Item>
                <Form.Item
                  name="dnaConcentration"
                  label="DNA浓度(ng/μL)"
                  rules={[{ required: true, message: '请输入DNA浓度' }]}
                >
                  <InputNumber
                    placeholder="请输入DNA浓度"
                    min={0}
                    precision={1}
                    style={{ width: '100%' }}
                  />
                </Form.Item>
                <Form.Item
                  name="dnaVolume"
                  label="DNA体积(μL)"
                  rules={[{ required: true, message: '请输入DNA体积' }]}
                >
                  <InputNumber
                    placeholder="请输入DNA体积"
                    min={0}
                    precision={1}
                    style={{ width: '100%' }}
                  />
                </Form.Item>
                <Form.Item name="purity260_280" label="纯度(A260/A280)">
                  <InputNumber
                    placeholder="请输入纯度比值"
                    min={0}
                    max={5}
                    precision={2}
                    style={{ width: '100%' }}
                  />
                </Form.Item>
              </>
            )}

            {recordType === 'pcr_amplification' && (
              <>
                <Form.Item
                  name="sampleCode"
                  label="样本编号"
                  rules={[{ required: true, message: '请输入样本编号' }]}
                >
                  <Input 
                    placeholder="扫描或输入样本编号" 
                    suffix={<BarcodeOutlined />}
                  />
                </Form.Item>
                <Form.Item
                  name="pcrProduct"
                  label="PCR产物浓度(ng/μL)"
                  rules={[{ required: true, message: '请输入PCR产物浓度' }]}
                >
                  <InputNumber
                    placeholder="请输入PCR产物浓度"
                    min={0}
                    precision={1}
                    style={{ width: '100%' }}
                  />
                </Form.Item>
                <Form.Item
                  name="amplificationSuccess"
                  label="扩增结果"
                  rules={[{ required: true, message: '请选择扩增结果' }]}
                >
                  <Select placeholder="请选择扩增结果">
                    <Option value="success">成功</Option>
                    <Option value="failed">失败</Option>
                    <Option value="partial">部分成功</Option>
                  </Select>
                </Form.Item>
              </>
            )}

            {recordType === 'library_construction' && (
              <>
                <Form.Item
                  name="sampleCode"
                  label="样本编号"
                  rules={[{ required: true, message: '请输入样本编号' }]}
                >
                  <Input 
                    placeholder="扫描或输入样本编号" 
                    suffix={<BarcodeOutlined />}
                  />
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
                  name="fragmentSize"
                  label="片段大小(bp)"
                  rules={[{ required: true, message: '请输入片段大小' }]}
                >
                  <InputNumber
                    placeholder="请输入片段大小"
                    min={0}
                    style={{ width: '100%' }}
                  />
                </Form.Item>
                <Form.Item
                  name="qcStatus"
                  label="质控状态"
                  rules={[{ required: true, message: '请选择质控状态' }]}
                >
                  <Select placeholder="请选择质控状态">
                    <Option value="pass">通过</Option>
                    <Option value="warning">警告</Option>
                    <Option value="fail">失败</Option>
                  </Select>
                </Form.Item>
              </>
            )}

            <Form.Item name="notes" label="备注">
              <TextArea rows={3} placeholder="请输入备注信息" />
            </Form.Item>
          </Form>
        </Card>

        {/* 快速记录抽屉 */}
        <Drawer
          title="快速记录"
          placement="bottom"
          height="70%"
          open={quickRecordVisible}
          onClose={() => setQuickRecordVisible(false)}
        >
          {getCurrentTemplate() && (
            <Form
              form={quickForm}
              layout="vertical"
              onFinish={handleQuickRecord}
              size="large"
            >
              {getCurrentTemplate()!.fields.map(field => (
                <Form.Item
                  key={field.name}
                  name={field.name}
                  label={field.label}
                  rules={field.required ? [{ required: true, message: `请输入${field.label}` }] : []}
                >
                  {field.type === 'input' && (
                    <Input placeholder={`请输入${field.label}`} />
                  )}
                  {field.type === 'number' && (
                    <InputNumber
                      placeholder={`请输入${field.label}`}
                      min={field.validation?.min}
                      max={field.validation?.max}
                      style={{ width: '100%' }}
                    />
                  )}
                  {field.type === 'select' && (
                    <Select placeholder={`请选择${field.label}`}>
                      {field.options?.map(option => (
                        <Option key={option} value={option}>{option}</Option>
                      ))}
                    </Select>
                  )}
                  {field.type === 'textarea' && (
                    <TextArea rows={3} placeholder={`请输入${field.label}`} />
                  )}
                </Form.Item>
              ))}
              
              <Form.Item>
                <Button type="primary" htmlType="submit" block loading={loading}>
                  快速保存
                </Button>
              </Form.Item>
            </Form>
          )}
        </Drawer>

        {/* 浮动按钮 */}
        <FloatButton.Group>
          <FloatButton
            icon={<SaveOutlined />}
            tooltip="保存数据"
            onClick={handleSave}
          />
          {enableQuickRecord && (
            <FloatButton
              icon={<ThunderboltOutlined />}
              tooltip="快速记录"
              onClick={() => setQuickRecordVisible(true)}
            />
          )}
          {offlineRecords.length > 0 && (
            <FloatButton
              icon={<CloudSyncOutlined />}
              tooltip={`同步${offlineRecords.length}条离线记录`}
              onClick={syncOfflineRecords}
            />
          )}
          <FloatButton
            icon={<SettingOutlined />}
            tooltip="设置"
            onClick={() => setSettingsVisible(true)}
          />
        </FloatButton.Group>
      </div>
    );
  }

  // 桌面端布局
  return (
    <div style={{ padding: '24px' }}>
      {/* 桌面端标题栏 */}
      <Card style={{ marginBottom: 24 }}>
        <Row gutter={16} align="middle">
          <Col span={16}>
            <Title level={3} style={{ margin: 0 }}>
              <ExperimentOutlined style={{ marginRight: 8 }} />
              {getRecordTypeText(recordType)} - {stepName}
            </Title>
            <Text type="secondary">
              🔬 实时数据记录与验证系统
            </Text>
          </Col>
          <Col span={8} style={{ textAlign: 'right' }}>
            <Space>
              <Switch
                checkedChildren="自动保存"
                unCheckedChildren="手动保存"
                checked={autoSaveEnabled}
                onChange={setAutoSaveEnabled}
              />
              {enableQuickRecord && (
                <Button
                  icon={<ThunderboltOutlined />}
                  onClick={() => setQuickRecordVisible(true)}
                >
                  快速记录
                </Button>
              )}
              <Button
                type="primary"
                icon={<SaveOutlined />}
                loading={saving}
                onClick={handleSave}
              >
                保存数据
              </Button>
            </Space>
          </Col>
        </Row>
      </Card>

      {/* 状态栏 */}
      {renderStatusBar()}

      {/* 验证结果 */}
      {renderValidationResults()}

      <Row gutter={16}>
        <Col span={18}>
          {/* 主表单 */}
          <Card title="数据录入" extra={
            <Space>
              <Text type="secondary">
                {unsavedChanges && <Badge status="warning" text="有未保存的更改" />}
              </Text>
              <Button size="small" icon={<ReloadOutlined />}>重置</Button>
            </Space>
          }>
            <Form
              form={mainForm}
              layout="vertical"
              onValuesChange={handleFormChange}
            >
              {/* 根据记录类型渲染表单 */}
              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item
                    name="sampleCode"
                    label="样本编号"
                    rules={[{ required: true, message: '请输入样本编号' }]}
                  >
                    <Input 
                      placeholder="扫描或输入样本编号" 
                      suffix={<BarcodeOutlined />}
                    />
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

              {/* 根据记录类型显示不同字段 */}
              {recordType === 'nucleic_extraction' && (
                <Row gutter={16}>
                  <Col span={8}>
                    <Form.Item
                      name="dnaConcentration"
                      label="DNA浓度(ng/μL)"
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
                      name="dnaVolume"
                      label="DNA体积(μL)"
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
                  <Col span={8}>
                    <Form.Item name="purity260_280" label="纯度(A260/A280)">
                      <InputNumber
                        placeholder="请输入纯度比值"
                        min={0}
                        max={5}
                        precision={2}
                        style={{ width: '100%' }}
                      />
                    </Form.Item>
                  </Col>
                </Row>
              )}

              <Form.Item name="notes" label="备注">
                <TextArea rows={4} placeholder="请输入备注信息" />
              </Form.Item>
            </Form>
          </Card>
        </Col>

        <Col span={6}>
          {/* 侧边栏 */}
          <Space direction="vertical" style={{ width: '100%' }}>
            {/* 操作面板 */}
            <Card title="操作面板" size="small">
              <Space direction="vertical" style={{ width: '100%' }}>
                <Button block icon={<CameraOutlined />}>拍照记录</Button>
                <Button block icon={<UploadOutlined />}>上传附件</Button>
                <Button block icon={<FileTextOutlined />}>生成报告</Button>
                <Button block icon={<DownloadOutlined />}>导出数据</Button>
              </Space>
            </Card>

            {/* 离线记录 */}
            {offlineRecords.length > 0 && (
              <Card title="离线记录" size="small">
                <Space direction="vertical" style={{ width: '100%' }}>
                  <Text type="secondary">
                    有 {offlineRecords.length} 条记录待同步
                  </Text>
                  <Button
                    block
                    type="primary"
                    icon={<CloudSyncOutlined />}
                    loading={syncing}
                    onClick={syncOfflineRecords}
                    disabled={!isOnline}
                  >
                    同步到服务器
                  </Button>
                </Space>
              </Card>
            )}

            {/* 数据统计 */}
            <Card title="数据统计" size="small">
              <Space direction="vertical" style={{ width: '100%' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Text>今日记录:</Text>
                  <Text strong>12</Text>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Text>成功率:</Text>
                  <Text strong style={{ color: '#52c41a' }}>95%</Text>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Text>平均时间:</Text>
                  <Text strong>3.2分钟</Text>
                </div>
              </Space>
            </Card>
          </Space>
        </Col>
      </Row>

      {/* 快速记录模态框 */}
      <Modal
        title="快速记录"
        open={quickRecordVisible}
        onCancel={() => setQuickRecordVisible(false)}
        footer={null}
        width={600}
      >
        {getCurrentTemplate() && (
          <Form
            form={quickForm}
            layout="vertical"
            onFinish={handleQuickRecord}
          >
            <Row gutter={16}>
              {getCurrentTemplate()!.fields.map(field => (
                <Col span={field.type === 'textarea' ? 24 : 12} key={field.name}>
                  <Form.Item
                    name={field.name}
                    label={field.label}
                    rules={field.required ? [{ required: true, message: `请输入${field.label}` }] : []}
                  >
                    {field.type === 'input' && (
                      <Input placeholder={`请输入${field.label}`} />
                    )}
                    {field.type === 'number' && (
                      <InputNumber
                        placeholder={`请输入${field.label}`}
                        min={field.validation?.min}
                        max={field.validation?.max}
                        style={{ width: '100%' }}
                      />
                    )}
                    {field.type === 'select' && (
                      <Select placeholder={`请选择${field.label}`}>
                        {field.options?.map(option => (
                          <Option key={option} value={option}>{option}</Option>
                        ))}
                      </Select>
                    )}
                    {field.type === 'textarea' && (
                      <TextArea rows={3} placeholder={`请输入${field.label}`} />
                    )}
                  </Form.Item>
                </Col>
              ))}
            </Row>
            
            <Form.Item style={{ textAlign: 'right', marginBottom: 0 }}>
              <Space>
                <Button onClick={() => setQuickRecordVisible(false)}>
                  取消
                </Button>
                <Button type="primary" htmlType="submit" loading={loading}>
                  快速保存
                </Button>
              </Space>
            </Form.Item>
          </Form>
        )}
      </Modal>
    </div>
  );
};

export default ExperimentDataRecorder;