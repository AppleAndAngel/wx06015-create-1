import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import {
  getDenominations as getDenominationsApi,
  getTemplates as getTemplatesApi,
  getRandomMessage as getRandomMessageApi,
  createOrder as createOrderApi,
  payOrder as payOrderApi,
  getOrder as getOrderApi,
  getMyOrders as getMyOrdersApi,
  sendGiftCard as sendGiftCardApi,
  claimGiftCard as claimGiftCardApi,
} from '@/api/giftCard'
import type {
  GiftCardDenomination,
  GiftCardTemplate,
  GiftCardOrder,
  CreateGiftCardOrderParams,
  GiftCardPaymentResult,
} from '@/types'

export const useGiftCardStore = defineStore(
  'giftCard',
  () => {
    const denominations = ref<GiftCardDenomination[]>([])
    const templates = ref<GiftCardTemplate[]>([])
    const mySentCards = ref<GiftCardOrder[]>([])
    const myReceivedCards = ref<GiftCardOrder[]>([])
    const currentOrder = ref<GiftCardOrder | null>(null)
    const selectedDenomination = ref<GiftCardDenomination | null>(null)
    const selectedTemplate = ref<GiftCardTemplate | null>(null)
    const loading = ref(false)

    const paidSentCards = computed(() =>
      mySentCards.value.filter((c) => c.status === 'paid' || c.status === 'sent')
    )

    const receivedCards = computed(() =>
      myReceivedCards.value.filter((c) => c.status === 'received')
    )

    async function fetchDenominations() {
      try {
        loading.value = true
        const { data } = await getDenominationsApi()
        denominations.value = data
        if (!selectedDenomination.value && data.length > 0) {
          selectedDenomination.value = data[0]
        }
        console.log('[GiftCard] 获取面额列表成功，数量:', data.length)
      } catch (e) {
        console.error('[GiftCard] 获取面额列表失败', e)
        throw e
      } finally {
        loading.value = false
      }
    }

    async function fetchTemplates() {
      try {
        const { data } = await getTemplatesApi()
        templates.value = data
        if (!selectedTemplate.value && data.length > 0) {
          selectedTemplate.value = data[0]
        }
        console.log('[GiftCard] 获取模板列表成功，数量:', data.length)
      } catch (e) {
        console.error('[GiftCard] 获取模板列表失败', e)
        throw e
      }
    }

    async function getRandomMessage() {
      try {
        const { data } = await getRandomMessageApi()
        return data
      } catch (e) {
        console.error('[GiftCard] 获取随机祝福语失败', e)
        return ''
      }
    }

    async function createOrder(
      params: CreateGiftCardOrderParams
    ): Promise<{ orderId: number; orderNo: string; payAmount: number }> {
      try {
        const { data } = await createOrderApi(params)
        return data
      } catch (e) {
        console.error('[GiftCard] 创建订单失败', e)
        throw e
      }
    }

    async function payOrder(
      orderId: number,
      payMethod: 'wechat' | 'alipay' | 'balance'
    ): Promise<GiftCardPaymentResult> {
      try {
        const { data } = await payOrderApi(orderId, payMethod)
        if (data.status === 'success') {
          await fetchMySentCards()
        }
        return data
      } catch (e) {
        console.error('[GiftCard] 支付失败', e)
        throw e
      }
    }

    async function fetchOrder(orderId: number) {
      try {
        const { data } = await getOrderApi(orderId)
        currentOrder.value = data || null
        return data
      } catch (e) {
        console.error('[GiftCard] 获取订单详情失败', e)
        throw e
      }
    }

    async function fetchMySentCards() {
      try {
        const { data } = await getMyOrdersApi('sent')
        mySentCards.value = data
        console.log('[GiftCard] 获取我送出的礼品卡成功，数量:', data.length)
      } catch (e) {
        console.error('[GiftCard] 获取我送出的礼品卡失败', e)
        throw e
      }
    }

    async function fetchMyReceivedCards() {
      try {
        const { data } = await getMyOrdersApi('received')
        myReceivedCards.value = data
        console.log('[GiftCard] 获取我收到的礼品卡成功，数量:', data.length)
      } catch (e) {
        console.error('[GiftCard] 获取我收到的礼品卡失败', e)
        throw e
      }
    }

    async function sendGiftCard(orderId: number) {
      try {
        await sendGiftCardApi(orderId)
        const order = mySentCards.value.find((o) => o.id === orderId)
        if (order) {
          order.status = 'sent'
        }
        if (currentOrder.value?.id === orderId) {
          currentOrder.value.status = 'sent'
        }
        console.log('[GiftCard] 礼品卡发送成功，订单ID:', orderId)
      } catch (e) {
        console.error('[GiftCard] 礼品卡发送失败', e)
        throw e
      }
    }

    async function claimGiftCard(cardCode: string, phone: string): Promise<GiftCardOrder> {
      try {
        const { data } = await claimGiftCardApi(cardCode, phone)
        myReceivedCards.value.unshift(data)
        console.log('[GiftCard] 礼品卡领取成功，卡号:', cardCode)
        return data
      } catch (e) {
        console.error('[GiftCard] 礼品卡领取失败', e)
        throw e
      }
    }

    function setSelectedDenomination(denomination: GiftCardDenomination) {
      selectedDenomination.value = denomination
    }

    function setSelectedTemplate(template: GiftCardTemplate) {
      selectedTemplate.value = template
    }

    function getDenominationById(id: number): GiftCardDenomination | undefined {
      return denominations.value.find((d) => d.id === id)
    }

    function getTemplateById(id: number): GiftCardTemplate | undefined {
      return templates.value.find((t) => t.id === id)
    }

    return {
      denominations,
      templates,
      mySentCards,
      myReceivedCards,
      currentOrder,
      selectedDenomination,
      selectedTemplate,
      loading,
      paidSentCards,
      receivedCards,
      fetchDenominations,
      fetchTemplates,
      getRandomMessage,
      createOrder,
      payOrder,
      fetchOrder,
      fetchMySentCards,
      fetchMyReceivedCards,
      sendGiftCard,
      claimGiftCard,
      setSelectedDenomination,
      setSelectedTemplate,
      getDenominationById,
      getTemplateById,
    }
  },
  {
    persist: {
      pick: ['mySentCards', 'myReceivedCards', 'selectedDenomination', 'selectedTemplate'],
    },
  }
)
