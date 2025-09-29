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
  Steps,
  List,
  Avatar,
  Timeline,
  Collapse,
  Image,
  Typography,
  Rate,
  Switch,
  Checkbox,
  Radio
} from 'antd';
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  EyeOutlined,
  DownloadOutlined,
  FileTextOutlined,
  FilePdfOutlined,
  FileWordOutlined,
  FileExcelOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  ExclamationCircleOutlined,
  SendOutlined,
  AuditOutlined,
  PrinterOutlined,
  ShareAltOutlined,
  MailOutlined,
  CloudUploadOutlined,
  HistoryOutlined,
  UserOutlined,
  CalendarOutlined,
  FlagOutlined,
  StarOutlined,
  CommentOutlined,
  BellOutlined
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import type { Report, Project, AnalysisTask } from '../../types';
import dayjs from 'dayjs';

const { Option } = Select;
const { TextArea } = Input;
const { TabPane } = Tabs;
const { Step } = Steps;
const { Panel } = Collapse;
const { Text, Title, Paragraph } = Typography;
const { Dragger } = Upload;

/**
 * 报告管理组件
 * 负责报告生成、审核、发布等功能
 */
const ReportManagement: React.FC = () => {
  // 状态管理
  const [reports, setReports] = useState<Report[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [analysisTasks, setAnalysisTasks] = useState<AnalysisTask[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [previewModalVisible, setPreviewModalVisible] = useState(false);
  const [auditModalVisible, setAuditModalVisible] = useState(false);
  const [editingReport, setEditingReport] = useState<Report | null>(null);
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);
  const [form] = Form.useForm();
  const [auditForm] = Form.useForm();
  const [searchText, setSearchText] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [typeFilter, setTypeFilter] = useState<string>('');
  const [activeTab, setActiveTab] = useState('reports');

  // 模拟API调用 - 获取报告列表
  const fetchReports = async () => {
    setLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const mockReports: Report[] = [
        {
          id: '1',
          title: '肠道菌群16S rRNA多样性分析报告',
          description: '基于16S rRNA基因的肠道菌群组成和多样性分析结果报告',
          type: 'analysis_report',
          status: 'published',
          priority: 'high',
          projectId: '1',
          projectName: '肠道菌群多样性研究',
          analysisTaskId: '1',
          analysisTaskName: '肠道菌群16S rRNA多样性分析',
          version: '1.2',
          templateId: 'template_16s',
          templateName: '16S rRNA分析报告模板',
          authorId: '3',
          authorName: '王五',
          reviewerId: '2',
          reviewerName: '李四',
          approvalStatus: 'approved',
          reviewComments: '报告内容详实，数据分析准确，建议发布',
          reviewDate: '2024-01-25T14:30:00Z',
          publishDate: '2024-01-26T09:00:00Z',
          downloadCount: 25,
          viewCount: 156,
          fileSize: 2.5,
          fileFormat: 'pdf',
          filePath: '/reports/gut_microbiome_16s_analysis_v1.2.pdf',
          tags: ['16S rRNA', '肠道菌群', '多样性分析', '微生物组'],
          isPublic: true,
          expiryDate: '2025-01-26',
          language: 'zh-CN',
          customFields: {
            sampleCount: 20,
            sequencingPlatform: 'Illumina NovaSeq 6000',
            analysisMethod: 'QIIME2 + DADA2',
            keyFindings: '发现显著的菌群多样性差异'
          },
          createdAt: '2024-01-24T10:00:00Z',
          updatedAt: '2024-01-26T09:00:00Z'
        },
        {
          id: '2',
          title: '土壤微生物宏基因组功能分析报告',
          description: '土壤样本宏基因组shotgun测序的功能基因分析报告',
          type: 'analysis_report',
          status: 'under_review',
          priority: 'medium',
          projectId: '2',
          projectName: '土壤微生物功能研究',
          analysisTaskId: '2',
          analysisTaskName: '土壤微生物宏基因组功能分析',
          version: '1.0',
          templateId: 'template_metagenome',
          templateName: '宏基因组分析报告模板',
          authorId: '3',
          authorName: '王五',
          reviewerId: '2',
          reviewerName: '李四',
          approvalStatus: 'pending',
          reviewComments: '',
          reviewDate: null,
          publishDate: null,
          downloadCount: 0,
          viewCount: 8,
          fileSize: 3.2,
          fileFormat: 'pdf',
          filePath: '/reports/soil_metagenome_functional_analysis_v1.0.pdf',
          tags: ['宏基因组', '土壤微生物', '功能分析', 'shotgun测序'],
          isPublic: false,
          expiryDate: '2025-02-15',
          language: 'zh-CN',
          customFields: {
            sampleCount: 12,
            sequencingPlatform: 'Illumina HiSeq X Ten',
            analysisMethod: 'MetaPhlAn3 + HUMAnN3',
            keyFindings: '检测到丰富的碳氮循环相关基因'
          },
          createdAt: '2024-02-10T11:00:00Z',
          updatedAt: '2024-02-12T16:30:00Z'
        },
        {
          id: '3',
          title: '海洋微生物群落结构分析报告',
          description: '海水样本的16S+18S双重测序群落结构分析报告',
          type: 'analysis_report',
          status: 'draft',
          priority: 'high',
          projectId: '3',
          projectName: '海洋微生物多样性分析',
          analysisTaskId: '3',
          analysisTaskName: '海洋微生物群落结构分析',
          version: '0.8',
          templateId: 'template_dual',
          templateName: '双重测序分析报告模板',
          authorId: '4',
          authorName: '赵六',
          reviewerId: null,
          reviewerName: null,
          approvalStatus: 'not_submitted',
          reviewComments: '',
          reviewDate: null,
          publishDate: null,
          downloadCount: 0,
          viewCount: 3,
          fileSize: 1.8,
          fileFormat: 'docx',
          filePath: '/reports/marine_microbial_community_analysis_v0.8.docx',
          tags: ['双重测序', '海洋微生物', '群落结构', '16S+18S'],
          isPublic: false,
          expiryDate: '2025-03-01',
          language: 'zh-CN',
          customFields: {
            sampleCount: 30,
            sequencingPlatform: 'Illumina MiSeq',
            analysisMethod: 'QIIME2 + SILVA + PR2',
            keyFindings: '发现独特的海洋微生物群落组成'
          },
          createdAt: '2024-01-28T09:30:00Z',
          updatedAt: '2024-02-05T14:15:00Z'
        }
      ];
      
      setReports(mockReports);
    } catch (error) {
      message.error('获取报告列表失败');
    } finally {
      setLoading(false);
    }
  };

  // 模拟API调用 - 获取项目和分析任务列表
  const fetchRelatedData = async () => {
    const mockProjects: Project[] = [
      {
        id: '1',
        code: 'PRJ001',
        name: '肠道菌群多样性研究',
        description: '研究不同饮食习惯对肠道菌群多样性的影响',
        status: 'completed',
        priority: 'high',
        type: 'research',
        clientId: '1',
        clientName: '北京大学医学院',
        managerId: '1',
        managerName: '张三',
        startDate: '2024-01-10',
        expectedEndDate: '2024-02-10',
        actualEndDate: '2024-01-30',
        budget: 50000,
        actualCost: 45000,
        progress: 100,
        sampleCount: 20,
        completedSamples: 20,
        notes: '项目顺利完成，结果符合预期',
        createdAt: '2024-01-10T09:00:00Z',
        updatedAt: '2024-01-30T17:00:00Z'
      }
    ];

    const mockAnalysisTasks: AnalysisTask[] = [
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
        analysisType: 'diversity',
        pipeline: 'QIIME2',
        parameters: {},
        inputFiles: [],
        outputFiles: [],
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
      }
    ];

    setProjects(mockProjects);
    setAnalysisTasks(mockAnalysisTasks);
  };

  // 组件挂载时获取数据
  useEffect(() => {
    fetchReports();
    fetchRelatedData();
  }, []);

  // 状态标签颜色映射
  const getStatusColor = (status: string) => {
    const colorMap = {
      draft: 'orange',
      under_review: 'blue',
      approved: 'green',
      published: 'cyan',
      rejected: 'red',
      archived: 'gray'
    };
    return colorMap[status as keyof typeof colorMap];
  };

  // 状态文本映射
  const getStatusText = (status: string) => {
    const textMap = {
      draft: '草稿',
      under_review: '审核中',
      approved: '已批准',
      published: '已发布',
      rejected: '已拒绝',
      archived: '已归档'
    };
    return textMap[status as keyof typeof textMap];
  };

  // 审批状态颜色映射
  const getApprovalStatusColor = (status: string) => {
    const colorMap = {
      not_submitted: 'default',
      pending: 'orange',
      approved: 'green',
      rejected: 'red'
    };
    return colorMap[status as keyof typeof colorMap];
  };

  // 审批状态文本映射
  const getApprovalStatusText = (status: string) => {
    const textMap = {
      not_submitted: '未提交',
      pending: '待审核',
      approved: '已批准',
      rejected: '已拒绝'
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

  // 报告类型文本映射
  const getReportTypeText = (type: string) => {
    const textMap = {
      analysis_report: '分析报告',
      summary_report: '总结报告',
      quality_report: '质量报告',
      progress_report: '进度报告',
      final_report: '最终报告'
    };
    return textMap[type as keyof typeof textMap] || type;
  };

  // 表格列定义
  const columns: ColumnsType<Report> = [
    {
      title: '报告标题',
      dataIndex: 'title',
      key: 'title',
      width: 250,
      fixed: 'left',
      ellipsis: {
        showTitle: false
      },
      render: (text, record) => (
        <div>
          <Tooltip placement="topLeft" title={text}>
            <div style={{ fontWeight: 500 }}>{text}</div>
          </Tooltip>
          <div style={{ fontSize: '12px', color: '#666' }}>
            v{record.version} | {record.fileFormat.toUpperCase()}
          </div>
        </div>
      )
    },
    {
      title: '类型',
      dataIndex: 'type',
      key: 'type',
      width: 120,
      render: (type: string) => (
        <Tag color="blue">
          {getReportTypeText(type)}
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
      title: '审批状态',
      dataIndex: 'approvalStatus',
      key: 'approvalStatus',
      width: 100,
      render: (status: string) => (
        <Tag color={getApprovalStatusColor(status)}>
          {getApprovalStatusText(status)}
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
      title: '作者',
      dataIndex: 'authorName',
      key: 'authorName',
      width: 100
    },
    {
      title: '审核人',
      dataIndex: 'reviewerName',
      key: 'reviewerName',
      width: 100,
      render: (name: string) => name || '-'
    },
    {
      title: '关联项目',
      dataIndex: 'projectName',
      key: 'projectName',
      width: 150,
      ellipsis: true
    },
    {
      title: '文件大小',
      dataIndex: 'fileSize',
      key: 'fileSize',
      width: 100,
      render: (size: number) => `${size.toFixed(1)} MB`
    },
    {
      title: '查看/下载',
      key: 'stats',
      width: 120,
      render: (_, record) => (
        <div>
          <div style={{ fontSize: '12px' }}>
            <EyeOutlined /> {record.viewCount}
          </div>
          <div style={{ fontSize: '12px' }}>
            <DownloadOutlined /> {record.downloadCount}
          </div>
        </div>
      )
    },
    {
      title: '创建时间',
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: 110,
      render: (time: string) => dayjs(time).format('MM-DD HH:mm')
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
              onClick={() => handleViewReport(record)}
            />
          </Tooltip>
          <Tooltip title="预览">
            <Button
              type="text"
              icon={<FileTextOutlined />}
              onClick={() => handlePreviewReport(record)}
            />
          </Tooltip>
          <Tooltip title="下载">
            <Button
              type="text"
              icon={<DownloadOutlined />}
              onClick={() => handleDownloadReport(record)}
            />
          </Tooltip>
          {record.status === 'draft' && (
            <Tooltip title="编辑">
              <Button
                type="text"
                icon={<EditOutlined />}
                onClick={() => handleEditReport(record)}
              />
            </Tooltip>
          )}
          {(record.status === 'draft' || record.status === 'rejected') && (
            <Tooltip title="提交审核">
              <Button
                type="text"
                icon={<SendOutlined />}
                onClick={() => handleSubmitForReview(record.id)}
              />
            </Tooltip>
          )}
          {record.status === 'under_review' && record.reviewerId && (
            <Tooltip title="审核">
              <Button
                type="text"
                icon={<AuditOutlined />}
                onClick={() => handleAuditReport(record)}
              />
            </Tooltip>
          )}
          {record.status === 'approved' && (
            <Tooltip title="发布">
              <Button
                type="text"
                icon={<ShareAltOutlined />}
                onClick={() => handlePublishReport(record.id)}
              />
            </Tooltip>
          )}
          <Popconfirm
            title="确定要删除这个报告吗？"
            onConfirm={() => handleDeleteReport(record.id)}
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

  // 处理新增报告
  const handleAddReport = () => {
    setEditingReport(null);
    form.resetFields();
    setModalVisible(true);
  };

  // 处理编辑报告
  const handleEditReport = (report: Report) => {
    setEditingReport(report);
    form.setFieldsValue({
      ...report,
      expiryDate: report.expiryDate ? dayjs(report.expiryDate) : null,
      tags: report.tags
    });
    setModalVisible(true);
  };

  // 处理查看报告详情
  const handleViewReport = (report: Report) => {
    setSelectedReport(report);
    setDetailModalVisible(true);
  };

  // 处理预览报告
  const handlePreviewReport = (report: Report) => {
    setSelectedReport(report);
    setPreviewModalVisible(true);
  };

  // 处理下载报告
  const handleDownloadReport = (report: Report) => {
    // 更新下载次数
    setReports(reports.map(r => 
      r.id === report.id ? { ...r, downloadCount: r.downloadCount + 1 } : r
    ));
    message.success(`正在下载报告: ${report.title}`);
  };

  // 处理提交审核
  const handleSubmitForReview = async (id: string) => {
    try {
      await new Promise(resolve => setTimeout(resolve, 500));
      setReports(reports.map(r => 
        r.id === id ? { 
          ...r, 
          status: 'under_review',
          approvalStatus: 'pending',
          updatedAt: new Date().toISOString()
        } : r
      ));
      message.success('报告已提交审核');
    } catch (error) {
      message.error('提交审核失败');
    }
  };

  // 处理审核报告
  const handleAuditReport = (report: Report) => {
    setSelectedReport(report);
    auditForm.resetFields();
    setAuditModalVisible(true);
  };

  // 处理发布报告
  const handlePublishReport = async (id: string) => {
    try {
      await new Promise(resolve => setTimeout(resolve, 500));
      setReports(reports.map(r => 
        r.id === id ? { 
          ...r, 
          status: 'published',
          publishDate: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        } : r
      ));
      message.success('报告已发布');
    } catch (error) {
      message.error('发布报告失败');
    }
  };

  // 处理删除报告
  const handleDeleteReport = async (id: string) => {
    try {
      await new Promise(resolve => setTimeout(resolve, 500));
      setReports(reports.filter(r => r.id !== id));
      message.success('报告删除成功');
    } catch (error) {
      message.error('删除报告失败');
    }
  };

  // 处理表单提交
  const handleSubmit = async (values: any) => {
    try {
      setLoading(true);
      
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const reportData = {
        ...values,
        expiryDate: values.expiryDate ? values.expiryDate.format('YYYY-MM-DD') : null,
        version: editingReport ? editingReport.version : '1.0',
        fileSize: Math.random() * 3 + 1, // 模拟文件大小
        downloadCount: 0,
        viewCount: 0,
        approvalStatus: 'not_submitted'
      };

      if (editingReport) {
        // 更新报告
        const updatedReport = {
          ...editingReport,
          ...reportData,
          updatedAt: new Date().toISOString()
        };
        setReports(reports.map(r => r.id === editingReport.id ? updatedReport : r));
        message.success('报告更新成功');
      } else {
        // 新增报告
        const newReport: Report = {
          id: Date.now().toString(),
          ...reportData,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
        setReports([...reports, newReport]);
        message.success('报告创建成功');
      }

      setModalVisible(false);
      form.resetFields();
    } catch (error) {
      message.error('操作失败');
    } finally {
      setLoading(false);
    }
  };

  // 处理审核提交
  const handleAuditSubmit = async (values: any) => {
    try {
      setLoading(true);
      
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      if (selectedReport) {
        const updatedReport = {
          ...selectedReport,
          approvalStatus: values.decision,
          status: values.decision === 'approved' ? 'approved' : 'rejected',
          reviewComments: values.comments,
          reviewDate: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
        
        setReports(reports.map(r => r.id === selectedReport.id ? updatedReport : r));
        message.success(`报告审核${values.decision === 'approved' ? '通过' : '拒绝'}`);
      }

      setAuditModalVisible(false);
      auditForm.resetFields();
    } catch (error) {
      message.error('审核操作失败');
    } finally {
      setLoading(false);
    }
  };

  // 过滤报告数据
  const filteredReports = reports.filter(report => {
    const matchesSearch = !searchText || 
      report.title.toLowerCase().includes(searchText.toLowerCase()) ||
      report.description.toLowerCase().includes(searchText.toLowerCase()) ||
      report.authorName.toLowerCase().includes(searchText.toLowerCase());
    
    const matchesStatus = !statusFilter || report.status === statusFilter;
    const matchesType = !typeFilter || report.type === typeFilter;
    
    return matchesSearch && matchesStatus && matchesType;
  });

  // 计算统计数据
  const statistics = {
    total: reports.length,
    draft: reports.filter(r => r.status === 'draft').length,
    underReview: reports.filter(r => r.status === 'under_review').length,
    published: reports.filter(r => r.status === 'published').length,
    totalDownloads: reports.reduce((sum, r) => sum + r.downloadCount, 0),
    totalViews: reports.reduce((sum, r) => sum + r.viewCount, 0)
  };

  return (
    <div>
      {/* 统计卡片 */}
      <Row gutter={16} style={{ marginBottom: 16 }}>
        <Col span={6}>
          <Card>
            <Statistic
              title="报告总数"
              value={statistics.total}
              prefix={<FileTextOutlined />}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="待审核"
              value={statistics.underReview}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="已发布"
              value={statistics.published}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="总下载量"
              value={statistics.totalDownloads}
              prefix={<DownloadOutlined />}
            />
          </Card>
        </Col>
      </Row>

      {/* 主要内容 */}
      <Card>
        <Tabs activeKey={activeTab} onChange={setActiveTab}>
          <TabPane tab="报告管理" key="reports">
            <div style={{ marginBottom: 16 }}>
              <Space>
                <Input.Search
                  placeholder="搜索报告标题、描述或作者"
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
                  <Option value="draft">草稿</Option>
                  <Option value="under_review">审核中</Option>
                  <Option value="approved">已批准</Option>
                  <Option value="published">已发布</Option>
                  <Option value="rejected">已拒绝</Option>
                </Select>
                <Select
                  placeholder="筛选类型"
                  value={typeFilter}
                  onChange={setTypeFilter}
                  style={{ width: 150 }}
                  allowClear
                >
                  <Option value="analysis_report">分析报告</Option>
                  <Option value="summary_report">总结报告</Option>
                  <Option value="quality_report">质量报告</Option>
                  <Option value="progress_report">进度报告</Option>
                  <Option value="final_report">最终报告</Option>
                </Select>
                <Button
                  type="primary"
                  icon={<PlusOutlined />}
                  onClick={handleAddReport}
                >
                  创建报告
                </Button>
              </Space>
            </div>

            <Table
              columns={columns}
              dataSource={filteredReports}
              rowKey="id"
              loading={loading}
              scroll={{ x: 1800 }}
              pagination={{
                total: filteredReports.length,
                pageSize: 10,
                showSizeChanger: true,
                showQuickJumper: true,
                showTotal: (total) => `共 ${total} 条记录`
              }}
            />
          </TabPane>

          <TabPane tab="报告模板" key="templates">
            <Alert
              message="报告模板管理"
              description="管理不同类型的报告模板，支持自定义模板格式"
              type="info"
              showIcon
              style={{ marginBottom: 16 }}
            />
            
            <Row gutter={16}>
              <Col span={8}>
                <Card title="16S rRNA分析报告模板" size="small" hoverable>
                  <p><strong>适用场景:</strong> 16S rRNA基因测序分析</p>
                  <p><strong>包含章节:</strong></p>
                  <ul>
                    <li>项目概述</li>
                    <li>实验方法</li>
                    <li>数据质量评估</li>
                    <li>多样性分析</li>
                    <li>分类学分析</li>
                    <li>结论与建议</li>
                  </ul>
                  <Button type="primary" size="small" block>
                    使用模板
                  </Button>
                </Card>
              </Col>
              <Col span={8}>
                <Card title="宏基因组分析报告模板" size="small" hoverable>
                  <p><strong>适用场景:</strong> 宏基因组shotgun测序分析</p>
                  <p><strong>包含章节:</strong></p>
                  <ul>
                    <li>项目背景</li>
                    <li>测序策略</li>
                    <li>数据预处理</li>
                    <li>物种组成分析</li>
                    <li>功能基因分析</li>
                    <li>代谢通路分析</li>
                  </ul>
                  <Button type="primary" size="small" block>
                    使用模板
                  </Button>
                </Card>
              </Col>
              <Col span={8}>
                <Card title="质量控制报告模板" size="small" hoverable>
                  <p><strong>适用场景:</strong> 实验质量控制报告</p>
                  <p><strong>包含章节:</strong></p>
                  <ul>
                    <li>质控标准</li>
                    <li>样本质量评估</li>
                    <li>测序质量分析</li>
                    <li>数据质量统计</li>
                    <li>质控结论</li>
                    <li>改进建议</li>
                  </ul>
                  <Button type="primary" size="small" block>
                    使用模板
                  </Button>
                </Card>
              </Col>
            </Row>
          </TabPane>

          <TabPane tab="审核流程" key="workflow">
            <Alert
              message="报告审核流程"
              description="标准化的报告审核流程，确保报告质量"
              type="info"
              showIcon
              style={{ marginBottom: 16 }}
            />
            
            <Steps
              direction="vertical"
              current={-1}
              items={[
                {
                  title: '创建草稿',
                  description: '作者创建报告草稿，填写基本信息和内容',
                  icon: <EditOutlined />
                },
                {
                  title: '提交审核',
                  description: '作者完成报告后提交给指定审核人员',
                  icon: <SendOutlined />
                },
                {
                  title: '专业审核',
                  description: '审核人员检查报告内容、数据准确性和格式规范',
                  icon: <AuditOutlined />
                },
                {
                  title: '修改完善',
                  description: '根据审核意见修改报告内容（如需要）',
                  icon: <EditOutlined />
                },
                {
                  title: '批准发布',
                  description: '审核通过后，报告获得批准并可以发布',
                  icon: <CheckCircleOutlined />
                },
                {
                  title: '公开发布',
                  description: '将批准的报告发布给相关人员或公开访问',
                  icon: <ShareAltOutlined />
                }
              ]}
            />
          </TabPane>
        </Tabs>
      </Card>

      {/* 新增/编辑报告模态框 */}
      <Modal
        title={editingReport ? '编辑报告' : '创建报告'}
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
                name="title"
                label="报告标题"
                rules={[{ required: true, message: '请输入报告标题' }]}
              >
                <Input placeholder="请输入报告标题" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="type"
                label="报告类型"
                rules={[{ required: true, message: '请选择报告类型' }]}
              >
                <Select placeholder="请选择报告类型">
                  <Option value="analysis_report">分析报告</Option>
                  <Option value="summary_report">总结报告</Option>
                  <Option value="quality_report">质量报告</Option>
                  <Option value="progress_report">进度报告</Option>
                  <Option value="final_report">最终报告</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            name="description"
            label="报告描述"
            rules={[{ required: true, message: '请输入报告描述' }]}
          >
            <TextArea rows={3} placeholder="请输入报告描述" />
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
                name="projectId"
                label="关联项目"
                rules={[{ required: true, message: '请选择关联项目' }]}
              >
                <Select placeholder="请选择关联项目">
                  {projects.map(project => (
                    <Option key={project.id} value={project.id}>
                      {project.name}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                name="analysisTaskId"
                label="关联分析任务"
              >
                <Select placeholder="请选择关联分析任务" allowClear>
                  {analysisTasks.map(task => (
                    <Option key={task.id} value={task.id}>
                      {task.name}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="templateId"
                label="报告模板"
                rules={[{ required: true, message: '请选择报告模板' }]}
              >
                <Select placeholder="请选择报告模板">
                  <Option value="template_16s">16S rRNA分析报告模板</Option>
                  <Option value="template_metagenome">宏基因组分析报告模板</Option>
                  <Option value="template_dual">双重测序分析报告模板</Option>
                  <Option value="template_quality">质量控制报告模板</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="reviewerId"
                label="指定审核人"
              >
                <Select placeholder="请选择审核人" allowClear>
                  <Option value="2">李四</Option>
                  <Option value="5">孙七</Option>
                  <Option value="6">周八</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={8}>
              <Form.Item
                name="fileFormat"
                label="文件格式"
                rules={[{ required: true, message: '请选择文件格式' }]}
              >
                <Select placeholder="请选择文件格式">
                  <Option value="pdf">PDF</Option>
                  <Option value="docx">Word文档</Option>
                  <Option value="html">HTML</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                name="language"
                label="报告语言"
                rules={[{ required: true, message: '请选择报告语言' }]}
              >
                <Select placeholder="请选择报告语言">
                  <Option value="zh-CN">中文</Option>
                  <Option value="en-US">英文</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                name="expiryDate"
                label="有效期至"
              >
                <DatePicker 
                  style={{ width: '100%' }} 
                  placeholder="请选择有效期"
                />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="isPublic"
                label="公开访问"
                valuePropName="checked"
              >
                <Switch checkedChildren="是" unCheckedChildren="否" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="status"
                label="报告状态"
                rules={[{ required: true, message: '请选择报告状态' }]}
              >
                <Select placeholder="请选择报告状态">
                  <Option value="draft">草稿</Option>
                  <Option value="under_review">审核中</Option>
                  <Option value="approved">已批准</Option>
                  <Option value="published">已发布</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            name="tags"
            label="标签"
          >
            <Select
              mode="tags"
              placeholder="请输入标签，按回车添加"
              style={{ width: '100%' }}
            />
          </Form.Item>

          <Form.Item
            name="authorId"
            label="报告作者"
            rules={[{ required: true, message: '请选择报告作者' }]}
          >
            <Select placeholder="请选择报告作者">
              <Option value="3">王五</Option>
              <Option value="4">赵六</Option>
              <Option value="5">孙七</Option>
            </Select>
          </Form.Item>

          <Form.Item style={{ textAlign: 'right', marginBottom: 0 }}>
            <Space>
              <Button onClick={() => setModalVisible(false)}>
                取消
              </Button>
              <Button type="primary" htmlType="submit" loading={loading}>
                {editingReport ? '更新' : '创建'}
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>

      {/* 报告详情模态框 */}
      <Modal
        title="报告详情"
        open={detailModalVisible}
        onCancel={() => setDetailModalVisible(false)}
        footer={[
          <Button key="close" onClick={() => setDetailModalVisible(false)}>
            关闭
          </Button>
        ]}
        width={900}
      >
        {selectedReport && (
          <div>
            <Descriptions bordered column={2}>
              <Descriptions.Item label="报告标题">{selectedReport.title}</Descriptions.Item>
              <Descriptions.Item label="报告类型">
                <Tag color="blue">
                  {getReportTypeText(selectedReport.type)}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="状态">
                <Tag color={getStatusColor(selectedReport.status)}>
                  {getStatusText(selectedReport.status)}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="审批状态">
                <Tag color={getApprovalStatusColor(selectedReport.approvalStatus)}>
                  {getApprovalStatusText(selectedReport.approvalStatus)}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="优先级">
                <Tag color={getPriorityColor(selectedReport.priority)}>
                  {getPriorityText(selectedReport.priority)}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="版本">v{selectedReport.version}</Descriptions.Item>
              <Descriptions.Item label="作者">{selectedReport.authorName}</Descriptions.Item>
              <Descriptions.Item label="审核人">{selectedReport.reviewerName || '未指定'}</Descriptions.Item>
              <Descriptions.Item label="关联项目">{selectedReport.projectName}</Descriptions.Item>
              <Descriptions.Item label="关联分析任务">{selectedReport.analysisTaskName || '无'}</Descriptions.Item>
              <Descriptions.Item label="文件格式">{selectedReport.fileFormat.toUpperCase()}</Descriptions.Item>
              <Descriptions.Item label="文件大小">{selectedReport.fileSize.toFixed(1)} MB</Descriptions.Item>
              <Descriptions.Item label="查看次数">{selectedReport.viewCount}</Descriptions.Item>
              <Descriptions.Item label="下载次数">{selectedReport.downloadCount}</Descriptions.Item>
              <Descriptions.Item label="公开访问">
                {selectedReport.isPublic ? '是' : '否'}
              </Descriptions.Item>
              <Descriptions.Item label="有效期至">
                {selectedReport.expiryDate || '无限制'}
              </Descriptions.Item>
            </Descriptions>
            
            <Divider />
            
            <Descriptions bordered column={1}>
              <Descriptions.Item label="报告描述">
                {selectedReport.description}
              </Descriptions.Item>
              {selectedReport.reviewComments && (
                <Descriptions.Item label="审核意见">
                  {selectedReport.reviewComments}
                </Descriptions.Item>
              )}
            </Descriptions>

            {selectedReport.tags && selectedReport.tags.length > 0 && (
              <>
                <Divider />
                <Title level={5}>标签</Title>
                <Space wrap>
                  {selectedReport.tags.map((tag, index) => (
                    <Tag key={index} color="blue">{tag}</Tag>
                  ))}
                </Space>
              </>
            )}

            <Divider />
            <Title level={5}>时间线</Title>
            <Timeline>
              <Timeline.Item color="green">
                <strong>创建时间:</strong> {dayjs(selectedReport.createdAt).format('YYYY-MM-DD HH:mm')}
              </Timeline.Item>
              {selectedReport.reviewDate && (
                <Timeline.Item color="blue">
                  <strong>审核时间:</strong> {dayjs(selectedReport.reviewDate).format('YYYY-MM-DD HH:mm')}
                </Timeline.Item>
              )}
              {selectedReport.publishDate && (
                <Timeline.Item color="cyan">
                  <strong>发布时间:</strong> {dayjs(selectedReport.publishDate).format('YYYY-MM-DD HH:mm')}
                </Timeline.Item>
              )}
              <Timeline.Item color="gray">
                <strong>最后更新:</strong> {dayjs(selectedReport.updatedAt).format('YYYY-MM-DD HH:mm')}
              </Timeline.Item>
            </Timeline>
          </div>
        )}
      </Modal>

      {/* 报告预览模态框 */}
      <Modal
        title="报告预览"
        open={previewModalVisible}
        onCancel={() => setPreviewModalVisible(false)}
        footer={[
          <Button key="download" type="primary" icon={<DownloadOutlined />}>
            下载报告
          </Button>,
          <Button key="close" onClick={() => setPreviewModalVisible(false)}>
            关闭
          </Button>
        ]}
        width={1000}
      >
        {selectedReport && (
          <div style={{ height: 600, border: '1px solid #d9d9d9', padding: 16 }}>
            <Alert
              message={`报告预览: ${selectedReport.title}`}
              description={`版本: v${selectedReport.version} | 格式: ${selectedReport.fileFormat.toUpperCase()} | 大小: ${selectedReport.fileSize.toFixed(1)} MB`}
              type="info"
              showIcon
              style={{ marginBottom: 16 }}
            />
            
            <div style={{ textAlign: 'center', padding: '100px 0', color: '#999' }}>
              <FileTextOutlined style={{ fontSize: 64, marginBottom: 16 }} />
              <div>报告预览功能开发中...</div>
              <div style={{ marginTop: 8 }}>
                支持 PDF、Word、HTML 格式的在线预览
              </div>
            </div>
          </div>
        )}
      </Modal>

      {/* 审核模态框 */}
      <Modal
        title="报告审核"
        open={auditModalVisible}
        onCancel={() => {
          setAuditModalVisible(false);
          auditForm.resetFields();
        }}
        footer={null}
        width={600}
      >
        {selectedReport && (
          <div>
            <Alert
              message={`审核报告: ${selectedReport.title}`}
              description={`作者: ${selectedReport.authorName} | 版本: v${selectedReport.version}`}
              type="info"
              showIcon
              style={{ marginBottom: 16 }}
            />
            
            <Form
              form={auditForm}
              layout="vertical"
              onFinish={handleAuditSubmit}
            >
              <Form.Item
                name="decision"
                label="审核决定"
                rules={[{ required: true, message: '请选择审核决定' }]}
              >
                <Radio.Group>
                  <Radio value="approved">批准</Radio>
                  <Radio value="rejected">拒绝</Radio>
                </Radio.Group>
              </Form.Item>

              <Form.Item
                name="comments"
                label="审核意见"
                rules={[{ required: true, message: '请输入审核意见' }]}
              >
                <TextArea 
                  rows={4} 
                  placeholder="请输入详细的审核意见和建议"
                />
              </Form.Item>

              <Form.Item style={{ textAlign: 'right', marginBottom: 0 }}>
                <Space>
                  <Button onClick={() => setAuditModalVisible(false)}>
                    取消
                  </Button>
                  <Button type="primary" htmlType="submit" loading={loading}>
                    提交审核
                  </Button>
                </Space>
              </Form.Item>
            </Form>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default ReportManagement;