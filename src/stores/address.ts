import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import {
  fetchAddresses as fetchAddressesApi,
  addAddress as addAddressApi,
  updateAddress as updateAddressApi,
  deleteAddress as deleteAddressApi,
  setDefaultAddress as setDefaultAddressApi,
} from '@/api/address'
import type { Address } from '@/types'

export const useAddressStore = defineStore('address', () => {
  const addresses = ref<Address[]>([])

  const defaultAddress = computed(() =>
    addresses.value.find((addr) => addr.isDefault) ?? addresses.value[0] ?? null,
  )

  async function fetchAddresses() {
    const { data } = await fetchAddressesApi()
    addresses.value = data
  }

  async function addAddress(address: Omit<Address, 'id'>) {
    const { data } = await addAddressApi(address)
    addresses.value.push(data)
  }

  async function updateAddress(address: Address) {
    const { data } = await updateAddressApi(address)
    const index = addresses.value.findIndex((a) => a.id === address.id)
    if (index !== -1) {
      addresses.value[index] = data
    }
  }

  async function deleteAddress(id: number) {
    await deleteAddressApi(id)
    addresses.value = addresses.value.filter((a) => a.id !== id)
  }

  async function setDefault(id: number) {
    await setDefaultAddressApi(id)
    addresses.value.forEach((a) => {
      a.isDefault = a.id === id
    })
  }

  return {
    addresses,
    defaultAddress,
    fetchAddresses,
    addAddress,
    updateAddress,
    deleteAddress,
    setDefault,
  }
})
