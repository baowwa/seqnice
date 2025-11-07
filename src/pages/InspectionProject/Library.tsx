import React, { useMemo, useState, useEffect } from 'react'
import { Button, Card, Form, Input, Select, Space, Table, Tag, message } from 'antd'
import { useNavigate } from 'react-router-dom'

/**
 * 页面组件：检验项目库（Test + Assay 唯一）
 * 职责：
 * - 提供检验项目的列表、新增、编辑、删除能力；
 * - 增强表单为多页签，覆盖：基础信息、方法学与设备、样本要求、SOP、质控与性能、生信应用、报告模板；
 * - 保持启用状态前端使用 Switch(boolean)，提交时映射为 tinyint(2) 的 0/1；
 * 入参：无
 * 出参：React 组件（JSX.Element）
 */
const InspectionProjectLibrary: React.FC = () => {
  const navigate = useNavigate()
  /**
   * 组织ID常量（示例）
   */
  const defaultOrgId = 1001

  /**
   * 字典项：检测项目类型
   */
  const typeOptions = useMemo(() => ([
    { label: '正式', value: 1 },
    { label: '自定义', value: 2 },
  ]), [])

  /**
   * 字典项：方法学
   */
  const methodologyOptions = useMemo(() => ([
    { label: 'qPCR', value: 'QPCR' },
    { label: '测序', value: 'SEQ' },
    { label: '显微镜', value: 'MIC' },
  ]), [])

  /**
   * 字典项：标准检测项目（示例以code存储）
   */
  const standardProjectOptions = useMemo(() => ([
    { label: '结核分枝杆菌检测', value: 'STD_MTB' },
    { label: 'HIV抗体检测', value: 'STD_HIV' },
    { label: 'HBV表面抗原', value: 'STD_HBV' },
  ]), [])

  /**
   * 科室（来自档案，此处用示例）
   */
  const departmentOptions = useMemo(() => ([
    { label: '检验一科', value: 2001 },
    { label: '分子检验科', value: 2002 },
    { label: '免疫检验科', value: 2003 },
  ]), [])

  /**
   * 状态选项：是否启用
   */
  const statusOptions = useMemo(() => ([
    { label: '启用', value: 1 },
    { label: '停用', value: 0 },
  ]), [])

  /**
   * 类型：样本要求
   * 字段：类型、容器、体积、抗凝剂、运输温度、运输时限、稳定性、拒收标准
   */
  interface SampleRequirement {
    sampleType?: string
    containerType?: string
    requiredVolume?: number
    anticoagulant?: string
    transportTemp?: string
    transportMaxHours?: number
    stabilityHours?: number
    rejectCriteria?: string
  }

  /**
   * 类型：SOP 配置
   * 字段：sopId、sopUrl、关键步骤摘要
   */
  interface SopConfig {
    sopId?: number
    sopUrl?: string
    sopStepSummary?: string
  }

  /**
   * 类型：质控与性能
   * 字段：质控频次、检出限、定量限、线性区间、批内CV
   */
  interface QualityPerformance {
    qcFrequency?: string
    LoD?: number
    LoQ?: number
    linearityMin?: number
    linearityMax?: number
    cvWithin?: number
  }

  /**
   * 类型：生信应用配置
   * 字段：应用ID、流水线ID、输入映射、参数JSON、产物说明
   */
  interface BioinformaticsConfig {
    bioAppId?: number
    pipelineId?: number
    inputMapping?: string
    pipelineParams?: string
    outputArtifacts?: string
  }

  /**
   * 类型：报告模板配置
   * 字段：模板ID、版本、变量映射说明
   */
  interface ReportTemplateConfig {
    reportTemplateId?: number
    reportTemplateVersion?: string
    variablesMapping?: string
  }

  /**
   * 列表数据模型：检验项目（存储形态）
   */
  interface InspectionProject {
    /** 检测项目编码（系统自动生成） */
    code: string
    /** 检测项目名称（必填） */
    name: string
    /** 检测项目类型（字典项） */
    type?: number
    /** 标准检测项目（存code） */
    standardProjectCode?: string
    /** 检测项目描述 */
    description?: string
    /** 方法学编码 */
    methodologyCode?: string
    /** 科室ID */
    departmentId?: number
    /** 是否启用：0否，1是 */
    status: number
    /** 组织ID */
    organizationId: number
    /** 样本要求 */
    sample?: SampleRequirement
    /** SOP 配置 */
    sop?: SopConfig
    /** 质控与性能 */
    qc?: QualityPerformance
    /** 是否需要生信：0/1 */
    requiresBioinformatics?: number
    /** 生信应用配置 */
    bio?: BioinformaticsConfig
    /** 报告模板配置 */
    report?: ReportTemplateConfig
  }

  /**
   * 表单值类型（前端交互形态）：布尔开关 + 嵌套对象
   * 说明：status/requiresBioinformatics 使用 boolean；提交时转换为 0/1。
   */
  interface InspectionProjectFormValues {
    code: string
    name: string
    type?: number
    standardProjectCode?: string
    description?: string
    methodologyCode?: string
    departmentId?: number
    status: boolean
    organizationId: number
    sample?: SampleRequirement
    sop?: SopConfig
    qc?: QualityPerformance
    requiresBioinformatics?: boolean
    bio?: BioinformaticsConfig
    report?: ReportTemplateConfig
  }

  /**
   * 本地项目列表状态
   */
  const [projects, setProjects] = useState<InspectionProject[]>(() => {
    const cached = localStorage.getItem('inspectionProjects')
    if (cached) {
      try {
        const parsed = JSON.parse(cached)
        if (Array.isArray(parsed)) return parsed
      } catch {}
    }
    return [
      {
        code: 'IPJ-000001',
        name: '结核分枝杆菌检测',
        type: 1,
        standardProjectCode: 'STD_MTB',
        description: '结核分枝杆菌分子检测，联合多靶标判读',
        methodologyCode: 'SEQ',
        departmentId: 2002,
        status: 1,
        organizationId: defaultOrgId,
      },
      {
        code: 'IPJ-000002',
        name: 'HIV抗体检测',
        type: 1,
        standardProjectCode: 'STD_HIV',
        description: 'HIV抗体酶联法筛查',
        methodologyCode: 'QPCR',
        departmentId: 2003,
        status: 1,
        organizationId: defaultOrgId,
      },
    ]
  })

  // 持久化到 localStorage，便于新增页面返回后列表展示
  useEffect(() => {
    localStorage.setItem('inspectionProjects', JSON.stringify(projects))
  }, [projects])

  /** 编辑改为路由跳转，不再使用抽屉 */

  /**
   * 生成唯一编码
   * @returns 自动生成的检验项目编码
   */
  const generateCode = (): string => {
    const prefix = 'IPJ-'
    const seq = String(projects.length + 1).padStart(6, '0')
    return `${prefix}${seq}`
  }

  /**
   * 新增项目
   * 入参：无
   * 出参：void（跳转到独立的新建页面）
   */
  const handleAdd = (): void => {
    navigate('/inspection-project/library/create')
  }

  /**
   * 编辑项目
   * @param record 选中的检验项目记录
   * @returns void
   */
  /**
   * 方法：编辑项目
   * @param record 检验项目记录
   * @returns void（打开抽屉并回填表单）
   */
  const handleEdit = (record: InspectionProject): void => {
    navigate(`/inspection-project/library/edit/${record.code}`)
  }

  /**
   * 删除项目
   * @param code 待删除项目的编码
   * @returns void
   */
  /**
   * 方法：删除项目
   * @param code 检验项目编码
   * @returns void（删除并提示）
   */
  const handleDelete = (code: string): void => {
    setProjects(prev => prev.filter(p => p.code !== code))
    message.success('已删除项目')
  }

  /**
   * 保存项目（新增或编辑）
   * @returns Promise<void> 保存完成后关闭抽屉并提示
   */
  /**
   * 方法：保存项目（新增或编辑）
   * 入参：无
   * 出参：Promise<void>（保存成功后关闭抽屉）
   */
  // 列表页不再负责保存；保存逻辑由编辑页面承担

  /**
   * 关闭抽屉并重置表单
   * @returns void
   */
  // 抽屉已移除，无需关闭与重置

  /**
   * 将字典值转中文标签
   * @param options 选项列表
   * @param value 当前值
   * @returns 中文标签或原始值
   */
  /**
   * 方法：字典值转中文标签
   * @param options 选项列表
   * @param value 当前值
   * @returns 中文标签或原始值
   */
  const getLabel = (options: { label: string, value: any }[], value: any): string => {
    const found = options.find(o => o.value === value)
    return found ? found.label : String(value ?? '')
  }

  /**
   * 方法：方法学变更提示
   * @param v 当前方法学编码
   * @returns void（提示联动复核）
   */
  // 列表页不处理方法学交互

  const columns = [
    { title: '检测项目编码', dataIndex: 'code', key: 'code', width: 160 },
    { title: '检测项目名称', dataIndex: 'name', key: 'name', width: 200 },
    { title: '检测项目类型', dataIndex: 'type', key: 'type', width: 120, render: (v: number) => getLabel(typeOptions, v) },
    { title: '标准检测项目', dataIndex: 'standardProjectCode', key: 'standardProjectCode', width: 180, render: (v: string) => getLabel(standardProjectOptions, v) },
    { title: '方法学', dataIndex: 'methodologyCode', key: 'methodologyCode', width: 120, render: (v: string) => getLabel(methodologyOptions, v) },
    { title: '检验科室', dataIndex: 'departmentId', key: 'departmentId', width: 140, render: (v: number) => getLabel(departmentOptions, v) },
    { title: '样本类型', dataIndex: ['sample','sampleType'], key: 'sampleType', width: 120 },
    { title: '状态', dataIndex: 'status', key: 'status', width: 100, render: (v: number) => v === 1 ? <Tag color="green">启用</Tag> : <Tag color="red">停用</Tag> },
    { title: '生信', dataIndex: 'requiresBioinformatics', key: 'requiresBioinformatics', width: 90, render: (v: number | undefined) => (v === 1 ? <Tag color="blue">需要</Tag> : <Tag>否</Tag>) },
    { title: '组织', dataIndex: 'organizationId', key: 'organizationId', width: 100 },
    {
      title: '操作', key: 'action', fixed: 'right' as const, width: 160,
      render: (_: any, record: InspectionProject) => (
        <Space>
          <Button type="link" onClick={() => handleEdit(record)}>编辑</Button>
          <Button type="link" danger onClick={() => handleDelete(record.code)}>删除</Button>
        </Space>
      )
    }
  ]

  return (
    <Card
      title="检验项目库"
      extra={(
        <Space>
          <Button type="primary" onClick={handleAdd}>新增项目</Button>
        </Space>
      )}
      style={{ height: '100%', display: 'flex', flexDirection: 'column' }}
      bodyStyle={{ padding: 0, height: '100%', display: 'flex', flexDirection: 'column' }}
    >
      <div style={{ padding: 16 }}>
        <Table
          rowKey="code"
          columns={columns}
          dataSource={projects}
          size="small"
          scroll={{ x: 1100, y: 520 }}
          pagination={{ pageSize: 10 }}
        />
      </div>

      {/** 抽屉编辑已移除，编辑跳转到独立页面 */}
    </Card>
  )
}

export default InspectionProjectLibrary