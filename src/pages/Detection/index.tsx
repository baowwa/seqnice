import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { Breadcrumb } from 'antd'
// 原复杂版检测项目组件移除，改用基础版
import TestItemBasicManagement from './TestItemBasic'
import TestItemAdd from './TestItemAdd'
import AnalysisItemManagement from './AnalysisItem'
import AnalysisItemAdd from './AnalysisItemAdd'
import MethodologyManagement from './Methodology'
import SOPConfig from './SOPConfig'
import SOPTemplateDetail from './SOPTemplateDetail'
import SOPStepConfig from './SOPStepConfig'
import SOPQualityControl from './SOPQualityControl'
import SOPVersionManagement from './SOPVersionManagement'
import TestItemGroupManagement from './TestItemGroup'
import TestItemRelationManagement from './TestItemRelation'
import TestItemRelationForm from './TestItemRelationForm'

/**
 * 检测项目管理主页面
 * 现在“检测项目”仅保留基础字段（编码、名称、描述、状态），价格字段已去除
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
        {/* 检测项目（简化版） */}
        <Route path="test-item" element={<TestItemBasicManagement />} />
        {/* 保留原新增页面路由（如需弃用可后续移除） */}
        <Route path="test-item/add" element={<TestItemAdd />} />
        {/* 检测项目关系配置 */}
        <Route path="test-item-relation" element={<TestItemRelationManagement />} />
        <Route path="test-item-relation/new" element={<TestItemRelationForm />} />
        <Route path="test-item-relation/edit/:id" element={<TestItemRelationForm />} />
        {/* 检测项目分组 */}
        <Route path="test-item-group" element={<TestItemGroupManagement />} />
        <Route path="analysis-item" element={<AnalysisItemManagement />} />
        <Route path="analysis-item/add" element={<AnalysisItemAdd />} />
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