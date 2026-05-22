import React, { useState } from 'react'
import { Form, Input, Button, Checkbox, Card, message, Typography } from 'antd'
import { UserOutlined, LockOutlined } from '@ant-design/icons'
import { useNavigate } from 'react-router-dom'
import { adminLogin } from '@/api/auth'
import { useAuthStore } from '@/store/auth.store'

const { Title } = Typography

const LoginPage: React.FC = () => {
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()
  const { setAuth } = useAuthStore()

  const onFinish = async (values: { username: string; password: string; remember: boolean }) => {
    try {
      setLoading(true)
      const result = await adminLogin({ username: values.username, password: values.password })
      setAuth(result.token, result.adminInfo)
      if (values.remember) {
        localStorage.setItem('bee_admin_saved_username', values.username)
      } else {
        localStorage.removeItem('bee_admin_saved_username')
      }
      message.success('登录成功')
      navigate('/')
    } catch {
      // 错误已在 http 拦截器统一处理
    } finally {
      setLoading(false)
    }
  }

  const savedUsername = localStorage.getItem('bee_admin_saved_username') || ''

  return (
    <div
      style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #f5a623 0%, #f7be68 50%, #fce4a6 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <Card
        style={{
          width: 420,
          boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
          borderRadius: 12,
        }}
      >
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{ fontSize: 40, marginBottom: 8 }}>🐝</div>
          <Title level={3} style={{ margin: 0, color: '#f5a623' }}>
            蜂农数字化管理平台
          </Title>
          <p style={{ color: '#888', marginTop: 4 }}>政府管理后台</p>
        </div>

        <Form
          name="login"
          initialValues={{ remember: !!savedUsername, username: savedUsername }}
          onFinish={onFinish}
          size="large"
        >
          <Form.Item
            name="username"
            rules={[{ required: true, message: '请输入用户名' }]}
          >
            <Input prefix={<UserOutlined />} placeholder="用户名" />
          </Form.Item>

          <Form.Item
            name="password"
            rules={[{ required: true, message: '请输入密码' }]}
          >
            <Input.Password prefix={<LockOutlined />} placeholder="密码" />
          </Form.Item>

          <Form.Item>
            <Form.Item name="remember" valuePropName="checked" noStyle>
              <Checkbox>记住用户名</Checkbox>
            </Form.Item>
          </Form.Item>

          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              block
              loading={loading}
              style={{ background: '#f5a623', borderColor: '#f5a623', height: 44 }}
            >
              登 录
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </div>
  )
}

export default LoginPage
