import React, { useCallback } from 'react'
import { View, Text, Button } from '@tarojs/components'
import Taro from '@tarojs/taro'
import { useCompareStore } from '@/store/compareStore'
import styles from './index.module.scss'

const orderTabs = [
  { key: 'pending', icon: '💰', label: '待付款' },
  { key: 'shipping', icon: '🚚', label: '待发货' },
  { key: 'receiving', icon: '📦', label: '待收货' },
  { key: 'review', icon: '⭐', label: '待评价' }
]

const menuItems = [
  { key: 'favorite', icon: '❤️', label: '我的收藏', path: '/pages/favorite/index' },
  { key: 'order', icon: '📋', label: '全部订单', path: '/pages/order/index' },
  { key: 'address', icon: '📍', label: '收货地址', path: '' },
  { key: 'service', icon: '💬', label: '联系客服', path: '' },
  { key: 'settings', icon: '⚙️', label: '设置', path: '' }
]

const MinePage: React.FC = () => {
  const { compareList } = useCompareStore()

  const handleMenuClick = useCallback((item: typeof menuItems[0]) => {
    if (!item.path) {
      Taro.showToast({
        title: '功能开发中',
        icon: 'none'
      })
      return
    }
    if (item.path.startsWith('/pages/order') || item.path.startsWith('/pages/favorite')) {
      Taro.navigateTo({
        url: item.path
      })
    }
    console.log('[Mine] click menu:', item.key)
  }, [])

  const handleOrderClick = useCallback((key: string) => {
    Taro.navigateTo({
      url: `/pages/order/index?status=${key}`
    })
  }, [])

  const handleGoCompare = useCallback(() => {
    Taro.switchTab({
      url: '/pages/compare/index'
    })
  }, [])

  return (
    <View className={styles.container}>
      <View className={styles.header}>
        <View className={styles.avatar}>👤</View>
        <View className={styles.userInfo}>
          <Text className={styles.userName}>鲜果达人</Text>
          <Text className={styles.userDesc}>已为您优选新鲜好物</Text>
        </View>
      </View>

      {compareList.length > 0 && (
        <View className={styles.compareTip}>
          <Text className={styles.tipIcon}>📊</Text>
          <Text className={styles.tipText}>
            您已选{compareList.length}件商品待对比
          </Text>
          <Button className={styles.tipBtn} onClick={handleGoCompare}>去对比</Button>
        </View>
      )}

      <View className={styles.orderSection}>
        <View className={styles.sectionTitle}>
          <Text className={styles.titleText}>我的订单</Text>
          <Button className={styles.moreLink} onClick={() => handleOrderClick('all')}>
            全部订单 →
          </Button>
        </View>
        <View className={styles.orderTabs}>
          {orderTabs.map(tab => (
            <View
              key={tab.key}
              className={styles.orderTab}
              onClick={() => handleOrderClick(tab.key)}
            >
              <View className={styles.orderIcon}>{tab.icon}</View>
              <Text className={styles.orderLabel}>{tab.label}</Text>
            </View>
          ))}
        </View>
      </View>

      <View className={styles.menuSection}>
        {menuItems.slice(0, 2).map(item => (
          <View
            key={item.key}
            className={styles.menuItem}
            onClick={() => handleMenuClick(item)}
          >
            <View className={styles.menuIcon}>{item.icon}</View>
            <Text className={styles.menuLabel}>{item.label}</Text>
            <Text className={styles.menuArrow}>›</Text>
          </View>
        ))}
      </View>

      <View className={styles.toolSection}>
        {menuItems.slice(2).map(item => (
          <View
            key={item.key}
            className={styles.menuItem}
            onClick={() => handleMenuClick(item)}
          >
            <View className={styles.menuIcon}>{item.icon}</View>
            <Text className={styles.menuLabel}>{item.label}</Text>
            <Text className={styles.menuArrow}>›</Text>
          </View>
        ))}
      </View>
    </View>
  )
}

export default MinePage
