<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { SwipeCell, Button, showConfirmDialog, showToast, Tag } from 'vant'
import AppHeader from '@/components/AppHeader.vue'
import EmptyState from '@/components/EmptyState.vue'
import { useAddressStore } from '@/stores/address'
import type { Address } from '@/types'

const route = useRoute()
const router = useRouter()
const addressStore = useAddressStore()

const isSelectMode = ref(false)

const onSelect = (address: Address) => {
  if (!isSelectMode.value) return
  localStorage.setItem('selectedAddress', JSON.stringify(address))
  router.back()
}

const onEdit = (id: number) => {
  router.push(`/user/address/edit/${id}`)
}

const onAdd = () => {
  router.push('/user/address/edit')
}

const onDelete = (address: Address) => {
  showConfirmDialog({
    title: '提示',
    message: `确定删除 ${address.name} 的地址吗？`,
  }).then(async () => {
    await addressStore.deleteAddress(address.id)
    showToast('已删除')
  }).catch(() => {})
}

onMounted(() => {
  isSelectMode.value = route.query.select === '1'
  addressStore.fetchAddresses()
})
</script>

<template>
  <div class="address-list-page">
    <AppHeader title="收货地址" show-back @click-left="router.back()">
      <template #right>
        <span class="address-list-page__add" @click="onAdd">新增</span>
      </template>
    </AppHeader>

    <div class="address-list-page__content">
      <EmptyState v-if="addressStore.addresses.length === 0" description="暂无收货地址" />

      <van-swipe-cell
        v-for="addr in addressStore.addresses"
        :key="addr.id"
      >
        <div
          class="address-card"
          @click="onSelect(addr)"
        >
          <div class="address-card__top">
            <div class="address-card__user">
              <span class="address-card__name">{{ addr.name }}</span>
              <span class="address-card__phone">{{ addr.phone }}</span>
            </div>
            <van-tag v-if="addr.isDefault" type="primary" size="medium" round>默认</van-tag>
          </div>
          <p class="address-card__detail">
            {{ addr.province }}{{ addr.city }}{{ addr.district }}{{ addr.detail }}
          </p>
          <div class="address-card__actions">
            <van-icon name="edit" size="18" color="#666" @click.stop="onEdit(addr.id)" />
          </div>
        </div>

        <template #right>
          <van-button
            square
            type="danger"
            text="删除"
            class="address-list-page__delete-btn"
            @click="onDelete(addr)"
          />
        </template>
      </van-swipe-cell>
    </div>
  </div>
</template>

<style scoped lang="scss">
@use '@/assets/styles/variables' as *;

.address-list-page {
  min-height: 100vh;
  background: $bg;

  &__content {
    padding-top: 46px;
    padding: 56px 16px 16px;
  }

  &__add {
    color: #fff;
    font-size: 14px;
    font-weight: 500;
  }

  &__delete-btn {
    height: 100%;
  }
}

.address-card {
  background: $bg-card;
  border-radius: $radius-lg;
  box-shadow: $shadow;
  padding: 14px 16px;
  margin-bottom: 12px;

  &__top {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 8px;
  }

  &__user {
    display: flex;
    align-items: center;
    gap: 10px;
  }

  &__name {
    font-size: 16px;
    font-weight: 600;
    color: $text-primary;
  }

  &__phone {
    font-size: 14px;
    color: $text-secondary;
  }

  &__detail {
    font-size: 13px;
    color: $text-secondary;
    line-height: 1.6;
    padding-right: 30px;
  }

  &__actions {
    position: absolute;
    right: 16px;
    bottom: 14px;
  }
}
</style>
