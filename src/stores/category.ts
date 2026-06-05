import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import { fetchCategories as fetchCategoriesApi } from '@/api/category'
import type { Category } from '@/types'

export const useCategoryStore = defineStore('category', () => {
  const categories = ref<Category[]>([])
  const currentCategoryId = ref(0)

  const currentCategory = computed(() =>
    categories.value.find((c) => c.id === currentCategoryId.value) ?? null,
  )

  async function fetchCategories() {
    const { data } = await fetchCategoriesApi()
    categories.value = data
    if (data.length > 0 && currentCategoryId.value === 0) {
      currentCategoryId.value = data[0].id
    }
  }

  function setCurrentCategory(id: number) {
    currentCategoryId.value = id
  }

  return {
    categories,
    currentCategoryId,
    currentCategory,
    fetchCategories,
    setCurrentCategory,
  }
})
