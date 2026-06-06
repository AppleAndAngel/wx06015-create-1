<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useGiftCardStore } from '@/stores/giftCard'
import { showLoadingToast, closeToast, showToast } from 'vant'
import dayjs from 'dayjs'

const router = useRouter()
const giftCardStore = useGiftCardStore()

const activeTab = ref<'sent' | 'received'>('sent')
const loading = ref(false)

const tabs = [
  { name: 'sent', title: '我送出的' },
  { name: 'received', title: '我收到的' },
]

const listData = computed(() => {
  return activeTab.value === 'sent'
    ? giftCardStore.mySentCards
    : giftCardStore.myReceivedCards
})

const statusText: Record<string, string> = {
  pending: '待支付',
  paid: '待发送',
  sent: '已发送',
  received: '已领取',
  expired: '已过期',
}

const statusColor: Record<string, string> = {
  pending: '#999',
  paid: '#FF8C42',
  sent: '#1E9A63',
  received: '#2DB87B',
  expired: '#ccc',
}

async function fetchData() {
  try {
    loading.value = true
    showLoadingToast({ message: '加载中...', forbidClick: true })

    if (activeTab.value === 'sent') {
      await giftCardStore.fetchMySentCards()
    } else {
      await giftCardStore.fetchMyReceivedCards()
    }

    closeToast()
  } catch (e) {
    closeToast()
    showToast({ message: '加载失败，请重试', type: 'fail' })
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  fetchData()
})

function handleTabChange(tab: 'sent' | 'received') {
  activeTab.value = tab
  fetchData()
}

function goToDetail(id: number) {
  router.push(`/gift-card/${id}`)
}

function formatDate(dateStr: string): string {
  return dayjs(dateStr).format('YYYY-MM-DD HH:mm')
}
</script>

<template>
  <div class="my-cards-page">
    <van-nav-bar
      title="我的礼品卡"
      left-arrow
      @click-left="router.back()"
    />

    <van-tabs v-model:active="activeTab" @change="handleTabChange" class="tabs">
      <van-tab
        v-for="tab in tabs"
        :key="tab.name"
        :name="tab.name"
        :title="tab.title"
      />
    </van-tabs>

    <div class="page-content">
      <div v-if="loading" class="loading-container">
        <van-loading size="24px">加载中...</van-loading>
      </div>

      <template v-else>
        <div v-if="listData.length === 0" class="empty-state">
          <div class="empty-state__icon">🎁</div>
          <p class="empty-state__text">
            {{ activeTab === 'sent' ? '暂无送出的礼品卡' : '暂无收到的礼品卡' }}
          </p>
          <van-button
            type="primary"
            round
            class="empty-state__btn"
            @click="router.push('/gift-card')"
          >
            去购买礼品卡
          </van-button>
        </div>

        <div v-else class="card-list">
          <div
            v-for="item in listData"
            :key="item.id"
            class="card-item"
            @click="goToDetail(item.id)"
          >
            <div
              class="card-item__face"
              :style="{ background: item.template.bgGradient }"
            >
              <div class="card-item__value" :style="{ color: item.template.textColor }">
                <span class="value-symbol">¥</span>
                <span class="value-amount">{{ item.denomination.value }}</span>
              </div>
              <div class="card-item__name" :style="{ color: item.template.textColor }">
                {{ item.denomination.name }}
              </div>
              <div class="card-item__decor">🎁</div>
              <div
                class="card-item__status"
                :style="{ background: statusColor[item.status] }"
              >
                {{ statusText[item.status] }}
              </div>
            </div>
            <div class="card-item__info">
              <div class="card-item__recipient">
                <van-icon name="user-o" size="14" />
                <span>{{ activeTab === 'sent' ? '接收人：' : '发送人：' }}</span>
                <span class="recipient-name">
                  {{ activeTab === 'sent' ? item.recipient.name : (item.sender?.nickname || '未知') }}
                </span>
              </div>
              <div class="card-item__date">
                <van-icon name="clock-o" size="14" />
                <span>{{ formatDate(item.createdAt) }}</span>
              </div>
            </div>
          </div>
        </div>
      </template>
    </div>
  </div>
</template>

<style scoped lang="scss">
@use '@/assets/styles/variables' as *;

.my-cards-page {
  min-height: 100vh;
  background: $bg;
}

.tabs {
  background: $bg-card;
  position: sticky;
  top: 0;
  z-index: 10;

  :deep(.van-tabs__nav--line) {
    padding: 0;
  }

  :deep(.van-tab) {
    font-size: 15px;
    font-weight: 500;
  }

  :deep(.van-tab--active) {
    color: $primary;
    font-weight: 600;
  }

  :deep(.van-tabs__line) {
    background: $primary;
  }
}

.page-content {
  padding: 16px;
}

.loading-container {
  display: flex;
  justify-content: center;
  padding: 40px 0;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 60px 20px;

  &__icon {
    font-size: 80px;
    opacity: 0.5;
    margin-bottom: 16px;
  }

  &__text {
    font-size: 14px;
    color: $text-secondary;
    margin: 0 0 24px 0;
  }

  &__btn {
    width: 180px;
    height: 40px;
    background: linear-gradient(135deg, $primary 0%, $primary-dark 100%);
    border: none;
  }
}

.card-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.card-item {
  background: $bg-card;
  border-radius: $radius-md;
  overflow: hidden;
  box-shadow: $shadow;
  cursor: pointer;
  transition: transform 0.2s ease;

  &:active {
    transform: scale(0.99);
  }

  &__face {
    padding: 20px;
    position: relative;
    min-height: 120px;
    display: flex;
    flex-direction: column;
    justify-content: center;
    overflow: hidden;

    &::before {
      content: '';
      position: absolute;
      top: -30px;
      right: -30px;
      width: 100px;
      height: 100px;
      background: rgba(255, 255, 255, 0.1);
      border-radius: 50%;
    }

    &::after {
      content: '';
      position: absolute;
      bottom: -20px;
      right: 20px;
      width: 60px;
      height: 60px;
      background: rgba(255, 255, 255, 0.08);
      border-radius: 50%;
    }
  }

  &__value {
    display: flex;
    align-items: baseline;
    position: relative;
    z-index: 1;
    margin-bottom: 6px;
  }

  .value-symbol {
    font-size: 18px;
    font-weight: 600;
  }

  .value-amount {
    font-size: 40px;
    font-weight: 700;
    font-family: $font-display;
    line-height: 1;
  }

  &__name {
    font-size: 14px;
    opacity: 0.95;
    position: relative;
    z-index: 1;
  }

  &__decor {
    position: absolute;
    bottom: 12px;
    right: 16px;
    font-size: 32px;
    opacity: 0.3;
    z-index: 0;
  }

  &__status {
    position: absolute;
    top: 12px;
    right: 12px;
    padding: 4px 10px;
    border-radius: 12px;
    font-size: 11px;
    color: #fff;
    font-weight: 500;
    z-index: 2;
  }

  &__info {
    padding: 12px 16px;
  }

  &__recipient,
  &__date {
    display: flex;
    align-items: center;
    gap: 6px;
    font-size: 13px;
    color: $text-secondary;
    margin-bottom: 4px;

    &:last-child {
      margin-bottom: 0;
    }
  }

  .recipient-name {
    color: $text-primary;
    font-weight: 500;
  }
}
</style>
