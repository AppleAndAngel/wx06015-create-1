import type {
  GroupMealPackage,
  GroupMealTimeSlot,
  GroupMealOrder,
  CreateGroupMealOrderParams,
  GroupMealOrderResult,
} from '@/types'
import {
  getGroupMealPackages as mockGetGroupMealPackages,
  getGroupMealPackageById as mockGetGroupMealPackageById,
  getTimeSlots as mockGetTimeSlots,
  getAvailableDates as mockGetAvailableDates,
  createGroupMealOrder as mockCreateGroupMealOrder,
  getGroupMealOrders as mockGetGroupMealOrders,
  getGroupMealOrderById as mockGetGroupMealOrderById,
} from '@/mock/groupMeal'

function delay(ms: number = 300): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

export function getGroupMealPackages(peopleCount?: number): Promise<{ data: GroupMealPackage[] }> {
  return delay().then(() => ({
    data: mockGetGroupMealPackages(peopleCount),
  }))
}

export function getGroupMealPackageById(id: number): Promise<{ data: GroupMealPackage | undefined }> {
  return delay().then(() => ({
    data: mockGetGroupMealPackageById(id),
  }))
}

export function getTimeSlots(): Promise<{ data: GroupMealTimeSlot[] }> {
  return delay().then(() => ({
    data: mockGetTimeSlots(),
  }))
}

export function getAvailableDates(): Promise<{ data: string[] }> {
  return delay().then(() => ({
    data: mockGetAvailableDates(),
  }))
}

export function createGroupMealOrder(params: CreateGroupMealOrderParams): Promise<{ data: GroupMealOrderResult }> {
  return delay().then(() => {
    const order = mockCreateGroupMealOrder(params)
    console.log('[GroupMeal] 创建团餐订单成功:', order.orderNo)
    return {
      data: {
        orderId: order.id,
        orderNo: order.orderNo,
        payAmount: order.payAmount,
      },
    }
  })
}

export function getGroupMealOrders(status?: string): Promise<{ data: GroupMealOrder[] }> {
  return delay().then(() => ({
    data: mockGetGroupMealOrders(status),
  }))
}

export function getGroupMealOrderById(id: number): Promise<{ data: GroupMealOrder | undefined }> {
  return delay().then(() => ({
    data: mockGetGroupMealOrderById(id),
  }))
}
