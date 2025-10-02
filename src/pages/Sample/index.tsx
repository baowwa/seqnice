import React, { useState, useEffect } from 'react';
import {
  Card,
  Table,
  Button,
  Space,
  Modal,
  Form,
  Input,
  Select,
  DatePicker,
  Tag,
  Popconfirm,
  message,
  Row,
  Col,
  Statistic,
  Upload,
  QRCode,
  Tooltip,
  Divider,
  Badge,
  Steps,
  Progress,
  Radio,
  Tabs,
  Alert,
  Typography
} from 'antd';
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  EyeOutlined,
  QrcodeOutlined,
  UploadOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  ExclamationCircleOutlined,
  PrinterOutlined,
  ScanOutlined,
  DownloadOutlined,
  InboxOutlined,
  FileExcelOutlined
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import type { Sample, SampleStatus, Project, SampleType } from '../../types';
import dayjs from 'dayjs';

const { Option } = Select;
const { TextArea } = Input;
const { Step } = Steps;
const { TabPane } = Tabs;
const { Title, Text } = Typography;
const { Dragger } = Upload;

/**
 * 样本接收模式
 */
type ReceptionMode = 'single' | 'batch';

/**
 * 批量导入步骤
 */
type ImportStep = 'template' | 'upload' | 'validate' | 'confirm';

/**
 * 样本接收组件
 * 负责样本登记、条码管理、质检等功能
 * 支持单个登记和批量导入两种模式
 */
const SampleReceiving: React.FC = () => {
  // 状态管理
  const [samples, setSamples] = useState<Sample[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [sampleTypes, setSampleTypes] = useState<SampleType[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [barcodeModalVisible, setBarcodeModalVisible] = useState(false);
  const [batchImportModalVisible, setBatchImportModalVisible] = useState(false);
  const [editingSample, setEditingSample] = useState<Sample | null>(null);
  const [selectedSample, setSelectedSample] = useState<Sample | null>(null);
  const [form] = Form.useForm();
  const [searchText, setSearchText] = useState('');
  const [statusFilter, setStatusFilter] = useState<SampleStatus | ''>('');
  const [projectFilter, setProjectFilter] = useState<string>('');
  
  // 新增状态：接收模式和批量导入相关
  const [receptionMode, setReceptionMode] = useState<ReceptionMode>('single');
  const [importStep, setImportStep] = useState<ImportStep>('template');
  const [uploadedFile, setUploadedFile] = useState<any>(null);
  const [previewData, setPreviewData] = useState<any[]>([]);
  const [validationResults, setValidationResults] = useState<any[]>([]);

  // 模拟API调用 - 获取样本列表
  const fetchSamples = async () => {
    setLoading(true);
    try {
      // 模拟API延迟
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const mockSamples: Sample[] = [
        {
          id: '1',
          code: 'S001',
          barcode: 'BC001234567890',
          name: '肠道菌群样本-患者001',
          projectId: '1',
          projectName: '肠道菌群多样性分析项目',
          sampleTypeId: '1',
          sampleTypeName: '粪便样本',
          status: 'received',
          priority: 'high',
          receivedDate: '2024-01-15',
          expectedDate: '2024-01-20',
          volume: 5.0,
          concentration: 120.5,
          purity: 1.85,
          qualityScore: 95,
          storageLocation: 'A1-01-001',
          temperature: -80,
          receiverId: '1',
          receiverName: '张三',
          notes: '样本状态良好，无异常',
          qcPassed: true,
          createdAt: '2024-01-15T09:00:00Z',
          updatedAt: '2024-01-15T10:30:00Z'
        },
        {
          id: '2',
          code: 'S002',
          barcode: 'BC001234567891',
          name: '土壤微生物样本-地点A',
          projectId: '2',
          projectName: '土壤微生物群落结构研究',
          sampleTypeId: '2',
          sampleTypeName: '土壤样本',
          status: 'processing',
          priority: 'medium',
          receivedDate: '2024-02-01',
          expectedDate: '2024-02-05',
          volume: 10.0,
          concentration: 85.2,
          purity: 1.65,
          qualityScore: 88,
          storageLocation: 'B2-02-015',
          temperature: -20,
          receiverId: '2',
          receiverName: '李四',
          notes: '需要进一步纯化处理',
          qcPassed: false,
          createdAt: '2024-02-01T14:00:00Z',
          updatedAt: '2024-02-02T11:15:00Z'
        },
        {
          id: '3',
          code: 'S003',
          barcode: 'BC001234567892',
          name: '海水微生物样本-深海001',
          projectId: '3',
          projectName: '海洋微生物基因组测序',
          sampleTypeId: '3',
          sampleTypeName: '水体样本',
          status: 'completed',
          priority: 'high',
          receivedDate: '2023-10-15',
          expectedDate: '2023-10-20',
          volume: 50.0,
          concentration: 200.8,
          purity: 1.95,
          qualityScore: 98,
          storageLocation: 'C3-01-008',
          temperature: -80,
          receiverId: '1',
          receiverName: '张三',
          notes: '优质样本，测序结果优异',
          qcPassed: true,
          createdAt: '2023-10-15T08:30:00Z',
          updatedAt: '2023-12-31T16:45:00Z'
        }
      ];
      
      setSamples(mockSamples);
    } catch (error) {
      message.error('获取样本列表失败');
    } finally {
      setLoading(false);
    }
  };

  // 模拟API调用 - 获取项目列表
  const fetchProjects = async () => {
    const mockProjects: Project[] = [
      { id: '1', name: '肠道菌群多样性分析项目', code: 'PRJ001', customerId: '1', customerName: '北京大学医学院', description: '', status: 'in_progress', priority: 'high', startDate: '2024-01-15', endDate: '2024-03-15', estimatedDays: 60, actualDays: 45, progress: 75, managerId: '1', managerName: '张三', createdAt: '', updatedAt: '' },
      { id: '2', name: '土壤微生物群落结构研究', code: 'PRJ002', customerId: '2', customerName: '中科院生态环境研究中心', description: '', status: 'planning', priority: 'medium', startDate: '2024-03-01', endDate: '2024-05-01', estimatedDays: 60, actualDays: 0, progress: 10, managerId: '2', managerName: '李四', createdAt: '', updatedAt: '' },
      { id: '3', name: '海洋微生物基因组测序', code: 'PRJ003', customerId: '3', customerName: '青岛海洋大学', description: '', status: 'completed', priority: 'high', startDate: '2023-10-01', endDate: '2023-12-31', estimatedDays: 90, actualDays: 85, progress: 100, managerId: '1', managerName: '张三', createdAt: '', updatedAt: '' }
    ];
    setProjects(mockProjects);
  };

  // 模拟API调用 - 获取样本类型列表
  const fetchSampleTypes = async () => {
    const mockSampleTypes: SampleType[] = [
      { id: '1', name: '粪便样本', code: 'FECES', category: 'biological', description: '人体或动物粪便样本', storageCondition: '-80°C冷冻保存', processingTime: 24, isActive: true, createdAt: '', updatedAt: '' },
      { id: '2', name: '土壤样本', code: 'SOIL', category: 'environmental', description: '各类土壤环境样本', storageCondition: '-20°C冷冻保存', processingTime: 48, isActive: true, createdAt: '', updatedAt: '' },
      { id: '3', name: '水体样本', code: 'WATER', category: 'environmental', description: '海水、淡水等水体样本', storageCondition: '-80°C冷冻保存', processingTime: 12, isActive: true, createdAt: '', updatedAt: '' }
    ];
    setSampleTypes(mockSampleTypes);
  };

  // 组件挂载时获取数据
  useEffect(() => {
    fetchSamples();
    fetchProjects();
    fetchSampleTypes();
  }, []);

  // 样本状态标签颜色映射
  const getStatusColor = (status: SampleStatus) => {
    const colorMap = {
      received: 'blue',
      processing: 'orange',
      completed: 'green',
      failed: 'red',
      on_hold: 'gray'
    };
    return colorMap[status];
  };

  // 样本状态中文映射
  const getStatusText = (status: SampleStatus) => {
    const textMap = {
      received: '已接收',
      processing: '处理中',
      completed: '已完成',
      failed: '失败',
      on_hold: '暂停'
    };
    return textMap[status];
  };

  // 优先级颜色映射
  const getPriorityColor = (priority: string) => {
    const colorMap = {
      low: 'green',
      medium: 'orange',
      high: 'red',
      urgent: 'purple'
    };
    return colorMap[priority as keyof typeof colorMap];
  };

  // 优先级中文映射
  const getPriorityText = (priority: string) => {
    const textMap = {
      low: '低',
      medium: '中',
      high: '高',
      urgent: '紧急'
    };
    return textMap[priority as keyof typeof textMap];
  };

  // 处理新增样本
  const handleAddSample = () => {
    setEditingSample(null);
    form.resetFields();
    // 自动生成条码
    const newBarcode = `BC${Date.now()}`;
    form.setFieldsValue({ barcode: newBarcode });
    setModalVisible(true);
  };

  // 处理编辑样本
  const handleEditSample = (sample: Sample) => {
    setEditingSample(sample);
    form.setFieldsValue({
      ...sample,
      receivedDate: dayjs(sample.receivedDate),
      expectedDate: sample.expectedDate ? dayjs(sample.expectedDate) : null
    });
    setModalVisible(true);
  };

  // 处理查看样本详情
  const handleViewSample = (sample: Sample) => {
    setSelectedSample(sample);
    setDetailModalVisible(true);
  };

  // 处理查看条码
  const handleViewBarcode = (sample: Sample) => {
    setSelectedSample(sample);
    setBarcodeModalVisible(true);
  };

  // 下载Excel模板
  const handleDownloadTemplate = () => {
    // 模拟下载Excel模板
    const templateData = [
      ['样本编号', '样本名称', '样本类型', '来源项目', '客户名称', '接收日期', '预期完成日期', '体积(mL)', '浓度(ng/μL)', '纯度', '优先级', '备注'],
      ['S001', '示例样本1', '粪便样本', '肠道菌群多样性分析项目', '北京大学医学院', '2024-01-15', '2024-01-20', '5.0', '120.5', '1.85', 'high', '样本状态良好'],
      ['S002', '示例样本2', '土壤样本', '土壤微生物群落结构研究', '中科院生态环境研究中心', '2024-02-01', '2024-02-05', '10.0', '85.2', '1.65', 'medium', '需要进一步处理']
    ];
    
    // 这里应该调用实际的Excel导出功能
    message.success('模板下载成功');
  };

  // 处理文件上传
  const handleFileUpload = (info: any) => {
    const { status } = info.file;
    if (status === 'done') {
      // 模拟解析Excel文件
      const mockPreviewData = [
        { 样本编号: 'S001', 样本名称: '样本1', 样本类型: 'DNA', 来源项目: '项目A', 状态: '✅' },
        { 样本编号: 'S002', 样本名称: '样本2', 样本类型: 'RNA', 来源项目: '项目B', 状态: '⚠️' },
        { 样本编号: 'S003', 样本名称: '样本3', 样本类型: 'DNA', 来源项目: '项目C', 状态: '✅' },
        { 样本编号: 'S004', 样本名称: '样本4', 样本类型: 'Protein', 来源项目: '项目D', 状态: '❌' },
        { 样本编号: 'S005', 样本名称: '样本5', 样本类型: 'DNA', 来源项目: '项目E', 状态: '✅' }
      ];
      setPreviewData(mockPreviewData);
      setUploadedFile(info.file);
      setImportStep('validate');
      message.success(`${info.file.name} 文件上传成功`);
    } else if (status === 'error') {
      message.error(`${info.file.name} 文件上传失败`);
    }
  };

  // 验证数据
  const handleValidateData = () => {
    // 模拟数据验证
    const results = previewData.map((item, index) => ({
      ...item,
      rowIndex: index + 1,
      isValid: item.状态 === '✅',
      errors: item.状态 === '❌' ? ['样本类型不支持'] : item.状态 === '⚠️' ? ['项目名称需要确认'] : []
    }));
    setValidationResults(results);
    setImportStep('confirm');
    message.success('数据验证完成');
  };

  // 确认导入
  const handleConfirmImport = async () => {
    try {
      setLoading(true);
      // 模拟批量导入
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const validData = validationResults.filter(item => item.isValid);
      const newSamples = validData.map((item, index) => ({
        id: (Date.now() + index).toString(),
        code: item.样本编号,
        barcode: `BC${Date.now() + index}`,
        name: item.样本名称,
        projectId: '1',
        projectName: item.来源项目,
        sampleTypeId: '1',
        sampleTypeName: item.样本类型,
        status: 'received' as SampleStatus,
        priority: 'medium',
        receivedDate: dayjs().format('YYYY-MM-DD'),
        expectedDate: dayjs().add(5, 'day').format('YYYY-MM-DD'),
        volume: 5.0,
        receiverId: '1',
        receiverName: '当前用户',
        qcPassed: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }));
      
      setSamples([...samples, ...newSamples]);
      setBatchImportModalVisible(false);
      setImportStep('template');
      setPreviewData([]);
      setValidationResults([]);
      setUploadedFile(null);
      message.success(`成功导入 ${validData.length} 个样本`);
    } catch (error) {
      message.error('批量导入失败');
    } finally {
      setLoading(false);
    }
  };

  // 重置批量导入
  const handleResetImport = () => {
    setImportStep('template');
    setPreviewData([]);
    setValidationResults([]);
    setUploadedFile(null);
  };

  /**
   * 处理保存样本
   * @param values 表单数据
   * @returns Promise<void>
   */
  const handleSaveSample = async (values: any): Promise<void> => {
    try {
      setLoading(true);
      
      // 模拟API调用延迟
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // 获取选中的项目和样本类型信息
      const selectedProject = projects.find(p => p.id === values.projectId);
      const selectedSampleType = sampleTypes.find(st => st.id === values.sampleTypeId);
      
      if (editingSample) {
        // 编辑现有样本
        const updatedSample: Sample = {
          ...editingSample,
          ...values,
          projectName: selectedProject?.name || '',
          sampleTypeName: selectedSampleType?.name || '',
          receivedDate: values.receivedDate ? dayjs(values.receivedDate).format('YYYY-MM-DD') : '',
          expectedDate: values.expectedDate ? dayjs(values.expectedDate).format('YYYY-MM-DD') : '',
          updatedAt: new Date().toISOString()
        };
        
        setSamples(samples.map(sample => 
          sample.id === editingSample.id ? updatedSample : sample
        ));
        message.success('样本信息更新成功');
      } else {
        // 新增样本
        const newSample: Sample = {
          id: Date.now().toString(),
          code: values.code,
          barcode: values.barcode || `BC${Date.now()}`,
          name: values.name,
          projectId: values.projectId,
          projectName: selectedProject?.name || '',
          sampleTypeId: values.sampleTypeId,
          sampleTypeName: selectedSampleType?.name || '',
          status: 'received' as SampleStatus,
          priority: values.priority || 'medium',
          receivedDate: values.receivedDate ? dayjs(values.receivedDate).format('YYYY-MM-DD') : dayjs().format('YYYY-MM-DD'),
          expectedDate: values.expectedDate ? dayjs(values.expectedDate).format('YYYY-MM-DD') : '',
          volume: values.volume ? parseFloat(values.volume) : undefined,
          concentration: values.concentration ? parseFloat(values.concentration) : undefined,
          purity: values.purity ? parseFloat(values.purity) : undefined,
          qualityScore: 85, // 默认质量分数
          storageLocation: `A${Math.floor(Math.random() * 9) + 1}-${String(Math.floor(Math.random() * 99) + 1).padStart(2, '0')}-${String(Math.floor(Math.random() * 999) + 1).padStart(3, '0')}`,
          temperature: -80, // 默认存储温度
          receiverId: '1', // 当前用户ID
          receiverName: '当前用户', // 当前用户名
          notes: values.notes || '',
          qcPassed: true, // 默认质检通过
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
        
        setSamples([...samples, newSample]);
        message.success('样本登记成功');
      }
      
      // 重置表单和关闭模态框
      setModalVisible(false);
      form.resetFields();
      setEditingSample(null);
      
    } catch (error) {
      console.error('保存样本失败:', error);
      message.error('保存样本失败，请重试');
    } finally {
      setLoading(false);
    }
  };

  /**
   * 处理删除样本
   * @param id 样本ID
   */
  const handleDeleteSample = async (id: string) => {
    try {
      setLoading(true);
      // 模拟API调用
      await new Promise(resolve => setTimeout(resolve, 500));
      setSamples(samples.filter(sample => sample.id !== id));
      message.success('样本删除成功');
    } catch (error) {
      message.error('删除样本失败');
    } finally {
      setLoading(false);
    }
  };

  /**
   * 处理生成条码
   * @param sample 样本对象
   */
  const handleGenerateBarcode = (sample: Sample) => {
    setSelectedSample(sample);
    setBarcodeModalVisible(true);
  };

  // 过滤样本数据
  const filteredSamples = samples.filter(sample => {
    const matchesSearch = !searchText || 
      sample.name.toLowerCase().includes(searchText.toLowerCase()) ||
      sample.code.toLowerCase().includes(searchText.toLowerCase());
    const matchesStatus = !statusFilter || sample.status === statusFilter;
    const matchesProject = !projectFilter || sample.projectId === projectFilter;
    return matchesSearch && matchesStatus && matchesProject;
  });

  // 统计数据
  const stats = {
    total: samples.length,
    received: samples.filter(s => s.status === 'received').length,
    processing: samples.filter(s => s.status === 'processing').length,
    completed: samples.filter(s => s.status === 'completed').length
  };

  // 表格列定义
  const columns: ColumnsType<Sample> = [
    {
      title: '样本编号',
      dataIndex: 'code',
      key: 'code',
      width: 120,
      fixed: 'left'
    },
    {
      title: '样本名称',
      dataIndex: 'name',
      key: 'name',
      width: 200,
      ellipsis: true
    },
    {
      title: '项目名称',
      dataIndex: 'projectName',
      key: 'projectName',
      width: 180,
      ellipsis: true
    },
    {
      title: '样本类型',
      dataIndex: 'sampleTypeName',
      key: 'sampleTypeName',
      width: 120
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: (status: SampleStatus) => (
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
      render: (priority: string) => (
        <Tag color={getPriorityColor(priority)}>
          {getPriorityText(priority)}
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
      title: '预期完成',
      dataIndex: 'expectedDate',
      key: 'expectedDate',
      width: 120
    },
    {
      title: '质检状态',
      dataIndex: 'qcPassed',
      key: 'qcPassed',
      width: 100,
      render: (qcPassed: boolean) => (
        qcPassed ? 
          <Badge status="success" text="通过" /> : 
          <Badge status="error" text="未通过" />
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
              onClick={() => handleViewSample(record)}
            />
          </Tooltip>
          <Tooltip title="编辑">
            <Button 
              type="text" 
              icon={<EditOutlined />} 
              onClick={() => handleEditSample(record)}
            />
          </Tooltip>
          <Tooltip title="生成条码">
            <Button 
              type="text" 
              icon={<QrcodeOutlined />} 
              onClick={() => handleGenerateBarcode(record)}
            />
          </Tooltip>
          <Popconfirm
            title="确定要删除这个样本吗？"
            onConfirm={() => handleDeleteSample(record.id)}
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
      {/* 页面标题和统计信息 */}
      <Card style={{ marginBottom: 24 }}>
        <Row gutter={16} align="middle">
          <Col span={12}>
            <Title level={2} style={{ margin: 0 }}>
              样本接收
            </Title>
            <Text type="secondary">
              📊 今日统计: 接收{stats.received}样本 | 处理中{stats.processing}个 | 已完成{stats.completed}个
            </Text>
          </Col>
          <Col span={12} style={{ textAlign: 'right' }}>
            <Space size="large">
              <Statistic title="总样本数" value={stats.total} />
              <Statistic title="待处理" value={stats.received} />
              <Statistic title="进行中" value={stats.processing} />
              <Statistic title="已完成" value={stats.completed} />
            </Space>
          </Col>
        </Row>
      </Card>

      {/* 接收模式选择和快捷操作 */}
      <Card style={{ marginBottom: 24 }}>
        <Row gutter={16} align="middle">
          <Col span={12}>
            <Space size="large">
              <div>
                <Text strong>接收模式：</Text>
                <Radio.Group 
                  value={receptionMode} 
                  onChange={(e) => setReceptionMode(e.target.value)}
                  style={{ marginLeft: 8 }}
                >
                  <Radio.Button value="single">🔘 单个登记</Radio.Button>
                  <Radio.Button value="batch">🔘 批量导入</Radio.Button>
                </Radio.Group>
              </div>
              <Button 
                type="primary" 
                icon={<ScanOutlined />}
                style={{ backgroundColor: '#52c41a', borderColor: '#52c41a' }}
              >
                扫描枪模式
              </Button>
            </Space>
          </Col>
          <Col span={12} style={{ textAlign: 'right' }}>
            <Space>
              {receptionMode === 'single' ? (
                <Button 
                  type="primary" 
                  icon={<PlusOutlined />} 
                  onClick={handleAddSample}
                >
                  新增样本
                </Button>
              ) : (
                <Button 
                  type="primary" 
                  icon={<UploadOutlined />} 
                  onClick={() => setBatchImportModalVisible(true)}
                >
                  批量导入
                </Button>
              )}
            </Space>
          </Col>
        </Row>
      </Card>

      {/* 搜索和筛选 */}
      <Card style={{ marginBottom: 24 }}>
        <Row gutter={16}>
          <Col span={8}>
            <Input.Search
              placeholder="搜索样本编号或名称"
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              onSearch={setSearchText}
              allowClear
            />
          </Col>
          <Col span={6}>
            <Select
              placeholder="筛选状态"
              value={statusFilter}
              onChange={setStatusFilter}
              allowClear
              style={{ width: '100%' }}
            >
              <Option value="received">已接收</Option>
              <Option value="processing">处理中</Option>
              <Option value="completed">已完成</Option>
              <Option value="failed">失败</Option>
              <Option value="on_hold">暂停</Option>
            </Select>
          </Col>
          <Col span={6}>
            <Select
              placeholder="筛选项目"
              value={projectFilter}
              onChange={setProjectFilter}
              allowClear
              style={{ width: '100%' }}
            >
              {projects.map(project => (
                <Option key={project.id} value={project.id}>
                  {project.name}
                </Option>
              ))}
            </Select>
          </Col>
          <Col span={4}>
            <Button 
              type="default" 
              onClick={() => {
                setSearchText('');
                setStatusFilter('');
                setProjectFilter('');
              }}
            >
              重置筛选
            </Button>
          </Col>
        </Row>
      </Card>

      {/* 样本列表 */}
      <Card title="样本列表">
        <Table
          columns={columns}
          dataSource={filteredSamples}
          rowKey="id"
          loading={loading}
          scroll={{ x: 1200 }}
          pagination={{
            total: filteredSamples.length,
            pageSize: 10,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) => 
              `第 ${range[0]}-${range[1]} 条/共 ${total} 条`
          }}
        />
      </Card>

      {/* 单个样本登记/编辑模态框 */}
      <Modal
        title={editingSample ? '编辑样本' : '新增样本'}
        open={modalVisible}
        onCancel={() => {
          setModalVisible(false);
          form.resetFields();
        }}
        footer={null}
        width={800}
      >
        <Form
          form={form}
          labelCol={{ span: 6 }}
          wrapperCol={{ span: 18 }}
          onFinish={handleSaveSample}
        >
          <Form.Item
            label="样本编号"
            name="code"
            rules={[{ required: true, message: '请输入样本编号' }]}
          >
            <Input placeholder="请输入样本编号" />
          </Form.Item>

          <Form.Item
            label="样本类型"
            name="sampleTypeId"
            rules={[{ required: true, message: '请选择样本类型' }]}
          >
            <Select placeholder="请选择样本类型">
              {sampleTypes.map(type => (
                <Option key={type.id} value={type.id}>
                  {type.name}
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            label="样本名称"
            name="name"
            rules={[{ required: true, message: '请输入样本名称' }]}
          >
            <Input placeholder="请输入样本名称" />
          </Form.Item>

          <Form.Item
            label="所属项目"
            name="projectId"
            rules={[{ required: true, message: '请选择所属项目' }]}
          >
            <Select placeholder="请选择所属项目">
              {projects.map(project => (
                <Option key={project.id} value={project.id}>
                  {project.name}
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            label="接收日期"
            name="receivedDate"
            rules={[{ required: true, message: '请选择接收日期' }]}
          >
            <DatePicker style={{ width: '100%' }} />
          </Form.Item>

          <Form.Item
            label="预期完成日期"
            name="expectedDate"
          >
            <DatePicker style={{ width: '100%' }} />
          </Form.Item>

          <Form.Item
            label="体积 (mL)"
            name="volume"
          >
            <Input type="number" placeholder="请输入体积" />
          </Form.Item>

          <Form.Item
            label="浓度 (ng/μL)"
            name="concentration"
          >
            <Input type="number" placeholder="请输入浓度" />
          </Form.Item>

          <Form.Item
            label="优先级"
            name="priority"
            initialValue="medium"
          >
            <Select>
              <Option value="low">低</Option>
              <Option value="medium">中</Option>
              <Option value="high">高</Option>
              <Option value="urgent">紧急</Option>
            </Select>
          </Form.Item>

          <Form.Item
            label="备注信息"
            name="notes"
          >
            <TextArea rows={3} placeholder="请输入备注信息" />
          </Form.Item>
          <Form.Item style={{ textAlign: 'right', marginBottom: 0 }}>
            <Space>
              <Button onClick={() => setModalVisible(false)}>
                取消
              </Button>
              <Button type="primary" htmlType="submit" loading={loading}>
                保存并继续
              </Button>
              <Button 
                type="primary" 
                htmlType="submit" 
                loading={loading}
                onClick={() => {
                  form.validateFields().then(values => {
                    handleSaveSample(values).then(() => {
                      // 保存后查看列表
                    });
                  });
                }}
              >
                保存并查看列表
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>

      {/* 批量导入模态框 */}
      <Modal
        title="批量样本导入"
        open={batchImportModalVisible}
        onCancel={() => {
          setBatchImportModalVisible(false);
          handleResetImport();
        }}
        footer={null}
        width={900}
        destroyOnClose
      >
        <Steps current={importStep === 'template' ? 0 : importStep === 'upload' ? 1 : importStep === 'validate' ? 2 : 3} style={{ marginBottom: 24 }}>
          <Step title="下载模板" />
          <Step title="填写数据" />
          <Step title="上传验证" />
          <Step title="确认导入" />
        </Steps>

        {importStep === 'template' && (
          <div style={{ textAlign: 'center', padding: '40px 0' }}>
            <FileExcelOutlined style={{ fontSize: 64, color: '#52c41a', marginBottom: 16 }} />
            <Title level={4}>步骤1: 下载Excel模板</Title>
            <Text type="secondary" style={{ display: 'block', marginBottom: 24 }}>
              请先下载样本导入模板，按照模板格式填写样本信息
            </Text>
            <Space direction="vertical" size="large">
              <Button 
                type="primary" 
                icon={<DownloadOutlined />} 
                size="large"
                onClick={handleDownloadTemplate}
              >
                下载Excel模板
              </Button>
              <Button 
                type="default" 
                onClick={() => setImportStep('upload')}
              >
                已下载，继续下一步
              </Button>
            </Space>
          </div>
        )}

        {importStep === 'upload' && (
          <div>
            <Title level={4}>步骤2: 上传填写好的Excel文件</Title>
            <Dragger
              name="file"
              multiple={false}
              accept=".xlsx,.xls"
              customRequest={({ file, onSuccess }) => {
                setTimeout(() => {
                  onSuccess?.("ok");
                }, 1000);
              }}
              onChange={handleFileUpload}
              style={{ marginBottom: 16 }}
            >
              <p className="ant-upload-drag-icon">
                <InboxOutlined />
              </p>
              <p className="ant-upload-text">点击或拖拽文件到这里上传</p>
              <p className="ant-upload-hint">
                支持 .xlsx 和 .xls 格式的Excel文件
              </p>
            </Dragger>
            {uploadedFile && (
              <Alert
                message="文件上传成功"
                description={`已上传文件: ${uploadedFile.name}`}
                type="success"
                showIcon
                style={{ marginBottom: 16 }}
              />
            )}
          </div>
        )}

        {importStep === 'validate' && (
          <div>
            <Title level={4}>步骤3: 数据预览和验证</Title>
            <Text type="secondary" style={{ display: 'block', marginBottom: 16 }}>
              预览前5行数据，请检查数据格式是否正确
            </Text>
            <Table
              size="small"
              dataSource={previewData}
              columns={[
                { title: '编号', dataIndex: '样本编号', key: '样本编号' },
                { title: '名称', dataIndex: '样本名称', key: '样本名称' },
                { title: '类型', dataIndex: '样本类型', key: '样本类型' },
                { title: '项目', dataIndex: '来源项目', key: '来源项目' },
                { 
                  title: '状态', 
                  dataIndex: '状态', 
                  key: '状态',
                  render: (status: string) => (
                    <span style={{ 
                      color: status === '✅' ? '#52c41a' : status === '⚠️' ? '#faad14' : '#ff4d4f' 
                    }}>
                      {status}
                    </span>
                  )
                }
              ]}
              pagination={false}
              style={{ marginBottom: 16 }}
            />
            <div style={{ textAlign: 'right' }}>
              <Space>
                <Button onClick={() => setImportStep('upload')}>
                  重新上传
                </Button>
                <Button type="primary" onClick={handleValidateData}>
                  验证数据
                </Button>
              </Space>
            </div>
          </div>
        )}

        {importStep === 'confirm' && (
          <div>
            <Title level={4}>步骤4: 确认导入</Title>
            <Alert
              message="数据验证完成"
              description={`共 ${validationResults.length} 条数据，其中 ${validationResults.filter(r => r.isValid).length} 条有效，${validationResults.filter(r => !r.isValid).length} 条有错误`}
              type={validationResults.filter(r => !r.isValid).length > 0 ? 'warning' : 'success'}
              showIcon
              style={{ marginBottom: 16 }}
            />
            <Table
              size="small"
              dataSource={validationResults}
              columns={[
                { title: '行号', dataIndex: 'rowIndex', key: 'rowIndex', width: 60 },
                { title: '样本编号', dataIndex: '样本编号', key: '样本编号' },
                { title: '样本名称', dataIndex: '样本名称', key: '样本名称' },
                { title: '样本类型', dataIndex: '样本类型', key: '样本类型' },
                { 
                  title: '验证结果', 
                  key: 'validation',
                  render: (_, record) => (
                    record.isValid ? 
                      <Tag color="success">有效</Tag> : 
                      <Tag color="error">错误</Tag>
                  )
                },
                { 
                  title: '错误信息', 
                  dataIndex: 'errors',
                  key: 'errors',
                  render: (errors: string[]) => (
                    errors.length > 0 ? (
                      <Text type="danger">{errors.join(', ')}</Text>
                    ) : null
                  )
                }
              ]}
              pagination={false}
              style={{ marginBottom: 16 }}
            />
            <div style={{ textAlign: 'right' }}>
              <Space>
                <Button onClick={() => setImportStep('upload')}>
                  重新上传
                </Button>
                <Button 
                  type="primary" 
                  onClick={handleConfirmImport}
                  loading={loading}
                  disabled={validationResults.filter(r => r.isValid).length === 0}
                >
                  确认导入
                </Button>
              </Space>
            </div>
          </div>
        )}
      </Modal>

      {/* 样本详情模态框 */}
      <Modal
        title="样本详情"
        open={detailModalVisible}
        onCancel={() => setDetailModalVisible(false)}
        footer={[
          <Button key="close" onClick={() => setDetailModalVisible(false)}>
            关闭
          </Button>
        ]}
        width={800}
      >
        {selectedSample && (
          <div>
            <Row gutter={16}>
              <Col span={12}>
                <Card size="small" title="基本信息">
                  <p><strong>样本编号：</strong>{selectedSample.code}</p>
                  <p><strong>样本名称：</strong>{selectedSample.name}</p>
                  <p><strong>条码：</strong>{selectedSample.barcode}</p>
                  <p><strong>样本类型：</strong>{selectedSample.sampleTypeName}</p>
                  <p><strong>所属项目：</strong>{selectedSample.projectName}</p>
                </Card>
              </Col>
              <Col span={12}>
                <Card size="small" title="状态信息">
                  <p><strong>当前状态：</strong>
                    <Tag color={getStatusColor(selectedSample.status)} style={{ marginLeft: 8 }}>
                      {getStatusText(selectedSample.status)}
                    </Tag>
                  </p>
                  <p><strong>优先级：</strong>
                    <Tag color={getPriorityColor(selectedSample.priority)} style={{ marginLeft: 8 }}>
                      {getPriorityText(selectedSample.priority)}
                    </Tag>
                  </p>
                  <p><strong>质检状态：</strong>
                    <Badge 
                      status={selectedSample.qcPassed ? "success" : "error"} 
                      text={selectedSample.qcPassed ? "通过" : "未通过"}
                      style={{ marginLeft: 8 }}
                    />
                  </p>
                </Card>
              </Col>
            </Row>
            
            <Divider />
            
            <Row gutter={16}>
              <Col span={12}>
                <Card size="small" title="存储信息">
                  <p><strong>存储位置：</strong>{selectedSample.storageLocation}</p>
                  <p><strong>存储温度：</strong>{selectedSample.temperature}°C</p>
                  <p><strong>接收日期：</strong>{dayjs(selectedSample.receivedDate).format('YYYY-MM-DD')}</p>
                  <p><strong>预期完成：</strong>
                    {selectedSample.expectedDate ? 
                      dayjs(selectedSample.expectedDate).format('YYYY-MM-DD') : 
                      '未设置'
                    }
                  </p>
                </Card>
              </Col>
              <Col span={12}>
                <Card size="small" title="处理信息">
                  <p><strong>接收人：</strong>{selectedSample.receiverName}</p>
                  <p><strong>创建时间：</strong>{dayjs(selectedSample.createdAt).format('YYYY-MM-DD HH:mm')}</p>
                  <p><strong>更新时间：</strong>{dayjs(selectedSample.updatedAt).format('YYYY-MM-DD HH:mm')}</p>
                </Card>
              </Col>
            </Row>
            
            <Divider />
            
            <Card size="small" title="备注信息">
              <p>{selectedSample.notes || '无备注'}</p>
            </Card>
          </div>
        )}
      </Modal>

      {/* 条码查看模态框 */}
      <Modal
        title="样本条码"
        open={barcodeModalVisible}
        onCancel={() => setBarcodeModalVisible(false)}
        footer={[
          <Button key="print" type="primary" icon={<PrinterOutlined />}>
            打印条码
          </Button>,
          <Button key="close" onClick={() => setBarcodeModalVisible(false)}>
            关闭
          </Button>
        ]}
        width={400}
      >
        {selectedSample && (
          <div style={{ textAlign: 'center' }}>
            <QRCode value={selectedSample.barcode} size={200} />
            <div style={{ marginTop: 16 }}>
              <p><strong>样本编号：</strong>{selectedSample.code}</p>
              <p><strong>条码：</strong>{selectedSample.barcode}</p>
              <p><strong>样本名称：</strong>{selectedSample.name}</p>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default SampleReceiving;