import { defineStore } from 'pinia'
import Taro from '@tarojs/taro'
import type { Product } from '@/types'

const MAX_COMPARE_COUNT = 4

export const useCompareStore = defineStore('compare', {
  state: () => ({
    compareList: [] as Product[]
  }),

  getters: {
    count: (state) => state.compareList.length,
    isFull: (state) => state.compareList.length >= MAX_COMPARE_COUNT
  },

  actions: {
    addToCompare(product: Product) {
      if (this.compareList.find(p => p.id === product.id)) {
        console.log('[Compare] 商品已在对比列表中:', product.name)
        return
      }
      if (this.compareList.length >= MAX_COMPARE_COUNT) {
        console.log('[Compare] 对比列表已满，最多支持4件商品对比')
        Taro.showToast({
          title: '最多只能对比4件商品',
          icon: 'none'
        })
        return
      }
      this.compareList.push(product)
      console.log('[Compare] 已添加商品到对比列表:', product.name)
      Taro.showToast({
        title: '已加入对比',
        icon: 'success'
      })
    },

    removeFromCompare(productId: string) {
      const index = this.compareList.findIndex(p => p.id === productId)
      if (index > -1) {
        const removed = this.compareList.splice(index, 1)[0]
        console.log('[Compare] 已从对比列表移除商品:', removed.name)
      }
    },

    clearCompare() {
      this.compareList = []
      console.log('[Compare] 已清空对比列表')
    },

    isInCompare(productId: string): boolean {
      return this.compareList.some(p => p.id === productId)
    }
  }
})
