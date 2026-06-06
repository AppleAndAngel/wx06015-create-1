<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { getProductById } from '@/mock/products'
import { useCartStore } from '@/stores/cart'
import { useCart } from '@/composables/useCart'
import { useGroupBuyStore } from '@/stores/groupBuy'
import { useStockpileStore } from '@/stores/stockpile'
import SpecPopup from '@/components/SpecPopup.vue'
import AppHeader from '@/components/AppHeader.vue'
import {
  showLoadingToast,
  closeToast,
  showToast,
  showConfirmDialog,
  Popup,
  Picker,
  Stepper,
  Field,
} from 'vant'

const route = useRoute()
const router = useRouter()
const cartStore = useCartStore()
const groupBuyStore = useGroupBuyStore()
const stockpileStore = useStockpileStore()
const { addToCart } = useCart()

const product = computed(() => getProductById(Number(route.params.id)))
const groupBuyProduct = computed(() => {
  if (!product.value) return null
  return groupBuyStore.products.find(p => p.productId === product.value!.id) || null
})
const activeGroup = computed(() => {
  if (!groupBuyProduct.value) return null
  return groupBuyStore.activeOrders.find(o => o.groupBuyProductId === groupBuyProduct.value!.id) || null
})
const showSpec = ref(false)
const specAction = ref<'cart' | 'buy' | 'stockpile'>('cart')
const selectedSpecs = ref<Record<string, string>>({})
const selectedQuantity = ref(1)

const showStockpilePopup = ref(false)
const stockpileQuantity = ref(1)
const stockpileCategory = ref('')
const stockpileNote = ref('')
const isInStockpile = ref(false)

const stockpileCategoryColumns = computed(() => [
  stockpileStore.categories.map((cat) => ({
    text: `${cat.icon} ${cat.name}`,
    value: cat.id,
  })),
])

const specText = computed(() => {
  if (!product.value) return ''
  const values = Object.values(selectedSpecs.value)
  return values.length === product.value.specs.length ? values.join(' ') : ''
})

const displayReviews = computed(() => product.value?.reviews?.slice(0, 3) ?? [])

const openSpec = (action: 'cart' | 'buy' | 'stockpile') => {
  specAction.value = action
  showSpec.value = true
}

const onSpecConfirm = (specs: Record<string, string>, qty: number) => {
  selectedSpecs.value = specs
  selectedQuantity.value = qty
  if (!product.value) return
  if (specAction.value === 'cart') {
    addToCart(product.value, specs, qty)
  } else if (specAction.value === 'stockpile') {
    stockpileQuantity.value = qty
    openStockpilePopup()
  } else {
    router.push('/checkout')
  }
}

const handleAction = (action: 'cart' | 'buy' | 'stockpile') => {
  if (!product.value) return
  if (action === 'stockpile') {
    if (!specText.value) {
      openSpec('stockpile')
      return
    }
    stockpileQuantity.value = selectedQuantity.value
    openStockpilePopup()
    return
  }
  if (!specText.value) {
    openSpec(action)
    return
  }
  if (action === 'cart') {
    addToCart(product.value, selectedSpecs.value, selectedQuantity.value)
  } else {
    router.push('/checkout')
  }
}

const goBack = () => router.back()

function goToGroupBuy() {
  if (!groupBuyProduct.value) return
  router.push(`/group-buy/${groupBuyProduct.value.id}`)
}

function goJoinGroup() {
  if (!activeGroup.value) {
    goToGroupBuy()
    return
  }
  router.push(`/group-detail/${activeGroup.value.id}`)
}

function openStockpilePopup() {
  if (!product.value) return
  stockpileQuantity.value = selectedQuantity.value || 1
  stockpileCategory.value = stockpileStore.categories[0]?.id || 'food'
  stockpileNote.value = ''
  showStockpilePopup.value = true
}

async function addToStockpile() {
  if (!product.value) return
  if (!stockpileCategory.value) {
    showToast({ message: '请选择分类', type: 'fail' })
    return
  }
  try {
    showLoadingToast({ message: '添加中...', forbidClick: true })
    await stockpileStore.addItem(
      product.value,
      selectedSpecs.value,
      stockpileQuantity.value,
      stockpileCategory.value,
      stockpileNote.value
    )
    await checkStockpileStatus()
    closeToast()
    showStockpilePopup.value = false
    showToast({ message: '已加入囤货清单', type: 'success' })
  } catch (e: any) {
    closeToast()
    showToast({ message: e.message || '添加失败', type: 'fail' })
  }
}

async function checkStockpileStatus() {
  if (!product.value) return
  try {
    const exists = await stockpileStore.isInStockpile(product.value.id, selectedSpecs.value)
    isInStockpile.value = exists
  } catch (e) {
    isInStockpile.value = false
  }
}

function onCategoryConfirm(value: any) {
  const selected = value[0]
  stockpileCategory.value = selected.value
}

function goToStockpile() {
  router.push('/stockpile')
}

onMounted(async () => {
  try {
    await Promise.all([
      groupBuyStore.fetchProducts(),
      groupBuyStore.fetchActiveOrders(),
      stockpileStore.fetchCategories(),
    ])
  } catch (e) {
    console.error('[ProductDetail] 加载数据失败', e)
  }
  if (product.value) {
    await checkStockpileStatus()
  }
})
</script>

<template>
  <div class="detail-page" v-if="product">
    <AppHeader title="商品详情" :show-back="true" @click-left="goBack" />

    <div class="detail-page__body">
      <van-swipe class="detail-page__swipe" :autoplay="4000" indicator-color="#2DB87B">
        <van-swipe-item v-for="(img, i) in product.images" :key="i">
          <img v-lazy="img" class="detail-page__swipe-img" :alt="product.name" />
        </van-swipe-item>
      </van-swipe>

      <div class="detail-page__card detail-page__info">
        <div class="detail-page__price-row">
          <span class="detail-page__price">¥{{ product.price.toFixed(2) }}</span>
          <span class="detail-page__original-price">¥{{ product.originalPrice.toFixed(2) }}</span>
          <span class="detail-page__sales">已售{{ product.sales }}件</span>
        </div>

        <div class="group-buy-entry" v-if="groupBuyProduct" @click="goToGroupBuy">
          <div class="group-buy-entry__left">
            <span class="group-buy-entry__tag">拼团购</span>
            <span class="group-buy-entry__price">
              ¥{{ groupBuyProduct.groupPrice.toFixed(2) }}
              <span class="group-buy-entry__save">省¥{{ (product.price - groupBuyProduct.groupPrice).toFixed(2) }}</span>
            </span>
          </div>
          <div class="group-buy-entry__right">
            <span>{{ groupBuyProduct.groupSize }}人拼团</span>
            <van-icon name="arrow" size="12" />
          </div>
        </div>

        <h1 class="detail-page__name">{{ product.name }}</h1>
        <p class="detail-page__subtitle">{{ product.subtitle }}</p>
        <div class="detail-page__tags">
          <span
            v-for="tag in product.tags"
            :key="tag"
            :class="['detail-page__tag', tag === '有机' ? 'detail-page__tag--organic' : 'detail-page__tag--direct']"
          >{{ tag }}</span>
        </div>
      </div>

      <div class="detail-page__card detail-page__spec" @click="openSpec('cart')">
        <span class="detail-page__spec-label">{{ specText ? `已选: ${specText}` : '请选择规格' }}</span>
        <van-icon name="arrow" class="detail-page__spec-arrow" />
      </div>

      <div class="detail-page__card detail-page__reviews">
        <div class="detail-page__reviews-header">
          <span class="detail-page__reviews-title">商品评价 ({{ product.reviews?.length ?? 0 }}条)</span>
          <span class="detail-page__reviews-rating">{{ product.rating }}分</span>
        </div>
        <div v-for="review in displayReviews" :key="review.id" class="detail-page__review">
          <div class="detail-page__review-top">
            <img :src="review.avatar" class="detail-page__review-avatar" />
            <span class="detail-page__review-user">{{ review.username }}</span>
            <van-rate :model-value="review.rating" :size="12" color="#FFB946" void-icon="star" void-color="#eee" readonly />
          </div>
          <p class="detail-page__review-content">{{ review.content }}</p>
          <div v-if="review.images.length" class="detail-page__review-images">
            <img v-for="(img, i) in review.images" :key="i" :src="img" class="detail-page__review-img" />
          </div>
        </div>
      </div>

      <div class="detail-page__card detail-page__detail">
        <h3 class="detail-page__detail-title">商品详情</h3>
        <div class="detail-page__detail-content">
          <p><strong>产地：</strong>{{ product.specs.find(s => s.name === '产地' || s.name === '品种')?.values[0] ?? '优质产地直供' }}</p>
          <p><strong>储存方式：</strong>请置于阴凉干燥处，冷藏更佳</p>
          <p><strong>保质期：</strong>收到后3-7天内食用口感最佳</p>
          <p><strong>配送说明：</strong>产地采摘后48小时内发货，冷链配送保鲜到家</p>
        </div>
      </div>
    </div>

    <div class="detail-page__bottom-bar">
      <div class="detail-page__bottom-icons">
        <div class="detail-page__bottom-icon" @click="goToStockpile">
          <van-icon :name="isInStockpile ? 'star' : 'star-o'" size="22" :color="isInStockpile ? '#FFB946' : ''" />
          <van-badge v-if="isInStockpile" dot class="detail-page__stockpile-badge" />
          <span>囤货</span>
        </div>
        <div class="detail-page__bottom-icon" @click="router.push('/customer-service')">
          <van-icon name="service-o" size="22" />
          <span>客服</span>
        </div>
        <div class="detail-page__bottom-icon" @click="router.push('/cart')">
          <van-icon name="cart-o" size="22" />
          <van-badge v-if="cartStore.totalCount" :content="cartStore.totalCount" class="detail-page__cart-badge" />
          <span>购物车</span>
        </div>
      </div>
      <van-button class="detail-page__btn detail-page__btn--stockpile" @click="handleAction('stockpile')">
        {{ isInStockpile ? '已在清单' : '加入囤货' }}
      </van-button>
      <van-button class="detail-page__btn detail-page__btn--cart" @click="handleAction('cart')">加入购物车</van-button>
      <van-button
        v-if="!groupBuyProduct"
        class="detail-page__btn detail-page__btn--buy"
        @click="handleAction('buy')"
      >立即购买</van-button>
      <template v-else>
        <van-button
          class="detail-page__btn detail-page__btn--buy"
          @click="handleAction('buy')"
        >单独购买</van-button>
        <van-button
          class="detail-page__btn detail-page__btn--group"
          @click="activeGroup ? goJoinGroup() : goToGroupBuy()"
        >
          {{ activeGroup ? '去参团' : '发起拼团' }}
        </van-button>
      </template>
    </div>

    <SpecPopup
      :product="product"
      v-model:show="showSpec"
      @confirm="onSpecConfirm"
    />

    <Popup v-model:show="showStockpilePopup" position="bottom" :style="{ height: '65%' }">
      <div class="stockpile-popup">
        <div class="stockpile-popup__header">
          <span class="stockpile-popup__title">加入囤货清单</span>
          <van-icon name="cross" size="20" @click="showStockpilePopup = false" />
        </div>
        <div class="stockpile-popup__content">
          <div class="stockpile-popup__product">
            <img v-lazy="product.images[0]" class="stockpile-popup__image" />
            <div class="stockpile-popup__info">
              <div class="stockpile-popup__name">{{ product.name }}</div>
              <div class="stockpile-popup__spec" v-if="specText">{{ specText }}</div>
              <div class="stockpile-popup__price">¥{{ product.price.toFixed(2) }}</div>
            </div>
          </div>

          <div class="stockpile-popup__section">
            <div class="stockpile-popup__label">购买数量</div>
            <van-stepper
              v-model="stockpileQuantity"
              min="1"
              max="99"
              class="stockpile-popup__stepper"
            />
          </div>

          <div class="stockpile-popup__section">
            <div class="stockpile-popup__label">商品分类</div>
            <van-picker
              :columns="stockpileCategoryColumns"
              @change="onCategoryConfirm"
              class="stockpile-popup__picker"
              :show-toolbar="false"
            />
          </div>

          <div class="stockpile-popup__section">
            <div class="stockpile-popup__label">备注（选填）</div>
            <van-field
              v-model="stockpileNote"
              type="textarea"
              placeholder="比如：每周买一次、给孩子买的等"
              :autosize="{ maxHeight: 80 }"
              maxlength="50"
              show-word-limit
              class="stockpile-popup__note"
            />
          </div>
        </div>
        <div class="stockpile-popup__footer">
          <van-button type="primary" block @click="addToStockpile">
            添加到囤货清单
          </van-button>
        </div>
      </div>
    </Popup>
  </div>
</template>

<style scoped lang="scss">
@use '@/assets/styles/variables' as *;

.detail-page {
  min-height: 100vh;
  background: $bg;
  padding-bottom: 60px;

  &__body {
    padding-top: 46px;
  }

  &__swipe {
    width: 100%;
    height: 375px;

    &-img {
      width: 100%;
      height: 375px;
      object-fit: cover;
    }
  }

  &__card {
    background: $bg-card;
    margin: 10px 12px;
    border-radius: $radius-md;
    padding: 14px 16px;
    box-shadow: $shadow;
  }

  &__price-row {
    display: flex;
    align-items: baseline;
    gap: 8px;
  }

  &__price {
    font-size: 24px;
    font-weight: 700;
    color: $danger;
  }

  &__original-price {
    font-size: 13px;
    color: $text-secondary;
    text-decoration: line-through;
  }

  &__sales {
    margin-left: auto;
    font-size: 12px;
    color: $text-secondary;
  }

  &__name {
    font-size: 18px;
    font-weight: 700;
    color: $text-primary;
    margin-top: 10px;
    line-height: 1.4;
  }

  &__subtitle {
    font-size: 14px;
    color: $text-secondary;
    margin-top: 4px;
  }

  &__tags {
    display: flex;
    gap: 8px;
    margin-top: 10px;
  }

  &__tag {
    padding: 2px 8px;
    border-radius: 10px;
    font-size: 11px;

    &--organic {
      background: $primary-light;
      color: $primary;
    }

    &--direct {
      background: $accent-light;
      color: $accent;
    }
  }

  &__spec {
    display: flex;
    align-items: center;
    justify-content: space-between;

    &-label {
      font-size: 14px;
      color: $text-primary;
    }

    &-arrow {
      color: $text-secondary;
    }
  }

  &__reviews {
    &-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 12px;
    }

    &-title {
      font-size: 15px;
      font-weight: 600;
      color: $text-primary;
    }

    &-rating {
      font-size: 14px;
      color: $warning;
      font-weight: 600;
    }
  }

  &__review {
    padding: 10px 0;
    border-bottom: 1px solid $border;

    &:last-child {
      border-bottom: none;
    }

    &-top {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    &-avatar {
      width: 28px;
      height: 28px;
      border-radius: 50%;
      object-fit: cover;
    }

    &-user {
      font-size: 13px;
      color: $text-primary;
      flex: 1;
    }

    &-content {
      font-size: 13px;
      color: $text-primary;
      margin-top: 6px;
      line-height: 1.5;
    }

    &-images {
      display: flex;
      gap: 6px;
      margin-top: 8px;
    }

    &-img {
      width: 60px;
      height: 60px;
      border-radius: 6px;
      object-fit: cover;
    }
  }

  &__detail {
    &-title {
      font-size: 15px;
      font-weight: 600;
      color: $text-primary;
      margin-bottom: 10px;
    }

    &-content {
      font-size: 13px;
      color: $text-secondary;
      line-height: 2;

      strong {
        color: $text-primary;
      }
    }
  }

  &__bottom-bar {
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

  &__bottom-icons {
    display: flex;
    gap: 16px;
    margin-right: 12px;
  }

  &__bottom-icon {
    display: flex;
    flex-direction: column;
    align-items: center;
    font-size: 10px;
    color: $text-secondary;
    position: relative;
  }

  &__cart-badge {
    position: absolute;
    top: -4px;
    right: -8px;
  }

  &__stockpile-badge {
    position: absolute;
    top: -2px;
    right: 6px;
  }

  &__btn {
    flex: 1;
    height: 38px;
    border-radius: 20px;
    font-size: 14px;
    font-weight: 600;

    &--stockpile {
      background: linear-gradient(135deg, #FFB946, #FF9500) !important;
      border-color: #FFB946 !important;
      color: #fff !important;
      margin-right: 8px;
    }

    &--cart {
      background: $accent !important;
      border-color: $accent !important;
      color: #fff !important;
      margin-right: 8px;
    }

    &--buy {
      background: $primary !important;
      border-color: $primary !important;
      color: #fff !important;
      margin-right: 8px;
    }

    &--group {
      background: linear-gradient(135deg, #FF6B35, #FF8C42) !important;
      border-color: #FF6B35 !important;
      color: #fff !important;
    }
  }
}

.stockpile-popup {
  display: flex;
  flex-direction: column;
  height: 100%;

  &__header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 16px;
    border-bottom: 1px solid $border;
  }

  &__title {
    font-size: 16px;
    font-weight: 600;
    color: $text-primary;
  }

  &__content {
    flex: 1;
    padding: 16px;
    overflow-y: auto;
  }

  &__product {
    display: flex;
    gap: 12px;
    padding: 12px;
    background: $bg;
    border-radius: $radius-md;
    margin-bottom: 16px;
  }

  &__image {
    width: 64px;
    height: 64px;
    border-radius: $radius-sm;
    object-fit: cover;
    flex-shrink: 0;
  }

  &__info {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 4px;
    min-width: 0;
  }

  &__name {
    font-size: 14px;
    font-weight: 500;
    color: $text-primary;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  &__spec {
    font-size: 12px;
    color: $text-secondary;
  }

  &__price {
    font-size: 16px;
    font-weight: 600;
    color: $danger;
    margin-top: auto;
  }

  &__section {
    margin-bottom: 16px;
  }

  &__label {
    font-size: 14px;
    font-weight: 500;
    color: $text-primary;
    margin-bottom: 8px;
  }

  &__stepper {
    :deep(.van-stepper__input) {
      width: 40px;
    }
  }

  &__picker {
    background: $bg;
    border-radius: $radius-md;
  }

  &__note {
    :deep(.van-field__control) {
      background: $bg;
      border-radius: $radius-sm;
      padding: 10px 12px;
    }
  }

  &__footer {
    padding: 16px;
    border-top: 1px solid $border;
  }
}

.group-buy-entry {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin: 12px 0 4px;
  padding: 12px 14px;
  background: linear-gradient(135deg, #FFF5F0, #FFE8DC);
  border-radius: $radius-sm;
  cursor: pointer;
  transition: transform 0.2s ease;

  &:active {
    transform: scale(0.98);
  }

  &__left {
    display: flex;
    align-items: center;
    gap: 10px;
  }

  &__tag {
    padding: 2px 8px;
    background: linear-gradient(135deg, #FF6B35, #FF8C42);
    color: #fff;
    font-size: 11px;
    font-weight: 600;
    border-radius: 4px;
  }

  &__price {
    color: #FF6B35;
    font-weight: 700;
    font-size: 16px;
  }

  &__save {
    font-size: 11px;
    color: #FF6B35;
    font-weight: 500;
    margin-left: 4px;
  }

  &__right {
    display: flex;
    align-items: center;
    gap: 2px;
    font-size: 12px;
    color: #FF6B35;
    font-weight: 500;
  }
}
</style>
