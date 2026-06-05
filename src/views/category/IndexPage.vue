<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useCategoryStore } from '@/stores/category'
import { storeToRefs } from 'pinia'
import { getProductsByCategory, products } from '@/mock/products'
import ProductCard from '@/components/ProductCard.vue'

const route = useRoute()
const categoryStore = useCategoryStore()
const { categories, currentCategoryId } = storeToRefs(categoryStore)

const activeSort = ref<'default' | 'price' | 'sales'>('default')

onMounted(() => {
  if (categories.value.length === 0) {
    categoryStore.fetchCategories()
  }
  const queryId = Number(route.query.id)
  if (queryId) {
    categoryStore.setCurrentCategory(queryId)
  }
})

watch(() => route.query.id, (newId) => {
  if (newId) {
    categoryStore.setCurrentCategory(Number(newId))
  }
})

const filteredProducts = computed(() => {
  const list = getProductsByCategory(currentCategoryId.value)
  const sorted = [...list]
  if (activeSort.value === 'price') {
    sorted.sort((a, b) => a.price - b.price)
  } else if (activeSort.value === 'sales') {
    sorted.sort((a, b) => b.sales - a.sales)
  }
  return sorted
})

const selectCategory = (id: number) => {
  categoryStore.setCurrentCategory(id)
  activeSort.value = 'default'
}

const sortOptions: { key: 'default' | 'price' | 'sales'; label: string }[] = [
  { key: 'default', label: '综合' },
  { key: 'price', label: '价格' },
  { key: 'sales', label: '销量' },
]
</script>

<template>
  <div class="category-page">
    <div class="sidebar">
      <div
        v-for="cat in categories"
        :key="cat.id"
        :class="['sidebar__item', { 'sidebar__item--active': cat.id === currentCategoryId }]"
        @click="selectCategory(cat.id)"
      >
        {{ cat.name }}
      </div>
    </div>

    <div class="content">
      <div class="sort-bar">
        <div
          v-for="opt in sortOptions"
          :key="opt.key"
          :class="['sort-bar__item', { 'sort-bar__item--active': activeSort === opt.key }]"
          @click="activeSort = opt.key"
        >
          {{ opt.label }}
        </div>
      </div>

      <div class="product-grid">
        <ProductCard v-for="p in filteredProducts" :key="p.id" :product="p" mode="grid" />
      </div>

      <van-empty v-if="filteredProducts.length === 0" description="暂无商品" />
    </div>
  </div>
</template>

<style scoped lang="scss">
@use '@/assets/styles/variables' as *;
@use '@/assets/styles/mixins' as *;

.category-page {
  display: flex;
  min-height: 100vh;
  background: $bg;
}

.sidebar {
  width: 88px;
  flex-shrink: 0;
  background: $bg-card;
  overflow-y: auto;
  -webkit-overflow-scrolling: touch;
  height: 100vh;
  position: sticky;
  top: 0;

  &__item {
    padding: 16px 8px;
    font-size: 13px;
    color: $text-secondary;
    text-align: center;
    position: relative;
    cursor: pointer;
    transition: all 0.2s ease;

    &--active {
      color: $primary;
      background: $primary-light;
      font-weight: 600;

      &::before {
        content: '';
        position: absolute;
        left: 0;
        top: 50%;
        transform: translateY(-50%);
        width: 3px;
        height: 20px;
        background: $primary;
        border-radius: 0 3px 3px 0;
      }
    }
  }

  @include responsive(tablet) {
    width: 120px;

    &__item {
      font-size: 14px;
      padding: 18px 12px;
    }
  }
}

.content {
  flex: 1;
  padding: 12px;
  min-width: 0;
}

.sort-bar {
  display: flex;
  gap: 20px;
  margin-bottom: 12px;
  padding: 0 4px;

  &__item {
    font-size: 14px;
    color: $text-secondary;
    cursor: pointer;
    padding: 4px 0;
    position: relative;
    transition: color 0.2s;

    &--active {
      color: $primary;
      font-weight: 600;

      &::after {
        content: '';
        position: absolute;
        bottom: 0;
        left: 50%;
        transform: translateX(-50%);
        width: 20px;
        height: 2px;
        background: $primary;
        border-radius: 1px;
      }
    }
  }
}

.product-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 10px;

  @include responsive(desktop) {
    grid-template-columns: repeat(3, 1fr);
  }
}
</style>
