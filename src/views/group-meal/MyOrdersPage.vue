<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useGroupMealStore } from '@/stores/groupMeal'
import { useUserStore } from '@/stores/user'
import AppHeader from '@/components/AppHeader.vue'
import EmptyState from '@/components/EmptyState.vue'
import { showLoadingToast, closeToast, showToast } from 'vant'
import { formatPrice } from '@/utils/format'
import type { GroupMealOrder } from '@/types'

const router = useRouter()
const groupMealStore = useGroupMealStore()
const userStore = useUserStore()

const loading = ref(false)
const refreshing = ref(false)
const activeTab = ref<'all' | 'pending' | 'paid' | 'delivered'>('all')

const myOrders = computed(() => groupMealStore.myOrders)

const filteredOrders = computed(() => {
  if (activeTab.value === 'all') {
    return myOrders.value
  }
  return myOrders.value.filter(order => order.status === activeTab.value)
})

const statusMap: Record<string, { text: string; color: string }> = {
  pending: { text: '待付款', color: '#FF8C42' },
  paid: { text: '已付款', color: '#2DB87B' },
  confirmed: { text: '已确认', color: '#1E9A63' },
  delivered: { text: '已送达', color: '#667eea' },
  cancelled: { text: '已取消', color: '#8C8C9A' },
}

const tabList = [
  { key: 'all', label: '全部' },
  { key: 'pending', label: '待付款' },
  { key: 'paid', label: '已付款' },
  { key: 'delivered', label: '已送达' },
]

function formatDate(dateStr: string): string {
  const date = new Date(dateStr)
  return `${date.getMonth() + 1}月${date.getDate()}日`
}

function formatDateTime(dateStr: string): string {
  const date = new Date(dateStr)
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')} ${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`
}

async function loadData() {
  if (!userStore.isLoggedIn) {
    router.replace({ path: '/login', query: { redirect: '/my-group-meals' } })
    return
  }
  loading.value = true
  showLoadingToast({ message: '加载中...', forbidClick: true })
  try {
    await groupMealStore.fetchMyOrders()
  } catch (e) {
    console.error('[GroupMealMyOrders] 加载订单失败', e)
    showToast('加载失败，请重试')
  } finally {
    loading.value = false
    closeToast()
  }
}

function onRefresh() {
  refreshing.value = true
  loadData().finally(() => {
    refreshing.value = false
  })
}

function goToOrderDetail(orderId: number) {
  router.push(`/group-meal/order/${orderId}`)
}

function goToOrderNow() {
  router.push('/group-meal')
}

const goBack = () => router.back()

onMounted(() => {
  loadData()
})
</script>

<template>
  <div class="my-orders-page">
    <AppHeader title="我的团餐订单" :show-back="true" @click-left="goBack">
      <template #right>
        <span class="header-right" @click="goToOrderNow">去订购</span>
      </template>
    </AppHeader>

    <div class="page-body">
      <van-pull-refresh v-model="refreshing" @refresh="onRefresh">
        <div class="tabs-section animate-in">
          <div class="tabs">
            <div
              v-for="tab in tabList"
              :key="tab.key"
              :class="['tab-item', activeTab === tab.key && 'tab-item--active']"
              @click="activeTab = tab.key as any"
            >
              <span>{{ tab.label }}</span>
            </div>
          </div>
        </div>

        <div v-if="filteredOrders.length" class="order-list animate-in">
          <div
            v-for="order in filteredOrders"
            :key="order.id"
            class="order-card"
            @click="goToOrderDetail(order.id)"
          >
            <div class="order-card__header">
              <span class="order-no">订单号：{{ order.orderNo }}</span>
              <span
                class="order-status"
                :style="{ color: statusMap[order.status].color }"
              >
                {{ statusMap[order.status].text }}
              </span>
            </div>

            <div class="order-card__body">
              <div v-for="item in order.items" :key="item.packageId" class="order-item">
                <img
                  :src="item.packageImage"
                  :alt="item.packageName"
                  class="item-img"
                />
                <div class="item-info">
                  <h4 class="item-name">{{ item.packageName }}</h4>
                  <p class="item-spec">{{ item.peopleCount }}人份</p>
                  <div class="item-price">
                    <span class="price">¥{{ formatPrice(item.pricePerPerson) }}/人</span>
                    <span class="quantity">× {{ item.peopleCount }}</span>
                  </div>
                </div>
                <div class="item-subtotal">
                  ¥{{ formatPrice(item.subtotal) }}
                </div>
              </div>
            </div>

            <div class="order-card__delivery">
              <van-icon name="location-o" size="14" color="#999" />
              <span class="delivery-date">{{ formatDate(order.deliveryDate) }}</span>
              <span class="delivery-slot">{{ order.timeSlotLabel }}</span>
            </div>

            <div class="order-card__footer">
              <span class="order-time">{{ formatDateTime(order.createdAt) }}</span>
              <div class="order-total">
                <span class="total-label">合计：</span>
                <span class="total-amount">
                  <span class="amount-symbol">¥</span>
                  <span class="amount-value">{{ formatPrice(order.payAmount) }}</span>
                </span>
              </div>
            </div>
          </div>
        </div>

        <EmptyState
          v-else-if="!loading"
          description="暂无团餐订单"
          button-text="去订购"
          @button-click="goToOrderNow"
        />
      </van-pull-refresh>
    </div>
  </div>
</template>

<style scoped lang="scss">
@use '@/assets/styles/variables' as *;

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(24px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.animate-in {
  animation: fadeInUp 0.5s ease both;
}

.my-orders-page {
  min-height: 100vh;
  background: $bg;
}

.page-body {
  padding-top: 46px;
  padding-bottom: 20px;
}

.header-right {
  font-size: 14px;
  color: #fff;
}

.tabs-section {
  margin: 12px 16px 0;
  background: $bg-card;
  border-radius: $radius-md;
  box-shadow: $shadow;
  padding: 4px;
}

.tabs {
  display: flex;
}

.tab-item {
  flex: 1;
  text-align: center;
  padding: 10px 0;
  font-size: 14px;
  color: $text-secondary;
  border-radius: $radius-sm;
  transition: all 0.2s ease;

  &--active {
    background: linear-gradient(135deg, #2DB87B, #1E9A63);
    color: #fff;
    font-weight: 600;
  }
}

.order-list {
  padding: 12px 16px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.order-card {
  background: $bg-card;
  border-radius: $radius-md;
  box-shadow: $shadow;
  overflow: hidden;
  cursor: pointer;
  transition: transform 0.2s ease;

  &:active {
    transform: scale(0.99);
  }

  &__header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 12px 14px;
    border-bottom: 1px solid $border;
  }

  &__body {
    padding: 12px 14px;
  }

  &__delivery {
    display: flex;
    align-items: center;
    gap: 6px;
    padding: 10px 14px;
    background: $bg;
    font-size: 12px;
    color: $text-secondary;
  }

  &__footer {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 12px 14px;
    border-top: 1px solid $border;
  }
}

.order-no {
  font-size: 12px;
  color: $text-secondary;
}

.order-status {
  font-size: 13px;
  font-weight: 600;
}

.order-item {
  display: flex;
  gap: 12px;
  align-items: center;
}

.item-img {
  width: 60px;
  height: 60px;
  border-radius: $radius-sm;
  object-fit: cover;
  flex-shrink: 0;
}

.item-info {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.item-name {
  font-size: 14px;
  font-weight: 500;
  color: $text-primary;
  margin: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.item-spec {
  font-size: 12px;
  color: $text-secondary;
  margin: 0;
}

.item-price {
  display: flex;
  align-items: center;
  gap: 8px;
}

.price {
  font-size: 13px;
  color: $danger;
  font-weight: 500;
}

.quantity {
  font-size: 12px;
  color: $text-secondary;
}

.item-subtotal {
  font-size: 15px;
  font-weight: 600;
  color: $text-primary;
  flex-shrink: 0;
}

.delivery-date {
  font-size: 12px;
  color: $text-secondary;
}

.delivery-slot {
  font-size: 12px;
  color: $text-secondary;
}

.order-time {
  font-size: 12px;
  color: $text-secondary;
}

.order-total {
  display: flex;
  align-items: baseline;
}

.total-label {
  font-size: 13px;
  color: $text-primary;
}

.total-amount {
  display: flex;
  align-items: baseline;
}

.amount-symbol {
  font-size: 12px;
  font-weight: 600;
  color: $danger;
}

.amount-value {
  font-size: 18px;
  font-weight: 700;
  color: $danger;
  font-family: $font-display;
}
</style>
