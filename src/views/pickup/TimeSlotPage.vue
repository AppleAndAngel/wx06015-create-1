<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { Icon, Button, showToast } from 'vant'
import AppHeader from '@/components/AppHeader.vue'
import { usePickupStore } from '@/stores/pickup'
import type { PickupTimeSlot } from '@/types'
import dayjs from 'dayjs'

const router = useRouter()
const route = useRoute()
const pickupStore = usePickupStore()

const selectMode = ref(Boolean(route.query.select))
const loading = ref(false)

const selectedStore = computed(() => pickupStore.selectedStore)
const timeSlots = computed(() => pickupStore.timeSlots)
const selectedSlot = computed(() => pickupStore.selectedTimeSlot)

const groupedSlots = computed(() => {
  const groups: Record<string, PickupTimeSlot[]> = {}
  timeSlots.value.forEach((slot) => {
    const date = dayjs(slot.startTime).format('YYYY-MM-DD')
    const label = dayjs(slot.startTime).isSame(dayjs(), 'day')
      ? '今天'
      : dayjs(slot.startTime).add(1, 'day').isSame(dayjs(), 'day')
        ? '明天'
        : '后天'
    if (!groups[label]) {
      groups[label] = []
    }
    groups[label].push(slot)
  })
  return groups
})

async function loadTimeSlots() {
  if (!selectedStore.value) {
    showToast('请先选择自提点')
    router.back()
    return
  }
  loading.value = true
  try {
    await pickupStore.fetchTimeSlots(selectedStore.value.id)
  } finally {
    loading.value = false
  }
}

function onSelectSlot(slot: PickupTimeSlot) {
  if (!slot.available) {
    showToast('该时段已约满')
    return
  }
  pickupStore.selectTimeSlot(slot)
  if (selectMode.value) {
    router.replace('/checkout')
  }
}

function getSlotStatus(slot: PickupTimeSlot): string {
  if (!slot.available) return '已约满'
  const remaining = slot.capacity - slot.used
  if (remaining <= 5) return `仅剩${remaining}份`
  return '可预约'
}

function getSlotStatusColor(slot: PickupTimeSlot): string {
  if (!slot.available) return '#999'
  const remaining = slot.capacity - slot.used
  if (remaining <= 5) return '#FF6B6B'
  return '#2DB87B'
}

function onChangeStore() {
  router.push({ path: '/pickup/stores', query: { select: '1' } })
}

onMounted(() => {
  loadTimeSlots()
})
</script>

<template>
  <div class="time-slot-page">
    <AppHeader title="选择取货时段" show-back @click-left="router.back()" />

    <div class="time-slot-page__content">
      <div class="store-info-card" @click="onChangeStore">
        <div class="store-info-card__main">
          <div class="store-info-card__name">{{ selectedStore?.name }}</div>
          <div class="store-info-card__address">
            <van-icon name="location-o" size="14" color="#999" />
            <span>{{ selectedStore?.address }}</span>
          </div>
        </div>
        <van-icon name="arrow" color="#999" />
      </div>

      <div class="slot-section">
        <div class="slot-section__title">请选择取货时间</div>
        <div class="slot-tip">
          <van-icon name="info-o" size="14" color="#FFB946" />
          <span>请在预约时段内到店取货，超时订单将自动取消</span>
        </div>

        <div v-for="(slots, dateLabel) in groupedSlots" :key="dateLabel" class="slot-group">
          <div class="slot-group__title">{{ dateLabel }}</div>
          <div class="slot-grid">
            <div
              v-for="slot in slots"
              :key="slot.id"
              :class="[
                'slot-item',
                {
                  'slot-item--selected': selectedSlot?.id === slot.id,
                  'slot-item--disabled': !slot.available,
                },
              ]"
              @click="onSelectSlot(slot)"
            >
              <div class="slot-item__time">{{ slot.label.split(' ')[1] }}</div>
              <div
                class="slot-item__status"
                :style="{ color: getSlotStatusColor(slot) }"
              >
                {{ getSlotStatus(slot) }}
              </div>
            </div>
          </div>
        </div>
      </div>

      <van-empty v-if="!loading && timeSlots.length === 0" description="暂无可用时段" />
    </div>

    <div class="bottom-bar" v-if="selectedSlot && selectMode">
      <div class="bottom-bar__info">
        <div class="bottom-bar__label">已选时段</div>
        <div class="bottom-bar__value">{{ selectedSlot.label }}</div>
      </div>
      <van-button type="primary" class="bottom-bar__btn" @click="router.replace('/checkout')">
        确认选择
      </van-button>
    </div>
  </div>
</template>

<style scoped lang="scss">
@use '@/assets/styles/variables' as *;

.time-slot-page {
  min-height: 100vh;
  background: $bg;

  &__content {
    padding-top: 46px;
    padding-bottom: 80px;
  }
}

.store-info-card {
  display: flex;
  align-items: center;
  background: $bg-card;
  margin: 12px 16px;
  padding: 14px 16px;
  border-radius: $radius-lg;
  box-shadow: $shadow;

  &__main {
    flex: 1;
    min-width: 0;
  }

  &__name {
    font-size: 15px;
    font-weight: 600;
    color: $text-primary;
    margin-bottom: 4px;
  }

  &__address {
    display: flex;
    align-items: center;
    gap: 4px;
    font-size: 13px;
    color: $text-secondary;

    span {
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
  }
}

.slot-section {
  background: $bg-card;
  margin: 12px 16px;
  padding: 16px;
  border-radius: $radius-lg;
  box-shadow: $shadow;

  &__title {
    font-size: 16px;
    font-weight: 600;
    color: $text-primary;
    margin-bottom: 8px;
  }
}

.slot-tip {
  display: flex;
  align-items: flex-start;
  gap: 6px;
  padding: 10px 12px;
  background: #FFF8E6;
  border-radius: $radius-md;
  margin-bottom: 16px;
  font-size: 12px;
  color: $text-secondary;
  line-height: 1.5;
}

.slot-group {
  margin-bottom: 16px;

  &:last-child {
    margin-bottom: 0;
  }

  &__title {
    font-size: 14px;
    font-weight: 600;
    color: $text-primary;
    margin-bottom: 10px;
  }
}

.slot-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 10px;
}

.slot-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 12px 8px;
  border: 1px solid $border;
  border-radius: $radius-md;
  background: #fff;
  cursor: pointer;
  transition: all 0.2s;

  &--selected {
    border-color: $primary;
    background: $primary-light;

    .slot-item__time {
      color: $primary;
    }
  }

  &--disabled {
    opacity: 0.5;
    cursor: not-allowed;
    background: #f5f5f5;
  }

  &__time {
    font-size: 14px;
    font-weight: 500;
    color: $text-primary;
    margin-bottom: 4px;
  }

  &__status {
    font-size: 11px;
    font-weight: 500;
  }
}

.bottom-bar {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 16px;
  background: $bg-card;
  box-shadow: 0 -2px 8px rgba(0, 0, 0, 0.06);
  z-index: 100;

  &__info {
    flex: 1;
  }

  &__label {
    font-size: 12px;
    color: $text-secondary;
    margin-bottom: 2px;
  }

  &__value {
    font-size: 15px;
    font-weight: 600;
    color: $text-primary;
  }

  &__btn {
    flex-shrink: 0;
    border-radius: 20px;
    padding: 0 28px;
    height: 40px;
    font-size: 14px;
    font-weight: 600;
  }
}
</style>
