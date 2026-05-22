import React from 'react'
import { Card, Result } from 'antd'

interface Props {
  title?: string
}

const PlaceholderPage: React.FC<Props> = ({ title = '功能开发中' }) => (
  <Card>
    <Result status="info" title={title} subTitle="此模块正在开发中，敬请期待" />
  </Card>
)

export default PlaceholderPage
