<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { View, Text, Button, Image, ScrollView } from '@tarojs/components'
import Taro, { useRouter } from '@tarojs/taro'
import { getProductById } from '@/mock/products'
import { useCompareStore } from '@/stores/compare'
import { useCartStore } from '@/stores/cart'
import { useArrivalStore } from '@/stores/arrival'
import { formatPrice, renderStars, formatSales } from '@/utils'
import EmptyState from '@/components/EmptyState'
import CompareBar from '@/components/CompareBar'
import styles from './index.module.scss'

const router = useRouter()
const productId = router.params.id
const product = ref(getProductById(productId || ''))

const compareStore = useCompareStore()
const cartStore = useCartStore()
const arrivalStore = useArrivalStore()

const inCompare = computed(() => product.value ? compareStore.isInCompare(product.value.id) : false)
const inReminder = computed(() => product.value ? arrivalStore.isInReminder(product.value.id) : false)
const quantity = ref(1)

const getDaysUntilRestock = (restockDate?: string) => {
  if (!restockDate) return null
  const today = new Date('2026-06-07')
  const restock = new Date(restockDate)
  const diffTime = restock.getTime() - today.getTime()
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  return diffDays
}

const handleAddToCompare = () => {
  if (!product.value) return
  if (inCompare.value) {
    compareStore.removeFromCompare(product.value.id)
  } else {
    compareStore.addToCompare(product.value)
  }
}

const handleAddToCart = () => {
  if (!product.value) return
  if (!product.value.inStock) {
    Taro.showToast({
      title: '商品暂时缺货',
      icon: 'none'
    })
    return
  }
  cartStore.addToCart(product.value, quantity.value)
}

const handleToggleReminder = () => {
  if (!product.value) return
  if (inReminder.value) {
    Taro.showModal({
      title: '取消提醒',
      content: '确定要取消该商品的到货提醒吗？',
      success: (res) => {
        if (res.confirm) {
          arrivalStore.removeFromReminder(product.value!.id)
          Taro.showToast({
            title: '已取消提醒',
            icon: 'success'
          })
        }
      }
    })
  } else {
    arrivalStore.addToReminder(product.value)
  }
}

const handleGoCompare = () => {
  Taro.switchTab({
    url: '/pages/compare/index'
  })
}

const handleQuantityChange = (delta: number) => {
  const newQuantity = quantity.value + delta
  if (newQuantity >= 1 && newQuantity <= 99) {
    quantity.value = newQuantity
  }
}

onMounted(() => {
  if (productId) {
    product.value = getProductById(productId)
  }
  arrivalStore.checkStockUpdates()
})
</script>

<template>
  <view :class="styles.page">
    <view v-if="!product" :class="styles.empty">
      <EmptyState
        icon="❓"
        title="商品不存在"
        description="该商品可能已下架或不存在"
      />
    </view>

    <scroll-view v-else :class="styles.content" scroll-y>
      <image
        :class="styles.mainImage"
        :src="product.image"
        mode="aspectFill"
      />

      <view :class="styles.infoSection">
        <view :class="styles.priceRow">
          <view :class="styles.priceWrapper">
            <text :class="styles.currency">¥</text>
            <text :class="styles.price">{{ formatPrice(product.price) }}</text>
            <text v-if="product.originalPrice > product.price" :class="styles.originalPrice">
              ¥{{ formatPrice(product.originalPrice) }}
            </text>
          </view>
          <view :class="styles.compareBtn" @click="handleAddToCompare">
            <text :class="[styles.compareIcon, inCompare && styles.active]">
              {{ inCompare ? '✓' : '⚖' }}
            </text>
            <text :class="styles.compareText">{{ inCompare ? '已对比' : '对比' }}</text>
          </view>
        </view>

        <view :class="[styles.stockStatus, product.inStock && styles.inStock]">
          <text :class="styles.stockIcon">
            {{ product.inStock ? '✅' : '⏳' }}
          </text>
          <text :class="styles.stockText">
            {{ product.inStock ? '现货，现在下单可立即发货' : '暂时缺货' }}
          </text>
          <text v-if="!product.inStock && product.restockDate" :class="styles.restockInfo">
            预计{{ getDaysUntilRestock(product.restockDate) }}天后到货
          </text>
        </view>

        <text :class="styles.productName">{{ product.name }}</text>

        <view :class="styles.tags">
          <text
            v-for="tag in product.tags"
            :key="tag"
            :class="styles.tag"
          >
            {{ tag }}
          </text>
        </view>

        <view :class="styles.statsRow">
          <view :class="styles.statItem">
            <text :class="styles.stars">{{ renderStars(product.rating) }}</text>
            <text :class="styles.statValue">{{ product.rating }}</text>
          </view>
          <view :class="styles.statDivider" />
          <view :class="styles.statItem">
            <text :class="styles.statLabel">销量</text>
            <text :class="styles.statValue">{{ formatSales(product.sales) }}</text>
          </view>
          <view :class="styles.statDivider" />
          <view :class="styles.statItem">
            <text :class="styles.statLabel">评价</text>
            <text :class="styles.statValue">{{ product.reviewCount }}+</text>
          </view>
        </view>
      </view>

      <view :class="styles.specSection">
        <text :class="styles.sectionTitle">商品规格</text>
        <view :class="styles.specList">
          <view :class="styles.specItem">
            <text :class="styles.specLabel">规格</text>
            <text :class="styles.specValue">{{ product.spec }}</text>
          </view>
          <view :class="styles.specItem">
            <text :class="styles.specLabel">包装</text>
            <text :class="styles.specValue">{{ product.packaging }}</text>
          </view>
          <view :class="styles.specItem">
            <text :class="styles.specLabel">产地</text>
            <text :class="styles.specValue">{{ product.origin }}</text>
          </view>
          <view :class="styles.specItem">
            <text :class="styles.specLabel">重量</text>
            <text :class="styles.specValue">{{ product.weight }}</text>
          </view>
          <view :class="styles.specItem">
            <text :class="styles.specLabel">保质期</text>
            <text :class="styles.specValue">{{ product.shelfLife }}</text>
          </view>
          <view :class="styles.specItem">
            <text :class="styles.specLabel">储存方式</text>
            <text :class="styles.specValue">{{ product.storage }}</text>
          </view>
        </view>
      </view>

      <view :class="styles.descSection">
        <text :class="styles.sectionTitle">商品描述</text>
        <text :class="styles.description">{{ product.description }}</text>
      </view>

      <view :class="styles.reviewsSection">
        <text :class="styles.sectionTitle">用户评价</text>
        <view
          v-for="review in product.reviews"
          :key="review.id"
          :class="styles.reviewItem"
        >
          <view :class="styles.reviewHeader">
            <text :class="styles.reviewUser">{{ review.userName }}</text>
            <text :class="styles.reviewStars">{{ renderStars(review.rating) }}</text>
          </view>
          <text :class="styles.reviewContent">{{ review.content }}</text>
          <text :class="styles.reviewDate">{{ review.date }}</text>
        </view>
      </view>

      <view :class="styles.bottomSpace" />
    </scroll-view>

    <view v-if="product" :class="styles.footer">
      <template v-if="product.inStock">
        <view :class="styles.quantityControl">
          <view :class="styles.quantityBtn" @click="handleQuantityChange(-1)">
            <text>−</text>
          </view>
          <text :class="styles.quantity">{{ quantity }}</text>
          <view :class="styles.quantityBtn" @click="handleQuantityChange(1)">
            <text>+</text>
          </view>
        </view>

        <button
          v-if="inCompare"
          :class="styles.secondaryBtn"
          @click="handleGoCompare"
        >
          查看对比
        </button>
        <button
          v-else
          :class="styles.secondaryBtn"
          @click="handleAddToCompare"
        >
          加入对比
        </button>

        <button :class="styles.primaryBtn" @click="handleAddToCart">
          加入购物车
        </button>
      </template>

      <template v-else>
        <button
          v-if="inCompare"
          :class="styles.secondaryBtn"
          @click="handleGoCompare"
        >
          查看对比
        </button>
        <button
          v-else
          :class="styles.secondaryBtn"
          @click="handleAddToCompare"
        >
          加入对比
        </button>

        <button
          :class="[styles.reminderBtn, inReminder && styles.active]"
          @click="handleToggleReminder"
        >
          {{ inReminder ? '✓ 已设置提醒' : '🔔 到货提醒我' }}
        </button>
      </template>
    </view>

    <CompareBar />
  </view>
</template>
