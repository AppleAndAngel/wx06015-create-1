import {
  getStockpileList,
  getStockpileByCategory,
  addToStockpile,
  removeFromStockpile,
  updateStockpileQuantity,
  updateStockpileNote,
  addStockpileToCart,
  checkIsInStockpile,
  getStockpileCategories,
} from '@/mock/stockpile'

export function fetchStockpileList() {
  return getStockpileList()
}

export function fetchStockpileByCategory(category: string) {
  return getStockpileByCategory(category)
}

export function addItemToStockpile(
  productId: number,
  specValues: Record<string, string>,
  quantity: number,
  category: string,
  note?: string
) {
  return addToStockpile(productId, specValues, quantity, category, note)
}

export function removeStockpileItem(id: number) {
  return removeFromStockpile(id)
}

export function updateStockpileItemQuantity(id: number, quantity: number) {
  return updateStockpileQuantity(id, quantity)
}

export function updateStockpileItemNote(id: number, note: string) {
  return updateStockpileNote(id, note)
}

export function addStockpileItemsToCart(itemIds: number[]) {
  return addStockpileToCart(itemIds)
}

export function checkProductInStockpile(productId: number, specValues: Record<string, string>) {
  return checkIsInStockpile(productId, specValues)
}

export function fetchStockpileCategories() {
  return getStockpileCategories()
}
