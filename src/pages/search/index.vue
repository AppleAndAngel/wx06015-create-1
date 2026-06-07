<script setup lang="ts">
import { ref, computed } from 'vue'
import { View, Text, Input, ScrollView } from '@tarojs/components'
import Taro from '@tarojs/taro'
import { useCompareStore } from '@/stores/compare'
import { products } from '@/mock/products'
import ProductCard from '@/components/ProductCard'
import EmptyState from '@/components/EmptyState'
import CompareBar from '@/components/CompareBar'
import styles from './index.module.scss'

const compareStore = useCompareStore()

const searchText = ref('')
const hotKeywords = ['苹果', '牛肉', '草莓', '猪肉', '橙子', '三文鱼']

const searchResults = computed(() => {
  if (!searchText.value.trim()) return []
  const keyword = searchText.value.toLowerCase()
  return products.filter(
    p =>
      p.name.toLowerCase().includes(keyword) ||
      p.category.toLowerCase().includes(keyword) ||
      p.tags.some(tag => tag.toLowerCase().includes(keyword))
  )
})

const handleSearch = () => {
  console.log('[Search] 搜索关键词:', searchText.value)
}

const handleKeywordClick = (keyword: string) => {
  searchText.value = keyword
  handleSearch()
}

const handleClear = () => {
  searchText.value = ''
}

const goToDetail = (id: string) => {
  Taro.navigateTo({
    url: `/pages/detail/index?id=${id}`
  })
}
</script>

<template>
  <view :class="styles.container">
    <view :class="styles.searchBar">
      <view :class="styles.searchInputWrap">
        <text :class="styles.searchIcon">🔍</text>
        <input
          :class="styles.searchInput"
          type="text"
          v-model="searchText"
          placeholder="搜索商品名称、分类"
          confirm-type="search"
          @confirm="handleSearch"
          @input="handleSearch"
        />
        <text v-if="searchText" :class="styles.clearIcon" @click="handleClear">×</text>
      </view>
    </view>

    <view v-if="!searchText" :class="styles.hotSection">
      <text :class="styles.sectionTitle">热门搜索</text>
      <view :class="styles.keywordList">
        <view
          v-for="keyword in hotKeywords"
          :key="keyword"
          :class="styles.keywordItem"
          @click="handleKeywordClick(keyword)"
        >
          <text :class="styles.keywordText">{{ keyword }}</text>
        </view>
      </view>
    </view>

    <scroll-view v-else-if="searchResults.length > 0" :class="styles.resultList" scroll-y>
      <view :class="styles.resultHeader">
        <text :class="styles.resultCount">找到 {{ searchResults.length }} 个相关商品</text>
      </view>
      <view :class="styles.productGrid">
        <ProductCard
          v-for="product in searchResults"
          :key="product.id"
          :product="product"
          @click="goToDetail(product.id)"
        />
      </view>
    </scroll-view>

    <view v-else-if="searchText" :class="styles.emptyWrap">
      <EmptyState
        icon="🔍"
        title="未找到相关商品"
        description="试试其他关键词吧"
      />
    </view>

    <CompareBar />
  </view>
</template>
