<template>
  <!-- 全屏缩放容器，1920×1080 基准 -->
  <div class="screen-scale-wrap" ref="wrapRef">
    <div class="screen" :style="scaleStyle">
      <ScreenLayout />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, onUnmounted } from 'vue'
import ScreenLayout from '@/components/ScreenLayout.vue'

const wrapRef = ref<HTMLElement | null>(null)
const BASE_W = 1920
const BASE_H = 1080

const scaleStyle = reactive({ transform: 'scale(1)', transformOrigin: 'top left', width: `${BASE_W}px`, height: `${BASE_H}px` })

function calcScale() {
  const w = window.innerWidth
  const h = window.innerHeight
  const scaleX = w / BASE_W
  const scaleY = h / BASE_H
  const scale = Math.min(scaleX, scaleY)
  const offsetX = (w - BASE_W * scale) / 2
  const offsetY = (h - BASE_H * scale) / 2
  scaleStyle.transform = `translate(${offsetX}px, ${offsetY}px) scale(${scale})`
}

onMounted(() => {
  calcScale()
  window.addEventListener('resize', calcScale)
})
onUnmounted(() => {
  window.removeEventListener('resize', calcScale)
})
</script>

<style scoped>
.screen-scale-wrap {
  position: fixed;
  inset: 0;
  background: #030b1a;
  overflow: hidden;
}

.screen {
  position: absolute;
  top: 0;
  left: 0;
  background: var(--c-bg);
  overflow: hidden;
}
</style>
