import type { PresaleDay, PresaleProduct, Reservation } from '@/types'
import {
  getPresaleCalendar as mockGetPresaleCalendar,
  getPresaleProductsByDate as mockGetPresaleProductsByDate,
  getPresaleProductById as mockGetPresaleProductById,
  createReservation as mockCreateReservation,
  cancelReservation as mockCancelReservation,
  getMyReservations as mockGetMyReservations,
  checkReservationStatus as mockCheckReservationStatus,
} from '@/mock/presale'

function delay(ms: number = 300): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

export function getPresaleCalendar(): Promise<{ data: PresaleDay[] }> {
  return delay().then(async () => {
    const data = await mockGetPresaleCalendar()
    console.log('[Presale] 获取预售日历成功，天数:', data.length)
    return { data }
  })
}

export function getPresaleProductsByDate(date: string): Promise<{ data: PresaleProduct[] }> {
  return delay().then(async () => {
    const data = await mockGetPresaleProductsByDate(date)
    console.log('[Presale] 获取指定日期预售商品成功，数量:', data.length)
    return { data }
  })
}

export function getPresaleProductById(id: number): Promise<{ data: PresaleProduct | undefined }> {
  return delay().then(async () => {
    const data = await mockGetPresaleProductById(id)
    console.log('[Presale] 获取预售商品详情成功:', data?.product.name)
    return { data }
  })
}

export function createReservation(presaleProductId: number): Promise<{ data: Reservation }> {
  return delay().then(async () => {
    const data = await mockCreateReservation(presaleProductId)
    console.log('[Presale] 预约成功:', data.productName)
    return { data }
  })
}

export function cancelReservation(presaleProductId: number): Promise<{ data: void }> {
  return delay().then(async () => {
    await mockCancelReservation(presaleProductId)
    console.log('[Presale] 取消预约成功，商品ID:', presaleProductId)
    return { data: undefined as void }
  })
}

export function getMyReservations(): Promise<{ data: Reservation[] }> {
  return delay().then(async () => {
    const data = await mockGetMyReservations()
    console.log('[Presale] 获取我的预约列表成功，数量:', data.length)
    return { data }
  })
}

export function checkReservationStatus(presaleProductId: number): Promise<{ data: boolean }> {
  return delay(150).then(async () => {
    const data = await mockCheckReservationStatus(presaleProductId)
    return { data }
  })
}
