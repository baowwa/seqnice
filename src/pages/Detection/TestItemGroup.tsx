import React, { useState, useEffect } from 'react'
import { Card, Table, Button, Space, Modal, Form, Input, Select, Tag, Popconfirm, message } from 'antd'
import type { ColumnsType } from 'antd/es/table'
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons'

const { Option } = Select

/**
 * 检测项目分组管理页面
 * 负责管理分组的增删改查，仅包含分组编码、分组名称、描述、状态四个字段
 */
interface TestItemGroup {
  /** 分组唯一标识 */
  id: string
  /** 分组编码 */
  code: string
  /** 分组名称 */
  name: string
  /** 分组描述 */
  description: string
  /** 分组状态 */
  status: 'active' | 'inactive'
}
// 表单值类型，保证status为联合类型
type GroupFormValues = {
  code: string
  name: string
  description: string
  status: 'active' | 'inactive'
}
// 规范化从localStorage读取的分组数据，确保status为联合类型
const normalizeGroups = (arr: any[]): TestItemGroup[] => {
  if (!Array.isArray(arr)) return []
  return arr.map((g: any) => ({
    id: String(g.id ?? `G-${Math.random().toString(36).slice(2, 8)}`),
    code: String(g.code ?? ''),
    name: String(g.name ?? ''),
    description: String(g.description ?? ''),
    status: (g.status === 'inactive' ? 'inactive' : 'active') as 'active' | 'inactive'
  }))
}

/**
 * 检测项目分组管理组件
 * @returns React.FC 组件
 */
const TestItemGroupManagement: React.FC = () => {
  const [groups, setGroups] = useState<TestItemGroup[]>([
    { id: 'G-001', code: 'TP-GRP-01', name: '肿瘤标志物', description: '肿瘤相关标志物检测分组', status: 'active' },
    { id: 'G-002', code: 'TP-GRP-02', name: '遗传学检测', description: '遗传性疾病相关基因检测分组', status: 'active' },
    { id: 'G-003', code: 'TP-GRP-03', name: '感染性疾病', description: '病原体检测与鉴定分组', status: 'inactive' }
  ])
  // 在组件挂载时加载已保存的分组
  useEffect(() => {
    try {
      const saved = localStorage.getItem('testItemGroups')
      if (saved) {
        const parsed = JSON.parse(saved)
        const normalized = normalizeGroups(parsed)
        if (normalized.length > 0) {
          setGroups(normalized)
        }
      }
    } catch (e) {
      // 忽略解析错误，继续使用默认分组
    }
  }, [])
  // 在分组变化时写入localStorage，供其他页面读取
  useEffect(() => {
    try {
      localStorage.setItem('testItemGroups', JSON.stringify(groups))
    } catch (e) {
      // 忽略写入错误
    }
  }, [groups])

  const [modalVisible, setModalVisible] = useState(false)
  const [editingGroup, setEditingGroup] = useState<TestItemGroup | null>(null)
  const [form] = Form.useForm<GroupFormValues>()

  /**
   * 打开新增/编辑弹窗
   * @param group 要编辑的分组数据，新增时传入null
   * @returns void 无返回值
   */
  const handleOpenModal = (group: TestItemGroup | null = null): void => {
    setEditingGroup(group)
    setModalVisible(true)
    if (group) {
      form.setFieldsValue(group)
    } else {
      form.resetFields()
    }
  }

  /**
   * 保存分组数据（新增或编辑）
   * @param values 表单提交的分组数据
   * @returns void 无返回值
   */
  const handleSave = (values: GroupFormValues): void => {
    if (editingGroup) {
      // 编辑
      const updated = groups.map(g => (g.id === editingGroup.id ? { ...editingGroup, ...values } : g))
      setGroups(updated)
      message.success('分组更新成功')
    } else {
      // 新增
      const newGroup: TestItemGroup = {
        id: `G-${Math.random().toString(36).slice(2, 8)}`,
        ...values
      }
      setGroups([newGroup, ...groups])
      message.success('分组创建成功')
    }
    setModalVisible(false)
    setEditingGroup(null)
    form.resetFields()
  }

  /**
   * 删除分组
   * @param id 分组ID
   * @returns void 无返回值
   */
  const handleDelete = (id: string): void => {
    setGroups(groups.filter(g => g.id !== id))
    message.success('分组已删除')
  }

  /**
   * 切换分组状态
   * @param id 分组ID
   * @returns void 无返回值
   */
  const handleToggleStatus = (id: string): void => {
    const updated = groups.map(g => (g.id === id ? { ...g, status: g.status === 'active' ? 'inactive' : 'active' } : g))
    setGroups(updated)
  }

  const columns: ColumnsType<TestItemGroup> = [
    { 
      title: '分组编码', 
      dataIndex: 'code', 
      key: 'code',
      width: 120,
      ellipsis: true
    },
    { 
      title: '分组名称', 
      dataIndex: 'name', 
      key: 'name',
      width: 150,
      ellipsis: true
    },
    { 
      title: '描述', 
      dataIndex: 'description', 
      key: 'description',
      width: 200,
      ellipsis: true
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 80,
      render: (status: TestItemGroup['status']) => (
        <Tag color={status === 'active' ? 'green' : 'red'}>{status === 'active' ? '启用' : '停用'}</Tag>
      )
    },
    {
      title: '操作',
      key: 'action',
      width: 150,
      fixed: 'right',
      render: (_, record) => (
        <Space>
          <Button size="small" type="link" icon={<EditOutlined />} onClick={() => handleOpenModal(record)}>编辑</Button>
          <Button size="small" type="link" onClick={() => handleToggleStatus(record.id)}>
            {record.status === 'active' ? '停用' : '启用'}
          </Button>
          <Popconfirm title="确认删除该分组？" onConfirm={() => handleDelete(record.id)}>
            <Button size="small" danger type="link" icon={<DeleteOutlined />}>删除</Button>
          </Popconfirm>
        </Space>
      )
    }
  ]

  return (
    <div>
      <Card title="检测项目分组">
        <Space style={{ marginBottom: 16 }}>
          <Button type="primary" icon={<PlusOutlined />} onClick={() => handleOpenModal(null)}>新增分组</Button>
        </Space>
        <Table 
          rowKey="id" 
          columns={columns} 
          dataSource={groups} 
          pagination={{ pageSize: 8 }}
          scroll={{ x: 700 }}
        />
      </Card>

      <Modal
        title={editingGroup ? '编辑分组' : '新增分组'}
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        onOk={() => form.submit()}
        destroyOnClose
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSave}
          initialValues={{ status: 'active' }}
        >
          <Form.Item label="分组编码" name="code" rules={[{ required: true, message: '请输入分组编码' }]}> 
            <Input placeholder="例如：TP-GRP-01" />
          </Form.Item>
          <Form.Item label="分组名称" name="name" rules={[{ required: true, message: '请输入分组名称' }]}> 
            <Input placeholder="例如：肿瘤标志物" />
          </Form.Item>
          <Form.Item label="描述" name="description"> 
            <Input.TextArea rows={3} placeholder="分组用途或说明" />
          </Form.Item>
          <Form.Item label="状态" name="status" rules={[{ required: true }]}> 
            <Select>
              <Option value="active">启用</Option>
              <Option value="inactive">停用</Option>
            </Select>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  )
}

export default TestItemGroupManagement