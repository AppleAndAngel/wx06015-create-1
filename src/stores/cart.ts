import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import {
  fetchCart as fetchCartApi,
  addCartItem as addCartItemApi,
  removeCartItem as removeCartItemApi,
  updateCartItemQuantity as updateCartItemQuantityApi,
} from '@/api/cart'
import type { CartItem, Product } from '@/types'

export const useCartStore = defineStore('cart', () => {
  const items = ref<CartItem[]>([])

  const totalCount = computed(() => items.value.length)

  const selectedItems = computed(() => items.value.filter((item) => item.selected))

  const selectedCount = computed(() => selectedItems.value.length)

  const totalAmount = computed(() =>
    selectedItems.value.reduce((sum, item) => sum + item.product.price * item.quantity, 0),
  )

  async function fetchCart() {
    const { data } = await fetchCartApi()
    items.value = data
  }

  async function addItem(product: Product, specValues: Record<string, string>, quantity: number) {
    const { data } = await addCartItemApi(product.id, specValues, quantity)
    const existing = items.value.find(
      (item) => item.productId === product.id && JSON.stringify(item.specValues) === JSON.stringify(specValues),
    )
    if (existing) {
      existing.quantity += quantity
    } else {
      items.value.push(data)
    }
  }

  async function removeItem(id: number) {
    await removeCartItemApi(id)
    items.value = items.value.filter((item) => item.id !== id)
  }

  async function updateQuantity(id: number, quantity: number) {
    const { data } = await updateCartItemQuantityApi(id, quantity)
    const item = items.value.find((item) => item.id === id)
    if (item) {
      item.quantity = data.quantity
    }
  }

  function toggleSelect(id: number) {
    const item = items.value.find((item) => item.id === id)
    if (item) {
      item.selected = !item.selected
    }
  }

  function toggleSelectAll() {
    const allSelected = items.value.every((item) => item.selected)
    items.value.forEach((item) => {
      item.selected = !allSelected
    })
  }

  function clearCart() {
    items.value = []
  }

  return {
    items,
    totalCount,
    selectedItems,
    selectedCount,
    totalAmount,
    fetchCart,
    addItem,
    removeItem,
    updateQuantity,
    toggleSelect,
    toggleSelectAll,
    clearCart,
  }
}, {
  persist: {
    pick: ['items'],
  },
})
