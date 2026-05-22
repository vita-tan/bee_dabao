import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import RequireAuth from '@/components/RequireAuth'
import AdminLayout from '@/layouts/AdminLayout'
import LoginPage from '@/pages/login/LoginPage'
import OverviewPage from '@/pages/overview/OverviewPage'
import BeekeeperListPage from '@/pages/beekeeper/BeekeeperListPage'
import BeekeeperPendingPage from '@/pages/beekeeper/BeekeeperPendingPage'
import SubsidyPoliciesPage from '@/pages/subsidy/SubsidyPoliciesPage'
import NotificationsPage from '@/pages/notifications/NotificationsPage'
import PlaceholderPage from '@/components/PlaceholderPage'

export default function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route
          path="/"
          element={
            <RequireAuth>
              <AdminLayout />
            </RequireAuth>
          }
        >
          <Route index element={<Navigate to="/overview" replace />} />
          <Route path="overview" element={<OverviewPage />} />

          {/* 蜂农管理 */}
          <Route path="beekeepers" element={<BeekeeperListPage />} />
          <Route path="beekeepers/pending" element={<BeekeeperPendingPage />} />
          <Route path="beekeepers/:id" element={<PlaceholderPage title="蜂农详情" />} />

          {/* 蜂场台账 */}
          <Route path="apiaries" element={<PlaceholderPage title="蜂场台账" />} />
          <Route path="apiaries/map" element={<PlaceholderPage title="蜂场地图" />} />

          {/* 生产记录 */}
          <Route path="production/inspections" element={<PlaceholderPage title="巡查记录" />} />
          <Route path="production/harvests" element={<PlaceholderPage title="采蜜记录" />} />
          <Route path="production/medications" element={<PlaceholderPage title="用药记录" />} />

          {/* 溯源 */}
          <Route path="trace" element={<PlaceholderPage title="溯源码管理" />} />

          {/* 补贴管理 */}
          <Route path="subsidy/policies" element={<SubsidyPoliciesPage />} />
          <Route path="subsidy/applications" element={<PlaceholderPage title="申请审核" />} />
          <Route path="subsidy/records" element={<PlaceholderPage title="发放记录" />} />

          {/* 通知管理 */}
          <Route path="notifications" element={<NotificationsPage />} />

          {/* 统计报表 */}
          <Route path="stats" element={<PlaceholderPage title="统计报表" />} />

          {/* 系统管理 */}
          <Route path="system/users" element={<PlaceholderPage title="用户管理" />} />
          <Route path="system/roles" element={<PlaceholderPage title="角色权限" />} />
          <Route path="system/regions" element={<PlaceholderPage title="组织架构" />} />
          <Route path="system/dicts" element={<PlaceholderPage title="数据字典" />} />
          <Route path="system/logs" element={<PlaceholderPage title="操作日志" />} />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
