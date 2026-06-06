<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'
import { useGroupBuyStore } from '@/stores/groupBuy'
import AppHeader from '@/components/AppHeader.vue'
import CountdownTimer from '@/components/CountdownTimer.vue'
import SpecPopup from '@/components/SpecPopup.vue'
import { showLoadingToast, closeToast, showToast, showSuccessToast } from 'vant'
import type { GroupBuyOrder } from '@/types'

const route = useRoute()
const router = useRouter()
const userStore = useUserStore()
const groupBuyStore = useGroupBuyStore()

const groupId = computed(() => Number(route.params.id))
const groupOrder = ref<GroupBuyOrder | null>(null)
const loading = ref(false)
const showSpec = ref(false)
const selectedSpecs = ref<Record<string, string>>({})
const selectedQuantity = ref(1)

const product = computed(() => groupOrder.value?.product)
const progress = computed(() => {
  if (!groupOrder.value) return 0
  return Math.round((groupOrder.value.currentCount / groupOrder.value.groupSize) * 100)
})
const remainingCount = computed(() => {
  if (!groupOrder.value) return 0
  return groupOrder.value.groupSize - groupOrder.value.currentCount
})
const isFull = computed(() => remainingCount.value <= 0)
const hasJoined = computed(() => {
  if (!groupOrder.value) return false
  return groupOrder.value.members.some(m => m.userId === 1004)
})
const isSuccess = computed(() => groupOrder.value?.status === 'success')

const specText = computed(() => {
  if (!product.value) return ''
  const values = Object.values(selectedSpecs.value)
  return values.length === product.value.specs.length ? values.join(' ') : ''
})

async function loadData() {
  loading.value = true
  showLoadingToast({ message: '加载中...', forbidClick: true })
  try {
    const data = await groupBuyStore.fetchGroupOrder(groupId.value)
    groupOrder.value = data || null
    console.log('[GroupOrderDetail] 加载拼团订单:', groupOrder.value?.groupNo)
  } catch (e) {
    console.error('[GroupOrderDetail] 加载失败', e)
    showToast('加载失败，请重试')
  } finally {
    loading.value = false
    closeToast()
  }
}

function openSpec() {
  showSpec.value = true
}

function onSpecConfirm(specs: Record<string, string>, qty: number) {
  selectedSpecs.value = specs
  selectedQuantity.value = qty
  showSpec.value = false
  handleJoinGroup()
}

async function handleJoinGroup() {
  if (!userStore.isLoggedIn) {
    router.push({ path: '/login', query: { redirect: `/group-detail/${groupId.value}` } })
    return
  }
  if (!groupOrder.value) return
  if (isFull.value || isSuccess.value) {
    showToast('拼团已完成')
    return
  }
  if (hasJoined.value) {
    showToast('您已参与此拼团')
    return
  }
  if (!specText.value) {
    openSpec()
    return
  }
  showLoadingToast({ message: '参团中...', forbidClick: true })
  try {
    const order = await groupBuyStore.joinGroupBuy(
      groupId.value,
      selectedSpecs.value,
      selectedQuantity.value
    )
    groupOrder.value = order
    closeToast()
    if (order.status === 'success') {
      showSuccessToast('恭喜！拼团成功！')
    } else {
      showSuccessToast('参团成功！')
    }
  } catch (e) {
    closeToast()
    showToast('参团失败，请重试')
    console.error('[GroupOrderDetail] 参团失败', e)
  }
}

function handleShare() {
  showToast('拼团链接已复制，快去邀请好友吧！')
}

function handleCreateNew() {
  if (!groupOrder.value) return
  router.push(`/group-buy/${groupBuyStore.products.find(p => p.productId === groupOrder.value!.productId)?.id || 1}`)
}

const goBack = () => router.back()

onMounted(() => {
  loadData()
})
</script>

<template>
  <div class="group-order-detail" v-if="groupOrder && product">
    <AppHeader title="拼团详情" :show-back="true" @click-left="goBack" />

    <div class="page-body">
      <div class="status-banner" :class="{ 'status-banner--success': isSuccess }">
        <div class="status-banner__content">
          <template v-if="isSuccess">
            <van-icon name="checked" size="24" color="#fff" />
            <span class="status-text">拼团成功</span>
          </template>
          <template v-else>
            <span class="status-text">还差 {{ remainingCount }} 人成团</span>
            <CountdownTimer :end-time="groupOrder.endTime" />
          </template>
        </div>
        <div class="progress-bar">
          <div class="progress-fill" :style="{ width: progress + '%' }"></div>
          <span class="progress-text">{{ groupOrder.currentCount }}/{{ groupOrder.groupSize }}人</span>
        </div>
      </div>

      <div class="product-card">
        <img :src="product.images[0]" :alt="product.name" class="product-card__img" />
        <div class="product-card__content">
          <h3 class="product-card__name">{{ product.name }}</h3>
          <div class="product-card__prices">
            <span class="group-price">¥{{ groupOrder.groupPrice.toFixed(2) }}</span>
            <span class="original-price">¥{{ product.originalPrice.toFixed(2) }}</span>
          </div>
          <p class="product-card__spec">
            已选: {{ Object.values(groupOrder.specValues).join(' ') }}
          </p>
        </div>
      </div>

      <div class="members-card">
        <div class="card-header">
          <h3 class="card-title">拼团成员</h3>
          <span class="card-desc">{{ groupOrder.currentCount }}人已参与</span>
        </div>
        <div class="members-list">
          <div
            v-for="member in groupOrder.members"
            :key="member.id"
            class="member-item"
          >
            <img :src="member.avatar" class="member-avatar" />
            <div class="member-info">
              <span class="member-name">{{ member.nickname }}</span>
              <span class="member-tag" v-if="member.isInitiator">团长</span>
            </div>
            <span class="member-time">
              {{ member.isInitiator ? '发起拼团' : '参与拼团' }}
            </span>
          </div>
          <div v-if="!isFull" class="member-item member-item--empty">
            <div class="member-avatar member-avatar--empty">
              <van-icon name="plus" size="20" color="#FF6B35" />
            </div>
            <span class="member-name">虚位以待</span>
            <span class="member-time">等待好友加入</span>
          </div>
        </div>
      </div>

      <div class="info-card">
        <div class="info-row">
          <span class="info-label">拼团编号</span>
          <span class="info-value">{{ groupOrder.groupNo }}</span>
        </div>
        <div class="info-row">
          <span class="info-label">发起时间</span>
          <span class="info-value">{{ new Date(groupOrder.createdAt).toLocaleString() }}</span>
        </div>
        <div class="info-row">
          <span class="info-label">购买数量</span>
          <span class="info-value">{{ groupOrder.quantity }}件</span>
        </div>
      </div>
    </div>

    <div class="bottom-bar">
      <div class="bottom-icons">
        <div class="bottom-icon" @click="handleShare">
          <van-icon name="share-o" size="22" />
          <span>邀请</span>
        </div>
      </div>
      <template v-if="isSuccess">
        <van-button class="action-btn action-btn--create" @click="handleCreateNew">
          再开一团
        </van-button>
      </template>
      <template v-else-if="hasJoined">
        <van-button class="action-btn action-btn--share" @click="handleShare">
          邀请好友
        </van-button>
      </template>
      <template v-else>
        <van-button class="action-btn action-btn--join" @click="handleJoinGroup" :disabled="isFull">
          {{ isFull ? '拼团已满' : `立即参团 · ¥${groupOrder.groupPrice.toFixed(2)}` }}
        </van-button>
      </template>
    </div>

    <SpecPopup
      :product="product"
      v-model:show="showSpec"
      @confirm="onSpecConfirm"
    />
  </div>
</template>

<style scoped lang="scss">
@use '@/assets/styles/variables' as *;

.group-order-detail {
  min-height: 100vh;
  background: $bg;
  padding-bottom: 60px;

  &__body {
    padding-top: 46px;
  }
}

.status-banner {
  background: linear-gradient(135deg, #FF6B35 0%, #FF8C42 100%);
  padding: 20px 16px 24px;
  color: #fff;

  &--success {
    background: linear-gradient(135deg, $primary 0%, $primary-dark 100%);
  }

  &__content {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 16px;
  }

  .status-text {
    font-size: 18px;
    font-weight: 600;
  }
}

.progress-bar {
  position: relative;
  height: 28px;
  background: rgba(255, 255, 255, 0.25);
  border-radius: 14px;
  overflow: hidden;

  .progress-fill {
    position: absolute;
    left: 0;
    top: 0;
    height: 100%;
    background: rgba(255, 255, 255, 0.5);
    border-radius: 14px;
    transition: width 0.3s ease;
  }

  .progress-text {
    position: relative;
    z-index: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    height: 100%;
    font-size: 13px;
    font-weight: 600;
  }
}

.product-card {
  display: flex;
  gap: 12px;
  background: $bg-card;
  margin: -10px 12px 0;
  border-radius: $radius-md;
  padding: 14px;
  box-shadow: $shadow;
  position: relative;
  z-index: 2;

  &__img {
    width: 100px;
    height: 100px;
    object-fit: cover;
    border-radius: $radius-sm;
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
    margin: 0;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  &__prices {
    display: flex;
    align-items: baseline;
    gap: 6px;
  }

  &__spec {
    font-size: 12px;
    color: $text-secondary;
    margin: 0;
  }
}

.group-price {
  color: #FF6B35;
  font-size: 20px;
  font-weight: 700;

  &::before {
    content: '¥';
    font-size: 0.7em;
  }
}

.original-price {
  color: $text-secondary;
  text-decoration: line-through;
  font-size: 12px;

  &::before {
    content: '¥';
  }
}

.members-card {
  background: $bg-card;
  margin: 10px 12px 0;
  border-radius: $radius-md;
  padding: 14px 16px;
  box-shadow: $shadow;
}

.card-header {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  margin-bottom: 12px;
}

.card-title {
  font-size: 16px;
  font-weight: 600;
  color: $text-primary;
  margin: 0;
}

.card-desc {
  font-size: 12px;
  color: $text-secondary;
}

.members-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.member-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 8px 0;

  &--empty {
    opacity: 0.6;
  }
}

.member-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  object-fit: cover;
  flex-shrink: 0;

  &--empty {
    display: flex;
    align-items: center;
    justify-content: center;
    background: #FFF0E8;
    border: 2px dashed #FFB088;
  }
}

.member-info {
  flex: 1;
  display: flex;
  align-items: center;
  gap: 8px;
}

.member-name {
  font-size: 14px;
  color: $text-primary;
  font-weight: 500;
}

.member-tag {
  background: #FF6B35;
  color: #fff;
  font-size: 10px;
  padding: 2px 6px;
  border-radius: 8px;
}

.member-time {
  font-size: 12px;
  color: $text-secondary;
  flex-shrink: 0;
}

.info-card {
  background: $bg-card;
  margin: 10px 12px;
  border-radius: $radius-md;
  padding: 8px 16px;
  box-shadow: $shadow;
}

.info-row {
  display: flex;
  justify-content: space-between;
  padding: 10px 0;
  border-bottom: 1px solid $border;

  &:last-child {
    border-bottom: none;
  }
}

.info-label {
  font-size: 14px;
  color: $text-secondary;
}

.info-value {
  font-size: 14px;
  color: $text-primary;
  font-weight: 500;
}

.bottom-bar {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  display: flex;
  align-items: center;
  background: $bg-card;
  padding: 6px 12px calc(6px + env(safe-area-inset-bottom));
  box-shadow: 0 -2px 10px rgba(0, 0, 0, 0.06);
  z-index: 99;
}

.bottom-icons {
  display: flex;
  gap: 16px;
  margin-right: 12px;
}

.bottom-icon {
  display: flex;
  flex-direction: column;
  align-items: center;
  font-size: 10px;
  color: $text-secondary;
}

.action-btn {
  flex: 1;
  height: 38px;
  border-radius: 20px;
  font-size: 14px;
  font-weight: 600;

  &--join {
    background: linear-gradient(135deg, #FF6B35, #FF8C42) !important;
    border: none !important;
    color: #fff !important;
  }

  &--share {
    background: $accent !important;
    border-color: $accent !important;
    color: #fff !important;
  }

  &--create {
    background: linear-gradient(135deg, #FF6B35, #FF8C42) !important;
    border: none !important;
    color: #fff !important;
  }
}
</style>
