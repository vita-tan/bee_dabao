import React, { useEffect, useRef, useState, useCallback } from 'react'
import { Row, Col, Card, Typography, Skeleton, Tag, Badge } from 'antd'
import {
  TeamOutlined,
  BankOutlined,
  EnvironmentOutlined,
  ExperimentOutlined,
  ArrowUpOutlined,
  AuditOutlined,
  FileProtectOutlined,
  NotificationOutlined,
  ReloadOutlined,
  ClockCircleOutlined,
} from '@ant-design/icons'
import * as echarts from 'echarts'
import { useRequest } from '@/hooks/useRequest'
import { getStatsOverview } from '@/api/notification'

const { Title, Text } = Typography

/* ============ 统计卡片渐变定义 ============ */
const statCardGradients = [
  {
    title: '蜂农总数',
    valueKey: 'beekeeperCount' as const,
    icon: <TeamOutlined />,
    gradient: 'linear-gradient(135deg, #f5a623 0%, #f9d423 100%)',
    bg: '#fff7e6',
    accent: '#f5a623',
    shadow: '0 4px 20px rgba(245, 166, 35, 0.2)',
  },
  {
    title: '蜂场总数',
    valueKey: 'apiaryCount' as const,
    icon: <BankOutlined />,
    gradient: 'linear-gradient(135deg, #52c41a 0%, #73d13d 100%)',
    bg: '#f6ffed',
    accent: '#52c41a',
    shadow: '0 4px 20px rgba(82, 196, 26, 0.2)',
  },
  {
    title: '蜂群总数',
    valueKey: 'colonyCount' as const,
    icon: <EnvironmentOutlined />,
    gradient: 'linear-gradient(135deg, #1677ff 0%, #4096ff 100%)',
    bg: '#e6f4ff',
    accent: '#1677ff',
    shadow: '0 4px 20px rgba(22, 119, 255, 0.2)',
  },
  {
    title: '年度产量(kg)',
    valueKey: 'yearProduction' as const,
    icon: <ExperimentOutlined />,
    gradient: 'linear-gradient(135deg, #722ed1 0%, #9254de 100%)',
    bg: '#f9f0ff',
    accent: '#722ed1',
    shadow: '0 4px 20px rgba(114, 46, 209, 0.2)',
  },
]

/* ============ 动画数字组件 ============ */
const AnimatedNumber: React.FC<{ value: number | string; duration?: number }> = ({
  value,
  duration = 800,
}) => {
  const [display, setDisplay] = useState<number>(() =>
    typeof value === 'number' && !isNaN(value) ? value : 0,
  )
  const prevValueRef = useRef<number | string>(value)
  const rafRef = useRef<number>()

  useEffect(() => {
    // 仅当 value 变化时启动动画
    if (prevValueRef.current === value) return
    prevValueRef.current = value

    if (typeof value !== 'number' || isNaN(value)) {
      setDisplay(0)
      return
    }

    const target = value
    const start = display
    const startTime = performance.now()

    const animate = (now: number) => {
      const elapsed = now - startTime
      const progress = Math.min(elapsed / duration, 1)
      const eased = 1 - Math.pow(1 - progress, 3)
      const current = Math.round(start + (target - start) * eased)
      setDisplay(current)
      if (progress < 1) {
        rafRef.current = requestAnimationFrame(animate)
      }
    }
    rafRef.current = requestAnimationFrame(animate)
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value, duration])

  if (typeof value !== 'number' || isNaN(value)) {
    return <>{value}</>
  }
  return <>{display.toLocaleString()}</>
}

/* ============ OverviewPage 主组件 ============ */
const OverviewPage: React.FC = () => {
  const colonyChartRef = useRef<HTMLDivElement>(null)
  const productionChartRef = useRef<HTMLDivElement>(null)
  const colonyChartInst = useRef<echarts.ECharts>()
  const productionChartInst = useRef<echarts.ECharts>()
  const [lastUpdated, setLastUpdated] = useState<Date>()

  const { data: stats, loading, refresh } = useRequest(
    useCallback(() => {
      return getStatsOverview().then((d) => {
        setLastUpdated(new Date())
        return d
      })
    }, []),
  )

  /* ============ ECharts 初始化 ============ */
  useEffect(() => {
    if (!stats || !colonyChartRef.current || !productionChartRef.current) return

    // 销毁旧实例
    colonyChartInst.current?.dispose()
    productionChartInst.current?.dispose()

    const months = ['1月','2月','3月','4月','5月','6月','7月','8月','9月','10月','11月','12月']

    // --- 蜂群数量趋势（渐变面积图）---
    const cChart = echarts.init(colonyChartRef.current)
    colonyChartInst.current = cChart
    const colonyData = [820, 932, 901, 934, 1290, 1330, 1320, 1450, 1380, 1200, 980, 860]

    cChart.setOption({
      tooltip: {
        trigger: 'axis',
        backgroundColor: 'rgba(255,255,255,0.96)',
        borderColor: '#e8e8e8',
        borderWidth: 1,
        textStyle: { color: '#333', fontSize: 13 },
        extraCssText: 'border-radius: 8px; box-shadow: 0 8px 24px rgba(0,0,0,0.08);',
        axisPointer: {
          type: 'cross',
          crossStyle: { color: '#999' },
          lineStyle: { type: 'dashed', color: '#d9d9d9' },
        },
      },
      grid: { left: 48, right: 24, top: 40, bottom: 36 },
      xAxis: {
        type: 'category',
        data: months,
        boundaryGap: false,
        axisLine: { lineStyle: { color: '#e8e8e8' } },
        axisTick: { show: false },
        axisLabel: { color: '#8c8c8c', fontSize: 11 },
      },
      yAxis: {
        type: 'value',
        name: '群数',
        nameTextStyle: { color: '#8c8c8c', fontSize: 11 },
        splitLine: { lineStyle: { color: '#f0f0f0', type: 'dashed' } },
        axisLabel: { color: '#8c8c8c', fontSize: 11 },
      },
      series: [{
        name: '蜂群数量',
        type: 'line',
        smooth: true,
        symbol: 'circle',
        symbolSize: 6,
        data: colonyData,
        lineStyle: { color: '#f5a623', width: 3 },
        itemStyle: { color: '#f5a623' },
        areaStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: 'rgba(245,166,35,0.25)' },
            { offset: 1, color: 'rgba(245,166,35,0.02)' },
          ]),
        },
        emphasis: {
          focus: 'series',
          itemStyle: { shadowBlur: 12, shadowColor: 'rgba(245,166,35,0.5)' },
        },
      }],
      animationDuration: 1200,
      animationEasing: 'cubicOut',
    })

    // --- 蜂蜜产量统计（渐变柱状图）---
    const pChart = echarts.init(productionChartRef.current)
    productionChartInst.current = pChart
    const prodData = [120, 200, 150, 80, 320, 450, 480, 520, 380, 250, 130, 90]

    pChart.setOption({
      tooltip: {
        trigger: 'axis',
        backgroundColor: 'rgba(255,255,255,0.96)',
        borderColor: '#e8e8e8',
        borderWidth: 1,
        textStyle: { color: '#333', fontSize: 13 },
        extraCssText: 'border-radius: 8px; box-shadow: 0 8px 24px rgba(0,0,0,0.08);',
        axisPointer: { type: 'shadow', shadowStyle: { color: 'rgba(0,0,0,0.03)' } },
      },
      grid: { left: 52, right: 24, top: 40, bottom: 36 },
      xAxis: {
        type: 'category',
        data: months,
        axisLine: { lineStyle: { color: '#e8e8e8' } },
        axisTick: { show: false },
        axisLabel: { color: '#8c8c8c', fontSize: 11 },
      },
      yAxis: {
        type: 'value',
        name: '产量(kg)',
        nameTextStyle: { color: '#8c8c8c', fontSize: 11 },
        splitLine: { lineStyle: { color: '#f0f0f0', type: 'dashed' } },
        axisLabel: { color: '#8c8c8c', fontSize: 11 },
      },
      series: [{
        name: '蜂蜜产量',
        type: 'bar',
        data: prodData,
        barWidth: 18,
        emphasis: {
          itemStyle: { shadowBlur: 12, shadowColor: 'rgba(245,166,35,0.4)' },
        },
        itemStyle: {
          borderRadius: [6, 6, 0, 0],
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: '#f9d423' },
            { offset: 1, color: '#f5a623' },
          ]),
        },
      }],
      animationDuration: 1200,
      animationEasing: 'cubicOut',
      animationDelay: (idx: number) => idx * 60,
    })

    /* --- resize --- */
    const handleResize = () => {
      cChart.resize()
      pChart.resize()
    }
    window.addEventListener('resize', handleResize)
    const ro1 = new ResizeObserver(() => cChart.resize())
    const ro2 = new ResizeObserver(() => pChart.resize())
    ro1.observe(colonyChartRef.current)
    ro2.observe(productionChartRef.current)

    return () => {
      window.removeEventListener('resize', handleResize)
      ro1.disconnect()
      ro2.disconnect()
      cChart.dispose()
      pChart.dispose()
    }
  }, [stats])

  /* ============ 加载骨架屏 ============ */
  if (loading && !stats) {
    return (
      <div>
        <Skeleton.Input active size="small" style={{ width: 120, marginBottom: 24 }} />
        <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
          {[1, 2, 3, 4].map((i) => (
            <Col xs={24} sm={12} lg={6} key={i}>
              <Card>
                <Skeleton active paragraph={{ rows: 1 }} />
              </Card>
            </Col>
          ))}
        </Row>
        <Row gutter={[16, 16]}>
          <Col xs={24} lg={12}>
            <Card>
              <Skeleton active paragraph={{ rows: 4 }} />
            </Card>
          </Col>
          <Col xs={24} lg={12}>
            <Card>
              <Skeleton active paragraph={{ rows: 4 }} />
            </Card>
          </Col>
        </Row>
      </div>
    )
  }

  return (
    <div>
      {/* ===== 页面标题 + 刷新信息 ===== */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: 24,
          flexWrap: 'wrap',
          gap: 12,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 12 }}>
          <Title level={4} style={{ margin: 0 }}>
            数据总览
          </Title>
          {lastUpdated && (
            <Text type="secondary" style={{ fontSize: 12 }}>
              <ClockCircleOutlined style={{ marginRight: 4 }} />
              更新于 {lastUpdated.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })}
            </Text>
          )}
        </div>
        <Tag
          color="orange"
          style={{ cursor: 'pointer', borderRadius: 6, padding: '2px 12px' }}
          onClick={refresh}
        >
          <ReloadOutlined style={{ marginRight: 4 }} spin={loading} />
          刷新数据
        </Tag>
      </div>

      {/* ===== 待审核提醒横幅 ===== */}
      {stats?.pendingAuditCount > 0 && (
        <Card
          style={{
            marginBottom: 24,
            background: 'linear-gradient(135deg, #fffbe6 0%, #fff1b8 100%)',
            border: '1px solid #ffd666',
            borderRadius: 12,
          }}
          bodyStyle={{ padding: '16px 24px' }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: 12,
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: 10,
                  background: '#f5a623',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#fff',
                  fontSize: 18,
                }}
              >
                <AuditOutlined />
              </div>
              <div>
                <Text strong style={{ fontSize: 15 }}>
                  有{' '}
                  <span style={{ color: '#d4380d', fontSize: 22, fontWeight: 700 }}>
                    {stats.pendingAuditCount}
                  </span>{' '}
                  位新蜂农等待审核
                </Text>
                <br />
                <Text type="secondary" style={{ fontSize: 12 }}>
                  请尽快前往蜂农管理页面进行审核处理
                </Text>
              </div>
            </div>
            <a href="/beekeepers/pending" style={{ fontWeight: 500, whiteSpace: 'nowrap' }}>
              前往审核 →
            </a>
          </div>
        </Card>
      )}

      {/* ===== 统计指标卡片 ===== */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        {statCardGradients.map((card) => (
          <Col xs={24} sm={12} lg={6} key={card.title}>
            <Card
              style={{
                borderRadius: 12,
                border: 'none',
                overflow: 'hidden',
                position: 'relative',
                cursor: 'default',
                transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
              }}
              bodyStyle={{ padding: '20px 24px', position: 'relative', zIndex: 1 }}
              styles={{
                body: { padding: '20px 24px', position: 'relative', zIndex: 1 },
              }}
              onMouseEnter={(e) => {
                ;(e.currentTarget as HTMLElement).style.transform = 'translateY(-4px)'
                ;(e.currentTarget as HTMLElement).style.boxShadow = card.shadow
              }}
              onMouseLeave={(e) => {
                ;(e.currentTarget as HTMLElement).style.transform = 'translateY(0)'
                ;(e.currentTarget as HTMLElement).style.boxShadow = 'none'
              }}
            >
              {/* 顶部彩色装饰条 */}
              <div
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  height: 3,
                  background: card.gradient,
                }}
              />
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                <div style={{ flex: 1 }}>
                  <Text
                    type="secondary"
                    style={{ fontSize: 13, display: 'block', marginBottom: 8 }}
                  >
                    {card.title}
                  </Text>
                  <div
                    style={{
                      fontSize: 32,
                      fontWeight: 800,
                      lineHeight: 1.2,
                      color: '#1a1a2e',
                    }}
                  >
                    <AnimatedNumber value={stats?.[card.valueKey] ?? '--'} />
                  </div>
                  {/* 变化趋势指示（模拟） */}
                  <div style={{ marginTop: 8, fontSize: 12 }}>
                    <ArrowUpOutlined style={{ color: '#52c41a', marginRight: 4 }} />
                    <Text style={{ color: '#52c41a', fontWeight: 500 }}>＋12.5%</Text>
                    <Text type="secondary" style={{ marginLeft: 4 }}>
                      vs 上月
                    </Text>
                  </div>
                </div>
                <div
                  style={{
                    width: 48,
                    height: 48,
                    borderRadius: 12,
                    background: card.bg,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 24,
                    color: card.accent,
                    flexShrink: 0,
                  }}
                >
                  {card.icon}
                </div>
              </div>
            </Card>
          </Col>
        ))}
      </Row>

      {/* ===== 快捷操作 ===== */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        {[
          { icon: <AuditOutlined />, label: '蜂农审核', path: '/beekeepers/pending', color: '#fa8c16', bg: '#fff7e6' },
          { icon: <FileProtectOutlined />, label: '补贴发放', path: '/subsidy/records', color: '#52c41a', bg: '#f6ffed' },
          { icon: <NotificationOutlined />, label: '发布通知', path: '/notifications', color: '#1677ff', bg: '#e6f4ff' },
          { icon: <ExperimentOutlined />, label: '生产记录', path: '/production/harvests', color: '#722ed1', bg: '#f9f0ff' },
        ].map((action) => (
          <Col xs={12} sm={6} key={action.label}>
            <a href={action.path} style={{ display: 'block', textDecoration: 'none' }}>
              <Card
                size="small"
                style={{
                  borderRadius: 10,
                  border: '1px solid #f0f0f0',
                  transition: 'all 0.25s',
                }}
                bodyStyle={{ padding: '14px 16px' }}
                styles={{ body: { padding: '14px 16px' } }}
                onMouseEnter={(e) => {
                  ;(e.currentTarget as HTMLElement).style.borderColor = action.color
                  ;(e.currentTarget as HTMLElement).style.boxShadow = `0 2px 12px rgba(0,0,0,0.06)`
                }}
                onMouseLeave={(e) => {
                  ;(e.currentTarget as HTMLElement).style.borderColor = '#f0f0f0'
                  ;(e.currentTarget as HTMLElement).style.boxShadow = 'none'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div
                    style={{
                      width: 34,
                      height: 34,
                      borderRadius: 8,
                      background: action.bg,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: 16,
                      color: action.color,
                    }}
                  >
                    {action.icon}
                  </div>
                  <Text style={{ fontSize: 13, fontWeight: 500 }}>{action.label}</Text>
                </div>
              </Card>
            </a>
          </Col>
        ))}
      </Row>

      {/* ===== 图表区 ===== */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} lg={12}>
          <Card
            title={
              <span style={{ fontSize: 15, fontWeight: 600 }}>蜂群数量趋势</span>
            }
            extra={
              <Badge status="processing" text="近12月" />
            }
            style={{ borderRadius: 12, border: '1px solid #f0f0f0' }}
            bodyStyle={{ padding: '12px 8px' }}
            styles={{ body: { padding: '12px 8px' } }}
          >
            <div ref={colonyChartRef} style={{ height: 280, width: '100%' }} />
          </Card>
        </Col>
        <Col xs={24} lg={12}>
          <Card
            title={
              <span style={{ fontSize: 15, fontWeight: 600 }}>蜂蜜产量统计</span>
            }
            extra={
              <Badge status="processing" text="近12月" />
            }
            style={{ borderRadius: 12, border: '1px solid #f0f0f0' }}
            bodyStyle={{ padding: '12px 8px' }}
            styles={{ body: { padding: '12px 8px' } }}
          >
            <div ref={productionChartRef} style={{ height: 280, width: '100%' }} />
          </Card>
        </Col>
      </Row>

      {/* ===== 最新注册 + 待审核 ===== */}
      <Row gutter={[16, 16]}>
        <Col xs={24} lg={10}>
          <Card
            title={
              <span style={{ fontSize: 15, fontWeight: 600 }}>最新注册蜂农</span>
            }
            style={{ borderRadius: 12, border: '1px solid #f0f0f0' }}
            bodyStyle={{ padding: '4px 20px' }}
            styles={{ body: { padding: '4px 20px' } }}
          >
            {stats?.recentBeekeepers?.length ? (
              stats.recentBeekeepers.map((bk: any, idx: number) => {
                const initials = (bk.name || '?')[0]
                const colors = ['#f5a623', '#52c41a', '#1677ff', '#722ed1', '#fa8c16']
                const color = colors[idx % colors.length]
                return (
                  <div
                    key={bk.id}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 12,
                      padding: '12px 0',
                      borderBottom: idx < stats.recentBeekeepers.length - 1 ? '1px solid #f5f5f5' : 'none',
                    }}
                  >
                    <div
                      style={{
                        width: 36,
                        height: 36,
                        borderRadius: '50%',
                        background: color,
                        color: '#fff',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontWeight: 700,
                        fontSize: 16,
                        flexShrink: 0,
                      }}
                    >
                      {initials}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <Text strong style={{ fontSize: 14, display: 'block' }}>
                        {bk.name}
                      </Text>
                      <Text type="secondary" style={{ fontSize: 12 }}>
                        蜂农 ID: {bk.id}
                      </Text>
                    </div>
                    {bk.createdAt && (
                      <Text type="secondary" style={{ fontSize: 11, whiteSpace: 'nowrap' }}>
                        {new Date(bk.createdAt).toLocaleDateString('zh-CN', {
                          month: 'short',
                          day: 'numeric',
                        })}
                      </Text>
                    )}
                  </div>
                )
              })
            ) : (
              <div style={{ color: '#999', textAlign: 'center', padding: 40, fontSize: 14 }}>
                暂无数据
              </div>
            )}
          </Card>
        </Col>

        <Col xs={24} lg={14}>
          <Card
            title={
              <span style={{ fontSize: 15, fontWeight: 600 }}>系统概况</span>
            }
            style={{ borderRadius: 12, border: '1px solid #f0f0f0' }}
            bodyStyle={{ padding: '20px 24px' }}
            styles={{ body: { padding: '20px 24px' } }}
          >
            <Row gutter={[16, 20]}>
              {[
                {
                  label: '待审核蜂农',
                  value: stats?.pendingAuditCount ?? 0,
                  color: stats?.pendingAuditCount > 0 ? '#fa8c16' : '#52c41a',
                  icon: <AuditOutlined />,
                  bg: stats?.pendingAuditCount > 0 ? '#fff7e6' : '#f6ffed',
                },
                {
                  label: '蜂场台账',
                  value: stats?.apiaryCount ?? '--',
                  color: '#1677ff',
                  icon: <BankOutlined />,
                  bg: '#e6f4ff',
                },
                {
                  label: '蜜蜂蜂群',
                  value: stats?.colonyCount ?? '--',
                  color: '#722ed1',
                  icon: <EnvironmentOutlined />,
                  bg: '#f9f0ff',
                },
              ].map((item) => (
                <Col xs={24} sm={8} key={item.label}>
                  <div
                    style={{
                      background: '#fafafa',
                      borderRadius: 10,
                      padding: '18px 16px',
                      textAlign: 'center',
                      transition: 'all 0.25s',
                    }}
                    onMouseEnter={(e) => {
                      ;(e.currentTarget as HTMLElement).style.background = item.bg
                    }}
                    onMouseLeave={(e) => {
                      ;(e.currentTarget as HTMLElement).style.background = '#fafafa'
                    }}
                  >
                    <div style={{ color: item.color, fontSize: 24, marginBottom: 8 }}>
                      {item.icon}
                    </div>
                    <div style={{ fontSize: 26, fontWeight: 700, color: '#1a1a2e', marginBottom: 4 }}>
                      {item.value}
                    </div>
                    <Text type="secondary" style={{ fontSize: 12 }}>
                      {item.label}
                    </Text>
                  </div>
                </Col>
              ))}
            </Row>
          </Card>
        </Col>
      </Row>
    </div>
  )
}

export default OverviewPage
