<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useGroupMealStore } from '@/stores/groupMeal'
import { useUserStore } from '@/stores/user'
import AppHeader from '@/components/AppHeader.vue'
import EmptyState from '@/components/EmptyState.vue'
import { showLoadingToast, closeToast, showToast } from 'vant'
import type { GroupMealPackage } from '@/types'

const router = useRouter()
const groupMealStore = useGroupMealStore()
const userStore = useUserStore()

const loading = ref(false)
const refreshing = ref(false)
const showPeoplePicker = ref(false)
const peopleOptions = [5, 10, 15, 20, 25, 30, 40, 50, 60, 80, 100]
const customPeopleCount = ref('')
const showCustomInput = ref(false)

const filteredPackages = computed(() => groupMealStore.filteredPackages)
const peopleCount = computed(() => groupMealStore.peopleCount)

function formatDate(dateStr: string): string {
  const date = new Date(dateStr)
  const weekdays = ['周日', '周一', '周二', '周三', '周四', '周五', '周六']
  return `${date.getMonth() + 1}月${date.getDate()}日 ${weekdays[date.getDay()]}`
}

async function loadData() {
  loading.value = true
  showLoadingToast({ message: '加载中...', forbidClick: true })
  try {
    await Promise.all([
      groupMealStore.fetchPackages(),
      groupMealStore.filterPackagesByPeople(peopleCount.value),
    ])
  } catch (e) {
    console.error('[GroupMealList] 加载数据失败', e)
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

function onSelectPeople(count: number) {
  groupMealStore.filterPackagesByPeople(count)
  showPeoplePicker.value = false
  showCustomInput.value = false
}

function onCustomPeopleConfirm() {
  const count = parseInt(customPeopleCount.value)
  if (count < 5 || count > 200) {
    showToast('人数需在 5-200 人之间')
    return
  }
  groupMealStore.filterPackagesByPeople(count)
  showPeoplePicker.value = false
  showCustomInput.value = false
  customPeopleCount.value = ''
}

function onSelectPackage(pkg: GroupMealPackage) {
  groupMealStore.selectPackage(pkg)
  router.push('/group-meal/checkout')
}

function goToMyOrders() {
  if (!userStore.isLoggedIn) {
    router.push({ path: '/login', query: { redirect: '/my-group-meals' } })
    return
  }
  router.push('/my-group-meals')
}

const goBack = () => router.back()

onMounted(() => {
  loadData()
})
</script>

<template>
  <div class="group-meal-page">
    <AppHeader title="企业团餐" :show-back="true" @click-left="goBack">
      <template #right>
        <span class="header-right" @click="goToMyOrders">我的订单</span>
      </template>
    </AppHeader>

    <div class="page-body">
      <van-pull-refresh v-model="refreshing" @refresh="onRefresh">
        <div class="banner-section animate-in">
          <div class="banner">
            <div class="banner__content">
              <h2 class="banner__title">企业团餐 省心省力</h2>
              <p class="banner__subtitle">精选套餐，按需定制，准时送达</p>
            </div>
            <div class="banner__icon">
              <van-icon name="friends-o" size="48" color="#fff" />
            </div>
          </div>
        </div>

        <div class="people-select-section animate-in">
          <div class="section-header">
            <h3 class="section-title">用餐人数</h3>
            <span class="section-desc">选择人数，为您推荐合适套餐</span>
          </div>
          <div class="people-selector" @click="showPeoplePicker = true">
            <div class="people-selector__left">
              <van-icon name="user-o" size="18" color="#2DB87B" />
              <span class="people-selector__label">当前选择</span>
            </div>
            <div class="people-selector__right">
              <span class="people-selector__count">{{ peopleCount }} 人</span>
              <van-icon name="arrow" size="16" color="#999" />
            </div>
          </div>
          <div class="people-tags">
            <span
              v-for="count in peopleOptions.slice(0, 6)"
              :key="count"
              :class="['people-tag', peopleCount === count && 'people-tag--active']"
              @click.stop="onSelectPeople(count)"
            >
              {{ count }}人
            </span>
            <span
              :class="['people-tag', 'people-tag--custom', showCustomInput && 'people-tag--active']"
              @click.stop="showCustomInput = !showCustomInput; showPeoplePicker = false"
            >
              自定义
            </span>
          </div>
          <div v-if="showCustomInput" class="custom-people-input">
            <van-field
              v-model="customPeopleCount"
              type="number"
              placeholder="请输入人数（5-200人）"
              label="人数"
              :maxlength="3"
            />
            <van-button type="primary" size="small" @click="onCustomPeopleConfirm">确定</van-button>
          </div>
        </div>

        <div class="package-section animate-in">
          <div class="section-header">
            <h3 class="section-title">
              适合 <span class="highlight">{{ peopleCount }}人</span> 的套餐
            </h3>
            <span class="section-desc">共 {{ filteredPackages.length }} 个套餐</span>
          </div>
          <div v-if="filteredPackages.length" class="package-list">
            <div
              v-for="pkg in filteredPackages"
              :key="pkg.id"
              class="package-card"
              @click="onSelectPackage(pkg)"
            >
              <div class="package-card__header">
                <img :src="pkg.image" :alt="pkg.name" class="package-card__img" />
                <div class="package-card__tags">
                  <span v-for="tag in pkg.tags" :key="tag" class="package-tag">{{ tag }}</span>
                </div>
              </div>
              <div class="package-card__content">
                <h4 class="package-card__name">{{ pkg.name }}</h4>
                <p class="package-card__desc">{{ pkg.description }}</p>
                <div class="package-card__dishes">
                  <div class="dish-preview">
                    <img
                      v-for="dish in pkg.dishes.slice(0, 4)"
                      :key="dish.id"
                      :src="dish.image"
                      :alt="dish.name"
                      class="dish-img"
                    />
                    <span v-if="pkg.dishes.length > 4" class="dish-more">
                      +{{ pkg.dishes.length - 4 }}
                    </span>
                  </div>
                  <span class="dish-count">{{ pkg.dishes.length }}道菜品</span>
                </div>
                <div class="package-card__suitable">
                  <van-icon name="info-o" size="12" />
                  <span>适合 {{ pkg.suitableFor }}</span>
                </div>
                <div class="package-card__bottom">
                  <div class="package-card__price">
                    <span class="price-symbol">¥</span>
                    <span class="price-value">{{ pkg.pricePerPerson }}</span>
                    <span class="price-unit">/人</span>
                    <span class="price-original">¥{{ pkg.originalPricePerPerson }}</span>
                  </div>
                  <div class="package-card__select-btn">
                    选择套餐
                  </div>
                </div>
              </div>
            </div>
          </div>
          <EmptyState v-else description="当前人数暂无合适套餐，请调整人数后重试" />
        </div>
      </van-pull-refresh>
    </div>

    <van-popup
      v-model:show="showPeoplePicker"
      position="bottom"
      round
      :style="{ maxHeight: '60vh' }"
    >
      <div class="people-picker">
        <div class="people-picker__header">
          <span class="people-picker__title">选择用餐人数</span>
          <van-icon name="close" size="20" @click="showPeoplePicker = false" />
        </div>
        <div class="people-picker__grid">
          <div
            v-for="count in peopleOptions"
            :key="count"
            :class="['people-picker__item', peopleCount === count && 'people-picker__item--active']"
            @click="onSelectPeople(count)"
          >
            {{ count }}人
          </div>
        </div>
      </div>
    </van-popup>
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

.group-meal-page {
  min-height: 100vh;
  background: $bg;
}

.page-body {
  padding-top: 46px;
  padding-bottom: 20px;
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
  background: linear-gradient(135deg, #1E9A63 0%, #2DB87B 100%);
  border-radius: $radius-lg;
  padding: 20px 24px;
  color: #fff;
  box-shadow: 0 4px 16px rgba(45, 184, 123, 0.25);

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

.people-select-section {
  margin: 16px;
  background: $bg-card;
  border-radius: $radius-md;
  padding: 14px;
  box-shadow: $shadow;
}

.section-header {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  margin-bottom: 12px;
}

.section-title {
  font-size: 16px;
  font-weight: 700;
  color: $text-primary;
  margin: 0;

  .highlight {
    color: $primary;
  }
}

.section-desc {
  font-size: 12px;
  color: $text-secondary;
}

.people-selector {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px;
  background: $bg;
  border-radius: $radius-sm;
  margin-bottom: 12px;

  &__left {
    display: flex;
    align-items: center;
    gap: 8px;
  }

  &__label {
    font-size: 14px;
    color: $text-secondary;
  }

  &__right {
    display: flex;
    align-items: center;
    gap: 6px;
  }

  &__count {
    font-size: 16px;
    font-weight: 600;
    color: $primary;
  }
}

.people-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.people-tag {
  padding: 6px 14px;
  background: $bg;
  border-radius: 16px;
  font-size: 13px;
  color: $text-secondary;
  border: 1px solid transparent;
  transition: all 0.2s ease;

  &--active {
    background: $primary-light;
    color: $primary;
    border-color: $primary;
    font-weight: 500;
  }

  &--custom {
    color: $accent;
  }
}

.custom-people-input {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-top: 12px;
  padding-top: 12px;
  border-top: 1px solid $border;

  :deep(.van-field) {
    flex: 1;
  }
}

.package-section {
  margin: 0 16px;
}

.package-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.package-card {
  background: $bg-card;
  border-radius: $radius-md;
  overflow: hidden;
  box-shadow: $shadow;
  cursor: pointer;
  transition: transform 0.2s ease;

  &:active {
    transform: scale(0.98);
  }

  &__header {
    position: relative;
  }

  &__img {
    width: 100%;
    height: 160px;
    object-fit: cover;
    display: block;
  }

  &__tags {
    position: absolute;
    top: 10px;
    left: 10px;
    display: flex;
    gap: 6px;
  }

  &__content {
    padding: 12px 14px;
  }

  &__name {
    font-size: 16px;
    font-weight: 600;
    color: $text-primary;
    margin: 0 0 6px 0;
  }

  &__desc {
    font-size: 13px;
    color: $text-secondary;
    margin: 0 0 10px 0;
    line-height: 1.4;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }

  &__dishes {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 10px;
  }

  &__suitable {
    display: flex;
    align-items: center;
    gap: 4px;
    font-size: 12px;
    color: $text-secondary;
    margin-bottom: 12px;
  }

  &__bottom {
    display: flex;
    align-items: center;
    justify-content: space-between;
  }

  &__price {
    display: flex;
    align-items: baseline;
    gap: 2px;
  }

  &__select-btn {
    background: linear-gradient(135deg, $primary, $primary-dark);
    color: #fff;
    font-size: 13px;
    font-weight: 600;
    padding: 8px 16px;
    border-radius: 16px;
  }
}

.package-tag {
  padding: 3px 8px;
  background: rgba(255, 255, 255, 0.9);
  border-radius: 4px;
  font-size: 11px;
  font-weight: 500;
  color: $primary;
}

.dish-preview {
  display: flex;
  align-items: center;
}

.dish-img {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  object-fit: cover;
  border: 2px solid #fff;
  margin-left: -6px;

  &:first-child {
    margin-left: 0;
  }
}

.dish-more {
  width: 28px;
  height: 28px;
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

.dish-count {
  font-size: 12px;
  color: $text-secondary;
}

.price-symbol {
  font-size: 14px;
  font-weight: 600;
  color: $danger;
}

.price-value {
  font-size: 22px;
  font-weight: 700;
  color: $danger;
  font-family: $font-display;
}

.price-unit {
  font-size: 12px;
  color: $text-secondary;
  margin-right: 6px;
}

.price-original {
  font-size: 12px;
  color: $text-secondary;
  text-decoration: line-through;
}

.people-picker {
  padding: 16px;

  &__header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 16px;
  }

  &__title {
    font-size: 16px;
    font-weight: 600;
    color: $text-primary;
  }

  &__grid {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 10px;
  }

  &__item {
    padding: 14px;
    text-align: center;
    background: $bg;
    border-radius: $radius-sm;
    font-size: 14px;
    color: $text-primary;
    border: 1px solid transparent;
    transition: all 0.2s ease;

    &--active {
      background: $primary-light;
      color: $primary;
      border-color: $primary;
      font-weight: 500;
    }
  }
}
</style>
