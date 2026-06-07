import React, { useCallback } from 'react'
import { View, Text, Image, Button } from '@tarojs/components'
import Taro from '@tarojs/taro'
import classnames from 'classnames'
import { Product } from '@/types/product'
import { useCompareStore } from '@/store/compareStore'
import { formatPrice, formatSales, renderStars } from '@/utils'
import styles from './index.module.scss'

interface ProductCardProps {
  product: Product
  showCompare?: boolean
}

const ProductCard: React.FC<ProductCardProps> = ({ product, showCompare = true }) => {
  const { addToCompare, removeFromCompare, isInCompare } = useCompareStore()
  const inCompare = isInCompare(product.id)

  const handleCardClick = useCallback(() => {
    Taro.navigateTo({
      url: `/pages/detail/index?id=${product.id}`
    })
  }, [product.id])

  const handleCompareClick = useCallback((e) => {
    e.stopPropagation()
    if (inCompare) {
      removeFromCompare(product.id)
    } else {
      addToCompare(product)
    }
  }, [inCompare, product, addToCompare, removeFromCompare])

  const handleImageError = useCallback((e) => {
    console.error('[ProductCard] Image load error:', product.id, e.detail)
  }, [product.id])

  return (
    <View className={styles.card} onClick={handleCardClick}>
      <View className={styles.imageWrapper}>
        <Image
          className={styles.productImage}
          src={product.image}
          mode='aspectFill'
          onError={handleImageError}
        />
        {showCompare && (
          <Button
            className={classnames(styles.compareBtn, {
              [styles.compareBtnActive]: inCompare,
              [styles.compareBtnInactive]: !inCompare
            })}
            onClick={handleCompareClick}
          >
            {inCompare ? '✓' : '对比'}
          </Button>
        )}
        {product.tags && product.tags.length > 0 && (
          <View className={styles.tags}>
            {product.tags.slice(0, 2).map((tag, index) => (
              <Text key={index} className={styles.tag}>{tag}</Text>
            ))}
          </View>
        )}
      </View>
      <View className={styles.content}>
        <Text className={styles.name}>{product.name}</Text>
        <Text className={styles.spec}>{product.spec} | {product.unit}</Text>
        <View className={styles.footer}>
          <View className={styles.priceWrapper}>
            <Text className={styles.priceSymbol}>¥</Text>
            <Text className={styles.price}>{formatPrice(product.price)}</Text>
            {product.originalPrice > product.price && (
              <Text className={styles.originalPrice}>¥{formatPrice(product.originalPrice)}</Text>
            )}
          </View>
          <View className={styles.meta}>
            <Text className={styles.rating}>
              {renderStars(product.rating)} {product.rating}
            </Text>
            <Text className={styles.sales}>已售{formatSales(product.sales)}</Text>
          </View>
        </View>
      </View>
    </View>
  )
}

export default ProductCard
