<template>
  <view class="login-page">
    <view class="login-header">
      <text class="login-logo">🐝</text>
      <text class="login-title">蜂农助手</text>
      <text class="login-subtitle">H5 调试登录</text>
    </view>

    <!-- #ifdef H5 -->
    <view class="login-form">
      <view class="form-item">
        <text class="form-label">手机号</text>
        <input
          class="form-input"
          type="number"
          v-model="phone"
          placeholder="请输入蜂农手机号"
          maxlength="11"
        />
      </view>
      <button class="btn-login" :loading="loading" @tap="handleDevLogin">
        登录
      </button>
      <view class="dev-accounts" v-if="showAccounts">
        <text class="dev-title">测试账号（点击快速填入）</text>
        <view class="account-list">
          <view class="account-tag" v-for="a in testAccounts" :key="a.phone" @tap="phone = a.phone">
            {{ a.name }} {{ a.phone }}
          </view>
        </view>
      </view>
    </view>
    <!-- #endif -->

    <!-- #ifndef H5 -->
    <view class="login-form">
      <button class="btn-wx" open-type="getPhoneNumber" @getphonenumber="onGetPhoneNumber">
        📱 微信一键登录
      </button>
    </view>
    <!-- #endif -->
  </view>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { request, BASE_URL } from '@/utils/http'

const phone = ref('')
const loading = ref(false)
const showAccounts = ref(true)

// 种子数据中的蜂农测试账号
const testAccounts = ref([
  { name: '陈大明', phone: '13800010001' },
  { name: '王秀英', phone: '13800010002' },
  { name: '刘建国', phone: '13800010003' },
  { name: '张小芳', phone: '13800010004' },
  { name: '吴根生', phone: '13800010005' },
])

// #ifdef H5
async function handleDevLogin() {
  if (!phone.value || phone.value.length !== 11) {
    uni.showToast({ title: '请输入正确的手机号', icon: 'none' })
    return
  }
  loading.value = true
  try {
    const res: any = await new Promise((resolve, reject) => {
      uni.request({
        url: BASE_URL + '/app/auth/dev-login',
        method: 'POST',
        data: { phone: phone.value },
        header: { 'Content-Type': 'application/json' },
        success: (r) => {
          const body = r.data as any
          if (r.statusCode >= 200 && r.statusCode < 300 && (body.code === 0 || body.code === 200)) {
            resolve(body.data)
          } else {
            reject(new Error(body.message || '登录失败'))
          }
        },
        fail: () => reject(new Error('网络错误')),
      })
    })
    // 存储 token 和用户信息
    uni.setStorageSync('bee_token', res.token)
    uni.setStorageSync('bee_user', res.beekeeper)
    uni.showToast({ title: '登录成功', icon: 'success' })
    setTimeout(() => {
      uni.reLaunch({ url: '/pages/index/index' })
    }, 500)
  } catch (e: any) {
    uni.showToast({ title: e.message || '登录失败', icon: 'none' })
  } finally {
    loading.value = false
  }
}
// #endif

// #ifndef H5
async function onGetPhoneNumber(e: any) {
  // 小程序端微信登录
  try {
    const loginRes = await new Promise((resolve, reject) => {
      uni.login({
        provider: 'weixin',
        success: resolve,
        fail: reject,
      })
    }) as any

    const wxRes: any = await new Promise((resolve, reject) => {
      uni.request({
        url: BASE_URL + '/app/auth/wechat-login',
        method: 'POST',
        data: { code: loginRes.code },
        header: { 'Content-Type': 'application/json' },
        success: (r) => {
          const body = r.data as any
          if (body.code === 200) resolve(body.data)
          else reject(new Error(body.message))
        },
        fail: reject,
      })
    })

    if (wxRes.isNew && wxRes.tempToken) {
      // 新用户，绑定手机号
      const bindRes: any = await new Promise((resolve, reject) => {
        uni.request({
          url: BASE_URL + '/app/auth/bind-phone',
          method: 'POST',
          data: { tempToken: wxRes.tempToken, phoneCode: e.detail.code },
          header: { 'Content-Type': 'application/json' },
          success: (r) => {
            const body = r.data as any
            if (body.code === 200) resolve(body.data)
            else reject(new Error(body.message))
          },
          fail: reject,
        })
      })
      uni.setStorageSync('bee_token', bindRes.token)
      uni.setStorageSync('bee_user', bindRes.beekeeper)
    } else {
      uni.setStorageSync('bee_token', wxRes.token)
      uni.setStorageSync('bee_user', wxRes.beekeeper)
    }

    uni.showToast({ title: '登录成功', icon: 'success' })
    setTimeout(() => {
      uni.reLaunch({ url: '/pages/index/index' })
    }, 500)
  } catch (err: any) {
    uni.showToast({ title: err.message || '登录失败', icon: 'none' })
  }
}
// #endif
</script>

<style scoped>
.login-page {
  min-height: 100vh;
  background: #f5f7fa;
  padding: 0 48rpx;
  display: flex;
  flex-direction: column;
}

.login-header {
  padding: 120rpx 0 60rpx;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.login-logo {
  font-size: 100rpx;
  margin-bottom: 16rpx;
}

.login-title {
  font-size: 44rpx;
  font-weight: bold;
  color: #333;
}

.login-subtitle {
  font-size: 26rpx;
  color: #999;
  margin-top: 8rpx;
}

.login-form {
  margin-top: 40rpx;
}

.form-item {
  background: #fff;
  border-radius: 12rpx;
  padding: 24rpx 32rpx;
  margin-bottom: 32rpx;
}

.form-label {
  font-size: 26rpx;
  color: #999;
  margin-bottom: 12rpx;
  display: block;
}

.form-input {
  font-size: 32rpx;
  color: #333;
  height: 72rpx;
}

.btn-login {
  background: linear-gradient(135deg, #f5a623, #f7c96a);
  color: #fff;
  border: none;
  border-radius: 12rpx;
  font-size: 32rpx;
  height: 88rpx;
  line-height: 88rpx;
  font-weight: 600;
}

.btn-login::after {
  border: none;
}

.btn-wx {
  background: #07c160;
  color: #fff;
  border: none;
  border-radius: 12rpx;
  font-size: 32rpx;
  height: 88rpx;
  line-height: 88rpx;
  font-weight: 600;
}

.btn-wx::after {
  border: none;
}

.dev-accounts {
  margin-top: 40rpx;
}

.dev-title {
  font-size: 24rpx;
  color: #999;
  margin-bottom: 16rpx;
  display: block;
}

.account-list {
  display: flex;
  flex-wrap: wrap;
  gap: 12rpx;
}

.account-tag {
  background: #fff;
  border: 1rpx solid #eee;
  border-radius: 8rpx;
  padding: 12rpx 20rpx;
  font-size: 24rpx;
  color: #666;
}
</style>
