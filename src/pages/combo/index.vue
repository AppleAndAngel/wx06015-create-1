<script setup lang="ts">
import { ref, computed } from 'vue'
import { View, Text, ScrollView, Image, Button } from '@tarojs/components'
import Taro from '@tarojs/taro'
import type { Combo, ComboScene } from '@/types'
import { comboScenes, getCombosByScene, getComboProducts } from '@/mock/products'
import { useCartStore } from '@/stores/cart'
import { formatPrice, formatSales, renderStars } from '@/utils'
import styles from './index.module.scss'

const selectedScene = ref('all')
const cartStore = useCartStore()

const sceneList = computed<ComboScene[]>(() => comboScenes)

const comboList = computed(() => {
  return getCombosByScene(selectedScene.value)
})

const handleSceneClick = (sceneId: string) => {
  selectedScene.value = sceneId
  console.log('[Combo] 选择场景:', sceneId)
}

const handleAddComboToCart = (combo: Combo) => {
  if (!combo.inStock) {
    Taro.showToast({
      title: '套餐暂时缺货',
      icon: 'none'
    })
    return
  }

  const products = getComboProducts(combo)
  products.forEach(cp => {
    if (cp.product && cp.product.inStock) {
      cartStore.addToCart(cp.product, cp.quantity)
    }
  })

  console.log('[Combo] 已添加套餐到购物车:', combo.name)
}

const handleProductClick = (productId: string) => {
  Taro.navigateTo({
    url: `/pages/detail/index?id=${productId}`
  })
}
</script>

<template>
  <view :class="styles.page">
    <view :class="styles.header">
      <view>
        <text :class="styles.headerTitle">🍽️ 搭配套餐</text>
        <view :class="styles.headerDesc">精选场景化食材组合，一键选购更省心</view>
      </view>
    </view>

    <scroll-view :class="styles.sceneTabs" scroll-x>
      <view
        v-for="scene in sceneList"
        :key="scene.id"
        :class="[styles.sceneTab, selectedScene === scene.id && styles.active]"
        @click="handleSceneClick(scene.id)"
      >
        <text :class="styles.sceneIcon">{{ scene.icon }}</text>
        <text :class="styles.sceneName">{{ scene.name }}</text>
      </view>
    </scroll-view>

    <scroll-view :class="styles.scrollView" scroll-y>
      <view v-if="comboList.length > 0" :class="styles.comboList">
        <view
          v-for="combo in comboList"
          :key="combo.id"
          :class="styles.comboCard"
        >
          <view :class="styles.comboHeader">
            <image
              :class="styles.comboImage"
              :src="combo.image"
              mode="aspectFill"
            />
            <view :class="styles.comboBadge">
              <text :class="styles.badgeIcon">{{ combo.icon }}</text>
              <text :class="styles.badgeText">
                {{ comboScenes.find(s => s.id === combo.scene)?.name }}
              </text>
            </view>
            <view v-if="!combo.inStock" :class="styles.outOfStockBadge">
              <text :class="styles.outOfStockText">暂时缺货</text>
            </view>
          </view>

          <view :class="styles.comboContent">
            <view :class="styles.comboTitle">
              <text :class="styles.comboName">{{ combo.name }}</text>
            </view>

            <text :class="styles.comboDesc">{{ combo.description }}</text>

            <view :class="styles.comboTags">
              <text
                v-for="tag in combo.tags"
                :key="tag"
                :class="styles.comboTag"
              >
                {{ tag }}
              </text>
            </view>

            <view :class="styles.comboMeta">
              <view :class="styles.metaItem">
                <text :class="styles.metaIcon">⭐</text>
                <text :class="styles.metaText">{{ renderStars(combo.rating) }} {{ combo.rating }}</text>
              </view>
              <view :class="styles.metaItem">
                <text :class="styles.metaIcon">📦</text>
                <text :class="styles.metaText">已售{{ formatSales(combo.sales) }}</text>
              </view>
            </view>

            <view :class="styles.comboProducts">
              <text :class="styles.productsTitle">套餐包含 ({{ combo.products.length }}件商品)</text>
              <view :class="styles.productList">
                <view
                  v-for="cp in getComboProducts(combo)"
                  :key="cp.productId"
                  :class="styles.productItem"
                  @click.stop="handleProductClick(cp.productId)"
                >
                  <image
                    :class="styles.productImage"
                    :src="cp.product?.image"
                    mode="aspectFill"
                  />
                  <text :class="styles.productName">{{ cp.product?.name }}</text>
                  <text :class="styles.productQty">x{{ cp.quantity }}</text>
                </view>
              </view>
            </view>

            <view :class="styles.comboFooter">
              <view :class="styles.priceSection">
                <text :class="styles.priceLabel">套餐价</text>
                <text :class="styles.comboPriceSymbol">¥</text>
                <text :class="styles.comboPrice">{{ formatPrice(combo.comboPrice) }}</text>
                <text :class="styles.originalPrice">¥{{ formatPrice(combo.originalPrice) }}</text>
                <view :class="styles.savedBadge">
                  <text :class="styles.savedText">省¥{{ formatPrice(combo.savedAmount) }}</text>
                </view>
              </view>
              <view :class="styles.addAction">
                <button
                  :class="[styles.addBtn, !combo.inStock && styles.disabled]"
                  :disabled="!combo.inStock"
                  @click.stop="handleAddComboToCart(combo)"
                >
                  {{ combo.inStock ? '加入购物车' : '已售罄' }}
                </button>
              </view>
            </view>
          </view>
        </view>

        <view :class="styles.footer">
          <text :class="styles.footerText">— 已经到底啦 —</text>
        </view>
      </view>

      <view v-else :class="styles.emptyState">
        <text :class="styles.emptyIcon">🍽️</text>
        <text :class="styles.emptyText">该场景暂无套餐</text>
      </view>
    </scroll-view>
  </view>
</template>
