<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useCartStore } from '@/stores/cart'
import { useUserStore } from '@/stores/user'
import { mockCategories as categories } from '@/mock/categories'
import { flashSaleProducts, products } from '@/mock/products'
import ProductCard from '@/components/ProductCard.vue'
import CountdownTimer from '@/components/CountdownTimer.vue'
import { showToast, showLoadingToast, closeToast } from 'vant'
import type { Product, NewUserZoneData } from '@/types'

const router = useRouter()
const cartStore = useCartStore()
const userStore = useUserStore()

const flashEndTime = computed(() => Date.now() + 2 * 60 * 60 * 1000)

const newUserZoneData = ref<NewUserZoneData | null>(null)
const isClaiming = ref(false)
const couponEndTime = computed(() => {
  if (newUserZoneData.value?.coupon?.endTime) {
    return new Date(newUserZoneData.value.coupon.endTime).getTime()
  }
  return Date.now() + 7 * 24 * 60 * 60 * 1000
})

const showNewUserZone = computed(() => {
  if (!userStore.isLoggedIn) {
    return true
  }
  return userStore.isNewUser && !userStore.hasClaimedNewUserCoupon
})

const canClaimCoupon = computed(() => {
  if (!userStore.isLoggedIn) {
    return true
  }
  return !userStore.hasClaimedNewUserCoupon
})

const claimButtonText = computed(() => {
  if (!userStore.isLoggedIn) {
    return '登录领取'
  }
  if (userStore.hasClaimedNewUserCoupon) {
    return '已领取'
  }
  return '立即领取'
})

const newUserProducts = computed<Product[]>(() => {
  return newUserZoneData.value?.products ?? []
})

async function handleClaimCoupon() {
  if (isClaiming.value) return
  if (!userStore.isLoggedIn) {
    router.push({ path: '/login', query: { redirect: '/' } })
    return
  }
  if (userStore.hasClaimedNewUserCoupon) {
    showToast({ message: '您已领取过新人优惠券', type: 'fail' })
    return
  }
  isClaiming.value = true
  showLoadingToast({ message: '领取中...', forbidClick: true })
  try {
    await userStore.claimNewUserCoupon()
    closeToast()
    showToast({ message: '领取成功！首单立减15元', type: 'success' })
  } catch (e: any) {
    closeToast()
    showToast({ message: e.message || '领取失败', type: 'fail' })
  } finally {
    isClaiming.value = false
  }
}

function goToProductDetail(id: number) {
  router.push(`/product/${id}`)
}

async function handleAddToCartFromNewUser(e: Event, product: Product) {
  e.stopPropagation()
  if (!userStore.isLoggedIn) {
    router.push({ path: '/login', query: { redirect: `/product/${product.id}` } })
    return
  }
  const specValues: Record<string, string> = {}
  product.specs.forEach(spec => {
    specValues[spec.name] = spec.values[0]
  })
  showLoadingToast({ message: '加入中...', forbidClick: true })
  try {
    await cartStore.addItem(product, specValues, 1)
    closeToast()
    showToast({ message: '已加入购物车', type: 'success' })
  } catch (err) {
    closeToast()
    showToast({ message: '加入失败，请重试', type: 'fail' })
  }
}

onMounted(async () => {
  try {
    const data = await userStore.getNewUserZoneData()
    newUserZoneData.value = data
  } catch (e) {
    console.error('获取新人专区数据失败', e)
  }
  if (userStore.isLoggedIn) {
    if (!userStore.userInfo) {
      try {
        await userStore.getUserInfo()
      } catch (e) {
        console.error('获取用户信息失败', e)
      }
    }
    try {
      await userStore.getCouponList()
    } catch (e) {
      console.error('获取优惠券列表失败', e)
    }
    try {
      await cartStore.fetchCart()
    } catch (e) {
      console.error('获取购物车数据失败', e)
    }
  }
})

const refreshing = ref(false)
const loading = ref(false)
const finished = ref(false)
const displayProducts = ref<typeof products>([])
const pageSize = 6
let currentIndex = 0

const onLoad = () => {
  setTimeout(() => {
    const next = products.slice(currentIndex, currentIndex + pageSize)
    displayProducts.value.push(...next)
    currentIndex += pageSize
    loading.value = false
    if (currentIndex >= products.length) {
      finished.value = true
    }
  }, 300)
}

const onRefresh = () => {
  setTimeout(() => {
    displayProducts.value = []
    currentIndex = 0
    finished.value = false
    loading.value = true
    onLoad()
    refreshing.value = false
  }, 500)
}

const goToCategory = (id: number) => {
  router.push({ path: '/category', query: { id: String(id) } })
}

const goToSearch = () => {
  router.push('/search')
}

const goToCart = () => {
  router.push('/cart')
}

const goToGroupBuy = () => {
  router.push('/group-buy')
}

const goToPresale = () => {
  router.push('/presale')
}

const goToGiftCard = () => {
  router.push('/gift-card')
}

const goToGroupMeal = () => {
  router.push('/group-meal')
}
</script>

<template>
  <div class="page-with-tabbar">
    <div class="top-bar">
      <div class="top-bar__inner">
        <div class="search-box" @click="goToSearch">
          <van-icon name="search" size="16" color="#999" />
          <span class="search-box__placeholder">搜索新鲜好物...</span>
        </div>
        <div class="top-bar__cart" @click="goToCart">
          <van-icon name="shopping-cart-o" size="22" color="#fff" />
          <van-badge v-if="cartStore.totalCount > 0" :content="cartStore.totalCount" class="cart-badge" />
        </div>
      </div>
    </div>

    <div class="page-body">
      <van-pull-refresh v-model="refreshing" @refresh="onRefresh">
        <div class="banner-section animate-in">
          <van-swipe :autoplay="3000" indicator-color="#fff" class="banner-swipe">
            <van-swipe-item>
              <div class="banner-slide banner-slide--1">
                <h2 class="banner-slide__title">产地直供 新鲜到家</h2>
                <p class="banner-slide__desc">从田间到餐桌，全程冷链配送</p>
              </div>
            </van-swipe-item>
            <van-swipe-item>
              <div class="banner-slide banner-slide--2">
                <h2 class="banner-slide__title">限时秒杀 低至5折</h2>
                <p class="banner-slide__desc">每日精选，手慢无</p>
              </div>
            </van-swipe-item>
            <van-swipe-item>
              <div class="banner-slide banner-slide--3">
                <h2 class="banner-slide__title">新人专享 首单立减</h2>
                <p class="banner-slide__desc">注册即享新人礼包</p>
              </div>
            </van-swipe-item>
          </van-swipe>
        </div>

        <div class="new-user-section animate-in" v-if="showNewUserZone && newUserZoneData">
          <div class="new-user-banner">
            <div class="new-user-banner__left">
              <div class="new-user-banner__tag">新人专享</div>
              <div class="new-user-banner__title">{{ newUserZoneData.banner.title }}</div>
              <div class="new-user-banner__subtitle">{{ newUserZoneData.banner.subtitle }}</div>
              <div class="new-user-banner__valid">
                <van-icon name="clock-o" size="12" />
                <span>有效期 7 天</span>
              </div>
            </div>
            <div class="new-user-banner__right">
              <div class="new-user-banner__coupon">
                <div class="coupon-value">
                  <span class="coupon-symbol">¥</span>
                  <span class="coupon-amount">{{ newUserZoneData.banner.couponValue }}</span>
                </div>
                <div class="coupon-condition">满{{ newUserZoneData.banner.minAmount }}可用</div>
              </div>
              <van-button
                type="primary"
                class="claim-btn"
                :loading="isClaiming"
                :disabled="userStore.isLoggedIn && userStore.hasClaimedNewUserCoupon"
                @click.stop="handleClaimCoupon"
              >
                {{ claimButtonText }}
              </van-button>
            </div>
          </div>

          <div class="new-user-products">
            <div class="section-header">
              <h2 class="section-header__title">新人特惠</h2>
              <span class="section-header__desc">精选好物 仅限新人</span>
            </div>
            <div class="new-user-grid">
              <div
                v-for="item in newUserProducts"
                :key="item.id"
                class="new-user-card"
                @click="goToProductDetail(item.id)"
              >
                <div class="new-user-card__badge">新人价</div>
                <img v-lazy="item.images[0]" :alt="item.name" class="new-user-card__img" />
                <div class="new-user-card__content">
                  <p class="new-user-card__name">{{ item.name }}</p>
                  <div class="new-user-card__prices">
                    <span class="new-user-card__price">¥{{ item.price.toFixed(1) }}</span>
                    <span class="new-user-card__original">¥{{ item.originalPrice.toFixed(1) }}</span>
                  </div>
                  <div class="new-user-card__bottom">
                    <div class="new-user-card__limit">
                      <van-icon name="info-o" size="10" />
                      <span>限购1件</span>
                    </div>
                    <div
                      class="new-user-card__add-btn"
                      @click="handleAddToCartFromNewUser($event, item)"
                    >
                      <van-icon name="plus" size="14" color="#fff" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="group-entry-section animate-in" @click="goToGroupBuy">
          <div class="group-entry-banner">
            <div class="group-entry-left">
              <span class="group-entry-tag">拼团购</span>
              <h3 class="group-entry-title">双人拼团 立省20%</h3>
              <p class="group-entry-desc">邀请好友一起买，更划算</p>
            </div>
            <div class="group-entry-right">
              <span class="group-entry-btn">去拼团</span>
              <van-icon name="arrow" size="16" color="#fff" />
            </div>
          </div>
        </div>

        <div class="presale-entry-section animate-in" @click="goToPresale">
          <div class="presale-entry-banner">
            <div class="presale-entry-left">
              <span class="presale-entry-tag">预售日历</span>
              <h3 class="presale-entry-title">时令上新 抢先预约</h3>
              <p class="presale-entry-desc">查看未来一周好物，开售提醒不错过</p>
            </div>
            <div class="presale-entry-right">
              <span class="presale-entry-btn">去看看</span>
              <van-icon name="arrow" size="16" color="#fff" />
            </div>
          </div>
        </div>

        <div class="gift-card-entry-section animate-in" @click="goToGiftCard">
          <div class="gift-card-entry-banner">
            <div class="gift-card-entry-left">
              <span class="gift-card-entry-tag">礼品卡</span>
              <h3 class="gift-card-entry-title">生鲜好礼 送亲送友</h3>
              <p class="gift-card-entry-desc">挑选面额，写下祝福，送给家人朋友</p>
            </div>
            <div class="gift-card-entry-right">
              <span class="gift-card-entry-btn">去选购</span>
              <van-icon name="arrow" size="16" color="#fff" />
            </div>
          </div>
        </div>

        <div class="group-meal-entry-section animate-in" @click="goToGroupMeal">
          <div class="group-meal-entry-banner">
            <div class="group-meal-entry-left">
              <span class="group-meal-entry-tag">企业团餐</span>
              <h3 class="group-meal-entry-title">企业团餐 省心省力</h3>
              <p class="group-meal-entry-desc">按人数选套餐，准时配送到公司</p>
            </div>
            <div class="group-meal-entry-right">
              <span class="group-meal-entry-btn">去订购</span>
              <van-icon name="arrow" size="16" color="#fff" />
            </div>
          </div>
        </div>

        <div class="flash-section animate-in">
          <div class="flash-header">
            <div class="flash-header__left">
              <span class="flash-header__title">限时秒杀</span>
              <CountdownTimer :end-time="flashEndTime" />
            </div>
            <span class="flash-header__more">更多 &gt;</span>
          </div>
          <div class="flash-list">
            <div v-for="item in flashSaleProducts" :key="item.id" class="flash-card">
              <img v-lazy="item.images[0]" :alt="item.name" class="flash-card__img" />
              <p class="flash-card__name">{{ item.name }}</p>
              <div class="flash-card__prices">
                <span class="flash-card__price">¥{{ item.price.toFixed(0) }}</span>
                <span class="flash-card__original">¥{{ item.originalPrice.toFixed(0) }}</span>
              </div>
            </div>
          </div>
        </div>

        <div class="category-section animate-in">
          <div class="category-grid">
            <div
              v-for="cat in categories.slice(0, 8)"
              :key="cat.id"
              class="category-item"
              @click="goToCategory(cat.id)"
            >
              <span class="category-item__icon">{{ cat.icon }}</span>
              <span class="category-item__name">{{ cat.name }}</span>
            </div>
          </div>
        </div>

        <div class="recommend-section animate-in">
          <h2 class="section-title">为你推荐</h2>
          <van-list v-model:loading="loading" :finished="finished" finished-text="没有更多了" @load="onLoad">
            <div class="product-grid">
              <ProductCard v-for="p in displayProducts" :key="p.id" :product="p" mode="grid" />
            </div>
          </van-list>
        </div>
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

.page-with-tabbar {
  min-height: 100vh;
  background: $bg;
}

.top-bar {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 100;
  background: linear-gradient(135deg, #2DB87B, #1E9A63);
  padding: 10px 16px;
  padding-top: calc(env(safe-area-inset-top, 0px) + 10px);

  &__inner {
    display: flex;
    align-items: center;
    gap: 12px;
  }

  &__cart {
    position: relative;
    flex-shrink: 0;
    padding: 4px;
  }
}

.search-box {
  flex: 1;
  display: flex;
  align-items: center;
  gap: 8px;
  background: #fff;
  border-radius: 20px;
  padding: 8px 14px;

  &__placeholder {
    color: #999;
    font-size: 14px;
  }
}

.cart-badge {
  position: absolute;
  top: -4px;
  right: -4px;
}

.page-body {
  padding-top: calc(env(safe-area-inset-top, 0px) + 54px);
}

.banner-section {
  padding: 12px 16px 0;
}

.banner-swipe {
  border-radius: $radius-md;
  overflow: hidden;
}

.banner-slide {
  height: 160px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  padding: 0 28px;
  color: #fff;

  &--1 {
    background: linear-gradient(135deg, #2DB87B, #1E9A63);
  }

  &--2 {
    background: linear-gradient(135deg, #FF8C42, #FF6B35);
  }

  &--3 {
    background: linear-gradient(135deg, #667eea, #764ba2);
  }

  &__title {
    font-family: $font-display;
    font-size: 24px;
    margin-bottom: 8px;
    text-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
  }

  &__desc {
    font-size: 14px;
    opacity: 0.9;
  }
}

.flash-section {
  margin: 16px 16px 0;
  background: $bg-card;
  border-radius: $radius-md;
  box-shadow: $shadow;
  overflow: hidden;
}

.flash-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 14px;
  background: linear-gradient(135deg, #FF8C42, #FF6B35);
  color: #fff;

  &__left {
    display: flex;
    align-items: center;
    gap: 10px;
  }

  &__title {
    font-size: 16px;
    font-weight: 700;
    font-family: $font-display;
  }

  &__more {
    font-size: 12px;
    opacity: 0.9;
  }
}

.flash-list {
  display: flex;
  gap: 10px;
  padding: 12px 14px;
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;

  &::-webkit-scrollbar {
    display: none;
  }
}

.new-user-section {
  margin: 16px 16px 0;
  background: $bg-card;
  border-radius: $radius-md;
  box-shadow: $shadow;
  overflow: hidden;
}

.new-user-banner {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: #fff;

  &__left {
    flex: 1;
  }

  &__tag {
    display: inline-block;
    padding: 2px 8px;
    background: rgba(255, 255, 255, 0.25);
    border-radius: 10px;
    font-size: 11px;
    font-weight: 500;
    margin-bottom: 8px;
  }

  &__title {
    font-size: 22px;
    font-weight: 700;
    font-family: $font-display;
    margin-bottom: 4px;
    text-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
  }

  &__subtitle {
    font-size: 14px;
    opacity: 0.95;
    margin-bottom: 6px;
  }

  &__valid {
    display: flex;
    align-items: center;
    gap: 4px;
    font-size: 11px;
    opacity: 0.85;
  }

  &__right {
    flex-shrink: 0;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 8px;
  }

  &__coupon {
    background: rgba(255, 255, 255, 0.95);
    color: $danger;
    padding: 8px 12px;
    border-radius: $radius-sm;
    text-align: center;
    min-width: 80px;
  }
}

.coupon-value {
  display: flex;
  align-items: baseline;
  justify-content: center;
  line-height: 1;

  .coupon-symbol {
    font-size: 14px;
    font-weight: 600;
  }

  .coupon-amount {
    font-size: 28px;
    font-weight: 700;
    font-family: $font-display;
  }
}

.coupon-condition {
  font-size: 10px;
  color: $text-secondary;
  margin-top: 2px;
}

.claim-btn {
  min-width: 80px !important;
  height: 32px !important;
  font-size: 13px !important;
  border-radius: 16px !important;
  background: #fff !important;
  color: #764ba2 !important;
  border: none !important;

  &--disabled {
    opacity: 0.7;
  }
}

.new-user-products {
  padding: 12px;
}

.section-header {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  margin-bottom: 10px;
  padding: 0 2px;

  &__title {
    font-size: 16px;
    font-weight: 700;
    color: $text-primary;
    font-family: $font-display;
    margin: 0;
  }

  &__desc {
    font-size: 11px;
    color: $text-secondary;
  }
}

.new-user-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 10px;
}

.new-user-card {
  background: $bg;
  border-radius: $radius-sm;
  overflow: hidden;
  position: relative;
  cursor: pointer;
  transition: transform 0.2s ease;

  &:active {
    transform: scale(0.98);
  }

  &__badge {
    position: absolute;
    top: 0;
    left: 0;
    background: linear-gradient(135deg, #FF8C42, #FF6B35);
    color: #fff;
    font-size: 10px;
    font-weight: 600;
    padding: 3px 8px;
    border-radius: 0 0 $radius-sm 0;
    z-index: 2;
  }

  &__img {
    width: 100%;
    aspect-ratio: 1;
    object-fit: cover;
    display: block;
  }

  &__content {
    padding: 8px 10px 10px;
  }

  &__name {
    font-size: 13px;
    color: $text-primary;
    margin: 0 0 6px 0;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    font-weight: 500;
  }

  &__prices {
    display: flex;
    align-items: baseline;
    gap: 4px;
    margin-bottom: 6px;
  }

  &__price {
    color: $danger;
    font-weight: 700;
    font-size: 16px;

    &::before {
      content: '¥';
      font-size: 0.7em;
    }
  }

  &__original {
    color: $text-secondary;
    text-decoration: line-through;
    font-size: 11px;

    &::before {
      content: '¥';
    }
  }

  &__bottom {
    display: flex;
    align-items: center;
    justify-content: space-between;
  }

  &__limit {
    display: flex;
    align-items: center;
    gap: 3px;
    font-size: 10px;
    color: $primary;
  }

  &__add-btn {
    width: 24px;
    height: 24px;
    border-radius: 50%;
    background: linear-gradient(135deg, $primary, $primary-dark);
    display: flex;
    align-items: center;
    justify-content: center;
    box-shadow: 0 2px 6px rgba(45, 184, 123, 0.4);
    transition: transform 0.2s ease;

    &:active {
      transform: scale(0.9);
    }
  }
}

.flash-card {
  flex-shrink: 0;
  width: 110px;
  text-align: center;

  &__img {
    width: 100px;
    height: 100px;
    object-fit: cover;
    border-radius: $radius-sm;
  }

  &__name {
    font-size: 12px;
    color: $text-primary;
    margin-top: 6px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  &__prices {
    display: flex;
    align-items: baseline;
    justify-content: center;
    gap: 4px;
    margin-top: 4px;
  }

  &__price {
    color: $danger;
    font-weight: 700;
    font-size: 15px;
  }

  &__original {
    color: $text-secondary;
    text-decoration: line-through;
    font-size: 11px;
  }
}

.category-section {
  margin: 16px 16px 0;
  background: $bg-card;
  border-radius: $radius-md;
  box-shadow: $shadow;
  padding: 16px 8px;
}

.category-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 12px 0;
}

.category-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  cursor: pointer;

  &__icon {
    font-size: 36px;
    line-height: 1;
  }

  &__name {
    font-size: 12px;
    color: $text-primary;
  }
}

.recommend-section {
  margin: 16px 16px 0;
}

.section-title {
  font-size: 18px;
  font-weight: 700;
  color: $text-primary;
  margin-bottom: 12px;
  font-family: $font-display;
}

.product-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 10px;
}

.group-entry-section {
  margin: 16px 16px 0;
  cursor: pointer;
  transition: transform 0.2s ease;

  &:active {
    transform: scale(0.99);
  }
}

.group-entry-banner {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 20px;
  background: linear-gradient(135deg, #FF6B35, #FF8C42);
  border-radius: $radius-md;
  box-shadow: 0 4px 12px rgba(255, 107, 53, 0.25);
  color: #fff;
}

.group-entry-left {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.group-entry-tag {
  display: inline-block;
  padding: 2px 8px;
  background: rgba(255, 255, 255, 0.25);
  border-radius: 10px;
  font-size: 11px;
  font-weight: 600;
  width: fit-content;
}

.group-entry-title {
  font-size: 18px;
  font-weight: 700;
  font-family: $font-display;
  margin: 2px 0 0;
  text-shadow: 0 2px 6px rgba(0, 0, 0, 0.12);
}

.group-entry-desc {
  font-size: 12px;
  opacity: 0.9;
  margin: 2px 0 0;
}

.group-entry-right {
  display: flex;
  align-items: center;
  gap: 4px;
}

.group-entry-btn {
  font-size: 13px;
  font-weight: 600;
}

.presale-entry-section {
  margin: 16px 16px 0;
  cursor: pointer;
  transition: transform 0.2s ease;

  &:active {
    transform: scale(0.99);
  }
}

.presale-entry-banner {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 20px;
  background: linear-gradient(135deg, #2DB87B, #1E9A63);
  border-radius: $radius-md;
  box-shadow: 0 4px 12px rgba(45, 184, 123, 0.25);
  color: #fff;
}

.presale-entry-left {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.presale-entry-tag {
  display: inline-block;
  padding: 2px 8px;
  background: rgba(255, 255, 255, 0.25);
  border-radius: 10px;
  font-size: 11px;
  font-weight: 600;
  width: fit-content;
}

.presale-entry-title {
  font-size: 18px;
  font-weight: 700;
  font-family: $font-display;
  margin: 2px 0 0;
  text-shadow: 0 2px 6px rgba(0, 0, 0, 0.12);
}

.presale-entry-desc {
  font-size: 12px;
  opacity: 0.9;
  margin: 2px 0 0;
}

.presale-entry-right {
  display: flex;
  align-items: center;
  gap: 4px;
}

.presale-entry-btn {
  font-size: 13px;
  font-weight: 600;
}

.gift-card-entry-section {
  margin: 16px 16px 0;
  cursor: pointer;
  transition: transform 0.2s ease;

  &:active {
    transform: scale(0.99);
  }
}

.gift-card-entry-banner {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 20px;
  background: linear-gradient(135deg, #FF6B6B, #FF8E53);
  border-radius: $radius-md;
  box-shadow: 0 4px 12px rgba(255, 107, 107, 0.25);
  color: #fff;
}

.gift-card-entry-left {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.gift-card-entry-tag {
  display: inline-block;
  padding: 2px 8px;
  background: rgba(255, 255, 255, 0.25);
  border-radius: 10px;
  font-size: 11px;
  font-weight: 600;
  width: fit-content;
}

.gift-card-entry-title {
  font-size: 18px;
  font-weight: 700;
  font-family: $font-display;
  margin: 2px 0 0;
  text-shadow: 0 2px 6px rgba(0, 0, 0, 0.12);
}

.gift-card-entry-desc {
  font-size: 12px;
  opacity: 0.9;
  margin: 2px 0 0;
}

.gift-card-entry-right {
  display: flex;
  align-items: center;
  gap: 4px;
}

.gift-card-entry-btn {
  font-size: 13px;
  font-weight: 600;
}

.group-meal-entry-section {
  margin: 16px 16px 0;
  cursor: pointer;
  transition: transform 0.2s ease;

  &:active {
    transform: scale(0.99);
  }
}

.group-meal-entry-banner {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 20px;
  background: linear-gradient(135deg, #1E9A63, #2DB87B);
  border-radius: $radius-md;
  box-shadow: 0 4px 12px rgba(30, 154, 99, 0.25);
  color: #fff;
}

.group-meal-entry-left {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.group-meal-entry-tag {
  display: inline-block;
  padding: 2px 8px;
  background: rgba(255, 255, 255, 0.25);
  border-radius: 10px;
  font-size: 11px;
  font-weight: 600;
  width: fit-content;
}

.group-meal-entry-title {
  font-size: 18px;
  font-weight: 700;
  font-family: $font-display;
  margin: 2px 0 0;
  text-shadow: 0 2px 6px rgba(0, 0, 0, 0.12);
}

.group-meal-entry-desc {
  font-size: 12px;
  opacity: 0.9;
  margin: 2px 0 0;
}

.group-meal-entry-right {
  display: flex;
  align-items: center;
  gap: 4px;
}

.group-meal-entry-btn {
  font-size: 13px;
  font-weight: 600;
}
</style>
