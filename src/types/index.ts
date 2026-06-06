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
  isNewUser: boolean
  hasClaimedNewUserCoupon: boolean
}

export interface Coupon {
  id: number
  name: string
  type: 'discount' | 'fixed'
  value: number
  minAmount: number
  description: string
  startTime: string
  endTime: string
  status: 'unused' | 'used' | 'expired'
  scope: 'all' | 'category' | 'product'
  scopeIds?: number[]
}

export interface NewUserZoneData {
  banner: {
    title: string
    subtitle: string
    couponValue: number
    minAmount: number
  }
  coupon: Coupon
  products: Product[]
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

export interface GroupBuyProduct {
  id: number
  productId: number
  product: Product
  groupPrice: number
  originalPrice: number
  groupSize: number
  currentCount: number
  endTime: string
  discount: string
}

export interface GroupBuyMember {
  id: number
  userId: number
  nickname: string
  avatar: string
  isInitiator: boolean
  joinedAt: string
}

export interface GroupBuyOrder {
  id: number
  groupNo: string
  groupBuyProductId: number
  productId: number
  product: Product
  groupPrice: number
  groupSize: number
  currentCount: number
  initiatorId: number
  initiatorNickname: string
  initiatorAvatar: string
  members: GroupBuyMember[]
  status: 'pending' | 'success' | 'failed'
  endTime: string
  createdAt: string
  specValues: Record<string, string>
  quantity: number
}

export interface CreateGroupBuyParams {
  productId: number
  specValues: Record<string, string>
  quantity: number
}

export interface JoinGroupBuyParams {
  groupId: number
  specValues: Record<string, string>
  quantity: number
}
