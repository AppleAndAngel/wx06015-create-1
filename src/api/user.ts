import type { User } from '@/types'
import { defaultUser } from '@/mock/users'
import { getItem, setItem } from '@/utils/storage'

function delay(ms: number = 300): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

export function login(phone: string, code: string): Promise<{ data: { token: string; user: User } }> {
  return delay().then(() => {
    const user = { ...defaultUser, phone }
    setItem('user', user)
    setItem('token', user.token)
    return { data: { token: user.token, user } }
  })
}

export function getUserInfo(): Promise<{ data: User }> {
  return delay().then(() => {
    const user = getItem<User>('user') || defaultUser
    return { data: user }
  })
}
