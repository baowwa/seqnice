import React, { useMemo, useState } from 'react'
import { Card, Form, Input, Select, Switch, Tabs, InputNumber, Space, Button, message, Row, Col, Table, Tag, Modal } from 'antd'
import { PlusOutlined, DeleteOutlined, EyeOutlined, DownloadOutlined } from '@ant-design/icons'
import { useNavigate, useParams } from 'react-router-dom'

/**
 * 页面组件：编辑检验项目（独立页面）
 * 布局：顶部“基本信息”独立块（横向表单），下方为其他模块的Tabs，不使用抽屉
 * 功能：读取URL参数中的编码，从localStorage加载并回填；保存时更新localStorage并做布尔字段0/1映射
 * 入参：无（路由参数code）
 * 出参：React 组件（JSX.Element）
 */
const InspectionProjectLibraryEdit: React.FC = () => {
  const navigate = useNavigate()
  const { code } = useParams()
  const [form] = Form.useForm()
  const [activeTab, setActiveTab] = useState<string>('equip')
  const [sopPreviewVisible, setSopPreviewVisible] = useState<boolean>(false)
  const [sopPreviewUrl, setSopPreviewUrl] = useState<string>('')

  const defaultOrgId = 1001

  const typeOptions = useMemo(() => ([
    { label: '正式', value: 1 },
    { label: '自定义', value: 2 },
  ]), [])

  const methodologyOptions = useMemo(() => ([
    { label: 'qPCR', value: 'QPCR' },
    { label: '测序', value: 'SEQ' },
    { label: '显微镜', value: 'MIC' },
  ]), [])

  const standardProjectOptions = useMemo(() => ([
    { label: '结核分枝杆菌检测', value: 'STD_MTB' },
    { label: 'HIV抗体检测', value: 'STD_HIV' },
    { label: 'HBV表面抗原', value: 'STD_HBV' },
  ]), [])

  const departmentOptions = useMemo(() => ([
    { label: '检验一科', value: 2001 },
    { label: '分子检验科', value: 2002 },
    { label: '免疫检验科', value: 2003 },
  ]), [])

  /** 设备与试剂列表状态 */
  const [equipmentList, setEquipmentList] = useState<{ id: string, code?: string, name?: string, note?: string }[]>([])
  const [reagentList, setReagentList] = useState<{ id: string, code?: string, name?: string, note?: string }[]>([])

  /**
   * 样本要求列表（扩展字段）
   * 说明：新增计量单位、保存温度、保存期限，样本量改为文本框
   * 入参：无
   * 出参：React 状态（数组）
   */
  const [samples, setSamples] = useState<{ id: string, sampleType?: string, requiredVolume?: string, unit?: string, storageTemperature?: string, storagePeriod?: string, rejectCriteria?: string }[]>([])

  /**
   * 方法：根据code加载项目并回填
   * 入参：无
   * 出参：void
   */
  React.useEffect(() => {
    const cached = localStorage.getItem('inspectionProjects')
    const list = cached ? JSON.parse(cached) : []
    const item = Array.isArray(list) ? list.find((p: any) => p.code === code) : null
    const values = item ?? {
      code,
      status: 1,
      organizationId: defaultOrgId,
    }
    // 表单布尔字段映射
    form.setFieldsValue({
      ...values,
      status: (values.status ?? 1) === 1,
      requiresBioinformatics: (values.requiresBioinformatics ?? 0) === 1,
    })
    setEquipmentList((values.equipmentList ?? []).map((it: any, idx: number) => ({ id: `${Date.now()}-${idx}`, code: it.code, name: it.name, note: it.note })))
    setReagentList((values.reagentList ?? []).map((it: any, idx: number) => ({ id: `${Date.now()}-${idx}`, code: it.code, name: it.name, note: it.note })))
    setSamples((values.samples ?? []).map((it: any, idx: number) => ({ id: `${Date.now()}-${idx}`, sampleType: it.sampleType, requiredVolume: it.requiredVolume, unit: it.unit, storageTemperature: it.storageTemperature, storagePeriod: it.storagePeriod, rejectCriteria: it.rejectCriteria })))
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [code])

  /**
   * 方法：为指定项目（如 IPJ-000001）注入示例 SOP 配置，便于预览效果
   * 入参：无（读取路由参数 code）
   * 出参：无（若本地无该项目的 SOP 配置则写入一条示例数据）
   */
  React.useEffect(() => {
    try {
      const raw = localStorage.getItem('sopConfigs')
      const list = raw ? JSON.parse(raw) : []
      const arr: any[] = Array.isArray(list) ? list : []
      const hasForCode = arr.some((it: any) => it?.projectCode === code)
      // 仅在无数据时注入示例，避免重复添加
      if (!hasForCode && code === 'IPJ-000001') {
        const sample = {
          projectCode: code,
          sopCode: 'SOP-0001',
          sopName: '肿瘤Panel流程SOP',
          fileUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
          enabled: 1,
        }
        localStorage.setItem('sopConfigs', JSON.stringify([...arr, sample]))
      }
    } catch {
      // 忽略本地存储异常
    }
  }, [code])

  /** 方法学变更提醒 */
  const handleMethodologyChange = (v: string): void => {
    form.setFieldValue('methodologyCode', v)
    message.warning('方法学变更可能影响单位/参考区间与性能参数，请复核相关配置')
  }

  /** 保存：更新localStorage并返回列表 */
  const handleSave = async (): Promise<void> => {
    const values = await form.validateFields()
    const payload = {
      code: values.code,
      name: values.name,
      type: values.type,
      standardProjectCode: values.standardProjectCode,
      description: values.description,
      methodologyCode: values.methodologyCode,
      departmentId: values.departmentId,
      status: values.status ? 1 : 0,
      organizationId: values.organizationId,
      /**
       * 样本要求字段持久化（编辑）
       * 入参：表单值与samples状态
       * 出参：包含所有扩展字段的对象数组
       */
      sample: values.sample ?? (samples.length > 0 ? { sampleType: samples[0].sampleType, requiredVolume: samples[0].requiredVolume, unit: samples[0].unit, storageTemperature: samples[0].storageTemperature, storagePeriod: samples[0].storagePeriod, rejectCriteria: samples[0].rejectCriteria } : undefined),
      samples: samples.map(({ sampleType, requiredVolume, unit, storageTemperature, storagePeriod, rejectCriteria }) => ({ sampleType, requiredVolume, unit, storageTemperature, storagePeriod, rejectCriteria })),
      equipmentList: equipmentList.map(({ code: equipCode, name, note }) => ({ code: equipCode, name, note })),
      reagentList: reagentList.map(({ code: reagentCode, name, note }) => ({ code: reagentCode, name, note })),
      sop: values.sop,
      requiresBioinformatics: values.requiresBioinformatics ? 1 : 0,
      bio: values.bio,
      report: values.report,
    }
    const cached = localStorage.getItem('inspectionProjects')
    const list = cached ? JSON.parse(cached) : []
    const next = Array.isArray(list) ? list.map((p: any) => p.code === code ? { ...p, ...payload } : p) : []
    localStorage.setItem('inspectionProjects', JSON.stringify(next))
    message.success('已保存修改')
    navigate('/inspection-project/library')
  }

  /** 渲染：基本信息（顶部独立块，横向布局） */
  const renderBasicInfo = (): JSX.Element => (
    <>
      <Row gutter={24}>
        <Col span={12}>
          <Form.Item label="管理组织" name="organizationId">
            <Input disabled />
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item label="检测项目编码" name="code">
            <Input disabled />
          </Form.Item>
        </Col>
      </Row>

      <Row gutter={24}>
        <Col span={12}>
          <Form.Item label="检测项目名称" name="name" rules={[{ required: true, message: '请输入检测项目名称' }]}> 
            <Input maxLength={100} placeholder="请输入项目名称" />
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item label="方法学" name="methodologyCode">
            <Select options={methodologyOptions} allowClear placeholder="请选择方法学" onChange={handleMethodologyChange} />
          </Form.Item>
        </Col>
      </Row>

      <Row gutter={24}>
        <Col span={12}>
          <Form.Item label="检测项目类型" name="type">
            <Select options={typeOptions} allowClear placeholder="请选择类型" />
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item label="标准检测项目" name="standardProjectCode">
            <Select options={standardProjectOptions} allowClear placeholder="请选择标准项目" />
          </Form.Item>
        </Col>
      </Row>

      <Row gutter={24}>
        <Col span={12}>
          <Form.Item label="检验科室" name="departmentId">
            <Select options={departmentOptions} allowClear placeholder="请选择科室" />
          </Form.Item>
        </Col>
      </Row>

      {/** 将“描述”“状态”与检验科室左对齐（置于左列） */}
      <Row gutter={24}>
        <Col span={12}>
          <Form.Item label="检测项目描述" name="description">
            <Input.TextArea rows={3} maxLength={500} placeholder="可选，填写项目描述" />
          </Form.Item>
        </Col>
        <Col span={12} />
      </Row>

      <Row gutter={24}>
        <Col span={12}>
          <Form.Item label="状态（是否启用）" name="status" valuePropName="checked" initialValue={true}>
            <Switch checkedChildren="启用" unCheckedChildren="停用" />
          </Form.Item>
        </Col>
        <Col span={12} />
      </Row>
    </>
  )

  /**
   * 渲染：设备与试剂（左右并排、统一样式）
   * - 左侧设备：序号、操作（加号/删除）、编号、名称、备注
   * - 右侧试剂：序号、操作（加号/删除）、编号、名称、备注
   * 入参：无
   * 出参：JSX.Element
   */
  const renderEquipAndReagent = (): JSX.Element => {
    const commonStyle = { width: '100%' }
    /**
     * 下拉选项：设备与试剂
     * 入参：无
     * 出参：设备/试剂的编码与名称映射，用于编号选择后自动填充名称
     */
    const equipmentOptionsList: Array<{ code: string; name: string }> = [
      { code: 'E001', name: '离心机' },
      { code: 'E002', name: '恒温振荡器' },
      { code: 'E003', name: '移液器' },
      { code: 'E004', name: '水浴锅' },
      { code: 'E005', name: '涡旋混合器' },
    ]
    const reagentOptionsList: Array<{ code: string; name: string }> = [
      { code: 'R001', name: 'DNA提取试剂盒' },
      { code: 'R002', name: 'PCR扩增试剂' },
      { code: 'R003', name: '文库构建试剂盒' },
    ]
    const equipmentColumns = [
      { title: '序号', key: 'index', width: 60, align: 'center' as const, render: (_: any, __: any, idx: number) => idx + 1 },
      { title: '操作', key: 'action', width: 80, align: 'center' as const, render: (_: any, __: any, idx: number) => (
        <Space>
          <PlusOutlined onClick={() => setEquipmentList(prev => {
            const newItem = { id: `${Date.now()}`, code: '', name: '', note: '' }
            const next = [...prev]
            next.splice(idx + 1, 0, newItem)
            return next
          })} />
          <DeleteOutlined onClick={() => setEquipmentList(prev => prev.filter((_, i) => i !== idx))} />
        </Space>
      ) },
      { title: '设备编号', dataIndex: 'code', key: 'code', width: 200, render: (_: any, row: any, idx: number) => (
        <Select
          placeholder="选择设备编号"
          style={commonStyle}
          value={row.code}
          showSearch
          options={equipmentOptionsList.map(it => ({ label: it.code, value: it.code }))}
          filterOption={(input, option) => String(option?.label ?? '').toLowerCase().includes(input.toLowerCase())}
          onChange={v => {
            const selected = equipmentOptionsList.find(it => it.code === v)
            setEquipmentList(prev => prev.map((it, i) => i === idx ? { ...it, code: v, name: selected?.name || it.name } : it))
          }}
        />
      ) },
      { title: '设备名称', dataIndex: 'name', key: 'name', width: 200, render: (_: any, row: any, idx: number) => (
        <Input placeholder="名称" style={commonStyle} value={row.name} onChange={e => {
          const v = e.target.value
          setEquipmentList(prev => prev.map((it, i) => i === idx ? { ...it, name: v } : it))
        }} />
      ) },
      { title: '备注', dataIndex: 'note', key: 'note', width: 160, render: (_: any, row: any, idx: number) => (
        <Input placeholder="可选" style={commonStyle} value={row.note} onChange={e => {
          const v = e.target.value
          setEquipmentList(prev => prev.map((it, i) => i === idx ? { ...it, note: v } : it))
        }} />
      ) },
    ]

    const reagentColumns = [
      { title: '序号', key: 'index', width: 60, align: 'center' as const, render: (_: any, __: any, idx: number) => idx + 1 },
      { title: '操作', key: 'action', width: 80, align: 'center' as const, render: (_: any, __: any, idx: number) => (
        <Space>
          <PlusOutlined onClick={() => setReagentList(prev => {
            const newItem = { id: `${Date.now()}`, code: '', name: '', note: '' }
            const next = [...prev]
            next.splice(idx + 1, 0, newItem)
            return next
          })} />
          <DeleteOutlined onClick={() => setReagentList(prev => prev.filter((_, i) => i !== idx))} />
        </Space>
      ) },
      { title: '试剂编号', dataIndex: 'code', key: 'code', width: 200, render: (_: any, row: any, idx: number) => (
        <Select
          placeholder="选择试剂编号"
          style={commonStyle}
          value={row.code}
          showSearch
          options={reagentOptionsList.map(it => ({ label: it.code, value: it.code }))}
          filterOption={(input, option) => String(option?.label ?? '').toLowerCase().includes(input.toLowerCase())}
          onChange={v => {
            const selected = reagentOptionsList.find(it => it.code === v)
            setReagentList(prev => prev.map((it, i) => i === idx ? { ...it, code: v, name: selected?.name || it.name } : it))
          }}
        />
      ) },
      { title: '试剂名称', dataIndex: 'name', key: 'name', width: 200, render: (_: any, row: any, idx: number) => (
        <Input placeholder="名称" style={commonStyle} value={row.name} onChange={e => {
          const v = e.target.value
          setReagentList(prev => prev.map((it, i) => i === idx ? { ...it, name: v } : it))
        }} />
      ) },
      { title: '备注', dataIndex: 'note', key: 'note', width: 160, render: (_: any, row: any, idx: number) => (
        <Input placeholder="可选" style={commonStyle} value={row.note} onChange={e => {
          const v = e.target.value
          setReagentList(prev => prev.map((it, i) => i === idx ? { ...it, note: v } : it))
        }} />
      ) },
    ]

    return (
      <Row gutter={24}>
        <Col span={12}>
          <Card size="small" title="设备" extra={<Space><Button size="small" type="primary" onClick={() => setEquipmentList(prev => [...prev, { id: `${Date.now()}`, code: '', name: '', note: '' }])}>添加</Button><Button danger size="small" onClick={() => setEquipmentList([])}>批量删除</Button></Space>} bodyStyle={{ padding: 0 }}>
            <Table rowKey="id" size="small" columns={equipmentColumns as any} dataSource={equipmentList} pagination={false} scroll={{ x: 700 }} />
          </Card>
        </Col>
        <Col span={12}>
          <Card size="small" title="试剂" extra={<Space><Button size="small" type="primary" onClick={() => setReagentList(prev => [...prev, { id: `${Date.now()}`, code: '', name: '', note: '' }])}>添加</Button><Button danger size="small" onClick={() => setReagentList([])}>批量删除</Button></Space>} bodyStyle={{ padding: 0 }}>
            <Table rowKey="id" size="small" columns={reagentColumns as any} dataSource={reagentList} pagination={false} scroll={{ x: 700 }} />
          </Card>
        </Col>
      </Row>
    )
  }

  /**
   * 渲染：样本要求（新增字段与排序）
   * - 字段顺序：样本类型（下拉）、样本量（文本框）、计量单位（下拉）、保存温度、保存期限、拒收原因
   * 入参：无
   * 出参：JSX.Element
   */
  const renderSampleList = (): JSX.Element => {
    const sampleColumns = [
      { title: '样本类型', dataIndex: 'sampleType', key: 'sampleType', width: 180, render: (_: any, row: any, idx: number) => (
        <Select style={{ width: '100%' }} value={row.sampleType} onChange={v => setSamples(prev => prev.map((it, i) => i === idx ? { ...it, sampleType: v } : it))} options={[
          { label: '血清', value: '血清' },
          { label: '血浆', value: '血浆' },
          { label: '全血', value: '全血' },
          { label: '尿', value: '尿' },
          { label: '唾液', value: '唾液' },
        ]} />
      ) },
      { title: '样本量', dataIndex: 'requiredVolume', key: 'requiredVolume', width: 120, render: (_: any, row: any, idx: number) => (
        <Input style={{ width: '100%' }} placeholder="如 0.5" value={row.requiredVolume} onChange={e => setSamples(prev => prev.map((it, i) => i === idx ? { ...it, requiredVolume: e.target.value } : it))} />
      ) },
      { title: '计量单位', dataIndex: 'unit', key: 'unit', render: (_: any, row: any, idx: number) => (
        <Select style={{ width: '100%' }} placeholder="请选择单位" value={row.unit} onChange={v => setSamples(prev => prev.map((it, i) => i === idx ? { ...it, unit: v } : it))} options={[
          { label: 'mL', value: 'mL' },
          { label: 'μL', value: 'μL' },
          { label: 'g', value: 'g' },
          { label: 'mg', value: 'mg' },
        ]} />
      ) },
      { title: '保存温度', dataIndex: 'storageTemperature', key: 'storageTemperature', render: (_: any, row: any, idx: number) => (
        <Input style={{ width: '100%' }} placeholder="如 2-8℃ / -20℃" value={row.storageTemperature} onChange={e => setSamples(prev => prev.map((it, i) => i === idx ? { ...it, storageTemperature: e.target.value } : it))} />
      ) },
      { title: '保存期限', dataIndex: 'storagePeriod', key: 'storagePeriod', render: (_: any, row: any, idx: number) => (
        <Input style={{ width: '100%' }} placeholder="如 24小时 / 7天" value={row.storagePeriod} onChange={e => setSamples(prev => prev.map((it, i) => i === idx ? { ...it, storagePeriod: e.target.value } : it))} />
      ) },
      { title: '拒收原因', dataIndex: 'rejectCriteria', key: 'rejectCriteria', render: (_: any, row: any, idx: number) => (
        <Input placeholder="如 溶血/脂血/量不足" value={row.rejectCriteria} onChange={e => setSamples(prev => prev.map((it, i) => i === idx ? { ...it, rejectCriteria: e.target.value } : it))} />
      ) },
      { title: '操作', key: 'action', width: 100, render: (_: any, __: any, idx: number) => (
        <Button danger type="link" onClick={() => setSamples(prev => prev.filter((_, i) => i !== idx))}>删除</Button>
      ) },
    ]
    return (
      <>
        <Space style={{ marginBottom: 8 }}>
          <Button type="primary" onClick={() => setSamples(prev => [{ id: `${Date.now()}` }, ...prev])}>添加样本要求</Button>
        </Space>
        <Table rowKey="id" size="small" columns={sampleColumns as any} dataSource={samples} pagination={false} />
      </>
    )
  }

  /**
   * 渲染：SOP配置列表（编辑页）
   * 功能：展示当前检验项目的所有SOP配置；支持文件预览与下载
   * 入参：无
   * 出参：JSX.Element
   */
  const renderSop = (): JSX.Element => {
    const projectCode: string | undefined = Form.useWatch('code', form)

    const loadSopConfigs = (code?: string): Array<{ sopCode: string; sopName: string; fileUrl?: string; enabled?: boolean }> => {
      const cached = localStorage.getItem('sopConfigs')
      const list = cached ? JSON.parse(cached) : []
      const rows = Array.isArray(list) ? list.filter((it: any) => it.projectCode === code) : []
      return rows.map((it: any) => ({ sopCode: it.sopCode, sopName: it.sopName, fileUrl: it.fileUrl, enabled: !!it.enabled }))
    }

    const previewFile = (url?: string, name?: string) => {
      if (!url) { message.warning('暂无文件可预览'); return }
      const isPdf = /\.pdf$/i.test(name || '') || (url.includes('.pdf'))
      if (isPdf) {
        setSopPreviewUrl(url)
        setSopPreviewVisible(true)
      } else {
        window.open(url, '_blank')
      }
    }

    const downloadFile = (url?: string, name?: string) => {
      if (!url) { message.warning('暂无文件可下载'); return }
      const a = document.createElement('a')
      a.href = url
      a.download = name || 'SOP文件'
      a.target = '_blank'
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
    }

    const data = loadSopConfigs(projectCode)

    const columns = [
      { title: 'SOP编码', dataIndex: 'sopCode', key: 'sopCode', width: 160 },
      { title: 'SOP名称', dataIndex: 'sopName', key: 'sopName', width: 240 },
      { title: 'SOP文件', dataIndex: 'fileUrl', key: 'fileUrl', width: 220, render: (url: string, row: any) => (
        <Space>
          <Button size="small" icon={<EyeOutlined />} onClick={() => previewFile(url, row.sopName)}>预览</Button>
          <Button size="small" icon={<DownloadOutlined />} onClick={() => downloadFile(url, row.sopName)}>下载</Button>
        </Space>
      ) },
      { title: 'SOP状态', dataIndex: 'enabled', key: 'enabled', width: 120, render: (v: boolean) => (
        <Tag color={v ? 'green' : 'default'}>{v ? '启用' : '停用'}</Tag>
      ) },
    ]

    return (
      <>
        {data.length === 0 ? (
          <Space>
            <div style={{ color: '#999' }}>该检验项目暂未配置SOP</div>
            <Button type="primary" onClick={() => navigate(`/inspection-project/sop/create${projectCode ? `?projectCode=${projectCode}` : ''}`)}>添加SOP配置</Button>
          </Space>
        ) : (
          <>
            <Space style={{ marginBottom: 8 }}>
              <Button type="primary" onClick={() => navigate(`/inspection-project/sop/create${projectCode ? `?projectCode=${projectCode}` : ''}`)}>添加SOP配置</Button>
            </Space>
            <Table rowKey="sopCode" size="small" columns={columns as any} dataSource={data} pagination={false} />
          </>
        )}

        <Modal
          title="预览SOP文件"
          open={sopPreviewVisible}
          onCancel={() => { setSopPreviewVisible(false); setSopPreviewUrl('') }}
          footer={null}
          width={900}
        >
          {sopPreviewUrl ? (
            <iframe src={sopPreviewUrl} style={{ width: '100%', height: '70vh', border: 0 }} />
          ) : (
            <div style={{ padding: 16, color: '#999' }}>暂无可预览内容</div>
          )}
        </Modal>
      </>
    )
  }

  /** 渲染：生信应用（左列对齐检验科室） */
  const renderBio = (): JSX.Element => (
    <>
      <Row gutter={24}>
        <Col span={12}>
          <Form.Item label="是否需要生信分析" name="requiresBioinformatics" valuePropName="checked" initialValue={false}>
            <Switch checkedChildren="需要" unCheckedChildren="不需要" />
          </Form.Item>
        </Col>
        <Col span={12} />
      </Row>
      {Form.useWatch('requiresBioinformatics', form) ? (
        <>
          <Row gutter={24}>
            <Col span={12}>
              <Form.Item label="生信应用ID" name={["bio","bioAppId"]}>
                <InputNumber step={1} min={1} placeholder="应用ID" style={{ width: '100%' }} />
              </Form.Item>
            </Col>
            <Col span={12} />
          </Row>
          <Row gutter={24}>
            <Col span={12}>
              <Form.Item label="流水线ID" name={["bio","pipelineId"]}>
                <InputNumber step={1} min={1} placeholder="流水线ID" style={{ width: '100%' }} />
              </Form.Item>
            </Col>
            <Col span={12} />
          </Row>
          <Row gutter={24}>
            <Col span={12}>
              <Form.Item label="输入映射（FASTQ/BAM/VCF）" name={["bio","inputMapping"]}>
                <Input.TextArea rows={3} maxLength={500} placeholder="填写数据来源或路径映射说明" />
              </Form.Item>
            </Col>
            <Col span={12} />
          </Row>
          <Row gutter={24}>
            <Col span={12}>
              <Form.Item label="参数（JSON）" name={["bio","pipelineParams"]}>
                <Input.TextArea rows={3} maxLength={1000} placeholder='如 {"minDepth":30,"minQual":20}' />
              </Form.Item>
            </Col>
            <Col span={12} />
          </Row>
          <Row gutter={24}>
            <Col span={12}>
              <Form.Item label="产物说明" name={["bio","outputArtifacts"]}>
                <Input.TextArea rows={2} maxLength={500} placeholder="如 生成VCF/统计表/图像等" />
              </Form.Item>
            </Col>
            <Col span={12} />
          </Row>
        </>
      ) : null}
    </>
  )

  /** 渲染：报告模板（左列对齐检验科室） */
  const renderReport = (): JSX.Element => (
    <>
      <Row gutter={24}>
        <Col span={12}>
          <Form.Item label="报告模板ID" name={["report","reportTemplateId"]}>
            <InputNumber step={1} min={1} placeholder="模板ID" style={{ width: '100%' }} />
          </Form.Item>
        </Col>
        <Col span={12} />
      </Row>
      <Row gutter={24}>
        <Col span={12}>
          <Form.Item label="模板版本" name={["report","reportTemplateVersion"]}>
            <Input placeholder="如 v2" maxLength={20} />
          </Form.Item>
        </Col>
        <Col span={12} />
      </Row>
      <Row gutter={24}>
        <Col span={12}>
          <Form.Item label="变量映射说明" name={["report","variablesMapping"]}>
            <Input.TextArea rows={3} maxLength={1000} placeholder="说明结果变量与模板变量的绑定" />
          </Form.Item>
        </Col>
        <Col span={12} />
      </Row>
    </>
  )

  return (
    <>
      <Card
        title="编辑检验项目"
        extra={(
          <Space>
            <Button onClick={() => navigate('/inspection-project/library')}>返回列表</Button>
            <Button type="primary" onClick={handleSave}>保存</Button>
          </Space>
        )}
      >
        <Form form={form} layout="horizontal" labelAlign="right" labelCol={{ span: 6 }} wrapperCol={{ span: 18 }}>
          {renderBasicInfo()}
          <Tabs
            activeKey={activeTab}
            onChange={setActiveTab}
            items={[
              { key: 'equip', label: '设备与试剂', children: renderEquipAndReagent() },
              { key: 'sample', label: '样本要求', children: renderSampleList() },
              { key: 'sop', label: 'SOP配置', children: renderSop() },
              { key: 'bio', label: '生信应用', children: renderBio() },
              { key: 'report', label: '报告模板', children: renderReport() },
            ]}
          />
        </Form>
      </Card>
    </>
  )
}

export default InspectionProjectLibraryEdit