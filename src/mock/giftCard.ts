import type { GiftCardDenomination, GiftCardTemplate, GiftCardOrder, CreateGiftCardOrderParams, GiftCardPaymentResult } from '@/types'
import dayjs from 'dayjs'

const img = (prompt: string) =>
  `https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=${encodeURIComponent(prompt)}&image_size=square_hd`

export const giftCardDenominations: GiftCardDenomination[] = [
  {
    id: 1,
    name: '心意礼卡',
    value: 100,
    price: 100,
    description: '新鲜好礼，心意满满',
    image: img('gift card with fruit and vegetable pattern, red theme, elegant design'),
    tag: '热销'
  },
  {
    id: 2,
    name: '臻享礼卡',
    value: 200,
    price: 200,
    description: '品质之选，尊享美味',
    image: img('premium gift card with gold border, fresh produce illustration'),
    tag: '推荐'
  },
  {
    id: 3,
    name: '盛宴礼卡',
    value: 500,
    price: 488,
    description: '馈赠佳品，礼重情更重',
    image: img('luxury gift card, red and gold design, premium food elements'),
    tag: '优惠'
  },
  {
    id: 4,
    name: '尊享礼卡',
    value: 1000,
    price: 958,
    description: '尊贵之选，尽享生鲜盛宴',
    image: img('exclusive gift card, elegant gold and deep red design'),
    tag: '限量'
  }
]

export const giftCardTemplates: GiftCardTemplate[] = [
  {
    id: 1,
    name: '经典红',
    theme: 'classic',
    coverImage: img('red gift card background with subtle pattern'),
    bgGradient: 'linear-gradient(135deg, #FF6B6B, #EE5A5A)',
    textColor: '#fff'
  },
  {
    id: 2,
    name: '活力橙',
    theme: 'vibrant',
    coverImage: img('orange gradient gift card background'),
    bgGradient: 'linear-gradient(135deg, #FF8C42, #FF6B35)',
    textColor: '#fff'
  },
  {
    id: 3,
    name: '清新绿',
    theme: 'fresh',
    coverImage: img('green gift card background with leaf patterns'),
    bgGradient: 'linear-gradient(135deg, #2DB87B, #1E9A63)',
    textColor: '#fff'
  },
  {
    id: 4,
    name: '典雅金',
    theme: 'elegant',
    coverImage: img('gold gift card background luxury design'),
    bgGradient: 'linear-gradient(135deg, #FFD700, #FFB800)',
    textColor: '#333'
  },
  {
    id: 5,
    name: '浪漫粉',
    theme: 'romantic',
    coverImage: img('pink gift card background with heart pattern'),
    bgGradient: 'linear-gradient(135deg, #FF9AA2, #FF6B9D)',
    textColor: '#fff'
  },
  {
    id: 6,
    name: '深邃蓝',
    theme: 'calm',
    coverImage: img('deep blue gift card background elegant'),
    bgGradient: 'linear-gradient(135deg, #667eea, #764ba2)',
    textColor: '#fff'
  }
]

const defaultMessages = [
  '亲爱的，愿这份新鲜好礼，为你带来美好的一天！',
  '感恩有你，送你一份健康与美味～',
  '生日快乐！愿你每天都有新鲜好心情！',
  '节日快乐！用这份礼卡挑选你喜欢的美味吧～',
  '感谢你的陪伴，送你一份心意，愿你喜欢！'
]

let orderIdCounter = 2000
let cardCodeCounter = 100000

function generateCardCode(): string {
  const prefix = 'FC'
  const code = String(cardCodeCounter++).padStart(8, '0')
  return `${prefix}${code}`
}

function generateOrderNo(): string {
  const date = dayjs().format('YYYYMMDD')
  const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0')
  return `GC${date}${random}`
}

const mockGiftCardOrders: GiftCardOrder[] = []

export function getGiftCardDenominations(): Promise<GiftCardDenomination[]> {
  return new Promise((resolve) => {
    setTimeout(() => resolve([...giftCardDenominations]), 300)
  })
}

export function getGiftCardTemplates(): Promise<GiftCardTemplate[]> {
  return new Promise((resolve) => {
    setTimeout(() => resolve([...giftCardTemplates]), 300)
  })
}

export function getRandomMessage(): Promise<string> {
  return new Promise((resolve) => {
    setTimeout(() => {
      const message = defaultMessages[Math.floor(Math.random() * defaultMessages.length)]
      resolve(message)
    }, 100)
  })
}

export function createGiftCardOrder(params: CreateGiftCardOrderParams): Promise<{ orderId: number; orderNo: string; payAmount: number }> {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const denomination = giftCardDenominations.find(d => d.id === params.denominationId)
      const template = giftCardTemplates.find(t => t.id === params.templateId)

      if (!denomination) {
        reject(new Error('面额不存在'))
        return
      }
      if (!template) {
        reject(new Error('模板不存在'))
        return
      }
      if (!params.recipient.name || !params.recipient.phone) {
        reject(new Error('请填写接收人信息'))
        return
      }

      const orderId = orderIdCounter++
      const orderNo = generateOrderNo()

      const order: GiftCardOrder = {
        id: orderId,
        orderNo,
        denominationId: params.denominationId,
        denomination,
        templateId: params.templateId,
        template,
        recipient: params.recipient,
        message: params.message,
        totalAmount: denomination.price,
        payAmount: denomination.price,
        status: 'pending',
        validFrom: dayjs().toISOString(),
        validTo: dayjs().add(1, 'year').toISOString(),
        createdAt: dayjs().toISOString()
      }

      mockGiftCardOrders.push(order)

      resolve({
        orderId,
        orderNo,
        payAmount: denomination.price
      })
    }, 300)
  })
}

export function payGiftCardOrder(
  orderId: number,
  payMethod: 'wechat' | 'alipay' | 'balance'
): Promise<GiftCardPaymentResult> {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const order = mockGiftCardOrders.find(o => o.id === orderId)
      if (!order) {
        reject(new Error('订单不存在'))
        return
      }
      if (order.status !== 'pending') {
        reject(new Error('订单状态异常'))
        return
      }

      order.status = 'paid'
      order.payMethod = payMethod
      order.payTime = dayjs().toISOString()
      order.cardCode = generateCardCode()

      resolve({
        orderId,
        status: 'success',
        payMethod,
        payTime: order.payTime,
        cardCode: order.cardCode
      })
    }, 800)
  })
}

export function getGiftCardOrder(orderId: number): Promise<GiftCardOrder | undefined> {
  return new Promise((resolve) => {
    setTimeout(() => {
      const order = mockGiftCardOrders.find(o => o.id === orderId)
      resolve(order ? { ...order } : undefined)
    }, 300)
  })
}

export function getMyGiftCardOrders(type: 'sent' | 'received' = 'sent'): Promise<GiftCardOrder[]> {
  return new Promise((resolve) => {
    setTimeout(() => {
      const orders = mockGiftCardOrders
        .filter(o => type === 'sent' ? true : o.status === 'received')
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      resolve([...orders])
    }, 300)
  })
}

export function sendGiftCard(orderId: number): Promise<void> {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const order = mockGiftCardOrders.find(o => o.id === orderId)
      if (!order) {
        reject(new Error('订单不存在'))
        return
      }
      if (order.status !== 'paid') {
        reject(new Error('订单未支付，无法发送'))
        return
      }

      order.status = 'sent'
      resolve()
    }, 300)
  })
}

export function claimGiftCard(cardCode: string, phone: string): Promise<GiftCardOrder> {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const order = mockGiftCardOrders.find(o => o.cardCode === cardCode)
      if (!order) {
        reject(new Error('礼品卡不存在'))
        return
      }
      if (order.status === 'received') {
        reject(new Error('礼品卡已被领取'))
        return
      }
      if (order.status !== 'sent') {
        reject(new Error('礼品卡状态异常'))
        return
      }
      if (order.recipient.phone !== phone) {
        reject(new Error('手机号不匹配，请确认'))
        return
      }

      order.status = 'received'
      resolve({ ...order })
    }, 300)
  })
}
