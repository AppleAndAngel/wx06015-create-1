import type { CartItem, Product } from '@/types'
import { getItem, setItem } from '@/utils/storage'
import { getProductById } from '@/api/product'

const CART_KEY = 'cart-api'

function delay(ms: number = 300): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

function getCartItems(): CartItem[] {
  const items = getItem<CartItem[]>(CART_KEY)
  return Array.isArray(items) ? items : []
}

export function getCart(): Promise<CartItem[]> {
  return delay().then(() => getCartItems())
}

export function addToCart(item: CartItem): Promise<void> {
  return delay().then(() => {
    const items = getCartItems()
    const existing = items.find(
      (i) => i.productId === item.productId && JSON.stringify(i.specValues) === JSON.stringify(item.specValues)
    )
    if (existing) {
      existing.quantity += item.quantity
    } else {
      items.push(item)
    }
    setItem(CART_KEY, items)
  })
}

export function updateCartItem(item: CartItem): Promise<void> {
  return delay().then(() => {
    const items = getCartItems()
    const index = items.findIndex((i) => i.id === item.id)
    if (index !== -1) {
      items[index] = item
      setItem(CART_KEY, items)
    }
  })
}

export function removeCartItem(id: number): Promise<void> {
  return delay().then(() => {
    const items = getCartItems().filter((i) => i.id !== id)
    setItem(CART_KEY, items)
  })
}

export function fetchCart(): Promise<{ data: CartItem[] }> {
  return delay().then(() => ({ data: getCartItems() }))
}

export async function addCartItem(productId: number, specValues: Record<string, string>, quantity: number): Promise<{ data: CartItem }> {
  await delay()
  const items = getCartItems()
  const existing = items.find(
    (i) => i.productId === productId && JSON.stringify(i.specValues) === JSON.stringify(specValues)
  )
  if (existing) {
    existing.quantity += quantity
    setItem(CART_KEY, items)
    return { data: existing }
  }
  const product = await getProductById(productId)
  const newItem: CartItem = {
    id: Date.now(),
    productId,
    product: product as Product,
    specValues,
    quantity,
    selected: true,
  }
  items.push(newItem)
  setItem(CART_KEY, items)
  return { data: newItem }
}

export function updateCartItemQuantity(id: number, quantity: number): Promise<{ data: CartItem }> {
  return delay().then(() => {
    const items = getCartItems()
    const item = items.find((i) => i.id === id)
    if (item) {
      item.quantity = quantity
      setItem(CART_KEY, items)
    }
    return { data: item || ({} as CartItem) }
  })
}
