import type { GroupMealPackage, GroupMealTimeSlot, GroupMealOrder } from '@/types'
import { getItem, setItem } from '@/utils/storage'

const GROUP_MEAL_ORDER_KEY = 'groupMealOrders'

const dishesData: GroupMealPackage[] = [
  {
    id: 1,
    name: '商务精选套餐',
    description: '精选六道经典菜品，荤素搭配，营养均衡，适合中小型企业日常团建',
    minPeople: 10,
    maxPeople: 30,
    pricePerPerson: 38,
    originalPricePerPerson: 58,
    image: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&h=300&fit=crop',
    tags: ['热卖', '荤素搭配'],
    suitableFor: '10-30人',
    dishes: [
      { id: 1, name: '红烧排骨', quantity: '1份', image: 'https://images.unsplash.com/photo-1544025162-d7669426c75d?w=100&h=100&fit=crop' },
      { id: 2, name: '清蒸鲈鱼', quantity: '1份', image: 'https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?w=100&h=100&fit=crop' },
      { id: 3, name: '宫保鸡丁', quantity: '1份', image: 'https://images.unsplash.com/photo-1525755662778-9847c003b322?w=100&h=100&fit=crop' },
      { id: 4, name: '蒜蓉西兰花', quantity: '1份', image: 'https://images.unsplash.com/photo-1459411552884-83997929f892?w=100&h=100&fit=crop' },
      { id: 5, name: '麻婆豆腐', quantity: '1份', image: 'https://images.unsplash.com/photo-158245290262144487d442163?w=100&h=100&fit=crop' },
      { id: 6, name: '时令蔬菜汤', quantity: '1份', image: 'https://images.unsplash.com/photo-1547592166-23ac45744acd?w=100&h=100&fit=crop' },
    ],
  },
  {
    id: 2,
    name: '豪华商务套餐',
    description: '八道精选好菜，海鲜肉类齐全，品质之选，适合重要客户接待',
    minPeople: 20,
    maxPeople: 50,
    pricePerPerson: 68,
    originalPricePerPerson: 98,
    image: 'https://images.unsplash.com/photo-1555244162-803834f70033?w=400&h=300&fit=crop',
    tags: ['推荐', '海鲜'],
    suitableFor: '20-50人',
    dishes: [
      { id: 1, name: '清蒸大闸蟹', quantity: '每人1只', image: 'https://images.unsplash.com/photo-1559737558-2f5810867bd8?w=100&h=100&fit=crop' },
      { id: 2, name: '蒜蓉粉丝蒸虾', quantity: '1份', image: 'https://images.unsplash.com/photo-1565680018434-b513d5e5fd47?w=100&h=100&fit=crop' },
      { id: 3, name: '红烧肉', quantity: '1份', image: 'https://images.unsplash.com/photo-1625944525529-865e893dc31d?w=100&h=100&fit=crop' },
      { id: 4, name: '黑椒牛柳', quantity: '1份', image: 'https://images.unsplash.com/photo-1558030006-eb639a419f98?w=100&h=100&fit=crop' },
      { id: 5, name: '松鼠鳜鱼', quantity: '1份', image: 'https://images.unsplash.com/photo-1535140751814-16703ca12896?w=100&h=100&fit=crop' },
      { id: 6, name: '蚝油生菜', quantity: '1份', image: 'https://images.unsplash.com/photo-1512058564366-18510be2db19?w=100&h=100&fit=crop' },
      { id: 7, name: '扬州炒饭', quantity: '1份', image: 'https://images.unsplash.com/photo-1603133872878-684f208fb34f?w=100&h=100&fit=crop' },
      { id: 8, name: '银耳莲子羹', quantity: '1份', image: 'https://images.unsplash.com/photo-1544145945-f90425340c7e?w=100&h=100&fit=crop' },
    ],
  },
  {
    id: 3,
    name: '简约工作餐',
    description: '四道经典家常菜，经济实惠，满足日常工作用餐需求',
    minPeople: 5,
    maxPeople: 20,
    pricePerPerson: 25,
    originalPricePerPerson: 35,
    image: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=400&h=300&fit=crop',
    tags: ['经济实惠', '热销'],
    suitableFor: '5-20人',
    dishes: [
      { id: 1, name: '西红柿炒蛋', quantity: '1份', image: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=100&h=100&fit=crop' },
      { id: 2, name: '鱼香肉丝', quantity: '1份', image: 'https://images.unsplash.com/photo-1563245372-f21724e3856d?w=100&h=100&fit=crop' },
      { id: 3, name: '土豆烧牛肉', quantity: '1份', image: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=100&h=100&fit=crop' },
      { id: 4, name: '清炒时蔬', quantity: '1份', image: 'https://images.unsplash.com/photo-1540420773420-3366772f45b7?w=100&h=100&fit=crop' },
    ],
  },
  {
    id: 4,
    name: '团建盛宴套餐',
    description: '十道硬菜，海鲜肉类应有尽有，适合大型团建活动',
    minPeople: 30,
    maxPeople: 100,
    pricePerPerson: 98,
    originalPricePerPerson: 138,
    image: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=400&h=300&fit=crop',
    tags: ['团建推荐', '海鲜大餐'],
    suitableFor: '30-100人',
    dishes: [
      { id: 1, name: '波士顿龙虾', quantity: '1份', image: 'https://images.unsplash.com/photo-1559737558-2f5810867bd8?w=100&h=100&fit=crop' },
      { id: 2, name: '帝王蟹', quantity: '1份', image: 'https://images.unsplash.com/photo-1510130387422-8ebbedf53f35?w=100&h=100&fit=crop' },
      { id: 3, name: '烤羊腿', quantity: '1份', image: 'https://images.unsplash.com/photo-1544025162-d7669426c75d?w=100&h=100&fit=crop' },
      { id: 4, name: '佛跳墙', quantity: '每人1位', image: 'https://images.unsplash.com/photo-1547592166-23ac45744acd?w=100&h=100&fit=crop' },
      { id: 5, name: '红烧鲍鱼', quantity: '每人1只', image: 'https://images.unsplash.com/photo-1626804475297-553596773680?w=100&h=100&fit=crop' },
      { id: 6, name: '蒜蓉粉丝扇贝', quantity: '1份', image: 'https://images.unsplash.com/photo-1565680018434-b513d5e5fd47?w=100&h=100&fit=crop' },
      { id: 7, name: '黑椒牛排', quantity: '1份', image: 'https://images.unsplash.com/photo-1558030006-eb639a419f98?w=100&h=100&fit=crop' },
      { id: 8, name: '清蒸石斑鱼', quantity: '1条', image: 'https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?w=100&h=100&fit=crop' },
      { id: 9, name: '白切鸡', quantity: '1只', image: 'https://images.unsplash.com/photo-1598103442093-05a098d656a0?w=100&h=100&fit=crop' },
      { id: 10, name: '精美果盘', quantity: '1份', image: 'https://images.unsplash.com/photo-1490474418585-ba9bad8fd0ea?w=100&h=100&fit=crop' },
    ],
  },
  {
    id: 5,
    name: '素食健康套餐',
    description: '全素精选，健康营养，适合素食主义者和健康饮食需求',
    minPeople: 5,
    maxPeople: 30,
    pricePerPerson: 32,
    originalPricePerPerson: 48,
    image: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=400&h=300&fit=crop',
    tags: ['素食', '健康'],
    suitableFor: '5-30人',
    dishes: [
      { id: 1, name: '罗汉斋', quantity: '1份', image: 'https://images.unsplash.com/photo-1459411552884-83997929f892?w=100&h=100&fit=crop' },
      { id: 2, name: '地三鲜', quantity: '1份', image: 'https://images.unsplash.com/photo-1540420773420-3366772f45b7?w=100&h=100&fit=crop' },
      { id: 3, name: '香菇青菜', quantity: '1份', image: 'https://images.unsplash.com/photo-1512058564366-18510be2db19?w=100&h=100&fit=crop' },
      { id: 4, name: '豆腐煲', quantity: '1份', image: 'https://images.unsplash.com/photo-158245290262144487d442163?w=100&h=100&fit=crop' },
      { id: 5, name: '凉拌木耳', quantity: '1份', image: 'https://images.unsplash.com/photo-1490645935967-104de7a63689?w=100&h=100&fit=crop' },
      { id: 6, name: '养生汤', quantity: '1份', image: 'https://images.unsplash.com/photo-1547592166-23ac45744acd?w=100&h=100&fit=crop' },
    ],
  },
]

const timeSlots: GroupMealTimeSlot[] = [
  { id: '1', label: '午餐 11:30-12:30', startTime: '11:30', endTime: '12:30', available: true },
  { id: '2', label: '午餐 12:00-13:00', startTime: '12:00', endTime: '13:00', available: true },
  { id: '3', label: '午餐 12:30-13:30', startTime: '12:30', endTime: '13:30', available: true },
  { id: '4', label: '晚餐 17:30-18:30', startTime: '17:30', endTime: '18:30', available: true },
  { id: '5', label: '晚餐 18:00-19:00', startTime: '18:00', endTime: '19:00', available: false },
  { id: '6', label: '晚餐 18:30-19:30', startTime: '18:30', endTime: '19:30', available: true },
]

export function getGroupMealPackages(peopleCount?: number): GroupMealPackage[] {
  if (peopleCount) {
    return dishesData.filter(
      (pkg) => peopleCount >= pkg.minPeople && peopleCount <= pkg.maxPeople
    )
  }
  return dishesData
}

export function getGroupMealPackageById(id: number): GroupMealPackage | undefined {
  return dishesData.find((pkg) => pkg.id === id)
}

export function getTimeSlots(): GroupMealTimeSlot[] {
  return timeSlots
}

export function getAvailableDates(): string[] {
  const dates: string[] = []
  const today = new Date()
  for (let i = 0; i < 7; i++) {
    const date = new Date(today)
    date.setDate(today.getDate() + i)
    dates.push(date.toISOString().split('T')[0])
  }
  return dates
}

function generateGroupMealOrderNo(): string {
  return `GM${Date.now()}${Math.floor(Math.random() * 1000)
    .toString()
    .padStart(3, '0')}`
}

export function getGroupMealOrdersFromStorage(): GroupMealOrder[] {
  return getItem<GroupMealOrder[]>(GROUP_MEAL_ORDER_KEY) || []
}

export function saveGroupMealOrders(orders: GroupMealOrder[]): void {
  setItem(GROUP_MEAL_ORDER_KEY, orders)
}

export function createGroupMealOrder(params: {
  items: any
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
}): GroupMealOrder {
  const orders = getGroupMealOrdersFromStorage()
  const timeSlot = timeSlots.find(t => t.id === params.timeSlotId)
  const order: GroupMealOrder = {
    id: Date.now(),
    orderNo: generateGroupMealOrderNo(),
    items: params.items,
    peopleCount: params.peopleCount,
    deliveryDate: params.deliveryDate,
    timeSlotId: params.timeSlotId,
    timeSlotLabel: timeSlot?.label || '',
    companyName: params.companyName,
    contactName: params.contactName,
    contactPhone: params.contactPhone,
    address: params.address,
    remark: params.remark,
    totalAmount: params.totalAmount,
    payAmount: params.payAmount,
    status: 'pending',
    createdAt: new Date().toISOString(),
  }
  orders.unshift(order)
  saveGroupMealOrders(orders)
  return order
}

export function getGroupMealOrders(status?: string): GroupMealOrder[] {
  let orders = getGroupMealOrdersFromStorage()
  if (status) {
    orders = orders.filter((o) => o.status === status)
  }
  return orders
}

export function getGroupMealOrderById(id: number): GroupMealOrder | undefined {
  const orders = getGroupMealOrdersFromStorage()
  return orders.find((o) => o.id === id)
}
