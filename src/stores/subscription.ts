import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import {
  getSubscriptionCategories,
  getSubscriptionProducts,
  getSubscriptionProductById,
  getMySubscriptions,
  getSubscriptionById,
  createSubscription as createSubscriptionApi,
  updateSubscription as updateSubscriptionApi,
  pauseSubscription as pauseSubscriptionApi,
  resumeSubscription as resumeSubscriptionApi,
  cancelSubscription as cancelSubscriptionApi,
  skipNextDelivery as skipNextDeliveryApi,
} from '@/api/subscription'
import type {
  SubscriptionCategory,
  SubscriptionProduct,
  Subscription,
  SubscriptionStatus,
  CreateSubscriptionParams,
  UpdateSubscriptionParams,
} from '@/types'

export const useSubscriptionStore = defineStore(
  'subscription',
  () => {
    const categories = ref<SubscriptionCategory[]>([])
    const products = ref<SubscriptionProduct[]>([])
    const mySubscriptions = ref<Subscription[]>([])
    const currentProduct = ref<SubscriptionProduct | null>(null)
    const currentSubscription = ref<Subscription | null>(null)
    const selectedCategory = ref<string>('all')
    const loading = ref(false)

    const activeSubscriptions = computed(() =>
      mySubscriptions.value.filter((s) => s.status === 'active')
    )

    const pausedSubscriptions = computed(() =>
      mySubscriptions.value.filter((s) => s.status === 'paused')
    )

    const cancelledSubscriptions = computed(() =>
      mySubscriptions.value.filter((s) => s.status === 'cancelled')
    )

    const nextDeliveryCount = computed(() =>
      activeSubscriptions.value.filter((s) => {
        const nextDate = new Date(s.nextDeliveryDate)
        const today = new Date()
        const diffTime = nextDate.getTime() - today.getTime()
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
        return diffDays <= 3
      }).length
    )

    const totalSaved = computed(() =>
      mySubscriptions.value.reduce((sum, s) => sum + s.totalSaved, 0)
    )

    async function fetchCategories() {
      try {
        const { data } = await getSubscriptionCategories()
        categories.value = data
        console.log('[Subscription] 获取分类成功', data.length)
      } catch (e) {
        console.error('[Subscription] 获取分类失败', e)
        throw e
      }
    }

    async function fetchProducts(categoryId?: string) {
      try {
        loading.value = true
        if (categoryId) {
          selectedCategory.value = categoryId
        }
        const { data } = await getSubscriptionProducts(selectedCategory.value)
        products.value = data
        console.log('[Subscription] 获取商品成功', data.length)
      } catch (e) {
        console.error('[Subscription] 获取商品失败', e)
        throw e
      } finally {
        loading.value = false
      }
    }

    async function fetchProduct(id: number) {
      try {
        const { data } = await getSubscriptionProductById(id)
        currentProduct.value = data || null
        return data
      } catch (e) {
        console.error('[Subscription] 获取商品详情失败', e)
        throw e
      }
    }

    async function fetchMySubscriptions(status?: SubscriptionStatus) {
      try {
        loading.value = true
        const { data } = await getMySubscriptions(status)
        mySubscriptions.value = data
        console.log('[Subscription] 获取我的订阅成功', data.length)
      } catch (e) {
        console.error('[Subscription] 获取我的订阅失败', e)
        throw e
      } finally {
        loading.value = false
      }
    }

    async function fetchSubscription(id: number) {
      try {
        const { data } = await getSubscriptionById(id)
        currentSubscription.value = data || null
        return data
      } catch (e) {
        console.error('[Subscription] 获取订阅详情失败', e)
        throw e
      }
    }

    async function createSubscription(params: CreateSubscriptionParams) {
      try {
        const { data } = await createSubscriptionApi(params)
        mySubscriptions.value.unshift(data)
        console.log('[Subscription] 创建订阅成功:', data.product.name)
        return data
      } catch (e) {
        console.error('[Subscription] 创建订阅失败', e)
        throw e
      }
    }

    async function updateSubscription(id: number, params: UpdateSubscriptionParams) {
      try {
        const { data } = await updateSubscriptionApi(id, params)
        const index = mySubscriptions.value.findIndex((s) => s.id === id)
        if (index !== -1) {
          mySubscriptions.value[index] = data
        }
        if (currentSubscription.value?.id === id) {
          currentSubscription.value = data
        }
        console.log('[Subscription] 更新订阅成功:', data.product.name)
        return data
      } catch (e) {
        console.error('[Subscription] 更新订阅失败', e)
        throw e
      }
    }

    async function pauseSubscription(
      id: number,
      reason?: string,
      until?: string
    ) {
      try {
        const { data } = await pauseSubscriptionApi(id, reason, until)
        const index = mySubscriptions.value.findIndex((s) => s.id === id)
        if (index !== -1) {
          mySubscriptions.value[index] = data
        }
        if (currentSubscription.value?.id === id) {
          currentSubscription.value = data
        }
        console.log('[Subscription] 暂停订阅成功:', data.product.name)
        return data
      } catch (e) {
        console.error('[Subscription] 暂停订阅失败', e)
        throw e
      }
    }

    async function resumeSubscription(id: number) {
      try {
        const { data } = await resumeSubscriptionApi(id)
        const index = mySubscriptions.value.findIndex((s) => s.id === id)
        if (index !== -1) {
          mySubscriptions.value[index] = data
        }
        if (currentSubscription.value?.id === id) {
          currentSubscription.value = data
        }
        console.log('[Subscription] 恢复订阅成功:', data.product.name)
        return data
      } catch (e) {
        console.error('[Subscription] 恢复订阅失败', e)
        throw e
      }
    }

    async function cancelSubscription(id: number) {
      try {
        await cancelSubscriptionApi(id)
        const index = mySubscriptions.value.findIndex((s) => s.id === id)
        if (index !== -1) {
          mySubscriptions.value[index].status = 'cancelled'
        }
        if (currentSubscription.value?.id === id) {
          currentSubscription.value.status = 'cancelled'
        }
        console.log('[Subscription] 取消订阅成功，ID:', id)
      } catch (e) {
        console.error('[Subscription] 取消订阅失败', e)
        throw e
      }
    }

    async function skipNextDelivery(id: number) {
      try {
        const { data } = await skipNextDeliveryApi(id)
        const index = mySubscriptions.value.findIndex((s) => s.id === id)
        if (index !== -1) {
          mySubscriptions.value[index].nextDeliveryDate = data.nextDeliveryDate
        }
        if (currentSubscription.value?.id === id) {
          currentSubscription.value.nextDeliveryDate = data.nextDeliveryDate
        }
        console.log('[Subscription] 跳过下次配送成功:', data.product.name)
        return data
      } catch (e) {
        console.error('[Subscription] 跳过下次配送失败', e)
        throw e
      }
    }

    function setSelectedCategory(categoryId: string) {
      selectedCategory.value = categoryId
    }

    function isSubscribed(subscriptionProductId: number): boolean {
      return mySubscriptions.value.some(
        (s) =>
          s.subscriptionProductId === subscriptionProductId &&
          s.status !== 'cancelled'
      )
    }

    function getSubscriptionByProductId(
      subscriptionProductId: number
    ): Subscription | undefined {
      return mySubscriptions.value.find(
        (s) =>
          s.subscriptionProductId === subscriptionProductId &&
          s.status !== 'cancelled'
      )
    }

    return {
      categories,
      products,
      mySubscriptions,
      currentProduct,
      currentSubscription,
      selectedCategory,
      loading,
      activeSubscriptions,
      pausedSubscriptions,
      cancelledSubscriptions,
      nextDeliveryCount,
      totalSaved,
      fetchCategories,
      fetchProducts,
      fetchProduct,
      fetchMySubscriptions,
      fetchSubscription,
      createSubscription,
      updateSubscription,
      pauseSubscription,
      resumeSubscription,
      cancelSubscription,
      skipNextDelivery,
      setSelectedCategory,
      isSubscribed,
      getSubscriptionByProductId,
    }
  },
  {
    persist: {
      pick: ['mySubscriptions'],
    },
  }
)
