/**
 * 全局 message 代理
 * antd v5/v6 的静态方法无法消费动态主题，
 * 通过此文件暴露一个可被 App 组件注入的 message 实例。
 */
import type { MessageInstance } from 'antd/es/message/interface'

// 默认使用 antd 静态方法（降级兼容），App 组件挂载后会替换为实例方法
let _message: MessageInstance | null = null

// 由 AppMessageInjector 组件在初始化时注入
export function injectMessage(instance: MessageInstance) {
  _message = instance
}

// 供工具函数（如 http.ts）调用
const globalMessage: MessageInstance = {
  success: (...args) => (_message ? _message.success(...args) : Promise.resolve()),
  error: (...args) => (_message ? _message.error(...args) : Promise.resolve()),
  warning: (...args) => (_message ? _message.warning(...args) : Promise.resolve()),
  info: (...args) => (_message ? _message.info(...args) : Promise.resolve()),
  loading: (...args) => (_message ? _message.loading(...args) : Promise.resolve()),
  open: (...args) => (_message ? _message.open(...args) : Promise.resolve()),
  destroy: (key?: string | number) => _message?.destroy(key),
}

export default globalMessage
