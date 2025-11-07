import React, { useMemo, useState } from 'react'
import { Card, Table, Space, Button, Modal, Form, Input, Switch, Tag, message } from 'antd'

/**
 * 页面组件：标准检验项目
 * 职责：提供标准检验项目的列表浏览与“新增（弹框）”功能，字段符合截图规范
 * 设计依据：用户提供字段说明（编码、名称、疾病类型、临床意义、描述、状态）
 * 入参：无
 * 出参：React 组件（JSX.Element）
 */
const InspectionProjectStandardPage: React.FC = () => {
  /**
   * 本地列表数据状态
   * 入参：无
   * 出参：标准检验项目数组
   */
  const [items, setItems] = useState<StandardItem[]>([
    { code: 'STD_000001', name: 'HIV抗体筛查', diseaseType: '传染病', clinicalMeaning: 'HIV初筛检测项目', description: 'ELISA筛查为主', status: 1 },
    { code: 'STD_000002', name: '结核杆菌分子检测', diseaseType: '呼吸系统', clinicalMeaning: '结核病病原学检测标准', description: 'qPCR/NGS', status: 1 }
  ])

  /** 弹框显隐与表单实例 */
  const [open, setOpen] = useState<boolean>(false)
  const [form] = Form.useForm<StandardItemFormValues>()

  /**
   * 类型定义：标准检验项目
   * 字段含义：
   * - code：标准检验项目编码（varchar(50)，系统自动生成，租户内唯一）
   * - name：标准检验项目名称（varchar(100)，名称租户内唯一）
   * - diseaseType：疾病类型（varchar(50)，非必填，分类项预留）
   * - clinicalMeaning：临床意义（varchar(500)，非必填，字段预留）
   * - description：描述（varchar(500)，非必填）
   * - status：状态（tinyint(2)，是否启用：0-否，1-是，默认1）
   */
  interface StandardItem {
    /** 标准检验项目编码，系统自动生成，租户内唯一 */
    code: string
    /** 标准检验项目名称，名称租户内唯一 */
    name: string
    /** 疾病类型，分类项预留 */
    diseaseType?: string
    /** 临床意义，分类项预留 */
    clinicalMeaning?: string
    /** 描述 */
    description?: string
    /** 是否启用：0否，1是，默认1 */
    status: 0 | 1
  }

  /** 新增表单值类型（不含自动编码） */
  interface StandardItemFormValues {
    /** 标准检验项目名称 */
    name: string
    /** 疾病类型 */
    diseaseType?: string
    /** 临床意义 */
    clinicalMeaning?: string
    /** 描述 */
    description?: string
    /** 是否启用（表单布尔），提交时转换为 0/1 */
    status: boolean
  }

  /**
   * 方法：打开新增弹框
   * 入参：无
   * 出参：void（重置并打开弹框）
   */
  const handleOpenCreate = (): void => {
    form.resetFields()
    // 状态字段为布尔值，匹配 Switch 的 checked
    form.setFieldsValue({ status: true })
    setOpen(true)
  }

  /**
   * 方法：生成标准检验项目编码
   * 入参：无
   * 出参：string（形如 STD_000123）
   */
  const generateCode = (): string => {
    const max = items.reduce((acc, it) => {
      const m = String(it.code).match(/STD_(\d{6})/)
      const n = m ? Number(m[1]) : 0
      return Math.max(acc, n)
    }, 0)
    const next = String(max + 1).padStart(6, '0')
    return `STD_${next}`
  }

  /**
   * 方法：提交新增表单
   * 入参：values 表单值（StandardItemFormValues）
   * 出参：Promise<void>（提交并更新列表）
   */
  const handleSubmitCreate = async (values: StandardItemFormValues): Promise<void> => {
    try {
      const code = generateCode()
      // 名称唯一性校验（演示环境基于当前列表）
      if (items.some(it => it.name.trim() === values.name.trim())) {
        message.error('名称已存在，请更换名称')
        return
      }
      const record: StandardItem = {
        code,
        name: values.name.trim(),
        diseaseType: values.diseaseType?.trim(),
        clinicalMeaning: values.clinicalMeaning?.trim(),
        description: values.description?.trim(),
        status: values.status ? 1 : 0
      }
      setItems(prev => [record, ...prev])
      setOpen(false)
      message.success('新增标准检验项目成功')
    } catch (e) {
      message.error('提交失败，请稍后重试')
    }
  }

  /** 表格列配置（按截图字段） */
  const columns = useMemo(() => [
    { title: '标准检验项目编码', dataIndex: 'code', key: 'code', width: 180 },
    { title: '标准检验项目名称', dataIndex: 'name', key: 'name', width: 220 },
    { title: '疾病类型', dataIndex: 'diseaseType', key: 'diseaseType', width: 160 },
    { title: '临床意义', dataIndex: 'clinicalMeaning', key: 'clinicalMeaning', width: 260 },
    { title: '描述', dataIndex: 'description', key: 'description', width: 260 },
    { title: '状态', dataIndex: 'status', key: 'status', width: 100, render: (v: 0 | 1) => v === 1 ? (<Tag color="green">启用</Tag>) : (<Tag color="default">停用</Tag>) }
  ], [])

  return (
    <Space direction="vertical" size={16} style={{ width: '100%' }}>
      <Card
        title="标准检验项目"
        extra={(
          <Space>
            <Button type="primary" onClick={handleOpenCreate}>新增标准检验项目</Button>
          </Space>
        )}
        variant="outlined"
      >
        <Table
          size="small"
          rowKey={(r) => r.code}
          columns={columns as any}
          dataSource={items as any}
          pagination={{ pageSize: 10 }}
          scroll={{ x: 'max-content', y: 420 }}
        />
      </Card>

      <Modal
        title="新增标准检验项目"
        open={open}
        onCancel={() => setOpen(false)}
        onOk={() => { form.validateFields().then(vals => handleSubmitCreate(vals)) }}
        okText="提交"
        cancelText="取消"
      >
        <Form
          form={form}
          layout="vertical"
          initialValues={{ status: true }}
          onFinish={handleSubmitCreate}
        >
          <Form.Item label="标准检验项目名称" name="name" rules={[{ required: true, message: '请输入名称' }]}>
            <Input placeholder="请输入" maxLength={100} />
          </Form.Item>
          <Form.Item label="疾病类型" name="diseaseType">
            <Input placeholder="选填" maxLength={50} />
          </Form.Item>
          <Form.Item label="临床意义" name="clinicalMeaning">
            <Input.TextArea placeholder="选填" maxLength={500} rows={3} />
          </Form.Item>
          <Form.Item label="描述" name="description">
            <Input.TextArea placeholder="选填" maxLength={500} rows={3} />
          </Form.Item>
          <Form.Item label="状态（是否启用）" name="status" valuePropName="checked">
            {/** 入参：checked 是否启用；出参：tinyint(2) 映射 0/1 */}
            <Switch checkedChildren="启用" unCheckedChildren="停用" />
          </Form.Item>
        </Form>
      </Modal>
    </Space>
  )
}

export default InspectionProjectStandardPage