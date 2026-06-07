<script setup lang="ts">
import { ref, computed } from 'vue'
import { View, Text, ScrollView } from '@tarojs/components'
import Taro from '@tarojs/taro'
import type { Product, Category } from '@/types'
import { categories, getProductsByCategory } from '@/mock/products'
import ProductCard from '@/components/ProductCard.vue'
import CompareBar from '@/components/CompareBar.vue'
import { formatPrice } from '@/utils'
import styles from './index.module.scss'

const selectedCategory = ref('all')
const sortType = ref('default')

const categoryList = computed(() => categories)
const productList = computed(() => getProductsByCategory(selectedCategory.value))

const handleCategoryClick = (categoryId: string) => {
  selectedCategory.value = categoryId
  console.log('[Category] 选择分类:', categoryId)
}

const handleSortChange = (type: string) => {
  sortType.value = type
  console.log('[Category] 切换排序:', type)
}

const handleProductClick = (product: Product) => {
  Taro.navigateTo({
    url: `/pages/detail/index?id=${product.id}`
  })
}

const sortedProducts = computed(() => {
  const list = [...productList.value]
  
  switch (sortType.value) {
    case 'price-asc':
      return list.sort((a, b) => a.price - b.price)
    case 'price-desc':
      return list.sort((a, b) => b.price - a.price)
    case 'sales':
      return list.sort((a, b) => b.sales - a.sales)
    case 'rating':
      return list.sort((a, b) => b.rating - a.rating)
    default:
      return list
  }
})
</script>

<template>
  <view :class="styles.page">
    <view :class="styles.header">
      <view :class="styles.sortBar">
        <view
          :class="[styles.sortItem, sortType === 'default' && styles.active]"
          @click="handleSortChange('default')"
        >
          <text>综合</text>
        </view>
        <view
          :class="[styles.sortItem, sortType === 'sales' && styles.active]"
          @click="handleSortChange('sales')"
        >
          <text>销量</text>
        </view>
        <view
          :class="[styles.sortItem, sortType === 'price-asc' && styles.active]"
          @click="handleSortChange('price-asc')"
        >
          <text>价格↑</text>
        </view>
        <view
          :class="[styles.sortItem, sortType === 'price-desc' && styles.active]"
          @click="handleSortChange('price-desc')"
        >
          <text>价格↓</text>
        </view>
        <view
          :class="[styles.sortItem, sortType === 'rating' && styles.active]"
          @click="handleSortChange('rating')"
        >
          <text>评分</text>
        </view>
      </view>
    </view>

    <view :class="styles.content">
      <scroll-view :class="styles.sidebar" scroll-y>
        <view
          v-for="category in categoryList"
          :key="category.id"
          :class="[
            styles.categoryItem,
            selectedCategory === category.id && styles.active
          ]"
          @click="handleCategoryClick(category.id)"
        >
          <text :class="styles.categoryIcon">{{ category.icon }}</text>
          <text :class="styles.categoryName">{{ category.name }}</text>
        </view>
      </scroll-view>

      <scroll-view :class="styles.productList" scroll-y>
        <view :class="styles.productGrid">
          <ProductCard
            v-for="product in sortedProducts"
            :key="product.id"
            :product="product"
            @click="handleProductClick"
          />
        </view>
        <view v-if="sortedProducts.length === 0" :class="styles.empty">
          <text>该分类暂无商品</text>
        </view>
        <view :class="styles.footer">
          <text>— 已经到底啦 —</text>
        </view>
      </scroll-view>
    </view>

    <CompareBar />
  </view>
</template>
