import { showSuccessToast } from 'vant'
import { useCartStore } from '@/stores/cart'
import type { Product } from '@/types'

export function useCart() {
  const cartStore = useCartStore()

  async function addToCart(
    product: Product,
    specValues: Record<string, string>,
    quantity: number,
  ) {
    await cartStore.addItem(product, specValues, quantity)
    showSuccessToast('已加入购物车')
  }

  return {
    addToCart,
  }
}
