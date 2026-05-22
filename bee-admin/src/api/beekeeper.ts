import http from '@/utils/http'

export interface BeekeeperListParams {
  keyword?: string
  status?: number
  level?: number
  regionCode?: string
  creditMin?: number
  creditMax?: number
  registerStart?: string
  registerEnd?: string
  page?: number
  pageSize?: number
}

export const getBeekeeperList = (params: BeekeeperListParams) =>
  http.get<{ data: { list: any[]; total: number } }>('/admin/beekeepers', { params }).then((r) => r.data.data)

export const getPendingBeekeepers = () =>
  http.get<{ data: any[] }>('/admin/beekeepers/pending').then((r) => r.data.data)

export const getBeekeeperDetail = (id: number) =>
  http.get<{ data: any }>(`/admin/beekeepers/${id}`).then((r) => r.data.data)

export const approveBeekeper = (id: number, data: { audit_note?: string }) =>
  http.put(`/admin/beekeepers/${id}/approve`, data)

export const rejectBeekeeper = (id: number, data: { audit_note: string }) =>
  http.put(`/admin/beekeepers/${id}/reject`, data)

export const freezeBeekeeper = (id: number, data: { freeze: boolean; reason: string }) =>
  http.put(`/admin/beekeepers/${id}/freeze`, data)
