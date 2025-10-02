import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Card,
  Table,
  Button,
  Input,
  Select,
  Space,
  Tag,
  Dropdown,
  Modal,
  Form,
  message,
  Popconfirm,
  Row,
  Col,
  Tooltip,
  Badge
} from 'antd'
import {
  PlusOutlined,
  SearchOutlined,
  EditOutlined,
  DeleteOutlined,
  MoreOutlined,
  ExportOutlined,
  ImportOutlined,
  CopyOutlined,
  EyeOutlined,
  HistoryOutlined,
  SettingOutlined
} from '@ant-design/icons'
import type { ColumnsType } from 'antd/es/table'

const { Search } = Input
const { Option } = Select

/**
 * SOP模板数据接口
 */
interface SOPTemplate {
  id: string
  name: string
  version: string
  status: 'active' | 'inactive'
  applicableProjects: string[]
  description: string
  creator: string
  createTime: string
  lastUpdater: string
  updateTime: string
  stepCount: number
  fieldCount: number
  qcRuleCount: number
}

/**
 * SOP配置管理主页面组件
 * 提供SOP模板的列表展示、搜索筛选、新建编辑、批量操作等功能
 */
const SOPConfig: React.FC = () => {
  const navigate = useNavigate()
  
  // 状态管理
  const [loading, setLoading] = useState(false)
  const [dataSource, setDataSource] = useState<SOPTemplate[]>([])
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([])
  const [searchText, setSearchText] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [createModalVisible, setCreateModalVisible] = useState(false)
  const [form] = Form.useForm()

  /**
   * 初始化数据
   */
  useEffect(() => {
    loadSOPTemplates()
  }, [])

  /**
   * 加载SOP模板数据
   */
  const loadSOPTemplates = async () => {
    setLoading(true)
    try {
      // 模拟数据
      const mockData: SOPTemplate[] = [
        {
          id: '1',
          name: '肿瘤基因检测',
          version: 'v2.1',
          status: 'active',
          applicableProjects: ['肿瘤测序项目A', '肿瘤测序项目B'],
          description: '用于肿瘤相关基因突变的检测流程',
          creator: '张三',
          createTime: '2024-03-15',
          lastUpdater: '李四',
          updateTime: '2024-05-20',
          stepCount: 6,
          fieldCount: 25,
          qcRuleCount: 8
        },
        {
          id: '2',
          name: '病原微生物检测',
          version: 'v1.5',
          status: 'active',
          applicableProjects: ['病原检测项目'],
          description: '病原微生物基因检测标准流程',
          creator: '王五',
          createTime: '2024-02-10',
          lastUpdater: '赵六',
          updateTime: '2024-04-15',
          stepCount: 5,
          fieldCount: 18,
          qcRuleCount: 6
        },
        {
          id: '3',
          name: '遗传病筛查',
          version: 'v3.0',
          status: 'active',
          applicableProjects: ['遗传病筛查项目A', '遗传病筛查项目B', '新生儿筛查'],
          description: '遗传性疾病基因筛查检测流程',
          creator: '钱七',
          createTime: '2024-01-20',
          lastUpdater: '孙八',
          updateTime: '2024-05-10',
          stepCount: 7,
          fieldCount: 32,
          qcRuleCount: 12
        },
        {
          id: '4',
          name: '药物基因组学',
          version: 'v1.2',
          status: 'inactive',
          applicableProjects: ['药物基因组学项目'],
          description: '个体化用药基因检测流程',
          creator: '周九',
          createTime: '2023-12-05',
          lastUpdater: '吴十',
          updateTime: '2024-03-01',
          stepCount: 4,
          fieldCount: 15,
          qcRuleCount: 4
        },
        {
          id: '5',
          name: '新冠核酸检测',
          version: 'v4.0',
          status: 'active',
          applicableProjects: ['新冠检测项目'],
          description: 'SARS-CoV-2核酸检测标准流程',
          creator: '郑十一',
          createTime: '2023-11-15',
          lastUpdater: '王十二',
          updateTime: '2024-05-25',
          stepCount: 3,
          fieldCount: 12,
          qcRuleCount: 5
        }
      ]
      setDataSource(mockData)
    } catch (error) {
      message.error('加载SOP模板失败')
    } finally {
      setLoading(false)
    }
  }

  /**
   * 处理搜索
   * @param value 搜索关键词
   */
  const handleSearch = (value: string) => {
    setSearchText(value)
  }

  /**
   * 处理状态筛选
   * @param value 状态值
   */
  const handleStatusFilter = (value: string) => {
    setStatusFilter(value)
  }

  /**
   * 过滤数据
   */
  const filteredData = dataSource.filter(item => {
    const matchSearch = !searchText || 
      item.name.toLowerCase().includes(searchText.toLowerCase()) ||
      item.applicableProjects.some(project => 
        project.toLowerCase().includes(searchText.toLowerCase())
      )
    const matchStatus = statusFilter === 'all' || item.status === statusFilter
    return matchSearch && matchStatus
  })

  /**
   * 处理新建SOP模板
   */
  const handleCreate = () => {
    setCreateModalVisible(true)
  }

  /**
   * 处理编辑SOP模板
   * @param record SOP模板记录
   */
  const handleEdit = (record: SOPTemplate) => {
    // 跳转到SOP模板详情页
    navigate(`/detection/sop-template/${record.id}`)
  }

  /**
   * 处理查看SOP模板
   * @param record SOP模板记录
   */
  const handleView = (record: SOPTemplate) => {
    // 跳转到SOP模板详情页（只读模式）
    navigate(`/detection/sop-template/${record.id}?mode=view`)
  }

  /**
   * 处理复制SOP模板
   * @param record SOP模板记录
   */
  const handleCopy = (record: SOPTemplate) => {
    Modal.confirm({
      title: '复制SOP模板',
      content: `确定要复制SOP模板"${record.name}"吗？`,
      onOk: async () => {
        try {
          // 这里应该调用复制API
          message.success('SOP模板复制成功')
          loadSOPTemplates()
        } catch (error) {
          message.error('复制失败')
        }
      }
    })
  }

  /**
   * 处理删除SOP模板
   * @param record SOP模板记录
   */
  const handleDelete = async (record: SOPTemplate) => {
    try {
      // 这里应该调用删除API
      message.success('SOP模板删除成功')
      loadSOPTemplates()
    } catch (error) {
      message.error('删除失败')
    }
  }

  /**
   * 处理版本管理
   * @param record SOP模板记录
   */
  const handleVersionManage = (record: SOPTemplate) => {
    // 跳转到版本管理页面
    navigate(`/detection/sop-version/${record.id}`)
  }

  /**
   * 处理批量操作
   * @param action 操作类型
   */
  const handleBatchAction = (action: string) => {
    if (selectedRowKeys.length === 0) {
      message.warning('请先选择要操作的SOP模板')
      return
    }

    switch (action) {
      case 'enable':
        Modal.confirm({
          title: '批量启用',
          content: `确定要启用选中的${selectedRowKeys.length}个SOP模板吗？`,
          onOk: () => {
            message.success('批量启用成功')
            setSelectedRowKeys([])
            loadSOPTemplates()
          }
        })
        break
      case 'disable':
        Modal.confirm({
          title: '批量停用',
          content: `确定要停用选中的${selectedRowKeys.length}个SOP模板吗？`,
          onOk: () => {
            message.success('批量停用成功')
            setSelectedRowKeys([])
            loadSOPTemplates()
          }
        })
        break
      case 'delete':
        Modal.confirm({
          title: '批量删除',
          content: `确定要删除选中的${selectedRowKeys.length}个SOP模板吗？此操作不可恢复。`,
          okType: 'danger',
          onOk: () => {
            message.success('批量删除成功')
            setSelectedRowKeys([])
            loadSOPTemplates()
          }
        })
        break
    }
  }

  /**
   * 处理导出SOP列表
   */
  const handleExport = () => {
    message.success('SOP列表导出成功')
  }

  /**
   * 处理导入SOP模板
   */
  const handleImport = () => {
    message.info('导入功能开发中')
  }

  /**
   * 提交新建表单
   * @param values 表单值
   */
  const handleCreateSubmit = async (values: any) => {
    try {
      // 这里应该调用创建API
      message.success('SOP模板创建成功')
      setCreateModalVisible(false)
      form.resetFields()
      loadSOPTemplates()
    } catch (error) {
      message.error('创建失败')
    }
  }

  // 表格列配置
  const columns: ColumnsType<SOPTemplate> = [
    {
      title: 'SOP名称',
      dataIndex: 'name',
      key: 'name',
      width: 200,
      ellipsis: true,
      render: (text: string, record: SOPTemplate) => (
        <div>
          <div style={{ fontWeight: 500 }}>{text}</div>
          <div style={{ fontSize: '12px', color: '#666' }}>
            {record.applicableProjects.slice(0, 2).join(', ')}
            {record.applicableProjects.length > 2 && '...'}
          </div>
        </div>
      )
    },
    {
      title: '版本',
      dataIndex: 'version',
      key: 'version',
      width: 100,
      render: (text: string) => (
        <Tag color="blue">{text}</Tag>
      )
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: (status: string) => (
        <Badge 
          status={status === 'active' ? 'success' : 'default'} 
          text={status === 'active' ? '启用' : '停用'} 
        />
      )
    },
    {
      title: '配置统计',
      key: 'stats',
      width: 120,
      render: (_, record: SOPTemplate) => (
        <div style={{ fontSize: '12px' }}>
          <div>步骤: {record.stepCount}</div>
          <div>字段: {record.fieldCount}</div>
          <div>质检: {record.qcRuleCount}</div>
        </div>
      )
    },
    {
      title: '更新信息',
      key: 'updateInfo',
      width: 150,
      render: (_, record: SOPTemplate) => (
        <div style={{ fontSize: '12px' }}>
          <div>{record.lastUpdater}</div>
          <div style={{ color: '#666' }}>{record.updateTime}</div>
        </div>
      )
    },
    {
      title: '操作',
      key: 'action',
      width: 200,
      render: (_, record: SOPTemplate) => (
        <Space size="small">
          <Tooltip title="编辑">
            <Button 
              type="link" 
              size="small" 
              icon={<EditOutlined />}
              onClick={() => handleEdit(record)}
            />
          </Tooltip>
          <Tooltip title="查看">
            <Button 
              type="link" 
              size="small" 
              icon={<EyeOutlined />}
              onClick={() => handleView(record)}
            />
          </Tooltip>
          <Dropdown
            menu={{
              items: [
                {
                  key: 'copy',
                  label: '复制模板',
                  icon: <CopyOutlined />,
                  onClick: () => handleCopy(record)
                },
                {
                  key: 'version',
                  label: '版本管理',
                  icon: <HistoryOutlined />,
                  onClick: () => handleVersionManage(record)
                },
                {
                  type: 'divider'
                },
                {
                  key: 'delete',
                  label: '删除',
                  icon: <DeleteOutlined />,
                  danger: true,
                  onClick: () => handleDelete(record)
                }
              ]
            }}
            trigger={['click']}
          >
            <Button type="link" size="small" icon={<MoreOutlined />} />
          </Dropdown>
        </Space>
      )
    }
  ]

  // 批量操作菜单
  const batchMenuItems = [
    {
      key: 'enable',
      label: '批量启用',
      onClick: () => handleBatchAction('enable')
    },
    {
      key: 'disable',
      label: '批量停用',
      onClick: () => handleBatchAction('disable')
    },
    {
      type: 'divider' as const
    },
    {
      key: 'delete',
      label: '批量删除',
      danger: true,
      onClick: () => handleBatchAction('delete')
    }
  ]

  return (
    <div style={{ padding: '24px' }}>
      <Card>
        {/* 页面标题和操作按钮 */}
        <Row justify="space-between" align="middle" style={{ marginBottom: 16 }}>
          <Col>
            <h2 style={{ margin: 0 }}>SOP配置管理</h2>
          </Col>
          <Col>
            <Space>
              <Button 
                type="primary" 
                icon={<PlusOutlined />}
                onClick={handleCreate}
              >
                新建SOP模板
              </Button>
            </Space>
          </Col>
        </Row>

        {/* 搜索和筛选 */}
        <Row gutter={16} style={{ marginBottom: 16 }}>
          <Col span={8}>
            <Search
              placeholder="搜索SOP名称或项目..."
              allowClear
              onSearch={handleSearch}
              style={{ width: '100%' }}
            />
          </Col>
          <Col span={4}>
            <Select
              placeholder="状态筛选"
              allowClear
              style={{ width: '100%' }}
              value={statusFilter}
              onChange={handleStatusFilter}
            >
              <Option value="all">全部状态</Option>
              <Option value="active">启用</Option>
              <Option value="inactive">停用</Option>
            </Select>
          </Col>
        </Row>

        {/* 批量操作工具栏 */}
        <Row justify="space-between" align="middle" style={{ marginBottom: 16 }}>
          <Col>
            <Space>
              <Dropdown menu={{ items: batchMenuItems }} disabled={selectedRowKeys.length === 0}>
                <Button>
                  批量操作 {selectedRowKeys.length > 0 && `(${selectedRowKeys.length})`}
                </Button>
              </Dropdown>
              <Button icon={<ExportOutlined />} onClick={handleExport}>
                导出SOP列表
              </Button>
              <Button icon={<ImportOutlined />} onClick={handleImport}>
                导入SOP模板
              </Button>
            </Space>
          </Col>
        </Row>

        {/* SOP模板列表 */}
        <Table
          columns={columns}
          dataSource={filteredData}
          rowKey="id"
          loading={loading}
          pagination={{
            total: filteredData.length,
            pageSize: 10,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) => `第 ${range[0]}-${range[1]} 条/共 ${total} 条`
          }}
          rowSelection={{
            selectedRowKeys,
            onChange: setSelectedRowKeys,
            preserveSelectedRowKeys: true
          }}
          scroll={{ x: 1000 }}
        />
      </Card>

      {/* 新建SOP模板弹窗 */}
      <Modal
        title="新建SOP模板"
        open={createModalVisible}
        onCancel={() => {
          setCreateModalVisible(false)
          form.resetFields()
        }}
        onOk={() => form.submit()}
        width={600}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleCreateSubmit}
        >
          <Form.Item
            name="name"
            label="模板名称"
            rules={[{ required: true, message: '请输入模板名称' }]}
          >
            <Input placeholder="请输入SOP模板名称" />
          </Form.Item>
          <Form.Item
            name="description"
            label="模板描述"
            rules={[{ required: true, message: '请输入模板描述' }]}
          >
            <Input.TextArea rows={3} placeholder="请输入SOP模板描述" />
          </Form.Item>
          <Form.Item
            name="applicableProjects"
            label="适用项目"
            rules={[{ required: true, message: '请选择适用项目' }]}
          >
            <Select
              mode="multiple"
              placeholder="请选择适用的检测项目"
              options={[
                { label: '肿瘤测序项目A', value: '肿瘤测序项目A' },
                { label: '肿瘤测序项目B', value: '肿瘤测序项目B' },
                { label: '病原检测项目', value: '病原检测项目' },
                { label: '遗传病筛查项目A', value: '遗传病筛查项目A' },
                { label: '遗传病筛查项目B', value: '遗传病筛查项目B' },
                { label: '新生儿筛查', value: '新生儿筛查' },
                { label: '药物基因组学项目', value: '药物基因组学项目' },
                { label: '新冠检测项目', value: '新冠检测项目' }
              ]}
            />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  )
}

export default SOPConfig