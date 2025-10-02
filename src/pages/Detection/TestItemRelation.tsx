import React, { useState, useEffect } from 'react'
import { Card, Form, Select, Button, Space, Typography, message, Tag, Table, Popconfirm, Modal, Row, Col, Input } from 'antd'
import { SaveOutlined, ReloadOutlined, RightOutlined, DownOutlined } from '@ant-design/icons'
import { useNavigate } from 'react-router-dom'

const { Title } = Typography
const { Option } = Select

/**
 * 模块折叠组件（蓝色竖条 + 模块名 + 可收缩图标）
 * @param title 模块标题
 * @param children 子内容
 * @param defaultExpanded 是否默认展开
 * @returns React.ReactElement 折叠模块
 */
const Section: React.FC<{ title: string; children: React.ReactNode; defaultExpanded?: boolean }> = ({ title, children, defaultExpanded = true }) => {
  const [open, setOpen] = useState<boolean>(defaultExpanded)
  return (
    <div style={{ marginBottom: 12 }}>
      <div
        onClick={() => setOpen(prev => !prev)}
        style={{ display: 'flex', alignItems: 'center', padding: '8px 12px', cursor: 'pointer', background: '#fafafa', borderRadius: 6 }}
      >
        <span style={{ width: 4, height: 14, background: '#1890ff', borderRadius: 2, marginRight: 8 }} />
        <span style={{ fontWeight: 500 }}>{title}</span>
        <span style={{ marginLeft: 6 }}>{open ? <DownOutlined style={{ color: '#999' }} /> : <RightOutlined style={{ color: '#999' }} />}</span>
      </div>
      {open && <div style={{ padding: '8px 12px' }}>{children}</div>}
    </div>
  )
}

/**
 * 检测项目（用于关系绑定时选择）
 * 仅包含基本信息，来源可为接口或本地 mock
 */
interface TestItemBasic {
  /** 检测项目唯一标识 */
  id: string
  /** 检测项目编码 */
  code: string
  /** 检测项目名称 */
  name: string
}

/**
 * 设备档案基础信息（用于选择关联设备）
 */
interface EquipmentBasic {
  /** 设备ID */
  id: string
  /** 设备编码 */
  code: string
  /** 设备名称 */
  name: string
  /** SOP配置编码 */
  sopConfigCode?: string
}

/**
 * 试剂档案基础信息（用于选择关联试剂与SOP）
 */
interface ReagentBasic {
  /** 试剂ID */
  id: string
  /** 试剂编码 */
  code: string
  /** 试剂名称 */
  name: string
  /** 推荐SOP模板ID（可选） */
  recommendedSOPTemplateId?: string
  /** SOP配置编码 */
  sopConfigCode?: string
}

/**
 * 分析项目基础信息（用于选择关联分析项目）
 */
interface AnalysisItemBasic {
  /** 分析项目ID */
  id: string
  /** 分析项目名称 */
  name: string
  /** 分析项目编码 */
  code: string
}

/**
 * 检测项目关系配置数据结构
 */
interface TestItemRelationConfig {
  /** 目标检测项目ID */
  testItemId: string
  /** 选定方法学 */
  methodology: string
  /** 样本类型 */
  sampleType: string
  /** 关联设备ID列表 */
  equipmentIds: string[]
  /** 关联试剂ID列表 */
  reagentIds: string[]
  /** 关联分析项目ID列表 */
  analysisItemIds: string[]
  /** SOP配置：由试剂决定优先推荐的模板 */
  sop: {
    /** 配置模式（文档或结构化） */
    mode: 'document' | 'structured'
    /** 模板ID（可由试剂推荐） */
    templateId?: string
  }
}

/**
 * 检测项目关系配置页面
 * 将“方法学、设备、试剂、分析项目、SOP”集中到单独菜单做关联绑定
 */
/** 关系列表行，用于顶部Table展示与编辑 */
interface RelationRow extends TestItemRelationConfig {
  id: string
}

/**
 * 检测项目关系配置管理页面组件
 * 职责：提供关系列表视图与新增/编辑弹窗，完成方法学、样本类型、设备、试剂、分析项目与SOP的关联配置
 * @returns React.ReactElement 渲染后的页面组件
 */
const TestItemRelationManagement: React.FC = () => {
  const navigate = useNavigate()
  // 模拟基础数据（更丰富）
  const testItems: TestItemBasic[] = [
    { id: 'T-001', code: 'TP001', name: '肺癌基因检测' },
    { id: 'T-002', code: 'TP002', name: '结直肠癌基因检测' },
    { id: 'T-003', code: 'TP003', name: '乳腺癌基因检测' },
    { id: 'T-004', code: 'TP004', name: '卵巢癌基因检测' },
    { id: 'T-005', code: 'TP005', name: '前列腺癌基因检测' },
    { id: 'T-006', code: 'TP006', name: '胃癌基因检测' }
  ]

  const methodologies = ['PCR', 'qPCR', 'NGS', 'Sanger', 'ddPCR']
  const sampleTypes = ['血液', '组织', '唾液', '血浆', '骨髓', '尿液']

  const equipments: EquipmentBasic[] = [
    { id: 'E-001', code: 'EQ001', name: 'Illumina NextSeq 550', sopConfigCode: 'SOP-EQ001' },
    { id: 'E-002', code: 'EQ002', name: 'ABI 7500 Real-Time PCR', sopConfigCode: 'SOP-EQ002' },
    { id: 'E-003', code: 'EQ003', name: 'Thermo Fisher Ion Torrent', sopConfigCode: 'SOP-EQ003' },
    { id: 'E-004', code: 'EQ004', name: 'Illumina NovaSeq 6000', sopConfigCode: 'SOP-EQ004' },
    { id: 'E-005', code: 'EQ005', name: 'Roche LightCycler 480', sopConfigCode: 'SOP-EQ005' }
  ]

  const reagents: ReagentBasic[] = [
    { id: 'R-001', code: 'RG001', name: 'Nextera XT Library Prep Kit', recommendedSOPTemplateId: 'illumina_nextera_xt', sopConfigCode: 'SOP-RG001' },
    { id: 'R-002', code: 'RG002', name: 'QIAamp DNA Mini Kit', recommendedSOPTemplateId: 'dna_extraction_qiaamp', sopConfigCode: 'SOP-RG002' },
    { id: 'R-003', code: 'RG003', name: 'KAPA HyperPrep Kit', recommendedSOPTemplateId: 'kapa_hyperprep', sopConfigCode: 'SOP-RG003' },
    { id: 'R-004', code: 'RG004', name: 'MagMAX Viral/Pathogen Nucleic Acid Isolation Kit', recommendedSOPTemplateId: 'magmax_isolation', sopConfigCode: 'SOP-RG004' }
  ]

  const analysisItems: AnalysisItemBasic[] = [
    { id: 'A-001', name: 'EGFR基因突变检测', code: 'EGFR_MUT' },
    { id: 'A-002', name: 'KRAS基因突变检测', code: 'KRAS_MUT' },
    { id: 'A-003', name: 'BRAF基因突变检测', code: 'BRAF_MUT' },
    { id: 'A-004', name: '微卫星不稳定性分析', code: 'MSI' },
    { id: 'A-005', name: '肿瘤突变负荷分析', code: 'TMB' },
    { id: 'A-006', name: 'BRCA1/2突变检测', code: 'BRCA' }
  ]

  // 关系配置状态
  const [relation, setRelation] = useState<TestItemRelationConfig>({
    testItemId: '',
    methodology: '',
    sampleType: '',
    equipmentIds: [],
    reagentIds: [],
    analysisItemIds: [],
    sop: { mode: 'document', templateId: undefined }
  })
  // 顶部列表数据
  const [relations, setRelations] = useState<RelationRow[]>([])
  const [editingId, setEditingId] = useState<string | null>(null)
  const [modalVisible, setModalVisible] = useState(false)

  // 设备/试剂/分析项目行编辑状态
  const [editingEquipmentIndex, setEditingEquipmentIndex] = useState<number | null>(null)
  const [tempEquipmentId, setTempEquipmentId] = useState<string>('')
  const [editingReagentIndex, setEditingReagentIndex] = useState<number | null>(null)
  const [tempReagentId, setTempReagentId] = useState<string>('')
  const [editingAnalysisIndex, setEditingAnalysisIndex] = useState<number | null>(null)
  const [tempAnalysisId, setTempAnalysisId] = useState<string>('')

  /** 选择设备弹框状态与方法 */
  const [devicePickerVisible, setDevicePickerVisible] = useState<boolean>(false)
  const [devicePickerSelection, setDevicePickerSelection] = useState<string[]>([])
  /** 打开设备选择弹框（预选当前已关联设备） */
  const openDevicePicker = (): void => {
    setDevicePickerSelection(relation.equipmentIds)
    setDevicePickerVisible(true)
  }
  /** 取消设备选择弹框 */
  const cancelDevicePicker = (): void => {
    setDevicePickerVisible(false)
    setDevicePickerSelection([])
  }
  /** 确认添加所选设备（去重合并） */
  const confirmAddDevices = (): void => {
    const merged = Array.from(new Set([...relation.equipmentIds, ...devicePickerSelection]))
    setRelation(prev => ({ ...prev, equipmentIds: merged }))
    setDevicePickerVisible(false)
    setDevicePickerSelection([])
  }

  /** 选择试剂弹框状态与方法 */
  const [reagentPickerVisible, setReagentPickerVisible] = useState<boolean>(false)
  const [reagentPickerSelection, setReagentPickerSelection] = useState<string[]>([])
  /** 打开试剂选择弹框（预选当前已关联试剂） */
  const openReagentPicker = (): void => {
    setReagentPickerSelection(relation.reagentIds)
    setReagentPickerVisible(true)
  }
  /** 取消试剂选择弹框 */
  const cancelReagentPicker = (): void => {
    setReagentPickerVisible(false)
    setReagentPickerSelection([])
  }
  /** 确认添加所选试剂（去重合并，自动推荐SOP模板） */
  const confirmAddReagents = (): void => {
    const merged = Array.from(new Set([...relation.reagentIds, ...reagentPickerSelection]))
    const firstRecommended = reagents.find(r => reagentPickerSelection.includes(r.id) && !!r.recommendedSOPTemplateId)?.recommendedSOPTemplateId
    setRelation(prev => ({ ...prev, reagentIds: merged, sop: { ...prev.sop, templateId: prev.sop.templateId || firstRecommended } }))
    setReagentPickerVisible(false)
    setReagentPickerSelection([])
  }

  /** 选择分析项目弹框状态与方法 */
  const [analysisPickerVisible, setAnalysisPickerVisible] = useState<boolean>(false)
  const [analysisPickerSelection, setAnalysisPickerSelection] = useState<string[]>([])
  /** 打开分析项目选择弹框（预选当前已关联分析项目） */
  const openAnalysisPicker = (): void => {
    setAnalysisPickerSelection(relation.analysisItemIds)
    setAnalysisPickerVisible(true)
  }
  /** 取消分析项目选择弹框 */
  const cancelAnalysisPicker = (): void => {
    setAnalysisPickerVisible(false)
    setAnalysisPickerSelection([])
  }
  /** 确认添加所选分析项目（去重合并） */
  const confirmAddAnalysisItems = (): void => {
    const merged = Array.from(new Set([...relation.analysisItemIds, ...analysisPickerSelection]))
    setRelation(prev => ({ ...prev, analysisItemIds: merged }))
    setAnalysisPickerVisible(false)
    setAnalysisPickerSelection([])
  }

  /** 实验流程方案（联查只读） */
  interface ExperimentProcessPlan { id: string; name: string; applicableTestItemIds: string[] }
  const [processPlans, setProcessPlans] = useState<ExperimentProcessPlan[]>([])

  useEffect(() => {
    try {
      const saved = localStorage.getItem('experimentProcessPlans')
      if (saved) {
        const arr = JSON.parse(saved) as any[]
        const normalized: ExperimentProcessPlan[] = Array.isArray(arr)
          ? arr.map(p => ({ id: String(p.id), name: String(p.name), applicableTestItemIds: Array.isArray(p.applicableTestItemIds) ? p.applicableTestItemIds.map(String) : [] }))
          : []
        setProcessPlans(normalized)
      } else {
        // mock数据，避免列表为空导致用户无法感知效果
        setProcessPlans([
          { id: 'P-001', name: '标准NGS流程方案', applicableTestItemIds: ['T-001','T-003','T-004'] },
          { id: 'P-002', name: 'PCR快速流程方案', applicableTestItemIds: ['T-002','T-005'] }
        ])
      }
    } catch {}
  }, [])
  // 从localStorage加载关系列表，如无则初始化mock
  useEffect(() => {
    try {
      const saved = localStorage.getItem('testItemRelations')
      let shouldUseMock = true
      
      if (saved) {
        const arr = JSON.parse(saved) as any[]
        if (Array.isArray(arr) && arr.length > 0) {
          const normalized: RelationRow[] = arr.map(r => ({
            id: String(r.id ?? `R-${Math.random().toString(36).slice(2,8)}`),
            testItemId: String(r.testItemId ?? ''),
            methodology: String(r.methodology ?? ''),
            sampleType: String(r.sampleType ?? ''),
            equipmentIds: Array.isArray(r.equipmentIds) ? r.equipmentIds.map(String) : [],
            reagentIds: Array.isArray(r.reagentIds) ? r.reagentIds.map(String) : [],
            analysisItemIds: Array.isArray(r.analysisItemIds) ? r.analysisItemIds.map(String) : [],
            sop: { mode: r?.sop?.mode === 'structured' ? 'structured' : 'document', templateId: r?.sop?.templateId ? String(r.sop.templateId) : undefined }
          }))
          setRelations(normalized)
          shouldUseMock = false
        }
      }
      
      if (shouldUseMock) {
        // 初始化一些mock关系列表数据，便于演示
        const mockData: RelationRow[] = [
          {
            id: 'R-001',
            testItemId: 'T-001',
            methodology: 'NGS',
            sampleType: '血液',
            equipmentIds: ['E-001','E-004'],
            reagentIds: ['R-001'],
            analysisItemIds: ['A-001','A-004','A-005'],
            sop: { mode: 'document' as const, templateId: 'illumina_nextera_xt' }
          },
          {
            id: 'R-002',
            testItemId: 'T-002',
            methodology: 'PCR',
            sampleType: '组织',
            equipmentIds: ['E-002'],
            reagentIds: ['R-002'],
            analysisItemIds: ['A-002'],
            sop: { mode: 'structured' as const, templateId: 'dna_extraction_qiaamp' }
          },
          {
            id: 'R-003',
            testItemId: 'T-003',
            methodology: 'qPCR',
            sampleType: '唾液',
            equipmentIds: ['E-005'],
            reagentIds: ['R-003', 'R-004'],
            analysisItemIds: ['A-003'],
            sop: { mode: 'structured' as const, templateId: 'kapa_hyperprep' }
          },
          {
            id: 'R-004',
            testItemId: 'T-004',
            methodology: 'Sanger测序',
            sampleType: '血液',
            equipmentIds: ['E-003'],
            reagentIds: ['R-001', 'R-003'],
            analysisItemIds: ['A-004', 'A-005'],
            sop: { mode: 'document' as const, templateId: 'magmax_isolation' }
          },
          {
            id: 'R-005',
            testItemId: 'T-005',
            methodology: 'NGS',
            sampleType: '组织',
            equipmentIds: ['E-001', 'E-004'],
            reagentIds: ['R-001', 'R-002', 'R-003'],
            analysisItemIds: ['A-001', 'A-002', 'A-003', 'A-004'],
            sop: { mode: 'structured' as const, templateId: 'illumina_nextera_xt' }
          },
          {
            id: 'R-006',
            testItemId: 'T-001',
            methodology: 'PCR',
            sampleType: '尿液',
            equipmentIds: ['E-002', 'E-005'],
            reagentIds: ['R-002'],
            analysisItemIds: ['A-002'],
            sop: { mode: 'document' as const, templateId: 'dna_extraction_qiaamp' }
          }
        ]
        setRelations(mockData)
        // 立即保存到localStorage
        localStorage.setItem('testItemRelations', JSON.stringify(mockData))
      }
    } catch (e) {
      console.error('加载关系配置数据失败:', e)
      // 出错时也使用mock数据
      const mockData: RelationRow[] = [
        {
          id: 'R-001',
          testItemId: 'T-001',
          methodology: 'NGS',
          sampleType: '血液',
          equipmentIds: ['E-001','E-004'],
          reagentIds: ['R-001'],
          analysisItemIds: ['A-001','A-004','A-005'],
          sop: { mode: 'document' as const, templateId: 'illumina_nextera_xt' }
        }
      ]
      setRelations(mockData)
    }
  }, [])
  // 写入localStorage
  useEffect(() => {
    try { localStorage.setItem('testItemRelations', JSON.stringify(relations)) } catch {}
  }, [relations])

  /** 打开编辑，跳转到编辑页面 */
  /**
   * 打开编辑页面
   * @param row 关系列表行，包含当前关系配置的各字段
   * @returns void 不返回值，仅跳转到编辑页面
   */
  const openEdit = (row: RelationRow): void => {
    navigate(`/detection/test-item-relation/edit/${row.id}`)
  }

  /**
   * 打开新增页面
   * @returns void 不返回值，仅跳转到新增页面
   */
  const openCreate = (): void => {
    navigate('/detection/test-item-relation/new')
  }

  /**
   * 删除关系列表行
   * @param id 关系唯一ID
   * @returns void 不返回值，仅更新列表并提示
   */
  const removeRow = (id: string): void => {
    setRelations(relations.filter(r => r.id !== id))
    message.success('关系已删除')
  }

  /**
   * 保存关系配置（新增或更新到列表）
   * @returns void 不返回值，仅更新列表并关闭弹窗
   */
  const handleSave = (): void => {
    if (!relation.testItemId) {
      message.warning('请先选择一个检测项目')
      return
    }
    if (editingId) {
      setRelations(relations.map(r => (r.id === editingId ? { id: editingId, ...relation } as RelationRow : r)))
      message.success('关系配置已更新')
    } else {
      const newRow: RelationRow = { id: `R-${Math.random().toString(36).slice(2,8)}`, ...relation } as RelationRow
      setRelations([newRow, ...relations])
      message.success('关系配置已保存')
    }
    setEditingId(null)
    setModalVisible(false)
  }

  /**
   * 重置弹窗内容
   * @returns void 不返回值，仅清空编辑态与临时选择
   */
  const handleReset = (): void => {
    setEditingId(null)
    setRelation({ testItemId: '', methodology: '', sampleType: '', equipmentIds: [], reagentIds: [], analysisItemIds: [], sop: { mode: 'document', templateId: undefined } })
    setEditingEquipmentIndex(null); setTempEquipmentId('')
    setEditingReagentIndex(null); setTempReagentId('')
    setEditingAnalysisIndex(null); setTempAnalysisId('')
  }

  // 顶部列表列定义
  const columns = [
    {
      title: '检测项目',
      dataIndex: 'testItemId',
      width: 150,
      ellipsis: true,
      render: (id: string) => (testItems.find(t => t.id === id)?.name || '-')
    },
    { 
      title: '方法学', 
      dataIndex: 'methodology',
      width: 120,
      ellipsis: true
    },
    { 
      title: '设备数', 
      dataIndex: 'equipmentIds', 
      width: 80,
      render: (arr: string[]) => arr.length 
    },
    { 
      title: '试剂数', 
      dataIndex: 'reagentIds', 
      width: 80,
      render: (arr: string[]) => arr.length 
    },
    { 
      title: '分析项目数', 
      dataIndex: 'analysisItemIds', 
      width: 100,
      render: (arr: string[]) => arr.length 
    },
    { 
      title: 'SOP模式', 
      dataIndex: ['sop','mode'], 
      width: 100,
      render: (m: 'document' | 'structured') => m === 'structured' ? '结构化' : '文档' 
    },
    {
      title: '操作',
      width: 120,
      fixed: 'right',
      render: (_: any, row: RelationRow) => (
        <Space>
          <Button size="small" type="link" onClick={() => openEdit(row)}>编辑</Button>
          <Popconfirm title="确认删除该关系？" onConfirm={() => removeRow(row.id)}>
            <Button size="small" danger type="link">删除</Button>
          </Popconfirm>
        </Space>
      )
    }
  ]

  return (
    <div style={{ padding: 24 }}>
      <Card>
        {/* 顶部列表视图 */}
        <Space style={{ width: '100%', justifyContent: 'space-between', marginBottom: 12 }}>
          <Title level={4} style={{ marginBottom: 0 }}>检测项目关系配置列表</Title>
          <Button type="primary" onClick={openCreate}>新增关系配置</Button>
        </Space>
        <Table rowKey="id" columns={columns} dataSource={relations} pagination={{ pageSize: 8 }} scroll={{ x: 770 }} style={{ marginBottom: 24 }} />
      </Card>
    </div>
  )
}

export default TestItemRelationManagement