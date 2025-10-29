/**
 * DNA提取组件
 * 
 * 功能说明：
 * - 实现DNA提取任务的管理和跟踪
 * - 提供样本列表、提取记录和质控结果展示
 * - 支持批量操作和数据导出
 * - 实时显示提取进度和状态
 * 
 * @author 系统
 * @version 1.0.0
 */

import React, { useState, useEffect } from 'react';
import {
  Card,
  Table,
  Button,
  Space,
  Tag,
  Row,
  Col,
  Statistic,
  Modal,
  Form,
  Input,
  Select,
  DatePicker,
  message,
  Typography,
  Tabs,
  Progress,
  Descriptions,
  Alert,
  Tooltip,
  Popconfirm,
  Upload,
  InputNumber,
  Radio,
  Checkbox,
  Divider,
  Badge,
  Drawer
} from 'antd';
import {
  ExperimentOutlined,
  PlusOutlined,
  EyeOutlined,
  EditOutlined,
  DeleteOutlined,
  DownloadOutlined,
  UploadOutlined,
  ReloadOutlined,
  SearchOutlined,
  FilterOutlined,
  PrinterOutlined,
  FileExcelOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  ExclamationCircleOutlined,
  PlayCircleOutlined
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import dayjs from 'dayjs';

const { Title, Text } = Typography;
const { Option } = Select;
const { TextArea } = Input;
const { TabPane } = Tabs;
const { Search } = Input;

/**
 * 提取状态枚举
 */
type ExtractionStatus = 'pending' | 'in_progress' | 'completed' | 'failed' | 'quality_check';

/**
 * 样本类型枚举
 */
type SampleType = 'blood' | 'tissue' | 'saliva' | 'urine' | 'other';

/**
 * 样本接口定义
 */
interface Sample {
  /** 样本ID */
  id: string;
  /** 样本编号 */
  sampleCode: string;
  /** 样本名称 */
  sampleName: string;
  /** 样本类型 */
  sampleType: SampleType;
  /** 提取状态 */
  status: ExtractionStatus;
  /** 接收日期 */
  receivedDate: string;
  /** 项目名称 */
  projectName: string;
  /** 检验科室 */
  department?: string;
  /** 优先级 */
  priority: 'low' | 'medium' | 'high' | 'urgent';
  /** 操作员 */
  operator?: string;
  /** 提取日期 */
  extractionDate?: string;
  /** DNA浓度 */
  concentration?: number;
  /** 纯度比值 */
  purityRatio?: number;
  /** 备注 */
  notes?: string;
}

/**
 * 提取记录接口定义
 */
interface ExtractionRecord {
  /** 记录ID */
  id: string;
  /** 样本ID */
  sampleId: string;
  /** 样本编号 */
  sampleCode: string;
  /** 操作员 */
  operator: string;
  /** 提取方法 */
  method: string;
  /** 开始时间 */
  startTime: string;
  /** 结束时间 */
  endTime?: string;
  /** DNA浓度 */
  concentration?: number;
  /** 纯度比值 */
  purityRatio?: number;
  /** 总量 */
  totalAmount?: number;
  /** 状态 */
  status: ExtractionStatus;
  /** 备注 */
  notes?: string;
}

/**
 * 试剂接口定义
 */
interface Reagent {
  /** 试剂ID */
  id: string;
  /** 试剂编码 */
  code: string;
  /** 试剂名称 */
  name: string;
  /** 品牌 */
  brand: string;
  /** 有效期至 */
  expiryDate: string;
  /** 批号 */
  batchNumber?: string;
}

/**
 * 设备接口定义
 */
interface Equipment {
  /** 设备ID */
  id: string;
  /** 设备编码 */
  code: string;
  /** 设备名称 */
  name: string;
  /** 品牌 */
  brand: string;
  /** 型号 */
  model: string;
  /** 状态 */
  status?: 'available' | 'in_use' | 'maintenance';
}

/**
 * DNA提取管理组件
 */
const DNAExtraction: React.FC = () => {
  // 状态管理
  const [activeTab, setActiveTab] = useState<string>('pending');
  const [samples, setSamples] = useState<Sample[]>([]);
  const [extractionRecords, setExtractionRecords] = useState<ExtractionRecord[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
  const [modalVisible, setModalVisible] = useState<boolean>(false);
  const [editingRecord, setEditingRecord] = useState<ExtractionRecord | null>(null);
  const [drawerVisible, setDrawerVisible] = useState<boolean>(false);
  const [selectedSamples, setSelectedSamples] = useState<Sample[]>([]);
  
  // 抽屉中已选样本的复选框状态
  const [selectedSampleKeys, setSelectedSampleKeys] = useState<React.Key[]>([]);
  
  // 抽屉表单状态
  const [batchNumber, setBatchNumber] = useState<string>('');
  const [extractionDate, setExtractionDate] = useState<dayjs.Dayjs>(dayjs());
  const [operator, setOperator] = useState<string>('');
  const [reviewer, setReviewer] = useState<string>('');
  const [selectedReagents, setSelectedReagents] = useState<Reagent[]>([]);
  const [selectedEquipments, setSelectedEquipments] = useState<Equipment[]>([]);
  
  // 试剂和设备数据
  const [availableReagents, setAvailableReagents] = useState<Reagent[]>([]);
  const [availableEquipments, setAvailableEquipments] = useState<Equipment[]>([]);
  
  const [form] = Form.useForm();

  /**
   * 初始化数据
   */
  useEffect(() => {
    loadSamples();
    loadExtractionRecords();
    loadReagents();
    loadEquipments();
  }, []);

  /**
   * 根据状态筛选样本
   */
  const getFilteredSamples = (status: string) => {
    switch (status) {
      case 'pending':
        return samples.filter(sample => sample.status === 'pending');
      case 'processing':
        return samples.filter(sample => sample.status === 'in_progress');
      case 'completed':
        return samples.filter(sample => sample.status === 'completed');
      case 'error':
        return samples.filter(sample => sample.status === 'failed');
      default:
        return samples;
    }
  };

  /**
   * 加载样本数据
   */
  const loadSamples = async () => {
    setLoading(true);
    try {
      // 模拟API调用
      const mockSamples: Sample[] = [
        {
          id: '1',
          sampleCode: 'S2024001',
          sampleName: '血液样本001',
          sampleType: 'blood',
          status: 'pending',
          receivedDate: '2024-01-15',
          projectName: '基因检测项目A',
          department: 'clinical',
          priority: 'high'
        },
        {
          id: '2',
          sampleCode: 'S2024002',
          sampleName: '组织样本002',
          sampleType: 'tissue',
          status: 'in_progress',
          receivedDate: '2024-01-16',
          projectName: '基因检测项目B',
          department: 'pathology',
          priority: 'medium',
          operator: '张三',
          extractionDate: '2024-01-17'
        },
        {
          id: '3',
          sampleCode: 'S2024003',
          sampleName: '唾液样本003',
          sampleType: 'saliva',
          status: 'completed',
          receivedDate: '2024-01-14',
          projectName: '基因检测项目A',
          department: 'genetics',
          priority: 'low',
          operator: '李四',
          extractionDate: '2024-01-16',
          concentration: 125.6,
          purityRatio: 1.85
        },
        {
          id: '4',
          sampleCode: 'S2024004',
          sampleName: '尿液样本004',
          sampleType: 'urine',
          status: 'pending',
          receivedDate: '2024-01-18',
          projectName: '基因检测项目C',
          department: 'clinical',
          priority: 'urgent'
        },
        {
          id: '5',
          sampleCode: 'S2024005',
          sampleName: '血液样本005',
          sampleType: 'blood',
          status: 'failed',
          receivedDate: '2024-01-17',
          projectName: '基因检测项目A',
          department: 'clinical',
          priority: 'high',
          operator: '王五',
          extractionDate: '2024-01-18',
          notes: '样本质量不佳，需重新采集'
        },
        {
          id: '6',
          sampleCode: 'S2024006',
          sampleName: '组织样本006',
          sampleType: 'tissue',
          status: 'quality_check',
          receivedDate: '2024-01-19',
          projectName: '基因检测项目B',
          department: 'pathology',
          priority: 'medium',
          operator: '赵六',
          extractionDate: '2024-01-20',
          concentration: 98.3,
          purityRatio: 1.92
        },
        {
          id: '7',
          sampleCode: 'S2024007',
          sampleName: '唾液样本007',
          sampleType: 'saliva',
          status: 'pending',
          receivedDate: '2024-01-20',
          projectName: '基因检测项目D',
          department: 'genetics',
          priority: 'low'
        },
        {
          id: '8',
          sampleCode: 'S2024008',
          sampleName: '血液样本008',
          sampleType: 'blood',
          status: 'in_progress',
          receivedDate: '2024-01-21',
          projectName: '基因检测项目A',
          department: 'clinical',
          priority: 'high',
          operator: '孙七',
          extractionDate: '2024-01-22'
        },
        {
          id: '9',
          sampleCode: 'S2024009',
          sampleName: '其他样本009',
          sampleType: 'other',
          status: 'completed',
          receivedDate: '2024-01-19',
          projectName: '基因检测项目E',
          department: 'research',
          priority: 'medium',
          operator: '周八',
          extractionDate: '2024-01-21',
          concentration: 156.8,
          purityRatio: 1.78
        },
        {
          id: '10',
          sampleCode: 'S2024010',
          sampleName: '组织样本010',
          sampleType: 'tissue',
          status: 'pending',
          receivedDate: '2024-01-22',
          projectName: '基因检测项目B',
          department: 'pathology',
          priority: 'urgent'
        }
      ];
      setSamples(mockSamples);
    } catch (error) {
      message.error('加载样本数据失败');
    } finally {
      setLoading(false);
    }
  };

  /**
   * 加载提取记录数据
   */
  const loadExtractionRecords = async () => {
    try {
      // 模拟API调用
      const mockRecords: ExtractionRecord[] = [
        {
          id: '1',
          sampleId: '3',
          sampleCode: 'S2024003',
          operator: '李四',
          method: 'Qiagen DNeasy Kit',
          startTime: '2024-01-16 09:00:00',
          endTime: '2024-01-16 11:30:00',
          concentration: 125.6,
          purityRatio: 1.85,
          totalAmount: 2512,
          status: 'completed',
          notes: '提取顺利，质量良好'
        },
        {
          id: '2',
          sampleId: '2',
          sampleCode: 'S2024002',
          operator: '张三',
          method: 'TIANamp Genomic DNA Kit',
          startTime: '2024-01-17 10:00:00',
          status: 'in_progress',
          notes: '正在进行中'
        },
        {
          id: '3',
          sampleId: '9',
          sampleCode: 'S2024009',
          operator: '周八',
          method: 'QIAamp DNA Mini Kit',
          startTime: '2024-01-21 08:30:00',
          endTime: '2024-01-21 12:15:00',
          concentration: 156.8,
          purityRatio: 1.78,
          totalAmount: 3136,
          status: 'completed',
          notes: '提取效果优秀'
        },
        {
          id: '4',
          sampleId: '6',
          sampleCode: 'S2024006',
          operator: '赵六',
          method: 'Invitrogen PureLink Kit',
          startTime: '2024-01-20 14:00:00',
          endTime: '2024-01-20 17:30:00',
          concentration: 98.3,
          purityRatio: 1.92,
          totalAmount: 1966,
          status: 'quality_check',
          notes: '等待质检结果'
        },
        {
          id: '5',
          sampleId: '8',
          sampleCode: 'S2024008',
          operator: '孙七',
          method: 'Qiagen DNeasy Kit',
          startTime: '2024-01-22 09:15:00',
          status: 'in_progress',
          notes: '提取进行中，预计下午完成'
        },
        {
          id: '6',
          sampleId: '5',
          sampleCode: 'S2024005',
          operator: '王五',
          method: 'TIANamp Genomic DNA Kit',
          startTime: '2024-01-18 11:00:00',
          endTime: '2024-01-18 14:30:00',
          concentration: 45.2,
          purityRatio: 1.45,
          totalAmount: 904,
          status: 'failed',
          notes: '样本质量差，浓度过低，建议重新采集'
        },
        {
          id: '7',
          sampleId: '1',
          sampleCode: 'S2024001',
          operator: '李四',
          method: 'QIAamp DNA Mini Kit',
          startTime: '2024-01-23 10:00:00',
          status: 'pending',
          notes: '待开始提取'
        }
      ];
      setExtractionRecords(mockRecords);
    } catch (error) {
      message.error('加载提取记录失败');
    }
  };

  /**
   * 加载试剂数据
   */
  const loadReagents = async () => {
    try {
      // 模拟API调用
      const mockReagents: Reagent[] = [
        {
          id: '1',
          code: 'R001',
          name: 'Qiagen DNeasy Blood & Tissue Kit',
          brand: 'Qiagen',
          expiryDate: '2024-12-31',
          batchNumber: 'QG20240101'
        },
        {
          id: '2',
          code: 'R002',
          name: 'TIANamp Genomic DNA Kit',
          brand: 'TIANGEN',
          expiryDate: '2024-11-30',
          batchNumber: 'TG20240201'
        },
        {
          id: '3',
          code: 'R003',
          name: 'Proteinase K',
          brand: 'Thermo Fisher',
          expiryDate: '2024-10-15',
          batchNumber: 'TF20240301'
        },
        {
          id: '4',
          code: 'R004',
          name: 'RNase A',
          brand: 'Sigma-Aldrich',
          expiryDate: '2025-01-20',
          batchNumber: 'SA20240401'
        }
      ];
      setAvailableReagents(mockReagents);
    } catch (error) {
      message.error('加载试剂数据失败');
    }
  };

  /**
   * 加载设备数据
   */
  const loadEquipments = async () => {
    try {
      // 模拟API调用
      const mockEquipments: Equipment[] = [
        {
          id: '1',
          code: 'E001',
          name: '离心机',
          brand: 'Eppendorf',
          model: '5424R',
          status: 'available'
        },
        {
          id: '2',
          code: 'E002',
          name: '恒温振荡器',
          brand: 'Thermo Fisher',
          model: 'MaxQ 4000',
          status: 'available'
        },
        {
          id: '3',
          code: 'E003',
          name: '移液器',
          brand: 'Gilson',
          model: 'Pipetman P1000',
          status: 'in_use'
        },
        {
          id: '4',
          code: 'E004',
          name: '水浴锅',
          brand: 'Grant',
          model: 'JB Nova',
          status: 'available'
        },
        {
          id: '5',
          code: 'E005',
          name: '涡旋混合器',
          brand: 'Scientific Industries',
          model: 'Vortex-Genie 2',
          status: 'maintenance'
        }
      ];
      setAvailableEquipments(mockEquipments);
    } catch (error) {
      message.error('加载设备数据失败');
    }
  };

  /**
   * 获取状态标签
   */
  const getStatusTag = (status: ExtractionStatus) => {
    const statusConfig = {
      pending: { color: 'default', text: '待提取', icon: <ClockCircleOutlined /> },
      in_progress: { color: 'processing', text: '提取中', icon: <PlayCircleOutlined /> },
      completed: { color: 'success', text: '已完成', icon: <CheckCircleOutlined /> },
      failed: { color: 'error', text: '失败', icon: <ExclamationCircleOutlined /> },
      quality_check: { color: 'warning', text: '质检中', icon: <ExperimentOutlined /> }
    };
    
    const config = statusConfig[status];
    return (
      <Tag color={config.color} icon={config.icon}>
        {config.text}
      </Tag>
    );
  };

  /**
   * 样本表格列定义
   */
  const sampleColumns: ColumnsType<Sample> = [
    {
      title: '样本编号',
      dataIndex: 'sampleCode',
      key: 'sampleCode',
      width: 120,
      fixed: 'left'
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
      render: (type: SampleType) => {
        const typeMap = {
          blood: '血液',
          tissue: '组织',
          saliva: '唾液',
          urine: '尿液',
          other: '其他'
        };
        return typeMap[type];
      }
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 120,
      render: (status: ExtractionStatus) => getStatusTag(status)
    },
    {
      title: '项目名称',
      dataIndex: 'projectName',
      key: 'projectName',
      width: 150
    },
    {
      title: '接收日期',
      dataIndex: 'receivedDate',
      key: 'receivedDate',
      width: 120
    },
    {
      title: '操作员',
      dataIndex: 'operator',
      key: 'operator',
      width: 100
    },
    {
      title: 'DNA浓度(ng/μL)',
      dataIndex: 'concentration',
      key: 'concentration',
      width: 130,
      render: (value: number) => value ? value.toFixed(2) : '-'
    },
    {
      title: '纯度比值',
      dataIndex: 'purityRatio',
      key: 'purityRatio',
      width: 100,
      render: (value: number) => value ? value.toFixed(2) : '-'
    }
  ];

  /**
   * 提取记录表格列定义
   */
  const recordColumns: ColumnsType<ExtractionRecord> = [
    {
      title: '样本编号',
      dataIndex: 'sampleCode',
      key: 'sampleCode',
      width: 120
    },
    {
      title: '操作员',
      dataIndex: 'operator',
      key: 'operator',
      width: 100
    },
    {
      title: '提取方法',
      dataIndex: 'method',
      key: 'method',
      width: 180
    },
    {
      title: '开始时间',
      dataIndex: 'startTime',
      key: 'startTime',
      width: 150
    },
    {
      title: '结束时间',
      dataIndex: 'endTime',
      key: 'endTime',
      width: 150,
      render: (value: string) => value || '-'
    },
    {
      title: 'DNA浓度(ng/μL)',
      dataIndex: 'concentration',
      key: 'concentration',
      width: 130,
      render: (value: number) => value ? value.toFixed(2) : '-'
    },
    {
      title: '纯度比值',
      dataIndex: 'purityRatio',
      key: 'purityRatio',
      width: 100,
      render: (value: number) => value ? value.toFixed(2) : '-'
    },
    {
      title: '总量(ng)',
      dataIndex: 'totalAmount',
      key: 'totalAmount',
      width: 100,
      render: (value: number) => value ? value.toLocaleString() : '-'
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 120,
      render: (status: ExtractionStatus) => getStatusTag(status)
    }
  ];

  /**
   * 处理批量操作
   */
  const handleBatchAction = (action: string) => {
    if (action === '新增提取' || action === '新增') {
      // 新增提取操作
      if (selectedRowKeys.length === 0) {
        message.warning('请先选择样本');
        return;
      }
      // 打开抽屉
      setDrawerVisible(true);
      return;
    }
    
    // 其他批量操作
    if (selectedRowKeys.length === 0) {
      message.warning('请先选择要操作的记录');
      return;
    }
    
    Modal.confirm({
      title: `确定要${action}选中的${selectedRowKeys.length}条记录吗？`,
      onOk: async () => {
        try {
          // 模拟API调用
          message.success(`${action}成功`);
          setSelectedRowKeys([]);
        } catch (error) {
          message.error(`${action}失败`);
        }
      }
    });
  };

  /**
   * 处理选中样本变化
   */
  const handleRowSelectionChange = (selectedKeys: React.Key[], selectedRows: Sample[]) => {
    setSelectedRowKeys(selectedKeys);
    setSelectedSamples(selectedRows);
    
    // 移除自动打开抽屉的逻辑，改为手动点击"新增提取"按钮打开
    // if (selectedKeys.length > 0) {
    //   setDrawerVisible(true);
    // } else {
    //   setDrawerVisible(false);
    // }
  };

  /**
   * 关闭抽屉
   */
  const handleDrawerClose = () => {
    setDrawerVisible(false);
    setSelectedRowKeys([]);
    setSelectedSamples([]);
    setSelectedSampleKeys([]);
    
    // 清空表单状态
    setBatchNumber('');
    setExtractionDate(dayjs());
    setOperator('');
    setReviewer('');
    setSelectedReagents([]);
    setSelectedEquipments([]);
  };

  /**
   * 批量移除选中的样本
   */
  const handleRemoveSelectedSamples = () => {
    if (selectedSampleKeys.length === 0) {
      message.warning('请先选择要移除的样本');
      return;
    }
    
    Modal.confirm({
      title: '确认移除',
      content: `确定要移除选中的 ${selectedSampleKeys.length} 个样本吗？`,
      onOk: () => {
        // 从已选样本中移除选中的样本
        const remainingSamples = selectedSamples.filter(sample => !selectedSampleKeys.includes(sample.id));
        const remainingKeys = selectedRowKeys.filter(key => !selectedSampleKeys.includes(key));
        
        setSelectedSamples(remainingSamples);
        setSelectedRowKeys(remainingKeys);
        setSelectedSampleKeys([]);
        
        message.success(`成功移除 ${selectedSampleKeys.length} 个样本`);
      }
    });
  };



  // 渲染样本表格
  const renderSampleTable = (status: string) => {
    const filteredSamples = getFilteredSamples(status);
    
    return (
      <div>
        {/* 查询条件区域 */}
        <div style={{ marginBottom: 16 }}>
          <Row gutter={16}>
            <Col span={6}>
              <Search
                placeholder="样本条码或名称"
                allowClear
                onSearch={(value) => console.log(value)}
              />
            </Col>
            <Col span={6}>
              <Select placeholder="检验科室" allowClear style={{ width: '100%' }}>
                <Option value="clinical">临床检验科</Option>
                <Option value="pathology">病理科</Option>
                <Option value="genetics">遗传学科</Option>
                <Option value="microbiology">微生物科</Option>
                <Option value="immunology">免疫科</Option>
              </Select>
            </Col>
            <Col span={6}>
              <Select placeholder="样本类型" allowClear style={{ width: '100%' }}>
                <Option value="blood">血液</Option>
                <Option value="tissue">组织</Option>
                <Option value="saliva">唾液</Option>
                <Option value="urine">尿液</Option>
                <Option value="other">其他</Option>
              </Select>
            </Col>
            <Col span={6}>
              <Button icon={<ReloadOutlined />} onClick={loadSamples}>
                刷新
              </Button>
            </Col>
          </Row>
        </div>

        {/* 操作按钮区域 - 仅在待处理页面显示 */}
        {status === 'pending' && (
          <div style={{ marginBottom: 16 }}>
            <Space>
              <Button 
                type="primary"
                icon={<PlusOutlined />}
                onClick={() => handleBatchAction('新增提取')}
              >
                新增提取
              </Button>
              <Button icon={<DownloadOutlined />}>
                导出
              </Button>
            </Space>
          </div>
        )}
        
        <Table
          columns={sampleColumns}
          dataSource={filteredSamples}
          rowKey="id"
          loading={loading}
          scroll={{ x: 1500 }}
          rowSelection={status === 'pending' || status === 'error' ? {
            selectedRowKeys,
            onChange: handleRowSelectionChange,
            getCheckboxProps: (record) => ({
              disabled: record.status === 'completed'
            })
          } : undefined}
          pagination={{
            total: filteredSamples.length,
            pageSize: 10,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) => `第 ${range[0]}-${range[1]} 条/共 ${total} 条`
          }}
        />
      </div>
    );
  };

  return (
    <div style={{ padding: '24px' }}>
      <Card>
        <Title level={2}>
          <ExperimentOutlined /> DNA提取
        </Title>
        
        <Tabs 
          activeKey={activeTab} 
          onChange={setActiveTab}
          items={[
            {
              key: 'pending',
              label: (
                <span>
                  <ClockCircleOutlined />
                  待处理 <Badge count={getFilteredSamples('pending').length} showZero />
                </span>
              ),
              children: renderSampleTable('pending')
            },
            {
              key: 'processing',
              label: (
                <span>
                  <PlayCircleOutlined />
                  处理中 <Badge count={getFilteredSamples('processing').length} showZero />
                </span>
              ),
              children: renderSampleTable('processing')
            },
            {
              key: 'completed',
              label: (
                <span>
                  <CheckCircleOutlined />
                  已处理 <Badge count={getFilteredSamples('completed').length} showZero />
                </span>
              ),
              children: renderSampleTable('completed')
            },
            {
              key: 'error',
              label: (
                <span>
                  <ExclamationCircleOutlined />
                  处理异常 <Badge count={getFilteredSamples('error').length} showZero />
                </span>
              ),
              children: renderSampleTable('error')
            }
          ]}
        />
      </Card>

      {/* 选中样本抽屉 */}
      <Drawer
        title="DNA提取"
        placement="right"
        width="60%"
        onClose={handleDrawerClose}
        open={drawerVisible}
        extra={
          <Space>
            <Button onClick={handleDrawerClose}>取消</Button>
            <Button type="primary" onClick={() => handleBatchAction('新增提取')}>
              新增提取
            </Button>
          </Space>
        }
      >
        <div style={{ padding: '16px 0' }}>
          {/* 提取信息表单 */}
          <div style={{ marginBottom: 24 }}>
            {/* 第一行：提取批次 + 提取时间 */}
            <div style={{ display: 'flex', marginBottom: 16, gap: 24 }}>
              <div style={{ display: 'flex', alignItems: 'center', flex: 1 }}>
                <span style={{ width: 100, textAlign: 'right', marginRight: 16 }}>
                  <span style={{ color: 'red' }}>*</span> 提取批次：
                </span>
                <Input
                  value={batchNumber}
                  onChange={(e) => setBatchNumber(e.target.value)}
                  placeholder="请输入提取批次号"
                  style={{ flex: 1 }}
                />
              </div>
              
              <div style={{ display: 'flex', alignItems: 'center', flex: 1 }}>
                <span style={{ width: 100, textAlign: 'right', marginRight: 16 }}>
                  <span style={{ color: 'red' }}>*</span> 提取时间：
                </span>
                <DatePicker
                  value={extractionDate}
                  onChange={(date) => setExtractionDate(date)}
                  placeholder="选择提取时间"
                  style={{ flex: 1 }}
                />
              </div>
            </div>
            
            {/* 第二行：操作人员 + 复核人员 */}
            <div style={{ display: 'flex', marginBottom: 16, gap: 24 }}>
              <div style={{ display: 'flex', alignItems: 'center', flex: 1 }}>
                <span style={{ width: 100, textAlign: 'right', marginRight: 16 }}>
                  <span style={{ color: 'red' }}>*</span> 操作人员：
                </span>
                <Input
                  value={operator}
                  onChange={(e) => setOperator(e.target.value)}
                  placeholder="请输入操作人员"
                  style={{ flex: 1 }}
                />
              </div>
              
              <div style={{ display: 'flex', alignItems: 'center', flex: 1 }}>
                <span style={{ width: 100, textAlign: 'right', marginRight: 16 }}>
                  <span style={{ color: 'red' }}>*</span> 复核人员：
                </span>
                <Input
                  value={reviewer}
                  onChange={(e) => setReviewer(e.target.value)}
                  placeholder="请输入复核人员"
                  style={{ flex: 1 }}
                />
              </div>
            </div>
          </div>

          <Divider />

          {/* 试剂列表 */}
          <div style={{ marginBottom: 24 }}>
            <Title level={5} style={{ margin: '0 0 16px 0' }}>试剂列表</Title>
            
            <Table
              columns={[
                {
                  title: '试剂编码',
                  dataIndex: 'code',
                  key: 'code',
                  width: 150,
                  render: (code: string, record: Reagent, index: number) => (
                    <Select
                      value={code}
                      placeholder="选择试剂编码"
                      style={{ width: '100%' }}
                      showSearch
                      filterOption={(input, option) =>
                         String(option?.label ?? '').toLowerCase().includes(input.toLowerCase())
                       }
                      onChange={(value) => {
                        const selectedReagent = availableReagents.find(r => r.code === value);
                        if (selectedReagent) {
                          const updated = [...selectedReagents];
                          updated[index] = { ...selectedReagent, id: record.id };
                          setSelectedReagents(updated);
                        }
                      }}
                    >
                      {availableReagents.map(reagent => (
                        <Option key={reagent.code} value={reagent.code}>
                          {reagent.code}
                        </Option>
                      ))}
                    </Select>
                  )
                },
                {
                  title: '试剂名称',
                  dataIndex: 'name',
                  key: 'name',
                  width: 200,
                },
                {
                  title: '品牌',
                  dataIndex: 'brand',
                  key: 'brand',
                  width: 120,
                },
                {
                  title: '有效期至',
                  dataIndex: 'expiryDate',
                  key: 'expiryDate',
                  width: 150,
                  render: (date: string, record: Reagent, index: number) => (
                    <DatePicker
                      value={dayjs(date)}
                      onChange={(newDate) => {
                        const updated = [...selectedReagents];
                        updated[index] = { ...updated[index], expiryDate: newDate?.format('YYYY-MM-DD') || date };
                        setSelectedReagents(updated);
                      }}
                      format="YYYY-MM-DD"
                      size="small"
                      style={{ width: '100%' }}
                    />
                  )
                },
                {
                  title: '操作',
                  key: 'action',
                  width: 120,
                  render: (_, record: Reagent, index: number) => (
                    <Space size="small">
                      <Button
                        type="link"
                        size="small"
                        style={{ color: '#1890ff', padding: 0 }}
                        icon={<PlusOutlined />}
                        onClick={() => {
                          const newReagent: Reagent = {
                            id: `temp_${Date.now()}`,
                            code: '',
                            name: '',
                            brand: '',
                            expiryDate: dayjs().format('YYYY-MM-DD'),
                            batchNumber: ''
                          };
                          const updated = [...selectedReagents];
                          updated.splice(index + 1, 0, newReagent);
                          setSelectedReagents(updated);
                        }}
                      >
                        新增
                      </Button>
                      <Button
                        type="link"
                        size="small"
                        danger
                        onClick={() => {
                          const updated = selectedReagents.filter((_, i) => i !== index);
                          setSelectedReagents(updated);
                        }}
                      >
                        删除
                      </Button>
                    </Space>
                  )
                }
              ]}
              dataSource={selectedReagents.length > 0 ? selectedReagents : [{
                id: `temp_${Date.now()}`,
                code: '',
                name: '',
                brand: '',
                expiryDate: dayjs().format('YYYY-MM-DD'),
                batchNumber: ''
              }]}
              rowKey="id"
              pagination={false}
              size="small"
              locale={{ emptyText: '暂无试剂' }}
            />
          </div>

          <Divider />

          {/* 设备列表 */}
          <div style={{ marginBottom: 24 }}>
            <div style={{ marginBottom: 16 }}>
              <Title level={5} style={{ margin: 0 }}>设备列表</Title>
            </div>
            
            <Table
              columns={[
                {
                  title: '设备编码',
                  dataIndex: 'code',
                  key: 'code',
                  width: 150,
                  render: (code: string, record: Equipment, index: number) => (
                    <Select
                      value={code}
                      placeholder="选择设备编码"
                      style={{ width: '100%' }}
                      showSearch
                      filterOption={(input, option) =>
                        String(option?.label ?? '').toLowerCase().includes(input.toLowerCase())
                      }
                      onChange={(value) => {
                        const selectedEquipment = availableEquipments.find(e => e.code === value);
                        if (selectedEquipment) {
                          const updated = [...selectedEquipments];
                          updated[index] = { ...selectedEquipment, id: record.id };
                          setSelectedEquipments(updated);
                        }
                      }}
                    >
                      {availableEquipments.map(equipment => (
                        <Option key={equipment.code} value={equipment.code}>
                          {equipment.code}
                        </Option>
                      ))}
                    </Select>
                  )
                },
                {
                  title: '设备名称',
                  dataIndex: 'name',
                  key: 'name',
                  width: 200,
                },
                {
                  title: '品牌',
                  dataIndex: 'brand',
                  key: 'brand',
                  width: 120,
                },
                {
                  title: '型号',
                  dataIndex: 'model',
                  key: 'model',
                  width: 120,
                },
                {
                  title: '操作',
                  key: 'action',
                  width: 120,
                  render: (_, record: Equipment, index: number) => (
                    <Space>
                      <Button
                        type="link"
                        size="small"
                        style={{ color: '#1890ff', padding: 0 }}
                        icon={<PlusOutlined />}
                        onClick={() => {
                          const newEquipment: Equipment = {
                            id: `temp_${Date.now()}`,
                            code: '',
                            name: '',
                            brand: '',
                            model: '',
                            status: 'available'
                          };
                          setSelectedEquipments([...selectedEquipments, newEquipment]);
                        }}
                      >
                        新增
                      </Button>
                      <Button
                        type="link"
                        size="small"
                        danger
                        onClick={() => {
                          const updated = selectedEquipments.filter((_, i) => i !== index);
                          setSelectedEquipments(updated);
                        }}
                      >
                        删除
                      </Button>
                    </Space>
                  )
                }
              ]}
              dataSource={selectedEquipments.length > 0 ? selectedEquipments : [{
                id: `temp_${Date.now()}`,
                code: '',
                name: '',
                brand: '',
                model: '',
                status: 'available' as const
              }]}
              rowKey="id"
              pagination={false}
              size="small"
              locale={{ emptyText: '暂无设备，点击新增按钮添加设备' }}
            />
          </div>

          <Divider />

          {/* 选中的样本 */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <Title level={5}>选中的样本 ({selectedSamples.length})</Title>
              <Button 
                danger
                disabled={selectedSampleKeys.length === 0}
                onClick={handleRemoveSelectedSamples}
              >
                移除选中 ({selectedSampleKeys.length})
              </Button>
            </div>
            <Table
              columns={[
                {
                  title: '样本条码',
                  dataIndex: 'sampleCode',
                  key: 'sampleCode',
                  width: 120,
                },
                {
                  title: '样本名称',
                  dataIndex: 'sampleName',
                  key: 'sampleName',
                  width: 120,
                },
                {
                  title: '样本类型',
                  dataIndex: 'sampleType',
                  key: 'sampleType',
                  width: 100,
                  render: (type: SampleType) => {
                    const typeMap = {
                      blood: '血液',
                      tissue: '组织',
                      saliva: '唾液',
                      urine: '尿液',
                      other: '其他'
                    };
                    return typeMap[type] || type;
                  }
                },
                {
                  title: '检验科室',
                  dataIndex: 'department',
                  key: 'department',
                  width: 120,
                },
                {
                  title: '项目名称',
                  dataIndex: 'projectName',
                  key: 'projectName',
                  width: 150,
                },
                {
                  title: '接收日期',
                  dataIndex: 'receivedDate',
                  key: 'receivedDate',
                  width: 120,
                  render: (date: string) => dayjs(date).format('YYYY-MM-DD')
                }
              ]}
              dataSource={selectedSamples}
              rowKey="id"
              rowSelection={{
                selectedRowKeys: selectedSampleKeys,
                onChange: (selectedKeys: React.Key[]) => {
                  setSelectedSampleKeys(selectedKeys);
                },
                getCheckboxProps: () => ({
                  // 所有样本都可以被选中移除
                })
              }}
              pagination={false}
              scroll={{ y: 300 }}
              size="small"
            />
          </div>
        </div>
      </Drawer>
    </div>
  );
};

export default DNAExtraction;