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
  Progress,
  Tabs,
  Descriptions,
  Upload,
  Tooltip,
  Badge,
  Divider,
  Alert,
  Tree,
  List,
  Avatar,
  Timeline,
  Collapse,
  Image,
  Typography
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
  BarChartOutlined,
  LineChartOutlined,
  PieChartOutlined,
  DatabaseOutlined,
  CloudDownloadOutlined,
  FolderOutlined,
  FileOutlined,
  BugOutlined,
  DnaOutlined,
  ExperimentOutlined
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import type { AnalysisTask, ExperimentBatch } from '../../types';
import dayjs from 'dayjs';

const { Option } = Select;
const { TextArea } = Input;
const { TabPane } = Tabs;
const { Panel } = Collapse;
const { Text, Title } = Typography;

/**
 * 生信分析组件
 * 负责分析任务管理、结果查看等生物信息学分析功能
 */
const BioinformaticsAnalysis: React.FC = () => {
  // 状态管理
  const [analysisTasks, setAnalysisTasks] = useState<AnalysisTask[]>([]);
  const [batches, setBatches] = useState<ExperimentBatch[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [resultModalVisible, setResultModalVisible] = useState(false);
  const [editingTask, setEditingTask] = useState<AnalysisTask | null>(null);
  const [selectedTask, setSelectedTask] = useState<AnalysisTask | null>(null);
  const [form] = Form.useForm();
  const [searchText, setSearchText] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [typeFilter, setTypeFilter] = useState<string>('');
  const [activeTab, setActiveTab] = useState('tasks');

  // 模拟API调用 - 获取分析任务列表
  const fetchAnalysisTasks = async () => {
    setLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const mockTasks: AnalysisTask[] = [
        {
          id: '1',
          name: '肠道菌群16S rRNA多样性分析',
          description: '基于16S rRNA基因的肠道菌群组成和多样性分析',
          type: '16s_analysis',
          status: 'completed',
          priority: 'high',
          batchId: '1',
          batchName: '肠道菌群测序批次-202401',
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
              status: 'completed'
            }
          ],
          analysisType: 'diversity',
          pipeline: 'QIIME2',
          parameters: {
            trimLength: 250,
            qualityThreshold: 20,
            clusteringMethod: 'DADA2',
            taxonomyDatabase: 'SILVA',
            rarefactionDepth: 10000
          },
          inputFiles: [
            'raw_sequences_R1.fastq.gz',
            'raw_sequences_R2.fastq.gz',
            'metadata.txt'
          ],
          outputFiles: [
            'feature_table.qza',
            'taxonomy.qza',
            'phylogenetic_tree.qza',
            'diversity_metrics.qza',
            'alpha_diversity.tsv',
            'beta_diversity.qza'
          ],
          progress: 100,
          startTime: '2024-01-20T09:00:00Z',
          endTime: '2024-01-22T15:30:00Z',
          estimatedDuration: 2880,
          actualDuration: 2430,
          assigneeId: '3',
          assigneeName: '王五',
          notes: '分析完成，结果质量良好',
          createdAt: '2024-01-20T09:00:00Z',
          updatedAt: '2024-01-22T15:30:00Z'
        },
        {
          id: '2',
          name: '土壤微生物宏基因组功能分析',
          description: '土壤样本宏基因组shotgun测序的功能基因分析',
          type: 'metagenome_analysis',
          status: 'in_progress',
          priority: 'medium',
          batchId: '2',
          batchName: '土壤微生物宏基因组测序',
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
              status: 'processing'
            },
            {
              id: '5',
              sampleCode: 'S005',
              sampleName: '土壤样本B',
              sampleType: '土壤',
              projectName: '土壤微生物功能研究',
              clientName: '农科院',
              receivedDate: '2024-01-20',
              status: 'processing'
            }
          ],
          analysisType: 'functional',
          pipeline: 'MetaPhlAn3 + HUMAnN3',
          parameters: {
            minReadLength: 50,
            qualityThreshold: 25,
            hostGenome: 'none',
            functionalDatabase: 'UniRef90',
            pathwayDatabase: 'MetaCyc'
          },
          inputFiles: [
            'metagenome_R1.fastq.gz',
            'metagenome_R2.fastq.gz'
          ],
          outputFiles: [
            'taxonomic_profile.txt',
            'functional_profile.txt',
            'pathway_abundance.txt'
          ],
          progress: 65,
          startTime: '2024-02-01T10:00:00Z',
          endTime: null,
          estimatedDuration: 4320,
          actualDuration: null,
          assigneeId: '3',
          assigneeName: '王五',
          notes: '正在进行功能注释分析',
          createdAt: '2024-02-01T10:00:00Z',
          updatedAt: '2024-02-03T14:20:00Z'
        },
        {
          id: '3',
          name: '海洋微生物群落结构分析',
          description: '海水样本的16S+18S双重测序群落结构分析',
          type: 'dual_analysis',
          status: 'pending',
          priority: 'high',
          batchId: '3',
          batchName: '海洋微生物多样性分析',
          sampleCount: 30,
          analysisType: 'community',
          pipeline: 'QIIME2 + SILVA + PR2',
          parameters: {
            trimLength16S: 250,
            trimLength18S: 200,
            qualityThreshold: 22,
            clusteringMethod: 'DADA2',
            taxonomyDatabase16S: 'SILVA',
            taxonomyDatabase18S: 'PR2'
          },
          inputFiles: [
            '16S_sequences_R1.fastq.gz',
            '16S_sequences_R2.fastq.gz',
            '18S_sequences_R1.fastq.gz',
            '18S_sequences_R2.fastq.gz',
            'sample_metadata.txt'
          ],
          outputFiles: [],
          progress: 0,
          startTime: null,
          endTime: null,
          estimatedDuration: 3600,
          actualDuration: null,
          assigneeId: '4',
          assigneeName: '赵六',
          notes: '等待测序数据质控完成',
          createdAt: '2024-01-25T11:00:00Z',
          updatedAt: '2024-01-25T11:00:00Z'
        }
      ];
      
      setAnalysisTasks(mockTasks);
    } catch (error) {
      message.error('获取分析任务列表失败');
    } finally {
      setLoading(false);
    }
  };

  // 模拟API调用 - 获取实验批次列表
  const fetchBatches = async () => {
    const mockBatches: ExperimentBatch[] = [
      {
        id: '1',
        code: 'EXP001',
        name: '肠道菌群测序批次-202401',
        description: '包含20个肠道菌群样本的16S rRNA测序',
        status: 'completed',
        priority: 'high',
        sampleCount: 20,
        completedSamples: 20,
        startDate: '2024-01-15',
        expectedEndDate: '2024-01-25',
        actualEndDate: '2024-01-23',
        currentStep: 'completed',
        progress: 100,
        operatorId: '1',
        operatorName: '张三',
        equipmentId: '1',
        equipmentName: 'Illumina NovaSeq 6000',
        notes: '测序完成，数据质量优异',
        createdAt: '2024-01-15T09:00:00Z',
        updatedAt: '2024-01-23T16:00:00Z'
      }
    ];
    setBatches(mockBatches);
  };

  // 组件挂载时获取数据
  useEffect(() => {
    fetchAnalysisTasks();
    fetchBatches();
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

  // 分析类型文本映射
  const getAnalysisTypeText = (type: string) => {
    const textMap = {
      '16s_analysis': '16S rRNA分析',
      'metagenome_analysis': '宏基因组分析',
      'dual_analysis': '双重测序分析',
      'transcriptome_analysis': '转录组分析',
      'comparative_analysis': '比较基因组分析'
    };
    return textMap[type as keyof typeof textMap] || type;
  };

  // 表格列定义
  const columns: ColumnsType<AnalysisTask> = [
    {
      title: '任务名称',
      dataIndex: 'name',
      key: 'name',
      width: 200,
      fixed: 'left',
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
      title: '分析类型',
      dataIndex: 'type',
      key: 'type',
      width: 120,
      render: (type: string) => (
        <Tag color="blue">
          {getAnalysisTypeText(type)}
        </Tag>
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
      width: 100
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
      title: '分析流程',
      dataIndex: 'pipeline',
      key: 'pipeline',
      width: 150,
      ellipsis: true
    },
    {
      title: '负责人',
      dataIndex: 'assigneeName',
      key: 'assigneeName',
      width: 100
    },
    {
      title: '关联批次',
      dataIndex: 'batchName',
      key: 'batchName',
      width: 150,
      ellipsis: true
    },
    {
      title: '开始时间',
      dataIndex: 'startTime',
      key: 'startTime',
      width: 110,
      render: (time: string) => time ? dayjs(time).format('MM-DD HH:mm') : '-'
    },
    {
      title: '预计耗时',
      dataIndex: 'estimatedDuration',
      key: 'estimatedDuration',
      width: 100,
      render: (duration: number) => `${Math.floor(duration / 60)}h${duration % 60}m`
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
              onClick={() => handleViewTask(record)}
            />
          </Tooltip>
          <Tooltip title="查看结果">
            <Button
              type="text"
              icon={<BarChartOutlined />}
              onClick={() => handleViewResults(record)}
              disabled={record.status !== 'completed'}
            />
          </Tooltip>
          <Tooltip title="编辑">
            <Button
              type="text"
              icon={<EditOutlined />}
              onClick={() => handleEditTask(record)}
            />
          </Tooltip>
          {record.status === 'in_progress' && (
            <Tooltip title="暂停">
              <Button
                type="text"
                icon={<PauseCircleOutlined />}
                onClick={() => handlePauseTask(record.id)}
              />
            </Tooltip>
          )}
          {(record.status === 'paused' || record.status === 'pending') && (
            <Tooltip title="开始">
              <Button
                type="text"
                icon={<PlayCircleOutlined />}
                onClick={() => handleStartTask(record.id)}
              />
            </Tooltip>
          )}
          <Popconfirm
            title="确定要删除这个分析任务吗？"
            onConfirm={() => handleDeleteTask(record.id)}
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

  // 处理新增分析任务
  const handleAddTask = () => {
    setEditingTask(null);
    form.resetFields();
    setModalVisible(true);
  };

  // 处理编辑分析任务
  const handleEditTask = (task: AnalysisTask) => {
    setEditingTask(task);
    form.setFieldsValue({
      ...task,
      startTime: task.startTime ? dayjs(task.startTime) : null
    });
    setModalVisible(true);
  };

  // 处理查看任务详情
  const handleViewTask = (task: AnalysisTask) => {
    setSelectedTask(task);
    setDetailModalVisible(true);
  };

  // 处理查看分析结果
  const handleViewResults = (task: AnalysisTask) => {
    setSelectedTask(task);
    setResultModalVisible(true);
  };

  // 处理开始任务
  const handleStartTask = async (id: string) => {
    try {
      await new Promise(resolve => setTimeout(resolve, 500));
      setAnalysisTasks(analysisTasks.map(t => 
        t.id === id ? { 
          ...t, 
          status: 'in_progress',
          startTime: new Date().toISOString(),
          progress: 5
        } : t
      ));
      message.success('分析任务已开始');
    } catch (error) {
      message.error('开始分析任务失败');
    }
  };

  // 处理暂停任务
  const handlePauseTask = async (id: string) => {
    try {
      await new Promise(resolve => setTimeout(resolve, 500));
      setAnalysisTasks(analysisTasks.map(t => 
        t.id === id ? { ...t, status: 'paused' } : t
      ));
      message.success('分析任务已暂停');
    } catch (error) {
      message.error('暂停分析任务失败');
    }
  };

  // 处理删除任务
  const handleDeleteTask = async (id: string) => {
    try {
      await new Promise(resolve => setTimeout(resolve, 500));
      setAnalysisTasks(analysisTasks.filter(t => t.id !== id));
      message.success('分析任务删除成功');
    } catch (error) {
      message.error('删除分析任务失败');
    }
  };

  // 处理表单提交
  const handleSubmit = async (values: any) => {
    try {
      setLoading(true);
      
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const taskData = {
        ...values,
        startTime: values.startTime ? values.startTime.toISOString() : null,
        progress: 0,
        actualDuration: null,
        endTime: null,
        outputFiles: []
      };

      if (editingTask) {
        // 更新分析任务
        const updatedTask = {
          ...editingTask,
          ...taskData,
          updatedAt: new Date().toISOString()
        };
        setAnalysisTasks(analysisTasks.map(t => t.id === editingTask.id ? updatedTask : t));
        message.success('分析任务更新成功');
      } else {
        // 新增分析任务
        const newTask: AnalysisTask = {
          id: Date.now().toString(),
          ...taskData,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
        setAnalysisTasks([...analysisTasks, newTask]);
        message.success('分析任务创建成功');
      }

      setModalVisible(false);
      form.resetFields();
    } catch (error) {
      message.error('操作失败');
    } finally {
      setLoading(false);
    }
  };

  // 过滤分析任务数据
  const filteredTasks = analysisTasks.filter(task => {
    const matchesSearch = !searchText || 
      task.name.toLowerCase().includes(searchText.toLowerCase()) ||
      task.description.toLowerCase().includes(searchText.toLowerCase()) ||
      task.pipeline.toLowerCase().includes(searchText.toLowerCase());
    
    const matchesStatus = !statusFilter || task.status === statusFilter;
    const matchesType = !typeFilter || task.type === typeFilter;
    
    return matchesSearch && matchesStatus && matchesType;
  });

  // 计算统计数据
  const statistics = {
    total: analysisTasks.length,
    pending: analysisTasks.filter(t => t.status === 'pending').length,
    inProgress: analysisTasks.filter(t => t.status === 'in_progress').length,
    completed: analysisTasks.filter(t => t.status === 'completed').length,
    failed: analysisTasks.filter(t => t.status === 'failed').length,
    totalSamples: analysisTasks.reduce((sum, t) => sum + t.sampleCount, 0)
  };

  // 模拟分析结果数据
  const mockResults = {
    summary: {
      totalReads: 2450000,
      qualityReads: 2280000,
      qualityRate: 93.1,
      uniqueFeatures: 1250,
      taxonomicGroups: 85
    },
    diversity: {
      shannon: 4.2,
      simpson: 0.85,
      chao1: 1380,
      observedOTUs: 1250
    },
    taxonomy: [
      { name: 'Bacteroidetes', percentage: 35.2, color: '#1890ff' },
      { name: 'Firmicutes', percentage: 28.7, color: '#52c41a' },
      { name: 'Proteobacteria', percentage: 18.5, color: '#faad14' },
      { name: 'Actinobacteria', percentage: 12.1, color: '#f5222d' },
      { name: 'Others', percentage: 5.5, color: '#722ed1' }
    ]
  };

  return (
    <div>
      {/* 统计卡片 */}
      <Row gutter={16} style={{ marginBottom: 16 }}>
        <Col span={6}>
          <Card>
            <Statistic
              title="分析任务总数"
              value={statistics.total}
              prefix={<DatabaseOutlined />}
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
              title="已完成"
              value={statistics.completed}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="分析样本总数"
              value={statistics.totalSamples}
              prefix={<BugOutlined />}
            />
          </Card>
        </Col>
      </Row>

      {/* 主要内容 */}
      <Card>
        <Tabs activeKey={activeTab} onChange={setActiveTab}>
          <TabPane tab="分析任务" key="tasks">
            <div style={{ marginBottom: 16 }}>
              <Space>
                <Input.Search
                  placeholder="搜索任务名称、描述或流程"
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
                <Select
                  placeholder="筛选类型"
                  value={typeFilter}
                  onChange={setTypeFilter}
                  style={{ width: 150 }}
                  allowClear
                >
                  <Option value="16s_analysis">16S rRNA分析</Option>
                  <Option value="metagenome_analysis">宏基因组分析</Option>
                  <Option value="dual_analysis">双重测序分析</Option>
                  <Option value="transcriptome_analysis">转录组分析</Option>
                </Select>
                <Button
                  type="primary"
                  icon={<PlusOutlined />}
                  onClick={handleAddTask}
                >
                  创建分析任务
                </Button>
              </Space>
            </div>

            <Table
              columns={columns}
              dataSource={filteredTasks}
              rowKey="id"
              loading={loading}
              scroll={{ x: 1800 }}
              pagination={{
                total: filteredTasks.length,
                pageSize: 10,
                showSizeChanger: true,
                showQuickJumper: true,
                showTotal: (total) => `共 ${total} 条记录`
              }}
            />
          </TabPane>

          <TabPane tab="分析流程" key="pipelines">
            <Alert
              message="生信分析流程"
              description="支持多种微生物组学分析流程"
              type="info"
              showIcon
              style={{ marginBottom: 16 }}
            />
            
            <Row gutter={16}>
              <Col span={8}>
                <Card title="16S rRNA分析" size="small">
                  <p><strong>适用场景:</strong> 细菌和古菌群落结构分析</p>
                  <p><strong>主要步骤:</strong></p>
                  <ul>
                    <li>质量控制和过滤</li>
                    <li>序列去噪 (DADA2)</li>
                    <li>分类学注释 (SILVA)</li>
                    <li>多样性分析</li>
                    <li>差异分析</li>
                  </ul>
                </Card>
              </Col>
              <Col span={8}>
                <Card title="宏基因组分析" size="small">
                  <p><strong>适用场景:</strong> 微生物群落功能分析</p>
                  <p><strong>主要步骤:</strong></p>
                  <ul>
                    <li>质量控制和去宿主</li>
                    <li>物种组成分析 (MetaPhlAn)</li>
                    <li>功能注释 (HUMAnN)</li>
                    <li>代谢通路分析</li>
                    <li>抗性基因检测</li>
                  </ul>
                </Card>
              </Col>
              <Col span={8}>
                <Card title="双重测序分析" size="small">
                  <p><strong>适用场景:</strong> 细菌+真核微生物分析</p>
                  <p><strong>主要步骤:</strong></p>
                  <ul>
                    <li>16S rRNA分析 (细菌)</li>
                    <li>18S rRNA分析 (真核)</li>
                    <li>群落互作分析</li>
                    <li>生态网络构建</li>
                    <li>环境因子关联</li>
                  </ul>
                </Card>
              </Col>
            </Row>
          </TabPane>
        </Tabs>
      </Card>

      {/* 新增/编辑分析任务模态框 */}
      <Modal
        title={editingTask ? '编辑分析任务' : '创建分析任务'}
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
                label="任务名称"
                rules={[{ required: true, message: '请输入任务名称' }]}
              >
                <Input placeholder="请输入任务名称" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="type"
                label="分析类型"
                rules={[{ required: true, message: '请选择分析类型' }]}
              >
                <Select placeholder="请选择分析类型">
                  <Option value="16s_analysis">16S rRNA分析</Option>
                  <Option value="metagenome_analysis">宏基因组分析</Option>
                  <Option value="dual_analysis">双重测序分析</Option>
                  <Option value="transcriptome_analysis">转录组分析</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            name="description"
            label="任务描述"
            rules={[{ required: true, message: '请输入任务描述' }]}
          >
            <TextArea rows={3} placeholder="请输入任务描述" />
          </Form.Item>

          <Row gutter={16}>
            <Col span={8}>
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
            <Col span={8}>
              <Form.Item
                name="batchId"
                label="关联批次"
                rules={[{ required: true, message: '请选择关联批次' }]}
              >
                <Select placeholder="请选择关联批次">
                  {batches.map(batch => (
                    <Option key={batch.id} value={batch.id}>
                      {batch.name}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                name="sampleCount"
                label="样本数量"
                rules={[{ required: true, message: '请输入样本数量' }]}
              >
                <Input type="number" min={1} placeholder="请输入样本数量" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="pipeline"
                label="分析流程"
                rules={[{ required: true, message: '请输入分析流程' }]}
              >
                <Input placeholder="如: QIIME2, MetaPhlAn3 + HUMAnN3" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="assigneeId"
                label="负责人"
                rules={[{ required: true, message: '请选择负责人' }]}
              >
                <Select placeholder="请选择负责人">
                  <Option value="3">王五</Option>
                  <Option value="4">赵六</Option>
                  <Option value="5">孙七</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="estimatedDuration"
                label="预计耗时(分钟)"
                rules={[{ required: true, message: '请输入预计耗时' }]}
              >
                <Input type="number" min={1} placeholder="请输入预计耗时" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="startTime"
                label="计划开始时间"
              >
                <DatePicker 
                  showTime 
                  style={{ width: '100%' }} 
                  placeholder="请选择计划开始时间"
                />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            name="status"
            label="任务状态"
            rules={[{ required: true, message: '请选择任务状态' }]}
          >
            <Select placeholder="请选择任务状态">
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
                {editingTask ? '更新' : '创建'}
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>

      {/* 任务详情模态框 */}
      <Modal
        title="分析任务详情"
        open={detailModalVisible}
        onCancel={() => setDetailModalVisible(false)}
        footer={[
          <Button key="close" onClick={() => setDetailModalVisible(false)}>
            关闭
          </Button>
        ]}
        width={900}
      >
        {selectedTask && (
          <div>
            <Descriptions bordered column={2}>
              <Descriptions.Item label="任务名称">{selectedTask.name}</Descriptions.Item>
              <Descriptions.Item label="分析类型">
                <Tag color="blue">
                  {getAnalysisTypeText(selectedTask.type)}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="状态">
                <Tag color={getStatusColor(selectedTask.status)}>
                  {getStatusText(selectedTask.status)}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="优先级">
                <Tag color={getPriorityColor(selectedTask.priority)}>
                  {getPriorityText(selectedTask.priority)}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="样本数量">
                <Badge count={selectedTask.sampleCount} showZero color="blue" />
              </Descriptions.Item>
              <Descriptions.Item label="进度">
                <Progress percent={selectedTask.progress} size="small" />
              </Descriptions.Item>
              <Descriptions.Item label="分析流程">{selectedTask.pipeline}</Descriptions.Item>
              <Descriptions.Item label="负责人">{selectedTask.assigneeName}</Descriptions.Item>
              <Descriptions.Item label="关联批次">{selectedTask.batchName}</Descriptions.Item>
              <Descriptions.Item label="预计耗时">
                {Math.floor(selectedTask.estimatedDuration / 60)}小时{selectedTask.estimatedDuration % 60}分钟
              </Descriptions.Item>
              <Descriptions.Item label="开始时间">
                {selectedTask.startTime ? 
                  dayjs(selectedTask.startTime).format('YYYY-MM-DD HH:mm') : 
                  '未开始'
                }
              </Descriptions.Item>
              <Descriptions.Item label="结束时间">
                {selectedTask.endTime ? 
                  dayjs(selectedTask.endTime).format('YYYY-MM-DD HH:mm') : 
                  '未完成'
                }
              </Descriptions.Item>
            </Descriptions>
            
            <Divider />
            
            <Descriptions bordered column={1}>
              <Descriptions.Item label="任务描述">
                {selectedTask.description}
              </Descriptions.Item>
              <Descriptions.Item label="备注">
                {selectedTask.notes || '无备注'}
              </Descriptions.Item>
            </Descriptions>

            {/* 样本清单 */}
            <Divider />
            <Title level={5}>样本清单 ({selectedTask.sampleCount} 个样本)</Title>
            <Table
              size="small"
              dataSource={selectedTask.samples || []}
              columns={[
                {
                  title: '样本编号',
                  dataIndex: 'sampleCode',
                  key: 'sampleCode',
                  width: 120,
                  render: (text) => <Text strong>{text}</Text>
                },
                {
                  title: '样本名称',
                  dataIndex: 'sampleName',
                  key: 'sampleName',
                  width: 150,
                  ellipsis: true
                },
                {
                  title: '样本类型',
                  dataIndex: 'sampleType',
                  key: 'sampleType',
                  width: 100,
                  render: (type) => <Tag color="blue">{type}</Tag>
                },
                {
                  title: '项目名称',
                  dataIndex: 'projectName',
                  key: 'projectName',
                  width: 200,
                  ellipsis: true
                },
                {
                  title: '客户名称',
                  dataIndex: 'clientName',
                  key: 'clientName',
                  width: 120,
                  ellipsis: true
                },
                {
                  title: '接收日期',
                  dataIndex: 'receivedDate',
                  key: 'receivedDate',
                  width: 100,
                  render: (date) => dayjs(date).format('MM-DD')
                },
                {
                  title: '状态',
                  dataIndex: 'status',
                  key: 'status',
                  width: 80,
                  render: (status) => {
                    const statusConfig = {
                      received: { color: 'green', text: '已接收' },
                      processing: { color: 'processing', text: '处理中' },
                      completed: { color: 'success', text: '已完成' },
                      failed: { color: 'error', text: '失败' }
                    }
                    const config = statusConfig[status as keyof typeof statusConfig] || { color: 'default', text: status }
                    return <Tag color={config.color}>{config.text}</Tag>
                  }
                }
              ]}
              rowKey="id"
              pagination={false}
              scroll={{ y: 300 }}
            />

            {selectedTask.inputFiles && selectedTask.inputFiles.length > 0 && (
              <>
                <Divider />
                <Title level={5}>输入文件</Title>
                <List
                  size="small"
                  dataSource={selectedTask.inputFiles}
                  renderItem={(file) => (
                    <List.Item>
                      <FileOutlined style={{ marginRight: 8 }} />
                      {file}
                    </List.Item>
                  )}
                />
              </>
            )}

            {selectedTask.outputFiles && selectedTask.outputFiles.length > 0 && (
              <>
                <Divider />
                <Title level={5}>输出文件</Title>
                <List
                  size="small"
                  dataSource={selectedTask.outputFiles}
                  renderItem={(file) => (
                    <List.Item>
                      <List.Item.Meta
                        avatar={<FileOutlined />}
                        title={file}
                        description="点击下载"
                      />
                      <Button 
                        type="link" 
                        icon={<DownloadOutlined />}
                        onClick={() => message.info(`下载文件: ${file}`)}
                      >
                        下载
                      </Button>
                    </List.Item>
                  )}
                />
              </>
            )}
          </div>
        )}
      </Modal>

      {/* 分析结果模态框 */}
      <Modal
        title="分析结果"
        open={resultModalVisible}
        onCancel={() => setResultModalVisible(false)}
        footer={[
          <Button key="download" type="primary" icon={<DownloadOutlined />}>
            下载报告
          </Button>,
          <Button key="close" onClick={() => setResultModalVisible(false)}>
            关闭
          </Button>
        ]}
        width={1000}
      >
        {selectedTask && (
          <div>
            <Alert
              message={`分析任务: ${selectedTask.name}`}
              description={`完成时间: ${selectedTask.endTime ? dayjs(selectedTask.endTime).format('YYYY-MM-DD HH:mm') : '进行中'}`}
              type="success"
              showIcon
              style={{ marginBottom: 16 }}
            />

            <Tabs defaultActiveKey="summary">
              <TabPane tab="分析概要" key="summary">
                <Row gutter={16}>
                  <Col span={12}>
                    <Card title="数据质量" size="small">
                      <Statistic title="总读长数" value={mockResults.summary.totalReads} />
                      <Statistic title="高质量读长" value={mockResults.summary.qualityReads} />
                      <Statistic 
                        title="质量通过率" 
                        value={mockResults.summary.qualityRate} 
                        suffix="%" 
                        precision={1}
                      />
                    </Card>
                  </Col>
                  <Col span={12}>
                    <Card title="分析结果" size="small">
                      <Statistic title="特征数量" value={mockResults.summary.uniqueFeatures} />
                      <Statistic title="分类群数" value={mockResults.summary.taxonomicGroups} />
                    </Card>
                  </Col>
                </Row>
              </TabPane>

              <TabPane tab="多样性分析" key="diversity">
                <Row gutter={16}>
                  <Col span={12}>
                    <Card title="Alpha多样性指数" size="small">
                      <Descriptions size="small" column={1}>
                        <Descriptions.Item label="Shannon指数">
                          {mockResults.diversity.shannon}
                        </Descriptions.Item>
                        <Descriptions.Item label="Simpson指数">
                          {mockResults.diversity.simpson}
                        </Descriptions.Item>
                        <Descriptions.Item label="Chao1指数">
                          {mockResults.diversity.chao1}
                        </Descriptions.Item>
                        <Descriptions.Item label="观察到的OTUs">
                          {mockResults.diversity.observedOTUs}
                        </Descriptions.Item>
                      </Descriptions>
                    </Card>
                  </Col>
                  <Col span={12}>
                    <Card title="群落组成" size="small">
                      <div style={{ height: 200 }}>
                        {mockResults.taxonomy.map((item, index) => (
                          <div key={index} style={{ marginBottom: 8 }}>
                            <div style={{ display: 'flex', alignItems: 'center' }}>
                              <div 
                                style={{ 
                                  width: 12, 
                                  height: 12, 
                                  backgroundColor: item.color,
                                  marginRight: 8
                                }}
                              />
                              <span style={{ flex: 1 }}>{item.name}</span>
                              <span>{item.percentage}%</span>
                            </div>
                            <Progress 
                              percent={item.percentage} 
                              strokeColor={item.color}
                              showInfo={false}
                              size="small"
                            />
                          </div>
                        ))}
                      </div>
                    </Card>
                  </Col>
                </Row>
              </TabPane>

              <TabPane tab="文件下载" key="files">
                <List
                  itemLayout="horizontal"
                  dataSource={selectedTask.outputFiles}
                  renderItem={(file) => (
                    <List.Item
                      actions={[
                        <Button 
                          type="link" 
                          icon={<DownloadOutlined />}
                          onClick={() => message.info(`下载文件: ${file}`)}
                        >
                          下载
                        </Button>
                      ]}
                    >
                      <List.Item.Meta
                        avatar={<FileOutlined style={{ fontSize: 24 }} />}
                        title={file}
                        description="分析结果文件"
                      />
                    </List.Item>
                  )}
                />
              </TabPane>
            </Tabs>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default BioinformaticsAnalysis;