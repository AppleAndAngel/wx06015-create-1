<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { View, Text } from '@tarojs/components'
import Taro from '@tarojs/taro'
import { useCompareStore } from '@/stores/compare'
import { useCartStore } from '@/stores/cart'
import { useArrivalStore } from '@/stores/arrival'
import styles from './index.module.scss'

const compareStore = useCompareStore()
const cartStore = useCartStore()
const arrivalStore = useArrivalStore()

const compareCount = computed(() => compareStore.count)
const cartCount = computed(() => cartStore.totalCount)
const arrivalCount = computed(() => arrivalStore.count)
const arrivalInStockCount = computed(() => arrivalStore.inStockCount)

const menuItems = computed(() => [
  { id: 'order', icon: '📋', label: '我的订单', path: '/pages/order/index' },
  { id: 'favorite', icon: '❤️', label: '我的收藏', path: '/pages/favorite/index' },
  { id: 'arrival', icon: '🔔', label: '到货提醒', path: '/pages/arrival/index', badge: arrivalInStockCount.value > 0 ? arrivalInStockCount.value : null },
  { id: 'compare', icon: '⚖️', label: '商品对比', path: '/pages/compare/index', badge: compareCount.value > 0 ? compareCount.value : null },
  { id: 'address', icon: '📍', label: '收货地址', path: '' },
  { id: 'service', icon: '💬', label: '联系客服', path: '' },
  { id: 'settings', icon: '⚙️', label: '设置', path: '' }
])

const handleMenuClick = (item: typeof menuItems.value[0]) => {
  console.log('[Mine] 点击菜单:', item.label)
  if (item.path) {
    if (item.id === 'compare') {
      Taro.switchTab({ url: item.path })
    } else {
      Taro.navigateTo({ url: item.path })
    }
  } else {
    Taro.showToast({
      title: '功能开发中',
      icon: 'none'
    })
  }
}

onMounted(() => {
  arrivalStore.checkStockUpdates()
})
</script>

<template>
  <scroll-view :class="styles.page" scroll-y>
    <view :class="styles.header">
      <view :class="styles.avatar">
        <text :class="styles.avatarIcon">👤</text>
      </view>
      <view :class="styles.userInfo">
        <text :class="styles.userName">生鲜爱好者</text>
        <text :class="styles.userDesc">已注册30天</text>
      </view>
    </view>

    <view v-if="arrivalInStockCount > 0" :class="styles.compareNotice" @click="handleMenuClick(menuItems[2])">
      <text :class="styles.compareIcon">🔔</text>
      <text :class="styles.compareText">您关注的 {{ arrivalInStockCount }} 件商品已到货</text>
      <text :class="styles.compareArrow">›</text>
    </view>

    <view v-else-if="compareCount > 0" :class="styles.compareNotice" @click="handleMenuClick(menuItems[3])">
      <text :class="styles.compareIcon">⚖️</text>
      <text :class="styles.compareText">您有 {{ compareCount }} 件商品正在对比中</text>
      <text :class="styles.compareArrow">›</text>
    </view>

    <view :class="styles.orderSection">
      <view :class="styles.sectionHeader">
        <text :class="styles.sectionTitle">我的订单</text>
        <text :class="styles.sectionMore">查看全部 ›</text>
      </view>
      <view :class="styles.orderTabs">
        <view :class="styles.orderTab">
          <text :class="styles.orderIcon">💳</text>
          <text :class="styles.orderLabel">待付款</text>
        </view>
        <view :class="styles.orderTab">
          <text :class="styles.orderIcon">📦</text>
          <text :class="styles.orderLabel">待发货</text>
        </view>
        <view :class="styles.orderTab">
          <text :class="styles.orderIcon">🚚</text>
          <text :class="styles.orderLabel">待收货</text>
        </view>
        <view :class="styles.orderTab">
          <text :class="styles.orderIcon">⭐</text>
          <text :class="styles.orderLabel">待评价</text>
        </view>
      </view>
    </view>

    <view :class="styles.menuSection">
      <view
        v-for="item in menuItems"
        :key="item.id"
        :class="styles.menuItem"
        @click="handleMenuClick(item)"
      >
        <view :class="styles.menuLeft">
          <text :class="styles.menuIcon">{{ item.icon }}</text>
          <text :class="styles.menuLabel">{{ item.label }}</text>
        </view>
        <view :class="styles.menuRight">
          <text v-if="item.badge && item.badge > 0" :class="styles.badge">
            {{ item.badge }}
          </text>
          <text :class="styles.menuArrow">›</text>
        </view>
      </view>
    </view>
  </scroll-view>
</template>
