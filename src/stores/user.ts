import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import { login as loginApi, getUserInfo as getUserInfoApi } from '@/api/user'
import type { User } from '@/types'

export const useUserStore = defineStore('user', () => {
  const token = ref('')
  const userInfo = ref<User | null>(null)

  const isLoggedIn = computed(() => !!token.value)

  async function login(phone: string, code: string) {
    const { data } = await loginApi(phone, code)
    token.value = data.token
    userInfo.value = data.user
  }

  function logout() {
    token.value = ''
    userInfo.value = null
  }

  async function getUserInfo() {
    const { data } = await getUserInfoApi()
    userInfo.value = data
  }

  return {
    token,
    userInfo,
    isLoggedIn,
    login,
    logout,
    getUserInfo,
  }
}, {
  persist: {
    pick: ['token', 'userInfo'],
  },
})
