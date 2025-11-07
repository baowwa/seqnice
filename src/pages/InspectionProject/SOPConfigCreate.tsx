import React, { useMemo, useState } from 'react'
import { Card, Form, Input, Select, Space, Button, Modal, Row, Col, Timeline, Switch, InputNumber, message, Upload } from 'antd'
import type { UploadFile } from 'antd/es/upload/interface'
import { SearchOutlined } from '@ant-design/icons'
import { useNavigate, useLocation } from 'react-router-dom'

/**
 * 组件：新增SOP配置
 * 功能：
 * 1) 选择检验项目编码后自动带出项目名称与方法学
 * 2) 通过弹框选择流程模板；选中后在下方展示流程详情模块：左侧为竖向时间轴节点，右侧为节点配置表单
 * 入参：无
 * 出参：React.FC 组件渲染结果
 */
/**
 * 组件：新增SOP配置
 * 功能：
 * - 选择检验项目与流程模板，填写SOP编码与名称，上传SOP文件
 * - 保存至本地存储，并返回到对应检验项目的编辑页以展示“SOP配置”列表
 * 入参：无
 * 出参：React.FC 组件渲染结果
 */
const SOPConfigCreate: React.FC = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const [form] = Form.useForm()

  /**
   * 数据：检验项目下拉选项（模拟）
   */
  const projectOptions = useMemo(() => ([
    { code: 'IPJ-000001', name: '肿瘤相关基因检测', methodology: '高通量测序' },
    { code: 'IPJ-000002', name: '病原宏基因组检测', methodology: '宏基因组测序' },
    { code: 'IPJ-000003', name: '遗传病基因检测', methodology: '靶向捕获测序' }
  ]), [])

  /**
   * 数据：流程模板（模拟）
   */
  const templateLibrary = useMemo(() => ([
    {
      id: 'tpl-onco',
      name: '肿瘤Panel流程模板',
      nodes: [
        { id: 'n1', name: '样本接收' },
        { id: 'n2', name: 'DNA提取' },
        { id: 'n3', name: '文库构建' },
        { id: 'n4', name: '测序上机' },
        { id: 'n5', name: '生信分析' },
        { id: 'n6', name: '出具报告' }
      ]
    },
    {
      id: 'tpl-micro',
      name: '病原检测流程模板',
      nodes: [
        { id: 'm1', name: '样本接收' },
        { id: 'm2', name: '核酸提取' },
        { id: 'm3', name: '建库与质检' },
        { id: 'm4', name: '测序上机' },
        { id: 'm5', name: '宏基因组分析' },
        { id: 'm6', name: '报告生成' }
      ]
    }
  ]), [])

  const [templateModalVisible, setTemplateModalVisible] = useState(false)
  const [selectedTemplate, setSelectedTemplate] = useState<{ id: string; name: string } | null>(null)
  const [nodes, setNodes] = useState<Array<{ id: string; name: string }>>([])
  const [activeNodeId, setActiveNodeId] = useState<string | null>(null)
  const [nodeConfigs, setNodeConfigs] = useState<Record<string, { owner?: string; duration?: number; description?: string }>>({})
  const [sopFileList, setSopFileList] = useState<UploadFile[]>([])
  const [previewVisible, setPreviewVisible] = useState<boolean>(false)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)

  /**
   * 方法：从查询参数预填检验项目编码
   * 入参：无（读取 location.search）
   * 出参：无
   */
  React.useEffect(() => {
    const params = new URLSearchParams(location.search)
    const projectCode = params.get('projectCode') || ''
    if (projectCode) {
      form.setFieldsValue({ projectCode })
      onProjectCodeChange(projectCode)
    }
  }, [location.search])

  /**
   * 方法：当选择检验项目编码时，自动填充项目名称与方法学
   * 入参：value 检验项目编码
   * 出参：无
   */
  const onProjectCodeChange = (value: string) => {
    const item = projectOptions.find(it => it.code === value)
    form.setFieldsValue({ projectName: item?.name || '', methodology: item?.methodology || '' })
  }

  /**
   * 方法：打开流程模板选择弹框
   * 入参：无
   * 出参：无
   */
  const openTemplatePicker = () => setTemplateModalVisible(true)

  /**
   * 方法：选择流程模板并应用到流程详情
   * 入参：tpl 模板对象
   * 出参：无
   */
  const applyTemplate = (tpl: { id: string; name: string; nodes: Array<{ id: string; name: string }> }) => {
    setSelectedTemplate({ id: tpl.id, name: tpl.name })
    setNodes(tpl.nodes)
    setActiveNodeId(tpl.nodes[0]?.id || null)
    setTemplateModalVisible(false)
    const current = form.getFieldsValue()
    form.setFieldsValue({ templateName: tpl.name, sopName: current.sopName || tpl.name })
  }

  /**
   * 方法：持久化SOP配置到 localStorage
   * 入参：values 表单值
   * 出参：无（写入 localStorage.sopConfigs）
   */
  const persistSopConfig = (values: any): void => {
    try {
      const raw = localStorage.getItem('sopConfigs')
      const list = raw ? JSON.parse(raw) : []
      const arr: any[] = Array.isArray(list) ? list : []
      const fileUrl = sopFileList[0]?.url
      const record = {
        projectCode: values.projectCode,
        sopCode: values.sopCode,
        sopName: values.sopName || values.templateName,
        fileUrl,
        enabled: values.enabled ? 1 : 0,
      }
      const idx = arr.findIndex(it => it?.projectCode === record.projectCode && it?.sopCode === record.sopCode)
      const next = idx >= 0 ? arr.map((it, i) => i === idx ? { ...it, ...record } : it) : [...arr, record]
      localStorage.setItem('sopConfigs', JSON.stringify(next))
    } catch (e) {
      console.error('持久化SOP配置失败', e)
      message.error('保存失败：本地存储异常')
    }
  }

  /**
   * 方法：保存SOP配置
   * 入参：无
   * 出参：无（成功后跳转至检验项目编辑页）
   */
  const handleSave = async () => {
    const values = await form.validateFields()
    if (!selectedTemplate) {
      message.warning('请先选择流程模板')
      return
    }
    persistSopConfig(values)
    message.success('SOP配置已保存')
    if (values.projectCode) {
      navigate(`/inspection-project/library/edit/${values.projectCode}`)
    } else {
      navigate('/inspection-project/sop')
    }
  }

  /**
   * 方法：返回列表页
   * 入参：无
   * 出参：无
   */
  /**
   * 方法：返回列表或项目编辑页
   * 入参：无
   * 出参：无
   */
  const handleBack = () => {
    const code = form.getFieldValue('projectCode')
    if (code) navigate(`/inspection-project/library/edit/${code}`)
    else navigate('/inspection-project/sop')
  }

  /**
   * 方法：处理 SOP 文件选择（阻止自动上传）
   * 入参：file 选择的文件
   * 出参：返回 false 阻止 Upload 组件自动上传
   */
  const beforeUploadSop = (file: UploadFile | File): boolean => {
    /**
     * 兼容 Upload 传入的 RcFile 与 UploadFile：统一构造预览 URL 并标记完成状态
     * 入参：file 选择的文件（`UploadFile | File`）
     * 出参：返回 false 阻止 Upload 自动上传
     */
    let uf: UploadFile
    if ((file as any).uid) {
      uf = file as UploadFile
    } else {
      const f = file as File
      uf = {
        uid: String(Date.now()),
        name: f.name,
        size: f.size,
        type: f.type,
        originFileObj: f as any
      } as UploadFile
    }
    const url = uf.url || (uf.originFileObj ? URL.createObjectURL(uf.originFileObj as Blob) : undefined)
    uf.url = url
    uf.status = 'done'
    setSopFileList([uf])
    return false
  }

  /**
   * 方法：移除已选择的 SOP 文件
   * 入参：file 移除的文件
   * 出参：返回布尔值表示是否成功移除
   */
  const onRemoveSop = (_file: UploadFile): boolean => {
    /**
     * 若是本地生成的 blob URL，需要在移除时释放资源
     */
    if (_file?.url && _file.url.startsWith('blob:')) {
      try { URL.revokeObjectURL(_file.url) } catch {}
    }
    setSopFileList([])
    return true
  }

  /**
   * 方法：预览已选择的 SOP 文件
   * 入参：file UploadFile 对象
   * 出参：无（打开新窗口或弹出 PDF 预览模态框）
   */
  const onPreviewSop = (file: UploadFile): void => {
    const url = file.url || (file.originFileObj ? URL.createObjectURL(file.originFileObj as Blob) : '')
    if (!url) {
      message.warning('无法预览：文件URL不存在')
      return
    }
    const isPdf = (file.type && file.type.includes('pdf')) || /\.pdf$/i.test(file.name || '')
    if (isPdf) {
      setPreviewUrl(url)
      setPreviewVisible(true)
    } else {
      window.open(url, '_blank')
    }
  }

  return (
    <Space direction="vertical" style={{ width: '100%' }} size={16}>
      <Card
        size="small"
        title="新增SOP"
        extra={(
          <Space>
            <Button type="primary" onClick={handleSave}>保存</Button>
            <Button onClick={handleBack}>返回列表</Button>
          </Space>
        )}
      >
        <Form
          form={form}
          layout="horizontal"
          labelCol={{ span: 8 }}
          wrapperCol={{ span: 16 }}
          initialValues={{ enabled: true }}
        >
          {/** 最前：SOP基础信息 */}
          <Row gutter={16}>
            <Col span={8}>
              <Form.Item label="SOP编码" name="sopCode" rules={[{ required: true, message: '请输入SOP编码' }]}> 
                <Input placeholder="如：SOP-0001" />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item label="SOP名称" name="sopName" rules={[{ required: true, message: '请输入SOP名称' }]}> 
                <Input placeholder="如：肿瘤Panel流程SOP" />
              </Form.Item>
            </Col>
            <Col span={8} />
          </Row>

          <Row gutter={16}>
            <Col span={8}>
              <Form.Item label="检验项目编码" name="projectCode" rules={[{ required: true, message: '请选择检验项目编码' }]}> 
                <Select
                  placeholder="请选择编码"
                  showSearch
                  options={projectOptions.map(it => ({ label: it.code, value: it.code }))}
                  filterOption={(input, option) => String(option?.label ?? '').toLowerCase().includes(input.toLowerCase())}
                  onChange={onProjectCodeChange}
                />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item label="检验项目名称" name="projectName">
                <Input placeholder="自动带出" disabled />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item label="方法学" name="methodology">
                <Input placeholder="自动带出" disabled />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={8}>
              <Form.Item label="流程模板" name="templateName" rules={[{ required: true, message: '请选择流程模板' }]}> 
                <Input placeholder="请选择流程模板" readOnly addonAfter={<Button icon={<SearchOutlined />} onClick={openTemplatePicker}>选择</Button>} />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item label="状态" name="enabled" valuePropName="checked">
                <Switch checkedChildren="启用" unCheckedChildren="停用" />
              </Form.Item>
            </Col>
            <Col span={8} />
          </Row>


          {/** 在流程模板下新增 SOP 文件字段（右侧为文件上传组件） */}
          <Row gutter={16}>
            <Col span={8}>
              <Form.Item label="SOP文件" name="sopFile">
                <Upload
                  fileList={sopFileList}
                  beforeUpload={beforeUploadSop}
                  onRemove={onRemoveSop}
                  onPreview={onPreviewSop}
                  maxCount={1}
                  accept=".pdf,.doc,.docx"
                  listType="text"
                >
                  <Button>选择文件</Button>
                </Upload>
              </Form.Item>
            </Col>
            <Col span={8} />
            <Col span={8} />
          </Row>
        </Form>
      </Card>

      <Card size="small" title="流程详情" styles={{ body: { padding: 0 } }}>
        {nodes.length === 0 ? (
          <div style={{ padding: 16, color: '#999' }}>请选择流程模板后，自动展示节点与配置</div>
        ) : (
          <Row gutter={0}>
            <Col span={6} style={{ borderRight: '1px solid #f0f0f0', padding: 16 }}>
              <Timeline mode="left" items={nodes.map(n => ({
                color: n.id === activeNodeId ? 'blue' : 'gray',
                label: '',
                children: (
                  <div
                    style={{ cursor: 'pointer', fontWeight: n.id === activeNodeId ? 600 : 400 }}
                    onClick={() => setActiveNodeId(n.id)}
                  >{n.name}</div>
                )
              }))} />
            </Col>
            <Col span={18} style={{ padding: 16 }}>
              {activeNodeId ? (
                <Form
                  layout="vertical"
                  initialValues={nodeConfigs[activeNodeId] || {}}
                  onValuesChange={(changed, all) => {
                    setNodeConfigs(prev => ({ ...prev, [activeNodeId]: { ...(prev[activeNodeId] || {}), ...all } }))
                  }}
                >
                  <Form.Item label="节点名称">
                    <Input value={nodes.find(n => n.id === activeNodeId)?.name} disabled />
                  </Form.Item>
                  <Form.Item label="负责人" name="owner" rules={[{ required: true, message: '请输入负责人' }]}>
                    <Input placeholder="如：张三" />
                  </Form.Item>
                  <Form.Item label="预计时长(小时)" name="duration" rules={[{ type: 'number', required: true, message: '请输入时长' }]}>
                    <InputNumber min={0} precision={0} style={{ width: '100%' }} />
                  </Form.Item>
                  <Form.Item label="说明" name="description">
                    <Input.TextArea rows={4} placeholder="节点配置说明" />
                  </Form.Item>
                </Form>
              ) : (
                <div style={{ color: '#999' }}>请选择左侧节点进行配置</div>
              )}
            </Col>
          </Row>
        )}
      </Card>

      <Modal
        title="选择流程模板"
        open={templateModalVisible}
        onCancel={() => setTemplateModalVisible(false)}
        footer={null}
      >
        <Space direction="vertical" style={{ width: '100%' }}>
          {templateLibrary.map(tpl => (
            <Card key={tpl.id} size="small" hoverable onClick={() => applyTemplate(tpl)}>
              <Space direction="vertical" style={{ width: '100%' }}>
                <div style={{ fontWeight: 600 }}>{tpl.name}</div>
                <div style={{ color: '#666' }}>节点数：{tpl.nodes.length}</div>
              </Space>
            </Card>
          ))}
        </Space>
      </Modal>

      {/** PDF 预览模态框，仅在选择 PDF 文件时使用 */}
      <Modal
        title="预览SOP文件"
        open={previewVisible}
        onCancel={() => { setPreviewVisible(false); setPreviewUrl(null) }}
        footer={null}
        width={900}
      >
        {previewUrl ? (
          <iframe src={previewUrl} style={{ width: '100%', height: '70vh', border: 0 }} />
        ) : (
          <div style={{ padding: 16, color: '#999' }}>暂无可预览内容</div>
        )}
      </Modal>
    </Space>
  )
}

export default SOPConfigCreate