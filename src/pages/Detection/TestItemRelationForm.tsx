import React, { useState, useEffect } from 'react'
import { Card, Form, Select, Button, Space, Typography, message, Table, Row, Col, Input, Popconfirm, Tag, Modal } from 'antd'
import { ArrowLeftOutlined } from '@ant-design/icons'
import { useNavigate, useParams } from 'react-router-dom'

const { Title } = Typography
const { Option } = Select

/**
 * 可折叠区域组件
 * @param title 区域标题
 * @param defaultExpanded 默认是否展开
 * @param children 子组件内容
 * @returns JSX.Element 可折叠区域组件
 */
interface SectionProps {
  title: string
  defaultExpanded?: boolean
  children: React.ReactNode
}

const Section: React.FC<SectionProps> = ({ title, defaultExpanded = true, children }) => {
  const [expanded, setExpanded] = useState(defaultExpanded)
  
  return (
    <div style={{ marginBottom: 16, border: '1px solid #e8e8e8', borderRadius: 4 }}>
      <div 
        style={{ 
          padding: '12px 16px', 
          backgroundColor: '#fafafa', 
          cursor: 'pointer', 
          borderBottom: expanded ? '1px solid #e8e8e8' : 'none',
          borderLeft: '4px solid #1890ff',
          display: 'flex',
          alignItems: 'center',
          fontSize: '14px',
          fontWeight: 500
        }}
        onClick={() => setExpanded(!expanded)}
      >
        <span>{title}</span>
        <span 
          style={{ 
            marginLeft: 8,
            fontSize: '12px',
            transform: expanded ? 'rotate(90deg)' : 'rotate(0deg)', 
            transition: 'transform 0.2s',
            color: '#666'
          }}
        >
          ▶
        </span>
      </div>
      {expanded && (
        <div style={{ padding: '16px' }}>
          {children}
        </div>
      )}
    </div>
  )
}

/**
 * 检测项目（用于关系绑定时选择）
 */
interface TestItemBasic {
  /** 检测项目唯一标识 */
  id: string
  /** 检测项目编码 */
  code: string
  /** 检测项目名称 */
  name: string
  /** 英文名称 */
  englishName?: string
}

/**
 * 设备档案基础信息
 */
interface EquipmentBasic {
  /** 设备ID */
  id: string
  /** 设备编码 */
  code: string
  /** 设备名称 */
  name: string
}

/**
 * 试剂档案基础信息
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
}

/**
 * 分析项目基础信息
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
  /** 样本类型（支持多选） */
  sampleType: string[]
  /** 关联设备ID列表 */
  equipmentIds: string[]
  /** 关联试剂ID列表 */
  reagentIds: string[]
  /** 关联分析项目ID列表 */
  analysisItemIds: string[]
  /** SOP配置 */
  sop: {
    /** SOP模式：文档或结构化 */
    mode: 'document' | 'structured'
    /** 模板ID（可选） */
    templateId?: string
  }
}

/**
 * 关系列表行数据结构
 */
interface RelationRow extends TestItemRelationConfig {
  id: string
}

/**
 * 检测项目关系配置表单页面
 * @returns JSX.Element 检测项目关系配置表单页面
 */
const TestItemRelationForm: React.FC = () => {
  const navigate = useNavigate()
  const { id } = useParams<{ id: string }>()
  const isEdit = id !== 'new'

  // 基础数据
  const testItems: TestItemBasic[] = [
    { id: 'T-001', code: 'TI001', name: '肠道菌群多样性分析', englishName: 'Gut Microbiome Diversity Analysis' },
    { id: 'T-002', code: 'TI002', name: '土壤微生物群结构检测', englishName: 'Soil Microbial Community Structure Detection' },
    { id: 'T-003', code: 'TI003', name: '海水微生物基因组测序', englishName: 'Marine Microbial Genome Sequencing' },
    { id: 'T-004', code: 'TI004', name: '病原体快速检测', englishName: 'Rapid Pathogen Detection' },
    { id: 'T-005', code: 'TI005', name: '环境DNA宏基因组分析', englishName: 'Environmental DNA Metagenome Analysis' }
  ]

  const methodologies = ['NGS', 'PCR', 'qPCR', 'Sanger测序', '宏基因组测序']
  const sampleTypes = ['血液', '组织', '唾液', '尿液', '粪便', '土壤', '水样']

  const equipments: EquipmentBasic[] = [
    { id: 'E-001', code: 'EQ001', name: 'Illumina NextSeq 550' },
    { id: 'E-002', code: 'EQ002', name: 'ABI 7500 Real-Time PCR' },
    { id: 'E-003', code: 'EQ003', name: 'Thermo Fisher Ion Torrent' },
    { id: 'E-004', code: 'EQ004', name: 'Illumina NovaSeq 6000' },
    { id: 'E-005', code: 'EQ005', name: 'Roche LightCycler 480' }
  ]

  const reagents: ReagentBasic[] = [
    { id: 'R-001', code: 'RG001', name: 'Nextera XT Library Prep Kit', recommendedSOPTemplateId: 'illumina_nextera_xt' },
    { id: 'R-002', code: 'RG002', name: 'QIAamp DNA Mini Kit', recommendedSOPTemplateId: 'dna_extraction_qiaamp' },
    { id: 'R-003', code: 'RG003', name: 'KAPA HyperPrep Kit', recommendedSOPTemplateId: 'kapa_hyperprep' },
    { id: 'R-004', code: 'RG004', name: 'MagMAX Viral/Pathogen Nucleic Acid Isolation Kit', recommendedSOPTemplateId: 'magmax_isolation' }
  ]

  const analysisItems: AnalysisItemBasic[] = [
    { id: 'A-001', code: 'AI001', name: '16S rRNA基因测序分析' },
    { id: 'A-002', code: 'AI002', name: '宏基因组功能注释' },
    { id: 'A-003', code: 'AI003', name: '微生物多样性统计' },
    { id: 'A-004', code: 'AI004', name: '病原体鉴定与分型' },
    { id: 'A-005', code: 'AI005', name: '抗生素耐药基因检测' }
  ]

  // 表单数据状态
  const [relation, setRelation] = useState<TestItemRelationConfig>({
    testItemId: '',
    methodology: '',
    sampleType: [],
    equipmentIds: [],
    reagentIds: [],
    analysisItemIds: [],
    sop: { mode: 'document', templateId: undefined }
  })

  // 选择弹框状态
  const [devicePickerVisible, setDevicePickerVisible] = useState(false)
  const [reagentPickerVisible, setReagentPickerVisible] = useState(false)
  const [analysisPickerVisible, setAnalysisPickerVisible] = useState(false)
  
  const [devicePickerSelection, setDevicePickerSelection] = useState<string[]>([])
  const [reagentPickerSelection, setReagentPickerSelection] = useState<string[]>([])
  const [analysisPickerSelection, setAnalysisPickerSelection] = useState<string[]>([])

  // 加载编辑数据
  useEffect(() => {
    if (isEdit && id) {
      const stored = localStorage.getItem('testItemRelations')
      if (stored) {
        const relations: RelationRow[] = JSON.parse(stored)
        const target = relations.find(r => r.id === id)
        if (target) {
          setRelation({
            testItemId: target.testItemId,
            methodology: target.methodology,
            sampleType: (target as any).sampleType ?? '',
            equipmentIds: target.equipmentIds,
            reagentIds: target.reagentIds,
            analysisItemIds: target.analysisItemIds,
            sop: target.sop
          })
        }
      }
    }
  }, [isEdit, id])

  /**
   * 打开设备选择弹框
   * @returns void 不返回值，仅设置弹框可见状态
   */
  const openDevicePicker = (): void => {
    setDevicePickerSelection([])
    setDevicePickerVisible(true)
  }

  /**
   * 确认添加设备
   * @returns void 不返回值，仅将选中设备添加到关系配置中
   */
  const confirmAddDevices = (): void => {
    const newIds = devicePickerSelection.filter(id => !relation.equipmentIds.includes(id))
    if (newIds.length === 0) {
      message.warning('请选择新的设备')
      return
    }
    setRelation(prev => ({ ...prev, equipmentIds: [...prev.equipmentIds, ...newIds] }))
    setDevicePickerVisible(false)
    message.success(`已添加 ${newIds.length} 个设备`)
  }

  /**
   * 取消设备选择
   * @returns void 不返回值，仅关闭弹框
   */
  const cancelDevicePicker = (): void => {
    setDevicePickerVisible(false)
  }

  /**
   * 打开试剂选择弹框
   * @returns void 不返回值，仅设置弹框可见状态
   */
  const openReagentPicker = (): void => {
    setReagentPickerSelection([])
    setReagentPickerVisible(true)
  }

  /**
   * 确认添加试剂
   * @returns void 不返回值，仅将选中试剂添加到关系配置中
   */
  const confirmAddReagents = (): void => {
    const newIds = reagentPickerSelection.filter(id => !relation.reagentIds.includes(id))
    if (newIds.length === 0) {
      message.warning('请选择新的试剂')
      return
    }
    // 自动设置推荐的SOP模板
    const firstRecommended = newIds.map(id => reagents.find(r => r.id === id)?.recommendedSOPTemplateId).find(Boolean)
    setRelation(prev => ({ 
      ...prev, 
      reagentIds: [...prev.reagentIds, ...newIds],
      sop: { ...prev.sop, templateId: firstRecommended || prev.sop.templateId }
    }))
    setReagentPickerVisible(false)
    message.success(`已添加 ${newIds.length} 个试剂`)
  }

  /**
   * 取消试剂选择
   * @returns void 不返回值，仅关闭弹框
   */
  const cancelReagentPicker = (): void => {
    setReagentPickerVisible(false)
  }

  /**
   * 打开分析项目选择弹框
   * @returns void 不返回值，仅设置弹框可见状态
   */
  const openAnalysisPicker = (): void => {
    setAnalysisPickerSelection([])
    setAnalysisPickerVisible(true)
  }

  /**
   * 确认添加分析项目
   * @returns void 不返回值，仅将选中分析项目添加到关系配置中
   */
  const confirmAddAnalysisItems = (): void => {
    const newIds = analysisPickerSelection.filter(id => !relation.analysisItemIds.includes(id))
    if (newIds.length === 0) {
      message.warning('请选择新的分析项目')
      return
    }
    setRelation(prev => ({ ...prev, analysisItemIds: [...prev.analysisItemIds, ...newIds] }))
    setAnalysisPickerVisible(false)
    message.success(`已添加 ${newIds.length} 个分析项目`)
  }

  /**
   * 取消分析项目选择
   * @returns void 不返回值，仅关闭弹框
   */
  const cancelAnalysisPicker = (): void => {
    setAnalysisPickerVisible(false)
  }

  /**
   * 保存关系配置
   * @returns void 不返回值，仅保存配置并返回列表页
   */
  const handleSave = (): void => {
    if (!relation.testItemId || !relation.methodology || !relation.sampleType) {
      message.error('请填写完整的基本信息')
      return
    }

    const stored = localStorage.getItem('testItemRelations')
    const relations: RelationRow[] = stored ? JSON.parse(stored) : []
    
    if (isEdit && id) {
      // 编辑模式
      const index = relations.findIndex(r => r.id === id)
      if (index >= 0) {
        relations[index] = {
          ...relations[index],
          ...relation,
          testItem: testItems.find(t => t.id === relation.testItemId)?.name || '',
          equipmentCount: relation.equipmentIds.length,
          reagentCount: relation.reagentIds.length,
          analysisItemCount: relation.analysisItemIds.length
        }
      }
    } else {
      // 新增模式
      const newRelation: RelationRow = {
        id: Date.now().toString(),
        ...relation,
        testItem: testItems.find(t => t.id === relation.testItemId)?.name || '',
        equipmentCount: relation.equipmentIds.length,
        reagentCount: relation.reagentIds.length,
        analysisItemCount: relation.analysisItemIds.length
      }
      relations.push(newRelation)
    }
    
    localStorage.setItem('testItemRelations', JSON.stringify(relations))
    message.success(isEdit ? '编辑成功' : '新增成功')
    navigate('/detection/test-item-relation')
  }

  /**
   * 取消操作，返回列表页
   * @returns void 不返回值，仅返回列表页
   */
  const handleCancel = (): void => {
    navigate('/detection/test-item-relation')
  }

  return (
    <div style={{ padding: 24 }}>
      <Card>
        {/* 顶部操作栏 */}
        <Space style={{ width: '100%', justifyContent: 'space-between', marginBottom: 24 }}>
          <Space>
            <Button icon={<ArrowLeftOutlined />} onClick={handleCancel}>返回</Button>
            <Title level={4} style={{ marginBottom: 0 }}>
              {isEdit ? '编辑关系配置' : '新增关系配置'}
            </Title>
          </Space>
          <Space>
            <Button onClick={handleCancel}>取消</Button>
            <Button type="primary" onClick={handleSave}>保存</Button>
          </Space>
        </Space>

        {/* 基本信息 */}
        <Section title="基本信息" defaultExpanded>
          <Form layout="horizontal">
            {/* 第一行：检测项目编码、检测项目名称、英文名称（直接显示文字） */}
            <Row gutter={24} style={{ marginBottom: 16 }}>
              <Col span={8}>
                <div style={{ display: 'flex', alignItems: 'center', height: '32px' }}>
                  <span style={{ width: '33.33%', color: '#666', fontSize: '14px' }}>检测项目编码：</span>
                  <span style={{ flex: 1, fontSize: '14px' }}>
                    {relation.testItemId ? testItems.find(t => t.id === relation.testItemId)?.code || '-' : '-'}
                  </span>
                </div>
              </Col>
              <Col span={8}>
                <div style={{ display: 'flex', alignItems: 'center', height: '32px' }}>
                  <span style={{ width: '33.33%', color: '#666', fontSize: '14px' }}>检测项目名称：</span>
                  <span style={{ flex: 1, fontSize: '14px' }}>
                    {relation.testItemId ? testItems.find(t => t.id === relation.testItemId)?.name || '-' : '-'}
                  </span>
                </div>
              </Col>
              <Col span={8}>
                <div style={{ display: 'flex', alignItems: 'center', height: '32px' }}>
                  <span style={{ width: '33.33%', color: '#666', fontSize: '14px' }}>英文名称：</span>
                  <span style={{ flex: 1, fontSize: '14px' }}>
                    {relation.testItemId ? testItems.find(t => t.id === relation.testItemId)?.englishName || '-' : '-'}
                  </span>
                </div>
              </Col>
            </Row>
            
            {/* 第二行：方法学、样本类型（调整宽度比例） */}
            <Row gutter={24}>
              <Col span={8}>
                <Form.Item label="方法学" labelCol={{ span: 6 }} wrapperCol={{ span: 18 }}>
                  <Select
                    placeholder="请选择方法学"
                    style={{ width: '100%' }}
                    value={relation.methodology}
                    onChange={(value) => setRelation(prev => ({ ...prev, methodology: value as string }))}
                  >
                    {methodologies.map(m => (<Option key={m} value={m}>{m}</Option>))}
                  </Select>
                </Form.Item>
              </Col>
              <Col span={16}>
                <Form.Item label="样本类型" labelCol={{ span: 3 }} wrapperCol={{ span: 21 }}>
                  <Select
                    mode="multiple"
                    placeholder="请选择样本类型"
                    style={{ width: '100%' }}
                    value={relation.sampleType}
                    onChange={(value) => setRelation(prev => ({ ...prev, sampleType: value as string[] }))}
                  >
                    {sampleTypes.map(s => (<Option key={s} value={s}>{s}</Option>))}
                  </Select>
                </Form.Item>
              </Col>
            </Row>
            
            {/* 检测项目选择（仅在新增模式下显示） */}
            {!isEdit && (
              <Row gutter={24} style={{ marginTop: 16 }}>
                <Col span={24}>
                  <Form.Item label="选择检测项目" labelCol={{ span: 3 }} wrapperCol={{ span: 21 }}>
                    <Select
                      placeholder="请选择检测项目"
                      style={{ width: '100%' }}
                      value={relation.testItemId}
                      onChange={(value) => setRelation(prev => ({ ...prev, testItemId: value as string }))}
                    >
                      {testItems.map(t => (
                        <Option key={t.id} value={t.id}>{t.name}（{t.code}）</Option>
                      ))}
                    </Select>
                  </Form.Item>
                </Col>
              </Row>
            )}
          </Form>
        </Section>

        {/* 设备信息 */}
        <Section title="设备信息" defaultExpanded>
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 16 }}>
            <Button type="primary" onClick={openDevicePicker}>新增设备</Button>
          </div>
          <Table
            size="small"
            rowKey={(id) => id as string}
            columns={[
              { title: '设备编码', dataIndex: 'code', key: 'code', render: (_: any, id: string) => equipments.find(e => e.id === id)?.code || '-' },
              { title: '设备名称', dataIndex: 'name', key: 'name', render: (_: any, id: string) => equipments.find(e => e.id === id)?.name || '-' },
              { 
                title: '操作', 
                key: 'action', 
                render: (_: any, id: string) => (
                  <Popconfirm title="确认删除该设备？" onConfirm={() => setRelation(prev => ({ ...prev, equipmentIds: prev.equipmentIds.filter(x => x !== id) }))}>
                    <Button type="link" danger size="small">删除</Button>
                  </Popconfirm>
                )
              }
            ]}
            dataSource={relation.equipmentIds}
            pagination={false}
            locale={{ emptyText: '暂无设备，请点击新增按钮添加' }}
          />
        </Section>

        {/* 试剂信息 */}
        <Section title="试剂信息" defaultExpanded>
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 16 }}>
            <Button type="primary" onClick={openReagentPicker}>新增试剂</Button>
          </div>
          <Table
            size="small"
            rowKey={(id) => id as string}
            columns={[
              { title: '试剂编码', dataIndex: 'code', key: 'code', render: (_: any, id: string) => reagents.find(r => r.id === id)?.code || '-' },
              { title: '试剂名称', dataIndex: 'name', key: 'name', render: (_: any, id: string) => reagents.find(r => r.id === id)?.name || '-' },
              { 
                title: '操作', 
                key: 'action', 
                render: (_: any, id: string) => (
                  <Popconfirm title="确认删除该试剂？" onConfirm={() => setRelation(prev => ({ ...prev, reagentIds: prev.reagentIds.filter(x => x !== id) }))}>
                    <Button type="link" danger size="small">删除</Button>
                  </Popconfirm>
                )
              }
            ]}
            dataSource={relation.reagentIds}
            pagination={false}
            locale={{ emptyText: '暂无试剂，请点击新增按钮添加' }}
          />
        </Section>

        {/* 关联分析项目 */}
        <Section title="关联分析项目" defaultExpanded>
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 16 }}>
            <Button type="primary" onClick={openAnalysisPicker}>新增分析项目</Button>
          </div>
          <Table
            size="small"
            rowKey={(id) => id as string}
            columns={[
              { title: '编码', dataIndex: 'code', key: 'code', render: (_: any, id: string) => analysisItems.find(a => a.id === id)?.code || '-' },
              { title: '分析项目名称', dataIndex: 'name', key: 'name', render: (_: any, id: string) => analysisItems.find(a => a.id === id)?.name || '-' },
              { 
                title: '操作', 
                key: 'action', 
                render: (_: any, id: string) => (
                  <Popconfirm title="确认删除该分析项目？" onConfirm={() => setRelation(prev => ({ ...prev, analysisItemIds: prev.analysisItemIds.filter(x => x !== id) }))}>
                    <Button type="link" danger size="small">删除</Button>
                  </Popconfirm>
                )
              }
            ]}
            dataSource={relation.analysisItemIds}
            pagination={false}
            locale={{ emptyText: '暂无分析项目，请点击新增按钮添加' }}
          />
        </Section>

        {/* SOP配置 */}
        <Section title="SOP配置" defaultExpanded>
          <Form layout="horizontal">
            <Row gutter={24}>
              <Col span={12}>
                <Form.Item label="模式" labelCol={{ span: 6 }} wrapperCol={{ span: 18 }}>
                  <Select 
                    style={{ width: '100%' }} 
                    value={relation.sop.mode} 
                    onChange={(value) => setRelation(prev => ({ ...prev, sop: { ...prev.sop, mode: value as 'document' | 'structured' } }))}
                  >
                    <Option value="document">文档</Option>
                    <Option value="structured">结构化</Option>
                  </Select>
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item label="模板ID" labelCol={{ span: 6 }} wrapperCol={{ span: 18 }}>
                  <Tag color="geekblue" style={{ width: '100%', textAlign: 'center' }}>
                    {relation.sop.templateId || '暂无'}
                  </Tag>
                </Form.Item>
              </Col>
            </Row>
          </Form>
          {/* 推荐模板列表 */}
          <Table
            size="small"
            rowKey={(item) => item.templateId}
            columns={[
              { title: '模板ID', dataIndex: 'templateId' }, 
              { title: '来源试剂', dataIndex: 'reagentName' }
            ]}
            dataSource={Array.from(new Set(relation.reagentIds.map(rid => reagents.find(r => r.id === rid)?.recommendedSOPTemplateId).filter(Boolean)))
              .map(tid => ({ templateId: tid, reagentName: reagents.find(r => r.recommendedSOPTemplateId === tid)?.name || '-' }))}
            locale={{ emptyText: '暂无模板推荐' }}
            pagination={false}
          />
        </Section>

        {/* 选择弹框：设备 */}
        <Modal
          title="选择设备"
          open={devicePickerVisible}
          onCancel={cancelDevicePicker}
          onOk={confirmAddDevices}
          okText="确定"
          cancelText="取消"
          destroyOnClose
        >
          <Table
            size="small"
            rowKey="id"
            columns={[
              { title: '设备编码', dataIndex: 'code' },
              { title: '设备名称', dataIndex: 'name' }
            ]}
            dataSource={equipments}
            rowSelection={{
              selectedRowKeys: devicePickerSelection,
              onChange: (keys) => setDevicePickerSelection(keys as string[])
            }}
            pagination={false}
          />
        </Modal>

        {/* 选择弹框：试剂 */}
        <Modal
          title="选择试剂"
          open={reagentPickerVisible}
          onCancel={cancelReagentPicker}
          onOk={confirmAddReagents}
          okText="确定"
          cancelText="取消"
          destroyOnClose
        >
          <Table
            size="small"
            rowKey="id"
            columns={[
              { title: '试剂编码', dataIndex: 'code' },
              { title: '试剂名称', dataIndex: 'name' }
            ]}
            dataSource={reagents}
            rowSelection={{
              selectedRowKeys: reagentPickerSelection,
              onChange: (keys) => setReagentPickerSelection(keys as string[])
            }}
            pagination={false}
          />
        </Modal>

        {/* 选择弹框：分析项目 */}
        <Modal
          title="选择分析项目"
          open={analysisPickerVisible}
          onCancel={cancelAnalysisPicker}
          onOk={confirmAddAnalysisItems}
          okText="确定"
          cancelText="取消"
          destroyOnClose
        >
          <Table
            size="small"
            rowKey="id"
            columns={[
              { title: '编码', dataIndex: 'code' },
              { title: '分析项目名称', dataIndex: 'name' }
            ]}
            dataSource={analysisItems}
            rowSelection={{
              selectedRowKeys: analysisPickerSelection,
              onChange: (keys) => setAnalysisPickerSelection(keys as string[])
            }}
            pagination={false}
          />
        </Modal>
      </Card>
    </div>
  )
}

export default TestItemRelationForm