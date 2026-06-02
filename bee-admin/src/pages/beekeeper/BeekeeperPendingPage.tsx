import React, { useState } from 'react'
import {
  Table,
  Button,
  Tag,
  Space,
  Drawer,
  Descriptions,
  Modal,
  Input,
  App,
  Card,
  Badge,
} from 'antd'
import { ExclamationCircleOutlined } from '@ant-design/icons'
import dayjs from 'dayjs'
import { getPendingBeekeepers, approveBeekeper, rejectBeekeeper } from '@/api/beekeeper'
import { useRequest } from '@/hooks/useRequest'

const BeekeeperPendingPage: React.FC = () => {
  const [selectedBk, setSelectedBk] = useState<any>(null)
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [rejectNote, setRejectNote] = useState('')
  const [rejectModalOpen, setRejectModalOpen] = useState(false)
  const { message } = App.useApp()

  const { data: list, loading, refresh } = useRequest(() => getPendingBeekeepers())

  const isUrgent = (createdAt: string) => {
    return dayjs().diff(dayjs(createdAt), 'hour') > 48
  }

  const handleApprove = async (id: number) => {
    try {
      await approveBeekeper(id, {})
      message.success('审核通过')
      setDrawerOpen(false)
      refresh()
    } catch { /* handled */ }
  }

  const handleReject = async () => {
    if (!rejectNote.trim()) {
      message.warning('请填写拒绝原因')
      return
    }
    try {
      await rejectBeekeeper(selectedBk.id, { audit_note: rejectNote })
      message.success('已拒绝')
      setRejectModalOpen(false)
      setDrawerOpen(false)
      refresh()
    } catch { /* handled */ }
  }

  const columns = [
    {
      title: '姓名',
      dataIndex: 'name',
      render: (v: string, row: any) => (
        <Space>
          {isUrgent(row.created_at) && <Badge status="error" />}
          <a onClick={() => { setSelectedBk(row); setDrawerOpen(true) }}>{v}</a>
          {isUrgent(row.created_at) && (
            <Tag color="red" icon={<ExclamationCircleOutlined />}>超时</Tag>
          )}
        </Space>
      ),
    },
    { title: '手机号', dataIndex: 'phone' },
    { title: '地区', dataIndex: 'region' },
    {
      title: '等待时长',
      dataIndex: 'created_at',
      render: (v: string) => {
        const h = dayjs().diff(dayjs(v), 'hour')
        return (
          <span style={{ color: h > 48 ? '#ff4d4f' : '#666' }}>
            {h}小时
          </span>
        )
      },
    },
    { title: '注册时间', dataIndex: 'created_at', render: (v: string) => dayjs(v).format('MM-DD HH:mm') },
    {
      title: '操作',
      render: (_: any, row: any) => (
        <Space>
          <Button
            type="primary"
            size="small"
            style={{ background: '#52c41a', borderColor: '#52c41a' }}
            onClick={() => handleApprove(row.id)}
          >
            通过
          </Button>
          <Button
            danger
            size="small"
            onClick={() => { setSelectedBk(row); setRejectModalOpen(true) }}
          >
            拒绝
          </Button>
        </Space>
      ),
    },
  ]

  return (
    <div>
      <Card size="small" style={{ marginBottom: 8 }}>
        <Space>
          <span>待审核蜂农：<strong style={{ color: '#f5a623' }}>{list?.length || 0}</strong> 位</span>
          {(list?.filter((b: any) => isUrgent(b.created_at)).length ?? 0) > 0 && (
            <Tag color="red">
              {list?.filter((b: any) => isUrgent(b.created_at)).length} 位超48小时待处理
            </Tag>
          )}
        </Space>
      </Card>

      <Card size="small">
        <Table
          rowKey="id"
          loading={loading}
          columns={columns}
          dataSource={list || []}
          rowClassName={(row: any) => isUrgent(row.created_at) ? 'urgent-row' : ''}
          size="small"
          pagination={{ pageSize: 20 }}
        />
      </Card>

      {/* 详情抽屉 */}
      <Drawer
        title="蜂农详情"
        open={drawerOpen}
        width={560}
        onClose={() => setDrawerOpen(false)}
        extra={
          selectedBk && (
            <Space>
              <Button
                type="primary"
                style={{ background: '#52c41a', borderColor: '#52c41a' }}
                onClick={() => handleApprove(selectedBk.id)}
              >
                通过
              </Button>
              <Button
                danger
                onClick={() => setRejectModalOpen(true)}
              >
                拒绝
              </Button>
            </Space>
          )
        }
      >
        {selectedBk && (
          <Descriptions column={2} bordered size="small">
            <Descriptions.Item label="姓名">{selectedBk.name}</Descriptions.Item>
            <Descriptions.Item label="手机号">{selectedBk.phone}</Descriptions.Item>
            <Descriptions.Item label="地区" span={2}>{selectedBk.region}</Descriptions.Item>
            <Descriptions.Item label="身份证">{selectedBk.id_card}</Descriptions.Item>
            <Descriptions.Item label="养蜂年限">{selectedBk.exp_years} 年</Descriptions.Item>
            <Descriptions.Item label="蜂种">{selectedBk.bee_breed || '--'}</Descriptions.Item>
            <Descriptions.Item label="蜂农证号">{selectedBk.cert_no || '--'}</Descriptions.Item>
            <Descriptions.Item label="注册时间" span={2}>
              {dayjs(selectedBk.created_at).format('YYYY-MM-DD HH:mm')}
            </Descriptions.Item>
          </Descriptions>
        )}
      </Drawer>

      {/* 拒绝弹窗 */}
      <Modal
        title="拒绝审核"
        open={rejectModalOpen}
        onOk={handleReject}
        onCancel={() => setRejectModalOpen(false)}
        okButtonProps={{ danger: true }}
        okText="确认拒绝"
      >
        <Input.TextArea
          rows={4}
          placeholder="请填写拒绝原因（必填）"
          value={rejectNote}
          onChange={(e) => setRejectNote(e.target.value)}
          style={{ marginTop: 12 }}
        />
      </Modal>

      <style>{`.urgent-row { background: #fff1f0; }`}</style>
    </div>
  )
}

export default BeekeeperPendingPage
