import React from 'react'
import { Card, Typography } from 'antd'

const { Title, Paragraph } = Typography

/**
 * 客户合作档案占位页面组件
 * 用途：展示“内容开发中，敬请期待”占位信息
 * 返回：React.FC 无入参，无返回值
 */
const CustomerCooperationArchive: React.FC = () => {
  /**
   * 渲染占位内容
   * 入参：无
   * 出参：JSX.Element
   */
  const renderPlaceholder = (): JSX.Element => (
    <Card className="content-card" style={{ textAlign: 'center' }}>
      <Title level={4}>内容开发中，敬请期待</Title>
      <Paragraph type="secondary">客户合作档案模块正在规划中</Paragraph>
    </Card>
  )

  return renderPlaceholder()
}

export default CustomerCooperationArchive