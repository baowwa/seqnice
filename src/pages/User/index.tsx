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
  Tag,
  Popconfirm,
  message,
  Row,
  Col,
  Statistic,
  Tabs,
  Descriptions,
  Tooltip,
  Badge,
  Divider,
  Alert,
  Tree,
  Checkbox,
  Switch,
  Avatar,
  List,
  Typography,
  Transfer,
  Collapse,
  Timeline,
  Progress,
  Radio,
  DatePicker,
  Upload
} from 'antd';
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  EyeOutlined,
  UserOutlined,
  TeamOutlined,
  SafetyOutlined,
  KeyOutlined,
  LockOutlined,
  UnlockOutlined,
  SettingOutlined,
  AuditOutlined,
  CheckCircleOutlined,
  ExclamationCircleOutlined,
  ClockCircleOutlined,
  UserAddOutlined,
  UserDeleteOutlined,
  UserSwitchOutlined,
  CrownOutlined,
  SecurityScanOutlined,
  MailOutlined,
  PhoneOutlined,
  CalendarOutlined,
  EnvironmentOutlined,
  IdcardOutlined,
  BankOutlined,
  GlobalOutlined,
  HistoryOutlined
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import type { User, Role, Permission } from '../../types';
import dayjs from 'dayjs';

const { Option } = Select;
const { TextArea } = Input;
const { TabPane } = Tabs;
const { Panel } = Collapse;
const { Text, Title, Paragraph } = Typography;
const { TreeNode } = Tree;

/**
 * 用户权限管理组件
 * 负责用户管理、角色分配、权限控制等功能
 */
const UserManagement: React.FC = () => {
  // 状态管理
  const [users, setUsers] = useState<User[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [roleModalVisible, setRoleModalVisible] = useState(false);
  const [permissionModalVisible, setPermissionModalVisible] = useState(false);
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [editingRole, setEditingRole] = useState<Role | null>(null);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [form] = Form.useForm();
  const [roleForm] = Form.useForm();
  const [searchText, setSearchText] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [roleFilter, setRoleFilter] = useState<string>('');
  const [activeTab, setActiveTab] = useState('users');

  // 模拟API调用 - 获取用户列表
  const fetchUsers = async () => {
    setLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const mockUsers: User[] = [
        {
          id: '1',
          username: 'admin',
          email: 'admin@seqnice.com',
          fullName: '系统管理员',
          phone: '13800138001',
          avatar: '',
          status: 'active',
          roleId: '1',
          roleName: '超级管理员',
          department: '技术部',
          position: '系统管理员',
          employeeId: 'EMP001',
          hireDate: '2023-01-01',
          lastLoginTime: '2024-02-15T09:30:00Z',
          loginCount: 256,
          isOnline: true,
          permissions: ['user:read', 'user:write', 'user:delete', 'role:read', 'role:write', 'role:delete'],
          preferences: {
            language: 'zh-CN',
            theme: 'light',
            timezone: 'Asia/Shanghai'
          },
          createdAt: '2023-01-01T00:00:00Z',
          updatedAt: '2024-02-15T09:30:00Z'
        },
        {
          id: '2',
          username: 'lisi',
          email: 'lisi@seqnice.com',
          fullName: '李四',
          phone: '13800138002',
          avatar: '',
          status: 'active',
          roleId: '2',
          roleName: '项目经理',
          department: '研发部',
          position: '高级项目经理',
          employeeId: 'EMP002',
          hireDate: '2023-03-15',
          lastLoginTime: '2024-02-14T16:45:00Z',
          loginCount: 189,
          isOnline: false,
          permissions: ['project:read', 'project:write', 'sample:read', 'sample:write', 'report:read'],
          preferences: {
            language: 'zh-CN',
            theme: 'light',
            timezone: 'Asia/Shanghai'
          },
          createdAt: '2023-03-15T00:00:00Z',
          updatedAt: '2024-02-14T16:45:00Z'
        },
        {
          id: '3',
          username: 'wangwu',
          email: 'wangwu@seqnice.com',
          fullName: '王五',
          phone: '13800138003',
          avatar: '',
          status: 'active',
          roleId: '3',
          roleName: '生信分析师',
          department: '生信部',
          position: '高级生信分析师',
          employeeId: 'EMP003',
          hireDate: '2023-06-01',
          lastLoginTime: '2024-02-15T08:20:00Z',
          loginCount: 145,
          isOnline: true,
          permissions: ['analysis:read', 'analysis:write', 'experiment:read', 'report:read', 'report:write'],
          preferences: {
            language: 'zh-CN',
            theme: 'dark',
            timezone: 'Asia/Shanghai'
          },
          createdAt: '2023-06-01T00:00:00Z',
          updatedAt: '2024-02-15T08:20:00Z'
        },
        {
          id: '4',
          username: 'zhaoliu',
          email: 'zhaoliu@seqnice.com',
          fullName: '赵六',
          phone: '13800138004',
          avatar: '',
          status: 'inactive',
          roleId: '4',
          roleName: '实验员',
          department: '实验部',
          position: '实验技术员',
          employeeId: 'EMP004',
          hireDate: '2023-09-10',
          lastLoginTime: '2024-01-20T14:30:00Z',
          loginCount: 67,
          isOnline: false,
          permissions: ['experiment:read', 'experiment:write', 'sample:read'],
          preferences: {
            language: 'zh-CN',
            theme: 'light',
            timezone: 'Asia/Shanghai'
          },
          createdAt: '2023-09-10T00:00:00Z',
          updatedAt: '2024-01-20T14:30:00Z'
        }
      ];
      
      setUsers(mockUsers);
    } catch (error) {
      message.error('获取用户列表失败');
    } finally {
      setLoading(false);
    }
  };

  // 模拟API调用 - 获取角色列表
  const fetchRoles = async () => {
    const mockRoles: Role[] = [
      {
        id: '1',
        name: '超级管理员',
        code: 'super_admin',
        description: '系统超级管理员，拥有所有权限',
        level: 1,
        isSystem: true,
        status: 'active',
        userCount: 1,
        permissions: [
          'user:read', 'user:write', 'user:delete',
          'role:read', 'role:write', 'role:delete',
          'permission:read', 'permission:write', 'permission:delete',
          'project:read', 'project:write', 'project:delete',
          'sample:read', 'sample:write', 'sample:delete',
          'experiment:read', 'experiment:write', 'experiment:delete',
          'analysis:read', 'analysis:write', 'analysis:delete',
          'report:read', 'report:write', 'report:delete',
          'archive:read', 'archive:write', 'archive:delete',
          'system:read', 'system:write', 'system:delete'
        ],
        createdAt: '2023-01-01T00:00:00Z',
        updatedAt: '2023-01-01T00:00:00Z'
      },
      {
        id: '2',
        name: '项目经理',
        code: 'project_manager',
        description: '项目管理人员，负责项目全流程管理',
        level: 2,
        isSystem: false,
        status: 'active',
        userCount: 3,
        permissions: [
          'project:read', 'project:write',
          'sample:read', 'sample:write',
          'experiment:read',
          'analysis:read',
          'report:read', 'report:write',
          'archive:read'
        ],
        createdAt: '2023-01-01T00:00:00Z',
        updatedAt: '2023-01-01T00:00:00Z'
      },
      {
        id: '3',
        name: '生信分析师',
        code: 'bioinformatics_analyst',
        description: '生物信息学分析人员，负责数据分析和报告生成',
        level: 3,
        isSystem: false,
        status: 'active',
        userCount: 5,
        permissions: [
          'analysis:read', 'analysis:write',
          'experiment:read',
          'report:read', 'report:write',
          'archive:read'
        ],
        createdAt: '2023-01-01T00:00:00Z',
        updatedAt: '2023-01-01T00:00:00Z'
      },
      {
        id: '4',
        name: '实验员',
        code: 'lab_technician',
        description: '实验室技术人员，负责样本处理和实验操作',
        level: 4,
        isSystem: false,
        status: 'active',
        userCount: 8,
        permissions: [
          'experiment:read', 'experiment:write',
          'sample:read', 'sample:write',
          'archive:read'
        ],
        createdAt: '2023-01-01T00:00:00Z',
        updatedAt: '2023-01-01T00:00:00Z'
      },
      {
        id: '5',
        name: '访客',
        code: 'guest',
        description: '访客用户，只能查看基本信息',
        level: 5,
        isSystem: false,
        status: 'active',
        userCount: 2,
        permissions: [
          'project:read',
          'sample:read',
          'report:read'
        ],
        createdAt: '2023-01-01T00:00:00Z',
        updatedAt: '2023-01-01T00:00:00Z'
      }
    ];
    
    setRoles(mockRoles);
  };

  // 模拟API调用 - 获取权限列表
  const fetchPermissions = async () => {
    const mockPermissions: Permission[] = [
      // 用户管理权限
      { id: '1', name: '查看用户', code: 'user:read', module: 'user', description: '查看用户列表和详情' },
      { id: '2', name: '创建用户', code: 'user:write', module: 'user', description: '创建和编辑用户信息' },
      { id: '3', name: '删除用户', code: 'user:delete', module: 'user', description: '删除用户账号' },
      
      // 角色管理权限
      { id: '4', name: '查看角色', code: 'role:read', module: 'role', description: '查看角色列表和详情' },
      { id: '5', name: '管理角色', code: 'role:write', module: 'role', description: '创建和编辑角色' },
      { id: '6', name: '删除角色', code: 'role:delete', module: 'role', description: '删除角色' },
      
      // 权限管理权限
      { id: '7', name: '查看权限', code: 'permission:read', module: 'permission', description: '查看权限列表' },
      { id: '8', name: '管理权限', code: 'permission:write', module: 'permission', description: '分配和管理权限' },
      { id: '9', name: '删除权限', code: 'permission:delete', module: 'permission', description: '删除权限配置' },
      
      // 项目管理权限
      { id: '10', name: '查看项目', code: 'project:read', module: 'project', description: '查看项目信息' },
      { id: '11', name: '管理项目', code: 'project:write', module: 'project', description: '创建和编辑项目' },
      { id: '12', name: '删除项目', code: 'project:delete', module: 'project', description: '删除项目' },
      
      // 样本管理权限
      { id: '13', name: '查看样本', code: 'sample:read', module: 'sample', description: '查看样本信息' },
      { id: '14', name: '管理样本', code: 'sample:write', module: 'sample', description: '登记和管理样本' },
      { id: '15', name: '删除样本', code: 'sample:delete', module: 'sample', description: '删除样本记录' },
      
      // 实验管理权限
      { id: '16', name: '查看实验', code: 'experiment:read', module: 'experiment', description: '查看实验流程' },
      { id: '17', name: '管理实验', code: 'experiment:write', module: 'experiment', description: '执行和管理实验' },
      { id: '18', name: '删除实验', code: 'experiment:delete', module: 'experiment', description: '删除实验记录' },
      
      // 分析管理权限
      { id: '19', name: '查看分析', code: 'analysis:read', module: 'analysis', description: '查看分析结果' },
      { id: '20', name: '执行分析', code: 'analysis:write', module: 'analysis', description: '执行生信分析' },
      { id: '21', name: '删除分析', code: 'analysis:delete', module: 'analysis', description: '删除分析任务' },
      
      // 报告管理权限
      { id: '22', name: '查看报告', code: 'report:read', module: 'report', description: '查看分析报告' },
      { id: '23', name: '生成报告', code: 'report:write', module: 'report', description: '生成和编辑报告' },
      { id: '24', name: '删除报告', code: 'report:delete', module: 'report', description: '删除报告文件' },
      
      // 档案管理权限
      { id: '25', name: '查看档案', code: 'archive:read', module: 'archive', description: '查看档案信息' },
      { id: '26', name: '管理档案', code: 'archive:write', module: 'archive', description: '管理基础档案' },
      { id: '27', name: '删除档案', code: 'archive:delete', module: 'archive', description: '删除档案记录' },
      
      // 系统管理权限
      { id: '28', name: '系统设置', code: 'system:read', module: 'system', description: '查看系统设置' },
      { id: '29', name: '系统配置', code: 'system:write', module: 'system', description: '修改系统配置' },
      { id: '30', name: '系统维护', code: 'system:delete', module: 'system', description: '系统维护操作' }
    ];
    
    setPermissions(mockPermissions);
  };

  // 组件挂载时获取数据
  useEffect(() => {
    fetchUsers();
    fetchRoles();
    fetchPermissions();
  }, []);

  // 状态标签颜色映射
  const getStatusColor = (status: string) => {
    const colorMap = {
      active: 'green',
      inactive: 'red',
      pending: 'orange',
      locked: 'gray'
    };
    return colorMap[status as keyof typeof colorMap];
  };

  // 状态文本映射
  const getStatusText = (status: string) => {
    const textMap = {
      active: '正常',
      inactive: '禁用',
      pending: '待激活',
      locked: '锁定'
    };
    return textMap[status as keyof typeof textMap];
  };

  // 用户表格列定义
  const userColumns: ColumnsType<User> = [
    {
      title: '用户信息',
      key: 'userInfo',
      width: 200,
      fixed: 'left',
      render: (_, record) => (
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <Avatar 
            size={40} 
            icon={<UserOutlined />} 
            src={record.avatar}
            style={{ marginRight: 12 }}
          />
          <div>
            <div style={{ fontWeight: 500 }}>
              {record.fullName}
              {record.isOnline && (
                <Badge 
                  status="success" 
                  style={{ marginLeft: 8 }}
                  title="在线"
                />
              )}
            </div>
            <div style={{ fontSize: '12px', color: '#666' }}>
              @{record.username}
            </div>
          </div>
        </div>
      )
    },
    {
      title: '联系方式',
      key: 'contact',
      width: 180,
      render: (_, record) => (
        <div>
          <div style={{ fontSize: '12px' }}>
            <MailOutlined /> {record.email}
          </div>
          <div style={{ fontSize: '12px', marginTop: 4 }}>
            <PhoneOutlined /> {record.phone}
          </div>
        </div>
      )
    },
    {
      title: '角色',
      dataIndex: 'roleName',
      key: 'roleName',
      width: 120,
      render: (roleName: string, record) => (
        <Tag 
          color={record.roleId === '1' ? 'red' : 'blue'}
          icon={record.roleId === '1' ? <CrownOutlined /> : <SecurityScanOutlined />}
        >
          {roleName}
        </Tag>
      )
    },
    {
      title: '部门/职位',
      key: 'department',
      width: 150,
      render: (_, record) => (
        <div>
          <div>{record.department}</div>
          <div style={{ fontSize: '12px', color: '#666' }}>
            {record.position}
          </div>
        </div>
      )
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 80,
      render: (status: string) => (
        <Tag color={getStatusColor(status)}>
          {getStatusText(status)}
        </Tag>
      )
    },
    {
      title: '登录统计',
      key: 'loginStats',
      width: 120,
      render: (_, record) => (
        <div>
          <div style={{ fontSize: '12px' }}>
            登录次数: {record.loginCount}
          </div>
          <div style={{ fontSize: '12px', color: '#666' }}>
            最后登录: {record.lastLoginTime ? dayjs(record.lastLoginTime).format('MM-DD HH:mm') : '从未登录'}
          </div>
        </div>
      )
    },
    {
      title: '入职时间',
      dataIndex: 'hireDate',
      key: 'hireDate',
      width: 100,
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
              onClick={() => handleViewUser(record)}
            />
          </Tooltip>
          <Tooltip title="编辑">
            <Button
              type="text"
              icon={<EditOutlined />}
              onClick={() => handleEditUser(record)}
            />
          </Tooltip>
          <Tooltip title={record.status === 'active' ? '禁用' : '启用'}>
            <Button
              type="text"
              icon={record.status === 'active' ? <LockOutlined /> : <UnlockOutlined />}
              onClick={() => handleToggleUserStatus(record.id, record.status)}
            />
          </Tooltip>
          <Tooltip title="重置密码">
            <Button
              type="text"
              icon={<KeyOutlined />}
              onClick={() => handleResetPassword(record.id)}
            />
          </Tooltip>
          {!record.isSystem && (
            <Popconfirm
              title="确定要删除这个用户吗？"
              onConfirm={() => handleDeleteUser(record.id)}
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
          )}
        </Space>
      )
    }
  ];

  // 角色表格列定义
  const roleColumns: ColumnsType<Role> = [
    {
      title: '角色名称',
      dataIndex: 'name',
      key: 'name',
      width: 150,
      render: (name: string, record) => (
        <div>
          <div style={{ fontWeight: 500 }}>
            {record.isSystem && <CrownOutlined style={{ color: '#faad14', marginRight: 4 }} />}
            {name}
          </div>
          <div style={{ fontSize: '12px', color: '#666' }}>
            {record.code}
          </div>
        </div>
      )
    },
    {
      title: '描述',
      dataIndex: 'description',
      key: 'description',
      ellipsis: true
    },
    {
      title: '级别',
      dataIndex: 'level',
      key: 'level',
      width: 80,
      render: (level: number) => (
        <Tag color="blue">L{level}</Tag>
      )
    },
    {
      title: '用户数量',
      dataIndex: 'userCount',
      key: 'userCount',
      width: 100,
      render: (count: number) => (
        <Badge count={count} showZero color="#52c41a" />
      )
    },
    {
      title: '权限数量',
      key: 'permissionCount',
      width: 100,
      render: (_, record) => (
        <Badge count={record.permissions.length} showZero color="#1890ff" />
      )
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 80,
      render: (status: string) => (
        <Tag color={getStatusColor(status)}>
          {getStatusText(status)}
        </Tag>
      )
    },
    {
      title: '创建时间',
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: 110,
      render: (time: string) => dayjs(time).format('YYYY-MM-DD')
    },
    {
      title: '操作',
      key: 'action',
      width: 150,
      render: (_, record) => (
        <Space size="small">
          <Tooltip title="编辑">
            <Button
              type="text"
              icon={<EditOutlined />}
              onClick={() => handleEditRole(record)}
            />
          </Tooltip>
          <Tooltip title="权限配置">
            <Button
              type="text"
              icon={<SafetyOutlined />}
              onClick={() => handleConfigPermissions(record)}
            />
          </Tooltip>
          {!record.isSystem && (
            <Popconfirm
              title="确定要删除这个角色吗？"
              onConfirm={() => handleDeleteRole(record.id)}
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
          )}
        </Space>
      )
    }
  ];

  // 处理新增用户
  const handleAddUser = () => {
    setEditingUser(null);
    form.resetFields();
    setModalVisible(true);
  };

  // 处理编辑用户
  const handleEditUser = (user: User) => {
    setEditingUser(user);
    form.setFieldsValue({
      ...user,
      hireDate: user.hireDate ? dayjs(user.hireDate) : null
    });
    setModalVisible(true);
  };

  // 处理查看用户详情
  const handleViewUser = (user: User) => {
    setSelectedUser(user);
    setDetailModalVisible(true);
  };

  // 处理切换用户状态
  const handleToggleUserStatus = async (id: string, currentStatus: string) => {
    try {
      const newStatus = currentStatus === 'active' ? 'inactive' : 'active';
      setUsers(users.map(u => 
        u.id === id ? { ...u, status: newStatus, updatedAt: new Date().toISOString() } : u
      ));
      message.success(`用户已${newStatus === 'active' ? '启用' : '禁用'}`);
    } catch (error) {
      message.error('操作失败');
    }
  };

  // 处理重置密码
  const handleResetPassword = async (id: string) => {
    try {
      await new Promise(resolve => setTimeout(resolve, 500));
      message.success('密码重置成功，新密码已发送到用户邮箱');
    } catch (error) {
      message.error('密码重置失败');
    }
  };

  // 处理删除用户
  const handleDeleteUser = async (id: string) => {
    try {
      await new Promise(resolve => setTimeout(resolve, 500));
      setUsers(users.filter(u => u.id !== id));
      message.success('用户删除成功');
    } catch (error) {
      message.error('删除用户失败');
    }
  };

  // 处理新增角色
  const handleAddRole = () => {
    setEditingRole(null);
    roleForm.resetFields();
    setRoleModalVisible(true);
  };

  // 处理编辑角色
  const handleEditRole = (role: Role) => {
    setEditingRole(role);
    roleForm.setFieldsValue(role);
    setRoleModalVisible(true);
  };

  // 处理配置权限
  const handleConfigPermissions = (role: Role) => {
    setEditingRole(role);
    setPermissionModalVisible(true);
  };

  // 处理删除角色
  const handleDeleteRole = async (id: string) => {
    try {
      await new Promise(resolve => setTimeout(resolve, 500));
      setRoles(roles.filter(r => r.id !== id));
      message.success('角色删除成功');
    } catch (error) {
      message.error('删除角色失败');
    }
  };

  // 处理用户表单提交
  const handleUserSubmit = async (values: any) => {
    try {
      setLoading(true);
      
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const userData = {
        ...values,
        hireDate: values.hireDate ? values.hireDate.format('YYYY-MM-DD') : null,
        roleName: roles.find(r => r.id === values.roleId)?.name || '',
        loginCount: 0,
        isOnline: false,
        permissions: roles.find(r => r.id === values.roleId)?.permissions || []
      };

      if (editingUser) {
        // 更新用户
        const updatedUser = {
          ...editingUser,
          ...userData,
          updatedAt: new Date().toISOString()
        };
        setUsers(users.map(u => u.id === editingUser.id ? updatedUser : u));
        message.success('用户更新成功');
      } else {
        // 新增用户
        const newUser: User = {
          id: Date.now().toString(),
          ...userData,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
        setUsers([...users, newUser]);
        message.success('用户创建成功');
      }

      setModalVisible(false);
      form.resetFields();
    } catch (error) {
      message.error('操作失败');
    } finally {
      setLoading(false);
    }
  };

  // 处理角色表单提交
  const handleRoleSubmit = async (values: any) => {
    try {
      setLoading(true);
      
      await new Promise(resolve => setTimeout(resolve, 1000));

      if (editingRole) {
        // 更新角色
        const updatedRole = {
          ...editingRole,
          ...values,
          updatedAt: new Date().toISOString()
        };
        setRoles(roles.map(r => r.id === editingRole.id ? updatedRole : r));
        message.success('角色更新成功');
      } else {
        // 新增角色
        const newRole: Role = {
          id: Date.now().toString(),
          ...values,
          userCount: 0,
          permissions: [],
          isSystem: false,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
        setRoles([...roles, newRole]);
        message.success('角色创建成功');
      }

      setRoleModalVisible(false);
      roleForm.resetFields();
    } catch (error) {
      message.error('操作失败');
    } finally {
      setLoading(false);
    }
  };

  // 过滤用户数据
  const filteredUsers = users.filter(user => {
    const matchesSearch = !searchText || 
      user.fullName.toLowerCase().includes(searchText.toLowerCase()) ||
      user.username.toLowerCase().includes(searchText.toLowerCase()) ||
      user.email.toLowerCase().includes(searchText.toLowerCase());
    
    const matchesStatus = !statusFilter || user.status === statusFilter;
    const matchesRole = !roleFilter || user.roleId === roleFilter;
    
    return matchesSearch && matchesStatus && matchesRole;
  });

  // 计算统计数据
  const statistics = {
    totalUsers: users.length,
    activeUsers: users.filter(u => u.status === 'active').length,
    onlineUsers: users.filter(u => u.isOnline).length,
    totalRoles: roles.length,
    totalPermissions: permissions.length
  };

  // 权限树数据
  const permissionTreeData = permissions.reduce((acc, permission) => {
    const moduleIndex = acc.findIndex(item => item.key === permission.module);
    if (moduleIndex === -1) {
      acc.push({
        title: permission.module,
        key: permission.module,
        children: [{
          title: permission.name,
          key: permission.code,
          description: permission.description
        }]
      });
    } else {
      acc[moduleIndex].children.push({
        title: permission.name,
        key: permission.code,
        description: permission.description
      });
    }
    return acc;
  }, [] as any[]);

  return (
    <div>
      {/* 统计卡片 */}
      <Row gutter={16} style={{ marginBottom: 16 }}>
        <Col span={6}>
          <Card>
            <Statistic
              title="用户总数"
              value={statistics.totalUsers}
              prefix={<UserOutlined />}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="活跃用户"
              value={statistics.activeUsers}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="在线用户"
              value={statistics.onlineUsers}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="角色数量"
              value={statistics.totalRoles}
              prefix={<TeamOutlined />}
            />
          </Card>
        </Col>
      </Row>

      {/* 主要内容 */}
      <Card>
        <Tabs activeKey={activeTab} onChange={setActiveTab}>
          <TabPane tab="用户管理" key="users">
            <div style={{ marginBottom: 16 }}>
              <Space>
                <Input.Search
                  placeholder="搜索用户名、姓名或邮箱"
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
                  <Option value="active">正常</Option>
                  <Option value="inactive">禁用</Option>
                  <Option value="pending">待激活</Option>
                  <Option value="locked">锁定</Option>
                </Select>
                <Select
                  placeholder="筛选角色"
                  value={roleFilter}
                  onChange={setRoleFilter}
                  style={{ width: 150 }}
                  allowClear
                >
                  {roles.map(role => (
                    <Option key={role.id} value={role.id}>
                      {role.name}
                    </Option>
                  ))}
                </Select>
                <Button
                  type="primary"
                  icon={<UserAddOutlined />}
                  onClick={handleAddUser}
                >
                  新增用户
                </Button>
              </Space>
            </div>

            <Table
              columns={userColumns}
              dataSource={filteredUsers}
              rowKey="id"
              loading={loading}
              scroll={{ x: 1400 }}
              pagination={{
                total: filteredUsers.length,
                pageSize: 10,
                showSizeChanger: true,
                showQuickJumper: true,
                showTotal: (total) => `共 ${total} 条记录`
              }}
            />
          </TabPane>

          <TabPane tab="角色管理" key="roles">
            <div style={{ marginBottom: 16 }}>
              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={handleAddRole}
              >
                新增角色
              </Button>
            </div>

            <Table
              columns={roleColumns}
              dataSource={roles}
              rowKey="id"
              loading={loading}
              pagination={{
                total: roles.length,
                pageSize: 10,
                showSizeChanger: true,
                showQuickJumper: true,
                showTotal: (total) => `共 ${total} 条记录`
              }}
            />
          </TabPane>

          <TabPane tab="权限管理" key="permissions">
            <Alert
              message="权限管理"
              description="系统权限按模块分组管理，支持细粒度的权限控制"
              type="info"
              showIcon
              style={{ marginBottom: 16 }}
            />
            
            <Collapse defaultActiveKey={['user', 'project', 'sample']}>
              {Object.entries(
                permissions.reduce((acc, permission) => {
                  if (!acc[permission.module]) {
                    acc[permission.module] = [];
                  }
                  acc[permission.module].push(permission);
                  return acc;
                }, {} as Record<string, Permission[]>)
              ).map(([module, modulePermissions]) => (
                <Panel 
                  header={
                    <div>
                      <strong>{module.toUpperCase()}模块</strong>
                      <Badge 
                        count={modulePermissions.length} 
                        style={{ marginLeft: 8 }}
                        color="#1890ff"
                      />
                    </div>
                  } 
                  key={module}
                >
                  <List
                    dataSource={modulePermissions}
                    renderItem={(permission) => (
                      <List.Item>
                        <List.Item.Meta
                          avatar={<SafetyOutlined style={{ color: '#1890ff' }} />}
                          title={
                            <div>
                              <strong>{permission.name}</strong>
                              <Tag style={{ marginLeft: 8 }} color="blue">
                                {permission.code}
                              </Tag>
                            </div>
                          }
                          description={permission.description}
                        />
                      </List.Item>
                    )}
                  />
                </Panel>
              ))}
            </Collapse>
          </TabPane>

          <TabPane tab="操作日志" key="logs">
            <Alert
              message="操作日志"
              description="记录用户权限相关的所有操作，便于审计和追踪"
              type="info"
              showIcon
              style={{ marginBottom: 16 }}
            />
            
            <Timeline>
              <Timeline.Item color="green">
                <div>
                  <strong>2024-02-15 09:30</strong> - 管理员 创建了用户 "张三"
                </div>
                <div style={{ color: '#666', fontSize: '12px' }}>
                  操作IP: 192.168.1.100
                </div>
              </Timeline.Item>
              <Timeline.Item color="blue">
                <div>
                  <strong>2024-02-14 16:45</strong> - 李四 修改了角色 "项目经理" 的权限
                </div>
                <div style={{ color: '#666', fontSize: '12px' }}>
                  操作IP: 192.168.1.101
                </div>
              </Timeline.Item>
              <Timeline.Item color="orange">
                <div>
                  <strong>2024-02-14 14:20</strong> - 管理员 禁用了用户 "赵六"
                </div>
                <div style={{ color: '#666', fontSize: '12px' }}>
                  操作IP: 192.168.1.100
                </div>
              </Timeline.Item>
              <Timeline.Item color="red">
                <div>
                  <strong>2024-02-13 11:15</strong> - 系统 检测到用户 "王五" 异常登录
                </div>
                <div style={{ color: '#666', fontSize: '12px' }}>
                  登录IP: 203.0.113.1 (异地登录)
                </div>
              </Timeline.Item>
            </Timeline>
          </TabPane>
        </Tabs>
      </Card>

      {/* 新增/编辑用户模态框 */}
      <Modal
        title={editingUser ? '编辑用户' : '新增用户'}
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
          onFinish={handleUserSubmit}
        >
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="username"
                label="用户名"
                rules={[
                  { required: true, message: '请输入用户名' },
                  { pattern: /^[a-zA-Z0-9_]{3,20}$/, message: '用户名只能包含字母、数字和下划线，长度3-20位' }
                ]}
              >
                <Input placeholder="请输入用户名" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="fullName"
                label="姓名"
                rules={[{ required: true, message: '请输入姓名' }]}
              >
                <Input placeholder="请输入姓名" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="email"
                label="邮箱"
                rules={[
                  { required: true, message: '请输入邮箱' },
                  { type: 'email', message: '请输入有效的邮箱地址' }
                ]}
              >
                <Input placeholder="请输入邮箱" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="phone"
                label="手机号"
                rules={[
                  { required: true, message: '请输入手机号' },
                  { pattern: /^1[3-9]\d{9}$/, message: '请输入有效的手机号' }
                ]}
              >
                <Input placeholder="请输入手机号" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={8}>
              <Form.Item
                name="roleId"
                label="角色"
                rules={[{ required: true, message: '请选择角色' }]}
              >
                <Select placeholder="请选择角色">
                  {roles.map(role => (
                    <Option key={role.id} value={role.id}>
                      {role.isSystem && <CrownOutlined style={{ marginRight: 4 }} />}
                      {role.name}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                name="department"
                label="部门"
                rules={[{ required: true, message: '请输入部门' }]}
              >
                <Input placeholder="请输入部门" />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                name="position"
                label="职位"
                rules={[{ required: true, message: '请输入职位' }]}
              >
                <Input placeholder="请输入职位" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={8}>
              <Form.Item
                name="employeeId"
                label="工号"
                rules={[{ required: true, message: '请输入工号' }]}
              >
                <Input placeholder="请输入工号" />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                name="hireDate"
                label="入职日期"
                rules={[{ required: true, message: '请选择入职日期' }]}
              >
                <DatePicker 
                  style={{ width: '100%' }} 
                  placeholder="请选择入职日期"
                />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                name="status"
                label="状态"
                rules={[{ required: true, message: '请选择状态' }]}
              >
                <Select placeholder="请选择状态">
                  <Option value="active">正常</Option>
                  <Option value="inactive">禁用</Option>
                  <Option value="pending">待激活</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>

          {!editingUser && (
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  name="password"
                  label="密码"
                  rules={[
                    { required: true, message: '请输入密码' },
                    { min: 6, message: '密码至少6位' }
                  ]}
                >
                  <Input.Password placeholder="请输入密码" />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  name="confirmPassword"
                  label="确认密码"
                  dependencies={['password']}
                  rules={[
                    { required: true, message: '请确认密码' },
                    ({ getFieldValue }) => ({
                      validator(_, value) {
                        if (!value || getFieldValue('password') === value) {
                          return Promise.resolve();
                        }
                        return Promise.reject(new Error('两次输入的密码不一致'));
                      },
                    }),
                  ]}
                >
                  <Input.Password placeholder="请确认密码" />
                </Form.Item>
              </Col>
            </Row>
          )}

          <Form.Item style={{ textAlign: 'right', marginBottom: 0 }}>
            <Space>
              <Button onClick={() => setModalVisible(false)}>
                取消
              </Button>
              <Button type="primary" htmlType="submit" loading={loading}>
                {editingUser ? '更新' : '创建'}
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>

      {/* 新增/编辑角色模态框 */}
      <Modal
        title={editingRole ? '编辑角色' : '新增角色'}
        open={roleModalVisible}
        onCancel={() => {
          setRoleModalVisible(false);
          roleForm.resetFields();
        }}
        footer={null}
        width={600}
      >
        <Form
          form={roleForm}
          layout="vertical"
          onFinish={handleRoleSubmit}
        >
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="name"
                label="角色名称"
                rules={[{ required: true, message: '请输入角色名称' }]}
              >
                <Input placeholder="请输入角色名称" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="code"
                label="角色代码"
                rules={[
                  { required: true, message: '请输入角色代码' },
                  { pattern: /^[a-z_]+$/, message: '角色代码只能包含小写字母和下划线' }
                ]}
              >
                <Input placeholder="请输入角色代码" />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            name="description"
            label="角色描述"
            rules={[{ required: true, message: '请输入角色描述' }]}
          >
            <TextArea rows={3} placeholder="请输入角色描述" />
          </Form.Item>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="level"
                label="角色级别"
                rules={[{ required: true, message: '请选择角色级别' }]}
              >
                <Select placeholder="请选择角色级别">
                  <Option value={1}>L1 - 超级管理员</Option>
                  <Option value={2}>L2 - 管理员</Option>
                  <Option value={3}>L3 - 高级用户</Option>
                  <Option value={4}>L4 - 普通用户</Option>
                  <Option value={5}>L5 - 访客</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="status"
                label="状态"
                rules={[{ required: true, message: '请选择状态' }]}
              >
                <Select placeholder="请选择状态">
                  <Option value="active">正常</Option>
                  <Option value="inactive">禁用</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Form.Item style={{ textAlign: 'right', marginBottom: 0 }}>
            <Space>
              <Button onClick={() => setRoleModalVisible(false)}>
                取消
              </Button>
              <Button type="primary" htmlType="submit" loading={loading}>
                {editingRole ? '更新' : '创建'}
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>

      {/* 权限配置模态框 */}
      <Modal
        title={`配置角色权限: ${editingRole?.name}`}
        open={permissionModalVisible}
        onCancel={() => setPermissionModalVisible(false)}
        footer={[
          <Button key="cancel" onClick={() => setPermissionModalVisible(false)}>
            取消
          </Button>,
          <Button key="save" type="primary">
            保存权限
          </Button>
        ]}
        width={800}
      >
        {editingRole && (
          <div>
            <Alert
              message="权限配置"
              description={`为角色 "${editingRole.name}" 配置系统权限，请谨慎操作`}
              type="info"
              showIcon
              style={{ marginBottom: 16 }}
            />
            
            <Tree
              checkable
              defaultExpandAll
              defaultCheckedKeys={editingRole.permissions}
              treeData={permissionTreeData}
              titleRender={(nodeData) => (
                <div>
                  <span>{nodeData.title}</span>
                  {nodeData.description && (
                    <div style={{ fontSize: '12px', color: '#666' }}>
                      {nodeData.description}
                    </div>
                  )}
                </div>
              )}
            />
          </div>
        )}
      </Modal>

      {/* 用户详情模态框 */}
      <Modal
        title="用户详情"
        open={detailModalVisible}
        onCancel={() => setDetailModalVisible(false)}
        footer={[
          <Button key="close" onClick={() => setDetailModalVisible(false)}>
            关闭
          </Button>
        ]}
        width={800}
      >
        {selectedUser && (
          <div>
            <Descriptions bordered column={2}>
              <Descriptions.Item label="用户名">{selectedUser.username}</Descriptions.Item>
              <Descriptions.Item label="姓名">{selectedUser.fullName}</Descriptions.Item>
              <Descriptions.Item label="邮箱">{selectedUser.email}</Descriptions.Item>
              <Descriptions.Item label="手机号">{selectedUser.phone}</Descriptions.Item>
              <Descriptions.Item label="角色">
                <Tag 
                  color={selectedUser.roleId === '1' ? 'red' : 'blue'}
                  icon={selectedUser.roleId === '1' ? <CrownOutlined /> : <SecurityScanOutlined />}
                >
                  {selectedUser.roleName}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="状态">
                <Tag color={getStatusColor(selectedUser.status)}>
                  {getStatusText(selectedUser.status)}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="部门">{selectedUser.department}</Descriptions.Item>
              <Descriptions.Item label="职位">{selectedUser.position}</Descriptions.Item>
              <Descriptions.Item label="工号">{selectedUser.employeeId}</Descriptions.Item>
              <Descriptions.Item label="入职日期">{selectedUser.hireDate}</Descriptions.Item>
              <Descriptions.Item label="登录次数">{selectedUser.loginCount}</Descriptions.Item>
              <Descriptions.Item label="在线状态">
                {selectedUser.isOnline ? (
                  <Badge status="success" text="在线" />
                ) : (
                  <Badge status="default" text="离线" />
                )}
              </Descriptions.Item>
            </Descriptions>

            <Divider />
            <Title level={5}>最后登录时间</Title>
            <Text>
              {selectedUser.lastLoginTime 
                ? dayjs(selectedUser.lastLoginTime).format('YYYY-MM-DD HH:mm:ss')
                : '从未登录'
              }
            </Text>

            <Divider />
            <Title level={5}>用户权限</Title>
            <Space wrap>
              {selectedUser.permissions.map((permission, index) => (
                <Tag key={index} color="blue">
                  {permission}
                </Tag>
              ))}
            </Space>

            <Divider />
            <Title level={5}>偏好设置</Title>
            <Descriptions size="small" column={1}>
              <Descriptions.Item label="语言">
                {selectedUser.preferences?.language || 'zh-CN'}
              </Descriptions.Item>
              <Descriptions.Item label="主题">
                {selectedUser.preferences?.theme || 'light'}
              </Descriptions.Item>
              <Descriptions.Item label="时区">
                {selectedUser.preferences?.timezone || 'Asia/Shanghai'}
              </Descriptions.Item>
            </Descriptions>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default UserManagement;