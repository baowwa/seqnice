import React, { useState, useEffect } from 'react';
import {
  Modal,
  Steps,
  Card,
  Button,
  Space,
  Progress,
  Alert,
  Descriptions,
  List,
  Tag,
  Divider,
  Form,
  Input,
  Select,
  message,
  Spin,
  Tooltip,
  Typography,
  Row,
  Col,
  Checkbox
} from 'antd';
import {
  CheckCircleOutlined,
  CloseCircleOutlined,
  ExclamationCircleOutlined,
  InfoCircleOutlined,
  ArrowRightOutlined,
  FileTextOutlined,
  AuditOutlined,
  SafetyCertificateOutlined,
  ClockCircleOutlined
} from '@ant-design/icons';
import { ProjectStage, StageStatus, Project } from '../types';

const { Step } = Steps;
const { TextArea } = Input;
const { Option } = Select;
const { Text, Title } = Typography;

/**
 * 阶段转换条件接口
 */
interface TransitionCondition {
  /** 条件ID */
  id: string;
  /** 条件名称 */
  name: string;
  /** 条件描述 */
  description: string;
  /** 是否必需 */
  required: boolean;
  /** 检查状态 */
  status: 'pending' | 'checking' | 'passed' | 'failed';
  /** 检查结果消息 */
  message?: string;
  /** 条件类型 */
  type: 'task_completion' | 'data_quality' | 'approval' | 'document' | 'custom';
}

/**
 * 阶段转换管理组件接口
 */
interface StageTransitionManagerProps {
  /** 是否显示 */
  visible: boolean;
  /** 关闭回调 */
  onClose: () => void;
  /** 当前项目 */
  project: Project;
  /** 当前阶段 */
  currentStage: ProjectStage;
  /** 目标阶段 */
  targetStage: ProjectStage;
  /** 转换成功回调 */
  onTransitionSuccess: (fromStage: ProjectStage, toStage: ProjectStage) => void;
}

/**
 * 阶段转换管理组件
 * 负责验证阶段转换条件，确保项目阶段的有序推进
 */
const StageTransitionManager: React.FC<StageTransitionManagerProps> = ({
  visible,
  onClose,
  project,
  currentStage,
  targetStage,
  onTransitionSuccess
}) => {
  // 状态管理
  const [loading, setLoading] = useState(false);
  const [checking, setChecking] = useState(false);
  const [conditions, setConditions] = useState<TransitionCondition[]>([]);
  const [currentStep, setCurrentStep] = useState(0);
  const [form] = Form.useForm();
  const [transitionNotes, setTransitionNotes] = useState('');

  // 组件挂载时初始化条件
  useEffect(() => {
    if (visible && currentStage && targetStage) {
      initializeConditions();
    }
  }, [visible, currentStage, targetStage]);

  // 初始化转换条件
  const initializeConditions = () => {
    const stageConditions: TransitionCondition[] = [];

    // 根据阶段类型生成不同的条件
    if (currentStage.name === '前期准备' && targetStage.name === '检测验证') {
      stageConditions.push(
        {
          id: 'task_completion_1',
          name: '任务完成度检查',
          description: '确保当前阶段所有必需任务已完成',
          required: true,
          status: 'pending',
          type: 'task_completion'
        },
        {
          id: 'document_1',
          name: '文档完整性检查',
          description: '验证所有必需文档已上传并审核通过',
          required: true,
          status: 'pending',
          type: 'document'
        },
        {
          id: 'data_quality_1',
          name: '数据质量审核',
          description: '检查数据完整性和准确性',
          required: true,
          status: 'pending',
          type: 'data_quality'
        }
      );
    } else if (currentStage.name === '检测验证' && targetStage.name === '注册申报') {
      stageConditions.push(
        {
          id: 'task_completion_2',
          name: '检测任务完成',
          description: '所有检测项目已完成并通过质控',
          required: true,
          status: 'pending',
          type: 'task_completion'
        },
        {
          id: 'approval_1',
          name: '质量经理审批',
          description: '质量经理已审核并批准检测结果',
          required: true,
          status: 'pending',
          type: 'approval'
        },
        {
          id: 'document_2',
          name: '检测报告生成',
          description: '检测报告已生成并经过审核',
          required: true,
          status: 'pending',
          type: 'document'
        }
      );
    } else {
      // 通用条件
      stageConditions.push(
        {
          id: 'task_completion_general',
          name: '任务完成度检查',
          description: '确保当前阶段所有任务已完成',
          required: true,
          status: 'pending',
          type: 'task_completion'
        },
        {
          id: 'approval_general',
          name: '阶段负责人审批',
          description: '阶段负责人已确认可以进入下一阶段',
          required: true,
          status: 'pending',
          type: 'approval'
        }
      );
    }

    setConditions(stageConditions);
  };

  // 获取条件图标
  const getConditionIcon = (condition: TransitionCondition) => {
    switch (condition.status) {
      case 'passed':
        return <CheckCircleOutlined style={{ color: '#52c41a' }} />;
      case 'failed':
        return <CloseCircleOutlined style={{ color: '#ff4d4f' }} />;
      case 'checking':
        return <Spin size="small" />;
      default:
        return <ClockCircleOutlined style={{ color: '#faad14' }} />;
    }
  };

  // 获取条件类型图标
  const getConditionTypeIcon = (type: TransitionCondition['type']) => {
    const iconMap = {
      task_completion: <CheckCircleOutlined />,
      data_quality: <AuditOutlined />,
      approval: <SafetyCertificateOutlined />,
      document: <FileTextOutlined />,
      custom: <InfoCircleOutlined />
    };
    return iconMap[type];
  };

  // 检查单个条件
  const checkCondition = async (condition: TransitionCondition): Promise<boolean> => {
    // 更新条件状态为检查中
    setConditions(prev => prev.map(c => 
      c.id === condition.id ? { ...c, status: 'checking' } : c
    ));

    try {
      // 模拟API调用检查条件
      await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 2000));

      // 模拟检查结果（实际应该调用相应的API）
      const passed = Math.random() > 0.3; // 70%通过率

      let message = '';
      if (passed) {
        message = '检查通过';
      } else {
        switch (condition.type) {
          case 'task_completion':
            message = '还有3个任务未完成';
            break;
          case 'data_quality':
            message = '发现2处数据质量问题';
            break;
          case 'approval':
            message = '等待审批人确认';
            break;
          case 'document':
            message = '缺少必需文档';
            break;
          default:
            message = '检查未通过';
        }
      }

      // 更新条件状态
      setConditions(prev => prev.map(c => 
        c.id === condition.id 
          ? { ...c, status: passed ? 'passed' : 'failed', message }
          : c
      ));

      return passed;
    } catch (error) {
      // 检查失败
      setConditions(prev => prev.map(c => 
        c.id === condition.id 
          ? { ...c, status: 'failed', message: '检查过程中发生错误' }
          : c
      ));
      return false;
    }
  };

  // 检查所有条件
  const checkAllConditions = async () => {
    setChecking(true);
    
    try {
      // 重置所有条件状态
      setConditions(prev => prev.map(c => ({ ...c, status: 'pending' as const })));
      
      // 逐个检查条件
      for (const condition of conditions) {
        await checkCondition(condition);
      }
      
      message.success('条件检查完成');
    } catch (error) {
      message.error('条件检查失败');
    } finally {
      setChecking(false);
    }
  };

  // 执行阶段转换
  const executeTransition = async () => {
    // 检查是否所有必需条件都通过
    const requiredConditions = conditions.filter(c => c.required);
    const passedRequiredConditions = requiredConditions.filter(c => c.status === 'passed');
    
    if (passedRequiredConditions.length < requiredConditions.length) {
      message.error('请先通过所有必需条件检查');
      return;
    }

    setLoading(true);
    
    try {
      // 模拟API调用执行转换
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // 更新阶段状态
      const updatedCurrentStage = {
        ...currentStage,
        status: StageStatus.COMPLETED
      };
      
      const updatedTargetStage = {
        ...targetStage,
        status: StageStatus.IN_PROGRESS
      };
      
      message.success(`成功从"${currentStage.name}"转换到"${targetStage.name}"`);
      
      // 调用成功回调
      onTransitionSuccess(updatedCurrentStage, updatedTargetStage);
      
      // 关闭模态框
      onClose();
    } catch (error) {
      message.error('阶段转换失败');
    } finally {
      setLoading(false);
    }
  };

  // 计算整体进度
  const calculateProgress = () => {
    const totalConditions = conditions.length;
    const passedConditions = conditions.filter(c => c.status === 'passed').length;
    return totalConditions > 0 ? Math.round((passedConditions / totalConditions) * 100) : 0;
  };

  // 判断是否可以执行转换
  const canExecuteTransition = () => {
    const requiredConditions = conditions.filter(c => c.required);
    return requiredConditions.every(c => c.status === 'passed');
  };

  return (
    <Modal
      title="阶段转换"
      open={visible}
      onCancel={onClose}
      width={800}
      footer={null}
    >
      <div style={{ marginBottom: 24 }}>
        <Steps current={1} size="small">
          <Step 
            title={currentStage.name} 
            status="finish"
            icon={<CheckCircleOutlined />}
          />
          <Step 
            title="条件验证" 
            status="process"
            icon={<AuditOutlined />}
          />
          <Step 
            title={targetStage.name} 
            status="wait"
            icon={<ArrowRightOutlined />}
          />
        </Steps>
      </div>

      <Card title="转换概览" size="small" style={{ marginBottom: 16 }}>
        <Descriptions column={2} size="small">
          <Descriptions.Item label="项目名称">{project.name}</Descriptions.Item>
          <Descriptions.Item label="项目编号">{project.code}</Descriptions.Item>
          <Descriptions.Item label="当前阶段">{currentStage.name}</Descriptions.Item>
          <Descriptions.Item label="目标阶段">{targetStage.name}</Descriptions.Item>
        </Descriptions>
      </Card>

      <Card 
        title={
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span>转换条件检查</span>
            <div>
              <Progress 
                percent={calculateProgress()} 
                size="small" 
                style={{ width: 100, marginRight: 16 }}
              />
              <Button 
                type="primary" 
                size="small"
                loading={checking}
                onClick={checkAllConditions}
              >
                重新检查
              </Button>
            </div>
          </div>
        }
        size="small"
        style={{ marginBottom: 16 }}
      >
        <List
          dataSource={conditions}
          renderItem={(condition) => (
            <List.Item
              actions={[
                <Button
                  type="link"
                  size="small"
                  loading={condition.status === 'checking'}
                  onClick={() => checkCondition(condition)}
                >
                  检查
                </Button>
              ]}
            >
              <List.Item.Meta
                avatar={getConditionIcon(condition)}
                title={
                  <div style={{ display: 'flex', alignItems: 'center' }}>
                    {getConditionTypeIcon(condition.type)}
                    <span style={{ marginLeft: 8 }}>
                      {condition.name}
                      {condition.required && (
                        <Tag color="red" size="small" style={{ marginLeft: 8 }}>
                          必需
                        </Tag>
                      )}
                    </span>
                  </div>
                }
                description={
                  <div>
                    <div>{condition.description}</div>
                    {condition.message && (
                      <Text 
                        type={condition.status === 'passed' ? 'success' : 'danger'}
                        style={{ fontSize: '12px' }}
                      >
                        {condition.message}
                      </Text>
                    )}
                  </div>
                }
              />
            </List.Item>
          )}
        />
      </Card>

      {!canExecuteTransition() && (
        <Alert
          message="转换条件未满足"
          description="请确保所有必需条件都通过检查后再执行阶段转换"
          type="warning"
          showIcon
          style={{ marginBottom: 16 }}
        />
      )}

      <Card title="转换备注" size="small" style={{ marginBottom: 24 }}>
        <TextArea
          rows={3}
          placeholder="请输入阶段转换的备注信息（可选）"
          value={transitionNotes}
          onChange={(e) => setTransitionNotes(e.target.value)}
        />
      </Card>

      <div style={{ textAlign: 'right' }}>
        <Space>
          <Button onClick={onClose}>
            取消
          </Button>
          <Button
            type="primary"
            loading={loading}
            disabled={!canExecuteTransition()}
            onClick={executeTransition}
          >
            执行转换
          </Button>
        </Space>
      </div>
    </Modal>
  );
};

export default StageTransitionManager;