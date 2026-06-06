<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useGiftCardStore } from '@/stores/giftCard'
import { useUserStore } from '@/stores/user'
import { showLoadingToast, closeToast, showToast } from 'vant'
import type { GiftCardDenomination } from '@/types'

const router = useRouter()
const giftCardStore = useGiftCardStore()
const userStore = useUserStore()

const loading = ref(false)
const selectedDenomination = ref<GiftCardDenomination | null>(null)

onMounted(async () => {
  try {
    loading.value = true
    showLoadingToast({ message: '加载中...', forbidClick: true })
    await giftCardStore.fetchDenominations()
    if (giftCardStore.denominations.length > 0) {
      selectedDenomination.value = giftCardStore.denominations[0]
    }
    closeToast()
  } catch (e) {
    closeToast()
    showToast({ message: '加载失败，请重试', type: 'fail' })
  } finally {
    loading.value = false
  }
})

function handleSelectDenomination(denomination: GiftCardDenomination) {
  selectedDenomination.value = denomination
  giftCardStore.setSelectedDenomination(denomination)
}

function handleBuyNow() {
  if (!selectedDenomination.value) {
    showToast({ message: '请选择面额', type: 'fail' })
    return
  }

  if (!userStore.isLoggedIn) {
    router.push({
      path: '/login',
      query: { redirect: '/gift-card' },
    })
    return
  }

  router.push(`/gift-card/purchase/${selectedDenomination.value.id}`)
}

function goToMyCards() {
  if (!userStore.isLoggedIn) {
    router.push({
      path: '/login',
      query: { redirect: '/my-gift-cards' },
    })
    return
  }
  router.push('/my-gift-cards')
}
</script>

<template>
  <div class="gift-card-list-page">
    <van-nav-bar
      title="生鲜礼品卡"
      left-arrow
      @click-left="router.back()"
    >
      <template #right>
        <van-icon name="orders-o" size="22" @click="goToMyCards" />
      </template>
    </van-nav-bar>

    <div class="page-content">
      <div class="hero-section">
        <div class="hero-content">
          <h1 class="hero-title">送一份新鲜好礼</h1>
          <p class="hero-desc">给家人朋友一份健康与美味的心意</p>
        </div>
        <div class="hero-decoration">🎁</div>
      </div>

      <div class="section">
        <h2 class="section-title">选择面额</h2>
        <div class="denomination-grid">
          <div
            v-for="item in giftCardStore.denominations"
            :key="item.id"
            class="denomination-card"
            :class="{ 'denomination-card--selected': selectedDenomination?.id === item.id }"
            @click="handleSelectDenomination(item)"
          >
            <div v-if="item.tag" class="denomination-card__tag">{{ item.tag }}</div>
            <div class="denomination-card__value">
              <span class="value-symbol">¥</span>
              <span class="value-amount">{{ item.value }}</span>
            </div>
            <div class="denomination-card__name">{{ item.name }}</div>
            <div class="denomination-card__price">
              售价
              <span class="price-symbol">¥</span>
              <span class="price-amount">{{ item.price }}</span>
              <span v-if="item.price < item.value" class="price-discount">
                省{{ item.value - item.price }}元
              </span>
            </div>
            <div class="denomination-card__desc">{{ item.description }}</div>
            <div
              v-if="selectedDenomination?.id === item.id"
              class="denomination-card__check"
            >
              <van-icon name="checked" size="18" color="#fff" />
            </div>
          </div>
        </div>
      </div>

      <div class="section">
        <h2 class="section-title">礼品卡使用说明</h2>
        <div class="info-card">
          <div class="info-item">
            <div class="info-item__icon">📅</div>
            <div class="info-item__content">
              <div class="info-item__title">有效期</div>
              <div class="info-item__desc">购买后1年内有效</div>
            </div>
          </div>
          <div class="info-item">
            <div class="info-item__icon">🛒</div>
            <div class="info-item__content">
              <div class="info-item__title">使用范围</div>
              <div class="info-item__desc">全场生鲜商品通用</div>
            </div>
          </div>
          <div class="info-item">
            <div class="info-item__icon">💝</div>
            <div class="info-item__content">
              <div class="info-item__title">赠送好友</div>
              <div class="info-item__desc">可填写祝福语，一键送给家人朋友</div>
            </div>
          </div>
          <div class="info-item">
            <div class="info-item__icon">🔒</div>
            <div class="info-item__content">
              <div class="info-item__title">安全保障</div>
              <div class="info-item__desc">手机号验证，安全领取</div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="bottom-bar">
      <div class="bottom-bar__price">
        <span class="label">合计：</span>
        <span class="symbol">¥</span>
        <span class="amount">{{ selectedDenomination?.price || 0 }}</span>
      </div>
      <van-button
        type="primary"
        class="buy-btn"
        :loading="loading"
        @click="handleBuyNow"
      >
        立即购买
      </van-button>
    </div>
  </div>
</template>

<style scoped lang="scss">
@use '@/assets/styles/variables' as *;

.gift-card-list-page {
  min-height: 100vh;
  background: $bg;
  padding-bottom: 80px;
}

.page-content {
  padding: 16px;
}

.hero-section {
  background: linear-gradient(135deg, #FF6B6B 0%, #FF8E53 100%);
  border-radius: $radius-lg;
  padding: 24px;
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 20px;
  position: relative;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    top: -50px;
    right: -50px;
    width: 150px;
    height: 150px;
    background: rgba(255, 255, 255, 0.1);
    border-radius: 50%;
  }

  &::after {
    content: '';
    position: absolute;
    bottom: -30px;
    right: 30px;
    width: 80px;
    height: 80px;
    background: rgba(255, 255, 255, 0.08);
    border-radius: 50%;
  }
}

.hero-content {
  flex: 1;
  position: relative;
  z-index: 1;
}

.hero-title {
  font-size: 22px;
  font-weight: 700;
  margin: 0 0 8px 0;
  font-family: $font-display;
}

.hero-desc {
  font-size: 14px;
  opacity: 0.95;
  margin: 0;
}

.hero-decoration {
  font-size: 60px;
  position: relative;
  z-index: 1;
  animation: bounce 2s infinite;
}

@keyframes bounce {
  0%, 100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-10px);
  }
}

.section {
  margin-bottom: 20px;
}

.section-title {
  font-size: 16px;
  font-weight: 600;
  color: $text-primary;
  margin: 0 0 12px 0;
  padding-left: 4px;
  border-left: 3px solid $primary;
  font-family: $font-display;
}

.denomination-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
}

.denomination-card {
  background: $bg-card;
  border-radius: $radius-md;
  padding: 20px 16px;
  position: relative;
  cursor: pointer;
  transition: all 0.2s ease;
  border: 2px solid transparent;
  box-shadow: $shadow;

  &--selected {
    border-color: $primary;
    box-shadow: 0 4px 16px rgba(45, 184, 123, 0.25);
    transform: translateY(-2px);
  }

  &__tag {
    position: absolute;
    top: 0;
    right: 12px;
    background: linear-gradient(135deg, #FF6B35, #FF8C42);
    color: #fff;
    font-size: 10px;
    font-weight: 600;
    padding: 2px 8px;
    border-radius: 0 0 8px 8px;
  }

  &__value {
    display: flex;
    align-items: baseline;
    justify-content: center;
    color: $primary;
    margin-bottom: 6px;
  }

  .value-symbol {
    font-size: 16px;
    font-weight: 600;
  }

  .value-amount {
    font-size: 32px;
    font-weight: 700;
    font-family: $font-display;
  }

  &__name {
    text-align: center;
    font-size: 14px;
    color: $text-primary;
    font-weight: 500;
    margin-bottom: 8px;
  }

  &__price {
    text-align: center;
    font-size: 12px;
    color: $text-secondary;
    margin-bottom: 6px;
    display: flex;
    align-items: baseline;
    justify-content: center;
    gap: 2px;
  }

  .price-symbol {
    font-size: 11px;
  }

  .price-amount {
    font-size: 16px;
    color: $danger;
    font-weight: 600;
  }

  .price-discount {
    background: rgba(255, 107, 53, 0.1);
    color: #FF6B35;
    padding: 1px 6px;
    border-radius: 4px;
    font-size: 10px;
    margin-left: 4px;
  }

  &__desc {
    text-align: center;
    font-size: 11px;
    color: $text-secondary;
  }

  &__check {
    position: absolute;
    top: 8px;
    left: 8px;
    width: 22px;
    height: 22px;
    background: $primary;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
  }
}

.info-card {
  background: $bg-card;
  border-radius: $radius-md;
  padding: 12px 16px;
  box-shadow: $shadow;
}

.info-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 0;
  border-bottom: 1px solid $border;

  &:last-child {
    border-bottom: none;
  }

  &__icon {
    font-size: 28px;
    flex-shrink: 0;
  }

  &__content {
    flex: 1;
  }

  &__title {
    font-size: 14px;
    color: $text-primary;
    font-weight: 500;
    margin-bottom: 2px;
  }

  &__desc {
    font-size: 12px;
    color: $text-secondary;
  }
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

.bottom-bar__price {
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

.buy-btn {
  width: 160px !important;
  height: 44px !important;
  border-radius: 22px !important;
  font-size: 16px !important;
  font-weight: 600 !important;
  background: linear-gradient(135deg, $primary 0%, $primary-dark 100%) !important;
  border: none !important;
}
</style>
