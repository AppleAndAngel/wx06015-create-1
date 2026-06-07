<script setup lang="ts">
import { ref } from 'vue'
import { View, Text, ScrollView } from '@tarojs/components'
import EmptyState from '@/components/EmptyState'
import styles from './index.module.scss'

const tabs = ['全部', '待付款', '待发货', '待收货', '已完成']
const activeTab = ref(0)

const handleTabClick = (index: number) => {
  activeTab.value = index
}
</script>

<template>
  <view :class="styles.container">
    <view :class="styles.tabs">
      <view
        v-for="(tab, index) in tabs"
        :key="index"
        :class="[styles.tabItem, activeTab === index && styles.active]"
        @click="handleTabClick(index)"
      >
        <text :class="styles.tabText">{{ tab }}</text>
      </view>
    </view>

    <scroll-view :class="styles.content" scroll-y>
      <EmptyState
        icon="📦"
        title="暂无订单"
        description="快去挑选心仪的商品吧"
      />
    </scroll-view>
  </view>
</template>
