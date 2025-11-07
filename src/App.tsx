import React, { Suspense, lazy } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { ConfigProvider, Spin, theme, App as AntdApp } from 'antd'
import zhCN from 'antd/locale/zh_CN'
import { ThemeProvider, useTheme } from './contexts/ThemeContext'
import MainLayout from './components/Layout/MainLayout'
import './index.css'

// 懒加载组件导入
const Dashboard = lazy(() => import('./pages/Dashboard'))
const SampleReceiving = lazy(() => import('./pages/Sample/Receiving'))
const SampleList = lazy(() => import('./pages/Sample/List'))
const LuckysheetDemo = lazy(() => import('./pages/Sample/LuckysheetDemo'))
// 显式使用 .tsx 扩展名以兼容 TypeScript bundler 解析
const UniverDemo = lazy(() => import('./pages/Sample/UniverDemo.tsx'))
const ExperimentManagement = lazy(() => import('./pages/Experiment'))
const ExperimentTaskCenter = lazy(() => import('./pages/Experiment/ExperimentTaskCenter'))
const DNAExtraction = lazy(() => import('./pages/Experiment/DNAExtraction'))
const Preprocessing = lazy(() => import('./pages/Experiment/Preprocessing'))
const LibraryConstruction = lazy(() => import('./pages/Experiment/LibraryConstruction'))
const SequencingTaskCenter = lazy(() => import('./pages/Experiment/SequencingTaskCenter'))
const PoolingTaskCenter = lazy(() => import('./pages/Experiment/PoolingTaskCenter'))
const BatchCreation = lazy(() => import('./pages/Experiment/BatchCreation'))
const BatchExecution = lazy(() => import('./pages/Experiment/BatchExecution'))
const BatchDetail = lazy(() => import('./pages/Experiment/BatchDetail'))
const NucleicExtractionRecord = lazy(() => import('./pages/Experiment/NucleicExtractionRecord'))
const PCRAmplificationRecord = lazy(() => import('./pages/Experiment/PCRAmplificationRecord'))
const LibraryConstructionRecord = lazy(() => import('./pages/Experiment/LibraryConstructionRecord'))
const ChipUsageRecord = lazy(() => import('./pages/Experiment/ChipUsageRecord'))
const ChipRecordSummary = lazy(() => import('./pages/Experiment/ChipRecordSummary'))
const ReportManagement = lazy(() => import('./pages/Report'))
const ReportGeneration = lazy(() => import('./pages/Report/ReportGeneration'))
const ReportReview = lazy(() => import('./pages/Report/ReportReview'))
const UserManagement = lazy(() => import('./pages/User'))
const ArchiveManagement = lazy(() => import('./pages/Archive'))
const ProjectArchive = lazy(() => import('./pages/ProjectArchive'))
const ProjectArchiveDetail = lazy(() => import('./pages/ProjectArchive/ProjectArchiveDetail'))
const ProjectArchiveCreate = lazy(() => import('./pages/ProjectArchive/ProjectArchiveCreate'))
/**
 * 研究实验方案页面组件（懒加载）
 * 入参：无
 * 出参：返回 React 组件，用于展示“内容开发中，敬请期待”占位内容
 */
const ResearchExperimentPlan = lazy(() => import('./pages/ProjectArchive/ResearchExperimentPlan'))
const AnalysisManagement = lazy(() => import('./pages/Analysis'))
// 合作档案占位页面（懒加载）
const CooperationEnterprise = lazy(() => import('./pages/CooperationArchive/EnterpriseArchive'))
const CooperationCustomer = lazy(() => import('./pages/CooperationArchive/CustomerCooperationArchive'))
  const InspectionProjectLibrary = lazy(() => import('./pages/InspectionProject/Library'))
  const InspectionProjectStandard = lazy(() => import('./pages/InspectionProject/Standard'))
  const InspectionProjectLibraryCreate = lazy(() => import('./pages/InspectionProject/LibraryCreate'))
  const InspectionProjectLibraryEdit = lazy(() => import('./pages/InspectionProject/LibraryEdit'))
  const SOPConfigList = lazy(() => import('./pages/InspectionProject/SOPConfigList.tsx'))
  const SOPConfigCreate = lazy(() => import('./pages/InspectionProject/SOPConfigCreate.tsx'))

/**
 * 加载中组件
 */
const LoadingSpinner: React.FC = () => (
  <div style={{ 
    display: 'flex', 
    justifyContent: 'center', 
    alignItems: 'center', 
    height: '200px' 
  }}>
    <Spin size="large" />
  </div>
)

/**
 * 带主题的应用组件
 */
  const AppWithTheme: React.FC = () => {
  const { themeConfig } = useTheme()

  return (
    <ConfigProvider
      locale={zhCN}
      theme={{
        algorithm: themeConfig.mode === 'dark' ? theme.darkAlgorithm : theme.defaultAlgorithm,
        token: {
          colorPrimary: themeConfig.primaryColor,
          borderRadius: themeConfig.borderRadius,
        },
      }}
    >
      <AntdApp>
        <Routes>
          {/* 默认路由直接跳转到仪表板 */}
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
            
            {/* 主布局路由 */}
            <Route path="/" element={<MainLayout />}>
              <Route 
                path="dashboard" 
                element={
                  <Suspense fallback={<LoadingSpinner />}>
                    <Dashboard />
                  </Suspense>
                } 
              />
              
              {/* 基础档案路由 */}
              <Route 
                path="archive/*" 
                element={
                  <Suspense fallback={<LoadingSpinner />}>
                    <ArchiveManagement />
                  </Suspense>
                } 
              />

              {/* 合作档案占位页面路由 */}
              <Route 
                path="cooperation-archive/enterprise" 
                element={
                  <Suspense fallback={<LoadingSpinner />}>
                    <CooperationEnterprise />
                  </Suspense>
                } 
              />
              <Route 
                path="cooperation-archive/customer" 
                element={
                  <Suspense fallback={<LoadingSpinner />}>
                    <CooperationCustomer />
                  </Suspense>
                } 
              />
              
              {/* 项目档案路由 */}
              <Route 
                path="project-archive" 
                element={
                  <Suspense fallback={<LoadingSpinner />}>
                    <ProjectArchive />
                  </Suspense>
                } 
              />
              <Route 
                path="project-archive/create" 
                element={
                  <Suspense fallback={<LoadingSpinner />}>
                    <ProjectArchiveCreate />
                  </Suspense>
                } 
              />
              <Route 
                path="project-archive/detail/:id" 
                element={
                  <Suspense fallback={<LoadingSpinner />}>
                    <ProjectArchiveDetail />
                  </Suspense>
                } 
              />
              {/* 研究实验方案占位页面路由 */}
              <Route 
                path="project-archive/research-plan" 
                element={
                  <Suspense fallback={<LoadingSpinner />}>
                    {/*
                      方法说明：该路由用于注册“研究实验方案”占位页面。
                      入参：无。
                      出参：React 元素，渲染懒加载组件。
                    */}
                    <ResearchExperimentPlan />
                  </Suspense>
                } 
              />
              
              {/* 检测项目路由按要求移除 */}
              {/* 检验项目管理路由 */}
              <Route 
                path="inspection-project/standard" 
                element={
                  <Suspense fallback={<LoadingSpinner />}>
                    <InspectionProjectStandard />
                  </Suspense>
                } 
              />
              <Route 
                path="inspection-project/library" 
                element={
                  <Suspense fallback={<LoadingSpinner />}>
                    <InspectionProjectLibrary />
                  </Suspense>
                } 
              />
              <Route 
                path="inspection-project/library/create" 
                element={
                  <Suspense fallback={<LoadingSpinner />}>
                    <InspectionProjectLibraryCreate />
                  </Suspense>
                } 
              />
              <Route 
                path="inspection-project/library/edit/:code" 
                element={
                  <Suspense fallback={<LoadingSpinner />}>
                    <InspectionProjectLibraryEdit />
                  </Suspense>
                } 
              />
              <Route 
                path="inspection-project/sop" 
                element={
                  <Suspense fallback={<LoadingSpinner />}>
                    <SOPConfigList />
                  </Suspense>
                } 
              />
              <Route 
                path="inspection-project/sop/create" 
                element={
                  <Suspense fallback={<LoadingSpinner />}>
                    <SOPConfigCreate />
                  </Suspense>
                } 
              />
              

              
              {/* 样本管理子页面已移除 */}
              {/* 样本接收（样本录入） */}
              <Route 
                path="sample/receiving" 
                element={
                  <Suspense fallback={<LoadingSpinner />}>
                    <SampleReceiving />
                  </Suspense>
                } 
              />
              {/* 样本列表 */}
              <Route 
                path="sample/list" 
                element={
                  <Suspense fallback={<LoadingSpinner />}>
                    <SampleList />
                  </Suspense>
                } 
              />

              {/* Luckysheet 演示页面 */}
              <Route 
                path="sample/luckysheet-demo" 
                element={
                  <Suspense fallback={<LoadingSpinner />}>
                    <LuckysheetDemo />
                  </Suspense>
                } 
              />

              {/* Univer 演示页面 */}
              <Route 
                path="sample/univer-demo" 
                element={
                  <Suspense fallback={<LoadingSpinner />}>
                    <UniverDemo />
                  </Suspense>
                } 
              />
              
              {/* 实验流程路由 */}
              <Route 
                path="experiment/dna-extraction" 
                element={
                  <Suspense fallback={<LoadingSpinner />}>
                    <DNAExtraction />
                  </Suspense>
                } 
              />
              <Route 
                path="experiment/task-center" 
                element={
                  <Suspense fallback={<LoadingSpinner />}>
                    <ExperimentTaskCenter />
                  </Suspense>
                } 
              />
              <Route 
                path="experiment/preprocessing" 
                element={
                  <Suspense fallback={<LoadingSpinner />}>
                    <Preprocessing />
                  </Suspense>
                } 
              />
              <Route 
                path="experiment/library" 
                element={
                  <Suspense fallback={<LoadingSpinner />}>
                    <LibraryConstruction />
                  </Suspense>
                } 
              />
              <Route 
                path="experiment/pooling" 
                element={
                  <Suspense fallback={<LoadingSpinner />}>
                    <PoolingTaskCenter />
                  </Suspense>
                } 
              />
              <Route 
                path="experiment/batch-creation" 
                element={
                  <Suspense fallback={<LoadingSpinner />}>
                    <BatchCreation />
                  </Suspense>
                } 
              />
              <Route 
                path="experiment/batch-execution" 
                element={
                  <Suspense fallback={<LoadingSpinner />}>
                    <BatchExecution />
                  </Suspense>
                } 
              />
              <Route 
                path="experiment/sequencing" 
                element={
                  <Suspense fallback={<LoadingSpinner />}>
                    <SequencingTaskCenter />
                  </Suspense>
                } 
              />
              
              {/* 实验步骤记录路由 */}
              <Route 
                path="experiment/batch-detail/:batchId" 
                element={
                  <Suspense fallback={<LoadingSpinner />}>
                    <BatchDetail />
                  </Suspense>
                } 
              />
              <Route 
                path="experiment/nucleic-extraction/:batchId" 
                element={
                  <Suspense fallback={<LoadingSpinner />}>
                    <NucleicExtractionRecord />
                  </Suspense>
                } 
              />
              <Route 
                path="experiment/pcr-amplification/:batchId" 
                element={
                  <Suspense fallback={<LoadingSpinner />}>
                    <PCRAmplificationRecord />
                  </Suspense>
                } 
              />
              <Route 
                path="experiment/library-construction/:batchId" 
                element={
                  <Suspense fallback={<LoadingSpinner />}>
                    <LibraryConstructionRecord />
                  </Suspense>
                } 
              />
              
              {/* 新增的芯片管理页面路由 */}
              <Route 
                path="experiment/chip-usage-record" 
                element={
                  <Suspense fallback={<LoadingSpinner />}>
                    <ChipUsageRecord />
                  </Suspense>
                } 
              />
              <Route 
                path="experiment/chip-record-summary" 
                element={
                  <Suspense fallback={<LoadingSpinner />}>
                    <ChipRecordSummary />
                  </Suspense>
                } 
              />
              
              {/* 生信分析路由 */}
              <Route 
                path="analysis/*" 
                element={
                  <Suspense fallback={<LoadingSpinner />}>
                    <AnalysisManagement />
                  </Suspense>
                } 
              />
              
              {/* 报告管理路由 */}
              <Route 
                path="report/generate" 
                element={
                  <Suspense fallback={<LoadingSpinner />}>
                    <ReportGeneration />
                  </Suspense>
                } 
              />
              <Route 
                path="report/review" 
                element={
                  <Suspense fallback={<LoadingSpinner />}>
                    <ReportReview />
                  </Suspense>
                } 
              />
              <Route 
                path="report/publish" 
                element={
                  <Suspense fallback={<LoadingSpinner />}>
                    <ReportManagement />
                  </Suspense>
                } 
              />
              
              {/* 用户管理路由 */}
              <Route 
                path="users" 
                element={
                  <Suspense fallback={<LoadingSpinner />}>
                    <UserManagement />
                  </Suspense>
                } 
              />
              
              {/* 兼容旧路由：样本管理相关重定向已移除 */}
              <Route path="experiments" element={<Navigate to="/experiment/sequencing" replace />} />
              <Route path="reports" element={<Navigate to="/report/publish" replace />} />
            </Route>
          </Routes>
        </AntdApp>
      </ConfigProvider>
    )
  }

/**
 * 主应用组件
 */
const App: React.FC = () => {
  return (
    <ThemeProvider>
      <AppWithTheme />
    </ThemeProvider>
  )
}

export default App