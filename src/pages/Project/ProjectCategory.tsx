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
  message,
  Popconfirm,
  Row,
  Col,
  Tag,
  Tooltip,
  Switch
} from 'antd'
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  SearchOutlined,
  ReloadOutlined,
  ExportOutlined
} from '@ant-design/icons'
import type { ColumnsType } from 'antd/es/table'

const { Search } = Input
const { TextArea } = Input
const { Option } = Select

/**
 * 项目分类接口定义
 */
interface ProjectCategory {
  id: string
  code: string // 分类编码
  name: string // 分类名称
  description: string // 分类描述
  projectCount: number // 关联项目数
  status: 'active' | 'inactive' // 状态
}

/**
 * 项目分类管理组件
 * 实现项目分类的列表展示、新增、编辑、删除等功能
 */
const ProjectCategory: React.FC = () => {
  // 状态管理
  const [categories, setCategories] = useState<ProjectCategory[]>([])
  const [loading, setLoading] = useState(false)
  const [modalVisible, setModalVisible] = useState(false)
  const [editingCategory, setEditingCategory] = useState<ProjectCategory | null>(null)
  const [form] = Form.useForm()
  const [searchText, setSearchText] = useState('')
  const [statusFilter, setStatusFilter] = useState<'active' | 'inactive' | undefined>(undefined)

  // 组件挂载时获取数据
  useEffect(() => {
    fetchCategories()
  }, [])

  /**
   * 获取项目分类列表
   */
  const fetchCategories = async () => {
    setLoading(true)
    try {
      // 模拟API调用 - 按照截图2的数据格式
      const mockCategories: ProjectCategory[] = [
        {
          id: '1',
          code: 'PRODUCT_REG',
          name: '产品注册项目',
          description: '已正式立项',
          projectCount: 12,
          status: 'active'
        },
        {
          id: '2',
          code: 'RD_VALIDATION',
          name: '研发验证项目',
          description: '未签订协议，或未正式立项',
          projectCount: 8,
          status: 'active'
        },
        {
          id: '3',
          code: 'RESEARCH_TOPIC',
          name: '研究课题项目',
          description: '以发布研究成果、研究论文或课题申报为目的',
          projectCount: 15,
          status: 'active'
        },
        {
          id: '4',
          code: 'RESEARCH_SERVICE',
          name: '科研服务项目',
          description: '通常指已签协议',
          projectCount: 23,
          status: 'active'
        },
        {
          id: '5',
          code: 'CLINICAL_DETECTION',
          name: '临床检测项目',
          description: '通常指已签协议，或正式对外出具报告',
          projectCount: 6,
          status: 'active'
        },
        {
          id: '6',
          code: 'OTHER',
          name: '其他',
          description: '其他类型项目',
          projectCount: 3,
          status: 'inactive'
        }
      ]
      
      setCategories(mockCategories)
    } catch (error) {
      message.error('获取项目分类列表失败')
    } finally {
      setLoading(false)
    }
  }

  /**
   * 处理搜索
   */
  const handleSearch = (value: string) => {
    setSearchText(value)
  }

  /**
   * 处理状态筛选
   */
  const handleStatusFilter = (value: 'active' | 'inactive' | undefined) => {
    setStatusFilter(value)
  }

  /**
   * 过滤数据
   */
  const filteredData = categories.filter(category => {
    const matchSearch = !searchText || 
      category.name.toLowerCase().includes(searchText.toLowerCase()) ||
      category.code.toLowerCase().includes(searchText.toLowerCase()) ||
      category.description.toLowerCase().includes(searchText.toLowerCase())
    
    const matchStatus = statusFilter === undefined || category.status === statusFilter
    
    return matchSearch && matchStatus
  })

  /**
   * 打开新增/编辑模态框
   */
  const handleOpenModal = (category?: ProjectCategory) => {
    setEditingCategory(category || null)
    setModalVisible(true)
    
    if (category) {
      form.setFieldsValue({
        code: category.code,
        name: category.name,
        description: category.description,
        status: category.status
      })
    } else {
      form.resetFields()
    }
  }

  /**
   * 关闭模态框
   */
  const handleCloseModal = () => {
    setModalVisible(false)
    setEditingCategory(null)
    form.resetFields()
  }

  /**
   * 保存项目分类
   */
  const handleSave = async () => {
    try {
      const values = await form.validateFields()
      
      if (editingCategory) {
        // 编辑
        const updatedCategory: ProjectCategory = {
          ...editingCategory,
          ...values
        }
        
        setCategories(prev =>
          prev.map(cat => cat.id === editingCategory.id ? updatedCategory : cat)
        )
        message.success('项目分类更新成功')
      } else {
        // 新增
        const newCategory: ProjectCategory = {
          id: Date.now().toString(),
          ...values,
          projectCount: 0
        }
        
        setCategories(prev => [...prev, newCategory])
        message.success('项目分类创建成功')
      }
      
      handleCloseModal()
    } catch (error) {
      message.error('保存失败')
    }
  }

  /**
   * 删除项目分类
   */
  const handleDelete = async (id: string) => {
    try {
      // 检查是否有关联项目
      const category = categories.find(cat => cat.id === id)
      if (category && category.projectCount > 0) {
        message.error('该分类下存在项目，无法删除')
        return
      }
      
      setCategories(prev => prev.filter(cat => cat.id !== id))
      message.success('项目分类删除成功')
    } catch (error) {
      message.error('删除失败')
    }
  }

  /**
   * 切换状态
   */
  const handleToggleStatus = async (id: string, status: 'active' | 'inactive') => {
    try {
      setCategories(prev =>
        prev.map(cat =>
          cat.id === id ? { ...cat, status } : cat
        )
      )
      message.success(`项目分类已${status === 'active' ? '启用' : '禁用'}`)
    } catch (error) {
      message.error('状态更新失败')
    }
  }

  /**
   * 导出数据
   */
  const handleExport = () => {
    message.info('导出功能开发中...')
  }

  // 表格列定义
  const columns: ColumnsType<ProjectCategory> = [
    {
      title: '分类编码',
      dataIndex: 'code',
      key: 'code',
      width: 150,
      ellipsis: true
    },
    {
      title: '分类名称',
      dataIndex: 'name',
      key: 'name',
      width: 200,
      ellipsis: true
    },
    {
      title: '分类描述',
      dataIndex: 'description',
      key: 'description',
      ellipsis: true,
      render: (text: string) => (
        <Tooltip title={text}>
          {text || '-'}
        </Tooltip>
      )
    },
    {
      title: '关联项目数',
      dataIndex: 'projectCount',
      key: 'projectCount',
      width: 120,
      align: 'center',
      render: (count: number) => (
        <Tag color={count > 0 ? 'blue' : 'default'}>
          {count}
        </Tag>
      )
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      align: 'center',
      render: (status: 'active' | 'inactive', record: ProjectCategory) => (
        <Switch
          checked={status === 'active'}
          onChange={(checked) => handleToggleStatus(record.id, checked ? 'active' : 'inactive')}
          checkedChildren="启用"
          unCheckedChildren="禁用"
        />
      )
    },
    {
      title: '操作',
      key: 'action',
      width: 150,
      fixed: 'right',
      render: (_, record: ProjectCategory) => (
        <Space size="small">
          <Tooltip title="编辑">
            <Button
              type="text"
              size="small"
              icon={<EditOutlined />}
              onClick={() => handleOpenModal(record)}
            />
          </Tooltip>
          <Tooltip title="删除">
            <Popconfirm
              title="确认删除"
              description="删除后无法恢复，确认删除该项目分类吗？"
              onConfirm={() => handleDelete(record.id)}
              okText="确认"
              cancelText="取消"
            >
              <Button
                type="text"
                size="small"
                danger
                icon={<DeleteOutlined />}
              />
            </Popconfirm>
          </Tooltip>
        </Space>
      )
    }
  ]

  return (
    <div style={{ padding: '24px' }}>
      <Card>
        {/* 页面标题和操作按钮 */}
        <Row justify="space-between" align="middle" style={{ marginBottom: 16 }}>
          <Col>
            <h2 style={{ margin: 0 }}>项目分类管理</h2>
          </Col>
          <Col>
            <Space>
              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={() => handleOpenModal()}
              >
                新建分类
              </Button>
              <Button
                icon={<ExportOutlined />}
                onClick={handleExport}
              >
                导出
              </Button>
              <Button
                icon={<ReloadOutlined />}
                onClick={fetchCategories}
              >
                刷新
              </Button>
            </Space>
          </Col>
        </Row>

        {/* 搜索和筛选 */}
        <Row gutter={16} style={{ marginBottom: 16 }}>
          <Col span={8}>
            <Search
              placeholder="搜索分类名称、编码或描述..."
              allowClear
              onSearch={handleSearch}
              style={{ width: '100%' }}
            />
          </Col>
          <Col span={6}>
            <Select
              placeholder="状态筛选"
              allowClear
              style={{ width: '100%' }}
              onChange={handleStatusFilter}
              value={statusFilter}
            >
              <Option value="active">启用</Option>
              <Option value="inactive">禁用</Option>
            </Select>
          </Col>
        </Row>

        {/* 项目分类列表 */}
        <Table
          columns={columns}
          dataSource={filteredData}
          rowKey="id"
          loading={loading}
          pagination={{
            total: filteredData.length,
            pageSize: 20,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) => `第 ${range[0]}-${range[1]} 条/共 ${total} 条`
          }}
          scroll={{ x: 1200 }}
        />
      </Card>

      {/* 新增/编辑模态框 */}
      <Modal
        title={editingCategory ? '编辑项目分类' : '新建项目分类'}
        open={modalVisible}
        onOk={handleSave}
        onCancel={handleCloseModal}
        width={600}
        destroyOnClose
      >
        <Form
          form={form}
          layout="vertical"
          initialValues={{
            status: 'active'
          }}
        >
          <Form.Item
            label="分类编码"
            name="code"
            rules={[
              { required: true, message: '请输入分类编码' },
              { pattern: /^[A-Z_]+$/, message: '分类编码只能包含大写字母和下划线' }
            ]}
          >
            <Input placeholder="请输入分类编码，如：PRODUCT_REG" />
          </Form.Item>

          <Form.Item
            label="分类名称"
            name="name"
            rules={[
              { required: true, message: '请输入分类名称' },
              { max: 50, message: '分类名称不能超过50个字符' }
            ]}
          >
            <Input placeholder="请输入分类名称" />
          </Form.Item>

          <Form.Item
            label="分类描述"
            name="description"
            rules={[
              { required: true, message: '请输入分类描述' },
              { max: 200, message: '描述不能超过200个字符' }
            ]}
          >
            <TextArea
              rows={3}
              placeholder="请输入分类描述"
              showCount
              maxLength={200}
            />
          </Form.Item>

          <Form.Item
            label="状态"
            name="status"
            rules={[{ required: true, message: '请选择状态' }]}
          >
            <Select placeholder="请选择状态">
              <Option value="active">启用</Option>
              <Option value="inactive">禁用</Option>
            </Select>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  )
}

export default ProjectCategory