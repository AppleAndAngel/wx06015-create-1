import { ref } from 'vue'
import { defineStore } from 'pinia'
import {
  createOrder as createOrderApi,
  fetchOrders as fetchOrdersApi,
  fetchOrderById as fetchOrderByIdApi,
  cancelOrder as cancelOrderApi,
  confirmReceive as confirmReceiveApi,
} from '@/api/order'
import type { Order, CreateOrderData } from '@/types'

export const useOrderStore = defineStore('order', () => {
  const orders = ref<Order[]>([])
  const currentOrder = ref<Order | null>(null)

  async function createOrder(data: CreateOrderData) {
    const { data: order } = await createOrderApi(data)
    orders.value.unshift(order)
    currentOrder.value = order
    return order
  }

  async function fetchOrders(status?: string) {
    const { data } = await fetchOrdersApi(status)
    orders.value = data
  }

  async function fetchOrderById(id: number) {
    const { data } = await fetchOrderByIdApi(id)
    currentOrder.value = data
  }

  async function cancelOrder(id: number) {
    const { data } = await cancelOrderApi(id)
    const index = orders.value.findIndex((o) => o.id === id)
    if (index !== -1) {
      orders.value[index] = data
    }
    if (currentOrder.value?.id === id) {
      currentOrder.value = data
    }
  }

  async function confirmReceive(id: number) {
    const { data } = await confirmReceiveApi(id)
    const index = orders.value.findIndex((o) => o.id === id)
    if (index !== -1) {
      orders.value[index] = data
    }
    if (currentOrder.value?.id === id) {
      currentOrder.value = data
    }
  }

  return {
    orders,
    currentOrder,
    createOrder,
    fetchOrders,
    fetchOrderById,
    cancelOrder,
    confirmReceive,
  }
})
