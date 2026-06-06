import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import {
  login as loginApi,
  getUserInfo as getUserInfoApi,
  claimNewUserCoupon as claimNewUserCouponApi,
  getCouponList as getCouponListApi,
  getNewUserZoneData as getNewUserZoneDataApi
} from '@/api/user'
import type { User, Coupon, NewUserZoneData } from '@/types'

export const useUserStore = defineStore('user', () => {
  const token = ref('')
  const userInfo = ref<User | null>(null)
  const coupons = ref<Coupon[]>([])
  const newUserZoneData = ref<NewUserZoneData | null>(null)

  const isLoggedIn = computed(() => !!token.value)
  const isNewUser = computed(() => userInfo.value?.isNewUser ?? false)
  const hasClaimedNewUserCoupon = computed(() => userInfo.value?.hasClaimedNewUserCoupon ?? false)
  const availableCoupons = computed(() => coupons.value.filter(c => c.status === 'unused'))
  const usedCoupons = computed(() => coupons.value.filter(c => c.status === 'used'))
  const expiredCoupons = computed(() => coupons.value.filter(c => c.status === 'expired'))

  async function login(phone: string, code: string) {
    const { data } = await loginApi(phone, code)
    token.value = data.token
    userInfo.value = data.user
  }

  function logout() {
    token.value = ''
    userInfo.value = null
    coupons.value = []
    newUserZoneData.value = null
  }

  async function getUserInfo() {
    const { data } = await getUserInfoApi()
    userInfo.value = data
  }

  async function claimNewUserCoupon() {
    if (hasClaimedNewUserCoupon.value) {
      throw new Error('您已领取过新人优惠券')
    }
    const { data } = await claimNewUserCouponApi()
    coupons.value.unshift(data.coupon)
    if (userInfo.value) {
      userInfo.value.hasClaimedNewUserCoupon = true
    }
    return data.coupon
  }

  async function getCouponList() {
    const { data } = await getCouponListApi()
    coupons.value = data.list
    return data.list
  }

  async function getNewUserZoneData() {
    const { data } = await getNewUserZoneDataApi()
    newUserZoneData.value = data
    return data
  }

  function useCoupon(couponId: number) {
    const coupon = coupons.value.find(c => c.id === couponId)
    if (coupon) {
      coupon.status = 'used'
    }
  }

  function getBestCoupon(amount: number): Coupon | null {
    const validCoupons = availableCoupons.value.filter(c => {
      if (c.status !== 'unused') return false
      if (c.minAmount > amount) return false
      return true
    })
    if (validCoupons.length === 0) return null
    return validCoupons.reduce((best, current) => {
      const bestValue = best.type === 'fixed' ? best.value : amount * (1 - best.value / 100)
      const currentValue = current.type === 'fixed' ? current.value : amount * (1 - current.value / 100)
      return currentValue > bestValue ? current : best
    })
  }

  return {
    token,
    userInfo,
    coupons,
    newUserZoneData,
    isLoggedIn,
    isNewUser,
    hasClaimedNewUserCoupon,
    availableCoupons,
    usedCoupons,
    expiredCoupons,
    login,
    logout,
    getUserInfo,
    claimNewUserCoupon,
    getCouponList,
    getNewUserZoneData,
    useCoupon,
    getBestCoupon,
  }
}, {
  persist: {
    pick: ['token', 'userInfo', 'coupons'],
  },
})
