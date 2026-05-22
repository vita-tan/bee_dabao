<template>
  <div class="error-page" :class="`error-page--${type}`">
    <!-- 无效溯源码 -->
    <template v-if="type === 'not_found'">
      <div class="error-icon">
        <van-icon name="warning" size="72px" color="#F5A623" />
      </div>
      <h2 class="error-title">溯源信息不存在</h2>
      <p class="error-desc">
        未找到此溯源信息，可能是溯源码有误或已过期。<br />请谨慎购买，如有疑问请联系销售方。
      </p>
      <div class="error-badge error-badge--warning">
        <van-icon name="warning-o" />
        请谨慎购买
      </div>
    </template>

    <!-- 已召回 -->
    <template v-else-if="type === 'recalled'">
      <div class="error-icon">
        <van-icon name="close" size="72px" color="#E74C3C" />
      </div>
      <h2 class="error-title error-title--danger">此产品已被召回</h2>
      <p class="error-desc">
        该产品已被生产方或政府平台标记为<strong>召回状态</strong>，<br />
        请立即停止使用，并联系购买渠道退货处理。
      </p>
      <div class="error-badge error-badge--danger">
        <van-icon name="close" />
        请停止使用并退货
      </div>
      <div class="recall-tip">
        <van-icon name="phone-o" />
        如需帮助，请拨打消费者热线 <a href="tel:12315">12315</a>
      </div>
    </template>

    <div class="error-footer">
      <div class="footer-logo">🐝 蜂农数字化管理平台</div>
      <div class="footer-sub">由政府监管·数据安全可信</div>
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  type: 'not_found' | 'recalled'
}>()
</script>

<style scoped>
.error-page {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  padding: 40px 24px;
  text-align: center;
  background: #fff;
}

.error-page--recalled {
  background: #fff5f5;
}

.error-icon {
  margin-bottom: 24px;
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0%, 100% { transform: scale(1); opacity: 1; }
  50% { transform: scale(1.08); opacity: 0.85; }
}

.error-title {
  font-size: 22px;
  font-weight: 700;
  color: #444;
  margin-bottom: 16px;
}

.error-title--danger {
  color: #E74C3C;
}

.error-desc {
  font-size: 14px;
  color: #666;
  line-height: 1.8;
  margin-bottom: 24px;
}

.error-badge {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 24px;
  border-radius: 24px;
  font-size: 15px;
  font-weight: 600;
  margin-bottom: 20px;
}

.error-badge--warning {
  background: #fff8e6;
  color: #e6a817;
  border: 1px solid #ffe58f;
}

.error-badge--danger {
  background: #fdecea;
  color: #E74C3C;
  border: 1px solid #f5c6cb;
}

.recall-tip {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  color: #888;
  margin-top: 8px;
}

.recall-tip a {
  color: #E74C3C;
  text-decoration: none;
  font-weight: 600;
}

.error-footer {
  position: fixed;
  bottom: 24px;
  left: 0;
  right: 0;
  text-align: center;
}

.footer-logo {
  font-size: 15px;
  font-weight: 600;
  color: #555;
  margin-bottom: 4px;
}

.footer-sub {
  font-size: 12px;
  color: #bbb;
}
</style>
