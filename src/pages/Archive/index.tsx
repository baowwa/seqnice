import React, { useEffect } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { useAppStore } from '../../store'
import CustomerManagement from './Customer'
import SampleTypeManagement from './SampleType'
import TestItemManagement from './TestItem'
import EquipmentManagement from './Equipment'

/**
 * 基础档案管理模块
 * 包含客户管理、样本类型、检测项目、设备管理等子模块
 */
const ArchiveManagement: React.FC = () => {
  const { setBreadcrumbs } = useAppStore()

  useEffect(() => {
    setBreadcrumbs([{ title: '首页' }, { title: '基础档案' }])
  }, [setBreadcrumbs])

  return (
    <Routes>
      <Route index element={<Navigate to="customer" replace />} />
      <Route path="customer" element={<CustomerManagement />} />
      <Route path="sample-type" element={<SampleTypeManagement />} />
      <Route path="test-item" element={<TestItemManagement />} />
      <Route path="equipment" element={<EquipmentManagement />} />
    </Routes>
  )
}

export default ArchiveManagement