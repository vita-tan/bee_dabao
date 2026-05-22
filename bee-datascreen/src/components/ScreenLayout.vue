<template>
  <div class="screen-layout">
    <!-- 顶部通栏 -->
    <header class="top-bar">
      <div class="top-left">
        <span class="top-time">{{ currentTime }}</span>
        <span class="top-date">{{ currentDate }}</span>
      </div>
      <div class="top-center">
        <div class="top-title-deco left-deco"></div>
        <h1 class="top-title">蜂农数字化管理平台</h1>
        <div class="top-title-deco right-deco"></div>
      </div>
      <div class="top-right">
        <select v-model="regionCode" class="region-select" @change="fetchData">
          <option value="">全辖区</option>
          <option value="330100">浙江省·杭州市</option>
          <option value="330200">浙江省·宁波市</option>
          <option value="330300">浙江省·温州市</option>
        </select>
        <span class="update-time">更新于 {{ lastUpdateTime }}</span>
      </div>
    </header>

    <!-- 主体三栏 -->
    <main class="main-body">
      <!-- 左侧栏 -->
      <aside class="col-left">
        <!-- 1. 蜂农地区柱状图 -->
        <div class="chart-card">
          <div class="chart-title">各地区蜂农数量</div>
          <div class="echarts-wrap" ref="chart1Ref"></div>
        </div>

        <!-- 2. 蜂群总数翻牌器 -->
        <div class="chart-card stat-card">
          <div class="chart-title">蜂群总数</div>
          <div class="flop-wrap">
            <span class="flop-num">{{ animColony.toLocaleString() }}</span>
            <span class="flop-unit">群</span>
          </div>
          <div class="stat-sub">
            <span>较上月
              <span :class="colonyChange >= 0 ? 'up' : 'down'">
                {{ colonyChange >= 0 ? '+' : '' }}{{ colonyChange }}
              </span>
            </span>
          </div>
        </div>

        <!-- 3. 信用分分布饼图 -->
        <div class="chart-card">
          <div class="chart-title">蜂农信用分分布</div>
          <div class="echarts-wrap" ref="chart2Ref"></div>
        </div>

        <!-- 4. 今日活跃进度环 -->
        <div class="chart-card">
          <div class="chart-title">今日活跃蜂农</div>
          <div class="echarts-wrap" ref="chart3Ref"></div>
        </div>
      </aside>

      <!-- 中央区 -->
      <section class="col-center">
        <!-- 顶部指标卡片 -->
        <div class="kpi-row">
          <div class="kpi-card" v-for="kpi in kpiList" :key="kpi.label">
            <div class="kpi-icon">{{ kpi.icon }}</div>
            <div class="kpi-right">
              <div class="kpi-val">{{ kpi.value }}</div>
              <div class="kpi-label">{{ kpi.label }}</div>
            </div>
          </div>
        </div>

        <!-- 蜂场分布地图（高德卫星底图 + 行政区边界） -->
        <div class="chart-card map-card">
          <div class="chart-title">蜂场分布地图</div>
          <div class="amap-wrap" ref="mapContainerRef"></div>
        </div>

        <!-- 区域产量排名 -->
        <div class="chart-card">
          <div class="chart-title">地区产量排名（TOP 10）</div>
          <div class="echarts-wrap" ref="chart4Ref"></div>
        </div>

        <!-- 实时活动跑马灯 -->
        <div class="scroll-board-wrap chart-card">
          <div class="chart-title">实时动态</div>
          <div class="scroll-board">
            <div
              class="scroll-list"
              :style="{ transform: `translateY(-${scrollOffset}px)` }"
            >
              <div
                class="scroll-item"
                v-for="(evt, i) in recentEvents.concat(recentEvents)"
                :key="i"
              >
                <span class="scroll-dot"></span>
                <span class="scroll-text">{{ evt }}</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- 右侧栏 -->
      <aside class="col-right">
        <!-- 1. 蜂蜜产量趋势折线图 -->
        <div class="chart-card">
          <div class="chart-title">蜂蜜产量趋势（近12月）</div>
          <div class="echarts-wrap" ref="chart5Ref"></div>
        </div>

        <!-- 2. 蜜种产量占比玫瑰图 -->
        <div class="chart-card">
          <div class="chart-title">蜜种产量占比</div>
          <div class="echarts-wrap" ref="chart6Ref"></div>
        </div>

        <!-- 3. 补贴发放进度 -->
        <div class="chart-card stat-card">
          <div class="chart-title">补贴发放进度</div>
          <div class="subsidy-wrap">
            <div class="subsidy-nums">
              <div>
                <div class="sub-label">总预算</div>
                <div class="sub-val">¥{{ formatMoney(subsidyData.budget) }}</div>
              </div>
              <div>
                <div class="sub-label">已发放</div>
                <div class="sub-val" style="color:var(--c-green)">¥{{ formatMoney(subsidyData.paid) }}</div>
              </div>
            </div>
            <div class="progress-bar-bg">
              <div
                class="progress-bar-fill"
                :style="{ width: subsidyRatio + '%' }"
              ></div>
            </div>
            <div class="progress-label">{{ subsidyRatio.toFixed(1) }}%</div>
          </div>
        </div>

        <!-- 4. 今年 vs 去年同比双柱图 -->
        <div class="chart-card">
          <div class="chart-title">产量年同比（月维度）</div>
          <div class="echarts-wrap" ref="chart7Ref"></div>
        </div>
      </aside>
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted, onUnmounted } from 'vue'
import * as echarts from 'echarts'
import http from '@/utils/http'
import taishunGeoJson from '@/data/taishun.json'

// ─── 时钟 ─────────────────────────────────────────────────────────────────────
const currentTime = ref('')
const currentDate = ref('')
function tick() {
  const now = new Date()
  currentDate.value = now.toLocaleDateString('zh-CN', { year: 'numeric', month: '2-digit', day: '2-digit' })
  currentTime.value = now.toLocaleTimeString('zh-CN', { hour12: false })
}
tick()
const clockTimer = setInterval(tick, 1000)

// ─── 数据状态 ─────────────────────────────────────────────────────────────────
const regionCode = ref('')
const lastUpdateTime = ref('—')

// KPI 顶部指标
const kpiList = reactive([
  { icon: '🧑‍🌾', label: '蜂农总数', value: '—' },
  { icon: '🏕️', label: '蜂场数量', value: '—' },
  { icon: '📦', label: '年累计产量(kg)', value: '—' },
  { icon: '✅', label: '活跃蜂场数', value: '—' },
])

// 蜂群翻牌
const animColony = ref(0)
const colonyChange = ref(0)

// 补贴
const subsidyData = reactive({ budget: 0, paid: 0 })
const subsidyRatio = computed(() => subsidyData.budget > 0 ? Math.min(subsidyData.paid / subsidyData.budget * 100, 100) : 0)

// 跑马灯
const recentEvents = ref<string[]>([])
const scrollOffset = ref(0)
let scrollTimer: ReturnType<typeof setInterval> | null = null
const ITEM_H = 32

function startScroll() {
  if (scrollTimer) clearInterval(scrollTimer)
  scrollTimer = setInterval(() => {
    scrollOffset.value += 1
    const maxScroll = recentEvents.value.length * ITEM_H
    if (scrollOffset.value >= maxScroll) scrollOffset.value = 0
  }, 40)
}

// ─── ECharts refs ─────────────────────────────────────────────────────────────
const chart1Ref = ref<HTMLElement | null>(null)
const chart2Ref = ref<HTMLElement | null>(null)
const chart3Ref = ref<HTMLElement | null>(null)
const chart4Ref = ref<HTMLElement | null>(null)
const chart5Ref = ref<HTMLElement | null>(null)
const chart6Ref = ref<HTMLElement | null>(null)
const chart7Ref = ref<HTMLElement | null>(null)
const mapContainerRef = ref<HTMLElement | null>(null)
let AMapInstance: any = null
let mapMarkers: any[] = []

const charts: echarts.ECharts[] = []

function initChart(el: HTMLElement | null): echarts.ECharts | null {
  if (!el) return null
  const c = echarts.init(el, null, { renderer: 'canvas' })
  charts.push(c)
  return c
}

// 通用图表颜色
const COLORS = ['#00d4ff', '#7ecef4', '#2ECC71', '#F5A623', '#e74c3c', '#9b59b6', '#1abc9c']

// ─── 数据获取 ─────────────────────────────────────────────────────────────────
async function fetchData() {
  try {
    const params = regionCode.value ? { region_code: regionCode.value } : {}
    const res = await http.get('/admin/stats/screen', { params })
    const d = res?.data || res

    // KPI
    kpiList[0].value = (d.beekeeper_total ?? 0).toLocaleString()
    kpiList[1].value = (d.active_apiary_count ?? 0).toLocaleString()
    kpiList[2].value = (d.production_ytd ?? 0).toLocaleString()
    kpiList[3].value = (d.active_apiary_count ?? 0).toLocaleString()

    // 蜂群翻牌动画
    const targetColony = d.colony_total ?? 0
    colonyChange.value = d.colony_change ?? 0
    animateNumber(animColony, targetColony)

    // 补贴
    subsidyData.budget = d.subsidy_progress?.budget ?? 0
    subsidyData.paid = d.subsidy_progress?.paid ?? 0

    // 跑马灯
    if (d.recent_events?.length) {
      recentEvents.value = d.recent_events
      startScroll()
    }

    // 各图表渲染
    renderRegionBar(d.region_rank ?? mockRegionRank())
    renderCreditPie()
    renderActiveGauge(d.active_beekeeper_count ?? 68)
    renderRegionRankBar(d.region_rank ?? mockRegionRank())
    renderProductionTrend(d.production_trend ?? mockTrend())
    renderHoneyTypePie(d.honey_type_ratio ?? mockHoneyType())
    renderYoyBar(d.production_trend ?? mockTrend())
    renderMap(d.apiaries_geo ?? [])

    lastUpdateTime.value = new Date().toLocaleTimeString('zh-CN')
  } catch (e) {
    // 接口不可达时用 mock 数据展示
    useAllMockData()
  }
}

function animateNumber(target: { value: number }, end: number) {
  const duration = 1500
  const start = target.value
  const step = (end - start) / (duration / 16)
  const timer = setInterval(() => {
    target.value = Math.round(target.value + step)
    if ((step > 0 && target.value >= end) || (step < 0 && target.value <= end) || step === 0) {
      target.value = end
      clearInterval(timer)
    }
  }, 16)
}

// ─── Mock 数据 ────────────────────────────────────────────────────────────────
function mockRegionRank() {
  return [
    { region: '建德市', production: 4820 },
    { region: '淳安县', production: 3960 },
    { region: '桐庐县', production: 3410 },
    { region: '临安区', production: 2850 },
    { region: '富阳区', production: 2100 },
    { region: '余杭区', production: 1830 },
    { region: '萧山区', production: 1560 },
    { region: '西湖区', production: 1120 },
    { region: '拱墅区', production: 890 },
    { region: '滨江区', production: 620 },
  ]
}

function mockTrend() {
  const months = ['2025-05','2025-06','2025-07','2025-08','2025-09','2025-10',
    '2025-11','2025-12','2026-01','2026-02','2026-03','2026-04']
  const thisYear = [420,650,1100,1380,1050,620,210,80,30,60,380,720]
  const lastYear = [380,590,980,1250,940,580,190,70,25,50,340,670]
  return months.map((m, i) => ({ period: m, value: thisYear[i], lastYear: lastYear[i] }))
}

function mockHoneyType() {
  return [
    { honey_type: '槐花蜜', quantity: 2840, ratio: 28 },
    { honey_type: '百花蜜', quantity: 2560, ratio: 25 },
    { honey_type: '荆条蜜', quantity: 2040, ratio: 20 },
    { honey_type: '椴树蜜', quantity: 1530, ratio: 15 },
    { honey_type: '油菜蜜', quantity: 820, ratio: 8 },
    { honey_type: '其他', quantity: 410, ratio: 4 },
  ]
}

function useAllMockData() {
  kpiList[0].value = '1,284'
  kpiList[1].value = '3,620'
  kpiList[2].value = '102,400'
  kpiList[3].value = '2,890'
  animateNumber(animColony, 36520)
  colonyChange.value = 320
  subsidyData.budget = 5000000
  subsidyData.paid = 3260000
  recentEvents.value = [
    '建德市蜂农张伟在「南浦溪蜂场」完成了日常巡查',
    '淳安县蜂农李芳提交了新采蜜记录 · 槐花蜜 82kg',
    '临安区蜂农王明申请补贴政策「2026年蜂农扶持计划」',
    '桐庐县蜂农赵丽完成了用药记录填报并进入停药期',
    '余杭区新蜂农陈强通过认证审核',
    '富阳区蜂农刘洋在「花海蜂场」新增蜂箱10只',
    '建德市蜂农周静采集百花蜜 65kg，波美度 42.3°',
    '淳安县蜂农孙明完成巡查，发现蜂王状态异常已上报',
  ]
  startScroll()
  renderRegionBar(mockRegionRank())
  renderCreditPie()
  renderActiveGauge(72)
  renderRegionRankBar(mockRegionRank())
  renderProductionTrend(mockTrend())
  renderHoneyTypePie(mockHoneyType())
  renderYoyBar(mockTrend())
  renderMap([])
  lastUpdateTime.value = new Date().toLocaleTimeString('zh-CN')
}

// ─── 图表渲染函数 ──────────────────────────────────────────────────────────────
function renderRegionBar(data: { region: string; production: number }[]) {
  const c = initChart(chart1Ref.value)
  if (!c) return
  const sorted = [...data].sort((a, b) => b.production - a.production).slice(0, 8)
  c.setOption({
    grid: { top: 8, bottom: 20, left: 70, right: 16 },
    xAxis: { type: 'value', axisLabel: { color: 'rgba(255,255,255,0.5)', fontSize: 11 }, splitLine: { lineStyle: { color: 'rgba(255,255,255,0.06)' } } },
    yAxis: { type: 'category', data: sorted.map(d => d.region).reverse(), axisLabel: { color: 'rgba(255,255,255,0.7)', fontSize: 12 }, axisTick: { show: false } },
    series: [{
      type: 'bar', data: sorted.map(d => d.production).reverse(),
      itemStyle: { color: new echarts.graphic.LinearGradient(0, 0, 1, 0, [{ offset: 0, color: '#1a5276' }, { offset: 1, color: '#00d4ff' }]), borderRadius: [0, 4, 4, 0] },
      label: { show: true, position: 'right', color: '#00d4ff', fontSize: 11 },
      barMaxWidth: 18,
    }],
    tooltip: { trigger: 'axis', backgroundColor: 'rgba(10,22,40,0.9)', borderColor: '#00d4ff', textStyle: { color: '#e0eaf8' } },
  })
}

function renderCreditPie() {
  const c = initChart(chart2Ref.value)
  if (!c) return
  c.setOption({
    legend: { orient: 'vertical', right: 8, top: 'center', textStyle: { color: 'rgba(255,255,255,0.7)', fontSize: 12 } },
    series: [{
      type: 'pie', radius: ['40%', '68%'], center: ['40%', '50%'],
      data: [
        { value: 34, name: '优秀(90+)', itemStyle: { color: '#2ECC71' } },
        { value: 42, name: '良好(80-89)', itemStyle: { color: '#00d4ff' } },
        { value: 18, name: '一般(60-79)', itemStyle: { color: '#F5A623' } },
        { value: 6, name: '较差(<60)', itemStyle: { color: '#e74c3c' } },
      ],
      label: { show: false },
      emphasis: { label: { show: true, fontSize: 13, color: '#fff' } },
    }],
    tooltip: { trigger: 'item', backgroundColor: 'rgba(10,22,40,0.9)', borderColor: '#00d4ff', textStyle: { color: '#e0eaf8' }, formatter: '{b}: {d}%' },
  })
}

function renderActiveGauge(activePct: number) {
  const c = initChart(chart3Ref.value)
  if (!c) return
  c.setOption({
    series: [{
      type: 'gauge', startAngle: 200, endAngle: -20,
      min: 0, max: 100, radius: '85%', center: ['50%', '58%'],
      axisLine: { lineStyle: { width: 16, color: [[activePct / 100, '#00d4ff'], [1, 'rgba(255,255,255,0.08)']] } },
      axisTick: { show: false }, splitLine: { show: false }, axisLabel: { show: false },
      pointer: { show: false },
      detail: { valueAnimation: true, fontSize: 26, color: '#00d4ff', offsetCenter: [0, '10%'], formatter: '{value}%' },
      title: { offsetCenter: [0, '35%'], fontSize: 12, color: 'rgba(255,255,255,0.6)' },
      data: [{ value: activePct, name: '今日活跃率' }],
    }],
  })
}

function renderRegionRankBar(data: { region: string; production: number }[]) {
  const c = initChart(chart4Ref.value)
  if (!c) return
  const top10 = data.slice(0, 10)
  c.setOption({
    grid: { top: 8, bottom: 20, left: 70, right: 16 },
    xAxis: { type: 'value', axisLabel: { color: 'rgba(255,255,255,0.5)', fontSize: 11 }, splitLine: { lineStyle: { color: 'rgba(255,255,255,0.06)' } } },
    yAxis: { type: 'category', data: top10.map(d => d.region).reverse(), axisLabel: { color: 'rgba(255,255,255,0.7)', fontSize: 12 }, axisTick: { show: false } },
    series: [{
      type: 'bar', data: top10.map((d, i) => ({ value: d.production, itemStyle: { color: COLORS[i % COLORS.length] } })).reverse(),
      label: { show: true, position: 'right', color: 'rgba(255,255,255,0.7)', fontSize: 11 },
      barMaxWidth: 14,
      itemStyle: { borderRadius: [0, 4, 4, 0] },
    }],
    tooltip: { trigger: 'axis', backgroundColor: 'rgba(10,22,40,0.9)', borderColor: '#00d4ff', textStyle: { color: '#e0eaf8' }, formatter: (p: any) => `${p[0].name}<br/>产量：${p[0].value} kg` },
  })
}

function renderProductionTrend(data: { period: string; value: number }[]) {
  const c = initChart(chart5Ref.value)
  if (!c) return
  c.setOption({
    grid: { top: 20, bottom: 24, left: 44, right: 12 },
    xAxis: { type: 'category', data: data.map(d => d.period.slice(5)), axisLabel: { color: 'rgba(255,255,255,0.5)', fontSize: 11 }, axisLine: { lineStyle: { color: 'rgba(255,255,255,0.1)' } } },
    yAxis: { type: 'value', axisLabel: { color: 'rgba(255,255,255,0.5)', fontSize: 11 }, splitLine: { lineStyle: { color: 'rgba(255,255,255,0.06)' } } },
    series: [{
      type: 'line', data: data.map(d => d.value), smooth: true,
      lineStyle: { color: '#00d4ff', width: 2 },
      areaStyle: { color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [{ offset: 0, color: 'rgba(0,212,255,0.35)' }, { offset: 1, color: 'rgba(0,212,255,0)' }]) },
      symbol: 'circle', symbolSize: 5, itemStyle: { color: '#00d4ff', borderColor: '#fff', borderWidth: 1.5 },
    }],
    tooltip: { trigger: 'axis', backgroundColor: 'rgba(10,22,40,0.9)', borderColor: '#00d4ff', textStyle: { color: '#e0eaf8' }, formatter: (p: any) => `${data[p[0].dataIndex].period}<br/>产量：${p[0].value} kg` },
  })
}

function renderHoneyTypePie(data: { honey_type: string; quantity: number }[]) {
  const c = initChart(chart6Ref.value)
  if (!c) return
  c.setOption({
    legend: { orient: 'vertical', right: 4, top: 'center', textStyle: { color: 'rgba(255,255,255,0.7)', fontSize: 11 }, itemWidth: 12, itemHeight: 12 },
    series: [{
      type: 'pie', radius: ['30%', '65%'], center: ['40%', '52%'], roseType: 'area',
      data: data.map((d, i) => ({ value: d.quantity, name: d.honey_type, itemStyle: { color: COLORS[i % COLORS.length] } })),
      label: { show: false },
      emphasis: { label: { show: true, fontSize: 13, color: '#fff', formatter: '{b}\n{d}%' } },
    }],
    tooltip: { trigger: 'item', backgroundColor: 'rgba(10,22,40,0.9)', borderColor: '#00d4ff', textStyle: { color: '#e0eaf8' }, formatter: '{b}: {c} kg ({d}%)' },
  })
}

function renderYoyBar(data: { period: string; value: number; lastYear?: number }[]) {
  const c = initChart(chart7Ref.value)
  if (!c) return
  c.setOption({
    legend: { right: 8, top: 0, textStyle: { color: 'rgba(255,255,255,0.7)', fontSize: 11 }, itemWidth: 12, itemHeight: 8 },
    grid: { top: 28, bottom: 24, left: 40, right: 12 },
    xAxis: { type: 'category', data: data.map(d => d.period.slice(5)), axisLabel: { color: 'rgba(255,255,255,0.5)', fontSize: 10 }, axisLine: { lineStyle: { color: 'rgba(255,255,255,0.1)' } } },
    yAxis: { type: 'value', axisLabel: { color: 'rgba(255,255,255,0.5)', fontSize: 11 }, splitLine: { lineStyle: { color: 'rgba(255,255,255,0.06)' } } },
    series: [
      { name: '今年', type: 'bar', data: data.map(d => d.value), itemStyle: { color: '#00d4ff', borderRadius: [3, 3, 0, 0] }, barMaxWidth: 12 },
      { name: '去年', type: 'bar', data: data.map(d => d.lastYear ?? 0), itemStyle: { color: 'rgba(126,206,244,0.4)', borderRadius: [3, 3, 0, 0] }, barMaxWidth: 12 },
    ],
    tooltip: { trigger: 'axis', backgroundColor: 'rgba(10,22,40,0.9)', borderColor: '#00d4ff', textStyle: { color: '#e0eaf8' } },
  })
}

function renderMap(geoData: { lng: number; lat: number; apiary_name: string; colony_count: number }[]) {
  // 南浦溪镇中心坐标 (119.72, 27.47)
  const NPX_CENTER: [number, number] = [27.47, 119.72]
  const NPX_ZOOM = 12

  // Mock 蜂场数据（以南浦溪镇周边为基准）
  const mockPoints = geoData.length ? geoData : [
    { lng: 119.71, lat: 27.48, apiary_name: '南浦溪蜂场', colony_count: 120 },
    { lng: 119.73, lat: 27.50, apiary_name: '库村蜂场', colony_count: 85 },
    { lng: 119.69, lat: 27.46, apiary_name: '双坑山蜂场', colony_count: 200 },
    { lng: 119.75, lat: 27.45, apiary_name: '周新蜂场', colony_count: 60 },
    { lng: 119.68, lat: 27.49, apiary_name: '新仓蜂场', colony_count: 45 },
    { lng: 119.74, lat: 27.52, apiary_name: '孙坪蜂场', colony_count: 30 },
    { lng: 119.70, lat: 27.44, apiary_name: '箬垟蜂场', colony_count: 75 },
    { lng: 119.76, lat: 27.47, apiary_name: '龙前蜂场', colony_count: 55 },
    { lng: 119.67, lat: 27.51, apiary_name: '朝头垟蜂场', colony_count: 90 },
    { lng: 119.77, lat: 27.49, apiary_name: '培坑蜂场', colony_count: 110 },
    { lng: 119.72, lat: 27.53, apiary_name: '包坑蜂场', colony_count: 65 },
    { lng: 119.69, lat: 27.43, apiary_name: '新源蜂场', colony_count: 40 },
  ]

  const L = (window as any).L
  if (!L || !mapContainerRef.value) return

  // 初始化 Leaflet 地图（仅一次）
  if (!AMapInstance) {
    const map = L.map(mapContainerRef.value, {
      center: NPX_CENTER,
      zoom: NPX_ZOOM,
      zoomControl: false,
      attributionControl: false,
      minZoom: 10,
      maxZoom: 16,
    })

    // 高德卫星底图
    L.tileLayer(
      'https://webst02.is.autonavi.com/appmaptile?style=6&x={x}&y={y}&z={z}',
      { maxZoom: 18 }
    ).addTo(map)

    // 路网叠加层
    L.tileLayer(
      'https://webst02.is.autonavi.com/appmaptile?style=8&x={x}&y={y}&z={z}',
      { maxZoom: 18, opacity: 0.7 }
    ).addTo(map)

    // 绘制泰顺县行政区边界
    try {
      const geoJson = taishunGeoJson as any
      if (geoJson?.features?.[0]) {
        L.geoJSON(geoJson, {
          style: {
            color: '#00d4ff',
            weight: 2,
            opacity: 0.8,
            fillColor: '#00d4ff',
            fillOpacity: 0.04,
            dashArray: '8, 4',
          },
        }).addTo(map)
      }
    } catch (e) {
      console.warn('绘制行政区边界失败:', e)
    }

    AMapInstance = map
  }

  // 清除旧标记
  mapMarkers.forEach(m => {
    if ((m as any)._rippleTimer) clearInterval((m as any)._rippleTimer)
    AMapInstance.removeLayer(m)
  })
  mapMarkers = []

  // 添加蜂场标记点
  mockPoints.forEach(p => {
    const radius = Math.max(300, p.colony_count * 12)

    // 蜂场范围圆
    const circle = L.circle([p.lat, p.lng], {
      radius,
      color: '#F5A623',
      weight: 1.5,
      opacity: 0.9,
      fillColor: '#F5A623',
      fillOpacity: 0.15,
    }).addTo(AMapInstance)

    // 蜂场标签
    const label = L.marker([p.lat, p.lng], {
      icon: L.divIcon({
        className: 'bee-label',
        html: `<div style="
          color:#7ecef4;font-size:12px;font-weight:600;
          text-shadow:0 0 6px rgba(0,0,0,0.9),0 1px 3px rgba(0,0,0,0.8);
          white-space:nowrap;transform:translate(-50%,-100%);
          pointer-events:none;
        ">${p.apiary_name}</div>`,
        iconSize: [0, 0],
        iconAnchor: [0, -8],
      }),
      interactive: false,
    }).addTo(AMapInstance)

    // 中心点标记
    const dot = L.circleMarker([p.lat, p.lng], {
      radius: 6,
      color: '#F5A623',
      weight: 2,
      fillColor: '#F5A623',
      fillOpacity: 0.9,
    }).addTo(AMapInstance)

    // 涟漪动画
    const ripple = L.circleMarker([p.lat, p.lng], {
      radius: 8,
      color: '#F5A623',
      weight: 0,
      fillColor: '#F5A623',
      fillOpacity: 0.5,
    }).addTo(AMapInstance)

    let rippleRadius = 8
    let rippleOpacity = 0.5
    const rippleTimer = setInterval(() => {
      rippleRadius += 0.5
      rippleOpacity -= 0.008
      if (rippleOpacity <= 0) {
        rippleRadius = 8
        rippleOpacity = 0.5
      }
      ripple.setRadius(rippleRadius)
      ripple.setStyle({ fillOpacity: rippleOpacity })
    }, 40)
    ;(ripple as any)._rippleTimer = rippleTimer

    // 点击弹窗
    circle.bindPopup(`
      <div style="font-size:13px;line-height:1.6;color:#333;">
        <b>${p.apiary_name}</b><br/>
        📍 经度：${p.lng}°E  纬度：${p.lat}°N<br/>
        🐝 蜂群数量：${p.colony_count} 群
      </div>
    `, { className: 'dark-popup' })

    mapMarkers.push(circle, label, dot, ripple)
  })
}

// ─── 工具函数 ─────────────────────────────────────────────────────────────────
function formatMoney(num: number) {
  if (num >= 10000) return (num / 10000).toFixed(1) + '万'
  return num.toLocaleString()
}

// ─── ResizeObserver ───────────────────────────────────────────────────────────
let resizeObs: ResizeObserver | null = null

// ─── 生命周期 ─────────────────────────────────────────────────────────────────
onMounted(async () => {
  await fetchData()

  // ResizeObserver 响应容器尺寸变化
  resizeObs = new ResizeObserver(() => {
    charts.forEach(c => c.resize())
  })
  const els = [chart1Ref, chart2Ref, chart3Ref, chart4Ref, chart5Ref, chart6Ref, chart7Ref]
  els.forEach(r => { if (r.value) resizeObs!.observe(r.value) })

  // 5分钟刷新一次
  setInterval(fetchData, 5 * 60 * 1000)
})

onUnmounted(() => {
  clearInterval(clockTimer)
  if (scrollTimer) clearInterval(scrollTimer)
  if (resizeObs) resizeObs.disconnect()
  charts.forEach(c => c.dispose())
  // 清理涟漪动画定时器
  mapMarkers.forEach(m => {
    if ((m as any)._rippleTimer) clearInterval((m as any)._rippleTimer)
  })
  if (AMapInstance) {
    AMapInstance.destroy()
    AMapInstance = null
  }
})
</script>

<style scoped>
.screen-layout {
  width: 1920px;
  height: 1080px;
  display: flex;
  flex-direction: column;
  background: var(--c-bg);
  overflow: hidden;
}

/* ─── 顶部通栏 ─────────────────────────────────────────────────────────────── */
.top-bar {
  height: 80px;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 32px;
  background: linear-gradient(90deg, #030b1a, #0a1628 40%, #0d1e38 50%, #0a1628 60%, #030b1a);
  border-bottom: 1px solid rgba(0,212,255,0.15);
  position: relative;
}

.top-bar::after {
  content: '';
  position: absolute;
  bottom: 0; left: 0; right: 0; height: 1px;
  background: linear-gradient(90deg, transparent, #00d4ff 30%, #7ecef4 50%, #00d4ff 70%, transparent);
}

.top-left {
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-width: 200px;
}

.top-time {
  font-size: 28px;
  font-weight: 700;
  color: var(--c-primary);
  font-variant-numeric: tabular-nums;
  letter-spacing: 2px;
  text-shadow: 0 0 12px rgba(0,212,255,0.5);
}

.top-date {
  font-size: 13px;
  color: var(--c-text-sub);
}

.top-center {
  display: flex;
  align-items: center;
  gap: 20px;
}

.top-title-deco {
  width: 80px;
  height: 2px;
  background: linear-gradient(90deg, transparent, #00d4ff);
}

.right-deco {
  transform: scaleX(-1);
}

.top-title {
  font-size: 30px;
  font-weight: 800;
  color: #fff;
  letter-spacing: 4px;
  text-shadow: 0 0 20px rgba(0,212,255,0.4), 0 2px 4px rgba(0,0,0,0.5);
  white-space: nowrap;
}

.top-right {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 6px;
  min-width: 240px;
}

.region-select {
  background: rgba(0,212,255,0.08);
  border: 1px solid rgba(0,212,255,0.3);
  color: #e0eaf8;
  padding: 5px 12px;
  border-radius: 4px;
  font-size: 13px;
  outline: none;
  cursor: pointer;
}

.region-select option {
  background: #0a1628;
  color: #e0eaf8;
}

.update-time {
  font-size: 12px;
  color: var(--c-text-sub);
}

/* ─── 主体三栏 ─────────────────────────────────────────────────────────────── */
.main-body {
  flex: 1;
  display: flex;
  gap: 12px;
  padding: 12px;
  overflow: hidden;
}

.col-left,
.col-right {
  width: 390px;
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.col-center {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 10px;
  overflow: hidden;
}

/* ─── KPI 顶部指标 ─────────────────────────────────────────────────────────── */
.kpi-row {
  display: flex;
  gap: 10px;
  flex-shrink: 0;
}

.kpi-card {
  flex: 1;
  background: var(--c-card);
  border: 1px solid var(--c-border);
  border-radius: 8px;
  padding: 12px 16px;
  display: flex;
  align-items: center;
  gap: 12px;
  position: relative;
  overflow: hidden;
}

.kpi-card::before {
  content: '';
  position: absolute; top: 0; left: 0; right: 0; height: 2px;
  background: linear-gradient(90deg, transparent, var(--c-primary), transparent);
}

.kpi-icon {
  font-size: 28px;
  filter: drop-shadow(0 0 6px rgba(0,212,255,0.4));
}

.kpi-val {
  font-size: 22px;
  font-weight: 700;
  color: var(--c-primary);
  text-shadow: 0 0 10px rgba(0,212,255,0.4);
  line-height: 1.2;
}

.kpi-label {
  font-size: 12px;
  color: var(--c-text-sub);
  margin-top: 2px;
}

/* ─── 地图卡片 ─────────────────────────────────────────────────────────────── */
.map-card {
  flex: 1;
  min-height: 0;
}

.amap-wrap {
  width: 100%;
  height: 100%;
  border-radius: 4px;
  overflow: hidden;
}

/* 高德地图版权信息样式调整 */
:deep(.amap-logo),
:deep(.amap-copyright) {
  opacity: 0.3 !important;
}

/* Leaflet 弹窗暗色样式 */
:deep(.dark-popup .leaflet-popup-content-wrapper) {
  background: rgba(10,22,40,0.95);
  color: #e0eaf8;
  border: 1px solid rgba(0,212,255,0.4);
  border-radius: 8px;
  box-shadow: 0 4px 20px rgba(0,0,0,0.5);
}
:deep(.dark-popup .leaflet-popup-tip) {
  background: rgba(10,22,40,0.95);
  border: 1px solid rgba(0,212,255,0.4);
}
:deep(.dark-popup .leaflet-popup-close-button) {
  color: rgba(255,255,255,0.6);
}

/* ─── 左侧高度分配 ─────────────────────────────────────────────────────────── */
.col-left .chart-card:nth-child(1) { flex: 3; min-height: 0; }
.col-left .chart-card:nth-child(2) { flex: 2; min-height: 0; }
.col-left .chart-card:nth-child(3) { flex: 2.5; min-height: 0; }
.col-left .chart-card:nth-child(4) { flex: 2; min-height: 0; }

/* ─── 右侧高度分配 ─────────────────────────────────────────────────────────── */
.col-right .chart-card:nth-child(1) { flex: 2.5; min-height: 0; }
.col-right .chart-card:nth-child(2) { flex: 2.5; min-height: 0; }
.col-right .chart-card:nth-child(3) { flex: 2; min-height: 0; }
.col-right .chart-card:nth-child(4) { flex: 2.5; min-height: 0; }

/* ─── 蜂群翻牌 ─────────────────────────────────────────────────────────────── */
.stat-card {
  justify-content: center;
}

.flop-wrap {
  display: flex;
  align-items: baseline;
  gap: 8px;
  margin: 6px 0;
}

.flop-num {
  font-size: 42px;
  font-weight: 800;
  color: var(--c-primary);
  text-shadow: 0 0 20px rgba(0,212,255,0.5);
  font-variant-numeric: tabular-nums;
  letter-spacing: 2px;
}

.flop-unit {
  font-size: 18px;
  color: var(--c-text-sub);
}

.stat-sub {
  font-size: 13px;
  color: var(--c-text-sub);
}

.up { color: #e74c3c; }
.down { color: #2ECC71; }

/* ─── 补贴进度 ─────────────────────────────────────────────────────────────── */
.subsidy-wrap {
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding-top: 4px;
}

.subsidy-nums {
  display: flex;
  justify-content: space-around;
}

.sub-label {
  font-size: 12px;
  color: var(--c-text-sub);
  margin-bottom: 4px;
}

.sub-val {
  font-size: 18px;
  font-weight: 700;
  color: var(--c-primary);
}

.progress-bar-bg {
  height: 12px;
  background: rgba(255,255,255,0.08);
  border-radius: 6px;
  overflow: hidden;
  position: relative;
}

.progress-bar-fill {
  height: 100%;
  background: linear-gradient(90deg, #1a5276, #2ECC71);
  border-radius: 6px;
  transition: width 1s ease;
  position: relative;
}

.progress-bar-fill::after {
  content: '';
  position: absolute;
  right: 0; top: 0; bottom: 0;
  width: 4px;
  background: rgba(255,255,255,0.6);
  border-radius: 2px;
  animation: shimmer 1.5s infinite;
}

@keyframes shimmer {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.3; }
}

.progress-label {
  text-align: center;
  font-size: 20px;
  font-weight: 700;
  color: #2ECC71;
  text-shadow: 0 0 10px rgba(46,204,113,0.4);
}

/* ─── 跑马灯 ───────────────────────────────────────────────────────────────── */
.scroll-board-wrap {
  flex-shrink: 0;
  height: 110px;
}

.scroll-board {
  height: 80px;
  overflow: hidden;
  position: relative;
}

.scroll-list {
  transition: transform 0.1s linear;
}

.scroll-item {
  height: 32px;
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 13px;
  color: rgba(255,255,255,0.75);
  border-bottom: 1px solid rgba(255,255,255,0.04);
  padding: 0 4px;
}

.scroll-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: var(--c-primary);
  flex-shrink: 0;
  box-shadow: 0 0 6px var(--c-primary);
}

.scroll-text {
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
}
</style>
