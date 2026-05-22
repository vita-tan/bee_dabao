import React, { useState } from 'react'
import {
  Card,
  Table,
  Button,
  Tag,
  Space,
  Modal,
  Form,
  Input,
  Select,
  Switch,
  message,
  DatePicker,
} from 'antd'
import { PlusOutlined } from '@ant-design/icons'
import dayjs from 'dayjs'
import { getNotifications, createNotification, revokeNotification } from '@/api/notification'
import { useRequest } from '@/hooks/useRequest'

const { TextArea } = Input

const typeMap: Record<number, { label: string; color: string }> = {
  1: { label: '政策', color: 'blue' },
  2: { label: '技术指导', color: 'green' },
  3: { label: '疫情预警', color: 'red' },
  4: { label: '市场信息', color: 'orange' },
  5: { label: '其他', color: 'default' },
}

const statusMap: Record<number, { label: string; color: string }> = {
  0: { label: '草稿', color: 'default' },
  1: { label: '已发布', color: 'green' },
  2: { label: '已撤回', color: 'orange' },
}

const NotificationsPage: React.FC = () => {
  const [modalOpen, setModalOpen] = useState(false)
  const [submitLoading, setSubmitLoading] = useState(false)
  const [form] = Form.useForm()

  const { data, loading, refresh } = useRequest(() => getNotifications())

  const handleSubmit = async () => {
    const values = await form.validateFields()
    try {
      setSubmitLoading(true)
      await createNotification({
        ...values,
        publish_time: values.publish_time ? values.publish_time.toISOString() : undefined,
      })
      message.success('发布成功')
      setModalOpen(false)
      form.resetFields()
      refresh()
    } catch { /* handled */ } finally {
      setSubmitLoading(false)
    }
  }

  const handleRevoke = async (id: number) => {
    try {
      await revokeNotification(id)
      message.success('已撤回')
      refresh()
    } catch { /* handled */ }
  }

  const columns = [
    { title: '标题', dataIndex: 'title', key: 'title' },
    {
      title: '类型',
      dataIndex: 'type',
      render: (v: number) => {
        const t = typeMap[v]
        return t ? <Tag color={t.color}>{t.label}</Tag> : '--'
      },
    },
    {
      title: '紧急程度',
      dataIndex: 'urgency',
      render: (v: number) => {
        const map = { 1: '普通', 2: '重要', 3: '紧急' }
        const color = { 1: 'default', 2: 'orange', 3: 'red' }
        return <Tag color={color[v as 1|2|3]}>{map[v as 1|2|3]}</Tag>
      },
    },
    {
      title: '发布时间',
      dataIndex: 'publish_time',
      render: (v: string) => v ? dayjs(v).format('YYYY-MM-DD HH:mm') : '立即发布',
    },
    {
      title: '状态',
      dataIndex: 'status',
      render: (v: number) => {
        const s = statusMap[v]
        return s ? <Tag color={s.color}>{s.label}</Tag> : '--'
      },
    },
    {
      title: '操作',
      render: (_: any, row: any) =>
        row.status === 1 ? (
          <Button type="link" danger size="small" onClick={() => handleRevoke(row.id)}>
            撤回
          </Button>
        ) : null,
    },
  ]

  return (
    <div>
      <Card
        size="small"
        title="通知管理"
        extra={
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => { form.resetFields(); setModalOpen(true) }}
            style={{ background: '#f5a623' }}
          >
            发布通知
          </Button>
        }
      >
        <Table
          rowKey="id"
          loading={loading}
          columns={columns}
          dataSource={data?.list || []}
          size="small"
          pagination={{ total: data?.total, pageSize: 20 }}
        />
      </Card>

      <Modal
        title="发布通知"
        open={modalOpen}
        onOk={handleSubmit}
        onCancel={() => setModalOpen(false)}
        width={680}
        confirmLoading={submitLoading}
        okText="发布"
        okButtonProps={{ style: { background: '#f5a623' } }}
      >
        <Form form={form} layout="vertical" style={{ marginTop: 16 }} initialValues={{ urgency: 1, type: 1 }}>
          <Form.Item name="title" label="通知标题" rules={[{ required: true, max: 50 }]}>
            <Input placeholder="最多50字" />
          </Form.Item>
          <Form.Item name="type" label="通知类型" rules={[{ required: true }]}>
            <Select
              options={[
                { label: '政策', value: 1 },
                { label: '技术指导', value: 2 },
                { label: '疫情预警', value: 3 },
                { label: '市场信息', value: 4 },
                { label: '其他', value: 5 },
              ]}
            />
          </Form.Item>
          <Form.Item name="urgency" label="紧急程度">
            <Select
              options={[
                { label: '普通', value: 1 },
                { label: '重要', value: 2 },
                { label: '紧急', value: 3 },
              ]}
            />
          </Form.Item>
          <Form.Item name="content" label="通知内容" rules={[{ required: true }]}>
            <TextArea rows={5} placeholder="请输入通知内容" />
          </Form.Item>
          <Form.Item name="publish_time" label="定时发布（不填则立即发布）">
            <DatePicker showTime style={{ width: '100%' }} placeholder="选择发布时间" />
          </Form.Item>
          <Form.Item name="region_codes" label="推送区域" rules={[{ required: true }]}>
            <Select
              mode="tags"
              placeholder="输入区划代码，如 330100"
              tokenSeparators={[',']}
            />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  )
}

export default NotificationsPage
