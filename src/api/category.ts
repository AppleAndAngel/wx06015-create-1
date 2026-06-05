import type { Category } from '@/types'
import { getMockCategories } from '@/mock/categories'

function delay(ms: number = 300): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

export function fetchCategories(): Promise<{ data: Category[] }> {
  return delay().then(() => ({ data: getMockCategories() }))
}
