import React, { useState } from 'react'
import {
  Layout,
  Menu,
  Avatar,
  Dropdown,
  Space,
  Button,
  Modal,
  Form,
  Input,
  App,
  Breadcrumb,
  Badge,
} from 'antd'
import {
  DashboardOutlined,
  TeamOutlined,
  BankOutlined,
  FileTextOutlined,
  QrcodeOutlined,
  GiftOutlined,
  BellOutlined,
  BarChartOutlined,
  SettingOutlined,
  UserOutlined,
  LogoutOutlined,
  LockOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
} from '@ant-design/icons'
import { Outlet, useNavigate, useLocation } from 'react-router-dom'
import { useAuthStore } from '@/store/auth.store'
import { changePassword, adminLogout } from '@/api/auth'

const { Header, Sider, Content } = Layout

const menuItems = [
  { key: '/overview', icon: <DashboardOutlined />, label: '数据总览' },
  {
    key: '/beekeepers',
    icon: <TeamOutlined />,
    label: '蜂农管理',
    children: [
      { key: '/beekeepers', label: '蜂农列表' },
      { key: '/beekeepers/pending', label: '待审核' },
    ],
  },
  { key: '/apiaries', icon: <BankOutlined />, label: '蜂场台账' },
  {
    key: '/production',
    icon: <FileTextOutlined />,
    label: '生产记录',
    children: [
      { key: '/production/inspections', label: '巡查记录' },
      { key: '/production/harvests', label: '采蜜记录' },
      { key: '/production/medications', label: '用药记录' },
    ],
  },
  { key: '/trace', icon: <QrcodeOutlined />, label: '溯源码' },
  {
    key: '/subsidy',
    icon: <GiftOutlined />,
    label: '补贴管理',
    children: [
      { key: '/subsidy/policies', label: '补贴政策' },
      { key: '/subsidy/applications', label: '申请审核' },
      { key: '/subsidy/records', label: '发放记录' },
    ],
  },
  { key: '/notifications', icon: <BellOutlined />, label: '通知管理' },
  { key: '/stats', icon: <BarChartOutlined />, label: '统计报表' },
  {
    key: '/system',
    icon: <SettingOutlined />,
    label: '系统管理',
    children: [
      { key: '/system/users', label: '用户管理' },
      { key: '/system/roles', label: '角色权限' },
      { key: '/system/regions', label: '组织架构' },
      { key: '/system/dicts', label: '数据字典' },
      { key: '/system/logs', label: '操作日志' },
    ],
  },
]

const routeLabelMap: Record<string, string> = {
  '/overview': '数据总览',
  '/beekeepers': '蜂农列表',
  '/beekeepers/pending': '待审核',
  '/apiaries': '蜂场台账',
  '/production/inspections': '巡查记录',
  '/production/harvests': '采蜜记录',
  '/production/medications': '用药记录',
  '/trace': '溯源码管理',
  '/subsidy/policies': '补贴政策',
  '/subsidy/applications': '申请审核',
  '/subsidy/records': '发放记录',
  '/notifications': '通知管理',
  '/stats': '统计报表',
  '/system/users': '用户管理',
  '/system/roles': '角色权限',
  '/system/regions': '组织架构',
  '/system/dicts': '数据字典',
  '/system/logs': '操作日志',
}

const AdminLayout: React.FC = () => {
  const [collapsed, setCollapsed] = useState(false)
  const [pwdModalOpen, setPwdModalOpen] = useState(false)
  const [pwdLoading, setPwdLoading] = useState(false)
  const [form] = Form.useForm()
  const navigate = useNavigate()
  const location = useLocation()
  const { user, logout } = useAuthStore()
  const { message } = App.useApp()

  const handleLogout = async () => {
    try {
      await adminLogout()
    } catch { /* ignore */ }
    logout()
    navigate('/login')
  }

  const handleChangePwd = async (values: { oldPassword: string; newPassword: string }) => {
    try {
      setPwdLoading(true)
      await changePassword(values)
      message.success('密码修改成功，请重新登录')
      setPwdModalOpen(false)
      setTimeout(() => handleLogout(), 1500)
    } catch { /* handled */ } finally {
      setPwdLoading(false)
    }
  }

  const userMenuItems = [
    {
      key: 'pwd',
      icon: <LockOutlined />,
      label: '修改密码',
      onClick: () => setPwdModalOpen(true),
    },
    { type: 'divider' as const },
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: '退出登录',
      onClick: handleLogout,
    },
  ]

  const currentLabel = routeLabelMap[location.pathname] || ''

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider
        trigger={null}
        collapsible
        collapsed={collapsed}
        style={{ background: '#fff', boxShadow: '2px 0 8px rgba(0,0,0,0.06)' }}
        width={220}
      >
        <div
          style={{
            height: 64,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            borderBottom: '1px solid #f0f0f0',
            overflow: 'hidden',
          }}
        >
          <span style={{ fontSize: 24 }}>🐝</span>
          {!collapsed && (
            <span style={{ marginLeft: 8, fontWeight: 700, color: '#f5a623', fontSize: 15 }}>
              蜂农管理平台
            </span>
          )}
        </div>
        <Menu
          mode="inline"
          selectedKeys={[location.pathname]}
          defaultOpenKeys={[
            '/beekeepers',
            '/production',
            '/subsidy',
            '/system',
          ]}
          items={menuItems}
          onClick={({ key }) => navigate(key)}
          style={{ border: 'none', flex: 1 }}
        />
      </Sider>

      <Layout>
        <Header
          style={{
            background: '#fff',
            padding: '0 24px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
            height: 64,
          }}
        >
          <Space>
            <Button
              type="text"
              icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
              onClick={() => setCollapsed(!collapsed)}
            />
            <Breadcrumb
              items={[{ title: '首页' }, { title: currentLabel }]}
            />
          </Space>

          <Dropdown menu={{ items: userMenuItems }} placement="bottomRight">
            <Space style={{ cursor: 'pointer' }}>
              <Badge dot>
                <Avatar icon={<UserOutlined />} style={{ background: '#f5a623' }} />
              </Badge>
              <span style={{ color: '#333' }}>{user?.realName || user?.username}</span>
            </Space>
          </Dropdown>
        </Header>

        <Content style={{ margin: 24, background: '#f5f7fa', minHeight: 'calc(100vh - 64px - 48px)' }}>
          <Outlet />
        </Content>
      </Layout>

      {/* 修改密码弹窗 */}
      <Modal
        title="修改密码"
        open={pwdModalOpen}
        onCancel={() => setPwdModalOpen(false)}
        footer={null}
      >
        <Form form={form} layout="vertical" onFinish={handleChangePwd} style={{ marginTop: 16 }}>
          <Form.Item name="oldPassword" label="当前密码" rules={[{ required: true }]}>
            <Input.Password />
          </Form.Item>
          <Form.Item
            name="newPassword"
            label="新密码"
            rules={[{ required: true, min: 8, message: '密码不少于8位' }]}
          >
            <Input.Password />
          </Form.Item>
          <Form.Item
            name="confirm"
            label="确认新密码"
            dependencies={['newPassword']}
            rules={[
              { required: true },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || getFieldValue('newPassword') === value) {
                    return Promise.resolve()
                  }
                  return Promise.reject(new Error('两次密码不一致'))
                },
              }),
            ]}
          >
            <Input.Password />
          </Form.Item>
          <Button type="primary" htmlType="submit" block loading={pwdLoading} style={{ background: '#f5a623' }}>
            确认修改
          </Button>
        </Form>
      </Modal>
    </Layout>
  )
}

export default AdminLayout
