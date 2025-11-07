import React, { useState } from 'react'
import { 
  Form, 
  Input, 
  Select, 
  Button, 
  Card, 
  Row, 
  Col, 
  Table, 
  Upload, 
  InputNumber,
  DatePicker,
  Space,
  Tag,
  Divider,
  message,
  Tabs,
  ConfigProvider
} from 'antd'
import { 
  PlusOutlined, 
  UploadOutlined, 
  DeleteOutlined,
  CopyOutlined,
  SettingOutlined
} from '@ant-design/icons'
import { useNavigate, useSearchParams } from 'react-router-dom'
import './ProjectArchiveCreate.css'

const { Option } = Select
const { TextArea } = Input

/**
 * 项目档案新增页面组件
 * 实现上下布局：上面是基本信息，下面是tab导航
 * 包含基础信息、样本策略、检测要求、验证标准、参与机构、项目附件5个模块
 */
/**
 * 项目档案新增页面组件
 * 同时支持“查看模式”，当通过查询参数传入 id 且 mode=view 时，表单仅展示不允许编辑。
 */
const ProjectArchiveCreate: React.FC = () => {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const [form] = Form.useForm()
  const [activeTab, setActiveTab] = useState('samples')
  const [loading, setLoading] = useState(false)
  const id = searchParams.get('id')
  const mode = searchParams.get('mode')
  const isViewMode = !!id && mode === 'view'
  const isEditMode = !!id && mode === 'edit'

  /**
   * 按ID加载项目档案数据（模拟）
   * 入参：projectId 项目ID
   * 出参：返回项目对象或null
   */
  const loadProjectById = async (projectId: string): Promise<any | null> => {
    // 这里模拟获取，与列表页数据结构保持一致的关键字段
    const mockList = [
      {
        id: '1',
        projectCode: 'PRJ001',
        projectName: '基因检测项目A',
        projectType: 'research', // 与本页Select的取值保持一致
        projectManager: 'user1'
      },
      {
        id: '2',
        projectCode: 'PRJ002',
        projectName: '肿瘤标志物检测',
        projectType: 'registration',
        projectManager: 'user2'
      }
    ]
    const found = mockList.find(p => p.id === projectId)
    return found || null
  }

  /**
   * 初始化：查看模式时加载数据并回填表单
   * 入参：无
   * 出参：无
   */
  React.useEffect(() => {
    const init = async () => {
      if (id) {
        const data = await loadProjectById(id)
        if (data) {
          form.setFieldsValue({
            projectCode: data.projectCode,
            projectName: data.projectName,
            projectType: data.projectType,
            projectManager: data.projectManager
          })
        }
      }
    }
    init()
  }, [isViewMode, isEditMode, id, form])

  /**
   * 处理表单提交
   * @param values - 表单数据
   */
  const handleSubmit = async (values: any) => {
    setLoading(true)
    try {
      // 模拟API调用
      await new Promise(resolve => setTimeout(resolve, 1000))
      message.success('项目档案创建成功！')
      navigate('/project-archive')
    } catch (error) {
      message.error('创建失败，请重试')
    } finally {
      setLoading(false)
    }
  }

  /**
   * 渲染基础信息表单
   */
  const renderBasicInfo = () => (
    <>
      <Row gutter={24}>
        <Col span={12}>
          <Form.Item name="projectCode" label="项目编码">
            <Input disabled />
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item 
            name="projectName" 
            label="项目名称" 
            rules={[{ required: true, message: '请输入项目名称' }]}
          >
            <Input placeholder="输入项目名称" />
          </Form.Item>
        </Col>
      </Row>
      
      <Row gutter={24}>
        <Col span={12}>
          <Form.Item 
            name="projectType" 
            label="项目类型" 
            rules={[{ required: true, message: '请选择项目类型' }]}
          >
            <Select placeholder="请选择项目类型">
              <Option value="research">研发验证项目</Option>
              <Option value="registration">产品注册项目</Option>
              <Option value="commission">科研委托项目</Option>
            </Select>
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item 
            name="projectManager" 
            label="项目负责人" 
            rules={[{ required: true, message: '请选择项目负责人' }]}
            >
              <Select placeholder="选择负责人">
                <Option value="user1">张三</Option>
                <Option value="user2">李四</Option>
                <Option value="user3">王五</Option>
              </Select>
            </Form.Item>
          </Col>
        </Row>
        
        <Row gutter={24}>
          <Col span={12}>
            <Form.Item name="startDate" label="计划开始时间">
              <DatePicker style={{ width: '100%' }} />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item name="endDate" label="计划结束时间">
              <DatePicker style={{ width: '100%' }} />
            </Form.Item>
          </Col>
        </Row>
        
        <Form.Item name="description" label="项目描述">
          <TextArea rows={4} placeholder="请输入项目描述" />
        </Form.Item>
      </>
    )

  /**
   * 渲染样本策略表单
   */
  const renderSampleStrategy = () => (
    <>
      <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'flex-end' }}>
        <Space>
          <Button type="link">📊 样本进度</Button>
          <Button type="primary" icon={<PlusOutlined />}>
            导入样本
          </Button>
        </Space>
      </div>
      
      <Row gutter={24}>
        <Col span={8}>
          <Card title="🔬 主要样本类型" size="small">
            <Select style={{ width: '100%' }} placeholder="选择样本类型">
              <Option value="blood">全血</Option>
              <Option value="tissue">组织标本</Option>
              <Option value="cell">细胞系</Option>
            </Select>
          </Card>
        </Col>
        <Col span={8}>
          <Card title="📍 样本来源" size="small">
            <Input placeholder="描述样本来源" />
          </Card>
        </Col>
        <Col span={8}>
          <Card title="📦 计划样本量" size="small">
            <Space.Compact style={{ width: '100%' }}>
              <InputNumber style={{ width: '70%' }} placeholder="100" />
              <Input style={{ width: '30%' }} value="例" disabled />
            </Space.Compact>
          </Card>
        </Col>
      </Row>
    </>
  )

  /**
   * 渲染检测要求表单
   */
  const renderDetectionRequirements = () => (
    <>
      <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'flex-end' }}>
        <Space>
          <Button type="link">从模板导入</Button>
          <Button type="primary" icon={<PlusOutlined />}>
            添加检测项
          </Button>
        </Space>
      </div>
      
      <div className="detection-list">
        <Card className="detection-item">
          <div className="item-content">
            <div className="item-main">
              <h4>NGS 600基因Panel</h4>
              <div className="item-meta">
                <Tag>方法学: NGS</Tag>
                <Tag>平台: Illumina NovaSeq</Tag>
                <Tag>分析项目: 12项</Tag>
              </div>
            </div>
            <div className="item-actions">
              <Button size="small" icon={<SettingOutlined />}>配置</Button>
              <Button size="small" icon={<CopyOutlined />}>复制</Button>
              <Button size="small" danger icon={<DeleteOutlined />}>删除</Button>
            </div>
          </div>
        </Card>
        
        <Card className="detection-item">
          <div className="item-content">
            <div className="item-main">
              <h4>PD-L1免疫组化检测</h4>
              <div className="item-meta">
                <Tag>方法学: 免疫组化</Tag>
                <Tag>平台: Autostainer</Tag>
                <Tag>分析项目: PD-L1 TPS</Tag>
              </div>
            </div>
            <div className="item-actions">
              <Button size="small" icon={<SettingOutlined />}>配置</Button>
              <Button size="small" icon={<CopyOutlined />}>复制</Button>
              <Button size="small" danger icon={<DeleteOutlined />}>删除</Button>
            </div>
          </div>
        </Card>
      </div>
    </>
  )

  /**
   * 渲染验证标准表单
   */
  const renderValidationStandards = () => {
    const columns = [
      {
        title: '评价指标',
        dataIndex: 'indicator',
        width: 200,
        render: () => <Input placeholder="输入指标名称" />
      },
      {
        title: '比较关系',
        dataIndex: 'comparison',
        width: 100,
        render: () => (
          <Select defaultValue=">=">
            <Option value=">=">&gt;=</Option>
            <Option value="<=">&lt;=</Option>
            <Option value="=">=</Option>
          </Select>
        )
      },
      {
        title: '指标阈值',
        dataIndex: 'threshold',
        width: 120,
        render: () => <InputNumber step={0.01} placeholder="95.00" />
      },
      {
        title: '单位',
        dataIndex: 'unit',
        width: 80,
        render: () => <Input placeholder="%" />
      },
      {
        title: '验证方法',
        dataIndex: 'method',
        render: () => <Input placeholder="参考品检测" />
      },
      {
        title: '操作',
        width: 100,
        render: () => (
          <Button size="small" danger icon={<DeleteOutlined />}>
            删除
          </Button>
        )
      }
    ]

    const dataSource = [
      { key: '1' },
      { key: '2' }
    ]

    return (
      <>
        <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'flex-end' }}>
          <Space>
            <Button type="link">从SOP导入</Button>
            <Button type="primary" icon={<PlusOutlined />}>
              添加指标
            </Button>
          </Space>
        </div>
        
        <Table 
          columns={columns} 
          dataSource={dataSource}
          pagination={false}
          size="small"
        />
      </>
    )
  }

  /**
   * 渲染参与机构表单
   */
  const renderOrganizations = () => (
    <>
      <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'flex-end' }}>
        <Button type="primary" icon={<PlusOutlined />}>
          添加机构
        </Button>
      </div>
      
      <Row gutter={24}>
        <Col span={12}>
          <Form.Item label="主办机构">
            <Select placeholder="选择主办机构">
              <Option value="org1">北京基因科技有限公司</Option>
              <Option value="org2">上海生物医学研究院</Option>
            </Select>
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item label="协作机构">
            <Select mode="multiple" placeholder="选择协作机构">
              <Option value="org3">清华大学医学院</Option>
              <Option value="org4">北京协和医院</Option>
            </Select>
          </Form.Item>
        </Col>
      </Row>
    </>
  )

  /**
   * 渲染文件资料表单
   */
  const renderDocuments = () => (
    <>
      <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'flex-end' }}>
        <Button type="primary" icon={<UploadOutlined />}>
          上传文件
        </Button>
      </div>
      
      <Upload.Dragger
        name="files"
        multiple
        action="/api/upload"
        onChange={(info) => {
          const { status } = info.file
          if (status === 'done') {
            message.success(`${info.file.name} 文件上传成功`)
          } else if (status === 'error') {
            message.error(`${info.file.name} 文件上传失败`)
          }
        }}
      >
        <p className="ant-upload-drag-icon">
          <UploadOutlined />
        </p>
        <p className="ant-upload-text">点击或拖拽文件到此区域上传</p>
        <p className="ant-upload-hint">
          支持单个或批量上传。严禁上传公司数据或其他敏感文件。
        </p>
      </Upload.Dragger>
    </>
  )

  return (
    <div className="project-archive-create">
      <Form form={form} layout="vertical" onFinish={handleSubmit}>
        {/* 基本信息区域 */}
        <Card 
          title="基本信息" 
          className="basic-info-card"
          extra={
            <Space>
              <Button onClick={() => navigate('/project-archive')}>
                返回列表
              </Button>
              {!isViewMode && (
                <Button 
                  type="primary" 
                  loading={loading}
                  onClick={() => form.submit()}
                >
                  保存项目档案
                </Button>
              )}
            </Space>
          }
        >
          {/* 查看模式下禁用表单控件，但不影响头部按钮点击 */}
          <ConfigProvider componentDisabled={isViewMode}>
            {renderBasicInfo()}
          </ConfigProvider>
        </Card>

        {/* 已移除底部子Tab及其内容，页面仅保留基本信息 */}
      </Form>
    </div>
  )
}

export default ProjectArchiveCreate