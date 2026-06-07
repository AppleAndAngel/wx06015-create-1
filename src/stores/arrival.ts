import { defineStore } from 'pinia'
import Taro from '@tarojs/taro'
import type { Product, ArrivalReminderItem } from '@/types'
import { checkRestockProducts, getProductById } from '@/mock/products'

export const useArrivalStore = defineStore('arrival', {
  state: () => ({
    reminderList: [] as ArrivalReminderItem[]
  }),

  getters: {
    count: (state) => state.reminderList.length,
    outOfStockCount: (state) => state.reminderList.filter(item => !item.product.inStock).length,
    inStockCount: (state) => state.reminderList.filter(item => item.product.inStock && !item.notified).length,
    sortedList: (state) => {
      return [...state.reminderList].sort((a, b) => {
        if (a.product.inStock && !b.product.inStock) return -1
        if (!a.product.inStock && b.product.inStock) return 1
        return b.addedAt - a.addedAt
      })
    }
  },

  actions: {
    addToReminder(product: Product) {
      if (this.reminderList.find(item => item.product.id === product.id)) {
        console.log('[Arrival] 商品已在到货提醒列表中:', product.name)
        return
      }
      this.reminderList.push({
        product,
        addedAt: Date.now(),
        notified: false
      })
      console.log('[Arrival] 已添加到货提醒:', product.name)
      Taro.showToast({
        title: '已设置到货提醒',
        icon: 'success'
      })
    },

    removeFromReminder(productId: string) {
      const index = this.reminderList.findIndex(item => item.product.id === productId)
      if (index > -1) {
        const removed = this.reminderList.splice(index, 1)[0]
        console.log('[Arrival] 已取消到货提醒:', removed.product.name)
      }
    },

    isInReminder(productId: string): boolean {
      return this.reminderList.some(item => item.product.id === productId)
    },

    markAsNotified(productId: string) {
      const item = this.reminderList.find(item => item.product.id === productId)
      if (item) {
        item.notified = true
        console.log('[Arrival] 已标记为已通知:', item.product.name)
      }
    },

    checkStockUpdates(): Product[] {
      console.log('[Arrival] 检查商品库存更新...')
      const restockedProducts = checkRestockProducts()
      
      const notifyList: Product[] = []
      restockedProducts.forEach(product => {
        const reminder = this.reminderList.find(item => item.product.id === product.id)
        if (reminder && !reminder.notified) {
          const latestProduct = getProductById(product.id)
          if (latestProduct) {
            reminder.product = latestProduct
          }
          notifyList.push(product)
        }
      })

      this.reminderList.forEach(item => {
        const latestProduct = getProductById(item.product.id)
        if (latestProduct) {
          item.product = latestProduct
        }
      })

      if (notifyList.length > 0) {
        console.log('[Arrival] 有', notifyList.length, '件关注商品到货了')
        this.showArrivalNotification(notifyList)
      }

      return notifyList
    },

    showArrivalNotification(products: Product[]) {
      if (products.length === 0) return

      const productNames = products.map(p => p.name).join('、')
      
      Taro.showModal({
        title: '🎉 商品到货啦',
        content: `您关注的${productNames}${products.length > 1 ? '都' : ''}已到货，快去看看吧！`,
        confirmText: '立即查看',
        cancelText: '稍后再说',
        success: (res) => {
          if (res.confirm) {
            Taro.navigateTo({
              url: '/pages/arrival/index'
            })
          }
        }
      })

      products.forEach(product => {
        this.markAsNotified(product.id)
      })
    },

    clearNotified() {
      this.reminderList = this.reminderList.filter(item => !item.notified || !item.product.inStock)
      console.log('[Arrival] 已清空已通知的到货商品')
    }
  }
})
