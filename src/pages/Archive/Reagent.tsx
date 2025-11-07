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
  Radio
} from 'antd'
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  SearchOutlined
} from '@ant-design/icons'
import type { ColumnsType } from 'antd/es/table'
import { useAppStore } from '../../store'
// 移除不必要的日期库

const { Option } = Select
const { TextArea } = Input
const { Title } = Typography

/**
 * 物料档案数据结构（与截图字段一致）
 */
interface Reagent {
  /** 主键ID */
  id: string
  /** 物料编码 */
  reagent_code: string
  /** 物料名称 */
  reagent_name: string
  /** 品牌（可选） */
  brand_name?: string
  /** 规格（可选） */
  spec?: string
  /** 批次（可选） */
  lot_no?: string
  /** 状态：0-停用，1-启用（必填） */
  enable_status: 0 | 1
  /** 创建时间 */
  createdAt: string
  /** 更新时间 */
  updatedAt: string
  /** 描述（可选） */
  description?: string
}

/**
 * 物料档案管理页面组件
 * 提供试剂/物料信息的增删改查功能，包括库存管理和过期提醒
 */
const ReagentManagement: React.FC = () => {
  const { setBreadcrumbs } = useAppStore()
  const [reagents, setReagents] = useState<Reagent[]>([])
  const [loading, setLoading] = useState(false)
  const [modalVisible, setModalVisible] = useState(false)
  const [editingReagent, setEditingReagent] = useState<Reagent | null>(null)
  const [searchText, setSearchText] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('')
  const [categoryFilter, setCategoryFilter] = useState<string>('')
  const [form] = Form.useForm()

  useEffect(() => {
    setBreadcrumbs([
      { title: '首页' }, 
      { title: '基础档案' }, 
      { title: '物料档案' }
    ])
    loadReagents()
  }, [setBreadcrumbs])

  /**
   * 加载物料列表数据
   * @returns void 无返回值
   */
  const loadReagents = async (): Promise<void> => {
    setLoading(true)
    try {
      // 模拟API调用
      await new Promise(resolve => setTimeout(resolve, 800))
      
      const mockReagents: Reagent[] = [
        {
          id: '1',
          reagent_code: 'REA001',
          reagent_name: 'Taq DNA聚合酶',
          brand_name: 'Thermo Fisher',
          spec: '500U',
          lot_no: 'TF20240301',
          enable_status: 1,
          createdAt: '2024-01-15T10:00:00Z',
          updatedAt: '2024-02-20T14:30:00Z'
        },
        {
          id: '2',
          reagent_code: 'REA002',
          reagent_name: 'dNTP混合液',
          brand_name: 'NEB',
          spec: '10mM',
          lot_no: 'NEB20240215',
          enable_status: 1,
          createdAt: '2024-02-01T09:15:00Z',
          updatedAt: '2024-02-25T16:45:00Z'
        },
        {
          id: '3',
          reagent_code: 'REA003',
          reagent_name: 'DNA Marker',
          brand_name: 'Takara',
          spec: '100bp-10kb',
          lot_no: 'TK20231201',
          enable_status: 0,
          createdAt: '2023-12-05T11:20:00Z',
          updatedAt: '2024-02-28T10:15:00Z'
        }
      ]
      
      setReagents(mockReagents)
    } catch (error) {
      message.error('获取物料列表失败')
    } finally {
      setLoading(false)
    }
  }

  /**
   * 打开新增/编辑模态框
   * @param reagent 选填：编辑的物料对象
   */
  const openModal = (reagent?: Reagent) => {
    setEditingReagent(reagent || null)
    if (reagent) {
      form.setFieldsValue({
        ...reagent
      })
    } else {
      form.resetFields()
      form.setFieldsValue({ enable_status: 1 })
    }
    setModalVisible(true)
  }

  /**
   * 关闭模态框
   */
  const closeModal = () => {
    setModalVisible(false)
    setEditingReagent(null)
    form.resetFields()
  }

  /**
   * 保存物料信息
   * @param values 表单值
   * @returns Promise<void>
   */
  const saveReagent = async (values: any): Promise<void> => {
    try {
      setLoading(true)
      
      // 模拟API调用
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      const reagentData: Reagent = {
        id: editingReagent?.id ?? Date.now().toString(),
        reagent_code: values.reagent_code,
        reagent_name: values.reagent_name,
        brand_name: values.brand_name,
        spec: values.spec,
        lot_no: values.lot_no,
        enable_status: Number(values.enable_status) as 0 | 1,
        description: values.description,
        createdAt: editingReagent?.createdAt ?? new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }

      if (editingReagent) {
        // 更新试剂
        setReagents(reagents.map(r => r.id === editingReagent.id ? reagentData : r))
        message.success('物料信息更新成功')
      } else {
        // 新增物料
        setReagents([...reagents, reagentData])
        message.success('物料添加成功')
      }

      closeModal()
    } catch (error) {
      message.error('操作失败')
    } finally {
      setLoading(false)
    }
  }

  /**
   * 删除试剂
   */
  const deleteReagent = async (id: string) => {
    try {
      setLoading(true)
      
      // 模拟API调用
      await new Promise(resolve => setTimeout(resolve, 500))
      
      setReagents(reagents.filter(r => r.id !== id))
      message.success('试剂删除成功')
    } catch (error) {
      message.error('删除失败')
    } finally {
      setLoading(false)
    }
  }

  /**
   * 获取启用状态的标签颜色
   * @param status 启用状态（0-停用，1-启用）
   * @returns 颜色字符串
   */
  const getStatusColor = (status: Reagent['enable_status']): string => {
    return status === 1 ? 'green' : 'red'
  }

  /**
   * 获取启用状态的展示文本
   * @param status 启用状态（0-停用，1-启用）
   * @returns 状态中文文本
   */
  const getStatusText = (status: Reagent['enable_status']): string => {
    return status === 1 ? '启用' : '停用'
  }

  /**
   * 过滤物料列表
   */
  const filteredReagents = reagents.filter(reagent => {
    const text = searchText.trim().toLowerCase()
    const matchesSearch = !text ||
      reagent.reagent_name.toLowerCase().includes(text) ||
      reagent.reagent_code.toLowerCase().includes(text) ||
      (reagent.brand_name || '').toLowerCase().includes(text)
    return matchesSearch
  })

  /**
   * 表格列定义（与截图一致）
   */
  const columns: ColumnsType<Reagent> = [
    { title: '物料编码', dataIndex: 'reagent_code', key: 'reagent_code', width: 140, fixed: 'left' },
    { title: '物料名称', dataIndex: 'reagent_name', key: 'reagent_name', width: 180, fixed: 'left' },
    { title: '品牌', dataIndex: 'brand_name', key: 'brand_name', width: 140 },
    { title: '规格', dataIndex: 'spec', key: 'spec', width: 120 },
    { title: '批次', dataIndex: 'lot_no', key: 'lot_no', width: 140 },
    {
      title: '状态',
      dataIndex: 'enable_status',
      key: 'enable_status',
      width: 100,
      render: (status: Reagent['enable_status']) => (
        <Tag color={getStatusColor(status)}>{getStatusText(status)}</Tag>
      )
    },
    {
      title: '操作',
      key: 'action',
      width: 120,
      fixed: 'right',
      render: (_: any, record: Reagent) => (
        <Space>
          <Tooltip title="编辑">
            <Button type="text" icon={<EditOutlined />} onClick={() => openModal(record)} size="small" />
          </Tooltip>
          <Popconfirm title="确定要删除该物料吗？" onConfirm={() => deleteReagent(record.id)} okText="确定" cancelText="取消">
            <Tooltip title="删除">
              <Button type="text" danger icon={<DeleteOutlined />} size="small" />
            </Tooltip>
          </Popconfirm>
        </Space>
      )
    }
  ]

  return (
    <div>
      <Title level={3} style={{ marginBottom: 24 }}>
        物料档案
      </Title>

      <Card className="content-card">
        {/* 搜索和筛选区域 */}
        <div style={{ marginBottom: 16 }}>
          <Space wrap>
            <Input
              placeholder="搜索试剂名称、编码、品牌或供应商"
              prefix={<SearchOutlined />}
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              style={{ width: 280 }}
            />
            <Button type="primary" icon={<PlusOutlined />} onClick={() => openModal()}>
              新增物料
            </Button>
          </Space>
        </div>

        {/* 试剂列表表格 */}
        <Table
          columns={columns}
          dataSource={filteredReagents}
          rowKey="id"
          loading={loading}
          scroll={{ x: 900 }}
          pagination={{
            total: filteredReagents.length,
            pageSize: 10,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total) => `共 ${total} 条记录`
          }}
        />
      </Card>

      {/* 新增/编辑物料模态框 */}
      <Modal
        title={editingReagent ? '编辑物料' : '新增物料'}
        open={modalVisible}
        onCancel={closeModal}
        footer={null}
        width={760}
      >
        <Form
          form={form}
          layout="horizontal"
          labelCol={{ span: 8 }}
          wrapperCol={{ span: 16 }}
          onFinish={saveReagent}
        >
          
          <Form.Item
            name="reagent_code"
            label="物料编码"
            rules={[{ required: true, message: '请输入物料编码' }]}
          >
            <Input placeholder="请输入物料编码" />
          </Form.Item>

          <Form.Item
            name="reagent_name"
            label="物料名称"
            rules={[{ required: true, message: '请输入物料名称' }]}
          >
            <Input placeholder="请输入物料名称" />
          </Form.Item>

          <Form.Item
            name="brand_name"
            label="品牌"
          >
            <Input placeholder="请输入品牌" />
          </Form.Item>

          <Form.Item
            name="spec"
            label="规格"
          >
            <Input placeholder="请输入规格" />
          </Form.Item>

          <Form.Item
            name="lot_no"
            label="批次"
          >
            <Input placeholder="请输入批次（可选）" />
          </Form.Item>

          <Form.Item
            name="enable_status"
            label="状态"
            rules={[{ required: true, message: '请选择状态' }]}
          >
            <Radio.Group>
              <Radio value={1}>启用</Radio>
              <Radio value={0}>停用</Radio>
            </Radio.Group>
          </Form.Item>

          

          

          <Form.Item
            name="description"
            label="描述"
          >
            <TextArea rows={3} placeholder="请输入描述信息（可选）" />
          </Form.Item>

          <Form.Item style={{ textAlign: 'right', marginBottom: 0 }}>
            <Space>
              <Button onClick={closeModal}>
                取消
              </Button>
              <Button type="primary" htmlType="submit" loading={loading}>
                {editingReagent ? '更新' : '添加'}
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  )
}

export default ReagentManagement