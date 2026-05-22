<template>
  <view class="page">
    <!-- 收支总览 -->
    <view class="summary-card">
      <view class="summary-item">
        <text class="summary-label">本月收入</text>
        <text class="summary-val income">¥{{ summary.monthIncome?.toLocaleString() || 0 }}</text>
      </view>
      <view class="summary-divider" />
      <view class="summary-item">
        <text class="summary-label">本月支出</text>
        <text class="summary-val expense">¥{{ summary.monthExpense?.toLocaleString() || 0 }}</text>
      </view>
      <view class="summary-divider" />
      <view class="summary-item">
        <text class="summary-label">本月利润</text>
        <text class="summary-val" :style="{ color: summary.monthProfit >= 0 ? '#2ecc71' : '#e74c3c' }">
          ¥{{ summary.monthProfit?.toLocaleString() || 0 }}
        </text>
      </view>
    </view>

    <!-- 类型筛选 -->
    <view class="filter-row">
      <view class="filter-btn" :class="{ active: filter === 0 }" @tap="filter = 0">全部</view>
      <view class="filter-btn" :class="{ active: filter === 1 }" @tap="filter = 1">收入</view>
      <view class="filter-btn" :class="{ active: filter === 2 }" @tap="filter = 2">支出</view>
    </view>

    <!-- 记录列表 -->
    <view class="record-list">
      <view class="record-item" v-for="r in filteredList" :key="r.id">
        <view class="record-left">
          <view class="record-icon" :class="r.type === 1 ? 'icon-income' : 'icon-expense'">
            {{ r.type === 1 ? '↑' : '↓' }}
          </view>
          <view>
            <text class="record-category">{{ r.category }}</text>
            <text class="record-date">{{ r.recordDate }}</text>
          </view>
        </view>
        <text class="record-amount" :class="r.type === 1 ? 'income' : 'expense'">
          {{ r.type === 1 ? '+' : '-' }}¥{{ r.amount?.toLocaleString() }}
        </text>
      </view>
      <view v-if="!filteredList.length" class="empty">暂无收支记录</view>
    </view>

    <!-- 新建按钮 -->
    <view class="add-btn" @tap="addRecord">
      <text style="color:#fff; font-size:40rpx">+</text>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import { onShow } from '@dcloudio/uni-app'
import { request } from '@/utils/http'

const list = ref<any[]>([])
const summary = reactive({ monthIncome: 0, monthExpense: 0, monthProfit: 0 })
const filter = ref(0)

const filteredList = computed(() =>
  filter.value === 0 ? list.value : list.value.filter((r) => r.type === filter.value),
)

async function loadData() {
  const [listData, summaryData] = await Promise.allSettled([
    request<any>({ url: '/app/accounts?pageSize=100' }),
    request<any>({ url: '/app/accounts/summary' }),
  ])
  if (listData.status === 'fulfilled') list.value = (listData.value as any)?.list || listData.value || []
  if (summaryData.status === 'fulfilled') {
    const d = summaryData.value as any
    Object.assign(summary, {
      monthIncome: d?.month_income || 0,
      monthExpense: d?.month_expense || 0,
      monthProfit: d?.month_profit || 0,
    })
  }
}

function addRecord() {
  // 简单弹窗，实际可跳转专属页面
  uni.showToast({ title: '功能开发中', icon: 'none' })
}

onShow(loadData)
</script>

<style scoped>
.page { padding: 24rpx; padding-bottom: 100rpx; }

.summary-card {
  background: linear-gradient(135deg, #f5a623, #f7c96a);
  border-radius: 16rpx;
  padding: 32rpx;
  display: flex;
  justify-content: space-around;
  margin-bottom: 24rpx;
}

.summary-item { display: flex; flex-direction: column; align-items: center; gap: 8rpx; }

.summary-label { font-size: 24rpx; color: rgba(255,255,255,0.9); }

.summary-val { font-size: 32rpx; font-weight: 700; color: #fff; }

.summary-val.income { color: #fff; }

.summary-val.expense { color: #ffe0b2; }

.summary-divider { width: 1rpx; background: rgba(255,255,255,0.3); }

.filter-row { display: flex; gap: 16rpx; margin-bottom: 20rpx; }

.filter-btn {
  padding: 12rpx 32rpx;
  border-radius: 40rpx;
  background: #f5f5f5;
  font-size: 28rpx;
  color: #666;
}

.filter-btn.active { background: #f5a623; color: #fff; }

.record-list { background: #fff; border-radius: 12rpx; }

.record-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 24rpx;
  border-bottom: 1rpx solid #f5f5f5;
}

.record-left { display: flex; align-items: center; gap: 20rpx; }

.record-icon {
  width: 64rpx;
  height: 64rpx;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 28rpx;
  font-weight: 700;
}

.icon-income { background: #e8f5e9; color: #2ecc71; }

.icon-expense { background: #fce4ec; color: #e74c3c; }

.record-category { font-size: 28rpx; color: #333; display: block; }

.record-date { font-size: 22rpx; color: #999; display: block; margin-top: 4rpx; }

.record-amount { font-size: 32rpx; font-weight: 700; }

.record-amount.income { color: #2ecc71; }

.record-amount.expense { color: #e74c3c; }

.empty { text-align: center; color: #999; padding: 60rpx 0; font-size: 26rpx; }

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
