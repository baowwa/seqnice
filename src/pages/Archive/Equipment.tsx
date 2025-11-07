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
import type { Equipment } from '../../types'
// 注：页面不涉及日期选择，移除 dayjs 依赖

const { Title } = Typography
const { Option } = Select

/**
 * 设备档案管理页面组件
 * 功能：提供设备档案的列表展示与新增/编辑（新增页字段按截图规范）
 * 布局：新增/编辑表单采用“字段名在左、组件在右”的左右布局，避免上下堆叠
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
      status: 'in_use',
      lastMaintenance: '2024-01-10',
      nextMaintenance: '2024-04-10',
      specifications: {
        equipmentCode: 'EQ-000001',
        assetNo: 'AS-000001',
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
      status: 'available',
      lastMaintenance: '2024-01-05',
      nextMaintenance: '2024-04-05',
      specifications: {
        equipmentCode: 'EQ-000002',
        assetNo: 'AS-000002',
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
      lastMaintenance: '2024-01-20',
      nextMaintenance: '2024-04-20',
      specifications: {
        equipmentCode: 'EQ-000003',
        assetNo: 'AS-000003',
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
      status: 'offline',
      lastMaintenance: '2024-01-15',
      nextMaintenance: '2024-04-15',
      specifications: {
        equipmentCode: 'EQ-000004',
        assetNo: 'AS-000004',
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
   * @param values 表单数据（新增页字段）
   * @returns void 无返回值
   */
  const handleSave = async (values: any) => {
    try {
      /**
       * 将新增页字段映射到设备列表使用的数据结构
       * 设备名称/型号/品牌/序列号映射到现有字段；启用状态映射到状态
       * 服务器相关信息与资产编号、设备编码存储在 specifications 中
       */
      const mapped = {
        name: values.equipment_name,
        model: values.instrument_model,
        manufacturer: values.brand_no,
        serialNumber: values.sn,
        // 未提供位置字段，保持原值或设为“未填写”
        location: editingEquipment?.location || '未填写',
        // 启用：in_use；停用：offline
        status: (values.enable_status === 1 ? 'in_use' : 'offline') as Equipment['status'],
        specifications: {
          equipmentCode: values.equipment_code,
          assetNo: values.asset_no,
          server: {
            ip: values.equipment_server_ip,
            port: values.equipment_server_port,
            username: values.equipment_server_username,
            password: values.equipment_server_passwd,
          }
        }
      }

      if (editingEquipment) {
        // 编辑模式
        const updatedEquipment = {
          ...editingEquipment,
          ...mapped,
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
          ...mapped,
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
   * @returns void 无返回值
   */
  const handleEdit = (item: Equipment) => {
    setEditingEquipment(item)
    /**
     * 编辑态回填：将现有设备字段映射回新增表单字段
     */
    const formValues = {
      equipment_code: (item as any)?.specifications?.equipmentCode || '',
      equipment_name: item.name || '',
      brand_no: item.manufacturer || '',
      instrument_model: item.model || '',
      asset_no: (item as any)?.specifications?.assetNo || '',
      sn: item.serialNumber || '',
      // in_use/available 视为启用，maintenance/offline 视为停用
      enable_status: ['in_use', 'available'].includes(item.status as any) ? 1 : 0,
      equipment_server_ip: (item as any)?.specifications?.server?.ip || '',
      equipment_server_port: (item as any)?.specifications?.server?.port || '',
      equipment_server_username: (item as any)?.specifications?.server?.username || '',
      equipment_server_passwd: (item as any)?.specifications?.server?.password || '',
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
  /**
   * 获取状态标签颜色
   * 入参：status 设备状态（available/in_use/maintenance/offline）
   * 出参：颜色字符串
   */
  const getStatusColor = (status: Equipment['status']) => {
    switch (status) {
      case 'in_use': return 'green'
      case 'available': return 'blue'
      case 'maintenance': return 'orange'
      case 'offline': return 'red'
      default: return 'default'
    }
  }

  /**
   * 获取状态文本
   * @param status 设备状态
   */
  /**
   * 获取状态中文文案
   * 入参：status 设备状态（available/in_use/maintenance/offline）
   * 出参：中文描述
   */
  const getStatusText = (status: Equipment['status']) => {
    switch (status) {
      case 'in_use': return '运行中'
      case 'available': return '空闲'
      case 'maintenance': return '维护中'
      case 'offline': return '停用'
      default: return '未知'
    }
  }

  /**
   * 表格列定义（按需求调整）
   * 字段：设备编码、设备名称、品牌、型号、资产编号、序列号、状态
   */
  const columns: ColumnsType<Equipment> = [
    {
      title: '设备编码',
      key: 'equipment_code',
      width: 140,
      render: (_, record) => (record as any)?.specifications?.equipmentCode ?? '-',
      fixed: 'left',
    },
    {
      title: '设备名称',
      dataIndex: 'name',
      key: 'name',
      width: 180,
      fixed: 'left',
    },
    {
      title: '品牌',
      dataIndex: 'manufacturer',
      key: 'manufacturer',
      width: 140,
    },
    {
      title: '型号',
      dataIndex: 'model',
      key: 'model',
      width: 140,
    },
    {
      title: '资产编号',
      key: 'asset_no',
      width: 140,
      render: (_, record) => (record as any)?.specifications?.assetNo ?? '-',
    },
    {
      title: '序列号',
      dataIndex: 'serialNumber',
      key: 'serialNumber',
      width: 140,
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: (status: Equipment['status']) => (
        <Tag color={getStatusColor(status)}>
          {getStatusText(status)}
        </Tag>
      ),
    },
    {
      title: '操作',
      key: 'action',
      width: 120,
      fixed: 'right',
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
        设备档案
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
          scroll={{ x: 'max-content' }}
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
          layout="horizontal"
          labelAlign="right"
          labelCol={{ span: 8 }}
          wrapperCol={{ span: 16 }}
          onFinish={handleSave}
        >
          {/* 基本信息 */}
          <Form.Item name="equipment_code" label="设备编码" rules={[{ required: true, message: '请输入设备编码' }]}> 
            <Input placeholder="例如：EQP-00001" />
          </Form.Item>
          <Form.Item name="equipment_name" label="设备名称" rules={[{ required: true, message: '请输入设备名称' }]}> 
            <Input placeholder="例如：Illumina NovaSeq 6000" />
          </Form.Item>
          <Form.Item name="brand_no" label="品牌"> 
            <Input placeholder="例如：Illumina" />
          </Form.Item>
          <Form.Item name="instrument_model" label="型号"> 
            <Input placeholder="例如：NovaSeq 6000" />
          </Form.Item>
          <Form.Item name="asset_no" label="资产编号"> 
            <Input placeholder="例如：ASSET-0001" />
          </Form.Item>
          <Form.Item name="sn" label="序列号"> 
            <Input placeholder="例如：NS500001" />
          </Form.Item>
          <Form.Item name="enable_status" label="状态" rules={[{ required: true, message: '请选择启用状态' }]}>
            <Select placeholder="请选择">
              <Option value={1}>启用</Option>
              <Option value={0}>停用</Option>
            </Select>
          </Form.Item>

          {/* 服务器信息 */}
          <Form.Item name="equipment_server_ip" label="服务器ip">
            <Input placeholder="例如：192.168.1.100" />
          </Form.Item>
          <Form.Item name="equipment_server_port" label="服务器端口">
            <Input placeholder="例如：8080" />
          </Form.Item>
          <Form.Item name="equipment_server_username" label="服务器用户名">
            <Input placeholder="例如：admin" />
          </Form.Item>
          <Form.Item name="equipment_server_passwd" label="服务器密码">
            <Input.Password placeholder="请输入服务器密码" />
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