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
  Tag,
  Tooltip
} from 'antd'
import { 
  PlusOutlined, 
  SearchOutlined, 
  DeleteOutlined, 
  EditOutlined,
  ExportOutlined,
  ReloadOutlined,
  EyeOutlined,
  InfoCircleOutlined
} from '@ant-design/icons'
import type { ColumnsType } from 'antd/es/table'
import dayjs from 'dayjs'

const { RangePicker } = DatePicker
const { Option } = Select

/**
 * 芯片记录汇总接口定义
 */
interface ChipRecordSummary {
  id: string
  chipName: string
  brand: string
  chipDD: string
  expiryDate: string
  firstUseTime: string
  lastUseTime: string
  lastEndValidHoles: number
  totalUsageCount: number
  totalSampleCount: number
  washCount: number
  createdAt: string
  updatedAt: string
}

/**
 * 芯片使用明细接口定义
 */
interface ChipUsageDetail {
  id: string
  chipName: string
  startTime: string
  endTime: string
  sampleCount: number
  experimentDepartment: string
  experimentStaff: string
  washStaff: string
}

/**
 * 芯片记录汇总页面组件
 */
const ChipRecordSummary: React.FC = () => {
  // 状态管理
  const [data, setData] = useState<ChipRecordSummary[]>([])
  const [loading, setLoading] = useState(false)
  const [searchText, setSearchText] = useState('')
  const [filters, setFilters] = useState({
    brand: '',
    dateRange: null as [dayjs.Dayjs | null, dayjs.Dayjs | null] | null,
  })
  
  // 使用明细相关状态
  const [isDetailModalVisible, setIsDetailModalVisible] = useState(false)
  const [currentChipDetails, setCurrentChipDetails] = useState<ChipUsageDetail[]>([])

  /**
   * 加载数据
   */
  const loadData = async () => {
    setLoading(true)
    try {
      // 模拟API调用
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      const mockData: ChipRecordSummary[] = [
        {
          id: '1',
          chipName: 'NovaSeq-S4-001',
          brand: 'Illumina',
          chipDD: 'DD20240115001',
          expiryDate: '2024-12-31',
          firstUseTime: '2024-01-10 09:00:00',
          lastUseTime: '2024-01-15 18:30:00',
          lastEndValidHoles: 6400000000,
          totalUsageCount: 5,
          totalSampleCount: 120,
          washCount: 3,
          createdAt: '2024-01-10 09:00:00',
          updatedAt: '2024-01-15 18:30:00'
        },
        {
          id: '2',
          chipName: 'MiSeq-v3-002',
          brand: 'Illumina',
          chipDD: 'DD20240114002',
          expiryDate: '2024-11-30',
          firstUseTime: '2024-01-12 14:00:00',
          lastUseTime: '2024-01-14 22:00:00',
          lastEndValidHoles: 20000000,
          totalUsageCount: 3,
          totalSampleCount: 36,
          washCount: 2,
          createdAt: '2024-01-12 14:00:00',
          updatedAt: '2024-01-14 22:00:00'
        },
        {
          id: '3',
          chipName: 'HiSeq-2500-003',
          brand: 'Illumina',
          chipDD: 'DD20240113003',
          expiryDate: '2024-10-31',
          firstUseTime: '2024-01-08 08:30:00',
          lastUseTime: '2024-01-13 20:00:00',
          lastEndValidHoles: 3200000000,
          totalUsageCount: 4,
          totalSampleCount: 32,
          washCount: 2,
          createdAt: '2024-01-08 08:30:00',
          updatedAt: '2024-01-13 20:00:00'
        },
        {
          id: '4',
          chipName: 'NextSeq-550-004',
          brand: 'Illumina',
          chipDD: 'DD20240112004',
          expiryDate: '2024-09-30',
          firstUseTime: '2024-01-09 13:00:00',
          lastUseTime: '2024-01-12 19:30:00',
          lastEndValidHoles: 1040000000,
          totalUsageCount: 2,
          totalSampleCount: 32,
          washCount: 1,
          createdAt: '2024-01-09 13:00:00',
          updatedAt: '2024-01-12 19:30:00'
        },
        {
          id: '5',
          chipName: 'NovaSeq-S2-005',
          brand: 'Illumina',
          chipDD: 'DD20240111005',
          expiryDate: '2024-08-31',
          firstUseTime: '2024-01-05 10:00:00',
          lastUseTime: '2024-01-11 16:30:00',
          lastEndValidHoles: 2640000000,
          totalUsageCount: 6,
          totalSampleCount: 48,
          washCount: 4,
          createdAt: '2024-01-05 10:00:00',
          updatedAt: '2024-01-11 16:30:00'
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
  const columns: ColumnsType<ChipRecordSummary> = [
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
      title: '第一次启用时间',
      dataIndex: 'firstUseTime',
      key: 'firstUseTime',
      width: 160,
      render: (text: string) => dayjs(text).format('YYYY-MM-DD HH:mm:ss')
    },
    {
      title: '最后一次使用时间',
      dataIndex: 'lastUseTime',
      key: 'lastUseTime',
      width: 160,
      render: (text: string) => dayjs(text).format('YYYY-MM-DD HH:mm:ss')
    },
    {
      title: '最后一次结束有效孔数',
      dataIndex: 'lastEndValidHoles',
      key: 'lastEndValidHoles',
      width: 180,
      render: (value: number) => (
        <span style={{ fontWeight: 'bold', color: '#52c41a' }}>
          {(value / 1000000).toFixed(0)}M
        </span>
      )
    },
    {
      title: '上机次数合计',
      dataIndex: 'totalUsageCount',
      key: 'totalUsageCount',
      width: 120,
      render: (value: number) => (
        <Tag color="blue" style={{ fontWeight: 'bold' }}>
          {value} 次
        </Tag>
      )
    },
    {
      title: '样本量合计',
      dataIndex: 'totalSampleCount',
      key: 'totalSampleCount',
      width: 120,
      render: (value: number) => (
        <span style={{ fontWeight: 'bold', color: '#1890ff' }}>
          {value}
        </span>
      )
    },
    {
      title: '消洗次数',
      dataIndex: 'washCount',
      key: 'washCount',
      width: 100,
      render: (value: number) => (
        <Tag color="orange" style={{ fontWeight: 'bold' }}>
          {value} 次
        </Tag>
      )
    },
    {
      title: '操作',
      key: 'action',
      width: 120,
      render: (_, record) => (
        <Button
          type="link"
          size="small"
          icon={<EyeOutlined />}
          onClick={() => handleViewUsageDetails(record)}
        >
          查看使用明细
        </Button>
      )
    }
  ]

  /**
   * 使用明细表格列定义
   */
  const detailColumns: ColumnsType<ChipUsageDetail> = [
    {
      title: '开始时间',
      dataIndex: 'startTime',
      key: 'startTime',
      render: (text: string) => dayjs(text).format('YYYY-MM-DD HH:mm:ss')
    },
    {
      title: '结束时间',
      dataIndex: 'endTime',
      key: 'endTime',
      render: (text: string) => dayjs(text).format('YYYY-MM-DD HH:mm:ss')
    },
    {
      title: '样本数量',
      dataIndex: 'sampleCount',
      key: 'sampleCount',
      render: (value: number) => (
        <span style={{ fontWeight: 'bold' }}>{value}</span>
      )
    },
    {
      title: '实验科室',
      dataIndex: 'experimentDepartment',
      key: 'experimentDepartment'
    },
    {
      title: '实验人员',
      dataIndex: 'experimentStaff',
      key: 'experimentStaff'
    },
    {
      title: '清洗人',
      dataIndex: 'washStaff',
      key: 'washStaff'
    }
  ]

  /**
   * 处理查看使用明细
   */
  const handleViewUsageDetails = async (record: ChipRecordSummary) => {
    try {
      // 模拟API调用获取使用明细
      await new Promise(resolve => setTimeout(resolve, 500))
      
      const mockDetails: ChipUsageDetail[] = [
        {
          id: '1',
          chipName: record.chipName,
          startTime: '2024-01-10 09:00:00',
          endTime: '2024-01-10 18:30:00',
          sampleCount: 24,
          experimentDepartment: '基因组学部',
          experimentStaff: '张三',
          washStaff: '李四'
        },
        {
          id: '2',
          chipName: record.chipName,
          startTime: '2024-01-12 14:00:00',
          endTime: '2024-01-12 22:00:00',
          sampleCount: 20,
          experimentDepartment: '外显子组学部',
          experimentStaff: '王五',
          washStaff: '赵六'
        },
        {
          id: '3',
          chipName: record.chipName,
          startTime: '2024-01-15 08:30:00',
          endTime: '2024-01-15 18:30:00',
          sampleCount: 16,
          experimentDepartment: '转录组学部',
          experimentStaff: '孙七',
          washStaff: '周八'
        }
      ]
      
      setCurrentChipDetails(mockDetails)
      setIsDetailModalVisible(true)
    } catch (error) {
      message.error('获取使用明细失败')
    }
  }

  /**
   * 过滤数据
   */
  const filteredData = data.filter(record => {
    const matchesSearch = !searchText || 
      record.chipName.toLowerCase().includes(searchText.toLowerCase()) ||
      record.chipDD.toLowerCase().includes(searchText.toLowerCase())
    
    const matchesBrand = !filters.brand || record.brand === filters.brand
    
    const matchesDateRange = !filters.dateRange || !filters.dateRange[0] || !filters.dateRange[1] || (
      dayjs(record.firstUseTime).isAfter(filters.dateRange[0].subtract(1, 'day')) &&
      dayjs(record.lastUseTime).isBefore(filters.dateRange[1].add(1, 'day'))
    )
    
    return matchesSearch && matchesBrand && matchesDateRange
  })

  return (
    <div style={{ padding: '24px' }}>
      <Card title="芯片记录汇总">
        {/* 搜索和筛选区域 */}
        <Row gutter={16} style={{ marginBottom: '16px' }}>
          <Col span={6}>
            <Input
              placeholder="搜索芯片名称或芯片DD"
              prefix={<SearchOutlined />}
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              allowClear
            />
          </Col>
          <Col span={4}>
            <Select
              placeholder="品牌筛选"
              value={filters.brand}
              onChange={(value) => setFilters({...filters, brand: value})}
              allowClear
              style={{ width: '100%' }}
            >
              <Option value="Illumina">Illumina</Option>
              <Option value="Thermo Fisher">Thermo Fisher</Option>
              <Option value="PacBio">PacBio</Option>
              <Option value="Oxford Nanopore">Oxford Nanopore</Option>
            </Select>
          </Col>
          <Col span={6}>
            <RangePicker
              value={filters.dateRange}
              onChange={(dates) => setFilters({...filters, dateRange: dates})}
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
                icon={<ExportOutlined />}
                onClick={() => message.info('导出功能开发中')}
              >
                导出数据
              </Button>
            </Space>
          </Col>
        </Row>

        {/* 数据表格 */}
        <Table
           columns={columns}
           dataSource={filteredData}
           rowKey="id"
           loading={loading}
           scroll={{ x: 1600 }}
           pagination={{
             total: filteredData.length,
             pageSize: 10,
             showSizeChanger: true,
             showQuickJumper: true,
             showTotal: (total, range) => `第 ${range[0]}-${range[1]} 条/共 ${total} 条`,
           }}
         />
      </Card>

      {/* 使用明细模态框 */}
      <Modal
        title="芯片使用明细"
        open={isDetailModalVisible}
        onCancel={() => setIsDetailModalVisible(false)}
        footer={[
          <Button key="close" onClick={() => setIsDetailModalVisible(false)}>
            关闭
          </Button>
        ]}
        width={1000}
      >
        <Table
          columns={detailColumns}
          dataSource={currentChipDetails}
          rowKey="id"
          pagination={false}
          size="small"
        />
      </Modal>

    </div>
  )
}

export default ChipRecordSummary