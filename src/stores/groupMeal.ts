import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import {
  getGroupMealPackages,
  getGroupMealPackageById,
  getTimeSlots,
  getAvailableDates,
  createGroupMealOrder as createGroupMealOrderApi,
  getGroupMealOrders,
  getGroupMealOrderById,
} from '@/api/groupMeal'
import type {
  GroupMealPackage,
  GroupMealTimeSlot,
  GroupMealOrder,
  GroupMealOrderItem,
  CreateGroupMealOrderParams,
} from '@/types'

export const useGroupMealStore = defineStore('groupMeal', () => {
  const packages = ref<GroupMealPackage[]>([])
  const filteredPackages = ref<GroupMealPackage[]>([])
  const timeSlots = ref<GroupMealTimeSlot[]>([])
  const availableDates = ref<string[]>([])
  const myOrders = ref<GroupMealOrder[]>([])
  const currentOrder = ref<GroupMealOrder | null>(null)
  const selectedPackage = ref<GroupMealPackage | null>(null)
  const peopleCount = ref<number>(10)
  const selectedDate = ref<string>('')
  const selectedTimeSlot = ref<GroupMealTimeSlot | null>(null)
  const orderItems = ref<GroupMealOrderItem[]>([])

  const totalAmount = computed(() => {
    return orderItems.value.reduce((sum, item) => sum + item.subtotal, 0)
  })

  const payAmount = computed(() => {
    return totalAmount.value
  })

  async function fetchPackages() {
    try {
      const { data } = await getGroupMealPackages()
      packages.value = data
      filteredPackages.value = data
      console.log('[GroupMeal] 获取团餐套餐列表成功，数量:', data.length)
    } catch (e) {
      console.error('[GroupMeal] 获取团餐套餐列表失败', e)
      throw e
    }
  }

  async function filterPackagesByPeople(count: number) {
    try {
      peopleCount.value = count
      const { data } = await getGroupMealPackages(count)
      filteredPackages.value = data
      console.log('[GroupMeal] 按人数筛选套餐成功，数量:', data.length, '人数:', count)
    } catch (e) {
      console.error('[GroupMeal] 筛选套餐失败', e)
      throw e
    }
  }

  async function fetchPackageById(id: number) {
    try {
      const { data } = await getGroupMealPackageById(id)
      if (data) {
        selectedPackage.value = data
      }
      return data
    } catch (e) {
      console.error('[GroupMeal] 获取套餐详情失败', e)
      throw e
    }
  }

  async function fetchTimeSlots() {
    try {
      const { data } = await getTimeSlots()
      timeSlots.value = data
      console.log('[GroupMeal] 获取配送时段成功，数量:', data.length)
    } catch (e) {
      console.error('[GroupMeal] 获取配送时段失败', e)
      throw e
    }
  }

  async function fetchAvailableDates() {
    try {
      const { data } = await getAvailableDates()
      availableDates.value = data
      if (data.length > 0 && !selectedDate.value) {
        selectedDate.value = data[0]
      }
      console.log('[GroupMeal] 获取可选日期成功，数量:', data.length)
    } catch (e) {
      console.error('[GroupMeal] 获取可选日期失败', e)
      throw e
    }
  }

  function selectPackage(pkg: GroupMealPackage) {
    selectedPackage.value = pkg
    orderItems.value = [
      {
        packageId: pkg.id,
        packageName: pkg.name,
        packageImage: pkg.image,
        peopleCount: peopleCount.value,
        pricePerPerson: pkg.pricePerPerson,
        subtotal: pkg.pricePerPerson * peopleCount.value,
      },
    ]
  }

  function setPeopleCount(count: number) {
    peopleCount.value = count
    if (selectedPackage.value) {
      orderItems.value[0].peopleCount = count
      orderItems.value[0].subtotal = selectedPackage.value.pricePerPerson * count
    }
  }

  function setSelectedDate(date: string) {
    selectedDate.value = date
  }

  function setSelectedTimeSlot(slot: GroupMealTimeSlot) {
    selectedTimeSlot.value = slot
  }

  async function createOrder(params: Omit<CreateGroupMealOrderParams, 'items' | 'peopleCount' | 'totalAmount' | 'payAmount' | 'deliveryDate' | 'timeSlotId'>) {
    if (!selectedPackage.value || !selectedDate.value || !selectedTimeSlot.value) {
      throw new Error('请选择套餐、日期和配送时段')
    }
    try {
      const orderParams: CreateGroupMealOrderParams = {
        items: orderItems.value,
        peopleCount: peopleCount.value,
        deliveryDate: selectedDate.value,
        timeSlotId: selectedTimeSlot.value.id,
        totalAmount: totalAmount.value,
        payAmount: payAmount.value,
        ...params,
      }
      const { data } = await createGroupMealOrderApi(orderParams)
      await fetchMyOrders()
      console.log('[GroupMeal] 创建团餐订单成功:', data.orderNo)
      return data
    } catch (e) {
      console.error('[GroupMeal] 创建团餐订单失败', e)
      throw e
    }
  }

  async function fetchMyOrders() {
    try {
      const { data } = await getGroupMealOrders()
      myOrders.value = data
      console.log('[GroupMeal] 获取我的团餐订单成功，数量:', data.length)
    } catch (e) {
      console.error('[GroupMeal] 获取我的团餐订单失败', e)
      throw e
    }
  }

  async function fetchOrderById(id: number) {
    try {
      const { data } = await getGroupMealOrderById(id)
      currentOrder.value = data || null
      return data
    } catch (e) {
      console.error('[GroupMeal] 获取订单详情失败', e)
      throw e
    }
  }

  function resetSelection() {
    selectedPackage.value = null
    selectedDate.value = ''
    selectedTimeSlot.value = null
    orderItems.value = []
    peopleCount.value = 10
  }

  return {
    packages,
    filteredPackages,
    timeSlots,
    availableDates,
    myOrders,
    currentOrder,
    selectedPackage,
    peopleCount,
    selectedDate,
    selectedTimeSlot,
    orderItems,
    totalAmount,
    payAmount,
    fetchPackages,
    filterPackagesByPeople,
    fetchPackageById,
    fetchTimeSlots,
    fetchAvailableDates,
    selectPackage,
    setPeopleCount,
    setSelectedDate,
    setSelectedTimeSlot,
    createOrder,
    fetchMyOrders,
    fetchOrderById,
    resetSelection,
  }
}, {
  persist: {
    pick: ['myOrders'],
  },
})
