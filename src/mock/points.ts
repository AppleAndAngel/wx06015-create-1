import type { PointsProduct, PointsRecord, ExchangeRecord } from '@/types'

export const pointsProducts: PointsProduct[] = [
  {
    id: 'p1',
    name: '原味坚果礼盒',
    category: 'snack',
    categoryName: '小食',
    points: 500,
    originalPrice: 68,
    image: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=premium%20mixed%20nuts%20gift%20box%20elegant%20packaging&image_size=square_hd',
    description: '精选夏威夷果、腰果、杏仁等多种坚果，健康营养',
    stock: 100,
    sales: 256,
    exchangeLimit: 2,
    tags: ['热销', '健康']
  },
  {
    id: 'p2',
    name: '手工蔓越莓饼干',
    category: 'snack',
    categoryName: '小食',
    points: 200,
    originalPrice: 28,
    image: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=homemade%20cranberry%20cookies%20on%20wooden%20plate&image_size=square_hd',
    description: '新鲜烘焙，酸甜可口，独立小包装',
    stock: 200,
    sales: 512,
    exchangeLimit: 5,
    tags: ['新品', '限时']
  },
  {
    id: 'p3',
    name: '进口冻干水果干',
    category: 'snack',
    categoryName: '小食',
    points: 350,
    originalPrice: 45,
    image: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=freeze%20dried%20mixed%20fruits%20colorful%20packaging&image_size=square_hd',
    description: '草莓、芒果、蓝莓混合装，非油炸更健康',
    stock: 80,
    sales: 189,
    exchangeLimit: 3,
    tags: ['健康']
  },
  {
    id: 'p4',
    name: '10元运费券',
    category: 'coupon',
    categoryName: '运费券',
    points: 100,
    image: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=green%20shipping%20coupon%20voucher%2010%20yuan&image_size=square_hd',
    description: '全场通用，满99元可用，有效期30天',
    stock: 999,
    sales: 1024,
    validDays: 30,
    tags: ['热门']
  },
  {
    id: 'p5',
    name: '20元运费券',
    category: 'coupon',
    categoryName: '运费券',
    points: 180,
    image: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=green%20shipping%20coupon%20voucher%2020%20yuan&image_size=square_hd',
    description: '全场通用，满199元可用，有效期30天',
    stock: 500,
    sales: 768,
    validDays: 30,
    tags: ['超值']
  },
  {
    id: 'p6',
    name: '免运费券',
    category: 'coupon',
    categoryName: '运费券',
    points: 300,
    image: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=golden%20free%20shipping%20coupon%20voucher&image_size=square_hd',
    description: '无门槛免运费，有效期15天',
    stock: 100,
    sales: 320,
    validDays: 15,
    exchangeLimit: 1,
    tags: ['限量']
  },
  {
    id: 'p7',
    name: '品牌定制帆布袋',
    category: 'merchandise',
    categoryName: '周边好物',
    points: 800,
    originalPrice: 99,
    image: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=custom%20canvas%20tote%20bag%20eco%20friendly&image_size=square_hd',
    description: '纯棉帆布，环保时尚，大容量设计',
    stock: 50,
    sales: 128,
    tags: ['限量', '新品']
  },
  {
    id: 'p8',
    name: '便携保温杯',
    category: 'merchandise',
    categoryName: '周边好物',
    points: 1200,
    originalPrice: 158,
    image: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=stainless%20steel%20vacuum%20flask%20minimalist%20design&image_size=square_hd',
    description: '304不锈钢，12小时保温，350ml便携款',
    stock: 30,
    sales: 86,
    exchangeLimit: 1,
    tags: ['爆款']
  },
  {
    id: 'p9',
    name: '创意水果叉套装',
    category: 'merchandise',
    categoryName: '周边好物',
    points: 400,
    originalPrice: 49,
    image: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=cute%20fruit%20fork%20set%20colorful%20design&image_size=square_hd',
    description: '食品级不锈钢，6支装，可爱造型',
    stock: 150,
    sales: 234,
    tags: ['实用']
  },
  {
    id: 'p10',
    name: '定制手机支架',
    category: 'merchandise',
    categoryName: '周边好物',
    points: 250,
    originalPrice: 35,
    image: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=adjustable%20phone%20stand%20holder%20modern&image_size=square_hd',
    description: '可调节角度，防滑设计，追剧必备',
    stock: 200,
    sales: 456,
    tags: ['热销']
  }
]

export const initialPointsRecords: PointsRecord[] = [
  {
    id: 'pr1',
    type: 'earn',
    points: 500,
    description: '新用户注册赠送',
    createdAt: Date.now() - 30 * 24 * 60 * 60 * 1000
  },
  {
    id: 'pr2',
    type: 'earn',
    points: 120,
    description: '购物返积分',
    relatedId: 'order123',
    createdAt: Date.now() - 15 * 24 * 60 * 60 * 1000
  },
  {
    id: 'pr3',
    type: 'earn',
    points: 80,
    description: '每日签到',
    createdAt: Date.now() - 7 * 24 * 60 * 60 * 1000
  },
  {
    id: 'pr4',
    type: 'earn',
    points: 200,
    description: '评价返积分',
    relatedId: 'review456',
    createdAt: Date.now() - 3 * 24 * 60 * 60 * 1000
  }
]

export const initialExchangeRecords: ExchangeRecord[] = [
  {
    id: 'er1',
    product: pointsProducts[3],
    quantity: 2,
    totalPoints: 200,
    status: 'completed',
    statusText: '已完成',
    exchangedAt: Date.now() - 10 * 24 * 60 * 60 * 1000
  },
  {
    id: 'er2',
    product: pointsProducts[1],
    quantity: 1,
    totalPoints: 200,
    status: 'shipped',
    statusText: '已发货',
    exchangedAt: Date.now() - 2 * 24 * 60 * 60 * 1000,
    trackingNumber: 'SF1234567890',
    trackingCompany: '顺丰速运'
  }
]
