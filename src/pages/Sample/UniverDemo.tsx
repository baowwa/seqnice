import React, { useEffect, useRef } from 'react'
import { Card, Typography, Space, Button } from 'antd'
import { createUniver, LocaleType, mergeLocales } from '@univerjs/presets'
import { UniverSheetsCorePreset } from '@univerjs/preset-sheets-core'
import UniverPresetSheetsCoreZhCN from '@univerjs/preset-sheets-core/locales/zh-CN'
import '@univerjs/preset-sheets-core/lib/index.css'

const { Title, Paragraph, Text } = Typography

/**
 * 组件名称：Univer演示页面
 * 职责说明：
 * - 在系统中提供一个关于 Univer 的演示入口与外部链接导航。
 * - 展示官网与 GitHub 地址，便于后续集成或了解功能。
 * 入参：无
 * 出参：React 组件（JSX.Element）
 */
const UniverDemoPage: React.FC = () => {
  /**
   * Univer 容器引用
   * 入参：无
   * 出参：React Ref，用于将编辑器挂载到指定 DOM。
   */
  const containerRef = useRef<HTMLDivElement | null>(null)

  /**
   * 初始化并挂载 Univer Sheets 编辑器
   * @param 无
   * @returns void
   */
  useEffect(() => {
    const { univerAPI } = createUniver({
      locale: LocaleType.ZH_CN,
      locales: {
        [LocaleType.ZH_CN]: mergeLocales(
          UniverPresetSheetsCoreZhCN,
        ),
      },
      presets: [
        UniverSheetsCorePreset({
          container: containerRef.current!,
          header: true,
          toolbar: true,
          footer: {
            sheetBar: true,
            statisticBar: true,
            menus: true,
            zoomSlider: true,
          },
        }),
      ],
    })

    // 创建一个空白工作簿
    univerAPI.createWorkbook({})

    return () => {
      // 销毁以避免内存泄漏
      univerAPI.dispose()
    }
  }, [])
  /**
   * 打开外部链接（新窗口）
   * @param url 需要打开的完整网址
   * @returns void 无返回值
   */
  const openExternal = (url: string): void => {
    window.open(url, '_blank', 'noopener,noreferrer')
  }

  return (
    <Card
      title={<Title level={4} style={{ margin: 0 }}>Univer演示</Title>}
      style={{ width: '100%' }}
    >
      <Space direction="vertical" size="middle" style={{ width: '100%' }}>
        <Paragraph>
          <Text>
            Univer 是一个前后端同构的全栈电子表格/文档/幻灯片框架，支持在 Web 和服务端创建与编辑。
            这里提供其官方入口，后续可根据需要集成到系统中。
          </Text>
        </Paragraph>

        {/* <Card type="inner" title="Univer">
          <Space direction="vertical">
            <Space>
              <Text strong>官网：</Text>
              <Button type="link" onClick={() => openExternal('https://univer.ai/')}>https://univer.ai/</Button>
            </Space>
            <Space>
              <Text strong>GitHub：</Text>
              <Button type="link" onClick={() => openExternal('https://github.com/dream-num/univer')}>https://github.com/dream-num/univer</Button>
            </Space>
          </Space>
        </Card> */}

        {/* Univer 编辑器容器 */}
        <div
          ref={containerRef}
          style={{ width: '100%', height: 'calc(100vh - 240px)', minHeight: 520, background: '#fff' }}
        />
      </Space>
    </Card>
  )
}

export default UniverDemoPage