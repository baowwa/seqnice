import React, { useState } from 'react'
import { 
  Table, 
  Button, 
  Modal, 
  Form, 
  Input, 
  Select, 
  Space, 
  Card, 
  Tag, 
  Descriptions, 
  Tabs, 
  Row, 
  Col,
  message,
  Popconfirm,
  Tooltip,
  Badge
} from 'antd'
import { 
  PlusOutlined, 
  EditOutlined, 
  DeleteOutlined, 
  EyeOutlined,
  SettingOutlined,
  PlayCircleOutlined,
  InfoCircleOutlined
} from '@ant-design/icons'

const { TextArea } = Input
const { Option } = Select
const { TabPane } = Tabs

/**
 * 分析工具接口定义
 */
interface AnalysisTool {
  id: string
  name: string
  category: string
  version: string
  description: string
  inputFormats: string[]
  outputFormats: string[]
  parameters: ToolParameter[]
  status: 'active' | 'inactive' | 'maintenance'
  author: string
  createTime: string
  updateTime: string
  usageCount: number
  documentation: string
  requirements: string[]
}

/**
 * 工具参数接口定义
 */
interface ToolParameter {
  name: string
  type: 'string' | 'number' | 'boolean' | 'select' | 'file'
  required: boolean
  defaultValue?: any
  description: string
  options?: string[]
  min?: number
  max?: number
}

/**
 * 分析工具管理组件
 * 提供生信分析工具的管理功能，包括工具信息、参数配置等
 */
const AnalysisToolsManagement: React.FC = () => {
  const [tools, setTools] = useState<AnalysisTool[]>([
    {
      id: '1',
      name: 'FastQC',
      category: '质量控制',
      version: '0.11.9',
      description: '高通量测序数据质量控制工具，用于评估原始测序数据的质量',
      inputFormats: ['FASTQ', 'SAM', 'BAM'],
      outputFormats: ['HTML', 'ZIP'],
      parameters: [
        {
          name: 'threads',
          type: 'number',
          required: false,
          defaultValue: 1,
          description: '并行线程数',
          min: 1,
          max: 32
        },
        {
          name: 'outdir',
          type: 'string',
          required: false,
          defaultValue: './fastqc_output',
          description: '输出目录路径'
        },
        {
          name: 'format',
          type: 'select',
          required: false,
          defaultValue: 'fastq',
          description: '输入文件格式',
          options: ['fastq', 'sam', 'bam']
        }
      ],
      status: 'active',
      author: 'Babraham Bioinformatics',
      createTime: '2023-01-15',
      updateTime: '2023-12-01',
      usageCount: 1250,
      documentation: 'https://www.bioinformatics.babraham.ac.uk/projects/fastqc/',
      requirements: ['Java 1.8+']
    },
    {
      id: '2',
      name: 'BWA-MEM',
      category: '序列比对',
      version: '0.7.17',
      description: 'Burrows-Wheeler Aligner，用于将测序reads比对到参考基因组',
      inputFormats: ['FASTQ'],
      outputFormats: ['SAM'],
      parameters: [
        {
          name: 'reference',
          type: 'file',
          required: true,
          description: '参考基因组文件路径'
        },
        {
          name: 'threads',
          type: 'number',
          required: false,
          defaultValue: 4,
          description: '并行线程数',
          min: 1,
          max: 64
        },
        {
          name: 'min_seed_length',
          type: 'number',
          required: false,
          defaultValue: 19,
          description: '最小种子长度',
          min: 10,
          max: 50
        },
        {
          name: 'band_width',
          type: 'number',
          required: false,
          defaultValue: 100,
          description: '带宽参数',
          min: 50,
          max: 1000
        }
      ],
      status: 'active',
      author: 'Heng Li',
      createTime: '2023-02-10',
      updateTime: '2023-11-15',
      usageCount: 980,
      documentation: 'http://bio-bwa.sourceforge.net/',
      requirements: ['GCC 4.9+', 'zlib']
    },
    {
      id: '3',
      name: 'GATK HaplotypeCaller',
      category: '变异检测',
      version: '4.4.0',
      description: 'GATK工具包中的单倍型变异检测工具，用于检测SNP和INDEL',
      inputFormats: ['BAM', 'CRAM'],
      outputFormats: ['VCF', 'GVCF'],
      parameters: [
        {
          name: 'reference',
          type: 'file',
          required: true,
          description: '参考基因组文件'
        },
        {
          name: 'emit_ref_confidence',
          type: 'select',
          required: false,
          defaultValue: 'NONE',
          description: '参考位点置信度输出模式',
          options: ['NONE', 'BP_RESOLUTION', 'GVCF']
        },
        {
          name: 'min_base_quality_score',
          type: 'number',
          required: false,
          defaultValue: 10,
          description: '最小碱基质量分数',
          min: 0,
          max: 50
        },
        {
          name: 'native_pair_hmm_threads',
          type: 'number',
          required: false,
          defaultValue: 4,
          description: 'PairHMM线程数',
          min: 1,
          max: 32
        }
      ],
      status: 'active',
      author: 'Broad Institute',
      createTime: '2023-03-05',
      updateTime: '2023-12-10',
      usageCount: 756,
      documentation: 'https://gatk.broadinstitute.org/',
      requirements: ['Java 8+', 'Python 3.6+']
    },
    {
      id: '4',
      name: 'VEP',
      category: '变异注释',
      version: '107',
      description: 'Variant Effect Predictor，用于预测变异对基因和蛋白质的影响',
      inputFormats: ['VCF', 'TXT'],
      outputFormats: ['VCF', 'JSON', 'TAB'],
      parameters: [
        {
          name: 'species',
          type: 'select',
          required: false,
          defaultValue: 'homo_sapiens',
          description: '物种选择',
          options: ['homo_sapiens', 'mus_musculus', 'danio_rerio']
        },
        {
          name: 'assembly',
          type: 'select',
          required: false,
          defaultValue: 'GRCh38',
          description: '基因组版本',
          options: ['GRCh38', 'GRCh37', 'GRCm39']
        },
        {
          name: 'cache',
          type: 'boolean',
          required: false,
          defaultValue: true,
          description: '使用本地缓存数据库'
        },
        {
          name: 'everything',
          type: 'boolean',
          required: false,
          defaultValue: false,
          description: '输出所有可用注释'
        }
      ],
      status: 'active',
      author: 'Ensembl',
      createTime: '2023-04-12',
      updateTime: '2023-11-28',
      usageCount: 432,
      documentation: 'https://www.ensembl.org/info/docs/tools/vep/',
      requirements: ['Perl 5.10+', 'DBI', 'Archive::Zip']
    },
    {
      id: '5',
      name: 'STAR',
      category: 'RNA-seq分析',
      version: '2.7.10a',
      description: 'Spliced Transcripts Alignment to a Reference，用于RNA-seq数据的快速比对',
      inputFormats: ['FASTQ'],
      outputFormats: ['SAM', 'BAM'],
      parameters: [
        {
          name: 'genomeDir',
          type: 'file',
          required: true,
          description: '基因组索引目录'
        },
        {
          name: 'runThreadN',
          type: 'number',
          required: false,
          defaultValue: 8,
          description: '运行线程数',
          min: 1,
          max: 64
        },
        {
          name: 'outSAMtype',
          type: 'select',
          required: false,
          defaultValue: 'BAM SortedByCoordinate',
          description: '输出文件类型',
          options: ['SAM', 'BAM Unsorted', 'BAM SortedByCoordinate']
        },
        {
          name: 'readFilesCommand',
          type: 'string',
          required: false,
          defaultValue: 'zcat',
          description: '读取压缩文件的命令'
        }
      ],
      status: 'maintenance',
      author: 'Alexander Dobin',
      createTime: '2023-05-20',
      updateTime: '2023-10-15',
      usageCount: 324,
      documentation: 'https://github.com/alexdobin/STAR',
      requirements: ['GCC 4.7+', 'zlib']
    }
  ])

  const [isModalVisible, setIsModalVisible] = useState(false)
  const [isDetailModalVisible, setIsDetailModalVisible] = useState(false)
  const [editingTool, setEditingTool] = useState<AnalysisTool | null>(null)
  const [selectedTool, setSelectedTool] = useState<AnalysisTool | null>(null)
  const [form] = Form.useForm()

  /**
   * 显示添加/编辑工具模态框
   */
  const showModal = (tool?: AnalysisTool) => {
    setEditingTool(tool || null)
    setIsModalVisible(true)
    if (tool) {
      form.setFieldsValue(tool)
    } else {
      form.resetFields()
    }
  }

  /**
   * 显示工具详情模态框
   */
  const showDetailModal = (tool: AnalysisTool) => {
    setSelectedTool(tool)
    setIsDetailModalVisible(true)
  }

  /**
   * 处理表单提交
   */
  const handleSubmit = async (values: any) => {
    try {
      if (editingTool) {
        // 编辑工具
        setTools(tools.map(tool => 
          tool.id === editingTool.id 
            ? { ...tool, ...values, updateTime: new Date().toISOString().split('T')[0] }
            : tool
        ))
        message.success('工具信息更新成功')
      } else {
        // 添加新工具
        const newTool: AnalysisTool = {
          ...values,
          id: Date.now().toString(),
          createTime: new Date().toISOString().split('T')[0],
          updateTime: new Date().toISOString().split('T')[0],
          usageCount: 0
        }
        setTools([...tools, newTool])
        message.success('工具添加成功')
      }
      setIsModalVisible(false)
      form.resetFields()
    } catch (error) {
      message.error('操作失败')
    }
  }

  /**
   * 删除工具
   */
  const handleDelete = (id: string) => {
    setTools(tools.filter(tool => tool.id !== id))
    message.success('工具删除成功')
  }

  /**
   * 获取状态标签
   */
  const getStatusTag = (status: string) => {
    const statusConfig = {
      active: { color: 'green', text: '正常' },
      inactive: { color: 'red', text: '停用' },
      maintenance: { color: 'orange', text: '维护中' }
    }
    const config = statusConfig[status as keyof typeof statusConfig]
    return <Tag color={config.color}>{config.text}</Tag>
  }

  /**
   * 表格列定义
   */
  const columns = [
    {
      title: '工具名称',
      dataIndex: 'name',
      key: 'name',
      render: (text: string, record: AnalysisTool) => (
        <Space>
          <strong>{text}</strong>
          <Tag color="blue">{record.version}</Tag>
        </Space>
      )
    },
    {
      title: '分类',
      dataIndex: 'category',
      key: 'category',
      render: (text: string) => <Tag color="purple">{text}</Tag>
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => getStatusTag(status)
    },
    {
      title: '使用次数',
      dataIndex: 'usageCount',
      key: 'usageCount',
      render: (count: number) => <Badge count={count} showZero color="blue" />
    },
    {
      title: '更新时间',
      dataIndex: 'updateTime',
      key: 'updateTime'
    },
    {
      title: '操作',
      key: 'action',
      render: (_, record: AnalysisTool) => (
        <Space>
          <Tooltip title="查看详情">
            <Button 
              type="text" 
              icon={<EyeOutlined />} 
              onClick={() => showDetailModal(record)}
            />
          </Tooltip>
          <Tooltip title="编辑工具">
            <Button 
              type="text" 
              icon={<EditOutlined />} 
              onClick={() => showModal(record)}
            />
          </Tooltip>
          <Tooltip title="运行工具">
            <Button 
              type="text" 
              icon={<PlayCircleOutlined />} 
              disabled={record.status !== 'active'}
            />
          </Tooltip>
          <Popconfirm
            title="确定要删除这个工具吗？"
            onConfirm={() => handleDelete(record.id)}
            okText="确定"
            cancelText="取消"
          >
            <Tooltip title="删除工具">
              <Button 
                type="text" 
                danger 
                icon={<DeleteOutlined />}
              />
            </Tooltip>
          </Popconfirm>
        </Space>
      )
    }
  ]

  return (
    <div>
      <Card>
        <div style={{ marginBottom: 16 }}>
          <Button 
            type="primary" 
            icon={<PlusOutlined />} 
            onClick={() => showModal()}
          >
            添加工具
          </Button>
        </div>

        <Table
          columns={columns}
          dataSource={tools}
          rowKey="id"
          pagination={{
            total: tools.length,
            pageSize: 10,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total) => `共 ${total} 个工具`
          }}
        />
      </Card>

      {/* 添加/编辑工具模态框 */}
      <Modal
        title={editingTool ? '编辑工具' : '添加工具'}
        open={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        footer={null}
        width={800}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
        >
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="name"
                label="工具名称"
                rules={[{ required: true, message: '请输入工具名称' }]}
              >
                <Input placeholder="请输入工具名称" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="version"
                label="版本号"
                rules={[{ required: true, message: '请输入版本号' }]}
              >
                <Input placeholder="请输入版本号" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="category"
                label="工具分类"
                rules={[{ required: true, message: '请选择工具分类' }]}
              >
                <Select placeholder="请选择工具分类">
                  <Option value="质量控制">质量控制</Option>
                  <Option value="序列比对">序列比对</Option>
                  <Option value="变异检测">变异检测</Option>
                  <Option value="变异注释">变异注释</Option>
                  <Option value="RNA-seq分析">RNA-seq分析</Option>
                  <Option value="基因组组装">基因组组装</Option>
                  <Option value="功能注释">功能注释</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="status"
                label="状态"
                rules={[{ required: true, message: '请选择状态' }]}
              >
                <Select placeholder="请选择状态">
                  <Option value="active">正常</Option>
                  <Option value="inactive">停用</Option>
                  <Option value="maintenance">维护中</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            name="description"
            label="工具描述"
            rules={[{ required: true, message: '请输入工具描述' }]}
          >
            <TextArea rows={3} placeholder="请输入工具描述" />
          </Form.Item>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="author"
                label="作者/机构"
                rules={[{ required: true, message: '请输入作者或机构' }]}
              >
                <Input placeholder="请输入作者或机构" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="documentation"
                label="文档链接"
              >
                <Input placeholder="请输入文档链接" />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit">
                {editingTool ? '更新' : '添加'}
              </Button>
              <Button onClick={() => setIsModalVisible(false)}>
                取消
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>

      {/* 工具详情模态框 */}
      <Modal
        title="工具详情"
        open={isDetailModalVisible}
        onCancel={() => setIsDetailModalVisible(false)}
        footer={[
          <Button key="close" onClick={() => setIsDetailModalVisible(false)}>
            关闭
          </Button>
        ]}
        width={900}
      >
        {selectedTool && (
          <Tabs defaultActiveKey="1">
            <TabPane tab="基本信息" key="1">
              <Descriptions column={2} bordered>
                <Descriptions.Item label="工具名称">{selectedTool.name}</Descriptions.Item>
                <Descriptions.Item label="版本号">{selectedTool.version}</Descriptions.Item>
                <Descriptions.Item label="分类">{selectedTool.category}</Descriptions.Item>
                <Descriptions.Item label="状态">{getStatusTag(selectedTool.status)}</Descriptions.Item>
                <Descriptions.Item label="作者/机构">{selectedTool.author}</Descriptions.Item>
                <Descriptions.Item label="使用次数">{selectedTool.usageCount}</Descriptions.Item>
                <Descriptions.Item label="创建时间">{selectedTool.createTime}</Descriptions.Item>
                <Descriptions.Item label="更新时间">{selectedTool.updateTime}</Descriptions.Item>
                <Descriptions.Item label="描述" span={2}>
                  {selectedTool.description}
                </Descriptions.Item>
                <Descriptions.Item label="输入格式" span={2}>
                  {selectedTool.inputFormats.map(format => (
                    <Tag key={format} color="green">{format}</Tag>
                  ))}
                </Descriptions.Item>
                <Descriptions.Item label="输出格式" span={2}>
                  {selectedTool.outputFormats.map(format => (
                    <Tag key={format} color="blue">{format}</Tag>
                  ))}
                </Descriptions.Item>
                <Descriptions.Item label="系统要求" span={2}>
                  {selectedTool.requirements.map(req => (
                    <Tag key={req} color="orange">{req}</Tag>
                  ))}
                </Descriptions.Item>
              </Descriptions>
            </TabPane>
            
            <TabPane tab="参数配置" key="2">
              <Table
                dataSource={selectedTool.parameters}
                rowKey="name"
                pagination={false}
                columns={[
                  {
                    title: '参数名',
                    dataIndex: 'name',
                    key: 'name',
                    render: (text: string, record: ToolParameter) => (
                      <Space>
                        <code>{text}</code>
                        {record.required && <Tag color="red">必需</Tag>}
                      </Space>
                    )
                  },
                  {
                    title: '类型',
                    dataIndex: 'type',
                    key: 'type',
                    render: (type: string) => <Tag color="purple">{type}</Tag>
                  },
                  {
                    title: '默认值',
                    dataIndex: 'defaultValue',
                    key: 'defaultValue',
                    render: (value: any) => value !== undefined ? <code>{String(value)}</code> : '-'
                  },
                  {
                    title: '描述',
                    dataIndex: 'description',
                    key: 'description'
                  }
                ]}
              />
            </TabPane>
          </Tabs>
        )}
      </Modal>
    </div>
  )
}

export default AnalysisToolsManagement