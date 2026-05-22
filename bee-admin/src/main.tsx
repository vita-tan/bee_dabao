import React from 'react'
import ReactDOM from 'react-dom/client'
import { ConfigProvider } from 'antd'
import zhCN from 'antd/locale/zh_CN'
import 'dayjs/locale/zh-cn'
import AppRouter from './router'
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
      <AppRouter />
    </ConfigProvider>
  </React.StrictMode>,
)
