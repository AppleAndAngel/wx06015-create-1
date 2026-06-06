<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useGiftCardStore } from '@/stores/giftCard'
import { useUserStore } from '@/stores/user'
import {
  showLoadingToast,
  closeToast,
  showToast,
  showConfirmDialog,
} from 'vant'
import type {
  GiftCardTemplate,
  GiftCardRecipient,
  CreateGiftCardOrderParams,
} from '@/types'
import { isPhone } from '@/utils/validate'

const route = useRoute()
const router = useRouter()
const giftCardStore = useGiftCardStore()
const userStore = useUserStore()

const denominationId = Number(route.params.denominationId)

const loading = ref(false)
const submitting = ref(false)
const paying = ref(false)
const showPaySuccess = ref(false)

const selectedTemplate = ref<GiftCardTemplate | null>(null)
const message = ref('')
const recipient = ref<GiftCardRecipient>({
  name: '',
  phone: '',
  relation: '',
})

const currentDenomination = computed(() =>
  giftCardStore.getDenominationById(denominationId) ||
  giftCardStore.selectedDenomination
)

const relations = ['家人', '朋友', '同事', '老师', '其他']

onMounted(async () => {
  try {
    loading.value = true
    showLoadingToast({ message: '加载中...', forbidClick: true })

    if (giftCardStore.templates.length === 0) {
      await giftCardStore.fetchTemplates()
    }
    if (giftCardStore.denominations.length === 0) {
      await giftCardStore.fetchDenominations()
    }

    if (giftCardStore.templates.length > 0 && !selectedTemplate.value) {
      selectedTemplate.value = giftCardStore.templates[0]
    }

    message.value = await giftCardStore.getRandomMessage()

    closeToast()
  } catch (e) {
    closeToast()
    showToast({ message: '加载失败，请重试', type: 'fail' })
  } finally {
    loading.value = false
  }
})

function handleSelectTemplate(template: GiftCardTemplate) {
  selectedTemplate.value = template
  giftCardStore.setSelectedTemplate(template)
}

async function handleGenerateMessage() {
  message.value = await giftCardStore.getRandomMessage()
}

async function handleSubmit() {
  if (!currentDenomination.value) {
    showToast({ message: '请选择面额', type: 'fail' })
    return
  }
  if (!selectedTemplate.value) {
    showToast({ message: '请选择卡片样式', type: 'fail' })
    return
  }
  if (!recipient.value.name.trim()) {
    showToast({ message: '请填写接收人姓名', type: 'fail' })
    return
  }
  if (!isPhone(recipient.value.phone)) {
    showToast({ message: '请填写正确的手机号', type: 'fail' })
    return
  }
  if (!message.value.trim()) {
    showToast({ message: '请填写祝福语', type: 'fail' })
    return
  }

  try {
    submitting.value = true
    showLoadingToast({ message: '创建订单中...', forbidClick: true })

    const params: CreateGiftCardOrderParams = {
      denominationId: currentDenomination.value.id,
      templateId: selectedTemplate.value.id,
      recipient: { ...recipient.value },
      message: message.value.trim(),
    }

    const result = await giftCardStore.createOrder(params)
    closeToast()

    await handlePay(result.orderId)
  } catch (e: any) {
    closeToast()
    showToast({ message: e.message || '创建订单失败', type: 'fail' })
  } finally {
    submitting.value = false
  }
}

async function handlePay(orderId: number) {
  try {
    await showConfirmDialog({
      title: '确认支付',
      message: `您将支付 ¥${currentDenomination.value?.price} 购买礼品卡`,
      confirmButtonText: '微信支付',
      cancelButtonText: '取消',
    })

    paying.value = true
    showLoadingToast({ message: '支付中...', forbidClick: true })

    const result = await giftCardStore.payOrder(orderId, 'wechat')
    closeToast()

    if (result.status === 'success') {
      showPaySuccess.value = true
      setTimeout(() => {
        router.replace(`/gift-card/${orderId}`)
      }, 2000)
    }
  } catch (e: any) {
    closeToast()
    if (e !== 'cancel') {
      showToast({ message: e.message || '支付失败', type: 'fail' })
    }
  } finally {
    paying.value = false
  }
}
</script>

<template>
  <div class="gift-card-purchase-page">
    <van-nav-bar
      title="购买礼品卡"
      left-arrow
      @click-left="router.back()"
    />

    <div class="page-content">
      <div class="preview-section">
        <h3 class="section-title">礼品卡预览</h3>
        <div
          class="gift-card-preview"
          :style="{
            background: selectedTemplate?.bgGradient || 'linear-gradient(135deg, #FF6B6B, #EE5A5A)',
          }"
        >
          <div class="gift-card-preview__logo">
            <span class="logo-icon">🥬</span>
            <span class="logo-text">生鲜礼品卡</span>
          </div>
          <div class="gift-card-preview__value">
            <span class="value-symbol" :style="{ color: selectedTemplate?.textColor || '#fff' }">¥</span>
            <span class="value-amount" :style="{ color: selectedTemplate?.textColor || '#fff' }">
              {{ currentDenomination?.value || 0 }}
            </span>
          </div>
          <div class="gift-card-preview__name" :style="{ color: selectedTemplate?.textColor || '#fff' }">
            {{ currentDenomination?.name }}
          </div>
          <div class="gift-card-preview__decor">🎁</div>
        </div>
      </div>

      <div class="section">
        <h3 class="section-title">选择卡片样式</h3>
        <div class="template-grid">
          <div
            v-for="template in giftCardStore.templates"
            :key="template.id"
            class="template-item"
            :class="{ 'template-item--selected': selectedTemplate?.id === template.id }"
            :style="{ background: template.bgGradient }"
            @click="handleSelectTemplate(template)"
          >
            <span class="template-item__name" :style="{ color: template.textColor }">
              {{ template.name }}
            </span>
            <div
              v-if="selectedTemplate?.id === template.id"
              class="template-item__check"
            >
              <van-icon name="checked" size="14" color="#fff" />
            </div>
          </div>
        </div>
      </div>

      <div class="section">
        <h3 class="section-title">
          祝福语
          <span class="section-action" @click="handleGenerateMessage">
            <van-icon name="replay" size="14" />
            换一句
          </span>
        </h3>
        <div class="message-card">
          <van-field
            v-model="message"
            type="textarea"
            placeholder="写下你想对Ta说的话..."
            rows="4"
            maxlength="200"
            show-word-limit
          />
        </div>
      </div>

      <div class="section">
        <h3 class="section-title">接收人信息</h3>
        <div class="form-card">
          <van-field
            v-model="recipient.name"
            label="姓名"
            placeholder="请输入接收人姓名"
            maxlength="20"
          />
          <van-field
            v-model="recipient.phone"
            label="手机号"
            placeholder="请输入接收人手机号"
            type="tel"
            maxlength="11"
          />
          <div class="relation-selector">
            <span class="relation-label">与Ta的关系</span>
            <div class="relation-options">
              <span
                v-for="rel in relations"
                :key="rel"
                class="relation-option"
                :class="{ 'relation-option--active': recipient.relation === rel }"
                @click="recipient.relation = rel"
              >
                {{ rel }}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div class="section">
        <h3 class="section-title">订单信息</h3>
        <div class="order-summary">
          <div class="order-summary__row">
            <span class="order-summary__label">礼品卡面额</span>
            <span class="order-summary__value">¥{{ currentDenomination?.value || 0 }}</span>
          </div>
          <div class="order-summary__row">
            <span class="order-summary__label">售价</span>
            <span class="order-summary__value">¥{{ currentDenomination?.price || 0 }}</span>
          </div>
          <div v-if="currentDenomination && currentDenomination.price < currentDenomination.value" class="order-summary__row">
            <span class="order-summary__label">优惠金额</span>
            <span class="order-summary__value order-summary__value--discount">
              -¥{{ (currentDenomination.value - currentDenomination.price).toFixed(0) }}
            </span>
          </div>
          <div class="order-summary__divider"></div>
          <div class="order-summary__row order-summary__row--total">
            <span class="order-summary__label">应付金额</span>
            <span class="order-summary__value order-summary__value--total">
              ¥{{ currentDenomination?.price || 0 }}
            </span>
          </div>
        </div>
      </div>
    </div>

    <div class="bottom-bar">
      <div class="bottom-bar__total">
        <span class="label">应付：</span>
        <span class="symbol">¥</span>
        <span class="amount">{{ currentDenomination?.price || 0 }}</span>
      </div>
      <van-button
        type="primary"
        class="submit-btn"
        :loading="submitting || paying"
        :disabled="!currentDenomination || !selectedTemplate"
        @click="handleSubmit"
      >
        立即支付
      </van-button>
    </div>

    <Transition name="fade">
      <div v-if="showPaySuccess" class="success-overlay">
        <div class="success-overlay__content">
          <div class="success-overlay__icon">
            <van-icon name="checked" size="56" color="#2DB87B" />
          </div>
          <p class="success-overlay__title">支付成功</p>
          <p class="success-overlay__desc">礼品卡将发送给 {{ recipient.name }}</p>
        </div>
      </div>
    </Transition>
  </div>
</template>

<style scoped lang="scss">
@use '@/assets/styles/variables' as *;

.gift-card-purchase-page {
  min-height: 100vh;
  background: $bg;
  padding-bottom: 100px;
}

.page-content {
  padding: 16px;
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
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.section-action {
  font-size: 12px;
  color: $primary;
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 4px;
  cursor: pointer;
}

.preview-section {
  margin-bottom: 20px;
}

.gift-card-preview {
  border-radius: $radius-lg;
  padding: 24px;
  position: relative;
  overflow: hidden;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
  min-height: 180px;
  display: flex;
  flex-direction: column;
  justify-content: center;

  &::before {
    content: '';
    position: absolute;
    top: -40px;
    right: -40px;
    width: 120px;
    height: 120px;
    background: rgba(255, 255, 255, 0.1);
    border-radius: 50%;
  }

  &::after {
    content: '';
    position: absolute;
    bottom: -20px;
    right: 40px;
    width: 70px;
    height: 70px;
    background: rgba(255, 255, 255, 0.08);
    border-radius: 50%;
  }
}

.gift-card-preview__logo {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 16px;
  position: relative;
  z-index: 1;
}

.logo-icon {
  font-size: 24px;
}

.logo-text {
  font-size: 14px;
  font-weight: 600;
  color: rgba(255, 255, 255, 0.9);
}

.gift-card-preview__value {
  display: flex;
  align-items: baseline;
  position: relative;
  z-index: 1;
  margin-bottom: 8px;
}

.value-symbol {
  font-size: 20px;
  font-weight: 600;
}

.value-amount {
  font-size: 48px;
  font-weight: 700;
  font-family: $font-display;
  line-height: 1;
}

.gift-card-preview__name {
  font-size: 14px;
  opacity: 0.95;
  position: relative;
  z-index: 1;
}

.gift-card-preview__decor {
  position: absolute;
  bottom: 16px;
  right: 20px;
  font-size: 40px;
  opacity: 0.3;
  z-index: 0;
}

.template-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 10px;
}

.template-item {
  border-radius: $radius-md;
  padding: 16px 12px;
  text-align: center;
  cursor: pointer;
  position: relative;
  transition: all 0.2s ease;
  border: 2px solid transparent;
  min-height: 60px;
  display: flex;
  align-items: center;
  justify-content: center;

  &--selected {
    border-color: #fff;
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.2);
    transform: translateY(-2px);
  }

  &__name {
    font-size: 13px;
    font-weight: 500;
  }

  &__check {
    position: absolute;
    top: 4px;
    right: 4px;
    width: 20px;
    height: 20px;
    background: rgba(0, 0, 0, 0.3);
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
  }
}

.message-card,
.form-card {
  background: $bg-card;
  border-radius: $radius-md;
  padding: 0 16px;
  box-shadow: $shadow;
  overflow: hidden;
}

.relation-selector {
  padding: 12px 0;
  border-top: 1px solid $border;
}

.relation-label {
  display: block;
  font-size: 14px;
  color: $text-secondary;
  margin-bottom: 10px;
}

.relation-options {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.relation-option {
  padding: 6px 16px;
  background: $bg;
  border-radius: 16px;
  font-size: 13px;
  color: $text-secondary;
  cursor: pointer;
  transition: all 0.2s ease;
  border: 1px solid $border;

  &--active {
    background: rgba(45, 184, 123, 0.1);
    color: $primary;
    border-color: $primary;
  }
}

.order-summary {
  background: $bg-card;
  border-radius: $radius-md;
  padding: 16px;
  box-shadow: $shadow;
}

.order-summary__row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 0;
  font-size: 14px;

  &__label {
    color: $text-secondary;
  }

  &__value {
    color: $text-primary;
    font-weight: 500;

    &--discount {
      color: $primary;
    }
  }

  &--total {
    padding-top: 12px;
  }

  &--total &__label {
    font-size: 15px;
    color: $text-primary;
    font-weight: 600;
  }

  &--total &__value {
    font-size: 20px;
    color: $danger;
    font-weight: 700;
    font-family: $font-display;
  }
}

.order-summary__divider {
  height: 1px;
  background: $border;
  margin: 8px 0;
}

.bottom-bar {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background: $bg-card;
  padding: 12px 16px;
  padding-bottom: calc(env(safe-area-inset-bottom, 0px) + 12px);
  display: flex;
  align-items: center;
  justify-content: space-between;
  box-shadow: 0 -2px 12px rgba(0, 0, 0, 0.08);
  z-index: 100;
}

.bottom-bar__total {
  display: flex;
  align-items: baseline;

  .label {
    font-size: 14px;
    color: $text-secondary;
  }

  .symbol {
    font-size: 14px;
    color: $danger;
    font-weight: 600;
  }

  .amount {
    font-size: 24px;
    color: $danger;
    font-weight: 700;
    font-family: $font-display;
  }
}

.submit-btn {
  width: 160px !important;
  height: 44px !important;
  border-radius: 22px !important;
  font-size: 16px !important;
  font-weight: 600 !important;
  background: linear-gradient(135deg, $primary 0%, $primary-dark 100%) !important;
  border: none !important;
}

.success-overlay {
  position: fixed;
  inset: 0;
  background: rgba(255, 255, 255, 0.98);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 999;

  &__content {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 12px;
  }

  &__icon {
    width: 88px;
    height: 88px;
    border-radius: 50%;
    background: $primary-light;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  &__title {
    font-size: 20px;
    font-weight: 600;
    color: $primary;
    margin: 0;
  }

  &__desc {
    font-size: 14px;
    color: $text-secondary;
    margin: 0;
  }
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
