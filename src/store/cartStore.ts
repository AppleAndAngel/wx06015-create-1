import { create } from 'zustand'
import { CartStore, Product, CartItem } from '@/types/product'
import Taro from '@tarojs/taro'

export const useCartStore = create<CartStore>((set, get) => ({
  cartList: [],

  addToCart: (product: Product, quantity: number = 1) => {
    set(state => {
      const existingItem = state.cartList.find(item => item.product.id === product.id)
      if (existingItem) {
        return {
          cartList: state.cartList.map(item =>
            item.product.id === product.id
              ? { ...item, quantity: item.quantity + quantity }
              : item
          )
        }
      }
      return {
        cartList: [...state.cartList, { product, quantity, selected: true }]
      }
    })
    Taro.showToast({
      title: '已加入购物车',
      icon: 'success'
    })
    console.log('[Cart] addToCart:', product.id, product.name, 'quantity:', quantity)
  },

  removeFromCart: (productId: string) => {
    set(state => ({
      cartList: state.cartList.filter(item => item.product.id !== productId)
    }))
    console.log('[Cart] removeFromCart:', productId)
  },

  updateQuantity: (productId: string, quantity: number) => {
    if (quantity <= 0) {
      get().removeFromCart(productId)
      return
    }
    set(state => ({
      cartList: state.cartList.map(item =>
        item.product.id === productId
          ? { ...item, quantity }
          : item
      )
    }))
    console.log('[Cart] updateQuantity:', productId, quantity)
  },

  toggleSelect: (productId: string) => {
    set(state => ({
      cartList: state.cartList.map(item =>
        item.product.id === productId
          ? { ...item, selected: !item.selected }
          : item
      )
    }))
  },

  toggleSelectAll: (selected: boolean) => {
    set(state => ({
      cartList: state.cartList.map(item => ({ ...item, selected }))
    }))
  },

  clearCart: () => {
    set({ cartList: [] })
    console.log('[Cart] clearCart')
  },

  getTotalPrice: () => {
    return get().cartList
      .filter(item => item.selected)
      .reduce((total, item) => total + item.product.price * item.quantity, 0)
  },

  getSelectedCount: () => {
    return get().cartList.filter(item => item.selected).length
  },

  getSelectedItems: () => {
    return get().cartList.filter(item => item.selected)
  }
}))
