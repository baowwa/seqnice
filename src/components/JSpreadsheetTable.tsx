/**
 * JSpreadsheetTable 组件
 *
 * 功能概述：
 * - 在 React 中封装 Jspreadsheet 网格，提供原生复制/粘贴、多单元格编辑体验。
 * - 支持通过列配置与初始数据进行渲染，并向上抛出数据变更。
 * - 兼容现有批量录入场景，替代传统表格以获得 Excel 级交互。
 *
 * 使用方式：
 * <JSpreadsheetTable columns={cols} data={rows} onChange={setRows} />
 */
import React, { useEffect, useRef } from 'react';
import jspreadsheet from 'jspreadsheet';
import 'jspreadsheet/dist/jspreadsheet.css';
import 'jsuites/dist/jsuites.css';

/**
 * 列配置接口
 * @param key 字段键
 * @param title 列标题
 * @param width 列宽（可选）
 * @param type 单元格类型（text/number/date/checkbox等，可选）
 */
export interface JSSColumn {
  key: string;
  title: string;
  width?: number;
  type?: 'text' | 'number' | 'calendar' | 'checkbox' | 'dropdown';
  source?: string[]; // 当 type=dropdown 时可选项
}

/**
 * 组件属性接口
 * @param columns 列配置
 * @param data 初始数据（数组元素为按列 key 对应的对象）
 * @param onChange 数据变更回调（返回最新二维数组与对象数组）
 */
export interface JSpreadsheetTableProps {
  columns: JSSColumn[];
  data: Record<string, any>[];
  onChange?: (rows: Record<string, any>[], matrix: any[][]) => void;
}

/**
 * 将对象数组转换为二维矩阵
 * @param rows 行对象数组
 * @param columns 列配置
 * @returns 二维数组矩阵
 */
function toMatrix(rows: Record<string, any>[], columns: JSSColumn[]): any[][] {
  return rows.map(r => columns.map(c => r[c.key] ?? ''));
}

/**
 * 将二维矩阵转换为对象数组
 * @param matrix 二维数组矩阵
 * @param columns 列配置
 * @returns 行对象数组
 */
function toObjects(matrix: any[][], columns: JSSColumn[]): Record<string, any>[] {
  return matrix.map(row => {
    const obj: Record<string, any> = {};
    columns.forEach((c, i) => {
      obj[c.key] = row[i];
    });
    return obj;
  });
}

/**
 * JSpreadsheetTable 主组件
 * @param props 组件属性
 * @returns 网格渲染容器
 */
const JSpreadsheetTable: React.FC<JSpreadsheetTableProps> = ({ columns, data, onChange }) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const jssInstanceRef = useRef<any>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    // 销毁旧实例（防止重复初始化）
    if (jssInstanceRef.current) {
      try { jssInstanceRef.current.destroy(); } catch (e) { /* 忽略 */ }
      jssInstanceRef.current = null;
    }

    // 构建列定义
    const jssColumns = columns.map(c => ({
      title: c.title,
      width: c.width ?? 160,
      type: c.type ?? 'text',
      source: c.source,
    }));

    // 初始数据矩阵
    const matrix = toMatrix(data, columns);

    /**
     * 变更回调
     * 入参：
     * - worksheet: Jspreadsheet 工作表实例
     * - cell: 变更的单元格元素
     * - x: 列索引（string | number，兼容 Jspreadsheet 类型）
     * - y: 行索引（string | number，兼容 Jspreadsheet 类型）
     * - newValue: 新值
     * - oldValue: 旧值
     * 出参：
     * - 无；内部将最新矩阵转换为对象数组并通过 onChange 抛出
     */
    const onchange = (
      worksheet: any,
      cell: HTMLElement,
      x: string | number,
      y: string | number,
      newValue: any,
      oldValue: any
    ) => {
      // 兼容不同版本 API：优先使用回调传入的 worksheet
      const newMatrix = worksheet && typeof worksheet.getJson === 'function'
        ? worksheet.getJson()
        : (jssInstanceRef.current && typeof jssInstanceRef.current.getJson === 'function'
            ? jssInstanceRef.current.getJson()
            : []);
      const rows = toObjects(newMatrix, columns);
      onChange && onChange(rows, newMatrix);
    };

    // 初始化 Jspreadsheet
    jssInstanceRef.current = jspreadsheet(containerRef.current, {
      data: matrix,
      columns: jssColumns,
      allowToolbar: true,
      allowInsertRow: true,
      allowInsertColumn: false,
      allowDeleteRow: true,
      wordWrap: false,
      lazyLoading: true,
      tableOverflow: true,
      minSpareRows: 1,
      freezeColumns: 0,
      // 关键：复制粘贴默认启用，无需额外配置
      onchange,
    });

    return () => {
      if (jssInstanceRef.current) {
        try { jssInstanceRef.current.destroy(); } catch (e) { /* 忽略 */ }
        jssInstanceRef.current = null;
      }
    };
    // 仅在初次与列变化时重新初始化
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [columns]);

  // 外部数据更新（如父级合并或重置），同步到网格
  useEffect(() => {
    const inst = jssInstanceRef.current;
    if (inst) {
      const matrix = toMatrix(data, columns);
      inst.setData(matrix);
    }
  }, [data, columns]);

  return <div ref={containerRef} style={{ width: '100%', height: 420 }} />;
};

export default JSpreadsheetTable;