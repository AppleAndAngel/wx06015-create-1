<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useGroupMealStore } from '@/stores/groupMeal'
import AppHeader from '@/components/AppHeader.vue'
import EmptyState from '@/components/EmptyState.vue'
import { showLoadingToast, closeToast, showToast } from 'vant'
import { formatPrice } from '@/utils/format'
import type { GroupMealOrder } from '@/types'

const router = useRouter()
const route = useRoute()
const groupMealStore = useGroupMealStore()

const loading = ref(false)
const orderId = computed(() => parseInt(route.params.id as string))

const order = ref<GroupMealOrder | null>(null)

const statusMap: Record<string, { text: string; color: string }> = {
  pending: { text: '待付款', color: '#FF8C42' },
  paid: { text: '已付款', color: '#2DB87B' },
  confirmed: { text: '已确认', color: '#1E9A63' },
  delivered: { text: '已送达', color: '#667eea' },
  cancelled: { text: '已取消', color: '#8C8C9A' },
}

function formatDate(dateStr: string): string {
  const date = new Date(dateStr)
  const weekdays = ['周日', '周一', '周二', '周三', '周四', '周五', '周六']
  return `${date.getFullYear()}年${date.getMonth() + 1}月${date.getDate()}日 ${weekdays[date.getDay()]}`
}

function formatDateTime(dateStr: string): string {
  const date = new Date(dateStr)
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')} ${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`
}

async function loadOrder() {
  if (isNaN(orderId.value)) {
    showToast('订单ID无效')
    router.replace('/my-group-meals')
    return
  }
  loading.value = true
  showLoadingToast({ message: '加载中...', forbidClick: true })
  try {
    const data = await groupMealStore.fetchOrderById(orderId.value)
    order.value = data || null
    if (!order.value) {
      showToast('订单不存在')
      router.replace('/my-group-meals')
    }
  } catch (e) {
    console.error('[GroupMealOrderDetail] 加载订单失败', e)
    showToast('加载失败，请重试')
  } finally {
    loading.value = false
    closeToast()
  }
}

function goToPayment() {
  if (!order.value) return
  showToast('支付功能开发中')
}

function goBack() {
  router.back()
}

function goToMyOrders() {
  router.replace('/my-group-meals')
}

function goToHome() {
  router.replace('/')
}

onMounted(() => {
  loadOrder()
})
</script>

<template>
  <div class="order-detail-page">
    <AppHeader title="团餐订单详情" :show-back="true" @click-left="goBack" />

    <div class="page-body" v-if="order">
      <div class="status-section animate-in">
        <div class="status-icon">
          <van-icon
            :name="order.status === 'cancelled' ? 'close-circle' : 'checked-circle'"
            size="48"
            :color="statusMap[order.status].color"
          />
        </div>
        <div class="status-info">
          <span class="status-text" :style="{ color: statusMap[order.status].color }">
            {{ statusMap[order.status].text }}
          </span>
          <span class="order-no">订单号：{{ order.orderNo }}</span>
        </div>
      </div>

      <div class="section delivery-section animate-in">
        <div class="section-title">配送信息</div>
        <div class="delivery-info">
          <div class="info-row">
            <span class="info-label">配送日期</span>
            <span class="info-value">{{ formatDate(order.deliveryDate) }}</span>
          </div>
          <div class="info-row">
            <span class="info-label">配送时段</span>
            <span class="info-value">{{ order.timeSlotLabel }}</span>
          </div>
          <div class="info-row">
            <span class="info-label">配送地址</span>
            <span class="info-value">{{ order.address }}</span>
          </div>
        </div>
      </div>

      <div class="section company-section animate-in">
        <div class="section-title">企业信息</div>
        <div class="company-info">
          <div class="info-row">
            <span class="info-label">公司名称</span>
            <span class="info-value">{{ order.companyName }}</span>
          </div>
          <div class="info-row">
            <span class="info-label">联系人</span>
            <span class="info-value">{{ order.contactName }}</span>
          </div>
          <div class="info-row">
            <span class="info-label">联系电话</span>
            <span class="info-value">{{ order.contactPhone }}</span>
          </div>
        </div>
      </div>

      <div class="section package-section animate-in">
        <div class="section-title">套餐信息</div>
        <div v-for="item in order.items" :key="item.packageId" class="package-item">
          <img :src="item.packageImage" :alt="item.packageName" class="package-img" />
          <div class="package-info">
            <h4 class="package-name">{{ item.packageName }}</h4>
            <p class="package-spec">{{ item.peopleCount }}人份</p>
            <div class="package-price">
              <span class="price">¥{{ formatPrice(item.pricePerPerson) }}/人</span>
              <span class="quantity">× {{ item.peopleCount }}</span>
            </div>
          </div>
          <div class="package-subtotal">
            ¥{{ formatPrice(item.subtotal) }}
          </div>
        </div>
      </div>

      <div class="section remark-section animate-in" v-if="order.remark">
        <div class="section-title">备注</div>
        <p class="remark-text">{{ order.remark }}</p>
      </div>

      <div class="section summary-section animate-in">
        <div class="section-title">费用明细</div>
        <van-cell-group :border="false">
          <van-cell
            title="套餐费用"
            :value="`¥${formatPrice(order.totalAmount)}`"
          />
          <van-cell
            title="用餐人数"
            :value="`${order.peopleCount}人`"
          />
          <van-cell
            title="配送费"
            value="免费"
          />
        </van-cell-group>
      </div>

      <div class="section order-info-section animate-in">
        <div class="info-row">
          <span class="info-label">下单时间</span>
          <span class="info-value">{{ formatDateTime(order.createdAt) }}</span>
        </div>
        <div class="info-row" v-if="order.payTime">
          <span class="info-label">付款时间</span>
          <span class="info-value">{{ formatDateTime(order.payTime) }}</span>
        </div>
      </div>

      <div class="total-section animate-in">
        <span class="total-label">实付金额</span>
        <span class="total-amount">
          <span class="amount-symbol">¥</span>
          <span class="amount-value">{{ formatPrice(order.payAmount) }}</span>
        </span>
      </div>
    </div>

    <EmptyState v-else-if="!loading" description="订单不存在" />

    <div class="bottom-bar" v-if="order && order.status === 'pending'">
      <van-button
        type="default"
        class="btn-cancel"
        @click="goToMyOrders"
      >
        我的订单
      </van-button>
      <van-button
        type="primary"
        class="btn-pay"
        @click="goToPayment"
      >
        立即支付
      </van-button>
    </div>

    <div class="bottom-bar" v-else-if="order && order.status !== 'cancelled'">
      <van-button
        type="default"
        class="btn-cancel"
        @click="goToHome"
      >
        继续选购
      </van-button>
      <van-button
        type="primary"
        class="btn-pay"
        @click="goToMyOrders"
      >
        查看订单
      </van-button>
    </div>
  </div>
</template>

<style scoped lang="scss">
@use '@/assets/styles/variables' as *;

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(24px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.animate-in {
  animation: fadeInUp 0.5s ease both;
}

.order-detail-page {
  min-height: 100vh;
  background: $bg;
  padding-top: 46px;
  padding-bottom: 80px;
}

.page-body {
  padding: 12px;
}

.status-section {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 20px 16px;
  background: linear-gradient(135deg, #2DB87B 0%, #1E9A63 100%);
  border-radius: $radius-md;
  margin-bottom: 12px;
  color: #fff;
}

.status-icon {
  flex-shrink: 0;
}

.status-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.status-text {
  font-size: 20px;
  font-weight: 700;
}

.order-no {
  font-size: 12px;
  opacity: 0.9;
}

.section {
  background: $bg-card;
  border-radius: $radius-md;
  padding: 0 14px;
  margin-bottom: 12px;
  box-shadow: $shadow;
}

.section-title {
  font-size: 15px;
  font-weight: 600;
  color: $text-primary;
  padding: 14px 0 10px;
}

.delivery-info,
.company-info {
  padding-bottom: 14px;
}

.info-row {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 10px;
  padding: 8px 0;
}

.info-label {
  font-size: 14px;
  color: $text-secondary;
  flex-shrink: 0;
}

.info-value {
  font-size: 14px;
  color: $text-primary;
  text-align: right;
  flex: 1;
}

.package-item {
  display: flex;
  gap: 12px;
  padding: 12px 0;
  border-bottom: 1px solid $border;

  &:last-child {
    border-bottom: none;
    padding-bottom: 14px;
  }
}

.package-img {
  width: 70px;
  height: 70px;
  border-radius: $radius-sm;
  object-fit: cover;
  flex-shrink: 0;
}

.package-info {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

.package-name {
  font-size: 14px;
  font-weight: 500;
  color: $text-primary;
  margin: 0 0 4px 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.package-spec {
  font-size: 12px;
  color: $text-secondary;
  margin: 0 0 6px 0;
}

.package-price {
  display: flex;
  align-items: center;
  gap: 8px;
}

.price {
  font-size: 13px;
  color: $danger;
  font-weight: 500;
}

.quantity {
  font-size: 12px;
  color: $text-secondary;
}

.package-subtotal {
  font-size: 15px;
  font-weight: 600;
  color: $text-primary;
  flex-shrink: 0;
  align-self: center;
}

.remark-text {
  font-size: 14px;
  color: $text-primary;
  line-height: 1.5;
  padding-bottom: 14px;
  margin: 0;
}

.order-info-section {
  padding-bottom: 14px;
}

.total-section {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px;
  background: $bg-card;
  border-radius: $radius-md;
  margin-bottom: 12px;
  box-shadow: $shadow;
}

.total-label {
  font-size: 15px;
  color: $text-primary;
}

.total-amount {
  display: flex;
  align-items: baseline;
}

.amount-symbol {
  font-size: 14px;
  font-weight: 600;
  color: $danger;
}

.amount-value {
  font-size: 24px;
  font-weight: 700;
  color: $danger;
  font-family: $font-display;
}

.bottom-bar {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  height: 60px;
  background: $bg-card;
  display: flex;
  align-items: center;
  padding: 0 14px;
  gap: 10px;
  box-shadow: 0 -1px 8px rgba(0, 0, 0, 0.06);
  z-index: 100;
}

.btn-cancel {
  flex: 1;
  height: 40px;
  border-radius: 20px;
  font-size: 14px;
}

.btn-pay {
  flex: 2;
  height: 40px;
  border-radius: 20px;
  font-size: 14px;
  font-weight: 600;
}
</style>
