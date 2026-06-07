<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { View, Text, ScrollView, Swiper, SwiperItem, Image } from '@tarojs/components'
import Taro, { useDidShow, usePullDownRefresh, useReachBottom } from '@tarojs/taro'
import type { Product } from '@/types'
import { products, categories } from '@/mock/products'
import ProductCard from '@/components/ProductCard.vue'
import CompareBar from '@/components/CompareBar.vue'
import styles from './index.module.scss'

const banners = ref([
  { id: 1, image: 'https://picsum.photos/id/292/750/400', title: '新鲜水果' },
  { id: 2, image: 'https://picsum.photos/id/312/750/400', title: '精品肉类' },
  { id: 3, image: 'https://picsum.photos/id/431/750/400', title: '限时特惠' }
])

const productList = ref<Product[]>([])
const loading = ref(false)

const loadProducts = () => {
  console.log('[Home] 加载商品列表')
  productList.value = products
}

const handleProductClick = (product: Product) => {
  console.log('[Home] 点击商品:', product.name)
  Taro.navigateTo({
    url: `/pages/detail/index?id=${product.id}`
  })
}

const handleCategoryClick = (categoryId: string) => {
  console.log('[Home] 点击分类:', categoryId)
  Taro.switchTab({
    url: '/pages/category/index'
  })
}

const handleSearch = () => {
  Taro.navigateTo({
    url: '/pages/search/index'
  })
}

useDidShow(() => {
  console.log('[Home] 页面显示')
  if (productList.value.length === 0) {
    loadProducts()
  }
})

usePullDownRefresh(() => {
  console.log('[Home] 下拉刷新')
  loadProducts()
  setTimeout(() => {
    Taro.stopPullDownRefresh()
  }, 1000)
})

useReachBottom(() => {
  console.log('[Home] 触底加载更多')
})

onMounted(() => {
  loadProducts()
})
</script>

<template>
  <view :class="styles.page">
    <view :class="styles.header">
      <view :class="styles.searchBar" @click="handleSearch">
        <text :class="styles.searchIcon">🔍</text>
        <text :class="styles.searchPlaceholder">搜索水果、肉类、海鲜...</text>
      </view>
    </view>

    <scroll-view :class="styles.scrollView" scroll-y>
      <swiper
        :class="styles.swiper"
        :autoplay="true"
        :interval="3000"
        :circular="true"
        :indicator-dots="true"
        indicator-color="rgba(255,255,255,0.5)"
        indicator-active-color="#FFFFFF"
      >
        <swiper-item v-for="banner in banners" :key="banner.id">
          <image
            :class="styles.bannerImage"
            :src="banner.image"
            mode="aspectFill"
          />
        </swiper-item>
      </swiper>

      <view :class="styles.categorySection">
        <text :class="styles.sectionTitle">精选分类</text>
        <view :class="styles.categoryGrid">
          <view
            v-for="category in categories.slice(1, 7)"
            :key="category.id"
            :class="styles.categoryItem"
            @click="handleCategoryClick(category.id)"
          >
            <text :class="styles.categoryIcon">{{ category.icon }}</text>
            <text :class="styles.categoryName">{{ category.name }}</text>
          </view>
        </view>
      </view>

      <view :class="styles.productSection">
        <view :class="styles.sectionHeader">
          <text :class="styles.sectionTitle">为你推荐</text>
          <text :class="styles.sectionMore">查看更多 ›</text>
        </view>
        <view :class="styles.productGrid">
          <ProductCard
            v-for="product in productList"
            :key="product.id"
            :product="product"
            @click="handleProductClick"
          />
        </view>
      </view>

      <view :class="styles.footer">
        <text :class="styles.footerText">— 已经到底啦 —</text>
      </view>
    </scroll-view>

    <CompareBar />
  </view>
</template>
