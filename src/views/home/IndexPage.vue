<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useCartStore } from '@/stores/cart'
import { mockCategories as categories } from '@/mock/categories'
import { flashSaleProducts, products } from '@/mock/products'
import ProductCard from '@/components/ProductCard.vue'
import CountdownTimer from '@/components/CountdownTimer.vue'

const router = useRouter()
const cartStore = useCartStore()

const flashEndTime = computed(() => Date.now() + 2 * 60 * 60 * 1000)

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
</style>
