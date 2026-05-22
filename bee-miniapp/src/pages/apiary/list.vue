<template>
  <view class="page">
    <view v-if="loading" class="loading">
      <uni-load-more status="loading" />
    </view>
    <view v-else>
      <view class="apiary-card" v-for="a in list" :key="a.id" @tap="goDetail(a.id)">
        <view class="card-header">
          <text class="card-name">{{ a.name }}</text>
          <view class="health-badge" :class="`health-${a.lastHealthStatus || 2}`">
            {{ healthMap[a.lastHealthStatus || 2] }}
          </view>
        </view>
        <text class="card-addr">📍 {{ a.address }}</text>
        <view class="card-stats">
          <view class="stat-item">
            <text class="stat-val">{{ a.boxCount }}</text>
            <text class="stat-key">蜂箱</text>
          </view>
          <view class="stat-item">
            <text class="stat-val">{{ a.colonyCount }}</text>
            <text class="stat-key">蜂群</text>
          </view>
          <view class="stat-item">
            <text class="stat-val" :style="{ color: a.lastInspectDays > 7 ? '#e74c3c' : '#333' }">
              {{ a.lastInspectDays !== null ? `${a.lastInspectDays}天` : '--' }}
            </text>
            <text class="stat-key">上次巡查</text>
          </view>
        </view>
      </view>

      <view v-if="!list.length" class="empty">
        <text>暂无蜂场，点击右上角添加</text>
      </view>
    </view>

    <!-- 新建按钮 -->
    <view class="add-btn" @tap="goAdd">
      <text style="color:#fff; font-size:40rpx">+</text>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { onShow } from '@dcloudio/uni-app'
import { request } from '@/utils/http'

const list = ref<any[]>([])
const loading = ref(true)

const healthMap: Record<number, string> = { 1: '良好', 2: '正常', 3: '需关注', 4: '异常' }

async function loadList() {
  loading.value = true
  try {
    const data = await request<any[]>({ url: '/app/apiaries' })
    list.value = data || []
  } finally {
    loading.value = false
  }
}

function goDetail(id: number) {
  uni.navigateTo({ url: `/pages/apiary/detail?id=${id}` })
}

function goAdd() {
  uni.navigateTo({ url: '/pages/apiary/edit' })
}

onShow(loadList)
</script>

<style scoped>
.page { padding: 24rpx; }

.loading { display: flex; justify-content: center; padding: 80rpx 0; }

.apiary-card {
  background: #fff;
  border-radius: 12rpx;
  padding: 28rpx;
  margin-bottom: 20rpx;
  box-shadow: 0 2rpx 8rpx rgba(0,0,0,0.06);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12rpx;
}

.card-name { font-size: 32rpx; font-weight: 700; color: #333; }

.health-badge {
  font-size: 22rpx;
  padding: 4rpx 16rpx;
  border-radius: 20rpx;
}

.health-1 { background: #e8f5e9; color: #2ecc71; }
.health-2 { background: #e3f2fd; color: #1677ff; }
.health-3 { background: #fff8e1; color: #f5a623; }
.health-4 { background: #fce4ec; color: #e74c3c; }

.card-addr { font-size: 24rpx; color: #888; display: block; margin-bottom: 20rpx; }

.card-stats { display: flex; gap: 32rpx; }

.stat-item { display: flex; flex-direction: column; align-items: center; }

.stat-val { font-size: 32rpx; font-weight: 700; color: #333; }

.stat-key { font-size: 22rpx; color: #999; }

.empty { text-align: center; padding: 100rpx 0; color: #999; font-size: 28rpx; }

.add-btn {
  position: fixed;
  right: 48rpx;
  bottom: 120rpx;
  width: 96rpx;
  height: 96rpx;
  background: #f5a623;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4rpx 16rpx rgba(245,166,35,0.5);
}
</style>
