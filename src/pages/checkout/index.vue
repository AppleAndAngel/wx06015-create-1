<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { View, Text, Image, Input, Button, ScrollView } from '@tarojs/components'
import Taro, { useRouter, useDidShow } from '@tarojs/taro'
import { useAddressStore } from '@/stores/address'
import { useCartStore } from '@/stores/cart'
import { formatPrice } from '@/utils'
import EmptyState from '@/components/EmptyState'
import type { Address, CartItem } from '@/types'
import styles from './index.module.scss'

const router = useRouter()
const addressStore = useAddressStore()
const cartStore = useCartStore()

const remark = ref('')

const selectedItems = computed(() => 
  cartStore.cartList.filter(item => item.selected)
)

const selectedAddress = computed(() => 
  addressStore.getSelectedAddress()
)

const otherAddresses = computed(() => 
  addressStore.sortedList.filter(addr => addr.id !== selectedAddress.value?.id)
)

const hasAddress = computed(() => addressStore.count > 0)

const totalPrice = computed(() => {
  return selectedItems.value.reduce((sum, item) => sum + item.product.price * item.quantity, 0)
})

const shippingFee = computed(() => {
  return totalPrice.value >= 99 ? 0 : 10
})

const finalPrice = computed(() => totalPrice.value + shippingFee.value)

const canSubmit = computed(() => {
  return selectedItems.value.length > 0 && selectedAddress.value
})

const handleSelectAddress = (address: Address) => {
  addressStore.selectAddress(address.id)
}

const handleManageAddress = () => {
  Taro.navigateTo({
    url: '/pages/address/index?mode=select'
  })
}

const handleAddAddress = () => {
  Taro.navigateTo({
    url: '/pages/address/edit'
  })
}

const handleAddressCardClick = () => {
  if (hasAddress.value) {
    handleManageAddress()
  } else {
    handleAddAddress()
  }
}

const handleSubmit = () => {
  if (!canSubmit.value) {
    if (!selectedAddress.value) {
      Taro.showToast({
        title: '请选择收货地址',
        icon: 'none'
      })
    }
    return
  }

  Taro.showModal({
    title: '提交订单',
    content: `确认支付 ¥${formatPrice(finalPrice.value)} 吗？`,
    success: (res) => {
      if (res.confirm) {
        Taro.showLoading({ title: '提交中...' })
        setTimeout(() => {
          Taro.hideLoading()
          Taro.showToast({
            title: '下单成功！',
            icon: 'success'
          })
          cartStore.clearSelected()
          setTimeout(() => {
            Taro.switchTab({
              url: '/pages/order/index'
            })
          }, 1500)
        }, 1000)
      }
    }
  })
}

useDidShow(() => {
  if (selectedItems.value.length === 0) {
    Taro.showToast({
      title: '请先选择商品',
      icon: 'none'
    })
    setTimeout(() => {
      Taro.navigateBack()
    }, 1500)
  }
})
</script>

<template>
  <view :class="styles.container">
    <scroll-view :class="styles.content" scroll-y>
      <view v-if="!hasAddress" :class="styles.addressCardEmpty" @click="handleAddressCardClick">
        <view :class="styles.addAddressHint">
          <text :class="styles.addAddressIcon">📍</text>
          <text :class="styles.addAddressText">请添加收货地址</text>
        </view>
      </view>

      <view v-else-if="selectedAddress" :class="styles.addressCard" @click="handleAddressCardClick">
        <button :class="styles.changeAddressBtn" @click.stop="handleManageAddress">切换</button>
        <view :class="styles.addressHeader">
          <text :class="styles.addressName">{{ selectedAddress.name }}</text>
          <text :class="styles.addressPhone">{{ selectedAddress.phone }}</text>
        </view>
        <view :class="styles.addressTags">
          <text v-if="selectedAddress.isDefault" :class="[styles.addressTag, styles.defaultTag]">默认</text>
          <text v-if="selectedAddress.tag" :class="styles.addressTag">{{ selectedAddress.tag }}</text>
        </view>
        <text :class="styles.addressDetail">
          {{ selectedAddress.province }}{{ selectedAddress.city }}{{ selectedAddress.district }} {{ selectedAddress.detail }}
        </text>
        <text :class="styles.addressArrow">›</text>
      </view>

      <view v-if="hasAddress && otherAddresses.length > 0" :class="styles.quickSwitch">
        <text :class="styles.quickSwitchTitle">
          <text :class="styles.quickSwitchIcon">📋</text>
          快速切换地址
        </text>
        <view :class="styles.addressOptions">
          <view
            v-for="address in otherAddresses"
            :key="address.id"
            :class="[styles.addressOption, address.id === selectedAddress?.id && styles.active]"
            @click="handleSelectAddress(address)"
          >
            <view :class="styles.optionRadio">
              <view v-if="address.id === selectedAddress?.id" :class="styles.optionRadioInner"></view>
            </view>
            <view :class="styles.optionContent">
              <view :class="styles.optionHeader">
                <text :class="styles.optionName">{{ address.name }}</text>
                <text :class="styles.optionPhone">{{ address.phone }}</text>
                <text v-if="address.isDefault" :class="[styles.optionTag, styles.defaultTag]">默认</text>
                <text v-if="address.tag" :class="styles.optionTag">{{ address.tag }}</text>
              </view>
              <text :class="styles.optionAddress">
                {{ address.province }}{{ address.city }}{{ address.district }} {{ address.detail }}
              </text>
            </view>
          </view>
        </view>
        <view :class="styles.manageAddressBtn" @click="handleManageAddress">
          管理地址 ›
        </view>
      </view>

      <view :class="styles.goodsSection">
        <text :class="styles.sectionTitle">商品清单</text>
        <view :class="styles.goodsList">
          <view v-for="item in selectedItems" :key="item.product.id" :class="styles.goodsItem">
            <image
              :class="styles.goodsImage"
              :src="item.product.image"
              mode="aspectFill"
            />
            <view :class="styles.goodsInfo">
              <view>
                <text :class="styles.goodsName">{{ item.product.name }}</text>
                <text :class="styles.goodsSpec">{{ item.product.spec }} / {{ item.product.packaging }}</text>
              </view>
              <view :class="styles.goodsBottom">
                <text :class="styles.goodsPrice">¥{{ formatPrice(item.product.price) }}</text>
                <text :class="styles.goodsQuantity">x{{ item.quantity }}</text>
              </view>
            </view>
          </view>
        </view>
      </view>

      <view :class="styles.remarkSection">
        <text :class="styles.sectionTitle">订单备注</text>
        <input
          :class="styles.remarkInput"
          v-model="remark"
          placeholder="选填，可填写您的特殊需求"
          placeholder-class="placeholder"
          maxlength="50"
        />
      </view>

      <view :class="styles.summarySection">
        <view :class="styles.summaryRow">
          <text :class="styles.summaryLabel">商品金额</text>
          <text :class="styles.summaryValue">¥{{ formatPrice(totalPrice) }}</text>
        </view>
        <view :class="styles.summaryRow">
          <text :class="styles.summaryLabel">运费</text>
          <text :class="styles.summaryValue">
            {{ shippingFee === 0 ? '免运费' : '¥' + formatPrice(shippingFee) }}
          </text>
        </view>
        <view v-if="shippingFee > 0" :class="styles.summaryRow">
          <text :class="styles.summaryLabel" style="color: #F59E0B;">💡 满99元免运费</text>
          <text :class="styles.summaryValue" style="color: #F59E0B;">
            还差¥{{ formatPrice(99 - totalPrice) }}
          </text>
        </view>
        <view :class="styles.summaryRow">
          <text :class="styles.summaryLabel">实付金额</text>
          <text :class="[styles.summaryValue, styles.highlight]">¥{{ formatPrice(finalPrice) }}</text>
        </view>
      </view>
    </scroll-view>

    <view :class="styles.footer">
      <view :class="styles.footerTotal">
        <text :class="styles.footerLabel">合计：</text>
        <text :class="styles.footerPrice">¥{{ formatPrice(finalPrice) }}</text>
      </view>
      <button :class="styles.submitBtn" :disabled="!canSubmit" @click="handleSubmit">
        提交订单
      </button>
    </view>
  </view>
</template>
