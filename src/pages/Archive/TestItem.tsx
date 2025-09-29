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
  InputNumber,
  message,
  Popconfirm,
  Typography,
  Tag
} from 'antd'
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons'
import type { ColumnsType } from 'antd/es/table'
import type { TestItem } from '../../types'

const { Title } = Typography
const { Option } = Select

/**
 * 检测项目管理组件
 * 提供检测项目的增删改查功能
 */
const TestItemManagement: React.FC = () => {
  const [testItems, setTestItems] = useState<TestItem[]>([])
  const [loading, setLoading] = useState(false)
  const [modalVisible, setModalVisible] = useState(false)
  const [editingItem, setEditingItem] = useState<TestItem | null>(null)
  const [form] = Form.useForm()

  // 模拟API数据
  const mockTestItems: TestItem[] = [
    {
      id: '1',
      name: '16S rRNA基因测序',
      code: '16S_SEQ',
      category: '微生物多样性',
      description: '细菌16S rRNA基因V3-V4区测序分析',
      price: 800,
      duration: 7,
      sampleTypes: ['血液', '粪便', '唾液'],
      methodology: 'Illumina NovaSeq',
      isActive: true,
      createdAt: '2024-01-15',
      updatedAt: '2024-01-15'
    },
    {
      id: '2',
      name: 'ITS基因测序',
      code: 'ITS_SEQ',
      category: '微生物多样性',
      description: '真菌ITS1-ITS2区域测序分析',
      price: 900,
      duration: 7,
      sampleTypes: ['土壤', '粪便'],
      methodology: 'Illumina MiSeq',
      isActive: true,
      createdAt: '2024-01-16',
      updatedAt: '2024-01-16'
    },
    {
      id: '3',
      name: '宏基因组测序',
      code: 'WGS_META',
      category: '功能基因组',
      description: '全基因组鸟枪法测序',
      price: 2500,
      duration: 14,
      sampleTypes: ['粪便', '土壤'],
      methodology: 'Illumina NovaSeq',
      isActive: true,
      createdAt: '2024-01-17',
      updatedAt: '2024-01-17'
    },
    {
      id: '4',
      name: '代谢组学分析',
      code: 'METABOLOME',
      category: '代谢分析',
      description: '非靶向代谢组学分析',
      price: 3000,
      duration: 21,
      sampleTypes: ['血液', '尿液'],
      methodology: 'LC-MS/MS',
      isActive: false,
      createdAt: '2024-01-18',
      updatedAt: '2024-01-18'
    }
  ]

  /**
   * 获取检测项目列表
   */
  const fetchTestItems = async () => {
    setLoading(true)
    try {
      // 模拟API调用
      await new Promise(resolve => setTimeout(resolve, 500))
      setTestItems(mockTestItems)
    } catch (error) {
      message.error('获取检测项目列表失败')
    } finally {
      setLoading(false)
    }
  }

  /**
   * 保存检测项目
   * @param values 表单数据
   */
  const handleSave = async (values: any) => {
    try {
      if (editingItem) {
        // 编辑模式
        const updatedItem = {
          ...editingItem,
          ...values,
          updatedAt: new Date().toISOString().split('T')[0]
        }
        setTestItems(prev => 
          prev.map(item => item.id === editingItem.id ? updatedItem : item)
        )
        message.success('检测项目更新成功')
      } else {
        // 新增模式
        const newItem: TestItem = {
          id: Date.now().toString(),
          ...values,
          createdAt: new Date().toISOString().split('T')[0],
          updatedAt: new Date().toISOString().split('T')[0]
        }
        setTestItems(prev => [...prev, newItem])
        message.success('检测项目创建成功')
      }
      
      setModalVisible(false)
      setEditingItem(null)
      form.resetFields()
    } catch (error) {
      message.error('保存失败')
    }
  }

  /**
   * 删除检测项目
   * @param id 检测项目ID
   */
  const handleDelete = async (id: string) => {
    try {
      setTestItems(prev => prev.filter(item => item.id !== id))
      message.success('删除成功')
    } catch (error) {
      message.error('删除失败')
    }
  }

  /**
   * 打开编辑模态框
   * @param item 要编辑的检测项目
   */
  const handleEdit = (item: TestItem) => {
    setEditingItem(item)
    form.setFieldsValue(item)
    setModalVisible(true)
  }

  /**
   * 打开新增模态框
   */
  const handleAdd = () => {
    setEditingItem(null)
    form.resetFields()
    setModalVisible(true)
  }

  // 表格列定义
  const columns: ColumnsType<TestItem> = [
    {
      title: '项目名称',
      dataIndex: 'name',
      key: 'name',
      width: 150,
    },
    {
      title: '项目编码',
      dataIndex: 'code',
      key: 'code',
      width: 120,
    },
    {
      title: '分类',
      dataIndex: 'category',
      key: 'category',
      width: 120,
    },
    {
      title: '描述',
      dataIndex: 'description',
      key: 'description',
      ellipsis: true,
    },
    {
      title: '价格(元)',
      dataIndex: 'price',
      key: 'price',
      width: 100,
      render: (price: number) => `¥${price}`,
    },
    {
      title: '周期(天)',
      dataIndex: 'duration',
      key: 'duration',
      width: 80,
    },
    {
      title: '适用样本',
      dataIndex: 'sampleTypes',
      key: 'sampleTypes',
      width: 150,
      render: (sampleTypes: string[]) => (
        <div>
          {sampleTypes.map(type => (
            <Tag key={type} size="small" style={{ marginBottom: 2 }}>
              {type}
            </Tag>
          ))}
        </div>
      ),
    },
    {
      title: '检测方法',
      dataIndex: 'methodology',
      key: 'methodology',
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
            title="确定要删除这个检测项目吗？"
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
    fetchTestItems()
  }, [])

  return (
    <div>
      <Title level={3} style={{ marginBottom: 24 }}>
        检测项目管理
      </Title>
      
      <Card className="content-card">
        <div style={{ marginBottom: 16 }}>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={handleAdd}
          >
            新增检测项目
          </Button>
        </div>

        <Table
          columns={columns}
          dataSource={testItems}
          rowKey="id"
          loading={loading}
          pagination={{
            total: testItems.length,
            pageSize: 10,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total) => `共 ${total} 条记录`,
          }}
          scroll={{ x: 1200 }}
        />
      </Card>

      <Modal
        title={editingItem ? '编辑检测项目' : '新增检测项目'}
        open={modalVisible}
        onCancel={() => {
          setModalVisible(false)
          setEditingItem(null)
          form.resetFields()
        }}
        footer={null}
        width={700}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSave}
        >
          <Form.Item
            name="name"
            label="项目名称"
            rules={[{ required: true, message: '请输入项目名称' }]}
          >
            <Input placeholder="请输入项目名称" />
          </Form.Item>

          <Form.Item
            name="code"
            label="项目编码"
            rules={[{ required: true, message: '请输入项目编码' }]}
          >
            <Input placeholder="请输入项目编码" />
          </Form.Item>

          <Form.Item
            name="category"
            label="分类"
            rules={[{ required: true, message: '请选择分类' }]}
          >
            <Select placeholder="请选择分类">
              <Option value="微生物多样性">微生物多样性</Option>
              <Option value="功能基因组">功能基因组</Option>
              <Option value="代谢分析">代谢分析</Option>
              <Option value="蛋白质组">蛋白质组</Option>
              <Option value="其他">其他</Option>
            </Select>
          </Form.Item>

          <Form.Item
            name="description"
            label="描述"
          >
            <Input.TextArea 
              placeholder="请输入项目描述" 
              rows={3}
            />
          </Form.Item>

          <Form.Item
            name="price"
            label="价格(元)"
            rules={[{ required: true, message: '请输入价格' }]}
          >
            <InputNumber 
              placeholder="请输入价格" 
              min={0}
              style={{ width: '100%' }}
            />
          </Form.Item>

          <Form.Item
            name="duration"
            label="检测周期(天)"
            rules={[{ required: true, message: '请输入检测周期' }]}
          >
            <InputNumber 
              placeholder="请输入检测周期" 
              min={1}
              style={{ width: '100%' }}
            />
          </Form.Item>

          <Form.Item
            name="sampleTypes"
            label="适用样本类型"
            rules={[{ required: true, message: '请选择适用样本类型' }]}
          >
            <Select 
              mode="multiple" 
              placeholder="请选择适用样本类型"
              allowClear
            >
              <Option value="血液">血液</Option>
              <Option value="唾液">唾液</Option>
              <Option value="粪便">粪便</Option>
              <Option value="土壤">土壤</Option>
              <Option value="尿液">尿液</Option>
              <Option value="其他">其他</Option>
            </Select>
          </Form.Item>

          <Form.Item
            name="methodology"
            label="检测方法"
            rules={[{ required: true, message: '请输入检测方法' }]}
          >
            <Input placeholder="请输入检测方法" />
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
                setEditingItem(null)
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

export default TestItemManagement