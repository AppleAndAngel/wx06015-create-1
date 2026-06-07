<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import {
  showToast,
  showLoadingToast,
  closeToast,
  showConfirmDialog,
  Popup,
  Picker,
  DatePicker,
} from 'vant'
import { useSubscriptionStore } from '@/stores/subscription'
import { useUserStore } from '@/stores/user'
import { useAddressStore } from '@/stores/address'
import AppHeader from '@/components/AppHeader.vue'
import type { SubscriptionCycle, Weekday, CreateSubscriptionParams } from '@/types'
import dayjs from 'dayjs'

const route = useRoute()
const router = useRouter()
const subscriptionStore = useSubscriptionStore()
const userStore = useUserStore()
const addressStore = useAddressStore()

const productId = computed(() => Number(route.params.id))
const product = computed(() => subscriptionStore.currentProduct)

const selectedSpecs = ref<Record<string, string>>({})
const quantity = ref(1)
const selectedCycle = ref<SubscriptionCycle>('weekly')
const selectedWeekdays = ref<Weekday[]>([6])
const selectedAddressId = ref<number | null>(null)
const showSpecPopup = ref(false)
const showWeekdayPopup = ref(false)
const showAddressPopup = ref(false)
const showCyclePopup = ref(false)
const showDatePicker = ref(false)
const customStartDate = ref('')
const datePickerValue = ref<string[]>([])

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
  if (!product.value) return ''
  const values = Object.values(selectedSpecs.value)
  return values.length === product.value.product.specs.length
    ? values.join(' ')
    : '请选择规格'
})

const availableCycles = computed(() => {
  if (!product.value) return []
  return cycleOptions.filter((o) =>
    product.value!.availableCycles.includes(o.value as SubscriptionCycle)
  )
})

const unitPrice = computed(() => product.value?.subscribePrice || 0)
const originalUnitPrice = computed(() => product.value?.originalPrice || 0)
const totalPrice = computed(() => unitPrice.value * quantity.value)
const originalTotalPrice = computed(() => originalUnitPrice.value * quantity.value)
const savePerDelivery = computed(() => originalTotalPrice.value - totalPrice.value)

const estimatedFirstDelivery = computed(() => {
  if (customStartDate.value) return customStartDate.value
  const today = dayjs()
  if (selectedCycle.value === 'daily') {
    return today.add(1, 'day').format('YYYY-MM-DD')
  }
  const nextDate = findNextWeekday(today.toDate(), selectedWeekdays.value[0])
  return dayjs(nextDate).format('YYYY-MM-DD')
})

function findNextWeekday(fromDate: Date, weekday: Weekday): Date {
  const result = new Date(fromDate)
  result.setDate(result.getDate() + ((weekday - result.getDay() + 7) % 7 || 7))
  return result
}

function formatDate(dateStr: string): string {
  const date = dayjs(dateStr)
  const today = dayjs()
  const diff = date.diff(today, 'day')
  if (diff === 0) return '今天'
  if (diff === 1) return '明天'
  if (diff === 2) return '后天'
  const weekdays = ['周日', '周一', '周二', '周三', '周四', '周五', '周六']
  return `${date.format('MM月DD日')} ${weekdays[date.day()]}`
}

function selectSpec(specName: string, value: string) {
  selectedSpecs.value = { ...selectedSpecs.value, [specName]: value }
}

function handleSpecConfirm() {
  if (!product.value) return
  const allSelected = product.value.product.specs.every(
    (spec) => selectedSpecs.value[spec.name]
  )
  if (!allSelected) {
    showToast('请选择完整规格')
    return
  }
  showSpecPopup.value = false
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

function openDatePicker() {
  const dateStr = customStartDate.value || estimatedFirstDelivery.value
  datePickerValue.value = dateStr.split('-')
  showDatePicker.value = true
}

function handleDateConfirm(value: string[]) {
  customStartDate.value = value.join('-')
  showDatePicker.value = false
}

async function handleSubscribe() {
  if (!userStore.isLoggedIn) {
    router.push({
      path: '/login',
      query: { redirect: `/subscription/${productId.value}` },
    })
    return
  }

  if (!product.value) return

  const allSelected = product.value.product.specs.every(
    (spec) => selectedSpecs.value[spec.name]
  )
  if (!allSelected) {
    showSpecPopup.value = true
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

  const existing = subscriptionStore.getSubscriptionByProductId(productId.value)
  if (existing) {
    showConfirmDialog({
      title: '提示',
      message: '您已订阅此商品，是否前往"我的订阅"管理？',
      confirmButtonText: '去管理',
      cancelButtonText: '取消',
    })
      .then(() => {
        router.push('/my-subscriptions')
      })
      .catch(() => {})
    return
  }

  const params: CreateSubscriptionParams = {
    subscriptionProductId: productId.value,
    specValues: { ...selectedSpecs.value },
    quantity: quantity.value,
    cycle: selectedCycle.value,
    weekdays: [...selectedWeekdays.value],
    startTime: estimatedFirstDelivery.value,
    addressId: selectedAddressId.value,
  }

  showLoadingToast({ message: '订阅中...', forbidClick: true })
  try {
    await subscriptionStore.createSubscription(params)
    closeToast()
    showToast({ message: '订阅成功！', type: 'success' })
    setTimeout(() => {
      router.push('/my-subscriptions')
    }, 1500)
  } catch (e) {
    closeToast()
    showToast({ message: '订阅失败，请重试', type: 'fail' })
  }
}

function goBack() {
  router.back()
}

onMounted(async () => {
  try {
    await Promise.all([
      subscriptionStore.fetchProduct(productId.value),
      subscriptionStore.fetchMySubscriptions(),
      addressStore.fetchAddresses(),
    ])

    if (product.value) {
      selectedCycle.value = product.value.defaultCycle
      if (product.value.defaultCycle === 'daily') {
        selectedWeekdays.value = [1, 2, 3, 4, 5]
      }

      product.value.product.specs.forEach((spec) => {
        selectedSpecs.value[spec.name] = spec.values[0]
      })

      quantity.value = product.value.minQuantity
    }

    const defaultAddress = addressStore.addresses.find((a) => a.isDefault)
    if (defaultAddress) {
      selectedAddressId.value = defaultAddress.id
    }
  } catch (e) {
    console.error('[SubscriptionDetail] 加载数据失败', e)
    showToast('加载失败，请重试')
  }
})

watch(
  () => subscriptionStore.currentProduct,
  (newVal) => {
    if (newVal) {
      selectedCycle.value = newVal.defaultCycle
    }
  }
)
</script>

<template>
  <div class="subscription-detail-page" v-if="product">
    <AppHeader title="订阅详情" :show-back="true" @click-left="goBack" />

    <div class="page-body">
      <div class="product-info">
        <div class="product-info__main">
          <img
            v-lazy="product.product.images[0]"
            class="product-info__img"
            :alt="product.product.name"
          />
          <div class="product-info__content">
            <h1 class="product-info__name">{{ product.product.name }}</h1>
            <p class="product-info__desc">{{ product.description }}</p>
            <div class="product-info__price-row">
              <span class="product-info__price">¥{{ product.subscribePrice.toFixed(1) }}</span>
              <span class="product-info__original">¥{{ product.originalPrice.toFixed(1) }}</span>
              <span class="product-info__discount">{{ product.discount }}</span>
            </div>
          </div>
        </div>
      </div>

      <div class="form-section">
        <div class="form-row" @click="showSpecPopup = true">
          <span class="form-row__label">商品规格</span>
          <span class="form-row__value">{{ specText }}</span>
          <van-icon name="arrow" size="14" color="#999" />
        </div>

        <div class="form-row">
          <span class="form-row__label">购买数量</span>
          <van-stepper
            v-model="quantity"
            :min="product.minQuantity"
            :max="product.maxQuantity"
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

        <div class="form-row" @click="openDatePicker">
          <span class="form-row__label">首次配送</span>
          <span class="form-row__value form-row__value--highlight">
            {{ formatDate(estimatedFirstDelivery) }}
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
          <span class="info-card__label">配送费用</span>
          <span class="info-card__value info-card__value--free">订阅专享 免运费</span>
        </div>
        <div class="info-card__item">
          <span class="info-card__label">灵活调整</span>
          <span class="info-card__value">随时修改、暂停、取消</span>
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

      <div class="subscriber-info">
        <van-icon name="friends-o" size="14" color="#4ECDC4" />
        <span>{{ product.totalSubscribers }} 人正在订阅此商品</span>
      </div>
    </div>

    <div class="bottom-bar">
      <div class="bottom-bar__price">
        <span class="bottom-bar__price-label">每次配送</span>
        <span class="bottom-bar__price-value">¥{{ totalPrice.toFixed(2) }}</span>
        <span class="bottom-bar__price-original">¥{{ originalTotalPrice.toFixed(2) }}</span>
      </div>
      <van-button
        type="primary"
        round
        block
        class="bottom-bar__btn"
        @click="handleSubscribe"
      >
        立即订阅
      </van-button>
    </div>

    <van-popup
      v-model:show="showSpecPopup"
      position="bottom"
      round
      closeable
      :style="{ maxHeight: '75vh' }"
    >
      <div class="spec-popup" v-if="product">
        <div class="spec-popup__header">
          <img :src="product.product.images[0]" class="spec-popup__image" :alt="product.product.name" />
          <div class="spec-popup__info">
            <h3 class="spec-popup__name">{{ product.product.name }}</h3>
            <span class="spec-popup__price">¥{{ product.subscribePrice.toFixed(2) }}</span>
          </div>
        </div>

        <div class="spec-popup__body">
          <div v-for="spec in product.product.specs" :key="spec.name" class="spec-popup__group">
            <h4 class="spec-popup__group-title">{{ spec.name }}</h4>
            <div class="spec-popup__group-values">
              <span
                v-for="val in spec.values"
                :key="val"
                :class="[
                  'spec-popup__tag',
                  { 'spec-popup__tag--active': selectedSpecs[spec.name] === val },
                ]"
                @click="selectSpec(spec.name, val)"
              >
                {{ val }}
              </span>
            </div>
          </div>
        </div>

        <van-button type="primary" block round class="spec-popup__confirm" @click="handleSpecConfirm">
          确认
        </van-button>
      </div>
    </van-popup>

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
            v-for="option in availableCycles"
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
        v-model="datePickerValue"
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

.subscription-detail-page {
  min-height: 100vh;
  background: $bg;
  padding-bottom: calc(80px + env(safe-area-inset-bottom));
}

.page-body {
  padding-bottom: 24px;
}

.product-info {
  background: $bg-card;
  padding: 16px;
  margin-bottom: 12px;

  &__main {
    display: flex;
    gap: 12px;
  }

  &__img {
    width: 120px;
    height: 120px;
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
    font-size: 17px;
    font-weight: 600;
    color: $text-primary;
    margin: 0 0 6px 0;
    line-height: 1.4;
  }

  &__desc {
    font-size: 13px;
    color: $text-secondary;
    margin: 0 0 8px 0;
    line-height: 1.5;
    display: -webkit-box;
    -webkit-box-orient: vertical;
    -webkit-line-clamp: 2;
    overflow: hidden;
  }

  &__price-row {
    display: flex;
    align-items: baseline;
    gap: 8px;
  }

  &__price {
    font-size: 24px;
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

  &__discount {
    font-size: 11px;
    color: #fff;
    background: linear-gradient(135deg, $danger, #FF6B6B);
    padding: 2px 8px;
    border-radius: 10px;
    font-weight: 600;
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

.subscriber-info {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  padding: 16px;
  font-size: 12px;
  color: $text-secondary;
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

  &__price-original {
    font-size: 11px;
    color: $text-secondary;
    text-decoration: line-through;
    margin-top: -2px;

    &::before {
      content: '¥';
    }
  }

  &__btn {
    flex: 1;
    height: 48px !important;
    font-size: 16px !important;
    background: linear-gradient(135deg, #4ECDC4 0%, #44A08D 100%) !important;
    border: none !important;
  }
}

.spec-popup {
  padding: 20px 16px calc(16px + env(safe-area-inset-bottom));

  &__header {
    display: flex;
    gap: 12px;
    padding-bottom: 16px;
    border-bottom: 1px solid $border;
  }

  &__image {
    width: 90px;
    height: 90px;
    border-radius: $radius-sm;
    object-fit: cover;
    flex-shrink: 0;
  }

  &__info {
    flex: 1;
    min-width: 0;
    display: flex;
    flex-direction: column;
    justify-content: flex-end;
  }

  &__name {
    font-size: 15px;
    font-weight: 500;
    color: $text-primary;
    display: -webkit-box;
    -webkit-box-orient: vertical;
    -webkit-line-clamp: 2;
    overflow: hidden;
    margin-bottom: 8px;
  }

  &__price {
    color: $danger;
    font-size: 20px;
    font-weight: 700;

    &::before {
      content: '¥';
      font-size: 0.6em;
    }
  }

  &__body {
    padding: 16px 0;
    max-height: 40vh;
    overflow-y: auto;
  }

  &__group {
    margin-bottom: 20px;

    &-title {
      font-size: 14px;
      font-weight: 500;
      color: $text-primary;
      margin-bottom: 10px;
    }

    &-values {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
    }
  }

  &__tag {
    padding: 6px 14px;
    border-radius: 20px;
    font-size: 13px;
    background: $bg-gray;
    color: $text-primary;
    border: 1.5px solid transparent;
    transition: all 0.2s ease;
    cursor: pointer;

    &--active {
      background: rgba(78, 205, 196, 0.1);
      color: #4ECDC4;
      border-color: #4ECDC4;
    }
  }

  &__confirm {
    margin-top: 16px;
    background: linear-gradient(135deg, #4ECDC4 0%, #44A08D 100%) !important;
    border: none !important;
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
