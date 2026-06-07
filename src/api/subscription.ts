import type {
  SubscriptionProduct,
  Subscription,
  SubscriptionCategory,
  SubscriptionStatus,
  CreateSubscriptionParams,
  UpdateSubscriptionParams,
} from '@/types'
import {
  getSubscriptionCategories as mockGetCategories,
  getSubscriptionProducts as mockGetProducts,
  getSubscriptionProductById as mockGetProductById,
  getMySubscriptions as mockGetMySubscriptions,
  getSubscriptionById as mockGetById,
  createSubscription as mockCreate,
  updateSubscription as mockUpdate,
  pauseSubscription as mockPause,
  resumeSubscription as mockResume,
  cancelSubscription as mockCancel,
  skipNextDelivery as mockSkip,
} from '@/mock/subscription'

function delay(ms: number = 300): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

export function getSubscriptionCategories(): Promise<{
  data: SubscriptionCategory[]
}> {
  return delay().then(async () => {
    const data = await mockGetCategories()
    console.log('[Subscription] 获取订阅分类成功，数量:', data.length)
    return { data }
  })
}

export function getSubscriptionProducts(
  categoryId?: string
): Promise<{ data: SubscriptionProduct[] }> {
  return delay().then(async () => {
    const data = await mockGetProducts(categoryId)
    console.log('[Subscription] 获取订阅商品成功，数量:', data.length)
    return { data }
  })
}

export function getSubscriptionProductById(
  id: number
): Promise<{ data: SubscriptionProduct | undefined }> {
  return delay().then(async () => {
    const data = await mockGetProductById(id)
    console.log('[Subscription] 获取订阅商品详情:', data?.product.name)
    return { data }
  })
}

export function getMySubscriptions(
  status?: SubscriptionStatus
): Promise<{ data: Subscription[] }> {
  return delay().then(async () => {
    const data = await mockGetMySubscriptions(status)
    console.log('[Subscription] 获取我的订阅成功，数量:', data.length)
    return { data }
  })
}

export function getSubscriptionById(
  id: number
): Promise<{ data: Subscription | undefined }> {
  return delay().then(async () => {
    const data = await mockGetById(id)
    console.log('[Subscription] 获取订阅详情:', data?.product.name)
    return { data }
  })
}

export function createSubscription(
  params: CreateSubscriptionParams
): Promise<{ data: Subscription }> {
  return delay().then(async () => {
    const data = await mockCreate(params)
    console.log('[Subscription] 创建订阅成功:', data.product.name)
    return { data }
  })
}

export function updateSubscription(
  id: number,
  params: UpdateSubscriptionParams
): Promise<{ data: Subscription }> {
  return delay().then(async () => {
    const data = await mockUpdate(id, params)
    console.log('[Subscription] 更新订阅成功:', data.product.name)
    return { data }
  })
}

export function pauseSubscription(
  id: number,
  reason?: string,
  until?: string
): Promise<{ data: Subscription }> {
  return delay().then(async () => {
    const data = await mockPause(id, reason, until)
    console.log('[Subscription] 暂停订阅成功:', data.product.name)
    return { data }
  })
}

export function resumeSubscription(
  id: number
): Promise<{ data: Subscription }> {
  return delay().then(async () => {
    const data = await mockResume(id)
    console.log('[Subscription] 恢复订阅成功:', data.product.name)
    return { data }
  })
}

export function cancelSubscription(
  id: number
): Promise<{ data: void }> {
  return delay().then(async () => {
    await mockCancel(id)
    console.log('[Subscription] 取消订阅成功，ID:', id)
    return { data: undefined as void }
  })
}

export function skipNextDelivery(
  id: number
): Promise<{ data: Subscription }> {
  return delay().then(async () => {
    const data = await mockSkip(id)
    console.log('[Subscription] 跳过下次配送成功:', data.product.name)
    return { data }
  })
}
