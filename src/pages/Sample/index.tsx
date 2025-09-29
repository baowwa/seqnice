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
  DatePicker,
  Tag,
  Popconfirm,
  message,
  Row,
  Col,
  Statistic,
  Upload,
  QRCode,
  Tooltip,
  Divider,
  Badge,
  Steps,
  Progress
} from 'antd';
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  EyeOutlined,
  QrcodeOutlined,
  UploadOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  ExclamationCircleOutlined,
  PrinterOutlined,
  ScanOutlined
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import type { Sample, SampleStatus, Project, SampleType } from '../../types';
import dayjs from 'dayjs';

const { Option } = Select;
const { TextArea } = Input;
const { Step } = Steps;

/**
 * 样本接收组件
 * 负责样本登记、条码管理、质检等功能
 */
const SampleReceiving: React.FC = () => {
  // 状态管理
  const [samples, setSamples] = useState<Sample[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [sampleTypes, setSampleTypes] = useState<SampleType[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [barcodeModalVisible, setBarcodeModalVisible] = useState(false);
  const [editingSample, setEditingSample] = useState<Sample | null>(null);
  const [selectedSample, setSelectedSample] = useState<Sample | null>(null);
  const [form] = Form.useForm();
  const [searchText, setSearchText] = useState('');
  const [statusFilter, setStatusFilter] = useState<SampleStatus | ''>('');
  const [projectFilter, setProjectFilter] = useState<string>('');

  // 模拟API调用 - 获取样本列表
  const fetchSamples = async () => {
    setLoading(true);
    try {
      // 模拟API延迟
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const mockSamples: Sample[] = [
        {
          id: '1',
          code: 'S001',
          barcode: 'BC001234567890',
          name: '肠道菌群样本-患者001',
          projectId: '1',
          projectName: '肠道菌群多样性分析项目',
          sampleTypeId: '1',
          sampleTypeName: '粪便样本',
          status: 'received',
          priority: 'high',
          receivedDate: '2024-01-15',
          expectedDate: '2024-01-20',
          volume: 5.0,
          concentration: 120.5,
          purity: 1.85,
          qualityScore: 95,
          storageLocation: 'A1-01-001',
          temperature: -80,
          receiverId: '1',
          receiverName: '张三',
          notes: '样本状态良好，无异常',
          qcPassed: true,
          createdAt: '2024-01-15T09:00:00Z',
          updatedAt: '2024-01-15T10:30:00Z'
        },
        {
          id: '2',
          code: 'S002',
          barcode: 'BC001234567891',
          name: '土壤微生物样本-地点A',
          projectId: '2',
          projectName: '土壤微生物群落结构研究',
          sampleTypeId: '2',
          sampleTypeName: '土壤样本',
          status: 'processing',
          priority: 'medium',
          receivedDate: '2024-02-01',
          expectedDate: '2024-02-05',
          volume: 10.0,
          concentration: 85.2,
          purity: 1.65,
          qualityScore: 88,
          storageLocation: 'B2-02-015',
          temperature: -20,
          receiverId: '2',
          receiverName: '李四',
          notes: '需要进一步纯化处理',
          qcPassed: false,
          createdAt: '2024-02-01T14:00:00Z',
          updatedAt: '2024-02-02T11:15:00Z'
        },
        {
          id: '3',
          code: 'S003',
          barcode: 'BC001234567892',
          name: '海水微生物样本-深海001',
          projectId: '3',
          projectName: '海洋微生物基因组测序',
          sampleTypeId: '3',
          sampleTypeName: '水体样本',
          status: 'completed',
          priority: 'high',
          receivedDate: '2023-10-15',
          expectedDate: '2023-10-20',
          volume: 50.0,
          concentration: 200.8,
          purity: 1.95,
          qualityScore: 98,
          storageLocation: 'C3-01-008',
          temperature: -80,
          receiverId: '1',
          receiverName: '张三',
          notes: '优质样本，测序结果优异',
          qcPassed: true,
          createdAt: '2023-10-15T08:30:00Z',
          updatedAt: '2023-12-31T16:45:00Z'
        }
      ];
      
      setSamples(mockSamples);
    } catch (error) {
      message.error('获取样本列表失败');
    } finally {
      setLoading(false);
    }
  };

  // 模拟API调用 - 获取项目列表
  const fetchProjects = async () => {
    const mockProjects: Project[] = [
      { id: '1', name: '肠道菌群多样性分析项目', code: 'PRJ001', customerId: '1', customerName: '北京大学医学院', description: '', status: 'in_progress', priority: 'high', startDate: '2024-01-15', endDate: '2024-03-15', estimatedDays: 60, actualDays: 45, progress: 75, managerId: '1', managerName: '张三', createdAt: '', updatedAt: '' },
      { id: '2', name: '土壤微生物群落结构研究', code: 'PRJ002', customerId: '2', customerName: '中科院生态环境研究中心', description: '', status: 'planning', priority: 'medium', startDate: '2024-03-01', endDate: '2024-05-01', estimatedDays: 60, actualDays: 0, progress: 10, managerId: '2', managerName: '李四', createdAt: '', updatedAt: '' },
      { id: '3', name: '海洋微生物基因组测序', code: 'PRJ003', customerId: '3', customerName: '青岛海洋大学', description: '', status: 'completed', priority: 'high', startDate: '2023-10-01', endDate: '2023-12-31', estimatedDays: 90, actualDays: 85, progress: 100, managerId: '1', managerName: '张三', createdAt: '', updatedAt: '' }
    ];
    setProjects(mockProjects);
  };

  // 模拟API调用 - 获取样本类型列表
  const fetchSampleTypes = async () => {
    const mockSampleTypes: SampleType[] = [
      { id: '1', name: '粪便样本', code: 'FECES', category: 'biological', description: '人体或动物粪便样本', storageCondition: '-80°C冷冻保存', processingTime: 24, isActive: true, createdAt: '', updatedAt: '' },
      { id: '2', name: '土壤样本', code: 'SOIL', category: 'environmental', description: '各类土壤环境样本', storageCondition: '-20°C冷冻保存', processingTime: 48, isActive: true, createdAt: '', updatedAt: '' },
      { id: '3', name: '水体样本', code: 'WATER', category: 'environmental', description: '海水、淡水等水体样本', storageCondition: '-80°C冷冻保存', processingTime: 12, isActive: true, createdAt: '', updatedAt: '' }
    ];
    setSampleTypes(mockSampleTypes);
  };

  // 组件挂载时获取数据
  useEffect(() => {
    fetchSamples();
    fetchProjects();
    fetchSampleTypes();
  }, []);

  // 样本状态标签颜色映射
  const getStatusColor = (status: SampleStatus) => {
    const colorMap = {
      received: 'blue',
      processing: 'orange',
      completed: 'green',
      failed: 'red',
      on_hold: 'gray'
    };
    return colorMap[status];
  };

  // 样本状态文本映射
  const getStatusText = (status: SampleStatus) => {
    const textMap = {
      received: '已接收',
      processing: '处理中',
      completed: '已完成',
      failed: '失败',
      on_hold: '暂停'
    };
    return textMap[status];
  };

  // 优先级标签颜色映射
  const getPriorityColor = (priority: string) => {
    const colorMap = {
      high: 'red',
      medium: 'orange',
      low: 'green'
    };
    return colorMap[priority as keyof typeof colorMap];
  };

  // 优先级文本映射
  const getPriorityText = (priority: string) => {
    const textMap = {
      high: '高',
      medium: '中',
      low: '低'
    };
    return textMap[priority as keyof typeof textMap];
  };

  // 质检状态图标
  const getQCIcon = (qcPassed: boolean) => {
    return qcPassed ? 
      <CheckCircleOutlined style={{ color: '#52c41a' }} /> : 
      <ExclamationCircleOutlined style={{ color: '#f5222d' }} />;
  };

  // 表格列定义
  const columns: ColumnsType<Sample> = [
    {
      title: '样本编号',
      dataIndex: 'code',
      key: 'code',
      width: 120,
      fixed: 'left'
    },
    {
      title: '条码',
      dataIndex: 'barcode',
      key: 'barcode',
      width: 150,
      render: (barcode: string, record) => (
        <Space>
          <span>{barcode}</span>
          <Tooltip title="查看条码">
            <Button
              type="text"
              size="small"
              icon={<QrcodeOutlined />}
              onClick={() => handleViewBarcode(record)}
            />
          </Tooltip>
        </Space>
      )
    },
    {
      title: '样本名称',
      dataIndex: 'name',
      key: 'name',
      width: 200,
      ellipsis: {
        showTitle: false
      },
      render: (text) => (
        <Tooltip placement="topLeft" title={text}>
          {text}
        </Tooltip>
      )
    },
    {
      title: '项目',
      dataIndex: 'projectName',
      key: 'projectName',
      width: 180,
      ellipsis: true
    },
    {
      title: '样本类型',
      dataIndex: 'sampleTypeName',
      key: 'sampleTypeName',
      width: 120
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: (status: SampleStatus) => (
        <Tag color={getStatusColor(status)}>
          {getStatusText(status)}
        </Tag>
      )
    },
    {
      title: '优先级',
      dataIndex: 'priority',
      key: 'priority',
      width: 80,
      render: (priority: string) => (
        <Tag color={getPriorityColor(priority)}>
          {getPriorityText(priority)}
        </Tag>
      )
    },
    {
      title: '质检',
      dataIndex: 'qcPassed',
      key: 'qcPassed',
      width: 60,
      render: (qcPassed: boolean) => (
        <Tooltip title={qcPassed ? '质检通过' : '质检未通过'}>
          {getQCIcon(qcPassed)}
        </Tooltip>
      )
    },
    {
      title: '质量评分',
      dataIndex: 'qualityScore',
      key: 'qualityScore',
      width: 100,
      render: (score: number) => (
        <Progress 
          percent={score} 
          size="small" 
          status={score >= 90 ? 'success' : score >= 70 ? 'active' : 'exception'}
          format={(percent) => `${percent}`}
        />
      )
    },
    {
      title: '存储位置',
      dataIndex: 'storageLocation',
      key: 'storageLocation',
      width: 120
    },
    {
      title: '接收日期',
      dataIndex: 'receivedDate',
      key: 'receivedDate',
      width: 110,
      render: (date: string) => dayjs(date).format('YYYY-MM-DD')
    },
    {
      title: '接收人',
      dataIndex: 'receiverName',
      key: 'receiverName',
      width: 100
    },
    {
      title: '操作',
      key: 'action',
      width: 150,
      fixed: 'right',
      render: (_, record) => (
        <Space size="small">
          <Tooltip title="查看详情">
            <Button
              type="text"
              icon={<EyeOutlined />}
              onClick={() => handleViewSample(record)}
            />
          </Tooltip>
          <Tooltip title="编辑">
            <Button
              type="text"
              icon={<EditOutlined />}
              onClick={() => handleEditSample(record)}
            />
          </Tooltip>
          <Tooltip title="打印条码">
            <Button
              type="text"
              icon={<PrinterOutlined />}
              onClick={() => handlePrintBarcode(record)}
            />
          </Tooltip>
          <Popconfirm
            title="确定要删除这个样本吗？"
            onConfirm={() => handleDeleteSample(record.id)}
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

  // 处理新增样本
  const handleAddSample = () => {
    setEditingSample(null);
    form.resetFields();
    // 自动生成条码
    const newBarcode = `BC${Date.now()}`;
    form.setFieldsValue({ barcode: newBarcode });
    setModalVisible(true);
  };

  // 处理编辑样本
  const handleEditSample = (sample: Sample) => {
    setEditingSample(sample);
    form.setFieldsValue({
      ...sample,
      receivedDate: dayjs(sample.receivedDate),
      expectedDate: sample.expectedDate ? dayjs(sample.expectedDate) : null
    });
    setModalVisible(true);
  };

  // 处理查看样本详情
  const handleViewSample = (sample: Sample) => {
    setSelectedSample(sample);
    setDetailModalVisible(true);
  };

  // 处理查看条码
  const handleViewBarcode = (sample: Sample) => {
    setSelectedSample(sample);
    setBarcodeModalVisible(true);
  };

  // 处理打印条码
  const handlePrintBarcode = (sample: Sample) => {
    // 模拟打印功能
    message.success(`正在打印样本 ${sample.code} 的条码...`);
  };

  // 处理删除样本
  const handleDeleteSample = async (id: string) => {
    try {
      // 模拟API调用
      await new Promise(resolve => setTimeout(resolve, 500));
      setSamples(samples.filter(s => s.id !== id));
      message.success('样本删除成功');
    } catch (error) {
      message.error('删除样本失败');
    }
  };

  // 处理表单提交
  const handleSubmit = async (values: any) => {
    try {
      setLoading(true);
      
      // 模拟API调用
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const sampleData = {
        ...values,
        receivedDate: values.receivedDate.format('YYYY-MM-DD'),
        expectedDate: values.expectedDate ? values.expectedDate.format('YYYY-MM-DD') : null,
        projectName: projects.find(p => p.id === values.projectId)?.name,
        sampleTypeName: sampleTypes.find(st => st.id === values.sampleTypeId)?.name,
        qualityScore: values.qualityScore || 0,
        qcPassed: (values.qualityScore || 0) >= 70
      };

      if (editingSample) {
        // 更新样本
        const updatedSample = {
          ...editingSample,
          ...sampleData,
          updatedAt: new Date().toISOString()
        };
        setSamples(samples.map(s => s.id === editingSample.id ? updatedSample : s));
        message.success('样本更新成功');
      } else {
        // 新增样本
        const newSample: Sample = {
          id: Date.now().toString(),
          code: `S${String(samples.length + 1).padStart(3, '0')}`,
          ...sampleData,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
        setSamples([...samples, newSample]);
        message.success('样本登记成功');
      }

      setModalVisible(false);
      form.resetFields();
    } catch (error) {
      message.error('操作失败');
    } finally {
      setLoading(false);
    }
  };

  // 过滤样本数据
  const filteredSamples = samples.filter(sample => {
    const matchesSearch = !searchText || 
      sample.name.toLowerCase().includes(searchText.toLowerCase()) ||
      sample.code.toLowerCase().includes(searchText.toLowerCase()) ||
      sample.barcode.toLowerCase().includes(searchText.toLowerCase()) ||
      sample.projectName.toLowerCase().includes(searchText.toLowerCase());
    
    const matchesStatus = !statusFilter || sample.status === statusFilter;
    const matchesProject = !projectFilter || sample.projectId === projectFilter;
    
    return matchesSearch && matchesStatus && matchesProject;
  });

  // 计算统计数据
  const statistics = {
    total: samples.length,
    received: samples.filter(s => s.status === 'received').length,
    processing: samples.filter(s => s.status === 'processing').length,
    completed: samples.filter(s => s.status === 'completed').length,
    qcPassed: samples.filter(s => s.qcPassed).length,
    avgQuality: samples.length > 0 ? samples.reduce((sum, s) => sum + (s.qualityScore || 0), 0) / samples.length : 0
  };

  return (
    <div>
      {/* 统计卡片 */}
      <Row gutter={16} style={{ marginBottom: 16 }}>
        <Col span={6}>
          <Card>
            <Statistic
              title="样本总数"
              value={statistics.total}
              prefix={<ScanOutlined />}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="处理中"
              value={statistics.processing}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="质检通过率"
              value={statistics.total > 0 ? (statistics.qcPassed / statistics.total * 100) : 0}
              precision={1}
              suffix="%"
              valueStyle={{ 
                color: statistics.qcPassed / statistics.total > 0.8 ? '#52c41a' : '#f5222d' 
              }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="平均质量评分"
              value={statistics.avgQuality}
              precision={1}
              valueStyle={{ 
                color: statistics.avgQuality >= 90 ? '#52c41a' : statistics.avgQuality >= 70 ? '#1890ff' : '#f5222d' 
              }}
            />
          </Card>
        </Col>
      </Row>

      {/* 主要内容卡片 */}
      <Card 
        title="样本接收管理"
        extra={
          <Space>
            <Input.Search
              placeholder="搜索样本名称、编号或条码"
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              style={{ width: 250 }}
            />
            <Select
              placeholder="筛选状态"
              value={statusFilter}
              onChange={setStatusFilter}
              style={{ width: 120 }}
              allowClear
            >
              <Option value="received">已接收</Option>
              <Option value="processing">处理中</Option>
              <Option value="completed">已完成</Option>
              <Option value="failed">失败</Option>
              <Option value="on_hold">暂停</Option>
            </Select>
            <Select
              placeholder="筛选项目"
              value={projectFilter}
              onChange={setProjectFilter}
              style={{ width: 200 }}
              allowClear
            >
              {projects.map(project => (
                <Option key={project.id} value={project.id}>
                  {project.name}
                </Option>
              ))}
            </Select>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={handleAddSample}
            >
              样本登记
            </Button>
          </Space>
        }
      >
        <Table
          columns={columns}
          dataSource={filteredSamples}
          rowKey="id"
          loading={loading}
          scroll={{ x: 1800 }}
          pagination={{
            total: filteredSamples.length,
            pageSize: 10,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total) => `共 ${total} 条记录`
          }}
        />
      </Card>

      {/* 新增/编辑样本模态框 */}
      <Modal
        title={editingSample ? '编辑样本' : '样本登记'}
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
            <Col span={12}>
              <Form.Item
                name="name"
                label="样本名称"
                rules={[{ required: true, message: '请输入样本名称' }]}
              >
                <Input placeholder="请输入样本名称" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="barcode"
                label="样本条码"
                rules={[{ required: true, message: '请输入样本条码' }]}
              >
                <Input placeholder="自动生成或手动输入" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="projectId"
                label="所属项目"
                rules={[{ required: true, message: '请选择所属项目' }]}
              >
                <Select placeholder="请选择所属项目">
                  {projects.map(project => (
                    <Option key={project.id} value={project.id}>
                      {project.name}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="sampleTypeId"
                label="样本类型"
                rules={[{ required: true, message: '请选择样本类型' }]}
              >
                <Select placeholder="请选择样本类型">
                  {sampleTypes.map(type => (
                    <Option key={type.id} value={type.id}>
                      {type.name}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={8}>
              <Form.Item
                name="priority"
                label="优先级"
                rules={[{ required: true, message: '请选择优先级' }]}
              >
                <Select placeholder="请选择优先级">
                  <Option value="high">高</Option>
                  <Option value="medium">中</Option>
                  <Option value="low">低</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                name="receivedDate"
                label="接收日期"
                rules={[{ required: true, message: '请选择接收日期' }]}
              >
                <DatePicker style={{ width: '100%' }} />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                name="expectedDate"
                label="预期完成日期"
              >
                <DatePicker style={{ width: '100%' }} />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={8}>
              <Form.Item
                name="volume"
                label="样本体积 (mL)"
              >
                <Input type="number" placeholder="请输入样本体积" />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                name="concentration"
                label="浓度 (ng/μL)"
              >
                <Input type="number" placeholder="请输入浓度" />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                name="purity"
                label="纯度 (A260/A280)"
              >
                <Input type="number" placeholder="请输入纯度" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="storageLocation"
                label="存储位置"
                rules={[{ required: true, message: '请输入存储位置' }]}
              >
                <Input placeholder="如：A1-01-001" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="temperature"
                label="存储温度 (°C)"
              >
                <Select placeholder="请选择存储温度">
                  <Option value={-80}>-80°C</Option>
                  <Option value={-20}>-20°C</Option>
                  <Option value={4}>4°C</Option>
                  <Option value={25}>室温</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="qualityScore"
                label="质量评分"
              >
                <Input type="number" min={0} max={100} placeholder="0-100分" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="status"
                label="样本状态"
                rules={[{ required: true, message: '请选择样本状态' }]}
              >
                <Select placeholder="请选择样本状态">
                  <Option value="received">已接收</Option>
                  <Option value="processing">处理中</Option>
                  <Option value="completed">已完成</Option>
                  <Option value="failed">失败</Option>
                  <Option value="on_hold">暂停</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            name="notes"
            label="备注"
          >
            <TextArea rows={3} placeholder="请输入备注信息" />
          </Form.Item>

          <Form.Item style={{ textAlign: 'right', marginBottom: 0 }}>
            <Space>
              <Button onClick={() => setModalVisible(false)}>
                取消
              </Button>
              <Button type="primary" htmlType="submit" loading={loading}>
                {editingSample ? '更新' : '登记'}
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>

      {/* 样本详情模态框 */}
      <Modal
        title="样本详情"
        open={detailModalVisible}
        onCancel={() => setDetailModalVisible(false)}
        footer={[
          <Button key="close" onClick={() => setDetailModalVisible(false)}>
            关闭
          </Button>
        ]}
        width={800}
      >
        {selectedSample && (
          <div>
            <Row gutter={16}>
              <Col span={12}>
                <Card size="small" title="基本信息">
                  <p><strong>样本编号：</strong>{selectedSample.code}</p>
                  <p><strong>样本名称：</strong>{selectedSample.name}</p>
                  <p><strong>条码：</strong>{selectedSample.barcode}</p>
                  <p><strong>所属项目：</strong>{selectedSample.projectName}</p>
                  <p><strong>样本类型：</strong>{selectedSample.sampleTypeName}</p>
                  <p><strong>状态：</strong>
                    <Tag color={getStatusColor(selectedSample.status)} style={{ marginLeft: 8 }}>
                      {getStatusText(selectedSample.status)}
                    </Tag>
                  </p>
                  <p><strong>优先级：</strong>
                    <Tag color={getPriorityColor(selectedSample.priority)} style={{ marginLeft: 8 }}>
                      {getPriorityText(selectedSample.priority)}
                    </Tag>
                  </p>
                </Card>
              </Col>
              <Col span={12}>
                <Card size="small" title="质量信息">
                  <p><strong>质量评分：</strong>
                    <Progress 
                      percent={selectedSample.qualityScore} 
                      size="small" 
                      style={{ marginLeft: 8, width: 100 }}
                    />
                  </p>
                  <p><strong>质检状态：</strong>
                    {getQCIcon(selectedSample.qcPassed || false)}
                    <span style={{ marginLeft: 8 }}>
                      {selectedSample.qcPassed ? '通过' : '未通过'}
                    </span>
                  </p>
                  <p><strong>样本体积：</strong>{selectedSample.volume} mL</p>
                  <p><strong>浓度：</strong>{selectedSample.concentration} ng/μL</p>
                  <p><strong>纯度：</strong>{selectedSample.purity}</p>
                </Card>
              </Col>
            </Row>
            
            <Divider />
            
            <Row gutter={16}>
              <Col span={12}>
                <Card size="small" title="存储信息">
                  <p><strong>存储位置：</strong>{selectedSample.storageLocation}</p>
                  <p><strong>存储温度：</strong>{selectedSample.temperature}°C</p>
                  <p><strong>接收日期：</strong>{dayjs(selectedSample.receivedDate).format('YYYY-MM-DD')}</p>
                  <p><strong>预期完成：</strong>
                    {selectedSample.expectedDate ? 
                      dayjs(selectedSample.expectedDate).format('YYYY-MM-DD') : 
                      '未设置'
                    }
                  </p>
                </Card>
              </Col>
              <Col span={12}>
                <Card size="small" title="处理信息">
                  <p><strong>接收人：</strong>{selectedSample.receiverName}</p>
                  <p><strong>创建时间：</strong>{dayjs(selectedSample.createdAt).format('YYYY-MM-DD HH:mm')}</p>
                  <p><strong>更新时间：</strong>{dayjs(selectedSample.updatedAt).format('YYYY-MM-DD HH:mm')}</p>
                </Card>
              </Col>
            </Row>
            
            <Divider />
            
            <Card size="small" title="备注信息">
              <p>{selectedSample.notes || '无备注'}</p>
            </Card>
          </div>
        )}
      </Modal>

      {/* 条码查看模态框 */}
      <Modal
        title="样本条码"
        open={barcodeModalVisible}
        onCancel={() => setBarcodeModalVisible(false)}
        footer={[
          <Button key="print" type="primary" icon={<PrinterOutlined />} onClick={() => handlePrintBarcode(selectedSample!)}>
            打印条码
          </Button>,
          <Button key="close" onClick={() => setBarcodeModalVisible(false)}>
            关闭
          </Button>
        ]}
        width={400}
      >
        {selectedSample && (
          <div style={{ textAlign: 'center' }}>
            <QRCode value={selectedSample.barcode} size={200} />
            <div style={{ marginTop: 16 }}>
              <p><strong>样本编号：</strong>{selectedSample.code}</p>
              <p><strong>条码：</strong>{selectedSample.barcode}</p>
              <p><strong>样本名称：</strong>{selectedSample.name}</p>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default SampleReceiving;