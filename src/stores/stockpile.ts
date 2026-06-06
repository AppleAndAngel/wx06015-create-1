import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import {
  fetchStockpileList,
  fetchStockpileByCategory,
  addItemToStockpile,
  removeStockpileItem,
  updateStockpileItemQuantity,
  updateStockpileItemNote,
  addStockpileItemsToCart,
  checkProductInStockpile,
  fetchStockpileCategories,
} from '@/api/stockpile'
import type { StockpileItem, StockpileCategory, Product } from '@/types'

export const useStockpileStore = defineStore('stockpile', () => {
  const items = ref<StockpileItem[]>([])
  const categories = ref<StockpileCategory[]>([])
  const selectedCategory = ref<string>('all')
  const selectedItemIds = ref<number[]>([])
  const loading = ref(false)

  const totalCount = computed(() => items.value.length)

  const selectedItems = computed(() =>
    items.value.filter((item) => selectedItemIds.value.includes(item.id))
  )

  const selectedCount = computed(() => selectedItemIds.value.length)

  const totalAmount = computed(() =>
    selectedItems.value.reduce((sum, item) => sum + item.product.price * item.quantity, 0)
  )

  const groupedItems = computed(() => {
    const groups: Record<string, StockpileItem[]> = {}
    categories.value.forEach((cat) => {
      groups[cat.id] = items.value.filter((item) => item.category === cat.id)
    })
    return groups
  })

  const categoryCountMap = computed(() => {
    const map: Record<string, number> = { all: items.value.length }
    categories.value.forEach((cat) => {
      map[cat.id] = items.value.filter((item) => item.category === cat.id).length
    })
    return map
  })

  async function fetchList() {
    try {
      loading.value = true
      const { data } = await fetchStockpileList()
      items.value = data
      console.log('[Stockpile] 获取囤货清单成功，共', data.length, '件商品')
    } catch (e) {
      console.error('[Stockpile] 获取囤货清单失败', e)
      throw e
    } finally {
      loading.value = false
    }
  }

  async function fetchByCategory(category: string) {
    try {
      const { data } = await fetchStockpileByCategory(category)
      if (category === 'all') {
        items.value = data
      } else {
        items.value = data
      }
      return data
    } catch (e) {
      console.error('[Stockpile] 获取分类商品失败', e)
      throw e
    }
  }

  async function fetchCategories() {
    try {
      const { data } = await fetchStockpileCategories()
      categories.value = data
    } catch (e) {
      console.error('[Stockpile] 获取分类失败', e)
      throw e
    }
  }

  async function addItem(
    product: Product,
    specValues: Record<string, string>,
    quantity: number,
    category: string,
    note?: string
  ) {
    try {
      const { data } = await addItemToStockpile(product.id, specValues, quantity, category, note)
      const existing = items.value.find((item) => item.id === data.id)
      if (existing) {
        Object.assign(existing, data)
      } else {
        items.value.push(data)
      }
      console.log('[Stockpile] 添加商品成功:', data.product.name)
      return data
    } catch (e) {
      console.error('[Stockpile] 添加商品失败', e)
      throw e
    }
  }

  async function removeItem(id: number) {
    try {
      await removeStockpileItem(id)
      items.value = items.value.filter((item) => item.id !== id)
      selectedItemIds.value = selectedItemIds.value.filter((itemId) => itemId !== id)
      console.log('[Stockpile] 删除商品成功')
    } catch (e) {
      console.error('[Stockpile] 删除商品失败', e)
      throw e
    }
  }

  async function updateQuantity(id: number, quantity: number) {
    try {
      const { data } = await updateStockpileItemQuantity(id, quantity)
      const item = items.value.find((item) => item.id === id)
      if (item) {
        item.quantity = data.quantity
      }
    } catch (e) {
      console.error('[Stockpile] 更新数量失败', e)
      throw e
    }
  }

  async function updateNote(id: number, note: string) {
    try {
      const { data } = await updateStockpileItemNote(id, note)
      const item = items.value.find((item) => item.id === id)
      if (item) {
        item.note = data.note
      }
    } catch (e) {
      console.error('[Stockpile] 更新备注失败', e)
      throw e
    }
  }

  async function addSelectedToCart() {
    if (selectedItemIds.value.length === 0) {
      throw new Error('请先选择商品')
    }
    try {
      const { data } = await addStockpileItemsToCart(selectedItemIds.value)
      selectedItemIds.value = []
      await fetchList()
      console.log('[Stockpile] 加入购物车成功，共', data.successCount, '件')
      return data
    } catch (e) {
      console.error('[Stockpile] 加入购物车失败', e)
      throw e
    }
  }

  async function addAllToCart() {
    if (items.value.length === 0) {
      throw new Error('囤货清单为空')
    }
    const allIds = items.value.map((item) => item.id)
    try {
      const { data } = await addStockpileItemsToCart(allIds)
      await fetchList()
      console.log('[Stockpile] 全部加入购物车成功，共', data.successCount, '件')
      return data
    } catch (e) {
      console.error('[Stockpile] 全部加入购物车失败', e)
      throw e
    }
  }

  async function isInStockpile(productId: number, specValues: Record<string, string>): Promise<boolean> {
    try {
      const { data } = await checkProductInStockpile(productId, specValues)
      return data
    } catch (e) {
      return false
    }
  }

  function toggleSelect(id: number) {
    const index = selectedItemIds.value.indexOf(id)
    if (index === -1) {
      selectedItemIds.value.push(id)
    } else {
      selectedItemIds.value.splice(index, 1)
    }
  }

  function toggleSelectAll() {
    if (selectedItemIds.value.length === items.value.length) {
      selectedItemIds.value = []
    } else {
      selectedItemIds.value = items.value.map((item) => item.id)
    }
  }

  function setCategory(category: string) {
    selectedCategory.value = category
    selectedItemIds.value = []
  }

  function isSelected(id: number): boolean {
    return selectedItemIds.value.includes(id)
  }

  function clearSelected() {
    selectedItemIds.value = []
  }

  return {
    items,
    categories,
    selectedCategory,
    selectedItemIds,
    loading,
    totalCount,
    selectedItems,
    selectedCount,
    totalAmount,
    groupedItems,
    categoryCountMap,
    fetchList,
    fetchByCategory,
    fetchCategories,
    addItem,
    removeItem,
    updateQuantity,
    updateNote,
    addSelectedToCart,
    addAllToCart,
    isInStockpile,
    toggleSelect,
    toggleSelectAll,
    setCategory,
    isSelected,
    clearSelected,
  }
}, {
  persist: {
    pick: ['items', 'selectedItemIds'],
  },
})
