import React, { useEffect } from 'react'
import { Row, Col, Card, Statistic, Progress, Table, Tag, Space, Typography, Timeline } from 'antd'
import { 
  ProjectOutlined, 
  ExperimentOutlined, 
  BarChartOutlined, 
  FileTextOutlined,
  TrophyOutlined,
  ClockCircleOutlined,
  CheckCircleOutlined
} from '@ant-design/icons'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'
import { useAppStore } from '../../store'

const { Title, Text } = Typography

/**
 * 仪表板页面组件
 * 显示系统整体运行状态、统计数据和关键指标
 */
const Dashboard: React.FC = () => {
  const { setBreadcrumbs } = useAppStore()

  useEffect(() => {
    setBreadcrumbs([{ title: '首页' }, { title: '工作台' }])
  }, [setBreadcrumbs])

  // 模拟统计数据
  const statistics = {
    totalProjects: 156,
    activeProjects: 23,
    totalSamples: 1248,
    samplesInProgress: 89,
    completedSamples: 1159,
    pendingReports: 12,
    equipmentUtilization: 85
  }

  // 模拟月度趋势数据
  const monthlyTrends = [
    { month: '1月', projects: 12, samples: 89, reports: 15 },
    { month: '2月', projects: 15, samples: 102, reports: 18 },
    { month: '3月', samples: 125, reports: 22, projects: 18 },
    { month: '4月', projects: 20, samples: 134, reports: 25 },
    { month: '5月', projects: 22, samples: 145, reports: 28 },
    { month: '6月', projects: 25, samples: 156, reports: 30 }
  ]

  // 样本状态分布数据
  const sampleStatusData = [
    { name: '已完成', value: 1159, color: '#52c41a' },
    { name: '进行中', value: 89, color: '#1890ff' },
    { name: '待处理', value: 45, color: '#faad14' },
    { name: '异常', value: 8, color: '#ff4d4f' }
  ]

  // 最近项目数据
  const recentProjects = [
    {
      key: '1',
      name: '肠道微生物多样性分析',
      customer: '第一人民医院',
      status: 'in_progress',
      progress: 75,
      samples: 24,
      dueDate: '2024-02-15'
    },
    {
      key: '2',
      name: '土壤微生物群落结构研究',
      customer: '农业科学院',
      status: 'completed',
      progress: 100,
      samples: 36,
      dueDate: '2024-01-30'
    },
    {
      key: '3',
      name: '海洋微生物基因组测序',
      customer: '海洋研究所',
      status: 'pending',
      progress: 25,
      samples: 18,
      dueDate: '2024-03-01'
    }
  ]

  // 最近活动时间线
  const recentActivities = [
    {
      color: 'green',
      dot: <CheckCircleOutlined />,
      children: (
        <div>
          <Text strong>项目 PRJ-2024-001 已完成</Text>
          <br />
          <Text type="secondary">2小时前</Text>
        </div>
      )
    },
    {
      color: 'blue',
      dot: <ExperimentOutlined />,
      children: (
        <div>
          <Text strong>样本 SMP-2024-156 开始测序</Text>
          <br />
          <Text type="secondary">4小时前</Text>
        </div>
      )
    },
    {
      color: 'orange',
      dot: <ClockCircleOutlined />,
      children: (
        <div>
          <Text strong>报告 RPT-2024-089 待审核</Text>
          <br />
          <Text type="secondary">6小时前</Text>
        </div>
      )
    },
    {
      color: 'green',
      dot: <TrophyOutlined />,
      children: (
        <div>
          <Text strong>新客户注册：生物技术公司</Text>
          <br />
          <Text type="secondary">1天前</Text>
        </div>
      )
    }
  ]

  const projectColumns = [
    {
      title: '项目名称',
      dataIndex: 'name',
      key: 'name',
      render: (text: string) => <Text strong>{text}</Text>
    },
    {
      title: '客户',
      dataIndex: 'customer',
      key: 'customer'
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => {
        const statusMap = {
          'pending': { color: 'orange', text: '待开始' },
          'in_progress': { color: 'blue', text: '进行中' },
          'completed': { color: 'green', text: '已完成' }
        }
        const config = statusMap[status as keyof typeof statusMap]
        return <Tag color={config.color}>{config.text}</Tag>
      }
    },
    {
      title: '进度',
      dataIndex: 'progress',
      key: 'progress',
      render: (progress: number) => (
        <Progress percent={progress} size="small" />
      )
    },
    {
      title: '样本数',
      dataIndex: 'samples',
      key: 'samples'
    },
    {
      title: '截止日期',
      dataIndex: 'dueDate',
      key: 'dueDate'
    }
  ]

  return (
    <div>
      <Title level={2} style={{ marginBottom: 24 }}>
        工作台
      </Title>

      {/* 统计卡片 */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="总项目数"
              value={statistics.totalProjects}
              prefix={<ProjectOutlined />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="进行中项目"
              value={statistics.activeProjects}
              prefix={<ClockCircleOutlined />}
              valueStyle={{ color: '#faad14' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="总样本数"
              value={statistics.totalSamples}
              prefix={<ExperimentOutlined />}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="待审核报告"
              value={statistics.pendingReports}
              prefix={<FileTextOutlined />}
              valueStyle={{ color: '#ff4d4f' }}
            />
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        {/* 月度趋势图 */}
        <Col xs={24} lg={16}>
          <Card title="月度趋势" className="content-card">
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={monthlyTrends}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="projects" stroke="#1890ff" name="项目数" />
                <Line type="monotone" dataKey="samples" stroke="#52c41a" name="样本数" />
                <Line type="monotone" dataKey="reports" stroke="#faad14" name="报告数" />
              </LineChart>
            </ResponsiveContainer>
          </Card>
        </Col>

        {/* 样本状态分布 */}
        <Col xs={24} lg={8}>
          <Card title="样本状态分布" className="content-card">
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={sampleStatusData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                >
                  {sampleStatusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]}>
        {/* 最近项目 */}
        <Col xs={24} lg={16}>
          <Card title="最近项目" className="content-card">
            <Table
              columns={projectColumns}
              dataSource={recentProjects}
              pagination={false}
              size="small"
            />
          </Card>
        </Col>

        {/* 最近活动 */}
        <Col xs={24} lg={8}>
          <Card title="最近活动" className="content-card">
            <Timeline items={recentActivities} />
          </Card>
        </Col>
      </Row>
    </div>
  )
}

export default Dashboard