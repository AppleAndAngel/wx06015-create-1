import React, { useCallback } from 'react'
import { View, Text, Image, Button } from '@tarojs/components'
import Taro from '@tarojs/taro'
import { useCompareStore } from '@/store/compareStore'
import styles from './index.module.scss'

const CompareBar: React.FC = () => {
  const { compareList, maxCompareCount, removeFromCompare } = useCompareStore()

  const handleCompareClick = useCallback(() => {
    if (compareList.length < 2) {
      Taro.showToast({
        title: '请至少选择2件商品进行对比',
        icon: 'none'
      })
      return
    }
    Taro.switchTab({
      url: '/pages/compare/index'
    })
  }, [compareList.length])

  const handleRemoveClick = useCallback((e, productId) => {
    e.stopPropagation()
    removeFromCompare(productId)
  }, [removeFromCompare])

  const handleImageError = useCallback((e, productId) => {
    console.error('[CompareBar] Image load error:', productId, e.detail)
  }, [])

  if (compareList.length === 0) {
    return null
  }

  return (
    <View className={styles.bar}>
      <View className={styles.products}>
        {compareList.map(product => (
          <View key={product.id} className={styles.productItem}>
            <Image
              className={styles.productImage}
              src={product.image}
              mode='aspectFill'
              onError={(e) => handleImageError(e, product.id)}
            />
            <Button
              className={styles.removeBtn}
              onClick={(e) => handleRemoveClick(e, product.id)}
            >
              ×
            </Button>
          </View>
        ))}
        {Array.from({ length: maxCompareCount - compareList.length }).map((_, i) => (
          <View key={`placeholder-${i}`} className={styles.placeholder}>+</View>
        ))}
      </View>
      <View className={styles.info}>
        <Text className={styles.count}>已选{compareList.length}件</Text>
        <Text className={styles.maxText}>最多可对比{maxCompareCount}件</Text>
      </View>
      <Button
        className={styles.compareBtn}
        disabled={compareList.length < 2}
        onClick={handleCompareClick}
      >
        去对比
      </Button>
    </View>
  )
}

export default CompareBar
