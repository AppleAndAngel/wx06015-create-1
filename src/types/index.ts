export interface Product {
  id: string
  name: string
  category: string
  price: number
  originalPrice: number
  image: string
  spec: string
  packaging: string
  origin: string
  weight: string
  shelfLife: string
  storage: string
  rating: number
  reviewCount: number
  sales: number
  tags: string[]
  description: string
  reviews: Review[]
  inStock: boolean
  restockDate?: string
}

export interface Review {
  id: string
  userName: string
  rating: number
  content: string
  date: string
}

export interface Category {
  id: string
  name: string
  icon: string
}

export interface CartItem {
  product: Product
  quantity: number
  selected: boolean
}

export interface CompareStore {
  compareList: Product[]
  addToCompare: (product: Product) => void
  removeFromCompare: (productId: string) => void
  clearCompare: () => void
  isInCompare: (productId: string) => boolean
}

export interface CartStore {
  cartList: CartItem[]
  addToCart: (product: Product, quantity?: number) => void
  removeFromCart: (productId: string) => void
  updateQuantity: (productId: string, quantity: number) => void
  toggleSelect: (productId: string) => void
  toggleSelectAll: (selected: boolean) => void
  getTotalPrice: () => number
  getSelectedCount: () => number
}

export interface ArrivalReminderItem {
  product: Product
  addedAt: number
  notified: boolean
}

export interface ArrivalStore {
  reminderList: ArrivalReminderItem[]
  addToReminder: (product: Product) => void
  removeFromReminder: (productId: string) => void
  isInReminder: (productId: string) => boolean
  markAsNotified: (productId: string) => void
  checkStockUpdates: () => Product[]
}

export interface ComboProduct {
  productId: string
  quantity: number
  product?: Product
}

export interface Combo {
  id: string
  name: string
  description: string
  scene: string
  icon: string
  image: string
  originalPrice: number
  comboPrice: number
  savedAmount: number
  sales: number
  rating: number
  tags: string[]
  products: ComboProduct[]
  inStock: boolean
}

export interface ComboScene {
  id: string
  name: string
  icon: string
  description: string
}
