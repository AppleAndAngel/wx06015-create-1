<script setup lang="ts">
import { useRouter } from 'vue-router'
import { CellGroup, Cell, Tag, showConfirmDialog, showToast } from 'vant'
import { useUserStore } from '@/stores/user'
import { useCartStore } from '@/stores/cart'
import { useOrderStore } from '@/stores/order'

const router = useRouter()
const userStore = useUserStore()
const cartStore = useCartStore()
const orderStore = useOrderStore()

const userInfo = userStore.userInfo

const orderShortcuts = [
  { label: '待付款', status: 'pending', icon: 'pending-payment' },
  { label: '待发货', status: 'paid', icon: 'logistics' },
  { label: '待收货', status: 'shipped', icon: 'todo-list-o' },
  { label: '已完成', status: 'delivered', icon: 'checked' },
]

const orderCounts: Record<string, number> = {
  pending: 1,
  paid: 0,
  shipped: 2,
  delivered: 0,
}

const onOrderShortcut = (status: string) => {
  router.push(`/user/orders?status=${status}`)
}

const onLogout = () => {
  showConfirmDialog({
    title: '提示',
    message: '确定要退出登录吗？',
  }).then(() => {
    userStore.logout()
    cartStore.clearCart()
    showToast('已退出登录')
    router.replace('/login')
  }).catch(() => {})
}
</script>

<template>
  <div class="center-page">
    <div class="center-page__header">
      <div class="center-page__user">
        <img
          v-if="userInfo?.avatar"
          :src="userInfo.avatar"
          class="center-page__avatar"
          alt=""
        />
        <div v-else class="center-page__avatar center-page__avatar--default">
          <van-icon name="manager" size="28" color="#fff" />
        </div>
        <div class="center-page__info">
          <h2 class="center-page__name">{{ userInfo?.nickname || '用户' }}</h2>
          <van-tag type="primary" size="medium" round>黄金会员</van-tag>
        </div>
      </div>
    </div>

    <div class="center-page__stats">
      <div class="center-page__stat">
        <span class="center-page__stat-value">3</span>
        <span class="center-page__stat-label">优惠券</span>
      </div>
      <div class="center-page__stat">
        <span class="center-page__stat-value">580</span>
        <span class="center-page__stat-label">积分</span>
      </div>
      <div class="center-page__stat">
        <span class="center-page__stat-value">¥88.00</span>
        <span class="center-page__stat-label">余额</span>
      </div>
    </div>

    <div class="center-page__orders">
      <div class="center-page__section-head">
        <span class="center-page__section-title">我的订单</span>
        <span class="center-page__section-more" @click="router.push('/user/orders?status=all')">全部订单</span>
      </div>
      <div class="center-page__order-shortcuts">
        <div
          v-for="item in orderShortcuts"
          :key="item.status"
          class="center-page__order-shortcut"
          @click="onOrderShortcut(item.status)"
        >
          <van-icon :name="item.icon" size="26" color="#666" />
          <span class="center-page__order-label">{{ item.label }}</span>
          <van-tag
            v-if="orderCounts[item.status] > 0"
            type="danger"
            round
            class="center-page__order-badge"
          >
            {{ orderCounts[item.status] }}
          </van-tag>
        </div>
      </div>
    </div>

    <van-cell-group inset class="center-page__menu">
      <van-cell
        title="收货地址"
        is-link
        icon="location-o"
        @click="router.push('/user/address')"
      />
      <van-cell title="联系客服" is-link icon="service-o" />
      <van-cell title="关于我们" is-link icon="info-o" />
    </van-cell-group>

    <van-cell-group inset class="center-page__menu">
      <van-cell
        title="退出登录"
        is-link
        icon="revoke"
        class="center-page__logout"
        @click="onLogout"
      />
    </van-cell-group>
  </div>
</template>

<style scoped lang="scss">
@use '@/assets/styles/variables' as *;

.center-page {
  min-height: 100vh;
  background: $bg;

  &__header {
    background: linear-gradient(135deg, $primary 0%, $primary-dark 100%);
    padding: 48px 24px 40px;
  }

  &__user {
    display: flex;
    align-items: center;
    gap: 16px;
  }

  &__avatar {
    width: 64px;
    height: 64px;
    border-radius: 50%;
    border: 3px solid rgba(255, 255, 255, 0.4);
    object-fit: cover;

    &--default {
      display: flex;
      align-items: center;
      justify-content: center;
      background: rgba(255, 255, 255, 0.2);
    }
  }

  &__info {
    display: flex;
    flex-direction: column;
    gap: 6px;
  }

  &__name {
    font-size: 20px;
    font-weight: 600;
    color: #fff;
  }

  &__stats {
    display: flex;
    margin: -20px 16px 0;
    background: $bg-card;
    border-radius: $radius-lg;
    box-shadow: $shadow;
    padding: 20px 0;
    position: relative;
    z-index: 1;
  }

  &__stat {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 6px;

    &-value {
      font-size: 18px;
      font-weight: 700;
      color: $text-primary;
    }

    &-label {
      font-size: 12px;
      color: $text-secondary;
    }
  }

  &__orders {
    margin: 16px 16px 0;
    background: $bg-card;
    border-radius: $radius-lg;
    box-shadow: $shadow;
    padding: 16px;
  }

  &__section-head {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 16px;
  }

  &__section-title {
    font-size: 16px;
    font-weight: 600;
    color: $text-primary;
  }

  &__section-more {
    font-size: 13px;
    color: $text-secondary;
  }

  &__order-shortcuts {
    display: flex;
    justify-content: space-around;
  }

  &__order-shortcut {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 8px;
    position: relative;
    padding: 4px 0;
  }

  &__order-label {
    font-size: 12px;
    color: $text-secondary;
  }

  &__order-badge {
    position: absolute;
    top: -4px;
    right: -8px;
  }

  &__menu {
    margin-top: 16px;
  }

  &__logout {
    :deep(.van-cell__title) {
      color: $danger;
    }

    :deep(.van-cell__left-icon) {
      color: $danger;
    }
  }
}
</style>
