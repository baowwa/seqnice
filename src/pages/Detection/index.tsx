import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { Breadcrumb } from 'antd'
import TestItemManagement from './TestItem'
import TestItemAdd from './TestItemAdd'
import AnalysisItemManagement from './AnalysisItem'
import MethodologyManagement from './Methodology'
import SOPConfig from './SOPConfig'
import SOPTemplateDetail from './SOPTemplateDetail'
import SOPStepConfig from './SOPStepConfig'
import SOPQualityControl from './SOPQualityControl'
import SOPVersionManagement from './SOPVersionManagement'

/**
 * 检测项目管理主页面
 * 包含检测项目、分析项目、方法学、SOP文档、项目关联五个子模块
 */
const DetectionManagement: React.FC = () => {
  return (
    <div>
      <Breadcrumb style={{ margin: '16px 0' }}>
        <Breadcrumb.Item>首页</Breadcrumb.Item>
        <Breadcrumb.Item>检测项目</Breadcrumb.Item>
      </Breadcrumb>
      
      <Routes>
        <Route index element={<Navigate to="test-item" replace />} />
        <Route path="test-item" element={<TestItemManagement />} />
        <Route path="test-item/add" element={<TestItemAdd />} />
        <Route path="analysis-item" element={<AnalysisItemManagement />} />
        <Route path="methodology" element={<MethodologyManagement />} />
        <Route path="sop-config" element={<SOPConfig />} />
        <Route path="sop-template/:templateId" element={<SOPTemplateDetail />} />
        <Route path="sop-step/:stepId" element={<SOPStepConfig />} />
        <Route path="sop-quality-control/:stepId" element={<SOPQualityControl />} />
        <Route path="sop-version/:templateId" element={<SOPVersionManagement />} />
      </Routes>
    </div>
  )
}

export default DetectionManagement