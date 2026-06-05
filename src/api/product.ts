import type { Product, Category } from '@/types'
import { products, getProductById as mockGetProductById, getProductsByCategory, searchProducts as mockSearchProducts } from '@/mock/products'
import { getMockCategories } from '@/mock/categories'

function delay(ms: number = 300): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

export function getProducts(params: {
  page?: number
  size?: number
  categoryId?: number
  sort?: string
}): Promise<any> {
  return delay().then(() => {
    let result = params.categoryId ? getProductsByCategory(params.categoryId) : [...products]
    if (params.sort === 'price_asc') {
      result.sort((a, b) => a.price - b.price)
    } else if (params.sort === 'price_desc') {
      result.sort((a, b) => b.price - a.price)
    } else if (params.sort === 'sales') {
      result.sort((a, b) => b.sales - a.sales)
    }
    const page = params.page || 1
    const size = params.size || 10
    const start = (page - 1) * size
    const items = result.slice(start, start + size)
    return { items, total: result.length, page, size }
  })
}

export function getProductById(id: number): Promise<Product | undefined> {
  return delay().then(() => mockGetProductById(id))
}

export function getCategories(): Promise<Category[]> {
  return delay().then(() => getMockCategories())
}

export function searchProducts(keyword: string): Promise<Product[]> {
  return delay().then(() => mockSearchProducts(keyword))
}
