export interface Spec {
  name: string
  values: string[]
}

export interface Review {
  id: number
  username: string
  avatar: string
  content: string
  rating: number
  images: string[]
  createdAt: string
}

export interface Product {
  id: number
  name: string
  subtitle: string
  price: number
  originalPrice: number
  images: string[]
  categoryId: number
  specs: Spec[]
  sales: number
  rating: number
  tags: string[]
  reviews?: Review[]
}

export interface Category {
  id: number
  name: string
  icon: string
  children?: Category[]
}

export interface CartItem {
  id: number
  productId: number
  product: Product
  specValues: Record<string, string>
  quantity: number
  selected: boolean
}

export interface OrderItem {
  productId: number
  productName: string
  productImage: string
  specValues: Record<string, string>
  price: number
  quantity: number
}

export interface Address {
  id: number
  name: string
  phone: string
  province: string
  city: string
  district: string
  detail: string
  isDefault: boolean
}

export interface Order {
  id: number
  orderNo: string
  items: OrderItem[]
  totalAmount: number
  payAmount: number
  status: 'pending' | 'paid' | 'shipped' | 'delivered' | 'cancelled'
  address: Address
  createdAt: string
  paidAt?: string
}

export interface User {
  id: number
  phone: string
  nickname: string
  avatar: string
  token: string
}

export interface CreateOrderData {
  items: OrderItem[]
  totalAmount: number
  payAmount: number
  address: Address
}

export interface PaymentResult {
  orderId: number
  status: 'success' | 'failed' | 'pending'
  payMethod: 'wechat' | 'alipay' | 'balance'
  payTime?: string
}
