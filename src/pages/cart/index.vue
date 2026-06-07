<script setup lang="ts">
import { computed } from 'vue'
import { View, Text, Button, Image } from '@tarojs/components'
import Taro from '@tarojs/taro'
import { useCartStore } from '@/stores/cart'
import { useCompareStore } from '@/stores/compare'
import { formatPrice } from '@/utils'
import EmptyState from '@/components/EmptyState.vue'
import styles from './index.module.scss'

const cartStore = useCartStore()
const compareStore = useCompareStore()

const cartList = computed(() => cartStore.cartList)
const allSelected = computed(() => cartStore.allSelected)
const totalPrice = computed(() => cartStore.totalPrice)
const selectedCount = computed(() => cartStore.selectedCount)

const handleSelectAll = () => {
  cartStore.toggleSelectAll(!allSelected.value)
}

const handleSelectItem = (productId: string) => {
  cartStore.toggleSelect(productId)
}

const handleQuantityChange = (productId: string, delta: number) => {
  const item = cartList.value.find(i => i.product.id === productId)
  if (!item) return
  cartStore.updateQuantity(productId, item.quantity + delta)
}

const handleCheckout = () => {
  if (selectedCount.value === 0) {
    Taro.showToast({
      title: '请选择要结算的商品',
      icon: 'none'
    })
    return
  }
  Taro.showToast({
    title: '结算功能开发中',
    icon: 'none'
  })
}

const handleGoShopping = () => {
  Taro.switchTab({
    url: '/pages/home/index'
  })
}
</script>

<template>
  <view :class="styles.page">
    <view v-if="cartList.length === 0" :class="styles.empty">
      <EmptyState
        icon="🛒"
        title="购物车是空的"
        description="去逛逛，挑选心仪的商品吧"
      />
      <button :class="styles.goShoppingBtn" @click="handleGoShopping">
        去逛逛
      </button>
    </view>

    <scroll-view v-else :class="styles.cartList" scroll-y>
      <view
        v-for="item in cartList"
        :key="item.product.id"
        :class="styles.cartItem"
      >
        <view
          :class="[styles.checkbox, item.selected && styles.checked]"
          @click="handleSelectItem(item.product.id)"
        >
          <text v-if="item.selected" :class="styles.checkIcon">✓</text>
        </view>

        <image
          :class="styles.productImage"
          :src="item.product.image"
          mode="aspectFill"
        />

        <view :class="styles.productInfo">
          <text :class="styles.productName">{{ item.product.name }}</text>
          <text :class="styles.productSpec">{{ item.product.spec }} / {{ item.product.packaging }}</text>
          <view :class="styles.priceRow">
            <text :class="styles.price">¥{{ formatPrice(item.product.price) }}</text>
            <view :class="styles.quantityControl">
              <view :class="styles.quantityBtn" @click="handleQuantityChange(item.product.id, -1)">
                <text>−</text>
              </view>
              <text :class="styles.quantity">{{ item.quantity }}</text>
              <view :class="styles.quantityBtn" @click="handleQuantityChange(item.product.id, 1)">
                <text>+</text>
              </view>
            </view>
          </view>
        </view>
      </view>
    </scroll-view>

    <view v-if="cartList.length > 0" :class="styles.footer">
      <view :class="styles.selectAll" @click="handleSelectAll">
        <view :class="[styles.checkbox, allSelected && styles.checked]">
          <text v-if="allSelected" :class="styles.checkIcon">✓</text>
        </view>
        <text :class="styles.selectAllText">全选</text>
      </view>

      <view :class="styles.total">
        <text :class="styles.totalLabel">合计：</text>
        <text :class="styles.totalPrice">¥{{ formatPrice(totalPrice) }}</text>
      </view>

      <button :class="styles.checkoutBtn" @click="handleCheckout">
        结算({{ selectedCount }})
      </button>
    </view>
  </view>
</template>
