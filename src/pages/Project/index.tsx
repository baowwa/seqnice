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
  Tooltip,
  Divider,
  Badge
} from 'antd';
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  EyeOutlined,
  UserOutlined,
  CalendarOutlined,
  ProjectOutlined
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import type { Project, ProjectStatus, Customer, User } from '../../types';
import dayjs from 'dayjs';

const { Option } = Select;
const { TextArea } = Input;
const { RangePicker } = DatePicker;

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
          customerId: '1',
          customerName: '北京大学医学院',
          description: '研究肠道菌群与疾病的关系',
          status: 'in_progress',
          priority: 'high',
          startDate: '2024-01-15',
          endDate: '2024-03-15',
          estimatedDays: 60,
          actualDays: 45,
          progress: 75,
          managerId: '1',
          managerName: '张三',
          teamMembers: ['张三', '李四', '王五'],
          budget: 50000,
          actualCost: 37500,
          sampleCount: 120,
          completedSamples: 90,
          createdAt: '2024-01-10T10:00:00Z',
          updatedAt: '2024-02-25T15:30:00Z'
        },
        {
          id: '2',
          name: '土壤微生物群落结构研究',
          code: 'PRJ002',
          customerId: '2',
          customerName: '中科院生态环境研究中心',
          description: '分析不同土壤类型的微生物群落结构',
          status: 'planning',
          priority: 'medium',
          startDate: '2024-03-01',
          endDate: '2024-05-01',
          estimatedDays: 60,
          actualDays: 0,
          progress: 10,
          managerId: '2',
          managerName: '李四',
          teamMembers: ['李四', '王五'],
          budget: 80000,
          actualCost: 8000,
          sampleCount: 200,
          completedSamples: 0,
          createdAt: '2024-02-20T09:00:00Z',
          updatedAt: '2024-02-25T11:20:00Z'
        },
        {
          id: '3',
          name: '海洋微生物基因组测序',
          code: 'PRJ003',
          customerId: '3',
          customerName: '青岛海洋大学',
          description: '深海微生物基因组测序与功能分析',
          status: 'completed',
          priority: 'high',
          startDate: '2023-10-01',
          endDate: '2023-12-31',
          estimatedDays: 90,
          actualDays: 85,
          progress: 100,
          managerId: '1',
          managerName: '张三',
          teamMembers: ['张三', '赵六'],
          budget: 120000,
          actualCost: 115000,
          sampleCount: 50,
          completedSamples: 50,
          createdAt: '2023-09-25T14:00:00Z',
          updatedAt: '2023-12-31T18:00:00Z'
        },
        {
          id: '4',
          name: '结核分枝杆菌耐药基因检测',
          code: 'PRJ004',
          customerId: '4',
          customerName: '北京胸科医院',
          description: '结核分枝杆菌（Mycobacterium tuberculosis）耐药基因检测与分析',
          status: 'in_progress',
          priority: 'high',
          startDate: '2024-02-01',
          endDate: '2024-04-01',
          estimatedDays: 60,
          actualDays: 30,
          progress: 50,
          managerId: '2',
          managerName: '李四',
          teamMembers: ['李四', '王五', '赵六'],
          budget: 95000,
          actualCost: 47500,
          sampleCount: 150,
          completedSamples: 75,
          createdAt: '2024-01-25T08:30:00Z',
          updatedAt: '2024-03-01T16:45:00Z'
        },
        {
          id: '5',
          name: 'HIV病毒载量检测与基因型分析',
          code: 'PRJ005',
          customerId: '5',
          customerName: '首都医科大学附属北京佑安医院',
          description: '人类免疫缺陷病毒（Human Immunodeficiency Virus, HIV）病毒载量检测与耐药基因型分析',
          status: 'planning',
          priority: 'high',
          startDate: '2024-03-15',
          endDate: '2024-06-15',
          estimatedDays: 90,
          actualDays: 0,
          progress: 5,
          managerId: '1',
          managerName: '张三',
          teamMembers: ['张三', '李四'],
          budget: 110000,
          actualCost: 5500,
          sampleCount: 200,
          completedSamples: 0,
          createdAt: '2024-03-01T09:15:00Z',
          updatedAt: '2024-03-05T14:20:00Z'
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
      { id: '1', name: '北京大学医学院', code: 'PKU001', type: 'university', contactPerson: '王教授', phone: '010-12345678', email: 'wang@pku.edu.cn', address: '北京市海淀区学院路38号', isActive: true, createdAt: '2023-01-01T00:00:00Z', updatedAt: '2023-01-01T00:00:00Z' },
      { id: '2', name: '中科院生态环境研究中心', code: 'CAS001', type: 'research_institute', contactPerson: '李研究员', phone: '010-87654321', email: 'li@rcees.ac.cn', address: '北京市海淀区双清路18号', isActive: true, createdAt: '2023-01-01T00:00:00Z', updatedAt: '2023-01-01T00:00:00Z' },
      { id: '3', name: '青岛海洋大学', code: 'OUC001', type: 'university', contactPerson: '赵教授', phone: '0532-12345678', email: 'zhao@ouc.edu.cn', address: '山东省青岛市崂山区松岭路238号', isActive: true, createdAt: '2023-01-01T00:00:00Z', updatedAt: '2023-01-01T00:00:00Z' }
    ];
    setCustomers(mockCustomers);
  };

  // 模拟API调用 - 获取用户列表
  const fetchUsers = async () => {
    const mockUsers: User[] = [
      { id: '1', username: 'admin', name: '张三', email: 'zhang@example.com', role: 'admin', department: '管理部', isActive: true, createdAt: '2023-01-01T00:00:00Z', updatedAt: '2023-01-01T00:00:00Z' },
      { id: '2', username: 'manager1', name: '李四', email: 'li@example.com', role: 'analyst', department: '分析部', isActive: true, createdAt: '2023-01-01T00:00:00Z', updatedAt: '2023-01-01T00:00:00Z' },
      { id: '3', username: 'tech1', name: '王五', email: 'wang@example.com', role: 'technician', department: '实验部', isActive: true, createdAt: '2023-01-01T00:00:00Z', updatedAt: '2023-01-01T00:00:00Z' },
      { id: '4', username: 'analyst1', name: '赵六', email: 'zhao@example.com', role: 'analyst', department: '分析部', isActive: true, createdAt: '2023-01-01T00:00:00Z', updatedAt: '2023-01-01T00:00:00Z' }
    ];
    setUsers(mockUsers);
  };

  // 组件挂载时获取数据
  useEffect(() => {
    fetchProjects();
    fetchCustomers();
    fetchUsers();
  }, []);

  // 项目状态标签颜色映射
  const getStatusColor = (status: ProjectStatus) => {
    const colorMap = {
      planning: 'blue',
      in_progress: 'orange',
      completed: 'green',
      cancelled: 'red',
      on_hold: 'gray'
    };
    return colorMap[status];
  };

  // 项目状态文本映射
  const getStatusText = (status: ProjectStatus) => {
    const textMap = {
      planning: '规划中',
      in_progress: '进行中',
      completed: '已完成',
      cancelled: '已取消',
      on_hold: '暂停'
    };
    return textMap[status];
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

  // 表格列定义
  const columns: ColumnsType<Project> = [
    {
      title: '项目编号',
      dataIndex: 'code',
      key: 'code',
      width: 120,
      fixed: 'left'
    },
    {
      title: '项目名称',
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
      title: '客户',
      dataIndex: 'customerName',
      key: 'customerName',
      width: 150
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: (status: ProjectStatus) => (
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
      title: '项目经理',
      dataIndex: 'managerName',
      key: 'managerName',
      width: 100
    },
    {
      title: '样本数量',
      key: 'sampleProgress',
      width: 120,
      render: (_, record) => (
        <span>
          {record.completedSamples}/{record.sampleCount}
        </span>
      )
    },
    {
      title: '预算/实际',
      key: 'budget',
      width: 120,
      render: (_, record) => (
        <div>
          <div>¥{record.budget?.toLocaleString()}</div>
          <div style={{ color: '#666', fontSize: '12px' }}>
            ¥{record.actualCost?.toLocaleString()}
          </div>
        </div>
      )
    },
    {
      title: '开始日期',
      dataIndex: 'startDate',
      key: 'startDate',
      width: 110,
      render: (date: string) => dayjs(date).format('YYYY-MM-DD')
    },
    {
      title: '结束日期',
      dataIndex: 'endDate',
      key: 'endDate',
      width: 110,
      render: (date: string) => dayjs(date).format('YYYY-MM-DD')
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
      dateRange: [dayjs(project.startDate), dayjs(project.endDate)]
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
        endDate: values.dateRange[1].format('YYYY-MM-DD'),
        estimatedDays: values.dateRange[1].diff(values.dateRange[0], 'day'),
        customerName: customers.find(c => c.id === values.customerId)?.name,
        managerName: users.find(u => u.id === values.managerId)?.name,
        progress: editingProject ? editingProject.progress : 0,
        actualDays: editingProject ? editingProject.actualDays : 0,
        completedSamples: editingProject ? editingProject.completedSamples : 0,
        actualCost: editingProject ? editingProject.actualCost : 0
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

  // 过滤项目数据
  const filteredProjects = projects.filter(project => {
    const matchesSearch = !searchText || 
      project.name.toLowerCase().includes(searchText.toLowerCase()) ||
      project.code.toLowerCase().includes(searchText.toLowerCase()) ||
      project.customerName.toLowerCase().includes(searchText.toLowerCase());
    
    const matchesStatus = !statusFilter || project.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  // 计算统计数据
  const statistics = {
    total: projects.length,
    planning: projects.filter(p => p.status === 'planning').length,
    inProgress: projects.filter(p => p.status === 'in_progress').length,
    completed: projects.filter(p => p.status === 'completed').length,
    totalBudget: projects.reduce((sum, p) => sum + (p.budget || 0), 0),
    totalCost: projects.reduce((sum, p) => sum + (p.actualCost || 0), 0)
  };

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
              title="预算执行率"
              value={statistics.totalBudget > 0 ? (statistics.totalCost / statistics.totalBudget * 100) : 0}
              precision={1}
              suffix="%"
              valueStyle={{ 
                color: statistics.totalCost / statistics.totalBudget > 0.9 ? '#f5222d' : '#52c41a' 
              }}
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
              <Option value="planning">规划中</Option>
              <Option value="in_progress">进行中</Option>
              <Option value="completed">已完成</Option>
              <Option value="cancelled">已取消</Option>
              <Option value="on_hold">暂停</Option>
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
                label="项目名称"
                rules={[{ required: true, message: '请输入项目名称' }]}
              >
                <Input placeholder="请输入项目名称" />
              </Form.Item>
            </Col>
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
                  <Option value="high">高</Option>
                  <Option value="medium">中</Option>
                  <Option value="low">低</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                name="managerId"
                label="项目经理"
                rules={[{ required: true, message: '请选择项目经理' }]}
              >
                <Select placeholder="请选择项目经理">
                  {users.filter(u => u.role === 'admin' || u.role === 'analyst').map(user => (
                    <Option key={user.id} value={user.id}>
                      {user.name}
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
                <Input type="number" placeholder="请输入样本数量" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="dateRange"
                label="项目周期"
                rules={[{ required: true, message: '请选择项目周期' }]}
              >
                <RangePicker style={{ width: '100%' }} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="budget"
                label="项目预算"
                rules={[{ required: true, message: '请输入项目预算' }]}
              >
                <Input type="number" placeholder="请输入项目预算" addonAfter="元" />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            name="teamMembers"
            label="团队成员"
          >
            <Select
              mode="multiple"
              placeholder="请选择团队成员"
              style={{ width: '100%' }}
            >
              {users.map(user => (
                <Option key={user.id} value={user.name}>
                  {user.name} ({user.department})
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item style={{ textAlign: 'right', marginBottom: 0 }}>
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
                  <p><strong>客户：</strong>{selectedProject.customerName}</p>
                  <p><strong>项目经理：</strong>{selectedProject.managerName}</p>
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
                  <p><strong>样本进度：</strong>{selectedProject.completedSamples}/{selectedProject.sampleCount}</p>
                  <p><strong>开始日期：</strong>{dayjs(selectedProject.startDate).format('YYYY-MM-DD')}</p>
                  <p><strong>结束日期：</strong>{dayjs(selectedProject.endDate).format('YYYY-MM-DD')}</p>
                  <p><strong>预计天数：</strong>{selectedProject.estimatedDays}天</p>
                  <p><strong>实际天数：</strong>{selectedProject.actualDays}天</p>
                </Card>
              </Col>
            </Row>
            
            <Divider />
            
            <Row gutter={16}>
              <Col span={12}>
                <Card size="small" title="财务信息">
                  <p><strong>项目预算：</strong>¥{selectedProject.budget?.toLocaleString()}</p>
                  <p><strong>实际成本：</strong>¥{selectedProject.actualCost?.toLocaleString()}</p>
                  <p><strong>预算执行率：</strong>
                    {selectedProject.budget && selectedProject.actualCost ? 
                      `${((selectedProject.actualCost / selectedProject.budget) * 100).toFixed(1)}%` : 
                      '0%'
                    }
                  </p>
                </Card>
              </Col>
              <Col span={12}>
                <Card size="small" title="团队信息">
                  <p><strong>团队成员：</strong></p>
                  <div>
                    {selectedProject.teamMembers?.map((member, index) => (
                      <Tag key={index} icon={<UserOutlined />} style={{ marginBottom: 4 }}>
                        {member}
                      </Tag>
                    ))}
                  </div>
                </Card>
              </Col>
            </Row>
            
            <Divider />
            
            <Card size="small" title="项目描述">
              <p>{selectedProject.description}</p>
            </Card>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default ProjectManagement;