<script setup lang="ts">
import { View, Text } from '@tarojs/components'
import styles from './EmptyState.module.scss'

defineProps<{
  title?: string
  description?: string
  icon?: string
}>()
</script>

<template>
  <view :class="styles.container">
    <text :class="styles.icon">{{ icon || '📭' }}</text>
    <text :class="styles.title">{{ title || '暂无数据' }}</text>
    <text v-if="description" :class="styles.description">{{ description }}</text>
  </view>
</template>
