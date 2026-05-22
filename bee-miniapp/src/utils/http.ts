// HTTP 请求封装，自动携带 token，处理 401

// #ifdef H5
// H5 模式下通过 Vite proxy 代理，无 CORS 问题
export const BASE_URL = '/api'
// #endif

// #ifndef H5
// 小程序/APP 模式下需要完整地址
export const BASE_URL = 'http://localhost:3000/api'
// #endif

interface RequestOptions {
  url: string
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE'
  data?: Record<string, unknown>
  header?: Record<string, string>
}

interface ApiResponse<T = unknown> {
  code: number
  message: string
  data: T
  timestamp: number
}

function getToken(): string {
  return uni.getStorageSync('bee_token') || ''
}

export function request<T = unknown>(options: RequestOptions): Promise<T> {
  return new Promise((resolve, reject) => {
    const token = getToken()
    uni.request({
      url: BASE_URL + options.url,
      method: options.method || 'GET',
      data: options.data,
      header: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...(options.header || {}),
      },
      success: (res) => {
        const body = res.data as ApiResponse<T>
        if (res.statusCode === 401) {
          uni.removeStorageSync('bee_token')
          uni.removeStorageSync('bee_user')
          uni.reLaunch({ url: '/pages/login/login' })
          reject(new Error('未授权，请重新登录'))
          return
        }
        if (res.statusCode >= 200 && res.statusCode < 300) {
          if (body.code === 0 || body.code === 200) {
            resolve(body.data)
          } else {
            uni.showToast({ title: body.message || '请求失败', icon: 'none' })
            reject(new Error(body.message))
          }
        } else {
          uni.showToast({ title: '网络错误', icon: 'none' })
          reject(new Error('网络错误'))
        }
      },
      fail: () => {
        // 离线模式：写入离线队列（仅 POST/PUT 请求）
        if (options.method === 'POST' || options.method === 'PUT') {
          addToOfflineQueue(options)
        }
        uni.showToast({ title: '网络不可用', icon: 'none' })
        reject(new Error('网络不可用'))
      },
    })
  })
}

// 离线队列
interface OfflineItem {
  id: string
  method: string
  url: string
  data?: Record<string, unknown>
  createdAt: number
  retryCount: number
}

export function addToOfflineQueue(options: RequestOptions) {
  const queue: OfflineItem[] = uni.getStorageSync('offline_queue') || []
  queue.push({
    id: Date.now().toString(),
    method: options.method || 'POST',
    url: options.url,
    data: options.data,
    createdAt: Date.now(),
    retryCount: 0,
  })
  uni.setStorageSync('offline_queue', queue)
}

export async function flushOfflineQueue() {
  const queue: OfflineItem[] = uni.getStorageSync('offline_queue') || []
  if (!queue.length) return

  const remaining: OfflineItem[] = []
  for (const item of queue) {
    if (item.retryCount >= 3) continue // 超过重试次数，丢弃
    try {
      await request({
        url: item.url,
        method: item.method as 'POST' | 'PUT',
        data: item.data,
      })
      // 成功，不加入 remaining
    } catch {
      remaining.push({ ...item, retryCount: item.retryCount + 1 })
    }
  }
  uni.setStorageSync('offline_queue', remaining)
  if (queue.length - remaining.length > 0) {
    uni.showToast({ title: `已同步 ${queue.length - remaining.length} 条离线数据`, icon: 'success' })
  }
}
