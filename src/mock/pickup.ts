import type { PickupStore, PickupTimeSlot, PickupCode } from '@/types'
import { getItem, setItem } from '@/utils/storage'
import dayjs from 'dayjs'

const PICKUP_CODE_KEY = 'pickupCodes'

const mockStores: PickupStore[] = [
  {
    id: 1,
    name: '鲜集优品·朝阳门店',
    address: '北京市朝阳区朝阳门外大街18号丰联广场B1层',
    phone: '010-8888-1234',
    distance: '500m',
    distanceValue: 0.5,
    businessHours: '08:00 - 22:00',
    latitude: 39.9245,
    longitude: 116.4416,
    tags: ['24小时营业', '支持冷藏', '停车方便']
  },
  {
    id: 2,
    name: '鲜集优品·国贸店',
    address: '北京市朝阳区建国门外大街1号国贸商城B2层',
    phone: '010-8888-2345',
    distance: '1.2km',
    distanceValue: 1.2,
    businessHours: '09:00 - 21:00',
    latitude: 39.9127,
    longitude: 116.4615,
    tags: ['支持冷藏', '免排队']
  },
  {
    id: 3,
    name: '鲜集优品·三里屯店',
    address: '北京市朝阳区三里屯路19号太古里南区B1层',
    phone: '010-8888-3456',
    distance: '2.3km',
    distanceValue: 2.3,
    businessHours: '10:00 - 22:00',
    latitude: 39.9372,
    longitude: 116.4526,
    tags: ['支持冷藏', '支持冷冻', '新开业']
  },
  {
    id: 4,
    name: '鲜集优品·望京店',
    address: '北京市朝阳区望京街9号望京SOHO T1座B1层',
    phone: '010-8888-4567',
    distance: '3.5km',
    distanceValue: 3.5,
    businessHours: '08:00 - 21:30',
    latitude: 39.9986,
    longitude: 116.4742,
    tags: ['24小时营业', '支持冷藏', '停车方便']
  },
  {
    id: 5,
    name: '鲜集优品·五道口店',
    address: '北京市海淀区成府路28号五道口购物中心B1层',
    phone: '010-8888-5678',
    distance: '5.8km',
    distanceValue: 5.8,
    businessHours: '09:00 - 22:00',
    latitude: 39.9929,
    longitude: 116.3466,
    tags: ['支持冷藏', '学生优惠']
  }
]

function generateTimeSlots(): PickupTimeSlot[] {
  const slots: PickupTimeSlot[] = []
  const today = dayjs()
  const now = dayjs()

  for (let i = 0; i < 3; i++) {
    const date = today.add(i, 'day')
    const isToday = i === 0

    const timeRanges = [
      { start: 9, end: 11, label: '上午' },
      { start: 11, end: 13, label: '中午' },
      { start: 13, end: 15, label: '下午' },
      { start: 15, end: 17, label: '下午' },
      { start: 17, end: 19, label: '傍晚' },
      { start: 19, end: 21, label: '晚间' }
    ]

    timeRanges.forEach((range, idx) => {
      const slotDate = isToday ? date : date
      const startTime = slotDate.hour(range.start).minute(0).second(0)
      const endTime = slotDate.hour(range.end).minute(0).second(0)

      let available = true
      if (isToday && endTime.isBefore(now)) {
        available = false
      }

      const capacity = 30
      const used = available ? Math.floor(Math.random() * 25) : capacity

      slots.push({
        id: `${date.format('YYYYMMDD')}-${idx}`,
        label: `${isToday ? '今天' : i === 1 ? '明天' : '后天'} ${range.start}:00-${range.end}:00`,
        startTime: startTime.toISOString(),
        endTime: endTime.toISOString(),
        available,
        capacity,
        used
      })
    })
  }

  return slots
}

function generatePickupCode(orderId: number, orderNo: string, storeId: number, storeName: string, storeAddress: string, timeSlotLabel: string): PickupCode {
  const code = Math.floor(100000 + Math.random() * 900000).toString()
  return {
    id: Date.now(),
    orderId,
    orderNo,
    code,
    qrCode: `pickup://${orderId}/${code}`,
    storeId,
    storeName,
    storeAddress,
    timeSlotLabel,
    pickupDeadline: dayjs().add(2, 'day').toISOString(),
    status: 'pending',
    createdAt: new Date().toISOString()
  }
}

function getPickupCodesFromStorage(): PickupCode[] {
  return getItem<PickupCode[]>(PICKUP_CODE_KEY) || []
}

function delay(ms: number = 300): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

export function getNearbyStores(latitude?: number, longitude?: number): Promise<PickupStore[]> {
  return delay().then(() => {
    let stores = [...mockStores]
    if (latitude && longitude) {
      stores = stores.map(store => {
        const distance = Math.sqrt(
          Math.pow(store.latitude - latitude, 2) + Math.pow(store.longitude - longitude, 2)
        ) * 111
        return {
          ...store,
          distanceValue: distance,
          distance: distance < 1 ? `${Math.round(distance * 1000)}m` : `${distance.toFixed(1)}km`
        }
      })
      stores.sort((a, b) => a.distanceValue - b.distanceValue)
    }
    return stores
  })
}

export function getStoreById(id: number): Promise<PickupStore | undefined> {
  return delay().then(() => {
    return mockStores.find(s => s.id === id)
  })
}

export function getPickupTimeSlots(storeId: number): Promise<PickupTimeSlot[]> {
  return delay().then(() => {
    return generateTimeSlots()
  })
}

export function createPickupCode(
  orderId: number,
  orderNo: string,
  storeId: number,
  storeName: string,
  storeAddress: string,
  timeSlotLabel: string
): Promise<PickupCode> {
  return delay().then(() => {
    const codes = getPickupCodesFromStorage()
    const pickupCode = generatePickupCode(orderId, orderNo, storeId, storeName, storeAddress, timeSlotLabel)
    codes.push(pickupCode)
    setItem(PICKUP_CODE_KEY, codes)
    return pickupCode
  })
}

export function getPickupCodeByOrderId(orderId: number): Promise<PickupCode | undefined> {
  return delay().then(() => {
    const codes = getPickupCodesFromStorage()
    return codes.find(c => c.orderId === orderId)
  })
}

export function getMyPickupCodes(): Promise<PickupCode[]> {
  return delay().then(() => {
    const codes = getPickupCodesFromStorage()
    return [...codes].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
  })
}

export function markAsPicked(pickupCodeId: number): Promise<PickupCode | undefined> {
  return delay().then(() => {
    const codes = getPickupCodesFromStorage()
    const code = codes.find(c => c.id === pickupCodeId)
    if (code) {
      code.status = 'picked'
      code.pickedAt = new Date().toISOString()
      setItem(PICKUP_CODE_KEY, codes)
    }
    return code
  })
}
