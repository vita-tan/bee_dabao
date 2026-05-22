<template>
  <view class="page">
    <uni-forms ref="formRef" :modelValue="form" :rules="rules" label-width="180rpx">
      <!-- 蜂场 -->
      <uni-forms-item label="蜂场" required>
        <picker mode="selector" :range="apiaries" range-key="name" @change="onApiaryChange">
          <view class="picker-view">
            <text v-if="selectedApiary">{{ selectedApiary.name }}</text>
            <text v-else style="color:#999">请选择蜂场</text>
            <uni-icons type="right" size="16" color="#999" />
          </view>
        </picker>
      </uni-forms-item>

      <!-- 蜂箱多选 -->
      <uni-forms-item label="涉及蜂箱" required>
        <view class="hive-selector">
          <view v-for="h in hives" :key="h.id" class="hive-chip" :class="{ selected: form.hiveIds.includes(h.id) }" @tap="toggleHive(h.id)">
            {{ h.hiveNo }}
          </view>
          <view class="select-all" @tap="selectAll">全选</view>
        </view>
      </uni-forms-item>

      <!-- 日期 -->
      <uni-forms-item label="用药日期" required>
        <uni-datetime-picker type="date" v-model="form.medDate" @change="calcWithdrawEnd" />
      </uni-forms-item>

      <!-- 病害 -->
      <uni-forms-item label="病害类型" required>
        <uni-easyinput v-model="form.diseaseName" placeholder="如：蜂螨病" />
      </uni-forms-item>

      <!-- 药品 -->
      <uni-forms-item label="药品名称" required>
        <uni-easyinput v-model="form.drugName" placeholder="请输入药品名称" />
      </uni-forms-item>

      <!-- 剂量 -->
      <uni-forms-item label="剂量/用法" required>
        <uni-easyinput v-model="form.dosage" placeholder="如：稀释200倍，每箱10ml" />
      </uni-forms-item>

      <!-- 停药天数 -->
      <uni-forms-item label="停药天数" required>
        <view>
          <uni-easyinput type="number" v-model="form.withdrawDays" placeholder="1-365" @input="calcWithdrawEnd" />
          <view v-if="withdrawEndDate" class="withdraw-hint">
            ⏰ 停药截止：<text style="color:#e74c3c; font-weight:700">{{ withdrawEndDate }}</text>
          </view>
        </view>
      </uni-forms-item>

      <!-- 施药方式 -->
      <uni-forms-item label="施药方式">
        <view class="radio-group">
          <view v-for="opt in methodOptions" :key="opt.value" class="radio-item" @tap="form.method = opt.value">
            <view class="radio-dot" :class="{ checked: form.method === opt.value }" />
            <text>{{ opt.label }}</text>
          </view>
        </view>
      </uni-forms-item>

      <!-- 备注 -->
      <uni-forms-item label="备注">
        <uni-easyinput type="textarea" v-model="form.notes" placeholder="可选" />
      </uni-forms-item>
    </uni-forms>

    <button class="submit-btn" @tap="submit" :loading="submitting">提交用药记录</button>
  </view>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { request, addToOfflineQueue } from '@/utils/http'

const formRef = ref()
const submitting = ref(false)
const apiaries = ref<any[]>([])
const selectedApiary = ref<any>(null)
const hives = ref<any[]>([])
const withdrawEndDate = ref('')

const form = reactive({
  apiaryId: 0,
  hiveIds: [] as number[],
  medDate: new Date().toISOString().slice(0, 10),
  diseaseName: '',
  drugName: '',
  dosage: '',
  method: 1,
  withdrawDays: '',
  operator: '',
  notes: '',
  photos: [] as string[],
})

const methodOptions = [
  { label: '喷雾', value: 1 },
  { label: '涂抹', value: 2 },
  { label: '饲喂', value: 3 },
  { label: '熏蒸', value: 4 },
]

const rules = {
  diseaseName: { rules: [{ required: true, errorMessage: '请输入病害类型' }] },
  drugName: { rules: [{ required: true, errorMessage: '请输入药品名称' }] },
  dosage: { rules: [{ required: true, errorMessage: '请输入剂量用法' }] },
  withdrawDays: { rules: [{ required: true, errorMessage: '请输入停药天数' }] },
}

function calcWithdrawEnd() {
  const days = Number(form.withdrawDays)
  if (!days || !form.medDate) { withdrawEndDate.value = ''; return }
  const endDate = new Date(form.medDate)
  endDate.setDate(endDate.getDate() + days)
  withdrawEndDate.value = endDate.toISOString().slice(0, 10)
}

onMounted(async () => {
  const data = await request<any[]>({ url: '/app/apiaries' })
  apiaries.value = data || []
})

async function onApiaryChange(e: any) {
  selectedApiary.value = apiaries.value[e.detail.value]
  form.apiaryId = selectedApiary.value.id
  const hiveData = await request<any[]>({ url: `/app/apiaries/${form.apiaryId}/hives` })
  hives.value = (hiveData || []).filter((h: any) => h.status === 1)
}

function toggleHive(id: number) {
  const idx = form.hiveIds.indexOf(id)
  if (idx >= 0) form.hiveIds.splice(idx, 1)
  else form.hiveIds.push(id)
}

function selectAll() {
  if (form.hiveIds.length === hives.value.length) form.hiveIds = []
  else form.hiveIds = hives.value.map((h: any) => h.id)
}

async function submit() {
  if (!form.apiaryId || !form.hiveIds.length) {
    uni.showToast({ title: '请选择蜂场和蜂箱', icon: 'none' })
    return
  }
  await formRef.value?.validate()
  submitting.value = true
  const payload = { ...form, withdrawDays: Number(form.withdrawDays) }
  try {
    await request({ url: '/app/medications', method: 'POST', data: payload })
    uni.showToast({ title: '提交成功', icon: 'success' })
    setTimeout(() => uni.navigateBack(), 1200)
  } catch {
    addToOfflineQueue({ url: '/app/medications', method: 'POST', data: payload })
    uni.showToast({ title: '已保存离线', icon: 'none' })
  } finally {
    submitting.value = false
  }
}
</script>

<style scoped>
.page { padding: 24rpx 24rpx 60rpx; background: #fff; min-height: 100vh; }

.picker-view { display: flex; justify-content: space-between; align-items: center; padding: 8rpx 0; }

.hive-selector { display: flex; flex-wrap: wrap; gap: 12rpx; align-items: center; }

.hive-chip {
  padding: 8rpx 20rpx;
  border-radius: 20rpx;
  background: #f5f5f5;
  font-size: 24rpx;
  color: #666;
  border: 2rpx solid transparent;
}

.hive-chip.selected { background: #fff8ec; color: #f5a623; border-color: #f5a623; }

.select-all { font-size: 24rpx; color: #f5a623; padding: 8rpx; }

.withdraw-hint {
  background: #fce4ec;
  padding: 12rpx 16rpx;
  border-radius: 8rpx;
  margin-top: 8rpx;
  font-size: 24rpx;
  color: #555;
}

.radio-group { display: flex; gap: 20rpx; flex-wrap: wrap; }

.radio-item { display: flex; align-items: center; gap: 8rpx; font-size: 28rpx; }

.radio-dot { width: 30rpx; height: 30rpx; border-radius: 50%; border: 2rpx solid #ddd; }

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
