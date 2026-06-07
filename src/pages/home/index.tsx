import React, { useState, useEffect, useCallback, useMemo } from 'react'
import { View, Text, ScrollView, Swiper, SwiperItem, Image, Button } from '@tarojs/components'
import Taro, { useDidShow, usePullDownRefresh, useReachBottom } from '@tarojs/taro'
import { Product } from '@/types/product'
import { products, categories } from '@/data/products'
import ProductCard from '@/components/ProductCard'
import CompareBar from '@/components/CompareBar'
import styles from './index.module.scss'

const banners = [
  { id: 1, image: 'https://picsum.photos/id/292/750/400', title: '新鲜水果' },
  { id: 2, image: 'https://picsum.photos/id/312/750/400', title: '精品肉类' },
  { id: 3, image: 'https://picsum.photos/id/431/750/400', title: '限时特惠' }
]

const HomePage: React.FC = () => {
  const [productList, setProductList] = useState<Product[]>([])
  const [loading, setLoading] = useState(false)
  const [page, setPage] = useState(1)
  const pageSize = 8

  const loadProducts = useCallback((pageNum: number, refresh: boolean = false) => {
    setLoading(true)
    setTimeout(() => {
      const start = (pageNum - 1) * pageSize
      const end = start + pageSize
      const newProducts = products.slice(start, end)
      if (refresh) {
        setProductList(newProducts)
      } else {
        setProductList(prev => [...prev, ...newProducts])
      }
      setLoading(false)
      console.log('[Home] loadProducts:', pageNum, 'count:', newProducts.length)
    }, 500)
  }, [])

  useEffect(() => {
    loadProducts(1, true)
  }, [loadProducts])

  useDidShow(() => {
    console.log('[Home] didShow')
  })

  usePullDownRefresh(() => {
    setPage(1)
    loadProducts(1, true)
    Taro.stopPullDownRefresh()
  })

  useReachBottom(() => {
    if (loading) return
    if (productList.length >= products.length) return
    const nextPage = page + 1
    setPage(nextPage)
    loadProducts(nextPage)
  })

  const handleSearchClick = useCallback(() => {
    Taro.navigateTo({
      url: '/pages/search/index'
    })
  }, [])

  const handleCategoryClick = useCallback((categoryId: string) => {
    Taro.switchTab({
      url: '/pages/category/index'
    })
  }, [])

  const handleImageError = useCallback((e, id) => {
    console.error('[Home] Banner image load error:', id, e.detail)
  }, [])

  const gridProducts = useMemo(() => productList, [productList])

  return (
    <View className={styles.container}>
      <View className={styles.searchBar} onClick={handleSearchClick}>
        <View className={styles.searchInput}>
          <Text className={styles.searchIcon}>🔍</Text>
          <Text className={styles.searchText}>搜索水果、肉类...</Text>
        </View>
      </View>

      <View className={styles.bannerSection}>
        <Swiper
          className={styles.bannerSwiper}
          autoplay
          interval={3000}
          circular
          indicatorDots
          indicatorColor='rgba(255,255,255,0.5)'
          indicatorActiveColor='#fff'
        >
          {banners.map(banner => (
            <SwiperItem key={banner.id}>
              <View className={styles.bannerItem}>
                <Image
                  className={styles.bannerImage}
                  src={banner.image}
                  mode='aspectFill'
                  onError={(e) => handleImageError(e, banner.id)}
                />
              </View>
            </SwiperItem>
          ))}
        </Swiper>
      </View>

      <View className={styles.categorySection}>
        <ScrollView
          className={styles.categoryScroll}
          scrollX
          enhanced
          showScrollbar={false}
        >
          <View className={styles.categoryList}>
            {categories.map(category => (
              <View
                key={category.id}
                className={styles.categoryItem}
                onClick={() => handleCategoryClick(category.id)}
              >
                <View className={styles.categoryIcon}>{category.icon}</View>
                <Text className={styles.categoryName}>{category.name}</Text>
              </View>
            ))}
          </View>
        </ScrollView>
      </View>

      <View className={styles.sectionTitle}>
        <Text className={styles.titleText}>为你推荐</Text>
        <Button className={styles.moreBtn}>查看更多 →</Button>
      </View>

      <View className={styles.productGrid}>
        {gridProducts.map(product => (
          <View key={product.id} className={styles.productItem}>
            <ProductCard product={product} />
          </View>
        ))}
      </View>

      {loading && (
        <View className={styles.loading}>加载中...</View>
      )}

      <CompareBar />
    </View>
  )
}

export default HomePage
