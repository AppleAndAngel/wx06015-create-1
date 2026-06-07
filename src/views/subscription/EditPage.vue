<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import {
  showToast,
  showLoadingToast,
  closeToast,
  showConfirmDialog,
} from 'vant'
import { useSubscriptionStore } from '@/stores/subscription'
import { useAddressStore } from '@/stores/address'
import AppHeader from '@/components/AppHeader.vue'
import type { SubscriptionCycle, Weekday, UpdateSubscriptionParams } from '@/types'
import dayjs from 'dayjs'

const route = useRoute()
const router = useRouter()
const subscriptionStore = useSubscriptionStore()
const addressStore = useAddressStore()

const subscriptionId = computed(() => Number(route.params.id))
const subscription = computed(() => subscriptionStore.currentSubscription)

const loading = ref(false)
const quantity = ref(1)
const selectedCycle = ref<SubscriptionCycle>('weekly')
const selectedWeekdays = ref<Weekday[]>([6])
const selectedAddressId = ref<number | null>(null)
const showWeekdayPopup = ref(false)
const showAddressPopup = ref(false)
const showCyclePopup = ref(false)
const showDatePicker = ref(false)
const customNextDate = ref('')

const cycleOptions = [
  { text: '每日配送', value: 'daily' },
  { text: '每周配送', value: 'weekly' },
  { text: '每两周配送', value: 'biweekly' },
  { text: '每月配送', value: 'monthly' },
]

const weekdayOptions: { text: string; value: Weekday }[] = [
  { text: '周日', value: 0 as Weekday },
  { text: '周一', value: 1 as Weekday },
  { text: '周二', value: 2 as Weekday },
  { text: '周三', value: 3 as Weekday },
  { text: '周四', value: 4 as Weekday },
  { text: '周五', value: 5 as Weekday },
  { text: '周六', value: 6 as Weekday },
]

const cycleLabel = computed(() => {
  const option = cycleOptions.find((o) => o.value === selectedCycle.value)
  return option?.text || ''
})

const weekdayLabel = computed(() => {
  if (selectedCycle.value === 'daily') {
    return '工作日（周一至周五）'
  }
  return selectedWeekdays.value
    .map((w) => weekdayOptions.find((o) => o.value === w)?.text)
    .join('、')
})

const selectedAddress = computed(() => {
  if (!selectedAddressId.value) return null
  return addressStore.addresses.find((a) => a.id === selectedAddressId.value)
})

const specText = computed(() => {
  if (!subscription.value) return ''
  const values = Object.values(subscription.value.specValues)
  return values.join(' ')
})

const unitPrice = computed(() => subscription.value?.product.price || 0)
const totalPrice = computed(() => unitPrice.value * quantity.value)
const originalPrice = computed(() => subscription.value ? subscription.value.product.originalPrice * quantity.value : 0)
const savePerDelivery = computed(() => originalPrice.value - totalPrice.value)

const nextDeliveryDate = computed(() => {
  if (customNextDate.value) return customNextDate.value
  return subscription.value?.nextDeliveryDate || ''
})

function findNextWeekday(fromDate: Date, weekday: Weekday): Date {
  const result = new Date(fromDate)
  result.setDate(result.getDate() + ((weekday - result.getDay() + 7) % 7 || 7))
  return result
}

function formatDate(dateStr: string): string {
  if (!dateStr) return ''
  const date = dayjs(dateStr)
  const today = dayjs()
  const diff = date.diff(today, 'day')
  if (diff === 0) return '今天'
  if (diff === 1) return '明天'
  if (diff === 2) return '后天'
  const weekdays = ['周日', '周一', '周二', '周三', '周四', '周五', '周六']
  return `${date.format('MM月DD日')} ${weekdays[date.day()]}`
}

function toggleWeekday(weekday: Weekday) {
  const index = selectedWeekdays.value.indexOf(weekday)
  if (index === -1) {
    selectedWeekdays.value.push(weekday)
  } else {
    selectedWeekdays.value.splice(index, 1)
  }
}

function handleWeekdayConfirm() {
  if (selectedWeekdays.value.length === 0) {
    showToast('请至少选择一个配送日')
    return
  }
  selectedWeekdays.value.sort()
  showWeekdayPopup.value = false
}

function handleCycleConfirm() {
  if (selectedCycle.value === 'daily') {
    selectedWeekdays.value = [1, 2, 3, 4, 5]
  } else if (selectedWeekdays.value.length === 0) {
    selectedWeekdays.value = [6]
  }
  showCyclePopup.value = false
}

function handleAddressSelect(addressId: number) {
  selectedAddressId.value = addressId
  showAddressPopup.value = false
}

function handleDateConfirm(value: any) {
  customNextDate.value = dayjs(value).format('YYYY-MM-DD')
  showDatePicker.value = false
}

function hasChanges(): boolean {
  if (!subscription.value) return false
  return (
    quantity.value !== subscription.value.quantity ||
    selectedCycle.value !== subscription.value.cycle ||
    JSON.stringify(selectedWeekdays.value.sort()) !== JSON.stringify([...subscription.value.weekdays].sort()) ||
    selectedAddressId.value !== subscription.value.address.id ||
    (customNextDate.value && customNextDate.value !== subscription.value.nextDeliveryDate)
  )
}

async function handleSave() {
  if (!subscription.value) return

  if (!hasChanges()) {
    showToast('未检测到修改')
    return
  }

  if (selectedCycle.value !== 'daily' && selectedWeekdays.value.length === 0) {
    showWeekdayPopup.value = true
    return
  }

  if (!selectedAddressId.value) {
    showToast('请选择收货地址')
    showAddressPopup.value = true
    return
  }

  const params: UpdateSubscriptionParams = {
    quantity: quantity.value,
    cycle: selectedCycle.value,
    weekdays: [...selectedWeekdays.value],
    addressId: selectedAddressId.value,
  }

  if (customNextDate.value && customNextDate.value !== subscription.value.nextDeliveryDate) {
    params.nextDeliveryDate = customNextDate.value
  }

  showLoadingToast({ message: '保存中...', forbidClick: true })
  try {
    await subscriptionStore.updateSubscription(subscriptionId.value, params)
    closeToast()
    showToast({ message: '修改成功！', type: 'success' })
    setTimeout(() => {
      router.back()
    }, 1500)
  } catch (e) {
    closeToast()
    showToast({ message: '修改失败，请重试', type: 'fail' })
  }
}

async function handlePause() {
  if (!subscription.value) return
  try {
    await showConfirmDialog({
      title: '暂停订阅',
      message: `确定要暂停「${subscription.value.product.name}」的订阅吗？暂停期间不会配送。`,
      confirmButtonText: '确定暂停',
      cancelButtonText: '取消',
    })
    showLoadingToast({ message: '暂停中...', forbidClick: true })
    await subscriptionStore.pauseSubscription(subscriptionId.value)
    closeToast()
    showToast({ message: '已暂停订阅', type: 'success' })
  } catch (e) {
    closeToast()
  }
}

async function handleResume() {
  if (!subscription.value) return
  try {
    await showConfirmDialog({
      title: '恢复订阅',
      message: `确定要恢复「${subscription.value.product.name}」的订阅吗？`,
      confirmButtonText: '确定恢复',
      cancelButtonText: '取消',
    })
    showLoadingToast({ message: '恢复中...', forbidClick: true })
    await subscriptionStore.resumeSubscription(subscriptionId.value)
    closeToast()
    showToast({ message: '已恢复订阅', type: 'success' })
  } catch (e) {
    closeToast()
  }
}

async function handleCancel() {
  if (!subscription.value) return
  try {
    await showConfirmDialog({
      title: '取消订阅',
      message: `确定要取消「${subscription.value.product.name}」的订阅吗？取消后无法恢复，已省金额将失效。`,
      confirmButtonText: '确定取消',
      cancelButtonText: '再想想',
      confirmButtonColor: '#FF6B6B',
    })
    showLoadingToast({ message: '取消中...', forbidClick: true })
    await subscriptionStore.cancelSubscription(subscriptionId.value)
    closeToast()
    showToast({ message: '已取消订阅', type: 'success' })
    setTimeout(() => {
      router.push('/my-subscriptions')
    }, 1500)
  } catch (e) {
    closeToast()
  }
}

function goBack() {
  router.back()
}

async function loadData() {
  try {
    loading.value = true
    await Promise.all([
      subscriptionStore.fetchSubscription(subscriptionId.value),
      addressStore.fetchAddresses(),
    ])

    if (subscription.value) {
      quantity.value = subscription.value.quantity
      selectedCycle.value = subscription.value.cycle
      selectedWeekdays.value = [...subscription.value.weekdays]
      selectedAddressId.value = subscription.value.address.id
      customNextDate.value = ''
    }
  } catch (e) {
    console.error('[SubscriptionEdit] 加载数据失败', e)
    showToast('加载失败，请重试')
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  loadData()
})
</script>

<template>
  <div class="subscription-edit-page" v-if="subscription">
    <AppHeader title="编辑订阅" :show-back="true" @click-left="goBack" />

    <van-loading v-if="loading" class="loading" />

    <template v-else>
      <div class="page-body">
        <div class="product-info">
          <img
            v-lazy="subscription.product.images[0]"
            class="product-info__img"
            :alt="subscription.product.name"
          />
          <div class="product-info__content">
            <h1 class="product-info__name">{{ subscription.product.name }}</h1>
            <div class="product-info__spec">{{ specText }}</div>
            <div class="product-info__price-row">
              <span class="product-info__price">¥{{ unitPrice.toFixed(1) }}</span>
              <span class="product-info__original">¥{{ subscription.product.originalPrice.toFixed(1) }}</span>
            </div>
          </div>
        </div>

        <div class="status-banner" :class="`status-banner--${subscription.status}`">
          <div class="status-banner__icon">
            {{ subscription.status === 'active' ? '✅' : subscription.status === 'paused' ? '⏸️' : '❌' }}
          </div>
          <div class="status-banner__info">
            <div class="status-banner__title">
              {{ subscription.status === 'active' ? '订阅进行中' : subscription.status === 'paused' ? '订阅已暂停' : '订阅已取消' }}
            </div>
            <div class="status-banner__desc">
              下次配送：{{ formatDate(nextDeliveryDate) }}
            </div>
          </div>
          <div class="status-banner__actions">
            <template v-if="subscription.status === 'active'">
              <van-button size="small" plain type="default" @click="handlePause">
                暂停
              </van-button>
            </template>
            <template v-else-if="subscription.status === 'paused'">
              <van-button size="small" type="primary" @click="handleResume">
                恢复
              </van-button>
            </template>
            <template v-if="subscription.status !== 'cancelled' && subscription.status !== 'expired'">
              <van-button size="small" plain type="danger" @click="handleCancel">
                取消
              </van-button>
            </template>
          </div>
        </div>

        <div class="form-section">
          <div class="form-row">
            <span class="form-row__label">商品规格</span>
            <span class="form-row__value">{{ specText }}</span>
          </div>

          <div class="form-row">
            <span class="form-row__label">购买数量</span>
            <van-stepper
              v-model="quantity"
              :min="1"
              :max="10"
              button-size="22"
            />
          </div>

          <div class="form-row" @click="showCyclePopup = true">
            <span class="form-row__label">配送周期</span>
            <span class="form-row__value">{{ cycleLabel }}</span>
            <van-icon name="arrow" size="14" color="#999" />
          </div>

          <div
            v-if="selectedCycle !== 'daily'"
            class="form-row"
            @click="showWeekdayPopup = true"
          >
            <span class="form-row__label">配送日</span>
            <span class="form-row__value">{{ weekdayLabel }}</span>
            <van-icon name="arrow" size="14" color="#999" />
          </div>

          <div class="form-row" @click="showDatePicker = true">
            <span class="form-row__label">下次配送</span>
            <span class="form-row__value form-row__value--highlight">
              {{ formatDate(nextDeliveryDate) }}
            </span>
            <van-icon name="arrow" size="14" color="#999" />
          </div>

          <div class="form-row" @click="showAddressPopup = true">
            <span class="form-row__label">收货地址</span>
            <span class="form-row__value">
              {{ selectedAddress?.name || '请选择地址' }}
              <template v-if="selectedAddress">
                {{ selectedAddress.phone }}
              </template>
            </span>
            <van-icon name="arrow" size="14" color="#999" />
          </div>

          <div class="form-row form-row--full" v-if="selectedAddress">
            <span class="form-row__address">
              {{ selectedAddress.province }}{{ selectedAddress.city }}{{ selectedAddress.district }}{{ selectedAddress.detail }}
            </span>
          </div>
        </div>

        <div class="info-card">
          <div class="info-card__title">费用明细</div>
          <div class="info-card__item">
            <span class="info-card__label">商品单价</span>
            <span class="info-card__value">¥{{ unitPrice.toFixed(2) }} × {{ quantity }}</span>
          </div>
          <div class="info-card__item">
            <span class="info-card__label">配送费用</span>
            <span class="info-card__value info-card__value--free">¥0.00</span>
          </div>
          <div class="info-card__item info-card__item--total">
            <span class="info-card__label">每次配送</span>
            <span class="info-card__value info-card__value--price">¥{{ totalPrice.toFixed(2) }}</span>
          </div>
          <div class="info-card__item info-card__item--save">
            <span class="info-card__label">每次节省</span>
            <span class="info-card__value info-card__value--save">¥{{ savePerDelivery.toFixed(2) }}</span>
          </div>
        </div>

        <div class="info-card">
          <div class="info-card__title">配送说明</div>
          <div class="info-card__item">
            <span class="info-card__label">配送时间</span>
            <span class="info-card__value">上午 08:00 - 12:00</span>
          </div>
          <div class="info-card__item">
            <span class="info-card__label">配送范围</span>
            <span class="info-card__value">全市区范围</span>
          </div>
          <div class="info-card__item">
            <span class="info-card__label">灵活调整</span>
            <span class="info-card__value">随时修改、暂停、取消</span>
          </div>
        </div>

        <div class="saved-info">
          <van-icon name="gift-o" size="14" color="#FF6B6B" />
          <span>累计已省 <strong>¥{{ subscription.totalSaved.toFixed(2) }}</strong></span>
        </div>
      </div>

      <div class="bottom-bar">
        <div class="bottom-bar__price">
          <span class="bottom-bar__price-label">每次配送</span>
          <span class="bottom-bar__price-value">¥{{ totalPrice.toFixed(2) }}</span>
        </div>
        <van-button
          type="primary"
          round
          block
          class="bottom-bar__btn"
          :disabled="!hasChanges()"
          @click="handleSave"
        >
          {{ hasChanges() ? '保存修改' : '未修改' }}
        </van-button>
      </div>
    </template>

    <van-popup
      v-model:show="showCyclePopup"
      position="bottom"
      round
      :style="{ maxHeight: '50vh' }"
    >
      <div class="picker-popup">
        <div class="picker-popup__header">
          <span class="picker-popup__cancel" @click="showCyclePopup = false">取消</span>
          <span class="picker-popup__title">选择配送周期</span>
          <span class="picker-popup__confirm" @click="handleCycleConfirm">确定</span>
        </div>
        <div class="picker-options">
          <div
            v-for="option in cycleOptions"
            :key="option.value"
            :class="[
              'picker-option',
              { 'picker-option--active': selectedCycle === option.value },
            ]"
            @click="selectedCycle = option.value as SubscriptionCycle"
          >
            <span>{{ option.text }}</span>
            <van-icon v-if="selectedCycle === option.value" name="success" size="16" color="#4ECDC4" />
          </div>
        </div>
      </div>
    </van-popup>

    <van-popup
      v-model:show="showWeekdayPopup"
      position="bottom"
      round
      :style="{ maxHeight: '60vh' }"
    >
      <div class="picker-popup">
        <div class="picker-popup__header">
          <span class="picker-popup__cancel" @click="showWeekdayPopup = false">取消</span>
          <span class="picker-popup__title">选择配送日</span>
          <span class="picker-popup__confirm" @click="handleWeekdayConfirm">确定</span>
        </div>
        <div class="weekday-picker">
          <div
            v-for="option in weekdayOptions"
            :key="option.value"
            :class="[
              'weekday-option',
              { 'weekday-option--active': selectedWeekdays.includes(option.value) },
            ]"
            @click="toggleWeekday(option.value)"
          >
            <span>{{ option.text }}</span>
            <van-icon
              v-if="selectedWeekdays.includes(option.value)"
              name="success"
              size="16"
              color="#4ECDC4"
            />
          </div>
        </div>
        <div class="picker-popup__hint">可多选配送日</div>
      </div>
    </van-popup>

    <van-popup
      v-model:show="showAddressPopup"
      position="bottom"
      round
      :style="{ maxHeight: '70vh' }"
    >
      <div class="address-popup">
        <div class="address-popup__header">
          <span class="address-popup__title">选择收货地址</span>
          <span class="address-popup__add" @click="router.push('/user/address/edit')">
            <van-icon name="plus" size="14" />
            新增地址
          </span>
        </div>
        <div class="address-popup__list">
          <div
            v-for="addr in addressStore.addresses"
            :key="addr.id"
            :class="[
              'address-item',
              { 'address-item--active': selectedAddressId === addr.id },
            ]"
            @click="handleAddressSelect(addr.id)"
          >
            <div class="address-item__info">
              <div class="address-item__name">
                {{ addr.name }}
                <span class="address-item__phone">{{ addr.phone }}</span>
                <van-tag v-if="addr.isDefault" type="primary" size="medium" round>默认</van-tag>
              </div>
              <div class="address-item__detail">
                {{ addr.province }}{{ addr.city }}{{ addr.district }}{{ addr.detail }}
              </div>
            </div>
            <van-icon
              v-if="selectedAddressId === addr.id"
              name="success"
              size="18"
              color="#4ECDC4"
            />
          </div>
        </div>
        <van-empty v-if="addressStore.addresses.length === 0" description="暂无收货地址" />
      </div>
    </van-popup>

    <van-popup
      v-model:show="showDatePicker"
      position="bottom"
      round
    >
      <van-date-picker
        :min-date="new Date(Date.now() + 24 * 60 * 60 * 1000)"
        :max-date="new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)"
        @confirm="handleDateConfirm"
        @cancel="showDatePicker = false"
      />
    </van-popup>
  </div>
</template>

<style scoped lang="scss">
@use '@/assets/styles/variables' as *;

.subscription-edit-page {
  min-height: 100vh;
  background: $bg;
  padding-bottom: calc(80px + env(safe-area-inset-bottom));
}

.loading {
  padding: 60px 0;
}

.page-body {
  padding-bottom: 24px;
}

.product-info {
  background: $bg-card;
  padding: 16px;
  margin-bottom: 12px;
  display: flex;
  gap: 12px;

  &__img {
    width: 100px;
    height: 100px;
    border-radius: $radius-md;
    object-fit: cover;
    flex-shrink: 0;
  }

  &__content {
    flex: 1;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    min-width: 0;
  }

  &__name {
    font-size: 16px;
    font-weight: 600;
    color: $text-primary;
    margin: 0 0 6px 0;
    line-height: 1.4;
  }

  &__spec {
    font-size: 13px;
    color: $text-secondary;
    margin-bottom: 8px;
  }

  &__price-row {
    display: flex;
    align-items: baseline;
    gap: 8px;
  }

  &__price {
    font-size: 22px;
    font-weight: 700;
    color: $danger;

    &::before {
      content: '¥';
      font-size: 0.6em;
      font-weight: 600;
    }
  }

  &__original {
    font-size: 13px;
    color: $text-secondary;
    text-decoration: line-through;

    &::before {
      content: '¥';
    }
  }
}

.status-banner {
  display: flex;
  align-items: center;
  gap: 12px;
  margin: 0 16px 12px;
  padding: 14px 16px;
  border-radius: $radius-md;
  background: rgba(78, 205, 196, 0.1);
  border: 1px solid rgba(78, 205, 196, 0.2);

  &--paused {
    background: rgba(255, 149, 0, 0.1);
    border-color: rgba(255, 149, 0, 0.2);
  }

  &--cancelled {
    background: rgba(153, 153, 153, 0.1);
    border-color: rgba(153, 153, 153, 0.2);
  }

  &__icon {
    font-size: 28px;
  }

  &__info {
    flex: 1;
  }

  &__title {
    font-size: 15px;
    font-weight: 600;
    color: $text-primary;
    margin-bottom: 2px;
  }

  &__desc {
    font-size: 12px;
    color: $text-secondary;
  }

  &__actions {
    display: flex;
    gap: 8px;
  }
}

.form-section {
  background: $bg-card;
  border-radius: $radius-md;
  margin: 0 16px 12px;
  overflow: hidden;
}

.form-row {
  display: flex;
  align-items: center;
  padding: 14px 16px;
  border-bottom: 1px solid $border;
  cursor: pointer;

  &:last-child {
    border-bottom: none;
  }

  &--full {
    flex-direction: column;
    align-items: flex-start;
    padding-top: 0;
    padding-bottom: 14px;
    cursor: default;
  }

  &__label {
    font-size: 14px;
    color: $text-secondary;
    flex-shrink: 0;
    width: 80px;
  }

  &__value {
    flex: 1;
    font-size: 14px;
    color: $text-primary;
    text-align: right;
    margin-right: 8px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;

    &--highlight {
      color: #4ECDC4;
      font-weight: 600;
    }
  }

  &__address {
    font-size: 13px;
    color: $text-secondary;
    margin-left: 80px;
    line-height: 1.5;
  }
}

.info-card {
  background: $bg-card;
  border-radius: $radius-md;
  margin: 0 16px 12px;
  padding: 16px;

  &__title {
    font-size: 15px;
    font-weight: 600;
    color: $text-primary;
    margin-bottom: 12px;
  }

  &__item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 6px 0;
    font-size: 13px;

    &--total {
      padding-top: 10px;
      margin-top: 4px;
      border-top: 1px dashed $border;
    }

    &--save {
      padding-top: 8px;
    }
  }

  &__label {
    color: $text-secondary;
  }

  &__value {
    color: $text-primary;

    &--free {
      color: $primary;
    }

    &--price {
      font-size: 18px;
      font-weight: 700;
      color: $danger;

      &::before {
        content: '¥';
        font-size: 0.65em;
      }
    }

    &--save {
      font-size: 14px;
      font-weight: 600;
      color: $danger;

      &::before {
        content: '¥';
        font-size: 0.8em;
      }
    }
  }
}

.saved-info {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  padding: 16px;
  font-size: 13px;
  color: $text-secondary;

  strong {
    color: $danger;
    font-size: 15px;
  }
}

.bottom-bar {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background: $bg-card;
  padding: 12px 16px calc(12px + env(safe-area-inset-bottom));
  display: flex;
  align-items: center;
  gap: 16px;
  box-shadow: 0 -2px 12px rgba(0, 0, 0, 0.06);
  z-index: 100;

  &__price {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
  }

  &__price-label {
    font-size: 11px;
    color: $text-secondary;
    margin-bottom: 2px;
  }

  &__price-value {
    font-size: 22px;
    font-weight: 700;
    color: $danger;

    &::before {
      content: '¥';
      font-size: 0.6em;
      font-weight: 600;
    }
  }

  &__btn {
    flex: 1;
    height: 48px !important;
    font-size: 16px !important;
    background: linear-gradient(135deg, #4ECDC4 0%, #44A08D 100%) !important;
    border: none !important;

    &--disabled {
      background: #ccc !important;
    }
  }
}

.picker-popup {
  padding: 0 16px calc(16px + env(safe-area-inset-bottom));

  &__header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    height: 48px;
    border-bottom: 1px solid $border;
  }

  &__cancel {
    font-size: 14px;
    color: $text-secondary;
  }

  &__title {
    font-size: 16px;
    font-weight: 600;
    color: $text-primary;
  }

  &__confirm {
    font-size: 14px;
    font-weight: 600;
    color: #4ECDC4;
  }

  &__hint {
    text-align: center;
    font-size: 12px;
    color: $text-secondary;
    padding-top: 12px;
  }
}

.picker-options {
  padding: 12px 0;
}

.picker-option {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 14px 12px;
  border-radius: $radius-sm;
  margin-bottom: 8px;
  background: $bg-gray;
  font-size: 15px;
  color: $text-primary;
  cursor: pointer;

  &--active {
    background: rgba(78, 205, 196, 0.1);
    color: #4ECDC4;
    font-weight: 500;
  }

  &:last-child {
    margin-bottom: 0;
  }
}

.weekday-picker {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px;
  padding: 20px 0;
}

.weekday-option {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 6px;
  height: 56px;
  border-radius: $radius-sm;
  background: $bg-gray;
  font-size: 15px;
  color: $text-primary;
  cursor: pointer;

  &--active {
    background: rgba(78, 205, 196, 0.1);
    color: #4ECDC4;
    font-weight: 500;
  }
}

.address-popup {
  padding: 0 0 calc(16px + env(safe-area-inset-bottom));

  &__header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 16px;
    border-bottom: 1px solid $border;
  }

  &__title {
    font-size: 16px;
    font-weight: 600;
    color: $text-primary;
  }

  &__add {
    display: flex;
    align-items: center;
    gap: 4px;
    font-size: 13px;
    color: #4ECDC4;
    font-weight: 500;
  }

  &__list {
    max-height: 60vh;
    overflow-y: auto;
  }
}

.address-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px;
  border-bottom: 1px solid $border;
  cursor: pointer;

  &--active {
    background: rgba(78, 205, 196, 0.05);
  }

  &__info {
    flex: 1;
    min-width: 0;
  }

  &__name {
    font-size: 15px;
    font-weight: 500;
    color: $text-primary;
    margin-bottom: 6px;
    display: flex;
    align-items: center;
    gap: 8px;
  }

  &__phone {
    font-size: 13px;
    color: $text-secondary;
    font-weight: 400;
  }

  &__detail {
    font-size: 13px;
    color: $text-secondary;
    line-height: 1.5;
  }
}
</style>
