<template>
  <view class="page">
    <!-- 基本信息 -->
    <view class="card" v-if="apiary">
      <view class="card-title">🏡 {{ apiary.name }}</view>
      <view class="info-row">
        <text class="label">地址</text>
        <text class="value">{{ apiary.address }}</text>
      </view>
      <view class="info-row">
        <text class="label">蜂种</text>
        <text class="value">{{ apiary.beeBreed || '--' }}</text>
      </view>
      <view class="info-row">
        <text class="label">蜂箱数</text>
        <text class="value">{{ apiary.boxCount }}</text>
      </view>
      <view class="info-row">
        <text class="label">蜂群数</text>
        <text class="value">{{ apiary.colonyCount }}</text>
      </view>
      <view class="info-row">
        <text class="label">蜜源</text>
        <text class="value">{{ apiary.honeySource || '--' }}</text>
      </view>
      <view class="edit-btn" @tap="goEdit">
        <uni-icons type="compose" size="16" color="#f5a623" />
        <text style="color:#f5a623; margin-left:8rpx">编辑</text>
      </view>
    </view>

    <!-- 蜂箱网格 -->
    <view class="card">
      <view class="card-title">🐝 蜂箱状态</view>
      <view class="hive-grid">
        <view
          v-for="hive in hives"
          :key="hive.id"
          class="hive-item"
          :class="`hive-health-${hive.health}`"
        >
          <text class="hive-no">{{ hive.hiveNo }}</text>
          <text v-if="hive.inWithdraw" class="withdraw-tag">停药</text>
        </view>
      </view>
      <view class="hive-legend">
        <view class="legend-item"><view class="legend-dot health-1" />良好</view>
        <view class="legend-item"><view class="legend-dot health-2" />待观察</view>
        <view class="legend-item"><view class="legend-dot health-3" />需关注</view>
        <view class="legend-item"><view class="legend-dot health-4" />异常</view>
      </view>
    </view>

    <!-- Tab 切换 -->
    <view class="card">
      <view class="tab-bar">
        <view
          v-for="tab in tabs"
          :key="tab.key"
          class="tab-item"
          :class="{ active: activeTab === tab.key }"
          @tap="activeTab = tab.key"
        >
          {{ tab.label }}
        </view>
      </view>

      <!-- 巡查记录 -->
      <view v-if="activeTab === 'inspection'">
        <view class="record-item" v-for="r in inspections" :key="r.id">
          <view class="record-date">{{ r.inspectDate }}</view>
          <view class="record-info">
            <text>整体健康：{{ healthMap[r.overallHealth] }}</text>
          </view>
        </view>
        <view v-if="!inspections.length" class="empty">暂无巡查记录</view>
      </view>

      <!-- 采蜜记录 -->
      <view v-if="activeTab === 'harvest'">
        <view class="record-item" v-for="r in harvests" :key="r.id">
          <view class="record-date">{{ r.harvestDate }}</view>
          <view class="record-info">
            <text>{{ r.honeyType }} · {{ r.quantity }}kg</text>
          </view>
        </view>
        <view v-if="!harvests.length" class="empty">暂无采蜜记录</view>
      </view>

      <!-- 用药记录 -->
      <view v-if="activeTab === 'medication'">
        <view class="record-item" v-for="r in medications" :key="r.id">
          <view class="record-date">{{ r.medDate }}</view>
          <view class="record-info">
            <text>{{ r.diseaseName }} — {{ r.drugName }}</text>
          </view>
        </view>
        <view v-if="!medications.length" class="empty">暂无用药记录</view>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import { request } from '@/utils/http'

const apiary = ref<any>(null)
const hives = ref<any[]>([])
const inspections = ref<any[]>([])
const harvests = ref<any[]>([])
const medications = ref<any[]>([])
const activeTab = ref('inspection')
const apiaryId = ref(0)

const tabs = [
  { key: 'inspection', label: '巡查记录' },
  { key: 'harvest', label: '采蜜记录' },
  { key: 'medication', label: '用药记录' },
]

const healthMap: Record<number, string> = { 1: '良好', 2: '正常', 3: '需关注', 4: '异常' }

onLoad(async (query: any) => {
  apiaryId.value = Number(query?.id)
  const [apiaryData, hiveData] = await Promise.allSettled([
    request<any>({ url: `/app/apiaries/${apiaryId.value}` }),
    request<any[]>({ url: `/app/apiaries/${apiaryId.value}/hives` }),
  ])
  if (apiaryData.status === 'fulfilled') apiary.value = apiaryData.value
  if (hiveData.status === 'fulfilled') hives.value = hiveData.value || []
  loadInspections()
})

watch(activeTab, (tab) => {
  if (tab === 'harvest') loadHarvests()
  else if (tab === 'medication') loadMedications()
  else loadInspections()
})

async function loadInspections() {
  const d = await request<any>({ url: `/app/inspections?apiaryId=${apiaryId.value}&pageSize=20` })
  inspections.value = (d as any)?.list || d || []
}

async function loadHarvests() {
  const d = await request<any>({ url: `/app/harvests?apiaryId=${apiaryId.value}&pageSize=20` })
  harvests.value = (d as any)?.list || d || []
}

async function loadMedications() {
  const d = await request<any>({ url: `/app/medications?apiaryId=${apiaryId.value}&pageSize=20` })
  medications.value = (d as any)?.list || d || []
}

function goEdit() {
  uni.navigateTo({ url: `/pages/apiary/edit?id=${apiaryId.value}` })
}
</script>

<style scoped>
.page { padding: 24rpx; }

.card { background: #fff; border-radius: 12rpx; padding: 24rpx; margin-bottom: 20rpx; }

.card-title { font-size: 30rpx; font-weight: 700; color: #333; margin-bottom: 20rpx; }

.info-row { display: flex; padding: 12rpx 0; border-bottom: 1rpx solid #f5f5f5; }

.label { color: #999; font-size: 28rpx; width: 120rpx; flex-shrink: 0; }

.value { color: #333; font-size: 28rpx; flex: 1; }

.edit-btn { display: flex; align-items: center; justify-content: flex-end; margin-top: 16rpx; }

.hive-grid { display: flex; flex-wrap: wrap; gap: 12rpx; margin-bottom: 16rpx; }

.hive-item {
  width: 80rpx;
  height: 80rpx;
  border-radius: 8rpx;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  position: relative;
}

.hive-health-1 { background: #e8f5e9; }
.hive-health-2 { background: #fff8e1; }
.hive-health-3 { background: #fff3e0; }
.hive-health-4 { background: #fce4ec; }

.hive-no { font-size: 20rpx; color: #333; font-weight: 600; }

.withdraw-tag {
  font-size: 16rpx;
  color: #e74c3c;
  background: rgba(231,76,60,0.1);
  padding: 0 4rpx;
  border-radius: 4rpx;
}

.hive-legend { display: flex; gap: 24rpx; }

.legend-item { display: flex; align-items: center; font-size: 22rpx; color: #666; gap: 6rpx; }

.legend-dot { width: 16rpx; height: 16rpx; border-radius: 50%; }

.health-1 { background: #2ecc71; }
.health-2 { background: #f5a623; }
.health-3 { background: #e67e22; }
.health-4 { background: #e74c3c; }

.tab-bar { display: flex; border-bottom: 2rpx solid #f0f0f0; margin-bottom: 20rpx; }

.tab-item {
  flex: 1;
  text-align: center;
  padding: 20rpx 0;
  font-size: 28rpx;
  color: #999;
}

.tab-item.active {
  color: #f5a623;
  border-bottom: 4rpx solid #f5a623;
  font-weight: 600;
}

.record-item { padding: 16rpx 0; border-bottom: 1rpx solid #f5f5f5; }

.record-date { font-size: 24rpx; color: #999; margin-bottom: 6rpx; }

.record-info { font-size: 28rpx; color: #333; }

.empty { text-align: center; color: #999; padding: 40rpx 0; font-size: 26rpx; }
</style>
