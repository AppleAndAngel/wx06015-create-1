<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { View, Text, ScrollView, Image, Button } from '@tarojs/components'
import Taro from '@tarojs/taro'
import { useArrivalStore } from '@/stores/arrival'
import { useCartStore } from '@/stores/cart'
import { formatPrice } from '@/utils'
import type { ArrivalReminderItem } from '@/types'
import EmptyState from '@/components/EmptyState'
import styles from './index.module.scss'

const arrivalStore = useArrivalStore()
const cartStore = useCartStore()

type TabType = 'all' | 'inStock' | 'outOfStock'
const activeTab = ref<TabType>('all')

const tabs = [
  { id: 'all', label: '全部' },
  { id: 'inStock', label: '已到货' },
  { id: 'outOfStock', label: '待到货' }
]

const filteredList = computed(() => {
  const list = arrivalStore.sortedList
  switch (activeTab.value) {
    case 'inStock':
      return list.filter(item => item.product.inStock)
    case 'outOfStock':
      return list.filter(item => !item.product.inStock)
    default:
      return list
  }
})

const handleTabChange = (tabId: TabType) => {
  activeTab.value = tabId
}

const handleItemClick = (item: ArrivalReminderItem) => {
  Taro.navigateTo({
    url: `/pages/detail/index?id=${item.product.id}`
  })
}

const handleRemove = (e: Event, productId: string) => {
  e.stopPropagation()
  Taro.showModal({
    title: '取消提醒',
    content: '确定要取消该商品的到货提醒吗？',
    success: (res) => {
      if (res.confirm) {
        arrivalStore.removeFromReminder(productId)
        Taro.showToast({
          title: '已取消提醒',
          icon: 'success'
        })
      }
    }
  })
}

const handleBuy = (e: Event, item: ArrivalReminderItem) => {
  e.stopPropagation()
  if (!item.product.inStock) {
    Taro.showToast({
      title: '商品暂时缺货',
      icon: 'none'
    })
    return
  }
  cartStore.addToCart(item.product)
}

const formatDate = (timestamp: number) => {
  const date = new Date(timestamp)
  const month = date.getMonth() + 1
  const day = date.getDate()
  return `${month}月${day}日`
}

const getDaysUntilRestock = (restockDate?: string) => {
  if (!restockDate) return null
  const today = new Date('2026-06-07')
  const restock = new Date(restockDate)
  const diffTime = restock.getTime() - today.getTime()
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  return diffDays
}

onMounted(() => {
  arrivalStore.checkStockUpdates()
})
</script>

<template>
  <view :class="styles.container">
    <scroll-view :class="styles.content" scroll-y>
      <view :class="styles.header">
        <text :class="styles.title">到货提醒</text>
        <text :class="styles.subtitle">关注的商品到货后第一时间通知您</text>
      </view>

      <view v-if="arrivalStore.count > 0" :class="styles.tabs">
        <view
          v-for="tab in tabs"
          :key="tab.id"
          :class="[styles.tab, activeTab === tab.id && styles.active]"
          @click="handleTabChange(tab.id as TabType)"
        >
          <text>{{ tab.label }}</text>
        </view>
      </view>

      <view v-if="arrivalStore.count === 0">
        <EmptyState
          icon="🔔"
          title="暂无到货提醒"
          description="遇到缺货的商品可以设置到货提醒哦"
        />
      </view>

      <view v-else-if="filteredList.length === 0">
        <EmptyState
          icon="📦"
          title="该分类暂无商品"
          description="看看其他分类吧"
        />
      </view>

      <view v-else :class="styles.list">
        <view
          v-for="item in filteredList"
          :key="item.product.id"
          :class="styles.item"
          @click="handleItemClick(item)"
        >
          <view v-if="item.product.inStock && !item.notified" :class="styles.newBadge">
            新到货
          </view>

          <image
            :class="styles.image"
            :src="item.product.image"
            mode="aspectFill"
          />

          <view :class="styles.info">
            <view>
              <text :class="styles.name">{{ item.product.name }}</text>
              <text :class="styles.spec">{{ item.product.spec }} · {{ item.product.packaging }}</text>
              
              <view :class="styles.status">
                <text :class="styles.statusIcon">
                  {{ item.product.inStock ? '✅' : '⏳' }}
                </text>
                <text :class="[styles.statusText, item.product.inStock ? styles.inStock : styles.outOfStock]">
                  {{ item.product.inStock ? '已到货' : '暂时缺货' }}
                </text>
                <text v-if="!item.product.inStock && item.product.restockDate" :class="styles.restockDate">
                  预计{{ getDaysUntilRestock(item.product.restockDate) }}天后到货
                </text>
              </view>
            </view>

            <view :class="styles.bottom">
              <view :class="styles.priceWrapper">
                <text :class="styles.currency">¥</text>
                <text :class="styles.price">{{ formatPrice(item.product.price) }}</text>
                <text v-if="item.product.originalPrice > item.product.price" :class="styles.originalPrice">
                  ¥{{ formatPrice(item.product.originalPrice) }}
                </text>
              </view>

              <view :class="styles.actions">
                <button
                  :class="styles.removeBtn"
                  @click.stop="handleRemove($event, item.product.id)"
                >
                  取消提醒
                </button>
                <button
                  :class="styles.buyBtn"
                  @click.stop="handleBuy($event, item)"
                >
                  {{ item.product.inStock ? '加入购物车' : '提醒中' }}
                </button>
              </view>
            </view>
          </view>
        </view>
      </view>

      <view style="height: 60px" />
    </scroll-view>
  </view>
</template>
