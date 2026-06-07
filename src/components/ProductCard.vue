<script setup lang="ts">
import { computed } from 'vue'
import Taro from '@tarojs/taro'
import { View, Text, Image, Button } from '@tarojs/components'
import type { Product } from '@/types'
import { useCompareStore } from '@/stores/compare'
import { formatPrice, renderStars, formatSales } from '@/utils'
import styles from './ProductCard.module.scss'

const props = defineProps<{
  product: Product
}>()

const emit = defineEmits<{
  (e: 'click', product: Product): void
}>()

const compareStore = useCompareStore()
const inCompare = computed(() => compareStore.isInCompare(props.product.id))

const handleClick = () => {
  emit('click', props.product)
}

const handleCompare = (e: Event) => {
  e.stopPropagation()
  if (inCompare.value) {
    compareStore.removeFromCompare(props.product.id)
  } else {
    compareStore.addToCompare(props.product)
  }
}

const handleAddCart = (e: Event) => {
  e.stopPropagation()
  // 购物车功能在购物车 store 中实现
  Taro.showToast({
    title: '已加入购物车',
    icon: 'success'
  })
}
</script>

<template>
  <view :class="styles.card" @click="handleClick">
    <view :class="styles.compareBtn" @click.stop="handleCompare">
      <text :class="[styles.compareIcon, inCompare && styles.active]">
        {{ inCompare ? '✓' : '⚖' }}
      </text>
    </view>
    
    <image
      :class="styles.image"
      :src="product.image"
      mode="aspectFill"
    />
    
    <view :class="styles.content">
      <text :class="styles.name">{{ product.name }}</text>
      
      <view :class="styles.tags">
        <text
          v-for="tag in product.tags.slice(0, 2)"
          :key="tag"
          :class="styles.tag"
        >
          {{ tag }}
        </text>
      </view>
      
      <view :class="styles.rating">
        <text :class="styles.stars">{{ renderStars(product.rating) }}</text>
        <text :class="styles.ratingValue">{{ product.rating }}</text>
        <text :class="styles.reviewCount">{{ product.reviewCount }}条评价</text>
      </view>
      
      <view :class="styles.footer">
        <view :class="styles.priceWrapper">
          <text :class="styles.currency">¥</text>
          <text :class="styles.price">{{ formatPrice(product.price) }}</text>
          <text v-if="product.originalPrice > product.price" :class="styles.originalPrice">
            ¥{{ formatPrice(product.originalPrice) }}
          </text>
        </view>
        <text :class="styles.sales">已售{{ formatSales(product.sales) }}</text>
      </view>
      
      <button :class="styles.addCartBtn" @click.stop="handleAddCart">
        加入购物车
      </button>
    </view>
  </view>
</template>
