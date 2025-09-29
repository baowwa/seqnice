/**
 * 批次执行界面组件
 * 
 * 功能说明：
 * - 提供实验批次的执行界面
 * - 包含96孔板布局和样本分配
 * - 步骤导航和进度跟踪
 * - 实时状态更新和操作记录
 * 
 * @author 系统
 * @version 1.0.0
 */

import React, { useState, useEffect } from 'react';
import {
  Card,
  Steps,
  Button,
  Progress,
  Table,
  Tag,
  Space,
  Row,
  Col,
  Statistic,
  Timeline,
  Modal,
  Form,
  Input,
  Select,
  message,
  Tooltip,
  Badge,
  Divider,
  Alert,
  Typography,
  Avatar,
  List,
  Drawer,
  Descriptions,
  Switch,
  InputNumber
} from 'antd';
import {
  PlayCircleOutlined,
  PauseCircleOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  ExclamationCircleOutlined,
  ReloadOutlined,
  EyeOutlined,
  SettingOutlined,
  ClockCircleOutlined,
  UserOutlined,
  ExperimentOutlined,
  BarcodeOutlined,
  ToolOutlined,
  FileTextOutlined,
  WarningOutlined
} from '@ant-design/icons';
import dayjs from 'dayjs';

const { Step } = Steps;
const { Option } = Select;
const { TextArea } = Input;
const { Title, Text } = Typography;

/**
 * 批次状态枚举
 */
type BatchStatus = 'draft' | 'ready' | 'executing' | 'paused' | 'completed' | 'failed' | 'cancelled';

/**
 * 步骤状态枚举
 */
type StepStatus = 'pending' | 'running' | 'completed' | 'failed' | 'skipped';

/**
 * 孔位状态枚举
 */
type WellStatus = 'empty' | 'loaded' | 'processing' | 'completed' | 'failed' | 'contaminated';

/**
 * 实验步骤接口
 */
interface ExperimentStep {
  id: string;
  stepName: string;
  stepOrder: number;
  status: StepStatus;
  estimatedDuration: number; // 分钟
  actualDuration?: number;
  startTime?: string;
  endTime?: string;
  operator?: string;
  notes?: string;
  requirements: string[];
  parameters: Record<string, any>;
}

/**
 * 96孔板孔位接口
 */
interface WellPosition {
  row: string; // A-H
  col: number; // 1-12
  position: string; // A1, A2, etc.
  sampleId?: string;
  sampleName?: string;
  status: WellStatus;
  volume?: number;
  concentration?: number;
  notes?: string;
}

/**
 * 批次执行信息接口
 */
interface BatchExecution {
  id: string;
  batchCode: string;
  batchName: string;
  status: BatchStatus;
  currentStep: number;
  totalSteps: number;
  progress: number;
  operator: string;
  startTime?: string;
  estimatedEndTime?: string;
  actualEndTime?: string;
  steps: ExperimentStep[];
  plateLayout: WellPosition[];
  notes: string;
  qualityChecks: QualityCheck[];
}

/**
 * 质量检查接口
 */
interface QualityCheck {
  id: string;
  checkPoint: string;
  status: 'pending' | 'passed' | 'failed';
  checkTime?: string;
  operator?: string;
  result?: string;
  notes?: string;
}

/**
 * 批次执行组件
 * 
 * @returns JSX.Element 批次执行界面
 */
const BatchExecution: React.FC = () => {
  // 状态管理
  const [batchExecution, setBatchExecution] = useState<BatchExecution | null>(null);
  const [loading, setLoading] = useState(false);
  const [stepModalVisible, setStepModalVisible] = useState(false);
  const [wellDetailVisible, setWellDetailVisible] = useState(false);
  const [selectedWell, setSelectedWell] = useState<WellPosition | null>(null);
  const [operationLogVisible, setOperationLogVisible] = useState(false);
  const [currentStepForm] = Form.useForm();

  /**
   * 初始化批次执行数据
   */
  useEffect(() => {
    loadBatchExecution();
  }, []);

  /**
   * 加载批次执行数据
   */
  const loadBatchExecution = () => {
    setLoading(true);
    
    // 模拟数据加载
    setTimeout(() => {
      const mockBatch: BatchExecution = {
        id: 'BATCH_20240120_001',
        batchCode: 'BATCH_20240120_001',
        batchName: '环境样本DNA提取批次',
        status: 'executing',
        currentStep: 1,
        totalSteps: 4,
        progress: 35,
        operator: '张三',
        startTime: '2024-01-20 09:00:00',
        estimatedEndTime: '2024-01-20 17:00:00',
        steps: [
          {
            id: 'step1',
            stepName: '样本加载',
            stepOrder: 1,
            status: 'completed',
            estimatedDuration: 60,
            actualDuration: 55,
            startTime: '2024-01-20 09:00:00',
            endTime: '2024-01-20 09:55:00',
            operator: '张三',
            notes: '样本加载完成，质量检查通过',
            requirements: ['检查样本标签', '确认样本体积', '记录样本位置'],
            parameters: { temperature: 4, humidity: 45 }
          },
          {
            id: 'step2',
            stepName: '细胞裂解',
            stepOrder: 2,
            status: 'running',
            estimatedDuration: 120,
            actualDuration: 45,
            startTime: '2024-01-20 10:00:00',
            operator: '张三',
            requirements: ['添加裂解缓冲液', '混匀样本', '孵育反应'],
            parameters: { temperature: 56, duration: 120, speed: 1400 }
          },
          {
            id: 'step3',
            stepName: 'DNA纯化',
            stepOrder: 3,
            status: 'pending',
            estimatedDuration: 90,
            requirements: ['离心分离', '洗涤DNA', '溶解DNA'],
            parameters: { centrifugeSpeed: 12000, washVolume: 500 }
          },
          {
            id: 'step4',
            stepName: '质量检测',
            stepOrder: 4,
            status: 'pending',
            estimatedDuration: 30,
            requirements: ['浓度检测', '纯度检测', '完整性检测'],
            parameters: { method: 'NanoDrop', dilution: 10 }
          }
        ],
        plateLayout: generatePlateLayout(),
        notes: '批次执行正常，按计划进行',
        qualityChecks: [
          {
            id: 'qc1',
            checkPoint: '样本加载检查',
            status: 'passed',
            checkTime: '2024-01-20 09:55:00',
            operator: '张三',
            result: '所有样本加载正确',
            notes: '96个样本位置全部确认'
          },
          {
            id: 'qc2',
            checkPoint: '裂解效果检查',
            status: 'pending',
            checkTime: undefined,
            operator: undefined,
            result: undefined,
            notes: undefined
          }
        ]
      };
      
      setBatchExecution(mockBatch);
      setLoading(false);
    }, 1000);
  };

  /**
   * 生成96孔板布局
   * 
   * @returns WellPosition[] 孔位数组
   */
  const generatePlateLayout = (): WellPosition[] => {
    const wells: WellPosition[] = [];
    const rows = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'];
    const cols = Array.from({ length: 12 }, (_, i) => i + 1);
    
    rows.forEach(row => {
      cols.forEach(col => {
        const position = `${row}${col}`;
        const wellIndex = (rows.indexOf(row) * 12) + (col - 1);
        
        wells.push({
          row,
          col,
          position,
          sampleId: wellIndex < 72 ? `S${String(wellIndex + 1).padStart(3, '0')}` : undefined,
          sampleName: wellIndex < 72 ? `环境样本${wellIndex + 1}` : undefined,
          status: wellIndex < 72 ? (wellIndex < 24 ? 'completed' : wellIndex < 48 ? 'processing' : 'loaded') : 'empty',
          volume: wellIndex < 72 ? 200 : undefined,
          concentration: wellIndex < 24 ? Math.round(Math.random() * 100 + 50) : undefined,
          notes: wellIndex < 72 ? undefined : undefined
        });
      });
    });
    
    return wells;
  };

  /**
   * 获取孔位状态颜色
   * 
   * @param status WellStatus 孔位状态
   * @returns string 颜色值
   */
  const getWellStatusColor = (status: WellStatus): string => {
    switch (status) {
      case 'empty': return '#f5f5f5';
      case 'loaded': return '#e6f7ff';
      case 'processing': return '#fff7e6';
      case 'completed': return '#f6ffed';
      case 'failed': return '#fff2f0';
      case 'contaminated': return '#fff0f6';
      default: return '#f5f5f5';
    }
  };

  /**
   * 获取孔位状态文本
   * 
   * @param status WellStatus 孔位状态
   * @returns string 状态文本
   */
  const getWellStatusText = (status: WellStatus): string => {
    switch (status) {
      case 'empty': return '空';
      case 'loaded': return '已加载';
      case 'processing': return '处理中';
      case 'completed': return '完成';
      case 'failed': return '失败';
      case 'contaminated': return '污染';
      default: return '未知';
    }
  };

  /**
   * 获取步骤状态图标
   * 
   * @param status StepStatus 步骤状态
   * @returns JSX.Element 图标组件
   */
  const getStepStatusIcon = (status: StepStatus) => {
    switch (status) {
      case 'pending': return <ClockCircleOutlined />;
      case 'running': return <PlayCircleOutlined />;
      case 'completed': return <CheckCircleOutlined />;
      case 'failed': return <CloseCircleOutlined />;
      case 'skipped': return <ExclamationCircleOutlined />;
      default: return <ClockCircleOutlined />;
    }
  };

  /**
   * 处理步骤操作
   * 
   * @param stepId string 步骤ID
   * @param action string 操作类型
   */
  const handleStepAction = (stepId: string, action: string) => {
    if (!batchExecution) return;
    
    const updatedSteps = batchExecution.steps.map(step => {
      if (step.id === stepId) {
        switch (action) {
          case 'start':
            return {
              ...step,
              status: 'running' as StepStatus,
              startTime: dayjs().format('YYYY-MM-DD HH:mm:ss')
            };
          case 'complete':
            return {
              ...step,
              status: 'completed' as StepStatus,
              endTime: dayjs().format('YYYY-MM-DD HH:mm:ss'),
              actualDuration: step.startTime ? 
                dayjs().diff(dayjs(step.startTime), 'minute') : step.estimatedDuration
            };
          case 'pause':
            return { ...step, status: 'pending' as StepStatus };
          case 'fail':
            return {
              ...step,
              status: 'failed' as StepStatus,
              endTime: dayjs().format('YYYY-MM-DD HH:mm:ss')
            };
          default:
            return step;
        }
      }
      return step;
    });
    
    const currentStepIndex = updatedSteps.findIndex(step => step.status === 'running');
    const completedSteps = updatedSteps.filter(step => step.status === 'completed').length;
    const progress = Math.round((completedSteps / updatedSteps.length) * 100);
    
    setBatchExecution({
      ...batchExecution,
      steps: updatedSteps,
      currentStep: currentStepIndex >= 0 ? currentStepIndex : completedSteps,
      progress
    });
    
    message.success(`步骤${action === 'start' ? '开始' : action === 'complete' ? '完成' : '暂停'}成功`);
  };

  /**
   * 处理孔位点击
   * 
   * @param well WellPosition 孔位信息
   */
  const handleWellClick = (well: WellPosition) => {
    setSelectedWell(well);
    setWellDetailVisible(true);
  };

  /**
   * 渲染96孔板
   * 
   * @returns JSX.Element 96孔板组件
   */
  const renderPlateLayout = () => {
    if (!batchExecution) return null;
    
    const rows = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'];
    const cols = Array.from({ length: 12 }, (_, i) => i + 1);
    
    return (
      <div style={{ padding: 16, backgroundColor: '#fafafa', borderRadius: 8 }}>
        <div style={{ display: 'flex', marginBottom: 8 }}>
          <div style={{ width: 30 }}></div>
          {cols.map(col => (
            <div key={col} style={{ 
              width: 40, 
              height: 20, 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              fontSize: 12,
              fontWeight: 'bold'
            }}>
              {col}
            </div>
          ))}
        </div>
        
        {rows.map(row => (
          <div key={row} style={{ display: 'flex', marginBottom: 4 }}>
            <div style={{ 
              width: 30, 
              height: 36, 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              fontSize: 12,
              fontWeight: 'bold'
            }}>
              {row}
            </div>
            
            {cols.map(col => {
              const well = batchExecution.plateLayout.find(w => w.row === row && w.col === col);
              if (!well) return null;
              
              return (
                <Tooltip
                  key={well.position}
                  title={
                    <div>
                      <div><strong>{well.position}</strong></div>
                      {well.sampleId && <div>样本: {well.sampleId}</div>}
                      {well.sampleName && <div>名称: {well.sampleName}</div>}
                      <div>状态: {getWellStatusText(well.status)}</div>
                      {well.volume && <div>体积: {well.volume}μL</div>}
                      {well.concentration && <div>浓度: {well.concentration}ng/μL</div>}
                    </div>
                  }
                >
                  <div
                    style={{
                      width: 36,
                      height: 36,
                      margin: 2,
                      backgroundColor: getWellStatusColor(well.status),
                      border: well.status === 'empty' ? '1px dashed #d9d9d9' : '1px solid #d9d9d9',
                      borderRadius: 4,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: 'pointer',
                      fontSize: 10,
                      fontWeight: well.sampleId ? 'bold' : 'normal',
                      transition: 'all 0.2s'
                    }}
                    onClick={() => handleWellClick(well)}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = 'scale(1.1)';
                      e.currentTarget.style.zIndex = '10';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = 'scale(1)';
                      e.currentTarget.style.zIndex = '1';
                    }}
                  >
                    {well.sampleId ? well.sampleId.slice(-2) : ''}
                  </div>
                </Tooltip>
              );
            })}
          </div>
        ))}
        
        {/* 图例 */}
        <div style={{ marginTop: 16, display: 'flex', flexWrap: 'wrap', gap: 16 }}>
          {[
            { status: 'empty', label: '空孔' },
            { status: 'loaded', label: '已加载' },
            { status: 'processing', label: '处理中' },
            { status: 'completed', label: '完成' },
            { status: 'failed', label: '失败' },
            { status: 'contaminated', label: '污染' }
          ].map(item => (
            <div key={item.status} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              <div
                style={{
                  width: 16,
                  height: 16,
                  backgroundColor: getWellStatusColor(item.status as WellStatus),
                  border: '1px solid #d9d9d9',
                  borderRadius: 2
                }}
              />
              <Text style={{ fontSize: 12 }}>{item.label}</Text>
            </div>
          ))}
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div style={{ padding: 24, textAlign: 'center' }}>
        <ReloadOutlined spin style={{ fontSize: 24 }} />
        <div style={{ marginTop: 16 }}>加载批次执行信息...</div>
      </div>
    );
  }

  if (!batchExecution) {
    return (
      <div style={{ padding: 24, textAlign: 'center' }}>
        <ExclamationCircleOutlined style={{ fontSize: 48, color: '#faad14' }} />
        <div style={{ marginTop: 16 }}>未找到批次执行信息</div>
      </div>
    );
  }

  return (
    <div style={{ padding: 24 }}>
      {/* 批次信息头部 */}
      <Card style={{ marginBottom: 16 }}>
        <Row gutter={24}>
          <Col span={18}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
              <Avatar size={48} icon={<ExperimentOutlined />} />
              <div>
                <Title level={4} style={{ margin: 0 }}>
                  {batchExecution.batchName}
                </Title>
                <Text type="secondary">
                  批次编号: {batchExecution.batchCode} | 操作员: {batchExecution.operator}
                </Text>
              </div>
            </div>
          </Col>
          <Col span={6}>
            <div style={{ textAlign: 'right' }}>
              <Tag color="processing" style={{ marginBottom: 8 }}>
                执行中
              </Tag>
              <div>
                <Text type="secondary">进度: </Text>
                <Text strong>{batchExecution.progress}%</Text>
              </div>
            </div>
          </Col>
        </Row>
      </Card>

      <Row gutter={16}>
        {/* 左侧：步骤导航和96孔板 */}
        <Col span={16}>
          {/* 步骤导航 */}
          <Card title="实验步骤" style={{ marginBottom: 16 }}>
            <Steps
              current={batchExecution.currentStep}
              direction="horizontal"
              size="small"
            >
              {batchExecution.steps.map((step, index) => (
                <Step
                  key={step.id}
                  title={step.stepName}
                  description={`${step.estimatedDuration}分钟`}
                  status={
                    step.status === 'completed' ? 'finish' :
                    step.status === 'running' ? 'process' :
                    step.status === 'failed' ? 'error' : 'wait'
                  }
                  icon={getStepStatusIcon(step.status)}
                />
              ))}
            </Steps>
            
            <div style={{ marginTop: 16, textAlign: 'center' }}>
              <Progress
                percent={batchExecution.progress}
                status={batchExecution.status === 'failed' ? 'exception' : 'active'}
                strokeColor={{
                  '0%': '#108ee9',
                  '100%': '#87d068',
                }}
              />
            </div>
          </Card>

          {/* 96孔板布局 */}
          <Card title="96孔板布局" extra={
            <Space>
              <Button size="small" icon={<EyeOutlined />}>
                查看详情
              </Button>
              <Button size="small" icon={<SettingOutlined />}>
                设置
              </Button>
            </Space>
          }>
            {renderPlateLayout()}
          </Card>
        </Col>

        {/* 右侧：当前步骤和操作面板 */}
        <Col span={8}>
          {/* 当前步骤信息 */}
          <Card title="当前步骤" style={{ marginBottom: 16 }}>
            {(() => {
              const currentStep = batchExecution.steps[batchExecution.currentStep];
              if (!currentStep) return <Text>所有步骤已完成</Text>;
              
              return (
                <div>
                  <div style={{ marginBottom: 16 }}>
                    <Title level={5}>{currentStep.stepName}</Title>
                    <Text type="secondary">
                      预计用时: {currentStep.estimatedDuration}分钟
                    </Text>
                  </div>
                  
                  <div style={{ marginBottom: 16 }}>
                    <Text strong>操作要求:</Text>
                    <ul style={{ marginTop: 8, paddingLeft: 20 }}>
                      {currentStep.requirements.map((req, index) => (
                        <li key={index}>{req}</li>
                      ))}
                    </ul>
                  </div>
                  
                  <div style={{ marginBottom: 16 }}>
                    <Text strong>参数设置:</Text>
                    <div style={{ marginTop: 8 }}>
                      {Object.entries(currentStep.parameters).map(([key, value]) => (
                        <div key={key} style={{ marginBottom: 4 }}>
                          <Text>{key}: {value}</Text>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  <Space style={{ width: '100%' }} direction="vertical">
                    {currentStep.status === 'pending' && (
                      <Button
                        type="primary"
                        icon={<PlayCircleOutlined />}
                        block
                        onClick={() => handleStepAction(currentStep.id, 'start')}
                      >
                        开始步骤
                      </Button>
                    )}
                    
                    {currentStep.status === 'running' && (
                      <>
                        <Button
                          type="primary"
                          icon={<CheckCircleOutlined />}
                          block
                          onClick={() => handleStepAction(currentStep.id, 'complete')}
                        >
                          完成步骤
                        </Button>
                        <Button
                          icon={<PauseCircleOutlined />}
                          block
                          onClick={() => handleStepAction(currentStep.id, 'pause')}
                        >
                          暂停步骤
                        </Button>
                      </>
                    )}
                    
                    <Button
                      danger
                      icon={<CloseCircleOutlined />}
                      block
                      onClick={() => handleStepAction(currentStep.id, 'fail')}
                    >
                      标记失败
                    </Button>
                  </Space>
                </div>
              );
            })()}
          </Card>

          {/* 质量检查 */}
          <Card title="质量检查" style={{ marginBottom: 16 }}>
            <List
              size="small"
              dataSource={batchExecution.qualityChecks}
              renderItem={(check) => (
                <List.Item>
                  <List.Item.Meta
                    avatar={
                      <Badge
                        status={
                          check.status === 'passed' ? 'success' :
                          check.status === 'failed' ? 'error' : 'default'
                        }
                      />
                    }
                    title={check.checkPoint}
                    description={
                      check.status === 'pending' ? '待检查' :
                      check.result || '已完成'
                    }
                  />
                </List.Item>
              )}
            />
          </Card>

          {/* 操作记录 */}
          <Card title="操作记录" extra={
            <Button
              size="small"
              type="link"
              onClick={() => setOperationLogVisible(true)}
            >
              查看全部
            </Button>
          }>
            <Timeline size="small">
              <Timeline.Item color="green">
                <Text style={{ fontSize: 12 }}>09:55 - 样本加载完成</Text>
              </Timeline.Item>
              <Timeline.Item color="blue">
                <Text style={{ fontSize: 12 }}>10:00 - 开始细胞裂解</Text>
              </Timeline.Item>
              <Timeline.Item color="gray">
                <Text style={{ fontSize: 12 }}>10:30 - 添加裂解缓冲液</Text>
              </Timeline.Item>
            </Timeline>
          </Card>
        </Col>
      </Row>

      {/* 孔位详情抽屉 */}
      <Drawer
        title="孔位详情"
        placement="right"
        onClose={() => setWellDetailVisible(false)}
        open={wellDetailVisible}
        width={400}
      >
        {selectedWell && (
          <div>
            <Descriptions column={1} size="small">
              <Descriptions.Item label="位置">{selectedWell.position}</Descriptions.Item>
              <Descriptions.Item label="样本ID">{selectedWell.sampleId || '无'}</Descriptions.Item>
              <Descriptions.Item label="样本名称">{selectedWell.sampleName || '无'}</Descriptions.Item>
              <Descriptions.Item label="状态">
                <Tag color={selectedWell.status === 'completed' ? 'green' : 'blue'}>
                  {getWellStatusText(selectedWell.status)}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="体积">{selectedWell.volume || 0}μL</Descriptions.Item>
              <Descriptions.Item label="浓度">{selectedWell.concentration || 0}ng/μL</Descriptions.Item>
              <Descriptions.Item label="备注">{selectedWell.notes || '无'}</Descriptions.Item>
            </Descriptions>
            
            <Divider />
            
            <Space direction="vertical" style={{ width: '100%' }}>
              <Button type="primary" block>
                更新状态
              </Button>
              <Button block>
                添加备注
              </Button>
              <Button danger block>
                标记异常
              </Button>
            </Space>
          </div>
        )}
      </Drawer>

      {/* 操作记录抽屉 */}
      <Drawer
        title="操作记录"
        placement="right"
        onClose={() => setOperationLogVisible(false)}
        open={operationLogVisible}
        width={500}
      >
        <Timeline>
          <Timeline.Item color="green" dot={<CheckCircleOutlined />}>
            <div>
              <Text strong>样本加载完成</Text>
              <br />
              <Text type="secondary">2024-01-20 09:55:00 - 张三</Text>
              <br />
              <Text>96个样本全部加载完成，质量检查通过</Text>
            </div>
          </Timeline.Item>
          
          <Timeline.Item color="blue" dot={<PlayCircleOutlined />}>
            <div>
              <Text strong>开始细胞裂解</Text>
              <br />
              <Text type="secondary">2024-01-20 10:00:00 - 张三</Text>
              <br />
              <Text>设置温度56°C，开始裂解反应</Text>
            </div>
          </Timeline.Item>
          
          <Timeline.Item color="gray" dot={<ToolOutlined />}>
            <div>
              <Text strong>添加裂解缓冲液</Text>
              <br />
              <Text type="secondary">2024-01-20 10:30:00 - 张三</Text>
              <br />
              <Text>每孔添加200μL裂解缓冲液</Text>
            </div>
          </Timeline.Item>
        </Timeline>
      </Drawer>
    </div>
  );
};

export default BatchExecution;