/**
 * 用户角色枚举
 */
export enum UserRole {
  ADMIN = 'admin',           // 系统管理员
  SAMPLE_RECEIVER = 'sample_receiver',  // 接样人员
  LAB_TECHNICIAN = 'lab_technician',    // 实验人员
  ANALYST = 'analyst',       // 分析人员
  REPORTER = 'reporter'      // 报告人员
}

/**
 * 样本状态枚举
 */
export enum SampleStatus {
  RECEIVED = 'received',           // 已接收
  PREPROCESSING = 'preprocessing', // 前处理中
  LIBRARY_PREP = 'library_prep',   // 文库构建中
  SEQUENCING = 'sequencing',       // 测序中
  ANALYZING = 'analyzing',         // 分析中
  COMPLETED = 'completed',         // 已完成
  REJECTED = 'rejected'            // 已拒绝
}

/**
 * 项目状态枚举
 */
export enum ProjectStatus {
  PENDING = 'pending',       // 待开始
  IN_PROGRESS = 'in_progress', // 进行中
  COMPLETED = 'completed',   // 已完成
  CANCELLED = 'cancelled'    // 已取消
}

/**
 * 权限接口
 */
export interface Permission {
  id: string;
  name: string;
  code: string;
  description: string;
  module: string;
  actions: string[];
  createdAt: string;
  updatedAt: string;
}

/**
 * 角色接口
 */
export interface Role {
  id: string;
  name: string;
  code: string;
  description: string;
  permissions: Permission[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

/**
 * 用户信息接口
 */
export interface User {
  id: string;
  username: string;
  name: string;
  email: string;
  phone?: string;
  role: UserRole;
  roles?: Role[];
  department: string;
  position?: string;
  avatar?: string;
  isActive: boolean;
  lastLoginAt?: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * 客户信息接口
 */
export interface Customer {
  id: string;
  name: string;
  code: string;
  contact: string;
  phone: string;
  email: string;
  address: string;
  type: 'hospital' | 'research' | 'company';
  status: 'active' | 'inactive';
  createdAt: string;
  updatedAt: string;
}

/**
 * 样本类型接口
 */
export interface SampleType {
  id: string;
  name: string;
  code: string;
  description: string;
  storageCondition: string;
  processingTime: number; // 处理时间（小时）
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

/**
 * 检测项目接口
 */
export interface TestItem {
  id: string;
  name: string;
  code: string;
  category: string;
  method: string;
  price: number;
  duration: number; // 检测周期（天）
  description: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

/**
 * 项目信息接口
 */
export interface Project {
  id: string;
  name: string;
  code: string;
  customerId: string;
  customer: Customer;
  description: string;
  status: ProjectStatus;
  startDate: string;
  expectedEndDate: string;
  actualEndDate?: string;
  assignedTo: string;
  assignedUser: User;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  budget: number;
  progress: number;
  createdAt: string;
  updatedAt: string;
}

/**
 * 样本信息接口
 */
export interface Sample {
  id: string;
  code: string;
  projectId: string;
  project: Project;
  sampleTypeId: string;
  sampleType: SampleType;
  status: SampleStatus;
  receivedDate: string;
  receivedBy: string;
  receivedUser: User;
  volume: number;
  concentration?: number;
  purity?: number;
  storageLocation: string;
  notes?: string;
  qcPassed: boolean;
  qcNotes?: string;
  barcodes: string[];
  createdAt: string;
  updatedAt: string;
}

/**
 * 实验流程步骤接口
 */
export interface WorkflowStep {
  id: string;
  name: string;
  order: number;
  status: 'pending' | 'in_progress' | 'completed' | 'failed';
  startTime?: string;
  endTime?: string;
  assignedTo?: string;
  assignedUser?: User;
  notes?: string;
  parameters?: Record<string, any>;
}

/**
 * 实验批次接口
 */
export interface ExperimentBatch {
  id: string;
  name: string;
  type: 'preprocessing' | 'library_prep' | 'sequencing';
  samples: Sample[];
  status: 'pending' | 'in_progress' | 'completed' | 'failed';
  startTime?: string;
  endTime?: string;
  assignedTo: string;
  assignedUser: User;
  equipment?: string;
  protocol?: string;
  notes?: string;
  steps: WorkflowStep[];
  createdAt: string;
  updatedAt: string;
}

/**
 * 生信分析任务接口
 */
export interface AnalysisTask {
  id: string;
  name: string;
  sampleId: string;
  sample: Sample;
  pipeline: string;
  status: 'queued' | 'running' | 'completed' | 'failed';
  progress: number;
  startTime?: string;
  endTime?: string;
  assignedTo: string;
  assignedUser: User;
  parameters: Record<string, any>;
  results?: Record<string, any>;
  outputFiles?: string[];
  errorMessage?: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * 报告信息接口
 */
export interface Report {
  id: string;
  title: string;
  projectId: string;
  project: Project;
  sampleIds: string[];
  samples: Sample[];
  type: 'preliminary' | 'final';
  status: 'draft' | 'review' | 'approved' | 'published';
  content: string;
  attachments: string[];
  createdBy: string;
  createdUser: User;
  reviewedBy?: string;
  reviewedUser?: User;
  approvedBy?: string;
  approvedUser?: User;
  publishedAt?: string;
  version: number;
  createdAt: string;
  updatedAt: string;
}

/**
 * 仪器设备接口
 */
export interface Equipment {
  id: string;
  name: string;
  model: string;
  manufacturer: string;
  serialNumber: string;
  location: string;
  status: 'available' | 'in_use' | 'maintenance' | 'offline';
  lastMaintenance?: string;
  nextMaintenance?: string;
  specifications: Record<string, any>;
  createdAt: string;
  updatedAt: string;
}

/**
 * 统计数据接口
 */
export interface Statistics {
  totalProjects: number;
  activeProjects: number;
  totalSamples: number;
  samplesInProgress: number;
  completedSamples: number;
  pendingReports: number;
  equipmentUtilization: number;
  monthlyTrends: {
    month: string;
    projects: number;
    samples: number;
    reports: number;
  }[];
}