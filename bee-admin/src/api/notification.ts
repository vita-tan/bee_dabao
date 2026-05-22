import http from '@/utils/http'

export const getNotifications = (params?: any) =>
  http.get<{ data: { list: any[]; total: number } }>('/admin/notifications', { params }).then((r) => r.data.data)

export const createNotification = (data: any) =>
  http.post('/admin/notifications', data)

export const revokeNotification = (id: number) =>
  http.put(`/admin/notifications/${id}/revoke`)

export const getStatsOverview = (params?: { regionCode?: string }) =>
  http.get<{ data: any }>('/admin/stats/overview', { params }).then((r) => r.data.data)
