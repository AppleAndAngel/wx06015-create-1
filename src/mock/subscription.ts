import type {
  SubscriptionProduct,
  Subscription,
  SubscriptionCategory,
  SubscriptionCycle,
  Weekday,
  SubscriptionStatus,
} from '@/types'
import { products } from './products'
import { addresses } from './users'

const img = (prompt: string) =>
  `https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=${encodeURIComponent(prompt)}&image_size=square_hd`

function getProductById(id: number) {
  return products.find((p) => p.id === id) || products[0]
}

function addDays(date: Date, days: number): string {
  const result = new Date(date)
  result.setDate(result.getDate() + days)
  return result.toISOString().split('T')[0]
}

export const subscriptionCategories: SubscriptionCategory[] = [
  { id: 'all', name: '全部', icon: '📦' },
  { id: 'dairy', name: '乳制品', icon: '🥛' },
  { id: 'fruit', name: '水果', icon: '🍎' },
  { id: 'vegetable', name: '蔬菜', icon: '🥬' },
  { id: 'grain', name: '粮油', icon: '🍚' },
  { id: 'daily', name: '日用品', icon: '🧴' },
]

export const subscriptionProducts: SubscriptionProduct[] = [
  {
    id: 1,
    productId: 13,
    product: getProductById(13),
    subscribePrice: 8.9,
    originalPrice: 13.0,
    discount: '7折',
    description: '每日新鲜配送，当天生产，凌晨直达。周期订阅更划算，立省31%',
    availableCycles: ['daily', 'weekly', 'biweekly'],
    defaultCycle: 'daily',
    minQuantity: 1,
    maxQuantity: 5,
    tags: ['每日鲜', '畅销'],
    totalSubscribers: 2356,
  },
  {
    id: 2,
    productId: 8,
    product: getProductById(8),
    subscribePrice: 22.9,
    originalPrice: 32.0,
    discount: '72折',
    description: '散养土鸡蛋，蛋黄饱满，营养丰富。每周配送更新鲜',
    availableCycles: ['weekly', 'biweekly', 'monthly'],
    defaultCycle: 'weekly',
    minQuantity: 1,
    maxQuantity: 3,
    tags: ['有机', '高订阅'],
    totalSubscribers: 1892,
  },
  {
    id: 3,
    productId: 1,
    product: getProductById(1),
    subscribePrice: 10.8,
    originalPrice: 18.9,
    discount: '57折',
    description: '山东红富士，脆甜多汁。每周配送保证新鲜',
    availableCycles: ['weekly', 'biweekly'],
    defaultCycle: 'weekly',
    minQuantity: 1,
    maxQuantity: 4,
    tags: ['产地直发', '当季'],
    totalSubscribers: 1567,
  },
  {
    id: 4,
    productId: 3,
    product: getProductById(3),
    subscribePrice: 29.9,
    originalPrice: 49.9,
    discount: '6折',
    description: '云南高山蓝莓，颗颗饱满花青素满满。每周一盒健康生活',
    availableCycles: ['weekly', 'biweekly'],
    defaultCycle: 'weekly',
    minQuantity: 1,
    maxQuantity: 2,
    tags: ['有机', '高订阅'],
    totalSubscribers: 987,
  },
  {
    id: 5,
    productId: 16,
    product: getProductById(16),
    subscribePrice: 35.9,
    originalPrice: 55.0,
    discount: '65折',
    description: '五常稻花香大米，软糯香甜。每月配送更省心',
    availableCycles: ['biweekly', 'monthly'],
    defaultCycle: 'monthly',
    minQuantity: 1,
    maxQuantity: 2,
    tags: ['产地直发'],
    totalSubscribers: 2104,
  },
  {
    id: 6,
    productId: 4,
    product: getProductById(4),
    subscribePrice: 12.8,
    originalPrice: 22.0,
    discount: '58折',
    description: '有机小番茄，皮薄汁多酸甜可口。每周新鲜直达',
    availableCycles: ['weekly', 'biweekly'],
    defaultCycle: 'weekly',
    minQuantity: 1,
    maxQuantity: 3,
    tags: ['有机', '畅销'],
    totalSubscribers: 1256,
  },
  {
    id: 7,
    productId: 17,
    product: getProductById(17),
    subscribePrice: 69.9,
    originalPrice: 99.0,
    discount: '71折',
    description: '物理压榨花生油，花生浓香。双月配送够用',
    availableCycles: ['monthly'],
    defaultCycle: 'monthly',
    minQuantity: 1,
    maxQuantity: 2,
    tags: ['品质之选'],
    totalSubscribers: 876,
  },
  {
    id: 8,
    productId: 2,
    product: getProductById(2),
    subscribePrice: 25.9,
    originalPrice: 39.9,
    discount: '65折',
    description: '海南金煌芒果，果肉细腻甜度爆表。应季订阅',
    availableCycles: ['weekly', 'biweekly'],
    defaultCycle: 'weekly',
    minQuantity: 1,
    maxQuantity: 2,
    tags: ['产地直发', '当季'],
    totalSubscribers: 654,
  },
  {
    id: 9,
    productId: 23,
    product: getProductById(23),
    subscribePrice: 32.9,
    originalPrice: 45.0,
    discount: '73折',
    description: '舟山小眼带鱼，鲜嫩肥美。每周海鲜爱好者必备',
    availableCycles: ['weekly', 'biweekly'],
    defaultCycle: 'biweekly',
    minQuantity: 1,
    maxQuantity: 3,
    tags: ['产地直发'],
    totalSubscribers: 432,
  },
  {
    id: 10,
    productId: 15,
    product: getProductById(15),
    subscribePrice: 9.9,
    originalPrice: 16.8,
    discount: '59折',
    description: '曼可顿全麦面包，粗粮健康饱腹感强。每周新鲜烘焙',
    availableCycles: ['weekly'],
    defaultCycle: 'weekly',
    minQuantity: 1,
    maxQuantity: 2,
    tags: ['健康之选', '畅销'],
    totalSubscribers: 1789,
  },
]

function generateDeliveryRecords(
  startDate: string,
  cycle: SubscriptionCycle,
  count: number,
  completed: number
) {
  const records = []
  const baseDate = new Date(startDate)
  const interval = cycle === 'daily' ? 1 : cycle === 'weekly' ? 7 : cycle === 'biweekly' ? 14 : 30

  for (let i = 0; i < count; i++) {
    const deliveryDate = addDays(baseDate, i * interval)
    const isPast = i < completed
    records.push({
      id: i + 1,
      deliveryDate,
      status: isPast ? 'delivered' : i === completed ? 'pending' : 'pending',
      actualDeliveryDate: isPast ? deliveryDate : undefined,
      orderId: isPast ? 1000 + i : undefined,
    })
  }
  return records
}

export const mySubscriptions: Subscription[] = [
  {
    id: 1,
    subscriptionProductId: 1,
    product: getProductById(13),
    subscribePrice: 8.9,
    originalPrice: 13.0,
    specValues: { 规格: '950ml', 类型: '全脂' },
    quantity: 1,
    cycle: 'daily',
    weekdays: [1, 2, 3, 4, 5],
    startTime: '2026-05-01',
    nextDeliveryDate: addDays(new Date(), 1),
    status: 'active',
    address: addresses[0],
    totalDeliveries: 30,
    completedDeliveries: 28,
    totalSaved: 114.8,
    deliveryRecords: generateDeliveryRecords('2026-05-01', 'daily', 30, 28),
    createdAt: '2026-04-28',
  },
  {
    id: 2,
    subscriptionProductId: 2,
    product: getProductById(8),
    subscribePrice: 22.9,
    originalPrice: 32.0,
    specValues: { 规格: '30枚装', 品种: '土鸡蛋' },
    quantity: 1,
    cycle: 'weekly',
    weekdays: [6],
    startTime: '2026-05-01',
    nextDeliveryDate: addDays(new Date(), 3),
    status: 'active',
    address: addresses[0],
    totalDeliveries: 6,
    completedDeliveries: 5,
    totalSaved: 54.6,
    deliveryRecords: generateDeliveryRecords('2026-05-01', 'weekly', 6, 5),
    createdAt: '2026-04-25',
  },
  {
    id: 3,
    subscriptionProductId: 3,
    product: getProductById(1),
    subscribePrice: 10.8,
    originalPrice: 18.9,
    specValues: { 规格: '5斤装', 产地: '山东烟台' },
    quantity: 2,
    cycle: 'biweekly',
    weekdays: [0],
    startTime: '2026-05-10',
    nextDeliveryDate: addDays(new Date(), 5),
    status: 'paused',
    address: addresses[0],
    totalDeliveries: 4,
    completedDeliveries: 3,
    totalSaved: 64.8,
    deliveryRecords: generateDeliveryRecords('2026-05-10', 'biweekly', 4, 3),
    createdAt: '2026-05-08',
    pausedReason: '最近不在家',
    pausedUntil: addDays(new Date(), 14),
  },
]

export function getSubscriptionCategories(): Promise<SubscriptionCategory[]> {
  return Promise.resolve(subscriptionCategories)
}

export function getSubscriptionProducts(
  categoryId?: string
): Promise<SubscriptionProduct[]> {
  let result = [...subscriptionProducts]
  if (categoryId && categoryId !== 'all') {
    const product = getProductById(subscriptionProducts[0].productId)
    result = subscriptionProducts.filter((sp) => {
      const p = getProductById(sp.productId)
      if (categoryId === 'dairy') return p.categoryId === 5
      if (categoryId === 'fruit') return p.categoryId === 1
      if (categoryId === 'vegetable') return p.categoryId === 2
      if (categoryId === 'grain') return p.categoryId === 6
      if (categoryId === 'daily') return p.categoryId === 7 || p.categoryId === 8
      return true
    })
  }
  return Promise.resolve(result)
}

export function getSubscriptionProductById(
  id: number
): Promise<SubscriptionProduct | undefined> {
  return Promise.resolve(subscriptionProducts.find((p) => p.id === id))
}

export function getMySubscriptions(
  status?: SubscriptionStatus
): Promise<Subscription[]> {
  let result = [...mySubscriptions]
  if (status) {
    result = result.filter((s) => s.status === status)
  }
  return Promise.resolve(result)
}

export function getSubscriptionById(
  id: number
): Promise<Subscription | undefined> {
  return Promise.resolve(mySubscriptions.find((s) => s.id === id))
}

export function createSubscription(
  params: any
): Promise<Subscription> {
  const subscriptionProduct = subscriptionProducts.find(
    (p) => p.id === params.subscriptionProductId
  )
  if (!subscriptionProduct) {
    throw new Error('订阅商品不存在')
  }

  const address = addresses.find((a) => a.id === params.addressId) || addresses[0]

  const newSubscription: Subscription = {
    id: mySubscriptions.length + 1,
    subscriptionProductId: params.subscriptionProductId,
    product: subscriptionProduct.product,
    subscribePrice: subscriptionProduct.subscribePrice,
    originalPrice: subscriptionProduct.originalPrice,
    specValues: params.specValues,
    quantity: params.quantity,
    cycle: params.cycle,
    weekdays: params.weekdays,
    startTime: new Date().toISOString().split('T')[0],
    nextDeliveryDate: addDays(new Date(), 1),
    status: 'active',
    address,
    totalDeliveries: 0,
    completedDeliveries: 0,
    totalSaved: 0,
    deliveryRecords: [],
    createdAt: new Date().toISOString(),
  }

  mySubscriptions.unshift(newSubscription)
  return Promise.resolve(newSubscription)
}

export function updateSubscription(
  id: number,
  params: any
): Promise<Subscription> {
  const index = mySubscriptions.findIndex((s) => s.id === id)
  if (index === -1) {
    throw new Error('订阅不存在')
  }

  if (params.quantity !== undefined) {
    mySubscriptions[index].quantity = params.quantity
  }
  if (params.cycle) {
    mySubscriptions[index].cycle = params.cycle
  }
  if (params.weekdays) {
    mySubscriptions[index].weekdays = params.weekdays
  }
  if (params.nextDeliveryDate) {
    mySubscriptions[index].nextDeliveryDate = params.nextDeliveryDate
  }
  if (params.addressId) {
    const address = addresses.find((a) => a.id === params.addressId)
    if (address) {
      mySubscriptions[index].address = address
    }
  }

  return Promise.resolve(mySubscriptions[index])
}

export function pauseSubscription(
  id: number,
  reason?: string,
  until?: string
): Promise<Subscription> {
  const index = mySubscriptions.findIndex((s) => s.id === id)
  if (index === -1) {
    throw new Error('订阅不存在')
  }

  mySubscriptions[index].status = 'paused'
  mySubscriptions[index].pausedReason = reason
  mySubscriptions[index].pausedUntil = until

  return Promise.resolve(mySubscriptions[index])
}

export function resumeSubscription(id: number): Promise<Subscription> {
  const index = mySubscriptions.findIndex((s) => s.id === id)
  if (index === -1) {
    throw new Error('订阅不存在')
  }

  mySubscriptions[index].status = 'active'
  mySubscriptions[index].pausedReason = undefined
  mySubscriptions[index].pausedUntil = undefined

  return Promise.resolve(mySubscriptions[index])
}

export function cancelSubscription(id: number): Promise<void> {
  const index = mySubscriptions.findIndex((s) => s.id === id)
  if (index === -1) {
    throw new Error('订阅不存在')
  }

  mySubscriptions[index].status = 'cancelled'

  return Promise.resolve()
}

export function skipNextDelivery(id: number): Promise<Subscription> {
  const index = mySubscriptions.findIndex((s) => s.id === id)
  if (index === -1) {
    throw new Error('订阅不存在')
  }

  const sub = mySubscriptions[index]
  const currentNextDate = new Date(sub.nextDeliveryDate)
  const interval =
    sub.cycle === 'daily'
      ? 1
      : sub.cycle === 'weekly'
      ? 7
      : sub.cycle === 'biweekly'
      ? 14
      : 30
  sub.nextDeliveryDate = addDays(currentNextDate, interval)

  return Promise.resolve(sub)
}
