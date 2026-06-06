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

export interface PresaleProduct {
  id: number
  productId: number
  product: Product
  presalePrice: number
  originalPrice: number
  saleTime: string
  endTime: string
  stock: number
  reservationCount: number
  seasonTag: string
  description: string
}

export interface PresaleDay {
  date: string
  weekday: string
  isToday: boolean
  products: PresaleProduct[]
}

export interface Reservation {
  id: number
  presaleProductId: number
  productName: string
  productImage: string
  saleTime: string
  createdAt: string
  notified: boolean
}

export interface GiftCardDenomination {
  id: number
  name: string
  value: number
  price: number
  description: string
  image: string
  tag?: string
}

export interface GiftCardTemplate {
  id: number
  name: string
  theme: string
  coverImage: string
  bgGradient: string
  textColor: string
}

export interface GiftCardRecipient {
  name: string
  phone: string
  relation?: string
}

export interface GiftCardOrder {
  id: number
  orderNo: string
  denominationId: number
  denomination: GiftCardDenomination
  templateId: number
  template: GiftCardTemplate
  recipient: GiftCardRecipient
  message: string
  totalAmount: number
  payAmount: number
  status: 'pending' | 'paid' | 'sent' | 'received' | 'expired'
  payMethod?: 'wechat' | 'alipay' | 'balance'
  payTime?: string
  cardCode?: string
  validFrom: string
  validTo: string
  createdAt: string
  sender?: {
    id: number
    nickname: string
    avatar: string
  }
}

export interface CreateGiftCardOrderParams {
  denominationId: number
  templateId: number
  recipient: GiftCardRecipient
  message: string
}

export interface GiftCardOrderResult {
  orderId: number
  orderNo: string
  payAmount: number
}

export interface GiftCardPaymentResult {
  orderId: number
  status: 'success' | 'failed' | 'pending'
  payMethod: 'wechat' | 'alipay' | 'balance'
  payTime?: string
  cardCode?: string
}

export interface GroupMealPackage {
  id: number
  name: string
  description: string
  minPeople: number
  maxPeople: number
  pricePerPerson: number
  originalPricePerPerson: number
  image: string
  tags: string[]
  dishes: GroupMealDish[]
  suitableFor: string
}

export interface GroupMealDish {
  id: number
  name: string
  quantity: string
  image: string
}

export interface GroupMealTimeSlot {
  id: string
  label: string
  startTime: string
  endTime: string
  available: boolean
}

export interface GroupMealOrderItem {
  packageId: number
  packageName: string
  packageImage: string
  peopleCount: number
  pricePerPerson: number
  subtotal: number
}

export interface CreateGroupMealOrderParams {
  items: GroupMealOrderItem[]
  peopleCount: number
  deliveryDate: string
  timeSlotId: string
  companyName: string
  contactName: string
  contactPhone: string
  address: string
  remark?: string
  totalAmount: number
  payAmount: number
}

export interface GroupMealOrder {
  id: number
  orderNo: string
  items: GroupMealOrderItem[]
  peopleCount: number
  deliveryDate: string
  timeSlotId: string
  timeSlotLabel: string
  companyName: string
  contactName: string
  contactPhone: string
  address: string
  remark?: string
  totalAmount: number
  payAmount: number
  status: 'pending' | 'paid' | 'confirmed' | 'delivered' | 'cancelled'
  payMethod?: 'wechat' | 'alipay' | 'balance'
  payTime?: string
  createdAt: string
}

export interface GroupMealOrderResult {
  orderId: number
  orderNo: string
  payAmount: number
}

export interface StockpileItem {
  id: number
  productId: number
  product: Product
  specValues: Record<string, string>
  quantity: number
  category: string
  note?: string
  addedAt: string
  lastPurchasedAt?: string
  purchaseCount: number
}

export interface StockpileCategory {
  id: string
  name: string
  icon: string
}

export interface AddToStockpileParams {
  product: Product
  specValues: Record<string, string>
  quantity: number
  category: string
  note?: string
}
