<script setup lang="ts">
import { ref, onMounted, computed, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { Icon, Button, showConfirmDialog, showToast } from 'vant'
import AppHeader from '@/components/AppHeader.vue'
import { usePickupStore } from '@/stores/pickup'
import { formatDate } from '@/utils/format'

const route = useRoute()
const router = useRouter()
const pickupStore = usePickupStore()

const orderId = Number(route.params.orderId)
const loading = ref(false)
const brightness = ref(1)

const pickupCode = computed(() => pickupStore.currentPickupCode)

const statusText = computed(() => {
  const map: Record<string, string> = {
    pending: '待取货',
    picked: '已取货',
    expired: '已过期',
  }
  return map[pickupCode.value?.status || ''] || ''
})

const statusColor = computed(() => {
  const map: Record<string, string> = {
    pending: '#2DB87B',
    picked: '#999',
    expired: '#FF6B6B',
  }
  return map[pickupCode.value?.status || ''] || '#999'
})

async function loadPickupCode() {
  loading.value = true
  try {
    await pickupStore.fetchPickupCodeByOrderId(orderId)
  } finally {
    loading.value = false
  }
}

async function onConfirmPickup() {
  if (!pickupCode.value) return
  try {
    await showConfirmDialog({
      title: '确认取货',
      message: '请确认已收到商品，确认后将标记为已取货',
    })
    await pickupStore.confirmPickup(pickupCode.value.id)
    showToast('取货成功')
  } catch (e) {
    // 用户取消
  }
}

function onBack() {
  pickupStore.clearCurrentPickupCode()
  router.back()
}

function generateQRCode(data: string): string {
  const size = 200
  const modules = 21
  const moduleSize = size / modules
  const canvas = document.createElement('canvas')
  canvas.width = size
  canvas.height = size
  const ctx = canvas.getContext('2d')
  if (!ctx) return ''

  ctx.fillStyle = '#fff'
  ctx.fillRect(0, 0, size, size)
  ctx.fillStyle = '#000'

  let hash = 0
  for (let i = 0; i < data.length; i++) {
    hash = ((hash << 5) - hash + data.charCodeAt(i)) | 0
  }

  for (let i = 0; i < modules; i++) {
    for (let j = 0; j < modules; j++) {
      const isCorner =
        (i < 7 && j < 7) ||
        (i < 7 && j >= modules - 7) ||
        (i >= modules - 7 && j < 7)

      if (isCorner) {
        const innerI = i < 7 ? i : i - (modules - 7)
        const innerJ = j < 7 ? j : j - (modules - 7)
        const isOuter = innerI === 0 || innerI === 6 || innerJ === 0 || innerJ === 6
        const isInner = innerI >= 2 && innerI <= 4 && innerJ >= 2 && innerJ <= 4
        if (isOuter || isInner) {
          ctx.fillRect(j * moduleSize, i * moduleSize, moduleSize, moduleSize)
        }
      } else {
        const pseudoRandom = ((hash * (i + 1) * (j + 1)) % 100) > 45
        if (pseudoRandom) {
          ctx.fillRect(j * moduleSize, i * moduleSize, moduleSize, moduleSize)
        }
      }
    }
  }

  return canvas.toDataURL()
}

const qrCodeImage = computed(() => {
  if (!pickupCode.value) return ''
  return generateQRCode(pickupCode.value.qrCode)
})

watch(
  () => pickupCode.value,
  () => {
    if (pickupCode.value?.status === 'pending') {
      brightness.value = 1
    }
  }
)

onMounted(() => {
  loadPickupCode()
})
</script>

<template>
  <div class="pickup-code-page" :style="{ filter: `brightness(${brightness})` }">
    <AppHeader title="取货码" show-back @click-left="onBack()" />

    <div class="pickup-code-page__content" v-if="pickupCode">
      <div class="code-card">
        <div class="code-card__header">
          <div class="code-card__status" :style="{ background: statusColor }">
            {{ statusText }}
          </div>
          <div class="code-card__order">订单号: {{ pickupCode.orderNo }}</div>
        </div>

        <div class="qr-code-wrapper" v-if="pickupCode.status === 'pending'">
          <img :src="qrCodeImage" class="qr-code" alt="取货二维码" />
          <div class="qr-code__tip">请向工作人员出示二维码</div>
        </div>

        <div class="pickup-number">
          <div class="pickup-number__label">取货码</div>
          <div class="pickup-number__code">
            <span v-for="(num, idx) in pickupCode.code.split('')" :key="idx" class="pickup-number__digit">
              {{ num }}
            </span>
          </div>
        </div>

        <div class="store-info">
          <div class="store-info__row">
            <van-icon name="shop-o" size="16" color="#2DB87B" />
            <span class="store-info__label">取货门店</span>
            <span class="store-info__value">{{ pickupCode.storeName }}</span>
          </div>
          <div class="store-info__row">
            <van-icon name="location-o" size="16" color="#999" />
            <span class="store-info__label">门店地址</span>
            <span class="store-info__value">{{ pickupCode.storeAddress }}</span>
          </div>
          <div class="store-info__row">
            <van-icon name="clock-o" size="16" color="#999" />
            <span class="store-info__label">取货时段</span>
            <span class="store-info__value">{{ pickupCode.timeSlotLabel }}</span>
          </div>
          <div class="store-info__row">
            <van-icon name="calendar-o" size="16" color="#999" />
            <span class="store-info__label">生成时间</span>
            <span class="store-info__value">{{ formatDate(pickupCode.createdAt) }}</span>
          </div>
        </div>

        <div class="deadline-tip" v-if="pickupCode.status === 'pending'">
          <van-icon name="info-o" size="14" color="#FFB946" />
          <span>请在 {{ formatDate(pickupCode.pickupDeadline) }} 前取货，过期将自动取消</span>
        </div>

        <van-button
          v-if="pickupCode.status === 'pending'"
          type="primary"
          block
          round
          class="confirm-btn"
          @click="onConfirmPickup"
        >
          确认已取货
        </van-button>

        <div class="picked-tip" v-if="pickupCode.status === 'picked'">
          <van-icon name="checked" size="20" color="#2DB87B" />
          <span>您已于 {{ formatDate(pickupCode.pickedAt || '') }} 取货</span>
        </div>

        <div class="expired-tip" v-if="pickupCode.status === 'expired'">
          <van-icon name="warning-o" size="20" color="#FF6B6B" />
          <span>取货码已过期，请重新下单</span>
        </div>
      </div>

      <div class="help-section">
        <div class="help-section__title">取货须知</div>
        <div class="help-section__item">
          <span class="help-section__num">1</span>
          <span>到店后请向工作人员出示取货码或二维码</span>
        </div>
        <div class="help-section__item">
          <span class="help-section__num">2</span>
          <span>请核对商品数量和规格，确认无误后再取货</span>
        </div>
        <div class="help-section__item">
          <span class="help-section__num">3</span>
          <span>如需冷藏/冷冻的商品，请及时带回家冷藏</span>
        </div>
      </div>
    </div>

    <van-empty v-if="!loading && !pickupCode" description="取货码不存在" />
  </div>
</template>

<style scoped lang="scss">
@use '@/assets/styles/variables' as *;

.pickup-code-page {
  min-height: 100vh;
  background: linear-gradient(180deg, $primary 0%, $bg 30%);

  &__content {
    padding-top: 46px;
    padding-bottom: 40px;
  }
}

.code-card {
  background: $bg-card;
  margin: 16px;
  padding: 20px;
  border-radius: $radius-lg;
  box-shadow: $shadow;

  &__header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;
  }

  &__status {
    padding: 4px 12px;
    border-radius: 12px;
    font-size: 12px;
    font-weight: 500;
    color: #fff;
  }

  &__order {
    font-size: 12px;
    color: $text-secondary;
  }
}

.qr-code-wrapper {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 20px;
  background: #fff;
  border-radius: $radius-md;
  margin-bottom: 20px;
}

.qr-code {
  width: 200px;
  height: 200px;
  background: #fff;
  padding: 10px;
  border-radius: $radius-md;
}

.qr-code__tip {
  margin-top: 12px;
  font-size: 13px;
  color: $text-secondary;
}

.pickup-number {
  text-align: center;
  margin-bottom: 20px;

  &__label {
    font-size: 13px;
    color: $text-secondary;
    margin-bottom: 10px;
  }

  &__code {
    display: flex;
    justify-content: center;
    gap: 8px;
  }

  &__digit {
    width: 40px;
    height: 48px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: $primary-light;
    border-radius: $radius-sm;
    font-size: 24px;
    font-weight: 700;
    color: $primary;
    font-family: $font-display;
  }
}

.store-info {
  padding: 16px 0;
  border-top: 1px solid $border;
  border-bottom: 1px solid $border;
  margin-bottom: 16px;

  &__row {
    display: flex;
    align-items: flex-start;
    gap: 8px;
    padding: 8px 0;
    font-size: 13px;
  }

  &__label {
    width: 60px;
    color: $text-secondary;
    flex-shrink: 0;
  }

  &__value {
    flex: 1;
    color: $text-primary;
    line-height: 1.5;
  }
}

.deadline-tip {
  display: flex;
  align-items: flex-start;
  gap: 6px;
  padding: 12px;
  background: #FFF8E6;
  border-radius: $radius-md;
  margin-bottom: 16px;
  font-size: 12px;
  color: $text-secondary;
  line-height: 1.5;
}

.confirm-btn {
  height: 44px;
  font-size: 15px;
  font-weight: 600;
}

.picked-tip,
.expired-tip {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 16px;
  border-radius: $radius-md;
  font-size: 14px;
}

.picked-tip {
  background: $primary-light;
  color: $primary;
}

.expired-tip {
  background: #FFF0F0;
  color: #FF6B6B;
}

.help-section {
  background: $bg-card;
  margin: 0 16px;
  padding: 16px 20px;
  border-radius: $radius-lg;
  box-shadow: $shadow;

  &__title {
    font-size: 15px;
    font-weight: 600;
    color: $text-primary;
    margin-bottom: 12px;
  }

  &__item {
    display: flex;
    align-items: flex-start;
    gap: 10px;
    padding: 6px 0;
    font-size: 13px;
    color: $text-secondary;
    line-height: 1.6;
  }

  &__num {
    width: 18px;
    height: 18px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: $primary;
    color: #fff;
    border-radius: 50%;
    font-size: 11px;
    font-weight: 600;
    flex-shrink: 0;
    margin-top: 1px;
  }
}
</style>
