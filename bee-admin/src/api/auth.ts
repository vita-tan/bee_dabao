import http from '@/utils/http'

export interface LoginParams {
  username: string
  password: string
}

export interface LoginResult {
  token: string
  adminInfo: {
    id: number
    username: string
    realName: string
    role: string
    regionCode: string
  }
}

export const adminLogin = (params: LoginParams) =>
  http.post<{ data: LoginResult }>('/admin/auth/login', params).then((r) => r.data.data)

export const adminLogout = () => http.post('/admin/auth/logout')

export const getAdminMe = () =>
  http.get<{ data: LoginResult['adminInfo'] }>('/admin/auth/me').then((r) => r.data.data)

export const changePassword = (params: { oldPassword: string; newPassword: string }) =>
  http.put('/admin/auth/password', params)
