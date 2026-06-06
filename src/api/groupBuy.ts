import type { GroupBuyProduct, GroupBuyOrder, CreateGroupBuyParams, JoinGroupBuyParams } from '@/types'
import {
  getGroupBuyProducts as mockGetGroupBuyProducts,
  getGroupBuyProductById as mockGetGroupBuyProductById,
  getGroupBuyProductByProductId as mockGetGroupBuyProductByProductId,
  getActiveGroupOrders as mockGetActiveGroupOrders,
  getGroupOrderById as mockGetGroupOrderById,
  getMyGroupOrders as mockGetMyGroupOrders,
  createGroupBuy as mockCreateGroupBuy,
  joinGroupBuy as mockJoinGroupBuy,
} from '@/mock/groupBuy'

function delay(ms: number = 300): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

export function getGroupBuyProducts(): Promise<{ data: GroupBuyProduct[] }> {
  return delay().then(() => ({
    data: mockGetGroupBuyProducts(),
  }))
}

export function getGroupBuyProductById(id: number): Promise<{ data: GroupBuyProduct | undefined }> {
  return delay().then(() => ({
    data: mockGetGroupBuyProductById(id),
  }))
}

export function getGroupBuyProductByProductId(productId: number): Promise<{ data: GroupBuyProduct | undefined }> {
  return delay().then(() => ({
    data: mockGetGroupBuyProductByProductId(productId),
  }))
}

export function getActiveGroupOrders(): Promise<{ data: GroupBuyOrder[] }> {
  return delay().then(() => ({
    data: mockGetActiveGroupOrders(),
  }))
}

export function getGroupOrderById(id: number): Promise<{ data: GroupBuyOrder | undefined }> {
  return delay().then(() => ({
    data: mockGetGroupOrderById(id),
  }))
}

export function getMyGroupOrders(): Promise<{ data: GroupBuyOrder[] }> {
  return delay().then(() => ({
    data: mockGetMyGroupOrders(),
  }))
}

export function createGroupBuy(params: CreateGroupBuyParams): Promise<{ data: GroupBuyOrder }> {
  return delay().then(() => {
    const data = mockCreateGroupBuy(params.productId, params.specValues, params.quantity)
    console.log('[GroupBuy] 创建拼团成功:', data.groupNo)
    return { data }
  })
}

export function joinGroupBuy(params: JoinGroupBuyParams): Promise<{ data: GroupBuyOrder }> {
  return delay().then(() => {
    const data = mockJoinGroupBuy(params.groupId, params.specValues, params.quantity)
    console.log('[GroupBuy] 参团成功:', params.groupId, '成团状态:', data.status)
    return { data }
  })
}
