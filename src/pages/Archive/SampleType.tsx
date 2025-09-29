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
  Typography,
  Tag
} from 'antd'
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons'
import type { ColumnsType } from 'antd/es/table'
import type { SampleType } from '../../types'

const { Title } = Typography
const { Option } = Select

/**
 * 样本类型管理组件
 * 提供样本类型的增删改查功能
 */
const SampleTypeManagement: React.FC = () => {
  const [sampleTypes, setSampleTypes] = useState<SampleType[]>([])
  const [loading, setLoading] = useState(false)
  const [modalVisible, setModalVisible] = useState(false)
  const [editingType, setEditingType] = useState<SampleType | null>(null)
  const [form] = Form.useForm()

  // 模拟API数据
  const mockSampleTypes: SampleType[] = [
    {
      id: '1',
      name: '血液',
      code: 'BLOOD',
      category: '临床样本',
      description: '全血、血清、血浆等血液样本',
      storageCondition: '-80°C',
      processingTime: 24,
      isActive: true,
      createdAt: '2024-01-15',
      updatedAt: '2024-01-15'
    },
    {
      id: '2',
      name: '唾液',
      code: 'SALIVA',
      category: '临床样本',
      description: '口腔唾液样本',
      storageCondition: '4°C',
      processingTime: 12,
      isActive: true,
      createdAt: '2024-01-16',
      updatedAt: '2024-01-16'
    },
    {
      id: '3',
      name: '粪便',
      code: 'STOOL',
      category: '临床样本',
      description: '粪便微生物组样本',
      storageCondition: '-20°C',
      processingTime: 48,
      isActive: true,
      createdAt: '2024-01-17',
      updatedAt: '2024-01-17'
    },
    {
      id: '4',
      name: '土壤',
      code: 'SOIL',
      category: '环境样本',
      description: '土壤微生物组样本',
      storageCondition: '-20°C',
      processingTime: 72,
      isActive: false,
      createdAt: '2024-01-18',
      updatedAt: '2024-01-18'
    }
  ]

  /**
   * 获取样本类型列表
   */
  const fetchSampleTypes = async () => {
    setLoading(true)
    try {
      // 模拟API调用
      await new Promise(resolve => setTimeout(resolve, 500))
      setSampleTypes(mockSampleTypes)
    } catch (error) {
      message.error('获取样本类型列表失败')
    } finally {
      setLoading(false)
    }
  }

  /**
   * 保存样本类型
   * @param values 表单数据
   */
  const handleSave = async (values: any) => {
    try {
      if (editingType) {
        // 编辑模式
        const updatedType = {
          ...editingType,
          ...values,
          updatedAt: new Date().toISOString().split('T')[0]
        }
        setSampleTypes(prev => 
          prev.map(type => type.id === editingType.id ? updatedType : type)
        )
        message.success('样本类型更新成功')
      } else {
        // 新增模式
        const newType: SampleType = {
          id: Date.now().toString(),
          ...values,
          createdAt: new Date().toISOString().split('T')[0],
          updatedAt: new Date().toISOString().split('T')[0]
        }
        setSampleTypes(prev => [...prev, newType])
        message.success('样本类型创建成功')
      }
      
      setModalVisible(false)
      setEditingType(null)
      form.resetFields()
    } catch (error) {
      message.error('保存失败')
    }
  }

  /**
   * 删除样本类型
   * @param id 样本类型ID
   */
  const handleDelete = async (id: string) => {
    try {
      setSampleTypes(prev => prev.filter(type => type.id !== id))
      message.success('删除成功')
    } catch (error) {
      message.error('删除失败')
    }
  }

  /**
   * 打开编辑模态框
   * @param type 要编辑的样本类型
   */
  const handleEdit = (type: SampleType) => {
    setEditingType(type)
    form.setFieldsValue(type)
    setModalVisible(true)
  }

  /**
   * 打开新增模态框
   */
  const handleAdd = () => {
    setEditingType(null)
    form.resetFields()
    setModalVisible(true)
  }

  // 表格列定义
  const columns: ColumnsType<SampleType> = [
    {
      title: '样本类型名称',
      dataIndex: 'name',
      key: 'name',
      width: 120,
    },
    {
      title: '类型编码',
      dataIndex: 'code',
      key: 'code',
      width: 100,
    },
    {
      title: '分类',
      dataIndex: 'category',
      key: 'category',
      width: 100,
    },
    {
      title: '描述',
      dataIndex: 'description',
      key: 'description',
      ellipsis: true,
    },
    {
      title: '存储条件',
      dataIndex: 'storageCondition',
      key: 'storageCondition',
      width: 100,
    },
    {
      title: '处理时间(小时)',
      dataIndex: 'processingTime',
      key: 'processingTime',
      width: 120,
    },
    {
      title: '状态',
      dataIndex: 'isActive',
      key: 'isActive',
      width: 80,
      render: (isActive: boolean) => (
        <Tag color={isActive ? 'green' : 'red'}>
          {isActive ? '启用' : '禁用'}
        </Tag>
      ),
    },
    {
      title: '创建时间',
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: 100,
    },
    {
      title: '操作',
      key: 'action',
      width: 120,
      render: (_, record) => (
        <Space size="small">
          <Button
            type="link"
            size="small"
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
          >
            编辑
          </Button>
          <Popconfirm
            title="确定要删除这个样本类型吗？"
            onConfirm={() => handleDelete(record.id)}
            okText="确定"
            cancelText="取消"
          >
            <Button
              type="link"
              size="small"
              danger
              icon={<DeleteOutlined />}
            >
              删除
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ]

  useEffect(() => {
    fetchSampleTypes()
  }, [])

  return (
    <div>
      <Title level={3} style={{ marginBottom: 24 }}>
        样本类型管理
      </Title>
      
      <Card className="content-card">
        <div style={{ marginBottom: 16 }}>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={handleAdd}
          >
            新增样本类型
          </Button>
        </div>

        <Table
          columns={columns}
          dataSource={sampleTypes}
          rowKey="id"
          loading={loading}
          pagination={{
            total: sampleTypes.length,
            pageSize: 10,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total) => `共 ${total} 条记录`,
          }}
          scroll={{ x: 1000 }}
        />
      </Card>

      <Modal
        title={editingType ? '编辑样本类型' : '新增样本类型'}
        open={modalVisible}
        onCancel={() => {
          setModalVisible(false)
          setEditingType(null)
          form.resetFields()
        }}
        footer={null}
        width={600}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSave}
        >
          <Form.Item
            name="name"
            label="样本类型名称"
            rules={[{ required: true, message: '请输入样本类型名称' }]}
          >
            <Input placeholder="请输入样本类型名称" />
          </Form.Item>

          <Form.Item
            name="code"
            label="类型编码"
            rules={[{ required: true, message: '请输入类型编码' }]}
          >
            <Input placeholder="请输入类型编码" />
          </Form.Item>

          <Form.Item
            name="category"
            label="分类"
            rules={[{ required: true, message: '请选择分类' }]}
          >
            <Select placeholder="请选择分类">
              <Option value="临床样本">临床样本</Option>
              <Option value="环境样本">环境样本</Option>
              <Option value="食品样本">食品样本</Option>
              <Option value="其他">其他</Option>
            </Select>
          </Form.Item>

          <Form.Item
            name="description"
            label="描述"
          >
            <Input.TextArea 
              placeholder="请输入描述信息" 
              rows={3}
            />
          </Form.Item>

          <Form.Item
            name="storageCondition"
            label="存储条件"
            rules={[{ required: true, message: '请输入存储条件' }]}
          >
            <Select placeholder="请选择存储条件">
              <Option value="室温">室温</Option>
              <Option value="4°C">4°C</Option>
              <Option value="-20°C">-20°C</Option>
              <Option value="-80°C">-80°C</Option>
            </Select>
          </Form.Item>

          <Form.Item
            name="processingTime"
            label="处理时间(小时)"
            rules={[{ required: true, message: '请输入处理时间' }]}
          >
            <Input type="number" placeholder="请输入处理时间" />
          </Form.Item>

          <Form.Item
            name="isActive"
            label="状态"
            rules={[{ required: true, message: '请选择状态' }]}
          >
            <Select placeholder="请选择状态">
              <Option value={true}>启用</Option>
              <Option value={false}>禁用</Option>
            </Select>
          </Form.Item>

          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit">
                保存
              </Button>
              <Button onClick={() => {
                setModalVisible(false)
                setEditingType(null)
                form.resetFields()
              }}>
                取消
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  )
}

export default SampleTypeManagement