import React, { useState, useMemo, useCallback } from 'react'
import { View, Text, ScrollView } from '@tarojs/components'
import { Product } from '@/types/product'
import { categories, getProductsByCategory } from '@/data/products'
import ProductCard from '@/components/ProductCard'
import CompareBar from '@/components/CompareBar'
import EmptyState from '@/components/EmptyState'
import classnames from 'classnames'
import styles from './index.module.scss'

type SortType = 'default' | 'sales' | 'price-asc' | 'price-desc' | 'rating'

const filters = [
  { key: 'default', label: '综合' },
  { key: 'sales', label: '销量' },
  { key: 'price-asc', label: '价格↑' },
  { key: 'price-desc', label: '价格↓' },
  { key: 'rating', label: '评分' }
]

const CategoryPage: React.FC = () => {
  const [activeCategory, setActiveCategory] = useState<string>('1')
  const [sortType, setSortType] = useState<SortType>('default')

  const handleCategoryClick = useCallback((categoryId: string) => {
    setActiveCategory(categoryId)
    console.log('[Category] switch category:', categoryId)
  }, [])

  const handleSortClick = useCallback((key: SortType) => {
    setSortType(key)
    console.log('[Category] sort by:', key)
  }, [])

  const sortedProducts = useMemo(() => {
    let list: Product[] = getProductsByCategory(activeCategory)
    switch (sortType) {
      case 'sales':
        return [...list].sort((a, b) => b.sales - a.sales)
      case 'price-asc':
        return [...list].sort((a, b) => a.price - b.price)
      case 'price-desc':
        return [...list].sort((a, b) => b.price - a.price)
      case 'rating':
        return [...list].sort((a, b) => b.rating - a.rating)
      default:
        return list
    }
  }, [activeCategory, sortType])

  return (
    <View className={styles.container}>
      <ScrollView className={styles.sidebar} scrollY>
        {categories.map(category => (
          <View
            key={category.id}
            className={classnames(styles.categoryItem, {
              [styles.categoryItemActive]: activeCategory === category.id
            })}
            onClick={() => handleCategoryClick(category.id)}
          >
            <Text className={styles.categoryIcon}>{category.icon}</Text>
            <Text>{category.name}</Text>
          </View>
        ))}
      </ScrollView>

      <View className={styles.main}>
        <View className={styles.filterBar}>
          {filters.map(filter => (
            <Text
              key={filter.key}
              className={classnames(styles.filterItem, {
                [styles.filterItemActive]: sortType === filter.key
              })}
              onClick={() => handleSortClick(filter.key as SortType)}
            >
              {filter.label}
            </Text>
          ))}
        </View>

        <ScrollView className={styles.productScroll} scrollY>
          {sortedProducts.length > 0 ? (
            <View className={styles.productGrid}>
              {sortedProducts.map(product => (
                <View key={product.id} className={styles.productItem}>
                  <ProductCard product={product} />
                </View>
              ))}
            </View>
          ) : (
            <EmptyState
              icon='🍽️'
              title='该分类暂无商品'
              description='去看看其他分类吧~'
            />
          )}
        </ScrollView>
      </View>

      <CompareBar />
    </View>
  )
}

export default CategoryPage
