import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  Card,
  Form,
  Input,
  Select,
  Button,
  Space,
  Table,
  Tag,
  Modal,
  message,
  Row,
  Col,
  Descriptions,
  Timeline,
  Tooltip,
  Popconfirm,
  Badge,
  Divider,
  Alert
} from 'antd'
import {
  ArrowLeftOutlined,
  SaveOutlined,
  PlusOutlined,
  EyeOutlined,
  CopyOutlined,
  DeleteOutlined,
  RollbackOutlined,
  BranchesOutlined,
  TagOutlined,
  HistoryOutlined,
  CheckCircleOutlined,
  ExclamationCircleOutlined
} from '@ant-design/icons'
import type { ColumnsType } from 'antd/es/table'

const { Option } = Select
const { TextArea } = Input

/**
 * SOP版本数据接口
 */
interface SOPVersion {
  id: string
  version: string
  templateId: string
  templateName: string
  status: 'draft' | 'review' | 'approved' | 'active' | 'archived' | 'deprecated'
  description: string
  changeLog: string
  createdBy: string
  createdTime: string
  reviewedBy?: string
  reviewedTime?: string
  approvedBy?: string
  approvedTime?: string
  activatedTime?: string
  isCurrentVersion: boolean
  stepCount: number
  fieldCount: number
  qcPointCount: number
}

/**
 * 版本比较数据接口
 */
interface VersionComparison {
  field: string
  oldValue: string
  newValue: string
  changeType: 'added' | 'modified' | 'deleted'
}

/**
 * SOP版本管理组件
 * 提供SOP模板的版本控制和管理功能
 */
const SOPVersionManagement: React.FC = () => {
  const { templateId } = useParams<{ templateId: string }>()
  const navigate = useNavigate()
  
  // 状态管理
  const [loading, setLoading] = useState(false)
  const [versions, setVersions] = useState<SOPVersion[]>([])
  const [templateInfo, setTemplateInfo] = useState<any>(null)
  const [versionModalVisible, setVersionModalVisible] = useState(false)
  const [compareModalVisible, setCompareModalVisible] = useState(false)
  const [selectedVersions, setSelectedVersions] = useState<string[]>([])
  const [comparisonData, setComparisonData] = useState<VersionComparison[]>([])
  const [form] = Form.useForm()

  /**
   * 初始化数据
   */
  useEffect(() => {
    if (templateId) {
      loadVersionData(templateId)
    }
  }, [templateId])

  /**
   * 加载版本数据
   * @param id 模板ID
   */
  const loadVersionData = async (id: string) => {
    setLoading(true)
    try {
      // 模拟数据
      const mockTemplateInfo = {
        id,
        name: '核酸提取SOP模板',
        description: '标准核酸提取操作流程模板',
        currentVersion: 'v2.1.0'
      }
      
      const mockVersions: SOPVersion[] = [
        {
          id: '1',
          version: 'v2.1.0',
          templateId: id,
          templateName: '核酸提取SOP模板',
          status: 'active',
          description: '优化了质量控制点配置，增加了自动化检查功能',
          changeLog: '1. 新增自动浓度检查\n2. 优化纯度检查规则\n3. 增加试剂有效期验证',
          createdBy: '张三',
          createdTime: '2024-01-15 10:30:00',
          reviewedBy: '李四',
          reviewedTime: '2024-01-16 14:20:00',
          approvedBy: '王五',
          approvedTime: '2024-01-17 09:15:00',
          activatedTime: '2024-01-17 10:00:00',
          isCurrentVersion: true,
          stepCount: 8,
          fieldCount: 25,
          qcPointCount: 5
        },
        {
          id: '2',
          version: 'v2.0.1',
          templateId: id,
          templateName: '核酸提取SOP模板',
          status: 'archived',
          description: '修复了字段验证规则的问题',
          changeLog: '1. 修复浓度字段验证规则\n2. 更新帮助文档',
          createdBy: '张三',
          createdTime: '2024-01-10 16:45:00',
          reviewedBy: '李四',
          reviewedTime: '2024-01-11 10:30:00',
          approvedBy: '王五',
          approvedTime: '2024-01-11 15:20:00',
          activatedTime: '2024-01-12 09:00:00',
          isCurrentVersion: false,
          stepCount: 8,
          fieldCount: 23,
          qcPointCount: 4
        },
        {
          id: '3',
          version: 'v2.0.0',
          templateId: id,
          templateName: '核酸提取SOP模板',
          status: 'archived',
          description: '重大版本更新，重构了整个流程结构',
          changeLog: '1. 重构实验步骤\n2. 新增质量控制模块\n3. 优化用户界面',
          createdBy: '赵六',
          createdTime: '2024-01-01 09:00:00',
          reviewedBy: '李四',
          reviewedTime: '2024-01-02 14:30:00',
          approvedBy: '王五',
          approvedTime: '2024-01-03 11:15:00',
          activatedTime: '2024-01-05 08:30:00',
          isCurrentVersion: false,
          stepCount: 7,
          fieldCount: 20,
          qcPointCount: 3
        },
        {
          id: '4',
          version: 'v1.2.0',
          templateId: id,
          templateName: '核酸提取SOP模板',
          status: 'deprecated',
          description: '增加了电泳检查步骤',
          changeLog: '1. 新增电泳检查步骤\n2. 更新操作说明',
          createdBy: '张三',
          createdTime: '2023-12-15 14:20:00',
          reviewedBy: '李四',
          reviewedTime: '2023-12-16 10:45:00',
          approvedBy: '王五',
          approvedTime: '2023-12-17 16:30:00',
          activatedTime: '2023-12-18 09:00:00',
          isCurrentVersion: false,
          stepCount: 6,
          fieldCount: 18,
          qcPointCount: 2
        },
        {
          id: '5',
          version: 'v2.2.0-beta',
          templateId: id,
          templateName: '核酸提取SOP模板',
          status: 'draft',
          description: '测试版本，增加AI辅助质量控制功能',
          changeLog: '1. 集成AI质量控制\n2. 智能异常检测\n3. 自动报告生成',
          createdBy: '张三',
          createdTime: '2024-01-20 11:15:00',
          isCurrentVersion: false,
          stepCount: 9,
          fieldCount: 28,
          qcPointCount: 7
        }
      ]
      
      setTemplateInfo(mockTemplateInfo)
      setVersions(mockVersions)
    } catch (error) {
      message.error('加载版本数据失败')
    } finally {
      setLoading(false)
    }
  }

  /**
   * 返回上一页
   */
  const handleBack = () => {
    navigate(-1)
  }

  /**
   * 创建新版本
   */
  const handleCreateVersion = () => {
    form.resetFields()
    setVersionModalVisible(true)
  }

  /**
   * 查看版本详情
   * @param version 版本数据
   */
  const handleViewVersion = (version: SOPVersion) => {
    navigate(`/detection/sop-template/${version.templateId}?version=${version.version}`)
  }

  /**
   * 复制版本
   * @param version 版本数据
   */
  const handleCopyVersion = (version: SOPVersion) => {
    Modal.confirm({
      title: '复制版本',
      content: `确定要基于版本 ${version.version} 创建新版本吗？`,
      onOk: () => {
        // 这里应该调用复制版本API
        message.success('版本复制成功，请编辑新版本信息')
        setVersionModalVisible(true)
      }
    })
  }

  /**
   * 激活版本
   * @param version 版本数据
   */
  const handleActivateVersion = (version: SOPVersion) => {
    Modal.confirm({
      title: '激活版本',
      content: `确定要激活版本 ${version.version} 吗？当前活跃版本将被归档。`,
      onOk: () => {
        // 更新版本状态
        const newVersions = versions.map(v => ({
          ...v,
          status: v.id === version.id ? 'active' as const : 
                  v.status === 'active' ? 'archived' as const : v.status,
          isCurrentVersion: v.id === version.id,
          activatedTime: v.id === version.id ? new Date().toLocaleString() : v.activatedTime
        }))
        setVersions(newVersions)
        message.success('版本激活成功')
      }
    })
  }

  /**
   * 删除版本
   * @param version 版本数据
   */
  const handleDeleteVersion = (version: SOPVersion) => {
    if (version.isCurrentVersion) {
      message.error('不能删除当前活跃版本')
      return
    }
    
    const newVersions = versions.filter(v => v.id !== version.id)
    setVersions(newVersions)
    message.success('版本删除成功')
  }

  /**
   * 比较版本
   */
  const handleCompareVersions = () => {
    if (selectedVersions.length !== 2) {
      message.warning('请选择两个版本进行比较')
      return
    }
    
    // 模拟版本比较数据
    const mockComparison: VersionComparison[] = [
      {
        field: '步骤数量',
        oldValue: '8',
        newValue: '9',
        changeType: 'modified'
      },
      {
        field: '字段数量',
        oldValue: '25',
        newValue: '28',
        changeType: 'modified'
      },
      {
        field: '质量控制点',
        oldValue: '5',
        newValue: '7',
        changeType: 'modified'
      },
      {
        field: 'AI质量控制',
        oldValue: '',
        newValue: '已启用',
        changeType: 'added'
      },
      {
        field: '智能异常检测',
        oldValue: '',
        newValue: '已启用',
        changeType: 'added'
      }
    ]
    
    setComparisonData(mockComparison)
    setCompareModalVisible(true)
  }

  /**
   * 提交版本表单
   * @param values 表单值
   */
  const handleVersionSubmit = async (values: any) => {
    try {
      const newVersion: SOPVersion = {
        id: Date.now().toString(),
        templateId: templateId!,
        templateName: templateInfo?.name || '',
        isCurrentVersion: false,
        stepCount: 0,
        fieldCount: 0,
        qcPointCount: 0,
        createdBy: '当前用户',
        createdTime: new Date().toLocaleString(),
        ...values
      }
      
      setVersions([newVersion, ...versions])
      setVersionModalVisible(false)
      form.resetFields()
      message.success('版本创建成功')
    } catch (error) {
      message.error('创建失败')
    }
  }

  // 版本状态配置
  const statusConfig = {
    draft: { color: 'default', text: '草稿' },
    review: { color: 'processing', text: '审核中' },
    approved: { color: 'success', text: '已批准' },
    active: { color: 'success', text: '活跃' },
    archived: { color: 'warning', text: '已归档' },
    deprecated: { color: 'error', text: '已废弃' }
  }

  // 版本表格列配置
  const versionColumns: ColumnsType<SOPVersion> = [
    {
      title: '版本号',
      dataIndex: 'version',
      key: 'version',
      width: 120,
      render: (version: string, record: SOPVersion) => (
        <div>
          <div style={{ fontWeight: 500 }}>
            {version}
            {record.isCurrentVersion && (
              <Badge status="success" style={{ marginLeft: 8 }} />
            )}
          </div>
          {record.isCurrentVersion && (
            <Tag size="small" color="green">当前版本</Tag>
          )}
        </div>
      )
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: (status: string) => {
        const config = statusConfig[status as keyof typeof statusConfig]
        return <Tag color={config.color}>{config.text}</Tag>
      }
    },
    {
      title: '描述',
      dataIndex: 'description',
      key: 'description',
      width: 200,
      ellipsis: true
    },
    {
      title: '统计信息',
      key: 'stats',
      width: 150,
      render: (_, record: SOPVersion) => (
        <div style={{ fontSize: '12px' }}>
          <div>步骤: {record.stepCount}</div>
          <div>字段: {record.fieldCount}</div>
          <div>质控点: {record.qcPointCount}</div>
        </div>
      )
    },
    {
      title: '创建信息',
      key: 'createInfo',
      width: 150,
      render: (_, record: SOPVersion) => (
        <div style={{ fontSize: '12px' }}>
          <div>创建人: {record.createdBy}</div>
          <div>创建时间: {record.createdTime.split(' ')[0]}</div>
        </div>
      )
    },
    {
      title: '审批信息',
      key: 'approvalInfo',
      width: 150,
      render: (_, record: SOPVersion) => (
        <div style={{ fontSize: '12px' }}>
          {record.approvedBy && (
            <>
              <div>批准人: {record.approvedBy}</div>
              <div>批准时间: {record.approvedTime?.split(' ')[0]}</div>
            </>
          )}
          {record.activatedTime && (
            <div style={{ color: '#52c41a' }}>
              激活时间: {record.activatedTime.split(' ')[0]}
            </div>
          )}
        </div>
      )
    },
    {
      title: '操作',
      key: 'action',
      width: 200,
      render: (_, record: SOPVersion) => (
        <Space size="small">
          <Tooltip title="查看">
            <Button 
              type="link" 
              size="small" 
              icon={<EyeOutlined />}
              onClick={() => handleViewVersion(record)}
            />
          </Tooltip>
          <Tooltip title="复制">
            <Button 
              type="link" 
              size="small" 
              icon={<CopyOutlined />}
              onClick={() => handleCopyVersion(record)}
            />
          </Tooltip>
          {!record.isCurrentVersion && record.status === 'approved' && (
            <Tooltip title="激活">
              <Button 
                type="link" 
                size="small" 
                icon={<CheckCircleOutlined />}
                onClick={() => handleActivateVersion(record)}
              />
            </Tooltip>
          )}
          {!record.isCurrentVersion && (
            <Popconfirm
              title="确定要删除这个版本吗？"
              onConfirm={() => handleDeleteVersion(record)}
            >
              <Tooltip title="删除">
                <Button 
                  type="link" 
                  size="small" 
                  danger
                  icon={<DeleteOutlined />}
                />
              </Tooltip>
            </Popconfirm>
          )}
        </Space>
      )
    }
  ]

  // 版本比较表格列配置
  const comparisonColumns: ColumnsType<VersionComparison> = [
    {
      title: '字段',
      dataIndex: 'field',
      key: 'field',
      width: 150
    },
    {
      title: '变更类型',
      dataIndex: 'changeType',
      key: 'changeType',
      width: 100,
      render: (type: string) => {
        const colors = { added: 'success', modified: 'warning', deleted: 'error' }
        const texts = { added: '新增', modified: '修改', deleted: '删除' }
        return (
          <Tag color={colors[type as keyof typeof colors]}>
            {texts[type as keyof typeof texts]}
          </Tag>
        )
      }
    },
    {
      title: '旧值',
      dataIndex: 'oldValue',
      key: 'oldValue',
      width: 200,
      render: (value: string) => value || '-'
    },
    {
      title: '新值',
      dataIndex: 'newValue',
      key: 'newValue',
      width: 200,
      render: (value: string) => value || '-'
    }
  ]

  if (loading) {
    return <div style={{ padding: '24px', textAlign: 'center' }}>加载中...</div>
  }

  return (
    <div style={{ padding: '24px' }}>
      {/* 页面标题和操作按钮 */}
      <Row justify="space-between" align="middle" style={{ marginBottom: 24 }}>
        <Col>
          <Space>
            <Button icon={<ArrowLeftOutlined />} onClick={handleBack}>
              返回
            </Button>
            <h2 style={{ margin: 0 }}>
              <BranchesOutlined /> SOP版本管理 - {templateInfo?.name}
            </h2>
          </Space>
        </Col>
        <Col>
          <Space>
            <Button 
              onClick={handleCompareVersions}
              disabled={selectedVersions.length !== 2}
            >
              版本比较
            </Button>
            <Button 
              type="primary" 
              icon={<PlusOutlined />}
              onClick={handleCreateVersion}
            >
              创建版本
            </Button>
          </Space>
        </Col>
      </Row>

      {/* 模板信息 */}
      <Card title="模板信息" style={{ marginBottom: 24 }}>
        <Descriptions column={3}>
          <Descriptions.Item label="模板名称">
            {templateInfo?.name}
          </Descriptions.Item>
          <Descriptions.Item label="当前版本">
            <Tag color="success">{templateInfo?.currentVersion}</Tag>
          </Descriptions.Item>
          <Descriptions.Item label="版本总数">
            {versions.length}
          </Descriptions.Item>
          <Descriptions.Item label="模板描述" span={3}>
            {templateInfo?.description}
          </Descriptions.Item>
        </Descriptions>
      </Card>

      {/* 版本列表 */}
      <Card 
        title={
          <Space>
            <HistoryOutlined />
            版本历史
          </Space>
        }
      >
        <Alert
          message="版本管理说明"
          description="版本管理遵循语义化版本控制规范。主版本号.次版本号.修订号，如 v2.1.0。只有已批准的版本才能激活使用。"
          type="info"
          showIcon
          style={{ marginBottom: 16 }}
        />
        
        <Table
          columns={versionColumns}
          dataSource={versions}
          rowKey="id"
          rowSelection={{
            selectedRowKeys: selectedVersions,
            onChange: (keys) => setSelectedVersions(keys as string[]),
            getCheckboxProps: (record) => ({
              disabled: record.status === 'draft'
            })
          }}
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total) => `共 ${total} 个版本`
          }}
          scroll={{ x: 1200 }}
        />
      </Card>

      {/* 创建版本弹窗 */}
      <Modal
        title="创建新版本"
        open={versionModalVisible}
        onCancel={() => {
          setVersionModalVisible(false)
          form.resetFields()
        }}
        onOk={() => form.submit()}
        width={600}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleVersionSubmit}
        >
          <Form.Item
            name="version"
            label="版本号"
            rules={[
              { required: true, message: '请输入版本号' },
              { pattern: /^v\d+\.\d+\.\d+(-\w+)?$/, message: '版本号格式不正确，如：v2.1.0 或 v2.1.0-beta' }
            ]}
          >
            <Input placeholder="如：v2.1.0 或 v2.1.0-beta" />
          </Form.Item>
          <Form.Item
            name="status"
            label="初始状态"
            rules={[{ required: true, message: '请选择初始状态' }]}
            initialValue="draft"
          >
            <Select>
              <Option value="draft">草稿</Option>
              <Option value="review">提交审核</Option>
            </Select>
          </Form.Item>
          <Form.Item
            name="description"
            label="版本描述"
            rules={[{ required: true, message: '请输入版本描述' }]}
          >
            <Input placeholder="请简要描述此版本的主要变更" />
          </Form.Item>
          <Form.Item
            name="changeLog"
            label="变更日志"
            rules={[{ required: true, message: '请输入变更日志' }]}
          >
            <TextArea 
              rows={4} 
              placeholder="请详细描述此版本的变更内容，每行一个变更点"
            />
          </Form.Item>
        </Form>
      </Modal>

      {/* 版本比较弹窗 */}
      <Modal
        title="版本比较"
        open={compareModalVisible}
        onCancel={() => setCompareModalVisible(false)}
        footer={[
          <Button key="close" onClick={() => setCompareModalVisible(false)}>
            关闭
          </Button>
        ]}
        width={800}
      >
        <div style={{ marginBottom: 16 }}>
          <Alert
            message={`正在比较版本: ${selectedVersions.join(' vs ')}`}
            type="info"
            showIcon
          />
        </div>
        <Table
          columns={comparisonColumns}
          dataSource={comparisonData}
          rowKey="field"
          pagination={false}
          size="small"
        />
      </Modal>
    </div>
  )
}

export default SOPVersionManagement