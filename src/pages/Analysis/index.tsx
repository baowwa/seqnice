import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { Breadcrumb } from 'antd'
import AnalysisToolsManagement from './AnalysisTools'
import AnalysisTasks from './AnalysisTasks'

/**
 * 生信分析管理组件
 * 负责生信分析模块的路由配置和页面导航
 */
const AnalysisManagement: React.FC = () => {
  return (
    <div>
      <Breadcrumb style={{ margin: '16px 0' }}>
        <Breadcrumb.Item>生信分析</Breadcrumb.Item>
      </Breadcrumb>
      
      <Routes>
        <Route index element={<Navigate to="tasks" replace />} />
        <Route path="tools" element={<AnalysisToolsManagement />} />
        <Route path="tasks" element={<AnalysisTasks />} />
      </Routes>
    </div>
  )
}

export default AnalysisManagement