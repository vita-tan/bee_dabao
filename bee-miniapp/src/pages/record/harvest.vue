<template>
  <view class="page">
    <uni-forms ref="formRef" :modelValue="form" :rules="rules" label-width="160rpx">
      <!-- 蜂场选择 -->
      <uni-forms-item label="蜂场" required>
        <picker mode="selector" :range="apiaryOptions" range-key="name" @change="onApiaryChange">
          <view class="picker-view">
            <text v-if="selectedApiary">{{ selectedApiary.name }}</text>
            <text v-else style="color:#999">请选择蜂场</text>
            <uni-icons type="right" size="16" color="#999" />
          </view>
        </picker>
      </uni-forms-item>

      <!-- 日期 -->
      <uni-forms-item label="采蜜日期" required>
        <uni-datetime-picker type="date" v-model="form.harvestDate" />
      </uni-forms-item>

      <!-- 蜂箱选择（自动过滤停药期） -->
      <uni-forms-item label="参与蜂箱">
        <view v-if="withdrawHives.length" class="warning-tip">
          ⚠️ 以下蜂箱处于停药期，不可选择：{{ withdrawHives.map(h => h.hiveNo).join('、') }}
        </view>
        <view class="hive-selector">
          <view
            v-for="h in hives"
            :key="h.id"
            class="hive-chip"
            :class="{ selected: form.hiveIds.includes(h.id), disabled: h.inWithdraw }"
            @tap="!h.inWithdraw && toggleHive(h.id)"
          >
            {{ h.hiveNo }}
          </view>
        </view>
      </uni-forms-item>

      <!-- 蜜种 -->
      <uni-forms-item label="蜜种" required>
        <uni-easyinput v-model="form.honeyType" placeholder="如：槐花蜜/荆条蜜" />
      </uni-forms-item>

      <!-- 产量 -->
      <uni-forms-item label="产量(kg)" required>
        <uni-easyinput v-model="form.quantity" type="digit" placeholder="请输入" />
      </uni-forms-item>

      <!-- 波美度 -->
      <uni-forms-item label="波美度">
        <uni-easyinput v-model="form.baumeDegree" type="digit" placeholder="可选，≥41度为成熟蜜" />
        <text v-if="qualityGradeLabel" style="color:#52c41a; font-size:24rpx">{{ qualityGradeLabel }}</text>
      </uni-forms-item>

      <!-- 采蜜方式 -->
      <uni-forms-item label="采蜜方式">
        <view class="radio-group">
          <view class="radio-item" @tap="form.method = 1">
            <view class="radio-dot" :class="{ checked: form.method === 1 }" />
            <text>摇蜜机</text>
          </view>
          <view class="radio-item" @tap="form.method = 2">
            <view class="radio-dot" :class="{ checked: form.method === 2 }" />
            <text>手工</text>
          </view>
        </view>
      </uni-forms-item>

      <!-- 备注 -->
      <uni-forms-item label="备注">
        <uni-easyinput type="textarea" v-model="form.notes" placeholder="可选备注" />
      </uni-forms-item>
    </uni-forms>

    <button class="submit-btn" @tap="submit" :loading="submitting">提交采蜜记录</button>
  </view>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import { request, addToOfflineQueue } from '@/utils/http'

const formRef = ref()
const submitting = ref(false)
const apiaryOptions = ref<any[]>([])
const selectedApiary = ref<any>(null)
const hives = ref<any[]>([])

const form = reactive({
  apiaryId: 0,
  harvestDate: new Date().toISOString().slice(0, 10),
  hiveIds: [] as number[],
  honeyType: '',
  quantity: '',
  baumeDegree: '',
  method: 1,
  notes: '',
  photos: [] as string[],
})

const rules = {
  honeyType: { rules: [{ required: true, errorMessage: '请输入蜜种' }] },
  quantity: { rules: [{ required: true, errorMessage: '请输入产量' }] },
}

const withdrawHives = computed(() => hives.value.filter((h: any) => h.inWithdraw))

const qualityGradeLabel = computed(() => {
  const bd = Number(form.baumeDegree)
  if (!bd) return ''
  return bd >= 41 ? '✅ 成熟蜜（波美度达标）' : '⚠️ 普通蜜（波美度不足41度）'
})

onMounted(async () => {
  const data = await request<any[]>({ url: '/app/apiaries' })
  apiaryOptions.value = data || []
})

async function onApiaryChange(e: any) {
  selectedApiary.value = apiaryOptions.value[e.detail.value]
  form.apiaryId = selectedApiary.value.id
  const hiveData = await request<any[]>({ url: `/app/apiaries/${form.apiaryId}/hives` })
  hives.value = (hiveData || []).filter((h: any) => h.status === 1)
}

function toggleHive(id: number) {
  const idx = form.hiveIds.indexOf(id)
  if (idx >= 0) form.hiveIds.splice(idx, 1)
  else form.hiveIds.push(id)
}

async function submit() {
  if (!form.apiaryId) {
    uni.showToast({ title: '请选择蜂场', icon: 'none' })
    return
  }
  await formRef.value?.validate()
  submitting.value = true
  const payload = {
    ...form,
    quantity: Number(form.quantity),
    baumeDegree: form.baumeDegree ? Number(form.baumeDegree) : undefined,
  }
  try {
    await request({ url: '/app/harvests', method: 'POST', data: payload })
    uni.showToast({ title: '提交成功', icon: 'success' })
    setTimeout(() => {
      uni.showModal({
        title: '是否生成追溯码？',
        content: '采蜜记录已保存，是否为此批次蜂蜜生成消费者追溯码？',
        confirmText: '去生成',
        cancelText: '稍后',
        success: (res: any) => {
          if (res.confirm) {
            uni.navigateTo({ url: '/pages/trace/generate' })
          } else {
            uni.navigateBack()
          }
        },
      })
    }, 1200)
  } catch {
    addToOfflineQueue({ url: '/app/harvests', method: 'POST', data: payload })
    uni.showToast({ title: '已保存离线', icon: 'none' })
  } finally {
    submitting.value = false
  }
}
</script>

<style scoped>
.page { padding: 24rpx 24rpx 60rpx; background: #fff; min-height: 100vh; }

.picker-view { display: flex; justify-content: space-between; align-items: center; padding: 8rpx 0; }

.warning-tip {
  background: #fff8e1;
  color: #f5a623;
  padding: 12rpx 16rpx;
  border-radius: 8rpx;
  font-size: 24rpx;
  margin-bottom: 12rpx;
}

.hive-selector { display: flex; flex-wrap: wrap; gap: 12rpx; }

.hive-chip {
  padding: 8rpx 20rpx;
  border-radius: 20rpx;
  background: #f5f5f5;
  font-size: 24rpx;
  color: #666;
  border: 2rpx solid transparent;
}

.hive-chip.selected { background: #fff8ec; color: #f5a623; border-color: #f5a623; }

.hive-chip.disabled { background: #f5f5f5; color: #ccc; text-decoration: line-through; }

.radio-group { display: flex; gap: 32rpx; }

.radio-item { display: flex; align-items: center; gap: 10rpx; font-size: 28rpx; }

.radio-dot { width: 32rpx; height: 32rpx; border-radius: 50%; border: 2rpx solid #ddd; }

.radio-dot.checked { background: #f5a623; border-color: #f5a623; }

.submit-btn {
  margin-top: 48rpx;
  background: #f5a623;
  color: #fff;
  border-radius: 12rpx;
  font-size: 32rpx;
  height: 88rpx;
  line-height: 88rpx;
}
</style>
