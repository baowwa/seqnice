import React, { useState, useEffect } from 'react'
import { Card, Table, Button, Space, Modal, Form, Input, Select, Tag, Popconfirm, message } from 'antd'
import type { ColumnsType } from 'antd/es/table'
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons'

const { Option } = Select

/** 分组轻量类型，仅用于选择与展示 */
interface TestItemGroupLite {
  id: string
  name: string
  status: 'active' | 'inactive'
}

/**
 * 检测项目页面（简化版）
 * 仅保留基础字段：编码、名称、简称、英文名称、描述、状态；不包含价格与复杂关联关系
 */
interface BasicTestItem {
  /** 唯一标识 */
  id: string
  /** 检测项目编码 */
  code: string
  /** 检测项目名称 */
  name: string
  /** 检测项目简称 */
  shortName: string
  /** 英文名称 */
  englishName: string
  /** 检测项目描述 */
  description: string
  /** 状态 */
  status: 'active' | 'inactive'
  /** 分组ID */
  groupId?: string
}

/**
 * 检测项目基础管理组件
 * @returns React.FC 组件
 */
const TestItemBasicManagement: React.FC = () => {
  const [items, setItems] = useState<BasicTestItem[]>([
    { id: 'T-001', code: 'TP001', name: '肺癌基因检测', shortName: '肺癌检测', englishName: 'Lung Cancer Gene Test', description: '用于后续关系绑定', status: 'active', groupId: 'G-001' },
    { id: 'T-002', code: 'TP002', name: '结直肠癌基因检测', shortName: '结直肠检测', englishName: 'Colorectal Cancer Gene Test', description: '用于后续关系绑定', status: 'active', groupId: 'G-002' },
    { id: 'T-003', code: 'TP003', name: '乳腺癌基因检测', shortName: '乳腺检测', englishName: 'Breast Cancer Gene Test', description: '用于后续关系绑定', status: 'inactive', groupId: 'G-003' }
  ])
  // 分组选项
  const [groups, setGroups] = useState<TestItemGroupLite[]>([])
  const [modalVisible, setModalVisible] = useState(false)
  const [editingItem, setEditingItem] = useState<BasicTestItem | null>(null)
  const [form] = Form.useForm()

  /**
   * 加载分组选项（来源于分组管理页写入的localStorage）
   * @returns void 无返回值
   */
  useEffect(() => {
    try {
      const saved = localStorage.getItem('testItemGroups')
      if (saved) {
        const arr = JSON.parse(saved) as any[]
        const normalized: TestItemGroupLite[] = Array.isArray(arr)
          ? arr.map(g => ({ id: String(g.id), name: String(g.name), status: g.status === 'inactive' ? 'inactive' : 'active' }))
          : []
        setGroups(normalized)
      }
    } catch (e) {
      // 忽略
    }
  }, [])

  /**
   * 打开新增/编辑弹窗
   * @param item 要编辑的记录，新增时传null
   * @returns void 无返回值
   */
  const handleOpenModal = (item: BasicTestItem | null = null): void => {
    setEditingItem(item)
    setModalVisible(true)
    if (item) {
      form.setFieldsValue(item)
    } else {
      form.resetFields()
    }
  }

  /**
   * 保存检测项目（新增或编辑）
   * @param values 基础字段数据
   * @returns void 无返回值
   */
  const handleSave = (values: Omit<BasicTestItem, 'id'>): void => {
    if (editingItem) {
      const updated = items.map(i => (i.id === editingItem.id ? { ...editingItem, ...values } : i))
      setItems(updated)
      message.success('检测项目更新成功')
    } else {
      const newItem: BasicTestItem = {
        id: `T-${Math.random().toString(36).slice(2, 8)}`,
        ...values
      }
      setItems([newItem, ...items])
      message.success('检测项目创建成功')
    }
    setModalVisible(false)
    setEditingItem(null)
    form.resetFields()
  }

  /**
   * 删除检测项目
   * @param id 记录ID
   * @returns void 无返回值
   */
  const handleDelete = (id: string): void => {
    setItems(items.filter(i => i.id !== id))
    message.success('检测项目已删除')
  }

  /**
   * 切换状态
   * @param id 记录ID
   * @returns void 无返回值
   */
  const handleToggleStatus = (id: string): void => {
    const updated = items.map(i => (i.id === id ? { ...i, status: i.status === 'active' ? 'inactive' : 'active' } : i))
    setItems(updated)
  }

  const columns: ColumnsType<BasicTestItem> = [
    { 
      title: '检测项目编码', 
      dataIndex: 'code', 
      key: 'code',
      width: 120,
      ellipsis: true
    },
    { 
      title: '检测项目名称', 
      dataIndex: 'name', 
      key: 'name',
      width: 150,
      ellipsis: true
    },
    { 
      title: '简称', 
      dataIndex: 'shortName', 
      key: 'shortName',
      width: 100,
      ellipsis: true
    },
    { 
      title: '英文名称', 
      dataIndex: 'englishName', 
      key: 'englishName',
      width: 200,
      ellipsis: true
    },
    { 
      title: '分组', 
      dataIndex: 'groupId', 
      key: 'groupId',
      width: 100,
      ellipsis: true,
      render: (gid: string | undefined) => {
        const g = groups.find(x => x.id === gid)
        return g ? g.name : '-'
      }
    },
    { 
      title: '描述', 
      dataIndex: 'description', 
      key: 'description',
      width: 150,
      ellipsis: true
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 80,
      render: (status: BasicTestItem['status']) => (
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
          <Popconfirm title="确认删除该项目？" onConfirm={() => handleDelete(record.id)}>
            <Button size="small" danger type="link" icon={<DeleteOutlined />}>删除</Button>
          </Popconfirm>
        </Space>
      )
    }
  ]

  return (
    <div>
      <Card title="检测项目">
        <Space style={{ marginBottom: 16 }}>
          <Button type="primary" icon={<PlusOutlined />} onClick={() => handleOpenModal(null)}>新增检测项目</Button>
        </Space>
        <Table 
          rowKey="id" 
          columns={columns} 
          dataSource={items} 
          pagination={{ pageSize: 8 }}
          scroll={{ x: 1000 }}
        />
      </Card>

      <Modal
        title={editingItem ? '编辑检测项目' : '新增检测项目'}
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
          <Form.Item label="检测项目编码" name="code" rules={[{ required: true, message: '请输入编码' }]}> 
            <Input placeholder="例如：TP001" />
          </Form.Item>
          <Form.Item label="检测项目名称" name="name" rules={[{ required: true, message: '请输入名称' }]}>
            <Input placeholder="例如：肺癌基因检测" />
          </Form.Item>
          <Form.Item label="检测项目简称" name="shortName" rules={[{ required: true, message: '请输入检测项目简称' }]}>
            <Input placeholder="例如：肺癌检测" />
          </Form.Item>
          <Form.Item label="英文名称" name="englishName" rules={[{ required: true, message: '请输入英文名称' }]}>
            <Input placeholder="例如：Lung Cancer Gene Test" />
          </Form.Item>
          <Form.Item label="所属分组" name="groupId" rules={[{ required: true, message: '请选择分组' }]}> 
            <Select placeholder="请选择分组">
              {groups.filter(g => g.status === 'active').map(g => (
                <Option key={g.id} value={g.id}>{g.name}</Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item label="描述" name="description"> 
            <Input.TextArea rows={3} placeholder="项目用途或说明" />
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

export default TestItemBasicManagement