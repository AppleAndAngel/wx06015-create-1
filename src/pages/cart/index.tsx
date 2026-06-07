import React, { useCallback } from 'react'
import { View, Text, Image, Button } from '@tarojs/components'
import Taro from '@tarojs/taro'
import { useCartStore } from '@/store/cartStore'
import { formatPrice } from '@/utils'
import EmptyState from '@/components/EmptyState'
import classnames from 'classnames'
import styles from './index.module.scss'

const CartPage: React.FC = () => {
  const {
    cartList,
    toggleSelect,
    toggleSelectAll,
    updateQuantity,
    getTotalPrice,
    getSelectedCount
  } = useCartStore()

  const allSelected = cartList.length > 0 && cartList.every(item => item.selected)
  const totalPrice = getTotalPrice()
  const selectedCount = getSelectedCount()

  const handleSelectAll = useCallback(() => {
    toggleSelectAll(!allSelected)
    console.log('[Cart] toggle select all:', !allSelected)
  }, [allSelected, toggleSelectAll])

  const handleSelectItem = useCallback((productId: string) => {
    toggleSelect(productId)
  }, [toggleSelect])

  const handleQuantityChange = useCallback((productId: string, delta: number) => {
    const item = cartList.find(i => i.product.id === productId)
    if (!item) return
    updateQuantity(productId, item.quantity + delta)
  }, [cartList, updateQuantity])

  const handleCheckout = useCallback(() => {
    if (selectedCount === 0) {
      Taro.showToast({
        title: '请选择要结算的商品',
        icon: 'none'
      })
      return
    }
    Taro.showToast({
      title: '结算功能开发中',
      icon: 'none'
    })
    console.log('[Cart] checkout:', selectedCount, 'items, total:', totalPrice)
  }, [selectedCount, totalPrice])

  const handleGoShop = useCallback(() => {
    Taro.switchTab({
      url: '/pages/home/index'
    })
  }, [])

  const handleImageError = useCallback((e, productId) => {
    console.error('[Cart] Image load error:', productId, e.detail)
  }, [])

  const handleItemClick = useCallback((productId: string) => {
    Taro.navigateTo({
      url: `/pages/detail/index?id=${productId}`
    })
  }, [])

  if (cartList.length === 0) {
    return (
      <View className={styles.container}>
        <View className={styles.emptyContainer}>
          <EmptyState
            icon='🛒'
            title='购物车是空的'
            description='去挑选心仪的商品吧~'
          />
          <Button className={styles.goShopBtn} onClick={handleGoShop}>
            去逛逛
          </Button>
        </View>
      </View>
    )
  }

  return (
    <View className={styles.container}>
      <View className={styles.cartList}>
        {cartList.map(item => (
          <View key={item.product.id} className={styles.cartItem}>
            <View
              className={classnames(styles.checkbox, {
                [styles.checkboxChecked]: item.selected
              })}
              onClick={() => handleSelectItem(item.product.id)}
            >
              {item.selected && '✓'}
            </View>
            <Image
              className={styles.productImage}
              src={item.product.image}
              mode='aspectFill'
              onClick={() => handleItemClick(item.product.id)}
              onError={(e) => handleImageError(e, item.product.id)}
            />
            <View className={styles.productInfo}>
              <Text
                className={styles.productName}
                onClick={() => handleItemClick(item.product.id)}
              >
                {item.product.name}
              </Text>
              <Text className={styles.productSpec}>
                {item.product.spec} | {item.product.unit}
              </Text>
              <View className={styles.productBottom}>
                <View className={styles.priceWrapper}>
                  <Text className={styles.priceSymbol}>¥</Text>
                  <Text className={styles.price}>{formatPrice(item.product.price)}</Text>
                </View>
                <View className={styles.quantityControl}>
                  <Button
                    className={classnames(styles.qtyBtn, {
                      [styles.qtyBtnDisabled]: item.quantity <= 1
                    })}
                    disabled={item.quantity <= 1}
                    onClick={() => handleQuantityChange(item.product.id, -1)}
                  >
                    -
                  </Button>
                  <Text className={styles.qtyValue}>{item.quantity}</Text>
                  <Button
                    className={styles.qtyBtn}
                    onClick={() => handleQuantityChange(item.product.id, 1)}
                  >
                    +
                  </Button>
                </View>
              </View>
            </View>
          </View>
        ))}
      </View>

      <View className={styles.bottomBar}>
        <View className={styles.leftSection}>
          <View className={styles.selectAll} onClick={handleSelectAll}>
            <View
              className={classnames(styles.checkbox, {
                [styles.checkboxChecked]: allSelected
              })}
            >
              {allSelected && '✓'}
            </View>
            <Text className={styles.selectAllText}>全选</Text>
          </View>
        </View>
        <View className={styles.totalSection}>
          <Text className={styles.totalLabel}>合计：</Text>
          <Text className={styles.totalSymbol}>¥</Text>
          <Text className={styles.totalPrice}>{formatPrice(totalPrice)}</Text>
        </View>
        <Button
          className={styles.checkoutBtn}
          disabled={selectedCount === 0}
          onClick={handleCheckout}
        >
          结算({selectedCount})
        </Button>
      </View>
    </View>
  )
}

export default CartPage
