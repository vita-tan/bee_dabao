import axios from 'axios'
import { showToast } from 'vant'

const http = axios.create({
  baseURL: '/api',
  timeout: 10000,
})

http.interceptors.response.use(
  (res) => res.data,
  (err) => {
    const msg = err.response?.data?.message || '网络请求失败，请稍后重试'
    showToast({ message: msg, type: 'fail' })
    return Promise.reject(err)
  },
)

export default http
