<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useGroupMealStore } from '@/stores/groupMeal'
import { useUserStore } from '@/stores/user'
import AppHeader from '@/components/AppHeader.vue'
import {
  showLoadingToast,
  closeToast,
  showToast,
  showConfirmDialog,
} from 'vant'
import { formatPrice } from '@/utils/format'
import { isPhone } from '@/utils/validate'
import type { GroupMealTimeSlot } from '@/types'

const router = useRouter()
const groupMealStore = useGroupMealStore()
const userStore = useUserStore()

const loading = ref(false)
const submitting = ref(false)
const showDatePicker = ref(false)

const companyName = ref('')
const contactName = ref('')
const contactPhone = ref('')
const address = ref('')
const remark = ref('')

const selectedPackage = computed(() => groupMealStore.selectedPackage)
const peopleCount = computed(() => groupMealStore.peopleCount)
const selectedDate = computed(() => groupMealStore.selectedDate)
const selectedTimeSlot = computed(() => groupMealStore.selectedTimeSlot)
const timeSlots = computed(() => groupMealStore.timeSlots)
const availableDates = computed(() => groupMealStore.availableDates)
const totalAmount = computed(() => groupMealStore.totalAmount)
const payAmount = computed(() => groupMealStore.payAmount)

function formatDate(dateStr: string): string {
  const date = new Date(dateStr)
  const weekdays = ['周日', '周一', '周二', '周三', '周四', '周五', '周六']
  const today = new Date()
  const tomorrow = new Date(today)
  tomorrow.setDate(today.getDate() + 1)

  if (date.toDateString() === today.toDateString()) {
    return `今天 ${weekdays[date.getDay()]}`
  } else if (date.toDateString() === tomorrow.toDateString()) {
    return `明天 ${weekdays[date.getDay()]}`
  }
  return `${date.getMonth() + 1}月${date.getDate()}日 ${weekdays[date.getDay()]}`
}

function formatDateShort(dateStr: string): string {
  const date = new Date(dateStr)
  const weekdays = ['日', '一', '二', '三', '四', '五', '六']
  return `${date.getMonth() + 1}/${date.getDate()} 周${weekdays[date.getDay()]}`
}

async function loadData() {
  if (!selectedPackage.value) {
    showToast('请先选择套餐')
    router.replace('/group-meal')
    return
  }
  loading.value = true
  showLoadingToast({ message: '加载中...', forbidClick: true })
  try {
    await Promise.all([
      groupMealStore.fetchTimeSlots(),
      groupMealStore.fetchAvailableDates(),
    ])
    if (timeSlots.value.length > 0 && timeSlots.value[0].available) {
      groupMealStore.setSelectedTimeSlot(timeSlots.value[0])
    }
  } catch (e) {
    console.error('[GroupMealCheckout] 加载数据失败', e)
    showToast('加载失败，请重试')
  } finally {
    loading.value = false
    closeToast()
  }
}

function onSelectDate(date: string) {
  groupMealStore.setSelectedDate(date)
  showDatePicker.value = false
}

function onSelectTimeSlot(slot: GroupMealTimeSlot) {
  if (!slot.available) {
    showToast('该时段已约满，请选择其他时段')
    return
  }
  groupMealStore.setSelectedTimeSlot(slot)
}

function onChangePeople(delta: number) {
  const newCount = peopleCount.value + delta
  if (newCount < 5) {
    showToast('最少5人起订')
    return
  }
  if (newCount > 200) {
    showToast('最多200人')
    return
  }
  if (selectedPackage.value && (newCount < selectedPackage.value.minPeople || newCount > selectedPackage.value.maxPeople)) {
    showToast(`该套餐适合 ${selectedPackage.value.minPeople}-${selectedPackage.value.maxPeople} 人`)
    return
  }
  groupMealStore.setPeopleCount(newCount)
}

async function onSubmit() {
  if (!selectedPackage.value) {
    showToast('请选择套餐')
    return
  }
  if (!selectedDate.value) {
    showToast('请选择配送日期')
    return
  }
  if (!selectedTimeSlot.value) {
    showToast('请选择配送时段')
    return
  }
  if (!companyName.value.trim()) {
    showToast('请输入公司名称')
    return
  }
  if (!contactName.value.trim()) {
    showToast('请输入联系人姓名')
    return
  }
  if (!contactPhone.value.trim()) {
    showToast('请输入联系电话')
    return
  }
  if (!isPhone(contactPhone.value.trim())) {
    showToast('请输入正确的手机号码')
    return
  }
  if (!address.value.trim()) {
    showToast('请输入配送地址')
    return
  }
  if (submitting.value) return

  try {
    await showConfirmDialog({
      title: '确认提交订单',
      message: `确认提交 ${peopleCount.value} 人的团餐订单吗？\n总价：¥${formatPrice(payAmount.value)}`,
    })
  } catch {
    return
  }

  submitting.value = true
  showLoadingToast({ message: '提交中...', forbidClick: true })
  try {
    const result = await groupMealStore.createOrder({
      companyName: companyName.value.trim(),
      contactName: contactName.value.trim(),
      contactPhone: contactPhone.value.trim(),
      address: address.value.trim(),
      remark: remark.value.trim() || undefined,
    })
    closeToast()
    showToast({ message: '订单提交成功', type: 'success' })
    groupMealStore.resetSelection()
    setTimeout(() => {
      router.replace(`/group-meal/order/${result.orderId}`)
    }, 1500)
  } catch (e: any) {
    closeToast()
    console.error('[GroupMealCheckout] 提交订单失败', e)
    showToast(e.message || '提交失败，请重试')
  } finally {
    submitting.value = false
  }
}

const goBack = () => router.back()

watch(() => userStore.userInfo, (userInfo) => {
  if (userInfo) {
    contactName.value = userInfo.nickname || ''
    contactPhone.value = userInfo.phone || ''
  }
}, { immediate: true })

onMounted(() => {
  loadData()
})
</script>

<template>
  <div class="group-meal-checkout-page">
    <AppHeader title="确认团餐订单" :show-back="true" @click-left="goBack" />

    <div class="checkout-body" v-if="selectedPackage">
      <div class="section package-section animate-in">
        <div class="section-title">已选套餐</div>
        <div class="package-info">
          <img :src="selectedPackage.image" :alt="selectedPackage.name" class="package-img" />
          <div class="package-detail">
            <h3 class="package-name">{{ selectedPackage.name }}</h3>
            <p class="package-desc">{{ selectedPackage.description }}</p>
            <div class="package-price">
              <span class="price-symbol">¥</span>
              <span class="price-value">{{ selectedPackage.pricePerPerson }}</span>
              <span class="price-unit">/人</span>
            </div>
          </div>
        </div>

        <div class="people-adjust">
          <span class="people-label">用餐人数</span>
          <div class="people-stepper">
            <div class="stepper-btn" @click="onChangePeople(-1)">
              <van-icon name="minus" size="16" />
            </div>
            <span class="people-count">{{ peopleCount }}</span>
            <div class="stepper-btn" @click="onChangePeople(1)">
              <van-icon name="plus" size="16" />
            </div>
          </div>
          <span class="people-hint">人</span>
        </div>

        <div class="dishes-list">
          <div class="dishes-title">
            <span>套餐菜品</span>
            <span class="dishes-count">共{{ selectedPackage.dishes.length }}道</span>
          </div>
          <div class="dishes-grid">
            <div v-for="dish in selectedPackage.dishes" :key="dish.id" class="dish-item">
              <img :src="dish.image" :alt="dish.name" class="dish-img" />
              <div class="dish-info">
                <span class="dish-name">{{ dish.name }}</span>
                <span class="dish-quantity">{{ dish.quantity }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="section delivery-section animate-in">
        <div class="section-title">配送时间</div>
        <div class="date-selector" @click="showDatePicker = true">
          <div class="selector-left">
            <van-icon name="calendar-o" size="18" color="#2DB87B" />
            <span class="selector-label">配送日期</span>
          </div>
          <div class="selector-right">
            <span class="selector-value">{{ formatDate(selectedDate) }}</span>
            <van-icon name="arrow" size="16" color="#999" />
          </div>
        </div>

        <div class="time-slots">
          <div class="slots-title">选择时段</div>
          <div class="slots-grid">
            <div
              v-for="slot in timeSlots"
              :key="slot.id"
              :class="[
                'slot-item',
                selectedTimeSlot?.id === slot.id && 'slot-item--active',
                !slot.available && 'slot-item--disabled'
              ]"
              @click="onSelectTimeSlot(slot)"
            >
              <span class="slot-label">{{ slot.label }}</span>
              <span v-if="!slot.available" class="slot-status">约满</span>
            </div>
          </div>
        </div>
      </div>

      <div class="section info-section animate-in">
        <div class="section-title">企业信息</div>
        <van-field
          v-model="companyName"
          label="公司名称"
          placeholder="请输入公司名称"
          :border="false"
        />
        <van-field
          v-model="contactName"
          label="联系人"
          placeholder="请输入联系人姓名"
          :border="false"
        />
        <van-field
          v-model="contactPhone"
          label="联系电话"
          type="tel"
          placeholder="请输入联系电话"
          :border="false"
        />
        <van-field
          v-model="address"
          label="配送地址"
          placeholder="请输入详细配送地址"
          type="textarea"
          autosize
          :border="false"
        />
        <van-field
          v-model="remark"
          label="备注"
          placeholder="如有特殊要求请备注（选填）"
          type="textarea"
          autosize
          :border="false"
        />
      </div>

      <div class="section summary-section animate-in">
        <div class="section-title">费用明细</div>
        <van-cell-group :border="false">
          <van-cell
            title="套餐费用"
            :value="`¥${formatPrice(totalAmount)}`"
          />
          <van-cell
            title="用餐人数"
            :value="`${peopleCount}人 × ¥${selectedPackage.pricePerPerson}/人`"
          />
          <van-cell
            title="配送费"
            value="免费"
          />
        </van-cell-group>
      </div>
    </div>

    <div class="checkout-bottom">
      <div class="bottom-left">
        <span class="total-label">合计</span>
        <span class="total-amount">
          <span class="amount-symbol">¥</span>
          <span class="amount-value">{{ formatPrice(payAmount) }}</span>
        </span>
      </div>
      <van-button
        type="primary"
        class="submit-btn"
        :loading="submitting"
        :disabled="submitting"
        @click="onSubmit"
      >
        提交订单
      </van-button>
    </div>

    <van-popup
      v-model:show="showDatePicker"
      position="bottom"
      round
      :style="{ maxHeight: '60vh' }"
    >
      <div class="date-picker">
        <div class="date-picker__header">
          <span class="date-picker__title">选择配送日期</span>
          <van-icon name="close" size="20" @click="showDatePicker = false" />
        </div>
        <div class="date-picker__grid">
          <div
            v-for="date in availableDates"
            :key="date"
            :class="['date-picker__item', selectedDate === date && 'date-picker__item--active']"
            @click="onSelectDate(date)"
          >
            <span class="date-label">{{ formatDateShort(date) }}</span>
          </div>
        </div>
      </div>
    </van-popup>
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

.group-meal-checkout-page {
  min-height: 100vh;
  background: $bg;
  padding-top: 46px;
  padding-bottom: 70px;
}

.checkout-body {
  padding: 12px;
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

.package-info {
  display: flex;
  gap: 12px;
  padding-bottom: 14px;
  border-bottom: 1px solid $border;
}

.package-img {
  width: 80px;
  height: 80px;
  border-radius: $radius-sm;
  object-fit: cover;
  flex-shrink: 0;
}

.package-detail {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

.package-name {
  font-size: 15px;
  font-weight: 600;
  color: $text-primary;
  margin: 0 0 4px 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.package-desc {
  font-size: 12px;
  color: $text-secondary;
  margin: 0 0 6px 0;
  line-height: 1.4;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.package-price {
  display: flex;
  align-items: baseline;
  gap: 2px;
}

.price-symbol {
  font-size: 12px;
  font-weight: 600;
  color: $danger;
}

.price-value {
  font-size: 18px;
  font-weight: 700;
  color: $danger;
  font-family: $font-display;
}

.price-unit {
  font-size: 12px;
  color: $text-secondary;
}

.people-adjust {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 14px 0;
  border-bottom: 1px solid $border;
}

.people-label {
  font-size: 14px;
  color: $text-primary;
}

.people-stepper {
  display: flex;
  align-items: center;
  gap: 14px;
}

.stepper-btn {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background: $bg;
  display: flex;
  align-items: center;
  justify-content: center;
  color: $text-primary;

  &:active {
    background: $bg-gray;
  }
}

.people-count {
  font-size: 16px;
  font-weight: 600;
  color: $primary;
  min-width: 30px;
  text-align: center;
}

.people-hint {
  font-size: 14px;
  color: $text-secondary;
}

.dishes-list {
  padding: 14px 0;
}

.dishes-title {
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 14px;
  color: $text-primary;
  margin-bottom: 10px;
}

.dishes-count {
  font-size: 12px;
  color: $text-secondary;
}

.dishes-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 10px;
}

.dish-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px;
  background: $bg;
  border-radius: $radius-sm;
}

.dish-img {
  width: 36px;
  height: 36px;
  border-radius: 6px;
  object-fit: cover;
  flex-shrink: 0;
}

.dish-info {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.dish-name {
  font-size: 13px;
  color: $text-primary;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.dish-quantity {
  font-size: 11px;
  color: $text-secondary;
}

.date-selector {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 14px 0;
  border-bottom: 1px solid $border;
}

.selector-left {
  display: flex;
  align-items: center;
  gap: 8px;
}

.selector-label {
  font-size: 14px;
  color: $text-primary;
}

.selector-right {
  display: flex;
  align-items: center;
  gap: 6px;
}

.selector-value {
  font-size: 14px;
  color: $primary;
  font-weight: 500;
}

.time-slots {
  padding: 14px 0;
}

.slots-title {
  font-size: 14px;
  color: $text-primary;
  margin-bottom: 10px;
}

.slots-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 10px;
}

.slot-item {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  padding: 12px;
  background: $bg;
  border-radius: $radius-sm;
  border: 1px solid transparent;
  transition: all 0.2s ease;

  &--active {
    background: $primary-light;
    border-color: $primary;

    .slot-label {
      color: $primary;
      font-weight: 500;
    }
  }

  &--disabled {
    opacity: 0.5;
  }
}

.slot-label {
  font-size: 13px;
  color: $text-primary;
}

.slot-status {
  font-size: 11px;
  color: $text-secondary;
}

.checkout-bottom {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  height: 60px;
  background: $bg-card;
  display: flex;
  align-items: center;
  padding: 0 14px;
  box-shadow: 0 -1px 8px rgba(0, 0, 0, 0.06);
  z-index: 100;
}

.bottom-left {
  flex: 1;
  display: flex;
  align-items: baseline;
  gap: 4px;
}

.total-label {
  font-size: 14px;
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
  font-size: 22px;
  font-weight: 700;
  color: $danger;
  font-family: $font-display;
}

.submit-btn {
  flex-shrink: 0;
  border-radius: 20px;
  padding: 0 28px;
  height: 40px;
  font-size: 14px;
  font-weight: 600;
}

.date-picker {
  padding: 16px;

  &__header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 16px;
  }

  &__title {
    font-size: 16px;
    font-weight: 600;
    color: $text-primary;
  }

  &__grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 10px;
  }

  &__item {
    padding: 14px;
    text-align: center;
    background: $bg;
    border-radius: $radius-sm;
    border: 1px solid transparent;
    transition: all 0.2s ease;

    &--active {
      background: $primary-light;
      border-color: $primary;

      .date-label {
        color: $primary;
        font-weight: 500;
      }
    }
  }
}

.date-label {
  font-size: 14px;
  color: $text-primary;
}

:deep(.van-field) {
  padding: 12px 0;
  border-bottom: 1px solid $border;

  &:last-child {
    border-bottom: none;
  }
}

:deep(.van-cell__label) {
  font-size: 14px;
  color: $text-primary;
  min-width: 80px;
}

:deep(.van-field__control) {
  font-size: 14px;
  color: $text-primary;
  text-align: right;
}

:deep(.van-field--textarea .van-field__control) {
  text-align: left;
}
</style>
