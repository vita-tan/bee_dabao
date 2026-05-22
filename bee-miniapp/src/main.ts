import { createSSRApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import { flushOfflineQueue } from './utils/http'

export function createApp() {
  const app = createSSRApp(App)
  const pinia = createPinia()
  app.use(pinia)
  return { app, pinia }
}

// 监听网络变化，联网时自动同步离线队列
uni.onNetworkStatusChange((res) => {
  if (res.isConnected) {
    flushOfflineQueue()
  }
})
