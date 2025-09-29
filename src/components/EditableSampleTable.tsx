/**
 * 可编辑样本表格组件
 * 
 * 功能说明：
 * - 支持批量样本数据录入和编辑
 * - 提供实时数据验证和错误提示
 * - 支持表格内联编辑和批量操作
 * - 集成条码扫描和快速录入功能
 * - 支持数据导入导出和模板下载
 * - 提供移动端优化的编辑界面
 * 
 * @author 系统
 * @version 2.0.0
 */

import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  Table,
  Form,
  Input,
  InputNumber,
  Select,
  DatePicker,
  Button,
  Space,
  Typography,
  message,
  Modal,
  Drawer,
  Popconfirm,
  Tooltip,
  Tag,
  Badge,
  Alert,
  Upload,
  Progress,
  Card,
  Row,
  Col,
  Divider,
  Switch,
  Checkbox,
  Radio,
  TimePicker,
  Slider,
  Rate,
  AutoComplete,
  Mentions,
  Cascader,
  TreeSelect,
  Transfer,
  Tabs,
  Steps,
  Result,
  Spin,
  Empty,
  Affix,
  BackTop,
  FloatButton,
  Segmented,
  ColorPicker,
  QRCode
} from 'antd';
import {
  EditOutlined,
  DeleteOutlined,
  PlusOutlined,
  SaveOutlined,
  ReloadOutlined,
  UploadOutlined,
  DownloadOutlined,
  CopyOutlined,
  CheckOutlined,
  CloseOutlined,
  ExclamationCircleOutlined,
  InfoCircleOutlined,
  WarningOutlined,
  BarcodeOutlined,
  ScanOutlined,
  FileExcelOutlined,
  FileTextOutlined,
  PrinterOutlined,
  ShareAltOutlined,
  FilterOutlined,
  SortAscendingOutlined,
  SortDescendingOutlined,
  EyeOutlined,
  EyeInvisibleOutlined,
  SettingOutlined,
  QuestionCircleOutlined,
  BulbOutlined,
  ThunderboltOutlined,
  RocketOutlined,
  StarOutlined,
  HeartOutlined,
  LikeOutlined,
  DislikeOutlined,
  CommentOutlined,
  MessageOutlined,
  PhoneOutlined,
  MailOutlined,
  HomeOutlined,
  ShopOutlined,
  BankOutlined,
  CarOutlined,
  EnvironmentOutlined,
  CalendarOutlined,
  ClockCircleOutlined,
  UserOutlined,
  TeamOutlined,
  CrownOutlined,
  SafetyOutlined,
  LockOutlined,
  UnlockOutlined,
  KeyOutlined,
  ShieldOutlined,
  FireOutlined,
  BugOutlined,
  RobotOutlined,
  ExperimentOutlined,
  DatabaseOutlined,
  CloudOutlined,
  WifiOutlined,
  DisconnectOutlined,
  SyncOutlined,
  LoadingOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  MinusCircleOutlined,
  PlusCircleOutlined,
  PlayCircleOutlined,
  PauseCircleOutlined,
  StopOutlined,
  ForwardOutlined,
  BackwardOutlined,
  StepForwardOutlined,
  StepBackwardOutlined,
  FastForwardOutlined,
  FastBackwardOutlined,
  VerticalAlignTopOutlined,
  VerticalAlignBottomOutlined,
  VerticalAlignMiddleOutlined,
  AlignLeftOutlined,
  AlignCenterOutlined,
  AlignRightOutlined,
  BoldOutlined,
  ItalicOutlined,
  UnderlineOutlined,
  StrikethroughOutlined,
  FontSizeOutlined,
  FontColorsOutlined,
  HighlightOutlined,
  BgColorsOutlined,
  FormatPainterOutlined,
  ClearOutlined,
  ScissorOutlined,
  SnippetsOutlined,
  DiffOutlined,
  CodeOutlined,
  BlockOutlined,
  BuildOutlined,
  ToolOutlined,
  ApiOutlined,
  BranchesOutlined,
  DeploymentUnitOutlined,
  GoldOutlined,
  HddOutlined,
  LaptopOutlined,
  MobileOutlined,
  TabletOutlined,
  DesktopOutlined
} from '@ant-design/icons';
import type { ColumnsType, TableProps } from 'antd/es/table';
import type { FormInstance } from 'antd/es/form';
import type { UploadProps } from 'antd/es/upload';
import dayjs from 'dayjs';

const { Title, Text, Paragraph } = Typography;
const { Option } = Select;
const { TextArea } = Input;
const { TabPane } = Tabs;
const { Step } = Steps;
const { Dragger } = Upload;

/**
 * 样本数据接口定义
 */
interface SampleData {
  id: string;
  sampleCode: string;
  sampleType: string;
  position?: string;
  concentration?: number;
  volume?: number;
  purity?: number;
  quality?: 'excellent' | 'good' | 'fair' | 'poor';
  status: 'pending' | 'processing' | 'completed' | 'failed';
  operator?: string;
  createTime: string;
  updateTime: string;
  notes?: string;
  [key: string]: any;
}

/**
 * 列配置接口定义
 */
interface ColumnConfig {
  key: string;
  title: string;
  dataType: 'text' | 'number' | 'select' | 'date' | 'boolean' | 'textarea';
  required?: boolean;
  editable?: boolean;
  width?: number;
  options?: string[];
  validation?: {
    min?: number;
    max?: number;
    pattern?: string;
    message?: string;
  };
  render?: (value: any, record: SampleData) => React.ReactNode;
}

/**
 * 验证规则接口定义
 */
interface ValidationRule {
  field: string;
  rule: (value: any, record: SampleData) => boolean;
  message: string;
  level: 'error' | 'warning' | 'info';
}

/**
 * 批量操作接口定义
 */
interface BatchOperation {
  key: string;
  label: string;
  icon: React.ReactNode;
  action: (selectedRows: SampleData[]) => void;
  confirm?: boolean;
  disabled?: (selectedRows: SampleData[]) => boolean;
}

/**
 * 组件属性接口定义
 */
interface EditableSampleTableProps {
  /** 样本数据 */
  dataSource: SampleData[];
  /** 列配置 */
  columns: ColumnConfig[];
  /** 验证规则 */
  validationRules?: ValidationRule[];
  /** 是否可编辑 */
  editable?: boolean;
  /** 是否支持批量操作 */
  batchOperations?: BatchOperation[];
  /** 是否支持导入导出 */
  enableImportExport?: boolean;
  /** 是否支持条码扫描 */
  enableBarcodeScanning?: boolean;
  /** 是否移动端模式 */
  isMobile?: boolean;
  /** 表格大小 */
  size?: 'small' | 'middle' | 'large';
  /** 分页配置 */
  pagination?: TableProps<SampleData>['pagination'];
  /** 数据变更回调 */
  onChange?: (dataSource: SampleData[]) => void;
  /** 行选择回调 */
  onRowSelect?: (selectedRows: SampleData[]) => void;
  /** 数据验证回调 */
  onValidate?: (errors: Array<{ record: SampleData; field: string; message: string }>) => void;
}

/**
 * 可编辑单元格组件
 */
interface EditableCellProps extends React.HTMLAttributes<HTMLElement> {
  editing: boolean;
  dataIndex: string;
  title: any;
  inputType: 'number' | 'text' | 'select' | 'date' | 'textarea';
  record: SampleData;
  index: number;
  children: React.ReactNode;
  options?: string[];
  validation?: ColumnConfig['validation'];
}

const EditableCell: React.FC<EditableCellProps> = ({
  editing,
  dataIndex,
  title,
  inputType,
  record,
  index,
  children,
  options,
  validation,
  ...restProps
}) => {
  const getInputNode = () => {
    switch (inputType) {
      case 'number':
        return (
          <InputNumber
            min={validation?.min}
            max={validation?.max}
            precision={2}
            style={{ width: '100%' }}
          />
        );
      case 'select':
        return (
          <Select style={{ width: '100%' }}>
            {options?.map(option => (
              <Option key={option} value={option}>{option}</Option>
            ))}
          </Select>
        );
      case 'date':
        return <DatePicker style={{ width: '100%' }} />;
      case 'textarea':
        return <TextArea rows={2} />;
      default:
        return <Input />;
    }
  };

  const rules = [];
  if (validation?.pattern) {
    rules.push({
      pattern: new RegExp(validation.pattern),
      message: validation.message || '格式不正确'
    });
  }
  if (validation?.min !== undefined || validation?.max !== undefined) {
    rules.push({
      validator: (_: any, value: any) => {
        if (value === undefined || value === null || value === '') {
          return Promise.resolve();
        }
        const num = Number(value);
        if (validation?.min !== undefined && num < validation.min) {
          return Promise.reject(new Error(`最小值为 ${validation.min}`));
        }
        if (validation?.max !== undefined && num > validation.max) {
          return Promise.reject(new Error(`最大值为 ${validation.max}`));
        }
        return Promise.resolve();
      }
    });
  }

  return (
    <td {...restProps}>
      {editing ? (
        <Form.Item
          name={dataIndex}
          style={{ margin: 0 }}
          rules={rules}
        >
          {getInputNode()}
        </Form.Item>
      ) : (
        children
      )}
    </td>
  );
};

/**
 * 可编辑样本表格组件
 * 
 * @param props 组件属性
 * @returns {JSX.Element} 可编辑表格界面
 */
const EditableSampleTable: React.FC<EditableSampleTableProps> = ({
  dataSource,
  columns,
  validationRules = [],
  editable = true,
  batchOperations = [],
  enableImportExport = true,
  enableBarcodeScanning = true,
  isMobile = false,
  size = 'middle',
  pagination,
  onChange,
  onRowSelect,
  onValidate
}) => {
  // 状态管理
  const [form] = Form.useForm();
  const [data, setData] = useState<SampleData[]>(dataSource);
  const [editingKey, setEditingKey] = useState('');
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
  const [selectedRows, setSelectedRows] = useState<SampleData[]>([]);
  const [loading, setLoading] = useState(false);
  const [validationErrors, setValidationErrors] = useState<Array<{ record: SampleData; field: string; message: string }>>([]);
  const [importModalVisible, setImportModalVisible] = useState(false);
  const [exportModalVisible, setExportModalVisible] = useState(false);
  const [scannerVisible, setScannerVisible] = useState(false);
  const [filterVisible, setFilterVisible] = useState(false);
  const [settingsVisible, setSettingsVisible] = useState(false);
  const [columnVisibility, setColumnVisibility] = useState<Record<string, boolean>>({});
  const [quickAddVisible, setQuickAddVisible] = useState(false);
  const [batchEditVisible, setBatchEditVisible] = useState(false);
  const [templateModalVisible, setTemplateModalVisible] = useState(false);

  // 引用
  const tableRef = useRef<any>(null);

  // 初始化列可见性
  useEffect(() => {
    const visibility: Record<string, boolean> = {};
    columns.forEach(col => {
      visibility[col.key] = true;
    });
    setColumnVisibility(visibility);
  }, [columns]);

  // 同步数据源
  useEffect(() => {
    setData(dataSource);
  }, [dataSource]);

  /**
   * 判断是否正在编辑
   * @param record 记录
   * @returns 是否编辑中
   */
  const isEditing = (record: SampleData) => record.id === editingKey;

  /**
   * 开始编辑
   * @param record 记录
   */
  const edit = (record: Partial<SampleData> & { id: React.Key }) => {
    form.setFieldsValue({ ...record });
    setEditingKey(record.id);
  };

  /**
   * 取消编辑
   */
  const cancel = () => {
    setEditingKey('');
  };

  /**
   * 保存编辑
   * @param key 记录键
   */
  const save = async (key: React.Key) => {
    try {
      const row = (await form.validateFields()) as SampleData;
      const newData = [...data];
      const index = newData.findIndex(item => key === item.id);
      
      if (index > -1) {
        const item = newData[index];
        const updatedItem = {
          ...item,
          ...row,
          updateTime: dayjs().format('YYYY-MM-DD HH:mm:ss')
        };
        
        // 执行验证
        const errors = validateRecord(updatedItem);
        if (errors.length > 0) {
          setValidationErrors(prev => [
            ...prev.filter(e => e.record.id !== updatedItem.id),
            ...errors
          ]);
          if (onValidate) {
            onValidate(errors);
          }
        } else {
          setValidationErrors(prev => prev.filter(e => e.record.id !== updatedItem.id));
        }
        
        newData.splice(index, 1, updatedItem);
        setData(newData);
        setEditingKey('');
        
        if (onChange) {
          onChange(newData);
        }
        
        message.success('保存成功');
      }
    } catch (errInfo) {
      console.log('验证失败:', errInfo);
      message.error('保存失败，请检查输入');
    }
  };

  /**
   * 删除记录
   * @param key 记录键
   */
  const deleteRecord = (key: React.Key) => {
    const newData = data.filter(item => item.id !== key);
    setData(newData);
    setValidationErrors(prev => prev.filter(e => e.record.id !== key));
    
    if (onChange) {
      onChange(newData);
    }
    
    message.success('删除成功');
  };

  /**
   * 添加新记录
   */
  const addRecord = () => {
    const newRecord: SampleData = {
      id: `new_${Date.now()}`,
      sampleCode: '',
      sampleType: '',
      status: 'pending',
      createTime: dayjs().format('YYYY-MM-DD HH:mm:ss'),
      updateTime: dayjs().format('YYYY-MM-DD HH:mm:ss')
    };
    
    const newData = [...data, newRecord];
    setData(newData);
    
    if (onChange) {
      onChange(newData);
    }
    
    // 自动开始编辑新记录
    setTimeout(() => {
      edit(newRecord);
    }, 100);
  };

  /**
   * 验证单条记录
   * @param record 记录
   * @returns 验证错误
   */
  const validateRecord = (record: SampleData): Array<{ record: SampleData; field: string; message: string }> => {
    const errors: Array<{ record: SampleData; field: string; message: string }> = [];
    
    validationRules.forEach(rule => {
      const value = record[rule.field];
      if (!rule.rule(value, record)) {
        errors.push({
          record,
          field: rule.field,
          message: rule.message
        });
      }
    });
    
    return errors;
  };

  /**
   * 批量验证
   */
  const validateAllRecords = () => {
    const allErrors: Array<{ record: SampleData; field: string; message: string }> = [];
    
    data.forEach(record => {
      const errors = validateRecord(record);
      allErrors.push(...errors);
    });
    
    setValidationErrors(allErrors);
    
    if (onValidate) {
      onValidate(allErrors);
    }
    
    if (allErrors.length === 0) {
      message.success('所有数据验证通过');
    } else {
      message.warning(`发现 ${allErrors.length} 个验证错误`);
    }
  };

  /**
   * 行选择配置
   */
  const rowSelection = {
    selectedRowKeys,
    onChange: (newSelectedRowKeys: React.Key[], newSelectedRows: SampleData[]) => {
      setSelectedRowKeys(newSelectedRowKeys);
      setSelectedRows(newSelectedRows);
      
      if (onRowSelect) {
        onRowSelect(newSelectedRows);
      }
    },
    onSelectAll: (selected: boolean, selectedRows: SampleData[], changeRows: SampleData[]) => {
      console.log('全选:', selected, selectedRows, changeRows);
    },
    getCheckboxProps: (record: SampleData) => ({
      disabled: record.status === 'processing',
      name: record.sampleCode,
    }),
  };

  /**
   * 构建表格列
   */
  const buildTableColumns = (): ColumnsType<SampleData> => {
    const tableColumns: ColumnsType<SampleData> = columns
      .filter(col => columnVisibility[col.key])
      .map(col => {
        const column: any = {
          title: col.title,
          dataIndex: col.key,
          key: col.key,
          width: col.width,
          onCell: (record: SampleData) => ({
            record,
            inputType: col.dataType === 'number' ? 'number' : 
                      col.dataType === 'select' ? 'select' :
                      col.dataType === 'date' ? 'date' :
                      col.dataType === 'textarea' ? 'textarea' : 'text',
            dataIndex: col.key,
            title: col.title,
            editing: isEditing(record),
            options: col.options,
            validation: col.validation,
          }),
        };

        // 自定义渲染
        if (col.render) {
          column.render = col.render;
        } else {
          // 默认渲染逻辑
          column.render = (value: any, record: SampleData) => {
            // 显示验证错误
            const hasError = validationErrors.some(e => e.record.id === record.id && e.field === col.key);
            const errorInfo = validationErrors.find(e => e.record.id === record.id && e.field === col.key);
            
            let displayValue = value;
            
            // 根据数据类型格式化显示
            switch (col.dataType) {
              case 'date':
                displayValue = value ? dayjs(value).format('YYYY-MM-DD') : '';
                break;
              case 'boolean':
                displayValue = value ? '是' : '否';
                break;
              case 'number':
                displayValue = typeof value === 'number' ? value.toFixed(2) : value;
                break;
            }
            
            if (hasError) {
              return (
                <Tooltip title={errorInfo?.message}>
                  <span style={{ color: '#ff4d4f' }}>
                    {displayValue}
                    <ExclamationCircleOutlined style={{ marginLeft: 4 }} />
                  </span>
                </Tooltip>
              );
            }
            
            return displayValue;
          };
        }

        return column;
      });

    // 添加操作列
    if (editable) {
      tableColumns.push({
        title: '操作',
        key: 'action',
        width: 120,
        fixed: 'right',
        render: (_, record: SampleData) => {
          const editing = isEditing(record);
          return editing ? (
            <Space>
              <Button
                type="link"
                size="small"
                icon={<CheckOutlined />}
                onClick={() => save(record.id)}
              >
                保存
              </Button>
              <Button
                type="link"
                size="small"
                icon={<CloseOutlined />}
                onClick={cancel}
              >
                取消
              </Button>
            </Space>
          ) : (
            <Space>
              <Button
                type="link"
                size="small"
                icon={<EditOutlined />}
                disabled={editingKey !== ''}
                onClick={() => edit(record)}
              >
                编辑
              </Button>
              <Popconfirm
                title="确定删除这条记录吗？"
                onConfirm={() => deleteRecord(record.id)}
                okText="确定"
                cancelText="取消"
              >
                <Button
                  type="link"
                  size="small"
                  icon={<DeleteOutlined />}
                  danger
                >
                  删除
                </Button>
              </Popconfirm>
            </Space>
          );
        },
      });
    }

    return tableColumns;
  };

  /**
   * 导出数据
   * @param format 导出格式
   */
  const exportData = (format: 'excel' | 'csv' | 'json') => {
    const exportData = selectedRows.length > 0 ? selectedRows : data;
    
    // 这里应该调用实际的导出服务
    console.log(`导出 ${format} 格式数据:`, exportData);
    
    message.success(`正在导出 ${exportData.length} 条记录为 ${format.toUpperCase()} 格式`);
    setExportModalVisible(false);
  };

  /**
   * 导入数据
   */
  const handleImport: UploadProps['customRequest'] = (options) => {
    const { file, onSuccess, onError } = options;
    
    // 模拟文件解析
    setTimeout(() => {
      try {
        // 这里应该调用实际的文件解析服务
        const importedData: SampleData[] = [
          {
            id: `import_${Date.now()}_1`,
            sampleCode: 'IMP001',
            sampleType: '血液',
            status: 'pending',
            createTime: dayjs().format('YYYY-MM-DD HH:mm:ss'),
            updateTime: dayjs().format('YYYY-MM-DD HH:mm:ss')
          },
          {
            id: `import_${Date.now()}_2`,
            sampleCode: 'IMP002',
            sampleType: '唾液',
            status: 'pending',
            createTime: dayjs().format('YYYY-MM-DD HH:mm:ss'),
            updateTime: dayjs().format('YYYY-MM-DD HH:mm:ss')
          }
        ];
        
        const newData = [...data, ...importedData];
        setData(newData);
        
        if (onChange) {
          onChange(newData);
        }
        
        message.success(`成功导入 ${importedData.length} 条记录`);
        setImportModalVisible(false);
        
        if (onSuccess) {
          onSuccess('ok');
        }
      } catch (error) {
        message.error('导入失败，请检查文件格式');
        if (onError) {
          onError(error as Error);
        }
      }
    }, 1000);
  };

  /**
   * 条码扫描
   */
  const handleBarcodeScanning = () => {
    // 模拟条码扫描
    const scannedCode = `SCAN_${Date.now()}`;
    
    // 查找是否已存在该样本
    const existingRecord = data.find(record => record.sampleCode === scannedCode);
    
    if (existingRecord) {
      message.warning('该样本已存在');
      // 高亮显示已存在的记录
      setSelectedRowKeys([existingRecord.id]);
      setSelectedRows([existingRecord]);
    } else {
      // 创建新记录
      const newRecord: SampleData = {
        id: `scan_${Date.now()}`,
        sampleCode: scannedCode,
        sampleType: '',
        status: 'pending',
        createTime: dayjs().format('YYYY-MM-DD HH:mm:ss'),
        updateTime: dayjs().format('YYYY-MM-DD HH:mm:ss')
      };
      
      const newData = [...data, newRecord];
      setData(newData);
      
      if (onChange) {
        onChange(newData);
      }
      
      message.success('扫描成功，已添加新样本');
      
      // 自动开始编辑新记录
      setTimeout(() => {
        edit(newRecord);
      }, 100);
    }
    
    setScannerVisible(false);
  };

  /**
   * 批量操作
   * @param operation 操作
   */
  const handleBatchOperation = (operation: BatchOperation) => {
    if (selectedRows.length === 0) {
      message.warning('请先选择要操作的记录');
      return;
    }
    
    if (operation.disabled && operation.disabled(selectedRows)) {
      message.warning('当前选择的记录不支持此操作');
      return;
    }
    
    if (operation.confirm) {
      Modal.confirm({
        title: '确认操作',
        content: `确定要对选中的 ${selectedRows.length} 条记录执行"${operation.label}"操作吗？`,
        onOk: () => {
          operation.action(selectedRows);
        }
      });
    } else {
      operation.action(selectedRows);
    }
  };

  // 移动端布局
  if (isMobile) {
    return (
      <div style={{ padding: '16px' }}>
        {/* 移动端标题栏 */}
        <Card size="small" style={{ marginBottom: 16 }}>
          <Row align="middle" justify="space-between">
            <Col>
              <Title level={4} style={{ margin: 0 }}>
                <DatabaseOutlined style={{ marginRight: 8 }} />
                样本数据表格
              </Title>
              <Text type="secondary">
                共 {data.length} 条记录
                {selectedRows.length > 0 && ` (已选择 ${selectedRows.length} 条)`}
              </Text>
            </Col>
            <Col>
              <Space>
                <Button
                  size="small"
                  icon={<PlusOutlined />}
                  onClick={addRecord}
                >
                  添加
                </Button>
                <Button
                  size="small"
                  icon={<SettingOutlined />}
                  onClick={() => setSettingsVisible(true)}
                />
              </Space>
            </Col>
          </Row>
        </Card>

        {/* 验证错误提示 */}
        {validationErrors.length > 0 && (
          <Alert
            type="warning"
            message={`发现 ${validationErrors.length} 个数据验证错误`}
            description="请检查标红的字段并修正错误"
            showIcon
            closable
            style={{ marginBottom: 16 }}
          />
        )}

        {/* 移动端卡片列表 */}
        <Space direction="vertical" style={{ width: '100%' }}>
          {data.map(record => (
            <Card
              key={record.id}
              size="small"
              title={
                <Space>
                  <Checkbox
                    checked={selectedRowKeys.includes(record.id)}
                    onChange={(e) => {
                      const checked = e.target.checked;
                      if (checked) {
                        setSelectedRowKeys([...selectedRowKeys, record.id]);
                        setSelectedRows([...selectedRows, record]);
                      } else {
                        setSelectedRowKeys(selectedRowKeys.filter(key => key !== record.id));
                        setSelectedRows(selectedRows.filter(row => row.id !== record.id));
                      }
                    }}
                  />
                  <Text strong>{record.sampleCode || '未命名样本'}</Text>
                  <Tag color={
                    record.status === 'completed' ? 'green' :
                    record.status === 'processing' ? 'blue' :
                    record.status === 'failed' ? 'red' : 'orange'
                  }>
                    {record.status === 'completed' ? '已完成' :
                     record.status === 'processing' ? '处理中' :
                     record.status === 'failed' ? '失败' : '待处理'}
                  </Tag>
                </Space>
              }
              extra={
                <Space>
                  <Button
                    type="link"
                    size="small"
                    icon={<EditOutlined />}
                    onClick={() => edit(record)}
                  />
                  <Popconfirm
                    title="确定删除？"
                    onConfirm={() => deleteRecord(record.id)}
                  >
                    <Button
                      type="link"
                      size="small"
                      icon={<DeleteOutlined />}
                      danger
                    />
                  </Popconfirm>
                </Space>
              }
            >
              <Space direction="vertical" style={{ width: '100%' }}>
                {columns.filter(col => columnVisibility[col.key] && col.key !== 'sampleCode').map(col => {
                  const value = record[col.key];
                  const hasError = validationErrors.some(e => e.record.id === record.id && e.field === col.key);
                  
                  return (
                    <Row key={col.key} justify="space-between">
                      <Col>
                        <Text type="secondary">{col.title}:</Text>
                      </Col>
                      <Col>
                        <Text style={{ color: hasError ? '#ff4d4f' : undefined }}>
                          {value || '-'}
                          {hasError && <ExclamationCircleOutlined style={{ marginLeft: 4 }} />}
                        </Text>
                      </Col>
                    </Row>
                  );
                })}
              </Space>
            </Card>
          ))}
        </Space>

        {/* 移动端浮动按钮 */}
        <FloatButton.Group>
          <FloatButton
            icon={<PlusOutlined />}
            tooltip="添加记录"
            onClick={addRecord}
          />
          {enableBarcodeScanning && (
            <FloatButton
              icon={<ScanOutlined />}
              tooltip="扫描条码"
              onClick={() => setScannerVisible(true)}
            />
          )}
          <FloatButton
            icon={<CheckCircleOutlined />}
            tooltip="验证数据"
            onClick={validateAllRecords}
          />
          {enableImportExport && (
            <FloatButton
              icon={<UploadOutlined />}
              tooltip="导入数据"
              onClick={() => setImportModalVisible(true)}
            />
          )}
        </FloatButton.Group>
      </div>
    );
  }

  // 桌面端布局
  return (
    <div style={{ padding: '24px' }}>
      {/* 桌面端工具栏 */}
      <Card style={{ marginBottom: 24 }}>
        <Row gutter={16} align="middle">
          <Col span={12}>
            <Space>
              <Title level={4} style={{ margin: 0 }}>
                <DatabaseOutlined style={{ marginRight: 8 }} />
                样本数据表格
              </Title>
              <Badge count={data.length} showZero>
                <Tag>总记录数</Tag>
              </Badge>
              {selectedRows.length > 0 && (
                <Badge count={selectedRows.length}>
                  <Tag color="blue">已选择</Tag>
                </Badge>
              )}
              {validationErrors.length > 0 && (
                <Badge count={validationErrors.length}>
                  <Tag color="red">验证错误</Tag>
                </Badge>
              )}
            </Space>
          </Col>
          <Col span={12} style={{ textAlign: 'right' }}>
            <Space>
              <Button
                icon={<PlusOutlined />}
                onClick={addRecord}
              >
                添加记录
              </Button>
              <Button
                icon={<CheckCircleOutlined />}
                onClick={validateAllRecords}
              >
                验证数据
              </Button>
              {enableBarcodeScanning && (
                <Button
                  icon={<ScanOutlined />}
                  onClick={() => setScannerVisible(true)}
                >
                  扫描条码
                </Button>
              )}
              {enableImportExport && (
                <>
                  <Button
                    icon={<UploadOutlined />}
                    onClick={() => setImportModalVisible(true)}
                  >
                    导入
                  </Button>
                  <Button
                    icon={<DownloadOutlined />}
                    onClick={() => setExportModalVisible(true)}
                  >
                    导出
                  </Button>
                </>
              )}
              <Button
                icon={<SettingOutlined />}
                onClick={() => setSettingsVisible(true)}
              >
                设置
              </Button>
            </Space>
          </Col>
        </Row>

        {/* 批量操作栏 */}
        {selectedRows.length > 0 && batchOperations.length > 0 && (
          <Row style={{ marginTop: 16 }}>
            <Col span={24}>
              <Alert
                type="info"
                message={
                  <Space>
                    <Text>已选择 {selectedRows.length} 条记录，可执行批量操作：</Text>
                    {batchOperations.map(operation => (
                      <Button
                        key={operation.key}
                        size="small"
                        icon={operation.icon}
                        disabled={operation.disabled && operation.disabled(selectedRows)}
                        onClick={() => handleBatchOperation(operation)}
                      >
                        {operation.label}
                      </Button>
                    ))}
                  </Space>
                }
                showIcon
              />
            </Col>
          </Row>
        )}
      </Card>

      {/* 验证错误提示 */}
      {validationErrors.length > 0 && (
        <Alert
          type="error"
          message={`发现 ${validationErrors.length} 个数据验证错误`}
          description={
            <div>
              <Text>请检查以下字段并修正错误：</Text>
              <ul style={{ marginTop: 8, marginBottom: 0 }}>
                {validationErrors.slice(0, 5).map((error, index) => (
                  <li key={index}>
                    样本 {error.record.sampleCode} 的 {error.field}: {error.message}
                  </li>
                ))}
                {validationErrors.length > 5 && (
                  <li>还有 {validationErrors.length - 5} 个错误...</li>
                )}
              </ul>
            </div>
          }
          showIcon
          closable
          style={{ marginBottom: 24 }}
        />
      )}

      {/* 主表格 */}
      <Form form={form} component={false}>
        <Table
          ref={tableRef}
          components={{
            body: {
              cell: EditableCell,
            },
          }}
          bordered
          dataSource={data}
          columns={buildTableColumns()}
          rowClassName="editable-row"
          rowSelection={rowSelection}
          pagination={pagination}
          size={size}
          scroll={{ x: 'max-content' }}
          loading={loading}
          locale={{
            emptyText: (
              <Empty
                image={Empty.PRESENTED_IMAGE_SIMPLE}
                description="暂无数据"
              >
                <Button type="primary" icon={<PlusOutlined />} onClick={addRecord}>
                  添加第一条记录
                </Button>
              </Empty>
            )
          }}
        />
      </Form>

      {/* 导入模态框 */}
      <Modal
        title="导入数据"
        open={importModalVisible}
        onCancel={() => setImportModalVisible(false)}
        footer={null}
        width={600}
      >
        <Space direction="vertical" style={{ width: '100%' }}>
          <Alert
            type="info"
            message="支持导入 Excel (.xlsx, .xls) 和 CSV (.csv) 格式文件"
            showIcon
          />
          
          <Dragger
            name="file"
            multiple={false}
            accept=".xlsx,.xls,.csv"
            customRequest={handleImport}
            showUploadList={false}
          >
            <p className="ant-upload-drag-icon">
              <FileExcelOutlined style={{ fontSize: 48, color: '#1890ff' }} />
            </p>
            <p className="ant-upload-text">点击或拖拽文件到此区域上传</p>
            <p className="ant-upload-hint">
              支持单个文件上传，文件大小不超过 10MB
            </p>
          </Dragger>
          
          <Space>
            <Button icon={<DownloadOutlined />}>
              下载导入模板
            </Button>
            <Button icon={<FileTextOutlined />}>
              查看导入说明
            </Button>
          </Space>
        </Space>
      </Modal>

      {/* 导出模态框 */}
      <Modal
        title="导出数据"
        open={exportModalVisible}
        onCancel={() => setExportModalVisible(false)}
        footer={null}
        width={500}
      >
        <Space direction="vertical" style={{ width: '100%' }}>
          <Alert
            type="info"
            message={`将导出 ${selectedRows.length > 0 ? selectedRows.length : data.length} 条记录`}
            showIcon
          />
          
          <Radio.Group defaultValue="excel" style={{ width: '100%' }}>
            <Space direction="vertical" style={{ width: '100%' }}>
              <Radio value="excel">
                <Space>
                  <FileExcelOutlined />
                  Excel 格式 (.xlsx)
                </Space>
              </Radio>
              <Radio value="csv">
                <Space>
                  <FileTextOutlined />
                  CSV 格式 (.csv)
                </Space>
              </Radio>
              <Radio value="json">
                <Space>
                  <CodeOutlined />
                  JSON 格式 (.json)
                </Space>
              </Radio>
            </Space>
          </Radio.Group>
          
          <Row gutter={16} style={{ marginTop: 24 }}>
            <Col span={12}>
              <Button block onClick={() => setExportModalVisible(false)}>
                取消
              </Button>
            </Col>
            <Col span={12}>
              <Button type="primary" block icon={<DownloadOutlined />} onClick={() => exportData('excel')}>
                开始导出
              </Button>
            </Col>
          </Row>
        </Space>
      </Modal>

      {/* 条码扫描模态框 */}
      <Modal
        title="条码扫描"
        open={scannerVisible}
        onCancel={() => setScannerVisible(false)}
        footer={null}
        width={400}
      >
        <Space direction="vertical" style={{ width: '100%', textAlign: 'center' }}>
          <BarcodeOutlined style={{ fontSize: 64, color: '#1890ff' }} />
          <Title level={4}>准备扫描条码</Title>
          <Text type="secondary">
            请将条码对准摄像头进行扫描
          </Text>
          <Button type="primary" size="large" onClick={handleBarcodeScanning}>
            模拟扫描
          </Button>
        </Space>
      </Modal>

      {/* 设置模态框 */}
      <Modal
        title="表格设置"
        open={settingsVisible}
        onCancel={() => setSettingsVisible(false)}
        footer={null}
        width={600}
      >
        <Tabs defaultActiveKey="columns">
          <TabPane tab="列显示" key="columns">
            <Space direction="vertical" style={{ width: '100%' }}>
              <Text strong>选择要显示的列：</Text>
              {columns.map(col => (
                <Checkbox
                  key={col.key}
                  checked={columnVisibility[col.key]}
                  onChange={(e) => {
                    setColumnVisibility(prev => ({
                      ...prev,
                      [col.key]: e.target.checked
                    }));
                  }}
                >
                  {col.title}
                </Checkbox>
              ))}
            </Space>
          </TabPane>
          <TabPane tab="表格选项" key="options">
            <Space direction="vertical" style={{ width: '100%' }}>
              <Row justify="space-between">
                <Text>表格大小：</Text>
                <Segmented
                  options={[
                    { label: '紧凑', value: 'small' },
                    { label: '中等', value: 'middle' },
                    { label: '宽松', value: 'large' }
                  ]}
                  value={size}
                  onChange={(value) => {
                    // 这里应该通过props传递size变更
                    console.log('表格大小变更:', value);
                  }}
                />
              </Row>
            </Space>
          </TabPane>
        </Tabs>
      </Modal>
    </div>
  );
};

export default EditableSampleTable;