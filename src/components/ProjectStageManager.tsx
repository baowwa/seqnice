import React, { useState, useEffect } from 'react';
import {
  Card,
  Table,
  Button,
  Modal,
  Form,
  Input,
  Select,
  Space,
  Tag,
  message,
  Popconfirm,
  Row,
  Col,
  Typography,
  Divider,
  Progress,
  Timeline,
  Drawer,
  InputNumber,
  DatePicker,
  Tooltip
} from 'antd';
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  PlayCircleOutlined,
  PauseCircleOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  ExclamationCircleOutlined,
  EyeOutlined,
  SettingOutlined,
  ArrowRightOutlined
} from '@ant-design/icons';
import { ProjectStage, StageStatus, StageDetectionTask, TaskStatus, StageCenterAssignment } from '../types';
import dayjs from 'dayjs';

const { Option } = Select;
const { TextArea } = Input;
const { Title, Text } = Typography;
const { RangePicker } = DatePicker;

/**
 * 项目阶段管理组件接口
 */
interface ProjectStageManagerProps {
  projectId: string;
  stages: ProjectStage[];
  onStagesChange: (stages: ProjectStage[]) => void;
  readonly?: boolean;
  isMultiCenter?: boolean;
  centers?: any[];
  onStageTransition?: (currentStage: ProjectStage, targetStage: ProjectStage) => void;
}

/**
 * 项目阶段管理组件
 * 负责管理项目的多阶段配置，包括阶段创建、任务分配和进度跟踪
 */
const ProjectStageManager: React.FC<ProjectStageManagerProps> = ({
  projectId,
  stages,
  onStagesChange,
  readonly = false,
  isMultiCenter = false,
  centers = [],
  onStageTransition
}) => {
  const [modalVisible, setModalVisible] = useState(false);
  const [taskDrawerVisible, setTaskDrawerVisible] = useState(false);
  const [editingStage, setEditingStage] = useState<ProjectStage | null>(null);
  const [selectedStage, setSelectedStage] = useState<ProjectStage | null>(null);
  const [form] = Form.useForm();
  const [taskForm] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [tasks, setTasks] = useState<StageDetectionTask[]>([]);
  const [assignments, setAssignments] = useState<StageCenterAssignment[]>([]);

  // 获取阶段状态显示文本
  const getStageStatusText = (status: StageStatus) => {
    const statusMap = {
      [StageStatus.NOT_STARTED]: '未开始',
      [StageStatus.IN_PROGRESS]: '进行中',
      [StageStatus.COMPLETED]: '已完成',
      [StageStatus.BLOCKED]: '阻塞'
    };
    return statusMap[status];
  };

  // 获取阶段状态颜色
  const getStageStatusColor = (status: StageStatus) => {
    const colorMap = {
      [StageStatus.NOT_STARTED]: 'default',
      [StageStatus.IN_PROGRESS]: 'processing',
      [StageStatus.COMPLETED]: 'success',
      [StageStatus.BLOCKED]: 'error'
    };
    return colorMap[status];
  };

  // 获取阶段状态图标
  const getStageStatusIcon = (status: StageStatus) => {
    const iconMap = {
      [StageStatus.NOT_STARTED]: <ClockCircleOutlined />,
      [StageStatus.IN_PROGRESS]: <PlayCircleOutlined />,
      [StageStatus.COMPLETED]: <CheckCircleOutlined />,
      [StageStatus.BLOCKED]: <ExclamationCircleOutlined />
    };
    return iconMap[status];
  };

  // 计算阶段进度
  const calculateStageProgress = (stage: ProjectStage) => {
    if (stage.status === StageStatus.COMPLETED) return 100;
    if (stage.status === StageStatus.NOT_STARTED) return 0;
    
    // 基于任务完成情况计算进度
    const stageTasks = tasks.filter(t => t.stageId === stage.id);
    if (stageTasks.length === 0) return 0;
    
    const completedTasks = stageTasks.filter(t => t.status === TaskStatus.COMPLETED);
    return Math.round((completedTasks.length / stageTasks.length) * 100);
  };

  // 表格列定义
  const columns = [
    {
      title: '阶段顺序',
      dataIndex: 'order',
      key: 'order',
      width: 80,
      sorter: (a: ProjectStage, b: ProjectStage) => a.order - b.order,
      render: (order: number) => (
        <div style={{ 
          width: 32, 
          height: 32, 
          borderRadius: '50%', 
          backgroundColor: '#1890ff', 
          color: 'white',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontWeight: 'bold'
        }}>
          {order}
        </div>
      )
    },
    {
      title: '阶段名称',
      dataIndex: 'name',
      key: 'name',
      width: 200,
      render: (text: string, record: ProjectStage) => (
        <div>
          <div style={{ fontWeight: 500, marginBottom: 4 }}>{text}</div>
          <Text type="secondary" style={{ fontSize: '12px' }}>
            {record.description}
          </Text>
        </div>
      )
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 120,
      render: (status: StageStatus, record: ProjectStage) => (
        <div>
          <Tag 
            color={getStageStatusColor(status)} 
            icon={getStageStatusIcon(status)}
          >
            {getStageStatusText(status)}
          </Tag>
          <div style={{ marginTop: 4 }}>
            <Progress 
              percent={calculateStageProgress(record)} 
              size="small" 
              showInfo={false}
            />
          </div>
        </div>
      )
    },
    {
      title: '时间安排',
      key: 'timeline',
      width: 200,
      render: (_, record: ProjectStage) => (
        <div>
          <div style={{ fontSize: '12px', color: '#666' }}>
            预计: {record.estimatedDuration} 天
          </div>
          {record.actualDuration && (
            <div style={{ fontSize: '12px', color: '#666' }}>
              实际: {record.actualDuration} 天
            </div>
          )}
          {record.startDate && (
            <div style={{ fontSize: '12px', color: '#666' }}>
              开始: {dayjs(record.startDate).format('MM-DD')}
            </div>
          )}
          {record.endDate && (
            <div style={{ fontSize: '12px', color: '#666' }}>
              结束: {dayjs(record.endDate).format('MM-DD')}
            </div>
          )}
        </div>
      )
    },
    {
      title: '交付物',
      dataIndex: 'deliverables',
      key: 'deliverables',
      width: 200,
      render: (deliverables: string[]) => (
        <div>
          {deliverables.slice(0, 2).map((item, index) => (
            <Tag key={index} size="small" style={{ marginBottom: 2 }}>
              {item}
            </Tag>
          ))}
          {deliverables.length > 2 && (
            <Tag size="small" style={{ marginBottom: 2 }}>
              +{deliverables.length - 2}
            </Tag>
          )}
        </div>
      )
    }
  ];

  // 如果不是只读模式，添加操作列
  if (!readonly) {
    columns.push({
      title: '操作',
      key: 'action',
      width: 150,
      fixed: 'right',
      render: (_, record: ProjectStage) => (
        <Space size="small">
          <Tooltip title="查看任务">
            <Button
              type="text"
              icon={<EyeOutlined />}
              onClick={() => handleViewTasks(record)}
              size="small"
            />
          </Tooltip>
          <Tooltip title="编辑阶段">
            <Button
              type="text"
              icon={<EditOutlined />}
              onClick={() => handleEditStage(record)}
              size="small"
            />
          </Tooltip>
          <Tooltip title="阶段配置">
            <Button
              type="text"
              icon={<SettingOutlined />}
              onClick={() => handleStageConfig(record)}
              size="small"
            />
          </Tooltip>
          {onStageTransition && (
            <Tooltip title="阶段转换">
              <Button
                type="text"
                icon={<ArrowRightOutlined />}
                onClick={() => handleStageTransition(record)}
                size="small"
              />
            </Tooltip>
          )}
          <Popconfirm
            title="确定要删除这个阶段吗？"
            onConfirm={() => handleDeleteStage(record.id)}
            okText="确定"
            cancelText="取消"
          >
            <Button
              type="text"
              icon={<DeleteOutlined />}
              danger
              size="small"
            />
          </Popconfirm>
        </Space>
      )
    } as any);
  }

  // 处理新增阶段
  const handleAddStage = () => {
    setEditingStage(null);
    form.resetFields();
    // 设置默认顺序为最后一个
    const maxOrder = Math.max(...stages.map(s => s.order), 0);
    form.setFieldsValue({ order: maxOrder + 1 });
    setModalVisible(true);
  };

  // 处理编辑阶段
  const handleEditStage = (stage: ProjectStage) => {
    setEditingStage(stage);
    form.setFieldsValue({
      ...stage,
      dateRange: stage.startDate && stage.endDate ? 
        [dayjs(stage.startDate), dayjs(stage.endDate)] : undefined,
      prerequisites: stage.prerequisites || [],
      deliverables: stage.deliverables || []
    });
    setModalVisible(true);
  };

  // 处理查看任务
  const handleViewTasks = (stage: ProjectStage) => {
    setSelectedStage(stage);
    // 模拟获取阶段任务
    const stageTasks: StageDetectionTask[] = [
      {
        id: '1',
        stageId: stage.id,
        centerId: 'center1',
        taskName: '样本预处理',
        taskType: 'preprocessing',
        description: '对样本进行预处理操作',
        status: TaskStatus.COMPLETED,
        priority: 'high',
        assignedTo: 'user1',
        estimatedHours: 8,
        actualHours: 7,
        startDate: '2024-01-15',
        endDate: '2024-01-15',
        completionRate: 100,
        sampleCount: 50,
        completedSamples: 50,
        qualityScore: 95,
        notes: '任务完成质量良好',
        createdAt: '2024-01-10T10:00:00Z',
        updatedAt: '2024-01-15T18:00:00Z'
      },
      {
        id: '2',
        stageId: stage.id,
        centerId: 'center1',
        taskName: '质量检测',
        taskType: 'quality_control',
        description: '对处理后的样本进行质量检测',
        status: TaskStatus.IN_PROGRESS,
        priority: 'medium',
        assignedTo: 'user2',
        estimatedHours: 4,
        actualHours: 2,
        startDate: '2024-01-16',
        completionRate: 60,
        sampleCount: 50,
        completedSamples: 30,
        notes: '进展顺利',
        createdAt: '2024-01-10T10:00:00Z',
        updatedAt: '2024-01-16T15:00:00Z'
      }
    ];
    setTasks(stageTasks);
    setTaskDrawerVisible(true);
  };

  // 处理阶段配置
  const handleStageConfig = (stage: ProjectStage) => {
    // 这里可以打开阶段配置的详细界面
    message.info('阶段配置功能开发中...');
  };

  // 处理阶段转换
  const handleStageTransition = (currentStage: ProjectStage) => {
    // 获取可转换的目标阶段（通常是下一个阶段）
    const currentIndex = stages.findIndex(s => s.id === currentStage.id);
    if (currentIndex < stages.length - 1) {
      const targetStage = stages[currentIndex + 1];
      onStageTransition?.(currentStage, targetStage);
    } else {
      message.info('当前已是最后一个阶段');
    }
  };

  // 处理删除阶段
  const handleDeleteStage = (stageId: string) => {
    const updatedStages = stages.filter(s => s.id !== stageId);
    onStagesChange(updatedStages);
    message.success('阶段删除成功');
  };

  // 处理表单提交
  const handleSubmit = async (values: any) => {
    try {
      setLoading(true);

      const stageData: ProjectStage = {
        id: editingStage?.id || Date.now().toString(),
        projectId,
        name: values.name,
        description: values.description,
        order: values.order,
        status: values.status || StageStatus.NOT_STARTED,
        startDate: values.dateRange?.[0]?.toISOString(),
        endDate: values.dateRange?.[1]?.toISOString(),
        estimatedDuration: values.estimatedDuration,
        actualDuration: editingStage?.actualDuration,
        prerequisites: values.prerequisites || [],
        deliverables: values.deliverables || [],
        isActive: values.isActive ?? true,
        createdAt: editingStage?.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      let updatedStages: ProjectStage[];
      if (editingStage) {
        // 更新现有阶段
        updatedStages = stages.map(s => s.id === editingStage.id ? stageData : s);
        message.success('阶段更新成功');
      } else {
        // 新增阶段
        updatedStages = [...stages, stageData];
        message.success('阶段添加成功');
      }

      // 按顺序排序
      updatedStages.sort((a, b) => a.order - b.order);
      onStagesChange(updatedStages);
      setModalVisible(false);
      form.resetFields();
    } catch (error) {
      message.error('操作失败');
    } finally {
      setLoading(false);
    }
  };

  // 获取统计信息
  const getStatistics = () => {
    const notStarted = stages.filter(s => s.status === StageStatus.NOT_STARTED);
    const inProgress = stages.filter(s => s.status === StageStatus.IN_PROGRESS);
    const completed = stages.filter(s => s.status === StageStatus.COMPLETED);
    const blocked = stages.filter(s => s.status === StageStatus.BLOCKED);

    return {
      total: stages.length,
      notStarted: notStarted.length,
      inProgress: inProgress.length,
      completed: completed.length,
      blocked: blocked.length
    };
  };

  const statistics = getStatistics();

  return (
    <div>
      {/* 统计信息 */}
      <Row gutter={16} style={{ marginBottom: 16 }}>
        <Col span={6}>
          <Card size="small">
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#1890ff' }}>
                {statistics.total}
              </div>
              <div style={{ color: '#666' }}>总阶段数</div>
            </div>
          </Card>
        </Col>
        <Col span={6}>
          <Card size="small">
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#faad14' }}>
                {statistics.inProgress}
              </div>
              <div style={{ color: '#666' }}>进行中</div>
            </div>
          </Card>
        </Col>
        <Col span={6}>
          <Card size="small">
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#52c41a' }}>
                {statistics.completed}
              </div>
              <div style={{ color: '#666' }}>已完成</div>
            </div>
          </Card>
        </Col>
        <Col span={6}>
          <Card size="small">
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#f5222d' }}>
                {statistics.blocked}
              </div>
              <div style={{ color: '#666' }}>阻塞</div>
            </div>
          </Card>
        </Col>
      </Row>

      {/* 阶段时间线 */}
      {stages.length > 0 && (
        <Card title="阶段时间线" style={{ marginBottom: 16 }}>
          <Timeline>
            {stages
              .sort((a, b) => a.order - b.order)
              .map((stage) => (
                <Timeline.Item
                  key={stage.id}
                  color={getStageStatusColor(stage.status)}
                  dot={getStageStatusIcon(stage.status)}
                >
                  <div>
                    <div style={{ fontWeight: 500 }}>{stage.name}</div>
                    <div style={{ color: '#666', fontSize: '12px' }}>
                      {stage.description}
                    </div>
                    <div style={{ marginTop: 4 }}>
                      <Tag color={getStageStatusColor(stage.status)} size="small">
                        {getStageStatusText(stage.status)}
                      </Tag>
                      <span style={{ marginLeft: 8, fontSize: '12px', color: '#666' }}>
                        预计 {stage.estimatedDuration} 天
                      </span>
                    </div>
                  </div>
                </Timeline.Item>
              ))}
          </Timeline>
        </Card>
      )}

      {/* 阶段列表 */}
      <Card
        title="项目阶段管理"
        extra={
          !readonly && (
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={handleAddStage}
            >
              添加阶段
            </Button>
          )
        }
      >
        <Table
          columns={columns}
          dataSource={stages}
          rowKey="id"
          scroll={{ x: 1200 }}
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total) => `共 ${total} 个阶段`
          }}
        />
      </Card>

      {/* 新增/编辑阶段模态框 */}
      <Modal
        title={editingStage ? '编辑阶段' : '添加阶段'}
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
          <Row gutter={16}>
            <Col span={16}>
              <Form.Item
                name="name"
                label="阶段名称"
                rules={[{ required: true, message: '请输入阶段名称' }]}
              >
                <Input placeholder="请输入阶段名称" />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                name="order"
                label="阶段顺序"
                rules={[{ required: true, message: '请输入阶段顺序' }]}
              >
                <InputNumber min={1} placeholder="阶段顺序" style={{ width: '100%' }} />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            name="description"
            label="阶段描述"
            rules={[{ required: true, message: '请输入阶段描述' }]}
          >
            <TextArea rows={3} placeholder="请输入阶段描述" />
          </Form.Item>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="estimatedDuration"
                label="预计持续天数"
                rules={[{ required: true, message: '请输入预计持续天数' }]}
              >
                <InputNumber min={1} placeholder="预计持续天数" style={{ width: '100%' }} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="status"
                label="阶段状态"
              >
                <Select placeholder="请选择阶段状态">
                  <Option value={StageStatus.NOT_STARTED}>未开始</Option>
                  <Option value={StageStatus.IN_PROGRESS}>进行中</Option>
                  <Option value={StageStatus.COMPLETED}>已完成</Option>
                  <Option value={StageStatus.BLOCKED}>阻塞</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            name="dateRange"
            label="计划时间"
          >
            <RangePicker style={{ width: '100%' }} />
          </Form.Item>

          <Form.Item
            name="prerequisites"
            label="前置条件"
          >
            <Select
              mode="tags"
              placeholder="请输入前置条件"
              style={{ width: '100%' }}
            />
          </Form.Item>

          <Form.Item
            name="deliverables"
            label="交付物"
            rules={[{ required: true, message: '请输入交付物' }]}
          >
            <Select
              mode="tags"
              placeholder="请输入交付物"
              style={{ width: '100%' }}
            >
              <Option value="样本处理报告">样本处理报告</Option>
              <Option value="质量控制报告">质量控制报告</Option>
              <Option value="检测数据">检测数据</Option>
              <Option value="分析结果">分析结果</Option>
              <Option value="阶段总结">阶段总结</Option>
            </Select>
          </Form.Item>

          <Form.Item style={{ textAlign: 'right', marginBottom: 0 }}>
            <Space>
              <Button onClick={() => setModalVisible(false)}>
                取消
              </Button>
              <Button type="primary" htmlType="submit" loading={loading}>
                {editingStage ? '更新' : '添加'}
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>

      {/* 阶段任务抽屉 */}
      <Drawer
        title={`${selectedStage?.name} - 任务管理`}
        placement="right"
        width={800}
        open={taskDrawerVisible}
        onClose={() => setTaskDrawerVisible(false)}
      >
        {selectedStage && (
          <div>
            <Card size="small" style={{ marginBottom: 16 }}>
              <Row gutter={16}>
                <Col span={12}>
                  <div>
                    <div style={{ color: '#666', fontSize: '12px' }}>阶段状态</div>
                    <Tag color={getStageStatusColor(selectedStage.status)}>
                      {getStageStatusText(selectedStage.status)}
                    </Tag>
                  </div>
                </Col>
                <Col span={12}>
                  <div>
                    <div style={{ color: '#666', fontSize: '12px' }}>完成进度</div>
                    <Progress percent={calculateStageProgress(selectedStage)} size="small" />
                  </div>
                </Col>
              </Row>
            </Card>

            <Table
              dataSource={tasks}
              rowKey="id"
              size="small"
              pagination={false}
              columns={[
                {
                  title: '任务名称',
                  dataIndex: 'taskName',
                  key: 'taskName'
                },
                {
                  title: '状态',
                  dataIndex: 'status',
                  key: 'status',
                  render: (status: TaskStatus) => (
                    <Tag color={status === TaskStatus.COMPLETED ? 'green' : 'blue'}>
                      {status === TaskStatus.COMPLETED ? '已完成' : '进行中'}
                    </Tag>
                  )
                },
                {
                  title: '进度',
                  dataIndex: 'completionRate',
                  key: 'completionRate',
                  render: (rate: number) => (
                    <Progress percent={rate} size="small" />
                  )
                },
                {
                  title: '样本进度',
                  key: 'sampleProgress',
                  render: (_, record: StageDetectionTask) => (
                    <span>{record.completedSamples}/{record.sampleCount}</span>
                  )
                }
              ]}
            />
          </div>
        )}
      </Drawer>
    </div>
  );
};

export default ProjectStageManager;