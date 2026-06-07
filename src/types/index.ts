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
