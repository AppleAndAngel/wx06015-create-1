<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { showToast, showConfirmDialog, showLoadingToast, closeToast, Tab, Tabs } from 'vant'
import { useSubscriptionStore } from '@/stores/subscription'
import { useUserStore } from '@/stores/user'
import AppHeader from '@/components/AppHeader.vue'
import type { Subscription, SubscriptionStatus } from '@/types'
import dayjs from 'dayjs'

const router = useRouter()
const subscriptionStore = useSubscriptionStore()
const userStore = useUserStore()

const currentTab = ref<SubscriptionStatus | 'all'>('all')
const refreshing = ref(false)

const tabs = [
  { name: 'all', title: '全部' },
  { name: 'active', title: '进行中' },
  { name: 'paused', title: '已暂停' },
  { name: 'cancelled', title: '已取消' },
]

const cycleLabels: Record<string, string> = {
  daily: '每日',
  weekly: '每周',
  biweekly: '每两周',
  monthly: '每月',
}

const weekdayLabels = ['周日', '周一', '周二', '周三', '周四', '周五', '周六']

const filteredSubscriptions = computed(() => {
  if (currentTab.value === 'all') {
    return subscriptionStore.mySubscriptions
  }
  return subscriptionStore.mySubscriptions.filter(
    (s) => s.status === currentTab.value
  )
})

const activeCount = computed(() => subscriptionStore.activeSubscriptions.length)
const pausedCount = computed(() =>
  subscriptionStore.mySubscriptions.filter((s) => s.status === 'paused').length
)
const cancelledCount = computed(() =>
  subscriptionStore.mySubscriptions.filter((s) => s.status === 'cancelled').length
)

function formatDate(dateStr: string): string {
  const date = dayjs(dateStr)
  const today = dayjs()
  const diff = date.diff(today, 'day')
  if (diff === 0) return '今天'
  if (diff === 1) return '明天'
  if (diff === 2) return '后天'
  return `${date.format('MM月DD日')} ${weekdayLabels[date.day()]}`
}

function formatWeekdays(sub: Subscription): string {
  if (sub.cycle === 'daily') return '工作日（周一至周五）'
  return sub.weekdays.map((w) => weekdayLabels[w]).join('、')
}

function getStatusText(status: SubscriptionStatus): string {
  const map: Record<SubscriptionStatus, string> = {
    active: '进行中',
    paused: '已暂停',
    cancelled: '已取消',
    expired: '已过期',
  }
  return map[status]
}

function getStatusColor(status: SubscriptionStatus): string {
  const map: Record<SubscriptionStatus, string> = {
    active: '#2DB87B',
    paused: '#FF9500',
    cancelled: '#999',
    expired: '#999',
  }
  return map[status]
}

async function loadData() {
  try {
    await subscriptionStore.fetchMySubscriptions()
  } catch (e) {
    console.error('[MySubscriptions] 加载数据失败', e)
    showToast('加载失败，请重试')
  }
}

function onRefresh() {
  refreshing.value = true
  loadData().finally(() => {
    refreshing.value = false
  })
}

async function handlePause(sub: Subscription) {
  try {
    await showConfirmDialog({
      title: '暂停订阅',
      message: `确定要暂停「${sub.product.name}」的订阅吗？暂停期间不会配送。`,
      confirmButtonText: '确定暂停',
      cancelButtonText: '取消',
    })
    showLoadingToast({ message: '暂停中...', forbidClick: true })
    await subscriptionStore.pauseSubscription(sub.id)
    closeToast()
    showToast({ message: '已暂停订阅', type: 'success' })
  } catch (e) {
    closeToast()
  }
}

async function handleResume(sub: Subscription) {
  try {
    await showConfirmDialog({
      title: '恢复订阅',
      message: `确定要恢复「${sub.product.name}」的订阅吗？`,
      confirmButtonText: '确定恢复',
      cancelButtonText: '取消',
    })
    showLoadingToast({ message: '恢复中...', forbidClick: true })
    await subscriptionStore.resumeSubscription(sub.id)
    closeToast()
    showToast({ message: '已恢复订阅', type: 'success' })
  } catch (e) {
    closeToast()
  }
}

async function handleSkip(sub: Subscription) {
  try {
    await showConfirmDialog({
      title: '跳过下次配送',
      message: `确定要跳过「${sub.product.name}」下次（${formatDate(sub.nextDeliveryDate)}）的配送吗？`,
      confirmButtonText: '确定跳过',
      cancelButtonText: '取消',
    })
    showLoadingToast({ message: '处理中...', forbidClick: true })
    await subscriptionStore.skipNextDelivery(sub.id)
    closeToast()
    showToast({ message: '已跳过下次配送', type: 'success' })
  } catch (e) {
    closeToast()
  }
}

async function handleCancel(sub: Subscription) {
  try {
    await showConfirmDialog({
      title: '取消订阅',
      message: `确定要取消「${sub.product.name}」的订阅吗？取消后无法恢复，已省金额将失效。`,
      confirmButtonText: '确定取消',
      cancelButtonText: '再想想',
      confirmButtonColor: '#FF6B6B',
    })
    showLoadingToast({ message: '取消中...', forbidClick: true })
    await subscriptionStore.cancelSubscription(sub.id)
    closeToast()
    showToast({ message: '已取消订阅', type: 'success' })
  } catch (e) {
    closeToast()
  }
}

function goToEdit(sub: Subscription) {
  router.push(`/subscription/edit/${sub.id}`)
}

function goToSubscriptionHome() {
  router.push('/subscription')
}

function goBack() {
  router.back()
}

onMounted(() => {
  if (!userStore.isLoggedIn) {
    router.push({ path: '/login', query: { redirect: '/my-subscriptions' } })
    return
  }
  loadData()
})
</script>

<template>
  <div class="my-subscriptions-page">
    <AppHeader title="我的订阅" :show-back="true" @click-left="goBack" />

    <van-pull-refresh v-model="refreshing" @refresh="onRefresh">
      <div class="page-content">
        <div class="stats-card">
          <div class="stats-item">
            <div class="stats-item__value">{{ activeCount }}</div>
            <div class="stats-item__label">进行中</div>
          </div>
          <div class="stats-divider"></div>
          <div class="stats-item">
            <div class="stats-item__value">{{ pausedCount }}</div>
            <div class="stats-item__label">已暂停</div>
          </div>
          <div class="stats-divider"></div>
          <div class="stats-item">
            <div class="stats-item__value">{{ cancelledCount }}</div>
            <div class="stats-item__label">已取消</div>
          </div>
          <div class="stats-divider"></div>
          <div class="stats-item">
            <div class="stats-item__value stats-item__value--saved">
              ¥{{ subscriptionStore.totalSaved.toFixed(0) }}
            </div>
            <div class="stats-item__label">累计已省</div>
          </div>
        </div>

        <van-tabs v-model:active="currentTab" class="subscription-tabs" sticky offset-top="46">
          <van-tab v-for="tab in tabs" :key="tab.name" :name="tab.name" :title="tab.title" />
        </van-tabs>

        <div class="subscription-list">
          <div
            v-for="sub in filteredSubscriptions"
            :key="sub.id"
            class="subscription-card"
          >
            <div class="subscription-card__header">
              <div class="subscription-card__status" :style="{ color: getStatusColor(sub.status) }">
                <span class="subscription-card__status-dot" :style="{ background: getStatusColor(sub.status) }"></span>
                {{ getStatusText(sub.status) }}
              </div>
              <div class="subscription-card__cycle">
                {{ cycleLabels[sub.cycle] }} · {{ formatWeekdays(sub) }}
              </div>
            </div>

            <div class="subscription-card__content" @click="goToEdit(sub)">
              <img
                v-lazy="sub.product.images[0]"
                class="subscription-card__img"
                :alt="sub.product.name"
              />
              <div class="subscription-card__info">
                <h3 class="subscription-card__name">{{ sub.product.name }}</h3>
                <div class="subscription-card__spec">
                  <span v-for="(val, key) in sub.specValues" :key="key" class="subscription-card__spec-item">
                    {{ val }}
                  </span>
                  <span class="subscription-card__quantity">× {{ sub.quantity }}</span>
                </div>
                <div class="subscription-card__next-delivery">
                  <van-icon name="clock-o" size="12" color="#4ECDC4" />
                  <span>下次配送：{{ formatDate(sub.nextDeliveryDate) }}</span>
                </div>
              </div>
              <div class="subscription-card__price">
                <span class="subscription-card__price-value">
                  ¥{{ (sub.product.price * sub.quantity).toFixed(1) }}
                </span>
                <span class="subscription-card__price-label">/次</span>
              </div>
            </div>

            <div class="subscription-card__footer">
              <div class="subscription-card__saved">
                累计已省 <span class="subscription-card__saved-amount">¥{{ sub.totalSaved.toFixed(2) }}</span>
              </div>
              <div class="subscription-card__actions">
                <template v-if="sub.status === 'active'">
                  <van-button size="small" plain type="default" @click.stop="handleSkip(sub)">
                    跳过下次
                  </van-button>
                  <van-button size="small" plain type="default" @click.stop="handlePause(sub)">
                    暂停
                  </van-button>
                </template>
                <template v-else-if="sub.status === 'paused'">
                  <van-button size="small" type="primary" @click.stop="handleResume(sub)">
                    恢复
                  </van-button>
                </template>
                <template v-if="sub.status !== 'cancelled' && sub.status !== 'expired'">
                  <van-button size="small" plain type="danger" @click.stop="handleCancel(sub)">
                    取消
                  </van-button>
                </template>
              </div>
            </div>

            <div class="subscription-card__delivery-records" v-if="sub.deliveryRecords && sub.deliveryRecords.length > 0">
              <div class="subscription-card__records-title">
                <van-icon name="orders-o" size="14" color="#999" />
                近期配送记录
              </div>
              <div class="subscription-card__records-list">
                <div
                  v-for="record in sub.deliveryRecords.slice(0, 3)"
                  :key="record.id"
                  class="subscription-card__record-item"
                >
                  <span class="subscription-card__record-date">
                    {{ dayjs(record.deliveryDate).format('MM-DD') }}
                  </span>
                  <span class="subscription-card__record-status" :class="`subscription-card__record-status--${record.status}`">
                    {{ record.status === 'delivered' ? '已送达' : record.status === 'delivering' ? '配送中' : '待配送' }}
                  </span>
                  <span class="subscription-card__record-quantity">×{{ record.quantity }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <van-empty
          v-if="filteredSubscriptions.length === 0"
          description="暂无订阅"
          class="empty-state"
        >
          <van-button type="primary" round @click="goToSubscriptionHome">
            去订阅商品
          </van-button>
        </van-empty>
      </div>
    </van-pull-refresh>
  </div>
</template>

<style scoped lang="scss">
@use '@/assets/styles/variables' as *;

.my-subscriptions-page {
  min-height: 100vh;
  background: $bg;
}

.page-content {
  padding-bottom: 24px;
}

.stats-card {
  display: flex;
  align-items: center;
  background: linear-gradient(135deg, #4ECDC4 0%, #44A08D 100%);
  margin: 0 16px 16px;
  padding: 20px 16px;
  border-radius: $radius-lg;
  box-shadow: $shadow-lg;
}

.stats-item {
  flex: 1;
  text-align: center;
  color: #fff;

  &__value {
    font-size: 22px;
    font-weight: 700;
    margin-bottom: 4px;
    font-family: $font-display;

    &--saved {
      font-size: 18px;
    }
  }

  &__label {
    font-size: 12px;
    opacity: 0.9;
  }
}

.stats-divider {
  width: 1px;
  height: 32px;
  background: rgba(255, 255, 255, 0.3);
}

.subscription-tabs {
  background: $bg-card;
  margin-bottom: 12px;
}

.subscription-list {
  padding: 0 16px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.subscription-card {
  background: $bg-card;
  border-radius: $radius-md;
  overflow: hidden;
  box-shadow: $shadow;

  &__header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 12px 16px;
    border-bottom: 1px solid $border;
  }

  &__status {
    display: flex;
    align-items: center;
    gap: 6px;
    font-size: 13px;
    font-weight: 600;
  }

  &__status-dot {
    width: 6px;
    height: 6px;
    border-radius: 50%;
  }

  &__cycle {
    font-size: 12px;
    color: $text-secondary;
  }

  &__content {
    display: flex;
    padding: 12px 16px;
    gap: 12px;
    cursor: pointer;
    transition: background 0.2s ease;

    &:active {
      background: $bg-gray;
    }
  }

  &__img {
    width: 80px;
    height: 80px;
    border-radius: $radius-sm;
    object-fit: cover;
    flex-shrink: 0;
  }

  &__info {
    flex: 1;
    min-width: 0;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
  }

  &__name {
    font-size: 15px;
    font-weight: 600;
    color: $text-primary;
    margin: 0 0 6px 0;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  &__spec {
    display: flex;
    flex-wrap: wrap;
    gap: 6px;
    margin-bottom: 6px;
  }

  &__spec-item {
    font-size: 11px;
    color: $text-secondary;
    background: $bg-gray;
    padding: 2px 6px;
    border-radius: 4px;
  }

  &__quantity {
    font-size: 12px;
    color: $text-secondary;
  }

  &__next-delivery {
    display: flex;
    align-items: center;
    gap: 4px;
    font-size: 12px;
    color: #4ECDC4;
    font-weight: 500;
  }

  &__price {
    display: flex;
    flex-direction: column;
    align-items: flex-end;
    justify-content: center;
    flex-shrink: 0;
  }

  &__price-value {
    font-size: 20px;
    font-weight: 700;
    color: $danger;

    &::before {
      content: '¥';
      font-size: 0.6em;
      font-weight: 600;
    }
  }

  &__price-label {
    font-size: 11px;
    color: $text-secondary;
  }

  &__footer {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 12px 16px;
    border-top: 1px solid $border;
    background: $bg-gray;
  }

  &__saved {
    font-size: 12px;
    color: $text-secondary;
  }

  &__saved-amount {
    color: $danger;
    font-weight: 600;
    font-size: 13px;
  }

  &__actions {
    display: flex;
    gap: 8px;
  }

  &__delivery-records {
    padding: 12px 16px;
    border-top: 1px solid $border;
  }

  &__records-title {
    display: flex;
    align-items: center;
    gap: 6px;
    font-size: 12px;
    color: $text-secondary;
    margin-bottom: 8px;
  }

  &__records-list {
    display: flex;
    flex-direction: column;
    gap: 6px;
  }

  &__record-item {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 12px;
  }

  &__record-date {
    color: $text-secondary;
    width: 50px;
  }

  &__record-status {
    flex: 1;

    &--delivered {
      color: $primary;
    }

    &--delivering {
      color: #FF9500;
    }

    &--pending {
      color: $text-secondary;
    }
  }

  &__record-quantity {
    color: $text-secondary;
  }
}

.empty-state {
  padding: 60px 0;
}
</style>
