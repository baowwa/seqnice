import React, { useState, useEffect } from 'react'
import {
  Card,
  Tabs,
  Table,
  Button,
  Space,
  Tag,
  Progress,
  Modal,
  Form,
  Input,
  Select,
  Row,
  Col,
  Statistic,
  Steps,
  Drawer,
  List,
  Typography,
  Divider,
  message,
  Checkbox,
  DatePicker,
  Upload,
  Timeline,
  Alert
} from 'antd'
import {
  PlusOutlined,
  PlayCircleOutlined,
  PauseCircleOutlined,
  StopOutlined,
  EyeOutlined,
  DownloadOutlined,
  ReloadOutlined,
  SearchOutlined,
  SettingOutlined,
  FileTextOutlined,
  ClockCircleOutlined,
  CheckCircleOutlined,
  ExclamationCircleOutlined,
  BarChartOutlined,
  DatabaseOutlined,
  CloudUploadOutlined
} from '@ant-design/icons'

const { TabPane } = Tabs
const { Option } = Select
const { Title, Text } = Typography
const { Step } = Steps
const { TextArea } = Input

/**
 * 生信分析任务中心组件
 * 按照分析任务.md文档设计，包含三个标签页：待分析任务、分析中任务、已完成任务
 */
const AnalysisTasks: React.FC = () => {
  const [activeTab, setActiveTab] = useState('pending')
  const [loading, setLoading] = useState(false)
  const [createModalVisible, setCreateModalVisible] = useState(false)
  const [detailDrawerVisible, setDetailDrawerVisible] = useState(false)
  const [selectedTask, setSelectedTask] = useState<any>(null)
  const [createForm] = Form.useForm()
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([])
  const [currentStep, setCurrentStep] = useState(0)

  // 模拟数据
  const [pendingTasks, setPendingTasks] = useState([
    {
      id: 'SEQ_001',
      sequencingTaskId: 'SEQ_20240520_001',
      poolCount: 2,
      dataSize: '200GB',
      createTime: '2024-05-20 18:00:00',
      status: 'pending',
      samples: ['S001', 'S002', 'S003']
    },
    {
      id: 'SEQ_002',
      sequencingTaskId: 'SEQ_20240520_002',
      poolCount: 1,
      dataSize: '100GB',
      createTime: '2024-05-20 19:00:00',
      status: 'pending',
      samples: ['S004', 'S005']
    },
    {
      id: 'SEQ_003',
      sequencingTaskId: 'SEQ_20240520_003',
      poolCount: 3,
      dataSize: '300GB',
      createTime: '2024-05-20 20:00:00',
      status: 'pending',
      samples: ['S006', 'S007', 'S008', 'S009']
    }
  ])

  const [runningTasks, setRunningTasks] = useState([
    {
      id: 'ANALYSIS_20240520_001',
      taskName: '标准胚系变异分析',
      progress: 65,
      currentStep: 'base_recalibration',
      status: 'running',
      operator: '陈七',
      createTime: '2024-05-20 18:00:00',
      estimatedTime: '06:00',
      runningTime: '2小时',
      steps: {
        qc: { status: 'completed', progress: 100, duration: '15分钟' },
        trimming: { status: 'completed', progress: 100, duration: '20分钟' },
        alignment: { status: 'completed', progress: 100, duration: '45分钟' },
        mark_duplicates: { status: 'completed', progress: 100, duration: '10分钟' },
        base_recalibration: { status: 'running', progress: 65, duration: '已运行30分钟' },
        variant_calling: { status: 'pending', progress: 0, duration: '-' },
        annotation: { status: 'pending', progress: 0, duration: '-' },
        reporting: { status: 'pending', progress: 0, duration: '-' }
      }
    }
  ])

  const [completedTasks, setCompletedTasks] = useState([
    {
      id: 'ANALYSIS_20240519_001',
      taskName: '全基因组变异分析',
      status: 'completed',
      operator: '李四',
      createTime: '2024-05-19 10:00:00',
      completeTime: '2024-05-19 16:30:00',
      duration: '6小时30分钟',
      sampleCount: 3,
      variantCount: '4.2M',
      alignmentRate: '98.5%',
      coverage: '50x'
    }
  ])

  // 待分析任务表格列
  const pendingColumns = [
    {
      title: '测序任务ID',
      dataIndex: 'sequencingTaskId',
      key: 'sequencingTaskId',
      render: (text: string) => <Text strong>{text}</Text>
    },
    {
      title: '混样数',
      dataIndex: 'poolCount',
      key: 'poolCount',
      render: (count: number) => `${count}混样`
    },
    {
      title: '数据量',
      dataIndex: 'dataSize',
      key: 'dataSize'
    },
    {
      title: '创建时间',
      dataIndex: 'createTime',
      key: 'createTime'
    },
    {
      title: '操作',
      key: 'action',
      render: (_, record) => (
        <Space>
          <Button 
            type="primary" 
            size="small" 
            icon={<PlayCircleOutlined />}
            onClick={() => handleStartAnalysis(record)}
          >
            开始分析
          </Button>
          <Button 
            size="small" 
            icon={<EyeOutlined />}
            onClick={() => handleViewDetail(record)}
          >
            查看详情
          </Button>
        </Space>
      )
    }
  ]

  // 分析中任务表格列
  const runningColumns = [
    {
      title: '任务ID',
      dataIndex: 'id',
      key: 'id',
      render: (text: string) => <Text strong>{text}</Text>
    },
    {
      title: '任务名称',
      dataIndex: 'taskName',
      key: 'taskName'
    },
    {
      title: '进度',
      dataIndex: 'progress',
      key: 'progress',
      render: (progress: number) => (
        <Progress 
          percent={progress} 
          size="small" 
          status={progress === 100 ? 'success' : 'active'}
        />
      )
    },
    {
      title: '当前步骤',
      dataIndex: 'currentStep',
      key: 'currentStep',
      render: (step: string) => {
        const stepNames = {
          qc: '数据质控',
          trimming: '接头去除',
          alignment: '序列比对',
          mark_duplicates: '标记重复',
          base_recalibration: '质量重校准',
          variant_calling: '变异检测',
          annotation: '变异注释',
          reporting: '生成报告'
        }
        return stepNames[step] || step
      }
    },
    {
      title: '负责人',
      dataIndex: 'operator',
      key: 'operator'
    },
    {
      title: '运行时间',
      dataIndex: 'runningTime',
      key: 'runningTime'
    },
    {
      title: '操作',
      key: 'action',
      render: (_, record) => (
        <Space>
          <Button 
            size="small" 
            icon={<EyeOutlined />}
            onClick={() => handleViewDetail(record)}
          >
            查看详情
          </Button>
          <Button 
            size="small" 
            icon={<PauseCircleOutlined />}
            onClick={() => handlePauseTask(record)}
          >
            暂停
          </Button>
          <Button 
            size="small" 
            danger
            icon={<StopOutlined />}
            onClick={() => handleStopTask(record)}
          >
            停止
          </Button>
        </Space>
      )
    }
  ]

  // 已完成任务表格列
  const completedColumns = [
    {
      title: '任务ID',
      dataIndex: 'id',
      key: 'id',
      render: (text: string) => <Text strong>{text}</Text>
    },
    {
      title: '任务名称',
      dataIndex: 'taskName',
      key: 'taskName'
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => (
        <Tag color={status === 'completed' ? 'success' : 'error'}>
          {status === 'completed' ? '已完成' : '失败'}
        </Tag>
      )
    },
    {
      title: '负责人',
      dataIndex: 'operator',
      key: 'operator'
    },
    {
      title: '完成时间',
      dataIndex: 'completeTime',
      key: 'completeTime'
    },
    {
      title: '耗时',
      dataIndex: 'duration',
      key: 'duration'
    },
    {
      title: '操作',
      key: 'action',
      render: (_, record) => (
        <Space>
          <Button 
            size="small" 
            icon={<EyeOutlined />}
            onClick={() => handleViewResult(record)}
          >
            查看结果
          </Button>
          <Button 
            size="small" 
            icon={<DownloadOutlined />}
            onClick={() => handleDownloadResult(record)}
          >
            下载
          </Button>
        </Space>
      )
    }
  ]

  // 事件处理函数
  const handleStartAnalysis = (record: any) => {
    setCreateModalVisible(true)
    // 预填充测序任务信息
    createForm.setFieldsValue({
      sequencingTaskId: record.sequencingTaskId,
      samples: record.samples
    })
  }

  const handleViewDetail = (record: any) => {
    setSelectedTask(record)
    setDetailDrawerVisible(true)
  }

  const handleViewResult = (record: any) => {
    setSelectedTask(record)
    setDetailDrawerVisible(true)
  }

  const handlePauseTask = (record: any) => {
    message.info(`暂停任务: ${record.id}`)
  }

  const handleStopTask = (record: any) => {
    Modal.confirm({
      title: '确认停止任务',
      content: `确定要停止任务 ${record.id} 吗？`,
      onOk: () => {
        message.success('任务已停止')
      }
    })
  }

  const handleDownloadResult = (record: any) => {
    message.info(`下载结果: ${record.id}`)
  }

  const handleCreateTask = (values: any) => {
    console.log('创建分析任务:', values)
    message.success('分析任务创建成功')
    setCreateModalVisible(false)
    createForm.resetFields()
    setCurrentStep(0)
  }

  const handleBatchCreate = () => {
    if (selectedRowKeys.length === 0) {
      message.warning('请选择要批量创建任务的测序数据')
      return
    }
    message.info(`批量创建 ${selectedRowKeys.length} 个分析任务`)
  }

  const nextStep = () => {
    setCurrentStep(currentStep + 1)
  }

  const prevStep = () => {
    setCurrentStep(currentStep - 1)
  }

  // 渲染快捷操作面板
  const renderQuickActions = () => (
    <Card title="快捷操作面板" size="small" style={{ marginBottom: 16 }}>
      <Row gutter={[16, 16]}>
        <Col span={6}>
          <Card size="small" hoverable>
            <Statistic
              title="🚀 批量操作"
              value=""
              formatter={() => (
                <Space direction="vertical" size="small">
                  <Button size="small" block>批量创建任务</Button>
                  <Button size="small" block>批量下载结果</Button>
                </Space>
              )}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card size="small" hoverable>
            <Statistic
              title="📊 分析监控"
              value=""
              formatter={() => (
                <Space direction="vertical" size="small">
                  <Button size="small" block>运行中任务</Button>
                  <Button size="small" block>系统负载</Button>
                </Space>
              )}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card size="small" hoverable>
            <Statistic
              title="⚙️ 流程管理"
              value=""
              formatter={() => (
                <Space direction="vertical" size="small">
                  <Button size="small" block>流程模板</Button>
                  <Button size="small" block>参数设置</Button>
                </Space>
              )}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card size="small" hoverable>
            <Statistic
              title="📁 数据管理"
              value=""
              formatter={() => (
                <Space direction="vertical" size="small">
                  <Button size="small" block>结果浏览</Button>
                  <Button size="small" block>数据归档</Button>
                </Space>
              )}
            />
          </Card>
        </Col>
      </Row>
    </Card>
  )

  // 渲染统计信息
  const renderStatistics = () => (
    <Row gutter={16} style={{ marginBottom: 16 }}>
      <Col span={6}>
        <Card size="small">
          <Statistic
            title="待分析任务"
            value={pendingTasks.length}
            valueStyle={{ color: '#1890ff' }}
            prefix={<ClockCircleOutlined />}
          />
        </Card>
      </Col>
      <Col span={6}>
        <Card size="small">
          <Statistic
            title="分析中任务"
            value={runningTasks.length}
            valueStyle={{ color: '#faad14' }}
            prefix={<PlayCircleOutlined />}
          />
        </Card>
      </Col>
      <Col span={6}>
        <Card size="small">
          <Statistic
            title="已完成任务"
            value={completedTasks.length}
            valueStyle={{ color: '#52c41a' }}
            prefix={<CheckCircleOutlined />}
          />
        </Card>
      </Col>
      <Col span={6}>
        <Card size="small">
          <Statistic
            title="成功率"
            value={72.5}
            precision={1}
            valueStyle={{ color: '#52c41a' }}
            prefix={<BarChartOutlined />}
            suffix="%"
          />
        </Card>
      </Col>
    </Row>
  )

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <Title level={3}>生信分析任务中心</Title>
        <Space>
          <Button 
            type="primary" 
            icon={<PlusOutlined />}
            onClick={() => setCreateModalVisible(true)}
          >
            创建分析任务
          </Button>
          <Button icon={<ReloadOutlined />} onClick={() => setLoading(true)}>
            刷新
          </Button>
        </Space>
      </div>

      {renderStatistics()}
      {renderQuickActions()}

      <Card>
        <Tabs 
          activeKey={activeTab} 
          onChange={setActiveTab}
          items={[
            {
              key: 'pending',
              label: `待分析任务(${pendingTasks.length})`,
              children: (
                <div>
                  <div style={{ marginBottom: 16 }}>
                    <Space>
                      <Checkbox
                        indeterminate={selectedRowKeys.length > 0 && selectedRowKeys.length < pendingTasks.length}
                        checked={selectedRowKeys.length === pendingTasks.length}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedRowKeys(pendingTasks.map(item => item.id))
                          } else {
                            setSelectedRowKeys([])
                          }
                        }}
                      >
                        全选
                      </Checkbox>
                      <Button 
                        type="primary"
                        disabled={selectedRowKeys.length === 0}
                        onClick={handleBatchCreate}
                      >
                        批量创建分析任务
                      </Button>
                    </Space>
                  </div>
                  <Table
                    columns={pendingColumns}
                    dataSource={pendingTasks}
                    rowKey="id"
                    loading={loading}
                    rowSelection={{
                      selectedRowKeys,
                      onChange: setSelectedRowKeys
                    }}
                    pagination={{
                      showSizeChanger: true,
                      showQuickJumper: true,
                      showTotal: (total) => `共 ${total} 条记录`
                    }}
                  />
                </div>
              )
            },
            {
              key: 'running',
              label: `分析中任务(${runningTasks.length})`,
              children: (
                <Table
                  columns={runningColumns}
                  dataSource={runningTasks}
                  rowKey="id"
                  loading={loading}
                  pagination={{
                    showSizeChanger: true,
                    showQuickJumper: true,
                    showTotal: (total) => `共 ${total} 条记录`
                  }}
                />
              )
            },
            {
              key: 'completed',
              label: `已完成任务(${completedTasks.length})`,
              children: (
                <Table
                  columns={completedColumns}
                  dataSource={completedTasks}
                  rowKey="id"
                  loading={loading}
                  pagination={{
                    showSizeChanger: true,
                    showQuickJumper: true,
                    showTotal: (total) => `共 ${total} 条记录`
                  }}
                />
              )
            }
          ]}
        />
      </Card>

      {/* 创建分析任务模态框 */}
      <Modal
        title="创建生信分析任务"
        open={createModalVisible}
        onCancel={() => {
          setCreateModalVisible(false)
          setCurrentStep(0)
          createForm.resetFields()
        }}
        footer={null}
        width={800}
      >
        <Steps current={currentStep} style={{ marginBottom: 24 }}>
          <Step title="选择测序任务" />
          <Step title="选择分析流程" />
          <Step title="任务设置" />
        </Steps>

        <Form
          form={createForm}
          layout="vertical"
          onFinish={handleCreateTask}
        >
          {currentStep === 0 && (
            <div>
              <Alert
                message="选择已完成测序且未分析的任务"
                type="info"
                style={{ marginBottom: 16 }}
              />
              <Form.Item
                name="sequencingTaskId"
                label="测序任务ID"
                rules={[{ required: true, message: '请选择测序任务' }]}
              >
                <Select placeholder="请选择测序任务">
                  <Option value="SEQ_20240520_001">SEQ_20240520_001 - 混样数:2 - 数据量:200GB</Option>
                  <Option value="SEQ_20240520_002">SEQ_20240520_002 - 混样数:1 - 数据量:100GB</Option>
                  <Option value="SEQ_20240520_003">SEQ_20240520_003 - 混样数:3 - 数据量:300GB</Option>
                </Select>
              </Form.Item>
              <div style={{ textAlign: 'right' }}>
                <Button type="primary" onClick={nextStep}>
                  下一步:选择分析流程
                </Button>
              </div>
            </div>
          )}

          {currentStep === 1 && (
            <div>
              <Form.Item
                name="analysisType"
                label="分析类型"
                rules={[{ required: true, message: '请选择分析类型' }]}
              >
                <Select placeholder="请选择分析类型">
                  <Option value="WGS">全基因组测序 (WGS)</Option>
                  <Option value="WES">全外显子测序 (WES)</Option>
                  <Option value="RNA-seq">RNA测序</Option>
                  <Option value="ChIP-seq">ChIP测序</Option>
                </Select>
              </Form.Item>

              <Form.Item
                name="pipelineTemplate"
                label="流程模板"
                rules={[{ required: true, message: '请选择流程模板' }]}
              >
                <Select placeholder="请选择流程模板">
                  <Option value="germline">标准胚系变异分析 (Germline Variant Calling)</Option>
                  <Option value="somatic">体细胞变异分析 (Somatic Variant Calling)</Option>
                  <Option value="structural">结构变异分析 (Structural Variant Analysis)</Option>
                  <Option value="cnv">拷贝数变异分析 (CNV Analysis)</Option>
                </Select>
              </Form.Item>

              <Form.Item
                name="referenceGenome"
                label="参考基因组"
                rules={[{ required: true, message: '请选择参考基因组' }]}
              >
                <Select placeholder="请选择参考基因组">
                  <Option value="GRCh38">GRCh38 (hg38)</Option>
                  <Option value="GRCh37">GRCh37 (hg19)</Option>
                </Select>
              </Form.Item>

              <div style={{ textAlign: 'right' }}>
                <Space>
                  <Button onClick={prevStep}>上一步</Button>
                  <Button type="primary" onClick={nextStep}>
                    下一步:任务设置
                  </Button>
                </Space>
              </div>
            </div>
          )}

          {currentStep === 2 && (
            <div>
              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item
                    name="taskName"
                    label="任务名称"
                    rules={[{ required: true, message: '请输入任务名称' }]}
                  >
                    <Input placeholder="请输入任务名称" />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item
                    name="operator"
                    label="负责人"
                    rules={[{ required: true, message: '请选择负责人' }]}
                  >
                    <Select placeholder="请选择负责人">
                      <Option value="陈七">生信分析员A</Option>
                      <Option value="李四">生信分析员B</Option>
                    </Select>
                  </Form.Item>
                </Col>
              </Row>

              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item
                    name="priority"
                    label="优先级"
                    rules={[{ required: true, message: '请选择优先级' }]}
                  >
                    <Select placeholder="请选择优先级">
                      <Option value="low">低</Option>
                      <Option value="medium">普通</Option>
                      <Option value="high">高</Option>
                      <Option value="urgent">紧急</Option>
                    </Select>
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item
                    name="computeResource"
                    label="计算资源"
                    rules={[{ required: true, message: '请选择计算资源' }]}
                  >
                    <Select placeholder="请选择计算资源">
                      <Option value="standard">标准节点 (32核, 128GB内存)</Option>
                      <Option value="high_mem">高内存节点 (64核, 256GB内存)</Option>
                      <Option value="gpu">GPU节点 (32核, 128GB内存, 4GPU)</Option>
                    </Select>
                  </Form.Item>
                </Col>
              </Row>

              <Form.Item
                name="description"
                label="备注"
              >
                <TextArea rows={3} placeholder="请输入备注信息" />
              </Form.Item>

              <div style={{ textAlign: 'right' }}>
                <Space>
                  <Button onClick={prevStep}>上一步</Button>
                  <Button type="primary" htmlType="submit">
                    创建分析任务
                  </Button>
                </Space>
              </div>
            </div>
          )}
        </Form>
      </Modal>

      {/* 任务详情抽屉 */}
      <Drawer
        title={selectedTask?.id || '任务详情'}
        placement="right"
        size="large"
        open={detailDrawerVisible}
        onClose={() => setDetailDrawerVisible(false)}
      >
        {selectedTask && (
          <div>
            {selectedTask.status === 'running' && (
              <div>
                <Card title="任务信息" size="small" style={{ marginBottom: 16 }}>
                  <Row gutter={16}>
                    <Col span={8}>
                      <Statistic title="状态" value="🔄 分析中" />
                    </Col>
                    <Col span={8}>
                      <Statistic title="负责人" value={selectedTask.operator} />
                    </Col>
                    <Col span={8}>
                      <Statistic title="创建时间" value={selectedTask.createTime} />
                    </Col>
                  </Row>
                  <Row gutter={16} style={{ marginTop: 16 }}>
                    <Col span={8}>
                      <Statistic title="进度" value={`${selectedTask.progress}%`} />
                    </Col>
                    <Col span={8}>
                      <Statistic title="预计完成" value={selectedTask.estimatedTime} />
                    </Col>
                    <Col span={8}>
                      <Statistic title="已运行" value={selectedTask.runningTime} />
                    </Col>
                  </Row>
                </Card>

                <Card title="分析步骤进度" size="small" style={{ marginBottom: 16 }}>
                  <Table
                    size="small"
                    columns={[
                      { title: '步骤', dataIndex: 'step', key: 'step' },
                      { title: '状态', dataIndex: 'status', key: 'status', render: (status) => {
                        const statusMap = {
                          completed: <Tag color="success">✅ 完成</Tag>,
                          running: <Tag color="processing">🔄 运行中</Tag>,
                          pending: <Tag color="default">⏳ 待开始</Tag>
                        }
                        return statusMap[status]
                      }},
                      { title: '进度', dataIndex: 'progress', key: 'progress', render: (progress) => `${progress}%` },
                      { title: '耗时', dataIndex: 'duration', key: 'duration' }
                    ]}
                    dataSource={[
                      { key: '1', step: '数据质控', ...selectedTask.steps.qc },
                      { key: '2', step: '接头去除', ...selectedTask.steps.trimming },
                      { key: '3', step: '序列比对', ...selectedTask.steps.alignment },
                      { key: '4', step: '标记重复', ...selectedTask.steps.mark_duplicates },
                      { key: '5', step: '质量重校准', ...selectedTask.steps.base_recalibration },
                      { key: '6', step: '变异检测', ...selectedTask.steps.variant_calling },
                      { key: '7', step: '变异注释', ...selectedTask.steps.annotation },
                      { key: '8', step: '生成报告', ...selectedTask.steps.reporting }
                    ]}
                    pagination={false}
                  />
                </Card>

                <Card title="实时日志" size="small">
                  <div style={{ height: 200, overflow: 'auto', backgroundColor: '#f5f5f5', padding: 8 }}>
                    <Text code>2024-05-20 20:15:00 - 开始碱基质量重校准步骤</Text><br />
                    <Text code>2024-05-20 20:20:00 - 处理样本S001</Text><br />
                    <Text code>2024-05-20 20:25:00 - 处理样本S002</Text><br />
                    <Text code>2024-05-20 20:30:00 - 处理样本S003</Text><br />
                    <Text code>2024-05-20 20:35:00 - 质量重校准进度: 65%</Text><br />
                  </div>
                </Card>

                <div style={{ marginTop: 16, textAlign: 'center' }}>
                  <Space>
                    <Button icon={<PauseCircleOutlined />}>暂停任务</Button>
                    <Button danger icon={<StopOutlined />}>停止任务</Button>
                    <Button icon={<FileTextOutlined />}>查看详细日志</Button>
                  </Space>
                </div>
              </div>
            )}

            {selectedTask.status === 'completed' && (
              <div>
                <Card title="结果概览" size="small" style={{ marginBottom: 16 }}>
                  <Row gutter={16}>
                    <Col span={6}>
                      <Statistic title="总样本数" value={selectedTask.sampleCount} />
                    </Col>
                    <Col span={6}>
                      <Statistic title="比对率" value={selectedTask.alignmentRate} />
                    </Col>
                    <Col span={6}>
                      <Statistic title="平均覆盖度" value={selectedTask.coverage} />
                    </Col>
                    <Col span={6}>
                      <Statistic title="变异总数" value={selectedTask.variantCount} />
                    </Col>
                  </Row>
                </Card>

                <Card title="质量评估报告" size="small" style={{ marginBottom: 16 }}>
                  <List
                    size="small"
                    dataSource={[
                      '📊 FastQC报告: 所有样本质控通过',
                      '📊 比对统计: 各样本比对率均在98%以上',
                      '📊 覆盖度分析: 目标区域覆盖度均匀',
                      '📊 变异统计: 变异类型分布正常'
                    ]}
                    renderItem={item => <List.Item>{item}</List.Item>}
                  />
                </Card>

                <Card title="结果文件列表" size="small">
                  <Table
                    size="small"
                    columns={[
                      { title: '文件类型', dataIndex: 'type', key: 'type' },
                      { title: '文件大小', dataIndex: 'size', key: 'size' },
                      { title: '下载次数', dataIndex: 'downloads', key: 'downloads' },
                      { title: '操作', key: 'action', render: () => (
                        <Button size="small" icon={<DownloadOutlined />}>下载</Button>
                      )}
                    ]}
                    dataSource={[
                      { key: '1', type: '变异检测VCF文件', size: '2.5GB', downloads: 5 },
                      { key: '2', type: '变异注释报告', size: '1.2GB', downloads: 3 },
                      { key: '3', type: '分析汇总报告', size: '15MB', downloads: 10 },
                      { key: '4', type: '原始数据质控报告', size: '5MB', downloads: 2 }
                    ]}
                    pagination={false}
                  />
                </Card>
              </div>
            )}
          </div>
        )}
      </Drawer>
    </div>
  )
}

export default AnalysisTasks