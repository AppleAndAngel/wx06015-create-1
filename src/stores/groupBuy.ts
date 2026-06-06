import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import {
  getGroupBuyProducts,
  getGroupBuyProductByProductId,
  getActiveGroupOrders,
  getGroupOrderById,
  getMyGroupOrders,
  createGroupBuy as createGroupBuyApi,
  joinGroupBuy as joinGroupBuyApi,
} from '@/api/groupBuy'
import type { GroupBuyProduct, GroupBuyOrder } from '@/types'

export const useGroupBuyStore = defineStore('groupBuy', () => {
  const products = ref<GroupBuyProduct[]>([])
  const activeOrders = ref<GroupBuyOrder[]>([])
  const myOrders = ref<GroupBuyOrder[]>([])
  const currentOrder = ref<GroupBuyOrder | null>(null)

  const pendingMyOrders = computed(() =>
    myOrders.value.filter((o) => o.status === 'pending')
  )

  const successMyOrders = computed(() =>
    myOrders.value.filter((o) => o.status === 'success')
  )

  async function fetchProducts() {
    try {
      const { data } = await getGroupBuyProducts()
      products.value = data
      console.log('[GroupBuy] 获取拼团商品列表成功，数量:', data.length)
    } catch (e) {
      console.error('[GroupBuy] 获取拼团商品列表失败', e)
      throw e
    }
  }

  async function fetchActiveOrders() {
    try {
      const { data } = await getActiveGroupOrders()
      activeOrders.value = data
      console.log('[GroupBuy] 获取进行中拼团列表成功，数量:', data.length)
    } catch (e) {
      console.error('[GroupBuy] 获取进行中拼团列表失败', e)
      throw e
    }
  }

  async function fetchMyOrders() {
    try {
      const { data } = await getMyGroupOrders()
      myOrders.value = data
      console.log('[GroupBuy] 获取我的拼团列表成功，数量:', data.length)
    } catch (e) {
      console.error('[GroupBuy] 获取我的拼团列表失败', e)
      throw e
    }
  }

  async function fetchGroupOrder(id: number) {
    try {
      const { data } = await getGroupOrderById(id)
      currentOrder.value = data || null
      return data
    } catch (e) {
      console.error('[GroupBuy] 获取拼团详情失败', e)
      throw e
    }
  }

  async function getProductByProductId(productId: number) {
    try {
      const { data } = await getGroupBuyProductByProductId(productId)
      return data
    } catch (e) {
      console.error('[GroupBuy] 获取商品拼团信息失败', e)
      throw e
    }
  }

  async function createGroupBuy(
    productId: number,
    specValues: Record<string, string>,
    quantity: number
  ) {
    try {
      const { data } = await createGroupBuyApi({ productId, specValues, quantity })
      activeOrders.value.unshift(data)
      myOrders.value.unshift(data)
      currentOrder.value = data
      console.log('[GroupBuy] 发起拼团成功:', data.groupNo)
      return data
    } catch (e) {
      console.error('[GroupBuy] 发起拼团失败', e)
      throw e
    }
  }

  async function joinGroupBuy(
    groupId: number,
    specValues: Record<string, string>,
    quantity: number
  ) {
    try {
      const { data } = await joinGroupBuyApi({ groupId, specValues, quantity })
      const idx = activeOrders.value.findIndex((o) => o.id === groupId)
      if (idx !== -1) {
        activeOrders.value[idx] = data
      }
      const myIdx = myOrders.value.findIndex((o) => o.id === groupId)
      if (myIdx !== -1) {
        myOrders.value[myIdx] = data
      }
      currentOrder.value = data
      console.log('[GroupBuy] 参团成功:', groupId, '状态:', data.status)
      return data
    } catch (e) {
      console.error('[GroupBuy] 参团失败', e)
      throw e
    }
  }

  return {
    products,
    activeOrders,
    myOrders,
    currentOrder,
    pendingMyOrders,
    successMyOrders,
    fetchProducts,
    fetchActiveOrders,
    fetchMyOrders,
    fetchGroupOrder,
    getProductByProductId,
    createGroupBuy,
    joinGroupBuy,
  }
}, {
  persist: {
    pick: ['myOrders'],
  },
})
