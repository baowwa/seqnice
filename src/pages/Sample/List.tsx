import React, { useEffect, useMemo, useState } from 'react';
import { Card, Table, Space, Button, Input, DatePicker, Select, message, Tabs, Badge } from 'antd';
import { useNavigate } from 'react-router-dom';

/**
 * 样本列表页面
 * 作用：集中展示所有已录入的样本信息，并提供筛选与快捷入口
 * 使用：从本地存储读取样本数据（演示环境），后续可替换为后端接口
 */
const SampleList: React.FC = () => {
  // 入参：无
  // 出参：渲染样本列表页面

  const navigate = useNavigate();
  const STORAGE_KEY = 'sample_list';

  /**
   * 状态枚举：样本接收状态
   * - pending: 待处理
   * - review: 待审核
   * - done: 已处理
   * - error: 处理异常
   * 入参：无
   * 出参：类型约束
   */
  type ReceiveStatus = 'pending' | 'review' | 'done' | 'error';

  // 已移除“单个录入”抽屉，改为在接收页的新标签打开

  /**
   * 数据状态
   * param: setData 数据更新方法
   * return: data 当前列表数据
   */
  const [data, setData] = useState<any[]>([]);

  /**
   * 顶部 Tabs 当前状态
   * 入参：无
   * 出参：当前选中的接收状态
   */
  const [activeStatus, setActiveStatus] = useState<ReceiveStatus>('pending');

  /**
   * 筛选状态
   * - 关键字：匹配样本编号、项目名等
   * - 类型：样本类型
   * - 状态：启用/停用
   * - 日期范围：接收时间范围
   */
  const [keyword, setKeyword] = useState<string>('');
  const [type, setType] = useState<string | undefined>(undefined);
  const [dateRange, setDateRange] = useState<any>(undefined);

  /**
   * 方法：加载本地存储中的样本列表
   * params: 无
   * return: void
   */
  /**
   * 方法：生成并写入Mock样本数据
   * params: 无
   * return: void
   */
  const seedMock = () => {
    const now = new Date();
    const pad = (n: number) => (n < 10 ? `0${n}` : `${n}`);
    const ts = (d: Date) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
    const makeTime = (offsetHours: number) => {
      const d = new Date(now.getTime() - offsetHours * 3600 * 1000);
      return ts(d);
    };

    /**
     * 数据结构：
     * - sampleBarcode 样本条码
     * - sampleName   样本名称
     * - sampleCode   样本编号
     * - sampleType   样本类型
     * - source       样本来源
     * - collectionTime 采集时间
     * - receiveTime    接收时间
     * - receiver       接收人
     * - projectName    检验项目
     * - methodology    方法学
     */
    const mock = [
      { id: 1, sampleBarcode: 'SB202411010001', sampleName: 'A0001-张三', sampleCode: 'A0001', sampleType: '血液', source: '门诊', collectionTime: makeTime(30), receiveTime: makeTime(28), receiver: '王五', projectName: '肿瘤NGS Panel', methodology: 'NGS-Panel', receiveStatus: 'pending' },
      { id: 2, sampleBarcode: 'SB202411010002', sampleName: 'A0002-李四', sampleCode: 'A0002', sampleType: '组织', source: '住院', collectionTime: makeTime(50), receiveTime: makeTime(45), receiver: '赵六', projectName: '外显子组 WES', methodology: 'WES', receiveStatus: 'pending' },
      { id: 3, sampleBarcode: 'SB202411010003', sampleName: 'A0003-王小', sampleCode: 'A0003', sampleType: '唾液', source: '外送', collectionTime: makeTime(20), receiveTime: makeTime(18), receiver: '管理员', projectName: '转录组 RNA-Seq', methodology: 'RNA-Seq', receiveStatus: 'review' },
      { id: 4, sampleBarcode: 'SB202411010004', sampleName: 'A0004-陈强', sampleCode: 'A0004', sampleType: '血液', source: '门诊', collectionTime: makeTime(10), receiveTime: makeTime(8), receiver: '王五', projectName: '遗传病Panel', methodology: 'NGS-Panel', receiveStatus: 'done' },
      { id: 5, sampleBarcode: 'SB202411010005', sampleName: 'A0005-刘敏', sampleCode: 'A0005', sampleType: '组织', source: '住院', collectionTime: makeTime(60), receiveTime: makeTime(55), receiver: '赵六', projectName: '外显子组 WES', methodology: 'WES', receiveStatus: 'done' },
      { id: 6, sampleBarcode: 'SB202411010006', sampleName: 'A0006-周静', sampleCode: 'A0006', sampleType: '唾液', source: '外送', collectionTime: makeTime(26), receiveTime: makeTime(24), receiver: '管理员', projectName: '转录组 RNA-Seq', methodology: 'RNA-Seq', receiveStatus: 'error' }
    ];
    localStorage.setItem(STORAGE_KEY, JSON.stringify(mock));
    setData(mock);
    message.success('已载入样本Mock数据');
  };

  /**
   * 方法：加载本地存储中的样本列表
   * params: 无
   * return: void
   */
  const load = () => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      const list = raw ? JSON.parse(raw) : [];
      if (Array.isArray(list) && list.length > 0) {
        const normalized = list.map((it: any) => {
          const inferred: ReceiveStatus = (
            it.receiveStatus ||
            (it.status === '启用' ? 'done' : undefined) ||
            (it.receiveTime ? 'done' : 'pending')
          ) as ReceiveStatus;
          return { ...it, receiveStatus: inferred };
        });
        setData(normalized);
      } else {
        // 若无数据则自动生成并写入Mock数据
        seedMock();
      }
    } catch (e) {
      message.error('读取本地样本数据失败');
    }
  };

  /**
   * 方法：清空本地演示数据
   * params: 无
   * return: void
   */
  const clear = () => {
    localStorage.removeItem(STORAGE_KEY);
    load();
    message.success('已清空本地样本数据');
  };

  useEffect(() => {
    load();
  }, []);

  /**
   * 计算：根据筛选条件生成展示数据
   * params: 无（使用组件状态）
   * return: 过滤后的数据数组
   */
  const filtered = useMemo(() => {
    return data.filter((item) => {
      const status: ReceiveStatus = (item.receiveStatus || 'pending') as ReceiveStatus;
      const matchStatus = status === activeStatus;
      const matchKeyword = keyword
        ? [item.sampleBarcode, item.sampleName, item.sampleCode, item.projectName, item.sampleType, item.source]
            .filter(Boolean)
            .some((v) => String(v).toLowerCase().includes(keyword.toLowerCase()))
        : true;
      const matchType = type ? item.sampleType === type : true;
      const matchRange = dateRange
        ? (() => {
            const t = item.receiveTime ? new Date(item.receiveTime).getTime() : 0;
            const s = dateRange[0]?.toDate().getTime();
            const e = dateRange[1]?.toDate().getTime();
            return t >= s && t <= e;
          })()
        : true;
      return matchStatus && matchKeyword && matchType && matchRange;
    });
  }, [data, activeStatus, keyword, type, dateRange]);

  /**
   * 统计：各状态样本数量
   * 入参：无
   * 出参：状态计数对象
   */
  const statusCount = useMemo(() => {
    const init = { pending: 0, review: 0, done: 0, error: 0 } as Record<ReceiveStatus, number>;
    data.forEach((item) => {
      const status: ReceiveStatus = (item.receiveStatus || 'pending') as ReceiveStatus;
      init[status] = (init[status] || 0) + 1;
    });
    return init;
  }, [data]);

  /**
   * 表格列定义
   * params: 无
   * return: antd Table 列配置
   */
  /**
   * 表格列定义（按需求展示十项字段）
   * params: 无
   * return: antd Table 列配置
   */
  const columns = [
    { title: '样本条码', dataIndex: 'sampleBarcode', key: 'sampleBarcode', width: 160, fixed: 'left' },
    { title: '样本名称', dataIndex: 'sampleName', key: 'sampleName', width: 160 },
    { title: '样本编号', dataIndex: 'sampleCode', key: 'sampleCode', width: 120 },
    { title: '样本类型', dataIndex: 'sampleType', key: 'sampleType', width: 100 },
    { title: '样本来源', dataIndex: 'source', key: 'source', width: 100 },
    { title: '采集时间', dataIndex: 'collectionTime', key: 'collectionTime', width: 180, render: (v: string) => v || '—' },
    { title: '接收时间', dataIndex: 'receiveTime', key: 'receiveTime', width: 180, render: (v: string) => v || '—' },
    { title: '接收人', dataIndex: 'receiver', key: 'receiver', width: 100 },
    { title: '检验项目', dataIndex: 'projectName', key: 'projectName', width: 180 },
    { title: '方法学', dataIndex: 'methodology', key: 'methodology', width: 120 },
    {
      title: '操作',
      key: 'action',
      width: 200,
      fixed: 'right',
      render: (_: any, record: any) => (
        <Space>
          <Button
            size="small"
            onClick={() => {
              // 改为在接收页的“单个录入”标签打开（后续可带参预填）
              const url = `/sample/receiving?mode=single&sampleCode=${encodeURIComponent(record.sampleCode || '')}`;
              // 使用路由跳转在当前页打开
              navigate(url);
            }}
          >
            编辑
          </Button>
          <Button size="small" danger>停用</Button>
        </Space>
      ),
    },
  ];

  /**
   * 方法：跳转到不同录入模式（当前页）
   * 入参：mode 录入模式（single/scan/table/batch）
   * 出参：void（通过 React Router 在当前页导航）
   */
  const goMode = (mode: 'single' | 'scan' | 'table' | 'batch') => {
    // 在当前页打开接收页对应标签
    const url = `/sample/receiving?mode=${mode}`;
    navigate(url);
  };

  return (
    <Space direction="vertical" style={{ width: '100%' }}>
      <Card
        title="样本列表"
        extra={
          <Space>
            <Button type="primary" onClick={() => goMode('single')}>单个录入</Button>
            <Button onClick={() => goMode('scan')}>扫码录入</Button>
            <Button onClick={() => goMode('table')}>批量表格录入</Button>
            <Button onClick={() => goMode('batch')}>批量导入</Button>
          </Space>
        }
        variant="outlined"
      >
        {/**
         * 顶部状态 Tabs
         * 入参：无（使用组件状态与统计）
         * 出参：切换状态后触发表格过滤
         */}
        <Tabs
          activeKey={activeStatus}
          onChange={(key) => setActiveStatus(key as ReceiveStatus)}
          items={[
            { key: 'pending', label: (<span>待处理 <Badge count={statusCount.pending} showZero /></span>) },
            { key: 'review', label: (<span>待审核 <Badge count={statusCount.review} showZero /></span>) },
            { key: 'done', label: (<span>已处理 <Badge count={statusCount.done} showZero /></span>) },
            { key: 'error', label: (<span>异常 <Badge count={statusCount.error} showZero /></span>) },
          ]}
        />
        <Space wrap style={{ marginBottom: 12 }}>
          <Input
            placeholder="搜索：编号/项目/类型/来源"
            allowClear
            style={{ width: 260 }}
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
          />
          <Select
            placeholder="样本类型"
            allowClear
            style={{ width: 160 }}
            value={type}
            onChange={setType}
            options={[
              { label: '血液', value: '血液' },
              { label: '组织', value: '组织' },
              { label: '唾液', value: '唾液' },
            ]}
          />
          {/* 移除状态筛选，按需求显示十项核心字段 */}
          <DatePicker.RangePicker value={dateRange} onChange={setDateRange} />
          {/**
           * 按钮：查询
           * 入参：无
           * 出参：void（当前为受控筛选，点击仅提示）
           */}
          <Button
            type="primary"
            onClick={() => {
              message.success('已按当前筛选条件查询');
            }}
          >
            查询
          </Button>
          {/**
           * 按钮：重置
           * 入参：无
           * 出参：void（清空筛选并复位状态标签到待处理）
           */}
          <Button
            onClick={() => {
              setKeyword('');
              setType(undefined);
              setDateRange(undefined);
              setActiveStatus('pending');
              message.success('已重置查询条件');
            }}
          >
            重置
          </Button>
          <Button onClick={seedMock}>重置Mock数据</Button>
        </Space>
        <Table
          rowKey={(r) => r.id || r.sampleBarcode || r.sampleCode}
          dataSource={filtered}
          columns={columns as any}
          pagination={{ pageSize: 10 }}
          size="small"
          scroll={{ x: 'max-content', y: 420 }}
        />
      </Card>
      {/* 已移除：单个录入抽屉，统一在接收页新标签处理 */}
    </Space>
  );
};

export default SampleList;