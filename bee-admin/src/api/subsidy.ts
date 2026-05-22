import http from '@/utils/http'

export const getSubsidyPolicies = (params?: any) =>
  http.get<{ data: { list: any[]; total: number } }>('/admin/subsidy/policies', { params }).then((r) => r.data.data)

export const createSubsidyPolicy = (data: any) =>
  http.post('/admin/subsidy/policies', data)

export const updateSubsidyPolicy = (id: number, data: any) =>
  http.put(`/admin/subsidy/policies/${id}`, data)

export const publishSubsidyPolicy = (id: number) =>
  http.put(`/admin/subsidy/policies/${id}/publish`)

export const closeSubsidyPolicy = (id: number) =>
  http.put(`/admin/subsidy/policies/${id}/close`)

export const getSubsidyApplications = (params?: any) =>
  http.get<{ data: { list: any[]; total: number } }>('/admin/subsidy/applications', { params }).then((r) => r.data.data)

export const approveApplication = (id: number, data: any) =>
  http.put(`/admin/subsidy/applications/${id}/approve`, data)

export const rejectApplication = (id: number, data: any) =>
  http.put(`/admin/subsidy/applications/${id}/reject`, data)
