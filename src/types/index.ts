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
 * 项目类型枚举
 */
export enum ProjectType {
  PRODUCT_REGISTRATION = 'product_registration',  // 产品注册项目
  RESEARCH_SERVICE = 'research_service',          // 科研服务项目
  CLINICAL_DETECTION = 'clinical_detection'       // 临床检测项目
}

/**
 * 中心类型枚举
 */
export enum CenterType {
  LEAD = 'lead',           // 主导中心
  COLLABORATIVE = 'collaborative'  // 协作中心
}

/**
 * 阶段状态枚举
 */
export enum StageStatus {
  NOT_STARTED = 'not_started',    // 未开始
  IN_PROGRESS = 'in_progress',    // 进行中
  COMPLETED = 'completed',        // 已完成
  BLOCKED = 'blocked'             // 阻塞
}

/**
 * 任务状态枚举
 */
export enum TaskStatus {
  PENDING = 'pending',            // 待分配
  ASSIGNED = 'assigned',          // 已分配
  IN_PROGRESS = 'in_progress',    // 进行中
  COMPLETED = 'completed',        // 已完成
  CANCELLED = 'cancelled'         // 已取消
}

/**
 * 项目中心接口
 */
export interface ProjectCenter {
  id: string;
  projectId: string;
  centerId: string;
  centerName: string;
  centerType: CenterType;
  contactPerson: string;
  contactPhone: string;
  contactEmail: string;
  address: string;
  isActive: boolean;
  joinDate: string;
  responsibilities: string[];
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * 项目阶段接口
 */
export interface ProjectStage {
  id: string;
  projectId: string;
  name: string;
  description: string;
  order: number;
  status: StageStatus;
  startDate?: string;
  endDate?: string;
  estimatedDuration: number; // 预计持续天数
  actualDuration?: number;   // 实际持续天数
  prerequisites: string[];   // 前置条件
  deliverables: string[];    // 交付物
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

/**
 * 阶段中心分配接口
 */
export interface StageCenterAssignment {
  id: string;
  stageId: string;
  centerId: string;
  centerName: string;
  centerType: CenterType;
  assignedTasks: string[];
  progress: number;
  status: StageStatus;
  assignedAt: string;
  completedAt?: string;
  notes?: string;
}

/**
 * 阶段检测任务接口
 */
export interface StageDetectionTask {
  id: string;
  stageId: string;
  centerId: string;
  taskName: string;
  taskType: string;
  description: string;
  status: TaskStatus;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  assignedTo: string;
  assignedUser?: User;
  estimatedHours: number;
  actualHours?: number;
  startDate?: string;
  endDate?: string;
  completionRate: number;
  sampleCount: number;
  completedSamples: number;
  qualityScore?: number;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * 项目模板接口
 */
export interface ProjectTemplate {
  id: string;
  name: string;
  type: ProjectType;
  description: string;
  isMultiCenter: boolean;
  isMultiStage: boolean;
  defaultStages: Omit<ProjectStage, 'id' | 'projectId' | 'createdAt' | 'updatedAt'>[];
  defaultCenterTypes: CenterType[];
  estimatedDuration: number;
  isActive: boolean;
  createdBy: string;
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
  type: ProjectType;
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
  // 多中心支持
  isMultiCenter: boolean;
  centers?: ProjectCenter[];
  // 多阶段支持
  isMultiStage: boolean;
  stages?: ProjectStage[];
  currentStageId?: string;
  // 模板关联
  templateId?: string;
  template?: ProjectTemplate;
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

/**
 * 方法学状态枚举
 */
export enum MethodologyStatus {
  ACTIVE = 'active',     // 启用
  INACTIVE = 'inactive'  // 停用
}

/**
 * 方法学分类枚举
 */
export enum MethodologyCategory {
  MOLECULAR_BIOLOGY = 'molecular_biology',  // 分子生物学
  IMMUNOLOGY = 'immunology',               // 免疫学
  MICROBIOLOGY = 'microbiology',           // 微生物学
  BIOCHEMISTRY = 'biochemistry',           // 生物化学
  CYTOGENETICS = 'cytogenetics'            // 细胞遗传学
}

/**
 * 检测类型枚举
 */
export enum DetectionType {
  QUALITATIVE = 'qualitative',  // 定性检测
  QUANTITATIVE = 'quantitative' // 定量检测
}

/**
 * 技术平台枚举
 */
export enum TechnologyPlatform {
  PCR = 'pcr',                    // PCR平台
  DIGITAL_PCR = 'digital_pcr',    // 数字PCR平台
  NGS = 'ngs',                    // 二代测序平台
  SANGER = 'sanger',              // Sanger测序平台
  ELISA = 'elisa',                // ELISA平台
  CULTURE = 'culture',            // 培养平台
  MASS_SPEC = 'mass_spec'         // 质谱平台
}

/**
 * 样本要求接口
 */
export interface SampleRequirement {
  sampleTypes: string[];      // 样本类型
  minimumVolume: string;      // 最小体积
  storageCondition: string;   // 保存条件
  qualityRequirements: string; // 质量要求
}

/**
 * 环境要求接口
 */
export interface EnvironmentRequirement {
  temperature: string;        // 温度要求
  humidity: string;          // 湿度要求
  cleanliness: string;       // 洁净度要求
}

/**
 * 人员要求接口
 */
export interface PersonnelRequirement {
  certifications: string[];  // 证书要求
  training: string[];        // 培训要求
  experience: string;        // 经验要求
}

/**
 * 通用技术要求接口
 */
export interface TechnicalRequirement {
  sampleRequirement: SampleRequirement;
  environmentRequirement: EnvironmentRequirement;
  personnelRequirement: PersonnelRequirement;
}

/**
 * 实验流程步骤接口
 */
export interface ExperimentStep {
  id: string;
  name: string;
  description: string;
  requirements: string;
  order: number;
}

/**
 * 性能指标接口
 */
export interface PerformanceIndicator {
  id: string;
  name: string;
  requirement: string;
  verificationMethod: string;
  notes?: string;
}

/**
 * 设备类型接口
 */
export interface EquipmentType {
  id: string;
  name: string;
  selected: boolean;
}

/**
 * 试剂类型接口
 */
export interface ReagentType {
  id: string;
  name: string;
  selected: boolean;
}

/**
 * 关联资源配置接口
 */
export interface ResourceConfiguration {
  equipmentTypes: EquipmentType[];
  reagentTypes: ReagentType[];
}

/**
 * 方法学接口定义
 */
export interface Methodology {
  id: string;
  code: string;                           // 方法学编号
  name: string;                           // 方法学名称
  englishName?: string;                   // 英文名称
  category: MethodologyCategory;          // 方法学分类
  technologyPlatform: TechnologyPlatform; // 技术平台
  detectionType: DetectionType;           // 检测类型
  status: MethodologyStatus;              // 状态
  description: string;                    // 方法学描述
  technicalPrinciple: string;             // 技术原理
  technicalRequirement: TechnicalRequirement; // 通用技术要求
  experimentSteps: ExperimentStep[];      // 通用实验流程
  performanceIndicators: PerformanceIndicator[]; // 性能指标要求
  resourceConfiguration: ResourceConfiguration;  // 关联资源配置
  createdBy: string;                      // 创建人
  createdAt: string;                      // 创建时间
  updatedBy?: string;                     // 更新人
  updatedAt?: string;                     // 更新时间
}