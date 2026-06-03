import axios from 'axios'
import message from './globalMessage'

const http = axios.create({
  baseURL: '/api',
  timeout: 15000,
})

// 请求拦截器：自动携带 JWT
http.interceptors.request.use((config) => {
  const token = localStorage.getItem('bee_admin_token')
  if (token) {
    config.headers['Authorization'] = `Bearer ${token}`
  }
  return config
})

// 响应拦截器：统一处理错误
http.interceptors.response.use(
  (response) => {
    const data = response.data
    if (data.code !== undefined && data.code !== 200 && data.code !== 0) {
      message.error(data.message || '请求失败')
      return Promise.reject(new Error(data.message))
    }
    return response
  },
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('bee_admin_token')
      localStorage.removeItem('bee_admin_user')
      window.location.href = '/login'
      return Promise.reject(error)
    }
    const msg =
      error.response?.data?.message || error.message || '网络错误，请稍后重试'
    message.error(msg)
    return Promise.reject(error)
  },
)

export default http
