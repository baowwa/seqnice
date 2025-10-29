import React, { useState, useEffect } from 'react'
import { 
  Table, 
  Card, 
  Button, 
  Space, 
  Input, 
  Select, 
  DatePicker, 
  Modal, 
  Form, 
  message, 
  Popconfirm,
  Row,
  Col,
  Upload,
  Tag
} from 'antd'
import { 
  PlusOutlined, 
  SearchOutlined, 
  DeleteOutlined, 
  EditOutlined,
  ExportOutlined,
  ReloadOutlined,
  EyeOutlined,
  UploadOutlined
} from '@ant-design/icons'
import type { ColumnsType } from 'antd/es/table'
import dayjs from 'dayjs'

const { RangePicker } = DatePicker
const { Option } = Select
const { TextArea } = Input

/**
 * 芯片使用记录接口定义
 */
interface ChipUsageRecord {
  id: string
  chipName: string
  brand: string
  chipDD: string
  expiryDate: string
  startTime: string
  endTime: string
  initialValidHoles: number
  endValidHoles: number
  sampleCount: number
  experimentDepartment: string
  experimentStaff: string
  qualityReport: string
  reportTime: string
  washTime: string
  washStaff: string
  createdAt: string
  updatedAt: string
}

/**
 * 芯片使用记录页面组件
 */
const ChipUsageRecord: React.FC = () => {
  const [data, setData] = useState<ChipUsageRecord[]>([])
  const [loading, setLoading] = useState(false)
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([])
  const [isModalVisible, setIsModalVisible] = useState(false)
  const [editingRecord, setEditingRecord] = useState<ChipUsageRecord | null>(null)
  const [searchText, setSearchText] = useState('')
  const [brandFilter, setBrandFilter] = useState<string>('')
  const [departmentFilter, setDepartmentFilter] = useState<string>('')
  const [dateRange, setDateRange] = useState<[dayjs.Dayjs | null, dayjs.Dayjs | null] | null>(null)
  
  const [form] = Form.useForm()

  /**
   * 加载数据
   */
  const loadData = async () => {
    setLoading(true)
    try {
      // 模拟API调用
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      const mockData: ChipUsageRecord[] = [
        {
          id: '1',
          chipName: 'NovaSeq-S4-001',
          brand: 'Illumina',
          chipDD: 'DD20240115001',
          expiryDate: '2024-12-31',
          startTime: '2024-01-15 09:00:00',
          endTime: '2024-01-15 18:30:00',
          initialValidHoles: 8000000000,
          endValidHoles: 6400000000,
          sampleCount: 24,
          experimentDepartment: '基因组学部',
          experimentStaff: '张三',
          qualityReport: 'QC_Report_20240115.pdf',
          reportTime: '2024-01-15 19:00:00',
          washTime: '2024-01-15 20:00:00',
          washStaff: '李四',
          createdAt: '2024-01-15 19:30:00',
          updatedAt: '2024-01-15 19:30:00'
        },
        {
          id: '2',
          chipName: 'MiSeq-v3-002',
          brand: 'Illumina',
          chipDD: 'DD20240114002',
          expiryDate: '2024-11-30',
          startTime: '2024-01-14 14:00:00',
          endTime: '2024-01-14 22:00:00',
          initialValidHoles: 25000000,
          endValidHoles: 20000000,
          sampleCount: 12,
          experimentDepartment: '外显子组学部',
          experimentStaff: '王五',
          qualityReport: 'QC_Report_20240114.pdf',
          reportTime: '2024-01-14 22:30:00',
          washTime: '2024-01-14 23:00:00',
          washStaff: '赵六',
          createdAt: '2024-01-14 23:30:00',
          updatedAt: '2024-01-14 23:30:00'
        },
        {
          id: '3',
          chipName: 'HiSeq-2500-003',
          brand: 'Illumina',
          chipDD: 'DD20240113003',
          expiryDate: '2024-10-31',
          startTime: '2024-01-13 08:30:00',
          endTime: '2024-01-13 20:00:00',
          initialValidHoles: 4000000000,
          endValidHoles: 3200000000,
          sampleCount: 8,
          experimentDepartment: '转录组学部',
          experimentStaff: '孙七',
          qualityReport: 'QC_Report_20240113.pdf',
          reportTime: '2024-01-13 20:30:00',
          washTime: '2024-01-13 21:00:00',
          washStaff: '周八',
          createdAt: '2024-01-13 21:30:00',
          updatedAt: '2024-01-13 21:30:00'
        },
        {
          id: '4',
          chipName: 'NextSeq-550-004',
          brand: 'Illumina',
          chipDD: 'DD20240112004',
          expiryDate: '2024-09-30',
          startTime: '2024-01-12 13:00:00',
          endTime: '2024-01-12 19:30:00',
          initialValidHoles: 1300000000,
          endValidHoles: 1040000000,
          sampleCount: 16,
          experimentDepartment: '靶向测序部',
          experimentStaff: '吴九',
          qualityReport: 'QC_Report_20240112.pdf',
          reportTime: '2024-01-12 20:00:00',
          washTime: '2024-01-12 20:30:00',
          washStaff: '郑十',
          createdAt: '2024-01-12 21:00:00',
          updatedAt: '2024-01-12 21:00:00'
        },
        {
          id: '5',
          chipName: 'NovaSeq-S2-005',
          brand: 'Illumina',
          chipDD: 'DD20240111005',
          expiryDate: '2024-08-31',
          startTime: '2024-01-11 10:00:00',
          endTime: '2024-01-11 16:30:00',
          initialValidHoles: 3300000000,
          endValidHoles: 2640000000,
          sampleCount: 6,
          experimentDepartment: '宏基因组学部',
          experimentStaff: '钱一',
          qualityReport: 'QC_Report_20240111.pdf',
          reportTime: '2024-01-11 17:00:00',
          washTime: '2024-01-11 17:30:00',
          washStaff: '陈二',
          createdAt: '2024-01-11 18:00:00',
          updatedAt: '2024-01-11 18:00:00'
        }
      ]
      
      setData(mockData)
    } catch (error) {
      message.error('加载数据失败')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  /**
   * 表格列定义
   */
  const columns: ColumnsType<ChipUsageRecord> = [
    {
      title: '芯片名称',
      dataIndex: 'chipName',
      key: 'chipName',
      width: 150,
      fixed: 'left'
    },
    {
      title: '品牌',
      dataIndex: 'brand',
      key: 'brand',
      width: 100
    },
    {
      title: '芯片DD',
      dataIndex: 'chipDD',
      key: 'chipDD',
      width: 140
    },
    {
      title: '有效期',
      dataIndex: 'expiryDate',
      key: 'expiryDate',
      width: 120,
      render: (text: string) => {
        const isExpired = dayjs(text).isBefore(dayjs())
        return (
          <span style={{ color: isExpired ? '#ff4d4f' : '#52c41a' }}>
            {dayjs(text).format('YYYY-MM-DD')}
          </span>
        )
      }
    },
    {
      title: '上机开始时间',
      dataIndex: 'startTime',
      key: 'startTime',
      width: 160,
      render: (text: string) => dayjs(text).format('YYYY-MM-DD HH:mm:ss')
    },
    {
      title: '上机结束时间',
      dataIndex: 'endTime',
      key: 'endTime',
      width: 160,
      render: (text: string) => dayjs(text).format('YYYY-MM-DD HH:mm:ss')
    },
    {
      title: '初始有效孔数',
      dataIndex: 'initialValidHoles',
      key: 'initialValidHoles',
      width: 130,
      render: (value: number) => (
        <span style={{ fontWeight: 'bold', color: '#1890ff' }}>
          {(value / 1000000).toFixed(0)}M
        </span>
      )
    },
    {
      title: '结束有效孔数',
      dataIndex: 'endValidHoles',
      key: 'endValidHoles',
      width: 130,
      render: (value: number) => (
        <span style={{ fontWeight: 'bold', color: '#52c41a' }}>
          {(value / 1000000).toFixed(0)}M
        </span>
      )
    },
    {
      title: '样本数量',
      dataIndex: 'sampleCount',
      key: 'sampleCount',
      width: 100,
      render: (value: number) => (
        <span style={{ fontWeight: 'bold' }}>{value}</span>
      )
    },
    {
      title: '实验科室',
      dataIndex: 'experimentDepartment',
      key: 'experimentDepartment',
      width: 120
    },
    {
      title: '实验人员',
      dataIndex: 'experimentStaff',
      key: 'experimentStaff',
      width: 100
    },
    {
      title: '质控报告',
      dataIndex: 'qualityReport',
      key: 'qualityReport',
      width: 150,
      render: (text: string) => (
        <Button type="link" size="small" onClick={() => handleDownloadReport(text)}>
          {text}
        </Button>
      )
    },
    {
      title: '报告时间',
      dataIndex: 'reportTime',
      key: 'reportTime',
      width: 160,
      render: (text: string) => dayjs(text).format('YYYY-MM-DD HH:mm:ss')
    },
    {
      title: '消洗时间',
      dataIndex: 'washTime',
      key: 'washTime',
      width: 160,
      render: (text: string) => dayjs(text).format('YYYY-MM-DD HH:mm:ss')
    },
    {
      title: '清洗人',
      dataIndex: 'washStaff',
      key: 'washStaff',
      width: 100
    },
    {
      title: '操作',
      key: 'action',
      width: 180,
      fixed: 'right',
      render: (_, record) => (
        <Space size="small">
          <Button
            type="link"
            size="small"
            icon={<EyeOutlined />}
            onClick={() => handleViewDetails(record)}
          >
            详情
          </Button>
          <Button
            type="link"
            size="small"
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
          >
            编辑
          </Button>
          <Popconfirm
            title="确定删除这条记录吗？"
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
      )
    }
  ]

  /**
   * 处理下载报告
   */
  const handleDownloadReport = (reportName: string) => {
    message.info(`下载报告: ${reportName}`)
    // 这里可以实现实际的下载逻辑
  }

  /**
   * 处理查看详情
   */
  const handleViewDetails = (record: ChipUsageRecord) => {
    Modal.info({
      title: '芯片使用记录详情',
      width: 800,
      content: (
        <div style={{ marginTop: '16px' }}>
          <Row gutter={[16, 8]}>
            <Col span={8}><strong>芯片名称：</strong></Col>
            <Col span={16}>{record.chipName}</Col>
            <Col span={8}><strong>品牌：</strong></Col>
            <Col span={16}>{record.brand}</Col>
            <Col span={8}><strong>芯片DD：</strong></Col>
            <Col span={16}>{record.chipDD}</Col>
            <Col span={8}><strong>有效期：</strong></Col>
            <Col span={16}>{dayjs(record.expiryDate).format('YYYY-MM-DD')}</Col>
            <Col span={8}><strong>上机开始时间：</strong></Col>
            <Col span={16}>{dayjs(record.startTime).format('YYYY-MM-DD HH:mm:ss')}</Col>
            <Col span={8}><strong>上机结束时间：</strong></Col>
            <Col span={16}>{dayjs(record.endTime).format('YYYY-MM-DD HH:mm:ss')}</Col>
            <Col span={8}><strong>初始有效孔数：</strong></Col>
            <Col span={16}>{(record.initialValidHoles / 1000000).toFixed(0)}M</Col>
            <Col span={8}><strong>结束有效孔数：</strong></Col>
            <Col span={16}>{(record.endValidHoles / 1000000).toFixed(0)}M</Col>
            <Col span={8}><strong>样本数量：</strong></Col>
            <Col span={16}>{record.sampleCount}</Col>
            <Col span={8}><strong>实验科室：</strong></Col>
            <Col span={16}>{record.experimentDepartment}</Col>
            <Col span={8}><strong>实验人员：</strong></Col>
            <Col span={16}>{record.experimentStaff}</Col>
            <Col span={8}><strong>质控报告：</strong></Col>
            <Col span={16}>{record.qualityReport}</Col>
            <Col span={8}><strong>报告时间：</strong></Col>
            <Col span={16}>{dayjs(record.reportTime).format('YYYY-MM-DD HH:mm:ss')}</Col>
            <Col span={8}><strong>消洗时间：</strong></Col>
            <Col span={16}>{dayjs(record.washTime).format('YYYY-MM-DD HH:mm:ss')}</Col>
            <Col span={8}><strong>清洗人：</strong></Col>
            <Col span={16}>{record.washStaff}</Col>
          </Row>
        </div>
      )
    })
  }

  /**
   * 处理新增记录
   */
  const handleAdd = () => {
    setEditingRecord(null)
    form.resetFields()
    setIsModalVisible(true)
  }

  /**
   * 处理编辑记录
   */
  const handleEdit = (record: ChipUsageRecord) => {
    setEditingRecord(record)
    form.setFieldsValue({
      ...record,
      expiryDate: dayjs(record.expiryDate),
      startTime: dayjs(record.startTime),
      endTime: dayjs(record.endTime),
      reportTime: dayjs(record.reportTime),
      washTime: dayjs(record.washTime)
    })
    setIsModalVisible(true)
  }

  /**
   * 处理删除记录
   */
  const handleDelete = async (id: string) => {
    try {
      // 模拟API调用
      await new Promise(resolve => setTimeout(resolve, 500))
      setData(data.filter(record => record.id !== id))
      message.success('删除成功')
    } catch (error) {
      message.error('删除失败')
    }
  }

  /**
   * 处理批量删除
   */
  const handleBatchDelete = async () => {
    try {
      // 模拟API调用
      await new Promise(resolve => setTimeout(resolve, 500))
      setData(data.filter(record => !selectedRowKeys.includes(record.id)))
      setSelectedRowKeys([])
      message.success('批量删除成功')
    } catch (error) {
      message.error('批量删除失败')
    }
  }

  /**
   * 处理表单提交
   */
  const handleSubmit = async (values: any) => {
    try {
      setLoading(true)
      // 模拟API调用
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      const formData = {
        ...values,
        expiryDate: values.expiryDate.format('YYYY-MM-DD'),
        startTime: values.startTime.format('YYYY-MM-DD HH:mm:ss'),
        endTime: values.endTime.format('YYYY-MM-DD HH:mm:ss'),
        reportTime: values.reportTime.format('YYYY-MM-DD HH:mm:ss'),
        washTime: values.washTime.format('YYYY-MM-DD HH:mm:ss')
      }
      
      if (editingRecord) {
        // 更新记录
        setData(data.map(record => 
          record.id === editingRecord.id 
            ? { ...record, ...formData, updatedAt: dayjs().format('YYYY-MM-DD HH:mm:ss') }
            : record
        ))
        message.success('更新成功')
      } else {
        // 新增记录
        const newRecord: ChipUsageRecord = {
          id: Date.now().toString(),
          ...formData,
          createdAt: dayjs().format('YYYY-MM-DD HH:mm:ss'),
          updatedAt: dayjs().format('YYYY-MM-DD HH:mm:ss')
        }
        setData([newRecord, ...data])
        message.success('新增成功')
      }
      
      setIsModalVisible(false)
      form.resetFields()
    } catch (error) {
      message.error('操作失败')
    } finally {
      setLoading(false)
    }
  }

  /**
   * 过滤数据
   */
  const filteredData = data.filter(record => {
    const matchesSearch = !searchText || 
      record.chipName.toLowerCase().includes(searchText.toLowerCase()) ||
      record.chipDD.toLowerCase().includes(searchText.toLowerCase()) ||
      record.experimentStaff.toLowerCase().includes(searchText.toLowerCase())
    
    const matchesBrand = !brandFilter || record.brand === brandFilter
    const matchesDepartment = !departmentFilter || record.experimentDepartment === departmentFilter
    
    const matchesDateRange = !dateRange || !dateRange[0] || !dateRange[1] || (
      dayjs(record.startTime).isAfter(dateRange[0].subtract(1, 'day')) &&
      dayjs(record.startTime).isBefore(dateRange[1].add(1, 'day'))
    )
    
    return matchesSearch && matchesBrand && matchesDepartment && matchesDateRange
  })

  return (
    <div style={{ padding: '24px' }}>
      <Card title="芯片使用记录">
        {/* 搜索和筛选区域 */}
        <Row gutter={16} style={{ marginBottom: '16px' }}>
          <Col span={6}>
            <Input
              placeholder="搜索芯片名称、芯片DD或实验人员"
              prefix={<SearchOutlined />}
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              allowClear
            />
          </Col>
          <Col span={4}>
            <Select
              placeholder="品牌筛选"
              value={brandFilter}
              onChange={setBrandFilter}
              allowClear
              style={{ width: '100%' }}
            >
              <Option value="Illumina">Illumina</Option>
              <Option value="Thermo Fisher">Thermo Fisher</Option>
              <Option value="PacBio">PacBio</Option>
              <Option value="Oxford Nanopore">Oxford Nanopore</Option>
            </Select>
          </Col>
          <Col span={4}>
            <Select
              placeholder="实验科室"
              value={departmentFilter}
              onChange={setDepartmentFilter}
              allowClear
              style={{ width: '100%' }}
            >
              <Option value="基因组学部">基因组学部</Option>
              <Option value="外显子组学部">外显子组学部</Option>
              <Option value="转录组学部">转录组学部</Option>
              <Option value="靶向测序部">靶向测序部</Option>
              <Option value="宏基因组学部">宏基因组学部</Option>
            </Select>
          </Col>
          <Col span={6}>
            <RangePicker
              value={dateRange}
              onChange={setDateRange}
              style={{ width: '100%' }}
              placeholder={['开始时间', '结束时间']}
              showTime
            />
          </Col>
          <Col span={4}>
            <Space>
              <Button
                icon={<ReloadOutlined />}
                onClick={loadData}
              >
                刷新
              </Button>
            </Space>
          </Col>
        </Row>

        {/* 操作按钮区域 */}
        <Row style={{ marginBottom: '16px' }}>
          <Col span={24}>
            <Space>
              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={handleAdd}
              >
                新增记录
              </Button>
              <Button
                icon={<ExportOutlined />}
                onClick={() => message.info('导出功能开发中')}
              >
                导出数据
              </Button>
              {selectedRowKeys.length > 0 && (
                <Popconfirm
                  title={`确定删除选中的 ${selectedRowKeys.length} 条记录吗？`}
                  onConfirm={handleBatchDelete}
                  okText="确定"
                  cancelText="取消"
                >
                  <Button
                    danger
                    icon={<DeleteOutlined />}
                  >
                    批量删除 ({selectedRowKeys.length})
                  </Button>
                </Popconfirm>
              )}
            </Space>
          </Col>
        </Row>

        {/* 数据表格 */}
        <Table
          columns={columns}
          dataSource={filteredData}
          rowKey="id"
          loading={loading}
          scroll={{ x: 2000 }}
          rowSelection={{
            selectedRowKeys,
            onChange: setSelectedRowKeys,
          }}
          pagination={{
            total: filteredData.length,
            pageSize: 10,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) => `第 ${range[0]}-${range[1]} 条/共 ${total} 条`,
          }}
        />
      </Card>

      {/* 新增/编辑模态框 */}
      <Modal
        title={editingRecord ? '编辑芯片使用记录' : '新增芯片使用记录'}
        open={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        footer={null}
        width={900}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
        >
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="chipName"
                label="芯片名称"
                rules={[{ required: true, message: '请输入芯片名称' }]}
              >
                <Input placeholder="请输入芯片名称" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="brand"
                label="品牌"
                rules={[{ required: true, message: '请选择品牌' }]}
              >
                <Select placeholder="请选择品牌">
                  <Option value="Illumina">Illumina</Option>
                  <Option value="Thermo Fisher">Thermo Fisher</Option>
                  <Option value="PacBio">PacBio</Option>
                  <Option value="Oxford Nanopore">Oxford Nanopore</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>
          
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="chipDD"
                label="芯片DD"
                rules={[{ required: true, message: '请输入芯片DD' }]}
              >
                <Input placeholder="请输入芯片DD" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="expiryDate"
                label="有效期"
                rules={[{ required: true, message: '请选择有效期' }]}
              >
                <DatePicker style={{ width: '100%' }} placeholder="请选择有效期" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="startTime"
                label="上机开始时间"
                rules={[{ required: true, message: '请选择上机开始时间' }]}
              >
                <DatePicker 
                  showTime 
                  style={{ width: '100%' }} 
                  placeholder="请选择上机开始时间" 
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="endTime"
                label="上机结束时间"
                rules={[{ required: true, message: '请选择上机结束时间' }]}
              >
                <DatePicker 
                  showTime 
                  style={{ width: '100%' }} 
                  placeholder="请选择上机结束时间" 
                />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="initialValidHoles"
                label="初始有效孔数"
                rules={[{ required: true, message: '请输入初始有效孔数' }]}
              >
                <Input type="number" placeholder="请输入初始有效孔数" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="endValidHoles"
                label="结束有效孔数"
                rules={[{ required: true, message: '请输入结束有效孔数' }]}
              >
                <Input type="number" placeholder="请输入结束有效孔数" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="sampleCount"
                label="样本数量"
                rules={[{ required: true, message: '请输入样本数量' }]}
              >
                <Input type="number" placeholder="请输入样本数量" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="experimentDepartment"
                label="实验科室"
                rules={[{ required: true, message: '请选择实验科室' }]}
              >
                <Select placeholder="请选择实验科室">
                  <Option value="基因组学部">基因组学部</Option>
                  <Option value="外显子组学部">外显子组学部</Option>
                  <Option value="转录组学部">转录组学部</Option>
                  <Option value="靶向测序部">靶向测序部</Option>
                  <Option value="宏基因组学部">宏基因组学部</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="experimentStaff"
                label="实验人员"
                rules={[{ required: true, message: '请输入实验人员' }]}
              >
                <Input placeholder="请输入实验人员" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="qualityReport"
                label="质控报告"
                rules={[{ required: true, message: '请输入质控报告文件名' }]}
              >
                <Input placeholder="请输入质控报告文件名" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="reportTime"
                label="报告时间"
                rules={[{ required: true, message: '请选择报告时间' }]}
              >
                <DatePicker 
                  showTime 
                  style={{ width: '100%' }} 
                  placeholder="请选择报告时间" 
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="washTime"
                label="消洗时间"
                rules={[{ required: true, message: '请选择消洗时间' }]}
              >
                <DatePicker 
                  showTime 
                  style={{ width: '100%' }} 
                  placeholder="请选择消洗时间" 
                />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="washStaff"
                label="清洗人"
                rules={[{ required: true, message: '请输入清洗人' }]}
              >
                <Input placeholder="请输入清洗人" />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item style={{ textAlign: 'right', marginBottom: 0 }}>
            <Space>
              <Button onClick={() => setIsModalVisible(false)}>
                取消
              </Button>
              <Button type="primary" htmlType="submit" loading={loading}>
                {editingRecord ? '更新' : '新增'}
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  )
}

export default ChipUsageRecord