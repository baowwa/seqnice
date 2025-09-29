import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { ConfigProvider, theme } from 'antd'
import zhCN from 'antd/locale/zh_CN'

/**
 * 主题类型定义
 */
export interface ThemeConfig {
  mode: 'light' | 'dark'
  primaryColor: string
  borderRadius: number
  compactMode: boolean
}

/**
 * 主题上下文类型
 */
interface ThemeContextType {
  themeConfig: ThemeConfig
  updateTheme: (config: Partial<ThemeConfig>) => void
  resetTheme: () => void
}

/**
 * 默认主题配置
 */
const defaultThemeConfig: ThemeConfig = {
  mode: 'light',
  primaryColor: '#1890ff',
  borderRadius: 6,
  compactMode: false
}

/**
 * 主题上下文
 */
const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

/**
 * 主题提供者组件属性
 */
interface ThemeProviderProps {
  children: ReactNode
}

/**
 * 主题提供者组件
 * 管理全局主题配置和切换
 */
export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  const [themeConfig, setThemeConfig] = useState<ThemeConfig>(() => {
    // 从localStorage读取保存的主题配置
    const savedTheme = localStorage.getItem('theme-config')
    return savedTheme ? JSON.parse(savedTheme) : defaultThemeConfig
  })

  /**
   * 更新主题配置
   * @param config 部分主题配置
   */
  const updateTheme = (config: Partial<ThemeConfig>) => {
    const newConfig = { ...themeConfig, ...config }
    setThemeConfig(newConfig)
    localStorage.setItem('theme-config', JSON.stringify(newConfig))
  }

  /**
   * 重置主题配置
   */
  const resetTheme = () => {
    setThemeConfig(defaultThemeConfig)
    localStorage.setItem('theme-config', JSON.stringify(defaultThemeConfig))
  }

  /**
   * 监听系统主题变化
   */
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
    const handleChange = (e: MediaQueryListEvent) => {
      if (themeConfig.mode === 'auto') {
        // 如果设置为自动模式，跟随系统主题
        updateTheme({ mode: e.matches ? 'dark' : 'light' })
      }
    }

    mediaQuery.addEventListener('change', handleChange)
    return () => mediaQuery.removeEventListener('change', handleChange)
  }, [themeConfig.mode])

  /**
   * 生成Ant Design主题配置
   */
  const getAntdTheme = () => {
    return {
      algorithm: themeConfig.mode === 'dark' ? theme.darkAlgorithm : theme.defaultAlgorithm,
      token: {
        colorPrimary: themeConfig.primaryColor,
        borderRadius: themeConfig.borderRadius,
        ...(themeConfig.compactMode && {
          sizeStep: 3,
          sizeUnit: 3,
          wireframe: false
        })
      },
      components: {
        Layout: {
          headerBg: themeConfig.mode === 'dark' ? '#001529' : '#fff',
          siderBg: themeConfig.mode === 'dark' ? '#001529' : '#fff',
          bodyBg: themeConfig.mode === 'dark' ? '#141414' : '#f5f5f5'
        },
        Menu: {
          itemBg: 'transparent',
          subMenuItemBg: 'transparent',
          itemSelectedBg: themeConfig.primaryColor + '15',
          itemHoverBg: themeConfig.primaryColor + '10'
        }
      }
    }
  }

  return (
    <ThemeContext.Provider value={{ themeConfig, updateTheme, resetTheme }}>
      <ConfigProvider
        locale={zhCN}
        theme={getAntdTheme()}
      >
        <div 
          className={`app-theme-${themeConfig.mode}`}
          style={{
            '--primary-color': themeConfig.primaryColor,
            '--border-radius': `${themeConfig.borderRadius}px`
          } as React.CSSProperties}
        >
          {children}
        </div>
      </ConfigProvider>
    </ThemeContext.Provider>
  )
}

/**
 * 使用主题的Hook
 * @returns 主题上下文
 */
export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext)
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider')
  }
  return context
}