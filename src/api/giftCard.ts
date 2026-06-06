import type {
  GiftCardDenomination,
  GiftCardTemplate,
  GiftCardOrder,
  CreateGiftCardOrderParams,
  GiftCardPaymentResult,
} from '@/types'
import {
  getGiftCardDenominations as mockGetDenominations,
  getGiftCardTemplates as mockGetTemplates,
  getRandomMessage as mockGetRandomMessage,
  createGiftCardOrder as mockCreateOrder,
  payGiftCardOrder as mockPayOrder,
  getGiftCardOrder as mockGetOrder,
  getMyGiftCardOrders as mockGetMyOrders,
  sendGiftCard as mockSendGiftCard,
  claimGiftCard as mockClaimGiftCard,
} from '@/mock/giftCard'

function delay(ms: number = 300): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

export function getDenominations(): Promise<{ data: GiftCardDenomination[] }> {
  return delay().then(async () => {
    const data = await mockGetDenominations()
    console.log('[GiftCard] 获取面额列表成功，数量:', data.length)
    return { data }
  })
}

export function getTemplates(): Promise<{ data: GiftCardTemplate[] }> {
  return delay().then(async () => {
    const data = await mockGetTemplates()
    console.log('[GiftCard] 获取模板列表成功，数量:', data.length)
    return { data }
  })
}

export function getRandomMessage(): Promise<{ data: string }> {
  return delay(100).then(async () => {
    const data = await mockGetRandomMessage()
    return { data }
  })
}

export function createOrder(params: CreateGiftCardOrderParams): Promise<{ data: { orderId: number; orderNo: string; payAmount: number } }> {
  return delay().then(async () => {
    const data = await mockCreateOrder(params)
    console.log('[GiftCard] 创建订单成功，订单号:', data.orderNo)
    return { data }
  })
}

export function payOrder(
  orderId: number,
  payMethod: 'wechat' | 'alipay' | 'balance'
): Promise<{ data: GiftCardPaymentResult }> {
  return delay(800).then(async () => {
    const data = await mockPayOrder(orderId, payMethod)
    console.log('[GiftCard] 支付成功，状态:', data.status)
    return { data }
  })
}

export function getOrder(orderId: number): Promise<{ data: GiftCardOrder | undefined }> {
  return delay().then(async () => {
    const data = await mockGetOrder(orderId)
    console.log('[GiftCard] 获取订单详情成功，订单号:', data?.orderNo)
    return { data }
  })
}

export function getMyOrders(type: 'sent' | 'received' = 'sent'): Promise<{ data: GiftCardOrder[] }> {
  return delay().then(async () => {
    const data = await mockGetMyOrders(type)
    console.log(`[GiftCard] 获取我的礼品卡列表成功（${type}），数量:`, data.length)
    return { data }
  })
}

export function sendGiftCard(orderId: number): Promise<{ data: void }> {
  return delay().then(async () => {
    await mockSendGiftCard(orderId)
    console.log('[GiftCard] 礼品卡发送成功，订单ID:', orderId)
    return { data: undefined as void }
  })
}

export function claimGiftCard(cardCode: string, phone: string): Promise<{ data: GiftCardOrder }> {
  return delay().then(async () => {
    const data = await mockClaimGiftCard(cardCode, phone)
    console.log('[GiftCard] 礼品卡领取成功，卡号:', cardCode)
    return { data }
  })
}
