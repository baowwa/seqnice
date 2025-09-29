import React from 'react'

/**
 * 性能监控工具类
 * 提供页面性能监控、组件渲染性能分析等功能
 */

/**
 * 性能指标接口
 */
export interface PerformanceMetrics {
  /** 首次内容绘制时间 */
  fcp?: number
  /** 最大内容绘制时间 */
  lcp?: number
  /** 首次输入延迟 */
  fid?: number
  /** 累积布局偏移 */
  cls?: number
  /** 首次字节时间 */
  ttfb?: number
  /** 页面加载完成时间 */
  loadTime?: number
  /** DOM内容加载完成时间 */
  domContentLoaded?: number
}

/**
 * 性能监控类
 */
class PerformanceMonitor {
  private metrics: PerformanceMetrics = {}
  private observers: PerformanceObserver[] = []

  /**
   * 初始化性能监控
   */
  init(): void {
    if (typeof window === 'undefined') return

    this.observeWebVitals()
    this.observeNavigationTiming()
    this.observeResourceTiming()
  }

  /**
   * 监控Web Vitals指标
   */
  private observeWebVitals(): void {
    // 监控LCP (Largest Contentful Paint)
    if ('PerformanceObserver' in window) {
      try {
        const lcpObserver = new PerformanceObserver((list) => {
          const entries = list.getEntries()
          const lastEntry = entries[entries.length - 1] as any
          this.metrics.lcp = lastEntry.startTime
        })
        lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] })
        this.observers.push(lcpObserver)
      } catch (e) {
        console.warn('LCP observer not supported')
      }

      // 监控FID (First Input Delay)
      try {
        const fidObserver = new PerformanceObserver((list) => {
          const entries = list.getEntries()
          entries.forEach((entry: any) => {
            this.metrics.fid = entry.processingStart - entry.startTime
          })
        })
        fidObserver.observe({ entryTypes: ['first-input'] })
        this.observers.push(fidObserver)
      } catch (e) {
        console.warn('FID observer not supported')
      }

      // 监控CLS (Cumulative Layout Shift)
      try {
        let clsValue = 0
        const clsObserver = new PerformanceObserver((list) => {
          const entries = list.getEntries()
          entries.forEach((entry: any) => {
            if (!entry.hadRecentInput) {
              clsValue += entry.value
              this.metrics.cls = clsValue
            }
          })
        })
        clsObserver.observe({ entryTypes: ['layout-shift'] })
        this.observers.push(clsObserver)
      } catch (e) {
        console.warn('CLS observer not supported')
      }
    }
  }

  /**
   * 监控导航时间
   */
  private observeNavigationTiming(): void {
    if ('performance' in window && 'getEntriesByType' in performance) {
      window.addEventListener('load', () => {
        setTimeout(() => {
          const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming
          if (navigation) {
            this.metrics.ttfb = navigation.responseStart - navigation.fetchStart
            this.metrics.fcp = navigation.domContentLoadedEventEnd - navigation.fetchStart
            this.metrics.loadTime = navigation.loadEventEnd - navigation.fetchStart
            this.metrics.domContentLoaded = navigation.domContentLoadedEventEnd - navigation.fetchStart
          }
        }, 0)
      })
    }
  }

  /**
   * 监控资源加载时间
   */
  private observeResourceTiming(): void {
    if ('PerformanceObserver' in window) {
      try {
        const resourceObserver = new PerformanceObserver((list) => {
          const entries = list.getEntries()
          entries.forEach((entry) => {
            // 可以在这里分析慢资源
            if (entry.duration > 1000) {
              console.warn(`Slow resource detected: ${entry.name} took ${entry.duration}ms`)
            }
          })
        })
        resourceObserver.observe({ entryTypes: ['resource'] })
        this.observers.push(resourceObserver)
      } catch (e) {
        console.warn('Resource observer not supported')
      }
    }
  }

  /**
   * 获取当前性能指标
   */
  getMetrics(): PerformanceMetrics {
    return { ...this.metrics }
  }

  /**
   * 上报性能数据
   */
  reportMetrics(): void {
    const metrics = this.getMetrics()
    
    // 在开发环境下打印性能指标
    if (process.env.NODE_ENV === 'development') {
      console.group('🚀 Performance Metrics')
      console.table(metrics)
      console.groupEnd()
    }

    // 在生产环境下可以发送到监控服务
    if (process.env.NODE_ENV === 'production') {
      // 这里可以集成第三方监控服务，如Google Analytics、Sentry等
      // sendToAnalytics(metrics)
    }
  }

  /**
   * 清理监控器
   */
  cleanup(): void {
    this.observers.forEach(observer => observer.disconnect())
    this.observers = []
  }
}

/**
 * 组件性能监控装饰器
 */
export function withPerformanceMonitoring<T extends React.ComponentType<any>>(
  WrappedComponent: T,
  componentName?: string
): T {
  const displayName = componentName || WrappedComponent.displayName || WrappedComponent.name || 'Component'
  
  const PerformanceWrapper = (props: any) => {
    const startTime = performance.now()
    
    React.useEffect(() => {
      const endTime = performance.now()
      const renderTime = endTime - startTime
      
      if (process.env.NODE_ENV === 'development' && renderTime > 16) {
        console.warn(`⚠️ Slow component render: ${displayName} took ${renderTime.toFixed(2)}ms`)
      }
    })

    return React.createElement(WrappedComponent, props)
  }

  PerformanceWrapper.displayName = `withPerformanceMonitoring(${displayName})`
  
  return PerformanceWrapper as T
}

/**
 * 性能监控Hook
 */
export function usePerformanceMonitoring(componentName: string) {
  const startTime = React.useRef<number>(performance.now())
  
  React.useEffect(() => {
    const endTime = performance.now()
    const renderTime = endTime - startTime.current
    
    if (process.env.NODE_ENV === 'development' && renderTime > 16) {
      console.warn(`⚠️ Slow component render: ${componentName} took ${renderTime.toFixed(2)}ms`)
    }
  })

  const measureAsync = React.useCallback(async (taskName: string, task: () => Promise<any>) => {
    const start = performance.now()
    try {
      const result = await task()
      const end = performance.now()
      
      if (process.env.NODE_ENV === 'development') {
        console.log(`📊 ${taskName} completed in ${(end - start).toFixed(2)}ms`)
      }
      
      return result
    } catch (error) {
      const end = performance.now()
      console.error(`❌ ${taskName} failed after ${(end - start).toFixed(2)}ms:`, error)
      throw error
    }
  }, [])

  return { measureAsync }
}

// 创建全局性能监控实例
export const performanceMonitor = new PerformanceMonitor()

// 自动初始化性能监控
if (typeof window !== 'undefined') {
  performanceMonitor.init()
  
  // 页面加载完成后上报性能数据
  window.addEventListener('load', () => {
    setTimeout(() => {
      performanceMonitor.reportMetrics()
    }, 2000)
  })
}

export default performanceMonitor