import React, { useCallback, useMemo, useState } from 'react'
import { Drawer, Form, Input, Select, DatePicker, Button, Space, Typography, Row, Col, Card, Table, message, Switch } from 'antd'

/**
 * 组件：样本单个录入右侧抽屉
 * 职责：在任意页面以右侧抽屉形式完成“样本信息”录入，并包含“检验项目”和“样本类型”两表格；提交后写入本地存储或交由父组件处理
 * 入参：
 * - open 是否打开抽屉
 * - onClose 关闭抽屉回调
 * - defaultValues 初始表单值（用于编辑或预填）
 * - onSubmitted 提交成功后的回调（传回保存的记录）
 * - storageKey 可选，本地存储键，默认 'sample_list'
 * - width 抽屉宽度，默认 '70%'
 * 出参：React 组件（JSX.Element）
 */
const SampleSingleEntryDrawer: React.FC<{
  open: boolean
  onClose: () => void
  defaultValues?: any
  onSubmitted?: (record: any) => void
  storageKey?: string
  width?: number | string
}> = ({ open, onClose, defaultValues, onSubmitted, storageKey = 'sample_list', width = '70%' }) => {
  const { Title } = Typography

  /**
   * 表单：主录入表单
   * 入参：无
   * 出参：Form 实例
   */
  const [form] = Form.useForm<any>()

  /**
   * 状态：顶部“自动转到下一条”开关
   * 入参：无
   * 出参：boolean
   */
  const [autoNext, setAutoNext] = useState<boolean>(true)

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
   * 方法：提交单个录入
   * 入参：values 表单值
   * 出参：Promise<void>（提交后的用户提示）
   */
  const handleSubmit = useCallback(async (values: any): Promise<void> => {
    try {
      const raw = localStorage.getItem(storageKey)
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

      // 若 defaultValues 中包含 sampleCode，则替换同 sampleCode 的旧记录（列表“编辑”场景）
      const sampleCode = values.sampleCode || defaultValues?.sampleCode
      const next = Array.isArray(list) ? list.filter((it: any) => it.sampleCode !== sampleCode) : []
      localStorage.setItem(storageKey, JSON.stringify([record, ...next]))
      message.success('样本已保存（已写入本地列表）')
      if (onSubmitted) onSubmitted(record)
      form.resetFields()
      if (autoNext) {
        setTestItemRows([{ id: 1, itemCode: '', itemName: '', sampleType: '', methodology: '' }])
        setSampleKindRows([{ id: 1, barcode: '', collectDate: undefined, count: 1, kind: '', status: '' }])
      } else {
        onClose()
      }
    } catch (e) {
      message.error('写入本地样本数据失败')
    }
  }, [storageKey, testItemRows, sampleKindRows, autoNext, onSubmitted, onClose])

  /**
   * 计算：抽屉标题右侧工具区
   * 入参：无
   * 出参：JSX.Element
   */
  const extraActions = useMemo(() => (
    <Space>
      <Button type="primary" onClick={() => { form.validateFields().then(vals => handleSubmit(vals)) }}>提交</Button>
      <Button onClick={() => { form.validateFields().then(vals => { message.success('免审提交（占位）'); return handleSubmit(vals) }) }}>免审提交</Button>
      <Button onClick={() => { form.validateFields().then(vals => handleSubmit(vals)) }}>保存</Button>
      <Button onClick={onClose}>取消</Button>
    </Space>
  ), [form, handleSubmit, onClose])

  return (
    <Drawer
      title={(
        <Space align="center">
          <Title level={5} style={{ margin: 0 }}>样本信息录入</Title>
          <Space size={8} style={{ marginLeft: 16 }}>
            <Switch checked={autoNext} onChange={setAutoNext} />
            <span>自动转到下一条</span>
          </Space>
        </Space>
      )}
      placement="right"
      width={width}
      open={open}
      destroyOnClose
      onClose={onClose}
      extra={extraActions}
    >
      <Form
        form={form}
        layout="horizontal"
        size="small"
        labelAlign="right"
        labelCol={{ span: 8 }}
        wrapperCol={{ span: 16 }}
        colon={false}
        onFinish={handleSubmit}
        initialValues={defaultValues}
      >
        <Space direction="vertical" size={16} style={{ width: '100%' }}>
          <Card title="样本信息" size="small">
            <Row gutter={12}>
              <Col span={12}><Form.Item label="样本条码" name="sampleBarcode" rules={[{ required: true, message: '请输入样本条码' }]}><Input placeholder="请填写" /></Form.Item></Col>
              <Col span={12}><Form.Item label="样本数量" name="sampleCount"><Input type="number" placeholder="请填写" /></Form.Item></Col>
              <Col span={12}><Form.Item label="样本来源" name="sampleSource"><Input placeholder="门诊/住院/外送等" /></Form.Item></Col>
              <Col span={12}><Form.Item label="样本描述" name="sampleDesc"><Input placeholder="简要描述" /></Form.Item></Col>
              <Col span={12}><Form.Item label="患者性别" name="patientSex"><Select options={[{label:'男',value:'男'},{label:'女',value:'女'}]} /></Form.Item></Col>
              <Col span={12}><Form.Item label="样本类别" name="sampleCategory"><Select options={[{label:'血液',value:'blood'},{label:'唾液',value:'saliva'},{label:'组织',value:'tissue'}]} /></Form.Item></Col>
              <Col span={12}><Form.Item label="采集时间" name="collectionTime"><DatePicker showTime style={{ width: '100%' }} /></Form.Item></Col>
              <Col span={12}><Form.Item label="患者姓名" name="patientName"><Input /></Form.Item></Col>
              <Col span={12}><Form.Item label="年龄" name="patientAge"><Input type="number" /></Form.Item></Col>
              <Col span={12}><Form.Item label="接收人" name="receiver"><Input /></Form.Item></Col>
              <Col span={12}><Form.Item label="科室" name="labDept"><Input /></Form.Item></Col>
              <Col span={12}><Form.Item label="接收时间" name="receiveTime"><DatePicker showTime style={{ width: '100%' }} /></Form.Item></Col>
              <Col span={12}><Form.Item label="送检单位" name="sendUnit"><Input /></Form.Item></Col>
              <Col span={12}><Form.Item label="送检人" name="sender"><Input /></Form.Item></Col>
              <Col span={12}><Form.Item label="送检人电话" name="senderPhone"><Input /></Form.Item></Col>
              <Col span={12}><Form.Item label="检验项目" name="projectName"><Input placeholder="如：肿瘤NGS" /></Form.Item></Col>
              <Col span={12}><Form.Item label="项目类型" name="projectType"><Input placeholder="如：Panel/WES" /></Form.Item></Col>
            </Row>
          </Card>

          <Row gutter={16}>
            <Col span={12}>
              <Card size="small" title="检验项目">
                <Space style={{ marginBottom: 8 }}>
                  <Button size="small" icon={undefined} onClick={() => operateTestItemRow('add')}>新增行</Button>
                </Space>
                <Table
                  size="small"
                  rowKey="id"
                  pagination={false}
                  dataSource={testItemRows}
                  scroll={{ x: 900, y: 280 }}
                  columns={[
                    { title: '序号', dataIndex: 'id', width: 70 },
                    { title: '项目编码', dataIndex: 'itemCode', render: (_: any, row: any) => (<Input value={row.itemCode} onChange={(e) => updateTestItemRow(row.id, 'itemCode', e.target.value)} />) },
                    { title: '项目名称', dataIndex: 'itemName', render: (_: any, row: any) => (<Input value={row.itemName} onChange={(e) => updateTestItemRow(row.id, 'itemName', e.target.value)} />) },
                    { title: '样本类型', dataIndex: 'sampleType', render: (_: any, row: any) => (<Select style={{ width: '100%' }} value={row.sampleType} onChange={(v) => updateTestItemRow(row.id, 'sampleType', v)} options={[{label:'血液',value:'blood'},{label:'唾液',value:'saliva'},{label:'组织',value:'tissue'}]} />) },
                    { title: '方法学', dataIndex: 'methodology', render: (_: any, row: any) => (<Input value={row.methodology} onChange={(e) => updateTestItemRow(row.id, 'methodology', e.target.value)} />) },
                    { title: '操作', dataIndex: 'op', render: (_: any, row: any) => (<Button size="small" danger onClick={() => operateTestItemRow('remove', row.id)}>删除</Button>) },
                  ]}
                />
              </Card>
            </Col>
            <Col span={12}>
              <Card size="small" title="样本类型">
                <Space style={{ marginBottom: 8 }}>
                  <Button size="small" onClick={() => operateSampleKindRow('add')}>新增行</Button>
                </Space>
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
                    { title: '样本类型', dataIndex: 'kind', render: (_: any, row: any) => (<Select style={{ width: '100%' }} value={row.kind} onChange={(v) => updateSampleKindRow(row.id, 'kind', v)} options={[{label:'血液',value:'blood'},{label:'唾液',value:'saliva'},{label:'组织',value:'tissue'}]} />) },
                    { title: '样本状态', dataIndex: 'status', render: (_: any, row: any) => (<Input value={row.status} onChange={(e) => updateSampleKindRow(row.id, 'status', e.target.value)} />) },
                    { title: '操作', dataIndex: 'op', render: (_: any, row: any) => (<Button size="small" danger onClick={() => operateSampleKindRow('remove', row.id)}>删除</Button>) },
                  ]}
                />
              </Card>
            </Col>
          </Row>
        </Space>
      </Form>
    </Drawer>
  )
}

export default SampleSingleEntryDrawer