<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { storeToRefs } from 'pinia'
import { useRouter } from 'vue-router'
import { Cell, CellGroup, RadioGroup, Radio, Button, Popup, Icon, showToast } from 'vant'
import AppHeader from '@/components/AppHeader.vue'
import { useCartStore } from '@/stores/cart'
import { useAddressStore } from '@/stores/address'
import { useOrderStore } from '@/stores/order'
import { useUserStore } from '@/stores/user'
import { formatPrice } from '@/utils/format'
import type { OrderItem, Address, Coupon } from '@/types'

const router = useRouter()
const cartStore = useCartStore()
const addressStore = useAddressStore()
const orderStore = useOrderStore()
const userStore = useUserStore()

const { selectedItems, totalAmount } = storeToRefs(cartStore)
const { defaultAddress, addresses } = storeToRefs(addressStore)

const paymentMethod = ref<'wechat' | 'alipay' | 'balance'>('wechat')
const showAddressPopup = ref(false)
const showCouponPopup = ref(false)
const selectedAddress = ref<Address | null>(null)
const selectedCoupon = ref<Coupon | null>(null)
const submitting = ref(false)

const currentAddress = computed(() => selectedAddress.value ?? defaultAddress.value)

const deliveryFee = computed(() => (totalAmount.value >= 39 ? 0 : 5))

const availableCoupons = computed(() => {
  return userStore.availableCoupons.filter(c => {
    if (c.minAmount > totalAmount.value) return false
    if (c.status !== 'unused') return false
    return true
  })
})

const bestCoupon = computed(() => {
  if (availableCoupons.value.length === 0) return null
  return availableCoupons.value.reduce((best, current) => {
    const bestValue = best.type === 'fixed' ? best.value : totalAmount.value * (1 - best.value / 100)
    const currentValue = current.type === 'fixed' ? current.value : totalAmount.value * (1 - current.value / 100)
    return currentValue > bestValue ? current : best
  })
})

const discountAmount = computed(() => {
  if (!selectedCoupon.value) return 0
  if (selectedCoupon.value.type === 'fixed') {
    return selectedCoupon.value.value
  }
  return totalAmount.value * (1 - selectedCoupon.value.value / 100)
})

const payAmount = computed(() => totalAmount.value + deliveryFee.value - discountAmount.value)

const couponText = computed(() => {
  if (selectedCoupon.value) {
    return `-¥${formatPrice(discountAmount.value)}`
  }
  if (availableCoupons.value.length > 0) {
    return `${availableCoupons.value.length}张可用`
  }
  return '暂无可用'
})

function autoSelectBestCoupon() {
  if (bestCoupon.value && !selectedCoupon.value) {
    selectedCoupon.value = bestCoupon.value
  }
}

function onSelectCoupon(coupon: Coupon | null) {
  selectedCoupon.value = coupon
  showCouponPopup.value = false
}

function formatCouponValue(coupon: Coupon): string {
  if (coupon.type === 'fixed') {
    return `¥${coupon.value}`
  }
  return `${coupon.value}折`
}

function formatCouponCondition(coupon: Coupon): string {
  return `满${coupon.minAmount}可用`
}

watch(totalAmount, () => {
  if (selectedCoupon.value && selectedCoupon.value.minAmount > totalAmount.value) {
    selectedCoupon.value = null
    showToast('当前订单金额不满足优惠券使用条件')
  }
  autoSelectBestCoupon()
}, { immediate: true })

const orderItems = computed<OrderItem[]>(() =>
  selectedItems.value.map((item) => ({
    productId: item.productId,
    productName: item.product.name,
    productImage: item.product.images[0],
    specValues: item.specValues,
    price: item.product.price,
    quantity: item.quantity,
  })),
)

function onSelectAddress(addr: Address) {
  selectedAddress.value = addr
  showAddressPopup.value = false
}

function onChangeAddress() {
  if (addresses.value.length) {
    showAddressPopup.value = true
  } else {
    router.push('/user/address/edit')
  }
}

function specText(specValues: Record<string, string>) {
  return Object.values(specValues).join(' / ')
}

async function onSubmit() {
  if (!currentAddress.value) {
    router.push('/user/address/edit')
    return
  }
  if (submitting.value) return
  submitting.value = true
  try {
    const order = await orderStore.createOrder({
      items: orderItems.value,
      totalAmount: totalAmount.value,
      payAmount: payAmount.value,
      address: currentAddress.value,
    })
    if (selectedCoupon.value) {
      userStore.useCoupon(selectedCoupon.value.id)
      if (userStore.userInfo) {
        userStore.userInfo.isNewUser = false
      }
    }
    cartStore.clearCart()
    router.push(`/payment/${order.id}`)
  } finally {
    submitting.value = false
  }
}

function onClickCoupon() {
  if (availableCoupons.value.length > 0 || userStore.availableCoupons.length > 0) {
    showCouponPopup.value = true
  }
}

onMounted(async () => {
  if (!userStore.isLoggedIn) {
    router.replace({ path: '/login', query: { redirect: '/checkout' } })
    return
  }
  addressStore.fetchAddresses()
  try {
    await userStore.getCouponList()
  } catch (e) {
    console.error('获取优惠券列表失败', e)
  }
})
</script>

<template>
  <div class="checkout-page">
    <AppHeader title="确认订单" :show-back="true" @click-left="router.back()" />

    <div class="checkout-body">
      <div class="address-card" @click="onChangeAddress" v-if="currentAddress">
        <div class="address-card__icon">
          <van-icon name="location" color="#2DB87B" size="20" />
        </div>
        <div class="address-card__info">
          <div class="address-card__user">
            <span class="address-card__name">{{ currentAddress.name }}</span>
            <span class="address-card__phone">{{ currentAddress.phone }}</span>
          </div>
          <div class="address-card__detail">
            {{ currentAddress.province }}{{ currentAddress.city }}{{ currentAddress.district }}{{ currentAddress.detail }}
          </div>
        </div>
        <van-icon name="arrow" class="address-card__arrow" />
      </div>

      <div class="address-card address-card--empty" @click="onChangeAddress" v-else>
        <van-icon name="add-o" size="20" color="#2DB87B" />
        <span class="address-card__add">添加收货地址</span>
        <van-icon name="arrow" class="address-card__arrow" />
      </div>

      <div class="section product-list">
        <div class="section-title">商品清单</div>
        <div class="product-item" v-for="item in selectedItems" :key="item.id">
          <img :src="item.product.images[0]" class="product-item__image" />
          <div class="product-item__info">
            <div class="product-item__name">{{ item.product.name }}</div>
            <div class="product-item__spec" v-if="Object.keys(item.specValues).length">
              {{ specText(item.specValues) }}
            </div>
          </div>
          <div class="product-item__price-wrap">
            <div class="product-item__price">¥{{ formatPrice(item.product.price) }}</div>
            <div class="product-item__qty">×{{ item.quantity }}</div>
          </div>
        </div>
      </div>

      <van-cell-group class="section" :border="false">
        <van-cell title="配送时间" value="尽快送达（约30分钟）" is-link />
        <van-cell
          title="优惠券"
          :value="couponText"
          :value-class="selectedCoupon ? 'coupon-value--selected' : ''"
          is-link
          @click="onClickCoupon"
        />
      </van-cell-group>

      <div class="section payment-section">
        <div class="section-title">支付方式</div>
        <van-radio-group v-model="paymentMethod" class="payment-group">
          <div class="payment-item" @click="paymentMethod = 'wechat'">
            <span class="payment-item__icon payment-item__icon--wechat">微</span>
            <span class="payment-item__label">微信支付</span>
            <van-radio name="wechat" />
          </div>
          <div class="payment-item" @click="paymentMethod = 'alipay'">
            <span class="payment-item__icon payment-item__icon--alipay">支</span>
            <span class="payment-item__label">支付宝</span>
            <van-radio name="alipay" />
          </div>
          <div class="payment-item" @click="paymentMethod = 'balance'">
            <span class="payment-item__icon payment-item__icon--balance">余</span>
            <span class="payment-item__label">余额支付</span>
            <van-radio name="balance" />
          </div>
        </van-radio-group>
      </div>

      <van-cell-group class="section" :border="false">
        <van-cell title="商品金额" :value="`¥${formatPrice(totalAmount)}`" />
        <van-cell title="配送费" :value="deliveryFee === 0 ? '免运费' : `¥${formatPrice(deliveryFee)}`" />
        <van-cell title="优惠金额" :value="`-¥${formatPrice(discountAmount)}`" v-if="discountAmount > 0" />
      </van-cell-group>
    </div>

    <div class="checkout-bottom">
      <div class="checkout-bottom__label">
        实付 <span class="checkout-bottom__amount">¥{{ formatPrice(payAmount) }}</span>
      </div>
      <van-button type="primary" class="checkout-bottom__submit" :loading="submitting" @click="onSubmit">
        提交订单
      </van-button>
    </div>

    <van-popup v-model:show="showAddressPopup" position="bottom" round :style="{ maxHeight: '60vh' }">
      <div class="address-popup">
        <div class="address-popup__title">选择收货地址</div>
        <div
          v-for="addr in addresses"
          :key="addr.id"
          :class="['address-popup__item', { 'address-popup__item--active': currentAddress?.id === addr.id }]"
          @click="onSelectAddress(addr)"
        >
          <div class="address-popup__user">{{ addr.name }} {{ addr.phone }}</div>
          <div class="address-popup__detail">{{ addr.province }}{{ addr.city }}{{ addr.district }}{{ addr.detail }}</div>
        </div>
      </div>
    </van-popup>

    <van-popup v-model:show="showCouponPopup" position="bottom" round :style="{ maxHeight: '70vh' }">
      <div class="coupon-popup">
        <div class="coupon-popup__header">
          <div class="coupon-popup__title">选择优惠券</div>
          <van-icon name="close" size="20" @click="showCouponPopup = false" />
        </div>
        <div class="coupon-popup__list">
          <div
            :class="['coupon-popup__item', { 'coupon-popup__item--active': !selectedCoupon }]"
            @click="onSelectCoupon(null)"
          >
            <div class="coupon-popup__none">不使用优惠券</div>
          </div>
          <div
            v-for="coupon in userStore.availableCoupons"
            :key="coupon.id"
            :class="[
              'coupon-popup__item',
              {
                'coupon-popup__item--active': selectedCoupon?.id === coupon.id,
                'coupon-popup__item--disabled': coupon.minAmount > totalAmount
              }
            ]"
            @click="coupon.minAmount <= totalAmount && onSelectCoupon(coupon)"
          >
            <div class="coupon-item">
              <div class="coupon-item__left">
                <span class="coupon-item__symbol">¥</span>
                <span class="coupon-item__value">{{ coupon.type === 'fixed' ? coupon.value : coupon.value }}</span>
                <span class="coupon-item__unit">{{ coupon.type === 'fixed' ? '' : '折' }}</span>
              </div>
              <div class="coupon-item__right">
                <div class="coupon-item__name">{{ coupon.name }}</div>
                <div class="coupon-item__condition">{{ formatCouponCondition(coupon) }}</div>
                <div class="coupon-item__time">有效期至 {{ new Date(coupon.endTime).toLocaleDateString() }}</div>
              </div>
              <div v-if="coupon.minAmount > totalAmount" class="coupon-item__mask">
                需满¥{{ coupon.minAmount }}可用
              </div>
            </div>
          </div>
          <div v-if="userStore.availableCoupons.length === 0" class="coupon-popup__empty">
            暂无可用优惠券
          </div>
        </div>
      </div>
    </van-popup>
  </div>
</template>

<style scoped lang="scss">
@use '@/assets/styles/variables' as *;

.checkout-page {
  min-height: 100vh;
  background: $bg;
  padding-top: 46px;
  padding-bottom: 60px;
}

.checkout-body {
  padding: 12px;
}

.address-card {
  display: flex;
  align-items: center;
  background: $bg-card;
  border-radius: $radius-md;
  padding: 14px 12px;
  margin-bottom: 12px;
  gap: 10px;
  box-shadow: $shadow;

  &__icon {
    flex-shrink: 0;
  }

  &__info {
    flex: 1;
    min-width: 0;
  }

  &__user {
    display: flex;
    gap: 8px;
    margin-bottom: 4px;
  }

  &__name {
    font-size: 15px;
    font-weight: 600;
    color: $text-primary;
  }

  &__phone {
    font-size: 13px;
    color: $text-secondary;
  }

  &__detail {
    font-size: 13px;
    color: $text-secondary;
    line-height: 1.4;
  }

  &__arrow {
    flex-shrink: 0;
    color: $text-secondary;
  }

  &--empty {
    justify-content: center;
    gap: 8px;
  }

  &__add {
    font-size: 14px;
    color: $primary;
    font-weight: 500;
  }
}

.section {
  background: $bg-card;
  border-radius: $radius-md;
  padding: 0 12px;
  margin-bottom: 12px;
  box-shadow: $shadow;
}

.section-title {
  font-size: 15px;
  font-weight: 600;
  color: $text-primary;
  padding: 14px 0 10px;
}

.product-item {
  display: flex;
  align-items: center;
  padding: 10px 0;
  gap: 10px;
  border-bottom: 1px solid $border;

  &:last-child {
    border-bottom: none;
  }

  &__image {
    width: 60px;
    height: 60px;
    border-radius: $radius-sm;
    object-fit: cover;
    flex-shrink: 0;
  }

  &__info {
    flex: 1;
    min-width: 0;
  }

  &__name {
    font-size: 14px;
    color: $text-primary;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  &__spec {
    font-size: 12px;
    color: $text-secondary;
    margin-top: 4px;
  }

  &__price-wrap {
    flex-shrink: 0;
    text-align: right;
  }

  &__price {
    font-size: 14px;
    color: $text-primary;
    font-weight: 500;
  }

  &__qty {
    font-size: 12px;
    color: $text-secondary;
    margin-top: 2px;
  }
}

.payment-group {
  padding-bottom: 10px;
}

.payment-item {
  display: flex;
  align-items: center;
  padding: 12px 0;
  gap: 10px;
  border-bottom: 1px solid $border;

  &:last-child {
    border-bottom: none;
  }

  &__icon {
    width: 28px;
    height: 28px;
    border-radius: 6px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 13px;
    font-weight: 700;
    color: #fff;
    flex-shrink: 0;

    &--wechat {
      background: #07C160;
    }

    &--alipay {
      background: #1677FF;
    }

    &--balance {
      background: $accent;
    }
  }

  &__label {
    flex: 1;
    font-size: 14px;
    color: $text-primary;
  }
}

.checkout-bottom {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  height: 50px;
  background: $bg-card;
  display: flex;
  align-items: center;
  padding: 0 12px;
  box-shadow: 0 -1px 8px rgba(0, 0, 0, 0.06);
  z-index: 100;

  &__label {
    flex: 1;
    font-size: 14px;
    color: $text-primary;
  }

  &__amount {
    color: $danger;
    font-size: 18px;
    font-weight: 700;
  }

  &__submit {
    flex-shrink: 0;
    border-radius: 20px;
    padding: 0 28px;
    height: 36px;
    font-size: 14px;
    font-weight: 600;
  }
}

.address-popup {
  padding: 16px;

  &__title {
    font-size: 16px;
    font-weight: 600;
    text-align: center;
    margin-bottom: 16px;
    color: $text-primary;
  }

  &__item {
    padding: 12px;
    border-radius: $radius-sm;
    border: 1px solid $border;
    margin-bottom: 8px;

    &--active {
      border-color: $primary;
      background: $primary-light;
    }
  }

  &__user {
    font-size: 14px;
    font-weight: 500;
    color: $text-primary;
    margin-bottom: 4px;
  }

  &__detail {
    font-size: 13px;
    color: $text-secondary;
    line-height: 1.4;
  }
}

.coupon-value--selected {
  color: $danger !important;
  font-weight: 600 !important;
}

.coupon-popup {
  padding: 0;

  &__header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 16px;
    border-bottom: 1px solid $border;
  }

  &__title {
    font-size: 16px;
    font-weight: 600;
    color: $text-primary;
  }

  &__list {
    padding: 12px 16px;
    max-height: 60vh;
    overflow-y: auto;
  }

  &__item {
    margin-bottom: 10px;
    position: relative;

    &--active {
      .coupon-item {
        border-color: $primary;
      }
    }

    &--disabled {
      opacity: 0.6;
    }
  }

  &__none {
    padding: 16px;
    text-align: center;
    background: $bg-card;
    border: 1px solid $border;
    border-radius: $radius-md;
    font-size: 14px;
    color: $text-secondary;
  }

  &__empty {
    padding: 40px 20px;
    text-align: center;
    font-size: 14px;
    color: $text-secondary;
  }
}

.coupon-item {
  display: flex;
  background: linear-gradient(135deg, #fff5f5 0%, #ffffff 100%);
  border: 1px solid #ffd1d1;
  border-radius: $radius-md;
  overflow: hidden;
  position: relative;

  &__left {
    flex-shrink: 0;
    width: 100px;
    display: flex;
    align-items: baseline;
    justify-content: center;
    padding: 16px 8px;
    background: linear-gradient(135deg, #ff6b6b 0%, #ee4b4b 100%);
    color: #fff;
    position: relative;

    &::after {
      content: '';
      position: absolute;
      right: -6px;
      top: 50%;
      transform: translateY(-50%);
      width: 12px;
      height: 12px;
      border-radius: 50%;
      background: #fff;
    }
  }

  &__symbol {
    font-size: 14px;
    font-weight: 600;
  }

  &__value {
    font-size: 28px;
    font-weight: 700;
    font-family: $font-display;
    line-height: 1;
  }

  &__unit {
    font-size: 12px;
    font-weight: 500;
  }

  &__right {
    flex: 1;
    padding: 12px 14px;
    display: flex;
    flex-direction: column;
    justify-content: center;
    gap: 4px;
  }

  &__name {
    font-size: 14px;
    font-weight: 600;
    color: $text-primary;
  }

  &__condition {
    font-size: 12px;
    color: $danger;
  }

  &__time {
    font-size: 11px;
    color: $text-secondary;
  }

  &__mask {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.5);
    color: #fff;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 13px;
    font-weight: 500;
    border-radius: $radius-md;
  }
}
</style>
