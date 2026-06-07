import React, { useMemo, useCallback } from 'react'
import { View, Text, ScrollView, Image, Button } from '@tarojs/components'
import Taro from '@tarojs/taro'
import { useCompareStore } from '@/store/compareStore'
import { useCartStore } from '@/store/cartStore'
import { formatPrice, formatSales, renderStars } from '@/utils'
import EmptyState from '@/components/EmptyState'
import classnames from 'classnames'
import styles from './index.module.scss'

interface CompareDimension {
  key: string
  label: string
  highlightBest?: 'min' | 'max'
  render?: (value: any, isBest: boolean) => React.ReactNode
}

const ComparePage: React.FC = () => {
  const { compareList, removeFromCompare, clearCompare, maxCompareCount } = useCompareStore()
  const { addToCart } = useCartStore()

  const dimensions: CompareDimension[] = useMemo(() => [
    {
      key: 'price',
      label: '价格',
      highlightBest: 'min',
      render: (value: number, isBest: boolean) => (
        <Text className={classnames(styles.priceValue, { [styles.valueCellBest]: isBest })}>
          ¥{formatPrice(value)}
        </Text>
      )
    },
    {
      key: 'spec',
      label: '规格'
    },
    {
      key: 'unit',
      label: '包装'
    },
    {
      key: 'origin',
      label: '产地'
    },
    {
      key: 'weight',
      label: '重量'
    },
    {
      key: 'shelfLife',
      label: '保质期'
    },
    {
      key: 'storage',
      label: '储存方式'
    },
    {
      key: 'rating',
      label: '评分',
      highlightBest: 'max',
      render: (value: number, isBest: boolean) => (
        <View className={isBest ? styles.valueCellBest : ''}>
          <Text className={styles.ratingStars}>{renderStars(value)}</Text>
          <Text style={{ marginLeft: '8rpx' }}>{value}</Text>
        </View>
      )
    },
    {
      key: 'reviewCount',
      label: '评价数',
      highlightBest: 'max'
    },
    {
      key: 'sales',
      label: '销量',
      highlightBest: 'max',
      render: (value: number, isBest: boolean) => (
        <Text className={isBest ? styles.valueCellBest : ''}>
          已售{formatSales(value)}
        </Text>
      )
    },
    {
      key: 'tags',
      label: '特色',
      render: (value: string[]) => (
        <View className={styles.tagsList}>
          {value.map((tag, i) => (
            <Text key={i} className={styles.tagItem}>{tag}</Text>
          ))}
        </View>
      )
    }
  ], [])

  const bestValues = useMemo(() => {
    const best: Record<string, { value: any; index: number }> = {}
    dimensions.forEach(dim => {
      if (!dim.highlightBest) return
      let bestIndex = -1
      let bestVal = dim.highlightBest === 'min' ? Infinity : -Infinity
      compareList.forEach((product, index) => {
        const val = product[dim.key as keyof typeof product]
        if (typeof val === 'number') {
          if (dim.highlightBest === 'min' && val < bestVal) {
            bestVal = val
            bestIndex = index
          }
          if (dim.highlightBest === 'max' && val > bestVal) {
            bestVal = val
            bestIndex = index
          }
        }
      })
      if (bestIndex >= 0) {
        best[dim.key] = { value: bestVal, index: bestIndex }
      }
    })
    return best
  }, [compareList, dimensions])

  const handleRemove = useCallback((productId: string) => {
    removeFromCompare(productId)
  }, [removeFromCompare])

  const handleClear = useCallback(() => {
    Taro.showModal({
      title: '提示',
      content: '确定要清空对比列表吗？',
      success: (res) => {
        if (res.confirm) {
          clearCompare()
          console.log('[Compare] clear all')
        }
      }
    })
  }, [clearCompare])

  const handleAddAllToCart = useCallback(() => {
    if (compareList.length === 0) return
    compareList.forEach(product => {
      addToCart(product, 1)
    })
  }, [compareList, addToCart])

  const handleGoShopping = useCallback(() => {
    Taro.switchTab({
      url: '/pages/home/index'
    })
  }, [])

  const handleImageError = useCallback((e, productId) => {
    console.error('[Compare] Image load error:', productId, e.detail)
  }, [])

  const isBestValue = (dimKey: string, productIndex: number): boolean => {
    const best = bestValues[dimKey]
    return best ? best.index === productIndex : false
  }

  const getBestLabel = (dim: CompareDimension): string => {
    if (dim.key === 'price') return '最优价'
    if (dim.key === 'rating') return '高评分'
    if (dim.key === 'sales') return '热销'
    if (dim.key === 'reviewCount') return '好评多'
    return '最优'
  }

  if (compareList.length === 0) {
    return (
      <View className={styles.container}>
        <View className={styles.emptyContainer}>
          <EmptyState
            icon='📊'
            title='暂无对比商品'
            description='去首页或分类页挑选商品，点击"对比"按钮添加商品'
          />
          <Button className={styles.shopBtn} onClick={handleGoShopping}>
            去逛逛
          </Button>
        </View>
      </View>
    )
  }

  return (
    <View className={styles.container}>
      <View className={styles.header}>
        <Text className={styles.headerTitle}>
          已选 <Text className={styles.headerCount}>{compareList.length}</Text>/{maxCompareCount} 件商品
        </Text>
        <Button className={styles.clearBtn} onClick={handleClear}>清空对比</Button>
      </View>

      <View className={styles.productsHeader}>
        <ScrollView
          className={styles.productsScroll}
          scrollX
          enhanced
          showScrollbar={false}
        >
          <View className={styles.productsList}>
            {compareList.map((product, index) => (
              <View key={product.id} className={styles.productCard}>
                <Button
                  className={styles.productRemove}
                  onClick={() => handleRemove(product.id)}
                >
                  ×
                </Button>
                <Image
                  className={styles.productImage}
                  src={product.image}
                  mode='aspectFill'
                  onError={(e) => handleImageError(e, product.id)}
                />
                <Text className={styles.productName}>{product.name}</Text>
                <View>
                  <Text className={styles.productPriceSymbol}>¥</Text>
                  <Text className={styles.productPrice}>{formatPrice(product.price)}</Text>
                </View>
              </View>
            ))}
          </View>
        </ScrollView>
      </View>

      <View className={styles.compareTable}>
        {dimensions.map(dim => (
          <View key={dim.key} className={styles.tableRow}>
            <View className={styles.rowLabel}>{dim.label}</View>
            <ScrollView
              className={styles.rowValues}
              scrollX
              enhanced
              showScrollbar={false}
            >
              {compareList.map((product, index) => {
                const value = product[dim.key as keyof typeof product]
                const isBest = isBestValue(dim.key, index)
                return (
                  <View key={product.id} className={styles.valueCell}>
                    {isBest && dim.highlightBest && (
                      <Text className={styles.bestTag}>{getBestLabel(dim)}</Text>
                    )}
                    {dim.render
                      ? dim.render(value, isBest)
                      : typeof value === 'string' || typeof value === 'number'
                        ? <Text className={isBest ? styles.valueCellBest : ''}>{value}</Text>
                        : null}
                  </View>
                )
              })}
            </ScrollView>
          </View>
        ))}
      </View>

      <View className={styles.actionBar}>
        <Button className={classnames(styles.actionBtn, styles.detailBtn)} onClick={handleGoShopping}>
          继续选购
        </Button>
        <Button className={classnames(styles.actionBtn, styles.cartBtn)} onClick={handleAddAllToCart}>
          全部加入购物车
        </Button>
      </View>
    </View>
  )
}

export default ComparePage
