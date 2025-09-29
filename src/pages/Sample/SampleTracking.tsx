import React, { useState, useEffect } from 'react'
import { 
  Card, 
  Table, 
  Input, 
  Button, 
  Space, 
  Tag, 
  Timeline, 
  Modal, 
  Descriptions, 
  Steps,
  Row,
  Col,
  Select,
  DatePicker,
  Tooltip,
  Progress,
  Alert
} from 'antd'
import { 
  SearchOutlined, 
  EyeOutlined, 
  HistoryOutlined,
  ExperimentOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  ExclamationCircleOutlined,
  SyncOutlined
} from '@ant-design/icons'
import type { ColumnsType } from 'antd/es/table'
import dayjs from 'dayjs'

const { Search } = Input
const { Option } = Select
const { RangePicker } = DatePicker

/**
 * 样本追踪状态枚举
 */
type SampleTrackingStatus = 'received' | 'processing' | 'completed' | 'delayed' | 'error'

/**
 * 样本追踪记录接口
 */
interface SampleTrackingRecord {
  id: string
  sampleCode: string
  sampleName: string
  projectName: string
  currentStage: string
  status: SampleTrackingStatus
  progress: number
  startTime: string
  expectedEndTime: string
  actualEndTime?: string
  assignee: string
  location: string
  notes?: string
}

/**
 * 样本流程步骤接口
 */
interface SampleStep {
  id: string
  stepName: string
  status: 'completed' | 'processing' | 'pending' | 'error'
  startTime?: string
  endTime?: string
  operator?: string
  notes?: string
  duration?: number
}

/**
 * 样本追踪页面组件
 * 
 * 功能特性：
 * - 样本状态实时跟踪
 * - 流程进度可视化
 * - 历史记录查询
 * - 异常状态告警
 * - 位置信息管理
 */
const SampleTracking: React.FC = () => {
  // 状态管理
  const [loading, setLoading] = useState(false)
  const [trackingData, setTrackingData] = useState<SampleTrackingRecord[]>([])
  const [selectedRecord, setSelectedRecord] = useState<SampleTrackingRecord | null>(null)
  const [detailModalVisible, setDetailModalVisible] = useState(false)
  const [historyModalVisible, setHistoryModalVisible] = useState(false)
  const [searchText, setSearchText] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('')
  const [dateRange, setDateRange] = useState<[dayjs.Dayjs, dayjs.Dayjs] | null>(null)

  /**
   * 模拟数据
   */
  const mockTrackingData: SampleTrackingRecord[] = [
    {
      id: '1',
      sampleCode: 'S2024001',
      sampleName: '土壤样本A',
      projectName: '微生物多样性分析项目',
      currentStage: 'DNA提取',
      status: 'processing',
      progress: 65,
      startTime: '2024-01-15 09:00:00',
      expectedEndTime: '2024-01-20 17:00:00',
      assignee: '张三',
      location: '实验室A-101',
      notes: '样本质量良好，按计划进行'
    },
    {
      id: '2',
      sampleCode: 'S2024002',
      sampleName: '水体样本B',
      projectName: '环境监测项目',
      currentStage: '文库构建',
      status: 'completed',
      progress: 100,
      startTime: '2024-01-10 08:30:00',
      expectedEndTime: '2024-01-18 16:00:00',
      actualEndTime: '2024-01-17 15:30:00',
      assignee: '李四',
      location: '实验室B-203',
      notes: '提前完成，质量优秀'
    },
    {
      id: '3',
      sampleCode: 'S2024003',
      sampleName: '植物样本C',
      projectName: '植物基因组研究',
      currentStage: '质量检测',
      status: 'delayed',
      progress: 30,
      startTime: '2024-01-12 10:00:00',
      expectedEndTime: '2024-01-22 18:00:00',
      assignee: '王五',
      location: '实验室C-305',
      notes: '设备故障导致延期，正在处理'
    }
  ]

  /**
   * 模拟样本流程步骤数据
   */
  const mockSampleSteps: SampleStep[] = [
    {
      id: '1',
      stepName: '样本接收',
      status: 'completed',
      startTime: '2024-01-15 09:00:00',
      endTime: '2024-01-15 09:30:00',
      operator: '张三',
      notes: '样本状态良好',
      duration: 30
    },
    {
      id: '2',
      stepName: '样本预处理',
      status: 'completed',
      startTime: '2024-01-15 10:00:00',
      endTime: '2024-01-15 12:00:00',
      operator: '张三',
      notes: '预处理完成',
      duration: 120
    },
    {
      id: '3',
      stepName: 'DNA提取',
      status: 'processing',
      startTime: '2024-01-15 14:00:00',
      operator: '张三',
      notes: '正在进行DNA提取',
      duration: 180
    },
    {
      id: '4',
      stepName: '质量检测',
      status: 'pending',
      notes: '等待DNA提取完成'
    },
    {
      id: '5',
      stepName: '文库构建',
      status: 'pending',
      notes: '等待质量检测通过'
    }
  ]

  /**
   * 组件初始化
   */
  useEffect(() => {
    loadTrackingData()
  }, [])

  /**
   * 加载追踪数据
   */
  const loadTrackingData = async () => {
    setLoading(true)
    try {
      // 模拟API调用
      await new Promise(resolve => setTimeout(resolve, 1000))
      setTrackingData(mockTrackingData)
    } catch (error) {
      console.error('加载追踪数据失败:', error)
    } finally {
      setLoading(false)
    }
  }

  /**
   * 获取状态颜色
   */
  const getStatusColor = (status: SampleTrackingStatus) => {
    const colorMap = {
      received: 'blue',
      processing: 'orange',
      completed: 'green',
      delayed: 'red',
      error: 'red'
    }
    return colorMap[status]
  }

  /**
   * 获取状态文本
   */
  const getStatusText = (status: SampleTrackingStatus) => {
    const textMap = {
      received: '已接收',
      processing: '处理中',
      completed: '已完成',
      delayed: '延期',
      error: '异常'
    }
    return textMap[status]
  }

  /**
   * 获取步骤状态图标
   */
  const getStepIcon = (status: string) => {
    const iconMap = {
      completed: <CheckCircleOutlined style={{ color: '#52c41a' }} />,
      processing: <SyncOutlined spin style={{ color: '#1890ff' }} />,
      pending: <ClockCircleOutlined style={{ color: '#d9d9d9' }} />,
      error: <ExclamationCircleOutlined style={{ color: '#ff4d4f' }} />
    }
    return iconMap[status as keyof typeof iconMap]
  }

  /**
   * 查看详情
   */
  const handleViewDetail = (record: SampleTrackingRecord) => {
    setSelectedRecord(record)
    setDetailModalVisible(true)
  }

  /**
   * 查看历史记录
   */
  const handleViewHistory = (record: SampleTrackingRecord) => {
    setSelectedRecord(record)
    setHistoryModalVisible(true)
  }

  /**
   * 过滤数据
   */
  const filteredData = trackingData.filter(item => {
    const matchSearch = !searchText || 
      item.sampleCode.toLowerCase().includes(searchText.toLowerCase()) ||
      item.sampleName.toLowerCase().includes(searchText.toLowerCase()) ||
      item.projectName.toLowerCase().includes(searchText.toLowerCase())
    
    const matchStatus = !statusFilter || item.status === statusFilter
    
    const matchDate = !dateRange || (
      dayjs(item.startTime).isAfter(dateRange[0]) &&
      dayjs(item.startTime).isBefore(dateRange[1])
    )
    
    return matchSearch && matchStatus && matchDate
  })

  /**
   * 表格列定义
   */
  const columns: ColumnsType<SampleTrackingRecord> = [
    {
      title: '样本编号',
      dataIndex: 'sampleCode',
      key: 'sampleCode',
      width: 120,
      fixed: 'left'
    },
    {
      title: '样本名称',
      dataIndex: 'sampleName',
      key: 'sampleName',
      width: 150,
      ellipsis: true
    },
    {
      title: '项目名称',
      dataIndex: 'projectName',
      key: 'projectName',
      width: 200,
      ellipsis: true
    },
    {
      title: '当前阶段',
      dataIndex: 'currentStage',
      key: 'currentStage',
      width: 120
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: (status: SampleTrackingStatus) => (
        <Tag color={getStatusColor(status)}>
          {getStatusText(status)}
        </Tag>
      )
    },
    {
      title: '进度',
      dataIndex: 'progress',
      key: 'progress',
      width: 120,
      render: (progress: number, record) => (
        <Progress 
          percent={progress} 
          size="small" 
          status={record.status === 'error' ? 'exception' : 'active'}
        />
      )
    },
    {
      title: '负责人',
      dataIndex: 'assignee',
      key: 'assignee',
      width: 100
    },
    {
      title: '位置',
      dataIndex: 'location',
      key: 'location',
      width: 120
    },
    {
      title: '预计完成时间',
      dataIndex: 'expectedEndTime',
      key: 'expectedEndTime',
      width: 150,
      render: (time: string) => dayjs(time).format('MM-DD HH:mm')
    },
    {
      title: '操作',
      key: 'action',
      width: 150,
      fixed: 'right',
      render: (_, record) => (
        <Space size="small">
          <Tooltip title="查看详情">
            <Button
              type="text"
              icon={<EyeOutlined />}
              onClick={() => handleViewDetail(record)}
            />
          </Tooltip>
          <Tooltip title="查看历史">
            <Button
              type="text"
              icon={<HistoryOutlined />}
              onClick={() => handleViewHistory(record)}
            />
          </Tooltip>
        </Space>
      )
    }
  ]

  return (
    <div>
      {/* 页面标题和统计信息 */}
      <Row gutter={16} style={{ marginBottom: 16 }}>
        <Col span={6}>
          <Card size="small">
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 24, fontWeight: 'bold', color: '#1890ff' }}>
                {trackingData.length}
              </div>
              <div style={{ color: '#666' }}>总样本数</div>
            </div>
          </Card>
        </Col>
        <Col span={6}>
          <Card size="small">
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 24, fontWeight: 'bold', color: '#52c41a' }}>
                {trackingData.filter(item => item.status === 'completed').length}
              </div>
              <div style={{ color: '#666' }}>已完成</div>
            </div>
          </Card>
        </Col>
        <Col span={6}>
          <Card size="small">
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 24, fontWeight: 'bold', color: '#faad14' }}>
                {trackingData.filter(item => item.status === 'processing').length}
              </div>
              <div style={{ color: '#666' }}>处理中</div>
            </div>
          </Card>
        </Col>
        <Col span={6}>
          <Card size="small">
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 24, fontWeight: 'bold', color: '#ff4d4f' }}>
                {trackingData.filter(item => item.status === 'delayed' || item.status === 'error').length}
              </div>
              <div style={{ color: '#666' }}>异常/延期</div>
            </div>
          </Card>
        </Col>
      </Row>

      {/* 异常告警 */}
      {trackingData.some(item => item.status === 'delayed' || item.status === 'error') && (
        <Alert
          message="发现异常样本"
          description={`有 ${trackingData.filter(item => item.status === 'delayed' || item.status === 'error').length} 个样本状态异常，请及时处理`}
          type="warning"
          showIcon
          closable
          style={{ marginBottom: 16 }}
        />
      )}

      {/* 搜索和筛选 */}
      <Card size="small" style={{ marginBottom: 16 }}>
        <Row gutter={16}>
          <Col span={8}>
            <Search
              placeholder="搜索样本编号、名称或项目"
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              onSearch={loadTrackingData}
              enterButton={<SearchOutlined />}
            />
          </Col>
          <Col span={4}>
            <Select
              placeholder="状态筛选"
              value={statusFilter}
              onChange={setStatusFilter}
              allowClear
              style={{ width: '100%' }}
            >
              <Option value="received">已接收</Option>
              <Option value="processing">处理中</Option>
              <Option value="completed">已完成</Option>
              <Option value="delayed">延期</Option>
              <Option value="error">异常</Option>
            </Select>
          </Col>
          <Col span={8}>
            <RangePicker
              placeholder={['开始时间', '结束时间']}
              value={dateRange}
              onChange={setDateRange}
              style={{ width: '100%' }}
            />
          </Col>
          <Col span={4}>
            <Button type="primary" onClick={loadTrackingData} loading={loading}>
              刷新数据
            </Button>
          </Col>
        </Row>
      </Card>

      {/* 追踪数据表格 */}
      <Card title="样本追踪列表" size="small">
        <Table
          columns={columns}
          dataSource={filteredData}
          rowKey="id"
          loading={loading}
          scroll={{ x: 1200 }}
          pagination={{
            total: filteredData.length,
            pageSize: 10,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total) => `共 ${total} 条记录`
          }}
        />
      </Card>

      {/* 详情模态框 */}
      <Modal
        title="样本追踪详情"
        open={detailModalVisible}
        onCancel={() => setDetailModalVisible(false)}
        footer={null}
        width={800}
      >
        {selectedRecord && (
          <div>
            <Descriptions bordered size="small" column={2}>
              <Descriptions.Item label="样本编号">{selectedRecord.sampleCode}</Descriptions.Item>
              <Descriptions.Item label="样本名称">{selectedRecord.sampleName}</Descriptions.Item>
              <Descriptions.Item label="项目名称" span={2}>{selectedRecord.projectName}</Descriptions.Item>
              <Descriptions.Item label="当前阶段">{selectedRecord.currentStage}</Descriptions.Item>
              <Descriptions.Item label="状态">
                <Tag color={getStatusColor(selectedRecord.status)}>
                  {getStatusText(selectedRecord.status)}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="进度">
                <Progress percent={selectedRecord.progress} size="small" />
              </Descriptions.Item>
              <Descriptions.Item label="负责人">{selectedRecord.assignee}</Descriptions.Item>
              <Descriptions.Item label="位置">{selectedRecord.location}</Descriptions.Item>
              <Descriptions.Item label="开始时间">{selectedRecord.startTime}</Descriptions.Item>
              <Descriptions.Item label="预计完成时间">{selectedRecord.expectedEndTime}</Descriptions.Item>
              {selectedRecord.actualEndTime && (
                <Descriptions.Item label="实际完成时间">{selectedRecord.actualEndTime}</Descriptions.Item>
              )}
              {selectedRecord.notes && (
                <Descriptions.Item label="备注" span={2}>{selectedRecord.notes}</Descriptions.Item>
              )}
            </Descriptions>

            <div style={{ marginTop: 24 }}>
              <h4>流程进度</h4>
              <Steps
                direction="vertical"
                size="small"
                current={2}
                items={mockSampleSteps.map(step => ({
                  title: step.stepName,
                  description: step.notes,
                  status: step.status === 'error' ? 'error' : 
                          step.status === 'processing' ? 'process' :
                          step.status === 'completed' ? 'finish' : 'wait',
                  icon: getStepIcon(step.status)
                }))}
              />
            </div>
          </div>
        )}
      </Modal>

      {/* 历史记录模态框 */}
      <Modal
        title="样本历史记录"
        open={historyModalVisible}
        onCancel={() => setHistoryModalVisible(false)}
        footer={null}
        width={600}
      >
        {selectedRecord && (
          <Timeline
            items={mockSampleSteps
              .filter(step => step.status === 'completed' || step.status === 'processing')
              .map(step => ({
                dot: getStepIcon(step.status),
                children: (
                  <div>
                    <div style={{ fontWeight: 'bold' }}>{step.stepName}</div>
                    {step.startTime && (
                      <div style={{ fontSize: 12, color: '#666' }}>
                        开始时间: {step.startTime}
                      </div>
                    )}
                    {step.endTime && (
                      <div style={{ fontSize: 12, color: '#666' }}>
                        结束时间: {step.endTime}
                      </div>
                    )}
                    {step.operator && (
                      <div style={{ fontSize: 12, color: '#666' }}>
                        操作人: {step.operator}
                      </div>
                    )}
                    {step.duration && (
                      <div style={{ fontSize: 12, color: '#666' }}>
                        耗时: {step.duration} 分钟
                      </div>
                    )}
                    {step.notes && (
                      <div style={{ fontSize: 12, color: '#999', marginTop: 4 }}>
                        {step.notes}
                      </div>
                    )}
                  </div>
                )
              }))}
          />
        )}
      </Modal>
    </div>
  )
}

export default SampleTracking