import React, { useCallback, useMemo, useState } from 'react'
import { Card, Form, Input, Select, DatePicker, Button, Space, Typography, Tabs, message, Table, Upload, Row, Col, Descriptions, Segmented, Drawer, Switch } from 'antd'
import type { UploadProps } from 'antd'
import { InboxOutlined, DownloadOutlined, PlusOutlined, DeleteOutlined, SearchOutlined } from '@ant-design/icons'
import LuckySheetTable from '../../components/LuckySheetTable'

const { Title, Paragraph } = Typography

/**
 * 页面组件：样本接收（样本录入）
 * 职责：提供单个录入、扫码录入、批量导入三种录入模式，支持基础字段校验与提交占位。
 * 设计依据：docs/样本录入设计说明.md
 * 入参：无
 * 出参：React 组件（JSX.Element）
 */
const SampleReceivingPage: React.FC = () => {
  /**
   * 类型定义：单个录入表单值
   * 说明：字段对齐截图中的左侧“样本信息”表单与顶部要素
   * 入参：无
   * 出参：用于 Form 的值对象
   */
  interface SingleEntryFormValues {
    // 顶部行为
    autoNext?: boolean
    // 左侧-样本信息（与截图一致）
    sampleBarcode?: string
    sampleCount?: number
    sampleSource?: string
    sampleDesc?: string
    patientSex?: '男'|'女'
    sampleCategory?: string
    collectionTime?: any
    patientName?: string
    patientAge?: number
    receiver?: string
    labDept?: string
    receiveTime?: any
    sendUnit?: string
    sender?: string
    senderPhone?: string
    projectName?: string
    projectType?: string
    // 兼容旧字段（为保持原逻辑）
    sampleCode?: string
    sampleType?: string
    source?: string
    collectionDate?: any
    location?: string
    remarks?: string
    testCode?: string
    testName?: string
    workflowStatus?: string
  }

  // 扩展扫码列表项的类型，包含接收时间、接收人、检测项目等可选字段
  const [scannedList, setScannedList] = useState<Array<{ 
    code: string; 
    type?: string; 
    source?: string; 
    receiveTime?: any; 
    receiver?: string; 
    testName?: string; 
  }>>([])
  const [uploading, setUploading] = useState(false)
  const [tableData, setTableData] = useState<any[]>(() => Array.from({ length: 5 }).map((_, i) => ({
    id: `row-${i + 1}`,
    sampleCode: '',
    sampleType: '',
    source: '',
    collectionDate: undefined,
    location: '',
    remarks: '',
    status: 'pending',
    createTime: new Date().toISOString(),
    updateTime: new Date().toISOString(),
  })))

  const [form] = Form.useForm<SingleEntryFormValues>()
  const [quickEditForm] = Form.useForm<{ sampleType?: string; receiveTime?: any; receiver?: string; testName?: string }>()
  const [scanMode, setScanMode] = useState<'single'|'composite'|'multi'|'gs1'>('composite')
  const [detailOpen, setDetailOpen] = useState(false)
  const [currentRow, setCurrentRow] = useState<any | null>(null)
  // 表格视图切换与批量填充功能已移除
  // 右侧卡片：检验项目与样本类型行数据及其操作
  /**
   * 状态：检验项目行数据
   * 入参：无
   * 出参：数组，包含每行的检验项目与方法学等信息
   */
  const [testItemRows, setTestItemRows] = useState<Array<{ id: number; itemCode?: string; itemName?: string; sampleType?: string; methodology?: string }>>([
    { id: 1, itemCode: '', itemName: '', sampleType: '', methodology: '' },
    { id: 2, itemCode: '', itemName: '', sampleType: '', methodology: '' },
    { id: 3, itemCode: '', itemName: '', sampleType: '', methodology: '' },
  ])
  /**
   * 状态：样本类型行数据
   * 入参：无
   * 出参：数组，包含样本条码、采样时间、样本数、样本类型、样本状态
   */
  const [sampleKindRows, setSampleKindRows] = useState<Array<{ id: number; barcode?: string; collectDate?: any; count?: number; kind?: string; status?: string }>>([
    { id: 1, barcode: '', collectDate: undefined, count: 1, kind: '', status: '' },
  ])
  /**
   * 方法：更新检验项目某行字段
   * 入参：id 行标识，key 字段名，val 新值
   * 出参：void（更新状态）
   */
  const updateTestItemRow = useCallback((id: number, key: keyof (typeof testItemRows)[number], val: any): void => {
    setTestItemRows(rows => rows.map(r => r.id === id ? { ...r, [key]: val } : r))
  }, [])
  /**
   * 方法：新增/删除检验项目行
   * 入参：type 操作类型 'add' | 'remove'，id 可选删除行 id
   * 出参：void
   */
  const operateTestItemRow = useCallback((type: 'add'|'remove', id?: number): void => {
    if (type === 'add') {
      const nextId = (testItemRows[testItemRows.length - 1]?.id || 0) + 1
      setTestItemRows(rows => [...rows, { id: nextId, itemCode: '', itemName: '', sampleType: '', methodology: '' }])
    } else if (type === 'remove' && id != null) {
      setTestItemRows(rows => rows.filter(r => r.id !== id))
    }
  }, [testItemRows])
  /**
   * 方法：更新样本类型某行字段
   * 入参：id 行标识，key 字段名，val 新值
   * 出参：void（更新状态）
   */
  const updateSampleKindRow = useCallback((id: number, key: keyof (typeof sampleKindRows)[number], val: any): void => {
    setSampleKindRows(rows => rows.map(r => r.id === id ? { ...r, [key]: val } : r))
  }, [])
  /**
   * 方法：新增/删除样本类型行
   * 入参：type 操作类型 'add' | 'remove'，id 可选删除行 id
   * 出参：void
   */
  const operateSampleKindRow = useCallback((type: 'add'|'remove', id?: number): void => {
    if (type === 'add') {
      const nextId = (sampleKindRows[sampleKindRows.length - 1]?.id || 0) + 1
      setSampleKindRows(rows => [...rows, { id: nextId, barcode: '', collectDate: undefined, count: 1, kind: '', status: '' }])
    } else if (type === 'remove' && id != null) {
      setSampleKindRows(rows => rows.filter(r => r.id !== id))
    }
  }, [sampleKindRows])

  /**
   * 常量：本地存储键与默认模式
   * - STORAGE_KEY：样本列表的本地存储键（演示环境）
   * - defaultMode：根据URL查询参数确定当前模式
   */
  const STORAGE_KEY = 'sample_list'
  const defaultMode = useMemo(() => {
    try {
      const qs = new URLSearchParams(window.location.search)
      const mode = (qs.get('mode') as any) || 'single'
      return ['single','scan','table','batch'].includes(mode) ? mode : 'single'
    } catch {
      return 'single'
    }
  }, [])

  /**
   * 返回列表按钮方法
   * 入参：无
   * 出参：void
   */
  const handleBackToList = useCallback((): void => {
    try {
      if (window.opener) {
        window.close()
        return
      }
    } catch {}
    window.location.href = '/sample/list'
  }, [])
  // 顶部开关：自动转到下一条
  const [autoNext, setAutoNext] = useState<boolean>(true)

  /**
   * 方法：提交单个录入
   * 入参：values 表单值
   * 出参：Promise<void>（提交后的用户提示）
   */
  const handleSingleSubmit = useCallback(async (values: SingleEntryFormValues): Promise<void> => {
    // 演示：写入本地样本列表
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      const list = raw ? JSON.parse(raw) : []
      const record = {
        id: `SINGLE-${Date.now()}`,
        // 左侧主要字段
        sampleBarcode: values.sampleBarcode,
        sampleCount: values.sampleCount,
        sampleSource: values.sampleSource || values.source,
        sampleDesc: values.sampleDesc || values.remarks,
        patientSex: values.patientSex,
        sampleCategory: values.sampleCategory || values.sampleType,
        collectionTime: values.collectionTime?.format?.('YYYY-MM-DD') || values.collectionDate,
        patientName: values.patientName,
        patientAge: values.patientAge,
        receiver: values.receiver,
        labDept: values.labDept,
        receiveTime: values.receiveTime?.format?.('YYYY-MM-DD HH:mm') || values.receiveTime,
        sendUnit: values.sendUnit,
        sender: values.sender,
        senderPhone: values.senderPhone,
        projectName: values.projectName || values.testName || values.testCode,
        projectType: values.projectType,
        // 右侧两表
        testItems: testItemRows,
        sampleKinds: sampleKindRows,
        status: '启用',
      }
      localStorage.setItem(STORAGE_KEY, JSON.stringify([record, ...list]))
      message.success('样本已保存（已写入本地列表）')
      form.resetFields()
      if (autoNext) {
        // 清空右侧两表，准备下一条
        setTestItemRows([{ id: 1, itemCode: '', itemName: '', sampleType: '', methodology: '' }])
        setSampleKindRows([{ id: 1, barcode: '', collectDate: undefined, count: 1, kind: '', status: '' }])
      }
    } catch (e) {
      message.error('写入本地样本数据失败')
    }
  }, [form, autoNext, testItemRows, sampleKindRows])

  /**
   * 方法：提交并打印标签（占位）
   * 入参：values 表单值
   * 出参：Promise<void>（打印提示）
   */
  const handleSingleSubmitAndPrint = useCallback(async (values: SingleEntryFormValues): Promise<void> => {
    await handleSingleSubmit(values)
    // TODO: 调用标签打印服务（依据设计文档）
    message.info('已触发标签打印（占位）')
  }, [handleSingleSubmit])

  /**
   * 方法：扫码添加样本到列表
   * 入参：code 样本条码/编码字符串
   * 出参：void（更新本地列表状态）
   */
  const handleScanAdd = useCallback((code: string): void => {
    if (!code) return
    const exists = scannedList.some(item => item.code === code)
    if (exists) {
      message.warning('该样本已在列表中')
      return
    }
    // 基于扫描模式解析基础字段
    const parsed = parseScannedPayload(code, scanMode)
    const quick = quickEditForm.getFieldsValue()
    setScannedList(prev => [...prev, {
      code: parsed.sampleCode || code,
      type: parsed.sampleType || quick.sampleType,
      source: parsed.source,
      receiveTime: parsed.receiveTime || quick.receiveTime,
      receiver: parsed.receiver || quick.receiver,
      testName: parsed.testName || quick.testName
    }])
  }, [scannedList])

  /**
   * 方法：提交扫码列表
   * 入参：无
   * 出参：Promise<void>（提交后的提示）
   */
  const handleScanSubmit = useCallback(async (): Promise<void> => {
    if (scannedList.length === 0) {
      message.warning('请先扫码添加样本')
      return
    }
    // 演示：写入本地样本列表
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      const list = raw ? JSON.parse(raw) : []
      const toSave = scannedList.map((s) => ({
        id: `SCAN-${s.code}-${Date.now()}`,
        sampleCode: s.code,
        sampleType: s.type,
        source: s.source,
        receiveTime: s.receiveTime,
        receiver: s.receiver,
        projectName: s.testName,
        status: '启用',
      }))
      localStorage.setItem(STORAGE_KEY, JSON.stringify([...toSave, ...list]))
      message.success(`已保存 ${toSave.length} 个样本到本地列表`)
    } catch (e) {
      message.error('写入本地样本数据失败')
    }
    setScannedList([])
  }, [scannedList])

  /**
   * 方法：解析扫码载荷
   * 入参：payload 扫码原始字符串；mode 扫码模式（single/composite/multi/gs1）
   * 出参：解析后的对象字段（样本编码/类型/接收人/接收时间/来源/检测名称）
   */
  const parseScannedPayload = useCallback((payload: string, mode: 'single'|'composite'|'multi'|'gs1') => {
    try {
      if (mode === 'single') {
        return { sampleCode: payload }
      }
      if (mode === 'composite') {
        // 支持 JSON 或 URL 查询串或自定义键值对（key=value;key2=value2）
        if (payload.trim().startsWith('{')) {
          const obj = JSON.parse(payload)
          return {
            sampleCode: obj.sample_code || obj.sampleCode,
            sampleType: obj.sample_type || obj.sampleType,
            receiver: obj.receiver,
            receiveTime: obj.receive_time || obj.receiveTime,
            source: obj.sample_source || obj.source,
            testName: obj.test_name || obj.testName
          }
        }
        const urlParts = payload.split('?')
        if (urlParts.length > 1) {
          const qs = new URLSearchParams(urlParts[1])
          return {
            sampleCode: qs.get('sample_code') || qs.get('sampleCode') || undefined,
            sampleType: qs.get('sample_type') || qs.get('sampleType') || undefined,
            receiver: qs.get('receiver') || undefined,
            receiveTime: qs.get('receive_time') || undefined,
            source: qs.get('sample_source') || qs.get('source') || undefined,
            testName: qs.get('test_name') || qs.get('testName') || undefined
          }
        }
        const kvPairs = payload.split(/[;|&]/)
        const map: Record<string, string> = {}
        kvPairs.forEach(p => {
          const [k, v] = p.split('=')
          if (k && v) map[k.trim()] = decodeURIComponent(v.trim())
        })
        return {
          sampleCode: map['sample_code'] || map['sampleCode'],
          sampleType: map['sample_type'] || map['sampleType'],
          receiver: map['receiver'],
          receiveTime: map['receive_time'] || map['receiveTime'],
          source: map['sample_source'] || map['source'],
          testName: map['test_name'] || map['testName']
        }
      }
      if (mode === 'gs1') {
        // 简化版 GS1 解析：支持 (01)(10)(21)(17) 等常见 AI
        const aiMatches = [...payload.matchAll(/\((\d{2})\)([^\(\)]*)/g)]
        const map: Record<string, string> = {}
        aiMatches.forEach(m => { map[m[1]] = m[2] })
        return {
          sampleCode: map['21'], // (21) 序列号 → 对应样本编码
          source: map['10'], // (10) 批号 → 作为来源占位
          receiveTime: map['17'], // (17) 失效日期 → 示例映射
        }
      }
      // multi 模式由前端多码合并，单次解析视作单码
      return { sampleCode: payload }
    } catch (e) {
      return { sampleCode: payload }
    }
  }, [])

  /**
   * 方法：批量导入文件解析（占位）
   * 入参：file 上传的文件对象（CSV/XLSX）
   * 出参：Promise<void>（解析完成后的提示）
   */
  const parseBatchFile = useCallback(async (file: File): Promise<void> => {
    // TODO: 解析 CSV/XLSX 并提交
    message.success(`已接收文件：${file.name}（占位解析）`)
  }, [])

  /**
   * 上传属性：批量导入
   * 入参：UploadProps 内置
   * 出参：UploadProps
   */
  const uploadProps: UploadProps = useMemo(() => ({
    name: 'file',
    multiple: false,
    accept: '.csv,.xlsx',
    showUploadList: true,
    beforeUpload: async (file) => {
      try {
        setUploading(true)
        await parseBatchFile(file as File)
        return false // 阻止默认上传，改为本地解析
      } finally {
        setUploading(false)
      }
    },
  }), [parseBatchFile])

  /**
   * 列定义：扫码列表
   */
  const scanColumns = useMemo(() => ([
    { title: '样本编码', dataIndex: 'code', key: 'code' },
    { title: '类型', dataIndex: 'type', key: 'type' },
    { title: '来源', dataIndex: 'source', key: 'source' },
    { title: '接收时间', dataIndex: 'receiveTime', key: 'receiveTime' },
    { title: '接收人', dataIndex: 'receiver', key: 'receiver' },
    { title: '检测项目', dataIndex: 'testName', key: 'testName' },
    {
      title: '操作', key: 'action', render: (_: any, record: any) => (
        <Space>
          <Button size="small" onClick={() => { setCurrentRow(record); setDetailOpen(true) }}>详情</Button>
        </Space>
      )
    }
  ]), [])

  /**
   * 批量表格录入：列配置
   * 入参：无
   * 出参：列配置数组
   */
  const tableColumns = useMemo(() => {
    const basic = [
      { key: 'sampleCode', title: '样本编码', dataType: 'text', required: true, width: 160, validation: { pattern: '^[A-Za-z0-9\-]+$', message: '仅限字母数字与连字符' } },
      { key: 'sampleType', title: '样本类型', dataType: 'select', required: true, width: 140, options: ['blood', 'saliva', 'tissue'] },
      { key: 'source', title: '来源', dataType: 'text', width: 140 },
      { key: 'collectionDate', title: '采集日期', dataType: 'date', width: 140 },
      { key: 'location', title: '存放位置', dataType: 'text', width: 160 },
      { key: 'remarks', title: '备注', dataType: 'textarea', width: 200 },
      { key: 'status', title: '状态', dataType: 'select', width: 120, options: ['pending', 'processing', 'completed'] },
    ]
    return basic
  }, [])

  /**
   * 方法：批量表格数据提交
   * 入参：无
   * 出参：Promise<void>
   */
  const handleTableSubmit = useCallback(async (): Promise<void> => {
    // 基础必填校验
    const invalid = tableData.filter(r => !r.sampleCode || !r.sampleType)
    if (invalid.length > 0) {
      message.error(`请完善必填字段：样本编码/样本类型（剩余 ${invalid.length} 行）`)
      return
    }
    // 演示：写入本地样本列表
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      const list = raw ? JSON.parse(raw) : []
      const toSave = tableData.map((row) => ({
        id: `TABLE-${row.sampleCode || row.id}-${Date.now()}`,
        sampleCode: row.sampleCode,
        sampleType: row.sampleType,
        source: row.source,
        receiveTime: row.receiveTime,
        receiver: row.receiver,
        projectName: row.projectName || row.projectCode || row.testCode,
        status: row.status === 'pending' ? '启用' : row.status,
      }))
      localStorage.setItem(STORAGE_KEY, JSON.stringify([...toSave, ...list]))
      message.success(`已保存 ${toSave.length} 条样本到本地列表`)
    } catch (e) {
      message.error('写入本地样本数据失败')
    }
  }, [tableData])

  return (
    <Space direction="vertical" size={16} style={{ width: '100%' }}>
        <>
          <Card>
            <Tabs
              tabBarExtraContent={{ right: (<Button onClick={handleBackToList}>返回列表</Button>) }}
              defaultActiveKey={defaultMode}
              onChange={() => {}}
              items={[
            {
              key: 'single',
              label: '单个录入',
              children: (
                <Space direction="vertical" size={16} style={{ width: '100%' }}>
                  <Space align="center" style={{ justifyContent: 'space-between', width: '100%' }}>
                    <Space align="center">
                      <Title level={5} style={{ margin: 0 }}>样本信息录入</Title>
                      <Space size={8} style={{ marginLeft: 16 }}>
                        <Switch checked={autoNext} onChange={setAutoNext} />
                        <span>自动转到下一条</span>
                      </Space>
                    </Space>
                    <Space>
                      <Button type="primary" onClick={() => { form.validateFields().then(vals => handleSingleSubmit(vals)) }}>提交</Button>
                      <Button onClick={() => { form.validateFields().then(vals => { message.success('免审提交（占位）'); return handleSingleSubmit(vals) }) }}>免审提交</Button>
                      <Button onClick={() => { form.validateFields().then(vals => handleSingleSubmit(vals)) }}>保存</Button>
                    </Space>
                  </Space>
                  <Form
                    form={form}
                    layout="horizontal"
                    size="small"
                    labelAlign="right"
                    labelCol={{ span: 8 }}
                    wrapperCol={{ span: 16 }}
                    colon={false}
                    onFinish={handleSingleSubmit}
                  >
                    <Space direction="vertical" size={16} style={{ width: '100%' }}>
                      <Card title="样本信息" size="small">
                        <Row gutter={12}>
                            <Col span={12}><Form.Item label="样本条码" name="sampleBarcode" rules={[{ required: true, message: '请输入样本条码' }]}><Input placeholder="请填写" /></Form.Item></Col>
                            <Col span={12}><Form.Item label="样本大类" name="sampleCategory"><Select options={[{label:'血液',value:'血液'},{label:'唾液',value:'唾液'},{label:'组织',value:'组织'}]} /></Form.Item></Col>
                            <Col span={12}><Form.Item label="样本数量" name="sampleCount"><Input type="number" placeholder="请输入" /></Form.Item></Col>
                            <Col span={12}><Form.Item label="样本采集时间" name="collectionTime"><DatePicker style={{ width: '100%' }} /></Form.Item></Col>
                            <Col span={12}><Form.Item label="样本来源" name="sampleSource"><Input placeholder="请填写" /></Form.Item></Col>
                            <Col span={12}><Form.Item label="患者姓名" name="patientName"><Input placeholder="请填写" /></Form.Item></Col>
                            <Col span={12}><Form.Item label="样本描述" name="sampleDesc"><Input placeholder="请填写" /></Form.Item></Col>
                            <Col span={12}><Form.Item label="患者年龄" name="patientAge"><Input type="number" placeholder="岁" /></Form.Item></Col>
                            <Col span={12}><Form.Item label="患者性别" name="patientSex"><Select options={[{label:'男',value:'男'},{label:'女',value:'女'}]} /></Form.Item></Col>
                            <Col span={12}><Form.Item label="接收人姓名" name="receiver"><Input placeholder="请填写" /></Form.Item></Col>
                            <Col span={12}><Form.Item label="接收日期" name="receiveTime"><DatePicker style={{ width: '100%' }} /></Form.Item></Col>
                            <Col span={12}><Form.Item label="送检单位" name="sendUnit"><Input placeholder="请填写" /></Form.Item></Col>
                            <Col span={12}><Form.Item label="检验科室" name="labDept"><Input placeholder="请填写" /></Form.Item></Col>
                            <Col span={12}><Form.Item label="送检人" name="sender"><Input placeholder="请填写" /></Form.Item></Col>
                            <Col span={12}><Form.Item label="送检人联系方式" name="senderPhone"><Input placeholder="请输入手机号" /></Form.Item></Col>
                            <Col span={12}><Form.Item label="项目名称" name="projectName"><Input placeholder="请选择或输入" /></Form.Item></Col>
                            <Col span={12}><Form.Item label="项目类型" name="projectType"><Input placeholder="请选择或输入" /></Form.Item></Col>
                        </Row>
                      </Card>
                      <Row gutter={16}>
                        <Col span={12}>
                          <Card size="small" title="检验项目" extra={<Button danger size="small" onClick={() => setTestItemRows([])}>批量删除</Button>}>
                            <Table
                              size="small"
                              rowKey="id"
                              pagination={false}
                              dataSource={testItemRows}
                              scroll={{ x: 900, y: 280 }}
                              columns={[
                                { title: '序号', dataIndex: 'id', width: 70 },
                                { title: '操作', width: 90, render: (_: any, row: any) => (<Space><Button type="text" icon={<PlusOutlined />} onClick={() => operateTestItemRow('add')} /><Button type="text" danger icon={<DeleteOutlined />} onClick={() => operateTestItemRow('remove', row.id)} /></Space>) },
                                { title: '检验项目编号', dataIndex: 'itemCode', render: (_: any, row: any) => (<Input value={row.itemCode} onChange={(e) => updateTestItemRow(row.id, 'itemCode', e.target.value)} />) },
                                { title: '检验项目', dataIndex: 'itemName', render: (_: any, row: any) => (<Space><Input value={row.itemName} onChange={(e) => updateTestItemRow(row.id, 'itemName', e.target.value)} /><Button type="text" icon={<SearchOutlined />} /></Space>) },
                                { title: '样本类型', dataIndex: 'sampleType', render: (_: any, row: any) => (<Select style={{ width: '100%' }} value={row.sampleType} onChange={(v) => updateTestItemRow(row.id, 'sampleType', v)} options={[{label:'血液',value:'血液'},{label:'唾液',value:'唾液'},{label:'组织',value:'组织'}]} />) },
                                { title: '方法学', dataIndex: 'methodology', render: (_: any, row: any) => (<Input value={row.methodology} onChange={(e) => updateTestItemRow(row.id, 'methodology', e.target.value)} />) },
                              ]}
                            />
                          </Card>
                        </Col>
                        <Col span={12}>
                          <Card size="small" title="样本类型">
                            <Table
                              size="small"
                              rowKey="id"
                              pagination={false}
                              dataSource={sampleKindRows}
                              scroll={{ x: 800, y: 280 }}
                              columns={[
                                { title: '序号', dataIndex: 'id', width: 70 },
                                { title: '样本条码', dataIndex: 'barcode', render: (_: any, row: any) => (<Input value={row.barcode} onChange={(e) => updateSampleKindRow(row.id, 'barcode', e.target.value)} />) },
                                { title: '采样时间', dataIndex: 'collectDate', render: (_: any, row: any) => (<DatePicker style={{ width: '100%' }} value={row.collectDate as any} onChange={(v) => updateSampleKindRow(row.id, 'collectDate', v)} />) },
                                { title: '样本数', dataIndex: 'count', width: 100, render: (_: any, row: any) => (<Input type="number" value={row.count as any} onChange={(e) => updateSampleKindRow(row.id, 'count', Number(e.target.value))} />) },
                                { title: '样本类型', dataIndex: 'kind', render: (_: any, row: any) => (<Select style={{ width: '100%' }} value={row.kind} onChange={(v) => updateSampleKindRow(row.id, 'kind', v)} options={[{label:'血清',value:'血清'},{label:'血浆',value:'血浆'},{label:'血液',value:'血液'}]} />) },
                                { title: '样本状态', dataIndex: 'status', render: (_: any, row: any) => (<Input value={row.status} onChange={(e) => updateSampleKindRow(row.id, 'status', e.target.value)} />) },
                                { title: '操作', width: 90, render: (_: any, row: any) => (<Space><Button type="text" icon={<PlusOutlined />} onClick={() => operateSampleKindRow('add')} /><Button type="text" danger icon={<DeleteOutlined />} onClick={() => operateSampleKindRow('remove', row.id)} /></Space>) },
                              ]}
                            />
                          </Card>
                        </Col>
                      </Row>
                    </Space>
                  </Form>
                </Space>
              )
            },
            {
              key: 'scan',
              label: '扫码录入',
              children: (
                <Space direction="vertical" size={16} style={{ width: '100%' }}>
                  <Space wrap>
                    <Segmented
                      value={scanMode}
                      onChange={(v) => setScanMode(v as any)}
                      options={[
                        { label: '单码', value: 'single' },
                        { label: '复合码', value: 'composite' },
                        { label: '多码关联', value: 'multi' },
                        { label: 'GS1', value: 'gs1' },
                      ]}
                    />
                    <Input.Search
                      allowClear
                      placeholder="扫码或手动输入样本编码"
                      enterButton="添加"
                      onSearch={(v) => handleScanAdd(v)}
                    />
                    <Button type="primary" onClick={handleScanSubmit}>提交</Button>
                  </Space>
                  <Card size="small" title="快速编辑（应用于缺省字段）">
                    <Form form={quickEditForm} layout="inline">
                      <Form.Item label="样本类型" name="sampleType">
                        <Select style={{ width: 160 }} options={[{label:'血液',value:'blood'},{label:'唾液',value:'saliva'},{label:'组织',value:'tissue'}]} />
                      </Form.Item>
                      <Form.Item label="接收时间" name="receiveTime">
                        <DatePicker showTime style={{ width: 220 }} />
                      </Form.Item>
                      <Form.Item label="接收人" name="receiver">
                        <Input style={{ width: 160 }} placeholder="如：张三" />
                      </Form.Item>
                      <Form.Item label="检测项目" name="testName">
                        <Input style={{ width: 200 }} placeholder="如：肿瘤NGS" />
                      </Form.Item>
                    </Form>
                  </Card>
                  <Table
                    size="small"
                    rowKey="code"
                    columns={scanColumns}
                    dataSource={scannedList}
                    pagination={{ pageSize: 10 }}
                  />
                  <Drawer
                    title="扫码条目详情"
                    open={detailOpen}
                    onClose={() => { setDetailOpen(false); setCurrentRow(null) }}
                    width={560}
                  >
                    <Form
                      layout="vertical"
                      initialValues={currentRow || {}}
                      onFinish={(vals) => {
                        setScannedList(list => list.map(it => it.code === currentRow?.code ? { ...currentRow, ...vals } : it))
                        setDetailOpen(false)
                      }}
                    >
                      <Form.Item label="样本编码" name="code"><Input disabled /></Form.Item>
                      <Form.Item label="样本类型" name="type"><Select options={[{label:'血液',value:'blood'},{label:'唾液',value:'saliva'},{label:'组织',value:'tissue'}]} /></Form.Item>
                      <Form.Item label="来源" name="source"><Input /></Form.Item>
                      <Form.Item label="接收时间" name="receiveTime"><DatePicker showTime style={{ width: '100%' }} /></Form.Item>
                      <Form.Item label="接收人" name="receiver"><Input /></Form.Item>
                      <Form.Item label="检测项目" name="testName"><Input /></Form.Item>
                      <Space>
                        <Button type="primary" htmlType="submit">保存</Button>
                        <Button onClick={() => { setDetailOpen(false); setCurrentRow(null) }}>取消</Button>
                      </Space>
                    </Form>
                  </Drawer>
                </Space>
              )
            },
            {
              key: 'table',
              label: '批量表格录入',
              children: (
                <Space direction="vertical" size={16} style={{ width: '100%' }}>
                  {/* 已移除：基础/临床/项目/质控视图切换与批量填充按钮 */}
                  <Descriptions title="Excel 表格视图（Luckysheet）" column={1}>
                    <Descriptions.Item label="说明">支持原生复制/粘贴、矩阵编辑；数据与保存逻辑保持一致。</Descriptions.Item>
                  </Descriptions>
                  <LuckySheetTable
                    columns={(tableColumns as any).map((c: any) => ({
                      key: c.key,
                      title: c.title,
                      type: c.dataType === 'date' ? 'date' : (c.dataType === 'number' ? 'number' : 'text'),
                    }))}
                    data={tableData as any}
                    onChange={(rows) => setTableData(rows as any)}
                  />
                  <Space>
                    <Button type="primary" onClick={handleTableSubmit}>保存全部</Button>
                  </Space>
                  {/* 已移除：批量填充弹窗 */}
                </Space>
              )
            },
            {
              key: 'batch',
              label: '批量导入',
              children: (
                <Space direction="vertical" size={16} style={{ width: '100%' }}>
                  <Space>
                    <Button icon={<DownloadOutlined />} onClick={() => {
                      // 提供一个简单的 CSV 模板下载占位
                      const content = '样本编码,样本类型,来源,采集日期,存放位置,备注\n'
                      const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' })
                      const url = URL.createObjectURL(blob)
                      const a = document.createElement('a')
                      a.href = url
                      a.download = '样本录入批量模板.csv'
                      a.click()
                      URL.revokeObjectURL(url)
                    }}>下载模板</Button>
                  </Space>
                  <Upload.Dragger {...uploadProps} disabled={uploading}>
                    <p className="ant-upload-drag-icon">
                      <InboxOutlined />
                    </p>
                    <p className="ant-upload-text">点击或拖拽文件到此区域进行上传</p>
                    <p className="ant-upload-hint">支持 .csv/.xlsx，大小建议 ≤ 10MB</p>
                  </Upload.Dragger>
                </Space>
              )
            }
          ]}
            />
        </Card>
        </>
    </Space>
  )
}

export default SampleReceivingPage