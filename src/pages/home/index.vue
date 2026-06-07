<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { View, Text, ScrollView, Swiper, SwiperItem, Image } from '@tarojs/components'
import Taro, { useDidShow, usePullDownRefresh, useReachBottom } from '@tarojs/taro'
import type { Product, Category } from '@/types'
import { products, categories } from '@/mock/products'
import { useArrivalStore } from '@/stores/arrival'
import ProductCard from '@/components/ProductCard.vue'
import CompareBar from '@/components/CompareBar.vue'
import styles from './index.module.scss'

const banners = ref([
  { id: 1, image: 'https://picsum.photos/id/292/750/400', title: '新鲜水果' },
  { id: 2, image: 'https://picsum.photos/id/312/750/400', title: '精品肉类' },
  { id: 3, image: 'https://picsum.photos/id/431/750/400', title: '限时特惠' }
])

const arrivalStore = useArrivalStore()

const page = ref(1)
const pageSize = 6
const loading = ref(false)
const hasMore = ref(true)
const lastRefreshTime = ref<Date | null>(null)
const newArrivalProducts = ref<Product[]>([])

interface Section {
  id: string
  title: string
  icon: string
  products: Product[]
  categoryId?: string
  bgColor: string
  accentColor: string
}

const hotProducts = computed(() => 
  [...products].filter(p => p.inStock).sort((a, b) => b.sales - a.sales).slice(0, 4)
)

const newProducts = computed(() => 
  [...products].filter(p => p.inStock).sort((a, b) => b.rating - a.rating).slice(0, 4)
)

const fruitProducts = computed(() => 
  products.filter(p => p.category === 'fruit' && p.inStock)
)

const meatProducts = computed(() => 
  products.filter(p => p.category === 'meat' && p.inStock)
)

const seafoodProducts = computed(() => 
  products.filter(p => p.category === 'seafood' && p.inStock)
)

const sections = computed<Section[]>(() => {
  const result: Section[] = []
  
  if (newArrivalProducts.value.length > 0) {
    result.push({
      id: 'new-arrival',
      title: '刚刚到货',
      icon: '🎉',
      products: newArrivalProducts.value,
      bgColor: 'linear-gradient(135deg, #FFF5F5 0%, #FFFAF0 100%)',
      accentColor: '#FF6B35'
    })
  }
  
  result.push({
    id: 'hot',
    title: '热销爆款',
    icon: '🔥',
    products: hotProducts.value,
    bgColor: 'linear-gradient(135deg, #FFF0F0 0%, #FFF5F5 100%)',
    accentColor: '#FF4D4F'
  })
  
  result.push({
    id: 'new',
    title: '高分精选',
    icon: '⭐',
    products: newProducts.value,
    bgColor: 'linear-gradient(135deg, #FFFBE6 0%, #FFFDF0 100%)',
    accentColor: '#FAAD14'
  })
  
  if (fruitProducts.value.length > 0) {
    result.push({
      id: 'fruit',
      title: '新鲜水果',
      icon: '🍎',
      products: fruitProducts.value,
      categoryId: 'fruit',
      bgColor: 'linear-gradient(135deg, #F6FFED 0%, #F9FFF0 100%)',
      accentColor: '#52C41A'
    })
  }
  
  if (meatProducts.value.length > 0) {
    result.push({
      id: 'meat',
      title: '精品肉类',
      icon: '🥩',
      products: meatProducts.value,
      categoryId: 'meat',
      bgColor: 'linear-gradient(135deg, #FFF0F6 0%, #FFF5F9 100%)',
      accentColor: '#EB2F96'
    })
  }
  
  if (seafoodProducts.value.length > 0) {
    result.push({
      id: 'seafood',
      title: '海鲜水产',
      icon: '🦐',
      products: seafoodProducts.value,
      categoryId: 'seafood',
      bgColor: 'linear-gradient(135deg, #E6F7FF 0%, #F0F9FF 100%)',
      accentColor: '#1890FF'
    })
  }
  
  return result
})

const paginatedProducts = ref<Product[]>([])

const loadMoreProducts = () => {
  if (loading.value || !hasMore.value) return
  
  loading.value = true
  console.log('[Home] 加载更多商品，第', page.value, '页')
  
  setTimeout(() => {
    const allProducts = products.filter(p => p.inStock)
    const start = (page.value - 1) * pageSize
    const end = start + pageSize
    const newProducts = allProducts.slice(start, end)
    
    if (newProducts.length > 0) {
      paginatedProducts.value = [...paginatedProducts.value, ...newProducts]
      page.value++
      
      if (end >= allProducts.length) {
        hasMore.value = false
      }
    } else {
      hasMore.value = false
    }
    
    loading.value = false
  }, 500)
}

const loadInitialProducts = () => {
  console.log('[Home] 初始化商品列表')
  page.value = 1
  hasMore.value = true
  paginatedProducts.value = []
  loadMoreProducts()
}

const handleRefresh = () => {
  console.log('[Home] 下拉刷新')
  
  const restockedProducts = arrivalStore.checkStockUpdates()
  if (restockedProducts.length > 0) {
    newArrivalProducts.value = restockedProducts
  }
  
  page.value = 1
  hasMore.value = true
  paginatedProducts.value = []
  lastRefreshTime.value = new Date()
  
  loadMoreProducts()
  
  setTimeout(() => {
    Taro.stopPullDownRefresh()
    
    if (restockedProducts.length > 0) {
      Taro.showToast({
        title: `有${restockedProducts.length}件新到货`,
        icon: 'success'
      })
    } else {
      Taro.showToast({
        title: '已更新最新商品',
        icon: 'success'
      })
    }
  }, 800)
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

const handleSectionMore = (section: Section) => {
  console.log('[Home] 查看更多分区:', section.title)
  if (section.categoryId) {
    Taro.switchTab({
      url: '/pages/category/index'
    })
  }
}

const handleSearch = () => {
  Taro.navigateTo({
    url: '/pages/search/index'
  })
}

const handleComboClick = () => {
  console.log('[Home] 点击搭配套餐')
  Taro.navigateTo({
    url: '/pages/combo/index'
  })
}

const formatRefreshTime = (date: Date) => {
  const now = new Date()
  const diff = Math.floor((now.getTime() - date.getTime()) / 1000)
  if (diff < 60) return '刚刚更新'
  if (diff < 3600) return `${Math.floor(diff / 60)}分钟前更新`
  return `${Math.floor(diff / 3600)}小时前更新`
}

useDidShow(() => {
  console.log('[Home] 页面显示')
  if (paginatedProducts.value.length === 0) {
    loadInitialProducts()
  }
  
  const restocked = arrivalStore.checkStockUpdates()
  if (restocked.length > 0) {
    newArrivalProducts.value = [...newArrivalProducts.value, ...restocked]
  }
})

usePullDownRefresh(() => {
  handleRefresh()
})

useReachBottom(() => {
  console.log('[Home] 触底加载更多')
  if (hasMore.value && !loading.value) {
    loadMoreProducts()
  }
})

onMounted(() => {
  loadInitialProducts()
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
            :class="styles.categoryItem"
            @click="handleComboClick"
          >
            <text :class="styles.categoryIcon">🍽️</text>
            <text :class="styles.categoryName">搭配套餐</text>
          </view>
          <view
            v-for="category in categories.slice(1, 6)"
            :key="category.id"
            :class="styles.categoryItem"
            @click="handleCategoryClick(category.id)"
          >
            <text :class="styles.categoryIcon">{{ category.icon }}</text>
            <text :class="styles.categoryName">{{ category.name }}</text>
          </view>
        </view>
      </view>

      <view v-if="lastRefreshTime" :class="styles.refreshTip">
        <text :class="styles.refreshTipText">{{ formatRefreshTime(lastRefreshTime) }}</text>
      </view>

      <view
        v-for="section in sections"
        :key="section.id"
        :class="[styles.section, styles[`section-${section.id}`]]"
        :style="{ background: section.bgColor }"
      >
        <view :class="styles.sectionHeader" :style="{ borderLeftColor: section.accentColor }">
          <view :class="styles.sectionTitleWrapper">
            <text :class="styles.sectionIcon">{{ section.icon }}</text>
            <text :class="styles.sectionTitle">{{ section.title }}</text>
            <text 
              v-if="section.id === 'new-arrival'" 
              :class="styles.newBadge"
              :style="{ background: section.accentColor }"
            >NEW</text>
          </view>
          <text 
            v-if="section.products.length >= 4" 
            :class="styles.sectionMore"
            @click="handleSectionMore(section)"
          >查看更多 ›</text>
        </view>
        <view :class="styles.productGrid">
          <ProductCard
            v-for="product in section.products.slice(0, 4)"
            :key="product.id"
            :product="product"
            @click="handleProductClick"
          />
        </view>
      </view>

      <view :class="styles.moreSection">
        <view :class="styles.sectionHeader">
          <view :class="styles.sectionTitleWrapper">
            <text :class="styles.sectionIcon">📦</text>
            <text :class="styles.sectionTitle">更多好物</text>
          </view>
        </view>
        <view :class="styles.productGrid">
          <ProductCard
            v-for="product in paginatedProducts"
            :key="product.id"
            :product="product"
            @click="handleProductClick"
          />
        </view>
        
        <view v-if="loading" :class="styles.loadingMore">
          <text :class="styles.loadingText">加载中...</text>
        </view>
        
        <view v-else-if="!hasMore && paginatedProducts.length > 0" :class="styles.footer">
          <text :class="styles.footerText">— 已经到底啦 —</text>
        </view>
      </view>
    </scroll-view>

    <CompareBar />
  </view>
</template>
