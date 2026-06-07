import { Product, Category } from '@/types/product'

export const categories: Category[] = [
  { id: '1', name: '新鲜水果', icon: '🍎' },
  { id: '2', name: '精品肉类', icon: '🥩' },
  { id: '3', name: '海鲜水产', icon: '🦐' },
  { id: '4', name: '禽蛋制品', icon: '🥚' },
  { id: '5', name: '新鲜蔬菜', icon: '🥬' },
  { id: '6', name: '奶制品', icon: '🥛' }
]

const foodImageIds = [292, 312, 326, 401, 431, 570, 580, 625, 835, 1080, 103, 119, 220, 225, 230]

const getImage = (id: number, w: number = 300, h: number = 300) =>
  `https://picsum.photos/id/${foodImageIds[id % foodImageIds.length]}/${w}/${h}`

export const products: Product[] = [
  {
    id: '1',
    name: '新疆阿克苏冰糖心苹果',
    category: '新鲜水果',
    categoryId: '1',
    price: 39.9,
    originalPrice: 59.9,
    unit: '5斤装',
    spec: '果径80-85mm',
    origin: '新疆阿克苏',
    weight: '约2.5kg',
    shelfLife: '15天',
    storage: '冷藏保存',
    rating: 4.9,
    reviewCount: 2856,
    sales: 15680,
    image: getImage(0),
    images: [getImage(0), getImage(1), getImage(2)],
    description: '正宗新疆阿克苏冰糖心苹果，日照充足，昼夜温差大，果肉细腻，甜度极高。自然成熟，无农药残留，孕妇小孩都可以放心吃。',
    tags: ['热销', '包邮', '坏果包赔'],
    reviews: [
      { id: '1', userName: '张**', rating: 5, content: '非常甜，真的有糖心，新鲜多汁！', date: '2024-01-15', images: [getImage(3, 200, 200)] },
      { id: '2', userName: '李**', rating: 5, content: '包装很好，每个苹果都有保护套，没有坏果。', date: '2024-01-14', images: [] }
    ]
  },
  {
    id: '2',
    name: '智利进口车厘子JJ级',
    category: '新鲜水果',
    categoryId: '1',
    price: 89.9,
    originalPrice: 129.9,
    unit: '2斤装',
    spec: 'JJ级 28-30mm',
    origin: '智利',
    weight: '约1kg',
    shelfLife: '7天',
    storage: '0-4℃冷藏',
    rating: 4.8,
    reviewCount: 1923,
    sales: 9876,
    image: getImage(1),
    images: [getImage(1), getImage(4), getImage(5)],
    description: '智利原装进口车厘子，JJ级大果，颗粒饱满，色泽红艳，口感脆甜。空运直达，新鲜度有保障。',
    tags: ['进口', '限时特惠', '顺丰冷链'],
    reviews: [
      { id: '1', userName: '王**', rating: 5, content: '果子很大很新鲜，甜中带酸，很好吃！', date: '2024-01-13', images: [] }
    ]
  },
  {
    id: '3',
    name: '海南金煌芒果',
    category: '新鲜水果',
    categoryId: '1',
    price: 45.9,
    originalPrice: 68.9,
    unit: '5斤装',
    spec: '单果400g以上',
    origin: '海南三亚',
    weight: '约2.5kg',
    shelfLife: '7-10天',
    storage: '常温存放',
    rating: 4.7,
    reviewCount: 1456,
    sales: 7654,
    image: getImage(2),
    images: [getImage(2), getImage(6), getImage(7)],
    description: '海南金煌芒，果肉肥厚，核小肉多，香甜软糯。自然成熟，不催熟不打蜡，健康美味。',
    tags: ['当季', '产地直发'],
    reviews: [
      { id: '1', userName: '陈**', rating: 4, content: '芒果很香，放了几天更甜了，不错。', date: '2024-01-12', images: [] }
    ]
  },
  {
    id: '4',
    name: '澳洲安格斯雪花牛肉',
    category: '精品肉类',
    categoryId: '2',
    price: 168.0,
    originalPrice: 218.0,
    unit: '500g装',
    spec: 'M5级眼肉牛排',
    origin: '澳大利亚',
    weight: '500g±20g',
    shelfLife: '冷冻12个月',
    storage: '-18℃以下冷冻',
    rating: 4.9,
    reviewCount: 2134,
    sales: 8765,
    image: getImage(3),
    images: [getImage(3), getImage(8), getImage(9)],
    description: '澳洲进口安格斯牛肉，M5级雪花纹理，大理石花纹丰富。原切牛排，无腌制，口感鲜嫩多汁。',
    tags: ['进口', '原切', '顺丰冷链'],
    reviews: [
      { id: '1', userName: '刘**', rating: 5, content: '雪花很漂亮，煎完很嫩，孩子特别爱吃！', date: '2024-01-11', images: [getImage(10, 200, 200)] }
    ]
  },
  {
    id: '5',
    name: '内蒙散养有机羊排',
    category: '精品肉类',
    categoryId: '2',
    price: 128.0,
    originalPrice: 168.0,
    unit: '1kg装',
    spec: '精选肋排',
    origin: '内蒙古锡林郭勒',
    weight: '1kg±30g',
    shelfLife: '冷冻12个月',
    storage: '-18℃以下冷冻',
    rating: 4.8,
    reviewCount: 1678,
    sales: 6543,
    image: getImage(4),
    images: [getImage(4), getImage(11), getImage(12)],
    description: '内蒙古锡林郭勒草原散养羔羊，有机认证，肉质鲜嫩无膻味。适合烤、炖、红烧等多种烹饪方式。',
    tags: ['有机', '散养', '产地直发'],
    reviews: [
      { id: '1', userName: '赵**', rating: 5, content: '炖汤特别鲜，一点都不膻，家人都爱吃。', date: '2024-01-10', images: [] }
    ]
  },
  {
    id: '6',
    name: '黑猪土猪五花肉',
    category: '精品肉类',
    categoryId: '2',
    price: 58.8,
    originalPrice: 78.8,
    unit: '500g装',
    spec: '三层五花',
    origin: '山东临沂',
    weight: '500g±20g',
    shelfLife: '冷藏3天/冷冻6个月',
    storage: '0-4℃冷藏或-18℃冷冻',
    rating: 4.7,
    reviewCount: 1234,
    sales: 5432,
    image: getImage(5),
    images: [getImage(5), getImage(13), getImage(14)],
    description: '散养黑猪五花肉，肥瘦相间，三层五花，肉质紧实有弹性。适合红烧肉、回锅肉、烤肉等。',
    tags: ['散养', '土猪', '新鲜'],
    reviews: [
      { id: '1', userName: '孙**', rating: 4, content: '做了红烧肉，很香，就是皮有点厚。', date: '2024-01-09', images: [] }
    ]
  },
  {
    id: '7',
    name: '泰国进口金枕头榴莲',
    category: '新鲜水果',
    categoryId: '1',
    price: 159.0,
    originalPrice: 199.0,
    unit: '3-4斤/个',
    spec: 'A级鲜果',
    origin: '泰国',
    weight: '1.5-2kg/个',
    shelfLife: '3-5天',
    storage: '常温存放，开口后冷藏',
    rating: 4.6,
    reviewCount: 987,
    sales: 4321,
    image: getImage(6),
    images: [getImage(6), getImage(0), getImage(1)],
    description: '泰国进口金枕头榴莲，果肉肥厚，香甜软糯，核小肉多。A级鲜果，品质有保障。',
    tags: ['进口', '爆款', '包4房肉'],
    reviews: [
      { id: '1', userName: '周**', rating: 5, content: '榴莲很熟，果肉很甜，出肉率很高！', date: '2024-01-08', images: [getImage(2, 200, 200)] }
    ]
  },
  {
    id: '8',
    name: '丹东99红颜草莓',
    category: '新鲜水果',
    categoryId: '1',
    price: 49.9,
    originalPrice: 69.9,
    unit: '3斤装',
    spec: '精选大果',
    origin: '辽宁丹东',
    weight: '约1.5kg',
    shelfLife: '3天',
    storage: '0-4℃冷藏',
    rating: 4.8,
    reviewCount: 1543,
    sales: 7890,
    image: getImage(7),
    images: [getImage(7), getImage(3), getImage(4)],
    description: '丹东99红颜草莓，果实饱满，色泽红艳，香甜多汁。新鲜采摘，顺丰直达。',
    tags: ['当季', '顺丰', '新鲜直达'],
    reviews: [
      { id: '1', userName: '吴**', rating: 5, content: '草莓很新鲜，很甜，包装也很用心！', date: '2024-01-07', images: [] }
    ]
  },
  {
    id: '9',
    name: '挪威进口三文鱼',
    category: '海鲜水产',
    categoryId: '3',
    price: 89.9,
    originalPrice: 119.9,
    unit: '500g装',
    spec: '冰鲜刺身级',
    origin: '挪威',
    weight: '500g±20g',
    shelfLife: '冰鲜3天/冷冻3个月',
    storage: '0-4℃冰鲜保存',
    rating: 4.9,
    reviewCount: 1876,
    sales: 6789,
    image: getImage(8),
    images: [getImage(8), getImage(5), getImage(6)],
    description: '挪威进口冰鲜三文鱼，刺身级品质，肉质细嫩，油脂丰富。空运直达，新鲜度极佳。',
    tags: ['进口', '刺身级', '顺丰冷链'],
    reviews: [
      { id: '1', userName: '郑**', rating: 5, content: '三文鱼很新鲜，切片直接吃，口感超好！', date: '2024-01-06', images: [] }
    ]
  },
  {
    id: '10',
    name: '农家散养土鸡',
    category: '禽蛋制品',
    categoryId: '4',
    price: 98.0,
    originalPrice: 138.0,
    unit: '1只/约2斤',
    spec: '散养300天以上',
    origin: '安徽黄山',
    weight: '约1kg/只',
    shelfLife: '冷藏3天/冷冻6个月',
    storage: '0-4℃冷藏或-18℃冷冻',
    rating: 4.7,
    reviewCount: 1123,
    sales: 4567,
    image: getImage(9),
    images: [getImage(9), getImage(7), getImage(8)],
    description: '黄山脚下散养土鸡，300天以上生长周期，吃五谷杂粮，肉质紧实鲜美。适合煲汤、红烧。',
    tags: ['散养', '农家', '现杀'],
    reviews: [
      { id: '1', userName: '钱**', rating: 4, content: '汤很鲜，鸡肉也很有嚼劲，不错。', date: '2024-01-05', images: [] }
    ]
  },
  {
    id: '11',
    name: '有机生菜',
    category: '新鲜蔬菜',
    categoryId: '5',
    price: 8.9,
    originalPrice: 12.9,
    unit: '300g装',
    spec: '有机认证',
    origin: '上海崇明',
    weight: '300g±20g',
    shelfLife: '3-5天',
    storage: '0-4℃冷藏',
    rating: 4.6,
    reviewCount: 876,
    sales: 3456,
    image: getImage(10),
    images: [getImage(10), getImage(9), getImage(10)],
    description: '崇明有机农场直供生菜，有机认证，无农药残留。新鲜脆嫩，适合沙拉、清炒。',
    tags: ['有机', '无公害', '当日新鲜'],
    reviews: [
      { id: '1', userName: '冯**', rating: 4, content: '生菜很新鲜，做沙拉很好吃。', date: '2024-01-04', images: [] }
    ]
  },
  {
    id: '12',
    name: '特仑苏纯牛奶',
    category: '奶制品',
    categoryId: '6',
    price: 62.9,
    originalPrice: 75.9,
    unit: '250ml*12盒',
    spec: '3.6g优质蛋白',
    origin: '内蒙古',
    weight: '3kg',
    shelfLife: '6个月',
    storage: '常温保存',
    rating: 4.9,
    reviewCount: 3456,
    sales: 23456,
    image: getImage(11),
    images: [getImage(11), getImage(0), getImage(1)],
    description: '特仑苏纯牛奶，每100ml含3.6g优质蛋白，120mg原生高钙。精选奶源，营养丰富。',
    tags: ['爆款', '高钙', '礼盒装'],
    reviews: [
      { id: '1', userName: '杨**', rating: 5, content: '牛奶很香醇，一直喝这个牌子，不错。', date: '2024-01-03', images: [] }
    ]
  }
]

export const getProductsByCategory = (categoryId: string): Product[] => {
  if (!categoryId || categoryId === 'all') return products
  return products.filter(p => p.categoryId === categoryId)
}

export const getProductById = (id: string): Product | undefined => {
  return products.find(p => p.id === id)
}

export const searchProducts = (keyword: string): Product[] => {
  if (!keyword) return products
  const lowerKeyword = keyword.toLowerCase()
  return products.filter(p =>
    p.name.toLowerCase().includes(lowerKeyword) ||
    p.category.toLowerCase().includes(lowerKeyword) ||
    p.tags.some(t => t.toLowerCase().includes(lowerKeyword))
  )
}
