<script setup lang="ts">
import { useDidShow, useDidHide } from '@tarojs/taro'

useDidShow(() => {
  console.log('[App] 小程序显示')
})

useDidHide(() => {
  console.log('[App] 小程序隐藏')
})
</script>

<template>
  <view class="app">
    <slot />
  </view>
</template>

<style lang="scss">
.app {
  min-height: 100vh;
}
</style>
