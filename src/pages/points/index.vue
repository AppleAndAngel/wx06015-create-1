<script setup lang="ts">
import { ref, computed } from 'vue'
import { View, Text, Image } from '@tarojs/components'
import Taro from '@tarojs/taro'
import { usePointsStore } from '@/stores/points'
import { useAddressStore } from '@/stores/address'
import type { PointsProduct } from '@/types'
import styles from './index.module.scss'

const pointsStore = usePointsStore()
const addressStore = useAddressStore()

const activeTab = ref('all')
const showModal = ref(false)
const selectedProduct = ref<PointsProduct | null>(null)
const exchangeQuantity = ref(1)
const selectedAddressId = ref<string | null>(null)

const tabs = [
  { id: 'all', label: '全部' },
  { id: 'snack', label: '小食' },
  { id: 'coupon', label: '运费券' },
  { id: 'merchandise', label: '周边好物' }
]

const userPoints = computed(() => pointsStore.userPoints)
const totalEarned = computed(() => pointsStore.totalEarned)
const totalSpent = computed(() => pointsStore.totalSpent)

const products = computed(() => {
  return pointsStore.getProductsByCategory(activeTab.value)
})

const selectedAddress = computed(() => {
  if (!selectedAddressId.value) return addressStore.getDefaultAddress()
  return addressStore.addressList.find(a => a.id === selectedAddressId.value)
})

const totalPoints = computed(() => {
  if (!selectedProduct.value) return 0
  return selectedProduct.value.points * exchangeQuantity.value
})

const canExchange = computed(() => {
  if (!selectedProduct.value) return false
  return userPoints.value >= totalPoints.value && 
         selectedProduct.value.stock >= exchangeQuantity.value
})

const handleTabChange = (tabId: string) => {
  activeTab.value = tabId
}

const openExchangeModal = (product: PointsProduct) => {
  selectedProduct.value = product
  exchangeQuantity.value = 1
  selectedAddressId.value = addressStore.getDefaultAddress()?.id || null
  showModal.value = true
}

const closeModal = () => {
  showModal.value = false
  selectedProduct.value = null
}

const decreaseQuantity = () => {
  if (exchangeQuantity.value > 1) {
    exchangeQuantity.value--
  }
}

const increaseQuantity = () => {
  const max = selectedProduct.value?.exchangeLimit || selectedProduct.value?.stock || 99
  if (exchangeQuantity.value < max) {
    exchangeQuantity.value++
  }
}

const selectAddress = () => {
  Taro.navigateTo({
    url: '/pages/address/index?select=true'
  })
}

const confirmExchange = () => {
  if (!selectedProduct.value || !canExchange.value) return

  const needAddress = selectedProduct.value.category !== 'coupon'
  if (needAddress && !selectedAddress.value) {
    Taro.showToast({ title: '请选择收货地址', icon: 'none' })
    return
  }

  const success = pointsStore.exchangeProduct(
    selectedProduct.value.id,
    exchangeQuantity.value,
    selectedAddress.value?.id
  )

  if (success) {
    closeModal()
  }
}

const goToRecords = () => {
  Taro.navigateTo({ url: '/pages/points/records' })
}

const formatNumber = (num: number) => {
  return num.toLocaleString()
}
</script>

<template>
  <scroll-view :class="styles.page" scroll-y>
    <view :class="styles.header">
      <view :class="styles.pointsInfo">
        <view :class="styles.pointsLeft">
          <text :class="styles.pointsLabel">我的积分</text>
          <view>
            <text :class="styles.pointsValue">{{ formatNumber(userPoints) }}</text>
            <text :class="styles.pointsUnit">积分</text>
          </view>
        </view>
        <view :class="styles.pointsRight">
          <view :class="styles.pointsStats">
            <view :class="styles.statItem">
              <text :class="styles.statValue">{{ formatNumber(totalEarned) }}</text>
              <text :class="styles.statLabel">累计获取</text>
            </view>
            <view :class="styles.statItem">
              <text :class="styles.statValue">{{ formatNumber(totalSpent) }}</text>
              <text :class="styles.statLabel">累计消耗</text>
            </view>
          </view>
          <view :class="styles.recordsBtn" @click="goToRecords">
            <text>兑换记录</text>
            <text>›</text>
          </view>
        </view>
      </view>
    </view>

    <view :class="styles.tabs">
      <view
        v-for="tab in tabs"
        :key="tab.id"
        :class="[styles.tabItem, activeTab === tab.id ? styles.active : '']"
        @click="handleTabChange(tab.id)"
      >
        <text>{{ tab.label }}</text>
      </view>
    </view>

    <view :class="styles.productList">
      <view v-if="products.length > 0" :class="styles.productGrid">
        <view
          v-for="product in products"
          :key="product.id"
          :class="styles.productCard"
        >
          <view :class="styles.productImageWrapper">
            <image
              :class="styles.productImage"
              :src="product.image"
              mode="aspectFill"
            />
            <view v-if="product.tags.length > 0" :class="styles.tagList">
              <text
                v-for="tag in product.tags.slice(0, 2)"
                :key="tag"
                :class="styles.tag"
              >
                {{ tag }}
              </text>
            </view>
          </view>
          <view :class="styles.productInfo">
            <text :class="styles.productName">{{ product.name }}</text>
            <text :class="styles.productDesc">{{ product.description }}</text>
            <view :class="styles.productFooter">
              <view :class="styles.priceInfo">
                <text :class="styles.pointsIcon">⭐</text>
                <text :class="styles.pointsPrice">{{ formatNumber(product.points) }}</text>
                <text v-if="product.originalPrice" :class="styles.originalPrice">
                  ¥{{ product.originalPrice }}
                </text>
              </view>
              <view
                :class="[
                  styles.exchangeBtn,
                  product.stock === 0 || userPoints < product.points ? styles.disabled : ''
                ]"
                @click="product.stock > 0 && userPoints >= product.points && openExchangeModal(product)"
              >
                <text>{{ product.stock === 0 ? '已抢光' : '立即兑换' }}</text>
              </view>
            </view>
            <view :class="styles.stockInfo">
              <text>库存{{ product.stock }} · 已兑{{ product.sales }}</text>
            </view>
          </view>
        </view>
      </view>

      <view v-else :class="styles.emptyState">
        <text :class="styles.emptyIcon">🎁</text>
        <text :class="styles.emptyText">暂无商品</text>
      </view>
    </view>

    <view v-if="showModal && selectedProduct" :class="styles.exchangeModal" @click.stop>
      <view :class="styles.modalContent" @click.stop>
        <text :class="styles.modalTitle">确认兑换</text>

        <view :class="styles.modalProduct">
          <image
            :class="styles.modalProductImage"
            :src="selectedProduct.image"
            mode="aspectFill"
          />
          <view :class="styles.modalProductInfo">
            <text :class="styles.modalProductName">{{ selectedProduct.name }}</text>
            <text :class="styles.modalProductPoints">
              ⭐ {{ formatNumber(selectedProduct.points) }} 积分
            </text>
          </view>
        </view>

        <view :class="styles.quantitySection">
          <text :class="styles.quantityLabel">兑换数量</text>
          <view :class="styles.quantitySelector">
            <view
              :class="[styles.quantityBtn, exchangeQuantity <= 1 ? styles.disabled : '']"
              @click="decreaseQuantity"
            >
              <text>−</text>
            </view>
            <text :class="styles.quantityValue">{{ exchangeQuantity }}</text>
            <view
              :class="[
                styles.quantityBtn,
                exchangeQuantity >= (selectedProduct.exchangeLimit || selectedProduct.stock) ? styles.disabled : ''
              ]"
              @click="increaseQuantity"
            >
              <text>+</text>
            </view>
          </view>
          <text v-if="selectedProduct.exchangeLimit" style="font-size: 24rpx; color: #86909C; margin-top: 8rpx;">
            每人限兑{{ selectedProduct.exchangeLimit }}件
          </text>
        </view>

        <view v-if="selectedProduct.category !== 'coupon'" :class="styles.addressSection">
          <text :class="styles.addressLabel">收货地址</text>
          <view :class="styles.addressSelect" @click="selectAddress">
            <view v-if="selectedAddress" :class="styles.addressInfo">
              <text :class="styles.addressName">
                {{ selectedAddress.name }} {{ selectedAddress.phone }}
              </text>
              <text :class="styles.addressDetail">
                {{ selectedAddress.province }}{{ selectedAddress.city }}{{ selectedAddress.district }}{{ selectedAddress.detail }}
              </text>
            </view>
            <view v-else :class="styles.addressInfo">
              <text :class="styles.addressName" style="color: #86909C;">请选择收货地址</text>
            </view>
            <text :class="styles.addressArrow">›</text>
          </view>
        </view>

        <view :class="styles.summary">
          <text :class="styles.summaryLabel">共需积分</text>
          <text :class="styles.summaryValue">⭐ {{ formatNumber(totalPoints) }}</text>
        </view>

        <view :class="styles.modalFooter">
          <view :class="[styles.modalBtn, styles.cancel]" @click="closeModal">
            <text>取消</text>
          </view>
          <view
            :class="[
              styles.modalBtn,
              styles.confirm,
              !canExchange ? styles.disabled : ''
            ]"
            @click="canExchange && confirmExchange"
          >
            <text>确认兑换</text>
          </view>
        </view>
      </view>
    </view>
  </scroll-view>
</template>
