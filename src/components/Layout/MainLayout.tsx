import React, { useState, useEffect } from 'react'
import { Layout, Menu, Avatar, Dropdown, Button, Breadcrumb, Space, Typography, Drawer, Badge } from 'antd'
import { Outlet, useNavigate, useLocation } from 'react-router-dom'
import {
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  DashboardOutlined,
  DatabaseOutlined,
  ProjectOutlined,
  ExperimentOutlined,
  BarChartOutlined,
  FileTextOutlined,
  UserOutlined,
  SettingOutlined,
  BellOutlined,
  BgColorsOutlined,
  TeamOutlined,
  MenuOutlined,
  MoonOutlined,
  SunOutlined,
  MedicineBoxOutlined,
  FolderOutlined
} from '@ant-design/icons'
import { useTheme } from '../../contexts/ThemeContext'
import ThemeSettings from '../ThemeSettings'

const { Header, Sider, Content } = Layout
const { Text } = Typography

/**
 * 主布局组件
 * 包含侧边栏导航、顶部导航栏和内容区域
 * 支持响应式设计，在移动端使用抽屉式侧边栏
 */
const MainLayout: React.FC = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const { themeConfig } = useTheme()
  const [collapsed, setCollapsed] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  const [drawerVisible, setDrawerVisible] = useState(false)
  const [themeSettingsVisible, setThemeSettingsVisible] = useState(false)

  /**
   * 检测屏幕尺寸变化
   */
  useEffect(() => {
    const checkScreenSize = () => {
      const mobile = window.innerWidth <= 768
      setIsMobile(mobile)
      if (mobile && !collapsed) {
        setCollapsed(true)
      }
    }

    checkScreenSize()
    window.addEventListener('resize', checkScreenSize)
    return () => window.removeEventListener('resize', checkScreenSize)
  }, [collapsed])

  /**
   * 获取菜单项
   * @returns 菜单项数组
   */
  const getMenuItems = () => {
    return [
      {
        key: 'dashboard',
        icon: <DashboardOutlined />,
        label: '工作台',
        onClick: () => {
          navigate('/dashboard')
          if (isMobile) setDrawerVisible(false)
        }
      },
      {
        key: 'archive',
        icon: <DatabaseOutlined />,
        label: '基础档案',
        children: [
          { 
            key: 'archive/customer', 
            label: '客户管理', 
            onClick: () => {
              navigate('/archive/customer')
              if (isMobile) setDrawerVisible(false)
            }
          },
          { 
            key: 'archive/sample-type', 
            label: '样本类型', 
            onClick: () => {
              navigate('/archive/sample-type')
              if (isMobile) setDrawerVisible(false)
            }
          },
          { 
            key: 'archive/equipment', 
            label: '设备管理', 
            onClick: () => {
              navigate('/archive/equipment')
              if (isMobile) setDrawerVisible(false)
            }
          },
          { 
            key: 'archive/reagent', 
            label: '试剂档案', 
            onClick: () => {
              navigate('/archive/reagent')
              if (isMobile) setDrawerVisible(false)
            }
          },
          { 
            key: 'archive/laboratory', 
            label: '实验室列表', 
            onClick: () => {
              navigate('/archive/laboratory')
              if (isMobile) setDrawerVisible(false)
            }
          },
          { 
            key: 'archive/department', 
            label: '科室列表', 
            onClick: () => {
              navigate('/archive/department')
              if (isMobile) setDrawerVisible(false)
            }
          },
          { 
            key: 'archive/experiment-group', 
            label: '实验小组', 
            onClick: () => {
              navigate('/archive/experiment-group')
              if (isMobile) setDrawerVisible(false)
            }
          }
        ]
      },
      {
        key: 'project-archive',
        icon: <FolderOutlined />,
        label: '项目档案',
        children: [
          { 
            key: 'project-archive/list', 
            label: '项目档案', 
            onClick: () => {
              navigate('/project-archive')
              if (isMobile) setDrawerVisible(false)
            }
          }
        ]
      },
      // 检测项目菜单已按要求移除

      // 检验项目管理
      {
        key: 'inspection-project',
        icon: <MedicineBoxOutlined />,
        label: '检验项目管理',
        children: [
          {
            key: 'inspection-project/library',
            label: '检验项目库',
            onClick: () => {
              navigate('/inspection-project/library')
              if (isMobile) setDrawerVisible(false)
            }
          }
        ]
      },
      {
        key: 'sample',
        icon: <ExperimentOutlined />,
        label: '样本管理',
        children: [
          {
            key: 'sample/list',
            label: '样本接收',
            onClick: () => {
              navigate('/sample/list')
              if (isMobile) setDrawerVisible(false)
            }
          },
          {
            key: 'sample/luckysheet-demo',
            label: 'Luckysheet演示',
            onClick: () => {
              navigate('/sample/luckysheet-demo')
              if (isMobile) setDrawerVisible(false)
            }
          },
          {
            key: 'sample/univer-demo',
            label: 'Univer演示',
            onClick: () => {
              navigate('/sample/univer-demo')
              if (isMobile) setDrawerVisible(false)
            }
          }
        ]
      },
      {
        key: 'experiment',
        icon: <ExperimentOutlined />,
        label: '实验管理',
        children: [
          { 
            key: 'experiment/dna-extraction', 
            label: 'DNA提取', 
            onClick: () => {
              navigate('/experiment/dna-extraction')
              if (isMobile) setDrawerVisible(false)
            }
          },
          { 
            key: 'experiment/sequencing', 
            label: '上机测序', 
            onClick: () => {
              navigate('/experiment/sequencing')
              if (isMobile) setDrawerVisible(false)
            }
          },
          { 
            key: 'experiment/chip-usage-record', 
            label: '芯片使用记录', 
            onClick: () => {
              navigate('/experiment/chip-usage-record')
              if (isMobile) setDrawerVisible(false)
            }
          },
          { 
            key: 'experiment/chip-record-summary', 
            label: '芯片记录汇总', 
            onClick: () => {
              navigate('/experiment/chip-record-summary')
              if (isMobile) setDrawerVisible(false)
            }
          }
        ]
      },
      {
        key: 'analysis',
        icon: <BarChartOutlined />,
        label: '生信分析',
        children: [
          { 
            key: 'analysis/tools', 
            label: '分析工具', 
            onClick: () => {
              navigate('/analysis/tools')
              if (isMobile) setDrawerVisible(false)
            }
          },
          { 
            key: 'analysis/tasks', 
            label: '分析任务', 
            onClick: () => {
              navigate('/analysis/tasks')
              if (isMobile) setDrawerVisible(false)
            }
          }
        ]
      },
      {
        key: 'report',
        icon: <FileTextOutlined />,
        label: '报告管理',
        children: [
          { 
            key: 'report/generate', 
            label: '报告生成', 
            onClick: () => {
              navigate('/report/generate')
              if (isMobile) setDrawerVisible(false)
            }
          },
          { 
            key: 'report/review', 
            label: '报告审核', 
            onClick: () => {
              navigate('/report/review')
              if (isMobile) setDrawerVisible(false)
            }
          },
          { 
            key: 'report/publish', 
            label: '报告发布', 
            onClick: () => {
              navigate('/report/publish')
              if (isMobile) setDrawerVisible(false)
            }
          }
        ]
      },
      {
        key: 'users',
        icon: <TeamOutlined />,
        label: '用户管理',
        onClick: () => {
          navigate('/users')
          if (isMobile) setDrawerVisible(false)
        }
      }
    ]
  }

  /**
   * 用户下拉菜单项
   */
  const userMenuItems = [
    {
      key: 'profile',
      icon: <UserOutlined />,
      label: '个人资料',
      onClick: () => navigate('/profile')
    },
    {
      key: 'settings',
      icon: <SettingOutlined />,
      label: '系统设置',
      onClick: () => navigate('/settings')
    },
    {
      key: 'theme',
      icon: <BgColorsOutlined />,
      label: '主题设置',
      onClick: () => setThemeSettingsVisible(true)
    }
  ]

  /**
   * 获取当前选中的菜单键
   */
  const getSelectedKeys = () => {
    const path = location.pathname
    if (path === '/' || path === '/dashboard') return ['dashboard']
    
    const segments = path.split('/').filter(Boolean)
    if (segments.length >= 2) {
      return [`${segments[0]}/${segments[1]}`]
    }
    return [segments[0]]
  }

  /**
   * 获取面包屑导航
   */
  const getBreadcrumbItems = () => {
    const path = location.pathname
    const segments = path.split('/').filter(Boolean)
    
    const breadcrumbNameMap: Record<string, string> = {
      dashboard: '工作台',
      samples: '样本管理',
      experiments: '实验管理',
      reports: '报告管理',
      users: '用户管理',
      profile: '个人资料',
      settings: '系统设置'
    }

    const breadcrumbItems = [
      {
        title: '首页',
        onClick: () => navigate('/dashboard')
      }
    ]

    segments.forEach((segment, index) => {
      const url = `/${segments.slice(0, index + 1).join('/')}`
      const name = breadcrumbNameMap[segment] || segment
      breadcrumbItems.push({
        title: name,
        onClick: () => navigate(url)
      })
    })

    return breadcrumbItems
  }

  const menuItems = getMenuItems()

  /**
   * 侧边栏菜单组件
   */
  const SidebarMenu = () => (
    <Menu
      theme={themeConfig.mode === 'dark' ? 'dark' : 'light'}
      mode="inline"
      selectedKeys={getSelectedKeys()}
      items={menuItems}
      style={{ 
        border: 'none',
        height: '100%'
      }}
    />
  )

  return (
    <Layout style={{ minHeight: '100vh' }}>
      {/* 桌面端侧边栏 */}
      {!isMobile && (
        <Sider
          trigger={null}
          collapsible
          collapsed={collapsed}
          width={240}
          style={{
            background: themeConfig.mode === 'dark' ? '#001529' : '#fff',
            borderRight: `1px solid ${themeConfig.mode === 'dark' ? '#303030' : '#f0f0f0'}`
          }}
        >
          <div style={{
            height: 64,
            display: 'flex',
            alignItems: 'center',
            justifyContent: collapsed ? 'center' : 'flex-start',
            padding: collapsed ? 0 : '0 24px',
            borderBottom: `1px solid ${themeConfig.mode === 'dark' ? '#303030' : '#f0f0f0'}`
          }}>
            <Text strong style={{ 
              fontSize: collapsed ? 16 : 18,
              color: themeConfig.mode === 'dark' ? '#fff' : '#1890ff'
            }}>
              {collapsed ? 'SN' : 'SeqNice测序平台'}
            </Text>
          </div>
          <SidebarMenu />
        </Sider>
      )}

      {/* 移动端抽屉 */}
      <Drawer
        title="导航菜单"
        placement="left"
        onClose={() => setDrawerVisible(false)}
        open={drawerVisible}
        styles={{ body: { padding: 0 } }}
        width={240}
      >
        <SidebarMenu />
      </Drawer>

      <Layout>
        <Header style={{
          padding: '0 16px',
          background: themeConfig.mode === 'dark' ? '#141414' : '#fff',
          borderBottom: `1px solid ${themeConfig.mode === 'dark' ? '#303030' : '#f0f0f0'}`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <Space>
            {isMobile ? (
              <Button
                type="text"
                icon={<MenuOutlined />}
                onClick={() => setDrawerVisible(true)}
              />
            ) : (
              <Button
                type="text"
                icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
                onClick={() => setCollapsed(!collapsed)}
              />
            )}
            
            {!isMobile && (
              <Breadcrumb
                items={getBreadcrumbItems()}
                style={{ marginLeft: 16 }}
              />
            )}
          </Space>

          <Space size={isMobile ? 'small' : 'middle'}>
            <Button type="text" icon={<BellOutlined />} />
            <Dropdown
              menu={{ items: userMenuItems }}
              placement="bottomRight"
              trigger={['click']}
            >
              <Space style={{ 
                cursor: 'pointer', 
                padding: '0 16px',
                alignItems: 'center',
                height: '100%'
              }}>
                <Avatar size="small" icon={<UserOutlined />} />
                {!isMobile && (
                  <div style={{ 
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'flex-start',
                    lineHeight: 1.2
                  }}>
                    <div style={{ 
                      fontSize: 14, 
                      fontWeight: 500,
                      color: themeConfig.mode === 'dark' ? '#fff' : '#262626',
                      marginBottom: 2
                    }}>系统用户</div>
                    <div style={{ 
                      fontSize: 12, 
                      color: themeConfig.mode === 'dark' ? '#8c8c8c' : '#666',
                      whiteSpace: 'nowrap'
                    }}>管理员</div>
                  </div>
                )}
              </Space>
            </Dropdown>
          </Space>
        </Header>
        
        <Content style={{
          // 非紧凑模式：统一按 2px 间距更贴边布局
          // 入参：无；出参：无（样式对象直接应用）
          margin: themeConfig.compactMode ? '16px' : '2px',
          padding: themeConfig.compactMode ? '16px' : '2px',
          background: themeConfig.mode === 'dark' ? '#141414' : '#f5f5f5',
          borderRadius: themeConfig.borderRadius,
          minHeight: 280,
          overflow: 'auto'
        }}>
          <Outlet />
        </Content>
      </Layout>

      {/* 主题设置抽屉 */}
      <ThemeSettings
        visible={themeSettingsVisible}
        onClose={() => setThemeSettingsVisible(false)}
      />
    </Layout>
  )
}

export default MainLayout
