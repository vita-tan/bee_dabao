<template>
  <view class="page">
    <!-- Step 1: 选择采蜜记录 -->
    <view class="step-card">
      <view class="step-header">
        <view class="step-badge">1</view>
        <text class="step-title">选择采蜜记录</text>
      </view>
      <picker mode="selector" :range="harvestOptions" range-key="label" @change="onHarvestChange">
        <view class="picker-view">
          <text v-if="selectedHarvest" class="picker-text">{{ selectedHarvest.label }}</text>
          <text v-else class="picker-placeholder">请选择一条采蜜记录</text>
          <uni-icons type="right" size="16" color="#999" />
        </view>
      </picker>
      <view v-if="selectedHarvest" class="harvest-preview">
        <view class="preview-row"><text class="preview-label">蜜种</text><text class="preview-value">{{ selectedHarvest.honeyType }}</text></view>
        <view class="preview-row"><text class="preview-label">产量</text><text class="preview-value">{{ selectedHarvest.quantity }}kg</text></view>
        <view class="preview-row"><text class="preview-label">日期</text><text class="preview-value">{{ selectedHarvest.harvestDate }}</text></view>
        <view class="preview-row" v-if="selectedHarvest.baumeDegree"><text class="preview-label">波美度</text><text class="preview-value">{{ selectedHarvest.baumeDegree }}°</text></view>
      </view>
    </view>

    <!-- Step 2: 产品信息 -->
    <view class="step-card">
      <view class="step-header">
        <view class="step-badge">2</view>
        <text class="step-title">产品信息</text>
      </view>
      <uni-forms ref="formRef" :modelValue="form" :rules="rules" label-width="180rpx">
        <uni-forms-item label="产品名称" required>
          <uni-easyinput v-model="form.productName" placeholder="如：南浦溪槐花蜜" />
        </uni-forms-item>
        <uni-forms-item label="规格" required>
          <uni-easyinput v-model="form.spec" placeholder="如：250g/瓶" />
        </uni-forms-item>
        <uni-forms-item label="生产日期" required>
          <uni-datetime-picker type="date" v-model="form.produceDate" />
        </uni-forms-item>
        <uni-forms-item label="保质期(月)" required>
          <uni-easyinput type="number" v-model="form.shelfLifeMonths" placeholder="如：24" />
        </uni-forms-item>
        <uni-forms-item label="批次号">
          <uni-easyinput v-model="form.batchNo" placeholder="可选，如：B20260501" />
        </uni-forms-item>
        <uni-forms-item label="加工说明">
          <uni-easyinput type="textarea" v-model="form.processNotes" placeholder="可选，描述加工过程" />
        </uni-forms-item>
      </uni-forms>
    </view>

    <!-- Step 3: 生成按钮 -->
    <button class="submit-btn" @tap="submit" :loading="submitting" :disabled="!selectedHarvest">
      生成追溯码
    </button>

    <!-- 结果弹窗 -->
    <view v-if="result" class="result-card">
      <view class="result-header">
        <text class="result-icon">🎉</text>
        <text class="result-title">追溯码已生成</text>
      </view>
      <view class="code-box">
        <text class="code-text">{{ result.code }}</text>
        <text class="code-copy" @tap="copyCode">复制</text>
      </view>
      <view class="qr-wrapper" v-if="qrDataUrl">
        <image class="qr-image" :src="qrDataUrl" mode="aspectFit" />
        <text class="qr-hint">长按保存二维码，贴在产品包装上</text>
      </view>
      <view class="result-actions">
        <button class="action-btn outline" @tap="reset">继续生成</button>
        <button class="action-btn primary" @tap="navToList">查看全部</button>
      </view>
    </view>

    <!-- 底部安全距离 -->
    <view class="safe-bottom" />
  </view>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { request } from '@/utils/http'

const formRef = ref()
const submitting = ref(false)
const harvestOptions = ref<any[]>([])
const selectedHarvest = ref<any>(null)
const result = ref<any>(null)
const qrDataUrl = ref('')

const form = reactive({
  productName: '',
  spec: '',
  produceDate: new Date().toISOString().slice(0, 10),
  shelfLifeMonths: '24',
  batchNo: '',
  processNotes: '',
})

const rules = {
  productName: { rules: [{ required: true, errorMessage: '请输入产品名称' }] },
  spec: { rules: [{ required: true, errorMessage: '请输入规格' }] },
  shelfLifeMonths: { rules: [{ required: true, errorMessage: '请输入保质期' }] },
}

onMounted(async () => {
  try {
    const data = await request<any[]>({ url: '/app/harvests?pageSize=50' })
    const list = (data as any)?.list || data || []
    harvestOptions.value = list.map((h: any) => ({
      ...h,
      label: `${h.honeyType} · ${h.harvestDate} · ${h.quantity}kg`,
    }))
  } catch {
    uni.showToast({ title: '加载采蜜记录失败', icon: 'none' })
  }
})

function onHarvestChange(e: any) {
  selectedHarvest.value = harvestOptions.value[e.detail.value]
  // 自动预填产品名
  if (!form.productName) {
    form.productName = selectedHarvest.value.honeyType || ''
  }
}

async function submit() {
  if (!selectedHarvest.value) {
    uni.showToast({ title: '请选择采蜜记录', icon: 'none' })
    return
  }
  await formRef.value?.validate()
  submitting.value = true
  try {
    const payload = {
      harvestId: selectedHarvest.value.id,
      productName: form.productName,
      spec: form.spec,
      produceDate: form.produceDate,
      shelfLifeMonths: Number(form.shelfLifeMonths),
      ...(form.batchNo ? { batchNo: form.batchNo } : {}),
      ...(form.processNotes ? { processNotes: form.processNotes } : {}),
    }
    const data: any = await request({ url: '/app/trace/generate', method: 'POST', data: payload })
    result.value = data

    // 生成内嵌二维码 (使用 API 在线生成)
    const qrApi = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(data.qrUrl || `https://bee-trace.example.com/trace/${data.code}`)}`
    qrDataUrl.value = qrApi

    uni.showToast({ title: '生成成功', icon: 'success' })
  } catch {
    uni.showToast({ title: '生成失败', icon: 'none' })
  } finally {
    submitting.value = false
  }
}

function copyCode() {
  uni.setClipboardData({
    data: result.value.code,
    success: () => uni.showToast({ title: '已复制', icon: 'success' }),
  })
}

function reset() {
  result.value = null
  qrDataUrl.value = ''
  form.productName = ''
  form.spec = ''
  form.batchNo = ''
  form.processNotes = ''
}

function navToList() {
  uni.navigateTo({ url: '/pages/trace/list' })
}
</script>

<style scoped>
.page {
  padding: 24rpx 24rpx 60rpx;
  background: #f5f7fa;
  min-height: 100vh;
}

.step-card {
  background: #fff;
  border-radius: 20rpx;
  padding: 28rpx 24rpx;
  margin-bottom: 24rpx;
  box-shadow: 0 2rpx 16rpx rgba(0, 0, 0, 0.04);
}

.step-header {
  display: flex;
  align-items: center;
  margin-bottom: 24rpx;
}

.step-badge {
  width: 40rpx;
  height: 40rpx;
  border-radius: 50%;
  background: linear-gradient(135deg, #f5a623, #FF8C00);
  color: #fff;
  font-size: 24rpx;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 16rpx;
  flex-shrink: 0;
}

.step-title {
  font-size: 30rpx;
  font-weight: 600;
  color: #2c2c2c;
}

.picker-view {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16rpx 0;
  border-bottom: 2rpx solid #f0f0f0;
}

.picker-text {
  font-size: 28rpx;
  color: #333;
}

.picker-placeholder {
  font-size: 28rpx;
  color: #999;
}

.harvest-preview {
  margin-top: 20rpx;
  background: #fdf8f0;
  border-radius: 12rpx;
  padding: 20rpx;
}

.preview-row {
  display: flex;
  justify-content: space-between;
  padding: 8rpx 0;
}

.preview-label {
  font-size: 26rpx;
  color: #888;
}

.preview-value {
  font-size: 26rpx;
  color: #333;
  font-weight: 500;
}

.submit-btn {
  margin-top: 32rpx;
  background: linear-gradient(135deg, #f5a623, #FF8C00);
  color: #fff;
  border-radius: 16rpx;
  font-size: 32rpx;
  font-weight: 600;
  height: 96rpx;
  line-height: 96rpx;
  box-shadow: 0 8rpx 24rpx rgba(245, 166, 35, 0.3);
}

.submit-btn[disabled] {
  background: #ddd;
  box-shadow: none;
  color: #999;
}

/* 结果卡片 */
.result-card {
  margin-top: 40rpx;
  background: #fff;
  border-radius: 20rpx;
  padding: 40rpx 32rpx;
  text-align: center;
  box-shadow: 0 4rpx 24rpx rgba(0, 0, 0, 0.08);
}

.result-header {
  margin-bottom: 24rpx;
}

.result-icon {
  font-size: 64rpx;
  display: block;
  margin-bottom: 12rpx;
}

.result-title {
  font-size: 34rpx;
  font-weight: 700;
  color: #f5a623;
}

.code-box {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 16rpx;
  background: #fdf8f0;
  border-radius: 12rpx;
  padding: 20rpx 24rpx;
  margin-bottom: 32rpx;
}

.code-text {
  font-size: 28rpx;
  font-weight: 700;
  color: #2c2c2c;
  font-family: 'Courier New', monospace;
  letter-spacing: 1rpx;
}

.code-copy {
  font-size: 24rpx;
  color: #f5a623;
  padding: 6rpx 16rpx;
  border: 1rpx solid #f5a623;
  border-radius: 8rpx;
}

.qr-wrapper {
  margin-bottom: 32rpx;
}

.qr-image {
  width: 280rpx;
  height: 280rpx;
  border-radius: 12rpx;
  border: 2rpx solid #f0f0f0;
}

.qr-hint {
  display: block;
  margin-top: 12rpx;
  font-size: 24rpx;
  color: #999;
}

.result-actions {
  display: flex;
  gap: 20rpx;
}

.action-btn {
  flex: 1;
  height: 80rpx;
  line-height: 80rpx;
  border-radius: 12rpx;
  font-size: 28rpx;
  font-weight: 500;
}

.action-btn.outline {
  background: #fff;
  color: #f5a623;
  border: 2rpx solid #f5a623;
}

.action-btn.primary {
  background: linear-gradient(135deg, #f5a623, #FF8C00);
  color: #fff;
}

.safe-bottom {
  height: calc(env(safe-area-inset-bottom) + 20rpx);
}
</style>
