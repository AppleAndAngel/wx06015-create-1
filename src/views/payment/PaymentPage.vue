<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { RadioGroup, Radio, Button, Loading, Toast } from 'vant'
import AppHeader from '@/components/AppHeader.vue'
import { useOrderStore } from '@/stores/order'
import { usePickupStore } from '@/stores/pickup'
import { formatPrice } from '@/utils/format'

const route = useRoute()
const router = useRouter()
const orderStore = useOrderStore()
const pickupStore = usePickupStore()

const orderId = Number(route.params.orderId)
const order = computed(() => orderStore.currentOrder)
const isPickupOrder = computed(() => order.value?.deliveryType === 'pickup')

const payMethod = ref<'wechat' | 'alipay' | 'balance'>('wechat')
const paying = ref(false)
const showSuccess = ref(false)

const payMethods = [
  { value: 'wechat' as const, label: '微信支付', icon: 'wechat-pay', color: '#07C160' },
  { value: 'alipay' as const, label: '支付宝', icon: 'alipay', color: '#1677FF' },
  { value: 'balance' as const, label: '余额支付', icon: 'gold-coin-o', color: '#FF8C42' },
]

const onPay = async () => {
  paying.value = true
  try {
    await new Promise((resolve) => setTimeout(resolve, 1500))
    showSuccess.value = true

    if (isPickupOrder.value && order.value?.pickupInfo?.store && order.value?.pickupInfo?.timeSlot) {
      await pickupStore.generatePickupCode(
        order.value.id,
        order.value.orderNo,
        order.value.pickupInfo.store.id,
        order.value.pickupInfo.store.name,
        order.value.pickupInfo.store.address,
        order.value.pickupInfo.timeSlot.label
      )
      pickupStore.resetSelection()
      setTimeout(() => {
        router.replace(`/pickup/code/${orderId}`)
      }, 2000)
    } else {
      setTimeout(() => {
        router.replace(`/user/orders/${orderId}`)
      }, 2000)
    }
  } finally {
    paying.value = false
  }
}

onMounted(() => {
  orderStore.fetchOrderById(orderId)
})
</script>

<template>
  <div class="payment-page">
    <AppHeader title="收银台" show-back @click-left="router.back()" />

    <div class="payment-page__content">
      <div class="amount-section">
        <span class="amount-section__label">支付金额</span>
        <span class="amount-section__value" v-if="order">
          <em>¥</em>{{ formatPrice(order.payAmount) }}
        </span>
      </div>

      <div class="method-section">
        <h3 class="method-section__title">选择支付方式</h3>
        <van-radio-group v-model="payMethod">
          <div
            v-for="method in payMethods"
            :key="method.value"
            class="method-item"
            @click="payMethod = method.value"
          >
            <van-icon
              :name="method.icon"
              size="24"
              :color="method.color"
              class="method-item__icon"
            />
            <span class="method-item__label">{{ method.label }}</span>
            <van-radio :name="method.value" />
          </div>
        </van-radio-group>
      </div>

      <van-button
        type="primary"
        block
        round
        class="payment-page__pay-btn"
        :disabled="paying"
        @click="onPay"
      >
        <van-loading v-if="paying" size="20px" color="#fff" vertical>
          支付中...
        </van-loading>
        <span v-else>确认支付</span>
      </van-button>
    </div>

    <Transition name="fade">
      <div v-if="showSuccess" class="success-overlay">
        <div class="success-overlay__content">
          <div class="success-overlay__icon">
            <van-icon name="checked" size="56" color="#2DB87B" />
          </div>
          <p class="success-overlay__text">支付成功</p>
        </div>
      </div>
    </Transition>
  </div>
</template>

<style scoped lang="scss">
@use '@/assets/styles/variables' as *;

.payment-page {
  min-height: 100vh;
  background: $bg;

  &__content {
    padding-top: 46px;
    padding: 56px 16px 16px;
  }

  &__pay-btn {
    margin-top: 32px;
    height: 48px;
    font-size: 16px;
    font-weight: 600;
  }
}

.amount-section {
  background: $bg-card;
  border-radius: $radius-lg;
  box-shadow: $shadow;
  padding: 32px 20px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;

  &__label {
    font-size: 14px;
    color: $text-secondary;
  }

  &__value {
    font-size: 36px;
    font-weight: 700;
    color: $text-primary;

    em {
      font-style: normal;
      font-size: 20px;
    }
  }
}

.method-section {
  background: $bg-card;
  border-radius: $radius-lg;
  box-shadow: $shadow;
  padding: 16px;
  margin-top: 16px;

  &__title {
    font-size: 15px;
    font-weight: 600;
    color: $text-primary;
    margin-bottom: 12px;
  }
}

.method-item {
  display: flex;
  align-items: center;
  padding: 14px 0;
  border-bottom: 1px solid $border;
  cursor: pointer;

  &:last-child {
    border-bottom: none;
  }

  &__icon {
    margin-right: 12px;
  }

  &__label {
    flex: 1;
    font-size: 15px;
    color: $text-primary;
  }
}

.success-overlay {
  position: fixed;
  inset: 0;
  background: rgba(255, 255, 255, 0.95);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 999;

  &__content {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 16px;
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

  &__text {
    font-size: 20px;
    font-weight: 600;
    color: $primary;
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
