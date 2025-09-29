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
  Steps,
  Progress,
  Timeline,
  Tabs,
  Descriptions,
  Upload,
  Tooltip,
  Badge,
  Divider,
  Alert
} from 'antd';
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  EyeOutlined,
  PlayCircleOutlined,
  PauseCircleOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  ExclamationCircleOutlined,
  FileTextOutlined,
  UploadOutlined,
  DownloadOutlined,
  ExperimentOutlined,
  SettingOutlined
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import type { ExperimentBatch, Sample, WorkflowStep } from '../../types';
import dayjs from 'dayjs';

const { Option } = Select;
const { TextArea } = Input;
const { Step } = Steps;
const { TabPane } = Tabs;

/**
 * 实验流程组件
 * 负责前处理、文库构建、上机测序等实验流程管理
 */
const ExperimentWorkflow: React.FC = () => {
  // 状态管理
  const [batches, setBatches] = useState<ExperimentBatch[]>([]);
  const [samples, setSamples] = useState<Sample[]>([]);
  const [workflowSteps, setWorkflowSteps] = useState<WorkflowStep[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [workflowModalVisible, setWorkflowModalVisible] = useState(false);
  const [editingBatch, setEditingBatch] = useState<ExperimentBatch | null>(null);
  const [selectedBatch, setSelectedBatch] = useState<ExperimentBatch | null>(null);
  const [form] = Form.useForm();
  const [searchText, setSearchText] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [activeTab, setActiveTab] = useState('batches');

  // 模拟API调用 - 获取实验批次列表
  const fetchBatches = async () => {
    setLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const mockBatches: ExperimentBatch[] = [
        {
          id: '1',
          code: 'EXP001',
          name: '肠道菌群测序批次-202401',
          description: '包含20个肠道菌群样本的16S rRNA测序',
          status: 'in_progress',
          priority: 'high',
          sampleCount: 20,
          samples: [
            {
              id: '1',
              sampleCode: 'S001',
              sampleName: '肠道样本A',
              sampleType: '粪便',
              projectName: '肠道菌群多样性研究',
              clientName: '医科大学',
              receivedDate: '2024-01-15',
              status: 'completed'
            },
            {
              id: '2',
              sampleCode: 'S002',
              sampleName: '肠道样本B',
              sampleType: '粪便',
              projectName: '肠道菌群多样性研究',
              clientName: '医科大学',
              receivedDate: '2024-01-15',
              status: 'completed'
            },
            {
              id: '3',
              sampleCode: 'S003',
              sampleName: '肠道样本C',
              sampleType: '粪便',
              projectName: '肠道菌群多样性研究',
              clientName: '医科大学',
              receivedDate: '2024-01-15',
              status: 'processing'
            }
          ],
          completedSamples: 15,
          startDate: '2024-01-15',
          expectedEndDate: '2024-01-25',
          actualEndDate: null,
          currentStep: 'library_prep',
          progress: 75,
          operatorId: '1',
          operatorName: '张三',
          equipmentId: '1',
          equipmentName: 'Illumina NovaSeq 6000',
          notes: '进展顺利，预计按时完成',
          createdAt: '2024-01-15T09:00:00Z',
          updatedAt: '2024-01-20T14:30:00Z'
        },
        {
          id: '2',
          code: 'EXP002',
          name: '土壤微生物宏基因组测序',
          description: '土壤样本的宏基因组shotgun测序',
          status: 'pending',
          priority: 'medium',
          sampleCount: 12,
          samples: [
            {
              id: '4',
              sampleCode: 'S004',
              sampleName: '土壤样本A',
              sampleType: '土壤',
              projectName: '土壤微生物功能研究',
              clientName: '农科院',
              receivedDate: '2024-01-20',
              status: 'pending'
            },
            {
              id: '5',
              sampleCode: 'S005',
              sampleName: '土壤样本B',
              sampleType: '土壤',
              projectName: '土壤微生物功能研究',
              clientName: '农科院',
              receivedDate: '2024-01-20',
              status: 'pending'
            }
          ],
          completedSamples: 0,
          startDate: '2024-02-01',
          expectedEndDate: '2024-02-15',
          actualEndDate: null,
          currentStep: 'sample_prep',
          progress: 10,
          operatorId: '2',
          operatorName: '李四',
          equipmentId: '2',
          equipmentName: 'Illumina HiSeq X Ten',
          notes: '等待样本质检完成',
          createdAt: '2024-01-25T10:00:00Z',
          updatedAt: '2024-01-25T10:00:00Z'
        },
        {
          id: '3',
          code: 'EXP003',
          name: '海洋微生物多样性分析',
          description: '海水样本的16S+18S双重测序',
          status: 'completed',
          priority: 'high',
          sampleCount: 30,
          completedSamples: 30,
          startDate: '2023-12-01',
          expectedEndDate: '2023-12-20',
          actualEndDate: '2023-12-18',
          currentStep: 'completed',
          progress: 100,
          operatorId: '1',
          operatorName: '张三',
          equipmentId: '1',
          equipmentName: 'Illumina NovaSeq 6000',
          notes: '提前完成，数据质量优异',
          createdAt: '2023-12-01T08:00:00Z',
          updatedAt: '2023-12-18T16:00:00Z'
        }
      ];
      
      setBatches(mockBatches);
    } catch (error) {
      message.error('获取实验批次列表失败');
    } finally {
      setLoading(false);
    }
  };

  // 模拟API调用 - 获取样本列表
  const fetchSamples = async () => {
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
        status: 'processing',
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
      }
    ];
    setSamples(mockSamples);
  };

  // 模拟API调用 - 获取工作流步骤
  const fetchWorkflowSteps = async () => {
    const mockSteps: WorkflowStep[] = [
      {
        id: '1',
        name: '样本前处理',
        code: 'sample_prep',
        description: '样本DNA/RNA提取和质检',
        order: 1,
        estimatedDuration: 480,
        status: 'completed',
        startTime: '2024-01-15T09:00:00Z',
        endTime: '2024-01-15T17:00:00Z',
        operatorId: '1',
        operatorName: '张三',
        notes: '提取效果良好',
        isActive: true,
        createdAt: '2024-01-15T09:00:00Z',
        updatedAt: '2024-01-15T17:00:00Z'
      },
      {
        id: '2',
        name: '文库构建',
        code: 'library_prep',
        description: 'PCR扩增和文库制备',
        order: 2,
        estimatedDuration: 360,
        status: 'in_progress',
        startTime: '2024-01-16T09:00:00Z',
        endTime: null,
        operatorId: '1',
        operatorName: '张三',
        notes: '正在进行PCR扩增',
        isActive: true,
        createdAt: '2024-01-16T09:00:00Z',
        updatedAt: '2024-01-20T14:30:00Z'
      },
      {
        id: '3',
        name: '上机测序',
        code: 'sequencing',
        description: '高通量测序',
        order: 3,
        estimatedDuration: 1440,
        status: 'pending',
        startTime: null,
        endTime: null,
        operatorId: '2',
        operatorName: '李四',
        notes: '等待文库构建完成',
        isActive: true,
        createdAt: '2024-01-15T09:00:00Z',
        updatedAt: '2024-01-15T09:00:00Z'
      },
      {
        id: '4',
        name: '数据质控',
        code: 'quality_control',
        description: '原始数据质量评估',
        order: 4,
        estimatedDuration: 120,
        status: 'pending',
        startTime: null,
        endTime: null,
        operatorId: '3',
        operatorName: '王五',
        notes: '等待测序完成',
        isActive: true,
        createdAt: '2024-01-15T09:00:00Z',
        updatedAt: '2024-01-15T09:00:00Z'
      }
    ];
    setWorkflowSteps(mockSteps);
  };

  // 组件挂载时获取数据
  useEffect(() => {
    fetchBatches();
    fetchSamples();
    fetchWorkflowSteps();
  }, []);

  // 状态标签颜色映射
  const getStatusColor = (status: string) => {
    const colorMap = {
      pending: 'orange',
      in_progress: 'blue',
      completed: 'green',
      failed: 'red',
      paused: 'gray'
    };
    return colorMap[status as keyof typeof colorMap];
  };

  // 状态文本映射
  const getStatusText = (status: string) => {
    const textMap = {
      pending: '待开始',
      in_progress: '进行中',
      completed: '已完成',
      failed: '失败',
      paused: '暂停'
    };
    return textMap[status as keyof typeof textMap];
  };

  // 优先级标签颜色映射
  const getPriorityColor = (priority: string) => {
    const colorMap = {
      high: 'red',
      medium: 'orange',
      low: 'green'
    };
    return colorMap[priority as keyof typeof colorMap];
  };

  // 优先级文本映射
  const getPriorityText = (priority: string) => {
    const textMap = {
      high: '高',
      medium: '中',
      low: '低'
    };
    return textMap[priority as keyof typeof textMap];
  };

  // 工作流步骤状态图标
  const getStepIcon = (status: string) => {
    const iconMap = {
      pending: <ClockCircleOutlined style={{ color: '#faad14' }} />,
      in_progress: <PlayCircleOutlined style={{ color: '#1890ff' }} />,
      completed: <CheckCircleOutlined style={{ color: '#52c41a' }} />,
      failed: <ExclamationCircleOutlined style={{ color: '#f5222d' }} />,
      paused: <PauseCircleOutlined style={{ color: '#8c8c8c' }} />
    };
    return iconMap[status as keyof typeof iconMap];
  };

  // 表格列定义
  const columns: ColumnsType<ExperimentBatch> = [
    {
      title: '批次编号',
      dataIndex: 'code',
      key: 'code',
      width: 120,
      fixed: 'left'
    },
    {
      title: '批次名称',
      dataIndex: 'name',
      key: 'name',
      width: 200,
      ellipsis: {
        showTitle: false
      },
      render: (text) => (
        <Tooltip placement="topLeft" title={text}>
          {text}
        </Tooltip>
      )
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: (status: string) => (
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
      title: '样本数量',
      dataIndex: 'sampleCount',
      key: 'sampleCount',
      width: 100,
      render: (count: number, record) => (
        <span>
          {record.completedSamples}/{count}
        </span>
      )
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
      title: '当前步骤',
      dataIndex: 'currentStep',
      key: 'currentStep',
      width: 120,
      render: (step: string) => {
        const stepNames = {
          sample_prep: '样本前处理',
          library_prep: '文库构建',
          sequencing: '上机测序',
          quality_control: '数据质控',
          completed: '已完成'
        };
        return stepNames[step as keyof typeof stepNames] || step;
      }
    },
    {
      title: '操作员',
      dataIndex: 'operatorName',
      key: 'operatorName',
      width: 100
    },
    {
      title: '设备',
      dataIndex: 'equipmentName',
      key: 'equipmentName',
      width: 150,
      ellipsis: true
    },
    {
      title: '开始日期',
      dataIndex: 'startDate',
      key: 'startDate',
      width: 110,
      render: (date: string) => dayjs(date).format('YYYY-MM-DD')
    },
    {
      title: '预期完成',
      dataIndex: 'expectedEndDate',
      key: 'expectedEndDate',
      width: 110,
      render: (date: string) => dayjs(date).format('YYYY-MM-DD')
    },
    {
      title: '操作',
      key: 'action',
      width: 180,
      fixed: 'right',
      render: (_, record) => (
        <Space size="small">
          <Tooltip title="查看详情">
            <Button
              type="text"
              icon={<EyeOutlined />}
              onClick={() => handleViewBatch(record)}
            />
          </Tooltip>
          <Tooltip title="工作流">
            <Button
              type="text"
              icon={<SettingOutlined />}
              onClick={() => handleViewWorkflow(record)}
            />
          </Tooltip>
          <Tooltip title="编辑">
            <Button
              type="text"
              icon={<EditOutlined />}
              onClick={() => handleEditBatch(record)}
            />
          </Tooltip>
          {record.status === 'in_progress' && (
            <Tooltip title="暂停">
              <Button
                type="text"
                icon={<PauseCircleOutlined />}
                onClick={() => handlePauseBatch(record.id)}
              />
            </Tooltip>
          )}
          {record.status === 'paused' && (
            <Tooltip title="继续">
              <Button
                type="text"
                icon={<PlayCircleOutlined />}
                onClick={() => handleResumeBatch(record.id)}
              />
            </Tooltip>
          )}
          <Popconfirm
            title="确定要删除这个实验批次吗？"
            onConfirm={() => handleDeleteBatch(record.id)}
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

  // 处理新增实验批次
  const handleAddBatch = () => {
    setEditingBatch(null);
    form.resetFields();
    setModalVisible(true);
  };

  // 处理编辑实验批次
  const handleEditBatch = (batch: ExperimentBatch) => {
    setEditingBatch(batch);
    form.setFieldsValue({
      ...batch,
      startDate: dayjs(batch.startDate),
      expectedEndDate: dayjs(batch.expectedEndDate)
    });
    setModalVisible(true);
  };

  // 处理查看实验批次详情
  const handleViewBatch = (batch: ExperimentBatch) => {
    setSelectedBatch(batch);
    setDetailModalVisible(true);
  };

  // 处理查看工作流
  const handleViewWorkflow = (batch: ExperimentBatch) => {
    setSelectedBatch(batch);
    setWorkflowModalVisible(true);
  };

  // 处理暂停实验批次
  const handlePauseBatch = async (id: string) => {
    try {
      await new Promise(resolve => setTimeout(resolve, 500));
      setBatches(batches.map(b => 
        b.id === id ? { ...b, status: 'paused' } : b
      ));
      message.success('实验批次已暂停');
    } catch (error) {
      message.error('暂停实验批次失败');
    }
  };

  // 处理继续实验批次
  const handleResumeBatch = async (id: string) => {
    try {
      await new Promise(resolve => setTimeout(resolve, 500));
      setBatches(batches.map(b => 
        b.id === id ? { ...b, status: 'in_progress' } : b
      ));
      message.success('实验批次已继续');
    } catch (error) {
      message.error('继续实验批次失败');
    }
  };

  // 处理删除实验批次
  const handleDeleteBatch = async (id: string) => {
    try {
      await new Promise(resolve => setTimeout(resolve, 500));
      setBatches(batches.filter(b => b.id !== id));
      message.success('实验批次删除成功');
    } catch (error) {
      message.error('删除实验批次失败');
    }
  };

  // 处理表单提交
  const handleSubmit = async (values: any) => {
    try {
      setLoading(true);
      
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const batchData = {
        ...values,
        startDate: values.startDate.format('YYYY-MM-DD'),
        expectedEndDate: values.expectedEndDate.format('YYYY-MM-DD'),
        progress: 0,
        completedSamples: 0,
        currentStep: 'sample_prep'
      };

      if (editingBatch) {
        // 更新实验批次
        const updatedBatch = {
          ...editingBatch,
          ...batchData,
          updatedAt: new Date().toISOString()
        };
        setBatches(batches.map(b => b.id === editingBatch.id ? updatedBatch : b));
        message.success('实验批次更新成功');
      } else {
        // 新增实验批次
        const newBatch: ExperimentBatch = {
          id: Date.now().toString(),
          code: `EXP${String(batches.length + 1).padStart(3, '0')}`,
          ...batchData,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
        setBatches([...batches, newBatch]);
        message.success('实验批次创建成功');
      }

      setModalVisible(false);
      form.resetFields();
    } catch (error) {
      message.error('操作失败');
    } finally {
      setLoading(false);
    }
  };

  // 过滤实验批次数据
  const filteredBatches = batches.filter(batch => {
    const matchesSearch = !searchText || 
      batch.name.toLowerCase().includes(searchText.toLowerCase()) ||
      batch.code.toLowerCase().includes(searchText.toLowerCase()) ||
      batch.description.toLowerCase().includes(searchText.toLowerCase());
    
    const matchesStatus = !statusFilter || batch.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  // 计算统计数据
  const statistics = {
    total: batches.length,
    pending: batches.filter(b => b.status === 'pending').length,
    inProgress: batches.filter(b => b.status === 'in_progress').length,
    completed: batches.filter(b => b.status === 'completed').length,
    totalSamples: batches.reduce((sum, b) => sum + b.sampleCount, 0),
    completedSamples: batches.reduce((sum, b) => sum + b.completedSamples, 0)
  };

  return (
    <div>
      {/* 统计卡片 */}
      <Row gutter={16} style={{ marginBottom: 16 }}>
        <Col span={6}>
          <Card>
            <Statistic
              title="实验批次总数"
              value={statistics.total}
              prefix={<ExperimentOutlined />}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="进行中"
              value={statistics.inProgress}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="样本完成率"
              value={statistics.totalSamples > 0 ? (statistics.completedSamples / statistics.totalSamples * 100) : 0}
              precision={1}
              suffix="%"
              valueStyle={{ 
                color: statistics.completedSamples / statistics.totalSamples > 0.8 ? '#52c41a' : '#1890ff' 
              }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="已完成批次"
              value={statistics.completed}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
      </Row>

      {/* 主要内容 */}
      <Card>
        <Tabs activeKey={activeTab} onChange={setActiveTab}>
          <TabPane tab="实验批次" key="batches">
            <div style={{ marginBottom: 16 }}>
              <Space>
                <Input.Search
                  placeholder="搜索批次名称、编号或描述"
                  value={searchText}
                  onChange={(e) => setSearchText(e.target.value)}
                  style={{ width: 300 }}
                />
                <Select
                  placeholder="筛选状态"
                  value={statusFilter}
                  onChange={setStatusFilter}
                  style={{ width: 120 }}
                  allowClear
                >
                  <Option value="pending">待开始</Option>
                  <Option value="in_progress">进行中</Option>
                  <Option value="completed">已完成</Option>
                  <Option value="failed">失败</Option>
                  <Option value="paused">暂停</Option>
                </Select>
                <Button
                  type="primary"
                  icon={<PlusOutlined />}
                  onClick={handleAddBatch}
                >
                  创建实验批次
                </Button>
              </Space>
            </div>

            <Table
              columns={columns}
              dataSource={filteredBatches}
              rowKey="id"
              loading={loading}
              scroll={{ x: 1600 }}
              pagination={{
                total: filteredBatches.length,
                pageSize: 10,
                showSizeChanger: true,
                showQuickJumper: true,
                showTotal: (total) => `共 ${total} 条记录`
              }}
            />
          </TabPane>

          <TabPane tab="工作流模板" key="workflow">
            <Alert
              message="工作流步骤"
              description="标准的微生物测序实验流程包含以下步骤"
              type="info"
              showIcon
              style={{ marginBottom: 16 }}
            />
            
            <Steps direction="vertical" current={1}>
              {workflowSteps.map((step, index) => (
                <Step
                  key={step.id}
                  title={step.name}
                  description={
                    <div>
                      <p>{step.description}</p>
                      <p>预计耗时: {Math.floor(step.estimatedDuration / 60)}小时{step.estimatedDuration % 60}分钟</p>
                      <p>操作员: {step.operatorName}</p>
                      {step.notes && <p>备注: {step.notes}</p>}
                    </div>
                  }
                  status={
                    step.status === 'completed' ? 'finish' :
                    step.status === 'in_progress' ? 'process' :
                    step.status === 'failed' ? 'error' : 'wait'
                  }
                  icon={getStepIcon(step.status)}
                />
              ))}
            </Steps>
          </TabPane>
        </Tabs>
      </Card>

      {/* 新增/编辑实验批次模态框 */}
      <Modal
        title={editingBatch ? '编辑实验批次' : '创建实验批次'}
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
          layout="vertical"
          onFinish={handleSubmit}
        >
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="name"
                label="批次名称"
                rules={[{ required: true, message: '请输入批次名称' }]}
              >
                <Input placeholder="请输入批次名称" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="priority"
                label="优先级"
                rules={[{ required: true, message: '请选择优先级' }]}
              >
                <Select placeholder="请选择优先级">
                  <Option value="high">高</Option>
                  <Option value="medium">中</Option>
                  <Option value="low">低</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            name="description"
            label="批次描述"
            rules={[{ required: true, message: '请输入批次描述' }]}
          >
            <TextArea rows={3} placeholder="请输入批次描述" />
          </Form.Item>

          <Row gutter={16}>
            <Col span={8}>
              <Form.Item
                name="sampleCount"
                label="样本数量"
                rules={[{ required: true, message: '请输入样本数量' }]}
              >
                <Input type="number" min={1} placeholder="请输入样本数量" />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                name="startDate"
                label="开始日期"
                rules={[{ required: true, message: '请选择开始日期' }]}
              >
                <DatePicker style={{ width: '100%' }} />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                name="expectedEndDate"
                label="预期完成日期"
                rules={[{ required: true, message: '请选择预期完成日期' }]}
              >
                <DatePicker style={{ width: '100%' }} />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="operatorId"
                label="操作员"
                rules={[{ required: true, message: '请选择操作员' }]}
              >
                <Select placeholder="请选择操作员">
                  <Option value="1">张三</Option>
                  <Option value="2">李四</Option>
                  <Option value="3">王五</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="equipmentId"
                label="测序设备"
                rules={[{ required: true, message: '请选择测序设备' }]}
              >
                <Select placeholder="请选择测序设备">
                  <Option value="1">Illumina NovaSeq 6000</Option>
                  <Option value="2">Illumina HiSeq X Ten</Option>
                  <Option value="3">Ion Torrent PGM</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            name="status"
            label="批次状态"
            rules={[{ required: true, message: '请选择批次状态' }]}
          >
            <Select placeholder="请选择批次状态">
              <Option value="pending">待开始</Option>
              <Option value="in_progress">进行中</Option>
              <Option value="completed">已完成</Option>
              <Option value="paused">暂停</Option>
            </Select>
          </Form.Item>

          <Form.Item
            name="notes"
            label="备注"
          >
            <TextArea rows={3} placeholder="请输入备注信息" />
          </Form.Item>

          <Form.Item style={{ textAlign: 'right', marginBottom: 0 }}>
            <Space>
              <Button onClick={() => setModalVisible(false)}>
                取消
              </Button>
              <Button type="primary" htmlType="submit" loading={loading}>
                {editingBatch ? '更新' : '创建'}
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>

      {/* 实验批次详情模态框 */}
      <Modal
        title="实验批次详情"
        open={detailModalVisible}
        onCancel={() => setDetailModalVisible(false)}
        footer={[
          <Button key="close" onClick={() => setDetailModalVisible(false)}>
            关闭
          </Button>
        ]}
        width={900}
      >
        {selectedBatch && (
          <div>
            <Descriptions bordered column={2}>
              <Descriptions.Item label="批次编号">{selectedBatch.code}</Descriptions.Item>
              <Descriptions.Item label="批次名称">{selectedBatch.name}</Descriptions.Item>
              <Descriptions.Item label="状态">
                <Tag color={getStatusColor(selectedBatch.status)}>
                  {getStatusText(selectedBatch.status)}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="优先级">
                <Tag color={getPriorityColor(selectedBatch.priority)}>
                  {getPriorityText(selectedBatch.priority)}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="样本数量">
                <Badge count={selectedBatch.sampleCount} showZero color="#1890ff" />
                <span style={{ marginLeft: 8 }}>
                  已完成: {selectedBatch.completedSamples}
                </span>
              </Descriptions.Item>
              <Descriptions.Item label="进度">
                <Progress percent={selectedBatch.progress} size="small" />
              </Descriptions.Item>
              <Descriptions.Item label="操作员">{selectedBatch.operatorName}</Descriptions.Item>
              <Descriptions.Item label="测序设备">{selectedBatch.equipmentName}</Descriptions.Item>
              <Descriptions.Item label="开始日期">
                {dayjs(selectedBatch.startDate).format('YYYY-MM-DD')}
              </Descriptions.Item>
              <Descriptions.Item label="预期完成">
                {dayjs(selectedBatch.expectedEndDate).format('YYYY-MM-DD')}
              </Descriptions.Item>
              <Descriptions.Item label="实际完成">
                {selectedBatch.actualEndDate ? 
                  dayjs(selectedBatch.actualEndDate).format('YYYY-MM-DD') : 
                  '未完成'
                }
              </Descriptions.Item>
              <Descriptions.Item label="当前步骤">
                {selectedBatch.currentStep === 'sample_prep' && '样本前处理'}
                {selectedBatch.currentStep === 'library_prep' && '文库构建'}
                {selectedBatch.currentStep === 'sequencing' && '上机测序'}
                {selectedBatch.currentStep === 'quality_control' && '数据质控'}
                {selectedBatch.currentStep === 'completed' && '已完成'}
              </Descriptions.Item>
            </Descriptions>
            
            <Divider />
            
            <Descriptions bordered column={1}>
              <Descriptions.Item label="批次描述">
                {selectedBatch.description}
              </Descriptions.Item>
              <Descriptions.Item label="样本清单">
                <Table
                  dataSource={selectedBatch.samples || []}
                  columns={[
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
                        <Tag color="blue">{type}</Tag>
                      )
                    },
                    {
                      title: '项目名称',
                      dataIndex: 'projectName',
                      key: 'projectName',
                      width: 200
                    },
                    {
                      title: '客户名称',
                      dataIndex: 'clientName',
                      key: 'clientName',
                      width: 120
                    },
                    {
                      title: '接收日期',
                      dataIndex: 'receivedDate',
                      key: 'receivedDate',
                      width: 120,
                      render: (date: string) => dayjs(date).format('YYYY-MM-DD')
                    },
                    {
                      title: '状态',
                      dataIndex: 'status',
                      key: 'status',
                      width: 100,
                      render: (status: string) => {
                        const statusConfig = {
                          completed: { color: 'green', text: '已完成' },
                          processing: { color: 'blue', text: '处理中' },
                          pending: { color: 'orange', text: '待处理' },
                          failed: { color: 'red', text: '失败' }
                        };
                        const config = statusConfig[status as keyof typeof statusConfig] || 
                                     { color: 'default', text: status };
                        return <Tag color={config.color}>{config.text}</Tag>;
                      }
                    }
                  ]}
                  pagination={false}
                  size="small"
                  scroll={{ y: 300 }}
                />
              </Descriptions.Item>
              <Descriptions.Item label="备注">
                {selectedBatch.notes || '无备注'}
              </Descriptions.Item>
            </Descriptions>
          </div>
        )}
      </Modal>

      {/* 工作流详情模态框 */}
      <Modal
        title="实验工作流"
        open={workflowModalVisible}
        onCancel={() => setWorkflowModalVisible(false)}
        footer={[
          <Button key="close" onClick={() => setWorkflowModalVisible(false)}>
            关闭
          </Button>
        ]}
        width={800}
      >
        {selectedBatch && (
          <div>
            <Alert
              message={`批次: ${selectedBatch.name}`}
              description={`当前进度: ${selectedBatch.progress}% | 当前步骤: ${selectedBatch.currentStep}`}
              type="info"
              showIcon
              style={{ marginBottom: 16 }}
            />
            
            <Timeline>
              {workflowSteps.map((step) => (
                <Timeline.Item
                  key={step.id}
                  dot={getStepIcon(step.status)}
                  color={
                    step.status === 'completed' ? 'green' :
                    step.status === 'in_progress' ? 'blue' :
                    step.status === 'failed' ? 'red' : 'gray'
                  }
                >
                  <div>
                    <h4>{step.name}</h4>
                    <p>{step.description}</p>
                    <p>
                      <strong>状态:</strong> 
                      <Tag color={getStatusColor(step.status)} style={{ marginLeft: 8 }}>
                        {getStatusText(step.status)}
                      </Tag>
                    </p>
                    <p><strong>操作员:</strong> {step.operatorName}</p>
                    <p><strong>预计耗时:</strong> {Math.floor(step.estimatedDuration / 60)}小时{step.estimatedDuration % 60}分钟</p>
                    {step.startTime && (
                      <p><strong>开始时间:</strong> {dayjs(step.startTime).format('YYYY-MM-DD HH:mm')}</p>
                    )}
                    {step.endTime && (
                      <p><strong>结束时间:</strong> {dayjs(step.endTime).format('YYYY-MM-DD HH:mm')}</p>
                    )}
                    {step.notes && <p><strong>备注:</strong> {step.notes}</p>}
                  </div>
                </Timeline.Item>
              ))}
            </Timeline>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default ExperimentWorkflow;