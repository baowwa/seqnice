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
  TreeSelect
} from 'antd'
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  SearchOutlined,
  ExportOutlined,
  TeamOutlined,
  UserOutlined
} from '@ant-design/icons'
import type { ColumnsType } from 'antd/es/table'
import { useAppStore } from '../../store'

const { Option } = Select
const { TextArea } = Input
const { Title } = Typography

/**
 * 科室信息接口
 */
interface Department {
  id: string
  name: string
  code: string
  type: 'clinical' | 'laboratory' | 'administrative' | 'support' | 'research'
  parentId?: string
  parentName?: string
  level: number
  director: string
  phone: string
  email: string
  location: string
  staffCount: number
  description?: string
  responsibilities: string[]
  status: 'active' | 'inactive'
  createdAt: string
  updatedAt: string
}

/**
 * 科室列表管理页面组件
 * 提供科室信息的增删改查功能，支持层级结构
 */
const DepartmentManagement: React.FC = () => {
  const { setBreadcrumbs } = useAppStore()
  const [departments, setDepartments] = useState<Department[]>([])
  const [loading, setLoading] = useState(false)
  const [modalVisible, setModalVisible] = useState(false)
  const [editingDepartment, setEditingDepartment] = useState<Department | null>(null)
  const [searchText, setSearchText] = useState('')
  const [typeFilter, setTypeFilter] = useState<string>('')
  const [statusFilter, setStatusFilter] = useState<string>('')
  const [form] = Form.useForm()

  useEffect(() => {
    setBreadcrumbs([
      { title: '首页' }, 
      { title: '基础档案' }, 
      { title: '科室列表' }
    ])
    loadDepartments()
  }, [setBreadcrumbs])

  /**
   * 加载科室列表数据
   */
  const loadDepartments = async () => {
    setLoading(true)
    try {
      // 模拟API调用
      await new Promise(resolve => setTimeout(resolve, 800))
      
      const mockDepartments: Department[] = [
        {
          id: '1',
          name: '检验科',
          code: 'DEPT001',
          type: 'laboratory',
          level: 1,
          director: '张主任',
          phone: '010-12345678',
          email: 'lab@seqnice.com',
          location: 'A栋2-3楼',
          staffCount: 25,
          responsibilities: ['临床检验', '病理诊断', '质量控制', '科研教学'],
          status: 'active',
          description: '负责医院所有临床检验工作，包括生化、免疫、微生物、分子诊断等',
          createdAt: '2024-01-01T08:00:00Z',
          updatedAt: '2024-02-20T10:30:00Z'
        },
        {
          id: '2',
          name: '分子诊断室',
          code: 'DEPT002',
          type: 'laboratory',
          parentId: '1',
          parentName: '检验科',
          level: 2,
          director: '李医生',
          phone: '010-12345679',
          email: 'molecular@seqnice.com',
          location: 'A栋3楼301',
          staffCount: 8,
          responsibilities: ['基因检测', 'PCR检测', '测序分析', '遗传咨询'],
          status: 'active',
          description: '专门从事分子生物学检测，包括病原体检测、遗传病筛查等',
          createdAt: '2024-01-05T09:00:00Z',
          updatedAt: '2024-02-18T14:20:00Z'
        },
        {
          id: '3',
          name: '微生物室',
          code: 'DEPT003',
          type: 'laboratory',
          parentId: '1',
          parentName: '检验科',
          level: 2,
          director: '王医生',
          phone: '010-12345680',
          email: 'micro@seqnice.com',
          location: 'A栋2楼201',
          staffCount: 6,
          responsibilities: ['细菌培养', '药敏试验', '真菌检测', '病毒检测'],
          status: 'active',
          description: '负责各类病原微生物的分离培养和鉴定工作',
          createdAt: '2024-01-03T10:00:00Z',
          updatedAt: '2024-02-15T16:45:00Z'
        },
        {
          id: '4',
          name: '临床科',
          code: 'DEPT004',
          type: 'clinical',
          level: 1,
          director: '赵主任',
          phone: '010-12345681',
          email: 'clinical@seqnice.com',
          location: 'B栋1-5楼',
          staffCount: 120,
          responsibilities: ['患者诊疗', '临床研究', '教学培训', '学术交流'],
          status: 'active',
          description: '负责患者的临床诊疗工作，与检验科密切配合',
          createdAt: '2023-12-15T08:30:00Z',
          updatedAt: '2024-02-10T11:15:00Z'
        },
        {
          id: '5',
          name: '内科',
          code: 'DEPT005',
          type: 'clinical',
          parentId: '4',
          parentName: '临床科',
          level: 2,
          director: '孙医生',
          phone: '010-12345682',
          email: 'internal@seqnice.com',
          location: 'B栋2楼',
          staffCount: 35,
          responsibilities: ['内科疾病诊治', '慢病管理', '急诊处理', '会诊服务'],
          status: 'active',
          description: '负责内科系统疾病的诊断和治疗',
          createdAt: '2023-12-20T09:00:00Z',
          updatedAt: '2024-02-08T13:30:00Z'
        },
        {
          id: '6',
          name: '行政管理部',
          code: 'DEPT006',
          type: 'administrative',
          level: 1,
          director: '周主任',
          phone: '010-12345683',
          email: 'admin@seqnice.com',
          location: 'C栋1楼',
          staffCount: 15,
          responsibilities: ['人事管理', '财务管理', '行政事务', '后勤保障'],
          status: 'active',
          description: '负责医院的行政管理和后勤保障工作',
          createdAt: '2023-11-01T08:00:00Z',
          updatedAt: '2024-01-25T15:20:00Z'
        },
        {
          id: '7',
          name: '科研部',
          code: 'DEPT007',
          type: 'research',
          level: 1,
          director: '吴教授',
          phone: '010-12345684',
          email: 'research@seqnice.com',
          location: 'D栋3楼',
          staffCount: 12,
          responsibilities: ['科研项目管理', '学术论文发表', '专利申请', '产学研合作'],
          status: 'active',
          description: '负责医院的科研工作和学术发展',
          createdAt: '2023-10-15T10:00:00Z',
          updatedAt: '2024-02-05T09:45:00Z'
        }
      ]
      
      setDepartments(mockDepartments)
    } catch (error) {
      message.error('获取科室列表失败')
    } finally {
      setLoading(false)
    }
  }

  /**
   * 打开新增/编辑模态框
   */
  const openModal = (department?: Department) => {
    setEditingDepartment(department || null)
    if (department) {
      form.setFieldsValue(department)
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
    setEditingDepartment(null)
    form.resetFields()
  }

  /**
   * 保存科室信息
   */
  const saveDepartment = async (values: any) => {
    try {
      setLoading(true)
      
      // 模拟API调用
      await new Promise(resolve => setTimeout(resolve, 1000))

      if (editingDepartment) {
        // 更新科室
        const updatedDepartment = {
          ...editingDepartment,
          ...values,
          updatedAt: new Date().toISOString()
        }
        setDepartments(departments.map(d => d.id === editingDepartment.id ? updatedDepartment : d))
        message.success('科室信息更新成功')
      } else {
        // 新增科室
        const parentDept = values.parentId ? departments.find(d => d.id === values.parentId) : null
        const newDepartment: Department = {
          id: Date.now().toString(),
          ...values,
          parentName: parentDept?.name,
          level: parentDept ? parentDept.level + 1 : 1,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }
        setDepartments([...departments, newDepartment])
        message.success('科室添加成功')
      }

      closeModal()
    } catch (error) {
      message.error('操作失败')
    } finally {
      setLoading(false)
    }
  }

  /**
   * 删除科室
   */
  const deleteDepartment = async (id: string) => {
    try {
      setLoading(true)
      
      // 检查是否有子科室
      const hasChildren = departments.some(d => d.parentId === id)
      if (hasChildren) {
        message.error('该科室下还有子科室，无法删除')
        return
      }
      
      // 模拟API调用
      await new Promise(resolve => setTimeout(resolve, 500))
      
      setDepartments(departments.filter(d => d.id !== id))
      message.success('科室删除成功')
    } catch (error) {
      message.error('删除失败')
    } finally {
      setLoading(false)
    }
  }

  /**
   * 获取科室类型标签颜色
   */
  const getTypeColor = (type: Department['type']) => {
    const colorMap = {
      clinical: 'blue',
      laboratory: 'green',
      administrative: 'orange',
      support: 'purple',
      research: 'red'
    }
    return colorMap[type]
  }

  /**
   * 获取科室类型文本
   */
  const getTypeText = (type: Department['type']) => {
    const textMap = {
      clinical: '临床科室',
      laboratory: '检验科室',
      administrative: '行政科室',
      support: '支持科室',
      research: '科研科室'
    }
    return textMap[type]
  }

  /**
   * 获取状态标签颜色
   */
  const getStatusColor = (status: Department['status']) => {
    return status === 'active' ? 'green' : 'red'
  }

  /**
   * 获取状态文本
   */
  const getStatusText = (status: Department['status']) => {
    return status === 'active' ? '正常' : '停用'
  }

  /**
   * 构建科室树形数据
   */
  const buildDepartmentTree = () => {
    const tree: any[] = []
    const departmentMap = new Map()
    
    // 先创建所有节点
    departments.forEach(dept => {
      departmentMap.set(dept.id, {
        value: dept.id,
        title: dept.name,
        children: []
      })
    })
    
    // 构建树形结构
    departments.forEach(dept => {
      const node = departmentMap.get(dept.id)
      if (dept.parentId && departmentMap.has(dept.parentId)) {
        departmentMap.get(dept.parentId).children.push(node)
      } else {
        tree.push(node)
      }
    })
    
    return tree
  }

  /**
   * 过滤科室列表
   */
  const filteredDepartments = departments.filter(department => {
    const matchesSearch = !searchText || 
      department.name.toLowerCase().includes(searchText.toLowerCase()) ||
      department.code.toLowerCase().includes(searchText.toLowerCase()) ||
      department.director.toLowerCase().includes(searchText.toLowerCase()) ||
      department.location.toLowerCase().includes(searchText.toLowerCase())
    
    const matchesType = !typeFilter || department.type === typeFilter
    const matchesStatus = !statusFilter || department.status === statusFilter
    
    return matchesSearch && matchesType && matchesStatus
  })

  /**
   * 表格列定义
   */
  const columns: ColumnsType<Department> = [
    {
      title: '科室编码',
      dataIndex: 'code',
      key: 'code',
      width: 100,
      fixed: 'left'
    },
    {
      title: '科室名称',
      dataIndex: 'name',
      key: 'name',
      width: 150,
      fixed: 'left',
      render: (name: string, record: Department) => (
        <Space>
          {record.level > 1 && <span style={{ color: '#999', marginRight: 4 }}>└─</span>}
          {name}
        </Space>
      )
    },
    {
      title: '上级科室',
      dataIndex: 'parentName',
      key: 'parentName',
      width: 120,
      render: (parentName: string) => parentName || '-'
    },
    {
      title: '类型',
      dataIndex: 'type',
      key: 'type',
      width: 100,
      render: (type: Department['type']) => (
        <Tag color={getTypeColor(type)}>
          {getTypeText(type)}
        </Tag>
      )
    },
    {
      title: '负责人',
      dataIndex: 'director',
      key: 'director',
      width: 100,
      render: (director: string) => (
        <Space>
          <UserOutlined />
          {director}
        </Space>
      )
    },
    {
      title: '联系电话',
      dataIndex: 'phone',
      key: 'phone',
      width: 120
    },
    {
      title: '位置',
      dataIndex: 'location',
      key: 'location',
      width: 120
    },
    {
      title: '人员数量',
      dataIndex: 'staffCount',
      key: 'staffCount',
      width: 100,
      render: (staffCount: number) => (
        <Space>
          <TeamOutlined />
          {staffCount}人
        </Space>
      )
    },
    {
      title: '主要职责',
      dataIndex: 'responsibilities',
      key: 'responsibilities',
      width: 200,
      render: (responsibilities: string[]) => (
        <div>
          {responsibilities.slice(0, 2).map((item, index) => (
            <Tag key={index} size="small" style={{ marginBottom: 2 }}>
              {item}
            </Tag>
          ))}
          {responsibilities.length > 2 && (
            <Tag size="small" style={{ marginBottom: 2 }}>
              +{responsibilities.length - 2}
            </Tag>
          )}
        </div>
      )
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 80,
      render: (status: Department['status']) => (
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
      render: (_: any, record: Department) => (
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
            title="确定要删除这个科室吗？"
            onConfirm={() => deleteDepartment(record.id)}
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
        科室列表
      </Title>

      <Card className="content-card">
        {/* 搜索和筛选区域 */}
        <div style={{ marginBottom: 16 }}>
          <Space wrap>
            <Input
              placeholder="搜索科室名称、编码、负责人或位置"
              prefix={<SearchOutlined />}
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              style={{ width: 280 }}
            />
            <Select
              placeholder="科室类型"
              value={typeFilter}
              onChange={setTypeFilter}
              style={{ width: 120 }}
              allowClear
            >
              <Option value="clinical">临床科室</Option>
              <Option value="laboratory">检验科室</Option>
              <Option value="administrative">行政科室</Option>
              <Option value="support">支持科室</Option>
              <Option value="research">科研科室</Option>
            </Select>
            <Select
              placeholder="状态"
              value={statusFilter}
              onChange={setStatusFilter}
              style={{ width: 100 }}
              allowClear
            >
              <Option value="active">正常</Option>
              <Option value="inactive">停用</Option>
            </Select>
            <Button type="primary" icon={<PlusOutlined />} onClick={() => openModal()}>
              新增科室
            </Button>
            <Button icon={<ExportOutlined />}>
              导出
            </Button>
          </Space>
        </div>

        {/* 科室列表表格 */}
        <Table
          columns={columns}
          dataSource={filteredDepartments}
          rowKey="id"
          loading={loading}
          scroll={{ x: 1300 }}
          pagination={{
            total: filteredDepartments.length,
            pageSize: 10,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total) => `共 ${total} 条记录`
          }}
        />
      </Card>

      {/* 新增/编辑科室模态框 */}
      <Modal
        title={editingDepartment ? '编辑科室' : '新增科室'}
        open={modalVisible}
        onCancel={closeModal}
        footer={null}
        width={800}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={saveDepartment}
        >
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="code"
                label="科室编码"
                rules={[{ required: true, message: '请输入科室编码' }]}
              >
                <Input placeholder="请输入科室编码" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="name"
                label="科室名称"
                rules={[{ required: true, message: '请输入科室名称' }]}
              >
                <Input placeholder="请输入科室名称" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={8}>
              <Form.Item
                name="type"
                label="科室类型"
                rules={[{ required: true, message: '请选择科室类型' }]}
              >
                <Select placeholder="请选择科室类型">
                  <Option value="clinical">临床科室</Option>
                  <Option value="laboratory">检验科室</Option>
                  <Option value="administrative">行政科室</Option>
                  <Option value="support">支持科室</Option>
                  <Option value="research">科研科室</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                name="parentId"
                label="上级科室"
              >
                <TreeSelect
                  placeholder="请选择上级科室"
                  treeData={buildDepartmentTree()}
                  allowClear
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
                  <Option value="inactive">停用</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={8}>
              <Form.Item
                name="director"
                label="负责人"
                rules={[{ required: true, message: '请输入负责人' }]}
              >
                <Input placeholder="请输入负责人" />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                name="phone"
                label="联系电话"
                rules={[{ required: true, message: '请输入联系电话' }]}
              >
                <Input placeholder="请输入联系电话" />
              </Form.Item>
            </Col>
            <Col span={8}>
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
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="location"
                label="位置"
                rules={[{ required: true, message: '请输入位置' }]}
              >
                <Input placeholder="如：A栋2-3楼" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="staffCount"
                label="人员数量"
                rules={[{ required: true, message: '请输入人员数量' }]}
              >
                <Input type="number" placeholder="人员数量" />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            name="responsibilities"
            label="主要职责"
            rules={[{ required: true, message: '请输入主要职责' }]}
          >
            <Select
              mode="tags"
              placeholder="请输入主要职责"
              style={{ width: '100%' }}
            >
              <Option value="临床检验">临床检验</Option>
              <Option value="病理诊断">病理诊断</Option>
              <Option value="质量控制">质量控制</Option>
              <Option value="科研教学">科研教学</Option>
              <Option value="患者诊疗">患者诊疗</Option>
              <Option value="临床研究">临床研究</Option>
              <Option value="人事管理">人事管理</Option>
              <Option value="财务管理">财务管理</Option>
              <Option value="行政事务">行政事务</Option>
              <Option value="后勤保障">后勤保障</Option>
            </Select>
          </Form.Item>

          <Form.Item
            name="description"
            label="描述"
          >
            <TextArea rows={3} placeholder="请输入科室描述信息" />
          </Form.Item>

          <Form.Item style={{ textAlign: 'right', marginBottom: 0 }}>
            <Space>
              <Button onClick={closeModal}>
                取消
              </Button>
              <Button type="primary" htmlType="submit" loading={loading}>
                {editingDepartment ? '更新' : '添加'}
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  )
}

export default DepartmentManagement