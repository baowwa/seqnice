import React, { useState } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { 
  Card, 
  Row, 
  Col, 
  Button, 
  Space, 
  Statistic, 
  Progress, 
  Tag, 
  List, 
  Avatar,
  Typography,
  Divider,
  Badge
} from 'antd'
import { 
  ProjectOutlined, 
  UserOutlined, 
  FileTextOutlined, 
  BarChartOutlined,
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  EyeOutlined
} from '@ant-design/icons'
import ProjectCategory from './ProjectCategory'
import ProjectIndex from './index'

const { Title, Text } = Typography

/**
 * 项目工作台主页面
 * 提供项目概览、快速操作和项目列表
 */
const ProjectManagement: React.FC = () => {
  const [activeView, setActiveView] = useState<'dashboard' | 'category' | 'management'>('dashboard')

  // 模拟项目数据
  const projectStats = {
    total: 68,
    active: 45,
    completed: 18,
    pending: 5
  }

  // 模拟项目分类统计
  const categoryStats = [
    { name: '全部项目', count: 68, color: '#1890ff' },
    { name: '产品注册', count: 25, color: '#52c41a' },
    { name: '研发验证', count: 18, color: '#faad14' },
    { name: '科研服务', count: 15, color: '#722ed1' },
    { name: '临床检测', count: 10, color: '#eb2f96' }
  ]

  // 模拟最新项目列表
  const recentProjects = [
    {
      id: 'P-REG-2024-001',
      name: '产品注册项目',
      type: '结核杆菌检测试剂注册申请',
      status: '研发验证阶段',
      progress: 75,
      responsible: '张主任',
      client: 'XX医院',
      samples: 200
    },
    {
      id: 'P-RS-2024-002',
      name: '科研服务项目',
      type: 'HIV病毒载量检测服务',
      status: '服务执行阶段',
      progress: 50,
      responsible: '李医生',
      client: 'XX医院',
      samples: 200
    },
    {
      id: 'P-RD-2024-003',
      name: '研发验证项目',
      type: '新型肿瘤标志物检测方法开发',
      status: '方案设计阶段',
      progress: 30,
      responsible: '王研究员',
      client: 'XX医院',
      samples: 150
    }
  ]

  const renderDashboard = () => (
    <div>
      {/* 页面标题 */}
      <div style={{ marginBottom: 24 }}>
        <Title level={3} style={{ margin: 0 }}>项目工作台</Title>
      </div>

      {/* 快速操作按钮 */}
      <Row gutter={16} style={{ marginBottom: 24 }}>
        <Col span={8}>
          <Button 
            type="default" 
            size="large" 
            block
            onClick={() => setActiveView('management')}
          >
            项目看板
          </Button>
        </Col>
        <Col span={8}>
          <Button 
            type="default" 
            size="large" 
            block
            onClick={() => setActiveView('management')}
          >
            我的任务
          </Button>
        </Col>
        <Col span={8}>
          <Button 
            type="default" 
            size="large" 
            block
            onClick={() => setActiveView('management')}
          >
            项目统计
          </Button>
        </Col>
      </Row>

      {/* 项目分类视图 */}
      <Card title="项目分类视图" style={{ marginBottom: 24 }}>
        <Row gutter={[16, 16]}>
          {categoryStats.map((category, index) => (
            <Col span={4} key={index}>
              <div 
                style={{ 
                  textAlign: 'center', 
                  padding: '16px',
                  border: '1px solid #f0f0f0',
                  borderRadius: '6px',
                  cursor: 'pointer'
                }}
                onClick={() => setActiveView('management')}
              >
                <div 
                  style={{ 
                    width: '40px', 
                    height: '40px', 
                    backgroundColor: category.color,
                    borderRadius: '50%',
                    margin: '0 auto 8px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  <ProjectOutlined style={{ color: 'white', fontSize: '18px' }} />
                </div>
                <div style={{ fontSize: '14px', marginBottom: '4px' }}>{category.name}</div>
                <div style={{ fontSize: '18px', fontWeight: 'bold', color: category.color }}>
                  {category.count}
                </div>
              </div>
            </Col>
          ))}
        </Row>
      </Card>

      {/* 项目列表 */}
      <Card title="项目列表">
        <List
          itemLayout="vertical"
          dataSource={recentProjects}
          renderItem={(project) => (
            <List.Item
              key={project.id}
              actions={[
                <Button type="text" icon={<EyeOutlined />} onClick={() => setActiveView('management')}>
                  进入项目
                </Button>,
                <Button type="text" icon={<EditOutlined />}>
                  样本管理
                </Button>,
                <Button type="text" icon={<FileTextOutlined />}>
                  检测任务
                </Button>,
                <Button type="text" icon={<BarChartOutlined />}>
                  报告生成
                </Button>
              ]}
            >
              <List.Item.Meta
                avatar={
                  <div style={{ 
                    width: '8px', 
                    height: '40px', 
                    backgroundColor: '#1890ff',
                    borderRadius: '4px'
                  }} />
                }
                title={
                  <div>
                    <Text strong>{project.name}</Text>
                    <Tag color="blue" style={{ marginLeft: 8 }}>{project.type}</Tag>
                  </div>
                }
                description={
                  <div>
                    <div style={{ marginBottom: 8 }}>
                      <Text type="secondary">状态：{project.status} | 进度：{project.progress}% | 负责人：{project.responsible}</Text>
                    </div>
                    <div style={{ marginBottom: 8 }}>
                      <Text type="secondary">关联协议：{project.id} | 实验中心：实验中心A（3个中心）</Text>
                    </div>
                    <div style={{ marginBottom: 8 }}>
                      <Text type="secondary">客户：{project.client} | 样本数：{project.samples}例</Text>
                    </div>
                    <Progress percent={project.progress} size="small" />
                  </div>
                }
              />
            </List.Item>
          )}
        />
      </Card>

      {/* 快速操作 */}
      <Card title="快速操作" style={{ marginTop: 24 }}>
        <Row gutter={16}>
          <Col span={6}>
            <Button type="primary" block onClick={() => setActiveView('management')}>
              新建项目
            </Button>
          </Col>
          <Col span={6}>
            <Button block onClick={() => setActiveView('management')}>
              项目模板
            </Button>
          </Col>
          <Col span={6}>
            <Button block onClick={() => setActiveView('management')}>
              批量导入
            </Button>
          </Col>
          <Col span={6}>
            <Button block onClick={() => setActiveView('management')}>
              项目归档
            </Button>
          </Col>
        </Row>
      </Card>
    </div>
  )

  if (activeView === 'category') {
    return <ProjectCategory />
  }

  if (activeView === 'management') {
    return <ProjectIndex />
  }

  return (
    <div>
      <Routes>
        <Route index element={renderDashboard()} />
        <Route path="category" element={<ProjectCategory />} />
        <Route path="management" element={<ProjectIndex />} />
      </Routes>
    </div>
  )
}

export default ProjectManagement