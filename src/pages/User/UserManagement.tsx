import React from 'react'
import { Card, Typography } from 'antd'
import { UserOutlined } from '@ant-design/icons'

const { Title, Paragraph } = Typography

/**
 * 用户管理页面组件
 */
const UserManagement: React.FC = () => {
  return (
    <div>
      <Card>
        <div style={{ textAlign: 'center', padding: '40px 20px' }}>
          <UserOutlined style={{ fontSize: 64, color: '#1890ff', marginBottom: 16 }} />
          <Title level={2}>用户管理</Title>
          <Paragraph type="secondary">
            用户管理功能正在开发中，敬请期待...
          </Paragraph>
        </div>
      </Card>
    </div>
  )
}

export default UserManagement