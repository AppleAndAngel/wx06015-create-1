import type { Order, CreateOrderData } from '@/types'
import { getItem, setItem } from '@/utils/storage'

const ORDER_KEY = 'orders'

function delay(ms: number = 300): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

function getOrdersFromStorage(): Order[] {
  return getItem<Order[]>(ORDER_KEY) || []
}

function generateOrderNo(): string {
  return `XJ${Date.now()}${Math.floor(Math.random() * 1000)
    .toString()
    .padStart(3, '0')}`
}

export function createOrder(data: CreateOrderData): Promise<{ data: Order }> {
  return delay().then(() => {
    const orders = getOrdersFromStorage()
    const order: Order = {
      id: Date.now(),
      orderNo: generateOrderNo(),
      items: data.items,
      totalAmount: data.totalAmount,
      payAmount: data.payAmount,
      status: 'pending',
      address: data.address,
      createdAt: new Date().toISOString(),
    }
    orders.unshift(order)
    setItem(ORDER_KEY, orders)
    return { data: order }
  })
}

export function getOrders(params: { status?: string; page?: number }): Promise<Order[]> {
  return delay().then(() => {
    let orders = getOrdersFromStorage()
    if (params.status) {
      orders = orders.filter((o) => o.status === params.status)
    }
    return orders
  })
}

export function getOrderById(id: number): Promise<Order | undefined> {
  return delay().then(() => {
    const orders = getOrdersFromStorage()
    return orders.find((o) => o.id === id)
  })
}

export function cancelOrder(id: number): Promise<{ data: Order }> {
  return delay().then(() => {
    const orders = getOrdersFromStorage()
    const order = orders.find((o) => o.id === id)
    if (order) {
      order.status = 'cancelled'
      setItem(ORDER_KEY, orders)
    }
    return { data: order || ({} as Order) }
  })
}

export function confirmReceive(id: number): Promise<{ data: Order }> {
  return delay().then(() => {
    const orders = getOrdersFromStorage()
    const order = orders.find((o) => o.id === id)
    if (order) {
      order.status = 'delivered'
      setItem(ORDER_KEY, orders)
    }
    return { data: order || ({} as Order) }
  })
}

export function fetchOrders(status?: string): Promise<{ data: Order[] }> {
  return delay().then(() => {
    let orders = getOrdersFromStorage()
    if (status) {
      orders = orders.filter((o) => o.status === status)
    }
    return { data: orders }
  })
}

export function fetchOrderById(id: number): Promise<{ data: Order }> {
  return delay().then(() => {
    const orders = getOrdersFromStorage()
    const order = orders.find((o) => o.id === id)
    return { data: order || ({} as Order) }
  })
}
