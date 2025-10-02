import React, { useState, useEffect } from 'react'
import { 
  Card, 
  Table, 
  Button, 
  Space, 
  Input, 
  Select, 
  Modal, 
  Form, 
  message, 
  Tag, 
  Popconfirm,
  Typography 
} from 'antd'
import { 
  PlusOutlined, 
  SearchOutlined, 
  EditOutlined, 
  DeleteOutlined,
  ExportOutlined 
} from '@ant-design/icons'
import { useAppStore } from '../../store'
import { Customer } from '../../types'

const { Title } = Typography
const { Option } = Select

/**
 * 客户管理页面组件
 * 提供客户信息的增删改查功能
 */
const CustomerManagement: React.FC = () => {
  const { setBreadcrumbs } = useAppStore()
  const [customers, setCustomers] = useState<Customer[]>([])
  const [loading, setLoading] = useState(false)
  const [modalVisible, setModalVisible] = useState(false)
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null)
  const [searchText, setSearchText] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('')
  const [typeFilter, setTypeFilter] = useState<string>('')
  const [form] = Form.useForm()

  useEffect(() => {
    setBreadcrumbs([
      { title: '首页' }, 
      { title: '基础档案' }, 
      { title: '客户管理' }
    ])
    loadCustomers()
  }, [setBreadcrumbs])

  /**
   * 加载客户数据
   */
  const loadCustomers = async () => {
    setLoading(true)
    try {
      // 模拟API调用
      await new Promise(resolve => setTimeout(resolve, 1000))
      const mockData: Customer[] = [
        {
          id: '1',
          name: '第一人民医院',
          code: 'HOSP001',
          contact: '张医生',
          phone: '13800138001',
          email: 'zhang@hospital1.com',
          address: '北京市朝阳区医院路1号',
          type: 'hospital',
          status: 'active',
          createdAt: '2024-01-01T00:00:00Z',
          updatedAt: '2024-01-01T00:00:00Z'
        },
        {
          id: '2',
          name: '生物技术研究院',
          code: 'RES001',
          contact: '李研究员',
          phone: '13800138002',
          email: 'li@biotech.com',
          address: '上海市浦东新区科技园区',
          type: 'research',
          status: 'active',
          createdAt: '2024-01-02T00:00:00Z',
          updatedAt: '2024-01-02T00:00:00Z'
        },
        {
          id: '3',
          name: '华大基因科技公司',
          code: 'COM001',
          contact: '王经理',
          phone: '13800138003',
          email: 'wang@genomics.com',
          address: '深圳市南山区高新技术园',
          type: 'company',
          status: 'active',
          createdAt: '2024-01-03T00:00:00Z',
          updatedAt: '2024-01-03T00:00:00Z'
        }
      ]
      setCustomers(mockData)
    } catch (error) {
      message.error('加载客户数据失败')
    } finally {
      setLoading(false)
    }
  }

  /**
   * 打开新增/编辑模态框
   * @param customer 编辑的客户信息，为空时表示新增
   */
  const openModal = (customer?: Customer) => {
    setEditingCustomer(customer || null)
    setModalVisible(true)
    if (customer) {
      form.setFieldsValue(customer)
    } else {
      form.resetFields()
    }
  }

  /**
   * 关闭模态框
   */
  const closeModal = () => {
    setModalVisible(false)
    setEditingCustomer(null)
    form.resetFields()
  }

  /**
   * 保存客户信息
   * @param values 表单数据
   */
  const saveCustomer = async (values: any) => {
    try {
      // 模拟API调用
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      if (editingCustomer) {
        // 更新客户
        setCustomers(prev => prev.map(customer => 
          customer.id === editingCustomer.id 
            ? { ...customer, ...values, updatedAt: new Date().toISOString() }
            : customer
        ))
        message.success('客户信息更新成功')
      } else {
        // 新增客户
        const newCustomer: Customer = {
          id: Date.now().toString(),
          ...values,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }
        setCustomers(prev => [...prev, newCustomer])
        message.success('客户添加成功')
      }
      
      closeModal()
    } catch (error) {
      message.error('保存失败')
    }
  }

  /**
   * 删除客户
   * @param id 客户ID
   */
  const deleteCustomer = async (id: string) => {
    try {
      // 模拟API调用
      await new Promise(resolve => setTimeout(resolve, 500))
      setCustomers(prev => prev.filter(customer => customer.id !== id))
      message.success('客户删除成功')
    } catch (error) {
      message.error('删除失败')
    }
  }

  /**
   * 过滤客户数据
   */
  const filteredCustomers = customers.filter(customer => {
    const matchesSearch = !searchText || 
      customer.name.toLowerCase().includes(searchText.toLowerCase()) ||
      customer.code.toLowerCase().includes(searchText.toLowerCase()) ||
      customer.contact.toLowerCase().includes(searchText.toLowerCase())
    
    const matchesStatus = !statusFilter || customer.status === statusFilter
    const matchesType = !typeFilter || customer.type === typeFilter
    
    return matchesSearch && matchesStatus && matchesType
  })

  const columns = [
    {
      title: '客户编码',
      dataIndex: 'code',
      key: 'code',
      width: 120,
      ellipsis: true
    },
    {
      title: '客户名称',
      dataIndex: 'name',
      key: 'name',
      width: 150,
      ellipsis: true,
      render: (text: string) => <span style={{ fontWeight: 500 }}>{text}</span>
    },
    {
      title: '客户分类',
      dataIndex: 'type',
      key: 'type',
      width: 100,
      render: (type: string) => {
        const typeMap = {
          hospital: { color: 'blue', text: '医院' },
          research: { color: 'green', text: '科研院所' },
          company: { color: 'orange', text: '企业' }
        }
        const config = typeMap[type as keyof typeof typeMap]
        return <Tag color={config.color}>{config.text}</Tag>
      }
    },
    {
      title: '联系人',
      dataIndex: 'contact',
      key: 'contact',
      width: 100,
      ellipsis: true
    },
    {
      title: '联系电话',
      dataIndex: 'phone',
      key: 'phone',
      width: 130,
      ellipsis: true
    },
    {
      title: '邮箱',
      dataIndex: 'email',
      key: 'email',
      width: 180,
      ellipsis: true
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 80,
      render: (status: string) => (
        <Tag color={status === 'active' ? 'green' : 'red'}>
          {status === 'active' ? '启用' : '禁用'}
        </Tag>
      )
    },
    {
      title: '操作',
      key: 'action',
      width: 120,
      render: (_: any, record: Customer) => (
        <Space>
          <Button 
            type="link" 
            icon={<EditOutlined />} 
            onClick={() => openModal(record)}
            size="small"
          >
            编辑
          </Button>
          <Popconfirm
            title="确定要删除这个客户吗？"
            onConfirm={() => deleteCustomer(record.id)}
            okText="确定"
            cancelText="取消"
          >
            <Button 
              type="link" 
              danger 
              icon={<DeleteOutlined />}
              size="small"
            >
              删除
            </Button>
          </Popconfirm>
        </Space>
      )
    }
  ]

  return (
    <div>
      <Title level={3} style={{ marginBottom: 24 }}>
        客户管理
      </Title>

      <Card className="content-card">
        {/* 搜索和筛选区域 */}
        <div style={{ marginBottom: 16 }}>
          <Space wrap>
            <Input
              placeholder="搜索客户名称、编码或联系人"
              prefix={<SearchOutlined />}
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              style={{ width: 250 }}
            />
            <Select
              placeholder="客户分类"
              value={typeFilter}
              onChange={setTypeFilter}
              style={{ width: 120 }}
              allowClear
            >
              <Option value="hospital">医院</Option>
              <Option value="research">科研院所</Option>
              <Option value="company">企业</Option>
            </Select>
            <Select
              placeholder="状态"
              value={statusFilter}
              onChange={setStatusFilter}
              style={{ width: 100 }}
              allowClear
            >
              <Option value="active">启用</Option>
              <Option value="inactive">禁用</Option>
            </Select>
            <Button type="primary" icon={<PlusOutlined />} onClick={() => openModal()}>
              新增客户
            </Button>
            <Button icon={<ExportOutlined />}>
              导出
            </Button>
          </Space>
        </div>

        {/* 客户列表表格 */}
        <Table
          columns={columns}
          dataSource={filteredCustomers}
          rowKey="id"
          loading={loading}
          scroll={{ x: 950 }}
          pagination={{
            total: filteredCustomers.length,
            pageSize: 10,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total) => `共 ${total} 条记录`
          }}
        />
      </Card>

      {/* 新增/编辑客户模态框 */}
      <Modal
        title={editingCustomer ? '编辑客户' : '新增客户'}
        open={modalVisible}
        onCancel={closeModal}
        footer={null}
        width={600}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={saveCustomer}
        >
          <Form.Item
            name="code"
            label="客户编码"
            rules={[{ required: true, message: '请输入客户编码' }]}
          >
            <Input placeholder="请输入客户编码" />
          </Form.Item>

          <Form.Item
            name="name"
            label="客户名称"
            rules={[{ required: true, message: '请输入客户名称' }]}
          >
            <Input placeholder="请输入客户名称" />
          </Form.Item>

          <Form.Item
            name="type"
            label="客户分类"
            rules={[{ required: true, message: '请选择客户分类' }]}
          >
            <Select placeholder="请选择客户分类">
              <Option value="hospital">医院</Option>
              <Option value="research">科研院所</Option>
              <Option value="company">企业</Option>
            </Select>
          </Form.Item>

          <Form.Item
            name="contact"
            label="联系人"
            rules={[{ required: true, message: '请输入联系人' }]}
          >
            <Input placeholder="请输入联系人" />
          </Form.Item>

          <Form.Item
            name="phone"
            label="联系电话"
            rules={[
              { required: true, message: '请输入联系电话' },
              { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号码' }
            ]}
          >
            <Input placeholder="请输入联系电话" />
          </Form.Item>

          <Form.Item
            name="email"
            label="邮箱"
            rules={[
              { required: true, message: '请输入邮箱' },
              { type: 'email', message: '请输入正确的邮箱格式' }
            ]}
          >
            <Input placeholder="请输入邮箱" />
          </Form.Item>

          <Form.Item
            name="address"
            label="地址"
            rules={[{ required: true, message: '请输入地址' }]}
          >
            <Input.TextArea placeholder="请输入地址" rows={3} />
          </Form.Item>

          <Form.Item
            name="status"
            label="状态"
            rules={[{ required: true, message: '请选择状态' }]}
          >
            <Select placeholder="请选择状态">
              <Option value="active">启用</Option>
              <Option value="inactive">禁用</Option>
            </Select>
          </Form.Item>

          <Form.Item style={{ marginBottom: 0, textAlign: 'right' }}>
            <Space>
              <Button onClick={closeModal}>
                取消
              </Button>
              <Button type="primary" htmlType="submit">
                保存
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  )
}

export default CustomerManagement