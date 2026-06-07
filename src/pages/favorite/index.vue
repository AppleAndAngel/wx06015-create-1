<script setup lang="ts">
import { ref } from 'vue'
import { View, Text, ScrollView } from '@tarojs/components'
import EmptyState from '@/components/EmptyState'
import styles from './index.module.scss'

const favorites = ref([])
</script>

<template>
  <view :class="styles.container">
    <scroll-view :class="styles.content" scroll-y>
      <EmptyState
        icon="❤️"
        title="暂无收藏商品"
        description="遇到喜欢的商品就收藏起来吧"
      />
    </scroll-view>
  </view>
</template>
