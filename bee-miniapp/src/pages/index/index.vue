<template>
  <view class="page">
    <!-- 顶部品牌装饰条 -->
    <view class="brand-bar" />

    <!-- 天气卡片 -->
    <view class="weather-card">
      <view class="weather-left">
        <text class="weather-temp">{{ weather.temp }}°</text>
        <text class="weather-desc">{{ weather.desc }}</text>
      </view>
      <view class="weather-right">
        <view class="weather-info-box">
          <text class="weather-location">{{ firstApiary?.name || '暂无蜂场' }}</text>
          <text class="weather-hint" v-if="weather.hint">{{ weather.hint }}</text>
        </view>
      </view>
    </view>

    <!-- 今日待办 -->
    <view class="section" v-if="todos.length">
      <view class="section-header">
        <view class="section-bar" />
        <text class="section-title">今日待办</text>
      </view>
      <view class="todo-list">
        <view class="todo-item" v-for="t in todos" :key="t.id">
          <view class="todo-indicator" :class="{ urgent: t.urgent }" />
          <text class="todo-text" :class="{ urgent: t.urgent }">{{ t.text }}</text>
        </view>
      </view>
    </view>

    <!-- 快捷操作 -->
    <view class="section">
      <view class="section-header">
        <view class="section-bar" />
        <text class="section-title">快捷操作</text>
      </view>
      <view class="quick-grid">
        <view class="quick-item" hover-class="quick-item-active" @tap="navTo('/pages/record/inspection')">
          <view class="quick-icon" style="background: linear-gradient(135deg, #c8e6c9, #a5d6a7)">
            <text class="quick-emoji">🔍</text>
          </view>
          <text class="quick-label">记录巡查</text>
        </view>
        <view class="quick-item" hover-class="quick-item-active" @tap="navTo('/pages/record/harvest')">
          <view class="quick-icon" style="background: linear-gradient(135deg, #fff9c4, #fff176)">
            <text class="quick-emoji">🍯</text>
          </view>
          <text class="quick-label">记录采蜜</text>
        </view>
        <view class="quick-item" hover-class="quick-item-active" @tap="navTo('/pages/record/medication')">
          <view class="quick-icon" style="background: linear-gradient(135deg, #f8bbd0, #f48fb1)">
            <text class="quick-emoji">💊</text>
          </view>
          <text class="quick-label">记录用药</text>
        </view>
        <view class="quick-item" hover-class="quick-item-active" @tap="navTo('/pages/account/index')">
          <view class="quick-icon" style="background: linear-gradient(135deg, #bbdefb, #90caf9)">
            <text class="quick-emoji">💰</text>
          </view>
          <text class="quick-label">记录收支</text>
        </view>
      </view>
    </view>

    <!-- 蜂场概况 -->
    <view class="section">
      <view class="section-header">
        <view class="section-bar" />
        <text class="section-title">我的蜂场</text>
      </view>
      <scroll-view scroll-x class="apiary-scroll" :show-scrollbar="false">
        <view class="apiary-scroll-inner">
          <view
            class="apiary-card"
            v-for="apiary in apiaries"
            :key="apiary.id"
            hover-class="apiary-card-active"
            @tap="navTo(`/pages/apiary/detail?id=${apiary.id}`)"
          >
            <view class="apiary-card-top">
              <text class="apiary-name">{{ apiary.name }}</text>
              <view class="apiary-status" :class="`health-${apiary.healthStatus}`">
                {{ healthLabel[apiary.healthStatus] || '未知' }}
              </view>
            </view>
            <text class="apiary-info">{{ apiary.colonyCount }} 群蜜蜂</text>
            <view class="apiary-card-bottom">
              <text class="apiary-inspect">
                上次巡查：{{ apiary.lastInspectDays !== null ? `${apiary.lastInspectDays}天前` : '未巡查' }}
              </text>
            </view>
          </view>
          <view class="apiary-card add-card" hover-class="add-card-active" @tap="navTo('/pages/apiary/edit')">
            <view class="add-icon-wrap">
              <text class="add-icon">+</text>
            </view>
            <text class="add-label">添加蜂场</text>
          </view>
        </view>
      </scroll-view>
    </view>

    <!-- 最新通知 -->
    <view class="section">
      <view class="section-header">
        <view class="section-bar" />
        <text class="section-title">最新通知</text>
      </view>
      <view class="notice-list" v-if="notices.length">
        <view
          class="notice-item"
          v-for="n in notices"
          :key="n.id"
          hover-class="notice-item-active"
          @tap="navTo('/pages/mine/notifications')"
        >
          <view class="notice-dot" :class="`type-${n.type}`" />
          <view class="notice-content">
            <view class="notice-title-row">
              <view class="unread-dot" v-if="!n.isRead" />
              <text class="notice-title" :class="{ unread: !n.isRead }">{{ n.title }}</text>
            </view>
            <text class="notice-time">{{ n.time }}</text>
          </view>
          <text class="notice-arrow">›</text>
        </view>
      </view>
      <view v-else class="empty-state">
        <text class="empty-icon">📭</text>
        <text class="empty-text">暂无新通知</text>
      </view>
    </view>

    <!-- 底部安全距离 -->
    <view class="safe-area-bottom" />
  </view>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { request } from '@/utils/http'

const weather = ref({ temp: '--', desc: '加载中', hint: '' })
const apiaries = ref<any[]>([])
const todos = ref<any[]>([])
const notices = ref<any[]>([])
const firstApiary = ref<any>(null)

const healthLabel: Record<number, string> = {
  1: '良好',
  2: '正常',
  3: '需关注',
  4: '异常',
}

function navTo(url: string) {
  uni.navigateTo({ url })
}

async function loadData() {
  try {
    const [apiaryList, noticeList] = await Promise.allSettled([
      request<any[]>({ url: '/app/apiaries' }),
      request<any[]>({ url: '/app/notifications?pageSize=3' }),
    ])

    if (apiaryList.status === 'fulfilled') {
      apiaries.value = apiaryList.value || []
      firstApiary.value = apiaries.value[0] || null

      // 生成待办列表
      const urgentList: any[] = []
      apiaries.value.forEach((a: any) => {
        if (a.lastInspectDays > 7) {
          urgentList.push({ id: `inspect_${a.id}`, text: `${a.name} 超7天未巡查`, urgent: true })
        }
      })
      todos.value = urgentList
    }

    if (noticeList.status === 'fulfilled') {
      const data = noticeList.value as any
      notices.value = (data?.list || data || []).slice(0, 3)
    }
  } catch {
    // ignore
  }
}

onMounted(loadData)
</script>

<style scoped lang="scss">
/* ==============================
   页面容器
   ============================== */
.page {
  padding: 0 24rpx 24rpx;
  min-height: 100vh;
  background: linear-gradient(180deg, #faf6f0 0%, #f5f7fa 200rpx);
}

/* 顶部品牌装饰条 */
.brand-bar {
  width: 100%;
  height: 6rpx;
  background: linear-gradient(90deg, #f5a623, #FF8C00, #ffd166);
  position: sticky;
  top: 0;
  z-index: 10;
}

/* ==============================
   天气卡片 (Hero Card)
   ============================== */
.weather-card {
  background: linear-gradient(135deg, #FF8C00 0%, #f5a623 50%, #ffd166 100%);
  border-radius: 24rpx;
  padding: 40rpx;
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin: 24rpx 0 32rpx;
  color: #fff;
  box-shadow: 0 8rpx 32rpx rgba(245, 166, 35, 0.35);
  position: relative;
  overflow: hidden;

  /* 装饰性背景圆 */
  &::after {
    content: '';
    position: absolute;
    right: -40rpx;
    top: -40rpx;
    width: 200rpx;
    height: 200rpx;
    border-radius: 50%;
    background: rgba(255, 255, 255, 0.08);
  }
}

.weather-left {
  position: relative;
  z-index: 1;
}

.weather-temp {
  font-size: 80rpx;
  font-weight: 700;
  line-height: 1;
  letter-spacing: -2rpx;
  text-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.1);
}

.weather-desc {
  font-size: 28rpx;
  display: block;
  margin-top: 8rpx;
  opacity: 0.9;
}

.weather-right {
  position: relative;
  z-index: 1;
}

.weather-info-box {
  background: rgba(255, 255, 255, 0.15);
  backdrop-filter: blur(10px);
  border-radius: 16rpx;
  padding: 16rpx 24rpx;
  border: 1rpx solid rgba(255, 255, 255, 0.2);
}

.weather-location {
  font-size: 26rpx;
  display: block;
  line-height: 1.4;
}

.weather-hint {
  font-size: 22rpx;
  opacity: 0.8;
  display: block;
  margin-top: 6rpx;
}

/* ==============================
   通用 Section 模块
   ============================== */
.section {
  background: #fff;
  border-radius: 20rpx;
  padding: 28rpx 24rpx;
  margin-bottom: 24rpx;
  box-shadow: 0 2rpx 16rpx rgba(0, 0, 0, 0.04);
}

.section-header {
  display: flex;
  align-items: center;
  margin-bottom: 24rpx;
}

.section-bar {
  width: 6rpx;
  height: 28rpx;
  border-radius: 3rpx;
  background: linear-gradient(180deg, #f5a623, #FF8C00);
  margin-right: 12rpx;
  flex-shrink: 0;
}

.section-title {
  font-size: 30rpx;
  font-weight: 600;
  color: #2c2c2c;
  letter-spacing: 1rpx;
}

/* ==============================
   待办列表
   ============================== */
.todo-list {
  border-radius: 12rpx;
  overflow: hidden;
}

.todo-item {
  display: flex;
  align-items: center;
  padding: 18rpx 16rpx;
  margin: 0 -8rpx;
  border-radius: 12rpx;
  transition: background 0.2s ease;

  &:active {
    background: #f9f6f0;
  }

  &:not(:last-child) {
    margin-bottom: 4rpx;
  }
}

.todo-indicator {
  width: 6rpx;
  height: 48rpx;
  border-radius: 3rpx;
  background: #f5a623;
  margin-right: 20rpx;
  flex-shrink: 0;

  &.urgent {
    background: linear-gradient(180deg, #e74c3c, #ff6b6b);
  }
}

.todo-text {
  font-size: 27rpx;
  color: #555;
  line-height: 1.5;

  &.urgent {
    color: #c0392b;
    font-weight: 500;
  }
}

/* ==============================
   快捷操作
   ============================== */
.quick-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 20rpx;
  padding: 8rpx 0;
}

.quick-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 14rpx;
  transition: transform 0.2s ease;
}

.quick-item-active {
  transform: scale(0.92);
  opacity: 0.85;
}

.quick-icon {
  width: 96rpx;
  height: 96rpx;
  border-radius: 24rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.06);
}

.quick-emoji {
  font-size: 38rpx;
}

.quick-label {
  font-size: 24rpx;
  color: #666;
  letter-spacing: 0.5rpx;
}

/* ==============================
   蜂场卡片
   ============================== */
.apiary-scroll {
  white-space: nowrap;
  margin: 0 -24rpx;
  padding: 0 24rpx;
}

.apiary-scroll-inner {
  display: flex;
  gap: 20rpx;
}

.apiary-card {
  display: inline-flex;
  flex-direction: column;
  background: #fff;
  border-radius: 20rpx;
  padding: 24rpx;
  width: 280rpx;
  white-space: normal;
  flex-shrink: 0;
  border: 1rpx solid #f0ebe3;
  box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.05);
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.apiary-card-active {
  transform: scale(0.97);
  box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.08);
}

.apiary-card-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 10rpx;
}

.apiary-name {
  font-size: 28rpx;
  font-weight: 600;
  color: #2c2c2c;
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.apiary-status {
  font-size: 20rpx;
  padding: 4rpx 14rpx;
  border-radius: 20rpx;
  flex-shrink: 0;
  margin-left: 8rpx;
  font-weight: 500;
}

.health-1 { background: #e8f5e9; color: #2ecc71; }
.health-2 { background: #e3f2fd; color: #2196f3; }
.health-3 { background: #fff3e0; color: #ef6c00; }
.health-4 { background: #fce4ec; color: #e74c3c; }

.apiary-info {
  font-size: 24rpx;
  color: #888;
  margin-bottom: 12rpx;
}

.apiary-card-bottom {
  padding-top: 12rpx;
  border-top: 1rpx solid #f5f2ee;
}

.apiary-inspect {
  font-size: 22rpx;
  color: #aaa;
  line-height: 1.4;
}

/* 添加蜂场卡片 */
.add-card {
  justify-content: center;
  align-items: center;
  border: 2rpx dashed #e8dcc8;
  background: #fdfbf7;
  min-height: 180rpx;
}

.add-card-active {
  transform: scale(0.97);
  background: #faf5ec;
}

.add-icon-wrap {
  width: 72rpx;
  height: 72rpx;
  border-radius: 50%;
  border: 2rpx dashed #f5a623;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 12rpx;
}

.add-icon {
  font-size: 36rpx;
  color: #f5a623;
  font-weight: 300;
  line-height: 1;
  margin-top: -2rpx;
}

.add-label {
  color: #bbb;
  font-size: 24rpx;
  letter-spacing: 1rpx;
}

/* ==============================
   通知列表
   ============================== */
.notice-list {
  border-radius: 12rpx;
  overflow: hidden;
}

.notice-item {
  display: flex;
  align-items: center;
  padding: 18rpx 12rpx;
  margin: 0 -8rpx;
  border-radius: 12rpx;
  transition: background 0.2s ease;

  &:active {
    background: #f9f6f0;
  }

  &:not(:last-child) {
    margin-bottom: 4rpx;
  }
}

.notice-item-active {
  background: #f9f6f0;
}

.notice-dot {
  width: 14rpx;
  height: 14rpx;
  border-radius: 50%;
  flex-shrink: 0;
  margin: 0 16rpx 0 8rpx;
}

.type-1 { background: #2196f3; }
.type-2 { background: #4caf50; }
.type-3 { background: #e74c3c; }
.type-4 { background: #f5a623; }
.type-5 { background: #bbb; }

.notice-content {
  flex: 1;
  min-width: 0;
}

.notice-title-row {
  display: flex;
  align-items: center;
}

.unread-dot {
  width: 12rpx;
  height: 12rpx;
  border-radius: 50%;
  background: #e74c3c;
  margin-right: 10rpx;
  flex-shrink: 0;
}

.notice-title {
  font-size: 27rpx;
  color: #888;
  display: block;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;

  &.unread {
    color: #2c2c2c;
    font-weight: 600;
  }
}

.notice-time {
  font-size: 22rpx;
  color: #bbb;
  margin-top: 6rpx;
  display: block;
}

.notice-arrow {
  font-size: 32rpx;
  color: #ddd;
  margin-left: 8rpx;
  flex-shrink: 0;
}

/* ==============================
   空状态
   ============================== */
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 40rpx 0 24rpx;
}

.empty-icon {
  font-size: 56rpx;
  margin-bottom: 16rpx;
  opacity: 0.6;
}

.empty-text {
  color: #bbb;
  font-size: 26rpx;
  letter-spacing: 1rpx;
}

/* ==============================
   底部安全距离
   ============================== */
.safe-area-bottom {
  height: calc(env(safe-area-inset-bottom) + 20rpx);
}
</style>
