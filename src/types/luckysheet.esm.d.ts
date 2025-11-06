/**
 * 模块声明：Luckysheet ESM 版本
 * 目的：为 `luckysheet/dist/luckysheet.esm.js` 提供类型声明，
 *      解决 TypeScript 在动态导入该模块时的类型缺失错误。
 * 说明：默认导出为 any，以兼容 UMD/ESM 的运行时差异。
 */
declare module 'luckysheet/dist/luckysheet.esm.js' {
  /**
   * 默认导出：Luckysheet 对象
   * @returns any（运行时提供 create、setCellValue、getAllSheets 等方法）
   */
  const luckysheet: any
  export default luckysheet
}

/**
 * 全局对象扩展：window.luckysheet
 * 目的：当回退到 UMD 版本时，提供全局变量的类型提示。
 */
declare global {
  interface Window {
    luckysheet: any
  }
}