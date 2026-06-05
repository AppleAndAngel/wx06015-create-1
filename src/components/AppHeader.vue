<script setup lang="ts">
import { NavBar } from 'vant'

withDefaults(defineProps<{
  title: string
  showBack?: boolean
  fixed?: boolean
}>(), {
  showBack: false,
  fixed: true
})

const emit = defineEmits<{
  clickLeft: []
}>()
</script>

<template>
  <div :class="['app-header', { 'app-header--fixed': fixed }]">
    <van-nav-bar
      :title="title"
      :left-arrow="showBack"
      @click-left="emit('clickLeft')"
    >
      <template #right>
        <slot name="right" />
      </template>
    </van-nav-bar>
  </div>
</template>

<style scoped lang="scss">
@use '@/assets/styles/variables' as *;

.app-header {
  width: 100%;
  z-index: 100;

  &--fixed {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
  }

  :deep(.van-nav-bar) {
    background: $primary;

    .van-nav-bar__title {
      color: #fff;
      font-weight: 600;
      font-size: 17px;
    }

    .van-nav-bar__arrow,
    .van-nav-bar__text {
      color: #fff;
    }

    .van-nav-bar__right {
      .van-icon {
        color: #fff;
        font-size: 20px;
      }
    }
  }
}
</style>
