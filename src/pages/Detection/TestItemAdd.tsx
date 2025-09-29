import React, { useState, useEffect } from 'react'
import {
  Card,
  Form,
  Input,
  Select,
  InputNumber,
  Switch,
  message,
  Typography,
  Tag,
  Upload,
  Button,
  Space,
  Divider,
  Row,
  Col
} from 'antd'
import { 
  PlusOutlined, 
  UploadOutlined,
  SaveOutlined,
  ArrowLeftOutlined,
  DeleteOutlined
} from '@ant-design/icons'
import { useNavigate } from 'react-router-dom'

const { Title } = Typography
const { Option } = Select
const { TextArea } = Input

/**
 * 检测项目接口定义
 */
interface TestItem {
  id: string
  name: string
  englishName: string // 英文名称
  code: string
  category: string
  description: string
  price: number
  duration: number // 报告周期（工作日）
  sampleTypes: string[]
  methodology: string
  primaryMethodology: string // 主要方法学
  backupMethodologies: string[] // 备用方法学
  department: string // 所属科室
  responsible: string // 负责人
  isActive: boolean
  status: 'active' | 'inactive' | 'pending' // 项目状态
  clinicalApplication: string // 临床应用
  reportTemplate: string // 报告模板
  associatedAnalysisItems: AnalysisItemAssociation[] // 关联分析项目
  sopDocuments: SOPDocument[] // SOP文档
  sopConfiguration: SOPConfiguration // SOP配置
  qualityRequirements: string // 质量要求
  createdAt: string
  updatedAt: string
}

/**
 * 分析项目关联接口定义
 */
interface AnalysisItemAssociation {
  id: string
  name: string
  code: string
  reportOrder: number // 报告顺序
  isRequired: boolean // 是否必需
  isActive: boolean // 是否启用
}

/**
 * SOP配置接口定义
 */
interface SOPConfiguration {
  mode: 'document' | 'structured' // 配置模式：文档模式或结构化模式
  executionMode: 'strict' | 'guided' | 'reference' // 执行模式：严格、引导、参考
  structuredSteps?: SOPStep[] // 结构化步骤
  templateId?: string // 标准模板ID
}

/**
 * SOP步骤接口定义
 */
interface SOPStep {
  id: string
  name: string
  description: string
  duration: number // 预计时间（分钟）
  order: number
  isRequired: boolean
  materials?: string[] // 所需材料
  equipment?: string[] // 所需设备
  qualityControls?: string[] // 质量控制点
}

/**
 * SOP文档接口定义
 */
interface SOPDocument {
  id: string
  name: string
  version: string
  type: 'procedure' | 'quality' | 'safety' | 'maintenance'
  uploadDate: string
  fileUrl: string
  approver: string
  status: 'draft' | 'approved' | 'expired'
}

/**
 * 分析项目接口定义
 */
interface AnalysisItem {
  id: string
  name: string
  code: string
  category: string
}

/**
 * 新增检测项目页面组件
 * 用于在新标签页中打开的独立页面
 */
const TestItemAdd: React.FC = () => {
  const navigate = useNavigate()
  const [form] = Form.useForm()
  const [loading, setLoading] = useState(false)
  const [selectedAnalysisItems, setSelectedAnalysisItems] = useState<AnalysisItemAssociation[]>([])

  // 模拟数据
  const analysisItems: AnalysisItem[] = [
    { id: '1', name: 'BRCA1基因检测', code: 'BRCA1', category: '遗传学检测' },
    { id: '2', name: 'BRCA2基因检测', code: 'BRCA2', category: '遗传学检测' },
    { id: '3', name: 'TP53基因检测', code: 'TP53', category: '肿瘤标志物' },
    { id: '4', name: 'EGFR基因检测', code: 'EGFR', category: '肿瘤标志物' },
    { id: '5', name: 'KRAS基因检测', code: 'KRAS', category: '肿瘤标志物' }
  ]

  /**
   * 处理表单提交
   * @param values 表单数据
   */
  const handleSubmit = async (values: any) => {
    try {
      setLoading(true)
      
      // 构建完整的检测项目数据
      const testItemData: Partial<TestItem> = {
        ...values,
        associatedAnalysisItems: selectedAnalysisItems,
        sopConfiguration: {
          mode: values.mode || 'document',
          executionMode: values.executionMode || 'reference',
          templateId: values.templateId
        },
        sopDocuments: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }

      // 模拟API调用
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      message.success('检测项目创建成功！')
      
      // 返回到检测项目列表页面
      navigate('/detection/test-item')
    } catch (error) {
      message.error('创建失败，请重试')
    } finally {
      setLoading(false)
    }
  }

  /**
   * 添加关联分析项目
   */
  const handleAddAnalysisItem = () => {
    const newItem: AnalysisItemAssociation = {
      id: '',
      name: '',
      code: '',
      reportOrder: selectedAnalysisItems.length + 1,
      isRequired: false,
      isActive: true
    }
    setSelectedAnalysisItems([...selectedAnalysisItems, newItem])
  }

  /**
   * 更新关联分析项目
   * @param index 项目索引
   * @param field 字段名
   * @param value 字段值
   */
  const handleUpdateAnalysisItem = (index: number, field: string, value: any) => {
    const updatedItems = [...selectedAnalysisItems]
    if (field === 'analysisItemId') {
      const selectedItem = analysisItems.find(item => item.id === value)
      if (selectedItem) {
        updatedItems[index] = {
          ...updatedItems[index],
          id: selectedItem.id,
          name: selectedItem.name,
          code: selectedItem.code
        }
      }
    } else {
      updatedItems[index] = {
        ...updatedItems[index],
        [field]: value
      }
    }
    setSelectedAnalysisItems(updatedItems)
  }

  /**
   * 删除关联分析项目
   * @param index 项目索引
   */
  const handleRemoveAnalysisItem = (index: number) => {
    const updatedItems = selectedAnalysisItems.filter((_, i) => i !== index)
    setSelectedAnalysisItems(updatedItems)
  }

  return (
    <div style={{ padding: '24px', minHeight: '100vh', backgroundColor: '#f5f5f5' }}>
      <Card>
        <div style={{ marginBottom: 24 }}>
          <Space>
            <Button 
              icon={<ArrowLeftOutlined />} 
              onClick={() => navigate('/detection/test-item')}
            >
              返回列表
            </Button>
            <Title level={3} style={{ margin: 0 }}>
              新增检测项目
            </Title>
          </Space>
        </div>

        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          initialValues={{
            isActive: true,
            status: 'active',
            duration: 5,
            price: 0,
            mode: 'document',
            executionMode: 'reference'
          }}
        >
          <Card title="基本信息" style={{ marginBottom: 16 }}>
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  label="项目名称"
                  name="name"
                  rules={[{ required: true, message: '请输入项目名称' }]}
                >
                  <Input placeholder="请输入项目名称" />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  label="英文名称"
                  name="englishName"
                >
                  <Input placeholder="请输入英文名称" />
                </Form.Item>
              </Col>
            </Row>

            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  label="项目编码"
                  name="code"
                  rules={[{ required: true, message: '请输入项目编码' }]}
                >
                  <Input placeholder="请输入项目编码" />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  label="项目分类"
                  name="category"
                  rules={[{ required: true, message: '请选择项目分类' }]}
                >
                  <Select placeholder="请选择项目分类">
                    <Option value="遗传学检测">遗传学检测</Option>
                    <Option value="肿瘤标志物">肿瘤标志物</Option>
                    <Option value="病原体检测">病原体检测</Option>
                    <Option value="药物基因组学">药物基因组学</Option>
                  </Select>
                </Form.Item>
              </Col>
            </Row>

            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  label="所属科室"
                  name="department"
                >
                  <Select placeholder="请选择所属科室">
                    <Option value="分子诊断科">分子诊断科</Option>
                    <Option value="病理科">病理科</Option>
                    <Option value="检验科">检验科</Option>
                    <Option value="肿瘤科">肿瘤科</Option>
                  </Select>
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  label="负责人"
                  name="responsible"
                >
                  <Input placeholder="请输入负责人" />
                </Form.Item>
              </Col>
            </Row>

            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  label="项目价格"
                  name="price"
                  rules={[{ required: true, message: '请输入项目价格' }]}
                >
                  <InputNumber
                    style={{ width: '100%' }}
                    placeholder="请输入项目价格"
                    min={0}
                    precision={2}
                    addonAfter="元"
                  />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  label="报告周期(工作日)"
                  name="duration"
                  rules={[{ required: true, message: '请输入报告周期' }]}
                >
                  <InputNumber
                    style={{ width: '100%' }}
                    placeholder="请输入报告周期"
                    min={1}
                    addonAfter="天"
                  />
                </Form.Item>
              </Col>
            </Row>

            <Form.Item
              label="项目描述"
              name="description"
            >
              <TextArea rows={3} placeholder="请输入项目描述" />
            </Form.Item>
          </Card>

          <Card title="技术信息" style={{ marginBottom: 16 }}>
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  label="主方法学"
                  name="primaryMethodology"
                  rules={[{ required: true, message: '请选择主方法学' }]}
                >
                  <Select placeholder="请选择主方法学">
                    <Option value="PCR">PCR</Option>
                    <Option value="qPCR">qPCR</Option>
                    <Option value="NGS">NGS</Option>
                    <Option value="Sanger测序">Sanger测序</Option>
                    <Option value="FISH">FISH</Option>
                    <Option value="免疫组化">免疫组化</Option>
                  </Select>
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  label="备用方法学"
                  name="backupMethodologies"
                >
                  <Select mode="multiple" placeholder="请选择备用方法学">
                    <Option value="PCR">PCR</Option>
                    <Option value="qPCR">qPCR</Option>
                    <Option value="NGS">NGS</Option>
                    <Option value="Sanger测序">Sanger测序</Option>
                    <Option value="FISH">FISH</Option>
                    <Option value="免疫组化">免疫组化</Option>
                  </Select>
                </Form.Item>
              </Col>
            </Row>

            <Form.Item
              label="样本类型"
              name="sampleTypes"
              rules={[{ required: true, message: '请选择样本类型' }]}
            >
              <Select mode="multiple" placeholder="请选择样本类型">
                <Option value="全血">全血</Option>
                <Option value="血浆">血浆</Option>
                <Option value="血清">血清</Option>
                <Option value="唾液">唾液</Option>
                <Option value="组织">组织</Option>
                <Option value="石蜡切片">石蜡切片</Option>
                <Option value="尿液">尿液</Option>
              </Select>
            </Form.Item>
          </Card>

          <Card title="临床信息" style={{ marginBottom: 16 }}>
            <Form.Item
              label="临床应用"
              name="clinicalApplication"
            >
              <TextArea rows={3} placeholder="请输入临床应用描述" />
            </Form.Item>

            <Form.Item
              label="质量要求"
              name="qualityRequirements"
            >
              <TextArea rows={3} placeholder="请输入质量要求" />
            </Form.Item>

            <Form.Item
              label="报告模板"
              name="reportTemplate"
            >
              <Select placeholder="请选择报告模板">
                <Option value="标准模板">标准模板</Option>
                <Option value="简化模板">简化模板</Option>
                <Option value="详细模板">详细模板</Option>
                <Option value="自定义模板">自定义模板</Option>
              </Select>
            </Form.Item>
          </Card>

          <Card title="SOP配置" style={{ marginBottom: 16 }}>
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  label="配置模式"
                  name="mode"
                  rules={[{ required: true, message: '请选择配置模式' }]}
                >
                  <Select placeholder="请选择配置模式">
                    <Option value="document">文档模式</Option>
                    <Option value="structured">结构化模式</Option>
                  </Select>
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  label="执行模式"
                  name="executionMode"
                  rules={[{ required: true, message: '请选择执行模式' }]}
                >
                  <Select placeholder="请选择执行模式">
                    <Option value="strict">严格模式</Option>
                    <Option value="guided">引导模式</Option>
                    <Option value="reference">参考模式</Option>
                  </Select>
                </Form.Item>
              </Col>
            </Row>

            <Form.Item
              label="SOP文档"
              name="sopDocuments"
            >
              <Upload
                multiple
                beforeUpload={() => false}
                showUploadList={{ showRemoveIcon: true }}
              >
                <Button icon={<UploadOutlined />}>上传SOP文档</Button>
              </Upload>
            </Form.Item>

            <Form.Item
              label="标准模板"
              name="templateId"
            >
              <Select placeholder="请选择标准模板">
                <Option value="template1">PCR标准模板</Option>
                <Option value="template2">NGS标准模板</Option>
                <Option value="template3">免疫组化标准模板</Option>
                <Option value="template4">FISH标准模板</Option>
              </Select>
            </Form.Item>
          </Card>

          <Card title="关联分析项目" style={{ marginBottom: 16 }}>
            <div style={{ marginBottom: 16 }}>
              <Button
                type="dashed"
                icon={<PlusOutlined />}
                onClick={handleAddAnalysisItem}
                block
              >
                添加关联分析项目
              </Button>
            </div>

            {selectedAnalysisItems.map((item, index) => (
              <Card
                key={index}
                size="small"
                style={{ marginBottom: 8 }}
                extra={
                  <Button
                    type="text"
                    danger
                    icon={<DeleteOutlined />}
                    onClick={() => handleRemoveAnalysisItem(index)}
                  />
                }
              >
                <Row gutter={16}>
                  <Col span={8}>
                    <Form.Item label="分析项目" style={{ marginBottom: 0 }}>
                      <Select
                        placeholder="请选择分析项目"
                        value={item.id}
                        onChange={(value) => handleUpdateAnalysisItem(index, 'analysisItemId', value)}
                      >
                        {analysisItems.map(analysisItem => (
                          <Option key={analysisItem.id} value={analysisItem.id}>
                            {analysisItem.name} ({analysisItem.code})
                          </Option>
                        ))}
                      </Select>
                    </Form.Item>
                  </Col>
                  <Col span={4}>
                    <Form.Item label="报告顺序" style={{ marginBottom: 0 }}>
                      <InputNumber
                        min={1}
                        value={item.reportOrder}
                        onChange={(value) => handleUpdateAnalysisItem(index, 'reportOrder', value)}
                      />
                    </Form.Item>
                  </Col>
                  <Col span={6}>
                    <Form.Item label="是否必需" style={{ marginBottom: 0 }}>
                      <Switch
                        checked={item.isRequired}
                        onChange={(checked) => handleUpdateAnalysisItem(index, 'isRequired', checked)}
                      />
                    </Form.Item>
                  </Col>
                  <Col span={6}>
                    <Form.Item label="是否启用" style={{ marginBottom: 0 }}>
                      <Switch
                        checked={item.isActive}
                        onChange={(checked) => handleUpdateAnalysisItem(index, 'isActive', checked)}
                      />
                    </Form.Item>
                  </Col>
                </Row>
              </Card>
            ))}
          </Card>

          <Card title="状态设置" style={{ marginBottom: 24 }}>
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  label="项目状态"
                  name="status"
                  rules={[{ required: true, message: '请选择项目状态' }]}
                >
                  <Select placeholder="请选择项目状态">
                    <Option value="active">启用</Option>
                    <Option value="inactive">停用</Option>
                    <Option value="pending">待审核</Option>
                  </Select>
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  label="是否激活"
                  name="isActive"
                  valuePropName="checked"
                >
                  <Switch />
                </Form.Item>
              </Col>
            </Row>
          </Card>

          <div style={{ textAlign: 'center' }}>
            <Space size="large">
              <Button onClick={() => navigate('/detection/test-item')}>
                取消
              </Button>
              <Button type="primary" htmlType="submit" loading={loading} icon={<SaveOutlined />}>
                保存
              </Button>
            </Space>
          </div>
        </Form>
      </Card>
    </div>
  )
}

export default TestItemAdd