import React from 'react'
import { Card, Typography } from 'antd'
import { FileTextOutlined } from '@ant-design/icons'

const { Title, Paragraph } = Typography

/**
 * 报告管理页面组件
 */
const ReportManagement: React.FC = () => {
  return (
    <div>
      <Card>
        <div style={{ textAlign: 'center', padding: '40px 20px' }}>
          <FileTextOutlined style={{ fontSize: 64, color: '#1890ff', marginBottom: 16 }} />
          <Title level={2}>报告管理</Title>
          <Paragraph type="secondary">
            报告管理功能正在开发中，敬请期待...
          </Paragraph>
        </div>
      </Card>
    </div>
  )
}

export default ReportManagement