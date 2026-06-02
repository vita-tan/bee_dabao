/**
 * 全局 message 代理
 * antd v5/v6 的静态方法无法消费动态主题，
 * 通过此文件暴露一个可被 App 组件注入的 message 实例。
 */
import type { MessageInstance, JointContent } from 'antd/es/message/interface'

let _message: MessageInstance | null = null

export function injectMessage(instance: MessageInstance) {
  _message = instance
}

const noopMessage = (): any => ({
  then: () => {},
})

const globalMessage: MessageInstance = {
  success: (content: JointContent, duration?: number | VoidFunction, onClose?: VoidFunction) =>
    _message ? _message.success(content, duration, onClose) : noopMessage(),
  error: (content: JointContent, duration?: number | VoidFunction, onClose?: VoidFunction) =>
    _message ? _message.error(content, duration, onClose) : noopMessage(),
  warning: (content: JointContent, duration?: number | VoidFunction, onClose?: VoidFunction) =>
    _message ? _message.warning(content, duration, onClose) : noopMessage(),
  info: (content: JointContent, duration?: number | VoidFunction, onClose?: VoidFunction) =>
    _message ? _message.info(content, duration, onClose) : noopMessage(),
  loading: (content: JointContent, duration?: number | VoidFunction, onClose?: VoidFunction) =>
    _message ? _message.loading(content, duration, onClose) : noopMessage(),
  open: (args) => _message ? _message.open(args) : noopMessage(),
  destroy: (key?) => _message?.destroy(key),
}

export default globalMessage
