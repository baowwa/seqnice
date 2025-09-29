import React, { useEffect } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { useAppStore } from '../../store'
import CustomerManagement from './Customer'
import SampleTypeManagement from './SampleType'
import EquipmentManagement from './Equipment'
import ReagentManagement from './Reagent'
import LaboratoryManagement from './Laboratory'
import DepartmentManagement from './Department'
import ExperimentGroupManagement from './ExperimentGroup'

/**
 * 基础档案管理模块
 * 包含客户管理、样本类型、检测项目、设备管理、试剂档案、实验室列表、科室列表、实验小组等子模块
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
      <Route path="equipment" element={<EquipmentManagement />} />
      <Route path="reagent" element={<ReagentManagement />} />
      <Route path="laboratory" element={<LaboratoryManagement />} />
      <Route path="department" element={<DepartmentManagement />} />
      <Route path="experiment-group" element={<ExperimentGroupManagement />} />
    </Routes>
  )
}

export default ArchiveManagement