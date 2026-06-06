import type { PresaleProduct, PresaleDay, Reservation } from '@/types'
import dayjs from 'dayjs'

const img = (prompt: string) =>
  `https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=${encodeURIComponent(prompt)}&image_size=square_hd`

function getFutureDate(days: number): Date {
  const date = new Date()
  date.setDate(date.getDate() + days)
  return date
}

function formatDate(date: Date): string {
  return dayjs(date).format('YYYY-MM-DD')
}

function getWeekday(date: Date): string {
  const weekdays = ['周日', '周一', '周二', '周三', '周四', '周五', '周六']
  return weekdays[date.getDay()]
}

const seasonProducts = [
  {
    name: '云南夏黑葡萄',
    subtitle: '无籽提子 甜蜜多汁',
    price: 29.9,
    originalPrice: 45.0,
    images: [
      img('fresh black grapes on vine, Yunnan summer, close-up'),
      img('bowl of black seedless grapes, product photo'),
      img('handful of black grapes, food photography')
    ],
    categoryId: 1,
    specs: [{ name: '规格', values: ['2斤装', '5斤装'] }],
    seasonTag: '应季新品',
    description: '云南高原种植，日照充足，自然成熟，无籽脆甜'
  },
  {
    name: '四川龙泉驿水蜜桃',
    subtitle: '软嫩多汁 香甜如蜜',
    price: 35.8,
    originalPrice: 58.0,
    images: [
      img('fresh ripe peaches on tree, Sichuan orchard, sunlight'),
      img('juicy peach sliced open, showing flesh, food photography'),
      img('box of Longquan peaches, product photo')
    ],
    categoryId: 1,
    specs: [{ name: '规格', values: ['5斤装', '8斤装'] }],
    seasonTag: '产地直发',
    description: '四川龙泉驿正宗水蜜桃，软嫩剥皮，香甜多汁'
  },
  {
    name: '广东妃子笑荔枝',
    subtitle: '肉厚核小 清甜爽口',
    price: 42.8,
    originalPrice: 68.0,
    images: [
      img('fresh lychees on branch, Guangdong orchard, red fruit'),
      img('peeled lychee showing white flesh, close-up'),
      img('bowl of fresh lychees, product photo')
    ],
    categoryId: 1,
    specs: [{ name: '规格', values: ['3斤装', '5斤装'] }],
    seasonTag: '限时尝鲜',
    description: '广东妃子笑荔枝，果肉晶莹剔透，清甜多汁'
  },
  {
    name: '浙江杨梅',
    subtitle: '酸甜适口 肉质细嫩',
    price: 58.0,
    originalPrice: 88.0,
    images: [
      img('fresh red bayberries on tree, Zhejiang farm, close-up'),
      img('bowl of fresh yangmei, purple red fruit'),
      img('bayberry product photo, white background')
    ],
    categoryId: 1,
    specs: [{ name: '规格', values: ['2斤装', '4斤装'] }],
    seasonTag: '当季珍稀',
    description: '浙江仙居杨梅，个大饱满，酸甜可口，营养丰富'
  },
  {
    name: '新疆哈密瓜',
    subtitle: '脆甜多汁 果肉细腻',
    price: 25.8,
    originalPrice: 39.9,
    images: [
      img('whole Hami melon, Xinjiang, yellow skin, net pattern'),
      img('sliced Hami melon showing orange flesh, food photography'),
      img('Hami melon product photo, white background')
    ],
    categoryId: 1,
    specs: [{ name: '规格', values: ['4-5斤/个', '8-9斤/个'] }],
    seasonTag: '产地直发',
    description: '新疆哈密瓜，日照时间长，糖分充足，脆甜爽口'
  },
  {
    name: '山东樱桃',
    subtitle: '鲜红饱满 脆甜可口',
    price: 68.0,
    originalPrice: 98.0,
    images: [
      img('fresh red cherries on tree, Shandong orchard, close-up'),
      img('bowl of fresh cherries, product photo'),
      img('handful of red cherries, food photography')
    ],
    categoryId: 1,
    specs: [{ name: '规格', values: ['2斤装', '3斤装'] }],
    seasonTag: '应季新品',
    description: '山东烟台大樱桃，自然成熟，脆甜多汁，果肉紧实'
  },
  {
    name: '广西芒果',
    subtitle: '果肉细腻 香气浓郁',
    price: 28.8,
    originalPrice: 45.0,
    images: [
      img('ripe mangoes on tree, Guangxi tropical farm'),
      img('sliced mango showing yellow flesh, food photography'),
      img('box of fresh mangoes, product photo')
    ],
    categoryId: 1,
    specs: [{ name: '规格', values: ['5斤装', '10斤装'] }],
    seasonTag: '当季热卖',
    description: '广西百色芒果，果肉金黄，香甜细腻，果香四溢'
  },
  {
    name: '福建杨梅',
    subtitle: '个大色艳 酸甜多汁',
    price: 49.9,
    originalPrice: 78.0,
    images: [
      img('fresh waxberries on tree, Fujian farm, red fruit'),
      img('bowl of fresh waxberries, product photo'),
      img('waxberry close-up, food photography')
    ],
    categoryId: 1,
    specs: [{ name: '规格', values: ['2斤装', '4斤装'] }],
    seasonTag: '产地直发',
    description: '福建漳州杨梅，果大核小，酸甜适中，肉质鲜嫩'
  },
  {
    name: '湖北小龙虾',
    subtitle: '肥美鲜活 肉质弹嫩',
    price: 88.0,
    originalPrice: 128.0,
    images: [
      img('live crayfish in water, Hubei aquaculture farm'),
      img('cooked spicy crayfish, Chinese food, red color'),
      img('fresh crayfish product photo')
    ],
    categoryId: 4,
    specs: [{ name: '规格', values: ['3斤装', '5斤装'] }],
    seasonTag: '应季上市',
    description: '湖北潜江清水小龙虾，个大体肥，肉质饱满，鲜活直达'
  },
  {
    name: '江苏大闸蟹',
    subtitle: '膏满黄肥 鲜美无比',
    price: 168.0,
    originalPrice: 258.0,
    images: [
      img('live hairy crabs, Jiangsu Yangcheng Lake, fresh water'),
      img('steamed hairy crab with golden roe, Chinese cuisine'),
      img('hairy crab gift box, premium seafood')
    ],
    categoryId: 4,
    specs: [{ name: '规格', values: ['4只装', '8只装'] }],
    seasonTag: '预售开启',
    description: '江苏阳澄湖大闸蟹，金爪黄毛，膏满黄肥，正宗产地'
  },
  {
    name: '云南松茸',
    subtitle: '野生珍稀 香气浓郁',
    price: 198.0,
    originalPrice: 298.0,
    images: [
      img('fresh matsutake mushroom, Yunnan wild forest, close-up'),
      img('sliced matsutake mushroom, gourmet food photography'),
      img('premium matsutake gift box, product photo')
    ],
    categoryId: 2,
    specs: [{ name: '规格', values: ['500g', '1kg'] }],
    seasonTag: '珍稀限量',
    description: '云南香格里拉野生松茸，菌香浓郁，营养丰富'
  },
  {
    name: '浙江竹笋',
    subtitle: '鲜嫩爽口 营养丰富',
    price: 18.8,
    originalPrice: 28.0,
    images: [
      img('fresh bamboo shoots, Zhejiang mountain, spring harvest'),
      img('peeled bamboo shoots, white background product photo'),
      img('cooked bamboo shoots dish, Chinese cuisine')
    ],
    categoryId: 2,
    specs: [{ name: '规格', values: ['3斤装', '5斤装'] }],
    seasonTag: '应季新品',
    description: '浙江临安天目山竹笋，鲜嫩爽口，自然清香'
  },
  {
    name: '山东樱桃番茄',
    subtitle: '酸甜可口 小巧玲珑',
    price: 15.8,
    originalPrice: 25.0,
    images: [
      img('cherry tomatoes on vine, Shandong greenhouse, fresh'),
      img('bowl of colorful cherry tomatoes, product photo'),
      img('cherry tomato close-up, food photography')
    ],
    categoryId: 2,
    specs: [{ name: '规格', values: ['2斤装', '4斤装'] }],
    seasonTag: '当季热卖',
    description: '山东寿光樱桃番茄，酸甜可口，皮薄汁多，营养丰富'
  },
  {
    name: '海南黄皮',
    subtitle: '酸甜开胃 生津止渴',
    price: 32.8,
    originalPrice: 48.0,
    images: [
      img('fresh wampee fruit on tree, Hainan tropical, yellow fruit'),
      img('bowl of fresh wampee, product photo'),
      img('wampee fruit close-up, food photography')
    ],
    categoryId: 1,
    specs: [{ name: '规格', values: ['2斤装', '4斤装'] }],
    seasonTag: '限时尝鲜',
    description: '海南黄皮果，酸甜开胃，生津止渴，夏季消暑佳品'
  }
]

let productIdCounter = 300
let presaleIdCounter = 1000

function createPresaleProduct(
  baseProduct: typeof seasonProducts[0],
  saleDate: Date,
  saleHour: number = 10
): PresaleProduct {
  const saleTime = new Date(saleDate)
  saleTime.setHours(saleHour, 0, 0, 0)

  const endTime = new Date(saleTime)
  endTime.setHours(endTime.getHours() + 48)

  const productId = productIdCounter++
  const presaleId = presaleIdCounter++

  return {
    id: presaleId,
    productId,
    product: {
      id: productId,
      name: baseProduct.name,
      subtitle: baseProduct.subtitle,
      price: baseProduct.price,
      originalPrice: baseProduct.originalPrice,
      images: baseProduct.images,
      categoryId: baseProduct.categoryId,
      specs: baseProduct.specs,
      sales: Math.floor(Math.random() * 500) + 100,
      rating: 4.7 + Math.random() * 0.3,
      tags: [baseProduct.seasonTag, '预售'],
      reviews: []
    },
    presalePrice: baseProduct.price,
    originalPrice: baseProduct.originalPrice,
    saleTime: saleTime.toISOString(),
    endTime: endTime.toISOString(),
    stock: Math.floor(Math.random() * 200) + 50,
    reservationCount: Math.floor(Math.random() * 300) + 50,
    seasonTag: baseProduct.seasonTag,
    description: baseProduct.description
  }
}

function generatePresaleDays(): PresaleDay[] {
  const days: PresaleDay[] = []
  const today = new Date()

  for (let i = 0; i < 7; i++) {
    const date = getFutureDate(i)
    const dateStr = formatDate(date)
    const weekday = getWeekday(date)
    const isToday = i === 0

    let products: PresaleProduct[] = []

    if (i === 0) {
      products = [
        createPresaleProduct(seasonProducts[0], date, 10),
        createPresaleProduct(seasonProducts[1], date, 14),
        createPresaleProduct(seasonProducts[2], date, 18)
      ]
    } else if (i === 1) {
      products = [
        createPresaleProduct(seasonProducts[3], date, 10),
        createPresaleProduct(seasonProducts[4], date, 14),
        createPresaleProduct(seasonProducts[5], date, 18)
      ]
    } else if (i === 2) {
      products = [
        createPresaleProduct(seasonProducts[6], date, 10),
        createPresaleProduct(seasonProducts[7], date, 14),
        createPresaleProduct(seasonProducts[8], date, 18)
      ]
    } else if (i === 3) {
      products = [
        createPresaleProduct(seasonProducts[9], date, 10),
        createPresaleProduct(seasonProducts[10], date, 14),
        createPresaleProduct(seasonProducts[11], date, 18)
      ]
    } else if (i === 4) {
      products = [
        createPresaleProduct(seasonProducts[12], date, 10),
        createPresaleProduct(seasonProducts[13], date, 14),
        createPresaleProduct(seasonProducts[0], date, 18)
      ]
    } else if (i === 5) {
      products = [
        createPresaleProduct(seasonProducts[1], date, 10),
        createPresaleProduct(seasonProducts[2], date, 14),
        createPresaleProduct(seasonProducts[3], date, 18)
      ]
    } else {
      products = [
        createPresaleProduct(seasonProducts[4], date, 10),
        createPresaleProduct(seasonProducts[5], date, 14),
        createPresaleProduct(seasonProducts[6], date, 18)
      ]
    }

    days.push({
      date: dateStr,
      weekday,
      isToday,
      products
    })
  }

  return days
}

export const presaleDays: PresaleDay[] = generatePresaleDays()

export const mockReservations: Reservation[] = []

export function getPresaleCalendar(): Promise<PresaleDay[]> {
  return new Promise((resolve) => {
    setTimeout(() => resolve(presaleDays), 300)
  })
}

export function getPresaleProductsByDate(date: string): Promise<PresaleProduct[]> {
  return new Promise((resolve) => {
    setTimeout(() => {
      const day = presaleDays.find((d) => d.date === date)
      resolve(day?.products || [])
    }, 300)
  })
}

export function getPresaleProductById(id: number): Promise<PresaleProduct | undefined> {
  return new Promise((resolve) => {
    setTimeout(() => {
      for (const day of presaleDays) {
        const product = day.products.find((p) => p.id === id)
        if (product) {
          resolve(product)
          return
        }
      }
      resolve(undefined)
    }, 300)
  })
}

export function createReservation(presaleProductId: number): Promise<Reservation> {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      let presaleProduct: PresaleProduct | undefined
      for (const day of presaleDays) {
        const product = day.products.find((p) => p.id === presaleProductId)
        if (product) {
          presaleProduct = product
          break
        }
      }

      if (!presaleProduct) {
        reject(new Error('预售商品不存在'))
        return
      }

      const existing = mockReservations.find((r) => r.presaleProductId === presaleProductId)
      if (existing) {
        reject(new Error('已预约该商品'))
        return
      }

      const reservation: Reservation = {
        id: Date.now(),
        presaleProductId,
        productName: presaleProduct.product.name,
        productImage: presaleProduct.product.images[0],
        saleTime: presaleProduct.saleTime,
        createdAt: new Date().toISOString(),
        notified: false
      }

      mockReservations.push(reservation)
      presaleProduct.reservationCount++
      resolve(reservation)
    }, 300)
  })
}

export function cancelReservation(presaleProductId: number): Promise<void> {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const index = mockReservations.findIndex((r) => r.presaleProductId === presaleProductId)
      if (index === -1) {
        reject(new Error('未预约该商品'))
        return
      }

      mockReservations.splice(index, 1)

      for (const day of presaleDays) {
        const product = day.products.find((p) => p.id === presaleProductId)
        if (product && product.reservationCount > 0) {
          product.reservationCount--
          break
        }
      }

      resolve()
    }, 300)
  })
}

export function getMyReservations(): Promise<Reservation[]> {
  return new Promise((resolve) => {
    setTimeout(() => resolve([...mockReservations]), 300)
  })
}

export function checkReservationStatus(presaleProductId: number): Promise<boolean> {
  return new Promise((resolve) => {
    setTimeout(() => {
      const exists = mockReservations.some((r) => r.presaleProductId === presaleProductId)
      resolve(exists)
    }, 150)
  })
}
