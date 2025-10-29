import React, { Suspense, lazy } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { ConfigProvider, Spin, theme, App as AntdApp } from 'antd'
import zhCN from 'antd/locale/zh_CN'
import { ThemeProvider, useTheme } from './contexts/ThemeContext'
import MainLayout from './components/Layout/MainLayout'
import './index.css'

// 懒加载组件导入
const Dashboard = lazy(() => import('./pages/Dashboard'))
const SampleManagement = lazy(() => import('./pages/Sample'))
const SampleTracking = lazy(() => import('./pages/Sample/SampleTracking'))
const SampleStorage = lazy(() => import('./pages/Sample/SampleStorage'))
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
const ProjectManagement = lazy(() => import('./pages/Project/ProjectManagement'))
const AnalysisManagement = lazy(() => import('./pages/Analysis'))
const DetectionManagement = lazy(() => import('./pages/Detection'))

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
              
              {/* 检测项目路由 */}
              <Route 
                path="detection/*" 
                element={
                  <Suspense fallback={<LoadingSpinner />}>
                    <DetectionManagement />
                  </Suspense>
                } 
              />
              
              {/* 项目管理路由 */}
              <Route 
                path="project/*" 
                element={
                  <Suspense fallback={<LoadingSpinner />}>
                    <ProjectManagement />
                  </Suspense>
                } 
              />
              
              {/* 样本管理路由 */}
              <Route 
                path="sample/receiving" 
                element={
                  <Suspense fallback={<LoadingSpinner />}>
                    <SampleManagement />
                  </Suspense>
                } 
              />
              <Route 
                path="sample/tracking" 
                element={
                  <Suspense fallback={<LoadingSpinner />}>
                    <SampleTracking />
                  </Suspense>
                } 
              />
              <Route 
                path="sample/storage" 
                element={
                  <Suspense fallback={<LoadingSpinner />}>
                    <SampleStorage />
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
              
              {/* 兼容旧路由 */}
              <Route path="samples" element={<Navigate to="/sample/receiving" replace />} />
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