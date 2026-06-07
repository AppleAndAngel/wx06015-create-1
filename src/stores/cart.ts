import { defineStore } from 'pinia'
import type { Product, CartItem } from '@/types'

export const useCartStore = defineStore('cart', {
  state: () => ({
    cartList: [] as CartItem[]
  }),

  getters: {
    totalCount: (state) => state.cartList.reduce((sum, item) => sum + item.quantity, 0),
    selectedCount: (state) => state.cartList.filter(item => item.selected).reduce((sum, item) => sum + item.quantity, 0),
    allSelected: (state) => state.cartList.length > 0 && state.cartList.every(item => item.selected),
    totalPrice: (state) => state.cartList.filter(item => item.selected).reduce((sum, item) => sum + item.product.price * item.quantity, 0)
  },

  actions: {
    addToCart(product: Product, quantity: number = 1) {
      const existingItem = this.cartList.find(item => item.product.id === product.id)
      if (existingItem) {
        existingItem.quantity += quantity
      } else {
        this.cartList.push({
          product,
          quantity,
          selected: true
        })
      }
      console.log('[Cart] 已添加商品到购物车:', product.name, '数量:', quantity)
      Taro.showToast({
        title: '已加入购物车',
        icon: 'success'
      })
    },

    removeFromCart(productId: string) {
      const index = this.cartList.findIndex(item => item.product.id === productId)
      if (index > -1) {
        const removed = this.cartList.splice(index, 1)[0]
        console.log('[Cart] 已从购物车移除商品:', removed.product.name)
      }
    },

    updateQuantity(productId: string, quantity: number) {
      const item = this.cartList.find(item => item.product.id === productId)
      if (item) {
        if (quantity <= 0) {
          this.removeFromCart(productId)
        } else {
          item.quantity = quantity
          console.log('[Cart] 更新商品数量:', item.product.name, '数量:', quantity)
        }
      }
    },

    toggleSelect(productId: string) {
      const item = this.cartList.find(item => item.product.id === productId)
      if (item) {
        item.selected = !item.selected
        console.log('[Cart] 切换商品选中状态:', item.product.name, '选中:', item.selected)
      }
    },

    toggleSelectAll(selected: boolean) {
      this.cartList.forEach(item => {
        item.selected = selected
      })
      console.log('[Cart] 全选/取消全选:', selected)
    },

    clearSelected() {
      this.cartList = this.cartList.filter(item => !item.selected)
      console.log('[Cart] 已清空已选中商品')
    }
  }
})
