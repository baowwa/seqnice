/**
 * 质量控制面板组件
 * 
 * 功能说明：
 * - 提供实时数据验证和质量控制功能
 * - 显示数据质量评分和等级
 * - 提供质量改进建议和标准参考
 * - 支持批量数据质量检查
 * - 集成异常值检测和预警系统
 * 
 * @author 系统
 * @version 2.0.0
 */

import React, { useState, useEffect, useMemo } from 'react';
import {
  Card,
  Row,
  Col,
  Progress,
  Badge,
  Alert,
  List,
  Statistic,
  Tabs,
  Table,
  Button,
  Tooltip,
  Space,
  Tag,
  Divider,
  Typography,
  Modal,
  Descriptions,
  notification
} from 'antd';
import {
  CheckCircleOutlined,
  WarningOutlined,
  CloseCircleOutlined,
  InfoCircleOutlined,
  TrophyOutlined,
  BarChartOutlined,
  FileTextOutlined,
  DownloadOutlined,
  ReloadOutlined
} from '@ant-design/icons';
import {
  DataValidator,
  ValidationResult,
  ValidationLevel,
  QualityScore,
  QualityStandard,
  createValidator
} from '../utils/dataValidation';

const { Title, Text, Paragraph } = Typography;
const { TabPane } = Tabs;

/**
 * 质量控制面板属性接口
 */
interface QualityControlPanelProps {
  /** 实验类型 */
  experimentType: 'nucleic_extraction' | 'pcr_amplification' | 'library_construction';
  /** 数据记录 */
  records: any[];
  /** 当前记录 */
  currentRecord?: any;
  /** 是否显示详细信息 */
  showDetails?: boolean;
  /** 自动验证 */
  autoValidate?: boolean;
  /** 验证结果回调 */
  onValidationChange?: (results: ValidationResult[]) => void;
  /** 质量评分回调 */
  onScoreChange?: (score: QualityScore) => void;
  /** 样式类名 */
  className?: string;
}

/**
 * 验证级别配置
 */
const VALIDATION_LEVEL_CONFIG = {
  [ValidationLevel.INFO]: {
    color: 'blue',
    icon: <InfoCircleOutlined />,
    label: '信息',
    badgeStatus: 'processing' as const
  },
  [ValidationLevel.WARNING]: {
    color: 'orange',
    icon: <WarningOutlined />,
    label: '警告',
    badgeStatus: 'warning' as const
  },
  [ValidationLevel.ERROR]: {
    color: 'red',
    icon: <CloseCircleOutlined />,
    label: '错误',
    badgeStatus: 'error' as const
  },
  [ValidationLevel.CRITICAL]: {
    color: 'red',
    icon: <CloseCircleOutlined />,
    label: '严重',
    badgeStatus: 'error' as const
  }
};

/**
 * 质量等级配置
 */
const QUALITY_GRADE_CONFIG = {
  A: { color: 'green', label: '优秀', description: '数据质量优秀，符合所有标准' },
  B: { color: 'blue', label: '良好', description: '数据质量良好，基本符合标准' },
  C: { color: 'orange', label: '一般', description: '数据质量一般，需要改进' },
  D: { color: 'red', label: '较差', description: '数据质量较差，需要重新检查' },
  F: { color: 'red', label: '不合格', description: '数据质量不合格，需要重新录入' }
};

/**
 * 质量控制面板组件
 * @param props 组件属性
 * @returns JSX元素
 */
const QualityControlPanel: React.FC<QualityControlPanelProps> = ({
  experimentType,
  records = [],
  currentRecord,
  showDetails = true,
  autoValidate = true,
  onValidationChange,
  onScoreChange,
  className
}) => {
  // 状态管理
  const [validator] = useState(() => createValidator(experimentType));
  const [validationResults, setValidationResults] = useState<ValidationResult[]>([]);
  const [qualityScore, setQualityScore] = useState<QualityScore | null>(null);
  const [showReportModal, setShowReportModal] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');

  // 计算质量报告
  const qualityReport = useMemo(() => {
    if (records.length === 0) return null;
    return validator.generateQualityReport(records);
  }, [validator, records]);

  // 当前记录验证
  useEffect(() => {
    if (currentRecord && autoValidate) {
      const results = validator.validateRecord(currentRecord);
      const score = validator.calculateQualityScore(currentRecord);
      
      setValidationResults(results);
      setQualityScore(score);
      
      onValidationChange?.(results);
      onScoreChange?.(score);
    }
  }, [currentRecord, validator, autoValidate, onValidationChange, onScoreChange]);

  /**
   * 手动验证
   */
  const handleManualValidation = () => {
    if (currentRecord) {
      const results = validator.validateRecord(currentRecord);
      const score = validator.calculateQualityScore(currentRecord);
      
      setValidationResults(results);
      setQualityScore(score);
      
      onValidationChange?.(results);
      onScoreChange?.(score);
      
      notification.success({
        message: '验证完成',
        description: `数据质量评分: ${score.totalScore}/100 (${score.grade}级)`
      });
    }
  };

  /**
   * 导出质量报告
   */
  const handleExportReport = () => {
    if (qualityReport) {
      const reportData = {
        timestamp: new Date().toISOString(),
        experimentType,
        summary: qualityReport.summary,
        recommendations: qualityReport.recommendations
      };
      
      const blob = new Blob([JSON.stringify(reportData, null, 2)], {
        type: 'application/json'
      });
      
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `quality-report-${Date.now()}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      notification.success({
        message: '导出成功',
        description: '质量报告已导出到本地文件'
      });
    }
  };

  /**
   * 渲染验证结果列表
   */
  const renderValidationResults = () => {
    if (validationResults.length === 0) {
      return (
        <Alert
          message="数据验证通过"
          description="当前记录未发现质量问题"
          type="success"
          icon={<CheckCircleOutlined />}
          showIcon
        />
      );
    }

    return (
      <List
        size="small"
        dataSource={validationResults}
        renderItem={(result) => {
          const config = VALIDATION_LEVEL_CONFIG[result.level];
          return (
            <List.Item>
              <List.Item.Meta
                avatar={
                  <Badge status={config.badgeStatus} />
                }
                title={
                  <Space>
                    <Tag color={config.color}>{config.label}</Tag>
                    <Text strong>{result.field}</Text>
                  </Space>
                }
                description={
                  <div>
                    <Paragraph style={{ margin: 0 }}>
                      {result.message}
                    </Paragraph>
                    {result.suggestion && (
                      <Paragraph type="secondary" style={{ margin: 0, fontSize: '12px' }}>
                        建议: {result.suggestion}
                      </Paragraph>
                    )}
                    {result.currentValue !== undefined && (
                      <Paragraph type="secondary" style={{ margin: 0, fontSize: '12px' }}>
                        当前值: {result.currentValue}
                        {result.expectedRange && ` (期望范围: ${result.expectedRange})`}
                      </Paragraph>
                    )}
                    {result.reference && (
                      <Paragraph type="secondary" style={{ margin: 0, fontSize: '12px' }}>
                        参考标准: {result.reference}
                      </Paragraph>
                    )}
                  </div>
                }
              />
            </List.Item>
          );
        }}
      />
    );
  };

  /**
   * 渲染质量评分卡片
   */
  const renderQualityScore = () => {
    if (!qualityScore) {
      return (
        <Card title="质量评分" size="small">
          <Text type="secondary">暂无评分数据</Text>
        </Card>
      );
    }

    const gradeConfig = QUALITY_GRADE_CONFIG[qualityScore.grade];
    const scoreColor = qualityScore.totalScore >= 80 ? 'green' : 
                      qualityScore.totalScore >= 60 ? 'orange' : 'red';

    return (
      <Card 
        title={
          <Space>
            <TrophyOutlined />
            质量评分
          </Space>
        }
        size="small"
        extra={
          <Tag color={gradeConfig.color} style={{ fontSize: '14px', padding: '4px 8px' }}>
            {qualityScore.grade}级
          </Tag>
        }
      >
        <Row gutter={16}>
          <Col span={12}>
            <Progress
              type="circle"
              percent={qualityScore.totalScore}
              strokeColor={scoreColor}
              format={() => `${qualityScore.totalScore}分`}
              size={80}
            />
          </Col>
          <Col span={12}>
            <Space direction="vertical" size="small" style={{ width: '100%' }}>
              <Statistic
                title="完整性"
                value={qualityScore.categoryScores.completeness}
                suffix="分"
                valueStyle={{ fontSize: '14px' }}
              />
              <Statistic
                title="准确性"
                value={qualityScore.categoryScores.accuracy}
                suffix="分"
                valueStyle={{ fontSize: '14px' }}
              />
            </Space>
          </Col>
        </Row>
        
        <Divider style={{ margin: '12px 0' }} />
        
        <Row gutter={8}>
          <Col span={12}>
            <Statistic
              title="一致性"
              value={qualityScore.categoryScores.consistency}
              suffix="分"
              valueStyle={{ fontSize: '12px' }}
            />
          </Col>
          <Col span={12}>
            <Statistic
              title="可靠性"
              value={qualityScore.categoryScores.reliability}
              suffix="分"
              valueStyle={{ fontSize: '12px' }}
            />
          </Col>
        </Row>
        
        {qualityScore.improvements.length > 0 && (
          <>
            <Divider style={{ margin: '12px 0' }} />
            <Text strong style={{ fontSize: '12px' }}>改进建议:</Text>
            <List
              size="small"
              dataSource={qualityScore.improvements.slice(0, 3)}
              renderItem={(item) => (
                <List.Item style={{ padding: '4px 0' }}>
                  <Text style={{ fontSize: '12px' }}>• {item}</Text>
                </List.Item>
              )}
            />
          </>
        )}
      </Card>
    );
  };

  /**
   * 渲染质量标准表格
   */
  const renderQualityStandards = () => {
    const standards = [
      'dnaConcentration',
      'purity260_280',
      'dnaVolume',
      'pcrProduct',
      'libraryConcentration',
      'fragmentSize'
    ].map(param => validator.getQualityStandard(param))
     .filter(Boolean) as QualityStandard[];

    const columns = [
      {
        title: '参数',
        dataIndex: 'name',
        key: 'name',
        width: 120
      },
      {
        title: '最小值',
        dataIndex: 'minValue',
        key: 'minValue',
        width: 80,
        render: (value: number, record: QualityStandard) => 
          value !== undefined ? `${value} ${record.unit || ''}` : '-'
      },
      {
        title: '理想范围',
        dataIndex: 'optimalRange',
        key: 'optimalRange',
        width: 120,
        render: (range: [number, number], record: QualityStandard) => 
          range ? `${range[0]}-${range[1]} ${record.unit || ''}` : '-'
      },
      {
        title: '最大值',
        dataIndex: 'maxValue',
        key: 'maxValue',
        width: 80,
        render: (value: number, record: QualityStandard) => 
          value !== undefined ? `${value} ${record.unit || ''}` : '-'
      },
      {
        title: '标准来源',
        dataIndex: 'source',
        key: 'source',
        ellipsis: true
      }
    ];

    return (
      <Table
        columns={columns}
        dataSource={standards}
        rowKey="parameter"
        size="small"
        pagination={false}
        scroll={{ y: 200 }}
      />
    );
  };

  /**
   * 渲染质量报告模态框
   */
  const renderReportModal = () => {
    if (!qualityReport) return null;

    return (
      <Modal
        title="质量控制报告"
        open={showReportModal}
        onCancel={() => setShowReportModal(false)}
        width={800}
        footer={[
          <Button key="export" icon={<DownloadOutlined />} onClick={handleExportReport}>
            导出报告
          </Button>,
          <Button key="close" onClick={() => setShowReportModal(false)}>
            关闭
          </Button>
        ]}
      >
        <Descriptions bordered size="small" column={2}>
          <Descriptions.Item label="总记录数">
            {qualityReport.summary.totalRecords}
          </Descriptions.Item>
          <Descriptions.Item label="合格记录数">
            <Text type="success">{qualityReport.summary.validRecords}</Text>
          </Descriptions.Item>
          <Descriptions.Item label="错误记录数">
            <Text type="danger">{qualityReport.summary.errorRecords}</Text>
          </Descriptions.Item>
          <Descriptions.Item label="警告记录数">
            <Text type="warning">{qualityReport.summary.warningRecords}</Text>
          </Descriptions.Item>
          <Descriptions.Item label="平均评分" span={2}>
            <Progress 
              percent={qualityReport.summary.averageScore} 
              size="small"
              format={() => `${qualityReport.summary.averageScore.toFixed(1)}分`}
            />
          </Descriptions.Item>
        </Descriptions>

        <Divider />

        <Title level={5}>改进建议</Title>
        <List
          size="small"
          dataSource={qualityReport.recommendations}
          renderItem={(item, index) => (
            <List.Item>
              <Text>{index + 1}. {item}</Text>
            </List.Item>
          )}
        />
      </Modal>
    );
  };

  return (
    <div className={className}>
      <Card
        title={
          <Space>
            <BarChartOutlined />
            质量控制面板
          </Space>
        }
        size="small"
        extra={
          <Space>
            {qualityReport && (
              <Button
                size="small"
                icon={<FileTextOutlined />}
                onClick={() => setShowReportModal(true)}
              >
                质量报告
              </Button>
            )}
            <Button
              size="small"
              icon={<ReloadOutlined />}
              onClick={handleManualValidation}
              disabled={!currentRecord}
            >
              重新验证
            </Button>
          </Space>
        }
      >
        {showDetails ? (
          <Tabs activeKey={activeTab} onChange={setActiveTab} size="small">
            <TabPane tab="概览" key="overview">
              <Row gutter={[16, 16]}>
                <Col span={24}>
                  {renderQualityScore()}
                </Col>
                <Col span={24}>
                  <Card title="验证结果" size="small">
                    {renderValidationResults()}
                  </Card>
                </Col>
              </Row>
            </TabPane>
            
            <TabPane tab="质量标准" key="standards">
              <Card title="质量控制标准" size="small">
                {renderQualityStandards()}
              </Card>
            </TabPane>
            
            {qualityReport && (
              <TabPane tab="批量统计" key="batch">
                <Row gutter={[16, 16]}>
                  <Col span={6}>
                    <Statistic
                      title="总记录数"
                      value={qualityReport.summary.totalRecords}
                      prefix={<FileTextOutlined />}
                    />
                  </Col>
                  <Col span={6}>
                    <Statistic
                      title="合格率"
                      value={((qualityReport.summary.validRecords / qualityReport.summary.totalRecords) * 100).toFixed(1)}
                      suffix="%"
                      valueStyle={{ color: '#3f8600' }}
                      prefix={<CheckCircleOutlined />}
                    />
                  </Col>
                  <Col span={6}>
                    <Statistic
                      title="错误率"
                      value={((qualityReport.summary.errorRecords / qualityReport.summary.totalRecords) * 100).toFixed(1)}
                      suffix="%"
                      valueStyle={{ color: '#cf1322' }}
                      prefix={<CloseCircleOutlined />}
                    />
                  </Col>
                  <Col span={6}>
                    <Statistic
                      title="平均评分"
                      value={qualityReport.summary.averageScore.toFixed(1)}
                      suffix="分"
                      valueStyle={{ 
                        color: qualityReport.summary.averageScore >= 80 ? '#3f8600' : 
                               qualityReport.summary.averageScore >= 60 ? '#fa8c16' : '#cf1322'
                      }}
                      prefix={<TrophyOutlined />}
                    />
                  </Col>
                </Row>
              </TabPane>
            )}
          </Tabs>
        ) : (
          <Row gutter={16}>
            <Col span={12}>
              {renderQualityScore()}
            </Col>
            <Col span={12}>
              <Card title="验证状态" size="small">
                {validationResults.length === 0 ? (
                  <Badge status="success" text="验证通过" />
                ) : (
                  <Space direction="vertical" size="small">
                    {Object.entries(
                      validationResults.reduce((acc, result) => {
                        acc[result.level] = (acc[result.level] || 0) + 1;
                        return acc;
                      }, {} as Record<ValidationLevel, number>)
                    ).map(([level, count]) => {
                      const config = VALIDATION_LEVEL_CONFIG[level as ValidationLevel];
                      return (
                        <Badge
                          key={level}
                          status={config.badgeStatus}
                          text={`${config.label}: ${count}项`}
                        />
                      );
                    })}
                  </Space>
                )}
              </Card>
            </Col>
          </Row>
        )}
      </Card>

      {renderReportModal()}
    </div>
  );
};

export default QualityControlPanel;