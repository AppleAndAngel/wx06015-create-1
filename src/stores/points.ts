import { defineStore } from 'pinia'
import Taro from '@tarojs/taro'
import type { PointsProduct, ExchangeRecord, PointsRecord, Address } from '@/types'
import { pointsProducts, initialPointsRecords, initialExchangeRecords } from '@/mock/points'
import { useAddressStore } from './address'

export const usePointsStore = defineStore('points', {
  state: () => ({
    userPoints: 900,
    pointsRecords: [...initialPointsRecords] as PointsRecord[],
    exchangeRecords: [...initialExchangeRecords] as ExchangeRecord[],
    products: [...pointsProducts] as PointsProduct[]
  }),

  getters: {
    totalEarned: (state) => state.pointsRecords
      .filter(r => r.type === 'earn')
      .reduce((sum, r) => sum + r.points, 0),
    totalSpent: (state) => state.pointsRecords
      .filter(r => r.type === 'spend')
      .reduce((sum, r) => sum + r.points, 0),
    snackProducts: (state) => state.products.filter(p => p.category === 'snack'),
    couponProducts: (state) => state.products.filter(p => p.category === 'coupon'),
    merchandiseProducts: (state) => state.products.filter(p => p.category === 'merchandise')
  },

  actions: {
    getProducts(): PointsProduct[] {
      return this.products
    },

    getProductsByCategory(category: string): PointsProduct[] {
      if (category === 'all') return this.products
      return this.products.filter(p => p.category === category)
    },

    addPoints(points: number, description: string, relatedId?: string) {
      const record: PointsRecord = {
        id: `pr${Date.now()}`,
        type: 'earn',
        points,
        description,
        relatedId,
        createdAt: Date.now()
      }
      this.pointsRecords.unshift(record)
      this.userPoints += points
      console.log('[Points] 获得积分:', points, description)
    },

    exchangeProduct(productId: string, quantity: number = 1, addressId?: string): boolean {
      const product = this.products.find(p => p.id === productId)
      if (!product) {
        Taro.showToast({ title: '商品不存在', icon: 'none' })
        return false
      }

      if (product.stock < quantity) {
        Taro.showToast({ title: '库存不足', icon: 'none' })
        return false
      }

      const totalPoints = product.points * quantity
      if (this.userPoints < totalPoints) {
        Taro.showToast({ title: '积分不足', icon: 'none' })
        return false
      }

      if (product.exchangeLimit) {
        const userExchangeCount = this.exchangeRecords.filter(
          r => r.product.id === productId
        ).reduce((sum, r) => sum + r.quantity, 0)
        if (userExchangeCount + quantity > product.exchangeLimit) {
          Taro.showToast({ title: `每人限兑${product.exchangeLimit}件`, icon: 'none' })
          return false
        }
      }

      let address: Address | undefined
      if (product.category !== 'coupon' && addressId) {
        const addressStore = useAddressStore()
        address = addressStore.addressList.find(a => a.id === addressId) || addressStore.getDefaultAddress()
      }

      const exchangeRecord: ExchangeRecord = {
        id: `er${Date.now()}`,
        product: { ...product },
        quantity,
        totalPoints,
        status: 'pending',
        statusText: '待发货',
        exchangedAt: Date.now(),
        address
      }

      this.exchangeRecords.unshift(exchangeRecord)

      const pointsRecord: PointsRecord = {
        id: `pr${Date.now()}`,
        type: 'spend',
        points: totalPoints,
        description: `兑换${product.name}`,
        relatedId: exchangeRecord.id,
        createdAt: Date.now()
      }
      this.pointsRecords.unshift(pointsRecord)

      this.userPoints -= totalPoints
      product.stock -= quantity
      product.sales += quantity

      console.log('[Points] 兑换成功:', product.name, '数量:', quantity, '消耗积分:', totalPoints)
      Taro.showToast({ title: '兑换成功', icon: 'success' })
      return true
    },

    getExchangeRecords(): ExchangeRecord[] {
      return this.exchangeRecords
    },

    getExchangeRecordsByStatus(status?: string): ExchangeRecord[] {
      if (!status || status === 'all') return this.exchangeRecords
      return this.exchangeRecords.filter(r => r.status === status)
    },

    getPointsRecords(): PointsRecord[] {
      return this.pointsRecords
    },

    cancelExchange(recordId: string): boolean {
      const record = this.exchangeRecords.find(r => r.id === recordId)
      if (!record || record.status !== 'pending') {
        Taro.showToast({ title: '无法取消', icon: 'none' })
        return false
      }

      record.status = 'cancelled'
      record.statusText = '已取消'

      const pointsRecord: PointsRecord = {
        id: `pr${Date.now()}`,
        type: 'earn',
        points: record.totalPoints,
        description: `取消兑换${record.product.name}，积分退回`,
        relatedId: recordId,
        createdAt: Date.now()
      }
      this.pointsRecords.unshift(pointsRecord)
      this.userPoints += record.totalPoints

      const product = this.products.find(p => p.id === record.product.id)
      if (product) {
        product.stock += record.quantity
        product.sales -= record.quantity
      }

      console.log('[Points] 取消兑换:', record.product.name, '退还积分:', record.totalPoints)
      Taro.showToast({ title: '已取消，积分退回', icon: 'success' })
      return true
    },

    confirmReceive(recordId: string): boolean {
      const record = this.exchangeRecords.find(r => r.id === recordId)
      if (!record || record.status !== 'shipped') {
        Taro.showToast({ title: '操作失败', icon: 'none' })
        return false
      }

      record.status = 'completed'
      record.statusText = '已完成'
      console.log('[Points] 确认收货:', record.product.name)
      Taro.showToast({ title: '确认收货成功', icon: 'success' })
      return true
    }
  }
})
