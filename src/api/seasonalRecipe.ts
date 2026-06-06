import request from './request'
import type { Recipe, SolarTerm, SeasonalRecipeData } from '@/types'
import { getSeasonalRecipeData, getRecipesBySolarTerm, getRecipeById } from '@/mock/seasonalRecipes'

export function fetchSeasonalRecipeData(): Promise<SeasonalRecipeData> {
  return getSeasonalRecipeData()
}

export function fetchRecipesBySolarTerm(solarTermName: string): Promise<Recipe[]> {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(getRecipesBySolarTerm(solarTermName))
    }, 200)
  })
}

export function fetchRecipeDetail(id: number): Promise<Recipe | undefined> {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(getRecipeById(id))
    }, 200)
  })
}

export function addRecipeIngredientsToCart(recipe: Recipe): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(() => {
      console.log('[SeasonalRecipe] 将食谱食材加入购物车:', recipe.name)
      resolve()
    }, 300)
  })
}
