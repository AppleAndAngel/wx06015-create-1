<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { View, Text, ScrollView, Button } from '@tarojs/components'
import Taro, { useRouter } from '@tarojs/taro'
import { useAddressStore } from '@/stores/address'
import EmptyState from '@/components/EmptyState'
import type { Address } from '@/types'
import styles from './index.module.scss'

const router = useRouter()
const addressStore = useAddressStore()

const selectMode = ref(false)
const selectedId = ref<string | null>(null)

onMounted(() => {
  const mode = router.params.mode
  if (mode === 'select') {
    selectMode.value = true
    const currentSelected = addressStore.getSelectedAddress()
    if (currentSelected) {
      selectedId.value = currentSelected.id
    }
  }
})

const addressList = computed(() => addressStore.sortedList)
const count = computed(() => addressStore.count)

const handleAdd = () => {
  Taro.navigateTo({
    url: '/pages/address/edit'
  })
}

const handleEdit = (address: Address) => {
  Taro.navigateTo({
    url: `/pages/address/edit?id=${address.id}`
  })
}

const handleDelete = (address: Address) => {
  Taro.showModal({
    title: '确认删除',
    content: `确定要删除「${address.name}」的地址吗？`,
    confirmColor: '#EF4444',
    success: (res) => {
      if (res.confirm) {
        addressStore.deleteAddress(address.id)
      }
    }
  })
}

const handleSetDefault = (address: Address) => {
  if (!address.isDefault) {
    addressStore.setDefault(address.id)
  }
}

const handleSelect = (address: Address) => {
  if (selectMode.value) {
    selectedId.value = address.id
    addressStore.selectAddress(address.id)
    setTimeout(() => {
      Taro.navigateBack()
    }, 300)
  }
}

const handleItemClick = (address: Address) => {
  if (selectMode.value) {
    handleSelect(address)
  } else {
    handleEdit(address)
  }
}
</script>

<template>
  <view :class="styles.container">
    <scroll-view :class="styles.content" scroll-y>
      <view :class="styles.header">
        <text :class="styles.title">送礼地址簿</text>
        <text :class="styles.subtitle">保存收礼人地址，结算时快速切换</text>
      </view>

      <view v-if="selectMode" :class="styles.selectModeTip">
        请选择收货地址
      </view>

      <view v-if="count === 0">
        <EmptyState
          icon="📍"
          title="暂无地址"
          description="添加收礼人地址，送礼更方便"
        />
      </view>

      <view v-else :class="styles.list">
        <view
          v-for="address in addressList"
          :key="address.id"
          :class="[styles.item, selectedId === address.id && styles.selected]"
          @click="handleItemClick(address)"
        >
          <view :class="styles.itemHeader">
            <text :class="styles.name">{{ address.name }}</text>
            <text :class="styles.phone">{{ address.phone }}</text>
          </view>

          <view :class="styles.tags">
            <text v-if="address.isDefault" :class="[styles.tag, styles.defaultTag]">默认</text>
            <text v-if="address.tag" :class="styles.tag">{{ address.tag }}</text>
          </view>

          <text :class="styles.address">
            {{ address.province }}{{ address.city }}{{ address.district }} {{ address.detail }}
          </text>

          <view :class="styles.itemFooter">
            <view :class="styles.footerLeft" @click.stop="handleSetDefault(address)">
              <view :class="[styles.checkbox, address.isDefault && styles.checked]">
                <text v-if="address.isDefault" :class="styles.checkIcon">✓</text>
              </view>
              <text v-if="address.isDefault" :class="styles.defaultLabel">默认地址</text>
              <button v-else :class="styles.setDefaultBtn">设为默认</button>
            </view>

            <view :class="styles.footerRight">
              <button :class="styles.actionBtn" @click.stop="handleEdit(address)">
                <text :class="styles.actionIcon">✏️</text>
                <text>编辑</text>
              </button>
              <button :class="[styles.actionBtn, styles.delete]" @click.stop="handleDelete(address)">
                <text :class="styles.actionIcon">🗑️</text>
                <text>删除</text>
              </button>
            </view>
          </view>
        </view>
      </view>
    </scroll-view>

    <view :class="styles.addBtn">
      <button :class="styles.addButton" @click="handleAdd">
        <text :class="styles.addIcon">+</text>
        <text>新增地址</text>
      </button>
    </view>
  </view>
</template>
