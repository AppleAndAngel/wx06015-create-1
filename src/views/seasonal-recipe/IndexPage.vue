<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useSeasonalRecipeStore } from '@/stores/seasonalRecipe'
import type { Recipe, SolarTerm } from '@/types'
import { showToast } from 'vant'

const router = useRouter()
const store = useSeasonalRecipeStore()

const seasons = [
  { key: 'spring', name: '春', color: '#66BB6A', icon: '🌸' },
  { key: 'summer', name: '夏', color: '#FF7043', icon: '☀️' },
  { key: 'autumn', name: '秋', color: '#FFA726', icon: '🍂' },
  { key: 'winter', name: '冬', color: '#42A5F5', icon: '❄️' },
] as const

type SeasonKey = typeof seasons[number]['key']

const activeSeason = ref<SeasonKey>('spring')
const loading = ref(true)

const filteredTerms = computed(() => {
  return store.getTermBySeason(activeSeason.value)
})

const filteredRecipes = computed(() => {
  return store.getSeasonRecipes(activeSeason.value)
})

const currentTermRecipes = computed(() => {
  return store.currentTermRecipes
})

async function handleLoad() {
  loading.value = true
  try {
    await store.loadData()
    if (store.currentSolarTerm) {
      activeSeason.value = store.currentSolarTerm.season
    }
  } catch (e) {
    console.error('加载节气食谱数据失败', e)
    showToast({ message: '加载失败，请重试', type: 'fail' })
  } finally {
    loading.value = false
  }
}

function handleSelectTerm(term: SolarTerm) {
  store.selectSolarTerm(term.name)
}

function goToRecipeDetail(id: number) {
  router.push(`/recipe/${id}`)
}

function goToHome() {
  router.push('/')
}

function getDifficultyText(diff: string) {
  const map: Record<string, string> = { easy: '简单', medium: '中等', hard: '困难' }
  return map[diff] || diff
}

onMounted(() => {
  handleLoad()
})
</script>

<template>
  <div class="seasonal-recipe-page">
    <div class="header">
      <div class="header-bg"></div>
      <div class="header-content">
        <div class="back-btn" @click="goToHome">
          <van-icon name="arrow-left" size="20" color="#fff" />
        </div>
        <div class="title-section">
          <h1 class="page-title">节气食谱</h1>
          <p class="page-subtitle">应季而食，顺时而养</p>
        </div>
      </div>
    </div>

    <div class="content" v-if="store.data">
      <div v-if="store.currentSolarTerm" class="current-term-card">
        <div class="term-gradient" :style="{ background: store.currentSolarTerm.gradient }"></div>
        <div class="term-content">
          <div class="term-header">
            <div class="term-icon">{{ store.currentSolarTerm.icon }}</div>
            <div class="term-info">
              <div class="term-name-row">
                <span class="term-name">{{ store.currentSolarTerm.name }}</span>
                <span class="term-badge">当前节气</span>
              </div>
              <div class="term-date">{{ store.currentSolarTerm.date }} · {{ store.currentSolarTerm.englishName }}</div>
            </div>
          </div>
          <p class="term-desc">{{ store.currentSolarTerm.description }}</p>
          <div class="health-tip">
            <van-icon name="info-o" size="12" />
            <span>{{ store.currentSolarTerm.healthTip }}</span>
          </div>
        </div>
      </div>

      <div class="section">
        <div class="section-title">
          <h2>按季节浏览</h2>
        </div>
        <div class="season-tabs">
          <div
            v-for="season in seasons"
            :key="season.key"
            class="season-tab"
            :class="{ active: activeSeason === season.key }"
            :style="{ borderColor: activeSeason === season.key ? season.color : 'transparent' }"
            @click="activeSeason = season.key"
          >
            <span class="season-icon">{{ season.icon }}</span>
            <span class="season-name">{{ season.name }}</span>
          </div>
        </div>
      </div>

      <div class="section">
        <div class="section-title">
          <h2>二十四节气</h2>
        </div>
        <div class="term-grid">
          <div
            v-for="term in filteredTerms"
            :key="term.name"
            class="term-item"
            :class="{ active: store.selectedSolarTerm === term.name, current: store.currentSolarTerm?.name === term.name }"
            @click="handleSelectTerm(term)"
          >
            <span class="term-item-icon">{{ term.icon }}</span>
            <span class="term-item-name">{{ term.name }}</span>
            <span class="term-item-date">{{ term.date }}</span>
          </div>
        </div>
      </div>

      <div class="section" v-if="currentTermRecipes.length > 0">
        <div class="section-title">
          <h2>{{ store.selectedSolarTerm }}推荐</h2>
          <span class="section-count">{{ currentTermRecipes.length }}道菜谱</span>
        </div>
        <div class="recipe-list">
          <div
            v-for="recipe in currentTermRecipes"
            :key="recipe.id"
            class="recipe-card"
            @click="goToRecipeDetail(recipe.id)"
          >
            <div class="recipe-image-wrapper">
              <img :src="recipe.coverImage" :alt="recipe.name" class="recipe-image" />
              <div class="recipe-tags">
                <span v-for="tag in recipe.tags.slice(0, 2)" :key="tag" class="recipe-tag">{{ tag }}</span>
              </div>
              <div class="recipe-difficulty" :class="recipe.difficulty">
                {{ getDifficultyText(recipe.difficulty) }}
              </div>
            </div>
            <div class="recipe-content">
              <h3 class="recipe-name">{{ recipe.name }}</h3>
              <p class="recipe-subtitle">{{ recipe.subtitle }}</p>
              <div class="recipe-meta">
                <div class="meta-item">
                  <van-icon name="clock-o" size="12" />
                  <span>{{ recipe.cookTime }}</span>
                </div>
                <div class="meta-item">
                  <van-icon name="friends-o" size="12" />
                  <span>{{ recipe.servings }}人份</span>
                </div>
                <div class="meta-item">
                  <van-icon name="fire-o" size="12" />
                  <span>{{ recipe.calories }}卡</span>
                </div>
              </div>
              <div class="recipe-rating">
                <van-rate v-model="recipe.rating" readonly size="12" color="#FFB800" void-color="#eee" />
                <span class="rating-text">{{ recipe.rating.toFixed(1) }}</span>
                <span class="view-count">{{ recipe.viewCount }}人看过</span>
              </div>
              <div class="recipe-health">
                <span v-for="benefit in recipe.healthBenefits.slice(0, 2)" :key="benefit" class="health-tag">
                  {{ benefit }}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="section" v-if="filteredRecipes.length > 0 && currentTermRecipes.length === 0">
        <div class="section-title">
          <h2>{{ seasons.find(s => s.key === activeSeason)?.name }}季食谱</h2>
          <span class="section-count">{{ filteredRecipes.length }}道菜谱</span>
        </div>
        <div class="recipe-list">
          <div
            v-for="recipe in filteredRecipes"
            :key="recipe.id"
            class="recipe-card"
            @click="goToRecipeDetail(recipe.id)"
          >
            <div class="recipe-image-wrapper">
              <img :src="recipe.coverImage" :alt="recipe.name" class="recipe-image" />
              <div class="recipe-tags">
                <span v-for="tag in recipe.tags.slice(0, 2)" :key="tag" class="recipe-tag">{{ tag }}</span>
              </div>
              <div class="recipe-term-tag">{{ recipe.solarTerm }}</div>
            </div>
            <div class="recipe-content">
              <h3 class="recipe-name">{{ recipe.name }}</h3>
              <p class="recipe-subtitle">{{ recipe.subtitle }}</p>
              <div class="recipe-meta">
                <div class="meta-item">
                  <van-icon name="clock-o" size="12" />
                  <span>{{ recipe.cookTime }}</span>
                </div>
                <div class="meta-item">
                  <van-icon name="friends-o" size="12" />
                  <span>{{ recipe.servings }}人份</span>
                </div>
                <div class="meta-item">
                  <van-icon name="fire-o" size="12" />
                  <span>{{ recipe.calories }}卡</span>
                </div>
              </div>
              <div class="recipe-rating">
                <van-rate v-model="recipe.rating" readonly size="12" color="#FFB800" void-color="#eee" />
                <span class="rating-text">{{ recipe.rating.toFixed(1) }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div v-if="filteredRecipes.length === 0 && currentTermRecipes.length === 0" class="empty-state">
        <van-icon name="leaf-o" size="48" color="#ccc" />
        <p>该节气暂无推荐食谱</p>
        <p class="empty-tip">试试其他节气吧</p>
      </div>
    </div>

    <van-loading v-if="loading" class="loading" type="spinner" size="24px" color="#2DB87B" />
  </div>
</template>

<style scoped lang="scss">
@use '@/assets/styles/variables' as *;

.seasonal-recipe-page {
  min-height: 100vh;
  background: $bg;
  padding-bottom: 32px;
}

.header {
  position: relative;
  height: 180px;
  overflow: hidden;
}

.header-bg {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(135deg, #2DB87B 0%, #66BB6A 50%, #81C784 100%);
}

.header-content {
  position: relative;
  z-index: 1;
  padding: 16px;
  padding-top: calc(env(safe-area-inset-top, 0px) + 16px);
  height: 100%;
  display: flex;
  flex-direction: column;
}

.back-btn {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.2);
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 12px;
}

.title-section {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.page-title {
  font-size: 28px;
  font-weight: 700;
  color: #fff;
  margin: 0 0 4px 0;
  font-family: $font-display;
}

.page-subtitle {
  font-size: 14px;
  color: rgba(255, 255, 255, 0.9);
  margin: 0;
}

.content {
  padding: 0 16px;
  margin-top: -20px;
  position: relative;
  z-index: 2;
}

.current-term-card {
  position: relative;
  border-radius: $radius-lg;
  overflow: hidden;
  box-shadow: $shadow-lg;
  margin-bottom: 20px;
}

.term-gradient {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 80px;
}

.term-content {
  position: relative;
  z-index: 1;
  padding: 20px;
  background: $bg-card;
  border-radius: $radius-lg;
}

.term-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 12px;
}

.term-icon {
  font-size: 40px;
}

.term-name-row {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 2px;
}

.term-name {
  font-size: 22px;
  font-weight: 700;
  color: $text-primary;
  font-family: $font-display;
}

.term-badge {
  font-size: 10px;
  padding: 2px 8px;
  background: linear-gradient(135deg, $primary, $primary-dark);
  color: #fff;
  border-radius: 10px;
  font-weight: 500;
}

.term-date {
  font-size: 12px;
  color: $text-secondary;
}

.term-desc {
  font-size: 13px;
  color: $text-secondary;
  margin: 0 0 10px 0;
  line-height: 1.6;
}

.health-tip {
  display: flex;
  align-items: flex-start;
  gap: 6px;
  padding: 10px 12px;
  background: $primary-light;
  border-radius: $radius-md;
  font-size: 12px;
  color: $primary-dark;
  line-height: 1.5;

  .van-icon {
    flex-shrink: 0;
    margin-top: 1px;
  }
}

.section {
  margin-bottom: 24px;
}

.section-title {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  margin-bottom: 12px;

  h2 {
    font-size: 18px;
    font-weight: 700;
    color: $text-primary;
    margin: 0;
    font-family: $font-display;
  }

  .section-count {
    font-size: 12px;
    color: $text-secondary;
  }
}

.season-tabs {
  display: flex;
  gap: 10px;
  background: $bg-card;
  padding: 6px;
  border-radius: $radius-lg;
  box-shadow: $shadow;
}

.season-tab {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  padding: 10px 0;
  border-radius: $radius-md;
  border: 2px solid transparent;
  transition: all 0.3s ease;
  cursor: pointer;

  &.active {
    background: $primary-light;
  }

  &:active {
    transform: scale(0.96);
  }
}

.season-icon {
  font-size: 20px;
}

.season-name {
  font-size: 13px;
  font-weight: 600;
  color: $text-primary;
}

.term-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 10px;
}

.term-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  padding: 14px 8px;
  background: $bg-card;
  border-radius: $radius-md;
  border: 2px solid transparent;
  box-shadow: $shadow;
  cursor: pointer;
  transition: all 0.3s ease;

  &.active {
    border-color: $primary;
    background: $primary-light;
  }

  &.current {
    position: relative;

    &::after {
      content: '';
      position: absolute;
      top: 4px;
      right: 4px;
      width: 6px;
      height: 6px;
      background: $accent;
      border-radius: 50%;
    }
  }

  &:active {
    transform: scale(0.96);
  }
}

.term-item-icon {
  font-size: 24px;
}

.term-item-name {
  font-size: 14px;
  font-weight: 600;
  color: $text-primary;
}

.term-item-date {
  font-size: 10px;
  color: $text-secondary;
}

.recipe-list {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.recipe-card {
  display: flex;
  background: $bg-card;
  border-radius: $radius-md;
  overflow: hidden;
  box-shadow: $shadow;
  cursor: pointer;
  transition: all 0.3s ease;

  &:active {
    transform: scale(0.98);
  }
}

.recipe-image-wrapper {
  position: relative;
  width: 140px;
  flex-shrink: 0;
}

.recipe-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

.recipe-tags {
  position: absolute;
  top: 8px;
  left: 8px;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.recipe-tag {
  font-size: 10px;
  padding: 2px 6px;
  background: rgba(45, 184, 123, 0.9);
  color: #fff;
  border-radius: 4px;
  font-weight: 500;
}

.recipe-difficulty {
  position: absolute;
  bottom: 8px;
  left: 8px;
  font-size: 10px;
  padding: 2px 6px;
  border-radius: 4px;
  font-weight: 500;

  &.easy {
    background: rgba(102, 187, 106, 0.9);
    color: #fff;
  }

  &.medium {
    background: rgba(255, 167, 38, 0.9);
    color: #fff;
  }

  &.hard {
    background: rgba(238, 75, 75, 0.9);
    color: #fff;
  }
}

.recipe-term-tag {
  position: absolute;
  bottom: 8px;
  left: 8px;
  font-size: 10px;
  padding: 2px 6px;
  background: rgba(255, 255, 255, 0.95);
  color: $primary-dark;
  border-radius: 4px;
  font-weight: 600;
}

.recipe-content {
  flex: 1;
  padding: 12px;
  display: flex;
  flex-direction: column;
  gap: 6px;
  min-width: 0;
}

.recipe-name {
  font-size: 16px;
  font-weight: 700;
  color: $text-primary;
  margin: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.recipe-subtitle {
  font-size: 12px;
  color: $text-secondary;
  margin: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.recipe-meta {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}

.meta-item {
  display: flex;
  align-items: center;
  gap: 3px;
  font-size: 11px;
  color: $text-secondary;

  .van-icon {
    color: $primary;
  }
}

.recipe-rating {
  display: flex;
  align-items: center;
  gap: 6px;
}

.rating-text {
  font-size: 12px;
  font-weight: 600;
  color: $accent;
}

.view-count {
  font-size: 11px;
  color: $text-secondary;
  margin-left: auto;
}

.recipe-health {
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
  margin-top: 2px;
}

.health-tag {
  font-size: 10px;
  padding: 2px 6px;
  background: $accent-light;
  color: $accent;
  border-radius: 4px;
  font-weight: 500;
}

.empty-state {
  text-align: center;
  padding: 40px 20px;

  p {
    margin: 8px 0 0 0;
    color: $text-secondary;
    font-size: 14px;
  }

  .empty-tip {
    font-size: 12px;
    color: $text-disabled;
  }
}

.loading {
  display: flex;
  justify-content: center;
  padding: 60px 0;
}
</style>
