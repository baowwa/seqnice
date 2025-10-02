import React, { useState, useEffect } from 'react';
import {
  Card,
  Table,
  Button,
  Space,
  Modal,
  Form,
  Input,
  Select,
  Switch,
  message,
  Popconfirm,
  Tag,
  Row,
  Col,
  Divider,
  Tabs,
  List,
  Typography,
  Tooltip
} from 'antd';
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  CopyOutlined,
  SettingOutlined,
  FileTextOutlined,
  ExperimentOutlined,
  MedicineBoxOutlined,
  CheckCircleOutlined
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { ProjectType, ProjectTemplate, ProjectStage, ProjectCenter, CenterType, StageStatus } from '../types';

const { Option } = Select;
const { TextArea } = Input;
const { TabPane } = Tabs;
const { Text, Title } = Typography;

/**
 * 项目模板管理组件接口
 */
interface ProjectTemplateManagerProps {
  /** 是否显示为模态框 */
  modal?: boolean;
  /** 模态框可见性 */
  visible?: boolean;
  /** 关闭模态框回调 */
  onClose?: () => void;
  /** 选择模板回调 */
  onSelectTemplate?: (template: ProjectTemplate) => void;
}

/**
 * 项目模板管理组件
 * 负责项目模板的创建、编辑、删除和应用
 */
const ProjectTemplateManager: React.FC<ProjectTemplateManagerProps> = ({
  modal = false,
  visible = false,
  onClose,
  onSelectTemplate
}) => {
  // 状态管理
  const [templates, setTemplates] = useState<ProjectTemplate[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<ProjectTemplate | null>(null);
  const [form] = Form.useForm();
  const [activeTab, setActiveTab] = useState('basic');

  // 组件挂载时获取数据
  useEffect(() => {
    fetchTemplates();
  }, []);

  // 模拟API调用 - 获取模板列表
  const fetchTemplates = async () => {
    setLoading(true);
    try {
      // 模拟API延迟
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const mockTemplates: ProjectTemplate[] = [
        {
          id: '1',
          name: '产品注册标准模板',
          type: ProjectType.PRODUCT_REGISTRATION,
          description: '用于产品注册项目的标准模板，包含完整的注册流程和阶段配置',
          isMultiCenter: false,
          isMultiStage: true,
          defaultStages: [
            {
              name: '前期准备',
              description: '收集产品资料，准备注册文件',
              order: 1,
              status: StageStatus.NOT_STARTED,
              estimatedDuration: 7,
              prerequisites: [],
              deliverables: ['产品技术文档', '质量标准文件'],
              isActive: true
            },
            {
              name: '检测验证',
              description: '进行产品检测和验证',
              order: 2,
              status: StageStatus.NOT_STARTED,
              estimatedDuration: 14,
              prerequisites: [],
              deliverables: ['检测报告', '验证报告'],
              isActive: true
            },
            {
              name: '注册申报',
              description: '提交注册申请材料',
              order: 3,
              status: StageStatus.NOT_STARTED,
              estimatedDuration: 30,
              prerequisites: [],
              deliverables: ['注册申请书', '技术审查报告'],
              isActive: true
            }
          ],
          defaultCenterTypes: [],
          estimatedDuration: 51,
          isActive: true,
          createdBy: 'admin',
          createdAt: '2024-01-01T00:00:00Z',
          updatedAt: '2024-01-01T00:00:00Z'
        },
        {
          id: '2',
          name: '科研服务标准模板',
          type: ProjectType.RESEARCH_SERVICE,
          description: '用于科研服务项目的标准模板，支持多中心协作',
          isMultiCenter: true,
          isMultiStage: true,
          defaultStages: [
            {
              name: '项目启动',
              description: '项目启动会议，确定研究方案',
              order: 1,
              status: StageStatus.NOT_STARTED,
              estimatedDuration: 3,
              prerequisites: [],
              deliverables: ['研究方案', '项目计划书'],
              isActive: true
            },
            {
              name: '样本收集',
              description: '收集和处理研究样本',
              order: 2,
              status: StageStatus.NOT_STARTED,
              estimatedDuration: 21,
              prerequisites: [],
              deliverables: ['样本清单', '质控报告'],
              isActive: true
            },
            {
              name: '数据分析',
              description: '进行数据分析和结果解读',
              order: 3,
              status: StageStatus.NOT_STARTED,
              estimatedDuration: 14,
              prerequisites: [],
              deliverables: ['分析报告', '数据图表'],
              isActive: true
            },
            {
              name: '报告撰写',
              description: '撰写最终研究报告',
              order: 4,
              status: StageStatus.NOT_STARTED,
              estimatedDuration: 7,
              prerequisites: [],
              deliverables: ['最终报告', '数据包'],
              isActive: true
            }
          ],
          defaultCenterTypes: [CenterType.LEAD, CenterType.COLLABORATIVE],
          estimatedDuration: 45,
          isActive: true,
          createdBy: 'admin',
          createdAt: '2024-01-01T00:00:00Z',
          updatedAt: '2024-01-01T00:00:00Z'
        },
        {
          id: '3',
          name: '临床检测标准模板',
          type: ProjectType.CLINICAL_DETECTION,
          description: '用于临床检测项目的标准模板，注重质量控制',
          isMultiCenter: false,
          isMultiStage: true,
          defaultStages: [
            {
              name: '样本接收',
              description: '接收和登记临床样本',
              order: 1,
              status: StageStatus.NOT_STARTED,
              estimatedDuration: 1,
              prerequisites: [],
              deliverables: ['样本登记表', '接收确认单'],
              isActive: true
            },
            {
              name: '样本检测',
              description: '进行样本检测分析',
              order: 2,
              status: StageStatus.NOT_STARTED,
              estimatedDuration: 3,
              prerequisites: [],
              deliverables: ['检测数据', '质控记录'],
              isActive: true
            },
            {
              name: '结果审核',
              description: '审核检测结果和质量',
              order: 3,
              status: StageStatus.NOT_STARTED,
              estimatedDuration: 1,
              prerequisites: [],
              deliverables: ['审核报告', '质量评估'],
              isActive: true
            },
            {
              name: '报告发放',
              description: '生成和发放检测报告',
              order: 4,
              status: StageStatus.NOT_STARTED,
              estimatedDuration: 1,
              prerequisites: [],
              deliverables: ['检测报告', '发放记录'],
              isActive: true
            }
          ],
          defaultCenterTypes: [],
          estimatedDuration: 6,
          isActive: true,
          createdBy: 'admin',
          createdAt: '2024-01-01T00:00:00Z',
          updatedAt: '2024-01-01T00:00:00Z'
        }
      ];
      
      setTemplates(mockTemplates);
    } catch (error) {
      message.error('获取模板列表失败');
    } finally {
      setLoading(false);
    }
  };

  // 获取项目类型图标
  const getProjectTypeIcon = (type: ProjectType) => {
    const iconMap = {
      [ProjectType.PRODUCT_REGISTRATION]: <FileTextOutlined />,
      [ProjectType.RESEARCH_SERVICE]: <ExperimentOutlined />,
      [ProjectType.CLINICAL_DETECTION]: <MedicineBoxOutlined />
    };
    return iconMap[type];
  };

  // 获取项目类型显示文本
  const getProjectTypeText = (type: ProjectType) => {
    const typeMap = {
      [ProjectType.PRODUCT_REGISTRATION]: '产品注册',
      [ProjectType.RESEARCH_SERVICE]: '科研服务',
      [ProjectType.CLINICAL_DETECTION]: '临床检测'
    };
    return typeMap[type];
  };

  // 获取项目类型颜色
  const getProjectTypeColor = (type: ProjectType) => {
    const colorMap = {
      [ProjectType.PRODUCT_REGISTRATION]: 'blue',
      [ProjectType.RESEARCH_SERVICE]: 'green',
      [ProjectType.CLINICAL_DETECTION]: 'orange'
    };
    return colorMap[type];
  };

  // 处理新增模板
  const handleAddTemplate = () => {
    setEditingTemplate(null);
    form.resetFields();
    setModalVisible(true);
  };

  // 处理编辑模板
  const handleEditTemplate = (template: ProjectTemplate) => {
    setEditingTemplate(template);
    form.setFieldsValue(template);
    setModalVisible(true);
  };

  // 处理复制模板
  const handleCopyTemplate = async (template: ProjectTemplate) => {
    try {
      const newTemplate: ProjectTemplate = {
        ...template,
        id: Date.now().toString(),
        name: `${template.name} - 副本`,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      setTemplates([...templates, newTemplate]);
      message.success('模板复制成功');
    } catch (error) {
      message.error('复制模板失败');
    }
  };

  // 处理删除模板
  const handleDeleteTemplate = async (id: string) => {
    try {
      // 模拟API调用
      await new Promise(resolve => setTimeout(resolve, 500));
      setTemplates(templates.filter(t => t.id !== id));
      message.success('模板删除成功');
    } catch (error) {
      message.error('删除模板失败');
    }
  };

  // 处理应用模板
  const handleApplyTemplate = (template: ProjectTemplate) => {
    if (onSelectTemplate) {
      onSelectTemplate(template);
      message.success(`已应用模板：${template.name}`);
      if (onClose) {
        onClose();
      }
    }
  };

  // 处理表单提交
  const handleSubmit = async (values: any) => {
    try {
      setLoading(true);
      
      // 模拟API调用
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      if (editingTemplate) {
        // 更新模板
        const updatedTemplate = {
          ...editingTemplate,
          ...values,
          updatedAt: new Date().toISOString()
        };
        setTemplates(templates.map(t => t.id === editingTemplate.id ? updatedTemplate : t));
        message.success('模板更新成功');
      } else {
        // 新增模板
        const newTemplate: ProjectTemplate = {
          id: Date.now().toString(),
          ...values,
          defaultStages: [],
          defaultCenterTypes: [],
          createdBy: 'current_user',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
        setTemplates([...templates, newTemplate]);
        message.success('模板创建成功');
      }

      setModalVisible(false);
      form.resetFields();
    } catch (error) {
      message.error('操作失败');
    } finally {
      setLoading(false);
    }
  };

  // 表格列定义
  const columns: ColumnsType<ProjectTemplate> = [
    {
      title: '模板信息',
      key: 'templateInfo',
      width: 300,
      render: (_, record) => (
        <div>
          <div style={{ display: 'flex', alignItems: 'center', marginBottom: 4 }}>
            {getProjectTypeIcon(record.type)}
            <span style={{ fontWeight: 500, marginLeft: 8 }}>
              {record.name}
            </span>
          </div>
          <div style={{ fontSize: '12px', color: '#666', marginBottom: 4 }}>
            {record.description}
          </div>
          <Tag color={getProjectTypeColor(record.type)}>
            {getProjectTypeText(record.type)}
          </Tag>
        </div>
      )
    },
    {
      title: '配置信息',
      key: 'settings',
      width: 200,
      render: (_, record) => (
        <div>
          <div style={{ fontSize: '12px', marginBottom: 2 }}>
            阶段数: {record.defaultStages?.length || 0}
          </div>
          <div style={{ fontSize: '12px', marginBottom: 2 }}>
            中心类型: {record.defaultCenterTypes?.length || 0}
          </div>
          <div style={{ fontSize: '12px', marginBottom: 2 }}>
            预计周期: {record.estimatedDuration || 0} 天
          </div>
          <div style={{ fontSize: '12px' }}>
            多中心: {record.isMultiCenter ? '是' : '否'}
          </div>
        </div>
      )
    },
    {
      title: '状态',
      dataIndex: 'isActive',
      key: 'isActive',
      width: 80,
      render: (isActive: boolean) => (
        <Tag color={isActive ? 'success' : 'default'}>
          {isActive ? '启用' : '禁用'}
        </Tag>
      )
    },
    {
      title: '创建时间',
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: 120,
      render: (createdAt: string) => (
        <span style={{ fontSize: '12px' }}>
          {new Date(createdAt).toLocaleDateString()}
        </span>
      )
    },
    {
      title: '操作',
      key: 'action',
      width: 200,
      fixed: 'right',
      render: (_, record) => (
        <Space size="small">
          {onSelectTemplate && (
            <Tooltip title="应用模板">
              <Button
                type="primary"
                size="small"
                icon={<CheckCircleOutlined />}
                onClick={() => handleApplyTemplate(record)}
              >
                应用
              </Button>
            </Tooltip>
          )}
          <Tooltip title="编辑">
            <Button
              type="text"
              icon={<EditOutlined />}
              onClick={() => handleEditTemplate(record)}
            />
          </Tooltip>
          <Tooltip title="复制">
            <Button
              type="text"
              icon={<CopyOutlined />}
              onClick={() => handleCopyTemplate(record)}
            />
          </Tooltip>
          <Popconfirm
            title="确定要删除这个模板吗？"
            onConfirm={() => handleDeleteTemplate(record.id)}
            okText="确定"
            cancelText="取消"
          >
            <Tooltip title="删除">
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
  ];

  const content = (
    <div>
      <Card 
        title="项目模板管理"
        extra={
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={handleAddTemplate}
          >
            新建模板
          </Button>
        }
      >
        <Table
          columns={columns}
          dataSource={templates}
          rowKey="id"
          loading={loading}
          scroll={{ x: 1000 }}
          pagination={{
            total: templates.length,
            pageSize: 10,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total) => `共 ${total} 条记录`
          }}
        />
      </Card>

      {/* 新增/编辑模板模态框 */}
      <Modal
        title={editingTemplate ? '编辑模板' : '新建模板'}
        open={modalVisible}
        onCancel={() => {
          setModalVisible(false);
          form.resetFields();
        }}
        footer={null}
        width={800}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
        >
          <Tabs activeKey={activeTab} onChange={setActiveTab}>
            <TabPane tab="基本信息" key="basic">
              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item
                    name="name"
                    label="模板名称"
                    rules={[{ required: true, message: '请输入模板名称' }]}
                  >
                    <Input placeholder="请输入模板名称" />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item
                    name="type"
                    label="项目类型"
                    rules={[{ required: true, message: '请选择项目类型' }]}
                  >
                    <Select placeholder="请选择项目类型">
                      <Option value={ProjectType.PRODUCT_REGISTRATION}>产品注册</Option>
                      <Option value={ProjectType.RESEARCH_SERVICE}>科研服务</Option>
                      <Option value={ProjectType.CLINICAL_DETECTION}>临床检测</Option>
                    </Select>
                  </Form.Item>
                </Col>
              </Row>

              <Form.Item
                name="description"
                label="模板描述"
                rules={[{ required: true, message: '请输入模板描述' }]}
              >
                <TextArea rows={3} placeholder="请输入模板描述" />
              </Form.Item>

              <Row gutter={16}>
                <Col span={8}>
                  <Form.Item
                    name="estimatedDuration"
                    label="预计周期（天）"
                  >
                    <Input type="number" placeholder="请输入预计周期" />
                  </Form.Item>
                </Col>
                <Col span={8}>
                  <Form.Item
                    name="isActive"
                    label="启用状态"
                    valuePropName="checked"
                  >
                    <Switch />
                  </Form.Item>
                </Col>
              </Row>

              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item
                    name="isMultiCenter"
                    label="支持多中心"
                    valuePropName="checked"
                  >
                    <Switch />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item
                    name="isMultiStage"
                    label="支持多阶段"
                    valuePropName="checked"
                  >
                    <Switch />
                  </Form.Item>
                </Col>
              </Row>
            </TabPane>

            <TabPane tab="阶段配置" key="stages">
              <div style={{ textAlign: 'center', padding: '40px 0', color: '#999' }}>
                <SettingOutlined style={{ fontSize: '48px', marginBottom: '16px' }} />
                <div>阶段配置功能开发中...</div>
                <div style={{ fontSize: '12px', marginTop: '8px' }}>
                  保存模板后可在项目中配置具体阶段
                </div>
              </div>
            </TabPane>

            <TabPane tab="中心配置" key="centers">
              <div style={{ textAlign: 'center', padding: '40px 0', color: '#999' }}>
                <SettingOutlined style={{ fontSize: '48px', marginBottom: '16px' }} />
                <div>中心配置功能开发中...</div>
                <div style={{ fontSize: '12px', marginTop: '8px' }}>
                  保存模板后可在项目中配置具体中心
                </div>
              </div>
            </TabPane>
          </Tabs>

          <Form.Item style={{ textAlign: 'right', marginTop: 24, marginBottom: 0 }}>
            <Space>
              <Button onClick={() => setModalVisible(false)}>
                取消
              </Button>
              <Button type="primary" htmlType="submit" loading={loading}>
                {editingTemplate ? '更新' : '创建'}
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );

  // 如果是模态框模式
  if (modal) {
    return (
      <Modal
        title="选择项目模板"
        open={visible}
        onCancel={onClose}
        footer={null}
        width={1200}
      >
        {content}
      </Modal>
    );
  }

  // 普通模式
  return content;
};

export default ProjectTemplateManager;