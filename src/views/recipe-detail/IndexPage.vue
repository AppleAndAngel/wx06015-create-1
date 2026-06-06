<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useSeasonalRecipeStore } from '@/stores/seasonalRecipe'
import { useUserStore } from '@/stores/user'
import type { Recipe, RecipeIngredient, Product } from '@/types'
import { showToast, showLoadingToast, closeToast, showConfirmDialog } from 'vant'

const route = useRoute()
const router = useRouter()
const store = useSeasonalRecipeStore()
const userStore = useUserStore()

const loading = ref(true)
const recipe = ref<Recipe | null>(null)
const activeTab = ref<'ingredients' | 'steps'>('ingredients')
const showLoginTip = ref(false)

const ingredientsWithProduct = computed(() => {
  return recipe.value?.ingredients.filter((ing) => ing.product) || []
})

const ingredientsWithoutProduct = computed(() => {
  return recipe.value?.ingredients.filter((ing) => !ing.product) || []
})

const totalIngredientCount = computed(() => {
  return ingredientsWithProduct.value.length
})

async function handleLoad() {
  loading.value = true
  try {
    const id = Number(route.params.id)
    const data = await store.loadRecipeDetail(id)
    recipe.value = data || null
    if (!recipe.value) {
      showToast({ message: '食谱不存在', type: 'fail' })
    }
  } catch (e) {
    console.error('加载食谱详情失败', e)
    showToast({ message: '加载失败，请重试', type: 'fail' })
  } finally {
    loading.value = false
  }
}

function goBack() {
  router.back()
}

function goToProductDetail(id: number) {
  router.push(`/product/${id}`)
}

function goToCart() {
  router.push('/cart')
}

async function handleAddAllToCart() {
  if (!recipe.value) return

  if (!userStore.isLoggedIn) {
    showLoginTip.value = true
    return
  }

  try {
    await store.addAllIngredientsToCart(recipe.value)
  } catch (e) {
    console.error('一键加入购物车失败', e)
  }
}

async function handleAddSingleToCart(e: Event, product: Product) {
  e.stopPropagation()
  if (!userStore.isLoggedIn) {
    showLoginTip.value = true
    return
  }
  try {
    await store.addSingleIngredientToCart(product)
  } catch (e) {
    console.error('加入购物车失败', e)
  }
}

function handleLogin() {
  showLoginTip.value = false
  router.push({ path: '/login', query: { redirect: `/recipe/${route.params.id}` } })
}

function getDifficultyText(diff: string) {
  const map: Record<string, string> = { easy: '简单', medium: '中等', hard: '困难' }
  return map[diff] || diff
}

function getDifficultyColor(diff: string) {
  const map: Record<string, string> = { easy: '#66BB6A', medium: '#FFA726', hard: '#EE4B4B' }
  return map[diff] || '#888'
}

function getSeasonName(season: string) {
  const map: Record<string, string> = { spring: '春季', summer: '夏季', autumn: '秋季', winter: '冬季' }
  return map[season] || season
}

onMounted(() => {
  handleLoad()
})
</script>

<template>
  <div class="recipe-detail-page" v-if="recipe">
    <div class="header-section">
      <div class="cover-wrapper">
        <img :src="recipe.coverImage" :alt="recipe.name" class="cover-image" />
        <div class="cover-overlay"></div>
        <div class="header-actions">
          <div class="action-btn" @click="goBack">
            <van-icon name="arrow-left" size="18" color="#fff" />
          </div>
          <div class="action-btn" @click="goToCart">
            <van-icon name="shopping-cart-o" size="18" color="#fff" />
          </div>
        </div>
        <div class="cover-info">
          <div class="cover-tags">
            <span class="cover-tag season-tag">{{ getSeasonName(recipe.season) }}</span>
            <span class="cover-tag term-tag">{{ recipe.solarTerm }}</span>
            <span
              class="cover-tag diff-tag"
              :style="{ backgroundColor: getDifficultyColor(recipe.difficulty) }"
            >
              {{ getDifficultyText(recipe.difficulty) }}
            </span>
          </div>
          <h1 class="cover-title">{{ recipe.name }}</h1>
          <p class="cover-subtitle">{{ recipe.subtitle }}</p>
        </div>
      </div>
    </div>

    <div class="content">
      <div class="meta-card">
        <div class="meta-item">
          <div class="meta-icon">⏱️</div>
          <div class="meta-text">
            <div class="meta-label">烹饪时间</div>
            <div class="meta-value">{{ recipe.cookTime }}</div>
          </div>
        </div>
        <div class="meta-divider"></div>
        <div class="meta-item">
          <div class="meta-icon">👥</div>
          <div class="meta-text">
            <div class="meta-label">份量</div>
            <div class="meta-value">{{ recipe.servings }}人份</div>
          </div>
        </div>
        <div class="meta-divider"></div>
        <div class="meta-item">
          <div class="meta-icon">🔥</div>
          <div class="meta-text">
            <div class="meta-label">热量</div>
            <div class="meta-value">{{ recipe.calories }}卡</div>
          </div>
        </div>
        <div class="meta-divider"></div>
        <div class="meta-item">
          <div class="meta-icon">⭐</div>
          <div class="meta-text">
            <div class="meta-label">评分</div>
            <div class="meta-value">{{ recipe.rating.toFixed(1) }}</div>
          </div>
        </div>
      </div>

      <div class="section">
        <h2 class="section-title">养生功效</h2>
        <div class="health-benefits">
          <span v-for="benefit in recipe.healthBenefits" :key="benefit" class="benefit-tag">
            {{ benefit }}
          </span>
        </div>
      </div>

      <div class="section">
        <h2 class="section-title">菜品介绍</h2>
        <p class="description">{{ recipe.description }}</p>
      </div>

      <div class="tab-section">
        <div class="tab-header">
          <div
            class="tab-item"
            :class="{ active: activeTab === 'ingredients' }"
            @click="activeTab = 'ingredients'"
          >
            食材清单
            <span class="tab-badge" v-if="totalIngredientCount > 0">{{ totalIngredientCount }}</span>
          </div>
          <div
            class="tab-item"
            :class="{ active: activeTab === 'steps' }"
            @click="activeTab = 'steps'"
          >
            烹饪步骤
            <span class="tab-badge">{{ recipe.steps.length }}</span>
          </div>
        </div>

        <div v-show="activeTab === 'ingredients'" class="tab-content">
          <div
            v-for="ingredient in ingredientsWithProduct"
            :key="ingredient.id"
            class="ingredient-item"
            @click="goToProductDetail(ingredient.productId)"
          >
            <img :src="ingredient.product?.images[0]" :alt="ingredient.name" class="ingredient-image" />
            <div class="ingredient-info">
              <div class="ingredient-name">{{ ingredient.name }}</div>
              <div class="ingredient-quantity">{{ ingredient.quantity }}</div>
              <div class="ingredient-price">
                <span class="price-symbol">¥</span>
                <span class="price-value">{{ ingredient.product?.price.toFixed(2) }}</span>
                <span class="price-original" v-if="ingredient.product?.originalPrice">
                  ¥{{ ingredient.product.originalPrice.toFixed(2) }}
                </span>
              </div>
            </div>
            <div class="ingredient-action" @click.stop="handleAddSingleToCart($event, ingredient.product!)">
              <van-icon name="plus" size="16" color="#fff" />
            </div>
          </div>

          <div v-if="ingredientsWithoutProduct.length > 0" class="other-ingredients">
            <h3 class="other-title">其他调料</h3>
            <div class="other-list">
              <span
                v-for="ingredient in ingredientsWithoutProduct"
                :key="ingredient.id"
                class="other-tag"
              >
                {{ ingredient.name }} {{ ingredient.quantity }}
              </span>
            </div>
          </div>
        </div>

        <div v-show="activeTab === 'steps'" class="tab-content">
          <div v-for="step in recipe.steps" :key="step.order" class="step-item">
            <div class="step-number">{{ step.order }}</div>
            <div class="step-content">
              <p class="step-description">{{ step.description }}</p>
              <img v-if="step.image" :src="step.image" alt="" class="step-image" />
            </div>
          </div>
        </div>
      </div>

      <div class="section" v-if="recipe.tips.length > 0">
        <h2 class="section-title">烹饪小贴士</h2>
        <div class="tips-list">
          <div v-for="(tip, index) in recipe.tips" :key="index" class="tip-item">
            <van-icon name="info-o" size="14" color="#FFB800" />
            <span>{{ tip }}</span>
          </div>
        </div>
      </div>
    </div>

    <div class="bottom-bar">
      <div class="bottom-info">
        <div class="bottom-count">
          共 <span class="count-num">{{ totalIngredientCount }}</span> 种食材
        </div>
        <div class="bottom-desc" v-if="totalIngredientCount > 0">
          可一键加入购物车
        </div>
      </div>
      <van-button
        type="primary"
        class="buy-all-btn"
        :disabled="totalIngredientCount === 0"
        @click="handleAddAllToCart"
      >
        <van-icon name="shopping-cart-o" size="16" />
        <span>一键买齐</span>
      </van-button>
    </div>

    <van-popup
      v-model:show="showLoginTip"
      round
      position="bottom"
      :style="{ padding: '24px 20px' }"
    >
      <div class="login-popup">
        <div class="popup-icon">🔒</div>
        <h3 class="popup-title">登录后享受更多服务</h3>
        <p class="popup-desc">登录后可将食材一键加入购物车，快速完成购买</p>
        <div class="popup-actions">
          <van-button class="cancel-btn" @click="showLoginTip = false">
            稍后再说
          </van-button>
          <van-button type="primary" class="login-btn" @click="handleLogin">
            立即登录
          </van-button>
        </div>
      </div>
    </van-popup>

    <div class="skeleton" v-if="loading">
      <van-skeleton title :row="5" />
    </div>
  </div>
</template>

<style scoped lang="scss">
@use '@/assets/styles/variables' as *;

.recipe-detail-page {
  min-height: 100vh;
  background: $bg;
  padding-bottom: 100px;
}

.header-section {
  position: relative;
}

.cover-wrapper {
  position: relative;
  height: 320px;
  overflow: hidden;
}

.cover-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

.cover-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(180deg, rgba(0, 0, 0, 0.3) 0%, rgba(0, 0, 0, 0.7) 100%);
}

.header-actions {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  z-index: 10;
  padding: 16px;
  padding-top: calc(env(safe-area-inset-top, 0px) + 16px);
  display: flex;
  justify-content: space-between;
}

.action-btn {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: rgba(0, 0, 0, 0.3);
  display: flex;
  align-items: center;
  justify-content: center;
  backdrop-filter: blur(10px);
}

.cover-info {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  z-index: 5;
  padding: 20px 16px;
  color: #fff;
}

.cover-tags {
  display: flex;
  gap: 6px;
  margin-bottom: 10px;
}

.cover-tag {
  font-size: 10px;
  padding: 3px 8px;
  border-radius: 4px;
  font-weight: 500;

  &.season-tag {
    background: rgba(255, 255, 255, 0.2);
  }

  &.term-tag {
    background: rgba(45, 184, 123, 0.8);
  }
}

.cover-title {
  font-size: 26px;
  font-weight: 700;
  margin: 0 0 6px 0;
  font-family: $font-display;
  text-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
}

.cover-subtitle {
  font-size: 13px;
  margin: 0;
  opacity: 0.9;
}

.content {
  padding: 0 16px;
  margin-top: -20px;
  position: relative;
  z-index: 10;
}

.meta-card {
  display: flex;
  align-items: center;
  background: $bg-card;
  border-radius: $radius-lg;
  padding: 16px 8px;
  box-shadow: $shadow-lg;
  margin-bottom: 20px;
}

.meta-item {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
}

.meta-icon {
  font-size: 20px;
}

.meta-text {
  text-align: center;
}

.meta-label {
  font-size: 10px;
  color: $text-secondary;
}

.meta-value {
  font-size: 14px;
  font-weight: 600;
  color: $text-primary;
}

.meta-divider {
  width: 1px;
  height: 32px;
  background: $border;
}

.section {
  margin-bottom: 24px;
}

.section-title {
  font-size: 18px;
  font-weight: 700;
  color: $text-primary;
  margin: 0 0 12px 0;
  font-family: $font-display;
}

.health-benefits {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.benefit-tag {
  font-size: 12px;
  padding: 6px 12px;
  background: linear-gradient(135deg, $primary-light, #E8F8F0);
  color: $primary-dark;
  border-radius: 16px;
  font-weight: 500;
}

.description {
  font-size: 14px;
  color: $text-secondary;
  line-height: 1.8;
  margin: 0;
}

.tab-section {
  margin-bottom: 24px;
}

.tab-header {
  display: flex;
  background: $bg-card;
  border-radius: $radius-md;
  padding: 4px;
  margin-bottom: 16px;
  box-shadow: $shadow;
}

.tab-item {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  padding: 10px 0;
  font-size: 14px;
  font-weight: 500;
  color: $text-secondary;
  border-radius: $radius-sm;
  cursor: pointer;
  transition: all 0.3s ease;

  &.active {
    background: $primary;
    color: #fff;
    font-weight: 600;
  }
}

.tab-badge {
  font-size: 10px;
  padding: 1px 6px;
  background: rgba(255, 255, 255, 0.3);
  border-radius: 8px;

  .tab-item:not(.active) & {
    background: $bg-gray;
    color: $text-secondary;
  }
}

.tab-content {
  background: $bg-card;
  border-radius: $radius-md;
  padding: 4px;
  box-shadow: $shadow;
}

.ingredient-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  border-radius: $radius-sm;
  cursor: pointer;
  transition: background 0.2s ease;

  &:active {
    background: $bg-gray;
  }

  &:not(:last-child) {
    border-bottom: 1px solid $border;
  }
}

.ingredient-image {
  width: 60px;
  height: 60px;
  border-radius: $radius-sm;
  object-fit: cover;
  flex-shrink: 0;
}

.ingredient-info {
  flex: 1;
  min-width: 0;
}

.ingredient-name {
  font-size: 14px;
  font-weight: 600;
  color: $text-primary;
  margin-bottom: 2px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.ingredient-quantity {
  font-size: 12px;
  color: $text-secondary;
  margin-bottom: 4px;
}

.ingredient-price {
  display: flex;
  align-items: baseline;
  gap: 4px;
}

.price-symbol {
  font-size: 12px;
  color: $danger;
}

.price-value {
  font-size: 16px;
  font-weight: 700;
  color: $danger;
}

.price-original {
  font-size: 11px;
  color: $text-disabled;
  text-decoration: line-through;
}

.ingredient-action {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: linear-gradient(135deg, $primary, $primary-dark);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  box-shadow: 0 2px 8px rgba(45, 184, 123, 0.4);
  transition: transform 0.2s ease;

  &:active {
    transform: scale(0.9);
  }
}

.other-ingredients {
  padding: 12px;
  border-top: 1px solid $border;
}

.other-title {
  font-size: 13px;
  font-weight: 600;
  color: $text-secondary;
  margin: 0 0 10px 0;
}

.other-list {
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
}

.other-tag {
  font-size: 11px;
  padding: 4px 10px;
  background: $bg-gray;
  color: $text-secondary;
  border-radius: 4px;
}

.step-item {
  display: flex;
  gap: 12px;
  padding: 16px 12px;

  &:not(:last-child) {
    border-bottom: 1px solid $border;
  }
}

.step-number {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background: linear-gradient(135deg, $primary, $primary-dark);
  color: #fff;
  font-size: 14px;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.step-content {
  flex: 1;
}

.step-description {
  font-size: 14px;
  color: $text-primary;
  line-height: 1.8;
  margin: 0 0 10px 0;
}

.step-image {
  width: 100%;
  border-radius: $radius-sm;
  display: block;
}

.tips-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.tip-item {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  padding: 12px;
  background: #FFF8E1;
  border-radius: $radius-sm;
  font-size: 13px;
  color: $text-secondary;
  line-height: 1.6;

  .van-icon {
    flex-shrink: 0;
    margin-top: 2px;
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
  padding: 12px 16px;
  padding-bottom: calc(env(safe-area-inset-bottom, 0px) + 12px);
  background: $bg-card;
  border-top: 1px solid $border;
  box-shadow: 0 -2px 12px rgba(0, 0, 0, 0.08);
  z-index: 100;
}

.bottom-info {
  flex: 1;
}

.bottom-count {
  font-size: 13px;
  color: $text-primary;
  margin-bottom: 2px;

  .count-num {
    color: $primary;
    font-weight: 700;
    font-size: 16px;
  }
}

.bottom-desc {
  font-size: 11px;
  color: $text-secondary;
}

.buy-all-btn {
  height: 44px !important;
  padding: 0 24px !important;
  border-radius: 22px !important;
  font-size: 15px !important;
  font-weight: 600 !important;
  background: linear-gradient(135deg, #E54D42, #FF6B5E) !important;
  border: none !important;
  display: flex !important;
  align-items: center !important;
  gap: 6px !important;

  &::before {
    display: none;
  }

  &:active {
    opacity: 0.9;
    transform: scale(0.98);
  }
}

.login-popup {
  text-align: center;
}

.popup-icon {
  font-size: 48px;
  margin-bottom: 12px;
}

.popup-title {
  font-size: 18px;
  font-weight: 700;
  color: $text-primary;
  margin: 0 0 8px 0;
  font-family: $font-display;
}

.popup-desc {
  font-size: 13px;
  color: $text-secondary;
  margin: 0 0 24px 0;
}

.popup-actions {
  display: flex;
  gap: 12px;
}

.cancel-btn {
  flex: 1;
  height: 44px !important;
  border-radius: 22px !important;
  background: $bg-gray !important;
  color: $text-secondary !important;
  border: none !important;

  &::before {
    display: none;
  }
}

.login-btn {
  flex: 2;
  height: 44px !important;
  border-radius: 22px !important;
  font-weight: 600 !important;
  background: linear-gradient(135deg, $primary, $primary-dark) !important;
  border: none !important;

  &::before {
    display: none;
  }
}

.skeleton {
  padding: 20px;
}
</style>
