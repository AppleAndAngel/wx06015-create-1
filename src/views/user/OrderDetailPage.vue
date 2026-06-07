<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { Tag, Button, showConfirmDialog, showToast } from 'vant'
import AppHeader from '@/components/AppHeader.vue'
import { useOrderStore } from '@/stores/order'
import { usePickupStore } from '@/stores/pickup'
import { formatPrice, formatDate, formatOrderStatus } from '@/utils/format'
import type { Order } from '@/types'

const route = useRoute()
const router = useRouter()
const orderStore = useOrderStore()
const pickupStore = usePickupStore()

const orderId = Number(route.params.id)
const order = computed(() => orderStore.currentOrder)
const isPickupOrder = computed(() => order.value?.deliveryType === 'pickup')

const statusBannerColor = computed(() => {
  const map: Record<string, string> = {
    pending: '#FFB946',
    paid: '#2DB87B',
    shipped: '#1989FA',
    delivered: '#999',
    cancelled: '#999',
  }
  return map[order.value?.status || ''] || '#999'
})

const statusIcon = computed(() => {
  const map: Record<string, string> = {
    pending: 'clock-o',
    paid: 'todo-list-o',
    shipped: 'logistics',
    delivered: 'checked',
    cancelled: 'cross',
  }
  return map[order.value?.status || ''] || 'info-o'
})

const deliveryFee = computed(() => isPickupOrder.value ? 0 : 5)
const discount = computed(() => {
  if (!order.value) return 0
  return order.value.totalAmount - order.value.payAmount - deliveryFee.value
})

const onCancel = () => {
  showConfirmDialog({ title: '提示', message: '确定取消该订单？' }).then(async () => {
    await orderStore.cancelOrder(orderId)
    showToast('已取消')
  }).catch(() => {})
}

const onPay = () => {
  router.push(`/payment/${orderId}`)
}

const onConfirmReceive = () => {
  showConfirmDialog({ title: '提示', message: '确认已收到商品？' }).then(async () => {
    await orderStore.confirmReceive(orderId)
    showToast('已确认收货')
  }).catch(() => {})
}

const onRebuy = () => {
  router.push('/')
}

const onViewPickupCode = () => {
  router.push(`/pickup/code/${orderId}`)
}

onMounted(() => {
  orderStore.fetchOrderById(orderId)
})
</script>

<template>
  <div class="order-detail-page">
    <AppHeader title="订单详情" show-back @click-left="router.back()" />

    <div v-if="order" class="order-detail-page__content">
      <div class="status-banner" :style="{ background: statusBannerColor }">
        <van-icon :name="statusIcon" size="28" color="#fff" />
        <span class="status-banner__text">{{ formatOrderStatus(order.status) }}</span>
      </div>

      <div v-if="isPickupOrder && order.pickupInfo" class="pickup-section">
        <van-icon name="shop-o" size="20" color="#2DB87B" />
        <div class="pickup-section__info">
          <div class="pickup-section__header">
            <span class="pickup-section__name">{{ order.pickupInfo.store?.name }}</span>
            <van-tag type="primary" plain class="pickup-section__tag">自提</van-tag>
          </div>
          <p class="pickup-section__address">
            {{ order.pickupInfo.store?.address }}
          </p>
          <div class="pickup-section__time">
            <van-icon name="clock-o" size="12" color="#999" />
            <span>取货时段: {{ order.pickupInfo.timeSlot?.label }}</span>
          </div>
        </div>
        <van-button
          v-if="order.status === 'paid'"
          type="primary"
          size="small"
          class="pickup-section__btn"
          @click="onViewPickupCode"
        >
          取货码
        </van-button>
      </div>

      <div v-else-if="order.address" class="address-section">
        <van-icon name="location-o" size="20" color="#2DB87B" />
        <div class="address-section__info">
          <div class="address-section__row">
            <span class="address-section__name">{{ order.address.name }}</span>
            <span class="address-section__phone">{{ order.address.phone }}</span>
          </div>
          <p class="address-section__detail">
            {{ order.address.province }}{{ order.address.city }}{{ order.address.district }}{{ order.address.detail }}
          </p>
        </div>
      </div>

      <div class="product-section">
        <div v-for="item in order.items" :key="item.productId" class="product-item">
          <img :src="item.productImage" class="product-item__img" alt="" />
          <div class="product-item__info">
            <span class="product-item__name">{{ item.productName }}</span>
            <span class="product-item__spec">{{ Object.values(item.specValues).join(' / ') }}</span>
          </div>
          <div class="product-item__right">
            <span class="product-item__price">¥{{ formatPrice(item.price) }}</span>
            <span class="product-item__qty">x{{ item.quantity }}</span>
          </div>
        </div>
      </div>

      <div class="price-section">
        <div class="price-row">
          <span>商品金额</span>
          <span>¥{{ formatPrice(order.totalAmount) }}</span>
        </div>
        <div class="price-row">
          <span>{{ isPickupOrder ? '自提' : '配送费' }}</span>
          <span>{{ isPickupOrder ? '免运费' : `¥${formatPrice(deliveryFee)}` }}</span>
        </div>
        <div class="price-row" v-if="discount > 0">
          <span>优惠</span>
          <span class="price-row--discount">-¥{{ formatPrice(discount) }}</span>
        </div>
        <div class="price-row price-row--total">
          <span>实付金额</span>
          <span class="price-row--pay">¥{{ formatPrice(order.payAmount) }}</span>
        </div>
      </div>

      <div class="info-section">
        <div class="info-row">
          <span class="info-row__label">订单编号</span>
          <span class="info-row__value">{{ order.orderNo }}</span>
        </div>
        <div class="info-row">
          <span class="info-row__label">下单时间</span>
          <span class="info-row__value">{{ formatDate(order.createdAt) }}</span>
        </div>
        <div class="info-row" v-if="order.paidAt">
          <span class="info-row__label">支付时间</span>
          <span class="info-row__value">{{ formatDate(order.paidAt) }}</span>
        </div>
      </div>

      <div class="action-bar" v-if="order.status !== 'cancelled'">
        <van-button
          v-if="order.status === 'pending'"
          size="small"
          plain
          @click="onCancel"
        >
          取消订单
        </van-button>
        <van-button
          v-if="order.status === 'pending'"
          size="small"
          type="primary"
          @click="onPay"
        >
          去付款
        </van-button>
        <van-button
          v-if="order.status === 'shipped'"
          size="small"
          type="primary"
          @click="onConfirmReceive"
        >
          确认收货
        </van-button>
        <van-button
          v-if="order.status === 'delivered'"
          size="small"
          plain
          @click="onRebuy"
        >
          再次购买
        </van-button>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
@use '@/assets/styles/variables' as *;

.order-detail-page {
  min-height: 100vh;
  background: $bg;

  &__content {
    padding-top: 46px;
  }
}

.status-banner {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 20px 20px 24px;
  color: #fff;

  &__text {
    font-size: 18px;
    font-weight: 600;
  }
}

.pickup-section {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  background: $bg-card;
  margin: 12px 16px;
  padding: 14px 16px;
  border-radius: $radius-lg;
  box-shadow: $shadow;
  position: relative;

  &__info {
    flex: 1;
    min-width: 0;
  }

  &__header {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 6px;
  }

  &__name {
    font-size: 15px;
    font-weight: 600;
    color: $text-primary;
  }

  &__tag {
    font-size: 10px;
  }

  &__address {
    font-size: 13px;
    color: $text-secondary;
    line-height: 1.5;
    margin-bottom: 6px;
  }

  &__time {
    display: flex;
    align-items: center;
    gap: 4px;
    font-size: 12px;
    color: $text-secondary;
  }

  &__btn {
    position: absolute;
    right: 16px;
    top: 50%;
    transform: translateY(-50%);
    border-radius: 16px;
    padding: 0 16px;
    height: 32px;
    font-size: 13px;
  }
}

.address-section {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  background: $bg-card;
  margin: 12px 16px;
  padding: 14px 16px;
  border-radius: $radius-lg;
  box-shadow: $shadow;

  &__info {
    flex: 1;
    min-width: 0;
  }

  &__row {
    display: flex;
    gap: 12px;
    margin-bottom: 4px;
  }

  &__name {
    font-size: 15px;
    font-weight: 600;
    color: $text-primary;
  }

  &__phone {
    font-size: 14px;
    color: $text-secondary;
  }

  &__detail {
    font-size: 13px;
    color: $text-secondary;
    line-height: 1.5;
  }
}

.product-section {
  background: $bg-card;
  margin: 12px 16px;
  padding: 14px 16px;
  border-radius: $radius-lg;
  box-shadow: $shadow;
}

.product-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px 0;

  &__img {
    width: 64px;
    height: 64px;
    border-radius: $radius-sm;
    object-fit: cover;
    flex-shrink: 0;
  }

  &__info {
    flex: 1;
    min-width: 0;
    display: flex;
    flex-direction: column;
    gap: 4px;
  }

  &__name {
    font-size: 14px;
    color: $text-primary;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  &__spec {
    font-size: 12px;
    color: $text-secondary;
  }

  &__right {
    display: flex;
    flex-direction: column;
    align-items: flex-end;
    gap: 4px;
  }

  &__price {
    font-size: 14px;
    font-weight: 500;
    color: $text-primary;
  }

  &__qty {
    font-size: 12px;
    color: $text-secondary;
  }
}

.price-section {
  background: $bg-card;
  margin: 12px 16px;
  padding: 14px 16px;
  border-radius: $radius-lg;
  box-shadow: $shadow;
}

.price-row {
  display: flex;
  justify-content: space-between;
  padding: 6px 0;
  font-size: 14px;
  color: $text-secondary;

  &--discount {
    color: $primary;
  }

  &--total {
    border-top: 1px solid $border;
    margin-top: 8px;
    padding-top: 12px;
    font-size: 15px;
    color: $text-primary;
    font-weight: 500;
  }

  &--pay {
    color: $danger;
    font-weight: 700;
    font-size: 18px;
  }
}

.info-section {
  background: $bg-card;
  margin: 12px 16px;
  padding: 14px 16px;
  border-radius: $radius-lg;
  box-shadow: $shadow;
}

.info-row {
  display: flex;
  justify-content: space-between;
  padding: 6px 0;

  &__label {
    font-size: 13px;
    color: $text-secondary;
  }

  &__value {
    font-size: 13px;
    color: $text-primary;
  }
}

.action-bar {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  padding: 12px 16px;
  background: $bg-card;
  box-shadow: 0 -2px 8px rgba(0, 0, 0, 0.06);
  z-index: 10;
}
</style>
