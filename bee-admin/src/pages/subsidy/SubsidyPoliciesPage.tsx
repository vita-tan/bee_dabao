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
  DatePicker,
  InputNumber,
  Select,
  App,
  Row,
  Col,
  Popconfirm,
} from 'antd'
import { PlusOutlined } from '@ant-design/icons'
import dayjs from 'dayjs'
import {
  getSubsidyPolicies,
  createSubsidyPolicy,
  updateSubsidyPolicy,
  publishSubsidyPolicy,
  closeSubsidyPolicy,
} from '@/api/subsidy'
import { useRequest } from '@/hooks/useRequest'

const { TextArea } = Input
const { RangePicker } = DatePicker

const statusMap: Record<number, { label: string; color: string }> = {
  0: { label: '草稿', color: 'default' },
  1: { label: '已发布', color: 'green' },
  2: { label: '已结束', color: 'orange' },
}

const SubsidyPoliciesPage: React.FC = () => {
  const [modalOpen, setModalOpen] = useState(false)
  const [editingPolicy, setEditingPolicy] = useState<any>(null)
  const [form] = Form.useForm()
  const { message } = App.useApp()
  const { data, loading, refresh } = useRequest(() => getSubsidyPolicies())

  const handleOpenCreate = () => {
    form.resetFields()
    setEditingPolicy(null)
    setModalOpen(true)
  }

  const handleOpenEdit = (policy: any) => {
    setEditingPolicy(policy)
    form.setFieldsValue({
      ...policy,
      applyRange: [dayjs(policy.apply_start), dayjs(policy.apply_end)],
    })
    setModalOpen(true)
  }

  const handleSubmit = async () => {
    const values = await form.validateFields()
    const { applyRange, ...rest } = values
    const payload = {
      ...rest,
      apply_start: applyRange[0].toISOString(),
      apply_end: applyRange[1].toISOString(),
    }
    try {
      if (editingPolicy) {
        await updateSubsidyPolicy(editingPolicy.id, payload)
        message.success('编辑成功')
      } else {
        await createSubsidyPolicy(payload)
        message.success('创建成功')
      }
      setModalOpen(false)
      refresh()
    } catch { /* handled */ }
  }

  const handlePublish = async (id: number) => {
    try {
      await publishSubsidyPolicy(id)
      message.success('发布成功')
      refresh()
    } catch { /* handled */ }
  }

  const handleClose = async (id: number) => {
    try {
      await closeSubsidyPolicy(id)
      message.success('已关闭')
      refresh()
    } catch { /* handled */ }
  }

  const columns = [
    { title: '政策名称', dataIndex: 'name', key: 'name' },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (v: number) => {
        const s = statusMap[v]
        return s ? <Tag color={s.color}>{s.label}</Tag> : '--'
      },
    },
    {
      title: '预算(元)',
      dataIndex: 'total_budget',
      key: 'total_budget',
      render: (v: number) => v?.toLocaleString(),
    },
    {
      title: '申请时间',
      key: 'range',
      render: (_: any, row: any) =>
        `${dayjs(row.apply_start).format('MM-DD')} ~ ${dayjs(row.apply_end).format('MM-DD')}`,
    },
    {
      title: '创建时间',
      dataIndex: 'created_at',
      render: (v: string) => dayjs(v).format('YYYY-MM-DD'),
    },
    {
      title: '操作',
      render: (_: any, row: any) => (
        <Space>
          {row.status === 0 && (
            <>
              <Button type="link" size="small" onClick={() => handleOpenEdit(row)}>编辑</Button>
              <Popconfirm title="确认发布该政策？" onConfirm={() => handlePublish(row.id)}>
                <Button type="link" size="small" style={{ color: '#52c41a' }}>发布</Button>
              </Popconfirm>
            </>
          )}
          {row.status === 1 && (
            <Popconfirm title="确认关闭该政策？" onConfirm={() => handleClose(row.id)}>
              <Button type="link" danger size="small">关闭</Button>
            </Popconfirm>
          )}
        </Space>
      ),
    },
  ]

  return (
    <div>
      <Card
        size="small"
        title="补贴政策管理"
        extra={
          <Button type="primary" icon={<PlusOutlined />} onClick={handleOpenCreate} style={{ background: '#f5a623' }}>
            新建政策
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

      {/* 新建/编辑 Modal */}
      <Modal
        title={editingPolicy ? '编辑政策' : '新建政策'}
        open={modalOpen}
        onOk={handleSubmit}
        onCancel={() => setModalOpen(false)}
        width={700}
        okText="保存"
        okButtonProps={{ style: { background: '#f5a623' } }}
      >
        <Form form={form} layout="vertical" style={{ marginTop: 16 }}>
          <Form.Item name="name" label="政策名称" rules={[{ required: true, max: 200 }]}>
            <Input placeholder="请输入政策名称" />
          </Form.Item>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="total_budget" label="总预算(元)" rules={[{ required: true }]}>
                <InputNumber min={0} style={{ width: '100%' }} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="applyRange" label="申请时间" rules={[{ required: true }]}>
                <RangePicker style={{ width: '100%' }} showTime />
              </Form.Item>
            </Col>
          </Row>
          <Form.Item name="standard" label="补贴标准" rules={[{ required: true }]}>
            <TextArea rows={3} placeholder="如：每箱蜂群补贴200元" />
          </Form.Item>
          <Form.Item name="conditions" label="申请条件">
            <TextArea rows={2} placeholder="申请资格条件" />
          </Form.Item>
          <Form.Item name="materials" label="所需材料">
            <TextArea rows={2} placeholder="需要提交的证明材料" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  )
}

export default SubsidyPoliciesPage
