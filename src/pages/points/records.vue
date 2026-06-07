<script setup lang="ts">
import { ref, computed } from 'vue'
import { View, Text, Image } from '@tarojs/components'
import Taro from '@tarojs/taro'
import { usePointsStore } from '@/stores/points'
import type { ExchangeRecord, PointsRecord } from '@/types'
import styles from './records.module.scss'

const pointsStore = usePointsStore()

const activeTab = ref('exchange')
const activeSubTab = ref('all')
const activePointsTab = ref('all')

const exchangeTabs = [
  { id: 'all', label: '全部' },
  { id: 'pending', label: '待发货' },
  { id: 'shipped', label: '待收货' },
  { id: 'completed', label: '已完成' }
]

const pointsTabs = [
  { id: 'all', label: '全部' },
  { id: 'earn', label: '获取' },
  { id: 'spend', label: '消耗' }
]

const exchangeRecords = computed(() => {
  return pointsStore.getExchangeRecordsByStatus(activeSubTab.value)
})

const pointsRecords = computed(() => {
  const records = pointsStore.getPointsRecords()
  if (activePointsTab.value === 'all') return records
  return records.filter(r => r.type === activePointsTab.value)
})

const formatDate = (timestamp: number) => {
  const date = new Date(timestamp)
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  const hours = String(date.getHours()).padStart(2, '0')
  const minutes = String(date.getMinutes()).padStart(2, '0')
  return `${year}-${month}-${day} ${hours}:${minutes}`
}

const formatNumber = (num: number) => {
  return num.toLocaleString()
}

const handleCancel = (record: ExchangeRecord) => {
  Taro.showModal({
    title: '确认取消',
    content: `确定要取消兑换「${record.product.name}」吗？积分将退回至您的账户。`,
    confirmColor: '#EF4444',
    success: (res) => {
      if (res.confirm) {
        pointsStore.cancelExchange(record.id)
      }
    }
  })
}

const handleConfirmReceive = (record: ExchangeRecord) => {
  Taro.showModal({
    title: '确认收货',
    content: '请确认您已收到商品',
    confirmColor: '#22C55E',
    success: (res) => {
      if (res.confirm) {
        pointsStore.confirmReceive(record.id)
      }
    }
  })
}

const copyTrackingNumber = (trackingNumber: string) => {
  Taro.setClipboardData({
    data: trackingNumber,
    success: () => {
      Taro.showToast({ title: '单号已复制', icon: 'success' })
    }
  })
}

const goToMall = () => {
  Taro.navigateBack()
}

const getStatusClass = (status: string) => {
  return status
}

const getPointsValueClass = (type: string) => {
  return type
}
</script>

<template>
  <scroll-view :class="styles.page" scroll-y>
    <view :class="styles.tabs">
      <view
        :class="[styles.tabItem, activeTab === 'exchange' ? styles.active : '']"
        @click="activeTab = 'exchange'"
      >
        <text>兑换记录</text>
      </view>
      <view
        :class="[styles.tabItem, activeTab === 'points' ? styles.active : '']"
        @click="activeTab = 'points'"
      >
        <text>积分明细</text>
      </view>
    </view>

    <view v-if="activeTab === 'exchange'" :class="styles.pointsTab">
      <view
        v-for="tab in exchangeTabs"
        :key="tab.id"
        :class="[styles.subTabItem, activeSubTab === tab.id ? styles.active : '']"
        @click="activeSubTab = tab.id"
      >
        <text>{{ tab.label }}</text>
      </view>
    </view>

    <view v-else :class="styles.pointsTab">
      <view
        v-for="tab in pointsTabs"
        :key="tab.id"
        :class="[styles.subTabItem, activePointsTab === tab.id ? styles.active : '']"
        @click="activePointsTab = tab.id"
      >
        <text>{{ tab.label }}</text>
      </view>
    </view>

    <view :class="styles.recordList">
      <template v-if="activeTab === 'exchange'">
        <view v-if="exchangeRecords.length > 0">
          <view
            v-for="record in exchangeRecords"
            :key="record.id"
            :class="styles.recordCard"
          >
            <view :class="styles.recordHeader">
              <text :class="styles.recordTime">{{ formatDate(record.exchangedAt) }}</text>
              <text :class="[styles.recordStatus, getStatusClass(record.status)]">
                {{ record.statusText }}
              </text>
            </view>

            <view :class="styles.recordContent">
              <image
                :class="styles.recordImage"
                :src="record.product.image"
                mode="aspectFill"
              />
              <view :class="styles.recordInfo">
                <text :class="styles.recordName">{{ record.product.name }}</text>
                <view :class="styles.recordMeta">
                  <text :class="styles.recordQuantity">x{{ record.quantity }}</text>
                  <text :class="styles.recordPoints">-{{ formatNumber(record.totalPoints) }} 积分</text>
                </view>
              </view>
            </view>

            <view v-if="record.trackingNumber" :class="styles.trackingInfo">
              <text :class="styles.trackingCompany">物流公司：{{ record.trackingCompany }}</text>
              <view style="display: flex; justify-content: space-between; align-items: center;">
                <text :class="styles.trackingNumber">运单号：{{ record.trackingNumber }}</text>
                <text
                  style="font-size: 24rpx; color: #22C55E;"
                  @click="copyTrackingNumber(record.trackingNumber!)"
                >
                  复制
                </text>
              </view>
            </view>

            <view v-if="record.address" :class="styles.addressInfo">
              <text :class="styles.addressTitle">收货地址</text>
              <text :class="styles.addressDetail">
                {{ record.address.name }} {{ record.address.phone }}
                {{ '\n' }}
                {{ record.address.province }}{{ record.address.city }}{{ record.address.district }}{{ record.address.detail }}
              </text>
            </view>

            <view v-if="record.status === 'pending' || record.status === 'shipped'" :class="styles.recordFooter">
              <view
                v-if="record.status === 'pending'"
                :class="[styles.recordBtn, styles.secondary]"
                @click="handleCancel(record)"
              >
                <text>取消兑换</text>
              </view>
              <view
                v-if="record.status === 'shipped'"
                :class="[styles.recordBtn, styles.primary]"
                @click="handleConfirmReceive(record)"
              >
                <text>确认收货</text>
              </view>
            </view>
          </view>
        </view>

        <view v-else :class="styles.emptyState">
          <text :class="styles.emptyIcon">📦</text>
          <text :class="styles.emptyText">暂无兑换记录</text>
          <view :class="styles.emptyBtn" @click="goToMall">
            <text>去兑换</text>
          </view>
        </view>
      </template>

      <template v-else>
        <view v-if="pointsRecords.length > 0">
          <view
            v-for="record in pointsRecords"
            :key="record.id"
            :class="styles.pointsRecordItem"
          >
            <view :class="styles.pointsRecordLeft">
              <text :class="styles.pointsRecordDesc">{{ record.description }}</text>
              <text :class="styles.pointsRecordTime">{{ formatDate(record.createdAt) }}</text>
            </view>
            <view :class="styles.pointsRecordRight">
              <text
                :class="[
                  styles.pointsRecordValue,
                  getPointsValueClass(record.type)
                ]"
              >
                {{ record.type === 'earn' ? '+' : '-' }}{{ formatNumber(record.points) }}
              </text>
            </view>
          </view>
        </view>

        <view v-else :class="styles.emptyState">
          <text :class="styles.emptyIcon">📊</text>
          <text :class="styles.emptyText">暂无积分明细</text>
        </view>
      </template>
    </view>
  </scroll-view>
</template>
