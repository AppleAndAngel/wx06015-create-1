<script setup lang="ts">
import { computed } from 'vue'
import { View, Text, ScrollView, Button, Image } from '@tarojs/components'
import Taro from '@tarojs/taro'
import type { Product } from '@/types'
import { useCompareStore } from '@/stores/compare'
import { useCartStore } from '@/stores/cart'
import { formatPrice, renderStars, formatSales, formatReviewCount } from '@/utils'
import EmptyState from '@/components/EmptyState.vue'
import styles from './index.module.scss'

interface Dimension {
  key: string
  label: string
  highlightBest?: 'min' | 'max'
  bestLabel?: string
  getValue: (product: Product) => string | number
}

const compareStore = useCompareStore()
const cartStore = useCartStore()

const compareList = computed(() => compareStore.compareList)
const count = computed(() => compareStore.count)

const dimensions: Dimension[] = [
  {
    key: 'price',
    label: '价格',
    highlightBest: 'min',
    bestLabel: '最优价',
    getValue: (p) => p.price
  },
  {
    key: 'spec',
    label: '规格',
    getValue: (p) => p.spec
  },
  {
    key: 'packaging',
    label: '包装',
    getValue: (p) => p.packaging
  },
  {
    key: 'origin',
    label: '产地',
    getValue: (p) => p.origin
  },
  {
    key: 'weight',
    label: '重量',
    getValue: (p) => p.weight
  },
  {
    key: 'shelfLife',
    label: '保质期',
    getValue: (p) => p.shelfLife
  },
  {
    key: 'storage',
    label: '储存方式',
    getValue: (p) => p.storage
  },
  {
    key: 'rating',
    label: '评分',
    highlightBest: 'max',
    bestLabel: '高评分',
    getValue: (p) => p.rating
  },
  {
    key: 'reviewCount',
    label: '评价数',
    highlightBest: 'max',
    bestLabel: '口碑好',
    getValue: (p) => p.reviewCount
  },
  {
    key: 'sales',
    label: '销量',
    highlightBest: 'max',
    bestLabel: '热销',
    getValue: (p) => p.sales
  },
  {
    key: 'tags',
    label: '特色标签',
    getValue: (p) => p.tags.join('、')
  }
]

const bestValues = computed(() => {
  const result: Record<string, { value: string | number; productIds: string[] }> = {}
  
  dimensions.forEach(dim => {
    if (!dim.highlightBest || compareList.value.length === 0) return
    
    let bestValue: string | number = dim.highlightBest === 'min' 
      ? Infinity 
      : -Infinity
    let bestProductIds: string[] = []
    
    compareList.value.forEach(product => {
      const value = dim.getValue(product)
      const numValue = typeof value === 'number' ? value : parseFloat(String(value))
      
      if (dim.highlightBest === 'min') {
        if (numValue < (bestValue as number)) {
          bestValue = value
          bestProductIds = [product.id]
        } else if (numValue === (bestValue as number)) {
          bestProductIds.push(product.id)
        }
      } else {
        if (numValue > (bestValue as number)) {
          bestValue = value
          bestProductIds = [product.id]
        } else if (numValue === (bestValue as number)) {
          bestProductIds.push(product.id)
        }
      }
    })
    
    result[dim.key] = {
      value: bestValue,
      productIds: bestProductIds
    }
  })
  
  return result
})

const isBestValue = (dimKey: string, productId: string): boolean => {
  const best = bestValues.value[dimKey]
  return best?.productIds.includes(productId) ?? false
}

const getBestLabel = (dimKey: string): string | undefined => {
  const dim = dimensions.find(d => d.key === dimKey)
  return dim?.bestLabel
}

const formatValue = (dim: Dimension, product: Product): string => {
  const value = dim.getValue(product)
  
  if (dim.key === 'price') {
    return `¥${formatPrice(value as number)}`
  }
  if (dim.key === 'rating') {
    return `${renderStars(value as number)} ${value}`
  }
  if (dim.key === 'sales') {
    return formatSales(value as number)
  }
  if (dim.key === 'reviewCount') {
    return formatReviewCount(value as number)
  }
  
  return String(value)
}

const handleRemove = (productId: string) => {
  compareStore.removeFromCompare(productId)
}

const handleClear = () => {
  Taro.showModal({
    title: '确认清空',
    content: '确定要清空对比列表吗？',
    success: (res) => {
      if (res.confirm) {
        compareStore.clearCompare()
      }
    }
  })
}

const handleAddAllToCart = () => {
  if (compareList.value.length === 0) return
  
  compareList.value.forEach(product => {
    cartStore.addToCart(product, 1)
  })
  
  Taro.showToast({
    title: '已全部加入购物车',
    icon: 'success'
  })
}

const handleGoBack = () => {
  Taro.navigateBack()
}

const handleGoShopping = () => {
  Taro.switchTab({
    url: '/pages/home/index'
  })
}

const handleProductClick = (product: Product) => {
  Taro.navigateTo({
    url: `/pages/detail/index?id=${product.id}`
  })
}
</script>

<template>
  <view :class="styles.page">
    <view v-if="count === 0" :class="styles.empty">
      <EmptyState
        icon="⚖️"
        title="暂无对比商品"
        description="去首页挑选商品，点击对比按钮添加到对比列表"
      />
      <button :class="styles.goShoppingBtn" @click="handleGoShopping">
        去逛逛
      </button>
    </view>

    <view v-else :class="styles.content">
      <view :class="styles.header">
        <view :class="styles.headerLeft">
          <text :class="styles.title">商品对比</text>
          <text :class="styles.subtitle">已选 {{ count }} 件商品</text>
        </view>
        <button :class="styles.clearBtn" @click="handleClear">
          清空
        </button>
      </view>

      <scroll-view :class="styles.tableContainer" scroll-x>
        <view :class="styles.table">
          <view :class="styles.tableHeader">
            <view :class="[styles.tableCell, styles.dimensionCell]">
              <text :class="styles.dimensionLabel">对比项</text>
            </view>
            <view
              v-for="product in compareList"
              :key="product.id"
              :class="[styles.tableCell, styles.productHeader]"
            >
              <view :class="styles.productInfo" @click="handleProductClick(product)">
                <image
                  :class="styles.productImage"
                  :src="product.image"
                  mode="aspectFill"
                />
                <text :class="styles.productName">{{ product.name }}</text>
              </view>
              <view
                :class="styles.removeBtn"
                @click="handleRemove(product.id)"
              >
                <text :class="styles.removeIcon">×</text>
              </view>
            </view>
          </view>

          <view
            v-for="dim in dimensions"
            :key="dim.key"
            :class="styles.tableRow"
          >
            <view :class="[styles.tableCell, styles.dimensionCell]">
              <text :class="styles.dimensionLabel">{{ dim.label }}</text>
            </view>
            <view
              v-for="product in compareList"
              :key="product.id"
              :class="[
                styles.tableCell,
                styles.valueCell,
                isBestValue(dim.key, product.id) && styles.bestValue
              ]"
            >
              <view v-if="dim.key === 'tags'" :class="styles.tagsContainer">
                <text
                  v-for="tag in product.tags"
                  :key="tag"
                  :class="styles.tag"
                >
                  {{ tag }}
                </text>
              </view>
              <view v-else :class="styles.valueWrapper">
                <text
                  :class="[
                    styles.value,
                    dim.key === 'price' && styles.priceValue
                  ]"
                >
                  {{ formatValue(dim, product) }}
                </text>
                <text
                  v-if="isBestValue(dim.key, product.id) && getBestLabel(dim.key)"
                  :class="styles.bestLabel"
                >
                  {{ getBestLabel(dim.key) }}
                </text>
              </view>
            </view>
          </view>
        </view>
      </scroll-view>

      <view :class="styles.footer">
        <button :class="styles.addAllBtn" @click="handleAddAllToCart">
          全部加入购物车
        </button>
      </view>
    </view>
  </view>
</template>
