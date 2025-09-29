import React, { useState } from 'react'
import { Form, Input, Button, Card, message, Space, Typography } from 'antd'
import { UserOutlined, LockOutlined, ExperimentOutlined } from '@ant-design/icons'
import { useUserStore, mockLogin } from '../../store'
import './index.css'

const { Title, Text } = Typography

/**
 * 登录页面组件
 * 提供用户登录功能，支持不同角色用户登录
 */
const LoginPage: React.FC = () => {
  const [loading, setLoading] = useState(false)
  const { login } = useUserStore()

  /**
   * 处理登录表单提交
   * @param values 表单数据
   */
  const handleLogin = async (values: { username: string; password: string }) => {
    setLoading(true)
    try {
      const user = await mockLogin(values.username, values.password)
      if (user) {
        login(user)
        message.success(`欢迎回来，${user.name}！`)
      } else {
        message.error('用户名或密码错误')
      }
    } catch (error) {
      message.error('登录失败，请稍后重试')
    } finally {
      setLoading(false)
    }
  }

  /**
   * 快速登录不同角色用户
   * @param username 用户名
   */
  const quickLogin = async (username: string) => {
    await handleLogin({ username, password: '123456' })
  }

  return (
    <div className="login-container">
      <div className="login-background">
        <div className="login-content">
          <Card className="login-card">
            <div className="login-header">
              <ExperimentOutlined className="login-icon" />
              <Title level={2} className="login-title">
                微生物测序分析平台
              </Title>
              <Text type="secondary">
                Microbial Sequencing Analysis Platform
              </Text>
            </div>

            <Form
              name="login"
              onFinish={handleLogin}
              autoComplete="off"
              size="large"
            >
              <Form.Item
                name="username"
                rules={[{ required: true, message: '请输入用户名' }]}
              >
                <Input
                  prefix={<UserOutlined />}
                  placeholder="用户名"
                />
              </Form.Item>

              <Form.Item
                name="password"
                rules={[{ required: true, message: '请输入密码' }]}
              >
                <Input.Password
                  prefix={<LockOutlined />}
                  placeholder="密码"
                />
              </Form.Item>

              <Form.Item>
                <Button
                  type="primary"
                  htmlType="submit"
                  loading={loading}
                  block
                >
                  登录
                </Button>
              </Form.Item>
            </Form>

            <div className="quick-login">
              <Text type="secondary" style={{ marginBottom: 16, display: 'block' }}>
                快速登录（密码：123456）
              </Text>
              <Space wrap>
                <Button size="small" onClick={() => quickLogin('admin')}>
                  管理员
                </Button>
                <Button size="small" onClick={() => quickLogin('receiver')}>
                  接样人员
                </Button>
                <Button size="small" onClick={() => quickLogin('technician')}>
                  实验人员
                </Button>
                <Button size="small" onClick={() => quickLogin('analyst')}>
                  分析人员
                </Button>
              </Space>
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}

export default LoginPage