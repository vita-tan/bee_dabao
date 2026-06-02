import React from 'react'
import ReactDOM from 'react-dom/client'
import { App, ConfigProvider } from 'antd'
import zhCN from 'antd/locale/zh_CN'
import 'dayjs/locale/zh-cn'
import AppRouter from './router'
import AppMessageInjector from './components/AppMessageInjector'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ConfigProvider
      locale={zhCN}
      theme={{
        token: {
          colorPrimary: '#f5a623',
          colorLink: '#f5a623',
          borderRadius: 6,
        },
      }}
    >
      <App>
        <AppMessageInjector />
        <AppRouter />
      </App>
    </ConfigProvider>
  </React.StrictMode>,
)
