<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { usePresaleStore } from '@/stores/presale'
import { showToast, showLoadingToast, closeToast, showConfirmDialog } from 'vant'
import dayjs from 'dayjs'
import type { Reservation } from '@/types'

const router = useRouter()
const presaleStore = usePresaleStore()

const refreshing = ref(false)
const loading = ref(false)

const formatSaleTime = (timeStr: string) => {
  const saleDate = dayjs(timeStr)
  const now = dayjs()
  
  if (saleDate.isBefore(now)) {
    return '已开售'
  }
  
  const diffHours = saleDate.diff(now, 'hour')
  if (diffHours < 24) {
    return `今天 ${saleDate.format('HH:mm')} 开售`
  } else if (diffHours < 48) {
    return `明天 ${saleDate.format('HH:mm')} 开售`
  }
  return saleDate.format('MM月DD日 HH:mm 开售')
}

const formatCreatedTime = (timeStr: string) => {
  return dayjs(timeStr).format('MM月DD日 HH:mm')
}

const isSaleStarted = (saleTime: string) => {
  return dayjs(saleTime).isBefore(dayjs())
}

const goToProduct = (presaleProductId: number) => {
  router.push(`/presale`)
}

const handleCancelReservation = async (reservation: Reservation) => {
  try {
    await showConfirmDialog({
      title: '取消预约',
      message: `确定要取消「${reservation.productName}」的开售提醒吗？`,
      confirmButtonText: '取消预约',
      cancelButtonText: '再想想',
    })
    
    showLoadingToast({ message: '取消中...', forbidClick: true })
    await presaleStore.cancelReservation(reservation.presaleProductId)
    closeToast()
    showToast({ message: '已取消预约', type: 'success' })
  } catch (e: any) {
    if (e.message !== 'cancel') {
      closeToast()
      showToast({ message: e.message || '取消失败，请重试', type: 'fail' })
    }
  }
}

const handleGoToBuy = (e: Event, reservation: Reservation) => {
  e.stopPropagation()
  showToast({ message: '商品已开售，正在跳转...', type: 'success' })
  setTimeout(() => {
    router.push('/presale')
  }, 800)
}

const onRefresh = () => {
  setTimeout(() => {
    loadData()
    refreshing.value = false
  }, 500)
}

const loadData = async () => {
  try {
    loading.value = true
    await presaleStore.fetchMyReservations()
  } catch (e) {
    console.error('加载我的预约失败', e)
    showToast({ message: '加载失败，请下拉刷新', type: 'fail' })
  } finally {
    loading.value = false
  }
}

const goBack = () => {
  router.back()
}

onMounted(() => {
  loadData()
})
</script>

<template>
  <div class="my-reservations-page">
    <div class="page-header">
      <div class="page-header__inner">
        <div class="page-header__back" @click="goBack">
          <van-icon name="arrow-left" size="22" color="#fff" />
        </div>
        <div class="page-header__title">我的预约</div>
        <div class="page-header__action"></div>
      </div>
    </div>

    <div class="page-body">
      <van-pull-refresh v-model="refreshing" @refresh="onRefresh">
        <div class="tips-section" v-if="presaleStore.reservations.length > 0">
          <div class="tips-card">
            <van-icon name="info-o" size="16" color="#1E9A63" />
            <span>开售前15分钟将通过消息提醒您，不错过任何好物</span>
          </div>
        </div>

        <div class="reservations-list" v-if="presaleStore.reservations.length > 0">
          <div
            v-for="reservation in presaleStore.reservations"
            :key="reservation.id"
            class="reservation-card"
            @click="goToProduct(reservation.presaleProductId)"
          >
            <div class="reservation-card__image-wrap">
              <img v-lazy="reservation.productImage" :alt="reservation.productName" class="reservation-card__image" />
              <div class="reservation-card__status" :class="{ 'reservation-card__status--onsale': isSaleStarted(reservation.saleTime) }">
                {{ isSaleStarted(reservation.saleTime) ? '已开售' : '待开售' }}
              </div>
            </div>
            <div class="reservation-card__content">
              <h4 class="reservation-card__name">{{ reservation.productName }}</h4>
              <div class="reservation-card__time">
                <van-icon :name="isSaleStarted(reservation.saleTime) ? 'fire-o' : 'clock-o'" size="14" :color="isSaleStarted(reservation.saleTime) ? '#EE4B4B' : '#FF8C42'" />
                <span :class="{ 'reservation-card__time--onsale': isSaleStarted(reservation.saleTime) }">
                  {{ formatSaleTime(reservation.saleTime) }}
                </span>
              </div>
              <div class="reservation-card__reserved-time">
                <span>预约时间：{{ formatCreatedTime(reservation.createdAt) }}</span>
              </div>
              <div class="reservation-card__footer">
                <van-button
                  v-if="isSaleStarted(reservation.saleTime)"
                  type="danger"
                  size="small"
                  class="buy-btn"
                  @click.stop="handleGoToBuy($event, reservation)"
                >
                  立即抢购
                </van-button>
                <van-button
                  v-else
                  type="default"
                  size="small"
                  class="cancel-btn"
                  @click.stop="handleCancelReservation(reservation)"
                >
                  取消预约
                </van-button>
              </div>
            </div>
          </div>
        </div>

        <div class="empty-section" v-else>
          <van-empty
            image="default"
            description="暂无预约"
          >
            <template #description>
              <p>还没有预约任何商品</p>
              <p class="empty-subtitle">去预售日历看看有什么好物吧</p>
            </template>
            <van-button type="primary" size="small" @click="router.push('/presale')">
              去看看
            </van-button>
          </van-empty>
        </div>
      </van-pull-refresh>
    </div>
  </div>
</template>

<style scoped lang="scss">
@use '@/assets/styles/variables' as *;
@use '@/assets/styles/mixins' as *;

.my-reservations-page {
  min-height: 100vh;
  background: $bg;
}

.page-header {
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
    height: 36px;
  }

  &__back {
    padding: 4px;
    cursor: pointer;
  }

  &__title {
    flex: 1;
    text-align: center;
    color: #fff;
    font-size: 18px;
    font-weight: 700;
    font-family: $font-display;
    margin-right: 30px;
  }

  &__action {
    width: 30px;
  }
}

.page-body {
  padding-top: calc(env(safe-area-inset-top, 0px) + 56px);
}

.tips-section {
  padding: 12px 16px;
}

.tips-card {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 14px;
  background: $primary-light;
  border-radius: $radius-md;
  font-size: 12px;
  color: $primary-dark;
  line-height: 1.5;
}

.reservations-list {
  padding: 0 16px 20px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.reservation-card {
  display: flex;
  background: $bg-card;
  border-radius: $radius-md;
  box-shadow: $shadow;
  overflow: hidden;
  transition: transform 0.2s ease;
  cursor: pointer;

  &:active {
    transform: scale(0.99);
  }

  &__image-wrap {
    position: relative;
    width: 110px;
    min-width: 110px;
    height: 110px;
    flex-shrink: 0;
  }

  &__image {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  &__status {
    position: absolute;
    top: 0;
    left: 0;
    padding: 4px 10px;
    background: rgba(0, 0, 0, 0.6);
    color: #fff;
    font-size: 11px;
    font-weight: 600;
    border-radius: 0 0 $radius-sm 0;

    &--onsale {
      background: linear-gradient(135deg, $danger, #FF3B3B);
    }
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
    margin: 0 0 8px 0;
    @include text-ellipsis-1;
  }

  &__time {
    display: flex;
    align-items: center;
    gap: 6px;
    font-size: 13px;
    color: $accent;
    margin-bottom: 6px;

    &--onsale {
      color: $danger;
      font-weight: 600;
    }
  }

  &__reserved-time {
    font-size: 11px;
    color: $text-secondary;
    margin-bottom: 10px;
  }

  &__footer {
    margin-top: auto;
    display: flex;
    justify-content: flex-end;
  }
}

.buy-btn {
  font-size: 12px;
  font-weight: 600;
  padding: 6px 16px !important;
  border-radius: 16px !important;
  height: 30px !important;
}

.cancel-btn {
  font-size: 12px;
  padding: 6px 16px !important;
  border-radius: 16px !important;
  height: 30px !important;
  color: $text-secondary !important;
  border-color: $border !important;
}

.empty-section {
  padding: 60px 20px;
}

.empty-subtitle {
  font-size: 12px;
  color: $text-secondary;
  margin-top: 4px;
}
</style>
