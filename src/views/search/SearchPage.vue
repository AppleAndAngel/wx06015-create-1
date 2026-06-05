<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { Search, Tag, Icon, List } from 'vant'
import ProductCard from '@/components/ProductCard.vue'
import EmptyState from '@/components/EmptyState.vue'
import { searchProducts } from '@/mock/products'
import type { Product } from '@/types'

const router = useRouter()

const keyword = ref('')
const historyKeywords = ref<string[]>([])
const hotKeywords = ['车厘子', '牛排', '三文鱼', '有机蔬菜', '酸奶', '大闸蟹']

const searchResults = ref<Product[]>([])
const hasSearched = ref(false)
const loading = ref(false)
const finished = ref(false)
let page = 0
const pageSize = 10

const loadHistory = () => {
  const data = localStorage.getItem('searchHistory')
  if (data) {
    try {
      historyKeywords.value = JSON.parse(data)
    } catch {
      historyKeywords.value = []
    }
  }
}

const saveHistory = (kw: string) => {
  const list = historyKeywords.value.filter((k) => k !== kw)
  list.unshift(kw)
  if (list.length > 10) list.pop()
  historyKeywords.value = list
  localStorage.setItem('searchHistory', JSON.stringify(list))
}

const onSearch = (val: string) => {
  const kw = val.trim()
  if (!kw) return
  keyword.value = kw
  saveHistory(kw)
  hasSearched.value = true
  searchResults.value = searchProducts(kw)
  page = 1
  finished.value = searchResults.value.length <= pageSize
}

const onHotSearch = (kw: string) => {
  onSearch(kw)
}

const onClearHistory = () => {
  historyKeywords.value = []
  localStorage.removeItem('searchHistory')
}

const onLoad = () => {
  if (!hasSearched.value) {
    loading.value = false
    return
  }
  page++
  const all = searchProducts(keyword.value)
  const start = (page - 1) * pageSize
  const end = start + pageSize
  const more = all.slice(start, end)
  if (page === 1) {
    searchResults.value = more
  } else {
    searchResults.value.push(...more)
  }
  loading.value = false
  if (end >= all.length) {
    finished.value = true
  }
}

onMounted(() => {
  loadHistory()
})
</script>

<template>
  <div class="search-page">
    <div class="search-page__bar">
      <van-search
        v-model="keyword"
        placeholder="搜索新鲜好物"
        shape="round"
        autofocus
        show-action
        @search="onSearch"
        @cancel="router.back()"
      />
    </div>

    <div v-if="!hasSearched" class="search-page__home">
      <div class="history-section" v-if="historyKeywords.length">
        <div class="section-head">
          <span class="section-head__title">搜索历史</span>
          <van-icon name="delete-o" size="18" color="#999" @click="onClearHistory" />
        </div>
        <div class="tag-list">
          <van-tag
            v-for="kw in historyKeywords"
            :key="kw"
            size="medium"
            plain
            type="default"
            class="tag-list__item"
            @click="onHotSearch(kw)"
          >
            {{ kw }}
          </van-tag>
        </div>
      </div>

      <div class="hot-section">
        <div class="section-head">
          <span class="section-head__title">热门搜索</span>
        </div>
        <div class="tag-list">
          <van-tag
            v-for="kw in hotKeywords"
            :key="kw"
            size="medium"
            plain
            type="primary"
            class="tag-list__item"
            @click="onHotSearch(kw)"
          >
            {{ kw }}
          </van-tag>
        </div>
      </div>
    </div>

    <div v-else class="search-page__results">
      <EmptyState
        v-if="searchResults.length === 0"
        description="未找到相关商品"
      />
      <van-list
        v-else
        v-model:loading="loading"
        :finished="finished"
        finished-text="没有更多了"
        @load="onLoad"
      >
        <div class="product-grid">
          <ProductCard
            v-for="product in searchResults"
            :key="product.id"
            :product="product"
            mode="grid"
          />
        </div>
      </van-list>
    </div>
  </div>
</template>

<style scoped lang="scss">
@use '@/assets/styles/variables' as *;

.search-page {
  min-height: 100vh;
  background: $bg;

  &__bar {
    position: sticky;
    top: 0;
    z-index: 10;
    background: $bg-card;

    :deep(.van-search) {
      padding: 8px 12px;
    }
  }

  &__home {
    padding: 16px;
  }

  &__results {
    padding: 12px 16px;
  }
}

.section-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;

  &__title {
    font-size: 15px;
    font-weight: 600;
    color: $text-primary;
  }
}

.history-section {
  margin-bottom: 24px;
}

.tag-list {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;

  &__item {
    cursor: pointer;
  }
}

.product-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
}
</style>
