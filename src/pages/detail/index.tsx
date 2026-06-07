import React, { useState, useEffect, useCallback } from 'react'
import { View, Text, Button } from '@tarojs/components'
import { useRouter } from '@tarojs/taro'
import { getProductById } from '@/data/products'
import { useCompareStore } from '@/store/compareStore'
import { useCartStore } from '@/store/cartStore'
import { formatPrice, renderStars } from '@/utils'
import EmptyState from '@/components/EmptyState'
import classnames from 'classnames'
import styles from './index.module.scss'

const DetailPage: React.FC = () => {
  const router = useRouter()
  const productId = router.params.id
  const [product, setProduct] = useState(getProductById(productId || ''))
  const { addToCompare, isInCompare } = useCompareStore()
  const { addToCart } = useCartStore()

  const inCompare = product ? isInCompare(product.id) : false

  useEffect(() => {
    if (productId) {
      setProduct(getProductById(productId))
    }
  }, [productId])

  const handleAddToCompare = useCallback(() => {
    if (product) {
      addToCompare(product)
    }
  }, [product, addToCompare])

  const handleAddToCart = useCallback(() => {
    if (product) {
      addToCart(product, 1)
    }
  }, [product, addToCart])

  if (!product) {
    return (
      <View className={styles.container}>
        <EmptyState
          icon='❓'
          title='商品不存在'
          description='该商品可能已下架，请查看其他商品'
        />
      </View>
    )
  }

  return (
    <View className={styles.container}>
      <View className={styles.content}>
        <Text className={styles.icon}>📦</Text>
        <Text className={styles.title}>{product.name}</Text>
        <Text className={styles.desc}>商品详情页开发中...</Text>

        <View className={styles.productInfo}>
          <View className={styles.infoRow}>
            <Text className={styles.infoLabel}>价格</Text>
            <Text className={styles.infoValue} style={{ color: '#EF4444', fontWeight: 600 }}>
              ¥{formatPrice(product.price)}
            </Text>
          </View>
          <View className={styles.infoRow}>
            <Text className={styles.infoLabel}>规格</Text>
            <Text className={styles.infoValue}>{product.spec}</Text>
          </View>
          <View className={styles.infoRow}>
            <Text className={styles.infoLabel}>包装</Text>
            <Text className={styles.infoValue}>{product.unit}</Text>
          </View>
          <View className={styles.infoRow}>
            <Text className={styles.infoLabel}>产地</Text>
            <Text className={styles.infoValue}>{product.origin}</Text>
          </View>
          <View className={styles.infoRow}>
            <Text className={styles.infoLabel}>评分</Text>
            <Text className={styles.infoValue} style={{ color: '#F59E0B' }}>
              {renderStars(product.rating)} {product.rating}
            </Text>
          </View>
          <View className={styles.infoRow}>
            <Text className={styles.infoLabel}>销量</Text>
            <Text className={styles.infoValue}>已售{product.sales}</Text>
          </View>
        </View>
      </View>

      <View className={styles.actionBar}>
        <Button
          className={classnames(styles.actionBtn, styles.compareBtn)}
          onClick={handleAddToCompare}
        >
          {inCompare ? '✓ 已加入对比' : '加入对比'}
        </Button>
        <Button
          className={classnames(styles.actionBtn, styles.cartBtn)}
          onClick={handleAddToCart}
        >
          加入购物车
        </Button>
      </View>
    </View>
  )
}

export default DetailPage
