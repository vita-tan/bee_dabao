/**
 * 将 App.useApp() 的 message 实例注入到全局代理
 * 必须作为 antd App 组件的子组件挂载
 */
import { useEffect } from 'react'
import { App } from 'antd'
import { injectMessage } from '@/utils/globalMessage'

export default function AppMessageInjector() {
  const { message } = App.useApp()
  useEffect(() => {
    injectMessage(message)
  }, [message])
  return null
}
