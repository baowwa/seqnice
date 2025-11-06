import React, { useMemo, useState } from 'react'
import { Button, Card, Drawer, Form, Input, Select, Space, Table, Tag, message } from 'antd'

/**
 * 检验项目库页面
 * 职责：提供检验项目的基础维护能力（列表、新增、编辑、删除）。
 * 字段覆盖截图中的“基本信息”表：
 * - 检测项目编码（系统自动生成，租户内唯一）
 * - 检测项目名称（必填）
 * - 检测项目类型（字典项：正式/自定义）
 * - 标准检测项目（单选，存标准项目code）
 * - 检测项目描述（选填）
 * - 方法学（单选，存方法学编码）
 * - 检验科室（从科室选择，存科室id）
 * - 状态（是否启用：0否，1是，默认1）
 * - 组织（系统默认根据租组织赋值，此示例用常量模拟）
 */
const InspectionProjectLibrary: React.FC = () => {
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
   * 检验项目数据模型
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
  }

  /**
   * 本地项目列表状态
   */
  const [projects, setProjects] = useState<InspectionProject[]>([
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
  ])

  /** 表单显示与编辑态 */
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [editing, setEditing] = useState<InspectionProject | null>(null)
  const [form] = Form.useForm<InspectionProject>()

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
   * @returns void
   */
  const handleAdd = (): void => {
    setEditing(null)
    form.resetFields()
    form.setFieldsValue({
      code: generateCode(),
      status: 1,
      organizationId: defaultOrgId,
    })
    setDrawerOpen(true)
  }

  /**
   * 编辑项目
   * @param record 选中的检验项目记录
   * @returns void
   */
  const handleEdit = (record: InspectionProject): void => {
    setEditing(record)
    form.setFieldsValue(record)
    setDrawerOpen(true)
  }

  /**
   * 删除项目
   * @param code 待删除项目的编码
   * @returns void
   */
  const handleDelete = (code: string): void => {
    setProjects(prev => prev.filter(p => p.code !== code))
    message.success('已删除项目')
  }

  /**
   * 保存项目（新增或编辑）
   * @returns Promise<void> 保存完成后关闭抽屉并提示
   */
  const handleSave = async (): Promise<void> => {
    const values = await form.validateFields()
    if (editing) {
      setProjects(prev => prev.map(p => p.code === editing.code ? { ...editing, ...values } : p))
      message.success('已更新项目')
    } else {
      setProjects(prev => [{ ...values }, ...prev])
      message.success('已新增项目')
    }
    setDrawerOpen(false)
  }

  /**
   * 关闭抽屉并重置表单
   * @returns void
   */
  const handleClose = (): void => {
    setDrawerOpen(false)
    setEditing(null)
    form.resetFields()
  }

  /**
   * 将字典值转中文标签
   * @param options 选项列表
   * @param value 当前值
   * @returns 中文标签或原始值
   */
  const getLabel = (options: { label: string, value: any }[], value: any): string => {
    const found = options.find(o => o.value === value)
    return found ? found.label : String(value ?? '')
  }

  const columns = [
    { title: '检测项目编码', dataIndex: 'code', key: 'code', width: 160 },
    { title: '检测项目名称', dataIndex: 'name', key: 'name', width: 200 },
    { title: '检测项目类型', dataIndex: 'type', key: 'type', width: 120, render: (v: number) => getLabel(typeOptions, v) },
    { title: '标准检测项目', dataIndex: 'standardProjectCode', key: 'standardProjectCode', width: 180, render: (v: string) => getLabel(standardProjectOptions, v) },
    { title: '方法学', dataIndex: 'methodologyCode', key: 'methodologyCode', width: 120, render: (v: string) => getLabel(methodologyOptions, v) },
    { title: '检验科室', dataIndex: 'departmentId', key: 'departmentId', width: 140, render: (v: number) => getLabel(departmentOptions, v) },
    { title: '状态', dataIndex: 'status', key: 'status', width: 100, render: (v: number) => v === 1 ? <Tag color="green">启用</Tag> : <Tag color="red">停用</Tag> },
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

      <Drawer
        title={editing ? '编辑检验项目' : '新增检验项目'}
        width={520}
        open={drawerOpen}
        onClose={handleClose}
        destroyOnClose
        footer={(
          <Space style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <Button onClick={handleClose}>取消</Button>
            <Button type="primary" onClick={handleSave}>保存</Button>
          </Space>
        )}
      >
        <Form form={form} layout="vertical">
          <Form.Item label="检测项目编码" name="code">
            <Input disabled />
          </Form.Item>

          <Form.Item label="检测项目名称" name="name" rules={[{ required: true, message: '请输入检测项目名称' }]}>
            <Input maxLength={100} placeholder="请输入项目名称" />
          </Form.Item>

          <Form.Item label="检测项目类型" name="type">
            <Select options={typeOptions} allowClear placeholder="请选择类型" />
          </Form.Item>

          <Form.Item label="标准检测项目" name="standardProjectCode">
            <Select options={standardProjectOptions} allowClear placeholder="请选择标准项目" />
          </Form.Item>

          <Form.Item label="检测项目描述" name="description">
            <Input.TextArea rows={3} maxLength={500} placeholder="可选，填写项目描述" />
          </Form.Item>

          <Form.Item label="方法学" name="methodologyCode">
            <Select options={methodologyOptions} allowClear placeholder="请选择方法学" />
          </Form.Item>

          <Form.Item label="检验科室" name="departmentId">
            <Select options={departmentOptions} allowClear placeholder="请选择科室" />
          </Form.Item>

          <Form.Item label="状态" name="status" initialValue={1}>
            <Select options={statusOptions} />
          </Form.Item>

          <Form.Item label="组织" name="organizationId">
            <Input disabled />
          </Form.Item>
        </Form>
      </Drawer>
    </Card>
  )
}

export default InspectionProjectLibrary