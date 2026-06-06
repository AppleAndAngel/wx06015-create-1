import type { StockpileItem, StockpileCategory } from '@/types'
import { products } from './products'
import { getItem, setItem } from '@/utils/storage'

const STOCKPILE_KEY = 'stockpile_items'

export const stockpileCategories: StockpileCategory[] = [
  { id: 'daily', name: '日常用品', icon: '🏠' },
  { id: 'food', name: '食品粮油', icon: '🍚' },
  { id: 'snack', name: '零食饮料', icon: '🍪' },
  { id: 'fresh', name: '生鲜果蔬', icon: '🥬' },
  { id: 'baby', name: '母婴用品', icon: '🍼' },
  { id: 'clean', name: '清洁洗护', icon: '🧴' },
  { id: 'other', name: '其他', icon: '📦' },
]

const initialStockpileItems: StockpileItem[] = [
  {
    id: 1,
    productId: 8,
    product: products[7],
    specValues: { '规格': '30枚装', '品种': '土鸡蛋' },
    quantity: 2,
    category: 'food',
    note: '每周买一次',
    addedAt: '2026-05-01T10:00:00.000Z',
    lastPurchasedAt: '2026-06-01T08:30:00.000Z',
    purchaseCount: 8,
  },
  {
    id: 2,
    productId: 13,
    product: products[12],
    specValues: { '规格': '950ml', '类型': '全脂' },
    quantity: 3,
    category: 'food',
    note: '每天喝',
    addedAt: '2026-05-05T10:00:00.000Z',
    lastPurchasedAt: '2026-06-03T08:30:00.000Z',
    purchaseCount: 6,
  },
  {
    id: 3,
    productId: 1,
    product: products[0],
    specValues: { '规格': '10斤装', '产地': '山东烟台' },
    quantity: 1,
    category: 'fresh',
    addedAt: '2026-05-10T10:00:00.000Z',
    lastPurchasedAt: '2026-05-28T08:30:00.000Z',
    purchaseCount: 4,
  },
  {
    id: 4,
    productId: 16,
    product: products[15],
    specValues: { '规格': '10kg', '品种': '稻花香2号' },
    quantity: 1,
    category: 'food',
    note: '家里常备',
    addedAt: '2026-04-15T10:00:00.000Z',
    lastPurchasedAt: '2026-05-20T08:30:00.000Z',
    purchaseCount: 3,
  },
  {
    id: 5,
    productId: 17,
    product: products[16],
    specValues: { '规格': '5L', '等级': '一级' },
    quantity: 1,
    category: 'food',
    addedAt: '2026-04-20T10:00:00.000Z',
    lastPurchasedAt: '2026-05-15T08:30:00.000Z',
    purchaseCount: 2,
  },
]

function getStockpileItems(): StockpileItem[] {
  const stored = getItem<StockpileItem[]>(STOCKPILE_KEY)
  if (stored) {
    return stored
  }
  setItem(STOCKPILE_KEY, initialStockpileItems)
  return initialStockpileItems
}

function delay(ms: number = 300): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

let itemIdCounter = 10

export function getStockpileList(): Promise<{ data: StockpileItem[] }> {
  return delay().then(() => ({ data: [...getStockpileItems()] }))
}

export function getStockpileByCategory(category: string): Promise<{ data: StockpileItem[] }> {
  return delay().then(() => {
    const items = getStockpileItems()
    const filtered = category === 'all' ? items : items.filter((item) => item.category === category)
    return { data: filtered }
  })
}

export function addToStockpile(
  productId: number,
  specValues: Record<string, string>,
  quantity: number,
  category: string,
  note?: string
): Promise<{ data: StockpileItem }> {
  return delay().then(() => {
    const items = getStockpileItems()
    const product = products.find((p) => p.id === productId)
    if (!product) {
      throw new Error('商品不存在')
    }

    const existing = items.find(
      (i) =>
        i.productId === productId &&
        JSON.stringify(i.specValues) === JSON.stringify(specValues)
    )

    if (existing) {
      existing.quantity += quantity
      if (note) {
        existing.note = note
      }
      setItem(STOCKPILE_KEY, items)
      return { data: existing }
    }

    const newItem: StockpileItem = {
      id: itemIdCounter++,
      productId,
      product,
      specValues,
      quantity,
      category,
      note,
      addedAt: new Date().toISOString(),
      purchaseCount: 0,
    }

    items.push(newItem)
    setItem(STOCKPILE_KEY, items)
    return { data: newItem }
  })
}

export function removeFromStockpile(id: number): Promise<void> {
  return delay().then(() => {
    const items = getStockpileItems().filter((i) => i.id !== id)
    setItem(STOCKPILE_KEY, items)
  })
}

export function updateStockpileQuantity(id: number, quantity: number): Promise<{ data: StockpileItem }> {
  return delay().then(() => {
    const items = getStockpileItems()
    const item = items.find((i) => i.id === id)
    if (item) {
      item.quantity = quantity
      setItem(STOCKPILE_KEY, items)
    }
    return { data: item || ({} as StockpileItem) }
  })
}

export function updateStockpileNote(id: number, note: string): Promise<{ data: StockpileItem }> {
  return delay().then(() => {
    const items = getStockpileItems()
    const item = items.find((i) => i.id === id)
    if (item) {
      item.note = note
      setItem(STOCKPILE_KEY, items)
    }
    return { data: item || ({} as StockpileItem) }
  })
}

export function addStockpileToCart(itemIds: number[]): Promise<{ data: { successCount: number; failCount: number } }> {
  return delay().then(() => {
    const items = getStockpileItems()
    const cartItems = getItem<any[]>('cart') || []
    let successCount = 0
    let failCount = 0

    itemIds.forEach((id) => {
      const stockpileItem = items.find((i) => i.id === id)
      if (stockpileItem) {
        const existing = cartItems.find(
          (c) =>
            c.productId === stockpileItem.productId &&
            JSON.stringify(c.specValues) === JSON.stringify(stockpileItem.specValues)
        )
        if (existing) {
          existing.quantity += stockpileItem.quantity
        } else {
          cartItems.push({
            id: Date.now() + Math.random(),
            productId: stockpileItem.productId,
            product: stockpileItem.product,
            specValues: stockpileItem.specValues,
            quantity: stockpileItem.quantity,
            selected: true,
          })
        }
        stockpileItem.lastPurchasedAt = new Date().toISOString()
        stockpileItem.purchaseCount += 1
        successCount++
      } else {
        failCount++
      }
    })

    setItem('cart', cartItems)
    setItem(STOCKPILE_KEY, items)
    return { data: { successCount, failCount } }
  })
}

export function checkIsInStockpile(productId: number, specValues: Record<string, string>): Promise<{ data: boolean }> {
  return delay().then(() => {
    const items = getStockpileItems()
    const exists = items.some(
      (i) =>
        i.productId === productId &&
        JSON.stringify(i.specValues) === JSON.stringify(specValues)
    )
    return { data: exists }
  })
}

export function getStockpileCategories(): Promise<{ data: StockpileCategory[] }> {
  return delay().then(() => ({ data: [...stockpileCategories] }))
}
