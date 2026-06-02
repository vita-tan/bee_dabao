<template>
  <div class="trace-page">
    <!-- 加载中 -->
    <div v-if="loading" class="loading-wrap">
      <van-loading type="spinner" size="36px" color="#F5A623" />
      <p>正在查询溯源信息…</p>
    </div>

    <!-- 异常状态：溯源码无效 -->
    <ErrorPage
      v-else-if="errorType === 'not_found'"
      type="not_found"
    />

    <!-- 异常状态：已召回 -->
    <ErrorPage
      v-else-if="errorType === 'recalled'"
      type="recalled"
    />

    <!-- 正常内容 -->
    <template v-else-if="traceData">
      <!-- 高频扫码警告横幅 -->
      <div v-if="showHighScanBanner" class="high-scan-banner">
        <van-icon name="warning-o" />
        此二维码扫描次数异常，请注意真伪
      </div>

      <!-- ① 产品头部 -->
      <div class="product-header">
        <!-- 照片轮播 -->
        <van-swipe
          class="product-swipe"
          :autoplay="3000"
          indicator-color="#F5A623"
          lazy-render
        >
          <van-swipe-item
            v-for="(img, i) in productPhotos"
            :key="i"
          >
            <img :src="img" class="product-img" :alt="`产品图${i + 1}`" />
          </van-swipe-item>
          <van-swipe-item v-if="!productPhotos.length">
            <div class="product-img-placeholder">
              <van-icon name="photo-o" size="48" color="#ccc" />
            </div>
          </van-swipe-item>
        </van-swipe>

        <!-- 基本信息 -->
        <div class="product-info">
          <h2 class="product-name">{{ traceData.product_name }}</h2>
          <div class="product-meta">
            <span>规格：{{ traceData.spec }}</span>
            <span>生产日期：{{ traceData.produce_date }}</span>
          </div>
          <div class="product-code">
            <span class="code-label">溯源码</span>
            <span class="code-value">{{ traceData.code }}</span>
          </div>
          <!-- 真伪验证 -->
          <div class="verify-badge">
            <van-icon name="shield-o" size="18" color="#2ECC71" />
            <span class="verify-text">正品验证</span>
            <span class="verify-sub">已通过政府平台认证</span>
          </div>
        </div>
      </div>

      <!-- ② 蜂农信息 -->
      <div class="card section-beekeeper">
        <div class="section-title">蜂农信息</div>
        <div class="beekeeper-row">
          <van-image
            round
            width="56px"
            height="56px"
            :src="beekeeper.avatar || defaultAvatar"
            fit="cover"
          />
          <div class="beekeeper-info">
            <div class="beekeeper-name">{{ beekeeper.name }}</div>
            <div class="beekeeper-sub">{{ beekeeper.region }} · 养蜂 {{ beekeeper.exp_years }} 年</div>
            <div class="beekeeper-tags">
              <span v-if="beekeeper.cert_no" class="tag tag-success">
                <van-icon name="certificate" size="12" /> 持证蜂农
              </span>
              <span v-else class="tag tag-warning">未认证</span>
              <span class="tag tag-success" style="margin-left:6px">
                信用分 {{ beekeeper.credit_score }}
              </span>
            </div>
          </div>
        </div>
      </div>

      <!-- ③ 蜂场信息 -->
      <div class="card section-apiary">
        <div class="section-title">蜂场信息</div>
        <div class="apiary-name">{{ apiary.name }}</div>
        <div class="apiary-addr">
          <van-icon name="location-o" color="#F5A623" />
          {{ apiary.address }}
        </div>
        <!-- 蜂场照片横滑 -->
        <div v-if="apiary.photos?.length" class="apiary-photos">
          <img
            v-for="(p, i) in apiary.photos.slice(0, 3)"
            :key="i"
            :src="p"
            class="apiary-photo"
          />
        </div>
        <!-- 腾讯地图静态图 -->
        <div v-if="apiary.latitude && apiary.longitude" class="map-wrap">
          <img
            :src="staticMapUrl"
            class="static-map"
            alt="蜂场位置"
          />
          <div class="map-label">蜂场位置</div>
        </div>
      </div>

      <!-- ④ 生产过程时间线 -->
      <div class="card section-timeline">
        <div class="section-title">生产过程</div>
        <van-steps direction="vertical" :active="timelineItems.length - 1" active-color="#F5A623">
          <van-step
            v-for="(item, i) in timelineItems"
            :key="i"
          >
            <div class="timeline-title">{{ item.title }}</div>
            <div class="timeline-desc">{{ item.desc }}</div>
            <div class="timeline-time">{{ item.time }}</div>
          </van-step>
        </van-steps>
      </div>

      <!-- ⑤ 品质说明 -->
      <div class="card section-quality">
        <div class="section-title">品质说明</div>
        <div class="quality-item">
          <div class="quality-key">波美度</div>
          <div class="quality-val">
            <span class="baume-num">{{ traceData.trace_data?.baume_degree ?? '—' }}°</span>
            <span v-if="isMaturHoney" class="tag tag-success" style="margin-left:8px">成熟蜜</span>
            <span v-else class="tag tag-warning" style="margin-left:8px">普通蜜</span>
          </div>
          <div class="quality-note">≥41°为成熟蜜标准（国际标准）</div>
        </div>
        <div class="quality-item">
          <div class="quality-key">蜜源描述</div>
          <div class="quality-val">{{ apiary.honey_source || '—' }}</div>
        </div>
        <div v-if="traceData.trace_data?.process_notes" class="quality-item">
          <div class="quality-key">加工过程</div>
          <div class="quality-val">{{ traceData.trace_data.process_notes }}</div>
        </div>
        <div v-if="traceData.trace_data?.quality_info?.description" class="quality-item">
          <div class="quality-key">特色说明</div>
          <div class="quality-val">{{ traceData.trace_data.quality_info.description }}</div>
        </div>
      </div>

      <!-- 底部操作栏 -->
      <div class="bottom-bar safe-bottom">
        <van-button
          type="default"
          icon="share-o"
          size="normal"
          class="btn-share"
          @click="handleShare"
        >
          分享给朋友
        </van-button>
        <van-button
          type="default"
          icon="warning-o"
          size="normal"
          class="btn-report"
          @click="showReport = true"
        >
          投诉举报
        </van-button>
      </div>

      <!-- 举报弹窗 -->
      <van-popup
        v-model:show="showReport"
        position="bottom"
        round
        :style="{ padding: '20px 16px' }"
      >
        <div class="report-title">投诉举报</div>
        <van-field
          v-model="reportContent"
          type="textarea"
          placeholder="请描述您遇到的问题（最多200字）"
          :maxlength="200"
          show-word-limit
          rows="4"
          class="report-textarea"
        />
        <div class="report-actions">
          <van-button type="default" @click="showReport = false">取消</van-button>
          <van-button type="primary" color="#F5A623" :loading="reportLoading" @click="submitReport">
            提交举报
          </van-button>
        </div>
      </van-popup>
    </template>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import {
  showToast, showSuccessToast,
} from 'vant'
import http from '@/utils/http'
import ErrorPage from '@/components/ErrorPage.vue'

// ─── 类型 ────────────────────────────────────────────────────────────────────
interface TraceData {
  code: string
  product_name: string
  spec: string
  produce_date: string
  shelf_life_months: number
  batch_no: string
  scan_count: number
  status: number
  valid: boolean
  warning?: string
  reason?: string
  trace_data: {
    beekeeper: BeekeeperInfo
    apiary: ApiaryInfo
    harvest: HarvestInfo
    medications: MedicationInfo[]
    inspections: InspectionInfo[]
    process_notes?: string
    quality_info?: { description?: string; baume_degree?: number }
    baume_degree?: number
  }
}

interface BeekeeperInfo {
  name: string
  avatar?: string
  region?: string
  province: string
  city: string
  district: string
  exp_years: number
  cert_no?: string
  credit_score: number
}

interface ApiaryInfo {
  name: string
  address: string
  latitude?: number
  longitude?: number
  photos?: string[]
  honey_source?: string
  established_at?: string
}

interface HarvestInfo {
  harvest_date: string
  honey_type: string
  quantity: number
  baume_degree?: number
}

interface MedicationInfo {
  drug_name: string
  withdraw_end: string
  disease_name: string
}

interface InspectionInfo {
  inspect_date: string
  overall_health: number
  notes?: string
}

// ─── 状态 ────────────────────────────────────────────────────────────────────
const route = useRoute()
const loading = ref(true)
const errorType = ref<'not_found' | 'recalled' | null>(null)
const traceData = ref<TraceData | null>(null)
const showReport = ref(false)
const reportContent = ref('')
const reportLoading = ref(false)
const defaultAvatar = 'https://img01.yzcdn.cn/vant/cat.jpeg'

// ─── 计算属性 ─────────────────────────────────────────────────────────────────
const beekeeper = computed<BeekeeperInfo>(() => traceData.value?.trace_data?.beekeeper ?? {
  name: '—', exp_years: 0, credit_score: 0, province: '', city: '', district: '',
})

const apiary = computed<ApiaryInfo>(() => traceData.value?.trace_data?.apiary ?? {
  name: '—', address: '—',
})

const productPhotos = computed<string[]>(() => {
  const photos = traceData.value?.trace_data?.harvest
  return [] // 实际可从 harvest photos 字段取
})

const showHighScanBanner = computed(() => traceData.value?.warning === 'high_scan_count')

const staticMapUrl = computed(() => {
  if (!apiary.value.latitude || !apiary.value.longitude) return ''
  const { latitude: lat, longitude: lng } = apiary.value
  // 腾讯地图静态图 API
  return `https://apis.map.qq.com/ws/staticmap/v2/?size=600x300&center=${lat},${lng}&zoom=14&markers=size:large|color:0xF5A623|label:蜂|${lat},${lng}&key=YOUR_TENCENT_MAP_KEY`
})

const isMaturHoney = computed(() => {
  const baume = traceData.value?.trace_data?.baume_degree
    ?? traceData.value?.trace_data?.harvest?.baume_degree
  return baume != null && baume >= 41
})

// 生产时间线
const timelineItems = computed(() => {
  if (!traceData.value) return []
  const items: { title: string; desc: string; time: string }[] = []
  const td = traceData.value.trace_data

  // 蜂场建立
  if (td.apiary?.established_at) {
    items.push({
      title: '蜂场建立',
      desc: `${td.apiary.name} · ${td.apiary.address}`,
      time: td.apiary.established_at,
    })
  }

  // 巡查记录（最近3条 overall_health=1 的）
  const goodInspects = (td.inspections ?? [])
    .filter((i) => i.overall_health === 1)
    .slice(0, 3)
  goodInspects.forEach((ins) => {
    items.push({
      title: '蜂场巡查',
      desc: `健康状态：良好${ins.notes ? '，' + ins.notes : ''}`,
      time: ins.inspect_date,
    })
  })

  // 用药记录
  ;(td.medications ?? []).forEach((med) => {
    items.push({
      title: `用药记录（${med.disease_name}）`,
      desc: `已完成停药期，停药截止：${med.withdraw_end}`,
      time: med.withdraw_end,
    })
  })

  // 采蜜
  if (td.harvest) {
    items.push({
      title: '采蜜',
      desc: `${td.harvest.honey_type} · ${td.harvest.quantity}kg${td.harvest.baume_degree ? '，波美度 ' + td.harvest.baume_degree + '°' : ''}`,
      time: td.harvest.harvest_date,
    })
  }

  // 加工
  if (td.process_notes) {
    items.push({
      title: '加工',
      desc: td.process_notes,
      time: traceData.value.produce_date,
    })
  }

  return items
})

// ─── 方法 ────────────────────────────────────────────────────────────────────
async function fetchTrace() {
  loading.value = true
  const code = route.params.code as string
  try {
    const res = await http.get(`/trace/${code}`)
    if (!res.data?.valid) {
      errorType.value = res.data?.reason === 'recalled' ? 'recalled' : 'not_found'
    } else {
      traceData.value = res.data
      // 配置微信分享
      setupWxShare(res.data)
    }
  } catch (e: any) {
    errorType.value = 'not_found'
  } finally {
    loading.value = false
  }
}

function setupWxShare(data: TraceData) {
  if (!(window as any).wx) return
  const wx = (window as any).wx
  // 实际项目中需先调后端接口获取签名
  wx.ready(() => {
    wx.updateAppMessageShareData({
      title: `${data.product_name} 蜂农数字化溯源`,
      desc: `溯源码：${data.code}，扫码查看完整溯源信息`,
      link: window.location.href,
      imgUrl: productPhotos.value[0] || '',
      success: () => {},
    })
  })
}

function handleShare() {
  showToast('请点击右上角"···"分享给朋友')
}

async function submitReport() {
  if (!reportContent.value.trim()) {
    showToast('请输入举报内容')
    return
  }
  reportLoading.value = true
  try {
    await http.post('/common/report', {
      code: traceData.value?.code,
      content: reportContent.value,
    })
    showSuccessToast('举报已提交，感谢您的反馈')
    showReport.value = false
    reportContent.value = ''
  } catch {
    // 错误已在 http 拦截器处理
  } finally {
    reportLoading.value = false
  }
}

onMounted(() => {
  fetchTrace()
})
</script>

<style scoped>
.trace-page {
  background: var(--color-bg);
  min-height: 100vh;
  padding-bottom: 80px;
}

/* 加载 */
.loading-wrap {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 60vh;
  gap: 16px;
  color: var(--color-text-sub);
  font-size: 14px;
}

/* 高频扫码横幅 */
.high-scan-banner {
  background: #fff8e6;
  color: #e6a817;
  padding: 10px 16px;
  font-size: 13px;
  display: flex;
  align-items: center;
  gap: 6px;
  border-bottom: 1px solid #ffe58f;
}

/* 产品头部 */
.product-header {
  background: var(--color-card);
  margin-bottom: 12px;
}

.product-swipe {
  height: 240px;
}

.product-img {
  width: 100%;
  height: 240px;
  object-fit: cover;
}

.product-img-placeholder {
  width: 100%;
  height: 240px;
  background: #f5f5f5;
  display: flex;
  align-items: center;
  justify-content: center;
}

.product-info {
  padding: 16px;
}

.product-name {
  font-size: 20px;
  font-weight: 700;
  color: #222;
  margin-bottom: 8px;
}

.product-meta {
  display: flex;
  gap: 16px;
  font-size: 13px;
  color: var(--color-text-sub);
  margin-bottom: 10px;
}

.product-code {
  display: flex;
  align-items: center;
  gap: 8px;
  background: var(--color-primary-light);
  border-radius: 6px;
  padding: 8px 12px;
  margin-bottom: 12px;
}

.code-label {
  font-size: 12px;
  color: var(--color-primary);
  font-weight: 500;
}

.code-value {
  font-size: 13px;
  font-family: monospace;
  color: #333;
  letter-spacing: 1px;
}

.verify-badge {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 12px;
  background: #e8f8f0;
  border-radius: 8px;
  border: 1px solid #b7ecd0;
}

.verify-text {
  font-size: 14px;
  font-weight: 600;
  color: var(--color-success);
}

.verify-sub {
  font-size: 12px;
  color: #66bb8a;
}

/* 蜂农 */
.section-beekeeper .beekeeper-row {
  display: flex;
  gap: 14px;
  align-items: flex-start;
}

.beekeeper-info {
  flex: 1;
}

.beekeeper-name {
  font-size: 16px;
  font-weight: 600;
  margin-bottom: 4px;
}

.beekeeper-sub {
  font-size: 13px;
  color: var(--color-text-sub);
  margin-bottom: 8px;
}

.beekeeper-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

/* 蜂场 */
.apiary-name {
  font-size: 15px;
  font-weight: 600;
  margin-bottom: 6px;
}

.apiary-addr {
  font-size: 13px;
  color: var(--color-text-sub);
  display: flex;
  align-items: center;
  gap: 4px;
  margin-bottom: 12px;
}

.apiary-photos {
  display: flex;
  gap: 8px;
  overflow-x: auto;
  margin-bottom: 12px;
  padding-bottom: 4px;
}

.apiary-photo {
  width: 100px;
  height: 80px;
  border-radius: 8px;
  object-fit: cover;
  flex-shrink: 0;
}

.map-wrap {
  position: relative;
  border-radius: 10px;
  overflow: hidden;
}

.static-map {
  width: 100%;
  height: 160px;
  object-fit: cover;
  display: block;
}

.map-label {
  position: absolute;
  bottom: 8px;
  left: 50%;
  transform: translateX(-50%);
  background: rgba(0, 0, 0, 0.5);
  color: #fff;
  font-size: 12px;
  padding: 2px 10px;
  border-radius: 10px;
}

/* 时间线 */
.timeline-title {
  font-size: 14px;
  font-weight: 600;
  color: #333;
}

.timeline-desc {
  font-size: 12px;
  color: #666;
  margin-top: 3px;
  line-height: 1.5;
}

.timeline-time {
  font-size: 11px;
  color: #aaa;
  margin-top: 4px;
}

/* 品质 */
.quality-item {
  padding: 10px 0;
  border-bottom: 1px solid var(--color-border);
}

.quality-item:last-child {
  border-bottom: none;
}

.quality-key {
  font-size: 12px;
  color: var(--color-text-sub);
  margin-bottom: 4px;
}

.quality-val {
  font-size: 14px;
  color: #333;
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 4px;
}

.baume-num {
  font-size: 22px;
  font-weight: 700;
  color: var(--color-primary);
}

.quality-note {
  font-size: 11px;
  color: #aaa;
  margin-top: 4px;
}

/* 底部操作栏 */
.bottom-bar {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background: #fff;
  display: flex;
  padding: 12px 16px;
  gap: 12px;
  box-shadow: 0 -2px 12px rgba(0, 0, 0, 0.08);
}

.btn-share {
  flex: 1;
  background: var(--color-primary);
  color: #fff;
  border: none;
  border-radius: 24px;
  font-size: 15px;
}

.btn-report {
  flex: 1;
  background: #f5f5f5;
  color: #666;
  border: none;
  border-radius: 24px;
  font-size: 15px;
}

/* 举报弹窗 */
.report-title {
  font-size: 16px;
  font-weight: 600;
  text-align: center;
  margin-bottom: 16px;
}

.report-textarea {
  background: #f5f5f5;
  border-radius: 8px;
  margin-bottom: 16px;
}

.report-actions {
  display: flex;
  gap: 12px;
}

.report-actions .van-button {
  flex: 1;
  border-radius: 24px;
}
</style>
