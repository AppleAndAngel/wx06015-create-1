<script setup lang="ts">
import { Empty } from 'vant'

withDefaults(defineProps<{
  image?: string
  description?: string
}>(), {
  image: 'default',
  description: '暂无数据'
})
</script>

<template>
  <div class="empty-state">
    <van-empty :image="image" :description="description">
      <template #default>
        <slot />
      </template>
    </van-empty>
  </div>
</template>

<style scoped lang="scss">
@use '@/assets/styles/variables' as *;

.empty-state {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 48px 16px;

  :deep(.van-empty) {
    padding: 0;
  }

  :deep(.van-empty__description) {
    color: $text-secondary;
    font-size: 14px;
    margin-top: 16px;
  }
}
</style>
