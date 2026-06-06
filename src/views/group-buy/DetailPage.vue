<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'
import { useGroupBuyStore } from '@/stores/groupBuy'
import AppHeader from '@/components/AppHeader.vue'
import CountdownTimer from '@/components/CountdownTimer.vue'
import SpecPopup from '@/components/SpecPopup.vue'
import { showLoadingToast, closeToast, showToast, showSuccessToast } from 'vant'
import type { GroupBuyProduct } from '@/types'

const route = useRoute()
const router = useRouter()
const userStore = useUserStore()
const groupBuyStore = useGroupBuyStore()

const groupProductId = computed(() => Number(route.params.id))
const groupProduct = ref<GroupBuyProduct | null>(null)
const loading = ref(false)
const showSpec = ref(false)
const selectedSpecs = ref<Record<string, string>>({})
const selectedQuantity = ref(1)

const product = computed(() => groupProduct.value?.product)
const activeOrders = computed(() =>
  groupBuyStore.activeOrders.filter(o => o.productId === groupProduct.value?.productId && o.status === 'pending')
)

async function loadData() {
  loading.value = true
  showLoadingToast({ message: '加载中...', forbidClick: true })
  try {
    await groupBuyStore.fetchActiveOrders()
    await groupBuyStore.getProductByProductId(
      groupBuyStore.products.find(p => p.id === groupProductId.value)?.productId || 1
    )
    const gp = groupBuyStore.products.find(p => p.id === groupProductId.value)
    groupProduct.value = gp || null
    console.log('[GroupBuyDetail] 加载拼团商品:', gp?.product.name)
  } catch (e) {
    console.error('[GroupBuyDetail] 加载失败', e)
    showToast('加载失败，请重试')
  } finally {
    loading.value = false
    closeToast()
  }
}

const specText = computed(() => {
  if (!product.value) return ''
  const values = Object.values(selectedSpecs.value)
  return values.length === product.value.specs.length ? values.join(' ') : ''
})

function openSpec() {
  showSpec.value = true
}

function onSpecConfirm(specs: Record<string, string>, qty: number) {
  selectedSpecs.value = specs
  selectedQuantity.value = qty
  showSpec.value = false
  handleCreateGroup()
}

async function handleCreateGroup() {
  if (!userStore.isLoggedIn) {
    router.push({ path: '/login', query: { redirect: `/group-buy/${groupProductId.value}` } })
    return
  }
  if (!groupProduct.value) return
  if (!specText.value) {
    openSpec()
    return
  }
  showLoadingToast({ message: '发起拼团中...', forbidClick: true })
  try {
    const order = await groupBuyStore.createGroupBuy(
      groupProduct.value.productId,
      selectedSpecs.value,
      selectedQuantity.value
    )
    closeToast()
    showSuccessToast('拼团发起成功！')
    setTimeout(() => {
      router.push(`/group-detail/${order.id}`)
    }, 800)
  } catch (e) {
    closeToast()
    showToast('发起失败，请重试')
    console.error('[GroupBuyDetail] 发起拼团失败', e)
  }
}

function goToGroupDetail(orderId: number) {
  if (!userStore.isLoggedIn) {
    router.push({ path: '/login', query: { redirect: `/group-detail/${orderId}` } })
    return
  }
  router.push(`/group-detail/${orderId}`)
}

function goToProductDetail(productId: number) {
  router.push(`/product/${productId}`)
}

const goBack = () => router.back()

onMounted(() => {
  loadData()
})
</script>

<template>
  <div class="group-detail-page" v-if="groupProduct && product">
    <AppHeader title="拼团详情" :show-back="true" @click-left="goBack" />

    <div class="page-body">
      <div class="product-swipe">
        <van-swipe class="product-swipe__swipe" :autoplay="4000" indicator-color="#FF6B35">
          <van-swipe-item v-for="(img, i) in product.images" :key="i">
            <img v-lazy="img" class="product-swipe__img" :alt="product.name" />
          </van-swipe-item>
        </van-swipe>
      </div>

      <div class="info-card">
        <div class="price-row">
          <div class="group-price">
            <span class="label">拼团价</span>
            <span class="price">¥{{ groupProduct.groupPrice.toFixed(2) }}</span>
          </div>
          <div class="original-price">
            <span>单独买</span>
            <span class="price">¥{{ groupProduct.originalPrice.toFixed(2) }}</span>
          </div>
          <div class="discount-badge">
            {{ groupProduct.discount }}
          </div>
        </div>
        <h1 class="product-name">{{ product.name }}</h1>
        <p class="product-subtitle">{{ product.subtitle }}</p>
        <div class="group-info">
          <div class="group-info__item">
            <van-icon name="friends-o" size="16" color="#FF6B35" />
            <span>{{ groupProduct.groupSize }}人拼团</span>
          </div>
          <div class="group-info__item">
            <van-icon name="clock-o" size="16" color="#FF6B35" />
            <CountdownTimer :end-time="groupProduct.endTime" />
          </div>
        </div>
      </div>

      <div class="spec-card" @click="openSpec">
        <span class="spec-label">已选: {{ specText || '请选择规格' }}</span>
        <van-icon name="arrow" class="spec-arrow" />
      </div>

      <div class="active-orders-card" v-if="activeOrders.length">
        <div class="card-header">
          <h3 class="card-title">正在进行的拼团</h3>
          <span class="card-desc">直接参与更快</span>
        </div>
        <div class="order-list">
          <div
            v-for="order in activeOrders.slice(0, 3)"
            :key="order.id"
            class="order-item"
            @click="goToGroupDetail(order.id)"
          >
            <div class="order-members">
              <img
                v-for="member in order.members"
                :key="member.id"
                :src="member.avatar"
                class="member-avatar"
              />
              <span class="order-text">
                {{ order.initiatorNickname }} 等{{ order.currentCount }}人已拼
              </span>
            </div>
            <div class="order-countdown">
              <span class="countdown-label">剩余</span>
              <CountdownTimer :end-time="order.endTime" />
            </div>
            <div class="order-btn">
              去参团
            </div>
          </div>
        </div>
      </div>

      <div class="detail-card">
        <h3 class="detail-title">商品详情</h3>
        <div class="detail-content">
          <p><strong>产地：</strong>{{ product.specs.find(s => s.name === '产地' || s.name === '品种')?.values[0] ?? '优质产地直供' }}</p>
          <p><strong>储存方式：</strong>请置于阴凉干燥处，冷藏更佳</p>
          <p><strong>保质期：</strong>收到后3-7天内食用口感最佳</p>
          <p><strong>配送说明：</strong>产地采摘后48小时内发货，冷链配送保鲜到家</p>
        </div>
      </div>
    </div>

    <div class="bottom-bar">
      <div class="bottom-icons">
        <div class="bottom-icon" @click="goToProductDetail(product.id)">
          <van-icon name="shop-o" size="22" />
          <span>商品</span>
        </div>
      </div>
      <van-button class="action-btn action-btn--join" @click="goToGroupDetail(activeOrders[0]?.id || 0)" v-if="activeOrders.length">
        参与拼团
      </van-button>
      <van-button class="action-btn action-btn--create" @click="handleCreateGroup">
        发起拼团 · 省¥{{ (groupProduct.originalPrice - groupProduct.groupPrice).toFixed(1) }}
      </van-button>
    </div>

    <SpecPopup
      :product="product"
      v-model:show="showSpec"
      @confirm="onSpecConfirm"
    />
  </div>
</template>

<style scoped lang="scss">
@use '@/assets/styles/variables' as *;

.group-detail-page {
  min-height: 100vh;
  background: $bg;
  padding-bottom: 60px;

  &__body {
    padding-top: 46px;
  }
}

.product-swipe {
  &__swipe {
    width: 100%;
    height: 375px;
  }

  &__img {
    width: 100%;
    height: 375px;
    object-fit: cover;
  }
}

.info-card {
  background: $bg-card;
  margin: -20px 12px 0;
  border-radius: $radius-md;
  padding: 16px;
  box-shadow: $shadow;
  position: relative;
  z-index: 2;
}

.price-row {
  display: flex;
  align-items: baseline;
  gap: 12px;
  margin-bottom: 10px;
}

.group-price {
  display: flex;
  align-items: baseline;
  gap: 4px;

  .label {
    font-size: 12px;
    color: #FF6B35;
    font-weight: 500;
  }

  .price {
    font-size: 28px;
    font-weight: 700;
    color: #FF6B35;

    &::before {
      content: '¥';
      font-size: 0.6em;
    }
  }
}

.original-price {
  display: flex;
  align-items: baseline;
  gap: 2px;
  color: $text-secondary;
  font-size: 12px;

  .price {
    text-decoration: line-through;
  }
}

.discount-badge {
  margin-left: auto;
  background: linear-gradient(135deg, #FF6B35, #FF8C42);
  color: #fff;
  font-size: 12px;
  font-weight: 600;
  padding: 4px 10px;
  border-radius: 12px;
}

.product-name {
  font-size: 18px;
  font-weight: 600;
  color: $text-primary;
  margin: 10px 0 4px;
  line-height: 1.4;
}

.product-subtitle {
  font-size: 14px;
  color: $text-secondary;
  margin: 0 0 12px;
}

.group-info {
  display: flex;
  gap: 16px;
  padding-top: 12px;
  border-top: 1px solid $border;

  &__item {
    display: flex;
    align-items: center;
    gap: 4px;
    font-size: 13px;
    color: $text-secondary;
  }
}

.spec-card {
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: $bg-card;
  margin: 10px 12px 0;
  border-radius: $radius-md;
  padding: 14px 16px;
  box-shadow: $shadow;

  &-label {
    font-size: 14px;
    color: $text-primary;
  }

  &-arrow {
    color: $text-secondary;
  }
}

.active-orders-card {
  background: $bg-card;
  margin: 10px 12px 0;
  border-radius: $radius-md;
  padding: 14px 16px;
  box-shadow: $shadow;
}

.card-header {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  margin-bottom: 12px;
}

.card-title {
  font-size: 16px;
  font-weight: 600;
  color: $text-primary;
  margin: 0;
}

.card-desc {
  font-size: 12px;
  color: $text-secondary;
}

.order-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.order-item {
  display: flex;
  align-items: center;
  padding: 10px 12px;
  background: #FFF8F5;
  border-radius: $radius-sm;
  position: relative;
  cursor: pointer;

  &:active {
    opacity: 0.9;
  }
}

.order-members {
  display: flex;
  align-items: center;
  gap: 4px;
  flex: 1;
}

.member-avatar {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  object-fit: cover;
  border: 2px solid #fff;
  margin-left: -6px;

  &:first-child {
    margin-left: 0;
  }
}

.order-text {
  font-size: 12px;
  color: $text-primary;
  margin-left: 6px;
}

.order-countdown {
  display: flex;
  align-items: center;
  gap: 4px;
  margin: 0 12px;

  .countdown-label {
    font-size: 11px;
    color: $text-secondary;
  }
}

.order-btn {
  background: linear-gradient(135deg, #FF6B35, #FF8C42);
  color: #fff;
  font-size: 12px;
  font-weight: 600;
  padding: 6px 14px;
  border-radius: 16px;
}

.detail-card {
  background: $bg-card;
  margin: 10px 12px;
  border-radius: $radius-md;
  padding: 14px 16px;
  box-shadow: $shadow;
}

.detail-title {
  font-size: 15px;
  font-weight: 600;
  color: $text-primary;
  margin: 0 0 10px;
}

.detail-content {
  font-size: 13px;
  color: $text-secondary;
  line-height: 2;

  strong {
    color: $text-primary;
  }
}

.bottom-bar {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  display: flex;
  align-items: center;
  background: $bg-card;
  padding: 6px 12px calc(6px + env(safe-area-inset-bottom));
  box-shadow: 0 -2px 10px rgba(0, 0, 0, 0.06);
  z-index: 99;
}

.bottom-icons {
  display: flex;
  gap: 16px;
  margin-right: 12px;
}

.bottom-icon {
  display: flex;
  flex-direction: column;
  align-items: center;
  font-size: 10px;
  color: $text-secondary;
}

.action-btn {
  flex: 1;
  height: 38px;
  border-radius: 20px;
  font-size: 14px;
  font-weight: 600;

  &--join {
    background: $accent !important;
    border-color: $accent !important;
    color: #fff !important;
    margin-right: 8px;
  }

  &--create {
    background: linear-gradient(135deg, #FF6B35, #FF8C42) !important;
    border: none !important;
    color: #fff !important;
  }
}
</style>
