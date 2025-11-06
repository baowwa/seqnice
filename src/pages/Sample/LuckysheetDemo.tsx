import React, { useCallback, useEffect, useRef, useState } from 'react'
import { Card, Space, Button, Typography, message } from 'antd'
import LuckySheetTable, { type LuckySheetColumn } from '../../components/LuckySheetTable'

const { Title, Paragraph, Text } = Typography

/**
 * 组件名称：Luckysheet演示页面
 * 职责说明：
 * - 独立集成 Luckysheet，展示“可编辑表格”效果用于演示。
 * - 不绑定外部受控数据，避免编辑被外部状态覆盖。
 * - 提供简单的“新增行”“清空表格”“保存演示数据”操作。
 * 入参：无
 * 出参：React 组件（JSX.Element）
 */
const LuckysheetDemoPage: React.FC = () => {
  /**
   * 表头常量（用于构建列配置）
   * param 无
   * return string[] 表头名称数组
   */
  const HEADERS: string[] = ['样本编号', '姓名', '性别', '年龄', '科室', '项目', '状态']

  /**
   * 列键映射（中文标题 -> 字段键）
   * param 无
   * return Record<string,string> 映射对象
   */
  const KEY_MAP: Record<string, string> = {
    '样本编号': 'sampleCode',
    '姓名': 'name',
    '性别': 'gender',
    '年龄': 'age',
    '科室': 'department',
    '项目': 'project',
    '状态': 'status',
  }

  /**
   * 列配置（LuckySheetTable 组件必需）
   * param 无
   * return LuckySheetColumn[] 列配置数组
   */
  const COLUMNS: LuckySheetColumn[] = HEADERS.map((title, i) => ({
    key: KEY_MAP[title] ?? `col${i + 1}`,
    title,
    type: title === '年龄' ? 'number' : 'text'
  }))

  /**
   * 本地演示数据状态
   * param setSheetData：更新演示数据的方法
   * return sheetData：当前演示数据
   */
  const [sheetData, setSheetData] = useState<any[][]>(() => {
    return [
      HEADERS,
      ['A0001', '张三', '男', 32, '检验科', 'NGS-Panel', 'pending'],
      ['A0002', '李四', '女', 28, '肿瘤科', 'WES', 'pending'],
      ['A0003', '王五', '男', 41, '内分泌科', 'RNA-Seq', 'pending']
    ]
  })

  /**
   * 方法：新增一行到演示数据
   * param 无
   * return void 无返回
   */
  const handleAddRow = useCallback(() => {
    setSheetData(prev => [...prev, ['', '', '', '', '', '', 'pending']])
  }, [])

  /**
   * 方法：清空演示数据，仅保留表头
   * param 无
   * return void 无返回
   */
  const handleClear = useCallback(() => {
    setSheetData(prev => [prev[0]])
    message.success('已清空演示数据，仅保留表头')
  }, [])

  /**
   * 方法：保存演示数据到本地存储
   * param 无
   * return void 无返回
   */
  const handleSave = useCallback(() => {
    try {
      localStorage.setItem('luckysheet_demo', JSON.stringify(sheetData))
      message.success('演示数据已保存到本地存储')
    } catch (e) {
      message.error('保存失败：浏览器禁止了本地存储')
    }
  }, [sheetData])

  return (
    <Card title={<Title level={4} style={{ margin: 0 }}>Luckysheet演示</Title>}>
      <Space direction="vertical" style={{ width: '100%' }} size="middle">
        <Paragraph type="secondary">
          说明：这是一个独立的 Luckysheet 演示页面，支持直接编辑、复制粘贴和格式操作。
          为避免与外部状态冲突，本页面不对接受控数据源，仅用于展示效果。
        </Paragraph>

        <Space>
          <Button type="primary" onClick={handleAddRow}>新增行</Button>
          <Button onClick={handleClear}>清空表格</Button>
          <Button onClick={handleSave}>保存演示数据</Button>
        </Space>

        {/*
         * 组件：LuckysheetTable
         * 入参：data 初始二维数组（仅用于初始化，不会在编辑时回写覆盖）
         * 出参：无（用户编辑在 Luckysheet 内部维护）
         */}
        <div style={{ height: 'calc(100vh - 240px)', minHeight: 520, border: '1px solid #f0f0f0', width: '100%' }}>
          {/*
           * 回调：onChange
           * 作用：接收 Luckysheet 内部最新矩阵，用于演示页的“保存”与按钮交互。
           * param matrix 最新二维矩阵
           * return void 无返回
           */}
          <LuckySheetTable
            columns={COLUMNS}
            data={sheetData}
            onChange={(matrix) => setSheetData(matrix as any[][])}
          />
        </div>
      </Space>
    </Card>
  )
}

export default LuckysheetDemoPage