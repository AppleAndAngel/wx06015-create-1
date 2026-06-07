<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { List, Cell, PullRefresh, Icon, Tag, Button, showLoadingToast, closeToast } from 'vant'
import AppHeader from '@/components/AppHeader.vue'
import { usePickupStore } from '@/stores/pickup'
import type { PickupStore } from '@/types'

const router = useRouter()
const route = useRoute()
const pickupStore = usePickupStore()

const loading = ref(false)
const finished = ref(false)
const selectMode = ref(Boolean(route.query.select))

const sortedStores = computed(() => {
  return [...pickupStore.stores].sort((a, b) => a.distanceValue - b.distanceValue)
})

async function loadStores() {
  loading.value = true
  try {
    await pickupStore.fetchNearbyStores()
  } finally {
    loading.value = false
    finished.value = true
  }
}

function onRefresh() {
  finished.value = false
  loadStores()
}

function onSelectStore(store: PickupStore) {
  if (selectMode.value) {
    pickupStore.selectStore(store)
    router.push({ path: '/pickup/time-slot', query: { select: '1' } })
  } else {
    router.push(`/pickup/store/${store.id}`)
  }
}

function onConfirm(store: PickupStore) {
  pickupStore.selectStore(store)
  router.push({ path: '/pickup/time-slot', query: { select: '1' } })
}

function getTagColor(tag: string): string {
  const colorMap: Record<string, string> = {
    '24小时营业': '#FF8C42',
    '支持冷藏': '#1989FA',
    '支持冷冻': '#722ED1',
    '停车方便': '#2DB87B',
    '免排队': '#FF6B6B',
    '新开业': '#FFB946',
    '学生优惠': '#722ED1',
  }
  return colorMap[tag] || '#999'
}

onMounted(() => {
  loadStores()
})
</script>

<template>
  <div class="store-list-page">
    <AppHeader :title="selectMode ? '选择自提点' : '附近门店'" show-back @click-left="router.back()" />

    <div class="store-list-page__content">
      <van-pull-refresh v-model="loading" @refresh="onRefresh">
        <div class="location-tip">
          <van-icon name="location-o" size="14" color="#2DB87B" />
          <span>已按当前位置排序</span>
        </div>

        <div
          v-for="store in sortedStores"
          :key="store.id"
          class="store-card"
          @click="onSelectStore(store)"
        >
          <div class="store-card__header">
            <div class="store-card__name">{{ store.name }}</div>
            <div class="store-card__distance">{{ store.distance }}</div>
          </div>

          <div class="store-card__address">
            <van-icon name="location-o" size="14" color="#999" />
            <span>{{ store.address }}</span>
          </div>

          <div class="store-card__info">
            <div class="store-card__hours">
              <van-icon name="clock-o" size="14" color="#999" />
              <span>{{ store.businessHours }}</span>
            </div>
            <div class="store-card__phone">
              <van-icon name="phone-o" size="14" color="#999" />
              <span>{{ store.phone }}</span>
            </div>
          </div>

          <div class="store-card__tags" v-if="store.tags.length">
            <van-tag
              v-for="tag in store.tags"
              :key="tag"
              type="primary"
              plain
              round
              :color="getTagColor(tag)"
              class="store-card__tag"
            >
              {{ tag }}
            </van-tag>
          </div>

          <van-button
            v-if="selectMode"
            type="primary"
            size="small"
            class="store-card__btn"
            @click.stop="onConfirm(store)"
          >
            选时段
          </van-button>
        </div>

        <van-empty v-if="!loading && sortedStores.length === 0" description="暂无附近门店" />
      </van-pull-refresh>
    </div>
  </div>
</template>

<style scoped lang="scss">
@use '@/assets/styles/variables' as *;

.store-list-page {
  min-height: 100vh;
  background: $bg;

  &__content {
    padding-top: 46px;
    padding-bottom: 20px;
  }
}

.location-tip {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 10px 16px;
  font-size: 12px;
  color: $text-secondary;
  background: $primary-light;
}

.store-card {
  background: $bg-card;
  margin: 10px 16px;
  padding: 16px;
  border-radius: $radius-lg;
  box-shadow: $shadow;
  position: relative;

  &__header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 8px;
  }

  &__name {
    font-size: 16px;
    font-weight: 600;
    color: $text-primary;
    flex: 1;
    margin-right: 10px;
  }

  &__distance {
    font-size: 14px;
    font-weight: 600;
    color: $primary;
    flex-shrink: 0;
  }

  &__address {
    display: flex;
    align-items: flex-start;
    gap: 6px;
    font-size: 13px;
    color: $text-secondary;
    line-height: 1.5;
    margin-bottom: 10px;

    span {
      flex: 1;
    }
  }

  &__info {
    display: flex;
    gap: 20px;
    margin-bottom: 12px;
  }

  &__hours,
  &__phone {
    display: flex;
    align-items: center;
    gap: 4px;
    font-size: 12px;
    color: $text-secondary;
  }

  &__tags {
    display: flex;
    flex-wrap: wrap;
    gap: 6px;
  }

  &__tag {
    margin-right: 0 !important;
    font-size: 11px;
  }

  &__btn {
    position: absolute;
    right: 16px;
    bottom: 16px;
    border-radius: 16px;
    padding: 0 16px;
    height: 32px;
    font-size: 13px;
  }
}
</style>
