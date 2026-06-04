<script setup lang="ts">
import { onLaunch, onShow } from '@dcloudio/uni-app'
import { flushOfflineQueue } from './utils/http'

onLaunch(() => {
  // 启动时检查网络并同步离线队列
  uni.getNetworkType({
    success: (res) => {
      if (res.networkType !== 'none') {
        flushOfflineQueue()
      }
    },
  })
})

onShow(() => {
  // 可在这里处理页面显示时的逻辑
})
</script>

<template>
  <div />
</template>

<style>
/* 强制所有 uni-app 页面包装层不裁剪水平方向内容 */
html, body, #app {
  overflow-x: visible !important;
  max-width: 100% !important;
}

.uni-page,
.uni-page-wrapper,
.uni-page-body,
.uni-page-head,
.uni-page-body > uni-page,
.uni-page-body > uni-page-wrapper {
  overflow-x: visible !important;
  max-width: 100% !important;
}

page {
  font-size: 16px;
  background-color: #f5f7fa;
  color: #333;
  overflow-x: visible !important;
  max-width: 100% !important;
}

.bee-primary {
  color: #f5a623;
}

.bee-success {
  color: #2ecc71;
}

.bee-danger {
  color: #e74c3c;
}

.bee-card {
  background: #fff;
  border-radius: 12rpx;
  padding: 24rpx;
  margin-bottom: 20rpx;
}

.safe-area-bottom {
  padding-bottom: env(safe-area-inset-bottom);
}
</style>
