import React, { useState, useEffect } from 'react'
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
  Typography,
  Tooltip,
  Avatar,
  Badge
} from 'antd'
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  SearchOutlined,
  ExportOutlined,
  TeamOutlined,
  UserOutlined,
  ExperimentOutlined
} from '@ant-design/icons'
import type { ColumnsType } from 'antd/es/table'
import { useAppStore } from '../../store'

const { Option } = Select
const { TextArea } = Input
const { Title } = Typography

/**
 * 实验小组成员接口
 */
interface GroupMember {
  id: string
  name: string
  role: 'leader' | 'member' | 'intern'
  title: string
  phone: string
  email: string
}

/**
 * 实验小组信息接口
 */
interface ExperimentGroup {
  id: string
  name: string
  code: string
  type: 'molecular' | 'microbiology' | 'biochemistry' | 'pathology' | 'research'
  departmentId: string
  departmentName: string
  laboratoryId: string
  laboratoryName: string
  leader: string
  leaderId: string
  members: GroupMember[]
  memberCount: number
  specialties: string[]
  equipment: string[]
  projects: string[]
  status: 'active' | 'inactive' | 'disbanded'
  description?: string
  createdAt: string
  updatedAt: string
}

/**
 * 实验小组管理页面组件
 * 提供实验小组信息的增删改查功能
 */
const ExperimentGroupManagement: React.FC = () => {
  const { setBreadcrumbs } = useAppStore()
  const [groups, setGroups] = useState<ExperimentGroup[]>([])
  const [loading, setLoading] = useState(false)
  const [modalVisible, setModalVisible] = useState(false)
  const [editingGroup, setEditingGroup] = useState<ExperimentGroup | null>(null)
  const [searchText, setSearchText] = useState('')
  const [typeFilter, setTypeFilter] = useState<string>('')
  const [statusFilter, setStatusFilter] = useState<string>('')
  const [form] = Form.useForm()

  useEffect(() => {
    setBreadcrumbs([
      { title: '首页' }, 
      { title: '基础档案' }, 
      { title: '实验小组' }
    ])
    loadGroups()
  }, [setBreadcrumbs])

  /**
   * 加载实验小组列表数据
   */
  const loadGroups = async () => {
    setLoading(true)
    try {
      // 模拟API调用
      await new Promise(resolve => setTimeout(resolve, 800))
      
      const mockGroups: ExperimentGroup[] = [
        {
          id: '1',
          name: '分子诊断小组',
          code: 'GROUP001',
          type: 'molecular',
          departmentId: '2',
          departmentName: '分子诊断室',
          laboratoryId: '1',
          laboratoryName: '分子生物学实验室',
          leader: '张医生',
          leaderId: 'user001',
          members: [
            {
              id: 'user001',
              name: '张医生',
              role: 'leader',
              title: '主任医师',
              phone: '13800138001',
              email: 'zhang@seqnice.com'
            },
            {
              id: 'user002',
              name: '李技师',
              role: 'member',
              title: '主管技师',
              phone: '13800138002',
              email: 'li@seqnice.com'
            },
            {
              id: 'user003',
              name: '王技师',
              role: 'member',
              title: '技师',
              phone: '13800138003',
              email: 'wang@seqnice.com'
            },
            {
              id: 'user004',
              name: '赵实习生',
              role: 'intern',
              title: '实习生',
              phone: '13800138004',
              email: 'zhao@seqnice.com'
            }
          ],
          memberCount: 4,
          specialties: ['PCR检测', '基因测序', '突变分析', '病原体检测'],
          equipment: ['实时荧光PCR仪', '基因测序仪', '电泳仪', '核酸提取仪'],
          projects: ['结核分枝杆菌耐药基因检测', 'HPV基因分型', '肿瘤基因突变检测'],
          status: 'active',
          description: '专门从事分子诊断技术的实验小组，具备丰富的PCR和测序经验',
          createdAt: '2024-01-15T09:00:00Z',
          updatedAt: '2024-02-20T14:30:00Z'
        },
        {
          id: '2',
          name: '微生物检测小组',
          code: 'GROUP002',
          type: 'microbiology',
          departmentId: '3',
          departmentName: '微生物室',
          laboratoryId: '2',
          laboratoryName: '微生物实验室',
          leader: '李主管',
          leaderId: 'user005',
          members: [
            {
              id: 'user005',
              name: '李主管',
              role: 'leader',
              title: '主管技师',
              phone: '13800138005',
              email: 'li.manager@seqnice.com'
            },
            {
              id: 'user006',
              name: '陈技师',
              role: 'member',
              title: '技师',
              phone: '13800138006',
              email: 'chen@seqnice.com'
            },
            {
              id: 'user007',
              name: '刘技师',
              role: 'member',
              title: '技师',
              phone: '13800138007',
              email: 'liu@seqnice.com'
            }
          ],
          memberCount: 3,
          specialties: ['细菌培养', '药敏试验', '真菌检测', '厌氧菌培养'],
          equipment: ['培养箱', '厌氧培养系统', '药敏分析仪', '显微镜'],
          projects: ['血培养检测', '尿培养检测', '痰培养检测', '药敏试验'],
          status: 'active',
          description: '负责各类临床标本的微生物培养和药敏试验',
          createdAt: '2024-01-10T10:00:00Z',
          updatedAt: '2024-02-18T11:20:00Z'
        },
        {
          id: '3',
          name: '生化检测小组',
          code: 'GROUP003',
          type: 'biochemistry',
          departmentId: '1',
          departmentName: '检验科',
          laboratoryId: '3',
          laboratoryName: '生化分析实验室',
          leader: '王主任',
          leaderId: 'user008',
          members: [
            {
              id: 'user008',
              name: '王主任',
              role: 'leader',
              title: '副主任医师',
              phone: '13800138008',
              email: 'wang.director@seqnice.com'
            },
            {
              id: 'user009',
              name: '周技师',
              role: 'member',
              title: '主管技师',
              phone: '13800138009',
              email: 'zhou@seqnice.com'
            },
            {
              id: 'user010',
              name: '吴技师',
              role: 'member',
              title: '技师',
              phone: '13800138010',
              email: 'wu@seqnice.com'
            },
            {
              id: 'user011',
              name: '孙技师',
              role: 'member',
              title: '技师',
              phone: '13800138011',
              email: 'sun@seqnice.com'
            },
            {
              id: 'user012',
              name: '马实习生',
              role: 'intern',
              title: '实习生',
              phone: '13800138012',
              email: 'ma@seqnice.com'
            }
          ],
          memberCount: 5,
          specialties: ['生化分析', '免疫检测', '酶学检测', '电解质分析'],
          equipment: ['全自动生化分析仪', '化学发光免疫分析仪', '电解质分析仪', '血气分析仪'],
          projects: ['肝功能检测', '肾功能检测', '血脂检测', '心肌酶检测'],
          status: 'active',
          description: '负责临床生化和免疫检测项目',
          createdAt: '2024-01-05T08:30:00Z',
          updatedAt: '2024-02-15T16:45:00Z'
        },
        {
          id: '4',
          name: '病理诊断小组',
          code: 'GROUP004',
          type: 'pathology',
          departmentId: '1',
          departmentName: '检验科',
          laboratoryId: '4',
          laboratoryName: '病理诊断实验室',
          leader: '赵教授',
          leaderId: 'user013',
          members: [
            {
              id: 'user013',
              name: '赵教授',
              role: 'leader',
              title: '主任医师',
              phone: '13800138013',
              email: 'zhao.prof@seqnice.com'
            },
            {
              id: 'user014',
              name: '钱医生',
              role: 'member',
              title: '副主任医师',
              phone: '13800138014',
              email: 'qian@seqnice.com'
            }
          ],
          memberCount: 2,
          specialties: ['组织病理学', '细胞病理学', '免疫组化', '分子病理'],
          equipment: ['切片机', '染色机', '显微镜', '图像分析系统'],
          projects: ['肿瘤病理诊断', '活检病理诊断', '细胞学检查'],
          status: 'inactive',
          description: '专门从事病理诊断工作的小组，目前因设备维护暂停工作',
          createdAt: '2023-12-20T14:00:00Z',
          updatedAt: '2024-02-25T09:15:00Z'
        },
        {
          id: '5',
          name: '科研创新小组',
          code: 'GROUP005',
          type: 'research',
          departmentId: '7',
          departmentName: '科研部',
          laboratoryId: '1',
          laboratoryName: '分子生物学实验室',
          leader: '吴教授',
          leaderId: 'user015',
          members: [
            {
              id: 'user015',
              name: '吴教授',
              role: 'leader',
              title: '教授',
              phone: '13800138015',
              email: 'wu.prof@seqnice.com'
            },
            {
              id: 'user016',
              name: '郑博士',
              role: 'member',
              title: '副研究员',
              phone: '13800138016',
              email: 'zheng@seqnice.com'
            },
            {
              id: 'user017',
              name: '冯硕士',
              role: 'member',
              title: '助理研究员',
              phone: '13800138017',
              email: 'feng@seqnice.com'
            }
          ],
          memberCount: 3,
          specialties: ['新技术研发', '方法学验证', '科研项目管理', '学术论文撰写'],
          equipment: ['高通量测序仪', '质谱仪', '流式细胞仪', '共聚焦显微镜'],
          projects: ['液体活检技术研发', '多重PCR方法开发', '生物标志物筛选'],
          status: 'active',
          description: '致力于检验医学新技术研发和创新的科研小组',
          createdAt: '2023-10-15T11:00:00Z',
          updatedAt: '2024-02-10T13:30:00Z'
        }
      ]
      
      setGroups(mockGroups)
    } catch (error) {
      message.error('获取实验小组列表失败')
    } finally {
      setLoading(false)
    }
  }

  /**
   * 打开新增/编辑模态框
   */
  const openModal = (group?: ExperimentGroup) => {
    setEditingGroup(group || null)
    if (group) {
      form.setFieldsValue({
        ...group,
        memberIds: group.members.map(m => m.id)
      })
    } else {
      form.resetFields()
    }
    setModalVisible(true)
  }

  /**
   * 关闭模态框
   */
  const closeModal = () => {
    setModalVisible(false)
    setEditingGroup(null)
    form.resetFields()
  }

  /**
   * 保存实验小组信息
   */
  const saveGroup = async (values: any) => {
    try {
      setLoading(true)
      
      // 模拟API调用
      await new Promise(resolve => setTimeout(resolve, 1000))

      if (editingGroup) {
        // 更新实验小组
        const updatedGroup = {
          ...editingGroup,
          ...values,
          memberCount: values.members?.length || 0,
          updatedAt: new Date().toISOString()
        }
        setGroups(groups.map(g => g.id === editingGroup.id ? updatedGroup : g))
        message.success('实验小组信息更新成功')
      } else {
        // 新增实验小组
        const newGroup: ExperimentGroup = {
          id: Date.now().toString(),
          ...values,
          memberCount: values.members?.length || 0,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }
        setGroups([...groups, newGroup])
        message.success('实验小组添加成功')
      }

      closeModal()
    } catch (error) {
      message.error('操作失败')
    } finally {
      setLoading(false)
    }
  }

  /**
   * 删除实验小组
   */
  const deleteGroup = async (id: string) => {
    try {
      setLoading(true)
      
      // 模拟API调用
      await new Promise(resolve => setTimeout(resolve, 500))
      
      setGroups(groups.filter(g => g.id !== id))
      message.success('实验小组删除成功')
    } catch (error) {
      message.error('删除失败')
    } finally {
      setLoading(false)
    }
  }

  /**
   * 获取小组类型标签颜色
   */
  const getTypeColor = (type: ExperimentGroup['type']) => {
    const colorMap = {
      molecular: 'blue',
      microbiology: 'green',
      biochemistry: 'orange',
      pathology: 'purple',
      research: 'red'
    }
    return colorMap[type]
  }

  /**
   * 获取小组类型文本
   */
  const getTypeText = (type: ExperimentGroup['type']) => {
    const textMap = {
      molecular: '分子诊断',
      microbiology: '微生物检测',
      biochemistry: '生化检测',
      pathology: '病理诊断',
      research: '科研创新'
    }
    return textMap[type]
  }

  /**
   * 获取状态标签颜色
   */
  const getStatusColor = (status: ExperimentGroup['status']) => {
    const colorMap = {
      active: 'green',
      inactive: 'orange',
      disbanded: 'red'
    }
    return colorMap[status]
  }

  /**
   * 获取状态文本
   */
  const getStatusText = (status: ExperimentGroup['status']) => {
    const textMap = {
      active: '活跃',
      inactive: '暂停',
      disbanded: '解散'
    }
    return textMap[status]
  }

  /**
   * 获取角色标签颜色
   */
  const getRoleColor = (role: GroupMember['role']) => {
    const colorMap = {
      leader: 'red',
      member: 'blue',
      intern: 'green'
    }
    return colorMap[role]
  }

  /**
   * 获取角色文本
   */
  const getRoleText = (role: GroupMember['role']) => {
    const textMap = {
      leader: '组长',
      member: '成员',
      intern: '实习生'
    }
    return textMap[role]
  }

  /**
   * 过滤实验小组列表
   */
  const filteredGroups = groups.filter(group => {
    const matchesSearch = !searchText || 
      group.name.toLowerCase().includes(searchText.toLowerCase()) ||
      group.code.toLowerCase().includes(searchText.toLowerCase()) ||
      group.leader.toLowerCase().includes(searchText.toLowerCase()) ||
      group.departmentName.toLowerCase().includes(searchText.toLowerCase())
    
    const matchesType = !typeFilter || group.type === typeFilter
    const matchesStatus = !statusFilter || group.status === statusFilter
    
    return matchesSearch && matchesType && matchesStatus
  })

  /**
   * 表格列定义
   */
  const columns: ColumnsType<ExperimentGroup> = [
    {
      title: '小组编码',
      dataIndex: 'code',
      key: 'code',
      width: 100,
      fixed: 'left'
    },
    {
      title: '小组名称',
      dataIndex: 'name',
      key: 'name',
      width: 150,
      fixed: 'left',
      render: (name: string, record: ExperimentGroup) => (
        <Space>
          <ExperimentOutlined />
          {name}
        </Space>
      )
    },
    {
      title: '类型',
      dataIndex: 'type',
      key: 'type',
      width: 100,
      render: (type: ExperimentGroup['type']) => (
        <Tag color={getTypeColor(type)}>
          {getTypeText(type)}
        </Tag>
      )
    },
    {
      title: '所属科室',
      dataIndex: 'departmentName',
      key: 'departmentName',
      width: 120
    },
    {
      title: '所属实验室',
      dataIndex: 'laboratoryName',
      key: 'laboratoryName',
      width: 140
    },
    {
      title: '组长',
      dataIndex: 'leader',
      key: 'leader',
      width: 100,
      render: (leader: string) => (
        <Space>
          <Avatar size="small" icon={<UserOutlined />} />
          {leader}
        </Space>
      )
    },
    {
      title: '成员',
      dataIndex: 'members',
      key: 'members',
      width: 200,
      render: (members: GroupMember[]) => (
        <div>
          <div style={{ marginBottom: 4 }}>
            <TeamOutlined /> {members.length}人
          </div>
          <div>
            {members.slice(0, 3).map((member, index) => (
              <Tag 
                key={index} 
                color={getRoleColor(member.role)} 
                size="small" 
                style={{ marginBottom: 2 }}
              >
                {member.name}({getRoleText(member.role)})
              </Tag>
            ))}
            {members.length > 3 && (
              <Tag size="small" style={{ marginBottom: 2 }}>
                +{members.length - 3}
              </Tag>
            )}
          </div>
        </div>
      )
    },
    {
      title: '专业领域',
      dataIndex: 'specialties',
      key: 'specialties',
      width: 180,
      render: (specialties: string[]) => (
        <div>
          {specialties.slice(0, 2).map((item, index) => (
            <Tag key={index} size="small" style={{ marginBottom: 2 }}>
              {item}
            </Tag>
          ))}
          {specialties.length > 2 && (
            <Tag size="small" style={{ marginBottom: 2 }}>
              +{specialties.length - 2}
            </Tag>
          )}
        </div>
      )
    },
    {
      title: '在研项目',
      dataIndex: 'projects',
      key: 'projects',
      width: 150,
      render: (projects: string[]) => (
        <Badge count={projects.length} showZero>
          <span>项目数量</span>
        </Badge>
      )
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 80,
      render: (status: ExperimentGroup['status']) => (
        <Tag color={getStatusColor(status)}>
          {getStatusText(status)}
        </Tag>
      )
    },
    {
      title: '操作',
      key: 'action',
      width: 120,
      fixed: 'right',
      render: (_: any, record: ExperimentGroup) => (
        <Space>
          <Tooltip title="编辑">
            <Button 
              type="text" 
              icon={<EditOutlined />} 
              onClick={() => openModal(record)}
              size="small"
            />
          </Tooltip>
          <Popconfirm
            title="确定要删除这个实验小组吗？"
            onConfirm={() => deleteGroup(record.id)}
            okText="确定"
            cancelText="取消"
          >
            <Tooltip title="删除">
              <Button 
                type="text" 
                danger 
                icon={<DeleteOutlined />}
                size="small"
              />
            </Tooltip>
          </Popconfirm>
        </Space>
      )
    }
  ]

  return (
    <div>
      <Title level={3} style={{ marginBottom: 24 }}>
        实验小组
      </Title>

      <Card className="content-card">
        {/* 搜索和筛选区域 */}
        <div style={{ marginBottom: 16 }}>
          <Space wrap>
            <Input
              placeholder="搜索小组名称、编码、组长或科室"
              prefix={<SearchOutlined />}
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              style={{ width: 280 }}
            />
            <Select
              placeholder="小组类型"
              value={typeFilter}
              onChange={setTypeFilter}
              style={{ width: 120 }}
              allowClear
            >
              <Option value="molecular">分子诊断</Option>
              <Option value="microbiology">微生物检测</Option>
              <Option value="biochemistry">生化检测</Option>
              <Option value="pathology">病理诊断</Option>
              <Option value="research">科研创新</Option>
            </Select>
            <Select
              placeholder="状态"
              value={statusFilter}
              onChange={setStatusFilter}
              style={{ width: 100 }}
              allowClear
            >
              <Option value="active">活跃</Option>
              <Option value="inactive">暂停</Option>
              <Option value="disbanded">解散</Option>
            </Select>
            <Button type="primary" icon={<PlusOutlined />} onClick={() => openModal()}>
              新增小组
            </Button>
            <Button icon={<ExportOutlined />}>
              导出
            </Button>
          </Space>
        </div>

        {/* 实验小组列表表格 */}
        <Table
          columns={columns}
          dataSource={filteredGroups}
          rowKey="id"
          loading={loading}
          scroll={{ x: 1400 }}
          pagination={{
            total: filteredGroups.length,
            pageSize: 10,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total) => `共 ${total} 条记录`
          }}
        />
      </Card>

      {/* 新增/编辑实验小组模态框 */}
      <Modal
        title={editingGroup ? '编辑实验小组' : '新增实验小组'}
        open={modalVisible}
        onCancel={closeModal}
        footer={null}
        width={800}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={saveGroup}
        >
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="code"
                label="小组编码"
                rules={[{ required: true, message: '请输入小组编码' }]}
              >
                <Input placeholder="请输入小组编码" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="name"
                label="小组名称"
                rules={[{ required: true, message: '请输入小组名称' }]}
              >
                <Input placeholder="请输入小组名称" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={8}>
              <Form.Item
                name="type"
                label="小组类型"
                rules={[{ required: true, message: '请选择小组类型' }]}
              >
                <Select placeholder="请选择小组类型">
                  <Option value="molecular">分子诊断</Option>
                  <Option value="microbiology">微生物检测</Option>
                  <Option value="biochemistry">生化检测</Option>
                  <Option value="pathology">病理诊断</Option>
                  <Option value="research">科研创新</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                name="departmentName"
                label="所属科室"
                rules={[{ required: true, message: '请输入所属科室' }]}
              >
                <Input placeholder="请输入所属科室" />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                name="status"
                label="状态"
                rules={[{ required: true, message: '请选择状态' }]}
              >
                <Select placeholder="请选择状态">
                  <Option value="active">活跃</Option>
                  <Option value="inactive">暂停</Option>
                  <Option value="disbanded">解散</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="laboratoryName"
                label="所属实验室"
                rules={[{ required: true, message: '请输入所属实验室' }]}
              >
                <Input placeholder="请输入所属实验室" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="leader"
                label="组长"
                rules={[{ required: true, message: '请输入组长' }]}
              >
                <Input placeholder="请输入组长" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="specialties"
                label="专业领域"
                rules={[{ required: true, message: '请选择专业领域' }]}
              >
                <Select
                  mode="tags"
                  placeholder="请输入或选择专业领域"
                  style={{ width: '100%' }}
                >
                  <Option value="PCR检测">PCR检测</Option>
                  <Option value="基因测序">基因测序</Option>
                  <Option value="突变分析">突变分析</Option>
                  <Option value="病原体检测">病原体检测</Option>
                  <Option value="细菌培养">细菌培养</Option>
                  <Option value="药敏试验">药敏试验</Option>
                  <Option value="生化分析">生化分析</Option>
                  <Option value="免疫检测">免疫检测</Option>
                  <Option value="组织病理学">组织病理学</Option>
                  <Option value="细胞病理学">细胞病理学</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="equipment"
                label="主要设备"
              >
                <Select
                  mode="tags"
                  placeholder="请输入或选择主要设备"
                  style={{ width: '100%' }}
                >
                  <Option value="PCR仪">PCR仪</Option>
                  <Option value="测序仪">测序仪</Option>
                  <Option value="培养箱">培养箱</Option>
                  <Option value="显微镜">显微镜</Option>
                  <Option value="生化分析仪">生化分析仪</Option>
                  <Option value="免疫分析仪">免疫分析仪</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            name="projects"
            label="在研项目"
          >
            <Select
              mode="tags"
              placeholder="请输入在研项目"
              style={{ width: '100%' }}
            />
          </Form.Item>

          <Form.Item
            name="description"
            label="描述"
          >
            <TextArea rows={3} placeholder="请输入实验小组描述信息" />
          </Form.Item>

          <Form.Item style={{ textAlign: 'right', marginBottom: 0 }}>
            <Space>
              <Button onClick={closeModal}>
                取消
              </Button>
              <Button type="primary" htmlType="submit" loading={loading}>
                {editingGroup ? '更新' : '添加'}
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  )
}

export default ExperimentGroupManagement