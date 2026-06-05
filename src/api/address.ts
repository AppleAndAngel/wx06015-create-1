import type { Address } from '@/types'
import { getItem, setItem } from '@/utils/storage'

const ADDRESS_KEY = 'addresses'

function delay(ms: number = 300): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

function getAddressesFromStorage(): Address[] {
  return getItem<Address[]>(ADDRESS_KEY) || []
}

export function getAddresses(): Promise<Address[]> {
  return delay().then(() => getAddressesFromStorage())
}

export function addAddress(address: Omit<Address, 'id'>): Promise<{ data: Address }> {
  return delay().then(() => {
    const addresses = getAddressesFromStorage()
    const newAddress: Address = { ...address, id: Date.now() }
    if (newAddress.isDefault) {
      addresses.forEach((a) => (a.isDefault = false))
    }
    addresses.push(newAddress)
    setItem(ADDRESS_KEY, addresses)
    return { data: newAddress }
  })
}

export function updateAddress(address: Address): Promise<{ data: Address }> {
  return delay().then(() => {
    const addresses = getAddressesFromStorage()
    const index = addresses.findIndex((a) => a.id === address.id)
    if (index !== -1) {
      if (address.isDefault) {
        addresses.forEach((a) => (a.isDefault = false))
      }
      addresses[index] = address
      setItem(ADDRESS_KEY, addresses)
    }
    return { data: address }
  })
}

export function deleteAddress(id: number): Promise<void> {
  return delay().then(() => {
    const addresses = getAddressesFromStorage().filter((a) => a.id !== id)
    setItem(ADDRESS_KEY, addresses)
  })
}

export function setDefaultAddress(id: number): Promise<void> {
  return delay().then(() => {
    const addresses = getAddressesFromStorage()
    addresses.forEach((a) => (a.isDefault = a.id === id))
    setItem(ADDRESS_KEY, addresses)
  })
}

export function fetchAddresses(): Promise<{ data: Address[] }> {
  return delay().then(() => ({ data: getAddressesFromStorage() }))
}
