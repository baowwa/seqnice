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
  Divider
} from 'antd';
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  UserOutlined,
  PhoneOutlined,
  MailOutlined,
  EnvironmentOutlined
} from '@ant-design/icons';
import { ProjectCenter, CenterType } from '../types';

const { Option } = Select;
const { TextArea } = Input;
const { Title, Text } = Typography;

/**
 * 项目中心管理组件接口
 */
interface ProjectCenterManagerProps {
  projectId: string;
  centers: ProjectCenter[];
  onCentersChange: (centers: ProjectCenter[]) => void;
  readonly?: boolean;
}

/**
 * 项目中心管理组件
 * 负责管理项目的多中心配置，包括主导中心和协作中心
 */
const ProjectCenterManager: React.FC<ProjectCenterManagerProps> = ({
  projectId,
  centers,
  onCentersChange,
  readonly = false
}) => {
  const [modalVisible, setModalVisible] = useState(false);
  const [editingCenter, setEditingCenter] = useState<ProjectCenter | null>(null);
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  // 获取中心类型显示文本
  const getCenterTypeText = (type: CenterType) => {
    const typeMap = {
      [CenterType.LEAD]: '主导中心',
      [CenterType.COLLABORATIVE]: '协作中心'
    };
    return typeMap[type];
  };

  // 获取中心类型颜色
  const getCenterTypeColor = (type: CenterType) => {
    const colorMap = {
      [CenterType.LEAD]: 'gold',
      [CenterType.COLLABORATIVE]: 'blue'
    };
    return colorMap[type];
  };

  // 表格列定义
  const columns = [
    {
      title: '中心名称',
      dataIndex: 'centerName',
      key: 'centerName',
      width: 200,
      render: (text: string, record: ProjectCenter) => (
        <div>
          <div style={{ fontWeight: 500 }}>{text}</div>
          <Tag color={getCenterTypeColor(record.centerType)} size="small">
            {getCenterTypeText(record.centerType)}
          </Tag>
        </div>
      )
    },
    {
      title: '联系人',
      key: 'contact',
      width: 180,
      render: (_, record: ProjectCenter) => (
        <div>
          <div><UserOutlined /> {record.contactPerson}</div>
          <div style={{ fontSize: '12px', color: '#666' }}>
            <PhoneOutlined /> {record.contactPhone}
          </div>
          <div style={{ fontSize: '12px', color: '#666' }}>
            <MailOutlined /> {record.contactEmail}
          </div>
        </div>
      )
    },
    {
      title: '地址',
      dataIndex: 'address',
      key: 'address',
      width: 200,
      render: (text: string) => (
        <div>
          <EnvironmentOutlined /> {text}
        </div>
      )
    },
    {
      title: '职责范围',
      dataIndex: 'responsibilities',
      key: 'responsibilities',
      width: 250,
      render: (responsibilities: string[]) => (
        <div>
          {responsibilities.map((resp, index) => (
            <Tag key={index} style={{ marginBottom: 2 }}>
              {resp}
            </Tag>
          ))}
        </div>
      )
    },
    {
      title: '加入时间',
      dataIndex: 'joinDate',
      key: 'joinDate',
      width: 120,
      render: (date: string) => new Date(date).toLocaleDateString()
    },
    {
      title: '状态',
      dataIndex: 'isActive',
      key: 'isActive',
      width: 80,
      render: (isActive: boolean) => (
        <Tag color={isActive ? 'green' : 'red'}>
          {isActive ? '活跃' : '停用'}
        </Tag>
      )
    }
  ];

  // 如果不是只读模式，添加操作列
  if (!readonly) {
    columns.push({
      title: '操作',
      key: 'action',
      width: 120,
      fixed: 'right',
      render: (_, record: ProjectCenter) => (
        <Space size="small">
          <Button
            type="text"
            icon={<EditOutlined />}
            onClick={() => handleEditCenter(record)}
            size="small"
          />
          <Popconfirm
            title="确定要删除这个中心吗？"
            onConfirm={() => handleDeleteCenter(record.id)}
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

  // 处理新增中心
  const handleAddCenter = () => {
    setEditingCenter(null);
    form.resetFields();
    setModalVisible(true);
  };

  // 处理编辑中心
  const handleEditCenter = (center: ProjectCenter) => {
    setEditingCenter(center);
    form.setFieldsValue({
      ...center,
      responsibilities: center.responsibilities || []
    });
    setModalVisible(true);
  };

  // 处理删除中心
  const handleDeleteCenter = (centerId: string) => {
    const updatedCenters = centers.filter(c => c.id !== centerId);
    onCentersChange(updatedCenters);
    message.success('中心删除成功');
  };

  // 处理表单提交
  const handleSubmit = async (values: any) => {
    try {
      setLoading(true);

      const centerData: ProjectCenter = {
        id: editingCenter?.id || Date.now().toString(),
        projectId,
        centerId: values.centerId || Date.now().toString(),
        centerName: values.centerName,
        centerType: values.centerType,
        contactPerson: values.contactPerson,
        contactPhone: values.contactPhone,
        contactEmail: values.contactEmail,
        address: values.address,
        isActive: values.isActive ?? true,
        joinDate: values.joinDate || new Date().toISOString(),
        responsibilities: values.responsibilities || [],
        notes: values.notes,
        createdAt: editingCenter?.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      let updatedCenters: ProjectCenter[];
      if (editingCenter) {
        // 更新现有中心
        updatedCenters = centers.map(c => c.id === editingCenter.id ? centerData : c);
        message.success('中心更新成功');
      } else {
        // 新增中心
        updatedCenters = [...centers, centerData];
        message.success('中心添加成功');
      }

      onCentersChange(updatedCenters);
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
    const leadCenters = centers.filter(c => c.centerType === CenterType.LEAD);
    const collaborativeCenters = centers.filter(c => c.centerType === CenterType.COLLABORATIVE);
    const activeCenters = centers.filter(c => c.isActive);

    return {
      total: centers.length,
      lead: leadCenters.length,
      collaborative: collaborativeCenters.length,
      active: activeCenters.length
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
              <div style={{ color: '#666' }}>总中心数</div>
            </div>
          </Card>
        </Col>
        <Col span={6}>
          <Card size="small">
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#faad14' }}>
                {statistics.lead}
              </div>
              <div style={{ color: '#666' }}>主导中心</div>
            </div>
          </Card>
        </Col>
        <Col span={6}>
          <Card size="small">
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#1890ff' }}>
                {statistics.collaborative}
              </div>
              <div style={{ color: '#666' }}>协作中心</div>
            </div>
          </Card>
        </Col>
        <Col span={6}>
          <Card size="small">
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#52c41a' }}>
                {statistics.active}
              </div>
              <div style={{ color: '#666' }}>活跃中心</div>
            </div>
          </Card>
        </Col>
      </Row>

      {/* 中心列表 */}
      <Card
        title="项目中心配置"
        extra={
          !readonly && (
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={handleAddCenter}
            >
              添加中心
            </Button>
          )
        }
      >
        <Table
          columns={columns}
          dataSource={centers}
          rowKey="id"
          scroll={{ x: 1200 }}
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total) => `共 ${total} 个中心`
          }}
        />
      </Card>

      {/* 新增/编辑中心模态框 */}
      <Modal
        title={editingCenter ? '编辑中心' : '添加中心'}
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
                name="centerName"
                label="中心名称"
                rules={[{ required: true, message: '请输入中心名称' }]}
              >
                <Input placeholder="请输入中心名称" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="centerType"
                label="中心类型"
                rules={[{ required: true, message: '请选择中心类型' }]}
              >
                <Select placeholder="请选择中心类型">
                  <Option value={CenterType.LEAD}>主导中心</Option>
                  <Option value={CenterType.COLLABORATIVE}>协作中心</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Divider orientation="left">联系信息</Divider>

          <Row gutter={16}>
            <Col span={8}>
              <Form.Item
                name="contactPerson"
                label="联系人"
                rules={[{ required: true, message: '请输入联系人' }]}
              >
                <Input placeholder="请输入联系人" />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                name="contactPhone"
                label="联系电话"
                rules={[{ required: true, message: '请输入联系电话' }]}
              >
                <Input placeholder="请输入联系电话" />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                name="contactEmail"
                label="联系邮箱"
                rules={[
                  { required: true, message: '请输入联系邮箱' },
                  { type: 'email', message: '请输入有效的邮箱地址' }
                ]}
              >
                <Input placeholder="请输入联系邮箱" />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            name="address"
            label="地址"
            rules={[{ required: true, message: '请输入地址' }]}
          >
            <Input placeholder="请输入地址" />
          </Form.Item>

          <Form.Item
            name="responsibilities"
            label="职责范围"
            rules={[{ required: true, message: '请选择职责范围' }]}
          >
            <Select
              mode="tags"
              placeholder="请输入或选择职责范围"
              style={{ width: '100%' }}
            >
              <Option value="样本采集">样本采集</Option>
              <Option value="样本处理">样本处理</Option>
              <Option value="实验检测">实验检测</Option>
              <Option value="数据分析">数据分析</Option>
              <Option value="质量控制">质量控制</Option>
              <Option value="报告生成">报告生成</Option>
              <Option value="项目协调">项目协调</Option>
            </Select>
          </Form.Item>

          <Form.Item
            name="notes"
            label="备注"
          >
            <TextArea rows={3} placeholder="请输入备注信息" />
          </Form.Item>

          <Form.Item
            name="isActive"
            label="状态"
            valuePropName="checked"
            initialValue={true}
          >
            <Select>
              <Option value={true}>活跃</Option>
              <Option value={false}>停用</Option>
            </Select>
          </Form.Item>

          <Form.Item style={{ textAlign: 'right', marginBottom: 0 }}>
            <Space>
              <Button onClick={() => setModalVisible(false)}>
                取消
              </Button>
              <Button type="primary" htmlType="submit" loading={loading}>
                {editingCenter ? '更新' : '添加'}
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default ProjectCenterManager;