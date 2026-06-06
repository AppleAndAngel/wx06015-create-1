<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useGiftCardStore } from '@/stores/giftCard'
import {
  showLoadingToast,
  closeToast,
  showToast,
  showConfirmDialog,
  showSuccessToast,
} from 'vant'
import dayjs from 'dayjs'
import type { GiftCardOrder } from '@/types'

const route = useRoute()
const router = useRouter()
const giftCardStore = useGiftCardStore()

const orderId = Number(route.params.id)

const loading = ref(false)
const sending = ref(false)
const showCardCode = ref(false)

const order = ref<GiftCardOrder | null>(null)

const statusText: Record<string, string> = {
  pending: '待支付',
  paid: '待发送',
  sent: '已发送',
  received: '已领取',
  expired: '已过期',
}

const statusColor: Record<string, string> = {
  pending: '#999',
  paid: '#FF8C42',
  sent: '#1E9A63',
  received: '#2DB87B',
  expired: '#ccc',
}

const canSend = computed(() => order.value?.status === 'paid')
const showCode = computed(() =>
  order.value?.status === 'paid' || order.value?.status === 'sent'
)

async function fetchData() {
  try {
    loading.value = true
    showLoadingToast({ message: '加载中...', forbidClick: true })

    const data = await giftCardStore.fetchOrder(orderId)
    order.value = data || null

    closeToast()
  } catch (e) {
    closeToast()
    showToast({ message: '加载失败，请重试', type: 'fail' })
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  fetchData()
})

async function handleSend() {
  if (!order.value || order.value.status !== 'paid') return

  try {
    await showConfirmDialog({
      title: '确认发送',
      message: `将把 ¥${order.value.denomination.value} 礼品卡发送给 ${order.value.recipient.name}`,
      confirmButtonText: '确认发送',
    })

    sending.value = true
    showLoadingToast({ message: '发送中...', forbidClick: true })

    await giftCardStore.sendGiftCard(orderId)
    await fetchData()

    closeToast()
    showSuccessToast('发送成功！')
  } catch (e: any) {
    closeToast()
    if (e !== 'cancel') {
      showToast({ message: e.message || '发送失败', type: 'fail' })
    }
  } finally {
    sending.value = false
  }
}

function formatDate(dateStr: string): string {
  return dayjs(dateStr).format('YYYY-MM-DD HH:mm')
}

function formatValidDate(dateStr: string): string {
  return dayjs(dateStr).format('YYYY年MM月DD日')
}

function copyCardCode() {
  if (!order.value?.cardCode) return

  navigator.clipboard?.writeText(order.value.cardCode).then(() => {
    showSuccessToast('卡号已复制')
  }).catch(() => {
    showToast({ message: '复制失败', type: 'fail' })
  })
}
</script>

<template>
  <div class="gift-card-detail-page">
    <van-nav-bar
      title="礼品卡详情"
      left-arrow
      @click-left="router.back()"
    />

    <div v-if="order" class="page-content">
      <div class="card-section">
        <div
          class="gift-card"
          :style="{ background: order.template.bgGradient }"
        >
          <div class="gift-card__logo">
            <span class="logo-icon">🥬</span>
            <span class="logo-text" :style="{ color: order.template.textColor }">生鲜礼品卡</span>
          </div>
          <div class="gift-card__value" :style="{ color: order.template.textColor }">
            <span class="value-symbol">¥</span>
            <span class="value-amount">{{ order.denomination.value }}</span>
          </div>
          <div class="gift-card__name" :style="{ color: order.template.textColor }">
            {{ order.denomination.name }}
          </div>
          <div class="gift-card__decor">🎁</div>
          <div
            class="gift-card__status"
            :style="{ background: statusColor[order.status] }"
          >
            {{ statusText[order.status] }}
          </div>
        </div>
      </div>

      <div v-if="showCode && order.cardCode" class="card-code-section">
        <div class="card-code-card">
          <div class="card-code-label">礼品卡密码</div>
          <div class="card-code-content">
            <span v-if="showCardCode" class="card-code">{{ order.cardCode }}</span>
            <span v-else class="card-code card-code--masked">•••• •••• ••••</span>
            <van-icon
              :name="showCardCode ? 'eye-o' : 'closed-eye'"
              size="20"
              @click="showCardCode = !showCardCode"
            />
          </div>
          <div v-if="showCardCode" class="card-code-actions">
            <span class="copy-btn" @click="copyCardCode">
              <van-icon name="copy-o" size="14" />
              复制
            </span>
          </div>
        </div>
      </div>

      <div class="section">
        <h3 class="section-title">祝福语</h3>
        <div class="message-card">
          <p class="message-text">"{{ order.message }}"</p>
        </div>
      </div>

      <div class="section">
        <h3 class="section-title">接收人信息</h3>
        <div class="info-card">
          <div class="info-row">
            <span class="info-label">姓名</span>
            <span class="info-value">{{ order.recipient.name }}</span>
          </div>
          <div class="info-row">
            <span class="info-label">手机号</span>
            <span class="info-value">{{ order.recipient.phone.replace(/(\d{3})\d{4}(\d{4})/, '$1****$2') }}</span>
          </div>
          <div v-if="order.recipient.relation" class="info-row">
            <span class="info-label">关系</span>
            <span class="info-value">{{ order.recipient.relation }}</span>
          </div>
        </div>
      </div>

      <div class="section">
        <h3 class="section-title">订单信息</h3>
        <div class="info-card">
          <div class="info-row">
            <span class="info-label">订单号</span>
            <span class="info-value">{{ order.orderNo }}</span>
          </div>
          <div class="info-row">
            <span class="info-label">面额</span>
            <span class="info-value">¥{{ order.denomination.value }}</span>
          </div>
          <div class="info-row">
            <span class="info-label">购买金额</span>
            <span class="info-value">¥{{ order.payAmount }}</span>
          </div>
          <div v-if="order.payMethod" class="info-row">
            <span class="info-label">支付方式</span>
            <span class="info-value">
              {{ order.payMethod === 'wechat' ? '微信支付' : order.payMethod === 'alipay' ? '支付宝' : '余额支付' }}
            </span>
          </div>
          <div v-if="order.payTime" class="info-row">
            <span class="info-label">支付时间</span>
            <span class="info-value">{{ formatDate(order.payTime) }}</span>
          </div>
          <div class="info-row">
            <span class="info-label">创建时间</span>
            <span class="info-value">{{ formatDate(order.createdAt) }}</span>
          </div>
          <div class="info-row">
            <span class="info-label">有效期至</span>
            <span class="info-value">{{ formatValidDate(order.validTo) }}</span>
          </div>
        </div>
      </div>
    </div>

    <div v-if="order && canSend" class="bottom-bar">
      <van-button
        type="primary"
        block
        class="send-btn"
        :loading="sending"
        @click="handleSend"
      >
        发送给 {{ order.recipient.name }}
      </van-button>
    </div>
  </div>
</template>

<style scoped lang="scss">
@use '@/assets/styles/variables' as *;

.gift-card-detail-page {
  min-height: 100vh;
  background: $bg;
  padding-bottom: 100px;
}

.page-content {
  padding: 16px;
}

.card-section {
  margin-bottom: 20px;
}

.gift-card {
  border-radius: $radius-lg;
  padding: 28px;
  position: relative;
  overflow: hidden;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
  min-height: 200px;
  display: flex;
  flex-direction: column;
  justify-content: center;

  &::before {
    content: '';
    position: absolute;
    top: -50px;
    right: -50px;
    width: 150px;
    height: 150px;
    background: rgba(255, 255, 255, 0.1);
    border-radius: 50%;
  }

  &::after {
    content: '';
    position: absolute;
    bottom: -30px;
    right: 40px;
    width: 90px;
    height: 90px;
    background: rgba(255, 255, 255, 0.08);
    border-radius: 50%;
  }
}

.gift-card__logo {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 20px;
  position: relative;
  z-index: 1;
}

.logo-icon {
  font-size: 28px;
}

.logo-text {
  font-size: 15px;
  font-weight: 600;
  opacity: 0.95;
}

.gift-card__value {
  display: flex;
  align-items: baseline;
  position: relative;
  z-index: 1;
  margin-bottom: 8px;
}

.value-symbol {
  font-size: 24px;
  font-weight: 600;
}

.value-amount {
  font-size: 56px;
  font-weight: 700;
  font-family: $font-display;
  line-height: 1;
}

.gift-card__name {
  font-size: 16px;
  opacity: 0.95;
  position: relative;
  z-index: 1;
}

.gift-card__decor {
  position: absolute;
  bottom: 20px;
  right: 24px;
  font-size: 48px;
  opacity: 0.25;
  z-index: 0;
}

.gift-card__status {
  position: absolute;
  top: 16px;
  right: 16px;
  padding: 6px 14px;
  border-radius: 16px;
  font-size: 12px;
  color: #fff;
  font-weight: 500;
  z-index: 2;
}

.card-code-section {
  margin-bottom: 20px;
}

.card-code-card {
  background: $bg-card;
  border-radius: $radius-md;
  padding: 20px;
  box-shadow: $shadow;
}

.card-code-label {
  font-size: 13px;
  color: $text-secondary;
  margin-bottom: 10px;
}

.card-code-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.card-code {
  font-size: 22px;
  font-weight: 700;
  color: $text-primary;
  font-family: 'SF Mono', 'Courier New', monospace;
  letter-spacing: 2px;

  &--masked {
    letter-spacing: 4px;
  }
}

.card-code-actions {
  margin-top: 12px;
  text-align: right;
}

.copy-btn {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-size: 13px;
  color: $primary;
  padding: 4px 12px;
  background: rgba(45, 184, 123, 0.1);
  border-radius: 14px;
  cursor: pointer;
}

.section {
  margin-bottom: 20px;
}

.section-title {
  font-size: 15px;
  font-weight: 600;
  color: $text-primary;
  margin: 0 0 12px 0;
  padding-left: 4px;
  border-left: 3px solid $primary;
  font-family: $font-display;
}

.message-card {
  background: linear-gradient(135deg, #FFF5F0 0%, #FFFAF5 100%);
  border-radius: $radius-md;
  padding: 20px;
  box-shadow: $shadow;
}

.message-text {
  font-size: 15px;
  color: $text-primary;
  line-height: 1.8;
  margin: 0;
  font-style: italic;
}

.info-card {
  background: $bg-card;
  border-radius: $radius-md;
  padding: 0 16px;
  box-shadow: $shadow;
}

.info-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 14px 0;
  border-bottom: 1px solid $border;

  &:last-child {
    border-bottom: none;
  }
}

.info-label {
  font-size: 14px;
  color: $text-secondary;
}

.info-value {
  font-size: 14px;
  color: $text-primary;
  font-weight: 500;
}

.bottom-bar {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background: $bg-card;
  padding: 12px 16px;
  padding-bottom: calc(env(safe-area-inset-bottom, 0px) + 12px);
  box-shadow: 0 -2px 12px rgba(0, 0, 0, 0.08);
  z-index: 100;
}

.send-btn {
  height: 46px !important;
  border-radius: 23px !important;
  font-size: 16px !important;
  font-weight: 600 !important;
  background: linear-gradient(135deg, $primary 0%, $primary-dark 100%) !important;
  border: none !important;
}
</style>
