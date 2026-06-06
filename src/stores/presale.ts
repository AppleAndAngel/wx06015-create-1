import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import {
  getPresaleCalendar,
  getPresaleProductsByDate,
  getPresaleProductById,
  createReservation as createReservationApi,
  cancelReservation as cancelReservationApi,
  getMyReservations,
  checkReservationStatus,
} from '@/api/presale'
import type { PresaleDay, PresaleProduct, Reservation } from '@/types'

export const usePresaleStore = defineStore('presale', () => {
  const calendar = ref<PresaleDay[]>([])
  const reservations = ref<Reservation[]>([])
  const currentProduct = ref<PresaleProduct | null>(null)
  const selectedDate = ref<string>('')
  const loading = ref(false)

  const todayProducts = computed(() => {
    const today = calendar.value.find((d) => d.isToday)
    return today?.products || []
  })

  const selectedDateProducts = computed(() => {
    if (!selectedDate.value) return []
    const day = calendar.value.find((d) => d.date === selectedDate.value)
    return day?.products || []
  })

  const upcomingProducts = computed(() => {
    return calendar.value
      .filter((d) => !d.isToday)
      .flatMap((d) => d.products)
  })

  const reservationProductIds = computed(() => {
    return new Set(reservations.value.map((r) => r.presaleProductId))
  })

  async function fetchCalendar() {
    try {
      loading.value = true
      const { data } = await getPresaleCalendar()
      calendar.value = data
      if (!selectedDate.value && data.length > 0) {
        selectedDate.value = data[0].date
      }
      console.log('[Presale] 获取预售日历成功，共', data.length, '天')
    } catch (e) {
      console.error('[Presale] 获取预售日历失败', e)
      throw e
    } finally {
      loading.value = false
    }
  }

  async function fetchProductsByDate(date: string) {
    try {
      const { data } = await getPresaleProductsByDate(date)
      const dayIndex = calendar.value.findIndex((d) => d.date === date)
      if (dayIndex !== -1) {
        calendar.value[dayIndex].products = data
      }
      return data
    } catch (e) {
      console.error('[Presale] 获取指定日期预售商品失败', e)
      throw e
    }
  }

  async function fetchProduct(id: number) {
    try {
      const { data } = await getPresaleProductById(id)
      currentProduct.value = data || null
      return data
    } catch (e) {
      console.error('[Presale] 获取预售商品详情失败', e)
      throw e
    }
  }

  async function createReservation(presaleProductId: number) {
    try {
      const { data } = await createReservationApi(presaleProductId)
      reservations.value.push(data)
      updateProductReservationCount(presaleProductId, 1)
      console.log('[Presale] 预约成功:', data.productName)
      return data
    } catch (e) {
      console.error('[Presale] 预约失败', e)
      throw e
    }
  }

  async function cancelReservation(presaleProductId: number) {
    try {
      await cancelReservationApi(presaleProductId)
      const index = reservations.value.findIndex(
        (r) => r.presaleProductId === presaleProductId
      )
      if (index !== -1) {
        reservations.value.splice(index, 1)
      }
      updateProductReservationCount(presaleProductId, -1)
      console.log('[Presale] 取消预约成功')
    } catch (e) {
      console.error('[Presale] 取消预约失败', e)
      throw e
    }
  }

  async function fetchMyReservations() {
    try {
      const { data } = await getMyReservations()
      reservations.value = data
      console.log('[Presale] 获取我的预约成功，数量:', data.length)
    } catch (e) {
      console.error('[Presale] 获取我的预约失败', e)
      throw e
    }
  }

  async function isReserved(presaleProductId: number): Promise<boolean> {
    if (reservationProductIds.value.has(presaleProductId)) {
      return true
    }
    try {
      const { data } = await checkReservationStatus(presaleProductId)
      return data
    } catch (e) {
      return false
    }
  }

  function updateProductReservationCount(presaleProductId: number, delta: number) {
    for (const day of calendar.value) {
      const product = day.products.find((p) => p.id === presaleProductId)
      if (product) {
        product.reservationCount = Math.max(0, product.reservationCount + delta)
        break
      }
    }
  }

  function setSelectedDate(date: string) {
    selectedDate.value = date
  }

  function isReservedSync(presaleProductId: number): boolean {
    return reservationProductIds.value.has(presaleProductId)
  }

  return {
    calendar,
    reservations,
    currentProduct,
    selectedDate,
    loading,
    todayProducts,
    selectedDateProducts,
    upcomingProducts,
    reservationProductIds,
    fetchCalendar,
    fetchProductsByDate,
    fetchProduct,
    createReservation,
    cancelReservation,
    fetchMyReservations,
    isReserved,
    setSelectedDate,
    isReservedSync,
  }
}, {
  persist: {
    pick: ['reservations'],
  },
})
