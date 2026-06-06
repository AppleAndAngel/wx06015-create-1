<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'
import { useGroupBuyStore } from '@/stores/groupBuy'
import AppHeader from '@/components/AppHeader.vue'
import CountdownTimer from '@/components/CountdownTimer.vue'
import EmptyState from '@/components/EmptyState.vue'
import { showLoadingToast, closeToast, showToast } from 'vant'

const router = useRouter()
const userStore = useUserStore()
const groupBuyStore = useGroupBuyStore()

const loading = ref(false)
const activeTab = ref<'pending' | 'success'>('pending')

const pendingOrders = computed(() => groupBuyStore.pendingMyOrders)
const successOrders = computed(() => groupBuyStore.successMyOrders)
const displayOrders = computed(() =>
  activeTab.value === 'pending' ? pendingOrders.value : successOrders.value
)

async function loadData() {
  if (!userStore.isLoggedIn) {
    router.push({ path: '/login', query: { redirect: '/my-groups' } })
    return
  }
  loading.value = true
  showLoadingToast({ message: '加载中...', forbidClick: true })
  try {
    await groupBuyStore.fetchMyOrders()
  } catch (e) {
    console.error('[MyGroups] 加载失败', e)
    showToast('加载失败，请重试')
  } finally {
    loading.value = false
    closeToast()
  }
}

function goToGroupDetail(orderId: number) {
  router.push(`/group-detail/${orderId}`)
}

function goToGroupBuy() {
  router.push('/group-buy')
}

const statusText = (status: string) => {
  switch (status) {
    case 'pending': return '拼团中'
    case 'success': return '拼团成功'
    case 'failed': return '拼团失败'
    default: return '拼团中'
  }
}

const statusClass = (status: string) => {
  switch (status) {
    case 'pending': return 'status--pending'
    case 'success': return 'status--success'
    default: return 'status--pending'
  }
}

const goBack = () => router.back()

onMounted(() => {
  loadData()
})
</script>

<template>
  <div class="my-groups-page">
    <AppHeader title="我的拼团" :show-back="true" @click-left="goBack" />

    <div class="page-body">
      <div class="tabs-section">
        <div class="tabs">
          <div
            :class="['tab-item', activeTab === 'pending' && 'tab-item--active']"
            @click="activeTab = 'pending'"
          >
            <span>拼团中 ({{ pendingOrders.length }})</span>
          </div>
          <div
            :class="['tab-item', activeTab === 'success' && 'tab-item--active']"
            @click="activeTab = 'success'"
          >
            <span>拼团成功 ({{ successOrders.length }})</span>
          </div>
        </div>
      </div>

      <div class="content-section" v-if="displayOrders.length">
        <div
          v-for="order in displayOrders"
          :key="order.id"
          class="order-card"
          @click="goToGroupDetail(order.id)"
        >
          <div class="order-header">
            <span class="order-no">拼团单号: {{ order.groupNo }}</span>
            <span :class="['order-status', statusClass(order.status)]">
              {{ statusText(order.status) }}
            </span>
          </div>

          <div class="order-content">
            <img :src="order.product.images[0]" :alt="order.product.name" class="order-img" />
            <div class="order-info">
              <h3 class="order-name">{{ order.product.name }}</h3>
              <p class="order-spec">
                已选: {{ Object.values(order.specValues).join(' ') }} x {{ order.quantity }}
              </p>
              <div class="order-price">
                <span class="price">¥{{ order.groupPrice.toFixed(2) }}</span>
                <span class="original">¥{{ order.product.originalPrice.toFixed(2) }}</span>
              </div>
            </div>
          </div>

          <div class="order-footer">
            <div class="order-progress">
              <div class="progress-bar">
                <div
                  class="progress-fill"
                  :style="{ width: (order.currentCount / order.groupSize * 100) + '%' }"
                ></div>
              </div>
              <span class="progress-text">{{ order.currentCount }}/{{ order.groupSize }}人</span>
            </div>
            <div class="order-countdown" v-if="order.status === 'pending'">
              <span class="countdown-label">剩余</span>
              <CountdownTimer :end-time="order.endTime" />
            </div>
          </div>

          <div class="order-action" v-if="order.status === 'pending'">
            <van-button type="primary" plain size="small" @click.stop="goToGroupDetail(order.id)">
              查看详情
            </van-button>
          </div>
        </div>
      </div>

      <div v-else class="empty-section">
        <EmptyState :description="activeTab === 'pending' ? '暂无进行中的拼团' : '暂无成功的拼团'">
          <van-button type="primary" @click="goToGroupBuy">去拼团</van-button>
        </EmptyState>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
@use '@/assets/styles/variables' as *;

.my-groups-page {
  min-height: 100vh;
  background: $bg;
}

.page-body {
  padding-top: 46px;
}

.tabs-section {
  background: $bg-card;
  padding: 4px;
  margin: 12px;
  border-radius: $radius-md;
  box-shadow: $shadow;
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
    background: linear-gradient(135deg, #FF6B35, #FF8C42);
    color: #fff;
    font-weight: 600;
  }
}

.content-section {
  padding: 0 12px 16px;
}

.order-card {
  background: $bg-card;
  border-radius: $radius-md;
  box-shadow: $shadow;
  margin-bottom: 12px;
  overflow: hidden;
  cursor: pointer;
  transition: transform 0.2s ease;

  &:active {
    transform: scale(0.99);
  }
}

.order-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 14px;
  border-bottom: 1px solid $border;
}

.order-no {
  font-size: 12px;
  color: $text-secondary;
}

.order-status {
  font-size: 12px;
  font-weight: 600;

  &--pending {
    color: #FF6B35;
  }

  &--success {
    color: $primary;
  }
}

.order-content {
  display: flex;
  gap: 12px;
  padding: 14px;
}

.order-img {
  width: 90px;
  height: 90px;
  object-fit: cover;
  border-radius: $radius-sm;
  flex-shrink: 0;
}

.order-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  min-width: 0;
}

.order-name {
  font-size: 15px;
  font-weight: 500;
  color: $text-primary;
  margin: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.order-spec {
  font-size: 12px;
  color: $text-secondary;
  margin: 4px 0 0;
}

.order-price {
  display: flex;
  align-items: baseline;
  gap: 6px;
}

.price {
  color: #FF6B35;
  font-size: 18px;
  font-weight: 700;

  &::before {
    content: '¥';
    font-size: 0.7em;
  }
}

.original {
  color: $text-secondary;
  text-decoration: line-through;
  font-size: 12px;

  &::before {
    content: '¥';
  }
}

.order-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 14px 12px;
}

.order-progress {
  display: flex;
  align-items: center;
  gap: 8px;
  flex: 1;

  .progress-bar {
    flex: 1;
    max-width: 120px;
    height: 8px;
    background: #FFE8DC;
    border-radius: 4px;
    overflow: hidden;
  }

  .progress-fill {
    height: 100%;
    background: linear-gradient(90deg, #FF6B35, #FF8C42);
    border-radius: 4px;
    transition: width 0.3s ease;
  }

  .progress-text {
    font-size: 11px;
    color: #FF6B35;
    font-weight: 500;
    flex-shrink: 0;
  }
}

.order-countdown {
  display: flex;
  align-items: center;
  gap: 4px;

  .countdown-label {
    font-size: 11px;
    color: $text-secondary;
  }
}

.order-action {
  padding: 0 14px 14px;
  text-align: right;

  :deep(.van-button) {
    border-color: #FF6B35 !important;
    color: #FF6B35 !important;
  }
}

.empty-section {
  padding: 48px 16px;
}
</style>
