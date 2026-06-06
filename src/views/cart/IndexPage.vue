<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { storeToRefs } from 'pinia'
import { useRouter } from 'vue-router'
import { SwipeCell, Checkbox, Stepper, Button, showToast } from 'vant'
import AppHeader from '@/components/AppHeader.vue'
import EmptyState from '@/components/EmptyState.vue'
import { useCartStore } from '@/stores/cart'
import { useUserStore } from '@/stores/user'
import { formatPrice } from '@/utils/format'

const router = useRouter()
const cartStore = useCartStore()
const userStore = useUserStore()
const { items, totalCount, totalAmount, selectedCount } = storeToRefs(cartStore)

const isAllSelected = computed(() => items.value.length > 0 && items.value.every((item) => item.selected))

function onToggleSelect(id: number) {
  cartStore.toggleSelect(id)
}

function onToggleSelectAll() {
  cartStore.toggleSelectAll()
}

function onDelete(id: number) {
  cartStore.removeItem(id)
}

function onQuantityChange(id: number, quantity: number) {
  cartStore.updateQuantity(id, quantity)
}

function onCheckout() {
  if (selectedCount.value === 0) return
  if (!userStore.isLoggedIn) {
    router.push({ path: '/login', query: { redirect: '/checkout' } })
    return
  }
  router.push('/checkout')
}

function goShopping() {
  router.push('/')
}

function specText(specValues: Record<string, string>) {
  return Object.values(specValues).join(' / ')
}

onMounted(async () => {
  if (userStore.isLoggedIn) {
    try {
      await cartStore.fetchCart()
    } catch (e) {
      console.error('获取购物车数据失败', e)
    }
  }
})
</script>

<template>
  <div class="cart-page">
    <AppHeader :title="`购物车(${totalCount})`" :show-back="true" @click-left="router.back()" />

    <div class="cart-body" v-if="items.length">
      <van-swipe-cell v-for="item in items" :key="item.id">
        <div class="cart-item">
          <van-checkbox
            :model-value="item.selected"
            @update:model-value="onToggleSelect(item.id)"
            class="cart-item__checkbox"
          />
          <img v-lazy="item.product.images[0]" class="cart-item__image" />
          <div class="cart-item__info">
            <div class="cart-item__name">{{ item.product.name }}</div>
            <div class="cart-item__spec" v-if="Object.keys(item.specValues).length">
              {{ specText(item.specValues) }}
            </div>
            <div class="cart-item__bottom">
              <span class="cart-item__price">¥{{ formatPrice(item.product.price) }}</span>
              <van-stepper
                :model-value="item.quantity"
                @update:model-value="(val: number) => onQuantityChange(item.id, val)"
                min="1"
                max="99"
                class="cart-item__stepper"
              />
            </div>
          </div>
        </div>
        <template #right>
          <van-button type="danger" class="delete-btn" @click="onDelete(item.id)">删除</van-button>
        </template>
      </van-swipe-cell>
    </div>

    <EmptyState v-else image="https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=empty%20shopping%20cart%20illustration%20minimal%20flat%20design%20soft%20green%20tones&image_size=square" description="购物车空空如也">
      <van-button type="primary" size="small" @click="goShopping">去逛逛</van-button>
    </EmptyState>

    <div class="cart-bottom" v-if="items.length">
      <van-checkbox
        :model-value="isAllSelected"
        @update:model-value="onToggleSelectAll"
        class="cart-bottom__select-all"
      >
        全选
      </van-checkbox>
      <div class="cart-bottom__amount">
        合计: <span class="cart-bottom__price">¥{{ formatPrice(totalAmount) }}</span>
      </div>
      <van-button
        type="primary"
        class="cart-bottom__settle"
        :disabled="selectedCount === 0"
        @click="onCheckout"
      >
        去结算({{ selectedCount }})
      </van-button>
    </div>
  </div>
</template>

<style scoped lang="scss">
@use '@/assets/styles/variables' as *;

.cart-page {
  min-height: 100vh;
  background: $bg;
  padding-top: 46px;
  padding-bottom: 60px;
}

.cart-body {
  padding: 12px;
}

.cart-item {
  display: flex;
  align-items: center;
  padding: 12px;
  background: $bg-card;
  border-radius: $radius-md;
  margin-bottom: 8px;
  gap: 10px;

  &__checkbox {
    flex-shrink: 0;
  }

  &__image {
    width: 80px;
    height: 80px;
    border-radius: $radius-sm;
    object-fit: cover;
    flex-shrink: 0;
  }

  &__info {
    flex: 1;
    min-width: 0;
    display: flex;
    flex-direction: column;
    gap: 4px;
  }

  &__name {
    font-size: 14px;
    color: $text-primary;
    font-weight: 500;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  &__spec {
    font-size: 12px;
    color: $text-secondary;
  }

  &__bottom {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-top: 4px;
  }

  &__price {
    font-size: 15px;
    color: $danger;
    font-weight: 600;
  }

  &__stepper {
    :deep(.van-stepper__input) {
      width: 32px;
    }
  }
}

.delete-btn {
  height: 100% !important;
}

.cart-bottom {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  height: 50px;
  background: $bg-card;
  display: flex;
  align-items: center;
  padding: 0 12px;
  box-shadow: 0 -1px 8px rgba(0, 0, 0, 0.06);
  z-index: 100;

  &__select-all {
    flex-shrink: 0;
  }

  &__amount {
    flex: 1;
    text-align: right;
    padding-right: 12px;
    font-size: 14px;
    color: $text-primary;
  }

  &__price {
    color: $danger;
    font-weight: 600;
    font-size: 16px;
    display: inline-block;
    transition: transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
  }

  &__settle {
    flex-shrink: 0;
    border-radius: 20px;
    padding: 0 20px;
    height: 36px;
    font-size: 14px;
    font-weight: 600;
    transition: transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);

    &:not(:disabled):active {
      transform: scale(0.95);
    }
  }
}
</style>
