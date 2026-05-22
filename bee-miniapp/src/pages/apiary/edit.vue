<template>
  <view class="page">
    <uni-forms ref="formRef" :modelValue="form" :rules="rules" label-width="180rpx">
      <!-- 名称 -->
      <uni-forms-item label="蜂场名称" name="name" required>
        <uni-easyinput v-model="form.name" placeholder="请输入蜂场名称" />
      </uni-forms-item>

      <!-- 地图选点 -->
      <uni-forms-item label="位置">
        <view class="location-row" @tap="chooseLocation">
          <text v-if="form.latitude" style="color:#333">{{ form.address || '已选择位置' }}</text>
          <text v-else style="color:#999">点击选择位置</text>
          <uni-icons type="location" size="20" color="#f5a623" />
        </view>
      </uni-forms-item>

      <!-- 蜂种 -->
      <uni-forms-item label="蜂种" name="beeBreed">
        <uni-easyinput v-model="form.beeBreed" placeholder="如：中蜂/意蜂" />
      </uni-forms-item>

      <!-- 箱数 -->
      <uni-forms-item label="蜂箱数" name="boxCount" required>
        <uni-easyinput v-model="form.boxCount" type="number" placeholder="请输入箱数" />
      </uni-forms-item>

      <!-- 群数 -->
      <uni-forms-item label="蜂群数" name="colonyCount" required>
        <uni-easyinput v-model="form.colonyCount" type="number" placeholder="请输入群数" />
      </uni-forms-item>

      <!-- 蜜源 -->
      <uni-forms-item label="主要蜜源">
        <uni-easyinput v-model="form.honeySource" placeholder="如：槐花/荆条/百花" />
      </uni-forms-item>

      <!-- 是否流动蜂场 -->
      <uni-forms-item label="流动蜂场">
        <switch :checked="form.isSeasonal" @change="form.isSeasonal = $event.detail.value" color="#f5a623" />
      </uni-forms-item>

      <!-- 照片 -->
      <uni-forms-item label="蜂场照片">
        <view class="photo-list">
          <image
            v-for="(img, i) in form.photos"
            :key="i"
            :src="img"
            class="photo-thumb"
            mode="aspectFill"
            @tap="previewPhoto(i)"
          />
          <view class="photo-add" @tap="addPhoto" v-if="form.photos.length < 6">
            <text style="font-size: 48rpx; color: #f5a623">+</text>
          </view>
        </view>
      </uni-forms-item>
    </uni-forms>

    <!-- 提交按钮 -->
    <button class="submit-btn" @tap="submit" :loading="submitting">
      {{ isEdit ? '保存修改' : '创建蜂场' }}
    </button>
  </view>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import { request, addToOfflineQueue, BASE_URL } from '@/utils/http'

const formRef = ref()
const submitting = ref(false)
const isEdit = ref(false)
const apiaryId = ref<number | null>(null)

const form = reactive({
  name: '',
  address: '',
  latitude: 0,
  longitude: 0,
  altitude: 0,
  beeBreed: '',
  boxCount: '',
  colonyCount: '',
  honeySource: '',
  isSeasonal: false,
  photos: [] as string[],
})

const rules = {
  name: { rules: [{ required: true, errorMessage: '请输入蜂场名称' }] },
  boxCount: { rules: [{ required: true, errorMessage: '请输入箱数' }] },
  colonyCount: { rules: [{ required: true, errorMessage: '请输入群数' }] },
}

onLoad((query: any) => {
  if (query?.id) {
    isEdit.value = true
    apiaryId.value = Number(query.id)
    loadApiary(apiaryId.value)
  }
})

async function loadApiary(id: number) {
  const data = await request<any>({ url: `/app/apiaries/${id}` })
  if (data) {
    Object.assign(form, data)
  }
}

function chooseLocation() {
  uni.chooseLocation({
    success: (res: any) => {
      form.latitude = res.latitude
      form.longitude = res.longitude
      form.address = res.address || res.name
    },
  })
}

function addPhoto() {
  uni.chooseImage({
    count: 6 - form.photos.length,
    sizeType: ['compressed'],
    sourceType: ['album', 'camera'],
    success: async (res) => {
      const uploads = res.tempFilePaths.map((path) =>
        new Promise<string>((resolve) => {
          uni.uploadFile({
            url: `${BASE_URL}/common/upload/image`,
            filePath: path,
            name: 'file',
            header: {
              Authorization: `Bearer ${uni.getStorageSync('bee_token')}`,
            },
            success: (r) => {
              const result = JSON.parse(r.data)
              resolve(result.data?.url || path)
            },
            fail: () => resolve(path),
          })
        }),
      )
      const urls = await Promise.all(uploads)
      form.photos.push(...urls)
    },
  })
}

function previewPhoto(index: number) {
  uni.previewImage({ current: index, urls: form.photos })
}

async function submit() {
  await formRef.value?.validate()
  submitting.value = true
  const payload = {
    ...form,
    boxCount: Number(form.boxCount),
    colonyCount: Number(form.colonyCount),
    isSeasonal: form.isSeasonal,
  }
  try {
    if (isEdit.value && apiaryId.value) {
      await request({ url: `/app/apiaries/${apiaryId.value}`, method: 'PUT', data: payload })
    } else {
      await request({ url: '/app/apiaries', method: 'POST', data: payload })
    }
    uni.showToast({ title: isEdit.value ? '保存成功' : '创建成功', icon: 'success' })
    setTimeout(() => uni.navigateBack(), 1200)
  } catch {
    // 离线时加入队列
    addToOfflineQueue({ url: isEdit.value ? `/app/apiaries/${apiaryId.value}` : '/app/apiaries', method: isEdit.value ? 'PUT' : 'POST', data: payload })
  } finally {
    submitting.value = false
  }
}
</script>

<style scoped>
.page { padding: 24rpx 24rpx 40rpx; background: #fff; min-height: 100vh; }

.location-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12rpx 0;
}

.photo-list { display: flex; flex-wrap: wrap; gap: 16rpx; }

.photo-thumb {
  width: 160rpx;
  height: 160rpx;
  border-radius: 8rpx;
  object-fit: cover;
}

.photo-add {
  width: 160rpx;
  height: 160rpx;
  background: #f5f5f5;
  border-radius: 8rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 2rpx dashed #ddd;
}

.submit-btn {
  margin-top: 48rpx;
  background: #f5a623;
  color: #fff;
  border-radius: 12rpx;
  font-size: 32rpx;
  height: 88rpx;
  line-height: 88rpx;
}
</style>
