import { defineStore } from 'pinia'
import Taro from '@tarojs/taro'
import type { Address } from '@/types'

const generateId = () => 'addr_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9)

export const useAddressStore = defineStore('address', {
  state: () => ({
    addressList: [
      {
        id: 'addr_default_1',
        name: '张女士',
        phone: '138****8888',
        province: '北京市',
        city: '北京市',
        district: '朝阳区',
        detail: '建国路88号SOHO现代城A座1201室',
        tag: '妈妈',
        isDefault: true,
        createdAt: Date.now() - 86400000 * 30
      },
      {
        id: 'addr_default_2',
        name: '李先生',
        phone: '139****6666',
        province: '上海市',
        city: '上海市',
        district: '浦东新区',
        detail: '陆家嘴环路1000号恒生银行大厦28层',
        tag: '朋友',
        isDefault: false,
        createdAt: Date.now() - 86400000 * 15
      }
    ] as Address[],
    selectedAddressId: null as string | null
  }),

  getters: {
    count: (state) => state.addressList.length,
    defaultAddress: (state) => state.addressList.find(addr => addr.isDefault),
    selectedAddress: (state) => {
      if (state.selectedAddressId) {
        return state.addressList.find(addr => addr.id === state.selectedAddressId)
      }
      return state.addressList.find(addr => addr.isDefault)
    },
    sortedList: (state) => {
      return [...state.addressList].sort((a, b) => {
        if (a.isDefault && !b.isDefault) return -1
        if (!a.isDefault && b.isDefault) return 1
        return b.createdAt - a.createdAt
      })
    }
  },

  actions: {
    addAddress(address: Omit<Address, 'id' | 'createdAt'>) {
      const newAddress: Address = {
        ...address,
        id: generateId(),
        createdAt: Date.now()
      }

      if (address.isDefault || this.addressList.length === 0) {
        this.addressList.forEach(addr => {
          addr.isDefault = false
        })
        newAddress.isDefault = true
      }

      this.addressList.push(newAddress)
      console.log('[Address] 已添加地址:', newAddress.name, newAddress.tag)
      Taro.showToast({
        title: '添加成功',
        icon: 'success'
      })
      return newAddress
    },

    updateAddress(id: string, updates: Partial<Omit<Address, 'id' | 'createdAt'>>) {
      const address = this.addressList.find(addr => addr.id === id)
      if (!address) return

      if (updates.isDefault) {
        this.addressList.forEach(addr => {
          addr.isDefault = false
        })
      }

      Object.assign(address, updates)
      console.log('[Address] 已更新地址:', address.name)
      Taro.showToast({
        title: '保存成功',
        icon: 'success'
      })
    },

    deleteAddress(id: string) {
      const index = this.addressList.findIndex(addr => addr.id === id)
      if (index > -1) {
        const wasDefault = this.addressList[index].isDefault
        const removed = this.addressList.splice(index, 1)[0]
        console.log('[Address] 已删除地址:', removed.name)

        if (wasDefault && this.addressList.length > 0) {
          this.addressList[0].isDefault = true
        }

        if (this.selectedAddressId === id) {
          this.selectedAddressId = null
        }

        Taro.showToast({
          title: '已删除',
          icon: 'success'
        })
      }
    },

    setDefault(id: string) {
      this.addressList.forEach(addr => {
        addr.isDefault = addr.id === id
      })
      const address = this.addressList.find(addr => addr.id === id)
      if (address) {
        console.log('[Address] 已设为默认地址:', address.name)
        Taro.showToast({
          title: '已设为默认',
          icon: 'success'
        })
      }
    },

    selectAddress(id: string) {
      this.selectedAddressId = id
      const address = this.addressList.find(addr => addr.id === id)
      if (address) {
        console.log('[Address] 已选择地址:', address.name)
      }
    },

    getDefaultAddress(): Address | undefined {
      return this.addressList.find(addr => addr.isDefault)
    },

    getSelectedAddress(): Address | undefined {
      if (this.selectedAddressId) {
        return this.addressList.find(addr => addr.id === this.selectedAddressId)
      }
      return this.getDefaultAddress()
    }
  }
})
