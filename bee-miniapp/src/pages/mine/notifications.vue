<template>
  <view class="page">
    <!-- 全部已读 -->
    <view class="action-bar">
      <text class="unread-hint" v-if="unreadCount > 0">{{ unreadCount }} 条未读</text>
      <text class="read-all-btn" @tap="markAllRead">全部已读</text>
    </view>

    <!-- 通知列表 -->
    <view class="notice-list">
      <view
        v-for="n in list"
        :key="n.id"
        class="notice-item"
        :class="{ unread: !n.isRead }"
        @tap="openNotice(n)"
      >
        <view class="notice-header">
          <view class="type-dot" :class="`type-${n.type}`" />
          <text class="notice-title">{{ n.title }}</text>
          <view v-if="!n.isRead" class="unread-dot" />
        </view>
        <text class="notice-time">{{ n.publishTime }}</text>
      </view>
      <view v-if="!list.length" class="empty">暂无通知</view>
    </view>

    <!-- 通知详情弹窗 -->
    <uni-popup ref="popupRef" type="bottom">
      <view class="popup-content" v-if="currentNotice">
        <view class="popup-title">{{ currentNotice.title }}</view>
        <text class="popup-time">{{ currentNotice.publishTime }}</text>
        <view class="popup-body">{{ currentNotice.content }}</view>
        <button class="popup-close" @tap="popupRef?.close()">关闭</button>
      </view>
    </uni-popup>
  </view>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { request } from '@/utils/http'

const list = ref<any[]>([])
const unreadCount = ref(0)
const currentNotice = ref<any>(null)
const popupRef = ref<any>(null)

async function loadList() {
  try {
    const data = await request<any>({ url: '/app/notifications?pageSize=50' })
    list.value = (data as any)?.list || data || []
    unreadCount.value = list.value.filter((n: any) => !n.isRead).length
  } catch { /* ignore */ }
}

async function openNotice(n: any) {
  currentNotice.value = n
  popupRef.value?.open()
  if (!n.isRead) {
    try {
      await request({ url: `/app/notifications/${n.id}/read`, method: 'PUT' })
      n.isRead = true
      unreadCount.value = Math.max(0, unreadCount.value - 1)
    } catch { /* ignore */ }
  }
}

async function markAllRead() {
  try {
    await request({ url: '/app/notifications/read-all', method: 'PUT' })
    list.value.forEach((n: any) => (n.isRead = true))
    unreadCount.value = 0
    uni.showToast({ title: '已全部标记已读', icon: 'success' })
  } catch { /* ignore */ }
}

onMounted(loadList)
</script>

<style scoped>
.page { padding: 0; background: #f5f7fa; min-height: 100vh; }

.action-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20rpx 32rpx;
  background: #fff;
}

.unread-hint { font-size: 26rpx; color: #999; }

.read-all-btn { font-size: 26rpx; color: #f5a623; }

.notice-list { padding: 0 24rpx; padding-top: 12rpx; }

.notice-item {
  background: #fff;
  border-radius: 12rpx;
  padding: 24rpx;
  margin-bottom: 12rpx;
}

.notice-item.unread { border-left: 6rpx solid #f5a623; }

.notice-header { display: flex; align-items: center; gap: 12rpx; margin-bottom: 8rpx; }

.type-dot {
  width: 16rpx;
  height: 16rpx;
  border-radius: 50%;
  flex-shrink: 0;
}

.type-1 { background: #1677ff; }
.type-2 { background: #52c41a; }
.type-3 { background: #e74c3c; }
.type-4 { background: #f5a623; }
.type-5 { background: #999; }

.notice-title { flex: 1; font-size: 28rpx; color: #333; }

.notice-item.unread .notice-title { font-weight: 700; }

.unread-dot {
  width: 16rpx;
  height: 16rpx;
  border-radius: 50%;
  background: #f5a623;
  flex-shrink: 0;
}

.notice-time { font-size: 22rpx; color: #999; }

.empty { text-align: center; color: #999; padding: 80rpx 0; font-size: 26rpx; }

.popup-content {
  background: #fff;
  border-radius: 24rpx 24rpx 0 0;
  padding: 40rpx 32rpx;
  min-height: 400rpx;
}

.popup-title { font-size: 34rpx; font-weight: 700; color: #333; margin-bottom: 12rpx; }

.popup-time { font-size: 22rpx; color: #999; display: block; margin-bottom: 24rpx; }

.popup-body { font-size: 28rpx; color: #555; line-height: 1.8; }

.popup-close {
  margin-top: 32rpx;
  background: #f5a623;
  color: #fff;
  border-radius: 12rpx;
  font-size: 30rpx;
}
</style>
