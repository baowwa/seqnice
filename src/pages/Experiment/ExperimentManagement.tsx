import React from 'react'
import { Card, Typography } from 'antd'
import { ExperimentOutlined } from '@ant-design/icons'

const { Title, Paragraph } = Typography

/**
 * 实验管理页面组件
 */
const ExperimentManagement: React.FC = () => {
  return (
    <div>
      <Card>
        <div style={{ textAlign: 'center', padding: '40px 20px' }}>
          <ExperimentOutlined style={{ fontSize: 64, color: '#1890ff', marginBottom: 16 }} />
          <Title level={2}>实验管理</Title>
          <Paragraph type="secondary">
            实验管理功能正在开发中，敬请期待...
          </Paragraph>
        </div>
      </Card>
    </div>
  )
}

export default ExperimentManagement