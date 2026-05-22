<template>
  <view class="page">
    <!-- 顶部操作栏 -->
    <view class="top-bar">
      <text class="bar-title">追溯码管理</text>
      <view class="bar-action" @tap="navToGenerate">
        <text class="bar-action-icon">+</text>
        <text class="bar-action-text">生成追溯码</text>
      </view>
    </view>

    <!-- 统计数据 -->
    <view class="stats-row" v-if="list.length">
      <view class="stat-item">
        <text class="stat-num">{{ list.length }}</text>
        <text class="stat-label">追溯码总数</text>
      </view>
      <view class="stat-item">
        <text class="stat-num">{{ totalScans }}</text>
        <text class="stat-label">累计扫码</text>
      </view>
      <view class="stat-item">
        <text class="stat-num">{{ activeCount }}</text>
        <text class="stat-label">有效中</text>
      </view>
    </view>

    <!-- 列表 -->
    <view v-if="loading" class="loading-wrap">
      <text class="loading-text">加载中...</text>
    </view>

    <view v-else-if="!list.length" class="empty-wrap">
      <text class="empty-icon">🏷️</text>
      <text class="empty-title">还没有追溯码</text>
      <text class="empty-desc">采蜜后生成追溯码，消费者扫码即可查看蜂蜜源头信息</text>
      <button class="empty-btn" @tap="navToGenerate">去生成</button>
    </view>

    <view v-else class="trace-list">
      <view
        v-for="item in list"
        :key="item.id"
        class="trace-card"
        :class="{ recalled: item.status === 0 }"
        hover-class="trace-card-active"
        @tap="showDetail(item)"
      >
        <view class="card-top">
          <view class="card-left">
            <text class="product-name">{{ item.productName }}</text>
            <text class="trace-code">{{ item.code }}</text>
          </view>
          <view class="card-status" :class="item.status === 1 ? 'valid' : 'recalled'">
            {{ item.status === 1 ? '有效' : '已撤销' }}
          </view>
        </view>
        <view class="card-meta">
          <text class="meta-item">{{ item.spec }}</text>
          <text class="meta-divider">|</text>
          <text class="meta-item">{{ item.produceDate }}</text>
          <text class="meta-divider">|</text>
          <text class="meta-item">扫码 {{ item.scanCount || 0 }} 次</text>
        </view>
        <view class="card-arrow">详情 ›</view>
      </view>
    </view>

    <!-- 详情弹窗 -->
    <view v-if="detailItem" class="popup-mask" @tap="closeDetail">
      <view class="popup-content" @tap.stop="">
        <view class="popup-header">
          <text class="popup-title">追溯码详情</text>
          <text class="popup-close" @tap="closeDetail">✕</text>
        </view>

        <!-- 溯源码 -->
        <view class="detail-section">
          <text class="detail-label">溯源码</text>
          <view class="detail-code-row">
            <text class="detail-code">{{ detailItem.code }}</text>
            <text class="detail-copy" @tap="copyCode">复制</text>
          </view>
        </view>

        <!-- 产品信息 -->
        <view class="detail-section">
          <text class="detail-label">产品信息</text>
          <view class="detail-grid">
            <view class="detail-cell">
              <text class="cell-label">名称</text>
              <text class="cell-value">{{ detailItem.productName }}</text>
            </view>
            <view class="detail-cell">
              <text class="cell-label">规格</text>
              <text class="cell-value">{{ detailItem.spec }}</text>
            </view>
            <view class="detail-cell">
              <text class="cell-label">生产日期</text>
              <text class="cell-value">{{ detailItem.produceDate }}</text>
            </view>
            <view class="detail-cell">
              <text class="cell-label">保质期</text>
              <text class="cell-value">{{ detailItem.shelfLifeMonths }}个月</text>
            </view>
            <view class="detail-cell" v-if="detailItem.batchNo">
              <text class="cell-label">批次号</text>
              <text class="cell-value">{{ detailItem.batchNo }}</text>
            </view>
            <view class="detail-cell">
              <text class="cell-label">扫码次数</text>
              <text class="cell-value" :class="{ 'scan-warn': detailItem.scanCount > 50 }">
                {{ detailItem.scanCount || 0 }} 次
                <text v-if="detailItem.scanCount > 50" class="warn-tip">⚠️ 高频</text>
              </text>
            </view>
          </view>
        </view>

        <!-- 二维码 -->
        <view class="detail-section center">
          <text class="detail-label">扫码查看溯源</text>
          <image
            class="detail-qr"
            :src="detailQrUrl"
            mode="aspectFit"
          />
          <text class="qr-url-hint">{{ qrDisplayUrl }}</text>
        </view>

        <!-- 操作 -->
        <view class="detail-actions">
          <button class="d-action-btn outline" @tap="copyUrl">复制溯源链接</button>
          <button
            v-if="detailItem.status === 1"
            class="d-action-btn danger"
            @tap="revokeConfirm"
          >撤销追溯码</button>
        </view>
      </view>
    </view>

    <!-- 底部安全距离 -->
    <view class="safe-bottom" />
  </view>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { request } from '@/utils/http'

const loading = ref(true)
const list = ref<any[]>([])
const detailItem = ref<any>(null)
const detailQrUrl = ref('')

const totalScans = computed(() => list.value.reduce((sum, item) => sum + (item.scanCount || 0), 0))
const activeCount = computed(() => list.value.filter(item => item.status === 1).length)

const qrDisplayUrl = computed(() => {
  if (!detailItem.value) return ''
  return `https://bee-trace.example.com/trace/${detailItem.value.code}`
})

onMounted(loadList)

async function loadList() {
  loading.value = true
  try {
    const data = await request<any[]>({ url: '/app/trace?pageSize=100' })
    const result = (data as any)?.list || data || []
    list.value = result
  } catch {
    uni.showToast({ title: '加载失败', icon: 'none' })
  } finally {
    loading.value = false
  }
}

function navToGenerate() {
  uni.navigateTo({ url: '/pages/trace/generate' })
}

async function showDetail(item: any) {
  try {
    const data: any = await request({ url: `/app/trace/${item.id}` })
    detailItem.value = { ...item, ...data }
    const qrUrl = data.qrUrl || `https://bee-trace.example.com/trace/${item.code}`
    detailQrUrl.value = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(qrUrl)}`
  } catch {
    detailItem.value = item
    detailQrUrl.value = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(`https://bee-trace.example.com/trace/${item.code}`)}`
  }
}

function closeDetail() {
  detailItem.value = null
}

function copyCode() {
  uni.setClipboardData({
    data: detailItem.value.code,
    success: () => uni.showToast({ title: '已复制溯源码', icon: 'success' }),
  })
}

function copyUrl() {
  uni.setClipboardData({
    data: qrDisplayUrl.value,
    success: () => uni.showToast({ title: '已复制溯源链接', icon: 'success' }),
  })
}

function revokeConfirm() {
  uni.showModal({
    title: '确认撤销',
    content: '撤销后消费者将无法通过此溯源码查询产品信息，确定撤销吗？',
    success: (res) => {
      if (res.confirm) revoke()
    },
  })
}

async function revoke() {
  // 后端撤销功能：暂通过 status 字段更新，如后端未提供撤销API，提示需后端支持
  uni.showToast({ title: '撤销功能待后端支持', icon: 'none' })
}
</script>

<style scoped>
.page {
  padding: 24rpx 24rpx 60rpx;
  background: #f5f7fa;
  min-height: 100vh;
}

/* 顶部操作栏 */
.top-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24rpx;
}

.bar-title {
  font-size: 34rpx;
  font-weight: 700;
  color: #2c2c2c;
}

.bar-action {
  display: flex;
  align-items: center;
  gap: 6rpx;
  background: linear-gradient(135deg, #f5a623, #FF8C00);
  padding: 12rpx 24rpx;
  border-radius: 32rpx;
  box-shadow: 0 4rpx 12rpx rgba(245, 166, 35, 0.3);
}

.bar-action-icon {
  font-size: 28rpx;
  color: #fff;
  font-weight: 700;
  margin-top: -2rpx;
}

.bar-action-text {
  font-size: 26rpx;
  color: #fff;
  font-weight: 500;
}

/* 统计行 */
.stats-row {
  display: flex;
  background: #fff;
  border-radius: 16rpx;
  padding: 24rpx;
  margin-bottom: 24rpx;
  box-shadow: 0 2rpx 12rpx rgba(0, 0, 0, 0.04);
}

.stat-item {
  flex: 1;
  text-align: center;
}

.stat-num {
  display: block;
  font-size: 40rpx;
  font-weight: 700;
  color: #f5a623;
  margin-bottom: 6rpx;
}

.stat-label {
  font-size: 22rpx;
  color: #999;
}

/* 加载 */
.loading-wrap {
  text-align: center;
  padding: 80rpx 0;
}

.loading-text {
  font-size: 28rpx;
  color: #999;
}

/* 空状态 */
.empty-wrap {
  text-align: center;
  padding: 100rpx 40rpx;
}

.empty-icon {
  font-size: 80rpx;
  display: block;
  margin-bottom: 20rpx;
}

.empty-title {
  font-size: 30rpx;
  color: #333;
  font-weight: 600;
  display: block;
  margin-bottom: 12rpx;
}

.empty-desc {
  font-size: 26rpx;
  color: #999;
  display: block;
  margin-bottom: 40rpx;
  line-height: 1.6;
}

.empty-btn {
  display: inline-block;
  background: linear-gradient(135deg, #f5a623, #FF8C00);
  color: #fff;
  font-size: 28rpx;
  padding: 16rpx 48rpx;
  border-radius: 32rpx;
}

/* 追溯码列表 */
.trace-list {
  display: flex;
  flex-direction: column;
  gap: 16rpx;
}

.trace-card {
  background: #fff;
  border-radius: 16rpx;
  padding: 24rpx;
  position: relative;
  box-shadow: 0 2rpx 12rpx rgba(0, 0, 0, 0.04);
  transition: transform 0.15s ease;
}

.trace-card-active {
  transform: scale(0.98);
}

.trace-card.recalled {
  opacity: 0.6;
}

.card-top {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 14rpx;
}

.card-left {
  flex: 1;
  min-width: 0;
}

.product-name {
  font-size: 30rpx;
  font-weight: 600;
  color: #2c2c2c;
  display: block;
  margin-bottom: 6rpx;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.trace-code {
  font-size: 24rpx;
  color: #f5a623;
  font-family: 'Courier New', monospace;
  font-weight: 600;
}

.card-status {
  font-size: 22rpx;
  padding: 4rpx 16rpx;
  border-radius: 20rpx;
  font-weight: 500;
  flex-shrink: 0;
  margin-left: 12rpx;
}

.card-status.valid {
  background: #e8f5e9;
  color: #2ecc71;
}

.card-status.recalled {
  background: #fce4ec;
  color: #e74c3c;
}

.card-meta {
  display: flex;
  align-items: center;
  gap: 6rpx;
}

.meta-item {
  font-size: 22rpx;
  color: #999;
}

.meta-divider {
  font-size: 22rpx;
  color: #ddd;
}

.card-arrow {
  position: absolute;
  right: 24rpx;
  top: 50%;
  transform: translateY(-50%);
  font-size: 28rpx;
  color: #ddd;
}

/* 详情弹窗 */
.popup-mask {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  z-index: 999;
  display: flex;
  align-items: flex-end;
}

.popup-content {
  background: #fff;
  border-radius: 32rpx 32rpx 0 0;
  width: 100%;
  max-height: 85vh;
  overflow-y: auto;
  padding: 32rpx 28rpx;
  padding-bottom: calc(32rpx + env(safe-area-inset-bottom));
}

.popup-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 28rpx;
}

.popup-title {
  font-size: 32rpx;
  font-weight: 700;
  color: #2c2c2c;
}

.popup-close {
  font-size: 32rpx;
  color: #bbb;
  padding: 8rpx;
}

.detail-section {
  margin-bottom: 28rpx;
}

.detail-section.center {
  text-align: center;
}

.detail-label {
  font-size: 26rpx;
  color: #888;
  display: block;
  margin-bottom: 16rpx;
}

.detail-code-row {
  display: flex;
  align-items: center;
  gap: 12rpx;
  background: #fdf8f0;
  border-radius: 12rpx;
  padding: 16rpx 20rpx;
}

.detail-code {
  font-size: 28rpx;
  font-weight: 700;
  color: #2c2c2c;
  font-family: 'Courier New', monospace;
  flex: 1;
}

.detail-copy {
  font-size: 24rpx;
  color: #f5a623;
  padding: 6rpx 16rpx;
  border: 1rpx solid #f5a623;
  border-radius: 8rpx;
}

.detail-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12rpx;
}

.detail-cell {
  background: #f9f9f9;
  border-radius: 10rpx;
  padding: 16rpx;
}

.cell-label {
  display: block;
  font-size: 22rpx;
  color: #999;
  margin-bottom: 6rpx;
}

.cell-value {
  font-size: 28rpx;
  color: #333;
  font-weight: 500;
}

.cell-value.scan-warn {
  color: #e67e22;
}

.warn-tip {
  font-size: 20rpx;
  color: #e74c3c;
}

.detail-qr {
  width: 240rpx;
  height: 240rpx;
  border-radius: 12rpx;
  border: 2rpx solid #f0f0f0;
  margin: 0 auto;
  display: block;
}

.qr-url-hint {
  display: block;
  margin-top: 12rpx;
  font-size: 22rpx;
  color: #bbb;
  word-break: break-all;
}

/* 操作按钮 */
.detail-actions {
  display: flex;
  gap: 16rpx;
  margin-top: 8rpx;
}

.d-action-btn {
  flex: 1;
  height: 80rpx;
  line-height: 80rpx;
  border-radius: 12rpx;
  font-size: 26rpx;
  font-weight: 500;
}

.d-action-btn.outline {
  background: #fff;
  color: #f5a623;
  border: 2rpx solid #f5a623;
}

.d-action-btn.danger {
  background: #fff;
  color: #e74c3c;
  border: 2rpx solid #e74c3c;
}

.safe-bottom {
  height: calc(env(safe-area-inset-bottom) + 20rpx);
}
</style>
