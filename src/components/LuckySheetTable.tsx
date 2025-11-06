import React, { useEffect, useMemo, useRef } from 'react'
// 样式资源通过打包器引入，避免浏览器 ORB 阻断问题
import 'luckysheet/dist/plugins/plugins.css'
import 'luckysheet/dist/css/luckysheet.css'
import 'luckysheet/dist/assets/iconfont/iconfont.css'
// 使用 ESM 版本以兼容 Vite
// 动态导入：优先 ESM，失败回退 UMD，确保在 Vite 环境可用

/**
 * LuckySheetTable 组件
 *
 * 设计目标：提供一个基于 Luckysheet 的表格视图，支持原生复制/粘贴、批量录入、
 * 与业务数据矩阵的双向同步。组件对外暴露与 JSpreadsheetTable 兼容的 props，
 * 以便在页面中无缝替换。
 *
 * 使用说明：
 * - 传入 columns（列配置）与 data（二维矩阵）进行初始化；
 * - 用户在表格内的编辑会通过 onChange 回调返回最新的二维矩阵；
 * - 可结合 toObjects 方法将矩阵转换为对象数组以适配后端字段。
 */

/**
 * 列配置接口
 * @property key 列对应的业务字段键名
 * @property title 列显示名称
 * @property type 列类型（text/number/date），用于未来扩展单元格格式
 */
export interface LuckySheetColumn {
  key: string
  title: string
  type?: 'text' | 'number' | 'date'
}

/**
 * 组件入参
 * @param columns 表格列配置
 * @param data 初始数据矩阵（行列二维数组）
 * @param onChange 数据变更回调：返回最新的二维矩阵
 */
export interface LuckySheetTableProps {
  columns: LuckySheetColumn[]
  data?: (string | number)[][]
  onChange?: (matrix: (string | number)[][]) => void
}

/**
 * 将 Luckysheet 的单元格对象转换为原始值（v）或显示值（m）
 * @param cell 单元格对象
 * @returns 原始值或显示值，默认空字符串
 */
function cellToValue(cell: any): string | number {
  if (!cell) return ''
  const v = (cell.v ?? cell.m)
  return v == null ? '' : v
}

/**
 * 规范化外部传入的数据为二维矩阵
 * @param columns 列配置（用于对象数组到矩阵的映射）
 * @param data 外部数据（可能是二维矩阵或对象数组）
 * @returns 二维矩阵
 */
function normalizeToMatrix(columns: LuckySheetColumn[], data?: any): (string | number)[][] {
  if (!data) return [[]]
  // 已是矩阵
  if (Array.isArray(data) && (data.length === 0 || Array.isArray(data[0]))) {
    return data as (string | number)[][]
  }
  // 对象数组 -> 按列顺序映射为矩阵
  if (Array.isArray(data) && typeof data[0] === 'object') {
    const keys = columns.map(c => c.key)
    return data.map((row: Record<string, any>) => keys.map(k => row?.[k] ?? ''))
  }
  return [[]]
}

/**
 * 从 Luckysheet 当前工作簿读取整个工作表为二维矩阵
 * @returns 二维矩阵，空表返回空数组
 */
export function readMatrixFromLuckysheet(): (string | number)[][] {
  try {
    const luckysheet: any = (window as any).luckysheet
    const sheets = luckysheet?.getAllSheets?.()
    if (!sheets || sheets.length === 0) return []
    const raw: any[][] = sheets[0].data || []
    return raw.map((row) => (row || []).map((cell) => cellToValue(cell)))
  } catch (e) {
    return []
  }
}

/**
 * 将二维矩阵转换为对象数组（按照列配置映射）
 * @param columns 列配置
 * @param matrix 二维矩阵
 * @returns 对象数组，每行一个对象
 */
export function toObjects(columns: LuckySheetColumn[], matrix: (string | number)[][]): Record<string, any>[] {
  const keys = columns.map((c) => c.key)
  return (matrix || []).map((row) => {
    const obj: Record<string, any> = {}
    keys.forEach((k, i) => {
      obj[k] = row?.[i] ?? ''
    })
    return obj
  })
}

/**
 * LuckySheetTable 主组件
 *
 * @param props 组件入参（见 LuckySheetTableProps）
 * @returns React 元素
 */
const LuckySheetTable: React.FC<LuckySheetTableProps> = ({ columns, data, onChange }) => {
  const containerRef = useRef<HTMLDivElement | null>(null)
  const containerId = useMemo(() => `luckysheet-${Math.random().toString(36).slice(2)}` , [])
  // 防重复创建标记（StrictMode 下 useEffect 可能触发两次）
  const createdRef = useRef<boolean>(false)

  // 初始化 Luckysheet
  useEffect(() => {
    if (!containerRef.current) return

    // 防止重复创建导致的渲染与事件问题
    if (createdRef.current) return
    try { (window as any).luckysheet?.destroy?.() } catch {}

    const initialMatrix: (string | number)[][] = normalizeToMatrix(columns, data)

    // 生成 Luckysheet 初始化所需的 celldata（更稳健的初始化方式）
    const celldata: any[] = []
    for (let r = 0; r < initialMatrix.length; r++) {
      const row = initialMatrix[r] || []
      for (let c = 0; c < Math.max(columns.length, row.length); c++) {
        const v = row[c]
        if (v !== undefined && v !== null && v !== '') {
          celldata.push({ r, c, v: { v } })
        }
      }
    }

    /**
     * 加载 Luckysheet（UMD 版本），并确保依赖脚本存在。
     * 入参：无
     * 出参：Promise<any>，解析为全局 luckysheet 对象（window.luckysheet）。
     */
    // 加载 Luckysheet：强制使用 UMD 版本并确保 jQuery 与插件脚本存在
    const loadLuckysheet = async (): Promise<any> => {
      // 1) 确保 jQuery 存在
      const jqSrc = 'https://unpkg.com/jquery@3.6.0/dist/jquery.min.js'
      await new Promise<void>((resolve) => {
        if ((window as any).jQuery || (window as any).$) return resolve()
        const s = document.createElement('script')
        s.src = jqSrc
        s.onload = () => resolve()
        s.onerror = () => resolve()
        document.body.appendChild(s)
      })

      // 2) 可选：加载 Luckysheet 插件脚本（部分功能依赖），若已存在则跳过
      const pluginSrc = 'https://unpkg.com/luckysheet@2.1.13/dist/plugins/js/plugin.js'
      await new Promise<void>((resolve) => {
        if ([...document.querySelectorAll('script')].some(s => s.src === pluginSrc)) return resolve()
        const s = document.createElement('script')
        s.src = pluginSrc
        s.onload = () => resolve()
        s.onerror = () => resolve()
        document.body.appendChild(s)
      })

      // 3) 加载 UMD 版本主脚本
      const src = 'https://unpkg.com/luckysheet@2.1.13/dist/luckysheet.umd.js'
      await new Promise<void>((resolve, reject) => {
        if ([...document.querySelectorAll('script')].some(s => s.src === src)) return resolve()
        const s = document.createElement('script')
        s.src = src
        s.onload = () => resolve()
        s.onerror = () => reject(new Error('加载 luckysheet 失败'))
        document.body.appendChild(s)
      })

      return (window as any).luckysheet
    }

    loadLuckysheet().then((luckysheet: any) => {
      /**
       * 初始化 Luckysheet 工作表。
       * 入参：无（使用组件内状态和传入 props）。
       * 出参：无（在指定容器中渲染 Luckysheet）。
       * 说明：显式设置 allowEdit=true 与 editMode=false，确保可编辑单元格。
       */
      luckysheet?.create({
        container: containerId,
        title: '批量录入',
        lang: 'zh',
        allowEdit: true,
        editMode: false,
        showinfobar: false,
        showtoolbar: true,
        showsheetbar: true,
        showstatisticBar: true,
        sheetFormulaBar: true,
        allowCopy: true,
        enableAddRow: true,
        enableAddBackTop: true,
        showConfigWindowResize: true,
        column: Math.max(columns.length, 26),
        row: Math.max(initialMatrix.length + 10, 50),
        data: [
          {
            name: 'Sheet1',
            order: 0,
            status: 1,
            index: 0,
            row: Math.max(initialMatrix.length + 10, 50),
            column: Math.max(columns.length, 26),
            celldata,
            config: {},
          },
        ],
        hook: {
          /**
           * Luckysheet 变更钩子：每次用户操作更新后触发
           * @param operate 当前操作上下文（包含 curdata、选区等）
           */
          updated: (operate: any) => {
            try {
              const cur: any[][] = operate?.curdata || []
              const matrix = cur.map((row) => (row || []).map((cell) => cellToValue(cell)))
              onChange?.(matrix)
            } catch (e) {
              const matrix = readMatrixFromLuckysheet()
              onChange?.(matrix)
            }
          },
        },
      })
      createdRef.current = true
    }).catch(() => {})

    return () => {
      try { (window as any).luckysheet?.destroy?.() } catch {}
    }
  // 仅在首次渲染创建，后续数据通过 updated 钩子同步
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [containerId])

  // 外部 data 更新写入：为避免用户编辑被回滚，默认关闭。
  // 如需从外部强制刷新数据，可改为显式方法或开启受控模式。

  return <div id={containerId} ref={containerRef} style={{ height: '100%', width: '100%', minHeight: 480 }} />
}

export default LuckySheetTable