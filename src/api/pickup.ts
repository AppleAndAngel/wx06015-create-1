import type { PickupStore, PickupTimeSlot, PickupCode } from '@/types'
import {
  getNearbyStores as getNearbyStoresMock,
  getStoreById as getStoreByIdMock,
  getPickupTimeSlots as getPickupTimeSlotsMock,
  createPickupCode as createPickupCodeMock,
  getPickupCodeByOrderId as getPickupCodeByOrderIdMock,
  getMyPickupCodes as getMyPickupCodesMock,
  markAsPicked as markAsPickedMock,
} from '@/mock/pickup'

export function getNearbyStores(latitude?: number, longitude?: number): Promise<{ data: PickupStore[] }> {
  return getNearbyStoresMock(latitude, longitude).then((data) => ({ data }))
}

export function getStoreById(id: number): Promise<{ data: PickupStore | undefined }> {
  return getStoreByIdMock(id).then((data) => ({ data }))
}

export function getPickupTimeSlots(storeId: number): Promise<{ data: PickupTimeSlot[] }> {
  return getPickupTimeSlotsMock(storeId).then((data) => ({ data }))
}

export function createPickupCode(
  orderId: number,
  orderNo: string,
  storeId: number,
  storeName: string,
  storeAddress: string,
  timeSlotLabel: string
): Promise<{ data: PickupCode }> {
  return createPickupCodeMock(orderId, orderNo, storeId, storeName, storeAddress, timeSlotLabel).then((data) => ({ data }))
}

export function getPickupCodeByOrderId(orderId: number): Promise<{ data: PickupCode | undefined }> {
  return getPickupCodeByOrderIdMock(orderId).then((data) => ({ data }))
}

export function getMyPickupCodes(): Promise<{ data: PickupCode[] }> {
  return getMyPickupCodesMock().then((data) => ({ data }))
}

export function markAsPicked(pickupCodeId: number): Promise<{ data: PickupCode | undefined }> {
  return markAsPickedMock(pickupCodeId).then((data) => ({ data }))
}
