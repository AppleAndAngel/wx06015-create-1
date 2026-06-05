<template>
  <div class="default-layout">
    <div class="layout-content">
      <router-view />
    </div>
    <van-tabbar
      v-model="active"
      route
      :safe-area-inset-bottom="true"
      class="layout-tabbar"
    >
      <van-tabbar-item to="/" icon="home-o">首页</van-tabbar-item>
      <van-tabbar-item to="/category" icon="apps-o">分类</van-tabbar-item>
      <van-tabbar-item to="/cart" icon="shopping-cart-o" :badge="badgeCount || ''">购物车</van-tabbar-item>
      <van-tabbar-item to="/user" icon="contact">我的</van-tabbar-item>
    </van-tabbar>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { useCartStore } from '@/stores/cart'

const route = useRoute()
const cartStore = useCartStore()

const active = computed(() => {
  const pathMap: Record<string, number> = {
    '/': 0,
    '/category': 1,
    '/cart': 2,
    '/user': 3,
  }
  return pathMap[route.path] ?? 0
})

const badgeCount = computed(() => cartStore.totalCount)
</script>

<style scoped lang="scss">
.default-layout {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.layout-content {
  flex: 1;
  padding-bottom: 50px;
}

.layout-tabbar {
  :deep(.van-tabbar-item--active) {
    color: $primary;
    background-color: $bg-card;
  }

  :deep(.van-badge) {
    background-color: $danger;
  }
}
</style>
