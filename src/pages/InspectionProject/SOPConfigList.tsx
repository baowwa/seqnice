import React, { useMemo, useState } from 'react'
import { Card, Table, Space, Button, Tag, Popconfirm, message } from 'antd'
import { PlusOutlined } from '@ant-design/icons'
import { useNavigate } from 'react-router-dom'

/**
 * 组件：SOP配置列表页
 * 功能：展示SOP配置清单，并提供跳转到新增SOP页面的入口
 * 入参：无
 * 出参：React.FC 组件渲染结果
 */
const SOPConfigList: React.FC = () => {
  const navigate = useNavigate()
  /**
   * 类型：审核状态
   */
  type ReviewStatus = '待审核' | '已通过' | '已驳回'

  /**
   * 类型：SOP 列表行
   */
  interface SopRow {
    id: string
    sopCode: string
    sopName: string
    projectCode: string
    projectName: string
    methodology: string
    templateName: string
    enabled: boolean
    reviewStatus: ReviewStatus
  }

  const [data, setData] = useState<SopRow[]>(() => loadMockData())

  /**
   * 方法：加载模拟数据
   * 入参：无
   * 出参：返回SOP配置数据数组
   */
  /**
   * 方法：加载模拟数据
   * 入参：无
   * 出参：返回SOP配置数据数组
   */
  function loadMockData(): SopRow[] {
    return [
      {
        id: '1',
        sopCode: 'SOP-001',
        sopName: '肿瘤Panel标准流程',
        projectCode: 'IPJ-000001',
        projectName: '肿瘤相关基因检测',
        methodology: '高通量测序',
        templateName: '肿瘤Panel流程模板',
        enabled: true,
        reviewStatus: '已通过',
      },
      {
        id: '2',
        sopCode: 'SOP-002',
        sopName: '病原宏基因组流程',
        projectCode: 'IPJ-000002',
        projectName: '病原宏基因组检测',
        methodology: '宏基因组测序',
        templateName: '病原流程模板',
        enabled: false,
        reviewStatus: '待审核',
      },
    ]
  }

  /**
   * 方法：跳转到新增SOP页面
   * 入参：无
   * 出参：无
   */
  function goCreate() {
    navigate('/inspection-project/sop/create')
  }

  /**
   * 方法：编辑SOP配置
   * 入参：record 当前行记录
   * 出参：无（跳转到编辑页面，暂用新增页承载）
   */
  function handleEdit(record: SopRow) {
    navigate(`/inspection-project/sop/create?sopId=${record.id}`)
  }

  /**
   * 方法：启用/停用切换
   * 入参：id 记录主键
   * 出参：无（更新本地状态）
   */
  function toggleEnabled(id: string) {
    setData(prev => prev.map(item => item.id === id ? { ...item, enabled: !item.enabled } : item))
    message.success('状态已更新')
  }

  /**
   * 方法：删除记录
   * 入参：id 记录主键
   * 出参：无（更新本地状态）
   */
  function handleDelete(id: string) {
    setData(prev => prev.filter(item => item.id !== id))
    message.success('删除成功')
  }

  const columns = useMemo(() => [
    { title: 'sop编码', dataIndex: 'sopCode', key: 'sopCode', width: 140 },
    { title: 'sop名称', dataIndex: 'sopName', key: 'sopName', width: 200 },
    { title: '检验项目编码', dataIndex: 'projectCode', key: 'projectCode', width: 160 },
    { title: '检验项目名称', dataIndex: 'projectName', key: 'projectName', width: 220 },
    { title: '方法学', dataIndex: 'methodology', key: 'methodology', width: 160 },
    { title: '流程模板', dataIndex: 'templateName', key: 'templateName', width: 220 },
    { title: '审核状态', dataIndex: 'reviewStatus', key: 'reviewStatus', width: 120, render: (v: ReviewStatus) => {
      const color = v === '已通过' ? 'success' : v === '已驳回' ? 'error' : 'processing'
      return <Tag color={color}>{v}</Tag>
    } },
    { title: '状态', dataIndex: 'enabled', key: 'enabled', width: 120, render: (v: boolean) => (
      <Tag color={v ? 'success' : 'default'}>{v ? '启用' : '停用'}</Tag>
    ) },
    { title: '操作', key: 'action', fixed: 'right' as const, width: 220, render: (_: any, record: any) => (
      <Space>
        <Button type="link" onClick={() => handleEdit(record)}>编辑</Button>
        <Button type="link" onClick={() => toggleEnabled(record.id)}>{record.enabled ? '停用' : '启用'}</Button>
        <Popconfirm title="确定删除该SOP配置？" onConfirm={() => handleDelete(record.id)}>
          <Button type="link" danger>删除</Button>
        </Popconfirm>
      </Space>
    ) },
  ], [])

  return (
    <Card
      title="SOP配置"
      extra={<Space><Button type="primary" icon={<PlusOutlined />} onClick={goCreate}>新增</Button></Space>}
      style={{ height: '100%', display: 'flex', flexDirection: 'column' }}
      styles={{ header: { padding: 16 }, body: { padding: 0, height: '100%', display: 'flex', flexDirection: 'column' } }}
    >
      <div style={{ padding: 16 }}>
        <Table
          rowKey="id"
          size="small"
          columns={columns as any}
          dataSource={data}
          pagination={{ pageSize: 10 }}
          scroll={{ x: 1400 }}
        />
      </div>
    </Card>
  )
}

export default SOPConfigList