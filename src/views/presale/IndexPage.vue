<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { usePresaleStore } from '@/stores/presale'
import { showToast, showLoadingToast, closeToast } from 'vant'
import dayjs from 'dayjs'
import type { PresaleProduct } from '@/types'

const router = useRouter()
const presaleStore = usePresaleStore()

const refreshing = ref(false)

const formatDateDisplay = (dateStr: string) => {
  return dayjs(dateStr).format('MM/DD')
}

const formatSaleTime = (timeStr: string) => {
  return dayjs(timeStr).format('HH:mm')
}

const formatFullDate = (dateStr: string) => {
  const date = dayjs(dateStr)
  const today = dayjs().format('YYYY-MM-DD')
  const tomorrow = dayjs().add(1, 'day').format('YYYY-MM-DD')
  
  if (dateStr === today) {
    return '今天'
  } else if (dateStr === tomorrow) {
    return '明天'
  }
  return date.format('MM月DD日')
}

const isSaleStarted = (saleTime: string) => {
  return dayjs(saleTime).isBefore(dayjs())
}

const handleDateSelect = (date: string) => {
  presaleStore.setSelectedDate(date)
}

const goToProductDetail = (product: PresaleProduct) => {
  router.push(`/product/${product.productId}`)
}

const goToMyReservations = () => {
  if (!localStorage.getItem('token')) {
    router.push({ path: '/login', query: { redirect: '/presale/my' } })
    return
  }
  router.push('/presale/my')
}

const handleToggleReservation = async (e: Event, product: PresaleProduct) => {
  e.stopPropagation()
  
  if (!localStorage.getItem('token')) {
    router.push({ path: '/login', query: { redirect: '/presale' } })
    return
  }

  const isReserved = presaleStore.isReservedSync(product.id)
  showLoadingToast({ message: isReserved ? '取消中...' : '预约中...', forbidClick: true })

  try {
    if (isReserved) {
      await presaleStore.cancelReservation(product.id)
      closeToast()
      showToast({ message: '已取消预约', type: 'success' })
    } else {
      await presaleStore.createReservation(product.id)
      closeToast()
      showToast({ message: '预约成功，开售前将提醒您', type: 'success' })
    }
  } catch (err: any) {
    closeToast()
    showToast({ message: err.message || '操作失败，请重试', type: 'fail' })
  }
}

const onRefresh = () => {
  setTimeout(() => {
    loadData()
    refreshing.value = false
  }, 500)
}

const loadData = async () => {
  try {
    await presaleStore.fetchCalendar()
    if (localStorage.getItem('token')) {
      await presaleStore.fetchMyReservations()
    }
  } catch (e) {
    console.error('加载预售日历失败', e)
    showToast({ message: '加载失败，请下拉刷新', type: 'fail' })
  }
}

onMounted(() => {
  loadData()
})
</script>

<template>
  <div class="presale-page">
    <div class="presale-header">
      <div class="presale-header__inner">
        <div class="presale-header__title">
          <van-icon name="calendar-o" size="22" color="#fff" />
          <span>时令预售日历</span>
        </div>
        <div class="presale-header__action" @click="goToMyReservations">
          <van-icon name="bell-o" size="20" color="#fff" />
          <van-badge v-if="presaleStore.reservations.length > 0" :content="presaleStore.reservations.length" class="reservation-badge" />
        </div>
      </div>
    </div>

    <div class="presale-body">
      <van-pull-refresh v-model="refreshing" @refresh="onRefresh">
        <div class="calendar-section" v-if="presaleStore.calendar.length > 0">
          <div class="calendar-header">
            <h3 class="calendar-header__title">未来一周上新</h3>
            <span class="calendar-header__tip">点击日期查看更多</span>
          </div>
          <div class="calendar-tabs">
            <div
              v-for="day in presaleStore.calendar"
              :key="day.date"
              :class="['calendar-tab', { 'calendar-tab--active': presaleStore.selectedDate === day.date, 'calendar-tab--today': day.isToday }]"
              @click="handleDateSelect(day.date)"
            >
              <div class="calendar-tab__weekday">{{ day.weekday }}</div>
              <div class="calendar-tab__date">{{ formatDateDisplay(day.date) }}</div>
              <div class="calendar-tab__badge" v-if="day.products.length > 0">
                {{ day.products.length }}款
              </div>
              <div class="calendar-tab__today-tag" v-if="day.isToday">今天</div>
            </div>
          </div>
        </div>

        <div class="products-section" v-if="presaleStore.selectedDate">
          <div class="products-header">
            <h3 class="products-header__title">
              {{ formatFullDate(presaleStore.selectedDate) }}上新
            </h3>
            <span class="products-header__count">
              共 {{ presaleStore.selectedDateProducts.length }} 款
            </span>
          </div>

          <div class="products-list" v-if="presaleStore.selectedDateProducts.length > 0">
            <div
              v-for="product in presaleStore.selectedDateProducts"
              :key="product.id"
              class="presale-card"
              @click="goToProductDetail(product)"
            >
              <div class="presale-card__image-wrap">
                <img v-lazy="product.product.images[0]" :alt="product.product.name" class="presale-card__image" />
                <div class="presale-card__tag">{{ product.seasonTag }}</div>
                <div class="presale-card__countdown" v-if="!isSaleStarted(product.saleTime)">
                  <van-icon name="clock-o" size="12" />
                  <span>{{ formatSaleTime(product.saleTime) }} 开售</span>
                </div>
                <div class="presale-card__onsale" v-else>
                  <van-icon name="fire-o" size="12" />
                  <span>热销中</span>
                </div>
              </div>
              <div class="presale-card__content">
                <h4 class="presale-card__name">{{ product.product.name }}</h4>
                <p class="presale-card__desc">{{ product.description }}</p>
                <div class="presale-card__prices">
                  <span class="presale-card__price">
                    <span class="symbol">¥</span>{{ product.presalePrice.toFixed(2) }}
                  </span>
                  <span class="presale-card__original">¥{{ product.originalPrice.toFixed(2) }}</span>
                  <span class="presale-card__discount">
                    省{{ (product.originalPrice - product.presalePrice).toFixed(0) }}元
                  </span>
                </div>
                <div class="presale-card__footer">
                  <div class="presale-card__stats">
                    <van-icon name="star-o" size="12" color="#FFB946" />
                    <span>{{ product.product.rating.toFixed(1) }}</span>
                    <span class="divider">|</span>
                    <span>{{ product.reservationCount }}人已预约</span>
                  </div>
                  <van-button
                    :type="presaleStore.isReservedSync(product.id) ? 'default' : 'primary'"
                    size="small"
                    :class="['reserve-btn', { 'reserve-btn--reserved': presaleStore.isReservedSync(product.id) }]"
                    @click.stop="handleToggleReservation($event, product)"
                  >
                    <van-icon :name="presaleStore.isReservedSync(product.id) ? 'success' : 'bell-o'" size="14" />
                    <span>{{ presaleStore.isReservedSync(product.id) ? '已预约' : '预约提醒' }}</span>
                  </van-button>
                </div>
              </div>
            </div>
          </div>

          <div class="empty-state" v-else>
            <van-empty description="该日期暂无预售商品" />
          </div>
        </div>
      </van-pull-refresh>
    </div>
  </div>
</template>

<style scoped lang="scss">
@use '@/assets/styles/variables' as *;
@use '@/assets/styles/mixins' as *;

.presale-page {
  min-height: 100vh;
  background: $bg;
}

.presale-header {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 100;
  background: linear-gradient(135deg, #1E9A63, #2DB87B);
  padding: 10px 16px;
  padding-top: calc(env(safe-area-inset-top, 0px) + 10px);

  &__inner {
    display: flex;
    align-items: center;
    justify-content: space-between;
  }

  &__title {
    display: flex;
    align-items: center;
    gap: 8px;
    color: #fff;
    font-size: 18px;
    font-weight: 700;
    font-family: $font-display;
  }

  &__action {
    position: relative;
    padding: 4px;
  }
}

.reservation-badge {
  position: absolute;
  top: -2px;
  right: -2px;
}

.presale-body {
  padding-top: calc(env(safe-area-inset-top, 0px) + 54px);
}

.calendar-section {
  background: $bg-card;
  margin: 12px 16px;
  border-radius: $radius-md;
  box-shadow: $shadow;
  overflow: hidden;
}

.calendar-header {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  padding: 14px 16px 10px;

  &__title {
    font-size: 16px;
    font-weight: 700;
    color: $text-primary;
    margin: 0;
    font-family: $font-display;
  }

  &__tip {
    font-size: 12px;
    color: $text-secondary;
  }
}

.calendar-tabs {
  display: flex;
  gap: 8px;
  padding: 0 12px 14px;
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;

  &::-webkit-scrollbar {
    display: none;
  }
}

.calendar-tab {
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 10px 14px;
  border-radius: $radius-md;
  background: $bg-gray;
  cursor: pointer;
  transition: all 0.2s ease;
  position: relative;
  min-width: 60px;

  &--active {
    background: linear-gradient(135deg, $primary, $primary-dark);
    color: #fff;

    .calendar-tab__weekday,
    .calendar-tab__date {
      color: #fff;
    }

    .calendar-tab__badge {
      background: rgba(255, 255, 255, 0.25);
      color: #fff;
    }
  }

  &--today {
    border: 2px solid $primary;

    &.calendar-tab--active {
      border-color: transparent;
    }
  }

  &__weekday {
    font-size: 12px;
    color: $text-secondary;
    margin-bottom: 4px;
  }

  &__date {
    font-size: 16px;
    font-weight: 700;
    color: $text-primary;
  }

  &__badge {
    margin-top: 6px;
    padding: 2px 8px;
    background: $primary-light;
    color: $primary;
    border-radius: 10px;
    font-size: 10px;
    font-weight: 600;
  }

  &__today-tag {
    position: absolute;
    top: -6px;
    right: -6px;
    background: $accent;
    color: #fff;
    padding: 1px 6px;
    border-radius: 8px;
    font-size: 10px;
    font-weight: 600;
  }
}

.products-section {
  padding: 0 16px 20px;
}

.products-header {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  margin-bottom: 12px;
  padding: 0 4px;

  &__title {
    font-size: 18px;
    font-weight: 700;
    color: $text-primary;
    margin: 0;
    font-family: $font-display;
  }

  &__count {
    font-size: 12px;
    color: $text-secondary;
  }
}

.products-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.presale-card {
  display: flex;
  background: $bg-card;
  border-radius: $radius-md;
  box-shadow: $shadow;
  overflow: hidden;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
  cursor: pointer;

  &:active {
    transform: scale(0.99);
  }

  &__image-wrap {
    position: relative;
    width: 130px;
    min-width: 130px;
    height: 130px;
    flex-shrink: 0;
  }

  &__image {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  &__tag {
    position: absolute;
    top: 8px;
    left: 8px;
    background: linear-gradient(135deg, $accent, #FF6B35);
    color: #fff;
    padding: 3px 8px;
    border-radius: 4px;
    font-size: 10px;
    font-weight: 600;
    z-index: 2;
  }

  &__countdown,
  &__onsale {
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 4px;
    padding: 6px;
    font-size: 11px;
    font-weight: 600;
    z-index: 2;
  }

  &__countdown {
    background: rgba(0, 0, 0, 0.65);
    color: #fff;
  }

  &__onsale {
    background: linear-gradient(135deg, $danger, #FF3B3B);
    color: #fff;
  }

  &__content {
    flex: 1;
    display: flex;
    flex-direction: column;
    padding: 12px 14px;
    min-width: 0;
  }

  &__name {
    font-size: 15px;
    font-weight: 600;
    color: $text-primary;
    margin: 0 0 4px 0;
    @include text-ellipsis-1;
  }

  &__desc {
    font-size: 12px;
    color: $text-secondary;
    margin: 0 0 8px 0;
    @include text-ellipsis-2;
    line-height: 1.4;
    height: 2.8em;
  }

  &__prices {
    display: flex;
    align-items: baseline;
    gap: 6px;
    margin-bottom: 10px;
  }

  &__price {
    color: $danger;
    font-size: 20px;
    font-weight: 700;

    .symbol {
      font-size: 0.7em;
    }
  }

  &__original {
    color: $text-secondary;
    text-decoration: line-through;
    font-size: 12px;
  }

  &__discount {
    background: $danger + '1A';
    color: $danger;
    padding: 2px 6px;
    border-radius: 4px;
    font-size: 10px;
    font-weight: 600;
  }

  &__footer {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-top: auto;
  }

  &__stats {
    display: flex;
    align-items: center;
    gap: 4px;
    font-size: 11px;
    color: $text-secondary;

    .divider {
      margin: 0 4px;
      color: $border;
    }
  }
}

.reserve-btn {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;
  font-weight: 600;
  padding: 6px 12px !important;
  border-radius: 16px !important;
  height: 30px !important;
  min-width: 90px !important;

  &--reserved {
    background: $primary-light !important;
    color: $primary !important;
    border: none !important;
  }
}

.empty-state {
  padding: 40px 0;
}
</style>
