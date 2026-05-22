<template>
  <view class="page">
    <!-- 用户信息头部 -->
    <view class="profile-header">
      <image v-if="user?.avatar" :src="user.avatar" class="avatar" mode="aspectFill" />
      <view v-else class="avatar avatar-fallback">
        <text class="avatar-initials">{{ userInitials }}</text>
      </view>
      <view class="profile-info">
        <text class="profile-name">{{ user?.name || '未认证蜂农' }}</text>
        <view class="status-tag" :class="`status-${user?.status}`">
          {{ statusLabel[user?.status ?? 0] }}
        </view>
      </view>
      <view class="credit-ring">
        <text class="credit-val">{{ user?.creditScore ?? '--' }}</text>
        <text class="credit-label">信用分</text>
      </view>
    </view>

    <!-- 功能列表 -->
    <view class="menu-list">
      <view class="menu-item" @tap="switchTab('/pages/apiary/list')">
        <text class="menu-icon">🏡</text>
        <text class="menu-label">我的蜂场</text>
        <uni-icons type="right" size="16" color="#ccc" />
      </view>
      <view class="menu-item" @tap="navSubsidy">
        <text class="menu-icon">🎁</text>
        <text class="menu-label">补贴申请</text>
        <uni-icons type="right" size="16" color="#ccc" />
      </view>
      <view class="menu-item" @tap="navTo('/pages/mine/notifications')">
        <text class="menu-icon">🔔</text>
        <text class="menu-label">消息通知</text>
        <view class="badge" v-if="unreadCount > 0">{{ unreadCount }}</view>
        <uni-icons type="right" size="16" color="#ccc" />
      </view>
      <view class="menu-item" @tap="navFontSize">
        <text class="menu-icon">🔤</text>
        <text class="menu-label">字体大小</text>
        <uni-icons type="right" size="16" color="#ccc" />
      </view>
      <view class="menu-item" @tap="navAbout">
        <text class="menu-icon">ℹ️</text>
        <text class="menu-label">关于</text>
        <uni-icons type="right" size="16" color="#ccc" />
      </view>
    </view>

    <!-- 退出登录 -->
    <button class="logout-btn" @tap="logout">退出登录</button>
  </view>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { onShow } from '@dcloudio/uni-app'
import { useUserStore } from '@/stores/user'
import { request } from '@/utils/http'

const userStore = useUserStore()
const user = ref(userStore.user)
const unreadCount = ref(0)

const statusLabel: Record<number, string> = {
  0: '待审核',
  1: '正式蜂农',
  2: '已冻结',
  3: '已拒绝',
}

const userInitials = computed(() => {
  const name = user.value?.name || '蜂农'
  return name.slice(0, 2)
})

async function loadUnread() {
  try {
    const data = await request<{ count: number }>({ url: '/app/notifications/unread-count' })
    unreadCount.value = (data as any)?.count || 0
  } catch { /* ignore */ }
}

function navTo(url: string) {
  uni.navigateTo({ url })
}

function switchTab(url: string) {
  uni.switchTab({ url })
}

function navSubsidy() {
  uni.showToast({ title: '功能开发中', icon: 'none' })
}

function navFontSize() {
  uni.showActionSheet({
    itemList: ['标准', '大字体', '超大字体'],
    success: (res) => {
      const sizes = ['normal', 'large', 'xlarge']
      uni.setStorageSync('font_size', sizes[res.tapIndex])
      uni.showToast({ title: '设置成功', icon: 'success' })
    },
  })
}

function navAbout() {
  uni.showModal({
    title: '蜂农助手',
    content: '版本 1.0.0\n南浦溪蜂产业数字化平台\n技术支持：蜂产业大脑团队',
    showCancel: false,
  })
}

function logout() {
  uni.showModal({
    title: '提示',
    content: '确定退出登录？',
    success: (res) => {
      if (res.confirm) {
        userStore.logout()
        uni.reLaunch({ url: '/pages/index/index' })
      }
    },
  })
}

onShow(() => {
  user.value = userStore.user
  loadUnread()
})
</script>

<style scoped>
.page { padding: 0 0 60rpx; background: #f5f7fa; min-height: 100vh; }

.profile-header {
  background: linear-gradient(135deg, #f5a623, #f7c96a);
  padding: 60rpx 32rpx 40rpx;
  display: flex;
  align-items: center;
  gap: 24rpx;
}

.avatar {
  width: 120rpx;
  height: 120rpx;
  border-radius: 50%;
  border: 4rpx solid rgba(255,255,255,0.5);
}

.avatar-fallback {
  background: rgba(255,255,255,0.25);
  display: flex;
  align-items: center;
  justify-content: center;
}

.avatar-initials {
  font-size: 40rpx;
  font-weight: 700;
  color: #fff;
}

.profile-info { flex: 1; }

.profile-name { font-size: 36rpx; font-weight: 700; color: #fff; display: block; margin-bottom: 8rpx; }

.status-tag {
  display: inline-block;
  font-size: 22rpx;
  padding: 4rpx 16rpx;
  border-radius: 20rpx;
}

.status-0 { background: rgba(255,255,255,0.3); color: #fff; }
.status-1 { background: #e8f5e9; color: #2ecc71; }
.status-2 { background: #fce4ec; color: #e74c3c; }

.credit-ring {
  display: flex;
  flex-direction: column;
  align-items: center;
  background: rgba(255,255,255,0.25);
  border-radius: 12rpx;
  padding: 12rpx 24rpx;
}

.credit-val { font-size: 40rpx; font-weight: 900; color: #fff; }

.credit-label { font-size: 20rpx; color: rgba(255,255,255,0.8); }

.menu-list { background: #fff; margin: 24rpx 24rpx 0; border-radius: 12rpx; }

.menu-item {
  display: flex;
  align-items: center;
  padding: 28rpx 24rpx;
  border-bottom: 1rpx solid #f5f5f5;
  position: relative;
}

.menu-icon { font-size: 36rpx; margin-right: 20rpx; }

.menu-label { flex: 1; font-size: 30rpx; color: #333; }

.badge {
  background: #e74c3c;
  color: #fff;
  font-size: 20rpx;
  border-radius: 20rpx;
  padding: 2rpx 10rpx;
  margin-right: 8rpx;
}

.logout-btn {
  margin: 40rpx 24rpx 0;
  background: #fff;
  color: #e74c3c;
  border-radius: 12rpx;
  font-size: 30rpx;
  border: 2rpx solid #f5f5f5;
}
</style>
