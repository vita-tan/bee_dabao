import React, { useState } from 'react'
import {
  Table,
  Button,
  Input,
  Select,
  Space,
  Card,
  Tag,
  InputNumber,
  DatePicker,
  Row,
  Col,
  Popconfirm,
  App,
} from 'antd'
import { SearchOutlined, ReloadOutlined } from '@ant-design/icons'
import { useNavigate } from 'react-router-dom'
import dayjs from 'dayjs'
import { getBeekeeperList, freezeBeekeeper } from '@/api/beekeeper'
import { useRequest } from '@/hooks/useRequest'

const { RangePicker } = DatePicker

const statusMap: Record<number, { label: string; color: string }> = {
  0: { label: '待审核', color: 'orange' },
  1: { label: '正常', color: 'green' },
  2: { label: '冻结', color: 'red' },
  3: { label: '已拒绝', color: 'default' },
}

const levelMap: Record<number, string> = {
  1: '散户',
  2: '专业',
  3: '企业',
}

const BeekeeperListPage: React.FC = () => {
  const navigate = useNavigate()
  const { message } = App.useApp()
  const [params, setParams] = useState<any>({ page: 1, pageSize: 20 })
  const [searchKw, setSearchKw] = useState('')
  const [status, setStatus] = useState<number | undefined>()
  const [dateRange, setDateRange] = useState<any>(null)

  const { data, loading, refresh } = useRequest(
    () => getBeekeeperList(params),
    [JSON.stringify(params)],
  )

  const handleSearch = () => {
    setParams({
      ...params,
      page: 1,
      keyword: searchKw || undefined,
      status,
      registerStart: dateRange?.[0] ? dayjs(dateRange[0]).format('YYYY-MM-DD') : undefined,
      registerEnd: dateRange?.[1] ? dayjs(dateRange[1]).format('YYYY-MM-DD') : undefined,
    })
  }

  const handleReset = () => {
    setSearchKw('')
    setStatus(undefined)
    setDateRange(null)
    setParams({ page: 1, pageSize: 20 })
  }

  const handleFreeze = async (id: number, freeze: boolean) => {
    try {
      await freezeBeekeeper(id, { freeze, reason: freeze ? '管理员冻结' : '管理员解冻' })
      message.success(freeze ? '已冻结' : '已解冻')
      refresh()
    } catch { /* handled */ }
  }

  const columns = [
    {
      title: '姓名',
      dataIndex: 'name',
      key: 'name',
      render: (v: string, row: any) => (
        <a onClick={() => navigate(`/beekeepers/${row.id}`)}>{v}</a>
      ),
    },
    { title: '手机号', dataIndex: 'phone', key: 'phone' },
    { title: '地区', dataIndex: 'region', key: 'region' },
    {
      title: '类型',
      dataIndex: 'level',
      key: 'level',
      render: (v: number) => levelMap[v] || '--',
    },
    { title: '蜂场数', dataIndex: 'apiary_count', key: 'apiary_count' },
    { title: '蜂群数', dataIndex: 'colony_count', key: 'colony_count' },
    {
      title: '信用分',
      dataIndex: 'credit_score',
      key: 'credit_score',
      render: (v: number) => (
        <span style={{ color: v >= 80 ? '#52c41a' : v >= 60 ? '#f5a623' : '#ff4d4f', fontWeight: 600 }}>
          {v}
        </span>
      ),
    },
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
      title: '注册时间',
      dataIndex: 'created_at',
      key: 'created_at',
      render: (v: string) => v ? dayjs(v).format('YYYY-MM-DD') : '--',
    },
    {
      title: '操作',
      key: 'action',
      render: (_: any, row: any) => (
        <Space>
          <Button type="link" size="small" onClick={() => navigate(`/beekeepers/${row.id}`)}>
            详情
          </Button>
          {row.status === 1 && (
            <Popconfirm
              title="确认冻结该蜂农？"
              onConfirm={() => handleFreeze(row.id, true)}
            >
              <Button type="link" danger size="small">冻结</Button>
            </Popconfirm>
          )}
          {row.status === 2 && (
            <Popconfirm
              title="确认解冻该蜂农？"
              onConfirm={() => handleFreeze(row.id, false)}
            >
              <Button type="link" size="small">解冻</Button>
            </Popconfirm>
          )}
        </Space>
      ),
    },
  ]

  return (
    <div>
      {/* 搜索区 */}
      <Card style={{ marginBottom: 16 }} size="small">
        <Row gutter={12} align="middle">
          <Col>
            <Input
              placeholder="姓名/手机号"
              value={searchKw}
              onChange={(e) => setSearchKw(e.target.value)}
              style={{ width: 200 }}
              prefix={<SearchOutlined />}
              onPressEnter={handleSearch}
            />
          </Col>
          <Col>
            <Select
              placeholder="认证状态"
              value={status}
              onChange={setStatus}
              style={{ width: 120 }}
              allowClear
              options={[
                { label: '待审核', value: 0 },
                { label: '正常', value: 1 },
                { label: '冻结', value: 2 },
              ]}
            />
          </Col>
          <Col>
            <InputNumber placeholder="信用分最低" min={0} max={100} style={{ width: 120 }} />
          </Col>
          <Col>
            <RangePicker
              value={dateRange}
              onChange={setDateRange}
              placeholder={['注册开始', '注册结束']}
              style={{ width: 240 }}
            />
          </Col>
          <Col>
            <Space>
              <Button
                type="primary"
                icon={<SearchOutlined />}
                onClick={handleSearch}
                style={{ background: '#f5a623' }}
              >
                搜索
              </Button>
              <Button icon={<ReloadOutlined />} onClick={handleReset}>重置</Button>
            </Space>
          </Col>
        </Row>
      </Card>

      {/* 表格 */}
      <Card size="small">
        <Table
          rowKey="id"
          loading={loading}
          columns={columns}
          dataSource={data?.list || []}
          pagination={{
            total: data?.total || 0,
            current: params.page,
            pageSize: params.pageSize,
            showTotal: (t) => `共 ${t} 条`,
            onChange: (page, pageSize) => setParams({ ...params, page, pageSize }),
          }}
          size="small"
        />
      </Card>
    </div>
  )
}

export default BeekeeperListPage
