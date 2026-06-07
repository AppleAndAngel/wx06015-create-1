import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import {
  getNearbyStores,
  getStoreById,
  getPickupTimeSlots,
  createPickupCode,
  getPickupCodeByOrderId,
  getMyPickupCodes,
  markAsPicked,
} from '@/api/pickup'
import type { PickupStore, PickupTimeSlot, PickupCode, DeliveryType, PickupInfo } from '@/types'

export const usePickupStore = defineStore(
  'pickup',
  () => {
    const stores = ref<PickupStore[]>([])
    const timeSlots = ref<PickupTimeSlot[]>([])
    const pickupCodes = ref<PickupCode[]>([])
    const currentPickupCode = ref<PickupCode | null>(null)
    const selectedStore = ref<PickupStore | null>(null)
    const selectedTimeSlot = ref<PickupTimeSlot | null>(null)
    const deliveryType = ref<DeliveryType>('delivery')
    const loading = ref(false)

    const pickupInfo = computed<PickupInfo>(() => ({
      store: selectedStore.value,
      timeSlot: selectedTimeSlot.value,
    }))

    const isPickupReady = computed(() => {
      return deliveryType.value === 'delivery' || (selectedStore.value && selectedTimeSlot.value)
    })

    async function fetchNearbyStores(latitude?: number, longitude?: number) {
      loading.value = true
      try {
        const { data } = await getNearbyStores(latitude, longitude)
        stores.value = data
        if (data.length > 0 && !selectedStore.value) {
          selectedStore.value = data[0]
        }
        return data
      } finally {
        loading.value = false
      }
    }

    async function fetchStoreById(id: number) {
      loading.value = true
      try {
        const { data } = await getStoreById(id)
        return data
      } finally {
        loading.value = false
      }
    }

    async function fetchTimeSlots(storeId: number) {
      loading.value = true
      try {
        const { data } = await getPickupTimeSlots(storeId)
        timeSlots.value = data
        return data
      } finally {
        loading.value = false
      }
    }

    async function generatePickupCode(
      orderId: number,
      orderNo: string,
      storeId: number,
      storeName: string,
      storeAddress: string,
      timeSlotLabel: string
    ) {
      loading.value = true
      try {
        const { data } = await createPickupCode(
          orderId,
          orderNo,
          storeId,
          storeName,
          storeAddress,
          timeSlotLabel
        )
        currentPickupCode.value = data
        return data
      } finally {
        loading.value = false
      }
    }

    async function fetchPickupCodeByOrderId(orderId: number) {
      loading.value = true
      try {
        const { data } = await getPickupCodeByOrderId(orderId)
        if (data) {
          currentPickupCode.value = data
        }
        return data
      } finally {
        loading.value = false
      }
    }

    async function fetchMyPickupCodes() {
      loading.value = true
      try {
        const { data } = await getMyPickupCodes()
        pickupCodes.value = data
        return data
      } finally {
        loading.value = false
      }
    }

    async function confirmPickup(pickupCodeId: number) {
      loading.value = true
      try {
        const { data } = await markAsPicked(pickupCodeId)
        if (data && currentPickupCode.value?.id === pickupCodeId) {
          currentPickupCode.value = data
        }
        const index = pickupCodes.value.findIndex((c) => c.id === pickupCodeId)
        if (index !== -1 && data) {
          pickupCodes.value[index] = data
        }
        return data
      } finally {
        loading.value = false
      }
    }

    function setDeliveryType(type: DeliveryType) {
      deliveryType.value = type
    }

    function selectStore(store: PickupStore) {
      selectedStore.value = store
      selectedTimeSlot.value = null
      timeSlots.value = []
    }

    function selectTimeSlot(slot: PickupTimeSlot) {
      selectedTimeSlot.value = slot
    }

    function resetSelection() {
      selectedStore.value = null
      selectedTimeSlot.value = null
      timeSlots.value = []
    }

    function clearCurrentPickupCode() {
      currentPickupCode.value = null
    }

    return {
      stores,
      timeSlots,
      pickupCodes,
      currentPickupCode,
      selectedStore,
      selectedTimeSlot,
      deliveryType,
      loading,
      pickupInfo,
      isPickupReady,
      fetchNearbyStores,
      fetchStoreById,
      fetchTimeSlots,
      generatePickupCode,
      fetchPickupCodeByOrderId,
      fetchMyPickupCodes,
      confirmPickup,
      setDeliveryType,
      selectStore,
      selectTimeSlot,
      resetSelection,
      clearCurrentPickupCode,
    }
  },
  {
    persist: {
      pick: ['deliveryType', 'selectedStore', 'selectedTimeSlot'],
    },
  }
)
