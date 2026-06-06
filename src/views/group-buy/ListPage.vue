<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'
import { useGroupBuyStore } from '@/stores/groupBuy'
import GroupBuyCard from '@/components/GroupBuyCard.vue'
import CountdownTimer from '@/components/CountdownTimer.vue'
import AppHeader from '@/components/AppHeader.vue'
import EmptyState from '@/components/EmptyState.vue'
import { showLoadingToast, closeToast, showToast } from 'vant'

const router = useRouter()
const userStore = useUserStore()
const groupBuyStore = useGroupBuyStore()

const loading = ref(false)
const refreshing = ref(false)
const activeTab = ref<'products' | 'active'>('products')

const products = computed(() => groupBuyStore.products)
const activeOrders = computed(() => groupBuyStore.activeOrders)

async function loadData() {
  loading.value = true
  showLoadingToast({ message: '加载中...', forbidClick: true })
  try {
    await Promise.all([
      groupBuyStore.fetchProducts(),
      groupBuyStore.fetchActiveOrders()
    ])
  } catch (e) {
    console.error('[GroupBuyList] 加载数据失败', e)
    showToast('加载失败，请重试')
  } finally {
    loading.value = false
    closeToast()
  }
}

function onRefresh() {
  refreshing.value = true
  loadData().finally(() => {
    refreshing.value = false
  })
}

function goToGroupDetail(groupId: number) {
  if (!userStore.isLoggedIn) {
    router.push({ path: '/login', query: { redirect: `/group-buy/${groupId}` } })
    return
  }
  router.push(`/group-detail/${groupId}`)
}

function goToMyGroups() {
  if (!userStore.isLoggedIn) {
    router.push({ path: '/login', query: { redirect: '/my-groups' } })
    return
  }
  router.push('/my-groups')
}

const goBack = () => router.back()

onMounted(() => {
  loadData()
})
</script>

<template>
  <div class="group-buy-page">
    <AppHeader title="拼团购" :show-back="true" @click-left="goBack">
      <template #right>
        <span class="header-right" @click="goToMyGroups">我的拼团</span>
      </template>
    </AppHeader>

    <div class="page-body">
      <van-pull-refresh v-model="refreshing" @refresh="onRefresh">
        <div class="banner-section animate-in">
          <div class="banner">
            <div class="banner__content">
              <h2 class="banner__title">双人拼团 享5折起</h2>
              <p class="banner__subtitle">邀请好友一起拼，新鲜好物更便宜</p>
            </div>
            <div class="banner__icon">
              <van-icon name="friends-o" size="48" color="#fff" />
            </div>
          </div>
        </div>

        <div class="tabs-section animate-in">
          <div class="tabs">
            <div
              :class="['tab-item', activeTab === 'products' && 'tab-item--active']"
              @click="activeTab = 'products'"
            >
              <span>拼团商品</span>
            </div>
            <div
              :class="['tab-item', activeTab === 'active' && 'tab-item--active']"
              @click="activeTab = 'active'"
            >
              <span>进行中 ({{ activeOrders.length }})</span>
            </div>
          </div>
        </div>

        <div v-if="activeTab === 'products'" class="content-section animate-in">
          <div class="section-header">
            <h3 class="section-title">热门拼团</h3>
            <span class="section-desc">精选好物 超值拼团</span>
          </div>
          <div v-if="products.length" class="product-grid">
            <GroupBuyCard
              v-for="item in products"
              :key="item.id"
              :group-product="item"
            />
          </div>
          <EmptyState v-else description="暂无拼团商品" />
        </div>

        <div v-if="activeTab === 'active'" class="content-section animate-in">
          <div class="section-header">
            <h3 class="section-title">正在进行的拼团</h3>
            <span class="section-desc">差一人即可成团</span>
          </div>
          <div v-if="activeOrders.length" class="active-list">
            <div
              v-for="order in activeOrders"
              :key="order.id"
              class="active-card"
              @click="goToGroupDetail(order.id)"
            >
              <img
                :src="order.product.images[0]"
                :alt="order.product.name"
                class="active-card__img"
              />
              <div class="active-card__content">
                <h4 class="active-card__name">{{ order.product.name }}</h4>
                <div class="active-card__members">
                  <img
                    v-for="member in order.members.slice(0, 3)"
                    :key="member.id"
                    :src="member.avatar"
                    class="member-avatar"
                  />
                  <span v-if="order.members.length > 3" class="member-more">
                    +{{ order.members.length - 3 }}
                  </span>
                  <span class="member-text">
                    {{ order.initiatorNickname }} 等{{ order.currentCount }}人已拼
                  </span>
                </div>
                <div class="active-card__bottom">
                  <div class="active-card__price">
                    <span class="price">¥{{ order.groupPrice.toFixed(1) }}</span>
                    <span class="original">¥{{ order.product.originalPrice.toFixed(1) }}</span>
                  </div>
                  <div class="active-card__countdown">
                    <span class="countdown-label">剩余</span>
                    <CountdownTimer :end-time="order.endTime" />
                  </div>
                </div>
                <div class="active-card__join-btn">
                  去参团
                </div>
              </div>
            </div>
          </div>
          <EmptyState v-else description="暂无进行中的拼团，去发起一个吧" />
        </div>
      </van-pull-refresh>
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

.group-buy-page {
  min-height: 100vh;
  background: $bg;
}

.page-body {
  padding-top: 46px;
}

.header-right {
  font-size: 14px;
  color: #fff;
}

.banner-section {
  padding: 16px 16px 0;
}

.banner {
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: linear-gradient(135deg, #FF6B35 0%, #FF8C42 100%);
  border-radius: $radius-lg;
  padding: 20px 24px;
  color: #fff;
  box-shadow: 0 4px 16px rgba(255, 107, 53, 0.25);

  &__title {
    font-size: 22px;
    font-weight: 700;
    margin: 0 0 6px 0;
    text-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
  }

  &__subtitle {
    font-size: 14px;
    opacity: 0.95;
    margin: 0;
  }

  &__icon {
    opacity: 0.9;
  }
}

.tabs-section {
  margin: 16px 16px 0;
  background: $bg-card;
  border-radius: $radius-md;
  box-shadow: $shadow;
  padding: 4px;
}

.tabs {
  display: flex;
}

.tab-item {
  flex: 1;
  text-align: center;
  padding: 10px 0;
  font-size: 15px;
  color: $text-secondary;
  border-radius: $radius-sm;
  transition: all 0.2s ease;

  &--active {
    background: linear-gradient(135deg, #FF6B35, #FF8C42);
    color: #fff;
    font-weight: 600;
  }
}

.content-section {
  margin: 16px;
}

.section-header {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  margin-bottom: 12px;
}

.section-title {
  font-size: 18px;
  font-weight: 700;
  color: $text-primary;
  margin: 0;
}

.section-desc {
  font-size: 12px;
  color: $text-secondary;
}

.product-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
}

.active-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.active-card {
  display: flex;
  background: $bg-card;
  border-radius: $radius-md;
  box-shadow: $shadow;
  overflow: hidden;
  cursor: pointer;
  transition: transform 0.2s ease;
  position: relative;

  &:active {
    transform: scale(0.98);
  }

  &__img {
    width: 100px;
    height: 100px;
    object-fit: cover;
    flex-shrink: 0;
  }

  &__content {
    flex: 1;
    padding: 10px 12px;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    min-width: 0;
  }

  &__name {
    font-size: 14px;
    font-weight: 500;
    color: $text-primary;
    margin: 0 0 6px 0;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  &__members {
    display: flex;
    align-items: center;
    gap: 6px;
    margin-bottom: 6px;
  }

  &__bottom {
    display: flex;
    align-items: center;
    justify-content: space-between;
  }

  &__price {
    display: flex;
    align-items: baseline;
    gap: 4px;

    .price {
      color: #FF6B35;
      font-size: 18px;
      font-weight: 700;

      &::before {
        content: '¥';
        font-size: 0.75em;
      }
    }

    .original {
      color: $text-secondary;
      text-decoration: line-through;
      font-size: 12px;

      &::before {
        content: '¥';
      }
    }
  }

  &__countdown {
    display: flex;
    align-items: center;
    gap: 4px;

    .countdown-label {
      font-size: 11px;
      color: $text-secondary;
    }
  }

  &__join-btn {
    position: absolute;
    right: 12px;
    top: 50%;
    transform: translateY(-50%);
    background: linear-gradient(135deg, #FF6B35, #FF8C42);
    color: #fff;
    font-size: 12px;
    font-weight: 600;
    padding: 6px 14px;
    border-radius: 16px;
  }
}

.member-avatar {
  width: 22px;
  height: 22px;
  border-radius: 50%;
  object-fit: cover;
  border: 2px solid #fff;
  margin-left: -6px;

  &:first-child {
    margin-left: 0;
  }
}

.member-more {
  width: 22px;
  height: 22px;
  border-radius: 50%;
  background: $bg-gray;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 10px;
  color: $text-secondary;
  margin-left: -6px;
  border: 2px solid #fff;
}

.member-text {
  font-size: 11px;
  color: $text-secondary;
  margin-left: 4px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
</style>
