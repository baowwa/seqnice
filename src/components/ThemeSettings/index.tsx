import React, { useState } from 'react'
import {
  Drawer,
  Space,
  Typography,
  Radio,
  ColorPicker,
  Slider,
  Switch,
  Button,
  Divider,
  Card,
  Row,
  Col,
  message
} from 'antd'
import {
  SettingOutlined,
  SunOutlined,
  MoonOutlined,
  BgColorsOutlined,
  BorderOutlined,
  CompressOutlined,
  ReloadOutlined
} from '@ant-design/icons'
import { useTheme } from '../../contexts/ThemeContext'

const { Title, Text } = Typography

/**
 * 主题设置组件属性
 */
interface ThemeSettingsProps {
  visible: boolean
  onClose: () => void
}

/**
 * 主题设置组件
 * 提供主题模式、主色调、圆角、紧凑模式等设置
 */
const ThemeSettings: React.FC<ThemeSettingsProps> = ({ visible, onClose }) => {
  const { themeConfig, updateTheme, resetTheme } = useTheme()
  const [tempConfig, setTempConfig] = useState(themeConfig)

  /**
   * 预设主色调
   */
  const presetColors = [
    '#1890ff', // 默认蓝色
    '#52c41a', // 绿色
    '#fa8c16', // 橙色
    '#eb2f96', // 粉色
    '#722ed1', // 紫色
    '#13c2c2', // 青色
    '#f5222d', // 红色
    '#faad14'  // 黄色
  ]

  /**
   * 应用主题设置
   */
  const handleApply = () => {
    updateTheme(tempConfig)
    message.success('主题设置已应用')
    onClose()
  }

  /**
   * 重置主题设置
   */
  const handleReset = () => {
    resetTheme()
    setTempConfig({
      mode: 'light',
      primaryColor: '#1890ff',
      borderRadius: 6,
      compactMode: false
    })
    message.success('主题设置已重置')
  }

  /**
   * 更新临时配置
   */
  const updateTempConfig = (config: Partial<typeof tempConfig>) => {
    setTempConfig(prev => ({ ...prev, ...config }))
  }

  return (
    <Drawer
      title={
        <Space>
          <SettingOutlined />
          <span>主题设置</span>
        </Space>
      }
      placement="right"
      onClose={onClose}
      open={visible}
      width={320}
      footer={
        <Space style={{ width: '100%', justifyContent: 'space-between' }}>
          <Button onClick={handleReset} icon={<ReloadOutlined />}>
            重置
          </Button>
          <Space>
            <Button onClick={onClose}>取消</Button>
            <Button type="primary" onClick={handleApply}>
              应用
            </Button>
          </Space>
        </Space>
      }
    >
      <Space direction="vertical" size="large" style={{ width: '100%' }}>
        {/* 主题模式 */}
        <Card size="small">
          <Space direction="vertical" style={{ width: '100%' }}>
            <Space>
              <SunOutlined />
              <Title level={5} style={{ margin: 0 }}>主题模式</Title>
            </Space>
            <Radio.Group
              value={tempConfig.mode}
              onChange={(e) => updateTempConfig({ mode: e.target.value })}
              style={{ width: '100%' }}
            >
              <Row gutter={[8, 8]}>
                <Col span={12}>
                  <Radio.Button value="light" style={{ width: '100%', textAlign: 'center' }}>
                    <Space>
                      <SunOutlined />
                      <span>浅色</span>
                    </Space>
                  </Radio.Button>
                </Col>
                <Col span={12}>
                  <Radio.Button value="dark" style={{ width: '100%', textAlign: 'center' }}>
                    <Space>
                      <MoonOutlined />
                      <span>深色</span>
                    </Space>
                  </Radio.Button>
                </Col>
              </Row>
            </Radio.Group>
          </Space>
        </Card>

        {/* 主色调 */}
        <Card size="small">
          <Space direction="vertical" style={{ width: '100%' }}>
            <Space>
              <BgColorsOutlined />
              <Title level={5} style={{ margin: 0 }}>主色调</Title>
            </Space>
            
            {/* 预设颜色 */}
            <div>
              <Text type="secondary" style={{ fontSize: 12 }}>预设颜色</Text>
              <Row gutter={[8, 8]} style={{ marginTop: 8 }}>
                {presetColors.map(color => (
                  <Col span={6} key={color}>
                    <div
                      style={{
                        width: 32,
                        height: 32,
                        backgroundColor: color,
                        borderRadius: 4,
                        cursor: 'pointer',
                        border: tempConfig.primaryColor === color ? '2px solid #000' : '1px solid #d9d9d9',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}
                      onClick={() => updateTempConfig({ primaryColor: color })}
                    >
                      {tempConfig.primaryColor === color && (
                        <div style={{ 
                          width: 8, 
                          height: 8, 
                          backgroundColor: '#fff', 
                          borderRadius: '50%' 
                        }} />
                      )}
                    </div>
                  </Col>
                ))}
              </Row>
            </div>

            {/* 自定义颜色 */}
            <div>
              <Text type="secondary" style={{ fontSize: 12 }}>自定义颜色</Text>
              <div style={{ marginTop: 8 }}>
                <ColorPicker
                  value={tempConfig.primaryColor}
                  onChange={(color) => updateTempConfig({ primaryColor: color.toHexString() })}
                  showText
                  size="large"
                  style={{ width: '100%' }}
                />
              </div>
            </div>
          </Space>
        </Card>

        {/* 圆角设置 */}
        <Card size="small">
          <Space direction="vertical" style={{ width: '100%' }}>
            <Space>
              <BorderOutlined />
              <Title level={5} style={{ margin: 0 }}>圆角大小</Title>
            </Space>
            <div>
              <Slider
                min={0}
                max={16}
                value={tempConfig.borderRadius}
                onChange={(value) => updateTempConfig({ borderRadius: value })}
                marks={{
                  0: '0px',
                  4: '4px',
                  6: '6px',
                  8: '8px',
                  12: '12px',
                  16: '16px'
                }}
                step={1}
              />
              <Text type="secondary" style={{ fontSize: 12 }}>
                当前值: {tempConfig.borderRadius}px
              </Text>
            </div>
          </Space>
        </Card>

        {/* 紧凑模式 */}
        <Card size="small">
          <Space direction="vertical" style={{ width: '100%' }}>
            <Space style={{ width: '100%', justifyContent: 'space-between' }}>
              <Space>
                <CompressOutlined />
                <Title level={5} style={{ margin: 0 }}>紧凑模式</Title>
              </Space>
              <Switch
                checked={tempConfig.compactMode}
                onChange={(checked) => updateTempConfig({ compactMode: checked })}
              />
            </Space>
            <Text type="secondary" style={{ fontSize: 12 }}>
              启用后组件间距会更紧凑，适合小屏幕设备
            </Text>
          </Space>
        </Card>

        <Divider />

        {/* 预览区域 */}
        <Card size="small">
          <Space direction="vertical" style={{ width: '100%' }}>
            <Title level={5} style={{ margin: 0 }}>预览效果</Title>
            <div
              style={{
                padding: 16,
                backgroundColor: tempConfig.mode === 'dark' ? '#141414' : '#f5f5f5',
                borderRadius: tempConfig.borderRadius,
                border: '1px solid #d9d9d9'
              }}
            >
              <Space direction="vertical" style={{ width: '100%' }}>
                <Button 
                  type="primary" 
                  style={{ 
                    backgroundColor: tempConfig.primaryColor,
                    borderColor: tempConfig.primaryColor,
                    borderRadius: tempConfig.borderRadius
                  }}
                >
                  主要按钮
                </Button>
                <Button 
                  style={{ 
                    borderRadius: tempConfig.borderRadius,
                    borderColor: tempConfig.primaryColor,
                    color: tempConfig.primaryColor
                  }}
                >
                  次要按钮
                </Button>
                <div
                  style={{
                    padding: tempConfig.compactMode ? 8 : 12,
                    backgroundColor: tempConfig.mode === 'dark' ? '#1f1f1f' : '#fff',
                    borderRadius: tempConfig.borderRadius,
                    border: '1px solid #d9d9d9'
                  }}
                >
                  <Text>这是一个预览卡片</Text>
                </div>
              </Space>
            </div>
          </Space>
        </Card>
      </Space>
    </Drawer>
  )
}

export default ThemeSettings