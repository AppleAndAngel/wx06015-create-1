<script setup lang="ts">
import { computed } from 'vue'
import { View, Text, ScrollView } from '@tarojs/components'
import Taro from '@tarojs/taro'
import { useCompareStore } from '@/stores/compare'
import styles from './CompareBar.module.scss'

const compareStore = useCompareStore()

const compareList = computed(() => compareStore.compareList)
const count = computed(() => compareStore.count)
const isFull = computed(() => compareStore.isFull)

const handleGoCompare = () => {
  if (count.value > 0) {
    console.log('[CompareBar] 跳转到对比页面')
    Taro.switchTab({
      url: '/pages/compare/index'
    })
  } else {
    Taro.showToast({
      title: '请先选择对比商品',
      icon: 'none'
    })
  }
}

const handleRemove = (e: Event, productId: string) => {
  e.stopPropagation()
  compareStore.removeFromCompare(productId)
}

const handleClear = (e: Event) => {
  e.stopPropagation()
  compareStore.clearCompare()
}
</script>

<template>
  <view v-if="count > 0" :class="styles.bar" @click="handleGoCompare">
    <view :class="styles.left">
      <text :class="styles.title">已选 {{ count }}/4</text>
      <scroll-view :class="styles.scrollView" scroll-x>
        <view
          v-for="product in compareList"
          :key="product.id"
          :class="styles.productItem"
        >
          <image
            :class="styles.productImage"
            :src="product.image"
            mode="aspectFill"
          />
          <view
            :class="styles.removeBtn"
            @click.stop="handleRemove($event, product.id)"
          >
            <text :class="styles.removeIcon">×</text>
          </view>
        </view>
        <view v-if="!isFull" :class="[styles.productItem, styles.addItem]">
          <text :class="styles.addIcon">+</text>
        </view>
      </scroll-view>
    </view>
    
    <view :class="styles.right">
      <view :class="styles.goBtn">
        <text :class="styles.goText">去对比</text>
      </view>
      <view :class="styles.clearBtn" @click.stop="handleClear">
        <text :class="styles.clearText">清空</text>
      </view>
    </view>
  </view>
</template>
