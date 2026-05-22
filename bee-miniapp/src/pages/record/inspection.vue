<template>
  <view class="page">
    <uni-forms ref="formRef" :modelValue="form" :rules="rules" label-width="160rpx">
      <!-- 选择蜂场 -->
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
      <uni-forms-item label="巡查日期" name="inspectDate" required>
        <uni-datetime-picker type="date" v-model="form.inspectDate" />
      </uni-forms-item>

      <!-- 巡查类型 -->
      <uni-forms-item label="巡查类型">
        <picker mode="selector" :range="typeOptions" range-key="label" @change="(e: any) => form.inspectType = typeOptions[e.detail.value].value">
          <view class="picker-view">
            <text>{{ typeOptions.find(t => t.value === form.inspectType)?.label || '日常巡查' }}</text>
            <uni-icons type="right" size="16" color="#999" />
          </view>
        </picker>
      </uni-forms-item>

      <!-- 选择蜂箱 -->
      <uni-forms-item label="巡查蜂箱" required>
        <view class="hive-selector">
          <view
            v-for="h in hives"
            :key="h.id"
            class="hive-chip"
            :class="{ selected: form.hiveIds.includes(h.id) }"
            @tap="toggleHive(h.id)"
          >
            {{ h.hiveNo }}
          </view>
          <view class="select-all" @tap="selectAllHives">全选</view>
        </view>
      </uni-forms-item>

      <!-- 整体健康状态 -->
      <uni-forms-item label="整体健康" required>
        <view class="health-options">
          <view
            v-for="opt in healthOptions"
            :key="opt.value"
            class="health-btn"
            :class="{ active: form.overallHealth === opt.value, [`color-${opt.value}`]: true }"
            @tap="form.overallHealth = opt.value"
          >
            {{ opt.label }}
          </view>
        </view>
      </uni-forms-item>

      <!-- 蜂王状况 -->
      <uni-forms-item label="蜂王状况">
        <view class="radio-group">
          <view v-for="opt in queenOptions" :key="opt.value" class="radio-item" @tap="form.queenStatus = opt.value">
            <view class="radio-dot" :class="{ checked: form.queenStatus === opt.value }" />
            <text>{{ opt.label }}</text>
          </view>
        </view>
      </uni-forms-item>

      <!-- 备注 -->
      <uni-forms-item :label="`备注${form.overallHealth === 4 ? '(必填)' : ''}`" :name="form.overallHealth === 4 ? 'notes' : undefined">
        <view>
          <uni-easyinput type="textarea" v-model="form.notes" placeholder="输入备注..." :maxlength="500" />
          <!-- 语音输入 -->
          <view class="voice-btn" @touchstart="startRecord" @touchend="stopRecord">
            <uni-icons type="mic" :size="24" :color="recording ? '#e74c3c' : '#f5a623'" />
            <text style="font-size: 24rpx; margin-left: 8rpx" :style="{ color: recording ? '#e74c3c' : '#f5a623' }">
              {{ recording ? '松开停止' : '按住说话' }}
            </text>
          </view>
        </view>
      </uni-forms-item>

      <!-- 拍照上传 -->
      <uni-forms-item label="现场照片">
        <view class="photo-list">
          <image v-for="(p, i) in form.photos" :key="i" :src="p" class="photo-thumb" mode="aspectFill" />
          <view class="photo-add" @tap="addPhoto" v-if="form.photos.length < 9">
            <text style="font-size:48rpx; color:#f5a623">+</text>
          </view>
        </view>
      </uni-forms-item>
    </uni-forms>

    <button class="submit-btn" @tap="submit" :loading="submitting">提交巡查记录</button>
  </view>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { request, addToOfflineQueue } from '@/utils/http'

const formRef = ref()
const submitting = ref(false)
const recording = ref(false)
const apiaries = ref<any[]>([])
const apiaryOptions = ref<any[]>([])
const hives = ref<any[]>([])
const selectedApiary = ref<any>(null)

const form = reactive({
  apiaryId: 0,
  inspectDate: new Date().toISOString().slice(0, 10),
  inspectType: 1,
  hiveIds: [] as number[],
  overallHealth: 1,
  queenStatus: 1,
  broStatus: 1,
  honeyStorage: 1,
  notes: '',
  photos: [] as string[],
})

const typeOptions = [
  { label: '日常巡查', value: 1 },
  { label: '繁殖期巡查', value: 2 },
  { label: '病害排查', value: 3 },
  { label: '转场前巡查', value: 4 },
]

const healthOptions = [
  { label: '😊 良好', value: 1 },
  { label: '🙂 正常', value: 2 },
  { label: '😟 需关注', value: 3 },
  { label: '😰 异常', value: 4 },
]

const queenOptions = [
  { label: '正常', value: 1 },
  { label: '失王', value: 2 },
  { label: '待确认', value: 3 },
]

const rules = {
  inspectDate: { rules: [{ required: true, errorMessage: '请选择日期' }] },
  notes: { rules: [{ validateFunction: () => form.overallHealth !== 4 || !!form.notes.trim() || '异常情况请填写备注' }] },
}

onMounted(async () => {
  const data = await request<any[]>({ url: '/app/apiaries' })
  apiaries.value = data || []
  apiaryOptions.value = apiaries.value
})

async function onApiaryChange(e: any) {
  const index = e.detail.value
  selectedApiary.value = apiaryOptions.value[index]
  form.apiaryId = selectedApiary.value.id
  const hiveData = await request<any[]>({ url: `/app/apiaries/${form.apiaryId}/hives` })
  hives.value = (hiveData || []).filter((h: any) => h.status === 1)
}

function toggleHive(id: number) {
  const idx = form.hiveIds.indexOf(id)
  if (idx >= 0) form.hiveIds.splice(idx, 1)
  else form.hiveIds.push(id)
}

function selectAllHives() {
  if (form.hiveIds.length === hives.value.length) {
    form.hiveIds = []
  } else {
    form.hiveIds = hives.value.map((h: any) => h.id)
  }
}

function startRecord() {
  recording.value = true
  uni.startRecord({ success: () => {} })
}

function stopRecord() {
  recording.value = false
  uni.stopRecord({
    success: (res) => {
      if (res.tempFilePath) {
        form.notes += ' [语音转文字待接入]'
      }
    },
  })
}

function addPhoto() {
  uni.chooseImage({
    count: 9 - form.photos.length,
    sizeType: ['compressed'],
    sourceType: ['album', 'camera'],
    success: (res) => {
      form.photos.push(...res.tempFilePaths)
    },
  })
}

async function submit() {
  if (!form.apiaryId) {
    uni.showToast({ title: '请选择蜂场', icon: 'none' })
    return
  }
  if (!form.hiveIds.length) {
    uni.showToast({ title: '请选择巡查蜂箱', icon: 'none' })
    return
  }
  submitting.value = true
  const payload = { ...form, hiveCount: form.hiveIds.length }
  try {
    await request({ url: '/app/inspections', method: 'POST', data: payload })
    uni.showToast({ title: '提交成功', icon: 'success' })
    setTimeout(() => uni.navigateBack(), 1200)
  } catch {
    addToOfflineQueue({ url: '/app/inspections', method: 'POST', data: payload })
    uni.showToast({ title: '已保存离线，联网后自动同步', icon: 'none' })
  } finally {
    submitting.value = false
  }
}
</script>

<style scoped>
.page { padding: 24rpx 24rpx 60rpx; background: #fff; min-height: 100vh; }

.picker-view {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8rpx 0;
}

.hive-selector { display: flex; flex-wrap: wrap; gap: 12rpx; align-items: center; }

.hive-chip {
  padding: 8rpx 20rpx;
  border-radius: 20rpx;
  background: #f5f5f5;
  font-size: 24rpx;
  color: #666;
  border: 2rpx solid transparent;
}

.hive-chip.selected {
  background: #fff8ec;
  color: #f5a623;
  border-color: #f5a623;
}

.select-all {
  font-size: 24rpx;
  color: #f5a623;
  padding: 8rpx 16rpx;
}

.health-options { display: flex; gap: 16rpx; flex-wrap: wrap; }

.health-btn {
  flex: 1;
  min-width: 160rpx;
  text-align: center;
  padding: 16rpx;
  border-radius: 12rpx;
  font-size: 26rpx;
  background: #f5f5f5;
  color: #666;
}

.health-btn.active.color-1 { background: #e8f5e9; color: #2ecc71; font-weight: 700; }
.health-btn.active.color-2 { background: #e3f2fd; color: #1677ff; font-weight: 700; }
.health-btn.active.color-3 { background: #fff8e1; color: #f5a623; font-weight: 700; }
.health-btn.active.color-4 { background: #fce4ec; color: #e74c3c; font-weight: 700; }

.radio-group { display: flex; gap: 32rpx; }

.radio-item { display: flex; align-items: center; gap: 10rpx; font-size: 28rpx; }

.radio-dot {
  width: 32rpx;
  height: 32rpx;
  border-radius: 50%;
  border: 2rpx solid #ddd;
}

.radio-dot.checked {
  background: #f5a623;
  border-color: #f5a623;
}

.voice-btn {
  display: flex;
  align-items: center;
  margin-top: 12rpx;
  background: #fff8ec;
  border-radius: 8rpx;
  padding: 12rpx 20rpx;
  width: fit-content;
}

.photo-list { display: flex; flex-wrap: wrap; gap: 12rpx; }

.photo-thumb { width: 150rpx; height: 150rpx; border-radius: 8rpx; }

.photo-add {
  width: 150rpx;
  height: 150rpx;
  background: #f5f5f5;
  border-radius: 8rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 2rpx dashed #ddd;
}

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
