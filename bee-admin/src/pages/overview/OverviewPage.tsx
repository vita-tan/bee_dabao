import React, { useEffect, useRef } from 'react'
import { Row, Col, Card, Statistic, Spin, Typography } from 'antd'
import {
  ArrowUpOutlined,
  ArrowDownOutlined,
  TeamOutlined,
  BankOutlined,
  GlobalOutlined,
  ThunderboltOutlined,
} from '@ant-design/icons'
import * as echarts from 'echarts'
import { useRequest } from '@/hooks/useRequest'
import { getStatsOverview } from '@/api/notification'

const { Title } = Typography

const OverviewPage: React.FC = () => {
  const colonyChartRef = useRef<HTMLDivElement>(null)
  const productionChartRef = useRef<HTMLDivElement>(null)

  const { data: stats, loading } = useRequest(() => getStatsOverview())

  useEffect(() => {
    if (!stats || !colonyChartRef.current || !productionChartRef.current) return

    // 蜂群数量折线图
    const colonyChart = echarts.init(colonyChartRef.current)
    colonyChart.setOption({
      tooltip: { trigger: 'axis' },
      xAxis: {
        type: 'category',
        data: ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月'],
      },
      yAxis: { type: 'value', name: '群数' },
      series: [{
        name: '蜂群数量',
        type: 'line',
        smooth: true,
        data: [820, 932, 901, 934, 1290, 1330, 1320, 1450, 1380, 1200, 980, 860],
        lineStyle: { color: '#f5a623' },
        areaStyle: { color: 'rgba(245,166,35,0.1)' },
        itemStyle: { color: '#f5a623' },
      }],
      grid: { left: 40, right: 20, top: 30, bottom: 30 },
    })

    // 产量柱状图
    const productionChart = echarts.init(productionChartRef.current)
    productionChart.setOption({
      tooltip: { trigger: 'axis' },
      xAxis: {
        type: 'category',
        data: ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月'],
      },
      yAxis: { type: 'value', name: '产量(kg)' },
      series: [{
        name: '蜂蜜产量',
        type: 'bar',
        data: [120, 200, 150, 80, 320, 450, 480, 520, 380, 250, 130, 90],
        itemStyle: { color: '#f5a623', borderRadius: [4, 4, 0, 0] },
      }],
      grid: { left: 50, right: 20, top: 30, bottom: 30 },
    })

    const handleResize = () => {
      colonyChart.resize()
      productionChart.resize()
    }
    window.addEventListener('resize', handleResize)

    return () => {
      window.removeEventListener('resize', handleResize)
      colonyChart.dispose()
      productionChart.dispose()
    }
  }, [stats])

  const statCards = [
    {
      title: '蜂农总数',
      value: stats?.beekeeper_count ?? '--',
      change: stats?.beekeeper_change,
      icon: <TeamOutlined style={{ fontSize: 28, color: '#f5a623' }} />,
      color: '#fff7e6',
    },
    {
      title: '蜂场总数',
      value: stats?.apiary_count ?? '--',
      change: stats?.apiary_change,
      icon: <BankOutlined style={{ fontSize: 28, color: '#52c41a' }} />,
      color: '#f6ffed',
    },
    {
      title: '蜂群总数',
      value: stats?.colony_count ?? '--',
      change: stats?.colony_change,
      icon: <GlobalOutlined style={{ fontSize: 28, color: '#1677ff' }} />,
      color: '#e6f4ff',
    },
    {
      title: '年度产量(kg)',
      value: stats?.year_production ?? '--',
      change: stats?.year_production_yoy,
      icon: <ThunderboltOutlined style={{ fontSize: 28, color: '#722ed1' }} />,
      color: '#f9f0ff',
    },
  ]

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: 80 }}>
        <Spin size="large" />
      </div>
    )
  }

  return (
    <div>
      <Title level={4} style={{ marginBottom: 20 }}>数据总览</Title>

      {/* 指标卡片 */}
      <Row gutter={16} style={{ marginBottom: 24 }}>
        {statCards.map((card) => (
          <Col span={6} key={card.title}>
            <Card style={{ background: card.color, border: 'none' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div>
                  <Statistic
                    title={card.title}
                    value={card.value}
                    suffix={
                      card.change !== undefined ? (
                        <span
                          style={{
                            fontSize: 13,
                            color: card.change >= 0 ? '#52c41a' : '#ff4d4f',
                            marginLeft: 4,
                          }}
                        >
                          {card.change >= 0 ? <ArrowUpOutlined /> : <ArrowDownOutlined />}
                          {Math.abs(card.change)}
                        </span>
                      ) : undefined
                    }
                  />
                </div>
                {card.icon}
              </div>
            </Card>
          </Col>
        ))}
      </Row>

      {/* 图表区 */}
      <Row gutter={16} style={{ marginBottom: 24 }}>
        <Col span={12}>
          <Card title="蜂群数量趋势（近12月）" size="small">
            <div ref={colonyChartRef} style={{ height: 260 }} />
          </Card>
        </Col>
        <Col span={12}>
          <Card title="蜂蜜产量统计（近12月）" size="small">
            <div ref={productionChartRef} style={{ height: 260 }} />
          </Card>
        </Col>
      </Row>

      {/* 最新动态 */}
      <Row gutter={16}>
        <Col span={8}>
          <Card title="最新注册蜂农" size="small">
            {stats?.recent_beekeepers?.length ? (
              stats.recent_beekeepers.map((bk: any) => (
                <div key={bk.id} style={{ padding: '8px 0', borderBottom: '1px solid #f0f0f0' }}>
                  <span>{bk.name}</span>
                  <span style={{ color: '#999', marginLeft: 8, fontSize: 12 }}>{bk.region}</span>
                </div>
              ))
            ) : (
              <div style={{ color: '#999', textAlign: 'center', padding: 20 }}>暂无数据</div>
            )}
          </Card>
        </Col>
        <Col span={8}>
          <Card title="最新异常巡查" size="small">
            {stats?.recent_abnormal?.length ? (
              stats.recent_abnormal.map((item: any) => (
                <div key={item.id} style={{ padding: '8px 0', borderBottom: '1px solid #f0f0f0' }}>
                  <span style={{ color: '#ff4d4f' }}>⚠ {item.apiary_name}</span>
                  <span style={{ color: '#999', marginLeft: 8, fontSize: 12 }}>{item.date}</span>
                </div>
              ))
            ) : (
              <div style={{ color: '#999', textAlign: 'center', padding: 20 }}>暂无数据</div>
            )}
          </Card>
        </Col>
        <Col span={8}>
          <Card title="最新补贴申请" size="small">
            {stats?.recent_applications?.length ? (
              stats.recent_applications.map((item: any) => (
                <div key={item.id} style={{ padding: '8px 0', borderBottom: '1px solid #f0f0f0' }}>
                  <span>{item.beekeeper_name}</span>
                  <span style={{ color: '#f5a623', marginLeft: 8 }}>¥{item.apply_amount}</span>
                </div>
              ))
            ) : (
              <div style={{ color: '#999', textAlign: 'center', padding: 20 }}>暂无数据</div>
            )}
          </Card>
        </Col>
      </Row>

      {/* 待审核提示 */}
      {stats?.pending_audit_count > 0 && (
        <Card
          style={{ marginTop: 16, background: '#fff7e6', border: '1px solid #f5a623' }}
          size="small"
        >
          <span style={{ color: '#f5a623' }}>
            📋 当前有 <strong>{stats.pending_audit_count}</strong> 位蜂农等待审核
          </span>
        </Card>
      )}
    </div>
  )
}

export default OverviewPage
