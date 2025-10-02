import React, { useState } from 'react'
import { 
  Card, 
  Form, 
  Input, 
  Select, 
  Button, 
  Space, 
  message, 
  Row, 
  Col, 
  InputNumber, 
  Switch, 
  Divider, 
  Steps, 
  Typography, 
  Alert,
  Tabs,
  List,
  Tag,
  Tooltip,
  Upload,
  Modal
} from 'antd'
import { 
  SaveOutlined, 
  ArrowLeftOutlined, 
  PlusOutlined, 
  DeleteOutlined,
  InfoCircleOutlined,
  UploadOutlined,
  FileTextOutlined
} from '@ant-design/icons'
import { useNavigate } from 'react-router-dom'

const { Option } = Select
const { TextArea } = Input
const { Title, Text } = Typography
const { TabPane } = Tabs

/**
 * 分析项目新增页面组件
 * 提供完整的分析项目创建功能，包含基本信息、检测参数、质量控制、报告配置等
 */
const AnalysisItemAdd: React.FC = () => {
  const navigate = useNavigate()
  const [form] = Form.useForm()
  const [loading, setLoading] = useState(false)
  const [currentStep, setCurrentStep] = useState(0)
  
  // 解读规则状态
  const [interpretationRules, setInterpretationRules] = useState<{
    condition: string
    interpretation: string
    recommendation: string
  }[]>([])

  // 获取检测项目列表（模拟数据）
  const testItems = [
    { id: '1', name: '结核耐药基因检测', code: 'TB-DRUG-RESISTANCE' },
    { id: '2', name: 'HIV病毒载量检测', code: 'HIV-VIRAL-LOAD' },
    { id: '3', name: 'HIV基因型分析', code: 'HIV-GENOTYPE' },
    { id: '4', name: 'NGS肿瘤基因检测', code: 'NGS-TUMOR-GENE' }
  ]

  // 方法学选项
  const methodologies = [
    { id: '1', name: 'NGS测序', code: 'NGS' },
    { id: '2', name: 'qPCR', code: 'qPCR' },
    { id: '3', name: 'Sanger测序', code: 'SANGER' },
    { id: '4', name: 'FISH', code: 'FISH' },
    { id: '5', name: '免疫组化', code: 'IHC' }
  ]

  // 结果类型选项
  const resultTypes = [
    { value: 'qualitative', label: '定性', description: '阴性/阳性、野生型/突变型等' },
    { value: 'quantitative', label: '定量', description: '具体数值结果，如拷贝数、浓度等' },
    { value: 'text', label: '文本', description: '描述性结果，如基因型分析报告' }
  ]

  // 样本类型选项
  const sampleTypes = [
    { label: '血液', value: '血液', description: '全血样本' },
    { label: '血浆', value: '血浆', description: '血浆样本' },
    { label: '血清', value: '血清', description: '血清样本' },
    { label: '痰液', value: '痰液', description: '痰液样本' },
    { label: '组织', value: '组织', description: '组织样本' },
    { label: '尿液', value: '尿液', description: '尿液样本' },
    { label: '唾液', value: '唾液', description: '唾液样本' },
    { label: 'DNA', value: 'DNA', description: '提取的DNA样本' },
    { label: 'RNA', value: 'RNA', description: '提取的RNA样本' }
  ]

  // 疾病选项
  const diseases = [
    '结核病', '肺结核', '耐药结核', 'HIV感染', 'AIDS', 
    '肺癌', '非小细胞肺癌', '肺腺癌', '乳腺癌', '结直肠癌', 
    '胃癌', '肝癌', '胰腺癌', '前列腺癌', '卵巢癌'
  ]

  // 步骤配置
  const steps = [
    { title: '基本信息', description: '项目基础信息配置' },
    { title: '检测参数', description: '检测方法和参数设置' },
    { title: '质量控制', description: '质量控制要求配置' },
    { title: '报告配置', description: '报告模板和格式设置' }
  ]

  /**
   * 添加解读规则
   */
  const addInterpretationRule = () => {
    setInterpretationRules([
      ...interpretationRules,
      { condition: '', interpretation: '', recommendation: '' }
    ])
  }

  /**
   * 删除解读规则
   * @param index - 规则索引
   */
  const removeInterpretationRule = (index: number) => {
    setInterpretationRules(interpretationRules.filter((_, i) => i !== index))
  }

  /**
   * 更新解读规则
   * @param index - 规则索引
   * @param field - 字段名
   * @param value - 字段值
   */
  const updateInterpretationRule = (index: number, field: string, value: string) => {
    const newRules = [...interpretationRules]
    newRules[index] = { ...newRules[index], [field]: value }
    setInterpretationRules(newRules)
  }

  /**
   * 保存分析项目
   * @param values - 表单数据
   */
  const handleSave = async (values: any) => {
    try {
      setLoading(true)
      
      // 构建完整的分析项目数据
      const analysisItemData = {
        ...values,
        interpretationRules,
        createdAt: new Date().toISOString().split('T')[0],
        updatedAt: new Date().toISOString().split('T')[0]
      }

      // 模拟保存操作
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      message.success('分析项目创建成功')
      navigate('/detection/analysis-item')
    } catch (error) {
      message.error('保存失败，请重试')
      console.error('保存失败:', error)
    } finally {
      setLoading(false)
    }
  }

  /**
   * 表单验证失败处理
   * @param errorInfo - 错误信息
   */
  const onFinishFailed = (errorInfo: any) => {
    message.error('请检查表单填写是否完整')
    console.log('表单验证失败:', errorInfo)
  }

  return (
    <div style={{ padding: '24px' }}>
      {/* 页面头部 */}
      <Card style={{ marginBottom: 24 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <Button 
              icon={<ArrowLeftOutlined />} 
              onClick={() => navigate('/detection/analysis-item')}
              style={{ marginRight: 16 }}
            >
              返回列表
            </Button>
            <Title level={3} style={{ margin: 0 }}>新增分析项目</Title>
          </div>
          <Space>
            <Button onClick={() => form.resetFields()}>
              重置表单
            </Button>
            <Button 
              type="primary" 
              icon={<SaveOutlined />}
              loading={loading}
              onClick={() => form.submit()}
            >
              保存项目
            </Button>
          </Space>
        </div>
      </Card>

      {/* 步骤指示器 */}
      <Card style={{ marginBottom: 24 }}>
        <Steps current={currentStep} items={steps} />
      </Card>

      {/* 表单内容 */}
      <Form
        form={form}
        layout="vertical"
        onFinish={handleSave}
        onFinishFailed={onFinishFailed}
        initialValues={{
          isActive: true,
          isRequired: false,
          status: 'active',
          reportOrder: 1,
          type: 'qualitative',
          qualityControl: {
            cvRequirement: 15,
            accuracyRequirement: 95,
            precisionRequirement: 90
          },
          reportConfiguration: {
            format: 'pdf',
            includeGraphs: true,
            includeInterpretation: true
          }
        }}
      >
        <Tabs 
          activeKey={currentStep.toString()} 
          onChange={(key) => setCurrentStep(parseInt(key))}
          type="card"
        >
          {/* 基本信息 */}
          <TabPane tab="基本信息" key="0">
            <Card title="项目基础信息" style={{ marginBottom: 16 }}>
              <Alert
                message="填写提示"
                description="请准确填写分析项目的基本信息，项目编号建议使用规范的命名格式，如：A-TB-001"
                type="info"
                showIcon
                style={{ marginBottom: 16 }}
              />
              
              <Row gutter={16}>
                <Col span={8}>
                  <Form.Item
                    label="分析项目编号"
                    name="code"
                    rules={[
                      { required: true, message: '请输入分析项目编号' },
                      { pattern: /^[A-Z]-[A-Z0-9]+-[0-9]+$/, message: '编号格式：A-TB-001' }
                    ]}
                    tooltip="建议格式：A-TB-001，其中A表示分析项目，TB表示疾病类型，001表示序号"
                  >
                    <Input placeholder="如：A-TB-001" />
                  </Form.Item>
                </Col>
                <Col span={8}>
                  <Form.Item
                    label="分析项目名称"
                    name="name"
                    rules={[{ required: true, message: '请输入分析项目名称' }]}
                  >
                    <Input placeholder="如：利福平耐药(rpoB基因)" />
                  </Form.Item>
                </Col>
                <Col span={8}>
                  <Form.Item
                    label="英文名称"
                    name="englishName"
                  >
                    <Input placeholder="如：Rifampicin Resistance (rpoB)" />
                  </Form.Item>
                </Col>
              </Row>

              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item
                    label="所属检测项目"
                    name="testItemId"
                    rules={[{ required: true, message: '请选择所属检测项目' }]}
                  >
                    <Select placeholder="请选择检测项目" showSearch>
                      {testItems.map(item => (
                        <Option key={item.id} value={item.id}>
                          <div>
                            <div>{item.name}</div>
                            <div style={{ fontSize: '12px', color: '#666' }}>{item.code}</div>
                          </div>
                        </Option>
                      ))}
                    </Select>
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item
                    label="项目类别"
                    name="category"
                    rules={[{ required: true, message: '请输入项目类别' }]}
                  >
                    <Select placeholder="请选择或输入项目类别" mode="tags">
                      <Option value="基因突变">基因突变</Option>
                      <Option value="基因扩增">基因扩增</Option>
                      <Option value="基因缺失">基因缺失</Option>
                      <Option value="病毒载量">病毒载量</Option>
                      <Option value="基因型分析">基因型分析</Option>
                      <Option value="微卫星">微卫星</Option>
                      <Option value="融合基因">融合基因</Option>
                    </Select>
                  </Form.Item>
                </Col>
              </Row>

              <Row gutter={16}>
                <Col span={8}>
                  <Form.Item
                    label="结果类型"
                    name="type"
                    rules={[{ required: true, message: '请选择结果类型' }]}
                  >
                    <Select placeholder="请选择结果类型">
                      {resultTypes.map(type => (
                        <Option key={type.value} value={type.value}>
                          <div>
                            <div>{type.label}</div>
                            <div style={{ fontSize: '12px', color: '#666' }}>{type.description}</div>
                          </div>
                        </Option>
                      ))}
                    </Select>
                  </Form.Item>
                </Col>
                <Col span={8}>
                  <Form.Item
                    label="状态"
                    name="status"
                    rules={[{ required: true, message: '请选择状态' }]}
                  >
                    <Select>
                      <Option value="active">启用</Option>
                      <Option value="pending">待审核</Option>
                      <Option value="inactive">停用</Option>
                    </Select>
                  </Form.Item>
                </Col>
                <Col span={8}>
                  <Form.Item
                    label="报告顺序"
                    name="reportOrder"
                    rules={[{ required: true, message: '请输入报告顺序' }]}
                    tooltip="在报告中的显示顺序，数字越小越靠前"
                  >
                    <InputNumber min={1} max={999} style={{ width: '100%' }} />
                  </Form.Item>
                </Col>
              </Row>

              <Row gutter={16}>
                <Col span={6}>
                  <Form.Item
                    label="是否启用"
                    name="isActive"
                    valuePropName="checked"
                  >
                    <Switch checkedChildren="启用" unCheckedChildren="禁用" />
                  </Form.Item>
                </Col>
                <Col span={6}>
                  <Form.Item
                    label="是否必需"
                    name="isRequired"
                    valuePropName="checked"
                    tooltip="必需项目在检测时不能跳过"
                  >
                    <Switch checkedChildren="必需" unCheckedChildren="可选" />
                  </Form.Item>
                </Col>
              </Row>

              <Form.Item
                label="项目描述"
                name="description"
              >
                <TextArea 
                  rows={3} 
                  placeholder="请输入项目的详细描述，包括检测原理、适用范围等"
                />
              </Form.Item>
            </Card>
          </TabPane>

          {/* 检测参数 */}
          <TabPane tab="检测参数" key="1">
            <Card title="检测方法与参数" style={{ marginBottom: 16 }}>
              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item
                    label="检测方法学"
                    name="methodologyId"
                    rules={[{ required: true, message: '请选择检测方法学' }]}
                  >
                    <Select placeholder="请选择检测方法学" showSearch>
                      {methodologies.map(method => (
                        <Option key={method.id} value={method.id}>
                          <div>
                            <div>{method.name}</div>
                            <div style={{ fontSize: '12px', color: '#666' }}>{method.code}</div>
                          </div>
                        </Option>
                      ))}
                    </Select>
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item
                    label="样本类型"
                    name="sampleType"
                    rules={[{ required: true, message: '请选择样本类型' }]}
                  >
                    <Select
                      mode="multiple"
                      placeholder="请选择适用的样本类型"
                      optionLabelProp="label"
                    >
                      {sampleTypes.map(sample => (
                        <Option key={sample.value} value={sample.value} label={sample.label}>
                          <div>
                            <div>{sample.label}</div>
                            <div style={{ fontSize: '12px', color: '#666' }}>{sample.description}</div>
                          </div>
                        </Option>
                      ))}
                    </Select>
                  </Form.Item>
                </Col>
              </Row>

              <Divider orientation="left">结果参数设置</Divider>

              <Row gutter={16}>
                <Col span={8}>
                  <Form.Item
                    label="单位"
                    name="unit"
                    tooltip="定量检测时的结果单位，如：copies/mL、ng/mL等"
                  >
                    <Input placeholder="如：copies/mL" />
                  </Form.Item>
                </Col>
                <Col span={8}>
                  <Form.Item
                    label="参考范围"
                    name="referenceRange"
                  >
                    <Input placeholder="如：野生型、<20 copies/mL" />
                  </Form.Item>
                </Col>
                <Col span={8}>
                  <Form.Item
                    label="正常值"
                    name="normalValue"
                  >
                    <Input placeholder="如：阴性、未检出" />
                  </Form.Item>
                </Col>
              </Row>

              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item
                    label="异常判断标准"
                    name="abnormalCriteria"
                  >
                    <Input placeholder="如：阳性、≥20 copies/mL" />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item
                    label="关联疾病"
                    name="associatedDiseases"
                  >
                    <Select
                      mode="tags"
                      placeholder="请选择或输入关联疾病"
                      options={diseases.map(disease => ({ label: disease, value: disease }))}
                    />
                  </Form.Item>
                </Col>
              </Row>

              <Form.Item
                label="临床意义"
                name="clinicalSignificance"
                rules={[{ required: true, message: '请输入临床意义' }]}
              >
                <TextArea 
                  rows={4} 
                  placeholder="请详细描述该分析项目的临床意义、应用场景和解读要点"
                />
              </Form.Item>
            </Card>

            {/* 解读规则配置 */}
            <Card title="解读规则配置" style={{ marginBottom: 16 }}>
              <div style={{ marginBottom: 16 }}>
                <Button 
                  type="dashed" 
                  icon={<PlusOutlined />} 
                  onClick={addInterpretationRule}
                  block
                >
                  添加解读规则
                </Button>
              </div>

              {interpretationRules.map((rule, index) => (
                <Card 
                  key={index} 
                  size="small" 
                  title={`规则 ${index + 1}`}
                  extra={
                    <Button 
                      type="text" 
                      danger 
                      icon={<DeleteOutlined />}
                      onClick={() => removeInterpretationRule(index)}
                    />
                  }
                  style={{ marginBottom: 16 }}
                >
                  <Row gutter={16}>
                    <Col span={8}>
                      <Input
                        placeholder="触发条件"
                        value={rule.condition}
                        onChange={(e) => updateInterpretationRule(index, 'condition', e.target.value)}
                      />
                    </Col>
                    <Col span={8}>
                      <Input
                        placeholder="结果解读"
                        value={rule.interpretation}
                        onChange={(e) => updateInterpretationRule(index, 'interpretation', e.target.value)}
                      />
                    </Col>
                    <Col span={8}>
                      <Input
                        placeholder="临床建议"
                        value={rule.recommendation}
                        onChange={(e) => updateInterpretationRule(index, 'recommendation', e.target.value)}
                      />
                    </Col>
                  </Row>
                </Card>
              ))}
            </Card>
          </TabPane>

          {/* 质量控制 */}
          <TabPane tab="质量控制" key="2">
            <Card title="质量控制要求" style={{ marginBottom: 16 }}>
              <Alert
                message="质量控制说明"
                description="设置该分析项目的质量控制要求，包括变异系数(CV)、准确度和精密度等指标"
                type="info"
                showIcon
                style={{ marginBottom: 16 }}
              />

              <Row gutter={16}>
                <Col span={8}>
                  <Form.Item
                    label="变异系数要求 (CV%)"
                    name={['qualityControl', 'cvRequirement']}
                    tooltip="批内和批间变异系数的最大允许值"
                  >
                    <InputNumber 
                      min={0} 
                      max={100} 
                      precision={1}
                      addonAfter="%" 
                      placeholder="如：15.0"
                      style={{ width: '100%' }} 
                    />
                  </Form.Item>
                </Col>
                <Col span={8}>
                  <Form.Item
                    label="准确度要求 (%)"
                    name={['qualityControl', 'accuracyRequirement']}
                    tooltip="检测结果与真实值的符合程度要求"
                  >
                    <InputNumber 
                      min={0} 
                      max={100} 
                      precision={1}
                      addonAfter="%" 
                      placeholder="如：95.0"
                      style={{ width: '100%' }} 
                    />
                  </Form.Item>
                </Col>
                <Col span={8}>
                  <Form.Item
                    label="精密度要求 (%)"
                    name={['qualityControl', 'precisionRequirement']}
                    tooltip="重复检测结果的一致性要求"
                  >
                    <InputNumber 
                      min={0} 
                      max={100} 
                      precision={1}
                      addonAfter="%" 
                      placeholder="如：90.0"
                      style={{ width: '100%' }} 
                    />
                  </Form.Item>
                </Col>
              </Row>

              <Divider orientation="left">检测限度</Divider>

              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item
                    label="检出限 (LOD)"
                    name={['qualityControl', 'detectionLimit']}
                    tooltip="能够检出的最低浓度或拷贝数"
                  >
                    <Input placeholder="如：10 copies/mL" />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item
                    label="定量限 (LOQ)"
                    name={['qualityControl', 'quantificationLimit']}
                    tooltip="能够准确定量的最低浓度或拷贝数"
                  >
                    <Input placeholder="如：20 copies/mL" />
                  </Form.Item>
                </Col>
              </Row>

              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item
                    label="线性范围"
                    name={['qualityControl', 'linearRange']}
                    tooltip="检测方法的线性检测范围"
                  >
                    <Input placeholder="如：20-10^7 copies/mL" />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item
                    label="特异性要求"
                    name={['qualityControl', 'specificity']}
                    tooltip="与其他相似目标的交叉反应要求"
                  >
                    <Input placeholder="如：无交叉反应" />
                  </Form.Item>
                </Col>
              </Row>
            </Card>
          </TabPane>

          {/* 报告配置 */}
          <TabPane tab="报告配置" key="3">
            <Card title="报告模板配置" style={{ marginBottom: 16 }}>
              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item
                    label="报告模板名称"
                    name={['reportConfiguration', 'template']}
                  >
                    <Input placeholder="如：结核耐药基因检测报告模板v2.1" />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item
                    label="报告格式"
                    name={['reportConfiguration', 'format']}
                  >
                    <Select placeholder="请选择报告格式">
                      <Option value="pdf">PDF格式</Option>
                      <Option value="word">Word格式</Option>
                      <Option value="html">HTML格式</Option>
                    </Select>
                  </Form.Item>
                </Col>
              </Row>

              <Row gutter={16}>
                <Col span={8}>
                  <Form.Item
                    label="包含图表"
                    name={['reportConfiguration', 'includeGraphs']}
                    valuePropName="checked"
                  >
                    <Switch checkedChildren="包含" unCheckedChildren="不包含" />
                  </Form.Item>
                </Col>
                <Col span={8}>
                  <Form.Item
                    label="包含解读"
                    name={['reportConfiguration', 'includeInterpretation']}
                    valuePropName="checked"
                  >
                    <Switch checkedChildren="包含" unCheckedChildren="不包含" />
                  </Form.Item>
                </Col>
                <Col span={8}>
                  <Form.Item
                    label="自动生成"
                    name={['reportConfiguration', 'autoGenerate']}
                    valuePropName="checked"
                  >
                    <Switch checkedChildren="自动" unCheckedChildren="手动" />
                  </Form.Item>
                </Col>
              </Row>

              <Form.Item
                label="报告说明"
                name={['reportConfiguration', 'description']}
              >
                <TextArea 
                  rows={3} 
                  placeholder="请输入报告的说明信息，如注意事项、免责声明等"
                />
              </Form.Item>
            </Card>

            <Card title="文档上传" style={{ marginBottom: 16 }}>
              <Form.Item
                label="相关文档"
                name="documents"
                tooltip="可上传相关的标准操作程序(SOP)、验证报告等文档"
              >
                <Upload
                  multiple
                  beforeUpload={() => false}
                  listType="text"
                >
                  <Button icon={<UploadOutlined />}>上传文档</Button>
                </Upload>
              </Form.Item>
            </Card>
          </TabPane>
        </Tabs>

        {/* 底部操作按钮 */}
        <Card>
          <div style={{ textAlign: 'center' }}>
            <Space size="large">
              <Button size="large" onClick={() => navigate('/detection/analysis-item')}>
                取消
              </Button>
              <Button size="large" onClick={() => form.resetFields()}>
                重置
              </Button>
              <Button 
                type="primary" 
                size="large" 
                htmlType="submit"
                loading={loading}
                icon={<SaveOutlined />}
              >
                保存分析项目
              </Button>
            </Space>
          </div>
        </Card>
      </Form>
    </div>
  )
}

export default AnalysisItemAdd