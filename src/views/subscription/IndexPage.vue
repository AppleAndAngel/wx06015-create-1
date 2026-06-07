<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { showToast, showLoadingToast, closeToast } from 'vant'
import { useSubscriptionStore } from '@/stores/subscription'
import { useUserStore } from '@/stores/user'
import { useAddressStore } from '@/stores/address'
import type { SubscriptionProduct, SubscriptionCycle, Weekday } from '@/types'
import dayjs from 'dayjs'

const router = useRouter()
const subscriptionStore = useSubscriptionStore()
const userStore = useUserStore()
const addressStore = useAddressStore()

const refreshing = ref(false)

const categories = computed(() => subscriptionStore.categories)
const products = computed(() => subscriptionStore.products)
const selectedCategory = computed(() => subscriptionStore.selectedCategory)
const loading = computed(() => subscriptionStore.loading)
const activeCount = computed(() => subscriptionStore.activeSubscriptions.length)
const nextDeliveryCount = computed(() => subscriptionStore.nextDeliveryCount)
const totalSaved = computed(() => subscriptionStore.totalSaved)

function formatDate(dateStr: string): string {
  const date = dayjs(dateStr)
  const today = dayjs()
  const diff = date.diff(today, 'day')
  if (diff === 0) return '今天'
  if (diff === 1) return '明天'
  if (diff === 2) return '后天'
  return date.format('MM月DD日')
}

const cycleLabels: Record<SubscriptionCycle, string> = {
  daily: '每日',
  weekly: '每周',
  biweekly: '每两周',
  monthly: '每月',
}

const weekdayLabels = ['周日', '周一', '周二', '周三', '周四', '周五', '周六']

async function loadData() {
  try {
    await Promise.all([
      subscriptionStore.fetchCategories(),
      subscriptionStore.fetchProducts(),
      subscriptionStore.fetchMySubscriptions(),
    ])
    if (userStore.isLoggedIn) {
      await addressStore.fetchAddresses()
    }
  } catch (e) {
    console.error('[Subscription] 加载数据失败', e)
    showToast('加载失败，请重试')
  }
}

function onRefresh() {
  refreshing.value = true
  loadData().finally(() => {
    refreshing.value = false
  })
}

function onSelectCategory(categoryId: string) {
  subscriptionStore.fetchProducts(categoryId)
}

function goToDetail(id: number) {
  router.push(`/subscription/${id}`)
}

function goToMySubscriptions() {
  if (!userStore.isLoggedIn) {
    router.push({ path: '/login', query: { redirect: '/my-subscriptions' } })
    return
  }
  router.push('/my-subscriptions')
}

async function quickSubscribe(e: Event, product: SubscriptionProduct) {
  e.stopPropagation()

  if (!userStore.isLoggedIn) {
    router.push({
      path: '/login',
      query: { redirect: `/subscription/${product.id}` },
    })
    return
  }

  const existing = subscriptionStore.getSubscriptionByProductId(product.id)
  if (existing) {
    showToast('您已订阅此商品，可在"我的订阅"中管理')
    return
  }

  const specValues: Record<string, string> = {}
  product.product.specs.forEach((spec) => {
    specValues[spec.name] = spec.values[0]
  })

  const defaultAddress = addressStore.addresses.find((a) => a.isDefault)
  if (!defaultAddress) {
    showToast('请先添加收货地址')
    router.push('/user/address')
    return
  }

  const weekdays: Weekday[] =
    product.defaultCycle === 'daily'
      ? [1, 2, 3, 4, 5]
      : product.defaultCycle === 'weekly'
      ? [6]
      : [0]

  showLoadingToast({ message: '订阅中...', forbidClick: true })
  try {
    await subscriptionStore.createSubscription({
      subscriptionProductId: product.id,
      specValues,
      quantity: product.minQuantity,
      cycle: product.defaultCycle,
      weekdays,
      startTime: dayjs().format('YYYY-MM-DD'),
      addressId: defaultAddress.id,
    })
    closeToast()
    showToast({ message: '订阅成功！', type: 'success' })
  } catch (err) {
    closeToast()
    showToast({ message: '订阅失败，请重试', type: 'fail' })
  }
}

onMounted(() => {
  loadData()
})
</script>

<template>
  <div class="subscription-page">
    <van-pull-refresh v-model="refreshing" @refresh="onRefresh">
      <div class="page-content">
        <div class="header-banner">
          <div class="header-banner__content">
            <h1 class="header-banner__title">订阅到家</h1>
            <p class="header-banner__subtitle">周期配送 省心又省钱</p>
          </div>
          <div class="header-banner__icon">📦</div>
        </div>

        <div class="my-subscription-card" @click="goToMySubscriptions">
          <div class="my-subscription-card__left">
            <div class="my-subscription-card__icon">🔔</div>
            <div class="my-subscription-card__info">
              <div class="my-subscription-card__title">我的订阅</div>
              <div class="my-subscription-card__desc">
                <template v-if="userStore.isLoggedIn">
                  {{ activeCount }} 个进行中
                  <template v-if="nextDeliveryCount > 0">
                    · {{ nextDeliveryCount }} 个3天内配送
                  </template>
                </template>
                <template v-else> 登录查看我的订阅 </template>
              </div>
            </div>
          </div>
          <div class="my-subscription-card__right">
            <template v-if="userStore.isLoggedIn && totalSaved > 0">
              <span class="my-subscription-card__saved">
                已省 ¥{{ totalSaved.toFixed(0) }}
              </span>
            </template>
            <van-icon name="arrow" size="16" color="#999" />
          </div>
        </div>

        <div class="benefit-section">
          <div class="benefit-item">
            <div class="benefit-item__icon">💰</div>
            <div class="benefit-item__text">
              <div class="benefit-item__title">订阅专享价</div>
              <div class="benefit-item__desc">低至5.7折</div>
            </div>
          </div>
          <div class="benefit-item">
            <div class="benefit-item__icon">🚚</div>
            <div class="benefit-item__text">
              <div class="benefit-item__title">免配送费</div>
              <div class="benefit-item__desc">周期订单</div>
            </div>
          </div>
          <div class="benefit-item">
            <div class="benefit-item__icon">🎯</div>
            <div class="benefit-item__text">
              <div class="benefit-item__title">优先配送</div>
              <div class="benefit-item__desc">VIP待遇</div>
            </div>
          </div>
          <div class="benefit-item">
            <div class="benefit-item__icon">🔄</div>
            <div class="benefit-item__text">
              <div class="benefit-item__title">随时调整</div>
              <div class="benefit-item__desc">灵活管理</div>
            </div>
          </div>
        </div>

        <div class="section-header">
          <h2 class="section-header__title">可订阅商品</h2>
        </div>

        <div class="category-tabs">
          <scroll-view scroll-x class="category-tabs__scroll">
            <div class="category-tabs__inner">
              <div
                v-for="cat in categories"
                :key="cat.id"
                :class="[
                  'category-tab',
                  selectedCategory === cat.id && 'category-tab--active',
                ]"
                @click="onSelectCategory(cat.id)"
              >
                <span class="category-tab__icon">{{ cat.icon }}</span>
                <span class="category-tab__name">{{ cat.name }}</span>
              </div>
            </div>
          </scroll-view>
        </div>

        <van-loading v-if="loading" class="loading" />

        <div v-else class="product-list">
          <div
            v-for="item in products"
            :key="item.id"
            class="product-card"
            @click="goToDetail(item.id)"
          >
            <div class="product-card__img-wrap">
              <img v-lazy="item.product.images[0]" :alt="item.product.name" class="product-card__img" />
              <div class="product-card__discount">{{ item.discount }}</div>
              <div
                v-if="subscriptionStore.isSubscribed(item.id)"
                class="product-card__subscribed"
              >
                已订阅
              </div>
            </div>
            <div class="product-card__content">
              <div class="product-card__name">{{ item.product.name }}</div>
              <div class="product-card__desc">{{ item.product.subtitle }}</div>
              <div class="product-card__tags">
                <span v-for="tag in item.tags" :key="tag" class="product-card__tag">
                  {{ tag }}
                </span>
              </div>
              <div class="product-card__bottom">
                <div class="product-card__prices">
                  <span class="product-card__price">
                    ¥{{ item.subscribePrice.toFixed(1) }}
                  </span>
                  <span class="product-card__original">
                    ¥{{ item.originalPrice.toFixed(1) }}
                  </span>
                  <span class="product-card__cycle">
                    /{{ cycleLabels[item.defaultCycle] }}
                  </span>
                </div>
                <van-button
                  :type="subscriptionStore.isSubscribed(item.id) ? 'default' : 'primary'"
                  size="small"
                  :disabled="subscriptionStore.isSubscribed(item.id)"
                  @click.stop="quickSubscribe($event, item)"
                >
                  {{ subscriptionStore.isSubscribed(item.id) ? '已订阅' : '立即订阅' }}
                </van-button>
              </div>
              <div class="product-card__subscribers">
                {{ item.totalSubscribers }} 人正在订阅
              </div>
            </div>
          </div>
        </div>

        <van-empty v-if="!loading && products.length === 0" description="暂无商品" />
      </div>
    </van-pull-refresh>
  </div>
</template>

<style scoped lang="scss">
@use '@/assets/styles/variables' as *;

.subscription-page {
  min-height: 100vh;
  background: $bg;
}

.page-content {
  padding-bottom: 24px;
}

.header-banner {
  background: linear-gradient(135deg, #4ECDC4 0%, #44A08D 100%);
  padding: 32px 20px 60px;
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: space-between;

  &__title {
    font-size: 28px;
    font-weight: 700;
    margin: 0 0 6px 0;
    font-family: $font-display;
    text-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  }

  &__subtitle {
    font-size: 14px;
    opacity: 0.9;
    margin: 0;
  }

  &__icon {
    font-size: 56px;
    opacity: 0.9;
  }
}

.my-subscription-card {
  margin: -40px 16px 16px;
  background: $bg-card;
  border-radius: $radius-lg;
  padding: 16px;
  box-shadow: $shadow-lg;
  display: flex;
  align-items: center;
  justify-content: space-between;
  cursor: pointer;
  transition: transform 0.2s ease;

  &:active {
    transform: scale(0.98);
  }

  &__left {
    display: flex;
    align-items: center;
    gap: 12px;
  }

  &__icon {
    width: 44px;
    height: 44px;
    border-radius: $radius-md;
    background: linear-gradient(135deg, #4ECDC4 0%, #44A08D 100%);
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 22px;
  }

  &__title {
    font-size: 16px;
    font-weight: 600;
    color: $text-primary;
    margin-bottom: 4px;
  }

  &__desc {
    font-size: 12px;
    color: $text-secondary;
  }

  &__right {
    display: flex;
    align-items: center;
    gap: 8px;
  }

  &__saved {
    font-size: 13px;
    font-weight: 600;
    color: $danger;
  }
}

.benefit-section {
  display: flex;
  justify-content: space-around;
  padding: 16px 20px;
  margin: 0 16px 16px;
  background: $bg-card;
  border-radius: $radius-md;
  box-shadow: $shadow;
}

.benefit-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;

  &__icon {
    font-size: 28px;
  }

  &__title {
    font-size: 13px;
    font-weight: 600;
    color: $text-primary;
  }

  &__desc {
    font-size: 11px;
    color: $text-secondary;
  }
}

.section-header {
  padding: 0 16px;
  margin-bottom: 12px;

  &__title {
    font-size: 18px;
    font-weight: 700;
    color: $text-primary;
    margin: 0;
    font-family: $font-display;
  }
}

.category-tabs {
  margin-bottom: 12px;

  &__scroll {
    white-space: nowrap;
  }

  &__inner {
    display: inline-flex;
    gap: 8px;
    padding: 0 16px;
  }
}

.category-tab {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 8px 14px;
  background: $bg-card;
  border-radius: 20px;
  border: 1px solid $border;
  transition: all 0.2s ease;
  cursor: pointer;

  &--active {
    background: linear-gradient(135deg, #4ECDC4 0%, #44A08D 100%);
    border-color: transparent;

    .category-tab__name {
      color: #fff;
    }
  }

  &__icon {
    font-size: 16px;
  }

  &__name {
    font-size: 13px;
    color: $text-secondary;
    font-weight: 500;
  }
}

.loading {
  padding: 40px 0;
}

.product-list {
  padding: 0 16px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.product-card {
  display: flex;
  gap: 12px;
  background: $bg-card;
  border-radius: $radius-md;
  overflow: hidden;
  box-shadow: $shadow;
  cursor: pointer;
  transition: transform 0.2s ease;

  &:active {
    transform: scale(0.98);
  }

  &__img-wrap {
    position: relative;
    width: 120px;
    height: 120px;
    flex-shrink: 0;
  }

  &__img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  &__discount {
    position: absolute;
    top: 8px;
    left: 8px;
    background: linear-gradient(135deg, $danger, #FF6B6B);
    color: #fff;
    font-size: 11px;
    font-weight: 600;
    padding: 2px 8px;
    border-radius: 10px;
    z-index: 2;
  }

  &__subscribed {
    position: absolute;
    bottom: 8px;
    left: 8px;
    background: rgba(45, 184, 123, 0.95);
    color: #fff;
    font-size: 10px;
    font-weight: 500;
    padding: 2px 8px;
    border-radius: 10px;
    z-index: 2;
  }

  &__content {
    flex: 1;
    padding: 10px 12px 10px 0;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    min-width: 0;
  }

  &__name {
    font-size: 15px;
    font-weight: 600;
    color: $text-primary;
    margin: 0 0 4px 0;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  &__desc {
    font-size: 12px;
    color: $text-secondary;
    margin: 0 0 6px 0;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  &__tags {
    display: flex;
    gap: 4px;
    margin-bottom: 8px;
    flex-wrap: wrap;
  }

  &__tag {
    font-size: 10px;
    color: $primary;
    background: $primary-light;
    padding: 2px 6px;
    border-radius: 8px;
  }

  &__bottom {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 4px;
  }

  &__prices {
    display: flex;
    align-items: baseline;
    gap: 4px;
  }

  &__price {
    font-size: 20px;
    font-weight: 700;
    color: $danger;

    &::before {
      content: '¥';
      font-size: 0.65em;
      font-weight: 600;
    }
  }

  &__original {
    font-size: 12px;
    color: $text-secondary;
    text-decoration: line-through;

    &::before {
      content: '¥';
    }
  }

  &__cycle {
    font-size: 11px;
    color: $text-secondary;
  }

  &__subscribers {
    font-size: 11px;
    color: $text-secondary;
  }
}
</style>
