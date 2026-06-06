import type { GroupBuyProduct, GroupBuyOrder, GroupBuyMember } from '@/types'
import { products, getProductById } from './products'

const img = (prompt: string) =>
  `https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=${encodeURIComponent(prompt)}&image_size=square_hd`

export const groupBuyProducts: GroupBuyProduct[] = [
  {
    id: 1,
    productId: 1,
    product: getProductById(1)!,
    groupPrice: 9.9,
    originalPrice: 18.9,
    groupSize: 2,
    currentCount: 1,
    endTime: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(),
    discount: '5.2折'
  },
  {
    id: 2,
    productId: 2,
    product: getProductById(2)!,
    groupPrice: 22.9,
    originalPrice: 39.9,
    groupSize: 2,
    currentCount: 1,
    endTime: new Date(Date.now() + 3 * 60 * 60 * 1000).toISOString(),
    discount: '5.7折'
  },
  {
    id: 3,
    productId: 3,
    product: getProductById(3)!,
    groupPrice: 25.8,
    originalPrice: 49.9,
    groupSize: 2,
    currentCount: 0,
    endTime: new Date(Date.now() + 4 * 60 * 60 * 1000).toISOString(),
    discount: '5.2折'
  },
  {
    id: 4,
    productId: 7,
    product: getProductById(7)!,
    groupPrice: 49.9,
    originalPrice: 89.0,
    groupSize: 2,
    currentCount: 1,
    endTime: new Date(Date.now() + 1.5 * 60 * 60 * 1000).toISOString(),
    discount: '5.6折'
  },
  {
    id: 5,
    productId: 10,
    product: getProductById(10)!,
    groupPrice: 45.9,
    originalPrice: 79.9,
    groupSize: 2,
    currentCount: 0,
    endTime: new Date(Date.now() + 5 * 60 * 60 * 1000).toISOString(),
    discount: '5.7折'
  },
  {
    id: 6,
    productId: 16,
    product: getProductById(16)!,
    groupPrice: 29.9,
    originalPrice: 55.0,
    groupSize: 2,
    currentCount: 1,
    endTime: new Date(Date.now() + 2.5 * 60 * 60 * 1000).toISOString(),
    discount: '5.4折'
  }
]

const mockMembers: GroupBuyMember[] = [
  {
    id: 1,
    userId: 1001,
    nickname: '水果达人',
    avatar: img('happy young woman avatar, cartoon style'),
    isInitiator: true,
    joinedAt: new Date(Date.now() - 30 * 60 * 1000).toISOString()
  },
  {
    id: 2,
    userId: 1002,
    nickname: '美食家小王',
    avatar: img('smiling man avatar, cartoon style'),
    isInitiator: false,
    joinedAt: new Date(Date.now() - 15 * 60 * 1000).toISOString()
  }
]

export const activeGroupOrders: GroupBuyOrder[] = [
  {
    id: 1001,
    groupNo: 'GB20260606001',
    productId: 1,
    product: getProductById(1)!,
    groupPrice: 9.9,
    groupSize: 2,
    currentCount: 1,
    initiatorId: 1001,
    initiatorNickname: '水果达人',
    initiatorAvatar: img('happy young woman avatar, cartoon style'),
    members: [mockMembers[0]],
    status: 'pending',
    endTime: new Date(Date.now() + 1.5 * 60 * 60 * 1000).toISOString(),
    createdAt: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
    specValues: { '规格': '5斤装', '产地': '山东烟台' },
    quantity: 1
  },
  {
    id: 1002,
    groupNo: 'GB20260606002',
    productId: 7,
    product: getProductById(7)!,
    groupPrice: 49.9,
    groupSize: 2,
    currentCount: 1,
    initiatorId: 1003,
    initiatorNickname: '烤肉爱好者',
    initiatorAvatar: img('man with BBQ avatar, cartoon style'),
    members: [
      {
        id: 3,
        userId: 1003,
        nickname: '烤肉爱好者',
        avatar: img('man with BBQ avatar, cartoon style'),
        isInitiator: true,
        joinedAt: new Date(Date.now() - 20 * 60 * 1000).toISOString()
      }
    ],
    status: 'pending',
    endTime: new Date(Date.now() + 1 * 60 * 60 * 1000).toISOString(),
    createdAt: new Date(Date.now() - 20 * 60 * 1000).toISOString(),
    specValues: { '规格': '500g', '部位': '羊排' },
    quantity: 1
  }
]

export const myGroupOrders: GroupBuyOrder[] = [
  {
    id: 1003,
    groupNo: 'GB20260606003',
    productId: 2,
    product: getProductById(2)!,
    groupPrice: 22.9,
    groupSize: 2,
    currentCount: 2,
    initiatorId: 1004,
    initiatorNickname: '我',
    initiatorAvatar: img('user avatar, cartoon style'),
    members: [
      {
        id: 4,
        userId: 1004,
        nickname: '我',
        avatar: img('user avatar, cartoon style'),
        isInitiator: true,
        joinedAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString()
      },
      {
        id: 5,
        userId: 1005,
        nickname: '闺蜜小美',
        avatar: img('cute girl avatar, cartoon style'),
        isInitiator: false,
        joinedAt: new Date(Date.now() - 1.5 * 60 * 60 * 1000).toISOString()
      }
    ],
    status: 'success',
    endTime: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    specValues: { '规格': '5斤装', '品种': '金煌芒' },
    quantity: 1
  },
  {
    id: 1004,
    groupNo: 'GB20260606004',
    productId: 10,
    product: getProductById(10)!,
    groupPrice: 45.9,
    groupSize: 2,
    currentCount: 1,
    initiatorId: 1004,
    initiatorNickname: '我',
    initiatorAvatar: img('user avatar, cartoon style'),
    members: [
      {
        id: 6,
        userId: 1004,
        nickname: '我',
        avatar: img('user avatar, cartoon style'),
        isInitiator: true,
        joinedAt: new Date(Date.now() - 30 * 60 * 1000).toISOString()
      }
    ],
    status: 'pending',
    endTime: new Date(Date.now() + 1.5 * 60 * 60 * 1000).toISOString(),
    createdAt: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
    specValues: { '规格': '500g', '加工': '切片' },
    quantity: 1
  }
]

export function getGroupBuyProducts(): GroupBuyProduct[] {
  return groupBuyProducts
}

export function getGroupBuyProductById(id: number): GroupBuyProduct | undefined {
  return groupBuyProducts.find(g => g.id === id)
}

export function getGroupBuyProductByProductId(productId: number): GroupBuyProduct | undefined {
  return groupBuyProducts.find(g => g.productId === productId)
}

export function getActiveGroupOrders(): GroupBuyOrder[] {
  return activeGroupOrders
}

export function getGroupOrderById(id: number): GroupBuyOrder | undefined {
  return [...activeGroupOrders, ...myGroupOrders].find(g => g.id === id)
}

export function getMyGroupOrders(): GroupBuyOrder[] {
  return myGroupOrders
}

export function createGroupBuy(productId: number, specValues: Record<string, string>, quantity: number): GroupBuyOrder {
  const product = getProductById(productId)!
  const groupProduct = getGroupBuyProductByProductId(productId)!
  const newOrder: GroupBuyOrder = {
    id: Date.now(),
    groupNo: `GB${Date.now()}`,
    productId,
    product,
    groupPrice: groupProduct.groupPrice,
    groupSize: 2,
    currentCount: 1,
    initiatorId: 1004,
    initiatorNickname: '我',
    initiatorAvatar: img('user avatar, cartoon style'),
    members: [
      {
        id: Date.now(),
        userId: 1004,
        nickname: '我',
        avatar: img('user avatar, cartoon style'),
        isInitiator: true,
        joinedAt: new Date().toISOString()
      }
    ],
    status: 'pending',
    endTime: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(),
    createdAt: new Date().toISOString(),
    specValues,
    quantity
  }
  activeGroupOrders.unshift(newOrder)
  myGroupOrders.unshift(newOrder)
  return newOrder
}

export function joinGroupBuy(groupId: number, specValues: Record<string, string>, quantity: number): GroupBuyOrder {
  const order = getGroupOrderById(groupId)!
  if (order.currentCount < order.groupSize) {
    order.currentCount += 1
    order.members.push({
      id: Date.now(),
      userId: 1004,
      nickname: '我',
      avatar: img('user avatar, cartoon style'),
      isInitiator: false,
      joinedAt: new Date().toISOString()
    })
    if (order.currentCount >= order.groupSize) {
      order.status = 'success'
    }
  }
  return order
}
