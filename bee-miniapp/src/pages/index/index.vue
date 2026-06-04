<template>
  <view class="page">
    <!-- ==============================
         Sticky 顶部栏
         ============================== -->
    <view class="top-bar" :class="{ 'top-bar--scrolled': scrolled }">
      <view class="top-bar-left">
        <view class="brand-logo">
          <text class="brand-icon">🐝</text>
          <text class="brand-text">蜂农助手</text>
        </view>
      </view>
      <view class="top-bar-right">
        <view class="notify-btn" @tap="navTo('/pages/mine/notifications')">
          <text class="notify-icon">🔔</text>
          <view v-if="unreadCount" class="notify-badge">{{ unreadCount > 99 ? '99+' : unreadCount }}</view>
        </view>
        <view class="avatar-wrap" @tap="navTo('/pages/mine/index')">
          <image
            v-if="user?.avatar"
            :src="user.avatar"
            class="avatar-img"
            mode="aspectFill"
          />
          <view v-else class="avatar-placeholder">
            <text class="avatar-letter">{{ userNameFirst }}</text>
          </view>
        </view>
      </view>
    </view>

    <!-- ==============================
         主体滚动区域（双层：外层padding，内层滚动）
         ============================== -->
    <view class="main-scroll">
      <view
        class="scroll-inner"
        ref="mainScrollRef"
      >
      <!-- 欢迎区 -->
      <view class="welcome-section">
        <text class="welcome-greeting">{{ greeting }}</text>
        <text class="welcome-date">{{ dateText }}</text>
      </view>

      <!-- 天气 Hero 卡片 -->
      <view class="weather-hero">
        <!-- 装饰蜂窝纹理 -->
        <view class="hex-pattern">
          <view class="hex hex-1" />
          <view class="hex hex-2" />
          <view class="hex hex-3" />
        </view>
        <view class="weather-hero-inner">
          <view class="wh-left">
            <text class="wh-location">📍 南浦溪镇</text>
            <view class="wh-temp-row">
              <text class="wh-icon">{{ weather.icon }}</text>
              <text class="wh-temp">{{ weather.temp }}°</text>
            </view>
            <text class="wh-desc">{{ weather.desc }}</text>
            <view class="wh-range" v-if="weather.high !== '--'">
              <text class="wh-low">{{ weather.low }}°</text>
              <view class="wh-range-bar" />
              <text class="wh-high">{{ weather.high }}°</text>
            </view>
          </view>
          <view class="wh-right">
            <view class="wh-hint-box">
              <text class="wh-hint-icon">🐝</text>
              <text class="wh-hint-text">{{ weather.hint || '正在获取天气...' }}</text>
            </view>
          </view>
        </view>
        <!-- 底部波浪 -->
        <view class="wave-divider">
          <view class="wave wave-1" />
          <view class="wave wave-2" />
        </view>
      </view>

      <!-- 数据概览 -->
      <view class="stats-row">
        <view class="stat-card stat-apiary" hover-class="stat-card--press" @tap="navTo('/pages/apiary/list')">
          <view class="stat-icon-box" style="background: linear-gradient(135deg, #e8f5e9, #c8e6c9)">
            <text class="stat-icon">🏠</text>
          </view>
          <view class="stat-num">{{ stats.apiaryCount }}</view>
          <text class="stat-label">蜂场</text>
        </view>
        <view class="stat-card stat-colony" hover-class="stat-card--press">
          <view class="stat-icon-box" style="background: linear-gradient(135deg, #fff9e6, #ffe082)">
            <text class="stat-icon">🐝</text>
          </view>
          <view class="stat-num">{{ stats.colonyCount }}</view>
          <text class="stat-label">蜂群</text>
        </view>
        <view class="stat-card stat-todo" hover-class="stat-card--press">
          <view class="stat-icon-box" :style="todos.length ? 'background: linear-gradient(135deg, #fce4ec, #ffcdd2)' : 'background: linear-gradient(135deg, #f3e5f5, #e1bee7)'">
            <text class="stat-icon">{{ todos.length ? '⚠️' : '✅' }}</text>
          </view>
          <view class="stat-num" :class="{ urgent: todos.length }">{{ todos.length }}</view>
          <text class="stat-label">待巡查</text>
        </view>
      </view>

      <!-- 快捷操作 -->
      <view class="section">
        <view class="section-header">
          <text class="section-title">快捷操作</text>
          <text class="section-subtitle">记录日常养蜂数据</text>
        </view>
        <view class="quick-grid">
          <view
            v-for="action in quickActions"
            :key="action.label"
            class="quick-item"
            hover-class="quick-item--press"
            @tap="navTo(action.url)"
          >
            <view class="quick-icon-wrap" :style="{ background: action.gradient }">
              <text class="quick-icon-emoji">{{ action.emoji }}</text>
            </view>
            <text class="quick-label">{{ action.label }}</text>
          </view>
        </view>
      </view>

      <!-- 紧急待办 -->
      <view class="alert-banner" v-if="todos.length" @tap="navTo('/pages/record/inspection')" hover-class="alert-banner--press">
        <view class="alert-bg-glow" />
        <view class="alert-icon-wrap">
          <text class="alert-icon">🚨</text>
        </view>
        <view class="alert-content">
          <text class="alert-title">{{ todos.length }} 个蜂场待巡查</text>
          <text class="alert-desc">{{ todos[0]?.text }}</text>
        </view>
        <text class="alert-arrow">›</text>
      </view>

      <!-- 我的蜂场 -->
      <view class="section">
        <view class="section-header">
          <text class="section-title">我的蜂场</text>
          <view class="section-header-right" @tap="navTo('/pages/apiary/list')" hover-class="opacity-70">
            <text class="section-link">全部</text>
            <text class="section-arrow">›</text>
          </view>
        </view>
        <scroll-view scroll-x class="apiary-scroll" :show-scrollbar="false">
          <view class="apiary-scroll-inner">
            <view
              class="apiary-card"
              v-for="apiary in apiaries"
              :key="apiary.id"
              hover-class="apiary-card--press"
              @tap="navTo(`/pages/apiary/detail?id=${apiary.id}`)"
            >
              <view class="ac-header">
                <view class="ac-name-row">
                  <text class="ac-icon">🏡</text>
                  <text class="ac-name">{{ apiary.name }}</text>
                </view>
                <view class="ac-status" :class="`health-${apiary.healthStatus}`">
                  {{ healthLabel[apiary.healthStatus] || '未知' }}
                </view>
              </view>
              <view class="ac-meta">
                <view class="ac-meta-item">
                  <text class="ac-meta-val">{{ apiary.colonyCount }}</text>
                  <text class="ac-meta-lbl">群</text>
                </view>
                <view class="ac-divider" />
                <view class="ac-meta-item">
                  <text class="ac-meta-val" :class="{ 'text-danger': apiary.lastInspectDays > 7 }">
                    {{ apiary.lastInspectDays !== null ? apiary.lastInspectDays : '--' }}
                  </text>
                  <text class="ac-meta-lbl">天未查</text>
                </view>
              </view>
            </view>
            <!-- 添加蜂场 -->
            <view class="add-card" hover-class="add-card--press" @tap="navTo('/pages/apiary/edit')">
              <view class="add-hex">
                <text class="add-hex-icon">+</text>
              </view>
              <text class="add-hex-label">添加蜂场</text>
            </view>
          </view>
        </scroll-view>
      </view>

      <!-- 最新通知 -->
      <view class="section section--last">
        <view class="section-header">
          <text class="section-title">最新通知</text>
          <view v-if="notices.length" class="section-header-right" @tap="navTo('/pages/mine/notifications')" hover-class="opacity-70">
            <text class="section-link">全部</text>
            <text class="section-arrow">›</text>
          </view>
        </view>

        <!-- 有通知 -->
        <view class="notice-list" v-if="notices.length">
          <view
            class="notice-item"
            v-for="n in notices"
            :key="n.id"
            hover-class="notice-item--press"
            @tap="navTo('/pages/mine/notifications')"
          >
            <view class="notice-type-ribbon" :class="`ntype-${n.type}`" />
            <view class="notice-body">
              <view class="notice-top">
                <view v-if="!n.isRead" class="unread-dot" />
                <text class="notice-title" :class="{ unread: !n.isRead }">{{ n.title }}</text>
              </view>
              <text class="notice-time">{{ n.time }}</text>
            </view>
            <text class="notice-arrow">›</text>
          </view>
        </view>

        <!-- 无通知 -->
        <view v-else class="empty-state">
          <view class="empty-illustration">
            <text class="empty-emoji">📭</text>
          </view>
          <text class="empty-title">暂无新通知</text>
          <text class="empty-desc">蜂场一切正常，继续保持</text>
        </view>
      </view>

      <!-- 底部安全距离 -->
      <view class="safe-area-bottom" />
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted, onUnmounted } from 'vue'
import { request } from '@/utils/http'
import { useUserStore } from '@/stores/user'

// ==================== 用户信息 ====================
const userStore = useUserStore()
const user = computed(() => userStore.user)
const userNameFirst = computed(() => {
  const name = user.value?.name || '蜂'
  return name.charAt(0)
})

// ==================== 问候语 ====================
const hour = new Date().getHours()
const greeting = computed(() => {
  if (hour < 6) return '夜深了，早点休息 🌙'
  if (hour < 9) return '早上好 ☀️'
  if (hour < 12) return '上午好 🌤️'
  if (hour < 14) return '中午好 ☀️'
  if (hour < 18) return '下午好 🌅'
  return '晚上好 🌙'
})

const dateText = computed(() => {
  const now = new Date()
  const w = ['日', '一', '二', '三', '四', '五', '六']
  return `${now.getFullYear()}年${now.getMonth() + 1}月${now.getDate()}日 星期${w[now.getDay()]}`
})

// ==================== 快速操作 ====================
const quickActions = [
  { emoji: '🔍', label: '记录巡查', url: '/pages/record/inspection', gradient: 'linear-gradient(135deg, #e8f5e9, #a5d6a7)' },
  { emoji: '🍯', label: '记录采蜜', url: '/pages/record/harvest', gradient: 'linear-gradient(135deg, #fff9c4, #ffe082)' },
  { emoji: '💊', label: '记录用药', url: '/pages/record/medication', gradient: 'linear-gradient(135deg, #fce4ec, #f48fb1)' },
  { emoji: '💰', label: '记录收支', url: '/pages/account/index', gradient: 'linear-gradient(135deg, #e3f2fd, #90caf9)' },
  { emoji: '🏷️', label: '溯源管理', url: '/pages/trace/list', gradient: 'linear-gradient(135deg, #ede7f6, #b39ddb)' },
]

// ==================== 响应式数据 ====================
const scrolled = ref(false)

const weather = ref({ temp: '--', desc: '加载中', hint: '', icon: '🌤️', high: '--', low: '--' })
const apiaries = ref<any[]>([])
const todos = ref<any[]>([])
const notices = ref<any[]>([])
const unreadCount = ref(0)
const loading = ref(true)

const stats = reactive({
  apiaryCount: '--',
  colonyCount: '--',
})

const healthLabel: Record<number, string> = { 1: '良好', 2: '正常', 3: '需关注', 4: '异常' }

const tabBarPages = ['/pages/index/index', '/pages/apiary/list', '/pages/account/index', '/pages/mine/index']

// ==================== 滚动 ====================
const mainScrollRef = ref<HTMLElement | null>(null)

function handleScroll() {
  const el = mainScrollRef.value
  if (!el) return
  scrolled.value = el.scrollTop > 10
}

function onScroll(_e: any) {
  handleScroll()
}

// ==================== 导航 ====================
function navTo(url: string) {
  const path = url.split('?')[0]
  if (tabBarPages.includes(path)) {
    uni.switchTab({ url })
  } else {
    uni.navigateTo({ url })
  }
}

// ==================== 数据加载 ====================
async function loadData() {
  loading.value = true
  try {
    const [apiaryList, noticeList] = await Promise.allSettled([
      request<any[]>({ url: '/app/apiaries' }),
      request<any[]>({ url: '/app/notifications?pageSize=3' }),
    ])

    if (apiaryList.status === 'fulfilled') {
      apiaries.value = apiaryList.value || []

      // 统计数据
      let totalColony = 0
      apiaries.value.forEach((a: any) => { totalColony += Number(a.colonyCount) || 0 })
      stats.apiaryCount = String(apiaries.value.length)
      stats.colonyCount = String(totalColony)

      // 待办
      const urgentList: any[] = []
      apiaries.value.forEach((a: any) => {
        if (a.lastInspectDays == null || a.lastInspectDays > 7) {
          const days = a.lastInspectDays == null ? '未' : `超${a.lastInspectDays}天`
          urgentList.push({ id: `inspect_${a.id}`, text: `${a.name} ${days}巡查`, urgent: true })
        }
      })
      todos.value = urgentList
    }

    if (noticeList.status === 'fulfilled') {
      const data = noticeList.value as any
      const list = data?.list || data || []
      notices.value = list.slice(0, 3)
      unreadCount.value = list.filter((n: any) => !n.isRead).length
    }
  } catch { /* ignore */ }
  loading.value = false
}

// ==================== 天气 ====================
const weatherCodeMap: Record<number, string> = {
  0: '晴', 1: '少云', 2: '多云', 3: '阴',
  45: '雾', 48: '冻雾',
  51: '小雨', 53: '中雨', 55: '大雨',
  61: '小雨', 63: '中雨', 65: '大雨',
  71: '小雪', 73: '中雪', 75: '大雪',
  80: '阵雨', 81: '中阵雨', 82: '大阵雨',
  95: '雷暴', 96: '雷暴+冰雹', 99: '强雷暴',
}

function getWeatherEmoji(code: number): string {
  if (code === 0) return '☀️'
  if (code <= 2) return '🌤️'
  if (code === 3) return '☁️'
  if (code <= 48) return '🌫️'
  if (code <= 55) return '🌦️'
  if (code <= 65) return '🌧️'
  if (code <= 75) return '❄️'
  if (code <= 82) return '🌧️'
  return '⛈️'
}

function getBeekeepingHint(code: number, precipProb: number, maxTemp: number, minTemp: number): string {
  if (code === 95 || code === 96 || code === 99) return '雷暴预警，注意蜂箱安全'
  const rainCodes = [51, 53, 55, 61, 63, 65, 80, 81, 82]
  if (rainCodes.includes(code) && precipProb >= 60) return '今日有雨，不宜外出采蜜'
  if (maxTemp >= 35) return '高温预警，注意蜂群通风降温'
  if (minTemp <= 5) return '低温预警，注意蜂箱保温'
  if (code <= 2 && maxTemp >= 15 && maxTemp <= 30) return '天气晴好，适合采蜜作业'
  if (code <= 2) return '天气不错，可进行日常巡查'
  if (rainCodes.includes(code) && precipProb >= 30) return '有降雨可能，合理安排作业'
  return '可进行常规蜂场作业'
}

async function fetchWeather() {
  try {
    const resp = await fetch(
      'https://api.open-meteo.com/v1/forecast?latitude=27.62049&longitude=119.938444&current_weather=true&daily=temperature_2m_max,temperature_2m_min,weathercode,precipitation_probability_max&timezone=Asia/Shanghai&forecast_days=1'
    )
    if (!resp.ok) throw new Error('Network error')
    const data = await resp.json()
    const current = data.current_weather
    const daily = data.daily

    const code = current.weathercode
    weather.value.temp = String(Math.round(current.temperature))
    weather.value.desc = weatherCodeMap[code] || '未知'
    weather.value.icon = getWeatherEmoji(code)
    weather.value.high = String(Math.round(daily.temperature_2m_max[0]))
    weather.value.low = String(Math.round(daily.temperature_2m_min[0]))

    const precipProb = daily.precipitation_probability_max?.[0] || 0
    const high = Number(weather.value.high)
    const low = Number(weather.value.low)
    weather.value.hint = getBeekeepingHint(code, precipProb, high, low)
  } catch {
    weather.value.desc = '获取失败'
  }
}

onMounted(() => {
  loadData(); fetchWeather()
  const el = mainScrollRef.value
  if (el) el.addEventListener('scroll', handleScroll, { passive: true })
})

onUnmounted(() => {
  const el = mainScrollRef.value
  if (el) el.removeEventListener('scroll', handleScroll)
})
</script>

<style scoped lang="scss">
/* ==============================
   CSS 变量 & 基础
   ============================== */
*, *::before, *::after {
  box-sizing: border-box;
}

page {
  background: #FDF8F0;
}

/* ==============================
   页面容器
   ============================== */
.page {
  height: 100vh;
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: stretch;
  position: relative;
  box-sizing: border-box;
}

/* ==============================
   顶部栏
   ============================== */
.top-bar {
  position: sticky;
  top: 0;
  z-index: 100;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: calc(env(safe-area-inset-top) + 12rpx) 24rpx 18rpx;
  transition: background 0.3s ease, box-shadow 0.3s ease;

  &--scrolled {
    background: rgba(253, 248, 240, 0.92);
    backdrop-filter: blur(20px);
    -webkit-backdrop-filter: blur(20px);
    box-shadow: 0 2rpx 20rpx rgba(245, 166, 35, 0.08);
  }
}

.brand-logo {
  display: flex;
  align-items: center;
  gap: 10rpx;
}

.brand-icon {
  font-size: 36rpx;
  line-height: 1;
}

.brand-text {
  font-size: 34rpx;
  font-weight: 700;
  color: #2C1810;
  letter-spacing: 1rpx;
}

.top-bar-right {
  display: flex;
  align-items: center;
  gap: 20rpx;
}

.notify-btn {
  position: relative;
  width: 72rpx;
  height: 72rpx;
  border-radius: 50%;
  background: rgba(255,255,255,0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 2rpx 12rpx rgba(0,0,0,0.04);
}

.notify-icon {
  font-size: 32rpx;
}

.notify-badge {
  position: absolute;
  top: 2rpx;
  right: 2rpx;
  min-width: 32rpx;
  height: 32rpx;
  line-height: 32rpx;
  text-align: center;
  font-size: 20rpx;
  font-weight: 700;
  color: #fff;
  background: #E74C3C;
  border-radius: 16rpx;
  padding: 0 8rpx;
  border: 2rpx solid #fff;
}

.avatar-wrap {
  width: 72rpx;
  height: 72rpx;
  border-radius: 50%;
  overflow: hidden;
  border: 2rpx solid rgba(245, 166, 35, 0.3);
  box-shadow: 0 2rpx 12rpx rgba(0,0,0,0.04);
}

.avatar-img {
  width: 100%;
  height: 100%;
}

.avatar-placeholder {
  width: 100%;
  height: 100%;
  background: linear-gradient(135deg, #f5a623, #FF8C00);
  display: flex;
  align-items: center;
  justify-content: center;
}

.avatar-letter {
  font-size: 32rpx;
  font-weight: 700;
  color: #fff;
}

/* ==============================
   主滚动区域（双层结构）
   ============================== */
.main-scroll {
  flex: 1;
  width: 100%;
  padding: 0 24rpx;
  box-sizing: border-box;
  /* 外层不设 overflow，仅负责 padding 布局 */
  min-height: 0;
}

.scroll-inner {
  width: 100%;
  height: 100%;
  overflow-y: auto;
  -webkit-overflow-scrolling: touch;
  /* overflow-x 由浏览器默认处理，不强制 hidden */
}

/* ==============================
   欢迎区
   ============================== */
.welcome-section {
  padding: 8rpx 8rpx 28rpx;
  animation: fadeSlideIn 0.5s ease both;
}

.welcome-greeting {
  font-size: 40rpx;
  font-weight: 700;
  color: #2C1810;
  display: block;
  line-height: 1.3;
}

.welcome-date {
  font-size: 24rpx;
  color: #A09080;
  margin-top: 8rpx;
  display: block;
  letter-spacing: 1rpx;
}

/* ==============================
   天气 Hero 卡片
   ============================== */
.weather-hero {
  position: relative;
  border-radius: 28rpx;
  overflow: hidden;
  margin-bottom: 24rpx;
  animation: fadeSlideIn 0.5s ease 0.1s both;

  &::before {
    content: '';
    position: absolute;
    inset: 0;
    background: linear-gradient(135deg, #1a0a00 0%, #4a2500 30%, #f5a623 70%, #FFD166 100%);
    z-index: 0;
  }

  /* 蜂窝装饰 */
  .hex-pattern {
    position: absolute;
    inset: 0;
    overflow: hidden;
    z-index: 1;
    opacity: 0.06;
  }

  .hex {
    position: absolute;
    width: 120rpx;
    height: 140rpx;
    background: #fff;
    clip-path: polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%);
  }
  .hex-1 { top: -30rpx; right: 40rpx; }
  .hex-2 { bottom: 20rpx; left: 180rpx; }
  .hex-3 { top: 80rpx; left: -30rpx; transform: scale(0.6); }
}

.weather-hero-inner {
  position: relative;
  z-index: 2;
  display: flex;
  justify-content: space-between;
  padding: 36rpx 32rpx 28rpx;
}

.wh-left {
  display: flex;
  flex-direction: column;
  gap: 8rpx;
}

.wh-location {
  font-size: 24rpx;
  color: rgba(255,255,255,0.8);
  display: block;
}

.wh-temp-row {
  display: flex;
  align-items: flex-start;
  gap: 8rpx;
}

.wh-icon {
  font-size: 44rpx;
  margin-top: 6rpx;
}

.wh-temp {
  font-size: 96rpx;
  font-weight: 800;
  color: #fff;
  line-height: 1;
  letter-spacing: -4rpx;
  text-shadow: 0 4rpx 16rpx rgba(0,0,0,0.15);
}

.wh-desc {
  font-size: 28rpx;
  color: rgba(255,255,255,0.85);
  display: block;
}

.wh-range {
  display: flex;
  align-items: center;
  gap: 10rpx;
  margin-top: 4rpx;
}

.wh-low, .wh-high {
  font-size: 22rpx;
  color: rgba(255,255,255,0.65);
}

.wh-range-bar {
  width: 60rpx;
  height: 4rpx;
  border-radius: 2rpx;
  background: linear-gradient(90deg, rgba(255,255,255,0.3), rgba(255,255,255,0.6));
}

.wh-right {
  display: flex;
  align-items: flex-end;
}

.wh-hint-box {
  background: rgba(255,255,255,0.12);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  border-radius: 16rpx;
  padding: 16rpx 18rpx;
  max-width: 240rpx;
  border: 1rpx solid rgba(255,255,255,0.15);
}

.wh-hint-icon {
  font-size: 28rpx;
  display: block;
  margin-bottom: 8rpx;
}

.wh-hint-text {
  font-size: 22rpx;
  color: rgba(255,255,255,0.9);
  line-height: 1.5;
  display: block;
}

/* 底部波浪 */
.wave-divider {
  position: relative;
  z-index: 2;
  height: 20rpx;
  overflow: hidden;
}

.wave {
  position: absolute;
  width: 200%;
  height: 100%;
  background: #FDF8F0;
  border-radius: 50%;

  &-1 {
    bottom: -10rpx;
    left: 0;
    opacity: 1;
  }
  &-2 {
    bottom: -5rpx;
    left: -10%;
    opacity: 0.5;
  }
}

/* ==============================
   数据概览
   ============================== */
.stats-row {
  display: flex;
  gap: 16rpx;
  margin-bottom: 24rpx;
  animation: fadeSlideIn 0.5s ease 0.15s both;
}

.stat-card {
  flex: 1;
  background: #fff;
  border-radius: 20rpx;
  padding: 24rpx 16rpx;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8rpx;
  box-shadow: 0 2rpx 16rpx rgba(0,0,0,0.03);
  transition: transform 0.2s ease, box-shadow 0.2s ease;

  &--press {
    transform: scale(0.95);
    box-shadow: 0 1rpx 8rpx rgba(0,0,0,0.06);
  }
}

.stat-icon-box {
  width: 68rpx;
  height: 68rpx;
  border-radius: 18rpx;
  display: flex;
  align-items: center;
  justify-content: center;
}

.stat-icon {
  font-size: 32rpx;
}

.stat-num {
  font-size: 40rpx;
  font-weight: 800;
  color: #2C1810;
  line-height: 1;
  letter-spacing: -1rpx;

  &.urgent { color: #D32F2F; }
}

.stat-label {
  font-size: 22rpx;
  color: #A09080;
  letter-spacing: 1rpx;
}

/* ==============================
   通用 Section
   ============================== */
.section {
  background: #fff;
  border-radius: 24rpx;
  padding: 16rpx;
  margin-bottom: 24rpx;
  box-shadow: 0 2rpx 20rpx rgba(0,0,0,0.03);
  animation: fadeSlideIn 0.5s ease 0.2s both;

  &--last { margin-bottom: 0; }
}

.section-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 24rpx;
}

.section-title {
  font-size: 32rpx;
  font-weight: 700;
  color: #2C1810;
  letter-spacing: 1rpx;
}

.section-subtitle {
  font-size: 24rpx;
  color: #A09080;
  margin-left: 12rpx;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.section-header-right {
  display: flex;
  align-items: center;
  gap: 4rpx;
  transition: opacity 0.15s;
  min-width: 0;
  flex-shrink: 1;
}

.section-link {
  font-size: 26rpx;
  color: #A09080;
  white-space: nowrap;
}

.section-arrow {
  font-size: 28rpx;
  color: #C0B0A0;
}

.opacity-70 { opacity: 0.7; }

/* ==============================
   快捷操作
   ============================== */
.quick-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 24rpx 8rpx;
}

.quick-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12rpx;
  transition: transform 0.2s ease;

  &--press { transform: scale(0.9); }
}

.quick-icon-wrap {
  width: 88rpx;
  height: 88rpx;
  border-radius: 22rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4rpx 16rpx rgba(0,0,0,0.06);
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.quick-icon-emoji {
  font-size: 36rpx;
}

.quick-label {
  font-size: 22rpx;
  color: #5C4A3A;
  letter-spacing: 0.5rpx;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 100%;
}

/* ==============================
   紧急待办横幅
   ============================== */
.alert-banner {
  position: relative;
  display: flex;
  align-items: center;
  gap: 16rpx;
  padding: 24rpx 24rpx;
  background: linear-gradient(135deg, #FFF5F5, #FFEBEE);
  border-radius: 20rpx;
  margin-bottom: 24rpx;
  border: 1rpx solid rgba(231, 76, 60, 0.12);
  overflow: hidden;
  animation: fadeSlideIn 0.5s ease 0.25s both;
  transition: transform 0.2s ease;

  &--press { transform: scale(0.97); }
}

.alert-bg-glow {
  position: absolute;
  width: 200rpx;
  height: 200rpx;
  right: -50rpx;
  top: -50rpx;
  border-radius: 50%;
  background: radial-gradient(circle, rgba(231,76,60,0.08), transparent);
}

.alert-icon-wrap {
  width: 56rpx;
  height: 56rpx;
  border-radius: 16rpx;
  background: rgba(231, 76, 60, 0.1);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.alert-icon {
  font-size: 28rpx;
}

.alert-content {
  flex: 1;
  min-width: 0;
}

.alert-title {
  font-size: 26rpx;
  font-weight: 700;
  color: #C0392B;
  display: block;
}

.alert-desc {
  font-size: 22rpx;
  color: #E57373;
  display: block;
  margin-top: 4rpx;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.alert-arrow {
  font-size: 36rpx;
  color: #E57373;
  flex-shrink: 0;
}

/* ==============================
   蜂场卡片
   ============================== */
.apiary-scroll {
  white-space: nowrap;
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
}

.apiary-scroll-inner {
  display: inline-flex;
  gap: 18rpx;
  padding-bottom: 4rpx;
}

.apiary-card {
  display: inline-flex;
  flex-direction: column;
  gap: 16rpx;
  background: #fff;
  border-radius: 20rpx;
  padding: 24rpx;
  width: 266rpx;
  white-space: normal;
  flex-shrink: 0;
  border: 1rpx solid #F0EBE3;
  box-shadow: 0 4rpx 20rpx rgba(0,0,0,0.04);
  transition: transform 0.2s ease, box-shadow 0.2s ease;

  &--press {
    transform: scale(0.96);
    box-shadow: 0 2rpx 10rpx rgba(0,0,0,0.06);
  }
}

.ac-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.ac-name-row {
  display: flex;
  align-items: center;
  gap: 6rpx;
  min-width: 0;
  flex: 1;
}

.ac-icon { font-size: 24rpx; flex-shrink: 0; }

.ac-name {
  font-size: 28rpx;
  font-weight: 600;
  color: #2C1810;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.ac-status {
  font-size: 20rpx;
  padding: 4rpx 12rpx;
  border-radius: 16rpx;
  flex-shrink: 0;
  font-weight: 500;
  letter-spacing: 0.5rpx;
}

.health-1 { background: #E8F5E9; color: #27AE60; }
.health-2 { background: #E3F2FD; color: #1976D2; }
.health-3 { background: #FFF3E0; color: #EF6C00; }
.health-4 { background: #FCE4EC; color: #D32F2F; }

.ac-meta {
  display: flex;
  align-items: center;
  padding-top: 16rpx;
  border-top: 1rpx solid #F5F2EE;
}

.ac-meta-item {
  display: flex;
  align-items: baseline;
  gap: 2rpx;
}

.ac-meta-val {
  font-size: 28rpx;
  font-weight: 700;
  color: #2C1810;
}

.ac-meta-lbl {
  font-size: 20rpx;
  color: #A09080;
}

.ac-divider {
  width: 1rpx;
  height: 28rpx;
  background: #E8E0D5;
  margin: 0 16rpx;
}

.text-danger { color: #D32F2F !important; }

/* 添加蜂场 */
.add-card {
  display: inline-flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 266rpx;
  min-height: 182rpx;
  border: 2rpx dashed #E8DCC8;
  border-radius: 20rpx;
  background: linear-gradient(135deg, #FDFBF7, #FAF5EC);
  flex-shrink: 0;
  gap: 16rpx;
  transition: transform 0.2s ease, background 0.2s ease;

  &--press {
    transform: scale(0.96);
    background: #F5EDE0;
  }
}

.add-hex {
  width: 64rpx;
  height: 64rpx;
  border-radius: 50%;
  background: rgba(245, 166, 35, 0.08);
  border: 2rpx dashed #f5a623;
  display: flex;
  align-items: center;
  justify-content: center;
}

.add-hex-icon {
  font-size: 32rpx;
  color: #f5a623;
  font-weight: 300;
}

.add-hex-label {
  font-size: 24rpx;
  color: #C0B0A0;
  letter-spacing: 1rpx;
}

/* ==============================
   通知列表
   ============================== */
.notice-list {
  overflow: hidden;
}

.notice-item {
  display: flex;
  align-items: center;
  gap: 16rpx;
  padding: 20rpx 12rpx;
  margin: 0 -8rpx;
  border-radius: 14rpx;
  transition: background 0.15s ease;

  &:active { background: #FBF6EE; }
  &:not(:last-child) { margin-bottom: 4rpx; }

  &--press { background: #FBF6EE; }
}

.notice-type-ribbon {
  width: 52rpx;
  height: 52rpx;
  border-radius: 14rpx;
  flex-shrink: 0;
}

.ntype-1 { background: #E3F2FD; }
.ntype-2 { background: #E8F5E9; }
.ntype-3 { background: #FCE4EC; }
.ntype-4 { background: #FFF3E0; }
.ntype-5 { background: #F5F5F5; }

.notice-body {
  flex: 1;
  min-width: 0;
}

.notice-top {
  display: flex;
  align-items: center;
  gap: 8rpx;
}

.unread-dot {
  width: 10rpx;
  height: 10rpx;
  border-radius: 50%;
  background: #E74C3C;
  flex-shrink: 0;
}

.notice-title {
  font-size: 27rpx;
  color: #8B7B6B;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;

  &.unread {
    color: #2C1810;
    font-weight: 600;
  }
}

.notice-time {
  font-size: 22rpx;
  color: #C0B0A0;
  margin-top: 6rpx;
  display: block;
}

.notice-arrow {
  font-size: 32rpx;
  color: #D8D0C8;
  flex-shrink: 0;
}

/* ==============================
   空状态
   ============================== */
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 48rpx 0 36rpx;
}

.empty-illustration {
  width: 120rpx;
  height: 120rpx;
  border-radius: 50%;
  background: #FDF8F0;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 20rpx;
}

.empty-emoji {
  font-size: 48rpx;
  opacity: 0.6;
}

.empty-title {
  font-size: 28rpx;
  font-weight: 600;
  color: #A09080;
  margin-bottom: 8rpx;
}

.empty-desc {
  font-size: 24rpx;
  color: #C0B0A0;
  letter-spacing: 0.5rpx;
}

/* ==============================
   底部安全距离
   ============================== */
.safe-area-bottom {
  height: calc(env(safe-area-inset-bottom) + 120rpx);
}

/* ==============================
   动画
   ============================== */
@keyframes fadeSlideIn {
  from {
    opacity: 0;
    transform: translateY(16rpx);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
