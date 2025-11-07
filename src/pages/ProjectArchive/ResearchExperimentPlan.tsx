import React from 'react'
import { Card, Typography } from 'antd'

const { Title, Paragraph } = Typography

/**
 * 研究实验方案占位页面组件
 * 用途：在“项目管理”的二级菜单点击后展示占位提示
 * 入参：无
 * 出参：React.FC 组件，无特定返回值类型
 */
const ResearchExperimentPlan: React.FC = () => {
  /**
   * 渲染占位内容
   * 入参：无
   * 出参：JSX.Element
   */
  const renderPlaceholder = (): JSX.Element => (
    <Card className="content-card" style={{ textAlign: 'center' }}>
      <Title level={4}>内容开发中，敬请期待</Title>
      <Paragraph type="secondary">研究实验方案模块正在规划中</Paragraph>
    </Card>
  )

  return renderPlaceholder()
}

export default ResearchExperimentPlan