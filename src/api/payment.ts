import type { PaymentResult } from '@/types'
import { getItem, setItem } from '@/utils/storage'

const PAYMENT_KEY = 'payments'

function delay(ms: number = 300): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

function getPaymentsFromStorage(): PaymentResult[] {
  return getItem<PaymentResult[]>(PAYMENT_KEY) || []
}

export function createPayment(orderId: number, payMethod: string): Promise<PaymentResult> {
  return delay(2000).then(() => {
    const result: PaymentResult = {
      orderId,
      status: 'success',
      payMethod: payMethod as PaymentResult['payMethod'],
      payTime: new Date().toISOString(),
    }
    const payments = getPaymentsFromStorage()
    payments.push(result)
    setItem(PAYMENT_KEY, payments)
    return result
  })
}

export function getPaymentStatus(orderId: number): Promise<PaymentResult> {
  return delay().then(() => {
    const payments = getPaymentsFromStorage()
    const payment = payments.find((p) => p.orderId === orderId)
    return (
      payment || {
        orderId,
        status: 'pending' as const,
        payMethod: 'wechat' as const,
      }
    )
  })
}
