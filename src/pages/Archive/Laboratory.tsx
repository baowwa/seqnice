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
  Tooltip
} from 'antd'
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  SearchOutlined,
  ExportOutlined,
  EnvironmentOutlined
} from '@ant-design/icons'
import type { ColumnsType } from 'antd/es/table'
import { useAppStore } from '../../store'

const { Option } = Select
const { TextArea } = Input
const { Title } = Typography

/**
 * 实验室信息接口
 */
interface Laboratory {
  id: string
  name: string
  code: string
  type: 'molecular' | 'microbiology' | 'biochemistry' | 'pathology' | 'other'
  location: string
  floor: string
  area: number
  capacity: number
  manager: string
  phone: string
  email: string
  equipment: string[]
  certification: string[]
  status: 'active' | 'inactive' | 'maintenance'
  description?: string
  createdAt: string
  updatedAt: string
}

/**
 * 实验室列表管理页面组件
 * 提供实验室信息的增删改查功能
 */
const LaboratoryManagement: React.FC = () => {
  const { setBreadcrumbs } = useAppStore()
  const [laboratories, setLaboratories] = useState<Laboratory[]>([])
  const [loading, setLoading] = useState(false)
  const [modalVisible, setModalVisible] = useState(false)
  const [editingLaboratory, setEditingLaboratory] = useState<Laboratory | null>(null)
  const [searchText, setSearchText] = useState('')
  const [typeFilter, setTypeFilter] = useState<string>('')
  const [statusFilter, setStatusFilter] = useState<string>('')
  const [form] = Form.useForm()

  useEffect(() => {
    setBreadcrumbs([
      { title: '首页' }, 
      { title: '基础档案' }, 
      { title: '实验室列表' }
    ])
    loadLaboratories()
  }, [setBreadcrumbs])

  /**
   * 加载实验室列表数据
   */
  const loadLaboratories = async () => {
    setLoading(true)
    try {
      // 模拟API调用
      await new Promise(resolve => setTimeout(resolve, 800))
      
      const mockLaboratories: Laboratory[] = [
        {
          id: '1',
          name: '分子生物学实验室',
          code: 'LAB001',
          type: 'molecular',
          location: 'A栋3楼',
          floor: '3F',
          area: 120,
          capacity: 8,
          manager: '张三',
          phone: '010-12345678',
          email: 'molecular@seqnice.com',
          equipment: ['PCR仪', '电泳仪', '离心机', '移液器'],
          certification: ['CNAS', 'CAP'],
          status: 'active',
          description: '主要进行DNA/RNA提取、PCR扩增、基因克隆等分子生物学实验',
          createdAt: '2024-01-15T10:00:00Z',
          updatedAt: '2024-02-20T14:30:00Z'
        },
        {
          id: '2',
          name: '微生物实验室',
          code: 'LAB002',
          type: 'microbiology',
          location: 'A栋2楼',
          floor: '2F',
          area: 80,
          capacity: 6,
          manager: '李四',
          phone: '010-12345679',
          email: 'micro@seqnice.com',
          equipment: ['培养箱', '显微镜', '高压灭菌器', '超净工作台'],
          certification: ['CNAS'],
          status: 'active',
          description: '进行细菌培养、菌株鉴定、抗生素敏感性测试等微生物学实验',
          createdAt: '2024-01-10T09:00:00Z',
          updatedAt: '2024-02-15T11:20:00Z'
        },
        {
          id: '3',
          name: '生化分析实验室',
          code: 'LAB003',
          type: 'biochemistry',
          location: 'B栋1楼',
          floor: '1F',
          area: 100,
          capacity: 10,
          manager: '王五',
          phone: '010-12345680',
          email: 'biochem@seqnice.com',
          equipment: ['分光光度计', '酶标仪', '电化学分析仪', '液相色谱仪'],
          certification: ['ISO15189', 'CNAS'],
          status: 'active',
          description: '进行蛋白质分析、酶活性检测、代谢物分析等生化实验',
          createdAt: '2024-01-05T14:00:00Z',
          updatedAt: '2024-02-10T16:45:00Z'
        },
        {
          id: '4',
          name: '病理诊断实验室',
          code: 'LAB004',
          type: 'pathology',
          location: 'B栋2楼',
          floor: '2F',
          area: 150,
          capacity: 12,
          manager: '赵六',
          phone: '010-12345681',
          email: 'pathology@seqnice.com',
          equipment: ['切片机', '染色机', '显微镜', '图像分析系统'],
          certification: ['CAP', 'ISO15189'],
          status: 'maintenance',
          description: '进行组织病理学检查、细胞学诊断、免疫组化等病理诊断',
          createdAt: '2023-12-20T11:30:00Z',
          updatedAt: '2024-02-25T09:15:00Z'
        }
      ]
      
      setLaboratories(mockLaboratories)
    } catch (error) {
      message.error('获取实验室列表失败')
    } finally {
      setLoading(false)
    }
  }

  /**
   * 打开新增/编辑模态框
   */
  const openModal = (laboratory?: Laboratory) => {
    setEditingLaboratory(laboratory || null)
    if (laboratory) {
      form.setFieldsValue(laboratory)
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
    setEditingLaboratory(null)
    form.resetFields()
  }

  /**
   * 保存实验室信息
   */
  const saveLaboratory = async (values: any) => {
    try {
      setLoading(true)
      
      // 模拟API调用
      await new Promise(resolve => setTimeout(resolve, 1000))

      if (editingLaboratory) {
        // 更新实验室
        const updatedLaboratory = {
          ...editingLaboratory,
          ...values,
          updatedAt: new Date().toISOString()
        }
        setLaboratories(laboratories.map(l => l.id === editingLaboratory.id ? updatedLaboratory : l))
        message.success('实验室信息更新成功')
      } else {
        // 新增实验室
        const newLaboratory: Laboratory = {
          id: Date.now().toString(),
          ...values,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }
        setLaboratories([...laboratories, newLaboratory])
        message.success('实验室添加成功')
      }

      closeModal()
    } catch (error) {
      message.error('操作失败')
    } finally {
      setLoading(false)
    }
  }

  /**
   * 删除实验室
   */
  const deleteLaboratory = async (id: string) => {
    try {
      setLoading(true)
      
      // 模拟API调用
      await new Promise(resolve => setTimeout(resolve, 500))
      
      setLaboratories(laboratories.filter(l => l.id !== id))
      message.success('实验室删除成功')
    } catch (error) {
      message.error('删除失败')
    } finally {
      setLoading(false)
    }
  }

  /**
   * 获取实验室类型标签颜色
   */
  const getTypeColor = (type: Laboratory['type']) => {
    const colorMap = {
      molecular: 'blue',
      microbiology: 'green',
      biochemistry: 'orange',
      pathology: 'purple',
      other: 'default'
    }
    return colorMap[type]
  }

  /**
   * 获取实验室类型文本
   */
  const getTypeText = (type: Laboratory['type']) => {
    const textMap = {
      molecular: '分子生物学',
      microbiology: '微生物学',
      biochemistry: '生物化学',
      pathology: '病理学',
      other: '其他'
    }
    return textMap[type]
  }

  /**
   * 获取状态标签颜色
   */
  const getStatusColor = (status: Laboratory['status']) => {
    const colorMap = {
      active: 'green',
      inactive: 'red',
      maintenance: 'orange'
    }
    return colorMap[status]
  }

  /**
   * 获取状态文本
   */
  const getStatusText = (status: Laboratory['status']) => {
    const textMap = {
      active: '正常使用',
      inactive: '停用',
      maintenance: '维护中'
    }
    return textMap[status]
  }

  /**
   * 过滤实验室列表
   */
  const filteredLaboratories = laboratories.filter(laboratory => {
    const matchesSearch = !searchText || 
      laboratory.name.toLowerCase().includes(searchText.toLowerCase()) ||
      laboratory.code.toLowerCase().includes(searchText.toLowerCase()) ||
      laboratory.manager.toLowerCase().includes(searchText.toLowerCase()) ||
      laboratory.location.toLowerCase().includes(searchText.toLowerCase())
    
    const matchesType = !typeFilter || laboratory.type === typeFilter
    const matchesStatus = !statusFilter || laboratory.status === statusFilter
    
    return matchesSearch && matchesType && matchesStatus
  })

  /**
   * 表格列定义
   */
  const columns: ColumnsType<Laboratory> = [
    {
      title: '实验室编码',
      dataIndex: 'code',
      key: 'code',
      width: 100,
      fixed: 'left'
    },
    {
      title: '实验室名称',
      dataIndex: 'name',
      key: 'name',
      width: 150,
      fixed: 'left'
    },
    {
      title: '类型',
      dataIndex: 'type',
      key: 'type',
      width: 100,
      render: (type: Laboratory['type']) => (
        <Tag color={getTypeColor(type)}>
          {getTypeText(type)}
        </Tag>
      )
    },
    {
      title: '位置',
      dataIndex: 'location',
      key: 'location',
      width: 120,
      render: (location: string, record: Laboratory) => (
        <Space>
          <EnvironmentOutlined />
          {location}
        </Space>
      )
    },
    {
      title: '面积',
      dataIndex: 'area',
      key: 'area',
      width: 80,
      render: (area: number) => `${area}㎡`
    },
    {
      title: '容量',
      dataIndex: 'capacity',
      key: 'capacity',
      width: 80,
      render: (capacity: number) => `${capacity}人`
    },
    {
      title: '负责人',
      dataIndex: 'manager',
      key: 'manager',
      width: 100
    },
    {
      title: '联系电话',
      dataIndex: 'phone',
      key: 'phone',
      width: 120
    },
    {
      title: '主要设备',
      dataIndex: 'equipment',
      key: 'equipment',
      width: 200,
      render: (equipment: string[]) => (
        <div>
          {equipment.slice(0, 3).map((item, index) => (
            <Tag key={index} size="small" style={{ marginBottom: 2 }}>
              {item}
            </Tag>
          ))}
          {equipment.length > 3 && (
            <Tag size="small" style={{ marginBottom: 2 }}>
              +{equipment.length - 3}
            </Tag>
          )}
        </div>
      )
    },
    {
      title: '认证资质',
      dataIndex: 'certification',
      key: 'certification',
      width: 120,
      render: (certification: string[]) => (
        <div>
          {certification.map((cert, index) => (
            <Tag key={index} color="blue" size="small" style={{ marginBottom: 2 }}>
              {cert}
            </Tag>
          ))}
        </div>
      )
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: (status: Laboratory['status']) => (
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
      render: (_: any, record: Laboratory) => (
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
            title="确定要删除这个实验室吗？"
            onConfirm={() => deleteLaboratory(record.id)}
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
        实验室列表
      </Title>

      <Card className="content-card">
        {/* 搜索和筛选区域 */}
        <div style={{ marginBottom: 16 }}>
          <Space wrap>
            <Input
              placeholder="搜索实验室名称、编码、负责人或位置"
              prefix={<SearchOutlined />}
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              style={{ width: 280 }}
            />
            <Select
              placeholder="实验室类型"
              value={typeFilter}
              onChange={setTypeFilter}
              style={{ width: 120 }}
              allowClear
            >
              <Option value="molecular">分子生物学</Option>
              <Option value="microbiology">微生物学</Option>
              <Option value="biochemistry">生物化学</Option>
              <Option value="pathology">病理学</Option>
              <Option value="other">其他</Option>
            </Select>
            <Select
              placeholder="状态"
              value={statusFilter}
              onChange={setStatusFilter}
              style={{ width: 100 }}
              allowClear
            >
              <Option value="active">正常使用</Option>
              <Option value="inactive">停用</Option>
              <Option value="maintenance">维护中</Option>
            </Select>
            <Button type="primary" icon={<PlusOutlined />} onClick={() => openModal()}>
              新增实验室
            </Button>
            <Button icon={<ExportOutlined />}>
              导出
            </Button>
          </Space>
        </div>

        {/* 实验室列表表格 */}
        <Table
          columns={columns}
          dataSource={filteredLaboratories}
          rowKey="id"
          loading={loading}
          scroll={{ x: 1400 }}
          pagination={{
            total: filteredLaboratories.length,
            pageSize: 10,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total) => `共 ${total} 条记录`
          }}
        />
      </Card>

      {/* 新增/编辑实验室模态框 */}
      <Modal
        title={editingLaboratory ? '编辑实验室' : '新增实验室'}
        open={modalVisible}
        onCancel={closeModal}
        footer={null}
        width={800}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={saveLaboratory}
        >
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="code"
                label="实验室编码"
                rules={[{ required: true, message: '请输入实验室编码' }]}
              >
                <Input placeholder="请输入实验室编码" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="name"
                label="实验室名称"
                rules={[{ required: true, message: '请输入实验室名称' }]}
              >
                <Input placeholder="请输入实验室名称" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="type"
                label="实验室类型"
                rules={[{ required: true, message: '请选择实验室类型' }]}
              >
                <Select placeholder="请选择实验室类型">
                  <Option value="molecular">分子生物学</Option>
                  <Option value="microbiology">微生物学</Option>
                  <Option value="biochemistry">生物化学</Option>
                  <Option value="pathology">病理学</Option>
                  <Option value="other">其他</Option>
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
                  <Option value="active">正常使用</Option>
                  <Option value="inactive">停用</Option>
                  <Option value="maintenance">维护中</Option>
                </Select>
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
                <Input placeholder="如：A栋3楼" />
              </Form.Item>
            </Col>
            <Col span={6}>
              <Form.Item
                name="area"
                label="面积（㎡）"
                rules={[{ required: true, message: '请输入面积' }]}
              >
                <Input type="number" placeholder="面积" />
              </Form.Item>
            </Col>
            <Col span={6}>
              <Form.Item
                name="capacity"
                label="容量（人）"
                rules={[{ required: true, message: '请输入容量' }]}
              >
                <Input type="number" placeholder="容量" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={8}>
              <Form.Item
                name="manager"
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
                name="equipment"
                label="主要设备"
                rules={[{ required: true, message: '请选择主要设备' }]}
              >
                <Select
                  mode="tags"
                  placeholder="请输入或选择主要设备"
                  style={{ width: '100%' }}
                >
                  <Option value="PCR仪">PCR仪</Option>
                  <Option value="电泳仪">电泳仪</Option>
                  <Option value="离心机">离心机</Option>
                  <Option value="移液器">移液器</Option>
                  <Option value="培养箱">培养箱</Option>
                  <Option value="显微镜">显微镜</Option>
                  <Option value="高压灭菌器">高压灭菌器</Option>
                  <Option value="超净工作台">超净工作台</Option>
                  <Option value="分光光度计">分光光度计</Option>
                  <Option value="酶标仪">酶标仪</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="certification"
                label="认证资质"
              >
                <Select
                  mode="tags"
                  placeholder="请输入或选择认证资质"
                  style={{ width: '100%' }}
                >
                  <Option value="CNAS">CNAS</Option>
                  <Option value="CAP">CAP</Option>
                  <Option value="ISO15189">ISO15189</Option>
                  <Option value="ISO17025">ISO17025</Option>
                  <Option value="GLP">GLP</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            name="description"
            label="描述"
          >
            <TextArea rows={3} placeholder="请输入实验室描述信息" />
          </Form.Item>

          <Form.Item style={{ textAlign: 'right', marginBottom: 0 }}>
            <Space>
              <Button onClick={closeModal}>
                取消
              </Button>
              <Button type="primary" htmlType="submit" loading={loading}>
                {editingLaboratory ? '更新' : '添加'}
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  )
}

export default LaboratoryManagement