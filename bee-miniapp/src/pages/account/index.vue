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
    <view class="add-btn" @tap="showForm = true">
      <text style="color:#fff; font-size:40rpx">+</text>
    </view>

    <!-- 新增记录弹窗 -->
    <view class="modal-mask" v-if="showForm" @tap="showForm = false">
      <view class="modal-card" @tap.stop>
        <view class="modal-header">
          <text class="modal-title">新增记录</text>
          <text class="modal-close" @tap="showForm = false">✕</text>
        </view>
        <view class="modal-body">
          <!-- 类型 -->
          <view class="form-group">
            <text class="form-label">类型</text>
            <view class="type-switch">
              <view class="type-btn" :class="{ active: form.type === 1 }" @tap="form.type = 1">收入</view>
              <view class="type-btn" :class="{ active: form.type === 2 }" @tap="form.type = 2">支出</view>
            </view>
          </view>
          <!-- 分类 -->
          <view class="form-group">
            <text class="form-label">分类</text>
            <picker mode="selector" :range="categoryOptions" @change="onCategoryChange">
              <view class="form-picker">{{ form.category || '请选择' }}</view>
            </picker>
          </view>
          <!-- 金额 -->
          <view class="form-group">
            <text class="form-label">金额 (元)</text>
            <input class="form-input" type="digit" v-model="form.amount" placeholder="请输入金额" />
          </view>
          <!-- 日期 -->
          <view class="form-group">
            <text class="form-label">日期</text>
            <picker mode="date" :value="form.recordDate" @change="onDateChange">
              <view class="form-picker">{{ form.recordDate }}</view>
            </picker>
          </view>
          <!-- 备注 -->
          <view class="form-group">
            <text class="form-label">备注</text>
            <input class="form-input" v-model="form.notes" placeholder="选填" />
          </view>
        </view>
        <view class="modal-footer">
          <button class="modal-cancel" @tap="showForm = false">取消</button>
          <button class="modal-submit" @tap="submitRecord" :disabled="submitting">
            {{ submitting ? '提交中...' : '确认' }}
          </button>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, reactive, computed } from 'vue'
import { onShow } from '@dcloudio/uni-app'
import { request } from '@/utils/http'

const list = ref<any[]>([])
const summary = reactive({ monthIncome: 0, monthExpense: 0, monthProfit: 0 })
const filter = ref(0)
const showForm = ref(false)
const submitting = ref(false)

const incomeCategories = ['蜂蜜销售', '蜂王浆销售', '花粉销售', '蜂胶销售', '蜂蜡销售', '蜂群出售', '补贴收入', '其他收入']
const expenseCategories = ['蜂药蜂具', '饲料糖浆', '蜂种购买', '转场运输', '人工费用', '蜂箱设备', '包装材料', '其他支出']
const categoryOptions = computed(() =>
  form.type === 1 ? incomeCategories : expenseCategories,
)

const form = reactive({
  type: 1,
  category: '',
  amount: '',
  recordDate: new Date().toISOString().split('T')[0],
  notes: '',
})

const filteredList = computed(() =>
  filter.value === 0 ? list.value : list.value.filter((r) => r.type === filter.value),
)

async function loadData() {
  const [listData, summaryData] = await Promise.allSettled([
    request<any>({ url: '/app/accounts?pageSize=100' }),
    request<any>({ url: '/app/accounts/summary' }),
  ])
  if (listData.status === 'fulfilled') {
    const data = listData.value as any
    list.value = data?.list || data || []
  }
  if (summaryData.status === 'fulfilled') {
    const d = summaryData.value as any
    Object.assign(summary, {
      monthIncome: d?.monthIncome || d?.month_income || 0,
      monthExpense: d?.monthExpense || d?.month_expense || 0,
      monthProfit: d?.monthProfit || d?.month_profit || 0,
    })
  }
}

function onCategoryChange(e: any) {
  form.category = categoryOptions.value[e.detail.value]
}

function onDateChange(e: any) {
  form.recordDate = e.detail.value
}

async function submitRecord() {
  if (!form.category) {
    uni.showToast({ title: '请选择分类', icon: 'none' })
    return
  }
  if (!form.amount || parseFloat(form.amount) <= 0) {
    uni.showToast({ title: '请输入有效金额', icon: 'none' })
    return
  }

  submitting.value = true
  try {
    await request({
      url: '/app/accounts',
      method: 'POST',
      data: {
        type: form.type,
        category: form.category,
        amount: parseFloat(form.amount),
        recordDate: form.recordDate,
        notes: form.notes || undefined,
      },
    })
    uni.showToast({ title: '记录成功', icon: 'success' })
    showForm.value = false
    // 重置表单
    form.type = 1
    form.category = ''
    form.amount = ''
    form.notes = ''
    form.recordDate = new Date().toISOString().split('T')[0]
    // 刷新列表
    loadData()
  } catch (e: any) {
    uni.showToast({ title: e?.message || '提交失败', icon: 'none' })
  } finally {
    submitting.value = false
  }
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

/* ==============================
   新增记录弹窗
   ============================== */
.modal-mask {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.45);
  z-index: 999;
  display: flex;
  align-items: flex-end;
  justify-content: center;
}

.modal-card {
  width: 100%;
  max-height: 80vh;
  background: #fff;
  border-radius: 32rpx 32rpx 0 0;
  overflow-y: auto;
  animation: slideUp 0.25s ease;
}

@keyframes slideUp {
  from { transform: translateY(100%); }
  to { transform: translateY(0); }
}

.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 32rpx 32rpx 16rpx;
  border-bottom: 1rpx solid #f0f0f0;
}

.modal-title {
  font-size: 34rpx;
  font-weight: 600;
  color: #2c2c2c;
}

.modal-close {
  font-size: 36rpx;
  color: #bbb;
  padding: 8rpx;
}

.modal-body {
  padding: 24rpx 32rpx;
}

.form-group {
  margin-bottom: 28rpx;
}

.form-label {
  font-size: 26rpx;
  color: #888;
  display: block;
  margin-bottom: 12rpx;
}

.form-input {
  width: 100%;
  height: 80rpx;
  background: #f8f8f8;
  border-radius: 12rpx;
  padding: 0 20rpx;
  font-size: 28rpx;
  color: #333;
  box-sizing: border-box;
}

.form-picker {
  width: 100%;
  height: 80rpx;
  background: #f8f8f8;
  border-radius: 12rpx;
  padding: 0 20rpx;
  font-size: 28rpx;
  color: #333;
  display: flex;
  align-items: center;
  box-sizing: border-box;
}

.type-switch {
  display: flex;
  gap: 16rpx;
}

.type-btn {
  flex: 1;
  height: 72rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 12rpx;
  font-size: 28rpx;
  background: #f5f5f5;
  color: #888;
  transition: all 0.2s;
}

.type-btn.active {
  background: #f5a623;
  color: #fff;
  font-weight: 600;
}

.modal-footer {
  display: flex;
  gap: 20rpx;
  padding: 24rpx 32rpx 48rpx;
  border-top: 1rpx solid #f0f0f0;
}

.modal-cancel {
  flex: 1;
  height: 80rpx;
  background: #f5f5f5;
  border-radius: 12rpx;
  font-size: 28rpx;
  color: #666;
  display: flex;
  align-items: center;
  justify-content: center;
  border: none;
}

.modal-submit {
  flex: 2;
  height: 80rpx;
  background: #f5a623;
  border-radius: 12rpx;
  font-size: 28rpx;
  color: #fff;
  font-weight: 600;
  display: flex;
  align-items: center;
  justify-content: center;
  border: none;
}

.modal-submit[disabled] {
  opacity: 0.6;
}
</style>
