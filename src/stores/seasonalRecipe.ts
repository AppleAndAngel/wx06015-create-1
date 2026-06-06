import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import {
  fetchSeasonalRecipeData,
  fetchRecipesBySolarTerm,
  fetchRecipeDetail,
  addRecipeIngredientsToCart,
} from '@/api/seasonalRecipe'
import { useCartStore } from './cart'
import type { Recipe, SolarTerm, SeasonalRecipeData, Product } from '@/types'
import { showToast, showLoadingToast, closeToast } from 'vant'

export const useSeasonalRecipeStore = defineStore('seasonalRecipe', () => {
  const data = ref<SeasonalRecipeData | null>(null)
  const currentTermRecipes = ref<Recipe[]>([])
  const selectedRecipe = ref<Recipe | null>(null)
  const selectedSolarTerm = ref<string>('')

  const currentSolarTerm = computed(() => data.value?.currentSolarTerm || null)
  const solarTerms = computed(() => data.value?.solarTerms || [])
  const allRecipes = computed(() => data.value?.recipes || [])

  async function loadData() {
    try {
      const result = await fetchSeasonalRecipeData()
      data.value = result
      selectedSolarTerm.value = result.currentSolarTerm.name
      currentTermRecipes.value = result.recipes.filter(
        (r) => r.solarTerm === result.currentSolarTerm.name,
      )
      console.log('[SeasonalRecipe] 加载数据成功，当前节气:', result.currentSolarTerm.name)
    } catch (e) {
      console.error('[SeasonalRecipe] 加载数据失败', e)
      throw e
    }
  }

  async function selectSolarTerm(termName: string) {
    selectedSolarTerm.value = termName
    try {
      currentTermRecipes.value = await fetchRecipesBySolarTerm(termName)
      console.log('[SeasonalRecipe] 切换节气:', termName, '找到食谱数:', currentTermRecipes.value.length)
    } catch (e) {
      console.error('[SeasonalRecipe] 获取节气食谱失败', e)
      currentTermRecipes.value = []
    }
  }

  async function loadRecipeDetail(id: number) {
    try {
      const recipe = await fetchRecipeDetail(id)
      selectedRecipe.value = recipe || null
      return selectedRecipe.value
    } catch (e) {
      console.error('[SeasonalRecipe] 获取食谱详情失败', e)
      throw e
    }
  }

  async function addAllIngredientsToCart(recipe: Recipe) {
    const cartStore = useCartStore()
    showLoadingToast({ message: '正在加入购物车...', forbidClick: true, duration: 0 })

    try {
      await addRecipeIngredientsToCart(recipe)

      const ingredients = recipe.ingredients.filter((ing) => ing.product)
      let successCount = 0

      for (const ingredient of ingredients) {
        if (ingredient.product) {
          const specValues: Record<string, string> = {}
          ingredient.product.specs.forEach((spec) => {
            specValues[spec.name] = spec.values[0]
          })
          try {
            await cartStore.addItem(ingredient.product, specValues, 1)
            successCount++
          } catch (e) {
            console.warn(`[SeasonalRecipe] 添加 ${ingredient.name} 失败`, e)
          }
        }
      }

      closeToast()

      if (successCount > 0) {
        showToast({
          message: `已将 ${successCount} 种食材加入购物车`,
          type: 'success',
        })
      } else {
        showToast({
          message: '未找到可添加的食材',
          type: 'fail',
        })
      }

      return successCount
    } catch (e) {
      closeToast()
      console.error('[SeasonalRecipe] 一键加入购物车失败', e)
      showToast({
        message: '加入购物车失败，请重试',
        type: 'fail',
      })
      throw e
    }
  }

  async function addSingleIngredientToCart(product: Product, quantity: number = 1) {
    const cartStore = useCartStore()
    showLoadingToast({ message: '加入中...', forbidClick: true, duration: 0 })

    try {
      const specValues: Record<string, string> = {}
      product.specs.forEach((spec) => {
        specValues[spec.name] = spec.values[0]
      })
      await cartStore.addItem(product, specValues, quantity)
      closeToast()
      showToast({ message: '已加入购物车', type: 'success' })
      return true
    } catch (e) {
      closeToast()
      console.error('[SeasonalRecipe] 单个食材加入购物车失败', e)
      showToast({ message: '加入失败，请重试', type: 'fail' })
      throw e
    }
  }

  function getSeasonRecipes(season: 'spring' | 'summer' | 'autumn' | 'winter') {
    return allRecipes.value.filter((r) => r.season === season)
  }

  function getTermBySeason(season: 'spring' | 'summer' | 'autumn' | 'winter') {
    return solarTerms.value.filter((t) => t.season === season)
  }

  return {
    data,
    currentTermRecipes,
    selectedRecipe,
    selectedSolarTerm,
    currentSolarTerm,
    solarTerms,
    allRecipes,
    loadData,
    selectSolarTerm,
    loadRecipeDetail,
    addAllIngredientsToCart,
    addSingleIngredientToCart,
    getSeasonRecipes,
    getTermBySeason,
  }
})
