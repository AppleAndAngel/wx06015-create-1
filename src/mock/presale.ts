import type { PresaleDay, PresaleProduct, Reservation } from '@/types'
import { products } from './products'

function getProductById(id: number) {
  return products.find((p) => p.id === id) || products[0]
}

function addDays(date: Date, days: number): string {
  const result = new Date(date)
  result.setDate(result.getDate() + days)
  return result.toISOString().split('T')[0]
}

const presaleProducts: PresaleProduct[] = [
  {
    id: 1,
    productId: 2,
    product: getProductById(2),
    presalePrice: 29.9,
    originalPrice: 39.9,
    saleTime: addDays(new Date(), 1),
    endTime: addDays(new Date(), 3),
    stock: 100,
    reservationCount: 45,
    seasonTag: '应季',
    description: '海南金煌芒果，果肉细腻甜度爆表',
  },
  {
    id: 2,
    productId: 3,
    product: getProductById(3),
    presalePrice: 49.9,
    originalPrice: 69.9,
    saleTime: addDays(new Date(), 2),
    endTime: addDays(new Date(), 4),
    stock: 50,
    reservationCount: 32,
    seasonTag: '限量',
    description: '云南高山蓝莓，颗颗饱满花青素满满',
  },
]

const myReservations: Reservation[] = [
  {
    id: 1,
    presaleProductId: 1,
    productName: '海南金煌芒果',
    productImage: getProductById(2).images[0],
    saleTime: addDays(new Date(), 1),
    createdAt: addDays(new Date(), -2),
    notified: false,
  },
]

export function getPresaleCalendar(): Promise<PresaleDay[]> {
  const weekdays = ['周日', '周一', '周二', '周三', '周四', '周五', '周六']
  const days: PresaleDay[] = []
  
  for (let i = 0; i < 7; i++) {
    const date = addDays(new Date(), i)
    const dayOfWeek = new Date(date).getDay()
    days.push({
      date,
      weekday: weekdays[dayOfWeek],
      isToday: i === 0,
      products: i < 3 ? presaleProducts : [],
    })
  }
  
  return Promise.resolve(days)
}

export function getPresaleProductsByDate(date: string): Promise<PresaleProduct[]> {
  return Promise.resolve(presaleProducts)
}

export function getPresaleProductById(id: number): Promise<PresaleProduct | undefined> {
  return Promise.resolve(presaleProducts.find((p) => p.id === id))
}

export function createReservation(presaleProductId: number): Promise<Reservation> {
  const product = presaleProducts.find((p) => p.id === presaleProductId)
  if (!product) {
    return Promise.reject(new Error('商品不存在'))
  }
  
  const reservation: Reservation = {
    id: Date.now(),
    presaleProductId,
    productName: product.product.name,
    productImage: product.product.images[0],
    saleTime: product.saleTime,
    createdAt: new Date().toISOString().split('T')[0],
    notified: false,
  }
  
  myReservations.unshift(reservation)
  return Promise.resolve(reservation)
}

export function cancelReservation(presaleProductId: number): Promise<void> {
  const index = myReservations.findIndex((r) => r.presaleProductId === presaleProductId)
  if (index !== -1) {
    myReservations.splice(index, 1)
  }
  return Promise.resolve()
}

export function getMyReservations(): Promise<Reservation[]> {
  return Promise.resolve([...myReservations])
}

export function checkReservationStatus(presaleProductId: number): Promise<boolean> {
  return Promise.resolve(myReservations.some((r) => r.presaleProductId === presaleProductId))
}
