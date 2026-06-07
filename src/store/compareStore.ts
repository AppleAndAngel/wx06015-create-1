import { create } from 'zustand'
import { CompareStore, Product } from '@/types/product'
import Taro from '@tarojs/taro'

const MAX_COMPARE_COUNT = 4

export const useCompareStore = create<CompareStore>((set, get) => ({
  compareList: [],
  maxCompareCount: MAX_COMPARE_COUNT,

  addToCompare: (product: Product) => {
    const { compareList, maxCompareCount } = get()
    if (compareList.find(p => p.id === product.id)) {
      return
    }
    if (compareList.length >= maxCompareCount) {
      Taro.showToast({
        title: `最多只能对比${maxCompareCount}件商品`,
        icon: 'none'
      })
      return
    }
    set(state => ({
      compareList: [...state.compareList, product]
    }))
    Taro.showToast({
      title: '已加入对比',
      icon: 'success'
    })
    console.log('[Compare] addToCompare:', product.id, product.name)
  },

  removeFromCompare: (productId: string) => {
    set(state => ({
      compareList: state.compareList.filter(p => p.id !== productId)
    }))
    console.log('[Compare] removeFromCompare:', productId)
  },

  clearCompare: () => {
    set({ compareList: [] })
    console.log('[Compare] clearCompare')
  },

  isInCompare: (productId: string) => {
    return get().compareList.some(p => p.id === productId)
  }
}))
