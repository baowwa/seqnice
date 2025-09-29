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
  DatePicker,
  message,
  Popconfirm,
  Typography,
  Tag
} from 'antd'
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons'
import type { ColumnsType } from 'antd/es/table'
import type { Equipment } from '../../types'
import dayjs from 'dayjs'

const { Title } = Typography
const { Option } = Select

/**
 * 设备管理组件
 * 提供设备的增删改查功能
 */
const EquipmentManagement: React.FC = () => {
  const [equipment, setEquipment] = useState<Equipment[]>([])
  const [loading, setLoading] = useState(false)
  const [modalVisible, setModalVisible] = useState(false)
  const [editingEquipment, setEditingEquipment] = useState<Equipment | null>(null)
  const [form] = Form.useForm()

  // 模拟API数据
  const mockEquipment: Equipment[] = [
    {
      id: '1',
      name: 'Illumina NovaSeq 6000',
      model: 'NovaSeq 6000',
      manufacturer: 'Illumina',
      serialNumber: 'NS500001',
      location: '测序实验室A',
      status: 'running',
      purchaseDate: '2023-01-15',
      warrantyExpiry: '2026-01-15',
      lastMaintenance: '2024-01-10',
      nextMaintenance: '2024-04-10',
      specifications: {
        throughput: '6 Tb',
        readLength: '2x150 bp',
        runTime: '13-44 hours'
      },
      createdAt: '2024-01-15',
      updatedAt: '2024-01-15'
    },
    {
      id: '2',
      name: 'Illumina MiSeq',
      model: 'MiSeq',
      manufacturer: 'Illumina',
      serialNumber: 'MS001234',
      location: '测序实验室B',
      status: 'idle',
      purchaseDate: '2022-06-20',
      warrantyExpiry: '2025-06-20',
      lastMaintenance: '2024-01-05',
      nextMaintenance: '2024-04-05',
      specifications: {
        throughput: '15 Gb',
        readLength: '2x300 bp',
        runTime: '4-55 hours'
      },
      createdAt: '2024-01-16',
      updatedAt: '2024-01-16'
    },
    {
      id: '3',
      name: 'Applied Biosystems 3500',
      model: '3500 Genetic Analyzer',
      manufacturer: 'Applied Biosystems',
      serialNumber: 'AB350001',
      location: '分子实验室',
      status: 'maintenance',
      purchaseDate: '2021-03-10',
      warrantyExpiry: '2024-03-10',
      lastMaintenance: '2024-01-20',
      nextMaintenance: '2024-04-20',
      specifications: {
        capillaries: '8',
        readLength: '900 bp',
        runTime: '1-3 hours'
      },
      createdAt: '2024-01-17',
      updatedAt: '2024-01-17'
    },
    {
      id: '4',
      name: 'Thermo Fisher Ion Torrent',
      model: 'Ion GeneStudio S5',
      manufacturer: 'Thermo Fisher',
      serialNumber: 'IT550001',
      location: '测序实验室C',
      status: 'error',
      purchaseDate: '2023-08-15',
      warrantyExpiry: '2026-08-15',
      lastMaintenance: '2024-01-15',
      nextMaintenance: '2024-04-15',
      specifications: {
        throughput: '50 Gb',
        readLength: '600 bp',
        runTime: '2-7 hours'
      },
      createdAt: '2024-01-18',
      updatedAt: '2024-01-18'
    }
  ]

  /**
   * 获取设备列表
   */
  const fetchEquipment = async () => {
    setLoading(true)
    try {
      // 模拟API调用
      await new Promise(resolve => setTimeout(resolve, 500))
      setEquipment(mockEquipment)
    } catch (error) {
      message.error('获取设备列表失败')
    } finally {
      setLoading(false)
    }
  }

  /**
   * 保存设备信息
   * @param values 表单数据
   */
  const handleSave = async (values: any) => {
    try {
      const formattedValues = {
        ...values,
        purchaseDate: values.purchaseDate?.format('YYYY-MM-DD'),
        warrantyExpiry: values.warrantyExpiry?.format('YYYY-MM-DD'),
        lastMaintenance: values.lastMaintenance?.format('YYYY-MM-DD'),
        nextMaintenance: values.nextMaintenance?.format('YYYY-MM-DD'),
      }

      if (editingEquipment) {
        // 编辑模式
        const updatedEquipment = {
          ...editingEquipment,
          ...formattedValues,
          updatedAt: new Date().toISOString().split('T')[0]
        }
        setEquipment(prev => 
          prev.map(item => item.id === editingEquipment.id ? updatedEquipment : item)
        )
        message.success('设备信息更新成功')
      } else {
        // 新增模式
        const newEquipment: Equipment = {
          id: Date.now().toString(),
          ...formattedValues,
          specifications: formattedValues.specifications || {},
          createdAt: new Date().toISOString().split('T')[0],
          updatedAt: new Date().toISOString().split('T')[0]
        }
        setEquipment(prev => [...prev, newEquipment])
        message.success('设备创建成功')
      }
      
      setModalVisible(false)
      setEditingEquipment(null)
      form.resetFields()
    } catch (error) {
      message.error('保存失败')
    }
  }

  /**
   * 删除设备
   * @param id 设备ID
   */
  const handleDelete = async (id: string) => {
    try {
      setEquipment(prev => prev.filter(item => item.id !== id))
      message.success('删除成功')
    } catch (error) {
      message.error('删除失败')
    }
  }

  /**
   * 打开编辑模态框
   * @param item 要编辑的设备
   */
  const handleEdit = (item: Equipment) => {
    setEditingEquipment(item)
    const formValues = {
      ...item,
      purchaseDate: item.purchaseDate ? dayjs(item.purchaseDate) : null,
      warrantyExpiry: item.warrantyExpiry ? dayjs(item.warrantyExpiry) : null,
      lastMaintenance: item.lastMaintenance ? dayjs(item.lastMaintenance) : null,
      nextMaintenance: item.nextMaintenance ? dayjs(item.nextMaintenance) : null,
    }
    form.setFieldsValue(formValues)
    setModalVisible(true)
  }

  /**
   * 打开新增模态框
   */
  const handleAdd = () => {
    setEditingEquipment(null)
    form.resetFields()
    setModalVisible(true)
  }

  /**
   * 获取状态标签颜色
   * @param status 设备状态
   */
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'running': return 'green'
      case 'idle': return 'blue'
      case 'maintenance': return 'orange'
      case 'error': return 'red'
      default: return 'default'
    }
  }

  /**
   * 获取状态文本
   * @param status 设备状态
   */
  const getStatusText = (status: string) => {
    switch (status) {
      case 'running': return '运行中'
      case 'idle': return '空闲'
      case 'maintenance': return '维护中'
      case 'error': return '故障'
      default: return '未知'
    }
  }

  // 表格列定义
  const columns: ColumnsType<Equipment> = [
    {
      title: '设备名称',
      dataIndex: 'name',
      key: 'name',
      width: 150,
    },
    {
      title: '型号',
      dataIndex: 'model',
      key: 'model',
      width: 120,
    },
    {
      title: '制造商',
      dataIndex: 'manufacturer',
      key: 'manufacturer',
      width: 120,
    },
    {
      title: '序列号',
      dataIndex: 'serialNumber',
      key: 'serialNumber',
      width: 120,
    },
    {
      title: '位置',
      dataIndex: 'location',
      key: 'location',
      width: 120,
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: (status: string) => (
        <Tag color={getStatusColor(status)}>
          {getStatusText(status)}
        </Tag>
      ),
    },
    {
      title: '购买日期',
      dataIndex: 'purchaseDate',
      key: 'purchaseDate',
      width: 100,
    },
    {
      title: '保修到期',
      dataIndex: 'warrantyExpiry',
      key: 'warrantyExpiry',
      width: 100,
    },
    {
      title: '下次维护',
      dataIndex: 'nextMaintenance',
      key: 'nextMaintenance',
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
            title="确定要删除这个设备吗？"
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
    fetchEquipment()
  }, [])

  return (
    <div>
      <Title level={3} style={{ marginBottom: 24 }}>
        设备管理
      </Title>
      
      <Card className="content-card">
        <div style={{ marginBottom: 16 }}>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={handleAdd}
          >
            新增设备
          </Button>
        </div>

        <Table
          columns={columns}
          dataSource={equipment}
          rowKey="id"
          loading={loading}
          pagination={{
            total: equipment.length,
            pageSize: 10,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total) => `共 ${total} 条记录`,
          }}
          scroll={{ x: 1200 }}
        />
      </Card>

      <Modal
        title={editingEquipment ? '编辑设备' : '新增设备'}
        open={modalVisible}
        onCancel={() => {
          setModalVisible(false)
          setEditingEquipment(null)
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
            label="设备名称"
            rules={[{ required: true, message: '请输入设备名称' }]}
          >
            <Input placeholder="请输入设备名称" />
          </Form.Item>

          <Form.Item
            name="model"
            label="设备型号"
            rules={[{ required: true, message: '请输入设备型号' }]}
          >
            <Input placeholder="请输入设备型号" />
          </Form.Item>

          <Form.Item
            name="manufacturer"
            label="制造商"
            rules={[{ required: true, message: '请输入制造商' }]}
          >
            <Input placeholder="请输入制造商" />
          </Form.Item>

          <Form.Item
            name="serialNumber"
            label="序列号"
            rules={[{ required: true, message: '请输入序列号' }]}
          >
            <Input placeholder="请输入序列号" />
          </Form.Item>

          <Form.Item
            name="location"
            label="设备位置"
            rules={[{ required: true, message: '请输入设备位置' }]}
          >
            <Input placeholder="请输入设备位置" />
          </Form.Item>

          <Form.Item
            name="status"
            label="设备状态"
            rules={[{ required: true, message: '请选择设备状态' }]}
          >
            <Select placeholder="请选择设备状态">
              <Option value="running">运行中</Option>
              <Option value="idle">空闲</Option>
              <Option value="maintenance">维护中</Option>
              <Option value="error">故障</Option>
            </Select>
          </Form.Item>

          <Form.Item
            name="purchaseDate"
            label="购买日期"
            rules={[{ required: true, message: '请选择购买日期' }]}
          >
            <DatePicker 
              placeholder="请选择购买日期" 
              style={{ width: '100%' }}
            />
          </Form.Item>

          <Form.Item
            name="warrantyExpiry"
            label="保修到期日期"
          >
            <DatePicker 
              placeholder="请选择保修到期日期" 
              style={{ width: '100%' }}
            />
          </Form.Item>

          <Form.Item
            name="lastMaintenance"
            label="上次维护日期"
          >
            <DatePicker 
              placeholder="请选择上次维护日期" 
              style={{ width: '100%' }}
            />
          </Form.Item>

          <Form.Item
            name="nextMaintenance"
            label="下次维护日期"
          >
            <DatePicker 
              placeholder="请选择下次维护日期" 
              style={{ width: '100%' }}
            />
          </Form.Item>

          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit">
                保存
              </Button>
              <Button onClick={() => {
                setModalVisible(false)
                setEditingEquipment(null)
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

export default EquipmentManagement