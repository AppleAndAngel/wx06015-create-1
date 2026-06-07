import type { Product, Category } from '@/types'

export const categories: Category[] = [
  { id: 'all', name: '全部', icon: '📦' },
  { id: 'fruit', name: '水果', icon: '🍎' },
  { id: 'meat', name: '肉类', icon: '🥩' },
  { id: 'seafood', name: '海鲜', icon: '🦐' },
  { id: 'poultry', name: '禽蛋', icon: '🥚' },
  { id: 'vegetable', name: '蔬菜', icon: '🥬' },
  { id: 'dairy', name: '奶制品', icon: '🥛' }
]

export const products: Product[] = [
  {
    id: 'p001',
    name: '烟台红富士苹果',
    category: 'fruit',
    price: 12.9,
    originalPrice: 18.9,
    image: 'https://picsum.photos/id/292/300/300',
    spec: '80-85mm',
    packaging: '5斤装',
    origin: '山东烟台',
    weight: '2.5kg',
    shelfLife: '15天',
    storage: '冷藏保存',
    rating: 4.9,
    reviewCount: 2856,
    sales: 15680,
    tags: ['当季新果', '脆甜多汁', '产地直发'],
    description: '正宗烟台红富士，果形端正，色泽鲜艳，果肉细腻，脆甜多汁，富含维生素C。',
    reviews: [
      { id: 'r001', userName: '张**', rating: 5, content: '非常新鲜，口感脆甜，水分很足！', date: '2024-01-15' },
      { id: 'r002', userName: '李**', rating: 5, content: '个头均匀，包装很好，下次还会买', date: '2024-01-14' }
    ],
    inStock: true
  },
  {
    id: 'p002',
    name: '海南金煌芒果',
    category: 'fruit',
    price: 29.9,
    originalPrice: 39.9,
    image: 'https://picsum.photos/id/312/300/300',
    spec: '单果400g+',
    packaging: '5斤装',
    origin: '海南三亚',
    weight: '2.5kg',
    shelfLife: '7天',
    storage: '常温避光',
    rating: 4.8,
    reviewCount: 3421,
    sales: 23450,
    tags: ['热带水果', '核小肉厚', '香甜浓郁'],
    description: '海南金煌芒果，果肉金黄细腻，纤维少，甜度高，香味浓郁，是芒果中的极品。',
    reviews: [
      { id: 'r003', userName: '王**', rating: 5, content: '太好吃了，果肉很厚很甜', date: '2024-01-13' }
    ],
    inStock: false,
    restockDate: '2026-06-07'
  },
  {
    id: 'p003',
    name: '智利车厘子',
    category: 'fruit',
    price: 89.9,
    originalPrice: 129.9,
    image: 'https://picsum.photos/id/431/300/300',
    spec: 'JJ级 28-30mm',
    packaging: '2斤礼盒装',
    origin: '智利',
    weight: '1kg',
    shelfLife: '10天',
    storage: '0-4℃冷藏',
    rating: 4.9,
    reviewCount: 1892,
    sales: 8920,
    tags: ['进口', 'JJ级', '礼盒装'],
    description: '智利进口车厘子，果实饱满，色泽紫黑，果肉紧实，甜度高，送礼佳品。',
    reviews: [
      { id: 'r004', userName: '陈**', rating: 5, content: '果粒很大，新鲜度很好，送礼很有面子', date: '2024-01-12' }
    ],
    inStock: true
  },
  {
    id: 'p004',
    name: '云南蓝莓',
    category: 'fruit',
    price: 39.9,
    originalPrice: 49.9,
    image: 'https://picsum.photos/id/570/300/300',
    spec: '125g/盒',
    packaging: '4盒装',
    origin: '云南蒙自',
    weight: '500g',
    shelfLife: '5天',
    storage: '0-6℃冷藏',
    rating: 4.7,
    reviewCount: 2156,
    sales: 12380,
    tags: ['有机认证', '护眼明目', '顺丰冷链'],
    description: '云南高原蓝莓，有机种植，果肉细腻，酸甜适口，富含花青素，护眼佳品。',
    reviews: [
      { id: 'r005', userName: '刘**', rating: 4, content: '味道不错，就是有点小贵', date: '2024-01-11' }
    ],
    inStock: true
  },
  {
    id: 'p005',
    name: '新疆库尔勒香梨',
    category: 'fruit',
    price: 25.9,
    originalPrice: 35.9,
    image: 'https://picsum.photos/id/580/300/300',
    spec: '120-150g',
    packaging: '5斤装',
    origin: '新疆库尔勒',
    weight: '2.5kg',
    shelfLife: '30天',
    storage: '阴凉通风',
    rating: 4.8,
    reviewCount: 3241,
    sales: 18960,
    tags: ['西域贡品', '皮薄肉细', '酥脆多汁'],
    description: '新疆库尔勒香梨，皮薄肉细，酥脆多汁，清甜爽口，有"西域蜜梨"之美誉。',
    reviews: [
      { id: 'r006', userName: '赵**', rating: 5, content: '皮薄汁多，非常甜，家人都爱吃', date: '2024-01-10' }
    ],
    inStock: true
  },
  {
    id: 'p006',
    name: '新西兰奇异果',
    category: 'fruit',
    price: 45.9,
    originalPrice: 59.9,
    image: 'https://picsum.photos/id/625/300/300',
    spec: '120-140g',
    packaging: '8个装',
    origin: '新西兰',
    weight: '1kg',
    shelfLife: '14天',
    storage: '冷藏保存',
    rating: 4.9,
    reviewCount: 1567,
    sales: 7890,
    tags: ['进口', '维C之王', 'Zespri佳沛'],
    description: '新西兰Zespri佳沛奇异果，维C之王，果肉翠绿，酸甜适中，营养丰富。',
    reviews: [
      { id: 'r007', userName: '孙**', rating: 5, content: '正宗佳沛，品质保证，很好吃', date: '2024-01-09' }
    ],
    inStock: false,
    restockDate: '2026-06-15'
  },
  {
    id: 'p007',
    name: '澳洲和牛M9眼肉',
    category: 'meat',
    price: 298.0,
    originalPrice: 398.0,
    image: 'https://picsum.photos/id/326/300/300',
    spec: '2-3cm厚切',
    packaging: '500g装',
    origin: '澳大利亚',
    weight: '500g',
    shelfLife: '冷冻12个月',
    storage: '-18℃冷冻',
    rating: 4.9,
    reviewCount: 892,
    sales: 3450,
    tags: ['M9级', '雪花纹理', '原切'],
    description: '澳洲和牛M9级眼肉，雪花纹理丰富，入口即化，奶香浓郁，是顶级牛肉的代表。',
    reviews: [
      { id: 'r008', userName: '周**', rating: 5, content: '雪花很漂亮，煎出来很香，值得这个价', date: '2024-01-08' }
    ],
    inStock: true
  },
  {
    id: 'p008',
    name: '黑猪五花肉',
    category: 'meat',
    price: 45.9,
    originalPrice: 58.9,
    image: 'https://picsum.photos/id/401/300/300',
    spec: '肥瘦相间',
    packaging: '500g装',
    origin: '山东临沂',
    weight: '500g',
    shelfLife: '冷藏3天',
    storage: '0-4℃冷藏',
    rating: 4.8,
    reviewCount: 2341,
    sales: 15670,
    tags: ['散养黑猪', '无抗生素', '次日达'],
    description: '散养黑猪五花肉，肥瘦相间，肉质鲜嫩，适合红烧、烤肉、炖煮等多种烹饪方式。',
    reviews: [
      { id: 'r009', userName: '吴**', rating: 5, content: '肉质很新鲜，做红烧肉特别香', date: '2024-01-07' }
    ],
    inStock: true
  },
  {
    id: 'p009',
    name: '澳洲安格斯牛小排',
    category: 'meat',
    price: 168.0,
    originalPrice: 218.0,
    image: 'https://picsum.photos/id/835/300/300',
    spec: '1.5-2cm厚切',
    packaging: '600g装',
    origin: '澳大利亚',
    weight: '600g',
    shelfLife: '冷冻12个月',
    storage: '-18℃冷冻',
    rating: 4.9,
    reviewCount: 1123,
    sales: 5670,
    tags: ['安格斯', '谷饲200天', '原切'],
    description: '澳洲安格斯牛小排，谷饲200天，大理石花纹丰富，肉质细嫩多汁，适合煎烤。',
    reviews: [
      { id: 'r010', userName: '郑**', rating: 5, content: '原切的，质量很好，煎5分熟刚好', date: '2024-01-06' }
    ],
    inStock: false,
    restockDate: '2026-06-12'
  },
  {
    id: 'p010',
    name: '厄瓜多尔白虾',
    category: 'seafood',
    price: 89.9,
    originalPrice: 129.9,
    image: 'https://picsum.photos/id/1080/300/300',
    spec: '40-50规格',
    packaging: '2kg盒装',
    origin: '厄瓜多尔',
    weight: '2kg',
    shelfLife: '冷冻12个月',
    storage: '-18℃冷冻',
    rating: 4.8,
    reviewCount: 4567,
    sales: 28900,
    tags: ['进口', '速冻锁鲜', '顺丰冷链'],
    description: '厄瓜多尔进口白虾，肉质紧实鲜美，个头均匀，速冻锁鲜，适合白灼、爆炒、蒜蓉等。',
    reviews: [
      { id: 'r011', userName: '冯**', rating: 5, content: '虾很大很新鲜，肉质紧实，性价比高', date: '2024-01-05' }
    ],
    inStock: true
  },
  {
    id: 'p011',
    name: '农家土鸡蛋',
    category: 'poultry',
    price: 29.9,
    originalPrice: 38.9,
    image: 'https://picsum.photos/id/1074/300/300',
    spec: '50-55g/枚',
    packaging: '30枚装',
    origin: '河北承德',
    weight: '1.5kg',
    shelfLife: '30天',
    storage: '阴凉干燥',
    rating: 4.9,
    reviewCount: 6789,
    sales: 45670,
    tags: ['散养', '谷物喂养', '无抗生素'],
    description: '农家散养土鸡蛋，谷物喂养，蛋黄饱满，蛋白浓稠，营养丰富，适合全家食用。',
    reviews: [
      { id: 'r012', userName: '曹**', rating: 5, content: '鸡蛋很新鲜，蛋黄颜色深，味道很好', date: '2024-01-04' }
    ],
    inStock: true
  },
  {
    id: 'p012',
    name: '有机蔬菜礼盒',
    category: 'vegetable',
    price: 68.0,
    originalPrice: 88.0,
    image: 'https://picsum.photos/id/110/300/300',
    spec: '6种时令蔬菜',
    packaging: '礼盒装',
    origin: '山东寿光',
    weight: '3kg',
    shelfLife: '7天',
    storage: '0-8℃冷藏',
    rating: 4.7,
    reviewCount: 1234,
    sales: 6780,
    tags: ['有机认证', '产地直发', '新鲜直达'],
    description: '有机蔬菜礼盒，包含6种时令有机蔬菜，无农药残留，营养健康，是送礼佳品。',
    reviews: [
      { id: 'r013', userName: '严**', rating: 4, content: '蔬菜很新鲜，种类丰富，包装精美', date: '2024-01-03' }
    ],
    inStock: true
  }
]

export const getProductById = (id: string): Product | undefined => {
  return products.find(p => p.id === id)
}

export const getProductsByCategory = (categoryId: string): Product[] => {
  if (categoryId === 'all') return products
  return products.filter(p => p.category === categoryId)
}

export const updateProductStock = (productId: string, inStock: boolean): void => {
  const product = products.find(p => p.id === productId)
  if (product) {
    product.inStock = inStock
    if (inStock) {
      delete product.restockDate
    }
    console.log('[Mock] 商品库存更新:', product.name, '库存状态:', inStock)
  }
}

export const checkRestockProducts = (): Product[] => {
  const today = new Date('2026-06-07')
  const restockedProducts: Product[] = []
  
  products.forEach(product => {
    if (!product.inStock && product.restockDate) {
      const restockDate = new Date(product.restockDate)
      if (restockDate <= today) {
        product.inStock = true
        delete product.restockDate
        restockedProducts.push(product)
        console.log('[Mock] 商品已到货:', product.name)
      }
    }
  })
  
  return restockedProducts
}

export const getOutOfStockProducts = (): Product[] => {
  return products.filter(p => !p.inStock)
}
