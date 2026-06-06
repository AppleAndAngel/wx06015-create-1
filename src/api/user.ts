import type { User, Coupon, NewUserZoneData } from '@/types'
import { defaultUser } from '@/mock/users'
import { newUserCoupon, newUserZoneData as mockNewUserZoneData } from '@/mock/products'
import { getItem, setItem } from '@/utils/storage'

function delay(ms: number = 300): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

export function login(phone: string, code: string): Promise<{ data: { token: string; user: User } }> {
  return delay().then(() => {
    const user = { ...defaultUser, phone }
    setItem('user', user)
    setItem('token', user.token)
    return { data: { token: user.token, user } }
  })
}

export function getUserInfo(): Promise<{ data: User }> {
  return delay().then(() => {
    const user = getItem<User>('user') || defaultUser
    return { data: user }
  })
}

export function claimNewUserCoupon(): Promise<{ data: { coupon: Coupon } }> {
  return delay().then(() => {
    const user = getItem<User>('user')
    if (user) {
      user.hasClaimedNewUserCoupon = true
      setItem('user', user)
    }
    const coupon: Coupon = {
      ...newUserCoupon,
      id: Date.now(),
      startTime: new Date().toISOString(),
      endTime: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
    }
    const coupons = getItem<Coupon[]>('coupons') || []
    coupons.unshift(coupon)
    setItem('coupons', coupons)
    return { data: { coupon } }
  })
}

export function getCouponList(): Promise<{ data: { list: Coupon[] } }> {
  return delay().then(() => {
    const coupons = getItem<Coupon[]>('coupons') || []
    const now = Date.now()
    const list = coupons.map(c => {
      if (c.status === 'unused' && new Date(c.endTime).getTime() < now) {
        return { ...c, status: 'expired' as const }
      }
      return c
    })
    return { data: { list } }
  })
}

export function getNewUserZoneData(): Promise<{ data: NewUserZoneData }> {
  return delay().then(() => {
    return { data: mockNewUserZoneData }
  })
}
