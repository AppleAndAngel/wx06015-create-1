<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { Tabs, Tab, Tag, Button, PullRefresh, showConfirmDialog, showToast } from 'vant'
import AppHeader from '@/components/AppHeader.vue'
import EmptyState from '@/components/EmptyState.vue'
import { useOrderStore } from '@/stores/order'
import { formatPrice, formatOrderStatus } from '@/utils/format'
import type { Order } from '@/types'

const route = useRoute()
const router = useRouter()
const orderStore = useOrderStore()

const statusMap: Record<string, number> = {
  all: 0,
  pending: 1,
  paid: 2,
  shipped: 3,
  delivered: 4,
}

const activeTab = ref(statusMap[(route.query.status as string) || 'all'] ?? 0)
const refreshing = ref(false)

const filteredOrders = computed(() => {
  const tabNames = ['all', 'pending', 'paid', 'shipped', 'delivered']
  const status = tabNames[activeTab.value]
  if (status === 'all') return orderStore.orders
  return orderStore.orders.filter((o) => o.status === status)
})

const statusColor = (status: string) => {
  const map: Record<string, string> = {
    pending: '#FFB946',
    paid: '#2DB87B',
    shipped: '#1989FA',
    delivered: '#999',
    cancelled: '#999',
  }
  return map[status] || '#999'
}

const onRefresh = async () => {
  refreshing.value = true
  try {
    await orderStore.fetchOrders()
  } finally {
    refreshing.value = false
  }
}

const goToDetail = (id: number) => {
  router.push(`/user/orders/${id}`)
}

const onCancel = (order: Order) => {
  showConfirmDialog({ title: '提示', message: '确定取消该订单？' }).then(async () => {
    await orderStore.cancelOrder(order.id)
    showToast('已取消')
  }).catch(() => {})
}

const onConfirmReceive = (order: Order) => {
  showConfirmDialog({ title: '提示', message: '确认已收到商品？' }).then(async () => {
    await orderStore.confirmReceive(order.id)
    showToast('已确认收货')
  }).catch(() => {})
}

const onPay = (order: Order) => {
  router.push(`/payment/${order.id}`)
}

const onRebuy = (order: Order) => {
  router.push('/')
}

onMounted(() => {
  orderStore.fetchOrders()
})
</script>

<template>
  <div class="order-list-page">
    <AppHeader title="我的订单" show-back @click-left="router.back()" />
    <div class="order-list-page__content">
      <van-pull-refresh v-model="refreshing" @refresh="onRefresh">
        <van-tabs v-model:active="activeTab" sticky>
          <van-tab title="全部" />
          <van-tab title="待付款" />
          <van-tab title="待发货" />
          <van-tab title="待收货" />
          <van-tab title="已完成" />
        </van-tabs>

        <div class="order-list-page__list">
          <EmptyState v-if="filteredOrders.length === 0" description="暂无订单" />

          <div
            v-for="order in filteredOrders"
            :key="order.id"
            class="order-card"
            @click="goToDetail(order.id)"
          >
            <div class="order-card__head">
              <span class="order-card__no">订单号: {{ order.orderNo }}</span>
              <van-tag :color="statusColor(order.status)" plain size="medium">
                {{ formatOrderStatus(order.status) }}
              </van-tag>
            </div>

            <div class="order-card__items">
              <div v-for="item in order.items" :key="item.productId" class="order-card__item">
                <img :src="item.productImage" class="order-card__item-img" alt="" />
                <div class="order-card__item-info">
                  <span class="order-card__item-name">{{ item.productName }}</span>
                  <span class="order-card__item-spec">
                    {{ Object.values(item.specValues).join(' / ') }}
                  </span>
                  <span class="order-card__item-qty">x{{ item.quantity }}</span>
                </div>
                <span class="order-card__item-price">¥{{ formatPrice(item.price) }}</span>
              </div>
            </div>

            <div class="order-card__foot">
              <span class="order-card__total">
                共{{ order.items.reduce((s, i) => s + i.quantity, 0) }}件 合计:
                <em>¥{{ formatPrice(order.payAmount) }}</em>
              </span>
              <div class="order-card__actions" @click.stop>
                <van-button
                  v-if="order.status === 'pending'"
                  size="small"
                  plain
                  @click="onCancel(order)"
                >
                  取消
                </van-button>
                <van-button
                  v-if="order.status === 'pending'"
                  size="small"
                  type="primary"
                  @click="onPay(order)"
                >
                  付款
                </van-button>
                <van-button
                  v-if="order.status === 'shipped'"
                  size="small"
                  type="primary"
                  @click="onConfirmReceive(order)"
                >
                  确认收货
                </van-button>
                <van-button
                  v-if="order.status === 'delivered'"
                  size="small"
                  plain
                  @click="onRebuy(order)"
                >
                  再次购买
                </van-button>
              </div>
            </div>
          </div>
        </div>
      </van-pull-refresh>
    </div>
  </div>
</template>

<style scoped lang="scss">
@use '@/assets/styles/variables' as *;

.order-list-page {
  min-height: 100vh;
  background: $bg;

  &__content {
    padding-top: 46px;
  }

  &__list {
    padding: 12px 16px;
  }
}

.order-card {
  background: $bg-card;
  border-radius: $radius-lg;
  box-shadow: $shadow;
  margin-bottom: 12px;
  overflow: hidden;

  &__head {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 14px 16px;
    border-bottom: 1px solid $border;
  }

  &__no {
    font-size: 13px;
    color: $text-secondary;
  }

  &__items {
    padding: 12px 16px;
  }

  &__item {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 6px 0;
  }

  &__item-img {
    width: 60px;
    height: 60px;
    border-radius: $radius-sm;
    object-fit: cover;
    flex-shrink: 0;
  }

  &__item-info {
    flex: 1;
    min-width: 0;
    display: flex;
    flex-direction: column;
    gap: 4px;
  }

  &__item-name {
    font-size: 14px;
    color: $text-primary;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  &__item-spec {
    font-size: 12px;
    color: $text-secondary;
  }

  &__item-qty {
    font-size: 12px;
    color: $text-secondary;
  }

  &__item-price {
    font-size: 14px;
    color: $text-primary;
    font-weight: 500;
    white-space: nowrap;
  }

  &__foot {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 12px 16px;
    border-top: 1px solid $border;
  }

  &__total {
    font-size: 13px;
    color: $text-secondary;

    em {
      font-style: normal;
      font-weight: 600;
      color: $danger;
      font-size: 15px;
    }
  }

  &__actions {
    display: flex;
    gap: 8px;
  }
}
</style>
