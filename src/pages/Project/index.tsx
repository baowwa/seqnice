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
  message, 
  Popconfirm, 
  Tag, 
  Progress, 
  Row, 
  Col, 
  Statistic, 
  Tooltip,
  Divider,
  Switch,
  Tabs,
  Steps
} from 'antd';
import { 
  PlusOutlined, 
  EditOutlined, 
  DeleteOutlined, 
  EyeOutlined, 
  ProjectOutlined, 
  UserOutlined,
  BankOutlined,
  NodeIndexOutlined,
  SettingOutlined,
  FileTextOutlined
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import dayjs from 'dayjs';
import { 
  Project, 
  Customer, 
  User, 
  ProjectStatus,
  ProjectType,
  ProjectCenter,
  ProjectStage,
  ProjectTemplate,
  UserRole
} from '../../types';
import ProjectCenterManager from '../../components/ProjectCenterManager';
import ProjectStageManager from '../../components/ProjectStageManager';
import ProjectTemplateManager from '../../components/ProjectTemplateManager';
import StageTransitionManager from '../../components/StageTransitionManager';

const { Option } = Select;
const { TextArea } = Input;
const { RangePicker } = DatePicker;
const { TabPane } = Tabs;
const { Step } = Steps;

/**
 * 项目管理组件
 * 负责项目的创建、分配、进度跟踪等功能
 */
const ProjectManagement: React.FC = () => {
  // 状态管理
  const [projects, setProjects] = useState<Project[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [form] = Form.useForm();
  const [searchText, setSearchText] = useState('');
  const [statusFilter, setStatusFilter] = useState<ProjectStatus | ''>('');
  const [activeTab, setActiveTab] = useState('basic');
  const [projectCenters, setProjectCenters] = useState<ProjectCenter[]>([]);
  const [projectStages, setProjectStages] = useState<ProjectStage[]>([]);
  const [templateModalVisible, setTemplateModalVisible] = useState(false);
  const [transitionModalVisible, setTransitionModalVisible] = useState(false);
  const [transitionStages, setTransitionStages] = useState<{
    current: ProjectStage | null;
    target: ProjectStage | null;
  }>({ current: null, target: null });

  // 组件挂载时获取数据
  useEffect(() => {
    fetchProjects();
    fetchCustomers();
    fetchUsers();
  }, []);

  // 模拟API调用 - 获取项目列表
  const fetchProjects = async () => {
    setLoading(true);
    try {
      // 模拟API延迟
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const mockProjects: Project[] = [
        {
          id: '1',
          name: '肠道菌群多样性分析项目',
          code: 'PRJ001',
          type: ProjectType.RESEARCH_SERVICE,
          customerId: '1',
          customer: {
            id: '1',
            name: '北京大学医学院',
            code: 'PKU001',
            contact: '张教授',
            phone: '010-12345678',
            email: 'zhang@pku.edu.cn',
            address: '北京市海淀区学院路38号',
            type: 'research',
            status: 'active',
            createdAt: '2024-01-01T00:00:00Z',
            updatedAt: '2024-01-01T00:00:00Z'
          },
          description: '研究肠道菌群与疾病的关系',
          status: ProjectStatus.IN_PROGRESS,
          priority: 'high',
          startDate: '2024-01-15',
          expectedEndDate: '2024-03-15',
          actualEndDate: undefined,
          assignedTo: '1',
          assignedUser: {
            id: '1',
            username: 'zhangsan',
            name: '张三',
            email: 'zhangsan@example.com',
            role: UserRole.ANALYST,
            department: '分析部',
            isActive: true,
            createdAt: '2024-01-01T00:00:00Z',
            updatedAt: '2024-01-01T00:00:00Z'
          },
          budget: 50000,
          progress: 75,
          isMultiCenter: true,
          centers: [],
          isMultiStage: true,
          stages: [],
          createdAt: '2024-01-10T10:00:00Z',
          updatedAt: '2024-02-25T15:30:00Z'
        },
        {
          id: '2',
          name: '土壤微生物群落结构研究',
          code: 'PRJ002',
          type: ProjectType.RESEARCH_SERVICE,
          customerId: '2',
          customer: {
            id: '2',
            name: '中科院生态环境研究中心',
            code: 'CAS001',
            contact: '李研究员',
            phone: '010-87654321',
            email: 'li@cas.cn',
            address: '北京市朝阳区大屯路18号',
            type: 'research',
            status: 'active',
            createdAt: '2024-01-01T00:00:00Z',
            updatedAt: '2024-01-01T00:00:00Z'
          },
          description: '分析不同土壤类型的微生物群落结构',
          status: ProjectStatus.PENDING,
          priority: 'medium',
          startDate: '2024-03-01',
          expectedEndDate: '2024-05-01',
          assignedTo: '2',
          assignedUser: {
            id: '2',
            username: 'lisi',
            name: '李四',
            email: 'lisi@example.com',
            role: UserRole.ANALYST,
            department: '分析部',
            isActive: true,
            createdAt: '2024-01-01T00:00:00Z',
            updatedAt: '2024-01-01T00:00:00Z'
          },
          budget: 80000,
          progress: 0,
          isMultiCenter: false,
          isMultiStage: true,
          createdAt: '2024-02-01T10:00:00Z',
          updatedAt: '2024-02-01T10:00:00Z'
        }
      ];
      
      setProjects(mockProjects);
    } catch (error) {
      message.error('获取项目列表失败');
    } finally {
      setLoading(false);
    }
  };

  // 模拟API调用 - 获取客户列表
  const fetchCustomers = async () => {
    const mockCustomers: Customer[] = [
      {
        id: '1',
        name: '北京大学医学院',
        code: 'PKU001',
        contact: '张教授',
        phone: '010-12345678',
        email: 'zhang@pku.edu.cn',
        address: '北京市海淀区学院路38号',
        type: 'research',
        status: 'active',
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z'
      },
      {
        id: '2',
        name: '中科院生态环境研究中心',
        code: 'CAS001',
        contact: '李研究员',
        phone: '010-87654321',
        email: 'li@cas.cn',
        address: '北京市朝阳区大屯路18号',
        type: 'research',
        status: 'active',
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z'
      },
      {
        id: '3',
        name: '清华大学生命科学学院',
        code: 'THU001',
        contact: '王教授',
        phone: '010-11111111',
        email: 'wang@tsinghua.edu.cn',
        address: '北京市海淀区清华园1号',
        type: 'research',
        status: 'active',
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z'
      }
    ];
    setCustomers(mockCustomers);
  };

  // 模拟API调用 - 获取用户列表
  const fetchUsers = async () => {
    const mockUsers: User[] = [
      {
        id: '1',
        username: 'zhangsan',
        name: '张三',
        email: 'zhangsan@example.com',
        role: UserRole.ADMIN,
        department: '管理部',
        position: '项目经理',
        isActive: true,
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z'
      },
      {
        id: '2',
        username: 'lisi',
        name: '李四',
        email: 'lisi@example.com',
        role: UserRole.ANALYST,
        department: '分析部',
        position: '高级分析师',
        isActive: true,
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z'
      },
      {
        id: '3',
        username: 'wangwu',
        name: '王五',
        email: 'wangwu@example.com',
        role: UserRole.LAB_TECHNICIAN,
        department: '实验部',
        position: '实验技师',
        isActive: true,
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z'
      },
      {
        id: '4',
        username: 'zhaoliu',
        name: '赵六',
        email: 'zhaoliu@example.com',
        role: UserRole.ANALYST,
        department: '分析部',
        position: '分析师',
        isActive: true,
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z'
      }
    ];
    setUsers(mockUsers);
  };

  // 获取项目状态显示文本
  const getStatusText = (status: ProjectStatus) => {
    const statusMap = {
      [ProjectStatus.PENDING]: '待开始',
      [ProjectStatus.IN_PROGRESS]: '进行中',
      [ProjectStatus.COMPLETED]: '已完成',
      [ProjectStatus.CANCELLED]: '已取消'
    };
    return statusMap[status];
  };

  // 获取项目状态颜色
  const getStatusColor = (status: ProjectStatus) => {
    const colorMap = {
      [ProjectStatus.PENDING]: 'default',
      [ProjectStatus.IN_PROGRESS]: 'processing',
      [ProjectStatus.COMPLETED]: 'success',
      [ProjectStatus.CANCELLED]: 'error'
    };
    return colorMap[status];
  };

  // 获取优先级显示文本
  const getPriorityText = (priority: string) => {
    const priorityMap: Record<string, string> = {
      'low': '低',
      'medium': '中',
      'high': '高',
      'urgent': '紧急'
    };
    return priorityMap[priority] || priority;
  };

  // 获取优先级颜色
  const getPriorityColor = (priority: string) => {
    const colorMap: Record<string, string> = {
      'low': 'green',
      'medium': 'blue',
      'high': 'orange',
      'urgent': 'red'
    };
    return colorMap[priority] || 'default';
  };

  // 获取项目类型显示文本
  const getProjectTypeText = (type: ProjectType) => {
    const typeMap = {
      [ProjectType.PRODUCT_REGISTRATION]: '产品注册',
      [ProjectType.RESEARCH_SERVICE]: '科研服务',
      [ProjectType.CLINICAL_DETECTION]: '临床检测'
    };
    return typeMap[type];
  };

  // 处理新增项目
  const handleAddProject = () => {
    setEditingProject(null);
    form.resetFields();
    setModalVisible(true);
  };

  // 处理编辑项目
  const handleEditProject = (project: Project) => {
    setEditingProject(project);
    form.setFieldsValue({
      ...project,
      dateRange: [dayjs(project.startDate), dayjs(project.expectedEndDate)]
    });
    setModalVisible(true);
  };

  // 处理查看项目详情
  const handleViewProject = (project: Project) => {
    setSelectedProject(project);
    setDetailModalVisible(true);
  };

  // 处理删除项目
  const handleDeleteProject = async (id: string) => {
    try {
      // 模拟API调用
      await new Promise(resolve => setTimeout(resolve, 500));
      setProjects(projects.filter(p => p.id !== id));
      message.success('项目删除成功');
    } catch (error) {
      message.error('删除项目失败');
    }
  };

  // 处理表单提交
  const handleSubmit = async (values: any) => {
    try {
      setLoading(true);
      
      // 模拟API调用
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const projectData = {
        ...values,
        startDate: values.dateRange[0].format('YYYY-MM-DD'),
        expectedEndDate: values.dateRange[1].format('YYYY-MM-DD'),
        customer: customers.find(c => c.id === values.customerId),
        assignedUser: users.find(u => u.id === values.assignedTo),
        progress: editingProject ? editingProject.progress : 0
      };

      if (editingProject) {
        // 更新项目
        const updatedProject = {
          ...editingProject,
          ...projectData,
          updatedAt: new Date().toISOString()
        };
        setProjects(projects.map(p => p.id === editingProject.id ? updatedProject : p));
        message.success('项目更新成功');
      } else {
        // 新增项目
        const newProject: Project = {
          id: Date.now().toString(),
          code: `PRJ${String(projects.length + 1).padStart(3, '0')}`,
          ...projectData,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
        setProjects([...projects, newProject]);
        message.success('项目创建成功');
      }

      setModalVisible(false);
      form.resetFields();
    } catch (error) {
      message.error('操作失败');
    } finally {
      setLoading(false);
    }
  };

  // 处理模板选择
  const handleSelectTemplate = (template: ProjectTemplate) => {
    // 应用模板到表单
    form.setFieldsValue({
      name: `${template.name} - 项目`,
      type: template.type,
      description: template.description,
      isMultiCenter: template.isMultiCenter,
      isMultiStage: template.isMultiStage,
      estimatedDuration: template.estimatedDuration
    });
    
    // 如果有默认阶段，可以在这里设置
    if (template.defaultStages && template.defaultStages.length > 0) {
      // 这里可以设置项目的默认阶段
      console.log('应用默认阶段:', template.defaultStages);
    }
    
    // 如果有默认中心类型，可以在这里设置
    if (template.defaultCenterTypes && template.defaultCenterTypes.length > 0) {
      // 这里可以设置项目的默认中心类型
      console.log('应用默认中心类型:', template.defaultCenterTypes);
    }
    
    setTemplateModalVisible(false);
    message.success(`已应用模板：${template.name}`);
  };

  // 处理阶段转换
  const handleStageTransition = (currentStage: ProjectStage, targetStage: ProjectStage) => {
    setTransitionStages({ current: currentStage, target: targetStage });
    setTransitionModalVisible(true);
  };

  // 处理转换成功
  const handleTransitionSuccess = (fromStage: ProjectStage, toStage: ProjectStage) => {
    // 更新项目阶段状态
    if (selectedProject) {
      const updatedProject = {
        ...selectedProject,
        // 这里可以更新项目的阶段信息
        updatedAt: new Date().toISOString()
      };
      
      // 更新项目列表
      setProjects(projects.map(p => 
        p.id === selectedProject.id ? updatedProject : p
      ));
      
      message.success(`阶段转换成功：${fromStage.name} → ${toStage.name}`);
    }
    
    setTransitionModalVisible(false);
  };

  // 过滤项目数据
  const filteredProjects = projects.filter(project => {
    const matchesSearch = !searchText || 
      project.name.toLowerCase().includes(searchText.toLowerCase()) ||
      project.code.toLowerCase().includes(searchText.toLowerCase()) ||
      project.customer.name.toLowerCase().includes(searchText.toLowerCase());
    
    const matchesStatus = !statusFilter || project.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  // 计算统计数据
  const statistics = {
    total: projects.length,
    pending: projects.filter(p => p.status === ProjectStatus.PENDING).length,
    inProgress: projects.filter(p => p.status === ProjectStatus.IN_PROGRESS).length,
    completed: projects.filter(p => p.status === ProjectStatus.COMPLETED).length,
    totalBudget: projects.reduce((sum, p) => sum + (p.budget || 0), 0)
  };

  // 表格列定义
  const columns: ColumnsType<Project> = [
    {
      title: '项目信息',
      key: 'projectInfo',
      width: 300,
      ellipsis: true,
      render: (_, record) => (
        <div>
          <div style={{ fontWeight: 500, marginBottom: 4 }}>
            {record.name}
          </div>
          <div style={{ fontSize: '12px', color: '#666', marginBottom: 2 }}>
            编号: {record.code}
          </div>
          <div style={{ fontSize: '12px', color: '#666' }}>
            类型: {getProjectTypeText(record.type)}
          </div>
          <div style={{ marginTop: 4 }}>
            {record.isMultiCenter && (
              <Tag color="blue" icon={<BankOutlined />}>
                多中心
              </Tag>
            )}
            {record.isMultiStage && (
              <Tag color="green" icon={<NodeIndexOutlined />}>
                多阶段
              </Tag>
            )}
          </div>
        </div>
      )
    },
    {
      title: '客户信息',
      key: 'customer',
      width: 200,
      ellipsis: true,
      render: (_, record) => (
        <div>
          <div style={{ fontWeight: 500 }}>{record.customer.name}</div>
          <div style={{ fontSize: '12px', color: '#666' }}>
            {record.customer.contact}
          </div>
        </div>
      )
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 120,
      render: (status: ProjectStatus) => (
        <Tag color={getStatusColor(status)}>
          {getStatusText(status)}
        </Tag>
      )
    },
    {
      title: '进度',
      dataIndex: 'progress',
      key: 'progress',
      width: 120,
      render: (progress: number) => (
        <Progress percent={progress} size="small" />
      )
    },
    {
      title: '项目经理',
      key: 'manager',
      width: 120,
      render: (_, record) => (
        <div>
          <UserOutlined style={{ marginRight: 4 }} />
          {record.assignedUser.name}
        </div>
      )
    },
    {
      title: '时间安排',
      key: 'schedule',
      width: 200,
      render: (_, record) => (
        <div>
          <div style={{ fontSize: '12px', color: '#666' }}>
            开始: {dayjs(record.startDate).format('MM-DD')}
          </div>
          <div style={{ fontSize: '12px', color: '#666' }}>
            预计结束: {dayjs(record.expectedEndDate).format('MM-DD')}
          </div>
          {record.actualEndDate && (
            <div style={{ fontSize: '12px', color: '#666' }}>
              实际结束: {dayjs(record.actualEndDate).format('MM-DD')}
            </div>
          )}
        </div>
      )
    },
    {
      title: '预算',
      dataIndex: 'budget',
      key: 'budget',
      width: 120,
      render: (budget: number) => (
        <span>¥{budget?.toLocaleString()}</span>
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
      title: '操作',
      key: 'action',
      width: 150,
      fixed: 'right',
      render: (_, record) => (
        <Space size="small">
          <Tooltip title="查看详情">
            <Button
              type="text"
              icon={<EyeOutlined />}
              onClick={() => handleViewProject(record)}
            />
          </Tooltip>
          <Tooltip title="编辑">
            <Button
              type="text"
              icon={<EditOutlined />}
              onClick={() => handleEditProject(record)}
            />
          </Tooltip>
          <Popconfirm
            title="确定要删除这个项目吗？"
            onConfirm={() => handleDeleteProject(record.id)}
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
    <div>
      {/* 统计卡片 */}
      <Row gutter={16} style={{ marginBottom: 16 }}>
        <Col span={6}>
          <Card>
            <Statistic
              title="项目总数"
              value={statistics.total}
              prefix={<ProjectOutlined />}
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
              title="总预算"
              value={statistics.totalBudget}
              formatter={(value) => `¥${value?.toLocaleString()}`}
            />
          </Card>
        </Col>
      </Row>

      {/* 主要内容卡片 */}
      <Card 
        title="项目管理"
        extra={
          <Space>
            <Input.Search
              placeholder="搜索项目名称、编号或客户"
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              style={{ width: 250 }}
            />
            <Select
              placeholder="筛选状态"
              value={statusFilter}
              onChange={setStatusFilter}
              style={{ width: 120 }}
              allowClear
            >
              <Option value={ProjectStatus.PENDING}>待开始</Option>
              <Option value={ProjectStatus.IN_PROGRESS}>进行中</Option>
              <Option value={ProjectStatus.COMPLETED}>已完成</Option>
              <Option value={ProjectStatus.CANCELLED}>已取消</Option>
            </Select>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={handleAddProject}
            >
              新建项目
            </Button>
          </Space>
        }
      >
        <Table
          columns={columns}
          dataSource={filteredProjects}
          rowKey="id"
          loading={loading}
          scroll={{ x: 1500 }}
          pagination={{
            total: filteredProjects.length,
            pageSize: 10,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total) => `共 ${total} 条记录`
          }}
        />
      </Card>

      {/* 新增/编辑项目模态框 */}
      <Modal
        title={editingProject ? '编辑项目' : '新建项目'}
        open={modalVisible}
        onCancel={() => {
          setModalVisible(false);
          form.resetFields();
        }}
        footer={null}
        width={1000}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
        >
          <Tabs activeKey={activeTab} onChange={setActiveTab}>
            <TabPane tab="基本信息" key="basic">
              {/* 模板选择按钮 */}
              {!editingProject && (
                <div style={{ marginBottom: 16, textAlign: 'right' }}>
                  <Button
                    type="dashed"
                    icon={<FileTextOutlined />}
                    onClick={() => setTemplateModalVisible(true)}
                  >
                    从模板创建
                  </Button>
                </div>
              )}
              
              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item
                    name="name"
                    label="项目名称"
                    rules={[{ required: true, message: '请输入项目名称' }]}
                  >
                    <Input placeholder="请输入项目名称" />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item
                    name="type"
                    label="项目类型"
                    rules={[{ required: true, message: '请选择项目类型' }]}
                  >
                    <Select placeholder="请选择项目类型">
                      <Option value={ProjectType.PRODUCT_REGISTRATION}>产品注册</Option>
                      <Option value={ProjectType.RESEARCH_SERVICE}>科研服务</Option>
                      <Option value={ProjectType.CLINICAL_DETECTION}>临床检测</Option>
                    </Select>
                  </Form.Item>
                </Col>
              </Row>

              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item
                    name="customerId"
                    label="客户"
                    rules={[{ required: true, message: '请选择客户' }]}
                  >
                    <Select placeholder="请选择客户">
                      {customers.map(customer => (
                        <Option key={customer.id} value={customer.id}>
                          {customer.name}
                        </Option>
                      ))}
                    </Select>
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item
                    name="assignedTo"
                    label="项目经理"
                    rules={[{ required: true, message: '请选择项目经理' }]}
                  >
                    <Select placeholder="请选择项目经理">
                      {users.filter(u => u.role === UserRole.ADMIN || u.role === UserRole.ANALYST).map(user => (
                        <Option key={user.id} value={user.id}>
                          {user.name}
                        </Option>
                      ))}
                    </Select>
                  </Form.Item>
                </Col>
              </Row>

              <Form.Item
                name="description"
                label="项目描述"
                rules={[{ required: true, message: '请输入项目描述' }]}
              >
                <TextArea rows={3} placeholder="请输入项目描述" />
              </Form.Item>

              <Row gutter={16}>
                <Col span={8}>
                  <Form.Item
                    name="priority"
                    label="优先级"
                    rules={[{ required: true, message: '请选择优先级' }]}
                  >
                    <Select placeholder="请选择优先级">
                      <Option value="low">低</Option>
                      <Option value="medium">中</Option>
                      <Option value="high">高</Option>
                      <Option value="urgent">紧急</Option>
                    </Select>
                  </Form.Item>
                </Col>
                <Col span={8}>
                  <Form.Item
                    name="budget"
                    label="项目预算"
                    rules={[{ required: true, message: '请输入项目预算' }]}
                  >
                    <Input type="number" placeholder="请输入项目预算" addonAfter="元" />
                  </Form.Item>
                </Col>
                <Col span={8}>
                  <Form.Item
                    name="dateRange"
                    label="项目周期"
                    rules={[{ required: true, message: '请选择项目周期' }]}
                  >
                    <RangePicker style={{ width: '100%' }} />
                  </Form.Item>
                </Col>
              </Row>

              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item
                    name="isMultiCenter"
                    label="多中心项目"
                    valuePropName="checked"
                  >
                    <Switch />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item
                    name="isMultiStage"
                    label="多阶段项目"
                    valuePropName="checked"
                  >
                    <Switch />
                  </Form.Item>
                </Col>
              </Row>
            </TabPane>

            <TabPane tab="中心配置" key="centers">
              <ProjectCenterManager
                projectId={editingProject?.id || ''}
                centers={projectCenters}
                onCentersChange={setProjectCenters}
              />
            </TabPane>

            <TabPane tab="阶段配置" key="stages">
              <ProjectStageManager
                projectId={editingProject?.id || ''}
                stages={projectStages}
                onStagesChange={setProjectStages}
                onStageTransition={handleStageTransition}
              />
            </TabPane>
          </Tabs>

          <Form.Item style={{ textAlign: 'right', marginTop: 24, marginBottom: 0 }}>
            <Space>
              <Button onClick={() => setModalVisible(false)}>
                取消
              </Button>
              <Button type="primary" htmlType="submit" loading={loading}>
                {editingProject ? '更新' : '创建'}
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>

      {/* 项目模板选择模态框 */}
      <ProjectTemplateManager
        modal={true}
        visible={templateModalVisible}
        onClose={() => setTemplateModalVisible(false)}
        onSelectTemplate={handleSelectTemplate}
      />
      
      {/* 项目详情模态框 */}
      <Modal
        title="项目详情"
        open={detailModalVisible}
        onCancel={() => setDetailModalVisible(false)}
        footer={[
          <Button key="close" onClick={() => setDetailModalVisible(false)}>
            关闭
          </Button>
        ]}
        width={800}
      >
        {selectedProject && (
          <div>
            <Row gutter={16}>
              <Col span={12}>
                <Card size="small" title="基本信息">
                  <p><strong>项目编号：</strong>{selectedProject.code}</p>
                  <p><strong>项目名称：</strong>{selectedProject.name}</p>
                  <p><strong>项目类型：</strong>{getProjectTypeText(selectedProject.type)}</p>
                  <p><strong>客户：</strong>{selectedProject.customer.name}</p>
                  <p><strong>项目经理：</strong>{selectedProject.assignedUser.name}</p>
                  <p><strong>状态：</strong>
                    <Tag color={getStatusColor(selectedProject.status)} style={{ marginLeft: 8 }}>
                      {getStatusText(selectedProject.status)}
                    </Tag>
                  </p>
                  <p><strong>优先级：</strong>
                    <Tag color={getPriorityColor(selectedProject.priority)} style={{ marginLeft: 8 }}>
                      {getPriorityText(selectedProject.priority)}
                    </Tag>
                  </p>
                </Card>
              </Col>
              <Col span={12}>
                <Card size="small" title="进度信息">
                  <p><strong>整体进度：</strong></p>
                  <Progress percent={selectedProject.progress} />
                  <p><strong>开始日期：</strong>{dayjs(selectedProject.startDate).format('YYYY-MM-DD')}</p>
                  <p><strong>预计结束：</strong>{dayjs(selectedProject.expectedEndDate).format('YYYY-MM-DD')}</p>
                  {selectedProject.actualEndDate && (
                    <p><strong>实际结束：</strong>{dayjs(selectedProject.actualEndDate).format('YYYY-MM-DD')}</p>
                  )}
                  <p><strong>项目预算：</strong>¥{(selectedProject.budget || 0).toLocaleString()}</p>
                </Card>
              </Col>
            </Row>
            
            <Divider />
            
            <Card size="small" title="项目描述">
              <p>{selectedProject.description}</p>
            </Card>

            {(selectedProject.isMultiCenter || selectedProject.isMultiStage) && (
              <>
                <Divider />
                <Row gutter={16}>
                  {selectedProject.isMultiCenter && (
                    <Col span={12}>
                      <Card size="small" title="多中心配置">
                        <Tag color="blue" icon={<BankOutlined />}>
                          多中心项目
                        </Tag>
                        <p style={{ marginTop: 8 }}>
                          中心数量: {selectedProject.centers?.length || 0}
                        </p>
                      </Card>
                    </Col>
                  )}
                  {selectedProject.isMultiStage && (
                    <Col span={12}>
                      <Card size="small" title="多阶段配置">
                        <Tag color="green" icon={<NodeIndexOutlined />}>
                          多阶段项目
                        </Tag>
                        <p style={{ marginTop: 8 }}>
                          阶段数量: {selectedProject.stages?.length || 0}
                        </p>
                      </Card>
                    </Col>
                  )}
                </Row>
              </>
            )}
          </div>
        )}
      </Modal>

      {/* 阶段转换模态框 */}
      {selectedProject && transitionStages.current && transitionStages.target && (
        <StageTransitionManager
          visible={transitionModalVisible}
          onClose={() => setTransitionModalVisible(false)}
          project={selectedProject}
          currentStage={transitionStages.current}
          targetStage={transitionStages.target}
          onTransitionSuccess={handleTransitionSuccess}
        />
      )}
    </div>
  );
};

export default ProjectManagement;